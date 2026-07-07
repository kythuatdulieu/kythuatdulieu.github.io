# Assumptions
- The target audience is Middle to Advanced Data Engineers looking to understand the architectural and practical aspects of cost optimization (FinOps) in modern cloud data platforms.
- The article should be technical, practical, and devoid of marketing fluff.
- Since diagrams are encouraged, a Mermaid diagram illustrating the "Compute vs. Storage Trade-off" (Materialized Views) is appropriate.

# Research map
1. **Title**: Cost Optimization Pillar
   - **Org**: AWS (Well-Architected Framework)
   - **URL**: https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html
   - **Type**: docs
   - **Why credible**: Official AWS architectural guidelines.
   - **Main claims**: Adopt a consumption model, measure overall efficiency, analyze and attribute expenditure.
2. **Title**: Estimate and control costs
   - **Org**: Google Cloud (BigQuery)
   - **URL**: https://cloud.google.com/bigquery/docs/estimate-costs
   - **Type**: docs
   - **Why credible**: Official Google Cloud BigQuery docs.
   - **Main claims**: Query costs driven by data scanned. Avoid SELECT *, use partitioning and clustering, dry run queries. Set expiration policies for storage.
3. **Title**: Understanding Cost Management in Snowflake
   - **Org**: Snowflake
   - **URL**: https://docs.snowflake.com/en/user-guide/cost-understanding
   - **Type**: docs
   - **Why credible**: Official Snowflake docs.
   - **Main claims**: Visibility, control, and optimization. Use Auto-Suspend for virtual warehouses, attribute costs via tags.
4. **Title**: A Crawl, Walk, Run Approach to Cloud FinOps
   - **Org**: Databricks
   - **URL**: https://www.databricks.com/blog/2023/04/13/crawl-walk-run-approach-cloud-finops.html
   - **Type**: blog
   - **Why credible**: Industry-leading data platform engineering blog.
   - **Main claims**: Incremental approach to FinOps: Cost Attribution (Visibility) -> Reporting -> Controls (Budgets/Policies) -> Optimization.

# Image/figure plan
| Figure | Source | Use in section | Caption | Alt text | License note |
| --- | --- | --- | --- | --- | --- |
| Compute vs Storage Trade-off | Adapted | 1.2 | Sơ đồ đánh đổi chi phí Compute và Storage thông qua việc sử dụng Materialized View. | Compute vs Storage Trade-off | Mermaid diagram, adapted from general data platform architectures. |

# Evidence map
| Claim | Evidence | Source | Confidence | Notes |
| --- | --- | --- | --- | --- |
| BigQuery charges per bytes scanned (On-Demand) | "Query costs are primarily driven by the amount of data scanned" | Google Cloud | High | |
| BigQuery partitioning reduces costs | "Divide large tables into partitions (e.g., by date)... to ensure BigQuery only scans relevant data" | Google Cloud | High | |
| Snowflake virtual warehouses burn budget if left idle | "Configure aggressive AUTO_SUSPEND settings to stop warehouses when idle." | Snowflake | High | |
| FinOps requires continuous visibility and cost attribution | "Analyze and Attribute Expenditure: Increase visibility into usage and costs to ensure you can attribute spending accurately" | AWS | High | |

# Proposed outline
1. Introduction: Define FinOps, the risk of "pay-as-you-go" turning into a massive bill.
2. The Systemic Trade-offs: Batch vs Streaming (Spot instances vs 24/7 uptime), Compute vs Storage (Materialized views).
3. Platform-Specific FinOps Architecture: Snowflake (Workload isolation, auto-suspend), BigQuery (Partitioning, avoiding full scans).
4. Data Gravity and Cloud Egress Tax: Why moving data out of the cloud is expensive and how to avoid it.
5. FinOps Governance & Culture: Tagging, Chargeback, and the "Freedom and Responsibility" culture.
6. Key terms table.
7. References.

# Editorial QA
- Humanized? Yes, removing "trong kỷ nguyên số", "đóng vai trò quan trọng".
- Marketing removed? Yes, focused on actual system behavior (Cartesian explosion, spot instances).
- Enough sources? Yes, 4 strong official docs/engineering blogs.
- Needs further reading? Added AWS and Databricks links.
