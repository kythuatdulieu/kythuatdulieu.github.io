---
title: "Phân tách văn bản - Chunking"
difficulty: "Beginner"
tags: ["chunking", "rag", "preprocessing", "nlp", "vector-database"]
readingTime: "8 mins"
lastUpdated: 2026-06-08
seoTitle: "Chunking là gì? Kỹ thuật phân tách văn bản trong RAG"
metaDescription: "Tìm hiểu Chunking trong Xử lý ngôn ngữ tự nhiên (NLP) và RAG, tại sao phải chia nhỏ tài liệu, các chiến lược chunking (Fixed-size, Semantic) và Overlap."
description: "Nếu bạn đang bước chân vào thế giới của Trí tuệ nhân tạo tạo sinh (GenAI) hoặc đang xây dựng các hệ thống tìm kiếm thông minh dựa trên dữ liệu doanh n..."
---



Nếu bạn đang bước chân vào thế giới của Trí tuệ nhân tạo tạo sinh (GenAI) hoặc đang xây dựng các hệ thống tìm kiếm thông minh dựa trên dữ liệu thông qua kiến trúc RAG (Retrieval-Augmented Generation), **Chunking** là một trong những bước tiền xử lý cốt lõi nhất ảnh hưởng trực tiếp đến chất lượng của toàn bộ hệ thống.

Chunking là thao tác chia tách văn bản lớn thành các đoạn nhỏ hơn (gọi là *chunk*). Do giới hạn ngữ cảnh (Context Window) của các mô hình ngôn ngữ lớn (LLM), chúng ta không thể đưa một cuốn sách dài 1000 trang trực tiếp vào prompt để hỏi đáp. Thay vào đó, tài liệu phải được "chunk" thành hàng ngàn đoạn văn bản nhỏ, sau đó chuyển đổi thành vector (embedding) để lưu trữ và tìm kiếm (Search) những đoạn liên quan nhất trước khi đưa cho LLM tổng hợp câu trả lời.

---

## Tại sao chúng ta cần Chunking?



Có một số lý do cốt lõi khiến chunking trở thành một bước không thể thiếu trong các pipeline xử lý dữ liệu của GenAI:

### 1. Giới hạn Context Window của LLM
Mọi LLM (như GPT-4, Claude, Gemini) đều có giới hạn về số lượng token chúng có thể xử lý trong một lần tương tác. Dù các mô hình hiện tại đã mở rộng giới hạn này lên tới hàng trăm nghìn hoặc hàng triệu token, việc nạp toàn bộ một cơ sở dữ liệu khổng lồ vào mỗi prompt vẫn là bất khả thi và cực kỳ tốn kém. Chunking giúp chia nhỏ thông tin và hệ thống tìm kiếm sẽ lọc ra chính xác phần dữ liệu cần thiết để cung cấp vào ngữ cảnh của LLM.

### 2. Tăng độ chính xác của mô hình Embedding
Các mô hình Embedding (mô hình chuyển đổi văn bản thành vector) thường có độ dài đầu vào tối ưu nhất định. Ví dụ: `text-embedding-3-small` hoặc `text-embedding-ada-002` của OpenAI hỗ trợ tối đa 8191 token, nhưng chúng thường biểu diễn vector tốt nhất đối với các đoạn văn bản tập trung vào một ý tưởng hoặc khái niệm duy nhất. Nếu bạn nhồi nhét quá nhiều chủ đề vào một chunk, vector kết quả sẽ bị trung bình hóa (diluted), dẫn đến việc tính toán độ tương đồng (cosine similarity) khi tìm kiếm kém chính xác đi rất nhiều.

### 3. Tối ưu hóa quá trình Truy xuất (Retrieval)
Mục tiêu của RAG là tìm ra thông tin liên quan nhất đến câu hỏi của người dùng. Nếu chunk quá lớn, kết quả trả về có thể chứa thông tin mà người dùng cần nhưng lại kèm theo rất nhiều "nhiễu" không liên quan, làm LLM bối rối. Nếu chunk quá nhỏ, nó có thể mất đi ngữ cảnh cần thiết. Chunking tối ưu giúp hệ thống duy trì được sự cân bằng này.

### 4. Tiết kiệm chi phí
Các API của LLM thường tính phí dựa trên số lượng token được đưa vào và sinh ra. Bằng cách chỉ gửi những chunk chứa thông tin liên quan nhất thay vì các đoạn tài liệu dài, bạn sẽ giảm thiểu đáng kể lượng token tiêu thụ, từ đó tối ưu hóa chi phí vận hành cho toàn bộ hệ thống.

---

## Các Chiến Lược Chunking Phổ Biến

Không có một phương pháp chunking nào là phù hợp (one-size-fits-all) cho mọi bài toán. Dưới đây là các kỹ thuật từ cơ bản đến nâng cao được sử dụng phổ biến trong thực tế:

### 1. Fixed-size Chunking (Phân tách theo kích thước cố định)
Đây là phương pháp cơ bản và dễ triển khai nhất. Văn bản được chia theo một giới hạn ký tự, số lượng từ, hoặc số token không đổi (ví dụ: 500 từ hoặc 1000 token mỗi chunk) bất kể cấu trúc hay ý nghĩa ngữ pháp của văn bản.

*   **Ưu điểm:** Dễ cài đặt, lập trình đơn giản, chi phí tính toán thấp.
*   **Nhược điểm:** Dễ cắt đứt một câu, một đoạn văn, hoặc một ý tưởng đang diễn đạt dang dở dẫn đến mất đi ý nghĩa trọn vẹn.
*   **Khi nào sử dụng:** Phù hợp để làm baseline thử nghiệm nhanh chóng hoặc làm việc với các đoạn text thô ít yêu cầu về bảo toàn cấu trúc ngữ nghĩa phức tạp.

### 2. Recursive Character Text Splitting (Phân tách đệ quy)
Phương pháp này (rất phổ biến trong LangChain) là một bản nâng cấp so với Fixed-size nhằm giữ nguyên các đoạn văn, câu, và từ cùng nhau tối đa nhất có thể. Nó sử dụng một danh sách các ký tự phân tách (ví dụ: `["\n\n", "\n", " ", ""]`). Nó sẽ thử chia văn bản dựa vào ký tự đầu tiên (tách đoạn văn), nếu đoạn đó vẫn còn lớn hơn kích thước chunk mong muốn, nó tiếp tục dùng ký tự tiếp theo (tách câu), và tiếp tục đệ quy cho đến khi kích thước mỗi phần đạt chuẩn.

*   **Ưu điểm:** Giữ được sự toàn vẹn của ngữ nghĩa tốt hơn nhiều so với Fixed-size.
*   **Nhược điểm:** Vẫn có rủi ro tách rời các câu có quan hệ logic mạnh mẽ nếu không chọn kích thước chunk cẩn thận.
*   **Khi nào sử dụng:** Được xem là lựa chọn mặc định "an toàn" nhất cho đa số các bài toán xây dựng RAG thông thường.

### 3. Document-based / Structural Chunking (Phân tách theo cấu trúc)
Thay vì chia một cách mù quáng dựa trên số lượng ký tự, phương pháp này tận dụng cấu trúc nội tại của tài liệu.
*   **Markdown Splitting:** Tách văn bản dựa trên các thẻ tiêu đề (Heading 1, Heading 2, ...).
*   **HTML Splitting:** Tách dựa trên cấu trúc DOM của web như các thẻ `<div>`, `<p>`, `<table>`.
*   **Code Splitting:** Sử dụng bộ phân tích cú pháp (parser) của các ngôn ngữ lập trình (Python, JavaScript...) để chia tách theo cấu trúc hàm (function) hoặc lớp (class).

*   **Ưu điểm:** Rất tuyệt vời trong việc bảo toàn cấu trúc logic mà tác giả đã chủ ý chia. (Ví dụ: một chunk là toàn bộ nội dung trong một mục phụ).
*   **Khi nào sử dụng:** Hiệu quả khi xử lý dữ liệu scrape từ web, kho lưu trữ mã nguồn, các tài liệu hướng dẫn được định dạng bằng Markdown.

### 4. Semantic Chunking (Phân tách theo ngữ nghĩa)
Đây là một phương pháp nâng cao mang tính cách mạng hiện nay. Hệ thống phân tích ý nghĩa của các câu và gộp những câu có ý nghĩa tương tự lại với nhau thành một chunk. Khi phát hiện một sự thay đổi đáng kể về chủ đề (sử dụng khoảng cách ngữ nghĩa giữa các vector embedding của các câu), hệ thống sẽ cắt đoạn văn ở đó và bắt đầu một chunk mới.

*   **Ưu điểm:** Giữ lại hoàn toàn ngữ cảnh liền mạch. Các đoạn chunk kết quả mang lại cảm giác rất tự nhiên và trọn vẹn.
*   **Nhược điểm:** Chậm và tốn kém, vì phải chạy mô hình Embedding cho từng câu (thậm chí từng mệnh đề) một cách độc lập trước khi có thể quyết định điểm tách nhóm.
*   **Khi nào sử dụng:** Dành cho các hệ thống yêu cầu độ chính xác truy xuất cực cao, dữ liệu đặc thù phức tạp, và khi bạn dư dả về năng lực tính toán.

### 5. Agentic Chunking
Sử dụng chính các mô hình LLM (như các agent thu nhỏ) để duyệt qua văn bản, tóm tắt và quyết định cách tối ưu nhất để tự phân chia tài liệu. Agent có khả năng hiểu toàn bộ ý tưởng để tạo ra các cụm chunk phức tạp.

---

## Chunk Overlap (Độ Gối Đầu) Là Gì?

Khi thực hiện chunking, đặc biệt là với các cách tiếp cận chia theo độ dài cố định hoặc đệ quy, việc cắt xén ngẫu nhiên có thể vô tình làm đứt một mạch ý tưởng. Để khắc phục sự cố này, chúng ta định nghĩa thông số **Overlap** (Đoạn gối đầu / độ trùng lặp).

*Ví dụ:* Nếu cấu hình hệ thống với `chunk_size=500` và `chunk_overlap=50`:
*   Chunk 1: Lưu giữ từ số 1 đến 500.
*   Chunk 2: Bắt đầu từ vị trí 451 đến 950 (50 từ cuối của Chunk 1 được lặp lại thành 50 từ đầu ở Chunk 2).

**Tại sao Overlap lại quan trọng?** 
Overlap hoạt động như một chất keo cung cấp ngữ cảnh chuyển tiếp. Nếu thông tin then chốt của văn bản nằm ngay tại biên giới của khu vực cắt xén, sự trùng lặp sẽ đảm bảo rằng ít nhất một trong hai chunk liền kề chứa đựng được toàn bộ ngữ cảnh về thông tin đó để mô hình nhận diện được mối liên hệ.

---

## Làm Thế Nào Để Chọn Kích Thước Chunk (Chunk Size) Phù Hợp?

Việc chọn `chunk_size` và `chunk_overlap` phần lớn là một quá trình thử-sai (trial and error) đồng thời phụ thuộc chặt chẽ vào Use Case cụ thể. Dưới đây là các yếu tố cần đánh giá:

1.  **Mô hình Embedding được sử dụng:** Mô hình của bạn biểu diễn nội dung tốt nhất cho những câu văn ngắn (như `all-MiniLM-L6-v2` thường gặp trên HuggingFace) hay được tối ưu hóa cho những đoạn văn dài (như OpenAI `text-embedding-3-large`)?
2.  **Kỳ vọng câu hỏi từ người dùng (User Queries):** Người dùng hệ thống có xu hướng hỏi những câu ngắn gọn truy vấn thông tin trực tiếp ("Khách hàng này tên là gì?") hay những yêu cầu tổng hợp vĩ mô ("Đánh giá tổng quan chiến lược quý 3")? Câu hỏi ngắn, truy vấn chính xác nên sử dụng chunk nhỏ; yêu cầu tổng hợp cần các chunk bao quát lớn hơn.
3.  **Đặc thù dữ liệu:** Nếu dữ liệu đầu vào là hội thoại chat hay tin nhắn mạng xã hội, kích thước chunk nhỏ là hợp lý. Ngược lại, nếu tập dữ liệu bao gồm các bài luận nghiên cứu khoa học phức tạp, một chunk cần đủ rộng lớn để ôm trọn vẹn một luận điểm.

*Mẹo tham khảo:* Một điểm khởi đầu (baseline) tốt được cộng đồng khuyến nghị là `chunk_size` vào khoảng 500 - 1000 token, với độ overlap khoảng 10-20% (ví dụ: `chunk_size=1000` và `chunk_overlap=150`).

---

## Code Ví Dụ Bằng LangChain

Dưới đây là một minh họa đơn giản về cấu hình chunking sử dụng module `RecursiveCharacterTextSplitter` của thư viện LangChain bằng Python:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Nội dung mẫu
text = """Trí tuệ nhân tạo (AI) đang thay đổi cách thế giới vận hành nhanh chóng. 
Nó được áp dụng trong nhiều lĩnh vực đa dạng từ y tế, giáo dục cho đến tài chính.
Các mô hình ngôn ngữ lớn (LLM) là một cấu phần cốt lõi của AI tạo sinh hiện đại. 
Doanh nghiệp đang tăng tốc tích hợp AI vào quy trình làm việc."""

# Khởi tạo Text Splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=60,       # Kích thước tối đa mỗi chunk là 60 ký tự
    chunk_overlap=15,    # Giữ lại 15 ký tự gối đầu để duy trì ngữ cảnh
    separators=["\n\n", "\n", " ", ""] # Thứ tự ưu tiên cắt (ưu tiên đoạn văn, câu, sau đó là từ)
)

# Thực hiện chia đoạn
chunks = text_splitter.split_text(text)

# In kết quả
for i, chunk in enumerate(chunks):
    print(f"Chunk {i+1}:\n{chunk}\n---")
```

---

## Những Thách Thức Khi Thực Hiện Chunking

1.  **Mất ngữ cảnh đại từ cốt lõi (Coreference Resolution):** Ví dụ, Chunk 1 đề cập đến "Tiến sĩ John Doe". Chunk 2 nối tiếp bắt đầu bằng đại từ "Anh ấy". Nếu quá trình truy xuất chỉ trả về Chunk 2, LLM sẽ không có cơ sở nào để biết "Anh ấy" ở đây là đại diện cho ai.
2.  **Xử lý dữ liệu đa phương thức (Bảng biểu / Hình ảnh):** Việc chunking các bảng số liệu (tables) nằm gọn trong các báo cáo tài chính PDF là một bài toán hóc búa. Chia cắt ngẫu nhiên một bảng sẽ làm hỏng cấu trúc dòng cột và phá vỡ thông tin. Hệ thống thường phải kết hợp các giải pháp Vision/OCR, hoặc chuyển hóa bảng sang các định dạng chuẩn (Markdown, CSV) trước khi xử lý.

---

## Kết Luận

Chunking hoàn toàn không chỉ là một thủ thuật cắt văn bản vô hồn; đó thực sự là nghệ thuật của việc giữ gìn và bảo toàn mạch ngữ nghĩa của kiến thức, trong khi vẫn thỏa mãn được các giới hạn ràng buộc nghiêm ngặt của mô hình ngôn ngữ lớn và kiến trúc cơ sở dữ liệu vector. Việc áp dụng đúng kỹ thuật và chiến lược chunking sẽ trực tiếp làm giảm thiểu rủi ro "ảo giác" (hallucination) và là yếu tố làm nên khác biệt của một hệ thống RAG thực sự hiệu quả.

---

## Tài Liệu Tham Khảo

* [LangChain Text Splitters Documentation](https://python.langchain.com/docs/modules/data_connection/document_transformers/)
* [LlamaIndex: Node Parsers and Chunking Strategies](https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/)
* [Pinecone: Chunking Strategies for LLM Applications](https://www.pinecone.io/learn/chunking-strategies/)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
