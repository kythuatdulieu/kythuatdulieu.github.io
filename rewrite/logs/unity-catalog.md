# Assumptions
- The target audience is Senior Data Engineers or Architects looking to understand the core architecture of Databricks Unity Catalog, how it implements Data Mesh, its access control mechanisms, and real-world system trade-offs.
- Content type is a deep_dive.

# Research map
- Official docs: Databricks "What is Unity Catalog?". URL: https://docs.databricks.com/en/data-governance/unity-catalog/index.html. Claims: Unified governance for data, analytics, AI. 3-level namespace (catalog.schema.table). Centralized metastore.
- Databricks Engineering Blog: Data Mesh implementation on Databricks. URL: https://www.databricks.com/blog/2022/10/24/data-mesh-databricks.html. Claims: Unity Catalog is the foundational governance layer for Data Mesh. Catalogs map to domains.
- Medium/Community posts: Unity Catalog internal token vending machine. Claims: Requesting short-lived tokens (AWS STS) during query execution, which may lead to rate limiting under massive concurrency.

# Image/figure plan
Since this is an architectural deep dive, a Mermaid diagram describing the token vending flow (Databricks Control Plane -> Data Plane -> Cloud Storage) is very helpful. I will recreate the mermaid diagram from the original draft as it's accurate and directly illustrates the execution flow.

# Evidence map
| Claim | Evidence | Source | Confidence | Notes |
|-------|----------|--------|------------|-------|
| UC uses 3-level namespace | `catalog.schema.table` | Databricks Docs | High | |
| UC is a decoupled governance layer | Metastore is account-level, not workspace-level | Databricks Docs | High | Fixes the old HMS fragmentation |
| UC issues short-lived tokens for data access | Databricks Cluster gets STS/SAS tokens from UC | Community/Architecture deep dives | High | Prevents direct long-term credential leakage |
| RLS/CLS support | Dynamic functions with `is_account_group_member` | Databricks Docs | High | Increases query planning time slightly |

# Proposed outline
1. Mở đầu: Nút thắt cổ chai của kiến trúc phân mảnh (Hive Metastore cục bộ) và sự ra đời của Unity Catalog như một Decoupled Governance Layer.
2. Định nghĩa & Vị trí kiến trúc: Unity Catalog là gì? (Không lưu data, chỉ quản lý metadata & credentials). Kiến trúc 3-Level Namespace.
3. Cơ chế hoạt động (Physical Execution): Token Vending Machine (Luồng cấp phép). Sơ đồ Mermaid.
4. Unity Catalog và Data Mesh: Cách map 3-level namespace vào domain-oriented architecture.
5. Đánh đổi Hệ thống (System Trade-offs): Managed vs External Tables (Vòng đời, Vendor lock-in, Performance).
6. Thực chiến (Code & Operations): RLS/CLS, Data Lineage & Throttling risks (Rate limit STS).
7. Khi nào nên/không nên dùng (Decision Framework).
8. Key terms.
9. References.

# Editorial QA
- Humanized? Yes, avoiding buzzwords like "kỷ nguyên số", "đột phá".
- Addressed trade-offs? Yes, rate limiting, RLS latency, managed vs external.
- Adequate sources? Yes, Databricks docs and architectural concepts.
