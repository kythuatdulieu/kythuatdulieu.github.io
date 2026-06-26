---
title: "Troubleshooting: Vấn nạn Small Files & Tối ưu Compaction trong Apache Iceberg"
description: "Phân tích chuyên sâu về vấn đề file nhỏ (Small Files) trong Data Lake, cơ chế Compaction của Apache Iceberg, và các chiến lược tối ưu hóa như Binpack, Sort, và Z-Order dưới góc nhìn System Design."
---

Trong các hệ thống phân tán (Distributed Systems) và Data Lake, "Small Files Problem" (Vấn đề file nhỏ) là một trong những nguyên nhân hàng đầu gây sụp đổ hiệu suất (Performance Degradation) và bùng nổ chi phí (Cost Explosion). Khi dữ liệu được stream liên tục thông qua Kafka hoặc Flink và flush xuống S3/GCS ở tần suất cao (micro-batching), hệ thống lưu trữ nhanh chóng bị phân mảnh thành hàng triệu file nhỏ (vài chục KB). 

Bản chất của các Execution Engine như Apache Spark hay Trino được thiết kế để xử lý các block dữ liệu lớn (I/O throughput-optimized) thay vì hàng triệu lời gọi I/O rải rác (I/O latency-bound).

Bài viết này mổ xẻ cơ chế giải quyết vấn đề Small Files thông qua tính năng **Compaction** trong Apache Iceberg, đồng thời phân tích sâu các đánh đổi (trade-offs) về Compute, I/O, và Data Skipping.

---

## 1. Bản Chất Kỹ Thuật Của Vấn Nạn Small Files

Việc để mặc tình trạng file nhỏ tiếp diễn không chỉ làm chậm truy vấn, mà còn phá vỡ cấu trúc của hệ thống phân tán ở ba tầng kiến trúc:

1. **Storage API Overhead & Rate Limiting:**
   Các dịch vụ Object Storage (Amazon S3, Google Cloud Storage) tính phí trên mỗi API Request (như `PUT`, `GET`, `LIST`). Việc query 1 triệu file 10KB tốn số lượng API Calls gấp 10,000 lần so với query 100 file 100MB. Thêm vào đó, việc bắn quá nhiều request đồng thời (Concurrent Requests) có thể kích hoạt cơ chế throttling (Rate Limiting, lỗi HTTP 503 Slow Down) từ phía nhà cung cấp Cloud.

2. **Task Scheduling Overhead trong Distributed Compute:**
   Trong Apache Spark, mỗi file vật lý nhỏ sẽ tương ứng với tối thiểu 1 Partition và 1 Task. Nếu có 100,000 file nhỏ, Spark Driver phải lên lịch trình (schedule), tuần tự hóa (serialize) và đẩy 100,000 tasks xuống các Executor. Thời gian rập khuôn để khởi tạo JVM Task (Metadata overhead) có thể mất vài mili-giây, trong khi thời gian thực thi I/O trên 10KB dữ liệu chỉ mất vài micro-giây. Đây là một sự lãng phí Compute khủng khiếp.

3. **Vô hiệu hóa Compression & Encoding:**
   Các định dạng Columnar như Parquet sử dụng Run-Length Encoding (RLE) và Dictionary Encoding, kết hợp với các thuật toán nén như ZSTD hoặc Snappy. Những kỹ thuật này chỉ phát huy tối đa sức mạnh khi có đủ ngữ cảnh dữ liệu (Data Context) dài. File quá nhỏ làm từ điển nén (Dictionary) bị phân mảnh, khiến tỷ lệ nén (Compression Ratio) rớt thảm hại.

---

## 2. Kiến Trúc Metadata Của Iceberg: Khi Metadata Trở Thành Nút Thắt

Apache Iceberg quản lý Data Lake thông qua một cấu trúc cây Metadata nghiêm ngặt. Khi số lượng Data Files tăng đột biến, kích thước của các tập tin quản lý (Manifest Files) cũng phình to tỷ lệ thuận.

```mermaid
graph TD
    A["Snapshot N("Metadata.json")"] --> B("Manifest List("avro")")
    B --> C1("Manifest File 1("avro") - Chứa Min/Max 100K files nhỏ")
    B --> C2("Manifest File 2("avro")")
    
    C1 --> D1["Data File 1("15KB")"]
    C1 --> D2["Data File 2("12KB")"]
    C1 --> D3["... 99,998 Data Files khác"]
    
    C2 --> D4["Data File X("512MB") - Đã được Compaction"]
    
    style A fill:#2962FF,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#00B0FF,stroke:#333,stroke-width:2px,color:#fff
    style C1 fill:#FF3D00,stroke:#333,stroke-width:2px,color:#fff
    style D1 fill:#FF8A80,stroke:#333,color:#000
    style D2 fill:#FF8A80,stroke:#333,color:#000
    style D3 fill:#FF8A80,stroke:#333,color:#000
    style D4 fill:#00E676,stroke:#333,color:#000
```

> [!WARNING]
> **Query Planning Bottleneck (Nút thắt lập kế hoạch truy vấn):** 
> Trước khi thực thi bất kỳ query nào, Trino hoặc Spark phải đọc file Metadata để quyết định loại bỏ (Skip) các file không cần thiết dựa trên mệnh đề `WHERE` (Min/Max filtering). Nếu Manifest File phải lưu trữ siêu dữ liệu của hàng triệu Data Files, giai đoạn Query Planning có thể kéo dài hàng chục phút và làm tràn RAM của Spark Driver (lỗi `java.lang.OutOfMemoryError: Java heap space`).

---

## 3. Kiến Trúc Compaction & Sự Đánh Đổi (Trade-offs)

Để cứu vãn hệ thống, Iceberg cung cấp Stored Procedure `rewrite_data_files` (thường được chạy qua Spark) nhằm gom tụ (Compaction) các file nhỏ thành các block chuẩn (thường 128MB - 512MB). Nhờ cơ chế **MVCC (Multi-Version Concurrency Control)**, Compaction diễn ra ở chế độ nền (Background) mà không hề block các truy vấn đọc của người dùng.

Iceberg cung cấp 3 chiến lược thiết kế (Strategies). Mỗi chiến lược đại diện cho một sự đánh đổi (Trade-off) giữa **Compute Cost (Chi phí điện toán)** và **Query Performance (Hiệu năng truy vấn)**.

### 3.1. Chiến lược BINPACK: I/O Bound, Không Shuffle

**Cơ chế:** Binpack hoạt động như trò chơi xếp hình Tetris. Nó gom các file dữ liệu nhỏ lại thành file lớn hơn cho đến khi đạt kích thước mục tiêu (ví dụ: 512MB) mà **không quan tâm đến thứ tự** của các bản ghi bên trong.

```mermaid
flowchart LR
    subgraph Trước khi Binpack
    A1["File 10MB"]
    A2["File 20MB"]
    A3["File 15MB"]
    A4["File 30MB"]
    end
    
    subgraph Binpack Job("Spark Executor")
    B("Nối nối tiếp IO, không Shuffle")
    end
    
    subgraph Sau khi Binpack
    C1["File Mới 75MB"]
    end
    
    A1 --> B
    A2 --> B
    A3 --> B
    A4 --> B
    B --> C1
    
    style B fill:#FFC107,stroke:#333,stroke-width:2px,color:#000
```

- **Ưu điểm (Pros):** Rất nhẹ và cực nhanh. Job chỉ phụ thuộc vào thông lượng đọc/ghi đĩa (I/O Bound). Hoàn toàn **KHÔNG** xảy ra Network Shuffle (không chuyển dữ liệu giữa các node), do đó không có nguy cơ OOM (Out-of-Memory).
- **Nhược điểm (Cons):** Không cải thiện Data Skipping. Nếu dữ liệu ban đầu nằm lộn xộn, Min/Max bounds của file mới sẽ rất rộng.
- **Sử dụng khi nào?** Làm "Minor Compaction". Chạy tần suất cao (mỗi giờ) cho các bảng Streaming để dọn rác tức thì.

**Thực thi qua Spark SQL:**
```sql
CALL catalog.system.rewrite_data_files(
  table => 'lakehouse.clickstream',
  strategy => 'binpack',
  options => map(
    'target-file-size-bytes', '536870912', -- 512MB
    'min-input-files', '10'
  )
);
```

### 3.2. Chiến lược SORT: Compute Intensive & Hierarchical Sorting

**Cơ chế:** Sort sẽ bung toàn bộ dữ liệu ra, thực hiện một thao tác phân loại (Wide Transformation), sắp xếp các bản ghi theo thứ tự ưu tiên (Ví dụ: `ORDER BY tenant_id, event_date`), rồi mới ghi xuống disk. 

- **Ưu điểm (Pros):** Tối ưu hóa cực mạnh cho Data Skipping dựa trên Footer Parquet (Min/Max). Các query có điều kiện `WHERE tenant_id = 'A'` sẽ skip được 99% data files của các tenant khác.
- **Trade-offs (Cons - Rủi ro vận hành):** 
  - Đòi hỏi **Wide Network Shuffle**. Nếu bảng có kích thước hàng TB, quá trình Sort sẽ luân chuyển dữ liệu khổng lồ qua mạng.
  - Rủi ro Spill-to-disk: Khi RAM của Worker Node không đủ để chứa khối lượng dữ liệu đang được sort, Spark buộc phải ghi tạm ra disk (Spill), khiến I/O tăng vọt và thời gian chạy job kéo dài gấp nhiều lần, thậm chí crash hệ thống.

```sql
CALL catalog.system.rewrite_data_files(
  table => 'lakehouse.sales',
  strategy => 'sort',
  sort_order => 'tenant_id ASC, order_date DESC',
  options => map('target-file-size-bytes', '536870912')
);
```

### 3.3. Chiến lược Z-ORDER: Giải Quyết Nút Thắt Đa Chiều (Multi-dimensional Clustering)

**Cơ chế:** Sort phân cấp thông thường mắc phải yếu điểm "thiên vị" (Biased Sorting). Nếu sort theo `(A, B, C)`, các query có `WHERE A = x` rất nhanh, nhưng `WHERE B = y` lại phải Full Table Scan vì cột B nằm rải rác bên trong các khối của A.

**Z-Order Clustering** giải quyết bài toán này bằng cách xen kẽ (interleave) các bit nhị phân của nhiều cột, tạo ra một đường cong Z-Curve trong không gian không gian nhiều chiều. Dữ liệu được nhóm lại sao cho tính cục bộ (Locality) được bảo toàn đồng đều cho tất cả các cột tham gia Z-Order.

> [!TIP]
> **Best Practice thiết kế Z-Order:** 
> Việc tính toán Z-Order cực kỳ đắt đỏ về mặt CPU (Toán học nhị phân). Chỉ nên chọn từ **2 đến tối đa 4 cột** thường xuyên xuất hiện nhất trong các bộ lọc `WHERE`. Đưa quá nhiều cột sẽ dẫn đến hiệu ứng pha loãng (Curse of Dimensionality), làm suy giảm hiệu năng skip data.

```sql
CALL catalog.system.rewrite_data_files(
  table => 'lakehouse.events',
  strategy => 'sort',
  sort_order => 'zorder(country_code, platform_id, event_type)'
);
```

---

## 4. Kiến Trúc Maintenance Pipeline Trong Thực Tế

Trong môi trường Production thực tế (Uber, Netflix), không ai chạy Z-Order mỗi giờ một lần vì chi phí Compute sẽ đốt sạch ngân sách (FinOps Disaster). Thay vào đó, kiến trúc chuẩn là sự kết hợp (Tiered Compaction) được lập lịch qua Apache Airflow:

1. **Minor Compaction (Hourly):** Sử dụng `BINPACK` quét qua các partitions của ngày hiện tại để gom nhanh các file do Kafka đổ xuống. Tốn ít Compute, giữ cho Query Planning không bị nghẽn.
2. **Major Compaction (Weekly):** Sử dụng `Z-ORDER` quét qua các partitions cũ của tuần trước (dữ liệu đã đóng băng, không còn biến động). Chạy vào lúc 2 giờ sáng Chủ Nhật (Maintenance Window) để chuẩn bị dữ liệu gọn gàng nhất cho báo cáo đầu tuần.

---

## 5. Vacuum: Dọn Rác Vật Lý (Garbage Collection)

Iceberg sử dụng kiến trúc Copy-On-Write cho Compaction. Lệnh `rewrite_data_files` tạo ra các file 512MB mới và commit Snapshot mới, nhưng **TUYỆT ĐỐI KHÔNG XÓA** các file 10KB cũ. Lịch sử được bảo lưu cho tính năng Time-Travel.

Nếu không có cơ chế dọn rác, chi phí lưu trữ S3 sẽ tăng theo cấp số nhân (Storage Cost Explosion). Cần thiết lập 2 Pipeline dọn dẹp riêng biệt:

### Bước 1: Expire Snapshots
Gỡ bỏ con trỏ metadata về các trạng thái cũ.
```sql
CALL catalog.system.expire_snapshots(
  table => 'lakehouse.sales', 
  older_than => TIMESTAMP '2023-11-01 00:00:00.000',
  retain_last => 5 -- Giữ lại ít nhất 5 versions để phòng hờ
);
```

### Bước 2: Remove Orphan Files (Xóa rác mức Storage)
Chính thức gửi API `DELETE` xuống Object Storage để dọn các file mồ côi (không còn thuộc về bất kỳ Snapshot nào).

> [!CAUTION]
> **Rủi ro xóa nhầm In-flight Files:** 
> Đừng bao giờ cấu hình `older_than = NOW()` cho Orphan Files. Luôn lùi lại tối thiểu 3-5 ngày. Nếu một Spark Streaming Job đang ghi một Data File xuống S3 nhưng chưa kịp commit Metadata lên Iceberg Catalog, việc quét Orphan ngay lúc đó sẽ xem file này là rác và xóa sổ nó, gây hỏng hóc tính toàn vẹn dữ liệu (Data Corruption).

```sql
CALL catalog.system.remove_orphan_files(
  table => 'lakehouse.sales',
  older_than => TIMESTAMP '2023-10-25 00:00:00.000'
);
```

---

## Nguồn Tham Khảo (References)
* [Apache Iceberg Official Documentation: Spark Procedures](https://iceberg.apache.org/docs/latest/spark-procedures/)
* [Dremio: Small Files and Compaction in Apache Iceberg](https://www.dremio.com/resources/guides/apache-iceberg-compaction/)
* [Tabular (now Databricks): Z-Order and Data Sorting Strategies](https://tabular.io/blog/z-order-clustering/)
* Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly Media. (Chương 3: Storage and Retrieval - Phân tích về LSM-Trees và Compaction).
