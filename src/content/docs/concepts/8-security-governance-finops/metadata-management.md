---
title: "Quản lý siêu dữ liệu - Metadata Management"
difficulty: "Advanced"
tags: ["metadata", "data-catalog", "data-governance", "hive-metastore", "data-lineage"]
readingTime: "20 mins"
lastUpdated: 2026-06-26
seoTitle: "Metadata Management & Data Catalog Architecture: Push vs Pull, HMS Bottlenecks"
metaDescription: "Kiến trúc hệ thống Metadata Management từ góc nhìn Staff Engineer: So sánh Push vs Pull, giải quyết Hive Metastore OOM, Uber Databook, Netflix UDA."
description: "Trong các kiến trúc dữ liệu phân tán (Data Mesh, Lakehouse), Metadata không đơn thuần là 'dữ liệu về dữ liệu'. Nó chính là Control Plane của toàn bộ hệ sinh thái."
---

Trong các kiến trúc dữ liệu phân tán (Data Mesh, Lakehouse), định nghĩa sách giáo khoa "Metadata là dữ liệu về dữ liệu" đã trở nên lỗi thời. Ở quy mô Enterprise, **Metadata Management** chính là **Control Plane** của toàn bộ hạ tầng dữ liệu. Nếu hệ thống lưu trữ như HDFS/S3 là Data Plane (nơi chứa dữ liệu vật lý), thì Data Catalog và Metastore đóng vai trò là Control Plane (nơi điều phối, phân quyền và định tuyến dữ liệu).

Bài viết này đi sâu vào kiến trúc vật lý của hệ thống quản lý siêu dữ liệu, phân tích sự đánh đổi giữa các mô hình thu thập (Push vs Pull), và cách các Big Tech như Uber, Netflix giải quyết điểm nghẽn (bottlenecks) khi Metastore bị quá tải.

## 1. Kiến Trúc Thu Thập Metadata: Pull-based vs Push-based

Việc thu thập Technical và Operational Metadata từ hàng nghìn pipelines đòi hỏi một chiến lược kiến trúc rõ ràng. Hiện nay, có hai trường phái chính:

### 1.1. Pull-based Architecture (Kiến trúc Kéo)
Đại diện tiêu biểu là **AWS Glue Crawlers** hoặc các công cụ quét định kỳ (Batch Scanners) như Amundsen thời kỳ đầu. Hệ thống trung tâm sẽ định kỳ kết nối tới các Data Sources (S3, RDS, Kafka) để lấy metadata, đọc schema và phân tích mẫu dữ liệu (data sampling).

**Đánh đổi hệ thống (Systemic Trade-offs):**
- **Ưu điểm:** Tách biệt hoàn toàn (Decoupled) với Data Pipelines. Việc quét metadata không làm gián đoạn hay ảnh hưởng tới latency của quá trình ghi dữ liệu gốc. Dễ dàng setup với các external sources.
- **Rủi ro Vận hành (Latency & Compute Cost):** Metadata luôn bị trễ (Stale metadata). Hơn nữa, việc quét (crawling) trên object storage như Amazon S3 với hàng triệu files Parquet nhỏ sẽ gây ra bùng nổ chi phí gọi `LIST/GET` API và dễ dẫn đến tình trạng **S3 API Throttling**.

### 1.2. Push-based Architecture (Kiến trúc Đẩy - Event-Driven)
Đại diện bởi kiến trúc của **DataHub (LinkedIn)**, chuẩn **OpenLineage**, và **Marquez**. Các Data Pipelines (Airflow, Spark, dbt) sẽ chủ động phát ra các sự kiện (Metadata Events) qua Kafka hoặc API ngay tại thời điểm runtime mỗi khi có một task hoàn thành hoặc schema bị thay đổi.

**Đánh đổi hệ thống:**
- **Ưu điểm:** Metadata được cập nhật gần như thời gian thực (Near real-time). Hệ thống bắt được chính xác Data Lineage (Flow) thay vì phải parse và suy đoán từ SQL logs.
- **Rủi ro Vận hành:** Tính phụ thuộc (Coupling) cao. Code của pipeline gốc phải bị can thiệp (instrumented) để gắn thêm thư viện đẩy metadata. Nếu Kafka endpoint của Catalog bị sập, cần cơ chế Fallback xử lý lỗi (Ví dụ: dùng asynchoronous push kết hợp Dead Letter Queue) để không làm fail toàn bộ Data Pipeline cốt lõi.

```mermaid
graph TD
    subgraph "Push-based Architecture("DataHub / OpenLineage")"
        Spark["Spark Job"] -- "1. Emit Event("Schema, Metrics")" --> Kafka["Kafka Topic"]
        dbt["dbt Model"] -- "2. Emit Event("Lineage")" --> Kafka
        Kafka -- "3. Consume Async" --> Ingestion["Ingestion Service"]
        Ingestion --> GraphDB["(Graph DB / Neo4j)"]
        Ingestion --> SearchIndex["(Elasticsearch)"]
    end
    
    subgraph "Pull-based Architecture("AWS Glue Crawler")"
        Crawler["Glue Crawler"] -- "1. LIST S3 bucket" --> S3["(Amazon S3)"]
        Crawler -- "2. Sample Parquet Footer" --> S3
        Crawler -- "3. Infer Schema" --> HMS["(Glue Catalog / Metastore)"]
    end
```

## 2. Điểm Nghẽn Hệ Thống (Bottlenecks) và Cú Sập Hive Metastore

**Hive Metastore (HMS)** thường được dùng làm de-facto Data Catalog cho các hệ sinh thái Hadoop/Spark truyền thống. Tuy nhiên, bản chất nó là một kiến trúc Monolith backed bởi một RDBMS (MySQL/PostgreSQL).

### Real-world Incident: JVM OOMKilled & Metastore Timeout
Khi truy vấn một bảng được partitioned theo `(year, month, day, hour)` với lịch sử 5 năm, câu lệnh `SELECT * FROM table WHERE year = 2023` sẽ buộc Spark Driver gọi API `get_partitions_by_filter` tới HMS. 
Nếu bảng có hàng chục nghìn partitions, HMS sẽ phải query RDBMS, deserialize các Object, và serialize thành Thrift response trả về.
- **Hậu quả 1:** CPU của database backing HMS tăng vọt 100%.
- **Hậu quả 2:** Quá trình cấp phát bộ nhớ bùng nổ, JVM của Spark Driver hoặc chính HMS bị **OOMKilled** (Out Of Memory) do payload Thrift trả về quá lớn (có thể lên tới hàng trăm MB hoặc vài GB).
- **Hậu quả 3:** Cascade failure (Lỗi dây chuyền) – toàn bộ các pipelines khác gọi tới HMS trong cluster đều bị Connection Timeout và sập theo.

### Kiến Trúc Khắc Phục (Architectural Solutions)
1. **Thay đổi chuẩn lưu trữ (Iceberg/Hudi):** Các chuẩn Table Format mới như Apache Iceberg loại bỏ hoàn toàn sự phụ thuộc vào RDBMS của Hive Metastore trong việc lưu metadata ở cấp độ partition/file. Thay vào đó, nó lưu metadata trực tiếp trên Object Storage dưới dạng một cây phân cấp (tree of manifest files), giúp Spark Driver có thể parse song song (distributed planning).
2. **Database Federation (Cách làm của Uber):** Đối với kiến trúc gốc, Uber đã giải quyết vấn đề HMS Monolith bằng cách phân tách metastore thành các Domain-Specific Databases, sử dụng con trỏ siêu dữ liệu (pointer-level metadata manipulation) để giảm bán kính ảnh hưởng (blast radius) khi một domain bị sập.

## 3. Kiến trúc Đồ thị Tri thức (Knowledge-Graph-based) - Netflix UDA

Netflix nhận ra rằng việc quản lý siêu dữ liệu dưới dạng các bảng RDBMS rời rạc không thể hiện được sự phức tạp của Data Lineage. Họ đã thiết kế **Unified Data Architecture (UDA)** sử dụng kiến trúc đồ thị.

- **Semantic Integration:** Sử dụng RDF (Resource Description Framework) và SHACL (Shapes Constraint Language) để map các concept kinh doanh (Business Domain Models) trực tiếp tới các cấu trúc vật lý.
- **Graph Database Traversal:** Mọi thực thể (Table, Column, Pipeline, User, Dashboard) là các Node (Đỉnh). Các tương tác (Creates, Consumes, Owns) là Edges (Cạnh). Việc truy vấn *"Nếu sửa cột A, những Dashboard nào hạ nguồn bị ảnh hưởng?"* trở thành một bài toán duyệt đồ thị (Graph Traversal) được xử lý với độ trễ tính bằng mili-giây (sub-milliseconds), thay vì sử dụng đệ quy JOIN (Recursive CTEs) cực kỳ tốn kém và chậm chạp trên RDBMS.

## 4. Quản lý Siêu dữ liệu Tự động với Machine Learning tại Uber

Khi hệ thống chạm ngưỡng Exabytes dữ liệu, việc yêu cầu Data Steward gán tag thủ công (Business Metadata) là nhiệm vụ bất khả thi.
Uber đã giải quyết vấn đề này bằng cách phát triển hệ thống **DataK9** tích hợp với nền tảng nội bộ **Databook**:
- Hệ thống áp dụng hybrid approach (phương pháp lai): Một phần nhỏ các dataset lõi (Golden datasets) được gán nhãn thủ công (Manual Classification).
- DataK9 sử dụng các ML models đã được train và các rule-based engines (sử dụng Bloom Filters) để quét trên toàn bộ hệ thống, tự động phân loại thông tin nhạy cảm PII (Personally Identifiable Information) hay dữ liệu tài chính (Financial Data).
- Metadata sau khi auto-tag sẽ được đẩy vào Elasticsearch của Databook, từ đó hệ thống tự động kích hoạt các chính sách Role-Based Access Control (RBAC) để chặn quyền truy cập trái phép ở cấp độ cột (Column-level security).

## 5. Code Thực Chiến: Triển khai Data Catalog & LF bằng Terraform

Thay vì cấu hình click-ops thủ công trên UI, các Staff Data Engineer sử dụng Infrastructure as Code (IaC) để thiết lập Data Catalog, gắn Business Metadata và cấu hình phân quyền truy cập. Ví dụ dưới đây sử dụng **AWS Glue Data Catalog** kết hợp **AWS Lake Formation**.

```hcl
# 1. Thiết lập Glue Catalog Database (Logical Layer)
resource "aws_glue_catalog_database" "gold_layer_metrics" {
  name        = "gold_business_metrics"
  description = "Chứa các bảng Aggregate đã được làm sạch cho hệ thống BI"

  # Gắn Business/Technical Metadata trực tiếp vào IaC
  parameters = {
    "data_owner"     = "growth_team"
    "classification" = "confidential"
    "pii_data"       = "false"
    "cost_center"    = "dept-194"
  }
}

# 2. Áp dụng Tag-based Access Control (TBAC)
resource "aws_lakeformation_lf_tag" "sensitivity" {
  key    = "sensitivity_level"
  values = ["public", "high", "critical"]
}

# 3. Phân quyền Data Governance (Data Plane Access) qua Lake Formation
resource "aws_lakeformation_permissions" "bi_analyst_access" {
  principal   = aws_iam_role.bi_analyst_role.arn
  permissions = ["SELECT", "DESCRIBE"]

  table {
    database_name = aws_glue_catalog_database.gold_layer_metrics.name
    name          = "fct_monthly_revenue"
  }
}
```

**Systemic Trade-offs khi dùng Lake Formation / TBAC:**
- **Ưu điểm (Governance):** Khả năng Audit (kiểm toán) xuất sắc và mở rộng tốt. Phân quyền cấp độ Cột hoặc Row-level dễ dàng thông qua thẻ (Tag) thay vì định nghĩa lại chính sách từng bảng.
- **Rủi ro Vận hành (Latency & Drift):** Khi có quá nhiều policies và tags, quá trình IAM+LF cross-evaluation của AWS sẽ làm tăng đáng kể query planning latency của Amazon Athena. Hơn nữa, việc Terraform drift khi các Data Stewards tự thay đổi quyền trên UI sẽ gây ra các lỗi `terraform apply` cho team DataOps, yêu cầu chiến lược reconcile chặt chẽ (như chạy Terraform drift detection định kỳ).

## 6. Tổng Kết

Data Catalog và Metadata Management hoàn toàn không phải là một công cụ (Tool). Nó là một **Hệ Sinh Thái (Ecosystem)**. Việc thiết kế hệ thống này đòi hỏi kỹ sư phải giải quyết các bài toán phân tán hệ thống cốt lõi: 
1. Làm thế nào để push metadata với throughput cao mà không làm nghẽn Data Pipeline gốc?
2. Làm sao để đánh index hàng tỷ data files mà không gây sập (OOM) Metastore?
3. Thiết kế kiến trúc tích hợp AI/ML để tự động hóa Data Governance ở quy mô Exabytes.

Việc làm chủ và có một kiến trúc Metadata đủ vững chắc chính là bước đệm kỹ thuật bắt buộc trước khi tổ chức có thể triển khai thành công các mô hình phi tập trung như **Data Mesh** hay **Data Fabric**.

## Nguồn Tham Khảo
* **Designing Data-Intensive Applications - Martin Kleppmann**
* [Netflix Technology Blog: Data Mesh - A Data Movement and Processing Platform](https://netflixtechblog.com/)
* [Netflix Technology Blog: Unified Data Architecture (UDA)](https://netflixtechblog.com/)
* [Uber Engineering: Databook - Uber's Unified Portal for Metadata Management](https://eng.uber.com/databook/)
* [AWS Architecture Blog: Build a Serverless Metadata Search Architecture](https://aws.amazon.com/blogs/architecture/)
