---
title: "Mô hình nhúng - Embedding Models ở quy mô Production"
difficulty: "Advanced"
tags: ["embedding-model", "system-design", "bi-encoder", "mrl", "finops", "vector-db"]
readingTime: "20 mins"
lastUpdated: 2026-06-26
seoTitle: "Kiến trúc hệ thống Embedding Models, Bi-Encoder, MRL và Trade-offs"
metaDescription: "Đi sâu vào System Design của Embedding Models ở quy mô Production: Two-Tower architecture, Bi-Encoder vs Cross-Encoder, Matryoshka Representation Learning (MRL), và sự cố OOM."
description: "Dành cho Data/ML Engineer: Tìm hiểu cách thiết kế, vận hành, và tối ưu hệ thống Nhúng (Embedding) cho Semantic Search & RAG với hàng tỷ vectors."
---

Embedding Model không chỉ đơn thuần là một "hộp đen" gọi API. Trong các hệ thống lớn (như Uber, Netflix, Amazon), nó là một thành tố cốt lõi trong hạ tầng dữ liệu, ảnh hưởng trực tiếp đến Compute Cost, Storage (Vector Database) và Latency của toàn bộ hệ thống Search/Recommendation. Bài viết này sẽ mổ xẻ Embedding Model dưới góc nhìn kỹ thuật hệ thống (System Engineering) thay vì chỉ lý thuyết Machine Learning thông thường.

---

## 1. Kiến trúc Hệ thống: Bi-Encoder vs Cross-Encoder (Two-Tower Architecture)

Trong các bài toán Retrieval (Truy xuất) quy mô lớn, chúng ta luôn phải đối mặt với **độ trễ (Latency)** và **khả năng mở rộng (Scalability)**. Lựa chọn kiến trúc mạng Neural quyết định sự thành bại của hệ thống.

### 1.1. Bi-Encoder (Two-Tower Model)

Được ứng dụng rộng rãi tại các hệ thống như Uber Eats (Search) hay Netflix (Recommendation), **Two-Tower Architecture** (Bi-Encoder) chia tách việc xử lý Query và Document thành hai luồng hoàn toàn độc lập.

```mermaid
graph TD
    subgraph Query_Tower["Online Execution - Real-time"]
        Q["User Query / Context"] --> Q_Enc("Query Encoder<br/>Transformer")
        Q_Enc --> U_Vec("(Vector U<br/>Dense Embedding"))
    end

    subgraph Document_Tower["Offline Execution - Batching"]
        D["Product / Document"] --> D_Enc("Document Encoder<br/>Transformer")
        D_Enc --> V_Vec("(Vector V<br/>Dense Embedding"))
    end

    V_Vec -.->|Pre-computed & Ingested| VDB["(Vector Database<br/>Milvus / Qdrant)"]
    
    U_Vec --> Dot["Dot Product / Cosine Similarity"]
    VDB --> Dot
    Dot --> Score["Relevance Score"]
```

**Phân tích Kiến trúc:**
- **Offline Batching (Document Tower):** Các embeddings của hàng triệu tài liệu (Item/Document) được tính toán trước (pre-computed) thông qua các job Spark hoặc Airflow, sau đó Ingest (nạp) vào Vector Database.
- **Online Real-time (Query Tower):** Khi user gõ tìm kiếm, hệ thống chỉ cần tính toán Vector cho Query đó mất vài mili-giây ($\mathcal{O}(1)$), sau đó dùng thuật toán Approximate Nearest Neighbor (ANN) như HNSW trên Vector DB để tìm các Document gần nhất.
- **Trade-off:**
  - **Lợi thế:** High Throughput, Low Latency.
  - **Điểm yếu:** Lower Accuracy. Do mô hình không thể thấy tương tác (cross-attention) giữa từ trong Query và từ trong Document (ví dụ sự liên kết giữa cụm từ "giày chạy" và "đế giảm chấn").

### 1.2. Cross-Encoder

Khác với Bi-Encoder, Cross-Encoder nối (concatenate) thẳng Query và Document lại thành một chuỗi dài và cho đi qua toàn bộ các lớp Transformer (Attention cơ chế self-attention áp dụng lên toàn bộ chuỗi).

```mermaid
graph TD
    Input["Query + '[SEP"]' + Document] --> M("Transformer Layers<br/>with Cross-Attention")
    M --> Cls["Classification Head"]
    Cls --> Score["Relevance Score: 0.95"]
```

**Phân tích Kiến trúc:**
- **Không thể Pre-compute:** Bạn không thể sinh sẵn vector cho Document, vì kết quả phụ thuộc chặt chẽ vào Query cụ thể tại thời điểm chạy.
- **Trade-off:**
  - **Lợi thế:** High Accuracy (Độ chuẩn xác tuyệt đối cao nhất do nắm bắt được ngữ cảnh chéo tinh vi).
  - **Điểm yếu:** Compute-bound & High Latency. Cực kỳ hao tốn GPU. Thời gian chạy là $\mathcal{O}(N)$ với N là số lượng Document muốn so sánh. 

### 1.3. The Standard Pipeline: Retrieval & Reranking

Trong thực tế production, chúng ta **ghép nối** cả hai mô hình trên để bù đắp Trade-off:

1. **Lớp Lọc thô (Retrieval - Bi-Encoder):** Quét 1 tỷ tài liệu trong Vector DB lấy ra Top 1,000 (Độ trễ ~50ms).
2. **Lớp Tinh chỉnh (Reranker - Cross-Encoder):** Lấy Top 1,000 đó chạy qua Cross-Encoder để chấm điểm chi tiết và lấy ra Top 10 trả về cho LLM hoặc User (Độ trễ ~100-200ms trên GPU).

---

## 2. Huấn Luyện ở Quy mô Lớn: Contrastive Learning & Hard Negatives

Để Bi-Encoder có được vector đủ tốt, quá trình huấn luyện sử dụng phương pháp **Contrastive Learning (Học đối chiếu)** kết hợp hàm **InfoNCE Loss**. Mục tiêu: kéo gần (Positive Pairs) và đẩy xa (Negative Pairs) trong không gian n-chiều.

Một hệ thống sẽ dễ dàng gục ngã trước lỗi "Ảo giác từ khóa" nếu chỉ dùng Random Negatives (Lấy bừa các tài liệu ngẫu nhiên làm mẫu sai). Tại các Big Tech, kỹ sư ML sử dụng **Hard Negatives**.

*   **Positive:** (Query: "Lỗi kết nối database", Doc: "Hướng dẫn cấu hình connection pool HikariCP.")
*   **Hard Negative:** "Cách cài đặt database PostgreSQL trên Ubuntu." (Có chung từ khóa 'database', 'kết nối' nhưng sai context hoàn toàn).

Việc ép mô hình "nhả" điểm thấp cho các Hard Negatives giúp không gian vector không bị suy biến (collapse) thành một cỗ máy đếm từ (BoW).

---

## 3. Rủi ro Vận hành (Operational Risks)

Kỹ sư Dữ liệu phải đối mặt với các vấn đề vật lý nghiêm trọng khi triển khai Embeddings.

### 3.1. Sự cố OOM (Out-of-Memory) khi Batch Ingestion

Trong hệ thống RAG, khi bạn cần re-embed (nhúng lại) toàn bộ dữ liệu lịch sử (10 triệu records) vào Vector DB do mô hình nâng cấp (version drift), nếu nạp tất cả vào RAM và gửi lên API, hệ thống sẽ chết vì **JVM/Python OOMKilled**.

**Cách khắc phục:** Sử dụng Python Generators và Chunking size hợp lý. Cần xử lý cẩn thận Rate Limits của API (ví dụ OpenAI: Tokens per Minute - TPM).

```python
import itertools
from typing import List, Iterable
import openai

def chunked_iterable(iterable: Iterable, size: int) -> Iterable:
    """Chia nhỏ luồng dữ liệu mà không nạp toàn bộ vào RAM (Chống OOM)."""
    it = iter(iterable)
    while True:
        chunk = tuple(itertools.islice(it, size))
        if not chunk:
            break
        yield chunk

def batch_embed_documents(doc_stream: Iterable[str], batch_size: int = 500):
    client = openai.Client()
    
    # Xử lý theo luồng (streaming)
    for chunk in chunked_iterable(doc_stream, batch_size):
        try:
            # Batch call API giảm I/O overhead & Latency
            response = client.embeddings.create(
                input=chunk,
                model="text-embedding-3-large"
            )
            
            vectors = [data.embedding for data in response.data]
            
            # TODO: bulk-insert vào Milvus hoặc Qdrant
            yield vectors
            
        except openai.RateLimitError as e:
            # Xử lý Retry Storms (Exponential Backoff) ở đây
            print(f"Rate limited! Cần backoff: {e}")
```

### 3.2. Vector Stale (Dữ liệu nhúng "ôi thiu")
- Khi thay đổi từ `text-embedding-ada-002` sang `text-embedding-3-large`, toàn bộ không gian toán học (Latent space) thay đổi hoàn toàn. 
- **Incident phổ biến:** Frontend bắt đầu gọi model mới, trong khi Backend Vector DB vẫn chứa embeddings của model cũ. Kết quả Cosine Similarity trả về hoàn toàn vô nghĩa.
- **Giải pháp:** Sử dụng mô hình Blue/Green Deployment cho Vector Database Collections. Tạo một Collection mới, run Batch Pipeline (ví dụ Spark) để nạp toàn bộ vector từ model mới, sau đó chuyển lượng truy cập (traffic) sang.

---

## 4. Tối ưu Chi phí (FinOps): Storage Cost & Matryoshka Representation

### 4.1. The Curse of Dimensionality trong Vector DB

Số chiều của Vector ảnh hưởng tuyến tính tới chi phí RAM. 
Giả sử có 1 tỷ Document, lưu trữ vector `text-embedding-3-large` (3072 dimensions, kiểu float32 - 4 bytes/dimension):
- Kích thước 1 Vector = 3072 * 4 = 12 KB.
- Kích thước 1 tỷ Vector = 12 TB. 
- Để tìm kiếm ANN (HNSW) hiệu quả, phần lớn Vector hoặc Index phải nằm trên Memory (RAM). Chi phí thuê EC2 Instances (như dòng r6id hoặc x2iedn trên AWS) để chứa 12 TB RAM là khổng lồ (FinOps Alert!).

### 4.2. Matryoshka Representation Learning (MRL)

Để giảm thiểu chi phí trên, công nghệ **MRL (Búp bê Nga)** ra đời (áp dụng trên OpenAI `text-embedding-3` hoặc Nomic-embed). MRL cho phép "chặt cụt" (truncate) độ dài của Vector từ 3072 xuống 1024, 512, hoặc thậm chí 256 chiều mà vẫn giữ lại được tới 95% chất lượng ngữ nghĩa.

Hệ thống được huấn luyện sao cho các thông tin quan trọng nhất hội tụ ở các chiều (dimensions) đầu tiên.

```terraform
# Ví dụ Terraform cấu hình Qdrant Vector DB (Self-hosted trên K8s) 
# Tối ưu kích thước lưu trữ bằng MRL (chỉ dùng 512 dimensions thay vì 3072)
resource "kubernetes_manifest" "qdrant_collection" {
  manifest = {
    apiVersion = "qdrant.io/v1alpha1"
    kind       = "QdrantCollection"
    metadata = {
      name = "enterprise_knowledge_base"
    }
    spec = {
      vectors = {
        size     = 512          # FinOps: Giảm RAM cost bằng cách dùng MRL
        distance = "Cosine"     
      }
      optimizers_config = {
        # Kích hoạt Quantization (Ví dụ: Scalar/Product Quantization)
        # Giảm thêm kích thước lưu trữ (từ float32 xuống int8)
        default_segment_number = 4
      }
    }
  }
}
```

**Systemic Trade-off trong FinOps:**
- **Self-hosting (BGE-m3, E5):** Tiết kiệm OPEX API, dữ liệu không rời khỏi VPC (Security Compliance), nhưng tốn kém chi phí cố định (EC2 GPUs), vận hành MLOps phức tạp.
- **Managed API (OpenAI, Cohere):** Dễ dàng scaling, không tốn công quản trị, nhưng tiềm ẩn rủi ro lộ lọt dữ liệu (Data Exfiltration) và chi phí tăng đột biến khi lượng Ingestion bùng nổ.

---

## 5. Nguồn Tham Khảo (References)

* [Uber Engineering: Evolution of Two-Tower Architecture in Uber Eats](https://www.uber.com/en-VN/blog/two-tower-model-in-uber-eats/)
* [Netflix Tech Blog: MediaFM - A Tri-Modal Foundation Model](https://netflixtechblog.com/)
* [AWS Architecture Blog: Architecting RAG Systems on Bedrock](https://aws.amazon.com/blogs/architecture/)
* [Matryoshka Representation Learning (MRL) - Research Paper (arXiv:2205.13147)](https://arxiv.org/abs/2205.13147)
* [Massive Text Embedding Benchmark (MTEB) Leaderboard](https://huggingface.co/spaces/mteb/leaderboard)
