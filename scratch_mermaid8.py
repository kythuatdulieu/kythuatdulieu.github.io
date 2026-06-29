import os

replacements = [
    # 1. oltp.md
    ("src/content/docs/concepts/3-storage-engines-formats/oltp.md", [
        ("-->|Asynchronous Checkpoint<br/>(Random I/O)|", '-->|"Asynchronous Checkpoint<br/>(Random I/O)"|')
    ]),
    # 2. snowflake.md
    ("src/content/docs/concepts/3-storage-engines-formats/snowflake.md", [
        ("-->|Đọc/Ghi dữ liệu vật lý (Bỏ qua Caching)|", '-->|"Đọc/Ghi dữ liệu vật lý (Bỏ qua Caching)"|')
    ]),
    # 3. time-series-databases.md
    ("src/content/docs/concepts/3-storage-engines-formats/time-series-databases.md", [
        ('D ["T2_Delta - T1_Delta = 0"]', 'D["T2_Delta - T1_Delta = 0"]')
    ]),
    # 4. distributed-processing.md
    ("src/content/docs/concepts/4-compute-engines-batch/distributed-processing.md", [
        ('P1 ["Partition 1"]', 'P1["Partition 1"]'),
        ('P2 ["Partition 2"]', 'P2["Partition 2"]')
    ]),
    # 5. spark-aqe-adaptive-query.md
    ("src/content/docs/concepts/4-compute-engines-batch/spark-aqe-adaptive-query.md", [
        ('C["Sort \n("Shuffle Write")} ', 'C{"Sort \\n(Shuffle Write)"}')
    ]),
    # 6. spark-partition.md
    ("src/content/docs/concepts/4-compute-engines-batch/spark-partition.md", [
        ('P1 ["Partition 1"]', 'P1["Partition 1"]'),
        ('P2 ["Partition 2"]', 'P2["Partition 2"]'),
        ('P3 ["Partition 3"]', 'P3["Partition 3"]')
    ]),
    # 7. troubleshooting-spark-oom.md
    ("src/content/docs/concepts/4-compute-engines-batch/troubleshooting-spark-oom.md", [
        ('"Memory Overhead("Off-Heap")" : 15', '"Memory Overhead (Off-Heap)" : 15')
    ]),
    # 8. apache-kafka.md
    ("src/content/docs/concepts/5-stream-processing-realtime/apache-kafka.md", [
        ('subgraph "ZooKeeper Era("Legacy")"', 'subgraph ZooKeeper_Era ["ZooKeeper Era (Legacy)"]'),
        ("Z1(\"ZooKeeper Node')", 'Z1["ZooKeeper Node"]'),
        ("Z2('ZooKeeper Node\")", 'Z2["ZooKeeper Node"]')
    ]),
    # 9. chandy-lamport-checkpointing.md
    ("src/content/docs/concepts/5-stream-processing-realtime/chandy-lamport-checkpointing.md", [
        ('A1 ["Wait for all Barriers"]', 'A1["Wait for all Barriers"]'),
        ('U1 ["First Barrier arrives"]', 'U1["First Barrier arrives"]')
    ]),
    # 10. exactly-once-semantics.md
    ("src/content/docs/concepts/5-stream-processing-realtime/exactly-once-semantics.md", [
        ('K -->|commitTransaction()| TX', 'K -->|"commitTransaction()"| TX')
    ]),
    # 11. stream-table-duality.md
    ("src/content/docs/concepts/5-stream-processing-realtime/stream-table-duality.md", [
        ('Changelog -- "Replay("Fault Tolerance") -.-> MemTable', 'Changelog -.->|"Replay (Fault Tolerance)"| MemTable')
    ]),
    # 12. data-vault-modeling.md
    ("src/content/docs/concepts/6-data-modeling-transformation/data-vault-modeling.md", [
        ('string hk_link_cust_order PK "MD5("hk_cust + hk_order")"', 'string hk_link_cust_order PK "MD5(hk_cust + hk_order)"')
    ]),
    # 13. dimension-table.md
    ("src/content/docs/concepts/6-data-modeling-transformation/dimension-table.md", [
        ('DIM -.->|Expired Record| D1("Update valid_to = now(\'), is_current = false)', 'DIM -.->|"Expired Record"| D1["Update valid_to = now(), is_current = false"]'),
        ('DIM -.->|New Record| D2(\'Insert valid_from = now("), is_current = true)', 'DIM -.->|"New Record"| D2["Insert valid_from = now(), is_current = true"]')
    ]),
    # 14. apache-airflow.md
    ("src/content/docs/concepts/7-dataops-orchestration-quality/apache-airflow.md", [
        ('Scheduler ["Scheduler Daemon"]', 'Scheduler["Scheduler Daemon"]'),
        ('Worker1 ["Worker Node 1"]', 'Worker1["Worker Node 1"]')
    ]),
    # 15. blue-green-deployment-data.md
    ("src/content/docs/concepts/7-dataops-orchestration-quality/blue-green-deployment-data.md", [
        ('WRITE["Staging/Green"]', 'WRITE_OP["Staging/Green"]'),
        ('READ["Production/Blue"]', 'READ_OP["Production/Blue"]')
    ]),
    # 16. volume-anomalies.md
    ("src/content/docs/concepts/7-dataops-orchestration-quality/volume-anomalies.md", [
        ('API ["External API"]', 'API["External API"]')
    ]),
    # 17. cost-optimization.md
    ("src/content/docs/concepts/8-security-governance-finops/cost-optimization.md", [
        ('B ["(Heavy Batch Compute)"]', 'B["(Heavy Batch Compute)"]')
    ]),
    # 18. data-ownership.md
    ("src/content/docs/concepts/8-security-governance-finops/data-ownership.md", [
        ('Data_Product["Data-as-a-Product (Producer)"]', 'Data_Product["Data-as-a-Product (Producer)"]') # wait, original was `Data-as-a-Product / Data-Sharing("Producer")`
    ]),
    # 19. metadata-management.md
    ("src/content/docs/concepts/8-security-governance-finops/metadata-management.md", [
        ('Metadata_Collection["Metadata Collection (DataHub / OpenLineage)"]', 'Metadata_Collection["Metadata Collection (DataHub / OpenLineage)"]')
    ]),
]

for filepath, rules in replacements:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # special replacements for the ones that were tricky
    if "data-ownership.md" in filepath:
        content = content.replace('Data-as-a-Product / Data-Sharing("Producer")', 'Data_Product["Data-as-a-Product (Producer)"]')
    if "metadata-management.md" in filepath:
        content = content.replace('Metadata Collection("DataHub / OpenLineage")', 'Metadata_Collection["Metadata Collection (DataHub / OpenLineage)"]')
        
    for old, new in rules:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
