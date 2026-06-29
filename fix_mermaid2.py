import os
import re

def fix_file(filepath, replacements):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

fix_file("src/content/docs/concepts/3-storage-engines-formats/delta-lake.md", [
    ('D -- KHÔNG("Chưa ai lấy version này") --> H["Commit thành công"]', 'D -->|"KHÔNG (Chưa ai lấy version này)"| H["Commit thành công"]')
])

fix_file("src/content/docs/concepts/3-storage-engines-formats/medallion-architecture.md", [
    ('GoldTable -- "Truy vấn nhanh (Low Latency\') .-> BI(\'(Power BI / Tableau")', 'GoldTable -.->|"Truy vấn nhanh (Low Latency)"| BI["Power BI / Tableau"]')
])

fix_file("src/content/docs/concepts/3-storage-engines-formats/olap.md", [
    ('-.-> Vectorized    end', '-.-> Vectorized\n    end'),
    ('graph TD\n    subgraph disk[Đĩa cứng]\n\n    group disk("server")[Đĩa D cứng]', 'graph TD\n    subgraph disk[Đĩa cứng]\n'),
    ('group disk("server")[Đĩa D cứng]', ''),
    ('architecture-beta\n    group disk("server")[Đĩa D cứng]', 'graph TD\n    subgraph disk[Đĩa cứng]')
])

fix_file("src/content/docs/concepts/3-storage-engines-formats/oltp.md", [
    ('-->|Asynchronous Checkpoint<br/>(Random I/O)| DataFiles', '-->|"Asynchronous Checkpoint<br/>(Random I/O)"| DataFiles')
])

fix_file("src/content/docs/concepts/3-storage-engines-formats/snowflake.md", [
    ('Compute ==>|Đọc/Ghi dữ liệu vật lý (Bỏ qua Caching)| Storage', 'Compute ==>|"Đọc/Ghi dữ liệu vật lý (Bỏ qua Caching)"| Storage')
])

fix_file("src/content/docs/concepts/4-compute-engines-batch/spark-aqe-adaptive-query.md", [
    ('C{"Sort \\n(Shuffle Write)"} ', 'C{"Sort \\n(Shuffle Write)"}')
])

fix_file("src/content/docs/concepts/5-stream-processing-realtime/apache-kafka.md", [
    ('subgraph "KRaft Era("Modern")"', 'subgraph KRaft_Era ["KRaft Era (Modern)"]')
])

fix_file("src/content/docs/concepts/7-dataops-orchestration-quality/blue-green-deployment-data.md", [
    ('subgraph "3. PUBLISH("Production/Blue")"', 'subgraph PUBLISH ["3. PUBLISH (Production/Blue)"]')
])

fix_file("src/content/docs/concepts/8-security-governance-finops/data-ownership.md", [
    ('subgraph "Domain: FinTech("Consumer")"', 'subgraph Domain_FinTech ["Domain: FinTech (Consumer)"]')
])

fix_file("src/content/docs/concepts/8-security-governance-finops/metadata-management.md", [
    ('subgraph "Pull-based Architecture("AWS Glue Crawler")"', 'subgraph Pull_based_Architecture ["Pull-based Architecture (AWS Glue Crawler)"]')
])

fix_file("src/content/docs/concepts/4-compute-engines-batch/databricks.md", [
    ('architecture-beta\n    group cp("cloud")[Control Plane(\'Databricks Account\')]', 'graph TD\n    subgraph cp[Control Plane: Databricks Account]\n'),
    ("group dp('cloud')[Data Plane('Customer VPC')]", '    end\n    subgraph dp[Data Plane: Customer VPC]\n')
])
