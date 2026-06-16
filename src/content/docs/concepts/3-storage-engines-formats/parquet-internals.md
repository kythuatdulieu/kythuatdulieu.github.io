---
title: "Apache Parquet Internals"
difficulty: "Advanced"
readingTime: "15 mins"
lastUpdated: 2026-06-15
seoTitle: "Apache Parquet Internals - Cấu Trúc, Encoding & Data Skipping"
metaDescription: "Mổ xẻ kiến trúc bên trong Apache Parquet: Row Group, Page, Repetition/Definition Levels, Dictionary Encoding, RLE và cơ chế Data Skipping (Predicate Pushdown)."
description: "Mổ xẻ kiến trúc bên trong Apache Parquet: Row Group, Page, Repetition/Definition Levels, Dictionary Encoding, RLE và cơ chế Data Skipping (Predicate Pushdown)."
---



Apache Parquet là định dạng lưu trữ dữ liệu dạng cột (columnar storage format) mã nguồn mở, được thiết kế để mang lại hiệu năng cao trong việc truy vấn và phân tích dữ liệu trên hệ sinh thái Hadoop và các hệ thống Data Lake hiện đại (như Spark, Trino, Athena, BigQuery). 

Thay vì lưu trữ dữ liệu theo từng dòng (row-oriented) như CSV hay JSON, Parquet tổ chức dữ liệu theo cột, giúp tối ưu hóa đáng kể cả chi phí lưu trữ (nhờ nén tốt hơn) lẫn tốc độ truy vấn (chỉ đọc những cột cần thiết).

Bài viết này sẽ "mổ xẻ" chi tiết các thành phần bên trong một file Parquet, cách nó nén dữ liệu và cơ chế giúp nó bỏ qua lượng dữ liệu khổng lồ khi truy vấn.

## 1. Kiến trúc phân cấp (Hierarchical Architecture)



Một file Parquet không chỉ đơn giản là các cột được đặt cạnh nhau. Nó sử dụng một cấu trúc phân cấp tinh vi kết hợp giữa khái niệm hàng và cột.

Cấu trúc từ ngoài vào trong bao gồm:

* **File**: Đơn vị vật lý ngoài cùng. Một file chứa metadata ở phần cuối (Footer), một Magic Number (`PAR1`) ở đầu và cuối để nhận diện file, cùng với nhiều Row Groups ở giữa.
* **Row Group**: Là một tập hợp các dòng dữ liệu (thường là từ vài nghìn đến vài triệu dòng). Parquet phân chia dữ liệu theo chiều ngang thành các Row Group trước, sau đó mới chia theo chiều dọc (cột) bên trong mỗi Row Group. Kích thước lý tưởng của một Row Group thường từ 128MB đến 1GB để tối ưu cho việc đọc song song của các worker trong Spark hoặc Trino.
* **Column Chunk**: Bên trong một Row Group, dữ liệu của mỗi cột được gom lại thành một Column Chunk. Điều này có nghĩa là nếu bảng có 10 cột, mỗi Row Group sẽ có 10 Column Chunks. Các Column Chunk trong cùng một Row Group luôn có số lượng giá trị bằng nhau (tương ứng với số dòng).
* **Page**: Là đơn vị lưu trữ và nén nhỏ nhất bên trong Parquet. Mỗi Column Chunk được chia thành nhiều Pages. Kích thước một Data Page thường khoảng 1MB (chưa nén). Có các loại Page chính:
  * **Data Page**: Chứa dữ liệu thực tế đã được mã hóa và nén.
  * **Dictionary Page**: Chứa từ điển các giá trị duy nhất (dùng cho Dictionary Encoding).
  * **Index Page**: Dùng để hỗ trợ việc tìm kiếm nhanh bên trong Column Chunk.

## 2. Footer và Metadata: Trái tim của Data Skipping

Khác với CSV cần đọc từ đầu đến cuối, **Parquet lưu metadata ở cuối file (Footer)**. Khi một engine đọc file Parquet, nó luôn đọc phần Footer đầu tiên.

Footer chứa cấu trúc `FileMetaData`, bao gồm:
1. **Schema**: Định nghĩa các cột, kiểu dữ liệu.
2. **Row Groups Metadata**: Chứa thông tin về tất cả các Row Group trong file.
   * Số dòng trong mỗi Row Group.
   * Thông tin về các Column Chunk bên trong: Offset byte (vị trí bắt đầu của chunk), thuật toán nén đã dùng.
   * **Statistics (Min/Max, Null Count)**: Giá trị nhỏ nhất, lớn nhất và số lượng giá trị Null của cột đó trong Row Group.

Chính nhờ những Statistics này mà Parquet có khả năng **Data Skipping** cực kỳ mạnh mẽ.

### Cơ chế Predicate Pushdown (Filter Pushdown)
Giả sử bạn có câu lệnh: `SELECT name FROM users WHERE age > 30`.
1. Trino/Spark đọc Footer của file Parquet.
2. Với mỗi Row Group, engine kiểm tra metadata của cột `age`.
3. Nếu `Max(age) = 25` trong Row Group số 1, engine **bỏ qua hoàn toàn Row Group này** mà không cần đọc bất kỳ Data Page nào vào bộ nhớ, vì chắc chắn không có user nào > 30 tuổi.
4. Điều này tiết kiệm được lượng lớn I/O disk, CPU và RAM.

## 3. Quản lý dữ liệu lồng nhau (Nested Data) với Dremel

Một trong những sức mạnh lớn nhất của Parquet là khả năng hỗ trợ dữ liệu lồng nhau (Nested structures như Struct, Array, Map) một cách tự nhiên dựa trên thuật toán Dremel của Google.

Để biến đổi dữ liệu phân cấp (hierarchical) thành dạng cột phẳng mà không mất cấu trúc, Parquet sử dụng hai khái niệm: **Repetition Level** và **Definition Level**.

### Definition Level
* Xác định xem một giá trị (ở một độ sâu nhất định trong cấu trúc lồng nhau) có thực sự tồn tại hay bị `NULL`.
* Nó chỉ ra có bao nhiêu trường (fields) trên đường dẫn (path) từ root đến giá trị đó đã được định nghĩa.
* Giúp phân biệt giữa việc mảng rỗng (empty array), struct bị null, hay bản thân giá trị là null.

### Repetition Level
* Dùng cho mảng (Array/List).
* Xác định độ sâu mà tại đó một danh sách lặp lại xuất hiện. 
* Giúp engine biết khi nào một giá trị thuộc về một phần tử mảng mới, và khi nào nó tiếp tục phần tử hiện tại.

*Lưu ý: Đối với dữ liệu dạng phẳng (không nested, không null), Repetition và Definition levels đều bằng 0 và không chiếm thêm dung lượng lưu trữ.*

## 4. Các kỹ thuật Encoding và Compression

Parquet áp dụng Encoding (mã hóa) trước, sau đó mới áp dụng Compression (nén) trên mức Page. 

### Encoding
Encoding làm thay đổi cách biểu diễn dữ liệu để giảm kích thước mà vẫn giữ nguyên thông tin, thường tốn ít CPU hơn Compression.

1. **Dictionary Encoding**: 
   * Cực kỳ hiệu quả cho các cột có số lượng giá trị duy nhất (cardinality) thấp (VD: Quốc gia, Trạng thái, Giới tính).
   * Thay vì lưu chữ "Vietnam" nhiều lần, Parquet tạo một từ điển: `0 -> "Vietnam"`, `1 -> "Singapore"`. Trong Data Page chỉ lưu các số integer (0, 1) tốn cực ít byte.
   * Từ điển được lưu trong Dictionary Page. Nếu từ điển quá lớn (quá 1MB theo mặc định), Parquet sẽ tự động fallback về Plain Encoding cho các page tiếp theo.
2. **Run-Length Encoding (RLE)**:
   * Thường được kết hợp với Dictionary Encoding hoặc dùng cho Definition/Repetition Levels.
   * Thay vì lưu chuỗi `0, 0, 0, 0, 0`, RLE sẽ lưu là `5 lần số 0`.
3. **Bit-Packing**:
   * Khi dùng RLE với các số nguyên nhỏ (VD: giá trị từ điển 0-3 chỉ cần 2 bit), Bit-Packing gộp nhiều giá trị vào chung một byte để tận dụng từng bit lưu trữ.
4. **Delta Encoding**:
   * Tốt cho các cột số nguyên tự tăng hoặc Timestamp.
   * Thay vì lưu `1000, 1005, 1010`, nó lưu giá trị gốc `1000` và các khoảng cách (delta) là `5, 5`.

### Compression
Sau khi Data Page được mã hóa, nó có thể được nén qua các thuật toán tiêu chuẩn. Từng thuật toán có sự đánh đổi giữa kích thước file và tài nguyên CPU.
* **Snappy**: Mặc định trong nhiều hệ thống cũ. Tốc độ nén/giải nén rất nhanh nhưng dung lượng nén chỉ ở mức trung bình.
* **Zstandard (Zstd)**: Đang trở thành chuẩn mới thay thế Snappy. Zstd cung cấp tỷ lệ nén tốt như GZIP nhưng tốc độ giải nén nhanh gần bằng Snappy. *Khuyên dùng cho hầu hết các workload Data Lake.*
* **GZIP**: Tỷ lệ nén cao, tiết kiệm dung lượng lưu trữ tối đa nhưng giải nén tốn nhiều CPU, có thể làm chậm quá trình truy vấn.
* **LZ4**: Cực kỳ nhanh, độ nén kém hơn Zstd một chút.

## 5. Bloom Filter trong Parquet

Mặc dù Min/Max statistics rất hiệu quả cho các dữ liệu có tính tuần tự, nhưng với những dữ liệu ngẫu nhiên (UUID, Hashing ID, Session ID) được phân tán khắp nơi, khoảng Min-Max sẽ rất rộng và làm cho Filter Pushdown vô tác dụng.

Để giải quyết, Parquet (từ v1.12) hỗ trợ **Bloom Filter**.
* Bloom Filter là một cấu trúc dữ liệu xác suất giúp trả lời câu hỏi: *"Giá trị X có nằm trong tập hợp này không?"*
* Câu trả lời có thể là: "Chắc chắn không" hoặc "Có thể có".
* Nếu Bloom Filter nói "Chắc chắn không", engine có thể bỏ qua hoàn toàn Page/Row Group đó khi tìm kiếm một ID cụ thể (VD: `WHERE session_id = 'abc-123'`).
* Cấu hình Bloom Filter giúp tăng tốc độ truy vấn Point-Lookup lên hàng chục lần so với chỉ dùng Min/Max.

## 6. Best Practices khi làm việc với Parquet

Để tối ưu hóa hiệu năng của Parquet trong các kiến trúc Data Lakehouse, bạn cần lưu ý:

1. **Tránh vấn đề Small Files (File quá nhỏ)**
   * Hàng ngàn file Parquet vài KB sẽ phá hủy hiệu năng của Spark/Trino do overhead của việc đọc metadata và I/O mở file.
   * **Best Practice**: Gộp file sao cho mỗi file Parquet có kích thước khoảng 128MB - 1GB.
2. **Kích thước Row Group phù hợp**
   * Default Row Group size thường là 128MB. Nếu dữ liệu có nhiều cột rộng (chuỗi dài), có thể tăng lên 256MB - 512MB để cân bằng tải đọc tuần tự.
3. **Sorting / Z-Ordering (Data Layout)**
   * Min/Max statistics chỉ hiệu quả nếu dữ liệu được sắp xếp.
   * Ví dụ: Bảng giao dịch nên được sắp xếp (`ORDER BY`) theo `transaction_date` trước khi ghi ra Parquet. Khi query theo ngày, các Row Group chứa ngày khác sẽ bị skip hoàn toàn.
   * Nếu cần query nhanh trên nhiều cột (VD: cả `date` và `user_id`), hãy sử dụng kỹ thuật **Z-Ordering** (được hỗ trợ tốt trong Delta Lake/Iceberg) để xen kẽ dữ liệu và tối ưu Min/Max cho đa chiều.
4. **Kiểm soát Dictionary Encoding**
   * Đối với cột High-Cardinality (ID duy nhất), Dictionary Encoding sẽ thất bại và làm tốn CPU vô ích. Một số engine cho phép tắt Dictionary Encoding cho các cột này (VD: `parquet.enable.dictionary=false`).

## Tài Liệu Tham Khảo
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Dremel: Interactive Analysis of Web-Scale Datasets (Google Paper)](https://research.google/pubs/pub36632/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
