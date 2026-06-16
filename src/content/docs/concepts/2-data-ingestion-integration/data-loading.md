---
title: "Data Loading"
difficulty: "Beginner"
tags: ["data-loading", "etl", "upsert", "append", "overwrite", "merge"]
readingTime: "10 mins"
lastUpdated: 2026-06-16
seoTitle: "Data Loading - Kỹ thuật nạp dữ liệu trong ETL/ELT"
metaDescription: "Tìm hiểu Data Loading (Nạp dữ liệu) là gì. Các chiến lược nạp dữ liệu quan trọng như Full Overwrite, Append, Incremental Load, và Upsert/Merge vào Data Warehouse/Data Lake."
description: "Trong quy trình ETL/ELT, Data Loading là bước cuối cùng và quan trọng đưa dữ liệu từ môi trường xử lý vào hệ thống lưu trữ đích."
---



Data Loading (Tải/Nạp dữ liệu) là bước "L" trong quy trình **ETL** (Extract, Transform, Load) hoặc **ELT** (Extract, Load, Transform). Nó đảm nhận trách nhiệm đưa dữ liệu vào hệ thống đích như **Data Warehouse** (kho dữ liệu), **Data Lake**, hoặc các hệ thống CSDL phân tích. 

Khác với các hệ thống giao dịch (OLTP) thường sử dụng lệnh `INSERT` để ghi từng dòng đơn lẻ, Data Loading tập trung vào hiệu suất nạp khối lượng lớn dữ liệu (Bulk Load/Batch Load). Các công nghệ như lệnh `COPY INTO` trong Snowflake/Databricks hay cơ chế Data Load Job trong Google BigQuery có thể giúp việc nạp hàng triệu, hàng tỷ dòng dữ liệu diễn ra với tốc độ rất nhanh.

## Các Chiến Lược Nạp Dữ Liệu (Data Loading Strategies)

Tùy vào tính chất của dữ liệu, yêu cầu về độ trễ, tài nguyên hệ thống và tính chất của nguồn cấp dữ liệu (source system), chúng ta có nhiều chiến lược Data Loading khác nhau.

### 1. Full Load (Tải Toàn Bộ / Ghi Đè)

**Mô tả:** Trong quá trình Full Load (còn gọi là Full Overwrite), dữ liệu cũ trên bảng đích sẽ bị xóa hoàn toàn (sử dụng lệnh `TRUNCATE` hoặc `DROP` rồi `CREATE` lại), sau đó toàn bộ dữ liệu mới sẽ được tải vào. 

**Ưu điểm:**
- **Đơn giản:** Dễ dàng phát triển và quản lý vì không cần phải theo dõi (tracking) các bản ghi nào đã bị thay đổi hay thêm mới kể từ lần Load cuối cùng.
- **Tính nhất quán:** Tránh được các lỗi lặp hoặc xung đột dữ liệu vì luôn có "phiên bản gốc" được làm mới hoàn toàn.

**Nhược điểm:**
- **Không tối ưu về mặt tài nguyên:** Rất tốn kém thời gian, băng thông và khả năng tính toán (compute) khi dung lượng dữ liệu quá lớn (từ hàng triệu đến hàng tỷ rows).
- **Gây downtime:** Trong thời gian xóa dữ liệu cũ và ghi dữ liệu mới, hệ thống có thể bị gián đoạn (mặc dù các data warehouse hiện đại có tính năng *zero-copy clone* hoặc các giao dịch có thể che đi quá trình này).

**Khi nào nên dùng:**
- Dữ liệu ở bảng đích có kích thước nhỏ (ví dụ: các bảng danh mục - Dimension tables như danh sách Quốc gia, Danh sách Phòng ban, v.v.).
- Khi source database không có cách nào để track những dòng bị thay đổi hoặc cập nhật (không có `updated_at`, không có Change Data Capture).

### 2. Incremental Load (Tải Tăng Dần)

**Mô tả:** Khác với Full Load, Incremental Load chỉ nạp những dữ liệu **mới được thêm vào** (insert) hoặc **có sự thay đổi** (update/delete) kể từ lần tải cuối cùng.

**Ưu điểm:**
- **Hiệu suất cao:** Rất nhanh và tối ưu tài nguyên do lượng dữ liệu di chuyển là nhỏ nhất.
- **Tiết kiệm chi phí:** Phù hợp với các hệ thống đám mây (Cloud) nơi tính phí dựa trên lượng dữ liệu xử lý hoặc thời gian tính toán.

**Nhược điểm:**
- **Độ phức tạp cao:** Cần cơ chế lưu trữ "Watermark" (chẳng hạn như theo dõi trường ngày cập nhật cuối `updated_at` hoặc lưu Last Extract Date) để nhận biết dữ liệu nào cần lấy.
- Cần có cơ chế xử lý trường hợp bản ghi bị xóa (Hard delete) ở phía hệ thống nguồn.

**Các hình thức Incremental Load phổ biến:**

#### 2.1. Append-Only (Chỉ thêm mới)
- Dữ liệu mới luôn được chèn thêm vào bảng hiện có. 
- **Ứng dụng:** Thường được dùng cho các dữ liệu sự kiện (Event Logs, Time-series data, Clickstream) - nơi dữ liệu chỉ sinh ra thêm và hiếm khi thay đổi sau khi ghi nhận.

#### 2.2. Upsert / Merge (Cập nhật hoặc Thêm mới)
- Là sự kết hợp giữa Update (nếu dữ liệu đã tồn tại) và Insert (nếu dữ liệu chưa có). 
- Thông qua một khóa chính (Primary Key/Unique Key), hệ thống sẽ đối chiếu dữ liệu mới đến (Source/Staging) với dữ liệu đã lưu (Target) để đưa ra quyết định tương ứng. 
- **Ứng dụng:** Rất phổ biến khi đồng bộ dữ liệu người dùng, trạng thái đơn hàng (ví dụ một đơn hàng từ trạng thái "Pending" sang "Shipped" sẽ cần được Update thay vì Insert thêm một dòng đơn mới).

## Phương Thức Truyền Tải (Data Delivery Methods)

Bên cạnh các "chiến lược", Data Loading còn được phân chia theo "tần suất" cập nhật.

### Batch Loading (Nạp theo đợt)
- Hệ thống sẽ thu thập và tập hợp dữ liệu thành từng lô (batch) và tải vào kho theo một lịch trình định trước (hàng giờ, mỗi đêm, hàng tuần).
- Phù hợp với các báo cáo phân tích không cần tính tức thời (như báo cáo tài chính chốt cuối ngày).

### Micro-batching (Nạp đợt nhỏ)
- Rút ngắn chu kỳ batch lại thành từng phút hoặc thậm chí nhỏ hơn. Công nghệ tiêu biểu là Spark Streaming sử dụng micro-batch để giả lập luồng thời gian thực.

### Streaming / Real-time Loading (Nạp theo luồng)
- Dữ liệu được nạp vào kho ngay lập tức hoặc với độ trễ cực thấp (vài giây hoặc mili-giây) sau khi sự kiện phát sinh. 
- Các nền tảng như Kafka, Kinesis hay Snowpipe (của Snowflake) hỗ trợ rất tốt kiến trúc này, phục vụ cho những yêu cầu phản ứng nhanh (fraud detection - phát hiện gian lận, dynamic pricing - định giá động).

## Những Thách Thức Trong Data Loading

1. **Hiệu năng hệ thống đích (Target Database Bottlenecks):** Việc tải hàng tỷ dòng dữ liệu có thể làm kho dữ liệu quá tải, gây ảnh hưởng đến các người dùng cuối đang chạy báo cáo/query cùng lúc. Các giải pháp như tách biệt Compute cho việc Load và Query (như kiến trúc của Snowflake) là rất quan trọng.
2. **Xử lý sai sót dữ liệu (Error Handling):** Dữ liệu khi tải vào có thể gặp lỗi về kiểu dữ liệu (Data Type Mismatch), thiếu khóa ngoại, hoặc lỗi null. Các pipeline thường cần hỗ trợ cơ chế Dead Letter Queue (DLQ) hoặc Quarantine để lưu trữ các dữ liệu lỗi ra chỗ khác nhằm không làm crash toàn bộ batch.
3. **Idempotent Loading (Tính lũy đẳng):** Một quá trình nạp dữ liệu chuẩn phải đảm bảo tính lũy đẳng: Nếu pipeline bị lỗi và chạy lại 2, 3 lần trên cùng một batch dữ liệu, kết quả cuối cùng tại đích không bị nhân đôi (duplicate) hoặc lệch dữ liệu.

## Các Công Cụ Phổ Biến

- **Cloud Data Warehouses / Data Lakes:** Snowflake (Snowpipe, `COPY INTO`), Google BigQuery (Load Jobs), Amazon Redshift (`COPY` command), Databricks (Auto Loader).
- **Data Integration / ETL Tools:** Fivetran, Airbyte, dbt (cho phần T & L trong ELT), Apache NiFi.

## Tài Liệu Tham Khảo

* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
