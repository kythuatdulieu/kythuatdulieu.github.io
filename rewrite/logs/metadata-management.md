# Assumptions
- Target audience is Data Engineers, Data Architects.
- Goal: Explain Metadata Management architecture, specifically Pull vs Push, Hive Metastore bottlenecks, and Active Metadata.

# Research map
- Source 1: LinkedIn DataHub Architecture (Docs/Blog). Push vs Pull ingestion. Push for real-time (Kafka/REST), Pull for legacy/batch (Crawlers).
- Source 2: Uber Databook & Active Metadata. Transition from passive catalog to active metadata (DataK9).
- Source 3: Netflix Unified Data Architecture (UDA). Using Knowledge Graph (RDF/SHACL) for semantic modeling, and custom Graph abstraction for data lineage.
- Source 4: Hive Metastore scaling bottlenecks. RDBMS strain, directory-based partition, OOM due to large Thrift payloads. Solutions: Uber Federation, Netflix Iceberg/Polaris, Databricks Unity Catalog.

# Image/figure plan
Will use standard mermaid diagrams instead of external images, unless a highly specific one is needed. The original has a mermaid diagram for Push vs Pull. I'll improve it.

# Evidence map
- Push vs Pull: DataHub docs confirm both are used. Push (low latency, high complexity), Pull (high latency, low complexity).
- Hive Metastore OOM: Fetching partitions from MySQL to JVM via Thrift causes memory bloat. Iceberg solves this by storing metadata at the file level in object storage.
- Active Metadata: Uber Databook automates PII tagging and RBAC enforcement.
- Graph Lineage: Netflix uses graph abstractions on top of KV stores for low-latency lineage queries.

# Proposed outline
1. Mở đầu: Vấn đề (Không chỉ là "data about data", mà là Control Plane).
2. Kiến trúc thu thập (Ingestion): Pull-based (AWS Glue, Amundsen) vs Push-based (DataHub, OpenLineage).
3. Bottleneck kinh điển: Vì sao Hive Metastore (HMS) bị OOM?
4. Đồ thị tri thức (Knowledge Graph) & Data Lineage (Netflix UDA).
5. Active Metadata: Quản trị tự động (Uber Databook).
6. Khi nào nên dùng gì? (Decision framework).
7. Key terms (Bảng thuật ngữ).

# Editorial QA
- Humanize pass: Removed marketing fluff.
- Clarity: Explained Thrift OOM in HMS clearly.
- Evidence: Added references to Uber, Netflix, LinkedIn engineering blogs.
