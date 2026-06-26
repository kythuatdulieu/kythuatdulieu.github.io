---
title: "Mô hình Ngôn ngữ Lớn (LLM) & Kiến trúc Suy luận (Inference Architecture)"
difficulty: "Senior"
tags: ["llm", "genai", "transformer", "vllm", "system-design", "machine-learning"]
readingTime: "25 mins"
lastUpdated: 2026-06-26
seoTitle: "Kiến trúc LLM Inference: KV Cache, PagedAttention và Hệ thống Đánh đổi"
metaDescription: "Bài viết chuyên sâu về kiến trúc thực thi của LLM dành cho Kỹ sư Dữ liệu. Mổ xẻ Memory-bound, KV Cache, PagedAttention (vLLM) và cách xử lý OOMKilled."
description: "Dưới góc độ của một Data/ML Engineer, LLM không phải là phép thuật. Nó là bài toán về tối ưu băng thông bộ nhớ (Memory Bandwidth), giảm thiểu phân mảnh (Fragmentation) và quản lý I/O trên GPU."
---

Khi bước ra khỏi những khái niệm "GenAI là gì?", Kỹ sư Dữ liệu (Data/ML Engineer) phải đối mặt với thực tế khốc liệt của việc đưa Mô hình Ngôn ngữ Lớn (Large Language Model - LLM) vào Production. Khác với các hệ thống Microservices truyền thống, LLM Serving tiêu tốn tài nguyên khủng khiếp và cực kỳ nhạy cảm với băng thông phần cứng.

Bài viết này mổ xẻ kiến trúc vật lý đằng sau quá trình **Inference (Suy luận)** của LLM, tập trung vào bài toán cổ điển: làm sao để sinh token nhanh hơn, rẻ hơn và không làm sập GPU (OOM).

---

## 1. Bản chất Kiến trúc Thực thi Vật lý (Physical Execution)

Mô hình LLM (như GPT, Llama, Claude) hoạt động theo cơ chế **Autoregressive Generation** (Dự đoán sinh từ tự hồi quy). Nghĩa là, để sinh ra token thứ $N+1$, mô hình phải xử lý lại toàn bộ dãy sequence từ token \$1$ đến $N$.

Điều này dẫn đến hai pha (phases) cực kỳ khác biệt về đặc tính hệ thống trong quá trình Inference:

1. **Prefill Phase (Pha Đọc - Compute-bound):** Mô hình nhận toàn bộ prompt của user. Quá trình này tính toán song song ma trận trên GPU, chủ yếu bị giới hạn bởi sức mạnh tính toán (Compute-bound/TFLOPS).
2. **Decode Phase (Pha Sinh từ - Memory-bound):** Mô hình bắt đầu nhả ra từng token một. Lúc này, GPU phải đọc lại toàn bộ trạng thái Attention từ bộ nhớ cho mỗi token mới. Quá trình này cực kỳ chậm và bị giới hạn bởi băng thông bộ nhớ (Memory-bound).

### Bài toán Cổ chai: KV Cache

Trong cơ chế Attention, để không phải tính lại từ đầu các token cũ, hệ thống lưu trữ kết quả của các vector **Key (K)** và **Value (V)** vào RAM của GPU. Đây gọi là **KV Cache**.

> [!WARNING]
> **Sự bùng nổ của KV Cache:** VRAM của GPU không bị chiếm dụng chủ yếu bởi trọng số mô hình (Model Weights), mà bởi KV Cache. Một sequence dài 8,000 tokens của mô hình 70B tham số có thể ngốn hàng Gigabytes KV Cache **cho mỗi request**. Khi có 100 concurrent requests, GPU sẽ nhanh chóng cạn kiệt VRAM (OOMKilled) dù Compute (TFLOPS) vẫn đang rảnh rỗi.

---

## 2. Giải cứu VRAM với vLLM và PagedAttention

Trước đây, KV Cache được cấp phát bộ nhớ tĩnh (Static Allocation) theo chiều dài tối đa của sequence (vd: cấp sẵn 4096 tokens dù câu hỏi chỉ có 10 tokens). Điều này dẫn đến **Internal Fragmentation** (Phân mảnh nội vi) cực kỳ lãng phí (thường >60% VRAM bị bỏ trống vô ích).

Năm 2023, team **vLLM** (UC Berkeley) giới thiệu **PagedAttention**, mượn ý tưởng trực tiếp từ cơ chế Virtual Memory (Bộ nhớ ảo) của Hệ điều hành (OS).

### Cơ chế Hoạt động của PagedAttention

Thay vì cấp phát một vùng nhớ liền kề khổng lồ, PagedAttention chia KV Cache thành các **Blocks (Trang nhớ)** nhỏ có kích thước cố định (ví dụ: 16 tokens/block).

```mermaid
flowchart TD
    subgraph Logical["Logical KV Blocks("Per Request")"]
        L1["Block 0: 'The', 'cat'"]
        L2["Block 1: 'sat', 'on'"]
        L3["Block 2: 'the', 'mat'"]
    end

    subgraph BlockTable["Block Table (Mapping)"]
        T1["Seq A - Block 0 --> Physical 5"]
        T2["Seq A - Block 1 --> Physical 2"]
        T3["Seq A - Block 2 --> Physical 8"]
    end

    subgraph Physical["Physical GPU Memory("KV Cache")"]
        P1["Physical Block 1"]
        P2["Physical Block 2: 'sat', 'on'"]
        P3[...]
        P5["Physical Block 5: 'The', 'cat'"]
        P8["Physical Block 8: 'the', 'mat'"]
    end

    L1 --> T1
    L2 --> T2
    L3 --> T3

    T1 --> P5
    T2 --> P2
    T3 --> P8
    
    style Physical fill:#2d3436,stroke:#74b9ff,stroke-width:2px,color:#fff
    style BlockTable fill:#0984e3,stroke:#74b9ff,color:#fff
    style Logical fill:#d63031,stroke:#ff7675,color:#fff
```

**Tại sao nó đột phá?**
- **Không phân mảnh:** Các block không cần nằm liền kề nhau trong VRAM vật lý.
- **Chia sẻ bộ nhớ (Memory Sharing):** Khi sử dụng các kỹ thuật như Beam Search hoặc sinh nhiều câu trả lời (Parallel Sampling), các câu trả lời chia sẻ chung các block KV Cache của phần prompt gốc.
- **Kết quả:** Giảm lượng VRAM lãng phí xuống dưới 4%, cho phép batching (gộp nhóm) số lượng request lớn hơn gấp 2-4 lần.

---

## 3. Rủi ro Vận hành & Trade-offs Hệ thống

Khi triển khai LLM vào production, bạn phải quản lý khéo léo các chỉ số SLA. Một Data Engineer giỏi phải hiểu được sự đánh đổi giữa **Latency (Độ trễ)** và **Throughput (Thông lượng)**.

### 3.1. Các Metric Cốt lõi
* **TTFT (Time To First Token):** Thời gian từ khi user bấm "Send" đến khi hiện ra chữ đầu tiên. Rất quan trọng với trải nghiệm người dùng (Real-time chatbot).
* **TPOT (Time Per Output Token):** Thời gian sinh ra từng token tiếp theo (Time Between Tokens).
* **Throughput:** Số lượng tokens sinh ra trên toàn bộ hệ thống mỗi giây (tokens/s).

### 3.2. Trade-off: Batch Size lớn vs Latency
Để tối ưu chi phí GPU (FinOps), ta cần tăng `Batch Size` (xử lý nhiều request cùng lúc). Tuy nhiên:
- Tăng Batch Size -> Compute Utilization tăng -> **Throughput tăng (Tốt cho FinOps)**.
- Nhưng, GPU phải chia sẻ băng thông bộ nhớ cho nhiều request hơn -> **TPOT tăng (User thấy chữ hiện ra chậm hơn)**.
- Nếu Batch Size quá lớn, quá trình Prefill bị chặn -> **TTFT tăng vọt**.

### 3.3. Xử lý Incident: OOMKilled (Out Of Memory)
Một incident cực kỳ phổ biến khi VRAM bị tràn.
**Root Cause:**
- Traffic tăng đột biến (Burst traffic) dẫn đến quá nhiều Concurrent Requests.
- User truyền vào một đoạn prompt quá dài (Context Window bùng nổ KV Cache).

**Khắc phục ở tầng hệ thống:**
1. Giới hạn cứng `max_num_batched_tokens` và `max_model_len` để kiểm soát VRAM bounds.
2. Áp dụng **Tensor Parallelism (TP)**: Cắt mô hình ra làm nhiều mảnh, chạy trên nhiều GPUs kết nối qua NVLink để chia sẻ tải VRAM.

---

## 4. Code Thực chiến (Show, Don't Tell)

### Cấu hình Engine vLLM bằng Python
Dưới đây là mã nguồn khởi tạo một Inference Engine chịu tải cao với `vLLM`, chú trọng vào các tham số ngăn ngừa OOM:

```python
from vllm import LLM, SamplingParams

# Khởi tạo mô hình Llama-3 với PagedAttention
llm = LLM(
    model="meta-llama/Meta-Llama-3-8B-Instruct",
    # Chia model lên 2 GPUs (Tensor Parallelism) để nhân đôi VRAM
    tensor_parallel_size=2,  
    # CHỐNG OOM: Chỉ cấp tối đa 90% VRAM (Weights + KV Cache), giữ 10% safety buffer
    gpu_memory_utilization=0.9, 
    # Giới hạn số lượng token tối đa trong một batch prefill
    max_num_batched_tokens=4096, 
    # Giới hạn context length để tránh KV cache tràn
    max_model_len=8192,
    # Bật CUDA Graph để giảm thiểu overhead của CPU khi dispatch kernels
    enforce_eager=False 
)

# Cấu hình tham số sinh văn bản (Generation)
sampling_params = SamplingParams(
    temperature=0.2, # Độ sáng tạo thấp -> Tốt cho Data extraction / Text-to-SQL
    top_p=0.95,
    max_tokens=1024
)

prompts = ["Viết câu lệnh SQL tìm doanh thu theo tháng trên bảng orders."]
outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(f"Generated text: {output.outputs[0].text}")
```

### Terraform: Deploy LLM Endpoint trên AWS SageMaker
Để phục vụ hàng nghìn request, ta cần deploy model lên Cloud dưới dạng API. Sử dụng container vLLM (Text Generation Inference) trên AWS.

```hcl
# Cấu hình AWS SageMaker Model chứa container vLLM
resource "aws_sagemaker_model" "llama3_vllm" {
  name               = "llama3-8b-vllm-production"
  execution_role_arn = aws_iam_role.sagemaker_role.arn

  primary_container {
    image = "763104351884.dkr.ecr.us-west-2.amazonaws.com/huggingface-pytorch-tgi-inference:2.0-gpu-py39-cu118-ubuntu20.04"
    
    environment = {
      HF_MODEL_ID              = "meta-llama/Meta-Llama-3-8B-Instruct"
      MAX_INPUT_LENGTH         = "4000"
      MAX_TOTAL_TOKENS         = "8192"
      MAX_BATCH_PREFILL_TOKENS = "4096"
      # Chia Tensor Parallel 2 GPUs (Phù hợp với instance ml.g5.12xlarge có 4 GPUs)
      TENSOR_PARALLEL_DEGREE   = "2" 
    }
  }
}

# Cấu hình Endpoint chịu tải (Load Balanced)
resource "aws_sagemaker_endpoint_configuration" "llama3_config" {
  name = "llama3-endpoint-config"

  production_variants {
    variant_name           = "AllTraffic"
    model_name             = aws_sagemaker_model.llama3_vllm.name
    initial_instance_count = 2 # Chạy 2 node để High Availability
    instance_type          = "ml.g5.12xlarge" # 4x NVIDIA A10G (24GB VRAM/GPU)
  }
}

# Khởi tạo Endpoint thực tế
resource "aws_sagemaker_endpoint" "llama3_endpoint" {
  name                 = "llama3-production-api"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.llama3_config.name
}
```

---

## 5. Ứng Dụng Thực Tế Trong Data Engineering

Thay vì chỉ viết Chatbot, Kỹ sư Dữ liệu triển khai LLM cho các kiến trúc DataOps lõi:

* **Text-to-SQL (NL2SQL):** Sử dụng LLM làm dịch giả giữa Business Users và Data Warehouse. Pipeline thường đi kèm với **RAG (Retrieval-Augmented Generation)** để fetch schema (DDL) của database, giúp mô hình viết SQL chính xác và hạn chế Hallucination.
* **LLM-as-a-Judge trong Data Quality:** Sử dụng LLM cấu hình thấp (như Llama-3 8B) chạy offline batch job để scan log text, ticket support, hoặc review khách hàng nhằm trích xuất JSON schema có cấu trúc.
* **Semantic Caching:** Sử dụng Redis hoặc Weaviate để lưu (cache) lại vector embedding của câu hỏi. Nếu user hỏi 1 câu tương tự, trả ngay kết quả cache thay vì gọi lại LLM (giảm Latency & Compute Cost).

---

## Nguồn Tham Khảo (References)

1. [Attention Is All You Need - Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762)
2. [vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention (Kwon et al.)](https://blog.vllm.ai/2023/06/20/vllm.html)
3. [AWS Machine Learning Blog: Deploying Large Language Models](https://aws.amazon.com/blogs/machine-learning/)
4. [Mastering LLM Inference: KV Cache and Memory Bounds](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)
5. *Designing Data-Intensive Applications* - Martin Kleppmann (Lý thuyết cốt lõi về Streaming & Batching trong hệ thống dữ liệu).
