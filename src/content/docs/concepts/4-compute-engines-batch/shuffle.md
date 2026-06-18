---
title: "Shuffle trong Spark"
difficulty: "Advanced"
tags: ["shuffle", "apache-spark", "performance-tuning", "bottleneck"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Shuffle trong Spark: Điểm nghẽn hiệu năng cốt lõi cần tối ưu"
metaDescription: "Tìm hiểu chi tiết quá trình Shuffle trong Apache Spark là gì, tại sao nó gây ra độ trễ I/O và mạng lưới cực lớn, cũng như các kỹ thuật tuning hiệu năng để giảm thiểu Shuffle."
description: "Nếu đã từng làm việc với [Apache Spark](/concepts/4-compute-engines-batch/apache-spark) để xử lý dữ liệu lớn, chắc hẳn bạn đã không dưới một lần gặp phải tì..."
---



Nếu đã từng làm việc với Apache Spark để xử lý dữ liệu lớn, chắc hẳn bạn đã không dưới một lần gặp phải tình trạng ứng dụng chạy chậm bất thường hoặc bị lỗi OutOfMemory (OOM) tại các bước Transformation cụ thể. Hầu hết nguyên nhân cho những vấn đề này đều bắt nguồn từ một cơ chế cốt lõi trong xử lý phân tán: **Shuffle**.

Shuffle (Trộn dữ liệu) là quá trình đắt đỏ nhất trong Spark, xảy ra khi dữ liệu phải di chuyển chéo qua lại giữa các Node trong cụm (cluster) (ví dụ khi gọi hàm `GROUP BY` hoặc `JOIN`). Việc hiểu rõ về cơ chế hoạt động của Shuffle và cách tối ưu hóa nó chính là chìa khóa để làm chủ Apache Spark. Tối ưu hóa Spark thường xoay quanh việc hạn chế tối đa số lượng bước Shuffle và dung lượng dữ liệu phải Shuffle.

## Tại sao phải có Shuffle?



Trong kiến trúc phân tán như Spark, dữ liệu được chia nhỏ thành các **Partition** và được xử lý song song trên nhiều Executor. Tuy nhiên, nhiều operation (ví dụ: đếm số lượng sự kiện theo user) yêu cầu tất cả dữ liệu có cùng khóa (key) phải được gom lại một chỗ (một partition duy nhất) để thực hiện tính toán.

Khi dữ liệu có cùng key đang nằm rải rác ở nhiều partition trên các node khác nhau, Spark bắt buộc phải phân phối lại dữ liệu này qua mạng lưới. Quá trình trao đổi dữ liệu toàn cục này chính là Shuffle.

## Các hàm gây ra Shuffle

Một số Transformation (phép biến đổi) phổ biến yêu cầu dữ liệu phải được tổ chức lại dựa trên key sẽ kích hoạt quá trình Shuffle, được gọi là các phép toán **Wide Transformation**:

- **Nhóm dữ liệu (Grouping):** `groupByKey()`, `reduceByKey()`, `aggregateByKey()`, `combineByKey()`, `groupBy()`.
- **Nối dữ liệu (Joins):** Các loại JOIN như `join()`, `leftOuterJoin()`, `rightOuterJoin()`, trừ một số trường hợp đặc biệt như Broadcast Join hoặc dữ liệu đã được phân vùng (co-partitioned) sẵn.
- **Biến đổi tập hợp (Set operations):** `distinct()`, `intersection()`.
- **Sắp xếp (Sorting):** `sortByKey()`, `orderBy()`.
- **Phân vùng lại (Repartitioning):** `repartition()`, `coalesce()` (nếu `shuffle=true`).

## Quá trình Shuffle diễn ra như thế nào?

Shuffle không chỉ truyền dữ liệu qua mạng mà còn bao gồm nhiều hoạt động I/O đắt đỏ. Nó được chia làm hai giai đoạn (phase): **Shuffle Write** (Map side) và **Shuffle Read** (Reduce side). Cụ thể quá trình diễn ra như sau:

1. **Giai đoạn Map (Shuffle Write):**
   - Dữ liệu ở các partition hiện tại (Mapper) được duyệt và tính toán để xác định xem chúng cần đi tới phân vùng mục tiêu nào ở giai đoạn tiếp theo.
   - Các executor tiến hành ghi các tệp dữ liệu trung gian ra **Local Disk** thay vì giữ trong bộ nhớ (để tránh OOM và cho phép phục hồi nếu có lỗi). Dữ liệu thường được sắp xếp (sort) và tổ chức thành các file theo partition đích.
   - Việc phải serialize (tuần tự hóa) dữ liệu và ghi ra ổ đĩa khiến phase này tạo ra lượng **Disk I/O** rất lớn.

2. **Giai đoạn Reduce (Shuffle Read):**
   - Các executor đảm nhận giai đoạn tiếp theo (Reducer) sẽ liên hệ với MapOutputTracker (một service của Spark) để biết vị trí các tệp dữ liệu trung gian.
   - Reducer sẽ kéo (fetch) dữ liệu của chúng từ Local Disk của các Mapper thông qua mạng (Network I/O). Dữ liệu này được deserialize, sau đó được merge/sort trước khi áp dụng phép toán tổng hợp cuối cùng.
   - Quá trình kéo dữ liệu từ nhiều node khiến băng thông mạng bị chiếm dụng lớn, và nếu dữ liệu không đều (Data Skew), một reducer có thể bị OOM do kéo về quá nhiều dữ liệu.

## Tại sao Shuffle lại "Đắt đỏ"?

Shuffle tiêu tốn tài nguyên hệ thống ở nhiều khía cạnh:

1. **Network I/O:** Hàng GB đến hàng TB dữ liệu được di chuyển qua lại giữa các máy chủ trong cluster. Đây là nút thắt cổ chai vật lý cứng nhất.
2. **Disk I/O:** Việc ghi tệp tin trung gian (Shuffle Spill) xuống ổ đĩa cục bộ làm giảm tốc độ rõ rệt. Nếu ổ cứng trên node không dùng SSD, tốc độ sẽ còn chậm hơn nhiều.
3. **CPU (Serialization/Deserialization):** Spark phải chuyển dữ liệu trong memory thành định dạng byte stream để ghi ổ đĩa và gửi qua mạng, sau đó giải mã ngược lại.
4. **Memory:** Buffer bộ nhớ được sử dụng ở cả giai đoạn Write (để sắp xếp) và Read (để merge). Bộ nhớ không đủ sẽ dẫn đến Spill liên tục ra disk (Ghi tràn) khiến hiệu suất tuột dốc.

## Các chiến lược tối ưu hóa Shuffle (Tuning)

Để cải thiện hiệu năng Spark, nguyên tắc số một là **Tránh Shuffle nếu có thể**, và nguyên tắc số hai là **Giảm thiểu dữ liệu qua Shuffle**. Dưới đây là các kỹ thuật thường được áp dụng:

### 1. Sử dụng Broadcast Join thay vì Shuffle Hash/Sort Merge Join
Khi cần Join một bảng lớn với một bảng nhỏ (ví dụ: bảng Dimensions), thay vì Shuffle cả 2 bảng, hãy dùng `broadcast()`. Spark sẽ sao chép toàn bộ bảng nhỏ tới mọi Executor. Dữ liệu bảng lớn không phải di chuyển qua mạng.

### 2. Sử dụng `reduceByKey` thay vì `groupByKey`
Mặc dù kết quả có thể giống nhau, nhưng `reduceByKey` sẽ thực hiện *Pre-aggregation* (kết hợp cục bộ) ngay trên Mapper trước khi Shuffle. Điều này giảm đáng kể lượng dữ liệu cần truyền qua mạng. Ngược lại, `groupByKey` gửi toàn bộ dữ liệu thô qua mạng, rất dễ gây OOM.

### 3. Điều chỉnh số lượng phân vùng Shuffle (`spark.sql.shuffle.partitions`)
Mặc định, Spark để số lượng phân vùng cho Shuffle là `200`. Với dữ liệu siêu lớn, 200 task sẽ phải xử lý khối lượng dữ liệu khổng lồ dẫn đến Spill. Ngược lại, với lượng dữ liệu nhỏ, 200 partition lại gây ra lãng phí tài nguyên quản lý overhead. Cần tinh chỉnh thông số này dựa trên dung lượng dữ liệu, thường theo quy tắc mỗi partition dao động từ 100MB - 200MB.

Trong Spark 3.x, tính năng **Adaptive Query Execution (AQE)** đã giải quyết vấn đề này qua tính năng *Dynamically coalescing shuffle partitions*.

### 4. Lọc (Filter) dữ liệu trước khi Shuffle
Luôn thực hiện thao tác lọc các dòng không cần thiết, hoặc loại bỏ bớt các cột (select) trước khi thực hiện `join()` hoặc `groupBy()`. Lượng dữ liệu đi vào máy nghiền Shuffle càng nhỏ, ứng dụng chạy càng nhanh.

### 5. Xử lý Data Skew (Lệch dữ liệu) bằng kỹ thuật Salting
Data Skew xảy ra khi một số key có số lượng bản ghi áp đảo các key khác, khiến một số Task nhận được khối dữ liệu khổng lồ trong lúc Shuffle, trong khi các Task khác đã xong từ lâu.
Giải pháp phổ biến là thêm một hậu tố ngẫu nhiên (Salt) vào key để phân tán bớt dữ liệu ra nhiều Reducer, sau đó mới tiến hành tổng hợp cục bộ (local aggregation) rồi thực hiện tổng hợp lần cuối. Tính năng AQE trong Spark 3.0 cũng cung cấp cơ chế tự động xử lý *Skew Join*.

## Tài Liệu Tham Khảo
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* **Presto: SQL on Everything - Facebook Engineering**
