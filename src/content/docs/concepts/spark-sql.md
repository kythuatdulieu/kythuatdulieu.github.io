---
title: "Spark SQL"
category: "Batch Processing"
difficulty: "Intermediate"
tags: ["spark-sql", "apache-spark", "catalyst-optimizer", "dataframe"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Spark SQL là gì? Catalyst Optimizer và DataFrame trong Apache Spark"
metaDescription: "Giới thiệu Spark SQL, thành phần cốt lõi của Apache Spark dùng để xử lý dữ liệu cấu trúc bằng SQL và DataFrame API. Tìm hiểu cơ chế Catalyst Optimizer."
---

# Spark SQL

## Summary

Spark SQL là một module cốt lõi của Apache Spark được thiết kế đặc biệt để xử lý các luồng dữ liệu có cấu trúc (structured data). Nó cung cấp cho người dùng khả năng truy vấn bằng ngôn ngữ SQL tiêu chuẩn, đồng thời kết hợp linh hoạt với các ngôn ngữ lập trình qua DataFrame API. Sức mạnh thực sự của Spark SQL nằm ở bộ máy Catalyst Optimizer, giúp tự động tối ưu hóa mã nguồn để đạt hiệu suất cao nhất.

---

## Definition

Trong hệ sinh thái Apache Spark, **Spark SQL** đóng vai trò là một Engine trung tâm thay thế cho cách tiếp cận dùng RDD (Resilient Distributed Dataset) truyền thống. 
Mục tiêu chính của Spark SQL là trừu tượng hóa mức độ phức tạp của xử lý phân tán: thay vì bắt Data Engineer tự viết mã phân phối và tối ưu hóa Map/Reduce, họ chỉ cần khai báo "TÔI MUỐN GÌ" qua lệnh SQL hoặc DataFrame, và Spark SQL sẽ lo liệu phần "LÀM NHƯ THẾ Nào" (tối ưu nhất).

---

## Why it exists

Những năm đầu của Spark, lập trình viên sử dụng RDD API (viết bằng ngôn ngữ như Python hoặc Scala) yêu cầu rất nhiều thủ thuật tối ưu thủ công. Trình thực thi của Spark không thể "hiểu" được nội dung trong các hàm Lambda của Python/Scala để có thể tối ưu hóa nó. 

Spark SQL ra đời để giải quyết vấn đề đó: Bằng cách áp đặt Schema (cấu trúc cột và kiểu dữ liệu) lên tập dữ liệu và giới hạn các toán tử (thay vì các hàm tùy ý), Spark SQL thu thập được thông tin cần thiết. Từ đó, nó truyền sơ đồ truy vấn (query plan) qua một động cơ có tên là **Catalyst Optimizer** để tổ chức lại các phép Filter, Join, quét dữ liệu sao cho tiết kiệm CPU và bộ nhớ nhất.

---

## How it works

Spark SQL hoạt động qua hai nền tảng giao tiếp và một bộ não trung tâm:

1. **Giao tiếp qua SQL**: Bạn có thể viết các câu lệnh `SELECT`, `JOIN`, `GROUP BY` trực tiếp trên các bảng ảo (Temp Views) được Spark đăng ký.
2. **Giao tiếp qua DataFrame / Dataset API**: Một dạng DSL (Domain Specific Language) trong Python/Scala, cho phép thực hiện các thao tác chuỗi tương tự SQL nhưng có lợi thế của ngôn ngữ lập trình.
3. **Catalyst Optimizer**: Trái tim của Spark SQL. Quá trình hoạt động của nó:
   * **Unresolved Logical Plan**: Phân tích cú pháp xem câu SQL hoặc DataFrame viết có đúng không.
   * **Logical Plan**: Đối chiếu với siêu dữ liệu (Catalog) để kiểm tra xem các bảng/cột có thực sự tồn tại và đúng kiểu dữ liệu không.
   * **Optimized Logical Plan**: Áp dụng các quy luật thông minh (Rule-based optimization). *Ví dụ: Nếu lệnh là gộp dữ liệu rồi mới lọc dữ liệu, Catalyst sẽ đẩy phép lọc lên trước (Predicate Pushdown) để giảm bớt dữ liệu đi vào việc gộp.*
   * **Physical Plan**: Tính toán và sinh ra nhiều phương án thực thi vật lý, sau đó chọn phương án tốn ít tài nguyên nhất (Cost-based optimization) để đưa cho cluster chạy.

---

## Practical example

Chạy một kịch bản phân tích khách hàng thân thiết. Spark SQL cho phép bạn trộn lẫn giữa SQL và mã Python (PySpark).

**Cách 1: Sử dụng DataFrame API**
```python
# Tải dữ liệu lên DataFrame
df_sales = spark.read.parquet("s3://data/sales/")

# Thao tác bằng DataFrame API
df_filtered = df_sales.filter(df_sales["amount"] > 100) \
                      .groupBy("customer_id") \
                      .sum("amount")
```

**Cách 2: Sử dụng SQL**
```python
# Tải dữ liệu và đăng ký thành một View ảo
df_sales.createOrReplaceTempView("sales_table")

# Chạy SQL thuần túy
query = """
    SELECT customer_id, SUM(amount) as total_amount
    FROM sales_table
    WHERE amount > 100
    GROUP BY customer_id
"""
df_filtered = spark.sql(query)
```
Cả hai cách trên khi biên dịch đều sẽ được truyền vào Catalyst Optimizer và sinh ra cùng một mã máy phân tán giống hệt nhau ở tầng vật lý, hiệu năng hoàn toàn tương đương.

---

## Best practices

* **Ưu tiên Spark SQL / DataFrame hơn RDD**: Tuyệt đối tránh chuyển đổi DataFrame về dạng RDD rdd (`df.rdd.map(lambda x: ...)`). Khi sử dụng hàm Lambda, Catalyst sẽ "mù" và mất khả năng tối ưu hóa, buộc Spark phải tuần tự hóa (serialize) dữ liệu giữa JVM và Python, gây ra chi phí hiệu suất khổng lồ.
* **Tận dụng Predicate Pushdown**: Lưu dữ liệu ở các định dạng cột (Columnar formats) như Parquet hoặc ORC. Spark SQL kết hợp cực kỳ tốt với chúng: Catalyst sẽ chỉ đọc chính xác các cột cần thiết từ ổ đĩa và đẩy điều kiện WHERE xuống tận tầng lưu trữ để bỏ qua file không liên quan (File Skipping).

---

## Common mistakes

* **Sử dụng UDF (User Defined Functions) vô tội vạ**: Trong PySpark, viết UDF bằng Python thuần được coi là "hộp đen" đối với Catalyst Optimizer. Nó làm suy giảm hiệu năng hàng chục lần so với dùng các hàm SQL có sẵn của Spark (`pyspark.sql.functions`). Chỉ sử dụng UDF khi bắt buộc và ưu tiên dùng Pandas UDF (Vectorized UDF).

---

## Trade-offs

### Ưu điểm
* Thân thiện với Data Analyst: Bất kỳ ai biết SQL đều có thể thao tác với dữ liệu Big Data phân tán khổng lồ.
* Hiệu suất tối đa tự động: Engine tự thực hiện những công việc khó khăn nhất để tiết kiệm tài nguyên mạng và RAM.
* Khả năng đọc đa dạng nguồn: Kết nối native với Hive, JSON, CSV, JDBC, Parquet.

### Nhược điểm
* **Ràng buộc Schema**: Dữ liệu phải có một lược đồ (Schema) tương đối định hình, kém linh hoạt hơn so với RDD khi phải đối phó với dữ liệu phi cấu trúc quá phức tạp.

---

## When to use

* Là công cụ mặc định (Default) 99% thời gian khi lập trình các Data Pipelines trên Apache Spark.
* Khi đội ngũ có nền tảng mạnh về SQL Data Warehouse muốn chuyển dịch lên hệ thống Big Data.

---

## Related concepts

* [Apache Spark](/concepts/apache-spark)
* [Spark Execution Model](/concepts/spark-execution-model)

---

## Interview questions

### 1. Sự khác biệt giữa DataFrame API và viết mã SQL thuần (`spark.sql()`) về mặt hiệu suất là gì?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết về Catalyst Optimizer.
* **Gợi ý trả lời**: Cả hai không có sự khác biệt về hiệu suất tính toán vật lý. Bất kể bạn viết bằng SQL String hay DataFrame API bằng Python/Scala/R, tất cả đều được đưa vào Catalyst Optimizer để xây dựng cấu trúc Logical Plan giống hệt nhau, và sinh ra chung một bộ Physical execution plan. Khác biệt duy nhất nằm ở phong cách lập trình và khả năng dễ refactor/kiểm thử của DataFrame API so với SQL String.

### 2. Catalyst Optimizer là gì và kể tên một chiến lược tối ưu mà nó thường sử dụng?
* **Gợi ý trả lời**: Catalyst là bộ não tối ưu truy vấn của Spark SQL. Một chiến lược phổ biến là Predicate Pushdown: Tự động đẩy các biểu thức điều kiện (Filter/WHERE) xuống gần nguồn dữ liệu nhất có thể trước khi quét và Join, giúp giảm lượng dữ liệu đọc từ đĩa và truyền qua mạng một cách đáng kể.

---

## References

* **Spark: The Definitive Guide** - Bill Chambers, Matei Zaharia.
* Tài liệu Databricks về Catalyst Optimizer.

---

## English summary

Spark SQL is an Apache Spark module for structured data processing that exposes SQL and the DataFrame API. Its core power lies in the Catalyst Optimizer, a highly extensible query optimization engine that transforms user queries into highly efficient physical execution plans on the cluster. By leveraging schema enforcement and rule-based/cost-based optimizations (like predicate pushdown), Spark SQL drastically improves performance over native RDD API operations while making Big Data processing accessible to SQL developers.
