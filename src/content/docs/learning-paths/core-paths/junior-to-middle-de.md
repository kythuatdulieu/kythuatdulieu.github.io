---
title: Junior to Middle Data Engineer (Kỹ sư dữ liệu thực chiến)
description: Lộ trình nâng cao năng lực thực chiến, từ kỹ sư sơ cấp lên trung cấp với Dimensional Modeling, ETL/ELT và Cloud Data Warehouse.
sidebar:
  order: 2
prev:
  link: /learning-paths/core-paths/beginner-de/
  label: Beginner Data Engineer
next:
  link: /learning-paths/core-paths/middle-to-senior-de/
  label: Middle to Senior Data Engineer
---

Sự thăng tiến từ Junior lên Middle Data Engineer không nằm ở số năm kinh nghiệm, mà ở sự chuyển dịch từ việc "viết script thực thi" sang **"làm chủ hệ thống" (ownership)** từ đầu đến cuối.

## Mục tiêu lộ trình

* Xây dựng tư duy thiết kế hệ thống và giải quyết các bài toán dữ liệu thực tế tại doanh nghiệp.
* Làm chủ Modern Data Stack (dbt, Cloud Data Warehouse).
* Nâng cao hiệu năng thông qua tối ưu hóa lưu trữ và mô hình hóa.

## Bắt đầu từ đâu? (Prerequisites)

* **Hoàn thành chặng đường:** 👉 **[Beginner Data Engineer](./beginner-de.md)**.
* **Kinh nghiệm:** 1-2 năm thực chiến với SQL, Python, và có hiểu biết về cơ sở dữ liệu.
* **Mong muốn:** Nâng tầm bản thân khỏi các script ETL thủ công, hướng tới tự động hóa và phân tích chuyên sâu.

## Kỹ năng cốt lõi

### 1. Mô hình hóa đa chiều (Dimensional Modeling)
Nền tảng của kiến trúc kho dữ liệu.
* Phân biệt **[Fact table](/concepts/6-data-modeling-transformation/fact-table)** (bảng sự kiện/đo lường) và **[Dimension table](/concepts/6-data-modeling-transformation/dimension-table)** (bảng ngữ cảnh/chiều).
* Nắm vững thiết kế **[Star Schema](/concepts/6-data-modeling-transformation/star-schema)** (Lược đồ hình sao) tối ưu cho các truy vấn phân tích (OLAP).
* Xử lý lịch sử thay đổi với Slowly Changing Dimensions (SCD Type 1, 2, 3).

### 2. Kỹ nghệ Tích hợp dữ liệu (ETL vs ELT)
Sự chuyển dịch kiến trúc dữ liệu đám mây:
* **[ETL](/concepts/2-data-ingestion-integration/etl):** Trích xuất -> Biến đổi -> Tải.
* **[ELT](/concepts/2-data-ingestion-integration/elt):** Trích xuất -> Tải thô vào kho -> Biến đổi bằng sức mạnh của Data Warehouse.
* Sử dụng **dbt (data build tool)** để thực hiện các quy trình `Transform` chuẩn chỉ như phát triển phần mềm (có Version Control, Testing).

### 3. Phân vùng & Phân cụm (Partitioning & Clustering)
Kỹ thuật tối ưu hóa chi phí và tốc độ truy vấn trên dữ liệu cực lớn.
* **[Partitioning](/concepts/3-storage-engines-formats/partitioning):** Chia vật lý dữ liệu (thường theo cột ngày tháng) để engine bỏ qua các phần không liên quan (Partition Pruning).
* **[Clustering](/concepts/3-storage-engines-formats/clustering):** Sắp xếp dữ liệu trong từng phân vùng theo các khóa tìm kiếm phổ biến (ví dụ: `user_id`).

### 4. Đồng bộ thời gian thực với CDC
Chuyển đổi từ nạp dữ liệu toàn bộ (Full Load) sang luồng đồng bộ liên tục.
* **[Change Data Capture (CDC)](/concepts/2-data-ingestion-integration/change-data-capture):** Bắt các sự kiện `INSERT`, `UPDATE`, `DELETE` từ [OLTP](/concepts/3-storage-engines-formats/oltp) database (thông qua Write-Ahead Logs hoặc binlogs) để đồng bộ vào Data Warehouse với độ trễ thấp (Near Real-time).

### 5. Kho dữ liệu đám mây (Cloud Data Warehouse)
Kiến trúc tách biệt Lưu trữ (Storage) và Tính toán (Compute) - Decoupled Architecture.
* Vận hành và tối ưu chi phí trên các nền tảng MPP (Massively Parallel Processing) như **[Google BigQuery](/concepts/3-storage-engines-formats/google-bigquery)** hoặc **[Snowflake](/concepts/3-storage-engines-formats/snowflake)**.

## Dự án thực hành

**Dự án:** Luồng dữ liệu phân tích doanh thu E-commerce bằng Modern Data Stack
* **Công cụ:** PostgreSQL, Airbyte/Fivetran (Ingestion), Google BigQuery (Kho), dbt (Transformation).
* **Nhiệm vụ:**
  1. Cấu hình luồng Ingestion tự động kéo dữ liệu giao dịch từ PostgreSQL vào BigQuery.
  2. Thiết kế mô hình `Star Schema` cho dữ liệu bán hàng.
  3. Viết mô hình dbt để chuẩn hóa và tổng hợp dữ liệu thành bảng báo cáo cuối cùng (Data Mart).
* **Kết quả:** Hiểu rõ cách Modern Data Stack lắp ghép với nhau trong môi trường thực tế.

## Góc phỏng vấn (Interview QA)

* **Mô hình hóa:** Yêu cầu vẽ nhanh kiến trúc bảng cho bài toán ứng dụng gọi xe (Ride-hailing) hoặc chuỗi bán lẻ.
* **OLTP vs OLAP:** Phân tích vì sao hệ thống xử lý giao dịch lại chậm khi phân tích, và giải pháp.
* **Tối ưu:** Làm thế nào để giải quyết sự cố truy vấn quét toàn bộ bảng (Full Table Scan) tốn kém?

## Bước tiếp theo

Khi bạn đã làm chủ hệ thống kho dữ liệu đám mây và mô hình hóa, thách thức tiếp theo là xử lý dữ liệu quy mô "Khổng lồ" (Petabytes) với Spark và Kafka. Hãy tiến lên:
👉 **[Middle to Senior Data Engineer](./middle-to-senior-de.md)**
