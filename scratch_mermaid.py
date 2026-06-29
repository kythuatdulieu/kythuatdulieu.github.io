import re
import os
import subprocess

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    blocks = re.split(r'(```mermaid\n.*?\n```)', content, flags=re.DOTALL)
    
    new_blocks = []
    for block in blocks:
        if block.startswith('```mermaid'):
            original_block = block
            
            # stateDiagram-v2["*"]
            block = block.replace('stateDiagram-v2["*"]', 'stateDiagram-v2')
            
            # Nodes with ("..."): e.g. A("Name") or A["Name"]
            # If they contain unescaped quotes inside, mermaid will fail.
            # Instead of regex, let's find all node definitions.
            # E.g. A("Something "quoted" else") -> A("Something 'quoted' else")
            
            # Simple regex: find sequences of `("... ")` and replace inner quotes
            def clean_inner_quotes(m):
                prefix = m.group(1)
                inner = m.group(2).replace('"', "'")
                suffix = m.group(3)
                return f"{prefix}{inner}{suffix}"
                
            block = re.sub(r'(\(\")([^"]*?".*?"[^"]*?)(\"\))', clean_inner_quotes, block)
            block = re.sub(r'(\[\")([^"]*?".*?"[^"]*?)(\"\])', clean_inner_quotes, block)
            block = re.sub(r'(\{\")([^"]*?".*?"[^"]*?)(\"\})', clean_inner_quotes, block)
            
            # Sometimes agents write A("Text") without quotes inside but there is a problem.
            # Or A("Text("Info")") -> we need to handle this.
            def fix_nested_parentheses(m):
                # m.group(0) is like A("Text("Info")")
                # Wait, this is `("Text("Info")")`
                # Let's just remove inner quotes if they exist between (" and ")
                pass
                
            # A common mistake: A("Text("Info")")
            # Let's blindly replace `("` ... `")` inner double quotes with single quotes.
            # We can use a loop to replace until no more changes.
            prev_block = None
            while prev_block != block:
                prev_block = block
                block = re.sub(r'(\(\"[^\"]*)\"([^\"]*\"\))', r"\1'\2", block)
                block = re.sub(r'(\[\"[^\"]*)\"([^\"]*\"\])', r"\1'\2", block)

            # Fix unquoted nodes: Node("Text") is valid, but Node(Text "Quote") is not.
            # This is hard to regex. We'll let it be.
            
            # Fix subgraph A("Name") -> subgraph A["Name"] ? No, subgraph Name is better.
            block = re.sub(r'subgraph\s+([A-Za-z0-9_]+)\("([^"]+)"\)', r'subgraph \1 [\2]', block)
            
            # Fix participants
            # participant A("Name") -> participant A as "Name"
            block = re.sub(r'participant\s+([^\(\s]+)\s*\("([^"]+)"\)', r'participant \1 as \2', block)
            # participant A/B("Name")
            def fix_part(m):
                name = m.group(1).replace('/', '_').replace('-', '_')
                desc = m.group(2)
                return f'participant {name} as {desc}'
            block = re.sub(r'participant\s+([^\(\s]+)\("([^"]+)"\)', fix_part, block)

            # Fix edges with quotes: -->|Text "quoted"| -> -->|Text 'quoted'|
            def fix_edge(m):
                arrow = m.group(1)
                text = m.group(2).replace('"', "'")
                return f'{arrow}|{text}|'
            block = re.sub(r'(-->|\.-+>|-+)\s*\|([^|]+)\|', fix_edge, block)
            
            # Fix class def: class Execution Path path; -> class Execution_Path path; 
            # (spaces in class names are invalid)
            # Not easy to regex.
            
            # Fix ("...") inside a string: e.g. ["Nguồn Dữ Liệu"] -> perfectly valid. 
            # But what if they wrote A("Nguồn("Dữ")Liệu")? Covered by inner quote replace.
            
            # Fix node with unquoted special characters:
            # e.g. A[Spark / EMR] -> A["Spark / EMR"]
            # e.g. B(Kafka/Kinesis) -> B("Kafka/Kinesis")
            
            # We'll just write it back
        new_blocks.append(block)
        
    new_content = "".join(new_blocks)
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

def check_mermaid():
    result = subprocess.run(['node', 'check_mermaid_syntax.js'], capture_output=True, text=True)
    return result.stdout + result.stderr

# Run initially
out = check_mermaid()

files = set()
for line in out.split('\n'):
    if line.startswith('Syntax error in '):
        f = line.split('Syntax error in ')[1].split(' (')[0]
        files.add(f)

print(f"Found {len(files)} files with errors.")

for f in files:
    fix_file(f)

print("Ran auto-fixer.")
out_after = check_mermaid()
print("After auto-fixer:")
print(out_after)
