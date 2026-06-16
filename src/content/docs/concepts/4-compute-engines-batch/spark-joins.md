---
title: "Các loại Join trong Spark"
difficulty: "Advanced"
tags: ["spark-joins", "broadcast-hash-join", "shuffle-hash-join", "sort-merge-join", "aqe"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Spark Joins: Broadcast Hash Join, Shuffle Hash Join và Sort Merge Join"
metaDescription: "Phân tích chi tiết các chiến lược kết nối dữ liệu (Joins) vật lý cốt lõi trong Apache Spark: Broadcast Hash Join, Shuffle Hash Join và Sort Merge Join. Hướng dẫn tối ưu hóa hiệu suất và khắc phục OOM."
description: "Trong xử lý dữ liệu lớn (Big Data) với Apache Spark, phép nối bảng (Join) là một trong những thao tác tốn kém nhất. Hiểu rõ cách Spark thực hiện Join dưới tầng vật lý sẽ giúp bạn tránh được lỗi OOM và tối ưu hóa tốc độ truy vấn đáng kể."
---



Trong lập trình cơ sở dữ liệu nói chung và xử lý dữ liệu lớn (Big Data) nói riêng, phép nối bảng (Join) luôn là một trong những hoạt động phổ biến và phức tạp nhất. Khi xử lý dữ liệu lớn trên hệ thống phân tán như Apache Spark, việc thực thi Join tốn kém rất nhiều tài nguyên mạng (network I/O) và tính toán (CPU) do yêu cầu phải trao đổi dữ liệu giữa các node (thao tác Shuffle).

Việc chọn sai thuật toán Join hoặc cấu hình Spark không phù hợp thường là nguyên nhân chính dẫn đến các lỗi kinh điển như **Out Of Memory (OOM)**, **Data Skew** (lệch dữ liệu), hoặc **Thời gian chạy quá lâu**. 

Bài viết này sẽ đi sâu vào các chiến lược Join vật lý (Physical Join Strategies) mà Spark sử dụng để thực thi các câu truy vấn Join, cách Spark Catalyst Optimizer lựa chọn thuật toán, cũng như các mẹo tối ưu hóa trong thực tế.

---

## 1. Logical Joins vs Physical Joins



Khi bạn viết một truy vấn Spark SQL hoặc DataFrame API (ví dụ: `df1.join(df2, "id", "inner")`), bạn đang chỉ định một **Logical Join**. Logical Join định nghĩa *bạn muốn làm gì* (Inner, Outer, Left, Right, Cross join).

Tuy nhiên, Spark thực sự làm công việc đó *như thế nào* trong môi trường phân tán được định nghĩa bởi **Physical Join**. Apache Spark hỗ trợ 5 chiến lược thực thi Join vật lý chính:
1. **Broadcast Hash Join (BHJ)**
2. **Shuffle Hash Join (SHJ)**
3. **Sort Merge Join (SMJ)**
4. **Cartesian Product Join (CPJ)**
5. **Broadcast Nested Loop Join (BNLJ)**

Trong đó, BHJ, SHJ và SMJ là 3 chiến lược quan trọng và được sử dụng nhiều nhất dựa trên phép nối theo điều kiện cân bằng (Equi-join).

---

## 2. Broadcast Hash Join (BHJ)

Broadcast Hash Join (hay còn gọi là Map-Side Join) là chiến lược Join hiệu quả nhất trong Spark. Nó được thiết kế để áp dụng cho trường hợp bạn cần join một **bảng rất lớn** với một **bảng rất nhỏ**.

### Cơ chế hoạt động
Thay vì chia đều cả hai bảng ra các node (Shuffle), Spark sẽ:
1. Gửi (Broadcast) toàn bộ dữ liệu của bảng nhỏ đến tất cả các Executor.
2. Trên mỗi Executor, Spark xây dựng một Hash Table từ dữ liệu bảng nhỏ trong bộ nhớ.
3. Executor sẽ đọc từng partition của bảng lớn và tra cứu vào Hash Table (của bảng nhỏ) để thực hiện kết nối.

### Đặc điểm & Ưu nhược điểm
* **Ưu điểm:** Tốc độ rất nhanh vì **không có quá trình Shuffle** (không truyền dữ liệu qua mạng lớn) và cũng không cần phải Sort (Sắp xếp) dữ liệu.
* **Nhược điểm:** Yêu cầu bảng nhỏ phải vừa đủ nhỏ để nằm gọn trong bộ nhớ của từng Executor và bộ nhớ của Driver (vì Driver là nơi thu thập bảng nhỏ rồi phân phối xuống Executor). Nếu bảng "nhỏ" vượt quá giới hạn bộ nhớ, bạn sẽ gặp lỗi `OutOfMemoryError`.

### Cấu hình
Spark sử dụng tham số `spark.sql.autoBroadcastJoinThreshold` để tự động quyết định xem một bảng có nên được Broadcast hay không. Kích thước mặc định thường là `10MB`. Bạn có thể tăng giá trị này lên (ví dụ: 100MB) nhưng hãy cẩn thận với bộ nhớ:

```python
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", 100 * 1024 * 1024) # 100MB
```

Trong code thực tế, bạn cũng có thể chủ động ép Spark dùng BHJ bằng cách sử dụng hint `broadcast`:

```python
from pyspark.sql.functions import broadcast

# Ép bảng df_small được broadcast
result_df = df_large.join(broadcast(df_small), "id")
```

---

## 3. Sort Merge Join (SMJ)

Từ Spark 2.3 trở đi, Sort Merge Join (SMJ) là thuật toán mặc định cho việc join hai **bảng có kích thước lớn** (khi không bảng nào thỏa mãn điều kiện để sử dụng Broadcast). 

### Cơ chế hoạt động
Quá trình diễn ra theo 3 bước chính:
1. **Shuffle:** Dữ liệu của cả hai bảng được phân phối lại qua mạng (Shuffle) giữa các Executor sao cho các dòng có cùng khóa Join (Join key) sẽ nằm cùng trên một partition.
2. **Sort:** Tại mỗi partition, Spark sẽ tiến hành sắp xếp dữ liệu của cả hai bảng theo thứ tự của khóa Join.
3. **Merge:** Hai con trỏ sẽ lần lượt chạy qua các dòng của hai bảng đã được sắp xếp để hợp nhất (Merge) những dòng có cùng khóa Join.

### Đặc điểm & Ưu nhược điểm
* **Ưu điểm:** Khả năng xử lý lượng dữ liệu khổng lồ vì nó không yêu cầu phải chứa toàn bộ dữ liệu vào bộ nhớ tại một thời điểm như Hash Join. 
* **Nhược điểm:** Hoạt động Shuffle và đặc biệt là Sort tốn cực kỳ nhiều tài nguyên (I/O, Network, CPU). Nếu dữ liệu bị lệch (Data Skew), một partition có thể mất rất lâu để Sort, gây ra hiện tượng bottleneck.

### Cấu hình
SMJ được bật mặc định thông qua cấu hình `spark.sql.join.preferSortMergeJoin = true`.

---

## 4. Shuffle Hash Join (SHJ)

Shuffle Hash Join là một thuật toán trung gian giữa BHJ và SMJ.

### Cơ chế hoạt động
1. **Shuffle:** Tương tự SMJ, dữ liệu cả hai bảng được băm (hash) theo khóa Join và phân phối lại giữa các Executor.
2. **Hash Join:** Sau khi Shuffle, đối với mỗi partition, dữ liệu bảng nhỏ hơn sẽ được dùng để tạo một in-memory Hash Table. Dữ liệu bảng lớn hơn trên cùng partition đó sẽ chạy qua và quét Hash Table này để join dữ liệu (giống với bước tra cứu của BHJ).

### Khi nào thì Spark chọn SHJ?
Trong các bản Spark cũ, SHJ từng đóng vai trò quan trọng. Tuy nhiên sau này, Spark ưu tiên SMJ hơn vì SMJ ít rủi ro OOM hơn trên các partition khổng lồ. 

Để Catalyst Optimizer chọn SHJ thay vì SMJ, thường cần các điều kiện:
* `spark.sql.join.preferSortMergeJoin` bị tắt (`false`).
* Kích thước bảng sau khi chia partition phải đủ nhỏ để nằm vừa trong bộ nhớ Executor (để tạo Hash Table).
* Kích thước bảng phải chênh lệch ít nhất 3 lần để bù đắp lại chi phí khởi tạo Hash Table.

---

## 5. Các Loại Join Khác (Non-Equi Joins)

Các chiến lược Join như BHJ, SHJ, và SMJ chỉ áp dụng được đối với các câu lệnh **Equi-Join** (Join bằng phép `=`). Đối với các điều kiện **Non-Equi-Join** (ví dụ: `>`, `<`, `>=`, `<=`), Spark buộc phải dùng hai thuật toán đắt đỏ hơn:

### Broadcast Nested Loop Join (BNLJ)
Giống như vòng lặp lồng nhau truyền thống: Spark sẽ Broadcast một bảng tới tất cả các partition của bảng còn lại. Sau đó so sánh từng dòng với nhau (Nested Loop). Nó siêu chậm (O(M * N)), nhưng được hỗ trợ vì nó là giải pháp cuối cùng (fallback) cho mọi loại Join.

### Cartesian Product Join (CPJ)
Hay còn gọi là Cross Join. Nó sinh ra tích Đề Các của cả hai bảng. Nếu không có điều kiện Join, `A(100 dòng)` cross join `B(100 dòng)` sẽ sinh ra 10.000 dòng. Thao tác này cực kỳ "nguy hiểm" và Spark bắt buộc bạn phải bật tuỳ chọn `spark.sql.crossJoin.enabled = true` hoặc dùng `crossJoin()` API để chạy.

---

## 6. Lựa chọn chiến lược Join của Spark Catalyst Optimizer

Khi nhận một truy vấn Join, công cụ tối ưu hóa Catalyst Optimizer của Spark sẽ xác định kích thước dữ liệu và quyết định loại Join. Dưới đây là thứ tự ưu tiên tóm tắt (dành cho Equi-join):

1. **Broadcast Hash Join:** Sẽ được chọn nếu có hint `broadcast` hoặc kích thước của một bảng nhỏ hơn ngưỡng `spark.sql.autoBroadcastJoinThreshold`.
2. **Sort Merge Join:** Nếu điều kiện trên không thỏa mãn, SMJ sẽ được ưu tiên (nếu keys có khả năng sort).
3. **Shuffle Hash Join:** Sẽ được chọn thay vì SMJ nếu `spark.sql.join.preferSortMergeJoin` là false và cấu trúc dữ liệu partition đủ để dựng in-memory Hash table.
4. Cuối cùng, nếu join không có điều kiện cân bằng (Non-Equi), nó sẽ fallback về BNLJ hoặc CPJ.

---

## 7. Ảnh hưởng của Adaptive Query Execution (AQE) trong Spark 3.x

Bắt đầu từ Spark 3.0, **Adaptive Query Execution (AQE)** thay đổi đáng kể cách Spark quản lý Join. Với AQE, Spark có khả năng "đổi ý" (re-plan) kế hoạch thực thi ngay trong lúc (runtime) dữ liệu đang chạy:

* **Tự động chuyển đổi SMJ sang BHJ:** Ban đầu, Catalyst ước tính một bảng là 20MB nên chọn SMJ. Tuy nhiên, sau bước filter trước join, kích thước bảng giảm xuống còn 8MB. AQE phát hiện ra sự thay đổi kích thước thực tế này và lập tức **chuyển SMJ thành Broadcast Hash Join** ở giữa quá trình, cải thiện tốc độ đáng kể.
* **Tự động tối ưu Data Skew (Skew Join):** AQE tự động phát hiện nếu có một partition bị lệch (quá to). Thay vì bắt một Task chết mòn do quá tải dữ liệu, AQE sẽ cắt nhỏ partition bị lệch đó và kết hợp với phần được broadcast từ bảng kia. Điều này giải quyết bài toán Data Skew Join kinh điển trong Spark.

Bạn có thể kích hoạt AQE bằng cấu hình (thường được bật mặc định trong Spark 3.2+):
```python
spark.conf.set("spark.sql.adaptive.enabled", "true")
```

---

## 8. Lời Khuyên Thực Tế Khi Tối Ưu Hóa Joins

1. **Luôn ưu tiên Broadcast Hash Join** khi có thể. Đừng ngại tăng ngưỡng `autoBroadcastJoinThreshold` một chút, nhưng hãy luôn đảm bảo cấp đủ bộ nhớ cho Executor và Driver.
2. **Sử dụng AQE trong Spark 3:** Luôn bật AQE. Nó là giải pháp thay thế thông minh giúp giảm thiểu thời gian gỡ lỗi Data Skew.
3. **Lọc dữ liệu sớm:** Thực hiện `filter` và `select` loại bỏ các cột không cần thiết trước khi Join, giúp giảm lượng dữ liệu qua Shuffle và bộ nhớ.
4. **Bucketing cho Sort Merge Join:** Nếu hai bảng khổng lồ thường xuyên được Join với nhau bằng cùng một key. Hãy xem xét lưu trữ dưới dạng **Bucketing**. Khi hai bảng có cùng cấu trúc Bucket theo cùng key, quá trình Join có thể **bỏ qua hoàn toàn bước Shuffle** và chỉ việc thực hiện Sort-Merge tại chỗ (Co-partitioned join).
5. **Chú ý null key:** Các giá trị `null` ở cột Join sẽ đổ hết về cùng một partition và gây ra Data Skew nghiêm trọng. Nếu cột Join có nhiều `null`, hãy filter bỏ chúng hoặc thay bằng giá trị ngẫu nhiên trước khi thực hiện SMJ.

---

## Tài Liệu Tham Khảo
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* **Presto: SQL on Everything - Facebook Engineering**
