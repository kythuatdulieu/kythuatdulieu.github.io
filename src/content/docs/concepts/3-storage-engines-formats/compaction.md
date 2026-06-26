---
title: "Compaction"
difficulty: "Advanced"
tags: ["compaction", "data-lakehouse", "optimization", "small-files-problem", "iceberg", "delta-lake"]
readingTime: "12 mins"
lastUpdated: 2026-06-26
seoTitle: "Compaction - Tối ưu hóa Data Lakehouse & Khắc phục OOM"
metaDescription: "Tìm hiểu sâu về Compaction: Cơ chế Copy-on-Write (CoW) vs Merge-on-Read (MoR), Z-Ordering vs Liquid Clustering và cách khắc phục OOM trong Apache Iceberg."
description: "Vấn đề Small Files là 'kẻ thù' số 1 của Data Lakehouse. Bài viết này mổ xẻ bản chất Compaction, sự đánh đổi giữa Write/Read Amplification, Liquid Clustering vs Z-Order, và cách xử lý sự cố OOMKilled trên Spark."
---

Trong các hệ thống phân tán xử lý dữ liệu lớn (Big Data), việc đẩy dữ liệu từ các luồng streaming (Kafka, Kinesis) hoặc micro-batching thường xuyên tạo ra hàng triệu tệp tin nhỏ. Vấn đề **Small Files Problem** không chỉ làm chậm truy vấn mà còn có thể đánh sập hệ thống Metadata (như HDFS NameNode). Để giải quyết, chúng ta sử dụng **Compaction**.

Tuy nhiên, Compaction không chỉ đơn giản là "gom file". Dưới góc độ System Design của một Data Engineer, Compaction là một cuộc chiến khốc liệt giữa **Write Amplification**, **Read Amplification**, **Compute Cost**, và **Memory (RAM)**.

---

## 1. Bản chất Vật lý của Small Files Problem

Khi dữ liệu được ghi liên tục, các framework xử lý phân tán như Apache Spark hay Flink sẽ sinh ra rất nhiều tệp tin nhỏ vì những nguyên nhân kỹ thuật cốt lõi sau:

- **Over-parallelism (Phân mảnh do song song hóa):** Nếu bạn có 200 *Shuffle Partitions* (`spark.sql.shuffle.partitions=200`) nhưng lượng dữ liệu ghi ra ở mỗi micro-batch chỉ khoảng 10MB, Spark sẽ sinh ra 200 tệp tin nhỏ bé xíu (mỗi tệp vài chục KB) trong một lần commit.
- **Over-partitioning (Phân mảnh theo cấu trúc thư mục):** Chia partition theo Hive-style (`year/month/day/hour/minute`) tạo ra độ chi tiết cao nhưng lại phân tán dữ liệu, dẫn đến số lượng file khổng lồ bên trong mỗi thư mục vật lý.

### Hậu quả hệ thống (Systemic Impact)
- **Cạn kiệt Memory Metadata:** HDFS lưu metadata của mỗi block trên RAM của NameNode. Hàng triệu file nhỏ sẽ khiến NameNode rơi vào trạng thái Garbage Collection (GC) liên tục hoặc OOM (Out-Of-Memory). Với S3/GCS, chi phí cho các lệnh API `LIST` và `GET` sẽ tăng đột biến (API Cost Explosion).
- **I/O Latency Overhead:** Thời gian để thiết lập kết nối HTTP, đọc Header/Footer, khởi tạo bộ giải mã Parquet/ORC (Deser) cho 10,000 file 1MB lớn hơn gấp hàng trăm lần so với đọc 10 file 1GB.
- **Vô hiệu hóa thuật toán nén:** Các thuật toán dạng block-based (Zstd, Snappy) yêu cầu dữ liệu đủ lớn để xây dựng Dictionary nén hiệu quả. Khi file quá nhỏ, kích thước Metadata của Parquet có thể lớn hơn cả Payload dữ liệu.

---

## 2. Cuộc chiến giữa Write vs Read Amplification

Trước khi hiểu các chiến lược Compaction, ta cần hiểu định dạng Table Format (Iceberg, Delta, Hudi) quản lý Update/Delete như thế nào.

```mermaid
graph TD
    subgraph Copy-On-Write("CoW")
        A1["File Gốc: 1GB"] -->|Update 1 Dòng| B1("Đọc toàn bộ lên RAM")
        B1 --> C1("Ghi file Mới: 1GB")
        C1 -.->|Write Amplification cực lớn| D1["Ưu: Tốc độ đọc rất nhanh"]
    end

    subgraph Merge-On-Read("MoR")
        A2["File Gốc: 1GB"] -->|Update 1 Dòng| B2("Ghi Delta Log: 1KB")
        B2 -.->|Write Amplification nhỏ| C2["Nhược: Phải MERGE khi truy vấn"]
        C2 -.->|Read Amplification lớn| D2["Yêu cầu Background Compaction"]
    end
```

- **Write Amplification (Copy-on-Write - CoW):** Cập nhật 1 dòng dữ liệu đòi hỏi phải đọc và ghi lại toàn bộ Parquet file (có thể lên tới 512MB). Delta Lake và Iceberg mặc định thiên về CoW. Nó tối ưu tuyệt đối cho Read, nhưng nếu ứng dụng Streaming ghi liên tục, I/O của Storage sẽ bị bóp nghẹt.
- **Read Amplification (Merge-on-Read - MoR):** Dữ liệu cập nhật/xóa được ghi vào một file Log/Delta riêng rẽ (thường là Avro hoặc Delete Vector). Truy vấn đọc (Read) phải tự "hòa trộn" file gốc và file log trên RAM. Viêc này tạo ra Read Amplification. **Apache Hudi** rất mạnh về MoR.

**=> Compaction sinh ra để cân bằng Trade-off này:** Nó chạy ngầm (Asynchronous Compaction) để gom các file Delta Logs (ở MoR) và các tệp dữ liệu nhỏ thành một tệp Parquet chuẩn lớn, xóa bỏ các tombstones (rác), giúp trả lại hiệu năng Read.

---

## 3. Các Chiến lược Compaction (Physical Execution)

Khi kích hoạt Compaction (ví dụ qua `rewriteDataFiles` trong Iceberg hoặc `OPTIMIZE` trong Delta), Engine (như Spark) có nhiều cách để sắp xếp lại dữ liệu trên bộ nhớ trước khi flush xuống đĩa.

### 3.1. Bin-packing (Đóng gói)
Chiến lược mặc định, đơn giản, rẻ và ít tốn tài nguyên nhất.
- **Cách hoạt động:** Mở các file nhỏ, nhét dữ liệu vào các file lớn (theo target size, ví dụ: 256MB) giống như xếp đồ vào balo (bin-packing).
- **Đánh đổi:** Tốc độ rất nhanh, hiếm khi gây tràn RAM (OOM). Tuy nhiên, dữ liệu bên trong file KHÔNG được sắp xếp, không tối ưu cho Data Skipping (Min/Max Filtering).

### 3.2. Sorting & Z-Ordering (Sắp xếp đa chiều)
- **Sorting:** Shuffle dữ liệu (cực kỳ tốn kém) để gom các record có cùng khóa (`event_time`, `user_id`) vào chung một file, giúp thu hẹp dải Min/Max trong Parquet Footer.
- **Z-Ordering:** Sử dụng "Space-filling curve" để map dữ liệu nhiều chiều (nhiều cột) thành một chiều. Vô cùng hữu ích khi có các truy vấn lọc đa dạng xen kẽ nhiều cột.

```mermaid
flowchart LR
    subgraph Data Skipping("Min/Max")
        F1("File 1: min=1, max=10") --> Q{"Truy vấn: id=25"}
        F2("File 2: min=20, max=30") --> Q
        F3("File 3: min=50, max=100") --> Q
        Q -->|Skip File 1 & 3| F2
    end
```

- **Đánh đổi của Z-Ordering:** Kiến trúc cứng nhắc. Khi có dữ liệu mới, để duy trì độ clustering hoàn hảo, bạn phải chạy lại (Rewrite) toàn bộ Table hoặc Partition, tạo ra Compute Cost khổng lồ.

### 3.3. Cuộc cách mạng Liquid Clustering (Databricks)
Nhận thấy điểm yếu chí mạng của Z-Ordering (Full Rewrite), Databricks đã giới thiệu **Liquid Clustering**.
- **Cách hoạt động:** Dữ liệu được nhóm thành các **Z-Cubes** (khối dữ liệu) dựa trên Metadata linh hoạt. Nó có khả năng tự động điều chỉnh layout theo thời gian thực (write-side optimization).
- **Ưu điểm:** *Incremental Maintenance*. Thay vì rewrite toàn bộ, Liquid Clustering chỉ chạy optimize trên các dữ liệu chưa được cluster (unoptimized data). Bạn cũng có thể dùng `ALTER TABLE` để đổi khóa clustering mà không cần viết lại toàn bộ lịch sử. Hiện nay Databricks khuyến cáo dùng Liquid Clustering thay cho Z-Ordering và Hive Partitioning thông thường.

---

## 4. Tình huống Sập hệ thống (Operational Risks) & Troubleshooting

Dưới đây là những "ác mộng" thực chiến mà Data Engineer thường gặp khi vận hành Compaction.

### Sự cố 1: JVM OOMKilled khi chạy Apache Iceberg `rewriteDataFiles`
**Tình huống:** Kích hoạt `SparkActions.get(spark).rewriteDataFiles(table)` với chiến lược `sort` hoặc `zorder` vào cuối tuần để dọn dẹp Data Lake. Đột nhiên Spark Job chết do Executor hoặc Driver bị Out-Of-Memory (OOM).

**Bản chất vật lý (Root Cause):**
1. **Shuffle Data Skew & Partition Size:** Chiến lược Sort yêu cầu Spark phải Shuffle dữ liệu qua mạng. Nếu một partition có kích thước quá lớn (ví dụ: vài trăm GB), khi nạp lên Memory của một Executor để thực hiện Sort, nó sẽ gây Spill-to-disk liên tục hoặc đánh sập Heap Space.
2. **Metadata Overhead:** Driver Spark phải đọc manifest của hàng triệu file nhỏ để lập kế hoạch (planning). Kế hoạch này quá lớn làm Driver nổ tung.

**Giải pháp (Mitigation):**
- **Sử dụng Bin-pack thay cho Sort:** Nếu không cần Data Skipping quá ngặt nghèo, hãy quay về `binpack`. Nó không yêu cầu Global Sort.
- **Chia để trị (Scope the Rewrite):** Tuyệt đối KHÔNG optimize toàn bộ bảng. Sử dụng `where` để giới hạn partition:
  ```java
  CALL catalog.system.rewrite_data_files(
    table => 'db.table',
    where => 'event_date >= CURRENT_DATE - INTERVAL 7 DAYS'
  )
  ```
- **Granular Control (Kiểm soát tiến trình):** Bật `partial-progress.enabled` (cho phép job commit ngắt quãng để giải phóng RAM) và `min-input-files` (tránh rewrite các file đã đạt kích thước chuẩn).
- **Tuning Spark:** Tăng `spark.executor.memoryOverhead` (hoặc `spark.kubernetes.memoryOverheadFactor` nếu chạy trên K8s) vì Java NIO và quá trình giải nén file thường dùng off-heap memory.

### Sự cố 2: JIT Compaction vs "Thảm họa lưu trữ" S3
**Tình huống:** Job Compaction chạy thành công, tệp nhỏ giảm, tốc độ truy vấn tăng, nhưng hóa đơn AWS S3 tháng sau tăng gấp đôi.

**Bản chất:** Các định dạng như Delta hay Iceberg tuân thủ tính bất biến (Immutable). Quá trình Compaction tạo ra file 1GB MỚI, nhưng các tệp tin nhỏ cũ KHÔNG BỊ XÓA ngay (chúng được chuyển thành trạng thái *tombstoned* để phục vụ Time Travel / Snapshot Isolation). 
**Giải pháp:** Compaction bắt buộc phải luôn luôn đi kèm với quá trình Garbage Collection:
- Delta Lake: Chạy lệnh `VACUUM`.
- Iceberg: Chạy procedure `expire_snapshots` kết hợp `remove_orphan_files`.

---

## Nguồn Tham Khảo (References)
*   [Apache Iceberg Documentation - Compaction & RewriteDataFiles](https://iceberg.apache.org/docs/latest/maintenance/#compact-data-files)
*   [Databricks: Liquid Clustering vs Z-Ordering under the hood](https://docs.databricks.com/en/delta/clustering.html)
*   [Apache Hudi Architecture - Compaction (CoW vs MoR)](https://hudi.apache.org/docs/compaction/)
*   [Designing Data-Intensive Applications (Chapter 3: SSTables and LSM-Trees)](https://dataintensive.net/)
*   [Troubleshooting Spark OOM in Compaction Jobs - Dremio Blog](https://www.dremio.com/resources/blogs/)
