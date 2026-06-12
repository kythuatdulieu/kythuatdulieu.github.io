const fs = require('fs');
const path = require('path');

// 1. Fix data-ownership.md
const file1 = '/home/duclinh/kythuatdulieu.github.io/src/content/docs/concepts/governance-metadata/data-ownership.md';
let content1 = fs.readFileSync(file1, 'utf8');

// Add definition in frontmatter
content1 = content1.replace(
  `seoTitle: "Data Ownership là gì? Ai chịu trách nhiệm quản lý dữ liệu?"\nmetaDescription: "Khái niệm Data Ownership (Quyền sở hữu dữ liệu): Định nghĩa, trách nhiệm của Data Owner và sự thay đổi tư duy trong kiến trúc Data Mesh hiện đại."\n---`,
  `seoTitle: "Data Ownership là gì? Ai chịu trách nhiệm quản lý dữ liệu?"\nmetaDescription: "Khái niệm Data Ownership (Quyền sở hữu dữ liệu): Định nghĩa, trách nhiệm của Data Owner và sự thay đổi tư duy trong kiến trúc Data Mesh hiện đại."\ndefinition: "Quyền sở hữu dữ liệu (Data Ownership) là việc xác định rõ cá nhân hoặc phòng ban nghiệp vụ chịu trách nhiệm pháp lý và có thẩm quyền ra quyết định đối với vòng đời, chất lượng và độ bảo mật của một tập dữ liệu."\n---`
);

// Rename pros/cons section and subheadings
content1 = content1.replace('## Ưu nhược điểm và Đánh đổi (Pros & Cons)', '## Điểm mạnh và điểm yếu');
content1 = content1.replace('### Ưu điểm:', '### Điểm mạnh (Pros)');
content1 = content1.replace('### Đánh đổi và Thách thức (Cons & Trade-offs):', '### Điểm yếu (Cons)');

// Add When to use and rename Interview section
const whenToUseAndInterview = `## Khi nào nên dùng

**Nên áp dụng cơ chế Data Ownership khi:**
* Doanh nghiệp có quy mô từ trung bình trở lên, bắt đầu có sự phân hóa rõ ràng giữa các phòng ban nghiệp vụ (Sales, Marketing, Finance, HR).
* Gặp tình trạng chất lượng dữ liệu kém mà không có ai đứng ra chịu trách nhiệm khắc phục.
* Triển khai mô hình phân tán [Data Mesh](/concepts/system-architecture/data-mesh/) để đẩy nhanh tốc độ khai thác giá trị dữ liệu.

**Không nên áp dụng khi:**
* Doanh nghiệp startup siêu nhỏ, nơi một người kiêm nhiệm từ lập trình đến phân tích dữ liệu, chưa cần phân định quyền sở hữu cứng nhắc để tối ưu tính linh hoạt.

---

## Trọng tâm ôn luyện phỏng vấn`;

content1 = content1.replace('## Góc phỏng vấn', whenToUseAndInterview);

// Update references
const referencesAndSummary = `## Các khái niệm liên quan

* [Data Governance (Quản trị dữ liệu)](/concepts/governance-metadata/data-governance/) - Khung quản trị đảm bảo dữ liệu nhất quán và bảo mật.
* [Data Catalog (Danh mục dữ liệu)](/concepts/governance-metadata/data-catalog/) - Hệ thống quản lý siêu dữ liệu và tìm kiếm tài sản dữ liệu.

## Tài liệu tham khảo

1. [AWS Data Governance Stewardship](https://docs.aws.amazon.com/whitepapers/latest/data-governance-on-aws/governance-roles-and-responsibilities.html) - AWS Whitepaper định nghĩa vai trò Data Owner, Steward, và Custodian.
2. [Google Cloud Data Governance Roles](https://cloud.google.com/architecture/data-governance-principles-delivery) - Xác định trách nhiệm và quyền sở hữu trong khung quản trị dữ liệu của GCP.
3. [Microsoft Azure Purview Governance Roles](https://azure.microsoft.com/en-us/services/purview/) - Định nghĩa vai trò quản lý quyền sở hữu tài sản dữ liệu trong Azure Purview.
4. [Snowflake Access Control & Ownership](https://docs.snowflake.com/en/user-guide/security-access-control-overview) - Mô hình quản lý quyền sở hữu đối tượng và phân quyền trong Snowflake.
5. [Apache Atlas Glossary & Ownership](https://atlas.apache.org/) - Lập bản đồ thuật ngữ nghiệp vụ và gắn nhãn sở hữu tài sản dữ liệu với Apache Atlas.
6. [Confluent Schema Registry Owners](https://docs.confluent.io/platform/current/schema-registry/index.html) - Quản lý quyền sở hữu schema trong hệ thống stream thời gian thực.

## English Summary`;

content1 = content1.replace(/## Đọc thêm và Tài liệu tham khảo[\s\S]*?## English Summary/, referencesAndSummary);

fs.writeFileSync(file1, content1, 'utf8');
console.log('Fixed data-ownership.md');


// 2. Fix metadata-management.md
const file2 = '/home/duclinh/kythuatdulieu.github.io/src/content/docs/concepts/governance-metadata/metadata-management.md';
let content2 = fs.readFileSync(file2, 'utf8');

// Add definition in frontmatter
content2 = content2.replace(
  `seoTitle: "Metadata Management - Quản lý siêu dữ liệu trong Data Engineering"\nmetaDescription: "Tìm hiểu Metadata Management (Quản lý siêu dữ liệu) là gì. Phân loại Technical, Business, Operational Metadata và vai trò cốt lõi trong Data Warehouse."\n---`,
  `seoTitle: "Metadata Management - Quản lý siêu dữ liệu trong Data Engineering"\nmetaDescription: "Tìm hiểu Metadata Management (Quản lý siêu dữ liệu) là gì. Phân loại Technical, Business, Operational Metadata và vai trò cốt lõi trong Data Warehouse."\ndefinition: "Quản lý siêu dữ liệu (Metadata Management) là quá trình thu thập, tích hợp và duy trì siêu dữ liệu (dữ liệu mô tả về dữ liệu) nhằm giúp doanh nghiệp dễ dàng tìm kiếm, hiểu và quản trị các tài sản thông tin."\n---`
);

// Rename pros/cons section and subheadings
content2 = content2.replace('## Đánh giá trade-off và kinh nghiệm thực tế', '## Điểm mạnh và điểm yếu');
content2 = content2.replace('### Những ưu điểm vượt trội (Pros)', '### Điểm mạnh (Pros)');
content2 = content2.replace('### Những hạn chế cần lưu ý (Cons)', '### Điểm yếu (Cons)');

// Rename When to use
content2 = content2.replace('## Khi nào nên áp dụng Metadata Management?', '## Khi nào nên dùng');

// Rename Interview Q&A H2
content2 = content2.replace('## Góc phỏng vấn: Câu hỏi thường gặp', '## Trọng tâm ôn luyện phỏng vấn');

// Rename English summary H2
content2 = content2.replace('## English summary', '## English Summary');

// Update references
const references2 = `## Tài liệu tham khảo

1. [AWS Glue Schema Registry](https://docs.aws.amazon.com/glue/latest/dg/schema-registry.html) - Quản lý siêu dữ liệu schema cho các ứng dụng truyền dữ liệu thời gian thực trên AWS.
2. [Google Cloud Dataplex Metadata Management](https://cloud.google.com/dataplex/docs/metadata-management) - Khám phá và quản lý siêu dữ liệu tự động trên GCP.
3. [Microsoft Azure Purview Catalog Metadata](https://azure.microsoft.com/en-us/services/purview/) - Đồng bộ và làm giàu siêu dữ liệu tự động trên Azure Purview.
4. [Snowflake Object Tagging](https://docs.snowflake.com/en/user-guide/object-tagging) - Tính năng gắn nhãn quản lý siêu dữ liệu cấp cột/bảng trong Snowflake.
5. [Apache Atlas Metadata Guide](https://atlas.apache.org/) - Cấu hình và phân tích siêu dữ liệu qua giao diện Apache Atlas.
6. [Confluent Schema Registry & Metadata](https://docs.confluent.io/platform/current/schema-registry/index.html) - Tài liệu quản lý metadata schema trong các luồng Kafka.`;

content2 = content2.replace(/## Tài liệu tham khảo[\s\S]*?## English Summary/, references2 + '\n\n## English Summary');

fs.writeFileSync(file2, content2, 'utf8');
console.log('Fixed metadata-management.md');
