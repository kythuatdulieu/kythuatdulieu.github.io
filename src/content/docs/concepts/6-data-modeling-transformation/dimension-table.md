---
title: "Bảng chiều - Dimension Table"
difficulty: "Beginner"
tags: ["data-warehouse", "dimension-table", "dimensional-modeling", "star-schema", "scd"]
readingTime: "10 mins"
lastUpdated: 2026-06-16
seoTitle: "Dimension Table (Bảng chiều) là gì? Thiết kế chiều dữ liệu trong DWH"
metaDescription: "Tìm hiểu chi tiết Bảng chiều (Dimension Table) trong Data Warehouse: Định nghĩa, vai trò, thuộc tính, Surrogate Key và Tầm quan trọng của Conformed Dimension."
description: "Nếu bạn mở một bảng sự kiện (Fact Table) trong kho dữ liệu ra và chỉ thấy những con số khô khan như `revenue = 500,000` hay `quantity = 10`, bạn sẽ kh..."
---



Dimension Table (Bảng Chiều) là bảng chứa các thuộc tính ngữ cảnh (Who, What, Where, When) để phân tích dữ liệu kinh doanh. (Ví dụ: Bảng Khách hàng, Bảng Sản phẩm, Bảng Thời gian). Dimension tables thường có số lượng dòng ít nhưng rất nhiều cột mô tả (Attributes).

Nếu bạn mở một bảng sự kiện (Fact Table) trong kho dữ liệu ra và chỉ thấy những con số khô khan như `revenue = 500,000` hay `quantity = 10`, bạn sẽ không thể biết được số doanh thu đó là của sản phẩm nào, khách hàng nào mua, vào thời điểm nào, và ở cửa hàng nào. Đó là lý do chúng ta cần đến các **Bảng chiều (Dimension Table)**.

**Dimension Table** cung cấp "ngữ cảnh" (context) cho các con số trong Fact Table. Chúng trả lời cho các câu hỏi: **Ai (Who)? Cái gì (What)? Ở đâu (Where)? Khi nào (When)? Tại sao (Why)?** và **Như thế nào (How)?** trong các hoạt động kinh doanh.

## 1. Đặc điểm của Bảng Chiều (Characteristics)

* **Chứa dữ liệu Text (Văn bản):** Phần lớn các cột trong bảng chiều là kiểu chữ (string/text) để mô tả chi tiết, dùng làm bộ lọc (filtering), phân nhóm (grouping), và dán nhãn (labeling) trong các báo cáo.
* **Rộng (Wide):** Một bảng chiều thường có rất nhiều cột. Ví dụ bảng `dim_customer` có thể có tới 50-100 cột như: Họ tên, Ngày sinh, Địa chỉ, Thành phố, Quốc gia, Phân khúc, Sở thích, v.v.
* **Nông (Shallow):** So với Fact Table, Dimension Table thường có ít dòng hơn rất nhiều. Ví dụ một công ty có 1 triệu khách hàng (1 triệu dòng trong bảng chiều) nhưng lại có hàng tỷ giao dịch (hàng tỷ dòng trong Fact).
* **Không thường xuyên thay đổi (Hoặc thay đổi chậm):** Dữ liệu trong Dimension Table như tên sản phẩm, địa chỉ khách hàng ít khi thay đổi so với dòng sự kiện mua hàng xảy ra liên tục.

## 2. Các thành phần cấu tạo nên Bảng Chiều

* **Surrogate Key (Khóa nhân tạo):** Thường là một số nguyên tự tăng (Auto-increment integer) hoặc UUID, dùng làm Khóa chính (Primary Key) của bảng chiều. Nó không có ý nghĩa về mặt nghiệp vụ, chỉ dùng để liên kết với Fact Table một cách hiệu quả tối ưu về mặt lưu trữ và tính toán.
* **Natural Key / Business Key (Khóa tự nhiên / Khóa nghiệp vụ):** Là mã định danh từ các hệ thống gốc (OLTP). Ví dụ: `customer_id` từ hệ thống CRM, `product_code` từ hệ thống ERP. Khóa này giúp map dữ liệu từ Source Data vào Data Warehouse.
* **Attributes (Thuộc tính):** Là các cột chứa mô tả chi tiết. Ví dụ: `customer_name`, `email`, `phone_number`. Chất lượng của kho dữ liệu (Data Warehouse) phụ thuộc rất nhiều vào độ phong phú và chính xác của các thuộc tính này.

## 3. Các loại Dimension Table phổ biến (Types of Dimensions)

### a. Conformed Dimension (Chiều chuẩn hóa)
Là các bảng chiều được dùng chung trên nhiều Fact Table khác nhau. Ví dụ bảng `dim_date` (thời gian) có thể được link tới cả `fact_sales` và `fact_inventory`. Việc sử dụng Conformed Dimension đảm bảo tính nhất quán (consistency) khi phân tích xuyên suốt nhiều mảng kinh doanh (Cross-process reporting).

### b. Role-playing Dimension (Chiều đóng nhiều vai trò)
Xảy ra khi một chiều duy nhất được join nhiều lần vào một Fact table với các vai trò khác nhau. 
Ví dụ: Bảng `fact_orders` có `order_date_key`, `ship_date_key`, `delivery_date_key`. Cả 3 key này đều link tới một bảng `dim_date` duy nhất. Bảng `dim_date` lúc này đóng vai trò là "Role-playing Dimension".

### c. Degenerate Dimension (Chiều suy biến)
Là một chiều được lưu trữ trực tiếp bên trong Fact Table, không có bảng chiều vật lý riêng biệt. Thường dùng cho các mã giao dịch như `invoice_number`, `order_id`, `ticket_number`. Nó không có các thuộc tính mô tả kèm theo ngoài chính nó.

### d. Junk Dimension (Chiều rác / Chiều hỗn hợp)
Trong hệ thống thường có rất nhiều các cột cờ (flags) dạng Yes/No, hoặc các trạng thái rời rạc (Status = New/Processing/Completed). Để tránh tạo ra quá nhiều bảng chiều nhỏ hoặc nhồi nhét vào Fact Table, người ta gom tất cả các tổ hợp trạng thái này vào một bảng duy nhất gọi là Junk Dimension.

### e. Slowly Changing Dimension (SCD - Chiều thay đổi chậm)
Dữ liệu trong bảng chiều có thể thay đổi theo thời gian (VD: Khách hàng chuyển nhà, Sản phẩm đổi danh mục). Việc quản lý sự thay đổi này gọi là SCD. Các loại SCD phổ biến bao gồm:
* **SCD Type 1 (Overwrite):** Ghi đè dữ liệu cũ bằng dữ liệu mới. Không lưu trữ lịch sử.
* **SCD Type 2 (Add new row):** Thêm dòng mới, giữ lại dòng cũ, thường dùng thêm các cột `start_date`, `end_date`, `is_current` để quản lý phiên bản. Đây là cách phổ biến nhất để tracking lịch sử dữ liệu trong DWH.
* **SCD Type 3 (Add new column):** Giữ lại giá trị cũ trong một cột mới (VD: `current_city`, `previous_city`).
* **SCD Type 4 (History Table):** Tách dữ liệu lịch sử ra một bảng riêng.
* **SCD Type 6:** Là sự kết hợp của Type 1, 2 và 3 (1+2+3 = 6).

## 4. Các bước thiết kế Dimension Table

Thiết kế chiều dữ liệu đóng vai trò quan trọng trong Dimensional Modeling (Mô hình hóa chiều) của Ralph Kimball.
1. **Xác định các quy trình nghiệp vụ (Business Processes):** Bước đầu tiên trong việc xây dựng Bảng chiều là hiểu rõ Bảng Fact, từ đó định hình các "Chiều" cần thiết.
2. **Khai báo mức độ hạt (Declare the Grain):** Bảng chiều sẽ cung cấp ngữ cảnh cho mức độ chi tiết nào của dữ liệu?
3. **Chọn bảng chiều (Identify the Dimensions):** Xác định các chiều (Date, Product, Customer, Store, v.v.).
4. **Xác định các thuộc tính (Identify Facts/Attributes):** Liệt kê danh sách các thuộc tính sẽ xuất hiện trong mỗi bảng chiều. Đảm bảo thuộc tính đủ phong phú và chi tiết. Cố gắng chuẩn hóa và làm sạch dữ liệu ở bước này (VD: `country` phải thống nhất là "Vietnam" hay "VN").

## 5. Ví dụ cấu trúc của một Bảng Chiều (Dim_Customer)

Dưới đây là ví dụ minh họa bằng mã SQL cho một Bảng Chiều khách hàng áp dụng theo phương pháp SCD Type 2:

```sql
CREATE TABLE dim_customer (
    customer_sk INT PRIMARY KEY,         -- Surrogate Key
    customer_id VARCHAR(50),             -- Natural Key (Business Key)
    first_name VARCHAR(100),             -- Attribute
    last_name VARCHAR(100),              -- Attribute
    email VARCHAR(255),                  -- Attribute
    phone VARCHAR(50),                   -- Attribute
    address VARCHAR(255),                -- Attribute
    city VARCHAR(100),                   -- Attribute
    country VARCHAR(100),                -- Attribute
    customer_segment VARCHAR(50),        -- Attribute
    
    -- SCD Type 2 tracking columns
    effective_start_date DATE,
    effective_end_date DATE,
    is_current_flag BOOLEAN
);
```

## 6. Tầm quan trọng trong hệ thống DWH

Dimension Tables là xương sống của mọi hệ thống phân tích. Một Bảng sự kiện (Fact Table) lưu trữ những con số định lượng, nhưng Bảng chiều mang đến những lời giải thích, phân loại, và ngữ cảnh để từ đó các nhà phân tích (Data Analyst) và các cấp quản lý có thể thấu hiểu trọn vẹn bức tranh kinh doanh. Sự thiết kế cẩn thận ở Bảng chiều - với Surrogate Keys, Conformed Dimensions, và các chiến lược SCD hợp lý - sẽ quyết định đến tính dễ sử dụng (usability), tốc độ truy vấn (performance) và tính chính xác của toàn bộ kho dữ liệu.

## Tài Liệu Tham Khảo
* [The Data Warehouse Toolkit - Ralph Kimball & Margy Ross](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
