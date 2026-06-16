---
title: "Log-based CDC Internals"
difficulty: "Advanced"
readingTime: "25 mins"
lastUpdated: 2026-06-16
seoTitle: "Log-based CDC Internals: Cách Hoạt Động Của WAL, Binlog và Debezium"
metaDescription: "Tìm hiểu chi tiết cơ chế hoạt động bên dưới của Log-based CDC, cách các công cụ như Debezium đọc Write-Ahead Log (WAL) để bắt các thay đổi dữ liệu."
description: "Khám phá chuyên sâu cơ chế của Log-based Change Data Capture (CDC). Phân tích cách đọc Write-Ahead Log (WAL), Binlog và kiến trúc của Debezium để xây dựng pipeline dữ liệu thời gian thực."
---



Log-based Change Data Capture (CDC) là tiêu chuẩn vàng trong thiết kế kiến trúc dữ liệu hiện đại cho việc đồng bộ và lấy dữ liệu (ingestion) thời gian thực. Thay vì liên tục truy vấn cơ sở dữ liệu gốc để tìm kiếm các bản ghi mới hoặc thay đổi, cơ chế Log-based CDC sẽ "nghe" trực tiếp từ nhật ký giao dịch (transaction log) của database. Phương pháp này mang lại độ trễ cực thấp (near real-time) và gần như không gây ảnh hưởng đến hiệu suất của cơ sở dữ liệu nguồn.

Trong bài viết này, chúng ta sẽ đi sâu vào internals (cấu tạo bên trong) của hệ thống Log-based CDC, hiểu rõ về Write-Ahead Log (WAL), và cách các công cụ nổi tiếng như **Debezium** thực hiện việc phân tích cú pháp để trích xuất dữ liệu.

---

## 1. Write-Ahead Log (WAL) và Nhật ký giao dịch

Để hiểu Log-based CDC, chúng ta bắt buộc phải hiểu cơ chế phục hồi và sao chép (replication) của hệ quản trị cơ sở dữ liệu quan hệ (RDBMS).

### Tại sao lại cần WAL?
Trong các hệ thống RDBMS tuân thủ ACID, khi một giao dịch thay đổi dữ liệu (Insert, Update, Delete), hệ thống không ghi (flush) ngay lập tức các thay đổi đó xuống đĩa từ ở định dạng bảng (table format). Việc ghi ngẫu nhiên vào đĩa (random I/O) rất chậm. 

Thay vào đó, cơ sở dữ liệu ghi các thay đổi vào một tệp nhật ký dưới dạng **tuần tự (sequential I/O)**. Tệp này được gọi là **Write-Ahead Log (WAL)** trong PostgreSQL, **Binary Log (Binlog)** trong MySQL, hoặc **Redo Log** trong Oracle. Hệ thống đảm bảo rẳng nhật ký này được ghi xuống đĩa *trước khi* (Write-Ahead) giao dịch được đánh dấu là "Commit". Nếu database gặp sự cố (crash), nó có thể đọc lại WAL để khôi phục trạng thái dữ liệu (Durability).

### Ứng dụng của WAL trong Replication
Các RDBMS hỗ trợ việc tạo các bản sao (Replica) để dự phòng hoặc chia sẻ tải. Thay vì sao chép toàn bộ database liên tục, nút Master/Primary sẽ gửi các luồng (stream) từ WAL sang các nút Replica/Secondary. Các Replica sau đó sẽ "replay" (phát lại) các nhật ký này để tự cập nhật trạng thái của chính nó sao cho giống hệt Master.

> **Log-based CDC chính là việc chúng ta "giả mạo" hoặc đóng vai trò như một Replica Database để nhận luồng WAL này, nhưng thay vì ghi vào DB, chúng ta chuyển đổi nó thành một luồng sự kiện (event stream) cho các hệ thống Downstream (như Kafka, Data Lake).**

---

## 2. Các pha xử lý của Log-based CDC

Quá trình trích xuất dữ liệu từ WAL không hề đơn giản, nó bao gồm một chuỗi các bước phức tạp diễn ra liên tục. Lấy ví dụ với PostgreSQL và Debezium:

### 2.1. Đăng ký Logical Replication Slot
PostgreSQL sử dụng một khái niệm gọi là **Replication Slot**. Một Replication slot đảm bảo rằng Primary DB sẽ không bao giờ xóa các tệp WAL nếu consumer (CDC connector) chưa đọc xong. 
- Khi Debezium kết nối với Postgres, nó yêu cầu một Logical Replication Slot. 
- Postgres sẽ sử dụng các plugin (như `pgoutput` hoặc `wal2json`) để chuyển đổi WAL từ dạng vật lý (các byte, block disk) sang dạng logic (hàng, cột, Insert/Update/Delete).

### 2.2. Phân tích cú pháp Giao dịch (Transaction Parsing)
Một giao dịch (Transaction) có thể bao gồm hàng nghìn thay đổi (ví dụ: một lệnh `UPDATE` lớn). WAL chứa sự kiện `BEGIN`, tiếp theo là các sự kiện thay đổi dữ liệu, và cuối cùng là `COMMIT` (hoặc `ROLLBACK`).
- Hệ thống CDC phải gom nhóm (buffer) các thay đổi này trong bộ nhớ.
- Chỉ khi nhận được sự kiện `COMMIT`, hệ thống mới phát hành (emit) các thay đổi đó xuống hàng đợi (như Kafka). Nếu gặp `ROLLBACK`, toàn bộ buffer sẽ bị loại bỏ. Việc này đảm bảo tính nhất quán của dữ liệu.

### 2.3. Chuyển đổi định dạng (Event Formatting)
Dữ liệu thô từ WAL được đóng gói thành các thông điệp có cấu trúc. Ví dụ: một sự kiện Update từ Debezium thường chứa cả `before` (dữ liệu trước khi sửa) và `after` (dữ liệu sau khi sửa), kèm theo meta-data như `source` (tên bảng, log position, transaction id).

```json
{
  "before": { "id": 1, "status": "PENDING" },
  "after": { "id": 1, "status": "COMPLETED" },
  "source": {
    "version": "1.9.5.Final",
    "connector": "postgresql",
    "name": "my_server",
    "ts_ms": 1658404856000,
    "db": "mydb",
    "schema": "public",
    "table": "orders",
    "txId": 12345,
    "lsn": 3456789
  },
  "op": "u",
  "ts_ms": 1658404856500
}
```

---

## 3. Kiến trúc của Debezium

[Debezium](https://debezium.io/) là nền tảng phân tán mã nguồn mở hàng đầu cho CDC, được xây dựng chủ yếu để chạy trên nền tảng **Apache Kafka Connect**. 

### Initial Snapshot (Chụp nhanh khởi tạo)
Khi bật Debezium lần đầu cho một Database đã có sẵn hàng triệu bản ghi, WAL không chứa toàn bộ lịch sử từ thuở sơ khai (vì WAL đã bị xoá dần theo thời gian). Debezium giải quyết việc này thông qua pha **Snapshotting**:
1. Đặt một khoá đọc toàn cục (global read lock) tạm thời để ngăn chặn các thay đổi mới (có thể bỏ qua bước này với một số DB hỗ trợ lock-free snapshot).
2. Ghi lại vị trí WAL hiện tại (Log Sequence Number - LSN trong Postgres, hoặc GTID trong MySQL).
3. Đọc tuần tự toàn bộ bảng (thực hiện `SELECT *`) và gửi các sự kiện `READ` vào Kafka.
4. Sau khi Snapshot hoàn tất, Debezium bắt đầu luồng **Streaming** từ vị trí WAL đã lưu tại bước 2.

### Quản lý Schema Evolution (Tiến hóa lược đồ)
Nếu ai đó chạy lệnh `ALTER TABLE` thêm cột hoặc đổi kiểu dữ liệu, hệ thống CDC phải phản ứng như thế nào?
- Trong MySQL, Debezium duy trì một **Database History Topic** nội bộ trong Kafka để lưu trữ toàn bộ các lệnh DDL. Khi phân tích Binlog, Debezium dùng topic này để mô phỏng lại cấu trúc bảng tại đúng thời điểm giao dịch đó xảy ra.
- Debezium thường được sử dụng kết hợp với **Apicurio Registry** hoặc **Confluent Schema Registry** để đăng ký và kiểm tra tính hợp lệ của lược đồ (Avro, Protobuf) trước khi consumer xử lý.

---

## 4. Ưu điểm so với Query-based CDC

Trước khi có Log-based CDC, người ta thường dùng **Query-based CDC** (polling) bằng cách truy vấn định kỳ: `SELECT * FROM table WHERE updated_at > last_sync_time`. 

Log-based CDC vượt trội hơn hoàn toàn nhờ các lý do:
1. **Không bỏ lót (No Missed Updates):** Nếu một hàng bị cập nhật hai lần giữa hai chu kỳ polling, Query-based chỉ lấy được trạng thái cuối. Log-based bắt được cả hai thay đổi.
2. **Bắt được Deletes:** Lệnh DELETE sẽ làm dữ liệu biến mất khỏi bảng, Query-based hoàn toàn "mù" trước việc này (trừ khi dùng soft-delete). Log-based sẽ phát hiện được ngay lập tức sự kiện xoá từ WAL.
3. **Hiệu suất (Zero Impact):** Query-based gây ra tải lớn cho DB (table scan, index scan). Log-based đọc các file nhị phân trên đĩa độc lập hoặc nhận luồng stream đã được tối ưu từ DB engine.
4. **Độ trễ thấp:** Polling thường tính bằng phút (cron job). Log-based đẩy dữ liệu tính bằng phần nghìn giây.

---

## 5. Thách thức và Best Practices khi vận hành

Sức mạnh luôn đi kèm với sự phức tạp. Vận hành Log-based CDC tại production đòi hỏi giám sát khắt khe:

### Vấn đề phình to WAL (Storage Overhead)
Nếu connector Debezium bị sập (down), Replication Slot trong Postgres vẫn giữ lại WAL. Hậu quả là phân vùng đĩa của Database sẽ đầy nhanh chóng, dẫn đến sập luôn Database nguồn (Disaster!). 
> **Best Practice:** Luôn phải có alerting giám sát kích thước Replication Slot hoặc Replica Lag. Đặt mức giới hạn `max_slot_wal_keep_size` trong Postgres (từ version 13) để giới hạn lượng đĩa bị chiếm dụng.

### Bất đồng bộ trong Eventual Consistency
Kafka là hệ thống phân tán, các sự kiện CDC từ nhiều bảng có thể được đẩy vào nhiều partitions / topics khác nhau. Khi luồng dữ liệu này được đưa vào kho dữ liệu đích (như Snowflake, BigQuery), các join queries có thể trả về sai lệch nếu dữ liệu giữa hai bảng (ví dụ `users` và `orders`) tới đích không cùng lúc.

### Outbox Pattern cho Microservices
Việc để hệ thống Data theo dõi CDC trực tiếp từ các bảng nghiệp vụ của hệ thống gốc tạo ra sự phụ thuộc chặt chẽ (tight coupling). Nếu kỹ sư Backend đổi tên cột, pipeline Data có thể bị hỏng. 
> **Best Practice:** Sử dụng **Transactional Outbox Pattern**. Thay vì CDC từ bảng `orders`, backend sẽ ghi dữ liệu event có cấu trúc vào một bảng trung gian `outbox_events` trong cùng một giao dịch (transaction) với logic chính. Debezium chỉ đọc từ bảng `outbox_events`. Điều này tạo ra một Public API Contract rõ ràng giữa Backend và Data Engineering.

---

## Tài Liệu Tham Khảo Mở Rộng
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* [Debezium Architecture Documentation](https://debezium.io/documentation/reference/architecture.html)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
