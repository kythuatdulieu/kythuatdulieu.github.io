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



Data Extraction (Trích xuất dữ liệu) là bước đầu tiên (**E** - Extract) trong bất kỳ đường ống dữ liệu (data pipeline) nào, dù là [ETL](/concepts/2-data-ingestion-integration/etl) hay [ELT](/concepts/2-data-ingestion-integration/elt). Đây là quá trình kết nối tới các hệ thống nguồn khác nhau (như cơ sở dữ liệu quan hệ, NoSQL, hệ thống SaaS, API, hoặc các file tĩnh) để lấy dữ liệu ra một cách an toàn và mang về kho lưu trữ trung tâm (Data Warehouse hoặc Data Lake). 

Nếu bước này được thiết kế kém, nó không chỉ dẫn đến mất mát hoặc sai sót dữ liệu, mà còn có thể làm chậm trễ, thậm chí làm sập các hệ thống nghiệp vụ quan trọng (production databases) đang trực tiếp phục vụ người dùng. Do đó, "nghệ thuật" của Data Extraction là kéo được dữ liệu cần thiết với **độ trễ nhỏ nhất**, **chi phí thấp nhất** và **ít gây ảnh hưởng nhất** tới hệ thống nguồn.

## Các Phương Pháp Trích Xuất Dữ Liệu (Extraction Methods)

Tùy thuộc vào yêu cầu nghiệp vụ (như tần suất cập nhật dữ liệu, độ trễ cho phép) và thiết kế của hệ thống nguồn, có hai phương pháp trích xuất chính:

### 1. Full Extraction (Full Load)

Trong Full Extraction, toàn bộ dữ liệu từ hệ thống nguồn sẽ được trích xuất hoàn toàn và ghi đè (hoặc thay thế) toàn bộ dữ liệu đang tồn tại ở hệ thống đích trong mỗi lần chạy. Phương pháp này hoàn toàn không quan tâm đến việc bản ghi nào mới được thêm vào, hay bản ghi nào vừa bị chỉnh sửa.

*   **Ưu điểm:**
    *   Cực kỳ đơn giản để triển khai (chỉ cần `SELECT * FROM table`).
    *   Tự động khắc phục được các sai sót dữ liệu của các lần chạy trước vì mọi thứ được làm mới hoàn toàn.
    *   Không cần logic phức tạp ở hệ thống đích để xử lý các bản ghi cập nhật hoặc xóa.
*   **Nhược điểm:**
    *   Rất kém hiệu quả về tài nguyên (I/O, Network, CPU) nếu lượng dữ liệu lớn.
    *   Gây tải rất nặng lên hệ thống nguồn, có thể ảnh hưởng đến người dùng cuối.
*   **Khi nào nên dùng:**
    *   Khi bảng dữ liệu có kích thước nhỏ (ví dụ: các bảng danh mục - dimension tables có vài nghìn dòng).
    *   Khi không có cách nào xác định được bản ghi nào đã bị thay đổi (không có cột timestamp cập nhật, không có primary key rõ ràng).
    *   Lần chạy đầu tiên (Initial Load) của một pipeline dữ liệu.

### 2. Incremental Extraction (Incremental Load)

Thay vì kéo toàn bộ dữ liệu, Incremental Extraction chỉ lấy ra những phần dữ liệu **được sinh ra mới** hoặc **bị thay đổi** kể từ lần chạy trích xuất gần nhất. Phương pháp này thường được thực hiện qua hai cách tiếp cận chính:

#### a. Batch-based (Dựa trên Batch/Watermark)
Sử dụng các cột mốc thời gian (như `created_at`, `updated_at`) hoặc cột ID tăng dần liên tục để xác định khoảng dữ liệu mới.
*   **Cách thức:** Pipeline sẽ lưu lại một "watermark" (mốc giá trị cuối cùng đã trích xuất thành công). Ở lần chạy tiếp theo, nó chỉ truy vấn những bản ghi có giá trị lớn hơn watermark này (ví dụ: `SELECT * FROM orders WHERE updated_at > '2026-06-15 00:00:00'`).
*   **Hạn chế:** 
    *   Nếu bản ghi bị xóa (Hard delete), hệ thống sẽ không biết vì bản ghi không còn tồn tại để truy vấn.
    *   Đòi hỏi hệ thống nguồn phải tuân thủ chuẩn mực thiết kế (luôn cập nhật `updated_at`).

#### b. Log-based (Change Data Capture - CDC)
Đây là kỹ thuật tiên tiến nhất để trích xuất dữ liệu từ các Database. Hầu hết các cơ sở dữ liệu quan hệ (như MySQL, PostgreSQL) đều ghi lại mọi thay đổi (Insert, Update, Delete) vào một tệp nhật ký (Transaction Log, ví dụ: Binlog ở MySQL, WAL ở PostgreSQL). Kỹ thuật CDC (Change Data Capture) sẽ "đọc" các tệp nhật ký này và phát luồng (stream) các thay đổi ra bên ngoài theo thời gian thực (Real-time).
*   **Ưu điểm:** Độ trễ cực thấp (gần như Real-time), không cần truy vấn trực tiếp vào Database nên tác động lên hệ thống nguồn cực nhỏ. Bắt được mọi sự kiện, kể cả Hard Delete.
*   **Nhược điểm:** Cài đặt và vận hành hệ thống CDC (như [Debezium](https://debezium.io/)) thường phức tạp hơn.

---

## Trích Xuất Dữ Liệu Theo Loại Nguồn (Data Sources)

Data Engineer thường xuyên phải làm việc với sự đa dạng và hỗn tạp của các nguồn dữ liệu. Mỗi loại nguồn lại đòi hỏi các kỹ thuật extraction khác nhau:

### 1. Relational Databases (Cơ Sở Dữ Liệu Quan Hệ)
*   **Ví dụ:** MySQL, PostgreSQL, SQL Server, Oracle.
*   **Cách tiếp cận:** 
    *   Sử dụng truy vấn SQL (`SELECT`) cho Full Load và Incremental Batch.
    *   Tối ưu bằng cách đánh chỉ mục (Index) trên các cột thường dùng làm watermark (`updated_at`).
    *   Sử dụng các công cụ CDC (như Debezium, AWS DMS) đọc từ replication log cho môi trường sản xuất quy mô lớn.

### 2. API & SaaS Systems (Hệ thống phần mềm dịch vụ)
*   **Ví dụ:** Salesforce, HubSpot, Stripe, Zendesk.
*   **Cách tiếp cận:** Hầu hết được trích xuất qua REST hoặc GraphQL API.
*   **Lưu ý quan trọng:**
    *   **Rate Limiting (Giới hạn tốc độ):** Các API đều có giới hạn số lượng request được gọi trong một khoảng thời gian nhất định (vd: 100 requests/phút). Cần thiết kế pipeline biết cách "ngủ" (sleep) và đợi khi gặp lỗi HTTP 429 (Too Many Requests).
    *   **Pagination (Phân trang):** Dữ liệu không bao giờ trả về toàn bộ trong một API call. Cần triển khai logic phân trang (Offset/Limit, Cursor-based pagination) để lấy toàn bộ dữ liệu.

### 3. Flat Files & Cloud Storage (Lưu trữ tệp tin)
*   **Ví dụ:** Các file CSV, JSON, Parquet, Avro lưu trên Amazon S3, Google Cloud Storage (GCS) hoặc FTP Server.
*   **Cách tiếp cận:**
    *   Thường là Incremental Load tự nhiên, bởi mỗi file mới sinh ra thường chứa dữ liệu mới của một giờ hoặc một ngày (như log web server).
    *   Pipeline đơn giản chỉ cần duyệt qua các thư mục (thường được partition theo ngày `s3://data/logs/year=2026/month=06/day=15/`), đọc các tệp tin mới và đưa vào Data Lake.

### 4. NoSQL / Document Databases
*   **Ví dụ:** MongoDB, Cassandra, DynamoDB.
*   **Cách tiếp cận:**
    *   Tương tự như CSDL quan hệ, có thể trích xuất batch.
    *   Với MongoDB, có thể dùng Change Streams để thực hiện CDC. DynamoDB có DynamoDB Streams.
    *   Lưu ý đến vấn đề "Schema Evolution" (thay đổi cấu trúc dữ liệu) rất phổ biến trong NoSQL khi trích xuất.

---

## Những Thách Thức Thường Gặp & Thực Tiễn Tốt Nhất (Best Practices)

Để xây dựng một bước Extraction bền bỉ (resilient) và hiệu quả, Data Engineer cần chú ý:

1.  **Bảo vệ Hệ Thống Nguồn (Source System Impact)**
    *   *Nguyên tắc:* Công việc của Data Engineer không được làm ảnh hưởng đến ứng dụng của người dùng.
    *   *Thực tiễn:* Không bao giờ chạy các câu truy vấn trích xuất dữ liệu khổng lồ trên Master Database. Hãy trích xuất từ các Read Replica (bản sao chỉ đọc) hoặc sử dụng kỹ thuật CDC dựa trên log.

2.  **Xử Lý Lỗi và Cơ Chế Thử Lại (Error Handling & Retry Mechanism)**
    *   Việc kết nối mạng bị gián đoạn, API đột ngột sập là chuyện "cơm bữa". Đường ống dữ liệu cần áp dụng chiến lược thử lại (Exponential Backoff) trước khi đánh dấu là thất bại (Failed).
    *   Đảm bảo tính Idempotent (Luôn cho kết quả giống nhau bất kể chạy lại bao nhiêu lần) để khi job failed giữa chừng, lần chạy lại sẽ không tạo ra dữ liệu trùng lặp (duplicate data).

3.  **Bảo Mật Dữ Liệu và Quyền Riêng Tư (Security & Privacy)**
    *   Dữ liệu trích xuất thường chứa thông tin nhạy cảm của khách hàng (PII - Personally Identifiable Information).
    *   Nên mã hóa dữ liệu trên đường truyền (In-transit Encryption, TLS/SSL) và nếu có thể, thiết lập mạng nội bộ (VPC Peering, Private Link) giữa hệ thống nguồn và công cụ ETL thay vì kéo dữ liệu qua internet công cộng.

4.  **Lựa Chọn Công Cụ Trích Xuất Hiện Đại**
    *   Thay vì tự code (custom script) bằng Python để kéo dữ liệu từ các hệ thống phổ biến, hiện nay xu hướng ưu tiên sử dụng các công cụ có sẵn (như Airbyte, Fivetran, Meltano) để quản lý hàng trăm loại kết nối (Connectors) một cách dễ dàng, vì việc bảo trì các API script theo thời gian là một cơn ác mộng.

---

## So Sánh Các Phương Pháp Trích Xuất

| Tiêu Chí | Full Load | Incremental (Batch) | CDC (Log-based) |
| :--- | :--- | :--- | :--- |
| **Độ phức tạp triển khai** | Rất thấp | Trung bình | Cao |
| **Độ trễ dữ liệu** | Tính bằng Giờ / Ngày | Tính bằng Giờ / Phút | Real-time (Giây) |
| **Tải lên hệ thống nguồn** | Rất nặng | Nhẹ - Trung bình | Cực nhẹ |
| **Khả năng bắt sự kiện Xóa (Delete)**| Không (chỉ phản ánh trạng thái cuối) | Khó (trừ khi dùng cờ `is_deleted` - Soft delete) | Có (Bắt được Hard Delete) |
| **Chi phí vận hành** | Cao (Tài nguyên xử lý) | Thấp | Trung bình - Cao (Hạ tầng streaming) |

## Kết Luận

Bước Extraction thường là giai đoạn gian nan nhất trong Data Engineering vì bạn không có toàn quyền kiểm soát các hệ thống nguồn. Một chiến lược trích xuất thông minh kết hợp giữa Full Load (cho dữ liệu tĩnh), Incremental (qua API/Batch) và CDC (cho Core Database) sẽ giúp xây dựng một nền tảng dữ liệu ổn định, mở ra cơ hội khai thác phân tích cho các bước [Transformation (Chuyển đổi)](/concepts/2-data-ingestion-integration/data-transformation) sau này.

## Tài Liệu Tham Khảo
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
