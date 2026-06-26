import os, glob, re

def fix_mermaid_block(block_text):
    # Fix subgraph names
    # Match `subgraph Name With Spaces` -> `subgraph "Name With Spaces"`
    # But don't match `subgraph ID ["Name"]` or `subgraph "Name"`
    lines = block_text.split("\n")
    new_lines = []
    for line in lines:
        stripped = line.strip()
        # 1. Fix subgraphs
        if stripped.startswith("subgraph "):
            # check if it already has quotes or brackets
            if "[" not in stripped and '"' not in stripped:
                parts = line.split("subgraph ", 1)
                prefix = parts[0]
                name = parts[1].strip()
                if " " in name or re.search(r"[^\w\s]", name):
                    line = f'{prefix}subgraph "{name}"'
        
        # 2. Fix invalid dotted cross link
        line = re.sub(r"-\.-x\|", "-.->|", line)
        line = re.sub(r"-\.-x\s", "-.-> ", line)
        
        new_lines.append(line)
        
    text = "\n".join(new_lines)
    
    # 3. Fix unquoted node labels in flowchart/graph
    # We must be careful not to mess up state diagrams or sequence diagrams, which have different syntax.
    # Flowchart/graph nodes usually appear as ID[label]
    # We will only apply node quoting if the block starts with "graph" or "flowchart"
    if text.strip().startswith("graph") or text.strip().startswith("flowchart"):
        # Regex to find node definitions
        # ID can be alphanumeric and underscore
        # Opening bracket can be [, (, { etc.
        # Closing bracket is the matching one, but we can just use a non-greedy match until the first closing bracket.
        # It's safer to specify the exact pairs.
        pairs = [
            (r'\[\(', r'\)\]'),
            (r'\[\[', r'\]\]'),
            (r'\[\/', r'\/\]'),
            (r'\[\/', r'\\\]'),
            (r'\[\\', r'\\\]'),
            (r'\[\\', r'\/\]'),
            (r'\(\(', r'\)\)'),
            (r'\{\{', r'\}\}'),
            (r'\[', r'\]'),
            (r'\(', r'\)'),
            (r'\{', r'\}'),
            (r'\>', r'\]'),
        ]
        
        for open_b, close_b in pairs:
            # Match ID + open_b + text + close_b
            # Text should NOT start with " and end with "
            # Text should not contain the closing bracket
            pattern = r'([a-zA-Z0-9_-]+)(\s*)(' + open_b + r')([^\"]+?)(' + close_b + r')'
            
            def replacer(m):
                id_str = m.group(1)
                space = m.group(2)
                op = m.group(3)
                label = m.group(4)
                cl = m.group(5)
                
                # If label is empty or just spaces, leave it
                if not label.strip():
                    return m.group(0)
                
                # If label is already quoted, it wouldn't match [^\"]+? if it has quotes, 
                # but if it has inner quotes it might break. 
                # Since we exclude ", it means the label has NO quotes at all.
                # So we can safely wrap it.
                return f'{id_str}{space}{op}"{label}"{cl}'
                
            text = re.sub(pattern, replacer, text)
            
    return text

files = glob.glob("src/content/docs/**/*.md", recursive=True) + glob.glob("src/content/docs/**/*.mdx", recursive=True)

fixed_count = 0

for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
        
    def block_replacer(m):
        old_block = m.group(1)
        new_block = fix_mermaid_block(old_block)
        return "```mermaid\n" + new_block + "```"
        
    new_content = re.sub(r"```mermaid\n(.*?)```", block_replacer, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file, "w", encoding="utf-8") as f:
            f.write(new_content)
        fixed_count += 1
        print(f"Fixed {file}")

print(f"\nTotal files fixed: {fixed_count}")
