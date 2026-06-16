---
title: "Tìm kiếm ngữ nghĩa - Semantic Search"
difficulty: "Intermediate"
tags: ["semantic-search", "vector-database", "nlp", "information-retrieval"]
readingTime: "10 mins"
lastUpdated: 2026-06-08
seoTitle: "Tìm kiếm ngữ nghĩa (Semantic Search) là gì? Khác gì với Keyword Search?"
metaDescription: "Tìm hiểu Tìm kiếm ngữ nghĩa (Semantic Search), cách thức hoạt động dựa trên Vector Embeddings và ứng dụng trong các hệ thống thông minh, RAG."
description: "Đã bao giờ bạn gõ một câu hỏi lên công cụ tìm kiếm của một trang web bán hàng và nhận về kết quả trống trơn, chỉ vì bạn không dùng đúng từ khóa mà họ ..."
---



Đã bao giờ bạn gõ một câu hỏi lên công cụ tìm kiếm của một trang web bán hàng và nhận về kết quả trống trơn, chỉ vì bạn không dùng đúng từ khóa mà họ lưu trữ? Đây là vấn đề muôn thuở của tìm kiếm truyền thống. **Semantic Search (Tìm kiếm ngữ nghĩa)** ra đời để giải quyết bài toán đó. Nó vượt qua giới hạn của việc so khớp từ khóa, cho phép máy tính "hiểu" được ý định và ngữ cảnh của người dùng.

## 1. Vấn đề của Keyword Search (Tìm kiếm từ khóa)



Tìm kiếm truyền thống (Lexical Search hay Keyword Search) hoạt động dựa trên nguyên tắc **khớp chuỗi (exact match)** hoặc đếm tần suất xuất hiện của từ khóa (ví dụ thuật toán **TF-IDF**, **BM25**). 

**Hạn chế lớn nhất:**
- **Không hiểu từ đồng nghĩa:** Gõ "điện thoại thông minh", hệ thống dùng Keyword Search có thể bỏ qua các kết quả chứa từ "smartphone" hay "điện thoại di động".
- **Bỏ qua ngữ cảnh (Context):** Từ "apple" có thể là "quả táo" hoặc "công ty Apple". Keyword Search khó phân biệt nếu không phân tích các từ xung quanh.
- **Lỗi chính tả:** Sai một ký tự có thể khiến hệ thống không trả về kết quả nào (dù có thể dùng Fuzzy Search để giảm thiểu, nhưng hiệu quả còn nhiều hạn chế).
- **Phụ thuộc vào cách diễn đạt:** Người dùng phải cố gắng đoán xem người tạo dữ liệu đã dùng từ khóa gì để thiết lập truy vấn.

## 2. Semantic Search là gì?

**Semantic Search** là phương pháp tìm kiếm thông tin không chỉ dựa vào sự xuất hiện của các ký tự hay từ khóa, mà dựa vào **ý nghĩa (semantics)** và **ngữ cảnh** của truy vấn. 

Thay vì so sánh từng chữ cái, hệ thống Semantic Search chuyển cả câu truy vấn của bạn và toàn bộ tài liệu trong cơ sở dữ liệu sang một ngôn ngữ chung mà máy tính có thể phân tích được: **Toán học (Các vector số thực)**. Nhờ đó, ngay cả khi câu hỏi và tài liệu không chia sẻ bất kỳ từ vựng nào, hệ thống vẫn có thể nhận ra chúng đang nói về cùng một chủ đề.

## 3. Cách thức hoạt động của Semantic Search

Trái tim của Semantic Search nằm ở hai công nghệ cốt lõi: **Vector Embeddings** và **Similarity Search (Tìm kiếm độ tương đồng)**.

### 3.1. Biến văn bản thành số: Vector Embeddings
Máy tính không hiểu tiếng Việt hay tiếng Anh, chúng chỉ hiểu các con số. Bằng cách sử dụng các mô hình học sâu (Deep Learning Models) như BERT, RoBERTa hay các mô hình từ OpenAI, Cohere, HuggingFace, chúng ta có thể chuyển đổi một từ, một câu hay cả một đoạn văn thành một **dãy số thực dài (Vector)**. Quá trình này gọi là **Embedding**.

*Ví dụ đơn giản trong không gian 2 chiều (đơn giản hóa):*
- "Chó": `[0.9, -0.2]`
- "Mèo": `[0.8, -0.1]`
- "Xe hơi": `[-0.5, 0.9]`

Các khái niệm giống nhau hoặc liên quan đến nhau sẽ có các tọa độ (vector) nằm gần nhau trong không gian đa chiều. Dễ thấy "Chó" và "Mèo" có giá trị gần nhau, trong khi "Xe hơi" nằm ở một khu vực hoàn toàn khác.

### 3.2. Không gian Vector (Vector Space)
Trong thực tế, các mô hình embedding sinh ra các vector có hàng trăm hoặc hàng nghìn chiều (ví dụ mô hình `text-embedding-3-small` của OpenAI trả về vector có 1536 chiều). Mỗi chiều đại diện cho một thuộc tính ngữ nghĩa ẩn nào đó mà mô hình đã học được từ hàng tỷ văn bản trong quá trình huấn luyện.

### 3.3. Tính toán độ tương đồng (Similarity Metrics)
Khi người dùng gõ câu truy vấn (Query), câu này cũng được chuyển thành một Vector bằng chính mô hình Embedding đã dùng cho cơ sở dữ liệu.

Lúc này, bài toán tìm kiếm trở thành bài toán hình học không gian: **Tìm các vector trong cơ sở dữ liệu có khoảng cách gần nhất với vector của câu truy vấn.**

Một số phép đo khoảng cách phổ biến:
- **Cosine Similarity:** Đo góc giữa hai vector. Góc càng nhỏ (Cosine tiến về 1) thì ngữ nghĩa càng tương đồng. Đây là phép đo phổ biến nhất cho dữ liệu văn bản.
- **Dot Product (Tích vô hướng):** Dùng để tính toán độ tương quan về hướng và cả độ lớn.
- **Euclidean Distance (Khoảng cách L2):** Khoảng cách đường thẳng giữa hai điểm trong không gian.

## 4. Kiến trúc hệ thống Semantic Search

Một hệ thống Semantic Search tiêu chuẩn bao gồm các thành phần sau:

1. **Dữ liệu nguồn (Raw Data):** Văn bản, PDF, Website, cơ sở dữ liệu, v.v.
2. **Data Pipeline / Chunking:** Dữ liệu quá dài sẽ được cắt nhỏ (chunking) thành các đoạn văn (paragraphs) hoặc câu để đảm bảo ngữ nghĩa được biểu diễn chính xác.
3. **Embedding Model:** Đưa các chunk (đoạn văn) đi qua mô hình AI để tạo ra các Vector.
4. **Vector Database:** Nơi lưu trữ (store) và đánh chỉ mục (index) các vector này. Các cơ sở dữ liệu vector phổ biến gồm: **Milvus, Pinecone, Qdrant, ChromaDB, Weaviate, pgvector**.
5. **Retrieval (Quá trình truy vấn):**
   - User nhập query: *"Cách làm bánh mì"*
   - Query -> Embedding Model -> Vector Q
   - Truy vấn Vector Database: Trả về top K vector gần với Vector Q nhất.
   - Ánh xạ (Map) các vector trả về với văn bản gốc và hiển thị cho người dùng.

## 5. So sánh Semantic Search vs Keyword Search

| Tiêu chí | Keyword Search (TF-IDF, BM25) | Semantic Search (Vector Search) |
|----------|------------------------------|---------------------------------|
| **Cách thức khớp** | Khớp chính xác các từ khóa hoặc biến thể của từ. | Dựa trên độ tương đồng về ý nghĩa, ngữ cảnh. |
| **Xử lý từ đồng nghĩa** | Kém (phải tự định nghĩa từ điển đồng nghĩa). | Rất tốt (mô hình tự hiểu các từ liên quan). |
| **Xử lý lỗi chính tả** | Hạn chế. | Tốt (Vector không thay đổi quá nhiều nếu sai một vài lỗi nhỏ). |
| **Khả năng đa ngôn ngữ** | Cần xây dựng engine riêng, dictionary riêng cho từng ngôn ngữ. | Dễ dàng hỗ trợ nếu dùng Multilingual Models (truy vấn tiếng Việt có thể tìm ra tài liệu tiếng Anh). |
| **Tài nguyên phần cứng** | Tốn ít tài nguyên tính toán (chủ yếu dựa trên CPU/RAM). | Đòi hỏi nhiều tài nguyên hơn (GPU để tạo embedding, tối ưu bộ nhớ cho Vector DB). |
| **Chi phí triển khai** | Thấp, dễ cấu hình với ElasticSearch hoặc Solr. | Cao hơn, đòi hỏi kiến thức về AI/ML và Vector DB. |

## 6. Hybrid Search: Mảnh ghép hoàn hảo

Mặc dù Semantic Search rất thông minh, nhưng nó không hoàn hảo cho mọi trường hợp. Đôi khi người dùng *thực sự* muốn tìm kiếm chính xác một mã sản phẩm đặc thù ("iPhone 15 Pro Max 256GB") hoặc tên một lỗi hệ thống mã hóa ("NullPointerException", "Error 404"). Trong trường hợp này, Semantic Search có thể mang lại các kết quả "có ý nghĩa tương tự" nhưng lại không khớp chính xác chuỗi.

Giải pháp tối ưu nhất được các hệ thống lớn (như ElasticSearch, Pinecone) áp dụng hiện nay là **Hybrid Search (Tìm kiếm lai)**: Kết hợp sức mạnh của cả Keyword Search và Semantic Search.

Hệ thống sẽ hoạt động theo luồng:
1. Chạy song song cả hai kiểu tìm kiếm: Lấy top K kết quả từ BM25 và top K kết quả từ Vector Search.
2. Gộp kết quả sử dụng các thuật toán như **Reciprocal Rank Fusion (RRF)**.
3. Đem lại danh sách kết quả cuối cùng hoàn hảo: vừa đáp ứng độ chính xác của từ khóa, vừa hiểu đúng ngữ cảnh.

## 7. Ứng dụng thực tế của Semantic Search

- **Hệ thống RAG (Retrieval-Augmented Generation):** Đây là công nghệ đằng sau các Chatbot thông minh (như ChatPDF, AI doanh nghiệp). Semantic Search giúp tìm ra tài liệu chính xác để làm "ngữ cảnh" cho mô hình Ngôn ngữ Lớn (LLM) trả lời, giảm thiểu việc AI bịa thông tin (hallucination).
- **Thương mại điện tử (E-commerce):** Nâng cao trải nghiệm khách hàng bằng cách cho phép tìm kiếm theo nhu cầu thay vì tên sản phẩm (VD: "áo ấm mặc đi tuyết" thay vì bắt buộc dùng từ khóa "áo khoác phao").
- **Hệ thống Hỗ trợ khách hàng (Customer Support):** Tự động tìm kiếm giải pháp trong hệ thống Knowledge Base nội bộ dựa trên câu hỏi tự nhiên của khách hàng.
- **Tìm kiếm trên kho tài liệu đồ sộ:** Tìm kiếm nhanh chóng thông tin trong hàng nghìn hợp đồng, báo cáo, tài liệu luật pháp một cách trực quan, không cần phải nhớ chính xác từ khóa được sử dụng trong tài liệu.

## Tài Liệu Tham Khảo

* [What is Semantic Search? (Pinecone)](https://www.pinecone.io/learn/semantic-search/)
* [Vector Embeddings Explained - HuggingFace](https://huggingface.co/blog/getting-started-with-embeddings)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
