---
title: "Mô hình hóa dữ liệu đa chiều - Dimensional Modeling"
difficulty: "Advanced"
tags: ["data-warehouse", "dimensional-modeling", "lakehouse", "databricks", "spark", "performance"]
readingTime: "20 mins"
lastUpdated: 2026-06-26
seoTitle: "Dimensional Modeling trong Lakehouse: Kiến trúc, Tối ưu & Thực chiến"
metaDescription: "Đi sâu vào kiến trúc vật lý của Dimensional Modeling trên Lakehouse. Tối ưu hiệu năng với Dynamic Partition Pruning, Broadcast Join và Liquid Clustering."
description: "Dimensional Modeling không chỉ là vẽ Fact và Dimension. Dưới góc nhìn của Data Engineer, nó là bài toán tối ưu I/O, giảm thiểu Network Shuffle và quản lý Storage Layer trong môi trường phân tán."
---

Dimensional Modeling (Mô hình hóa đa chiều) đã tồn tại từ những năm 90 qua cuốn sách kinh điển của Ralph Kimball. Tuy nhiên, nếu bạn mang nguyên xi tư duy thiết kế của Oracle/SQL Server lên các nền tảng phân tán hiện đại như Databricks (Delta Lake), Snowflake hay BigQuery, hệ thống của bạn sẽ sớm sụp đổ vì OOMKilled (Tràn RAM) hoặc chi phí I/O (Storage/Scan Cost) tăng vọt.

Bài viết này bỏ qua những lý thuyết bề nổi "Fact là gì? Dimension là gì?". Chúng ta sẽ mổ xẻ kiến trúc vật lý (Physical Execution) của Star Schema trên Lakehouse, Trade-offs của hệ thống, và cách xử lý Slowly Changing Dimension ở Data Scale lớn.

## 1. Kiến trúc Vật lý (Physical Execution) của Star Schema trên Lakehouse

Trong kiến trúc Medallion (Lakehouse), Star Schema thường được hiện thực hóa tại **Gold Layer**. Dữ liệu ở đây không lưu dưới dạng Row-based như OLTP mà là Columnar-based (Parquet).

Khi thiết kế Star Schema, bạn không chỉ tạo khóa ngoại (Foreign Keys) để Business Users kéo/thả báo cáo trên Power BI, mà bạn đang thiết kế **Data Layout** (Cách dữ liệu phân bổ trên đĩa) để bộ tối ưu hóa (Optimizer) có thể loại bỏ dữ liệu rác nhanh nhất có thể.

```mermaid
graph TD
    subgraph "Execution Engine("Spark / Photon / Presto")"
        C["Catalyst Optimizer"] -->|Pushdown Filter| DPP["Dynamic Partition Pruning"]
        C -->|Small Table < 10MB| BHJ["Broadcast Hash Join"]
    end
    
    subgraph "Storage Layer("Object Storage: S3/GCS")"
        F["("Fact_Sales\n("Delta / Parquet")\nHàng tỷ dòng, chia thành nhiều files")"]
        D["("Dim_Date\n("Delta / Parquet")\nNhỏ gọn, tĩnh")"]
    end
    
    DPP -.->|Skip Parquet RowGroups| F
    BHJ -.->|Replicate to all Worker Nodes| D
```

**Tại sao Star Schema lại có hiệu năng "vô đối" trên Distributed Systems?**

1. **Loại bỏ hoàn toàn Network Shuffle (Broadcast Join):** Các bảng Dimension thường có kích thước rất nhỏ (Dưới ngưỡng `spark.sql.autoBroadcastJoinThreshold`, mặc định là 10MB). Spark Optimizer sẽ đẩy toàn bộ bảng Dimension lên RAM của tất cả các Worker Nodes. Quá trình JOIN với bảng Fact khổng lồ diễn ra hoàn toàn trên cục bộ (Local), giúp loại bỏ quá trình Xáo trộn mạng (Network Shuffle) - tác nhân số 1 gây nghẽn cổ chai.
2. **Dynamic Partition Pruning (DPP):** Giả sử Query là `SELECT ... WHERE dim_date.year = 2024`. Đầu tiên, Spark filter bảng Dimension để lấy ra danh sách các `date_id` tương ứng với năm 2024. Danh sách ID này lập tức được tiêm (inject) ngược xuống tầng Scan của bảng Fact. Nhờ vậy, Spark bỏ qua hoàn toàn việc quét (I/O) các file Parquet chứa dữ liệu của năm 2023.

## 2. Liquid Clustering vs Partitioning: Bài toán Bottleneck của Fact Table

Trên Data Lake, nếu bạn thiết kế bảng Fact phân mảnh theo thời gian `PARTITIONED BY (sale_date)` với dữ liệu quá chi tiết, bạn sẽ nhanh chóng vấp phải **Small File Problem** (Hàng vạn file Parquet kích thước nhỏ giọt).

Các nền tảng như Databricks đã đưa ra **Liquid Clustering** (hoặc Z-Ordering) để thay thế Partition tĩnh, cho phép gom cụm đa chiều trên các cột thường xuyên được JOIN.

```sql
-- Thực chiến: Tạo bảng Fact với Delta Liquid Clustering trên Databricks
CREATE TABLE gold.fact_sales (
    sale_sk BIGINT GENERATED ALWAYS AS IDENTITY, -- Surrogate Key (Bảo vệ tính toàn vẹn)
    customer_sk BIGINT,
    product_sk BIGINT,
    store_sk BIGINT,
    sale_date DATE,
    quantity INT,
    total_amount DECIMAL(18,2)
)
USING DELTA
-- Thay vì PARTITIONED BY tĩnh, dùng CLUSTER BY để engine tự tổ chức file layout
CLUSTER BY (sale_date, store_sk, product_sk);

-- Định kỳ, Engine cần chạy lệnh sau để tổ chức lại dữ liệu và nén file
-- OPTIMIZE gold.fact_sales;
```

**Systemic Trade-offs:**
- **Ưu điểm:** Khắc phục triệt để lỗi Over-partitioning. Tốc độ Đọc (Read) tăng cấp số nhân nhờ **Data Skipping** tốt hơn dựa trên Min/Max Statistics bên trong Delta Log.
- **Nhược điểm (Chi phí):** Quá trình Ghi (Write/Merge) sẽ đắt đỏ hơn vì Engine phải tốn Compute Cost để tái tổ chức (Re-cluster) dữ liệu trên đĩa.

## 3. Thực thi Slowly Changing Dimension (SCD Type 2) ở Scale lớn

SCD Type 2 đòi hỏi bạn giữ lại toàn bộ lịch sử biến động của một Dimension. Ở môi trường phân tán, thực thi SCD Type 2 bằng `MERGE INTO` là một bài toán rất khó (Heavy Merge) vì bạn phải xử lý đồng thời hai trạng thái: **Đóng (Update)** dòng cũ và **Mở (Insert)** dòng mới.

Dưới đây là kỹ thuật UNION kinh điển trong Spark SQL/Delta Lake để xử lý gọn SCD Type 2 trong một `MERGE` duy nhất:

```sql
-- Thực chiến Spark SQL: MERGE SCD Type 2 trên Delta Lake
WITH silver_updates AS (
    -- Dữ liệu Upsert từ tầng Silver
    SELECT customer_id, address, phone, current_timestamp() as valid_from
    FROM silver.customer_events
    WHERE event_date = current_date()
),
merge_source AS (
    -- 1. Tập bản ghi để Mở (INSERT). Dùng customer_id làm merge_key
    SELECT customer_id AS merge_key, customer_id, address, phone, valid_from
    FROM silver_updates
    
    UNION ALL
    
    -- 2. Tập bản ghi để Đóng (UPDATE). Dùng NULL làm merge_key để đánh văng ra khỏi MATCHED của đợt Insert
    SELECT NULL AS merge_key, u.customer_id, u.address, u.phone, u.valid_from
    FROM silver_updates u
    JOIN gold.dim_customer target 
        ON u.customer_id = target.customer_id 
        AND target.is_current = true 
        AND (u.address <> target.address OR u.phone <> target.phone)
)

-- Bắt đầu Heavy Merge
MERGE INTO gold.dim_customer AS target
USING merge_source AS source
ON target.customer_id = source.merge_key

-- WHEN MATCHED (Bản ghi cũ cần đóng lại)
WHEN MATCHED AND target.is_current = true 
    AND (target.address <> source.address OR target.phone <> source.phone) THEN
    UPDATE SET 
        target.is_current = false, 
        target.valid_to = source.valid_from

-- WHEN NOT MATCHED (Bản ghi mới tinh hoặc phiên bản mới của KH cũ)
WHEN NOT MATCHED THEN
    INSERT (customer_id, address, phone, valid_from, valid_to, is_current)
    VALUES (
        source.customer_id, source.address, source.phone, 
        source.valid_from, cast('9999-12-31' AS timestamp), true
    );
```

**Rủi ro Vận hành (Real-world Incident): Cartesian Explosion / Retry Storms**
Nếu hệ thống Upstream gửi xuống các bản ghi trùng lặp (ví dụ `customer_id=123` xuất hiện 2 lần trong `silver_updates` do retry lặp lại), lệnh MERGE sẽ ngay lập tức gây ra lỗi `Multiple matches found` đối với Delta Lake hoặc bị Cartesian Product đối với Parquet thường.
*Cách khắc phục:* Luôn luôn dùng Window Function (như `row_number() over(partition by id order by event_time desc)`) ở tập nguồn để Deduplicate trước khi đưa vào mệnh đề `MERGE`.

## 4. OBT (One Big Table) vs. Star Schema: Đánh Đổi Hệ Thống

Một luồng quan điểm mới (Modern Data Stack) cho rằng máy chủ quá mạnh, Columnar DB quét quá nhanh, tại sao không gộp Fact và toàn bộ Dimension thành 1 bảng to (One Big Table)?

| Tiêu chí | Star Schema (Dimensional) | One Big Table (OBT) |
| :--- | :--- | :--- |
| **Lưu trữ (Storage Cost)** | Tối ưu hóa. Các trường text dài (Tên, Địa chỉ) chỉ lưu 1 lần bên Dimension. | Rất cao. Các Dimension dư thừa lặp lại ở mọi dòng giao dịch. |
| **Tính toán (Compute Cost)** | Tốn CPU để Hash Join. Đòi hỏi chiến lược Broadcast Join và DPP. | Cực thấp cho truy vấn vì không có JOIN. Chỉ tốn I/O Scan. |
| **Data Mutability (Cập nhật)** | Rất nhanh. Nếu `Tỉnh` đổi tên thành `Thành Phố`, chỉ cần UPDATE đúng 1 dòng trong `dim_location`. | Thảm họa. Phải quét và UPDATE lại (Rewrite) hàng tỷ dòng trong OBT chứa giá trị đó. |
| **Sự cố rớt RAM (OOMKilled)** | Dễ xảy ra nếu Dimension quá lớn, tràn bộ đệm Broadcast, rớt xuống Sort Merge Join. | Ít bị ảnh hưởng bởi Memory, chủ yếu là I/O Bound. |

**Kết luận thực chiến:** OBT chỉ phù hợp để làm Table đích cuối cùng (Serving Layer) cho các Feature Store trong Machine Learning hoặc báo cáo ad-hoc tĩnh cục bộ. Đối với kiến trúc Lakehouse tổng thể, Star Schema với SCD ở **Gold Layer** vẫn là chân lý thiết kế vì khả năng quản trị vòng đời và duy trì tính toàn vẹn cao.

## Nguồn Tham Khảo
- [Dimensional modeling in Amazon Redshift - AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/dimensional-modeling-in-amazon-redshift/)
- [Implementing a dimensional data warehouse with Databricks SQL - Databricks Blog](https://www.databricks.com/blog/2022/06/24/implementing-a-dimensional-data-warehouse-with-databricks-sql-part-1.html)
- [Databricks Lakehouse Data Modeling: Myths, Truths, and Best Practices - Databricks Blog](https://www.databricks.com/blog/2022/05/20/databricks-lakehouse-data-modeling-myths-truths-and-best-practices.html)
- *The Data Warehouse Toolkit - Ralph Kimball*
