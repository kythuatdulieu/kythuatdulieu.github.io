---
title: "Concepts Deep-dive: Parquet & ORC Internals"
description: "Phân tích chuyên sâu bên dưới định dạng lưu trữ Columnar (Parquet, ORC), thuật toán Record Shredding của Dremel, Dictionary/RLE Encoding, và Predicate Pushdown."
---

Khi bước vào thế giới Data Engineering và OLAP (Online Analytical Processing), hai định dạng file được xướng tên nhiều nhất là **Apache Parquet** và **Apache ORC**. Khác với CSV hay JSON, chúng không sinh ra để con người có thể đọc trực tiếp (human-readable), mà được thiết kế tối ưu hóa đến tận "răng" cho các cỗ máy xử lý dữ liệu lớn (Spark, Trino, BigQuery).

Bài viết này sẽ "mổ xẻ" các kỹ thuật bên trong (internals) đã làm nên sức mạnh của các định dạng Columnar này.

---

## 1. Tại sao Columnar lại "ăn đứt" Row-based trong OLAP?

Để hiểu giá trị của Parquet và ORC, trước tiên ta cần hiểu giới hạn của **Row-based formats** (như CSV, JSON, Avro).

*   **Row-based (Lưu trữ theo dòng):** Dữ liệu được ghi tuần tự từng bản ghi (record). Nếu một bảng có 100 cột và bạn chỉ muốn tính tổng doanh thu (cột `revenue`), hệ thống vẫn phải đọc toàn bộ 100 cột từ đĩa lên bộ nhớ, sau đó loại bỏ 99 cột không cần thiết. Quá trình này tiêu tốn băng thông I/O khổng lồ và rất lãng phí.
*   **Columnar (Lưu trữ theo cột):** Dữ liệu của từng cột được lưu trữ liền kề nhau. Khi chạy truy vấn `SELECT SUM(revenue)`, hệ thống **chỉ quét (scan) duy nhất phần đĩa chứa cột `revenue`**, bỏ qua hoàn toàn các cột khác. Điều này giúp giảm I/O từ hàng GB xuống chỉ còn vài MB.

Hơn thế nữa, vì dữ liệu trong cùng một cột có cùng một kiểu dữ liệu (data type), việc nén (compression) trên Columnar format đạt hiệu quả cực kỳ cao so với Row-based.

---

## 2. Google Dremel Paper và Thuật toán Record Shredding

Sự ra đời của Apache Parquet chịu ảnh hưởng trực tiếp từ bài báo **[Dremel: Interactive Analysis of Web-Scale Datasets (2010)](https://research.google/pubs/pub36632/)** của Google. 

Lưu trữ dạng cột rất dễ đối với dữ liệu phẳng (flat data như bảng SQL thông thường). Tuy nhiên, dữ liệu Big Data thường ở dạng cấu trúc lồng nhau (nested structures) phức tạp như JSON hay Protobuf. Làm sao để "bẻ phẳng" các mảng (arrays) và cấu trúc lồng nhau này vào các cột mà không làm mất đi cấu trúc ban đầu?

Google Dremel đã giới thiệu khái niệm **Record Shredding and Assembly** (Băm nhỏ và Lắp ráp bản ghi). Để làm được điều này, Dremel (và Parquet) sử dụng hai metadata đi kèm với mỗi giá trị:

1.  **Repetition Level (r):** Cho biết giá trị hiện tại lặp lại ở cấp độ lồng nhau (nested level) thứ mấy của danh sách (list/array).
2.  **Definition Level (d):** Cho biết đường dẫn tới cột lồng nhau (nested path) đã được định nghĩa tới đâu. Điều này rất quan trọng để phân biệt giữa một mảng rỗng (empty array) và một giá trị null thực sự.

Nhờ việc lưu trữ hai số nguyên nhỏ (r, d) cùng với dữ liệu, Parquet có thể "shred" (băm) các document JSON phức tạp thành các cột độc lập và "assemble" (lắp ráp) lại chính xác cấu trúc ban đầu mà không cần phải đọc các cột không liên quan.

---

## 3. Dictionary Encoding & RLE (Run-Length Encoding)

Một trong những lý do khiến Parquet/ORC nén dữ liệu cực tốt là nhờ các thuật toán Encoding (Mã hóa) trước khi đẩy qua các thuật toán nén tổng quát (như Snappy, Zstd, Gzip).

### Dictionary Encoding (Mã hóa Từ điển)
Đối với các cột có tính lặp lại cao (low-cardinality) như `Trạng thái` (Thành công, Thất bại) hoặc `Quốc gia` (VN, US, UK), việc lưu trữ các chuỗi string này lặp đi lặp lại hàng triệu lần rất tốn dung lượng.
Dictionary Encoding giải quyết bằng cách:
*   Tạo một **Dictionary** (Từ điển) lưu trữ các giá trị độc nhất: `[0: "Thành công", 1: "Thất bại"]`.
*   Thay thế toàn bộ chuỗi string trong cột bằng các số nguyên (integer IDs) trỏ tới từ điển: `[0, 0, 1, 0, 1, ...]`.

### Run-Length Encoding (RLE)
Nếu dữ liệu đã được sắp xếp (sorted), các giá trị giống nhau thường nằm cạnh nhau. RLE nén chúng bằng cách lưu giá trị và số lần lặp lại liên tiếp.
Ví dụ, thay vì lưu: `[0, 0, 0, 0, 0, 1, 1, 1]`, RLE sẽ lưu: `[(0, 5), (1, 3)]`.

Sự kết hợp giữa **Dictionary Encoding + RLE + Bit-packing** giúp thu nhỏ kích thước file Parquet/ORC xuống chỉ còn 1/10 so với file CSV gốc.

---

## 4. Pushdown Predicates (Đẩy điều kiện lọc xuống Storage)

**Predicate Pushdown** (hay Filter Pushdown) là một kỹ thuật tối ưu hóa truy vấn quan trọng nhất mà Data Engineer cần biết khi làm việc với file Columnar. Nó cho phép engine phân tích (như Spark, Presto) đẩy các điều kiện lọc (mệnh đề `WHERE`) xuống tận Storage Layer.

Cơ chế này hoạt động dựa trên các metadata thống kê (Statistics) được lưu ở phần Footer của file.

### Cấu trúc Block và Statistics
*   **Apache Parquet** chia file thành các **Row Groups** (thường từ 64MB - 512MB). Trong mỗi Row Group, Parquet duy trì các thông số thống kê cho từng Column Chunk: `min`, `max`, `null_count`.
*   **Apache ORC** sử dụng cấu trúc **Stripes** (thường ~250MB) và có cơ chế Indexing cực kì chi tiết ở nhiều cấp độ (File level, Stripe level, Row Group level), có hỗ trợ cả Bloom Filters.

### Cơ chế Pushdown hoạt động như thế nào?
Giả sử bạn chạy truy vấn: `SELECT * FROM users WHERE age = 30`.
1.  Engine sẽ đọc phần Footer của file để lấy metadata của các Row Groups.
2.  Nếu Row Group A có `min(age) = 15` và `max(age) = 25`, engine nhận ra chắc chắn không có user nào 30 tuổi ở đây.
3.  Engine sẽ **bỏ qua hoàn toàn Row Group A** (Skip data block) mà không cần phải tốn chi phí I/O để đọc hay giải nén Row Group này.

Hiệu quả của Predicate Pushdown cao nhất khi dữ liệu của bạn được **sắp xếp (sorted) theo cột thường xuyên được filter** (ví dụ: `ORDER BY date` hoặc `ORDER BY age`), giúp tối đa hóa khả năng skip blocks.

---

## Tổng kết

Hiểu rõ Internals của Parquet và ORC giúp Data Engineer đưa ra quyết định thiết kế dữ liệu chuẩn xác:
1.  **Lựa chọn định dạng:** Parquet phổ biến như tiêu chuẩn chung của Cloud Data Lakes (S3, ADLS) với Spark/Trino. ORC thường tỏa sáng trong hệ sinh thái Apache Hive và hỗ trợ ACID mạnh mẽ hơn.
2.  **Sắp xếp dữ liệu (Sort/Z-Order):** Gom cụm dữ liệu giúp Predicate Pushdown hoạt động hiệu quả tối đa.
3.  **Tối ưu dung lượng:** Hiểu về Dictionary và RLE giúp bạn đánh giá đúng mức độ "nặng nề" của các cột High-Cardinality (như UUID) so với Low-Cardinality.

---

## Tài liệu tham khảo & Đọc thêm

*   [Google Dremel Paper (2010): Interactive Analysis of Web-Scale Datasets](https://research.google.com/pubs/pub36632.html)
*   [Apache Parquet Documentation - Encodings](https://parquet.apache.org/docs/file-format/data-pages/encodings/)
*   [Apache ORC Documentation - Background & Structure](https://orc.apache.org/docs/)
*   Databricks Engineering Blog: Past, Present, and Future of Data Storage in Data Lakes.
