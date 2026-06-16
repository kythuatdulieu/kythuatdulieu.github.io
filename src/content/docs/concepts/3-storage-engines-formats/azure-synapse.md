---
title: "Azure Synapse Analytics"
difficulty: "Intermediate"
tags: ["azure", "data-warehouse", "big-data", "synapse", "cloud"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Azure Synapse Analytics - Nền tảng phân tích dữ liệu đám mây toàn diện"
metaDescription: "Tìm hiểu chi tiết về Azure Synapse Analytics: định nghĩa, kiến trúc MPP, Dedicated và Serverless SQL Pools, Apache Spark, và các phương pháp tối ưu hóa."
description: "Trong các doanh nghiệp lớn, dữ liệu thường bị phân mảnh ở nhiều nơi: dữ liệu có cấu trúc lưu trong Data Warehouse, còn dữ liệu phi cấu trúc nằm rải rác trên Data Lake. Azure Synapse Analytics ra đời để giải quyết bài toán này..."
---



Trong các doanh nghiệp lớn, dữ liệu thường bị phân mảnh ở nhiều nơi: dữ liệu có cấu trúc ổn định được lưu trữ trong kho dữ liệu (Data Warehouse) phục vụ báo cáo BI, trong khi khối lượng khổng lồ dữ liệu phi cấu trúc, bán cấu trúc lại nằm rải rác trên các Data Lake để phục vụ Machine Learning và Big Data. Sự phân mảnh này tạo ra các "bức tường" (data silos) cản trở việc phân tích toàn diện.

**Azure Synapse Analytics** là giải pháp phân tích dữ liệu vô hạn của Microsoft ra đời nhằm phá vỡ các bức tường đó. Nền tảng này tham vọng hợp nhất (Unified) hoàn toàn giữa Data Warehouse truyền thống và Data Lake/Big Data trên cùng một không gian làm việc.

---

## 1. Azure Synapse Analytics là gì?



Azure Synapse Analytics thực chất là sự tiến hóa của **Azure SQL Data Warehouse (SQL DW)**. Tuy nhiên, thay vì chỉ là một kho dữ liệu quan hệ, Microsoft đã tái cấu trúc và mở rộng nó thành một nền tảng phân tích dữ liệu toàn diện.

Nền tảng này mang đến sự kết hợp chưa từng có giữa:
- Khả năng truy vấn bằng **SQL** ở quy mô doanh nghiệp phục vụ Data Warehousing.
- Công nghệ **Apache Spark** phục vụ các tác vụ Big Data và Machine Learning.
- Công cụ **Data Explorer (Kusto)** chuyên trị phân tích log và dữ liệu chuỗi thời gian (time-series).
- Hệ thống tích hợp dữ liệu (Data Integration/ETL) kế thừa sức mạnh từ **Azure Data Factory**.
- Giao diện quản lý tập trung duy nhất gọi là **Synapse Studio**.

---

## 2. Các Engine tính toán cốt lõi (Compute Engines)

Azure Synapse không ép người dùng phải chọn một công cụ duy nhất. Thay vào đó, nó cung cấp nhiều "engine" khác nhau để người dùng lựa chọn tùy thuộc vào đặc thù công việc.

### 2.1. Synapse SQL
Hệ thống SQL của Synapse hỗ trợ T-SQL hoàn chỉnh và được chia làm hai mô hình:

* **Dedicated SQL Pool (Trước đây là SQL DW):** 
  Đây là môi trường Data Warehouse truyền thống dành cho các workload cần hiệu năng ổn định và dự đoán được. Khách hàng cấp phát (provision) tài nguyên dưới dạng **DWU (Data Warehouse Units)**. Dữ liệu được lưu trữ trực tiếp bên trong các bảng quan hệ với kiến trúc MPP (Massively Parallel Processing - Xử lý song song phân tán). Nó cực kỳ mạnh mẽ khi cần phục vụ các câu truy vấn phức tạp trên dữ liệu lớn có cấu trúc cho bảng điều khiển BI (Dashboards).

* **Serverless SQL Pool:**
  Đây là một bước đột phá của Synapse. Bạn không cần cấp phát trước bất kỳ cụm máy chủ nào. Serverless SQL cho phép bạn viết câu lệnh SQL tiêu chuẩn để truy vấn trực tiếp vào các file lưu trên Data Lake (định dạng CSV, Parquet, JSON, Delta Lake) mà **không cần phải copy hay load dữ liệu vào Database (Zero-ETL)**. Bạn chỉ bị tính phí dựa trên lượng dữ liệu mà câu truy vấn quét qua (Pay-per-query, thường là ~$5/TB data processed). Nó hoàn hảo cho việc khám phá dữ liệu (Data Exploration) nhanh chóng.

### 2.2. Apache Spark Pool
Dành cho Data Engineer và Data Scientist thích sử dụng Python, Scala, Java, hoặc C# (.NET).
* Cung cấp các cụm Apache Spark được quản lý tự động (fully managed).
* Tích hợp sẵn Delta Lake (mặc dù không mạnh bằng Databricks) hỗ trợ mô hình Lakehouse.
* Dùng cho quá trình chuẩn bị dữ liệu lớn (ETL/ELT), làm sạch dữ liệu, và huấn luyện các mô hình Machine Learning.
* Auto-scaling linh hoạt: Tự động thêm/bớt node dựa trên khối lượng tính toán.

### 2.3. Data Explorer Pool
* Tối ưu hóa đặc biệt cho phân tích Log (Nhật ký hệ thống) và Telemetry (Dữ liệu từ xa/IoT).
* Sử dụng ngôn ngữ truy vấn KQL (Kusto Query Language) – một ngôn ngữ cực kỳ mạnh mẽ và nhanh gọn để tìm kiếm văn bản tự do (free-text search) và phân tích chuỗi thời gian.

---

## 3. Kiến trúc MPP của Dedicated SQL Pool

Để tận dụng sức mạnh của Dedicated SQL Pool, Data Engineer bắt buộc phải hiểu kiến trúc **MPP (Massively Parallel Processing)** đằng sau nó.

Khác với SQL Server truyền thống chạy trên một máy chủ (SMP), Synapse SQL Pool tách biệt phần tính toán (Compute) và lưu trữ (Storage).
1. **Control Node (Nút điều khiển):** Là não bộ của hệ thống. Khi bạn gửi câu query, Control Node nhận lệnh, tối ưu hóa câu truy vấn, chia nhỏ nó ra thành nhiều tác vụ song song và gửi xuống các Compute Nodes.
2. **Compute Nodes (Các nút tính toán):** Chịu trách nhiệm thực thi câu truy vấn trên một phần dữ liệu và trả kết quả về cho Control Node. Số lượng Compute nodes thay đổi theo mức DWU bạn chọn.
3. **Data Movement Service (DMS):** Đảm bảo dữ liệu được vận chuyển (shuffle) nhanh chóng giữa các Compute nodes khi cần thực hiện các phép JOIN phức tạp.

**Chiến lược phân phối dữ liệu (Data Distribution):**
Dữ liệu trong Synapse được tự động chia thành **60 phân vùng (distributions)**. Việc bạn chọn cách phân bổ dữ liệu vào 60 vùng này quyết định 90% hiệu năng của hệ thống. Có 3 kiểu chính:
* **Hash Distribution:** Dữ liệu được băm (hash) dựa trên một cột khóa (Key column) và phân bổ đều. Rất tốt cho các bảng Fact lớn (Bảng sự kiện).
* **Round-Robin:** Dữ liệu được chia đều ngẫu nhiên, đơn giản, dễ dùng cho các bảng Staging (tạm thời) khi chưa biết chọn cột nào làm khóa.
* **Replicate:** Dữ liệu được copy toàn bộ ra tất cả các Compute nodes. Rất tốt cho các bảng Dimension nhỏ (Bảng chiều), giúp các lệnh JOIN diễn ra ngay tại node tính toán (nhanh hơn vì không cần di chuyển dữ liệu qua mạng).

---

## 4. Hệ sinh thái và Tích hợp (Integration)

Điểm ăn tiền lớn nhất của Synapse là sự tích hợp sâu rộng vào hệ sinh thái của Microsoft:

* **Synapse Studio:** Giao diện Web duy nhất, nơi bạn có thể vừa viết SQL, vừa chạy Spark Notebook, vừa kéo thả làm Data Pipeline.
* **Synapse Pipelines:** Động cơ ETL ẩn bên dưới chính là Azure Data Factory. Nó cho phép kéo thả hàng trăm connector có sẵn để hút dữ liệu từ Salesforce, SAP, Oracle, SQL Server, REST API,... trực tiếp về Data Lake.
* **Azure Data Lake Storage Gen2 (ADLS Gen2):** Lớp lưu trữ cơ bản, mọi dịch vụ (Spark, SQL Serverless) đều đọc/ghi dữ liệu từ đây, đảm bảo duy nhất một nguồn sự thật (Single source of truth).
* **Power BI:** Tích hợp trực tiếp vào Synapse Studio. Bạn có thể xây dựng báo cáo và visualize trực tiếp dữ liệu từ SQL Pool ngay trong cùng một trình duyệt mà không cần chuyển tool.
* **Microsoft Purview:** Tích hợp quản trị dữ liệu (Data Governance), theo dõi Data Lineage và khám phá dữ liệu toàn doanh nghiệp.

---

## 5. Ưu điểm và Thách thức

### Ưu điểm nổi bật:
1. **All-in-one Platform:** Không cần chắp vá nhiều công cụ (như dùng AWS Glue + Redshift + Athena riêng biệt). Synapse cung cấp một trải nghiệm liền mạch cho cả DE, DA và DS.
2. **Serverless SQL kỳ diệu:** Rất nhiều doanh nghiệp yêu thích Serverless SQL vì nó cho phép truy cập dữ liệu Parquet/CSV qua SQL ngay lập tức với chi phí cực thấp, không cần duy trì server.
3. **Bảo mật cấp doanh nghiệp:** Thừa hưởng mọi tiêu chuẩn bảo mật khắt khe của Azure (Azure Active Directory, Row-Level Security, Column-Level Security, Dynamic Data Masking, VNet tích hợp).
4. **Hiệu năng kho dữ liệu vượt trội:** Khi được thiết kế Distribution và Indexing (như Clustered Columnstore Index) chuẩn xác, Dedicated SQL Pool xử lý hàng chục Terabyte dữ liệu trong chớp mắt.

### Thách thức & Nhược điểm:
1. **Quản trị chi phí phức tạp:** Dedicated SQL Pool tính phí theo giờ và khá đắt đỏ (có thể lên tới hàng nghìn đô la một tháng nếu cấu hình cao mà quên không tạm dừng - Pause).
2. **Spark Runtime đi sau Databricks:** Engine Spark của Synapse thường cập nhật phiên bản chậm hơn và không có những bộ tối ưu hóa (như Photon) hay quản lý transaction sâu cấp độ file mạnh mẽ như Delta Engine trên Azure Databricks. Rất nhiều doanh nghiệp chọn dùng Databricks để làm ETL (Spark) và chỉ dùng Synapse cho lớp DW phục vụ báo cáo.
3. **Độ khó khi tối ưu hóa:** Sử dụng Dedicated SQL Pool đòi hỏi kỹ sư phải rất am hiểu về kiến trúc phân tán (MPP). Nếu chọn sai Distribution Key hoặc quên cập nhật Statistics (thống kê), các câu lệnh JOIN sẽ chạy rất chậm do tình trạng di chuyển dữ liệu (Data Skew / Data Shuffle) ồ ạt.

---

## 6. Tổng kết

Azure Synapse Analytics là một nền tảng đầy tham vọng và mạnh mẽ của Microsoft, phù hợp cho các doanh nghiệp lớn đã và đang sử dụng hệ sinh thái Azure, muốn một nền tảng quy tụ mọi nhu cầu từ chuẩn bị dữ liệu (ETL), kho dữ liệu (Data Warehouse), cho đến khoa học dữ liệu (Machine Learning).

Tuy nhiên, với xu hướng Lakehouse đang ngày càng phổ biến, Microsoft gần đây cũng đã ra mắt **Microsoft Fabric** (một nền tảng SaaS dựa trên nền tảng cốt lõi của Synapse nhưng tối ưu hóa hơn cho người dùng doanh nghiệp). Việc hiểu rõ Azure Synapse sẽ là nền tảng vững chắc để bạn tiếp cận với kiến trúc dữ liệu hiện đại trên cả Azure lẫn các Cloud khác.

---

## Tài Liệu Tham Khảo
* [Azure Synapse Analytics Documentation (Microsoft Learn)](https://learn.microsoft.com/en-us/azure/synapse-analytics/)
* [Dedicated SQL pool (formerly SQL DW) architecture](https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/massively-parallel-processing-mpp-architecture)
* [Serverless SQL pool in Azure Synapse Analytics](https://learn.microsoft.com/en-us/azure/synapse-analytics/sql/on-demand-workspace-overview)
* [Distributed Tables - Hash, Round-Robin, and Replicate](https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/sql-data-warehouse-tables-distribute)
