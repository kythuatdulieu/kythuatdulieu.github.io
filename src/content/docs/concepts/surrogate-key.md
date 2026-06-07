---
title: "Khóa thay thế - Surrogate Key"
category: "Data Warehouse"
difficulty: "Beginner"
tags: ["data-warehouse", "surrogate-key", "natural-key", "dimensional-modeling", "scd"]
readingTime: "9 mins"
lastUpdated: 2026-06-07
seoTitle: "Surrogate Key (Khóa thay thế) là gì? Phân biệt với Natural Key"
metaDescription: "Tìm hiểu chi tiết về Khóa thay thế (Surrogate Key) trong Data Warehouse. So sánh Surrogate Key và Natural Key, tại sao nó lại quan trọng đối với hệ thống ETL."
---

# Khóa thay thế - Surrogate Key

## Summary

Khóa thay thế (Surrogate Key) là một khái niệm kỹ thuật cốt lõi trong thiết kế Data Warehouse. Nó là một mã định danh duy nhất (thường là một dãy số nguyên tự tăng hoặc mã băm Hash) do chính hệ thống lưu trữ phân tích tạo ra để làm Khóa chính (Primary Key) cho các bảng Dimension. Surrogate Key hoàn toàn không chứa bất kỳ ý nghĩa kinh doanh (business logic) nào. Mục đích duy nhất của nó là cách ly Data Warehouse khỏi sự phụ thuộc vào các khóa tự nhiên (Natural Keys) vốn thường xuyên biến động và chứa nhiều rủi ro từ các hệ thống vận hành (OLTP).

---

## Definition

Trong lý thuyết cơ sở dữ liệu phân tích, khi định danh một thực thể (ví dụ: Khách hàng), chúng ta có 2 loại khóa:
* **Natural Key (Khóa tự nhiên / Khóa nghiệp vụ)**: Là mã định danh sinh ra từ các phần mềm ứng dụng để phục vụ nghiệp vụ con người. Ví dụ: Số CMND/CCCD, Mã số sinh viên `SV-2022-A1`, Mã định danh hệ thống CRM `CUS-00123`.
* **Surrogate Key (Khóa thay thế)**: Là một số nguyên (Integer / BigInt) được tạo tự động bởi Data Warehouse bằng một dãy số vô định (Ví dụ: `1`, `2`, `3`...). Nó không có mối liên hệ nào với thế giới thực.

Trong Data Warehouse (nhất là theo trường phái Kimball), **Surrogate Key luôn luôn được chọn làm Primary Key của Dimension Table**, và sau đó trở thành Foreign Key trong Fact Table.

---

## Why it exists

Ban đầu, các kỹ sư thường dùng luôn Natural Key của ứng dụng để làm khóa chính cho kho dữ liệu vì "tiện". Tuy nhiên, điều này tạo ra 3 thảm họa kỹ thuật:

1. **Natural Key bị thay đổi hoặc tái sử dụng**: Ở nhiều công ty, mã `CUS-123` hôm nay thuộc về anh A, nhưng 3 năm sau anh A hủy tài khoản, nhân viên lại dùng mã `CUS-123` cấp cho chị B. Nếu DWH dùng mã này làm khóa, số liệu doanh thu của anh A và chị B sẽ bị trộn vào nhau không thể tách rời.
2. **Khóa của nhiều hệ thống đụng độ nhau**: Công ty mua lại một doanh nghiệp khác. Hệ thống CRM cũ có khách hàng `CUS-100`, hệ thống CRM mới mua lại cũng có khách hàng `CUS-100` (dù là 2 người khác nhau). Nếu đẩy chung vào DWH sẽ vi phạm lỗi trùng Khóa chính.
3. **Chặn đứng khả năng lưu lịch sử**: Kỹ thuật quản lý lịch sử (Slowly Changing Dimension Type 2) yêu cầu một thực thể phải có khả năng sinh ra nhiều dòng lịch sử khác nhau. Nếu dùng Natural Key làm Khóa chính, bảng chỉ cho phép có 1 dòng duy nhất cho mã khách hàng đó (Không thể INSERT dòng lịch sử thứ 2).

Surrogate Key ra đời như một lớp khiên bảo vệ, giải quyết dứt điểm 3 vấn đề trên bằng cách trao lại toàn quyền định danh cho Data Warehouse.

---

## Core idea

Ý tưởng của Surrogate Key là sự tách bạch (Decoupling) giữa **Thế giới vận hành** (Operational) và **Thế giới phân tích** (Analytical).

* Hệ thống nguồn (Source) muốn đổi, xóa, tái sử dụng khóa tự nhiên (Natural Key) như thế nào là việc của họ.
* Khi dữ liệu chảy qua đường ống ETL vào Data Warehouse, Data Warehouse sẽ cấp cho thực thể đó một tấm "Chứng minh thư phân tích" (Surrogate Key). Các Fact Table (Bảng số liệu doanh thu, tồn kho) sẽ chỉ làm việc và liên kết chéo với tấm Chứng minh thư mới này.

---

## How it works

Dòng chảy dữ liệu xử lý Surrogate Key qua quy trình ETL:
1. Hệ thống Nguồn có khách hàng: `ID = K-001`, `Name = Alice`, `City = Hanoi`.
2. ETL đọc dữ liệu, đối chiếu vào `dim_customer`. 
3. Thấy chưa có ai mang mã `K-001`, ETL tạo mới Surrogate Key bằng hàm tự tăng (`NEXTVAL` hoặc Auto-increment). Giả sử hệ thống cấp SK = `101`.
4. Bảng Dimension lúc này có dòng: SK = `101`, Natural Key = `K-001`, Name = `Alice`.
5. Trong tương lai, khi tải dữ liệu vào `fact_sales` và thấy đơn hàng của `K-001`, ETL sẽ tiến hành tra cứu (Lookup) bảng Dimension, chuyển đổi mã `K-001` thành mã `101`, và nhét mã `101` này vào bảng Fact.

---

## Architecture / Flow

Bảng dưới minh họa việc dùng Surrogate Key để xử lý lịch sử chuyển nhà (SCD Type 2) của cùng một Natural Key (`K-001`):

| customer_sk (PK) | natural_key | name | city | is_current |
| :--- | :--- | :--- | :--- | :--- |
| **101** | K-001 | Alice | Hanoi | FALSE |
| **102** | K-001 | Alice | Saigon | **TRUE** |

*Nếu không có `customer_sk`, bạn không thể INSERT dòng thứ hai vì bảng sẽ báo lỗi Duplicate Primary Key `K-001`.*

Trong `fact_sales`:
| sales_id | date_key | **customer_sk** | revenue |
| :--- | :--- | :--- | :--- |
| F-88 | 20251010 | **101** | 500.00 |
| F-89 | 20260607 | **102** | 200.00 |

*Giao dịch F-88 vẫn liên kết với ngữ cảnh Alice ở Hanoi. Giao dịch F-89 liên kết với Alice ở Saigon.*

---

## Practical example

Trong môi trường Data Warehouse hiện đại trên Cloud (như BigQuery, Snowflake, dbt), việc duy trì các cột số nguyên tự tăng (Auto-increment) đôi khi tạo ra hiện tượng "cổ chai" (bottleneck) về hiệu năng song song. 

**Kỹ thuật hiện đại: Sử dụng Hashed Surrogate Key**
Thay vì dùng số đếm 1, 2, 3... Kỹ sư Data dùng hàm Băm (Hash - như MD5 hoặc SHA256) trên Natural Key để tạo ra Surrogate Key.

Mã SQL dbt sử dụng macro `dbt_utils.generate_surrogate_key`:
```sql
SELECT
    -- Tạo Hashed Surrogate Key bằng MD5
    {{ dbt_utils.generate_surrogate_key(['system_id', 'natural_customer_id']) }} AS customer_sk,
    
    natural_customer_id,
    customer_name,
    city
FROM stg_customers
```
Cách tiếp cận Hash (băm) giúp các hệ thống tính toán song song phân tán (như Spark) tạo Surrogate Key cực nhanh mà không cần xếp hàng chờ cấp số tuần tự.

---

## Best practices

* **Thiết kế kiểu dữ liệu nhỏ nhất có thể**: Trong DWH truyền thống (SQL Server, Postgres), Surrogate Key nên luôn là `INT` (4 byte) hoặc `BIGINT` (8 byte). Không dùng `VARCHAR` để làm Surrogate Key vì nó làm chậm quá trình JOIN và làm phình to bảng Fact Table (Fact Table lưu hàng tỷ dòng, 1 byte tiết kiệm được nhân với tỷ dòng sẽ thành hàng Gigabytes ổ cứng và RAM).
* **Luôn có giá trị "Khuyết" (-1)**: Thêm một bản ghi mặc định vào bảng Dimension với Surrogate Key bằng `-1`, nội dung là "N/A" hoặc "Unknown". Khi luồng ETL nạp Fact Table mà không tìm thấy ID Khách hàng tương ứng, thay vì để NULL (làm gãy JOIN), hãy nhét số `-1` vào bảng Fact.

---

## Common mistakes

* **Sử dụng Smart Keys (Khóa thông minh)**: Khóa thông minh là dạng mã có nhồi nhét quy tắc logic. Ví dụ: `1_01_005` (trong đó 1 là vùng Bắc, 01 là Hà Nội, 005 là KH thứ 5). Dùng nó làm Khóa chính cho DWH là thảm họa vì khi logic kinh doanh đổi, cấu trúc mã bị phá vỡ. Khóa của DWH phải "Dumb" (Ngu ngốc/Vô nghĩa) hoàn toàn.
* **Mất kiểm soát ánh xạ (Mapping)**: Trong quá trình xử lý Fact Table, hệ thống ETL thực hiện Lookup Surrogate Key nhưng Lookup sai (do lỗi thời gian hoặc lỗi bảng), dẫn tới bảng Fact cắm nhầm Khóa ngoại vào một người khác.

---

## Trade-offs

### Ưu điểm
* **Hiệu năng siêu việt (Performance)**: Phép JOIN giữa Fact và Dimension sử dụng số nguyên (Integer) nhanh hơn nhiều lần so với JOIN bằng chuỗi ký tự (VARCHAR).
* **Bảo vệ tính toàn vẹn (Integrity)**: Cách ly hoàn toàn DWH khỏi các sự thay đổi (đổi mã, xóa mã, nhập nhằng mã) từ hàng chục phần mềm ứng dụng nguồn khác nhau.
* **Cho phép quản lý Lịch sử**: Mở đường cho kỹ thuật SCD Type 2.

### Nhược điểm
* **Gia tăng sự phức tạp cho ETL**: ETL pipeline phải có thêm một bước (Bước tra cứu - Lookup) để dịch mã Natural Key thành Surrogate Key trước khi nạp dữ liệu vào Fact Table, gây tiêu tốn tài nguyên xử lý lúc Load data.

---

## When to use

* **Bắt buộc sử dụng** cho mọi thiết kế bảng chiều (Dimension Table) theo mô hình Kimball.
* Khi kết nối dữ liệu từ 2 hệ thống nguồn trở lên vào cùng một DWH (Ví dụ: CRM từ Salesforce và Kế toán từ SAP).

## When not to use

* Trong hệ thống OLTP vận hành (Web/App Backend). Việc sinh ra một mã vô nghĩa không có tác dụng hỗ trợ tìm kiếm trên ứng dụng của người dùng.
* Khi sử dụng bảng ngày tháng (`dim_date`). Nhiều người khuyên nên dùng Smart Key như `20260607` thay vì một Surrogate Key vô nghĩa như `5899` để Data Analyst có thể phân vùng dữ liệu dễ dàng hơn.

---

## Related concepts

* [Dimension Table](/concepts/dimension-table)
* [Slowly Changing Dimension (SCD)](/concepts/slowly-changing-dimension)
* [Fact Table](/concepts/fact-table)
* [dbt (Data Build Tool)](/concepts/dbt)

---

## Interview questions

### 1. Nếu tôi có một hệ thống CRM rất chuẩn mực, các mã ID không bao giờ bị đổi hay dùng lại. Liệu tôi có cần đến Surrogate Key khi xây DWH không?
* **Người phỏng vấn muốn kiểm tra**: Sự nắm vững về thiết kế hệ thống và rủi ro mở rộng trong tương lai.
* **Gợi ý trả lời**: Câu trả lời là **Có, vẫn bắt buộc**. 
  1. Thứ nhất, hệ thống CRM đó chỉ là 1 nguồn. Tương lai công ty có thể mua thêm một phần mềm ERP hoặc sáp nhập (M&A) công ty khác, mã ID chắc chắn sẽ xung đột.
  2. Thứ hai, và quan trọng nhất, CRM không bao giờ sinh ra 2 mã ID cho cùng 1 người. Nếu chúng ta muốn theo dõi lịch sử chuyển vùng của khách hàng đó qua thời gian (SCD Type 2), ta buộc phải sinh ra các dòng phân thân mới trong DWH. Để chứa các dòng phân thân đó trong cùng 1 bảng, ta cần Surrogate Key làm Khóa chính.

### 2. Sự khác biệt giữa Surrogate Key truyền thống (Auto-increment Integer) và Surrogate Key hiện đại (MD5 Hashed Key) là gì? Tại sao các DWH trên Cloud (Snowflake/BigQuery) lại chuộng cách thứ 2?
* **Người phỏng vấn muốn kiểm tra**: Kiến thức Cloud Data Engineering, phân tán hệ thống.
* **Gợi ý trả lời**: 
  * **Auto-increment Integer**: Cần một hệ thống trung tâm duy trì trạng thái đếm (Ví dụ số hiện tại là 100 thì cấp tiếp số 101). Trong môi trường xử lý phân tán song song (MPP) như Spark, hàng ngàn máy trạm ghi dữ liệu cùng lúc sẽ bị "nghẽn" vì phải gọi về máy chủ trung tâm xin cấp số. Hơn nữa, quá trình load Fact table phải JOIN Lookup về bảng Dimension mới lấy được Surrogate Key.
  * **Hashed Key**: Áp dụng hàm băm một chiều (MD5) lên Natural Key. Không cần máy chủ đếm, mọi máy trạm đều có thể tự tính toán độc lập `MD5(ID)` và luôn ra kết quả giống nhau. Khi load Fact table, ta không cần thực hiện thao tác JOIN Lookup đắt đỏ nữa, chỉ việc áp mã MD5 thẳng vào ID nguồn. Đây là kỹ thuật tiết kiệm tài nguyên khổng lồ trong các pipeline Big Data ELT (như dbt).

---

## References

1. **The Data Warehouse Toolkit** - Ralph Kimball (Lý do bảo vệ DWH bằng Surrogate Key).
2. **dbt Developer Blog** - "Surrogate keys in the modern data stack" (Giải thích chi tiết về việc ứng dụng hàm băm MD5 thay cho số nguyên).
3. **Fundamentals of Data Engineering** - Joe Reis.

---

## English summary

A Surrogate Key is a system-generated, strictly meaningless identifier (typically an auto-incrementing integer or a cryptographic hash) used as the Primary Key for Dimension Tables in a Data Warehouse. It deliberately replaces the Natural Key (the business or application ID) to decouple the analytical environment from the operational one. By generating Surrogate Keys, data engineers protect the warehouse against operational key reassignments, resolve collisions when integrating multiple source systems, guarantee optimized join performance with Fact tables, and crucially, enable the storage of multiple historical snapshots of a single entity (SCD Type 2). In modern distributed cloud architectures, generating surrogate keys via hashing functions is heavily favored over sequential integers to facilitate parallel processing and eliminate lookup bottlenecks.
