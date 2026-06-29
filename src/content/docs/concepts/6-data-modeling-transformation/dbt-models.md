---
title: "dbt Models: Thiết Kế DAG, Đánh Đổi Hệ Thống và Tối Ưu Materializations"
description: "Phân tích kiến trúc phân lớp dbt (Staging, Intermediate, Marts). Đi sâu vào cơ chế thực thi vật lý, hệ lụy của Materialization và giải quyết thắt cổ chai DAG trên Snowflake, BigQuery, Databricks."
difficulty: "Advanced"
tags: ["dbt", "data-modeling", "analytics-engineering", "dag", "optimization", "snowflake", "databricks"]
readingTime: "25 mins"
lastUpdated: 2026-06-29
seoTitle: "dbt Models Materialization Architecture: Snowflake, BigQuery, Databricks"
metaDescription: "Tìm hiểu kiến trúc dbt Models, các chiến lược Materializations (View, Table, Incremental) và sự kết hợp với Snowflake Dynamic Tables, Databricks DLT."
---

Việc chuyển đổi từ các Stored Procedure khổng lồ dài hàng ngàn dòng sang **dbt (data build tool)** không chỉ là thay đổi công cụ, mà là thay đổi hoàn toàn tư duy kiến trúc (System Architecture) theo chuẩn Analytics Engineering. Thay vì thực thi chuỗi lệnh tuyến tính (imperative), dbt biên dịch các file `.sql` (kết hợp Jinja) thành một **Directed Acyclic Graph (DAG)** – Đồ thị có hướng không tuần hoàn.

Trong bài viết này, chúng ta sẽ không dừng lại ở định nghĩa cơ bản. Chúng ta sẽ mổ xẻ **kiến trúc vật lý**, **sự đánh đổi (trade-offs)** khi chọn Materialization, và cách tối ưu hóa kiến trúc dbt trên các Modern Data Warehouse như Snowflake, BigQuery và Databricks ở quy mô dữ liệu Petabyte.

---

## 1. Cơ Chế Thực Thi Vật Lý (Physical Execution)

Trong dbt, một Model đơn giản là một file chứa câu lệnh `SELECT`. Tuy nhiên, sức mạnh thực sự nằm ở cách dbt tương tác với Optimizer của Data Warehouse thông qua **Materializations**. Mỗi lựa chọn đều mang lại đánh đổi lớn về Cost (FinOps) và Performance.

### Sự Đánh Đổi Hệ Thống (Materialization Trade-offs)

*   **View (`materialized='view'`):**
    *   **Thực thi:** Tạo ra một "Virtual Table". Khi user query View, DWH engine sẽ tính toán lại từ đầu (on-the-fly).
    *   **Trade-off:** *Compute Cost cao ở thời điểm Read, Zero Storage Cost*. Thích hợp cho các transformation nhẹ ở tầng Staging. Tuy nhiên, nếu xây dựng View chồng lên View (View stacking), Optimizer có thể bị quá tải, dẫn đến hiện tượng **Query Compilation Timeout** (đặc biệt phổ biến trên BigQuery) hoặc **Memory Spill** do engine không thể tính toán được Execution Plan tối ưu.
*   **Table (`materialized='table'`):**
    *   **Thực thi:** Drop bảng cũ và `CREATE TABLE AS SELECT` (CTAS) mới hoàn toàn.
    *   **Trade-off:** *Compute/I/O cực cao lúc Write, cực nhanh lúc Read*. Thích hợp cho Marts layer khi user query qua BI tools. Nếu dùng Table cho data > 1TB, bạn sẽ lãng phí tài nguyên khổng lồ để ghi lại những partition dữ liệu không hề thay đổi.
*   **Incremental (`materialized='incremental'`):**
    *   **Thực thi:** Dùng lệnh `MERGE` hoặc `INSERT` cho dữ liệu mới sinh (delta) để tối ưu tính toán.
    *   **Trade-off:** Cân bằng giữa Write Cost và Read Cost. **Rủi ro vận hành (Operational Risk):** Nếu không cấu hình Partition Keys/Cluster Keys chính xác, Data Warehouse sẽ phải scan toàn bộ bảng đích để tìm bản ghi cần cập nhật (Full Table Scan), khiến một Incremental load đôi khi tốn chi phí và chậm hơn cả Full Table Build.
*   **Ephemeral (`materialized='ephemeral'`):**
    *   **Thực thi:** Dbt nội suy (interpolate) model này thành một **Common Table Expression (CTE)** bên trong bất kỳ model downstream nào gọi nó, thay vì vật lý hóa xuống DWH.
    *   **Rủi ro:** Khi một ephemeral model được reference (gọi) nhiều lần trong cùng một downstream query phức tạp, CTE đó có thể bị tính toán lại (re-evaluated) lặp đi lặp lại tùy thuộc vào Optimizer, gây ra "Cartesian Explosion" ngầm về I/O.

---

## 2. Kiến Trúc Phân Lớp Hiện Đại (Modern Analytics Layers)

Để DAG không trở thành "mớ bòng bong" (tangled web), các tổ chức lớn như Uber, Databricks hay Gitlab thống nhất chia nhỏ model thành 3 tầng vật lý.

### 2.1. Staging Layer: Cổng Kiểm Soát Đầu Vào
Quy tắc vàng: **Tỉ lệ 1-1 với Source, Tuyệt đối Không Joins.**
*   **Kiến trúc:** Lớp chuẩn hóa dữ liệu thô (Casting, Renaming, Timezone conversion). 
*   **Thực chiến:** Bắt buộc áp dụng Hard-delete/Soft-delete logic tại đây để lọc rác và làm sạch các data types (để downstream không phải chịu Implicit Casting Cost).

```sql
-- models/staging/stripe/stg_stripe__payments.sql
{{ config(materialized='view') }}

with source as (
    select * from {{ source('stripe', 'payment') }}
),
standardized as (
    select
        id as payment_id,
        orderid as order_id,
        status as payment_status,
        -- Trade-off: Ép kiểu sớm từ raw string sang numeric để tối ưu query downstream
        cast(amount as numeric) / 100 as amount_usd,
        created as created_at
    from source
)
select * from standardized
```

### 2.2. Intermediate Layer: Lò Luyện (The Heavy-Lifting)
Đây là nơi xử lý các phép biến đổi rộng (Wide Transformations): Complex Joins, Window Functions, Aggregations.
*   **Hệ thống:** Tách riêng từng cụm logic nghiệp vụ. Nếu câu lệnh DML quá phức tạp và dài > 500 lines, hệ thống DWH Optimizer có thể sinh ra execution plan tồi tệ, dẫn đến Spill-to-disk hoặc OOMKilled trên engine. Khắc phục bằng cách sử dụng `table` thay vì `view` nếu cần share checkpoint để tăng tính ổn định đồ thị DAG.

### 2.3. Marts Layer: Dimensional Modeling / One Big Table (OBT)
Tầng phơi bày (Exposed) dữ liệu cho End-users và Data Apps (Looker, Superset, Tableau).
*   **Kiến trúc:** Dữ liệu tại đây phải ở trạng thái "Analytics-ready", thường phi chuẩn hóa (Denormalized) thành mô hình **One Big Table (OBT)** hoặc mô hình Kimball (Star/Snowflake Schema) để hạn chế join ở tầng BI.
*   **Thực chiến:** Bắt buộc áp dụng Incremental Models kèm Clustering/Partitioning.

---

## 3. Kiến Trúc Nền Tảng Riêng Biệt (Platform-Specific Architecture)

Trong khi dbt cung cấp giao diện chung (Jinja + SQL), cách thức vật lý hóa (Materialization) thực tế sẽ phụ thuộc mạnh mẽ vào hạ tầng bên dưới.

### 3.1. Snowflake: Dynamic Tables
Thay vì viết model Incremental với cú pháp `is_incremental()` phức tạp dễ sinh lỗi lặp data, kiến trúc Snowflake hiện đại sử dụng **Dynamic Tables**. Đây là cách bạn định nghĩa dữ liệu (Declarative) thay vì phải tự viết luồng cập nhật.

```sql
-- Snowflake Dynamic Table trong dbt (yêu cầu dbt-snowflake adapter)
{{ config(
    materialized='dynamic_table',
    target_lag='1 hour',  -- Cập nhật tự động mỗi giờ
    snowflake_warehouse='COMPUTE_WH'
) }}

SELECT
  customer_id,
  SUM(amount_usd) as total_spent
FROM {{ ref('stg_stripe__payments') }}
GROUP BY 1
```
*Lợi ích:* Hệ thống tự động theo dõi Delta Changes (DML) từ bảng gốc và merge vào bảng đích mà bạn không cần cấu hình `unique_key`.

### 3.2. Databricks: Delta Live Tables (DLT) & Streaming Tables
Databricks cho phép hợp nhất luồng Batch và Streaming vào một (Unified Pipeline) thông qua **Streaming Tables** và **Materialized Views** chạy trên hạ tầng Delta Live Tables (DLT) được tối ưu hóa bởi Photon Engine.

Trong dbt trên Databricks, việc triển khai Streaming Table giúp dữ liệu được xử lý liên tục mà không cần các tác vụ Batch Cronjob nặng nề:

```sql
-- Databricks Streaming Table qua dbt
{{ config(
    materialized='streaming_table'
) }}

SELECT
  stream.customer_id,
  stream.amount_usd,
  stream.created_at
-- Dùng hàm stream() để đọc dữ liệu dạng Event-driven từ Delta Lake
FROM stream({{ source('raw_events', 'clickstream') }})
```

### 3.3. BigQuery: Phân Mảnh (Partitioning) & Cụm (Clustering)
Với BigQuery (Columnar Database thanh toán theo lượng Byte đọc), Incremental model bắt buộc phải cấu hình `insert_overwrite` kèm Partition để giới hạn chi phí.

```sql
-- models/marts/core/fct_events.sql
{{ config(
    materialized='incremental',
    incremental_strategy='insert_overwrite',
    partition_by={
      "field": "event_date",
      "data_type": "date",
      "granularity": "day"
    },
    cluster_by=["event_name", "user_id"]
) }}

with events as (
    select * from {{ ref('stg_kafka__clickstream') }}
    {% if is_incremental() %}
        -- Khống chế late-arriving data: Giới hạn lookback window 3 ngày
        where event_date >= date_sub(current_date(), interval 3 day)
    {% endif %}
)
select * from events
```

---

## 4. Rủi Ro Vận Hành & Troubleshooting (Real-world Incidents)

Khi hệ thống Data Warehouse mở rộng lên tới Petabyte (PB) và dbt DAG chứa hàng nghìn models, bạn sẽ đối mặt với những cơn ác mộng kiến trúc sau:

### 4.1. Hiệu ứng Nút Thắt Cổ Chai DAG (The "Modelneck")
Giả sử dự án bạn có 100 model có thể chạy song song (Parallel execution), nhưng tất cả đều phụ thuộc vào một model tập trung tên là `int_customers_heavy.sql`. Nếu model này chạy mất 1 tiếng, toàn bộ pipeline downstream sẽ bị chặn đứng (blocked). Đánh đổi ở đây là **Modularity vs Concurrency**.

**Cách khắc phục:** 
- **Tách node:** Phân tích cấu trúc đồ thị (Lineage Graph) để bẻ gãy `int_customers_heavy` thành các sub-graph chạy độc lập không chờ nhau.
- **Vertical Scaling cục bộ:** Cấu hình dbt để override DWH Compute (Ví dụ: Dùng tag chuyển riêng Snowflake Warehouse từ `M` lên `XL` chỉ cho model bị thắt cổ chai, sau đó scale down để tối ưu chi phí).

### 4.2. Cartesian Explosion trong Joins
Đây là nguyên nhân số một gây cháy tài khoản Cloud. Xảy ra khi lập trình viên thực hiện Join 2 bảng lớn trên các trường không Unique. Dữ liệu phình to theo cấp số nhân khiến Compute Engine cạn kiệt RAM và phải "Spill to disk", đẩy query latency lên gấp 10-100 lần.

**Phòng vệ qua Testing [CI/CD Quality Gate]:** 
Luôn gài dbt tests (`unique`, `relationships`) trên các khóa Join **TRƯỚC KHI** thực hiện join trong các logic phức tạp. 

```yaml
# models/intermediate/finance/_finance_models.yml
models:
  - name: int_orders_joined
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
```

---

## Nguồn Tham Khảo
*   [dbt Best Practices: How we structure our dbt projects][https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview]
*   [Snowflake Documentation: Dynamic Tables][https://docs.snowflake.com/]
*   [Databricks Documentation: Delta Live Tables][https://docs.databricks.com/en/delta-live-tables/]
*   [BigQuery Optimization for dbt - Google Cloud Architecture](https://cloud.google.com/architecture/bigquery-data-warehouse-dbt]
