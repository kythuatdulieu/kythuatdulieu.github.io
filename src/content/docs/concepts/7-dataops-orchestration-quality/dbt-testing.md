---
title: "Kiểm thử tự động - dbt Testing"
difficulty: "Intermediate"
tags: ["dbt", "data-testing", "data-quality", "analytics-engineering", "ci-cd"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "dbt Testing - Hướng dẫn triển khai kiểm thử tự động dữ liệu"
metaDescription: "Tìm hiểu chi tiết về dbt Testing: từ Generic Tests (Not Null, Unique...) cơ bản đến Singular Tests (SQL tùy chỉnh), sử dụng dbt_expectations để đảm bảo chất lượng dữ liệu."
description: "Có một tình huống trớ trêu mà bất kỳ ai làm trong ngành dữ liệu cũng từng trải qua ít nhất một lần: Sếp hoặc đối tác kinh doanh gửi một tin nhắn báo rằng Dashboard bị sai số liệu. dbt Testing chính là giải pháp tự động hóa kiểm thử để chặn dữ liệu bẩn ngay từ trong luồng xử lý."
---



Có một tình huống trớ trêu mà bất kỳ ai làm trong ngành dữ liệu cũng từng trải qua ít nhất một lần: Sếp hoặc đối tác kinh doanh gửi một tin nhắn báo rằng Dashboard bị sai số liệu, hoặc doanh thu tháng này bị âm một cách vô lý. Việc phát hiện lỗi muộn ở tầng báo cáo khiến Data Team trở nên thụ động và mất đi sự tin cậy (data trust) từ phía người dùng.

**dbt Testing** cung cấp một cơ chế tuyệt vời để kiểm thử dữ liệu ngay trong quá trình chạy Pipeline (Data Transformation). Nó giúp đảm bảo tính toàn vẹn, độ chính xác của dữ liệu và cảnh báo sớm trước khi dữ liệu bẩn xâm nhập vào hệ thống phân tích cuối cùng.

---

## 1. Tại sao cần kiểm thử dữ liệu trong dbt?



Dữ liệu đầu vào thường xuyên thay đổi, các hệ thống nguồn có thể phát sinh lỗi (như nhập sai định dạng, thiếu khóa chính, xóa nhầm bản ghi). Kiểm thử dữ liệu giúp:

- **Bảo vệ tính toàn vẹn của Data Warehouse:** Đảm bảo dữ liệu tuân thủ các quy tắc kinh doanh chặt chẽ (Business Logic).
- **Phát hiện lỗi sớm (Shift-left testing):** Bắt lỗi ngay tại tầng Staging hoặc Intermediate, thay vì để lỗi trôi xuống tầng Mart và lên Dashboard.
- **Tài liệu hóa dữ liệu (Documentation):** Bản thân các quy tắc kiểm thử cũng là tài liệu về cách dữ liệu hoạt động. Khi nhìn vào file `schema.yml`, một kỹ sư mới có thể hiểu ngay ràng buộc của từng bảng.
- **Hỗ trợ DataOps & CI/CD:** Các bài kiểm thử dbt (dbt tests) là cốt lõi để triển khai CI/CD, tự động từ chối các Pull Request có code làm hỏng dữ liệu.

---

## 2. Các loại dbt Tests cơ bản

dbt hỗ trợ hai phương pháp kiểm thử chính: **Generic Tests** (Kiểm thử chung) và **Singular Tests** (Kiểm thử tùy biến).

### 2.1. Generic Tests

Generic Tests là các loại kiểm thử được xây dựng sẵn trong dbt Core. Chúng bao phủ khoảng 80% nhu cầu kiểm tra cơ bản. Thay vì phải viết SQL phức tạp, bạn chỉ cần cấu hình chúng trong các file YAML (thường là `schema.yml` hoặc `models.yml`).

Có 4 loại Generic Tests cốt lõi:

*   **`unique`:** Đảm bảo không có giá trị nào trong cột bị trùng lặp. Thường dùng cho Khóa chính (Primary Key).
*   **`not_null`:** Đảm bảo cột không chứa giá trị NULL.
*   **`accepted_values`:** Ràng buộc giá trị của cột phải nằm trong một danh sách cố định.
*   **`relationships`:** Kiểm tra khóa ngoại (Foreign Key), đảm bảo mọi giá trị trong cột này phải tồn tại trong cột của một bảng khác.

**Ví dụ cấu hình trong `models/schema.yml`:**

```yaml
version: 2

models:
  - name: dim_customers
    description: "Bảng lưu trữ thông tin khách hàng đã làm sạch."
    columns:
      - name: customer_id
        description: "Khóa chính của khách hàng"
        tests:
          - unique
          - not_null
      - name: status
        description: "Trạng thái tài khoản"
        tests:
          - accepted_values:
              values: ['active', 'inactive', 'pending']
              quote: false

  - name: fct_orders
    description: "Bảng Fact lưu các giao dịch mua hàng."
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: customer_id
        tests:
          - relationships:
              to: ref('dim_customers')
              field: customer_id
```

### 2.2. Singular Tests

Singular Tests là các bài kiểm thử tùy chỉnh khi yêu cầu kiểm tra vượt quá khả năng của Generic Tests (thường liên quan đến logic kinh doanh đặc thù hoặc so sánh dữ liệu giữa nhiều cột/bảng).

Bạn định nghĩa Singular Test bằng cách viết một file SQL (phần mở rộng `.sql`) và lưu vào thư mục `tests/` của dbt project.
**Nguyên tắc của dbt test:** Câu truy vấn (Query) của bạn phải **trả về các dòng dữ liệu bị lỗi (failing records)**. Nếu query trả về 0 dòng, test đó được coi là passed.

**Ví dụ 1: Ngày trả hàng phải sau ngày mua hàng**

Tạo file: `tests/assert_return_date_after_order_date.sql`

```sql
-- Trả về các đơn hàng có ngày trả hàng (return_date) sớm hơn ngày đặt hàng (order_date)
select
    order_id,
    order_date,
    return_date
from {{ ref('fct_orders') }}
where return_date < order_date
```

**Ví dụ 2: Tổng giá trị đơn hàng không được âm**

Tạo file: `tests/assert_order_total_is_positive.sql`

```sql
-- Tìm các đơn hàng có tổng tiền (amount) nhỏ hơn 0
select
    order_id,
    amount
from {{ ref('fct_orders') }}
where amount < 0
```

---

## 3. Mở rộng với Advanced dbt Testing Packages

Hệ sinh thái dbt rất mạnh mẽ nhờ các package mã nguồn mở, giúp bổ sung thêm hàng trăm bài test nâng cao.

### 3.1. `dbt_utils`

Package `dbt_utils` cung cấp các test phổ biến mà không có sẵn trong dbt Core:
*   `unique_combination_of_columns`: Kiểm tra tính duy nhất trên nhiều cột kết hợp (Composite Key).
*   `accepted_range`: Đảm bảo giá trị số hoặc ngày tháng nằm trong một khoảng nhất định.
*   `recency`: Kiểm tra xem dữ liệu có được cập nhật gần đây không (Data Freshness).

```yaml
columns:
  - name: created_at
    tests:
      - dbt_utils.recency:
          datepart: day
          interval: 1
```

### 3.2. `dbt_expectations`

Được lấy cảm hứng từ thư viện [Great Expectations](https://greatexpectations.io/), `dbt_expectations` cung cấp một tập hợp các test mang tính thống kê và hình dạng dữ liệu (Data Profiling).
Một số test tiêu biểu:
*   `expect_column_values_to_match_regex`: Kiểm tra format bằng biểu thức chính quy (VD: email, số điện thoại hợp lệ).
*   `expect_column_values_to_be_between`: Ràng buộc khoảng giá trị.
*   `expect_table_row_count_to_equal_other_table`: So sánh số dòng giữa 2 bảng.

```yaml
columns:
  - name: email_address
    tests:
      - dbt_expectations.expect_column_values_to_match_regex:
          regex: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
```

---

## 4. Quản lý lỗi với mức độ nghiêm trọng (Severity)

Đôi khi, không phải lỗi dữ liệu nào cũng đáng để dừng toàn bộ Pipeline. dbt cho phép định nghĩa **Severity** (`warn` hoặc `error`) dựa trên số lượng bản ghi lỗi (Threshold).

*   `error`: Nếu test fail, dbt run/build sẽ thất bại và dừng các model phụ thuộc (Downstream models).
*   `warn`: Nếu test fail, dbt in ra cảnh báo màu vàng nhưng vẫn tiếp tục luồng thực thi.

```yaml
columns:
  - name: status
    tests:
      - accepted_values:
          values: ['placed', 'shipped', 'completed', 'returned']
          config:
            severity: warn
            error_if: "> 50" # Chỉ báo lỗi nếu có trên 50 đơn hàng sai status
            warn_if: "> 0"   # Cảnh báo nếu có bất kỳ dòng nào vi phạm
```

---

## 5. Chiến lược chạy Test và CI/CD DataOps

Khi số lượng model tăng lên hàng trăm, chạy toàn bộ test sẽ tốn rất nhiều thời gian và chi phí tính toán. Một DataOps Engineer cần có chiến thuật tối ưu:

### 5.1. Sử dụng lệnh `dbt build`

Lệnh `dbt build` là lựa chọn khuyên dùng thay thế cho việc tách rời `dbt run` và `dbt test`. `dbt build` sẽ thực thi theo trình tự: Build một model -> Chạy test của model đó -> Nếu pass, mới build các model downstream. Điều này ngăn dữ liệu bẩn lây lan (Cascading failure).

### 5.2. Lựa chọn chạy Test linh hoạt (Selectors)

Bạn có thể gắn thẻ (Tags) và sử dụng Selectors để chỉ chạy các test cần thiết.

```bash
# Chỉ chạy test cho các model trong thư mục marts
dbt test --select marts

# Chạy test có tag 'core_metrics'
dbt test --select tag:core_metrics

# Chạy test cho model dim_customers và các test ràng buộc với nó
dbt test --select dim_customers
```

### 5.3. Tích hợp với Continuous Integration (CI)

Trong quy trình làm việc chuẩn, mọi thay đổi code dbt phải qua Pull Request (PR). Hệ thống CI (GitHub Actions, GitLab CI) sẽ:
1. Tạo một schema tạm (Slim CI).
2. Chỉ chạy `dbt build` trên các model bị thay đổi (modified models) và model phụ thuộc.
3. Nếu tất cả model và test đều thành công, PR mới được phép Merge vào nhánh `main`.

---

## 6. Tổng Kết

Kiểm thử dữ liệu với dbt không chỉ đơn thuần là viết vài dòng cấu hình `unique` hay `not_null`. Nó là cốt lõi của việc đảm bảo **Data Quality** trong kiến trúc DataOps. Bằng cách kết hợp Generic Tests, Singular Tests và các package mạnh mẽ như `dbt_expectations`, Data Team có thể tự tin bàn giao dữ liệu chính xác và thiết lập hệ thống cảnh báo sớm đáng tin cậy.

## Tài Liệu Tham Khảo
* [DataOps Manifesto](https://dataopsmanifesto.org/)
* [dbt Testing Documentation](https://docs.getdbt.com/docs/build/tests)
* [dbt_expectations Package](https://hub.getdbt.com/calogica/dbt_expectations/latest/)
* [dbt_utils Package](https://hub.getdbt.com/dbt-labs/dbt_utils/latest/)
* [Great Expectations: Data Quality and Profiling](https://greatexpectations.io/)
