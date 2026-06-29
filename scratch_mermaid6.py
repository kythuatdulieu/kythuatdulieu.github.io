import os

replacements = [
    ("src/content/docs/concepts/5-stream-processing-realtime/stream-table-duality.md", [
        ('MemTable -- "Spill-to-disk\\n("Memory Mgmt") --> RocksDB', 'MemTable -->|"Spill-to-disk\\n(Memory Mgmt)"| RocksDB')
    ]),
    ("src/content/docs/concepts/5-stream-processing-realtime/streaming-processing.md", [
        ('participant Flink Operator("Window 10:00-10:05")', 'participant Flink_Operator as "Flink Operator (Window 10:00-10:05)"'),
        ('Flink Operator("Window 10:00-10:05")', 'Flink_Operator'),
        ('Flink Operator("Window 10:00-10:05\')', 'Flink_Operator')
    ]),
    ("src/content/docs/concepts/5-stream-processing-realtime/watermark.md", [
        ("P0 -->|Data + WM('12:05')| OP", 'P0 -->|"Data + WM(12:05)"| OP'),
        ("P1 -->|Data + WM('12:03')| OP", 'P1 -->|"Data + WM(12:03)"| OP'),
        ("P2 -->|Data + WM('12:07')| OP", 'P2 -->|"Data + WM(12:07)"| OP')
    ]),
    ("src/content/docs/concepts/6-data-modeling-transformation/data-vault-modeling.md", [
        ('string hk_link_cust_order PK "MD5("hk_cust + hk_order")"', 'string hk_link_cust_order PK "MD5(hk_cust + hk_order)"')
    ]),
    ("src/content/docs/concepts/6-data-modeling-transformation/dimension-table.md", [
        ('DIM -.->|Expired Record| D1("Update valid_to = now(\'), is_current = false)', 'DIM -.->|"Expired Record"| D1["Update valid_to = now(), is_current = false"]'),
        ('DIM -.->|New Record| D2(\'Insert valid_from = now("), is_current = true)', 'DIM -.->|"New Record"| D2["Insert valid_from = now(), is_current = true"]')
    ]),
    ("src/content/docs/concepts/6-data-modeling-transformation/dimensional-modeling.md", [
        ('        C["Catalyst Optimizer"]', '        C["Catalyst Optimizer"]') # I will just run check_mermaid_syntax to see what's wrong. Wait, earlier it said `Lexical error on line 2 ...k / Photon / Presto") C["Catalys`
    ]),
    ("src/content/docs/concepts/7-dataops-orchestration-quality/apache-airflow.md", [
        # Fixed already
    ]),
    ("src/content/docs/concepts/7-dataops-orchestration-quality/blue-green-deployment-data.md", [
        ('WRITE["Staging/Green"]', 'WRITE["Staging/Green"]')
    ]),
    ("src/content/docs/concepts/7-dataops-orchestration-quality/volume-anomalies.md", [
        ('        API ["External API"]', '        API["External API"]')
    ]),
    ("src/content/docs/concepts/8-security-governance-finops/cost-optimization.md", [
        ('        B ["(Heavy Batch Compute)"]', '        B["(Heavy Batch Compute)"]')
    ]),
    ("src/content/docs/concepts/8-security-governance-finops/data-ownership.md", [
        ('Data_Product["Data-as-a-Product (Producer)"]', 'Data_Product["Data-as-a-Product (Producer)"]')
    ]),
    ("src/content/docs/concepts/8-security-governance-finops/metadata-management.md", [
        ('Metadata_Collection["Metadata Collection (DataHub / OpenLineage)"]', 'Metadata_Collection["Metadata Collection (DataHub / OpenLineage)"]')
    ]),
]

for filepath, rules in replacements:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in rules:
        content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
