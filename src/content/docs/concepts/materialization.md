---
title: "Phương thức lưu trữ kết quả dbt - Materialization"
category: "Transformation & Analytics Engineering"
difficulty: "Intermediate"
tags: ["dbt", "materialization", "analytics-engineering", "data-warehouse", "transformation"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Materialization trong dbt - Cẩm nang Data Warehouse chuyên sâu"
metaDescription: "Tìm hiểu chi tiết về Materialization trong dbt: định nghĩa, các loại materialization (View, Table, Incremental, Ephemeral) và cách lựa chọn phù hợp."
---

# Phương thức lưu trữ kết quả dbt - Materialization

## Summary

Materialization trong dbt (data build tool) là các chiến lược hoặc phương thức cấu hình xác định cách thức mà một mô hình (model - về cơ bản là một câu lệnh SELECT SQL) sẽ được lưu trữ hoặc thực thi tại Data Warehouse (kho dữ liệu) đích. Việc lựa chọn đúng loại materialization quyết định hiệu năng truy vấn, chi phí lưu trữ và thời gian chạy (build time) của toàn bộ pipeline dữ liệu.

---

## Definition

**Materialization** là quá trình chuyển đổi kết quả logic của một truy vấn SQL thành một thực thể vật lý (hoặc ảo) bên trong cơ sở dữ liệu hoặc kho dữ liệu. Trong hệ sinh thái dbt, thay vì phải tự viết các câu lệnh DDL (Data Definition Language) và DML (Data Manipulation Language) như `CREATE TABLE AS` hay `CREATE VIEW AS`, kỹ sư dữ liệu chỉ cần viết câu lệnh `SELECT` cốt lõi và dbt sẽ đảm nhận phần "bọc" (wrap) câu lệnh đó bằng vật liệu hóa tương ứng dựa trên cấu hình khai báo.

---

## Why it exists

Quá trình chuyển đổi dữ liệu (Transformation) không thể chỉ dựa vào một phương thức lưu trữ duy nhất.
1. **Sự đánh đổi giữa thời gian build và hiệu năng truy vấn**: Dữ liệu được tính toán trước (Table) sẽ đọc nhanh nhưng mất thời gian build lâu. Dữ liệu tính toán lúc truy vấn (View) build cực nhanh nhưng truy vấn sẽ chậm đi nếu logic phức tạp.
2. **Chi phí xử lý dữ liệu lớn**: Xử lý toàn bộ bảng dữ liệu hàng tỷ dòng (Full Refresh) mỗi ngày là cực kỳ đắt đỏ và không cần thiết nếu ta có thể chỉ cập nhật các dòng mới (Incremental).
3. **Mô-đun hóa mã nguồn**: Không phải lúc nào dữ liệu trung gian cũng cần tồn tại trong cơ sở dữ liệu. Cần một cách để dùng lại logic (CTE) mà không tạo rác vật lý (Ephemeral).

Materialization ra đời để trao quyền linh hoạt cấu hình các chiến lược lưu trữ này một cách dễ dàng thông qua tham số (parameters).

---

## Core idea

Có 4 loại materialization cốt lõi được xây dựng sẵn trong dbt:
1. **View**: Mô hình được tạo dưới dạng một logic ảo (`CREATE VIEW AS`). Không tốn dung lượng đĩa, nhưng mỗi khi truy vấn, toàn bộ logic bên trong sẽ phải chạy lại.
2. **Table**: Mô hình được tạo dưới dạng bảng vật lý (`CREATE TABLE AS`). Chạy chậm lúc build, tốn dung lượng đĩa, nhưng đọc dữ liệu rất nhanh. Dữ liệu được tính toán và lưu sẵn.
3. **Incremental**: Tương tự Table nhưng dbt chỉ chèn (insert) hoặc cập nhật (update/merge) những dòng dữ liệu mới hoặc có thay đổi kể từ lần chạy trước, thay vì xóa và tạo lại toàn bộ bảng.
4. **Ephemeral**: Mô hình không được tạo ra thành View hay Table. Khi một mô hình khác tham chiếu đến nó, dbt sẽ tiêm (inject) logic của mô hình này vào dưới dạng một CTE (`WITH ... AS ()`).

---

## How it works

Khi bạn thực thi lệnh `dbt run`, công cụ sẽ đọc cấu hình (thường trong block `{{ config(materialized='...') }}` ở đầu file SQL, hoặc ở file `dbt_project.yml`) và thực hiện quá trình biên dịch (compilation).

1. dbt tạo các bảng/views tạm (temp objects) nếu cần thiết để hạn chế downtime.
2. Thực thi lệnh DDL (ví dụ: `CREATE TABLE model_temp AS SELECT ...`).
3. Đổi tên hoặc swap các cấu trúc dữ liệu để bản chính thức sẵn sàng.
4. Xóa bỏ các cấu trúc tạm thời.

---

## Practical example

Ví dụ về cấu hình **Incremental Materialization** (loại phổ biến và phức tạp nhất) để xử lý một bảng sự kiện truy cập web (pageviews).

```sql
{{
    config(
        materialized='incremental',
        unique_key='event_id'
    )
}}

SELECT
    event_id,
    user_id,
    page_url,
    event_timestamp
FROM {{ source('web_tracking', 'raw_pageviews') }}

-- Khối logic này chỉ chạy trong các lần chạy incremental, không chạy khi full-refresh
{% if is_incremental() %}

  -- Lọc lấy dữ liệu mới hơn thời gian cập nhật gần nhất trong bảng đích
  WHERE event_timestamp >= (SELECT max(event_timestamp) FROM {{ this }})

{% endif %}
```

---

## Best practices

* **Bắt đầu bằng View**: Theo nguyên tắc "Keep It Simple", hãy mặc định sử dụng View cho mọi mô hình. Chỉ chuyển sang Table khi truy vấn View bắt đầu mất quá nhiều thời gian.
* **Sử dụng Ephemeral cho các logic trung gian hẹp**: Các bước làm sạch (cleansing) hoặc đổi tên cột trung gian không được dùng bởi nhiều mô hình khác nên được đặt là Ephemeral để dọn dẹp Data Warehouse.
* **Chiến lược Unique Key cho Incremental**: Luôn khai báo `unique_key` cho mô hình incremental để dbt dùng cơ chế `MERGE` thay vì `INSERT`, giúp tránh dữ liệu trùng lặp nếu pipeline phải chạy lại cùng khoảng thời gian.
* **Partition và Cluster**: Kết hợp materialization Table/Incremental với cấu hình phân vùng (partition) của Data Warehouse (như BigQuery, Snowflake) để tăng hiệu năng khổng lồ.

---

## Common mistakes

* **Dùng Ephemeral quá sâu**: Tạo mô hình Ephemeral gọi đến mô hình Ephemeral khác tạo ra chuỗi CTE chồng chéo rất dài. Data Warehouse optimizer sẽ không phân tích nổi và sập (out of memory).
* **Lạm dụng Incremental từ đầu**: Incremental có logic phức tạp và rủi ro bị lệch dữ liệu. Chỉ dùng nó khi bảng Table mất quá nhiều chi phí và thời gian (>15-30 phút) để build full-refresh.
* **Thiếu is_incremental() macro**: Cấu hình materialization là incremental nhưng quên viết mệnh đề lọc `{% if is_incremental() %}`. Hậu quả là dbt vẫn quét lại toàn bộ dữ liệu nguồn và cố gắng MERGE chúng, chạy còn chậm hơn cả Table.

---

## Trade-offs

### View
* **Ưu điểm**: Luôn chứa dữ liệu mới nhất tại thời điểm query; Không chiếm dung lượng lưu trữ; Build pipeline siêu tốc.
* **Nhược điểm**: Truy vấn chậm, tốn tài nguyên tính toán (compute) của hệ thống phục vụ mỗi khi có người mở dashboard.

### Table
* **Ưu điểm**: Truy vấn rất nhanh; Dễ dàng debug vì dữ liệu được materialize vật lý.
* **Nhược điểm**: Tốn dung lượng lưu trữ; Cập nhật tốn thời gian; Dữ liệu bị "đóng băng" cho tới lần chạy dbt tiếp theo.

### Incremental
* **Ưu điểm**: Tối ưu nhất về chi phí tính toán khi build (chỉ xử lý delta data).
* **Nhược điểm**: Code phức tạp, dễ xảy ra lỗi trùng lặp dữ liệu hoặc mất lịch sử (nếu không thiết kế cơ chế merge/delete đúng).

---

## When to use

* **View**: Các mô hình Staging (tầng raw data base), logic đơn giản chỉ lọc và đổi tên trường.
* **Table**: Các bảng Dimension, Fact tables được báo cáo BI query liên tục, hoặc các mô hình aggregate nặng.
* **Incremental**: Các bảng Fact có dung lượng cực lớn (hàng triệu dòng/ngày), dữ liệu dạng sự kiện (logs, clicks).
* **Ephemeral**: Các bảng trung gian siêu nhỏ, không ai cần truy vấn thẳng, chỉ dùng để tái sử dụng mã.

## When not to use

* Không dùng Table cho những bảng thay đổi logic liên tục và chỉ được sử dụng bởi một mô hình con duy nhất.
* Không dùng Incremental cho các Dimension tables nhỏ (dưới vài trăm ngàn dòng) vì chi phí overhead để tìm Unique Key và Merge còn lớn hơn việc Drop & Create.

---

## Related concepts

* [Analytics Engineering](/concepts/analytics-engineering)
* [Data Transformation](/concepts/data-transformation)
* [ETL vs ELT](/concepts/etl-vs-elt)
* [Staging Area](/concepts/staging-area)

---

## Interview questions

### 1. Phân biệt `is_incremental()` macro và incremental materialization trong dbt. Tại sao chúng ta cần sử dụng cả hai?
* **Người phỏng vấn muốn kiểm tra**: Sự hiểu biết sâu về cơ chế cốt lõi của Incremental build thay vì chỉ sao chép code.
* **Gợi ý trả lời (Strong Answer)**: `materialized='incremental'` chỉ là cấu hình nói cho dbt biết chiến lược DDL cần dùng (tạo bảng hay merge dữ liệu). Nhưng nếu không có `is_incremental()` macro, dbt sẽ kéo toàn bộ dữ liệu nguồn từ ngày đầu tiên để merge vào bảng cũ, cực kỳ kém hiệu quả. Macro `is_incremental()` giúp ta chèn câu lệnh `WHERE` động nhằm hạn chế lượng dữ liệu quét vào, và dbt chỉ thực hiện MERGE trên tập dữ liệu nhỏ gọn này.
* **Lỗi cần tránh**: Không phân biệt được phần cấu hình và phần logic lọc dữ liệu.

### 2. Điều gì xảy ra nếu bạn chạy một Incremental model nhưng schema của bảng đích đã thay đổi (ví dụ: thêm cột mới)?
* **Người phỏng vấn muốn kiểm tra**: Kinh nghiệm xử lý schema evolution trong thực tế.
* **Gợi ý trả lời (Strong Answer)**: Mặc định, dbt sẽ fail hoặc bỏ qua cột mới tùy cấu hình `on_schema_change`. Để giải quyết, ta có thể cấu hình `on_schema_change='append_new_columns'` (tự động thêm cột mới) hoặc `sync_all_columns`. Tuy nhiên, trong môi trường prod an toàn, thường ta sẽ chạy cờ `--full-refresh` để xây dựng lại hoàn toàn bảng Incremental một lần cho các thay đổi schema cốt lõi.

---

## References

1. **dbt Labs Documentation** - Materializations (Tài liệu gốc chuẩn xác nhất về 4 loại materialization).
2. **Data Pipelines Pocket Reference** - James Densmore (Chương về Transformation layer).

---

## English summary

In dbt, materialization refers to the strategies defining how an underlying SQL model is instantiated in the target Data Warehouse. The four primary materializations are **View** (virtual layer, zero build time but slow query), **Table** (physical instantiation, fast query but slow build), **Incremental** (inserting or updating only new data to an existing table to save compute time on massive datasets), and **Ephemeral** (compiled directly as CTEs within downstream models without physical persistence). Choosing the correct materialization is crucial for optimizing cloud compute costs, storage, and pipeline execution time.
