---
title: "Data Transformation"
category: "ETL / ELT"
difficulty: "Intermediate"
tags: ["data-transformation", "etl", "elt", "data-cleansing", "sql", "dbt"]
readingTime: "9 mins"
lastUpdated: 2026-06-07
seoTitle: "Data Transformation - Nghệ thuật làm sạch và biến đổi dữ liệu"
metaDescription: "Tìm hiểu chi tiết Data Transformation (Biến đổi dữ liệu): kỹ thuật làm sạch, chuẩn hóa, gộp bảng và áp dụng business logic để xây dựng Data Warehouse."
---

# Data Transformation

## Summary

Data Transformation (Biến đổi dữ liệu) là chữ "T" trong quy trình ETL/ELT. Đây là giai đoạn quan trọng và phức tạp nhất, nơi dữ liệu thô (raw data) chứa nhiều lỗi, định dạng không nhất quán và phân tán được làm sạch, cấu trúc lại và kết hợp với nhau. Mục tiêu của Data Transformation là tạo ra những bộ dữ liệu chuẩn mực, chất lượng cao, phản ánh đúng các quy tắc nghiệp vụ (Business Rules) để phục vụ việc phân tích BI và báo cáo chiến lược.

---

## Definition

**Data Transformation** là quá trình thay đổi định dạng, cấu trúc, hoặc giá trị của dữ liệu từ trạng thái nguồn thành trạng thái có thể tiêu thụ được ở hệ thống đích. 

Quá trình này bao gồm một chuỗi các thao tác:
* Lọc bỏ dữ liệu rác.
* Chuẩn hóa (đổi kiểu dữ liệu, đổi định dạng chuỗi).
* Tính toán các chỉ số phái sinh (derived metrics).
* Nối (Join) và gộp (Aggregation) thông tin từ nhiều bảng dữ liệu khác nhau.
* Mô hình hóa dữ liệu (như xây dựng Dimensional Modeling thành các bảng Fact và Dimension).

---

## Why it exists

Dữ liệu thô thu thập từ nhiều nguồn là một mớ hỗn độn ("Data Swamp"):
1. **Thiếu nhất quán**: Một hệ thống lưu giới tính là `M`/`F`, hệ thống khác lưu là `Male`/`Female`, thậm chí `1`/`0`.
2. **Sai sót nhập liệu**: Tên khách hàng bị viết thường (ví dụ: `nguyen van a`), số điện thoại có chứa cả chữ cái hoặc mã vùng hỗn loạn.
3. **Phân tán**: Để biết một "Khách hàng" thực sự mang lại bao nhiêu lợi nhuận, bạn cần nối thông tin chi phí quảng cáo (từ Facebook), thông tin đơn hàng (từ MySQL), và thông tin chăm sóc khách hàng (từ Zendesk). 

Bỏ qua bước Transformation mà cho phép phân tích thẳng trên dữ liệu thô sẽ dẫn đến các báo cáo sai lệch, khiến ban giám đốc đưa ra các quyết định sai lầm. "Garbage in, Garbage out" (Rác vào thì Rác ra).

---

## Core idea

Ý tưởng của quá trình Transformation hiện đại thường tuân theo một kiến trúc nhiều lớp (Multi-layered Architecture) thay vì làm mọi thứ trong một bước duy nhất. Kỹ thuật này thường được áp dụng thông qua các công cụ như **dbt**:

1. **Lớp Raw (Dữ liệu thô)**: Dữ liệu sao y bản chính từ nguồn.
2. **Lớp Staging (Làm sạch cơ bản)**: Thực hiện các phép biến đổi nhẹ (Light transformations) ở mức cột: đổi tên (alias), ép kiểu dữ liệu (casting), xử lý chuỗi (trimming), và chuẩn hóa múi giờ. Dữ liệu vẫn ở độ phân giải (grain) ngang bằng với nguồn.
3. **Lớp Integration / Intermediate (Kết hợp)**: Nối (Join) nhiều bảng Staging lại với nhau để tạo ra các thực thể nghiệp vụ (ví dụ: gộp bảng Người dùng và bảng Địa chỉ thành Thực thể Khách hàng duy nhất).
4. **Lớp Mart / Curated (Trình bày)**: Các phép biến đổi nặng (Heavy transformations). Thực hiện tổng hợp (GROUP BY), tạo Fact & Dimension. Đây là lớp dữ liệu "đẹp" nhất phục vụ trực tiếp cho báo cáo Tableau/PowerBI.

---

## How it works (Common Techniques)

Dưới đây là một số kỹ thuật (Thao tác) phổ biến nhất trong Data Transformation:

* **Cleansing (Làm sạch)**: Xóa các hàng có `user_id` bị NULL, hoặc chứa email sai định dạng (không có ký tự `@`).
* **Casting / Formatting**: Đổi cột tiền tệ từ kiểu `STRING` (ví dụ "$1,000") sang kiểu `DECIMAL(10,2)`. Chuyển tất cả ngày tháng (Timestamps) về một múi giờ chuẩn chung (UTC).
* **Derivation (Dẫn xuất)**: Tạo ra các cột thông tin mới. Ví dụ: Từ cột `ngay_sinh`, tính ra cột `do_tuoi_hien_tai = YEAR(CURRENT_DATE) - YEAR(ngay_sinh)`. Phân loại khách hàng: Nếu mua > 10 đơn thì `loai_kh` = 'VIP'.
* **Joining / Merging**: Kết hợp dữ liệu từ bảng `orders` và `customers` dựa trên `customer_id` để biết khách hàng nào mua sản phẩm gì.
* **Aggregation (Gộp)**: Tổng hợp (SUM) toàn bộ doanh thu của các đơn hàng trong ngày thành một dòng duy nhất đại diện cho doanh thu của ngày hôm đó (ví dụ: để đưa vào bảng Fact).
* **Pivoting**: Xoay dữ liệu từ dạng dọc (hàng) sang dạng ngang (cột) hoặc ngược lại (Unpivot).

---

## Architecture / Flow

```mermaid
graph TD
    subgraph 1. Raw Data Layer
        R1[(Stripe Raw: JSON)]
        R2[(Salesforce Raw: CRM)]
    end
    
    subgraph 2. Staging Layer (Light Transformation)
        S1(Clean Stripe:<br/>Extract JSON, Cast Date)
        S2(Clean Salesforce:<br/>Trim Spaces, Lowercase Emails)
    end
    
    subgraph 3. Integration Layer (Join & Derive)
        I1(Map Accounts:<br/>Join Stripe + Salesforce on Email)
    end
    
    subgraph 4. Data Mart Layer (Heavy Transformation)
        M1[(Fact_Revenue:<br/>Aggregated by Month)]
        M2[(Dim_Customer:<br/>VIP Status, Lifetime Value)]
    end

    R1 --> S1
    R2 --> S2
    S1 --> I1
    S2 --> I1
    I1 --> M1
    I1 --> M2
```

---

## Practical example

Ví dụ sử dụng SQL (chuẩn dbt) để chuyển đổi dữ liệu từ lớp Staging sang Integration, tạo ra một bảng tổng hợp hành vi mua hàng:

```sql
-- Dữ liệu nguồn: stg_orders (đã làm sạch ngày tháng và kiểu dữ liệu)
WITH orders AS (
    SELECT 
        customer_id,
        order_id,
        order_date,
        total_amount
    FROM {{ ref('stg_orders') }}
    WHERE status = 'completed'
),

-- Dữ liệu nguồn: stg_customers (đã làm sạch tên, email)
customers AS (
    SELECT 
        customer_id,
        email,
        country
    FROM {{ ref('stg_customers') }}
),

-- BƯỚC TRANSFORM NGHIỆP VỤ (Gộp dữ liệu và tạo Metric phái sinh)
customer_behavior AS (
    SELECT 
        c.customer_id,
        c.email,
        c.country,
        MIN(o.order_date) AS first_order_date,
        MAX(o.order_date) AS latest_order_date,
        COUNT(o.order_id) AS total_orders_count,
        SUM(o.total_amount) AS lifetime_value
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY 1, 2, 3
)

-- Tạo biến phân loại khách hàng
SELECT 
    *,
    CASE 
        WHEN total_orders_count > 10 AND lifetime_value > 1000 THEN 'Gold'
        WHEN total_orders_count > 0 THEN 'Active'
        ELSE 'Churned'
    END AS customer_segment
FROM customer_behavior
```

---

## Best practices

* **Transformation là Code (Data as Code)**: Hãy dùng các công cụ cho phép viết các luật chuyển đổi thành mã nguồn (ví dụ file `.sql` trong dbt). Quản lý chúng bằng Git. Đừng sử dụng các công cụ kéo thả (Drag-and-Drop ETL GUIs) cho các logic nghiệp vụ phức tạp vì chúng rất khó để truy vết (Version Control) khi có người sửa nhầm một logic.
* **Tách rời (Decouple) các bước**: Không viết một câu lệnh SQL dài 1000 dòng để vừa đổi định dạng, vừa Join 10 bảng, vừa tính tổng. Việc gộp chung này (Monolithic SQL) khiến câu lệnh không thể debug (tìm lỗi) khi kết quả bị sai. Hãy tách thành nhiều view nhỏ theo mô hình CTEs (Common Table Expressions) hoặc nhiều Layer.
* **Testing**: Luôn áp dụng kiểm thử (Data Tests) vào sau bước Transform. Hãy viết các bài test để đảm bảo: `customer_id` không bao giờ bị NULL, doanh thu (revenue) không bao giờ là số âm.

---

## Common mistakes

* **Quá tải hệ thống nguồn (Trong kiến trúc ETL cũ)**: Thực hiện Transform (Join, Sort) trên chính cơ sở dữ liệu vận hành. Điều này làm chết Database. Hãy kéo dữ liệu ra trước (vào máy chủ ETL hoặc Cloud DWH) rồi mới Transform (mô hình ELT).
* **Mất dữ liệu gốc (Data Loss)**: Nếu bạn sửa một giá trị sai (ví dụ đổi tuổi `999` thành `NULL`) bằng cách cập nhật trực tiếp vào bảng Raw, bạn vĩnh viễn mất đi dấu vết là hệ thống nguồn đang sinh ra rác. Hãy luôn giữ nguyên bảng Raw, và chỉ áp dụng luật biến đổi (biến `999` thành `NULL`) ở lớp Staging. Dữ liệu Raw là "bằng chứng" không thể xâm phạm.

---

## Trade-offs

### Dùng SQL (ELT)
* *Ưu điểm*: Hầu như ai làm dữ liệu cũng biết SQL. Dễ dàng tận dụng sức mạnh khổng lồ của Data Warehouse (như BigQuery) để xử lý lượng dữ liệu vô hạn.
* *Nhược điểm*: SQL không giỏi trong việc bóc tách chuỗi phức tạp (Regex nặng), xử lý hình ảnh, text tự do, hoặc các mô hình toán học (Machine Learning).

### Dùng Python/Spark (ETL)
* *Ưu điểm*: Mạnh mẽ tuyệt đối, có thể dùng thư viện xử lý bất kỳ định dạng phức tạp nào (JSON lồng sâu hàng chục cấp, XML, AI models).
* *Nhược điểm*: Đòi hỏi kỹ năng lập trình (Software Engineering). Việc bảo trì cluster (cụm máy chủ Spark) phức tạp và tốn kém hơn so với việc gửi câu lệnh SQL đi.

---

## When to use

* Bước bắt buộc trong mọi Data Pipeline để mang lại giá trị thực sự cho người dùng cuối (Business Users).

## When not to use

* Không dùng Heavy Transformation đối với dữ liệu phục vụ mục đích "Audit" (kiểm toán) hoặc lưu trữ pháp lý (Compliance Archiving). Những dữ liệu này yêu cầu tính nguyên bản 100% (Raw).

---

## Related concepts

* [ETL](/concepts/etl)
* [ELT](/concepts/elt)
* [Dimensional Modeling](/concepts/dimensional-modeling)
* [Data Mart](/concepts/data-mart)

---

## Interview questions

### 1. Sự khác biệt giữa làm sạch dữ liệu (Data Cleansing) và định dạng dữ liệu (Data Shaping/Modeling) trong quá trình Transformation là gì?
* **Người phỏng vấn muốn kiểm tra**: Khả năng phân lớp kiến trúc tư duy logic.
* **Gợi ý trả lời (Strong Answer)**: 
  * *Data Cleansing* tập trung vào chất lượng kỹ thuật của dữ liệu (Data Quality) ở mức độ cột/hàng: xóa khoảng trắng dư thừa, ép kiểu dữ liệu từ Text sang Date, loại bỏ các giá trị dị biệt hoặc NULL. Bước này thường nằm ở lớp Staging đầu tiên.
  * *Data Shaping/Modeling* tập trung vào ngữ nghĩa kinh doanh (Business Logic). Nó định hình lại cấu trúc bảng (như Pivot, Aggregate, phân chia Fact/Dimension), tính toán các KPIs (LTV, Churn Rate). Bước này nằm ở lớp Presentation/Data Mart cuối cùng phục vụ Dashboard.

### 2. Khi chạy một đoạn SQL Transformation có chứa phép JOIN giữa bảng Users và Orders, kết quả trả về số lượng đơn hàng (orders) nhiều gấp đôi so với thực tế. Nguyên nhân có thể là gì và khắc phục thế nào?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng debug SQL và hiểu biết về mô hình dữ liệu (Fan-out problem).
* **Gợi ý trả lời (Strong Answer)**:
  Nguyên nhân phổ biến nhất là hiện tượng **Fan-out (nhân bản dòng)**. Hiện tượng này xảy ra do phép JOIN không phải là 1-1 hay 1-N chuẩn. Ví dụ: Bảng Users bị trùng lặp dữ liệu (có 2 dòng cho cùng một User ID). Khi `LEFT JOIN Orders` sang `Users`, mỗi đơn hàng sẽ bị nhân đôi thành 2 dòng (khớp với cả 2 dòng user bị trùng). 
  *Cách khắc phục*: Trước khi JOIN, phải luôn làm sạch và đảm bảo tính duy nhất (Uniqueness) của bảng dùng làm gốc (Sử dụng `GROUP BY` hoặc hàm cửa sổ `ROW_NUMBER()` để lọc ra 1 dòng duy nhất cho mỗi User ID trong bảng Users).

---

## References

1. **dbt Labs Documentation** - "How we structure our dbt projects" - Cẩm nang chuẩn mực về chia Layer khi Transform.
2. **Fundamentals of Data Engineering** - Joe Reis (Chương Transformation).

---

## English summary

Data Transformation is the pivotal "T" phase in ETL/ELT, where messy, disparate raw data is cleaned, structured, and enriched with business logic to make it suitable for analytics. Modern data engineering typically breaks transformation into multiple modular layers (Raw, Staging, Integration, Data Marts) using tools like dbt and SQL. Techniques range from basic data cleansing (casting, trimming, handling NULLs) to complex joining, aggregation, and dimensional modeling. Adopting "Data as Code" practices, implementing rigorous data testing, and avoiding transformations that alter immutable raw source data are essential best practices for a reliable pipeline.
