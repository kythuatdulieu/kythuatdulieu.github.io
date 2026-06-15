---
title: "API & Batch Ingestion at Scale"
description: "Deep dive vào kiến trúc và kỹ thuật ingestion dữ liệu từ API và batch ở quy mô lớn, lấy cảm hứng từ Pinterest và Spotify."
---

Khi hệ thống dữ liệu phát triển, việc ingestion dữ liệu từ các external API (như Salesforce, Zendesk, Facebook Ads) hoặc các batch source không chỉ dừng lại ở một vài đoạn script `requests.get()` hay `cron job`. Ở quy mô của các công ty công nghệ lớn như Pinterest hay Spotify, một ingestion pipeline phải đối mặt với hàng tỷ sự kiện mỗi ngày, giới hạn nghiêm ngặt (rate limits) từ đối tác, và các sự cố mạng không thể đoán trước.

Bài viết này bỏ qua các khái niệm cơ bản để xoáy sâu vào 4 trụ cột thiết kế giúp đảm bảo tính bền bỉ, toàn vẹn và hiệu suất khi xây dựng data ingestion pipeline quy mô lớn: Idempotency, Rate Limiting, Backoff Strategies, và Dead Letter Queues (DLQ).

## 1. Idempotency (Tính luỹ đẳng) trong Ingestion Pipeline

Trong hệ thống phân tán, failure là điều chắc chắn xảy ra (network partition, worker crash, database timeout). Nếu không có idempotency, việc retry một failed job sẽ dẫn đến duplicate data (ví dụ: insert 2 lần cùng một batch dữ liệu) hoặc data corruption.

### Chiến lược thiết kế
*   **Idempotency Keys:** Lấy cảm hứng từ cách Spotify quản lý state của API, mỗi request hoặc batch ingestion cần được gán một định danh duy nhất (UUID) hoặc hash (tạo từ payload + timestamp/batch_window). Idempotency key này được kiểm tra tại một distributed cache (ví dụ: Redis) để hệ thống nhận diện và an toàn bỏ qua các request trùng lặp.
*   **Merge-on-Read (MOR) và CDC:** Pinterest Engineering đã từng chia sẻ về quá trình nâng cấp từ legacy batch pipelines (quét lại toàn bộ bảng mất đến 24h) sang CDC (Change Data Capture) framework. Sử dụng Debezium, Kafka và Apache Iceberg với chiến lược MOR, dữ liệu thay đổi (upsert/delete) được lưu thành các delta files. Quá trình lưu delta là idempotent; dù pipeline có ghi lại cùng một sự kiện do retry, read engine khi đọc và merge sẽ vẫn ra cùng một kết quả cuối cùng.
*   **Upsert thay vì Append-only:** Trong các ETL batch jobs, việc dùng lệnh `INSERT` thuần tuý là một anti-pattern ở quy mô lớn. Hãy sử dụng cơ chế `UPSERT` (hoặc `MERGE INTO` trong Snowflake/BigQuery) dựa trên Primary Key. Nếu một task Airflow bị timeout và tự động retry, các bản ghi cũ sẽ chỉ bị overwrite một cách an toàn mà không làm tăng gấp đôi lượng dữ liệu.

## 2. Rate Limiting ở quy mô Platform

Khi pull dữ liệu từ hàng trăm external APIs, mỗi API có một giới hạn khác nhau. Ví dụ, gọi Spotify API quá tay sẽ lập tức trả về mã lỗi `HTTP 429 Too Many Requests`. Nếu pipeline dội bom API, ứng dụng của bạn sẽ bị blacklist (throttling).

### Quản trị Global Quota (Global Quota Management)
Ở quy mô lớn, việc mỗi worker tự quản lý rate limit là vô ích vì số lượng worker có thể auto-scale lên hàng trăm. Pinterest đã phát triển một hệ thống gọi là **Piqama** – một quota management framework tập trung.
*   **Token Bucket & Leaky Bucket Algorithms:** Hệ thống triển khai các thuật toán này qua storage tập trung để chia sẻ state. Trước khi fetch data từ API, ingestion worker phải "xin" token từ Piqama. Nếu hết token cho đối tác đó, worker sẽ chủ động sleep hoặc trả task về message broker thay vì cố gắng gọi API và bị block.
*   **Bulk Operations & Caching:** Spotify Engineering đặc biệt khuyến nghị việc tối ưu hoá data fetch bằng cách gom nhóm các request (batching/bulk endpoints) thay vì tuần tự. Đi kèm với đó là caching lại các metadata có tính tĩnh cao để giảm bớt gánh nặng API call.

## 3. Smart Backoff Strategies (Chiến lược lùi thời gian)

Khi gặp lỗi `429 Too Many Requests` hoặc server đối tác chết tạm thời `503 Service Unavailable`, việc retry ngay lập tức sẽ tạo ra **Retry Storm** (bão retry), làm sập cả hệ thống của đối tác lẫn làm cạn kiệt tài nguyên thread/connection của chính bạn.

*   **Exponential Backoff with Jitter:** Thay vì chờ cố định 5 giây (Linear Backoff), hệ thống cần tăng thời gian chờ theo hàm mũ ($2^n \times \text{base\_delay}$). Quan trọng nhất: phải cộng thêm **"Jitter"** (một độ nhiễu/lượng thời gian ngẫu nhiên nhỏ). Nếu không có Jitter, hàng trăm workers bị fail cùng lúc sẽ đồng loạt thức dậy và retry ở chính xác cùng một mili-giây (Thundering Herd problem), lại tiếp tục gây nghẽn.
*   **Adaptive / Smart Backoff:** Khi external server (như Spotify) trả về HTTP 429, họ thường đính kèm header `Retry-After: 30`. Một ingestion framework thông minh (smart backoff) phải được thiết kế để đọc các header báo hiệu này, và đình chỉ worker đúng số giây đối tác yêu cầu thay vì áp dụng công thức tính toán backoff mù quáng.

## 4. Dead Letter Queues (DLQ) & Xử lý "Poison Pills"

Dữ liệu kéo về từ bên ngoài luôn chứa rủi ro không lường trước: schema thay đổi đột ngột (schema drift), payload bị cắt cụt, hoặc trường JSON bị lỗi định dạng. Những bản ghi lỗi này được gọi là "Poison Pills" – chúng có thể làm crash data pipeline và block toàn bộ luồng dữ liệu sạch theo sau.

*   **Cô lập lỗi (Isolation) thay vì Fail-fast:** Trong batch lớn, không được để 1 bản ghi hỏng làm sập cả batch 10 triệu bản ghi. Các dòng dữ liệu không parse được hoặc rớt logic validation phải được hệ thống tự động gắp ra và ném vào một Dead Letter Queue (có thể là một Kafka topic riêng rẽ, Amazon SQS, hoặc một thư mục `/dlq` trên S3).
*   **Continuous Processing (Xử lý không gián đoạn):** DLQ đảm bảo ingestion pipeline luôn giữ được đà tiến tới (forward progress). Dữ liệu sạch sẽ được ingest trót lọt vào Data Warehouse, đảm bảo SLA cho báo cáo.
*   **Alerting & Reprocessing:** Đội ngũ Data Engineer sẽ cấu hình cảnh báo trên DLQ. Nếu lượng tin nhắn rơi vào DLQ tăng đột biến (spike), hệ thống sẽ bắn alert cho on-call. Sau khi engineer fix logic parsing, một job phụ (replay job) sẽ được kích hoạt để đọc dữ liệu từ DLQ, xử lý lại và hoà vào luồng dữ liệu chính.

## Tổng kết

Xây dựng một hệ thống API & Batch Ingestion ở scale hàng tỷ bản ghi không nằm ở việc bạn viết code kéo data tốt đến đâu, mà nằm ở khả năng quản trị fail-states và sự cố hệ thống. Bằng cách áp dụng **Idempotency** để bảo vệ tính toàn vẹn, **Rate Limiting** ở tầm platform để tuân thủ giới hạn, **Smart Backoff with Jitter** để xử lý mượt mà outages, và **DLQ** để rào chắn rác dữ liệu, bạn sẽ xây dựng được một ingestion platform vươn tới độ tin cậy 99.99%.

## Tài liệu Tham khảo

- [Pinterest Engineering: Transitioning to CDC-based Ingestion](https://medium.com/@Pinterest_Engineering/pinterest-data-ingestion-system-evolution-5882fb32fb9e)
- [Pinterest Engineering: Piqama, Pinterest’s Quota Management System](https://medium.com/@Pinterest_Engineering)
- [Spotify Engineering: Resilience in API integrations](https://engineering.atspotify.com/)
- [AWS Architecture Blog: Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [Enterprise Integration Patterns: Dead Letter Channel](https://www.enterpriseintegrationpatterns.com/patterns/messaging/DeadLetterChannel.html)
