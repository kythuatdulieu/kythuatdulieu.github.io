---
title: "Deep-dive: E2E SQL Data Warehouse Theo Mô Hình Medallion"
description: "Phân tích chuyên sâu về kiến trúc Medallion (Bronze, Silver, Gold) trong Data Warehouse. Đánh giá data modeling, trade-offs khi xử lý SCD Type 2 và các rủi ro trên production."
---

Dự án Data Warehouse E2E là một trong những cột mốc quan trọng của một Data Engineer. Bài viết này sẽ mổ xẻ chi tiết dự án SQL Data Warehouse (dựa trên nguồn tham khảo từ DataWithBaraa), tập trung hoàn toàn vào tư duy Data Modeling, những đánh đổi về mặt thiết kế (design trade-offs), và các rủi ro tiềm ẩn khi đưa hệ thống lên môi trường thực tế (production).

## 1. Data Modeling Chuyên Sâu: Mô Hình Medallion
Kiến trúc Medallion chia hệ thống xử lý dữ liệu thành 3 tầng rõ rệt, giúp tách biệt các giai đoạn xử lý dữ liệu từ nguyên bản đến khi sẵn sàng cho kinh doanh.

### Bronze Layer (Raw/Landing Zone)
- **Mục đích**: Lưu trữ dữ liệu thô (raw data) được ingest trực tiếp từ các nguồn (CRM, ERP, logs, v.v.) mà không qua biến đổi.
- **Đặc điểm**: Dữ liệu thường được đưa vào các bảng staging bằng lệnh `COPY INTO` hoặc Bulk Insert. Tại đây, mọi bản ghi (ngay cả dữ liệu lỗi) đều được giữ lại nhằm đảm bảo khả năng truy xuất lịch sử gốc khi cần (Source of Truth).
- **Thiết kế**: Các bảng thường có cấu trúc tương đương với nguồn, cộng thêm các metadata (như `load_timestamp`, `source_filename`).

### Silver Layer (Cleansed/Conformed Zone)
- **Mục đích**: Làm sạch, chuẩn hoá và tích hợp dữ liệu từ nhiều nguồn. 
- **Đặc điểm**: Đây là nơi loại bỏ các bản ghi trùng lặp (deduplication), xử lý null, ép kiểu dữ liệu (type casting) và chuẩn hóa tên cột. Các quy tắc nghiệp vụ (business rules) cơ bản được áp dụng.
- **Thiết kế**: Dữ liệu ở đây thường được lưu dưới dạng chuẩn hóa (Normalized) thế hệ 3 (3NF) hoặc Data Vault để dễ dàng tích hợp và mở rộng.

### Gold Layer (Curated/Business Zone)
- **Mục đích**: Dữ liệu sẵn sàng cho BI/Reporting và Analytics. 
- **Đặc điểm**: Áp dụng triệt để phương pháp Dimensional Modeling của **Ralph Kimball**. Dữ liệu được tổ chức thành các lược đồ hình sao (Star Schema).
- **Thiết kế**:
  - **Fact Tables**: Chứa các "sự kiện" có thể đo lường được (như doanh thu, số lượng đơn hàng) với các khóa ngoại trỏ đến Dimension.
  - **Dimension Tables**: Chứa ngữ cảnh của dữ liệu (Khách hàng, Sản phẩm, Thời gian). Các Dimension này thường phải xử lý sự thay đổi theo thời gian (SCD - Slowly Changing Dimensions).

---

## 2. Đánh Đổi Thiết Kế (Design Trade-offs)

### Xử lý SCD Type 2: SQL thuần tuý vs. dbt/Merge
SCD Type 2 (Lưu trữ toàn bộ lịch sử thay đổi của Dimension) là một trong những bài toán khó nhất của Data Warehousing.

**Cách 1: Sử dụng SQL thuần tuý (Truyền thống)**
- **Phương pháp**: Phải viết các Stored Procedures sử dụng kết hợp `UPDATE` (để đóng bản ghi cũ bằng cách set `end_date` và `is_current = 0`) và `INSERT` (để tạo bản ghi mới với `start_date` hiện tại). 
- **Trade-off**: 
  - *Ưu điểm*: Không phụ thuộc vào bất kỳ công cụ bên thứ 3 nào. Có thể chạy trực tiếp trên engine của database.
  - *Nhược điểm*: Mã nguồn cực kì dài, lặp lại (boilerplate) và khó maintain. Việc đảm bảo ACID trong một transaction gồm nhiều câu lệnh phức tạp dễ dẫn đến lỗi khóa bảng (table locks) hoặc "race conditions".

**Cách 2: Sử dụng lệnh `MERGE` hoặc công cụ như dbt**
- **Phương pháp**: 
  - Lệnh `MERGE` (Upsert) cho phép thực hiện cả Insert và Update trong một câu truy vấn duy nhất.
  - **dbt (Data Build Tool)** cung cấp sẵn tính năng **Snapshots** giúp tự động hóa hoàn toàn việc tracking SCD Type 2 thông qua cấu hình vài dòng yaml và SQL `SELECT` đơn giản.
- **Trade-off**:
  - *Ưu điểm*: Tối giản hoá code, giảm thiểu rủi ro sai sót logic. Tối ưu hiệu suất execution.
  - *Nhược điểm*: Thêm dbt vào stack đồng nghĩa với việc tăng độ phức tạp của hệ thống (learning curve mới, cần setup môi trường chạy dbt). Lệnh `MERGE` trên một số Database (như Redshift cũ) có thể không tối ưu bằng thao tác xóa/chèn (Delete/Insert) thông thường.

---

## 3. Rủi Ro Trên Môi Trường Production

Khi dự án vượt ra khỏi quy mô bài tập (sandbox) và bước vào môi trường thực tế, kỹ sư dữ liệu sẽ đối mặt với các bài toán lớn về vận hành:

### Thách thức về Kiểm thử Chất lượng Dữ liệu (Data Quality Tests)
Trong mô hình SQL DWH thuần, việc test dữ liệu thường bị bỏ ngỏ hoặc chỉ là các script kiểm tra thủ công. 
- **Rủi ro**: Nếu hệ thống nguồn đổi cấu trúc, dữ liệu bị NULL bất thường, hoặc khóa chính (PK) bị trùng lặp, Pipeline bằng SQL vẫn sẽ chạy và đẩy rác vào tầng Gold. Báo cáo BI sẽ sai lệch, gây mất niềm tin từ phía doanh nghiệp.
- **Giải pháp**: Cần có cơ chế cảnh báo tự động. Nếu chỉ dùng SQL, bạn phải viết thêm các cảnh báo đếm số dòng, check NULL và gửi email/Slack. Trong thực tế, các team sẽ dùng tính năng Test của dbt hoặc Great Expectations để chặn pipeline lại (fail-fast) trước khi rác lọt vào DWH.

### Bài toán Điều phối Pipeline Phình To (Orchestration Challenges)
Một dự án SQL thuần ban đầu có thể chạy thông qua các Job Scheduler đơn giản (như cron, SQL Server Agent) bằng cách chạy tuần tự File 1, File 2...
- **Rủi ro**: Khi số lượng bảng lên tới hàng trăm, các dependencies (sự phụ thuộc) trở thành một mớ bòng bong. Bảng `Fact_Sales` ở tầng Gold phụ thuộc vào `Dim_Customer` và `Dim_Product`. Nếu `Dim_Customer` chạy lỗi, `Fact_Sales` không được phép chạy. Nếu dùng Cron, bạn không có cách nào quản lý được Cây phụ thuộc (DAG - Directed Acyclic Graph) phức tạp này. Quá trình re-run (chạy lại) dữ liệu của ngày hôm qua khi có lỗi sẽ là một ác mộng.
- **Giải pháp**: Bắt buộc phải áp dụng các công cụ Orchestration chuyên nghiệp như **Apache Airflow**, **Dagster**, hoặc **Prefect** để quản lý lịch trình, tự động thử lại (retry) và alert trực quan.

---

## Tài liệu Tham khảo

- [Github Repository: SQL Data Warehouse Project by DataWithBaraa](https://github.com/DataWithBaraa/sql-data-warehouse-project)
- [Databricks: Medallion Architecture Overview](https://www.databricks.com/glossary/medallion-architecture)
- [Kimball Group: Dimensional Modeling Techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/)
