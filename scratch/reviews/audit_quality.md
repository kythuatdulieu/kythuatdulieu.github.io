# Audit Report: 5-quality-governance

## 1. Article-Level Mistakes (Factual, Technical, Formatting)

### `data-reconciliation.md`
- **Technical Inaccuracy (Hash Collisions):** The article suggests using `MD5(CONCAT(id, name, amount))` to create a row hash for data reconciliation. This is a classic data engineering anti-pattern because it is highly susceptible to hash collisions (e.g., `id='12', name='3'` yields the same string `'123'` as `id='1', name='23'`). It should explicitly recommend using a delimiter, e.g., `MD5(CONCAT(id, '|', name, '|', amount))` or using `CONCAT_WS()`.

### `data-quality-dimensions.md`
- **Mismatched SQL Example:** In the "Tính nhất quán (Consistency)" section, the text describes consistency as checking if values match across tables (e.g., "bảng `users` ghi nhận khách hàng A là Nam, nhưng bảng `crm_sales` lại ghi khách hàng A là Nữ"). However, the provided SQL snippet performs a `LEFT JOIN ... WHERE b.user_id IS NULL`, which actually checks for *Referential Integrity / Completeness* (whether the ID exists in the other table), not value consistency. The SQL should instead be something like `WHERE a.gender <> b.gender`.

### `access-control.md` & `data-classification.md`
- **Missing Dialect Context:** Both files provide SQL code for ABAC (Attribute-Based Access Control) using `CREATE MASKING POLICY`. This is specific to Snowflake SQL syntax. While the examples are great, the articles fail to explicitly state that this syntax is not standard SQL (e.g., won't work in PostgreSQL or MySQL), which could confuse beginners trying to run the code on their local setups.

### `alerting-incident-response.md`
- **Misaligned Practical Example:** The alerting example uses Prometheus Alertmanager YAML. While technically correct for infrastructure, Prometheus is rarely used for *Data Pipeline* alerting. It would be much more accurate and practical to show an Airflow SLA miss callback (`sla_miss_callback` in Python) or a dbt test failure webhook, as these are the tools Data Engineers actually use for data incidents.

### `anomaly-detection.md`
- **Minor limitation explanation:** The SQL snippet uses Z-Score `WHERE z_score > 3`. While mathematically correct, Z-scores are highly sensitive to extreme outliers and assume a normal distribution. The article mentions this briefly as a "Con", but does not elaborate that IQR (Interquartile Range) or MAD (Median Absolute Deviation) are much better alternatives for robust data engineering anomaly detection.

---

## 2. Framework-Level Weaknesses

### 1. Forced "Pros/Cons" and "When to Use" Sections
The educational framework strictly enforces a template that includes "Pros and Cons" and "When to Use" for every article. While this works well for architecture patterns (e.g., Data Warehouse vs. Data Lake), it feels forced and unnatural for process-oriented concepts. For example, in `root-cause-analysis.md` or `alerting-incident-response.md`, there are no real "Cons" or "When NOT to use" RCA—it is universally a best practice. The framework should allow flexibility to omit these sections for methodology articles to avoid repetitive filler content.

### 2. Missing End-to-End Implementation Guide (The "Glue")
The directory contains excellent theoretical explanations of individual components (Data Quality, Observability, Alerting, Lineage). However, there is no overarching "hands-on" or architectural guide that glues them together. A reader finishes the module understanding what dbt tests, Soda, PagerDuty, and Airflow do individually, but lacks a reference architecture diagram or tutorial showing how a complete, automated Data Observability stack is orchestrated in production.

### 3. Gap in "Data Contract" Enforcement
Articles like `schema-drift.md` and `root-cause-analysis.md` heavily promote "Data Contracts" as the ultimate solution to upstream backend changes. However, there is no deep dive within this governance module on *how* to physically enforce a data contract (e.g., using JSON Schema, Protobuf, Avro, and integrating it into the CI/CD pipeline with a Schema Registry). It leaves the reader hanging on the implementation details.

### 4. Over-reliance on Enterprise SaaS Examples
Many concepts lean heavily on proprietary, expensive tools for their examples (e.g., Databricks Unity Catalog, Monte Carlo, Datadog). While open-source tools (dbt, Great Expectations) are mentioned, the framework would benefit from a dedicated section showing an "Open-Source Quality & Governance Stack" to cater to startups and learners without enterprise budgets.
