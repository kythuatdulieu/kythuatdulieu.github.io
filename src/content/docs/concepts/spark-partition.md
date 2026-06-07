---
title: "Spark Partition"
category: "Batch Processing"
difficulty: "Intermediate"
tags: ["spark-partition", "apache-spark", "parallelism", "performance"]
readingTime: "9 mins"
lastUpdated: 2026-06-07
seoTitle: "Spark Partition là gì? Cách tối ưu phân vùng dữ liệu trong Apache Spark"
metaDescription: "Khái niệm Partition (phân vùng) trong Spark: Đơn vị tiền tệ của tính song song (Parallelism). Tại sao số lượng Partition quyết định trực tiếp hiệu suất Big Data."
---

# Spark Partition

## Summary

Trong Apache Spark, Partition (phân vùng) là một khối logical (logic) các dữ liệu. Nó là đơn vị cơ bản nhất, cốt lõi nhất để Spark thực hiện xử lý song song (Parallelism). Nếu bạn có cụm máy chủ với 1000 CPU nhưng dữ liệu chỉ được cấu trúc thành 1 Partition duy nhất, sẽ chỉ có 1 CPU chạy và 999 CPU ngồi chơi. Do đó, việc quản lý và chia lại (Repartitioning) số lượng Partitions cho phù hợp với tài nguyên phần cứng là kỹ năng quan trọng nhất của Data Engineer.

---

## Definition

**Partition** là một tập con (subset) của RDD (Resilient Distributed Dataset) hoặc DataFrame. Thay vì thao tác trên toàn bộ bảng dữ liệu hàng Terabytes, Spark chia bảng đó thành hàng nghìn khối nhỏ (Partitions) dung lượng vài chục hoặc vài trăm Megabytes. Mỗi khối này được giao cho **một Task duy nhất**, tương ứng với **một CPU Core**, để xử lý độc lập hoàn toàn trong bộ nhớ máy chủ (Executor).

*Công thức nền tảng*: `1 Partition = 1 Task = 1 CPU Core (tại cùng một thời điểm)`

---

## Why it exists

Big Data không thể xử lý tuần tự (sequential). Cách duy nhất để đạt được hiệu suất cao là xử lý song song (Concurrent Processing). Cấu trúc Partition tồn tại để:
1. Cho phép chia nhỏ bài toán khổng lồ.
2. Giới hạn dung lượng dữ liệu cần nạp vào RAM của một Node ở mức an toàn (tránh vỡ RAM - Out Of Memory).
3. Đảm bảo luồng dữ liệu truyền qua mạng trong các quá trình Shuffle không tạo ra cục dữ liệu (chunk) quá tải.

---

## How it works

Dữ liệu hình thành Partitions ở hai giai đoạn chính:

1. **Lúc đọc dữ liệu (Input Partitions)**:
   * Khi bạn đọc dữ liệu từ HDFS, số lượng partition thường bằng với số block của HDFS (mặc định 128MB/block).
   * Khi bạn đọc từ S3 hoặc cloud storage qua định dạng Parquet/CSV, Spark cũng tự động dùng thư viện nội bộ để chia nhỏ file lớn thành các Partitions có kích thước tối đa xấp xỉ `spark.sql.files.maxPartitionBytes` (mặc định 128MB).
2. **Sau khi thực hiện Shuffle (Shuffle Partitions)**:
   * Bất cứ khi nào bạn dùng hàm `join()`, `groupBy()`, `distinct()`, dữ liệu sẽ bị xáo trộn. Spark sẽ tự động gom mảnh vỡ lại và đóng gói thành một số lượng Partition mới. Số lượng này do tham số tĩnh `spark.sql.shuffle.partitions` quyết định (giá trị mặc định siêu kinh điển của Spark là 200).

---

## Practical example

```python
# 1. Đọc dữ liệu
df = spark.read.parquet("s3://sales_data/")

# Bạn có thể kiểm tra xem dataframe này đang được chia thành bao nhiêu cục:
print("Số lượng partition ban đầu: ", df.rdd.getNumPartitions())
# Giả sử ra: 10

# Tình huống: Cluster của bạn có 50 CPU Cores. Nhưng bạn chỉ có 10 partitions.
# => Chỉ có 10 CPU đang chạy làm việc. 40 CPU còn lại bị lãng phí.
# Giải pháp: Ép Spark chia nhỏ dữ liệu ra thành 100 Partitions để vắt kiệt sức mạnh 50 CPU.

df_repartitioned = df.repartition(100)

print("Số partition mới: ", df_repartitioned.rdd.getNumPartitions()) 
# Ra: 100
```

---

## Best practices

* **Kích thước lý tưởng**: Một kinh nghiệm làm nghề phổ biến (Rule of thumb) là một partition nên có kích thước dữ liệu vật lý chưa nén (uncompressed) rơi vào khoảng **100MB đến 200MB**.
* **Số lượng Partition lý tưởng**: Nên cấu hình số lượng partition bằng **2 đến 4 lần tổng số lượng CPU cores** của toàn cluster. *(Ví dụ: Cluster 50 Cores -> Nên để khoảng 150 partitions). Bằng cách này, nếu 1 CPU chạy xong Task nhanh, nó có thể nhận ngay cục Task tiếp theo thay vì rảnh rỗi.*
* **Sự khác biệt giữa `repartition()` và `coalesce()`**:
  * `repartition(n)`: Ép Spark xáo trộn (Shuffle) toàn bộ dữ liệu qua mạng để chia lại thành đúng `n` cục. Có thể dùng để TĂNG hoặc GIẢM số lượng partition, phân phối dữ liệu rất đều. Rất đắt đỏ (gây hại network).
  * `coalesce(n)`: Khuyến nghị dùng khi CHỈ MUỐN GIẢM số partition (ví dụ từ 1000 xuống 10). Nó không gây Shuffle qua mạng mà chỉ đơn giản là gộp các partition đang ở chung một máy tính lại với nhau. Cực kì nhanh, nhưng rủi ro kích thước các khối không đều nhau.

---

## Common mistakes

* **Quên đổi mặc định 200**: Dùng `spark.sql.shuffle.partitions = 200` cho mọi Data Pipeline. Nếu dữ liệu của bạn là 10TB, mỗi cục partition sau khi Shuffle sẽ chứa 50GB. Task xử lý cục 50GB này bằng 1 CPU sẽ sụp đổ OOM. Ngược lại nếu dữ liệu là 10MB, chia 200 cục mỗi cục chỉ 50KB, Spark sẽ tốn thời gian khởi tạo 200 Task thay vì tính toán thực sự.
* **Tạo file rác (Small File Problem)**: Nếu ghi DataFrame có 10,000 Partitions xuống S3 mà không dùng `coalesce`, Spark sẽ sinh ra đúng 10,000 file siêu nhỏ ở hệ thống lưu trữ. Việc đọc 10,000 file nhỏ này vào ngày hôm sau sẽ chậm khủng khiếp do overhead lấy Metadata của Cloud.

---

## Trade-offs

### Ưu điểm
* Partitions cho phép người phát triển kiểm soát trực tiếp dòng chảy tính toán phần cứng ở mức độ hạt (granularity) cao mà không phải đụng vào code hạ tầng.

### Nhược điểm
* Việc quản lý Partitions thủ công đòi hỏi Data Engineer phải luôn giám sát bảng điều khiển (Spark UI) để xem dung lượng, hiểu rất rõ lượng dữ liệu đầu vào. (Ở các phiên bản Spark mới >= 3.0, tính năng AQE - Adaptive Query Execution tự động gom/chia partition theo run-time đã giúp giải quyết phần nào gánh nặng này).

---

## When to use

* Bất cứ khi nào bạn đọc dữ liệu vào (Input tuning).
* Bất cứ khi nào bạn viết dữ liệu ra thành File (Output tuning).
* Bất cứ khi nào hiệu năng cụm bị chậm sau một hàm Join lớn.

---

## Related concepts

* [Shuffle](/concepts/shuffle)
* [Data Skew](/concepts/data-skew)
* [Adaptive Query Execution (AQE)](#)

---

## Interview questions

### 1. Sự khác biệt giữa `repartition()` và `coalesce()` là gì? Khi nào nên dùng cái nào?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng viết code Spark tối ưu.
* **Gợi ý trả lời**: `repartition(n)` thực hiện Full Shuffle toàn mạng để phân bổ lại dữ liệu đều nhau, có thể tăng hoặc giảm số phân vùng. `coalesce(n)` sử dụng logic thu hẹp nội bộ, gom các khối chung máy lại với nhau để giảm số lượng phân vùng mà không gây Shuffle, tiết kiệm thời gian đáng kể.
  * *Sử dụng*: Dùng `repartition` khi dữ liệu bị Skew (lệch) nghiêm trọng hoặc muốn tăng tính song song. Dùng `coalesce` ngay trước lệnh `.write.save()` để giảm số file nhỏ sinh ra ở thư mục đầu ra (tránh Small files problem).

### 2. Mối quan hệ giữa Partition và Task trong Spark là gì?
* **Gợi ý trả lời**: Tỉ lệ 1-1. Nếu một Stage trong Spark RDD có 100 Partitions, Spark Driver sẽ khởi tạo chính xác 100 Tasks. Mỗi Task là một luồng xử lý trên 1 CPU Core của Executor dùng để đọc và biến đổi một Partition cụ thể đó.

---

## References

* **Spark: The Definitive Guide** - Bill Chambers, Matei Zaharia.
* Blog kỹ thuật Databricks về Tối ưu hóa kích thước khối dữ liệu và AQE.

---

## English summary

A Spark Partition is a logical chunk of data within an RDD or DataFrame, serving as the fundamental unit of parallelism. The equation `1 Partition = 1 Task = 1 CPU Core` dictates that processing speed is directly constrained by the number of partitions. Poor partitioning strategies lead to unused CPU cores or out-of-memory errors. Tuning the shuffle partitions (default 200) and utilizing memory-efficient redistribution commands like `coalesce()` versus full-shuffle `repartition()` are crucial skills for avoiding "small files" problems and maximizing cluster utilization.
