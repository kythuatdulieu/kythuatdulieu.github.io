---
title: "Data Loading & Lakehouse Architecture"
difficulty: "Advanced"
tags: ["data-loading", "elt", "upsert", "delta-lake", "iceberg", "hudi"]
readingTime: "30 mins"
lastUpdated: 2026-06-29
seoTitle: "Data Loading: Kỹ thuật ETL/ELT & Kiến trúc Lakehouse (Delta/Iceberg)"
metaDescription: "Tìm hiểu kiến trúc Data Loading hiện đại. Các chiến lược nạp dữ liệu (Overwrite, Append, Upsert) và sự trỗi dậy của Open Table Formats (Iceberg, Delta Lake)."
description: "Data Loading là chốt chặn cuối cùng trong quy trình ETL/ELT. Khám phá cách các Big Tech như Netflix, Uber tối ưu hóa quá trình nạp hàng Petabyte dữ liệu bằng kiến trúc Lakehouse."
domains: ["DE", "Platform"]
level: "Senior"
---

Data Loading (Tải/Nạp dữ liệu) là chữ "L" cuối cùng và quan trọng nhất trong kiến trúc **ETL/ELT**. Ở góc độ Data Engineering, đây không đơn thuần là việc gọi lệnh `INSERT` vài dòng dữ liệu vào Database. Với Scale hàng trăm triệu đến hàng tỷ rows mỗi ngày, Data Loading là bài toán tối ưu hóa I/O mạng, quản lý Memory/CPU bottleneck, và đảm bảo tính nguyên vẹn dữ liệu (Idempotency) trên Data Warehouse / Data Lake.

Hơn thế nữa, phương pháp Data Loading đã trải qua một cuộc tiến hóa lớn. Từ những Data Lake "dump-and-pray" (đổ dữ liệu vào thư mục và cầu nguyện nó không hỏng), chúng ta đang bước vào kỷ nguyên của **Lakehouse Architecture** với các định dạng bảng mở (Open Table Formats) như Apache Iceberg, Delta Lake và Apache Hudi.

---

## 1. Sự Tiến Hóa Của Kiến Trúc Storage

Khác với cơ sở dữ liệu giao dịch (OLTP) sử dụng Row-based storage ưu tiên lệnh `INSERT` đơn lẻ, các hệ thống phân tích (OLAP/Data Warehouse) yêu cầu **Bulk Loading** (Ghi theo lô) thông qua Columnar Formats (như Parquet, ORC) để tối ưu hóa Throughput.

### Vấn đề của Data Lake Truyền Thống
Trước năm 2019, việc nạp dữ liệu vào Data Lake (HDFS/S3) gặp phải các vấn đề chí mạng:
- **Không có ACID Transactions:** Nếu một Job Spark ghi 100 file Parquet bị chết giữa chừng ở file thứ 50, Data Lake sẽ chứa 50 file rác. User query vào sẽ nhận kết quả sai.
- **Không thể Update/Delete:** Để cập nhật 1 dòng dữ liệu (ví dụ khách hàng đổi địa chỉ), bạn phải đọc toàn bộ Partition hàng chục GB lên RAM, sửa 1 dòng, và ghi đè lại toàn bộ Partition đó. Rất đắt đỏ.
- **Hiệu năng quét file chậm:** Quá trình List file trên S3/HDFS rất chậm khi thư mục có hàng trăm ngàn file (Small File Problem).

### Giải pháp: Lakehouse / Open Table Formats
Để giải quyết bài toán Data Loading khổng lồ, các Big Tech đã tạo ra một lớp Metadata (Siêu dữ liệu) nằm trên tầng Object Storage vật lý:
- **Apache Iceberg (Netflix):** Thiết kế độc lập với Engine tính toán (Engine-agnostic), tối ưu cực tốt cho Data Lake khổng lồ đa công cụ (Presto, Spark, Flink). Iceberg theo dõi dữ liệu ở mức độ file (File-level tracking) thay vì directory.
- **Delta Lake (Databricks):** Tối ưu hóa sâu sắc cho Apache Spark, mang lại các tính năng như Time Travel (du hành thời gian) và Schema Evolution.
- **Apache Hudi (Uber):** Sinh ra để giải quyết bài toán Streaming Ingestion và Incremental Upserts (Cập nhật tăng dần) với độ trễ cực thấp.

---

## 2. Systemic Trade-offs: Latency vs. Throughput

Kiến trúc Data Loading luôn xoay quanh việc đánh đổi giữa **Độ trễ (Latency)** và **Thông lượng (Throughput)**. 

*   **Batch Processing (High Throughput, High Latency):** Phù hợp với Reporting/Analytics nội bộ. Dữ liệu được gom thành các Parquet files khổng lồ (128MB - 512MB) trước khi nạp vào Warehouse. I/O cực kì tối ưu nhưng dữ liệu có thể bị trễ (staleness) vài giờ.
*   **Micro-batch / Continuous Streaming (Low Latency, Variable Throughput):** Phù hợp với Fraud Detection, Real-time Personalization. Đánh đổi bằng chi phí Compute đắt đỏ (cụm chạy 24/7) và nguy cơ rác hóa Storage bằng hàng triệu file nhỏ.

```mermaid
quadrantChart
    title Data Loading Architectures
    x-axis Low Latency --> High Latency
    y-axis Low Throughput --> High Throughput
    quadrant-1 Batch Optimized
    quadrant-2 Anti-Pattern
    quadrant-3 Event-Driven
    quadrant-4 Stream Optimized
    "Snowpipe / Auto Loader": [0.3, 0.8]
    "Kafka to ClickHouse": [0.1, 0.9]
    "Daily dbt / Airflow Job": [0.8, 0.9]
    "Transactional INSERT": [0.1, 0.2]
```

---

## 3. Các Chiến Lược Nạp Dữ Liệu Thực Chiến

### 3.1. Full Overwrite (Tải Toàn Bộ / Ghi Đè)
**Cơ chế:** Xóa sạch dữ liệu (Truncate/Drop) ở bảng đích (Target Table) và thay thế bằng toàn bộ Dataset mới. 
**Khi nào dùng:** Kích thước bảng nhỏ (Dimension tables < 1GB) hoặc logic Transform quá phức tạp để theo dõi sự thay đổi (CDC).

```sql
-- Snowflake Full Overwrite pattern (Atomic Swap)
BEGIN;
-- 1. Tạo bảng tạm và load dữ liệu mới (Không ảnh hưởng user đang query)
CREATE TRANSIENT TABLE dim_users_staging AS 
SELECT * FROM raw.users;

-- 2. Đổi tên nguyên tử (Atomic Swap), Zero-downtime
ALTER TABLE dim_users SWAP WITH dim_users_staging;

-- 3. Xóa bảng cũ
DROP TABLE dim_users_staging;
COMMIT;
```

### 3.2. Incremental Load (Tải Tăng Dần)
Chỉ nạp các bản ghi mới (New) hoặc bị thay đổi (Modified) (Delta data) kể từ lần tải cuối cùng (thường dùng Watermark / Updated_At column).

#### 3.2.1 Append-Only (Insert Only)
Chuyên trị cho Dữ liệu bất biến (Immutable Data) như Events, Logs, Clickstreams. Tối ưu 100% cho Throughput vì hệ thống chỉ việc "nối thêm" file vào cuối bảng mà không cần đọc dữ liệu cũ để đối chiếu.

#### 3.2.2 Upsert / Merge (Update + Insert)
Logic: Kiểm tra Khóa chính (Primary Key). Nếu Tồn tại -> Update, Chưa Tồn tại -> Insert.
Trong hệ thống phân tán, lệnh `MERGE` cực kì đắt đỏ. Dưới Engine (Iceberg/Delta), nó có 2 chiến lược thực thi:
- **Copy-On-Write (CoW):** Tốc độ Đọc cực nhanh, tốc độ Ghi chậm. Phù hợp cho bảng đọc nhiều.
- **Merge-On-Read (MoR):** Ghi đè vào các Delta log nhỏ (Ghi nhanh), nhưng lúc Đọc phải tính toán gộp lại (Đọc chậm). Phù hợp cho Streaming Ingestion.

```sql
-- Cú pháp Databricks / Delta Lake MERGE tiêu chuẩn
MERGE INTO silver.target_orders AS t
USING bronze.source_orders_updates AS s
ON t.order_id = s.order_id
WHEN MATCHED AND t.updated_at < s.updated_at THEN
  UPDATE SET *
WHEN NOT MATCHED THEN
  INSERT *;
```

---

## 4. Tự Động Hóa Kỷ Nguyên Mới: Declarative Ingestion

Các nền tảng Data Engineering hiện đại đang dịch chuyển từ việc viết mã (Imperative) sang khai báo (Declarative). Thay vì dùng Airflow schedule 5 phút 1 lần chạy lệnh `COPY INTO`, kiến trúc chuyển sang mô hình Push-based Event-driven.

Ví dụ với **Databricks Auto Loader** hoặc **Snowflake Snowpipe**: Khi ứng dụng ném 1 file Parquet mới vào AWS S3 bucket, S3 sẽ bắn sự kiện (Event Notification) qua SQS. Auto Loader sẽ hứng event này và tự động Ingest file đó vào Delta Table chỉ trong vài giây, tự động quản lý checkpoint mà không cần bất kì lịch trình (cron job) nào.

---

## 5. Real-world Incidents & Troubleshooting

Dưới đây là các "Bài học xương máu" (Post-mortems) khi vận hành Data Loading ở Scale Petabyte:

### Sự cố 1: Vấn đề "Small File Problem" (Nghẽn cổ chai HDFS/S3)
*   **Triệu chứng:** Pipeline Streaming (Spark/Flink) write dữ liệu liên tục ra Data Lake mỗi 10 giây. Sau 1 tuần, Job truy vấn Athena/Presto chạy mất 1 tiếng cho bảng 10GB.
*   **Root Cause:** 1 triệu file 10KB (total 10GB) sẽ ép NameNode/S3 API phải list file (metadata operations) và open/close network requests nhiều gấp 1000 lần so với 10 file 1GB.
*   **Khắc phục (Fix):**
    *   Tăng buffer time trước khi flush xuống đĩa.
    *   Sử dụng tính năng `Auto Compaction` của Delta/Iceberg. Hoặc cấu hình Job `OPTIMIZE` (Bin-packing) chạy ngầm mỗi đêm để gom các file rác thành Parquet block tối ưu (ví dụ 512MB).

### Sự cố 2: OOMKilled Trong Quá Trình Bulk Load vào RDBMS
*   **Triệu chứng:** Airflow task chạy pandas `to_sql` hoặc Spark DataFrame write bị Kubernetes văng lỗi `OOMKilled` (Exit Code 137).
*   **Root Cause:** Worker/Driver đang cố gắng tải file CSV khổng lồ (20GB) vào RAM trước khi chuyển hóa thành các lệnh `INSERT` đẩy lên Database qua JDBC.
*   **Khắc phục (Fix):** 
    *   **Ngừng dùng ORM/Pandas cho Bulk Data.** 
    *   Lưu dữ liệu xuống Cloud Storage (S3/GCS) và gọi lệnh Bulk Copy Native của Database để nó tự Pull dữ liệu trực tiếp bỏ qua RAM của Worker (ví dụ Postgres `COPY`, Snowflake `COPY INTO`).

### Sự cố 3: "Bóng ma" Dữ Liệu Nhân Đôi (Data Duplication)
*   **Triệu chứng:** Pipeline bị fail lúc 3:00 AM. Kỹ sư tỉnh dậy bấm nút "Retry" trên Airflow. Kết quả là doanh thu báo cáo tăng gấp đôi.
*   **Luật Tối Cao (Golden Rule):** "Pipelines sẽ hỏng, quan trọng là hỏng xong chạy lại phải đạt tính lũy đẳng (Idempotency)".
*   **Khắc phục:** 
    *   Không bao giờ dùng `INSERT` thuần túy nếu Pipeline có khả năng chạy lại.
    *   Luôn dùng `UPSERT/MERGE`.
    *   Hoặc sử dụng mẫu thiết kế [Pattern]: `DELETE` theo `Partition/Execution_Date` trước, rồi mới `INSERT` lại lô dữ liệu đó.

---

## Nguồn Tham Khảo (References)

*   [Netflix Tech Blog: How We Build Apache Iceberg](https://netflixtechblog.com/)
*   [Databricks Blog: Delta Lake vs. Parquet - ACID Transactions](https://databricks.com/blog/2019/04/24/delta-lake-open-source-storage-layer-for-data-lakes.html)
*   [Uber Engineering: Apache Hudi - Streaming Ingestion](https://uber.com/blog/hudi/)
*   Cuốn sách kinh điển: *Designing Data-Intensive Applications* (Martin Kleppmann).
