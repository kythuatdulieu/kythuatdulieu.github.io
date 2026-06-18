---
title: "Phân cụm Dữ liệu - Clustering"
difficulty: "Intermediate"
tags: ["clustering", "performance", "big-data", "storage"]
readingTime: "7 mins"
lastUpdated: 2026-06-07
seoTitle: "Clustering Dữ liệu là gì? So sánh Clustering vs Partitioning"
metaDescription: "Tìm hiểu Clustering (Phân cụm dữ liệu) trong Database/Data Warehouse, cơ chế gom nhóm vật lý các bản ghi tương đồng để tăng tốc truy vấn lọc dữ liệu."
description: "Trong các hệ thống [Data Warehouse](/concepts/1-distributed-systems-architecture/data-warehouse) hiện đại, khi đối mặt với những bảng dữ liệu khổng lồ lên tới hàng trăm ..."
---



Clustering (Phân cụm dữ liệu) là kỹ thuật gom cụm dữ liệu trên Data Lake hoặc Data Warehouse để tối ưu hóa truy vấn. Bằng cách sắp xếp các bản ghi có chung thuộc tính nằm cạnh nhau trên ổ cứng vật lý, hệ thống có thể tận dụng **Data Skipping** (hoặc Predicate Pushdown) để bỏ qua các khối dữ liệu không liên quan, tăng tốc độ đọc lên hàng chục lần.

Trong các hệ thống quản trị dữ liệu quy mô lớn, việc tối ưu hoá thời gian truy vấn và tiết kiệm chi phí I/O (Input/Output) luôn là ưu tiên hàng đầu. Thay vì chỉ chia cắt dữ liệu một cách cứng nhắc thành các thư mục (Partitioning), Clustering tối ưu hoá cách thức các dòng dữ liệu được sắp xếp và lưu trữ bên trong các tệp dữ liệu vật lý.

## 1. Cơ chế hoạt động của Clustering

Clustering hoạt động dựa trên nguyên tắc **sắp xếp dữ liệu gần nhau dựa trên giá trị của một hoặc nhiều cột**. Khi dữ liệu được nạp (ingest) hoặc ghi đè (rewrite) vào hệ thống, các storage engine sẽ nhóm các bản ghi có chung giá trị (hoặc giá trị gần nhau) vào các tệp dữ liệu chung hoặc các row-group kế tiếp nhau.

### 1.1 Sắp xếp Vật lý (Physical Sorting)
Giả sử bạn thiết lập clustering cho bảng dựa trên cột `user_id`. Toàn bộ dữ liệu sẽ được sắp xếp theo thứ tự `user_id` trước khi được chia thành các tệp Parquet hay ORC. Kết quả là, thông tin của cùng một người dùng sẽ nằm trong cùng một tệp (hoặc một vài tệp sát nhau), thay vì nằm rải rác ở hàng nghìn tệp khác nhau.

### 1.2 Metadata và Data Skipping
Sức mạnh lớn nhất của clustering nằm ở chỗ nó tạo điều kiện hoàn hảo cho cơ chế **Data Skipping**. Ở các định dạng lưu trữ dạng cột (Columnar Formats) như Parquet hay ORC, với mỗi tệp dữ liệu, hệ thống sẽ lưu trữ lại các siêu dữ liệu (metadata) cơ bản như:
* `min_value` (Giá trị nhỏ nhất)
* `max_value` (Giá trị lớn nhất)
* `null_count` (Số lượng giá trị rỗng)

Khi có truy vấn `SELECT * FROM table WHERE user_id = 1005`, engine truy vấn sẽ đọc file metadata trước. Nếu khoảng `[min_value, max_value]` của một tệp là `[1, 500]`, engine sẽ **ngay lập tức bỏ qua tệp này** mà không cần mở nội dung bên trong, tiết kiệm hàng loạt tài nguyên I/O.

## 2. So sánh Clustering vs Partitioning

Một câu hỏi kinh điển khi thiết kế dữ liệu: *"Tôi đã có Partitioning, tại sao còn cần Clustering?"*

Mặc dù cả hai đều nhằm mục đích thu hẹp phạm vi dữ liệu cần quét (Data Pruning), nhưng chúng áp dụng cho các tình huống hoàn toàn khác nhau.

| Đặc điểm | Partitioning (Phân vùng) | Clustering (Phân cụm) |
| :--- | :--- | :--- |
| **Bản chất** | Chia nhỏ dữ liệu thành các thư mục vật lý (directory) trên storage. | Sắp xếp dữ liệu vật lý bên trong các tệp (files/blocks). |
| **Phù hợp với** | Cột có độ phân tán (cardinality) thấp. VD: `year`, `month`, `country_code` (tối đa vài nghìn giá trị). | Cột có độ phân tán cao (high cardinality). VD: `user_id`, `session_id`, `email` (hàng triệu, tỷ giá trị). |
| **Vấn đề tiềm ẩn** | Nếu partition bằng `user_id`, hệ thống sẽ tạo ra hàng triệu thư mục rất nhỏ (Vấn đề Small Files), gây sập metadata server. | Không gặp vấn đề Small Files vì dữ liệu vẫn được gom vào các tệp lớn, chỉ là được sắp xếp bên trong tệp. |
| **Tính linh hoạt** | Rất cứng nhắc. Đổi partition key thường yêu cầu viết lại toàn bộ dữ liệu. | Linh hoạt hơn. Dữ liệu mới chưa cluster có thể từ từ được gom cụm (re-clustered) ở background. |

Thực tế, kiến trúc phổ biến nhất là **kết hợp cả hai**: Partition theo thời gian (ví dụ: `event_date`) và Cluster theo ID người dùng (`user_id`). Khi tìm kiếm sự kiện của một user trong một ngày cụ thể, hệ thống sẽ chui vào đúng folder của ngày hôm đó (nhờ Partition), sau đó đọc đúng tệp chứa ID của user (nhờ Cluster).

## 3. Lợi ích mạnh mẽ của Clustering

### 3.1 Tối ưu hoá truy vấn (I/O Reduction)
Việc loại bỏ các vùng dữ liệu không chứa thông tin cần tìm giúp tăng tốc độ truy vấn đáng kể. Điều này đặc biệt ý nghĩa đối với các cloud data warehouse tính phí theo lượng dữ liệu được quét (như Google BigQuery hay AWS Athena).

### 3.2 Cải thiện hiệu suất nén dữ liệu (Data Compression)
Các thuật toán nén phổ biến trong Big Data (Snappy, Zstd, Gzip) hoạt động bằng cách tìm các chuỗi dữ liệu lặp lại gần nhau. Việc dùng Clustering khiến các giá trị giống nhau (ví dụ: `country="VN"`) nằm liền kề sát nhau, nhờ đó **tỷ lệ nén (compression ratio)** được cải thiện rõ rệt, tiết kiệm dung lượng lưu trữ trên ổ đĩa.

## 4. Những thách thức khi sử dụng Clustering

Dù có nhiều lợi ích, Clustering đòi hỏi sự đánh đổi về mặt chi phí tính toán:

### 4.1 Chi phí Ghi (Write Amplification)
Để sắp xếp dữ liệu, hệ thống phải mất thời gian và tài nguyên CPU trong quá trình nạp. Sắp xếp một khối lượng dữ liệu khổng lồ là một tác vụ tốn kém. Do đó, thời gian để chạy lệnh `INSERT` / `UPDATE` vào bảng được clustering thường sẽ chậm hơn so với bảng thông thường.

### 4.2 Suy giảm chất lượng Clustering theo thời gian (Data Skewness)
Khi dữ liệu được ghi liên tục theo từng batch nhỏ (Streaming hoặc Micro-batch), các file mới sinh ra sẽ chưa kịp sắp xếp chung với các file cũ. Theo thời gian, cấu trúc dữ liệu bị phân mảnh, dẫn đến việc engine không thể bỏ qua dữ liệu hiệu quả nữa. 
Để duy trì hiệu suất, Data Engineer cần thiết lập các tiến trình chạy ngầm (background jobs) để dọn dẹp, tái sắp xếp lại dữ liệu định kỳ (ví dụ: lệnh `OPTIMIZE` trong Delta Lake hay `ALTER TABLE ... CLUSTER BY` trong BigQuery).

## 5. Các Thuật Toán Clustering Nâng Cao (Đa chiều)

Sắp xếp tuyến tính (Linear Sorting) làm việc rất tốt khi ta cần gom cụm theo 1 cột. Nhưng khi có nhiều cột (ví dụ `city` và `category_id`), việc sắp xếp tuần tự thường dẫn đến việc cột thứ hai không được hưởng nhiều lợi ích. Để giải quyết, các engine dữ liệu hiện đại áp dụng các cơ chế phân cụm đa chiều:

### 5.1 Z-Ordering (Đường cong Z)
Z-Ordering là kỹ thuật ánh xạ không gian nhiều chiều thành một chiều nhưng vẫn duy trì được **tính liên kết không gian (spatial locality)** của các điểm dữ liệu gần nhau. Khi sử dụng Z-Ordering trên nhiều cột, truy vấn có thể thực hiện Data Skipping một cách đồng đều trên mọi cột tham gia vào khoá Z-Order. Kỹ thuật này rất phổ biến trong hệ sinh thái Databricks (Delta Lake) và Apache Hudi.

### 5.2 Liquid Clustering
Ra mắt vào cuối năm 2023 bởi Databricks dành cho Delta Lake, **Liquid Clustering** hướng tới việc thay thế hoàn toàn cấu trúc Partitioning và Z-Ordering tĩnh truyền thống. Tính năng này cho phép hệ thống tự động thay đổi layout vật lý của bảng để phản hồi linh hoạt với sự thay đổi của pattern truy vấn và khối lượng dữ liệu theo thời gian, giúp đơn giản hoá việc cấu hình của Data Engineer.

## 6. Ví dụ cấu hình Clustering thực tế

### Google BigQuery
BigQuery hỗ trợ clustering lên đến 4 cột. Cột được cluster phải thuộc các loại dữ liệu được hỗ trợ.
```sql
CREATE TABLE my_dataset.sales (
  transaction_id STRING,
  customer_id STRING,
  sales_date DATE,
  amount FLOAT64
)
PARTITION BY sales_date
CLUSTER BY customer_id;
```

### Databricks (Delta Lake)
Tối ưu hóa dữ liệu trong Delta Table bằng lệnh `OPTIMIZE` và áp dụng Z-Ordering.
```sql
-- Dồn các file nhỏ thành file lớn và phân cụm theo user_id, event_type
OPTIMIZE events ZORDER BY (user_id, event_type);
```

### Snowflake
Trong Snowflake, Clustering được định nghĩa thông qua "Cluster Keys". Dịch vụ "Automatic Clustering" của Snowflake sẽ tự động tái sắp xếp lại dữ liệu chạy ngầm trong background mà không cần phải gọi thủ công (tuy nhiên sẽ phát sinh compute credit).
```sql
ALTER TABLE my_table CLUSTER BY (user_id, created_at);
```

## 7. Lời khuyên (Best Practices)

- **Chọn khoá phân cụm cẩn thận**: Các cột thường được sử dụng trong mệnh đề `WHERE` (bộ lọc) hoặc `JOIN` nên được ưu tiên làm khoá phân cụm.
- **Giới hạn số cột**: Đừng chọn quá nhiều cột để phân cụm. Thường từ 1 đến 4 cột là tốt nhất. Số cột càng nhiều, hiệu suất phân cụm cho mỗi cột riêng lẻ càng giảm, đồng thời overhead sắp xếp càng cao.
- **Kích thước bảng**: Clustering chỉ phát huy sức mạnh đáng kể trên các bảng lớn (thường là từ vài GB hoặc hàng trăm triệu dòng trở lên). Với các bảng nhỏ, overhead của việc sắp xếp và bảo trì sẽ lớn hơn lợi ích nó mang lại.

## Tài Liệu Tham Khảo
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
