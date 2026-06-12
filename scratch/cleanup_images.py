import os
import re
import hashlib

# Directory paths
docs_dir = 'src/content/docs'
images_dir = 'public/images'

# MD5 hashes of known inappropriate/generic files (logos, icons, headers)
BAD_MD5S = {
    '978c1bee49d7ad5fc1a4d81099b13e18': 'Blank / 1x1 pixel image',
    '62cd9b58bdce2a03c0ddf3edee1a9478': 'Hamburger menu SVG icon',
    '617ad3a9aa2dac00ccf65017ca5792ef': 'Close / general UI SVG icon',
    '5169bd979b5492d533386584ec2cad62': 'Tiny 22x20 icon',
    '3bb979a91651ce8ef1ea7b141a33857a': 'Apache Kafka logo',
    '9f14c20150a003d7ce4de57c298f0fba': 'Microsoft logo',
    '677b7f136f31b0d2e855cdecc128270e': 'Google logo',
    '02681f8ae6f7c00b58518f0b610b36c4': 'dbt logo',
    '0a3cd79f2410d563f6a5baccb1390d4d': 'Small cloud banner logo',
    'eb6a8537aa13cfeeb6633dcb767f9809': 'Prompt engineering header banner'
}

# Hashed files that are valid diagrams but were duplicated/copied in too many files,
# so we want to keep them ONLY in specific matching files.
CONDITIONAL_MD5S = {
    # MWAA Airflow Architecture diagram: only keep in airflow-related files
    '2ec96fdd5e3980d5af37f40ba4c66fe2': {
        'allowed_substrings': ['apache-airflow.md', 'airflow-scheduler.md', 'orchestration.md'],
        'desc': 'MWAA Airflow Architecture'
    },
    # Monte Carlo Data Quality diagram 2: only keep in data-quality/observability
    '2b43390a75a476408046c4ae71650e9a': {
        'allowed_substrings': ['data-quality.md', 'data-observability.md'],
        'desc': 'Monte Carlo Data Quality Diagram'
    },
    # Monte Carlo Data Quality diagram 1: only keep in data-quality/observability
    '073c3e512aa4c59e20889f6304773f17': {
        'allowed_substrings': ['data-quality.md', 'data-observability.md'],
        'desc': 'Monte Carlo Data Quality Diagram'
    },
    # Embedding Models diagram 2: only keep in embedding files
    '51a1e43afa8930c88c6a445bcac140ce': {
        'allowed_substrings': ['embeddings.md', 'embedding-models.md'],
        'desc': 'Embedding Models Diagram'
    },
    # Embedding Models diagram 1: only keep in embedding files
    'dcde7af0cf90a9a21cec61bb620d32ae': {
        'allowed_substrings': ['embeddings.md', 'embedding-models.md'],
        'desc': 'Embedding Models Diagram'
    }
}

image_pattern = re.compile(r'\n?\!\[(.*?)\]\((.*?)\)\n?')

removed_count = 0
retained_count = 0

print("Starting image audit and cleanup...")
print("====================================")

for root, dirs, files in os.walk(docs_dir):
    for f in files:
        if f.endswith('.md') or f.endswith('.mdx'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Find all image links
            matches = list(image_pattern.finditer(content))
            if not matches:
                continue
                
            new_content = content
            offset = 0
            
            for match in matches:
                caption = match.group(1)
                img_path = match.group(2)
                
                # We only clean up local images stored in public/images
                if img_path.startswith('/images/'):
                    rel_img = img_path[len('/images/'):]
                    abs_img = os.path.join(images_dir, rel_img)
                    
                    remove = False
                    reason = ""
                    
                    if not os.path.exists(abs_img):
                        remove = True
                        reason = "File does not exist"
                    else:
                        # Compute MD5
                        with open(abs_img, 'rb') as img_f:
                            h = hashlib.md5(img_f.read()).hexdigest()
                        
                        size = os.path.getsize(abs_img)
                        
                        if h in BAD_MD5S:
                            remove = True
                            reason = f"Identified as bad image: {BAD_MD5S[h]} (size={size}B)"
                        elif h in CONDITIONAL_MD5S:
                            cond = CONDITIONAL_MD5S[h]
                            allowed = False
                            for substr in cond['allowed_substrings']:
                                if filepath.endswith(substr):
                                    allowed = True
                                    break
                            if not allowed:
                                remove = True
                                reason = f"Duplicated {cond['desc']} not allowed for this file"
                        elif size < 4000 and img_path.endswith('.png'):
                            remove = True
                            reason = f"PNG image file size too small ({size}B) - likely an icon/logo"
                            
                    if remove:
                        # Remove the match from new_content
                        start = match.start() - offset
                        end = match.end() - offset
                        new_content = new_content[:start] + "\n" + new_content[end:]
                        offset += (end - start) - 1 # account for single newline
                        
                        # Optionally delete the file if it's no longer used
                        # We will clean up unused files in a separate step
                        print(f"[-] Removed image in {f}: {img_path} - {reason}")
                        removed_count += 1
                    else:
                        retained_count += 1
            
            if new_content != content:
                # Clean up any potential double newlines introduced by removal
                new_content = re.sub(r'\n{3,}', '\n\n', new_content)
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)

print("====================================")
print(f"Cleanup finished. Removed {removed_count} inappropriate image embeds. Retained {retained_count} valid images.")

# Now clean up completely unused files under public/images/
print("\nCleaning up unused image files under public/images/...")
# Collect all referenced images in the updated codebase
all_referenced_images = set()
for root, dirs, files in os.walk(docs_dir):
    for f in files:
        if f.endswith('.md') or f.endswith('.mdx'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            matches = image_pattern.findall(content)
            for m in matches:
                img_path = m[1]
                if img_path.startswith('/images/'):
                    all_referenced_images.add(img_path[len('/images/'):].lower())

deleted_files = 0
for root, dirs, files in os.walk(images_dir):
    for f in files:
        abs_path = os.path.join(root, f)
        rel_path = os.path.relpath(abs_path, images_dir).lower()
        if rel_path not in all_referenced_images:
            os.remove(abs_path)
            deleted_files += 1

# Clean up empty folders in public/images
for root, dirs, files in os.walk(images_dir, topdown=False):
    for d in dirs:
        abs_d = os.path.join(root, d)
        if not os.listdir(abs_d):
            os.rmdir(abs_d)

print(f"Deleted {deleted_files} unused image files.")
