---
title: "Mô hình tái sắp xếp - Reranker"
category: "GenAI / Data Engineering"
difficulty: "Advanced"
tags: ["reranker", "cross-encoder", "bi-encoder", "transformers", "nlp"]
readingTime: "10 mins"
lastUpdated: 2026-06-08
seoTitle: "Mô hình Reranker (Cross-Encoder) là gì? Khác biệt với Bi-Encoder"
metaDescription: "Khám phá kiến trúc mô hình Reranker (Cross-Encoder), cơ chế tính toán Attention chéo và lý do vì sao nó vượt trội hơn Bi-Encoder (Embedding models)."
---

# Mô hình tái sắp xếp - Reranker

## Summary

Mô hình tái sắp xếp (Reranker), về mặt bản chất học máy, thường là các mô hình ngôn ngữ dựa trên kiến trúc **Cross-Encoder**. Trái ngược với các mô hình Embedding thông thường (Bi-Encoder) dùng để lưu vào Vector Database, Reranker tiếp nhận đồng thời cả Câu hỏi (Query) và Tài liệu (Document) vào chung một luồng xử lý Transformer. Điều này cho phép từng từ trong Câu hỏi có khả năng tương tác trực tiếp (Cross-attention) với từng từ trong Tài liệu, tạo ra một điểm số liên quan (Relevance score) cực kỳ chuẩn xác để phục vụ cho tác vụ Reranking.

---

## Definition

**Reranker** là một mô hình AI chuyên biệt dùng để chấm điểm mức độ phù hợp giữa hai đoạn văn bản.

Thay vì trả về một mảng số thực (vector) như các mô hình Embedding, một Reranker nhận đầu vào là chuỗi `[Query] + [Separator] + [Document]` và trực tiếp trả về một số thực vô hướng duy nhất (ví dụ: $0.85$), đại diện cho xác suất tài liệu đó giải quyết được câu hỏi.

---

## Why it exists

Để hiểu lý do Reranker tồn tại, ta cần hiểu điểm yếu chí mạng của mô hình Embedding (Bi-Encoder).
Bi-Encoder xử lý Query và Document **hoàn toàn độc lập**. Nó nén toàn bộ ý nghĩa của Document thành 1 vector, và nén Query thành 1 vector. Khi ta tính Cosine Similarity, ta đang so sánh 2 "cục nén" đó.
Quá trình nén này gây thất thoát thông tin khủng khiếp (Information Bottleneck). Các tiểu tiết, từ khóa quan trọng, hay cấu trúc ngữ pháp bị mờ nhạt đi trong mảng 1024 chiều.

Reranker (Cross-Encoder) tồn tại để phá bỏ "cổ chai" này. Bằng cách không nén chúng thành vector độc lập mà cho chúng xử lý cùng nhau, mô hình có thể duy trì toàn vẹn ngữ cảnh.

---

## Core idea: Cross-Encoder vs Bi-Encoder

Đây là điểm cốt lõi nhất của Reranker:

**1. Bi-Encoder (Mô hình Embedding / Vector DB)**
* $Vector_A = BERT(Query)$
* $Vector_B = BERT(Document)$
* $Score = Cosine(Vector_A, Vector_B)$
* Ưu điểm: Có thể tính trước $Vector_B$ (Offline Indexing). Nhanh.
* Nhược điểm: Hai câu không tương tác trong quá trình xử lý.

**2. Cross-Encoder (Mô hình Reranker)**
* Đầu vào: Khâu nối chuỗi `Input = "Query [SEP] Document"`
* Xử lý: Đưa toàn bộ chuỗi này qua mạng Transformer. Lớp Self-Attention sẽ tính toán sự liên kết giữa MỌI token trong Query với MỌI token trong Document.
* Đầu ra: Qua một lớp phân loại (Linear layer) ở cuối cùng để ra 1 con số: $Score = BERT(Query \oplus Document)$
* Ưu điểm: Siêu chính xác.
* Nhược điểm: Chậm. Phải chạy lại toàn bộ mô hình cho mỗi cặp Query-Document lúc runtime.

---

## How it works

Khi bạn gọi một API Reranker (ví dụ Cohere Rerank, BAAI/bge-reranker-large):
1. **Tokenization**: Reranker sẽ nối Query và Document lại. Ví dụ: `[CLS] Câu hỏi của bạn? [SEP] Nội dung tài liệu. [SEP]`.
2. **Deep Attention**: Đi qua 12 - 24 lớp Transformer blocks. Ở mỗi lớp, các từ trong "Câu hỏi của bạn?" sẽ xem xét ngữ cảnh của "Nội dung tài liệu" để tự định hình ý nghĩa.
3. **Pooling/Classification**: Lấy giá trị của token đặc biệt `[CLS]` ở lớp cuối cùng, truyền qua hàm Sigmoid để ép ra một giá trị từ 0 đến 1.
4. Con số này chính là điểm Relevance Score.

---

## Architecture / Flow

```mermaid
graph TD
    subgraph Bi-Encoder (Embedding Model)
        Q1[Query] -->|BERT| V1[Vector Q]
        D1[Document] -->|BERT| V2[Vector D]
        V1 --> Cosine((Cosine))
        V2 --> Cosine
        Cosine --> S1[Score]
    end

    subgraph Cross-Encoder (Reranker Model)
        Q2[Query] --> Concat[Query + SEP + Document]
        D2[Document] --> Concat
        Concat --> BERT[Deep Transformer Layers <br> with Cross-Attention]
        BERT -->|CLS Token| Linear[Linear + Sigmoid]
        Linear --> S2[Score]
    end
```

---

## Practical example

Đoạn mã Python dưới đây sử dụng thư viện `sentence-transformers` (Cross-Encoder) để chấm điểm và sắp xếp lại tài liệu.

```python
from sentence_transformers import CrossEncoder

# Tải mô hình Reranker (Cross-Encoder)
model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

query = "Thủ đô của nước Pháp là gì?"
documents = [
    "Paris là thủ đô và thành phố đông dân nhất của Pháp.",
    "Bánh mì Baguette là một biểu tượng ẩm thực của Pháp.",
    "Lyon là một thành phố lớn ở miền trung đông nước Pháp."
]

# Reranker yêu cầu đầu vào là các CẶP (Query, Document)
pairs = [[query, doc] for doc in documents]

# Mô hình trực tiếp trả về mảng điểm số cho từng cặp
scores = model.predict(pairs)

for i, score in enumerate(scores):
    print(f"Doc {i+1} Score: {score:.4f} -> {documents[i]}")
    
# Output kỳ vọng: Doc 1 sẽ có điểm vượt trội so với Doc 2 và 3
```

---

## Best practices

* **Sử dụng mô hình nhỏ nhẹ**: Vì Reranker phải chạy lúc runtime trên (ví dụ) 100 tài liệu, đừng dùng mô hình quá to (như 70B parameters). Các Reranker mã nguồn mở cực tốt hiện nay thường chỉ nặng khoảng 250M - 2B parameters (như họ mô hình `BGE-Reranker`, `MiniLM`).
* **Batching**: Khi viết code đẩy dữ liệu vào Reranker, hãy đẩy theo lô (Batch) thay vì vòng lặp từng cái một để tận dụng khả năng tính toán song song của GPU. (vd: `reranker.predict([(query, doc1), (query, doc2)...])`).
* **Giới hạn Max Length**: Cross-Encoder có giới hạn độ dài token (thường là 512 hoặc 1024 token tổng cộng cho cả query và doc). Nếu document của bạn quá dài, nó sẽ bị cắt cụt (truncate) ở phần đuôi, làm mất thông tin Rerank. Hãy Chunking đúng chuẩn trước.

---

## Trade-offs

### Ưu điểm
* **Độ chính xác vô đối**: Giải quyết triệt để vấn đề "Lost in translation" của Vector Embedding.
* **Huấn luyện dễ dàng**: Huấn luyện (fine-tune) một mô hình Reranker cho domain cụ thể dễ hơn rất nhiều so với fine-tune một mô hình Embedding Bi-Encoder, vì hàm loss đơn giản là Binary Cross-Entropy.

### Nhược điểm
* **Trễ mạng (Latency) cao**: Độ phức tạp tính toán của Attention là $O(N^2)$ với N là độ dài đoạn text. Việc nối Query và Doc làm N tăng, dẫn đến chi phí tính toán bùng nổ theo cấp số nhân.
* **Không thể index trước**: Bạn bắt buộc phải chạy Reranker ngay tại thời điểm người dùng hỏi.

---

## When to use

* Tích hợp làm Giai đoạn 2 trong pipeline RAG (Sử dụng song song với khái niệm [Reranking](/concepts/reranking)).
* Fine-tune Reranker riêng cho các lĩnh vực đặc thù (Pháp luật, Y tế) nơi mà từ vựng có ý nghĩa quyết định sống còn.

## When not to use

* Tuyệt đối không dùng Cross-Encoder làm thuật toán tìm kiếm độc lập trên cơ sở dữ liệu lớn. Bạn không thể đợi vài tiếng đồng hồ để tìm kiếm một câu hỏi.

---

## Related concepts

* [Reranking](/concepts/reranking)
* [Vector Database](/concepts/vector-store)
* [Fine-tuning](/concepts/fine-tuning)

---

## Interview questions

### 1. Phân biệt kiến trúc Bi-Encoder và Cross-Encoder.
* **Người phỏng vấn muốn kiểm tra**: Kiến thức sâu về kiến trúc Transformer trong Information Retrieval.
* **Gợi ý trả lời (Strong Answer)**:
  * Bi-Encoder (Embedding Models) mã hóa Query và Document độc lập qua 2 nhánh mạng (hoặc cùng 1 mạng nhưng chạy 2 lần rời rạc) để sinh ra 2 Vector. Tương tác duy nhất giữa chúng là phép tính Cosine Similarity ở cuối cùng. Dùng cho Vector Database vì nó lưu sẵn được Vector của Document.
  * Cross-Encoder (Reranker) ghép cứng Query và Document thành 1 chuỗi, đưa qua mạng Transformer duy nhất. Cơ chế Self-Attention cho phép các token của Query và Document giao thoa (Cross-attention) ở mọi lớp layer của mô hình. Tương tác sâu này đem lại độ chính xác cực cao nhưng không thể tạo Vector tĩnh để lưu trữ.

### 2. Nếu Cross-Encoder quá đắt đỏ và Bi-Encoder có độ chính xác thấp, có kiến trúc lai nào không?
* **Người phỏng vấn muốn kiểm tra**: Khả năng cập nhật các công nghệ tiên tiến (Late Interaction).
* **Gợi ý trả lời (Strong Answer)**:
  * Có, đó là kiến trúc **Late Interaction (Tương tác muộn)**, tiêu biểu là mô hình **ColBERT**.
  * Thay vì nén toàn bộ Document thành 1 Vector duy nhất (như Bi-Encoder), ColBERT giữ lại Vector riêng biệt cho TỪNG token trong Document. Khi query, nó tính Max-Similarity giữa từng vector token của Query với tất cả vector token của Document, sau đó tổng hợp lại.
  * ColBERT nằm ở giữa: Vẫn tính trước được Offline (như Bi-encoder) nhưng lưu trữ tốn gấp nhiều lần, và tính toán online giữ được độ chính xác gần tương đương Cross-Encoder.

---

## English summary

A Reranker is fundamentally a Cross-Encoder machine learning model utilized to precisely score the relevance between a query and a document. Unlike Bi-Encoders (Embedding models) that compress text independently into static vectors (creating an information bottleneck), Cross-Encoders concatenate the query and document into a single input. This allows the Transformer's deep self-attention mechanisms to perform rich, word-by-word cross-attention between the two texts. While this architectural design yields vastly superior accuracy for Information Retrieval and RAG pipelines, its heavy computational cost dictates that it cannot index documents offline and must be strictly used as a second-stage filter on a small subset of pre-retrieved candidates.
