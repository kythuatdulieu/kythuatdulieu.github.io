---
title: Beginner Data Engineer (Kỹ sư dữ liệu nhập môn)
description: Lộ trình học tập cơ bản dành cho người mới bắt đầu làm quen với kỹ thuật dữ liệu, từ SQL, Python đến Data Pipelines.
---

## 1. Đối tượng mục tiêu (Target Audience)

Lộ trình này được thiết kế đặc biệt dành cho:
* Sinh viên ngành Công nghệ thông tin mới ra trường.
* Kỹ sư phần mềm hoặc chuyên viên phân tích dữ liệu (Data Analyst) muốn chuyển hướng sang mảng Data Engineering.
* Những cá nhân chưa có nhiều kinh nghiệm làm việc với các hệ thống dữ liệu quy mô lớn.

## 2. Kiến thức tiên quyết (Prerequisites)

Trước khi bắt đầu lộ trình này, bạn cần trang bị:
* Kỹ năng sử dụng máy tính cơ bản, thao tác tốt trên hệ điều hành.
* Tư duy logic và hiểu biết về thuật toán căn bản.

## 3. Nội dung lộ trình chi tiết từng bước (Detailed roadmap)

Lộ trình nhập môn bao gồm các bước nền tảng cốt lõi nhất:

* **Bước 1: SQL căn bản**
  Làm quen với ngôn ngữ truy vấn cấu trúc: `SELECT`, `JOIN`, `GROUP BY`, `Subqueries`. Đây là kỹ năng sinh tồn để tương tác và trích xuất dữ liệu từ bất kỳ cơ sở dữ liệu nào.

* **Bước 2: Python căn bản**
  Ngôn ngữ lập trình phổ biến nhất trong hệ sinh thái dữ liệu. Nắm vững cấu trúc dữ liệu cơ bản (List, Dictionary, Tuple), kỹ năng đọc/ghi file (File handling), và lập trình hướng đối tượng (OOP) ở mức đơn giản.

* **Bước 3: Relational Database & thiết kế lược đồ quan hệ chuẩn**
  Hiểu về hệ quản trị cơ sở dữ liệu quan hệ (RDBMS). Nắm bắt các quy tắc chuẩn hóa dữ liệu để tránh dư thừa (1NF, 2NF, 3NF).

* **Bước 4: Git & GitHub**
  Học cách sử dụng công cụ quản lý phiên bản mã nguồn. Các lệnh cơ bản như `commit`, `push`, `pull`, và quy trình tạo `pull request` để làm việc nhóm hiệu quả.

* **Bước 5: Khái niệm cơ bản về Data Pipelines**
  Hiểu luồng di chuyển của dữ liệu: `Source` (Nguồn) -> `Extract` (Trích xuất) -> `Load` (Tải) -> `Destination` (Đích). Xây dựng tư duy về đường ống dữ liệu (Data Pipeline).

## 4. Dự án thực tế gợi ý (Suggested practical projects)

**Dự án:** Thu thập và tổng hợp dữ liệu thời tiết tự động.
* **Mô tả:** Xây dựng một pipeline thu thập dữ liệu thời tiết hàng ngày từ OpenWeather API (định dạng JSON). Dùng Python để xử lý, sau đó lưu trữ vào cơ sở dữ liệu SQLite. Cuối cùng, viết script SQL để tính toán và tóm tắt nhiệt độ trung bình.
* **Kết quả đầu ra dự kiến:** Bạn có khả năng viết mã Python gọi API, xử lý JSON, tương tác với PostgreSQL/SQLite và tự động hóa quá trình chạy code định kỳ bằng Linux Cron job.

## 5. Trọng tâm phỏng vấn (Interview focus)

Khi ứng tuyển cho các vị trí Fresher/Beginner, nhà tuyển dụng sẽ tập trung vào:
* Khả năng viết các câu truy vấn SQL ở mức độ trung bình đến khó (bao gồm Window Functions, CTE).
* Giải thích cơ chế `Indexing` trong Cơ sở dữ liệu hoạt động như thế nào để tối ưu truy vấn.
* Thao tác và xử lý linh hoạt mảng (array) / từ điển (dict) trong các bài test thuật toán Python.
