import os
import glob
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 1. Fix Mermaid bugs
    # Find ```mermaid ... ``` blocks and replace A[Something (Else)] with A["Something (Else)"]
    def mermaid_replacer(match):
        mermaid_block = match.group(0)
        # Fix unquoted brackets with parentheses
        # Regex to find: NodeID[Some text (some text)]
        # We need to quote the text inside [] if it contains () and doesn't start with "
        # A simpler way: just replace [Text (text)] with ["Text (text)"] if not already quoted
        mermaid_block = re.sub(r'\[([^"\]]*\([^"\]]*\)[^"\]]*)\]', r'["\1"]', mermaid_block)
        return mermaid_block

    content = re.sub(r'```mermaid.*?```', mermaid_replacer, content, flags=re.DOTALL)

    # 2. Consolidate References
    # We will remove existing "## Khái niệm liên quan", "## Xem thêm các khái niệm liên quan", "## Tài liệu tham khảo"
    # and combine them.
    # Extract links from these sections
    ref_links = []
    
    sections_to_remove = [
        r'## Khái niệm liên quan\n+((?:(?:\*|-).*?\n)+)',
        r'## Xem thêm các khái niệm liên quan\n+((?:(?:\*|-).*?\n)+)',
        r'## Tài liệu tham khảo\n+((?:(?:\d+\.|\*|-).*?\n)+)'
    ]
    
    for pattern in sections_to_remove:
        match = re.search(pattern, content)
        if match:
            links = match.group(1).strip().split('\n')
            ref_links.extend(links)
            content = re.sub(pattern, '', content)
            
    # Clean up multiple newlines created by removal
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # Also find English Summary to put references before it
    summary_pattern = r'## English Summary'
    
    new_refs = "## Tài liệu tham khảo & Đọc thêm\n\n"
    seen = set()
    for link in ref_links:
        # clean link
        link = link.strip()
        # normalize format
        link = re.sub(r'^\d+\.\s*', '* ', link)
        if link not in seen:
            seen.add(link)
            new_refs += link + "\n"
            
    if ref_links:
        if '## English Summary' in content:
            content = content.replace('## English Summary', new_refs + '\n## English Summary')
        else:
            content += '\n\n' + new_refs
            
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

files = glob.glob('src/content/docs/concepts/6-ai-ml/**/*.md', recursive=True)
for f in files:
    fix_file(f)
print(f"Processed {len(files)} files.")
