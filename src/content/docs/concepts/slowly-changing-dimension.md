---
title: "Xử lý Dimension thay đổi chậm - Slowly Changing Dimension (SCD)"
category: "Data Warehouse"
difficulty: "Advanced"
tags: ["data-warehouse", "scd", "dimensional-modeling", "dimension-table", "etl"]
readingTime: "15 mins"
lastUpdated: 2026-06-07
seoTitle: "Slowly Changing Dimension (SCD) là gì? Type 1, 2, 3, 4, 6"
metaDescription: "Tìm hiểu toàn tập về Slowly Changing Dimension (SCD): Các kỹ thuật SCD Type 1, 2, 3, 4, 6. Cách xử lý dữ liệu thay đổi lịch sử trong Data Warehouse."
---

# Xử lý Dimension thay đổi chậm - Slowly Changing Dimension (SCD)

## Summary

Slowly Changing Dimension (SCD) là một tập hợp các kỹ thuật thiết kế trong Data Warehousing nhằm giải quyết vấn đề quản lý dữ liệu lịch sử. Khi các thuộc tính mô tả trong bảng chiều (Dimension Table) bị thay đổi theo thời gian (ví dụ: khách hàng chuyển chỗ ở, sản phẩm thay đổi công thức), SCD định nghĩa cách thức hệ thống ETL phải phản ứng như thế nào. Các phương pháp phổ biến nhất là SCD Type 1 (Ghi đè - mất lịch sử), SCD Type 2 (Tạo phiên bản mới - giữ lịch sử hoàn chỉnh), và SCD Type 3 (Lưu trạng thái hiện tại và trạng thái trước đó).

---

## Definition

Trong thế giới thực, các thuộc tính mô tả thực thể (Dimension attributes) hiếm khi tĩnh hoàn toàn, mà chúng "thay đổi chậm" (Slowly Changing). Ví dụ: một khách hàng thường ở một địa chỉ trong vài năm trước khi chuyển nhà.

**Slowly Changing Dimension (SCD)** là phương pháp luận được thiết kế để kiểm soát những thay đổi này trong Data Warehouse, nhằm đảm bảo các báo cáo chỉ ra số liệu đúng với ngữ cảnh thời điểm xảy ra sự kiện đó (Point-in-time accuracy).

---

## Why it exists

Thử tưởng tượng kịch bản sau: 
Nhân viên bán hàng (Sales) tên **John** làm việc ở khu vực **Hà Nội** và bán được 100 đơn hàng vào tháng 1. Đến tháng 2, John được điều chuyển công tác vào khu vực **TP.HCM** và bán thêm 50 đơn hàng.
* Nếu chúng ta chỉ đơn giản là UPDATE thuộc tính khu vực của John thành "TP.HCM" (như cơ sở dữ liệu OLTP làm).
* Hệ quả: Khi sếp mở báo cáo BI lên xem tổng doanh số theo Khu vực, toàn bộ 100 đơn hàng tháng 1 (vốn bán ở Hà Nội) sẽ bị tính gộp vào doanh số của TP.HCM. Báo cáo lịch sử đã bị hỏng hoàn toàn.

SCD ra đời để cấp công cụ cho Data Engineers lưu giữ chính xác "phiên bản" của chiều dữ liệu tại thời điểm sự kiện diễn ra.

---

## Core Types (Phân loại các phương pháp SCD)

### SCD Type 0: Retain Original (Giữ nguyên gốc)
Tuyệt đối không thay đổi. Khi dữ liệu nguồn cập nhật, Data Warehouse vẫn giữ nguyên dữ liệu gốc ban đầu và bỏ qua sự thay đổi.
* *Sử dụng*: Các thuộc tính bất di bất dịch như Ngày tháng năm sinh, ID khách hàng gốc.

### SCD Type 1: Overwrite (Ghi đè)
Cập nhật trực tiếp dữ liệu mới đè lên dữ liệu cũ. Lịch sử thay đổi bị mất vĩnh viễn. Mọi báo cáo cũ liên quan đến đối tượng sẽ mang diện mạo mới.
* *Sử dụng*: Sửa lỗi chính tả, hoặc các thuộc tính mà doanh nghiệp xác nhận "không có giá trị để phân tích lịch sử" (ví dụ: cập nhật số điện thoại cá nhân).

### SCD Type 2: Add New Row (Thêm dòng mới) - *Quan trọng nhất*
Bảo lưu toàn bộ lịch sử. Khi có thay đổi, hệ thống "hết hạn" (expire) dòng cũ và chèn (INSERT) một dòng mới hoàn toàn với Surrogate Key mới.
* *Đặc điểm*: Yêu cầu thêm các cột theo dõi thời gian (`start_date`, `end_date`, `is_active`). Bất kỳ Fact mới nào sinh ra sẽ được gắn với Surrogate Key mới nhất.
* *Sử dụng*: Hầu hết mọi Dimension quan trọng yêu cầu tính chính xác lịch sử (Khu vực của nhân viên, Phân khúc khách hàng).

### SCD Type 3: Add New Column (Thêm cột mới)
Thêm một cột phụ vào bảng để giữ trạng thái ngay trước đó. Chỉ lưu được 1 thế hệ lịch sử gần nhất.
* *Đặc điểm*: Bảng có thêm cột `previous_value`. Không làm tăng số dòng.
* *Sử dụng*: Khi doanh nghiệp muốn dễ dàng so sánh "Giá trị hiện hành" và "Giá trị trước thay đổi" trong cùng 1 báo cáo (Ví dụ: So sánh tổ chức phòng ban mới và phòng ban cũ của nhân sự).

### Các loại nâng cao (Hybrid)
* **SCD Type 4 (History Table)**: Tách dữ liệu hiện tại vào bảng chính (như Type 1) và đẩy toàn bộ lịch sử thay đổi vào một bảng History riêng biệt. (Lấy ý tưởng từ CDC).
* **SCD Type 6 (1 + 2 + 3)**: Kết hợp cả 3 kỹ thuật. Giữ dòng lịch sử mới (Type 2), cập nhật cờ hiện tại ở dòng cũ (Type 1), và lưu thuộc tính lịch sử ngang (Type 3).

---

## Architecture / Flow & Practical Example

Cùng minh họa SCD Type 2 (Loại phổ biến nhất) bằng SQL và Data flow.

**1. Trạng thái ban đầu:** Khách hàng tên Alice sống ở "Hanoi".

| customer_sk (Surrogate PK) | customer_id (Natural Key) | name | city | is_active | start_date | end_date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **101** | CUS-99 | Alice | Hanoi | TRUE | 2025-01-01 | 9999-12-31 |

*(Bất kỳ Fact giao dịch nào của Alice lúc này sẽ trỏ vào `customer_sk = 101`)*.

**2. Sự kiện:** Ngày `2026-06-07`, Alice chuyển nhà sang "Saigon".

**3. Xử lý ETL SCD Type 2:**
Bước A: Update (hết hạn) dòng cũ.
Bước B: Insert dòng phiên bản mới.

Kết quả bảng `dim_customer` sẽ như sau:

| customer_sk (PK) | customer_id | name | city | is_active | start_date | end_date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **101** | CUS-99 | Alice | Hanoi | FALSE | 2025-01-01 | **2026-06-07** |
| **102** | CUS-99 | Alice | Saigon | **TRUE** | **2026-06-07** | 9999-12-31 |

*(Từ ngày này trở đi, giao dịch mới của Alice sẽ trỏ vào khóa `customer_sk = 102`. Giao dịch cũ trong quá khứ vẫn trỏ vào khóa `101`. Lịch sử được bảo toàn tuyệt đối!).*

---

## Best practices

* **Mặc định sử dụng SCD Type 2 cho các Dimension cốt lõi**: Trừ khi có lý do chính đáng để bỏ qua lịch sử (như thiếu Storage hoặc nghiệp vụ không quan tâm), hãy coi Type 2 là quy chuẩn mặc định.
* **Cột "Hiệu lực tương lai"**: Thay vì để `end_date` của dòng hiện tại là `NULL`, hãy dùng một mốc thời gian viễn tưởng xa xôi như `9999-12-31`. Việc này giúp tối ưu hóa thuật toán BETWEEN của engine SQL khi JOIN, tránh các lỗi xử lý NULL.
* **Kết hợp Hash Key để phát hiện thay đổi**: Để ETL biết dòng nào bị thay đổi, thay vì so sánh từng cột (Tên, Địa chỉ, SĐT...), hãy tạo một cột `row_hash` (MD5 hoặc SHA-256) chứa chuỗi mã hóa của toàn bộ dòng. Chỉ cần so sánh `hash_source` và `hash_target` để kích hoạt logic SCD.

---

## Common mistakes

* **Quên cấp Surrogate Key**: SCD Type 2 không thể tồn tại nếu không có Surrogate Key (Khóa thay thế). Nếu cố tình dùng Natural Key (`customer_id = CUS-99`) làm khóa chính, khi INSERT dòng thay đổi thứ 2, Database sẽ báo lỗi trùng lặp Khóa chính (Primary Key Violation).
* **Áp dụng SCD Type 2 cho các thuộc tính "Fast Changing" (Thay đổi nhanh)**: Nếu bạn áp dụng SCD Type 2 cho một cột như "Điểm tín dụng" (Credit Score - dao động liên tục hàng ngày), bảng Dimension sẽ phát nổ về dung lượng. Hãy cân nhắc đẩy các thuộc tính thay đổi liên tục này ra thành Fact hoặc Mini-Dimension (kỹ thuật SCD Type 4).
* **Xử lý trễ thời gian (Late arriving data)**: Sự thay đổi diễn ra tháng 1, nhưng đến tháng 3 hệ thống mới nhận được (Backfill). Hệ thống ETL ngây thơ có thể chèn phiên bản mới với `start_date` là tháng 3, làm hỏng các Fact sinh ra ở tháng 2. Cần viết luồng ETL đặc biệt để "nhét" (weave) các sự kiện trễ hạn vào đúng trình tự thời gian.

---

## Trade-offs

### SCD Type 1 (Ghi đè)
* **Ưu điểm**: Dễ cài đặt, Data pipeline chạy cực nhanh, không tốn thêm ổ cứng. Bảng Dimension luôn nhỏ gọn.
* **Nhược điểm**: Bóp méo toàn bộ báo cáo lịch sử.

### SCD Type 2 (Giữ lịch sử - Tạo dòng mới)
* **Ưu điểm**: Bức tranh dữ liệu hoàn hảo. Cho phép phân tích chính xác tại bất kỳ mốc thời gian nào trong quá khứ ("As-was" vs "As-is" reporting).
* **Nhược điểm**: 
  * Tốn rất nhiều không gian lưu trữ do sinh ra dòng mới liên tục.
  * Logic đường ống dbt / ETL phức tạp (Phải quản lý Upsert / Merge).
  * Kích thước Dimension phình to làm chậm tốc độ JOIN với Fact Table.

---

## When to use

* **Type 1**: Khi sửa lỗi chính tả (nhập sai tên khách từ "Alise" thành "Alice"), cập nhật email cá nhân.
* **Type 2**: Bắt buộc dùng cho Địa lý (Khu vực, Tỉnh/Thành phố), Phân cấp nhân sự (Chuyển phòng ban, Thăng chức sếp), Cấu trúc sản phẩm.
* **Type 3**: Doanh nghiệp chỉ quan tâm đến thay đổi hiện tại và duy nhất một trạng thái trước đó để so sánh nhanh. Thường dùng trong báo cáo Bán hàng khi thay đổi cấu trúc Kênh phân phối.

---

## Related concepts

* [Dimension Table](/concepts/dimension-table)
* [Surrogate Key](/concepts/surrogate-key)
* [Data Warehouse](/concepts/data-warehouse)
* [Change Data Capture (CDC)](/concepts/cdc)

---

## Interview questions

### 1. Tại sao Surrogate Key là yếu tố sống còn để triển khai SCD Type 2?
* **Người phỏng vấn muốn kiểm tra**: Sự liên kết kiến thức giữa Surrogate Key và quản lý lịch sử.
* **Gợi ý trả lời**: Trong SCD Type 2, một thực thể duy nhất (ví dụ nhân viên John có mã `EMP-01`) sẽ có nhiều phiên bản theo thời gian mỗi khi anh ta chuyển phòng ban. Nếu ta dùng Natural Key (`EMP-01`) làm Primary Key cho bảng Dimension, ta không thể insert dòng thứ 2 cho John vì sẽ vi phạm luật duy nhất (Unique Constraint). Surrogate Key (các số tự tăng ngẫu nhiên như `100`, `101`) cho phép ta tạo ra vô số dòng đại diện cho John trong các thời kỳ khác nhau, mỗi dòng có một Surrogate Key riêng để Fact Table liên kết chính xác với ngữ cảnh phòng ban của thời kỳ đó.

### 2. Kỹ sư dbt (Data Build Tool) thường xử lý SCD Type 2 bằng tính năng gì? Giải thích ngắn gọn cách hoạt động của nó.
* **Người phỏng vấn muốn kiểm tra**: Kiến thức công nghệ thực chiến hiện đại (Modern Data Stack).
* **Gợi ý trả lời**: dbt xử lý SCD Type 2 một cách tự động thông qua tính năng **dbt Snapshots**. 
Cách hoạt động: Cấu hình dbt Snapshot theo dõi một bảng nguồn bằng chiến lược `timestamp` (dựa trên cột updated_at của nguồn) hoặc `check` (so sánh giá trị các cột). Mỗi lần chạy dbt, nó ngầm biên dịch ra câu lệnh MERGE khổng lồ ở phía Database: Nó tìm các bản ghi bị thay đổi, tự động thêm timestamp vào cột `dbt_valid_to` (hết hạn dòng cũ) và Insert dòng mới với `dbt_valid_from` bằng thời gian hiện tại, miễn nhiễm người dùng khỏi việc viết các câu lệnh SQL UPDATE/INSERT thủ công rườm rà.

---

## References

1. **The Data Warehouse Toolkit** - Ralph Kimball (Chương chuyên sâu về SCD).
2. **dbt Documentation** - Snapshots (Tài liệu về cách triển khai SCD Type 2 trong thực tế).
3. **Fundamentals of Data Engineering** - Joe Reis.

---

## English summary

Slowly Changing Dimensions (SCD) define the strategic methodologies used in Data Warehousing to manage and track changes to dimension attributes over time. 
* **SCD Type 1** simply overwrites existing data, destroying historical context but keeping the architecture simple. 
* **SCD Type 2** (the most prevalent) preserves complete history by expiring the old record (via timestamps) and inserting a new version of the record with a fresh Surrogate Key, ensuring "point-in-time" accuracy for Fact Table analysis. 
* **SCD Type 3** adds a new column to track only the immediate previous value.
Proper implementation of SCD Type 2 requires the strict usage of Surrogate Keys and careful ETL logic (often handled by modern tools like dbt Snapshots) to prevent rapid inflation of dimension tables.
