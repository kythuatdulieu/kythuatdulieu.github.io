---
title: "Troubleshooting: Chữa Data Skew bằng kỹ thuật Salting"
description: "Hướng dẫn chi tiết về Data Skew trong Apache Spark, cách nhận biết, và các kỹ thuật xử lý từ thủ công (Salting) đến tự động (AQE)."
---



Data Skew (Dữ liệu bị lệch) là "kẻ thù số 1" của các kỹ sư Big Data khi làm việc với hệ thống phân tán như Apache Spark. Hiện tượng này xảy ra khi dữ liệu phân bổ không đồng đều trên các vách ngăn (partitions). Hệ quả là phần lớn các tasks hoàn thành rất nhanh, nhưng một vài tasks cuối cùng lại mất lượng thời gian khổng lồ (thậm chí gây lỗi OutOfMemory), khiến toàn bộ Job bị nghẽn (vấn đề Straggler).

Bài viết này sẽ đi sâu vào bản chất của Data Skew, cách nhận biết thông qua Spark UI, kỹ thuật kinh điển Salting (Rắc muối) bằng code thực tế, và sự tiến hóa với Adaptive Query Execution (AQE).

## 1. Bản Chất Và Nguyên Nhân Gây Data Skew



### 1.1 Cơ chế Shuffle và Data Skew
Trong Spark, dữ liệu được chia nhỏ thành các Partition. Các phép toán Transformation được chia làm hai loại:
- **Narrow Transformation** (`map`, `filter`): Dữ liệu được xử lý độc lập trên từng partition.
- **Wide Transformation** (`groupBy`, `join`, `window`, `distinct`): Yêu cầu dữ liệu có cùng key phải nằm trên cùng một partition. Quá trình di chuyển dữ liệu giữa các node/executor để đạt được điều này gọi là **Shuffle**.

Data Skew thường xảy ra ở giai đoạn Shuffle. Spark sử dụng thuật toán Hash Partitioning theo mặc định: `hash(key) % num_partitions`. Nếu một hoặc vài key có số lượng bản ghi áp đảo (như giá trị Null, khoảng trắng, hoặc một danh mục phổ biến), lượng lớn dữ liệu sẽ đổ về một partition duy nhất.

### 1.2 Ví dụ thực tế
Giả sử bạn đang `JOIN` bảng `Fact_Orders` (10 tỷ dòng) với bảng `Dim_Customers` (1 triệu dòng) dựa trên `CountryCode`. 
Nếu 90% khách hàng của công ty đến từ `US` và chỉ 10% rải rác ở các nước khác. Toàn bộ 9 tỷ dòng có `CountryCode = 'US'` sẽ bị đẩy (hashing) vào CÙNG MỘT Executor.
- Executor này phải tải và xử lý 9 tỷ dòng, dẫn đến cạn kiệt CPU, RAM (có thể gây `java.lang.OutOfMemoryError`).
- Các Executor khác chỉ xử lý phần dữ liệu nhỏ còn lại, hoàn thành nhanh chóng và rơi vào trạng thái rảnh rỗi (idle), gây lãng phí tài nguyên.

## 2. Dấu Hiệu Nhận Biết Data Skew

Để xác định một Spark Job có bị Data Skew hay không, bạn cần quan sát thông qua **Spark UI**:
1. **Thời gian chạy Task không đồng đều (Straggler Tasks)**:
   - Trong tab *Stages*, hãy xem thống kê (Summary Metrics) của các tasks.
   - Nếu *Max* Duration lớn hơn rất nhiều (gấp hàng chục lần) so với *Median* (75th percentile) Duration, đó là dấu hiệu rõ ràng. Ví dụ: 199 tasks mất 5 giây, nhưng 1 task mất 2 tiếng.
2. **Shuffle Read Size / Records lệch lạc**:
   - Nếu một task có khối lượng *Shuffle Read Size* hoặc *Records* lớn bất thường so với các task khác (ví dụ: task A đọc 10GB, các task khác đọc 50MB).
3. **Lỗi Out Of Memory (OOM) / Spill to Disk**:
   - Executor bị quá tải thường sẽ chết do OOM hoặc cố gắng ghi dữ liệu tạm ra đĩa (Spill - bao gồm Memory Spill và Disk Spill). Hiện tượng Spill làm tốc độ đọc ghi IO chậm đi đáng kể.

## 3. Kỹ Thuật Salting (Rắc Muối) Kinh Điển

Trước phiên bản Spark 3.0, khi hệ thống chưa có khả năng tự động tối ưu hóa, **Salting** (Thêm khóa ngẫu nhiên) là "liều thuốc đặc trị" cho Data Skew.

### Ý Tưởng Cốt Lõi
- Đập vỡ cái "cục" dữ liệu khổng lồ chứa key bị Skew thành N cục nhỏ hơn (bằng cách thêm một số ngẫu nhiên từ 1 đến N vào key).
- Nhân bản bảng còn lại lên N lần để đảm bảo phép `JOIN` vẫn ra kết quả chính xác, vì dữ liệu đã bị đổi key ở bảng kia.

### Triển khai Salting với PySpark

Dưới đây là mô phỏng quá trình xử lý Skew cho phép JOIN:

```python
from pyspark.sql.functions import col, rand, lit, explode, sequence
from pyspark.sql.types import IntegerType

# Bảng lớn (Fact) bị skew ở key "US"
fact_df = ... 
# Bảng nhỏ (Dim)
dim_df = ...

# --- BƯỚC 1: XÁC ĐỊNH MỨC ĐỘ SALT (N) ---
# Chọn N sao cho partition lớn bị chia nhỏ vừa đủ với RAM của executor
SALT_BINS = 10 

# --- BƯỚC 2: RẮC MUỐI (SALTING) BẢNG LỚN ---
# Thêm một cột ngẫu nhiên (từ 0 đến 9) vào fact_df
# Tạo cột key mới kết hợp giữa key gốc và giá trị salt
salted_fact_df = fact_df.withColumn(
    "salt", (rand() * SALT_BINS).cast(IntegerType())
).withColumn(
    "salted_join_key", col("CountryCode") + "_" + col("salt").cast("string")
)

# --- BƯỚC 3: NHÂN BẢN (REPLICATE) BẢNG NHỎ ---
# Tạo một array chứa các số từ 0 đến SALT_BINS - 1
# Dùng explode để nhân bản mỗi dòng thành SALT_BINS dòng
replicated_dim_df = dim_df.withColumn(
    "salt_array", sequence(lit(0), lit(SALT_BINS - 1))
).withColumn(
    "salt", explode(col("salt_array"))
).withColumn(
    "salted_join_key", col("CountryCode") + "_" + col("salt").cast("string")
)

# --- BƯỚC 4: THỰC HIỆN JOIN TRÊN KEY MỚI ---
# Giờ đây 9 tỷ dòng 'US' đã biến thành 'US_0', 'US_1'... 'US_9'
# Chúng sẽ được phân tán đều qua 10 executors khác nhau
result_df = salted_fact_df.join(
    replicated_dim_df,
    "salted_join_key",
    "inner"
).drop("salt", "salted_join_key", "salt_array")
```

**Lưu ý khi dùng Salting:**
- **Ưu điểm:** Giải quyết triệt để vấn đề Skew, phân tán đều lượng công việc.
- **Nhược điểm:** Phải nhân bản dữ liệu bảng nhỏ lên N lần, làm tăng tổng lượng dữ liệu xử lý. Việc chọn số `SALT_BINS` đòi hỏi tuning bằng tay.

## 4. Các Phương Pháp Khác Trị Data Skew

Bên cạnh Salting, tùy vào tình huống ta có thể dùng các chiến lược sau:

### 4.1. Broadcast Hash Join (BHJ)
Nếu một trong hai bảng tham gia JOIN đủ nhỏ để nạp vào RAM của một Executor (mặc định `< 10MB`, có thể tăng bằng cấu hình `spark.sql.autoBroadcastJoinThreshold`), hãy dùng Broadcast Join.
Khi dùng BHJ, Spark không cần thực hiện Shuffle. Bảng nhỏ sẽ được copy toàn bộ xuống mọi Executor, do đó loại bỏ hoàn toàn vấn đề Data Skew.
```python
from pyspark.sql.functions import broadcast
result_df = fact_df.join(broadcast(dim_df), "CountryCode")
```

### 4.2. Lọc bỏ Null hoặc dữ liệu không hợp lệ
Đôi khi dữ liệu bị Skew đơn giản là do chứa quá nhiều giá trị `NULL`, chuỗi rỗng `""`, hoặc dữ liệu rác không cần thiết (ví dụ `user_id = -1` của khách vãng lai).
Hãy `filter` các giá trị này ra khỏi luồng xử lý chính, hoặc tách chúng thành một tập dữ liệu riêng, xử lý riêng rẽ sau đó `union` lại.

### 4.3. Isolate Skewed Keys (Xử lý riêng rẽ Key bị Skew)
Thay vì nhân bản toàn bộ bảng nhỏ như trong Salting, bạn có thể tối ưu hơn:
1. Tách Dataset lớn thành hai tập: một tập chỉ chứa các Key bị lệch (Skewed), một tập chứa các Key bình thường.
2. Dùng Broadcast Join cho tập Skewed (vì số lượng Key lệch thường ít, nếu filter bảng nhỏ theo các key này thì dữ liệu thường rất bé).
3. Dùng Sort Merge Join thông thường cho tập Normal.
4. `Union` hai kết quả lại.

## 5. Thời Đại Của Adaptive Query Execution (AQE)

Từ Apache Spark 3.0, tính năng **Adaptive Query Execution (AQE)** đã tạo ra một cuộc cách mạng trong việc tuning Spark Jobs. Bạn không cần phải viết code "Salting" thủ công mệt mỏi và phức tạp nữa.

AQE thu thập các thông số thống kê trong quá trình chạy (runtime statistics) sau mỗi giai đoạn Shuffle, từ đó tự động điều chỉnh Kế hoạch Thực thi (Execution Plan) cho các Stage tiếp theo.

### Tự động xử lý Skew Join (AQE Skew Join Optimization)
Khi AQE phát hiện một partition lớn bất thường (dựa trên kích thước hoặc số lượng bản ghi so với mức trung bình của các partitions khác), nó sẽ tự động chia nhỏ (split) partition khổng lồ đó thành nhiều sub-partitions. Đồng thời, ở bảng còn lại, nó cũng sẽ copy partition tương ứng thành nhiều bản để khớp với các sub-partitions vừa được tạo. Quá trình này về cơ bản là tự động hóa thao tác Salting.

**Các thông số cấu hình quan trọng của AQE Skew Join:**

```properties
# Bật tính năng AQE (Mặc định True từ Spark 3.2+)
spark.sql.adaptive.enabled = true

# Bật tính năng tự động tối ưu hóa Skew Join
spark.sql.adaptive.skewJoin.enabled = true

# Một partition được coi là Skew nếu kích thước của nó lớn hơn N lần kích thước trung bình (Mặc định 5)
spark.sql.adaptive.skewJoin.skewedPartitionFactor = 5

# Và kích thước tối thiểu để bị coi là Skew phải vượt qua ngưỡng này (Mặc định 256MB)
spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes = 256m
```
Với AQE, quá trình tối ưu hóa diễn ra hoàn toàn trong suốt (transparent) và không yêu cầu thay đổi logic nghiệp vụ của source code.

## 6. Tổng Kết

Data Skew là hiện tượng không thể tránh khỏi trong môi trường Big Data do bản chất tự nhiên của luồng thông tin (ví dụ: hiệu ứng Pareto, quy luật 80/20).

* Nếu bạn dùng Spark phiên bản cũ (trước 3.0) hoặc thực hiện các phép `GROUP BY` phức tạp: **Salting** vẫn là vũ khí sắc bén.
* Nếu bảng nhỏ đủ điều kiện kích thước: Luôn ưu tiên dùng **Broadcast Join**.
* Luôn cập nhật Spark version mới và khai thác **AQE** để hệ thống tối ưu hiệu năng một cách tự động và thông minh.

## Tài Liệu Tham Khảo
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* **Presto: SQL on Everything - Facebook Engineering**
* [The Art of Spark Performance Tuning](https://spark.apache.org/docs/latest/sql-performance-tuning.html)
