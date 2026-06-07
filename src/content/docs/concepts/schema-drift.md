---
title: "Trôi dạt cấu trúc - Schema Drift"
category: "Observability & Reliability"
difficulty: "Intermediate"
tags: ["schema-drift", "data-observability", "data-engineering", "data-quality", "elt"]
readingTime: "9 mins"
lastUpdated: 2026-06-07
seoTitle: "Schema Drift là gì? Cách xử lý thay đổi cấu trúc dữ liệu"
metaDescription: "Tìm hiểu về Schema Drift (Trôi dạt cấu trúc) trong Data Engineering. Khái niệm, nguyên nhân, cách phát hiện và chiến lược Schema Evolution để xử lý tự động."
---

# Trôi dạt cấu trúc - Schema Drift

## Summary

Trôi dạt cấu trúc (Schema Drift) là hiện tượng khi cấu trúc của dữ liệu nguồn (Source Schema) thay đổi một cách đột ngột và thường không báo trước (ví dụ: thêm cột mới, xóa cột cũ, đổi tên cột, đổi kiểu dữ liệu). Đây là nguyên nhân hàng đầu gây ra sự đổ vỡ (failure) cho các Data Pipelines. Xử lý Schema Drift hiệu quả đòi hỏi sự kết hợp giữa Data Observability (để phát hiện) và Schema Evolution (để tự động thích ứng).

---

## Definition

**Schema Drift** xảy ra khi có sự không đồng bộ (mismatch) giữa cấu trúc (schema) mà dữ liệu thực tế đang mang và cấu trúc mà hệ thống Data Pipeline hoặc Data Warehouse kỳ vọng sẽ nhận được.

Schema bao gồm:
* Tên cột (Column names).
* Kiểu dữ liệu (Data types - ví dụ: từ `INT` chuyển sang `VARCHAR`).
* Thứ tự các cột (nếu đọc dữ liệu dạng CSV không có header).
* Các cột bắt buộc bị biến thành tùy chọn (NOT NULL to NULLable).

Khi có sự "trôi dạt", hệ thống trích xuất (ETL/ELT) thường sẽ phản ứng bằng cách báo lỗi (crash) và ngừng tải dữ liệu, hoặc tệ hơn là tải dữ liệu rác (ví dụ: cắt bớt chuỗi vì không vừa kiểu dữ liệu cũ).

---

## Why it exists

Nguyên nhân gốc rễ của Schema Drift đến từ sự phân tách (silo) giữa team Phần mềm (Software Engineering) và team Dữ liệu (Data Engineering):
1. **Phát triển ứng dụng linh hoạt (Agile)**: Các nhóm phát triển backend/ứng dụng di động triển khai tính năng mới hàng ngày. Họ có thể thêm trường `loyalty_points` vào CSDL MongoDB hoặc thay đổi tên trường `username` thành `email` để phù hợp với UI mới.
2. **Thiếu giao tiếp (Lack of Communication)**: Khi các thay đổi DDL (Data Definition Language) ở hệ thống nguồn được thực hiện, họ hiếm khi thông báo cho team Data.
3. **Dữ liệu phi cấu trúc/bán cấu trúc (Semi-structured data)**: Dữ liệu từ Webhooks, API trả về JSON hoặc log sự kiện thường không có một Schema vật lý cố định để ép buộc (Enforce).

---

## Core idea

Để giải quyết Schema Drift, chúng ta chuyển từ tư duy "Ngăn chặn" sang tư duy "Phát hiện và Thích ứng":
1. **Schema Registry / Contract (Hợp đồng dữ liệu)**: Thiết lập một thỏa thuận kỹ thuật (Data Contract) giữa nguồn và đích. Nguồn không được phát hành cấu trúc mới nếu không đăng ký trước.
2. **Phát hiện Schema (Schema Discovery / Monitoring)**: Một trong các trụ cột của Data Observability. Hệ thống liên tục theo dõi DDL changes và báo động ngay lập tức nếu phát hiện `DROP COLUMN` hoặc `ALTER TYPE`.
3. **Tiến hóa cấu trúc (Schema Evolution)**: Năng lực của kho dữ liệu (hoặc ELT tool) tự động điều chỉnh schema của chính nó (ví dụ: tự thêm cột mới vào cuối bảng DWH) để chứa dữ liệu mới mà không làm sập pipeline.

---

## How it works

Quy trình tự động hóa xử lý Schema Drift (sử dụng Fivetran / Snowflake làm ví dụ):
1. **Trích xuất (Extract)**: Tool Ingestion đọc dữ liệu từ nguồn (ví dụ binlog của MySQL).
2. **So sánh (Compare)**: So sánh cấu trúc của dòng dữ liệu vừa đọc được với cấu trúc của bảng đích trên Data Warehouse.
3. **Tiến hóa tự động (Evolve)**:
   * *Nếu thấy cột mới ở nguồn*: Tool tự động chạy lệnh `ALTER TABLE ADD COLUMN` trên DWH và nạp dữ liệu.
   * *Nếu thấy thiếu cột ở nguồn*: Nạp giá trị `NULL` vào cột đó ở DWH.
   * *Nếu đổi kiểu (INT -> FLOAT)*: Tự động chạy `ALTER TABLE ALTER COLUMN TYPE`.
4. **Cảnh báo (Alerting)**: Nếu cấu trúc bị đổi mang tính phá hủy (Destructive change - như xóa cột lõi `user_id`), tool sẽ chủ động ném ngoại lệ (Exception) và gửi tin nhắn Slack cho DE để can thiệp thủ công.

---

## Architecture / Flow

```mermaid
graph TD
    subgraph App Team
        App[Backend App] -->|Dev adds new field 'phone'| SourceDB[(MySQL Source)]
    end

    subgraph Data Ingestion (ELT)
        CDC[CDC Tool \n Fivetran/Debezium]
        CDC -->|Read Binlog| SchemaCheck{Match DWH Schema?}
    end

    subgraph Data Warehouse
        DWH[(Snowflake / BigQuery)]
    end

    subgraph Observability
        Slack[Slack Alert]
    end

    SourceDB --> CDC
    SchemaCheck -- "Yes" --> DWH
    SchemaCheck -- "No: New Column" -->|Auto ADD COLUMN| DWH
    SchemaCheck -- "No: Type Change" -->|Auto ALTER TYPE| DWH
    SchemaCheck -- "No: Destructive Change" -->|Halt Pipeline| Slack
```

---

## Practical example

**Bối cảnh:** Bạn đang dùng Spark để đọc các file JSON (log sự kiện) ghi vào Data Lake (định dạng Parquet).

**Vấn đề:** Ngày hôm qua, ứng dụng gửi JSON log có trường `user_id` là số (`12345`). Hôm nay, ứng dụng đổi `user_id` sang kiểu chuỗi UUID (`"a1b2-c3d4"`).
Nếu bạn dùng Spark đọc trực tiếp với schema cũ (INT), các UUID sẽ bị parse lỗi thành giá trị `NULL`. (Silent failure).

**Giải pháp với Schema Evolution của Delta Lake (Databricks):**
Kích hoạt tính năng Schema Evolution của định dạng Delta:

```python
# Kích hoạt merge schema
df.write \
  .format("delta") \
  .mode("append") \
  .option("mergeSchema", "true") \
  .save("/data/events")
```

Với `mergeSchema=true`, khi Delta Lake nhận thấy kiểu dữ liệu của cột `user_id` thay đổi từ Integer sang String (Upcasting), nó sẽ tự động cập nhật Schema của bảng vật lý thành String và lưu cả dữ liệu cũ (Int) và mới (String) dưới dạng String an toàn mà không làm lỗi ứng dụng.

---

## Best practices

* **Sử dụng Data Contracts**: Triển khai khái niệm Data Contract (thỏa thuận dữ liệu) bằng mã (ví dụ dùng JSON Schema hoặc Protobuf). Yêu cầu team Phần mềm phải thông qua CI/CD check: Nếu thay đổi schema phá vỡ Data Contract của hệ thống Data, code phần mềm không được phép deploy lên Production.
* **Tách biệt Ingestion và Transformation**: Sử dụng mô hình ELT. Ingestion (EL) chỉ làm nhiệm vụ nạp thô 1-1 và bật tính năng Auto Schema Evolution (tự thêm cột mới). Mọi logic đổi tên, xử lý kiểu dữ liệu được giữ lại tại tầng Transformation (T - dùng dbt). Khi nguồn đổi, DWH vẫn nhận được raw data, chỉ bị lỗi dbt models (dễ sửa và backfill hơn là mất dữ liệu từ nguồn).
* **Alerting trên Schema Changes**: Dù đã cấu hình Auto Evolution, bạn vẫn PHẢI thiết lập cảnh báo từ Data Observability platform. Việc thêm một cột không làm hỏng pipeline, nhưng Data Analyst cần biết cột đó tồn tại để đưa vào báo cáo!

---

## Common mistakes

* **Hardcode Schema trong ETL (Cứng nhắc)**: Ép kiểu dữ liệu bằng tay hoặc ghi rõ thứ tự cột trong các đoạn mã Python/SQL trích xuất. Bất kỳ sự thay đổi nhỏ nào cũng sẽ làm vỡ code.
* **Bật Schema Evolution vô tội vạ**: Nếu bạn cho phép tự động thay đổi kiểu dữ liệu một cách bừa bãi, chuỗi xử lý hạ nguồn (Downstream Dashboards) sẽ bị hỏng lây. Cần chặn các thay đổi mang tính phá vỡ (Destructive changes như Drop Column) ngay tại cổng Ingestion.

---

## Trade-offs

### Ưu điểm
* Giải quyết điểm đau lớn nhất và tốn nhiều thời gian nhất của Data Engineer: Fix lỗi pipeline vì nguồn đổi cấu trúc.
* Giúp dữ liệu thô (Raw data) được hạ cánh an toàn xuống Data Lake/Warehouse mà không bị mất mát ngay cả khi nguồn thay đổi.

### Nhược điểm
* **Dữ liệu rác (Garbage Schema)**: Nếu hệ thống nguồn viết mã lỗi, liên tục sinh ra các cột log có tên động ngẫu nhiên (ví dụ `field_timestamp_123`), tính năng Auto Evolution sẽ tạo ra hàng nghìn cột trong DWH, phá hủy hoàn toàn kiến trúc lưu trữ.
* Cần các định dạng lưu trữ hiện đại (Delta Lake, Iceberg) hoặc các DWH đắt tiền (Snowflake) mới hỗ trợ Schema Evolution mượt mà.

---

## When to use

* Với các luồng Ingestion (EL) từ ứng dụng nội bộ hoặc SaaS (như Salesforce, Zendesk) vốn có khả năng thay đổi cấu trúc thường xuyên.
* Dữ liệu phi cấu trúc (JSON logs) đổ về Data Lake.

## When not to use

* Với các bảng Báo cáo cuối (Data Marts/Gold layer). Cấu trúc của Data Mart phải là một "Hợp đồng cứng" (Strict Contract) với người dùng kinh doanh. Bạn không được phép để cột "Doanh thu" tự nhiên bị xóa hay đổi kiểu mà không có quy trình quản lý thay đổi (Change Management).

---

## Related concepts

* [Data Observability](/concepts/data-observability)
* [Data Lakehouse (Delta Lake, Iceberg)](/concepts/data-lakehouse)
* [Data Quality](/concepts/data-quality)

---

## Interview questions

### 1. Schema Drift là gì và điều gì làm cho nó trở nên nguy hiểm đối với hệ thống Data Warehouse?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết về rủi ro của Data Pipelines.
* **Gợi ý trả lời**: Schema Drift là việc cấu trúc dữ liệu nguồn bị thay đổi mà team Data không được báo trước. Nó nguy hiểm vì 2 lý do: (1) Hard failure: Pipeline gặp lỗi (Crash) ngay lập tức khiến dữ liệu bị trễ (Downtime). (2) Silent failure: Nguy hiểm hơn, pipeline chạy qua (ví dụ cột mới bị bỏ qua hoàn toàn) dẫn đến thiếu sót thông tin quan trọng cho báo cáo mà không ai biết.

### 2. Sự khác biệt giữa Backward Compatibility và Forward Compatibility trong thiết kế Schema (Avro/Protobuf) là gì?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng quản trị hệ thống Event Streaming (như Kafka) và Schema Registry.
* **Gợi ý trả lời**: 
  * *Backward Compatibility (Tương thích ngược)*: Mã tiêu thụ (Consumer) được viết cho Schema *Mới* có thể đọc được dữ liệu ghi bằng Schema *Cũ*. (Ví dụ: Bạn thêm một cột Tùy chọn - Optional column vào schema).
  * *Forward Compatibility (Tương thích xuôi)*: Mã tiêu thụ (Consumer) được viết cho Schema *Cũ* có thể đọc được dữ liệu ghi bằng Schema *Mới*. (Ví dụ: Bạn xóa một cột Tùy chọn).
  Việc quản lý các tính tương thích này (thường qua Confluent Schema Registry) giúp chống lại Schema Drift một cách chủ động.

---

## References

1. **Databricks Documentation** - Delta Lake Schema Evolution and Enforcement.
2. **Fivetran Documentation** - Automatic Schema Migration.
3. **Data Engineering in Enterprise** - Chapter on Schema Registries & Data Contracts.

---

## English summary

Schema Drift occurs when the source data's structure (e.g., column names, data types, missing fields) changes unexpectedly, often breaking fragile ETL pipelines or causing silent data loss. It is a major problem driven by agile software development bypassing data teams. To manage schema drift, modern data engineering relies on two approaches: Data Observability for real-time monitoring and alerting of DDL changes, and Schema Evolution capabilities (native to tools like Fivetran or formats like Delta Lake) which automatically adapt the target data warehouse schema (e.g., adding new columns dynamically) to safely ingest the modified data without manual intervention or pipeline downtime.
