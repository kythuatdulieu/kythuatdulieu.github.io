# Assumptions
- Target audience: Data Engineers, Data Platform Engineers, Tech Leads looking to optimize cloud spend.
- Tone: Technical, direct, no marketing fluff, pragmatic.
- The user is already familiar with general concepts like S3, Spark, Databricks, and wants to understand how to apply FinOps principles practically at the physical/architectural level.

# Research map
1. **Title:** Applying FinOps Principles to Data Engineering
   **Org:** FinOps Foundation (General principles)
   **Why credible:** Official FinOps foundation documentation and guidelines.
   **Main claims:** Shift from treating cloud spend as static infrastructure to dynamic product-oriented cost. Establish visibility (tagging, unit economics). Optimize (right-sizing compute, storage lifecycle). Operate (Cost-aware CI/CD, budget guardrails).

2. **Title:** Chaos to Control: Cost Maturity Journey
   **Org:** Databricks
   **Why credible:** Official Databricks blog on cost optimization.
   **Main claims:** Workload efficiency over just turning off servers. Photon acceleration, Liquid Clustering, Job Clusters vs All-purpose clusters, auto-termination.

3. **Title:** Amazon S3 Object Lifecycle Management
   **Org:** AWS Documentation
   **Why credible:** Official AWS Docs.
   **Main claims:** S3 Intelligent-Tiering is best for unknown access patterns. Lifecycle policies for transitioning and expiring data (e.g., aborting incomplete multipart uploads).

4. **Title:** FinOps for Data Teams
   **Org:** Revefi / CloudZero / Medium
   **Why credible:** Industry practices.
   **Main claims:** Cartesian explosion and OOMKilled issues are massive money burners. Retry storms cause unnecessary compute and network egress.

# Image/figure plan
| Figure | Source | Use in section | Caption | Alt text | License note |
| --- | --- | --- | --- | --- | --- |
| Data FinOps Framework | FinOps Foundation (Adapted) | Core Concepts | (Mermaid diagram) | Data FinOps Pillars | Adapted to Mermaid |

# Evidence map
| Claim | Evidence | Source | Confidence | Notes |
| --- | --- | --- | --- | --- |
| Job clusters are cheaper than all-purpose clusters for scheduled workloads. | Databricks pricing model and best practices. | Databricks Docs | High | Well known |
| S3 Intelligent-Tiering saves money for unknown access patterns. | AWS documentation explicitly states this and removes retrieval fees. | AWS Docs | High | |
| Cartesian explosion causes OOM and excessive shuffle. | Spark internals. | General Spark tuning knowledge | High | Broadcast Hash Join mitigates this. |
| Small files cause high GET request costs and slow scans. | S3 pricing model (per 1000 requests) and Parquet/Iceberg metadata overhead. | S3 Docs / Iceberg Docs | High | Z-Ordering and Compaction fix this. |

# Proposed outline
1. **Vấn đề cốt lõi:** Data Engineering FinOps không phải là tắt máy chủ, mà là tối ưu ở tầng vật lý (Physical Execution Layer).
2. **Đánh đổi kiến trúc:** Compute Cost vs. Storage Cost (Serverless vs Provisioned, Normalized vs Denormalized).
3. **Các "Sự Cố Đốt Tiền" Điển Hình:**
   - Cartesian Explosion & OOMKilled (Broadcast Hash Join).
   - The Small File Problem & Z-Ordering (Iceberg/Delta).
   - Retry Storms (Exponential Backoff).
4. **Tối Ưu Xử Lý:** Incremental Load (MERGE, SCD Type 2) thay vì Full Refresh.
5. **Databricks & Compute FinOps:** Job Clusters, Auto-termination, Photon.
6. **S3 Storage Lifecycle & IaC (Terraform):** Tagging bắt buộc, Tiering, dọn dẹp file rác.
7. **References**

# Editorial QA
- Humanized? Yes, avoided AI words.
- Eliminated marketing? Yes.
- Adequate sources? Yes, referenced FinOps Foundation, AWS, Databricks.
- Weak claims? None.
