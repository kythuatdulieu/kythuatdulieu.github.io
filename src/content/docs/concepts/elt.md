---
title: "ELT (Extract, Load, Transform)"
category: "ETL / ELT"
difficulty: "Beginner"
tags: ["elt", "data-integration", "cloud-data-warehouse", "modern-data-stack", "dbt"]
readingTime: "8 mins"
lastUpdated: 2026-06-07
seoTitle: "ELT (Extract, Load, Transform) - Sự thay thế cho ETL truyền thống"
metaDescription: "Khái niệm ELT là gì. Tại sao mô hình Trích xuất, Nạp rồi mới Biến đổi (ELT) kết hợp với công cụ như dbt đang trở thành tiêu chuẩn mới trong Data Engineering."
---

# ELT (Extract, Load, Transform)

## Summary

ELT (Extract, Load, Transform) là mô hình tích hợp dữ liệu hiện đại, thay thế cho quy trình ETL truyền thống. Trong ELT, dữ liệu thô (raw data) được trích xuất từ nguồn và nạp trực tiếp vào kho lưu trữ đích (Cloud Data Warehouse hoặc Data Lake) một cách nhanh nhất có thể. Sau đó, quá trình biến đổi (Transform) được thực hiện bằng cách tận dụng chính sức mạnh tính toán khổng lồ của kho lưu trữ đích thông qua các câu lệnh SQL. Sự ra đời của ELT đánh dấu sự hình thành của Modern Data Stack (Ngăn xếp Dữ liệu Hiện đại).

---

## Definition

**ELT** bao gồm 3 bước:
1. **E - Extract (Trích xuất)**: Kéo dữ liệu từ các ứng dụng nguồn (API, Database, Logs).
2. **L - Load (Nạp)**: Lưu thẳng dữ liệu thô này vào hệ thống phân tích đích (như Snowflake, BigQuery, Redshift) dưới định dạng nguyên bản nhất (thường là dạng bảng thô hoặc JSON) mà không can thiệp logic nghiệp vụ.
3. **T - Transform (Biến đổi)**: Sử dụng các công cụ thao tác dữ liệu (như **dbt - data build tool**) để chạy các câu lệnh SQL trực tiếp trên Data Warehouse. Quá trình này đọc dữ liệu thô đã nạp, làm sạch, kết hợp (join) và tạo ra các bảng tổng hợp (Data Marts) sẵn sàng cho báo cáo.

---

## Why it exists

Sự ra đời của Điện toán đám mây (Cloud Computing) đã thay đổi hoàn toàn luật chơi:
1. **Lưu trữ đám mây cực rẻ**: Không giống như máy chủ cục bộ (on-premise), việc lưu trữ hàng terabyte dữ liệu rác/thô trên Amazon S3 hay Google Cloud tốn rất ít tiền. Không cần phải lọc dữ liệu khắt khe trước khi lưu nữa.
2. **Kiến trúc tách rời Tính toán và Lưu trữ (Separation of Compute and Storage)**: Các Cloud Data Warehouse như Snowflake hay BigQuery cho phép bật hàng chục cụm máy chủ (clusters) để xử lý dữ liệu (compute) chỉ trong vài giây, xử lý xong thì tắt đi. Tính năng này mang lại sức mạnh xử lý song song vô song.

Nếu dùng mô hình ETL truyền thống, chiếc máy chủ ETL trung gian trở thành nút thắt cổ chai (bottleneck) kìm hãm tốc độ. Tại sao phải mua một máy chủ ETL lớn để xử lý dữ liệu, trong khi ta có thể vứt tất cả dữ liệu thô vào BigQuery và để cỗ máy SQL khổng lồ của Google làm việc biến đổi đó chỉ trong vài giây? Đó là lý do ELT lên ngôi.

---

## Core idea

Ý tưởng chủ đạo của ELT là **"Load first, figure it out later" (Cứ nạp vào đi, xử lý sau)**.

Thay vì phải code các script Python/Java phức tạp để map dữ liệu trên đường truyền, kỹ sư dữ liệu chỉ cần dùng các công cụ tự động (như Fivetran, Airbyte) để "sao chép" cấu trúc bảng từ nguồn sang đích một cách "mù quáng" (1-1 replication). Mọi logic nghiệp vụ (business logic) được đẩy về giai đoạn cuối (Transform), và ngôn ngữ thống trị giai đoạn này là **SQL**. 

Sự thay đổi này đã sinh ra một vai trò mới: **Analytics Engineer**. Analytics Engineer không cần biết lập trình Python hay hạ tầng phức tạp, chỉ cần giỏi SQL và hiểu nghiệp vụ là có thể tự mình xây dựng toàn bộ luồng chuyển đổi dữ liệu (Data Modeling).

---

## How it works

Chu trình ELT hiện đại điển hình (Sử dụng Airbyte + BigQuery + dbt):

1. **Extract & Load (Chạy tự động)**: 
   * Bạn cài đặt Airbyte kết nối vào cơ sở dữ liệu Postgres (Nguồn).
   * Airbyte tự động đồng bộ (sync) toàn bộ bảng `users` và `orders` nguyên gốc vào một dataset trong BigQuery tên là `raw_data`. Quá trình này chạy tự động mỗi 1 giờ mà không cần viết một dòng code nào.
2. **Transform (Logic SQL)**:
   * Trên công cụ `dbt`, Analytics Engineer viết một đoạn mã SQL đơn giản: 
     `SELECT user_id, COUNT(order_id) as total_orders FROM raw_data.orders GROUP BY user_id`.
   * dbt sẽ gửi câu lệnh SQL này tới BigQuery thực thi. BigQuery dùng hàng ngàn CPU của mình để tính toán trong 2 giây, và lưu kết quả vào một bảng mới tên là `analytics.user_metrics`.

---

## Architecture / Flow

```mermaid
graph LR
    subgraph Data Sources
        S1[(PostgreSQL)]
        S2[Hubspot API]
        S3[Google Ads]
    end
    
    subgraph Automated Ingestion (Extract & Load)
        Ingest[Fivetran / Airbyte<br/>*Replicate data as-is*]
    end
    
    subgraph Cloud Data Warehouse (Snowflake / BigQuery)
        Raw[(Raw Data Layer)]
        TransformEngine[Transform via SQL<br/>(e.g., dbt)]
        Clean[(Curated Data Marts)]
        
        Raw --> TransformEngine
        TransformEngine --> Clean
    end

    S1 --> Ingest
    S2 --> Ingest
    S3 --> Ingest
    Ingest --> Raw
```

---

## Practical example

Ví dụ về bước "Transform" trong mô hình ELT sử dụng **dbt** (dựa trên SQL). Chú ý rằng không có Python hay di chuyển dữ liệu qua mạng, mọi thứ chạy ngay bên trong Data Warehouse:

File `stg_customers.sql` (Bước làm sạch từ lớp Raw):
```sql
WITH raw_customers AS (
    SELECT * FROM {{ source('raw_postgres', 'customers') }}
)
SELECT 
    id AS customer_id,
    UPPER(TRIM(first_name)) AS first_name, -- Chuẩn hóa chuỗi ngay bằng SQL
    email,
    CAST(created_at AS DATE) AS signup_date
FROM raw_customers
WHERE email IS NOT NULL
```

File `dim_customers.sql` (Tạo bảng phân tích cuối cùng):
```sql
SELECT 
    customer_id,
    first_name,
    signup_date
FROM {{ ref('stg_customers') }}
```

---

## Best practices

* **Bảo vệ Raw Data (Dữ liệu thô)**: Không bao giờ được phép dùng câu lệnh `UPDATE` hoặc `DELETE` để sửa đổi dữ liệu ở vùng Raw. Vùng Raw phải phản ánh chính xác trạng thái lịch sử của nguồn. Mọi việc làm sạch đều phải thông qua tạo View hoặc Bảng mới ở vùng Transform (Staging/Curated Layer).
* **Tự động hóa Ingestion**: Hãy sử dụng các công cụ Managed Services (Fivetran, Airbyte, Stitch) để lo phần E và L. Đừng tự viết lại script để kéo API từ Facebook hay Google, vì API của họ thay đổi liên tục. Hãy dành nguồn lực kỹ thuật cho bước T (Transform nghiệp vụ).
* **Quản lý phiên bản (Version Control) cho Transform**: Bởi vì toàn bộ Transform giờ đây là các file SQL, hãy lưu trữ chúng trên GitHub, áp dụng quy trình kiểm tra mã (Code Review) và CI/CD tương tự như làm Software Engineering (Đây chính là triết lý của dbt).

---

## Common mistakes

* **Thực hiện Transform ở bước Load**: Sử dụng công cụ Ingestion tự động nhưng lại chèn thêm các script xử lý lọc dữ liệu ngầm. Điều này phá vỡ tính trong suốt (transparency) của ELT. Lỗi dữ liệu sẽ rất khó debug vì bạn không biết nó bị mất lúc kéo (E) hay bị mất lúc sửa ở đích (T).
* **Viết SQL nguyên khối khổng lồ (Spaghetti SQL)**: Thay vì chia nhỏ quá trình làm sạch và gộp thành các bước (như ví dụ `stg_` và `dim_` ở trên), người dùng ELT hay viết một câu lệnh SQL dài hàng nghìn dòng, bọc trong hàng chục lớp Subquery/CTE. Việc này khiến hệ thống không thể bảo trì nổi.

---

## Trade-offs

### Ưu điểm
* **Dân chủ hóa dữ liệu (Democratization)**: Việc dùng SQL làm ngôn ngữ chuyển đổi giúp hàng ngàn Data Analyst có thể tham gia vào việc xây dựng đường ống dữ liệu, thay vì chỉ phụ thuộc vào một số ít Data Engineer rành Python/Java.
* **Tốc độ linh hoạt**: Vì dữ liệu thô đã nằm sẵn trong kho, nếu logic tính toán sai, bạn chỉ việc sửa câu lệnh SQL và chạy lại ngay lập tức. Trong ETL truyền thống, bạn phải chạy lại cả quá trình trích xuất qua mạng tốn rất nhiều thời gian.
* **Khả năng mở rộng**: Tận dụng tối đa kiến trúc mở rộng vô hạn của Cloud Data Warehouse.

### Nhược điểm
* **Chi phí tính toán tăng vọt**: Vì mọi thao tác `SELECT`, JOIN, biến đổi đều phải gọi Cloud Data Warehouse thực thi, hóa đơn (billing) của Snowflake/BigQuery có thể vượt tầm kiểm soát nếu viết SQL không tối ưu.
* **Xử lý luồng (Streaming) kém**: SQL trên Data Warehouse thường tốt cho dạng Lô (Batch). Với dữ liệu thời gian thực (real-time stream), mô hình ELT thuần túy khó đáp ứng so với việc dùng Flink/Spark xử lý sự kiện trên đường truyền.

---

## When to use

* Là kiến trúc mặc định cho hầu hết các công ty khởi nghiệp và doanh nghiệp hiện đại chuyển dịch lên Cloud (Sử dụng Modern Data Stack).
* Khi đội ngũ dữ liệu của bạn có nhiều Data Analyst mạnh về SQL nhưng ít Software Engineer/Data Engineer mạnh về kỹ năng lập trình hệ thống.

## When not to use

* Với các tổ chức ngân hàng/chính phủ có quy định bảo mật khắt khe không được phép đẩy dữ liệu PII (nhạy cảm) thô chưa mã hóa lên một môi trường lưu trữ trung tâm. Lúc đó phải dùng ETL để chặn và xóa thông tin trên đường truyền.
* Các kiến trúc đòi hỏi độ trễ cực thấp (Sub-second real-time analytics).

---

## Related concepts

* [ETL](/concepts/etl)
* [Data Warehouse](/concepts/data-warehouse)
* [Data Ingestion](/concepts/data-ingestion)

---

## Interview questions

### 1. Tại sao kiến trúc ELT lại trở nên phổ biến mạnh mẽ trong khoảng 5-7 năm trở lại đây? Động lực công nghệ nào đằng sau sự thay đổi đó?
* **Người phỏng vấn muốn kiểm tra**: Kiến thức tổng quan về xu hướng ngành (Industry Trends) và hạ tầng Cloud.
* **Gợi ý trả lời (Strong Answer)**: 
  Sự trỗi dậy của ELT bắt nguồn từ sự ra đời của Cloud Data Warehouse có kiến trúc tách biệt lưu trữ và tính toán (Separation of Compute and Storage) như Snowflake và BigQuery. Lưu trữ trên S3/GCS cực kỳ rẻ, cho phép doanh nghiệp lưu mọi dữ liệu thô mà không lo chi phí đĩa cứng (Khác với On-premise ngày xưa). Đồng thời, sức mạnh tính toán (Compute) của các Cloud DWH mạnh đến mức nó có thể xử lý việc Join và Transform hàng terabyte dữ liệu qua SQL trong vài giây thay vì vài giờ như máy chủ ETL truyền thống. Cuối cùng, công cụ như dbt ra đời đưa quy chuẩn Software Engineering vào SQL, biến việc quản lý logic ELT trở nên chuyên nghiệp và an toàn.

### 2. Theo bạn, nhược điểm lớn nhất về mặt quản trị chi phí khi sử dụng mô hình ELT với Snowflake/BigQuery là gì?
* **Người phỏng vấn muốn kiểm tra**: Kinh nghiệm thực chiến và tư duy quản trị vận hành (FinOps).
* **Gợi ý trả lời (Strong Answer)**:
  Nhược điểm lớn nhất là "Bẫy chi phí" (Cost Trap). Trong ELT, thao tác Transform dựa hoàn toàn vào việc chạy các lệnh SQL nặng (như `CREATE TABLE AS SELECT...`) trên Data Warehouse. Nếu một Analytics Engineer viết câu lệnh SQL không tối ưu (Cross Join, không dùng Partition), hoặc thiết lập dbt chạy toàn bộ các model (Full Refresh) mỗi 15 phút một lần, Data Warehouse sẽ sử dụng hàng chục Compute Node (Cluster) liên tục. Vì Cloud tính tiền theo mức độ sử dụng (Pay-as-you-go), hóa đơn điện toán cuối tháng có thể tăng vọt một cách không kiểm soát được nếu không có cơ chế giám sát.

---

## References

1. **Fundamentals of Data Engineering** - Joe Reis, Matt Housley.
2. **dbt Labs Blog** - "What is the Modern Data Stack?".
3. **"ETL vs ELT"** - Bài viết từ Fivetran Documentation giải thích lợi thế thương mại của mô hình ELT tự động.

---

## English summary

ELT (Extract, Load, Transform) reverses the traditional data integration process by loading raw data directly into the destination storage (such as a Cloud Data Warehouse or Data Lake) before applying any transformations. Capitalizing on the cheap storage and massively parallel SQL processing power of modern cloud platforms like Snowflake and BigQuery, ELT allows data teams (often Analytics Engineers using tools like dbt) to perform all business logic transformations using standard SQL. This paradigm shift, forming the core of the Modern Data Stack, dramatically improves agility and democratizes data engineering, though it requires careful management of cloud compute costs.
