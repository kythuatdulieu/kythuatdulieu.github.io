import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    def replace_mermaid(match):
        code = match.group(1)
        
        # 1. Clean up terrible quotes left by the buggy node script
        code = code.replace('["("', '["(')
        code = code.replace('")"]', ')"]')
        code = code.replace('")"', '")')
        code = code.replace('"("', '("')
        
        # Fix inner quotes inside brackets/parens/edge labels
        def unquote_inside_brackets(m):
            inner = m.group(1)
            inner_fixed = inner.replace('"', '')
            return f'["{inner_fixed}"]'
        code = re.sub(r'\["(.*?)"\]', unquote_inside_brackets, code)
        
        def unquote_inside_parens(m):
            inner = m.group(1)
            inner_fixed = inner.replace('"', '')
            return f'("{inner_fixed}")'
        code = re.sub(r'\("(.*?)"\)', unquote_inside_parens, code)

        def fix_edge_label(m):
            inner = m.group(1)
            inner_fixed = inner.replace('"', '')
            return f'|"{inner_fixed}"|'
        code = re.sub(r'\|"(.*?)"\|', fix_edge_label, code)
        
        # 2. Add quotes to things that need them (unquoted spaces/parens in nodes)
        def add_quotes_to_bracket(m):
            node = m.group(1)
            inner = m.group(2)
            if '"' not in inner and (' ' in inner or '(' in inner or '-' in inner or '/' in inner):
                return f'{node}["{inner}"]'
            return m.group(0)
        code = re.sub(r'([a-zA-Z0-9_-]+)\s*\[([^\]]+)\]', add_quotes_to_bracket, code)

        def add_quotes_to_parens(m):
            node = m.group(1)
            inner = m.group(2)
            if '"' not in inner and (' ' in inner or '(' in inner or '-' in inner or '/' in inner):
                return f'{node}("{inner}")'
            return m.group(0)
        code = re.sub(r'([a-zA-Z0-9_-]+)\s*\(([^)]+)\)', add_quotes_to_parens, code)

        # Replace edge cases
        code = code.replace('((', '(').replace('))', ')') # fallback to normal parens if they were double
        return f'```mermaid\n{code}```'

    new_content = re.sub(r'```mermaid\n(.*?)```', replace_mermaid, content, flags=re.DOTALL)
    
    if new_content != original:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('src/content/docs'):
    for f in files:
        if f.endswith('.md') or f.endswith('.mdx'):
            fix_file(os.path.join(root, f))
