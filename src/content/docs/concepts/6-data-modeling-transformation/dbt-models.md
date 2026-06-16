---
title: "dbt Models - Tầng biến đổi và cấu trúc dự án"
difficulty: "Intermediate"
tags: ["dbt", "models", "data-modeling", "analytics-engineering", "sql"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Cấu trúc dbt Models: Staging, Intermediate và Marts"
metaDescription: "Khám phá cách tổ chức các dbt Models theo chuẩn Analytics Engineering. Phân biệt Source, Staging, Intermediate và Marts layer để xây dựng Data Warehouse."
description: "Nếu bạn đã từng làm việc trong một dự án dữ liệu lớn sử dụng SQL truyền thống, chắc hẳn bạn không lạ gì cảnh tượng: Những câu lệnh SQL dài hàng ngàn dòng, không có cấu trúc rõ ràng và rất khó để tái sử dụng. dbt (Data Build Tool) giải quyết bài toán đó bằng cách định nghĩa lại cách chúng ta viết và tổ chức SQL."
---



Nếu bạn đã từng làm việc trong một dự án dữ liệu lớn sử dụng SQL truyền thống (Stored Procedures, các script SQL rời rạc), chắc hẳn bạn không lạ gì cảnh tượng: Những câu lệnh SQL dài hàng ngàn dòng, logic chồng chéo phức tạp, thiếu kiểm thử (testing), và mỗi khi có lỗi xảy ra thì việc debug giống như "mò kim đáy bể". Thêm vào đó, việc tái sử dụng logic (DRY - Don't Repeat Yourself) bằng SQL thuần túy là một cơn ác mộng.

**dbt (data build tool)** ra đời để giải quyết các vấn đề này. Trong dbt, mọi biến đổi dữ liệu (transformation) được định nghĩa bằng các **Models**. dbt mang các best practices từ Software Engineering (như version control, CI/CD, modularity, testing, documentation) áp dụng vào thế giới Data Engineering & Analytics Engineering.

---

## 1. dbt Model là gì?

Trong dbt, một **Model** đơn giản là một file `.sql` chứa *duy nhất một câu lệnh `SELECT`*. 

Thay vì phải viết các câu lệnh DDL (`CREATE TABLE`, `CREATE VIEW`) hay DML (`INSERT`, `UPDATE`, `MERGE`), bạn chỉ cần tập trung vào logic truy vấn. Khi bạn chạy lệnh `dbt run`, dbt sẽ tự động "gói" câu lệnh `SELECT` của bạn vào các lệnh DDL/DML tương ứng và thực thi trên Data Warehouse (Snowflake, BigQuery, Redshift, PostgreSQL,...).

**Ví dụ một dbt Model (`customers.sql`):**

```sql
with customers as (
    select * from {{ ref('stg_customers') }}
),

orders as (
    select * from {{ ref('stg_orders') }}
),

customer_orders as (
    select
        customer_id,
        min(order_date) as first_order_date,
        max(order_date) as most_recent_order_date,
        count(order_id) as number_of_orders
    from orders
    group by 1
)

select
    customers.customer_id,
    customers.first_name,
    customers.last_name,
    customer_orders.first_order_date,
    customer_orders.most_recent_order_date,
    coalesce(customer_orders.number_of_orders, 0) as number_of_orders

from customers
left join customer_orders using (customer_id)
```

Ở ví dụ trên, hàm `{{ ref('model_name') }}` giúp dbt tự động xác định thứ tự chạy của các model, từ đó xây dựng một **DAG (Directed Acyclic Graph)** mô tả sự phụ thuộc giữa các tập dữ liệu.

---

## 2. Các hình thức lưu trữ (Materializations)

Một tính năng cực kỳ mạnh mẽ của dbt là khả năng dễ dàng thay đổi cách dữ liệu được lưu trong Data Warehouse thông qua **Materializations**. Chỉ cần thay đổi một dòng cấu hình, dbt sẽ thay đổi cách nó thực thi SQL.

Các loại Materializations phổ biến:

* **View (`materialized='view'`):** Là cấu hình mặc định. Khi chạy, dbt sẽ build model thành một view (`CREATE OR REPLACE VIEW`). Rất nhanh để build nhưng có thể chậm khi query nếu logic view phức tạp.
* **Table (`materialized='table'`):** dbt sẽ drop table cũ (nếu có) và tạo mới hoàn toàn (`CREATE TABLE AS SELECT`). Tốn thời gian build nhưng lại rất nhanh khi query từ các BI tools.
* **Incremental (`materialized='incremental'`):** Chỉ thêm mới (insert) hoặc cập nhật (update/merge) những dòng dữ liệu mới hoặc bị thay đổi kể từ lần chạy cuối cùng. Thích hợp cho các bảng dữ liệu khổng lồ (như logs, sự kiện click stream) mà việc build lại toàn bộ từ đầu là quá đắt đỏ và chậm chạp.
* **Ephemeral (`materialized='ephemeral'`):** Không tạo ra bất kỳ đối tượng vật lý nào trong Data Warehouse. Thay vào đó, dbt sẽ tự động chèn logic của model này như một CTE (Common Table Expression) vào bất kỳ model nào gọi tới nó qua hàm `ref()`. Rất hữu ích cho các logic trung gian để giữ cho Data Warehouse sạch sẽ.

**Cách cấu hình Materialization:**
Cấu hình trong file model `.sql` bằng block `config`:

```jinja
{{ config(materialized='table') }}

select * from ...
```

Hoặc cấu hình hàng loạt theo cấp thư mục trong file `dbt_project.yml`:

```yaml
models:
  my_project:
    marts:
      +materialized: table
```

---

## 3. Cấu trúc dự án dbt: Staging, Intermediate và Marts

Để tránh việc project dbt trở thành một "nồi lẩu thập cẩm", cộng đồng dbt đã thống nhất một chuẩn thiết kế kiến trúc phân lớp (Layers). Cấu trúc phổ biến nhất bao gồm:

### 3.1. Sources (Nguồn dữ liệu)
Không phải là model, Sources là những bảng dữ liệu thô (raw data) đã được load vào Data Warehouse (thường bởi các công cụ ELT như Fivetran, Airbyte, Stitch). Trong dbt, bạn khai báo Sources trong file `.yml` để có thể gọi chúng qua hàm `{{ source('source_name', 'table_name') }}`. Việc này giúp quản lý nguồn dữ liệu tập trung, và dbt có thể cảnh báo nếu dữ liệu gốc bị "cũ" hoặc thiếu cập nhật (thông qua Source Freshness).

### 3.2. Staging Layer (`stg_`)
Đây là tầng "cửa ngõ" của project dbt. Quy tắc quan trọng nhất của Staging: **Tỉ lệ 1-1 với Source tables**.

* **Mục đích:** Chuẩn hóa dữ liệu thô, đổi tên cột (aliasing) cho đồng nhất, ép kiểu dữ liệu (casting), xử lý timezone, loại bỏ dữ liệu rác hoặc áp dụng logic xóa mềm (soft-deletes).
* **Quy tắc:** Không join nhiều bảng lại với nhau ở tầng này.
* **Naming convention:** `stg_[source_system]__[table_name]` (Ví dụ: `stg_stripe__payments`, `stg_salesforce__users`).

```sql
-- stg_stripe__payments.sql
select
    id as payment_id,
    orderid as order_id,
    paymentmethod as payment_method,
    status as payment_status,
    -- Chuyển đổi từ cents sang dollars
    {{ dbt_utils.safe_divide('amount', 100) }} as payment_amount,
    created as created_at
from {{ source('stripe', 'payment') }}
```

### 3.3. Intermediate Layer (`int_`)
Tầng trung gian chứa các logic biến đổi phức tạp. Đây là nơi diễn ra phần lớn công việc "heavy-lifting".

* **Mục đích:** Xử lý các phép join phức tạp, aggregations, window functions. Tầng này chuẩn bị các "building blocks" (các mảnh ghép) để dễ dàng ghép lại ở tầng Marts mà không phải lặp lại code.
* **Quy tắc:** Thông thường dữ liệu ở đây chưa mang ý nghĩa business cuối cùng mà là bước đệm. Có thể dùng `ephemeral` materialization để tránh tạo bảng rác hoặc view tạm trong DWH.
* **Naming convention:** `int_[entity]__[verb/transformation]` (Ví dụ: `int_orders__joined_with_customers`, `int_payments__aggregated_by_order`).

### 3.4. Marts Layer (`fct_`, `dim_`, `rpt_`)
Tầng cuối cùng, nơi chứa dữ liệu "sạch sẽ, sẵn sàng" (Analytics-ready data) để cung cấp cho người dùng cuối (Business Users) hoặc công cụ BI (Tableau, PowerBI, Looker). Thường được mô hình hóa theo kiến trúc Dimensional Modeling (Kimball) hoặc One Big Table (OBT).

* **Mục đích:** Lưu trữ logic nghiệp vụ (business logic). Dễ dàng cho người dùng cuối phân tích mà không cần hiểu biết kỹ thuật phức tạp.
* **Quy tắc:** Thường được materialize dưới dạng `table` hoặc `incremental` để tối ưu hóa hiệu suất query.
* **Naming convention:** 
  * `dim_[entity]`: Các bảng chiều (Dimension tables) lưu thông tin đối tượng (vd: `dim_customers`, `dim_products`).
  * `fct_[process]`: Các bảng sự kiện (Fact tables) lưu số liệu đo lường theo thời gian (vd: `fct_orders`, `fct_website_events`).
  * `rpt_[report]`: Bảng tổng hợp sẵn dùng cho các report đặc thù.

**Cấu trúc thư mục minh họa:**

```text
models/
├── staging/
│   ├── stripe/
│   │   ├── _stripe__sources.yml
│   │   ├── _stripe__models.yml
│   │   └── stg_stripe__payments.sql
│   └── jaffle_shop/
│       ├── _jaffle_shop__sources.yml
│       ├── _jaffle_shop__models.yml
│       ├── stg_jaffle_shop__customers.sql
│       └── stg_jaffle_shop__orders.sql
├── intermediate/
│   ├── finance/
│   │   └── int_payments_pivoted_by_method.sql
├── marts/
│   ├── finance/
│   │   └── fct_revenue_daily.sql
│   ├── marketing/
│   │   └── dim_customers.sql
│   └── core/
│       └── fct_orders.sql
```

---

## 4. Sức mạnh của Jinja và Macros

dbt không chỉ là SQL thuần túy. Nó kết hợp SQL với **Jinja** - một ngôn ngữ templating mạnh mẽ. Điều này biến SQL từ ngôn ngữ khai báo tĩnh thành một ngôn ngữ động, có hỗ trợ vòng lặp (for loops), câu lệnh điều kiện (if/else), và đóng gói module qua Macros.

* **Macros:** Giống như "hàm" (functions) trong các ngôn ngữ lập trình khác. Nếu bạn thấy mình đang lặp lại một đoạn code SQL ở nhiều models, bạn có thể viết nó thành Macro.

**Ví dụ tạo Macro chuyển đổi Cents sang Dollars:**

```jinja
-- macros/cents_to_dollars.sql
{% macro cents_to_dollars(column_name, scale=2) %}
    round(cast({{ column_name }} as numeric) / 100, {{ scale }})
{% endmacro %}
```

Và sử dụng nó gọn gàng trong Model:

```sql
select
    payment_id,
    {{ cents_to_dollars('amount') }} as amount_usd
from {{ ref('stg_stripe__payments') }}
```

---

## 5. Đảm bảo chất lượng với Testing

Một trong những hạn chế lớn nhất của việc viết Data Transformation bằng Stored Procedure truyền thống là rất khó để test. dbt đưa Testing thành "công dân hạng nhất".

Có hai loại test chính trong dbt:
1. **Generic tests:** Được khai báo dưới dạng cấu hình trong các file `schema.yml`. Các test tích hợp sẵn gồm:
   * `unique`: Đảm bảo không có dữ liệu trùng lặp ở cột (như Primary Key).
   * `not_null`: Đảm bảo cột không chứa giá trị Null.
   * `accepted_values`: Đảm bảo dữ liệu chỉ nằm trong một danh sách cho trước (vd: Trạng thái đơn hàng chỉ gồm 'placed', 'shipped', 'completed', 'returned').
   * `relationships`: (Foreign Key) Đảm bảo id của bảng này phải tồn tại ở bảng kia.

```yaml
# models/staging/jaffle_shop/_jaffle_shop__models.yml
models:
  - name: stg_jaffle_shop__orders
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: status
        tests:
          - accepted_values:
              values: ['placed', 'shipped', 'completed', 'return_pending', 'returned']
```

2. **Singular tests:** Là các file SQL thuần túy (custom queries) nằm trong thư mục `tests/`. Nhiệm vụ của query này là **trả về các dòng dữ liệu bị lỗi**. Nếu kết quả trả về có >= 1 dòng, test đó được xem là Failed. Rất hữu ích cho các logic business phức tạp không thể bọc trong một test chung chung (Ví dụ: test đảm bảo tổng lợi nhuận của đơn hàng không thể là số âm).

---

## 6. Tổng Kết

Triển khai dbt Models không chỉ đơn thuần là việc chuyển code SQL cũ sang một nền tảng mới. Nó đòi hỏi một tư duy hệ thống (Systems Thinking) theo phương thức Software Engineering. Việc chia nhỏ SQL thành các layer logic (Staging -> Intermediate -> Marts) giúp cho hệ thống dữ liệu:
* **Dễ đọc, dễ hiểu (Readability):** Các model làm một nhiệm vụ nhỏ và rõ ràng.
* **Dễ tái sử dụng (Modularity):** Không cần viết lại những đoạn logic phức tạp.
* **Dễ bảo trì (Maintainability):** Khi có lỗi hoặc yêu cầu nghiệp vụ thay đổi, ta có thể khoanh vùng nhanh chóng sự cố diễn ra ở model nào.

Việc áp dụng chặt chẽ các chuẩn mực về cấu trúc dự án dbt là bước đi vững chắc nhất để xây dựng một kiến trúc dữ liệu hiện đại, đáng tin cậy.

## Tài Liệu Tham Khảo
* [dbt Documentation: Models](https://docs.getdbt.com/docs/build/models)
* [dbt Best Practices: How we structure our dbt projects](https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [The Data Warehouse Toolkit - Ralph Kimball](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/)
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
