---
title: "Data Platform Engineer (Kỹ sư nền tảng dữ liệu)"
description: "Lộ trình học tập trở thành Data Platform Engineer, làm chủ Data Governance, Metadata management, và Data Platform tự phục vụ."
---

Vai trò **Data Platform Engineer** tập trung vào việc thiết kế, xây dựng và duy trì các nền tảng hạ tầng dùng chung mạnh mẽ, an toàn để cả doanh nghiệp khai thác dữ liệu dễ dàng.

## 1. Đối tượng mục tiêu (Target Audience)
* **Senior Data Engineers** muốn tiến lên vị trí kiến trúc hoặc định hướng xây dựng hạ tầng dùng chung mang tính nền tảng (Platform) cho toàn bộ tổ chức, thay vì viết pipeline nghiệp vụ thông thường.

## 2. Kiến thức tiên quyết (Prerequisites)
* Trải qua đầy đủ các mốc kinh nghiệm của lộ trình Kỹ sư dữ liệu cao cấp (Middle to Senior Data Engineer).
* Kiến thức sâu rộng về điện toán đám mây (Cloud Data Engineer).

## 3. Nội dung lộ trình chi tiết từng bước (Detailed roadmap)

### Bước 1: Quản trị Dữ liệu (Data Governance)
* Vận hành và triển khai các hệ thống giải pháp Data Governance hiện đại: **Unity Catalog** (Databricks), **Apache Atlas**, hoặc **AWS Lake Formation**.
* Quản lý định danh dữ liệu, áp đặt các quy định về chuẩn hóa nhằm biến kho dữ liệu thô thành tài sản chung đáng tin cậy.

### Bước 2: Data Lineage và Metadata Management
* **Metadata Management**: Tự động hóa quá trình thu thập siêu dữ liệu liên tục để mô tả đầy đủ thông tin về các bộ dữ liệu.
* **Data Lineage**: Xây dựng khả năng truy xuất nguồn gốc (Lineage) và hành trình của dữ liệu tự động, giúp tổ chức nhìn thấy dữ liệu đi qua những bảng nào, được biến đổi bằng logic gì, cho đến khi hiển thị trên các biểu đồ kinh doanh.

### Bước 3: Phân quyền truy cập nâng cao (Advanced Access Control)
* Triển khai cơ chế phân quyền truy cập thông minh quy mô lớn:
  * **RBAC (Role-Based Access Control)**: Phân quyền theo vai trò nhóm người dùng.
  * **ABAC (Attribute-Based Access Control)**: Phân quyền linh hoạt dựa trên các thuộc tính của dữ liệu hoặc người dùng.
* Cấp quyền tự động hóa cho các công cụ tiêu thụ dữ liệu mà không làm hổng bảo mật hệ thống.

### Bước 4: Vận hành hạ tầng tập trung với Kubernetes
* Ứng dụng **Kubernetes (K8s)** trong việc điều phối các cụm công cụ dữ liệu (như Apache Airflow, Spark Operator, Trino).
* Xây dựng nền tảng có khả năng cấu hình bằng mã (Infrastructure as Code) với Helm Charts, tự động giãn nở tài nguyên, và gom cụm phục vụ cho việc vận hành hiệu năng cao.

---

**Kết quả đầu ra**: Đủ năng lực phát triển và cung cấp một hệ thống tự phục vụ (Self-service Data Platform) mạnh mẽ, trao quyền phân tích cho các phòng ban mà vẫn đảm bảo tuyệt đối tuân thủ bảo mật thông tin toàn cầu (GDPR, mã hóa PII).

## 4. Dự án thực tế gợi ý (Suggested practical projects)
* **Thiết lập Unity Catalog / AWS Lake Formation quy mô**: Xây dựng kiến trúc quản trị quyền dòng chảy dữ liệu thực tế cho 5 phòng ban (Sales, Marketing, HR, Finance, Data Science).
* **Quản trị Data Lineage tự động**: Cài đặt OpenLineage hoặc DataHub để tracking dòng dữ liệu từ một PostgreSQL OLTP tới tận hệ thống bảng báo cáo phân tích BigQuery / Snowflake.

## 5. Trọng tâm phỏng vấn (Interview focus)
* **System Design Access Control**: Bài toán thiết kế hệ thống kiểm soát và phân quyền tự động cho doanh nghiệp có hàng nghìn người dùng và petabyte dữ liệu.
* **Kiến trúc Data Catalog**: Trình bày thiết kế một kiến trúc Data Catalog trung tâm, đảm bảo sự đồng bộ liền mạch giữa nhiều công nghệ kho dữ liệu khác nhau.
* **Bảo mật PII**: Cách triển khai thiết kế các chính sách bảo mật dữ liệu nhạy cảm thông tin người dùng ngay tại nguồn nhập liệu (Data Ingestion/Source).
