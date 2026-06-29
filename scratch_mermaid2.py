import re

files = {
    "src/content/docs/concepts/7-dataops-orchestration-quality/orchestration.md": [
        (r'subgraph Control Plane\("Airflow Cluster"\)', r'subgraph Control_Plane ["Airflow Cluster"]')
    ],
    "src/content/docs/concepts/7-dataops-orchestration-quality/retries-sla.md": [
        (r'title Biểu đồ số lượng Request theo thời gian\("Có Jitter vs Không Jitter"\)', r'title Biểu đồ số lượng Request theo thời gian (Có Jitter vs Không Jitter)')
    ],
    "src/content/docs/concepts/7-dataops-orchestration-quality/root-cause-analysis.md": [
        (r'Observability Layer -->\|Triggers\| \n', r'Observability Layer -->|Triggers| Alerting\n')
    ],
    "src/content/docs/concepts/7-dataops-orchestration-quality/sensors.md": [
        (r'subgraph Kiến trúc Pull\("Sensor"\)', r'subgraph Kien_truc_Pull ["Kiến trúc Pull (Sensor)"]')
    ],
    "src/content/docs/concepts/8-security-governance-finops/data-ownership.md": [
        (r'subgraph Data-as-a-Product / Data-Sharing\("Producer"\)', r'subgraph Data_as_a_Product ["Data-as-a-Product / Data-Sharing (Producer)"]')
    ],
    "src/content/docs/concepts/8-security-governance-finops/metadata-management.md": [
        (r'subgraph Metadata Collection\("DataHub / OpenLineage"\)', r'subgraph Metadata_Collection ["Metadata Collection (DataHub / OpenLineage)"]')
    ],
    "src/content/docs/concepts/9-genai-machine-learning/context-window.md": [
        (r'subgraph Memory\("GPU Memory - 80GB H100"\)', r'subgraph Memory ["GPU Memory - 80GB H100"]'),
        (r'kv_user1 -- "20GB" --> ctx_user1', r'kv_user1 -->|20GB| ctx_user1'),
        (r'kv_user2 -- "20GB" --> ctx_user2', r'kv_user2 -->|20GB| ctx_user2'),
        (r'kv_user3 -- "40GB" --> ctx_user3', r'kv_user3 -->|40GB| ctx_user3')
    ],
    "src/content/docs/concepts/9-genai-machine-learning/embedding-model.md": [
        (r'\["Query \+ \'\[SEP"\]\' \+ Document\]', r'["Query + [SEP] + Document"]')
    ],
    "src/content/docs/concepts/9-genai-machine-learning/few-shot-prompting.md": [
        (r'B -- Yes\("Cache Hit"\) --> C', r'B -- "Yes (Cache Hit)" --> C')
    ],
    "src/content/docs/concepts/9-genai-machine-learning/llm-as-a-judge.md": [
        (r'class Execution Path path;', r'class Execution_Path path;')
    ],
    "src/content/docs/concepts/9-genai-machine-learning/model-serving.md": [
        (r'subgraph vLLM\("vLLM Continuous Batching"\)', r'subgraph vLLM ["vLLM Continuous Batching"]'),
        (r'scheduler -- "Batch 1" --> model1', r'scheduler -->|Batch 1| model1'),
        (r'scheduler -- "Batch 2" --> model2', r'scheduler -->|Batch 2| model2'),
        (r'scheduler -- "Batch 3" --> model3', r'scheduler -->|Batch 3| model3')
    ],
    "src/content/docs/concepts/9-genai-machine-learning/top-p.md": [
        (r'\]\'\]', r'"]')
    ],
    "src/content/docs/interview/overview.md": [
        (r'int user_id PK "unique, index"', r'int user_id PK "unique index"')
    ],
    "src/content/docs/interview/pipeline-design-interview.md": [
        (r'\-\. "dbt\(\"Transform\"\)" \.\-> E', r'-. "dbt(Transform)" .-> E')
    ]
}

def fix_all():
    for filepath, rules in files.items():
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            for pattern, replacement in rules:
                content = re.sub(pattern, replacement, content)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {filepath}")
        except Exception as e:
            print(f"Error on {filepath}: {e}")

if __name__ == "__main__":
    fix_all()
