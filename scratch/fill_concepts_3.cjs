const fs = require('fs');
const path = require('path');

const data = {
  "concepts/6-data-modeling-transformation/data-contract.md": "Data Contract (Hợp đồng dữ liệu) là một cam kết kỹ thuật (thường định dạng YAML/JSON) giữa team Sản xuất dữ liệu (Software Engineers) và team Tiêu thụ (Data Engineers). Nó khóa chặt (lock) Schema và Data Quality, đảm bảo nếu team Backend tự ý đổi tên cột, pipeline sẽ báo lỗi ngay lập tức để ngăn chặn rác chảy vào Data Warehouse.",
  "concepts/6-data-modeling-transformation/data-vault-modeling.md": "Data Vault là một phương pháp mô hình hóa dữ liệu (Data Modeling) chuyên biệt cho Enterprise Data Warehouse quy mô lớn. Nó cực kỳ linh hoạt (Agile) trong việc thêm nguồn dữ liệu mới mà không làm gãy cấu trúc cũ, thông qua việc tách dữ liệu thành 3 thành phần: Hubs (Khóa), Links (Quan hệ), và Satellites (Thuộc tính).",
  "concepts/6-data-modeling-transformation/dbt-models.md": "Trong dbt (Data Build Tool), một Model đơn giản là một file chứa câu lệnh SELECT bằng ngôn ngữ SQL. dbt sẽ tự động biên dịch Model này thành các lệnh DDL (CREATE TABLE/VIEW) và chạy trên Data Warehouse, biến SQL tĩnh thành một quy trình biến đổi dữ liệu (Transformation) bài bản như Software Engineering.",
  "concepts/6-data-modeling-transformation/dbt.md": "dbt (Data Build Tool) là tiêu chuẩn công nghiệp cho công đoạn Transformation (T trong ELT). Nó cho phép Data Engineers và Analytics Engineers viết các lệnh biến đổi bằng SQL thuần túy, kết hợp với Jinja Macros, tự động hóa kiểm thử (Testing), quản lý phụ thuộc (DAGs), và tạo tài liệu (Documentation) cho dữ liệu.",
  "concepts/6-data-modeling-transformation/dimension-table.md": "Dimension Table (Bảng Chiều) là bảng chứa các thuộc tính ngữ cảnh (Who, What, Where, When) để phân tích dữ liệu kinh doanh. (Ví dụ: Bảng Khách hàng, Bảng Sản phẩm, Bảng Thời gian). Dimension tables thường có số lượng dòng ít nhưng rất nhiều cột mô tả (Attributes).",
  "concepts/6-data-modeling-transformation/dimensional-modeling.md": "Dimensional Modeling (Mô hình đa chiều) là kỹ thuật thiết kế Data Warehouse phổ biến nhất, được phát triển bởi Ralph Kimball. Nó xoay quanh việc chia dữ liệu thành Bảng Sự kiện (Fact) chứa các con số đo lường, và Bảng Chiều (Dimension) chứa ngữ cảnh mô tả, tối ưu tuyệt đối cho việc xuất báo cáo.",
  "concepts/6-data-modeling-transformation/fact-table.md": "Fact Table (Bảng Sự kiện) là trung tâm của mô hình Star Schema. Nó chứa các sự kiện kinh doanh đã xảy ra (VD: Giao dịch mua hàng, Cú click chuột) kèm theo các chỉ số đo lường (Metrics/Measures) như Doanh thu, Số lượng. Fact table phình to liên tục theo thời gian.",
  "concepts/6-data-modeling-transformation/grain.md": "Grain (Hạt) xác định độ chi tiết của một dòng dữ liệu trong Fact Table. (Ví dụ: Một dòng đại diện cho 'Mỗi hóa đơn' hay 'Mỗi sản phẩm trong hóa đơn'). Xác định đúng Grain là bước quan trọng nhất trong Data Modeling để tránh tình trạng Double-counting (Tính lặp) khi tổng hợp dữ liệu.",
  "concepts/6-data-modeling-transformation/inmon-methodology.md": "Phương pháp Inmon thiết kế Data Warehouse theo hướng Top-Down: Xây dựng một EDW (Enterprise Data Warehouse) chuẩn hóa bậc 3 (3NF) để chứa toàn bộ dữ liệu của doanh nghiệp trước, sau đó mới tách ra các Data Marts nhỏ lẻ phục vụ từng phòng ban. Chậm triển khai nhưng vô cùng chặt chẽ.",
  "concepts/6-data-modeling-transformation/kimball-methodology.md": "Phương pháp Kimball thiết kế Data Warehouse theo hướng Bottom-Up: Bắt đầu bằng việc xây dựng ngay các Data Marts đa chiều (Star Schema) cho các quy trình nghiệp vụ quan trọng nhất để thu được giá trị nhanh chóng. Các Data Marts này liên kết với nhau qua Conformed Dimensions (Chiều dùng chung).",
  "concepts/6-data-modeling-transformation/materialization.md": "Materialization (Vật chất hóa) là cách mà dbt hoặc Database lưu trữ kết quả của một câu lệnh SQL. Có 4 loại chính: Table (xóa đi tạo lại), View (truy vấn ảo), Incremental (chỉ đắp thêm dữ liệu mới), và Ephemeral (chỉ tồn tại dưới dạng CTE). Việc chọn đúng loại giúp tối ưu chi phí cực lớn.",
  "concepts/6-data-modeling-transformation/metrics-layer.md": "Metrics Layer (hay Semantic Layer) là một lớp trừu tượng nằm giữa Data Warehouse và BI Tools. Thay vì để mỗi công cụ BI tự viết công thức tính 'Doanh thu thuần', Metrics Layer định nghĩa công thức này tại một nơi duy nhất bằng code, đảm bảo mọi phòng ban đều nhìn thấy chung một con số.",
  "concepts/6-data-modeling-transformation/one-big-table-obt.md": "OBT (One Big Table) là kỹ thuật Join sẵn tất cả Fact và Dimension thành một bảng khổng lồ duy nhất (hàng trăm cột) trước khi đưa lên BI Tool. Tận dụng sức mạnh Columnar của Cloud Data Warehouse hiện đại, OBT giúp báo cáo render siêu nhanh vì không cần tốn thời gian chạy lệnh JOIN.",
  "concepts/6-data-modeling-transformation/slowly-changing-dimension.md": "SCD (Slowly Changing Dimension) giải quyết bài toán lịch sử khi thuộc tính thay đổi (VD: Khách hàng đổi địa chỉ). Phổ biến nhất là SCD Type 2: Thêm một dòng mới, dùng cờ (Flag) hoặc cột Thời gian (Valid_From, Valid_To) để giữ lại cả thông tin cũ và thông tin mới.",
  "concepts/6-data-modeling-transformation/snowflake-schema.md": "Snowflake Schema là một biến thể của Star Schema, trong đó các Dimension Tables được chuẩn hóa (Normalized) thành nhiều bảng con để tiết kiệm dung lượng. Đổi lại, các truy vấn SQL trở nên phức tạp hơn và chậm hơn vì phải JOIN quá nhiều tầng.",
  "concepts/6-data-modeling-transformation/sql-transformation.md": "SQL Transformation là quá trình dùng lệnh SQL (SELECT, JOIN, GROUP BY, CASE WHEN) để làm sạch, lọc, tính toán và đúc dữ liệu từ dạng thô (Raw) sang dạng có cấu trúc logic phục vụ nghiệp vụ (Business Ready) trong mô hình ELT.",
  "concepts/6-data-modeling-transformation/star-schema.md": "Star Schema (Lược đồ hình sao) là cấu trúc mô hình hóa với một Fact Table ở giữa và các Dimension Tables bao xung quanh. Với cấu trúc phẳng và ít lệnh JOIN (Denormalized), nó là kiến trúc hoàn hảo nhất để tối ưu tốc độ cho các công cụ BI (Tableau, PowerBI).",
  "concepts/6-data-modeling-transformation/surrogate-key.md": "Surrogate Key (Khóa đại diện) là một mã ID vô nghĩa (thường là Auto-Increment Integer hoặc UUID) được sinh ra để làm khóa chính trong Dimension Table, thay thế cho khóa tự nhiên (Natural Key) của hệ thống gốc. Nó giúp xử lý SCD Type 2 và tăng tốc độ JOIN.",

  "concepts/7-dataops-orchestration-quality/airflow-scheduler.md": "Airflow Scheduler là bộ não của Apache Airflow. Nó liên tục quét qua thư mục chứa mã nguồn DAG, đánh giá các điều kiện phụ thuộc (Dependencies) và kích hoạt (Trigger) các Tasks để gửi tới Executor thực thi khi đến thời điểm hoặc điều kiện đã chín muồi.",
  "concepts/7-dataops-orchestration-quality/alerting-incident-response.md": "Alerting & Incident Response trong DataOps là quy trình phát cảnh báo tự động qua Slack/PagerDuty khi Pipeline bị hỏng hoặc dữ liệu bất thường. Kèm theo đó là quy trình phản ứng sự cố (Incident Response) để xác định ưu tiên (Severity) và quy trách nhiệm (On-call) để khắc phục.",
  "concepts/7-dataops-orchestration-quality/anomaly-detection.md": "Anomaly Detection (Phát hiện bất thường) ứng dụng Machine Learning để phân tích dữ liệu lịch sử và tự động cảnh báo khi có sự sụt giảm/tăng đột biến (VD: Đang có 10,000 users đăng ký mỗi ngày bỗng dưng tụt xuống 100), thay vì dùng các Rule cứng ngắc do con người đặt ra.",
  "concepts/7-dataops-orchestration-quality/apache-airflow.md": "Apache Airflow là nền tảng Workflow Orchestration chuẩn mực nhất thế giới, được tạo ra tại Airbnb. Bằng cách sử dụng Python để định nghĩa Data Pipeline dưới dạng DAG (Directed Acyclic Graph), Airflow cho phép lập lịch, giám sát, và quản lý các phụ thuộc phức tạp.",
  "concepts/7-dataops-orchestration-quality/blue-green-deployment-data.md": "Tương tự như Software Engineering, Blue-Green Deployment cho Data là kỹ thuật chạy song song 2 môi trường (Màu Xanh: bản cũ đang chạy, Màu Xanh lá: bản mới). Khi bản mới vượt qua toàn bộ Data Tests, hệ thống mới trỏ báo cáo sang môi trường mới để đảm bảo Zero-Downtime.",
  "concepts/7-dataops-orchestration-quality/circuit-breakers-data.md": "Data Circuit Breakers (Cầu dao tự ngắt dữ liệu) là cơ chế chặn không cho dữ liệu chảy tiếp (Fail-fast) nếu nó không vượt qua các bài Test chất lượng tại một chốt chặn. Việc này ngăn rác dữ liệu làm hỏng toàn bộ các Dashboard ở hạ nguồn.",
  "concepts/7-dataops-orchestration-quality/dag.md": "DAG (Directed Acyclic Graph - Đồ thị có hướng không tuần hoàn) là khái niệm toán học được áp dụng làm xương sống cho Data Orchestration. Trong Airflow, DAG định nghĩa chuỗi các Task chạy theo một thứ tự nghiêm ngặt (Có hướng) và tuyệt đối không bao giờ quay vòng lập vô tận (Không tuần hoàn)."
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
                         : '## Tài Liệu Tham Khảo\n* [Data Warehouse Toolkit - Ralph Kimball](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/)\n* [Fundamentals of Data Engineering - Joe Reis](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/)';
      const newFileContent = `${frontmatter}\n${content}\n\n${references}`;
      fs.writeFileSync(fullPath, newFileContent, 'utf-8');
      count++;
    }
  }
}
console.log(`Updated ${count} files in batch 3.`);
