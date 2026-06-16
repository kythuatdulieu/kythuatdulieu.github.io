---
title: "Chỉ mục Cơ sở dữ liệu - Indexing"
difficulty: "Intermediate"
tags: ["indexing", "b-tree", "performance", "database"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Chỉ mục Cơ sở dữ liệu (Indexing) - Cách tăng tốc độ truy vấn SQL"
metaDescription: "Hiểu sâu về Database Indexing, cấu trúc dữ liệu B-Tree, Hash Index, cách đánh chỉ mục hiệu quả và những rủi ro khi lạm dụng Index."
description: "Hãy tưởng tượng bạn đang cầm trên tay một cuốn sách bách khoa toàn thư dày 1,000 trang và muốn tìm định nghĩa của cụm từ 'Database'. Nếu cuốn sách không có mục lục..."
---



Hãy tưởng tượng bạn đang cầm trên tay một cuốn sách bách khoa toàn thư dày 1,000 trang và muốn tìm định nghĩa của cụm từ "Database". Nếu cuốn sách không có phần mục lục (Index) ở cuối sách, bạn sẽ phải lật từng trang một từ đầu đến cuối để tìm kiếm. Quá trình này trong cơ sở dữ liệu gọi là **Full Table Scan**, rất tốn kém và chậm chạp. Ngược lại, nếu bạn mở phần chỉ mục, tìm từ "Database" theo thứ tự bảng chữ cái, bạn sẽ biết ngay nó nằm ở trang 402, và lật thẳng đến đó.

Đó chính xác là cách **Indexing (Đánh chỉ mục)** hoạt động trong Database. 

## 1. Indexing là gì?

Indexing là một cấu trúc dữ liệu riêng biệt được cơ sở dữ liệu duy trì nhằm mục đích **tăng tốc độ tra cứu (read/select)** dữ liệu. Thay vì quét toàn bộ bảng, Database Engine có thể dùng Index để nhanh chóng tìm ra vị trí của các bản ghi thỏa mãn điều kiện truy vấn.

Tuy nhiên, Indexing có sự đánh đổi (Trade-offs) quan trọng:
*   **Tăng tốc độ đọc (Read Performance):** Tra cứu dữ liệu cực kỳ nhanh (độ phức tạp O(log N) thay vì O(N)).
*   **Giảm tốc độ ghi (Write Performance):** Mỗi khi bạn `INSERT`, `UPDATE` hoặc `DELETE` một bản ghi trong bảng, hệ quản trị cơ sở dữ liệu không chỉ cập nhật bảng gốc mà còn phải cập nhật lại tất cả các cấu trúc Index liên quan. Điều này làm chậm quá trình ghi.
*   **Tiêu tốn dung lượng lưu trữ (Storage):** Index là các cấu trúc dữ liệu vật lý nên cần thêm dung lượng đĩa cứng và RAM để lưu trữ.

## 2. Các Cấu Trúc Dữ Liệu Cốt Lõi Của Index

Cơ sở dữ liệu truyền thống (RDBMS/OLTP) và các hệ thống phân tích (Data Warehouse/OLAP) sử dụng các loại cấu trúc dữ liệu khác nhau để tạo Index.

### 2.1 B-Tree và B+ Tree (Phổ biến nhất trong OLTP)

**B-Tree (Balanced Tree)** và biến thể phổ biến hơn của nó là **B+ Tree** là cấu trúc dữ liệu mặc định cho Index trong hầu hết các RDBMS như PostgreSQL, MySQL, SQL Server.
*   **Cấu trúc:** Đây là một cây tìm kiếm tự cân bằng (self-balancing tree). Trong B+ Tree, chỉ có các node lá (leaf nodes) chứa dữ liệu thực sự (hoặc con trỏ tới dữ liệu), còn các node trong (internal nodes) chỉ chứa các key để định tuyến. Các node lá được liên kết với nhau bằng danh sách liên kết đôi (doubly linked list), giúp cho việc quét qua một khoảng giá trị (range scan) cực kỳ hiệu quả.
*   **Ứng dụng:** Rất tốt cho các truy vấn chính xác (exact match `WHERE id = 5`) và các truy vấn theo khoảng (range query `WHERE age BETWEEN 20 AND 30`).

### 2.2 Hash Index

*   **Cấu trúc:** Sử dụng Hash Table để ánh xạ trực tiếp từ Khóa (Key) sang vị trí dữ liệu trên đĩa/RAM. Hàm Hash sẽ tính toán một giá trị băm từ khóa.
*   **Đặc điểm:** Tốc độ tra cứu đối với truy vấn so sánh bằng (exact match) như `WHERE username = 'admin'` cực kì nhanh (độ phức tạp O(1)).
*   **Hạn chế:** Hash Index **không thể** được sử dụng cho truy vấn khoảng (range query như `>`, `<`, `BETWEEN`) hay sắp xếp dữ liệu (`ORDER BY`), vì hàm băm phá vỡ thứ tự tự nhiên của dữ liệu.

### 2.3 Bitmap Index

*   **Cấu trúc:** Thay vì lưu trữ giá trị và con trỏ, Bitmap Index sử dụng các mảng bit (0 và 1) để biểu diễn dữ liệu. Mỗi giá trị riêng biệt (distinct value) của cột sẽ có một mảng bit. Bit ở vị trí thứ `i` sẽ là `1` nếu dòng thứ `i` có giá trị đó, ngược lại là `0`.
*   **Ứng dụng:** Hoàn hảo cho các cột có độ phân tán thấp (Low Cardinality) – nghĩa là cột có rất ít các giá trị khác nhau. Ví dụ: cột `Gender` (Nam/Nữ), cột `Status` (Active/Inactive), `Boolean`.
*   **Ưu điểm:** Rất tối ưu cho bộ nhớ và cực kỳ nhanh khi kết hợp nhiều điều kiện `AND`, `OR` (chỉ cần thực hiện phép toán bitwise AND/OR trên các mảng bit). Phổ biến trong OLAP/Data Warehouse truyền thống.

### 2.4 Inverted Index (Chỉ mục đảo ngược)

*   Sử dụng chủ yếu trong các hệ thống Full-Text Search (như Elasticsearch, Apache Solr).
*   Nó phân tách các văn bản thành các từ (terms/tokens) và ánh xạ mỗi từ tới danh sách các tài liệu (documents) chứa từ đó. Rất lý tưởng khi tìm kiếm một từ khóa bên trong một trường văn bản lớn.

## 3. Indexing Trong Modern Data Stack (OLAP & Data Lakes)

Trong thế giới của Big Data, Data Lakes (dùng định dạng Parquet, Iceberg, Delta Lake) hoặc các Cloud Data Warehouse hiện đại (Snowflake, BigQuery), việc duy trì một cấu trúc B-Tree khổng lồ là không khả thi và kém hiệu quả cho workload phân tích. Thay vào đó, chúng áp dụng các chiến lược "Indexing" ở cấp độ tệp (File-level Indexing) và siêu dữ liệu (Metadata):

### 3.1 Min/Max Statistics (Zone Maps)

*   Dữ liệu được lưu trữ dưới dạng các block/file riêng biệt. Hệ thống sẽ lưu trữ Metadata (Siêu dữ liệu) cho mỗi file/block, bao gồm: `min_value`, `max_value`, `null_count` cho mỗi cột.
*   Khi truy vấn `WHERE date = '2023-10-01'`, Database Engine sẽ đọc siêu dữ liệu trước. Nếu `date` của truy vấn không nằm trong khoảng `[min_value, max_value]` của file đó, toàn bộ file sẽ bị bỏ qua không cần đọc lên bộ nhớ (Data Skipping). Kỹ thuật này giảm thiểu lượng I/O cực lớn.

### 3.2 Bloom Filters

*   Một cấu trúc dữ liệu xác suất giúp trả lời nhanh câu hỏi: "Một giá trị X có nằm trong tập hợp này không?".
*   Trả lời **"Chắc chắn không"** hoặc **"Có thể có"**.
*   Parquet sử dụng Bloom Filter để nhanh chóng loại bỏ các Data Pages không chứa giá trị tìm kiếm trước khi phải đọc dữ liệu thực tế.

### 3.3 Z-Ordering & Space-Filling Curves

*   Trong Data Lakehouse (ví dụ Delta Lake), Z-Ordering là kỹ thuật sắp xếp lại dữ liệu đa chiều (multi-dimensional) để các điểm dữ liệu liên quan ở gần nhau về mặt vật lý trên đĩa.
*   Thay vì chỉ sort theo một cột tuyến tính, Z-Ordering giúp "Data Skipping" hoạt động hiệu quả trên nhiều cột đồng thời.

## 4. Các Loại Index Phổ Biến

### 4.1 Clustered Index (Chỉ mục Cụm)

*   **Định nghĩa:** Clustered Index quyết định **thứ tự vật lý** của dữ liệu trong bảng. Bởi vì dữ liệu trên đĩa chỉ có thể được sắp xếp theo một thứ tự vật lý duy nhất, nên **mỗi bảng chỉ có tối đa 1 Clustered Index**.
*   Trong các RDBMS, Primary Key (Khóa chính) thường tự động được dùng làm Clustered Index.
*   **Ví dụ:** Bảng sinh viên được nhóm theo cột `StudentID`. Các bản ghi sinh viên trên đĩa sẽ được lưu theo thứ tự `StudentID` tăng dần.

### 4.2 Non-Clustered Index (Chỉ mục Phi Cụm / Secondary Index)

*   **Định nghĩa:** Index này tạo ra một cấu trúc dữ liệu tách biệt khỏi dữ liệu thực tế. Nó chứa các bản sao của cột được index cùng với một con trỏ (row locator) trỏ về bản ghi gốc trong bảng (hoặc trỏ về Clustered Index key).
*   Một bảng có thể có **nhiều** Non-Clustered Index. Nó giống như phần mục lục ở cuối cuốn sách, mục lục được sắp xếp theo ABC, còn cuốn sách thì được in theo chương.

### 4.3 Composite Index (Chỉ mục Phức Hợp)

*   Là Index được tạo trên **nhiều cột** cùng lúc. Ví dụ: `CREATE INDEX idx_name_age ON users(last_name, first_name, age);`
*   **Quy tắc Tiền tố trái nhất (Leftmost Prefix Rule):** Một Composite Index chỉ có tác dụng nếu truy vấn của bạn sử dụng các cột theo thứ tự từ trái sang phải của Index.
    *   Truy vấn `WHERE last_name = 'Nguyen'` -> Có sử dụng Index.
    *   Truy vấn `WHERE last_name = 'Nguyen' AND first_name = 'An'` -> Có sử dụng Index.
    *   Truy vấn `WHERE first_name = 'An'` -> **KHÔNG** sử dụng Index này (vì thiếu cột `last_name` ở ngoài cùng bên trái).

## 5. Khi Nào Nên Và Không Nên Dùng Index?

### 👍 Nên Dùng:
1.  **Cột thường xuyên nằm trong mệnh đề `WHERE`** với độ phân tán cao (High Cardinality – nhiều giá trị khác biệt như `email`, `user_id`).
2.  **Cột thường dùng để `JOIN`** (Thường là Foreign Keys). Điều này giúp các phép JOIN nhanh hơn rất nhiều.
3.  **Cột dùng trong `ORDER BY`, `GROUP BY`**.

### 👎 Cẩn Trọng / Không Nên Dùng:
1.  **Bảng quá nhỏ:** Nếu bảng chỉ có vài trăm dòng, việc Full Table Scan còn nhanh hơn việc đọc Index rồi mới tham chiếu tới dữ liệu.
2.  **Cột có độ phân tán quá thấp (Low Cardinality):** Ví dụ cột `Gender` (Nam/Nữ) bằng B-Tree Index là lãng phí. Database thà đọc toàn bộ bảng còn hơn duyệt cây B-Tree.
3.  **Bảng có tần suất GHI (`INSERT`/`UPDATE`/`DELETE`) cực lớn:** Index sẽ làm chậm quá trình ghi đáng kể và có thể gây ra hiện tượng phân mảnh (fragmentation).
4.  **Chỉ mục quá nhiều cột (Over-indexing):** Tạo Index cho mọi cột không phải là một chiến lược tốt vì nó làm phình to dung lượng và giết chết hiệu suất ghi.

## Tóm Lược

Indexing là một trong những cơ chế quan trọng bậc nhất của Data Engineering để tối ưu hiệu suất truy vấn. Hiểu rõ sự khác biệt giữa các cấu trúc như B-Tree dùng cho hệ thống giao dịch tốc độ cao (OLTP), và Min/Max Statistics, Bloom Filters, Bitmap cho hệ thống phân tích khối lượng khổng lồ (OLAP) là chìa khóa để thiết kế kiến trúc dữ liệu tốt.

## Tài Liệu Tham Khảo
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
