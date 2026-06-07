---
title: "Kiểm soát truy cập - Access Control (RBAC & ABAC)"
category: "Governance & Metadata"
difficulty: "Intermediate"
tags: ["access-control", "rbac", "abac", "security", "data-governance", "iam"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Kiểm soát truy cập (Access Control) - RBAC và ABAC trong hệ thống dữ liệu"
metaDescription: "Tìm hiểu chi tiết về Kiểm soát truy cập (Access Control) dữ liệu: phân quyền theo vai trò (RBAC), phân quyền theo thuộc tính (ABAC) và cách áp dụng thực tế."
---

# Kiểm soát truy cập - Access Control (RBAC & ABAC)

## Summary

Kiểm soát truy cập (Access Control) là hệ thống các quy định, chính sách và cơ chế kỹ thuật để quản lý việc ai (người dùng, ứng dụng) được phép thực hiện hành động gì (đọc, ghi, sửa, xóa) trên tài nguyên dữ liệu nào (database, bảng, cột, hàng). Hai mô hình kiểm soát truy cập phổ biến nhất trong hệ sinh thái kỹ thuật dữ liệu là Role-Based Access Control (RBAC) và Attribute-Based Access Control (ABAC).

---

## Definition

**Access Control (Kiểm soát truy cập)** là xương sống của bảo mật hệ thống thông tin, đảm bảo tính bảo mật (Confidentiality) và tính toàn vẹn (Integrity) của dữ liệu.

Trong thế giới Data Engineering, kiểm soát truy cập giải quyết bài toán: *Làm thế nào để cho phép Data Scientist chạy mô hình Machine Learning trên toàn bộ kho dữ liệu, trong khi chỉ cho phép nhân viên Marketing xem dữ liệu khách hàng thuộc khu vực mà họ phụ trách, và cấm cả hai truy cập vào cột mã pin thẻ tín dụng?*

Có hai mô hình phân quyền chính:
1. **RBAC (Role-Based Access Control)**: Phân quyền dựa trên **Vai trò**.
2. **ABAC (Attribute-Based Access Control)**: Phân quyền dựa trên **Thuộc tính** (của người dùng, tài nguyên và môi trường).

---

## Why it exists

Không có kiểm soát truy cập, mọi người dùng kết nối vào hệ thống sẽ có toàn quyền (admin) dẫn đến những thảm họa:
1. **Lộ lọt dữ liệu (Data Breach)**: Nhân viên không phận sự hoặc hacker (thông qua tài khoản bị thỏa hiệp) có thể tải xuống toàn bộ dữ liệu khách hàng.
2. **Xóa/Sửa dữ liệu nhầm lẫn**: Một câu lệnh `DROP TABLE` hoặc `DELETE` vô tình từ một Data Analyst mới vào nghề có thể phá hủy cả hệ thống.
3. **Vi phạm pháp luật**: Các tiêu chuẩn như SOC2, HIPAA yêu cầu kiểm soát truy cập cực kỳ nghiêm ngặt và theo nguyên tắc *Least Privilege* (Đặc quyền tối thiểu).

---

## Core idea

### 1. RBAC (Role-Based Access Control)
Quyền truy cập không được cấp trực tiếp cho từng người dùng, mà được cấp cho một **Role (Vai trò)**. Người dùng sau đó được gán vào Role này.
* *Ưu điểm*: Dễ hiểu, dễ cài đặt cho các tổ chức có cấu trúc phòng ban rõ ràng. (Ví dụ: Role `DATA_ANALYST` được quyền `SELECT` trên bảng `sales`, Role `DATA_ENGINEER` được quyền `INSERT/UPDATE`).
* *Nhược điểm*: Gây ra tình trạng "Role Explosion" (Bùng nổ vai trò). Ví dụ: Khi bạn có 10 phòng ban và 5 cấp bậc, bạn phải tạo ra 50 Roles khác nhau.

### 2. ABAC (Attribute-Based Access Control)
Quyền truy cập được đánh giá theo thời gian thực (dynamically) dựa trên sự kết hợp của các **Thuộc tính (Attributes/Tags)**:
* Thuộc tính người dùng (User Attributes): Vị trí địa lý, Chức vụ, Phòng ban, Cấp độ bảo mật (Clearance level).
* Thuộc tính tài nguyên (Resource Attributes): Thẻ nhãn dữ liệu (PII, Public), Mức độ nhạy cảm.
* Thuộc tính môi trường (Environment Attributes): Thời gian trong ngày, Địa chỉ IP truy cập.

*Quy tắc ABAC ví dụ*: Cho phép đọc bảng `customers` NẾU `User.department == 'Sales'` VÀ `User.region == Resource.region` VÀ `Environment.time` nằm trong giờ hành chính.

---

## How it works

Hệ thống Access Control thường hoạt động kết hợp với Identity and Access Management (IAM) thông qua các bước:
1. **Authentication (Xác thực)**: Xác nhận danh tính người dùng (qua Password, SSO, Multi-Factor Authentication).
2. **Authorization (Ủy quyền)**: Đánh giá yêu cầu truy cập.
   * *Với RBAC*: Hệ thống kiểm tra xem User có Role nào, và Role đó có đặc quyền (privileges) trên Resource được yêu cầu hay không.
   * *Với ABAC*: Hệ thống Policy Engine (như OPA - Open Policy Agent, AWS IAM) thu thập các tags, đánh giá logic Boolean (IF-THEN) và ra quyết định Allow/Deny.
3. **Auditing (Kiểm toán)**: Ghi lại hành động (được phép hoặc bị từ chối) vào log.

---

## Architecture / Flow

```mermaid
graph TD
    User[Data Analyst] -->|Request: SELECT * FROM Finance_DB| APIGateway[API / Query Gateway]
    
    subgraph IAM & Access Control
        APIGateway -->|Evaluate Request| PDP[Policy Decision Point / Engine]
        PDP -->|Fetch Roles| Directory[Active Directory / Okta]
        PDP -->|Fetch Attributes & Tags| DataCatalog[Data Catalog]
        PDP -->|Evaluate Rule| PolicyStore[Policy Store (RBAC/ABAC rules)]
    end

    PDP -->|Decision: ALLOW/DENY| APIGateway
    APIGateway -->|DENY| UserError[Return Permission Denied]
    APIGateway -->|ALLOW| DB[(Finance Database)]
    DB -->|Return Data| User
```

---

## Practical example

Triển khai kiểm soát truy cập trong Snowflake kết hợp Row-level Security (RLS) và Column-level Security (CLS).

**1. Mô hình RBAC (Column-Level Security)**
Yêu cầu: Chỉ nhóm `HR_ADMIN` mới được xem lương nhân viên (`salary`), các nhân viên khác chỉ thấy `NULL`.
```sql
-- Tạo Role
CREATE ROLE HR_ADMIN;
GRANT ROLE HR_ADMIN TO USER alice;

-- Tạo Masking Policy (ABAC kết hợp RBAC)
CREATE OR REPLACE MASKING POLICY hide_salary AS (val NUMBER) RETURNS NUMBER ->
  CASE
    WHEN CURRENT_ROLE() IN ('HR_ADMIN') THEN val
    ELSE NULL
  END;

-- Áp dụng cho cột
ALTER TABLE employees MODIFY COLUMN salary SET MASKING POLICY hide_salary;
```

**2. Mô hình ABAC (Row-Level Security / Đọc dữ liệu theo vùng)**
Yêu cầu: Người dùng chỉ được xem doanh thu của cửa hàng thuộc khu vực (region) mà họ quản lý.
Thay vì tạo hàng chục Role như `MANAGER_US`, `MANAGER_EU`, ta sử dụng ABAC thông qua bảng Mapping và Row Access Policy.

```sql
-- Bảng Mapping (Lưu thuộc tính user)
-- manager_name | region
-- bob          | US
-- charlie      | EU

CREATE OR REPLACE ROW ACCESS POLICY region_policy AS (region_col VARCHAR) RETURNS BOOLEAN ->
  CURRENT_ROLE() = 'SUPER_ADMIN' 
  OR EXISTS (
    SELECT 1 FROM manager_mapping
    WHERE manager_name = CURRENT_USER()
      AND region = region_col
  );

-- Áp dụng cho bảng
ALTER TABLE sales ADD ROW ACCESS POLICY region_policy ON (region);
```

Khi Bob (Quản lý US) chạy `SELECT * FROM sales`, anh ấy chỉ thấy các dòng có `region = 'US'`, mặc dù anh ấy sử dụng chung câu lệnh SQL với những người khác.

---

## Best practices

* **Nguyên tắc Đặc quyền tối thiểu (Principle of Least Privilege)**: Chỉ cấp quyền vừa đủ để người dùng hoàn thành công việc. Mặc định là `DENY` cho mọi truy cập.
* **Quy hoạch Role theo chức năng, không theo người**: Không bao giờ gán quyền trực tiếp cho User (ví dụ: `GRANT SELECT TO USER alice`). Hãy gán quyền cho Role (ví dụ: `GRANT SELECT TO ROLE data_analyst`) và gán Role cho User.
* **Tách bạch Control Plane và Data Plane**: Sử dụng các công cụ quản trị tập trung (như Apache Ranger, AWS Lake Formation) để quản lý Policy (ABAC/RBAC) ở một nơi duy nhất thay vì code rải rác các lệnh GRANT/REVOKE trên từng Database riêng rẽ.
* **Kiểm duyệt định kỳ (Access Review)**: Thường xuyên rà soát lại các quyền truy cập, loại bỏ quyền của các nhân viên đã nghỉ việc hoặc chuyển bộ phận.

---

## Common mistakes

* **Role Explosion (Bùng nổ Role)**: Tạo quá nhiều Role cụ thể (ví dụ: `Role_Read_Table_A_Only`, `Role_Read_Table_B_Only`). Điều này làm hệ thống RBAC trở nên không thể quản lý. Lúc này cần chuyển sang ABAC.
* **Sử dụng tài khoản chia sẻ (Shared Accounts)**: Cả team Data Engineer dùng chung một tài khoản `admin_prod`. Khi có lỗi hoặc mất dữ liệu, không thể truy vết (Audit) được ai là người thực hiện.
* **Hardcode Logic phân quyền trong ứng dụng**: Viết logic `if (user == 'admin')` trực tiếp trong mã nguồn API thay vì đưa xuống tầng cơ sở dữ liệu hoặc Policy Engine. Khi cấu trúc tổ chức thay đổi, phải viết lại code ứng dụng.

---

## Trade-offs

### Ưu điểm
* **RBAC**: Dễ triển khai, dễ giải thích, phù hợp cho hầu hết các tổ chức quy mô nhỏ và vừa. Hệ thống tĩnh, tốc độ kiểm tra quyền nhanh.
* **ABAC**: Cực kỳ linh hoạt, có thể định nghĩa các luật phức tạp. Giảm thiểu số lượng Role phải quản lý, hỗ trợ mở rộng không giới hạn cho các hệ thống lớn.

### Nhược điểm
* **RBAC**: Thiếu linh hoạt, khó áp dụng Row-level/Column-level security theo ngữ cảnh động. Dẫn đến bùng nổ Role ở quy mô lớn.
* **ABAC**: Phức tạp để thiết kế và cài đặt. Việc đánh giá hàng tá thuộc tính tại thời điểm chạy (runtime) có thể gây ra độ trễ (latency) cho các câu lệnh truy vấn nếu Policy Engine không được tối ưu.

---

## When to use

* **RBAC**: Phù hợp cho 80% trường hợp sử dụng, nơi cấu trúc công việc rõ ràng (Data Engineer viết dữ liệu, Data Analyst đọc dữ liệu).
* **ABAC**: Cần thiết cho các doanh nghiệp Enterprise, môi trường Cloud nhiều tenant (Multi-tenant), nơi dữ liệu nhạy cảm (PII, y tế) yêu cầu phân quyền chi tiết tới từng hàng/cột dựa trên ngữ cảnh người dùng và vị trí địa lý.

## When not to use

* Không nên dùng ABAC cho các hệ thống nội bộ nhỏ lẻ vì chi phí thiết lập và bảo trì các công cụ Policy Engine cao hơn giá trị mang lại.

---

## Related concepts

* [Phân loại dữ liệu - Data Classification](/concepts/data-classification)
* [Nhật ký kiểm toán - Audit Logging](/concepts/audit-logging)

---

## Interview questions

### 1. Sự khác biệt cốt lõi giữa RBAC và ABAC là gì?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết cơ bản về mô hình phân quyền bảo mật.
* **Gợi ý trả lời**: RBAC dựa trên Vai trò (Role) tĩnh, phù hợp cho tổ chức quy mô nhỏ, dễ thiết lập nhưng dễ bị bùng nổ vai trò. ABAC dựa trên Thuộc tính (Attribute) động (như tags của dữ liệu, phòng ban của user, thời gian truy cập), cho phép phân quyền mịn màng và linh hoạt hơn nhưng phức tạp để triển khai. ABAC giải quyết bài toán "Role Explosion" của RBAC.

### 2. Làm thế nào để triển khai Row-Level Security (RLS) để giới hạn người dùng theo khu vực mà không tạo ra hàng trăm Role khác nhau?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng tư duy giải quyết vấn đề ABAC bằng SQL thực tế.
* **Gợi ý trả lời**: Không dùng RBAC mà dùng một biến thể của ABAC. Tạo một bảng Mapping (Entitlement table) ánh xạ `user_id` với `region`. Sau đó áp dụng một Policy (Row Access Policy) ở cấp độ bảng, ép hệ thống tự động chèn thêm điều kiện `WHERE region = (SELECT region FROM mapping_table WHERE user = current_user())` một cách vô hình vào mọi truy vấn.

### 3. Nguyên tắc Least Privilege (Đặc quyền tối thiểu) là gì và làm sao để áp dụng nó trong Data Engineering pipeline?
* **Người phỏng vấn muốn kiểm tra**: Tư duy bảo mật hệ thống đường ống dữ liệu (Pipeline security).
* **Gợi ý trả lời**: Least Privilege là chỉ cấp quyền đúng mức cần thiết để hoàn thành công việc. Trong pipeline, nghĩa là Service Account chạy Airflow DAG chỉ được quyền `SELECT` từ bảng nguồn, `INSERT/UPDATE` vào bảng đích, và tuyệt đối không có quyền `DROP TABLE`, `ALTER SCHEMA` hay đọc các bảng không liên quan đến tác vụ của DAG đó.

---

## References

1. **NIST Special Publication 800-162** - Guide to Attribute Based Access Control (ABAC) Definition and Considerations.
2. **Snowflake Documentation** - Row-Level Security & Column-Level Security.
3. **AWS IAM Best Practices** - Hướng dẫn chi tiết về RBAC, ABAC và Least Privilege.

---

## English summary

Access Control governs who can interact with what data resources and how. The two primary models are Role-Based Access Control (RBAC), which grants permissions based on static roles (e.g., Analyst, Engineer), and Attribute-Based Access Control (ABAC), which evaluates dynamic attributes of the user, resource, and environment (e.g., department, data tags, time of day). While RBAC is simpler to implement, it often leads to "Role Explosion" in large organizations. ABAC solves this by offering granular, context-aware permissions, enabling advanced features like Row-Level Security (RLS) and Column-Level Security (CLS) to secure PII without duplicating roles.
