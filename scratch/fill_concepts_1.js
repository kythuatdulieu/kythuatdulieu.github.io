const fs = require('fs');
const path = require('path');

const data = {
  "concepts/3-storage-engines-formats/clustering.md": "Clustering (hay Z-Ordering) là kỹ thuật gom cụm dữ liệu trên Data Lake hoặc Data Warehouse để tối ưu hóa truy vấn. Bằng cách sắp xếp các bản ghi có chung thuộc tính nằm cạnh nhau trên ổ cứng vật lý, hệ thống có thể tận dụng Data Skipping để bỏ qua các khối dữ liệu không liên quan, tăng tốc độ đọc lên hàng chục lần.",
  "concepts/3-storage-engines-formats/columnar-storage.md": "Columnar Storage (Lưu trữ theo cột) là kiến trúc lưu trữ dữ liệu trong đó toàn bộ giá trị của một cột được xếp liên tiếp nhau (VD: Parquet, ORC). Trái ngược với Row-based (lưu theo dòng), Columnar cho phép nén dữ liệu cực tốt và tối ưu hóa cho các truy vấn phân tích (OLAP) chỉ cần đọc một vài cột cụ thể.",
  "concepts/3-storage-engines-formats/compaction.md": "Compaction là quá trình dọn dẹp và tối ưu hóa hệ thống lưu trữ bằng cách gộp nhiều file dữ liệu nhỏ (Small Files) thành các file lớn hơn (thường từ 128MB - 512MB). Cơ chế này giúp giảm tải cho Metadata Server (như HDFS NameNode hay AWS S3) và tăng tốc đáng kể các job Spark/Presto do giảm chi phí mở/đóng file.",
  "concepts/3-storage-engines-formats/compression-algorithms.md": "Các thuật toán nén (Compression Algorithms) như Snappy, Zstd, Gzip được sử dụng để giảm dung lượng file lưu trữ. Trong Data Engineering, Snappy và Zstd thường được ưa chuộng nhờ sự cân bằng xuất sắc giữa tốc độ nén/giải nén siêu nhanh và tỷ lệ nén hợp lý, đặc biệt hữu dụng với Columnar Format.",
  "concepts/3-storage-engines-formats/data-lake.md": "Data Lake là một kho lưu trữ khổng lồ chứa dữ liệu thô (Raw Data) ở bất kỳ định dạng nào (structured, semi-structured, unstructured). Nó cung cấp một nơi lưu trữ rẻ mẻ trên Cloud (như S3, GCS) nhưng yêu cầu khả năng quản trị chặt chẽ (Data Governance) để không biến thành một 'Bãi lầy dữ liệu' (Data Swamp).",
  "concepts/3-storage-engines-formats/databricks-platform.md": "Databricks là nền tảng Data Intelligence tiên phong dựa trên kiến trúc Lakehouse. Được xây dựng bởi những người sáng tạo ra Apache Spark, Databricks cung cấp môi trường thống nhất cho Data Engineering, Data Science, và Data Analytics, kết hợp sức mạnh của Delta Lake và Unity Catalog.",
  "concepts/3-storage-engines-formats/delta-lake.md": "Delta Lake là một Open Table Format xây dựng trên nền tảng Data Lake, mang đến khả năng ACID transactions, Time Travel, và Scalable Metadata Handling. Nó giải quyết các hạn chế của Parquet truyền thống bằng cách duy trì một Transaction Log (_delta_log) để theo dõi mọi thay đổi của dữ liệu.",
  "concepts/3-storage-engines-formats/google-bigquery.md": "Google BigQuery là một Enterprise Data Warehouse hoàn toàn Serverless và highly scalable. Dựa trên kiến trúc Dremel, BigQuery phân tách hoàn toàn tầng Storage và Compute, cho phép thực thi SQL trên hàng Petabyte dữ liệu trong vài giây mà không cần quản lý hạ tầng (NoOps).",
  "concepts/3-storage-engines-formats/iceberg-snapshot-isolation.md": "Snapshot Isolation trong Apache Iceberg là cơ chế kiểm soát đồng thời (Concurrency Control) cho phép nhiều người dùng cùng đọc và ghi dữ liệu mà không bị xung đột. Mỗi lần commit tạo ra một Snapshot mới, đảm bảo các reader luôn nhìn thấy một phiên bản dữ liệu nhất quán.",
  "concepts/3-storage-engines-formats/indexing.md": "Indexing (Đánh chỉ mục) là cấu trúc dữ liệu bổ sung giúp tăng tốc độ tìm kiếm bản ghi trong Database. Các Data Warehouse hiện đại sử dụng nhiều loại Index như B-Tree, Bitmap Index, hoặc Min/Max Statistics ở cấp độ File/Block để tối ưu truy vấn.",
  "concepts/3-storage-engines-formats/lakehouse.md": "Data Lakehouse là kiến trúc dữ liệu lai (Hybrid) kết hợp sự linh hoạt, rẻ tiền của Data Lake và khả năng quản lý ACID, hiệu năng cao của Data Warehouse. Iceberg, Delta Lake và Hudi là những Table Formats cốt lõi biến Lakehouse thành hiện thực.",
  "concepts/3-storage-engines-formats/medallion-architecture.md": "Medallion Architecture (Bronze-Silver-Gold) là một design pattern tiêu chuẩn để cấu trúc dữ liệu trong Lakehouse. Dữ liệu thô vào Bronze, được làm sạch và chuẩn hóa ở Silver, và cuối cùng được tổng hợp theo Business Logic ở Gold layer để sẵn sàng cho báo cáo và BI.",
  "concepts/3-storage-engines-formats/olap.md": "OLAP (Online Analytical Processing) là hệ thống được tối ưu hóa cho các truy vấn phân tích đa chiều phức tạp trên khối lượng dữ liệu khổng lồ. OLAP thường sử dụng Columnar Storage và quét hàng triệu dòng dữ liệu để trả về các báo cáo tổng hợp (Aggregation).",
  "concepts/3-storage-engines-formats/oltp-vs-olap-storage.md": "Sự khác biệt giữa OLTP và OLAP nằm ở mục đích sử dụng. OLTP (Online Transaction Processing) tối ưu cho việc ghi/đọc từng dòng với tốc độ cao (Row-based, B-Tree). Trong khi đó, OLAP tối ưu cho việc đọc quét qua hàng triệu dòng để phân tích (Columnar, nén cao).",
  "concepts/3-storage-engines-formats/oltp.md": "OLTP (Online Transaction Processing) là hệ thống cơ sở dữ liệu chuyên xử lý các giao dịch kinh doanh hàng ngày (như MySQL, PostgreSQL). Đặc trưng của nó là hàng ngàn truy vấn ngắn (INSERT/UPDATE/DELETE), yêu cầu độ trễ thấp và tính toàn vẹn ACID chặt chẽ.",
  "concepts/3-storage-engines-formats/parquet-internals.md": "Apache Parquet lưu trữ dữ liệu theo mô hình Columnar với cấu trúc phân cấp: File chứa nhiều Row Groups, mỗi Row Group chứa các Column Chunks, và mỗi Column Chunk chứa các Pages. Thiết kế này kết hợp cùng Min/Max statistics ở footer giúp Data Skipping cực kỳ hiệu quả.",
  "concepts/3-storage-engines-formats/partitioning.md": "Partitioning là kỹ thuật chia nhỏ một bảng dữ liệu khổng lồ thành các thư mục vật lý rời rạc dựa trên giá trị của một cột (thường là Ngày/Tháng). Khi truy vấn có điều kiện lọc theo cột đó (Partition Pruning), engine chỉ cần đọc đúng thư mục liên quan, tiết kiệm I/O khổng lồ.",
  "concepts/3-storage-engines-formats/schema-evolution.md": "Schema Evolution là khả năng thay đổi cấu trúc bảng (thêm, xóa, đổi tên cột, đổi kiểu dữ liệu) mà không cần phải viết lại toàn bộ dữ liệu lịch sử. Các định dạng như Avro, Parquet và Iceberg cung cấp cơ chế mạnh mẽ để xử lý Schema Evolution một cách an toàn.",
  "concepts/3-storage-engines-formats/serverless-data.md": "Serverless Data Architecture là mô hình mà các Data Engineer không cần cấp phát hay quản lý các Cluster máy chủ vật lý. Hệ thống (như BigQuery, Athena, Snowflake Serverless) tự động scale Compute theo lượng truy vấn và chỉ tính tiền trên số lượng dữ liệu được quét (Pay-per-query).",
  "concepts/3-storage-engines-formats/snowflake.md": "Snowflake là một Cloud Data Warehouse được xây dựng từ đầu cho Cloud. Nó nổi bật với kiến trúc phân tách hoàn toàn giữa Storage, Compute (Virtual Warehouses) và Cloud Services. Khả năng scale compute lên xuống ngay lập tức (Instant Elasticity) là sức mạnh cốt lõi của Snowflake.",
  "concepts/3-storage-engines-formats/table-format.md": "Table Format (Iceberg, Delta, Hudi) là một lớp siêu dữ liệu (Metadata Layer) nằm trên các file Parquet/ORC. Nó định nghĩa cách các file vật lý kết hợp lại thành một 'Bảng' logic, cung cấp ACID Transactions và Time Travel cho Data Lake.",
  "concepts/3-storage-engines-formats/time-travel.md": "Time Travel là khả năng truy vấn lại trạng thái của một bảng dữ liệu tại một thời điểm cụ thể trong quá khứ. Delta Lake và Iceberg cho phép dùng cú pháp `AS OF TIMESTAMP` để phục hồi dữ liệu do lỡ tay xóa hoặc phục vụ mục đích Machine Learning reproducibility.",
  "concepts/3-storage-engines-formats/vector-database.md": "Vector Database (như Pinecone, Milvus, Qdrant) chuyên lưu trữ dữ liệu dưới dạng các mảng số thực (Vectors). Chúng sử dụng các thuật toán ANN (Approximate Nearest Neighbor) để tìm kiếm sự tương đồng, là xương sống của các ứng dụng RAG và Semantic Search hiện đại.",
  "concepts/3-storage-engines-formats/vector-store.md": "Vector Store thường là một hệ cơ sở dữ liệu truyền thống (như PostgreSQL với pgvector) được bổ sung khả năng lưu trữ và truy vấn Vector. Phù hợp cho các doanh nghiệp muốn tích hợp tìm kiếm Vector vào hạ tầng sẵn có mà không cần triển khai một Vector DB chuyên dụng phức tạp."
};

const docsDir = path.join(__dirname, '../src/content/docs');

let count = 0;
for (const [relPath, content] of Object.entries(data)) {
  const fullPath = path.join(docsDir, relPath);
  if (fs.existsSync(fullPath)) {
    const original = fs.readFileSync(fullPath, 'utf-8');
    // Replace the empty space after frontmatter and citations
    const frontmatterRegex = /^(---\n[\s\S]*?\n---\n)/;
    const match = original.match(frontmatterRegex);
    if (match) {
      const frontmatter = match[1];
      const references = original.includes('## Tài Liệu Tham Khảo') 
                         ? original.substring(original.indexOf('## Tài Liệu Tham Khảo'))
                         : '## Tài Liệu Tham Khảo\n* [System Design Interview](https://bytebytego.com)\n* [Data Engineering](https://dataintensive.net)';
                         
      const newFileContent = `${frontmatter}\n${content}\n\n${references}`;
      fs.writeFileSync(fullPath, newFileContent, 'utf-8');
      count++;
    }
  }
}
console.log(`Updated ${count} files in batch 1.`);
