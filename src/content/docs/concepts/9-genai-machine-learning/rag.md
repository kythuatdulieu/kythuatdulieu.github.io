---
title: "Tạo lập Truy xuất Tăng cường (RAG)"
difficulty: "Intermediate"
tags: ["rag", "genai", "llm", "vector-database", "information-retrieval"]
readingTime: "15 mins"
lastUpdated: 2026-06-08
seoTitle: "RAG là gì? Tổng quan về Retrieval-Augmented Generation"
metaDescription: "Tìm hiểu kiến trúc Retrieval-Augmented Generation (RAG), cách RAG giảm thiểu ảo giác của LLM, quy trình tích hợp Vector Database và thiết kế luồng xử lý RAG nâng cao."
description: "Các mô hình ngôn ngữ lớn (LLM) sở hữu khả năng ngôn ngữ và suy luận logic tốt. Tuy nhiên, trong môi trường doanh nghiệp, các LLM thường gặp hạn chế nh..."
---



Các mô hình ngôn ngữ lớn (LLM) như GPT-4, Claude hay Llama đã chứng minh khả năng xử lý ngôn ngữ tự nhiên, suy luận và tổng hợp thông tin vượt trội. Tuy nhiên, khi ứng dụng vào môi trường doanh nghiệp thực tế, các LLM này thường gặp phải ba hạn chế lớn:
1. **Ảo giác (Hallucination)**: LLM có thể tự bịa ra thông tin một cách rất thuyết phục khi chúng không biết câu trả lời chính xác.
2. **Kiến thức lỗi thời**: Trọng số của mô hình bị đóng băng tại thời điểm huấn luyện, do đó chúng không biết về các sự kiện hay dữ liệu mới xảy ra sau đó.
3. **Thiếu ngữ cảnh nội bộ**: Mô hình không thể truy cập vào dữ liệu bảo mật, tài liệu nội bộ hay tri thức riêng của doanh nghiệp.

**RAG (Retrieval-Augmented Generation)** ra đời như một giải pháp thiết thực nhất để giải quyết các vấn đề trên. Thay vì buộc LLM phải ghi nhớ mọi thứ trong tham số của nó, RAG kết hợp khả năng "Đọc hiểu và Tổng hợp" của LLM với một hệ thống "Tìm kiếm" (Retrieval) truy cập vào cơ sở tri thức bên ngoài.

## Kiến trúc Cơ bản của RAG (Naive RAG)



Một hệ thống RAG cơ bản thường bao gồm hai quá trình chính: **Data Indexing (Chuẩn bị dữ liệu)** (thực hiện offline/định kỳ) và **Inference (Suy luận)** (thực hiện realtime khi người dùng đặt câu hỏi).

### 1. Chuẩn bị dữ liệu (Data Indexing)

Đây là quá trình xây dựng "thư viện" tri thức cho hệ thống, bao gồm các bước:

* **Data Ingestion (Thu thập dữ liệu):** Tích hợp dữ liệu từ nhiều nguồn khác nhau như tài liệu PDF, Confluence, Notion, cơ sở dữ liệu SQL, API nội bộ.
* **Chunking / Splitting (Chia nhỏ văn bản):** Các tài liệu dài không thể nhét vừa vào Context Window (cửa sổ ngữ cảnh) của LLM và cũng làm giảm độ chính xác của việc tìm kiếm. Do đó, tài liệu cần được cắt thành các đoạn nhỏ hơn (chunks).
    * Các chiến lược chunking: Fixed-size chunking (cắt theo số lượng token/ký tự cố định có overlap), Sentence-based (cắt theo câu), Document-based (cắt theo cấu trúc tài liệu như tiêu đề, đoạn văn).
* **Embedding (Nhúng):** Đưa các chunks văn bản này qua một Embedding Model (như OpenAI `text-embedding-3-small`, Cohere, hay BAAI `bge-m3`) để biến đổi chúng thành các vector toán học (thường là một mảng hàng ngàn số thực). Những đoạn văn bản có ý nghĩa ngữ nghĩa giống nhau sẽ nằm gần nhau trong không gian vector.
* **Vector Database (Cơ sở dữ liệu Vector):** Lưu trữ các vector vừa tạo cùng với metadata (nguồn gốc tài liệu, thời gian, tác giả) và nội dung văn bản (chunk content). Các Vector DB phổ biến bao gồm Milvus, Pinecone, Qdrant, Chroma, hay pgvector.

### 2. Quá trình Suy luận (Retrieval & Generation)

Khi người dùng đặt một câu hỏi (Query), hệ thống sẽ thực hiện theo luồng sau:

* **Query Embedding:** Câu hỏi của người dùng được đưa qua *cùng một Embedding Model* đã dùng ở bước Indexing để tạo ra Vector câu hỏi.
* **Retrieval (Truy xuất):** Vector Database sẽ thực hiện thuật toán tìm kiếm độ tương đồng (Similarity Search) — thường dùng KNN (K-Nearest Neighbors) hoặc ANN (Approximate Nearest Neighbors) dựa trên khoảng cách Cosine, Euclidean distance hoặc Dot product. Hệ thống sẽ trả về Top K chunks có nội dung liên quan nhất đến câu hỏi.
* **Prompt Engineering:** Cấu trúc một Prompt mới gửi cho LLM, bao gồm:
    * Hệ thống chỉ dẫn (System Prompt): *"Bạn là một trợ lý ảo. Hãy trả lời câu hỏi dựa trên các ngữ cảnh được cung cấp dưới đây. Nếu không tìm thấy câu trả lời, hãy nói không biết."*
    * Ngữ cảnh (Retrieved Contexts): Top K chunks vừa được truy xuất.
    * Câu hỏi của người dùng.
* **Generation (Sinh văn bản):** LLM đọc prompt, sử dụng ngữ cảnh được cung cấp như một cuốn "sách mở" (open-book) để tổng hợp và sinh ra câu trả lời cuối cùng cho người dùng.

---

## Advanced RAG (RAG Nâng cao)

Kiến trúc Naive RAG thường gặp vấn đề khi hệ thống scale lên hàng triệu tài liệu: truy xuất sai ngữ cảnh, thiếu thông tin (Low Recall), hoặc quá nhiều thông tin rác (Low Precision). Để giải quyết, các kỹ thuật **Advanced RAG** tập trung vào 3 giai đoạn:

### 1. Pre-Retrieval (Tối ưu trước truy xuất)
Mục tiêu là cải thiện câu hỏi của người dùng để phù hợp hơn với không gian dữ liệu đã index.
* **Query Rewriting:** Người dùng thường đặt câu hỏi ngắn hoặc thiếu ngữ cảnh (ví dụ trong chatbot: "Vậy tính năng đó dùng thế nào?"). LLM sẽ được dùng để viết lại câu hỏi rõ nghĩa hơn dựa trên lịch sử chat.
* **Query Expansion / Multi-Query:** Từ một câu hỏi gốc, LLM tạo ra nhiều biến thể của câu hỏi (đồng nghĩa, góc nhìn khác nhau) để truy vấn Vector DB, sau đó gộp kết quả lại, giúp tăng tỷ lệ Recall.
* **Query Routing:** Dựa vào ý định của câu hỏi (Intent) để điều hướng truy vấn đến đúng kho dữ liệu hoặc công cụ (ví dụ: câu hỏi về số liệu sẽ route sang Text-to-SQL thay vì Vector Search).

### 2. Retrieval Optimization (Tối ưu truy xuất)
* **Hybrid Search (Tìm kiếm lai):** Kết hợp giữa **Vector Search** (tìm kiếm ngữ nghĩa - semantic) và **Keyword Search / BM25** (tìm kiếm từ khóa chính xác - lexical). Hybrid search rất hiệu quả với các từ lóng, tên riêng, mã sản phẩm mà mô hình embedding có thể không hiểu rõ.
* **Metadata Filtering:** Lọc trước dữ liệu dựa trên Metadata (như `date > '2023-01-01'` hoặc `department == 'HR'`) trước khi thực hiện vector search để thu hẹp không gian tìm kiếm.
* **Parent-Child Document Retrieval (Auto-merging):** Khi Indexing, lưu tài liệu ở các chunk nhỏ (Child) để có độ chính xác cao khi search vector, nhưng liên kết chúng với chunk lớn hơn (Parent). Nếu truy xuất trúng Child chunk, hệ thống sẽ trả về toàn bộ Parent chunk cho LLM để đảm bảo đủ ngữ cảnh lớn.

### 3. Post-Retrieval (Tối ưu sau truy xuất)
* **Re-ranking (Xếp hạng lại):** Ban đầu lấy ra một số lượng lớn kết quả (VD: top 50) bằng Vector Search (nhanh nhưng độ chính xác tương đối). Sau đó sử dụng một mô hình **Cross-Encoder** (chậm hơn nhưng hiểu ngữ cảnh sâu hơn) để chấm điểm và sắp xếp lại sự liên quan giữa Câu hỏi và từng Document. Cuối cùng chỉ chọn Top 3-5 tài liệu tốt nhất đưa cho LLM.
* **Context Compression (Nén ngữ cảnh):** Chỉ trích xuất những câu thực sự liên quan trong một chunk dài, loại bỏ phần dư thừa để tiết kiệm token và giúp LLM tránh bị nhiễu (Lost in the middle).

---

## So sánh RAG và Fine-tuning

Nhiều người lầm tưởng để LLM học kiến thức doanh nghiệp thì phải Fine-tune lại mô hình. Tuy nhiên, RAG và Fine-tuning phục vụ hai mục đích hoàn toàn khác nhau:

| Tiêu chí | RAG (Retrieval-Augmented Generation) | Fine-Tuning |
| :--- | :--- | :--- |
| **Bản chất** | Cung cấp cho LLM một cuốn sách mở để đọc. | Dạy cho LLM học thuộc kiến thức / cách giao tiếp mới. |
| **Kiến thức mới** | Tuyệt vời. Chỉ cần cập nhật Vector DB là có kiến thức mới. | Rất kém. Phải train lại mô hình từ đầu mỗi khi có dữ liệu mới. |
| **Ảo giác (Hallucination)** | Thấp. Có thể kiểm chứng (Traceability) qua nguồn tài liệu trích dẫn. | Cao. Mô hình vẫn có thể "chém gió" dựa trên xác suất từ ngữ. |
| **Tính bảo mật, phân quyền** | Tốt. Có thể check quyền người dùng trước khi truy xuất Document. | Khó. Mô hình học chung dữ liệu, có thể rò rỉ thông tin mật cho người không có quyền. |
| **Hành vi, định dạng (Tone & Style)** | Không thay đổi được hành vi cơ bản của mô hình, phụ thuộc nhiều vào Prompt. | Rất tốt. Tuyệt vời cho việc thay đổi format đầu ra, giọng văn đặc thù. |
| **Chi phí & Độ khó** | Khá rẻ và nhanh chóng để triển khai. | Đắt đỏ, cần nhiều dữ liệu gán nhãn, cần kỹ sư AI có chuyên môn cao. |

**Chiến lược tối ưu:** Thường kết hợp cả hai. Fine-tune một LLM nhỏ (như Llama 3 8B) để nó hiểu thuật ngữ chuyên ngành và cách format câu trả lời của công ty, sau đó dùng chính mô hình đó trong hệ thống RAG để truy xuất kiến thức cập nhật.

---

## Ưu điểm và Hạn chế của RAG

### Ưu điểm
1. **Giảm thiểu ảo giác đáng kể:** Bằng cách neo (grounding) câu trả lời vào các tài liệu thực tế.
2. **Nguồn gốc rõ ràng:** Hệ thống RAG luôn có thể cung cấp các đường link trích dẫn/tài liệu gốc (Citation) để người dùng kiểm chứng.
3. **Chi phí vận hành thấp:** Không tốn tiền tính toán khổng lồ như việc Fine-tune liên tục.
4. **Tri thức động (Dynamic Knowledge):** Dễ dàng thêm, sửa, xóa tài liệu bằng các thao tác CRUD trên Vector DB mà không chạm vào model.

### Hạn chế & Thách thức
1. **Độ trễ (Latency):** Quá trình xử lý qua nhiều bước (nhúng, truy xuất, LLM tổng hợp) khiến thời gian phản hồi thường mất vài giây.
2. **Rác vào - Rác ra (Garbage In - Garbage Out):** Nếu tài liệu gốc chưa được làm sạch, định dạng kém (ví dụ: bảng biểu phức tạp trong PDF), hiệu suất của RAG sẽ tụt giảm thê thảm.
3. **Phức tạp về Data Engineering:** Xây dựng một Pipeline tự động crawl dữ liệu, phân tách (parse), chunking và đồng bộ hóa với Vector DB theo thời gian thực là bài toán khó của Data Engineering.

---

## Hệ sinh thái Công cụ RAG

Để xây dựng hệ thống RAG, các kỹ sư thường dùng các công cụ sau:
* **Framework orchestration:** `LangChain`, `LlamaIndex`, `Haystack`. Các framework này cung cấp các abstraction để nối LLM với Vector DB và các tool dễ dàng.
* **Vector Databases:**
    * Chuyên dụng / Managed Service: `Pinecone`, `Weaviate`, `Qdrant`.
    * Open-source mạnh mẽ: `Milvus`, `ChromaDB`.
    * Tích hợp vào Relational DB: `pgvector` (PostgreSQL).
* **Embedding Models:** OpenAI (`text-embedding-3`), Cohere, HuggingFace (`BGE`, `E5`, `MiniLM`).
* **LLM:** Các mô hình có Context Window lớn như GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, hoặc các mô hình mã nguồn mở như Llama 3, Mixtral.

## Tài Liệu Tham Khảo
* [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Paper gốc của Facebook AI)](https://arxiv.org/abs/2005.11401)
* [Advanced RAG Techniques - LlamaIndex Documentation](https://docs.llamaindex.ai/en/stable/optimizing/advanced_retrieval/advanced_retrieval/)
* **A Cheat Sheet for RAG Patterns - LangChain**
* [Vector Databases and Vector Search - Pinecone](https://www.pinecone.io/learn/vector-database/)
