---
title: Junior to Middle Data Engineer (Kỹ sư dữ liệu thực chiến)
description: Lộ trình nâng cao năng lực thực chiến, từ kỹ sư sơ cấp lên trung cấp với Dimensional Modeling, ETL/ELT và Cloud Data Warehouse.
---

## 1. Đối tượng mục tiêu (Target Audience)

Lộ trình này dành cho:
* Kỹ sư dữ liệu hoặc kỹ sư phần mềm đã đi làm thực tế từ 1-2 năm.
* Những người đã nắm chắc nền tảng cơ bản và muốn nâng cao tư duy thiết kế, tối ưu hóa hệ thống kho dữ liệu phục vụ phân tích (BI).

## 2. Kiến thức tiên quyết (Prerequisites)

* Đã hoàn thành lộ trình Beginner Data Engineer.
* Hiểu biết vững vàng về lập trình cơ bản và thao tác thành thạo trên cơ sở dữ liệu.

## 3. Nội dung lộ trình chi tiết từng bước (Detailed roadmap)

Lộ trình này tập trung vào các kỹ năng cốt lõi của một hệ thống dữ liệu doanh nghiệp tiêu chuẩn:

* **Bước 1: Dimensional Modeling (Mô hình hóa đa chiều)**
  Nắm vững các khái niệm của Ralph Kimball như `Star Schema` (Lược đồ hình sao), `Fact table` (Bảng sự kiện), và `Dimension table` (Bảng chiều dữ liệu) để thiết kế mô hình dữ liệu tối ưu cho phân tích.

* **Bước 2: Kỹ thuật ETL vs ELT**
  Phân biệt rõ hai mô hình tích hợp dữ liệu: Trích xuất - Biến đổi - Tải (ETL) và Trích xuất - Tải - Biến đổi (ELT). Học cách tối ưu hóa quá trình Loading (nạp) dữ liệu số lượng lớn.

* **Bước 3: Phân vùng dữ liệu (Partitioning & Clustering)**
  Kỹ thuật chia nhỏ dữ liệu thành các phân vùng vật lý (Partitioning) và phân cụm (Clustering) trên cơ sở dữ liệu cũng như trên tệp tin (như Parquet) nhằm tăng tốc tối đa tốc độ truy vấn.

* **Bước 4: Change Data Capture (CDC)**
  Tìm hiểu cơ chế theo dõi và thu thập sự thay đổi dữ liệu thời gian thực (CDC) từ các hệ thống OLTP để đồng bộ dữ liệu liên tục sang hệ thống phân tích.

* **Bước 5: Cloud Data Warehouse (Kho dữ liệu đám mây)**
  Làm quen và thực hành trên các kho dữ liệu hiện đại như Google BigQuery hoặc Snowflake. Học cách tối ưu hóa truy vấn OLAP trên các hệ thống phân tán này.

## 4. Dự án thực tế gợi ý (Suggested practical projects)

**Dự án:** Xây dựng luồng dữ liệu phân tích doanh thu E-commerce.
* **Mô tả:** Trích xuất dữ liệu giao dịch từ cơ sở dữ liệu OLTP PostgreSQL. Thiết kế kiến trúc `Star Schema` trong BigQuery. Sử dụng công cụ `dbt` (data build tool) để biến đổi dữ liệu thô thành các bảng Fact và Dimension chuẩn mực, sau đó kết xuất báo cáo doanh thu.
* **Kết quả đầu ra dự kiến:** Tự thiết kế được mô hình dữ liệu đa chiều hoàn chỉnh phục vụ BI, làm chủ tư duy ELT và viết các pipeline tải dữ liệu lớn đảm bảo tính toàn vẹn thông tin.

## 5. Trọng tâm phỏng vấn (Interview focus)

Tại cấp độ Junior tới Middle, nhà tuyển dụng sẽ đánh giá kỹ năng chuyên môn sâu hơn:
* Khả năng thiết kế hệ thống `Star Schema` cho một bài toán thực tế (ví dụ: E-commerce, Logistics).
* Giải thích chi tiết cách xử lý dữ liệu Dimension thay đổi theo thời gian bằng kỹ thuật `Slowly Changing Dimension` (đặc biệt là SCD Type 2).
* Phân biệt rõ ràng kiến trúc và đặc tính của hệ thống OLTP (giao dịch) và OLAP (phân tích).
