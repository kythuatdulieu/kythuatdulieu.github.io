---
title: "Các mô hình nhúng - Embedding Models"
difficulty: "Intermediate"
tags: ["embedding-models", "nlp", "vector", "deep-learning", "representation"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Embedding Models - Tổng quan về các mô hình nhúng trong AI"
metaDescription: "Tìm hiểu các mô hình nhúng (Embedding Models), kiến trúc, cách phân loại và ứng dụng trong tìm kiếm ngữ nghĩa, GenAI và xử lý ngôn ngữ tự nhiên."
description: "Máy tính là một cỗ máy xử lý số học thuần túy. Nó không thể trực tiếp đọc hiểu các văn bản, ngắm nhìn các bức ảnh hay lắng nghe các file âm thanh theo..."
---



Máy tính là một cỗ máy xử lý số học thuần túy. Nó không thể trực tiếp đọc hiểu các văn bản, ngắm nhìn các bức ảnh hay lắng nghe các file âm thanh theo cách của con người. Để máy tính có thể "hiểu" và xử lý được thế giới tự nhiên, chúng ta cần một cơ chế chuyển đổi thông tin (văn bản, hình ảnh, âm thanh) thành các con số. Đây chính là nhiệm vụ của **Embedding Models** (Các mô hình nhúng).

Embedding Models là cầu nối giữa ngôn ngữ tự nhiên (hoặc dữ liệu phi cấu trúc) và tính toán máy tính. Bằng cách mã hóa ngữ nghĩa thành tọa độ không gian (Vectors - Vector), các mô hình này cho phép máy tính hiểu được rằng từ "Chó" và "Cún" tuy viết khác nhau nhưng nằm rất gần nhau trong không gian ngữ nghĩa.

## 1. Embedding (Vector nhúng) là gì?



**Embedding** là một biểu diễn toán học của dữ liệu dưới dạng một mảng (hay vector) các số thực. Trong Machine Learning và NLP (Xử lý Ngôn ngữ Tự nhiên), vector nhúng chứa đựng ý nghĩa, ngữ cảnh hoặc đặc điểm của đối tượng được nhúng (có thể là một từ, một câu, một đoạn văn, một hình ảnh hoặc một sản phẩm).

Ví dụ, một mô hình có thể biểu diễn từ "Vua" (King) bằng một vector có 3 chiều: `[0.89, 0.12, -0.45]`. Trong thực tế, các mô hình nhúng hiện đại thường sử dụng các vector có từ 384 đến 4096 chiều (dimensions) để nắm bắt được những sắc thái ý nghĩa phức tạp.

Đặc điểm quan trọng nhất của Embedding là **tính không gian**: những khái niệm có ý nghĩa tương tự nhau sẽ được biểu diễn bởi các vector nằm gần nhau trong không gian vector.

## 2. Tại sao chúng ta cần Embedding Models?

Trước khi Embedding ra đời, các kỹ sư thường biểu diễn văn bản bằng các phương pháp như **One-Hot Encoding**, **Bag-of-Words (BoW)** hoặc **TF-IDF**. Tuy nhiên, các phương pháp này có nhiều hạn chế nghiêm trọng:

*   **Tính thưa thớt (Sparsity) và chiều không gian lớn:** Với One-hot encoding, một kho từ vựng 100,000 từ sẽ tạo ra vector có độ dài 100,000, trong đó chỉ có một số 1 và 99,999 số 0. Điều này làm lãng phí cực lớn bộ nhớ và khả năng tính toán.
*   **Không nắm bắt được ngữ nghĩa:** Các phương pháp cũ coi mỗi từ là một thực thể độc lập. Vector của từ "Mèo" và "Chó" sẽ cách xa nhau hoàn toàn bằng khoảng cách giữa "Mèo" và "Cái bàn". Máy tính không thể biết rằng Mèo và Chó đều là động vật.
*   **Thiếu ngữ cảnh (Context):** Từ "Ngân hàng" (Bank) trong "Ngân hàng Nhà nước" và "Bờ sông" (River bank) sẽ bị đánh đồng nếu không có mô hình học ngữ cảnh.

**Embedding Models (Dense Vectors)** giải quyết triệt để các vấn đề này:
*   Mã hóa dữ liệu vào các vector đặc (Dense vector) với kích thước cố định và nhỏ gọn (ví dụ: 768 chiều).
*   Nắm bắt được mối quan hệ ngữ nghĩa sâu sắc: Vector("King") - Vector("Man") + Vector("Woman") $\approx$ Vector("Queen").
*   Mô hình hiện đại (như Transformer) sinh ra vector tùy thuộc vào ngữ cảnh cụ thể của câu.

## 3. Các thế hệ và các loại Embedding Models

Lịch sử phát triển của Embedding Models đi từ việc nhúng các từ đơn lẻ đến nhúng toàn bộ ngữ cảnh và sau đó là đa phương thức (Multimodal).

### 3.1. Nhúng cấp độ từ (Word Embeddings)

Đây là những mô hình tiên phong, học cách biểu diễn từ thông qua tần suất xuất hiện cùng nhau trong văn bản.

*   **Word2Vec (2013):** Do Google phát triển, sử dụng kiến trúc mạng nơ-ron nông (CBOW hoặc Skip-gram) để dự đoán từ mục tiêu dựa trên ngữ cảnh (hoặc ngược lại).
*   **GloVe (2014):** Của Stanford, dựa trên ma trận đồng xuất hiện (co-occurrence matrix) của toàn bộ tập dữ liệu (corpus).
*   **FastText (2016):** Do Facebook phát triển, là bản nâng cấp của Word2Vec bằng cách chia từ thành các "subword" (n-grams kí tự), giúp xử lý tốt các từ hiếm hoặc viết sai chính tả.

*Nhược điểm:* Một từ chỉ có duy nhất một vector bất kể ngữ cảnh (VD: từ "đường" trong "đường đi" và "hạt đường" dùng chung 1 vector).

### 3.2. Nhúng có ngữ cảnh (Contextual Embeddings)

Sự ra đời của kiến trúc Transformer (2017) đã thay đổi hoàn toàn cách tính toán vector nhúng.

*   **ELMo (2018) và BERT (2018):** Biểu diễn của một từ không còn cố định mà thay đổi dựa trên các từ xung quanh nó trong câu. Từ "Apple" trong "Apple is a fruit" sẽ có vector khác với "Apple" trong "Apple makes iPhones".
*   **Sentence Embeddings (Sentence-BERT, Universal Sentence Encoder):** Được tối ưu hóa để nhúng toàn bộ một câu hoặc đoạn văn thành một vector duy nhất, rất hiệu quả cho việc so sánh các câu.

### 3.3. Các mô hình Embedding hiện đại cho GenAI (LLM-based)

Trong kỷ nguyên GenAI (Generative AI) và RAG (Retrieval-Augmented Generation), các mô hình nhúng văn bản dài cực kỳ quan trọng để lưu trữ và tìm kiếm tài liệu.

*   **OpenAI Embeddings:** Các mô hình như `text-embedding-ada-002`, `text-embedding-3-small`, `text-embedding-3-large` là tiêu chuẩn công nghiệp hiện nay do dễ sử dụng qua API và chất lượng cao.
*   **Cohere Embed:** Các mô hình của Cohere (ví dụ: `embed-english-v3.0`, `embed-multilingual-v3.0`) tối ưu mạnh cho tác vụ tìm kiếm, đặc biệt hỗ trợ đa ngôn ngữ cực tốt.
*   **Open-source Models:**
    *   **BGE (BAAI General Embedding):** Mô hình mã nguồn mở đến từ BAAI, thường dẫn đầu các bảng xếp hạng (MTEB).
    *   **E5 (Embeddings from text):** Đến từ Microsoft, cực kỳ hiệu quả.
    *   **Nomic Embed:** Cung cấp context window rất lớn (ví dụ: nhúng văn bản dài lên đến 8192 tokens) và hoàn toàn mã nguồn mở.

### 3.4. Nhúng đa phương thức (Multimodal Embeddings)

Thay vì chỉ biểu diễn văn bản, các mô hình đa phương thức cho phép chiếu cả hình ảnh, âm thanh và văn bản vào **cùng một không gian vector**.

*   **CLIP (Contrastive Language-Image Pretraining):** Do OpenAI phát triển, chiếu một bức ảnh con chó và câu văn "một chú chó" vào cùng một khu vực trong không gian, cho phép tìm kiếm hình ảnh bằng văn bản.

## 4. Các phép đo khoảng cách/sự tương đồng (Similarity Metrics)

Để biết hai văn bản (hoặc hai đối tượng) có giống nhau không, máy tính cần đo khoảng cách giữa hai vector nhúng của chúng. Các công thức toán học phổ biến bao gồm:

1.  **Cosine Similarity:** Đo góc giữa hai vector. Giá trị từ -1 (hoàn toàn ngược nhau) đến 1 (hoàn toàn giống nhau). Đây là thước đo phổ biến nhất trong NLP vì nó không bị ảnh hưởng bởi độ lớn (magnitude) của vector (văn bản dài hay ngắn).
2.  **Dot Product (Tích vô hướng):** Tương tự Cosine nhưng có tính đến độ lớn của vector. Thường được dùng khi các vector đã được chuẩn hóa (normalized).
3.  **Euclidean Distance (L2 Distance):** Khoảng cách đường thẳng giữa hai điểm trong không gian. Càng nhỏ thì càng giống nhau.

## 5. Ứng dụng thực tiễn của Embedding Models

Vector Embeddings là "trái tim" của rất nhiều hệ thống AI hiện đại:

*   **Semantic Search (Tìm kiếm theo ngữ nghĩa):** Thay vì tìm theo từ khóa chính xác (lexical search), hệ thống tìm kiếm ngữ nghĩa tính khoảng cách vector. Nếu người dùng tìm "điện thoại thông minh", hệ thống có thể trả về "smartphone" hoặc "iPhone" dù từ khóa không hề khớp.
*   **RAG (Retrieval-Augmented Generation):** Trong các ứng dụng như Chatbot hỏi đáp trên tài liệu nội bộ, Embedding Models đóng vai trò chuyển tài liệu thành vector (lưu trong Vector Database) và truy xuất tài liệu liên quan nhất để cấp ngữ cảnh cho LLM.
*   **Hệ thống Gợi ý (Recommendation Systems):** Các công ty như Netflix hay Spotify tạo Embedding cho người dùng và sản phẩm (phim, bài hát). Phim gợi ý cho bạn là các "phim" có vector nằm gần nhất với vector của "bạn".
*   **Phân loại văn bản và Phân cụm (Classification & Clustering):** Gom nhóm các bài báo tin tức có nội dung tương tự nhau hoặc phân tích sắc thái cảm xúc (Sentiment analysis) của các bình luận.

## 6. Lựa chọn Embedding Model như thế nào?

Việc chọn mô hình phụ thuộc vào nhiều yếu tố:

1.  **Ngôn ngữ (Language):** Dữ liệu của bạn chủ yếu là tiếng Anh hay tiếng Việt? Nếu đa ngôn ngữ, cần chọn các mô hình Multilingual (như Cohere Multilingual, OpenAI hoặc mBGE).
2.  **Chiều dài ngữ cảnh (Context Length):** Đoạn văn bản bạn cần nhúng dài bao nhiêu? Nếu là câu ngắn, Sentence-BERT có thể đủ. Nếu là cả tài liệu dài, bạn cần các mô hình mới như Nomic (8k token) hoặc OpenAI (8k token).
3.  **Kích thước vector (Dimension size):** Vector lớn (như 3072 chiều của OpenAI text-embedding-3-large) biểu diễn tốt hơn nhưng tốn nhiều dung lượng lưu trữ trong Vector Database và chi phí tìm kiếm (compute) đắt hơn. Vector nhỏ (như 384 chiều của BGE-small) lưu trữ rẻ và suy luận cực nhanh.
4.  **Chi phí và quyền riêng tư:** Dùng API (như OpenAI, Cohere) tốn phí theo từng API call nhưng dễ tích hợp. Nếu dữ liệu nhạy cảm hoặc cần xử lý khối lượng khổng lồ, việc tự host các mô hình mã nguồn mở (như BGE, E5) là lựa chọn kinh tế hơn.

Để tham khảo bảng xếp hạng chất lượng các mô hình, bạn có thể xem **MTEB (Massive Text Embedding Benchmark) Leaderboard** trên HuggingFace - một "bảng phong thần" tiêu chuẩn được cộng đồng tin dùng.

---

## Tài Liệu Tham Khảo

*   [MTEB Leaderboard - Hugging Face](https://huggingface.co/spaces/mteb/leaderboard)
*   [What are Vector Embeddings? - Pinecone](https://www.pinecone.io/learn/vector-embeddings/)
*   [OpenAI Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings)
*   [Sentence-Transformers Documentation](https://www.sbert.net/)
*   [Illustrated Word2vec - Jay Alammar](https://jalammar.github.io/illustrated-word2vec/)
