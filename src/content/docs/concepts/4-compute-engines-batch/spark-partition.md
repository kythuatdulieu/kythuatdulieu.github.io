---
title: "Spark Partition"
difficulty: "Intermediate"
tags: ["spark-partition", "apache-spark", "parallelism", "performance", "data-skew", "big-data"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Spark Partition là gì? Cách tối ưu phân vùng dữ liệu trong Apache Spark"
metaDescription: "Khái niệm Partition (phân vùng) trong Spark: Đơn vị tiền tệ của tính song song (Parallelism). Hướng dẫn tối ưu số lượng Partition, xử lý Data Skew và AQE."
description: "Khi làm việc với các hệ thống xử lý dữ liệu lớn (Big Data) như [Apache Spark](/concepts/4-compute-engines-batch/apache-spark/), tính toán song song chính là chìa khóa. Partition là đơn vị cốt lõi để điều khiển tính song song này..."
---



Khi làm việc với các hệ thống xử lý dữ liệu lớn (Big Data) như [Apache Spark](../apache-spark/), tính toán song song chính là chìa khóa để xử lý hàng Terabyte hoặc Petabyte dữ liệu một cách hiệu quả. Và để làm được điều này, Spark sử dụng một khái niệm cốt lõi: **Partition (Phân vùng)**.

## 1. Spark Partition là gì?



Partition là đơn vị chia nhỏ dữ liệu cơ bản nhất trong Spark. Mỗi Dataset, DataFrame hay RDD trong Spark thực chất là một tập hợp các Partition được phân tán rải rác trên nhiều node (máy chủ) trong cluster.

Hãy tưởng tượng bạn có một cuốn sách 10.000 trang và cần đọc nó thật nhanh. Thay vì một người đọc từ đầu đến cuối, bạn xé cuốn sách thành 100 phần (mỗi phần 100 trang) và đưa cho 100 người đọc cùng lúc. Mỗi phần 100 trang đó chính là một **Partition**, và 100 người đọc chính là các **Cores** (nhân xử lý) trong hệ thống Spark.

Trong kiến trúc của Spark:
- **1 Partition = 1 Task**: Spark sẽ gán đúng một Task để xử lý một Partition tại một thời điểm.
- **1 Task = 1 Core**: Một Task sẽ chiếm một CPU Core trong Executor để thực thi.

Do đó, **số lượng Task chạy song song luôn bằng số lượng Partitions đang được xử lý**. Nếu bạn có một cluster với 100 Cores nhưng dữ liệu của bạn chỉ có 2 Partitions, Spark sẽ chỉ sử dụng 2 Cores và 98 Cores còn lại sẽ ngồi chơi (under-utilization). Ngược lại, nếu bạn có quá nhiều Partition nhưng quá ít Cores, hệ thống sẽ mất nhiều thời gian cho việc lên lịch các tác vụ (task scheduling overhead) thay vì thực sự xử lý dữ liệu.

## 2. Các loại Partitions trong Spark

Có hai thời điểm chính mà số lượng Partition được xác định: khi đọc dữ liệu (Input Partitions) và khi xáo trộn dữ liệu (Shuffle Partitions).

### 2.1. Input Partitions (Khi đọc dữ liệu)

Khi bạn đọc dữ liệu từ một hệ thống lưu trữ phân tán (như HDFS, Amazon S3, Google Cloud Storage, Azure Data Lake), Spark sẽ tự động chia dữ liệu thành các Input Partitions dựa trên cấu trúc lưu trữ của hệ thống đó.

- **Đối với HDFS**: Số lượng partition thường bằng với số lượng khối dữ liệu (HDFS blocks - mặc định là 128MB/block). Nếu bạn đọc một file 1GB từ HDFS, Spark sẽ tự động tạo ra khoảng 8 partitions.
- **Đối với file Cloud (S3/GCS)**: Spark sử dụng cấu hình `spark.sql.files.maxPartitionBytes` (mặc định là 128MB) để quyết định kích thước tối đa của mỗi partition khi đọc file.
- **Đối với CSDL quan hệ (JDBC)**: Nếu bạn không chỉ định các tham số phân vùng, Spark sẽ đọc toàn bộ bảng dữ liệu bằng đúng 1 partition duy nhất (rất chậm và dễ gây OOM). Để tối ưu, bạn cần dùng các tham số `partitionColumn`, `lowerBound`, `upperBound`, và `numPartitions` để Spark có thể tự động sinh ra nhiều câu lệnh SQL nhỏ chạy song song để kéo dữ liệu.

### 2.2. Shuffle Partitions (Khi biến đổi dữ liệu)

Khi bạn thực hiện các thao tác yêu cầu dữ liệu có chung khóa (key) phải nằm trên cùng một Node (Wide Transformations) như `groupBy()`, `join()`, `orderBy()`, hoặc `distinct()`, Spark sẽ phải thực hiện một quá trình gọi là **Shuffle** - xáo trộn và trao đổi dữ liệu qua mạng (Network).

Sau quá trình Shuffle, dữ liệu mới sẽ được tổ chức lại thành các **Shuffle Partitions**.
Thông số cấu hình ảnh hưởng trực tiếp đến bước này là:
```scala
spark.sql.shuffle.partitions
```
- Giá trị mặc định của thông số này luôn là **200**.
- **Lưu ý cực kỳ quan trọng**: Con số 200 này hầu như KHÔNG BAO GIỜ đúng cho các bài toán thực tế.
  - *Đối với dữ liệu nhỏ* (vài trăm MB): 200 là quá nhiều. Nó sẽ tạo ra 200 file rất nhỏ, làm chậm quá trình ghi và làm khổ hệ thống file (HDFS/S3).
  - *Đối với dữ liệu rất lớn* (hàng trăm GB hoặc TB): 200 là quá ít. Dữ liệu nhồi nhét vào 200 partitions sẽ khiến dung lượng mỗi partition quá lớn (hàng GB), dẫn đến RAM của Executor bị đầy (Out of Memory - OOM) hoặc Spark phải liên tục ghi tạm dữ liệu xuống ổ cứng (Spill to disk), làm sụt giảm nghiêm trọng hiệu suất xử lý.

## 3. Điều chỉnh số lượng Partition: repartition() vs coalesce()

Bạn có thể chủ động thay đổi số lượng partition của DataFrame/RDD bằng hai phương thức: `repartition()` và `coalesce()`. Hiểu rõ sự khác biệt giữa chúng là kỹ năng tối quan trọng của Data Engineer.

### repartition(numPartitions)
- Có thể tăng (increase) hoặc giảm (decrease) số lượng partition.
- **Cách hoạt động**: Thực hiện một quá trình Shuffle toàn diện (Full Shuffle) qua mạng, phân phối lại toàn bộ dữ liệu một cách ngẫu nhiên (Round-robin) trên tất cả các partition mới để đảm bảo chúng có kích thước đồng đều.
- **Khi nào dùng?**: Khi bạn cần tăng số lượng partition để tăng tính song song, hoặc khi bạn muốn dữ liệu được cân bằng lại để giải quyết bài toán lệch dữ liệu nhẹ (light skew). Cũng có thể dùng `repartition(col)` để phân chia dữ liệu dựa trên một cột nhất định (ví dụ: tối ưu trước khi write partitioned data).
- **Cảnh báo**: Quá trình shuffle dữ liệu qua mạng là thao tác cực kì tốn kém về CPU, Network I/O và Disk I/O. Chỉ dùng khi thực sự cần thiết.

### coalesce(numPartitions)
- **Chỉ có thể giảm** số lượng partition (nếu đưa số lớn hơn, nó sẽ bỏ qua).
- **Cách hoạt động**: Tránh được quá trình Shuffle toàn diện. Thay vì chuyển dữ liệu qua mạng, nó chỉ thực hiện gộp (merge) các partition đang tồn tại trên cùng một Worker Node lại với nhau.
- **Khi nào dùng?**: Thường được dùng ngay sau khi filter đi một lượng lớn dữ liệu để giảm số lượng partition trống, hoặc **đặc biệt phổ biến ngay trước khi ghi dữ liệu (write)** ra storage để giảm số lượng file sinh ra, giải quyết vấn đề file nhỏ (Small File Problem).
- **Nhược điểm**: Vì không phân phối lại dữ liệu qua mạng, nó có thể dẫn đến việc các partition mới không đều nhau (data skew) nếu bản thân các partition cũ trên các node phân bố không đồng đều.

**Ví dụ thực tế**:
```python
# Giả sử df_logs đang có 2000 partitions, ta lọc đi 95% dữ liệu (những dòng lỗi)
df_errors = df_logs.filter(col("level") == "ERROR")

# XẤU: repartition sẽ làm chậm chương trình do shuffle toàn bộ data qua mạng
# df_bad = df_errors.repartition(100) 

# TỐT: coalesce nhanh chóng gom các partition lại trên cùng Node, ko qua mạng
df_good = df_errors.coalesce(100)

df_good.write.parquet("s3a://data-lake/logs/errors/")
```

## 4. Tối ưu hóa kích thước và số lượng Partition

Làm sao để biết "bao nhiêu" Partition là lý tưởng?
Nguyên tắc tối ưu hiệu năng (Performance Tuning) trong Spark luôn hướng tới một mục tiêu chung:

> **Khuyến nghị vàng**: Kích thước lý tưởng của mỗi Partition trong quá trình xử lý nên dao động trong khoảng **100MB đến 200MB**.

### Công thức ước lượng số lượng Shuffle Partitions:
1. **Dựa trên kích thước dữ liệu thực tế**:
   `Số Partitions = (Tổng kích thước dữ liệu ở stage hiện tại) / (Target Size ~ 150MB)`
   *Ví dụ*: Nếu bạn biết DataFrame của bạn sau khi join sẽ nặng khoảng 150GB, bạn nên set `spark.sql.shuffle.partitions = 1000`.

2. **Dựa trên mức độ song song của Cluster (Core Count)**:
   Để tận dụng tối đa CPU, số lượng Partitions tối thiểu nên bằng số Cores khả dụng, nhưng tốt nhất nên gấp **2 đến 3 lần** tổng số Cores để tận dụng khả năng lập lịch lấp chỗ trống.
   *Ví dụ*: Cụm Spark có 10 Executors, mỗi Executor 4 Cores -> Tổng cộng 40 Cores. Bạn nên có ít nhất 80 - 120 Partitions để các Cores luôn có việc làm, tránh tình trạng chờ đợi.

## 5. Cơn ác mộng: Lệch Dữ Liệu (Data Skew)

Bài toán khó nhằn bậc nhất liên quan đến partition là **Data Skew** (Lệch dữ liệu). Data Skew xảy ra khi dữ liệu không được phân phối đều vào các partition: có những partition rất bé (vài KB), trong khi lại có những partition khổng lồ (vài GB).

**Triệu chứng dễ nhận thấy trên Spark UI**:
- Một Stage có 200 Tasks. 199 Tasks màu xanh chạy xong vèo vèo trong 1 phút, nhưng 1 Task cuối cùng chạy "rặn" mãi mất 2 tiếng rưỡi (hoặc tệ hơn là báo lỗi OutOfMemory/Node Lost).
- Chênh lệch lớn giữa chỉ số *Median* Task Time và *Max* Task Time.

**Nguyên nhân phổ biến**:
Thường xảy ra ở các bước **Join** hoặc **GroupBy**. Ví dụ bạn group by theo `country_code`, dữ liệu "VN" có 500 triệu records, nhưng "LA" (Lào) chỉ có 500 records. Partition nhận khóa "VN" sẽ phải gánh lượng dữ liệu gấp hàng triệu lần. Hoặc phổ biến không kém: Join trên cột khóa chứa quá nhiều giá trị `null` hoặc rỗng (`""`).

**Các phương pháp giải quyết Data Skew**:
1. **Tách biệt và xử lý Null**: Lọc bỏ các dòng chứa `null` ở khóa join ra một nhánh riêng, join phần không chứa null, sau đó union kết quả lại.
2. **Kỹ thuật Salting (Thêm Muối)**: Thêm một giá trị ngẫu nhiên (VD: từ 0 đến 9) vào khóa bị lệch để "bẻ" nó thành 10 khóa nhỏ hơn (`VN_0`, `VN_1`,... `VN_9`), đánh lừa Spark chia nhỏ khối dữ liệu khổng lồ đó ra 10 partitions khác nhau. Ở bảng dimension cũng tiến hành replicate dữ liệu tương ứng.
3. **Sử dụng Broadcast Hash Join**: Khi một trong hai bảng join là bảng nhỏ (thường < 10MB - 100MB tuỳ cấu hình), hãy bọc bảng nhỏ bằng hàm `broadcast()`. Bảng nhỏ sẽ được copy thẳng tới mọi Executor. Quá trình Join diễn ra ngay tại node chứa data mà KHÔNG CẦN Shuffle dữ liệu bảng lớn. Không Shuffle = Không bị Data Skew.

## 6. Adaptive Query Execution (AQE) trong Spark 3.x

Trước phiên bản 3.0, việc tinh chỉnh số lượng partitions đòi hỏi rất nhiều công sức tuning bằng tay. Từ Spark 3.0 trở đi, **Adaptive Query Execution (AQE)** đã xuất hiện như một "phép màu" tự động hóa.

Khi được kích hoạt (`spark.sql.adaptive.enabled = true`), thay vì lập kế hoạch một lần rồi nhắm mắt chạy, Spark có thể tự động theo dõi, thu thập thống kê về dữ liệu thực tế sau mỗi Stage, và **điều chỉnh kế hoạch thực thi** ở các Stage tiếp theo ngay trong lúc đang chạy (runtime).

AQE tự động tối ưu hóa Partitions bằng 3 cơ chế cực mạnh:
1. **Dynamically Coalescing Shuffle Partitions**: Tự động gộp các shuffle partitions có kích thước quá nhỏ. Nhờ tính năng này, bạn có thể tự tin đặt `spark.sql.shuffle.partitions` lên thật cao ban đầu (vd: 1000). Ở runtime, nếu AQE thấy dữ liệu chỉ đủ cho 200 partitions dung lượng 150MB, nó sẽ tự động `coalesce` chúng lại, giúp bạn tránh lỗi small files mà không sợ bị thiếu phân vùng ở những data lớn.
2. **Dynamically Switching Join Strategies**: Trong quá trình thực thi Kế hoạch, nếu sau khi Filter một bảng lớn bất ngờ trở nên rất nhỏ, AQE sẽ tự động huỷ bỏ Sort-Merge Join chậm chạp và chuyển thành Broadcast Join siêu tốc ngay trên đường chạy.
3. **Dynamically Optimizing Skew Joins**: Đây là vị cứu tinh của Data Skew. AQE tự động theo dõi thời gian và kích thước partition. Nếu nó phát hiện ra một partition to một cách bất thường (lớn hơn cấu hình `spark.sql.adaptive.skewJoin.skewedPartitionFactor`), nó sẽ **tự động chia nhỏ (split)** partition bị phình to đó thành nhiều partition nhỏ hơn để các Task khác có thể nhảy vào chia sẻ gánh nặng.

## 7. Tổng kết

Việc hiểu sâu và làm chủ được Partition chính là "tấm vé" để bạn chuyển từ một người biết code Spark thành một Senior Data Engineer. Điều chỉnh linh hoạt số lượng và kích thước partition không chỉ quyết định ứng dụng của bạn chạy mất bao lâu, mà còn ảnh hưởng trực tiếp đến chi phí hạ tầng (Cloud Cost) và tính ổn định của toàn hệ thống dữ liệu.

Hãy luôn ghi nhớ: tận dụng tối ưu số Cores, kiểm soát kích thước ở ngưỡng 150MB, phân biệt rõ `repartition` / `coalesce`, và để cho AQE hỗ trợ bạn ở những phần việc khó nhằn.

## Tài Liệu Tham Khảo
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* [Data Skew and Salting Technique - Databricks Documentation](https://docs.databricks.com/en/optimizations/skew-join.html)
