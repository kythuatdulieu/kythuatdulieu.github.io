---
title: "Xử lý Dimension thay đổi chậm - Slowly Changing Dimension (SCD)"
difficulty: "Advanced"
tags: ["data-warehouse", "scd", "dimensional-modeling", "dimension-table", "etl"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Slowly Changing Dimension (SCD) là gì? Type 1, 2, 3, 4, 6"
metaDescription: "Tìm hiểu toàn tập về Slowly Changing Dimension (SCD): Các kỹ thuật SCD Type 1, 2, 3, 4, 6. Cách xử lý dữ liệu thay đổi lịch sử trong Data Warehouse."
description: "Trong quá trình xây dựng Data Warehouse, một trong những thách thức lớn nhất đối với Data Engineer là làm thế nào để lưu trữ và phân tích chính xác lị..."
---



Trong quá trình xây dựng Data Warehouse, một trong những thách thức lớn nhất đối với Data Engineer là làm thế nào để xử lý các thay đổi về dữ liệu thuộc tính theo thời gian. Đây chính là bài toán mà **Slowly Changing Dimension (SCD)** giải quyết. 

## 1. Slowly Changing Dimension (SCD) là gì?

SCD (Slowly Changing Dimension) là một khái niệm cốt lõi trong Dimensional Modeling (Mô hình hóa dữ liệu đa chiều) của Ralph Kimball. Một **Dimension** (chiều dữ liệu) dùng để cung cấp ngữ cảnh cho các sự kiện (facts), ví dụ như "Khách hàng", "Sản phẩm", "Cửa hàng". 

Khác với các giao dịch mua bán diễn ra liên tục từng giây (Fact), các thuộc tính trong bảng Dimension thường ít khi thay đổi, hoặc thay đổi rất chậm theo thời gian. Tuy nhiên, khi chúng thay đổi (ví dụ: Khách hàng đổi địa chỉ, Nhân viên chuyển phòng ban, Sản phẩm đổi danh mục), hệ thống Data Warehouse cần có chiến lược để cập nhật và lưu trữ những thay đổi này nhằm đảm bảo tính toàn vẹn của dữ liệu lịch sử.

### Bài toán ví dụ
Hãy tưởng tượng một khách hàng là "Nguyễn Văn A" sống tại "Hà Nội" mua một chiếc máy tính vào tháng 1. Tháng 3, anh A chuyển vào "TP.HCM". Tháng 5, anh A mua thêm một chiếc điện thoại. 
Nếu phòng Marketing muốn phân tích "Tổng doanh thu theo khu vực sống của khách hàng tại thời điểm mua hàng", chúng ta cần biết giao dịch tháng 1 gắn với "Hà Nội", và giao dịch tháng 5 gắn với "TP.HCM". Nếu chúng ta chỉ đơn thuần cập nhật đè (overwrite) địa chỉ của anh A thành "TP.HCM", doanh thu tháng 1 ở "Hà Nội" sẽ bị tính sai cho "TP.HCM".

Để giải quyết vấn đề này, các kiến trúc sư dữ liệu đã đề xuất nhiều phương pháp SCD khác nhau, được đánh số từ Type 0 đến Type 6.

---

## 2. Các loại SCD phổ biến (SCD Types)

### SCD Type 0: Retain Original (Giữ nguyên gốc)
Phương pháp này áp dụng cho các thuộc tính mang tính chất vĩnh viễn và không bao giờ được phép thay đổi kể từ khi dữ liệu được tạo ra. Bất kỳ sự thay đổi nào từ hệ thống nguồn (Source) đều bị bỏ qua.

- **Ví dụ**: Số CMND/CCCD, Ngày sinh, Mã số thuế, hoặc Ngày đăng ký tài khoản gốc.
- **Ưu điểm**: Đơn giản, không cần logic cập nhật.
- **Nhược điểm**: Không phản ánh các thay đổi có thể là lỗi nhập liệu từ hệ thống nguồn.

### SCD Type 1: Overwrite (Ghi đè)
Khi có sự thay đổi, dữ liệu cũ trong Data Warehouse sẽ bị ghi đè hoàn toàn bằng dữ liệu mới. Hệ thống sẽ không giữ lại bất kỳ dấu vết lịch sử nào của dữ liệu cũ.

- **Ví dụ**: Khách hàng sửa lỗi chính tả tên của mình (từ "Nguyễn Văn Aa" thành "Nguyễn Văn A"). Việc lưu lại lỗi chính tả là không cần thiết.
- **Ưu điểm**: Rất đơn giản để triển khai, không làm tăng kích thước bảng (không sinh ra dòng mới).
- **Nhược điểm**: Mất hoàn toàn dữ liệu lịch sử. Các báo cáo phân tích hồi tố (retrospective) dựa trên dữ liệu cũ sẽ bị sai lệch.

**Bảng Khách hàng trước khi cập nhật:**

| Customer_ID | Name | City |
| :--- | :--- | :--- |
| 101 | Nguyễn Văn A | Hà Nội |

**Bảng Khách hàng sau khi cập nhật SCD Type 1:**

| Customer_ID | Name | City |
| :--- | :--- | :--- |
| 101 | Nguyễn Văn A | TP.HCM |

### SCD Type 2: Add New Row (Thêm dòng mới) - Phổ biến nhất
SCD Type 2 là phương pháp chuẩn mực và được sử dụng rộng rãi nhất để lưu trữ toàn bộ lịch sử thay đổi. Mỗi khi có một sự thay đổi thuộc tính, thay vì ghi đè, hệ thống sẽ chèn thêm một dòng dữ liệu (record) mới.

Để quản lý nhiều dòng cho cùng một đối tượng, bảng Dimension cần có:
1. **Surrogate Key (Khóa đại diện)**: Thường là một số nguyên tự tăng (VD: `Customer_SK`) làm khóa chính mới.
2. **Natural Key (Khóa tự nhiên)**: Khóa gốc từ hệ thống nguồn (VD: `Customer_ID`).
3. Các cột quản lý lịch sử: 
   - `Valid_From` (Ngày bắt đầu hiệu lực)
   - `Valid_To` (Ngày kết thúc hiệu lực - thường dùng `9999-12-31` cho record hiện tại)
   - `Is_Current` hoặc `Active_Flag` (Cờ đánh dấu record đang còn hiệu lực: Y/N hoặc True/False).

**Ví dụ:** Anh A chuyển từ Hà Nội vào TP.HCM ngày 2024-03-01.

| Customer_SK | Customer_ID | Name | City | Valid_From | Valid_To | Is_Current |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 101 | Nguyễn Văn A | Hà Nội | 2023-01-01 | 2024-02-29 | False |
| 2 | 101 | Nguyễn Văn A | TP.HCM | 2024-03-01 | 9999-12-31 | True |

- **Ưu điểm**: Giữ được 100% lịch sử. Gắn kết fact data chính xác với chiều thời gian.
- **Nhược điểm**: Bảng dimension có thể tăng kích thước nhanh chóng nếu dữ liệu thay đổi quá thường xuyên. Logic ETL phức tạp hơn.

### SCD Type 3: Add New Column (Thêm cột mới)
Thay vì thêm dòng mới, SCD Type 3 thêm cột để giữ lại một phần lịch sử. Thường hệ thống chỉ lưu giá trị "Hiện tại" và giá trị "Trước đó" (Previous Value).

**Ví dụ:**

| Customer_ID | Name | Previous_City | Current_City | Effective_Date |
| :--- | :--- | :--- | :--- | :--- |
| 101 | Nguyễn Văn A | Hà Nội | TP.HCM | 2024-03-01 |

- **Ưu điểm**: Không làm tăng số lượng dòng. Dễ dàng truy vấn so sánh giá trị cũ và mới trên cùng một dòng.
- **Nhược điểm**: Giới hạn số lượng lịch sử được lưu (chỉ lưu được 1-2 lần thay đổi gần nhất, không theo dõi được nếu đổi địa chỉ 3-4 lần). Ít được sử dụng hơn Type 2.

### SCD Type 4: Add History Table (Sử dụng bảng lịch sử / Mini-Dimension)
SCD Type 4 tách riêng bảng Dimension thành hai bảng:
1. **Current Table (Bảng hiện tại)**: Chỉ chứa trạng thái mới nhất của các thuộc tính (Hoạt động như Type 1).
2. **History Table (Bảng lịch sử)**: Chứa toàn bộ các thay đổi trong quá khứ của dimension.

Hoặc trong một số biến thể, người ta sử dụng khái niệm **Mini-dimension**, nhóm các thuộc tính thay đổi rất nhanh (ví dụ: điểm tín dụng khách hàng, độ tuổi, phân khúc thu nhập) thành một bảng Dimension nhỏ độc lập để không làm phình to bảng Dimension chính.

- **Ưu điểm**: Giữ cho bảng Dimension chính gọn nhẹ, truy vấn trạng thái hiện tại rất nhanh.
- **Nhược điểm**: Cần thực hiện JOIN nhiều bảng nếu muốn phân tích lịch sử phức tạp.

### SCD Type 6: Hybrid (Kết hợp Type 1 + 2 + 3)
SCD Type 6 là sự kết hợp của Type 1 (ghi đè), Type 2 (thêm dòng mới), và Type 3 (thêm cột). Tên "Type 6" xuất phát từ phép toán: 1 + 2 + 3 = 6.

Cách hoạt động:
- Giống Type 2: Thêm dòng mới khi có thay đổi, có cờ `Is_Current`.
- Giống Type 3: Có thêm cột lưu trạng thái hiện tại (ví dụ: `Current_City`).
- Giống Type 1: Khi thêm dòng mới, hệ thống sẽ "ghi đè" cột `Current_City` cho **tất cả** các dòng lịch sử của khách hàng đó.

**Bảng sau khi thay đổi (Customer 101 đổi từ HN sang HCM):**

| Customer_SK | Customer_ID | Historical_City | Current_City | Valid_From | Valid_To | Is_Current |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 101 | Hà Nội | TP.HCM | 2023-01-01 | 2024-02-29 | False |
| 2 | 101 | TP.HCM | TP.HCM | 2024-03-01 | 9999-12-31 | True |

- **Ưu điểm**: Rất mạnh mẽ. Cho phép báo cáo theo hai hướng: 
  1. Doanh thu theo "Thành phố tại thời điểm mua" (Dùng cột `Historical_City`).
  2. Doanh thu trong quá khứ được nhóm lại theo "Thành phố hiện tại của khách hàng" (Dùng cột `Current_City`).
- **Nhược điểm**: Logic ETL phức tạp nhất. Phải UPDATE lại toàn bộ các dòng cũ khi có thay đổi mới.

---

## 3. Cách lựa chọn SCD phù hợp

Việc chọn lựa chiến lược SCD phụ thuộc vào nghiệp vụ kinh doanh và mức độ quan trọng của thuộc tính:

| Yêu cầu nghiệp vụ | Chiến lược đề xuất |
| :--- | :--- |
| Thuộc tính tĩnh, sửa lỗi chính tả, thay đổi không ảnh hưởng đến phân tích | **SCD Type 1** |
| Phân tích báo cáo hồi tố, tuân thủ kiểm toán (audit), quan tâm "khi nào thì thay đổi" | **SCD Type 2** |
| Chỉ cần so sánh giá trị "hiện tại" và "ngay trước đó" | **SCD Type 3** |
| Thuộc tính thay đổi rất nhanh (Fast-Changing Dimension), VD: Điểm tín dụng thay đổi hàng ngày | **SCD Type 4 (Mini-dimension)** |
| Vừa muốn xem lịch sử chuẩn xác, vừa muốn xem doanh thu quá khứ theo phân khúc *hiện tại* | **SCD Type 6** |

---

## 4. Triển khai SCD trong Modern Data Stack

Với sự ra đời của Cloud Data Warehouse (Snowflake, BigQuery, Redshift) và các công cụ chuyển đổi dữ liệu (dbt), việc triển khai SCD, đặc biệt là SCD Type 2 đã trở nên dễ dàng hơn:

1. **dbt Snapshots**: Công cụ `dbt` cung cấp tính năng **Snapshots** giúp tự động hóa quá trình tạo SCD Type 2. Bạn chỉ cần định nghĩa khóa chính và cột thời gian cập nhật (hoặc so sánh toàn bộ các cột), dbt sẽ tự động sinh ra câu lệnh `MERGE` để chèn thêm dòng mới và cập nhật thời gian hiệu lực cho dòng cũ.
2. **MERGE / UPSERT**: Trong các CSDL hiện đại, câu lệnh `MERGE` được dùng chủ yếu để xử lý Type 1 và Type 2.
3. **Append-Only Data Lakes**: Trong Data Lake / Lakehouse (như Delta Lake, Apache Iceberg), mô hình SCD Type 2 thường được ưa chuộng hơn Type 1 do tính chất bất biến (immutable) của file lưu trữ (Parquet). Việc Append dòng mới (Type 2) thường tối ưu về mặt I/O hơn là UPDATE lại file cũ.

## Kết luận

Hiểu và áp dụng đúng các kỹ thuật Slowly Changing Dimension là một trong những kỹ năng bắt buộc của Data Engineer. Dù có nhiều phương pháp, **SCD Type 2** vẫn luôn là tiêu chuẩn vàng cho các hệ thống Data Warehouse doanh nghiệp vì nó đảm bảo sự toàn vẹn của lịch sử kinh doanh, là nền tảng cho những phân tích dữ liệu chuyên sâu và đáng tin cậy.

## Tài Liệu Tham Khảo
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [The Data Warehouse Toolkit - Ralph Kimball](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/)
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [dbt Snapshots Documentation](https://docs.getdbt.com/docs/build/snapshots)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
