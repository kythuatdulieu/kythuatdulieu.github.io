---
title: "Incremental Load"
difficulty: "Intermediate"
tags: ["incremental-load", "etl", "data-pipeline", "watermark", "upsert", "cdc"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Incremental Load - Nạp dữ liệu gia tăng tối ưu Data Pipeline"
metaDescription: "Tìm hiểu phương pháp Incremental Load (Nạp gia tăng) trong ETL/ELT: cách sử dụng High Watermark, quản lý trạng thái (State), Change Data Capture (CDC) và khác biệt so với Full Load."
description: "Khi xây dựng Data Pipeline, phương pháp lấy dữ liệu tăng dần (Incremental Load) giúp tối ưu hóa hiệu suất, giảm thiểu chi phí và rút ngắn thời gian xử lý thay vì việc tải toàn bộ dữ liệu (Full Load)."
---



Khi bắt đầu xây dựng một kho dữ liệu ([Data Warehouse](/concepts/1-distributed-systems-architecture/data-warehouse)) hoặc Data Lake, phương pháp đơn giản nhất để chuyển dữ liệu từ nguồn (Source) đến đích (Destination) là sao chép toàn bộ dữ liệu (Full Load). Tuy nhiên, khi dữ liệu lớn dần, việc sao chép hàng tỷ dòng dữ liệu mỗi ngày trở nên đắt đỏ, tốn thời gian và không cần thiết. Đây là lúc **Incremental Load (Nạp dữ liệu gia tăng)** trở thành một kỹ thuật bắt buộc trong Data Engineering.

## 1. Incremental Load là gì?

**Incremental Load** là chiến lược nạp dữ liệu (Ingestion) chỉ lấy các bản ghi **mới được tạo (inserted)** hoặc **vừa được cập nhật (updated)** từ hệ thống nguồn kể từ lần nạp dữ liệu gần nhất, thay vì tải lại toàn bộ tập dữ liệu.

Ví dụ: Bạn có một bảng `customers` với 1 tỷ bản ghi. Thay vì truy vấn và tải 1 tỷ bản ghi mỗi đêm, bạn chỉ truy vấn những khách hàng mới đăng ký hoặc thay đổi thông tin trong 24 giờ qua (giả sử có khoảng 10.000 bản ghi). 

## 2. Full Load vs. Incremental Load

| Tiêu chí | Full Load (Tải toàn bộ) | Incremental Load (Tải gia tăng) |
| :--- | :--- | :--- |
| **Cách thức** | Tải toàn bộ dữ liệu có trong nguồn ở mỗi chu kỳ. | Chỉ tải những dữ liệu thay đổi kể từ lần nạp trước. |
| **Tài nguyên** | Rất tốn kém (Network, Compute, Storage). | Tiết kiệm đáng kể tài nguyên. |
| **Thời gian chạy** | Càng ngày càng lâu khi dữ liệu phình to. | Nhanh, thường chạy ổn định trong thời gian ngắn. |
| **Độ phức tạp** | Rất đơn giản, chỉ cần `TRUNCATE` và `INSERT`. | Phức tạp, cần theo dõi trạng thái (State/Watermark) và xử lý `UPSERT`/`MERGE`. |
| **Khi nào dùng?** | Dữ liệu nhỏ (vài MB/GB), bảng cấu hình (Lookup/Dimension tables), hoặc lần nạp đầu tiên (Initial Load). | Dữ liệu lớn (Fact tables), dữ liệu giao dịch hoặc logs. |

## 3. Các cơ chế phổ biến để thực hiện Incremental Load

Để hệ thống ETL/ELT biết được "đâu là dữ liệu mới", bạn cần một cơ chế đánh dấu. Dưới đây là các kỹ thuật phổ biến nhất:

### 3.1. Dựa trên cột thời gian hoặc ID (Watermarking / High-water mark)

Đây là kỹ thuật phổ biến nhất. Hệ thống nguồn phải có một cột lưu trữ thời gian cập nhật cuối cùng (vd: `updated_at`, `modified_date`) hoặc một ID tăng dần (Auto-increment ID). 

**Quy trình hoạt động:**
1. Pipeline lưu trữ lại giá trị lớn nhất của cột `updated_at` ở lần chạy trước. Giá trị này gọi là **High-water mark** (hoặc State/Checkpoint).
2. Lần chạy tiếp theo, Pipeline sẽ truy vấn nguồn:
   \`\`\`sql
   SELECT * FROM customers 
   WHERE updated_at > '2026-06-15 00:00:00'; -- (Giá trị Watermark cũ)
   \`\`\`
3. Sau khi tải dữ liệu thành công, Pipeline cập nhật lại Watermark bằng giá trị `updated_at` lớn nhất trong lô dữ liệu vừa lấy được.

> **💡 Lưu ý:** Nếu chỉ dựa vào cột `created_at` (ngày tạo), bạn sẽ chỉ lấy được các bản ghi *mới thêm vào* nhưng sẽ bỏ sót các bản ghi *bị thay đổi* (updates).

### 3.2. Change Data Capture (CDC) - Dựa trên Transaction Log

Nếu việc truy vấn trực tiếp vào Database nguồn bằng cột `updated_at` gây áp lực lên hệ thống hoặc không có cột này, bạn có thể dùng **[CDC (Change Data Capture)](/concepts/2-data-ingestion-integration/change-data-capture/)**: Giúp trích xuất dữ liệu gia tăng tức thì, đọc trực tiếp các file log giao dịch của Database (như `binlog` trong MySQL, `WAL` trong PostgreSQL) để thu thập mọi sự kiện `INSERT`, `UPDATE`, `DELETE` ngay khi chúng xảy ra (Streaming hoặc Micro-batching). Các công cụ phổ biến cho CDC là **Debezium**, **AWS DMS**, hoặc **Fivetran**.

**Ưu điểm:** Bắt được cả các lệnh xoá cứng (Hard Deletes) mà phương pháp Watermark không thể làm được.

### 3.3. Dựa trên API (Pagination và Delta Tokens)

Khi tích hợp với các ứng dụng SaaS (Salesforce, Zendesk, Stripe), API thường hỗ trợ các query parameter như `updated_since` hoặc cung cấp một chuỗi `cursor` / `delta_token`. Bạn truyền token của lần gọi trước vào API để chỉ lấy các object bị thay đổi kể từ lúc đó.

## 4. Xử lý ghi dữ liệu vào đích (Destination)

Sau khi kéo được dữ liệu gia tăng (Delta data), bạn phải đưa nó vào Data Warehouse/Data Lake. Cách bạn ghi dữ liệu phụ thuộc vào bản chất dữ liệu:

### 4.1. Append-only (Chỉ thêm mới)

Sử dụng cho dữ liệu bất biến (Immutable data) như Logs, Events (vd: lượt click, pageviews). Bạn chỉ đơn giản là `INSERT` trực tiếp lô dữ liệu mới vào cuối bảng đích.

### 4.2. Upsert / Merge (Cập nhật nếu tồn tại, Thêm mới nếu chưa)

Với dữ liệu có thể thay đổi (Mutable data) như Thông tin người dùng, trạng thái đơn hàng:
- Nếu bản ghi đã tồn tại trong Data Warehouse (dựa trên Khóa chính - Primary Key), ta tiến hành **Cập nhật (UPDATE)**.
- Nếu bản ghi chưa tồn tại, ta tiến hành **Thêm mới (INSERT)**.
Thao tác này được gọi là **UPSERT** (Update + Insert) hay lệnh `MERGE` trong SQL.

**Ví dụ lệnh MERGE trên Snowflake/BigQuery:**
\`\`\`sql
MERGE INTO target_customers AS target
USING staging_incremental_customers AS source
ON target.customer_id = source.customer_id
WHEN MATCHED THEN 
  UPDATE SET 
    target.name = source.name,
    target.email = source.email,
    target.updated_at = source.updated_at
WHEN NOT MATCHED THEN 
  INSERT (customer_id, name, email, updated_at) 
  VALUES (source.customer_id, source.name, source.email, source.updated_at);
\`\`\`

> **📌 Kỹ thuật dbt:** Nếu bạn dùng công cụ như **dbt**, incremental load được hỗ trợ mạnh mẽ qua các materialization là `incremental` cùng các chiến lược như `merge`, `delete+insert`, hay `append`.

## 5. Những thách thức của Incremental Load

Dù tối ưu về hiệu năng, Incremental Load mang lại những khó khăn nhất định khi vận hành:

1. **Xoá cứng (Hard Deletes):**
   Nếu một bản ghi bị xoá hoàn toàn khỏi cơ sở dữ liệu nguồn bằng lệnh `DELETE`, cột `updated_at` sẽ không còn tồn tại để Watermark có thể kéo về. Dữ liệu trong Data Warehouse sẽ trở nên lỗi thời (bản ghi vẫn còn trong kho dữ liệu dù đã bị xoá ở nguồn).
   *Giải pháp:* Dùng Soft Deletes (thêm cột `is_deleted = boolean` thay vì xoá thật) hoặc áp dụng CDC.

2. **Dữ liệu đến trễ (Late-arriving Data):**
   Đôi khi hệ thống nguồn bị lỗi thời gian (clock skew) hoặc một transaction mất rất lâu để commit. Dữ liệu có thể được commit với timestamp cũ hơn Watermark hiện tại. Nếu pipeline của bạn chỉ lấy `>= Watermark`, bạn có thể bỏ sót dòng dữ liệu này.
   *Giải pháp:* Thường lùi Watermark lại một khoảng thời gian (Lookback window) ví dụ trừ đi 1-2 tiếng khi truy vấn, kết hợp với cơ chế Upsert tại đích để tránh trùng lặp.

3. **Quản lý Initial Load:**
   Để chạy Incremental Load, bảng đích phải có dữ liệu nền móng trước đó. Lần chạy đầu tiên luôn phải là Full Load (Historical Load), sau đó hệ thống mới lưu Watermark và chuyển sang Incremental cho các lần tiếp theo.

4. **Thay đổi cấu trúc (Schema Evolution):**
   Khi hệ thống nguồn thêm cột, đổi kiểu dữ liệu, các lô Incremental tiếp theo có thể gặp lỗi khi chèn vào bảng đích cũ. Công cụ Data Integration cần khả năng tự động cập nhật Schema.

## 6. Tổng kết

Incremental Load là một pattern thiết yếu đối với bất kỳ Data Engineer nào. Nó giải quyết bài toán tải dữ liệu quy mô lớn một cách bền vững. Tùy thuộc vào yêu cầu độ trễ (latency), hệ thống nguồn (Database vs API) và loại dữ liệu (Sự kiện vs Trạng thái), bạn sẽ quyết định việc dùng **Watermarking** cơ bản hay phải triển khai một hệ thống **CDC** phức tạp.

## Tài Liệu Tham Khảo
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [dbt Documentation on Incremental Models](https://docs.getdbt.com/docs/build/incremental-models)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
