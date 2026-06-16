---
title: "Phân vùng Dữ liệu - Partitioning"
difficulty: "Intermediate"
tags: ["partitioning", "performance", "data-warehouse", "big-data"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Phân vùng dữ liệu (Partitioning) là gì? Tối ưu hóa Database và Big Data"
metaDescription: "Tìm hiểu chi tiết về kỹ thuật Phân vùng (Partitioning) trong cơ sở dữ liệu và Big Data: Range, Hash, List Partitioning, cách hoạt động và lợi ích tối ưu hóa truy vấn."
description: "Khi cơ sở dữ liệu của bạn phình to từ vài triệu dòng lên hàng tỷ dòng, những câu truy vấn SQL từng chạy trong chớp mắt bỗng trở nên chậm chạp và ì ạch. Partitioning là chìa khóa để giải quyết vấn đề này."
---



Khi dữ liệu của bạn phình to từ vài triệu dòng lên hàng trăm triệu, thậm chí hàng tỷ dòng, những câu truy vấn SQL từng chạy trong chớp mắt bỗng trở nên chậm chạp và ì ạch. Việc quét (scan) toàn bộ một bảng lớn không chỉ tiêu tốn tài nguyên I/O, CPU, RAM mà còn làm tắc nghẽn cả hệ thống. Trong những trường hợp như vậy, **Partitioning** (Phân vùng) là một trong những giải pháp tối ưu hóa hiệu quả và cơ bản nhất.

Partitioning là kỹ thuật chia nhỏ một bảng dữ liệu khổng lồ thành các phần nhỏ hơn, độc lập và dễ quản lý hơn, gọi là các "phân vùng" (partitions). Đối với người dùng hoặc ứng dụng truy vấn, bảng vẫn được nhìn thấy như một thực thể duy nhất, nhưng ở mức vật lý, dữ liệu đã được chia tách thành nhiều phần rời rạc.

## Tại Sao Cần Partitioning?



Việc chia nhỏ dữ liệu mang lại những lợi ích to lớn sau:

1. **Partition Pruning (Cắt tỉa phân vùng):** Đây là lợi ích lớn nhất đối với hiệu năng truy vấn. Khi một câu truy vấn có điều kiện lọc (`WHERE`) dựa trên cột được dùng để phân vùng (partition key), Query Engine có thể bỏ qua hoàn toàn các phân vùng không chứa dữ liệu thoả mãn điều kiện. Thay vì phải quét 1 Terabyte dữ liệu, engine có thể chỉ cần quét 10 Gigabyte dữ liệu của một ngày cụ thể, giúp giảm thiểu lượng I/O khổng lồ.
2. **Quản lý Vòng đời Dữ liệu (Data Lifecycle Management):** Việc xóa dữ liệu cũ (Data Retention) trở nên cực kỳ nhẹ nhàng. Thay vì chạy lệnh `DELETE` tốn kém và gây phân mảnh (fragmentation) cho toàn bộ bảng lớn, bạn chỉ cần `DROP` một phân vùng cũ. Quá trình này diễn ra ngay lập tức và chỉ là thao tác xóa metadata/thư mục.
3. **Tối ưu hóa Index:** Khi dữ liệu được phân vùng, các index cũng có thể được phân vùng theo (Local Index). Điều này giúp kích thước của mỗi index nhỏ hơn, tăng tốc độ tìm kiếm và giảm chi phí bảo trì.
4. **Xử lý Song song (Parallel Processing):** Các framework xử lý phân tán như Apache Spark có thể gán từng partition cho từng worker node riêng biệt, tối đa hóa khả năng tính toán song song.

## Các Cách Tiếp Cận Partitioning Vật Lý

Có hai hướng chính để chia nhỏ dữ liệu:

### 1. Horizontal Partitioning (Phân vùng Ngang)
Đây là cách phổ biến nhất và thường được nhắc tới khi nói về "Partitioning". Bảng được chia theo **dòng**. Ví dụ, một bảng `orders` chứa dữ liệu 3 năm sẽ được chia thành 36 bảng nhỏ, mỗi bảng chứa dữ liệu của một tháng. Tất cả các phân vùng đều có chung một cấu trúc cột (schema). **Sharding** trong cơ sở dữ liệu phân tán cũng là một dạng của Horizontal Partitioning.

### 2. Vertical Partitioning (Phân vùng Dọc)
Bảng được chia theo **cột**. Những cột thường xuyên được truy vấn cùng nhau sẽ được đặt trong một vùng vật lý, trong khi những cột ít được sử dụng, hoặc chứa dữ liệu kích thước lớn (như cột chứa text dài, BLOB) sẽ được tách ra vùng khác. Columnar Storage (như Parquet, ORC) có thể được coi là hình thức cực hạn của Vertical Partitioning.

## Các Kiểu Phân Vùng Phổ Biến (Partitioning Strategies)

Khi sử dụng Horizontal Partitioning, bạn cần chỉ định một tiêu chí để hệ thống biết nên đưa dòng dữ liệu nào vào phân vùng nào. Các tiêu chí này dựa trên **Partition Key** (Cột phân vùng).

### Range Partitioning (Phân vùng theo Khoảng)
Dữ liệu được phân chia dựa trên các khoảng giá trị liên tiếp nhau không chồng chéo.
*   **Ví dụ:** Phân vùng theo cột `created_at`.
    *   Partition 1: Từ `2024-01-01` đến `2024-01-31`
    *   Partition 2: Từ `2024-02-01` đến `2024-02-29`
*   **Ứng dụng:** Đây là kiểu partitioning phổ biến nhất trong Data Warehouse và Data Lake, đặc biệt cho các bảng sự kiện (fact tables), logs (chuỗi thời gian). Cực kỳ hữu ích cho các truy vấn có khoảng thời gian (`BETWEEN`, `>`, `<`).

### List Partitioning (Phân vùng theo Danh sách)
Dữ liệu được phân chia dựa trên một danh sách các giá trị rời rạc cụ thể.
*   **Ví dụ:** Phân vùng theo cột `country_code`.
    *   Partition `VN`: chứa các dòng có `country_code = 'VN'`
    *   Partition `US`: chứa các dòng có `country_code = 'US'`
*   **Ứng dụng:** Phù hợp với các cột có tính chất phân loại (categorical data) và có số lượng giá trị (cardinality) không quá lớn, ví dụ như mã quốc gia, trạng thái đơn hàng.

### Hash Partitioning (Phân vùng bằng Băm)
Dữ liệu được phân bố dựa trên giá trị băm (hash) của cột phân vùng. Hệ thống tính toán hàm hash trên giá trị của cột và lấy modulo cho số lượng phân vùng (ví dụ: `hash(customer_id) % 4`).
*   **Ví dụ:** Phân chia bảng khách hàng thành 4 partitions đều nhau dựa trên `customer_id`.
*   **Ứng dụng:** Mục đích chính của Hash Partitioning là để phân tán dữ liệu thật đồng đều qua các phân vùng, tránh hiện tượng Data Skew (lệch dữ liệu). Nó không hỗ trợ việc quét dữ liệu theo khoảng (range scan), nhưng rất hữu ích cho các hệ thống phân tán (ví dụ: Cassandra, DynamoDB) hoặc để tối ưu hóa quá trình JOIN (như Hash Join).

### Composite Partitioning (Phân vùng Kết hợp)
Sử dụng kết hợp nhiều kỹ thuật phân vùng ở các cấp độ khác nhau. Ví dụ phổ biến nhất là **Range-Hash Partitioning**: dữ liệu ban đầu được phân vùng theo Range (ví dụ: Tháng), sau đó bên trong mỗi Tháng, dữ liệu lại được chia nhỏ tiếp bằng Hash Partitioning (ví dụ: theo `customer_id`).
Điều này vừa giúp tăng tốc truy vấn theo thời gian (nhờ Range), vừa giúp dữ liệu được xử lý song song đồng đều bên trong tháng đó (nhờ Hash).

## Partitioning Trong Big Data & Data Lake

Khái niệm Partitioning trong RDBMS truyền thống (như PostgreSQL, Oracle) thường liên quan mật thiết đến cấu trúc file bên trong engine cơ sở dữ liệu. Tuy nhiên, trong thế giới Big Data (Hadoop, Hive, Spark, Data Lakehouse), partitioning hoạt động dưới dạng **Cấu trúc Thư mục (Directory Structure)**.

### Hive-Style Partitioning
Trong Data Lake (S3, GCS, HDFS), bảng dữ liệu thực chất là các file lưu trữ (Parquet, ORC, CSV) nằm trong các thư mục. Khi sử dụng Hive-style partitioning, cấu trúc thư mục được thiết kế dưới dạng `key=value`.

Ví dụ với một bảng được phân vùng theo `year` và `month`:

```text
/my_data_lake/sales_table/
├── year=2024/
│   ├── month=01/
│   │   ├── data_part1.parquet
│   │   └── data_part2.parquet
│   ├── month=02/
│   │   └── data_part1.parquet
├── year=2025/
│   ├── month=01/
│   │   └── data_part1.parquet
```

Khi bạn chạy truy vấn `SELECT * FROM sales_table WHERE year=2024 AND month=01`, Spark hoặc Presto/Trino sẽ **không** quét toàn bộ thư mục `/my_data_lake/sales_table/`. Chúng nhìn vào siêu dữ liệu (metadata) hoặc liệt kê cấu trúc thư mục, nhận ra điều kiện truy vấn khớp với đường dẫn `year=2024/month=01/`, và chỉ tải các file Parquet nằm trong đúng thư mục đó. Đây chính là **Partition Pruning** ở cấp độ file system.

## Những Lưu Ý Quan Trọng (Caveats) và Best Practices

Mặc dù mạnh mẽ, partitioning nếu sử dụng sai cách sẽ gây phản tác dụng (Anti-pattern).

### 1. Tránh Lỗi "Over-Partitioning" (Small Files Problem)
Đây là lỗi phổ biến nhất. Nếu bạn chọn cột phân vùng có quá nhiều giá trị khác biệt (high cardinality), ví dụ như `created_at_timestamp` (chính xác đến từng giây) hay `user_id` thay vì `date`, bạn sẽ tạo ra hàng triệu thư mục phân vùng.
Mỗi phân vùng chỉ chứa vài file rất nhỏ (vài KB). Khi truy vấn, engine phải mở và đọc meta-data của hàng nghìn file thay vì đọc tuần tự một file lớn. Overhead (chi phí quản lý) của việc mở file sẽ hoàn toàn áp đảo lợi ích của việc đọc ít dữ liệu đi, khiến hệ thống chậm chạp một cách thảm họa (Small Files Problem).
**Quy tắc ngón tay cái:** Một phân vùng nên chứa ít nhất vài trăm MB đến vài GB dữ liệu. Cố gắng giữ dung lượng file Parquet ở mức 128MB - 512MB.

### 2. Chọn Partition Key Phù Hợp với Mẫu Truy Vấn (Query Pattern)
Partitioning chỉ phát huy tác dụng (Partition Pruning) khi **cột được phân vùng xuất hiện trong mệnh đề `WHERE`** của hầu hết các câu truy vấn.
Nếu bạn phân vùng theo `Ngay_Tao_Don_Hang`, nhưng người dùng lại thường xuyên tìm kiếm theo `Ma_Khach_Hang`, hệ thống vẫn phải quét toàn bộ các phân vùng (Full Scan) để tìm khách hàng đó, gây lãng phí tài nguyên vô ích.

### 3. Data Skew (Lệch Dữ Liệu)
Lệch dữ liệu xảy ra khi kích thước các phân vùng không đồng đều. Ví dụ, phân vùng theo `country` nhưng 90% khách hàng của bạn ở `VN`. Phân vùng `VN` sẽ khổng lồ, trong khi các phân vùng khác quá nhỏ. Khi xử lý song song (như Spark), task xử lý phân vùng `VN` sẽ chạy rất lâu (straggler), khiến toàn bộ job bị chậm theo.

### 4. Kết Hợp Các Kỹ Thuật Khác
Nếu bạn có nhiều mẫu truy vấn (query patterns) khác nhau, Partitioning theo 1 cột là không đủ. Lúc này, bạn có thể kết hợp:
*   **Partitioning (theo Thời gian) + Bucketing/Clustering (theo ID):** Bucketing (trong Hive) cũng tương tự Hash Partitioning, giúp gom nhóm dữ liệu có cùng đặc tính vào chung file vật lý.
*   **Z-Ordering / Liquid Clustering:** Các Data Lakehouse hiện đại (như Delta Lake, Apache Iceberg) hỗ trợ các kỹ thuật gom cụm đa chiều (multi-dimensional clustering) như Z-Ordering. Z-Ordering tối ưu hóa bố cục dữ liệu trên nhiều cột đồng thời, giúp Data Skipping (nhảy cóc dữ liệu) hiệu quả cho nhiều loại truy vấn khác nhau mà không cần phải định nghĩa cấu trúc phân vùng cứng nhắc ngay từ đầu. Khác biệt với việc chia thư mục vật lý như Hive-style, metadata của các bảng Iceberg/Delta quản lý range min-max của từng file, giúp truy vấn cắt tỉa file cực kỳ mạnh mẽ.

## Tổng Kết

Partitioning là kỹ thuật nền tảng trong thiết kế dữ liệu, đóng vai trò sống còn trong việc kiểm soát hiệu suất và chi phí khi dữ liệu đạt đến quy mô lớn. Việc thấu hiểu các loại partitioning, cách chúng hoạt động ở tầng vật lý và những cạm bẫy (như over-partitioning) sẽ giúp Data Engineer thiết kế những kiến trúc dữ liệu mạnh mẽ, có khả năng mở rộng hàng Petabyte.

## Tài Liệu Tham Khảo
* [PostgreSQL Partitioning Documentation](https://www.postgresql.org/docs/current/ddl-partitioning.html)
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: Partitioning](https://iceberg.apache.org/docs/latest/partitioning/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
