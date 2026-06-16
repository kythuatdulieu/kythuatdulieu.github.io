---
title: "Distributed Joins Mechanisms"
difficulty: "Advanced"
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Distributed Joins Mechanisms - Data Engineering Deep Dive"
metaDescription: "So sánh chi tiết các cơ chế Broadcast Join, Sort-Merge Join và Shuffle Hash Join trong hệ thống phân tán, tối ưu hóa Network I/O."
description: "So sánh chi tiết Broadcast Join, Sort-Merge Join và Shuffle Hash Join ở mức độ Network I/O, bộ nhớ, và ứng dụng thực tế."
---



Trong các hệ thống tính toán phân tán (như Apache Spark, Presto, Trino, Flink), thao tác JOIN giữa các tập dữ liệu lớn là một trong những operation đắt đỏ nhất. Khác với cơ sở dữ liệu truyền thống chạy trên một máy chủ (single-node database), dữ liệu trong hệ thống phân tán nằm rải rác trên nhiều máy chủ (nodes) khác nhau. Để nối dữ liệu, các node phải trao đổi dữ liệu cho nhau qua mạng lưới (Network I/O) – quá trình này gọi là **Shuffle**.

Tùy thuộc vào kích thước của hai bảng và cấu hình cụm, hệ thống tối ưu hóa truy vấn (Query Optimizer) sẽ chọn một trong ba cơ chế Join cốt lõi: **Broadcast Hash Join**, **Shuffle Hash Join**, và **Sort Merge Join**.

## 1. Broadcast Hash Join (BHJ)



Broadcast Hash Join (thường gọi là Broadcast Join hoặc Map-side Join) là chiến lược tối ưu nhất nhưng bị giới hạn nghiêm ngặt bởi kích thước dữ liệu.

### Nguyên lý hoạt động
Khi thực hiện join giữa một bảng rất lớn (Fact table) và một bảng rất nhỏ (Dimension table), hệ thống sẽ:
1. Đọc bảng nhỏ lên bộ nhớ của Driver node (đối với Spark).
2. Phát sóng (Broadcast) toàn bộ bảng nhỏ này tới bộ nhớ của tất cả các Worker nodes (Executors) đang chứa các phân vùng của bảng lớn.
3. Tại mỗi Executor, hệ thống sẽ xây dựng một Hash Table trong bộ nhớ cho bảng nhỏ.
4. Quét qua từng dòng của bảng lớn (đã có sẵn trên Executor) và tra cứu (probe) vào Hash Table để tìm dữ liệu khớp (matching records).

### Phân tích tài nguyên
* **Network I/O**: Không xảy ra Shuffle giữa các node cho bảng lớn. Bảng nhỏ được copy `N` lần (với `N` là số lượng executors). Tổng lượng dữ liệu qua mạng rất ít.
* **Memory**: Đòi hỏi bộ nhớ của Driver và tất cả các Executors phải đủ lớn để chứa toàn bộ bảng nhỏ (cộng thêm overhead của Hash Table).
* **CPU**: Rất thấp vì không có quá trình sắp xếp (Sorting).

### Ưu điểm
* Nhanh nhất trong tất cả các loại Join vì hoàn toàn loại bỏ được bước Shuffle tốn kém của bảng lớn.
* Không bị ảnh hưởng bởi Data Skew (lệch dữ liệu) của join key trên bảng lớn.

### Nhược điểm
* Giới hạn kích thước bảng nhỏ (Trong Spark, mặc định được cấu hình bởi `spark.sql.autoBroadcastJoinThreshold` - thường là 10MB).
* Nếu bảng nhỏ lớn hơn dung lượng bộ nhớ khả dụng, sẽ gây lỗi **Out-Of-Memory (OOM)** tại Driver hoặc Executor.

## 2. Sort-Merge Join (SMJ)

Khi cả hai bảng đều quá lớn và không thể dùng Broadcast Join, Sort-Merge Join là sự lựa chọn phổ biến và ổn định nhất. Kể từ Spark 2.3, đây là cơ chế join mặc định cho các bảng lớn.

### Nguyên lý hoạt động
Quá trình chia làm 3 giai đoạn rõ rệt:
1. **Shuffle Phase**: Cả hai bảng đều được phân chia (partition) và gửi qua mạng dựa trên giá trị băm (hash) của Join Key. Điều này đảm bảo các bản ghi có cùng Join Key từ cả hai bảng sẽ hội tụ về cùng một Node.
2. **Sort Phase**: Tại mỗi node, các bản ghi trong từng phân vùng sẽ được sắp xếp (Sort) theo Join Key.
3. **Merge Phase**: Hệ thống duy trì hai con trỏ đọc qua hai phân vùng đã được sắp xếp song song. Vì dữ liệu đã có thứ tự, hệ thống chỉ cần duyệt qua dữ liệu một lần (O(N) tại node đó) để ghép các bản ghi có cùng Join Key lại với nhau.

### Phân tích tài nguyên
* **Network I/O**: Rất lớn. Toàn bộ dữ liệu của cả hai bảng đều phải được gửi qua mạng (Full Shuffle).
* **Memory**: Sử dụng ít bộ nhớ hơn so với Hash Join. Nếu dữ liệu không vừa trong RAM, hệ thống sẽ ghi tạm (spill) xuống ổ cứng (Disk I/O).
* **CPU**: Tốn nhiều CPU cho quá trình Hashing, Serialization/Deserialization (khi gửi qua mạng), và đặc biệt là thao tác Sort (Sắp xếp).

### Ưu điểm
* Rất ổn định (Robust). Hầu như không bao giờ bị OOM nhờ cơ chế Spill-to-Disk trong quá trình Sort.
* Xử lý tốt khi hai bảng đều có dung lượng hàng Terabytes hoặc Petabytes.

### Nhược điểm
* Chậm hơn nhiều so với Broadcast Join vì chi phí Shuffle qua mạng và Disk I/O (nếu bị spill).
* Bị ảnh hưởng nghiêm trọng bởi Data Skew. Nếu một Join Key xuất hiện quá nhiều, toàn bộ dữ liệu của key đó sẽ đổ dồn về một node gây hiện tượng "nghẽn cổ chai" (Straggler).

## 3. Shuffle Hash Join (SHJ)

Shuffle Hash Join là một phương án lai giữa Sort Merge Join và Broadcast Join. Cơ chế này thường được dùng khi một bảng không đủ nhỏ để Broadcast, nhưng lại đủ nhỏ để mỗi phân vùng của nó có thể nằm lọt trong bộ nhớ sau quá trình Shuffle.

### Nguyên lý hoạt động
1. **Shuffle Phase**: Giống như SMJ, cả hai bảng đều được hash partition qua mạng theo Join Key để dữ liệu cùng Key về cùng node.
2. **Hash Phase (Build Phase)**: Tại mỗi node, thay vì Sort, hệ thống sẽ lấy tập dữ liệu của bảng nhỏ hơn (ở mức phân vùng) để xây dựng một In-Memory Hash Table.
3. **Probe Phase**: Quét qua các bản ghi thuộc phân vùng tương ứng của bảng lớn hơn, tra cứu vào Hash Table và nối dữ liệu.

### Phân tích tài nguyên
* **Network I/O**: Lớn (giống SMJ), toàn bộ dữ liệu cả 2 bảng đều bị Shuffle.
* **Memory**: Yêu cầu phân vùng của bảng nhỏ hơn phải fit hoàn toàn vào RAM của Executor.
* **CPU**: Tiết kiệm được chi phí CPU do không phải thực hiện Sort.

### Ưu điểm
* Nhanh hơn Sort-Merge Join (khi dữ liệu thỏa mãn điều kiện) vì bỏ qua được pha Sort đắt đỏ.

### Nhược điểm
* **Rủi ro OOM cao**: Nếu bảng nhỏ không phân phối đều (có Data Skew), một số phân vùng sẽ phình to và không thể tạo Hash Table trong bộ nhớ, dẫn đến lỗi OOM ngay lập tức. Spark ưu tiên SMJ hơn SHJ chính vì lý do ổn định này.

## Bảng So Sánh Các Cơ Chế Join

| Tính chất | Broadcast Hash Join | Sort Merge Join | Shuffle Hash Join |
| :--- | :--- | :--- | :--- |
| **Kích thước dữ liệu** | 1 bảng rất nhỏ, 1 bảng lớn | 2 bảng đều rất lớn | 1 bảng trung bình, 1 bảng lớn |
| **Shuffle Data (Network I/O)**| Không | Toàn bộ 2 bảng | Toàn bộ 2 bảng |
| **Yêu cầu Sort (CPU)** | Không | Có | Không |
| **Xây dựng Hash Table** | Có (Toàn bộ bảng nhỏ) | Không | Có (Từng phần của bảng nhỏ) |
| **Rủi ro OOM** | Cao (nếu cấu hình sai) | Thấp (Spill to Disk) | Rất cao (Nếu gặp Data Skew) |
| **Tốc độ (Speed)** | Nhanh nhất | Chậm nhất (ổn định nhất) | Nhanh (nếu không dính skew) |

## 4. Adaptive Query Execution (AQE) trong Spark 3+

Từ phiên bản Apache Spark 3.0, tính năng **AQE (Adaptive Query Execution)** đã mang đến cuộc cách mạng về cách hệ thống tối ưu hóa phép Join ngay trong quá trình chạy (Run-time).

Thay vì phải quyết định cơ chế Join từ lúc lên kế hoạch (Plan time), AQE sẽ thu thập số liệu (statistics) trong lúc chạy và tự động điều chỉnh:

1. **Dynamically Coalescing Shuffle Partitions**: Tự động gom các phân vùng dữ liệu quá nhỏ lại với nhau sau Shuffle, giúp giảm số lượng tasks.
2. **Dynamically Switching Join Strategies**: Nếu ban đầu Query Optimizer chọn Sort-Merge Join do bảng có vẻ lớn, nhưng sau khi qua một vài bước lọc (Filter), kích thước bảng thực tế thu nhỏ lại dưới ngưỡng `broadcastJoinThreshold`, AQE sẽ linh hoạt đổi chiến thuật từ SMJ sang Broadcast Hash Join ở giữa quá trình chạy.
3. **Dynamically Optimizing Skew Joins**: Đây là vũ khí mạnh nhất của AQE. Khi phát hiện một phân vùng quá lớn (Skew Partition) trong quá trình Shuffle, AQE sẽ tự động xé nhỏ phân vùng đó thành các phân vùng con, và sao chép (replicate) dữ liệu của Join Key tương ứng từ bảng bên kia. Điều này giúp cân bằng tải và loại bỏ hiện tượng "Straggler task".

## 5. Kỹ thuật xử lý Data Skew thủ công (Salting)

Khi bạn không có AQE (hoặc sử dụng các engine không tự động xử lý skew), việc Join một tập dữ liệu bị lệch (vd: quá nhiều giá trị null, hoặc một tập trung vào một id khách hàng cụ thể) sẽ làm treo cụm máy. Kỹ thuật phổ biến để giải quyết là **Salting**.

**Cách Salting hoạt động:**
1. Trên bảng lớn (bảng bị lệch): Thêm một cột khóa giả bằng cách gán thêm một số ngẫu nhiên (vd từ 1 đến 10) vào Join Key. (`key_skewed` -> `key_skewed_1`, `key_skewed_4`, v.v...)
2. Trên bảng nhỏ (Dimension table): Nhân bản các bản ghi lên 10 lần (Explode), tương ứng với các salt từ 1 đến 10. (`key_skewed` -> `key_skewed_1`, `key_skewed_2`, ... `key_skewed_10`).
3. Thực hiện Join theo khóa mới (`original_key + salt`). Nhờ việc chia nhỏ ngẫu nhiên, dữ liệu ở key bị lệch sẽ được phân tán đều cho 10 nodes khác nhau để xử lý, loại bỏ hoàn toàn nút thắt cổ chai.

## Tài Liệu Tham Khảo

* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* **Presto: SQL on Everything - Facebook Engineering**
