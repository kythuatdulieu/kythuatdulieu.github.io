---
title: Beginner Data Engineer (Kỹ sư dữ liệu nhập môn)
description: Lộ trình học tập cơ bản dành cho người mới bắt đầu làm quen với kỹ thuật dữ liệu, từ SQL, Python đến Data Pipelines.
sidebar:
  order: 1
next:
  link: /learning-paths/core-paths/junior-to-middle-de/
  label: Junior to Middle Data Engineer
---

Lộ trình **Beginner Data Engineer** là bước đệm đầu tiên giúp bạn xây dựng nền tảng vững chắc về lập trình, cơ sở dữ liệu và quản lý mã nguồn.

## Mục tiêu lộ trình

* Cung cấp nền tảng tư duy lập trình và xử lý dữ liệu.
* Làm quen với ngôn ngữ chuẩn của ngành: **Python** và **SQL**.
* Hiểu cách dữ liệu vận hành qua một Data Pipeline cơ bản.

## Bắt đầu từ đâu? (Prerequisites)

* **Tin học cơ bản:** Sử dụng thành thạo máy tính (Windows/macOS/Linux).
* **Tư duy logic:** Hiểu biết cơ bản về thuật toán.
* **Định hướng:** Sinh viên IT, Software Engineer, hoặc Data Analyst muốn chuyển hướng sang [Data Engineering](/concepts/1-distributed-systems-architecture/data-engineering/).

## Kỹ năng cốt lõi

### 1. SQL Căn bản (Bắt buộc)
SQL là "ngôn ngữ mẹ đẻ" của dữ liệu. Bạn cần thành thạo:
* Truy vấn cơ bản: `SELECT`, `WHERE`, `JOIN`, `GROUP BY`.
* Kỹ thuật nâng cao: `Subqueries`, `Window Functions`, `CTEs`.
> [!TIP]
> **Thực hành:** Sử dụng [Mode Analytics SQL Tutorial](https://mode.com/sql-tutorial/) để luyện tập truy vấn tương tác.

### 2. Python - Ngôn ngữ thao tác dữ liệu
Python được sử dụng rộng rãi nhờ tính đơn giản và hệ sinh thái phong phú.
* **Cấu trúc dữ liệu:** List, Dictionary, Tuple, Set.
* **Kỹ thuật lập trình:** OOP (Hướng đối tượng), thao tác file, xử lý lỗi (Try/Catch).
> [!NOTE]
> Không cần học các framework web (Django/Flask). Tập trung vào xử lý dữ liệu thô thô và sử dụng thư viện như `pandas` ở mức cơ bản.

### 3. Cơ sở dữ liệu quan hệ (RDBMS)
Hiểu cách dữ liệu được lưu trữ và tối ưu:
* Các hệ quản trị phổ biến: PostgreSQL, MySQL.
* Các dạng chuẩn hóa dữ liệu (1NF, 2NF, 3NF).

### 4. Git & GitHub
Theo dõi và quản lý các phiên bản mã nguồn:
* Lệnh cơ bản: `commit`, `push`, `pull`.
* Quy trình làm việc nhóm: Tạo nhánh (Branching), mở Pull Request (PR).

### 5. Khái niệm Data Pipeline & Điều phối
Hiểu luồng di chuyển dữ liệu từ nguồn đến đích.
* **ETL/ELT:** Trích xuất (Extract), Biến đổi (Transform), Tải (Load).
* **Điều phối (Orchestration):** Làm quen cơ bản với khái niệm tự động hóa tác vụ định kỳ (Cron) hoặc công cụ như **Apache Airflow**.

## Dự án thực hành

**Dự án:** Thu thập dữ liệu thời tiết tự động
* **Công cụ:** Python, OpenWeather API, PostgreSQL, Cron.
* **Nhiệm vụ:**
  1. Dùng Python gọi OpenWeather API lấy dữ liệu JSON.
  2. Làm sạch dữ liệu và lưu vào bảng PostgreSQL.
  3. Viết script SQL tính nhiệt độ trung bình.
  4. Đặt lịch chạy tự động hàng ngày bằng Cron job.
* **Kết quả:** Sở hữu pipeline dữ liệu end-to-end đầu tiên.

## Góc phỏng vấn (Interview QA)
* **SQL:** Xử lý dữ liệu trùng lặp, tính tổng lũy kế (Running Total) với Window Functions.
* **Tối ưu:** Giải thích `Indexing` giúp tăng tốc độ truy vấn như thế nào?
* **Python:** Xử lý chuỗi, dict và mảng hiệu quả.

## Bước tiếp theo
Sau khi hoàn thiện nền tảng, bạn đã sẵn sàng đối mặt với các hệ thống phân tán và dữ liệu lớn. Hãy chuyển sang chặng đường tiếp theo:
👉 **[Junior to Middle Data Engineer](/learning-paths/core-paths/junior-to-middle-de/)**
