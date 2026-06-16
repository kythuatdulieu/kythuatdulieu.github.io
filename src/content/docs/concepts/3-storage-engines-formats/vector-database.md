---
title: "Cơ sở dữ liệu Vector (Vector Database)"
difficulty: "Intermediate"
tags: ["vector-database", "genai", "embedding", "rag", "similarity-search"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Cơ sở dữ liệu Vector (Vector Database) là gì? Giải thích chi tiết"
metaDescription: "Tìm hiểu kiến trúc Cơ sở dữ liệu Vector, embeddings, thuật toán tìm kiếm tương đồng (ANN, HNSW) và ứng dụng trong xây dựng hệ thống RAG cho GenAI."
description: "Hãy tưởng tượng bạn đang tìm kiếm thông tin trong thư viện. Thay vì đi tìm cuốn sách chứa chính xác từ khóa 'chó con', bạn mong muốn thủ thư hiểu được ý nghĩa và mang về các tài liệu liên quan đến 'thú cưng', 'chó sói' hay 'cách chăm sóc chó'. Đó chính là sức mạnh của Vector Database."
---



Vector Database (như Pinecone, Milvus, Qdrant) chuyên lưu trữ dữ liệu dưới dạng các mảng số thực nhiều chiều (được gọi là Vector Embeddings). Khác với cơ sở dữ liệu quan hệ (Relational DB) truy vấn dựa trên từ khóa chính xác (exact match), Vector Database sử dụng các thuật toán **ANN (Approximate Nearest Neighbor)** để tìm kiếm sự tương đồng về mặt ý nghĩa (Semantic Search). Chúng chính là xương sống của các ứng dụng Generative AI, RAG (Retrieval-Augmented Generation) và Recommendation Systems hiện đại.

---

## 1. Vector Embedding là gì?



Thế giới thực chứa đầy dữ liệu phi cấu trúc (Unstructured Data): văn bản, hình ảnh, âm thanh, video. Máy tính không thể trực tiếp hiểu được ý nghĩa của một bức ảnh hay một câu nói. Để máy tính có thể xử lý, chúng ta cần chuyển đổi các dữ liệu này thành số.

**Vector Embedding** là quá trình chuyển đổi dữ liệu (từ, câu, hình ảnh, v.v.) thành một mảng các số thực (ví dụ: `[0.12, -0.45, 0.89, ...]`). Các mô hình học máy (như OpenAI's `text-embedding-ada-002`, BERT, hay ResNet cho hình ảnh) chịu trách nhiệm tạo ra các embeddings này. 

Điều kỳ diệu của Vector Embedding là **các đối tượng có ý nghĩa tương đồng sẽ nằm gần nhau trong không gian vector nhiều chiều**. Ví dụ, vector của từ "Vua" và "Hoàng Hậu" sẽ gần nhau hơn nhiều so với vector của từ "Quả táo".

## 2. Tại sao chúng ta cần Vector Database?

Một câu hỏi thường gặp là: *"Tại sao không lưu các mảng số này vào một mảng NumPy hoặc bảng PostgreSQL thông thường?"*

Câu trả lời nằm ở **quy mô (Scale)** và **tốc độ (Speed)**:
1. **Khối lượng dữ liệu khổng lồ**: Trong thực tế, bạn có thể có hàng tỷ vectors, mỗi vector có hàng ngàn chiều (ví dụ: mô hình OpenAI thường trả về vector 1536 chiều). Lưu trữ trên bộ nhớ RAM (như NumPy) là không khả thi.
2. **Tìm kiếm tốn kém**: Nếu dùng phương pháp quét toàn bộ (Brute-force) để so sánh vector truy vấn với từng vector trong cơ sở dữ liệu để tìm ra vector giống nhất (K-Nearest Neighbors - KNN), thời gian xử lý sẽ tăng tuyến tính (O(N)). Với hàng tỷ records, điều này sẽ mất nhiều giây đến vài phút cho mỗi truy vấn, không đáp ứng được yêu cầu thời gian thực.

Vector Database ra đời cung cấp:
- **Index chuyên dụng (Vector Indexing)**: Cho phép tìm kiếm xấp xỉ (Approximate Nearest Neighbor - ANN) cực nhanh (độ trễ tính bằng mili-giây) trên tập dữ liệu khổng lồ.
- **Tính năng của một Database thực thụ**: Hỗ trợ CRUD (Create, Read, Update, Delete), Metadata filtering (lọc theo các thuộc tính thông thường trước/sau khi tìm kiếm vector), High Availability, và Scalability.

## 3. Các Phép Đo Khoảng Cách (Distance Metrics)

Làm sao để biết hai vector "gần" hay "xa" nhau? Vector Database sử dụng các hàm toán học để tính khoảng cách:

* **Cosine Similarity**: Đo góc giữa hai vector. Không quan tâm đến độ lớn (magnitude) của vector, chỉ quan tâm đến hướng. Giá trị từ -1 (hoàn toàn trái ngược) đến 1 (hoàn toàn trùng hướng). Thường dùng cho xử lý ngôn ngữ tự nhiên (NLP).
* **Euclidean Distance (L2)**: Đo khoảng cách đường thẳng nối giữa hai điểm trong không gian. Thường dùng khi cả hướng và độ lớn của vector đều có ý nghĩa (ví dụ: dữ liệu hình ảnh hoặc chuỗi thời gian).
* **Dot Product (Tích vô hướng)**: Phép nhân hai vector với nhau. Nếu các vector đã được chuẩn hóa (normalized) về độ dài 1, Dot Product tương đương với Cosine Similarity. Thường tính toán nhanh nhất và được nhiều mô hình Machine Learning ưa chuộng.

## 4. Thuật toán Indexing (Tìm kiếm Vector)

Đây là "trái tim" làm nên tốc độ của Vector Database. Thay vì so sánh tất cả (KNN), nó sử dụng thuật toán xấp xỉ (ANN) đánh đổi một chút độ chính xác (Accuracy) lấy tốc độ (Latency).

### Hierarchical Navigable Small World (HNSW)
HNSW là thuật toán state-of-the-art hiện nay, được sử dụng trong hầu hết các Vector DB. Nó dựa trên cấu trúc đồ thị nhiều tầng (multi-layer graph).
- **Cách hoạt động**: Tầng trên cùng có rất ít điểm (nhảy vọt xa). Khi tìm kiếm, nó bắt đầu từ tầng trên cùng, tìm điểm gần nhất, rồi nhảy xuống tầng dưới (nhiều điểm hơn), tiếp tục tinh chỉnh cho đến khi xuống tầng đáy (chứa toàn bộ dữ liệu).
- **Ưu điểm**: Tốc độ tìm kiếm siêu nhanh, độ chính xác rất cao.
- **Nhược điểm**: Tốn bộ nhớ RAM để lưu trữ cấu trúc đồ thị và thời gian build index lâu.

### Inverted File Index (IVF) / IVFFlat
Tương tự như cách chia một thành phố thành các quận. Thuật toán sẽ dùng K-means clustering để nhóm các vector gần nhau vào các cụm (Voronoi cells).
- **Cách hoạt động**: Khi có query vector, nó chỉ cần xác định cụm nào gần query nhất, rồi tìm kiếm bên trong (các) cụm đó thay vì quét toàn bộ database.
- **Ưu điểm**: Tiết kiệm bộ nhớ hơn HNSW, tìm kiếm khá nhanh.
- **Nhược điểm**: Phải xác định số lượng cụm (hyperparameter tuning), dễ bị ảnh hưởng bởi dữ liệu phân bố không đều. Có thể bỏ sót kết quả nếu điểm gần nhất nằm ở cụm bên cạnh (thường giải quyết bằng cách tìm trong `nprobe` cụm gần nhất).

### Product Quantization (PQ)
Đây là kỹ thuật nén dữ liệu. Vector 1536 chiều tốn rất nhiều không gian. PQ chia nhỏ vector thành nhiều phần (ví dụ: 8 phần), mỗi phần thay thế bằng một ID của cụm gần nhất.
- **Ưu điểm**: Nén dữ liệu cực kỳ mạnh mẽ, giúp fit các tập dữ liệu khổng lồ vào RAM.
- **Nhược điểm**: Làm giảm độ chính xác của kết quả tìm kiếm khá nhiều. Thường kết hợp với IVF (IVF-PQ) hoặc HNSW (HNSW-PQ) để tối ưu cả bộ nhớ và tốc độ.

## 5. Metadata Filtering

Một tính năng cực kỳ quan trọng trong thực tế. Giả sử bạn tìm kiếm chiếc áo "màu đỏ, giống với hình ảnh này" nhưng "giá dưới $50" và "kích cỡ M". 

Việc so sánh vector chỉ giải quyết được phần "giống với hình ảnh này". Các yêu cầu còn lại là Metadata. Vector DB hiện đại cho phép kết hợp tìm kiếm vector với lọc theo các trường thông tin (giống SQL). Có hai hướng tiếp cận chính:
- **Pre-filtering**: Lọc Metadata trước (chỉ giữ áo <$50 và size M), sau đó mới tìm KNN trong số các áo còn lại. Vấn đề: Có thể làm hỏng cấu trúc HNSW graph nếu số lượng item bị lọc đi quá nhiều.
- **Post-filtering**: Tìm 100 áo giống nhất bằng Vector search trước, sau đó mới lọc Metadata. Vấn đề: Nếu cả 100 áo đều >$50, trả về kết quả rỗng (dù trong DB vẫn còn áo phù hợp).

Các Vector Database tiên tiến hiện nay (như Qdrant, Milvus) đã phát triển kỹ thuật **Single-stage filtering** kết hợp cả hai quá trình trực tiếp trong lúc duyệt graph HNSW để khắc phục các nhược điểm trên.

## 6. Ứng dụng phổ biến

1. **Retrieval-Augmented Generation (RAG)**: Đưa trí nhớ ngắn hạn/dữ liệu doanh nghiệp cho các LLM (như ChatGPT). Các tài liệu nội bộ được cắt nhỏ, biến thành vector và lưu vào Vector DB. Khi user hỏi, hệ thống search tài liệu liên quan nhất đưa cho LLM để tạo câu trả lời chính xác, tránh ảo giác (hallucination).
2. **Semantic Search**: Thay thế cho tìm kiếm bằng từ khóa truyền thống (Elasticsearch, Solr). Cho phép tìm bằng câu hỏi tự nhiên.
3. **Recommendation Engines**: Gợi ý phim, bài hát, sản phẩm. Vectorize lịch sử mua hàng/xem phim của user và các item để tìm ra độ tương đồng.
4. **Image & Video Retrieval**: Tìm kiếm hình ảnh bằng hình ảnh, hoặc tìm kiếm đoạn video chứa nội dung miêu tả qua văn bản.
5. **Anomaly Detection**: Phát hiện giao dịch gian lận, lỗi hệ thống mạng thông qua việc xác định các vector nằm quá xa các cụm dữ liệu bình thường.

## 7. Các Vector Database Phổ Biến

* **Pinecone**: Dịch vụ Managed, Cloud-native, hoàn toàn serverless. Cực kỳ dễ sử dụng, phù hợp cho các dự án muốn setup nhanh gọn. (Close-source)
* **Milvus**: Open-source, kiến trúc phân tán (distributed) cực mạnh mẽ. Sinh ra để xử lý quy mô hàng tỷ vectors. Phức tạp trong việc setup và vận hành.
* **Qdrant**: Viết bằng Rust, open-source. Tối ưu hóa cực tốt cho Metadata Filtering, cung cấp cả local mode và cloud. Hiện đang rất được ưa chuộng nhờ hiệu năng và tính linh hoạt.
* **Weaviate**: Open-source, tập trung mạnh vào Semantic Search. Hỗ trợ tự động kết nối với các provider như OpenAI/HuggingFace để biến text thành vector (Data đi vào là text, Weaviate tự gọi API để lưu Vector).
* **Chroma**: Vector DB rất thân thiện cho developer, thường được sử dụng làm local storage cho các dự án LLM nhỏ/nháp (thường dùng chung với LangChain, LlamaIndex).
* **pgvector**: Một extension của PostgreSQL. Rất hoàn hảo nếu ứng dụng của bạn đang dùng sẵn Postgres và dữ liệu vector không quá khổng lồ (dưới vài triệu records), giúp giảm thiểu số lượng công cụ trong hệ thống.

---

## Tài Liệu Tham Khảo
* [What is a Vector Database? (Pinecone)](https://www.pinecone.io/learn/vector-database/)
* **Comprehensive Guide to Approximate Nearest Neighbors Algorithms (HNSW, IVF, PQ)**
* **Vector Databases vs. Relational Databases**
* [Qdrant Documentation: Filtering and Indexing](https://qdrant.tech/documentation/)
* [PostgreSQL pgvector extension](https://github.com/pgvector/pgvector)
