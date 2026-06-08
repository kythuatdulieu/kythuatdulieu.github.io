import json
import os
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_-]+', '-', text).strip('-')

# Load all concepts
with open('public/concepts.json', 'r', encoding='utf-8') as f:
    concepts_db = json.load(f).get('concepts', {})

# Find all small files
unfinished_files = []
for root, _, files in os.walk('src/content/docs/concepts'):
    for file in files:
        if file.endswith('.md'):
            filepath = os.path.join(root, file)
            if os.path.getsize(filepath) < 2048: # < 2KB
                slug = file[:-3]
                unfinished_files.append(slug)

print(f"Found {len(unfinished_files)} unfinished concepts.")

batch_concepts = []
for slug in unfinished_files:
    # Find matching concept
    title = slug.replace('-', ' ').title()
    definition = "Không có mô tả"
    bullets = []
    
    for k, v in concepts_db.items():
        if slugify(k) == slug:
            title = v.get('title', k)
            definition = v.get('definition', "Không có mô tả")
            bullets = v.get('bullets', [])
            break
            
    batch_concepts.append({
        'slug': slug,
        'title': title,
        'category': 'GenAI / Data Engineering',
        'definition': definition,
        'bullets': bullets
    })

batch_size = 11
batches = [batch_concepts[i:i + batch_size] for i in range(0, len(batch_concepts), batch_size)]

start_idx = 9
for i, batch in enumerate(batches):
    with open(f'batch_{start_idx + i}.json', 'w', encoding='utf-8') as f:
        json.dump(batch, f, ensure_ascii=False, indent=2)

print(f'Created {len(batches)} batches (batch_9 to batch_{start_idx + len(batches) - 1})')
