---
title: "Các chiều chất lượng dữ liệu - Data Quality Dimensions"
category: "Data Quality"
difficulty: "Beginner"
tags: ["data-quality", "data-dimensions", "data-management", "dama"]
readingTime: "11 mins"
lastUpdated: 2026-06-07
seoTitle: "6 chiều chất lượng dữ liệu (Data Quality Dimensions) quan trọng nhất"
metaDescription: "Tìm hiểu chi tiết về 6 chiều (dimensions) đo lường chất lượng dữ liệu: Completeness, Accuracy, Consistency, Validity, Uniqueness, Timeliness kèm ví dụ thực tế."
---

# Các chiều chất lượng dữ liệu - Data Quality Dimensions

## Summary

Các chiều chất lượng dữ liệu (Data Quality Dimensions) là những khía cạnh, tiêu chí cốt lõi được sử dụng để định lượng và đánh giá mức độ "tốt" hay "xấu" của một tập dữ liệu. Theo tổ chức DAMA (Data Management Association), có 6 chiều chất lượng phổ biến và quan trọng nhất: Tính đầy đủ (Completeness), Tính chính xác (Accuracy), Tính nhất quán (Consistency), Tính hợp lệ (Validity), Tính duy nhất (Uniqueness) và Tính kịp thời (Timeliness). Việc hiểu và áp dụng các chiều này giúp đội ngũ dữ liệu biết chính xác cần phải viết bài kiểm thử (Data test) vào khía cạnh nào thay vì kiểm tra mò mẫm.

---

## Definition

**Data Quality Dimensions** là một hệ thống phân loại tiêu chuẩn giúp phân tách khái niệm trừu tượng "chất lượng dữ liệu" thành các thuộc tính có thể đo lường bằng số liệu (metrics) cụ thể. 

### 1. Tính đầy đủ (Completeness)
Dữ liệu có bị khuyết thiếu (NULL, rỗng) những trường thông tin quan trọng hay không?
* *Ví dụ*: Một bảng danh sách khách hàng nhưng 30% bị trống số điện thoại.

### 2. Tính chính xác (Accuracy)
Dữ liệu có phản ánh đúng thực tế của thực thể trên thế giới thật không?
* *Ví dụ*: Khách hàng tên "Nguyễn Văn A" nhưng hệ thống ghi nhận là "Nguyễn Van C". Cột này "Đầy đủ" (không rỗng), "Hợp lệ" (là chuỗi ký tự), nhưng "Không chính xác".

### 3. Tính nhất quán (Consistency)
Một mẩu thông tin khi xuất hiện ở nhiều nơi khác nhau có trùng khớp với nhau không? Hoặc quan hệ giữa 2 cột trong cùng 1 dòng có mâu thuẫn không?
* *Ví dụ*: Hệ thống nhân sự ghi nhận anh A đang ở trạng thái "Đã nghỉ việc", nhưng trên hệ thống trả lương, trạng thái của anh A lại là "Đang làm việc". Mâu thuẫn logic.

### 4. Tính hợp lệ (Validity)
Dữ liệu có tuân thủ đúng định dạng, kiểu dữ liệu, hoặc nằm trong tập hợp các giá trị được quy định (Domain of values) không?
* *Ví dụ*: Cột `age` (tuổi) chứa giá trị `-5` hoặc `ABC`.

### 5. Tính duy nhất (Uniqueness)
Mỗi thực thể (khách hàng, đơn hàng) trên thế giới thực chỉ được đại diện bằng một bản ghi (record) duy nhất trong cơ sở dữ liệu.
* *Ví dụ*: Một người đăng ký 2 tài khoản bằng 2 email khác nhau để nhận khuyến mãi, dẫn đến hệ thống nhận diện thành 2 người độc lập.

### 6. Tính kịp thời (Timeliness)
Dữ liệu có sẵn sàng đúng thời điểm mà người dùng cần để đưa ra quyết định hay không?
* *Ví dụ*: Báo cáo doanh thu cần có lúc 8h sáng hàng ngày để giao ban, nhưng pipeline chạy quá chậm đến 11h trưa mới ra số. Dữ liệu dù đúng 100% cũng trở thành rác.

---

## Why it exists

"Bạn không thể cải thiện những gì bạn không thể đo lường" (You can't improve what you don't measure).
Nếu sếp yêu cầu Data Engineer: "Hãy đảm bảo bảng Doanh thu có chất lượng tốt", đó là một yêu cầu vô nghĩa vì không thể lập trình được.
Bằng cách chia nhỏ "chất lượng" thành các chiều (Dimensions), ta có thể thiết lập các bài kiểm thử toán học rõ ràng. Ta có thể chạy truy vấn SQL để đo: Tỷ lệ `NULL` (Completeness), Tỷ lệ giá trị ngoài danh sách (Validity), Độ trễ cập nhật (Timeliness). Từ đó, ta xây dựng được bộ chỉ số KPI Chất lượng dữ liệu (Data Quality Scorecard) cho toàn tổ chức.

---

## How it works

Dưới đây là cách thực thi (Implementation) đo lường các chiều này bằng SQL/dbt:

* **Completeness**: Dùng hàm đếm NULL.
  `SELECT count(*) FROM table WHERE email IS NULL`
* **Validity**: Dùng Regex (biểu thức chính quy) hoặc toán tử IN.
  `SELECT * FROM table WHERE NOT REGEXP_CONTAINS(email, r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')`
* **Uniqueness**: Group by và lọc các bản ghi có Count > 1.
  `SELECT user_id, COUNT(*) FROM table GROUP BY user_id HAVING COUNT(*) > 1`
* **Timeliness**: So sánh chênh lệch thời gian tạo với thời gian xử lý.
  `SELECT max(updated_at) < current_timestamp() - interval '24' hour FROM table`

---

## Practical example

Xét một bản ghi dữ liệu khách hàng từ hệ thống:
`{id: 1, name: "Maria", age: 150, email: NULL, is_active: "Y", sign_up_date: "2026-06-08"}`

Đánh giá theo các chiều:
* **Completeness**: FAIL. Thiếu trường quan trọng `email`.
* **Validity**: FAIL. Giá trị `age = 150` không hợp lệ (vượt quá giới hạn logic sinh học người thường). Trường `sign_up_date` lại là ngày của ngày mai (vô lý).
* **Accuracy**: Khó đo lường bằng máy móc. Máy không thể biết người đó có thực sự tên là "Maria" ngoài đời thực hay không, phải xác thực đối chiếu với chứng minh nhân dân.
* **Consistency**: Giả sử trường `is_active` là "Y" nhưng trường `email_confirmed` (giả sử có) là "N". Điều này mâu thuẫn quy tắc kinh doanh (chưa xác nhận email thì không được kích hoạt).

---

## Best practices

* **Đo lường có chọn lọc**: Không phải cột dữ liệu nào cũng cần đo đủ 6 chiều. Ví dụ: cột `middle_name` (tên đệm) có thể chấp nhận tỉ lệ Completeness thấp vì không phải ai cũng có tên đệm. Cột `user_id` thì yêu cầu Completeness và Uniqueness 100%.
* **Xây dựng Data Quality Scorecard**: Hiển thị điểm số của các bảng quan trọng (Tier 1) lên một Dashboard tổng. Ví dụ: "Bảng Doanh thu: Completeness 99%, Uniqueness 100%, Timeliness 95%". Điều này giúp tạo động lực cho các đội ngũ nguồn (Data Producers) cải thiện dữ liệu của họ.
* **Khó nhất là Accuracy**: Đo lường tính chính xác rất khó và tốn kém vì bạn cần một nguồn dữ liệu "chuẩn vàng" (Golden Source) để đối chiếu chéo (Ví dụ: Mua dữ liệu của bên thứ 3 về để đối chiếu địa chỉ nhà xem khách hàng nhập đúng hay sai). Thường người ta tối ưu Validity trước thay vì theo đuổi Accuracy.

---

## Common mistakes

* **Nhầm lẫn giữa Validity (Hợp lệ) và Accuracy (Chính xác)**: Một khách hàng nhập tuổi là 35 (Hợp lệ - là số nguyên, nằm trong khoảng 0-100), nhưng thực tế anh ta mới 20 tuổi (Không chính xác). Data Tests tự động đa phần chỉ đo được Validity.
* **Bỏ qua Timeliness**: Tập trung quá nhiều vào việc làm sạch mã lỗi, đếm số mà quên mất thời gian phục vụ. Đối với hệ thống giao dịch chứng khoán, dữ liệu trễ 1 phút có hại ngang với dữ liệu sai.

---

## Trade-offs

### Ưu điểm
* Tạo ra ngôn ngữ chung thống nhất giữa đội ngũ Kỹ thuật và đội ngũ Kinh doanh khi tranh luận về sự cố dữ liệu.
* Làm cơ sở để viết các bộ công cụ kiểm thử tự động (Test Automation).

### Nhược điểm
* Việc áp dụng rập khuôn đo lường tất cả các chiều cho tất cả các bảng sẽ tiêu tốn tài nguyên hệ thống điện toán cực lớn (Cost/Compute) mà không mang lại giá trị kinh tế tương đương.

---

## When to use

* Sử dụng 6 chiều này làm nền tảng lý thuyết khi bạn thiết kế khung quản trị dữ liệu (Data Governance Framework) hoặc lập kế hoạch viết dbt tests.

## When not to use

* Khi bạn đang làm việc với dữ liệu phi cấu trúc như video, âm thanh (Image/Audio processing). Các chiều như Uniqueness, Validity truyền thống không áp dụng được vào một mảng điểm ảnh (pixel array).

---

## Related concepts

* [Data Quality](/concepts/data-quality)
* [Data Testing](/concepts/data-testing)
* [Data Profiling](/concepts/data-profiling)

---

## Interview questions

### 1. Sự khác biệt giữa Validity (Tính hợp lệ) và Accuracy (Tính chính xác) là gì? Tại sao Kỹ sư Dữ liệu thường chỉ tập trung vào Validity?
* **Người phỏng vấn muốn kiểm tra**: Sự nắm vững các chiều chất lượng và thực tế công việc kỹ thuật.
* **Gợi ý trả lời (Strong Answer)**: Validity kiểm tra xem giá trị có đúng với ĐỊNH DẠNG và QUY TẮC hệ thống hay không (vd: số điện thoại phải có 10 chữ số). Accuracy kiểm tra xem giá trị có đúng với THỰC TẾ hay không (số đó có đúng là của anh A không). Data Engineer thường dễ dàng viết SQL hoặc regex để kiểm tra Validity hoàn toàn tự động. Còn để kiểm tra Accuracy, ta thường cần con người gọi điện xác thực hoặc đối soát chéo phức tạp với cơ sở dữ liệu quốc gia (rất khó và tốn kém).

### 2. Làm thế nào để đo lường "Consistency" (Tính nhất quán) trong một Data Warehouse?
* **Người phỏng vấn muốn kiểm tra**: Tư duy truy vấn dữ liệu chéo.
* **Gợi ý trả lời (Strong Answer)**: Tính nhất quán có thể đo trong 1 bảng (Record-level) hoặc giữa nhiều bảng (Cross-table). Với Cross-table, ta sử dụng thao tác JOIN. Ví dụ: Tính tổng doanh thu ở bảng `Fact_Orders` (Hệ thống bán hàng) và đem JOIN đối chiếu với tổng tiền ghi nhận trong bảng `Fact_Invoices` (Hệ thống kế toán). Nếu chênh lệch (Delta) khác 0, ta kết luận dữ liệu không nhất quán.

---

## References

1. **DAMA-DMBOK** (Data Management Body of Knowledge) - Phần Data Quality Dimensions.
2. **"Data Quality Assessment"** - Arkady Maydanchik.

---

## English summary

Data Quality Dimensions are a standardized classification system used to objectively measure and evaluate the health of datasets. The core six dimensions defined by DAMA include Completeness (absence of missing values), Accuracy (reflection of real-world truth), Consistency (agreement across different data stores), Validity (conformity to defined formats and domains), Uniqueness (no duplicate representations of the same entity), and Timeliness (availability when needed). Understanding these dimensions allows Data Engineers to translate abstract "data health" goals into concrete, executable SQL tests.
