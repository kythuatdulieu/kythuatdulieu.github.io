---
title: "Phương thức lưu trữ kết quả dbt - Materialization"
difficulty: "Intermediate"
tags: ["dbt", "materialization", "analytics-engineering", "data-warehouse", "transformation"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Materialization trong dbt - Cẩm nang Data Warehouse chuyên sâu"
metaDescription: "Tìm hiểu chi tiết về Materialization trong dbt: định nghĩa, các loại materialization (View, Table, Incremental, Ephemeral) và cách lựa chọn phù hợp."
description: "Khi bạn viết một mô hình (model) trong [dbt](/concepts/transformation-analytics/dbt/) (data build tool), về mặt bản chất bạn chỉ đang viết một câu lệnh SELECT. Tuy nhiên, cách kết quả của câu lệnh này được lưu trữ trong Data Warehouse (hoặc Database) mới quyết định đến chi phí, hiệu năng và thời gian cập nhật dữ liệu. Đây chính là khái niệm Materialization (Vật chất hóa)."
---



Khi bạn viết một mô hình (model) trong dbt (data build tool), về mặt bản chất bạn chỉ đang viết một câu lệnh `SELECT`. Tuy nhiên, cách kết quả của câu lệnh này được lưu trữ (hoặc hiện thực hóa) trong Data Warehouse (hoặc Database) mới quyết định đến chi phí, hiệu năng và thời gian cập nhật dữ liệu. Đây chính là khái niệm Materialization (tạm dịch: *Vật chất hóa*).

## 1. Materialization là gì?

Trong ngữ cảnh của dbt và Data Warehouse, **Materialization** là chiến lược hoặc cơ chế xác định cách một mô hình logic (câu lệnh SQL) được khởi tạo và lưu trữ vật lý trong cơ sở dữ liệu đích. 

Thay vì phải tự viết các câu lệnh DDL (Data Definition Language) hay DML (Data Manipulation Language) phức tạp như `CREATE TABLE ... AS`, `CREATE VIEW ... AS`, `INSERT INTO ...`, dbt sẽ đảm nhận việc biên dịch (compile) câu lệnh `SELECT` của bạn thành mã thực thi phù hợp dựa trên loại Materialization bạn chọn.

Việc chọn đúng Materialization giúp hệ thống phân tích dữ liệu:
- **Tối ưu chi phí:** Tránh tính toán lại toàn bộ dữ liệu (Full Refresh) khi không cần thiết.
- **Tăng tốc hiệu năng truy vấn:** Đáp ứng SLA của dashboard một cách nhanh chóng.
- **Tiết kiệm không gian lưu trữ:** Không lưu dư thừa những dữ liệu tạm, trung gian.

## 2. Bốn loại Materialization cơ bản trong dbt

dbt hỗ trợ sẵn 4 loại materialization cốt lõi. Hiểu rõ từng loại và ưu nhược điểm là nền tảng để thiết kế pipeline tối ưu.

### 2.1. View (Mặc định)
Khi sử dụng `view`, mô hình của bạn được tái tạo lại dưới dạng một **View** trong cơ sở dữ liệu (`CREATE VIEW ... AS SELECT ...`).
View không thực sự lưu trữ dữ liệu. Nó chỉ là một lớp "mặt nạ" của câu lệnh SQL. Mỗi khi có ai đó query vào View, Data Warehouse sẽ chạy câu lệnh `SELECT` gốc với dữ liệu mới nhất.

* **Ưu điểm:**
  - Triển khai siêu nhanh vì không có dữ liệu nào được tính toán hay di chuyển lúc chạy `dbt run`.
  - Luôn trả về dữ liệu mới nhất (Real-time so với bảng gốc) khi được truy vấn.
  - Không tốn không gian lưu trữ thêm.
* **Nhược điểm:**
  - Chậm khi được truy vấn, đặc biệt nếu câu lệnh SQL có các phép `JOIN`, `AGGREGATION` phức tạp trên lượng dữ liệu lớn.
  - Sẽ tốn chi phí compute (tính toán) mỗi khi được truy vấn (đối với BigQuery, Snowflake).
* **Khi nào nên dùng:**
  - Dành cho các mô hình ở các lớp đầu tiên (Staging models, Base models) hoặc các mô hình nhẹ nhàng như đổi tên cột, cast kiểu dữ liệu.
  - Mô hình ít khi được truy cập bởi người dùng cuối.

### 2.2. Table
Với loại `table`, dbt sẽ drop bảng cũ và tạo lại toàn bộ bảng mới mỗi lần chạy (`CREATE TABLE ... AS SELECT ...`). Quá trình này thường được gọi là Full Refresh.

* **Ưu điểm:**
  - Tốc độ truy vấn rất nhanh do dữ liệu đã được tính toán xong và lưu trữ sẵn ở dạng vật lý. Cực kì phù hợp cho các Dashboard và BI Tools.
* **Nhược điểm:**
  - Thời gian xây dựng (`dbt run`) lâu, đặc biệt với dữ liệu khổng lồ.
  - Tốn tài nguyên tính toán và chi phí khi dbt tái tạo lại bảng, dù cho chỉ có vài dòng dữ liệu mới.
* **Khi nào nên dùng:**
  - Các mô hình ở tầng cuối (Marts layer, Presentation layer) được truy vấn liên tục bởi BI tools hoặc nhiều người dùng cùng lúc.
  - Các bảng có dữ liệu thay đổi thường xuyên trong quá khứ hoặc kích thước dữ liệu tương đối nhỏ.

### 2.3. Incremental
Đây là loại materialization mạnh mẽ nhất nhưng cũng khó cấu hình nhất. `incremental` cho phép bạn chỉ xử lý, tính toán và thêm (hoặc cập nhật) những dữ liệu *mới* hoặc dữ liệu *bị thay đổi* kể từ lần chạy cuối cùng, thay vì phải chạy lại toàn bộ dữ liệu lịch sử.

* **Ưu điểm:**
  - Cực kì tối ưu về thời gian chạy lệnh và chi phí điện toán trên Data Warehouse (đặc biệt hữu dụng cho các bảng fact hàng tỷ dòng).
* **Nhược điểm:**
  - Đòi hỏi kiến thức vững để cấu hình logic (xác định khóa chính `unique_key`, cờ thời gian cập nhật...).
  - Dễ gặp rủi ro dữ liệu bị sai lệch, trùng lặp nếu logic lấy dữ liệu mới không chuẩn xác.
  - Phức tạp hơn khi cần thay đổi cấu trúc bảng (schema evolution) hoặc tính toán lại lịch sử (backfill).
* **Khi nào nên dùng:**
  - Đối với các bảng sự kiện (Event data, Web logs, Transaction logs) không bao giờ bị thay đổi quá khứ, chỉ liên tục sinh ra dữ liệu mới.
  - Khi thời gian chạy của mô hình `table` trở nên quá lâu và ảnh hưởng tới hệ thống.

### 2.4. Ephemeral
Khác với 3 loại trên, `ephemeral` **không** tạo ra bất cứ đối tượng vật lý nào (không table, không view) trong Data Warehouse. Thay vào đó, dbt sẽ trích xuất (interpolate) mã SQL của mô hình này và chèn thẳng vào các mô hình phía sau phụ thuộc vào nó (thông qua hàm `{{ ref() }}`) dưới dạng các **CTE** (Common Table Expression - hay mệnh đề `WITH`).

* **Ưu điểm:**
  - Giúp kho dữ liệu gọn gàng (clutter-free), không tạo rác.
  - Có thể giúp tối ưu hóa query do bộ optimizer của Data Warehouse nhìn thấy bức tranh toàn cảnh để tính toán.
* **Nhược điểm:**
  - Gây khó khăn lớn cho việc debug. Không thể truy vấn trực tiếp mô hình này trong Data Warehouse để kiểm tra kết quả trung gian.
  - Nếu mô hình ephemeral được tái sử dụng ở nhiều mô hình downstream, hệ thống có thể sẽ lặp lại việc tính toán nhiều lần làm giảm hiệu năng.
* **Khi nào nên dùng:**
  - Cho các phép chuyển đổi trung gian cực kỳ đơn giản (Lightweight transformations).
  - Mô hình dùng một lần (chỉ được `ref` đúng 1 lần ở mô hình ngay sau nó).

## 3. Cách cấu hình Materialization trong dbt

Trong dbt, có 2 cách chính để định cấu hình materialization cho các mô hình:

### Cách 1: Trong file `dbt_project.yml`
Cách này áp dụng đồng loạt cho toàn bộ thư mục, thích hợp để thiết lập chuẩn mực chung.

```yaml
# dbt_project.yml
models:
  my_project:
    # Tất cả models trong folder staging sẽ là views
    staging:
      +materialized: view
    # Tất cả models trong folder marts sẽ là tables
    marts:
      +materialized: table
```

### Cách 2: Trực tiếp trong file `.sql` của mô hình (Sử dụng config block)
Cấu hình này sẽ ghi đè (override) các thiết lập từ file `dbt_project.yml`.

```sql
-- models/marts/fct_orders.sql
{{ config(
    materialized='incremental',
    unique_key='order_id'
) }}

SELECT * FROM {{ ref('stg_orders') }}

-- Logic chỉ chạy nếu là incremental mode
{% if is_incremental() %}

  WHERE updated_at > (SELECT max(updated_at) FROM {{ this }})

{% endif %}
```

## 4. Các loại Materialization mở rộng (Data Warehouse Specific)

Ngoài 4 loại cốt lõi, do sự phát triển của các hệ thống Modern Data Warehouse, dbt cũng hỗ trợ các loại materialization đặc thù giúp khai thác triệt để sức mạnh của từng hệ thống:

* **Materialized View:** Là sự lai tạo giữa Table và View. Hệ thống sẽ tự động cập nhật kết quả ở chế độ nền. Hỗ trợ trên BigQuery, Snowflake, Redshift, PostgreSQL,...
* **Table/View Clones:** Tính năng của Snowflake và BigQuery giúp copy một bảng gần như ngay lập tức mà không tốn chi phí copy dữ liệu vật lý (Zero-copy clone).
* **Python Materialization:** (Snowpark, Databricks, BigQuery) Xử lý và lưu trữ dữ liệu thông qua DataFrames với ngôn ngữ Python.

## 5. Best Practices & Chiến lược lựa chọn

Quy tắc ngón tay cái (Rule of thumb) trong dbt để quyết định loại materialization:

1. **Bắt đầu với `view`**: Luôn ưu tiên dùng `view` cho tới khi có một lý do chính đáng để từ bỏ nó (ví dụ query quá chậm hoặc quá đắt).
2. **Nâng cấp lên `table`**: Khi view trở nên quá chậm đối với BI tool hoặc logic quá phức tạp, hãy chuyển sang `table`.
3. **Thăng cấp lên `incremental`**: Khi thời gian cập nhật mô hình `table` vượt quá giới hạn cho phép hoặc chi phí quá lớn, hãy chuyển hóa thành `incremental`.
4. **Sử dụng `ephemeral` cẩn trọng**: Chỉ áp dụng cho mô hình cực đơn giản và không muốn làm "rác" database.

Việc thiết kế luồng materialization chuẩn mực (Staging là View, Intermediate là Ephemeral/View, Mart là Table/Incremental) sẽ giúp quy trình Data Transformation của bạn mạnh mẽ, linh hoạt và tối ưu chi phí vận hành.

## Tài Liệu Tham Khảo
* [dbt Documentation - Materializations](https://docs.getdbt.com/docs/build/materializations)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
