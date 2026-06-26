---
title: "Nucleus Sampling (Top-p)"
difficulty: "Intermediate"
tags: ["llm", "decoding", "generation", "top-p", "nucleus-sampling", "vllm"]
readingTime: "12 mins"
lastUpdated: 2026-06-26
seoTitle: "Top-p (Nucleus Sampling) Architecture - Tinh chỉnh thông số LLM & FinOps"
metaDescription: "Kiến trúc hệ thống của Nucleus Sampling (Top-p) trong LLM. Phân tích chi tiết luồng xử lý, độ trễ (Latency), tối ưu throughput trên vLLM và các rủi ro vận hành."
description: "Nucleus Sampling (Top-p) không đơn thuần là một 'công tắc' sáng tạo trên API. Dưới góc nhìn Data/ML Engineering, đây là một chiến lược giải mã (decoding strategy) can thiệp trực tiếp vào phân phối xác suất của mô hình, có ảnh hưởng lớn đến chất lượng đầu ra, tài nguyên GPU và Time-per-Output-Token (TPOT)."
---

## 1. Kiến trúc Giải mã: Từ Logits đến Top-p (System Architecture)

Để hiểu Nucleus Sampling (Top-p), chúng ta cần nhìn vào điểm cuối (tail-end) của kiến trúc Transformer. Sau khi đi qua hàng chục lớp Self-Attention và Feed-Forward, mô hình không sinh ra ngay một từ (token). Thay vào đó, nó tạo ra một vector khổng lồ gọi là **Logits** — với kích thước bằng đúng tập từ vựng (Vocabulary Size, thường từ 32,000 đến 128,000 tokens).

Quá trình chuyển đổi từ Logits thành Token cuối cùng được gọi là **Decoding Pipeline**.

```mermaid
flowchart TD
    A["Hidden States("từ lớp Transformer cuối")"] -->|Linear Projection| B("Logits vector: kích thước ~100k")
    B -->|Softmax / Temperature| C{Phân phối Xác suất}
    C -->|Top-k| D["Cắt cố định K tokens"]
    C -->|Top-p| E["Cắt theo tổng xác suất tích lũy"]
    D --> F("Lấy mẫu ngẫu nhiên - Sampling")
    E --> F
    F --> G("(Next Token")
```

Các phương pháp đời đầu bộc lộ nhiều điểm yếu chí mạng ở quy mô lớn:
- **Greedy Search (argmax):** Luôn chọn token có xác suất cao nhất. Dẫn đến câu văn robot, lặp từ cục bộ (ví dụ: "I don't know, I don't know, I don't know").
- **Pure Sampling (Multinomial):** Lấy mẫu trên toàn bộ phân phối. Có rủi ro cao rơi vào vùng "long tail" (các từ vô nghĩa, ảo giác).
- **Top-k Sampling:** Chặn cứng $K$ token đầu tiên. Khi mô hình rất "chắc chắn" (chỉ có 1-2 từ đúng), Top-k vẫn giữ lại $K$ từ, đẩy rác vào bộ lấy mẫu. Khi mô hình "phân vân" (cần tới 100 từ khả dĩ), Top-k lại cắt đi các từ hợp lý.

**Nucleus Sampling (Top-p)**, được giới thiệu bởi Holtzman et al. (2019), giải quyết bài toán này bằng cách chặn linh hoạt (dynamic truncation). Thay vì chặn theo số lượng ($K$), nó chặn theo **khối lượng xác suất** ($P$).

---

## 2. Giải phẫu Thuật toán Top-p (Execution Logic)

Thuật toán Top-p hoạt động như một bộ lọc động, cắt bỏ phần đuôi (tail) của phân phối phân suất. Luồng thực thi diễn ra ở cấp độ Tensor/GPU như sau:

1. **Sort:** Sắp xếp toàn bộ từ vựng theo xác suất giảm dần.
2. **Cumulative Sum:** Tính tổng tích lũy (Cumulative Probability) từ trên xuống.
3. **Masking/Truncation:** Tìm điểm "cắt" (cutoff) ngay khi tổng tích lũy vượt qua ngưỡng $p$. Đặt xác suất của tất cả token sau điểm cắt về \$0$.
4. **Renormalize:** Chuẩn hóa lại các token còn lại (hạt nhân - nucleus) để tổng xác suất quay về \$1.0$.
5. **Sample:** Lấy mẫu Multinomial từ tập hạt nhân.

### Code Thực chiến (PyTorch / vLLM Simulation)

Hãy xem cách Top-p được implement ở cấp độ Tensor trong PyTorch (tương tự logic bên trong `transformers` hoặc các optimized kernels của `vLLM`):

```python
import torch
import torch.nn.functional as F

def apply_top_p_sampling(logits: torch.Tensor, top_p: float = 0.9, filter_value: float = -float('Inf')):
    """
    Mô phỏng hàm lọc Top-p trên GPU sử dụng PyTorch.
    Logits shape: (batch_size, vocab_size)
    """
    # 1. Chuyển Logits thành Xác suất
    probs = F.softmax(logits, dim=-1)
    
    # 2. Sắp xếp giảm dần (Đây là bước đắt đỏ nhất O(V log V))
    sorted_probs, sorted_indices = torch.sort(probs, descending=True)
    
    # 3. Tính tổng tích lũy
    cumulative_probs = torch.cumsum(sorted_probs, dim=-1)
    
    # 4. Tạo Mask: Loại bỏ các token mà tổng tích lũy > top_p
    # (Cần shift right 1 bước để luôn giữ lại ít nhất 1 token trên ngưỡng)
    sorted_indices_to_remove = cumulative_probs > top_p
    sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
    sorted_indices_to_remove[..., 0] = 0 # Luôn giữ lại token xác suất cao nhất
    
    # 5. Áp dụng Mask quay ngược lại thứ tự gốc của từ vựng
    indices_to_remove = sorted_indices_to_remove.scatter(1, sorted_indices, sorted_indices_to_remove)
    logits[indices_to_remove] = filter_value
    
    # 6. Chuẩn hóa lại (thông qua softmax một lần nữa khi lấy mẫu) và Sample
    filtered_probs = F.softmax(logits, dim=-1)
    next_token = torch.multinomial(filtered_probs, num_samples=1)
    
    return next_token

# Giả lập logits cho tập từ vựng 32,000 từ
mock_logits = torch.randn(1, 32000) 
next_token_id = apply_top_p_sampling(mock_logits, top_p=0.9)
print(f"Sampled Token ID: {next_token_id.item()}")
```

---

## 3. Rủi ro Vận hành (Operational Risks) & Trade-offs

Dưới góc nhìn Hệ thống, Sampling không "miễn phí". Khi phục vụ LLM ở quy mô lớn (High QPS), Top-p sinh ra các nút thắt cổ chai mà Kỹ sư cần nắm rõ.

### 3.1. The Compute Tax (Chi phí Tính toán)
Khác với Greedy Search chỉ cần toán tử `argmax` với độ phức tạp $O(V)$ (với $V$ là kích thước từ vựng), Top-p bắt buộc phải dùng thuật toán sắp xếp (Sorting). Sắp xếp trên mảng 128,000 phần tử tốn kém $O(V \log V)$. Khi mô hình phục vụ hàng nghìn request qua Continuous Batching, thao tác Sort này tạo ra áp lực cực lớn lên GPU kernels, làm tăng **TPOT (Time Per Output Token)**.

*Trade-off:* 
*   Nếu tối ưu tuyệt đối cho **Throughput** (RPS) và **Latency**: Giảm vocab size nếu có thể (nhưng hiếm khi), hoặc ưu tiên các sampling kernels được tối ưu hóa như **FlashInfer** trong vLLM. 
*   Nhiều production system chọn cách chỉ dùng Top-p với một $p$ vừa phải và kết hợp các custom CUDA kernels để thực hiện Approximate Sorting.

### 3.2. Real-world Incidents: Cấu hình sai lệch
- **Hallucination Spikes (Khi $p$ quá gần 1.0):** Nếu $p=0.99$ hoặc \$1.0$, vòng Nucleus quá rộng, kéo theo hàng loạt các "long tail tokens" (từ nhiễu). Điều này thường xuyên dẫn đến hiện tượng mô hình sinh ra JSON hỏng (malformed), nói lảm nhảm, hoặc lạc đề.
- **Repetition Loops (Vòng lặp vĩnh cửu):** Ngược lại, nếu set $p$ quá thấp (ví dụ $p \le 0.1$), mô hình gần như quay lại trạng thái Greedy Search. Nếu kết hợp với việc thiếu `repetition_penalty` (hoặc `presence_penalty`), mô hình dễ dàng rơi vào một bẫy lặp từ vô tận, làm lãng phí Compute (GPU kẹt ở request này cho đến khi hit `max_tokens`).

---

## 4. Thực tiễn Kỹ thuật & FinOps (Engineering Best Practices)

### Cấu hình Tối ưu trên vLLM
Khi triển khai vLLM, các cấu hình sampling ảnh hưởng trực tiếp đến hiệu năng server và **FinOps (Tối ưu chi phí Compute)**:

```bash
# Lệnh chạy vLLM API server tối ưu hóa
python3 -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Llama-3-8B-Instruct \
    --enforce-eager \
    --gpu-memory-utilization 0.9 \
    --max-num-batched-tokens 8192
```

Khi clients gọi API tới Server vLLM này, cần quy hoạch chặt chẽ thông số Payload:

```json
{
  "model": "meta-llama/Llama-3-8B-Instruct",
  "messages": [...],
  "top_p": 0.9,
  "temperature": 1.0, 
  "max_tokens": 1024,
  "presence_penalty": 0.1
}
```

**💡 Golden Rule: Đừng chỉnh đồng thời Top-p và Temperature**
- Cả hai đều điều chỉnh độ đa dạng (diversity) của output.
- **Temperature** làm phẳng/sắc nét toàn bộ đồ thị trước khi áp dụng hàm kích hoạt.
- **Top-p** cắt đuôi đồ thị sau khi đã tính xác suất.
- *Best Practice:* Cố định `Temperature = 1.0` và điều chỉnh `Top-p`. Nếu muốn văn bản an toàn, logic (như SQL parsing, Coding): $p = 0.1 - 0.3$. Nếu muốn chatbot sáng tạo, phong phú: $p = 0.7 - 0.9$. Đừng bao giờ set `top_p = 0.9` VÀ `temperature = 1.5` cùng lúc, output sẽ cực kỳ hỗn loạn.

### Min-p: Kẻ thách thức Top-p
Trong các version gần đây của vLLM và Hugging Face, **Min-p** nổi lên như một giải pháp thay thế. Thay vì tính tổng tích lũy, Min-p chỉ loại bỏ các token có xác suất nhỏ hơn một tỷ lệ cố định so với token dẫn đầu. Việc này cắt bỏ được hoàn toàn bước Sorting đắt đỏ, giúp **giảm Latency** đáng kể trên GPU mà vẫn giữ được chất lượng văn bản tương đương Top-p.

---

## 5. Nguồn Tham Khảo (References)

*   [The Curious Case of Neural Text Degeneration (Holtzman et al., 2019)](https://arxiv.org/abs/1904.09751) - Whitepaper kinh điển đề xuất phương pháp Nucleus Sampling.
*   [Hugging Face - How to generate text: using different decoding methods](https://huggingface.co/blog/how-to-generate) - Bài phân tích trực quan về Sampling Pipeline.
*   [vLLM Documentation: Generation Parameters](https://docs.vllm.ai/en/latest/dev/sampling_params.html) - Chi tiết kỹ thuật về các sampling kernels và cấu hình tối ưu độ trễ trong môi trường Production.
*   [Attention Is All You Need (Vaswani et al., 2017)](https://arxiv.org/abs/1706.03762) - Kiến trúc cốt lõi sinh ra vector Logits trong các mô hình Transformer.
