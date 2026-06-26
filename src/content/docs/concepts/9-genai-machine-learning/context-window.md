---
title: "Cửa sổ ngữ cảnh - Context Window"
difficulty: "Advanced"
tags: ["llm", "context-window", "transformers", "kv-cache", "genai", "paged-attention"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Context Window & KV Cache trong LLM: Kiến trúc và Tối ưu"
metaDescription: "Tìm hiểu sâu về Context Window trong LLM từ góc độ Data Engineer: Cơ chế KV Cache, Bottleneck OOM, PagedAttention, và Trade-off với hệ thống RAG."
description: "Context Window không chỉ là 'giới hạn từ' của chatbot. Dưới góc nhìn kiến trúc hệ thống, nó là một bài toán hóc búa về quản lý bộ nhớ VRAM, tính toán Ma trận Attention và chiến lược tối ưu FinOps."
---

Khi phát triển các hệ thống AI tạo sinh (Generative AI), hầu hết các lập trình viên bắt đầu bằng việc ném một đoạn văn bản dài vào API của OpenAI hoặc Anthropic và hy vọng mô hình xử lý trơn tru. Tuy nhiên, khi hệ thống cần mở rộng (Scale) để xử lý hàng ngàn request đồng thời (Concurrency) với các tài liệu nội bộ khổng lồ, mọi thứ bắt đầu đổ vỡ.

Độ trễ (Latency) tăng vọt, chi phí hạ tầng (FinOps) phình to, và các kịch bản sập nguồn GPU (OOMKilled) xảy ra liên tục. Chìa khóa gốc rễ của mọi vấn đề này nằm ở **Context Window** và cách hệ thống quản lý **KV Cache** ở tầng thực thi vật lý.

## Kiến trúc Thực thi Vật lý (Physical Execution)

Context Window, bề ngoài là "bộ nhớ ngắn hạn" của LLM, nhưng thực chất ở tầng hệ thống, nó bị giới hạn bởi hai yếu tố kiến trúc cốt lõi của **Transformer**:
1. Độ phức tạp tính toán (Compute Complexity) của cơ chế **Self-Attention**.
2. Không gian lưu trữ bộ nhớ (Memory footprint) của **KV Cache** (Key-Value Cache).

### Sự đánh đổi của KV Cache (The KV Cache Memory Bottleneck)

Trong giai đoạn sinh văn bản (Auto-regressive decoding), để mô hình dự đoán token tiếp theo, nó cần "nhìn lại" toàn bộ các token trước đó. Để không phải tính toán lại (recompute) các ma trận Key và Value cho các token cũ (làm lãng phí thời gian tính toán), hệ thống sẽ lưu trữ trạng thái của chúng vào VRAM. Không gian lưu trữ này gọi là **KV Cache**.

Kích thước của KV Cache tăng **tuyến tính** theo kích thước Context Window và kích thước Batch (số lượng user request cùng lúc), nhưng sự tương tác giữa các token trong Self-Attention lại có độ phức tạp **bậc 2 ($\mathcal{O}(N^2)$)** đối với mỗi request. 

Công thức ước lượng VRAM cho KV Cache đối với 1 request:
`VRAM (bytes) = 2 (Key, Value) × Độ dài Context (N) × Số Layers × Số Heads × Kích thước Head × 2 (FP16 bytes)`

Ví dụ: Với LLaMA-2 70B, một request có context window 100k tokens có thể "ngốn" tới hơn 30GB VRAM chỉ riêng cho KV Cache (chưa tính dung lượng cần để load Model Weights). Nếu bạn có 10 concurrent users, hệ thống sẽ cạn kiệt bộ nhớ của một chiếc GPU NVIDIA H100 (80GB) ngay lập tức.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#ffcccc', 'edgeLabelBackground':'#ffffff'}}}%%
architecture-beta
    group gpu("GPU Memory - 80GB H100")

    service weights("Model Weights - 40GB") in gpu
    service kv_user1("KV Cache User 1 - 15GB") in gpu
    service kv_user2("KV Cache User 2 - 15GB") in gpu
    service kv_user3("KV Cache User 3 - 15GB") in gpu
    
    weights:T --> kv_user1:L
    weights:B --> kv_user2:L
    weights:R --> kv_user3:L
```
*(Sơ đồ: GPU Memory dễ dàng bị quá tải (OOM) do KV Cache phình to khi context window dài và concurrent users tăng).*

### Tối ưu bằng PagedAttention (vLLM)

Để giải quyết tình trạng phân mảnh bộ nhớ (Memory Fragmentation) của KV Cache, kiến trúc **PagedAttention** (áp dụng trong framework vLLM) ra đời. Lấy cảm hứng từ Virtual Memory của Hệ điều hành, PagedAttention chia KV Cache thành các "khối" (blocks) không liền kề nhau trong VRAM, giúp triệt tiêu hiện tượng phân mảnh và tăng lượng concurrent users lên gấp 3-4 lần.

Ví dụ cấu hình vLLM Engine bằng Python thể hiện việc kiểm soát GPU Memory:

```python
from vllm import LLM, SamplingParams

# Cấu hình LLM Engine với các giới hạn hệ thống nghiêm ngặt
# Phân bổ đúng 80% VRAM cho mô hình + KV Cache, tránh OOMKilled
llm = LLM(
    model="meta-llama/Llama-2-7b-chat-hf",
    gpu_memory_utilization=0.80, # Dành 20% cho OS và các tiến trình khác
    max_model_len=4096,          # Giới hạn Context Window (Capping)
    block_size=16,               # Kích thước PagedAttention Block
    tensor_parallel_size=2       # Chia tải KV cache trên 2 GPUs (Model Parallelism)
)

sampling_params = SamplingParams(temperature=0.7, max_tokens=512)
outputs = llm.generate(["Trình bày về cơ chế Garbage Collection trong Java"], sampling_params)
```

## Rủi ro Vận hành (Operational Risks)

### 1. Hiện tượng "Lost in the Middle" và "Ảo giác"

Các LLM có xu hướng "nhớ" rất tốt đoạn văn bản ở đầu (Primacy effect) và ở cuối (Recency effect) của Context Window, nhưng lại dễ bỏ sót thông tin ở đoạn giữa. Nếu bạn đẩy một bản báo cáo tài chính dài 50 trang vào Context Window để tìm một chỉ số nhỏ bé nằm ở trang 25, rủi ro mô hình xuất ra "Ảo giác" (Hallucination) là rất lớn.

**Xử lý:** Kỹ sư hệ thống thường áp dụng kỹ thuật **Information Re-ranking (Sắp xếp lại thông tin)**. Trước khi đưa các text chunks lấy từ VectorDB vào Context Window, các đoạn văn bản chứa thông tin quan trọng nhất sẽ được "ép" lên đầu hoặc dồn xuống cuối prompt, các đoạn phụ trợ (noise) được đẩy vào giữa.

### 2. OOMKilled do Concurrent Requests (Spike Traffic)

Khi số lượng users tăng vọt (Spike Traffic), hệ thống Inference Server phải phục vụ quá nhiều tiến trình KV Caches cùng lúc. Nếu không có cơ chế **Eviction** (Đuổi cache), tiến trình sẽ bị hệ điều hành Linux "giết" (OOMKilled) vì xin cấp phát vượt quá bộ nhớ phần cứng.

**Giải pháp:** 
Sử dụng các Inference Server hiện đại như TGI (Text Generation Inference) hoặc vLLM có cơ chế `Continuous Batching` và quản lý hàng đợi (Queue). Khi VRAM chạm ngưỡng nguy hiểm, hệ thống sẽ **Swap (đẩy)** các KV Cache chưa dùng đến ra bộ nhớ RAM của CPU (hoặc bộ nhớ PCIe phụ trợ), và kéo lại khi cần thiết (giống Swap Space trên Linux). Tuy nhiên, điều này sẽ đánh đổi bằng Latency cực lớn do tốc độ truyền tải qua băng thông PCIe chậm hơn VRAM HBM rất nhiều.

## Systemic Trade-offs: RAG vs Long-Context Models

Một cuộc tranh luận nổ ra khi các mô hình có Context Window siêu dài (lên đến 1-2 triệu tokens như Gemini 1.5 Pro) ra đời: **Có còn cần RAG (Retrieval-Augmented Generation) khi có thể nhồi mọi thứ vào prompt (Context Stuffing)?**

| Tiêu chí Đánh đổi | Hệ thống RAG (Short-Context) | Long-Context Models (Context Stuffing) |
| :--- | :--- | :--- |
| **Độ trễ (TTFT - Time-to-First-Token)** | **Thấp.** Mô hình chỉ đọc các chunks nhỏ (~2000 tokens), nên bước Pre-fill diễn ra tức thì. Đánh đổi bằng thời gian Query VectorDB (vài ms). | **Cực Cao.** Phải đọc và mã hóa hàng triệu tokens trước khi sinh ra từ đầu tiên. Có thể mất từ vài giây đến hàng phút. |
| **Tính toán và Chi phí (FinOps)** | **Rất Thấp.** Chỉ trả tiền API/Compute cho vài ngàn tokens liên quan nhất được trích xuất. | **Rất Cao.** Chi phí nội suy ($\mathcal{O}(N^2)$) khiến giá mỗi API call khổng lồ. VRAM yêu cầu để chứa KV Cache siêu lớn. |
| **Độ chính xác Suy luận chéo (Cross-reasoning)** | **Yếu.** Nếu câu trả lời cần tổng hợp từ 20 trang rải rác khác nhau, Vector Search thường không lấy đủ ngữ cảnh, dẫn đến câu trả lời gãy khúc. | **Xuất sắc.** Do có toàn cảnh dữ liệu (Global context), mô hình dễ dàng móc nối các dữ kiện trải dài ở các tài liệu khác nhau. |

## Tối ưu Chi phí (FinOps)

Để chạy hệ thống GenAI quy mô Enterprise mà không làm phá sản công ty, bạn cần áp dụng các chiến lược FinOps liên quan tới quản trị Context Window:

1. **Prompt Caching:** Các nền tảng API hiện đại (Anthropic, Gemini) cho phép lưu bộ nhớ Cache đối với System Prompt tĩnh (như bộ tài liệu hướng dẫn nội bộ dài 10,000 tokens). Lần gọi đầu tiên (Cache Miss) tốn phí bình thường, nhưng các lần gọi sau (Cache Hit) chi phí được giảm tới 50-80% và độ trễ giảm mạnh.
2. **Dynamic Chunking:** Không set cứng `max_tokens` của Context Window. Tùy theo User Tier (Free vs Premium), định tuyến (Route) request đến các mô hình kích thước nhỏ (Llama 8B) hoặc to (Claude 3.5 Sonnet) với giới hạn chunk size khác nhau.

### Ví dụ Terraform thiết lập AWS Bedrock Provisioned Throughput:

Khi cần ổn định chi phí (Predictable cost) thay vì trả theo mỗi Token, các đội ngũ DataOps thường mua đứt năng lực tính toán thông qua Provisioned Throughput.

```hcl
# Thiết lập Provisioned Throughput trên AWS Bedrock cho các tác vụ Long-context
resource "aws_bedrock_provisioned_model_throughput" "anthropic_claude_long_context" {
  provisioned_model_name = "claude-long-context-prod"
  model_id               = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
  
  # model_units xác định năng lực phục vụ. Càng lớn thì dung lượng KV Cache phục vụ concurrent context window càng nhiều
  model_units = 2
  
  # Cam kết thời gian sử dụng từ sớm (Reserved Instances concept) để tối ưu chi phí
  commitment_duration = "SixMonths"
}
```

## Nguồn Tham Khảo (References)
* [vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention](https://vllm.ai/) - Cơ sở nền tảng của PagedAttention giải quyết phân mảnh KV Cache.
* [Lost in the Middle: How Language Models Use Long Contexts (Liu et al., 2023)](https://arxiv.org/abs/2307.03172) - Nghiên cứu chuyên sâu về độ suy giảm trí nhớ ở phần giữa của Context Window.
* [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness (Dao et al., 2022)](https://arxiv.org/abs/2205.14135) - Kỹ thuật đột phá về tối ưu memory I/O cho Self-Attention.
* [Mastering LLM Memory: The Key-Value Cache (Databricks Engineering Blog)](https://www.databricks.com/blog/mastering-llm-memory-key-value-cache) - Phân tích chi tiết về KV Cache memory footprint trong quá trình Inference.
