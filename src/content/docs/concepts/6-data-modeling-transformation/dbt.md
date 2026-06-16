---
title: "dbt (data build tool) - Công cụ chuyển đổi dữ liệu"
difficulty: "Beginner"
tags: ["dbt", "transformation", "sql", "data-warehouse", "analytics-engineering"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "dbt (data build tool) là gì? Lõi của Analytics Engineering"
metaDescription: "Tìm hiểu dbt (data build tool) là gì, tại sao nó thay đổi hoàn toàn cách Data Engineers và Data Analysts làm việc. Kiến trúc ELT, Jinja SQL và quản lý version."
description: "Nếu bạn hỏi bất kỳ một Analytics Engineer hay Data Engineer nào về công cụ đã thay đổi hoàn toàn cách họ làm việc trong những năm gần đây, câu trả lời thường sẽ là dbt. Trong bài viết này, chúng ta sẽ tìm hiểu chi tiết về dbt và vai trò của nó trong Modern Data Stack."
---



Nếu bạn hỏi bất kỳ một Analytics Engineer hay Data Engineer nào về công cụ đã thay đổi hoàn toàn cách họ làm việc trong những năm gần đây, câu trả lời thường sẽ là **dbt (data build tool)**. Trong hệ sinh thái dữ liệu hiện đại (Modern Data Stack), dbt không chỉ đơn thuần là một công cụ, mà nó còn tạo ra một luồng gió mới, thậm chí định hình cả một vai trò mới: *Analytics Engineer*.

dbt là tiêu chuẩn công nghiệp cho công đoạn Transformation (chữ T trong ELT). Nó cho phép Data Engineers và Data Analysts biến đổi dữ liệu trực tiếp trong Data Warehouse bằng cách viết các câu lệnh `SELECT` (SQL) thuần túy, đồng thời áp dụng các nguyên tắc phát triển phần mềm (Software Engineering) như quản lý phiên bản (Version Control), kiểm thử tự động (Testing), và tạo tài liệu (Documentation).

---

## 1. Sự Dịch Chuyển Từ ETL Sang ELT Và Sự Ra Đời Của dbt

Trong nhiều thập kỷ, **ETL** (Extract, Transform, Load) là mô hình tiêu chuẩn. Dữ liệu được trích xuất từ các nguồn, đưa vào một máy chủ trung gian để biến đổi (Transform), rồi mới tải (Load) vào Data Warehouse. Cách làm này đòi hỏi sự tham gia sâu của Software/Data Engineers, công cụ cồng kềnh, chi phí bảo trì cao và luồng công việc thường bị thắt cổ chai ở team Engineering.

Với sự bùng nổ của Cloud Data Warehouse (như Snowflake, BigQuery, Redshift), sức mạnh tính toán và lưu trữ trở nên rẻ, mạnh mẽ và co giãn vô hạn. Từ đây, mô hình **ELT** (Extract, Load, Transform) lên ngôi:
1. **Extract & Load:** Dữ liệu thô (raw data) được sao chép nguyên bản từ nguồn vào Data Warehouse thông qua các công cụ như Fivetran, Airbyte.
2. **Transform:** Quá trình biến đổi dữ liệu diễn ra *ngay trong* Data Warehouse, tận dụng chính sức mạnh tính toán khổng lồ của nó.

Và đây chính là lúc **dbt** tỏa sáng. dbt đứng ở chữ "T" trong ELT. Thay vì dùng các công cụ kéo thả phức tạp hay viết Python/Spark, người dùng chỉ cần viết SQL. dbt biên dịch (compile) mã SQL đó và đẩy xuống Data Warehouse để thực thi.

## 2. Các Khái Niệm Cốt Lõi Trong dbt

dbt không lưu trữ dữ liệu và cũng không thực hiện tính toán. Nó là một bộ điều phối và biên dịch mã (compiler). Dưới đây là những khái niệm bạn phải nắm rõ:

### 2.1. Models (Mô hình)
Trong dbt, mỗi **model** chỉ đơn giản là một file `.sql` chứa *duy nhất* một câu lệnh `SELECT`. Bạn không viết các câu lệnh DDL/DML như `CREATE TABLE` hay `INSERT INTO`. Bạn chỉ định nghĩa logic dữ liệu đầu ra. dbt sẽ tự động bọc câu lệnh `SELECT` của bạn bằng các cú pháp DDL tương ứng tùy theo **Materialization** bạn cấu hình:

- **View:** Tạo ra các view ảo. Đây là mặc định.
- **Table:** Tạo thành bảng vật lý. Chạy lại (rebuild) toàn bộ bảng mỗi lần thực thi dbt.
- **Incremental:** Chỉ append hoặc upsert các bản ghi mới/thay đổi. Rất hiệu quả về chi phí và thời gian cho những bảng dữ liệu lớn.
- **Ephemeral:** Không tạo bảng hay view trong database, dbt biên dịch nó thành CTE (Common Table Expression) lồng vào các model khác phụ thuộc vào nó.

### 2.2. References (Hàm `ref`)
Hàm `{{ ref('model_name') }}` là phép thuật mạnh nhất của dbt. Thay vì hardcode tên bảng (`select * from raw_db.my_schema.table_a`), bạn sẽ tham chiếu đến một model dbt khác bằng `ref`.
- Nó giúp dbt hiểu được sự phụ thuộc giữa các models, từ đó tự động xây dựng **DAG (Directed Acyclic Graph)** (Đồ thị có hướng không tuần hoàn).
- Chạy đúng thứ tự các bảng phụ thuộc.
- Hỗ trợ đổi môi trường linh hoạt (Dev, Staging, Prod) mà không cần sửa code.

### 2.3. Tests (Kiểm thử dữ liệu)
Giống như code phần mềm cần Unit Test, dữ liệu cũng cần được test. dbt hỗ trợ test cấu hình qua file YAML.
- **Generic Tests (Out of the box):** Cung cấp sẵn các test: `unique`, `not_null`, `accepted_values`, `relationships` (khóa ngoại). Bạn chỉ cần thêm vài dòng YAML vào model là dbt sẽ tự test khi bạn chạy `dbt test`.
- **Singular Tests:** Bạn tự viết các câu lệnh SQL trả về các bản ghi "lỗi". Nếu có kết quả trả về, dbt báo test failed.

### 2.4. Jinja & Macros
dbt kết hợp SQL với **Jinja** (một templating language của Python). Nhờ Jinja, SQL không còn là ngôn ngữ tĩnh. Bạn có thể sử dụng vòng lặp (`for`), rẽ nhánh (`if/else`), khai báo biến (`set`) ngay trong SQL.
**Macros** là các đoạn mã Jinja có thể tái sử dụng, tương tự như "function" trong ngôn ngữ lập trình. Thay vì copy-paste cấu trúc logic phức tạp ở 10 bảng, bạn viết 1 macro và gọi nó mọi nơi.

### 2.5. Sources & Snapshots
- **Sources:** Khai báo và đặt tên cho các bảng dữ liệu thô đầu vào (raw data) bằng YAML thay vì hardcode trực tiếp vào SQL. Nó cho phép kiểm tra độ trễ dữ liệu (freshness) và test ngay từ đầu nguồn.
- **Snapshots:** Ghi lại trạng thái dữ liệu thay đổi theo thời gian (Type 2 Slowly Changing Dimensions - SCD Type 2). Bạn dễ dàng lưu lại "bản chụp" lịch sử của một bản ghi khi nó bị update trên hệ thống nguồn.

### 2.6. Documentation (Tài liệu dữ liệu)
Với một câu lệnh `dbt docs generate`, dbt sẽ đọc file YAML và metadata trong database, tạo ra một trang web tĩnh đẹp mắt. Nó hiển thị thông tin bảng, mô tả cột, kết quả test và một biểu đồ DAG trực quan mô tả dòng chảy dữ liệu (Data Lineage).

## 3. Cấu Trúc Dự Án dbt Tiêu Chuẩn

Một dự án dbt (dbt project) là một thư mục chứa file cấu hình `dbt_project.yml` và các file SQL, YAML. Một cấu trúc cơ bản thường thấy:

```text
my_dbt_project/
├── dbt_project.yml       # Cấu hình dự án tổng thể
├── models/               # Chứa các file SQL logic
│   ├── staging/          # Tầng Staging: làm sạch, đổi tên chuẩn hóa dữ liệu
│   ├── intermediate/     # Tầng Intermediate: các bảng trung gian tính toán phức tạp
│   └── marts/            # Tầng Marts: dữ liệu tổng hợp sẵn sàng cho BI/Reporting
├── tests/                # Chứa singular tests (SQL custom)
├── macros/               # Chứa custom Jinja macros
├── seeds/                # File CSV tĩnh được nạp thẳng vào database như mapping tables
└── snapshots/            # Cấu hình SCD Type 2 (lưu lịch sử thay đổi)
```

## 4. Tại Sao dbt Thay Đổi Ngành Dữ Liệu?

1. **Dân chủ hóa Transformation:** Không cần biết Java, Scala hay Python, bất cứ ai biết SQL (Data Analysts, Business Analysts) đều có thể xây dựng pipeline xử lý dữ liệu phức tạp.
2. **Software Engineering Practices cho Dữ Liệu:** Áp dụng Git (version control), CI/CD, review code, testing tự động, documentation.
3. **Mã nguồn DRY (Don't Repeat Yourself):** Thông qua Jinja và Macro, dbt làm cho SQL có khả năng mở rộng cực cao.
4. **Hệ sinh thái cộng đồng (dbt packages):** Tương tự pip hay npm, bạn có thể cài các dbt package như `dbt-utils` để tận dụng các macro do cộng đồng viết sẵn.

## 5. dbt Core và dbt Cloud

- **dbt Core:** Mã nguồn mở (Open Source), hoàn toàn miễn phí. Sử dụng thông qua Command Line Interface (CLI). Thích hợp cho các team kỹ thuật có khả năng tự thiết lập hạ tầng CI/CD, Airflow / Dagster để schedule.
- **dbt Cloud:** Phiên bản dịch vụ đám mây (SaaS) được phát triển bởi dbt Labs. Cung cấp Web IDE (viết code trực tiếp trên trình duyệt), giao diện Job Scheduler, CI/CD tích hợp, và báo cáo dbt Docs được hosting sẵn. Tính phí theo user và tính năng.

## Tổng Kết

dbt đã giải quyết bài toán phức tạp bậc nhất trong quy trình kỹ thuật dữ liệu (Transformation) bằng một giải pháp thanh lịch, tận dụng sức mạnh của SQL và Cloud Data Warehouse. Khi nắm vững dbt, bạn không chỉ chuyển đổi dữ liệu, mà đang xây dựng một kiến trúc dữ liệu vững chắc, đáng tin cậy và có khả năng mở rộng.

---

## Tài Liệu Tham Khảo

* [Trang chủ dbt Labs & Documentation](https://docs.getdbt.com/)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
