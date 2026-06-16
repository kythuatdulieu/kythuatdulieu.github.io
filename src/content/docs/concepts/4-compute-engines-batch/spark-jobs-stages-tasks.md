---
title: "Jobs, Stages, và Tasks trong Spark"
difficulty: "Intermediate"
tags: ["spark-jobs", "spark-stages", "spark-tasks", "apache-spark", "dag"]
readingTime: "11 mins"
lastUpdated: 2026-06-16
seoTitle: "Cấu trúc phân cấp thực thi: Spark Jobs, Stages và Tasks"
metaDescription: "Hiểu sâu cấu trúc giải phẫu của một Spark Application thông qua biểu đồ phân cấp DAG: Application, Jobs, Stages và Tasks, giúp đọc hiểu Spark UI dễ dàng."
description: "Để xử lý hàng Terabyte dữ liệu trên một mạng lưới gồm nhiều máy tính, Apache Spark không thể chỉ chạy code của bạn một cách tuần tự từ trên xuống dưới..."
---



Để xử lý hàng Terabyte dữ liệu trên một mạng lưới gồm nhiều máy tính, Apache Spark không thể chỉ chạy code của bạn một cách tuần tự từ trên xuống dưới. Thay vào đó, nó phải "chặt" đoạn code và luồng dữ liệu của bạn thành các đơn vị công việc nhỏ gọn hơn để có thể phân phối tới nhiều máy chủ (Executors) chạy song song.

Hiểu được cách thức phân chia này — tức là cấu trúc phân cấp **Application -> Jobs -> Stages -> Tasks** — là bước quan trọng nhất để bạn có thể làm chủ quá trình tối ưu hoá hiệu suất (Performance Tuning) và gỡ lỗi (Debugging) trong Spark.

Trong bài viết này, chúng ta sẽ đi sâu vào "giải phẫu" một ứng dụng Spark, từ đó tìm hiểu cách Spark lập lịch và thực thi từng phần tử trong ứng dụng của bạn.

## 1. Bức Tranh Toàn Cảnh: Cấu Trúc Phân Cấp Thực Thi



Khi bạn viết mã bằng PySpark, Scala hay Spark SQL, toàn bộ logic của bạn không được thực thi ngay lập tức. Spark sử dụng một cơ chế gọi là **Lazy Evaluation** (đánh giá lười biếng). Nó chỉ ghi lại các bước bạn muốn làm dưới dạng một kế hoạch, cho đến khi thực sự cần kết quả.

Khi có "trát" đòi kết quả (tức là khi gọi một **Action**), quá trình thực thi được cấu trúc theo 4 cấp độ phân cấp như sau:

1.  **Application:** Ứng dụng Spark của bạn, khởi tạo từ một `SparkSession`.
2.  **Job:** Một công việc (tác vụ lớn) được kích hoạt bởi một Action (ví dụ: `.show()`, `.write()`). Một Application có thể có nhiều Jobs.
3.  **Stage:** Mỗi Job được chia thành nhiều Stages dựa trên ranh giới của dữ liệu cần xáo trộn qua mạng lưới máy tính (Shuffle operations).
4.  **Task:** Mỗi Stage lại được chia thành nhiều Tasks. Task là đơn vị thực thi nhỏ nhất, mỗi Task sẽ xử lý một khối dữ liệu (Partition) riêng biệt.

Hãy tưởng tượng bạn đang điều hành một xưởng sản xuất bánh khổng lồ. Toàn bộ xưởng bánh chính là **Application**. Mỗi đơn đặt hàng hoàn chỉnh từ khách hàng yêu cầu vận chuyển đi là một **Job**. Để làm ra chiếc bánh hoàn chỉnh, bạn chia thành các giai đoạn (Nhào bột, Nướng bánh, Phủ kem) - đó chính là các **Stages**. Tại mỗi giai đoạn, bạn cử hàng chục nhân công (Worker) làm các công việc nhỏ lặp đi lặp lại giống hệt nhau (mỗi người nhào một cục bột) - đó chính là các **Tasks**.

---

## 2. Đi Sâu Vào Từng Thành Phần

### 2.1. Spark Application (Ứng Dụng Spark)

**Application** là một chương trình người dùng được xây dựng trên nền tảng Spark. Dù bạn nộp (submit) một script PySpark qua `spark-submit`, chạy một Notebook trên Databricks hay EMR, hay mở một Spark Shell, bạn đang khởi chạy một Spark Application.

Đặc điểm của Application:
* Mỗi Application được cấp phát một vùng nhớ và tài nguyên riêng thông qua Cluster Manager (như YARN, Kubernetes, hoặc Standalone).
* Một Application có một `Driver Program` riêng, trong đó đối tượng cốt lõi là `SparkContext` (hoặc `SparkSession` trong Spark 2.0+).
* Ứng dụng này sẽ duy trì kết nối trong suốt vòng đời của nó, và các Executors phân bổ cho Application này chỉ phục vụ duy nhất cho nó (tính cô lập).

### 2.2. Job (Công Việc)

**Job** là mức độ công việc song song cao nhất trong việc tính toán Spark. Khi nào thì một Job được sinh ra?

Trong Spark có 2 loại hàm chính (Operations):
* **Transformations (Các phép biến đổi):** `select`, `filter`, `map`, `groupBy`, `join`... Những lệnh này mang tính mô tả logic, **không kích hoạt tính toán ngay lập tức**.
* **Actions (Các phép hành động):** `count`, `show`, `collect`, `write`, `take`... Những lệnh này đòi hỏi kết quả trả về cho Driver hoặc ghi ra hệ thống lưu trữ bên ngoài, do đó nó **kích hoạt một Spark Job**.

> **Quy tắc vàng:** Trong một Application, cứ gọi bao nhiêu lần Action thì sẽ có bấy nhiêu Spark Jobs được kích hoạt tương ứng. 

Ví dụ, nếu trong một script bạn gọi lệnh `.cache()` sau đó `.count()`, rồi `.show(10)`, rồi cuối cùng là `.write.parquet(...)`, bạn sẽ thấy trong Spark UI có ít nhất 3 Jobs được sinh ra.

Mỗi khi một Action được gọi, Driver sẽ tạo ra một **DAG (Directed Acyclic Graph)** — hay "Biểu đồ có hướng không tuần hoàn". Đây là bản thiết kế để Spark biết chuỗi các Transformations nào cần chạy để có được kết quả cuối cùng.

### 2.3. Stage (Giai Đoạn)

Sau khi nhận được DAG cho một Job, thành phần DAGScheduler của Spark sẽ "băm" Job đó ra thành nhiều phần nhỏ hơn gọi là **Stages**. 

Vậy làm thế nào để DAGScheduler biết cách chia tách Stage ở đâu? Câu trả lời phụ thuộc vào đặc tính phụ thuộc dữ liệu (**Dependencies**) giữa các rãnh dữ liệu (Partitions).

* **Narrow Dependency (Phụ thuộc hẹp):** Mỗi partition của tập dữ liệu mới chỉ phụ thuộc vào một partition của tập dữ liệu cũ. Ví dụ: `map`, `filter`. Dữ liệu có thể được xử lý "trôi chảy" trên cùng một máy mà không cần đợi các máy khác.
* **Wide Dependency (Phụ thuộc rộng):** Việc tạo ra một partition mới đòi hỏi phải tổng hợp dữ liệu từ **nhiều partitions khác nhau**. Ví dụ: `groupBy`, `orderBy`, `join` (không dùng broadcast). Quá trình này đòi hỏi các Executors phải trao đổi dữ liệu cho nhau qua mạng, gọi là quá trình **Shuffle**.

> **Sự kiện chia Stage:** Spark sẽ nhóm tất cả các Transformations có *Narrow Dependency* liên tiếp nhau vào cùng một **Stage**. Cứ mỗi khi xuất hiện một *Wide Dependency* đòi hỏi thao tác Shuffle, ranh giới của Stage sẽ được vạch ra.
> 
> Hiểu đơn giản: **1 Shuffle = Kết thúc Stage cũ + Bắt đầu Stage mới.**

Stages không thể thực thi tuỳ tiện. Nếu Stage 2 cần dữ liệu đã được gộp lại từ Stage 1, Stage 2 bắt buộc phải chờ cho đến khi toàn bộ các máy chạy Stage 1 hoàn tất việc gửi dữ liệu (Shuffle Write) mới có thể bắt đầu đọc (Shuffle Read). Khác với việc các Task trong cùng Stage chạy song song, các Stages bị cản trở (blocking) lẫn nhau.

### 2.4. Task (Tác Vụ)

**Task** là đơn vị xử lý công việc nhỏ bé nhất trong Spark. Mỗi Task thực hiện một công việc duy nhất: **áp dụng các chuỗi mã lệnh của Stage đó lên MỘT CHUNK dữ liệu (gọi là Partition)**.

Quy tắc cơ bản của Tasks:
* **Số lượng Task trong 1 Stage = Số lượng Partition của RDD/DataFrame trong Stage đó.**
  *(Ví dụ: Dữ liệu của bạn được cắt làm 1000 partitions. Stage đó sẽ sinh ra đúng 1000 tasks).*
* Một Task chỉ được chạy trên duy nhất 1 luồng xử lý (1 Core/Thread) trên Executor.
* Vì mã lệnh trong cùng một Stage hoàn toàn giống nhau (các phép map, filter giống nhau), nên tất cả các Tasks trong một Stage làm chung một chức năng toán học, chỉ khác biệt ở mảnh dữ liệu đầu vào.
* Số lượng Tasks đang chạy đồng thời tối đa phụ thuộc vào tổng số lượng Cores (vCPUs) mà Cluster bạn đang có (ví dụ 10 máy, mỗi máy 4 cores => chạy song song tối đa 40 tasks). Các tasks còn lại sẽ xếp hàng chờ.

---

## 3. Quá Trình Thực Thi: Luồng Chảy Của Code Qua DAG

Hãy cùng xem một ví dụ thực tế về đoạn code sau:

```python
# Giả sử chúng ta đọc 10 file text (=> 10 Partitions mặc định)
df = spark.read.text("s3://bucket/data/logs_*.txt")

# Transformation 1: Filter (Narrow)
errors_df = df.filter(df.value.like("%ERROR%"))

# Transformation 2: Map/Select (Narrow)
extracted_df = errors_df.selectExpr("split(value, ' ')[0] as date", "value")

# Transformation 3: GroupBy (Wide) - Gây ra Shuffle!
daily_errors_df = extracted_df.groupBy("date").count()

# Action: Write (Trigger Job)
daily_errors_df.write.parquet("s3://bucket/data/output/")
```

**Phân tích luồng thực thi:**
1. Action `.write.parquet()` sẽ yêu cầu kết quả và tạo ra **Job 0**.
2. DAGScheduler quét chuỗi Operations ngược từ Action lên trên cùng.
3. Nó thấy `groupBy`, là một thao tác Wide Dependency (Shuffle). Tại đây nó "chém" DAG làm 2 nửa.
4. **Stage 1 (Map Stage):**
   - Đọc dữ liệu (10 Partitions) -> `filter` -> `select` -> Shuffle Write (chuẩn bị dữ liệu để chia ra cho GroupBy).
   - Vì có 10 Partitions, Stage 1 sẽ sinh ra **10 Tasks**. Mỗi Task thực thi chuỗi: "đọc -> lọc -> chọn -> ghi buffer đợi shuffle".
5. **Stage 2 (Reduce Stage):**
   - Đọc dữ liệu đã trộn (Shuffle Read) -> `count` (tổng hợp cục bộ) -> Ghi file Parquet.
   - Số lượng Tasks ở Stage này phụ thuộc vào biến `spark.sql.shuffle.partitions` (mặc định là 200). Nghĩa là sẽ có **200 Tasks** được sinh ra để lấy dữ liệu về, gộp đếm và xuất ra 200 files parquet tĩnh.

Tất cả những thông tin này, nếu bạn mở **Spark UI**, tab *Jobs* và click vào Job 0, bạn sẽ thấy tab *Stages* vẽ một sơ đồ dạng Box có đường nối rõ ràng giữa `Stage 1` -> `Stage 2`.

---

## 4. Ứng Dụng Vào Tối Ưu Hóa (Performance Tuning)

Hiểu vòng đời Application -> Jobs -> Stages -> Tasks sẽ giúp bạn chẩn đoán các "điểm nghẽn" (bottlenecks) qua Spark UI cực kỳ dễ dàng.

### 4.1. Căn Chỉnh Số Lượng Tasks Chống "Lãng Phí" (Data Skew / Tiny Partitions)
Nếu bạn mở Spark UI, xem Stage 2 có **200 Tasks**. Mạng lưới của bạn có tổng cộng 50 Cores.
Nếu một task chạy trung bình mất 10s. Bạn sẽ chia làm 4 "đợt" thực thi (waves) để xử lý hết 200 Tasks này (mỗi đợt 50 tasks). Quá ổn!

Nhưng nếu trong đó, 199 tasks mất 2 giây, còn 1 task mất tới 45 phút! Đó là hiện tượng **Data Skew (Lệch dữ liệu)**. Tại Stage này, toàn bộ 49 cores còn lại đã xong việc và ngồi chơi xơi nước, chờ đợi task cuối cùng kia. Spark Job bị kẹt tại đúng task đó. Giải pháp bấy giờ là cần sử dụng các thủ thuật Salting hoặc tính năng Adaptive Query Execution (AQE).

### 4.2. Tối Ưu Quá Trình Shuffle
Ranh giới các Stages là Shuffle. Thao tác Shuffle rất tốn kém (viết vào đĩa bộ nhớ trung gian, chuyển băng thông qua mạng, serialization, v.v.). Một DAG có hàng trăm Stages nối đuôi nhau không có nghĩa là tệ, nhưng nếu đó là những Stage Shuffle dữ liệu vô ích thì lại khiến Job rất chậm. 
> Bất cứ khi nào bạn có thể loại bỏ Shuffle (ví dụ: Thay đổi SortMergeJoin thành BroadcastHashJoin bằng cách dùng `broadcast()`), bạn đã "hợp nhất" 2 Stages lại thành 1 Stage duy nhất chạy liền mạch. Đây là thủ thuật tuning mang lại hiệu năng ấn tượng nhất.

### 4.3. Lỗi OutOfMemory (OOM) Ở Mức Độ Nào?
Có nhiều loại lỗi tràn RAM trong Spark, nhưng nó xuất phát ở các cấp độ khác nhau:
- `java.lang.OutOfMemoryError` tại Driver: Xảy ra do bạn gọi `collect()` đưa cả 10 triệu dòng dữ liệu về cái máy nhỏ bé đóng vai trò Driver.
- `Executor OOM` tại Task level: Một Task bị ép xử lý 1 partition to tới mức 10GB mà Executor chỉ được cấu hình cấp 8GB RAM (Thường xảy ra tại Wide Dependency do Skew). 

---

## 5. Kết Luận

Nắm vững khái niệm về Application, Job, Stage, và Task không chỉ là một mớ lý thuyết để thi chứng chỉ, mà nó cung cấp một bộ lăng kính thiết yếu để bạn "đọc bệnh" trên màn hình Spark UI. 

Nhìn vào code, đoán được Action, hình dung được bao nhiêu Job sinh ra. Nhìn vào Transform, nhận biết được Wide vs Narrow dependency để thấy các Stages bị chẻ ra ở đâu. Và cuối cùng hiểu được số lượng Partitions ảnh hưởng tới quy mô các Tasks đang chạy song song trên Cluster. Bức tranh này chính là nền tảng tối thượng của mọi Data Engineer làm việc với Apache Spark.

---

## Tài Liệu Tham Khảo
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* **Presto: SQL on Everything - Facebook Engineering**
