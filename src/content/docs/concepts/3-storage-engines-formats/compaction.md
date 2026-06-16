---
title: "Compaction"
difficulty: "Intermediate"
tags: ["compaction", "data-lakehouse", "optimization", "small-files-problem"]
readingTime: "8 mins"
lastUpdated: 2026-06-16
seoTitle: "Compaction - Tối ưu hóa hiệu năng Data Lake (Small Files Problem)"
metaDescription: "Tìm hiểu Compaction trong Data Engineering: giải pháp cho Small Files Problem, cách gom tệp tin nhỏ thành tệp lớn để tăng tốc độ truy vấn trên Data Lake."
description: "Trong thế giới Data Engineering, việc thiết lập các luồng dữ liệu streaming hay micro-batch liên tục cập nhật dữ liệu thường dẫn đến vấn đề Small Files Problem. Compaction chính là giải pháp cốt lõi cho vấn đề này."
---



Compaction là quá trình dọn dẹp và tối ưu hóa hệ thống lưu trữ bằng cách gộp nhiều file dữ liệu nhỏ (Small Files) thành các file lớn hơn (thường từ 128MB - 512MB hoặc lên đến 1GB). Cơ chế này giúp giảm tải cho Metadata Server (như HDFS NameNode hay Metadata của AWS S3/Cloud Storage) và tăng tốc đáng kể các job xử lý dữ liệu phân tán (Spark, Presto, Trino) do giảm chi phí mở/đóng và tìm kiếm (seek) file.

## 1. Vấn đề File Nhỏ (The Small Files Problem)

Trong một hệ thống Data Lake, dữ liệu thường xuyên được đẩy vào từ các luồng streaming (Kafka, Kinesis) hoặc các tiến trình micro-batch.

### Nguyên nhân gây ra Small Files
* **Streaming & Micro-batching:** Dữ liệu được ghi liên tục với tần suất cao (ví dụ: mỗi 1 phút hoặc vài giây một lần). Mỗi lần commit sẽ tạo ra các file mới rất nhỏ (vài KB đến vài MB).
* **Over-partitioning:** Chia partition quá nhỏ (ví dụ: partition theo ngày, giờ, phút và cả khu vực) khiến lượng dữ liệu mỗi partition cực ít, sinh ra hàng ngàn file bé xíu.
* **Over-parallelism:** Khi chạy các job Spark/Flink với số lượng task hoặc partition song song (shuffle partitions) quá lớn so với lượng dữ liệu, mỗi task sẽ ghi ra một phần kết quả dưới dạng một file riêng biệt.

### Hậu quả của Small Files
* **Metadata Overhead:** Các hệ thống file phân tán như HDFS lưu metadata trên bộ nhớ (RAM) của NameNode. Hàng triệu file nhỏ sẽ làm cạn kiệt RAM NameNode. Với Cloud Object Storage (S3, GCS), việc liệt kê (LIST) và lấy thông tin (GET) hàng nghìn file tốn rất nhiều thời gian và chi phí API.
* **Suy giảm hiệu năng truy vấn (I/O Overhead):** Việc mở một file, đọc header/footer và đóng file tốn một khoảng thời gian nhất định (latency). Khi đọc 10.000 file kích thước 1MB sẽ mất nhiều thời gian hơn rất nhiều so với đọc 10 file kích thước 1GB do I/O overhead.
* **Giảm tỷ lệ nén (Compression Ratio):** Các thuật toán nén dạng block-based (Snappy, Zstd, Gzip) và các định dạng dữ liệu cột (Parquet, ORC) hoạt động hiệu quả nhất với dữ liệu đủ lớn. Nếu file quá nhỏ, dictionary/metadata của Parquet/ORC có khi còn lớn hơn cả data, và khả năng nén cực kỳ kém.

## 2. Cách thức hoạt động của Compaction

Về bản chất, Compaction là một job xử lý dữ liệu chạy ngầm hoặc định kỳ. Tiến trình này sẽ:
1. Đọc nhiều file dữ liệu nhỏ.
2. Nạp vào bộ nhớ hoặc xử lý theo khối.
3. Ghi ra một hoặc vài file dữ liệu lớn với kích thước tối ưu.
4. Cập nhật lại Metadata của bảng (hoặc thư mục) để trỏ đến file mới và đánh dấu các file cũ là "đã xóa" (tombstoned) để chờ quá trình dọn dẹp (Vacuum).

### Minor Compaction vs Major Compaction (LSM-Trees)
Trong các cơ sở dữ liệu dựa trên Log-Structured Merge-Tree (LSM-Tree) như Cassandra, HBase, RocksDB:
* **Minor Compaction:** Gộp một số lượng nhỏ các file (SSTables) ở cùng level thành một file lớn hơn. Quá trình này diễn ra thường xuyên, tốn ít tài nguyên và nhanh chóng.
* **Major Compaction:** Gộp toàn bộ các file trong một Column Family hoặc toàn bộ hệ thống thành một file duy nhất. Xóa hẳn các dữ liệu rác (tombstones). Tốn nhiều CPU, Disk I/O và thường chỉ được chạy vào giờ thấp điểm.

## 3. Các chiến lược Compaction (Compaction Strategies)

Khi thực hiện Compaction, hệ thống có thể kết hợp việc tổ chức lại dữ liệu bên trong file mới để tối ưu hơn cho các câu truy vấn.

### a. Bin-packing (Đóng gói)
Cách đơn giản nhất: chỉ cần lấy các file nhỏ ghép lại cho đến khi đạt target size (ví dụ 256MB).
* **Ưu điểm:** Tốc độ nhanh, ít tốn bộ nhớ và CPU do không phải sắp xếp dữ liệu.
* **Nhược điểm:** Dữ liệu bên trong file không có thứ tự, không tối ưu cho Data Skipping (nhảy cóc dữ liệu khi truy vấn bằng Min/Max stats).

### b. Sorting (Sắp xếp theo cột)
Khi đọc các file nhỏ lên, thực hiện sắp xếp lại (Sort) dữ liệu dựa trên một hoặc nhiều cột thường xuyên được truy vấn (ví dụ: `customer_id`, `event_time`) trước khi ghi ra file lớn.
* **Ưu điểm:** Giúp gom nhóm dữ liệu có cùng giá trị lại gần nhau. Metadata của Parquet sẽ có khoảng Min/Max thu hẹp lại, giúp query engine (Presto, Spark) bỏ qua file nhanh chóng nếu điều kiện lọc (WHERE) không nằm trong khoảng đó.
* **Nhược điểm:** Tốn thêm thời gian, CPU và bộ nhớ để thực hiện sắp xếp.

### c. Z-Ordering / Multi-dimensional Clustering
Khi bạn có nhiều cột cùng quan trọng và cần truy vấn đan xen (ví dụ `x`, `y`, `z`). Nếu chỉ Sort theo `x` rồi `y`, cột `y` sẽ bị phân mảnh. Z-Ordering là một thuật toán sắp xếp đa chiều, đan xen các bit của nhiều cột để bảo tồn tính cục bộ của dữ liệu trên cả nhiều chiều.
* **Ứng dụng:** Delta Lake `OPTIMIZE ... ZORDER BY`.

## 4. Compaction trong Modern Data Lakehouse

Các định dạng bảng mở (Open Table Formats) hiện đại cung cấp các giải pháp Compaction tích hợp sẵn, an toàn (chuẩn ACID) và mạnh mẽ.

### Delta Lake
Delta Lake xử lý Compaction thông qua câu lệnh `OPTIMIZE`.
```sql
-- Bin-packing thông thường
OPTIMIZE events;

-- Compaction kết hợp sắp xếp đa chiều Z-Order
OPTIMIZE events ZORDER BY (user_id, event_type);
```
Sau khi `OPTIMIZE`, các file cũ không bị xóa ngay để đảm bảo an toàn cho các truy vấn đang chạy và hỗ trợ Time Travel. Bạn phải chạy `VACUUM` để dọn rác các file cũ. Từ Databricks Runtime mới hơn, **Liquid Clustering** được giới thiệu để tự động quản lý layout dữ liệu mà không cần chạy Z-Order thủ công thường xuyên.

### Apache Iceberg
Iceberg cung cấp các thủ tục (procedures) Spark để viết lại file dữ liệu thông qua action `RewriteDataFiles`.
```java
// Gọi qua Spark Actions API
SparkActions.get(spark)
  .rewriteDataFiles(table)
  .option("target-file-size-bytes", Long.toString(256 * 1024 * 1024)) // 256 MB
  .execute();
```
Iceberg cho phép định nghĩa nhiều chiến lược: `binpack` (mặc định) và `sort`.

### Apache Hudi
Hudi được thiết kế đặc biệt cho streaming với hai loại bảng (Table Types):
* **Copy-On-Write (COW):** Dữ liệu luôn được ghi đè vào file base (Parquet). Khá tốn kém khi ghi liên tục. Cần Clustering để cấu trúc lại file.
* **Merge-On-Read (MOR):** Tối ưu cho streaming. Dữ liệu mới được ghi vào log files (Avro) kích thước nhỏ. Truy vấn sẽ tự join base file và log files. Hudi có một trình Compaction riêng biệt định kỳ gộp base file (Parquet) và log files (Avro) thành một base file Parquet mới.

Hudi hỗ trợ **Asynchronous Compaction** (chạy ngầm không ảnh hưởng tiến trình ghi) và cung cấp thêm khái niệm **Clustering** (tương tự như Optimize Z-Order của Delta).

## 5. Best Practices khi quản lý Compaction

1. **Kích thước file mục tiêu (Target File Size):** Tùy thuộc vào storage format. Với Parquet trên Data Lake (S3, GCS, ADLS), kích thước 128MB đến 1GB là lý tưởng. Không nên nén quá to (> 2GB) vì có thể làm chậm quá trình đọc song song ở các worker nodes.
2. **Lập lịch (Scheduling):** Compaction là tác vụ nặng về I/O và tính toán. Nếu có thể, hãy lập lịch chạy Compaction (Airflow/Cron) vào các giờ thấp điểm.
3. **Partition-Level Compaction:** Không nên chạy Compaction trên toàn bộ dữ liệu lịch sử nếu không cần thiết. Chỉ tập trung vào các partition mới nhất (ví dụ: partition của hôm nay hoặc hôm qua) vì dữ liệu streaming thường chỉ ghi vào các partition nóng.
4. **Auto-Compaction:** Cân nhắc bật tính năng auto-compaction (ví dụ trong Databricks có `spark.databricks.delta.autoOptimize.autoCompact = true`) nếu resource dư dả, giúp gộp file nhỏ lại ngay trong quá trình write (dù file không to bằng optimize thủ công nhưng vẫn giảm tải đáng kể).
5. **Đi kèm với Dọn dẹp (Vacuum/Expire):** Quá trình Compaction chỉ tạo ra file mới chứ không xóa ngay file cũ do tính chất Immutable của Object Storage và yêu cầu Time Travel. Luôn nhớ lập lịch lệnh `VACUUM` (Delta Lake) hoặc `expire_snapshots` (Iceberg) để dọn file đã obsolete, tiết kiệm chi phí lưu trữ S3.

## Tài Liệu Tham Khảo
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
* [Apache Hudi Compaction Architecture](https://hudi.apache.org/docs/compaction/)
