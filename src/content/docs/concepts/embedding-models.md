---
title: "Các mô hình nhúng - Embedding Models"
category: "GenAI / Data Engineering"
difficulty: "Intermediate"
tags: ["embedding-models", "nlp", "vector", "deep-learning", "representation"]
readingTime: "12 mins"
lastUpdated: 2026-06-08
seoTitle: "Embedding Models - Tổng quan về các mô hình nhúng trong AI"
metaDescription: "Tìm hiểu các mô hình nhúng (Embedding Models), kiến trúc, cách phân loại và ứng dụng trong tìm kiếm ngữ nghĩa, GenAI và xử lý ngôn ngữ tự nhiên."
---

# Các mô hình nhúng - Embedding Models

## Summary

Các mô hình nhúng (Embedding Models) là các thuật toán Machine Learning / Deep Learning có chức năng chuyển đổi dữ liệu phi cấu trúc (văn bản, hình ảnh, âm thanh) thành các biểu diễn dạng số học dưới dạng các vectơ đa chiều (embeddings) trong một không gian liên tục. Các mô hình này được huấn luyện sao cho các dữ liệu có ý nghĩa (ngữ nghĩa) tương đồng sẽ nằm gần nhau trong không gian vectơ.

---

## Definition

**Embedding Models** là các mô hình trí tuệ nhân tạo chuyên biệt dùng để ánh xạ (map) các đối tượng rời rạc (từ, câu, tài liệu, hình ảnh, hoặc đồ thị) vào một không gian vectơ số thực (continuous vector space) n-chiều. Đầu ra của mô hình là một vectơ, đại diện cho "ý nghĩa" hoặc "đặc trưng" của đối tượng đầu vào. Không gian này cho phép máy tính đo lường khoảng cách hoặc độ tương đồng giữa các đối tượng bằng các phép toán học (ví dụ: Cosine Similarity, Dot Product).

---

## Why it exists

Máy tính không thể hiểu trực tiếp dữ liệu dạng text, hình ảnh hay âm thanh như con người. Trong lịch sử xử lý ngôn ngữ tự nhiên (NLP):
1. **One-Hot Encoding**: Biểu diễn mỗi từ bằng một vectơ chứa toàn số 0 và một số 1. Phương pháp này gây ra bùng nổ số chiều (sparse vector) và không nắm bắt được mối quan hệ ngữ nghĩa giữa các từ (ví dụ: "chó" và "mèo" hoàn toàn độc lập trực giao).
2. **TF-IDF / Bag of Words**: Dựa trên tần suất xuất hiện của từ, nhưng bỏ qua thứ tự từ ngữ và ngữ cảnh, không giải quyết được vấn đề từ đồng nghĩa (synonyms) hay hiện tượng đa nghĩa (polysemy).

Embedding Models ra đời nhằm tạo ra **Dense Vectors** (Vectơ đặc, ít chiều hơn nhưng chứa số thực) giúp nén thông tin ngữ nghĩa, giải quyết được bài toán bùng nổ số chiều và giúp máy tính "hiểu" được rằng "vua" - "đàn ông" + "phụ nữ" $\approx$ "nữ hoàng".

---

## Core idea

Nguyên lý hoạt động cốt lõi của các Embedding Models:
* **Học biểu diễn (Representation Learning)**: Dùng các mạng nơ-ron để học cách biểu diễn dữ liệu dựa trên bối cảnh. Từ "bank" trong "river bank" (bờ sông) sẽ có vectơ khác với "bank" trong "bank account" (tài khoản ngân hàng) đối với các mô hình theo ngữ cảnh (Contextualized models).
* **Không gian tiềm ẩn (Latent Space)**: Các đặc trưng ẩn của dữ liệu được trải ra trên nhiều chiều. Không một chiều cụ thể nào (ví dụ chiều thứ 17) mang một ý nghĩa rõ ràng đối với con người, nhưng sự kết hợp của toàn bộ các chiều sẽ tạo nên ý nghĩa của đối tượng.
* **Tương đồng hình học**: Ý nghĩa tương đồng đồng nghĩa với khoảng cách hình học gần nhau.

---

## How it works

Quá trình hoạt động phụ thuộc vào thế hệ của mô hình, nhưng nhìn chung qua 2 giai đoạn:
1. **Tiền xử lý (Tokenization)**: Đầu vào (ví dụ: văn bản) được chia nhỏ thành các token.
2. **Truyền qua mạng nơ-ron (Forward Pass)**: Các token đi qua mô hình (có thể là Word2Vec, LSTM, hoặc Transformer). Trong các mô hình Transformer (như BERT), cơ chế Attention tính toán mức độ ảnh hưởng của các từ xung quanh đối với từ hiện tại.
3. **Tổng hợp (Pooling/Aggregation)**: Để lấy được một vectơ đại diện cho toàn bộ câu, các vectơ của từng token sẽ được gộp lại (ví dụ: Mean Pooling, hoặc lấy vectơ của token `[CLS]`).

---

## Architecture / Flow

Sơ đồ luồng xử lý văn bản qua Embedding Model:

```mermaid
graph TD
    A[Văn bản đầu vào: "Tìm kiếm thông tin"] --> B[Tokenizer]
    B --> C["Tokens: ['Tìm', 'kiếm', 'thông', 'tin']"]
    C --> D[Embedding Model Layer - e.g. BERT]
    D --> E[Contextualized Token Embeddings]
    E --> F[Pooling Layer]
    F --> G["Sentence Embedding Vector (ví dụ: 768 chiều)"]
    G --> H[Lưu trữ Vector DB / Tính khoảng cách]
```

---

## Practical example

Sử dụng thư viện `sentence-transformers` trong Python để sinh vectơ nhúng cho câu:

```python
from sentence_transformers import SentenceTransformer, util

# Tải mô hình nhúng
model = SentenceTransformer('all-MiniLM-L6-v2')

# Văn bản đầu vào
sentences = ["Mèo đang ngủ", "Chó đang chạy", "Con mèo nhắm mắt ngủ"]

# Sinh embeddings
embeddings = model.encode(sentences)

# Kích thước vectơ
print("Shape:", embeddings.shape) # Output: (3, 384) -> 3 câu, mỗi câu là vectơ 384 chiều

# Tính toán độ tương đồng (Cosine Similarity)
cosine_scores = util.cos_sim(embeddings, embeddings)

print(f"Độ tương đồng giữa câu 1 và 3: {cosine_scores[0][2]:.4f}")
# Output: Độ tương đồng rất cao (gần 1.0) dù từ ngữ có khác nhau chút ít.
```

---

## Best practices

* **Lựa chọn đúng mô hình cho ngôn ngữ**: Nếu bạn xử lý tiếng Việt, hãy chọn các mô hình Multilingual (như `paraphrase-multilingual-mpnet-base-v2` hoặc các mô hình dành riêng cho tiếng Việt như `bkai-foundation-models/vietnamese-bi-encoder`) thay vì mô hình chỉ tiếng Anh.
* **Kích thước vectơ vs. Hiệu năng**: Kích thước vectơ càng lớn (ví dụ: OpenAI `text-embedding-3-large` với 3072 chiều) thì độ biểu diễn càng tốt, nhưng tốn nhiều dung lượng lưu trữ (Vector DB) và thời gian tính toán. Chọn kích thước đủ dùng (384 - 1536) cho đa số ứng dụng.
* **Chú ý đến Sequence Length (Độ dài đầu vào tối đa)**: Các mô hình như BERT thường giới hạn ở 512 tokens. Đưa văn bản dài hơn vào sẽ bị cắt cụt (truncate). Hãy thực hiện Chunking trước khi nhúng văn bản dài.

---

## Common mistakes

* **Sử dụng mô hình Word Embedding cho câu dài**: Dùng các mô hình cũ như Word2Vec tính trung bình cộng để nhúng cả đoạn văn dài thường làm mất ngữ nghĩa. Hãy dùng các mô hình Sentence/Document Embedding (như Sentence-BERT).
* **Bỏ qua chuẩn hóa văn bản**: Đưa các chuỗi chứa nhiều ký tự đặc biệt, HTML tags hay viết sai chính tả vào thẳng Embedding Model làm giảm chất lượng biểu diễn.
* **Sử dụng sai hàm khoảng cách**: Mỗi mô hình được huấn luyện để tối ưu với một loại metric cụ thể (Cosine Similarity hoặc Dot Product). Sử dụng sai metric lúc tìm kiếm (như dùng Euclidean cho mô hình tối ưu Cosine mà không chuẩn hóa độ dài) sẽ dẫn đến kết quả sai lệch.

---

## Trade-offs

### Ưu điểm
* Giải quyết xuất sắc bài toán tìm kiếm ngữ nghĩa, khắc phục nhược điểm từ đồng nghĩa/đa nghĩa của tìm kiếm dựa trên từ khóa (keyword search).
* Là nền tảng bắt buộc cho Retrieval-Augmented Generation (RAG) và các ứng dụng phân tích dữ liệu phi cấu trúc.
* Cho phép thực hiện cross-lingual search (tìm kiếm bằng tiếng Việt ra tài liệu tiếng Anh).

### Nhược điểm
* **Tính hộp đen (Black-box)**: Rất khó để giải thích tại sao mô hình lại trả về hai đoạn văn bản này là giống nhau (không giải thích được bằng từ khóa trực tiếp).
* **Mất mát thông tin chính xác**: Các từ khóa hiếm, mã SKU, tên riêng có thể bị làm mờ đi trong quá trình nhúng ngữ nghĩa. Tìm kiếm bằng nhúng thường kém ở các truy vấn cần khớp chính xác 100% (exact match).
* Tốn kém tính toán so với các bộ đếm từ thống kê truyền thống.

---

## When to use

* Xây dựng hệ thống tìm kiếm ngữ nghĩa (Semantic Search), hệ thống gợi ý (Recommender Systems).
* Triển khai kiến trúc RAG cho Large Language Models.
* Phân loại văn bản, gom cụm dữ liệu phi cấu trúc (Clustering).
* Image/Audio-to-text mapping (Sử dụng các mô hình Multimodal như CLIP).

## When not to use

* Bài toán yêu cầu tìm kiếm chính xác (exact match) trên mã số, log, số điện thoại, tên riêng (nên dùng ElasticSearch / Keyword search).
* Hệ thống có tài nguyên tính toán (CPU/Memory) cực kì hạn hẹp, không thể chạy các mô hình Deep Learning.

---

## Related concepts

* [Vectơ nhúng (Embeddings)](/concepts/embeddings)
* [Phân tách văn bản (Chunking)](/concepts/chunking)
* [Tìm kiếm ngữ nghĩa (Semantic Search)](/concepts/semantic-search)
* [Mô hình nhúng đơn lẻ (Embedding Model)](/concepts/embedding-model)

---

## Interview questions

### 1. Phân biệt giữa Word Embeddings (Word2Vec) và Contextual Embeddings (BERT).
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết lịch sử phát triển và bản chất của các thế hệ embedding.
* **Gợi ý trả lời (Strong Answer)**: Word Embeddings như Word2Vec là "Static" (Tĩnh). Mỗi từ chỉ có duy nhất một vectơ, không quan tâm ngữ cảnh (ví dụ: "bank" trong bờ sông hay ngân hàng đều cùng 1 vectơ). Contextual Embeddings như BERT là "Dynamic" (Động), tính toán vectơ cho mỗi từ dựa vào các từ xung quanh thông qua cơ chế Attention, do đó từ "bank" sẽ có 2 vectơ hoàn toàn khác nhau tùy văn cảnh.
* **Lỗi cần tránh**: Trả lời mơ hồ rằng BERT lớn hơn nên tốt hơn mà không nhắc đến đặc tính "Contextual".

### 2. Sự khác biệt giữa Asymmetric Semantic Search và Symmetric Semantic Search khi chọn Embedding Model là gì?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng lựa chọn mô hình cho đúng bài toán thực tế.
* **Gợi ý trả lời (Strong Answer)**: 
  * Symmetric Search: Câu truy vấn và tài liệu có độ dài và cấu trúc tương tự nhau (ví dụ: tìm các câu hỏi tương tự nhau trong FAQ). Nên dùng mô hình được huấn luyện đối xứng (như `all-MiniLM`).
  * Asymmetric Search: Câu truy vấn ngắn (như từ khóa), nhưng tài liệu là những đoạn văn dài. Cần dùng mô hình bất đối xứng (như các mô hình `msmarco` hoặc Dense Passage Retrieval). Chọn sai sẽ khiến mô hình không tìm được đoạn văn phù hợp cho câu hỏi ngắn.

---

## References

1. **Deep Learning** - Ian Goodfellow, Yoshua Bengio, Aaron Courville.
2. **Speech and Language Processing** - Dan Jurafsky and James H. Martin (Chương 6: Vector Semantics and Embeddings).
3. **Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks** - Reimers & Gurevych (2019).

---

## English summary

Embedding Models are Deep Learning models (such as Word2Vec, BERT, or text-embedding-ada-002) that transform unstructured data (text, images) into dense numeric vectors in a high-dimensional, continuous space. They capture the underlying semantic meaning of the inputs, ensuring that conceptually similar objects are mapped geometrically close to one another. These models overcome the limitations of sparse representations (like TF-IDF or One-Hot Encoding) by capturing context and synonyms, making them a foundational component for Semantic Search, Recommender Systems, and Retrieval-Augmented Generation (RAG). However, they can act as "black boxes" and often struggle with exact keyword matching.
