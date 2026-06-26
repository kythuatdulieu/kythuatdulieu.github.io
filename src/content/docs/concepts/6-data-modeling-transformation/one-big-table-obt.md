---
title: "One Big Table (OBT)"
difficulty: "Advanced"
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "One Big Table (OBT) Architecture & Trade-offs - Data Engineering"
metaDescription: "Thiết kế dữ liệu Denormalization cực đoan: OBT (One Big Table) trong kiến trúc Columnar Storage, giải phẫu Storage vs Compute Trade-offs."
description: "Mổ xẻ kiến trúc One Big Table (OBT), sự trỗi dậy của Columnar Storage, và những đánh đổi vật lý đằng sau hệ thống Data Warehouse hiện đại."
---

One Big Table (OBT) là mẫu thiết kế (design pattern) phi chuẩn hóa (denormalization) cực đoan, trong đó toàn bộ mô hình dữ liệu đa chiều (Fact và các Dimensions) được "ép" (pre-join) thành một bảng phẳng (flat table) duy nhất khổng lồ. 

Trong lịch sử, OBT bị coi là "anti-pattern" đối với Row-oriented RDBMS do chi phí đọc/ghi và trùng lặp dữ liệu (data redundancy) quá lớn. Tuy nhiên, sự dịch chuyển sang **Columnar Storage** và kiến trúc **Decoupled Compute/Storage** của các Cloud Data Warehouse hiện đại (BigQuery, Snowflake, Databricks) đã đưa OBT trở thành lựa chọn hàng đầu cho Consumption/Data Mart Layer nhằm tối ưu hóa Query Latency.

## 1. Kiến trúc Vật lý (Physical Architecture) của OBT

Sự hồi sinh của OBT gắn liền chặt chẽ với cơ chế hoạt động của Columnar Storage. Tại sao OBT lại khả thi ở quy mô Petabyte?

![Columnar vs Row Storage](/images/6-data-modeling-transformation/columnar_vs_row.png)

1. **Columnar I/O Projection:** Khi một bảng OBT có tới 2,000 cột, một truy vấn BI (`SELECT user_id, SUM(revenue)`) trên hệ thống Columnar (ví dụ: Parquet, ORC, Capacitor của BigQuery) sẽ chỉ thực hiện đọc đĩa (Disk I/O) đúng 2 file/block chứa 2 cột đó. 1,998 cột còn lại hoàn toàn bị bỏ qua. Hệ quả là bảng càng rộng không làm chậm đi những truy vấn hẹp.
2. **Compression (Nén dữ liệu):** Dữ liệu trong OBT bị lặp lại (redundancy) rất nhiều (Ví dụ: `customer_name` được lặp lại trên mỗi dòng giao dịch). Tuy nhiên, các kỹ thuật nén như **Run-length Encoding (RLE)**, **Dictionary Encoding** hay **Delta Encoding** hoạt động cực kỳ hiệu quả trên Columnar Storage, giúp triệt tiêu gần như hoàn toàn chi phí lưu trữ của sự trùng lặp này.
3. **Decoupled Compute and Storage:** Lưu trữ trên Cloud (S3, GCS) có giá rẻ mạt (~$20/TB/tháng). Ngược lại, Compute cho các lệnh `JOIN` phân tán qua mạng (Network Shuffle) tốn kém và dễ gây nghẽn cổ chai (Bottleneck). OBT chính là bài toán đánh đổi: **Mua Storage rẻ để tiết kiệm Compute đắt đỏ.**

```mermaid
flowchart TD
    subgraph Core_Data_Warehouse["Core Data Warehouse("Star Schema/Data Vault")"]
        F["fact_sales"]
        D1["dim_customer"]
        D2["dim_product"]
        D3["dim_date"]
        F --> D1
        F --> D2
        F --> D3
    end

    subgraph Data_Mart["Data Mart / Consumption Layer"]
        OBT["obt_sales_analytics("One Big Table")"]
    end

    subgraph BI_Tools["BI & Analytics"]
        Tableau
        PowerBI
        Looker
    end

    Core_Data_Warehouse -- "dbt / Spark("Heavy JOINs at Build-time")" --> OBT
    OBT -- "Direct Query / Extract("No JOINs at Query-time")" --> BI_Tools
```

## 2. Systemic Trade-offs & Operational Risks

Bất kỳ thiết kế hệ thống nào cũng đòi hỏi sự đánh đổi. OBT giải quyết bài toán Query Latency nhưng đẩy gánh nặng sang Data Quality và Pipeline Maintainability.

### 2.1. Build-time Bottleneck vs Query-time Latency

OBT không triệt tiêu lệnh `JOIN`, nó chỉ dời (shift) lệnh `JOIN` từ lúc User chạy truy vấn (Query-time) sang lúc Pipeline ETL/ELT chạy (Build-time).
* **Đánh đổi:** Pipeline tạo OBT (ví dụ qua dbt hoặc Spark) sẽ phải thực hiện các phép `JOIN` khổng lồ, tiêu tốn lượng lớn Compute credit định kỳ (batch) để đổi lại thời gian phản hồi mili-giây (ms) trên BI Dashboard.

### 2.2. Sự cố Tràn RAM (OOMKilled) & Fan-out (Cartesian Explosion)

Khi `JOIN` nhiều Dimension vào Fact để tạo OBT, nếu một Dimension không duy trì đúng thuộc tính Primary Key (có dữ liệu trùng lặp), phép `JOIN` sẽ gây ra hiệu ứng **Fan-out (Cartesian Explosion)**.
* **Hậu quả:** 1 triệu dòng Fact có thể phình to thành 5-10 triệu dòng trên OBT. Các hàm tính toán `SUM(revenue)` trên BI sẽ ra kết quả sai lệch hoàn toàn. Trên Spark, điều này dẫn đến `Network Shuffle` bùng nổ, rớt node (Executor `OOMKilled`) hoặc `Spill-to-disk` làm chậm toàn bộ cụm.
* **Khắc phục:** Sử dụng kỹ thuật kiểm tra Unique Keys trên dbt trước khi build OBT (`tests: - unique, - not_null`).

### 2.3. Cơn ác mộng Slowly Changing Dimensions (SCD)

Xử lý SCD Type 2 trên OBT là một thử thách khủng khiếp.
* Giả sử khách hàng chuyển địa chỉ từ Hà Nội sang TP.HCM. Trong Star Schema, bạn chỉ thêm một dòng vào `dim_customer`. 
* Nhưng trên OBT, bạn có 2 lựa chọn, cả hai đều đau đớn:
  1. Nếu muốn giữ lịch sử: Bạn phải dùng các điều kiện `JOIN` phức tạp `ON fact.date BETWEEN dim.start_date AND dim.end_date` lúc build OBT. Điều này dễ gây lỗi và chậm.
  2. Nếu muốn ghi đè (Overwrite - SCD Type 1): Bạn phải chạy một lệnh `UPDATE` khổng lồ quét qua hàng trăm triệu dòng giao dịch cũ để cập nhật địa chỉ mới. (Row-level mutation trên Columnar DB là cực kỳ tốn kém).

## 3. Thực chiến: Xây dựng OBT với dbt và BigQuery

Để xử lý bài toán hiệu năng và chi phí khi build OBT trên BigQuery, ta không dùng bảng vật lý (`TABLE`) quét toàn bộ dữ liệu (Full Refresh) mỗi ngày. Thay vào đó, áp dụng **Incremental Models** kết hợp **Partitioning** và **Clustering**.

Dưới đây là một mô hình dbt thực chiến tạo OBT:

```sql
-- File: models/marts/obt_sales_analytics.sql
{{
    config(
        materialized = 'incremental',
        unique_key = 'order_id',
        partition_by = {
            "field": "order_date",
            "data_type": "date",
            "granularity": "day"
        },
        cluster_by = ['customer_region', 'product_category']
    )
}}

WITH fact_sales AS (
    SELECT * FROM {{ ref('fct_orders') }}
    {% if is_incremental() %}
    -- Chỉ lấy các giao dịch trong 3 ngày gần nhất để cập nhật, giảm thiểu Full Table Scan
    WHERE order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
    {% endif %}
),
dim_customer AS (
    SELECT * FROM {{ ref('dim_customers') }}
),
dim_product AS (
    SELECT * FROM {{ ref('dim_products') }}
)

SELECT
    f.order_id,
    f.order_date,
    f.sales_amount,
    
    -- Denormalize Customer
    c.customer_id,
    c.customer_name,
    c.customer_region,
    c.customer_tier,
    
    -- Denormalize Product
    p.product_id,
    p.product_category,
    p.brand_name
FROM fact_sales f
LEFT JOIN dim_customer c 
    ON f.customer_id = c.customer_id
LEFT JOIN dim_product p 
    ON f.product_id = p.product_id
```

### Kiến trúc "Super OBT" bằng Dữ liệu Lồng (Nested Data / Structs)
Để xử lý bài toán **Fan-out** (Quan hệ 1-Nhiều) thay vì join phẳng (flat join) làm tăng số lượng dòng, ta có thể dùng tính năng `ARRAY<STRUCT>` (Nested Data) của BigQuery/Snowflake.

```sql
SELECT 
    o.order_id,
    o.customer_id,
    -- Gom toàn bộ Item vào một mảng (Array), giữ nguyên Grain của bảng là Order
    ARRAY_AGG(
        STRUCT(
            i.item_id, 
            i.product_id, 
            i.quantity, 
            i.price
        )
    ) as order_items
FROM {{ ref('stg_orders') }} o
LEFT JOIN {{ ref('stg_order_items') }} i 
    ON o.order_id = i.order_id
GROUP BY 1, 2
```
Kỹ thuật này giữ cho OBT siêu gọn nhẹ (không bị phình số dòng), ngăn ngừa sai lệch hàm `SUM()`, đồng thời khai thác triệt để sức mạnh của Columnar Storage.

## Kết luận

OBT (One Big Table) đại diện cho triết lý thiết kế Data Warehouse hiện đại: **Đẩy độ phức tạp xuống tầng xử lý ngầm (ETL/ELT) và bày ra một giao diện query "ngu ngốc nhưng siêu tốc" cho người dùng cuối.** 

Kiến trúc chuẩn (Best Practice) hiện nay là một mô hình Hybrid:
* Duy trì sự toàn vẹn, nguyên lý chuẩn hóa (Normalization / Data Vault / Star Schema) ở **Core Data Warehouse**.
* Triển khai OBT ở lớp **Consumption / Data Mart** phục vụ BI Tools.

## Nguồn Tham Khảo (References)

* [Designing Data-Intensive Applications - Martin Kleppmann (Column-Oriented Storage)](https://dataintensive.net/)
* [The Data Warehouse Toolkit - Ralph Kimball](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/)
* [Databricks: Data Modeling for the Lakehouse](https://www.databricks.com/discover/data-lakes/data-modeling)
* [Fivetran: Star Schema vs. OBT](https://fivetran.com/blog/star-schema-vs-obt)
* [BigQuery Architecture and Nested Data (Google Cloud Blog)](https://cloud.google.com/blog/products/data-analytics/bigquery-explained-working-with-joins-nested-repeated-data)
