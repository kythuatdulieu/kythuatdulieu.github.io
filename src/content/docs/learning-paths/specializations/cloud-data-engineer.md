---
title: "Cloud Data Engineer (Kỹ sư dữ liệu đám mây)"
description: "Lộ trình Cloud Data Engineer: lakehouse, warehouse, serverless processing, IAM, network, cost optimization và vận hành workload dữ liệu trên cloud."
---

Cloud Data Engineer thiết kế và vận hành hệ thống dữ liệu trên AWS, Google Cloud, Azure hoặc môi trường hybrid. Điểm khó không nằm ở việc bấm tạo service. Điểm khó là chọn đúng dịch vụ, thiết kế quyền truy cập an toàn, kiểm soát chi phí và đảm bảo pipeline có thể chạy ổn khi dữ liệu tăng. Ba cloud lớn đều dùng framework kiến trúc để buộc team nhìn cùng lúc vào reliability, security, cost và operations: [AWS Well-Architected](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [Google Cloud Architecture Framework](https://cloud.google.com/architecture/framework), [Azure Well-Architected](https://learn.microsoft.com/en-us/azure/well-architected/).

Cloud tốt giúp team đi nhanh hơn. Cloud dùng sai biến hóa đơn, bảo mật và vận hành thành vấn đề lớn.

## Ai nên theo hướng này?

- Data Engineer muốn làm sâu về public cloud.
- Backend/DevOps Engineer muốn chuyển sang workload dữ liệu.
- Team đang đưa data lake/warehouse từ on-prem lên cloud.
- Người muốn hiểu FinOps, IAM, network và kiến trúc dữ liệu hiện đại.

## Checkpoint cần đạt

| Năng lực | Ví dụ thực tế |
|---|---|
| Storage | Thiết kế raw/bronze/silver/gold zone trên object storage. |
| Compute | Chọn serverless, Spark, warehouse hoặc container tùy workload. |
| Security | IAM least privilege, encryption, secrets, audit logs. |
| Network | Private access, VPC/VNet, endpoint, egress control. |
| Cost | Partition, lifecycle policy, autoscaling, budget alert. |
| Reliability | Retry, backfill, multi-zone, recovery plan. |

## 1. Bắt đầu từ storage và data layout

Object storage như S3, Cloud Storage, ADLS thường là nền của data lake. Nhưng nếu cần schema evolution, snapshot hoặc table-level operation trên dữ liệu lakehouse, hãy đọc thêm table format như Apache Iceberg thay vì chỉ học bucket và file path: [Apache Iceberg Documentation](https://iceberg.apache.org/docs/latest/). Hãy học:

- Quy ước đường dẫn theo domain, dataset, ngày.
- File format: CSV cho trao đổi, Parquet/ORC cho phân tích.
- Partition hợp lý, tránh partition quá nhỏ.
- Lifecycle policy: dữ liệu nóng, lạnh, archive.
- Encryption và quyền truy cập theo nguyên tắc tối thiểu.

Một data lake đáng tin không chỉ là bucket chứa file. Nó cần catalog, ownership, retention, lineage và quy trình dọn dữ liệu cũ.

Đọc trong site: [Cloud Storage](/concepts/3-storage-engines-formats/cloud-storage/), [Data Lake](/concepts/3-storage-engines-formats/data-lake/), [Parquet Internals](/concepts/3-storage-engines-formats/parquet-internals/), [Data Catalog](/concepts/8-security-governance-finops/data-catalog/), [Metadata Management](/concepts/8-security-governance-finops/metadata-management/).

## 2. Warehouse, lakehouse và serverless processing

Không có một engine đúng cho mọi việc:

| Workload | Lựa chọn thường gặp |
|---|---|
| BI và ad hoc analytics | BigQuery, Snowflake, Redshift, Synapse/Fabric |
| Transform batch lớn | Spark, Dataflow/Beam, Glue, Databricks |
| Event-driven nhỏ | Cloud Functions/Lambda, queues, managed workflows |
| Table cần update/delete/time travel | Iceberg, Delta Lake, Hudi |
| Low-latency serving | BigQuery BI Engine, ClickHouse, Druid, Elasticsearch tùy case |

Senior Cloud Data Engineer biết nói “không cần Spark cho việc này” cũng quan trọng như biết tối ưu Spark.

Đọc trong site: [Serverless Data](/concepts/3-storage-engines-formats/serverless-data/), [Google BigQuery](/concepts/3-storage-engines-formats/google-bigquery/), [Amazon Redshift](/concepts/3-storage-engines-formats/amazon-redshift/), [Lakehouse](/concepts/3-storage-engines-formats/lakehouse/), [Table Format](/concepts/3-storage-engines-formats/table-format/).

## 3. Security và governance

Cloud làm mọi thứ dễ tạo hơn, vì vậy cũng dễ tạo sai hơn. Học kỹ:

- IAM theo role nhỏ, không dùng quyền admin cho pipeline.
- Service account riêng cho từng workload quan trọng.
- Secret Manager hoặc Vault, không để secret trong repo.
- Encryption at rest và in transit.
- Audit log cho truy cập dữ liệu nhạy cảm.
- Data classification và masking/tokenization cho PII.

Đọc trong site: [Access Control](/concepts/8-security-governance-finops/access-control/), [Audit Logging](/concepts/8-security-governance-finops/audit-logging/), [Data Classification](/concepts/8-security-governance-finops/data-classification/), [Data Masking Encryption](/concepts/8-security-governance-finops/data-masking-encryption/), [Data Governance](/concepts/8-security-governance-finops/data-governance/).

## 4. FinOps cho dữ liệu

Chi phí dữ liệu thường tăng âm thầm: query scan toàn bảng, table rebuild mỗi ngày, file nhỏ quá nhiều, cluster chạy quên tắt, egress giữa vùng/cloud.

Thói quen cần có:

- Gắn tag/label theo team, project, environment.
- Budget alert cho dataset hoặc workload quan trọng.
- Dashboard chi phí theo ngày và theo pipeline.
- Review query scan bytes hoặc warehouse credit.
- Lifecycle policy cho raw data và backup.

Đọc trong site: [Cost Optimization](/concepts/8-security-governance-finops/cost-optimization/), [FinOps Data Engineering](/concepts/8-security-governance-finops/finops-data-engineering/), [Partitioning](/concepts/3-storage-engines-formats/partitioning/), [Clustering](/concepts/3-storage-engines-formats/clustering/).

## Checklist đọc concept

| Mốc học | Concept nội bộ cần đọc |
|---|---|
| Thiết kế storage | [Cloud Storage](/concepts/3-storage-engines-formats/cloud-storage/), [Data Lake](/concepts/3-storage-engines-formats/data-lake/), [File Formats Deep Dive](/concepts/3-storage-engines-formats/file-formats-deep-dive/) |
| Chọn compute | [Serverless Data](/concepts/3-storage-engines-formats/serverless-data/), [Apache Spark](/concepts/4-compute-engines-batch/apache-spark/), [MPP Architecture Dremel](/concepts/4-compute-engines-batch/mpp-architecture-dremel/) |
| Bảo mật | [Access Control](/concepts/8-security-governance-finops/access-control/), [Data Masking Encryption](/concepts/8-security-governance-finops/data-masking-encryption/), [Audit Logging](/concepts/8-security-governance-finops/audit-logging/) |
| Chi phí | [Cost Optimization](/concepts/8-security-governance-finops/cost-optimization/), [FinOps Data Engineering](/concepts/8-security-governance-finops/finops-data-engineering/) |

## Dự án thực hành

**Dự án: Cloud lakehouse pipeline**

1. Tạo landing zone trên object storage.
2. Ingest file JSON/CSV hằng ngày.
3. Convert sang Parquet, partition theo ngày.
4. Catalog bảng để query từ warehouse/Spark.
5. Thêm IAM riêng cho ingestion, transform và analyst.
6. Thêm lifecycle policy và cost dashboard.
7. Viết runbook restore một partition bị lỗi.

## Góc phỏng vấn

- Data lake khác warehouse khác lakehouse thế nào?
- Partition theo ngày có rủi ro gì khi dữ liệu skew?
- Vì sao IAM theo service account riêng tốt hơn dùng một account chung?
- Làm sao phát hiện pipeline gây tăng chi phí?
- Khi nào chọn serverless thay vì cluster tự quản?

## References

- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) - Amazon Web Services.
- [Cloud Architecture Framework](https://cloud.google.com/architecture/framework) - Google Cloud.
- [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/) - Microsoft.
- [Apache Iceberg Documentation](https://iceberg.apache.org/docs/latest/) - Apache Software Foundation.
- [Terraform intro](https://developer.hashicorp.com/terraform/intro) - HashiCorp.
