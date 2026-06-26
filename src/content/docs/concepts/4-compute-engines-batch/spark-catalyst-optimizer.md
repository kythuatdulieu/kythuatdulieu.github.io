---
title: "Catalyst Optimizer"
difficulty: "Advanced"
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Spark Catalyst Optimizer: RBO, CBO & Tungsten Code Generation"
metaDescription: "Đi sâu vào kiến trúc Catalyst Optimizer của Spark SQL. Quá trình biến đổi từ AST sang Logical Plan, Physical Plan, và Whole-Stage Code Gen."
description: "Catalyst Optimizer là bộ não Compiler đằng sau Spark SQL. Nó không chỉ phân tích câu lệnh SQL mà còn viết lại (rewrite) kiến trúc thực thi vật lý nhằm triệt tiêu I/O rác."
---

Một trong những sai lầm lớn nhất của các kỹ sư mới làm quen với Apache Spark là tư duy thao tác từng dòng (như MapReduce truyền thống). Với API DataFrame/Dataset và Spark SQL, Spark mang tính chất **Khai báo (Declarative)**: Bạn chỉ bảo Spark "cái cần lấy", còn việc "Làm thế nào để lấy nhanh nhất với ít disk I/O nhất" là nhiệm vụ của **Catalyst Optimizer**.

Catalyst không chỉ là một bộ lập lịch, nó thực chất là một **Trình biên dịch (Compiler)** được viết bằng Scala, sử dụng Functional Programming (pattern matching, immutable trees) để thực hiện hàng trăm quy tắc viết lại truy vấn (Query Rewriting).

## 1. Vòng Đời 4 Bước Chuyển Đổi Truy Vấn (Query Execution Phases)

Cho dù bạn gọi mã bằng PySpark, Scala, hay SQL thuần túy, tất cả đều bị phân giải thành một luồng biên dịch chung bên trong Catalyst.

![Catalyst Optimizer Phases](/images/4-compute-engines-batch/catalyst-optimizer.png)
*Luồng xử lý 4 giai đoạn của Catalyst Optimizer, biến đổi từ cây AST chưa phân giải đến mã Java Bytecode vật lý. (Nguồn: Databricks)*

### Bước 1: AST và Cây chưa phân giải (Unresolved Logical Plan)
Khi bạn `spark.sql("SELECT name FROM users")`, Spark dùng thư viện ANTLR 4 để parse chuỗi SQL thành một Cây cú pháp trừu tượng (AST).
- Catalyst gọi đây là **Unresolved Logical Plan** vì nó hoàn toàn chưa biết bảng `users` hay cột `name` có tồn tại trong bộ nhớ hoặc Storage hay không.

### Bước 2: Phân giải qua Catalog (Analyzed Logical Plan)
Catalyst tra cứu **Session Catalog** (hoặc Hive Metastore) để:
- Ánh xạ bảng `users` tới đường dẫn S3/HDFS thực tế (ví dụ: `s3://bucket/data/users.parquet`).
- Xác thực Schema và kiểu dữ liệu (Data Type). Nếu bạn lấy kiểu Int cộng với String, Spark văng lỗi ở giai đoạn này.
Kế hoạch lúc này trở thành **Analyzed Logical Plan**.

### Bước 3: Tối Ưu Hóa Logic Dựa Trên Quy Tắc (RBO - Optimized Logical Plan)
Đây là nơi Catalyst áp dụng các bộ quy tắc (Heuristic Rules) bằng Rule-based Optimizer (RBO). Có hàng chục quy tắc mạnh mẽ:
- **Predicate Pushdown (Đẩy bộ lọc xuống):** Nếu câu SQL có `WHERE age > 18`, Catalyst sẽ "đẩy" điều kiện này thẳng xuống Source (như tầng đọc của file Parquet/Iceberg). Chỉ những dữ liệu > 18 mới được load vào bộ nhớ, tiết kiệm hàng chục GB I/O.
- **Column Pruning (Tỉa cột):** Tự động vứt bỏ các cột không dùng ở hàm `SELECT`, giảm mạnh chi phí Serialize bộ nhớ.
- **Constant Folding:** Biến `WHERE date = '2026-06-26' + INTERVAL 1 DAY` thành một hằng số đã được tính trước ở Compile time để tiết kiệm CPU tại Runtime.

### Bước 4: Tối Ưu Hóa Vật Lý Dựa Trên Chi Phí (CBO - Physical Planning)
Từ Optimized Logical Plan, Catalyst sẽ tạo ra hàng loạt các kịch bản thực thi khác nhau. Ví dụ: Join hai bảng thì có thể dùng `SortMergeJoin`, `BroadcastHashJoin`, hay `ShuffleHashJoin`.

Spark đưa các kịch bản này vào **Cost-Based Optimizer (CBO)**. CBO thu thập Table Statistics (Kích thước Byte, số dòng) để gán cho mỗi node một "Điểm chi phí I/O & CPU". Physical Plan nào có tổng Cost thấp nhất sẽ được chọn.

## 2. Sinh Mã Tự Động Toàn Trình (Whole-Stage Code Generation)

Một khi Kế hoạch Vật lý (Physical Plan) chốt xong, nó sẽ được chuyển giao cho **Project Tungsten**. Tungsten không diễn dịch (interpret) từng dòng tính toán, mà nó áp dụng **Whole-Stage Code Generation**.

**Trade-off của Iterator Model cũ (Volcano Model):**
Trong quá khứ, mỗi phép toán (Filter, Project) là một hàm độc lập. Dữ liệu đi qua chuỗi các node phải trải qua hàm gọi ảo (Virtual Function Call) liên tục, phá hủy CPU Cache (L1/L2).

**Cách Tungsten giải quyết:**
Nó "Gộp" toàn bộ chuỗi Pipeline của Catalyst (Ví dụ: Đọc File -> Filter -> Select) thành một hàm Java lớn (Single Function). Mã Java này sau đó được biên dịch sang Bytecode bằng trình biên dịch Janino siêu tốc ngay lúc chạy (Runtime).
Điều này loại bỏ hoàn toàn Overhead của CPU, giúp Code Spark SQL chạy với tốc độ tiệm cận với Code C++ được tối ưu hóa thủ công (Bare-Metal Speed).

```scala
// Quan sát mã sinh (Generated Code) của Spark bằng explain
df.filter("age > 18").select("name").explain("codegen")
// Ký hiệu *(1), *(2) trong bảng Physical Plan chính là ranh giới của các Whole-Stage Code Gen Block.
```

## 3. Kiến Trúc Cao Cấp: Dynamic Partition Pruning (DPP)

Được phát hành vào Spark 3.0, **DPP (Tỉa phân vùng động)** là bước tiến lớn của Catalyst phục vụ Data Warehousing (Star Schema).

**Scenario: Join bảng Fact siêu lớn (Partition theo ngày) và bảng Dimension nhỏ.**
```sql
SELECT f.revenue 
FROM fact_sales f 
JOIN dim_store d ON f.store_id = d.id 
WHERE d.region = 'APAC';
```
Bình thường, Catalyst không thể *Push-down* điều kiện `d.region = 'APAC'` xuống bảng Fact vì bảng Fact không có cột `region`. Điều này dẫn đến bảng Fact phải được Scan toàn bộ lên bộ nhớ.

**Sự can thiệp của DPP:**
Ngay tại thời điểm biên dịch vật lý, Catalyst "cài" một subquery ẩn. Nó chạy độc lập để lọc ra toàn bộ các `store_id` thuộc 'APAC' (Ví dụ ra danh sách `[12, 15, 99]`). 
Sau đó, nó biến danh sách này thành bộ lọc (In-clause predicate) đẩy ngược về File Scanner của bảng Fact. File Scanner chỉ Scan các Partition chứa `store_id` đó. Disk I/O được cắt giảm theo cấp số nhân.

## 4. Operational Troubleshooting với `EXPLAIN`

Một Staff Data Engineer bắt buộc phải biết cách gỡ lỗi truy vấn thông qua Physical Plan.

```python
# Sử dụng 'extended' để theo dõi vòng đời biến đổi
df.explain("extended")
```

**Cách đọc Plan (Từ dưới lên trên):**
1. **Dưới cùng (Leaf Nodes):** `FileScan parquet ...`. Hãy tìm phần `PushedFilters`. Nếu bạn viết `.filter()` mà không thấy điều kiện ở đây, có nghĩa là Predicate Pushdown đã thất bại (thường do dùng UDF). I/O của bạn sẽ nổ tung.
2. **Ở giữa (Internal Nodes):** `Exchange` báo hiệu ranh giới Shuffle. Nếu thấy `Exchange hashpartitioning`, kiểm tra xem phía trên nó là thuật toán Join gì. Nếu là `SortMergeJoin` và lượng dữ liệu lên đến Terabyte, bạn cần tính tới phương án bật AQE hoặc Salting.
3. **Ký hiệu \*(1), \*(2):** Đây là các điểm mà Whole-Stage Code Gen đang chạy.

## Nguồn Tham Khảo (References)
- [Spark SQL: Relational Data Processing in Spark (SIGMOD 2015)](https://people.csail.mit.edu/matei/papers/2015/sigmod_spark_sql.pdf)
- [Databricks Deep Dive: Catalyst Optimizer](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
- [Databricks Project Tungsten: Bringing Spark Closer to Bare Metal](https://www.databricks.com/blog/2015/04/28/project-tungsten-bringing-apache-spark-closer-to-bare-metal.html)
