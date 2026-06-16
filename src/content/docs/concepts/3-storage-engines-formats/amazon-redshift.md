---
title: "Amazon Redshift"
difficulty: "Intermediate"
tags: ["aws", "amazon-redshift", "data-warehouse", "mpp", "olap"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Amazon Redshift là gì? Kiến trúc MPP Data Warehouse của AWS"
metaDescription: "Tìm hiểu chi tiết về Amazon Redshift: Kiến trúc xử lý song song khổng lồ (MPP), sự khác biệt giữa kiến trúc Share-Nothing và RA3, và cách so sánh với BigQuery, Snowflake."
description: "Vào năm 2012, Amazon Web Services (AWS) đã tạo nên một bước ngoặt lớn trong ngành dữ liệu khi giới thiệu **Amazon Redshift** – dịch vụ kho dữ liệu đám mây (Data Warehouse) hoàn toàn được quản lý."
---



Amazon Redshift là dịch vụ kho dữ liệu đám mây (Cloud Data Warehouse) fully-managed, quy mô petabyte của Amazon Web Services (AWS). Được giới thiệu lần đầu vào cuối năm 2012, Redshift đã tạo ra một cuộc cách mạng trong lĩnh vực phân tích dữ liệu bằng cách cung cấp một giải pháp data warehouse hiệu năng cao với chi phí chỉ bằng một phần nhỏ so với các hệ thống on-premises truyền thống.

Dựa trên lõi của hệ quản trị cơ sở dữ liệu ParAccel (một nhánh từ PostgreSQL), AWS đã thiết kế lại hoàn toàn thành một hệ thống xử lý song song khổng lồ (MPP - Massively Parallel Processing) và sử dụng lưu trữ dạng cột (Columnar Storage) chuyên biệt cho các tác vụ phân tích (OLAP).

## 1. Kiến Trúc Của Một Redshift Cluster

Một cluster Redshift cơ bản bao gồm hai thành phần chính: **Leader Node** và các **Compute Nodes**.

* **Leader Node**: 
  - Đóng vai trò là điểm tiếp nhận kết nối từ các ứng dụng client (qua JDBC/ODBC).
  - Phân tích cú pháp (parsing), lập kế hoạch tối ưu hóa truy vấn (query execution plan).
  - Phân phối các bước thực thi (execution steps) xuống cho các Compute Nodes.
  - Tổng hợp kết quả từ các Compute Nodes và trả về cho client.
* **Compute Nodes**:
  - Chịu trách nhiệm thực thi các truy vấn đã được biên dịch và lưu trữ dữ liệu thực tế.
  - Các nút này sở hữu tài nguyên CPU, RAM và Disk độc lập.
* **Slices**:
  - Mỗi Compute Node được chia nhỏ hơn thành các **Slices** (lát cắt). Một slice là một phần phân vùng logic của Compute Node, được phân bổ bộ nhớ và không gian đĩa riêng biệt.
  - Khi dữ liệu được nạp vào Redshift, nó sẽ phân tán qua các slices này dựa trên **Distribution Key**. Việc xử lý được thực hiện độc lập song song trên từng slice.

## 2. Đặc Trưng Xử Lý Dữ Liệu

### 2.1 Lưu Trữ Dạng Cột (Columnar Storage)
Khác với OLTP lưu theo hàng, Redshift lưu trữ theo cột. Khi thực thi truy vấn phân tích thường chỉ cần một vài cột cụ thể, cách lưu trữ này giúp giảm thiểu cực độ khối lượng dữ liệu I/O từ ổ đĩa. Các giá trị trong cùng một cột có tính tương đồng cao, do đó hiệu quả nén (như LZO, Zstandard) đạt mức tối đa.

### 2.2 MPP (Massively Parallel Processing)
Khả năng mở rộng sức mạnh bằng cách đưa khối lượng công việc khổng lồ trải rộng trên nhiều Compute Nodes chạy song song, tận dụng sức mạnh tính toán tổng hợp cho các query phức tạp.

## 3. Sự Tiến Hóa Của Kiến Trúc Storage

### 3.1 Kiến Trúc Shared-Nothing Truyền Thống (DS2, DC2)
Ở các thế hệ cũ, Compute và Storage dính liền trên cùng một node vật lý. Nếu bạn cần lưu trữ nhiều dữ liệu lịch sử hơn nhưng không cần sức mạnh tính toán, bạn vẫn bắt buộc phải nâng cấp bằng cách mua thêm Node mới, điều này gây lãng phí chi phí đáng kể.

### 3.2 Kiến Trúc RA3 (Managed Storage)
Để khắc phục nhược điểm, kiến trúc node RA3 ra đời và tách biệt hoàn toàn Compute và Storage (Decoupled Architecture).
- **Bộ nhớ đệm (Cache) cục bộ**: Các node có SSD dung lượng cao lưu trữ các "hot data" (dữ liệu truy cập thường xuyên).
- **Redshift Managed Storage (RMS)**: Lưu trữ dữ liệu lâu dài một cách bền bỉ trên Amazon S3 ("cold data"). Khi truy vấn yêu cầu dữ liệu không có sẵn ở cache, Redshift tự động lấy từ RMS (S3). Do S3 có chi phí cực rẻ, bạn có thể lưu trữ Petabyte dữ liệu mà không sợ tốn chi phí compute, chỉ phải scale node tính toán khi khối lượng query gia tăng.

## 4. Các Tính Năng Hiện Đại Nổi Bật

### 4.1 Redshift Spectrum & Data Lakehouse
Cho phép bạn chạy các truy vấn SQL trực tiếp trên file lưu trữ trên Amazon S3 dưới các định dạng mở (như Parquet, ORC, JSON, CSV) mà không cần bước ETL nạp dữ liệu vào Redshift. Điều này cho phép mở rộng một truy vấn vừa lấy từ local tables vừa join với dữ liệu ở hồ dữ liệu (Data Lake), tạo thành mô hình kiến trúc **Data Lakehouse** hoàn chỉnh.
*Ghi chú*: Redshift hiện nay còn hỗ trợ việc đọc ghi, truy vấn các định dạng lưu trữ data lake hiện đại và có ACID như **Apache Iceberg**, giúp thống nhất và tăng tốc quá trình vận hành data lakehouse.

### 4.2 Redshift Serverless
Thay vì phải duy trì (provision) cluster 24/7 và trả phí dù không ai truy vấn, Redshift Serverless sẽ tự động khởi động tài nguyên và mở rộng quy mô năng lực tính toán theo yêu cầu của truy vấn (scale automatically) trong vài giây. Chi phí được tính theo số đơn vị RPU (Redshift Processing Units) tiêu thụ trên mỗi giây, phù hợp cho các tải công việc không đều hoặc đột biến (spiky workloads).

### 4.3 Data Sharing
Cho phép chia sẻ dữ liệu an toàn, live giữa nhiều cluster Redshift khác nhau (trong cùng hoặc khác AWS account, cross-region) mà không phải thực hiện quá trình copy hoặc di chuyển dữ liệu. Hỗ trợ lý tưởng cho kiến trúc **Data Mesh**.

### 4.4 Concurrency Scaling
Khi hàng nghìn người cùng xem dashboard vào sáng thứ 2, Redshift có thể tự động thêm các tài nguyên tính toán bổ sung (transient clusters) đằng sau hậu trường để xử lý lượng truy vấn đồng thời này. Tốc độ đáp ứng là tức thì và người dùng gần như không bị xếp hàng chờ.

### 4.5 Tự Động Tối Ưu Hóa (Automatic Table Optimization - ATO)
Trước đây, Redshift đòi hỏi nhiều kỹ thuật của Database Administrator như chọn Distribution Key, Sort Key, chạy `VACUUM` (gom mảnh vỡ) và `ANALYZE` (cập nhật metadata). Giờ đây, ATO ứng dụng Machine Learning để phân tích các mẫu truy vấn và tự động cập nhật sort key / distribution key cũng như chạy vacuum/analyze ở background, biến Redshift tiến gần tới một kho dữ liệu "zero-maintenance".

## 5. Redshift so sánh với các Giải Pháp Khác

### 5.1 Với Snowflake
- **Snowflake** được thiết kế cloud-native từ gốc, tách biệt compute và storage ngay từ ngày đầu. Khả năng scale compute mạnh mẽ và cực kì linh hoạt, hỗ trợ auto-suspend (zero cost khi không chạy). Dễ sử dụng hơn vì gần như không cần tinh chỉnh gì.
- **Redshift** (đặc biệt là Provisioned) có lợi thế về chi phí khi chạy khối lượng dữ liệu khổng lồ liên tục 24/7 do áp dụng được Reserved Instance (mua dài hạn). Mặc dù có Redshift Serverless và RA3 nhưng nó là sự tiến hóa dần lên từ hệ thống legacy, vẫn đòi hỏi một chút tư duy cấu hình trong một số use-case phức tạp. Tích hợp sâu vào hệ sinh thái bảo mật AWS (IAM).

### 5.2 Với Google BigQuery
- **BigQuery** là serverless hoàn toàn mặc định. Tính phí dựa trên số bytes mà câu lệnh SQL scan (hoặc theo Slot-based). Việc scale xử lý cả petabyte trong thời gian ngắn là điểm mạnh tuyệt đối của BigQuery do kiến trúc Dremel.
- **Redshift** quản lý tài nguyên tính toán dựa trên kiến trúc Cluster vật lý/ảo (dù là Serverless cũng là cấp RPU). Tuy nhiên Redshift hỗ trợ tương thích rất cao với các hệ thống migrate từ On-Premises có kiến trúc PostgreSQL, và vẫn là thành phần hạt nhân khi toàn bộ công ty bạn đang chọn AWS làm nền tảng.

## Tài Liệu Tham Khảo
* **AWS Amazon Redshift Documentation**
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
