---
title: "Apache Spark"
difficulty: "Intermediate"
tags: ["apache-spark", "big-data", "in-memory", "cluster"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Apache Spark là gì? Tổng quan khung xử lý dữ liệu lớn trong bộ nhớ"
metaDescription: "Tìm hiểu kiến trúc Apache Spark, cơ chế xử lý phân tán In-Memory, RDD, DataFrame và lý do nó thay thế Hadoop MapReduce trong xử lý dữ liệu lớn (Big Data)."
description: "Khi lượng dữ liệu của doanh nghiệp tăng từ vài Gigabyte lên hàng Terabyte hoặc Petabyte, các công cụ xử lý trên một máy tính đơn lẻ (như Pandas) sẽ lậ..."
---



Apache Spark là engine xử lý dữ liệu phân tán (Distributed Processing Engine) mã nguồn mở, được thiết kế để xử lý và phân tích các tập dữ liệu khổng lồ (Big Data) với tốc độ cực nhanh. Ra đời tại UC Berkeley AMPLab vào năm 2009, Spark đã tạo ra một cuộc cách mạng trong lĩnh vực xử lý dữ liệu nhờ khả năng tính toán In-Memory (trên RAM), giúp nó đạt tốc độ nhanh hơn Hadoop MapReduce truyền thống lên tới hàng trăm lần.

Spark không chỉ đơn thuần là một công cụ xử lý Batch (hàng loạt), mà còn cung cấp một hệ sinh thái thống nhất hỗ trợ xử lý Stream (luồng), Machine Learning (học máy) và Graph Processing (xử lý đồ thị), hỗ trợ đa ngôn ngữ lập trình (Python, Scala, Java, R, SQL). Hiện nay, Spark là nền tảng cốt lõi của nhiều hệ thống phân tích dữ liệu hiện đại, đặc biệt là Databricks.

---

## 1. Tại sao Apache Spark lại thay thế Hadoop MapReduce?



Trước khi Spark xuất hiện, Hadoop MapReduce là tiêu chuẩn vàng cho xử lý dữ liệu phân tán. Tuy nhiên, MapReduce gặp phải những hạn chế chí mạng về hiệu suất do cơ chế thiết kế của nó, và Spark ra đời để giải quyết triệt để những vấn đề này.

### 1.1. Tính toán In-Memory vs. Disk I/O
- **MapReduce:** Sau mỗi bước tính toán (Map và Reduce), dữ liệu trung gian bắt buộc phải được ghi xuống ổ cứng (Disk) thông qua HDFS để đảm bảo tính chịu lỗi (Fault-Tolerance). Việc liên tục đọc/ghi ổ cứng (Disk I/O) trở thành nút thắt cổ chai khổng lồ, đặc biệt trong các tác vụ lặp (Iterative algorithms) như Machine Learning.
- **Spark:** Giữ dữ liệu trung gian hoàn toàn trên bộ nhớ RAM (In-Memory Computing). Spark chỉ ghi dữ liệu xuống đĩa khi thực sự cần thiết (ví dụ: RAM bị đầy) hoặc khi kết thúc toàn bộ quá trình xử lý. Nhờ việc cắt giảm I/O, Spark đạt tốc độ nhanh hơn đáng kinh ngạc.

### 1.2. Lập trình dễ dàng (Ease of Use)
- **MapReduce:** Buộc lập trình viên phải chia mọi logic tính toán thành 2 hàm cơ bản là `map` và `reduce`. Viết code MapReduce bằng Java rất dài dòng, rườm rà và khó gỡ lỗi.
- **Spark:** Cung cấp hàng chục toán tử (operators) bậc cao như `filter`, `join`, `groupBy`, `aggregate`, giúp code ngắn gọn, dễ hiểu và gần gũi với tư duy xử lý dữ liệu thông thường.

### 1.3. Thực thi trễ (Lazy Evaluation)
Spark không thực thi các hàm chuyển đổi (Transformations) ngay lập tức. Nó ghi nhận lại toàn bộ chuỗi lệnh vào một đồ thị DAG (Directed Acyclic Graph), và chỉ thực thi khi có một hàm hành động (Action) được gọi. Nhờ DAG, trình tối ưu hóa của Spark (Catalyst Optimizer) có thể phân tích toàn bộ quá trình và tự động đưa ra kế hoạch thực thi (Execution Plan) nhanh nhất có thể.

---

## 2. Hệ sinh thái Apache Spark

Khác với các công cụ chỉ giải quyết một bài toán duy nhất, Spark hướng tới việc cung cấp một **Nền tảng hợp nhất (Unified Engine)** cho mọi khối lượng công việc liên quan đến dữ liệu lớn. Hệ sinh thái Spark bao gồm 5 thành phần chính:

### 2.1. Spark Core
Đây là trái tim của hệ thống, cung cấp các chức năng nền tảng cơ bản nhất:
- Lập lịch và phân phối các tác vụ (Task scheduling).
- Quản lý bộ nhớ (Memory management).
- Cơ chế phục hồi khi gặp lỗi (Fault recovery).
- Tương tác với các hệ thống lưu trữ (S3, HDFS, Azure Data Lake).
- Cung cấp API cơ bản là RDD (Resilient Distributed Dataset).

### 2.2. Spark SQL
Module phổ biến nhất trong Spark, cho phép người dùng truy vấn dữ liệu có cấu trúc bằng các câu lệnh SQL tiêu chuẩn hoặc qua DataFrames/Datasets API.
- Hỗ trợ kết nối mượt mà với Hive, Parquet, ORC, JSON, JDBC.
- Sở hữu **Catalyst Optimizer** (Trình tối ưu hóa truy vấn) và **Tungsten Engine** (Trình tạo mã tối ưu hiệu suất bộ nhớ), giúp Spark SQL đạt tốc độ nhanh hơn cả RDD thuần túy.

### 2.3. Spark Streaming / Structured Streaming
Cho phép xử lý luồng dữ liệu thời gian thực (Real-time data streams) từ các nguồn như Kafka, Kinesis, Flume, hoặc TCP sockets.
- **Micro-batching:** Spark chia nhỏ luồng dữ liệu thành các batch cực nhỏ (vài phần nghìn giây) để xử lý liên tục, tận dụng sức mạnh của engine Batch.
- **Structured Streaming:** Thế hệ mới của Spark Streaming, cho phép viết code xử lý stream y hệt như đang xử lý các bảng dữ liệu tĩnh (DataFrames), giảm thiểu độ phức tạp cho lập trình viên.

### 2.4. MLlib (Machine Learning)
Thư viện máy học có khả năng mở rộng (Scalable Machine Learning), cung cấp các thuật toán phân loại (Classification), hồi quy (Regression), phân cụm (Clustering), lọc cộng tác (Collaborative Filtering). Khác với Scikit-learn (chỉ chạy trên 1 máy), MLlib được thiết kế để huấn luyện mô hình song song trên cụm máy chủ lớn.

### 2.5. GraphX
Thư viện xử lý dữ liệu đồ thị (Graph Processing) để giải quyết các bài toán về mạng xã hội, định tuyến, phân tích liên kết (PageRank). Mặc dù hiện tại GraphX không được cập nhật mạnh mẽ như các thành phần khác, nó vẫn là một công cụ hữu ích trong hệ sinh thái.

---

## 3. Các cấu trúc dữ liệu cốt lõi (Core Data Structures)

Xuyên suốt lịch sử phát triển, Spark cung cấp 3 API chính để thao tác với dữ liệu. Hiểu rõ sự khác biệt giữa chúng là điều bắt buộc đối với một Kỹ sư dữ liệu.

### 3.1. RDD (Resilient Distributed Dataset)
- RDD là nền tảng sơ khai và cơ bản nhất của Spark. Nó là một tập hợp các đối tượng (objects) được phân tán trên các node, có tính chịu lỗi (nếu một node chết, Spark dùng Lineage Graph để tính toán lại phân vùng bị mất) và tính bất biến (Immutable - không thể bị sửa đổi).
- **Ưu điểm:** Cung cấp quyền kiểm soát hoàn toàn ở mức độ thấp (low-level). Phù hợp để xử lý dữ liệu hoàn toàn phi cấu trúc (ví dụ: log file, text tự do).
- **Nhược điểm:** Spark không hiểu được cấu trúc bên trong dữ liệu của RDD (với Spark, nó chỉ là một object opaque), do đó Spark không thể tự động tối ưu hóa query. RDD chậm hơn DataFrame trong hầu hết các trường hợp do chi phí Serialization.

### 3.2. DataFrame
- Được giới thiệu trong Spark 1.3, DataFrame giải quyết bài toán hiệu suất của RDD. Nó giống như một bảng trong cơ sở dữ liệu quan hệ hoặc DataFrame của Pandas, nhưng được thiết kế để chạy phân tán.
- Dữ liệu trong DataFrame được tổ chức thành các **Cột (Columns) có định dạng kiểu dữ liệu rõ ràng (Schema)**.
- **Ưu điểm:** Nhờ biết trước Schema, Spark áp dụng sức mạnh của **Catalyst Optimizer** để tối ưu hóa việc phân tích code và **Tungsten Engine** để tối ưu hóa bộ nhớ và CPU. Đây là cấu trúc dữ liệu được khuyến nghị sử dụng nhất hiện nay.

### 3.3. Dataset
- Được giới thiệu trong Spark 1.6, Dataset là sự kết hợp giữa RDD và DataFrame: Nó cung cấp tính năng Type-Safety (kiểm tra kiểu dữ liệu tĩnh ngay từ lúc compile code) của RDD, đồng thời giữ được sức mạnh tối ưu hóa của DataFrame.
- **Lưu ý:** Dataset API chỉ khả dụng cho các ngôn ngữ có kiểu tĩnh mạnh (Strongly-typed) như Scala và Java. Trong Python và R, do tính chất là ngôn ngữ cấp phát động (Dynamic-typed), chúng ta chỉ có thể sử dụng DataFrame (trong PySpark, DataFrame bản chất chính là `Dataset[Row]`).

---

## 4. Kiến trúc cụm (Cluster Architecture) và Quản lý tài nguyên

Spark không tự quản lý các máy chủ vật lý, nó dựa vào một hệ thống quản lý tài nguyên (Cluster Manager) để phân bổ CPU và RAM. Một ứng dụng Spark chạy trên cụm bao gồm:

1. **Driver Program:** Tiến trình trung tâm quản lý luồng thực thi, tạo `SparkSession/SparkContext`, phân tích code và chia công việc thành các Tasks.
2. **Cluster Manager:** Một dịch vụ bên ngoài (YARN, Kubernetes, Mesos, hoặc Spark Standalone) cấp phát tài nguyên cho Driver và Executors.
3. **Executors:** Các tiến trình làm việc chạy trên các Node của cụm, trực tiếp nhận và thực thi các Task được giao, đồng thời lưu trữ dữ liệu tính toán trong bộ nhớ (Cache).

*(Để hiểu sâu hơn về quá trình tạo Job, Stage, Task và việc di chuyển dữ liệu, xem bài [Mô hình thực thi Spark - Spark Execution Model](./spark-execution-model.md))*

---

## 5. Khi nào KHÔNG NÊN sử dụng Spark?

Spark là một công cụ mạnh mẽ, nhưng sử dụng sai mục đích sẽ mang lại hệ quả tệ hại về chi phí và hiệu năng:

1. **Dữ liệu nhỏ (Dưới vài chục GB):** Overhead (chi phí khởi tạo) để quản lý cụm, network, serialization của Spark lớn hơn thời gian thực sự xử lý dữ liệu. Với dữ liệu nhỏ, Pandas hoặc Polars chạy trên một máy đơn lẻ sẽ nhanh và rẻ hơn nhiều.
2. **Truy vấn độ trễ siêu thấp (OLTP):** Spark không phải là cơ sở dữ liệu xử lý giao dịch. Nó không phù hợp cho các truy vấn tính bằng mili-giây (ví dụ: lấy thông tin giỏ hàng của một user khi họ click trên web). Hãy sử dụng RDBMS (PostgreSQL, MySQL) hoặc NoSQL (Cassandra, MongoDB) cho OLTP.
3. **Phân tích Dashboard thời gian thực:** Mặc dù Spark có thể tính toán để trả ra bảng tổng hợp, nhưng việc kết nối BI Dashboard (như Tableau) chạy truy vấn trực tiếp vào Spark SQL cho mỗi lần load trang là không hiệu quả. Thường người ta dùng Spark tính toán Batch, lưu vào Data Warehouse (Snowflake, BigQuery) hoặc các hệ thống OLAP (ClickHouse, Apache Druid) để phục vụ Dashboard.

---

## Tài Liệu Tham Khảo
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* **Presto: SQL on Everything - Facebook Engineering**
