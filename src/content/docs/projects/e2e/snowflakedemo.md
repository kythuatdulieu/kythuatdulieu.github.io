---
title: "Snowflake Pipeline: Hệ thống Xử lý Dữ liệu Tài chính"
description: "Dự án mô phỏng luồng dữ liệu tài chính từ nhiều nguồn vào Snowflake, xử lý với Snowpipe, Snowflake Tasks theo mô hình event-driven."
difficulty: "Intermediate"
tags: ["snowflake", "snowpipe", "streams-tasks", "event-driven", "data-quality", "medallion", "e2e-project"]
readingTime: "15 mins"
lastUpdated: 2026-07-11
seoTitle: "Dự án Snowflake E2E: Snowpipe, Streams & Tasks, Data Metric Functions"
metaDescription: "Xây dựng pipeline dữ liệu tài chính event-driven trên Snowflake: Snowpipe + GCS Pub/Sub, queue pattern với Streams & Tasks, bảng H_/L_ và Data Metric Functions."
domains: ["DE"]
level: "Middle"
---



![System Architecture](/images/projects/e2e/snowflakedemo/ab627f48.png)

Dự án này mô phỏng một luồng dữ liệu (data pipeline) dành cho dữ liệu tài chính. Hệ thống bao gồm việc thu thập (crawling) dữ liệu từ nhiều nguồn khác nhau, lưu trữ vào Google Cloud Storage (GCP), và đưa vào Snowflake để xử lý và phân tích.

:::danger
**Disclaimer:** Nội dung assignment này được tìm hiểu và thực hiện trong thời gian ngắn nhằm mục đích demo các concept kiến trúc dữ liệu. Giải pháp hiện tại **chưa ở mức Production-ready**.
:::

---

## 1. Giới thiệu Nguồn Dữ liệu

Luồng dữ liệu thu thập từ 4 nguồn chính:

1. **Yahoo Finance - Hàng hóa (Commodities)**
2. **Yahoo Finance - Chỉ số thế giới (World Indices)**
3. **Yahoo Finance - Tiền tệ (Currencies)**
4. **Investing.com - Lịch Kinh tế (Economic Calendar)**

**Định dạng file & Tần suất:**
- **Tần suất:** Dữ liệu được thu thập mỗi 15 phút.
- **Quy tắc đặt tên:** Các file được thêm hậu tố là timestamp của thời điểm crawl.
- **Định dạng:** JSON và CSV.

---

## 2. Chi tiết Luồng Dữ liệu (Data Flow)

### 2.1. Lớp Ingestion (Bronze)

Quá trình thu thập dữ liệu (ingestion) hoạt động theo cơ chế hướng sự kiện (event-driven) để đảm bảo độ trễ thấp nhất cho dữ liệu thô.

1. **Tích hợp GCP:** Một Notification Integration (`GCS_PUBSUB_INT`) kết nối Snowflake với GCP Pub/Sub.
2. **Snowpipe:** Khi có file mới được đẩy vào GCS bucket, một thông báo sẽ tự động kích hoạt Snowpipe tương ứng.
3. **Bảng dữ liệu thô (Raw Tables):** Dữ liệu được tải ngay lập tức vào các bảng `RAW_*` (ví dụ: `RAW_YFH_COMMODITIES`).

**Định nghĩa hạ tầng ingestion (SQL thực tế):**

```sql
-- Kết nối Snowflake với GCS Pub/Sub
CREATE NOTIFICATION INTEGRATION GCS_PUBSUB_INT
  TYPE = QUEUE
  NOTIFICATION_PROVIDER = GCP_PUBSUB
  ENABLED = TRUE
  GCP_PUBSUB_SUBSCRIPTION_NAME = 'projects/fin-data/subscriptions/gcs-events';

-- Snowpipe auto-ingest: nạp file mới vào bảng RAW ngay khi có notification
CREATE PIPE PIPE_YFH_COMMODITIES
  AUTO_INGEST = TRUE
  INTEGRATION = GCS_PUBSUB_INT
AS
  COPY INTO RAW_YFH_COMMODITIES (payload, file_name, loaded_at)
  FROM (SELECT $1, METADATA$FILENAME, CURRENT_TIMESTAMP()
        FROM @STG_GCS_FINANCE/commodities/)
  FILE_FORMAT = (TYPE = 'JSON');
```

Chi phí đáng lưu ý: Snowpipe tính phí theo **file được nạp** (~0.06 credit/1000 file) cộng compute serverless. Với tần suất crawl 15 phút × 4 nguồn, chi phí không đáng kể; nhưng nếu crawler đổ hàng chục nghìn file nhỏ mỗi giờ, nên gom file trước khi upload — bài toán quen thuộc của [small files](/concepts/3-storage-engines-formats/compaction/) và [Data Ingestion](/concepts/2-data-ingestion-integration/data-ingestion/).

:::tip
**Tại sao lại dùng Snowpipe?** 
Sử dụng Snowpipe thay vì các tác vụ chạy theo lịch (scheduled task) vì muốn dữ liệu thô có mặt tại lớp Bronze ngay khi vừa được thu thập, không cần phải chờ đến khung giờ chạy batch.
:::

![Bronze Ingestion Flow](/images/projects/e2e/snowflakedemo/40957be5.png)

### 2.2. Chiến lược Điều phối (Orchestration)

Trong khi bước ingestion là event-driven, quá trình biến đổi dữ liệu (transformation) phía sau được quản lý bởi một chuỗi các Snowflake Tasks phức tạp.

**Mô hình "Hàng đợi" (Queue Pattern):** Thay vì xử lý ngay lập tức mọi file ở lớp Silver, chúng tôi triển khai hệ thống Hàng đợi (Queue) để kiểm soát luồng và đảm bảo tính nhất quán của dữ liệu.

1. **Kiểm toán & Đưa vào hàng đợi (Audit & Enqueue):**
   - Chạy định kỳ để phát hiện các dòng mới trong Raw streams, tính toán mã băm (hashes) và ghi log.
   - Đẩy các file mới vào bảng `FILE_QUEUE` với trạng thái 'PENDING'.
2. **Xử lý (Processing):**
   - Lấy một batch các file 'PENDING' và chuyển trạng thái thành 'RUNNING'.
3. **Hoàn thành (Completion):**
   - Chỉ chạy sau khi tất cả các task transformation đã hoàn tất, đánh dấu các file thành 'DONE'.

**Xương sống của cơ chế này là cặp Stream + Task của Snowflake:**

```sql
-- Stream = CDC nội bộ: chỉ trả về các dòng MỚI kể từ lần đọc trước
CREATE STREAM STR_RAW_COMMODITIES ON TABLE RAW_YFH_COMMODITIES;

-- Task chạy mỗi 5 phút, CHỈ tốn compute khi stream có dữ liệu mới
CREATE TASK TSK_AUDIT_ENQUEUE
  WAREHOUSE = WH_ETL_XS
  SCHEDULE = '5 MINUTE'
WHEN SYSTEM$STREAM_HAS_DATA('STR_RAW_COMMODITIES')
AS
  INSERT INTO FILE_QUEUE (file_name, row_hash, status, enqueued_at)
  SELECT file_name, HASH(payload), 'PENDING', CURRENT_TIMESTAMP()
  FROM STR_RAW_COMMODITIES;

-- Task con nối chuỗi bằng AFTER thay vì schedule riêng → không bao giờ chạy lệch pha
CREATE TASK TSK_PROCESS_BATCH
  WAREHOUSE = WH_ETL_XS
  AFTER TSK_AUDIT_ENQUEUE
AS CALL SP_PROCESS_PENDING_FILES();
```

Điểm "ăn tiền" của mẫu `WHEN SYSTEM$STREAM_HAS_DATA(...)`: khi không có file mới, task bị skip **miễn phí hoàn toàn** — không tốn credit warehouse. Đây là khác biệt chi phí lớn so với scheduled job luôn spin-up compute kiểu Airflow, và là lý do queue pattern này thân thiện [FinOps](/concepts/8-security-governance-finops/finops-data-engineering/).

Trạng thái `PENDING → RUNNING → DONE` trong `FILE_QUEUE` còn cho khả năng **replay có kiểm soát**: file lỗi chuyển sang `FAILED` và được xử lý lại ở batch sau mà không chặn các file khác — cùng triết lý với [Idempotency trong pipeline](/concepts/2-data-ingestion-integration/idempotency/).

![Orchestration Strategy](/images/projects/e2e/snowflakedemo/4e039b96.png)

### 2.3. Lớp Biến đổi (Silver)

Logic biến đổi được chia thành hai loại bảng cho mỗi thực thể:

#### Các View Chuẩn hóa (`VW_*_NORMALIZED`)
Các view này parse dữ liệu thô (JSON/CSV variant) thành các cột có cấu trúc.

![View Logic](/images/projects/e2e/snowflakedemo/e0c28ac1.png)

#### Bảng Lịch sử (`H_*` - History Tables)
- **Vai trò:** Lưu trữ toàn bộ lịch sử thay đổi. Mỗi bản ghi snapshot từ crawler đều được append vào đây (Insert-only).

![History Tables](/images/projects/e2e/snowflakedemo/d8bfd6a3.png)

#### Bảng Trạng thái Hiện tại (`L_*` - Last/Current Tables)
- **Vai trò:** Chỉ lưu trạng thái mới nhất của mỗi symbol/event.
- **Logic:** Sử dụng lệnh `MERGE`. Cập nhật các bản ghi đã tồn tại nếu mã hash thay đổi, hoặc thêm mới nếu chưa có.

```sql
MERGE INTO L_COMMODITIES t
USING VW_COMMODITIES_NORMALIZED s
  ON t.symbol = s.symbol
WHEN MATCHED AND t.row_hash != s.row_hash THEN
  UPDATE SET price = s.price, volume = s.volume,
             row_hash = s.row_hash, updated_at = s.crawled_at
WHEN NOT MATCHED THEN
  INSERT (symbol, price, volume, row_hash, updated_at)
  VALUES (s.symbol, s.price, s.volume, s.row_hash, s.crawled_at);
```

So sánh hash trước khi UPDATE giúp tránh ghi lại các dòng không đổi — giảm churn trên micro-partition của Snowflake (mỗi UPDATE thực chất là ghi lại partition bất biến, cùng nguyên lý với [SCD](/concepts/6-data-modeling-transformation/slowly-changing-dimension/)). Cặp bảng `H_*` (insert-only, đầy đủ lịch sử) + `L_*` (trạng thái cuối) chính là biến thể của mô hình **SCD Type 2 + Type 1** chạy song song.

![Current State Tables](/images/projects/e2e/snowflakedemo/4f776c46.png)

### 2.4. Chất lượng Dữ liệu (Data Quality - DQ)

Chất lượng dữ liệu được thực thi thông qua **Data Metric Functions (DMFs)** của Snowflake. Các DMFs này được lên lịch chạy trên các bảng Silver để liên tục theo dõi "sức khỏe" của dữ liệu.

- `COUNT_NULLS`: Kiểm tra các giá trị quan trọng bị thiếu.
- `COUNT_NEGATIVE_VALUES`: Đảm bảo giá trị giá cả hoặc khối lượng không bị âm.
- `COUNT_DUPLICATES`: Kiểm tra các vi phạm về tính duy nhất.

```sql
-- DMF tùy biến: đếm giá âm
CREATE DATA METRIC FUNCTION COUNT_NEGATIVE_VALUES(t TABLE(v NUMBER))
  RETURNS NUMBER
  AS 'SELECT COUNT(*) FROM t WHERE v < 0';

-- Gắn vào bảng Silver, chạy mỗi 30 phút
ALTER TABLE L_COMMODITIES
  SET DATA_METRIC_SCHEDULE = '30 MINUTE';
ALTER TABLE L_COMMODITIES
  ADD DATA METRIC FUNCTION COUNT_NEGATIVE_VALUES ON (price);
```

Kết quả đo được ghi vào event table `SNOWFLAKE.LOCAL.DATA_QUALITY_MONITORING_RESULTS`, từ đó có thể đặt alert khi vượt ngưỡng — một dạng [Data Observability](/concepts/7-dataops-orchestration-quality/data-observability/) native, khỏi cần dựng Great Expectations riêng. Xem thêm [Data Quality Dimensions](/concepts/7-dataops-orchestration-quality/data-quality-dimensions/).

![DQ Application](/images/projects/e2e/snowflakedemo/1c6f7e5c.png)

### 2.5. Khả năng Mở rộng & Linh hoạt (Scalability & Flexibility)

Hệ thống được thiết kế để dễ dàng scale tự động:
- **Tham số hóa (Parameterization):** Các giới hạn batch được lưu trữ trong bảng cấu hình, cho phép tinh chỉnh hiệu suất mà không cần thay đổi code.
- **Sự tách biệt (Decoupling):** Quá trình ingestion (Snowpipe) tách biệt hoàn toàn khỏi logic biến đổi (Tasks).

### 2.6. Lớp Gold: Demo Truy vấn & Insight

Lớp Gold chứa các bảng đã được denormalize (khử chuẩn) và aggregate (tổng hợp), tối ưu cho các công cụ BI và các truy vấn ad-hoc.

![Gold Layer Demo](/images/projects/e2e/snowflakedemo/78b20056.png)

---

## 3. Trade-offs & Hướng nâng cấp Production

| Quyết định hiện tại | Trade-off | Nâng cấp production |
|---|---|---|
| Snowpipe auto-ingest | Độ trễ thấp (~1 phút) nhưng phí theo file, khó kiểm soát burst | Gom file 5-15 phút/lần hoặc Snowpipe Streaming API |
| Queue pattern tự viết | Kiểm soát tốt, replay được; nhưng tự bảo trì state machine | Dynamic Tables (declarative) cho luồng đơn giản |
| Task SCHEDULE 5 phút | Đơn giản, gần như miễn phí khi idle | Task graph `AFTER` toàn chuỗi + alert khi task treo |
| DMF trên bảng Silver | Native, không thêm hạ tầng | Kết hợp [dbt testing](/concepts/7-dataops-orchestration-quality/dbt-testing/) khi chuyển transform sang dbt |

Ba rủi ro vận hành cần nhớ nếu đưa hệ thống này lên production: (1) **Stream staleness** — stream bị vô hiệu nếu không được đọc trong vòng `MAX_DATA_EXTENSION_TIME_IN_DAYS` (mặc định 14 ngày), pipeline dừng dài ngày là mất CDC; (2) **Warehouse auto-suspend** nên đặt 60s cho `WH_ETL_XS` để tránh trả tiền idle; (3) crawler bên ngoài là điểm mù về [freshness](/concepts/7-dataops-orchestration-quality/freshness-monitoring/) — cần alert khi quá 2 chu kỳ (30 phút) không có file mới, vì Snowpipe không thể báo về thứ nó chưa từng nhận được.

> Tham khảo chi tiết tại GitHub Repository: [snowflakedemo](https://github.com/kythuatdulieu/snowflakedemo)

## Nguồn Tham Khảo

- [Snowpipe: Automating continuous data loading](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-intro) - Snowflake Documentation.
- [Introduction to Streams](https://docs.snowflake.com/en/user-guide/streams-intro) - Snowflake Documentation.
- [Introduction to Tasks](https://docs.snowflake.com/en/user-guide/tasks-intro) - Snowflake Documentation.
- [Data Metric Functions (DMF)](https://docs.snowflake.com/en/user-guide/data-quality-intro) - Snowflake Documentation.
- [Automating Snowpipe for Google Cloud Storage](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-gcs) - Snowflake Documentation.
