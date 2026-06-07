---
title: "Shuffle trong Spark"
category: "Batch Processing"
difficulty: "Advanced"
tags: ["shuffle", "apache-spark", "performance-tuning", "bottleneck"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Shuffle trong Spark: Điểm nghẽn hiệu năng cốt lõi cần tối ưu"
metaDescription: "Tìm hiểu chi tiết quá trình Shuffle trong Apache Spark là gì, tại sao nó gây ra độ trễ I/O và mạng lưới cực lớn, cũng như các kỹ thuật tuning hiệu năng để giảm thiểu Shuffle."
---

# Shuffle trong Spark

## Summary

Trong hệ thống tính toán phân tán Apache Spark, **Shuffle** là quá trình tổ chức lại và luân chuyển dữ liệu vật lý qua lại giữa các máy tính (nodes) trong mạng lưới cụm (cluster). Quá trình này bắt buộc xảy ra khi thực hiện các phép gộp nhóm (grouping), nối bảng (joining) hay sắp xếp (sorting). Shuffle tiêu tốn khổng lồ tài nguyên I/O đĩa cứng, CPU để nén/giải nén và băng thông mạng, thường trở thành "điểm nghẽn" (bottleneck) tồi tệ nhất quyết định sự thành bại của một ứng dụng Big Data.

---

## Definition

Về mặt khái niệm, khi dữ liệu được nạp vào Spark, nó được chia ngẫu nhiên thành nhiều mảnh nhỏ (Partitions) nằm rải rác trên các Worker Nodes.
Khi bạn thực thi một hàm gọi hỏi "Gộp toàn bộ doanh thu theo từng Mã Khách Hàng", Spark buộc phải gom tất cả các giao dịch của cùng 1 khách hàng (đang nằm trên nhiều máy tính khác nhau) về chung một máy tính để có thể cộng tổng lại.

Quá trình các máy tính gửi các khối dữ liệu cho nhau thông qua Network gọi là **Shuffle**.

---

## Why it exists

Spark ưu tiên tính toán dựa trên dữ liệu tại chỗ (Data Locality) - tức là Map task chạy trực tiếp trên file log đang nằm ở đĩa nội bộ. Đây gọi là *Narrow Dependency* (phụ thuộc hẹp). 
Tuy nhiên, cấu trúc dữ liệu thế giới thực luôn đan xen. Bạn không thể thực hiện các thuật toán:
* `GROUP BY` (Gom nhóm)
* `JOIN` (Kết nối 2 bảng phân tán)
* `ORDER BY` (Sắp xếp toàn cục)
* `DISTINCT` (Loại bỏ trùng lặp)

mà không dồn các dữ liệu có chung thuộc tính Khóa (Key) về chung một vị trí vật lý. Để đảm bảo tính chính xác của các thuật toán toán học này, hệ thống buộc phải trải qua cơ chế *Wide Dependency* (phụ thuộc rộng), tức là Shuffle.

---

## How it works

Quá trình Shuffle trong Spark gồm 2 pha chính (giữa 2 Stages):

1. **Shuffle Write (Pha Map / Viết xuống đĩa)**:
   * Các Executor đang giữ dữ liệu gốc duyệt qua dữ liệu, tính toán mã băm (Hash) dựa trên cột Khóa (ví dụ `Hash(customer_id) % num_partitions`).
   * Phân loại dữ liệu thành các thùng (buckets) trong bộ nhớ đệm (buffer).
   * Tuần tự hóa (Serialize), nén (Compress) và **ghi dữ liệu xuống đĩa cứng vật lý (Local Disk)** của Worker Node thành các Shuffle Files, kèm theo file index. 
   *(Lưu ý: Dù nổi tiếng là tính toán In-Memory, riêng Shuffle thì Spark bắt buộc phải dùng đĩa cứng để tránh cạn kiệt RAM và dễ phục hồi nếu đứt kết nối mạng).*

2. **Shuffle Read (Pha Reduce / Đọc qua mạng)**:
   * Các Executor phụ trách Stage tiếp theo sẽ gửi yêu cầu (Network Request) đến tất cả các Executor ở Stage trước để "kéo" (Pull/Fetch) những phân vùng dữ liệu thuộc về trách nhiệm của mình qua mạng TCP/IP.
   * Giải nén, giải tuần tự (Deserialize) và tải dữ liệu lên RAM để tiến hành phép tính gộp (`SUM`, `JOIN`).

---

## Practical example

```python
# 1. Đọc 10GB file log máy chủ, tự động tạo ra 50 partitions rải rác (Narrow)
logs_df = spark.read.text("s3://server-logs/") 

# 2. Extract IP address
ip_df = logs_df.withColumn("ip", extract_ip_func("value"))

# 3. Gom nhóm theo IP để đếm số lượt truy cập (WIDE DEPENDENCY -> SHUFFLE XẢY RA)
# Để làm điều này, Spark sẽ sinh ra một cấu hình mặc định là 200 Shuffle Partitions
ip_count = ip_df.groupBy("ip").count()

ip_count.write.parquet("s3://output/")
```
Ở hàm `groupBy`, Spark phải chuyển dữ liệu của những dòng có chung IP (ví dụ "192.168.1.1") dù đang nằm ở máy số 1 hay số 10 về cùng một Executor. Sự luân chuyển khổng lồ này có thể làm network LAN nội bộ đạt đỉnh băng thông.

---

## Best practices

Mục tiêu số 1 của Data Engineer giỏi là **Giảm thiểu Shuffle tối đa**.

* **Điều chỉnh `spark.sql.shuffle.partitions`**: Giá trị mặc định của Spark là 200. Nếu dữ liệu của bạn tới 10TB, chia thành 200 phần thì mỗi phần sẽ quá lớn (50GB), gây OOM (Out Of Memory). Nếu dữ liệu chỉ có 10MB, chia thành 200 phần sẽ sinh ra 200 tác vụ quá nhỏ (Overhead). Nguyên tắc là cấu hình số này gấp 2-3 lần tổng số CPU Core của Cluster.
* **Lọc trước khi Shuffle (Filter Early)**: Hãy dùng `WHERE` hoặc `SELECT` loại bỏ các cột không cần thiết để khối lượng dữ liệu vận chuyển qua mạng ở mức thấp nhất.
* **Broadcast Join**: Khi Join một bảng khổng lồ (Fact) với một bảng cực nhỏ (Dimension - ví dụ dưới 10MB), hãy dùng hàm `broadcast(dim_table)`. Spark sẽ copy toàn bộ bảng nhỏ đẩy đến từng Executor (Narrow Dependency) thay vì xáo trộn (Shuffle) cả bảng khổng lồ. 

---

## Common mistakes

* **`groupByKey()` vs `reduceByKey()` trong RDD**: (Với API cũ), `groupByKey()` kéo toàn bộ dữ liệu thô qua mạng rồi mới cộng. `reduceByKey()` sẽ thực hiện cộng tổng tạm thời ở máy Local trước (Map-side Combine), làm giảm 90% lượng dữ liệu cần bay qua mạng. 
* **Sử dụng `ORDER BY` toàn cục vô ích**: Nếu bạn lưu dữ liệu chỉ để nạp xuống phân tích không cần thứ tự tuyệt đối, hãy dùng `sortWithinPartitions` thay vì `orderBy`. Lệnh `orderBy` bắt buộc Spark phải gom mọi thứ vào 1 Executor duy nhất để sắp xếp thứ tự chính xác tuyệt đối, làm sập hệ thống.

---

## Trade-offs

### Ưu điểm
* Đảm bảo tính toán chính xác 100% đối với các nghiệp vụ nhóm dữ liệu liên kết trên hệ thống phân tán.
* Cung cấp cơ chế Fault-Tolerance: Vì Shuffle Write ghi đĩa, nếu pha Read bị sập máy, máy thay thế chỉ cần kết nối tải lại từ ổ đĩa của máy Write mà không phải chạy lại toàn bộ từ đầu.

### Nhược điểm
* **Chậm chạp (Slow)**: I/O ổ cứng và tắc nghẽn mạng TCP là khắc tinh của tốc độ.
* Có thể gây ra hiện tượng lệch phân phối [Data Skew](/concepts/data-skew).

---

## When to use

* Bạn không thể tránh Shuffle khi thiết kế kho dữ liệu (Aggregation / Joins). Điều quan trọng là quản trị kích thước và hình dáng dữ liệu trước khi nó bước vào vòng Shuffle.

---

## Related concepts

* [Data Skew](/concepts/data-skew)
* [Spark Partitions](/concepts/spark-partition)
* [Spark Joins](/concepts/spark-joins)

---

## Interview questions

### 1. Shuffle trong Spark là gì và tại sao nó làm giảm hiệu năng?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết cơ chế I/O trong Big Data.
* **Gợi ý trả lời**: Shuffle là quá trình phân phối lại dữ liệu giữa các phân vùng qua mạng cụm, xảy ra ở giữa 2 giai đoạn (Stages) khi thực hiện các tác vụ wide-dependency (như Join, GroupBy). Nó giảm hiệu năng do phải tuần tự hóa dữ liệu, ghi đệm xuống đĩa cục bộ, đẩy dữ liệu khổng lồ qua băng thông mạng, và làm bộ nhớ gom rác (Garbage Collection) bị tắc nghẽn ở phía nhận.

### 2. Sự khác biệt giữa Narrow Dependency và Wide Dependency là gì?
* **Gợi ý trả lời**: 
  * Narrow: Mỗi partition ở cục cha chỉ cung cấp dữ liệu cho tối đa MỘT partition ở cục con. (ví dụ `map`, `filter`). Task chạy hoàn toàn trong bộ nhớ nội bộ, cực kì nhanh.
  * Wide: Một partition ở cục cha phải bị bẻ gãy và cung cấp dữ liệu cho NHIỀU partitions ở cục con. Gây ra quá trình Shuffle trao đổi qua mạng (ví dụ `groupBy`, `join`). Giai đoạn này làm chia tách DAG thành nhiều Stage vật lý.

---

## References

* **High Performance Spark** - Holden Karau, Rachel Warren (Chương về Understanding and Managing Shuffles).
* Spark Architecture và quá trình sinh Logical Plan.

---

## English summary

Shuffle in Apache Spark is the physically intensive mechanism of redistributing data across a cluster of nodes. Triggered by operations exhibiting "wide dependencies" such as joins, aggregations (`groupBy`), and global sorting, shuffling involves data serialization, local disk writing (Shuffle Write), and extensive network data fetching (Shuffle Read). Because it bottlenecks CPU, disk I/O, and network bandwidth, minimizing the frequency and data volume of shuffles—through filtering, map-side combining, or broadcast joins—is the cornerstone of Spark performance tuning.
