---
title: "Mô hình thực thi Spark - Spark Execution Model"
difficulty: "Intermediate"
tags: ["spark-execution-model", "apache-spark", "driver", "executor", "dag", "shuffle", "task"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Spark Execution Model: Kiến trúc Driver, Cluster Manager và Executor"
metaDescription: "Hiểu sâu về kiến trúc thực thi (Execution Model) trong Apache Spark: Vai trò của Driver, Cluster Manager, Executor, DAG, Stage, và Task."
description: "Khi viết một đoạn mã Apache Spark để xử lý dữ liệu lớn, chúng ta thường viết các câu lệnh trông rất tuần tự và đơn giản trên máy tính cá nhân. Tuy nhiên, đằng sau đó là một hệ thống phân tán phức tạp với mô hình thực thi mạnh mẽ..."
---



Khi viết một đoạn mã Apache Spark để xử lý dữ liệu lớn, chúng ta thường viết các câu lệnh trông rất tuần tự và đơn giản trên máy tính cá nhân. Thế nhưng, để đoạn mã đó có thể xử lý hàng Terabyte hay Petabyte dữ liệu trên hàng trăm máy chủ khác nhau, Spark cần một cơ chế để biên dịch, tối ưu và phân phối khối lượng công việc. Cơ chế đó chính là **Mô hình thực thi Spark (Spark Execution Model)**.

Mô hình thực thi của Spark gồm 1 **Driver** (nhạc trưởng) và nhiều **Executors** (nhạc công). Driver phân tích code và tạo ra **DAG** (Directed Acyclic Graph), sau đó chia nhỏ thành các **Stages** và **Tasks** rồi gửi xuống cho Executors chạy trực tiếp trên các phân vùng dữ liệu (**Partitions**).

---

## 1. Kiến trúc tổng quan của một ứng dụng Spark



Một ứng dụng Spark (Spark Application) chạy độc lập như một tập hợp các tiến trình trên một cluster. Để điều phối các tiến trình này, Spark sử dụng kiến trúc Master-Worker, trong đó bao gồm 3 thành phần chính:

### 1.1. Driver Program (Nhạc trưởng)
**Driver** là tiến trình chạy hàm `main()` của ứng dụng và tạo ra đối tượng `SparkContext` (hoặc `SparkSession`). Nó đóng vai trò như một bộ não điều khiển toàn bộ quá trình thực thi:
- **Biên dịch và tối ưu hóa:** Chuyển đổi mã người dùng viết (ví dụ: Python, Scala, SQL) thành một kế hoạch thực thi vật lý (Physical Execution Plan).
- **Quản lý DAG:** Tạo ra một đồ thị có hướng không tuần hoàn (Directed Acyclic Graph - DAG) của các biến đổi dữ liệu.
- **Phân chia công việc:** Chia DAG thành các **Stage** và chia mỗi Stage thành nhiều **Task** nhỏ hơn.
- **Lập lịch và phân phối:** Tương tác với Cluster Manager để xin tài nguyên và phân phối các Task đến các Executor.
- **Giám sát:** Theo dõi trạng thái của các Executor, thu thập kết quả và hiển thị cho người dùng.

### 1.2. Cluster Manager (Người quản lý tài nguyên)
**Cluster Manager** không trực tiếp tham gia vào việc xử lý dữ liệu mà chỉ chịu trách nhiệm quản lý và cấp phát tài nguyên (CPU, Memory) cho ứng dụng Spark. Spark có thể chạy trên nhiều loại Cluster Manager khác nhau:
- **Standalone:** Trình quản lý tài nguyên tích hợp sẵn của Spark, thích hợp cho việc thử nghiệm và triển khai quy mô nhỏ.
- **YARN:** Trình quản lý tài nguyên phổ biến của hệ sinh thái Hadoop, cho phép Spark chạy song song với các công cụ khác như Hive, MapReduce.
- **Mesos:** Trình quản lý cụm linh hoạt, hỗ trợ phân bổ tài nguyên mịn (fine-grained).
- **Kubernetes (K8s):** Rất phổ biến hiện nay, cho phép Spark chạy như các container trên Kubernetes cluster, tận dụng sức mạnh của hệ sinh thái Cloud Native.

### 1.3. Executors (Nhạc công)
**Executors** là các tiến trình công nhân (worker processes) chạy trên các Node vật lý hoặc máy ảo trong cluster. Mỗi ứng dụng Spark có bộ Executor riêng rẽ rải rác trên cluster, và chúng duy trì sự tồn tại trong suốt vòng đời của ứng dụng.
- **Thực thi Task:** Nhận các Task từ Driver, chạy code để biến đổi dữ liệu một cách song song.
- **Lưu trữ dữ liệu:** Lưu trữ kết quả trung gian hoặc cache dữ liệu trong bộ nhớ (Memory) hoặc trên đĩa (Disk) thông qua thành phần gọi là Block Manager, giúp tăng tốc độ xử lý cho các tác vụ lặp (Iterative processing).
- **Báo cáo trạng thái:** Liên tục cập nhật tiến độ, trạng thái thực thi và mức độ sử dụng tài nguyên về cho Driver.

---

## 2. Vòng đời thực thi: Từ Code đến Cluster

Khi bạn nộp một công việc Spark và gọi một Action (ví dụ: `count()`, `collect()`, `saveAsTextFile()`), quy trình phân rã khối lượng công việc diễn ra theo các cấp độ sau:

**Application ➔ Job ➔ Stage ➔ Task**

### 2.1. Application
Một Application là một chương trình Spark hoàn chỉnh do người dùng viết, được gắn với một `SparkSession` duy nhất. Một Application có thể chứa nhiều Job.

### 2.2. Job
Mỗi khi bạn gọi một **Action** (hành động kích hoạt tính toán), Spark sẽ tạo ra một **Job**. Một Job là một chuỗi các bước biến đổi dữ liệu cần thiết để tạo ra kết quả cuối cùng theo yêu cầu của Action đó. Nếu trong một phiên bản code bạn gọi 3 Action, ứng dụng của bạn sẽ có 3 Job được lập lịch và chạy.

### 2.3. Stage
Driver sử dụng ranh giới của việc xáo trộn dữ liệu (**Shuffle**) để chia một Job thành nhiều **Stage**.
- **Transformation hẹp (Narrow Transformations):** Các hàm như `map()`, `filter()` không yêu cầu dữ liệu di chuyển giữa các phân vùng. Chúng có thể được gộp chung lại thành một Stage duy nhất để thực thi liên tục (Pipelining) trong bộ nhớ mà không cần ghi kết quả tạm ra đĩa.
- **Transformation rộng (Wide Transformations):** Các hàm như `groupByKey()`, `join()`, `reduceByKey()` yêu cầu dữ liệu phải được trao đổi và nhóm lại từ nhiều phân vùng khác nhau trên cluster. Quá trình trao đổi này gọi là **Shuffle**. Mỗi lần cần Shuffle, quá trình thực thi bị cắt ra và một Stage mới sẽ được bắt đầu.
- **Tính phụ thuộc:** Các Stage được sắp xếp dưới dạng đồ thị có hướng, các Stage phụ thuộc vào dữ liệu của Stage trước sẽ phải đợi Stage trước hoàn thành.

### 2.4. Task
Mỗi Stage lại được chia nhỏ thành các **Task**. **Task là đơn vị tính toán nhỏ nhất trong Spark**, được gửi đến từng Executor để chạy độc lập.
- Mỗi Task được phân công xử lý trên đúng một **Partition** dữ liệu.
- Số lượng Task trong một Stage mặc định bằng số lượng Partition của RDD/DataFrame ở thời điểm đó.
- Các Task trong cùng một Stage sẽ chạy cùng một khối lệnh nhưng trên các mảnh dữ liệu khác nhau (Data Parallelism), giúp khai thác sức mạnh của tính toán song song.

---

## 3. Quá trình Shuffle: Nút thắt cổ chai (Bottleneck) lớn nhất

**Shuffle** xảy ra khi dữ liệu cần được phân phối lại trên các phân vùng (từ map tasks ở Stage trước chuyển sang reduce tasks ở Stage sau). Đây là quá trình đắt đỏ và tốn kém tài nguyên nhất trong Spark vì nó liên quan đến:
1. **Disk I/O:** Stage phía trước cần ghi toàn bộ dữ liệu trung gian xuống đĩa (disk) của Executor để tránh quá tải bộ nhớ và đảm bảo an toàn khi cần retry.
2. **Serialization / Deserialization:** Dữ liệu cần được mã hóa thành các dòng byte để truyền tải và giải mã sau khi nhận.
3. **Network I/O:** Dữ liệu được di chuyển chéo qua lại trên mạng kết nối (network) giữa tất cả các Executor.

**Chiến lược tối ưu hóa:** 
Hầu hết các kỹ thuật tối ưu hóa Spark đều xoay quanh việc giảm thiểu Shuffle.
- Sử dụng **Broadcast Join** thay vì **Sort Merge Join** khi join một bảng lớn với một bảng nhỏ (bảng nhỏ được copy về tất cả các node, tránh phải trộn toàn bộ dữ liệu).
- Cấu hình đúng tham số `spark.sql.shuffle.partitions` (mặc định là 200, nhưng cần điều chỉnh tùy theo kích thước dữ liệu để các phân vùng có dung lượng từ 100MB - 200MB).
- Sử dụng hàm `reduceByKey()` thay vì `groupByKey()` để gộp dữ liệu sơ bộ (local aggregation) ở ngay bước map trước khi shuffle.

---

## 4. Thực thi trễ (Lazy Evaluation)

Một đặc điểm cực kỳ quan trọng của mô hình thực thi Spark là cơ chế **Lazy Evaluation** (thực thi trễ).
- Khi bạn gọi các hàm **Transformation** (ví dụ: `df.select()`, `df.filter()`, `df.withColumn()`), Spark không thực thi việc tính toán trên dữ liệu thực tế ngay lập tức. Thay vào đó, nó chỉ ghi lại "ý định" tính toán dưới dạng một node trong DAG.
- Việc thực thi dữ liệu chỉ thực sự diễn ra khi một hàm **Action** được gọi (ví dụ: `df.show()`, `df.count()`, `df.write()`). Lúc này, Spark mới đi ngược lại DAG từ Action về nguồn dữ liệu để bắt đầu đọc và xử lý.

**Tại sao Lazy Evaluation lại hữu ích?**
- Bằng cách đợi đến khi biết được toàn bộ các bước mà người dùng muốn thực hiện (toàn bộ DAG), **Catalyst Optimizer** của Spark SQL có thể tạo ra kế hoạch thực thi tối ưu nhất.
- *Ví dụ (Predicate Pushdown):* Nếu bạn đọc 1 tỷ dòng dữ liệu, map nó, rồi `filter` chỉ lấy 10 dòng, Spark đủ thông minh để đẩy lệnh `filter` xuống tận hệ thống lưu trữ (như Parquet/HDFS) để chỉ đọc 10 dòng cần thiết ngay từ đầu, thay vì tải hết 1 tỷ dòng vào RAM rồi mới lọc.

---

## 5. Deployment Modes: Client vs Cluster

Spark có hai chế độ triển khai ảnh hưởng trực tiếp đến vị trí chạy của Driver:

### 5.1. Client Mode
- **Vị trí Driver:** Chạy trên chính máy trạm (laptop, gateway node hoặc notebook server) nơi người dùng dùng lệnh `spark-submit` để khởi chạy ứng dụng.
- **Đặc điểm:** Đầu ra, kết quả và log ứng dụng sẽ hiển thị trực tiếp trên máy trạm, rất tiện lợi cho việc tương tác (ví dụ: Spark Shell) và gỡ lỗi.
- **Hạn chế:** Máy trạm phải kết nối ổn định với cluster mọi lúc. Nếu bạn tắt laptop hoặc kết nối mạng đứt, tiến trình Driver chết, kéo theo toàn bộ ứng dụng bị lỗi.

### 5.2. Cluster Mode
- **Vị trí Driver:** Cluster Manager sẽ tìm một Worker Node còn trống trong cụm (cluster) và khởi động tiến trình Driver ngay trên Node đó.
- **Đặc điểm:** Thường dùng cho các tác vụ sản xuất (Production Jobs). Người dùng sau khi nộp (submit) ứng dụng thành công có thể ngắt kết nối máy tính, cụm Spark sẽ tự đảm nhận phần còn lại.
- **Hạn chế:** Không thể thấy log chạy trực tiếp ở máy gửi lệnh. Bạn cần xem log thông qua Spark UI hoặc công cụ quản lý log của hệ thống phân tán (như Yarn Logs).

---

## 6. Tối ưu hóa động - Adaptive Query Execution (AQE)

Ra mắt từ phiên bản Spark 3.0 và được bật mặc định từ 3.2, **AQE** mang đến khả năng tối ưu hóa truy vấn một cách chủ động trong thời gian chạy (runtime). Khi các Stage hoàn thành quá trình Shuffle và có được các số liệu thống kê (metrics) thật xác thực về dữ liệu trung gian, AQE sẽ phân tích và cập nhật kế hoạch cho các Stage tiếp theo:

1. **Dynamically Coalescing Shuffle Partitions:** Tự động hợp nhất (coalesce) các phân vùng sau khi shuffle nếu chúng quá nhỏ, tránh tình trạng phát sinh quá nhiều Task tí hon làm nghẽn quá trình điều phối.
2. **Dynamically Switching Join Strategies:** Chuyển đổi chiến lược Join trong runtime. Ví dụ: Ban đầu dự định dùng Sort Merge Join, nhưng dữ liệu sau khi filter ở Stage trước bỗng nhiên giảm đi rất nhiều. AQE có thể tự chuyển qua dùng Broadcast Hash Join để bỏ qua bước Shuffle.
3. **Dynamically Optimizing Skew Joins:** Phát hiện và xử lý tình trạng dữ liệu mất cân bằng (Data Skew). Khi phát hiện một phân vùng quá "béo" so với các phân vùng khác trong lúc join, AQE tự động bẻ đôi (hoặc nhiều mảnh nhỏ) phân vùng đó và nhân bản partition tương ứng ở bảng đối diện, từ đó dàn đều khối lượng tính toán cho nhiều Task hơn.

---

## Tài Liệu Tham Khảo
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* **Presto: SQL on Everything - Facebook Engineering**
