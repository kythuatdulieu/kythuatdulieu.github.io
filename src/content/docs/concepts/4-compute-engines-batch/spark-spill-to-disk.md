---
title: "Troubleshooting: Spark Spill to Disk & Memory Tuning"
description: "Hướng dẫn chi tiết về hiện tượng Spill to Disk trong Apache Spark: Nguyên nhân, Hậu quả, Cách nhận biết qua Spark UI và Các phương pháp tối ưu (Tuning) để xử lý dứt điểm."
---



Apache Spark nổi tiếng với khả năng xử lý In-Memory (trên RAM) cực nhanh. Tuy nhiên, RAM không phải là vô hạn. Khi một Executor không đủ RAM để chứa dữ liệu của một vách ngăn (Partition) trong quá trình tính toán, Spark bắt buộc phải xả bớt dữ liệu tạm thời xuống ổ cứng (Disk). Hiện tượng này gọi là **Spill to Disk** (Tràn bộ nhớ xuống đĩa).

## 1. Bản Chất Hoạt Động Của Memory Trong Spark



Trước khi đi sâu vào Spill, chúng ta cần hiểu cách Spark quản lý bộ nhớ. Bộ nhớ của một Executor (được cấp phát qua `spark.executor.memory`) chia thành các vùng chính, nhưng quan trọng nhất liên quan đến Spill là **Execution Memory**:

- **Execution Memory:** Dành cho các tính toán (Computation) như Shuffles, Joins, Sorts và Aggregations.
- **Storage Memory:** Dành cho việc lưu trữ cache dữ liệu (Cached data) và broadcast variables.

Kể từ Spark 1.6+ (Unified Memory Management), giới hạn giữa hai vùng này linh hoạt. Execution Memory có thể "mượn" không gian từ Storage Memory và ngược lại. Tuy nhiên, nếu Execution Memory đã sử dụng hết không gian khả dụng và không thể mượn thêm (ví dụ vì Storage cũng đang chứa dữ liệu cần thiết không thể bị giải phóng), Spark sẽ phải lưu phần dữ liệu đang xử lý dở dang xuống ổ cứng thay vì ném ra lỗi Out of Memory (OOM) để tiến trình vẫn có thể hoàn thành.

## 2. Khi Nào Xảy Ra Spill? (Các Tác Vụ Dễ Gây Spill)

Spill thường xảy ra ở các phép toán yêu cầu lượng lớn dữ liệu của một partition phải nằm trọn trong bộ nhớ để xử lý. Dưới đây là các tác vụ phổ biến nhất:

- **Sort (Sắp xếp - `ORDER BY`):** Khi gọi `ORDER BY`, Spark sử dụng cấu trúc dữ liệu External Sorter. Nếu lượng dữ liệu cần sắp xếp trong một partition vượt quá giới hạn Execution Memory khả dụng, một phần của dữ liệu sẽ được ghi tạm (spill) xuống đĩa, sau đó merge lại.
- **Aggregation (Gộp nhóm - `GROUP BY`):** Hàm `GROUP BY` tạo ra các Hash Map trong RAM để thực hiện đếm/tính tổng các bản ghi có chung key. Nếu số lượng nhóm (distinct keys) quá lớn (High Cardinality), Hash Map sẽ phình to quá mức giới hạn bộ nhớ, buộc phần vượt quá phải ghi xuống đĩa.
- **Join (Kết bảng):**
  - **Sort-Merge Join (SMJ):** Đây là thuật toán Join mặc định và phổ biến của Spark cho các bảng lớn. SMJ yêu cầu cả hai bảng phải được Shuffle và Sort theo Join Keys trước khi hợp nhất. Quá trình Sort dữ liệu cực kỳ dễ gây Spill nếu kích thước mỗi partition quá lớn.
  - **Hash Join:** Tương tự Aggregation, nếu bảng xây dựng (Build Table) trong Hash Join không vừa trong bộ nhớ, Spill cũng sẽ xảy ra.

## 3. Hậu Quả Của Spill ("Spill is a silent killer")

Khác với lỗi OOM (Out of Memory) làm sập (crash) ứng dụng ngay lập tức, Spill nguy hiểm và khó nhận biết hơn vì chương trình **vẫn chạy thành công, nhưng tốc độ chậm đi theo cấp số nhân**.

- **I/O Bottleneck:** Thao tác đọc/ghi trên ổ cứng (Disk I/O) có độ trễ lớn và thông lượng thấp hơn hàng vạn lần so với thao tác trực tiếp trên RAM.
- **CPU Overhead (Chi phí CPU):** Khi dữ liệu tràn xuống đĩa, nó không được ghi dưới dạng thô. Spark phải thực hiện quá trình Serialize (Biến đổi cấu trúc Java object thành chuỗi byte) và Compress (Nén dữ liệu). Sau đó, khi cần dùng lại, Spark phải Decompress và Deserialize. Điều này ngốn một lượng lớn tài nguyên CPU. Thường bạn sẽ thấy CPU của Executor tăng vọt lên 100% nhưng tiến độ (progress) của task lại cực kỳ chậm.
- **Nguy cơ hết dung lượng đĩa:** Ở một số cấu hình Cluster cấp phát dung lượng đĩa cục bộ nhỏ cho các Worker Node, việc Spill lượng lớn dữ liệu có thể làm đầy ổ cứng của Node, dẫn đến tình trạng `No space left on device` và làm chết Executor.

## 4. Cách Nhận Biết Spill Qua Spark UI

Để xác định Spark application có đang bị Spill hay không, bạn cần theo dõi Spark UI:

1. Vào tab **SQL / DataFrame** hoặc tab **Stages**.
2. Chọn một Query hoặc Stage đang chạy chậm bất thường.
3. Trong phần **Details for Stage** hoặc trong sơ đồ DAG, chú ý đến hai chỉ số sau ở mức Task/Stage:
   - **Spill (Memory):** Kích thước dữ liệu trong RAM được xác định là cần xả xuống đĩa. Đây là kích thước *trước* khi bị serialize và nén.
   - **Spill (Disk):** Kích thước file thực tế được ghi lên đĩa cứng. Đây là kích thước *sau* khi serialize và nén. Do quá trình nén, **Spill (Disk)** luôn nhỏ hơn đáng kể so với **Spill (Memory)**.

> 💡 **Tip:** Nếu cột Spill hiển thị giá trị hàng chục GB, đó là báo động đỏ về hiệu năng. Mức Spill an toàn thường chỉ xoay quanh mức vài chục đến vài trăm MB tùy vào dung lượng RAM hiện có.

## 5. Các Chiến Lược Tối Ưu (Tuning) & Khắc Phục Spill

Để khắc phục Spill, mục tiêu cốt lõi là làm sao lượng dữ liệu xử lý của mỗi Task (tương ứng với một Partition) vừa vặn trong RAM của Executor.

### Phương Pháp 1: Tăng Số Lượng Partitions (Tăng độ song song)
Đây là cách đơn giản, ít tốn kém và hiệu quả nhất trong đa số trường hợp.

- **Vấn đề:** Mặc định, cấu hình `spark.sql.shuffle.partitions` là `200`. Nếu lượng dữ liệu đi qua một phép Shuffle là `100 GB`, mỗi partition sẽ chịu tải trung bình `100GB / 200 = 500 MB`. Việc đưa 500 MB dữ liệu dạng object vào RAM (khi bung ra có thể tới hơn 1 GB) có rủi ro Spill rất cao.
- **Giải pháp:** Tăng chỉ số này lên. Ví dụ, thiết lập `spark.sql.shuffle.partitions = 2000`, lúc này mỗi partition chỉ còn `50 MB`, rất dễ xử lý nhanh gọn trong bộ nhớ.
- **Rule of thumb:** Cố gắng điều chỉnh cấu hình Shuffle Partitions sao cho mỗi phân vùng sau Shuffle có kích thước dao động quanh mức **100 MB - 200 MB**.

### Phương Pháp 2: Khắc Phục Data Skew (Dữ Liệu Bị Lệch)
Đây là nguyên nhân gây Spill khó chịu nhất. Nếu bạn thấy có 200 Tasks, trong đó 199 Tasks hoàn thành trong vài giây (không bị Spill), nhưng có 1 Task duy nhất mất hàng giờ và Spill ra đĩa hàng GB, thì chắc chắn dữ liệu bị Data Skew.

- **Vấn đề:** Một hoặc một vài "Key" (như giá trị `null`, mã ID phổ biến) trong quá trình `GROUP BY` hoặc `JOIN` có tần suất xuất hiện quá lớn. Toàn bộ lượng dữ liệu của key đó sẽ bị đẩy về cùng 1 Partition (1 Task). Trong trường hợp này, việc tăng cấu hình RAM sẽ không bao giờ là đủ.
- **Giải pháp:** 
  - **Lọc bỏ dữ liệu rác:** Lọc bỏ các `null` keys hoặc các bản ghi không hợp lệ trước khi Join/Aggregate.
  - **Kỹ thuật Salting:** Thêm một tiền tố ngẫu nhiên (ví dụ từ 1 đến 10) vào các Key bị lệch để phân tán dữ liệu của key đó ra 10 Partitions khác nhau, thực hiện gộp (aggregate) từng phần, sau đó sum/aggregate gộp lại ở bước cuối cùng.
  - **Bật Adaptive Query Execution (AQE):** Từ Spark 3.0+, bạn nên kích hoạt `spark.sql.adaptive.enabled = true` và `spark.sql.adaptive.skewJoin.enabled = true`. AQE sẽ tự động phát hiện các Partitions bị lệch ở runtime và chia nhỏ chúng thành các Tasks bé hơn để cân bằng tải.

### Phương Pháp 3: Tối Ưu Chiến Lược Join (Sử dụng Broadcast Join)
Nếu Spill xảy ra ở bước Sort trong thuật toán Sort-Merge Join, bạn có thể xem xét tránh Shuffle hoàn toàn nếu điều kiện cho phép.

- **Giải pháp:** Nếu một trong hai bảng có kích thước đủ nhỏ (ví dụ dưới 1 GB), hãy ép Spark sử dụng **Broadcast Hash Join** thay vì Sort-Merge Join bằng cách dùng hint `/*+ BROADCAST(table_name) */` hoặc cấu hình `spark.sql.autoBroadcastJoinThreshold` phù hợp. 
- Broadcast Hash Join gửi toàn bộ bảng nhỏ đến các Executor đang xử lý bảng lớn, bỏ qua hoàn toàn quá trình Shuffle và Sort, giúp loại bỏ hoàn toàn rủi ro Spill.

### Phương Pháp 4: Tăng RAM hoặc Điều Chỉnh Phân Bổ Bộ Nhớ
Khi đã thử các cách trên (dữ liệu không Skew, đã tăng Partitions đầy đủ) nhưng vẫn Spill, bạn mới tính đến việc mở rộng tài nguyên hoặc điều chỉnh tỉ lệ cấu hình memory:

- **Tăng RAM (Scale Up):** Tăng dung lượng `spark.executor.memory`. Ví dụ: từ `4g` lên `8g` hoặc `16g`. Tuy nhiên, cẩn trọng với việc tăng chi phí hạ tầng (Cloud cost) và overhead của Java Garbage Collection (GC) khi cấp phát quá nhiều RAM cho một JVM.
- **Giảm Storage Fraction:** Thông số `spark.memory.storageFraction` (mặc định 0.5) quyết định lượng bộ nhớ ưu tiên cho việc lưu cache. Nếu pipeline của bạn tập trung biến đổi dữ liệu nặng nề (heavy transformations/joins) và ít dùng hàm `cache()`, bạn nên cấu hình giảm biến số này xuống (ví dụ: `0.2` hoặc `0.3`) để nhường tối đa RAM cho Execution Memory thực hiện các tác vụ tính toán mà không phải Spill.

## 6. Lời Kết

Spill to Disk là rào cản ngăn hệ thống Spark phát huy tốc độ thực sự của kiến trúc phân tán In-Memory. Bằng việc giám sát thường xuyên qua Spark UI và áp dụng các kỹ thuật như điều chỉnh số Partitions, tối ưu thuật toán Join hay khắc phục Data Skew, bạn có thể giải quyết dứt điểm tình trạng này. Hãy luôn nhớ: thay vì mù quáng "tăng thêm RAM", một người Data Engineer giỏi sẽ tìm cách làm mượt mà luồng dữ liệu (data flow) bên trong hệ thống.

## Tài Liệu Tham Khảo

* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* **Presto: SQL on Everything - Facebook Engineering**
