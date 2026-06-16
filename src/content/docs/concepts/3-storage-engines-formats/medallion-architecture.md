---
title: "Kiến trúc Medallion - Medallion Architecture"
difficulty: "Beginner"
tags: ["medallion-architecture", "data-lakehouse", "bronze", "silver", "gold", "databricks"]
readingTime: "10 mins"
lastUpdated: 2026-06-16
seoTitle: "Medallion Architecture là gì? Kiến trúc Bronze - Silver - Gold trong Lakehouse"
metaDescription: "Tìm hiểu chi tiết về Medallion Architecture (Kiến trúc phân lớp dữ liệu Đồng - Bạc - Vàng) phổ biến trong Data Lakehouse và Databricks. Vai trò của từng lớp dữ liệu."
description: "Kiến trúc Medallion (hay cấu trúc Bronze - Silver - Gold) là một mẫu thiết kế quản lý dữ liệu phổ biến trong kỷ nguyên Data Lakehouse, giúp kiểm soát, làm sạch và tối ưu hóa dữ liệu."
---



Khi phong trào xây dựng **[Data Lake](/concepts/data-lake-lakehouse/data-lake/) (Hồ dữ liệu)** bùng nổ, nhiều doanh nghiệp đã hào hứng đổ tất cả mọi nguồn dữ liệu vào chung một chỗ với hy vọng có thể phân tích được mọi thứ. Kết quả? Data Lake nhanh chóng biến thành một **Data Swamp (Đầm lầy dữ liệu)** - nơi chứa dữ liệu rác, không có cấu trúc, thiếu độ tin cậy và không thể sử dụng để ra quyết định kinh doanh.

Để giải quyết triệt để vấn đề này, Databricks đã đưa ra khái niệm **Medallion Architecture (Kiến trúc Medallion)**.

Medallion Architecture (hay còn gọi là kiến trúc phân lớp Bronze - Silver - Gold) là một design pattern (mẫu thiết kế) tiêu chuẩn để tổ chức cấu trúc dữ liệu theo từng mức độ chất lượng trong một **[Data Lakehouse](/concepts/data-lake-lakehouse/data-lakehouse/)**. Thiết kế này giúp đảm bảo dữ liệu luôn được kiểm soát, từng bước làm sạch, chuẩn hóa và nâng cao chất lượng từ khi được đưa vào (Ingestion) cho đến khi được tiêu thụ (Consumption).

---

## 1. Nguyên lý cốt lõi của Kiến trúc Medallion

Nguyên lý cơ bản của kiến trúc này là luân chuyển và tinh chế dữ liệu qua các lớp (layer) có mức độ làm sạch, cấu trúc và tổng hợp tăng dần. Cấu trúc này thường được xây dựng trên các định dạng bảng mở hỗ trợ giao dịch ACID mạnh mẽ như **[Delta Lake](/concepts/3-storage-engines-formats/delta-lake/)**, **Apache Iceberg**, hoặc **Apache Hudi**.

Ba lớp dữ liệu tiêu chuẩn bao gồm:
- **Bronze Layer (Đồng):** Nơi chứa dữ liệu thô, giữ nguyên bản từ các hệ thống nguồn.
- **Silver Layer (Bạc):** Dữ liệu đã được làm sạch, chuẩn hóa, lọc bỏ lỗi và hợp nhất.
- **Gold Layer (Vàng):** Dữ liệu được tổng hợp, biến đổi theo nhu cầu nghiệp vụ để phục vụ phân tích (BI) và Machine Learning.

---

## 2. Chi tiết các lớp dữ liệu (Data Layers)

### 2.1. Bronze Layer (Lớp Đồng) - Nơi chứa Dữ liệu thô (Raw Data)

**Mục đích:** Là điểm hạ cánh đầu tiên (Landing Zone) của dữ liệu từ các hệ thống nguồn (Database OLTP, API, IoT Sensors, Logs hệ thống, Event Streams...). 

**Đặc điểm và Tác vụ:**
- **Không thay đổi (Immutable):** Dữ liệu được nạp vào dưới dạng Append-only (chỉ thêm mới). Hiếm khi thực hiện Update hay Delete ở lớp này.
- **Giữ nguyên trạng (As-is):** Dữ liệu giữ đúng cấu trúc (schema) và định dạng từ nguồn (thường là định dạng JSON, CSV, thô Parquet).
- **Lưu trữ toàn bộ lịch sử (Historical Archive):** Đây là bản sao lưu hoàn hảo của dữ liệu nguồn theo thời gian. Nếu có lỗi xử lý logic xảy ra ở các lớp sau, Data Engineer luôn có thể chạy lại quy trình (re-process) từ dữ liệu ở Bronze.
- **Bổ sung Metadata:** Thường thêm các cột metadata để phục vụ việc tracking và debug như `_load_timestamp` (thời điểm lấy dữ liệu vào Bronze), `_source_file` (tên file gốc), hoặc `_batch_id`.

### 2.2. Silver Layer (Lớp Bạc) - Nguồn Sự thật Doanh nghiệp (Enterprise Truth)

**Mục đích:** Xóa bỏ sự lộn xộn của dữ liệu thô, cung cấp một phiên bản dữ liệu sạch sẽ, đã được chuẩn hóa và đáng tin cậy. Đây được coi là *Single Source of Truth* cho các phân tích ở mức độ chi tiết (granularity).

**Đặc điểm và Tác vụ:**
- **Kiểm soát Lược đồ (Schema Enforcement):** Kiểm tra và ép kiểu dữ liệu chặt chẽ (ví dụ: chuỗi ngày tháng dạng string sang kiểu `DATE` hoặc `TIMESTAMP`).
- **Data Cleansing (Làm sạch):** Xử lý các giá trị null, thay thế giá trị ngoại lệ, sửa lỗi định dạng. Dữ liệu lỗi có thể bị loại bỏ hoặc được đẩy vào các "bảng cách ly" (Quarantine tables) để kiểm tra sau.
- **Deduplication (Loại bỏ trùng lặp):** Đảm bảo mỗi bản ghi (record) là duy nhất dựa trên một Primary Key nhất định.
- **Data Integration (Hợp nhất dữ liệu):** Kết hợp các bảng riêng lẻ thành các thực thể đại diện cho các khái niệm doanh nghiệp. (Ví dụ: Kết nối dữ liệu Khách hàng từ CRM và hệ thống Website).
- **SCD (Slowly Changing Dimensions):** Cập nhật thay đổi trạng thái của các thực thể theo thời gian thông qua các kỹ thuật SCD (như SCD Type 2) sử dụng `MERGE INTO`.

### 2.3. Gold Layer (Lớp Vàng) - Sẵn sàng cho Nghiệp vụ (Business Ready)

**Mục đích:** Dữ liệu ở lớp này được tinh chỉnh, lọc và tổng hợp dựa trên các yêu cầu kinh doanh hoặc Use-Case cụ thể. Đây là lớp trực tiếp "nói chuyện" với hệ thống Business Intelligence (BI), Dashboard, và hệ thống báo cáo.

**Đặc điểm và Tác vụ:**
- **Tổng hợp (Aggregation):** Thực hiện tính toán, group by (Ví dụ: Doanh thu trung bình theo tháng, Tỉ lệ user active hàng ngày, Số đơn hàng thành công theo khu vực).
- **Mô hình hóa dữ liệu (Data Modeling):** Thường được tổ chức theo các mô hình thiết kế dành cho phân tích như **Star Schema** (Mô hình sao với các Fact và Dimension tables) để tối ưu hóa truy vấn cho BI tools.
- **Tối ưu hóa hiệu suất:** Bảng Gold phục vụ hàng ngàn truy vấn đọc mỗi ngày nên thường được áp dụng các chiến thuật tối ưu hóa khắt khe như **Partitioning**, **Z-Ordering**, hoặc Liquid Clustering.
- **Bảo mật và Ẩn danh:** Ẩn (Mask) hoặc loại bỏ hoàn toàn các thông tin cá nhân nhạy cảm (PII) trước khi phân quyền truy cập cho người dùng cuối.

---

## 3. Tại sao Medallion Architecture lại quan trọng?

1. **Khả năng Tái cấu trúc và Phục hồi (Reproducibility):** Vì dữ liệu nguyên bản luôn được bảo tồn ở Bronze layer, bất kể lúc nào Logic nghiệp vụ thay đổi hoặc có lỗi ở Silver/Gold, bạn có thể tự tin xóa và tính toán lại (recompute) toàn bộ luồng từ đầu.
2. **Quản lý chất lượng dữ liệu theo từng bước:** Thay vì làm sạch dữ liệu trong một câu lệnh ETL/ELT khổng lồ và phức tạp, quá trình này được chia nhỏ. Data Engineer và Analyst có thể dễ dàng kiểm thử (test) từng lớp dữ liệu.
3. **Phân quyền truy cập rõ ràng (RBAC - Role-Based Access Control):** 
    - **Bronze:** Chỉ nhóm Data Engineering hoặc các Service Account hệ thống mới được phép truy cập.
    - **Silver:** Cho phép Data Engineer, Data Scientist, và Advanced Analyst truy vấn dữ liệu thô nhưng đã sạch.
    - **Gold:** Được chia sẻ rộng rãi cho Data Analyst, Business Users, và các hệ thống Report/BI.
4. **Hỗ trợ liền mạch cho Batch và Streaming:** Kiến trúc này hoạt động hoàn hảo cho cả hai luồng xử lý lô và thời gian thực. Các framework như Spark Structured Streaming có thể liên tục đọc từ bảng Delta Bronze, biến đổi, và lưu vào Silver với độ trễ cực thấp.

---

## 4. Medallion so với Data Warehouse truyền thống

Nếu bạn đã quen thuộc với mô hình Data Warehouse cổ điển (Staging -> ODS -> DWH -> Data Mart), bạn sẽ nhận thấy cấu trúc Medallion khá tương đồng:

| Data Warehouse Truyền Thống | Lakehouse (Medallion) | Đặc điểm chính |
|-----------------|---------------------|-------|
| **Staging Area** | **Bronze** | Chứa dữ liệu thô. Trong DWH, Staging thường bị xóa định kỳ. Trong Lakehouse, Bronze thường lưu trữ dài hạn nhờ chi phí rẻ của Object Storage. |
| **ODS / DWH Core** | **Silver** | Nơi hợp nhất dữ liệu ở cấp độ toàn doanh nghiệp (Enterprise View), đã được làm sạch và deduplicate. |
| **Data Marts** | **Gold** | Chuyên biệt hóa cho từng phòng ban (Sales, Marketing) hoặc các báo cáo cụ thể. |

**Sự khác biệt cốt lõi:** 
Trong DWH, quá trình di chuyển dữ liệu giữa các máy chủ (từ DB này sang DB khác) rất cồng kềnh. Trong Medallion trên Lakehouse, **tất cả** dữ liệu đều nằm yên trên một hệ thống lưu trữ phân tán duy nhất (ví dụ Amazon S3, Google Cloud Storage, Azure Data Lake Storage). Việc dữ liệu "chảy" từ Bronze -> Silver -> Gold chỉ đơn thuần là việc Engine tính toán ghi các file tĩnh (như Parquet/Delta) vào các thư mục phân tách logic khác nhau.

---

## 5. Ví dụ thực tiễn: Hệ thống Quản lý Đơn hàng E-commerce

Giả sử bạn cần xây dựng Data Pipeline để theo dõi doanh số cho một nền tảng thương mại điện tử:

1. **Data Source:** Hệ thống Backend phát ra các sự kiện đơn hàng dưới dạng chuỗi JSON qua Apache Kafka.
2. **Vào lớp Bronze (`/bronze/orders/`):** Một tiến trình lưu thô tất cả message từ Kafka xuống hệ thống. Schema chỉ có 2 cột: `ingested_time` và `raw_payload` (chứa toàn bộ chuỗi JSON). Dữ liệu này có thể chứa cả các đơn hàng test hoặc định dạng lỗi.
3. **Tinh luyện sang Silver (`/silver/orders/`):** Spark Job đọc từ Bronze, parse JSON thành các cột cụ thể (`order_id`, `customer_id`, `price`, `status`). Job này sẽ loại bỏ các dòng thiếu `order_id`, đổi tên khách hàng sang chữ in hoa, và lưu dữ liệu dưới định dạng Delta Lake chuẩn hóa.
4. **Lên báo cáo ở Gold (`/gold/daily_revenue_by_region/`):** Một dbt model định kỳ chạy mỗi tiếng, đọc bảng Silver, `JOIN` với bảng thông tin khách hàng, thực hiện `GROUP BY` để tính "Tổng doanh thu hàng ngày theo khu vực". Dashboard trên Power BI kết nối trực tiếp vào bảng Gold này và có tốc độ load tính bằng mili-giây.

---

## 6. Tổng kết

Medallion Architecture không phải là một công cụ phần mềm, mà là một **tư duy hệ thống và quy chuẩn thiết kế**. Bằng cách phân định rõ ràng vai trò và trạng thái vòng đời của dữ liệu qua các lớp Đồng - Bạc - Vàng, các kỹ sư dữ liệu có thể xây dựng các Data Pipeline có tính module hóa cao, dễ bảo trì, linh hoạt trong xử lý lỗi, và mang lại giá trị cao nhất cho doanh nghiệp từ khối dữ liệu thô sơ.

## Tài Liệu Tham Khảo
* [What is a Medallion Architecture? - Databricks](https://www.databricks.com/glossary/medallion-architecture)
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
