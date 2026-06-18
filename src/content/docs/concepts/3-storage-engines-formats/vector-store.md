---
title: "Cơ sở dữ liệu Vector - Vector Database"
difficulty: "Intermediate"
tags: ["vector-database", "embeddings", "similarity-search", "rag", "genai", "hnsw"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Cơ sở dữ liệu Vector (Vector Database) - Nền tảng của GenAI & RAG"
metaDescription: "Tìm hiểu Cơ sở dữ liệu Vector (Vector Store): Cách lưu trữ embeddings, thuật toán tìm kiếm ANN (HNSW), và vai trò then chốt trong hệ thống RAG."
description: "Trong kỷ nguyên của Trí tuệ nhân tạo tạo sinh, các mô hình ngôn ngữ lớn (LLM) giống như những bộ não siêu việt nhưng lại thiếu trí nhớ dài hạn. Vector Database đóng vai trò như bộ nhớ ngoài, giúp LLM truy xuất thông tin ngữ nghĩa hiệu quả."
---



Trong kỷ nguyên của Trí tuệ nhân tạo tạo sinh (Generative AI), các mô hình ngôn ngữ lớn ([LLM](/concepts/9-genai-machine-learning/llm)) thể hiện khả năng hiểu và sinh ngôn ngữ đáng kinh ngạc. Tuy nhiên, chúng gặp giới hạn về "trí nhớ" (không thể lưu trữ toàn bộ dữ liệu của một doanh nghiệp trong quá trình huấn luyện) và dễ bị ảo giác (hallucination) khi gặp kiến thức mới hoặc kiến thức nội bộ. 

**Cơ sở dữ liệu Vector (Vector Database)** ra đời và bùng nổ như một mảnh ghép then chốt để giải quyết vấn đề này. Nó đóng vai trò như một bộ nhớ dài hạn, cho phép tìm kiếm và truy xuất thông tin dựa trên ngữ nghĩa (semantic) thay vì chỉ so khớp từ khóa (keyword) như các hệ quản trị cơ sở dữ liệu truyền thống.

---

## 1. Cơ sở dữ liệu Vector là gì?



Cơ sở dữ liệu Vector (hay Vector Store) là một hệ thống quản trị cơ sở dữ liệu được thiết kế chuyên dụng để lưu trữ, quản lý và thực hiện thao tác tìm kiếm trên dữ liệu dưới dạng **vector nhiều chiều (high-dimensional vectors)**.

Thay vì biểu diễn một dòng dữ liệu dưới dạng các cột (columns) chứa chuỗi, số hoặc ngày tháng, Vector Database sử dụng mảng số thực đại diện cho **đặc trưng (features)** hoặc **ngữ nghĩa (semantics)** của một đối tượng. Các đối tượng này có thể là văn bản, hình ảnh, âm thanh, video hoặc thông tin người dùng. Quá trình biến đổi đối tượng phi cấu trúc thành mảng số thực được gọi là **Embedding**.

Khi đó, việc tìm kiếm thông tin trở thành **Tìm kiếm sự tương đồng (Similarity Search)**: Hệ thống sẽ tìm các vector trong cơ sở dữ liệu có khoảng cách gần nhất với vector của câu truy vấn trong không gian đa chiều.

---

## 2. Tại sao Cơ sở dữ liệu truyền thống không đủ?

Các cơ sở dữ liệu quan hệ (RDBMS) hay NoSQL truyền thống tối ưu cho các truy vấn chính xác (exact match) như `WHERE id = 123` hoặc tìm kiếm toàn văn bản (Full-text search) như Elasticsearch dựa trên đối sánh từ khóa (TF-IDF, BM25).

Tuy nhiên, Full-text search sẽ gặp khó khăn khi:
- **Người dùng tìm kiếm bằng từ đồng nghĩa:** Tìm "chiếc xe rẻ nhất" nhưng dữ liệu chỉ có "ô tô giá bình dân".
- **Truy vấn bằng ngôn ngữ tự nhiên phức tạp:** Các hệ thống từ khóa không hiểu được ngữ cảnh hoặc sắc thái ý nghĩa của cả câu.
- **Dữ liệu đa phương tiện (Multimodal):** Không thể dùng RDBMS để tìm một hình ảnh "có con chó đang chạy trên bãi cỏ".

Vector Database hiểu được **ngữ nghĩa** của dữ liệu. Hai câu "Tôi yêu chó" và "Tôi rất thích cún con" tuy khác nhau về mặt ký tự, nhưng vector embedding của chúng trong không gian sẽ nằm rất sát nhau.

---

## 3. Các thành phần và khái niệm cốt lõi

### 3.1. Vector Embeddings
Embedding là kỹ thuật Machine Learning sử dụng một mô hình (ví dụ: mô hình ngôn ngữ BERT, OpenAI `text-embedding-3-small`) để mã hóa một dữ liệu (từ, câu, hình ảnh) thành một vector (mảng số). 
- Kích thước của mảng được gọi là số chiều (dimensions). Ví dụ, OpenAI embedding tạo ra các vector 1536 chiều.
- Mỗi chiều đại diện cho một thuộc tính hoặc đặc trưng tiềm ẩn nào đó mà mô hình học được, không gian này đủ lớn để mã hóa ngữ nghĩa và ngữ pháp.

### 3.2. Độ đo khoảng cách (Similarity Metrics)
Để biết hai vector có "giống nhau" hay không, Vector Database tính toán khoảng cách không gian giữa chúng thông qua các hàm toán học:
- **Cosine Similarity:** Đo lường góc giữa hai vector (từ -1 đến 1). Góc càng nhỏ, độ tương đồng càng cao. Được sử dụng cực kỳ phổ biến cho văn bản (NLP).
- **Euclidean Distance (L2 Norm):** Đo khoảng cách đường thẳng giữa hai điểm. Sử dụng khi độ lớn của vector có ý nghĩa (ví dụ: dữ liệu hình ảnh, khuyến nghị sản phẩm).
- **Dot Product (Tích vô hướng):** Tương tự Cosine nhưng tính toán nhanh hơn rất nhiều về mặt phần cứng nếu các vector đã được chuẩn hóa (normalized) có độ dài bằng 1.

### 3.3. Thuật toán Tìm kiếm Xấp xỉ (Approximate Nearest Neighbor - ANN)
Trong một database chứa hàng tỷ vector, việc so sánh vector truy vấn với từng vector một (kNN - k-Nearest Neighbors) là điều không thể đáp ứng thời gian thực (real-time). Các hệ thống thực tế sử dụng thuật toán **ANN (Approximate Nearest Neighbor)**, đánh đổi một phần nhỏ độ chính xác (accuracy) để đạt được tốc độ tìm kiếm tính bằng mili-giây:

- **HNSW (Hierarchical Navigable Small World):** Thuật toán phổ biến và hiệu quả nhất hiện nay. HNSW tạo ra một đồ thị (graph) nhiều tầng. Quá trình tìm kiếm bắt đầu ở tầng trên cùng (chứa rất ít điểm, bước nhảy xa) và đi dần xuống các tầng thấp hơn để tinh chỉnh vị trí, tương tự như việc thu phóng trên Google Maps.
- **IVF (Inverted File Index):** Thuật toán chia toàn bộ không gian vector thành các cụm (Voronoi cells). Khi truy vấn, hệ thống chỉ so sánh vector truy vấn với tâm của các cụm (centroids) và chỉ tìm kiếm chi tiết bên trong vài cụm gần nhất.
- **PQ (Product Quantization):** Thuật toán nén vector bằng cách chia nhỏ vector và thay thế bằng các centroid từ một bộ từ điển (codebook), giúp giảm lượng RAM tiêu thụ gấp hàng chục lần. Thuật toán này thường được kết hợp với IVF thành IVF-PQ.

---

## 4. Phân loại Vector Database trên thị trường

Sự bùng nổ của AI đã tạo ra một thị trường đa dạng với nhiều giải pháp lưu trữ Vector:

### 4.1. Cơ sở dữ liệu Vector chuyên dụng (Purpose-built / Native Vector DBs)
Xây dựng từ đầu với tư duy vector-first, cung cấp khả năng lưu trữ hàng tỷ bản ghi, chạy phân tán (distributed) và tốc độ siêu tốc:
- **Milvus:** Hệ thống mã nguồn mở cực kỳ mạnh mẽ, kiến trúc cloud-native phù hợp với dữ liệu khổng lồ.
- **Pinecone:** Dịch vụ Managed SaaS, nổi tiếng vì tính dễ sử dụng, bảo trì bằng 0 và được thiết kế đặc biệt cho ứng dụng AI.
- **Qdrant:** Viết bằng Rust, hiệu năng vô cùng ấn tượng. Điểm mạnh là khả năng lọc metadata ngay trong quá trình duyệt đồ thị (single-stage filtering) rất xuất sắc.
- **Weaviate:** Cung cấp sẵn cơ chế tích hợp với nhiều model embeddings và API dạng GraphQL.
- **Chroma:** Dễ dàng chạy dưới dạng thư viện nhúng (embedded), thường được sử dụng cho các dự án phát triển và học tập.

### 4.2. Cơ sở dữ liệu Vector tích hợp (Vector-capable Databases)
Nhiều hệ quản trị cơ sở dữ liệu truyền thống cũng đã bổ sung tính năng Vector để giữ chân người dùng. Lựa chọn này giúp doanh nghiệp giảm thiểu độ phức tạp hạ tầng khi không phải thêm một database mới:
- **pgvector (PostgreSQL):** Một extension (phần mở rộng) cho phép Postgres lưu trữ kiểu `vector` và tạo index HNSW hoặc IVFFlat. Cực kỳ phổ biến và đủ dùng cho hầu hết ứng dụng thực tế vừa và nhỏ.
- **Elasticsearch / OpenSearch:** Bổ sung kiểu dữ liệu dense vector cùng với thuật toán kNN.
- **Redis (RediSearch):** Cung cấp lưu trữ vector trực tiếp trên bộ nhớ RAM, phù hợp cho các hệ thống yêu cầu độ trễ (latency) cực thấp.

### 4.3. Các định dạng tệp và công nghệ lưu trữ mới
- **LanceDB & Định dạng Lance:** Khác với Parquet chuyên dùng cho phân tích OLAP, định dạng mã nguồn mở Lance được thiết kế dành riêng cho dữ liệu đa phương tiện và vector. Nó nhanh hơn Parquet tới 100 lần trong truy vấn ngẫu nhiên (random access), phù hợp cho Data Lakehouse ứng dụng AI.

---

## 5. Vai trò của Vector Database trong Kiến trúc RAG

Kiến trúc **RAG (Retrieval-Augmented Generation)** là ứng dụng phổ biến nhất của Vector Database. RAG kết hợp mô hình LLM với dữ liệu "sống" của doanh nghiệp.

Quy trình RAG tiêu chuẩn bao gồm:
1. **Data Ingestion (Nhập liệu):** Các tài liệu nội bộ (PDF, Word, Wiki) được chia nhỏ thành các đoạn (chunks), đưa qua mô hình Embedding để tạo vector, và lưu vào Vector Database kèm theo metadata (tiêu đề, thời gian, tác giả).
2. **Retrieval (Truy xuất):** Câu hỏi của người dùng được chuyển đổi thành vector. Hệ thống thực hiện tìm kiếm ANN trong Vector DB để lấy ra Top-K tài liệu gần nghĩa nhất với câu hỏi.
3. **Generation (Sinh phản hồi):** Nội dung từ Top-K tài liệu được ghép nối làm "ngữ cảnh" (context) và truyền vào LLM (thường qua các khung như LangChain hoặc LlamaIndex). LLM dựa vào ngữ cảnh chính xác đó để tạo ra câu trả lời, thay vì phải tự "bịa" ra từ trọng số mô hình.

---

## 6. Tính năng nâng cao: Metadata Filtering và Hybrid Search

- **Metadata Filtering:** Sức mạnh của một hệ thống thực tế nằm ở chỗ có thể lọc kết quả theo dữ liệu có cấu trúc. Ví dụ: *"Tìm các laptop tương tự tính năng của Macbook M3 (Vector Search), nhưng thương hiệu là 'Dell' và giá < 2000$ (Metadata Filter)"*. Quá trình lọc này đòi hỏi kỹ thuật cao (như Pre-filtering hoặc In-filtering) để không bỏ sót các vector tiềm năng.
- **Hybrid Search:** Là sự kết hợp giữa tìm kiếm toàn văn bản (như BM25 - tốt cho việc tìm các từ khóa đặc thù, ID, mã sản phẩm) và Tìm kiếm Vector (tốt cho từ đồng nghĩa, ý nghĩa khái quát). Hệ thống sẽ chạy cả hai kỹ thuật song song và kết hợp thứ hạng bằng thuật toán như **RRF (Reciprocal Rank Fusion)** để cho ra kết quả tốt nhất.

---

## 7. Tổng kết

Cơ sở dữ liệu Vector không chỉ là một trào lưu nhất thời mà đã trở thành tầng hạ tầng dữ liệu (Data Infrastructure) thiết yếu của kỷ nguyên AI. 

Trong tương lai, các giải pháp Vector Store sẽ tiếp tục tối ưu hóa việc lưu trữ trên đĩa cứng (Disk-based ANN) để giảm chi phí RAM đắt đỏ, đồng thời tăng cường khả năng hoạt động trực tiếp trên Data Lake (như sự xuất hiện của Lance Format) để tránh việc phải sao chép dữ liệu liên tục giữa các hệ thống. Việc lựa chọn một hệ thống Vector chuyên dụng hay dùng tính năng Vector của hệ thống có sẵn (như pgvector) sẽ phụ thuộc hoàn toàn vào quy mô (Scale), độ trễ (Latency) mong muốn và độ phức tạp kiến trúc của dự án.

## Tài Liệu Tham Khảo
* [HNSW (Hierarchical Navigable Small World) Algorithm Research Paper](https://arxiv.org/abs/1610.02415)
* [pgvector - Open-source vector similarity search for Postgres](https://github.com/pgvector/pgvector)
* [Lance Format & LanceDB](https://lancedb.github.io/lancedb/)
* [Vector Databases (Milvus, Pinecone, Qdrant)](https://milvus.io/)
* [LangChain Vector Store Documentation](https://python.langchain.com/docs/modules/data_connection/vectorstores/)
