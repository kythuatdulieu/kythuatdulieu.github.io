---
title: "Data Ingestion"
difficulty: "Beginner"
tags: ["data-ingestion", "data-pipeline", "streaming", "batch", "data-engineering"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Data Ingestion - Quy trình thu nạp dữ liệu từ cơ bản đến nâng cao"
metaDescription: "Tìm hiểu toàn diện về Data Ingestion (Thu nạp dữ liệu) trong Data Engineering. So sánh Batch, Streaming, Micro-batch, CDC và các Best Practices quan trọng."
description: "Trong vòng đời của dữ liệu (Data Lifecycle), Data Ingestion (Thu nạp dữ liệu) là bước đi đầu tiên nhưng vô cùng quan trọng. Bài viết này sẽ cung cấp cái nhìn toàn diện về các phương pháp thu nạp, các thách thức phổ biến và các công cụ thực tiễn tốt nhất."
---



Trong vòng đời của dữ liệu (`Data Lifecycle`), **Data Ingestion (Thu nạp dữ liệu)** là bước đi đầu tiên nhưng vô cùng quan trọng. Hãy tưởng tượng dữ liệu của doanh nghiệp nằm rải rác ở khắp nơi: từ cơ sở dữ liệu của ứng dụng backend, các file log từ web server, hệ thống CRM của phòng kinh doanh (như Salesforce), cho đến dữ liệu hành vi người dùng trên Mobile App. 

Để có thể khai thác và phân tích toàn bộ bức tranh này, bạn cần gom tất cả dữ liệu đó về một nơi tập trung (như **Data Warehouse** hoặc **Data Lake**). Quá trình "gom" và "vận chuyển" đó chính là **Data Ingestion**.

---

## 1. Data Ingestion là gì?

**Data Ingestion** là quá trình trích xuất và di chuyển dữ liệu từ các hệ thống nguồn (Source Systems) đến hệ thống đích (Target Systems) để lưu trữ, xử lý và phân tích sau này.

Hệ thống nguồn có thể là:
- Cơ sở dữ liệu quan hệ (Relational DBs: MySQL, PostgreSQL, SQL Server).
- Cơ sở dữ liệu NoSQL (MongoDB, Cassandra).
- Các ứng dụng SaaS bên thứ ba (Salesforce, Zendesk, Google Analytics).
- File systems và Object Storage (CSV, JSON, Parquet lưu trên Amazon S3, FTP servers).
- APIs (RESTful, GraphQL).
- Dòng sự kiện từ ứng dụng hoặc IoT (Event streams, Webhooks).

Hệ thống đích thường là:
- **Data Lake:** (ví dụ: Amazon S3, Google Cloud Storage, Azure Data Lake) dùng để lưu dữ liệu thô (Raw data).
- **Data Warehouse:** (ví dụ: Snowflake, Google BigQuery, Amazon Redshift) dùng để lưu dữ liệu đã có cấu trúc, phục vụ phân tích.

---

## 2. Các phương pháp Thu nạp dữ liệu (Ingestion Methods)

Dựa trên tần suất và độ trễ mong muốn, Data Ingestion được chia thành các mô hình chính sau:

### 2.1. Batch Ingestion (Thu nạp theo lô)
Batch Ingestion gom dữ liệu thành các "lô" (batches) dựa trên lịch trình định kỳ (ví dụ: mỗi giờ một lần, mỗi đêm vào lúc 12h) hoặc khi dữ liệu đạt đến một kích thước nhất định.

* **Đặc điểm:** Dữ liệu được xử lý đồng loạt, không cần thời gian thực.
* **Ưu điểm:**
  - Dễ triển khai, thiết lập và giám sát.
  - Tối ưu hóa chi phí và băng thông mạng (chỉ chạy lúc off-peak - ngoài giờ cao điểm).
  - Ít gây tải nặng liên tục cho hệ thống nguồn.
* **Nhược điểm:** Độ trễ (latency) cao, dữ liệu đích không phản ánh ngay lập tức trạng thái hiện tại của hệ thống nguồn (có thể bị trễ vài giờ đến 1 ngày).
* **Use case:** Lên báo cáo kinh doanh cuối ngày, tính toán lương thưởng hàng tháng, backup dữ liệu.

### 2.2. Streaming Ingestion (Thu nạp luồng / Thời gian thực)
Với Streaming Ingestion, dữ liệu được thu thập, xử lý và tải lên hệ thống đích ngay khi nó vừa được sinh ra (hoặc chỉ với độ trễ tính bằng mili-giây đến vài giây).

* **Đặc điểm:** Dòng chảy dữ liệu liên tục không có điểm dừng.
* **Ưu điểm:** Cung cấp thông tin theo thời gian thực (Real-time), giúp doanh nghiệp ra quyết định ngay lập tức.
* **Nhược điểm:**
  - Kiến trúc hạ tầng phức tạp.
  - Khó giám sát, xử lý lỗi và đảm bảo tính chính xác (ví dụ: vấn đề duplicate data, out-of-order events).
  - Chi phí vận hành cao hơn Batch.
* **Use case:** Phát hiện gian lận thẻ tín dụng (Fraud detection), hệ thống gợi ý (Recommendation engine), giám sát hệ thống mạng/IoT.

### 2.3. Micro-batching (Lai giữa Batch và Streaming)
Thay vì chờ hàng giờ như Batch, Micro-batch chia dữ liệu thành những lô rất nhỏ và xử lý chúng thường xuyên (ví dụ: mỗi phút hoặc mỗi 5 phút). Nó mang lại độ trễ thấp tiệm cận Streaming nhưng kiến trúc xử lý lại mang hơi hướng của Batch. Apache Spark Streaming là một ví dụ điển hình cho mô hình này.

### 2.4. Change Data Capture (CDC)
**CDC (Change Data Capture)** là một kỹ thuật tiên tiến để theo dõi và bắt lấy (capture) các thay đổi diễn ra ở mức độ dòng (row-level) trong database (như INSERT, UPDATE, DELETE).
CDC đọc trực tiếp từ **Transaction Log** (ví dụ: `binlog` của MySQL, `WAL` của PostgreSQL) nên **gần như không tác động (zero-impact)** đến hiệu năng của database nguồn. Công cụ nổi tiếng nhất cho việc này là **Debezium**.

---

## 3. Mô hình Lấy dữ liệu: Pull vs Push

Tùy thuộc vào việc ai là người chủ động khởi xướng việc chuyển dữ liệu, chúng ta có 2 mô hình:

* **Pull Model (Kéo):** Hệ thống Data Ingestion chủ động kết nối tới nguồn để "rút" dữ liệu về. 
  * *Ví dụ:* Một job Apache Airflow chạy định kỳ query vào DB MySQL để lấy các record mới nhất theo cột `updated_at`.
* **Push Model (Đẩy):** Hệ thống nguồn chủ động đẩy dữ liệu sang hệ thống Ingestion khi có sự kiện xảy ra.
  * *Ví dụ:* Một hệ thống backend đẩy thông báo người dùng đăng ký mới thẳng vào Apache Kafka thông qua một Producer API.

---

## 4. Các thách thức trong Data Ingestion

Khi quy mô dữ liệu của doanh nghiệp phình to, Data Ingestion không chỉ đơn giản là "COPY - PASTE" mà bạn sẽ đối mặt với các bài toán hóc búa:

1. **Volume (Dung lượng):** Làm sao để ingest hàng Terabyte dữ liệu mỗi ngày mà không bị timeout, tràn RAM hay quá tải băng thông?
2. **Velocity (Tốc độ):** Cân bằng giữa yêu cầu dữ liệu real-time của Business và khả năng đáp ứng của hệ thống.
3. **Variety (Đa dạng định dạng):** Dữ liệu đến từ file JSON, XML, file ảnh, âm thanh, cho tới các bảng RDBMS chuẩn mực. Làm sao chuẩn hóa?
4. **Schema Evolution (Thay đổi cấu trúc):** Đội backend bất ngờ đổi tên cột, xóa cột hoặc thêm cột mới trong bảng MySQL. Hệ thống Ingestion của bạn bị "crash" (vỡ pipeline). Quản lý Schema Evolution là một bài toán cực kỳ đau đầu.
5. **Data Quality (Chất lượng dữ liệu):** Xử lý dữ liệu bị rác, null, sai định dạng trước khi chúng vào Data Lake (rất hay gặp với dữ liệu event từ mobile app).
6. **Network & Rate Limits:** Khi gọi API của bên thứ ba (SaaS) để lấy dữ liệu, bạn sẽ bị chặn (block) nếu gọi quá nhiều lần trong 1 giây (Rate limiting). Cần cơ chế back-off, retry thông minh.
7. **Compliance & Security:** Cần mã hóa dữ liệu khi truyền tải (in-transit), ẩn (masking) thông tin PII (như số thẻ tín dụng, SSN, mật khẩu) trước khi ingest vào Data Lake.

---

## 5. Best Practices (Thực tiễn tốt nhất)

Để xây dựng một hệ thống Data Ingestion bền vững (robust), một Data Engineer nên nằm lòng các nguyên tắc:

* **Idempotency (Tính lũy đẳng):** Nếu bạn chạy lại một quá trình Ingestion nhiều lần với cùng một đầu vào, kết quả đầu ra không thay đổi (không bị nhân đôi dữ liệu). Điều này cực kỳ quan trọng khi pipeline bị lỗi ở giữa chừng và cần chạy lại (retry).
* **Incremental Load vs Full Load:** Đừng lấy lại toàn bộ dữ liệu (Full Load) mỗi ngày nếu bảng đó có hàng tỷ dòng. Thay vào đó, hãy dùng **Incremental Load** – chỉ lấy những dòng được thêm mới hoặc cập nhật từ lần chạy trước (dựa trên các cột watermark như `updated_at` hoặc qua CDC).
* **Sử dụng Dead Letter Queue (DLQ):** Khi có một bản ghi lỗi không thể ingest (ví dụ: sai định dạng JSON), đừng làm sập cả pipeline. Đẩy bản ghi lỗi đó vào DLQ để xem xét và xử lý lại sau, và cho phép pipeline tiếp tục ingest các bản ghi đúng.
* **Alerting & Monitoring:** Gắn cảnh báo (alerts) khi job ingestion bị thất bại, hoặc khi volume dữ liệu đột ngột giảm/tăng bất thường (data anomaly).
* **Tách bạch Ingestion và Transformation (ELT thay vì ETL):** Xu hướng hiện đại (Modern Data Stack) là chỉ tập trung lấy dữ liệu thô càng nhanh, càng an toàn về Data Warehouse càng tốt (Extract - Load). Mọi logic biến đổi dữ liệu (Transform) sẽ được thực hiện sau đó bằng sức mạnh tính toán của Data Warehouse.

---

## 6. Các công cụ và công nghệ phổ biến

Thị trường Data Ingestion hiện nay rất đa dạng, bao gồm:

* **Managed/SaaS Ingestion Tools:** Fivetran, Airbyte, Stitch, Meltano. (Đây là các công cụ Low-code/No-code, chỉ cần vài cú click để cấu hình kết nối từ MySQL sang BigQuery).
* **Streaming & Message Brokers:** Apache Kafka, Amazon Kinesis, Google Cloud Pub/Sub, RabbitMQ, Redpanda.
* **CDC Tools:** Debezium, AWS Database Migration Service (DMS).
* **Custom/Orchestration Frameworks:** Viết script Python kết hợp với Apache Airflow, Prefect hoặc Dagster.
* **Data Integration & Routing:** Apache NiFi, Logstash, Fluentd (Thường dùng để ingest logs và định tuyến luồng dữ liệu phức tạp).

---

## Tài Liệu Tham Khảo
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
