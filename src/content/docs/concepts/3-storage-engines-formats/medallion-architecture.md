---
title: "Kiến trúc Medallion - Thực thi Vật lý và Đánh đổi Hệ thống"
difficulty: "Advanced"
tags: ["medallion-architecture", "data-lakehouse", "bronze", "silver", "gold", "databricks", "streaming", "liquid-clustering"]
readingTime: "12 mins"
lastUpdated: 2026-06-26
seoTitle: "Medallion Architecture: System Design, Trade-offs & Operational Risks"
metaDescription: "Phân tích kiến trúc Medallion (Bronze - Silver - Gold) dưới góc nhìn System Design. Trade-offs, rủi ro vận hành (OOM, Consumer Lag), và cấu trúc vật lý trên Data Lakehouse."
description: "Phân tích chuyên sâu về kiến trúc Medallion dưới góc độ thiết kế hệ thống. Không dừng ở định nghĩa lớp dữ liệu, bài viết mổ xẻ cách thực thi vật lý, các đánh đổi hệ thống (Trade-offs), kỹ thuật tối ưu hóa và cách xử lý các rủi ro vận hành."
---

Lưu trữ dữ liệu vào Data Lake với hy vọng "Schema-on-read" sẽ giải quyết mọi bài toán phân tích đã được chứng minh là một sai lầm kiến trúc (Architectural Anti-pattern). Thiếu vắng tính toàn vẹn giao dịch (ACID) và kiểm soát chất lượng, Data Lake nhanh chóng thoái hóa thành **Data Swamp**.

**Kiến trúc Medallion** (Bronze - Silver - Gold) được Databricks đề xuất như một Design Pattern tiêu chuẩn cho Data Lakehouse. Tuy nhiên, dưới góc độ Kỹ thuật Dữ liệu (Data Engineering), Medallion không chỉ là các thư mục logic. Nó là một pipeline **state machine**, trong đó dữ liệu được luân chuyển, thay đổi trạng thái, làm sạch và tối ưu hóa layout vật lý (Physical Data Layout) qua từng giai đoạn để phục vụ các Workload khác nhau.

---

## 1. Kiến trúc Thực thi Vật lý (Physical Execution)

Trên thực tế, Kiến trúc Medallion hoạt động dựa trên các định dạng bảng mở (Open Table Formats) như Delta Lake, Apache Iceberg hoặc Apache Hudi, kết hợp với các công cụ xử lý phân tán (Apache Spark, Trino).

```mermaid
graph TD
    %% Define Styles
    classDef source fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef bronze fill:#cd7f32,stroke:#333,stroke-width:2px,color:#fff;
    classDef silver fill:#c0c0c0,stroke:#333,stroke-width:2px,color:#000;
    classDef gold fill:#ffd700,stroke:#333,stroke-width:2px,color:#000;
    classDef compute fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px,stroke-dasharray: 5 5;

    subgraph Sources["Data Sources"]
        Kafka["Apache Kafka / Event Streams"]:::source
        OLTP["PostgreSQL / MySQL CDC"]:::source
        API["External APIs / JSON"]:::source
    end

    subgraph Bronze_Layer["Bronze Layer - Raw Landing"]
        BronzeTable["(Delta: Raw Logs)"]:::bronze
    end

    subgraph Silver_Layer["Silver Layer - Cleansed & Conformed"]
        SilverTable["(Delta: Users / Orders)"]:::silver
    end

    subgraph Gold_Layer["Gold Layer - Business Aggregates"]
        GoldTable["(Delta: Daily Sales)"]:::gold
    end

    %% Flow
    Kafka -- "Streaming Ingest("Append Only")" --> BronzeTable
    OLTP -- "Debezium CDC" --> BronzeTable
    API -- "Batch Extract" --> BronzeTable

    BronzeTable -- "Data Cleansing & Deduplication" --> SilverCompute("(Spark Structured Streaming")):::compute
    SilverCompute --> SilverTable

    SilverTable -- "Aggregations / JOINs" --> GoldCompute("(Spark SQL / dbt")):::compute
    GoldCompute --> GoldTable

    %% End Users
    SilverTable -. "Ad-hoc Queries / ML Models" .-> DataScientist("(Data Scientists"))
    GoldTable -. "BI Dashboards("Low Latency")" .-> BI("(Power BI / Tableau"))
```

---

## 2. Đi sâu vào từng Layer: Code và Trade-offs

### 2.1. Bronze Layer: Bức tường lửa của sự thật (Immutable Landing)

Bronze layer không phải là bãi rác. Nó là điểm hạ cánh bảo toàn toàn bộ lịch sử (Historical Archive) và trạng thái thô nguyên bản nhất từ hệ thống nguồn.

- **Đặc tính kỹ thuật:** `Append-only`. Tuyệt đối không thực hiện Update/Delete ở lớp này. Dữ liệu được nạp vào bằng cơ chế streaming liên tục hoặc micro-batches.
- **Physical Layout:** Giữ nguyên schema từ nguồn (thường là một cột chứa payload JSON/Avro thô), kèm theo các metadata của Pipeline như `_ingest_timestamp`, `_kafka_offset`, `_batch_id`.

**Mã giả lập cấu trúc Streaming Ingestion (PySpark):**
```python
# Đọc từ Kafka và ghi Append-only vào Bronze (Delta)
df_raw = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "broker:9092") \
    .option("subscribe", "orders_topic") \
    .load()

# Ghi trực tiếp xuống Bronze với Checkpointing
df_raw.selectExpr("CAST(key AS STRING)", "CAST(value AS STRING) as raw_payload", "timestamp as _ingest_timestamp") \
    .writeStream \
    .format("delta") \
    .option("checkpointLocation", "s3://datalake/checkpoints/bronze_orders") \
    .trigger(processingTime="1 minute") \
    .start("s3://datalake/bronze/orders")
```

**Trade-offs hệ thống:**
- **Storage Cost vs. Auditability:** Việc lưu trữ mọi payload thô vĩnh viễn (kể cả dữ liệu rác) tiêu tốn Storage Cost rất lớn. Bù lại, bạn có khả năng "Time Travel" và **Re-process** (chạy lại toàn bộ logic pipeline từ đầu) nếu phát hiện lỗi logic ở lớp Silver/Gold.

### 2.2. Silver Layer: Single Source of Truth (SSOT)

Dữ liệu di chuyển từ Bronze sang Silver phải trải qua một quá trình khắt khe: Schema Enforcement (ép kiểu), Data Cleansing (loại bỏ Null/Invalid), và Deduplication (khử trùng lặp). Đây là nơi dữ liệu trở thành các Entity mang tính nghiệp vụ (Users, Orders, Transactions).

- **Đặc tính kỹ thuật:** Hỗ trợ CRUD thông qua ACID Transactions. Xử lý Slowly Changing Dimensions (SCD Type 1/2) và Upserts (`MERGE INTO`).
- **Physical Layout:** Dữ liệu được parse từ chuỗi thô thành các cột tường minh (Columnar). Tối ưu hóa đọc/ghi cân bằng thông qua Partitioning hoặc **Liquid Clustering**.

**Xử lý SCD Type 2 bằng SQL MERGE (Delta Lake):**
```sql
-- Cập nhật dữ liệu vào bảng Silver, xử lý trùng lặp và ghi nhận thay đổi (Upsert)
MERGE INTO silver.customers target
USING (
  SELECT * FROM (
    -- Lấy record mới nhất từ Bronze nếu có trùng lặp trong cùng 1 batch
    SELECT *, ROW_NUMBER() OVER(PARTITION BY customer_id ORDER BY _ingest_timestamp DESC) as rn
    FROM bronze.customers_raw
    WHERE _ingest_timestamp > (SELECT MAX(_ingest_timestamp) FROM silver.watermarks)
  ) WHERE rn = 1
) source
ON target.customer_id = source.customer_id
WHEN MATCHED AND target.hash_diff != source.hash_diff THEN
  UPDATE SET *
WHEN NOT MATCHED THEN
  INSERT *;
```

### 2.3. Gold Layer: Tiêu thụ độ trễ thấp (Low-Latency Consumption)

Gold layer không chứa dữ liệu chi tiết của toàn doanh nghiệp, mà chứa dữ liệu đã được **Aggregated** (tổng hợp), **Denormalized** (phi chuẩn hóa - Star Schema), và sẵn sàng phục vụ cho các BI Dashboard yêu cầu SLA phản hồi dưới 1 giây.

- **Đặc tính kỹ thuật:** Read-heavy. Hạn chế tối đa các phép `JOIN` phức tạp khi truy vấn. Dữ liệu thường được overwrite định kỳ hoặc sử dụng Materialized Views.
- **Physical Layout:** Tối ưu hóa cực độ cho việc đọc (Read-Optimized). 

**Sử dụng Z-Ordering và Liquid Clustering:**
Trong các kiến trúc cũ, Kỹ sư dữ liệu phải đoán trước cột nào sẽ được filter nhiều nhất trên Dashboard để thiết lập `PARTITION BY`. Tuy nhiên, với dữ liệu thay đổi, Partitioning cứng nhắc gây ra vấn đề Skew. Databricks đã giới thiệu **Liquid Clustering** để thay thế `Z-ORDER` và Partitioning truyền thống.

```sql
-- Thay vì: CREATE TABLE gold.sales PARTITIONED BY (region_id)
-- Sử dụng Liquid Clustering cho phép cluster linh hoạt trên nhiều cột
CREATE TABLE gold.daily_sales_by_region (
    region_id STRING,
    sales_date DATE,
    total_revenue DECIMAL(18,2)
)
USING DELTA
CLUSTER BY (region_id, sales_date);

-- Hệ thống tự động Re-cluster dưới nền mà không cần viết lại toàn bộ file
OPTIMIZE gold.daily_sales_by_region;
```

---

## 3. Rủi ro Vận hành & Trouble-shooting (Operational Risks)

Kiến trúc Medallion không tự động giải quyết mọi vấn đề. Dưới đây là các "cái bẫy" kiến trúc (Anti-patterns) và Bottlenecks thường gặp:

### 3.1. Rủi ro Tràn Bộ Nhớ (JVM OOMKilled) tại lớp Silver
**Vấn đề:** Khi join dữ liệu từ nhiều luồng Bronze để tạo ra Silver entity (ví dụ: enrich sự kiện Order với thông tin User), hoặc khi thực hiện Deduplication trên các khung thời gian (windows) lớn. Nếu Dữ liệu bị Skew (một `customer_id` có hàng triệu sự kiện), node thực thi (Executor) trong Spark sẽ vượt quá bộ nhớ cấp phát và bị HĐH tiêu diệt (OOMKilled).
**Khắc phục:** 
- Bật `Adaptive Query Execution (AQE)` trong Spark để xử lý Skew Joins tự động.
- Tránh thực hiện Broadcast Join nếu bảng Dimension quá lớn (vượt quá `spark.sql.autoBroadcastJoinThreshold`).
- Áp dụng Stateful Streaming với Watermarking cẩn thận để dọn dẹp state trên RAM: `.withWatermark("eventTime", "2 hours")`.

### 3.2. Hiện tượng Consumer Lag & Bão Retry (Retry Storms)
**Vấn đề:** Khi Streaming dữ liệu từ Kafka vào Bronze, nếu logic Transformation quá nặng hoặc I/O ghi xuống Object Storage bị thắt cổ chai, Spark Consumer không thể theo kịp tốc độ sản xuất dữ liệu của Kafka. Số lượng message tồn đọng (Lag) tăng vọt.
**Khắc phục:**
- Tách bạch (Decouple) hoàn toàn Bronze và Silver. Luồng Ingest từ Kafka vào Bronze **TUYỆT ĐỐI** không chứa bất kỳ logic biến đổi nặng nào (chỉ cast type và ghi xuống). Đẩy mọi logic nặng sang luồng Bronze -> Silver.
- Tuning thông số `maxOffsetsPerTrigger` trong Spark Streaming để kiểm soát kích thước Micro-batch, tránh việc một batch quá lớn làm sập Cluster.

### 3.3. Phân mảnh file nhỏ (The Small File Problem)
**Vấn đề:** Việc ghi Streaming liên tục (mỗi 1 phút) vào Bronze/Silver sẽ tạo ra hàng vạn file Parquet có kích thước winy (vài KB) trên S3/GCS. Khi BI tool truy vấn lớp Gold hoặc Silver, `Network Shuffle` và I/O Overhead để mở metadata của hàng nghìn file sẽ làm query mất hàng chục phút.
**Khắc phục:**
- Chạy các Job `OPTIMIZE` định kỳ (Bin-packing) để gom các file nhỏ thành các file lớn (khoảng 1GB - 2GB).
- Sử dụng tính năng `Auto Optimize` (Auto Compaction) của Delta Lake.

---

## 4. Tổng kết Trade-offs của Kiến trúc

| Tiêu chí | Điểm mạnh (Pros) | Điểm yếu (Cons) |
| :--- | :--- | :--- |
| **Độ trễ (Latency)** | Hỗ trợ Streaming E2E với độ trễ thấp (vài giây/phút) từ nguồn đến Dashboard. | Cấu trúc nhiều tầng (Multi-hop) tạo độ trễ tích lũy so với việc chọc trực tiếp vào Replicas DB. |
| **Chi phí (Cost)** | Compute và Storage được tách biệt hoàn toàn. Lưu trữ S3 rẻ hơn nhiều so với Data Warehouse truyền thống. | Lưu trữ dữ liệu dư thừa ở 3 lớp (Data Duplication). Đòi hỏi chính sách Data Retention nghiêm ngặt. |
| **Quản trị (Governance)** | Rõ ràng về ranh giới trách nhiệm. Có thể Replay/Backfill dữ liệu dễ dàng từ Bronze. | Phức tạp trong việc thiết lập Data Lineage và truy vết lỗi xuyên suốt các tầng. |

Tóm lại, Medallion Architecture là sự đánh đổi giữa **Sự phức tạp trong luồng dữ liệu** để đổi lấy **Khả năng kiểm soát chất lượng, khả năng mở rộng và khả năng tái sử dụng** dữ liệu ở cấp độ doanh nghiệp.

---

## Nguồn Tham Khảo
- [What is a Medallion Architecture? - Databricks Official](https://www.databricks.com/glossary/medallion-architecture)
- [Liquid Clustering for Delta Lake - Databricks Blog](https://www.databricks.com/blog/2023/04/18/liquid-clustering-delta-lake.html)
- [Data Lakehouse Architecture and Medallion Pattern - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/azure-databricks-modern-analytics-architecture)
- *Designing Data-Intensive Applications (Chapter 10: Batch Processing, Chapter 11: Stream Processing) - Martin Kleppmann*
- [Spark Structured Streaming Programming Guide - Apache Spark Docs](https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html)
