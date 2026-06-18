---
title: "Delta Lake - Bảng dữ liệu giao dịch mở (Open Table Format)"
difficulty: "Advanced"
tags: ["data-lakehouse", "delta-lake", "databricks", "acid", "parquet", "open-table-format"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Delta Lake là gì? Tính năng ACID trên Data Lakehouse"
metaDescription: "Delta Lake: Định dạng Open Table Format mã nguồn mở hỗ trợ giao dịch ACID, Time Travel và Schema Evolution trên Data Lakehouse."
description: "Nếu bạn từng làm việc với Data Lake truyền thống (sử dụng các tệp tin Parquet hay CSV lưu trên S3/GCS), chắc chắn bạn đã gặp phải các vấn đề về tính nhất quán, khó khăn trong việc cập nhật dữ liệu (UPDATE/DELETE), và thiếu khả năng kiểm soát giao dịch (ACID). Delta Lake ra đời như một giải pháp thiết yếu để giải quyết các vấn đề này, biến Data Lake thành Data Lakehouse."
---



Nếu bạn từng làm việc với Data Lake truyền thống (sử dụng các tệp tin Parquet hay CSV lưu trữ trên các object storage như Amazon S3, Google Cloud Storage, hoặc Azure Data Lake Storage), chắc chắn bạn đã từng gặp phải ít nhất một trong các vấn đề sau:

- **Thiếu tính nhất quán (Lack of Consistency):** Khi một tiến trình đang ghi dữ liệu vào một partition, tiến trình đọc có thể đọc phải dữ liệu rác (partial data) hoặc gặp lỗi.
- **Khó khăn khi cập nhật và xóa (UPDATE/DELETE/MERGE):** Việc thay đổi một vài dòng dữ liệu đòi hỏi bạn phải đọc lại toàn bộ file, thay đổi dữ liệu, và ghi đè file mới.
- **Vấn đề nhiều file nhỏ (Small File Problem):** Dữ liệu streaming tạo ra hàng ngàn file nhỏ liên tục, làm suy giảm nghiêm trọng hiệu suất truy vấn.
- **Không có kiểm soát lược đồ (Schema Enforcement):** Dữ liệu hỏng hoặc sai định dạng dễ dàng bị ghi vào Data Lake, gây ra hiệu ứng domino làm hỏng các đường ống dữ liệu (data pipelines) ở phía sau.

**Delta Lake** là một Open Table Format được xây dựng trên nền tảng Data Lake để giải quyết tất cả những hạn chế trên. Được phát triển ban đầu bởi Databricks và sau đó mã nguồn mở cho Linux Foundation, Delta Lake mang đến khả năng **ACID transactions**, **Time Travel**, và **Scalable Metadata Handling**. Nó là nền tảng cốt lõi của kiến trúc **Data Lakehouse**.

---

## Kiến trúc cốt lõi của Delta Lake

Đằng sau một bảng Delta, dữ liệu thực tế vẫn được lưu trữ dưới định dạng [Apache Parquet](/concepts/3-storage-engines-formats/parquet-internals). Điểm khác biệt mấu chốt làm nên Delta Lake chính là **Transaction Log (Delta Log)**.

Một thư mục bảng Delta Lake điển hình sẽ trông như thế này:

```text
my_table/
├── _delta_log/
│   ├── 00000000000000000000.json
│   ├── 00000000000000000001.json
│   ├── 00000000000000000002.json
│   └── 00000000000000000002.checkpoint.parquet
├── part-00000-xxxx.snappy.parquet
├── part-00001-yyyy.snappy.parquet
└── part-00002-zzzz.snappy.parquet
```

### 1. Parquet Data Files
Tất cả dữ liệu của bảng được lưu trong các file Parquet nén. Thay vì đọc trực tiếp các file này như trong Data Lake truyền thống, các engine tính toán (như Apache Spark, Trino, Presto) sẽ phải đọc qua Delta Log trước để biết chính xác những file Parquet nào thuộc về version mới nhất của bảng.

### 2. Delta Log (`_delta_log`)
Thư mục `_delta_log` là "trái tim" của Delta Lake. Nó lưu trữ lịch sử của mọi giao dịch thay đổi dữ liệu bảng.
- **JSON files:** Mỗi commit (thêm, sửa, xóa dữ liệu hoặc thay đổi schema) sẽ tạo ra một file JSON tuần tự. File JSON này chứa siêu dữ liệu (metadata) về các file Parquet được thêm vào (`add`) và các file bị xóa bỏ khỏi version hiện tại (`remove`).
- **Checkpoint files:** Việc đọc hàng ngàn file JSON sẽ làm chậm hiệu suất. Do đó, cứ sau mỗi 10 commits, Delta Lake sẽ tổng hợp tất cả trạng thái vào một file `.checkpoint.parquet`. Khi đọc bảng, engine chỉ cần đọc file checkpoint mới nhất và các file JSON nhỏ lẻ sinh ra sau đó.

---

## Các tính năng nổi bật của Delta Lake

### 1. Giao dịch ACID (ACID Transactions)
Delta Lake hỗ trợ cơ chế **Optimistic Concurrency Control (Kiểm soát đồng thời lạc quan)**.
- **Atomicity (Tính nguyên tử):** Một giao dịch (ví dụ: ghi một lô dữ liệu) sẽ thành công hoàn toàn hoặc thất bại hoàn toàn. Sẽ không có chuyện chỉ một nửa dữ liệu được ghi vào Data Lake.
- **Isolation (Tính cô lập):** Các tiến trình đọc và ghi có thể diễn ra đồng thời mà không can thiệp lẫn nhau. Người đọc luôn thấy trạng thái nhất quán mới nhất của dữ liệu (Snapshot Isolation).
- **Consistency và Durability:** Dữ liệu sau khi ghi xong (commit hoàn tất vào transaction log) sẽ tồn tại vững chắc và được bảo vệ.

### 2. Time Travel (Data Versioning)
Vì Delta Lake không ngay lập tức xóa vật lý các file Parquet cũ (cho đến khi bạn chạy lệnh `VACUUM`), bạn có thể truy vấn lại trạng thái của bảng tại một thời điểm hoặc một version cụ thể trong quá khứ.

Điều này cực kỳ hữu ích cho việc:
- **Khôi phục dữ liệu:** Phục hồi từ những thao tác lỗi (ví dụ: vô tình DROP hoặc UPDATE nhầm).
- **Audit:** Kiểm toán xem dữ liệu đã thay đổi thế nào.
- **Tái tạo mô hình Machine Learning:** Huấn luyện lại mô hình với cùng một bộ dữ liệu lịch sử.

```sql
-- Truy vấn theo Version
SELECT * FROM my_table VERSION AS OF 5;

-- Truy vấn theo Timestamp
SELECT * FROM my_table TIMESTAMP AS OF '2023-10-01 12:00:00';
```

### 3. DML Operations (UPDATE, DELETE, MERGE)
Với Data Lake truyền thống, việc `UPDATE` một dòng dữ liệu là cơn ác mộng. Bạn phải dùng Spark đọc toàn bộ file chứa dòng đó, lọc, sửa và ghi đè một file mới. Delta Lake hỗ trợ các lệnh DML tiêu chuẩn một cách tự nhiên.

Đặc biệt tính năng **MERGE (Upsert)** cho phép bạn dễ dàng kết hợp dữ liệu từ hệ thống OLTP vào Data Lakehouse (Change Data Capture - CDC).

```sql
MERGE INTO target_table t
USING source_data s
ON t.id = s.id
WHEN MATCHED THEN UPDATE SET t.value = s.value
WHEN NOT MATCHED THEN INSERT (id, value) VALUES (s.id, s.value);
```

### 4. Schema Enforcement & Evolution
- **Schema Enforcement:** Mặc định, Delta Lake ngăn chặn việc ghi dữ liệu có lược đồ không khớp với bảng. Nó bảo vệ chất lượng dữ liệu khỏi những lỗi không đáng có.
- **Schema Evolution:** Nếu bạn chủ ý muốn thêm một cột mới vào bảng, bạn có thể kích hoạt Schema Evolution (ví dụ thêm option `mergeSchema` trong Spark) để tự động cập nhật lược đồ của bảng một cách an toàn.

### 5. Unified Batch and Streaming
Bạn có thể cấu hình cùng một bảng Delta làm nguồn (source) và đích đến (sink) cho cả dữ liệu Batch và Streaming. Transaction log đảm bảo cho Spark Structured Streaming có thể xử lý chính xác Exactly-Once (mỗi bản ghi chỉ được xử lý đúng một lần).

---

## Tối ưu hóa hiệu suất trên Delta Lake

Để duy trì hiệu suất đọc nhanh khi bảng phình to, Delta Lake cung cấp các cơ chế:

### 1. Compaction (Tối ưu hóa file nhỏ)
Sử dụng lệnh `OPTIMIZE`, Delta Lake sẽ "gom" nhiều file Parquet nhỏ thành các file lớn hơn (thường được tối ưu hóa ở mức xấp xỉ 1GB). Điều này giải quyết bài toán "Small File Problem", giảm thiểu chi phí quét metadata và tối ưu I/O.

```sql
OPTIMIZE my_table;
```

### 2. Data Skipping và Z-Ordering
Khi lưu thông tin các file vào Delta Log, Delta cũng lưu lại chỉ số thống kê (min, max, null count) của từng cột. Dựa vào đó, khi có lệnh SELECT, nó có thể bỏ qua các file không chứa dữ liệu thỏa mãn điều kiện WHERE (Data Skipping).

**Z-Ordering** là kỹ thuật sắp xếp lại dữ liệu trong các file đa chiều theo cụm (cluster) để nâng cao hiệu quả của Data Skipping. Kỹ thuật này cực kỳ hiệu quả cho các truy vấn có lọc nhiều điều kiện trên các cột có cardinality (độ phân tán) cao.

### 3. Liquid Clustering
Là tính năng hiện đại nhất được giới thiệu để thay thế cho cơ chế phân vùng (Partitioning) tĩnh truyền thống và Z-Ordering. Liquid Clustering tự động điều chỉnh và phân cụm dữ liệu linh hoạt mà không cần phải định nghĩa trước cột partition, rất hiệu quả cho các bảng lớn, và dữ liệu thay đổi thường xuyên (skewed data).

---

## Delta Lake vs Apache Iceberg vs Apache Hudi

Ba định dạng này thường được gọi chung là **Open Table Formats**. Dù có cùng mục tiêu là mang giao dịch ACID đến Data Lake, chúng có những điểm mạnh riêng:

| Tính năng | Delta Lake | Apache Iceberg | Apache Hudi |
| :--- | :--- | :--- | :--- |
| **Hệ sinh thái chính** | Databricks, Apache Spark | Netflix, Trino, Flink | Uber, Hadoop Ecosystem |
| **Transaction Log** | Cấp độ File (Thư mục `_delta_log`) | Cấp độ File (Manifests, Snapshots tree) | Cấp độ File (`.hoodie` timeline) |
| **Schema Evolution** | Tốt (Thêm cột, thay đổi kiểu dữ liệu) | Xuất sắc (Hỗ trợ đổi tên, xóa cột an toàn mà không cần đọc lại dữ liệu) | Tốt |
| **Streaming CDC** | Tốt (Hỗ trợ Spark Streaming) | Khá (Tích hợp Flink tốt) | Rất mạnh (Tối ưu riêng cho Upserts/CDC) |

*Mẹo: Delta Lake là lựa chọn mặc định và tốt nhất nếu Data Stack của bạn đặt trọng tâm vào Apache Spark và Databricks. Ngược lại, nếu bạn sử dụng nhiều query engines khác nhau (như Trino, Athena, Snowflake) thì Apache Iceberg đang ngày càng chiếm ưu thế nhờ thiết kế metadata trung lập.*

---

## Tổng kết

Delta Lake đã thay đổi hoàn toàn cách chúng ta xây dựng Data Pipelines. Bằng việc mang các tính năng cốt lõi của Data Warehouse (ACID, DML, Versioning) xuống lớp Data Lake thông qua một `_delta_log` thông minh, nó mở đường cho kiến trúc **Data Lakehouse** – nơi bạn có thể vừa lưu trữ lượng dữ liệu khổng lồ với chi phí rẻ, vừa có thể chạy các truy vấn BI, ML với hiệu suất và độ tin cậy cao.

## Tài Liệu Tham Khảo
* [Delta Lake Official Documentation](https://docs.delta.io/latest/index.html)
* [The Delta Lake Project (Linux Foundation)](https://delta.io/)
* [Databricks: What is a Lakehouse?](https://www.databricks.com/blog/2020/01/30/what-is-a-data-lakehouse.html)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
