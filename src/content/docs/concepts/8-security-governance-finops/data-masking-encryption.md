---
title: "Data Masking & Encryption"
difficulty: "Advanced"
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Data Masking & Encryption - Kỹ thuật che giấu và mã hoá dữ liệu"
metaDescription: "Tìm hiểu chuyên sâu về Data Masking và Encryption trong Data Engineering: bảo vệ dữ liệu PII/PHI ở trạng thái nghỉ (At-rest), di chuyển (In-transit) và ứng dụng thực tiễn."
description: "Che giấu và mã hoá dữ liệu nhạy cảm PII ở trạng thái nghỉ (At-rest) và di chuyển (In-transit)."
---



Bảo mật dữ liệu là một trong những trụ cột quan trọng nhất của Data Governance và Security. Trong môi trường dữ liệu hiện đại, nơi hàng petabyte dữ liệu được thu thập, lưu trữ và xử lý mỗi ngày, việc bảo vệ thông tin nhạy cảm của người dùng (như PII, PHI, thông tin tài chính) là bắt buộc để tuân thủ các quy định pháp lý (GDPR, CCPA, HIPAA) và duy trì niềm tin của khách hàng.

Hai kỹ thuật cốt lõi thường được sử dụng để bảo vệ dữ liệu là **Data Masking (Che giấu dữ liệu)** và **Data Encryption (Mã hóa dữ liệu)**. Mặc dù cả hai đều phục vụ mục đích bảo mật, chúng có cơ chế hoạt động và Use Case hoàn toàn khác nhau.

---

## 1. Data Encryption (Mã hóa dữ liệu)

**Encryption** là quá trình sử dụng các thuật toán toán học để biến đổi dữ liệu có thể đọc được (plaintext) thành một dạng không thể đọc được (ciphertext). Để khôi phục dữ liệu về dạng ban đầu, bạn cần một khóa giải mã (decryption key) tương ứng.

### 1.1. Các trạng thái mã hóa (Encryption States)

Trong Data Engineering, dữ liệu cần được bảo vệ ở ba trạng thái chính:

*   **Encryption In-transit (Mã hóa khi di chuyển):**
    *   Bảo vệ dữ liệu khi nó đang được truyền qua mạng (giữa client và server, hoặc giữa các microservices).
    *   **Công nghệ:** TLS/SSL (Transport Layer Security).
    *   **Ví dụ:** Dữ liệu di chuyển từ Kafka đến Spark Streaming hoặc từ Web App đến API Gateway phải luôn đi qua HTTPS/TLS.
*   **Encryption At-rest (Mã hóa ở trạng thái nghỉ):**
    *   Bảo vệ dữ liệu khi nó được lưu trữ trên ổ đĩa, cơ sở dữ liệu, Data Lake (S3, GCS), hoặc Data Warehouse.
    *   **Công nghệ:** AES-256 (Advanced Encryption Standard), TDE (Transparent Data Encryption) trong các RDBMS.
    *   **Ví dụ:** Bật tính năng Server-Side Encryption (SSE) trên Amazon S3 với AWS KMS (`SSE-KMS`) hoặc `SSE-S3`.
*   **Encryption In-use (Mã hóa khi sử dụng) - Advanced:**
    *   Bảo vệ dữ liệu khi nó đang được xử lý trong RAM hoặc CPU.
    *   **Công nghệ:** Confidential Computing (sử dụng phần cứng như Intel SGX hoặc AMD SEV), Homomorphic Encryption (Mã hóa đồng cấu - cho phép tính toán trực tiếp trên ciphertext mà không cần giải mã).

### 1.2. Key Management & Envelope Encryption

Mã hóa chỉ an toàn khi **Khóa (Key)** được bảo vệ. Các hệ thống lớn thường sử dụng **KMS (Key Management Service)** như AWS KMS, Google Cloud KMS, hoặc HashiCorp Vault.

**Envelope Encryption** là một best practice trong việc quản lý khóa:
1.  Dữ liệu được mã hóa bằng một **Data Key** (DEK - Data Encryption Key).
2.  Bản thân Data Key lại được mã hóa bằng một **Master Key** (KEK - Key Encryption Key).
3.  Chỉ KEK mới được lưu trữ an toàn trong KMS. Hệ thống chỉ cần gọi KMS để giải mã DEK, sau đó dùng DEK ở local memory để giải mã khối lượng dữ liệu lớn, giúp tối ưu hiệu suất và giảm tải cho KMS.

---

## 2. Data Masking (Che giấu dữ liệu)

**Data Masking** (hay còn gọi là Data Obfuscation) là kỹ thuật thay thế dữ liệu nhạy cảm bằng dữ liệu giả nhưng vẫn giữ nguyên cấu trúc hoặc tính chân thực của dữ liệu để phục vụ cho các mục đích như phát triển, kiểm thử (testing), hoặc phân tích (analytics) mà không làm lộ thông tin thật.

Ví dụ: Thay thế số thẻ tín dụng `4111 2222 3333 4444` thành `**** **** **** 4444`.

### 2.1. Phân loại Data Masking

*   **Static Data Masking (SDM):**
    *   Dữ liệu được làm rối ở trạng thái nghỉ trước khi được sao chép sang môi trường khác.
    *   **Use case:** Copy dữ liệu từ môi trường Production xuống môi trường Staging/Dev để đội ngũ kỹ sư kiểm thử. Dữ liệu thực đã bị thay đổi vĩnh viễn ở môi trường đích.
*   **Dynamic Data Masking (DDM):**
    *   Dữ liệu trên ổ đĩa vẫn là dữ liệu thực, nhưng khi người dùng truy vấn (SELECT), hệ thống sẽ che giấu dữ liệu on-the-fly (ngay lúc chạy) dựa trên Role và Permission của người dùng.
    *   **Use case:** Cung cấp dữ liệu cho Data Analyst. Analyst vẫn có thể join bảng dựa trên email (đã được hash/mask), nhưng không thể đọc email thật.

### 2.2. Các kỹ thuật Masking phổ biến

1.  **Substitution (Thay thế):** Thay thế dữ liệu thật bằng dữ liệu giả từ một từ điển (VD: Đổi tên "Nguyễn Văn A" thành "Trần Thị B").
2.  **Shuffling (Xáo trộn):** Hoán đổi các giá trị trong cùng một cột cho các bản ghi khác nhau. Phù hợp để giữ nguyên phân phối thống kê của cột.
3.  **Variance/Number Variance:** Áp dụng một độ lệch ngẫu nhiên vào dữ liệu số (VD: Lương $5000 có thể biến thành một số ngẫu nhiên trong khoảng $4500 - $5500). Hữu ích cho phân tích tài chính vĩ mô.
4.  **Masking Out (Che khuất một phần):** Thay thế một phần chuỗi bằng ký tự đặc biệt (VD: `X` hoặc `*`). Dùng nhiều cho số điện thoại, số thẻ tín dụng.
5.  **Nulling Out (Làm trống):** Thay thế toàn bộ giá trị nhạy cảm bằng `NULL`.

---

## 3. Tokenization & Format-Preserving Encryption

Bên cạnh Encryption và Masking cơ bản, có hai kỹ thuật nâng cao thường gặp:

*   **Tokenization (Mã thông báo hóa):** Thay thế dữ liệu nhạy cảm (như số thẻ tín dụng) bằng một chuỗi ngẫu nhiên gọi là Token. Không có thuật toán toán học nào có thể đảo ngược Token thành dữ liệu thật; hệ thống phải duy trì một cơ sở dữ liệu ánh xạ (Token Vault) được bảo mật nghiêm ngặt. Hệ thống thanh toán (Payment Gateways) thường dùng cách này.
*   **Format-Preserving Encryption (FPE):** Mã hóa dữ liệu nhưng vẫn giữ nguyên định dạng (chiều dài, kiểu ký tự). Ví dụ: Một chuỗi 16 chữ số thẻ tín dụng khi mã hóa vẫn trả ra 16 chữ số khác. Điều này giúp các hệ thống Legacy (hệ thống cũ) không bị lỗi validation khi nhận dữ liệu mã hóa.

---

## 4. Triển khai trong Data Pipeline & Data Warehouse

### Snowflake
Snowflake cung cấp **Dynamic Data Masking** tích hợp sẵn thông qua Masking Policies. Bạn có thể định nghĩa các hàm policy dựa trên Role:
```sql
CREATE OR REPLACE MASKING POLICY email_mask AS (val string) RETURNS string ->
  CASE
    WHEN CURRENT_ROLE() IN ('ANALYST_FULL_ACCESS', 'ACCOUNTADMIN') THEN val
    ELSE '***@***.com'
  END;

-- Áp dụng vào cột
ALTER TABLE users MODIFY COLUMN email SET MASKING POLICY email_mask;
```

### Google BigQuery
BigQuery hỗ trợ **Column-level Security** thông qua **Policy Tags**. Bạn tạo Data Taxonomy, gán tag (ví dụ: `High Security`, `PII`) cho các cột. Sau đó, quản lý quyền truy cập qua IAM Data Policies để quyết định ai có thể thấy dữ liệu gốc, ai thấy dữ liệu đã bị mask (Data Masking Rules trong BigQuery).

### Apache Spark / Databricks
Trong Spark, bạn có thể áp dụng các hàm UDF (User Defined Functions) để mask dữ liệu trong quá trình ETL (trước khi ghi ra Data Lake). Databricks cũng cung cấp Dynamic Data Masking cho môi trường Unity Catalog để kiểm soát quyền truy cập fine-grained (chi tiết đến từng cột/dòng).

---

## 5. Best Practices & Khuyến nghị

1.  **Phân loại dữ liệu (Data Discovery & Classification):** Trước khi có thể bảo vệ, bạn phải biết dữ liệu nhạy cảm nằm ở đâu. Sử dụng các công cụ Data Catalog (như AWS Macie, Google Cloud DLP, Amundsen) để tự động quét và gắn thẻ (tag) dữ liệu PII/PHI.
2.  **Nguyên tắc Least Privilege (Đặc quyền tối thiểu):** Chỉ cấp quyền giải mã hoặc xem dữ liệu không bị mask cho những users/services thực sự cần nó cho công việc.
3.  **Tách biệt nhiệm vụ (Separation of Duties):** Quản trị viên cơ sở dữ liệu (DBA) có quyền quản lý hệ thống nhưng không nhất thiết phải có quyền xem (giải mã) dữ liệu kinh doanh nhạy cảm.
4.  **Audit và Monitoring:** Ghi log liên tục về việc ai đã truy cập/giải mã thông tin gì, sử dụng các dịch vụ như AWS CloudTrail hoặc GCP Cloud Audit Logs. Đặt cảnh báo (alert) cho những hành vi truy cập bất thường.
5.  **Luân chuyển khóa (Key Rotation):** Thiết lập tự động luân chuyển khóa mã hóa (KMS auto-rotation) định kỳ (ví dụ: mỗi 90 ngày) hoặc ngay khi nghi ngờ có rủi ro bảo mật.

---

## Tài Liệu Tham Khảo
* [NIST Cryptographic Standards and Guidelines](https://csrc.nist.gov/Projects/cryptographic-standards-and-guidelines)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Snowflake Documentation: Dynamic Data Masking](https://docs.snowflake.com/en/user-guide/security-column-ddm-intro)
* **Google Cloud Architecture Center: Data anonymization and masking**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
