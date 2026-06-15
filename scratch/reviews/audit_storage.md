# Audit Report: `/concepts/2-storage/`

This audit covers the `data-warehouse/` and `database-storage/` directories. Note: The audit findings for `cloud-data-platform/` and `data-lake-lakehouse/` were completed in a previous session.

## Directory: `data-warehouse/`

### 1. Article-Level Mistakes & Inaccuracies
*   **`surrogate-key.md`**: States that auto-increment is a bottleneck in modern DWs like BigQuery/Snowflake, so hashing is preferred. Technically, BigQuery does not natively support standard `AUTO_INCREMENT` column definitions like RDBMS does (it relies on `GENERATE_UUID()`), while Snowflake has `AUTOINCREMENT` but doesn't guarantee gapless sequences. The explanation is slightly inaccurate regarding the capabilities of specific modern tools.
*   **`slowly-changing-dimension.md`**: Excellent coverage of Types 0-6. However, Type 6 is described as a combination but lacks a clear Mermaid diagram, making it very hard to visualize. Also, it fails to explain how Type 4 (History Table) is queried cleanly alongside the active table.
*   **`fact-table.md`**: Mentions Transaction, Periodic, and Accumulating snapshots. It entirely misses **"Factless Fact Tables"**, which is a crucial Kimball concept and a very common data engineering interview question.
*   **`inmon-methodology.md` vs `kimball-methodology.md`**: The comparison feels dated. Describing Inmon as purely "Top-down" and Kimball as "Bottom-up" without mentioning the modern hybrid architecture (like Data Vault 2.0 or hybrid staging) leaves the reader without current industry context.

### 2. Framework-Level Weaknesses
*   **Lack of Hands-on SQL Implementation**: The entire directory is highly theoretical. There is no actionable SQL provided. For instance, how do you write a `MERGE` statement for an SCD Type 2? How do you populate a fact table using `INSERT OVERWRITE`? This is a huge missing piece for learners.
*   **Redundancy Across Files**: `star-schema.md`, `dimension-table.md`, and `fact-table.md` repeat the same definitions over and over. They could be structured better or consolidated.
*   **Missing Modern Cloud Data Warehouse Context**: Concepts are heavily rooted in traditional on-premise RDBMS. Modern cloud DWs (like BigQuery) often rely on nested and repeated fields (Arrays/Structs) rather than strict Star Schemas, which fundamentally changes how dimensions and facts are modeled. This is not addressed.

---

## Directory: `database-storage/`

### 1. Article-Level Mistakes & Inaccuracies
*   **`relational-database.md`**: Claims that `TRUNCATE` is a DDL command and generally cannot be rolled back ("thông thường không thể Rollback"). While true for MySQL/Oracle, in PostgreSQL, `TRUNCATE` is transaction-safe and can be fully rolled back within a transaction block. This nuance is often tested in interviews.
*   **`compression-algorithms.md`**: States that Snappy is best for Spark Shuffle. While historically true, Spark changed its default shuffle compression from Snappy to LZ4 in version 2.0 due to performance optimizations.
*   **`partitioning.md`**: The example uses PostgreSQL and claims that if a new row doesn't match a partition, "lệnh ghi sẽ bị lỗi ngay lập tức". It fails to contrast this with modern Data Lakes (Hive/S3), where dynamic partitioning simply auto-creates a new folder/path without throwing an error.
*   **`clustering.md`**: Mentions that Snowflake charges serverless compute costs for auto-clustering. This is correct, but the text misses an opportunity to mention the "Small File Problem" that occurs if clustering/partitioning is done too granularly.
*   **`query-engines-architecture.md`**: Does a great job comparing Trino, ClickHouse, and Druid. However, it misses the operational limitations of Druid regarding high-cardinality `GROUP BY` operations, which ClickHouse handles much better.

### 2. Framework-Level Weaknesses
*   **Lack of Benchmarks and Practical Proofs**: The articles explain "Columnar is faster for OLAP than Row-based", but it lacks a concrete benchmark. Providing a real-world example (e.g., querying 1GB of CSV vs Parquet) with execution times would dramatically improve the educational value.
*   **Repetitive Content**: `oltp-olap-htap-comparison.md` rehashes the exact same points already made in `olap.md` and `oltp.md`. The framework could be optimized by merging them.
*   **Missing Production Troubleshooting**: The articles explain *how* to use Partitioning, but not the *dangers* of it. For example, hitting the 4000 partitions limit per query in Athena/BigQuery, or the metadata overhead of having too many partitions (the Small File Problem) in HDFS/S3.
*   **Missing Crucial Topics**: There is no dedicated file for **Vector Databases** (like Milvus, Qdrant, Pinecone), which is currently a massive storage topic in the era of AI and RAG (Retrieval-Augmented Generation).
