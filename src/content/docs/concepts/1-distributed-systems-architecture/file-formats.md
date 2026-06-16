---
title: "Định dạng Tệp Dữ liệu - File Formats"
difficulty: "Beginner"
tags: ["file-formats", "parquet", "orc", "avro", "data-lake"]
readingTime: "9 mins"
lastUpdated: 2026-06-16
seoTitle: "So sánh Định dạng Tệp (File Formats): Parquet, ORC, Avro, CSV"
metaDescription: "Tìm hiểu các định dạng tệp tin phổ biến trong Big Data và Data Lake: Sự khác biệt giữa Parquet (Columnar), Avro (Row-based), JSON và CSV."
description: "Trong Data Engineering, định dạng tệp tin (File Formats) đóng vai trò cốt lõi trong việc lưu trữ, xử lý và tối ưu hóa chi phí cũng như hiệu năng truy vấn dữ liệu..."
---



Định dạng file (File Formats) quyết định cách dữ liệu được mã hóa và lưu trữ trên đĩa hoặc trên các object storage (như S3, GCS). Trong các hệ quản trị cơ sở dữ liệu truyền thống (như MySQL hay PostgreSQL), dữ liệu được quản lý khép kín trong các engine lưu trữ riêng. Tuy nhiên, với kiến trúc Data Lake và phân tán, dữ liệu được lưu trữ dưới dạng các tệp tin rời rạc. Việc lựa chọn đúng định dạng tệp có thể mang lại hiệu năng truy vấn gấp hàng trăm lần và tiết kiệm đáng kể chi phí lưu trữ.

## Row-oriented (Lưu trữ theo dòng) vs Column-oriented (Lưu trữ theo cột)



Một trong những quyết định thiết kế quan trọng nhất đối với định dạng dữ liệu là cách dữ liệu được bố trí trên đĩa: Row-based hay Column-based.

### Lưu trữ theo dòng (Row-oriented)
- Dữ liệu của một bản ghi (record) được lưu trữ liền kề nhau trên đĩa.
- **Ưu điểm:**
  - Tối ưu cho thao tác ghi (Write-heavy) vì chỉ cần ghi nối thêm (append) nguyên một dòng dữ liệu vào cuối tệp.
  - Phù hợp cho việc truy xuất toàn bộ thông tin của một bản ghi cụ thể (OLTP).
- **Nhược điểm:**
  - Khi cần tính toán hoặc tập hợp dữ liệu trên một vài cột (ví dụ: tính tổng doanh thu), hệ thống vẫn phải đọc toàn bộ dòng từ đĩa, gây lãng phí tài nguyên đọc (I/O).
- **Ví dụ:** CSV, JSON, Avro, các RDBMS truyền thống.

### Lưu trữ theo cột (Column-oriented)
- Dữ liệu của cùng một cột được lưu trữ cạnh nhau.
- **Ưu điểm:**
  - Tối ưu cho thao tác đọc và phân tích (OLAP). Hệ thống chỉ cần đọc đúng những cột cần thiết cho câu truy vấn (Column Projection), giảm thiểu đáng kể chi phí I/O.
  - Tỷ lệ nén dữ liệu cực kỳ cao. Vì dữ liệu cùng một cột thường có kiểu giống nhau và giá trị lặp lại nhiều, các thuật toán nén (như RLE - Run-Length Encoding, Dictionary Encoding) hoạt động rất hiệu quả.
- **Nhược điểm:**
  - Thao tác ghi (Write) và cập nhật (Update) chậm hơn vì một bản ghi bị tách ra và ghi vào nhiều vị trí khác nhau.
- **Ví dụ:** Parquet, ORC.

---

## Các Định Dạng Dữ Liệu Phổ Biến

### 1. CSV (Comma-Separated Values)
Định dạng văn bản (text-based) lâu đời và phổ biến nhất.
- **Đặc điểm:** Dữ liệu dạng dòng, các giá trị cách nhau bằng dấu phẩy.
- **Ưu điểm:** Dễ đọc bằng mắt người (Human-readable), tương thích với hầu hết mọi công cụ (Excel, Python, v.v.).
- **Nhược điểm:**
  - Không có định nghĩa kiểu dữ liệu chặt chẽ (Schema-less), hệ thống thường phải đoán kiểu (infer schema) gây tốn thời gian.
  - Kích thước tệp lớn, không hỗ trợ nén tích hợp sẵn tốt, tốc độ đọc/ghi chậm đối với tập dữ liệu lớn.

### 2. JSON (JavaScript Object Notation)
Định dạng văn bản dựa trên cấu trúc key-value dạng cây.
- **Đặc điểm:** Rất phổ biến trong việc trao đổi dữ liệu qua API hoặc lưu trữ dữ liệu bán cấu trúc (Semi-structured).
- **Ưu điểm:** Human-readable, hỗ trợ cấu trúc dữ liệu lồng nhau (Nested data arrays/objects), dễ dàng thay đổi schema (thêm bớt trường).
- **Nhược điểm:** Dung lượng lưu trữ lớn (do phải lưu cả tên key lặp đi lặp lại), parsing chậm. Jsonlines (JSONL) thường được dùng thay cho JSON mảng thông thường để xử lý dữ liệu lớn theo từng dòng.

### 3. Apache Avro
Định dạng dữ liệu nhị phân (Binary) dựa trên dòng (Row-based) được thiết kế cho kiến trúc Hadoop.
- **Đặc điểm:** Tách biệt cấu trúc (Schema) ra khỏi dữ liệu. Schema được lưu trữ dưới dạng JSON trong phần header của tệp, trong khi dữ liệu được mã hóa nhị phân rất gọn gàng.
- **Ưu điểm:**
  - Tốc độ ghi cực nhanh (nhờ cấu trúc row-based).
  - Hỗ trợ **Schema Evolution** mạnh mẽ (có thể thêm, xóa cột mà không làm hỏng tính toàn vẹn của hệ thống), cho phép dữ liệu cũ đọc bằng schema mới và ngược lại.
- **Ứng dụng:** Là lựa chọn tiêu chuẩn cho các hệ thống Streaming (như Apache Kafka) và lưu trữ dữ liệu nguồn (landing zone).

### 4. Apache Parquet
Định dạng nhị phân theo cột (Columnar), phát triển từ nền tảng Dremel của Google.
- **Đặc điểm:** Lưu trữ dữ liệu và siêu dữ liệu (metadata) theo từng block cột. Metadata chứa thông tin như giá trị max/min, count, null của từng block.
- **Ưu điểm:**
  - Nén dữ liệu xuất sắc (tiết kiệm 70-80% dung lượng so với CSV).
  - Tốc độ đọc rất nhanh cho các câu lệnh tính toán, aggregate.
  - Khả năng **Predicate Pushdown** (Filter Pushdown): Nhờ metadata min/max, các Query Engine (như Spark, Trino) có thể bỏ qua toàn bộ một block dữ liệu nếu điều kiện WHERE không nằm trong khoảng min/max đó, giúp giảm I/O đáng kể.
- **Ứng dụng:** Trở thành tiêu chuẩn "de facto" cho Data Lake và Data Warehouse lưu trữ trên S3/GCS phục vụ cho OLAP.

### 5. Apache ORC (Optimized Row Columnar)
Tương tự như Parquet, ORC là một định dạng lưu trữ dạng cột nhưng có nguồn gốc từ hệ sinh thái Apache Hive.
- **Đặc điểm:** Tối ưu hóa sâu cho việc đọc dữ liệu trên Hadoop.
- **Ưu điểm:** Tính năng nén và đánh chỉ mục (lightweight indexing) tương tự Parquet. Đặc biệt có hỗ trợ tích hợp sẵn ACID cho Hive.
- **Ứng dụng:** Thường được ưu tiên dùng với Hive hoặc Presto, trong khi Parquet lại là "đứa con cưng" của Apache Spark.

---

## Bảng So Sánh Các Định Dạng

| Tính chất | CSV | JSON | Avro | Parquet | ORC |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Kiểu lưu trữ** | Row | Row | Row | Column | Column |
| **Định dạng** | Text | Text | Binary | Binary | Binary |
| **Schema** | Không | Không | Rất tốt (Schema Evolution) | Có | Có |
| **Con người đọc được** | Có | Có | Không | Không | Không |
| **Hiệu năng Đọc (OLAP)**| Kém | Kém | Trung bình | Rất cao | Rất cao |
| **Hiệu năng Ghi (Write)**| Cao | Cao | Rất cao | Thấp | Thấp |
| **Khả năng nén** | Kém | Kém | Tốt | Rất tốt | Rất tốt |
| **Splitable (Phân tán)** | Có (nếu không nén) | Khó | Có | Có | Có |

---

## Tiêu Chí Lựa Chọn Định Dạng Tệp

1. **Pipeline Ingestion (Đưa dữ liệu vào):**
   - Khi ingest từ Kafka hoặc luồng sự kiện (event streams) nơi mỗi tin nhắn (record) được sinh ra liên tục: Chọn **Avro**.
   - Dữ liệu API web: JSON.
2. **Data Lake Storage (Lưu trữ và Truy vấn):**
   - Khi dữ liệu đã được làm sạch và chuẩn bị cho các câu truy vấn phân tích (Aggregation, BI Dashboards): Chọn **Parquet** hoặc **ORC**.
3. **Trao đổi dữ liệu cơ bản:**
   - Khi cần chia sẻ file cho các phòng ban không chuyên sâu về kỹ thuật, hoặc để import vào Excel: Chọn **CSV**.

## Các Kỹ Thuật Tối Ưu Hóa (Performance Tuning)

Khi làm việc với các định dạng như Parquet:
- **Lựa chọn thuật toán nén (Compression Codec):**
  - **Snappy:** Tốc độ nén/giải nén cực nhanh, nhưng tỷ lệ nén ở mức vừa phải. (Thường là mặc định trong Spark/Parquet).
  - **GZIP / ZSTD:** Tỷ lệ nén cao hơn, tiết kiệm không gian đĩa nhiều hơn nhưng tốn CPU để giải nén. ZSTD đang ngày càng phổ biến nhờ sự cân bằng xuất sắc giữa CPU và kích thước.
- **Tránh hiện tượng "Small Files":**
  - Động cơ phân tán (như Spark) rất ghét việc phải mở hàng ngàn file nhỏ (mỗi file vài chục KB) vì tốn kém metadata overhead trên NameNode/S3. Nên thiết lập dung lượng file Parquet đầu ra tối thiểu từ 128MB - 1GB để đạt hiệu suất quét (scan) tối ưu.

## Tài Liệu Tham Khảo
* [Designing Data-Intensive Applications - Martin Kleppmann (Part 2: Distributed Data)](https://dataintensive.net/)
* [Apache Parquet Documentation](https://parquet.apache.org/)
* [Apache Avro Documentation](https://avro.apache.org/)
* **Hadoop: The Definitive Guide - Tom White**
