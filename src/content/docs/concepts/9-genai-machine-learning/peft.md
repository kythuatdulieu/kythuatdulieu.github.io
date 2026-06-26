---
title: "Parameter-Efficient Fine-Tuning (PEFT) & LoRA"
difficulty: "Advanced"
tags: ["peft", "lora", "fine-tuning", "llm", "genai", "qlora"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Kiến trúc hệ thống PEFT & LoRA trong tinh chỉnh LLM"
metaDescription: "Tìm hiểu kiến trúc vật lý của PEFT, LoRA, QLoRA. Đánh đổi hệ thống (Trade-offs), FinOps và rủi ro vận hành OOM khi tinh chỉnh LLM."
description: "Phân tích chuyên sâu về Parameter-Efficient Fine-Tuning (PEFT). Thay vì coi đây là một phép màu, hãy nhìn nó dưới góc độ thiết kế hệ thống, quản lý memory bottleneck và cost-optimization (FinOps)."
---

Bỏ qua các định nghĩa sách giáo khoa, **Parameter-Efficient Fine-Tuning (PEFT)** không phải là một "phép màu" của AI. Dưới góc nhìn kiến trúc hệ thống, PEFT đơn thuần là một bài toán **tối ưu hóa Memory IO (VRAM) và tính toán Ma trận** để giải quyết nút thắt cổ chai (bottleneck) khổng lồ mang tên *Optimizer States* trong quá trình Full Fine-Tuning (FFT).

Khi train một mô hình 7B tham số (ví dụ LLaMA-2) bằng FFT với AdamW, bạn không chỉ cần lưu trọng số mô hình (14GB ở fp16). Bạn cần ít nhất **100-120GB VRAM** để chứa Gradients, Activations, và Optimizer states (Momentum, Variance). Sự ra đời của PEFT, đặc biệt là **LoRA (Low-Rank Adaptation)**, chuyển đổi bài toán cập nhật không gian trạng thái khổng lồ thành một bài toán xấp xỉ hạng thấp (low-rank approximation).

## 1. Kiến trúc Thực thi Vật lý (Physical Execution)

### Nguyên lý hoạt động của LoRA
Thay vì cập nhật trực tiếp ma trận trọng số $W \in \mathbb{R}^{d \times k}$ (có kích thước rất lớn), LoRA "đóng băng" (freeze) $W$ và tiêm (inject) hai ma trận hạng thấp $A$ và $B$ vào luồng tính toán (forward pass). 

Sự thay đổi của trọng số được biểu diễn:
$\Delta W = B \times A$

Trong đó:
- $B \in \mathbb{R}^{d \times r}$, khởi tạo bằng 0.
- $A \in \mathbb{R}^{r \times k}$, khởi tạo bằng phân phối Gauss.
- $r \ll \min(d, k)$ là *rank* (hạng), thường là 8, 16, hoặc 32.

![LoRA Architecture](/images/9-genai-machine-learning/lora_architecture.png)
*(Hình ảnh mô tả kiến trúc LoRA - Ma trận $A$ và $B$ được cộng vào đầu ra của $W$ gốc)*

Khi đi qua layer, output $h$ sẽ được tính bằng:
$h = Wx + \Delta Wx = Wx + BAx$

**Hiệu ứng Vật lý (Physical Impact):** 
Việc này giảm trực tiếp dung lượng RAM dành cho quá trình backward pass. Thay vì tính gradient cho ma trận $d \times k$ (hàng triệu tham số), GPU chỉ cần tính gradient cho hai ma trận $d \times r$ và $r \times k$ (vài nghìn tham số).

### QLoRA: Ép kiểu dữ liệu (Quantization) kết hợp LoRA
Nếu LoRA giải quyết bài toán Optimizer Memory, thì **QLoRA** giải quyết bài toán Model Memory. QLoRA (Quantized LoRA) ép kiểu trọng số gốc $W$ xuống định dạng 4-bit NormalFloat (NF4), trong khi vẫn tính toán gradient ở fp16 hoặc bf16.

```mermaid
flowchart TD
    subgraph GPU_VRAM
        W_4bit["Frozen Base Model("4-bit NF4")\n~4GB cho 7B model"] 
        A_bf16["LoRA Adapter A (bf16)"]
        B_bf16["LoRA Adapter B (bf16)"]
        Opt["Paged AdamW Optimizer States\n("Giảm từ 42GB xuống < 2GB")"]
    end
    W_4bit --> Forward_Pass
    A_bf16 --> Forward_Pass
    B_bf16 --> Forward_Pass
    Forward_Pass --> Loss
    Loss -->|Backward| A_bf16
    Loss -->|Backward| B_bf16
```

## 2. Show, Don't Tell: Cấu hình QLoRA Thực chiến

Dưới đây là đoạn code thực chiến khởi tạo QLoRA pipeline bằng Python. Chú ý cấu hình `BitsAndBytesConfig` để ép kiểu (Quantize) và cấu hình `LoraConfig` để tiêm Adapter.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

# 1. Cấu hình Quantization (Ép kiểu)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,       # Nested quantization tiết kiệm thêm VRAM
    bnb_4bit_quant_type="nf4",            # Định dạng tối ưu cho weights phân phối chuẩn
    bnb_4bit_compute_dtype=torch.bfloat16 # Giữ độ chính xác khi tính toán forward/backward
)

# 2. Tải Base Model (Freeze automatically)
model_id = "meta-llama/Llama-2-7b-hf"
model = AutoModelForCausalLM.from_pretrained(
    model_id, 
    quantization_config=bnb_config,
    device_map="auto" # Tự động spill out sang CPU RAM nếu VRAM cạn kiệt
)
model = prepare_model_for_kbit_training(model)

# 3. Cấu hình LoRA Adapter
peft_config = LoraConfig(
    r=16, 
    lora_alpha=32,       # Scaling factor: Alpha càng lớn, trọng lượng của LoRA càng cao
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"], # Target các Attention Heads
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

# 4. Bọc Model với PEFT
peft_model = get_peft_model(model, peft_config)
peft_model.print_trainable_parameters()
# Output: trainable params: 15,990,784 || all params: 6,754,406,400 || trainable%: 0.2367%
```

## 3. Rủi ro Vận hành (Operational Risks) & Troubleshooting

Trong thực tế, khi scale việc huấn luyện lên các môi trường như Kubernetes hay Ray Clusters, hệ thống có thể gặp nhiều Incidents.

### Incident 1: OOMKilled (Out-of-Memory) do Gradient Checkpointing chưa bật
- **Triệu chứng:** Container bị kill với mã lỗi 137 (OOM) ở epoch thứ 2, mặc dù đã dùng QLoRA.
- **Root Cause:** Dù số lượng tham số huấn luyện ít, kích thước *Activations* sinh ra trong Forward pass ở các context length dài (như 4096 tokens) vẫn lấp đầy VRAM.
- **Cách khắc phục:** Đổi CPU tính toán thời gian (Compute) lấy VRAM (Memory) bằng kỹ thuật Gradient Checkpointing. Thay vì lưu tất cả activations, hệ thống chỉ lưu một số node và tính toán lại phần còn lại trong lúc backward.
  ```python
  model.gradient_checkpointing_enable()
  ```

### Incident 2: "Spill-to-disk" gây chết Throughput
- **Triệu chứng:** GPU utilization rớt xuống 5-10%, tốc độ train cực chậm.
- **Root Cause:** Cấu hình `device_map="auto"` của `accelerate` phát hiện thiếu VRAM và đẩy một phần weights/optimizer sang CPU RAM hoặc tệ hơn là swap disk (NVMe). IO bottleneck giữa CPU và GPU (PCIe bus) kéo sập hiệu năng.
- **Cách khắc phục:** Sử dụng Paged Optimizer (`optim="paged_adamw_32bit"` trong TrainingArguments) để phân trang (paging) optimizer states, đẩy vào CPU RAM khi không dùng tới và kéo lại GPU khi cần, giảm thiểu overhead tắc nghẽn IO.

## 4. Đánh đổi Hệ thống (Systemic Trade-offs)

| Tiêu chí | Full Fine-Tuning (FFT) | LoRA | QLoRA |
| :--- | :--- | :--- | :--- |
| **Throughput (Training)** | Rất chậm | Nhanh | Rất chậm (Do CPU/GPU bottleneck khi de-quantize từ 4-bit lên 16-bit) |
| **VRAM Requirement** | ~120GB (7B Model) | ~24GB | ~12GB (Vừa trên 1 RTX 3060) |
| **Inference Latency** | Không đổi (Zero penalty) | Zero penalty (nếu merge weights) | Chậm hơn (nếu giữ nguyên base 4-bit) |
| **Quality/Accuracy** | Cao nhất (Khó giữ kiến thức gốc) | 95-99% của FFT (Giữ vững kiến thức gốc) | Tương đương LoRA |

**Merge Weights vs. Dynamic Adapters trong Serving:**
- **Merge Weights (Static):** Bạn cộng cứng $W' = W + BA$ và lưu thành mô hình mới. Latency khi inference bằng 0. Nhưng mất đi tính linh hoạt.
- **Multi-tenant Serving (Dynamic):** Các hệ thống hiện đại như **vLLM** hay **SGLang** hỗ trợ tải 1 Base Model duy nhất (chiếm 14GB VRAM) và hoán đổi linh hoạt (hot-swap) hàng trăm LoRA Adapters (mỗi adapter ~50MB) tuỳ theo Request (ví dụ Request A gọi bot CSKH, Request B gọi bot Sales). **Trade-off:** Giảm FinOps cost cực mạnh, nhưng tăng Compute Latency ở khâu dispatching request vào đúng Adapter.

## 5. Tối ưu Chi phí (FinOps)

Sử dụng LoRA không chỉ tiết kiệm phần cứng huấn luyện mà còn tác động mạnh mẽ đến FinOps trong giai đoạn Deployment (Serving).
Giả sử bạn cần phục vụ 10 khách hàng B2B, mỗi khách hàng cần 1 model được fine-tune riêng.
- **Nếu dùng FFT:** Bạn phải deploy 10 bản sao của LLM 7B. (10 x 14GB = 140GB VRAM). Cần thuê ít nhất 2x A100 80GB (Cost: ~\$6,000/tháng/node).
- **Nếu dùng LoRA + vLLM:** Bạn deploy **1 Base Model (14GB)** + **10 LoRA adapters (10 x 50MB = 500MB)**. Tổng cộng < 15GB VRAM. Phục vụ toàn bộ trên một con GPU L4 hoặc A10G duy nhất. Tiết kiệm hơn **80%** chi phí cloud.

---

## Nguồn Tham Khảo (References)
1. Hu, E. J., et al. (2021). *LoRA: Low-Rank Adaptation of Large Language Models*. arXiv preprint [arXiv:2106.09685](https://arxiv.org/abs/2106.09685).
2. Dettmers, T., et al. (2023). *QLoRA: Efficient Finetuning of Quantized LLMs*. arXiv preprint [arXiv:2305.14314](https://arxiv.org/abs/2305.14314).
3. [Hugging Face PEFT Library Documentation](https://huggingface.co/docs/peft/index)
4. [vLLM Documentation: LoRA support](https://docs.vllm.ai/en/latest/models/lora.html)
5. AWS Machine Learning Blog: *Memory-efficient fine-tuning of large language models on Amazon SageMaker*
