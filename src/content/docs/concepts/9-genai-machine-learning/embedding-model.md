---
title: "Mô hình nhúng - Embedding Model"
difficulty: "Advanced"
tags: ["embedding-model", "neural-network", "contrastive-learning", "nlp"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Cấu trúc và cách huấn luyện Embedding Model (Mô hình nhúng)"
metaDescription: "Đi sâu vào kiến trúc bên trong của một Embedding Model, phương pháp học đối chiếu (Contrastive Learning) và các kiến trúc như Bi-Encoder, Cross-Encoder."
description: "Khi làm việc với các hệ thống Trí tuệ Nhân tạo hiện đại, đặc biệt là các ứng dụng [RAG](/concepts/genai-ml/rag/) (Retrieval-Augmented Generation) hay Semantic Search, Embedding Model đóng vai trò cốt lõi trong việc biểu diễn ngôn ngữ."
---



Embedding Model là một mạng Neural Network (Mạng nơ-ron nhân tạo) đặc biệt có nhiệm vụ chuyển hóa dữ liệu phi cấu trúc như văn bản (Từ, Câu, Đoạn văn), hình ảnh, hay âm thanh thành các Vector số thực (một dãy số n-chiều). Các mô hình phổ biến bao gồm OpenAI `text-embedding-ada-002`, `text-embedding-3-large`, BAAI/bge, hay Cohere Embed, đóng vai trò sống còn trong Semantic Search (Tìm kiếm ngữ nghĩa) và hệ thống RAG (Retrieval-Augmented Generation).

---

## 1. Bản chất của Embedding (Nhúng) là gì?



Máy tính không thể trực tiếp hiểu được ngôn ngữ tự nhiên. Chúng chỉ có thể làm việc hiệu quả với các con số và phép toán. Từ những hệ thống xử lý ngôn ngữ đầu tiên, các nhà khoa học dữ liệu đã phải tìm cách mã hóa từ ngữ thành dạng số.

Các phương pháp truyền thống như **One-hot Encoding**, **Bag of Words (BoW)**, hoặc **TF-IDF** biểu diễn văn bản bằng các vector thưa (sparse vector) - nơi phần lớn các giá trị là 0 và chiều của vector bằng kích thước của toàn bộ từ điển. Nhược điểm lớn nhất của các phương pháp này là không nắm bắt được **ngữ nghĩa** của từ và vị trí của từ trong câu. Ví dụ, "Ngân hàng" (bank) trong "Ngân hàng nhà nước" và "Bờ sông" (river bank) bị coi là hoàn toàn khác biệt hoặc bị nhầm lẫn; trong khi các từ đồng nghĩa như "Vui vẻ" và "Hạnh phúc" lại không có mối liên hệ toán học nào với nhau.

**Embedding** ra đời để giải quyết triệt để vấn đề này bằng cách biểu diễn mỗi từ (hoặc câu, tài liệu) thành một **vector dày đặc (dense vector)** với số chiều cố định (ví dụ: 384, 768, 1536, hay 3072 chiều). 

Điểm đặc biệt và quyền năng nhất của không gian vector này là: **Các khái niệm có ý nghĩa tương đồng sẽ nằm gần nhau trong không gian vector**. Nếu bạn đo khoảng cách cosine (Cosine Distance) giữa vector của "Vui vẻ" và "Hạnh phúc", khoảng cách sẽ rất nhỏ (độ tương đồng cao).

## 2. Quá trình phát triển của Embedding Models

### 2.1. Word Embeddings (Nhúng mức độ từ)
Thế hệ mô hình nhúng đầu tiên tập trung vào việc tạo ra một vector cố định cho mỗi từ.
*   **Word2Vec (Google - 2013):** Sử dụng mạng neural nông (shallow neural network) với 2 kiến trúc chính là CBOW (Continuous Bag of Words - dự đoán từ mục tiêu từ ngữ cảnh) và Skip-gram (dự đoán ngữ cảnh từ từ mục tiêu).
*   **GloVe (Stanford - 2014):** Dựa trên ma trận đồng xuất hiện (co-occurrence matrix) của các từ trong một tập dữ liệu cực lớn, nắm bắt thống kê toàn cục của toàn bộ corpus.
*   **FastText (Facebook - 2016):** Mở rộng Word2Vec bằng cách chia từ thành các sub-word (n-grams kí tự), giúp mô hình xử lý tốt các từ hiếm, từ ngoài từ điển (Out-Of-Vocabulary) và các ngôn ngữ có hình thái phức tạp.

*Nhược điểm của Word Embeddings:* Các mô hình này mang tính tĩnh (Static). Từ "bank" sẽ luôn có chung một vector biểu diễn bất kể nó xuất hiện ở ngữ cảnh "river bank" (bờ sông) hay "bank account" (tài khoản ngân hàng).

### 2.2. Contextualized Embeddings (Nhúng có ngữ cảnh)
Với sự ra đời của kiến trúc **Transformer** (2017), các mô hình ngôn ngữ bắt đầu xem xét toàn bộ câu để tính toán vector cho từng từ động theo ngữ cảnh.
*   **ELMo (2018):** Sử dụng LSTM hai chiều (Bi-directional LSTM) để tạo ra nhúng phụ thuộc ngữ cảnh.
*   **BERT (Google - 2018):** Sử dụng kiến trúc Transformer Encoder. BERT sinh ra vector cho một từ dựa trên sự chú ý (attention) đến toàn bộ các từ đứng trước và đứng sau nó trong câu. Điều này giúp giải quyết hoàn toàn bài toán từ đồng âm khác nghĩa.

### 2.3. Sentence/Document Embeddings
Trong Semantic Search và RAG, ta thường cần so sánh ngữ nghĩa của cả một câu hoặc đoạn văn, chứ không chỉ từng từ rời rạc.
*   **Sentence-BERT (SBERT):** Sử dụng kiến trúc Siamese Network để huấn luyện BERT sinh ra embedding cho toàn bộ câu (Sentence Embedding) sao cho có thể dễ dàng so sánh độ tương đồng bằng Cosine Similarity.
*   **LLM-based Embeddings (Hiện đại):** Các mô hình như `text-embedding-3-small/large` của OpenAI, `Cohere Embed v3`, `Nomic-embed`, `BGE (BAAI General Embedding)`. Các mô hình này được huấn luyện với quy mô khổng lồ, hỗ trợ độ dài ngữ cảnh lớn (lên tới 8192 tokens), đa ngôn ngữ (Multilingual), và cung cấp hiệu năng vượt trội trên các bảng xếp hạng uy tín.

---

## 3. Kiến trúc Mô hình (Bi-Encoder vs Cross-Encoder)

Khi xây dựng các hệ thống tìm kiếm (Search), hệ gợi ý (Recommendation) hay hỏi đáp (QA), chúng ta thường bắt gặp hai khái niệm kiến trúc mạng phổ biến dùng để so sánh tính liên quan: Bi-Encoder và Cross-Encoder.

### 3.1. Bi-Encoder
*   **Cách hoạt động:** Bi-Encoder xử lý Câu truy vấn (Query) và Tài liệu (Document) một cách hoàn toàn độc lập qua chung một mô hình (hoặc hai mô hình chia sẻ trọng số - Siamese Network). Mô hình sẽ sinh ra Vector $U$ đại diện cho Query và Vector $V$ đại diện cho Document.
*   **Tính điểm:** Điểm tương đồng được tính bằng một phép toán hình học đơn giản (và cực kì nhanh) như **Cosine Similarity** hoặc **Dot Product** giữa $U$ và $V$.
*   **Ưu điểm:** Tốc độ rất nhanh ở giai đoạn suy luận (inference). Có thể tính toán trước (pre-compute) toàn bộ Vector $V$ của hàng triệu Document và lưu vào cơ sở dữ liệu Vector (Vector Database như Pinecone, Milvus, Qdrant). Khi có Query mới, chỉ cần chạy mô hình 1 lần để lấy Vector $U$, sau đó thực hiện tìm kiếm ANN (Approximate Nearest Neighbor).
*   **Nhược điểm:** Không nắm bắt được sự tương tác chéo, chi tiết (cross-attention) giữa các từ của Query và Document, do đó độ chính xác không cao bằng Cross-Encoder.

### 3.2. Cross-Encoder
*   **Cách hoạt động:** Nối (concatenate) Query và Document lại với nhau, phân cách bằng token đặc biệt (vd: `[CLS] Query [SEP] Document [SEP]`). Cả chuỗi dài này được đưa vào mạng Transformer. Lúc này, mô hình sẽ áp dụng cơ chế tự chú ý (self-attention) trực tiếp giữa từng từ của Query với từng từ của Document ở mọi layer.
*   **Kết quả:** Đầu ra không phải là vector embedding, mà trực tiếp đi qua một lớp phân loại (classification layer) để xuất ra một con số (Relevance score) nằm trong khoảng 0 đến 1 thể hiện mức độ liên quan.
*   **Ưu điểm:** Độ chính xác (Accuracy/Relevance) cực kỳ cao do có cross-attention.
*   **Nhược điểm:** Hiệu năng rất chậm và tính toán tốn kém. Không thể tính toán trước và lưu trữ. Nếu có 10,000 document, bạn phải chạy một mạng neural nặng nề 10,000 lần cho mỗi query mới của người dùng.

> **Mô hình kết hợp trong thực tiễn (Retrieval & Reranking Pipeline):** Hệ thống tìm kiếm hiện đại thường kết hợp sức mạnh của cả hai. 
> 1. Dùng **Bi-Encoder** (như OpenAI Embedding + Vector DB) ở bước **Retrieval (Truy xuất)** để tìm nhanh Top 100 tài liệu tiềm năng từ kho dữ liệu khổng lồ hàng triệu tài liệu.
> 2. Sau đó, dùng **Cross-Encoder (Reranker)** (như Cohere Rerank, BGE-Reranker) ở bước **Reranking (Xếp hạng lại)** để chấm điểm tương tác chi tiết và chọn lọc ra Top 5 tài liệu chính xác nhất trước khi đưa vào LLM để sinh câu trả lời.

---

## 4. Cách Huấn Luyện Embedding Model

Các Embedding Model chất lượng cao hiện nay không chỉ là sản phẩm của việc pre-training (dự đoán từ tiếp theo / masked language modeling) thông thường, mà thường trải qua quá trình fine-tuning bằng **Contrastive Learning (Học đối chiếu)** cực kì kỹ lưỡng.

### Contrastive Learning là gì?
Mục tiêu cốt lõi của phương pháp này là "kéo" các vector của các câu có ý nghĩa giống nhau lại gần nhau trong không gian n-chiều (Positive pairs) và "đẩy" các vector của các câu khác nghĩa ra xa nhau (Negative pairs).

**Dữ liệu huấn luyện thường bao gồm các bộ ba (Query, Positive, Negative):**
*   **Query (q):** Câu truy vấn (Ví dụ: "Làm sao để hủy tài khoản?")
*   **Positive (p):** Một tài liệu/câu trả lời đúng (Ví dụ: "Bạn có thể hủy tài khoản trong phần Cài đặt > Tùy chọn > Xóa.")
*   **Negative (n):** Một tài liệu không liên quan (Ví dụ: "Món ăn này rất ngon.")

### Loss Function (Hàm mất mát)
Các mô hình thường tối ưu hóa bằng **InfoNCE Loss** (Normalized Temperature-scaled Cross Entropy Loss) hoặc **Triplet Loss**. Hàm InfoNCE giúp cực đại hóa xác suất của cặp Positive trong một batch chứa rất nhiều cặp Negative.

$$ \mathcal{L} = -\log \frac{\exp(sim(q, p) / \tau)}{\exp(sim(q, p) / \tau) + \sum_{i=1}^{k} \exp(sim(q, n_i) / \tau)} $$

*(Trong đó $sim(x,y)$ là hàm tính độ tương đồng như cosine similarity, $\tau$ là tham số nhiệt độ (temperature parameter) giúp điều chỉnh độ nhạy, $n_i$ là các mẫu negative trong batch).*

### Kỹ thuật Hard Negatives (Negative khó)
Nếu các Negative chỉ là các tài liệu được chọn ngẫu nhiên (In-batch negatives) thì mô hình học rất nhanh nhưng khi áp dụng thực tế lại cực kì dễ bị "đánh lừa" bởi các văn bản có chung nhiều từ khóa nhưng khác hẳn ý nghĩa. Để mô hình thực sự hiểu được ngữ nghĩa sâu sắc (như BGE hay OpenAI), quá trình huấn luyện bắt buộc phải khai thác **Hard Negatives**.
*   **Hard Negative** là tài liệu chứa rất nhiều từ khóa giống Query nhưng thực chất không phải là câu trả lời hoặc ngược nghĩa.
*   *Ví dụ:* 
    *   Query: "Hủy thẻ tín dụng"
    *   Hard Negative: "Hướng dẫn mở thẻ tín dụng mới nhận ưu đãi"
    *   Random Negative: "Cách làm bánh pizza hải sản"
*   Việc ép mô hình phải phân biệt giữa Query và Hard Negative sẽ giúp không gian embedding phản ánh đúng ngữ nghĩa tinh vi, thay vì chỉ trở thành một cỗ máy đếm từ khóa (keyword counting) phi tuyến tính.

---

## 5. Đánh giá chất lượng mô hình nhúng (MTEB)

Làm sao để biết một Embedding model mới ra mắt có thực sự tốt hơn phiên bản cũ hay không? Cộng đồng AI hiện nay sử dụng tiêu chuẩn **MTEB (Massive Text Embedding Benchmark)** do HuggingFace tổng hợp. Bảng xếp hạng này đánh giá toàn diện mô hình qua hàng chục bộ dữ liệu và task trên nhiều ngôn ngữ:

*   **Retrieval:** Khả năng tìm kiếm tài liệu dài liên quan đến một câu hỏi ngắn.
*   **Clustering:** Khả năng phân cụm các câu có cùng chủ đề lại với nhau.
*   **Classification:** Sử dụng vector embedding làm đầu vào cho bài toán phân loại văn bản (ví dụ phân loại sắc thái cảm xúc, tin rác).
*   **STS (Semantic Textual Similarity):** Khả năng tính điểm tương đồng ngữ nghĩa chính xác giữa các cặp câu (đối chiếu với điểm do con người chấm).
*   **Reranking:** Khả năng xếp hạng lại danh sách tài liệu sao cho tài liệu phù hợp nhất nằm ở trên cùng.

Khi lựa chọn mô hình cho hệ thống của mình, bạn nên xem xét MTEB Leaderboard nhưng cần có sự cân bằng giữa: Kích thước mô hình (Model size), Số chiều của vector (Dimension), Context Window (Độ dài đầu vào tối đa) và Điểm số trên task cụ thể mà ứng dụng của bạn cần.

---

## 6. Ứng dụng của Embedding Models

1.  **Semantic Search (Tìm kiếm ngữ nghĩa):** Cho phép người dùng tìm kiếm theo ý nghĩa thay vì khớp chính xác từ khóa (keyword-matching). Khắc phục triệt để lỗi sai chính tả, từ đồng nghĩa hoặc các cách diễn đạt khác nhau cho cùng một khái niệm.
2.  **RAG (Retrieval-Augmented Generation):** Đóng vai trò là "bộ não" lưu trữ kiến thức cho các mô hình sinh (như GPT-4, Claude). Hệ thống RAG dùng embedding để tìm kiếm và trích xuất các chunk (đoạn văn bản) liên quan nhất từ kho dữ liệu nội bộ (ví dụ: wiki công ty, tài liệu hướng dẫn) để tiêm vào prompt, giúp LLM trả lời chính xác và tránh ảo giác (hallucination).
3.  **Clustering & Topic Modeling (Phân cụm & Mô hình hóa chủ đề):** Tự động gom nhóm hàng ngàn phản hồi của khách hàng, review sản phẩm hoặc các bài báo có cùng chủ đề lại với nhau thông qua thuật toán phân cụm (như K-Means, HDBSCAN) trên không gian vector nhiều chiều.
4.  **Recommendations (Hệ thống gợi ý):** Gợi ý các bài viết, sản phẩm, khóa học tương tự dựa trên vector nhúng của mô tả sản phẩm / nội dung mà người dùng đang xem.
5.  **Anomaly Detection (Phát hiện bất thường):** Tìm các điểm dữ liệu (như logs hệ thống, tin nhắn văn bản) nằm xa các cụm dữ liệu thông thường trong không gian embedding, đây có thể là dấu hiệu của lỗi phần mềm, hành vi gian lận hoặc tấn công mạng.

---

## 7. Tiêu chí lựa chọn Embedding Model cho ứng dụng

Khi tích hợp Embedding Model vào một ứng dụng thực tế, không có một "mô hình tốt nhất" cho mọi bài toán. Dưới đây là các tiêu chí cần xem xét:

*   **Hỗ trợ đa ngôn ngữ (Multilingual):** Nếu bạn xử lý dữ liệu tiếng Việt hoặc nhiều ngôn ngữ khác nhau, các mô hình nhúng chỉ huấn luyện riêng trên tiếng Anh sẽ tạo ra chất lượng vector rất kém. Hãy ưu tiên các mô hình hỗ trợ đa ngôn ngữ được kiểm chứng tốt như `text-embedding-3-large`, `paraphrase-multilingual-MiniLM`, `Cohere-multilingual` hoặc các model fine-tune riêng cho tiếng Việt.
*   **Giới hạn số lượng token (Context Window):** Hầu hết các model mã nguồn mở (open-source) dựa trên kiến trúc BERT bị giới hạn ở 512 token cho mỗi đoạn văn bản. Nếu tài liệu của bạn dài hơn, mô hình sẽ tự động cắt bỏ phần đuôi gây mất mát thông tin. Các mô hình hiện đại cung cấp Context Window lớn hơn rất nhiều (ví dụ OpenAI hỗ trợ tới 8192 tokens).
*   **Kích thước chiều Vector (Dimensionality):** Vector càng nhiều chiều (ví dụ: 1536 hoặc 3072) thì càng có khả năng mã hóa và lưu trữ nhiều thông tin ngữ nghĩa phức tạp. Tuy nhiên, đánh đổi lại là nó sẽ làm tăng đáng kể kích thước bộ nhớ của Vector Database, tiêu tốn nhiều RAM và làm chậm quá trình tìm kiếm ANN. Gần đây, một số mô hình như `text-embedding-3` áp dụng công nghệ *Matryoshka Representation Learning*, cho phép bạn cắt gọt bớt số chiều (ví dụ từ 3072 xuống 256) mà chỉ giảm một lượng rất nhỏ độ chính xác.
*   **Mã nguồn mở (Open-source) vs Gọi API (Commercial):** Gọi API của OpenAI, Cohere, Anthropic rất tiện lợi và mạnh mẽ nhưng dữ liệu của bạn sẽ phải gửi ra ngoài hệ thống và chịu chi phí tính theo lượt gọi. Các mô hình mã nguồn mở như BGE, E5, Nomic có thể tự host (Self-host) trên hạ tầng nội bộ, bảo mật tuyệt đối dữ liệu và không tốn phí bản quyền, tuy nhiên đòi hỏi kỹ năng vận hành (MLOps) và hạ tầng GPU.

---

## Tài Liệu Tham Khảo
* [MTEB Leaderboard trên HuggingFace - Bảng xếp hạng các Embedding Model](https://huggingface.co/spaces/mteb/leaderboard)
* [Sentence-Transformers Documentation](https://www.sbert.net/)
* [OpenAI Embeddings API Overview](https://platform.openai.com/docs/guides/embeddings)
* [Cohere Representation Learning and Reranking](https://cohere.com/research/papers/)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
