---
title: "Phân loại dữ liệu - Data Classification"
difficulty: "Intermediate"
tags: ["data-classification", "data-governance", "security", "pii", "compliance"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Phân loại dữ liệu (Data Classification) - Cẩm nang Data Governance"
metaDescription: "Tìm hiểu về Phân loại dữ liệu (Data Classification) trong quản trị dữ liệu, phương pháp phân loại, bảo vệ PII và các câu hỏi phỏng vấn thực tế."
description: "Khi dữ liệu trở thành nguồn tài sản chiến lược của doanh nghiệp, việc bảo vệ nó khỏi các cuộc tấn công bảo mật và rò rỉ thông tin là nhiệm vụ quan trọ..."
---



Data Classification (Phân loại dữ liệu) là bước dán nhãn mức độ nhạy cảm của dữ liệu (VD: Public, Internal, Confidential, Restricted). Những dữ liệu PII (Thông tin định danh cá nhân như SSN, Email, Số điện thoại) sẽ bị áp đặt các chính sách mã hóa cao nhất.

## Mở đầu
Trong kỷ nguyên dữ liệu, khi lượng thông tin doanh nghiệp thu thập ngày càng khổng lồ, không phải tất cả dữ liệu đều có giá trị và mức độ rủi ro giống nhau. Việc bảo vệ toàn bộ dữ liệu với cùng một mức độ bảo mật là không hiệu quả, tốn kém và đôi khi gây cản trở đến hoạt động kinh doanh. **Data Classification (Phân loại dữ liệu)** là quy trình tổ chức, dán nhãn và phân chia dữ liệu thành các cấp độ khác nhau dựa trên mức độ nhạy cảm, giá trị kinh doanh và các yêu cầu tuân thủ.

Quy trình này đóng vai trò nền tảng trong **Data Governance (Quản trị dữ liệu)** và **Data Security (Bảo mật dữ liệu)**. Phân loại dữ liệu giúp hệ thống biết được: dữ liệu này là gì, nó quan trọng đến mức nào, ai được phép truy cập và cần áp dụng các biện pháp bảo vệ nào.

## Các mức độ phân loại dữ liệu phổ biến (Data Classification Levels)
Mỗi tổ chức có thể định nghĩa các khung phân loại khác nhau, nhưng tiêu chuẩn chung thường bao gồm 4 cấp độ:

### 1. Public Data (Dữ liệu công khai)
* **Định nghĩa:** Dữ liệu có thể được truy cập tự do bởi công chúng mà không gây ra bất kỳ rủi ro nào cho tổ chức.
* **Ví dụ:** Thông tin trên website công ty, thông cáo báo chí, tài liệu marketing, báo cáo tài chính công khai.
* **Bảo mật:** Không yêu cầu mã hóa hoặc kiểm soát truy cập nghiêm ngặt. Tuy nhiên, vẫn cần đảm bảo tính toàn vẹn (Integrity) để tránh bị tin tặc sửa đổi trái phép.

### 2. Internal / Private Data (Dữ liệu nội bộ)
* **Định nghĩa:** Dữ liệu chỉ dành cho nhân viên hoặc các đối tác được ủy quyền. Việc rò rỉ có thể gây ra những ảnh hưởng tiêu cực nhẹ đến doanh nghiệp.
* **Ví dụ:** Sơ đồ tổ chức, chính sách nhân sự, tài liệu đào tạo nội bộ, email giao tiếp thông thường.
* **Bảo mật:** Yêu cầu xác thực cơ bản (Authentication). Thường được bảo vệ phía sau tường lửa và mạng nội bộ (Intranet).

### 3. Confidential / Sensitive Data (Dữ liệu bảo mật / nhạy cảm)
* **Định nghĩa:** Dữ liệu có giá trị cao, yêu cầu phân quyền nghiêm ngặt. Việc rò rỉ sẽ gây thiệt hại nghiêm trọng về tài chính, uy tín, hoặc dẫn đến các hình phạt pháp lý.
* **Ví dụ:** Chiến lược kinh doanh chưa công bố, mã nguồn (source code), hợp đồng với đối tác, bảng lương, báo cáo tài chính nội bộ.
* **Bảo mật:** Yêu cầu kiểm soát truy cập dựa trên vai trò (RBAC), mã hóa dữ liệu ở trạng thái nghỉ (data at rest) và trạng thái chuyển động (data in transit).

### 4. Restricted / Highly Confidential Data (Dữ liệu hạn chế)
* **Định nghĩa:** Cấp độ nhạy cảm cao nhất. Truy cập chỉ được cấp theo nguyên tắc "cần phải biết" (need-to-know). Sự xâm phạm sẽ dẫn đến hậu quả thảm khốc cho tổ chức.
* **Ví dụ:** PII (Thông tin định danh cá nhân), PHI (Thông tin sức khỏe), thông tin thẻ tín dụng (PCI), mật khẩu, khóa mã hóa (encryption keys).
* **Bảo mật:** Yêu cầu mã hóa mạnh mẽ, Data Masking (Che dấu dữ liệu), Tokenization (Mã hóa thay thế), Multi-Factor Authentication (MFA), và lưu vết truy cập (Audit Logging) chi tiết.

## Các loại dữ liệu đặc biệt nhạy cảm
Trong quá trình Data Classification, kỹ sư dữ liệu cần đặc biệt chú ý đến các định dạng dữ liệu được pháp luật bảo vệ nghiêm ngặt:

* **PII (Personally Identifiable Information - Thông tin định danh cá nhân):** Bất kỳ thông tin nào có thể trực tiếp hoặc gián tiếp nhận dạng một cá nhân. VD: Tên, CMND/CCCD, Số an sinh xã hội (SSN), Số điện thoại, Email cá nhân, Địa chỉ nhà.
* **PHI (Protected Health Information - Thông tin sức khỏe được bảo vệ):** Bệnh án, thông tin bảo hiểm y tế, kết quả xét nghiệm. Yêu cầu tuân thủ nghiêm ngặt tiêu chuẩn **HIPAA**.
* **PCI (Payment Card Information - Thông tin thẻ thanh toán):** Số thẻ tín dụng (PAN), mã CVV, lịch sử giao dịch. Yêu cầu tuân thủ tiêu chuẩn **PCI-DSS**.

## Quy trình phân loại dữ liệu (Data Classification Process)
Để triển khai Data Classification một cách có hệ thống, các tổ chức thường thực hiện theo 4 bước:

### 1. Khám phá dữ liệu (Data Discovery)
Trước khi phân loại, bạn cần biết dữ liệu của mình đang nằm ở đâu. Kỹ sư dữ liệu sử dụng các công cụ Data Catalog để quét các cơ sở dữ liệu, data lake, data warehouse, file server... để xây dựng bức tranh toàn cảnh về tài sản dữ liệu.
* **Công cụ:** Trình thu thập siêu dữ liệu (Metadata Crawlers).

### 2. Phân loại và Dán nhãn (Classification & Labeling)
Dựa trên kết quả khám phá, áp dụng các quy tắc (Rule-based) hoặc mô hình Machine Learning để tự động nhận dạng và dán nhãn dữ liệu.
* **Ví dụ:** Nếu một cột chứa chuỗi 16 số hợp lệ theo định dạng thẻ Visa/Mastercard -> Tự động dán nhãn "PCI-Restricted".
* **Metadata Tags:** Các thẻ này được lưu trữ trong Data Catalog để quản lý tập trung.

### 3. Áp dụng các biện pháp kiểm soát bảo mật (Applying Security Controls)
Dựa vào nhãn đã dán, hệ thống sẽ tự động thực thi các chính sách bảo mật:
* **Data Masking / Redaction:** Ẩn một phần dữ liệu (VD: `****-****-****-1234`).
* **Encryption:** Mã hóa các cột nhạy cảm bằng AWS KMS hoặc GCP Cloud KMS.
* **Row/Column-level Security:** Ẩn các cột hoặc dòng dữ liệu cụ thể đối với các Data Analyst không có đủ thẩm quyền.

### 4. Theo dõi và Đánh giá liên tục (Monitoring & Continuous Assessment)
Dữ liệu liên tục được tạo ra mới. Quy trình quét và phân loại phải diễn ra tự động thông qua các Data Pipeline để đảm bảo không có dữ liệu nhạy cảm nào bị "bỏ lọt" khi đưa vào Data Lake.

## Công nghệ và Công cụ hỗ trợ
* **Cloud Native:**
  * **AWS Macie:** Sử dụng Machine Learning để tự động phát hiện và bảo vệ dữ liệu nhạy cảm trên Amazon S3.
  * **Google Cloud DLP (Data Loss Prevention):** Công cụ cực kỳ mạnh mẽ để khám phá, phân loại và che giấu (masking) thông tin PII.
  * **Azure Purview:** Nền tảng quản trị dữ liệu toàn diện của Microsoft.
* **Open Source / Enterprise Data Catalogs:**
  * **Apache Atlas / Amundsen:** Quản lý metadata và dán nhãn dữ liệu.
  * **OpenMetadata / DataHub:** Nền tảng Data Catalog hiện đại, hỗ trợ quản lý Data Classification và tag-based security.
* **Data Warehouse Security:**
  * **Snowflake:** Cung cấp Dynamic Data Masking dựa trên tags.
  * **BigQuery:** Cung cấp Policy Tags (Column-level security) để kiểm soát truy cập PII.

## Thực hành tốt nhất (Best Practices) cho Data Engineer
1. **Phân loại càng sớm càng tốt (Shift-Left):** Thực hiện phân loại và mã hóa dữ liệu ngay tại thời điểm Ingestion (đưa vào hệ thống) thay vì đợi đến khi dữ liệu nằm ở Data Warehouse.
2. **Nguyên tắc Đặc quyền tối thiểu (Least Privilege):** Mặc định từ chối (Default Deny). Chỉ cấp quyền truy cập dữ liệu Restricted khi có lý do chính đáng và thời hạn cụ thể.
3. **Mô hình hóa dữ liệu tách biệt:** Lưu trữ dữ liệu PII trong các bảng (tables) hoặc khu vực riêng biệt (Secure Zone), sử dụng surrogate keys để kết nối thay vì để rải rác PII trên toàn bộ kho dữ liệu.
4. **Tự động hóa:** Tích hợp Data Classification vào quá trình CI/CD của Data Pipeline. Nếu một schema mới chứa tên cột là `credit_card` được deploy, pipeline tự động gắn tag và áp dụng masking.

## Câu hỏi phỏng vấn Data Engineer về Data Classification
1. **Làm thế nào để bạn xử lý dữ liệu PII khi ingest từ một nguồn SQL Database vào Data Lake (S3)?**
   * *Gợi ý trả lời:* Thực hiện giải mã / mã hóa lại (re-encryption) hoặc hashing / masking ngay trên dòng chảy dữ liệu (ví dụ: dùng Spark/Flink hoặc AWS Glue) trước khi ghi xuống S3. Dán nhãn metadata để quản trị viên nắm được.
2. **Giải thích sự khác biệt giữa Data Masking, Tokenization và Encryption.**
   * *Gợi ý trả lời:* Masking là che đi (không phục hồi được), Tokenization là thay thế bằng một chuỗi ngẫu nhiên có độ dài tương đương (lưu map ở một vault an toàn), Encryption là dùng thuật toán toán học cùng với key (có thể giải mã nếu có key).
3. **Nếu một Data Analyst phàn nàn rằng họ không thể join các bảng vì cột User ID đã bị hashed, bạn sẽ giải quyết thế nào?**
   * *Gợi ý trả lời:* Sử dụng kỹ thuật Hashing có muối cố định (Deterministic Hashing) để cùng một User ID luôn ra cùng một mã hash, hoặc phân quyền theo View để họ chỉ thấy dữ liệu họ cần, không cho truy cập bảng raw chứa PII.

## Tài Liệu Tham Khảo
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
