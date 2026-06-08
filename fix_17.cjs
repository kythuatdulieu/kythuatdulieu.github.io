const fs = require('fs');
const path = require('path');

const fixes = {
    '/src/content/docs/concepts/change-data-capture.md': `graph LR
    Source[(Source DB)] -->|CDC Connector| Kafka[Apache Kafka]
    Kafka -->|Consumer| Sink[(Data Warehouse)]`,
    '/src/content/docs/concepts/columnar-storage.md': `graph TD
    Query[SELECT AVG Age FROM Table] --> ColumnStorage[(Column-oriented Storage)]
    ColumnStorage --> ExtractAge[Extract only Age Column]
    ExtractAge --> Compute[Compute AVG]`,
    '/src/content/docs/concepts/consumer-groups.md': `graph TD
    subgraph Kafka Topic
        P0[Partition 0]
        P1[Partition 1]
    end
    subgraph Consumer Group
        C0[Consumer 0]
        C1[Consumer 1]
    end
    P0 --> C0
    P1 --> C1`,
    '/src/content/docs/concepts/data-loading.md': `graph TD
    Source[Source Data] --> Strat1[1. Append]
    Source --> Strat2[2. Upsert/Merge]
    Source --> Strat3[3. Full Overwrite]`,
    '/src/content/docs/concepts/data-mesh.md': `graph TD
    DomainA[Domain A] --> ProductA[Data Product A]
    DomainB[Domain B] --> ProductB[Data Product B]
    ProductA --> Governance[Federated Governance]
    ProductB --> Governance`,
    '/src/content/docs/concepts/embedding-models.md': `graph TD
    Text[Input Text] --> Model[Embedding Model]
    Model --> Vector[Dense Vector Array]`,
    '/src/content/docs/concepts/freshness-monitoring.md': `graph TD
    DWH[(Data Warehouse)] --> Checker[MAX timestamp Checker]
    Checker -->|Too old?| Alert[Alerting System]`,
    '/src/content/docs/concepts/kafka-topics-partitions.md': `graph TD
    Producer[Producer] -->|Hash UserID| P0[Partition 0]
    Producer -->|Hash UserID| P1[Partition 1]`,
    '/src/content/docs/concepts/medallion-architecture.md': `graph LR
    Source[Sources] --> Bronze[(Bronze)]
    Bronze --> Silver[(Silver)]
    Silver --> Gold[(Gold)]`,
    '/src/content/docs/concepts/model-serving.md': `graph TD
    Client[Client App] --> API[API Gateway]
    API --> ModelPod[Model Server Pod]
    ModelPod --> Compute[GPU Inference]`,
    '/src/content/docs/concepts/reranker.md': `graph TD
    Q[Query] --> V1[Vector Q]
    D[Document] --> V2[Vector D]
    V1 --> Cosine[Cosine Similarity]
    V2 --> Cosine`,
    '/src/content/docs/concepts/row-based-storage.md': `graph TD
    App[Web App] --> RowDB[(Row-oriented DB)]
    RowDB --> Disk[Read complete row from disk]`,
    '/src/content/docs/concepts/schema-drift.md': `graph TD
    App[Backend] --> Source[(Source DB)]
    Source --> CDC[CDC Tool]
    CDC -->|Check Schema| DWH[(Data Warehouse)]`,
    '/src/content/docs/concepts/schema-evolution.md': `graph TD
    V1[Schema V1] --> V2[Schema V2]
    V2 --> Query[Query Engine]`,
    '/src/content/docs/concepts/spark-jobs-stages-tasks.md': `graph TD
    Stage1[Stage 1] --> Shuffle[Shuffle]
    Shuffle --> Stage2[Stage 2]`,
    '/src/content/docs/concepts/zero-shot.md': `graph TD
    Prompt[User Prompt] --> LLM[LLM Engine]
    LLM --> Output[Final Output]`,
    '/src/content/docs/interview/performance-tuning-qa.md': `graph TD
    Query[Query Engine] --> S3_2026[Scan S3 year=2026]
    S3_2026 --> Sum[Compute SUM]`
};

for (const [relativePath, newMermaid] of Object.entries(fixes)) {
    const fullPath = path.join(__dirname, relativePath);
    if (!fs.existsSync(fullPath)) continue;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const parts = content.split(/```mermaid\n[\s\S]*?```/);
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    
    const blocks = [];
    let match;
    while ((match = mermaidRegex.exec(content)) !== null) {
        blocks.push(match[1]);
    }
    
    if (blocks.length > 0) {
        // Just replace the first block with the fixed simplified one
        blocks[0] = newMermaid + '\n';
        
        let built = parts[0];
        for (let i = 0; i < blocks.length; i++) {
            built += '```mermaid\n' + blocks[i] + '```' + (parts[i + 1] || '');
        }
        
        fs.writeFileSync(fullPath, built, 'utf8');
        console.log(`Replaced mermaid in ${relativePath}`);
    }
}
