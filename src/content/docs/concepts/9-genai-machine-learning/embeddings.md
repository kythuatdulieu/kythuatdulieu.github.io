---
title: "Vector Embeddings & Vector Databases: Kiến trúc Hệ thống"
difficulty: "Advanced"
tags: ["embeddings", "vector-database", "hnsw", "ivf-pq", "rag", "system-design", "finops"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Thiết kế hệ thống Vector Embeddings & Vector Databases"
metaDescription: "Phân tích sâu về kiến trúc hệ thống Vector Embeddings, cơ chế HNSW vs IVF, tối ưu chi phí FinOps và đánh đổi hệ thống (Trade-offs) trong Vector Database."
description: "Vượt qua các định nghĩa cơ bản, bài viết này đi sâu vào cách lưu trữ, chỉ mục hóa và truy vấn hàng tỷ vector ở quy mô Enterprise, phân tích sự đánh đổi giữa Latency vs Recall và tối ưu FinOps."
---

Thay vì lặp lại những khái niệm sách giáo khoa về việc Vector Embeddings giúp máy tính hiểu ngữ nghĩa như thế nào, chương này sẽ nhắm thẳng vào bài toán thiết kế hệ thống (System Design). 

Khi bạn phải xử lý 100 triệu document embeddings cho một ứng dụng RAG (Retrieval-Augmented Generation) cấp Enterprise, câu hỏi không còn là "Embedding là gì?", mà là: **Làm sao để truy vấn chúng dưới 50ms (Low Latency), hệ thống không bị tràn RAM (OOM), và chi phí cơ sở hạ tầng (FinOps) không làm phá sản dự án?**

---

## 1. Kiến trúc Biểu diễn Dữ liệu (Representation Architecture)

Trong hệ thống thực chiến, Embeddings không chỉ đơn thuần là mảng số. Chúng được tối ưu hóa khắt khe ở tầng tính toán. 

Thay vì push từng câu (sentence) qua Embedding Model (gây thắt cổ chai I/O và lãng phí GPU), hệ thống Data Ingestion luôn phải dùng **Batching**. Dưới đây là đoạn code thực chiến sử dụng Python Generators để chunk dữ liệu và sinh vector nhằm chống tràn RAM (OOMKilled) khi xử lý tập dữ liệu khổng lồ:

```python
from sentence_transformers import SentenceTransformer
from typing import Iterator, List
import numpy as np

# Load model vào bộ nhớ (GPU nếu có)
model = SentenceTransformer('all-MiniLM-L6-v2')

def batch_generator(data: List[str], batch_size: int) -> Iterator[List[str]]:
    """Generator chia nhỏ dữ liệu thành các batch để tránh OOM."""
    for i in range(0, len(data), batch_size):
        yield data[i:i + batch_size]

def ingest_embeddings(large_corpus: List[str]):
    # Tối ưu: Batch size phụ thuộc vào VRAM của GPU. 
    # Ví dụ: 32, 64 hoặc 128. Quá lớn -> OOM; quá nhỏ -> Low Throughput.
    BATCH_SIZE = 128
    
    for batch in batch_generator(large_corpus, BATCH_SIZE):
        # normalize_embeddings=True rất quan trọng để dùng Dot Product thay vì Cosine (tăng tốc độ tính toán CPU)
        embeddings = model.encode(batch, normalize_embeddings=True)
        
        # Ghi embeddings vào Vector DB hoặc Parquet files
        # pseudo_vector_db.upsert(embeddings)
        pass
```

### Tại sao lại Normalize Embeddings?
Nếu các vector được chuẩn hóa về độ dài bằng 1 (L2 Normalization), phép tính Cosine Similarity (đòi hỏi phép chia phức tạp) sẽ hoàn toàn tương đương với **Dot Product** (Tích vô hướng - chỉ gồm phép nhân và cộng). Điều này giúp các phép toán ma trận ở tầng cứng (AVX-512 hoặc Tensor Cores) chạy cực kỳ nhanh.

---

## 2. Core Indexing Algorithms (HNSW vs IVF-PQ)

Lưu trữ vector vào Database là một chuyện, nhưng duyệt qua hàng tỷ vector bằng thuật toán K-Nearest Neighbors (KNN) chính xác 100% (Exhaustive Search) sẽ kéo Latency lên hàng giây hoặc phút. 

Đó là lý do các Vector DBs (như Milvus, Qdrant, Pinecone, pgvector) sử dụng các thuật toán **Approximate Nearest Neighbor (ANN)**. Hai kiến trúc thống trị hiện nay là **HNSW** và **IVF-PQ**.

### 2.1. HNSW (Hierarchical Navigable Small World)

HNSW là thuật toán dạng đồ thị (Graph-based). Nó xây dựng nhiều lớp (layers) đồ thị, trong đó:
- **Tầng trên cùng** rất thưa thớt (chứa ít node), đóng vai trò như các "đường cao tốc" (Expressways).
- **Tầng dưới cùng** dày đặc, chứa toàn bộ vector.

Thuật toán duyệt tìm (Greedy Search) bắt đầu từ tầng cao nhất để "nhảy" một khoảng cách lớn về gần khu vực chứa vector truy vấn, sau đó đi dần xuống các tầng thấp hơn để tinh chỉnh độ chính xác.

![Cấu trúc đa tầng của HNSW](/images/9-genai-machine-learning/hnsw-diagram.png)
*(Minh họa cấu trúc đồ thị đa tầng của thuật toán HNSW - Nguồn: Premai)*

**Các tham số cốt lõi (Cấu hình Index):**
- `M`: Số lượng liên kết tối đa của một node ở mỗi tầng. `M` lớn -> Độ chính xác (Recall) tăng, nhưng tốn cực nhiều RAM và build index chậm.
- `ef_construction`: Kích thước của danh sách ứng viên (candidate list) khi xây dựng đồ thị.

### 2.2. IVF-PQ (Inverted File Index with Product Quantization)

Thay vì dùng đồ thị tốn RAM, IVF chia không gian vector thành các cụm (Voronoi Cells) thông qua K-Means. Khi truy vấn đến, hệ thống chỉ so sánh vector truy vấn với các tâm cụm (Centroids), sau đó đi vào `nprobe` cụm gần nhất để quét.

Để ép dữ liệu vào RAM, hệ thống dùng **Product Quantization (PQ)**: Cắt vector (ví dụ 768 chiều) thành các sub-vectors (ví dụ 8 đoạn, mỗi đoạn 96 chiều), sau đó thay thế mỗi đoạn bằng ID của "mẫu" gần nhất trong một từ điển (Codebook). Điều này nén dung lượng vector xuống từ 10x đến 40x.

---

## 3. Đánh đổi Hệ thống (Systemic Trade-offs)

Lựa chọn giữa HNSW và IVF-PQ là bài toán đánh đổi kinh điển của Kỹ sư Dữ liệu.

| Tiêu chí | HNSW | IVF-PQ |
| :--- | :--- | :--- |
| **Latency (Độ trễ)** | Cực thấp (< 10ms). Rất nhanh. | Trung bình, phụ thuộc vào `nprobe`. |
| **Recall (Độ chính xác)** | Rất cao (> 95%). | Có thể bị giảm do Quantization (lossy). |
| **Memory Cost (FinOps)** | **Cực cao**. Toàn bộ đồ thị phải nằm trên RAM (DRAM). Không có PQ -> đắt đỏ. | Rất thấp. Nén mạnh mẽ, cực kỳ thân thiện với chi phí. |
| **Data Volatility** | Hỗ trợ cập nhật, thêm mới liên tục mà không cần rebuild lại toàn bộ đồ thị. | Khi dữ liệu thay đổi quá nhiều, bắt buộc phải Re-clustering lại (đắt đỏ về Compute). |

**Kết luận thực chiến:**
- Dùng **HNSW** nếu dữ liệu của bạn ở mức vừa phải (< 50 triệu vector), yêu cầu Real-time, cần Recall hoàn hảo, và bạn có ngân sách trả tiền RAM.
- Dùng **IVF-PQ** nếu bạn vận hành hàng tỷ vector (Billion-scale), dữ liệu ít bị update (Batch ingestion), và tối ưu chi phí (FinOps) là ưu tiên số một.

---

## 4. Rủi ro Vận hành (Operational Risks & Incidents)

Trong thực tế, bạn không bao giờ chỉ query vector. Bạn luôn kết hợp nó với Metadata Filtering (Ví dụ: *Tìm tài liệu giống câu hỏi này nhất, NHƯNG chỉ trong phạm vi `tenant_id = 123` và `status = 'ACTIVE'`*).

### Sự cố 1: Post-filtering phá vỡ Recall
Nếu bạn dùng HNSW để lấy ra top 100 vector gần nhất, SAU ĐÓ mới dùng bộ lọc SQL truyền thống loại bỏ các vector không thỏa mãn `tenant_id`. Kết quả: Bạn có thể lọc sạch sành sanh top 100 đó và trả về 0 kết quả (mặc dù trong DB vẫn có vector thỏa mãn).
**Cách khắc phục:** Hệ thống hiện đại phải hỗ trợ **Single-Stage Filtering** (Pre-filtering trực tiếp ngay bên trong luồng duyệt của HNSW graph). Các CSDL như Qdrant hay Milvus xử lý rất tốt việc này bằng bitset logic.

### Sự cố 2: JVM OOMKilled (Out of Memory)
Elasticsearch cấu hình vector nhúng đôi khi sẽ đánh sập Cluster vì vector lưu trên off-heap memory hoặc ngốn sạch heap space khi tính toán HNSW graphs. 
**Cách khắc phục:** Monitor chỉ số bộ nhớ khắt khe, limit kích thước HNSW graph, hoặc cấu hình spill-to-disk (chấp nhận Latency cao qua Disk I/O bằng SSD NVMe như cách giải quyết của DiskANN).

---

## 5. Tối ưu Chi phí (FinOps) cho Vector Database

Để không gặp "Bill Shock", các Data Engineer cần nắm rõ tỷ lệ **QIR (Query-to-Ingestion Ratio)**.

1. **Dimensionality Reduction (Giảm chiều dữ liệu):**
   Mô hình `text-embedding-3-small` của OpenAI cung cấp đầu ra 1536 chiều, nhưng họ hỗ trợ trực tiếp tham số `dimensions=256`. Bạn có thể cắt bớt chiều mà chỉ mất khoảng 2-3% độ chính xác (do API dùng kỹ thuật Matryoshka Representation Learning). Vector ngắn hơn = RAM ít hơn = Index nhanh hơn = Rẻ hơn.
2. **Scalar/Binary Quantization:**
   Nếu bạn sử dụng Qdrant hoặc Milvus, hãy bật tính năng `Scalar Quantization` (chuyển float32 sang int8) hoặc `Binary Quantization` (chuyển sang bit 0/1, dùng Hamming distance). Tối ưu này giúp cắt giảm 75% - 96% chi phí RAM.

### Triển khai Cơ sở hạ tầng (Infrastructure as Code)
Dưới đây là ví dụ dùng Terraform để setup index HNSW trên Qdrant Cloud một cách tự động, config rõ ràng các thông số quantization để tối ưu FinOps.

```hcl
resource "qdrant_cluster" "rag_cluster" {
  name       = "enterprise-rag-cluster"
  cloud_provider = "aws"
  region     = "us-east-1"

  # Cấu hình node cực kỳ quan trọng để cân bằng RAM/Compute
  node_configuration {
    package_id = "standard-4gb" # 1 vCPU, 4GB RAM
  }
}

# Đoạn mã Python tương ứng để khởi tạo Collection với Quantization
# client.create_collection(
#     collection_name="docs",
#     vectors_config=models.VectorParams(
#         size=256, # Đã optimize dimension từ 1536 xuống 256
#         distance=models.Distance.DOT,
#     ),
#     quantization_config=models.ScalarQuantization(
#         scalar=models.ScalarQuantizationConfig(
#             type=models.ScalarType.INT8,
#             quantile=0.99,
#             always_ram=True
#         )
#     )
# )
```

---

## 6. Tổng kết

Vector Embeddings không chỉ là toán học, mà khi vào Production, nó là một bài toán Hệ thống phân tán, Quản lý bộ nhớ và Tối ưu chi phí. Việc hiểu rõ cách HNSW duyệt đồ thị hay cách IVF-PQ lượng tử hóa dữ liệu sẽ giúp Staff Engineer đưa ra quyết định kiến trúc đúng đắn, cứu doanh nghiệp khỏi những hóa đơn Cloud hàng chục ngàn đô la mỗi tháng.

---

## Nguồn Tham Khảo (References)

* [Pinecone Learning Center: What is a Vector Database?](https://www.pinecone.io/learn/vector-database/)
* [Milvus Documentation: HNSW Index & Quantization](https://milvus.io/docs/index.md)
* [Qdrant: Binary Quantization in Vector Search](https://qdrant.tech/articles/binary-quantization/)
* [AWS Architecture Blog: Building Real-time Machine Learning Pipelines](https://aws.amazon.com/blogs/architecture/)
* [ANN-Benchmarks: HNSW vs IVF trade-offs](https://ann-benchmarks.com/)
* [Matryoshka Representation Learning for Embeddings (OpenAI)](https://openai.com/index/new-embedding-models-and-api-updates/)
