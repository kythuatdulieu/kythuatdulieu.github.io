import re

with open('/home/duclinh/kythuatdulieu.github.io/src/content/docs/index.mdx', 'r') as f:
    content = f.read()

# We know the content has <Card title="Góc nhìn Kỹ thuật (Trade-offs)" icon="puzzle">
# followed by our inserted content, and then </Card>\n</CardGrid>

# The inserted content starts with "Chào mừng đến với **Cẩm Nang"
# and ends with "mà không cần sao chép hay tạo thêm pipeline trung gian."

card_start = '<Card title="Góc nhìn Kỹ thuật (Trade-offs)" icon="puzzle">\n'

split_parts = content.split(card_start)
if len(split_parts) == 2:
    prefix = split_parts[0]
    rest = split_parts[1]
    
    # We want to extract our handbook text. It is everything inside the card, minus the last </Card>\n</CardGrid>
    # Let's split by </Card>\n</CardGrid>
    rest_split = rest.rsplit('	</Card>\n</CardGrid>', 1)
    
    if len(rest_split) == 2:
        handbook_text = rest_split[0]
        suffix = rest_split[1]
        
        # Now construct the correct file:
        new_content = prefix + card_start + '		Không quảng cáo công cụ. Mọi bài viết đều đi sâu vào kiến trúc bên dưới, đánh giá ưu/nhược điểm (trade-offs) để bạn thực sự hiểu bản chất.\n	</Card>\n</CardGrid>\n\n' + handbook_text + suffix
        
        with open('/home/duclinh/kythuatdulieu.github.io/src/content/docs/index.mdx', 'w') as f:
            f.write(new_content)
        print("Fixed successfully!")
    else:
        print("Could not find </CardGrid>")
else:
    print("Could not find Card start")
