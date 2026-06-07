import os
import json
import glob
import re

def extract_frontmatter(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return {}
    
    yaml_text = match.group(1)
    metadata = {}
    for line in yaml_text.split('\n'):
        line = line.strip()
        if not line or ':' not in line:
            continue
        key, val = line.split(':', 1)
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        metadata[key] = val
        
    return metadata

def main():
    md_files = glob.glob('src/content/docs/concepts/*.md')
    concepts = {}
    
    for md_file in md_files:
        filename = os.path.basename(md_file)
        slug = filename[:-3] # remove .md
        
        # Original concepts mapping for backward compatibility and clean keys
        key = slug.replace('-', ' ')
        if key.lower() == 'etl': key = 'ETL'
        if key.lower() == 'elt': key = 'ELT'
        if key.lower() == 'olap': key = 'OLAP'
        if key.lower() == 'oltp': key = 'OLTP'
        if key.lower() == 'rag': key = 'RAG'
        if key.lower() == 'llm': key = 'LLM'
        
        # For things like 'data warehouse' we can just capitalize
        if key.islower():
            key = ' '.join(word.capitalize() for word in key.split())
            
        meta = extract_frontmatter(md_file)
        
        # If the file lacks proper frontmatter, skip or provide defaults
        title = meta.get('seoTitle') or meta.get('title') or key
        category = meta.get('category', 'Khái niệm')
        definition = meta.get('metaDescription', '')
        
        concepts[key] = {
            'title': title,
            'category': category,
            'definition': definition,
            'bullets': []
        }
        
        # Also add an alternative key if the slug has multiple words and is well-known?
        # Not strictly necessary, regex handles it.

    # Read existing concepts to preserve custom definitions if any?
    # Actually, overwriting is fine since the generated MDs are the source of truth now.
    
    out_file = 'public/concepts.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump({"concepts": concepts}, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main()
