import glob

generic_code_trouble = """
## Ví dụ thực tế (Code Snippet)

```python
# Tùy thuộc vào ngữ cảnh khái niệm, bạn có thể thiết lập các cấu hình như sau:
import logging
logging.basicConfig(level=logging.INFO)
logging.info("Khởi chạy module thành công.")
```

## Khắc phục sự cố (Troubleshooting)

1. **Lỗi OOM (Out of Memory) / Tràn bộ nhớ**:
   * **Nguyên nhân**: Dữ liệu tải vào RAM vượt quá dung lượng cho phép.
   * **Giải pháp**: Phân lô (batch processing), nén mô hình (quantization) hoặc dùng kỹ thuật xử lý luồng (streaming).
2. **Độ trễ cao (High Latency)**:
   * **Giải pháp**: Tối ưu hóa truy vấn, thêm bộ nhớ đệm (Cache), và giảm thiểu các thao tác I/O đồng bộ.
"""

files = glob.glob('src/content/docs/concepts/6-ai-ml/**/*.md', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if generic_code_trouble in content:
        content = content.replace(generic_code_trouble, "")
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

