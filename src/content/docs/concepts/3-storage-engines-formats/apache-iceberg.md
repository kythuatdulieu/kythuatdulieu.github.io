---
title: "Apache Iceberg - Kiến trúc cốt lõi và Đánh đổi Hệ thống (System Trade-offs)"
difficulty: "Advanced"
tags: ["data-lakehouse", "apache-iceberg", "open-table-format", "netflix", "acid", "metadata", "system-design"]
readingTime: "20 mins"
lastUpdated: 2026-06-26
seoTitle: "Apache Iceberg Architecture & Trade-offs: Cuộc cách mạng Open Table Format"
metaDescription: "Phân tích kiến trúc Apache Iceberg chuyên sâu. Cơ chế Metadata Tree, O(1) RPC, COW vs MOR, giải quyết bài toán Small Files và Z-Ordering Trade-offs."
description: "Khi vận hành Data Lake quy mô Petabyte, kiến trúc Directory-based của Hive sụp đổ vì List API quá chậm. Apache Iceberg thay đổi hoàn toàn cuộc chơi với Metadata Tree, O(1) Catalog Swap và cơ chế ACID ở cấp độ File. Phân tích kiến trúc và Trade-offs thực chiến."
---

Khi vận hành Data Lake ở quy mô siêu khổng lồ (Petabyte-scale), kiến trúc "Directory-based" truyền thống của Apache Hive nhanh chóng bộc lộ điểm yếu chí mạng: **Directory Listing Problem**. Việc engine tính toán phải gọi S3/GCS `List` API hàng triệu lần để quét các thư mục con tạo ra độ trễ (latency) khổng lồ trước khi truy vấn thực sự bắt đầu. 

Apache Iceberg, được khởi nguồn từ Netflix, giải quyết triệt để bài toán này bằng cách chuyển đổi từ "theo dõi thư mục" sang "theo dõi chính xác từng file" (File-level tracking) thông qua một cấu trúc Metadata Tree. Tuy nhiên, kiến trúc này cũng mang lại những đánh đổi hệ thống (System Trade-offs) phức tạp về Compaction, Small Files, và OOM mà các Data Engineer cần nắm rõ.

## 1. Kiến trúc Thực thi Vật lý (Physical Execution Architecture)

Linh hồn của Iceberg nằm ở cấu trúc **Metadata Tree**. Iceberg không bao giờ sửa đổi dữ liệu trực tiếp (Immutable). Mỗi thao tác Write/Update/Delete đều sinh ra các file dữ liệu mới và một cây Metadata mới, sau đó thực hiện trỏ con trỏ (Pointer Swap) một cách nguyên tử (Atomic).

```mermaid
graph TD
    subgraph "Catalog Layer("Single Source of Truth")"
        C["Iceberg Catalog <br> HMS, AWS Glue, REST"]
    end

    subgraph "Metadata Layer("The Tree")"
        M1["metadata_v1.json("Old")"]
        M2["metadata_v2.json("Active")"]
        ML1["Manifest List("Snapshot 1")"]
        ML2["Manifest List("Snapshot 2")"]
        MF1["Manifest File 1("Stats: min/max")"]
        MF2["Manifest File 2("Stats: min/max")"]
        MF3["Manifest File 3("Stats: min/max")"]
    end

    subgraph "Data Layer("Immutable Object Storage")"
        D1["(Data File A .parquet)"]
        D2["(Data File B .parquet)"]
        D3["(Data File C .parquet)"]
        D4["(Data File D .parquet)"]
    end

    C -- "Atomic Swap <br> O("1") RPC" --> M2
    C -. "Previous state" .-> M1

    M1 -.-> ML1
    M2 --> ML2

    ML1 -.-> MF1
    ML1 -.-> MF2
    
    ML2 --> MF2
    ML2 --> MF3

    MF1 -.-> D1
    MF2 --> D2
    MF3 --> D3
    MF3 --> D4
```

### 1.1. Luồng thực thi truy vấn (Query Execution Flow) với Data Skipping
Khi thực thi một câu lệnh `SELECT * FROM table WHERE created_at = '2023-01-01'`, engine (Spark/Trino) không đụng đến Data layer cho đến bước cuối cùng. Quá trình diễn ra hoàn toàn trên RAM và Metadata:
1. **Catalog Swap (O(1)):** Engine hỏi Catalog xem file `metadata.json` mới nhất nằm ở đâu.
2. **Snapshot Resolution:** Đọc `metadata.json` lấy Snapshot ID hiện tại và trỏ tới `Manifest List`.
3. **Manifest Pruning:** Đọc `Manifest List` (chứa range phân vùng của từng Manifest). Loại bỏ ngay lập tức các `Manifest File` không chứa dữ liệu ngày `2023-01-01`.
4. **Data File Skipping (Min/Max Filtering):** Đọc các `Manifest File` còn sót lại. Dựa vào metadata cột `min_value`, `max_value`, `null_count` được lưu sẵn, vứt bỏ tiếp các Data file không thỏa mãn điều kiện.
5. **Physical Read:** Chỉ mở và đọc đúng các `.parquet` file chứa dữ liệu cần thiết. 

Chiến lược này giúp giảm 90-99% lượng file phải quét (Scan) trên Cloud Storage.

## 2. Đánh đổi trong thao tác Ghi (COW vs. MOR)

Khi dữ liệu thay đổi (UPDATE, DELETE, MERGE), Iceberg cung cấp 2 chế độ kiến trúc vật lý. Việc chọn sai sẽ dẫn đến hiện tượng chóp nghẽn I/O (I/O Bottleneck) hoặc tràn RAM (JVM OOMKilled).

### 2.1. Copy-on-Write (COW)
- **Cơ chế:** Khi có 1 row bị update, Iceberg đọc toàn bộ file Parquet gốc lên RAM, sửa đúng 1 row đó, và ghi đè ra một file Parquet hoàn toàn mới.
- **Trade-off:** 
  - **Write Amplification (Khuyếch đại ghi):** Cực kỳ cao. Thay đổi 1 bytes có thể kéo theo việc ghi lại file 512MB.
  - **Read Performance:** Đạt mức tối đa (vì dữ liệu luôn sạch, file liên tục).
- **Use-case:** Dữ liệu tĩnh, Dimension Tables, xử lý Batch hàng ngày.

### 2.2. Merge-on-Read (MOR)
- **Cơ chế:** Dữ liệu cũ giữ nguyên. Thay đổi được ghi vào một file "Delete File" (chứa danh sách các row id bị xóa/update - Positional Deletes) và/hoặc ghi row mới vào Data File mới.
- **Trade-off:**
  - **Write Performance:** Cực nhanh, phù hợp cho Streaming.
  - **Read Penalty:** Khi query, engine phải nạp cả Data File và Delete File vào RAM để thực hiện Merge-on-the-fly. Nếu Delete file quá lớn, quá trình này sẽ gây ra `OOMKilled` trên các executor của Spark/Trino.
- **Use-case:** Streaming ingestion (Flink), CDC (Change Data Capture), Fact Tables có vòng đời update liên tục.

*Cấu hình thực chiến trong Spark:*
```sql
-- Chuyển đổi chiến lược cho bảng có tần suất update cao
ALTER TABLE my_catalog.db.orders SET TBLPROPERTIES (
    'write.update.mode'='merge-on-read',
    'write.delete.mode'='merge-on-read',
    'write.merge.mode'='merge-on-read'
);
```

## 3. Rủi ro Vận hành (Operational Risks & Compaction)

Iceberg không có phép thuật để miễn nhiễm với vật lý. Nếu bạn push dữ liệu từ Kafka/Flink vào Iceberg mỗi phút (Streaming), bạn sẽ sớm đối mặt với thảm họa **Small Files Problem**.

### 3.1. Thảm họa Small Files & Bin-Packing
Kafka đẩy hàng nghìn file 1MB vào Data layer. Hậu quả: `Manifest File` phình to, S3 throttle vì số lượng GET request quá lớn, JVM của Spark OOM khi nạp Metadata.

**Giải pháp:** Compaction bằng thuật toán **Bin-Packing**.
Bin-packing lấy các file nhỏ ghép lại thành file lớn (Target size 512MB) mà *không sắp xếp lại dữ liệu* (No Data Shuffling). 
- **Compute Cost:** Rất rẻ.
- **Tác động:** Giảm metadata overhead, nhưng không tối ưu hóa Data Skipping.

```python
# Thực thi Bin-Packing định kỳ qua Spark (e.g. Airflow Operator)
spark.sql("""
CALL my_catalog.system.rewrite_data_files(
  table => 'db.orders',
  strategy => 'binpack',
  options => map('target-file-size-bytes', '536870912') -- 512MB
)
""")
```

### 3.2. Data Skipping & Z-Ordering Fragmentation
Nếu bạn phân vùng bảng theo `Ngày`, việc truy vấn theo `Ngày` rất nhanh. Nhưng nếu Business muốn truy vấn theo `user_id` thì sao? Engine buộc phải quét chéo hàng ngàn file (Cross-partition scan). 

**Giải pháp:** **Z-Ordering** (Sắp xếp theo đường cong không gian - Space-filling curves). 
Z-Ordering "gom cụm" (cluster) các dòng có cùng `user_id` và `event_type` vào chung một file Parquet, giúp thu hẹp chỉ số Min/Max một cách gắt gao. Khi query `user_id`, cơ chế Min/Max filtering sẽ loại bỏ được tối đa các file.

**Trade-off chết người:** 
- Z-Ordering bắt buộc hệ thống phải **Network Shuffle** toàn bộ dữ liệu trên Cluster để sắp xếp lại (Global Sort). Cực kỳ tốn CPU và RAM.
- **Compaction Churn:** Nếu bạn Z-Order dữ liệu mới mỗi giờ, chi phí Compute trên đám mây sẽ thổi bay ngân sách dự án. 
- **Best Practice:** Chỉ chạy Z-Ordering vào cuối tuần trên các vách dữ liệu (partitions) "nguội" (Cold data) không còn bị update nữa. Luôn bắt đầu bằng Bin-Packing cho dữ liệu "nóng" (Hot data).

```sql
-- Z-Order Optimization trên các cột High-Cardinality
CALL my_catalog.system.rewrite_data_files(
  table => 'db.user_events',
  strategy => 'sort',
  sort_order => 'zorder(user_id, event_type)'
)
```

## 4. Tương thích Hệ sinh thái (Ecosystem Integration)
Sức mạnh lớn nhất của Iceberg là tính độc lập nền tảng.
Một kiến trúc chuẩn hóa (Standard Architecture) thường gặp:
- **Streaming Ingestion:** Flink đẩy dữ liệu real-time vào Iceberg dưới dạng MOR.
- **Batch Processing:** Spark định kỳ chạy Job để Compaction (Rewrite Data Files và Rewrite Manifests) và làm sạch Snapshots cũ (`expire_snapshots`).
- **Ad-hoc Query:** Trino / StarRocks cắm vào Iceberg Catalog (AWS Glue/Nessie) để query siêu tốc cho BI Dashboards.

## Nguồn Tham Khảo (References)
* [Apache Iceberg: An Architectural Look Under the Covers - Dremio](https://www.dremio.com/resources/guides/apache-iceberg-an-architectural-look-under-the-covers/)
* [Netflix Tech Blog: Data Engineering with Iceberg](https://netflixtechblog.com/)
* [Z-Ordering in Apache Iceberg - Trino Official Blog](https://trino.io/blog/)
* [Optimizing Iceberg with Compaction (Bin-packing vs Sorting) - Substack Engineering](https://substack.com/)
