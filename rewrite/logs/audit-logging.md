# Assumptions
- Target reader: Data Engineer, Platform Engineer, Security Engineer, who wants to know the physical architecture of Audit Logging in a large scale data platform, not just the compliance theory.
- Content goal: Explain how audit logging is built as a defensive infrastructure, covering SIEM integration, PII Masking, Netflix WAP architecture (proactive auditing), WORM storage (S3 Object Lock) for compliance (SOC 2), and FinOps considerations.
- The tone should be technical, straightforward, without marketing fluff.

# Research Map
1. **Data Mesh - A Data Movement and Processing Platform**
   - Org: Netflix Tech Blog
   - URL: https://netflixtechblog.com/data-mesh-a-data-movement-and-processing-platform-netflix-1288bcab2873
   - Use in section: Write-Audit-Publish (WAP). WAP pattern and Iceberg integration for proactive data quality and security checks.
2. **Using S3 Object Lock**
   - Org: AWS Docs
   - URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html
   - Use in section: WORM Storage & SOC 2. Compliance mode setup for non-repudiation.
3. **Apache Iceberg: Branching and Tagging**
   - Org: Apache Docs
   - URL: https://iceberg.apache.org/docs/latest/branching/
   - Use in section: WAP pattern code example.
4. **What is a SIEM?**
   - Org: Logz.io
   - URL: https://logz.io/learn/what-is-siem/
   - Use in section: Centralized Logging & SIEM integration context.

# Image/Figure Plan
- No external images were used. Replaced the generic concept with specific Mermaid diagrams (`graph TD` for Centralized Logging and `sequenceDiagram` for WAP pattern) with clear captions.

# Evidence Map
| Claim | Evidence | Source | Confidence | Notes |
| --- | --- | --- | --- | --- |
| WAP is used by Netflix with Iceberg | Iceberg allows atomic metadata swaps which enables the WAP pattern for data mesh. | Netflix Tech Blog / Apache Iceberg Docs | High | |
| S3 Object Lock in Compliance mode guarantees immutability | Even root users cannot delete locked objects until the retention period expires. | AWS Documentation | High | Essential for SOC 2 non-repudiation. |
| Audit logs help with FinOps in BigQuery and Snowflake | `ACCOUNT_USAGE` in Snowflake and Cloud Audit Logs in BQ can be analyzed to find query costs. | Standard FinOps Practices | High | |

# Proposed Outline
1. Mở bài bằng vấn đề cụ thể (Cartesian Explosion, Drop Table).
2. Định nghĩa & Vấn đề giải quyết (Security, Compliance, FinOps).
3. Kiến trúc Centralized Logging & Tích hợp SIEM (Mermaid flow).
4. PII Masking tại nguồn (Fluentd/Logstash regex).
5. Mô hình WAP (Netflix) kết hợp Apache Iceberg (Mermaid sequence).
6. WORM Storage & S3 Object Lock bằng Terraform.
7. Tối ưu chi phí FinOps qua Audit Logs.
8. Key terms.
9. References.

# Editorial QA
- Trả lời core question? Yes.
- Đúng target reader? Yes, it speaks to engineers with practical implementation details (Terraform, Iceberg SQL, Fluent Bit).
- Nguồn tiếng Anh uy tín? Yes, AWS, Apache, Netflix Tech Blog.
- Đã humanize, loại bỏ marketing? Yes, tone is direct and technical.
- Đã kiểm tra Mermaid syntax? Passed.
