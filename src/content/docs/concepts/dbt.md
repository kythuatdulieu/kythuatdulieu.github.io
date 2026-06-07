---
title: "dbt (data build tool) - Công cụ chuyển đổi dữ liệu"
category: "Transformation & Analytics Engineering"
difficulty: "Beginner"
tags: ["dbt", "transformation", "sql", "data-warehouse", "analytics-engineering"]
readingTime: "11 mins"
lastUpdated: 2026-06-07
seoTitle: "dbt (data build tool) là gì? Lõi của Analytics Engineering"
metaDescription: "Tìm hiểu dbt (data build tool) là gì, tại sao nó thay đổi hoàn toàn cách Data Engineers và Data Analysts làm việc. Kiến trúc ELT, Jinja SQL và quản lý version."
---

# dbt (data build tool) - Công cụ chuyển đổi dữ liệu

## Summary

**dbt (data build tool)** là một công cụ mã nguồn mở được phát triển bởi dbt Labs, thiết kế đặc biệt để giải quyết chữ **T (Transform - Chuyển đổi)** trong kiến trúc ELT (Extract, Load, Transform). Nó cho phép các Data Analysts và Analytics Engineers viết mã chuyển đổi dữ liệu thuần túy bằng SQL, kết hợp với sức mạnh của Jinja templating. dbt mang các kỹ thuật tốt nhất của Software Engineering (Như Version Control, Testing, CI/CD, Documentation) vào thế giới dữ liệu, biến những câu lệnh SQL dài ngoằng, rời rạc thành một hệ thống mã nguồn có cấu trúc, dễ bảo trì và mở rộng.

---

## Definition

Trong kiến trúc kho dữ liệu hiện đại (Modern Data Stack), dbt hoạt động như một "Trình biên dịch" (Compiler) và "Trình điều phối chuyển đổi" (Runner).

* **Đầu vào (Input)**: Các file text chứa mã `SELECT` SQL kết hợp với Jinja do kỹ sư viết (gọi là Models).
* **Quá trình**: dbt biên dịch đoạn code đó thành SQL chuẩn, sắp xếp thứ tự thực thi (DAG) và đẩy câu lệnh xuống Database/Data Warehouse (như Snowflake, BigQuery) để hệ thống này tự thực thi.
* **Đầu ra (Output)**: Các bảng (Tables) hoặc View vật lý được tạo ra tự động trong Data Warehouse sẵn sàng cho BI Tools tiêu thụ.

**(Lưu ý quan trọng: dbt KHÔNG HỀ chứa dữ liệu. Nó không tự tính toán. Tất cả sức mạnh xử lý đều dựa vào Data Warehouse của bạn. dbt chỉ gửi câu lệnh SQL đi).**

---

## Why it exists

Trước khi dbt ra đời, quá trình biến đổi dữ liệu vô cùng đau khổ:
1. **Stored Procedures (SP)**: Kỹ sư phải viết hàng ngàn dòng Stored Procedures trong Oracle/SQL Server. Mã SQL cực kỳ khó đọc, không ai dám sửa vì sợ hỏng, không có công cụ quản lý phiên bản (Git).
2. **Sự phụ thuộc vào Data Engineer**: Analysts (người hiểu logic kinh doanh) biết viết SQL nhưng không biết dùng Airflow/Python để đẩy code lên server chạy. Họ phải viết tài liệu Word nhờ Data Engineer (DE) code lại bằng Spark/Python. Quá trình này mất hàng tuần, dễ tam sao thất bản.
3. **Mã DDL rác**: Để tạo một bảng báo cáo, phải viết đủ các lệnh `CREATE TABLE IF NOT EXISTS`, `DROP TABLE`, `INSERT INTO`. Logic nghiệp vụ (`SELECT`) bị chôn vùi trong mớ mã hạ tầng này.

**dbt ra đời để trao quyền cho Analysts**: Nếu bạn biết viết `SELECT` SQL, bạn có thể tự xây dựng toàn bộ pipeline biến đổi dữ liệu chuẩn kỹ sư phần mềm.

---

## Core idea

Ý tưởng cốt lõi của dbt dựa trên 4 nguyên lý Software Engineering:
1. **Declarative (Khai báo)**: Bạn CHỈ CẦN viết câu lệnh `SELECT` cốt lõi định nghĩa dữ liệu trông như thế nào. dbt sẽ tự động lo phần hạ tầng `CREATE TABLE` hoặc `CREATE VIEW` bọc bên ngoài.
2. **Modular (Mô-đun hóa)**: Thay vì 1 file SQL dài 1000 dòng. Bạn cắt nhỏ thành 10 file (models), mỗi file làm 1 việc (Clean, Join, Aggregate). File này có thể gọi (tham chiếu) file kia thông qua hàm `{{ ref('tên_model') }}`.
3. **Testing (Kiểm thử)**: Hỗ trợ tự động kiểm tra dữ liệu rác (Ví dụ: cột `user_id` không được Null, không được trùng lặp) chỉ bằng vài dòng cấu hình YAML.
4. **Documentation (Tài liệu hóa)**: Tự động sinh ra một trang Web chứa Sơ đồ luồng dữ liệu (DAG) và từ điển dữ liệu (Data Dictionary) cho cả công ty đọc.

---

## How it works

Quy trình làm việc cơ bản với dbt (dbt Core qua CLI):
1. Cấu hình file `profiles.yml` để dbt kết nối với Snowflake/BigQuery.
2. Khai báo các bảng dữ liệu gốc (Sources) đã được load sẵn trong DB vào file `sources.yml`.
3. Tạo file `stg_users.sql` (Model) viết lệnh làm sạch dữ liệu.
4. Tạo file `marts_revenue.sql` (Model) tham chiếu tới bảng stage qua lệnh `SELECT * FROM {{ ref('stg_users') }}`.
5. Cấu hình schema test (Unique, Not Null) trong `schema.yml`.
6. Chạy lệnh `dbt run` $\rightarrow$ dbt sẽ tạo VIEW/TABLE trực tiếp trên Data Warehouse.
7. Chạy lệnh `dbt test` $\rightarrow$ dbt sinh ra các câu query đếm lỗi, nếu $>0$ sẽ báo đỏ còi.

---

## Architecture / Flow

```mermaid
graph LR
    subgraph 1. EL Tools (Fivetran / Airbyte)
        API[Stripe API] -->|Extract/Load| Raw[(Raw DB Schema)]
    end

    subgraph 2. Data Warehouse (Snowflake)
        Raw
        Stg[(Staging Schema)]
        Mart[(Marts Schema)]
        Raw -. "Đọc thô" .-> Stg
        Stg -. "JOIN / Agg" .-> Mart
    end

    subgraph 3. dbt (Chỉ chứa Code - Gửi Lệnh)
        C[dbt Models SQL + Jinja]
        T[dbt Tests]
        C == "Gửi lệnh CREATE TABLE/VIEW" ==> Raw
        C == "Tạo tự động" ==> Stg
        C == "Tạo tự động" ==> Mart
    end

    subgraph 4. BI (PowerBI)
        Mart --> Dash[Dashboards]
    end
    
    style 3 fill:#ffe0b2,stroke:#ff9800
```

---

## Best practices

* **Kiến trúc nhiều tầng (Multi-layer)**: Tuân thủ cấu trúc chuẩn của cộng đồng dbt:
  * `sources`: Nơi khai báo các bảng raw.
  * `staging`: Tầng làm sạch 1-1 với source (đổi tên cột, cast kiểu dữ liệu). KHÔNG JOIN ở đây.
  * `intermediate`: Các phép tính toán phức tạp, chuẩn bị trước khi lên Marts.
  * `marts` (Business): Nơi tập hợp các dimension/fact table trả lời thẳng vào câu hỏi kinh doanh, phơi ra cho BI tool.
* **Tận dụng Macros / Jinja**: Không lặp lại chính mình (DRY). Nếu bạn có 50 cột tiền tệ cần quy đổi tỷ giá, hãy viết 1 macro (hàm Python-like bằng Jinja) và gọi nó trong `SELECT`, thay vì copy/paste 50 lần câu `CASE WHEN`.
* **Môi trường Dev và Prod**: dbt cho phép cấu hình profile. Khi Data Analyst code trên máy cá nhân, lệnh `dbt run` sẽ tạo bảng nháp trong schema `dev_linh`. Chỉ khi code được merge lên nhánh chính trên Git, hệ thống CI/CD chạy lệnh `dbt run` mới tạo bảng thật trong schema `production`.

---

## Common mistakes

* **Quên hàm `{{ ref() }}` mà gọi thẳng tên bảng**: Nếu bạn viết `SELECT * FROM schema.stg_users` thay vì `{{ ref('stg_users') }}`, dbt sẽ không nhận diện được sự phụ thuộc giữa 2 bảng. Nó không vẽ được DAG, không biết bảng nào chạy trước bảng nào. Nếu đổi môi trường sang Dev, code sẽ gãy vì hardcode tên schema.
* **Chạy `dbt run` toàn bộ dự án mỗi lần thay đổi**: Khi dự án lớn lên hàng trăm models, gõ `dbt run` sẽ mất 30 phút. Hãy dùng bộ chọn (Selectors), ví dụ `dbt run --select marts_revenue+` để chỉ chạy model đó và các model phía sau nó.
* **Sử dụng dbt làm ETL**: Gắng ép dbt gọi API hoặc đọc file Excel. dbt sinh ra KHÔNG PHẢI ĐỂ LÀM Extract (E). Phải dùng Fivetran/Airbyte kéo data vào kho trước, dbt mới bắt đầu tham chiến.

---

## Trade-offs

### Ưu điểm
* Giải phóng cổ chai (Bottleneck) của team Data Engineer. Bất kỳ ai biết SQL đều có thể đóng góp vào Data Pipeline.
* Khả năng quản lý code version (Git), Review Code, Testing giúp nâng cao chất lượng dữ liệu gấp nhiều lần.
* Sinh tài liệu hệ thống (Documentation) tự động cực kỳ đẹp mắt và luôn đồng bộ với code.

### Nhược điểm
* **Trói buộc vào Cloud Data Warehouse**: dbt hoạt động tốt nhất khi đi kèm hệ sinh thái Modern Data Stack (Snowflake, BigQuery, Redshift). Mặc dù có adapter cho Postgres, nhưng tính năng tối ưu (như Incremental load siêu tốc) chỉ phát huy trên các cỗ máy Cloud OLAP.
* **Over-engineering (Kỹ sư hóa quá mức)**: Cho một dự án quá nhỏ (dưới 10 bảng), việc setup Git, YAML, dbt Core là dùng dao mổ trâu giết gà so với viết 2 cái Stored Procedures.

---

## When to use

* Ngay khi đội ngũ Dữ liệu của bạn có các vai trò Data Analyst, Analytics Engineer chuyên sâu về SQL muốn kiểm soát logic số liệu kinh doanh.
* Dự án xây dựng Enterprise Data Warehouse áp dụng mô hình ELT trên nền tảng BigQuery/Snowflake.

## When not to use

* Kiến trúc Streaming (Real-time). dbt mặc định là công cụ xử lý Batch (chạy định kỳ theo giờ/ngày). (Dù gần đây dbt có ra mắt hỗ trợ streaming nhưng vẫn chưa phải thế mạnh cốt lõi).
* Khi dữ liệu của bạn là Unstructured Data (Hình ảnh, Âm thanh, JSON lồng ghép quá sâu) cần Spark/Python để đập vụn ra trước khi đưa vào bảng.

---

## Related concepts

* [dbt Models](/concepts/dbt-models)
* [SQL Transformation](/concepts/sql-transformation)
* [Data Warehouse](/concepts/data-warehouse)
* [Orchestration](/concepts/orchestration)

---

## Interview questions

### 1. Tại sao dbt lại khuyến khích việc chỉ viết lệnh `SELECT` thay vì `CREATE TABLE AS SELECT`?
* **Người phỏng vấn muốn kiểm tra**: Hiểu về nguyên lý Declarative Programming.
* **Gợi ý trả lời (Strong Answer)**: Đây là sự chuyển dịch từ phong cách Imperative (Mệnh lệnh) sang Declarative (Khai báo). Bằng cách chỉ viết câu lệnh `SELECT` logic cốt lõi, người kỹ sư không cần bận tâm về việc DDL (Data Definition Language) nhàm chán như tạo bảng, xóa bảng, tạo view. dbt sẽ tự bọc (wrap) câu lệnh `SELECT` đó vào các mẫu (Materialization templates) cấu hình sẵn như `view`, `table`, hoặc `incremental`. Nếu bạn muốn đổi từ View sang Table, chỉ cần sửa 1 chữ trong cấu hình mà không phải đập đi viết lại nguyên cái script DDL SQL.

### 2. Sự khác biệt giữa hàm `{{ source() }}` và `{{ ref() }}` trong mã dbt là gì?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết cấu trúc DAG và quản lý Dependencies.
* **Gợi ý trả lời (Strong Answer)**: 
  * Hàm `source()` dùng để trỏ đến các dữ liệu thô (Raw data) được các công cụ ELT đẩy vào Database. Đây là điểm xuất phát (Root) của đồ thị. 
  * Hàm `ref()` dùng để trỏ đến các Models (file SQL) do chính dbt biên dịch ra trong nội bộ dự án. Khi dùng `ref()`, dbt sẽ đọc được mối quan hệ phụ thuộc giữa các file, từ đó xây dựng được DAG để đảm bảo chạy theo đúng thứ tự A rồi mới đến B. Nếu không có `ref`, dbt sẽ không biết chạy song song luồng nào.

### 3. Materialization (Vật chất hóa) trong dbt là gì? Khi nào dùng `view` và khi nào dùng `table`?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng tối ưu hóa Data Warehouse.
* **Gợi ý trả lời (Strong Answer)**: Materialization là cách dbt "hiện thực hóa" câu lệnh `SELECT` của bạn trên Database. 
  * Dùng `view`: Chỉ lưu câu query (ảo), dữ liệu không tốn đĩa cứng, nhưng mỗi lần query là tốn tiền tính toán. Dùng cho tầng `staging` (làm sạch nhanh) hoặc các bảng trung gian nhỏ.
  * Dùng `table`: Tính toán sẵn và ghi toàn bộ dữ liệu ra đĩa cứng thành bảng thật. Chiếm ổ đĩa nhưng các báo cáo truy vấn vào đọc rất nhanh. Dùng cho tầng `marts` nơi BI tools lấy dữ liệu, hoặc các bảng nặng chạy mất quá lâu. (Ngoài ra còn có `incremental` cho các bảng lịch sử khổng lồ).

### 4. Jinja đóng vai trò gì trong dbt?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng lập trình nâng cao trong Data.
* **Gợi ý trả lời (Strong Answer)**: Jinja biến SQL (một ngôn ngữ tĩnh) thành một ngôn ngữ có khả năng lập trình động. Với Jinja, ta có thể viết vòng lặp `FOR` để tự động sinh ra hàng loạt câu lệnh `SUM(CASE WHEN...)` (kỹ thuật Pivot xoay cột). Ta có thể dùng lệnh `IF/ELSE` để thay đổi logic tùy môi trường (Nếu chạy ở môi trường DEV, thêm `LIMIT 100` vào đuôi SQL để query nhanh đỡ tốn tiền. Chạy ở PROD thì bỏ). Jinja giúp SQL tuân thủ nguyên lý DRY (Don't Repeat Yourself) thông qua việc tạo các Macros dùng chung.

### 5. Làm sao dbt xử lý việc kiểm thử chất lượng dữ liệu (Testing)?
* **Người phỏng vấn muốn kiểm tra**: Tư duy Data Quality assurance.
* **Gợi ý trả lời (Strong Answer)**: dbt biến testing thành cấu hình. Trong file YAML, ta có thể cấu hình các Generic Tests có sẵn như: `unique`, `not_null`, `accepted_values`, `relationships` (khóa ngoại). Khi gõ lệnh `dbt test`, dbt sẽ biên dịch các cấu hình này thành các câu lệnh SQL kiểm tra. Nguyên lý là: Câu lệnh kiểm tra sẽ tìm ra các dòng lỗi. Nếu trả về số lượng đếm (COUNT) bằng 0, test Passed. Nếu trả về $>0$, báo đỏ test Failed. Ta cũng có thể tự viết các Custom Tests (Singular tests) bằng SQL thuần cho các logic nghiệp vụ đặc thù (VD: Ngày nhận hàng không được nhỏ hơn ngày đặt hàng).

---

## References

1. **dbt Labs Documentation** - What is dbt?
2. **Fundamentals of Analytics Engineering** (Sách gốc của dbt Labs).

---

## English summary

**dbt (data build tool)** is an open-source framework dedicated entirely to the "Transform" layer of the modern ELT stack. It revolutionizes data modeling by allowing Data Analysts and Analytics Engineers to write transformations exclusively in modular SQL `SELECT` statements, enhanced dynamically by Jinja templating. dbt acts as a compiler and runner: it parses dependencies via the `{{ ref() }}` function, infers a Directed Acyclic Graph (DAG), and executes the DDL/DML wrappers directly within cloud data warehouses like Snowflake or BigQuery. By applying software engineering best practices—such as version control, automated schema testing, multi-environment deployments, and auto-generated documentation—dbt ensures robust, scalable, and maintainable analytics pipelines.
