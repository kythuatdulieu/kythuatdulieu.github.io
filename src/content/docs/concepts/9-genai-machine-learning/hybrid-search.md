---
title: "Tìm kiếm kết hợp (Hybrid Search)"
difficulty: "Intermediate"
tags: ["hybrid-search", "vector-database", "rag", "bm25", "genai"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Hybrid Search là gì? Kết hợp Keyword và Vector Search trong RAG"
metaDescription: "Tìm hiểu chi tiết về Hybrid Search (Tìm kiếm kết hợp), kỹ thuật hòa trộn giữa tìm kiếm từ khóa (BM25) và tìm kiếm vector (Dense Retrieval) để tối ưu hệ thống RAG."
description: "Trong các hệ thống hỗ trợ hỏi đáp bằng trí tuệ nhân tạo (RAG - Retrieval-Augmented Generation) hiện nay, việc tìm kiếm và truy xuất thông tin chính xác là cực kỳ quan trọng. Bài viết sẽ đi sâu vào kỹ thuật Hybrid Search, giúp hệ thống không chỉ hiểu ngữ nghĩa mà còn bắt chính xác từng từ khóa."
---



Hybrid Search (Tìm kiếm kết hợp hay Tìm kiếm lai) kết hợp sức mạnh của hai thế giới: **Tìm kiếm Từ khóa** (Keyword Search truyền thống, thường sử dụng thuật toán BM25) để bắt chính xác các danh từ riêng, mã sản phẩm hoặc thuật ngữ chuyên ngành; VÀ **Tìm kiếm Ngữ nghĩa** (Semantic Vector Search) để hiểu được ý định và ngữ cảnh của câu hỏi. Đây hiện được xem là kiến trúc tiêu chuẩn và tối ưu nhất cho các hệ thống RAG hiện đại.

---

## 1. Tại sao chúng ta cần Hybrid Search?



Trong một hệ thống truy xuất thông tin, chúng ta thường sử dụng một trong hai phương pháp chính, nhưng mỗi phương pháp đều có điểm mạnh và điểm yếu riêng:

### Tìm kiếm từ khóa (Keyword/Sparse Search)
Thường sử dụng các thuật toán như **TF-IDF** hay phổ biến nhất là **BM25**. Hệ thống sẽ đếm tần suất xuất hiện của từ khóa trong tài liệu so với toàn bộ tập dữ liệu.
- **Ưu điểm:** Cực kỳ chính xác khi người dùng tìm kiếm các từ ngữ cụ thể, danh từ riêng, tên người, mã định danh (ví dụ: `IPHONE-15-PRO`, `GenZ`, tên một loại thuốc). Nó hoạt động tốt kể cả khi từ khóa không có trong từ điển (Out-of-vocabulary).
- **Nhược điểm:** Không hiểu được ngữ nghĩa. Nó sẽ thất bại nếu người dùng sử dụng từ đồng nghĩa (ví dụ: tìm "điện thoại di động" sẽ không khớp với "smartphone"), hoặc khi truy vấn là một câu hỏi dài phức tạp.

### Tìm kiếm Vector (Semantic/Dense Search)
Sử dụng các mô hình học máy (như BERT, OpenAI Embeddings) để biến đổi cả câu truy vấn và tài liệu thành các vector số học nhiều chiều (dense vectors). Khoảng cách giữa các vector thể hiện mức độ tương đồng về mặt ý nghĩa.
- **Ưu điểm:** Hiểu được ngữ cảnh, ý định của người dùng và xử lý tốt các từ đồng nghĩa hoặc câu hỏi đa nghĩa. Ví dụ: "Nơi nào bán đồ ăn ngon?" có thể khớp với "Nhà hàng ẩm thực tuyệt hảo".
- **Nhược điểm:** Thường kém hiệu quả với các từ khóa hiếm, mã định danh cụ thể hoặc khi người dùng thực sự muốn tìm một từ chính xác (exact match) thay vì khái niệm tương đương.

👉 **Giải pháp:** Hybrid Search ra đời để lấp đầy khoảng trống này bằng cách chạy song song cả hai phương pháp, sau đó gộp và xếp hạng lại (rerank) kết quả để trả về danh sách tài liệu tốt nhất.

---

## 2. Cơ chế hoạt động của Hybrid Search

Một quy trình Hybrid Search tiêu chuẩn diễn ra qua các bước sau:

1. **Tiếp nhận truy vấn (Querying):** Người dùng nhập một câu truy vấn (ví dụ: `"Cách sửa lỗi màn hình xanh trên Windows 11"`).
2. **Chạy song song hai luồng (Dual Retrieval):**
   - **Luồng Dense (Vector Search):** Câu truy vấn được đưa qua mô hình Embedding để tạo thành vector. Vector này được dùng để tìm kiếm các vector tài liệu gần nhất (thông qua thuật toán ANN, tính Cosine Similarity, v.v.).
   - **Luồng Sparse (Keyword Search):** Câu truy vấn được tách từ (tokenize) và so khớp với chỉ mục đảo ngược (inverted index) bằng BM25.
3. **Tính điểm và Kết hợp (Score Fusion):** Các tài liệu trả về từ cả hai luồng sẽ được tính điểm và gộp lại. Do thang điểm của Vector Search (ví dụ cosine 0-1) và BM25 (không giới hạn) là khác nhau, cần phải có cơ chế chuẩn hóa và kết hợp điểm số.
4. **Xếp hạng lại và Trả kết quả (Reranking & Output):** Trả về Top $K$ tài liệu có điểm số cao nhất cho người dùng hoặc cho LLM trong hệ thống RAG.

---

## 3. Các phương pháp kết hợp kết quả (Score Fusion Methods)

Làm sao để gộp kết quả từ hai hệ thống chấm điểm hoàn toàn khác nhau? Có hai phương pháp phổ biến nhất:

### 3.1. RRF (Reciprocal Rank Fusion)
Đây là phương pháp đơn giản nhưng cực kỳ hiệu quả, hoạt động dựa trên **thứ hạng (rank)** của tài liệu thay vì điểm số tuyệt đối. Nó không yêu cầu việc chuẩn hóa các khoảng điểm khác nhau.

Công thức của RRF:
$$ RRF\_Score = \frac{1}{k + Rank_{dense}} + \frac{1}{k + Rank_{sparse}} $$

Trong đó:
- $Rank_{dense}$: Vị trí thứ hạng của tài liệu trong kết quả Vector Search.
- $Rank_{sparse}$: Vị trí thứ hạng của tài liệu trong kết quả BM25.
- $k$: Một hằng số làm mượt (smoothing constant), thường được đặt bằng 60.

**Tại sao RRF hiệu quả?**
RRF ưu tiên những tài liệu xuất hiện ở thứ hạng cao trong cả hai danh sách. Nếu một tài liệu vừa chứa chính xác từ khóa, vừa có ngữ nghĩa phù hợp, nó sẽ có điểm RRF rất cao.

### 3.2. Alpha / Convex Combination (Nội suy tuyến tính)
Phương pháp này kết hợp trực tiếp điểm số đã được chuẩn hóa. Hệ thống sử dụng một tham số $\alpha$ (nằm trong khoảng từ 0 đến 1) để quyết định "sức nặng" của mỗi phương pháp.

$$ Final\_Score = \alpha \times Dense\_Score + (1 - \alpha) \times Sparse\_Score $$

- Nếu $\alpha = 1$: Chỉ sử dụng tìm kiếm Vector hoàn toàn.
- Nếu $\alpha = 0$: Chỉ sử dụng tìm kiếm BM25 hoàn toàn.
- Nếu $\alpha = 0.5$: Trọng số chia đều 50/50 cho cả hai bên.

Trong thực tế ứng dụng, nhiều hệ thống cấu hình cho $\alpha$ ở mức khoảng `0.7` đến `0.8`, hơi nghiêng về tìm kiếm Vector nhưng vẫn lấy yếu tố từ khóa làm bệ đỡ.

---

## 4. Các công cụ và Vector Database hỗ trợ

Đa số các Vector Database thế hệ mới đều đã tích hợp sẵn Hybrid Search một cách "out-of-the-box":

- **Weaviate:** Nổi tiếng với tính năng Hybrid Search tích hợp sâu. Cho phép tùy chỉnh tham số `alpha` dễ dàng qua API và tự động tính BM25 dưới nền.
- **Qdrant:** Cung cấp tính năng tìm kiếm thưa (Sparse Vector) kết hợp Dense Vector, giúp thực hiện Hybrid Search hiệu quả.
- **Pinecone:** Tương tự Qdrant, Pinecone cho phép đưa vào cả sparse/dense vectors cho mỗi điểm dữ liệu, tiện lợi cho việc kết hợp BM25 (dưới dạng SPLADE hoặc các thuật toán sparse khác).
- **Milvus:** Hỗ trợ tính năng Multi-Vector và các chiến lược Rerank mạnh mẽ.
- **Elasticsearch:** Ông vua của tìm kiếm văn bản truyền thống giờ đây đã hỗ trợ Dense Vector và chức năng truy vấn kết hợp (Ensemble retrieval) sử dụng RRF.

Ngoài ra, các framework orchestration cho LLM như **LangChain** hay **LlamaIndex** cũng cung cấp các module (`EnsembleRetriever` trong LangChain) để kết hợp nhiều Retriever lại với nhau bằng thuật toán RRF.

---

## 5. Ví dụ ứng dụng thực tế

Tưởng tượng một hệ thống RAG tra cứu nội quy và phúc lợi cho nhân viên công ty:
- **Câu hỏi của người dùng:** *"Làm thế nào để đăng ký nghỉ phép diện FMLA (Family and Medical Leave Act)?"*
- Nếu chỉ dùng Vector Search: Nó có thể trả về các chính sách nghỉ phép chung chung, nghỉ thai sản, nghỉ ốm, do ý nghĩa gần giống. Nó có thể bỏ lỡ từ khóa `FMLA` vì cụm từ này ít gặp và có thể không nằm trong dữ liệu huấn luyện của mô hình embedding.
- Nếu chỉ dùng Keyword Search: Nó chỉ tìm những câu có đúng từ `FMLA` nhưng có thể bỏ sót các đoạn văn bản quan trọng mô tả "chính sách cho phép nghỉ chăm sóc y tế cho người thân" mà không lặp lại từ khóa.
- **Hybrid Search:** Bắt chính xác các đoạn chứa thuật ngữ `FMLA` (từ BM25) đồng thời hiểu ngữ cảnh của việc "đăng ký nghỉ phép chăm sóc người thân" (từ Vector). Kết quả là tài liệu liên quan nhất sẽ luôn được xếp hạng đầu tiên.

---

## 6. Tổng kết

Hybrid Search giải quyết triệt để vấn đề "hoặc chính xác, hoặc linh hoạt" bằng cách cung cấp cả hai. Dù phức tạp hơn đôi chút về mặt thiết lập hạ tầng (bạn phải duy trì cả Inverted Index và Vector Index, cũng như hai luồng tìm kiếm riêng biệt), lợi ích mà nó mang lại cho chất lượng truy xuất của các ứng dụng RAG là không thể phủ nhận. Khi xây dựng các hệ thống AI cấp doanh nghiệp (Enterprise GenAI), Hybrid Search hiện nay được xem là yêu cầu bắt buộc (must-have).

---

## Tài Liệu Tham Khảo
* [Pinecone - Hybrid Search and Sparse-Dense Vectors](https://www.pinecone.io/learn/hybrid-search-intro/)
* [Weaviate - Hybrid Search Explained](https://weaviate.io/blog/hybrid-search-explained)
* [LangChain Documentation - Ensemble Retriever](https://python.langchain.com/docs/modules/data_connection/retrievers/ensemble)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
