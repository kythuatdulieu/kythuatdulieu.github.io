---
title: "Data Extraction & CDC"
difficulty: "Beginner"
tags: ["data-extraction", "etl", "incremental-load", "full-load", "cdc", "api"]
readingTime: "15 mins"
lastUpdated: 2026-06-29
seoTitle: "Data Extraction & Change Data Capture (CDC) - Kiến trúc Kỹ thuật"
metaDescription: "Trích xuất dữ liệu (Data Extraction) chuyên sâu. Phân tích kiến trúc Full Load, Incremental Load, Log-based CDC (Debezium), và API Throttling."
description: "Trong quy trình ETL kinh điển, chữ cái đầu tiên 'E' chính là đại diện cho Extraction. Mổ xẻ các kiến trúc trích xuất, đánh đổi hệ thống và sự cố thực chiến."
---

Data Extraction (Trích xuất dữ liệu) không chỉ đơn thuần là "kéo" dữ liệu từ điểm A (Database/API) sang điểm B (Data Lake/Warehouse). Dưới lăng kính của một Staff Data Engineer, Extraction là bài toán kinh điển về **Phân bổ tài nguyên (Resource allocation)**, **Cô lập lỗi (Fault isolation)**, và **Đánh đổi hệ thống (Systemic trade-offs)**. 

Một kiến trúc extraction tồi (ví dụ: quét Full Table trên Master Node) có thể dẫn đến hiệu ứng Domino (Cascading failures), đánh sập toàn bộ hệ thống Database OLTP cốt lõi của doanh nghiệp, và làm đình trệ mọi luồng dữ liệu downstream. 

Mục tiêu tối thượng của Extraction là tối đa hóa **Data Freshness** (Độ trễ thấp nhất có thể) trong khi phải giữ **Impact on Source** (Tác động I/O lên hệ thống nguồn) ở mức gần như bằng Không.

## 1. Phân Loại Theo State Management (Stateful vs. Stateless)

Thay vì chỉ gọi tên theo bề nổi là "Full" hay "Incremental", các kỹ sư hệ thống thường nhìn nhận bài toán trích xuất dưới góc độ quản lý trạng thái (State Management).

### 1.1. Stateless Extraction (Full Load)

Phương pháp brute-force thô bạo nhất. Hệ thống Extraction không thèm lưu trữ bất kỳ trạng thái (state) nào về những gì đã kéo trước đó. Mỗi lần chạy, nó ra lệnh quét toàn bộ bảng (Full Table Scan).

- **Đặc điểm Vật lý:** Khi chạy lệnh `SELECT *`, CSDL nguồn phải lôi toàn bộ dữ liệu từ đĩa cứng (Disk) lên RAM. Điều này gây ra I/O Spikes khổng lồ và làm cạn kiệt bộ nhớ đệm (Buffer Pool / Page Cache) của Database do phải chứa một lượng cực lớn dữ liệu lạnh (cold data).
- **Systemic Trade-off:** Đổi lấy sự cực kỳ đơn giản trong logic code (không cần màng tới deduplication, không sợ schema drift) bằng cái giá là chi phí tài nguyên đắt đỏ và rủi ro sập DB.
- **Luật Thép (Best Practice):** Chỉ dùng Full Load cho Dimension Tables (Bảng danh mục) cực nhỏ (dưới 1 triệu dòng). Và TUYỆT ĐỐI chỉ được trích xuất từ Read Replica, KHÔNG BAO GIỜ chạm vào Primary/Master node.

### 1.2. Stateful Extraction (Incremental / Delta Load)

Hệ thống Extraction bắt buộc phải duy trì một con trỏ trạng thái (Watermark / Cursor) để biết được "điểm dừng" của lần trích xuất trước đó, nhằm chỉ lấy phần dữ liệu mới sinh ra.

#### a. Batch-based High-Watermark (Dựa trên Timestamp/ID)

Phương pháp này dựa vào các trường (columns) như `updated_at` hoặc Auto-increment `ID` để làm Watermark. 

- **Vấn đề 1 (Hard Deletes):** Nếu backend engineer xóa thẳng một record vật lý (DELETE), logic `updated_at > watermark` sẽ mù tịt, không bao giờ bắt được sự kiện xóa đó. Data Warehouse sẽ chứa đầy các "bóng ma" (phantom records).
- **Vấn đề 2 (Clock Skew & Uncommitted Transactions):** Truy vấn `WHERE updated_at > ?` có nguy cơ rò rỉ dữ liệu (Data Loss) cực cao trong môi trường ACID. Nếu có một Long-running transaction mất 5 phút mới commit, nhưng nó lại mang timestamp cũ hơn watermark hiện tại, record đó sẽ bị bỏ sót vĩnh viễn.

```sql
-- Code Thực chiến: Kỹ thuật Overlap Window để chống Clock Skew
-- Trích xuất dư lùi lại một khoảng thời gian (overlap 15 phút) 
-- Sau đó bắt buộc phải xử lý deduplication ở hệ thống đích bằng UPSERT/MERGE
SELECT * 
FROM production.orders 
WHERE updated_at >= (SELECT max_watermark - INTERVAL '15 minutes' FROM pipeline_state)
  AND updated_at < CURRENT_TIMESTAMP;
```

#### b. Log-based Change Data Capture (CDC)

Đây là chuẩn mực công nghiệp (Industry Standard) cho Data Ingestion ở quy mô siêu lớn (Scale). Thay vì liên tục spam câu lệnh `SELECT` (Pull), kiến trúc CDC sẽ "đọc lén" Write-Ahead Log (WAL ở PostgreSQL) hoặc Binlog (MySQL) và tuôn (Stream) mọi sự kiện Data Manipulation Language (DML: Insert, Update, Delete) ra ngoài.

```mermaid
architecture-beta
    group Source("cloud")[VPC: Source System]
    group Streaming("cloud")[VPC: Data Platform]
    group Dest("cloud")[Data Lake / Warehouse]

    service db("database')[Primary DB('PostgreSQL")] in Source
    service replica("database")[Read Replica] in Source
    service debezium("server")[Debezium / Kafka Connect] in Streaming
    service kafka("server")[Apache Kafka / MSK] in Streaming
    service sink("server")[Iceberg / Hudi Sink] in Dest

    db:L -- R:replica
    db:R -- L:debezium
    debezium:R -- L:kafka
    kafka:R -- L:sink
```

- **Ưu điểm tuyệt đối:** 
  - Tác động I/O lên DB gần như vô hình (do chỉ đọc tuần tự các file log nhị phân].
  - Độ trễ cực thấp (Sub-second latency).
  - Bắt được toàn bộ lịch sử thay đổi của 1 dòng dữ liệu (bao gồm cả Hard Deletes).
- **Đánh đổi Hệ thống (Trade-off):** Kiến trúc trở nên cực kỳ phức tạp. Đòi hỏi đội ngũ phải có năng lực vận hành hệ thống phân tán (Kafka, ZooKeeper, KRaft) và phải đối mặt với các bài toán Message Delivery Semantics (At-least-once, Exactly-once).

## 2. Real-world Incidents & Troubleshooting (Kinh Nghiệm Thực Chiến)

Trong môi trường Enterprise, Extraction luôn đi kèm với sự cố. Các kỹ sư tại Fivetran và Airbyte thường xuyên phải xử lý các ca "bệnh" kinh điển sau:

### Incident 1: "OOMKilled" khi Full Load qua API hoặc Database
- **Triệu chứng:** Worker node (Airflow task hoặc Kubernetes pod) bị hệ điều hành tiêu diệt lạnh lùng (OOMKilled - Exit code 137) ngay khi thực thi lệnh `SELECT * FROM massive_table`.
- **Bản chất vật lý:** Application code vô tình nạp toàn bộ ResultSet (hàng chục GB) vào Memory (RAM) của Worker trước khi kịp flush (ghi) ra đĩa cứng hoặc network. JVM hoặc Python Process phình to quá trần RAM của Container.
- **Khắc phục (Troubleshooting):** 
  - Phải sử dụng **Server-side Cursors** (ví dụ: `FETCH FORWARD 1000` trong PostgreSQL).
  - Stream kết quả trực tiếp ra file tạm cục bộ (Chunking) thay vì giữ nó dưới dạng Collection trong RAM.
  - Cắt nhỏ truy vấn (Query Partitioning) theo dải ID (ví dụ: spawn 10 threads, mỗi thread xử lý `WHERE id BETWEEN X AND Y`).

### Incident 2: Consumer Lag trong CDC tăng đột biến
- **Triệu chứng:** Kafka Consumer Lag báo động đỏ. Dữ liệu trên Data Warehouse bị trễ hàng giờ đồng hồ, business user kêu gào.
- **Bản chất vật lý:** Một câu lệnh `UPDATE` hàng loạt (Massive Batch Update - ví dụ: `UPDATE users SET status = 'active'`) được thực thi trên DB nguồn. Chỉ một câu lệnh SQL duy nhất nhưng DB phải ghi ra hàng triệu bản ghi WAL trong vài giây, tạo thành một cơn bão tin nhắn (Message Storm) làm nghẽn cổ chai Debezium connector và Kafka partitions.
- **Khắc phục:**
  - *Ngắn hạn:* Tạm thời tăng số lượng partitions của Kafka Topic và scale-out Consumers để xả lũ.
  - *Dài hạn:* Đưa ra bộ luật (Policy) cấm team Backend thực hiện massive batch updates trực tiếp trên hệ thống OLTP. Yêu cầu họ phải chia nhỏ updates (Chunking) hoặc sử dụng Outbox Pattern.

### Incident 3: API Throttling & Rate Limit (HTTP 429)
- **Triệu chứng:** Pipeline chiết xuất dữ liệu từ các nền tảng SaaS (Salesforce, Shopify, Zendesk) liên tục báo lỗi HTTP 429 (Too Many Requests).
- **Khắc phục:** Không được Retry ngay lập tức. Phải triển khai thuật toán **Exponential Backoff with Jitter** (Lùi bước theo hàm mũ có nhiễu ngẫu nhiên) để tránh hiện tượng Thundering Herd (bầy đàn tháo chạy) làm sập API của đối tác.

```python
# Code Thực chiến: Thuật toán Retry chống Throttling bằng Python
import time, random, requests

def fetch_with_backoff(url, max_retries=5):
    for attempt in range(max_retries):
        response = requests.get(url)
        
        if response.status_code == 200:
            return response.json()
            
        elif response.status_code == 429: # Too Many Requests
            # Exponential backoff: 2, 4, 8, 16 giây... 
            # Cộng thêm Jitter (nhiễu ngẫu nhiên 0-1s) để các worker không retry cùng 1 lúc
            sleep_time = (2 ** attempt) + random.uniform(0, 1)
            print(f"Bị API giới hạn. Lùi bước và thử lại sau {sleep_time:.2f} giây...")
            time.sleep(sleep_time)
            
        else:
            response.raise_for_status()
            
    raise Exception("Max retries exceeded. Extraction Failed.")
```

## 3. Infrastructure as Code (Cấu Hình Thực Tế)

Dưới đây là cấu hình tham khảo (Terraform & YAML) cho các thành phần trích xuất CDC.

### 3.1. Cấu hình Debezium Connector (YAML)
Một cấu hình Debezium chuẩn phải luôn chú ý đến vấn đề Snapshot (Quét dữ liệu nền ban đầu trước khi bắt đầu stream WAL log).

```yaml
# Cấu hình Debezium triển khai qua Strimzi Operator trên Kubernetes
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaConnector
metadata:
  name: prod-inventory-connector
spec:
  class: io.debezium.connector.postgresql.PostgresConnector
  tasksMax: 1  # PostgreSQL CDC luôn chỉ có 1 task để đảm bảo đúng thứ tự log
  config:
    database.hostname: "production-db.internal"
    database.port: "5432"
    database.user: "debezium_user"
    database.password: "${secrets:db_password}"
    database.dbname: "inventory"
    topic.prefix: "cdc_prod"
    
    # Plugin xuất log (Ưu tiên dùng pgoutput có sẵn của PostgreSQL >= 10)
    plugin.name: "pgoutput"
    
    # QUAN TRỌNG: Ngăn chặn Debezium áp đặt Table Lock làm sập DB khi đang Snapshot
    snapshot.mode: "initial" 
    snapshot.isolation.mode: "read_committed"
```

### 3.2. Triển khai AWS DMS (Terraform)
Thay vì tự quản lý Debezium và Kafka, nhiều công ty dùng AWS Database Migration Service (DMS) như một giải pháp Managed CDC giá rẻ.

```hcl
# Code Thực chiến: Terraform thiết lập AWS DMS Replication Task để lấy CDC từ RDS sang S3
resource "aws_dms_replication_task" "cdc_to_s3_lake" {
  migration_type           = "cdc" # Chế độ chỉ stream thay đổi (Change Data Capture)
  replication_task_id      = "prod-db-cdc-pipeline"
  replication_instance_arn = aws_dms_replication_instance.main.replication_instance_arn
  source_endpoint_arn      = aws_dms_endpoint.source_rds.endpoint_arn
  target_endpoint_arn      = aws_dms_endpoint.target_s3.endpoint_arn

  # Áp dụng Rule chọn lọc bảng thay vì ôm đồm toàn bộ Database
  table_mappings = jsonencode({
    rules = [
      {
        rule-type = "selection"
        rule-id   = "1"
        rule-name = "include-sales-tables"
        object-locator = {
          schema-name = "public"
          table-name  = "orders_%" # Lọc theo tiền tố
        }
        rule-action = "include"
      }
    ]
  })
}
```

## 4. Lời Khuyên Từ Staff Engineer

1. **"Do Not Build Your Own Connectors" [Đừng tự code kịch bản kết nối]:** Trừ khi đó là một API nội bộ đặc thù của công ty. Đối với các SaaS nổi tiếng (Salesforce, Zendesk, Stripe) hay Databases chuẩn, hãy xuống tiền dùng các Managed Services như **Airbyte Cloud** hoặc **Fivetran**. Việc bảo trì hàng tá đoạn script Python API khi Schema/API version của đối tác thay đổi liên tục là một cơn ác mộng vận hành (Maintenance Nightmare).
2. **Nguyên tắc Tính Lũy Đẳng (Idempotency):** Mọi Pipeline extraction phải tuân thủ nghiêm ngặt tính Idempotent. Nghĩa là, nếu Data Job bị crash ở phút thứ 45 và phải chạy lại từ đầu, kết quả dữ liệu cuối cùng ở hệ thống đích vẫn phải chính xác tuyệt đối như thể job đã thành công hoàn hảo trong 1 lần chạy (Không rác, không duplicate). 
3. **Phòng thủ Schema Evolution (Biến đổi cấu trúc):** Khi kỹ sư backend tự ý xóa một cột hoặc đổi kiểu dữ liệu (từ `INT` sang `VARCHAR`) ở Database nguồn, CDC pipeline của bạn có bị crash không? Hãy luôn sử dụng **Schema Registry** (như Confluent Schema Registry cho Kafka) để quản lý hợp đồng dữ liệu (Data Contracts) và duy trì tính tương thích (Forward/Backward Compatibility).

## Nguồn Tham Khảo (References)

1. [Netflix TechBlog: DBLog - A Watermark Based Change-Data-Capture Framework][https://netflixtechblog.com/dblog-a-generic-change-data-capture-framework-699705b0d00]
2. [Uber Engineering: Data Mesh and Ingestion at Scale][https://www.uber.com/en-US/blog/architecture-data-mesh/]
3. Thiết kế Hệ thống Dữ liệu Chuyên sâu (Designing Data-Intensive Applications - Martin Kleppmann) - Phân tích chi tiết về Replication Logs và CDC.
4. [Airbyte Architecture: Open-source Data Integration Platform][https://airbyte.com/blog]
5. [Debezium Official Documentation - PostgreSQL Connector](https://debezium.io/documentation/reference/stable/connectors/postgresql.html]
