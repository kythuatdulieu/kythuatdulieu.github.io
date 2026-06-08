import json
import os
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_-]+', '-', text).strip('-')

with open('public/concepts.json', 'r', encoding='utf-8') as f:
    concepts_db = json.load(f).get('concepts', {})

# read detailed_plan.md to get the list
with open('/home/duclinh/.gemini/antigravity-cli/brain/7b095aea-be80-4c74-a751-5ce4c085271c/detailed_plan.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

concepts_list = []
current_category = 'Concepts'

for line in lines:
    if line.startswith('#### Nhóm'):
        current_category = line.split('(')[0].replace('#### Nhóm', '').strip().split(':')[-1].strip()
    match = re.match(r'^\d+\.\s+`([^`]+)`:\s+(.*)', line.strip())
    if match:
        slug = match.group(1)
        desc = match.group(2)
        # find matching title in concepts.json
        title = slug
        definition = desc
        bullets = []
        for k, v in concepts_db.items():
            if k.lower() == slug.lower() or slugify(k) == slug:
                title = v.get('title', k)
                definition = v.get('definition', desc)
                bullets = v.get('bullets', [])
                break
                
        concepts_list.append({
            'slug': slug,
            'title': title,
            'category': current_category,
            'definition': definition,
            'bullets': bullets
        })

existing_files = {'data-warehouse', 'data-lake', 'batch-processing'}
filtered = [c for c in concepts_list if c['slug'] not in existing_files]

batch_size = 15
batches = [filtered[i:i + batch_size] for i in range(0, len(filtered), batch_size)]

for i, batch in enumerate(batches):
    with open(f'batch_{i}.json', 'w', encoding='utf-8') as f:
        json.dump(batch, f, ensure_ascii=False, indent=2)

print(f'Created {len(batches)} batches')
