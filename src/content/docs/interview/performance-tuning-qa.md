---
title: "Tối ưu hóa hiệu năng (Phỏng vấn) - Performance Tuning QA"
category: "Interview Preparation"
difficulty: "Advanced"
tags: ["performance-tuning", "sql", "indexing", "partitioning", "interview"]
readingTime: "13 mins"
lastUpdated: 2026-06-07
seoTitle: "Performance Tuning QA - Phỏng vấn tối ưu hóa truy vấn dữ liệu"
metaDescription: "Tuyệt chiêu trả lời phỏng vấn tối ưu hóa hiệu năng truy vấn (Performance Tuning): Tối ưu SQL, Indexing, Partitioning, Materialized Views."
---

# Tối ưu hóa hiệu năng (Phỏng vấn) - Performance Tuning QA

## Summary

**Performance Tuning QA** là nhóm câu hỏi phỏng vấn tập trung vào kỹ năng tối ưu hóa các câu lệnh SQL và kiến trúc lưu trữ để xử lý các bảng dữ liệu có quy mô từ hàng triệu đến hàng tỷ dòng (Terabytes/Petabytes data). Đây là nội dung quyết định khả năng chuyển từ cấp độ Junior (biết viết SQL ra kết quả) lên Mid/Senior (biết viết SQL siêu nhanh và rẻ).

---

## Definition

Tối ưu hóa hiệu năng là quá trình giảm thiểu tài nguyên I/O (ổ đĩa, mạng) và CPU mà một công cụ tính toán (Database engine hoặc Distributed framework) phải sử dụng để trả về một tập dữ liệu. Trong phỏng vấn, quá trình này bao gồm việc đọc và hiểu Kế hoạch thực thi (Query Execution Plan), cấu trúc lại mã SQL, và áp dụng các chiến lược lưu trữ vật lý như Đánh chỉ mục (Indexing), Phân vùng (Partitioning) và Lưu đệm (Caching).

---

## Why it exists

Dữ liệu càng lớn, truy vấn càng chậm. Một câu truy vấn có thể mất 0.1 giây trên máy tính dev (chứa 1000 dòng test) nhưng lại treo hàng giờ trên môi trường production (chứa 10 tỷ dòng). Công ty cần những kỹ sư biết cách thiết kế cấu trúc vật lý của dữ liệu sao cho các báo cáo Dashboard Load lên dưới 3 giây thay vì 3 phút, giúp cải thiện trải nghiệm người dùng cuối (UX) và giảm chi phí phần cứng máy chủ.

---

## Core idea

Để tối ưu hóa bất kỳ hệ thống lưu trữ nào, hãy bám sát 4 nguyên tắc kỹ thuật cốt lõi sau:
* **Pushdown / Pruning (Cắt tỉa dữ liệu)**: Quy tắc vàng là "Đọc càng ít dữ liệu từ đĩa cứng càng tốt". Đưa các bộ lọc (`WHERE`, `SELECT columns`) đẩy xuống sâu nhất có thể trước khi thực hiện các phép toán nặng như `JOIN` hoặc `GROUP BY`.
* **Data Organization (Tổ chức vật lý)**: Sắp xếp dữ liệu trên ổ cứng thông qua Partitioning (chia thư mục) và Clustering / Z-Ordering (gom cụm các dòng có giá trị giống nhau lại gần nhau) để khi tìm kiếm, công cụ tính toán có thể bỏ qua (skip) toàn bộ những tệp không liên quan.
* **Indexing (Đánh chỉ mục)**: Sử dụng các cấu trúc dữ liệu như B-Tree Index (OLTP) hoặc Bitmap Index (OLAP) để thay thế cho việc quét toàn bộ bảng (Full Table Scan) bằng các phép tìm kiếm nhị phân có độ phức tạp O(log n).
* **Pre-computation (Tính toán trước)**: Thay vì bắt hệ thống phải tính lại tổng doanh thu 5 năm mỗi khi mở Dashboard, hãy tính nó 1 lần vào ban đêm và lưu kết quả ra một bảng khác (Materialized Views).

---

## How it works

Khi đối mặt với bài tập tối ưu một câu SQL chậm trong phỏng vấn, hãy đi theo trình tự:
1. **Analyze Execution Plan (EXPLAIN)**: Yêu cầu xem Query Plan để tìm ra Bottleneck. Hệ thống đang bị nghẽn ở Full Table Scan, hay ở phép Cartesian Join, hay do Disk Spill (hết RAM phải ghi tạm ra đĩa)?
2. **Review Code (Tối ưu logic)**: Tối ưu lại code SQL. Xóa các cột không dùng trong `SELECT`, đưa `WHERE` lên trước, loại bỏ các hàm Subquery lồng nhau nếu có thể chuyển thành `JOIN`.
3. **Review Data Structures (Tối ưu vật lý)**: Đề xuất thêm Index, thêm khóa Partition (theo ngày tháng), hoặc thay đổi định dạng lưu trữ (chuyển từ CSV sang Parquet columnar).
4. **Caching Strategy (Lưu đệm)**: Đề xuất sử dụng Redis hoặc Query Cache nếu dữ liệu được truy vấn liên tục nhưng ít thay đổi.

---

## Architecture / Flow

Sơ đồ quá trình Cắt tỉa Partition (Partition Pruning) trên nền tảng BigQuery / S3:

```mermaid
graph TD
    A[Truy vấn: SELECT SUM(doanh_thu) <br> FROM sales <br> WHERE nam = 2026] --> B(Trình phân tích truy vấn)
    
    B --> C{Xác định thư mục quét}
    C -. "Bỏ qua" .-> D[S3/ year=2024/]
    C -. "Bỏ qua" .-> E[S3/ year=2025/]
    C == "Chỉ đọc thư mục này" ==> F[S3/ year=2026/]
    
    F --> G(Tính tổng nhanh chóng và siêu rẻ)
```

---

## Practical example

**Tình huống phỏng vấn**: Câu truy vấn sau mất 5 phút để chạy trên một kho dữ liệu. Làm sao để tối ưu nó?
```sql
SELECT product_id, COUNT(DISTINCT user_id)
FROM events
WHERE EXTRACT(YEAR FROM event_date) = 2026
GROUP BY product_id;
```

**Phân tích & Tối ưu**:
1. **Sai lầm thứ 1 (Filter by function)**: Việc dùng hàm `EXTRACT()` bao bọc lên cột `event_date` khiến hệ thống mất khả năng sử dụng Index hoặc Partition Pruning. Công cụ sẽ phải quét toàn bộ bảng và gọi hàm extract trên *từng dòng một* (Full Table Scan).
   * -> *Cách sửa*: Viết lại điều kiện để cột nằm trơ trọi một mình: `WHERE event_date >= '2026-01-01' AND event_date < '2027-01-01'`.
2. **Sai lầm thứ 2 (COUNT DISTINCT)**: Đếm giá trị duy nhất (`COUNT DISTINCT`) là một thao tác cực kỳ đắt đỏ trong phân tán vì nó yêu cầu phải xáo trộn (shuffle) và lưu toàn bộ mảng `user_id` vào bộ nhớ để lọc trùng.
   * -> *Cách sửa*: Nếu Business không cần con số chính xác 100% (ví dụ làm Dashboard Analytics), hãy sử dụng hàm xấp xỉ `APPROX_COUNT_DISTINCT(user_id)`. Hàm này dựa trên thuật toán HyperLogLog, sai số chỉ khoảng 1-2% nhưng chạy nhanh hơn gấp 10-50 lần và tốn cực ít bộ nhớ.

---

## Best practices

* **Materialized Views**: Trong các kho dữ liệu đám mây (BigQuery, Snowflake), hãy tận dụng Materialized Views để lưu kết quả các phép tính Aggregate nặng. Hệ thống sẽ tự động đồng bộ (refresh) các view này dưới nền khi dữ liệu gốc thay đổi.
* **Lựa chọn đúng chuẩn JOIN**:
  * Nếu JOIN bảng lớn với bảng cực nhỏ -> Dùng `Broadcast Join` (Hash Join).
  * Nếu JOIN hai bảng có kích thước khổng lồ -> Đảm bảo hai bảng cùng được phân phối (Distributed/Bucketed) theo chung một khóa để tránh hiện tượng vắt chéo dữ liệu qua mạng.
* **Columnar Storage (Lưu trữ hướng cột)**: Các hệ thống phân tích OLAP tỏa sáng khi sử dụng Parquet/ORC. Nếu bạn chỉ cần báo cáo 2 cột `doanh_thu` và `ngay_tháng` trong bảng có 100 cột, hệ thống hướng cột sẽ chỉ phải đọc đĩa cứng cho đúng 2 cột đó (Column Pruning).

---

## Common mistakes

* **SELECT * vô tội vạ**: Lệnh `SELECT *` trong Data Warehouse là hành động "đốt tiền". Nó ép hệ thống quét toàn bộ các cột, bao gồm cả những cột văn bản (text) cực lớn làm tắc nghẽn I/O.
* **Tạo quá nhiều Index**: Index giúp đọc nhanh nhưng lại làm ghi (Write) rất chậm vì mỗi lần chèn thêm bản ghi, hệ thống phải cập nhật lại cấu trúc cây B-Tree. Do đó, trong môi trường Data Warehouse (ghi nhiều lượng lớn), người ta ít dùng B-Tree Index truyền thống mà dùng Sort Keys hoặc Partitioning.
* **Partition quá nhỏ (The Small Files Problem)**: Phân vùng theo `year/month/day/hour/minute`. Điều này tạo ra hàng triệu file nhỏ li ti dung lượng 10KB trên S3/HDFS. Các hệ thống như Spark ghét file nhỏ, vì nó tốn thời gian gọi metadata (File system overhead) lớn hơn cả thời gian thực sự đọc file. Hãy giữ dung lượng file ở mức 128MB - 512MB (ví dụ: chỉ partition tới mức `day`).

---

## Trade-offs

### Thời gian tính toán (Compute) vs Không gian lưu trữ (Storage)
Hầu hết các kỹ thuật tối ưu (như Indexing, Materialized View, Caching) đều dựa trên một nguyên tắc chung: **Đánh đổi bằng dung lượng lưu trữ (Storage) để mua lại thời gian CPU tính toán (Compute)**. Ổ đĩa hiện tại rất rẻ, trong khi sức mạnh CPU và thời gian chờ đợi của con người lại đắt, nên sự đánh đổi này là hoàn toàn xứng đáng.

---

## When to use

* Các kiến thức tối ưu này quyết định bạn có phải là một kỹ sư hệ thống thực thụ hay chỉ là một nhà phân tích biết gõ SQL cơ bản.

---

## Related concepts

* [Index vs Partition](/concepts/index-vs-partition)
* [Columnar Storage](/concepts/columnar-storage)
* [HyperLogLog (Approximate Computing)](/concepts/approximate-computing)

---

## Interview questions

### 1. Hàm `EXPLAIN` trong SQL dùng để làm gì? Nêu một vài thông số quan trọng bạn thường tìm kiếm trong kết quả của nó.
* **Gợi ý trả lời**: `EXPLAIN` (hoặc `EXPLAIN ANALYZE`) cung cấp kế hoạch thực thi vật lý (Execution Plan) mà trình tối ưu hóa (Optimizer) của database định sử dụng để giải quyết truy vấn. Các thông số quan trọng cần để ý:
  * Cách quét bảng: `Seq Scan` (Quét toàn bộ - Xấu) hay `Index Scan` (Tốt).
  * Chi phí ước tính (Cost) và số dòng trả về (Rows).
  * Cách thức thực hiện JOIN: `Nested Loop` (Tệ nếu số dòng lớn), `Hash Join` (Nhanh cho dữ liệu vừa phải), `Merge Join` (Tốt nếu dữ liệu đã được sắp xếp).

### 2. Sự khác biệt giữa `WHERE` và `HAVING` là gì về mặt tối ưu hóa hiệu năng?
* **Gợi ý trả lời**: `WHERE` hoạt động lọc các dòng *trước khi* quá trình nhóm dữ liệu (`GROUP BY`) diễn ra. `HAVING` hoạt động lọc dữ liệu *sau khi* nhóm và tính toán hàm tổng hợp (SUM, AVG) đã hoàn thành. Về mặt hiệu năng, luôn cố gắng đưa các điều kiện sang mệnh đề `WHERE` để giảm khối lượng dữ liệu đầu vào cho bước gom nhóm (Pushdown), không bao giờ dùng `HAVING` cho các thuộc tính mà đáng lẽ có thể lọc bằng `WHERE`.

### 3. Bạn sẽ xử lý thế nào với truy vấn sử dụng phép `LIKE '%abc%'` chạy quá chậm?
* **Gợi ý trả lời**: 
  1. Phép tìm kiếm wildcard có dấu `%` ở đầu dòng không thể sử dụng B-Tree Index thông thường.
  2. Để tối ưu, nếu dùng PostgreSQL, tôi sẽ thiết lập Trigram Index (`pg_trgm`). Nếu bài toán yêu cầu tìm kiếm toàn văn bản chuyên sâu (Full-text search), tôi sẽ đề xuất chuyển dữ liệu đó sang một công cụ chuyên dụng như Elasticsearch để tận dụng cấu trúc Inverted Index.

---

## References

1. **High Performance MySQL** - Baron Schwartz.
2. **Designing Data-Intensive Applications** - Chương 3: Storage and Retrieval (Cực kỳ quan trọng để hiểu B-Tree, SSTables và Column-oriented).
3. **Google Cloud BigQuery Documentation** - Best practices cho query optimization.

---

## English summary

The Performance Tuning QA interview round challenges candidates to analyze and resolve slow-running SQL queries and structural bottlenecks in large-scale data systems. Success requires a profound understanding of how databases execute queries (using the `EXPLAIN` plan) and the application of physical data organization techniques. Candidates are expected to advocate for pushing down filters (Predicate/Partition Pruning), leveraging Columnar Storage (Parquet/ORC) over Row Storage, and substituting expensive operations (like `COUNT DISTINCT`) with approximate algorithms (HyperLogLog) when exact precision isn't necessary. Mastering the trade-offs between compute time and storage space—via Indexing, Caching, and Materialized Views—is the ultimate indicator of a senior-level data professional.
