import os
import re

def find_issues():
    vietnamese_chars = re.compile(r'[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]')
    
    for root, dirs, files in os.walk('src/content/docs'):
        for f in files:
            if f.endswith('.md') or f.endswith('.mdx'):
                filepath = os.path.join(root, f)
                with open(filepath, 'r') as file:
                    content = file.read()
                
                # find all $...$ not $$...$$
                # this regex uses negative lookbehind/lookahead to not match $$
                matches = re.finditer(r'(?<!\$)\$([^\$]+)\$(?!\$)', content)
                for m in matches:
                    math_content = m.group(1)
                    if vietnamese_chars.search(math_content):
                        print(f"File: {filepath}")
                        print(f"Match: {math_content[:100]}...\n")

find_issues()
