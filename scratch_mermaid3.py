import os

replacements = [
    ("src/content/docs/concepts/7-dataops-orchestration-quality/data-quality.md", [
        ('API["Microservices\']', 'API["Microservices"]'),
        ('Prod[\'Kafka Producer"]', 'Prod["Kafka Producer"]'),
        ('SR{"{Schema Registry<br/>(Data Contracts)"}}', 'SR{{"Schema Registry<br/>(Data Contracts)"}}'),
    ]),
    ("src/content/docs/concepts/7-dataops-orchestration-quality/distribution-drift.md", [
        ('subgraph Observability Plane("Drift Monitoring")', 'subgraph Observability_Plane ["Drift Monitoring"]')
    ]),
    ("src/content/docs/concepts/7-dataops-orchestration-quality/orchestration.md", [
        ('subgraph Data Plane("Compute Engines")', 'subgraph Data_Plane ["Compute Engines"]')
    ]),
    ("src/content/docs/concepts/7-dataops-orchestration-quality/retries-sla.md", [
        ('title Biểu đồ số lượng Request theo thời gian("Có Jitter vs Không Jitter")', 'title Biểu đồ số lượng Request theo thời gian (Có Jitter vs Không Jitter)')
    ]),
    ("src/content/docs/concepts/7-dataops-orchestration-quality/root-cause-analysis.md", [
        ('Observability Layer -->|Triggers| Alert', 'Observability_Layer["Observability Layer"] -->|Triggers| Alert')
    ]),
    ("src/content/docs/concepts/7-dataops-orchestration-quality/sensors.md", [
        ('subgraph Kiến trúc Push("Datasets")', 'subgraph Kien_truc_Push ["Datasets"]')
    ]),
    ("src/content/docs/concepts/8-security-governance-finops/data-ownership.md", [
        ('subgraph Data-as-a-Product / Data-Sharing("Producer")', 'subgraph Data_Product ["Data-as-a-Product (Producer)"]')
    ]),
    ("src/content/docs/concepts/8-security-governance-finops/metadata-management.md", [
        ('subgraph Metadata Collection("DataHub / OpenLineage")', 'subgraph Metadata_Collection ["Metadata Collection (DataHub/OpenLineage)"]')
    ]),
    ("src/content/docs/concepts/9-genai-machine-learning/context-window.md", [
        ('kv_user1 -- "20GB" --> ctx_user1', 'kv_user1 -->|"20GB"| ctx_user1'),
        ('kv_user2 -- "20GB" --> ctx_user2', 'kv_user2 -->|"20GB"| ctx_user2'),
        ('kv_user3 -- "40GB" --> ctx_user3', 'kv_user3 -->|"40GB"| ctx_user3')
    ]),
    ("src/content/docs/concepts/9-genai-machine-learning/few-shot-prompting.md", [
        ('B -- No("Cache Miss") --> D', 'B -- "No(Cache Miss)" --> D'),
        ('D["', 'D["') # Just a dummy to match earlier broken quote
    ]),
    ("src/content/docs/concepts/9-genai-machine-learning/llm-as-a-judge.md", [
        ('class Evaluation Path eval;', 'class Evaluation_Path eval;')
    ]),
    ("src/content/docs/concepts/9-genai-machine-learning/model-serving.md", [
        ('scheduler -- "Batch 1" --> model1', 'scheduler -->|"Batch 1"| model1'),
        ('scheduler -- "Batch 2" --> model2', 'scheduler -->|"Batch 2"| model2'),
        ('scheduler -- "Batch 3" --> model3', 'scheduler -->|"Batch 3"| model3')
    ]),
    ("src/content/docs/concepts/9-genai-machine-learning/top-p.md", [
        ('A["Hidden States("từ lớp Transformer cuối\')\'] -->|Linear Projection| B(\'Logits vector: kích thước ~100k")', 'A["Hidden States (từ lớp Transformer cuối)"] -->|Linear Projection| B["Logits vector: kích thước ~100k"]')
    ]),
    ("src/content/docs/interview/overview.md", [
        ('int user_id PK "unique, index"', 'int user_id PK "unique index"')
    ]),
    ("src/content/docs/interview/pipeline-design-interview.md", [
        ('D -. "dbt("Transform") .-> E', 'D -.->|"dbt(Transform)"| E'),
        ('E -. "dbt("Transform") .-> F', 'E -.->|"dbt(Transform)"| F')
    ])
]

def fix_all():
    for filepath, rules in replacements:
        if not os.path.exists(filepath):
            continue
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            for old, new in rules:
                if old in content:
                    content = content.replace(old, new)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Processed {filepath}")
        except Exception as e:
            print(f"Error on {filepath}: {e}")

if __name__ == "__main__":
    fix_all()
