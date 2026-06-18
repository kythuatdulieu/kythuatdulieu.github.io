---
title: "Movie Analytics Pipeline: Data Stack Hoàn Toàn Local Với DuckDB, dbt, Airflow"
description: "Phân tích kiến trúc End-to-end Data Pipeline với bộ công cụ Open-source nhẹ gọn chạy 100% trên Local: DuckDB, dbt, Apache Airflow và Apache Superset."
---

# Movie Analytics Pipeline: Xây Dựng Data Stack Hoàn Toàn Trên Local

**Movie Analytics Pipeline** là một dự án Data Engineering End-to-End tuyệt vời dành cho những ai muốn tự tay xây dựng một **Modern Data Stack** nhưng không muốn tốn kém chi phí thuê Cloud (AWS, GCP). Toàn bộ kiến trúc chạy 100% cục bộ trên máy tính cá nhân bằng cách sử dụng các công cụ mã nguồn mở (Open-source) nhẹ nhàng nhưng cực kỳ mạnh mẽ.

> **Mã Nguồn (GitHub):** [kythuatdulieu/movie-analytics-pipeline](https://github.com/kythuatdulieu/movie-analytics-pipeline)
> *(Được fork và tùy chỉnh từ dự án của tác giả George Czelusniak)*

---

## 1. Kiến Trúc Tổng Quan (High-Level Architecture)

Kiến trúc của dự án được thiết kế chuẩn xác theo mô hình **Medallion Architecture**, phân tách các lớp xử lý dữ liệu từ Raw -> Staging -> Intermediate -> Mart. 

Thay vì dùng các công cụ nặng nề như Spark hay BigQuery, dự án sử dụng bộ 4 công cụ vàng trong làng "Local Data Stack":
*   **Ingestion:** Python + `DuckDB` (Tải CSV vào Data Warehouse local).
*   **Transformation:** `dbt Core` (Xây dựng các Data Models, Data Quality Tests).
*   **Orchestration:** `Apache Airflow` (Lên lịch và giám sát toàn bộ pipeline).
*   **Serving/BI:** `Apache Superset` (Trực quan hóa dữ liệu qua các Dashboards).

![High Level Architecture](https://raw.githubusercontent.com/kythuatdulieu/movie-analytics-pipeline/main/docs/images/high_level_architecture.jpg)
*Hình 1: Kiến trúc tổng quan của hệ thống chạy hoàn toàn bằng Docker Compose*

---

## 2. Bài Toán & Nguồn Dữ Liệu

Dự án này giải quyết bài toán phân tích hành vi đánh giá phim của người dùng, sử dụng tập dữ liệu công khai nổi tiếng **[GroupLens Movie Recommendation Dataset](https://grouplens.org/datasets/movielens/)**.

Dữ liệu thô (Raw Data) bao gồm 3 file CSV:
*   `movies.csv`: Chứa danh mục phim (`movieId`, `title`, `genres`).
*   `user_rating_history.csv`: Lịch sử đánh giá phim của tập người dùng chính.
*   `ratings_for_additional_users.csv`: Dữ liệu đánh giá của một nhóm người dùng bổ sung.

---

## 3. Luồng Xử Lý Dữ Liệu Với dbt (Data Modeling Flow)

dbt đảm nhận vai trò cực kỳ quan trọng trong việc chuẩn hóa và biến đổi dữ liệu. Pipeline được chia thành 3 lớp rõ rệt:

![Data Modeling Flow](https://raw.githubusercontent.com/kythuatdulieu/movie-analytics-pipeline/main/docs/images/data_modeling_flow_dbt.png)
*Hình 2: Dòng chảy dữ liệu (Lineage Graph) được gen tự động bởi dbt docs*

1. **Staging Layer (Lớp Đồng Bộ):** Chứa các model như `stg_movies`, `stg_user_rating_history`. Nhiệm vụ chính là ánh xạ 1:1 với dữ liệu gốc, ép kiểu dữ liệu (Type casting) và đổi tên cột cho chuẩn mực.
2. **Intermediate Layer (Lớp Trung Gian):** Nơi chứa logic nghiệp vụ cốt lõi. Chẳng hạn model `int_ratings_unified` thực hiện thao tác `UNION ALL` để gom 2 nguồn file rating lại làm một. Model `int_movie_kpi` tính toán các chỉ số tổng hợp cho từng bộ phim.
3. **Marts Layer (Lớp Trình Bày):** Các bảng Analytics-ready được tạo ra dành riêng cho công cụ BI (Superset), ví dụ như `mart_top_movies`, `mart_genre_performance`.

### Điểm Nhấn Kỹ Thuật
*   **Xử lý dữ liệu đa trị (Multi-value data):** Cột `genres` trong file gốc chứa các thể loại phim được nối với nhau bằng dấu `|` (Ví dụ: `Action|Adventure|Sci-Fi`). dbt model đã sử dụng cú pháp `CROSS JOIN unnest(string_split(...))` của DuckDB để chuẩn hóa dữ liệu này về dạng flat.
*   **Xử lý bất đồng bộ Format:** Hai file rating đến từ 2 nguồn có định dạng timestamp khác nhau. Pipeline đã dùng hàm `COALESCE(try_strptime(...))` để hợp nhất mượt mà.
*   **Đảm Bảo Chất Lượng Dữ Liệu (Data Quality):** Ứng dụng `dbt test` để kiểm tra `not_null`, ràng buộc khóa ngoại (relationships), và giới hạn giá trị rating hợp lệ từ 0.5 đến 5.0.

---

## 4. Giải Ảo Hệ Thống Điều Phối Apache Airflow

Rất nhiều người mới học Data Engineering thường có những hiểu lầm cơ bản về cách Airflow và Docker hoạt động cùng nhau. 

**Hiểu lầm #1: "Một container Docker sẽ khởi động khi pipeline bắt đầu chạy"**
*Sự thật:* Các container của Airflow chạy **liên tục 24/7**. Trái tim của hệ thống là `airflow-scheduler` luôn thức để kiểm tra xem có DAG nào đến giờ chạy chưa. Container chỉ dừng khi bạn ra lệnh tắt máy.

**Hiểu lầm #2: "Mã nguồn project được copy vào bên trong container"**
*Sự thật:* Dự án sử dụng khái niệm **Volume** (thư mục dùng chung). Khi container chạy lệnh ở thư mục `/opt/app`, nó thực chất đang nhìn thẳng vào thư mục mã nguồn trên máy tính gốc của bạn. Bạn sửa code trên VS Code, container nhìn thấy ngay lập tức.

### Cách một luồng pipeline diễn ra:
Khi một luồng chạy (DAG run) được kích hoạt, Scheduler không bật container mới, nó chỉ ra lệnh cho container đang chạy thực thi chuỗi các lệnh tuần tự:
1. `ingest_raw_data`: Chạy file Python load CSV vào DuckDB.
2. `dbt_run`: Chỉ chạy nếu bước 1 thành công. Lệnh `dbt run` xử lý toàn bộ model.
3. `dbt_test`: Chạy các test case chất lượng dữ liệu.
4. `dbt_docs_generate`: Render lại giao diện Data Catalog của dbt.

---

## 5. Trực Quan Hóa (BI Dashboards) Cùng Superset

Ở tầng trên cùng, **Apache Superset** kết nối với lớp Mart của DuckDB để giải đáp 5 câu hỏi kinh doanh trọng tâm thông qua các biểu đồ tương tác:

![Superset Dashboard](https://raw.githubusercontent.com/kythuatdulieu/movie-analytics-pipeline/main/docs/images/dashboard.jpg)
*Hình 3: Giao diện phân tích tương tác trên Apache Superset*

1. **Top 10 Movies:** Những bộ phim nào có điểm đánh giá trung bình cao nhất (yêu cầu tối thiểu 20 lượt vote)?
2. **Popularity vs Quality:** Có sự tương quan nào giữa số lượng người đánh giá và chất lượng điểm số không?
3. **Ratings Heatmap:** Phân tích yếu tố mùa vụ (tính chu kỳ) trong hành vi đánh giá phim của người dùng.
4. **Genre Performance:** Thể loại phim nào có lượng người xem áp đảo và thể loại nào đạt điểm chất lượng tốt nhất?

---

## 6. Tổng Kết

Nếu bạn đang tìm kiếm một dự án mẫu để rèn luyện kỹ năng với dbt và Airflow, hoặc muốn khám phá sức mạnh tuyệt vời của **DuckDB** - công cụ đang làm mưa làm gió trong cộng đồng Data Engineering gần đây, thì **Movie Analytics Pipeline** chính là bến đỗ hoàn hảo. Hệ thống nhẹ nhàng, thiết lập cực nhanh bằng Docker Compose và không tốn một xu phí Cloud nào!
