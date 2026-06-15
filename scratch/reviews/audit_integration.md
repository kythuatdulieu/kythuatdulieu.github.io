# Audit Report: Concepts / 3-Integration

## 1. Article-Level Mistakes
I found several factual errors, technical inaccuracies, formatting bugs, and missing modern practices across the files:

*   **`batch-processing/apache-spark.md`**: 
    *   *Formatting bug:* The Mermaid diagram contains raw HTML `<b>` tags inside node labels without proper quoting, which can break rendering on many markdown parsers. 
    *   *Colloquial/Outdated Claim:* Claims Pandas cannot handle TB of data by saying "sập nguồn do thiếu tài nguyên" (crashes due to lack of resources). While true for base Pandas, it ignores modern single-node scalable frameworks like Dask or Polars.
*   **`batch-processing/batch-processing.md`**: 
    *   *Mermaid Bug:* Contains a broken link `Executor1` -> `E`, where node `E` is undefined inside the subgraph.
    *   *Code Snippet Issue:* Hardcodes `year=2026` in a Python snippet, which will become outdated quickly and confuse readers looking for evergreen examples.
*   **`batch-processing/spark-aqe-catalyst.md`**: 
    *   *Formatting Inconsistency:* Uses a custom `:::question Q1:` format for the "Trọng tâm ôn luyện phỏng vấn" section, which heavily conflicts with the standard `### Câu hỏi 1:` markdown format strictly adhered to in all other files.
*   **`orchestration/apache-airflow.md`**: 
    *   *Technical Inaccuracy / Missing Practice:* The tutorial strictly showcases the legacy `BashOperator` and `PythonOperator` syntax for DAG creation. It completely ignores the modern TaskFlow API (`@task`, `@dag` decorators), which has been the industry standard and best practice since Airflow 2.0.
*   **`etl-elt/integration-patterns-comparison.md`**: 
    *   *Factual Imbalance:* In Q1 of the interview section, the prompt asks to explain both MPP (Massively Parallel Processing) and Separation of Compute & Storage. However, the answer heavily focuses on Separation of Compute & Storage without adequately explaining the mechanics of MPP. 
    *   *Table Missing Info:* The comparison table lacks the "Độ trễ đồng bộ" (Sync latency) row, despite this being highlighted as a critical weakness of Reverse ETL in the text.
*   **`batch-processing/spark-memory-management.md`**: 
    *   *Repetitive Linking:* Uses fully qualified inline markdown links like `[Shuffle trong Spark](/concepts/3-integration/batch-processing/shuffle/)` repeatedly in the same paragraphs instead of linking once and using plain text thereafter.

## 2. Framework-Level Weaknesses
Based on analyzing the entire framework and 44-file structure, several structural issues and missing pieces become apparent:

*   **Redundant & Bloated Footer Structure (Duplication)**
    *   **Issue:** EVERY single file (44/44) contains overlapping and duplicate footer sections. Specifically, almost all files contain both `## Các khái niệm liên quan` and `## Xem thêm các khái niệm liên quan`. This creates unnecessary visual bloat and noise. The framework should strictly enforce a single "Related Concepts" section.
*   **Lack of Practical Code Examples in Theory-Heavy Articles**
    *   **Issue:** Out of 44 files, about 7 critical theory files entirely lack concrete code snippets (Python/SQL/YAML). Files like `spark-aqe-catalyst.md`, `integration-patterns-comparison.md`, `backfill.md`, `change-data-capture.md`, and `airflow-scheduler.md` explain theories very well but fail to show readers what these patterns look like in code (e.g., how to configure AQE properties in Spark, how to write an idempotent backfill query, or what a Reverse ETL config looks like).
*   **Complete Absence of "Troubleshooting" (Xử lý sự cố) Sections**
    *   **Issue:** The framework heavily lacks dedicated troubleshooting guides. While some articles briefly mention "Sai lầm thường gặp" (Common mistakes), they do not provide structured playbooks on how to read error logs, debug, or resolve operational issues. For instance, `apache-airflow.md` doesn't teach how to debug a failing DAG or read scheduler logs. (The only exception is `spark-memory-management.md` which has an OOM Troubleshooting table). A dedicated "Troubleshooting" section should be mandated for orchestration and processing tools.
