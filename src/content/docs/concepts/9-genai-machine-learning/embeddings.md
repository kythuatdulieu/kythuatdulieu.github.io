---
title: "Vectơ nhúng - Embeddings"
difficulty: "Beginner"
tags: ["embeddings", "vector-space", "nlp", "representation-learning", "rag", "vector-database"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Vectơ nhúng (Embeddings) là gì? Khái niệm, cơ chế và ứng dụng trong AI"
metaDescription: "Tìm hiểu Vectơ nhúng (Embeddings) là gì trong AI, tính chất toán học của chúng, các mô hình phổ biến và vai trò cốt lõi trong Tìm kiếm ngữ nghĩa và RAG."
description: "Hãy tưởng tượng bạn đang cố gắng giải thích cho một người nước ngoài không biết tiếng Việt hiểu thế nào là 'xe hơi'. Thay vì cố gắng định nghĩa bằng các từ ngữ phức tạp, bạn đánh giá nó dựa trên một loạt các tiêu chí..."
---



Hãy tưởng tượng bạn đang cố gắng giải thích ý nghĩa của từ "xe hơi" cho một người (hoặc một cỗ máy) không có khái niệm về ngôn ngữ con người. Thay vì dùng các từ ngữ khác để định nghĩa, bạn có thể đánh giá "xe hơi" trên một loạt các thang điểm: số bánh xe (4), có động cơ không (1 - có), dùng để chở người không (0.9 - rất đúng), có biết bay không (0 - không)... Bằng cách gán cho mỗi khái niệm một loạt các con số như vậy, bạn đang tạo ra một "Vectơ nhúng" (Embedding).

**Embeddings (Vectơ nhúng)** là kết quả đầu ra của một Embedding Model (Mô hình nhúng). Về mặt kỹ thuật, nó là một mảng (danh sách) gồm hàng trăm đến hàng ngàn con số (Ví dụ: `[0.12, -0.45, 0.89, 0.02...]`). Mỗi con số này đại diện cho một "đặc trưng ẩn" (latent feature) của dữ liệu. Điểm kỳ diệu của Embeddings là: **Các đoạn văn bản có ý nghĩa tương đồng nhau sẽ sinh ra các Vectơ nhúng nằm gần nhau trong không gian nhiều chiều.**

Trong kỷ nguyên của Trí tuệ Nhân tạo tạo sinh (Generative AI) và Xử lý ngôn ngữ tự nhiên (NLP), Embeddings chính là cầu nối cho phép máy tính "hiểu" được ngữ nghĩa và sắc thái của ngôn ngữ con người.

---

## 1. Tại sao chúng ta cần Embeddings?



Máy tính vốn dĩ chỉ hiểu các con số, chúng không hiểu ký tự chữ cái hay văn bản. Để máy tính có thể xử lý văn bản, chúng ta phải chuyển đổi văn bản thành số.

Trước khi Embeddings ra đời, các kỹ thuật cổ điển bao gồm:
*   **One-hot Encoding:** Mỗi từ trong từ điển được gán một vector với một số 1 và toàn bộ phần còn lại là số 0. Phương pháp này khiến vector trở nên khổng lồ (bằng kích thước từ vựng), cực kỳ thưa thớt (toàn số 0), và hoàn toàn không mang chút ý nghĩa liên kết nào (từ "chó" và "mèo" hoàn toàn độc lập và cách xa nhau như từ "chó" và "máy bay").
*   **Bag-of-Words (BoW) & TF-IDF:** Đếm tần suất xuất hiện của từ. Tốt hơn One-hot nhưng vẫn gặp vấn đề "Curse of Dimensionality" (chiều dữ liệu quá lớn) và **không nắm bắt được ngữ nghĩa** hoặc thứ tự của từ. Đồng nghĩa và trái nghĩa không được phân biệt tốt.

**Sự ra đời của Embeddings giải quyết triệt để vấn đề trên:**
1.  **Mật độ cao (Dense):** Thay vì vector hàng triệu chiều toàn số 0, Embeddings nén thông tin vào vector có số chiều cố định, nhỏ gọn (ví dụ: 384, 768, hay 1536 chiều) nhưng toàn các số thập phân có nghĩa.
2.  **Lưu giữ ngữ nghĩa (Semantic Understanding):** Các mô hình học cách sắp xếp các từ có nghĩa giống nhau hoặc liên quan ở gần nhau trong không gian vector.

## 2. Đặc điểm toán học và Không gian Vector (Vector Space)

### Số chiều (Dimensionality)
Mỗi chiều trong không gian nhúng biểu diễn một đặc tính nào đó của dữ liệu (mặc dù các đặc tính này thường trừu tượng và con người khó có thể chỉ mặt gọi tên từng chiều một).
*   Ví dụ: Mô hình `text-embedding-3-small` của OpenAI xuất ra các vectơ có 1536 chiều. Các mô hình mã nguồn mở như `all-MiniLM-L6-v2` tạo ra vectơ 384 chiều.

### Tính toán khoảng cách (Độ tương đồng)
Khi mọi đoạn văn bản đều biến thành các tọa độ điểm trong không gian n-chiều, việc so sánh mức độ "giống nhau" về ý nghĩa trở thành một bài toán hình học cơ bản. Các phép đo phổ biến nhất bao gồm:

1.  **Cosine Similarity (Độ tương đồng Cosine):** Đo góc giữa hai vector. Góc càng nhỏ (Cosine tiến gần đến 1), ý nghĩa của hai văn bản càng giống nhau. Đây là phương pháp phổ biến nhất trong NLP vì nó quan tâm đến "hướng" của vector (ngữ nghĩa) chứ không bị ảnh hưởng quá nhiều bởi độ dài vector (số lượng từ trong văn bản).
2.  **Dot Product (Tích vô hướng):** Liên quan chặt chẽ đến Cosine Similarity nhưng có xét cả độ lớn của vector. Nếu các vector đã được chuẩn hóa (normalized length = 1), Dot Product và Cosine Similarity sẽ cho kết quả giống nhau.
3.  **Euclidean Distance (Khoảng cách L2):** Khoảng cách đường thẳng nối giữa hai điểm trong không gian.

### Toán học ý nghĩa (Semantic Arithmetic)
Một hiện tượng nổi tiếng và thú vị nhất của Word Embeddings (đặc biệt là mô hình Word2Vec) là nó bảo toàn được các mối quan hệ logic thông qua phép cộng trừ vector:

> `Vectơ(Vua) - Vectơ(Đàn ông) + Vectơ(Phụ nữ) ≈ Vectơ(Nữ hoàng)`

Hoặc:
> `Vectơ(Paris) - Vectơ(Pháp) + Vectơ(Việt Nam) ≈ Vectơ(Hà Nội)`

Máy tính không hề biết "Vua" hay "Nữ hoàng" là gì, nhưng nó học được các mẫu xuất hiện từ trong hàng tỷ tài liệu và suy diễn được mối quan hệ về mặt khái niệm (như Giới tính, Thủ đô...).

---

## 3. Quá trình phát triển của các Mô hình Embeddings

Công nghệ nhúng văn bản đã trải qua nhiều thế hệ với những bước tiến vượt bậc:

### Thế hệ 1: Word Embeddings (Nhúng từ ngữ)
*   **Word2Vec (2013):** Do Google phát triển. Dựa trên ý tưởng đơn giản: "Một từ được đặc trưng bởi các từ xung quanh nó". Mô hình dự đoán từ mục tiêu dựa trên ngữ cảnh xung quanh (CBOW) hoặc dự đoán ngữ cảnh dựa trên từ mục tiêu (Skip-gram).
*   **GloVe (2014):** Của đại học Stanford. Dựa trên ma trận đồng xuất hiện (co-occurrence matrix) của các từ trên toàn bộ kho ngữ liệu lớn.
*   **FastText (2016):** Do Facebook (Meta) tạo ra. Cải tiến Word2Vec bằng cách băm từ thành các cụm n-gram chữ cái (ví dụ từ "apple" thành "app", "ppl", "ple"), giúp xử lý được các từ chưa từng gặp (Out-of-vocabulary) và các lỗi chính tả.

*Nhược điểm của Thế hệ 1:* Mỗi từ chỉ có một vectơ duy nhất độc lập với văn cảnh. Ví dụ: từ "Đường" trong "ăn đường" và "đường đi" có chung 1 tọa độ vector, dẫn tới sai lệch ý nghĩa.

### Thế hệ 2: Contextual Embeddings (Nhúng ngữ cảnh)
*   **ELMo & BERT (2018):** Đánh dấu kỷ nguyên mới với kiến trúc Transformer. Thay vì tra bảng từ điển cố định, vector của một từ được tính toán động dựa trên *toàn bộ câu chứa nó*. "Đường" trong "đường đi" lúc này sẽ có vector hoàn toàn khác biệt so với "đường" trong "ăn đường".

### Thế hệ 3: Sentence / Document Embeddings & LLMs
*   **Sentence-BERT (SBERT):** Tinh chỉnh kiến trúc BERT để tạo ra vectơ chung cho cả một câu hoặc đoạn văn dài, tối ưu đặc biệt cho việc tìm kiếm và so sánh.
*   **Các mô hình Commercial & Open-source hiện đại (OpenAI, Cohere, Nomic, BGE):** Có khả năng nén hàng ngàn từ (tài liệu lớn) thành một vector duy nhất mà vẫn giữ được sự tinh túy của nội dung.
*   **Multi-modal Embeddings (CLIP, ImageBind):** Không chỉ nhúng văn bản, các mô hình này nhúng cả văn bản, hình ảnh, âm thanh, video vào *cùng một không gian vector*. Từ đó bạn có thể dùng câu văn "Một chú chó trên bãi biển" để tìm kiếm chính xác bức ảnh tương ứng mà không cần phải gắn thẻ (tag) bằng chữ cho bức ảnh đó.

---

## 4. Ứng dụng thực tiễn của Embeddings

Vì khả năng biểu diễn toán học hóa ngữ nghĩa, Embeddings đóng vai trò trái tim của hàng loạt hệ thống AI hiện đại:

### 1. Semantic Search (Tìm kiếm ngữ nghĩa)
Trái ngược với "Tìm kiếm từ khóa" (Lexical Search như Elasticsearch BM25) chỉ tìm kiếm các từ khớp hoàn toàn, tìm kiếm ngữ nghĩa cho phép bạn tìm thông tin ngay cả khi người dùng dùng từ đồng nghĩa hoặc câu hỏi mô tả.
*   *Ví dụ:* Truy vấn "làm sao để hủy gói cước" sẽ lập tức match với tài liệu "hướng dẫn chấm dứt hợp đồng dịch vụ" vì các vector nhúng của chúng nằm lân cận nhau.

### 2. Retrieval-Augmented Generation (RAG)
RAG là kiến trúc nền tảng cho phép cung cấp tri thức doanh nghiệp hoặc dữ liệu mới cho các Mô hình ngôn ngữ lớn (LLMs) hạn chế tình trạng "ảo giác" (hallucination). Quá trình này bao gồm:
1.  Chia nhỏ tài liệu nội bộ thành các đoạn (chunks) và nhúng (embed) chúng thành các vector, lưu vào cơ sở dữ liệu.
2.  Khi người dùng đặt câu hỏi, nhúng câu hỏi đó thành vector bằng cùng một Embedding Model.
3.  Tìm các chunk tài liệu có vector gần nhất với vector câu hỏi.
4.  Đưa các tài liệu tìm được vào làm "ngữ cảnh" cho LLM (như ChatGPT, Claude) để nó chắt lọc và trả lời.

### 3. Recommendation Systems (Hệ thống gợi ý)
Hệ thống nhúng các sản phẩm, người dùng vào chung một không gian vector (Collaborative Filtering). Các sản phẩm có thuộc tính, đặc điểm tương tự sẽ nằm gần nhau. Nếu người dùng thường xuyên xem các phim Hành động / Viễn tưởng, hệ thống sẽ đề xuất các bộ phim mới có vector lân cận vị trí sở thích của người dùng trong không gian nhúng.

### 4. Classification & Clustering (Phân loại & Gom cụm)
Vì các đoạn văn bản tương đồng nằm gần nhau, ta có thể dùng các thuật toán cơ bản như K-Means hoặc DBSCAN để gom cụm (Clustering) các phản hồi của khách hàng (review, feedback) thành các nhóm chủ đề khác nhau một cách tự động, hoặc huấn luyện các mô hình phân loại (Classification) với dữ liệu đầu vào chính là các vector embeddings thay vì text thô.

---

## 5. Lưu trữ và Tìm kiếm Vectơ: Cần đến Vector Database

Khi hệ thống của bạn có hàng triệu hoặc hàng tỷ tài liệu, việc tính toán khoảng cách từ câu truy vấn (query) đến *từng* tài liệu một trong Database là điều bất khả thi về mặt hiệu suất.

Đó là lý do **Cơ sở dữ liệu Vector (Vector Database)** ra đời. Các hệ thống như **Pinecone, Milvus, Qdrant, ChromaDB, Weaviate** hoặc **pgvector** (tiện ích mở rộng của PostgreSQL) được thiết kế đặc biệt để lưu trữ mảng vector hàng nghìn chiều và truy vấn cực nhanh thông qua các thuật toán **Approximate Nearest Neighbor (ANN)** (Tìm kiếm lân cận gần nhất xấp xỉ):

*   **HNSW (Hierarchical Navigable Small World):** Cấu trúc dữ liệu dựa trên đồ thị phân tầng nhiều lớp, tương tự như danh bạ với các cấp độ chi tiết tăng dần. HNSW giúp việc di chuyển và tìm kiếm các điểm lân cận đạt tốc độ vài mili-giây với độ chính xác cao.
*   **IVF (Inverted File Index):** Gom cụm dữ liệu không gian thành các vùng (Voronoi cells). Khi truy vấn, hệ thống chỉ cần tìm trong một hoặc một vài cụm tiềm năng nhất thay vì quét toàn bộ dữ liệu.

---

## Tổng kết

Embeddings đã làm một cuộc cách mạng trong cách máy tính xử lý dữ liệu phi cấu trúc. Chúng tạo ra một "ngôn ngữ chung" bằng toán học — một không gian n-chiều nơi mọi khái niệm, đối tượng, hình ảnh, văn bản đều có thể được ánh xạ, lập chỉ mục và so sánh độ tương đồng. Nắm vững khái niệm Embeddings là bước nền tảng vững chắc để bạn bước sâu hơn vào thế giới của Search Engines hiện đại, Hệ thống Gợi ý (Recommender Systems) và các kiến trúc Trí tuệ nhân tạo tạo sinh tiên tiến nhất.

## Tài Liệu Tham Khảo Thêm
* [Word2Vec Tutorial - The Skip-Gram Model (Chris McCormick)](https://mccormickml.com/2016/04/19/word2vec-tutorial-the-skip-gram-model/)
* [The Illustrated Word2vec (Jay Alammar)](https://jalammar.github.io/illustrated-word2vec/)
* [Sentence-Transformers Documentation](https://www.sbert.net/)
* [OpenAI Embeddings API Guide](https://platform.openai.com/docs/guides/embeddings)
* [What is a Vector Database? - Pinecone Learning Center](https://www.pinecone.io/learn/vector-database/)
