---
title: "Bảng sự kiện - Fact Table"
category: "Data Warehouse"
difficulty: "Beginner"
tags: ["data-warehouse", "fact-table", "dimensional-modeling", "star-schema", "metrics"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Fact Table (Bảng sự kiện) là gì? Phân loại Fact trong Data Warehouse"
metaDescription: "Tìm hiểu chi tiết về Bảng sự kiện (Fact Table) trong Data Warehouse: Định nghĩa, vai trò, các loại Fact (Additive, Semi-Additive, Non-Additive) và Grain."
---

# Bảng sự kiện - Fact Table

## Summary

Bảng sự kiện (Fact Table) là trung tâm của mọi mô hình dữ liệu đa chiều (Dimensional Model) như Lược đồ hình sao (Star Schema). Nó đóng vai trò lưu trữ các chỉ số đo lường (metrics, facts) sinh ra từ một quy trình kinh doanh thực tế, kèm theo các khóa ngoại (Foreign Keys) để liên kết với các bảng chiều (Dimension Tables). Fact Table thường là bảng chiếm dung lượng khổng lồ nhất trong Data Warehouse (chứa hàng triệu đến hàng tỷ dòng) nhưng lại có cấu trúc rất hẹp (ít cột). 

---

## Definition

Trong Data Warehousing, **Fact Table** chứa sự thật có thể định lượng được (quantifiable truths) về một sự kiện kinh doanh. 

Một Fact Table tiêu chuẩn cấu tạo bởi hai thành phần chính:
1. **Các khóa ngoại (Foreign Keys)**: Liên kết với Surrogate Keys của bảng Dimension. Tập hợp các Foreign Keys này thường đóng vai trò là Khóa chính tổng hợp (Composite Primary Key) cho chính Fact Table đó.
2. **Các chỉ số đo lường (Measures / Facts)**: Thường là dữ liệu dạng số (Numeric) thể hiện giá trị của sự kiện (Ví dụ: `quantity`, `revenue`, `discount`). 

---

## Why it exists

Mọi hoạt động phân tích dữ liệu (Business Intelligence) cuối cùng đều hướng tới việc trả lời câu hỏi: "Chúng ta đang làm tốt đến mức nào?". Để trả lời câu hỏi đó, ta cần đo lường. 

Fact Table tồn tại để gom toàn bộ các kết quả đo lường phân tán từ các hệ thống OLTP về một nơi duy nhất. Việc tách bạch rõ ràng giữa "Cái cần đo" (Fact Table) và "Ngữ cảnh của phép đo" (Dimension Table) giúp cho database engine có thể thực hiện các phép tính toán tổng hợp (Aggregation: `SUM()`, `AVG()`, `COUNT()`) nhanh hơn gấp ngàn lần so với cấu trúc ER truyền thống.

---

## Core idea

Ý tưởng cốt lõi khi thiết kế Fact Table là khái niệm **Độ mịn (Grain)** và **Tính cộng gộp (Additivity)**:

### 1. Phân loại theo Tính cộng gộp (Additivity)
* **Additive Facts**: Có thể cộng gộp (SUM) dọc theo tất cả các chiều (Dimensions). Ví dụ: `Sales Amount`. Ta có thể cộng dồn doanh thu theo Ngày, theo Tháng, theo Cửa hàng.
* **Semi-Additive Facts**: Chỉ có thể cộng gộp theo một số chiều nhất định (thường không thể cộng theo thời gian). Ví dụ: `Số dư tài khoản ngân hàng`. Ta có thể cộng dồn số dư của tất cả khách hàng trong ngày hôm nay, nhưng KHÔNG THỂ lấy số dư ngày thứ 2 cộng với số dư ngày thứ 3 để ra số dư của tuần.
* **Non-Additive Facts**: Hoàn toàn không thể cộng gộp bằng hàm SUM. Ví dụ: `Nhiệt độ phòng`, `Tỉ lệ chuyển đổi (%)`, `Đơn giá (Unit Price)`. Ta phải dùng hàm AVG (Trung bình) hoặc MIN/MAX.

### 2. Phân loại theo Quy trình sự kiện
* **Transaction Fact Table**: Mỗi dòng lưu trữ một giao dịch riêng biệt tại một thời điểm (Ví dụ: 1 tiếng "bíp" máy quét mã vạch ở siêu thị). Đây là loại Fact phổ biến nhất, chi tiết nhất và dung lượng lớn nhất.
* **Periodic Snapshot Fact Table**: Lưu trữ trạng thái tổng hợp của một sự kiện theo một chu kỳ thời gian đều đặn (Mỗi ngày, Mỗi cuối tháng). Ví dụ: Sao kê số dư tài khoản ngày cuối tháng.
* **Accumulating Snapshot Fact Table**: Thể hiện toàn bộ vòng đời của một quy trình có điểm đầu và điểm cuối rõ ràng. Fact table này liên tục được UPDATE khi sự kiện bước sang giai đoạn mới. Ví dụ: Quy trình xử lý đơn hàng (Ngày đặt $\rightarrow$ Ngày đóng gói $\rightarrow$ Ngày giao $\rightarrow$ Ngày thanh toán).

---

## How it works

Dưới góc nhìn của cơ sở dữ liệu: Fact Table là một bảng cực "dài" nhưng rất "hẹp". 
Nó "hẹp" vì nó chỉ chứa các cột kiểu dữ liệu Integer (cho Foreign Key) và Decimal/Float (cho Metrics). Không chứa chuỗi văn bản dài (VARCHAR).
Nó "dài" vì mỗi sự kiện kinh doanh tạo ra một dòng mới (INSERT-only) theo thời gian.

Khi có câu lệnh truy vấn báo cáo, Engine sẽ dùng Foreign Key để JOIN với Dimension, áp dụng bộ lọc (WHERE) trên Dimension, sau đó quay lại tính toán hàm tổng hợp (SUM, AVG) trên cột Metrics của Fact Table.

---

## Architecture / Flow

Mô phỏng cấu trúc cơ bản của một Transaction Fact Table:

| sales_key (PK) | date_key (FK) | store_key (FK) | product_key (FK) | order_id (DD) | quantity (Fact) | revenue (Fact) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1001 | 20260601 | 55 | 889 | INV-992 | 2 | 1500.00 |
| 1002 | 20260601 | 55 | 442 | INV-992 | 1 | 300.00 |
| 1003 | 20260602 | 12 | 889 | INV-993 | 5 | 3750.00 |

*Ghi chú:*
* `(FK)`: Khóa ngoại liên kết tới Dimension Table.
* `(Fact)`: Các chỉ số có thể tính toán (Additive).
* `(DD)`: Degenerate Dimension - Kích thước suy biến. Nó là thuộc tính ngữ cảnh (Mã hóa đơn) nhưng không có bảng Dimension tương ứng nên nằm luôn trong Fact Table.

---

## Practical example

Xây dựng một `fact_sales` (Transaction Fact Table) tại siêu thị:

```sql
CREATE TABLE fact_sales (
    -- Khóa chính thay thế (Optional nhưng khuyên dùng trong DWH hiện đại)
    sales_fact_id BIGINT PRIMARY KEY,
    
    -- Các khóa ngoại trỏ tới Dimension Tables
    date_key INT NOT NULL,
    customer_key INT NOT NULL,
    store_key INT NOT NULL,
    product_key INT NOT NULL,
    
    -- Degenerate Dimension
    transaction_id VARCHAR(50), 
    
    -- Metrics (Facts)
    sales_quantity INT,
    gross_revenue DECIMAL(18,4),
    discount_amount DECIMAL(18,4),
    
    -- Cột Audit theo dõi quá trình ETL
    etl_load_timestamp TIMESTAMP
);

-- Tạo Index trên các cột Foreign Key để tối ưu Star-join
CREATE INDEX idx_fact_date ON fact_sales(date_key);
CREATE INDEX idx_fact_store ON fact_sales(store_key);
```

---

## Best practices

* **Thiết lập mức Grain sâu nhất có thể**: Thiết kế Fact Table ở mức độ chi tiết nhất (Atomic grain) thay vì nạp dữ liệu đã được tổng hợp (Aggregated data). Việc tổng hợp số liệu hãy để công cụ BI thực hiện. Data chi tiết giúp ta trả lời được mọi câu hỏi kinh doanh ngẫu nhiên trong tương lai (Ad-hoc queries).
* **Tất cả Foreign Key không được phép NULL**: Nếu một giao dịch không có ID Khách hàng (khách vãng lai), hệ thống ETL phải gán `customer_key = -1` (trỏ đến bản ghi "Anonymous" trong `dim_customer`). NULL trong Fact Table sẽ làm hỏng dữ liệu báo cáo khi JOIN.
* **Đảm bảo tính nhất quán của Grain**: Không bao giờ trộn lẫn dòng sự kiện mức "Chi tiết sản phẩm" và dòng sự kiện mức "Tổng hóa đơn" trong cùng một bảng Fact.

---

## Common mistakes

* **Thêm cột chuỗi văn bản (VARCHAR) vào Fact Table**: Data Engineer lười biếng nên chèn luôn cột `product_name` và `customer_email` vào `fact_sales` để "đỡ phải JOIN". Điều này phá vỡ Star Schema và làm phình to bảng Fact một cách thảm họa.
* **Thiết kế Fact chứa toàn Non-additive facts**: Ví dụ bảng `fact_stock` chỉ chứa `Đơn giá` và `Tỉ lệ phần trăm`. Việc phân tích sẽ cực kỳ khó khăn. Quy tắc của Kimball là: Luôn cố gắng lưu giá trị tuyệt đối (Ví dụ: Thay vì lưu `% lợi nhuận`, hãy lưu `Doanh thu` và `Chi phí`, sau đó để công cụ BI tự tính `% lợi nhuận`).

---

## Trade-offs

### Ưu điểm
* **Tối ưu cực đại cho tốc độ xử lý số liệu (Aggregation)**: Vì bảng hẹp, database có thể nạp hàng triệu dòng lên RAM rất nhanh.
* **Khả năng mở rộng chiều (Dimensions) vô hạn**: Nếu doanh nghiệp muốn phân tích theo 1 ngữ cảnh mới, chỉ cần thêm 1 cột Foreign Key (INT) vào Fact Table và tạo thêm 1 bảng Dimension.
* **Linh hoạt thời gian (Time-series)**: Fact Table tự nhiên hình thành một kho dữ liệu chuỗi thời gian (time-series) khổng lồ, phù hợp cho phân tích xu hướng.

### Nhược điểm
* **Dung lượng lưu trữ khổng lồ**: Transaction Fact Tables liên tục phình to. Đối với công ty lớn, bảng này có thể thêm vào hàng chục triệu record mỗi ngày, yêu cầu hệ thống phân vùng (Partitioning) chặt chẽ.
* **Chi phí Re-statement (Cập nhật dữ liệu cũ)**: Nếu logic tính toán doanh thu của năm ngoái bị phát hiện sai, việc chạy lệnh `UPDATE` lại 1 tỷ dòng trên bảng Fact là một cơn ác mộng về mặt tài nguyên và thời gian downtime. Thường phải dùng chiến lược ghi đè partition.

---

## When to use

* Là bắt buộc trong bất kỳ mô hình Star Schema hay Snowflake Schema nào để phục vụ Data Warehouse.
* Khi bạn cần lưu trữ dữ liệu chuỗi sự kiện lịch sử không thể bị thay đổi (Immutable ledger).

## When not to use

* Chứa dữ liệu thông tin hồ sơ (Profile data) thay đổi liên tục, ví dụ như thông tin cá nhân khách hàng (Hãy đưa vào Dimension).
* Hệ thống cơ sở dữ liệu quan hệ truyền thống (OLTP) phục vụ giao diện ứng dụng Web/App thông thường.

---

## Related concepts

* [Dimension Table](/concepts/dimension-table)
* [Star Schema](/concepts/star-schema)
* [Grain](/concepts/grain)

---

## Interview questions

### 1. Bạn hãy giải thích khái niệm Factless Fact Table là gì? Và khi nào thì cần dùng nó?
* **Người phỏng vấn muốn kiểm tra**: Kiến thức sâu về Dimensional Modeling ở các trường hợp góc (edge cases).
* **Gợi ý trả lời**: 
  * "Factless Fact Table" (Bảng sự kiện không có sự kiện/số liệu) là một loại Fact Table chỉ chứa các Foreign Keys (liên kết đến Dimension) mà hoàn toàn KHÔNG CÓ cột chỉ số đo lường (Metrics) nào.
  * **Khi nào dùng**: Thường được dùng để ghi nhận các sự kiện xảy ra nhưng không phát sinh con số tài chính/định lượng. Ví dụ điển hình nhất là **Điểm danh sinh viên**: `fact_attendance` chỉ có `date_key`, `student_key`, `class_key`. Sự xuất hiện của 1 dòng dữ liệu trong bảng này chính là một "Fact" đại diện cho việc sinh viên có đi học. Một ví dụ khác là bảng **Chương trình khuyến mãi**: `fact_promotion_coverage` chỉ ghi nhận `date_key`, `product_key`, `promotion_key` để cho biết sản phẩm nào đang nằm trong chương trình nào vào ngày nào.

### 2. Sự khác biệt giữa Transaction Fact Table và Accumulating Snapshot Fact Table là gì?
* **Người phỏng vấn muốn kiểm tra**: Khả năng lựa chọn loại Fact phù hợp với quy trình kinh doanh.
* **Gợi ý trả lời**: 
  * **Transaction Fact**: Insert một dòng mới ngay lập tức mỗi khi có sự kiện (ví dụ: quét mã vạch). Dữ liệu là dạng *Insert-Only*, không bao giờ bị UPDATE.
  * **Accumulating Snapshot Fact**: Một dòng dữ liệu đại diện cho *toàn bộ vòng đời* của một sự kiện kinh doanh dài hạn (như quy trình bồi thường bảo hiểm hoặc xử lý đơn hàng). Bảng Fact này sẽ có nhiều cột Date Key cho từng giai đoạn (`order_date_key`, `shipping_date_key`, `payment_date_key`). Khi đơn hàng mới tạo, chỉ `order_date_key` có giá trị. Khi đơn được ship, hệ thống ETL sẽ thực hiện tác vụ *UPDATE* chính dòng đó để điền `shipping_date_key`. Loại Fact này đặc biệt hữu dụng để đo lường "Độ trễ" (Lag time) giữa các bước trong một quy trình.

---

## References

1. **The Data Warehouse Toolkit** - Ralph Kimball (Phân tích chi tiết 3 loại Fact Table).
2. **Fundamentals of Data Engineering** - Joe Reis.

---

## English summary

A Fact Table is the central table in a star schema of a data warehouse, storing the quantitative measurements (facts/metrics) of business events alongside foreign keys that link to descriptive dimension tables. Characterized as being highly atomic, deeply granular, and massively long (often containing billions of rows), fact tables are optimized for rapid numerical aggregation. Facts can be additive (summable across all dimensions), semi-additive, or non-additive. Additionally, fact tables are categorized into transaction (insert-only events), periodic snapshot (regular interval summaries), and accumulating snapshot (tracking a process pipeline via updates), forming the analytical backbone of any enterprise BI system.
