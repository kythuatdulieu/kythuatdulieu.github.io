import os
import re

files_content = {
    "src/content/docs/concepts/6-ai-ml/evaluation-metrics/hallucination.md": """
## Ví dụ thực tế: Phát hiện Ảo giác bằng LLM

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# Dùng một prompt để yêu cầu LLM tự kiểm tra tính trung thực
eval_prompt = PromptTemplate.from_template(
    "Tài liệu gốc: {context}\n"
    "Câu trả lời: {answer}\n"
    "Nhiệm vụ: Câu trả lời có chứa thông tin nào KHÔNG nằm trong tài liệu gốc không? Trả lời 'CÓ ẢO GIÁC' hoặc 'KHÔNG'."
)

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
response = llm.invoke(eval_prompt.format(
    context="Paris là thủ đô của nước Pháp.",
    answer="Paris là thủ đô của Pháp và là thành phố đông dân nhất châu Âu."
))
print(response.content) # Output: CÓ ẢO GIÁC
```

## Khắc phục sự cố (Troubleshooting)

1. **Mô hình bịa đặt số liệu tài chính**:
   * **Giải pháp**: Buộc LLM sinh ra trích dẫn cụ thể (ví dụ `[Doc 1, Page 2]`) cho từng con số. Nếu trích dẫn không khớp hoặc không tồn tại, tự động ẩn câu trả lời.
2. **Mô hình trả lời tự tin về lĩnh vực nó không biết**:
   * **Giải pháp**: Bơm thêm System Prompt nghiêm ngặt: *"Nếu bạn không tìm thấy câu trả lời trong ngữ cảnh, hãy trả lời chính xác là 'Tôi không biết'."*
""",
    "src/content/docs/concepts/6-ai-ml/fine-tuning/fine-tuning.md": """
## Ví dụ thực tế: Cài đặt Fine-Tuning với HuggingFace

```python
from transformers import AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import load_dataset

# 1. Tải dataset và mô hình
dataset = load_dataset("imdb")
model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)

# 2. Định nghĩa cấu hình huấn luyện
training_args = TrainingArguments(
    output_dir="./results",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
)

# 3. Khởi tạo Trainer và bắt đầu Fine-Tuning
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"].select(range(1000)), # Dùng 1000 mẫu để demo
)

trainer.train()
```

## Khắc phục sự cố (Troubleshooting)

1. **Tràn RAM GPU (CUDA Out of Memory)**:
   * **Nguyên nhân**: Batch size quá lớn hoặc mô hình quá to so với VRAM (ví dụ fine-tune Llama-7B trên GPU 8GB).
   * **Giải pháp**: Giảm `per_device_train_batch_size` xuống 1 hoặc 2. Bật `gradient_accumulation_steps` để mô phỏng batch size lớn. Nếu vẫn OOM, hãy chuyển sang các kỹ thuật PEFT như LoRA/QLoRA.
2. **Loss không giảm hoặc phân kỳ (Loss Divergence)**:
   * **Giải pháp**: Giảm `learning_rate` xuống 10 lần. Kiểm tra lại dữ liệu đầu vào xem nhãn (labels) có bị gán sai hoặc định dạng prompt có bị lỗi không.
""",
    "src/content/docs/concepts/6-ai-ml/rag-search/chunking.md": """
## Ví dụ thực tế: Phân mảnh văn bản với LangChain

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text = "RAG là một kỹ thuật mạnh mẽ. Nó giúp LLM truy xuất kiến thức thực tế. Chunking là bước chia nhỏ tài liệu."

# Khởi tạo bộ chia cắt dựa trên ký tự đệ quy
splitter = RecursiveCharacterTextSplitter(
    chunk_size=50, 
    chunk_overlap=10,
    separators=["\\n\\n", "\\n", ". ", " ", ""]
)

chunks = splitter.split_text(text)
for i, chunk in enumerate(chunks):
    print(f"Chunk {i+1}: {chunk}")
```

## Khắc phục sự cố (Troubleshooting)

1. **Câu văn bị cắt đứt làm đôi, mất ngữ nghĩa (Semantic Loss)**:
   * **Giải pháp**: Đảm bảo cấu hình tham số `chunk_overlap` (khoảng 10-20% của `chunk_size`) để các chunk có phần giao nhau, giúp giữ lại ngữ cảnh. Sử dụng các kỹ thuật chia cắt ngữ nghĩa thông minh hơn (như SemanticChunker).
2. **Chunk chứa quá nhiều bảng biểu vô nghĩa**:
   * **Giải pháp**: Text Splitter thông thường sẽ phá nát cấu trúc Markdown của bảng. Phải sử dụng bộ chia cắt đặc thù cho Markdown (`MarkdownHeaderTextSplitter`) hoặc các công cụ bóc tách PDF chuyên dụng hỗ trợ OCR.
""",
    "src/content/docs/concepts/6-ai-ml/llm-basics/prompt-engineering.md": """
## Ví dụ thực tế: Cấu trúc Prompt hiệu quả (Python)

```python
import openai

prompt = \"\"\"
<Role>Bạn là một trợ lý phân tích dữ liệu chuyên nghiệp.</Role>
<Task>Phân loại mức độ tích cực của đoạn đánh giá sau thành: TÍCH CỰC, TIÊU CỰC, TRUNG LẬP.</Task>
<Context>Sản phẩm là một chiếc điện thoại thông minh giá rẻ.</Context>
<Format>Chỉ trả về nhãn phân loại, không giải thích.</Format>

Đánh giá: "Pin dùng cũng tạm, nhưng máy hơi nóng khi chơi game."
Phân loại:
\"\"\"

response = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": prompt}],
    temperature=0
)
print(response.choices[0].message.content) # Output: TRUNG LẬP
```

## Khắc phục sự cố (Troubleshooting)

1. **LLM không tuân thủ định dạng JSON**:
   * **Giải pháp**: Đừng chỉ mô tả bằng lời, hãy cung cấp 1-2 ví dụ JSON cụ thể trong prompt (Few-shot). Mở chế độ `response_format={ "type": "json_object" }` trên OpenAI API.
2. **Mô hình hay đưa ra câu trả lời lan man**:
   * **Giải pháp**: Bổ sung chỉ thị giới hạn đầu ra rõ ràng: *"Trả lời tối đa 3 câu"*, hoặc *"Chỉ trả về từ khóa"*. Đặt `temperature=0` để giảm tính ngẫu nhiên.
""",
    "src/content/docs/concepts/6-ai-ml/rag-search/embedding-models.md": """
## Ví dụ thực tế: Tạo Embeddings với Sentence-Transformers

```python
from sentence_transformers import SentenceTransformer

# Tải một mô hình nhẹ, đa ngôn ngữ hỗ trợ tiếng Việt
model = SentenceTransformer('keepitreal/vietnamese-sbert')

sentences = ["Hà Nội là thủ đô của Việt Nam.", "Thành phố Hồ Chí Minh là trung tâm kinh tế."]

# Chuyển đổi văn bản thành vector (mảng số thực)
embeddings = model.encode(sentences)

print(f"Kích thước vector: {embeddings.shape}") # Output: (2, 768)
```

## Khắc phục sự cố (Troubleshooting)

1. **Độ chính xác tìm kiếm tiếng Việt cực thấp**:
   * **Nguyên nhân**: Sử dụng các mô hình embedding thuần tiếng Anh (như `all-MiniLM-L6-v2`) để mã hóa tiếng Việt.
   * **Giải pháp**: Chuyển sang sử dụng các mô hình hỗ trợ đa ngôn ngữ mạnh như `text-embedding-3-small` (OpenAI), `multilingual-e5-large`, hoặc các mô hình chuyên biệt cho tiếng Việt trên HuggingFace.
2. **Tràn RAM khi chạy Embedding tại chỗ (Local)**:
   * **Giải pháp**: Nếu sử dụng GPU giới hạn, hãy chọn các mô hình nhỏ (dưới 1 tỷ tham số) hoặc dùng cơ chế Quantization (nén về 8-bit). Đảm bảo đặt cấu hình `batch_size` phù hợp (ví dụ 16 hoặc 32) khi encode hàng vạn tài liệu.
""",
    "src/content/docs/concepts/6-ai-ml/llm-basics/few-shot-prompting.md": """
## Ví dụ thực tế: Few-shot Prompting với LangChain

```python
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
from langchain_openai import ChatOpenAI

examples = [
    {"word": "vui vẻ", "antonym": "buồn bã"},
    {"word": "cao", "antonym": "thấp"},
]

example_formatter = PromptTemplate(
    input_variables=["word", "antonym"], 
    template="Từ: {word}\\nTrái nghĩa: {antonym}\\n"
)

few_shot_prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_formatter,
    prefix="Hãy tìm từ trái nghĩa cho các từ sau:\\n",
    suffix="Từ: {input}\\nTrái nghĩa:",
    input_variables=["input"]
)

prompt_text = few_shot_prompt.format(input="nhanh")
print(prompt_text)
# Output sẽ chứa sẵn các ví dụ mẫu trước khi đến câu hỏi chính.
```

## Khắc phục sự cố (Troubleshooting)

1. **Quá giới hạn Token Window (Context Length Exceeded)**:
   * **Nguyên nhân**: Cung cấp quá nhiều ví dụ (hàng chục ví dụ dài) làm cạn kiệt cửa sổ ngữ cảnh.
   * **Giải pháp**: Thay vì nhét cố định, hãy dùng **Dynamic Few-shot Prompting** kết hợp Vector DB. Khi người dùng hỏi một câu, tìm kiếm 3 ví dụ giống nhất trong DB để đưa vào prompt.
2. **Mô hình bị "học vẹt" (Overfitting vào ví dụ)**:
   * **Nguyên nhân**: Các ví dụ có sự thiên lệch (ví dụ tất cả các câu hỏi mẫu đều có đáp án là "A").
   * **Giải pháp**: Đảm bảo bộ ví dụ đa dạng, bao phủ các trường hợp góc (edge cases) và cân bằng tỉ lệ giữa các loại nhãn.
""",
    "src/content/docs/concepts/6-ai-ml/rag-search/semantic-search.md": """
## Ví dụ thực tế: Tính toán Cosine Similarity (Python)

```python
import numpy as np
from numpy.linalg import norm

# Giả sử chúng ta đã có vector của 2 câu từ Embedding model
vector_query = np.array([0.1, 0.2, 0.3])
vector_doc1 = np.array([0.1, 0.25, 0.35])

# Tính Cosine Similarity
cosine_sim = np.dot(vector_query, vector_doc1) / (norm(vector_query) * norm(vector_doc1))

print(f"Độ tương đồng ngữ nghĩa: {cosine_sim:.4f}")
# Output gần mức 1.0 nghĩa là rất giống nhau
```

## Khắc phục sự cố (Troubleshooting)

1. **Tìm kiếm ngữ nghĩa thất bại với các ID hoặc Mã sản phẩm chính xác**:
   * **Nguyên nhân**: Semantic Search giỏi tìm ý nghĩa, nhưng rất tệ trong việc tìm chính xác các chuỗi ký tự vô nghĩa hoặc ID (ví dụ tìm chính xác mã `SKU-99812`).
   * **Giải pháp**: Áp dụng hệ thống **Hybrid Search**. Kết hợp tìm kiếm vector (Semantic) với tìm kiếm từ khóa BM25 (Lexical). Khi người dùng gõ mã ID, BM25 sẽ cứu cánh và đẩy kết quả lên Top 1.
2. **Kết quả trả về không liên quan do ngữ cảnh quá rộng**:
   * **Giải pháp**: Sử dụng cơ chế Pre-filtering kết hợp Metadata (ví dụ chỉ tìm kiếm vector trong tập tài liệu có `category="Tài chính"`).
"""
}

# Apply to files
for path, new_content in files_content.items():
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Regex to find a suitable place to insert: 
        # usually replacing Pros/Cons or Khi nào nên dùng
        # We will just replace "## Điểm mạnh (Pros) và điểm yếu (Cons)" or "## Khi nào nên dùng"
        
        if "## Điểm mạnh" in content:
            content = re.sub(r'## Điểm mạnh.*?(?=## |\Z)', new_content + "\n", content, flags=re.DOTALL)
        elif "## Khi nào nên dùng" in content:
            content = re.sub(r'## Khi nào nên dùng.*?(?=## |\Z)', new_content + "\n", content, flags=re.DOTALL)
        else:
            # Append before references
            if "## Tài liệu tham khảo & Đọc thêm" in content:
                content = content.replace("## Tài liệu tham khảo & Đọc thêm", new_content + "\n## Tài liệu tham khảo & Đọc thêm")
            else:
                content += "\n" + new_content
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

