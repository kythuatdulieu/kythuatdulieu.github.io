---
title: "Incremental Load"
difficulty: "Intermediate"
tags: ["incremental-load", "etl", "data-pipeline", "watermark", "upsert", "cdc"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Incremental Load - Nạp dữ liệu gia tăng tối ưu Data Pipeline"
metaDescription: "Tìm hiểu phương pháp Incremental Load (Nạp gia tăng) trong ETL/ELT: cách sử dụng High Watermark, quản lý trạng thái (State), Change Data Capture (CDC) và khác biệt so với Full Load."
description: "Khi xây dựng Data Pipeline, phương pháp lấy dữ liệu tăng dần (Incremental Load) giúp tối ưu hóa hiệu suất, giảm thiểu chi phí và rút ngắn thời gian xử lý thay vì việc tải toàn bộ dữ liệu (Full Load)."
---

Ở quy mô dữ liệu nhỏ, Full Load (Snapshot toàn bộ dữ liệu định kỳ) là phương pháp an toàn và dễ triển khai nhất. Tuy nhiên, khi hệ thống scale lên hàng Terabyte hoặc Petabyte, việc Full Load trở thành thảm họa về mặt tài nguyên (Compute & Network) và phá vỡ các SLA (Service Level Agreement) về độ trễ dữ liệu (Data Freshness).

**Incremental Load (Nạp dữ liệu gia tăng)** không chỉ đơn thuần là "lấy dữ liệu mới". Dưới lăng kính của một Data Engineer / Staff Engineer, đây là bài toán quản lý trạng thái (State Management), đảm bảo tính lũy đẳng (Idempotency), xử lý sự bất đồng bộ của hệ thống phân tán (Late-arriving data, Clock Skew) và đối mặt với các vấn đề về Schema Evolution.

---

## 1. Kiến Trúc Tổng Thể (System Architecture)

Ngày nay, Incremental Load thường được thiết kế gắn liền với **Medallion Architecture** và **Open Table Formats** (Apache Iceberg, Apache Hudi, Delta Lake) để hỗ trợ ACID transactions ngay trên Data Lake (Transactional Data Lake).

```mermaid
flowchart LR
    subgraph Source["Hệ Thống Nguồn("Source")"]
        DB["(PostgreSQL / MySQL)"]
        API["External APIs"]
    end

    subgraph Ingestion["Tầng Nạp("Ingestion Layer")"]
        Debezium["Debezium CDC"]
        Spark["Spark / Flink"]
    end

    subgraph Lakehouse["Data Lakehouse("Iceberg/Hudi/Delta")"]
        Bronze["(Bronze\nRaw Append)"]
        Silver["(Silver\nUpsert / Deduplicate)"]
        Gold["(Gold\nAggregated)"]
    end

    DB -- WAL / Binlog --> Debezium
    API -- Watermark/Pagination --> Spark
    Debezium -- Kafka Topics --> Spark
    Spark -- Micro-batch / Streaming --> Bronze
    Bronze -- Incremental Compute --> Silver
    Silver -- Incremental Compute --> Gold
```

Sự kết hợp giữa **CDC (Change Data Capture)** và **Open Table Formats** cho phép hệ thống chuyển từ xử lý Batch (tải hàng đêm) sang **Micro-batching** hoặc **Continuous Processing**, mang lại độ trễ thấp (Low Latency) trong khi vẫn duy trì băng thông cao (High Throughput).

---

## 2. Các Mô Hình Incremental Load (Incremental Load Patterns)

### 2.1. Dựa trên State / High-water mark (Query-based)

Phương pháp kinh điển nhất: Pipeline lưu lại một **High-water mark** (thường là timestamp `updated_at` hoặc auto-increment `id`) từ lần chạy trước (Checkpointing). Lần chạy tiếp theo chỉ query các bản ghi có giá trị lớn hơn mốc này.

**Code Example (SQL Extraction):**
```sql
-- Trích xuất dữ liệu dựa trên High-water mark với Lookback window
SELECT * 
FROM production.orders
WHERE updated_at >= '2026-06-25T00:00:00Z' - INTERVAL 2 HOUR;
```
*(Lưu ý: Luôn có `INTERVAL 2 HOUR` làm **Lookback window** để bắt các transaction bị treo hoặc commit chậm do Clock Skew giữa các node trong Database).*

**Systemic Trade-offs:**
*   **Pros:** Dễ cài đặt, không cần động chạm vào infrastructure của DB nguồn.
*   **Cons:** Không bắt được **Hard Deletes** (xoá cứng). Gây tải (Compute/IOPS) lên DB nguồn nếu bảng không được đánh index (Index) đúng cách trên cột `updated_at`.

### 2.2. Change Data Capture (Log-based CDC)

Kỹ thuật tiêu chuẩn ở quy mô enterprise (Uber, Netflix). Thay vì query DB, Ingestion Layer đọc trực tiếp từ **Transaction Log** (WAL của PostgreSQL, Binlog của MySQL, Oplog của MongoDB). 

**Code Example (Debezium Kafka Connector JSON):**
```json
{
  "name": "inventory-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres.production.internal",
    "database.port": "5432",
    "database.server.name": "dbserver1",
    "plugin.name": "pgoutput",
    "table.include.list": "public.orders,public.customers",
    "snapshot.mode": "initial"
  }
}
```

**Systemic Trade-offs:**
*   **Pros:** Bắt được mọi DML (Insert, Update, Delete) với độ trễ tính bằng mili-giây (Sub-second latency). Hoàn toàn không gây tải tính toán lên Query Engine của DB nguồn.
*   **Cons:** Tăng tính phức tạp của hạ tầng (cần vận hành Kafka, Schema Registry, Debezium). Dễ gặp sự cố rác log (Log bloat) nếu Consumer bị sập, khiến DB nguồn không thể dọn dẹp WAL.

---

## 3. Quản lý trạng thái tại Đích (Target State Management)

Việc lấy được dữ liệu gia tăng (Delta) mới chỉ là 50% bài toán. Đưa lượng Delta này vào Target (Data Warehouse / Lakehouse) đòi hỏi chiến lược xử lý đụng độ (Conflict Resolution) và Idempotency.

### Dbt Incremental Model & MERGE (UPSERT)
Trong kiến trúc hiện đại, công cụ như `dbt` quản lý cực tốt các logic này. Dưới mui xe (Under the hood), nó sử dụng lệnh `MERGE` để Upsert dữ liệu.

**Mã thực tế (dbt model config):**
```yaml
{{
    config(
        materialized='incremental',
        unique_key='order_id',
        incremental_strategy='merge',
        partition_by={
            "field": "created_at",
            "data_type": "timestamp",
            "granularity": "day"
        }
    )
}}

SELECT 
    order_id,
    user_id,
    status,
    updated_at
FROM {{ source('raw', 'orders') }}
{% if is_incremental() %}
  -- Chỉ xử lý dữ liệu mới để giảm Compute Cost
  WHERE updated_at > (SELECT max(updated_at) FROM {{ this }})
{% endif %}
```

---

## 4. Systemic Trade-offs (Sự đánh đổi Hệ thống)

Khi thiết kế Incremental Pipelines, Staff Engineer phải liên tục cân bằng giữa các yếu tố:

1.  **Latency vs. Throughput (Độ trễ vs. Băng thông):** 
    *   **Streaming (Flink):** Latency cực thấp, nhưng Throughput/Cost ratio không hiệu quả khi tải lên Data Lake (hiện tượng "Small Files Problem").
    *   **Micro-batching (Spark Structured Streaming):** Cân bằng tốt hơn. Gom dữ liệu mỗi 5-15 phút để optimize Parquet file sizes.
2.  **Storage Cost vs. Compute Cost:** 
    Lưu trữ toàn bộ CDC event log (Append-only) tốn Storage nhưng rẻ về Compute. Việc liên tục Compaction (Gộp file) và Upsert (Merge on Read / Copy on Write) để cập nhật Snapshot cuối cùng sẽ tốn rất nhiều Compute (Ví dụ: Databricks OPTIMIZE, Iceberg Compaction).
3.  **Delivery Semantics:**
    *   **At-least-once (Ít nhất một lần):** Có thể sinh ra dữ liệu trùng lặp (Duplicates). Bắt buộc lớp Transform (Silver Layer) phải có logic Deduplication vững chắc.
    *   **Exactly-once (Chính xác một lần):** Rất đắt đỏ để setup (Two-phase commits trong Kafka/Flink) và giảm Throughput đáng kể.

---

## 5. Real-world Incidents & Troubleshooting (Xử lý Sự cố Thực tế)

Vận hành Incremental Load ở quy mô lớn chắc chắn sẽ đụng độ các sự cố hạ tầng:

*   **Consumer Lag (Độ trễ Consumer):** 
    *   **Hiện tượng:** Tốc độ nạp (Ingest) chậm hơn tốc độ DB nguồn tạo ra transaction. Kafka Consumer Lag tăng vọt.
    *   **Xử lý:** Tăng số lượng partitions trong Kafka và scale-out số lượng Worker/Executors của Spark/Flink. Tối ưu hoá logic xử lý (Tránh các UDF nặng trong quá trình Ingest).
*   **OOMKilled (Out Of Memory):**
    *   **Hiện tượng:** Khi hệ thống bị ngừng (downtime) vài giờ, lúc bật lại, lô dữ liệu (Batch) tải gia tăng quá lớn, vượt quá RAM của Executor.
    *   **Xử lý:** Cấu hình giới hạn kích thước Batch (Ví dụ: `maxOffsetsPerTrigger` trong Spark, hoặc `max_bytes` trong Kafka Consumer) để ép hệ thống chia nhỏ backlog thành nhiều Micro-batch.
*   **Schema Drift (Trôi dạt lược đồ):**
    *   **Hiện tượng:** Team Backend drop/alter một cột trên DB nguồn, pipeline CDC crash ngay lập tức vì schema không khớp.
    *   **Xử lý:** Tích hợp **Schema Registry** (Avro/Protobuf) và kích hoạt tính năng **Schema Evolution** trên Iceberg/Delta Lake. Đảm bảo có quy trình "Backward Compatibility" nghiêm ngặt.
*   **Re-bootstrapping / Backfill:**
    *   **Hiện tượng:** Logic tầng Silver sai, cần chạy lại toàn bộ dữ liệu (Backfill) của 2 năm qua.
    *   **Xử lý:** Bắt buộc duy trì khả năng truy cập vào dữ liệu Raw (Bronze) dưới dạng Append-only. Xoá checkpoint và replay lại toàn bộ luồng dữ liệu hoặc trigger một chiến lược Full Load tạm thời xen kẽ.

---

## 6. Nguồn Tham Khảo (References)

1.  **Netflix Technology Blog:** [How Netflix Uses Apache Iceberg for Incremental Processing](https://netflixtechblog.com/) - Cách Netflix quản lý metadata khổng lồ để tránh Full Table Scans.
2.  **Uber Engineering:** [Apache Hudi - Transactional Data Lakes](https://eng.uber.com/) - Tư duy đằng sau kiến trúc nạp dữ liệu gia tăng độ trễ thấp của Uber (Low-latency Upserts).
3.  **Databricks Architecture:** [Medallion Architecture & Delta Lake Change Data Feed](https://www.databricks.com/blog/) - Chuẩn mực xây dựng Lakehouse.
4.  **AWS Architecture Blog:** [Design log-based CDC architectures with AWS DMS and Apache Iceberg](https://aws.amazon.com/blogs/architecture/)
5.  **Designing Data-Intensive Applications (Martin Kleppmann):** Chương 11 (Stream Processing) và Chương 10 (Batch Processing).
