---
title: "Kiến trúc PEFT & LoRA: Tối Ưu Hóa VRAM và Multi-Tenant Serving"
difficulty: "Advanced"
tags: ["peft", "lora", "fine-tuning", "llm", "genai", "qlora", "finops", "system-design"]
readingTime: "15 mins"
lastUpdated: 2026-06-29
seoTitle: "Kiến trúc hệ thống PEFT: LoRA, QLoRA, Prefix Tuning & FinOps"
metaDescription: "Phân tích kiến trúc PEFT (LoRA, Prefix Tuning, Adapters) dưới góc nhìn hệ thống. Tối ưu hóa VRAM, xử lý OOMKilled, và chiến lược FinOps với vLLM."
description: "Parameter-Efficient Fine-Tuning (PEFT) không phải là phép màu. Dưới góc độ Kỹ sư hệ thống, PEFT là bài toán tối ưu hóa Memory I/O để giải quyết nút thắt cổ chai của Optimizer States trong Full Fine-Tuning."
---

Bỏ qua các định nghĩa học thuật, **Parameter-Efficient Fine-Tuning (PEFT)** không phải là một "phép màu" của AI. Dưới góc nhìn Kiến trúc Hệ thống, PEFT đơn thuần là bài toán **tối ưu hóa Memory I/O (VRAM) và tính toán Ma trận** để giải quyết nút thắt cổ chai khổng lồ mang tên *Optimizer States*.

Khi train mô hình 7B (như LLaMA-3) bằng Full Fine-Tuning (FFT) với AdamW, bạn không chỉ cần 14GB để lưu Trọng số (Weights). Bạn cần tới **>120GB VRAM** để chứa Gradients, Activations, và Optimizer states. PEFT sinh ra để giải quyết rào cản vật lý này.

---

## 1. Phân Loại Kiến Trúc PEFT

Các kỹ thuật PEFT can thiệp vào mô hình theo các cách khác nhau, tạo ra các Trade-offs (Sự đánh đổi) về Compute và Expressivity (Khả năng biểu diễn):

*   **Additive Methods (Adapters & Prompt/Prefix Tuning):** Thêm các mạng neural siêu nhỏ (Bottleneck adapters) vào giữa các layer, hoặc nối thêm các Vector ảo (Prefix/Soft Prompts) vào đầu vào.
    *   *Trade-off:* Tốn rất ít VRAM nhưng làm tăng **Inference Latency** do mô hình phải chạy qua các node mới.
*   **Reparameterization (LoRA):** Tham số hóa lại trọng số. Thay đổi cách tính toán ma trận mà không làm thay đổi kiến trúc gốc.
    *   *Trade-off:* Zero Inference Latency (nếu merge weights), cân bằng hoàn hảo giữa VRAM và độ chính xác.

---

## 2. Vật Lý Hệ Thống: LoRA & QLoRA

### A. LoRA (Low-Rank Adaptation)
Thay vì cập nhật trực tiếp ma trận trọng số $W \in \mathbb{"R"}^{d \times k}$ khổng lồ, LoRA "đóng băng" (freeze) $W$ và tiêm (inject) hai ma trận hạng thấp $A$ và $B$ song song.

Sự thay đổi trọng số: $\Delta W = B \times A$
Với $B \in \mathbb{"R"}^{d \times r}$ và $A \in \mathbb{"R"}^{r \times k}$ (Rank $r$ rất nhỏ, VD: $8, 16$).

Khi đi qua layer, output $h$ được tính bằng:
$h = Wx + \Delta Wx = Wx + BAx$

**Vật lý bộ nhớ:** Thay vì tính đạo hàm (Gradients) cho ma trận 10,000 x 10,000 (100 triệu tham số), GPU chỉ tính đạo hàm cho hai ma trận $10,000 \times 8$ và $8 \times 10,000$ (160 ngàn tham số). VRAM rớt thẳng đứng từ 120GB xuống 24GB.

### B. QLoRA (Quantized LoRA)
Nếu LoRA giải quyết bài toán *Optimizer Memory*, thì **QLoRA** giải quyết bài toán *Model Memory*. 
QLoRA ép kiểu trọng số gốc $W$ từ 16-bit xuống định dạng **4-bit NormalFloat (NF4)**. Mô hình 7B giờ đây chỉ chiếm ~4GB VRAM, cho phép fine-tune trên card RTX 3060 dân dụng.

---

## 3. FinOps & Kiến trúc Multi-Tenant Serving

LoRA không chỉ tiết kiệm phần cứng huấn luyện, nó thay đổi hoàn toàn kiến trúc **Model Serving (Inference)**.

Giả sử bạn làm một nền tảng SaaS có 100 khách hàng B2B. Mỗi khách hàng cần một LLM 7B được Fine-tune riêng cho data của họ.
- **Nếu dùng FFT:** Bạn phải host 100 con LLM 7B (100 x 14GB = 1,400GB VRAM). Bạn sẽ phá sản vì tiền thuê GPU.
- **Nếu dùng LoRA (Multi-tenant Serving):** Bạn dùng các engine như **vLLM** hoặc **SGLang**. Kiến trúc này chỉ tải đúng **1 Base Model (14GB VRAM)** lên GPU. 100 bản Fine-tune của khách hàng được lưu dưới dạng 100 LoRA Adapters (mỗi cái ~50MB). Khi Request của khách hàng A tới, vLLM sẽ **Hot-swap (Hoán đổi nóng)** Adapter A vào Base Model trong vài mili-giây.

**Kết quả FinOps:** Bạn phục vụ 100 khách hàng chỉ với 1 card A10G. Tiết kiệm **99% chi phí hạ tầng**.

---

## 4. Rủi ro Vận hành (Operational Risks) & Troubleshooting

Trong thực tế, khi cấu hình PEFT trên Production, bạn sẽ gặp các sự cố "cháy máy" sau:

### Incident 1: OOMKilled do Activations
- **Triệu chứng:** Container bị kill với mã lỗi OOM (137) ở epoch 2, dù đã dùng QLoRA.
- **Căn nguyên:** Lượng RAM dùng cho Weights/Optimizer đã giảm, nhưng RAM dùng cho **Activations** (giá trị trung gian của Forward pass lưu lại để tính Backward) phình to khủng khiếp khi Context Window dài (VD: 4096 tokens).
- **Khắc phục:** Bật **Gradient Checkpointing** (`model.gradient_checkpointing_enable()`). Đổi Compute lấy VRAM. Thay vì lưu toàn bộ Activations, hệ thống xóa bớt và tính lại (recompute) khi cần.

### Incident 2: Tắc nghẽn PCIe (Spill-to-Disk Thrashing)
- **Triệu chứng:** GPU utilization rớt xuống 5%, tốc độ train chậm 100x.
- **Căn nguyên:** Dùng `device_map="auto"`. Framework phát hiện thiếu VRAM nên tự động đẩy Optimizer states ra CPU RAM hoặc ổ cứng NVMe. Băng thông PCIe bus bị bão hòa (Thrashing).
- **Khắc phục:** Sử dụng **Paged Optimizer** (`optim="paged_adamw_32bit"`). Kỹ thuật này phân trang (paging) bộ nhớ một cách thông minh, chỉ đẩy dữ liệu ra CPU RAM khi cực kỳ cần thiết và kéo lại GPU kịp thời.

---

## 5. Code Thực Chiến (HuggingFace PEFT)

Cấu hình an toàn để Fine-tune LLaMA-3 chống OOMKilled:

```python
import torch
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

# 1. Cấu hình QLoRA (4-bit NF4)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,       # Tiết kiệm thêm VRAM
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16 # Chống Gradient Overflow (Loss Spikes)
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3-8B", 
    quantization_config=bnb_config,
    device_map="auto" 
)

# 2. Chống OOMKilled do Activations phình to
model.gradient_checkpointing_enable()
model = prepare_model_for_kbit_training(model)

# 3. Cấu hình LoRA Adapter
peft_config = LoraConfig(
    r=32,                # Rank
    lora_alpha=64,       # Scaling factor
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"], 
    lora_dropout=0.05,
    task_type="CAUSAL_LM"
)

peft_model = get_peft_model[model, peft_config]
peft_model.print_trainable_parameters()
```

---

## Nguồn Tham Khảo
1. Hu, E. J., et al. (2021). [LoRA: Low-Rank Adaptation of Large Language Models][https://arxiv.org/abs/2106.09685].
2. Dettmers, T., et al. (2023). [QLoRA: Efficient Finetuning of Quantized LLMs][https://arxiv.org/abs/2305.14314].
3. [vLLM Documentation: LoRA support & Multi-tenant Serving](https://docs.vllm.ai/en/latest/]
