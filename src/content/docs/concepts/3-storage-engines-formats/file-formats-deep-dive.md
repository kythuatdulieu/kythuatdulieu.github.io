---
title: "Cấu trúc định dạng File: Parquet, ORC, Avro và JSON - Deep Dive"
description: "Phân tích chuyên sâu về các định dạng lưu trữ dữ liệu phổ biến trong Data Engineering: Parquet, ORC, Avro, JSON và CSV. So sánh Row-based vs Columnar và kiến trúc bên trong của từng định dạng."
---



Trong Data Engineering, việc chọn sai định dạng file lưu trữ có thể làm chi phí Cloud (Storage & Compute I/O) của bạn tăng gấp 10 lần và tốc độ truy vấn giảm đi 100 lần. Không có định dạng nào là hoàn hảo cho mọi trường hợp. Bạn phải phân biệt rõ sự khác nhau giữa Row-based (Lưu theo dòng) và Columnar (Lưu theo cột) và hiểu rõ cấu trúc bên trong (internals) của chúng.

## 1. Row-based vs Columnar Storage



Để hiểu rõ tại sao chúng ta lại có nhiều định dạng file như vậy, trước tiên cần phân biệt hai phương pháp lưu trữ dữ liệu: Row-based và Columnar.

### Row-based Storage (Lưu trữ theo dòng)
Dữ liệu được ghi tuần tự từng dòng một. Khi một dòng được ghi vào đĩa cứng, tất cả các trường (fields) của dòng đó được đặt cạnh nhau.
*   **Ví dụ định dạng:** CSV, JSON, Apache Avro.
*   **Ưu điểm:**
    *   Thêm mới dữ liệu cực nhanh (Append-heavy workloads) vì chỉ cần ghi vào cuối file.
    *   Tối ưu khi cần lấy toàn bộ thông tin của một đối tượng cụ thể (truy xuất toàn bộ dòng).
*   **Nhược điểm:**
    *   Không hiệu quả cho truy vấn phân tích (Analytical queries) vì nếu bạn chỉ cần 1 cột, hệ thống vẫn phải quét qua tất cả các cột của dòng dữ liệu từ đĩa cứng.
    *   Nén dữ liệu không hiệu quả vì dữ liệu trong một dòng thường có nhiều kiểu khác nhau (chuỗi, số nguyên, boolean nằm lẫn lộn).

### Columnar Storage (Lưu trữ theo cột)
Dữ liệu được lưu trữ sao cho tất cả các giá trị của một cột được đặt cạnh nhau trên đĩa cứng.
*   **Ví dụ định dạng:** Apache Parquet, Apache ORC.
*   **Ưu điểm:**
    *   **Data Skipping (Projection Pushdown):** Hệ thống chỉ cần đọc dữ liệu của những cột được yêu cầu trong câu lệnh `SELECT`, bỏ qua hoàn toàn I/O của các cột không liên quan.
    *   **Hiệu suất nén cực cao:** Các giá trị trong cùng một cột có cùng kiểu dữ liệu. Điều này cho phép áp dụng các thuật toán nén chuyên dụng như Run-Length Encoding (RLE) hay Dictionary Encoding, giảm dung lượng đáng kể.
    *   **Thực thi các phép toán Aggregate nhanh chóng:** Tính tổng (SUM), đếm (COUNT), trung bình (AVG) trên một cột trở nên vô cùng nhanh.
*   **Nhược điểm:**
    *   Thao tác ghi (Write) và cập nhật (Update) chậm hơn vì một dòng dữ liệu mới cần được bẻ nhỏ để ghi vào nhiều vị trí khác nhau trên đĩa.

---

## 2. Định dạng văn bản: CSV và JSON

Mặc dù không tối ưu cho Big Data, nhưng CSV và JSON vẫn được sử dụng rộng rãi vì tính dễ đọc và tính phổ quát.

### CSV (Comma-Separated Values)
*   **Đặc điểm:** Định dạng văn bản phẳng, không có schema đi kèm, dữ liệu phân tách bằng dấu phẩy.
*   **Hạn chế trong Big Data:**
    *   Không lưu kiểu dữ liệu (tất cả là chuỗi), các engine phân tích phải tốn chi phí ép kiểu (parsing) lúc đọc (Schema-on-read).
    *   Không thể chia nhỏ dễ dàng (Splittable) để xử lý song song trong Hadoop/Spark trừ khi không dùng nén, hoặc dùng các định dạng nén đắt đỏ như bzip2.
    *   Không hỗ trợ kiểu dữ liệu phức tạp (Nested data như Array, Struct).

### JSON (JavaScript Object Notation)
*   **Đặc điểm:** Định dạng phổ biến nhất trong các API và giao tiếp Web. Lưu trữ dưới dạng Key-Value cặp. Cấu trúc linh hoạt (Semi-structured data).
*   **Trong Big Data:** Thường dùng **JSONLines (JSONL)** (mỗi dòng là một object JSON hợp lệ).
*   **Ưu điểm:** Hỗ trợ tốt dữ liệu lồng nhau (Nested structures) phức tạp, cấu trúc linh hoạt.
*   **Hạn chế:** Dung lượng lưu trữ lớn vì phải lưu lại tên của Key lặp đi lặp lại ở mọi dòng. Tốc độ parse chậm. Thường được coi là định dạng ở "vùng hạ cánh" (Landing Zone/Bronze layer) trước khi được chuyển đổi sang Parquet/Avro.

---

## 3. Apache Avro: Nhà Vô Địch Của Row-Based & Streaming

**Avro** lưu dữ liệu theo từng dòng (Row-based) giống CSV hay JSON nhưng dưới dạng **nhị phân (binary)** cực kỳ nhỏ gọn. Nó được thiết kế đặc biệt cho các hệ thống có dữ liệu thay đổi cấu trúc liên tục.

### Kiến trúc của file Avro
Một file Avro bao gồm:
1.  **Header:** Chứa Schema (được định nghĩa bằng JSON), mã nhận diện file, và codec nén.
2.  **Data Blocks:** Các khối dữ liệu chứa hàng loạt các bản ghi nhị phân, được nén lại (thường dùng Snappy). Mỗi block đi kèm với kích thước (size) và số lượng bản ghi (record count), giúp hệ thống đọc có thể chia nhỏ file để xử lý song song.

### Điểm mạnh vô đối: Schema Evolution (Sự tiến hóa cấu trúc)
*   Avro tách biệt cấu trúc (Schema) khỏi dữ liệu. Khi đọc file, hệ thống sẽ lấy schema của file (Writer's Schema) so khớp với schema hiện tại của ứng dụng (Reader's Schema).
*   Tính năng **Schema Resolution** của Avro cho phép xử lý mượt mà việc thêm cột (với giá trị mặc định), xóa cột hay đổi tên cột mà không làm vỡ (break) các data pipeline đang chạy.
*   Trong các hệ thống phân tán, Avro thường được kết hợp với **Confluent Schema Registry** để quản lý phiên bản (versioning) của các cấu trúc.

### Ứng dụng
*   Là tiêu chuẩn vàng (de facto) cho hệ thống Streaming. Được dùng làm định dạng lưu trữ mặc định của các thông điệp truyền qua **Apache Kafka**.
*   Phù hợp cho việc lưu trữ dữ liệu nhật ký (Logs) và các ứng dụng cần ghi dữ liệu liên tục (Write-intensive).

---

## 4. Apache Parquet: Vị Vua Của Columnar & Data Warehouse

Thay vì lưu theo dòng, **Parquet** chặt dữ liệu ra và lưu theo cột (Columnar). Được phát triển chung bởi Twitter và Cloudera, Parquet tối ưu cho các hệ thống xử lý song song (Hadoop, Spark).

### Kiến trúc bên trong file Parquet (Deep Dive)
Kiến trúc của Parquet được chia làm nhiều cấp bậc từ lớn đến nhỏ:

1.  **Row Groups:** File Parquet phân hoạch tập dữ liệu thành nhiều nhóm dòng lớn (thường mỗi nhóm từ 128MB - 1GB, chứa hàng triệu bản ghi). Điều này giúp cân bằng giữa bộ nhớ cần dùng và tốc độ I/O.
2.  **Column Chunks:** Trong mỗi Row Group, dữ liệu được lưu theo cột. Một Column Chunk chứa tất cả giá trị của một cột trong Row Group đó.
3.  **Pages:** Mỗi Column Chunk lại được chia nhỏ thành các Data Pages (thường là 1MB). Page là đơn vị nhỏ nhất để đọc và giải nén. File Parquet sẽ lưu **Statistics (Min/Max, số lượng giá trị Null)** ở mức độ Row Group, Column Chunk và Page.

### Những kỹ thuật tối ưu thần thánh của Parquet:
*   **Dictionary Encoding & RLE (Run-Length Encoding):** Nếu cột "Quốc gia" có 1 triệu dòng nhưng chỉ có 5 quốc gia khác nhau, Parquet sẽ tạo ra một từ điển (Dictionary) gán ID (ví dụ: VN=1, US=2) và sau đó sử dụng RLE để nén những ID giống nhau đứng cạnh nhau, làm dung lượng file thu nhỏ đáng kinh ngạc.
*   **Predicate Pushdown & Data Skipping:** 
    *   Hệ thống đọc Metadata (phần Footer của file Parquet) để lấy các chỉ số Min/Max.
    *   Nếu bạn truy vấn `SELECT * FROM table WHERE Age > 50`, engine sẽ kiểm tra Min/Max của cột Age ở từng Row Group. Nếu max của một Row Group là 40, nó sẽ **bỏ qua hoàn toàn (Skip)** việc đọc Row Group đó từ đĩa, tiết kiệm I/O khổng lồ.
*   **Projection Pushdown:** Nếu bảng của bạn có 100 cột, câu SQL `SELECT Age, Name` sẽ chỉ yêu cầu Parquet đọc đúng 2 Column Chunks tương ứng, 98 cột còn lại trên ổ cứng hoàn toàn không bị chạm đến.

### Ứng dụng
*   Parquet là xương sống của mọi kiến trúc **Data Lake** và **Data Lakehouse** hiện đại (như Delta Lake, Apache Iceberg, Hudi). 
*   Nó tối ưu tuyệt đối cho các tác vụ phân tích dữ liệu nặng (OLAP) với tốc độ quét dữ liệu cực kỳ nhanh.

---

## 5. Apache ORC (Optimized Row Columnar)

**ORC** là một định dạng cột tương tự Parquet nhưng ra đời từ hệ sinh thái Hive (Hortonworks) nhằm khắc phục những điểm yếu của định dạng cột RCFile cũ.

### Cấu trúc ORC
*   Thay vì gọi là Row Group, ORC chia dữ liệu thành các khối lớn gọi là **Stripes** (thường khoảng 250MB).
*   Trong mỗi Stripe, dữ liệu cũng được lưu theo cột. Cuối mỗi file và cuối mỗi Stripe đều có Index (chỉ mục) chứa thống kê (Min, Max, Sum, Count).
*   ORC hỗ trợ **Lightweight Indexing**, bao gồm cả Bloom Filters để kiểm tra sự tồn tại của một giá trị một cách nhanh chóng mà không cần giải nén block.

### So sánh ORC và Parquet
*   **Lợi thế của ORC:** Về mặt lý thuyết, cấu trúc nén của ORC phức tạp hơn và thường cho tỉ lệ nén tốt hơn Parquet khoảng 10-15%. ORC tối ưu cực tốt cho các kiểu dữ liệu phức tạp đặc thù của Hive.
*   **Lợi thế của Parquet:** Mức độ phổ biến. Parquet (được hậu thuẫn bởi Spark/Databricks) có cộng đồng hỗ trợ rộng lớn hơn rất nhiều và được hỗ trợ native bởi mọi công cụ trên Cloud (AWS Athena, Snowflake, Google BigQuery, Redshift). 
*   **Quyết định:** Trừ khi kiến trúc hạ tầng của bạn đang bị khóa chặt (Vendor lock-in) vào Hadoop/Hive truyền thống, **hãy chọn Parquet** làm tiêu chuẩn cho Data Lake.

---

## 6. Tổng kết: Lựa chọn định dạng nào cho Use Case của bạn?

| Tiêu chí | CSV / JSON | Apache Avro | Apache Parquet | Apache ORC |
| :--- | :--- | :--- | :--- | :--- |
| **Loại lưu trữ** | Dòng (Text) | Dòng (Binary) | Cột (Binary) | Cột (Binary) |
| **Trường hợp sử dụng tốt nhất** | Tích hợp hệ thống ngoài, trao đổi dữ liệu API, file cấu hình. | Streaming (Kafka), Schema Evolution mạnh, Write-heavy. | Data Lakehouse, Truy vấn OLAP, Read-heavy. | Hadoop/Hive ecosystem, Truy vấn OLAP. |
| **Tính chia nhỏ (Splittable)** | Không (thường) | Có | Có | Có |
| **Schema** | Schema-on-read | Được nhúng (Header) | Được nhúng (Footer) | Được nhúng (Footer) |
| **Hiệu năng Đọc (Read / OLAP)** | Chậm | Trung bình | **Rất Nhanh** | **Rất Nhanh** |
| **Hiệu năng Ghi (Write)** | Trung bình | **Rất Nhanh** | Chậm hơn | Chậm hơn |
| **Nén dữ liệu** | Kém | Tốt | **Xuất Sắc** | **Xuất Sắc** |

Trong kiến trúc **Medallion Architecture**, các Data Engineer thường thiết kế luồng xử lý như sau:
*   **Bronze Layer (Vùng thô):** Lưu dữ liệu gốc bằng định dạng ban đầu của chúng (JSON, CSV) hoặc lưu trực tiếp dòng sự kiện từ Kafka bằng **Avro**.
*   **Silver / Gold Layer (Vùng tinh chế):** Chuyển đổi hoàn toàn sang **Parquet** (thường được bọc bởi các Table Format như Delta Lake hoặc Iceberg) để tối ưu cho truy vấn phân tích, BI và AI/ML.

---

## Tài Liệu Tham Khảo
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* [Data Engineering Zoomcamp - File formats](https://github.com/DataTalksClub/data-engineering-zoomcamp)
