---
title: "Khóa thay thế - Surrogate Key"
difficulty: "Intermediate"
tags: ["data-warehouse", "surrogate-key", "distributed-systems", "dbt", "snowflake", "bigquery"]
readingTime: "12 mins"
lastUpdated: 2026-06-26
seoTitle: "Surrogate Key trong Distributed Data Warehouse (Snowflake, BigQuery)"
metaDescription: "Thiết kế Surrogate Key trong MPP Data Warehouse. So sánh Sequence Generator và Hash Key (MD5/FARM_FINGERPRINT). Trade-offs về hiệu suất, lưu trữ và Distributed Bottlenecks."
description: "Trong hệ thống Massively Parallel Processing (MPP) Data Warehouse, việc chọn đúng chiến lược sinh Surrogate Key quyết định khả năng scale, tránh Bottlenecks và đảm bảo toàn vẹn dữ liệu cho SCD."
---

Trong môi trường Data Warehouse phân tán (Distributed Data Warehouse), việc liên kết các chiều dữ liệu (Dimensions) và bảng sự kiện (Facts) đòi hỏi một khóa định danh duy nhất. Khác với OLTP (nơi dùng Natural/Business Key như `user_id` hay `email`), Data Warehouse phải quản lý lịch sử (Slowly Changing Dimensions - SCD) và giải quyết tính không đồng nhất từ nhiều nguồn. Đây là lúc **Surrogate Key (Khóa thay thế)** phát huy tác dụng.

Tuy nhiên, bài toán thực sự của một Data Engineer không nằm ở việc "tạo ra một ID tự tăng", mà là làm sao để tạo ra hàng tỷ ID một cách song song trên một cụm máy chủ MPP (Massively Parallel Processing) mà không gây nghẽn cổ chai (bottleneck) ở bộ định tuyến trung tâm.

![Surrogate Key Distributed Architecture](/images/6-data-modeling-transformation/surrogate-key-arch.png)

## 1. Physical Execution: Sequence Generators vs. Hash-Based Keys

Trong các kiến trúc dữ liệu truyền thống (SMP - Symmetric Multiprocessing như SQL Server hay PostgreSQL), Surrogate Key thường được sinh ra bằng cấu trúc `IDENTITY(1,1)` hoặc `SEQUENCE`. Cơ sở dữ liệu sẽ khóa (lock) một state nội bộ, cấp phát số tiếp theo, và nhả lock.

Nhưng khi chuyển sang nền tảng MPP (Snowflake, BigQuery, Databricks), cấu trúc này trở thành một "thảm họa" về hiệu suất.

### The Distributed Coordinator Bottleneck
Nếu bạn có 100 worker nodes cùng insert dữ liệu vào một bảng, việc sử dụng `SEQUENCE` đòi hỏi các nodes phải liên tục giao tiếp với một Coordinator node trung tâm để xin cấp phát dải số tiếp theo (hoặc xin từng số). Điều này phá vỡ tính chất "Shared-Nothing" của MPP, tạo ra độ trễ mạng (Network Latency) khổng lồ và Lock Contention.

### Giải pháp: Deterministic Hashing
Để loại bỏ sự phụ thuộc vào trạng thái trung tâm (Stateless Generation), xu hướng Modern Data Stack (đặc biệt là dbt và Data Vault) chuyển sang sử dụng **Hash-based Surrogate Keys**. Các worker nodes có thể băm (hash) Natural Key kết hợp với các thuộc tính nghiệp vụ (như `source_system`) bằng một hàm thuật toán (MD5, SHA-256) một cách hoàn toàn độc lập và song song.

```mermaid
graph TD
    subgraph "Distributed Hashing("No Bottleneck")"
    A1("Worker Node 1<br/>NK: 'CUST_01'") -->|MD5| B1("Hash: 9a3b...")
    A2("Worker Node 2<br/>NK: 'CUST_02'") -->|MD5| B2("Hash: f4c2...")
    A3("Worker Node 3<br/>NK: 'CUST_03'") -->|MD5| B3("Hash: 71de...")
    end
    B1 --> D["(Fact Table)"]
    B2 --> D
    B3 --> D
```

## 2. Code Thực chiến: Implement Surrogate Key trong Cloud DWH

Dưới đây là cách triển khai Surrogate Key sử dụng Hashing thông qua **dbt (Data Build Tool)** và một số hàm Native của các Cloud Data Warehouse.

### Dùng dbt Macro
dbt cung cấp macro `generate_surrogate_key` giúp chuẩn hóa việc tạo Hash Key, xử lý các vấn đề nhức nhối như Null values và Type casting ngầm.

```sql
-- models/dimensions/dim_customers.sql
WITH source_data AS (
    SELECT 
        customer_id,
        source_system,
        email,
        updated_at
    FROM {{ ref('stg_salesforce_customers') }}
)

SELECT 
    -- Tạo Hash Key từ Natural Key và Source System
    {{ dbt_utils.generate_surrogate_key(['customer_id', 'source_system']) }} AS customer_sk,
    customer_id AS business_key,
    email,
    -- Phục vụ SCD Type 2
    updated_at AS valid_from,
    LEAD(updated_at) OVER (PARTITION BY customer_id ORDER BY updated_at) AS valid_to
FROM source_data;
```

### Native Cloud DWH Functions
Nếu không dùng dbt, mỗi engine có một hàm băm tối ưu riêng ở tầng C++ / Rust bên dưới:
- **BigQuery:** Ưu tiên dùng `FARM_FINGERPRINT()` vì nó trả về `INT64` (chiếm 8 bytes) thay vì string (MD5 chiếm 32 bytes), giúp tăng tốc độ JOIN lên cực nhiều.
  ```sql
  SELECT FARM_FINGERPRINT(CONCAT(CAST(customer_id AS STRING), '|', source_system)) AS customer_sk
  ```
- **Snowflake:** `MD5()` trả về VARCHAR(32).
- **Databricks:** Databricks gần đây đã hỗ trợ `GENERATED ALWAYS AS IDENTITY`. Khác với các hệ thống MPP khác, Databricks đã tối ưu thuật toán cấp phát dải số (Range allocation) cho các worker nodes của Spark, giảm thiểu bottleneck. Tuy nhiên, nó vẫn làm mất đi tính Idempotency (xem phần dưới).

## 3. Systemic Trade-offs: Hashing vs. Sequence

Quyết định sử dụng Hash hay Sequence là một bài toán trade-off (đánh đổi) kinh điển trong System Design:

| Tiêu chí | Hash-based Key (MD5 / SHA256) | Sequence-based Key (Identity / Auto-increment) |
| :--- | :--- | :--- |
| **Idempotency (Tính luỹ đẳng)** | **Tuyệt đối.** Chạy lại (Backfill) 100 lần vẫn ra cùng một chuỗi Hash cho cùng một dòng dữ liệu. Rất quan trọng trong ELT. | **Kém.** Nếu bạn truncate bảng và load lại, các dòng cũ sẽ nhận ID mới, làm gãy toàn bộ bảng Fact đang tham chiếu. |
| **Storage / RAM** | Cao. MD5 String chiếm 32 bytes (gấp 4 lần BIGINT). Nếu Fact table có hàng chục tỷ dòng, dung lượng lưu trữ và RAM khi load vào bộ nhớ để JOIN sẽ phình to. | **Cực thấp.** INT hoặc BIGINT (4-8 bytes). Cực kỳ tối ưu cho bộ nhớ và CPU Cache (Data Locality). |
| **Network Shuffle / Bottleneck** | Không có Bottleneck. Hỗ trợ scale tuyến tính. | Gây Lock Contention ở Coordinator node. Có thể làm giảm Throughput ghi. |

### Rủi ro: Hash Collisions (Đụng độ Hash)
Theo **Nghịch lý Ngày sinh (Birthday Paradox)**, hàm MD5 (128-bit) có khả năng sinh ra hai chuỗi Hash giống nhau từ hai đầu vào khác nhau, dù tỷ lệ là cực kỳ thiên văn (khoảng 1 trên \$2^{64}$). Trong các tập dữ liệu dưới vài trăm tỷ dòng, xác suất đụng độ là không đáng kể. Nếu hệ thống của bạn (như Uber, Netflix) vượt qua giới hạn này, hãy sử dụng `SHA-256` (dù sẽ tốn chi phí compute hơn).

## 4. Rủi ro Vận hành (Operational Risks) & Troubleshooting

### Bài toán: Early Arriving Facts (Late Arriving Dimensions)
Đây là một "ác mộng" phổ biến trong Data Streaming hoặc Micro-batching. 
Giả sử một giao dịch (Fact) chứa `CUST-999` đẩy vào Kafka và load thẳng vào DWH. Tuy nhiên, thông tin chi tiết của `CUST-999` từ hệ thống CRM (Dimension) bị trễ mạng (Network Delay) và chưa có trong bảng `dim_customers`. 

Nếu Fact cố gắng JOIN để lấy `customer_sk`, nó sẽ trả về `NULL` và phá vỡ Referential Integrity.

**Giải pháp với Surrogate Key:**
Luôn khởi tạo các dòng "Bóng ma" (Ghost Rows / Dummy Rows) mang Negative Surrogate Keys trong bảng Dimension:
- `SK = -1`: Dành cho các Early Arriving Facts. Fact sẽ map với `-1` (nghĩa là "Unknown Customer"). Khi Dimension đến sau, bạn chỉ cần UPDATE lại thông tin vào dòng `-1` (hoặc map lại ở lần build fact tiếp theo).
- `SK = -2`: Not Applicable (Giao dịch không cần khách hàng).
- `SK = -3`: Corrupted / Invalid Data.

```sql
-- Khởi tạo Dummy Rows cho Dim_Customers
INSERT INTO dim_customers (customer_sk, business_key, email, status)
VALUES 
  (-1, 'UNKNOWN', 'unknown@system.local', 'N/A'),
  (-2, 'NOT_APPLICABLE', 'none', 'N/A');
```
Kỹ thuật này đảm bảo mọi truy vấn `INNER JOIN` sẽ không làm "bốc hơi" (drop) các dòng Fact bị thiếu Dimension, giữ cho tổng doanh thu (Sum of Revenue) luôn chính xác tuyệt đối.

## 5. Tổng kết

Việc chọn thiết kế Surrogate Key phản ánh độ trưởng thành của hệ thống Data Platform:
- Nếu bạn ở quy mô nhỏ, dùng PostgreSQL hoặc Redshift đời đầu, `IDENTITY` (Sequence) mang lại hiệu năng JOIN siêu việt với chi phí storage thấp.
- Nếu bạn xây dựng hệ thống MPP phân tán hiện đại, ưu tiên tính Idempotency và độ ổn định của ELT Pipelines, **Deterministic Hashing** thông qua dbt là con đường tốt nhất. Đừng sợ chi phí lưu trữ của Hash String, các Columnar DWH hiện tại (như Parquet, Snowflake micro-partitions) nén chuỗi (dictionary encoding) rất hiệu quả.

## Nguồn Tham Khảo (References)
* [Databricks Blog - Identity Columns to Generate Surrogate Keys](https://www.databricks.com/blog/2022/08/08/identity-columns-to-generate-surrogate-keys.html)
* [dbt Labs - A complete guide to surrogate keys and why they matter](https://docs.getdbt.com/blog/guide-to-surrogate-keys)
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* **Building Data Infrastructure at Uber**: Xử lý tính luỹ đẳng (Idempotency) trong Pipeline ETL phân tán.
