---
title: "Lưu trữ dạng Cột - Columnar Storage"
difficulty: "Intermediate"
tags: ["storage", "columnar", "olap", "big-data"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Lưu trữ dạng Cột (Columnar Storage) - Cốt lõi của Data Warehouse"
metaDescription: "Tìm hiểu chi tiết về Lưu trữ dạng cột (Column-oriented storage), cách thức nén dữ liệu, tối ưu hóa truy vấn phân tích (OLAP) và sự khác biệt với dạng dòng."
description: "Columnar Storage (Lưu trữ dạng cột) là yếu tố kỹ thuật cốt lõi quyết định hiệu năng xử lý của các hệ thống phân tích dữ liệu lớn (OLAP) và các định dạng dữ liệu hiện đại."
---



Columnar Storage (Lưu trữ theo cột) là kiến trúc lưu trữ dữ liệu trong đó toàn bộ giá trị của một cột được xếp liên tiếp nhau trên đĩa, thay vì xếp theo từng dòng (row). Trái ngược với Row-based (lưu theo dòng) trong các RDBMS truyền thống, Columnar Storage cho phép nén dữ liệu cực tốt và tối ưu hóa vượt bậc cho các truy vấn phân tích (OLAP) chỉ cần đọc một vài cột cụ thể trong bảng hàng tỷ dòng.

Sự trỗi dậy của Data Warehouse (như Redshift, BigQuery, Snowflake) và Data Lakehouse (với Parquet, ORC, Iceberg) đều có nền tảng từ công nghệ lưu trữ theo cột này.

## 1. Sự khác biệt cốt lõi: Row-based vs Column-based

Để hiểu rõ tại sao Columnar Storage lại mạnh mẽ, chúng ta cần xem cách dữ liệu được bố trí trên ổ cứng (Disk Layout). Giả sử chúng ta có một bảng `employees` với 3 cột: `ID`, `Name`, `Department`.

**Bảng Dữ liệu Logic:**
| ID | Name | Department |
|----|-------|------------|
| 1 | Alice | Engineering|
| 2 | Bob | Sales |
| 3 | Carol | Engineering|

### Row-based Storage (Lưu trữ theo dòng)
Dữ liệu được lưu tuần tự theo từng bản ghi (record/row).

* **Disk layout:** `1, Alice, Engineering; 2, Bob, Sales; 3, Carol, Engineering;`
* **Đặc điểm:** Tối ưu cho hệ thống OLTP (Online Transaction Processing). Khi bạn muốn thêm một nhân viên mới (`INSERT`), hay lấy toàn bộ thông tin của nhân viên `ID = 2` (`SELECT * FROM ... WHERE ID=2`), đĩa chỉ cần tìm đến vị trí của dòng đó và đọc/ghi trong một thao tác I/O.
* **Hạn chế:** Khi cần đếm số lượng nhân viên ở mỗi `Department`, ổ đĩa vẫn phải quét qua toàn bộ dữ liệu (bao gồm cả `ID` và `Name` không cần thiết). Việc đọc dữ liệu rác này làm lãng phí băng thông I/O và CPU.

### Column-based Storage (Lưu trữ theo cột)
Dữ liệu của cùng một cột được nhóm lại và lưu trữ liền kề nhau.

* **Disk layout:** `1, 2, 3; Alice, Bob, Carol; Engineering, Sales, Engineering;`
* **Đặc điểm:** Tối ưu cho hệ thống OLAP (Online Analytical Processing). Nếu truy vấn `SELECT COUNT(*) FROM employees WHERE Department = 'Engineering'`, đĩa chỉ cần đọc vùng dữ liệu chứa cột `Department` (chiếm 1/3 tổng dung lượng) và bỏ qua các cột `ID`, `Name`.
* **Hạn chế:** Khi thêm mới một dòng (`INSERT`), dữ liệu sẽ phải được xé nhỏ và ghi vào nhiều vị trí khác nhau trên đĩa (vị trí cuối của mỗi cột), làm cho thao tác ghi (write) chậm và tốn kém hơn.

## 2. Tại sao Columnar Storage tối ưu cho OLAP?

Hệ thống phân tích dữ liệu lớn có tính chất: **Đọc nhiều (Read-heavy), Truy vấn tập trung vào một số cột cụ thể, Khối lượng dữ liệu khổng lồ (Millions to Billions of rows)**. Columnar Storage đáp ứng hoàn hảo các yêu cầu này thông qua 3 yếu tố chính:

### 2.1. Giảm thiểu Disk I/O (I/O Minimization)
I/O (đọc/ghi ổ cứng và mạng) thường là nút thắt cổ chai (bottleneck) lớn nhất trong xử lý Big Data. Bằng cách chỉ đọc đúng những cột có mặt trong câu lệnh `SELECT`, `WHERE`, `GROUP BY`, Columnar Storage loại bỏ tới 80-90% lượng dữ liệu không cần thiết phải tải vào RAM.

### 2.2. Hiệu suất nén dữ liệu cực cao (High Compression Ratio)
Các thuật toán nén hoạt động tốt nhất khi dữ liệu có tính đồng nhất. Trong một cột, tất cả các giá trị đều có chung kiểu dữ liệu (Data Type) và thường xuyên có giá trị lặp lại (ví dụ: cột giới tính, mã quốc gia, trạng thái đơn hàng). Điều này mang lại tỷ lệ nén (Compression Ratio) rất cao so với Row-based (nơi các kiểu dữ liệu string, int, date đứng xen kẽ nhau).

Các kỹ thuật nén phổ biến trong Columnar Storage:
* **Run-Length Encoding (RLE):** Nén các giá trị lặp lại liên tiếp. Thay vì lưu `[US, US, US, US, VN, VN, UK]`, nó sẽ lưu thành `[US:4, VN:2, UK:1]`. Rất hiệu quả khi dữ liệu đã được sắp xếp (sorted).
* **Dictionary Encoding:** Xây dựng một từ điển ánh xạ các giá trị chuỗi (string) thành các số nguyên (integer) nhỏ. Ví dụ: `{'Engineering': 0, 'Sales': 1}`. Mảng `[Engineering, Sales, Engineering]` sẽ được lưu là `[0, 1, 0]`. Điều này tiết kiệm dung lượng đáng kể vì số nguyên chiếm rất ít không gian so với chuỗi ký tự.
* **Bit-Packing:** Dùng số lượng bit tối thiểu để biểu diễn các số nguyên nhỏ. Ví dụ: một cột chỉ chứa giá trị từ 1-7 thì chỉ cần 3 bit thay vì 32 bit (int32) tiêu chuẩn.
* **Delta Encoding:** Lưu trữ sự chênh lệch (delta) giữa các giá trị liên tiếp thay vì lưu giá trị gốc. Thích hợp cho dữ liệu Time-series (Timestamp liên tục tăng). VD: `[1000, 1005, 1008]` trở thành `[1000, +5, +3]`.

### 2.3. Tối ưu hóa cho CPU (CPU Cache & Vectorized Processing)
Vì các giá trị trong một mảng cùng kiểu dữ liệu được đặt cạnh nhau trong bộ nhớ (RAM/CPU Cache), CPU có thể sử dụng tính năng **SIMD** (Single Instruction, Multiple Data) để thực thi một phép toán duy nhất trên nhiều giá trị cùng lúc (Vectorized Processing). Ví dụ: nhân một cột `Quantity` với `Price` cho 1024 dòng trong vòng vài chu kỳ xung nhịp (clock cycles) của CPU.

## 3. Các kỹ thuật tiên tiến trong Columnar Storage

Các định dạng lưu trữ hiện đại không chỉ đơn thuần là "lưu theo cột" mà còn tích hợp nhiều kỹ thuật thông minh khác:

### 3.1. Predicate Pushdown và Zone Maps (Min-Max Statistics)
Khi lưu trữ, các engine thường chia dữ liệu thành các khối nhỏ (ví dụ: Row Groups trong Parquet chứa khoảng 1 triệu dòng). Ở đầu mỗi khối, nó lưu lại **metadata (Zone Maps)** bao gồm các thống kê: giá trị lớn nhất (Max), nhỏ nhất (Min), số giá trị Null (Null Count) của khối đó.

Khi thực thi câu lệnh: `SELECT * FROM sales WHERE amount > 1000`
Hệ thống sẽ kiểm tra metadata trước. Nếu Zone Map của một khối cho thấy `Max(amount) = 800`, engine sẽ **bỏ qua hoàn toàn (Skip)** việc đọc khối đó từ đĩa. Kỹ thuật này gọi là **Data Skipping** kết hợp **Predicate Pushdown** (đẩy điều kiện lọc xuống thẳng lớp lưu trữ).

### 3.2. Late Materialization
Trong quá trình xử lý truy vấn, hệ thống giữ dữ liệu ở trạng thái nén hoặc định dạng cột (vector) càng lâu càng tốt. Việc kết hợp các cột lại thành một bảng kết quả hai chiều hoàn chỉnh (Row reconstruction) chỉ diễn ra ở bước cuối cùng trước khi trả về cho người dùng.

## 4. Các định dạng phổ biến hiện nay

* **Apache Parquet:** Định dạng tiêu chuẩn de facto cho Data Lake. Rất mạnh mẽ trong việc lưu trữ dữ liệu lồng nhau (nested data) hiệu quả (thông qua thuật toán Dremel của Google). Mặc định Parquet cấu trúc file theo hướng lai (Hybrid): File được chia thành các *Row Groups* lớn, bên trong mỗi Row Group, dữ liệu lại được chia theo *Column Chunk*.
* **Apache ORC (Optimized Row Columnar):** Ra đời từ hệ sinh thái Hadoop/Hive. ORC cung cấp tỷ lệ nén cực kỳ mạnh và các chỉ mục nhẹ (lightweight indexes) tích hợp sẵn, đặc biệt phù hợp cho các truy vấn phân tích siêu lớn trên cụm Hadoop.
* **Cơ sở dữ liệu In-Memory và OLAP chuyên biệt:** Apache Arrow (định dạng bộ nhớ in-memory chuẩn), ClickHouse, DuckDB đều triển khai core engine của chúng dựa trên khái niệm columnar để đạt tốc độ milisecond cho các truy vấn lớn.

## 5. Khi nào không nên dùng Columnar Storage?

Mặc dù cực kỳ xuất sắc trong Analytical workloads, Columnar Storage có các nhược điểm tự nhiên khiến nó không phù hợp cho:
1. **Hệ thống OLTP (Online Transaction Processing):** Các hệ thống POS, CRM, ERP có tần suất thêm (INSERT), cập nhật (UPDATE) và xóa (DELETE) từng bản ghi một cách liên tục. Việc update một dòng trong hệ thống Columnar rất phức tạp và tốn kém tài nguyên.
2. **Truy vấn cần trả về toàn bộ các cột (SELECT *):** Khi bạn thực sự cần lấy một hoặc nhiều dòng trọn vẹn với hàng trăm cột (`SELECT * FROM table WHERE ID = X`), Columnar Storage sẽ chậm hơn Row Storage vì nó phải thu thập và "lắp ráp" lại dòng đó từ hàng trăm vị trí khác nhau trên ổ đĩa (Tuple reconstruction overhead).

## Tài Liệu Tham Khảo
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
