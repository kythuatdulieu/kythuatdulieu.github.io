---
title: "Chiến lược phân tách văn bản - Chunking Strategy"
difficulty: "Beginner"
tags: ["chunking", "rag", "vector-database", "nlp", "text-processing"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Chunking Strategy là gì? Tối ưu hóa văn bản cho hệ thống RAG"
metaDescription: "Tìm hiểu các chiến lược phân tách văn bản (Chunking Strategy) trong hệ thống RAG: Fixed-size, Recursive, Semantic chunking và tầm quan trọng của Overlap."
description: "Khi xây dựng các ứng dụng Trí tuệ nhân tạo tạo sinh (GenAI), đặc biệt là các hệ thống trả lời câu hỏi dựa trên tài liệu doanh nghiệp sử dụng kiến trúc..."
---



Khi xây dựng các ứng dụng Trí tuệ nhân tạo tạo sinh (GenAI), đặc biệt là các hệ thống Retrieval-Augmented Generation (RAG) để trả lời câu hỏi dựa trên tài liệu, việc xử lý và chuẩn bị dữ liệu văn bản đóng vai trò sống còn. Một trong những bước quan trọng nhất của quá trình này là **Chunking** (Phân tách văn bản).

**Chunking Strategy** (Chiến lược phân tách) là nghệ thuật cắt nhỏ một văn bản hoặc tài liệu dài thành các đoạn nhỏ hơn (gọi là *Chunks*) có kích thước phù hợp để đưa vào các mô hình Embedding và lưu trữ trong Vector Database. 

Nếu bạn cắt quá nhỏ, các đoạn văn bản sẽ mất đi ngữ cảnh (Context) cần thiết để LLM hiểu. Nếu bạn cắt quá lớn, bạn sẽ làm loãng thông tin, làm giảm độ chính xác của tìm kiếm vector (Vector Search), và có nguy cơ vượt qua giới hạn Token (Token limit) của các mô hình ngôn ngữ lớn (LLM).

---

## 1. Tại sao Chunking lại quan trọng trong hệ thống RAG?



Chunking không chỉ là việc chia nhỏ văn bản một cách cơ học. Nó tác động trực tiếp đến hiệu suất, chi phí và độ chính xác của toàn bộ ứng dụng GenAI.

* **Vượt qua giới hạn Token (Token Limits):** Mọi LLM (như GPT-4, Claude 3, Llama 3) và các mô hình Embedding (như OpenAI `text-embedding-3`, BGE-m3) đều có giới hạn về số lượng Token chúng có thể xử lý trong một lần. Việc chia nhỏ tài liệu đảm bảo bạn không gửi quá nhiều dữ liệu vượt mức cho phép.
* **Tối ưu hóa tìm kiếm Vector (Vector Search Optimization):** Khi người dùng đặt câu hỏi, hệ thống sẽ nhúng (embed) câu hỏi đó và tìm kiếm các đoạn văn bản có vector tương đồng cao nhất. Nếu chunk quá dài, ý nghĩa của một câu trả lời cụ thể có thể bị "chôn vùi" trong toàn bộ đoạn văn. Ngược lại, chunk vừa đủ sẽ tạo ra các vector đại diện sắc nét và tập trung hơn.
* **Kiểm soát chi phí:** Gửi ít token hơn (nhưng chất lượng hơn) vào prompt của LLM giúp giảm đáng kể chi phí API.
* **Cải thiện chất lượng sinh văn bản (Generation Quality):** Cung cấp cho LLM chính xác các đoạn thông tin (context) liên quan giúp giảm thiểu hiện tượng "ảo giác" (hallucination) và tăng tính chính xác cho câu trả lời.

---

## 2. Các tham số cốt lõi trong Chunking

Dù sử dụng chiến lược nào, bạn cũng cần quan tâm đến hai tham số chính: **Chunk Size** (Kích thước mỗi chunk) và **Chunk Overlap** (Mức độ chồng chéo).

### Chunk Size (Kích thước Chunk)
Đây là độ dài tối đa của mỗi đoạn văn bản được cắt ra. Kích thước này thường được đo bằng số lượng ký tự (characters) hoặc số lượng tokens. 
* *Kích thước nhỏ* (ví dụ: 100-250 tokens): Giúp tìm kiếm rất chính xác các thông tin cụ thể (factoid). Nhưng có thể thiếu ngữ cảnh xung quanh.
* *Kích thước lớn* (ví dụ: 500-1000 tokens): Bảo toàn tốt ngữ cảnh rộng, lý tưởng cho các câu hỏi cần tóm tắt hoặc suy luận phức tạp. Tuy nhiên, tìm kiếm có thể kém nhạy bén hơn với các chi tiết nhỏ.

### Chunk Overlap (Mức độ chồng chéo)
Khi cắt văn bản, câu hoặc ý có thể bị đứt gãy ở ranh giới giữa hai chunk. Để giải quyết, người ta để cho phần cuối của chunk trước "chồng lên" phần đầu của chunk sau một lượng nhất định.
* Kích thước overlap thường dao động từ **10% đến 20%** kích thước của chunk.
* *Ví dụ:* Nếu Chunk size là 1000 tokens và Overlap là 150 tokens, thì 150 tokens cuối của Chunk 1 sẽ lặp lại ở đầu Chunk 2, giúp giữ được tính liên kết và ngữ cảnh chuyển tiếp.

---

## 3. Các chiến lược Chunking phổ biến (Chunking Strategies)

Lựa chọn chiến lược phân tách phụ thuộc vào định dạng dữ liệu (PDF, Markdown, HTML, Code) và mức độ phức tạp của ứng dụng.

### 3.1. Fixed-size Chunking (Phân tách theo kích thước cố định)
Đây là phương pháp cơ bản và dễ triển khai nhất. Văn bản được chia thành các phần có số lượng ký tự hoặc token bằng nhau.

* **Ưu điểm:** Cực kỳ đơn giản, tốc độ xử lý nhanh, dễ tính toán chi phí.
* **Nhược điểm:** Mù mờ về mặt ngữ nghĩa. Nó có thể cắt ngang một câu, một đoạn văn, hoặc giữa một ý quan trọng, làm hỏng mạch ý nghĩa.
* **Khi nào nên dùng:** Phù hợp làm baseline đầu tiên, hoặc khi xử lý các văn bản phi cấu trúc và không có ranh giới đoạn văn rõ ràng.

### 3.2. Recursive Character Chunking (Phân tách đệ quy)
Chiến lược này thông minh hơn Fixed-size. Nó cố gắng chia văn bản dựa trên danh sách các ký tự phân cách theo thứ tự ưu tiên (ví dụ: chia theo hai dấu xuống dòng `\n\n`, sau đó là một dấu xuống dòng `\n`, rồi tới dấu chấm `.`, dấu phẩy `,` và cuối cùng là khoảng trắng ` `).

Nó sẽ "đệ quy" chia nhỏ văn bản cho đến khi các đoạn nhỏ đạt được kích thước Chunk Size mong muốn, nhưng vẫn cố gắng giữ lại các câu và đoạn văn nguyên vẹn.

* **Ưu điểm:** Tốt hơn rất nhiều so với cắt cố định vì nó tôn trọng cấu trúc cơ bản của ngôn ngữ (câu, đoạn văn).
* **Nhược điểm:** Vẫn có thể chia rẽ các khái niệm ngữ nghĩa lớn nếu chúng nằm trên nhiều đoạn văn.
* **Khi nào nên dùng:** Đây là phương pháp **mặc định và được khuyên dùng nhất** cho hầu hết các loại văn bản thông thường. Trong LangChain, đây là cơ chế của `RecursiveCharacterTextSplitter`.

### 3.3. Document-Based / Structural Chunking (Phân tách theo cấu trúc)
Phương pháp này dựa vào cấu trúc vốn có của tài liệu, như thẻ HTML, các tiêu đề Markdown (`#`, `##`), cấu trúc file code (function, class), hoặc cấu trúc JSON.

* **Ưu điểm:** Giữ được ngữ cảnh tự nhiên do người viết tạo ra. Một mục (section) trong tài liệu thường chứa một chủ đề hoàn chỉnh.
* **Nhược điểm:** Yêu cầu các bộ phân tích (parsers) chuyên biệt cho từng loại file. Kích thước chunk có thể rất không đồng đều (có phần quá dài, có phần quá ngắn).
* **Khi nào nên dùng:** Rất hiệu quả khi làm việc với Markdown, HTML, source code (Python, Java), hoặc các tài liệu luật, hợp đồng được chia thành các Điều, Khoản rõ ràng.

### 3.4. Semantic Chunking (Phân tách theo ngữ nghĩa)
Đây là một cách tiếp cận tiên tiến hơn. Semantic Chunking cố gắng nhóm các câu lại với nhau dựa trên độ tương đồng về mặt ý nghĩa, thay vì dựa trên số lượng ký tự hay cấu trúc cú pháp.

Cách hoạt động:
1. Chia văn bản thành các câu riêng lẻ.
2. Tạo vector nhúng (embedding) cho từng câu.
3. So sánh độ tương đồng cosine (Cosine Similarity) giữa các câu liền kề.
4. Nếu độ tương đồng giảm mạnh (vượt qua một ngưỡng - threshold), hệ thống xác định đó là sự chuyển đổi chủ đề và thực hiện cắt chunk tại đó.

* **Ưu điểm:** Các chunk được tạo ra mang tính gắn kết chủ đề (topical coherence) rất cao. Rất tốt cho hệ thống RAG cần trả lời chính xác theo từng "ý" của tài liệu.
* **Nhược điểm:** Chạy chậm hơn và tốn kém hơn vì phải gọi API Embedding cho từng câu trước khi thực sự lưu trữ vào Vector DB.
* **Khi nào nên dùng:** Khi bạn có ngân sách tài nguyên dồi dào và yêu cầu độ chính xác cực cao trong việc lấy lại ngữ cảnh.

### 3.5. Agentic / Context-Aware Chunking (Phân tách dùng LLM)
Sử dụng chính LLM để phân tích và trích xuất các chunk hoặc tóm tắt tài liệu một cách thông minh. Đôi khi phương pháp này kết hợp với việc tạo ra các "Document Summary" (Tóm tắt tài liệu) và dùng chúng làm siêu dữ liệu (metadata) liên kết với các chunk con.

Một kỹ thuật nổi tiếng là **Parent-Document Retriever**: Cắt văn bản thành các chunk rất nhỏ (Child chunks) để tìm kiếm chính xác, nhưng khi tìm thấy, hệ thống lại trả về đoạn văn bản lớn hơn chứa chunk đó (Parent chunk) cho LLM đọc để có ngữ cảnh rộng.

---

## 4. Hướng dẫn chọn chiến lược Chunking tối ưu

Không có "một công thức chung cho mọi trường hợp" (No silver bullet). Việc lựa chọn chiến lược phụ thuộc vào ba yếu tố chính:

1. **Bản chất của dữ liệu:** 
   - Văn bản liền mạch (Tiểu thuyết, bài báo): Dùng *Recursive Chunking*.
   - Tài liệu kỹ thuật, Wiki: Dùng *Structural Chunking* (Markdown/HTML splitters).
   - Dữ liệu dạng bảng hoặc JSON: Cần xử lý riêng, biến đổi từng hàng/node thành các mô tả chuỗi (string descriptions).

2. **Loại câu hỏi của người dùng:**
   - Cần tìm thông tin thực tế, chi tiết nhanh (Ví dụ: "Mã lỗi 404 nghĩa là gì?"): Chunk size nhỏ (100-250 tokens), overlap nhỏ.
   - Cần tóm tắt, so sánh, tổng hợp (Ví dụ: "So sánh chính sách đổi trả của năm 2023 và 2024"): Chunk size lớn (500-1000 tokens), overlap vừa đủ để không rớt ý.

3. **Mô hình Embedding được sử dụng:**
   - Các mô hình cũ (như `text-embedding-ada-002` của OpenAI) hỗ trợ tối đa 8191 tokens, nhưng hiệu suất tốt nhất lại nằm ở mức < 1000 tokens.
   - Luôn tham khảo tài liệu kỹ thuật của mô hình Embedding để biết "Sweet spot" (điểm tối ưu) của độ dài văn bản đầu vào.

---

## 5. Ví dụ thực hành với Python (LangChain)

Dưới đây là một ví dụ minh họa cách sử dụng **RecursiveCharacterTextSplitter** trong thư viện LangChain, chiến lược được sử dụng phổ biến nhất.

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Nội dung văn bản mẫu
text_content = """
Trí tuệ nhân tạo (AI) đang thay đổi thế giới. Trong vài năm qua, chúng ta đã chứng kiến sự bùng nổ của các mô hình sinh (Generative Models).
Ví dụ nổi bật nhất là ChatGPT của OpenAI, Midjourney cho hình ảnh, và nhiều mô hình mã nguồn mở khác từ Meta hay Mistral.

Tuy nhiên, các mô hình này không hoàn hảo. Chúng có thể bị ảo giác (hallucinate), đưa ra thông tin sai lệch nhưng với giọng điệu rất tự tin.
Để khắc phục điều này, kỹ thuật RAG (Retrieval-Augmented Generation) được sinh ra.
RAG kết hợp sức mạnh suy luận của LLM với độ chính xác của cơ sở dữ liệu tri thức bên ngoài.
"""

# Khởi tạo Text Splitter
# Cấu hình chunk_size=100 ký tự và chunk_overlap=20 ký tự
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=100,
    chunk_overlap=20,
    length_function=len,
    separators=["\\n\\n", "\\n", ".", " ", ""]
)

# Thực hiện chia nhỏ văn bản
chunks = text_splitter.split_text(text_content)

for i, chunk in enumerate(chunks):
    print(f"--- Chunk {i+1} ---")
    print(chunk)
```

**Kết quả thu được sẽ có dạng chồng chéo tự nhiên giữa các đoạn:** Các câu lớn được cắt tại các dấu chấm hoặc xuống dòng, và các ký tự cuối của chunk này sẽ xuất hiện ở đầu chunk kế tiếp.

---

## Tài Liệu Tham Khảo
* [LangChain Documentation: Text Splitters](https://python.langchain.com/docs/modules/data_connection/document_transformers/)
* [Pinecone: Chunking Strategies for LLM Applications](https://www.pinecone.io/learn/chunking-strategies/)
* **LlamaIndex: Node Parsers & Text Splitters**
* [Greg Kamradt: 5 Levels of Text Splitting](https://github.com/FullStackRetrieval-com/RetrievalTutorials/blob/main/tutorials/LevelsOfTextSplitting/5_Levels_Of_Text_Splitting.ipynb)
