---
title: "Movie Analytics Pipeline: Data Stack Hoàn Toàn Local Với DuckDB, dbt, Airflow"
description: "Phân tích kiến trúc End-to-end Data Pipeline với bộ công cụ Open-source nhẹ gọn chạy 100% trên Local: DuckDB, dbt, Apache Airflow và Apache Superset."
difficulty: "Beginner"
tags: ["duckdb", "dbt", "airflow", "superset", "medallion", "local-data-stack", "e2e-project"]
readingTime: "15 mins"
lastUpdated: 2026-07-11
seoTitle: "Dự án Local Data Stack: DuckDB, dbt Core, Airflow, Superset"
metaDescription: "Xây dựng Modern Data Stack chạy 100% local với DuckDB, dbt, Airflow và Superset. Kèm code dbt model, giải thích vectorized execution và các bẫy single-writer của DuckDB."
domains: ["DE"]
level: "Junior"
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

**Vì sao DuckDB gánh được vai trò Warehouse?** DuckDB là OLAP engine **in-process** (nhúng thẳng vào Python, không cần server) với storage dạng cột và **vectorized execution** — xử lý dữ liệu theo batch ~2048 giá trị/lần thay vì từng dòng, tận dụng CPU cache và SIMD. Trên tập MovieLens 25M dòng rating, các aggregate `GROUP BY` chạy trong vài trăm mili-giây trên laptop — điều Postgres (row-based, tối ưu [OLTP](/concepts/3-storage-engines-formats/oltp/)) không làm nổi ở tốc độ đó. Đọc thêm: [Columnar Storage](/concepts/3-storage-engines-formats/columnar-storage/) và [OLAP](/concepts/3-storage-engines-formats/olap/).

![High Level Architecture](/images/projects/e2e/movie-analytics-pipeline/47d9e4dd.jpg)
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

![Data Modeling Flow](/images/projects/e2e/movie-analytics-pipeline/47113fa7.png)
*Hình 2: Dòng chảy dữ liệu (Lineage Graph) được gen tự động bởi dbt docs*

1. **Staging Layer (Lớp Đồng Bộ):** Chứa các model như `stg_movies`, `stg_user_rating_history`. Nhiệm vụ chính là ánh xạ 1:1 với dữ liệu gốc, ép kiểu dữ liệu (Type casting) và đổi tên cột cho chuẩn mực.
2. **Intermediate Layer (Lớp Trung Gian):** Nơi chứa logic nghiệp vụ cốt lõi. Chẳng hạn model `int_ratings_unified` thực hiện thao tác `UNION ALL` để gom 2 nguồn file rating lại làm một. Model `int_movie_kpi` tính toán các chỉ số tổng hợp cho từng bộ phim.
3. **Marts Layer (Lớp Trình Bày):** Các bảng Analytics-ready được tạo ra dành riêng cho công cụ BI (Superset), ví dụ như `mart_top_movies`, `mart_genre_performance`.

### Điểm Nhấn Kỹ Thuật
*   **Xử lý dữ liệu đa trị (Multi-value data):** Cột `genres` trong file gốc chứa các thể loại phim được nối với nhau bằng dấu `|` (Ví dụ: `Action|Adventure|Sci-Fi`). dbt model đã sử dụng cú pháp `CROSS JOIN unnest(string_split(...))` của DuckDB để chuẩn hóa dữ liệu này về dạng flat:

```sql
-- models/staging/stg_movie_genres.sql
-- Chuẩn hóa cột đa trị 'Action|Adventure|Sci-Fi' về dạng 1 dòng/thể loại
SELECT
    movie_id,
    TRIM(g.genre) AS genre
FROM {{ ref('stg_movies') }}
CROSS JOIN UNNEST(STRING_SPLIT(genres, '|')) AS g(genre)
WHERE genres != '(no genres listed)'
```

*   **Xử lý bất đồng bộ Format:** Hai file rating đến từ 2 nguồn có định dạng timestamp khác nhau. Pipeline đã dùng hàm `COALESCE(try_strptime(...))` để hợp nhất mượt mà — `try_strptime` trả `NULL` thay vì ném exception khi sai format, một mẫu defensive parsing đáng học.
*   **Đảm Bảo Chất Lượng Dữ Liệu (Data Quality):** Ứng dụng `dbt test` để kiểm tra `not_null`, ràng buộc khóa ngoại (relationships), và giới hạn giá trị rating hợp lệ từ 0.5 đến 5.0:

```yaml
# models/staging/_stg__models.yml
- name: stg_ratings
  columns:
    - name: rating
      tests:
        - not_null
        - dbt_utils.accepted_range: {min_value: 0.5, max_value: 5.0}
    - name: movie_id
      tests:
        - relationships: {to: ref('stg_movies'), field: movie_id}
```

*   **Chiến lược Materialization:** Staging để `view` (không tốn dung lượng, luôn tươi), Intermediate và Marts để `table` (Superset query nhanh, không phải tính lại logic UNION/aggregate mỗi lần). Đây chính là trade-off kinh điển được phân tích trong bài [Materialization](/concepts/6-data-modeling-transformation/materialization/) và [dbt Models](/concepts/6-data-modeling-transformation/dbt-models/).

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

```python
ingest = PythonOperator(task_id="ingest_raw_data", python_callable=load_csvs)
run    = BashOperator(task_id="dbt_run",  bash_command="dbt run  --project-dir /opt/app/dbt")
test   = BashOperator(task_id="dbt_test", bash_command="dbt test --project-dir /opt/app/dbt")
docs   = BashOperator(task_id="dbt_docs_generate", bash_command="dbt docs generate ...")

ingest >> run >> test >> docs   # test fail → docs không chạy, DAG đỏ, có alert
```

Thứ tự `dbt_test` **sau** `dbt_run` nhưng **trước** khi dashboard được coi là đáng tin chính là dạng sơ khai của quality gate — cùng tư tưởng với [Data Testing](/concepts/7-dataops-orchestration-quality/data-testing/) và [DAG dependency](/concepts/7-dataops-orchestration-quality/task-dependency/).

---

## 5. Trực Quan Hóa (BI Dashboards) Cùng Superset

Ở tầng trên cùng, **Apache Superset** kết nối với lớp Mart của DuckDB để giải đáp 5 câu hỏi kinh doanh trọng tâm thông qua các biểu đồ tương tác:

![Superset Dashboard](/images/projects/e2e/movie-analytics-pipeline/d9370483.jpg)
*Hình 3: Giao diện phân tích tương tác trên Apache Superset*

1. **Top 10 Movies:** Những bộ phim nào có điểm đánh giá trung bình cao nhất (yêu cầu tối thiểu 20 lượt vote)?
2. **Popularity vs Quality:** Có sự tương quan nào giữa số lượng người đánh giá và chất lượng điểm số không?
3. **Ratings Heatmap:** Phân tích yếu tố mùa vụ (tính chu kỳ) trong hành vi đánh giá phim của người dùng.
4. **Genre Performance:** Thể loại phim nào có lượng người xem áp đảo và thể loại nào đạt điểm chất lượng tốt nhất?

---

## 6. Giới Hạn Của Stack Này (Đọc Trước Khi Bê Lên Production)

1. **DuckDB là single-writer:** chỉ một process được ghi vào file `.duckdb` tại một thời điểm. Nếu `dbt_run` đang chạy mà Superset giữ connection ghi, bạn sẽ gặp lock conflict. Dự án né bằng cách cho Superset đọc qua connection `read_only=true` — nhưng đây là giới hạn kiến trúc thật sự so với warehouse client-server.
2. **Không có isolation giữa các môi trường:** dev/prod chung một file database. Chuẩn hơn: mỗi môi trường một file + biến `target` trong `profiles.yml` của dbt.
3. **Scale trần khoảng vài trăm GB:** DuckDB xử lý out-of-core khá tốt, nhưng khi dữ liệu vượt RAM nhiều lần và cần concurrency cao, đó là lúc chuyển sang [MPP warehouse](/concepts/4-compute-engines-batch/mpp-architecture-dremel/) hoặc [Lakehouse](/concepts/3-storage-engines-formats/lakehouse/).
4. **Airflow ở đây dùng LocalExecutor** — đủ cho local, nhưng nên biết sự khác biệt với Celery/K8s Executor khi lên môi trường thật: xem [Airflow Celery vs K8s Executor](/concepts/7-dataops-orchestration-quality/airflow-celery-vs-k8s-executor/).

## 7. Tổng Kết

Nếu bạn đang tìm kiếm một dự án mẫu để rèn luyện kỹ năng với dbt và Airflow, hoặc muốn khám phá sức mạnh tuyệt vời của **DuckDB** - công cụ đang làm mưa làm gió trong cộng đồng Data Engineering gần đây, thì **Movie Analytics Pipeline** chính là bến đỗ hoàn hảo. Hệ thống nhẹ nhàng, thiết lập cực nhanh bằng Docker Compose và không tốn một xu phí Cloud nào — trong khi vẫn dạy bạn đủ các khái niệm chuyển thẳng lên production được: medallion, materialization, quality gate và orchestration.

## Nguồn Tham Khảo

- [MovieLens Datasets](https://grouplens.org/datasets/movielens/) - GroupLens Research.
- [DuckDB Documentation](https://duckdb.org/docs/) - DuckDB Foundation.
- [Why DuckDB](https://duckdb.org/why_duckdb) - DuckDB Foundation (kiến trúc in-process, vectorized execution).
- [dbt Materializations](https://docs.getdbt.com/docs/build/materializations) - dbt Labs.
- [dbt-duckdb adapter](https://github.com/duckdb/dbt-duckdb) - DuckDB.
- [Apache Superset Documentation](https://superset.apache.org/docs/intro) - Apache Software Foundation.
