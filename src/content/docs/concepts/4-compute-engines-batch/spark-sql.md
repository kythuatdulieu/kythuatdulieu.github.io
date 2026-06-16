---
title: "Spark SQL"
difficulty: "Intermediate"
tags: ["spark-sql", "apache-spark", "catalyst-optimizer", "dataframe"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Spark SQL là gì? Catalyst Optimizer và DataFrame trong Apache Spark"
metaDescription: "Giới thiệu Spark SQL, thành phần cốt lõi của Apache Spark dùng để xử lý dữ liệu cấu trúc bằng SQL và DataFrame API. Tìm hiểu cơ chế Catalyst Optimizer."
description: "Khi làm việc với các hệ thống dữ liệu lớn, việc phải viết các đoạn mã lập trình phân tán phức tạp để biến đổi dữ liệu luôn là một trở ngại lớn đối với các Data Engineer và Data Analyst. Spark SQL ra đời như một giải pháp toàn diện giúp xử lý dữ liệu cấu trúc và bán cấu trúc trên quy mô lớn."
---



Khi làm việc với các hệ thống dữ liệu lớn, việc phải viết các đoạn mã lập trình phân tán phức tạp để biến đổi dữ liệu luôn là một trở ngại lớn đối với các Data Engineer và Data Analyst. Spark SQL ra đời như một giải pháp toàn diện giúp xử lý dữ liệu có cấu trúc (Structured Data) và bán cấu trúc trên quy mô lớn, kết hợp sức mạnh của engine phân tán Spark với sự quen thuộc của ngôn ngữ truy vấn SQL.

Spark SQL là một module cốt lõi của Apache Spark. Nó không chỉ cung cấp một giao diện dễ dùng mà còn thường chạy nhanh hơn nhiều so với việc sử dụng RDD (Resilient Distributed Dataset) thuần túy. Bí quyết cho hiệu suất này nằm ở hai thành phần: **Catalyst Optimizer** và **Tungsten Engine**.

---

## 1. Spark SQL là gì?



Spark SQL đóng vai trò là một "cầu nối" giữa Spark engine và người sử dụng. Nó cho phép người dùng thao tác dữ liệu qua hai cách chính:
1. **Truy vấn bằng SQL chuẩn**: Thực thi trực tiếp các câu lệnh SQL trên dữ liệu.
2. **DataFrame / Dataset API**: Lập trình với các API cung cấp mức độ trừu tượng cao hơn bằng Python, Scala, Java hoặc R.

Bên dưới, dù bạn sử dụng SQL thuần hay DataFrame API, Spark SQL đều chuyển đổi chúng thành một quá trình thực thi tối ưu nhờ Catalyst Optimizer, giúp hiệu năng tính toán là tương đương nhau ở mọi ngôn ngữ.

### Các tính năng cốt lõi:
- **Tích hợp liền mạch**: Trộn lẫn SQL với mã nguồn lập trình một cách tự nhiên. Bạn có thể truy vấn dữ liệu từ các DataFrame và ngược lại.
- **Truy xuất dữ liệu đa dạng (Unified Data Access)**: Cung cấp API chung để đọc/ghi với nhiều định dạng dữ liệu như Parquet, ORC, JSON, CSV, JDBC/ODBC, Apache Hive, Apache Iceberg, Delta Lake.
- **Khả năng tương thích Hive**: Hỗ trợ đầy đủ cú pháp HiveQL, hàm UDF (User-Defined Functions), và metastore của Apache Hive.
- **Tối ưu hóa mạnh mẽ**: Catalyst Optimizer mang đến khả năng tối ưu query plan thông minh.

---

## 2. DataFrame và Dataset API

Trước Spark SQL, người dùng thao tác với dữ liệu qua RDD. RDD rất linh hoạt nhưng không có mô hình dữ liệu rõ ràng, dẫn đến việc khó tối ưu tự động. Spark SQL khắc phục điều này bằng DataFrames và Datasets.

### DataFrame
- DataFrame tương đương với một bảng trong cơ sở dữ liệu quan hệ, hoặc một Data Frame trong R/Python (Pandas), nhưng được phân tán trên nhiều node.
- Các cột trong DataFrame có tên và kiểu dữ liệu cụ thể (Schema).
- DataFrame trong Spark có tính bất biến (Immutable), tương tự RDD.

### Dataset (Chỉ có trên Scala/Java)
- Dataset kết hợp sự tiện lợi của kiểu dữ liệu được định nghĩa mạnh (strongly-typed) như trong lập trình hướng đối tượng với các tính năng tối ưu hóa của Spark SQL.
- Python và R không hỗ trợ Dataset API do bản chất kiểu dữ liệu động (dynamic-typing) của các ngôn ngữ này, thay vào đó chúng sử dụng DataFrame.
*(Lưu ý: Kể từ Spark 2.0, DataFrame thực chất là một `Dataset[Row]`)*.

---

## 3. Kiến Trúc Bên Dưới: Catalyst Optimizer

Đây là "trái tim" của Spark SQL, chịu trách nhiệm tối ưu hóa các thao tác DataFrame/Dataset và SQL. Quá trình tối ưu của Catalyst đi qua 4 giai đoạn:

### Giai đoạn 1: Phân tích (Analysis)
Bắt đầu với một chuỗi SQL hoặc chuỗi lệnh DataFrame, Spark sinh ra một **Unresolved Logical Plan**. Lúc này, Spark biết các cột và bảng nào đang được gọi nhưng chưa biết chúng có tồn tại hay kiểu dữ liệu có hợp lệ không. Catalyst sẽ dùng bộ từ điển **Catalog** (Metastore) để xác thực (resolve) các bảng và cột này, tạo ra một **Resolved Logical Plan**.

### Giai đoạn 2: Tối ưu hóa logic (Logical Optimization)
Spark áp dụng một tập hợp các quy tắc (Rules) theo phương pháp "Rule-based Optimization" (RBO). Các quy tắc phổ biến bao gồm:
- **Predicate Pushdown**: Đẩy các bộ lọc (filter) xuống mức nguồn dữ liệu sớm nhất có thể. Ví dụ: Nếu bạn query 100GB dữ liệu Parquet nhưng có câu lệnh `WHERE age > 18`, Spark sẽ chỉ đọc những khối dữ liệu thoả mãn điều kiện đó từ đĩa.
- **Column Pruning**: Loại bỏ các cột không dùng tới ngay từ lúc load dữ liệu, tiết kiệm I/O và memory.
- **Constant Folding**: Đánh giá các hằng số ngay lúc biên dịch (ví dụ thay `1 + 1` thành `2`).

Kết quả là sinh ra một **Optimized Logical Plan**.

### Giai đoạn 3: Lập kế hoạch vật lý (Physical Planning)
Ở đây Spark thực hiện "Cost-based Optimization" (CBO). Từ Optimized Logical Plan, Catalyst sinh ra nhiều **Physical Plans** (ví dụ: cách thực hiện Join khác nhau: SortMergeJoin vs BroadcastHashJoin). Sau đó Catalyst sẽ dựa trên số liệu thống kê (Statistics) về kích thước file, số dòng để đánh giá "chi phí" của từng plan và chọn ra kế hoạch có chi phí thấp nhất.

### Giai đoạn 4: Sinh mã tự động (Code Generation)
Sau khi có kế hoạch tối ưu, module **Tungsten** của Spark SQL sẽ dùng **Whole-Stage Code Generation** để compile tất cả query (SQL và DataFrame API) thành Java bytecode tối ưu nhất. Điều này giúp loại bỏ nhiều overhead khi thực thi (hạn chế các lời gọi hàm ảo virtual function calls).

---

## 4. Tungsten Execution Engine

Project Tungsten tập trung cải thiện hiệu suất sử dụng bộ nhớ và CPU cho Spark, đưa tốc độ của nó tiệm cận với tốc độ phần cứng (bare metal). Những cải tiến chính của Tungsten bao gồm:
- **Quản lý bộ nhớ ngoài luồng (Off-heap Memory Management)**: Tungsten tự quản lý bộ nhớ thông qua các mảng byte, thay vì dùng JVM Object. Điều này giúp giảm thiểu chi phí của quá trình thu gom rác (Garbage Collection - GC) trên các tập dữ liệu lớn.
- **Cấu trúc dữ liệu thân thiện với Cache**: Spark lưu trữ dữ liệu dạng cột trên bộ nhớ một cách tuần tự (column-oriented layout), tận dụng tối đa L1/L2/L3 cache của CPU.
- **Whole-stage CodeGen**: (Đã đề cập ở trên) Tích hợp nhiều toán tử trong query (ví dụ Filter, Select, Aggregate) vào một thân hàm (loop) duy nhất.

---

## 5. Adaptive Query Execution (AQE)

Ra mắt mạnh mẽ trong Spark 3.0, **AQE** là một tính năng đột phá giúp tối ưu hóa Physical Plan *trong quá trình chạy* (Runtime) dựa trên dữ liệu thực tế thu thập được, thay vì chỉ ước tính lúc lập kế hoạch.

Các khả năng chính của AQE:
1. **Tự động gom nhóm các phân vùng Shuffle (Dynamically coalescing shuffle partitions)**: Sau quá trình shuffle (ví dụ sau khi `GROUP BY`), nếu có nhiều phân vùng quá nhỏ, AQE sẽ gộp chúng lại để tránh tạo ra quá nhiều task I/O nhỏ.
2. **Chuyển đổi chiến lược Join động (Dynamically switching join strategies)**: Nếu lúc đầu Catalyst chọn Sort-Merge Join do ước lượng kích thước bảng lớn, nhưng sau bước filter thực tế, một bảng nhỏ lại chỉ còn vài Megabytes, AQE sẽ tự động đổi sang Broadcast Hash Join ở giữa quá trình chạy để tăng tốc.
3. **Tự động xử lý Skew Join (Dynamically optimizing skew joins)**: Dữ liệu phân bổ không đều (Data Skew) là nỗi ác mộng trong hệ thống phân tán. AQE sẽ phát hiện các phân vùng bị skew (lệch kích thước quá lớn so với trung bình) và chia nhỏ chúng thành các phân vùng đều đặn hơn để xử lý song song.

---

## 6. Các thao tác phổ biến và Best Practices

### Khởi tạo SparkSession
Mọi ứng dụng Spark SQL hiện đại (từ bản 2.0) bắt đầu với `SparkSession`:
```python
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("Spark SQL Example") \
    .config("spark.sql.warehouse.dir", "/user/hive/warehouse") \
    .enableHiveSupport() \
    .getOrCreate()
```

### Đọc, Ghi và Định dạng dữ liệu
Spark SQL hỗ trợ đọc trực tiếp nhiều nguồn. **Parquet** là định dạng mặc định được khuyên dùng do khả năng nén cao và lưu trữ theo cột.
```python
# Đọc dữ liệu
df = spark.read.parquet("hdfs://path/to/data.parquet")
df_csv = spark.read.option("header", "true").csv("data.csv")

# Ghi dữ liệu
df.write.mode("overwrite").partitionBy("year", "month").parquet("hdfs://output/path")
```

### Sử dụng Temporary Views để gọi SQL
Bạn có thể dễ dàng map một DataFrame thành một view để viết SQL chuẩn:
```python
df.createOrReplaceTempView("people")

sqlDF = spark.sql("SELECT name, age FROM people WHERE age > 21")
sqlDF.show()
```

### Best Practices để tối ưu hiệu suất Spark SQL:
1. **Sử dụng Parquet/ORC**: Các định dạng dạng cột cho phép Predicate Pushdown và Column Pruning tối đa.
2. **Broadcast Hash Join**: Khi Join một bảng lớn với một bảng nhỏ (thường < 10MB, có thể config qua `spark.sql.autoBroadcastJoinThreshold`), hãy dùng cơ chế Broadcast để tránh thao tác Shuffle tốn kém.
3. **Partitioning**: Khi lưu trữ ra Data Lake, hãy sử dụng `partitionBy()` hợp lý theo các cột hay được query (như ngày, tháng, khu vực) để tăng tốc độ truy vấn sau này. Đừng tạo quá nhiều partition nhỏ.
4. **Tránh dùng UDF (User Defined Functions) bừa bãi**: Python UDF thường rất chậm do chi phí serialization/deserialization dữ liệu giữa JVM (Spark chạy trên Java) và trình thông dịch Python. Hãy ưu tiên dùng các hàm nội bộ của Spark SQL (built-in functions trong `pyspark.sql.functions`). Nếu cần UDF, hãy xem xét **Pandas UDF (Vectorized UDF)** trong PySpark.

---

## Tài Liệu Tham Khảo
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* **Presto: SQL on Everything - Facebook Engineering**
