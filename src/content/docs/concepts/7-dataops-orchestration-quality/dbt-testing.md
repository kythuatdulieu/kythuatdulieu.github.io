---
title: "Kiểm thử tự động - dbt Testing"
domains: ["DE", "DA"]
level: "Middle"
difficulty: "Intermediate"
tags: ["dbt", "data-testing", "data-quality", "unit-testing", "great-expectations", "ci-cd"]
readingTime: "20 mins"
lastUpdated: 2026-06-29
seoTitle: "Kiểm thử dữ liệu với dbt (dbt Testing): Kiến trúc và Thực chiến DataOps"
metaDescription: "Tìm hiểu kiến trúc dbt Testing: Data Quality as Code, Unit Testing dbt 1.8+, Great Expectations vs dbt, Trade-offs chi phí và tích hợp Slim CI/CD."
description: "Data Downtime (thời gian dữ liệu bị sai hoặc ngưng trệ) là cơn ác mộng của mọi Data Team. Ứng dụng dbt Testing ở quy mô Enterprise: Generic Tests, Unit Tests, Slim CI."
---

Có một tình huống kinh điển mà bất kỳ kỹ sư dữ liệu nào cũng từng đối mặt: "Silent Failure" (Lỗi câm). Pipeline của bạn chạy thành công, Airflow báo xanh (Success), không có một task nào bị *OOMKilled* hay *Timeout*. Nhưng đến sáng hôm sau, team Business Intelligence phàn nàn rằng doanh thu bị nhân đôi, hoặc dashboard báo cáo khách hàng mới bằng 0.

Lỗi không nằm ở luồng chạy vật lý, mà nằm ở **logic dữ liệu**. Khi quy mô hệ thống đạt mức hàng nghìn models (như tại Uber, Netflix hay Spotify), bạn không thể dùng mắt người hay vài câu SQL lẻ tẻ để kiểm tra. **dbt Testing** biến quy trình này thành **Data Quality as Code** (Chất lượng dữ liệu dưới dạng mã nguồn), cho phép bạn "Shift-Left" [kiểm thử từ sớm] và chặn đứng dữ liệu bẩn trước khi nó phá hỏng các báo cáo hạ nguồn (downstream).

---

## 1. Kiến trúc Kiểm thử trong dbt (Testing Architecture)

dbt phân biệt rõ ràng hai khái niệm kiểm thử: **Data Tests** (kiểm tra dữ liệu thực tế) và **Unit Tests** (kiểm tra logic lập trình).

### 1.1. Data Tests: Data Contracts & Generic Tests

Tại các lớp Staging, **Generic Tests** đóng vai trò như các **Data Contracts** (Hợp đồng dữ liệu). Chúng kiểm tra dữ liệu thật trong Data Warehouse và đảm bảo Schema không bị phá vỡ. Nguyên tắc cốt lõi của Data Test là biên dịch (compile) ra một câu lệnh SQL; **nếu truy vấn trả về > 0 dòng, bài kiểm thử đó FAIL.**

Các built-in tests phổ biến:
*   `unique`, `not_null`: Ngăn chặn lỗi Cartesian Explosion (phình to dữ liệu do join sai khóa).
*   `accepted_values`: Ngăn chặn dữ liệu rác từ form nhập liệu.
*   `relationships`: Đảm bảo Referential Integrity (Tính toàn vẹn tham chiếu).

**Ví dụ cấu hình (models.yml):**
```yaml
models:
  - name: stg_stripe__payments
    columns:
      - name: payment_id
        tests:
          - unique
          - not_null
      - name: status
        tests:
          - accepted_values:
              values: ['success', 'failed', 'pending']
              config:
                severity: warn # Non-blocking test
                warn_if: "> 10" # Cảnh báo nếu > 10 giao dịch trạng thái lạ
```

### 1.2. Kiểm thử Logic Nghiệp vụ (Singular Tests)
Khi quy tắc quá phức tạp (Cross-column, Cross-table), ta dùng **Singular Tests**. Đây là các câu lệnh `.sql` tùy chỉnh lưu trong thư mục `tests/`.

### 1.3. Unit Testing trong dbt (từ v1.8+)

Data Tests chạy trên dữ liệu thật nên chậm, tốn chi phí scan dữ liệu, và kết quả không mang tính tất định (non-deterministic). 

**Unit Testing** (giới thiệu từ dbt v1.8) giải quyết việc này bằng cách **mock (giả lập)** dữ liệu đầu vào. Nó không chạy trên data thật, mà sinh ra CTE tĩnh dựa trên input bạn định nghĩa, truyền qua model của bạn, và so sánh với output mong đợi.

**Ví dụ Unit Test logic tính thuế:**
```yaml
unit_tests:
  - name: test_is_valid_email
    model: stg_users
    given:
      - input: source('raw', 'users')
        rows:
          - {user_id: 1, email: "valid@example.com"}
          - {user_id: 2, email: "invalid-email"}
    expect:
      rows:
        - {user_id: 1, is_valid_email: true}
        - {user_id: 2, is_valid_email: false}
```
Unit Test cho phép áp dụng Test-Driven Development (TDD) cho SQL: Viết test trước, viết logic model sau.

---

## 2. dbt Tests vs. Great Expectations (GX)

Một câu hỏi kinh điển: *Nên dùng dbt Tests hay Great Expectations?*

| Tiêu chí | dbt Tests |" Great Expectations (GX) "|
| :--- | :--- | :--- |
| **Mục tiêu cốt lõi** | Kiểm thử Transformation ngay bên trong luồng dbt. | Observability & Data Validation chéo hệ thống. |
| **Cách thực thi** | Chạy Native trên Data Warehouse bằng SQL. | Linh hoạt, hỗ trợ Pandas, Spark, SQL. |
|" **Báo cáo (Reporting)** "| Tích hợp trong dbt docs. | Data Docs cực kỳ trực quan và chi tiết cho Business. |
| **Phù hợp cho** | Đội ngũ Analytics Engineers, SQL-centric. | Đội ngũ Data Quality độc lập, kiểm tra Data Lake/Warehouse phức tạp. |

**Lời khuyên:** Hãy bắt đầu với dbt Tests. Nếu bạn cần các test phức tạp về mặt thống kê (Statistical Distribution), hãy cài package `dbt-expectations` (porting các hàm của GX sang dbt). Chỉ dùng Great Expectations độc lập khi bạn có Data Stack phức tạp (vừa có Spark, vừa Snowflake, vừa Pandas).

---

## 3. Systemic Trade-offs: Những đánh đổi ở quy mô lớn

Khi hệ thống Data Warehouse vượt mức Terabytes hoặc Petabytes, một câu lệnh `select count(*)` hoặc tìm `unique` trên bảng lớn có thể ngốn hàng chục USD (Snowflake Credits, BigQuery Bytes) và kéo dài thời gian chạy SLA thêm hàng giờ.

### Trade-off 1: Data Confidence vs. Pipeline SLA (Độ tin cậy vs. Độ trễ)
- **Vấn đề**: Chạy 500 bài test sau mỗi lần load dữ liệu sẽ làm chậm luồng cấp dữ liệu (Pipeline Latency).
- **Giải pháp**: Phân cấp mức độ nghiêm trọng (Severity).
  - Khóa chính (Primary Key) -> `severity: error` (Blocking). Lỗi sẽ dừng ngay Pipeline (Cascading stop) để tránh lan truyền dữ liệu bẩn.
  - Cột phụ (Metrics) -> `severity: warn` (Non-blocking). Lưu log, Pipeline vẫn chạy. Team sẽ mở JIRA ticket xử lý sau.

### Trade-off 2: Compute Cost vs. Test Coverage (Chi phí tính toán vs. Độ phủ)
- **Vấn đề**: Việc chạy `unique` trên một bảng Fact chứa 5 tỷ dòng mỗi ngày là sự lãng phí khủng khiếp.
- **Giải pháp (Incremental Testing)**: Cấu hình `where` clause vào dbt tests để chỉ test partition mới nhất:

```yaml
tests:
  - unique:
      column_name: order_id
      config:
        where: "created_at >= current_date - interval '1 day'"
```

### Real-world Incidents: Consumer Lag & OOMKilled do Cartesian Explosion
Giả sử một bảng Dim bị duplicate khóa [do test `unique` bị tắt để tiết kiệm tiền]. Khi bảng Fact Join với bảng Dim này, hiện tượng **Cartesian Explosion** xảy ra. 
1 tỷ dòng Fact x 2 (bản ghi Dim duplicate) = 2 tỷ dòng.
Kết quả: Memory của hệ thống xử lý (Spark/Trino) bị tràn (OOMKilled), Spill-to-disk quá lớn, khiến cụm (cluster) bị sập.
=> **Bài học:** Không bao giờ thỏa hiệp với test `unique` trên các bảng Dimensions cốt lõi.

---

## 4. Slim CI/CD: Triển khai Kiểm thử Tự động

Ở các Data Team quy mô lớn (DataOps), không ai tự chạy `dbt test` bằng tay. Mọi Pull Request (PR) phải vượt qua vòng kiểm thử tự động (CI). 

Thay vì chạy toàn bộ project, hệ thống **Slim CI** sử dụng cờ `--select state:modified+` để chỉ build và test những model bị thay đổi code trong PR, giúp giảm thời gian CI từ hàng tiếng xuống còn vài phút.

**Kiến trúc GitHub Actions cho Slim CI dbt:**

```yaml
name: dbt_slim_ci

on:
  pull_request:
    branches:
      - main

jobs:
  dbt_run_and_test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Download Production Manifest
        # Tải file manifest.json từ lần chạy Prod thành công gần nhất
        run: aws s3 cp s3://my-dbt-artifacts/manifest.json ./target/

      - name: Run Slim CI
        # Lệnh dbt build thực thi song song cả run và test.
        # defer giúp đọc dữ liệu từ schema PR, nếu không có sẽ lấy từ schema Prod.
        run: |
          dbt build \
            --select state:modified+ \
            --defer --state ./target
```

### Tại sao dùng `dbt build` thay vì `dbt run` rồi `dbt test`?
Lệnh `dbt build` chạy xen kẽ (Run Model A -> Test Model A -> Run Model B). Nếu Model A fail test, Model B sẽ tự động bị bỏ qua (Skipped). Điều này tối ưu compute resources hơn rất nhiều, vì đằng nào dữ liệu hạ nguồn (Model B) cũng đã bị bẩn nếu thượng nguồn (Model A) fail.

---

## Nguồn Tham Khảo (References)
- [Uber Engineering: Data Quality Monitor][https://www.uber.com/en-VN/blog/data-quality-monitor/]
- [dbt Documentation: Unit testing][https://docs.getdbt.com/docs/build/unit-tests]
- [dbt Packages: dbt_expectations][https://hub.getdbt.com/calogica/dbt_expectations/latest/]
- [Great Expectations vs dbt Tests][https://greatexpectations.io/blog/]
- [DataOps Manifesto](https://dataopsmanifesto.org/]
