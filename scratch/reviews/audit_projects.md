# Comprehensive Audit Report for E2E Projects

## 1. Article-Level Mistakes

### 1.1. AWS E2E Project (`aws-e2e-project.md`)
*   **Technical Inaccuracy (CDC Schema Mismatch):** The PySpark streaming code assumes a flat JSON schema coming from MSK Connect (`transaction_id`, `user_id`, etc.). However, CDC tools like Debezium output heavily nested JSON (containing `before`, `after`, `op`, `source` blocks). Unless the `ExtractNewRecordState` Single Message Transform (SMT) is explicitly configured in MSK Connect, the `from_json` parser in the PySpark script will completely fail to extract the data. The article fails to mention this critical SMT configuration.
*   **Missing Dependencies Context:** The `spark-submit` command uses `--jars /usr/share/aws/aws-msk-iam-auth-1.1.1-all.jar`. This assumes the JAR is locally present on the EMR nodes, but the article never explains how this JAR gets provisioned to that specific path (e.g., via Bootstrap Actions or custom AMIs).
*   **Date Parsing Assumptions:** In the PySpark code, `event_time` is parsed using `to_timestamp(col("event_time"), "yyyy-MM-dd HH:mm:ss")`. CDC events from databases typically emit timestamps as Unix epoch time (milliseconds) rather than pre-formatted strings. If the database emits epochs, this parsing will return nulls.

### 1.2. Azure E2E Project (`azure-e2e-project.md`)
*   **Critical Conceptual Error (Mixing Databricks & Synapse):** The article severely confuses Azure Synapse Analytics and Azure Databricks. It claims to use "Synapse Spark" but then instructs the user to configure "Unity Catalog Governance". Unity Catalog is exclusively a Databricks feature and is fundamentally unsupported on Azure Synapse.
*   **"Frankenstein" PySpark Code:** The code block mixes Synapse-specific credential syntax (`spark.conf.get("spark.synapse.keyvault...")`) with Databricks-proprietary Delta optimizations (`spark.databricks.delta.optimizeWrite.enabled`). This code is guaranteed to crash on both platforms. Synapse will throw an error on the Databricks configs, and Databricks will fail on the Synapse Key Vault syntax.
*   **Missing External Libraries:** The code connects to Event Hubs via `format("eventhubs")` but fails to mention that the user must install the third-party `org.apache.spark.eventhubs` Maven coordinate on their Spark cluster. Without it, the code will fail immediately with a `ClassNotFoundException`.

### 1.3. GCP E2E Project (`gcp-e2e-project.md`)
*   **Oversimplification of Streaming Side Inputs:** The guide mentions broadcasting a BigQuery table as a "Side Input" for metadata lookups in a streaming Dataflow pipeline. In Apache Beam, implementing this in a streaming context is notoriously complex; it requires specific windowing and triggering mechanisms (like `GenerateSequence` + periodic reading) to handle slowly changing dimensions, none of which is explained.
*   **Invalid Python gRPC Code:** The snippet demonstrating the BigQuery Storage Write API is pseudocode that lacks valid Protobuf handling. `request.proto_rows = proto_data` is incorrect API usage; `proto_rows` expects an `AppendRowsRequest.ProtoData` object that wraps both the `writer_schema` and the `rows`. It will not compile/run as valid Python code.

## 2. Framework-Level Weaknesses

*   **Cookie-Cutter Repetitiveness:** All three articles rigidly follow the exact same structural template, going so far as to use a formulaic "name-dropping" strategy in the Business Problem section (Netflix for AWS, ASOS for Azure, Spotify for GCP). This makes the content feel highly artificial, robotic, and repetitive.
*   **Complete Absence of Troubleshooting:** Real-time data platforms are notoriously brittle, yet there is no "Troubleshooting" or "Common Pitfalls" section. What happens if MSK partitions are skewed? What if Dataflow watermarks hold back the stream? What if Delta Lake small files cause OOMs? E2E guides must address operational reality, not just the "happy path".
*   **Lack of Practical Reproducibility (No IaC):** Real-world enterprise architectures rely on Infrastructure-as-Code (Terraform, Bicep, Deployment Manager). Instructing users to set up MSK, Event Hubs, and VPCs manually undermines the "Advanced" and "Enterprise" claims of the articles.
*   **Missing Financial Context (FinOps):** Streaming architectures (MSK, Dataflow, Synapse, Composer) incur massive baseline costs. The articles claim to "tối ưu hóa chi phí" (optimize costs) but fail to provide any tangible cost estimation, FinOps warnings, or minimum cluster sizing prices, which is a major omission for an E2E project guide.
*   **Incomplete/Vague Code Examples:** While the AWS and Azure files provide flawed PySpark snippets, the GCP article provides almost no actual implementation code, substituting an entire Beam streaming pipeline with a 4-line invalid gRPC snippet. The "E2E project" promise is fundamentally unfulfilled without complete, working repository links.
