---
title: "Unity Catalog"
difficulty: "Intermediate"
tags: ["data-governance", "databricks", "data-lakehouse", "access-control"]
readingTime: "11 mins"
lastUpdated: 2026-06-16
seoTitle: "Unity Catalog là gì? Giải pháp Data Governance của Databricks"
metaDescription: "Tìm hiểu Unity Catalog, giải pháp quản trị dữ liệu (Data Governance) và AI thống nhất trên nền tảng Databricks Lakehouse."
description: "Trong kiến trúc dữ liệu hiện đại, việc lưu trữ hàng Petabyte dữ liệu trên Data Lake giờ đây đã trở nên đơn giản và tiết kiệm. Thế nhưng, câu hỏi hóc búa nhất lại là: Làm sao để quản lý, bảo mật và khai thác khối lượng dữ liệu khổng lồ đó một cách an toàn và có hệ thống? Unity Catalog chính là câu trả lời của Databricks."
---



Trong kiến trúc dữ liệu hiện đại, việc lưu trữ hàng Petabyte dữ liệu trên Data Lake giờ đây đã trở nên đơn giản và tiết kiệm. Thế nhưng, bài toán đau đầu nhất lại là: Làm sao để quản lý, bảo mật và khai thác khối lượng dữ liệu khổng lồ đó một cách an toàn, có hệ thống? Unity Catalog chính là giải pháp chiến lược của Databricks cho vấn đề này.

Unity Catalog là giải pháp quản trị dữ liệu (Governance Solution) và AI tập trung dành riêng cho kiến trúc Lakehouse. Nó cung cấp một lớp bảo mật duy nhất trên toàn bộ các Workspaces, cho phép quản lý tập trung phân quyền (Access Control), tự động ghi nhận luồng dữ liệu (Lineage), và chia sẻ dữ liệu (Data Sharing) an toàn cả trong và ngoài tổ chức.

## Vấn Đề Của Các Kiến Trúc Cũ

Trước khi Unity Catalog ra đời, việc quản lý dữ liệu trên Databricks (và các Data Lake nói chung) gặp rất nhiều khó khăn:

- **Metastore phân mảnh:** Mỗi Databricks Workspace thường sử dụng một Hive Metastore cục bộ riêng biệt. Việc chia sẻ dữ liệu giữa các workspace (ví dụ: giữa team Data Engineering và team Data Science) đòi hỏi sao chép dữ liệu hoặc cấu hình phức tạp.
- **Bảo mật phụ thuộc vào Cloud IAM:** Phân quyền truy cập dữ liệu thường phải cấu hình ở mức storage bằng các chính sách IAM của Cloud Provider (AWS IAM, Azure RBAC, GCP IAM). Điều này đòi hỏi kiến thức chuyên sâu về Cloud và rất khó để phân quyền chi tiết (fine-grained) ở mức bảng, hàng (row) hay cột (column).
- **Thiếu tầm nhìn toàn cảnh (Lineage):** Khó theo dõi nguồn gốc dữ liệu từ đâu đến, qua những bước xử lý nào và cuối cùng phục vụ cho báo cáo hay mô hình AI nào.
- **Quản lý AI và Dữ liệu riêng biệt:** Quá trình huấn luyện mô hình (ML) và dữ liệu là hai luồng tách biệt, khó có thể audit được mô hình này được train trên bộ dữ liệu nào.

## Kiến Trúc và Các Khái Niệm Cốt Lõi

Unity Catalog mang đến một mô hình phân cấp tổ chức (Namespace) gồm 3 cấp độ (3-tier namespace), tương tự như các hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) truyền thống, giúp người dùng dễ dàng làm quen.

Cấu trúc: `catalog_name.schema_name.table_name`

### 1. Metastore
Là vùng chứa (container) cao nhất trong Unity Catalog. Một Metastore lưu trữ toàn bộ metadata về dữ liệu và AI assets, cũng như các quyền truy cập (permissions). Theo Best Practice, một tổ chức thường chỉ cần tạo một Metastore cho mỗi khu vực (Region) của Cloud.

### 2. Catalog (Tầng 1)
Là mức phân loại cao nhất trong cấu trúc 3-tier. Catalog thường được dùng để phân chia môi trường (ví dụ: `dev`, `staging`, `prod`) hoặc phân chia theo các phòng ban, lĩnh vực (ví dụ: `finance`, `marketing`).

### 3. Schema / Database (Tầng 2)
Mỗi Catalog chứa nhiều Schema (còn gọi là Database). Schema là nơi nhóm các đối tượng dữ liệu có liên quan lại với nhau. Thường người ta sẽ chia schema theo các lớp của kiến trúc Medallion (ví dụ: `bronze`, `silver`, `gold`).

### 4. Tables, Views, Volumes, Models (Tầng 3)
Đây là các tài sản thực tế được quản lý bởi Unity Catalog:
- **Tables (Bảng):** Bảng dữ liệu có cấu trúc. Hỗ trợ cả **Managed Tables** (dữ liệu được quản lý trực tiếp bởi Unity Catalog trên lưu trữ đám mây mặc định) và **External Tables** (dữ liệu nằm trên Cloud Storage bên ngoài, Unity Catalog chỉ giữ metadata).
- **Views (Khung nhìn):** Cung cấp các góc nhìn từ một hoặc nhiều bảng. Unity Catalog hỗ trợ Dynamic Views để phân quyền tới mức Row-level (dòng) và Column-level (cột).
- **Volumes:** Điểm đột phá của Unity Catalog. Volumes dùng để quản lý các dữ liệu phi cấu trúc hoặc bán cấu trúc (hình ảnh, video, âm thanh, file PDF, file CSV thô, JSON...). Nó cho phép áp dụng Governance lên cả non-tabular data.
- **Models:** Tích hợp trực tiếp với MLflow, quản lý vòng đời của các mô hình Machine Learning ngay trong cùng một nền tảng.

## Các Tính Năng Nổi Bật Của Unity Catalog

### 1. Phân Quyền Tập Trung Bằng ANSI SQL
Thay vì phải vật lộn với các file JSON cấu hình IAM Role của Cloud Provider, Data Engineer giờ đây có thể sử dụng các lệnh SQL chuẩn để cấp phát quyền cho User hoặc Group:

```sql
-- Cấp quyền truy cập cho nhóm Data Scientist vào bảng Khách hàng
GRANT SELECT ON TABLE prod.gold.customer TO `data-scientist-group`;

-- Thu hồi quyền
REVOKE MODIFY ON TABLE dev.silver.sales FROM `analyst-group`;
```

Hệ thống cho phép cấu hình phân quyền tinh xảo:
- **Row-level Security (RLS):** Ẩn các dòng dữ liệu không được phép xem (ví dụ: Nhân viên sale vùng nào chỉ thấy dữ liệu khách hàng của vùng đó).
- **Column-level Security (CLS):** Che khuất hoặc mã hóa (masking) các cột nhạy cảm như Email, số căn cước công dân (SSN), số điện thoại tùy thuộc vào người đang truy vấn.

### 2. Tự Động Ghi Nhận Data Lineage
Một trong những tính năng đáng giá nhất của Unity Catalog là **Automated Lineage**.
Nó tự động theo dõi và vẽ sơ đồ luồng dữ liệu đi qua các bảng, view, và cả các model. Nó hoạt động tự động trên mọi loại ngôn ngữ (SQL, Python, Scala, R) chạy trên các cluster Databricks có hỗ trợ Unity Catalog.
- **Table Lineage:** Bảng C được tạo ra từ Bảng A và B.
- **Column Lineage:** Cột `total_revenue` trong bảng C được tính toán từ cột `price` (Bảng A) và `quantity` (Bảng B).

Điều này hỗ trợ cực kỳ đắc lực cho việc **Root Cause Analysis** (tìm nguyên nhân khi bảng báo cáo bị lỗi do đâu) và **Impact Analysis** (đánh giá tác động đến các hệ thống downstream khi thay đổi schema của một bảng nguồn).

### 3. Data Discovery & Search
Với tính năng Search được tích hợp ngay trên Databricks Workspace (hoặc qua giao diện UI của Catalog Explorer), người dùng có thể tìm kiếm dữ liệu trên toàn bộ tổ chức thông qua:
- Tên bảng, cột.
- Descriptions và Comments (Được gắn vào table/column metadata).
- Tags phân loại (ví dụ: gắn tag `#PII` cho các dữ liệu nhạy cảm).

### 4. Delta Sharing (Chia sẻ dữ liệu mở)
Unity Catalog sử dụng giao thức nguồn mở [Delta Sharing](https://delta.io/sharing/) để chia sẻ dữ liệu một cách an toàn. Điểm đặc biệt:
- Có thể chia sẻ cho người dùng ngoài tổ chức (B2B, Khách hàng, Đối tác).
- Người nhận **KHÔNG CẦN** phải sử dụng Databricks (họ có thể dùng PowerBI, Pandas, Apache Spark, Snowflake...).
- Không xảy ra tình trạng sao chép dữ liệu (Zero-copy data sharing), giúp tiết kiệm chi phí và đảm bảo dữ liệu luôn được cập nhật.

### 5. Quản Trị AI & ML Thống Nhất
Data và AI luôn đi song hành. Unity Catalog quản lý Feature Tables (Feature Store) và ML Models. Điều này giúp theo dõi vòng đời của một model: model nào đang được deploy ở môi trường Production, model đó được train trên phiên bản dữ liệu nào (reproducibility), và ai có quyền gọi model endpoint đó.

## Lợi Ích Đối Với Các Vai Trò Khác Nhau

* **Data Engineer:** Quản lý quyền truy cập cực dễ với SQL. Không phải duy trì nhiều Metastore đồng bộ hóa vất vả giữa các workspace. Xử lý lỗi dễ hơn nhờ Data Lineage.
* **Data Scientist / Analyst:** Dễ dàng tìm kiếm (Discover) bộ dữ liệu cần thiết thông qua Catalog Explorer thay vì phải đi hỏi từng người. Xin cấp quyền nhanh chóng hơn.
* **Security & Compliance Officer:** Có một nơi duy nhất để kiểm tra các Audit Log (Ai đã đọc bảng dữ liệu lương vào lúc 12h đêm qua?). Dễ dàng áp dụng các chuẩn bảo mật khắt khe như GDPR, HIPAA nhờ các tính năng Row/Column Level Security.

## Triển Khai và Thực Hành (Best Practices)

Để khai thác tối đa sức mạnh của Unity Catalog, các tổ chức nên cân nhắc một số nguyên tắc sau:

1. **Một Metastore cho mỗi Region:** Tránh tạo nhiều metastore không cần thiết. Một Metastore có thể gán cho nhiều Workspace trong cùng một vùng đám mây.
2. **Tách biệt Data Storage (Managed vs External):**
   - Sử dụng **External Tables** cho dữ liệu thô (Bronze) để các hệ thống khác ngoài Databricks có thể dễ dàng đọc, hoặc nếu công ty bạn chưa sẵn sàng đưa toàn bộ vòng đời lưu trữ cho Databricks quản lý.
   - Sử dụng **Managed Tables** cho các lớp dữ liệu đã tinh chế (Silver, Gold) để tận hưởng tối đa khả năng tối ưu hiệu suất lưu trữ và dọn dẹp tự động của Databricks.
3. **Phân chia theo kiến trúc Data Mesh (Tùy chọn):** Nếu công ty áp dụng Data Mesh, mỗi Domain (ví dụ: Marketing, HR, Finance) có thể được cấp một **Catalog** riêng. Domain owner sẽ có toàn quyền `CREATE SCHEMA`, `GRANT` các quyền bên trong Catalog của họ, đảm bảo tính tự trị (autonomy) nhưng vẫn tuân thủ cơ chế quản trị tập trung.
4. **Sử dụng System Tables:** Unity Catalog cung cấp các System Tables tự động chứa thông tin về Audit Logs, Lineage, Billing, Pricing. Hãy sử dụng các bảng hệ thống này để xây dựng Dashboard tự động theo dõi FinOps (chi phí) và Security (bảo mật) cho nền tảng dữ liệu của bạn.

## Tổng Kết

Sự ra đời của Unity Catalog đánh dấu bước chuyển mình quan trọng của kiến trúc Data Lakehouse. Nó xóa bỏ ranh giới giữa Data Lake (rẻ, linh hoạt nhưng hỗn loạn, thiếu quản trị) và Data Warehouse (đắt đỏ, cứng nhắc nhưng an toàn, phân quyền tốt). Bằng việc cung cấp một lớp Governance thống nhất cho Dữ liệu có cấu trúc, File phi cấu trúc và AI Models, Unity Catalog giúp các doanh nghiệp tự tin mở rộng nền tảng dữ liệu trên quy mô lớn mà vẫn đảm bảo tính an toàn và minh bạch tuyệt đối.

## Tài Liệu Tham Khảo
* [Databricks Unity Catalog Documentation](https://docs.databricks.com/data-governance/unity-catalog/index.html)
* [Delta Sharing Open Standard](https://delta.io/sharing/)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
