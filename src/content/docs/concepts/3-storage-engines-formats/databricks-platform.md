---
title: "Databricks Platform"
difficulty: "Intermediate"
tags: ["databricks", "spark", "lakehouse", "big-data", "cloud"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Databricks Platform - Nền tảng Lakehouse và Data Intelligence toàn diện"
metaDescription: "Tìm hiểu chi tiết về Nền tảng Databricks: Kiến trúc Control Plane - Data Plane, các thành phần cốt lõi như Delta Lake, Unity Catalog, Photon Engine, và ứng dụng thực tế."
description: "Nếu bạn từng làm việc trong một dự án dữ liệu lớn (Big Data), chắc hẳn bạn đã quen với cảnh tượng: Đội ngũ Data Engineer loay hoay viết Spark code trên một hệ thống, Data Scientist chạy Jupyter Notebook trên một nền tảng khác..."
---



Nếu bạn từng làm việc trong một dự án dữ liệu lớn (Big Data), chắc hẳn bạn đã quen với cảnh tượng: Đội ngũ Data Engineer loay hoay viết Spark code trên một hệ thống, Data Scientist chạy Jupyter Notebook trên một nền tảng khác, còn Data Analyst lại dùng một công cụ BI kết nối vào Data Warehouse đắt đỏ. 

**Databricks** ra đời để phá vỡ những bức tường ("data silos") này, thống nhất tất cả trên một nền tảng duy nhất gọi là Data Lakehouse, và gần đây nhất là định hình khái niệm **Data Intelligence Platform**.

---

## 1. Databricks là gì?

Databricks là một nền tảng dữ liệu đám mây (Cloud Data Platform) được sáng lập vào năm 2013 bởi chính những kỹ sư đã tạo ra **Apache Spark** (tại đại học UC Berkeley). Ban đầu, Databricks được biết đến như một nền tảng cung cấp "Apache Spark as a Service" - giúp việc thiết lập, quản lý và scale các cụm Spark trên môi trường Cloud trở nên cực kỳ dễ dàng.

Tuy nhiên, Databricks ngày nay đã vượt xa khỏi việc chỉ là môi trường chạy Spark. Nền tảng này đã tiên phong đưa ra khái niệm **Data Lakehouse** - một kiến trúc kết hợp sức mạnh lưu trữ giá rẻ, linh hoạt của Data Lake với độ tin cậy, hiệu năng truy vấn và quản lý giao dịch của Data Warehouse.

Hiện tại, Databricks định vị mình là **Data Intelligence Platform**, tích hợp sâu Generative AI vào nền tảng để giúp các tổ chức không chỉ lưu trữ và xử lý dữ liệu, mà còn dễ dàng hiểu và trích xuất giá trị từ dữ liệu đó thông qua các trợ lý AI nội bộ.

---

## 2. Kiến trúc tổng quan của Databricks

Databricks là một nền tảng **Cloud-native**, hoạt động trên cả ba nhà cung cấp đám mây lớn (AWS, Azure, Google Cloud). Đáng chú ý, kiến trúc của Databricks được thiết kế phân tách rõ ràng làm hai phần nhằm đảm bảo tính bảo mật, hiệu năng và khả năng mở rộng: **Control Plane** (Mặt phẳng điều khiển) và **Data Plane** (Mặt phẳng dữ liệu).

### 2.1. Control Plane (Quản lý bởi Databricks)
Đây là môi trường backend do Databricks trực tiếp lưu trữ và quản lý (nằm trong tài khoản Cloud của Databricks). Các dịch vụ chạy trong Control Plane được mã hóa và bảo vệ chặt chẽ. Nó bao gồm:
* **Web UI & Workspace:** Giao diện người dùng web, hệ thống quản lý Notebooks, thư mục, Git Repos và Dashboards.
* **Cluster Management:** Trình quản lý vòng đời của các cụm máy chủ. Nó nhận yêu cầu cấp phép, khởi động, kết thúc và tự động mở rộng (auto-scaling) tài nguyên phần cứng.
* **Job Scheduler:** Trình lên lịch và theo dõi các luồng công việc (Workflows/Jobs).
* **Quản lý người dùng & Phân quyền:** Tích hợp Identity Provider (SSO), quản lý danh tính và access control (phần giao diện điều khiển).

### 2.2. Data Plane (Nằm trong tài khoản Cloud của khách hàng)
Đây là nơi dữ liệu của bạn thực sự tồn tại và nơi các tính toán cường độ cao (Compute) thực sự diễn ra. Quá trình xử lý nằm hoàn toàn trong Virtual Private Cloud (VPC) của bạn.
* **Cloud Storage (Data Lake):** S3 (AWS), ADLS (Azure), hoặc GCS (Google Cloud) chứa toàn bộ dữ liệu thô và các bảng Delta Lake. Khách hàng hoàn toàn kiểm soát bucket/storage account này.
* **Compute Clusters:** Các máy ảo (EC2, Azure VM, GCP Compute Engine) được Databricks Control Plane gửi lệnh khởi tạo vào trong mạng VPC của bạn để chạy mã Spark.

> [!IMPORTANT]
> **Bảo mật tuyệt đối:** Vì Data Plane nằm trong tài khoản Cloud của bạn, dữ liệu của bạn **không bao giờ rời khỏi môi trường VPC của bạn** (ngoại trừ cấu hình Serverless mà chúng ta sẽ nhắc ở phần sau). Databricks Control Plane chỉ kết nối một chiều một cách an toàn xuống Data Plane để gửi các "lệnh" điều phối và theo dõi trạng thái, không trực tiếp đọc nội dung dữ liệu của bạn để mang về hệ thống của họ.

---

## 3. Các thành phần cốt lõi của hệ sinh thái Databricks

Để trở thành một nền tảng toàn diện thay thế cho hàng chục công cụ rời rạc, Databricks bao gồm nhiều cấu phần, phục vụ cho từng khâu trong vòng đời dữ liệu.

### 3.1. Databricks Runtime & Photon Engine
* **Databricks Runtime (DBR):** Là môi trường thực thi cốt lõi được tinh chỉnh từ Apache Spark mã nguồn mở. DBR thường chạy nhanh hơn Spark nguồn mở khá nhiều nhờ các tối ưu hóa độc quyền, khả năng quản lý I/O tốt hơn (với tính năng caching), và tự động tinh chỉnh cấu hình (auto-tuning) tránh lỗi Out-Of-Memory.
* **Photon Engine:** Là engine thực thi vector hóa (vectorized query engine) được viết hoàn toàn bằng C++ nhằm thay thế một phần engine JVM của Spark. Photon được thiết kế để tối ưu hóa trực tiếp các lệnh SQL, join, và aggregation trên dữ liệu dạng cột (Parquet/Delta), mang lại hiệu năng truy vấn siêu tốc độ, tiệm cận với các hệ thống Data Warehouse OLAP chuyên dụng (như Snowflake hay BigQuery) ngay trên dữ liệu Data Lake.

### 3.2. Delta Lake
Delta Lake là trái tim của nền tảng Lakehouse do Databricks khai sinh. Dù phiên bản lõi đã được trao cho Linux Foundation dưới dạng mã nguồn mở (Open Source), phiên bản Delta Lake chạy trên Databricks được tích hợp thêm những công cụ tối ưu mạnh mẽ nhất:
* Cung cấp **giao dịch ACID** an toàn trên dữ liệu lưu bằng định dạng Parquet.
* Hỗ trợ **Time Travel** (Truy vấn trạng thái dữ liệu ở một mốc thời gian trong quá khứ hoặc phục hồi dữ liệu bị lỗi).
* Các tính năng tối ưu hóa độc quyền của Databricks như **Z-Ordering**, **Liquid Clustering**, và **Data Skipping** giúp tăng tốc độ đọc dữ liệu lên hàng chục lần mà không cần các server quản lý Index như database truyền thống.

### 3.3. Unity Catalog
Unity Catalog (UC) là bước tiến vĩ đại của Databricks trong mảng quản trị dữ liệu (Data Governance) và bảo mật tập trung cho toàn bộ dữ liệu và AI:
* **Unified Catalog (Danh mục duy nhất):** Quản lý quyền truy cập (Access Control) cho toàn bộ các Workspace trong tổ chức. Phân quyền cực kỳ chi tiết ở mức bảng (Table), mức hàng (Row-level security) và cột (Column-level security) chỉ bằng các lệnh chuẩn SQL (GRANT/REVOKE).
* **Data Lineage:** UC tự động vẽ biểu đồ dòng chảy dữ liệu trực quan (từ bảng nguồn đến bảng đích, file notebook nào tạo ra bảng đó). Điều này giúp DE xác định gốc rễ của luồng dữ liệu (Root cause analysis) hoặc đánh giá mức độ ảnh hưởng nếu định dạng một cột bị thay đổi.
* **Delta Sharing:** Một giao thức mở tiêu chuẩn công nghiệp (open standard) giúp chia sẻ dữ liệu an toàn với các đối tác, khách hàng hoặc nhà cung cấp khác theo thời gian thực mà không cần sao chép dữ liệu hoặc yêu cầu đối tác phải dùng Databricks.

### 3.4. Databricks SQL (DB SQL)
Nhằm lôi kéo tập khách hàng Data Analyst vốn quen thuộc với giao diện của Data Warehouse, Databricks ra mắt DB SQL.
* Cung cấp giao diện truy vấn SQL thân thiện, trình viết query, và công cụ xây dựng Dashboard trực tiếp trên nền tảng.
* Tích hợp mượt mà với các công cụ BI phổ biến bên thứ ba (Power BI, Tableau, Looker) bằng bộ driver tối ưu.
* Hỗ trợ **Serverless SQL Warehouses**, khởi động chỉ trong vài giây và tự động mở rộng (scale-out/scale-in) sức mạnh tính toán tuỳ theo lượng truy vấn, giúp người dùng không phải lo cấu hình cluster.

### 3.5. Databricks Workflows & Delta Live Tables
* **Databricks Workflows:** Trình điều phối (Data Orchestrator) được tích hợp sẵn, mạnh mẽ như Apache Airflow. Cho phép lên lịch biểu (schedule) chạy phối hợp Notebooks, Python scripts, dbt models, SQL queries, dải rộng trên nhiều cụm tính toán.
* **Delta Live Tables (DLT):** Một framework mang tính cách mạng giúp xây dựng các data pipeline (ETL) bằng phương pháp khai báo (declarative). Với DLT, DE không cần viết code xử lý phụ thuộc, DLT sẽ tự động tạo biểu đồ DAG, tự động quản lý checkpoint cho streaming, tích hợp kiểm tra chất lượng dữ liệu (Data Quality / Expectations) và xử lý cả Streaming lẫn Batch bằng cùng một đoạn mã SQL/Python đơn giản.

### 3.6. Machine Learning & AI (MosaicML & MLflow)
Databricks phục vụ Data Scientist cực kỳ tốt từ ngày đầu, và giờ đây họ càng mạnh mẽ hơn trong kỷ nguyên AI.
* Tích hợp nền tảng **MLflow** để quản lý toàn bộ vòng đời mô hình học máy (Theo dõi các thí nghiệm - Experiments tracking, Model Registry lưu trữ các phiên bản mô hình).
* **Feature Store:** Một nơi quản lý tập trung lưu trữ và khám phá các đặc trưng (features) dùng chung cho ML, giúp tái sử dụng cho nhiều mô hình khác nhau mà không bị trùng lặp quy trình ETL.
* Tích hợp **Generative AI & LLMs** qua việc sáp nhập MosaicML. Nền tảng Mosaic AI cho phép các tổ chức tự xây dựng, fine-tune (huấn luyện tinh chỉnh) và triển khai các mô hình ngôn ngữ lớn (LLMs) dựa trên bộ dữ liệu riêng của họ với chi phí tiết kiệm và bảo mật tuyệt đối.

---

## 4. Mô hình định giá (Pricing Model)

Databricks sử dụng một đơn vị điện toán tiêu chuẩn gọi là **DBU (Databricks Unit)** để đo lường và tính phí năng lực xử lý (mỗi node/giờ). Chi phí tổng thể vận hành Databricks bao gồm 2 phần độc lập:

1. **Chi phí Hạ tầng Cloud (Trả cho AWS/Azure/GCP):** Phí thuê máy ảo (Compute VM instances) và phí dung lượng lưu trữ Object Storage (S3/ADLS/GCS).
2. **Chi phí Bản quyền Nền tảng (Trả cho Databricks):** Tính theo số DBU tiêu thụ dựa trên loại tác vụ (Compute type).

Mỗi loại Compute được tính một mức giá DBU riêng biệt để tối ưu cho các luồng công việc khác nhau:
* **All-Purpose Compute (Tương tác):** Dùng cho việc phát triển, chạy Notebook khám phá dữ liệu, giá DBU cao nhất.
* **Jobs Compute (Tự động):** Dùng để chạy các pipeline đã lên lịch (Production workloads/Workflows). Cluster tự bật lên chạy job rồi tự tắt, giá DBU rẻ hơn đáng kể so với All-Purpose.
* **SQL Compute (DB SQL):** Tối ưu hóa cho truy vấn SQL và BI, giá DBU nằm ở mức trung bình.
* **Serverless Compute:** Giá DBU cao hơn một chút, nhưng bù lại bạn không mất tiền duy trì hạ tầng chạy không (idle), không chịu thời gian khởi động chậm (startup time), và Databricks quản lý hoàn toàn phần hạ tầng mạng/bảo mật.

---

## 5. Đánh giá Ưu và Nhược điểm

### Ưu điểm nổi bật:
* **Unified Platform (Nền tảng hợp nhất):** Mọi vai trò trong Data Team (DE, DS, DA, ML Engineer) đều quy tụ trên cùng một không gian làm việc, sử dụng cùng một định nghĩa bảng thông qua Unity Catalog. Điều này dập tắt các "cuộc chiến" về dữ liệu lệch pha.
* **Hiệu năng xuất sắc:** Rất khó để tự thiết lập một hệ thống Hadoop/Spark on-premise chạy nhanh bằng Databricks Runtime. Sự kết hợp giữa Photon Engine và Delta Lake cho hiệu năng truy vấn siêu tốc.
* **Thúc đẩy đổi mới (Innovation-driven):** Databricks liên tục cập nhật công nghệ nhanh chóng, từ mô hình Lakehouse, Data Sharing, cho đến việc tích hợp Generative AI.
* **Đa Cloud (Multi-cloud):** Hỗ trợ đầy đủ ba đám mây lớn, giảm thiểu rủi ro bị khóa chặt vào một nhà cung cấp (vendor lock-in). Hệ thống code và pipeline trên Azure Databricks có thể dễ dàng chuyển đổi sang AWS Databricks.

### Nhược điểm & Thách thức:
* **Chi phí cao nếu quản lý lỏng lẻo:** Databricks vô cùng dễ sử dụng để khởi tạo cluster, nếu các DE/DS vô ý để các cụm All-Purpose cấu hình "khủng" chạy 24/7 mà không bật tính năng tự động tắt (auto-termination), hóa đơn cuối tháng của cả Cloud và Databricks sẽ là một con số khổng lồ.
* **Đường cong học tập (Learning Curve):** Mặc dù đã tạo ra giao diện SQL dễ dùng, nhưng khi hệ thống phát sinh lỗi hiệu năng ở quy mô lớn, kỹ sư dữ liệu vẫn cần hiểu sâu về cơ chế phân tán của Apache Spark (Partitions, Shuffles, Skew data) để gỡ lỗi và tối ưu hóa.
* **Rủi ro Ecosystem Lock-in:** Định dạng Parquet và Delta Lake là Open Source, nghĩa là bạn sở hữu dữ liệu của mình. Tuy nhiên, nếu bạn xây dựng hàng ngàn pipeline dựa trên các tính năng đóng độc quyền của Databricks (như Delta Live Tables, Photon, Unity Catalog specific features), việc "chuyển nhà" sang một nền tảng đối thủ cạnh tranh như Snowflake hay BigQuery vẫn sẽ đòi hỏi nỗ lực migrate khổng lồ.

---

## 6. Tổng kết

Databricks đã tiến hóa phi thường từ một công cụ đơn thuần giúp "chạy Spark trên Cloud cho dễ" trở thành một **Data Intelligence Platform** toàn diện, định hình lại cách thế giới lưu trữ và khai thác dữ liệu.

Nếu tổ chức của bạn đang đối mặt với bài toán dữ liệu phi cấu trúc và có cấu trúc ở quy mô Terabyte/Petabyte, yêu cầu hệ thống phải vừa phục vụ mảng báo cáo BI truyền thống vừa cung cấp năng lực xây dựng các mô hình Machine Learning/AI tối tân, thì **Databricks** hiện là lựa chọn nền tảng ưu việt và mạnh mẽ bậc nhất trên thị trường.

---

## Tài Liệu Tham Khảo
* [Databricks Documentation - Architecture Overview](https://docs.databricks.com/en/getting-started/architecture.html)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [Apache Spark - Unified Engine for large-scale data analytics](https://spark.apache.org/)
* [Databricks Unity Catalog Guide](https://docs.databricks.com/en/data-governance/unity-catalog/index.html)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
