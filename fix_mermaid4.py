import os
import re

def replace_in_file(filepath, replacements):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    orig_content = content
    for old, new in replacements:
        content = content.replace(old, new)
        content = re.sub(old, new, content) # if regex
    if content != orig_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

# 1. key-value-store
replace_in_file('src/content/docs/concepts/1-distributed-systems-architecture/key-value-store.md', [
    (r'subgraph Key-Value Store <Strong Consistency>', r'subgraph KVStore ["Key-Value Store <Strong Consistency>"]'),
    (r'subgraph Key-Value Store', r'subgraph KVStore ["Key-Value Store"]')
])

# 2. databricks-platform
replace_in_file('src/content/docs/concepts/3-storage-engines-formats/databricks-platform.md', [
    (r'subgraph cloud"\)\["Control Plane\(\'Databricks Account"\]', r'subgraph cloud ["Control Plane (Databricks Account)"]'),
    (r'subgraph cloud"\)\["Data Plane\(\'Customer VPC / VNet"\]', r'subgraph cloud2 ["Data Plane (Customer VPC / VNet)"]'),
    (r'subgraph cloud"\)\[Control Plane\(\'Databricks Account"\]', r'subgraph cloud ["Control Plane (Databricks Account)"]'),
    (r'subgraph cloud"\)\[Data Plane\(\'Customer VPC / VNet"\]', r'subgraph cloud2 ["Data Plane (Customer VPC / VNet)"]'),
    # To be safe, just regex any weird subgraph
    (r'subgraph cloud"\)\[.*?\]', r'subgraph cloud ["Control Plane"]'),
    (r'subgraph (.*?)\("\)(.*)', r'subgraph \1 \2')
])
# Let's write a generic fixer for databricks:
with open('src/content/docs/concepts/3-storage-engines-formats/databricks-platform.md', 'r') as f:
    c = f.read()
c = c.replace('subgraph cloud")[Control Plane(\'Databricks Account"]', 'subgraph cloud ["Control Plane (Databricks Account)"]')
c = c.replace('subgraph data_plane")[Data Plane(\'Customer VPC / VNet"]', 'subgraph data_plane ["Data Plane (Customer VPC / VNet)"]')
c = c.replace('subgraph cloud")[Data Plane(\'Customer VPC / VNet"]', 'subgraph data_plane ["Data Plane (Customer VPC / VNet)"]')
c = c.replace('Provision & Monitor("', '"Provision & Monitor"')
c = c.replace('Write Data "High Bandwidth"', '"Write Data High Bandwidth"')
with open('src/content/docs/concepts/3-storage-engines-formats/databricks-platform.md', 'w') as f:
    f.write(c)

# 3. olap
replace_in_file('src/content/docs/concepts/3-storage-engines-formats/olap.md', [
    (r'p_ram\("Memory Node"\)\["RAM - Sparse Index', r'p_ram["Memory Node: RAM - Sparse Index')
])

# 4. spark-data-skew-salting
replace_in_file('src/content/docs/concepts/4-compute-engines-batch/spark-data-skew-salting.md', [
    (r'T1\(Task 1\]', r'T1["Task 1"]'),
    (r'T2\(Task 2\]', r'T2["Task 2"]'),
    (r'T3\(Task 3\]', r'T3["Task 3"]')
])

# 5. chandy-lamport-checkpointing
replace_in_file('src/content/docs/concepts/5-stream-processing-realtime/chandy-lamport-checkpointing.md', [
    (r'Stream 1 -->', r'Stream_1 -->'),
    (r'Stream 2 -->', r'Stream_2 -->')
])

# 6. airflow-celery-vs-k8s-executor
replace_in_file('src/content/docs/concepts/7-dataops-orchestration-quality/airflow-celery-vs-k8s-executor.md', [
    (r'C1\["Celery Worker 1\\n\(\'Concurrency: 16\'\)"', r'C1["Celery Worker 1 Concurrency: 16"]')
])

# 7. data-ownership
replace_in_file('src/content/docs/concepts/8-security-governance-finops/data-ownership.md', [
    (r'subgraph Consumer: FinTech\("Consumer"\)', r'subgraph Consumer ["FinTech (Consumer)"]'),
    (r'subgraph Consumer: Stream Processing', r'subgraph StreamProcessing ["Consumer: Stream Processing"]')
])

# 8. ai-agent
replace_in_file('src/content/docs/concepts/9-genai-machine-learning/ai-agent.md', [
    (r'End\[\(End\]\)', r'End[(End)]')
])

# 9. ndcg
replace_in_file('src/content/docs/concepts/9-genai-machine-learning/ndcg.md', [
    (r'L2\("L2: Cross-Encoder Reranker"\)', r'L2')
])

