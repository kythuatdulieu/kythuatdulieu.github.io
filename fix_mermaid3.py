import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig_content = content
    
    # Fix mismatched node brackets with quotes
    # ("Text"] -> ["Text"]
    content = re.sub(r'\("([^"]+)"\]', r'["\1"]', content)
    # ["Text") -> ["Text"]
    content = re.sub(r'\["([^"]+)"\)', r'["\1"]', content)
    # {"Text"] -> {"Text"}
    content = re.sub(r'\{"([^"]+)"\]', r'{"\1"}', content)
    # ["Text"} -> ["Text"]
    content = re.sub(r'\["([^"]+)"\}', r'["\1"]', content)
    # ("Text"} -> {"Text"}
    content = re.sub(r'\("([^"]+)"\}', r'{"\1"}', content)
    # {"Text") -> {"Text"}
    content = re.sub(r'\{"([^"]+)"\)', r'{"\1"}', content)

    # Fix unquoted nodes with mismatched brackets
    # (Text] -> [Text]
    content = re.sub(r'\(([^"\]]+)\]', r'[\1]', content)
    # [Text) -> [Text]
    content = re.sub(r'\[([^"\)]+)\)', r'[\1]', content)

    # Fix edge labels with parentheses (if unquoted)
    def quote_edge(match):
        inner = match.group(1)
        if '(' in inner and '"' not in inner:
            return f'|"{inner}"|'
        return match.group(0)
    content = re.sub(r'\|([^|]+)\|', quote_edge, content)

    # Fix nested quotes or multiple quotes like n('Redis/RabbitMQ')"]]
    content = content.replace("')\"]]", "']]]")
    
    # Replace participant L1("...") with participant L1 as ...
    # Also fix any sequence diagram node aliases
    content = re.sub(r'([A-Za-z0-9_]+)\("([^"]+)"\)', r'\1("\2")', content) # just making sure it's closed?
    # wait, if it's participant L1("...") it's invalid.
    content = re.sub(r'participant\s+([A-Za-z0-9_]+)\("([^"]+)"\)', r'participant \1 as \2', content)

    # ndcg.md specific fix because earlier replace might have failed
    content = content.replace('L1("L1: Vector DB / BM25")', 'L1')
    content = content.replace('L2("L2: Cross-Encoder")', 'L2')

    if content != orig_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('src/content/docs/concepts'):
    for file in files:
        if file.endswith('.md'):
            fix_file(os.path.join(root, file))
