---
title: "Log-based CDC Internals"
difficulty: "Advanced"
readingTime: "25 mins"
lastUpdated: 2026-06-16
seoTitle: "Log-based CDC Internals: Cách Hoạt Động Của WAL, Binlog và Debezium"
metaDescription: "Tìm hiểu chi tiết cơ chế hoạt động bên dưới của Log-based CDC, cách các công cụ như Debezium đọc Write-Ahead Log (WAL) để bắt các thay đổi dữ liệu."
description: "Khám phá chuyên sâu cơ chế của Log-based Change Data Capture (CDC). Phân tích cách đọc Write-Ahead Log (WAL), Binlog và kiến trúc của Debezium để xây dựng pipeline dữ liệu thời gian thực."
---

Thay vì liên tục query database và làm cạn kiệt tài nguyên I/O (Query-based CDC), **Log-based Change Data Capture (CDC)** tận dụng chính cơ chế transaction logging nội tại của Database Engine để capture thay đổi dữ liệu theo thời gian thực. Phương pháp này mang lại low-latency streaming pipeline, giảm thiểu tải (zero-impact) trên Primary Database, và đảm bảo 100% tính nguyên vẹn (consistency) của data.

Bài viết này đi sâu vào internals (bên dưới engine) của Log-based CDC, từ cơ chế Write-Ahead Log (WAL), transaction parsing, đến việc vận hành Debezium trên production ở quy mô lớn (scale) với góc nhìn của một Data Engineer.

---

## 1. Bản Chất của Transaction Logs (WAL / Binlog)

Bất kỳ hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) nào tuân thủ ACID đều không ghi (flush) data trực tiếp vào các table data files trên đĩa ngay lập tức. Hành động này (random I/O) sẽ giết chết performance. Thay vào đó, chúng sử dụng **Sequential I/O** để ghi các thay đổi vào một append-only log file trước khi commit transaction.

*   **PostgreSQL**: Write-Ahead Log (WAL)
*   **MySQL**: Binary Log (Binlog) và InnoDB Redo Log
*   **Oracle**: Redo Log

### Cơ Chế Fsync và Độ Trễ (Latency)
Độ trễ của CDC phụ thuộc trực tiếp vào cách Database engine flush log xuống đĩa. Ví dụ, trong MySQL, tham số `sync_binlog` quyết định bao lâu hệ thống gọi `fsync()`.
*   `sync_binlog=1`: An toàn nhất (ACID strictest), nhưng I/O penalty cao nhất. Mỗi transaction commit đều trigger fsync.
*   `sync_binlog=0` hoặc `>1`: OS quyết định lúc nào flush. Tăng throughput nhưng risk mất data khi host crash.

Hệ thống Log-based CDC (như Debezium) đóng vai trò như một **Replica node giả mạo**, connect trực tiếp vào Primary DB và yêu cầu stream các file log này qua network.

---

## 2. Kiến Trúc End-to-End với Debezium và Kafka

[Debezium](https://debezium.io/) là chuẩn công nghiệp (de-facto standard) cho CDC, chạy như một tập hợp các source connectors trên nền Apache Kafka Connect.

![Debezium Architecture](/images/2-data-ingestion-integration/debezium-architecture.png)
*Hình: Kiến trúc tổng quan của Debezium (Nguồn: Debezium Docs)*

### Luồng Hoạt Động (Data Flow)

Dưới đây là một Mermaid diagram mô tả chi tiết luồng xử lý từ Database đến Data Warehouse:

```mermaid
sequenceDiagram
    participant App as Backend App
    participant PG as PostgreSQL (Primary)
    participant Slot as Logical Replication Slot
    participant DBZ as Debezium Connector (Kafka Connect)
    participant Kafka as Apache Kafka
    participant Sink as Sink Connector (S3/Snowflake)

    App->>PG: BEGIN; UPDATE users...; COMMIT;
    PG->>PG: Ghi WAL (Physical)
    PG->>Slot: Giải mã WAL (wal2json/pgoutput) -> Logical
    Slot-->>DBZ: Stream Logical Events
    DBZ->>DBZ: Transaction Parsing & Event Formatting
    DBZ->>Kafka: Publish Event (Topic: server1.public.users)
    Kafka-->>Sink: Consume Event
    Sink->>Sink: Batching / Parquet Conversion
    Sink->>Sink: Load to Data Warehouse
```

### Các Pha Xử Lý Cốt Lõi:
1.  **Logical Decoding (PostgreSQL-specific)**: WAL lưu trữ physical blocks. CDC cần logical row changes. PostgreSQL cung cấp *Logical Replication Slots* kết hợp với output plugins (như `pgoutput` có sẵn từ PG 10+) để dịch byte arrays thành các sự kiện Insert/Update/Delete.
2.  **Transaction Parsing & Buffering**: Một transaction có thể đổi 10,000 rows. CDC engine phải buffer tất cả các rows này trong memory. Nếu gặp `COMMIT`, nó emit toàn bộ xuống Kafka. Nếu gặp `ROLLBACK`, nó drop buffer.
3.  **Schema Registry Integration**: Để quản lý schema evolution (ví dụ thêm cột mới), Debezium gắn liền với Confluent Schema Registry hoặc Apicurio. Event được serialize sang dạng Avro hoặc Protobuf để tối ưu I/O và đảm bảo backward/forward compatibility.

---

## 3. Cấu Hình Thực Tế (Infrastructure as Code)

Một kỹ sư Staff sẽ không bao giờ click UI để setup CDC. Mọi thứ được định nghĩa qua IaC và YAML manifests.

### Terraform: Provision PostgreSQL cho CDC
Bạn phải config PostgreSQL params chính xác để cho phép replication.
```hcl
resource "aws_db_parameter_group" "pg_cdc_params" {
  name   = "postgres-cdc-params"
  family = "postgres15"

  parameter {
    name  = "rds.logical_replication"
    value = "1"
    apply_method = "pending-reboot"
  }
  parameter {
    name  = "max_replication_slots"
    value = "10"
  }
  parameter {
    name  = "wal_sender_timeout"
    value = "0"
  }
}
```

### Kafka Connect Connector Config (Debezium JSON)
Khi deploy Debezium lên Kafka Connect cluster, chúng ta call REST API với payload sau:
```json
{
  "name": "inventory-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "pg-cluster.internal",
    "database.port": "5432",
    "database.user": "cdc_admin",
    "database.password": "${secretsmanager:cdc_db_pass}",
    "database.dbname": "inventory",
    "topic.prefix": "prod_db",
    "plugin.name": "pgoutput",
    "table.include.list": "public.orders,public.customers",
    "snapshot.mode": "initial",
    "key.converter": "io.confluent.connect.avro.AvroConverter",
    "key.converter.schema.registry.url": "http://schema-registry:8081",
    "value.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter.schema.registry.url": "http://schema-registry:8081"
  }
}
```

---

## 4. Systemic Trade-offs (Đánh Đổi Hệ Thống)

Thiết kế hệ thống phân tán luôn là câu chuyện của trade-offs. CDC không ngoại lệ.

1.  **Latency vs. Throughput**: Nếu cấu hình Kafka producer trong Debezium là `linger.ms = 0` và `batch.size = 1`, bạn được ultra-low latency, nhưng CPU overhead và network calls sẽ bóp nghẹt throughput của Kafka broker. Ngược lại, batching lớn giúp tăng throughput nhưng đẩy P99 latency lên vài giây.
2.  **Exactly-Once vs. At-Least-Once Delivery**: Bỏ qua các marketing terms, Kafka Connect mặc định cung cấp *At-Least-Once*. Nếu worker crash sau khi publish event nhưng trước khi commit offset về Kafka, khi restart nó sẽ đọc lại từ log position cũ. Hệ thống downstream (Data Warehouse / Lakehouse) **phải** được thiết kế để handle idempotency (ví dụ dùng Apache Hudi/Iceberg UPSERTs hoặc SQL MERGE dựa trên Primary Key).
3.  **Storage vs. Availability (Replication Slot Bloat)**: Đây là tử huyệt của Logical Replication. Nếu Debezium bị down, Replication Slot trên DB sẽ kìm hãm không cho DB tự động xóa WAL files cũ (vì sợ mất event). Hậu quả: ổ cứng DB nguồn bị đầy (100% disk) và sập toàn bộ production DB.

---

## 5. Real-world Incidents và Troubleshooting

### Incident 1: Replication Slot Bloat & Database Outage
**Triệu chứng:** Cảnh báo Disk FreeSpace trên RDS Primary giảm đột ngột không ngừng.
**Root Cause:** Kafka Connect cluster bị OOMKilled, container restart loop. Replication slot không có consumer đọc. WAL file phình to hàng chục GB mỗi giờ.
**Fix/Mitigation:** 
- Từ PostgreSQL 13+, cấu hình `max_slot_wal_keep_size`. Nếu vượt quá giới hạn này, DB thà hy sinh replication slot (drop slot) chứ không tự sát vì đầy disk. Debezium sau đó sẽ phải chạy lại snapshot.
- Xóa slot thủ công trong tình huống khẩn cấp: `SELECT pg_drop_replication_slot('debezium_slot');`

### Incident 2: Debezium OOMKilled khi xử lý Transaction khổng lồ
**Triệu chứng:** Pod Debezium liên tục bị kill bởi Kubernetes do vượt quá Memory Limit.
**Root Cause:** Một developer chạy câu lệnh `UPDATE users SET status='inactive' WHERE last_login < '2025-01-01'` ảnh hưởng tới 50 triệu record trong 1 transaction. Debezium buffer toàn bộ 50M records này vào memory để chờ event COMMIT.
**Fix/Mitigation:** 
- Giới hạn size của transaction tại source DB (ví dụ: batch update mỗi 10,000 records).
- Cấu hình Debezium buffer streaming: `max.queue.size` và `max.batch.size` phù hợp. Trong một số engine, Debezium cho phép spill-to-disk (chứa tạm xuống đĩa khi RAM quá đầy).

### Incident 3: Consumer Lag do Schema Evolution
**Triệu chứng:** Event không về Data Warehouse dù DB source vẫn sinh data bình thường.
**Root Cause:** Lệnh `ALTER TABLE ADD COLUMN` được thực thi ở DB gốc. Tuy nhiên, schema registry (Avro) của CDC phát hiện column này không có default value (phá vỡ backward compatibility rules). Connector ném exception và crash.
**Fix/Mitigation:** Xây dựng quy trình CI/CD cho Database Migrations. Đảm bảo mọi Data Definition Language (DDL) changes phải tương thích tiến/lùi (Forward/Backward Compatible).

---

## Nguồn Tham Khảo (References)

1.  [Debezium Architecture Documentation](https://debezium.io/documentation/reference/architecture.html)
2.  [PostgreSQL Logical Decoding Explained](https://www.postgresql.org/docs/current/logicaldecoding-explanation.html)
3.  [AWS Architecture Blog: Real-time CDC pipelines with MSK and Debezium](https://aws.amazon.com/blogs/architecture/implementing-real-time-change-data-capture-with-debezium-for-amazon-aurora-postgresql-and-amazon-rds-for-postgresql/)
4.  Martin Kleppmann (2017), *Designing Data-Intensive Applications*, O'Reilly Media.
5.  Uber Engineering Blog: [Uber’s Real-Time Data Intelligence Platform](https://www.uber.com/en-VN/blog/real-time-data-intelligence/)
6.  Netflix TechBlog: [DBLog: A Watermark Based Change-Data-Capture Framework](https://netflixtechblog.com/dblog-a-generic-change-data-capture-framework-69351fb9099b)
