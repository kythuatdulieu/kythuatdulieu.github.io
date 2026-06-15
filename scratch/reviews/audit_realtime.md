# Audit Report: Realtime Concepts Directory

## 1. Article-Level Mistakes & Inaccuracies

### Apache Kafka (`apache-kafka.md`)
- **Factual Inaccuracy:** The article states that "Từ phiên bản Kafka 3.3 trở đi, Zookeeper đã được thay thế hoàn toàn bằng giao thức KRaft". This is misleading. In Kafka 3.3, KRaft was marked production-ready for new clusters, but Zookeeper wasn't fully replaced or removed until Kafka 4.0.
- **Outdated Code:** The Python snippet uses `kafka-python`, an unmaintained and outdated library. It should be replaced with `confluent-kafka` for production-level standards.

### Kafka Topics & Partitions (`kafka-topics-partitions.md`)
- **Technical Inaccuracy (Partitioning Strategy):** The article claims that for null keys (Key = NULL), "Kafka sẽ áp dụng chiến lược phân phối vòng tròn (Round-robin)." This is outdated. Since Kafka 2.4 (KIP-480), the default partitioner uses "Sticky Partitioner" for null keys to improve batching efficiency, rather than strict round-robin.
- **Outdated Code:** Similar to `apache-kafka.md`, the code snippet relies on the deprecated `kafka` (`kafka-python`) library.

### Spark Structured Streaming (`spark-structured-streaming.md`)
- **Contextual Gap:** It states Continuous Processing can achieve sub-millisecond latency but doesn't heavily emphasize that it remains highly experimental and lacks widespread production adoption compared to micro-batching.

### Streaming Processing (`streaming-processing.md`)
- **Code Snippet Bug:** In the PySpark snippet, `(col("is_foreign") == True)` is used. While it works, the idiomatic PySpark approach is simply `col("is_foreign")` or `col("is_foreign") == lit(True)`.

### Stream-Table Duality (`stream-table-duality.md`)
- **Omission:** In the ksqlDB example, when defining `account_balances` as a table, it doesn't mention that the underlying Kafka topic created for this materialized view uses log compaction by default. This is a critical link to the "Log Compaction" interview question later in the article.

### Flink Examples (`watermark.md`, `windowing.md`, `exactly-once-semantics.md`)
- **Syntax / Deprecation:** In `windowing.md`, `SlidingEventTimeWindows.of(Time.hours(1), Time.minutes(10))` is used. Note that Flink's newer API prefers `Duration` (e.g., `Duration.ofHours(1)`) as `Time` is being phased out in modern Flink versions.

## 2. Framework-Level Weaknesses

Based on a holistic reading of the 12 files in the `4-realtime` directory, the following structural gaps and weaknesses exist:

### A. Lack of Operational & Troubleshooting Guides
While the articles brilliantly explain the *theory* (e.g., what is a Rebalance Storm, what is Watermark), they severely lack practical operations advice. There is almost zero mention of **Monitoring & Metrics**. For example:
- How do you actually monitor Consumer Lag? (Missing mentions of Burrow, Kafka Exporter, or JMX metrics).
- How do you debug Flink Checkpoint failures? (Missing mentions of Flink Web UI, backpressure monitoring).
- How do you debug Spark Structured Streaming? (Missing mentions of the Spark UI Streaming tab).

### B. Inconsistent Ecosystem Tooling
The code examples jump between PySpark, Java (Flink), and outdated Python libraries (`kafka-python` vs `confluent-kafka`). The framework lacks a unified codebase approach. It would be significantly better if the snippets standardized around modern libraries (like `confluent-kafka` for Python) and perhaps provided both Python (PySpark/PyFlink) and Java/Scala snippets.

### C. Missing Testing Strategies
Streaming applications are notoriously difficult to test. The entire directory misses a crucial topic: **How to test real-time pipelines**. There is no mention of `TopologyTestDriver` for Kafka, `MiniCluster` for Flink, or memory stream sinks for PySpark. Without testing, the theoretical knowledge cannot be confidently deployed to production.

### D. Over-focus on Engine Theory, Under-focus on Serialization
The framework thoroughly covers engines (Spark, Flink) and brokers (Kafka), but ignores the critical role of data serialization in real-time streams. There is no dedicated article on **Schema Registry, Avro, Protobuf, or JSON**. In real-time streaming, managing schema evolution (Schema Registry) is a massive pain point that is completely missing from this syllabus.

### E. Abstract Real-World Use Cases
The articles often use generic examples ("bank transactions", "user clicks"). The directory lacks an overarching, end-to-end reference architecture diagram showing how Kafka, Flink/Spark, and a Sink (like Delta Lake or Elasticsearch) wire together in a real production environment. A capstone architectural article synthesizing all these concepts is missing.
