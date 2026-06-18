---
title: "Data Pipeline Tài Chính: Crawl Dữ Liệu Yahoo Finance & Xử Lý Bằng Snowflake"
description: "Dự án end-to-end mô phỏng luồng dữ liệu (data pipeline) tài chính: thu thập dữ liệu từ Yahoo Finance, lưu trữ lên Google Cloud Storage (GCP), và xử lý trên Snowflake thông qua Snowpipe và Snowflake Tasks."
---

# Data Pipeline Tài Chính trên Snowflake

Dự án này mô phỏng một luồng dữ liệu (data pipeline) thực tế dành cho dữ liệu tài chính. Hệ thống bao gồm việc thu thập (crawling) dữ liệu từ nhiều nguồn khác nhau, lưu trữ vào Google Cloud Storage (GCP), và đưa vào Snowflake để xử lý, làm sạch và phân tích.

> **Mã Nguồn (GitHub):** [kythuatdulieu/snowflakedemo](https://github.com/kythuatdulieu/snowflakedemo)

---

## 1. Bài Toán & Nguồn Dữ Liệu

Trong lĩnh vực tài chính, dữ liệu thay đổi liên tục theo từng phút. Việc nắm bắt thông tin thị trường nhanh chóng và chính xác là yếu tố sống còn. Luồng dữ liệu trong dự án này thu thập dữ liệu định kỳ mỗi 15 phút từ 4 nguồn chính:

1. **Commodities (Hàng hóa):** Yahoo Finance
2. **World Indices (Chỉ số thế giới):** Yahoo Finance
3. **Currencies (Tiền tệ):** Yahoo Finance
4. **Economic Calendar (Lịch kinh tế):** Investing.com

Dữ liệu thô thu được có định dạng JSON và CSV, được gán hậu tố là timestamp của thời điểm crawl để đảm bảo tính duy nhất và khả năng truy vết (traceability).

---

## 2. Kiến Trúc Data Pipeline

Hệ thống được thiết kế theo mô hình Medallion Architecture (Bronze - Silver - Gold) kết hợp với Event-Driven Ingestion.

### 2.1. Lớp Ingestion (Bronze Layer)

Quá trình thu thập dữ liệu (ingestion) hoạt động theo cơ chế **hướng sự kiện (Event-Driven)** để đảm bảo độ trễ thấp nhất:

1. **Google Cloud Storage (GCS) & Pub/Sub:** Dữ liệu crawler trả về được ghi vào một GCS bucket. Mỗi khi có file mới, một event sẽ được Pub/Sub bắn ra.
2. **Snowpipe Integration:** Snowflake kết nối với GCP qua Notification Integration (`GCS_PUBSUB_INT`). Khi nhận được event từ Pub/Sub, Snowpipe sẽ tự động thức dậy và nạp (copy) file dữ liệu mới vào các bảng Raw (`RAW_YFH_COMMODITIES`, `RAW_CURRENCIES`...).
3. **Tại sao lại dùng Snowpipe?** Việc sử dụng Snowpipe thay vì các tác vụ chạy theo lịch (scheduled batch jobs) giúp dữ liệu thô có mặt tại lớp Bronze gần như ngay lập tức (Near Real-time) mà không cần chờ đến khung giờ chạy batch.

### 2.2. Chiến Lược Điều Phối (Orchestration & Queue Pattern)

Trong khi bước ingestion là event-driven, quá trình biến đổi dữ liệu (transformation) phía sau được quản lý bởi một chuỗi các **Snowflake Tasks** phức tạp. Để tránh tình trạng hệ thống bị quá tải nếu có hàng ngàn file đổ về cùng lúc, dự án triển khai **mô hình Hàng đợi (Queue Pattern)**:

*   **Kiểm toán & Đưa vào hàng đợi (Audit & Enqueue):** Một task (`TASK_BRONZE_AUDIT`) chạy định kỳ để phát hiện các dòng mới trong stream của lớp Bronze, tính toán mã băm (hashes) để chống trùng lặp, và đẩy các file này vào bảng `FILE_QUEUE` với trạng thái `PENDING`.
*   **Xử lý theo lô (Micro-batch Processing):** Task `TASK_QUEUE_START` lấy một số lượng file nhất định (giới hạn bởi tham số `SILVER_BATCH_LIMIT`) và chuyển trạng thái thành `RUNNING`.
*   **Hoàn thành:** Sau khi các task transformation đã hoàn tất, file được đánh dấu là `DONE`.

Mô hình này đảm bảo tính nhất quán (Consistency) và toàn vẹn giao dịch (ACID) cực kỳ tốt cho hệ thống.

---

## 3. Quá Trình Xử Lý Dữ Liệu (Silver & Gold)

### 3.1. Lớp Biến Đổi (Silver Layer)

Logic biến đổi tại lớp Silver được chia thành nhiều phần:

1.  **Các View Chuẩn hóa (`VW_*_NORMALIZED`):** Parse dữ liệu thô (JSON/CSV variant) thành các cột có cấu trúc rõ ràng. Snowflake hỗ trợ kiểu dữ liệu `VARIANT` cực kỳ mạnh mẽ để parse JSON ngay trong SQL.
2.  **Bảng Lịch sử (`H_*` - History Tables):** Lưu trữ toàn bộ lịch sử thay đổi (SCD Type 2). Mỗi bản ghi snapshot từ crawler đều được append vào đây (Insert-only).
3.  **Bảng Trạng thái Hiện tại (`L_*` - Last/Current Tables):** Chỉ lưu trạng thái mới nhất của mỗi mã chứng khoán/sự kiện. Sử dụng lệnh `MERGE` để cập nhật (Upsert) bản ghi.

### 3.2. Đảm Bảo Chất Lượng Dữ Liệu (Data Quality)

Để đảm bảo dữ liệu đầu ra không bị "rác" (Garbage In - Garbage Out), chất lượng dữ liệu được kiểm soát gắt gao thông qua **Data Metric Functions (DMFs)** của Snowflake:

*   **`COUNT_NULLS`:** Kiểm tra các giá trị định danh hoặc giá cả có bị thiếu (null) hay không.
*   **`COUNT_NEGATIVE_VALUES`:** Đảm bảo giá trị (prices) hoặc khối lượng giao dịch (volumes) không bị âm - một lỗi logic phổ biến trong dữ liệu tài chính.
*   **`COUNT_DUPLICATES`:** Giám sát các vi phạm về tính duy nhất của dữ liệu.

### 3.3. Lớp Phục Vụ (Gold Layer)

Lớp Gold chứa các bảng đã được denormalize (khử chuẩn) và aggregate (tổng hợp), tối ưu tốc độ đọc cho các công cụ Business Intelligence (BI) như Tableau, PowerBI hoặc các truy vấn Ad-hoc từ Data Analyst.

---

## 4. Tổng Kết

Dự án `snowflakedemo` là một minh chứng xuất sắc cho việc tận dụng tối đa sức mạnh nội tại của Snowflake. Thay vì phải phụ thuộc vào các công cụ Orchestration bên ngoài như Airflow hay dbt cho mọi việc, chúng ta có thể sử dụng **Snowpipe** cho luồng Real-time Ingestion, và **Snowflake Tasks** kết hợp Queue Pattern cho luồng Batch Transformation an toàn, có khả năng mở rộng (Scalable) và tiết kiệm chi phí.
