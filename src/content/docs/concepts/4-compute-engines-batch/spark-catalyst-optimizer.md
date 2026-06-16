---
title: "Catalyst Optimizer"
difficulty: "Advanced"
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Catalyst Optimizer - Data Engineering Deep Dive"
metaDescription: "Tìm hiểu chi tiết về Catalyst Optimizer, bộ não của Spark SQL: Cách biến câu lệnh SQL thành RDD vật lý tối ưu nhất qua các giai đoạn RBO, CBO và AQE."
description: "Bộ não của Spark SQL: Cách biến câu lệnh SQL hoặc DataFrame API thành kế hoạch thực thi vật lý tối ưu nhất."
---

Catalyst Optimizer là "bộ não" của Spark SQL, chịu trách nhiệm xử lý, phân tích và biến đổi các câu lệnh truy vấn (SQL, DataFrame/Dataset API) thành các Kế hoạch thực thi vật lý (Physical Execution Plan) tối ưu nhất để chạy trên RDDs. Bằng cách sử dụng ngôn ngữ lập trình hàm Scala, Catalyst cung cấp một framework mạnh mẽ dựa trên các cây (trees) và các quy tắc (rules) để thực hiện tối ưu hóa cả về mặt logic lẫn vật lý.

## 1. Vai trò của Catalyst Optimizer trong Spark

Trước khi có Catalyst và Spark SQL, người dùng phải tự tối ưu hóa mã code RDD (Resilient Distributed Dataset) của mình. Việc quyết định khi nào nên `filter`, khi nào nên `join`, hay sử dụng phép toán nào đòi hỏi kinh nghiệm và kỹ năng lập trình phức tạp.

Catalyst thay đổi điều đó bằng cách cung cấp một bộ máy trừu tượng. Người dùng chỉ cần khai báo "cái gì" họ muốn làm thông qua SQL hoặc DataFrame API (tính khai báo - declarative), và Catalyst sẽ quyết định "làm như thế nào" cho nhanh nhất và hiệu quả nhất bằng cách:

- Dịch các ngôn ngữ lập trình khác nhau (Python, Java, Scala, SQL) về cùng một kế hoạch tối ưu.
- Thực hiện các chiến lược tối ưu hóa tự động dựa trên quy tắc (Rule-based Optimization - RBO) và dựa trên chi phí (Cost-based Optimization - CBO).
- Sinh mã tự động tại thời gian chạy (Whole-Stage Code Generation).

## 2. Vòng đời xử lý truy vấn của Catalyst (Query Execution Phases)

Khi một truy vấn được gửi đến Spark, nó phải trải qua 4 giai đoạn cốt lõi của Catalyst trước khi được sinh mã và thực thi:

![Catalyst Optimizer Phases](https://databricks.com/wp-content/uploads/2018/05/Catalyst-Optimizer-diagram.png) *(Hình minh hoạ luồng hoạt động chuẩn)*

### Phân tích cú pháp (Parsing) -> Unresolved Logical Plan
Đầu tiên, Spark SQL sử dụng ANTLR (một công cụ phân tích cú pháp) để phân tích truy vấn SQL hoặc DataFrame API thành một Cây cú pháp trừu tượng (Abstract Syntax Tree - AST). Kết quả của bước này là một **Unresolved Logical Plan**.
- *Tại sao gọi là Unresolved?* Vì lúc này Catalyst chỉ mới biết các cấu trúc của câu lệnh (vd: SELECT, FROM, WHERE), nhưng chưa biết các cột và bảng có thực sự tồn tại hay không, hoặc kiểu dữ liệu của chúng là gì.

### Phân tích định danh (Analysis) -> Resolved Logical Plan
Catalyst sử dụng một thành phần gọi là `Catalog` (có thể kết nối với Hive Metastore) để kiểm tra tính hợp lệ của Unresolved Logical Plan.
- Nó kiểm tra xem các bảng (tables) và các cột (columns) có tồn tại trong cơ sở dữ liệu hay không.
- Kiểm tra kiểu dữ liệu (Data types) để đảm bảo các phép toán hợp lệ (ví dụ không thể cộng một chuỗi với một số).
- Kết quả thu được là một **Resolved Logical Plan** (hay còn gọi tắt là Logical Plan).

### Tối ưu hóa Logic (Logical Optimization) -> Optimized Logical Plan
Đây là lúc Catalyst áp dụng các tập hợp quy tắc dựa trên Heuristic (Rule-based Optimization - RBO) để tối ưu hoá Resolved Logical Plan. Kết quả là **Optimized Logical Plan**. Một số tối ưu hoá tiêu biểu bao gồm:
- **Predicate Pushdown (Đẩy điều kiện lọc xuống sớm):** Đẩy các hàm `filter` hay `where` xuống càng gần nguồn dữ liệu càng tốt để giảm lượng dữ liệu cần đọc lên bộ nhớ.
- **Column Pruning (Loại bỏ cột thừa):** Chỉ đọc các cột có tham gia vào truy vấn (SELECT, WHERE, JOIN), bỏ qua các cột không cần thiết.
- **Constant Folding (Gộp hằng số):** Tự động tính toán các biểu thức hằng số ngay lúc compile thay vì lúc chạy (Ví dụ: biến `1 + 2` thành `3`).
- **Boolean Expression Simplification:** Đơn giản hóa các biểu thức logic (ví dụ: `NOT (a > b)` thành `a <= b`).

### Lập kế hoạch vật lý (Physical Planning) -> Selected Physical Plan
Từ Optimized Logical Plan, Catalyst sẽ tạo ra một hoặc nhiều **Physical Plans** (kế hoạch thực thi vật lý) mô tả chính xác cách dữ liệu sẽ được xử lý trên cluster.
Ở giai đoạn này, Catalyst sử dụng **Cost-based Optimization (CBO)**:
- Dựa trên các số liệu thống kê (Statistics) về dữ liệu (như kích thước bảng, số dòng, giá trị min/max, số lượng giá trị duy nhất), CBO tính toán chi phí (cost) cho từng Physical Plan.
- Lựa chọn kế hoạch có chi phí thấp nhất làm **Selected Physical Plan**.
- *Ví dụ điển hình:* Quyết định chiến lược Join: Dùng `BroadcastHashJoin` (nếu có 1 bảng nhỏ) hay `SortMergeJoin` (nếu cả 2 bảng đều lớn).

### Sinh mã tự động (Code Generation)
Sau khi có kế hoạch vật lý tối ưu, Spark sử dụng **Project Tungsten** để chuyển đổi Physical Plan thành mã Java Bytecode tối ưu thông qua tính năng **Whole-Stage Code Generation**.
Thay vì gọi các hàm lồng nhau làm tốn kém chi phí (CPU overhead, virtual function dispatch), CodeGen "gộp" toàn bộ chuỗi các phép toán (vd: đọc dữ liệu -> lọc -> chiếu) thành một hàm Java duy nhất, chạy nhanh như code C++ do viết tay.

## 3. Tối ưu hoá dựa trên chi phí (Cost-Based Optimizer - CBO)

Được giới thiệu mạnh mẽ từ Spark 2.2, CBO nâng cao khả năng của Catalyst bằng cách sử dụng số liệu thống kê của bảng để ra quyết định tốt hơn, nhất là khi thực hiện JOIN nhiều bảng.

Để CBO hoạt động hiệu quả, hệ thống cần số liệu thống kê bằng cách chạy lệnh:
```sql
ANALYZE TABLE ten_bang COMPUTE STATISTICS FOR COLUMNS cot1, cot2;
```

CBO mang lại các lợi ích lớn:
- **Join Reordering (Sắp xếp lại thứ tự JOIN):** Nếu bạn join 3 bảng A, B, C. CBO tính toán kích thước của A JOIN B so với B JOIN C để quyết định phép tính nào thực hiện trước nhằm giảm thiểu kích thước dữ liệu trung gian (Intermediate Data).
- **Lựa chọn đúng phương pháp Join:** Chuyển đổi linh hoạt giữa BroadcastHashJoin, ShuffleHashJoin và SortMergeJoin.

## 4. Adaptive Query Execution (AQE) - Cuộc cách mạng trong Spark 3.x

Một nhược điểm của CBO truyền thống là nó dựa vào số liệu thống kê tĩnh (tính toán trước khi chạy). Trong thực tế, dữ liệu có thể bị phân bố lệch (skewed) hoặc các hàm User Defined Functions (UDF) làm thống kê bị sai lệch trong lúc chạy.

**AQE (Adaptive Query Execution)**, một tính năng lớn từ Spark 3.0, giải quyết vấn đề này bằng cách thu thập số liệu **ngay trong lúc đang chạy (runtime)** ở các điểm kết thúc của các Stage (thường là sau quá trình Shuffle) để tự động điều chỉnh kế hoạch thực thi cho các Stage tiếp theo.

AQE mang lại 3 tối ưu hoá đột phá:

### Dynamically Coalescing Shuffle Partitions (Gộp động các phân vùng Shuffle)
Khi người dùng để cấu hình mặc định `spark.sql.shuffle.partitions = 200`, có thể có quá nhiều phân vùng nhỏ rải rác (gây lãng phí I/O và overhead scheduling) hoặc quá ít phân vùng lớn (gây OOM).
AQE giám sát lượng dữ liệu đầu ra của shuffle và tự động gộp (coalesce) các phân vùng nhỏ liền kề thành phân vùng vừa phải, giúp cân bằng tải và tối ưu hiệu suất.

### Dynamically Switching Join Strategies (Đổi chiến lược Join động)
Giả sử có hai bảng được lên kế hoạch dùng `SortMergeJoin`. Tuy nhiên sau bước lọc dữ liệu (filter), một bảng bất ngờ thu nhỏ lại (kích thước nhỏ hơn `spark.sql.autoBroadcastJoinThreshold`).
Thay vì vẫn thực hiện SortMergeJoin nặng nề (đòi hỏi shuffle và sort), AQE sẽ đổi ngay sang `BroadcastHashJoin` ngay tại runtime.

### Dynamically Optimizing Skew Joins (Tối ưu hóa lệch dữ liệu khi Join)
Data Skew (dữ liệu lệch) là "kẻ thù số 1" gây chậm hoặc chết các Job do một vài Executor phải ôm lượng dữ liệu khổng lồ.
AQE tự động phát hiện các phân vùng bị lệch (skewed partitions) dựa trên kích thước sau giai đoạn shuffle. Nó sẽ tự động chia nhỏ (split) phân vùng bị lệch thành nhiều phần nhỏ hơn, và sao chép (replicate) dữ liệu tương ứng của bảng bên kia để join song song, loại bỏ hiện tượng thắt cổ chai (bottleneck).

## 5. Dynamic Partition Pruning (DPP)

Một tính năng ấn tượng khác cùng ra mắt trong Spark 3.0 là DPP (Tỉa phân vùng động). Trong kiến trúc Data Warehouse (Star Schema), ta thường xuyên Join bảng sự kiện lớn (Fact table) với bảng danh mục nhỏ (Dimension table).

- Truy vấn thông thường: Lọc trên bảng Dimension -> Join với bảng Fact lớn.
- **Không có DPP:** Spark phải đọc toàn bộ bảng Fact lên (Rất tốn kém), sau đó mới có thể thực hiện Join để lọc bớt.
- **Có DPP:** Spark thực hiện một truy vấn con ẩn trên bảng Dimension để lấy ra các danh sách khoá cần thiết, sau đó `push down` danh sách này xuống thành điều kiện lọc (filter) tại bước đọc bảng Fact. Bằng cách này, Spark bỏ qua (prune) việc đọc các phân vùng (partitions) của bảng Fact không thỏa mãn điều kiện. DPP mang lại mức tăng tốc hiệu năng khổng lồ (có thể gấp chục lần).

## 6. Cách đọc và hiểu Execution Plan

Để xem Catalyst đã lên kế hoạch gì cho DataFrame hoặc truy vấn SQL của bạn, hãy sử dụng `.explain()`:

```scala
// Mặc định hiển thị Physical Plan
df.explain()

// Hiển thị đầy đủ tất cả các bước (Parsed, Analyzed, Optimized, Physical)
df.explain(true) 
// Hoặc trong Spark 3.x
df.explain("extended")
```

Khi đọc Explain Plan, bạn nên đọc từ **dưới lên trên**.
* Nút dưới cùng là các nguồn lấy dữ liệu: `FileScan parquet`, `JDBCRelation`. (Hãy kiểm tra các `PushedFilters` tại đây xem Predicate Pushdown đã hoạt động chưa).
* Các bước ở giữa là các thao tác biến đổi: `Filter`, `Project`, `Exchange` (chính là Shuffle), `Sort`.
* Các bước Join: Tìm kiếm `BroadcastHashJoin`, `SortMergeJoin`. Nếu thấy `SortMergeJoin` kèm theo lượng dữ liệu quá lớn, có thể cần suy nghĩ về Skewness.
* Nếu thấy ký hiệu `*(1)` hoặc `*(2)`, điều đó có nghĩa là Whole-Stage Code Generation đang được áp dụng tại block đó.

## Tổng Kết

Catalyst Optimizer và sự tiến hoá liên tục của nó (từ RBO, CBO, Project Tungsten đến AQE) chính là lý do khiến Spark SQL duy trì vị thế dẫn đầu trong các công cụ xử lý dữ liệu Big Data. Bằng cách hiểu luồng hoạt động của Catalyst, các Kỹ sư dữ liệu (Data Engineer) có thể nắm bắt cách viết các câu lệnh hiệu quả hơn, biết cách phân tích nguyên nhân tại sao một job Spark chạy chậm, và có thể tinh chỉnh (tune) các cấu hình nâng cao một cách chuyên nghiệp.

## Tài Liệu Tham Khảo
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* [Spark SQL: Relational Data Processing in Spark](https://people.csail.mit.edu/matei/papers/2015/sigmod_spark_sql.pdf)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
