---
title: "Lambda Architecture"
difficulty: "Advanced"
tags: ["architecture", "streaming", "batch", "lambda", "big-data"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Lambda Architecture - Kiến trúc xử lý luồng và lô kết hợp"
metaDescription: "Tìm hiểu kiến trúc Lambda (Lambda Architecture) trong Data Engineering, cơ chế hoạt động giữa Batch layer, Speed layer, và Serving layer, cùng các câu hỏi phỏng vấn."
description: "Trong thế giới Big Data, các kỹ sư dữ liệu từng phải đối mặt với một sự đánh đổi nghiệt ngã: chọn độ trễ thấp hay chọn độ chính xác tuyệt đối. Lambda Architecture ra đời để giải quyết cả hai bài toán đó."
---



Trong thế giới Data Engineering và Big Data, kiến trúc **Lambda (Lambda Architecture)** là một mẫu thiết kế xử lý dữ liệu cực kỳ kinh điển, được Nathan Marz giới thiệu. Nó ra đời để giải quyết một bài toán nan giải: làm sao để hệ thống vừa có khả năng xử lý một lượng lớn dữ liệu lịch sử một cách chính xác (batch processing), vừa cung cấp cái nhìn thời gian thực (real-time/stream processing) với độ trễ tối thiểu.

Kiến trúc Lambda phân tách luồng xử lý dữ liệu làm 2 nhánh chạy song song: **Nhánh Batch (Batch Layer)** chậm nhưng đảm bảo tính chính xác tuyệt đối và **Nhánh Speed (Speed Layer)** nhanh, độ trễ thấp nhưng có thể gặp sai số (ví dụ: duplicate data). Kết quả của hai nhánh này cuối cùng được hợp nhất tại **Tầng Serving (Serving Layer)** để cung cấp một view hoàn chỉnh cho người dùng.

---

## 1. Cấu trúc của Lambda Architecture



Kiến trúc Lambda bao gồm 3 tầng chính, mỗi tầng đảm nhiệm một vai trò riêng biệt.

### 1.1. Batch Layer (Tầng Lô)
Tầng này quản lý tập dữ liệu gốc (Master Dataset) - dữ liệu nguyên bản, immutable (không thay đổi) và chỉ nối thêm (append-only). 
- **Chức năng:** Thực hiện các tính toán nặng (heavy computations) trên toàn bộ tập dữ liệu (hoặc các batch lớn) để tạo ra các Batch Views.
- **Đặc điểm:** Chạy chậm (từ vài chục phút đến vài giờ) nhưng độ chính xác là 100%. Nếu có lỗi xảy ra, chỉ cần chạy lại batch process.
- **Công nghệ thường dùng:** Apache Hadoop (HDFS, MapReduce), Apache Spark, Amazon S3, Google Cloud Storage, Snowflake, BigQuery.

### 1.2. Speed Layer (Tầng Tốc độ / Tầng Real-time)
Tầng này bù đắp cho độ trễ của Batch Layer. Batch Layer có thể mất vài giờ để chạy, trong khoảng thời gian đó, dữ liệu mới liên tục sinh ra. Speed Layer chỉ xử lý lượng dữ liệu mới này.
- **Chức năng:** Xử lý dữ liệu ngay khi nó vừa được sinh ra (stream processing) để cập nhật Real-time Views. Khi Batch Layer hoàn thành việc tính toán cho một khoảng thời gian nhất định, dữ liệu đó trong Speed Layer có thể bị xóa đi để tiết kiệm tài nguyên.
- **Đặc điểm:** Xử lý luồng nhanh, độ trễ cực thấp (miliseconds - seconds), nhưng có thể bị duplicate hoặc sai sót nhỏ do tính chất "nhanh và vội" của luồng dữ liệu (ví dụ thiếu vắng cơ chế Exactly-once phức tạp).
- **Công nghệ thường dùng:** Apache Kafka, Apache Flink, Apache Storm, Spark Streaming, ksqlDB.

### 1.3. Serving Layer (Tầng Cung cấp dịch vụ)
Đây là nơi tổng hợp dữ liệu từ cả Batch Layer và Speed Layer.
- **Chức năng:** Hợp nhất (merge) Batch Views và Real-time Views để khi ứng dụng phía trên truy vấn, nó sẽ nhận được dữ liệu đầy đủ bao gồm cả quá khứ (từ batch) và hiện tại (từ stream).
- **Đặc điểm:** Dữ liệu ở đây thường là read-only và được đánh index mạnh mẽ để tăng tốc độ truy vấn.
- **Công nghệ thường dùng:** Apache Cassandra, HBase, Elasticsearch, Apache Druid, MongoDB.

---

## 2. Luồng hoạt động (Data Flow)

Để dễ hình dung, hãy tưởng tượng luồng dữ liệu theo kịch bản đếm số lượt view của một website:

1. **Sinh dữ liệu:** Sự kiện người dùng xem trang web được gửi vào hệ thống tin nhắn (ví dụ: Apache Kafka).
2. **Dispatching:** Dữ liệu từ Kafka được sao chép và đưa đồng thời vào cả hai luồng: Batch và Speed.
3. **Tại Batch Layer:** Dữ liệu thô được lưu trữ lại trên S3 (Data Lake). Mỗi đêm lúc 0h, một job Apache Spark (Batch) sẽ chạy, quét qua toàn bộ lịch sử (hoặc phân vùng của ngày hôm đó) và đếm tổng số views, ghi kết quả tính toán vào Serving Layer. Quá trình này mất khoảng 1 tiếng.
4. **Tại Speed Layer:** Trong khoảng từ 0h đến khi job batch chạy xong lúc 1h, các luồng view mới không nằm trong Batch View. Apache Flink sẽ trực tiếp đọc từ Kafka, cộng dồn số lượt view này (Real-time View) và ghi vào Serving Layer liên tục mỗi giây.
5. **Tại Serving Layer:** Khi User/Dashboard truy vấn tổng số view, Serving Layer sẽ query Batch View (từ lúc bắt đầu đến 0h) cộng với query Real-time View (từ 0h đến hiện tại) và trả ra con số cuối cùng (Total Views). Sau khi job batch ngày hôm sau chạy xong, các Real-time View đã quá hạn sẽ bị drop/reset để bắt đầu chu kỳ mới.

---

## 3. Code Example (Minh hoạ đơn giản bằng Apache Spark)

Dưới đây là một giả mã (pseudo-code) mô phỏng cách hệ thống ghi kết quả từ Batch Layer và Speed Layer.

### Batch Layer (Spark Batch)
Chạy mỗi ngày một lần để tạo Batch View ổn định.

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import count

spark = SparkSession.builder.appName("Lambda_Batch_Layer").getOrCreate()

# Đọc toàn bộ dữ liệu (Master Dataset) tính đến ngày hôm qua
df_master = spark.read.parquet("s3a://datalake/page_views/date=2026-06-15/")

# Tạo Batch View: Tổng số lượng view theo page_id
batch_view = df_master.groupBy("page_id").agg(count("*").alias("batch_view_count"))

# Ghi vào Serving Layer (Ví dụ: Cassandra)
batch_view.write \
    .format("org.apache.spark.sql.cassandra") \
    .options(table="batch_page_views", keyspace="serving_db") \
    .mode("overwrite") \
    .save()
```

### Speed Layer (Spark Structured Streaming)
Chạy liên tục để update Real-time View.

```python
# Đọc streaming trực tiếp từ Kafka
stream_df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "page_view_events") \
    .load()

# Parse JSON và đếm sự kiện trong một cửa sổ thời gian gần nhất
from pyspark.sql.functions import from_json, col
schema = "page_id STRING, user_id STRING, timestamp TIMESTAMP"

parsed_stream = stream_df.select(from_json(col("value").cast("string"), schema).alias("data")).select("data.*")

realtime_view = parsed_stream \
    .groupBy("page_id") \
    .count() \
    .withColumnRenamed("count", "realtime_view_count")

# Cập nhật liên tục vào Serving Layer
query = realtime_view.writeStream \
    .outputMode("update") \
    .format("org.apache.spark.sql.cassandra") \
    .option("checkpointLocation", "/tmp/checkpoints") \
    .options(table="realtime_page_views", keyspace="serving_db") \
    .start()
    
query.awaitTermination()
```

### Serving Layer Query (Truy vấn để gộp kết quả)
Khi Dashboard lấy kết quả, ứng dụng backend sẽ thực hiện phép cộng giữa bảng batch và bảng realtime:

```sql
-- Dữ liệu lịch sử chuẩn xác
SELECT page_id, batch_view_count FROM batch_page_views WHERE page_id = 'home';

-- Dữ liệu realtime bù đắp
SELECT page_id, realtime_view_count FROM realtime_page_views WHERE page_id = 'home';

-- -> Total = batch_view_count + realtime_view_count
```

---

## 4. Ưu và nhược điểm của Lambda Architecture

### Ưu điểm:
- **Khả năng chịu lỗi (Fault Tolerance):** Master dataset lưu trữ tại Batch Layer là bất biến (immutable). Nếu bạn có viết sai code tại Speed Layer hoặc code bị hỏng, bạn chỉ cần sửa bug, xóa bảng lỗi và chạy lại logic trên dữ liệu gốc.
- **Cân bằng giữa tốc độ và độ chính xác:** Giải quyết cực tốt bài toán "tôi cần báo cáo ngay bây giờ" (nhờ Speed layer) nhưng "kết quả phải cực kỳ chính xác khi đối soát tài chính" (nhờ Batch layer).
- **Phân tách trách nhiệm:** Dễ dàng bảo trì riêng biệt hai hệ thống luồng và lô.

### Nhược điểm:
- **Độ phức tạp cực cao (Operational Complexity):** Bạn phải duy trì hai codebase song song (một cho Batch, một cho Speed). Mặc dù chúng thực hiện cùng một logic nghiệp vụ, nhưng lại dùng framework khác nhau (ví dụ: MapReduce cho batch và Storm cho stream). Điều này gây ra khó khăn trong bảo trì, testing và đồng bộ hóa.
- **Tốn tài nguyên:** Hệ thống yêu cầu tài nguyên lưu trữ và tính toán gấp đôi cho cùng một dữ liệu. Dữ liệu phải được dispatch vào 2 hạ tầng khác nhau.
- **Sự trễ nhịp (Synchronization overhead):** Xử lý gộp kết quả tại Serving Layer đòi hỏi sự thiết kế cẩn thận để tránh tính toán trùng lặp (duplicate counts) trong thời gian giao thoa giữa batch và stream.

---

## 5. Lambda Architecture vs. Kappa Architecture

Sự phức tạp của Lambda (việc phải quản lý 2 codebase) đã mở đường cho một kiến trúc hiện đại hơn là **Kappa Architecture**, được giới thiệu bởi Jay Kreps (một trong tác giả của Kafka).

| Tiêu chí | Lambda Architecture | Kappa Architecture |
| :--- | :--- | :--- |
| **Cấu trúc** | Batch Layer + Speed Layer song song. | Chỉ có duy nhất một Stream Layer. |
| **Bản chất xử lý** | Batch và Streaming là 2 hệ thống độc lập. | Coi Batch là một dạng đặc biệt của Streaming (bounded stream). |
| **Độ phức tạp mã nguồn** | Cao (Cần duy trì 2 codebase cho batch và stream). | Thấp (Một codebase duy nhất cho cả xử lý stream và tính toán lại lịch sử). |
| **Hệ thống lưu trữ trung tâm** | HDFS / S3 (Data Lake). | Kafka (Log vĩnh viễn với thời gian lưu trữ dài - infinite retention). |
| **Phù hợp cho** | Khi cần chạy các model ML nặng nề, tính toán toàn bộ đồ thị mạng, nơi xử lý batch truyền thống hiệu quả hơn rất nhiều. | Các hệ thống Event-driven thuần túy, có thể cài đặt hệ thống xử lý luồng cực mạnh như Apache Flink. |

Hiện nay, với sự trưởng thành của **Apache Flink** và **Spark Structured Streaming** (hỗ trợ API thống nhất cho cả Batch và Stream - Unified API), kiến trúc Lambda truyền thống đang dần nhường chỗ cho Kappa hoặc các biến thể kết hợp (như Delta Lake / Lakehouse architectures - nơi cung cấp stream processing ngay trên Data Lake).

---

## 6. Câu hỏi phỏng vấn phổ biến

1. **Kiến trúc Lambda sinh ra để giải quyết vấn đề gì?**
   *Gợi ý:* Giải quyết sự đánh đổi giữa độ trễ (latency) và độ chính xác (accuracy). Cung cấp khả năng chịu lỗi (fault tolerance) chống lại lỗi do con người (human faults) nhờ immutable master dataset.

2. **Tại sao lại cần phải có cả Batch Layer và Speed Layer? Làm một luồng Streaming thôi không được sao?**
   *Gợi ý:* Làm một luồng Stream duy nhất chính là kiến trúc Kappa. Tuy nhiên thời kỳ đầu của Big Data, các công cụ streaming chưa hỗ trợ Exactly-once semantics tốt và rất khó xử lý stateful window lớn, nên Batch layer vẫn là "chân ái" cho độ chính xác tuyệt đối và tính toán lớn. Lambda vẫn dùng batch làm 'nguồn sự thật' cuối cùng.

3. **Làm thế nào để xử lý sự cố (reprocessing) trong kiến trúc Lambda khi phát hiện ra lỗi logic ở Speed Layer?**
   *Gợi ý:* Vì Speed Layer có thể sinh dữ liệu không chuẩn, bạn chỉ cần cập nhật lại code đúng, xóa các view bị lỗi từ Speed Layer, dữ liệu cũ sẽ tự động bị đè bởi kết quả chính xác 100% từ Batch Layer vào lần chạy tiếp theo.

4. **Làm sao ứng dụng đầu cuối biết lấy dữ liệu từ đâu trong Serving Layer?**
   *Gợi ý:* Serving Layer có nhiệm vụ đóng gói logic query. Ứng dụng client chỉ việc gọi API, hệ thống database backend tại Serving Layer sẽ query đồng thời từ bảng `batch_view` và bảng `realtime_view`, sau đó thực hiện merge (ví dụ: SUM kết quả của 2 bảng) trước khi trả về.

---

## 7. Tài Liệu Tham Khảo
* [Designing Data-Intensive Applications - Martin Kleppmann (Part 2: Distributed Data)](https://dataintensive.net/)
* [Big Data: Principles and best practices of scalable realtime data systems - Nathan Marz (Cha đẻ Lambda Architecture)](https://www.manning.com/books/big-data)
* [CAP Theorem and PACELC - Daniel Abadi](http://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html)
* **Questioning the Lambda Architecture - Jay Kreps**
