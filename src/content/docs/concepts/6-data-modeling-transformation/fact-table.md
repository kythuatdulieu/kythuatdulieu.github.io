---
title: "Bảng sự kiện - Fact Table"
difficulty: "Beginner"
tags: ["data-warehouse", "fact-table", "dimensional-modeling", "star-schema", "metrics"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Fact Table (Bảng sự kiện) là gì? Phân loại Fact trong Data Warehouse"
metaDescription: "Tìm hiểu chi tiết về Bảng sự kiện (Fact Table) trong Data Warehouse: Định nghĩa, cấu trúc, các loại Fact (Additive, Semi-Additive, Non-Additive) và Grain."
description: "Mỗi khi bạn đi siêu thị và nghe tiếng 'bíp' vang lên lúc nhân viên thu ngân quét mã vạch trên sản phẩm, một giao dịch mới đã được ghi nhận. Trong thế giới Dữ liệu, những sự kiện như vậy được lưu trữ ở đâu? Câu trả lời chính là Fact Table."
---



Mỗi khi bạn đi siêu thị và nghe tiếng "bíp" vang lên lúc nhân viên thu ngân quét mã vạch trên sản phẩm, một giao dịch mới đã được ghi nhận. Giao dịch này bao gồm số lượng sản phẩm, giá tiền, thời gian mua và người mua. Trong thế giới kho dữ liệu (Data Warehouse), những sự kiện định lượng này được lưu trữ trong **Bảng sự kiện (Fact Table)**.

Fact Table là trung tâm của mô hình **Star Schema** (Mô hình hình sao) trong Dimensional Modeling do Ralph Kimball đề xuất. Bảng này chứa các **sự kiện kinh doanh đã xảy ra** kèm theo các chỉ số đo lường (Metrics/Measures) như Doanh thu, Số lượng. Khác với Dimension Table (Bảng chiều) thường tương đối ổn định, Fact Table liên tục phình to theo thời gian khi doanh nghiệp hoạt động và sinh ra dữ liệu mới.

---

## 1. Cấu trúc của một Fact Table

Một Fact Table điển hình thường bao gồm ba thành phần chính:

### a. Khóa ngoại (Foreign Keys)
Fact Table chứa rất nhiều khóa ngoại. Mỗi khóa ngoại sẽ liên kết đến Khóa chính (Primary Key) của một Dimension Table (Bảng chiều). Sự kết hợp của các khóa ngoại này giúp giải thích "ngữ cảnh" của sự kiện (Ai, Cái gì, Ở đâu, Khi nào). 
*Ví dụ: `customer_id`, `product_id`, `store_id`, `date_id`.*

### b. Các độ đo định lượng (Measures/Facts)
Đây là phần cốt lõi chứa các con số phản ánh quy mô của sự kiện kinh doanh. Các con số này thường có thể tính toán, tổng hợp (Sum, Average, Count) để tạo ra các báo cáo.
*Ví dụ: `sales_amount`, `quantity_sold`, `discount_amount`.*

### c. Grain (Độ hạt dữ liệu)
Grain là **mức độ chi tiết nhất** mà một dòng (row) trong Fact Table biểu diễn. Xác định Grain là bước quan trọng nhất trước khi thiết kế bất kỳ bảng sự kiện nào.
*Ví dụ: "Một dòng trong Fact table tương ứng với một sản phẩm được quét trong một hóa đơn tại một cửa hàng vào một thời điểm nhất định".*

---

## 2. Các loại độ đo (Measures/Facts) trong Fact Table

Dựa vào khả năng cộng gộp (aggregation), các độ đo trong Fact Table được chia làm 3 loại chính:

### a. Additive Facts (Có thể cộng gộp hoàn toàn)
Là các con số có thể được cộng (SUM) theo MỌI chiều (Dimension) một cách hợp lý và mang lại ý nghĩa kinh doanh.
* **Ví dụ:** `quantity_sold` (số lượng bán), `sales_amount` (doanh thu). Bạn có thể cộng tổng doanh thu theo ngày, theo cửa hàng, theo sản phẩm, hoặc theo khách hàng. Tất cả đều ra kết quả đúng.

### b. Semi-Additive Facts (Cộng gộp một phần)
Là các con số có thể được cộng gộp qua MỘT SỐ chiều, nhưng không thể cộng qua tất cả các chiều (thường là không thể cộng theo chiều Thời gian - Time Dimension).
* **Ví dụ:** Số dư tài khoản ngân hàng (`account_balance`), Tồn kho (`inventory_level`). Bạn có thể cộng số lượng tồn kho của tất cả các cửa hàng trong một ngày cụ thể. Tuy nhiên, nếu bạn cộng tồn kho của một cửa hàng trong 30 ngày của tháng, con số đó là hoàn toàn vô nghĩa. Đối với semi-additive fact, người ta thường dùng phép tính trung bình (Average) hoặc lấy giá trị cuối kỳ (Last value) khi đi qua chiều thời gian.

### c. Non-Additive Facts (Không thể cộng gộp)
Là các con số KHÔNG THỂ cộng gộp theo bất kỳ chiều nào. Phép cộng sẽ cho ra kết quả vô nghĩa.
* **Ví dụ:** Tỷ lệ phần trăm (như tỷ suất lợi nhuận `margin_percentage`), Đơn giá (`unit_price`), hoặc Nhiệt độ trung bình ngày. Thay vì lưu phần trăm trực tiếp, best practice là nên lưu Tử số (Numerator) và Mẫu số (Denominator) là các Additive Facts, để lúc lên báo cáo chúng ta cộng tổng tử số và mẫu số rồi mới chia ra phần trăm.

---

## 3. Phân loại Fact Table (Types of Fact Tables)

Tùy vào cách hệ thống ghi nhận sự kiện, chúng ta có 4 loại Fact Table phổ biến:

### a. Transaction Fact Table (Bảng sự kiện giao dịch)
Đây là loại phổ biến nhất. Mỗi dòng ghi nhận **một sự kiện duy nhất** xảy ra tại một thời điểm cụ thể. Dữ liệu một khi đã ghi vào (Insert) thì hiếm khi bị cập nhật (Update).
* **Đặc điểm:** Độ chi tiết (Grain) rất nhỏ, dữ liệu phát triển cực nhanh, kích thước bảng có thể lên đến hàng tỷ dòng.
* **Ví dụ:** Bảng giao dịch bán lẻ (`retail_sales_fact`), nhật ký truy cập web (`web_logs`).

### b. Periodic Snapshot Fact Table (Bảng sự kiện chụp nhanh định kỳ)
Loại này ghi lại **trạng thái của một quy trình tại một thời điểm định kỳ** (ví dụ: cuối ngày, cuối tuần, cuối tháng).
* **Đặc điểm:** Không quan tâm quá trình diễn ra thế nào, chỉ lấy "bức ảnh" chốt sổ cuối kỳ. Bảng này giúp trả lời các câu hỏi về xu hướng theo thời gian rất tốt nhưng dung lượng cũng tăng đều đặn mỗi kỳ.
* **Ví dụ:** Số dư tài khoản ngân hàng cuối ngày (`daily_account_balances`), Báo cáo tồn kho cuối tháng (`monthly_inventory_snapshot`).

### c. Accumulating Snapshot Fact Table (Bảng sự kiện chụp nhanh lũy kế)
Loại bảng này dùng để theo dõi **vòng đời của một quy trình** có điểm khởi đầu và kết thúc rõ ràng, bao gồm nhiều bước. Mỗi dòng đại diện cho toàn bộ vòng đời của một đối tượng (như một đơn hàng, một quy trình bồi thường bảo hiểm).
* **Đặc điểm:** Dòng dữ liệu được Insert ở bước đầu tiên của quy trình, và liên tục bị **Update** khi quy trình chuyển sang các bước tiếp theo. Nó có rất nhiều khóa ngày tháng (date foreign keys) để ghi lại thời điểm hoàn thành mỗi mốc.
* **Ví dụ:** Quy trình xử lý đơn hàng: Ngày đặt hàng -> Ngày đóng gói -> Ngày giao hàng -> Ngày thanh toán.

### d. Factless Fact Table (Bảng sự kiện không có độ đo)
Là Fact table chứa toàn khóa ngoại (Foreign Keys) mà KHÔNG CÓ (hoặc có rất ít) con số độ đo định lượng nào.
* **Đặc điểm:** Dùng để ghi nhận một sự kiện đã xảy ra, hoặc một mối quan hệ (coverage) trong một khoảng thời gian.
* **Ví dụ:** Sự kiện sinh viên tham gia một lớp học (`student_attendance`). Chúng ta chỉ cần biết `student_id`, `class_id`, `date_id` là đủ để đếm số lượng người đi học (bằng cách COUNT dòng). Hoặc ví dụ một sản phẩm có được trưng bày tại một cửa hàng vào một ngày nào đó (nhưng không bán được cái nào).

---

## 4. Bốn bước thiết kế Fact Table (Kimball's 4-Step Process)

Để xây dựng một Fact Table chuẩn chỉnh, Ralph Kimball đã định nghĩa quy trình 4 bước bắt buộc:

1. **Chọn quy trình nghiệp vụ (Select the Business Process):**
   Xác định rõ chúng ta đang mô hình hóa hoạt động kinh doanh nào (VD: Mua hàng, Bán hàng, Xử lý bảo hiểm).
   
2. **Xác định Độ hạt (Declare the Grain):**
   Quyết định mức độ chi tiết chính xác của một dòng trong Fact table. *"Đừng bao giờ bắt đầu thiết kế mà không chốt Grain"*.
   
3. **Xác định các Bảng chiều (Identify the Dimensions):**
   Dựa vào Grain đã chọn, trả lời các câu hỏi Ai, Cái gì, Ở đâu, Khi nào để chọn ra các Dimension Tables phù hợp.
   
4. **Xác định các Độ đo (Identify the Facts):**
   Xác định các chỉ số định lượng sẽ xuất hiện trong Fact Table dựa trên quy trình nghiệp vụ.

---

## 5. Một số Best Practices thiết kế Fact Table

- **Tránh dùng giá trị NULL trong Fact table:** Thay vì để NULL trong các khóa ngoại, hãy dùng các khóa mặc định từ Dimension (VD: -1 hoặc 0 đại diện cho "Unknown" hoặc "Not Applicable").
- **Không lưu trữ văn bản (Text/String) dài:** Fact table nên càng "gọn" càng tốt. Các thuộc tính mô tả (Text) nên được đẩy sang Dimension Table để tối ưu dung lượng và tốc độ truy vấn.
- **Đồng nhất Grain cho mọi độ đo:** Tất cả các độ đo (measures) nằm trong cùng một Fact table bắt buộc phải có cùng một mức độ chi tiết (Grain). Đừng bao giờ mix độ đo tổng của tháng vào cùng một dòng với độ đo chi tiết của ngày.
- **Tối ưu hóa kiểu dữ liệu:** Fact table có thể chứa hàng tỷ dòng, do đó việc thu nhỏ kiểu dữ liệu (`INT` thay vì `BIGINT` nếu không cần thiết, `DECIMAL/NUMERIC` thay cho `FLOAT` ở những dữ liệu tài chính) sẽ giúp tiết kiệm đáng kể dung lượng lưu trữ và RAM khi truy vấn.

---

## Tài Liệu Tham Khảo
* [The Data Warehouse Toolkit - Ralph Kimball & Margy Ross](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
