import os

# dictionary of filepath -> [(old, new), ...]
fixes = {
    "src/content/docs/concepts/3-storage-engines-formats/oltp.md": [
        ('-->|Asynchronous Checkpoint<br/>(Random I/O)|', '-->|"Asynchronous Checkpoint<br/>(Random I/O)"|')
    ],
    "src/content/docs/concepts/3-storage-engines-formats/snowflake.md": [
        ('-->|Đọc/Ghi dữ liệu vật lý (Bỏ qua Caching)|', '-->|"Đọc/Ghi dữ liệu vật lý (Bỏ qua Caching)"|')
    ],
    "src/content/docs/concepts/3-storage-engines-formats/time-series-databases.md": [
        ('D ["T2_Delta - T1_Delta = 0"]', 'D["T2_Delta - T1_Delta = 0"]')
    ],
    "src/content/docs/concepts/4-compute-engines-batch/distributed-processing.md": [
        ('P1 ["Partition 1"]', 'P1["Partition 1"]'),
        ('P2 ["Partition 2"]', 'P2["Partition 2"]')
    ],
    "src/content/docs/concepts/4-compute-engines-batch/spark-aqe-adaptive-query.md": [
        ('C["Sort \\n("Shuffle Write")} ', 'C{"Sort \\n(Shuffle Write)"}')
    ],
    "src/content/docs/concepts/4-compute-engines-batch/spark-partition.md": [
        ('P1 ["Partition 1"]', 'P1["Partition 1"]'),
        ('P2 ["Partition 2"]', 'P2["Partition 2"]'),
        ('P3 ["Partition 3"]', 'P3["Partition 3"]')
    ],
    "src/content/docs/concepts/4-compute-engines-batch/troubleshooting-spark-oom.md": [
        ('"Memory Overhead("Off-Heap")"', '"Memory Overhead (Off-Heap)"')
    ],
    "src/content/docs/concepts/5-stream-processing-realtime/apache-kafka.md": [
        ('subgraph "ZooKeeper Era("Legacy")"', 'subgraph ZooKeeper_Era ["ZooKeeper Era (Legacy)"]'),
        ("Z1(\"ZooKeeper Node')", 'Z1["ZooKeeper Node"]'),
        ("Z2('ZooKeeper Node\")", 'Z2["ZooKeeper Node"]')
    ],
    "src/content/docs/concepts/5-stream-processing-realtime/chandy-lamport-checkpointing.md": [
        ('A1 ["Wait for all Barriers"]', 'A1["Wait for all Barriers"]'),
        ('U1 ["First Barrier arrives"]', 'U1["First Barrier arrives"]')
    ],
    "src/content/docs/concepts/5-stream-processing-realtime/exactly-once-semantics.md": [
        ('K -->|commitTransaction()| TX', 'K -->|"commitTransaction()"| TX')
    ],
    "src/content/docs/concepts/5-stream-processing-realtime/stream-table-duality.md": [
        ('Changelog -- "Replay("Fault Tolerance") -.-> MemTable', 'Changelog -.->|"Replay (Fault Tolerance)"| MemTable')
    ],
    "src/content/docs/concepts/6-data-modeling-transformation/data-vault-modeling.md": [
        ('string hk_link_cust_order PK "MD5("hk_cust + hk_order")"', 'string hk_link_cust_order PK "MD5(hk_cust + hk_order)"')
    ],
    "src/content/docs/concepts/6-data-modeling-transformation/dimension-table.md": [
        ('DIM -.->|Expired Record| D1("Update valid_to = now(\'), is_current = false)', 'DIM -.->|"Expired Record"| D1["Update valid_to = now(), is_current = false"]'),
        ('DIM -.->|New Record| D2(\'Insert valid_from = now("), is_current = true)', 'DIM -.->|"New Record"| D2["Insert valid_from = now(), is_current = true"]')
    ],
    "src/content/docs/concepts/7-dataops-orchestration-quality/apache-airflow.md": [
        ('Scheduler ["Scheduler Daemon"]', 'Scheduler["Scheduler Daemon"]'),
        ('Worker1 ["Worker Node 1"]', 'Worker1["Worker Node 1"]')
    ],
    "src/content/docs/concepts/7-dataops-orchestration-quality/blue-green-deployment-data.md": [
        ('WRITE["Staging/Green"]', 'WRITE_OP["Staging/Green"]')
    ],
    "src/content/docs/concepts/7-dataops-orchestration-quality/volume-anomalies.md": [
        ('API ["External API"]', 'API["External API"]')
    ],
    "src/content/docs/concepts/8-security-governance-finops/cost-optimization.md": [
        ('B ["(Heavy Batch Compute)"]', 'B["(Heavy Batch Compute)"]')
    ],
    "src/content/docs/concepts/8-security-governance-finops/data-ownership.md": [
        ('Data-as-a-Product / Data-Sharing("Producer")', 'Data_Product["Data-as-a-Product (Producer)"]')
    ],
    "src/content/docs/concepts/8-security-governance-finops/metadata-management.md": [
        ('Metadata Collection("DataHub / OpenLineage")', 'Metadata_Collection["Metadata Collection (DataHub / OpenLineage)"]')
    ],
    "src/content/docs/concepts/3-storage-engines-formats/olap.md": [
        ('architecture-beta', 'graph TD\n    subgraph ClickHouse Storage Architecture'),
        ('group disk("SSD/HDD NVMe Storage")', ''),
        ('service g1("database")[Granule 1: UserID 1 - 1500] in disk', 'g1["Granule 1: UserID 1 - 1500"]'),
        ('service g2("database")[Granule 2: UserID 1500 - 3200] in disk', 'g2["Granule 2: UserID 1500 - 3200"]'),
        ('service g3("database")[Granule 3: UserID 3200 - 5000] in disk', 'g3["Granule 3: UserID 3200 - 5000"]'),
        ('group ram("RAM Memory")', ''),
        ('service idx("server")[Sparse Index] in ram', 'idx["Sparse Index"]'),
        ('service m1("bookmark")[Mark 1: UserID 1] in ram', 'm1["Mark 1: UserID 1"]'),
        ('service m2("bookmark")[Mark 2: UserID 1500] in ram', 'm2["Mark 2: UserID 1500"]'),
        ('service m3("bookmark")[Mark 3: UserID 3200] in ram', 'm3["Mark 3: UserID 3200"]'),
        ('idx:B --> m1:T', 'idx --> m1'),
        ('idx:B --> m2:T', 'idx --> m2'),
        ('idx:B --> m3:T', 'idx --> m3'),
        ('m1:B --> g1:T', 'm1 --> g1'),
        ('m2:B --> g2:T', 'm2 --> g2'),
        ('m3:B --> g3:T', 'm3 --> g3'),
        ('```\n', '    end\n```\n') # just put end before closing
    ]
}

for filepath, ops in fixes.items():
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in ops:
        content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {filepath}")
