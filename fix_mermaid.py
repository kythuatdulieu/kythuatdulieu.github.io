import os
import re

fixes = [
    ("src/content/docs/concepts/3-storage-engines-formats/delta-lake.md",
     [('C -- "Cùng sửa cùng một file("ví dụ MERGE") --> G', 'C -->|"Cùng sửa cùng một file (ví dụ MERGE)"| G')]),
    ("src/content/docs/concepts/3-storage-engines-formats/medallion-architecture.md",
     [('Data_Ingest("Append Only") --> BronzeTable', 'Data_Ingest -->|"Append Only"| BronzeTable')]),
    ("src/content/docs/concepts/3-storage-engines-formats/olap.md",
     [(' ~~~ Vectorized', ' -.-> Vectorized'),
      ('architecture-beta\n    group disk("server")[Đĩa D cứng]', 'graph TD\n    subgraph disk[Đĩa cứng]\n'),
      ('group ram("RAM Memory")', '    end\n    subgraph ram[RAM Memory]\n'),
      ('service g1("database")[Granule 1: UserID 1 - 1500] in disk', 'g1["Granule 1: UserID 1 - 1500"]'),
      ('service g2("database")[Granule 2: UserID 1500 - 3200] in disk', 'g2["Granule 2: UserID 1500 - 3200"]'),
      ('service g3("database")[Granule 3: UserID 3200 - 5000] in disk', 'g3["Granule 3: UserID 3200 - 5000"]'),
      ('service idx("server")[Sparse Index] in ram', 'idx["Sparse Index"]'),
      ('service m1("bookmark")[Mark 1: UserID 1] in ram', 'm1["Mark 1: UserID 1"]'),
      ('service m2("bookmark")[Mark 2: UserID 1500] in ram', 'm2["Mark 2: UserID 1500"]'),
      ('service m3("bookmark")[Mark 3: UserID 3200] in ram', 'm3["Mark 3: UserID 3200"]'),
      ('idx:B --> m1:T', 'idx --> m1'),
      ('idx:B --> m2:T', 'idx --> m2'),
      ('idx:B --> m3:T', 'idx --> m3'),
      ('m1:B --> g1:T', 'm1 --> g1'),
      ('m2:B --> g2:T', 'm2 --> g2'),
      ('m3:B --> g3:T', 'm3 --> g3')]),
    ("src/content/docs/concepts/3-storage-engines-formats/oltp.md",
     [('-->|Asynchronous Checkpoint<br/>(Random I/O)|', '-->|"Asynchronous Checkpoint<br/>(Random I/O)"|')]),
    ("src/content/docs/concepts/3-storage-engines-formats/snowflake.md",
     [('-->|Đọc/Ghi dữ liệu vật lý (Bỏ qua Caching)|', '-->|"Đọc/Ghi dữ liệu vật lý (Bỏ qua Caching)"|')]),
    ("src/content/docs/concepts/4-compute-engines-batch/spark-aqe-adaptive-query.md",
     [('C["Sort \\n("Shuffle Write")}', 'C{"Sort \\n(Shuffle Write)"}')]),
    ("src/content/docs/concepts/5-stream-processing-realtime/apache-kafka.md",
     [('subgraph "ZooKeeper Era("Legacy")"', 'subgraph ZooKeeper_Era ["ZooKeeper Era (Legacy)"]')]),
    ("src/content/docs/concepts/7-dataops-orchestration-quality/blue-green-deployment-data.md",
     [('WRITE_OP["Staging/Green"]', 'WRITE_OP["Staging/Green"]'), # Not sure, will replace `WRITE["Staging/Green"]` if it's there
      ('WRITE("Staging/Green")', 'WRITE_OP["Staging/Green"]')]),
    ("src/content/docs/concepts/8-security-governance-finops/cost-optimization.md",
     [('B ["(Heavy Batch Compute)"]', 'B["(Heavy Batch Compute)"]')]),
    ("src/content/docs/concepts/8-security-governance-finops/data-ownership.md",
     [('Data-as-a-Product / Data-Sharing("Producer")', 'Data_Product["Data-as-a-Product (Producer)"]')]),
    ("src/content/docs/concepts/8-security-governance-finops/metadata-management.md",
     [('Metadata Collection("DataHub / OpenLineage")', 'Metadata_Collection["Metadata Collection (DataHub / OpenLineage)"]')]),
    ("src/content/docs/concepts/4-compute-engines-batch/databricks.md",
     [('architecture-beta\n    group cp("cloud")[Control Plane(\'Databricks Account\')]', 'graph TD\n    subgraph cp[Control Plane: Databricks Account]\n'),
      ("group dp('cloud')[Data Plane('Customer VPC')]", '    end\n    subgraph dp[Data Plane: Customer VPC]\n'),
      ('service web("server")[Web UI / Notebooks] in cp', 'web["Web UI / Notebooks"]'),
      ('service job_sched("server")[Job Scheduler] in cp', 'job_sched["Job Scheduler"]'),
      ('service cluster_mgr("server")[Cluster Manager] in cp', 'cluster_mgr["Cluster Manager"]'),
      ('service compute_nodes("server")[Compute Nodes (EC2 / VMs)] in dp', 'compute_nodes["Compute Nodes (EC2 / VMs)"]'),
      ('service object_storage("database")[S3 / ADLS / GCS] in dp', 'object_storage["S3 / ADLS / GCS"]'),
      ('web:B --> job_sched:T', 'web --> job_sched'),
      ('job_sched:B --> cluster_mgr:T', 'job_sched --> cluster_mgr'),
      ('cluster_mgr:B -->|Provision & Monitor("API")| compute_nodes:T', 'cluster_mgr -->|"Provision & Monitor (API)"| compute_nodes'),
      ('compute_nodes:B -->|"Read/Write Data<br/>(High Bandwidth)"| object_storage:T', 'compute_nodes -->|"Read/Write Data (High Bandwidth)"| object_storage')]),
]

for filepath, file_fixes in fixes:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in file_fixes:
        content = content.replace(old, new)
    # also fix missing END in olap and databricks
    if filepath.endswith("olap.md") or filepath.endswith("databricks.md"):
        content = content.replace('```\n', '    end\n```\n')
        # clean up multiple ends just in case
        content = content.replace('    end\n    end\n```', '    end\n```')
        content = content.replace('    end\n\n    end\n```', '    end\n```')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Additional pass with regex to fix spaces before bracket ` ["` -> `["`
for root, dirs, files in os.walk('src/content/docs'):
    for filename in files:
        if filename.endswith('.md'):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            blocks = re.split(r'(```mermaid\n.*?\n```)', content, flags=re.DOTALL)
            new_blocks = []
            for block in blocks:
                if block.startswith('```mermaid'):
                    block = re.sub(r'([A-Za-z0-9_]+)\s+\["', r'\1["', block)
                new_blocks.append(block)
            new_content = "".join(new_blocks)
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
