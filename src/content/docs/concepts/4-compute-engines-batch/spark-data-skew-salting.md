---
title: "Troubleshooting: Chữa Data Skew bằng kỹ thuật Salting"
description: "Hướng dẫn chi tiết về Data Skew trong Apache Spark, cách nhận biết, và các kỹ thuật xử lý từ thủ công (Salting) đến tự động (AQE)."
---

Data Skew (Dữ liệu bị lệch) là "kẻ thù số 1" của mọi kỹ sư Data Engineer khi vận hành các hệ thống phân tán. Nó phá vỡ nguyên lý Data Parallelism (xử lý song song dữ liệu) của Apache Spark, biến một cụm Cluster sở hữu hàng nghìn Cores trở nên vô dụng khi toàn bộ tải trọng bị dồn vào một luồng tính toán duy nhất.

Bài viết này mổ xẻ cơ chế vật lý dẫn đến Data Skew, các hậu quả (OOMKilled, Spill-to-disk), kỹ thuật xử lý thủ công (Salting) bằng mã nguồn, và sự can thiệp kiến trúc tự động từ Adaptive Query Execution (AQE).

## 1. Bản chất Vật lý của Data Skew

Spark phân bổ khối lượng công việc bằng cách "cắt" dữ liệu thành các Partitions. Ở các Stage có Wide Dependency (như `JOIN`, `GROUP BY`), Spark sử dụng thuật toán Hash Partitioning (mặc định) để gom dữ liệu:
`Partition_ID = hash(Join_Key) % num_partitions`

Sự cố bùng nổ khi phân phối dữ liệu trong thực tế hiếm khi đồng đều (Quy luật 80/20 hoặc hiệu ứng Pareto). Ví dụ: Một hệ thống e-commerce toàn cầu lưu log giao dịch, trong đó khóa `country_code = 'US'` chiếm tới 90% lượng bản ghi, trong khi hàng trăm quốc gia khác chỉ chiếm 10%.

Khi thực hiện lệnh `JOIN` dựa trên `country_code`, thuật toán Hash sẽ đẩy toàn bộ 90% khối lượng dữ liệu khổng lồ kia (có thể lên tới hàng chục GB) vào MỘT Task duy nhất thuộc MỘT Executor duy nhất.

## 2. Rủi ro Vận hành và Dấu hiệu (Operational Risks)

Hậu quả của Data Skew trên tầng vận hành vật lý (Infrastructure) là cực kỳ tàn khốc:

1. **Hiệu ứng Task Straggler**: Trong Spark UI, bạn sẽ thấy 199 Tasks hoàn thành trong vài giây, nhưng Task số 200 (chứa key 'US') lại chạy miệt mài hàng giờ đồng hồ. Vì các Stage bị Blocking lẫn nhau, toàn bộ Cluster sẽ phải "đóng băng" chờ Task này xong. Tổn thất chi phí (FinOps) cực lớn do lãng phí Compute.
2. **JVM OOMKilled**: Nếu Partition khổng lồ kia vượt quá dung lượng Heap Space của Executor, JVM sẽ văng lỗi `java.lang.OutOfMemoryError` và bị Container Manager (YARN/K8s) tiêu diệt.
3. **Disk Spill (I/O Bound)**: Nếu cấu hình bộ nhớ off-heap dồi dào, Spark sẽ cố gắng không văng lỗi OOM mà thay vào đó đẩy dữ liệu dư thừa xuống đĩa (Spill-to-disk). Đĩa cứng xoay vật lý (hoặc kể cả EBS/SSD mạng) có băng thông cực kỳ thấp so với RAM. Tốc độ thực thi sẽ giảm xuống hàng trăm lần, dẫn tới hiện tượng Job bị "Treo" vĩnh viễn (Infinite hanging).

## 3. Kỹ thuật Salting (Rắc muối) Kinh Điển

Để phá vỡ thế độc quyền của một Partition khổng lồ, giới kỹ sư sử dụng kỹ thuật **Salting**. 

Ý tưởng kiến trúc: 
- Thêm một hậu tố ngẫu nhiên (Salt) vào khóa (Key) của bảng lớn (Fact Table) để "chặt" cục dữ liệu đó ra thành N mảnh (Partitions) nhỏ hơn.
- Nhân bản (Replicate) các dòng của bảng nhỏ (Dimension Table) lên N lần để đảm bảo thao tác JOIN vẫn khớp hoàn toàn với các Key đã rắc muối bên Fact Table.

### Code Thực chiến (PySpark)

```python
from pyspark.sql.functions import col, rand, lit, explode, sequence
from pyspark.sql.types import IntegerType

# Bảng giao dịch 10 Tỷ dòng (Skewed ở key 'US')
fact_df = spark.table("bronze.fact_orders")
# Bảng danh mục 1 Triệu dòng
dim_df = spark.table("bronze.dim_country")

# BƯỚC 1: Chọn N (Salt Bins). Tùy thuộc cấu hình RAM, N càng lớn chia càng nhỏ.
SALT_BINS = 10 

# BƯỚC 2: Rắc muối (Salting) Fact Table.
# Key 'US' sẽ bị biến thành ngẫu nhiên: 'US_0', 'US_1', ..., 'US_9'
salted_fact_df = fact_df.withColumn(
    "salt", (rand() * SALT_BINS).cast(IntegerType())
).withColumn(
    "salted_join_key", col("country_code") + lit("_") + col("salt").cast("string")
)

# BƯỚC 3: Nhân bản Dimension Table. (Trade-off: Data Amplification)
# 1 dòng 'US' giờ thành 10 dòng: 'US_0', 'US_1', ..., 'US_9'
replicated_dim_df = dim_df.withColumn(
    "salt_array", sequence(lit(0), lit(SALT_BINS - 1))
).withColumn(
    "salt", explode(col("salt_array"))
).withColumn(
    "salted_join_key", col("country_code") + lit("_") + col("salt").cast("string")
)

# BƯỚC 4: Thực thi JOIN trên Key đã Salt
# Lúc này 9 tỷ bản ghi 'US' đã được chia đều cho 10 Tasks khác nhau (qua 10 keys)
result_df = salted_fact_df.join(
    replicated_dim_df,
    "salted_join_key",
    "inner"
).drop("salt", "salted_join_key", "salt_array")
```

**Trade-offs của Salting**: 
- **Lợi ích**: Triệt tiêu Task Straggler, giải quyết OOMKilled, giữ Throughput cao.
- **Đánh đổi**: Bảng Dimension bị phình to N lần (Data Amplification). Việc chọn hệ số `SALT_BINS` yêu cầu Tuning thủ công (Manual tuning) rất vất vả; nếu chọn N quá lớn sẽ gây tốn RAM vô ích cho bảng nhỏ.

## 4. Kỷ nguyên Tự động: Adaptive Query Execution (AQE)

Từ Apache Spark 3.0, tính năng AQE ra mắt, đưa kỹ thuật Salting thủ công vào dĩ vãng. AQE can thiệp sâu vào Kế hoạch thực thi (Execution Plan) ở **thời gian chạy (Runtime)** thay vì tĩnh (Compile-time) như Catalyst truyền thống.

![AQE Skew Join](/images/4-compute-engines-batch/aqe-skew-join.png)
*Hình 1: Cơ chế tách Partition động (Split) của AQE để tự động hóa Salting (Nguồn: Databricks Blog)*

### AQE xử lý Skew Join như thế nào?
1. Spark chạy xong Stage phía trước (Map Stage) và thu thập **Runtime Statistics** (số liệu chính xác về kích thước của từng partition trước khi Shuffle Read).
2. Nếu AQE nhận diện một Partition có kích thước lớn bất thường (vượt xa mức Median của toàn bộ các phân vùng), nó đánh dấu đó là một Skewed Partition.
3. Spark tự động áp dụng logic Salting ở tầng vật lý: Chẻ đôi (hoặc chẻ nhiều mảnh) Skewed Partition của bảng A thành các Sub-partitions, đồng thời tự động nhân bản (duplicate) Partition tương ứng ở bảng B.

### Cấu hình FinOps với AQE

```bash
# Cấu hình chuẩn cho Spark Submit / Terraform (Spark 3.x)
# Bật tính năng AQE (Mặc định True từ Spark 3.2+)
--conf spark.sql.adaptive.enabled=true
--conf spark.sql.adaptive.skewJoin.enabled=true

# Fine-tuning: Một partition được gọi là "Skew" nếu nó to gấp 5 lần kích thước trung bình 
--conf spark.sql.adaptive.skewJoin.skewedPartitionFactor=5

# Ngưỡng (Threshold): Kích thước nhỏ nhất để bị soi xét là Skew (để bỏ qua các data noise nhỏ)
--conf spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes=256m
```
Với AQE, toàn bộ mã PySpark của bạn trở về dạng `df1.join(df2, "country_code")` nguyên thủy nhất. Business Logic (nghiệp vụ) được tách bạch hoàn toàn khỏi Physical Optimization (tối ưu vật lý), giảm thiểu nợ kỹ thuật (Technical Debt) cho hệ thống.

## 5. Nguồn Tham Khảo
- [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
- [How to tune Apache Spark jobs - AWS Big Data Blog](https://aws.amazon.com/blogs/big-data/best-practices-for-successfully-managing-memory-for-apache-spark-applications-on-amazon-emr/)
- Thiết kế Hệ thống Dữ liệu Chuyên sâu (Designing Data-Intensive Applications - Martin Kleppmann)
- [Optimizing Spark SQL Joins - Databricks Architecture](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
