---
title: "dbt Models - Tầng biến đổi và cấu trúc dự án"
category: "Transformation & Analytics Engineering"
difficulty: "Intermediate"
tags: ["dbt", "models", "data-modeling", "analytics-engineering", "sql"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Cấu trúc dbt Models: Staging, Intermediate và Marts"
metaDescription: "Khám phá cách tổ chức các dbt Models theo chuẩn Analytics Engineering. Phân biệt Source, Staging, Intermediate và Marts layer để xây dựng Data Warehouse."
---

# dbt Models - Tầng biến đổi và cấu trúc dự án

## Summary

Trong hệ sinh thái dbt (data build tool), một **Model** đơn giản là một file chứa một câu lệnh `SELECT` duy nhất (bao gồm SQL kết hợp với mã Jinja). Nó đại diện cho một khối biến đổi logic. Khi dự án lớn lên, việc có hàng ngàn câu `SELECT` lộn xộn sẽ gây ra ác mộng bảo trì. Cộng đồng Analytics Engineering đã phát triển ra một **Quy chuẩn kiến trúc cấu trúc thư mục và phân tầng (Layering Architecture)** nghiêm ngặt. Việc tuân thủ các tầng biến đổi cốt lõi bao gồm: *Sources, Staging, Intermediate, và Marts*, là kim chỉ nam để xây dựng một kho dữ liệu (Data Warehouse) có khả năng mở rộng, dễ đọc (readable) và có tính tái sử dụng cao (DRY).

---

## Definition

* **Model**: File `.sql` chứa logic SELECT nằm trong thư mục `models/` của project dbt. Mỗi Model sẽ được biên dịch thành một Table hoặc một View trong Data Warehouse.
* **Cấu trúc phân tầng (Layering)**: Là mô hình chia các Models thành các lớp riêng biệt theo thứ tự dòng chảy dữ liệu (từ thô đến thành phẩm). Một model ở tầng cao chỉ được phép đọc dữ liệu từ tầng thấp hơn hoặc cùng cấp, cấm gọi ngược (Circular dependency) hoặc gọi tắt (Bypass).

---

## Why it exists

Thử thách lớn nhất của việc thiết kế Data Warehouse không phải là làm sao viết SQL cho chạy được, mà là **Sự hỗn loạn (Spaghetti Dependency)**.
Nếu một bạn Analyst viết bảng Báo cáo Doanh thu, họ gọi trực tiếp thẳng xuống bảng thô `raw_sales`. Hôm sau hệ thống nguồn đổi tên cột `sale_amount` thành `revenue_amount`, báo cáo sập. 
Đồng thời, bạn Analyst thứ hai làm Báo cáo Thuế cũng trỏ thẳng xuống `raw_sales` và tự viết lại logic đổi tiền tệ hệt như bạn thứ nhất. 

Nếu không có tiêu chuẩn phân tầng (Models Layering):
1. Không có lớp khiên che chắn (Staging), một sự thay đổi nguồn kéo theo hàng loạt hệ thống gãy đổ.
2. Mã nguồn lặp lại khắp nơi (Non-DRY).
3. Đồ thị luồng dữ liệu (DAG) chồng chéo lên nhau tạo ra nút thắt cổ chai không thể debug.

Cấu trúc dbt Models chuẩn ra đời để áp đặt khuôn khổ, giống như kiến trúc MVC (Model-View-Controller) bên mảng lập trình Web.

---

## Core Layers (Kiến trúc chuẩn)

Cấu trúc thư mục của một project dbt tiêu chuẩn sẽ chia làm 3 tầng chính:

### 1. Tầng Staging (Tầng làm sạch chuẩn bị)
* Thư mục: `models/staging/<source_name>/`
* File example: `stg_stripe__payments.sql`
* **Nhiệm vụ**: Đọc dữ liệu từ hàm `{{ source() }}`. Tại đây, ta đổi tên cột về chuẩn (`Snake_case`), ép lại các kiểu dữ liệu (`CAST`), chuyển đổi múi giờ, che mờ dữ liệu nhạy cảm PII. 
* **Quy tắc VÀNG**: Không bao giờ thực hiện `JOIN` hoặc `GROUP BY` ở tầng này. Quan hệ luôn là 1 file thô $\rightarrow$ 1 file staging. Đây là tấm khiên bảo vệ (Abstraction layer) cho toàn bộ hệ thống phía sau khỏi sự thay đổi của nguồn thô.

### 2. Tầng Intermediate (Tầng trung gian)
* Thư mục: `models/intermediate/<business_domain>/`
* File example: `int_payments_pivoted_to_orders.sql`
* **Nhiệm vụ**: Chứa những logic tính toán rất phức tạp (Ví dụ: tính Window functions cho funnel, gom nhóm dòng thời gian người dùng). 
* **Quy tắc**: Nơi này đọc dữ liệu từ `staging` hoặc `intermediate` khác. Tầng này có thể chứa các phép JOIN phức tạp. Nó sinh ra để các bảng cuối (Marts) không phải gánh những đoạn SQL dài 500 dòng. Các model ở tầng này thường lưu ở dạng View tạm hoặc bị Ẩn (Ephemeral).

### 3. Tầng Marts (Tầng doanh nghiệp / Thành phẩm)
* Thư mục: `models/marts/<department>/`
* File example: `fct_orders.sql` hoặc `dim_customers.sql`
* **Nhiệm vụ**: Định hình cấu trúc Dimensional Modeling (Star Schema). Đây là nơi tạo ra các bảng Dimension (thực thể) và Fact (giao dịch) hoàn hảo nhất để các công cụ BI (Tableau, PowerBI) tiêu thụ. 
* **Quy tắc**: Marts phải dễ hiểu cho người làm kinh doanh. Phải được Aggregate và tính toán Metrics đầy đủ (Ví dụ cột: `lifetime_value`). Marts không bao giờ được phép trỏ ngược về bảng `{{ source() }}` thô mà phải trỏ qua `staging`.

---

## How it works

Dưới đây là cây thư mục (Directory Tree) chuẩn của một project dbt:

```text
├── models/
│   ├── staging/
│   │   └── stripe/
│   │       ├── _stripe__sources.yml     # Khai báo Raw data
│   │       ├── stg_stripe__payments.sql # Model làm sạch
│   │       └── _stripe__models.yml      # Khai báo tests/docs cho staging
│   │
│   ├── intermediate/
│   │   └── finance/
│   │       ├── int_payments_pivoted.sql # Xử lý logic Pivot
│   │       └── _finance__models.yml     
│   │
│   └── marts/
│       └── core/
│           ├── dim_customers.sql        # Thành phẩm cho BI
│           ├── fct_orders.sql           # Thành phẩm cho BI
│           └── _core__models.yml        # Tests chặt chẽ nhất
```

---

## Architecture / Flow

Mô phỏng mối quan hệ phụ thuộc tuyến tính (DAG) được dbt tự động vẽ ra khi tuân thủ cấu trúc trên:

```mermaid
graph LR
    subgraph 1. RAW SOURCES (Thô)
        A[(stripe.raw_payments)]
        B[(shopify.raw_orders)]
    end

    subgraph 2. STAGING LAYER (Màng lọc 1-1)
        C[stg_stripe__payments]
        D[stg_shopify__orders]
    end

    subgraph 3. INTERMEDIATE LAYER (Xào nấu)
        E[int_payments_pivoted]
    end

    subgraph 4. MARTS LAYER (Hiển thị)
        F[fct_orders]
    end

    A -. source() .-> C
    B -. source() .-> D
    
    C -. ref() .-> E
    
    E -. ref() .-> F
    D -. ref() .-> F

    style 2 fill:#e1f5fe,stroke:#01579b
    style 3 fill:#fff3e0,stroke:#e65100
    style 4 fill:#e8f5e9,stroke:#2e7d32
```

---

## Best practices

* **Tiếp cận mô hình Phễu (The DAG Funnel)**: Tầng Staging có thể có 100 bảng. Intermediate gom lại còn 30 bảng. Tầng Marts đưa ra cho người dùng BI xem chỉ nên có 5-10 bảng lớn (Mô hình Star Schema). Đừng bắt người dùng BI tự đi JOIN 100 cái bảng staging.
* **Quy ước đặt tiền tố (Prefix Naming)**: Mọi file phải bắt đầu bằng loại Model của nó. 
  * `stg_`: Bảng staging.
  * `int_`: Bảng trung gian.
  * `dim_`: Bảng Dimension mô tả thực thể tĩnh (Khách hàng, Sản phẩm).
  * `fct_`: Bảng Fact lưu sự kiện/giao dịch (Đơn hàng, Click web).
* **Nơi đặt các file YAML**: Luôn duy trì một file `_.yml` trong cùng thư mục với các file `.sql` liên quan. File này chứa tài liệu miêu tả các cột và cấu hình dbt Tests (như `unique`, `not_null`) để đảm bảo chất lượng ngay từ tầng màng lọc.

---

## Common mistakes

* **JOIN ở Staging**: Tội lỗi kinh điển. Kéo 2 bảng `raw_users` và `raw_orders` lại JOIN ngay trong file `stg_users`. Việc này làm gãy đổ khả năng tái sử dụng vì khi có người muốn dùng `users` mà không cần thông tin đơn hàng, họ bị dính khối dữ liệu thừa thãi. Staging bắt buộc phải giữ tỷ lệ 1-1 với Source.
* **Marts gọi trực tiếp Source**: Bảng báo cáo cuối cùng `fct_sales` viết `SELECT * FROM {{ source('raw', 'sales') }}` thay vì `{{ ref('stg_sales') }}`. Điều này khiến logic đổi tên cột chuẩn, chỉnh giờ UTC ở tầng staging bị vứt bỏ, sinh ra nợ kỹ thuật (Technical Debt) nghiêm trọng.
* **Xây tháp Babel (Too deep)**: Bảng A $\rightarrow$ B $\rightarrow$ C $\rightarrow$ D $\rightarrow$ E $\rightarrow$ F. Cấu trúc quá sâu làm thời gian debug kéo dài hàng giờ để mò mẫm lỗi logic xảy ra ở nấc nào. Hạn chế chiều sâu, dùng Intermediate hợp lý.

---

## Trade-offs

### Ưu điểm
* Tạo ra kho mã nguồn sạch sẽ, ai đọc cũng hiểu (Onboarding nhân viên mới rất nhanh).
* Cô lập rủi ro. Nếu API của Stripe cập nhật phiên bản mới đổi tên cột, kỹ sư chỉ việc vào 1 file duy nhất là `stg_stripe__payments` sửa tên lại cho khớp cái cũ, 100 bảng downstream phía sau vẫn hoạt động an toàn mà không bị lỗi biên dịch.

### Nhược điểm
* **Tràn ngập view rác**: Cấu trúc này tạo ra rất nhiều View trung gian, làm nghẽn giao diện thư mục của Database. (Giải pháp: Lưu staging/intermediate vào một schema ẩn ảo, chỉ phơi bày schema Marts ra ngoài. Hoặc dùng Materialized type là `ephemeral` - dbt sẽ biên dịch thành CTE ảo chèn vào truy vấn cuối thay vì tạo View vật lý).
* Phải bỏ công sức tái cơ cấu (Refactoring) tư duy rất nhiều với những người quen viết 1 câu SQL khổng lồ chứa 10 CTEs nội bộ.

---

## When to use

* Là tiêu chuẩn vàng (Golden Standard) PHẢI ÁP DỤNG với bất kỳ dự án dbt nào đang xây dựng nền tảng Dữ liệu trung tâm (Enterprise Data Warehouse).
* Khi team phân tích có từ 2 người trở lên làm việc chung trên một codebase.

## When not to use

* Với các luồng nghiên cứu tự do (Ad-hoc exploratory analysis). Analysts chỉ cần tạo file `.sql` để lấy số báo cáo nhanh 1 lần rồi bỏ, không cần tuân thủ cấu trúc phức tạp này.

---

## Related concepts

* [dbt (data build tool)](/concepts/dbt)
* [SQL Transformation](/concepts/sql-transformation)
* [Dimensional Modeling](/concepts/dimensional-modeling)

---

## Interview questions

### 1. Tại sao quy tắc nghiêm ngặt nhất của tầng Staging trong dbt là "Không được thực hiện phép JOIN"?
* **Người phỏng vấn muốn kiểm tra**: Sự thấu hiểu nguyên lý Modular and Dry trong Analytics Engineering.
* **Gợi ý trả lời (Strong Answer)**: Tầng Staging đóng vai trò là Lớp trừu tượng (Abstraction Layer) tỷ lệ 1-1 với dữ liệu thô. Nếu ta JOIN bảng Khách Hàng với bảng Đơn Hàng ngay tại Staging, bảng Staging đó sẽ bị khóa cứng (Coupled) với một luồng nghiệp vụ cụ thể. Khi phòng Marketing chỉ cần danh sách Khách Hàng, họ dùng bảng Staging này sẽ bị dính luôn mớ dữ liệu Đơn hàng dư thừa và có nguy cơ bị nhân bản dòng (Fan-out). Bằng việc giữ Staging độc lập 1-1, nó sẽ trở thành "Viên gạch lego" nguyên thủy chuẩn sạch nhất (đã đổi tên cột, ép kiểu chuẩn) để bất cứ tầng downstream nào (Intermediate/Marts) cũng có thể an tâm lấy ra lắp ráp.

### 2. Sự khác biệt giữa Materialization loại `view`, `table` và `ephemeral` trong dbt là gì? Thường áp dụng ở tầng (layer) nào?
* **Người phỏng vấn muốn kiểm tra**: Khả năng tối ưu hiệu năng hạ tầng Data Warehouse.
* **Gợi ý trả lời (Strong Answer)**: 
  * `view`: Tạo khung nhìn ảo không chứa dữ liệu vật lý. Thường dùng cho tầng `staging` để tiết kiệm ổ cứng lưu trữ vì chúng ta hiếm khi truy vấn trực tiếp vào staging.
  * `table`: Tính toán và ghi toàn bộ kết quả xuống ổ đĩa vật lý. Thường dùng cho tầng `marts` hoặc các bảng tính toán cực nặng, giúp BI tool đọc và render Dashboard nhanh nhất có thể.
  * `ephemeral`: Không tạo ra bất cứ object nào trên Database. dbt sẽ biến model đó thành một khối mã nguồn (CTE - `WITH as ()`) và tự động chèn nó vào bên trong đoạn code của model downstream gọi nó. Dùng cho tầng `intermediate` khi logic chỉ tính toán làm bàn đạp 1 lần, giúp Database không bị rác (lộn xộn bởi quá nhiều view trung gian).

### 3. Nếu hệ thống nguồn thô thay đổi tên cột từ `usr_name` thành `full_name`, bạn sẽ xử lý như thế nào theo chuẩn dbt?
* **Người phỏng vấn muốn kiểm tra**: Quy trình đối phó rủi ro đứt gãy luồng dữ liệu (Data Contract Breakage).
* **Gợi ý trả lời (Strong Answer)**: Nhờ có kiến trúc Layering, ta chỉ cần vào đúng một file duy nhất ở tầng màng lọc: `stg_users.sql`. Ta sửa đoạn lệnh thành `SELECT full_name AS user_name FROM {{ source(...) }}`. Do ta vẫn bảo toàn tên cột đầu ra tiêu chuẩn nội bộ là `user_name`, tất cả các bảng ở tầng Intermediate và Marts ở hạ nguồn hoàn toàn không nhận ra sự thay đổi này và luồng DAG vẫn sẽ biên dịch thành công mà không phải sửa thêm bất kỳ dòng code nào khác.

### 4. Ephemeral models giúp giải quyết nhược điểm gì của kiến trúc dbt nhiều tầng?
* **Người phỏng vấn muốn kiểm tra**: Tính thực tế trong vận hành.
* **Gợi ý trả lời (Strong Answer)**: Nếu tuân thủ nghiêm ngặt mô hình Staging $\rightarrow$ Intermediate $\rightarrow$ Marts, một Database sẽ bị tràn ngập (Cluttering) hàng trăm View hoặc Table rác (của hai tầng đầu). Việc dùng Ephemeral materialization trên các model trung gian biến chúng "tàng hình" trên Database (chỉ tồn tại dưới dạng mã CTE khi dbt compile). Điều này giúp thu gọn Database sạch sẽ, người dùng cuối nhìn vào Data Warehouse chỉ thấy những cái cần thấy (Tầng Marts).

### 5. Dấu chấm than, hay hậu tố `+` trong lệnh `dbt run --select stg_users+` có nghĩa là gì?
* **Người phỏng vấn muốn kiểm tra**: Sử dụng Graph syntax (Node selection) của công cụ.
* **Gợi ý trả lời (Strong Answer)**: Đây là một cú pháp bộ chọn đồ thị (Graph Selection). Dấu `+` nằm sau tên model biểu thị: "Hãy chạy model `stg_users`, VÀ TẤT CẢ các model nằm ở phía Downstream phụ thuộc vào nó (con, cháu chắt...)". Điều này cực kỳ tiện lợi khi ta vừa sửa logic trong file Staging và chỉ muốn Build lại nhánh bị ảnh hưởng để cập nhật dữ liệu, thay vì tốn tiền gõ `dbt run` chạy toàn bộ cả những nhánh project không liên quan. (Nếu `+` nằm phía trước, nó sẽ chạy các Upstream cha mẹ).

---

## References

1. **dbt Labs Developer Hub** - How we structure our dbt projects.
2. **Analytics Engineering Glossary** - Staging vs Intermediate vs Mart.

---

## English summary

In the dbt ecosystem, organizing SQL transformation code into a structured, tiered **Layering Architecture** is vital for maintainability and preventing "spaghetti dependency" graphs. The standard pattern divides models into three core layers: **Staging** (1-to-1 with raw sources, focused strictly on cleaning, renaming, and type-casting without JOINs), **Intermediate** (for complex, modular business logic manipulations), and **Marts** (business-ready facts and dimensions optimized for BI tools). Strictly enforcing the rule that data must flow downstream (e.g., Marts can only reference Staging or Intermediate models, never raw sources directly) creates a robust abstraction layer. This allows teams to adapt to upstream schema changes by updating just a single staging file, keeping the rest of the enterprise data warehouse untouched and error-free.
