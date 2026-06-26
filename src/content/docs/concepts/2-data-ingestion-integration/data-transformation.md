---
title: "Data Transformation"
difficulty: "Intermediate"
tags: ["data-transformation", "etl", "elt", "data-cleansing", "sql", "dbt", "pyspark"]
readingTime: "20 mins"
lastUpdated: 2026-06-16
seoTitle: "Data Transformation - Nghệ thuật làm sạch và biến đổi dữ liệu"
metaDescription: "Tìm hiểu chi tiết Data Transformation (Biến đổi dữ liệu): kỹ thuật làm sạch, chuẩn hóa, gộp bảng, dbt, Spark và áp dụng business logic trong Data Warehouse."
description: "Nếu coi dữ liệu thô (raw data) giống như dầu thô vừa được khai thác từ lòng đất, thì **Data Transformation (Biến đổi dữ liệu)** chính là quá trình lọc hóa để tạo ra các sản phẩm tinh chế và hữu ích nhất cho doanh nghiệp."
---

Dưới góc nhìn của một Staff Data Engineer, Data Transformation (Biến đổi dữ liệu) không đơn thuần là việc viết các câu lệnh `SELECT`, `JOIN` hay `GROUP BY`. Ở quy mô hàng trăm Terabyte hoặc Petabyte, Transformation là bài toán hệ thống phức tạp xoay quanh việc quản lý tài nguyên phân tán (Distributed Compute), xử lý trạng thái (State Management), đánh đổi giữa độ trễ và thông lượng (Latency vs. Throughput trade-offs), và đảm bảo tính lũy đẳng (Idempotency) trong môi trường dễ xảy ra lỗi.

---

## 1. Kiến trúc Hệ thống: ETL, ELT và EtLT

Cuộc chiến giữa ETL (Extract, Transform, Load) và ELT (Extract, Load, Transform) đã ngã ngũ với phần thắng nghiêng về ELT trong kỷ nguyên Cloud Data Warehouse (Snowflake, BigQuery). Tuy nhiên, trên thực tế tại các hệ thống lớn, kiến trúc thường mang hình hài lai tạo: **EtLT**.

- **ETL Truyền thống:** Phù hợp với các luồng dữ liệu nhạy cảm (PII/PHI) cần được mask/hash ngay tại Ingestion Gateway trước khi lưu trữ, hoặc khi cần lọc rác (filtering) ở mức Network layer để giảm chi phí băng thông.
- **ELT (Modern Data Stack):** Tận dụng kiến trúc Massively Parallel Processing (MPP). Tuy nhiên, rủi ro lớn nhất là **Compute Cost Spikes** (đội chi phí tính toán) do các câu lệnh SQL kém tối ưu (full table scans, cross joins).
- **Tiêu chuẩn Kỹ thuật (EtLT):** Sử dụng `t` (tiểu transform) ở tầng Streaming/Ingestion để chuẩn hóa schema, xử lý timezone, parsing JSON sang dạng cột (Columnar format); sau đó dùng `T` (đại transform) trên Data Warehouse để xử lý Business Logic phức tạp.

---

## 2. Medallion Architecture (Kiến trúc Huy chương)

Để duy trì tính toàn vẹn và khả năng audit, Databricks và cộng đồng Data Engineering áp dụng Medallion Architecture. Kiến trúc này tách bạch rõ ràng vòng đời của dữ liệu.

```mermaid
graph TD
    subgraph "Ingestion Sources"
        Kafka["Apache Kafka / Kinesis"]
        S3["S3 / GCS Data Lake"]
    end

    subgraph "Medallion Architecture("Transform")"
        Bronze["(Bronze Layer <br> Raw / Append-Only)"]
        Silver["(Silver Layer <br> Cleansed / Conformed)"]
        Gold["(Gold Layer <br> Aggregated / Business)"]
    end

    subgraph "Compute Engines"
        Spark["Apache Spark / Flink <br> Stateful Streaming"]
        DBT["dbt / SQL <br> Batch DAGs"]
    end

    Kafka -->|Streaming / Micro-batch| Bronze
    S3 -->|Batch Copy| Bronze

    Bronze -->|Schema Validation & Deduplication| Silver
    Silver -->|Denormalization & Joins| Gold

    Spark -.->|Data Skew Handling| Silver
    DBT -.->|Idempotent Materialization| Gold
```

### Nguyên tắc Thiết kế (Design Principles):
1. **Bronze (Raw):** Dữ liệu phải được giữ nguyên bản (Immutable & Append-Only). Tuyệt đối không thay đổi giá trị. Điều này cho phép "Time Travel" và Backfilling khi logic ở tầng Silver/Gold thay đổi.
2. **Silver (Cleansed/Conformed):** Áp dụng Schema Enforcement, Deduplication, SCD (Slowly Changing Dimensions) Type 2. Chuyển đổi định dạng timestamp về UTC.
3. **Gold (Curated):** Cấu trúc theo Star Schema hoặc OBT (One Big Table). Tối ưu hóa hoàn toàn cho độ trễ đọc (Read Latency) của BI Dashboards hoặc ML Feature Stores.

---

## 3. Streaming vs. Batch Transformation: Trade-offs & Incidents

Quyết định chọn Batch hay Streaming không dựa vào buzzword mà dựa trên **SLA (Service Level Agreement)** của business.

### 3.1. Batch Processing (Apache Spark / dbt)
- **Trade-off:** Tối ưu hóa **Throughput (Thông lượng)** và **Cost-Efficiency** nhưng hy sinh **Latency (Độ trễ)** (thường từ vài giờ đến 1 ngày).
- **Incident Phổ biến: OOMKilled (Out of Memory) do Data Skew.**
  Khi một khóa (key) trong tập dữ liệu lớn bất thường (ví dụ: `user_id = NULL` hoặc `tenant_id` của khách hàng lớn nhất), toàn bộ dữ liệu của key đó sẽ được dồn vào một Executor/Partition duy nhất trong quá trình Shuffle (JOIN hoặc GROUP BY). Điều này gây ra hiện tượng Garbage Collection pauses kéo dài và cuối cùng là crash container (OOMKilled).
- **Giải pháp thực chiến (Salting Pattern):**

```python
# PySpark: Mitigating OOMKilled by handling Data Skew with Salting
from pyspark.sql.functions import rand, col, concat, lit, explode, array

# 1. Thêm một giá trị ngẫu nhiên (Salt) vào key bị lệch
df_skewed = df_skewed.withColumn("salted_key", concat(col("key"), lit("_"), (rand() * 10).cast("int")))

# 2. Nhân bản bảng Dimension (broadcast nếu nhỏ, hoặc explode nếu lớn) lên 10 lần
df_dimension = df_dimension.withColumn("salt", explode(array([lit(i) for i in range(10)]))) \
                           .withColumn("salted_key", concat(col("key"), lit("_"), col("salt")))

# 3. Thực hiện Join phân tán tải đều trên các cluster
df_joined = df_skewed.join(df_dimension, on="salted_key", how="left")
```

### 3.2. Streaming Processing (Apache Flink / Kafka Streams)
- **Trade-off:** Tối ưu **Sub-second Latency** nhưng đối mặt với sự phức tạp cực cao của **State Management** và rủi ro mất mát/trùng lặp dữ liệu (Exactly-once semantics).
- **Incident Phổ biến: Consumer Lag (Độ trễ tiêu thụ).**
  Khi logic Transformation trong Kafka Consumer (ví dụ: gọi external API để enrich data) quá chậm, Consumer Lag sẽ tăng vọt, gây tràn memory buffer ở phía Broker và dẫn đến re-balancing liên tục (Stop-the-world).
- **Giải pháp:** Theo bài học từ Netflix (Alpakka Kafka), cần triển khai **Back-pressure (Áp lực ngược)**. Nếu downstream xử lý chậm, tín hiệu sẽ đẩy ngược lên upstream để giảm tốc độ poll data, thay vì poll liên tục và gây quá tải (OutOfMemoryError) tại memory của worker.

---

## 4. Patterns Trong Transformation

### 4.1. Idempotency (Tính Lũy Đẳng)
Nguyên tắc cốt lõi của mọi pipeline: `f(f(x)) = f(x)`. Nếu DAG chạy lại (retry) 5 lần do lỗi network, dữ liệu không được phép nhân lên 5 lần.
Sử dụng `MERGE` (Upsert) kết hợp Watermarking thay vì `INSERT` thuần túy.

```sql
-- Pattern Idempotent Merge trên Snowflake / BigQuery
MERGE INTO target_table t
USING staging_table s
ON t.user_id = s.user_id
WHEN MATCHED AND t.updated_at < s.updated_at THEN 
  UPDATE SET 
    t.email = s.email,
    t.updated_at = s.updated_at
WHEN NOT MATCHED THEN 
  INSERT (user_id, email, updated_at)
  VALUES (s.user_id, s.email, s.updated_at);
```

### 4.2. Slowly Changing Dimensions (SCD Type 2)
Theo dõi lịch sử thay đổi của hệ thống (Ví dụ: trạng thái đơn hàng). `dbt` cung cấp tính năng Snapshots tuyệt vời để xử lý bài toán này mà không cần viết các câu lệnh SQL Window Functions phức tạp.

```yaml
# Cấu hình dbt_project.yml cho SCD Type 2
snapshots:
  my_project:
    target_schema: snapshots
    strategy: timestamp
    updated_at: updated_at
    unique_key: order_id
```

### 4.3. Quản lý Rác và Lỗi: Dead Letter Queues (DLQ)
Data Transformation không bao giờ được phép làm sập pipeline (Fail-fast) nếu chỉ có 1 row bị lỗi parse JSON. Tại production, bạn cần bắt exception và đẩy row lỗi vào một DLQ (ví dụ: lưu vào một bucket S3 `s3://data-lake/dlq/`) để Data Quality team phân tích sau, trong khi vẫn cho phép các records hợp lệ đi qua.

---

## 5. Kiểm Soát Chất Lượng & Data Contracts

Ở quy mô tổ chức lớn, "Rác vào, Rác ra" (Garbage In, Garbage Out). Transformation layer không thể gánh trách nhiệm dọn dẹp liên tục các Schema changes từ phía Software Engineers.
- **Data Contracts (Hợp đồng Dữ liệu):** Bắt buộc các services upstream phải đăng ký schema (thông qua Confluent Schema Registry hoặc Protobuf/Thrift). Mọi vi phạm schema sẽ bị block ngay tại producer, ngăn chặn dữ liệu hỏng xâm nhập vào Bronze layer.
- **Circuit Breakers (Cầu dao tự ngắt):** Sử dụng các công cụ như Great Expectations hoặc dbt tests. Nếu tỷ lệ NULL của cột `revenue` vượt quá 5%, tự động ngắt luồng Transformation để tránh làm bẩn bảng Dashboard của CEO.

```yaml
# dbt test: Circuit Breaker
models:
  - name: fct_orders
    columns:
      - name: revenue
        tests:
          - not_null
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0
              max_value: 1000000
```

---

## 6. Lựa Chọn Công Cụ: Sự Cân Nhắc Của Staff Engineer

- **dbt (Data Build Tool):** Lựa chọn số 1 cho batch ELT. Mang tư duy Software Engineering (CI/CD, DRY principles với Jinja macros, Testing) vào thế giới SQL. Thích hợp khi compute engine của bạn là Snowflake hoặc BigQuery.
- **Apache Spark (PySpark/Scala):** Phù hợp khi bạn cần xử lý unstructured data, thực hiện complex NLP/Machine Learning Feature Engineering ngay trong lúc biến đổi, hoặc khi chi phí Cloud Data Warehouse quá cao và bạn muốn tự quản lý ephemeral compute clusters (ví dụ: EMR, Databricks).
- **Apache Flink:** Trái tim của Stateful Streaming. Sử dụng khi bài toán yêu cầu độ trễ mili-giây, tính toán Windowing phức tạp (Sliding, Tumbling, Session windows) và quản lý state lên tới hàng Terabyte.

---

## Nguồn Tham Khảo (References)

* **Fundamentals of Data Engineering** - Joe Reis & Matt Housley.
* **Designing Data-Intensive Applications** - Martin Kleppmann (Must-read về State, Replication & Partitioning).
* [The dbt Viewpoint - What is Data Transformation?](https://www.getdbt.com/analytics-engineering/transformation/)
* [AWS Architecture Blog - Design Patterns for Data Transformation](https://aws.amazon.com/blogs/architecture/)
* [Databricks Blog - What is a Medallion Architecture?](https://www.databricks.com/glossary/medallion-architecture)
* [Netflix Tech Blog - Handling Consumer Lag and Stateful Streaming](https://netflixtechblog.com/)
