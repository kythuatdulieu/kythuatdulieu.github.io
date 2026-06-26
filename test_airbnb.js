import mermaid from "mermaid";

const graph = `
graph TD
    subgraph "Client Layer"
        C["Client / Web App"]
    end

    subgraph "API Gateway & Routing"
        GW["API Gateway"]
    end

    subgraph "Microservices Layer"
        PS["Pricing Service"]
        SS["Search Service"]
        BS["Booking Service"]
    end

    subgraph "Storage & Caching Layer"
        RC[("Redis Cluster")]
        DB[("Apache Cassandra / DynamoDB")]
    end

    subgraph "Data Engineering & ML Platform"
        Kafka["Apache Kafka - Event Bus"]
        Spark["Apache Spark - Batch Layer"]
        Flink["Apache Flink - Real-time Layer"]
        S3[("Data Lake - Hadoop/S3")]
        Zipline["Zipline / Feature Store"]
        ML["ML Inference Service"]
        Airflow["Apache Airflow - Orchestration"]
    end

    C -->|Tìm kiếm / Lướt xem| GW
    GW --> SS
    SS --> PS
    GW --> BS
    
    PS -->|1. O("1") Read from Cache| RC
    PS -->|2. Fallback Read on Cache Miss| DB
    
    C -.->|Async Click/Search/Book Events| Kafka
    S3 -->|Lịch sử 5 năm| Spark
    Kafka -->|Streaming Events| Flink
    Kafka -->|Dump raw logs| S3
    
    Spark -->|Compute Batch Features ("Daily")| Zipline
    Flink -->|Compute RT Features ("Seconds")| Zipline
    
    Zipline -->|Serve Feature Vectors| ML
    ML -->|Batch Predict Base Price| Spark
    ML -->|Real-time Multiplier Adjustment| Flink
    
    Spark -->|Bulk Load Prices| DB
    Flink -->|Upsert Surge Price| DB
    DB -->|CDC / Cache Invalidation| RC
    
    Airflow -.->|Trigger Daily Jobs| Spark
`;

async function run() {
    mermaid.initialize({ startOnLoad: false });
    try {
        await mermaid.parse(graph);
        console.log("Success");
    } catch(e) {
        console.error("Syntax Error:", e);
    }
}
run();
