import json
import os
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_-]+', '-', text).strip('-')

with open('public/concepts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

concepts = data.get('concepts', {})

output_dir = 'src/content/docs/concepts'
os.makedirs(output_dir, exist_ok=True)

# Don't overwrite existing complete articles
existing_files = {
    'data-warehouse.md',
    'data-lake.md',
    'batch-processing.md'
}

count = 0
for key, info in concepts.items():
    title = info.get('title', key)
    category = info.get('category', 'Khái niệm cơ bản')
    definition = info.get('definition', '')
    bullets = info.get('bullets', [])
    
    slug = slugify(key)
    filename = f"{slug}.md"
    
    if filename in existing_files:
        continue
        
    filepath = os.path.join(output_dir, filename)
    
    bullets_md = "\n".join([f"- {b}" for b in bullets])
    
    md_content = f"""---
title: "{title}"
category: "{category}"
---

# {title}

## Summary
{definition}

## Key Characteristics
{bullets_md}

*(Bài viết đang trong quá trình hoàn thiện. Phiên bản đầy đủ sẽ được cập nhật sớm)*
"""
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    count += 1

print(f"Generated {count} concept pages.")
