---
title: "Kiểm thử tự động - dbt Testing"
category: "Transformation & Analytics Engineering"
difficulty: "Intermediate"
tags: ["dbt", "data-testing", "data-quality", "analytics-engineering", "ci-cd"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "dbt Testing - Hướng dẫn triển khai kiểm thử tự động dữ liệu"
metaDescription: "Khám phá dbt Testing: các bài kiểm thử cơ bản (Generic Tests) và phức tạp (Singular Tests) để đảm bảo chất lượng và tính toàn vẹn của dữ liệu trong quá trình Transformation."
---

# Kiểm thử tự động - dbt Testing

## Summary

dbt Testing là một cơ chế kiểm thử tích hợp trực tiếp trong công cụ dbt (data build tool) nhằm phát hiện sớm những bất thường trong dữ liệu và đảm bảo chất lượng dữ liệu (Data Quality) trong suốt quá trình Transformation. Thay vì chờ đến khi người dùng báo cáo sai sót trên Dashboard, dbt Testing cho phép các Kỹ sư Dữ liệu (Data/Analytics Engineers) viết các ràng buộc dữ liệu (assertions) dạng SQL để cảnh báo hoặc chặn đứng pipeline khi dữ liệu vi phạm quy tắc kinh doanh.

---

## Definition

**dbt Testing** là tập hợp các phương thức giúp xác minh sự thật về dữ liệu (assertions) mà bạn mong đợi trong Data Warehouse. Trong hệ sinh thái dbt, mọi test đều bản chất là một câu truy vấn SQL (SQL Query).
Quy tắc cốt lõi: Một bài test dbt phải trả về (SELECT) những dòng dữ liệu vi phạm (failing records). Nếu câu truy vấn test trả về **0 kết quả** (0 rows), nghĩa là test **PASS**. Nếu nó trả về từ 1 dòng trở lên, test **FAIL**.

---

## Why it exists

Dữ liệu thô từ các hệ thống nguồn (APIs, OLTP databases) hiếm khi hoàn hảo. Lỗi có thể xuất hiện vô số kiểu:
* Một hệ thống cập nhật phần mềm làm rớt (drop) khóa chính, gây ra các bản ghi trùng lặp (duplicates).
* Hệ thống đặt hàng đẩy giá trị số lượng đơn hàng (quantity) bằng số âm.
* Dữ liệu tham chiếu không khớp (Mã sản phẩm trong bảng Hóa đơn không tồn tại trong bảng Sản phẩm).

Nếu những dữ liệu "bẩn" này chảy thẳng qua các lớp Transformation và lên báo cáo tài chính, hậu quả đối với quyết định kinh doanh sẽ vô cùng nghiêm trọng. Khái niệm "Software Testing" đã phổ biến ở giới lập trình hàng thập kỷ, dbt mang mô hình tư duy tương tự vào trong thế giới Data Engineering.

---

## Core idea

dbt cung cấp 2 loại test chính:

### 1. Generic Tests (Kiểm thử cấu hình sẵn)
Là các kiểm thử phổ biến nhất, được định nghĩa một lần bằng macro (Jinja) và có thể tái sử dụng cho bất kỳ cột, bất kỳ bảng nào chỉ bằng cách cấu hình trong file `.yml`.
dbt có sẵn 4 generic tests thiết yếu (Big 4):
* `unique`: Đảm bảo không có giá trị nào trong cột bị trùng lặp.
* `not_null`: Đảm bảo cột không chứa giá trị NULL.
* `accepted_values`: Đảm bảo các giá trị trong cột chỉ nằm trong một tập hợp hữu hạn cho trước.
* `relationships`: (Kiểm tra khóa ngoại) Đảm bảo mọi giá trị trong cột này đều tồn tại ở cột khóa chính của bảng khác.

### 2. Singular Tests (Kiểm thử đặc thù)
Là các bài test được viết bằng mã SQL thuần túy lưu vào các file `.sql` trong thư mục `tests/`. Nó dành cho các logic kiểm tra phức tạp mang tính đặc thù nghiệp vụ mà Generic Test không bao phủ được (ví dụ: "Ngày kết thúc hợp đồng không được nhỏ hơn ngày bắt đầu hợp đồng", hoặc "Tổng doanh thu mỗi ngày không được rớt quá 50% so với ngày hôm qua").

---

## How it works

Quy trình hoạt động:

```mermaid
flowchart TD
    A[1. Khai báo Tests<br/>schema.yml / thư mục tests] --> B[2. Biên dịch<br/>Lệnh dbt test]
    B --> C[3. Gửi SQL Queries<br/>đến Data Warehouse]
    C --> D{4. Đếm số dòng<br/>vi phạm}
    D -- "Count = 0" --> E[PASS<br/>(Xanh)]
    D -- "Count > 0" --> F[FAIL / WARN<br/>(Đỏ / Vàng)]
```

1. Bạn khai báo tests trong file `schema.yml` hoặc viết các file SQL trong thư mục `tests`.
2. Khi chạy lệnh `dbt test`, công cụ sẽ tự động biên dịch cấu hình của bạn thành các câu truy vấn SQL tường minh.
3. dbt gửi các câu lệnh SQL đó lên nền tảng Data Warehouse (Snowflake, BigQuery, PostgreSQL) để thực thi.
4. Đếm số lượng dòng trả về. Nếu count = 0, báo PASS màu xanh. Nếu count > 0, báo FAIL màu đỏ (kèm theo log thông báo dòng bị lỗi) và trả về exit code lỗi.

---

## Practical example

### Ví dụ Generic Test (Khai báo trong file YAML)

```yaml
version: 2

models:
  - name: fct_orders
    description: "Bảng sự kiện giao dịch đơn hàng."
    columns:
      - name: order_id
        description: "Khóa chính của đơn hàng"
        tests:
          - unique
          - not_null
      
      - name: customer_id
        tests:
          - relationships:
              to: ref('dim_customers') # Kiểm tra khóa ngoại tới bảng khách hàng
              field: customer_id
              
      - name: status
        tests:
          - accepted_values:
              values: ['placed', 'shipped', 'completed', 'returned']
```

### Ví dụ Singular Test (File: `tests/assert_total_amount_is_positive.sql`)

```sql
-- Dòng vi phạm là những dòng có tổng tiền nhỏ hơn 0
SELECT
    order_id,
    sum_amount
FROM {{ ref('fct_orders') }}
WHERE sum_amount < 0
```

---

## Best practices

* **Mọi khóa chính (Primary Key) phải có test**: Bắt buộc mọi khóa chính của mọi mô hình đều phải gán ít nhất bộ đôi `unique` và `not_null`. Nếu thiếu chúng, việc JOIN bảng sau này sẽ tạo ra lỗi nhân đôi dữ liệu ngầm (Fan-out trap).
* **Kết hợp với CI/CD Pipeline**: Chạy `dbt test` tự động mỗi khi một lập trình viên mở Pull Request. Không bao giờ merge code mới vào nhánh chính (main) nếu có bài test nào FAIL.
* **Sử dụng dbt_expectations**: Tận dụng các package mã nguồn mở của cộng đồng như `dbt_expectations` hoặc `dbt_utils`. Các package này cung cấp sẵn hàng chục Generic Tests siêu mạnh (ví dụ: kiểm tra chuỗi có đúng định dạng Email không, kiểm tra độ dài chuỗi, kiểm tra outlier bằng thống kê).
* **Quản lý mức độ lỗi (Severity)**: Với các lỗi nhẹ (như có 1 vài đơn hàng sai trạng thái do test environment), sử dụng thuộc tính `severity: warn` để cảnh báo thay vì làm sập toàn bộ luồng xử lý (`error`).

---

## Common mistakes

* **Over-testing**: Tạo ra hàng trăm bài test cho những cột không quan trọng, dẫn đến tốn kém rất nhiều tiền điện toán (compute cost) trên cloud khi chạy `dbt test` hàng ngày.
* **Kiểm thử logic của quá trình trích xuất tại tầng Transformation**: dbt test chạy ở tầng Data Warehouse. Nếu file CSV đẩy lên bị thiếu cột, pipeline ingestion đã chết từ trước rồi. Test trong dbt chỉ nhằm kiểm soát dữ liệu bên trong DW.
* **Bỏ qua Warning Tests**: Các test cấu hình ở mức cảnh báo (WARN) thường bị "mù chữ" - Data Engineer thấy xanh là nghĩ hệ thống bình thường, dần dần bỏ qua các cảnh báo tích tụ thành đống rác dữ liệu khổng lồ.

---

## Trade-offs

### Ưu điểm
* **Phát hiện lỗi sớm**: Biến đội ngũ dữ liệu từ "phản ứng" (đợi business chửi) sang "chủ động" (báo lỗi trên Slack ngay trong đêm).
* **Hỗ trợ Code Refactoring**: Khi bạn sửa đổi một mô hình SQL cực lớn, chỉ cần chạy lại bộ test. Nếu chúng vẫn màu xanh, bạn có thể tự tin 99% rằng mình chưa làm hỏng dữ liệu.

### Nhược điểm
* **Chi phí tính toán cao (Cost)**: Mỗi bài test là một truy vấn SQL quét dữ liệu. Với Data Warehouse lớn, việc quét toàn bộ cột trong bảng Terabytes để tìm giá trị NULL tiêu tốn cực nhiều tài nguyên.
* **Bảo trì (Maintenance overhead)**: Logic kinh doanh liên tục thay đổi (ví dụ: công ty thêm trạng thái đơn hàng `refunded`), đội Data phải bảo trì hàng loạt các `accepted_values` tests liên quan để tránh báo lỗi oan (false positives).

---

## When to use

* Sử dụng trên MỌI dự án triển khai dbt. Data Testing không phải là tính năng "Nice-to-have" mà là yêu cầu bắt buộc (Mandatory) của Analytics Engineering hiện đại.
* Đặc biệt quan trọng ở các hệ thống tài chính, y tế nơi sai lệch 1 dòng dữ liệu có thể dẫn đến tổn thất lớn hoặc kiện tụng.

## When not to use

* Với các bảng lịch sử (Archive) hoặc các bảng Log ít khi truy vấn và không dùng để lên báo cáo quyết định kinh doanh, có thể bỏ qua việc test để tiết kiệm chi phí cloud.

---

## Related concepts

* [Data Quality](/concepts/data-quality)
* [Analytics Engineering](/concepts/analytics-engineering)
* [Data Transformation](/concepts/data-transformation)
* [Data Reconciliation](/concepts/data-reconciliation)

---

## Interview questions

### 1. Triết lý thiết kế đằng sau một bài test dbt (Singular test) là gì? Khác biệt giữa câu lệnh `SELECT` thông thường và `SELECT` trong dbt test như thế nào?
* **Người phỏng vấn muốn kiểm tra**: Sự thấu hiểu về nguyên lý hoạt động của dbt testing thay vì chỉ học vẹt syntax YAML.
* **Gợi ý trả lời (Strong Answer)**: Một câu lệnh SELECT bình thường được dùng để lấy ra những kết quả CHÚNG TA MUỐN TÌM (Target data). Trong khi đó, tư duy viết SELECT trong dbt test phải đi ngược lại: Cố gắng lấy ra những kết quả PHẠM LỖI (Failing data). Do cơ chế của dbt là "nếu count > 0 thì Fail", nên ta phải viết mệnh đề WHERE sao cho nó "tóm" được các dòng vi phạm. (Ví dụ: Thay vì WHERE sum > 0 để xem doanh thu, ta phải viết WHERE sum < 0 để tìm hóa đơn lỗi).

### 2. Làm thế nào để khắc phục chi phí quét dữ liệu quá đắt đỏ khi chạy `unique` test trên một bảng sự kiện hàng tỷ dòng mỗi ngày?
* **Người phỏng vấn muốn kiểm tra**: Kinh nghiệm tối ưu hóa hiệu năng/chi phí (Cost optimization) cho Data Warehouse mức độ Enterprise.
* **Gợi ý trả lời (Strong Answer)**:
  * Cách 1: Thay vì chạy Test trên toàn bộ bảng lịch sử (Full scan), ta có thể sử dụng cấu hình tùy chỉnh để test chỉ chạy trên phần dữ liệu của những ngày gần nhất (`WHERE created_at >= current_date - 3`).
  * Cách 2: Sử dụng package mở rộng (như `dbt_expectations`) hoặc tính năng `limit` hỗ trợ test incremental.
  * Cách 3: Đảm bảo nền tảng DWH bên dưới (VD: Snowflake) có bật các tính năng đánh index / Metadata cashing trên cột PK để lấy COUNT nhanh mà không cần quét ổ cứng.
* **Lỗi cần tránh**: Trả lời rằng sẽ tắt luôn việc chạy test.

---

## References

1. **dbt Labs Documentation** - dbt Tests (Tài liệu cốt lõi về 4 Generic Tests).
2. **Fundamentals of Data Engineering** - Joe Reis (Chương nói về Data Quality validation trong pipelines).

---

## English summary

dbt Testing provides an automated framework for Data and Analytics Engineers to embed data quality checks (assertions) directly into their transformation pipelines. Using YAML configurations for generic tests (like `unique`, `not_null`, `accepted_values`, and `relationships`) or writing custom SQL for singular tests, dbt dynamically executes these queries against the Data Warehouse. The fundamental rule is that a test fails if it returns one or more records (representing data violations), enabling teams to catch data anomalies early, ensure Single Source of Truth integrity, and prevent bad data from reaching downstream business dashboards.
