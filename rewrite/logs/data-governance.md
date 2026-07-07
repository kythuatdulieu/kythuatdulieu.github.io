# Assumptions
- The reader is a Data Engineer or Platform Engineer who already understands basic data pipelines but is facing scaling issues with access control, data quality, and compliance.
- The goal is to explain Data Governance as a deep engineering problem (contracts, IAM policies, API throttling, PBAC) rather than a compliance paperwork problem.

# Research map
- **Source 1:** PayPal's Data Contracts architecture. Covers Shift-Left Data Quality, Open Data Contract Standard (ODCS).
- **Source 2:** AWS Lake Formation architecture. Covers Vending Credentials, scoping down S3 access, avoiding long-term IAM keys.
- **Source 3:** Databricks Unity Catalog. Covers centralized metastore, 3-level namespace (`catalog.schema.table`), and decoupled storage.
- **Source 4:** Open Policy Agent (OPA) for PBAC. Covers decoupling policy from code using Rego, fine-grained access control, overcoming RBAC limits.

# Image/figure plan
- Will use Mermaid diagrams for:
  1. Data Contract CI/CD flow (graph TD).
  2. Vending Credentials architecture (sequenceDiagram).

# Evidence map
- **Claim:** Shift-left data contracts prevent downstream breakage. **Evidence:** PayPal's Data Mesh implementation uses contracts to validate data at the source.
- **Claim:** RBAC leads to role explosion. **Evidence:** Standard IAM problem when scaling teams and regions. ABAC/PBAC solves this by evaluating attributes dynamically.
- **Claim:** Lake Formation vends short-lived credentials. **Evidence:** AWS docs on `GetTemporaryGlueTableCredentials`.

# Proposed outline
1. Mở bài: Sự sụp đổ của Governance truyền thống (Paperwork vs Engineering).
2. Data Contracts & Shift-Left Quality (Chặn rác từ nguồn).
3. Kiến trúc Control Plane và Vending Credentials (Tách biệt quyền và dữ liệu).
4. RBAC, ABAC, và PBAC (Giải quyết Role Explosion).
5. Rủi ro vận hành (Token Bloat, Throttling, Orphaned Data).
6. Khi nào nên/không nên dùng.
7. Thuật ngữ chính.
8. References.

# Editorial QA
- Humanized? Yes, avoided AI buzzwords.
- Clear trade-offs? Yes, mentioned token bloat and throttling risks.
- Evidence provided? Yes, linked to AWS, Databricks, and OPA concepts.
