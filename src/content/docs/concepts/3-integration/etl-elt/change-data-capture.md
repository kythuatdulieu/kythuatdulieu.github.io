---
title: "Thu thập dữ liệu thay đổi - Change Data Capture (CDC)"
category: "ETL / ELT"
difficulty: "Advanced"
tags: ["cdc", "data-extraction", "streaming", "debezium", "kafka"]
readingTime: "15 mins"
lastUpdated: 2026-06-12
definition: "Change Data Capture (CDC) là tập hợp các công nghệ và mẫu thiết kế nhằm tự động phát hiện, nắm bắt các thay đổi dữ liệu (Insert, Update, Delete) tại nguồn gần như ngay lập tức để đồng bộ sang đích."
seoTitle: "Change Data Capture (CDC) - Giải pháp đồng bộ dữ liệu thời gian thực"
metaDescription: "Tìm hiểu công nghệ Change Data Capture (CDC) là gì. Cách lấy dữ liệu từ Transaction Log (Binlog/WAL) bằng Debezium để tạo Data Pipeline thời gian thực."
---

Trong thế giới dữ liệu hiện đại, việc đưa ra quyết định dựa trên dữ liệu cũ của ngày hôm qua đã không còn đủ sức cạnh tranh. Các doanh nghiệp cần biết ngay lập tức khi nào một giao dịch mới được tạo, khi nào một đơn hàng bị hủy, hay khi nào người dùng thay đổi thông tin cá nhân. **Change Data Capture (CDC - Thu thập dữ liệu thay đổi)** chính là "chìa khóa vàng" giúp biến đổi các hệ thống cơ sở dữ liệu tĩnh lặng thành những dòng chảy sự kiện thời gian thực sống động phục vụ cho các kho dữ liệu lớn, [Data Warehouse](/concepts/2-storage/data-warehouse/data-warehouse/) hoặc Data Lakehouse.

---


![Kiến trúc Change Data Capture (CDC) dựa trên log-reader kết hợp Debezium và Apache Kafka](/images/change-data-capture/debezium-architecture.png)

## 1. Bản chất và So sánh các Phương pháp Tiếp cận CDC

Có ba phương pháp phổ biến để phát hiện và thu thập các thay đổi dữ liệu từ cơ sở dữ liệu nguồn: **Query-based CDC**, **Trigger-based CDC**, và **Log-based CDC**.

### Query-based CDC (CDC dựa trên truy vấn)
Phương pháp này hoạt động bằng cách định kỳ chạy các câu lệnh truy vấn SQL (polling) vào cơ sở dữ liệu nguồn để tìm các bản ghi mới hoặc thay đổi, sử dụng các cột mốc thời gian như `updated_at`, `created_at` hoặc các trường tăng dần như `sequence_id`.
* **Cơ chế**: Connector gửi lệnh `SELECT * FROM table WHERE updated_at > :last_poll_timestamp` sau mỗi khoảng thời gian nhất định (ví dụ: 10 giây).
* **Hạn chế lớn nhất**: 
  * Không thể phát hiện các bản ghi bị xóa vật lý (`DELETE` cứng) vì khi bản ghi biến mất, câu lệnh truy vấn không còn tìm thấy nó nữa. Chỉ có thể khắc phục nếu ứng dụng sử dụng cơ chế xóa mềm (`soft delete` - đánh dấu cột `is_deleted = true`).
  * Gây tải lớn (performance footprint) lên cơ sở dữ liệu nguồn do liên tục quét (scan) bảng, đặc biệt nguy hiểm với các bảng lớn thiếu chỉ mục (index).
  * Mất mát các trạng thái trung gian (state loss). Nếu một bản ghi thay đổi từ trạng thái `A` sang `B` rồi sang `C` trong khoảng thời gian giữa hai chu kỳ quét, Query-based CDC chỉ nhận biết được trạng thái cuối cùng là `C`, bỏ lỡ toàn bộ lịch sử thay đổi `A -> B`.

### Trigger-based CDC (CDC dựa trên Trigger)
Phương pháp này sử dụng các hàm kích hoạt (Triggers) tích hợp sẵn trong RDBMS để ghi lại các thay đổi vào một bảng phụ (Shadow/Audit Table) mỗi khi có hoạt động `INSERT`, `UPDATE`, hoặc `DELETE`.
* **Cơ chế**: Một Trigger được gán vào bảng chính. Khi có giao dịch xảy ra, Trigger tự động chạy và chèn thông tin thay đổi vào bảng lịch sử (audit table). Sau đó, một tiến trình background sẽ đọc từ bảng audit này và đẩy sang hệ thống đích.
* **Hạn chế lớn nhất**:
  * Tăng độ trễ ghi (write latency) của giao dịch gốc. Mọi thao tác chèn/sửa/xóa trên bảng chính phải gánh thêm một tác vụ ghi (write operation) đồng bộ vào bảng audit, làm suy giảm nghiêm trọng throughput của ứng dụng OLTP.
  * Khó bảo trì và quản lý khi schema thay đổi, vì cần đồng bộ hóa cấu trúc của cả bảng chính lẫn bảng audit và logic của Trigger.

### Log-based CDC (CDC dựa trên Nhật ký Giao dịch)
Đây là phương pháp tối ưu và được sử dụng rộng rãi nhất trong các hệ thống cấp doanh nghiệp (Enterprise). Nó đọc trực tiếp nhật ký giao dịch (Transaction Logs/Write-Ahead Logs) do công cụ cơ sở dữ liệu (Database Engine) tự động ghi lại để phục vụ quá trình phục hồi dữ liệu (Crash Recovery).
* **Cơ chế**: Các hệ cơ sở dữ liệu như MySQL (sử dụng `binlog`), PostgreSQL (sử dụng `Write-Ahead Log - WAL`), hay Oracle (sử dụng `Redo Log`) đều ghi lại mọi thay đổi dữ liệu dưới dạng nhị phân trước khi thực sự lưu xuống đĩa. Công cụ CDC đóng vai trò như một client đọc tuần tự luồng log này để trích xuất các sự kiện thay đổi.
* **Ưu điểm vượt trội**:
  * Độ trễ cực thấp (gần như tức thời - sub-second latency).
  * Tác động hiệu năng bằng không hoặc cực thấp đối với cơ sở dữ liệu giao dịch nguồn (zero-impact ingestion) vì nó không thực thi các câu lệnh SQL truy vấn và không can thiệp vào luồng xử lý giao dịch.
  * Bắt trọn vẹn mọi hành động xóa (`DELETE` vật lý) và mọi trạng thái thay đổi trung gian.

### Bảng So sánh Tổng quan các Phương pháp CDC

| Tiêu chí | Query-based CDC | Trigger-based CDC | Log-based CDC |
| :--- | :--- | :--- | :--- |
| **Cơ chế** | Polling qua câu lệnh `SELECT` định kỳ | Ghi đồng bộ vào bảng audit qua Trigger | Đọc tệp nhật ký nhị phân (WAL/binlog) |
| **Ảnh hưởng Hiệu năng** | Cao (quét bảng liên tục) | Cao (thêm thao tác ghi đồng bộ) | Rất thấp (đọc file log tuần tự) |
| **Bắt sự kiện DELETE** | Không (trừ khi xóa mềm) | Có | Có |
| **Bắt trạng thái trung gian** | Không (chỉ lấy trạng thái cuối) | Có | Có |
| **Độ phức tạp cấu hình** | Thấp (chỉ cần quyền đọc bảng) | Trung bình (cần tạo trigger/bảng phụ) | Cao (yêu cầu quyền Replication/WAL level) |

---

## 2. Kiến trúc Tổng quan và Luồng Dữ liệu

Một kiến trúc CDC hiện đại thường dựa trên nền tảng luồng sự kiện (Event Streaming). Trong đó, cơ sở dữ liệu ghi nhận giao dịch, công cụ CDC nắm bắt thay đổi, hệ thống Message Broker (như Apache Kafka) đóng vai trò lưu trữ đệm và phân phối, và cuối cùng dữ liệu được ghi vào Target Lakehouse để phân tích.

```mermaid
flowchart TD
    %% Source DB and transaction log
    subgraph Source_System ["Hệ thống Nguồn (Source OLTP)"]
        DB[(PostgreSQL / MySQL)] -->|1. Ghi giao dịch vật lý| TxLog[Transaction Log<br/>WAL / Binlog]
    end

    %% CDC Processing Layer
    subgraph Ingestion_Layer ["Tầng Ingestion (Thu thập)"]
        Debezium[Debezium Connector] -->|2. Đọc logs nhị phân| TxLog
        KafkaConnect[Kafka Connect Worker] --- Debezium
    end

    %% Message Broker
    subgraph Message_Queue ["Tầng Truyền dẫn & Lưu đệm"]
        Kafka[[Apache Kafka Cluster]]
        SchemaRegistry[Schema Registry]
        KafkaConnect -->|3. Đẩy Event + Đăng ký Schema| Kafka
        KafkaConnect -.->|Validate / Register Schema| SchemaRegistry
    end

    %% Target Systems
    subgraph Destination_System ["Hệ thống Đích (Target Lakehouse)"]
        Lakehouse[(Target Lakehouse<br/>Delta Lake / Apache Iceberg)]
        DownstreamConsumer[Lakehouse Sink Connector<br/>e.g., Spark Streaming]
    end

    Kafka -->|4. Tiêu thụ luồng sự kiện| DownstreamConsumer
    DownstreamConsumer -->|5. Ghi & Trộn dữ liệu (Merge/Upsert)| Lakehouse

    %% Styling
    style Source_System fill:#e8f1f5,stroke:#3282b8,stroke-width:2px
    style Ingestion_Layer fill:#f4f1de,stroke:#e07a5f,stroke-width:2px
    style Message_Queue fill:#f7f5fb,stroke:#7209b7,stroke-width:2px
    style Destination_System fill:#edf2f4,stroke:#8d99ae,stroke-width:2px
```

---

## 3. Thiết lập Debezium với Kafka Connect

Debezium là một nền tảng mã nguồn mở hàng đầu dùng cho Log-based CDC. Nó được xây dựng trên khung phân phối **Kafka Connect**, cho phép định nghĩa các kết nối nguồn (Source Connector) để đưa các thay đổi từ database vào Kafka.

### Quy trình Thiết lập
1. **Cấu hình Database nguồn**: Bật chế độ ghi nhật ký chi tiết. Ví dụ trên PostgreSQL, ta cần cấu hình `wal_level = replica` trong file `postgresql.conf` và cấp quyền Replication cho người dùng kết nối.
2. **Cài đặt Debezium Connector**: Tải và giải nén JAR file của Debezium PostgreSQL Connector vào thư mục plugin của Kafka Connect.
3. **Đăng ký Connector**: Gửi một yêu cầu HTTP POST chứa cấu hình JSON tới REST API của Kafka Connect.

### Cấu hình JSON PostgreSQL Source Connector (Mẫu Production)

```json
{
  "name": "postgresql-cdc-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "tasks.max": "1",
    "database.hostname": "postgres-prod.internal",
    "database.port": "5432",
    "database.user": "cdc_user",
    "database.password": "secure_password_123",
    "database.dbname": "ecom_db",
    "topic.prefix": "cdc_prod",
    "schema.include.list": "public",
    "table.include.list": "public.orders,public.customers",
    "plugin.name": "pgoutput",
    "publication.autocreate.mode": "filtered",
    "publication.name": "dbz_publication",
    "slot.name": "debezium_replication_slot",
    "decimal.handling.mode": "double",
    "time.precision.mode": "connect",
    "key.converter": "io.confluent.connect.avro.AvroConverter",
    "key.converter.schema.registry.url": "http://schema-registry:8081",
    "value.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter.schema.registry.url": "http://schema-registry:8081",
    "tombstones.on.delete": "true"
  }
}
```

*   `plugin.name`: Được đặt là `pgoutput` - plugin giải mã logic tiêu chuẩn từ PostgreSQL 10 trở đi.
*   `topic.prefix`: Tiền tố cho tên các Kafka Topic được tạo ra. Ví dụ, bảng `public.orders` sẽ được đẩy vào topic `cdc_prod.public.orders`.
*   `slot.name`: Tên của Replication Slot trong Postgres. Cơ chế này giúp PostgreSQL giữ lại các file WAL chưa được Debezium đọc, tránh mất mát dữ liệu khi Connector offline.
*   `key.converter` và `value.converter`: Sử dụng **AvroConverter** kết hợp với Schema Registry để nén dung lượng message và quản lý cấu trúc Schema chặt chẽ hơn.
*   `tombstones.on.delete`: Khi đặt là `true`, Debezium sẽ gửi một tombstone record (message chứa khóa chính nhưng giá trị null) ngay sau sự kiện DELETE, giúp cơ chế Log Compaction của Kafka giải phóng bộ nhớ.

---

## 4. Định dạng một bản tin CDC thực tế

Dưới đây là một JSON Payload điển hình do Debezium tạo ra khi có sự kiện cập nhật dữ liệu. Hãy chú ý cách nó lưu giữ cả trạng thái trước và sau khi thay đổi:

```json
{
  "op": "u",  
  "ts_ms": 1656608542000, 
  "before": {
    "id": 1001,
    "name": "Anna",
    "email": "anna@test.com"
  },
  "after": {
    "id": 1001,
    "name": "Bella",  
    "email": "anna@test.com"
  },
  "source": {
    "db": "production",
    "table": "users",
    "lsn": 348574895 
  }
}
```

---

## 5. Xử lý Schema Evolution trong Stream Processing

Khi đội phát triển ứng dụng thay đổi cấu trúc bảng nguồn (DDL: thêm/đổi tên/xóa cột), hệ thống CDC phải xử lý trơn tru mà không bị sập.

### Cơ chế Hoạt động của Debezium và Schema Registry
Debezium liên tục theo dõi các câu lệnh DDL trên cơ sở dữ liệu nguồn, phân tích để cập nhật cấu trúc schema nội bộ và đăng ký phiên bản mới lên **Schema Registry**.
Người tiêu thụ dữ liệu (downstream consumers) khi đọc message từ Kafka sẽ truy vấn Schema Registry dựa trên ID đính kèm trong message để giải mã chính xác dữ liệu. 

Để hệ thống không bị gián đoạn, ta cần cấu hình luật tương thích phù hợp trên Schema Registry:
*   **BACKWARD Compatibility (Tương thích ngược)**: Người tiêu thụ sử dụng schema mới nhất có thể đọc được dữ liệu được ghi bởi schema cũ hơn.
*   **FORWARD Compatibility (Tương thích xuôi)**: Người tiêu thụ sử dụng schema cũ vẫn đọc được dữ liệu được ghi bởi schema mới.
*   **FULL Compatibility (Tương thích toàn phần)**: Đảm bảo cả hai chiều tương thích ngược và xuôi. Đây là cấu hình an toàn nhất.

Ở tầng đích (ví dụ: Delta Lake hoặc Apache Iceberg), chúng ta cần kích hoạt tính năng **Schema Evolution** tự động bằng cách sử dụng tùy chọn `.option("mergeSchema", "true")` trong Spark Streaming.

---

## 6. Chiến lược Backfilling Dữ liệu Lịch sử

Khi kích hoạt CDC trên một bảng dữ liệu đã có sẵn hàng triệu bản ghi, chúng ta cần một giải pháp nạp toàn bộ dữ liệu lịch sử này sang hệ thống đích (gọi là **Backfill** hoặc **Snapshotting**).

### Chiến lược 1: Incremental Snapshot của Debezium (Khuyên dùng)
Thay vì khóa bảng (read lock) gây ảnh hưởng nghiêm trọng tới ứng dụng ghi, Debezium cung cấp giải pháp **Incremental Snapshot (Chụp ảnh gia tăng không chặn)**:
*   Debezium sử dụng một bảng tín hiệu (Signaling Table) để điều phối và chia bảng lớn thành nhiều khoảng nhỏ (chunks) dựa trên khóa chính.
*   Nó đọc một chunk dữ liệu lịch sử đồng thời liên tục đọc luồng thay đổi WAL thời gian thực.
*   Nếu có sự trùng lặp (ví dụ: một dòng dữ liệu lịch sử vừa được đọc ra lại có cập nhật mới trong WAL), Debezium sẽ đối chiếu để đảm bảo bản ghi có timestamp mới nhất sẽ ghi đè lên bản ghi cũ.
*   *Ưu điểm*: Không khóa bảng, có thể tạm dừng và tiếp tục (pausable/resumable).

### Chiến lược 2: Dual-Run / Split Processing (Kiến trúc Song hành)
Sử dụng khi cần tối ưu tốc độ backfill thông qua các công cụ xử lý dữ liệu lớn chuyên dụng như Apache Spark.
*   **Bước 1**: Đánh dấu vị trí WAL hiện tại trên database nguồn (LSN trong Postgres hoặc GTID trong MySQL).
*   **Bước 2**: Khởi chạy Debezium Connector bắt đầu lắng nghe từ chính xác điểm mốc LSN đó để hứng toàn bộ dữ liệu thay đổi phát sinh từ thời điểm này trở đi.
*   **Bước 3**: Chạy một job Spark Batch để đọc toàn bộ dữ liệu lịch sử từ database nguồn (hoặc read replica) và ghi trực tiếp vào Target Lakehouse.
*   **Bước 4**: Tại Target Lakehouse, sử dụng câu lệnh `MERGE INTO` hoặc cơ chế [Deduplication](/concepts/3-integration/etl-elt/deduplication) để gộp luồng dữ liệu batch (lịch sử) và luồng dữ liệu stream (từ Kafka) lại với nhau dựa trên khóa chính và timestamp để loại bỏ các bản ghi trùng lặp, đảm bảo [tính Idempotency](/concepts/3-integration/etl-elt/idempotency).

---

## Khi nào nên dùng

*   **Nên dùng:**
    *   Đồng bộ dữ liệu thời gian thực sang các kho dữ liệu lớn, [Data Warehouse](/concepts/2-storage/data-warehouse/data-warehouse/) hoặc Data Lakehouse phục vụ báo cáo realtime.
    *   Sử dụng mẫu thiết kế Outbox Pattern để đồng bộ dữ liệu an toàn giữa các microservices độc lập mà không gặp lỗi phân tán (Distributed Transaction).
    *   Tự động xóa cache (Redis) hoặc cập nhật chỉ mục tìm kiếm (Elasticsearch) ngay khi dữ liệu gốc trong DB thay đổi.
    *   Cần lưu lại lịch sử biến động chi tiết của dữ liệu để phục vụ kiểm toán dữ liệu (Auditing).
*   **Không nên dùng:**
    *   Nếu lượng dữ liệu nhỏ và tần suất thay đổi thấp, việc áp dụng [kỹ thuật Incremental Load](/concepts/3-integration/etl-elt/incremental-load/) đơn giản qua câu lệnh SQL định kỳ sẽ tiết kiệm chi phí vận hành hơn.
    *   Khi nguồn dữ liệu đến từ các API bên thứ ba (SaaS như Hubspot, Salesforce) nơi bạn không thể truy cập vào file log nhị phân của họ.
    *   Nếu database nguồn thay đổi cấu trúc Schema quá thường xuyên và hỗn loạn mà không có quy trình kiểm soát.

---

## Điểm mạnh và điểm yếu (Trade-offs)

### Điểm mạnh (Pros)
*   **Thời gian thực (Real-time)**: Giảm thiểu độ trễ đồng bộ xuống chỉ còn vài mili giây.
*   **Tải cực thấp lên Database nguồn**: Không chạy các câu lệnh SELECT quét bảng nặng nề, bảo vệ hiệu năng cho hệ thống Production.
*   **Toàn vẹn dữ liệu**: Bắt trọn các sự kiện xóa vật lý (hard deletes) và các biến động nhanh trong tích tắc, không bị mất mát các trạng thái trung gian.
*   **Kiến trúc lỏng (Loosely coupled)**: Hệ thống nguồn và đích được tách biệt thông qua Message Broker, tăng độ ổn định.

### Điểm yếu (Cons)
*   **Hạ tầng phức tạp**: Đòi hỏi vận hành và giám sát nhiều thành phần (Debezium, Kafka Connect, Schema Registry, Stream Consumers).
*   **Rủi ro tràn ổ đĩa nguồn**: Nếu Kafka Connect bị dừng hoạt động dài ngày, các Replication Slot trên PostgreSQL sẽ tiếp tục giữ lại các file WAL, có khả năng làm tràn đĩa cứng máy chủ Production.
*   **Yêu cầu quyền hạn cao**: Đòi hỏi quyền cấu hình sâu trong database nguồn (quyền Replication, quyền truy cập file log nhị phân).
*   **Bảng dữ liệu thiếu Khóa chính (Primary Key)**: Không có Primary Key sẽ khiến hệ thống đích bối rối không biết bản ghi cập nhật cho dòng nào ở kho đích.

---

## Trọng tâm ôn luyện phỏng vấn

### 1. Làm thế nào để đảm bảo tính Idempotency (chống trùng lặp) tại hệ thống đích khi nhận dữ liệu từ Kafka CDC?
*   **Gợi ý trả lời**: Do Kafka đảm bảo cơ chế phân phối tin nhắn ít nhất một lần (at-least-once delivery), việc trùng lặp sự kiện hoàn toàn có thể xảy ra. Để đảm bảo [tính Idempotency](/concepts/3-integration/etl-elt/idempotency), tại hệ thống đích (như Delta Lake), ta phải sử dụng câu lệnh `MERGE` (Upsert) dựa trên khóa chính (Primary Key) của bảng. Đồng thời, đối chiếu cột timestamp của sự kiện (`ts_ms` do Debezium sinh ra) để chỉ cập nhật dữ liệu nếu sự kiện mới có timestamp lớn hơn dữ liệu hiện tại trong đích.

### 2. Replication Slot trong PostgreSQL là gì và tại sao nó có thể gây nguy hiểm cho Database nguồn?
*   **Gợi ý trả lời**: Replication Slot là tính năng giúp Postgres đảm bảo rằng các file WAL chứa dữ liệu thay đổi sẽ không bị xóa đi cho đến khi client (Debezium) xác nhận đã đọc thành công. Nguy hiểm nằm ở chỗ nếu Debezium Connector bị sập trong một thời gian dài mà Replication Slot vẫn tồn tại, PostgreSQL sẽ giữ lại toàn bộ WAL trên đĩa cứng. Điều này dẫn đến dung lượng lưu trữ của máy chủ database nguồn tăng nhanh chóng và có thể làm sập database do hết dung lượng đĩa. Cần thiết lập cảnh báo giám sát dung lượng đĩa và tự động hủy slot nếu connector offline quá lâu.

### 3. Sự khác biệt lớn nhất giữa Outbox Pattern sử dụng CDC và việc ứng dụng trực tiếp gửi sự kiện sang Kafka là gì?
*   **Gợi ý trả lời**: Nếu ứng dụng vừa cập nhật cơ sở dữ liệu vừa gửi event sang Kafka một cách độc lập, hệ thống sẽ đối mặt với lỗi không nhất quán dữ liệu khi một trong hai tác vụ thất bại. Outbox Pattern giải quyết vấn đề này bằng cách bắt ứng dụng chỉ ghi dữ liệu giao dịch và thông tin event vào cùng một database (trong cùng một Transaction cục bộ đảm bảo tính ACID). Sau đó, Debezium CDC sẽ quét bảng Outbox này để gửi event sang Kafka một cách bất đồng bộ và đáng tin cậy 100%.

### 4. Debezium đọc Log và ném vào Kafka. Làm thế nào để đảm bảo thứ tự (Ordering) của các sự kiện trên một bản ghi? Ví dụ: Lệnh INSERT phải đến Data Warehouse trước lệnh UPDATE.
*   **Gợi ý trả lời**: Trong Kafka, thứ tự tin nhắn chỉ được bảo toàn tuyệt đối bên trong cùng một Partition. Để đảm bảo các sự kiện của cùng một dòng dữ liệu (ví dụ cùng một User) đi đúng thứ tự thời gian, Debezium sẽ chọn **Khóa Chính (Primary Key)** của bảng nguồn làm **Message Key** khi gửi tin nhắn vào Kafka. Thuật toán băm của Kafka đảm bảo mọi tin nhắn có chung Message Key sẽ luôn được phân bổ vào cùng một Partition duy nhất. Nhờ đó, Consumer ở đầu ra sẽ luôn đọc và xử lý các sự kiện theo đúng trình tự thời gian tuyến tính đã diễn ra tại database nguồn.

---

## Xem thêm các khái niệm liên quan
* [Backfill](/concepts/3-integration/etl-elt/backfill/)
* [Data Extraction](/concepts/3-integration/etl-elt/data-extraction/)
* [Data Ingestion](/concepts/3-integration/etl-elt/data-ingestion/)

## Tài liệu tham khảo

* [AWS DMS - Using Change Data Capture](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Task.CDC.html)
* [Google Cloud Datastream - Change Data Capture Overview](https://cloud.google.com/datastream/docs/concepts/datastream-overview)
* [Azure Cosmos DB - Change Feed Design Patterns](https://learn.microsoft.com/en-us/azure/cosmos-db/change-feed)
* [Databricks Delta Lake - Ingestion Guide with COPY INTO](https://docs.databricks.com/en/ingestion/copy-into/index.html)
* [Snowflake Docs - Introduction to Streams](https://docs.snowflake.com/en/user-guide/data-pipelines-intro)
* [Confluent - What is Change Data Capture?](https://www.confluent.io/learn/change-data-capture/)
* [Debezium Reference Documentation - Architecture](https://debezium.io/documentation/reference/stable/architecture.html)

---

## English Summary

**Change Data Capture (CDC)** is an architectural pattern designed to track and propagate data modifications (inserts, updates, and deletes) from operational databases to downstream analytical systems (like Data Warehouses or Lakehouses) in real-time. Modern CDC implementations favor **Log-based CDC** over query-based or trigger-based approaches, as it reads changes directly from database transaction logs (e.g., PostgreSQL's WAL or MySQL's binlog) with near-zero performance footprint. Implementing CDC via **Debezium** and **Kafka Connect** ensures reliable, sub-second latency event streaming, though engineers must establish strict guidelines for **Schema Evolution** (via Schema Registry) and select proper **Backfilling** strategies (such as Debezium's non-blocking Incremental Snapshots or dual-run Spark batch ingestion) to prevent data inconsistency and handle out-of-order events.