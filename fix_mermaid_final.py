import os
import re
import glob

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig_content = content
    
    # Fix Z3["ZooKeeper Node")
    content = re.sub(r'\["(.*?)"\)', r'["\1"]', content)
    
    # Fix C{"Text"} if it misses quotes but has parentheses: C{Text (parens)}
    content = re.sub(r'([A-Za-z0-9_]+)\{([^"{}]+?\([^"{}]+?\)[^"{}]*?)\}', r'\1{"\2"}', content)
    
    # Fix unquoted nodes with parentheses: A(Text (parens))
    # Wait, A("Text (parens)") is better.
    # Let's just fix specific known bad patterns.
    
    # 1. olap.md: disk("Storage Node")["Đĩa Disk - Sorted
    content = content.replace('disk("Storage Node")["', 'disk["Storage Node - ')
    
    # 2. spark-sql.md: C("Resolved Logical Plan" -->|Rule-based
    # Maybe missing closing bracket? Let's fix missing closing bracket.
    content = re.sub(r'\("([^"]+)"\s*-->', r'("\1") -->', content)
    
    # 3. apache-kafka.md: Z3["ZooKeeper Node")
    content = content.replace('Z3["ZooKeeper Node")', 'Z3["ZooKeeper Node"]')
    
    # 4. chandy-lamport-checkpointing.md: subgraph Stream 1 (Fast Channel)
    content = re.sub(r'subgraph ([^\n\[\]"]+?\([^\[\]"]+?\)[^\n\[\]"]*?)\n', r'subgraph "\1"\n', content)
    
    # 5. exactly-once-semantics.md: maybe B("...") -->|...| S3[("...
    # Let's check for missing closing parenthesis.
    content = re.sub(r'\[\("([^"]+)"\s*-->', r'[("\1")] -->', content)
    
    # 6. windowing.md: E -->|Condition Met (Fire & Purge)| F["A
    # Maybe E("...") without closing?
    
    # Let's fix unquoted labels inside { }
    def quote_curly(match):
        inner = match.group(2)
        if '"' not in inner:
            return f'{match.group(1)}{{"{inner}"}}'
        return match.group(0)
    content = re.sub(r'([A-Za-z0-9_]+)\{([^}]+)\}', quote_curly, content)

    # Let's fix unquoted subgraph names with parens
    def quote_subgraph(match):
        name = match.group(1).strip()
        if '(' in name and '"' not in name:
            # Generate a safe id
            safe_id = re.sub(r'[^A-Za-z0-9_]', '', name)
            if not safe_id: safe_id = "sg"
            return f'subgraph {safe_id} ["{name}"]'
        return match.group(0)
    content = re.sub(r'subgraph\s+([^\n]+)', quote_subgraph, content)
    
    # sequence diagram participant
    content = re.sub(r'participant ([A-Za-z0-9_]+)\("([^"]+)"\)', r'participant \1 as \2', content)

    # If there are any `A("Text" -->` replace with `A("Text") -->`
    content = re.sub(r'\("([^"]+)"\s*(-+\.?>|==+>)', r'("\1") \2', content)
    content = re.sub(r'\("([^"]+)"\s*(-+.*?->|==+.*?=>)', r'("\1") \2', content)
    
    # node with unquoted parens: A(Text (parens))
    # It's hard to regex. Let's just catch A(Text) and if Text has parens, change to A("Text")
    def quote_round(match):
        id_ = match.group(1)
        inner = match.group(2)
        if '(' in inner and '"' not in inner:
            return f'{id_}("{inner}")'
        return match.group(0)
    # content = re.sub(r'([A-Za-z0-9_]+)\(([^)]+)\)', quote_round, content) # Too risky

    if content != orig_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('src/content/docs/concepts'):
    for file in files:
        if file.endswith('.md'):
            fix_file(os.path.join(root, file))
