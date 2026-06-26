---
title: "Backfill"
difficulty: "Beginner"
tags: ["backfill", "etl", "data-pipeline", "data-engineering", "orchestration"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Backfill trong Kỹ thuật Dữ liệu - Chiến lược xử lý và cập nhật dữ liệu lịch sử"
metaDescription: "Khái niệm Backfill là gì trong Data Engineering? Các trường hợp cần chạy quy trình backfill lịch sử, thách thức và chiến lược xử lý hiệu quả với Airflow, dbt."
description: "Backfill là quá trình xử lý, cập nhật hoặc khôi phục dữ liệu cho một khoảng thời gian trong quá khứ. Đây là một tác vụ quan trọng và diễn ra thường xuyên trong Kỹ thuật Dữ liệu."
---

Trong môi trường phân tán (Distributed Systems) và xử lý dữ liệu quy mô lớn, **Backfill** (hay quá trình tái cấu trúc trạng thái lịch sử - Historical State Reconciliation) không đơn thuần là việc "chạy lại" (re-run) một Data Pipeline. Tại các hệ thống scale hàng petabyte như Uber hay Netflix, Backfill là một operation class hạng nhất (First-class Operation), đòi hỏi kiến trúc chuyên biệt để đảm bảo tính toàn vẹn dữ liệu (Data Integrity) mà không làm gián đoạn các luồng xử lý thời gian thực (Real-time Ingestion).

Là một Staff Data Engineer, bạn phải nhìn nhận Backfill dưới lăng kính của Systemic Trade-offs: Compute vs. Storage, Latency vs. Throughput, và Online vs. Offline Resource Isolation.

## 1. Backfill Dưới Góc Nhìn Kỹ Thuật Hệ Thống (System Engineering)

**Backfill** là quy trình truy xuất, biến đổi và nạp lại dữ liệu lịch sử (Historical Data) để đưa Data Warehouse / Data Lake về trạng thái (State) mong muốn, sau khi có sự thay đổi về Logic nghiệp vụ (Business Logic), Cấu trúc lược đồ (Schema Evolution), hoặc để khắc phục sự cố dữ liệu (Data Corruption).

Trong các Data Pipeline hiện đại, dữ liệu được nạp theo kiểu **Incremental** (Tăng dần - ví dụ: Lambda/Kappa Architecture). Việc chỉ xử lý Delta (dữ liệu mới) tối ưu chi phí, nhưng đặt ra bài toán phức tạp khi cần thay đổi hồi tố (Retroactive Changes) trên toàn bộ Time-series Data của nhiều năm trước.

### 1.1. Các Triggers Kích Hoạt Backfill
- **Data Contract Violation & Schema Evolution:** Thêm dimension/feature mới cho Machine Learning Models (ví dụ: backfill cột `LTV` trong 3 năm).
- **Bug Fixes & Algorithmic Restatements:** Lỗi trong UDF (User Defined Function) tính sai metrics, yêu cầu xóa và tính toán lại (Restatement).
- **Late-arriving Events (Out-of-order Data):** Xử lý Watermarks trễ trong Flink/Spark Streaming. Sự kiện đến muộn sau khi cửa sổ thời gian (Time Window) đã đóng, đòi hỏi backfill định kỳ để đảm bảo tính Exactly-Once.
- **Data Migration:** Chuyển đổi kiến trúc (ví dụ: từ kho dữ liệu On-premise sang Apache Iceberg / Delta Lake).

## 2. Kiến Trúc Cô Lập Tài Nguyên (Resource Isolation Architecture)

Khi thực hiện Backfill ở scale lớn (vài TB đến PB), bạn không được phép sử dụng chung Compute Cluster với Production. Quá trình quét lại toàn bộ dữ liệu lịch sử (Full Table Scan) sẽ tiêu tốn I/O, Network Bandwidth và phá vỡ SLA của các luồng Real-time.

```mermaid
graph TD
    subgraph "Production("Online") Environment"
        K["Kafka / Kinesis Topic"] -->|Streaming("Delta")| F1["Production Spark/Flink Cluster"]
        F1 -->|Micro-batch / Append| DL["(Data Lakehouse - Iceberg/Hudi)"]
    end

    subgraph "Backfill("Offline") Environment"
        S3["S3 / GCS Cold Storage"] -->|Batch Read("High Throughput")| F2["Transient Backfill Cluster"]
        F2 -->|Static Partition Overwrite| DL
    end

    style F1 fill:#e6ffe6,stroke:#333,stroke-width:2px
    style F2 fill:#ffe6e6,stroke:#333,stroke-width:2px
    
    DL -.->|Metadata Sync| C["Data Catalog"]
```

### Infrastructure-as-Code (Terraform) cho Transient Backfill Cluster
Để tối ưu chi phí, các công ty lớn (như Uber, Databricks) áp dụng mô hình **Ephemeral Compute**. Dưới đây là đoạn mã Terraform thiết lập một Transient EMR Cluster cấu hình Memory-Optimized (R5 instances) để xử lý Shuffle dữ liệu lịch sử khổng lồ:

```hcl
resource "aws_emr_cluster" "backfill_cluster" {
  name          = "transient-historical-backfill"
  release_label = "emr-6.10.0"
  applications  = ["Spark", "Hudi"]

  # Master node cho Orchestration
  master_instance_group {
    instance_type = "m5.xlarge"
  }
  
  # Core nodes chuyên dụng cho Backfill, ưu tiên RAM để tránh OOM khi Shuffle
  core_instance_group {
    instance_type  = "r5.8xlarge"
    instance_count = 20
  }
  
  # Tự động hủy sau khi Backfill Job hoàn tất để tiết kiệm Compute Cost
  auto_termination_policy {
    idle_timeout = 3600
  }
}
```

## 3. Các Chiến Lược & Patterns Trong Backfill

### 3.1. Tính Không Thay Đổi (Idempotency) & Static Partition Overwrite
Backfill script **bắt buộc** phải là Idempotent (chạy 1 hay 100 lần kết quả vẫn không đổi). Tuyệt đối không dùng `INSERT INTO`. Pattern tiêu chuẩn được khuyến nghị là **Static Partition Overwrite**.

Ví dụ với Spark SQL / Delta Lake:
```sql
-- Thay thế hoàn toàn phân vùng (Partition) lịch sử thay vì UPDATE từng dòng
-- Pattern này giảm lock contention và ngăn ngừa duplicate data
INSERT OVERWRITE TABLE datamart.events_fact
PARTITION (dt)
SELECT 
    event_id,
    user_id,
    complex_ml_udf(payload) AS processed_payload,
    dt
FROM raw_zone.raw_events
WHERE dt BETWEEN '2022-01-01' AND '2023-12-31';
```

### 3.2. Chuyển Đổi Nguồn Dữ Liệu (Source Switching) trong Stream-Processing
Trong hệ thống Streaming (ví dụ Kafka + Flink), Kafka không được thiết kế để lưu trữ dữ liệu vĩnh viễn (Retention Period thường là 7 ngày). Khi cần backfill 2 năm, bạn không thể đọc từ Kafka.
**Giải pháp kiến trúc (thường dùng tại Uber):** Tái sử dụng cùng một logic code Flink, nhưng đổi Source từ Kafka sang S3 (Cold Storage) và chuyển Runtime Mode sang BATCH.

```yaml
# flink-backfill-conf.yaml
execution:
  # Chuyển từ STREAMING sang BATCH để tối ưu throughput thay vì latency
  runtime-mode: BATCH 
  checkpointing:
    # Tắt Checkpointing vì Batch Job có thể retry toàn bộ nếu fail
    interval: 0
pipeline:
  watermark-interval: 0ms
```

### 3.3. Chunking & Windowing (Chia Nhỏ Window)
Thay vì ném toàn bộ truy vấn 5 năm vào một Job (điều này chắc chắn sẽ gây `OOMKilled`), chúng ta dùng Airflow để chia nhỏ cửa sổ (Chunking).

```python
# Airflow DAG for Controlled Backfill
from airflow.models.dag import DAG
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from datetime import datetime

with DAG(
    dag_id="historical_backfill_events",
    schedule_interval="@daily",
    start_date=datetime(2021, 1, 1),
    end_date=datetime(2023, 1, 1),
    catchup=True, # Kích hoạt Backfill tự động theo từng ngày
    max_active_runs=10 # Tránh DDoS hệ thống nguồn (Concurrency Limit)
) as dag:

    # Job sẽ chạy độc lập cho từng execution_date
    backfill_task = SparkSubmitOperator(
        task_id="spark_backfill_chunk",
        application="s3://scripts/backfill_events.py",
        application_args=[
            "--target_date", "{{ ds }}"
        ]
    )
```

## 4. Systemic Trade-offs trong Backfill

- **Latency vs. Throughput:** Production Pipeline ưu tiên độ trễ thấp (Low Latency). Backfill Pipeline ưu tiên băng thông (Max IOPS/Throughput). Do đó, cấu hình engine xử lý (Spark/Flink) trong 2 môi trường này phải chuyên biệt hóa (ví dụ: tắt checkpoint, tăng Batch size cho Backfill).
- **Compute Cost vs. Data Freshness:** Khi thực hiện Reverse Backfilling (Backfill từ hiện tại lùi dần về quá khứ), đòi hỏi thiết lập DAG phức tạp, nhưng Data Analyst/Science sẽ có dữ liệu gần nhất để sử dụng ngay lập tức (Time-to-Value). Sự đánh đổi ở đây là Công sức kỹ thuật (Engineering Effort) lấy Giá trị kinh doanh (Business Value).
- **In-place Mutation vs. Immutable Overwrite:** Dùng `MERGE` có thể linh hoạt giữ lại các cột cũ không bị tác động, nhưng cực kỳ tốn chi phí I/O (Read-on-Write). Dùng `INSERT OVERWRITE` trên Data Lake (Iceberg/Hudi) nhanh và an toàn hơn nhiều (nhờ cơ chế Copy-on-Write hoặc MVCC).

## 5. Real-world Incidents & Troubleshooting (Kinh Nghiệm Thực Chiến)

### 🚨 Incident 1: `OOMKilled` (Out Of Memory) Do Data Skew
- **Triệu chứng:** Khi backfill dữ liệu lịch sử 3 năm, Spark Executors liên tục bị `OOMKilled` và container restart không ngừng.
- **Root Cause (Nguyên nhân):** Phân phối dữ liệu lịch sử không đồng đều (Data Skew). Ví dụ những ngày siêu sale (Black Friday) có lượng traffic gấp 50 lần ngày thường, gây phình to bộ nhớ Shuffle tại một vài Task Partitions.
- **Mitigation (Khắc phục):** 
  - Kích hoạt Adaptive Query Execution (AQE) trong Spark 3.x (`spark.sql.adaptive.enabled=true`) để tối ưu lại kích thước Partition khi runtime.
  - Cấu hình Salting Keys trước khi thực hiện `GROUP BY` hoặc `JOIN` trên khối dữ liệu siêu lớn.
  - Provision Transient Cluster với Memory (RAM) lớn hơn (chuyển sang R-class instances thay vì C-class).

### 🚨 Incident 2: Consumer Lag Spikes (Tắc Nghẽn Streaming)
- **Triệu chứng:** Kích hoạt quá trình backfill làm cho các hệ thống Real-time Pipeline khác báo động (Alert) `High Consumer Lag` hoặc Kafka Broker Alert.
- **Root Cause (Nguyên nhân):** Backfill Job vô tình dùng chung Network Interface / IOPS của Storage Cluster, hoặc chia sẻ cùng một Broker Cluster với Production, làm cạn kiệt tài nguyên (Resource Starvation/Noisy Neighbor).
- **Mitigation (Khắc phục):**
  - **Quy tắc Vàng:** Không bao giờ đọc dữ liệu Backfill từ Primary OLTP Database hoặc Operational Kafka. Hãy đọc từ Read Replicas, hoặc tốt nhất là từ Datalake Cold Storage (S3/GCS).
  - Thiết lập QoS / Rate Limiting chặt chẽ ở tầng Network hoặc cấu hình Fair Scheduler Pool trong Spark/YARN.

## Nguồn Tham Khảo (References)

1. [Uber Engineering: Data Lake Processing with Apache Hudi](https://www.uber.com/en-VN/blog/hudi-meetup-2021/)
2. [Netflix TechBlog: Maestro - Netflix’s Workflow Orchestrator](https://netflixtechblog.com/maestro-netflixs-workflow-orchestrator-15104dfc9497)
3. [Databricks: Incremental Data Processing with Auto Loader and Delta Lake](https://www.databricks.com/blog/2020/02/24/introducing-databricks-ingest-easy-data-ingestion-into-delta-lake.html)
4. *Designing Data-Intensive Applications* - Martin Kleppmann (Chương 11: Stream Processing - Idempotence & State Reconciliation).
