---
title: "Chiến Lược Chunking Trong RAG: Đánh Đổi FinOps Và Sự Cố OOM"
domains: ["DE", "DS", "Platform"]
level: "Senior"
difficulty: "Advanced"
tags: ["chunking", "rag", "vector-database", "nlp", "finops", "system-design", "machine-learning"]
readingTime: "15 mins"
lastUpdated: 2026-06-29
seoTitle: "Chunking Strategy RAG: Semantic, Parent Document Retriever, OOM"
metaDescription: "Phân tích chiến lược Chunking (Recursive, Semantic, Parent-Document) cho RAG. Giải quyết lỗi Context Fragmentation, Vector DB OOMKilled và tối ưu FinOps."
description: "Dưới góc độ Kỹ sư hệ thống, Chunking không chỉ là cắt chuỗi String. Nó là bài toán cân bằng giữa Context Fragmentation, RAM của Vector Database, và FinOps."
---

Trong các hệ thống Retrieval-Augmented Generation (RAG) quy mô doanh nghiệp, **Chunking (Phân tách văn bản)** không chỉ là bước tiền xử lý NLP đơn thuần. Dưới góc độ System Design, Chunking là một chuỗi các quyết định đánh đổi trực tiếp giữa **Độ trễ (Latency)**, **Thông lượng (Throughput)**, **Chi phí (FinOps)** và **Độ chính xác (Accuracy)**.

Việc cắt chuỗi bừa bãi sẽ dẫn đến thảm họa **Context Fragmentation (Phân mảnh ngữ cảnh)** khiến LLM bị "ảo giác", hoặc gây ra **Cartesian Explosion** làm quá tải RAM của Vector Database.

---

## 1. Systemic Trade-offs: Lớn hay Nhỏ?

Kích thước của một Chunk (Chunk Size) quyết định tuổi thọ của hệ thống RAG:

*   **Chunk Size Lớn (VD: 2000 tokens):** 
    *   *Ưu điểm:* Giữ trọn vẹn ngữ cảnh. Tiết kiệm RAM cho Vector DB vì sinh ra ít vectors.
    *   *Nhược điểm:* Độ chính xác khi tìm kiếm (Retrieval Precision) rất kém vì một vector phải nhồi nhét quá nhiều chủ đề. Tốn nhiều Token Tax khi đẩy vào LLM.
*   **Chunk Size Nhỏ (VD: 100 tokens):** 
    *   *Ưu điểm:* Retrieval Precision cực cao, bắt keyword rất nhạy.
    *   *Nhược điểm:* **Context Fragmentation**. Một chunk nhỏ chứa câu trả lời nhưng lại mất đi phần ngữ cảnh bao quanh nó (Orphaned context), khiến LLM không hiểu gì. Gây ra hiện tượng **Cartesian Explosion** (số lượng vector tăng bùng nổ, phá hủy HNSW Index của Vector DB).

---

## 2. Các Chiến Lược Chunking Thực Chiến

Để cân bằng Trade-off trên, ngành công nghiệp sử dụng 3 chiến lược cốt lõi:

### 2.1. Recursive Character Text Splitter (Golden Default)
Đây là tiêu chuẩn vàng (có sẵn trong LangChain).
- **Cơ chế:** Cố gắng cắt văn bản bằng danh sách các ký tự phân cách theo thứ bậc: `["\n\n", "\n", " ", ""]`. Nó ưu tiên giữ các đoạn văn (paragraph) nguyên vẹn. Chỉ khi đoạn văn vẫn quá lớn, nó mới đệ quy (recursive) lùi xuống cắt theo từng câu, rồi từng chữ.
- **Đánh giá:** Nhanh ($O(N)$), giữ ngữ nghĩa tốt ở mức cơ bản, rẻ.

### 2.2. Semantic Chunking (Đắt xắt ra miếng)
- **Cơ chế:** Thay vì cắt theo ký tự tĩnh, thuật toán này nhúng (Embed) từng câu đơn lẻ thành vector. Sau đó, tính Cosine Similarity giữa các câu liên tiếp. Nếu độ tương đồng tụt dốc (tức là tác giả đang chuyển sang chủ đề khác), nó sẽ đặt một "điểm cắt" (Breakpoint) ở đó.
- **FinOps Trade-off:** Cực kỳ đắt đỏ về Compute. Bạn phải gọi API Embedding hàng ngàn lần chỉ để tìm điểm cắt. *Best practice:* Dùng các model Local siêu nhẹ, miễn phí (như `all-MiniLM-L6-v2`) chạy trên CPU để tính toán điểm cắt, sau đó mới dùng API OpenAI đắt tiền để nhúng Chunk hoàn chỉnh.

### 2.3. Parent Document Retriever (Giải pháp Tuyệt đối)
Kiến trúc này sinh ra để triệt tiêu hoàn toàn sự đánh đổi giữa Precision và Context.
- **Cơ chế:** 
  1. Cắt văn bản gốc thành các **Parent Chunks** lớn (giữ ngữ cảnh). Lưu Parent vào một Document DB tĩnh (MongoDB, DynamoDB).
  2. Cắt Parent thành nhiều **Child Chunks** nhỏ. Nhúng Child và lưu vào Vector DB. Mỗi Child lưu UUID của Parent.
  3. Khi tìm kiếm, Vector DB bắt rất nhạy các Child Chunks. Nhưng thay vì trả Child cho LLM, hệ thống dùng UUID để bốc nguyên khối Parent từ MongoDB ném vào LLM.
- **Đánh giá:** Giải quyết xuất sắc Context Fragmentation.

---

## 3. Rủi Ro Vận Hành (Operational Risks)

### A. API Throttling & Bão Thử Lại (Retry Storms)
- **Sự cố:** Khi Ingestion hàng vạn Chunk vào OpenAI/Bedrock, bạn sẽ ăn lỗi `HTTP 429 Too Many Requests`. Nếu code không tốt, hàng vạn HTTP Worker sẽ đồng loạt gửi lại request ngay lập tức, tạo ra "Retry Storm" tự DDOS chính hệ thống của bạn.
- **Khắc phục:** Dùng Pattern **Exponential Backoff with Jitter** (Sử dụng thư viện `tenacity` trong Python).

### B. OOMKilled trên Vector Database
- **Sự cố:** Cấu hình Chunk Size 50 tokens cho dataset 1TB. Kết quả: 5 Tỷ vectors được nạp thẳng vào Milvus/Qdrant. Các Index trên RAM (như HNSW) phình to khủng khiếp, Linux kích hoạt OOM Killer chém chết tiến trình Database, sập toàn bộ hệ thống RAG.
- **Khắc phục:** Giữ Chunk Size ở Sweet spot (500-1000). Luôn bật Scalar Quantization hoặc Product Quantization (PQ) trên Vector DB để nén float32 xuống int8.

---

## 4. Code Thực Chiến: Ingestion Pipeline An Toàn

Dưới đây là mã Python production-ready sử dụng `RecursiveCharacterTextSplitter`, tích hợp `tenacity` để bảo vệ hệ thống khỏi Retry Storms khi nhúng (Embed) batch dữ liệu lớn:

```python
import os
from typing import List
from tenacity import retry, wait_random_exponential, stop_after_attempt
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings

# 1. Cấu hình Recursive Splitter chống phân mảnh ngữ cảnh
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=150, # Cực kỳ quan trọng để nối ngữ cảnh giữa 2 chunk kề nhau
    length_function=len,
    is_separator_regex=False,
)

# 2. Khởi tạo mô hình
embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")

# 3. Bảo vệ hệ thống bằng Exponential Backoff with Jitter
@retry[
    wait=wait_random_exponential(multiplier=1, max=60], 
    stop=stop_after_attempt(5),
    reraise=True
)
def embed_batch_with_retry(texts: List[str]] -> List[List[float]]:
    """Gọi API an toàn, nếu bị 429 sẽ lùi thời gian đợi ngẫu nhiên để tránh Retry Storm"""
    return embeddings_model.embed_documents[texts]

def production_ingestion_pipeline(raw_documents: List[str], batch_size: int = 100]:
    all_chunks = []
    for doc in raw_documents:
        all_chunks.extend(text_splitter.split_text(doc])
        
    print(f"Total chunks created: {len(all_chunks)}")
    
    vectors = []
    # Batching để tiết kiệm I/O Network overhead
    for i in range[0, len(all_chunks], batch_size):
        batch = all_chunks[i : i + batch_size]
        try:
            batch_embeddings = embed_batch_with_retry(batch]
            vectors.extend(batch_embeddings)
            print(f"Successfully embedded batch {i//batch_size + 1}")
        except Exception as e:
            # Fallback: Đẩy vào Dead Letter Queue (DLQ)
            print(f"DLQ Alert - Failed to embed batch {i//batch_size + 1}: {str(e)}")
            
    return all_chunks, vectors
```

---

## Nguồn Tham Khảo
* [Pinecone: Chunking Strategies for LLM Applications][https://www.pinecone.io/learn/chunking-strategies/]
* [AWS Architecture: Parent Document Retriever in Bedrock][https://aws.amazon.com/blogs/machine-learning/]
* [LangChain Documentation: RecursiveCharacterTextSplitter](https://python.langchain.com/v0.2/docs/how_to/recursive_text_splitter/]
