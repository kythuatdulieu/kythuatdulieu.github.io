---
title: "Loại bỏ trùng lặp - Deduplication"
difficulty: "Beginner"
tags: ["deduplication", "data-quality", "etl", "sql", "bigquery", "snowflake", "databricks"]
readingTime: "25 mins"
lastUpdated: 2026-06-29
seoTitle: "Khử trùng lặp dữ liệu (Deduplication) kiến trúc BigQuery, Snowflake, Databricks"
metaDescription: "Tìm hiểu deduplication là gì. Phân tích kiến trúc khử trùng lặp dữ liệu trong Batch (BigQuery, Snowflake) và Streaming (Databricks) thực chiến."
description: "Deduplication (khử trùng lặp) là kỹ thuật sống còn để loại bỏ các bản ghi nhân đôi trong hệ thống. Khám phá các chiến lược từ SQL Window Functions, MERGE INTO đến Stateful Streaming với Watermarks."
domains: ["DE", "Platform"]
level: "Middle"
---

## Khái Niệm Deduplication (Khử Trùng Lặp)

Trong thế giới của hệ thống phân tán (Distributed Systems) và Data Engineering, **Deduplication** (Khử trùng lặp) không chỉ đơn thuần là việc "xóa dòng trùng". Dưới góc nhìn Staff Engineer, deduplication là cơ chế phòng thủ cốt lõi để duy trì **Data Integrity** (Tính toàn vẹn dữ liệu) khi đối mặt với các bản chất khắc nghiệt của mạng: Network Partitions, Node Failures và giới hạn của định lý CAP.

Bất kỳ hệ thống nào trao đổi dữ liệu qua mạng đều phải tuân theo một trong các Semantics giao nhận (Delivery Semantics). Hầu hết các hệ thống Streaming và Message Broker (như Apache Kafka, RabbitMQ) mặc định cung cấp **At-Least-Once Delivery** (Giao ít nhất một lần) để đảm bảo không mất mát dữ liệu (Zero Data Loss). Sự đánh đổi của At-Least-Once chính là dữ liệu trùng lặp (Duplicates). Vì vậy, Deduplication là mảnh ghép bắt buộc để đạt được lý tưởng **Exactly-Once Processing (EoP)**.

## Tại Sao Dữ Liệu Lại Bị Trùng Lặp? (Root Causes)

Trùng lặp dữ liệu (Data Duplication) hiếm khi là do lỗi cố ý, mà thường xuất phát từ cơ chế tự phục hồi (Resilience) của hệ thống:

1. **Producer Retries (Thử lại từ phía gửi):** Khi Producer gửi một message tới Kafka/Kinesis nhưng gặp Network Timeout và không nhận được ACK. Producer không thể biết message đã được ghi thành công hay chưa, nó buộc phải retry. Kết quả: Message được ghi 2 lần.
2. **Consumer Rebalancing & Unacknowledged Offsets:** Consumer đọc một batch dữ liệu, lưu thành công nhưng Crash (hoặc bị Rebalance) trước khi kịp Commit Offset về Broker. Khi Consumer mới tiếp quản, nó sẽ đọc lại từ Offset cũ.
3. **Application Bugs (Lỗi Client-Side):** Thiếu cơ chế Debounce/Throttling ở Frontend, dẫn đến người dùng click nút "Thanh Toán" 2 lần liên tiếp.
4. **ETL Backfills:** Chạy lại Historical Pipeline mà không có cơ chế **Idempotent** (Không thay đổi trạng thái nếu chạy nhiều lần), dẫn tới việc Append đè lên dữ liệu cũ.

## Các Chiến Lược Deduplication Theo Nền Tảng (Platform-Specific)

### 1. Batch / Data Warehouse (BigQuery & Snowflake)

Với **Snowflake** và **BigQuery**, việc xử lý lô (Batch Processing) là sức mạnh cốt lõi. Trong môi trường này, phương pháp tốt nhất để loại bỏ trùng lặp trên dữ liệu đã ingest là sử dụng **Window Functions** kết hợp với Business Keys.

Trong BigQuery và Snowflake, cú pháp `QUALIFY` kết hợp với `ROW_NUMBER()` là tiêu chuẩn vàng (Gold Standard). Nó giúp code ngắn gọn, không cần dùng CTE (Common Table Expressions) cồng kềnh, và tối ưu Execution Plan.

```sql
-- Dùng QUALIFY trong BigQuery / Snowflake để khử trùng lặp
SELECT 
    event_id,
    user_id,
    event_payload,
    ingested_at
FROM raw_layer.user_events
WHERE date_partition >= CURRENT_DATE() - 7
-- Giữ lại bản ghi mới nhất theo ingested_at cho mỗi event_id
QUALIFY ROW_NUMBER() OVER (
    PARTITION BY event_id 
    ORDER BY ingested_at DESC
) = 1;
```

**Systemic Trade-off (Đánh đổi):** `ROW_NUMBER()` yêu cầu **Network Shuffle** khổng lồ trong Data Warehouse. Quét toàn bộ bảng 10TB để deduplicate tốn kém hơn nhiều so với việc chỉ xử lý giới hạn trong phân vùng (Partition) của những ngày gần nhất.

### 2. Lakehouse Storage: Upsert / MERGE (Databricks Delta & Snowflake)

Thay vì phải chạy lệnh SELECT lọc trùng rườm rà, các kiến trúc Lakehouse hiện đại (Databricks với Delta Lake, hoặc Snowflake với bảng chuẩn) hỗ trợ đưa logic Deduplication xuống tầng lưu trữ thông qua lệnh `MERGE INTO` (Idempotent Writes).

```sql
-- Databricks Delta Lake / Snowflake MERGE INTO
MERGE INTO prod.transactions T
USING staging.new_transactions S
ON T.transaction_id = S.transaction_id
WHEN MATCHED AND S.updated_at > T.updated_at THEN
  UPDATE SET 
    status = S.status, 
    updated_at = S.updated_at
WHEN NOT MATCHED THEN
  INSERT (transaction_id, user_id, amount, status, updated_at)
  VALUES (S.transaction_id, S.user_id, S.amount, S.status, S.updated_at);
```

### 3. Streaming Layer (Databricks Spark Structured Streaming / Flink)

Trong xử lý dòng chảy dữ liệu vô tận (Unbounded Streams), bạn không thể join với toàn bộ lịch sử. Lệnh `MERGE` hay `QUALIFY` không hoạt động tốt trên Stream. Thay vào đó, hệ thống như **Databricks (Spark)** hoặc **Apache Flink** dùng **State Store** để nhớ các ID đã gặp. 

Tuy nhiên, nếu bạn giữ State vĩnh viễn, Job sẽ chết vì Out-Of-Memory (OOM). Khái niệm **Watermarking** ra đời để giải quyết vấn đề này. Dưới đây là cách Databricks Spark Streaming deduplicate data bằng Watermark:

```python
# Spark Structured Streaming (Databricks)
# Giữ state trong 24 giờ. Bất kỳ event_id nào đến trễ hơn 24h sẽ bị drop
deduped_df = streaming_df \
    .withWatermark("event_timestamp", "24 hours") \
    .dropDuplicates(["event_id"])
```

## Real-world Incidents & Troubleshooting [Kinh Nghiệm Thực Chiến]

### 1. Incident: Flink / Spark OOMKilled do State Quá Lớn
**Bối cảnh:** Pipeline streaming deduplicate lượt xem video quảng cáo theo `user_id` và `ad_id`.
**Sự cố:** Các Executors/TaskManagers liên tục bị Kubernetes restart với mã lỗi `OOMKilled`. 
**Root Cause:** Kỹ sư cấu hình state nhưng **quên thiết lập Watermark / State TTL**. Hàng tỷ tổ hợp `user_id + ad_id` được lưu trữ vĩnh viễn trên RocksDB/StateStore tràn ra ngoài disk, làm Disk IOPS chạm trần và gây Crash.
**Khắc phục:** Áp dụng State TTL 48h (ví dụ dùng `.withWatermark()`). Lượt xem quảng cáo thường chỉ bị gửi trùng trong vòng vài giờ đầu do mạng chập chờn, việc giữ state quá lâu để check duplicate là lãng phí tài nguyên khổng lồ.

### 2. Incident: Kafka Consumer Lag Spike do PostgreSQL Upsert
**Bối cảnh:** Ingestion layer đọc từ Kafka và ghi thẳng vào PostgreSQL bằng `INSERT ... ON CONFLICT DO UPDATE` (Upsert).
**Sự cố:** Trong đợt Sale ngày lễ, lưu lượng tăng 10x. Consumer Lag tăng vọt lên hàng triệu messages.
**Root Cause:** PostgreSQL bị lock contention (cạnh tranh khóa) trên Primary Key Index khi có hàng ngàn threads cố gắng thực hiện Upsert đồng thời. IO Disk của DB lên 100%.
**Khắc phục:** Chuyển sang Data Engineering ELT: Tạm thời Consumer chỉ thực hiện Batch Insert (Append-only) vào một bảng RAW tạm thời không có Index (tốc độ cực nhanh). Sau đó dùng dbt chạy batch job 5 phút/lần dùng `QUALIFY ROW_NUMBER()` hoặc `MERGE` để hợp nhất vào bảng chính một cách trơn tru.

## Nguồn Tham Khảo (References)

1. [Databricks Documentation: Drop Duplicates with Watermark][https://docs.databricks.com/en/structured-streaming/delta-lake.html]
2. [Snowflake Documentation: MERGE Command][https://docs.snowflake.com/en/sql-reference/sql/merge]
3. [Exactly-Once Semantics in Apache Flink - Flink Documentation][https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/]
4. [Data Engineering at Scale: Netflix Tech Blog](https://netflixtechblog.com/]
5. **Designing Data-Intensive Applications** - Martin Kleppmann (Chapter 11: Stream Processing)
