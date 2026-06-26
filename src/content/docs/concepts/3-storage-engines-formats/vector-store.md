---
title: "Cơ sở dữ liệu Vector (Vector Database)"
difficulty: "Intermediate"
tags: ["vector-database", "embeddings", "similarity-search", "rag", "hnsw", "ivf-pq", "pgvector"]
readingTime: "20 mins"
lastUpdated: 2026-06-26
seoTitle: "Cơ sở dữ liệu Vector (Vector Database): Kiến trúc, Đánh đổi HNSW vs IVF-PQ"
metaDescription: "Đi sâu vào kiến trúc vật lý của Vector Database. Phân tích sự đánh đổi hệ thống (Trade-offs) giữa HNSW và IVF-PQ, rủi ro OOMKilled, và chiến lược lọc Metadata."
description: "Vector Database không chỉ là nơi lưu trữ mảng số thực. Dưới góc độ System Design, nó là một bài toán đánh đổi khốc liệt giữa Memory Footprint, Latency và Recall."
---

Trong trào lưu Generative AI và RAG (Retrieval-Augmented Generation), Cơ sở dữ liệu Vector (Vector Database) thường được ví như "trí nhớ dài hạn" của các LLM. Tuy nhiên, dưới góc độ Kỹ thuật Dữ liệu (Data Engineering) và Thiết kế Hệ thống (System Design), Vector Database bản chất là một công cụ giải quyết bài toán **Tìm kiếm xấp xỉ lân cận gần nhất (Approximate Nearest Neighbor - ANN)** ở quy mô hàng chục triệu đến hàng tỷ chiều (dimensions).

Bài viết này bỏ qua các định nghĩa cơ bản và đi thẳng vào kiến trúc thực thi vật lý (Physical Execution), cách các Index hoạt động dưới nền tảng, và những sự đánh đổi khốc liệt (Systemic Trade-offs) mà các Staff Engineer phải đối mặt khi thiết kế hệ thống Vector Search.

---

## 1. Kiến trúc Thực thi Vật lý (Physical Execution)

Các hệ quản trị CSDL truyền thống (như PostgreSQL B-Tree) thất bại trong tìm kiếm Vector vì cấu trúc dữ liệu của chúng được thiết kế cho việc so khớp chính xác 1-chiều (exact match) hoặc dải giá trị (range scan). Với không gian vector nhiều chiều (ví dụ: OpenAI embeddings có 1536 chiều), hiệu ứng **Lời nguyền Đa chiều (Curse of Dimensionality)** khiến khoảng cách giữa các điểm trở nên vô nghĩa, và việc quét toàn bộ bảng (kNN / k-Nearest Neighbors) là điều bất khả thi về mặt độ trễ (Latency).

Để đạt được tốc độ mili-giây, Vector Database sử dụng thuật toán ANN, đánh đổi một phần nhỏ độ chính xác (Recall) lấy tốc độ (Latency) thông qua hai trường phái kiến trúc chính: **Đồ thị (Graph-based)** và **Phân cụm + Nén (Partitioning + Compression)**.

### 1.1. Trường phái Đồ thị: HNSW (Hierarchical Navigable Small World)

HNSW là thuật toán "quốc dân" trong các Vector Database hiện đại (Pinecone, Qdrant, Milvus, pgvector). Nó xây dựng một cấu trúc đồ thị nhiều tầng (multi-layered graph) dựa trên nguyên lý "Thế giới nhỏ" (Small World network).

```mermaid
graph TD
    subgraph Layer_2["Tầng 2 - Sparse("Bước nhảy xa")"]
        N1("(Node 1")) --- N5("(Node 5"))
    end
    
    subgraph Layer_1["Tầng 1 - Medium"]
        N1 --- N3("(Node 3"))
        N3 --- N5
        N5 --- N8("(Node 8"))
    end
    
    subgraph Layer_0["Tầng 0 - Dense("Chi tiết")"]
        N1 --- N2("(Node 2"))
        N2 --- N3
        N3 --- N4("(Node 4"))
        N4 --- N5
        N5 --- N6("(Node 6"))
        N6 --- N7("(Node 7"))
        N7 --- N8
    end
    
    Layer_2 -.-> Layer_1
    Layer_1 -.-> Layer_0
```

- **Cơ chế duyệt (Traversal):** Truy vấn bắt đầu ở tầng cao nhất (thưa thớt nhất) để thực hiện các bước nhảy vọt (long-range navigation), sau đó thu hẹp dần khoảng cách và đi xuống tầng thấp hơn (dày đặc) để tìm kiếm lân cận cục bộ (local neighborhood).
- **Cấu hình thực chiến (pgvector):**
  ```sql
  -- Tạo index HNSW trong PostgreSQL
  CREATE INDEX ON document_embeddings 
  USING hnsw (embedding vector_l2_ops) 
  WITH (m = 16, ef_construction = 64);
  ```
  - `m`: Số lượng liên kết hai chiều tối đa của một node ở Tầng 0. `m` càng cao -> Recall càng tốt nhưng RAM tiêu thụ cực lớn.
  - `ef_construction`: Kích thước danh sách ứng viên (candidate list) được duy trì trong lúc **xây dựng index**. Tăng `ef_construction` giúp index chất lượng hơn nhưng làm chậm quá trình `INSERT`.

### 1.2. Trường phái Phân cụm và Nén: IVF-PQ (Inverted File with Product Quantization)

Khi dữ liệu vượt mốc hàng trăm triệu vector, HNSW sẽ làm nổ tung bộ nhớ RAM. Lúc này, **IVF-PQ** là giải pháp cứu cánh.

1. **IVF (Phân cụm Voronoi):** Phân chia không gian vector thành $K$ cụm (clusters) bằng K-Means. Khi truy vấn, hệ thống tính khoảng cách từ vector truy vấn đến các tâm cụm (centroids), chọn ra $nprobe$ cụm gần nhất và chỉ tìm kiếm trong đó.
2. **PQ (Nén lượng tử hóa):** Cắt vector gốc (ví dụ 1024 chiều) thành các block nhỏ (ví dụ 8 blocks x 128 chiều). Mỗi block được thay thế bằng ID của centroid gần nhất trong một từ điển (Codebook). Kết quả: Vector 1024 float32 (4096 bytes) có thể bị ép xuống chỉ còn 8 bytes, giảm Memory Footprint hàng trăm lần.

---

## 2. Đánh đổi Hệ thống (Systemic Trade-offs)

Lựa chọn Engine lưu trữ Vector là một sự hy sinh giữa **Memory, Latency, và Recall**.

| Tiêu chí | HNSW (Graph-based) | IVF-PQ (Partition + Compress) |
| :--- | :--- | :--- |
| **Thế mạnh lõi** | Độ trễ thấp nhất, Recall rất cao (thường > 95%). | Khả năng mở rộng quy mô tỷ lệ (Billion-scale). |
| **Memory Footprint** | Rất cao. Phải giữ toàn bộ đồ thị (pointers) + Vector gốc trên RAM. | Cực thấp. Dữ liệu nén (PQ Codes) tốn cực ít RAM. |
| **Cập nhật (Updates)** | Mượt mà (Dynamic). Chèn mới chỉ tốn thời gian nối đồ thị. | Kém (Static). `INSERT` nhiều làm trôi lệch tâm cụm, buộc phải Re-index (Re-train K-Means). |
| **Scale khuyên dùng** | < 50 triệu Vector (trừ khi bạn rất giàu tài nguyên). | Trăm triệu đến hàng Tỷ Vector (Memory-constrained). |

---

## 3. Rủi ro Vận hành (Operational Risks) và Troubleshooting

### 3.1. HNSW: Quái vật ngốn RAM và OOMKilled

**Sự cố thực tế:** Một hệ thống triển khai RAG sử dụng HNSW trên pgvector. Số lượng tài liệu tăng nhanh lên 20 triệu chunks (vector OpenAI 1536 chiều). Database liên tục bị OOM (Out Of Memory) và restart do Linux OOM Killer can thiệp.

**Phân tích Root Cause:** HNSW không nén dữ liệu. Mỗi node tốn khoảng `1536 * 4 bytes (vector) + m * 8 bytes (pointers)`. 20 triệu node = ~125GB RAM chỉ cho phần Index, chưa tính buffer và dữ liệu gốc. Nếu không nằm trọn trong RAM (Spill-to-disk), tốc độ truy xuất sẽ rơi tự do (Disk I/O Bottleneck) và Page Cache bị cày nát (Thrashing).

**Cách khắc phục:**
1. Giảm số chiều vector gốc (Dimensionality Reduction) bằng các mô hình nhúng nén như `text-embedding-3-small` (giảm từ 1536 xuống 512 hoặc 256 chiều) kết hợp với thuật toán Matryoshka.
2. Áp dụng cơ chế **Scalar Quantization (SQ)** hoặc chuyển hẳn sang **IVF-PQ** nếu chấp nhận hi sinh một ít Recall.

### 3.2. Cơn ác mộng Lọc Metadata (Metadata Filtering)

Tìm kiếm vector không tồn tại độc lập. User luôn yêu cầu: *"Tìm các giao dịch gian lận (Vector Similarity) thuộc năm 2024 và ở Việt Nam (Metadata Filter)"*. 

Việc kết hợp Index Vector và Index RDBMS truyền thống (B-Tree) gây ra đau đầu kiến trúc:
- **Post-filtering (Lọc sau):** Hệ thống tìm Top-100 vector gần nhất (ANN), sau đó lọc bỏ các vector không thỏa mãn Metadata. 
  - *Rủi ro:* Nếu Metadata mang tính loại trừ cao (ví dụ: UserID cụ thể), sau khi lọc có thể trả về **0 kết quả**, dẫn đến Recall = 0.
- **Pre-filtering (Lọc trước):** Lọc B-Tree trước để lấy các dòng thỏa mãn, sau đó chạy ANN trên tập kết quả đó.
  - *Rủi ro:* Làm hỏng cấu trúc đồ thị HNSW. Đồ thị không thể đi tắt vì các Node bị ẩn đi ngẫu nhiên.
- **Single-Stage Filtering (Lọc kết hợp):** Các Vector DB Native (như Qdrant, Milvus) giải quyết bằng cách áp dụng bộ lọc trực tiếp trong quá trình duyệt đồ thị (In-filter traversal). Đây là lợi thế tuyệt đối của các Native Vector DB so với các Extension chắp vá.

### 3.3. Hybrid Search và RRF (Reciprocal Rank Fusion)

Vector Search (Dense retrieval) rất kém trong việc tìm kiếm đối khớp chuỗi chính xác (như Mã sản phẩm "IP15-PRM-256G", ID hóa đơn, Tên riêng).

Để khắc phục, các kiến trúc hiện đại triển khai **Hybrid Search**: Chạy song song Vector Search và Full-text Search (BM25 / Keyword - Sparse retrieval).

```python
# Pseudo-logic của RRF (Reciprocal Rank Fusion)
def rrf_score(rank_vector, rank_bm25, k=60):
    return (1 / (k + rank_vector)) + (1 / (k + rank_bm25))
```
Kết quả từ 2 luồng sẽ được hợp nhất (Fusion) dựa trên thứ hạng (Rank) thay vì điểm số thô (Score), bởi vì khoảng cách Cosine và điểm BM25 không cùng thang đo (scale).

---

## 4. Tổng kết

Việc chọn một Vector Database không phải là đếm số sao (stars) trên GitHub, mà là bài toán thiết kế hệ thống nghiêm túc:
1. Đang dùng Postgres và dữ liệu < 10M vector? Cài `pgvector` ngay lập tức để tiết kiệm chi phí vận hành hạ tầng riêng.
2. Dữ liệu trăm triệu vector và cần tốc độ Real-time? Nhìn vào **Milvus** hoặc **Qdrant**.
3. Muốn Index trên Data Lake với chi phí cực rẻ (Serverless/S3)? Hãy nghiên cứu định dạng mã nguồn mở **Lance (LanceDB)**.

Một Staff Data Engineer sẽ không nhìn Vector DB như một "Chiếc hộp ma thuật AI", mà hiểu rõ nó là một Cấu trúc dữ liệu trên RAM. Hãy cân bằng kích thước (Dimension), thuật toán Index (HNSW/IVF), và Chiến lược lọc (Filtering) để không đốt tiền Cloud một cách vô nghĩa.

## Nguồn Tham Khảo (References)
* [HNSW (Hierarchical Navigable Small World) Algorithm Research Paper](https://arxiv.org/abs/1610.02415) - Nền tảng cốt lõi của Graph-based ANN.
* [Billion-scale similarity search with GPUs](https://arxiv.org/abs/1702.08734) - FAISS và thuật toán IVF-PQ.
* [Pinecone: Vector Search & HNSW Indexing](https://www.pinecone.io/learn/series/faiss/hnsw/)
* [Milvus Architecture](https://milvus.io/docs/architecture_overview.md)
* [pgvector - Open-source vector similarity search for Postgres](https://github.com/pgvector/pgvector)
