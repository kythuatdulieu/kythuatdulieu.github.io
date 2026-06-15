# Comprehensive Audit Report: Interview Preparation Directory

## 1. Article-Level Mistakes (Factual & Technical Flaws)

### `cloud-platform-interview.md`
*   **Outdated Claim (Factual Error):** In Scenario 2, the article suggests adding a random hash prefix (Prefix Entropy) to S3 to prevent `503 Slow Down` errors. This is an obsolete practice. Since July 2018, AWS S3 automatically scales performance behind the scenes, and randomizing prefixes is no longer recommended or required. Suggesting this in a modern interview is a red flag.
*   **Technical Inaccuracy:** In Scenario 4, it claims that when EMR Spot Instances are revoked, "Spark tự động khôi phục task trên node khác mà không mất dữ liệu". In reality, losing a Spot node that holds shuffle files will cause stage failures and expensive recomputations, potentially leading to job failure if the external shuffle service isn't properly configured or backed by persistent storage. It is not entirely "without data loss" in terms of processing state.

### `spark-optimization-interview.md`
*   **Critical Logical Contradiction / OOM Risk:** In Scenario 3, it recommends explicitly broadcasting a 5GB table (`broadcast(partner_df)`) to avoid Shuffle. Broadcasting 5GB is a well-known Spark anti-pattern that will pull all 5GB to the Driver first. Crucially, in *Scenario 2 of the exact same file*, the author configured `spark.sql.driver.maxResultSize = 2g`. Attempting to broadcast 5GB with a 2GB max result size will crash the Driver immediately.

### `data-modeling-interview.md`
*   **Fundamental Dimensional Modeling Flaw:** In Scenario 1, the solution demonstrates an SCD Type 2 join by placing the effective date logic directly into the BI reporting query: `ON fact.product_id = dim.product_id AND fact.order_date >= dim.start_date AND fact.order_date < dim.end_date`. In standard Kimball dimensional modeling, this date-range lookup happens *during the ETL pipeline* to resolve the Surrogate Key. The Fact table should only store the Surrogate Key (`product_key`), allowing the reporting layer to execute a simple, fast integer join. Forcing the BI tool to perform date-range evaluations against natural keys defeats the purpose of the architecture.

### `python-de-interview.md`
*   **Missing Critical Best Practice (System Design flaw):** The Exponential Backoff implementation (`fetch_with_backoff`) simply sleeps using `time.sleep(base_wait * (2 ** attempt))`. It completely lacks "Jitter" (randomness). In production, exponential backoff without jitter leads to the "Thundering Herd" problem, a classic failure point in Senior engineering interviews.
*   **Ineffective Concurrency Throttling:** In `throttled_batch_download`, rate limiting is attempted by placing `time.sleep(0.1)` inside the main thread's loop that submits tasks to the `ThreadPoolExecutor`. This is a flawed way to implement rate limiting and does not accurately guarantee HTTP request rates across concurrent threads. A Token Bucket, Semaphore, or rate-limiter library should be used.

### `sql-interview-patterns.md`
*   **Missing Context on SQL Dialects:** The solutions heavily use syntax strictly tied to PostgreSQL (e.g., `EXTRACT(EPOCH FROM...)` and `CAST(rn || ' days' AS INTERVAL)`). An interviewee copy-pasting this logic in a Snowflake, BigQuery, or SQL Server interview would fail syntax checks. A warning about dialects is missing.
*   **Unoptimized CTE Filtering:** In the Cartesian Explosion solution (Scenario 1), the deduplication queries join using `ON o.order_id = d.order_id AND d.rn = 1`. While this executes, it is less optimal and less idiomatic than filtering the CTE directly (`SELECT * FROM DeduplicatedItems WHERE rn = 1`) before the join, allowing the query optimizer to prune data earlier.

### `pipeline-design-interview.md`
*   **State Management Inaccuracy:** In Scenario 2, it suggests keeping a 24-48 hour watermark in "bộ nhớ bộ đệm" (RAM) for Spark Streaming/Flink. Storing up to 48 hours of streaming state purely in RAM for high-volume IoT data will inevitably cause an Out of Memory error. Real-world solutions require a persistent state backend like RocksDB backed by SSDs.

---

## 2. Framework-Level Weaknesses

Based on a holistic review of the 11 files, the structure suffers from the following systemic issues:

1.  **Extreme Formulaic Repetition (Robotic Tone):**
    Almost every file rigidly adheres to the exact same subheadings: "Situation - Task - Action - Result" or "Triage - Mitigate - Communicate - RCA". While structure is good, repeating this verbatim across 11 articles makes the content feel monotonous, predictable, and reads more like a corporate template rather than engaging educational material.

2.  **Missing Architecture Diagrams (System Design Failure):**
    For a category heavily focused on "System Design" (e.g., Pipeline Design, Kafka Design, Cloud Platform), visual architecture is critical. Yet, there is only *one* basic Mermaid mindmap across the entire directory (`overview.md`). Explaining complex workflows like Change Data Capture (CDC), Lambda/Kappa architectures, or distributed streaming topologies purely via text is a major structural weakness.

3.  **Absence of "Interviewer Pushback" & Follow-ups:**
    Real technical interviews are interactive conversations. The current framework presents a problem and immediately provides a flawless, accepted solution. It structurally lacks sections for "Interviewer Follow-ups" or "Trade-off challenges" (e.g., "The interviewer asks: What if the 5GB table grows to 50GB?", or "What if Kafka drops messages?"). Preparing candidates requires showing them how to pivot when their first answer is challenged.

4.  **"Tell, Don't Show" for Infrastructure & Configurations:**
    Files like `kafka-design-interview.md` and `cloud-platform-interview.md` discuss vital configurations (e.g., tuning `batch.size`, `acks`, IAM roles, Spot instance fleets) but fail to provide any concrete `.properties`, YAML, or Terraform code snippets. The documentation lacks practical code backing up the conceptual designs.
