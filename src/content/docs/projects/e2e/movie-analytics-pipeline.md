---
title: "Movie Analytics Pipeline: Data Stack Hoàn Toàn Local Với DuckDB, dbt, Airflow"
description: "Phân tích kiến trúc End-to-end Data Pipeline với bộ công cụ Open-source nhẹ gọn chạy 100% trên Local: DuckDB, dbt, Apache Airflow và Apache Superset."
---

# Movie Analytics Pipeline: Xây Dựng Data Stack Hoàn Toàn Trên Local

**Movie Analytics Pipeline** là một dự án Data Engineering End-to-End tuyệt vời dành cho những ai muốn tự tay xây dựng một **Modern Data Stack** nhưng không muốn tốn kém chi phí thuê Cloud (AWS, GCP). Toàn bộ kiến trúc chạy 100% cục bộ trên máy tính cá nhân bằng cách sử dụng các công cụ mã nguồn mở (Open-source) nhẹ nhàng nhưng cực kỳ mạnh mẽ.

> **Mã Nguồn (GitHub):** [kythuatdulieu/movie-analytics-pipeline](https://github.com/kythuatdulieu/movie-analytics-pipeline)
> *(Được fork và tùy chỉnh từ dự án của tác giả George Czelusniak)*

---

## 1. Bài Toán & Nguồn Dữ Liệu

Dự án này giải quyết bài toán phân tích hành vi đánh giá phim của người dùng, sử dụng tập dữ liệu công khai nổi tiếng **[GroupLens Movie Recommendation Dataset](https://grouplens.org/datasets/movielens/)**.

Dữ liệu thô (Raw Data) bao gồm 3 file CSV:
*   `movies.csv`: Chứa danh mục phim (movieId, title, genres).
*   `user_rating_history.csv`: Lịch sử đánh giá phim của tập người dùng chính.
*   `ratings_for_additional_users.csv`: Dữ liệu đánh giá của một nhóm người dùng bổ sung.

---

## 2. Kiến Trúc Hệ Thống (Architecture)

Kiến trúc của dự án được thiết kế chuẩn xác theo mô hình **Medallion Architecture**, phân tách các lớp xử lý dữ liệu từ Raw -> Staging -> Intermediate -> Mart. Thay vì dùng các công cụ nặng nề như Spark hay BigQuery, dự án sử dụng bộ 4 công cụ vàng trong làng "Local Data Stack".

**Công nghệ sử dụng:**
*   **Ingestion:** Python + `DuckDB` (Tải CSV vào Data Warehouse local).
*   **Transformation:** `dbt Core` (Xây dựng các Data Models, Data Quality Tests).
*   **Orchestration:** `Apache Airflow` (Lên lịch và giám sát toàn bộ pipeline).
*   **Serving/BI:** `Apache Superset` (Trực quan hóa dữ liệu qua các Dashboards).
*   **CI/CD:** `GitHub Actions` (Chạy SQL Linter & dbt test mỗi khi có Push).

### Sơ Đồ Xử Lý Dữ Liệu

Quá trình luân chuyển dữ liệu diễn ra như sau:
1. Tập lệnh Python ingest trực tiếp 3 file CSV vào Raw Layer của **DuckDB** - một cơ sở dữ liệu OLAP (phân tích) chạy In-process có tốc độ xử lý nhanh kinh ngạc.
2. Từ Raw Layer, **dbt** tiếp quản và thực hiện các bước biến đổi:
   - **Staging Layer:** Ép kiểu dữ liệu, đổi tên cột theo chuẩn.
   - **Intermediate Layer:** JOIN dữ liệu, gom nhóm và hợp nhất 2 bảng ratings lại làm một.
   - **Mart Layer:** Tạo ra các bảng Analytics-ready để cung cấp dữ liệu cho Superset.
3. Tất cả các bước (từ lúc chạy Python ingestion đến lúc kích hoạt dbt) đều được tự động hóa bằng một **Airflow DAG**.

---

## 3. Điểm Nhấn Kỹ Thuật Nổi Bật

Dự án không chỉ là một bài hướng dẫn chắp vá công cụ, mà nó chứa đựng những giải pháp thiết kế dữ liệu (Data Modeling) rất tinh tế:

*   **Xử lý dữ liệu đa trị (Multi-value data):** Cột `genres` trong file gốc chứa các thể loại phim được nối với nhau bằng dấu `|` (Ví dụ: `Action|Adventure|Sci-Fi`). dbt model đã sử dụng cú pháp `CROSS JOIN unnest(string_split(...))` của DuckDB để chuẩn hóa dữ liệu này về dạng bảng phẳng (flat structure) phục vụ phân tích.
*   **Xử lý bất đồng bộ Format:** Hai file rating đến từ 2 nguồn có định dạng timestamp khác nhau. Pipeline đã dùng hàm `COALESCE(try_strptime(...))` để hợp nhất mượt mà.
*   **Đảm Bảo Chất Lượng Dữ Liệu (Data Quality):** Thay vì chỉ tin tưởng vào code, dự án ứng dụng tính năng `dbt test` để kiểm tra độ trễ, ràng buộc khóa ngoại (relationships), kiểm tra unique, và giới hạn giá trị rating hợp lệ từ 0.5 đến 5.0.

---

## 4. Trực Quan Hóa (BI Dashboards)

Ở tầng trên cùng, **Apache Superset** kết nối với lớp Mart của DuckDB để giải đáp 5 câu hỏi kinh doanh trọng tâm:
1. **Top 10 Movies:** Những bộ phim nào có điểm đánh giá trung bình cao nhất?
2. **Popularity vs Quality:** Có sự tương quan nào giữa số lượng người đánh giá và chất lượng điểm số không?
3. **Ratings Heatmap:** Phân tích yếu tố mùa vụ (tính chu kỳ) trong hành vi đánh giá phim của người dùng.
4. **Genre Performance:** Thể loại phim nào có lượng người xem áp đảo và thể loại nào đạt điểm chất lượng tốt nhất?
5. **User Activity:** Phân phối mức độ tương tác của tập người dùng.

---

## 5. Tổng Kết

Nếu bạn đang tìm kiếm một dự án mẫu để rèn luyện kỹ năng với dbt và Airflow, hoặc muốn khám phá sức mạnh tuyệt vời của **DuckDB** - công cụ đang làm mưa làm gió trong cộng đồng Data Engineering gần đây, thì **Movie Analytics Pipeline** chính là bến đỗ hoàn hảo. Hệ thống nhẹ nhàng, thiết lập cực nhanh bằng Docker Compose và không tốn một xu phí Cloud nào!
