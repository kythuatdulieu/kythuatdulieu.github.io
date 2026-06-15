---
title: Data Observability & Quality
description: Khái niệm chuyên sâu về Data Observability & Quality, phân tích các mô hình phát hiện bất thường của Uber và ứng dụng Data Lineage, Circuit breakers từ Monte Carlo.
---

Trong bối cảnh dữ liệu ngày càng phức tạp, việc duy trì **Data Quality** (Chất lượng dữ liệu) không chỉ dừng lại ở các bài kiểm thử tĩnh (static tests) mà đã tiến hóa thành **Data Observability** (Khả năng quan sát dữ liệu). Bài viết này sẽ mổ xẻ các kiến trúc, mô hình học máy và kỹ thuật thực tiễn được áp dụng bởi **Uber Engineering** và **Monte Carlo** để giám sát chất lượng dữ liệu ở quy mô lớn.

## 1. Anomaly Detection Models (Mô hình phát hiện bất thường)

Việc phát hiện lỗi dữ liệu thủ công là bất khả thi ở quy mô hàng petabyte. Uber Engineering đã phát triển kiến trúc **Data Quality Monitor (DQM)** sử dụng các mô hình thống kê để tự động hóa việc phát hiện bất thường (anomaly detection):

*   **Trích xuất Metric (Data Stats Service - DSS):** DQM truy vấn các bảng dữ liệu (như Hive, Vertica) để tạo ra các metric chuỗi thời gian (time-series) cho từng cột. 
*   **Giảm chiều dữ liệu (Dimensionality Reduction - PCA):** Với các tập dữ liệu có tính đa chiều và tương quan cao, Uber sử dụng phân tích thành phần chính (PCA) để đơn giản hóa quá trình tính toán, tạo ra một biểu diễn dễ dàng xử lý hơn cho việc phát hiện bất thường.
*   **Dự báo (Holt-Winters Forecasting):** Cốt lõi của hệ thống phát hiện bất thường dựa trên mô hình **Holt-Winters**. Kỹ thuật làm mịn hàm mũ (exponential smoothing) này rất hiệu quả vì nó ưu tiên dữ liệu mới nhất, cho phép mô hình thích ứng nhanh chóng với môi trường kinh doanh động của Uber.
*   **Đánh giá điểm số (Scoring) và Cảnh báo:** Hệ thống tính toán độ lệch giữa giá trị dự báo và thực tế để gán điểm bất thường (từ 0 - không bất thường, đến 4 - cực kỳ bất thường). Các bất thường có điểm số cao sẽ kích hoạt cảnh báo thông qua hệ thống metadata Databook để chủ sở hữu dữ liệu kịp thời can thiệp.

## 2. Data Lineage Parsing Tự Động

**Data Lineage** (Luồng dữ liệu) là khả năng theo dõi vòng đời của dữ liệu từ nguồn (source) đến các báo cáo cuối (BI Dashboards). Monte Carlo cung cấp một hệ thống phân tích tự động mà không cần thiết lập thủ công:

*   **Phân tích Metadata và Query Logs:** Monte Carlo kết nối với Data Warehouse, Data Lake, và hệ thống BI để liên tục phân tích siêu dữ liệu và nhật ký truy vấn (query logs).
*   **Phân tích cú pháp SQL (SQL Parsing):** Nền tảng tự động parse các câu lệnh SQL phức tạp để hiểu cách dữ liệu biến đổi và sự phụ thuộc ở cấp độ cột (column-level dependencies).
    *   **SELECT Lineage:** Theo dõi các mối quan hệ trực tiếp từ trường này sang trường khác (field-to-field).
    *   **Non-SELECT Lineage:** Theo dõi cách dữ liệu được định hình qua các mệnh đề như `WHERE`, `ORDER BY`.
*   **Lập bản đồ tự động:** Kết quả là một bản đồ luồng dữ liệu (end-to-end map) được xây dựng tự động, giúp các đội ngũ kỹ thuật thấy rõ "bán kính ảnh hưởng" (impact radius) khi có sự cố, cũng như nhanh chóng tìm ra nguyên nhân gốc rễ (Root Cause Analysis).

## 3. Circuit Breakers Trong ETL Pipeline

Trong kiến trúc Data Observability của Monte Carlo, **Circuit Breakers** (Cầu dao tự động) là một tính năng bảo vệ độ tin cậy chủ động, giúp dừng pipeline khi dữ liệu không đạt chuẩn.

*   **Tích hợp ở tầng Orchestration:** Circuit breakers thường hoạt động ở tầng điều phối (ví dụ: Apache Airflow). Khi một monitor (giám sát freshness, volume, hoặc custom SQL) phát hiện vi phạm, circuit breaker sẽ ngay lập tức "ngắt cầu dao", chặn các task tiếp theo trong pipeline không được thực thi.
*   **Ngăn chặn lan truyền lỗi (Proactive Prevention):** Thay vì để dữ liệu "bẩn" chảy vào hệ thống BI hay Machine Learning, circuit breakers khoanh vùng lỗi ngay tại bước transformation hoặc nguồn, ngăn ngừa "phản ứng dây chuyền".
*   **Cải thiện niềm tin dữ liệu:** Stakeholders sẽ không phải đối mặt với các báo cáo sai lệch. Đồng thời, Data Engineers tiết kiệm được thời gian và chi phí backfill dữ liệu. Tuy nhiên, cần lưu ý cấu hình ngưỡng (thresholds) hợp lý để tránh việc dừng pipeline liên tục vì những dao động nhỏ.

## Tài liệu Tham khảo

- [Uber Engineering: Monitoring Data Quality at Scale](https://www.uber.com/en-VN/blog/monitoring-data-quality-at-scale/)
- [Monte Carlo: What is Data Observability?](https://www.montecarlodata.com/blog-what-is-data-observability/)
- [Circuit Breakers in Data Engineering](https://www.montecarlodata.com/blog-data-circuit-breakers/)
