import os
import re

directory = 'src/content/docs'
for root, dirs, files in os.walk(directory):
    for filename in files:
        if not filename.endswith('.md'): continue
        filepath = os.path.join(root, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        blocks = re.split(r'(```mermaid\n.*?\n```)', content, flags=re.DOTALL)
        new_blocks = []
        for block in blocks:
            if block.startswith('```mermaid'):
                # fix underscores
                block = re.sub(r'^_+', '        ', block, flags=re.MULTILINE)
                block = re.sub(r'^\s+_+', '        ', block, flags=re.MULTILINE)
                
                # fix xy chart lines
                block = re.sub(r'line\s+"([^"]*?)\("([^"]+)"\)"', r'line "\1 (\2)"', block)
                
                # fix RITE("Staging/Green") -> RITE["Staging/Green"] or something. Let's do a generic one for unquoted nodes? No.
                # Actually, in blue-green-deployment-data.md:
                # `WRITE("Staging/Green")` -> `WRITE["Staging/Green"]`?
                block = block.replace('WRITE("Staging/Green")', 'WRITE["Staging/Green"]')
                block = block.replace('READ("Production/Blue")', 'READ["Production/Blue"]')
                
                # fix circuit-breakers-data.md
                block = block.replace("stateDiagram-v2 --> Closed", "stateDiagram-v2\n[*] --> Closed")
                
                # fix airflow-zombie-tasks.md
                # `hạy ngay"] -. Wait("Xếp hàng") .-> Pool` -> `hạy ngay"] -.->|"Wait(Xếp hàng)"| Pool`
                block = re.sub(r'\-\.\s*([A-Za-z0-9_]+)\("([^"]+)"\)\s*\.\-\>', r'-.->|"\1(\2)"|', block)
                
                # fix data-ownership.md
                # e-Sharing("Producer")
                block = block.replace('Data-as-a-Product / Data-Sharing("Producer")', 'Data_Product["Data-as-a-Product (Producer)"]')
                
                # fix metadata-management.md
                # taHub / OpenLineage")
                block = block.replace('Metadata Collection("DataHub / OpenLineage")', 'Metadata_Collection["Metadata Collection (DataHub / OpenLineage)"]')
                
                # fix llm-as-a-judge.md
                block = block.replace('class Evaluation Path eval;', 'class Evaluation_Path eval;')
                
                # fix interview/overview.md
                # int user_id PK "unique, index"
                block = block.replace('int user_id PK "unique, index"', 'int user_id PK "unique index"')

            new_blocks.append(block)
        
        new_content = "".join(new_blocks)
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print("Fixed", filepath)

