const fs = require('fs');
const path = require('path');

const data = {
  "concepts/7-dataops-orchestration-quality/data-observability.md": "Data Observability (Khả năng quan sát dữ liệu) tương tự như Application Observability trong DevOps. Nó sử dụng 5 trụ cột (Data Quality, Freshness, Volume, Schema, Lineage) để giám sát liên tục sức khỏe của hệ thống dữ liệu, cho phép các kỹ sư biết ngay hệ thống bị lỗi ở đâu trước khi Business Users kịp phàn nàn.",
  "concepts/7-dataops-orchestration-quality/data-profiling.md": "Data Profiling là quá trình dùng các công cụ phân tích tự động (như Pandas Profiling, Great Expectations) để hiểu rõ hình hài của dữ liệu thô: tỷ lệ Null, giá trị Min/Max, phân phối (Distribution). Đây là bước đầu tiên bắt buộc trước khi viết bất kỳ Data Test nào.",
  "concepts/7-dataops-orchestration-quality/data-quality-dimensions.md": "Chất lượng dữ liệu được đo lường qua 6 chiều (Dimensions) chuẩn mực: Tính chính xác (Accuracy), Tính đầy đủ (Completeness), Tính nhất quán (Consistency), Tính kịp thời (Timeliness), Tính hợp lệ (Validity), và Tính duy nhất (Uniqueness).",
  "concepts/7-dataops-orchestration-quality/data-quality.md": "Data Quality (Chất lượng dữ liệu) là nền móng của sự tin cậy. 'Rác vào thì rác ra' (Garbage In, Garbage Out) - Dù mô hình Machine Learning của bạn có tiên tiến đến đâu, nếu Data Quality thấp (thiếu dữ liệu, sai định dạng), mọi phân tích đều trở nên vô giá trị.",
  "concepts/7-dataops-orchestration-quality/data-reconciliation.md": "Data Reconciliation (Đối soát dữ liệu) là quá trình kiểm tra chéo (Cross-check) dữ liệu ở các điểm khác nhau trong pipeline để đảm bảo tính toàn vẹn. Ví dụ: Đảm bảo tổng doanh thu ở bảng Oracle ban đầu phải khớp chính xác đến từng xu với bảng Fact ở Snowflake cuối cùng.",
  "concepts/7-dataops-orchestration-quality/data-testing.md": "Data Testing (Kiểm thử dữ liệu) là việc viết các kịch bản kiểm tra (Assertions) trên dữ liệu thay vì trên mã nguồn. Ví dụ: Kiểm tra 'Cột ID không bao giờ Null', 'Tổng giá trị đơn hàng > 0'. Framework như dbt-test hay Great Expectations là tiêu chuẩn cho Data Testing.",
  "concepts/7-dataops-orchestration-quality/dbt-testing.md": "dbt Testing cung cấp một cơ chế tuyệt vời để kiểm thử dữ liệu ngay trong quá trình chạy Pipeline. Nó bao gồm Singular Tests (viết SQL tùy chỉnh) và Generic Tests (Not Null, Unique, Accepted Values, Relationships), giúp chặn dữ liệu bẩn xâm nhập vào kho dữ liệu cốt lõi.",
  "concepts/7-dataops-orchestration-quality/distribution-drift.md": "Distribution Drift (Sự trôi dạt phân phối) xảy ra khi hình thù thống kê của dữ liệu thay đổi ngầm theo thời gian (VD: Khách hàng mua sắm chuyển từ ban ngày sang ban đêm). Điều này khiến các mô hình Machine Learning bị suy giảm độ chính xác mà không hề báo lỗi kỹ thuật.",
  "concepts/7-dataops-orchestration-quality/freshness-monitoring.md": "Freshness Monitoring (Giám sát độ tươi của dữ liệu) đo lường xem bản cập nhật gần nhất của một bảng dữ liệu đã trôi qua bao lâu. Nếu một Dashboard báo cáo yêu cầu độ tươi < 1 giờ, nhưng pipeline chạy bị kẹt khiến độ tươi lên tới 3 giờ, hệ thống sẽ tự động bắn cảnh báo (SLA Miss).",
  "concepts/7-dataops-orchestration-quality/orchestration.md": "Data Orchestration là nhạc trưởng (Conductor) điều phối một bản giao hưởng gồm các công cụ rời rạc. Thay vì dùng Cron Job rải rác, Orchestrator (như Airflow, Dagster, Prefect) quản lý thứ tự chạy, sự phụ thuộc, thử lại khi lỗi (Retries) cho toàn bộ Data Pipeline tại một nơi tập trung.",
  "concepts/7-dataops-orchestration-quality/retries-sla.md": "Retries (Cố thử lại) là cơ chế thiết yếu trong Data Pipeline để chống lại các lỗi mạng tạm thời (Transient Errors). Đi kèm là SLA (Service Level Agreement - Cam kết cấp độ dịch vụ), định nghĩa thời hạn chót mà Pipeline phải hoàn thành, ví dụ 'Báo cáo doanh thu phải có trước 8:00 sáng'.",
  "concepts/7-dataops-orchestration-quality/root-cause-analysis.md": "Root Cause Analysis (RCA - Phân tích nguyên nhân gốc rễ) là quá trình truy vết (Troubleshooting) khi sự cố xảy ra. Trong Data Engineering, Data Lineage kết hợp với Data Observability Tool giúp đội ngũ thu hẹp phạm vi từ hàng ngàn task đang chạy để tìm ra đúng đoạn code hoặc dữ liệu thô gây lỗi.",
  "concepts/7-dataops-orchestration-quality/schema-drift.md": "Schema Drift (Trôi dạt cấu trúc) là kẻ thù số 1 làm gãy Data Pipeline. Nó xảy ra khi đội ngũ kỹ sư Backend tự ý thay đổi cấu trúc bảng nguồn (Đổi tên cột, xóa cột, đổi kiểu dữ liệu) mà không báo trước cho team Data, dẫn đến lỗi dây chuyền hàng loạt.",
  "concepts/7-dataops-orchestration-quality/sensors.md": "Sensors (Cảm biến) trong Airflow là một loại Task đặc biệt. Thay vì thực thi mã nguồn, nó có nhiệm vụ nằm chờ (Polling) liên tục cho đến khi một sự kiện xảy ra (Ví dụ: Một file CSV vừa được đối tác đẩy lên S3) rồi mới kích hoạt luồng xử lý tiếp theo.",
  "concepts/7-dataops-orchestration-quality/software-defined-assets.md": "Software-Defined Assets (Tài sản dữ liệu định nghĩa bằng phần mềm) là triết lý trung tâm của Dagster. Thay vì tư duy theo 'Task' (như Airflow), nó hướng tư duy sang 'Tài sản' (bảng, view, model) - tập trung vào việc dữ liệu cuối cùng trông như thế nào thay vì làm sao để chạy ra nó.",
  "concepts/7-dataops-orchestration-quality/task-dependency.md": "Task Dependency (Sự phụ thuộc tác vụ) là các mũi tên nối các Node trong một DAG. Nó đảm bảo Task B chỉ chạy khi Task A đã thành công. Việc quản lý Dependency chặt chẽ giúp tránh tình trạng xử lý dữ liệu sai lệch khi bước tiền đề chưa hoàn tất.",
  "concepts/7-dataops-orchestration-quality/volume-anomalies.md": "Volume Anomalies (Bất thường về dung lượng dữ liệu) là tình trạng bất thường phổ biến nhất. Đột nhiên bảng Logs thay vì 10GB/ngày lại phình to lên 500GB/ngày (do hệ thống bị loop), hoặc tụt xuống 0GB (do API đối tác sập).",

  "concepts/8-security-governance-finops/access-control.md": "Access Control (Kiểm soát truy cập) bao gồm RBAC (Role-Based) và ABAC (Attribute-Based). Trong Data Engineering, đây là việc giới hạn 'Ai được phép nhìn thấy Bảng nào, Cột nào'. Các kỹ thuật như Row-Level Security (RLS) hay Column-Level Security (CLS) đảm bảo nhân viên chỉ thấy dữ liệu thuộc khu vực của mình.",
  "concepts/8-security-governance-finops/audit-logging.md": "Audit Logging (Nhật ký kiểm toán) là sổ cái ghi lại mọi hành động: Ai đã chạy câu truy vấn nào, lúc mấy giờ, đọc bao nhiêu dữ liệu, và tải dữ liệu xuống ở đâu. Đây là bằng chứng pháp lý bắt buộc khi công ty bị kiểm tra bởi các tiêu chuẩn như SOC2 hay HIPAA.",
  "concepts/8-security-governance-finops/cost-optimization.md": "Cost Optimization (Tối ưu hóa chi phí) trong môi trường Cloud là nghệ thuật cân bằng giữa Hiệu năng và Tiền bạc. Thay vì viết những câu SQL chạy nhanh nhất bằng mọi giá (quét toàn bảng hàng TB), kỹ sư phải biết dùng Data Skipping, Partition Pruning, và Materialized Views để giảm bill Cloud.",
  "concepts/8-security-governance-finops/data-catalog.md": "Data Catalog (Danh mục dữ liệu) như Alation, Collibra hoặc Amundsen đóng vai trò như 'Google Search nội bộ' cho doanh nghiệp. Nó giúp Business User có thể dễ dàng tìm kiếm 'Bảng Doanh thu nằm ở đâu?', 'Cột này có nghĩa là gì?' mà không cần phải đi hỏi các kỹ sư.",
  "concepts/8-security-governance-finops/data-classification.md": "Data Classification (Phân loại dữ liệu) là bước dán nhãn mức độ nhạy cảm của dữ liệu (VD: Public, Internal, Confidential, Restricted). Những dữ liệu PII (Thông tin định danh cá nhân như SSN, Email, Số điện thoại) sẽ bị áp đặt các chính sách mã hóa cao nhất.",
  "concepts/8-security-governance-finops/data-governance.md": "Data Governance (Quản trị dữ liệu) là hệ thống toàn diện gồm Con người, Quy trình và Công nghệ để đảm bảo dữ liệu trong doanh nghiệp được an toàn, có chất lượng cao, dễ hiểu và tuân thủ các hành lang pháp lý (GDPR, CCPA).",
  "concepts/8-security-governance-finops/data-lineage.md": "Data Lineage (Gia phả dữ liệu) là bản đồ thể hiện sự chảy (flow) của dữ liệu từ nguồn gốc (Source) qua các bước biến đổi (Transformations) đến đích cuối (Dashboard). Lineage là vũ khí tối thượng để trả lời câu hỏi: 'Nếu đổi tên cột ở Backend, những Dashboard nào sẽ bị hỏng?'",
  "concepts/8-security-governance-finops/data-masking-encryption.md": "Data Masking (Che dấu) và Encryption (Mã hóa) bảo vệ dữ liệu nhạy cảm. Encryption biến dữ liệu thành mã vô nghĩa bằng thuật toán (yêu cầu Key để giải mã). Masking thay thế chuỗi (VD: đổi `0123456789` thành `******6789`) để Business User có thể phân tích mà không thấy số thực."
};

const docsDir = path.join(__dirname, '../src/content/docs');
let count = 0;
for (const [relPath, content] of Object.entries(data)) {
  const fullPath = path.join(docsDir, relPath);
  if (fs.existsSync(fullPath)) {
    const original = fs.readFileSync(fullPath, 'utf-8');
    const match = original.match(/^(---\n[\s\S]*?\n---\n)/);
    if (match) {
      const frontmatter = match[1];
      const references = original.includes('## Tài Liệu Tham Khảo') 
                         ? original.substring(original.indexOf('## Tài Liệu Tham Khảo'))
                         : '## Tài Liệu Tham Khảo\n* [Data Mesh - Zhamak Dehghani](https://www.oreilly.com/library/view/data-mesh/9781492092384/)\n* [FinOps Foundation](https://www.finops.org/)';
      const newFileContent = `${frontmatter}\n${content}\n\n${references}`;
      fs.writeFileSync(fullPath, newFileContent, 'utf-8');
      count++;
    }
  }
}
console.log(`Updated ${count} files in batch 4.`);
