---
title: "ELT (Extract, Load, Transform)"
difficulty: "Beginner"
tags: ["elt", "data-integration", "cloud-data-warehouse", "modern-data-stack", "dbt"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "ELT (Extract, Load, Transform) - Sự thay thế cho ETL truyền thống"
metaDescription: "Khái niệm ELT là gì. Tại sao mô hình Trích xuất, Nạp rồi mới Biến đổi (ELT) kết hợp với công cụ như dbt đang trở thành tiêu chuẩn mới trong Data Engineering."
description: "Trong thế giới kỹ thuật dữ liệu, chắc hẳn bạn đã quen thuộc với thuật ngữ ETL (Extract - Transform - Load) vốn đã thống trị suốt nhiều thập kỷ. Tuy nhiên, với sự trỗi dậy của Cloud Data Warehouse, ELT đang dần chiếm lĩnh và thay đổi hoàn toàn cách chúng ta xây dựng kiến trúc dữ liệu."
---



## 1. ELT Là Gì?

**ELT (Extract, Load, Transform)** là một mô hình tích hợp dữ liệu hiện đại, trong đó dữ liệu từ các hệ thống nguồn được **trích xuất (Extract)** và **nạp (Load)** trực tiếp vào hệ thống đích (thường là Cloud Data Warehouse hoặc Data Lake) ở trạng thái thô (raw) nhất. Sau khi dữ liệu đã nằm an toàn trong hệ thống đích, quá trình **biến đổi (Transform)** mới được thực hiện.

Điều này trái ngược hoàn toàn với mô hình **ETL (Extract, Transform, Load)** truyền thống, nơi dữ liệu phải trải qua một server xử lý trung gian để làm sạch, định dạng và tính toán trước khi được nạp vào Data Warehouse.

Sự chuyển dịch từ ETL sang ELT không chỉ là việc đảo ngược hai chữ cái "T" và "L". Nó đại diện cho một sự thay đổi sâu sắc về kiến trúc, tư duy thiết kế, và phân chia công việc trong hệ sinh thái dữ liệu hiện đại (Modern Data Stack).

## 2. Các Bước Trong Quy Trình ELT

### 2.1. Extract (Trích xuất)
Bước này giống hệt như trong ETL. Dữ liệu được trích xuất từ nhiều nguồn phân tán khác nhau như:
*   Cơ sở dữ liệu giao dịch (MySQL, PostgreSQL, MongoDB, SQL Server).
*   Các ứng dụng SaaS (Salesforce, Zendesk, Hubspot, Shopify).
*   Hệ thống tracking sự kiện (Google Analytics, Mixpanel, Segment).
*   Các file flat (CSV, JSON, Parquet) từ FTP server hoặc Cloud Storage (S3, GCS).

Trong mô hình ELT hiện đại, bước Extract thường được tự động hóa hoàn toàn bởi các công cụ SaaS hoặc mã nguồn mở như Fivetran, Airbyte, hoặc Meltano. Các kỹ sư dữ liệu không còn phải tự viết và bảo trì vô số kịch bản đồng bộ (API scripts) phức tạp nữa.

### 2.2. Load (Nạp)
Khác biệt đầu tiên bắt đầu từ đây. Thay vì chuyển dữ liệu qua một máy chủ biến đổi (Transformation Server), dữ liệu được nạp thẳng vào Data Warehouse (như Snowflake, BigQuery, Redshift) hoặc Data Lake (như Databricks, S3) dưới dạng "as-is" (nguyên bản nhất có thể).
Dữ liệu thô này thường được lưu trữ trong một schema hoặc database riêng biệt (thường gọi là `raw_data` hoặc `landing_zone`). Điều này đảm bảo rằng không có bất kỳ thông tin nào bị mất mát do các quy tắc biến đổi sớm.

### 2.3. Transform (Biến đổi)
Đây là "trái tim" của mô hình ELT. Việc biến đổi dữ liệu (làm sạch, join, aggregate, tính toán các metric nghiệp vụ) được thực hiện hoàn toàn **bên trong** Data Warehouse, tận dụng sức mạnh tính toán (compute power) khổng lồ và khả năng mở rộng linh hoạt của nó.

Công cụ nổi bật nhất đại diện cho chữ "T" trong ELT hiện nay chính là **dbt (data build tool)**. Với dbt, các nhà phân tích và kỹ sư dữ liệu chỉ cần viết các câu lệnh `SELECT` bằng SQL, dbt sẽ lo việc dịch chúng thành các tác vụ DDL/DML tương ứng để thực thi trực tiếp trên Data Warehouse.

## 3. Tại Sao ELT Lại Trở Thành Tiêu Chuẩn Mới?

Sự ra đời và phổ biến của ELT gắn liền với những đột phá công nghệ sau:

### 3.1. Sự Trỗi Dậy Của Cloud Data Warehouse (CDW)
Các CDW hiện đại như Snowflake và BigQuery có kiến trúc **tách biệt giữa lưu trữ (storage) và tính toán (compute)**.
*   Lưu trữ trên Cloud rất rẻ, nên bạn có thể nạp toàn bộ dữ liệu thô vào CDW mà không phải lo lắng về chi phí hay giới hạn dung lượng như các hệ thống on-premise cũ.
*   Khả năng mở rộng tính toán là vô hạn và "on-demand". Bạn có thể cấp phát một lượng lớn tài nguyên tính toán trong vài phút để chạy các pipeline biến đổi dữ liệu nặng nề, sau đó tự động tắt đi để tiết kiệm chi phí.

### 3.2. Sự Đơn Giản Hóa Quá Trình Trích Xuất & Nạp (E & L)
Với việc dữ liệu được nạp ở dạng thô, quá trình (E) và (L) trở thành các tác vụ chuẩn hóa (commodity). Các công cụ như Fivetran hay Airbyte có thể đồng bộ hàng ngàn bảng từ Salesforce sang BigQuery chỉ bằng vài cú click chuột, không cần viết code. Nếu mô hình nguồn thay đổi (thêm cột mới), công cụ E&L có thể tự động sao chép cột mới đó sang hệ thống đích một cách linh hoạt.

### 3.3. Sự Ra Đời Của Vai Trò "Analytics Engineer"
Trước đây, quá trình biến đổi (T) bằng các công cụ ETL (Informatica, Talend, Apache Spark) đòi hỏi kỹ năng lập trình (Java, Scala, Python) hoặc kỹ năng thao tác trên các giao diện kéo thả phức tạp của Kỹ sư dữ liệu (Data Engineer).
Với ELT, khi chữ (T) được dời vào Warehouse và sử dụng **SQL** làm ngôn ngữ chính (thông qua dbt), các Nhà phân tích dữ liệu (Data Analyst) nay có thể tự tay xây dựng và quản lý các pipeline biến đổi dữ liệu. Điều này sinh ra một vai trò mới: **Analytics Engineer**, giúp giảm tải thắt cổ chai ở team Data Engineering.

## 4. So Sánh ELT và ETL

| Tiêu Chí | ETL (Extract, Transform, Load) | ELT (Extract, Load, Transform) |
| :--- | :--- | :--- |
| **Nơi xử lý biến đổi** | Server ETL trung gian (vd: Spark cluster, Talend server). | Hệ thống đích (Cloud Data Warehouse / Data Lake). |
| **Dữ liệu đích (Target)** | Chỉ có dữ liệu đã được tổng hợp, làm sạch và định dạng sẵn. Dữ liệu thô bị loại bỏ ở bước giữa. | Chứa cả dữ liệu thô (raw) và dữ liệu đã biến đổi (transformed). Luôn có thể truy vết lại bản gốc. |
| **Tính linh hoạt** | Kém linh hoạt. Nếu yêu cầu phân tích thay đổi, phải viết lại pipeline, trích xuất và biến đổi lại từ đầu hệ thống nguồn. | Rất linh hoạt. Do dữ liệu thô đã nằm sẵn ở đích, chỉ cần viết lại logic SQL để tạo ra view/bảng mới mà không cần chạm lại vào nguồn. |
| **Chi phí bảo trì** | Cao. Phải quản lý server trích xuất, server biến đổi, và các tool phức tạp. | Thấp hơn. Tận dụng hạ tầng có sẵn của CDW. Quản lý tập trung hơn. |
| **Bảo mật & Compliance** | Dữ liệu nhạy cảm (PII) có thể được mask/che giấu trước khi vào Data Warehouse. Rất an toàn nhưng đòi hỏi cấu hình cẩn thận. | Dữ liệu nhạy cảm được nạp trực tiếp vào raw layer. Đòi hỏi quản lý phân quyền (RBAC) nghiêm ngặt tại Data Warehouse. |

## 5. Ưu Điểm Và Nhược Điểm Của ELT

### Ưu Điểm
1. **Agility (Tính Nhanh Nhạy):** Do không phải xác định schema đích chặt chẽ ngay từ đầu, bạn nạp dữ liệu nhanh hơn và biến đổi nó bất cứ khi nào cần.
2. **Khả Năng Truy Vết (Lineage & Auditability):** Dữ liệu thô luôn tồn tại. Nếu bạn phát hiện ra lỗi trong logic tính toán doanh thu, bạn chỉ cần sửa code SQL và chạy lại biến đổi trên dữ liệu thô lịch sử. Với ETL, dữ liệu có thể đã bị mất.
3. **Hiệu Suất Tính Toán Cao:** Chạy JOIN hay Aggregation trên Snowflake/BigQuery (được thiết kế tối ưu hóa cho MPP - Massively Parallel Processing) thường nhanh và hiệu quả hơn nhiều so với việc xử lý trên các máy chủ ETL riêng biệt.
4. **Dễ Tiếp Cận (Dân chủ hóa dữ liệu):** Sử dụng SQL (ngôn ngữ phổ biến nhất thế giới data) giúp nhiều người trong công ty có thể tham gia vào việc xây dựng pipeline.

### Nhược Điểm (Và Thách Thức)
1. **Rủi Ro Trở Thành "Data Swamp":** Nếu không có sự quản lý dữ liệu (Data Governance) và quy định mô hình hóa tốt, Data Warehouse của bạn sẽ chứa đầy các bảng thô lộn xộn, không ai hiểu và sử dụng được.
2. **Chi Phí Data Warehouse:** Việc nạp mọi thứ vào CDW và chạy SQL "vô tội vạ" có thể dẫn đến hóa đơn điện toán đám mây khổng lồ.
3. **Xử Lý Dữ Liệu Thời Gian Thực (Streaming):** ELT truyền thống thường hoạt động theo batch. Mặc dù các công nghệ gần đây đang dần thu hẹp khoảng cách, nhưng đối với các pipeline real-time độ trễ siêu thấp (tính bằng mili-giây), các công cụ stream processing (như Apache Flink, Kafka Streams) với mô hình gần giống ETL vẫn chiếm ưu thế.

## 6. Ví Dụ Kiến Trúc ELT Thực Tế

Một trong những mô hình Modern Data Stack phổ biến nhất hiện nay cho quy trình ELT:

*   **Extract & Load:** Sử dụng **Airbyte** để kéo dữ liệu định kỳ mỗi 1 giờ từ cơ sở dữ liệu PostgreSQL (hệ thống backend) và API của Shopify (hệ thống e-commerce) vào Google BigQuery. Dữ liệu này nằm ở dataset `raw_postgres` và `raw_shopify`.
*   **Transform:** Sử dụng **dbt** (được orchestration bởi Airflow hoặc dbt Cloud).
    *   *Staging Layer:* dbt đọc dữ liệu từ `raw`, đổi tên cột, cast kiểu dữ liệu sang chuẩn chung.
    *   *Marts Layer:* dbt thực hiện JOIN giữa dữ liệu User từ PostgreSQL và Order từ Shopify để tạo ra bảng `fact_orders` và `dim_users` phục vụ báo cáo.
*   **BI & Analytics:** BI Tools như Metabase hoặc Looker kết nối trực tiếp vào các bảng Marts đã được biến đổi để tạo Dashboard.

## 7. Tổng Kết

ELT không chỉ là một trào lưu nhất thời mà là hệ quả tất yếu của sự phát triển phần cứng và kiến trúc điện toán đám mây. Nó chuyển gánh nặng xử lý sang các cỗ máy Data Warehouse khổng lồ, đồng thời trao quyền cho các chuyên gia phân tích dữ liệu tự chủ hơn trong công việc của mình. Hiểu rõ ELT và các công cụ xoay quanh nó là một yêu cầu bắt buộc đối với bất kỳ Data/Analytics Engineer nào trong bối cảnh hiện tại.

## Tài Liệu Tham Khảo
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* **The Analytics Engineering Guide (dbt Labs)**
* **Airbyte Blog: ETL vs ELT**
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
