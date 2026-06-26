import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace $ followed by a digit with \$
    new_content = re.sub(r'(?<!\\)\$(?=\d)', r'\\$', content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('src/content/docs'):
    for f in files:
        if f.endswith('.md') or f.endswith('.mdx'):
            fix_file(os.path.join(root, f))
