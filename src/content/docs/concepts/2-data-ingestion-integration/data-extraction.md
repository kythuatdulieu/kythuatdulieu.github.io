---
title: "Data Extraction"
difficulty: "Beginner"
tags: ["data-extraction", "etl", "incremental-load", "full-load", "cdc", "api"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Data Extraction - Các phương pháp trích xuất dữ liệu"
metaDescription: "Trích xuất dữ liệu (Data Extraction) là gì? Tìm hiểu các kỹ thuật trích xuất phổ biến như Full Load, Incremental Load, API và Database Log (CDC)."
description: "Trong quy trình [ETL](/concepts/2-data-ingestion-integration/etl)/[ELT](/concepts/2-data-ingestion-integration/elt) kinh điển, chữ cái đầu tiên '**E**' chính là đại diện cho **Extraction (Trích xuất dữ liệu)**. Khai thác dữ liệu từ các hệ thống nguồn là bước đầu tiên và quan trọng nhất trong mọi hệ thống Data Engineering."
---

Data Extraction (Trích xuất dữ liệu) không chỉ đơn thuần là "kéo" dữ liệu từ điểm A sang điểm B. Dưới góc nhìn của một Staff Data Engineer, đây là bài toán về **phân bổ tài nguyên (resource allocation)**, **cô lập lỗi (fault isolation)**, và **đánh đổi hệ thống (systemic trade-offs)**. Một thiết kế extraction tồi có thể dẫn đến cascading failures, đánh sập hệ thống production cốt lõi (OLTP) và làm đình trệ toàn bộ downstream pipelines.

Mục tiêu tối thượng của Extraction là tối đa hóa Data Freshness (độ trễ thấp) trong khi giữ Impact on Source (tác động lên hệ thống nguồn) ở mức tối thiểu.

---

## 1. Phân Loại Theo State Management (Stateful vs. Stateless Extraction)

Thay vì chỉ phân chia theo Full/Incremental, chúng ta cần nhìn nhận dưới góc độ quản lý trạng thái (State).

### 1.1. Stateless Extraction (Full Load)

Phương pháp brute-force. Hệ thống không lưu trữ bất kỳ trạng thái (state) nào về những gì đã trích xuất. Mỗi lần chạy là một lần quét toàn bộ bảng (Full Table Scan).

*   **Đặc điểm Kỹ Thuật:** Gây ra I/O Spikes và lock contention lớn trên CSDL nguồn. Thường làm cạn kiệt Buffer Pool/Page Cache của Database do đọc một lượng lớn dữ liệu lạnh (cold data).
*   **Systemic Trade-off:** Đổi lấy sự đơn giản trong logic (không cần xử lý deduplication, schema drift xử lý dễ hơn) bằng chi phí tài nguyên cực kỳ đắt đỏ.
*   **Best Practice:** Chỉ dùng cho Dimension Tables cực nhỏ hoặc Initial Snapshot. Luôn chạy trên Read Replica, KHÔNG BAO GIỜ chạy trên Primary/Master node.

### 1.2. Stateful Extraction (Incremental/Delta Load)

Hệ thống phải duy trì một con trỏ trạng thái (Watermark/Cursor) để biết được điểm dừng của lần trích xuất trước.

#### a. Batch-based High-Watermark (Dựa trên Timestamp/ID)

Sử dụng `updated_at` hoặc Auto-increment `ID`. 

*   **Vấn đề:** 
    *   **Hard Deletes:** Nếu record bị xóa vật lý, logic `updated_at > watermark` sẽ không bao giờ bắt được sự kiện xóa. Hệ thống đích sẽ bị "bóng ma" (phantom records).
    *   **Clock Skew & Uncommitted Transactions:** Truy vấn `WHERE updated_at > ?` có thể bị rò rỉ dữ liệu (data loss) nếu có các long-running transactions được commit với timestamp cũ hơn watermark hiện tại.

```sql
-- Ví dụ: Logic trích xuất an toàn hơn với Overlap Window để tránh Clock Skew
-- Trích xuất dư một khoảng thời gian (overlap) và xử lý deduplication ở hệ thống đích (UPSERT/MERGE)
SELECT * 
FROM production.orders 
WHERE updated_at >= (SELECT max_watermark - INTERVAL '15 minutes' FROM pipeline_state)
  AND updated_at < CURRENT_TIMESTAMP;
```

#### b. Log-based Change Data Capture (CDC)

Đây là chuẩn mực công nghiệp (Industry Standard) cho Data Ingestion ở quy mô lớn (như tại Netflix, Uber). Thay vì query trực tiếp (Pull), chúng ta đọc Write-Ahead Log (WAL ở PostgreSQL) hoặc Binlog (MySQL) và stream các thay kiện Data Manipulation Language (DML) ra ngoài (Push).

```mermaid
architecture-beta
    group Source("cloud")[VPC: Source System]
    group Streaming("cloud")[VPC: Data Platform]
    group Dest("cloud")[Data Lake / Warehouse]

    service db("database")[Primary DB("PostgreSQL")] in Source
    service replica("database")[Read Replica] in Source
    service debezium("server")[Debezium / Kafka Connect] in Streaming
    service kafka("server")[Apache Kafka / MSK] in Streaming
    service sink("server")[Iceberg / Hudi Sink] in Dest

    db:L -- R:replica
    db:R -- L:debezium
    debezium:R -- L:kafka
    kafka:R -- L:sink
```

*   **Ưu điểm tuyệt đối:** 
    *   Tác động I/O cực thấp (chỉ đọc sequential log files).
    *   Độ trễ thấp (Sub-second latency).
    *   Bắt được toàn bộ lịch sử thay đổi (kể cả Hard Deletes).
*   **Trade-off:** Kiến trúc cực kỳ phức tạp. Yêu cầu vận hành hệ thống phân tán (Kafka, ZooKeeper/KRaft) và xử lý Semantics phức tạp (At-least-once, Exactly-once delivery).

---

## 2. Real-world Incidents & Troubleshooting (Kinh Nghiệm Thực Chiến)

Trong môi trường Enterprise, Extraction luôn đi kèm với sự cố. Dưới đây là các kịch bản kinh điển:

### Incident 1: "OOMKilled" khi Full Load qua API/Database

*   **Triệu chứng:** Worker node (Airflow/Kubernetes pod) bị hệ điều hành tiêu diệt (OOMKilled - Exit code 137) khi thực hiện lệnh `SELECT * FROM massive_table`.
*   **Root Cause:** Application lưu toàn bộ ResultSet vào Memory trước khi write ra đĩa/network.
*   **Khắc phục:** 
    *   Sử dụng **Server-side Cursors** (ví dụ `FETCH FORWARD 1000` trong PostgreSQL).
    *   Streaming kết quả trực tiếp ra file tạm thay vì nạp vào RAM.
    *   Phân mảnh truy vấn (Query Partitioning) theo dải ID (ví dụ: `WHERE id BETWEEN 1 AND 100000`).

### Incident 2: Consumer Lag trong CDC tăng đột biến

*   **Triệu chứng:** Kafka Consumer Lag báo động đỏ. Dữ liệu trên Data Warehouse bị trễ hàng giờ đồng hồ.
*   **Root Cause:** Một câu lệnh `UPDATE` lớn (Batch Update - ví dụ: `UPDATE users SET status = 'active'`) được thực thi trên DB nguồn. DB ghi ra hàng triệu bản ghi WAL trong vài giây, làm nghẽn Debezium connector và Kafka partitions.
*   **Khắc phục:**
    *   *Short-term:* Tăng số lượng partitions và scale out consumers.
    *   *Long-term:* Yêu cầu team Backend không thực hiện massive batch updates trên hệ thống OLTP. Chia nhỏ updates (chunking) hoặc sử dụng Outbox Pattern.

### Incident 3: API Throttling & Rate Limit (HTTP 429)

*   **Triệu chứng:** Pipeline báo lỗi HTTP 429 (Too Many Requests) khi kéo dữ liệu từ Salesforce/Shopify.
*   **Khắc phục:** Triển khai thuật toán **Exponential Backoff with Jitter** để retry.

```python
# Ví dụ logic Retry chống Throttling bằng Python
import time, random, requests

def fetch_with_backoff(url, max_retries=5):
    for attempt in range(max_retries):
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 429:
            # Exponential backoff: 2, 4, 8, 16... cộng thêm Jitter (nhiễu ngẫu nhiên) để tránh thundering herd
            sleep_time = (2 ** attempt) + random.uniform(0, 1)
            print(f"Throttled. Retrying in {sleep_time:.2f}s...")
            time.sleep(sleep_time)
        else:
            response.raise_for_status()
    raise Exception("Max retries exceeded")
```

---

## 3. Infrastructure as Code (Cấu Hình Thực Tế)

Dưới đây là cấu hình tham khảo (Terraform & YAML) cho các thành phần trích xuất.

### 3.1. Cấu hình Debezium Connector (YAML)

Bản thân cấu hình của Debezium cũng cần lưu ý vấn đề Snapshot (để lấy dữ liệu nền ban đầu trước khi stream log).

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaConnector
metadata:
  name: inventory-connector
spec:
  class: io.debezium.connector.postgresql.PostgresConnector
  tasksMax: 1
  config:
    database.hostname: "production-db.internal"
    database.port: "5432"
    database.user: "debezium_user"
    database.password: "${secrets:db_password}"
    database.dbname: "inventory"
    topic.prefix: "cdc_prod"
    # Plugin xuất log (ưu tiên pgoutput của PostgreSQL >= 10)
    plugin.name: "pgoutput"
    # Quan trọng: Không lock table khi snapshot
    snapshot.mode: "initial" 
    snapshot.isolation.mode: "read_committed"
```

### 3.2. Triển khai AWS DMS (Terraform)

AWS Database Migration Service thường được sử dụng như một giải pháp Managed CDC.

```hcl
# Thiết lập Replication Task để CDC từ RDS sang S3 (Data Lake)
resource "aws_dms_replication_task" "cdc_to_s3" {
  migration_type           = "cdc" # Chỉ lấy thay đổi (Change Data Capture)
  replication_task_id      = "prod-db-cdc"
  replication_instance_arn = aws_dms_replication_instance.main.replication_instance_arn
  source_endpoint_arn      = aws_dms_endpoint.source_rds.endpoint_arn
  target_endpoint_arn      = aws_dms_endpoint.target_s3.endpoint_arn

  table_mappings = jsonencode({
    rules = [
      {
        rule-type = "selection"
        rule-id   = "1"
        rule-name = "1"
        object-locator = {
          schema-name = "public"
          table-name  = "%" # Lấy toàn bộ bảng
        }
        rule-action = "include"
      }
    ]
  })
}
```

---

## 4. Lời Khuyên Từ Staff Engineer

1.  **"Do Not Build Your Own Connectors" (Đừng tự viết Script kết nối):** Trừ khi đó là một API nội bộ đặc thù. Đối với các SaaS (Salesforce, Zendesk, Stripe) hay Databases chuẩn, hãy dùng các công cụ như Airbyte, Fivetran, hoặc AWS DMS. Việc bảo trì hàng chục API integration khi schema/API version thay đổi là một cơn ác mộng (Maintenance Nightmare).
2.  **Idempotency (Tính Lũy Đẳng):** Mọi Pipeline extraction phải idempotent. Nếu job fail ở phút thứ 45 và chạy lại, kết quả cuối cùng ở hệ thống đích phải hoàn toàn giống hệt như job thành công trong 1 lần. 
3.  **Schema Evolution (Biến đổi cấu trúc):** Khi cột bị xóa hoặc đổi kiểu dữ liệu ở Source, CDC pipeline có crash không? Hãy sử dụng Schema Registry (như Confluent Schema Registry cho Kafka) để quản lý tương thích (Forward/Backward Compatibility).

---

## Nguồn Tham Khảo (References)

1.  [Netflix TechBlog: DBLog - A Watermark Based Change-Data-Capture Framework](https://netflixtechblog.com/dblog-a-generic-change-data-capture-framework-699705b0d00)
2.  [Uber Engineering: Data Mesh and Ingestion at Scale](https://eng.uber.com/)
3.  [Martin Kleppmann: Designing Data-Intensive Applications (O'Reilly)](https://dataintensive.net/)
4.  [AWS Architecture Blog: Modern Data Lake Ingestion with CDC](https://aws.amazon.com/blogs/architecture/)
5.  [Debezium Official Documentation](https://debezium.io/documentation/reference/stable/index.html)
