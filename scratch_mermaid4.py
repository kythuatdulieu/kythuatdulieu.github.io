import os
import re

def fix_all_files():
    directory = 'src/content/docs'
    for root, dirs, files in os.walk(directory):
        for filename in files:
            if not filename.endswith('.md'): continue
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            
            # fix subgraph A("B") -> subgraph A ["B"]
            new_content = re.sub(r'subgraph\s+([a-zA-Z0-9_\-\s]+)\("([^"]+)"\)', 
                                 lambda m: f'subgraph {m.group(1).strip().replace(" ", "_").replace("-", "_")} ["{m.group(2)}"]', 
                                 new_content)
                                 
            # fix -. "A("B")" .-> -> -.->|"A(B)"|
            new_content = re.sub(r'\-\.\s*"([^"]*)\("([^"]+)"\)"\s*\.\-\>', r'-.->|"\1(\2)"|', new_content)
            # fix -. "A" .-> -> -.->|"A"|
            new_content = re.sub(r'\-\.\s*"([^"]+)"\s*\.\-\>', r'-.->|"\1"|', new_content)
            # fix -. Wait("...") .-> -> -.->|"Wait(...)"|
            new_content = re.sub(r'\-\.\s*([a-zA-Z0-9_]+)\("([^"]+)"\)\s*\.\-\>', r'-.->|"\1(\2)"|', new_content)
            
            # fix -->|'Load('EL')| -> -->|"Load(EL)"|
            new_content = new_content.replace("-->|'Load('EL')|", "-->|\"Load(EL)\"|")
            
            # stateDiagram-v2 --> Closed : Bắt đầu -> stateDiagram-v2\n[*] --> Closed : Bắt đầu
            new_content = new_content.replace("stateDiagram-v2 --> Closed : Bắt đầu", "stateDiagram-v2\n[*] --> Closed : Bắt đầu")
            
            # title Biểu đồ...("...") -> title Biểu đồ... (...)
            new_content = re.sub(r'title\s+([^\n]+)\("([^"]+)"\)', r'title \1 (\2)', new_content)
            
            # int user_id PK "unique, index" -> int user_id PK "unique index"
            new_content = new_content.replace('int user_id PK "unique, index"', 'int user_id PK "unique index"')
            
            # kv_user1 -- "20GB" --> ctx_user1 -> kv_user1 -->|"20GB"| ctx_user1
            # wait, this was in context-window.md
            new_content = re.sub(r'(kv_user[0-9]+)\s*\-\-\s*"([^"]+)"\s*\-\-\>\s*(ctx_user[0-9]+)', r'\1 -->|"\2"| \3', new_content)
            
            # scheduler -- "Batch 1" --> model1 -> scheduler -->|"Batch 1"| model1
            new_content = re.sub(r'(scheduler)\s*\-\-\s*"([^"]+)"\s*\-\-\>\s*(model[0-9]+)', r'\1 -->|"\2"| \3', new_content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")

if __name__ == "__main__":
    fix_all_files()
