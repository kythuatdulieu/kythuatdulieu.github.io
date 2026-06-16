---
title: "Loại bỏ trùng lặp - Deduplication"
difficulty: "Beginner"
tags: ["deduplication", "data-quality", "etl", "sql"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Khử trùng lặp dữ liệu (Deduplication) là gì? Các kỹ thuật trong Data Engineering"
metaDescription: "Tìm hiểu deduplication (khử trùng lặp) là gì, tại sao lại quan trọng và các kỹ thuật thực tiễn dùng SQL, Window Functions để xử lý trùng lặp trong pipeline."
description: "Deduplication (khử trùng lặp) là kỹ thuật loại bỏ các bản ghi nhân đôi trong hệ thống, đảm bảo tính chính xác của dữ liệu. Khám phá các chiến lược từ SQL Window Functions đến Streaming và Data Lake."
---



## Khái Niệm Deduplication (Khử Trùng Lặp) Là Gì?

Deduplication (Khử trùng lặp) là quá trình xác định và loại bỏ các bản sao dư thừa của dữ liệu trong một hệ thống hoặc một tập dữ liệu, đảm bảo rằng mỗi thực thể (như một sự kiện, người dùng, giao dịch) chỉ được đại diện bằng một bản ghi duy nhất.

Hãy tưởng tượng bạn đang chạy một chiến dịch gửi mã giảm giá tri ân khách hàng thân thiết. Do một lỗi kỹ thuật nào đó, thông tin của khách hàng tên Bob bị đưa vào hệ thống hai lần. Hậu quả là Bob nhận được hai mã giảm giá, gây thất thoát doanh thu cho công ty và có thể làm sai lệch báo cáo hiệu quả chiến dịch. Deduplication sinh ra để giải quyết chính xác những vấn đề như vậy.

Trong kỹ thuật dữ liệu (Data Engineering), đặc biệt là với dữ liệu lớn (Big Data) và các hệ thống phân tán, vấn đề trùng lặp xảy ra vô cùng phổ biến và là một trong những nhiệm vụ dọn dẹp dữ liệu (Data Cleansing) cốt lõi nhất nhằm duy trì Data Quality (Chất lượng dữ liệu).

## Tại Sao Dữ Liệu Lại Bị Trùng Lặp?

Trong các hệ thống phân tán và kiến trúc dữ liệu hiện đại, trùng lặp không phải là một "tai nạn" hiếm gặp, mà thường là kết quả tất yếu của các cơ chế đảm bảo hệ thống vận hành trơn tru:

1. **At-Least-Once Delivery (Giao hàng ít nhất một lần):** Các message broker như Apache Kafka hay RabbitMQ thường được dùng ở chế độ "At-Least-Once" để không bao giờ đánh mất dữ liệu. Nếu một consumer xử lý xong một message nhưng gặp sự cố mạng trước khi kịp xác nhận (acknowledge) lại với broker, broker sẽ tưởng message chưa được xử lý và tiến hành gửi lại, dẫn đến ghi trùng lặp dữ liệu vào đích đến.
2. **Cơ Chế Retry (Thử lại):** Khi gọi API để lấy dữ liệu (ví dụ từ một third-party service) và gặp timeout, hệ thống sẽ tự động gọi lại (retry). Nếu API thực tế đã xử lý thành công ở lần đầu nhưng trả về response quá chậm, lần gọi thứ hai có thể sẽ tạo ra một tập dữ liệu trùng lặp.
3. **Lỗi Ứng Dụng (Application Bugs):** Đôi khi, lỗi từ phía client frontend (ví dụ: người dùng nhấn nút "Thanh toán" hai lần liên tiếp do UI không bị vô hiệu hóa kịp thời) sẽ sinh ra các sự kiện giống hệt nhau được gửi về hệ thống backend.
4. **Tích Hợp Từ Nhiều Nguồn Hệ Thống:** Khi gộp dữ liệu từ nhiều hệ thống (như CRM, ERP và Web Analytics) về cùng một Data Warehouse, cùng một thực thể (ví dụ: một khách hàng) có thể tồn tại ở cả nhiều hệ thống với các dị bản thông tin nhỏ, sinh ra nhiều dòng biểu diễn cho một người duy nhất.
5. **Backfill và Chạy Lại Pipeline:** Khi có lỗi logic xử lý dữ liệu ở quá khứ, các Data Engineer thường phải chạy lại (backfill) pipeline ETL/ELT. Nếu pipeline không được thiết kế cẩn thận theo chuẩn "idempotent" (không thay đổi trạng thái hệ thống dù chạy 1 hay nhiều lần), việc chạy lại sẽ đơn thuần chèn thêm (append) dữ liệu thay vì ghi đè (overwrite), dẫn tới nhân đôi toàn bộ dữ liệu của ngày đó.

## Phân Loại Trùng Lặp

Trùng lặp thường được chia làm hai loại chính, đòi hỏi cách xử lý hoàn toàn khác nhau:

1. **Trùng Lặp Chính Xác (Exact Duplicates):** Toàn bộ các trường (cột) dữ liệu của hai hoặc nhiều bản ghi giống hệt nhau 100%. Loại này thường dễ nhận diện và xử lý bằng các thao tác nhóm (Group By) hoặc chọn lọc các phần tử khác biệt (Distinct).
2. **Trùng Lặp Kèm Cập Nhật (Partial Duplicates / Late Arriving Updates):** Các bản ghi có cùng khóa chính (Primary Key / Entity ID) nhưng khác nhau ở thời gian cập nhật hoặc trạng thái dữ liệu. 
   - *Ví dụ:* Bản ghi thứ nhất: `Order ID: 101, Status: PENDING, Updated: 10:00`.
   - Bản ghi thứ hai đến sau: `Order ID: 101, Status: SUCCESS, Updated: 10:05`. 
   Trong trường hợp này, bạn thường muốn **chỉ giữ lại bản ghi có trạng thái hoặc thời gian mới nhất** và loại bỏ bản ghi lịch sử cũ đi trong bảng snapshot.

## Hậu Quả Của Dữ Liệu Trùng Lặp

* **Sai Lệch Phân Tích & Báo Cáo:** Trùng lặp làm tăng giả tạo các chỉ số quan trọng như doanh thu, lượt truy cập, hay số lượng người dùng đang hoạt động (DAU/MAU). Điều này dẫn đến những quyết định kinh doanh hoàn toàn sai lầm.
* **Tăng Chi Phí Lưu Trữ và Xử Lý:** Lưu trữ dữ liệu dư thừa làm lãng phí dung lượng ổ cứng. Quan trọng hơn, nó khiến các truy vấn phân tích (Queries) chậm hơn và tốn nhiều compute (CPU/RAM) hơn. Ở các hệ thống Data Warehouse tính phí theo lượng dữ liệu quét (như BigQuery, Snowflake), điều này tương đương với việc "đốt tiền" vô ích.
* **Trải Nghiệm Khách Hàng Kém:** Trong các ứng dụng vận hành (Operational Systems), dữ liệu trùng có thể dẫn tới việc gửi email quảng cáo nhiều lần cho một người, xuất hóa đơn kép, hiển thị thông báo lặp đi lặp lại khiến người dùng khó chịu và phàn nàn.

## Các Kỹ Thuật Khử Trùng Lặp Trong Data Engineering

### 1. Sử Dụng SQL Window Functions (Phổ Biến Nhất Cho Batch Processing)

Trong Data Warehouse (như Google BigQuery, Snowflake, Amazon Redshift), kỹ thuật tiêu chuẩn vàng để xử lý loại "Trùng lặp kèm cập nhật" là dùng hàm cửa sổ `ROW_NUMBER()`. 

**Nguyên lý:** Phân nhóm dữ liệu theo khóa chính, sắp xếp từng nhóm theo thời gian (hoặc một trường tăng dần như version) giảm dần, và chỉ lấy ra dòng đầu tiên (số 1) của mỗi nhóm.

```sql
WITH DeduplicatedData AS (
  SELECT 
    order_id,
    customer_id,
    total_amount,
    status,
    updated_at,
    -- Đánh số thứ tự cho từng bản ghi trong cùng 1 order_id
    ROW_NUMBER() OVER (
      PARTITION BY order_id          -- Nhóm các bản ghi có cùng khóa order_id
      ORDER BY updated_at DESC       -- Ưu tiên bản ghi có thời gian cập nhật mới nhất lên đầu
    ) as row_num
  FROM raw_orders
)
SELECT 
  order_id,
  customer_id,
  total_amount,
  status,
  updated_at
FROM DeduplicatedData
WHERE row_num = 1;                   -- Chỉ lấy bản ghi mới nhất (được đánh số 1)
```

### 2. Sử Dụng `DISTINCT` hoặc `GROUP BY`

Cách này chỉ phù hợp với "Trùng lặp chính xác" (Exact Duplicates) khi mọi trường đều giống nhau, hoặc khi bạn chỉ cần lấy ra danh sách các giá trị duy nhất.

```sql
-- Dùng DISTINCT để lấy danh sách loại sự kiện duy nhất của user trong ngày
SELECT DISTINCT user_id, event_type, event_date 
FROM user_events;

-- Dùng GROUP BY (tương đương DISTINCT trong trường hợp này, 
-- nhưng thường dùng nếu muốn kèm theo hàm Aggregation như COUNT/SUM)
SELECT user_id, event_type, event_date 
FROM user_events
GROUP BY user_id, event_type, event_date;
```

### 3. Kỹ Thuật "Upsert" / Merge (Dành Cho Data Lake/Lakehouse)

Trong kiến trúc Data Lakehouse hiện đại sử dụng các định dạng bảng mở như Delta Lake, Apache Iceberg, hoặc Apache Hudi, bạn có thể thực hiện Deduplication ngay tại thời điểm ghi dữ liệu bằng câu lệnh `MERGE INTO` (Upsert: Update or Insert).

Hệ thống sẽ kiểm tra xem bản ghi đã tồn tại chưa: nếu có thì tiến hành cập nhật với dữ liệu mới, nếu chưa thì chèn mới.

```sql
-- Ví dụ với Delta Lake
MERGE INTO target_orders AS t
USING source_new_orders AS s
ON t.order_id = s.order_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN 
  -- Đã tồn tại order_id và sự kiện mới có thời gian muộn hơn, ta sẽ cập nhật
  UPDATE SET 
    t.status = s.status, 
    t.updated_at = s.updated_at,
    t.total_amount = s.total_amount
WHEN NOT MATCHED THEN 
  -- Chưa tồn tại thì chèn mới hoàn toàn
  INSERT (order_id, customer_id, total_amount, status, updated_at)
  VALUES (s.order_id, s.customer_id, s.total_amount, s.status, s.updated_at);
```

### 4. Deduplication Trong Streaming (Xử Lý Dữ Liệu Dòng Chảy)

Đối với dữ liệu Streaming (bằng Apache Flink, Spark Structured Streaming), việc loại bỏ trùng lặp phức tạp hơn nhiều so với Batch vì dòng dữ liệu là vô tận. Hệ thống cần phải "nhớ" các sự kiện đã đi qua để đối chiếu, bằng cách sử dụng **State Store** (Lưu trữ trạng thái).

Tuy nhiên, bạn không thể nhớ trạng thái mãi mãi vì bộ nhớ RAM/Disk của cluster rồi sẽ cạn kiệt. Kỹ thuật ở đây là kết hợp Deduplication với **Watermarks** (Mốc thời gian trễ cho phép) và **TTL (Time-To-Live)** để hệ thống có thể tự động xóa bỏ trạng thái của các sự kiện quá cũ mà hệ thống tự tin là sẽ không bị gửi trùng lặp lại nữa.

*Ví dụ dùng Spark Structured Streaming:*
```python
# Xác định khóa deduplication là 'event_id'
# spark sẽ giữ trạng thái của event_id trong vòng 1 giờ tính từ event_timestamp
# Bất kỳ event_id trùng lặp nào đến trong khoảng thời gian này sẽ bị vứt bỏ.
deduped_df = streaming_df \
    .withWatermark("event_timestamp", "1 hour") \
    .dropDuplicates(["event_id", "event_timestamp"])
```

### 5. Ràng Buộc Khóa Chính (Primary Key Constraints)

Trong các cơ sở dữ liệu quan hệ (RDBMS) OLTP truyền thống như PostgreSQL hay MySQL, bạn có thể thiết lập cấu trúc Primary Key hoặc Unique Index ở cấp độ bảng để ngăn chặn không cho dữ liệu trùng lặp được lưu vào ngay từ đầu (Database sẽ từ chối và quăng lỗi `Duplicate entry` hoặc `Violation of PRIMARY KEY constraint`). 

**Lưu ý quan trọng:** Trong môi trường Data Warehouse phân tán quy mô lớn (như BigQuery, Snowflake), tính năng kiểm tra khóa này thường **không được hỗ trợ (Not Enforced)** hoặc chỉ mang tính chất khai báo thông tin tham khảo (Informational). Lý do là vì chi phí tính toán để kiểm tra ràng buộc duy nhất trên từng row insert đối với lượng dữ liệu hàng Terabyte/Petabyte là cực kỳ đắt đỏ và làm nghẽn cổ chai (bottleneck) toàn bộ quá trình tải dữ liệu. Bạn thường phải tự xử lý trùng lặp bằng logic ETL.

## Nên Khử Trùng Lặp Ở Đâu Trong Data Pipeline?

Một câu hỏi thường gặp khi thiết kế kiến trúc là: *Ta nên lọc trùng ở giai đoạn nào?*

1. **Tại Nguồn / Ingestion Layer (Lớp trích xuất):** Hạn chế dữ liệu rác đi vào hệ thống bằng cách dùng Upsert, kiểm tra Unique Key, và thiết kế các API Idempotent từ phía Backend. Phù hợp nhất với các kiến trúc streaming event driven hoặc micro-batch ingestion.
2. **Tại Lớp Chuyển Đổi (Transformation / Staging Layer):** Đây là nơi phổ biến nhất. Các data engineer thường lưu trữ toàn bộ dữ liệu thô (kể cả bản sao) ở lớp Raw/Bronze (giữ nguyên "sự thật thô" - raw truth để dễ debug), sau đó sử dụng công cụ như dbt hoặc Spark kết hợp `ROW_NUMBER()` để làm sạch và loại trùng lặp trước khi đẩy vào lớp Silver/Data Mart.
3. **Tại Lớp Phục Vụ (Serving / BI Layer):** Đôi khi bạn chọn cách lờ đi vấn đề trùng lặp ở Data Warehouse và chỉ làm deduplication trực tiếp trong view hoặc bằng các hàm SQL trực tiếp trên Dashboard (Ví dụ: dùng hàm `COUNT(DISTINCT user_id)` trong Tableau/PowerBI). Việc này linh hoạt và xử lý tức thời, nhưng đặc biệt dễ gây quá tải hệ thống xử lý truy vấn và phản hồi báo cáo rất chậm nếu tập dữ liệu khổng lồ.

## Best Practices & Lưu Ý Quan Trọng

* **Thiết Kế Idempotent Pipeline:** Nguyên lý quan trọng bậc nhất. Hãy đảm bảo ETL pipeline của bạn có thể được chạy lại (retry/backfill) vô số lần với cùng một khoảng tham số thời gian mà không bao giờ sinh ra nhiều bản sao dữ liệu. Ví dụ thay vì lệnh `INSERT INTO` (cứ chạy là chèn thêm), hãy luôn chủ động `DELETE` dữ liệu của phân vùng (partition) mục tiêu của ngày đó trước khi insert lại, hoặc sử dụng cơ chế `INSERT OVERWRITE PARTITION`.
* **Cẩn Thận Với Chi Phí Tính Toán:** Các hàm `ROW_NUMBER()`, `DISTINCT`, hoặc `GROUP BY` trong các hệ thống phân tán yêu cầu hoạt động **Shuffle** (đảo trộn và sắp xếp dữ liệu qua lại giữa các máy chủ mạng) khổng lồ. Đây là các thao tác chậm và tốn kém tài nguyên nhất. Hãy nhớ luôn kết hợp với Table Partitioning và Clustering để giới hạn khối lượng dữ liệu lịch sử bị quét (ví dụ chỉ deduplicate dữ liệu trong vòng 7 ngày gần nhất thay vì quét lại toàn bộ lịch sử 10 năm).
* **Lưu Giữ Vết (Audit Trail):** Đôi khi bạn không nên xóa (drop) hoàn toàn các bản ghi trùng lặp một cách thầm lặng. Sẽ có lúc bạn muốn "lọc" các bản ghi lỗi, nhân đôi này vào một bảng "bãi rác" riêng (Dead Letter Queue, Quarantine table, Error Log) để thiết lập cảnh báo, phục vụ việc đối soát, và giúp đội ngũ Backend điều tra sửa dứt điểm lỗi tận gốc (root cause) ở hệ thống nguồn.

## Tài Liệu Tham Khảo

* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
