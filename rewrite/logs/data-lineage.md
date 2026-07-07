# Assumptions
- The concept needs to be explained deeply from an architecture perspective rather than just UI.
- The target readers are Data Engineers who need to understand how lineage is actually captured in a distributed system, how OpenLineage standard works, and the operational trade-offs of capturing column-level lineage.
- The FinOps angle is important as lineage is often used for cost attribution and automated garbage collection of unused data assets.

# Research map
1. Netflix Tech Blog: "Building and Scaling Data Lineage at Netflix" (March 2019)
   - URL: https://netflixtechblog.com/building-and-scaling-data-lineage-at-netflix-to-improve-data-infrastructure-reliability-and-1a52526a7977
   - Why credible: Official engineering blog of Netflix, a pioneer in data engineering at scale.
   - Main claims: Data lineage is crucial for data reliability, cost attribution, and platform efficiency.
2. Uber Engineering: "Databook: Turning Big Data into Knowledge with Metadata at Uber"
   - URL: https://www.uber.com/en-VN/blog/databook-turning-big-data-into-knowledge-with-metadata-at-uber/
   - Why credible: Official Uber engineering blog.
   - Main claims: Databook is their centralized catalog, lineage enables automated data quality tests, impact analysis, and root cause analysis.
3. OpenLineage Docs: "Column-Level Lineage"
   - URL: https://openlineage.io/docs/spec/facets/column-level-lineage
   - Why credible: Official documentation of the OpenLineage standard.
   - Main claims: Column-level lineage is tracked via the `columnLineage` dataset facet, extracted by parsing the logical plan (e.g., in Spark) to map inputs to outputs.

# Image/figure plan
- Will use a Mermaid diagram to illustrate the push-based event-driven architecture using Kafka, OpenLineage, and Spark/Airflow. 

# Evidence map
| Claim | Evidence | Source | Confidence | Notes |
| --- | --- | --- | --- | --- |
| Event-driven push architecture is standard at scale | Netflix and Uber both describe event-driven metadata architectures | Netflix/Uber blogs | High | |
| OpenLineage standardizes lineage via JSON schema | OpenLineage specification defines Run, Job, Dataset | OpenLineage Docs | High | |
| Column-level lineage parsing can cause OOM in Spark | Parsing Catalyst Optimizer's logical plan requires significant memory for complex queries | OpenLineage Spark integration details | High | A known operational challenge |
| Lineage enables FinOps and Garbage Collection | Tracking downstream consumers allows identifying unused tables to save storage costs | FinOps data lineage articles | High | |

# Proposed outline
1. Mở đầu bằng vấn đề: Nhìn từ UI thì đơn giản, nhưng đằng sau là hệ thống Distributed Metadata.
2. Code-time (Pull) vs Runtime (Push): Phân tích hai kiến trúc lấy Lineage. Tại sao Big Tech chọn Runtime Event-Driven.
3. Tiêu chuẩn Mở OpenLineage: Khái niệm Run, Job, Dataset. Code cấu hình Spark bắn OpenLineage qua Kafka.
4. Nỗi đau Column-Level Lineage: Cơ chế duyệt Logical Plan và hệ lụy (OOMKilled, Cartesian Explosion).
5. Rủi ro vận hành (Failure Modes): Retry storms, Consumer lag.
6. Data Lineage trong FinOps: Propagated cost và Dọn rác tự động (Garbage Collection) với AWS S3 Glacier.
7. Thuật ngữ chính (Key terms).
8. References.

# Editorial QA
- [x] Tiếng Việt tự nhiên, không dịch word-by-word.
- [x] Loại bỏ marketing buzzwords, "AI-sounding" phrases.
- [x] Đã cung cấp sơ đồ Mermaid chuẩn `graph TD`.
- [x] Trade-off rõ ràng.
- [x] Có references hợp lệ.
