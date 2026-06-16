---
title: "Modern Data Stack"
difficulty: "Beginner"
tags: ["modern-data-stack", "elt", "dbt", "fivetran", "snowflake"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Modern Data Stack (MDS) - Hệ sinh thái dữ liệu hiện đại"
metaDescription: "Tìm hiểu Modern Data Stack (MDS): định nghĩa, các thành phần công cụ như Fivetran, Snowflake, dbt, sự chuyển dịch từ ETL sang ELT và câu hỏi phỏng vấn."
description: "Modern Data Stack (MDS) đã thay đổi cách các doanh nghiệp xây dựng hệ thống dữ liệu nhờ sức mạnh của Cloud và mô hình ELT. Bài viết phân tích sâu vào các thành phần, ưu nhược điểm, và các edge cases thực tế."
---



Cách đây khoảng một thập kỷ, việc xây dựng một hệ thống phân tích dữ liệu lớn (Big Data) cho doanh nghiệp là một nhiệm vụ vô cùng gian nan. Bạn cần một đội ngũ lớn để thiết lập Hadoop cluster, viết các pipeline MapReduce phức tạp, và bảo trì hạ tầng phần cứng. Ngày nay, **Modern Data Stack (MDS)** đã thay đổi hoàn toàn điều đó.

MDS là một bộ công cụ dữ liệu thế hệ mới dựa hoàn toàn trên Cloud, nhấn mạnh vào khả năng mở rộng, tính dễ sử dụng, và sự dịch chuyển từ mô hình **ETL (Extract - Transform - Load)** sang **ELT (Extract - Load - Transform)**. 

---

## 1. Sự Dịch Chuyển Từ ETL Sang ELT



Trước khi có Cloud Data Warehouse (như Snowflake, BigQuery), việc tính toán (compute) và lưu trữ (storage) thường bị thắt chặt (tightly coupled) và đắt đỏ. 
*   **ETL truyền thống:** Dữ liệu phải được *Transform* ở một server trung gian (thường bằng các công cụ chuyên dụng như Informatica, Talend hoặc các custom script) trước khi *Load* vào Data Warehouse để giảm tải cho Data Warehouse.
*   **ELT hiện đại:** Nhờ kiến trúc phân tách compute và storage, cộng với sức mạnh xử lý song song của Cloud Data Warehouse, chúng ta có thể *Load* dữ liệu thô (raw data) trực tiếp vào kho, sau đó tận dụng chính sức mạnh tính toán của kho dữ liệu này để thực hiện *Transform* bằng SQL.

---

## 2. Các Thành Phần Cốt Lõi Của Modern Data Stack

Một kiến trúc MDS tiêu chuẩn thường bao gồm các "lego blocks" sau đây:

### 2.1. Ingestion (Trích xuất và Tải dữ liệu - Extract & Load)
Thay vì viết và bảo trì các API connector thủ công, các công cụ Ingestion hiện đại cung cấp hàng trăm connector có sẵn để kéo dữ liệu từ các SaaS apps (Salesforce, Zendesk, Facebook Ads) hoặc Databases (PostgreSQL, MySQL).

*   **Công cụ tiêu biểu:** Fivetran, Airbyte, Stitch.
*   **Edge Case / Lưu ý:** Xử lý dữ liệu CDC (Change Data Capture) từ các cơ sở dữ liệu lớn có thể gặp tình trạng lag nếu binlog quá lớn hoặc mạng không ổn định. Với Fivetran/Airbyte, bạn cần quản lý kỹ schema drift (khi các cột trong database nguồn bị thay đổi hoặc xóa bỏ).

### 2.2. Cloud Data Warehouse / Data Lakehouse (Lưu trữ và Xử lý)
Trái tim của hệ thống MDS. Nơi lưu trữ toàn bộ dữ liệu thô và dữ liệu đã qua xử lý. Các hệ thống hiện đại tính phí dựa trên lượng dữ liệu quét qua (scan) hoặc thời gian compute.

*   **Công cụ tiêu biểu:** Snowflake, Google BigQuery, Amazon Redshift, Databricks (Lakehouse).
*   **Edge Case / Lưu ý:** Chi phí có thể vượt kiểm soát (Runaway costs) nếu các câu query không được tối ưu hoặc partition không hiệu quả. 

### 2.3. Transformation (Chuyển đổi dữ liệu)
Khi dữ liệu đã nằm trong Data Warehouse, ta cần làm sạch, kết nối (join) và tổng hợp (aggregate) chúng. dbt (data build tool) đã trở thành tiêu chuẩn công nghiệp cho việc này. Nó cho phép Data Analysts và Data Engineers viết code SQL như Software Engineers (có version control, testing, CI/CD).

*   **Công cụ tiêu biểu:** dbt, Dataform.

**Ví dụ một dbt model đơn giản:**
```sql
-- models/marts/core/dim_users.sql

{{ config(materialized='table') }}

with raw_users as (
    select * from {{ ref('stg_salesforce__users') }}
),
user_events as (
    select 
        user_id,
        count(event_id) as total_events
    from {{ ref('stg_mixpanel__events') }}
    group by 1
)

select 
    u.user_id,
    u.full_name,
    u.email,
    e.total_events
from raw_users u
left join user_events e using (user_id)
```

### 2.4. Orchestration (Điều phối)
Điều phối thứ tự chạy của các task: "Chạy Airbyte lấy dữ liệu xong -> Chạy dbt transform -> Gửi report".

*   **Công cụ tiêu biểu:** Apache Airflow, Dagster, Prefect.

**Ví dụ Airflow DAG cho MDS:**
```python
from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.providers.airbyte.operators.airbyte import AirbyteTriggerSyncOperator
from datetime import datetime

with DAG('mds_daily_pipeline', start_date=datetime(2023, 1, 1), schedule_interval='@daily') as dag:
    
    # 1. Trigger Airbyte để kéo dữ liệu từ Postgres vào Snowflake
    sync_postgres_to_snowflake = AirbyteTriggerSyncOperator(
        task_id='airbyte_sync',
        airbyte_conn_id='airbyte_default',
        connection_id='your-connection-id-here'
    )

    # 2. Chạy dbt models
    run_dbt = BashOperator(
        task_id='dbt_run',
        bash_command='dbt run --profiles-dir /path/to/profiles'
    )

    sync_postgres_to_snowflake >> run_dbt
```

### 2.5. Data Visualization / Business Intelligence (BI)
Công cụ giúp người dùng cuối (Business Users) khám phá dữ liệu và tạo Dashboard.
*   **Công cụ tiêu biểu:** Looker, Tableau, Superset, Metabase, Preset.

### 2.6. Reverse ETL (Operational Analytics)
Đẩy dữ liệu đã được xử lý từ Data Warehouse ngược trở lại các công cụ vận hành (SaaS tools) để team Sales/Marketing sử dụng (ví dụ: đẩy điểm chấm điểm khách hàng - Lead Scoring từ Snowflake sang Salesforce).

*   **Công cụ tiêu biểu:** Hightouch, Census.

---

## 3. Những Thách Thức và Edge Cases Của Modern Data Stack

Mặc dù MDS mang lại tốc độ phát triển nhanh chóng, nhưng nó cũng đi kèm với một số vấn đề mà các Data Engineer cần chú ý:

1.  **Vấn Đề Về Chi Phí (Cost Proliferation):** Vì mô hình pay-as-you-go dễ dàng tiếp cận, nhiều công ty gặp tình trạng "hóa đơn sốc" cuối tháng do dbt models chạy full refresh quá nhiều lần thay vì chạy incremental, hoặc do các query BI quét qua toàn bộ historical data.
2.  **Quá Nhiều Công Cụ (Fragmentation):** Việc kết nối Fivetran, Snowflake, dbt, Airflow, Looker, và Monte Carlo tạo ra một pipeline phân mảnh. Khi có lỗi dữ liệu, việc trace lỗi qua 5-6 lớp công cụ (Data Lineage) trở nên phức tạp.
3.  **Vendor Lock-in:** Phụ thuộc quá nhiều vào hệ sinh thái của một nhà cung cấp cụ thể khiến việc chuyển đổi sang nền tảng khác sau này gặp khó khăn.
4.  **Kiểm soát chất lượng (Data Observability):** Việc áp dụng các bài test của dbt hoặc các công cụ Data Observability (Great Expectations, Monte Carlo) để phát hiện anomaly (sự bất thường) về mặt dữ liệu là một bước bắt buộc ở production.

---

## 4. Tương Lai: Post-Modern Data Stack?
Hiện nay, ngành dữ liệu đang nói nhiều đến "Post-Modern Data Stack" hoặc "Data Mesh", nhấn mạnh vào:
*   Đưa software engineering best practices vào data sâu hơn (Data as Code).
*   Phân quyền sở hữu dữ liệu về các domain (Domain-oriented data ownership).
*   Trỗi dậy của Lakehouse (Iceberg, Hudi, Delta Lake) cho phép query dữ liệu thô trực tiếp trên object storage mà không cần load vào warehouse truyền thống.

---

## Tài Liệu Tham Khảo
* [Designing Data-Intensive Applications - Martin Kleppmann (Part 2: Distributed Data)](https://dataintensive.net/)
* [CAP Theorem and PACELC - Daniel Abadi](http://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html)
* [Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)
* [Time, Clocks, and the Ordering of Events in a Distributed System - Leslie Lamport](https://lamport.azurewebsites.net/pubs/time-clocks.pdf)
* [MapReduce: Simplified Data Processing on Large Clusters - Google](https://research.google.com/archive/mapreduce.html)
* [The Modern Data Stack: Past, Present, and Future - a16z](https://a16z.com/2020/10/15/emerging-architectures-for-modern-data-infrastructure/)
* [dbt Documentation](https://docs.getdbt.com/)
* [Airbyte Architecture](https://docs.airbyte.com/understanding-airbyte/high-level-view/)
