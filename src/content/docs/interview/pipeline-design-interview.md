---
title: "Thiết kế Data Pipeline (Phỏng vấn) - Pipeline Design Interview"
category: "Interview Preparation"
difficulty: "Advanced"
tags: ["data-pipeline", "etl", "elt", "interview", "system-design", "fault-tolerance"]
readingTime: "16 mins"
lastUpdated: 2026-06-07
seoTitle: "Pipeline Design Interview - Thiết kế Data Pipeline hệ thống dữ liệu"
metaDescription: "Hướng dẫn thiết kế kiến trúc Data Pipeline (ETL/ELT) trong phỏng vấn Data Engineering: Khả năng mở rộng, tính lũy đẳng (Idempotency) và Data Quality."
---

# Thiết kế Data Pipeline (Phỏng vấn) - Pipeline Design Interview

## Summary

**Pipeline Design Interview** là một vòng thi thiết kế hệ thống đặc thù cho vai trò Data Engineer. Trọng tâm của vòng này là khả năng thiết kế một luồng luân chuyển dữ liệu (Data Pipeline) bền bỉ (robust) từ các nguồn dữ liệu đa dạng (API, Database, Event Streams) vào kho lưu trữ trung tâm (Data Lake/Data Warehouse), đồng thời đảm bảo được các tiêu chuẩn khắt khe về chất lượng dữ liệu (Data Quality), tính lũy đẳng (Idempotency), và khả năng tự phục hồi khi có lỗi (Fault-Tolerance).

---

## Definition

Thiết kế Data Pipeline không chỉ là vẽ mũi tên nối các công cụ với nhau (như "Airbyte -> S3 -> Spark -> Snowflake"). Nó là quá trình định nghĩa toàn bộ vòng đời của dữ liệu: Cách trích xuất (Extraction method), Tần suất làm mới (Batch vs Streaming), Kiến trúc biến đổi (ETL vs ELT), Cách xử lý dữ liệu bị trễ (Late arriving data), Cơ chế cảnh báo lỗi (Alerting), và Chiến lược xử lý khi điền lại dữ liệu quá khứ (Backfilling).

---

## Why it exists

Thực tế production rất tàn khốc: API nguồn thay đổi cấu trúc không báo trước, cụm Spark bị hết bộ nhớ giữa chừng, luồng mạng bị đứt, hoặc dữ liệu rác làm hỏng toàn bộ báo cáo doanh thu. Nhà tuyển dụng dùng vòng phỏng vấn này để đánh giá xem hệ thống bạn thiết kế có dễ bị gãy đổ hay không, và nếu đổ thì tốn bao nhiêu công sức của con người để sửa chữa hệ thống và chạy lại luồng dữ liệu một cách an toàn.

---

## Core idea

Một Data Pipeline đạt tiêu chuẩn Senior/Staff Engineer phải tuân thủ các nguyên lý sau:
* **Idempotency (Tính Lũy Đẳng)**: Một pipeline khi chạy 1 lần hay 100 lần với cùng một tham số đầu vào (ví dụ: cùng khoảng thời gian chạy ngày hôm qua) thì kết quả cuối cùng trong Data Warehouse vẫn phải hoàn toàn giống nhau, không bị nhân đôi dữ liệu.
* **Separation of Compute and Storage**: Tách biệt tài nguyên tính toán và lưu trữ để có thể mở rộng độc lập và giảm chi phí.
* **Data Quality Gates (Chốt chặn chất lượng)**: Kiểm tra dữ liệu bất thường (Anomalies) hoặc định dạng sai lệch ở ngay đầu vào và giữa các tầng lưu trữ, ngăn không cho "rác" chảy vào báo cáo cuối (Garbage in, Garbage out).
* **Idempotent Backfilling**: Khả năng dễ dàng nạp lại dữ liệu của một khoảng thời gian trong quá khứ do lỗi nghiệp vụ mà không làm ảnh hưởng tới các ngày khác.

---

## How it works

Khung xương trả lời một câu hỏi Thiết kế Pipeline gồm 5 giai đoạn:
1. **Scope the System (Phạm vi hệ thống)**: Số lượng dữ liệu (GB, TB, PB mỗi ngày)? Định dạng đầu vào (JSON, CSV, CDC Logs)? Tần suất xử lý (Real-time, Hourly, Daily)?
2. **High-Level Design (Kiến trúc tổng thể)**: Lựa chọn mô hình ETL hay ELT. Lựa chọn công nghệ lưu trữ (Object Storage, Cloud DWH).
3. **Data Ingestion (Thu nhận dữ liệu)**: Thiết kế Pull (Batch kéo dữ liệu) hay Push (Nguồn đẩy dữ liệu). Cách xử lý Increment load (Chỉ tải dữ liệu mới dựa trên watermark hoặc CDC).
4. **Data Transformation & Storage (Biến đổi & Lưu trữ)**: Tổ chức Data Lake/Warehouse theo kiến trúc Medallion (Bronze/Raw -> Silver/Cleaned -> Gold/Aggregated).
5. **Orchestration & Observability (Điều phối & Quan sát)**: Cách thức lên lịch (Airflow, Dagster), theo dõi lỗi, Data Lineage và xử lý Retry.

---

## Architecture / Flow

Kiến trúc ELT Pipeline điển hình áp dụng Medallion Architecture:

```mermaid
graph LR
    subgraph "Data Sources"
        A["PostgreSQL OLTP"]
        B["Third-party API"]
    end

    subgraph "Data Ingestion"
        C["Airbyte / Fivetran"]
    end

    subgraph "Cloud Data Warehouse"
        D["(Bronze: Raw Data)"]
        E["(Silver: Clean & Join)"]
        F["(Gold: Data Marts)"]
        D -. "dbt (Transform)" .-> E
        E -. "dbt (Transform)" .-> F
    end

    subgraph "Orchestration & Monitoring"
        G["Apache Airflow"]
        H["Great Expectations / dbt tests"]
    end

    A -->|"CDC"| C
    B -->|"REST / Batch"| C
    C -->|"Load (EL)"| D
    G -. "Trigger Ingestion" .-> C
    G -. "Trigger Transform" .-> D
    H -. "Data Quality Check" .-> E
```

---

## Practical example

**Tình huống phỏng vấn**: Thiết kế Data Pipeline thu thập thông tin Giao dịch ngân hàng để phục vụ báo cáo đối soát (Reconciliation) hàng ngày. Nguồn dữ liệu là cụm Oracle Database cũ kỹ.

**Phân tích & Thiết kế**:
* **Ingestion**: Do Oracle cũ có thể không chịu nổi truy vấn quét khối lượng lớn, ta không dùng Full Load hàng ngày. Thiết lập cơ chế CDC (Change Data Capture) dùng Debezium đọc Transaction Log của Oracle, đẩy sự kiện INSERT/UPDATE/DELETE vào Kafka.
* **Storage (EL)**: Viết một consumer đẩy dữ liệu từ Kafka xuống Amazon S3 (Bronze Layer) theo định dạng Parquet, partition theo ngày xảy ra giao dịch `year/month/day/`.
* **Transformation (T)**: Dùng Spark (hoặc dbt trên Snowflake) đọc dữ liệu từ Bronze. Xóa các bản ghi bị trùng do Kafka (At-least-once), áp dụng schema cố định. Lưu kết quả làm sạch vào Silver Layer.
* **Orchestration**: Airflow chạy lịch mỗi 00:30 sáng, kích hoạt job Spark tổng hợp dữ liệu Silver thành Gold Layer (Báo cáo Đối soát).
* **Data Quality**: Thêm bước Data Quality test giữa Silver và Gold: Tổng số tiền giao dịch phải trùng khớp với checksum từ hệ thống nguồn, nếu sai số vượt 0.01% sẽ gửi alert qua Slack và dừng quy trình báo cáo.

---

## Best practices

* **Partitioning**: Luôn phân vùng dữ liệu trên Data Lake bằng một cột thời gian logic (thời gian dữ liệu sinh ra - `event_time`) hoặc thời gian vật lý (thời gian ghi vào kho - `processing_time`) để các câu truy vấn sau này chỉ quét đúng thư mục cần thiết, giảm chi phí I/O cực lớn.
* **Write-Audit-Publish (WAP)**: Mẫu thiết kế trong đó dữ liệu biến đổi xong sẽ được ghi vào một bảng tạm (Write), kiểm tra chất lượng tự động (Audit), nếu mọi thứ XANH thì mới tráo đổi con trỏ metadata sang bảng chính để người dùng đọc (Publish).
* **ELT over ETL**: Sử dụng ELT (Extract, Load, Transform) kết hợp với các Cloud DWH (Snowflake, BigQuery) và dbt thay cho quy trình ETL truyền thống (Transform bằng code Python/Scala bên ngoài rồi mới Load). ELT tận dụng sức mạnh tính toán khổng lồ của DWH và cho phép Data Analysts viết biến đổi bằng SQL chuẩn.

---

## Common mistakes

* **Quên xử lý Late Arriving Data**: Thiết kế pipeline đóng băng số liệu của ngày hôm qua lúc 00:00, nhưng thực tế các giao dịch tạo ra lúc 23:59 ngày hôm qua có thể đến hệ thống vào lúc 00:05 ngày hôm nay do độ trễ mạng. Việc không có cơ chế update / merge dữ liệu trễ sẽ làm sai lệch báo cáo.
* **Sử dụng UPDATE/DELETE trên Data Lake**: Data Lake (S3, GCS) là kho lưu trữ file tĩnh (Object Storage). Việc cố gắng cập nhật một bản ghi sẽ phải viết lại toàn bộ file. Hãy sử dụng kiến trúc Data Lakehouse (Apache Iceberg, Delta Lake, Hudi) để hỗ trợ ACID Transactions.
* **Tạo Hard Dependency quá sâu**: Thiết kế một DAG trong Airflow có quá nhiều tác vụ nối tiếp nhau (Task A -> B -> C -> ... -> Z). Nếu tác vụ Y lỗi, việc retry toàn bộ chain là ác mộng.

---

## Trade-offs

### Batch vs Streaming
* Pipeline Batch dễ quản lý, dễ debug, đảm bảo lũy đẳng dễ dàng (chỉ cần xóa dữ liệu partition của ngày đó và chạy lại), rẻ tiền. Nhược điểm: độ trễ dữ liệu cao (24h).
* Pipeline Streaming (Kafka + Flink) độ trễ tính bằng giây. Nhược điểm: Chi phí duy trì server liên tục rất cao, code phức tạp (xử lý window, watermarks, out-of-order data).

---

## When to use

* Bài tập này luôn xuất hiện trong các buổi phỏng vấn Data Engineer từ mọi cấp độ. Kỹ năng này tương đương với vòng System Design của Software Engineer.

---

## Related concepts

* [Medallion Architecture](/concepts/medallion-architecture)
* Change Data Capture (CDC)
* [Idempotency trong Data Engineering](/concepts/idempotency)
* ETL vs ELT

---

## Interview questions

### 1. Làm thế nào để thiết kế một Pipeline lũy đẳng (Idempotent)?
* **Gợi ý trả lời**: Để thiết kế tính lũy đẳng, ta thiết kế quy trình ghi dữ liệu theo dạng **"Delete-then-Insert" (hoặc Overwrite/Merge)** thay vì "Append-only". Ví dụ: Job chạy cho ngày `2026-06-07`. Tác vụ đầu tiên là xóa toàn bộ dữ liệu trong thư mục partition hoặc chạy câu lệnh `DELETE FROM table WHERE date = '2026-06-07'`. Sau đó mới thực hiện `INSERT` dữ liệu mới. Bằng cách này, dù job có bị lỗi chạy lại 10 lần, dữ liệu ngày 07/06 vẫn không bị nhân lên gấp 10. Với Data Lakehouse, có thể dùng phép `MERGE INTO` (Upsert) dựa trên Primary Key.

### 2. Sự khác biệt giữa Event Time và Processing Time là gì? Tại sao nó quan trọng?
* **Gợi ý trả lời**: `Event Time` là thời điểm sự kiện thực sự diễn ra ở phía thiết bị người dùng (ví dụ user click vào lúc 10:00). `Processing Time` là thời điểm hệ thống Pipeline của chúng ta nhận được và xử lý sự kiện đó (có thể là 11:00 do máy người dùng mất mạng và đồng bộ muộn). Điều này cực kỳ quan trọng khi tổng hợp dữ liệu (Aggregation): Nếu tính toán doanh thu ngày dựa vào Processing Time, báo cáo sẽ bị sai lệch khi hệ thống có độ trễ hoặc bị gián đoạn. Trong Data Pipeline chuyên nghiệp, dữ liệu báo cáo kinh doanh luôn phải được gán mốc thời gian theo Event Time.

### 3. Bạn sẽ xử lý Full Load và Incremental Load như thế nào đối với một hệ thống Database khổng lồ?
* **Gợi ý trả lời**: Không bao giờ chạy Full Load (SELECT *) hàng ngày trên DB khổng lồ vì sẽ gây nghẽn cổ chai I/O hệ thống vận hành. 
  * Cách tiếp cận là áp dụng mô hình **CDC (Change Data Capture)**. Quét database một lần duy nhất (Historical Snapshot) ở thời điểm t0 để tạo base layer.
  * Sau đó, bắt các luồng sự kiện thay đổi (Insert/Update/Delete) từ Transaction Log (binlog/WAL) bằng công cụ như Debezium.
  * Trong Data Warehouse, định kỳ áp dụng các sự kiện thay đổi này (Incremental Load) lên Base Layer bằng thao tác `MERGE INTO` để cấu trúc lại trạng thái mới nhất của các bảng.

---

## References

1. **Fundamentals of Data Engineering** - Joe Reis, Matt Housley (Chương 6: Architecture & Pipeline Design).
2. **Data Pipelines Pocket Reference** - James Densmore.
3. **Netflix TechBlog** - Data Lineage và Data Quality Architecture.

---

## English summary

The Pipeline Design Interview evaluates a candidate's capability to build scalable, resilient, and accurate data movement systems. It focuses heavily on crucial principles such as Idempotency (ensuring multiple pipeline runs produce the exact same outcome without data duplication), decoupling storage and compute, handling late-arriving data, and implementing data quality checks (Data Contracts/WAP pattern). Candidates should be prepared to discuss the trade-offs between Batch and Streaming architectures, justify the shift from ETL to ELT (e.g., using Medallion Architecture with dbt and cloud warehouses), and design robust data ingestion strategies using Change Data Capture (CDC) over repetitive full database loads.
