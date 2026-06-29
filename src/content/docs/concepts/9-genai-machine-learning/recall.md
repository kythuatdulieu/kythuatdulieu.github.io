---
title: "Độ phủ - Recall & Precision trong RAG"
difficulty: "Advanced"
tags: ["recall", "precision", "f1-score", "rag", "hnsw", "hybrid-search", "metrics", "finops"]
readingTime: "15 mins"
lastUpdated: 2026-06-29
seoTitle: "Độ phủ (Recall) và Precision trong RAG: Kiến trúc 2-Stage Retrieval"
metaDescription: "Phân tích chuyên sâu về Recall, Precision, F1-Score và Recall@K từ góc độ Data Engineer. Kiến trúc HNSW, Hybrid Search, Reranking và rủi ro vận hành OOMKilled."
description: "Trong hệ thống RAG (Retrieval-Augmented Generation) và Information Retrieval, Recall không chỉ là một chỉ số Toán học. Nó định hình toàn bộ kiến trúc Candidate Generation, quyết định chi phí (FinOps) và gây ra các sự cố hệ thống như Latency Spike."
---

Khi thiết kế hệ thống truy xuất thông tin (Information Retrieval - IR) hoặc RAG (Retrieval-Augmented Generation) ở quy mô Production hàng triệu tài liệu, Data Engineer không nhìn **Recall (Độ phủ)** và **Precision (Độ chính xác)** đơn thuần qua lăng kính ma trận nhầm lẫn (Confusion Matrix). Chúng ta nhìn nó dưới góc độ thiết kế hệ thống: **Sự đánh đổi khốc liệt giữa Băng thông xử lý (Throughput), Độ trễ (Latency), và Chi phí Token (FinOps).**

Bài viết này mổ xẻ cách Recall, Precision chi phối các quyết định thiết kế kiến trúc RAG, sự đánh đổi trong thuật toán HNSW, và cách xử lý sự cố vận hành.

---

## 1. Định nghĩa Cốt lõi: Precision, Recall và F1-Score

Trong một hệ thống truy xuất, các chỉ số này đại diện cho sự giằng co về mặt tài nguyên và chất lượng:

*   **Precision (Độ chính xác):** Tỷ lệ tài liệu thực sự liên quan trong tổng số tài liệu mà hệ thống vừa truy xuất được. Nó đo lường sự "tinh khiết" của kết quả.
    *   $\text{"Precision"} = \frac{"\text{True Positives"}}{\text{"True Positives"} + \text{"False Positives"}}$
    *   *System implication:* Precision thấp nghĩa là hệ thống đang "bơm rác" (Noise) vào LLM. Điều này gây ra hiệu ứng Context Dilution (loãng ngữ cảnh), tăng nguy cơ "Lost in the middle", và đội chi phí Token API lên gấp nhiều lần.
*   **Recall (Độ phủ):** Tỷ lệ tài liệu liên quan mà hệ thống quét và trả về được trên *tổng số tài liệu liên quan thực sự tồn tại* trong Database. Nó đo lường khả năng "mò kim đáy bể".
    *   $\text{"Recall"} = \frac{"\text{True Positives"}}{\text{"True Positives"} + \text{"False Negatives"}}$
    *   *System implication:* Recall thấp nghĩa là hệ thống bị "mù thông tin" (Information Blindness). Để LLM không bị ảo giác (Hallucination) vì thiếu thông tin, bạn phải kéo Recall lên bằng cách quét rộng hơn.
*   **F1-Score:** Là trung bình điều hòa (Harmonic Mean) của Precision và Recall, giúp đánh giá một hệ thống cân bằng, tránh trường hợp lệch pha (Recall 99% nhưng Precision 1%).
    *   $\text{"F1-Score"} = 2 \times \frac{"\text{Precision"} \times \text{"Recall"}}{\text{"Precision"} + \text{"Recall"}}$

### Recall@K - Thước đo sống còn của RAG
Trong RAG, chúng ta hiếm khi quan tâm đến toàn bộ danh sách kết quả (Ví dụ: vị trí thứ 1000). LLM bị giới hạn bởi Context Window. Do đó, ta dùng **Recall@K**.
- Nếu truy vấn có 10 tài liệu liên quan thực sự, và hệ thống trả về 5 tài liệu liên quan trong **top 20** kết quả đầu tiên, thì **Recall@20 = 0.5**. Chỉ số này quyết định xem LLM có đủ "vũ khí" để trả lời người dùng hay không.

---

## 2. Candidate Generation và Đánh đổi trong Thuật toán HNSW

Trong hệ thống lớn [Hàng tỷ Vectors], việc quét rà soát toàn bộ dữ liệu (Brute Force KNN) để tìm Recall hoàn hảo là không thể (thời gian $O(N)$). Hệ thống dùng phương pháp **Candidate Generation** (Tạo tập ứng viên) thông qua thuật toán ANN (Approximate Nearest Neighbor), nổi tiếng nhất là **HNSW (Hierarchical Navigable Small World)**.

HNSW xây dựng một đồ thị đa tầng (multi-layered graph) của các Vector Embeddings. Tầng trên cùng rất thưa thớt (Sparse) để định hướng nhanh, tầng dưới cùng dày đặc (Dense) để tìm chính xác. HNSW tìm kiếm trong thời gian $O(\log N)$.

Tuy nhiên, nó là thuật toán *gần đúng (Approximate)*. Data Engineer phải tinh chỉnh tham số `ef_search` (Số lượng ứng viên duyệt qua khi search):
- **Tăng `ef_search`:** Recall@K tăng mạnh, nhưng Latency tăng và RAM bị đốt cháy (Do phải giữ nhiều node trong bộ nhớ).
- **Giảm `ef_search`:** Latency giảm (Rất nhanh), nhưng Recall@K rớt thê thảm, hệ thống bỏ sót dữ liệu quan trọng.

---

## 3. Kiến trúc Thực thi Vật lý: 2-Stage Retrieval (Hybrid Search + Reranking)

Để phá vỡ giới hạn Trade-off giữa Recall và Precision, các hệ thống RAG Enterprise (Databricks, Netflix, Pinecone) áp dụng kiến trúc **2-Stage Retrieval** (Truy xuất hai giai đoạn).

![Hybrid Search Architecture](/images/9-genai-machine-learning/hybrid-search-architecture.png]
*(Minh họa: Kiến trúc Hybrid Search và Reranking đẩy kịch trần Recall và Precision. Nguồn ảnh: Sanity/Pinecone)*

### Giai đoạn 1: Maximizing Recall với Hybrid Search (Candidate Generation)
Tại tầng Vector Database (Milvus, Qdrant, Elasticsearch), chạy song song 2 engine để kéo lưới rộng nhất có thể:
- **Dense Vector Search (HNSW):** Bắt ngữ nghĩa (Semantic) -> Tối ưu Recall cho câu hỏi trừu tượng.
- **Sparse Keyword Search (BM25):** Bắt từ khóa chính xác (Lexical) -> Tối ưu Recall/Precision cho mã lỗi, tên riêng, SKU.

```python
# Thực thi Hybrid Search trên Qdrant để tối đa hóa Recall
from qdrant_client import QdrantClient
from qdrant_client.models import Prefetch, QueryRequest

client = QdrantClient(url="http://localhost:6333")

# Bước 1: Fetch lượng lớn candidates (high recall)
query_request = QueryRequest(
    prefetch=[
        Prefetch(
            query=bm25_query_vector, 
            using="sparse", 
            limit=100 # Kéo rộng lưới BM25
        ),
        Prefetch(
            query=dense_query_vector, 
            using="dense", 
            limit=100 # Kéo rộng lưới HNSW
        ),
    ],
    query="rrf", # Reciprocal Rank Fusion gộp điểm
    limit=50 # Trả về 50 ứng viên (Recall cao, Precision cực thấp)
)

results = client.query_points("rag_collection", query_request)
```

### Giai đoạn 2: Maximizing Precision với Cross-Encoder Reranker
Lấy 50 ứng viên (candidates) đầy rác (Noise) từ Giai đoạn 1, đưa qua Cross-Encoder model (như `cohere/rerank-v3` hoặc `bge-reranker-v2-m3`). Cross-Encoder rất nặng (Compute-intensive $\mathcal{"O"}(N^2)$), nhưng vì chỉ tính trên đúng 50 chunks, hệ thống đảm bảo được Latency dưới 100ms. Kết quả trả ra 5 chunks tinh khiết nhất (Precision ~ 99%) để nhồi vào LLM.

---

## 4. Rủi ro Vận hành (Operational Risks) & Khắc phục

Việc cấu hình hệ thống tham lam Recall hoặc Precision có thể dẫn đến sự cố sập nguồn (Outage).

### Incident 1: VectorDB OOMKilled do Tham Lam Recall (`ef_search`)
*   **Triệu chứng:** Khi Data Scientists cố gắng đẩy Recall@K lên 95%, họ set `ef_search = 1000`. Khi có Spike Traffic (Bão user truy cập), hàng nghìn concurrent queries đồng loạt đẩy RAM của Qdrant/Milvus phình to đột biến, dẫn đến Kernel Linux bắn tín hiệu `SIGKILL` (OOMKilled).
*   **Khắc phục:** Giới hạn cứng `ef_search` ở cấp độ Cluster (Guardrails), áp dụng API Rate Limiting, hoặc chuyển sang dùng DiskANN (Spill-to-disk) thay vì HNSW in-memory nếu dùng SSD NVMe.

```yaml
# Cấu hình HNSW Guardrails trong qdrant_config.yaml để tránh OOM
hnsw_index:
  m: 16                           # Mức độ kết nối graph vừa phải
  ef_construct: 100               # Build index chậm nhưng chất lượng cao
  full_scan_threshold: 10000      # Nếu filter query < 10k items, full scan nhanh hơn duyệt Graph
  max_elements_per_segment: 200000
```

### Incident 2: Context Dilution & Cháy Túi API (FinOps Alert)
*   **Triệu chứng:** Nếu bạn cấu hình bỏ qua Giai đoạn 2 (Reranking) mà bơm thẳng `top_k = 20` chunk (High Recall, Low Precision) từ VectorDB vào LLM. Mỗi chunk 500 tokens -> Context prompt dài 10,000 tokens. Hóa đơn API GPT-4 phình to 10 lần vào cuối tháng, và LLM bị phân tâm (Context Dilution), sinh ra câu trả lời ảo giác (Hallucination).
*   **Khắc phục:** Áp dụng **Metadata Pre-filtering** ngay tại VectorDB để diệt rác từ trứng nước.

```json
// Elasticsearch query config - Pre-filtering to boost precision safely
{
  "knn": {
    "field": "content_vector",
    "query_vector": [0.1, -0.2, ...],
    "k": 5,
    "num_candidates": 50,
    "filter": {
      "bool": {
        "must": [
          { "term": { "doc_type": "technical_spec" } },
          { "range": { "publish_year": { "gte": 2024 } } }
        ]
      }
    }
  }
}
```

---

## 5. Tóm tắt Tiêu chuẩn Thiết kế (Design Principles)

1. **Đừng phụ thuộc vào LLM để lọc rác:** LLM sinh ra để suy luận (Reasoning), không phải bộ lọc nhiễu. Hãy tối ưu **Precision** ở tầng Reranking (Cross-Encoder) trước khi dữ liệu chạm đến LLM.
2. **Recall nằm ở Ingestion, không chỉ ở Query:** Nếu Data Pipeline có Chunking Strategy sai, hoặc thiếu Metadata enrichment lúc Ingestion, thì thuật toán HNSW xịn đến mấy cũng không cứu được Recall. Dữ liệu rác vào thì rác ra (Garbage In, Garbage Out).
3. **Giám sát Token/Query (FinOps):** Nếu lượng Token per Query tăng đột biến mà CSAT (Customer Satisfaction) không tăng, hệ thống của bạn đang bị "béo phì" do cố nhồi Recall dư thừa. Cần tinh chỉnh lại ngưỡng Similarity Threshold và Reranking.

---

## Nguồn Tham Khảo [References]

*   **Pinecone:** [Precision and Recall in Information Retrieval & RAG][https://www.pinecone.io/learn/offline-evaluation/]
*   **Milvus Engineering:** [Hybrid Search and Reranking for better RAG][https://milvus.io/docs/multi-vector-search.md]
*   **Elasticsearch Docs:** [kNN search, HNSW and exact filtering][https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html]
*   **IBM Research:** [What is Candidate Generation?](https://www.ibm.com/topics/candidate-generation]
*   *Designing Data-Intensive Applications* (Martin Kleppmann) - Phân tích về Trade-offs trong lưu trữ và truy vấn thông tin.
