---
title: "Phương thức lưu trữ kết quả dbt - Materialization"
difficulty: "Intermediate"
tags: ["dbt", "materialization", "analytics-engineering", "data-warehouse", "snowflake", "databricks", "bigquery"]
readingTime: "25 mins"
lastUpdated: 2026-06-29
seoTitle: "Materialization trong dbt - BigQuery, Snowflake, Databricks"
metaDescription: "Phân tích kiến trúc thực thi vật lý của các chiến lược Materialization trong dbt: View, Table, Incremental (Merge/Insert Overwrite) và Snowflake Dynamic Tables."
description: "Về bản chất, mã dbt chỉ là các câu lệnh SELECT. Nhưng cách dbt biên dịch và yêu cầu Data Warehouse hiện thực hóa (Materialize) chúng sẽ quyết định toàn bộ hiệu năng, Compute Cost, và độ trễ."
---

Khi bạn viết một mô hình dbt, bạn đang định nghĩa logic nghiệp vụ qua một câu lệnh `SELECT`. Nhưng đối với một Data Engineer, câu hỏi cốt lõi không phải là "SELECT cái gì?" mà là **"Kết quả của lệnh SELECT này được vật chất hóa (Materialized) xuống ổ cứng hay nằm trên RAM của Data Warehouse như thế nào?"**

Sự đánh đổi ở đây cực kỳ khắc nghiệt: Bạn sẵn sàng trả tiền cho **Compute Cost** (tính toán lại mỗi lần có truy vấn) hay **Storage Cost** (lưu sẵn kết quả xuống ổ cứng) và **Pipeline Latency** (thời gian chạy batch ETL)?

## 1. Kiến trúc Thực thi Vật lý Cơ Bản (Physical Execution)

dbt hỗ trợ các chiến lược materialization cơ bản. Dưới góc độ hệ thống, chúng ta xem xét cách Query Engine xử lý chúng:

### 1.1. Ephemeral: Cạm bẫy của Nội suy CTE
Khi cấu hình `materialized='ephemeral'`, dbt KHÔNG tạo ra bất kỳ object nào trong database. Nó lấy mã SQL của bạn, bọc trong một `WITH` clause (CTE), và inject thẳng vào các model downstream.

**Rủi ro Vận hành (Operational Risk):**
Nếu một model Ephemeral được `ref()` bởi 3 model khác nhau trong cùng một luồng, Query Optimizer của Data Warehouse có thể không đủ thông minh để cache lại CTE đó. Kết quả là **bộ nhớ và CPU bị bạo chi** do phải tính toán lại CTE 3 lần. *Quy tắc ngón tay cái:* Chỉ dùng Ephemeral cho các bước transformation cực nhẹ và chỉ được downstream model `ref()` đúng 1 lần.

### 1.2. View: Đánh đổi Storage lấy Compute
`CREATE OR REPLACE VIEW` chỉ lưu metadata. 
- **Ưu điểm:** Zero build time. Data luôn Real-time với upstream.
- **Điểm chết (Bottleneck):** Mỗi lần BI Tool (như PowerBI/Superset) gửi query, Data Warehouse phải quét lại toàn bộ data từ các bảng gốc. Điều này tạo ra **Compute Spill-to-disk** nếu RAM không đủ, gây tắc nghẽn toàn bộ hệ thống.

### 1.3. Table: Đánh đổi Compute lấy Performance
`CREATE OR REPLACE TABLE`. Toàn bộ dữ liệu được tính toán một lần lúc chạy pipeline và ghi xuống đĩa (Full Refresh).
- **Lợi ích:** BI Tool truy vấn cực nhanh.
- **Điểm chết:** Khi bảng fact vượt quá mốc trăm triệu rows, việc chạy `dbt run` tốn hàng giờ. Lãng phí Compute Cost khổng lồ để ghi lại 99% dữ liệu cũ không thay đổi.

---

## 2. The Incremental Beast: Merge vs Insert Overwrite

Khi `table` trở nên quá nặng, hệ thống chuyển sang `incremental`. Thay vì drop và tạo lại bảng, dbt chỉ xử lý **Delta Data** (dữ liệu mới).

### 2.1. Chiến lược `merge` (Upsert)
dbt sử dụng câu lệnh `MERGE INTO` để đối chiếu dữ liệu mới với dữ liệu cũ qua `unique_key`.

**Real-world Incident: Cartesian Explosion & Full Table Scan**
Nếu bạn sử dụng `merge` trên một bảng 10 tỷ dòng mà **KHÔNG** đánh Cluster / Partition, Data Warehouse buộc phải thực hiện **Full Table Scan** để tìm ra dòng cần update. Chi phí lúc này còn **đắt hơn cả việc chạy Full Refresh**.

### 2.2. Chiến lược `insert_overwrite` (Partition Replacement)
Đây là chiến lược **thống trị** trong các hệ thống Data quy mô lớn (như BigQuery). Thay vì tốn CPU so khớp từng dòng, `insert_overwrite` hoạt động ở cấp độ Block/Partition. dbt sẽ xóa toàn bộ Partition cũ và ghi đè bằng data mới (Zero-cost cho việc checking `unique_key`).

**Code thực chiến (BigQuery):**
```sql
{{ config(
    materialized='incremental',
    incremental_strategy='insert_overwrite',
    partition_by={
      "field": "created_date",
      "data_type": "date",
      "granularity": "day"
    },
    require_partition_filter=true
) }}

SELECT 
    DATE(created_at) as created_date,
    * 
FROM {{ ref('stg_events') }}
{% if is_incremental() %}
    -- Chỉ xử lý dữ liệu của 3 ngày gần nhất để ghi đè partition
    WHERE DATE(created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
{% endif %}
```

---

## 3. Kỷ Nguyên Declarative: Dynamic Tables & Materialized Views

Thay vì phải vật lộn viết Jinja logic rườm rà của `is_incremental()`, các nền tảng Modern Data Warehouse hiện nay đã ra mắt những tính năng tự động bảo trì state.

### 3.1. Snowflake: Dynamic Tables
**Dynamic Tables** thay thế cho kiến trúc Streams and Tasks cũ kỹ của Snowflake. Đây là phương pháp **Declarative Pipeline**. Bạn chỉ cần nói "Tôi muốn kết quả của lệnh SELECT này luôn tươi mới trong vòng 15 phút (Target Lag)", Snowflake sẽ tự động quyết định xem nên chạy Incremental hay Full Refresh ở dưới nền.

```sql
-- Dbt model sử dụng Snowflake Dynamic Table
{{ config[
    materialized = 'dynamic_table',
    snowflake_warehouse = 'COMPUTE_WH',
    target_lag = '15 minutes'
] }}

SELECT 
    customer_id,
    SUM(amount) as lifetime_value
FROM {{ ref('stg_orders') }}
GROUP BY 1
```

### 3.2. Databricks: Materialized Views & Delta Live Tables (DLT)
Databricks quản lý Materialization thông qua hạ tầng **Delta Live Tables**. Nó mang lại khái niệm **Materialized Views** chạy trực tiếp trên Data Lakehouse, cho phép hệ thống tự động tính toán lại Incrementally khi các bảng Base thay đổi.

```sql
-- Cấu hình Databricks Materialized View trong dbt
{{ config(
    materialized = 'materialized_view',
    tblproperties = {
      'delta.enableChangeDataFeed': 'true'
    }
) }}

SELECT 
    product_category,
    COUNT(order_id) as total_orders
FROM {{ ref('stg_sales') }}
GROUP BY 1
```

---

## 4. Best Practices & System Tuning

Để không làm sập (OOMKilled) Data Warehouse hay nhận hóa đơn tiền tỷ vào cuối tháng, hãy áp dụng các nguyên tắc sau:

1. **Chuỗi Materialization Chuẩn mực:**
   - **Lớp Staging (Source -> Bronze):** Luôn là `view`. Đừng tốn tiền lưu trữ một bản copy 1:1 của Raw Data.
   - **Lớp Intermediate (Bronze -> Silver):** Dùng `ephemeral` nếu phép tính rất nhỏ. Nếu có JOIN phức tạp, dùng `table` hoặc `view` tùy thuộc vào tần suất query.
   - **Lớp Marts/Presentation (Silver -> Gold):** Luôn là `table` (nếu < 10GB), `incremental` (nếu > 10GB), hoặc **Dynamic Tables/Materialized Views**. Đây là lớp phục vụ End-user, Latency phải cực thấp.

2. **Dbt Project Global Tuning:**
Thay vì cấu hình rải rác từng file, hãy set chuẩn mực ở `dbt_project.yml`.
```yaml
models:
  my_data_platform:
    staging:
      +materialized: view
    marts:
      core:
        +materialized: incremental
        +incremental_strategy: insert_overwrite
      finance:
        +materialized: table
```

3. **Cẩn thận với Schema Evolution:**
Đối với `incremental`, khi upstream thêm một cột mới, `merge` hoặc `insert_overwrite` có thể bị lỗi mismtach columns. Hãy định cấu hình `on_schema_change: 'append_new_columns'` hoặc `'sync_all_columns'` một cách chủ động để hệ thống tự động alter table.

---

## Nguồn Tham Khảo
* [dbt Documentation - Materializations][https://docs.getdbt.com/docs/build/materializations]
* [Snowflake Documentation - Dynamic Tables][https://docs.snowflake.com/en/user-guide/dynamic-tables-about]
* [Databricks Documentation - Delta Live Tables][https://docs.databricks.com/en/delta-live-tables/index.html]
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/]
