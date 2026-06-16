---
title: "Kiểm soát truy cập - Access Control (RBAC & ABAC)"
difficulty: "Intermediate"
tags: ["access-control", "rbac", "abac", "security", "data-governance", "iam"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Kiểm soát truy cập (Access Control) - RBAC và ABAC trong hệ thống dữ liệu"
metaDescription: "Tìm hiểu chi tiết về Kiểm soát truy cập (Access Control) dữ liệu: phân quyền theo vai trò (RBAC), phân quyền theo thuộc tính (ABAC) và cách áp dụng thực tế."
description: "Hãy tưởng tượng bạn đang quản lý một kho dữ liệu khổng lồ của một tập đoàn lớn. Một ngày nọ, một kỹ sư dữ liệu vô tình chạy lệnh `DROP TABLE` nhầm trên môi trường Production, hoặc tệ hơn, một nhà phân tích truy cập được vào bảng lương chi tiết của toàn công ty. Đó là lúc bạn nhận ra tầm quan trọng sống còn của Access Control."
---



Hãy tưởng tượng bạn đang quản lý một kho dữ liệu khổng lồ của một tập đoàn lớn. Một ngày nọ, một kỹ sư dữ liệu vô tình chạy lệnh `DROP TABLE` nhầm trên môi trường Production do đang đăng nhập bằng tài khoản Admin, hoặc một nhà phân tích dữ liệu vô tình truy cập được vào danh sách chi tiết mức lương của toàn bộ nhân viên. Những thảm họa này không chỉ làm gián đoạn hệ thống mà còn vi phạm nghiêm trọng các quy định bảo mật. 

Đó là lúc bạn nhận ra tầm quan trọng sống còn của **Access Control (Kiểm soát truy cập)**. 

Trong lĩnh vực Data Engineering, kiểm soát truy cập không chỉ đơn thuần là cấp phát tài khoản. Đó là việc thiết lập một hệ thống bảo vệ nhiều lớp để đảm bảo trả lời chính xác câu hỏi: **"Ai (hoặc hệ thống nào) được phép làm gì trên dữ liệu nào, và trong hoàn cảnh nào?"**

---

## 1. AuthN vs. AuthZ: Nền Tảng Của Truy Cập Hệ Thống



Trước khi đi sâu vào RBAC và ABAC, chúng ta cần phân biệt rõ hai khái niệm thường bị nhầm lẫn trong quá trình quản lý định danh và quyền cập:

*   **Authentication (Xác thực - AuthN):** Bạn là ai? Đây là quá trình xác minh danh tính của người dùng hoặc hệ thống (ví dụ: đăng nhập bằng Username/Password, Single Sign-On (SSO) qua Okta/Google, xác thực đa yếu tố MFA, hoặc dùng chứng chỉ/API key cho Service Account).
*   **Authorization (Phân quyền - AuthZ):** Bạn được phép làm gì? Sau khi đã biết bạn là ai, hệ thống sẽ kiểm tra xem bạn có quyền đọc (Read), ghi (Write), hoặc xóa (Delete) một bảng, một file hay một thư mục dữ liệu cụ thể hay không.

Kiểm soát truy cập dữ liệu chủ yếu giải quyết bài toán của **Authorization (AuthZ)**.

---

## 2. Phân Quyền Theo Vai Trò (Role-Based Access Control - RBAC)

RBAC là mô hình quản lý quyền truy cập phổ biến nhất hiện nay. Thay vì cấp quyền trực tiếp cho từng cá nhân (User-based), quyền được gán cho các **Vai trò (Roles)**, sau đó người dùng (Users) sẽ được gán vào các Vai trò tương ứng.

### Cấu trúc cơ bản
`Users <--- (gán vào) ---> Roles <--- (chứa) ---> Permissions`

### Ưu điểm
*   **Đơn giản, trực quan:** Dễ hiểu và dễ thiết lập ban đầu.
*   **Quản trị dễ dàng khi mở rộng nhân sự:** Khi một Data Analyst mới gia nhập công ty (Onboarding), bạn chỉ cần gán họ vào role `data_analyst_role` là họ tự động có toàn bộ quyền cần thiết. Khi họ nghỉ việc (Offboarding), chỉ cần xóa tài khoản của họ, không cần đi gỡ từng quyền trên từng bảng dữ liệu.

### Nhược điểm
*   **Role Explosion (Bùng nổ vai trò):** Khi công ty có nhiều phòng ban, khu vực và các ngoại lệ nhỏ lẻ, số lượng Roles sẽ tăng lên theo cấp số nhân (ví dụ: `analyst_marketing_us`, `analyst_marketing_eu`, `analyst_marketing_global_readonly`,...). Quản lý hàng nghìn Roles trở thành cơn ác mộng.
*   **Khó đáp ứng ngữ cảnh:** RBAC thường là quyền tĩnh, không quan tâm người dùng đang truy cập từ đâu hay vào thời gian nào.

### Ví dụ thực tế trong Data Warehouse
Một mô hình RBAC chuẩn trong Snowflake hoặc BigQuery thường bao gồm các tầng Role (Role Hierarchy):
1.  **System/Admin Roles:** `ACCOUNTADMIN`, `SYSADMIN` - Dành cho quản trị viên hệ thống để tạo user, role, warehouse, database.
2.  **Functional/Object Roles:** `PROD_DB_READ_ROLE`, `PROD_DB_WRITE_ROLE` - Nhóm các quyền truy cập trực tiếp lên object cụ thể (database, schema).
3.  **Business Roles (Được gán trực tiếp cho User):**
    *   `Data Engineer`: Được cấp `PROD_DB_WRITE_ROLE`, có thể tạo, chỉnh sửa bảng trong Raw và Transformed layer.
    *   `Data Analyst`: Được cấp `PROD_DB_READ_ROLE`, chỉ có quyền `SELECT` trên Reporting layer để làm dashboard.
    *   `Airflow Service Account`: Có quyền `USAGE` và `ALL PRIVILEGES` để chạy ETL pipelines.

---

## 3. Phân Quyền Theo Thuộc Tính (Attribute-Based Access Control - ABAC)

Để giải quyết giới hạn của RBAC, ABAC ra đời như một mô hình tiến tiến hơn. ABAC kiểm soát truy cập dựa trên việc đánh giá động các **Chính sách (Policies)** dựa trên **Thuộc tính (Attributes)** tại thời điểm truy cập.

### Các loại thuộc tính (Attributes)
1.  **Subject Attributes (Người dùng):** Chức vụ (Title), Phòng ban (Department), Mức độ bảo mật (Security Clearance).
2.  **Resource Attributes (Tài nguyên):** Data Tags (Nhãn dữ liệu như `PII`, `Financial`, `Confidential`), Mức độ nhạy cảm.
3.  **Action Attributes (Hành động):** Hành động muốn thực hiện (Read, Update, Delete).
4.  **Environment Attributes (Môi trường):** Thời gian truy cập (Trong giờ/Ngoài giờ hành chính), Vị trí địa lý, Địa chỉ IP, Trạng thái cảnh báo an ninh của hệ thống.

### Cách hoạt động
ABAC sử dụng câu lệnh điều kiện (IF-THEN) để quyết định cấp quyền.

**Ví dụ một Policy của ABAC:**
> "Cho phép người dùng thực hiện quyền `SELECT` (Action) trên cột dữ liệu nếu `Department` của người dùng (Subject) trùng khớp với thuộc tính `Owning_Department` của bảng dữ liệu (Resource), VÀ truy cập được thực hiện từ `Dải IP nội bộ` (Environment), VÀ dữ liệu KHÔNG có tag `PII` (Resource)."

### Ưu điểm
*   **Cực kỳ linh hoạt (Fine-grained):** Giải quyết được những trường hợp phân quyền cực kỳ phức tạp.
*   **Giảm thiểu số lượng Role:** Thay vì tạo hàng trăm Role cho từng phòng ban, bạn chỉ cần một Policy duy nhất so sánh thuộc tính `Department` của user và dữ liệu.
*   **Hỗ trợ Data Governance tự động:** Rất phù hợp khi hệ thống có công cụ tự động gắn thẻ (Data Tagging/Classification).

### Nhược điểm
*   **Phức tạp trong cấu hình và Audit:** Khó để ngay lập tức biết "User A có thể truy cập được những bảng nào?" vì quyền được đánh giá động (dynamic).
*   **Hiệu năng (Performance):** Cần một công cụ Policy Engine (như AWS IAM, Apache Ranger) để đánh giá policy liên tục, có thể gây độ trễ nhỏ.

---

## 4. Bảo Mật Dữ Liệu Chi Tiết: RLS và CLS

Trong Data Engineering hiện đại, chỉ cấp quyền truy cập mức Bảng (Table-Level) là không bao giờ đủ. Dữ liệu thường được lưu chung trong các bảng khổng lồ chứa hàng tỷ dòng và hàng trăm cột, dẫn đến nhu cầu về RLS và CLS.

### Row-Level Security (RLS) - Bảo mật cấp dòng
RLS giới hạn các dòng dữ liệu mà người dùng được phép trả về từ một truy vấn. Có thể hiểu RLS đóng vai trò như một mệnh đề `WHERE` được ép buộc ẩn giấu phía dưới mỗi câu lệnh SQL.

*   **Tình huống:** Trong bảng `global_sales`, một Giám đốc khu vực tại Việt Nam chạy lệnh `SELECT * FROM global_sales`. Hệ thống chỉ trả về các dòng có `country = 'VN'`. Trong khi đó, CEO toàn cầu chạy cùng câu lệnh sẽ nhìn thấy tất cả các dòng.
*   **Cách triển khai:** Đa số các Database (PostgreSQL, Snowflake, BigQuery) đều hỗ trợ native RLS (Row Access Policies). Hệ thống sẽ sử dụng các hàm (functions) hoặc biến môi trường như `CURRENT_USER()` hoặc `CURRENT_ROLE()` để so sánh với một bảng map phân quyền hoặc trực tiếp với cột trong bảng dữ liệu.

### Column-Level Security (CLS) - Bảo mật cấp cột
CLS giới hạn truy cập vào các cột dữ liệu nhạy cảm nhất định.

*   **Ngăn chặn hoàn toàn (Column-level Restrictions):** Nếu Data Analyst truy vấn `SELECT * FROM customers`, hệ thống sẽ báo lỗi vì họ không có quyền xem cột `credit_card_number`.
*   **Dynamic Data Masking (Mặt nạ dữ liệu động):** Đây là tính năng nâng cao hơn. User vẫn được phép truy vấn, nhưng dữ liệu nhạy cảm sẽ bị che/ẩn đi trên đường truyền (on-the-fly) theo các quy tắc nhất định (Masking Policies).
    *   *Người có thẩm quyền (HR)* xem cột lương: `5000`
    *   *Nhân viên IT (Data Engineer)* xem cột lương: `0`
    *   *Masking cho Email:* `nguyenvana@gmail.com` -> `n***@gmail.com`
    *   *Masking cho Thẻ tín dụng:* `1234-5678-1234-5678` -> `XXXX-XXXX-XXXX-5678`

---

## 5. Quản Lý Định Danh và Truy Cập (Identity and Access Management - IAM)

Để hệ thống Access Control hoạt động mượt mà, nó phải được tích hợp với một hệ thống IAM trung tâm của tổ chức (ví dụ: Active Directory, Okta, Google Workspace).

1.  **Single Sign-On (SSO):** Các kỹ sư, nhà phân tích không tạo tài khoản riêng biệt (local account) trên từng công cụ (Airflow, Snowflake, Tableau). Họ đăng nhập một lần thông qua nhà cung cấp danh tính (IdP) của công ty. Khi họ rời công ty, IT chỉ cần vô hiệu hóa tài khoản trên IdP, lập tức chặn truy cập vào tất cả các hệ thống dữ liệu.
2.  **SCIM Provisioning:** Tự động đồng bộ User và Group (Role) từ hệ thống nhân sự/IdP xuống hệ thống Database. Ví dụ, khi một người được thêm vào nhóm "Data Analysts" trên Okta, tài khoản của họ tự động được tạo trên Snowflake và gán đúng Role tương ứng.
3.  **Quản trị đặc quyền trung tâm:** Trong các kiến trúc lớn như Data Mesh hoặc Data Lake, người ta sử dụng các nền tảng Data Governance tập trung (Centralized Policy Engine) như **Apache Ranger, AWS Lake Formation, Immuta, hoặc Privacera**. Thay vì đi gán quyền thủ công trên từng hệ thống S3, Hive, Trino, Kafka; Data Steward chỉ cần viết Policy trên một giao diện web duy nhất, policy sẽ tự động áp dụng chéo (cross-platform).

---

## 6. Các Thực Hành Tốt Nhất (Best Practices) Cho Data Engineers

Để xây dựng một Data Platform bảo mật, Data Engineers nên tuân thủ các nguyên tắc sau:

1.  **Nguyên tắc đặc quyền tối thiểu (Principle of Least Privilege - PoLP):** Chỉ cấp đúng những quyền cần thiết nhất, cho đúng người, trong đúng khoảng thời gian cần thiết để thực hiện công việc. Đừng bao giờ cấp `ALL PRIVILEGES` hay quyền vĩnh viễn trên production nếu không cần thiết.
2.  **Chia tách vai trò (Separation of Duties - SoD):** Môi trường Development (Dev) và Production (Prod) phải cách ly hoàn toàn. Kỹ sư xây dựng code trên Dev không nên có quyền thao tác dữ liệu (DML/DDL) trực tiếp trên Prod. Mọi thay đổi cấu trúc bảng trên Prod phải được thực hiện thông qua CI/CD pipelines (Service Accounts).
3.  **Tài khoản dịch vụ (Service Accounts):** Mọi công việc chạy tự động (ETL/ELT jobs, dbt pipelines, BI tool dashboards) phải được chứng thực thông qua Service Accounts riêng biệt. Tuyệt đối không dùng tài khoản gắn với cá nhân con người cho các job tự động, vì khi người đó nghỉ việc, mật khẩu thay đổi sẽ làm sập toàn bộ luồng dữ liệu.
4.  **Hạ tầng dưới dạng mã (Infrastructure as Code - IaC):** Quản lý Role, User, Grants bằng code (Terraform, dbt, Pulumi) thay vì click tay (ClickOps) trên giao diện. Điều này đảm bảo tính minh bạch, có version control, và mọi thay đổi về phân quyền đều phải trải qua quy trình đánh giá mã (Code Review / Pull Request).
5.  **Dán nhãn dữ liệu (Data Classification & Tagging):** Phải phân loại dữ liệu từ đầu nguồn (Raw/Staging). Dữ liệu chứa PII (Thông tin định danh cá nhân) như Email, Số điện thoại phải được tag để tự động kích hoạt các chính sách Masking (ABAC).
6.  **Auditing và Logging thường xuyên:** Bật tính năng ghi nhật ký truy cập (Audit Logs) trên mọi công cụ. Tổ chức đánh giá (review) lại phân quyền định kỳ 3-6 tháng một lần để phát hiện và thu hồi các quyền "thừa" do việc thay đổi dự án của nhân sự để lại.

---

## Tài Liệu Tham Khảo
* [NIST Guide to Attribute Based Access Control (ABAC)](https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-162.pdf)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
* [Snowflake Access Control Documentation](https://docs.snowflake.com/en/user-guide/security-access-control-overview)
* [Google Cloud BigQuery Column and Row-level Security](https://cloud.google.com/bigquery/docs/column-level-security-intro)
