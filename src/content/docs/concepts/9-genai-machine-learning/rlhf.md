---
title: "Học tăng cường từ phản hồi của con người - RLHF"
difficulty: "Advanced"
tags: ["rlhf", "genai", "llm", "reinforcement-learning", "alignment"]
readingTime: "25 mins"
lastUpdated: 2026-06-26
seoTitle: "RLHF & DPO - Kiến trúc Hệ thống, FinOps và Vận hành"
metaDescription: "Kiến trúc hệ thống của RLHF và DPO. Phân tích FinOps, quản lý VRAM với DeepSpeed ZeRO-3, Ray (OpenRLHF) và các rủi ro vận hành (OOMKilled, Reward Hacking)."
description: "Phân tích sâu về hệ thống Alignment cho LLMs (RLHF, DPO). Làm thế nào để duy trì 4 models (Actor, Critic, Reward, Reference) trong VRAM mà không bị OOM, và sự đánh đổi FinOps khi triển khai PPO."
---

RLHF (Reinforcement Learning from Human Feedback) không chỉ là một thuật toán, mà dưới góc nhìn Data/ML Engineering, đây là một hệ thống phân tán phức tạp nhằm "căn chỉnh" (align) các Large Language Models (LLM) đã qua giai đoạn Pre-training. Nếu Pre-training dạy model cách dự đoán token tiếp theo, thì RLHF dạy model cách tuân thủ định dạng và an toàn (Helpful, Honest, Harmless).

Tuy nhiên, việc triển khai RLHF bằng PPO (Proximal Policy Optimization) trong môi trường production là một bài toán đánh đố về FinOps và Memory Management. Bài viết này sẽ mổ xẻ kiến trúc vật lý của RLHF, cách cấu hình DeepSpeed/Ray để tránh OOMKilled, và tại sao ngành công nghiệp đang chuyển dịch sang DPO (Direct Preference Optimization).

## Kiến trúc Thực thi Vật lý của RLHF (Physical Execution)

Quá trình RLHF cổ điển (được OpenAI ứng dụng cho InstructGPT) bao gồm 3 pipeline dữ liệu:

1.  **Supervised Fine-Tuning (SFT):** Bootstrap model với dữ liệu chất lượng cao.
2.  **Reward Modeling (RM):** Traning một model thứ hai (Reward Model) để chấm điểm câu trả lời thay cho con người.
3.  **PPO (Reinforcement Learning):** Actor model sinh ra token, RM chấm điểm, và PPO update trọng số Actor.

![HuggingFace RLHF Pipeline](/images/9-genai-machine-learning/rlhf_huggingface.png)
*Kiến trúc luồng dữ liệu 3 bước của RLHF. (Nguồn: Hugging Face)*

### Tại sao PPO lại là một "cơn ác mộng" về VRAM?

Khác với quá trình SFT thông thường chỉ cần load 1 model và tính gradient, PPO yêu cầu bạn phải load **4 Models** vào trong GPU Cluster cùng một lúc.

```mermaid
graph TD
    subgraph GPU_Memory ["GPU VRAM("DeepSpeed ZeRO-3")"]
        A["Actor Model / Policy<br/>Requires Gradients"]
        B["Reference Model<br/>Frozen, Inference Only"]
        C["Critic Model / Value Head<br/>Requires Gradients"]
        D["Reward Model<br/>Frozen, Inference Only"]
    end

    Prompt["Batch Prompts"] --> A
    A -->|Rollout: Generated Tokens| D
    A -->|Generated Tokens| B
    B -->|Calculate KL Penalty| Penalty["KL Divergence"]
    D -->|Reward Score| Reward[Reward]
    Reward --> Combine["Reward - KL Penalty"]
    Combine --> C
    C -->|Advantage Estimation| PPO_Loss["PPO Loss"]
    PPO_Loss -->|Backward Pass| A
    PPO_Loss -->|Backward Pass| C
```

Nếu bạn train một model Llama-3 8B, bản thân trọng số (fp16) đã chiếm khoảng 16GB.
*   **Actor Model:** Cần VRAM cho Weights, Gradients, Optimizer States (Adam = 2x weights). ~ 64GB.
*   **Critic Model:** Tương đương Actor, ~ 64GB.
*   **Reference Model:** Chỉ cần Weights. ~ 16GB.
*   **Reward Model:** Chỉ cần Weights. ~ 16GB.

Tổng cộng VRAM yêu cầu vượt quá dung lượng của một con GPU H100 80GB mạnh nhất hiện nay.

### Code Thực chiến: Cấu hình DeepSpeed ZeRO-3 cho TRL PPO

Để vượt qua giới hạn vật lý này, chúng ta không thể dùng DP (Data Parallel) thuần túy. Ta buộc phải cấu hình **DeepSpeed ZeRO-3** để "chặt nhỏ" (shard) trọng số, gradients, và optimizer states của cả 4 models ra rải rác trên nhiều GPUs.

Dưới đây là một cấu hình `deepspeed_config.json` thực tế khi kết hợp cùng `trl` (Transformer Reinforcement Learning) của Hugging Face:

```json
{
  "train_batch_size": 128,
  "train_micro_batch_size_per_gpu": 4,
  "gradient_accumulation_steps": 8,
  "zero_optimization": {
    "stage": 3,
    "offload_optimizer": {
      "device": "cpu",
      "pin_memory": true
    },
    "offload_param": {
      "device": "cpu",
      "pin_memory": true
    },
    "overlap_comm": true,
    "contiguous_gradients": true,
    "reduce_bucket_size": 5e7,
    "stage3_prefetch_bucket_size": 5e7,
    "stage3_param_persistence_threshold": 1e5
  },
  "gradient_clipping": 1.0,
  "fp16": {
    "enabled": true,
    "loss_scale": 0,
    "loss_scale_window": 1000,
    "initial_scale_power": 16,
    "hysteresis": 2
  }
}
```

Và cách khởi chạy PPO Trainer thông qua `accelerate`:

```bash
accelerate launch --config_file accelerate_config.yaml \
    --num_processes 8 \
    train_ppo.py \
    --model_name "meta-llama/Meta-Llama-3-8B" \
    --reward_model "reward-model-8b" \
    --learning_rate 1.41e-5 \
    --mini_batch_size 4 \
    --gradient_checkpointing True
```

**Trade-off (Compute vs. Memory):** Bật `offload_optimizer` sang CPU và dùng `gradient_checkpointing=True` (lưu lại các node kích hoạt thay vì lưu toàn bộ computation graph) giúp chúng ta nhét vừa 4 models vào cụm GPUs (như 8x A100). Đánh đổi lại, Compute Latency tăng lên khoảng 20-30% do overhead của CPU-GPU PCIe bus transfer và việc phải tính toán lại forward pass (re-materialization) khi tính gradient.

---

## Direct Preference Optimization (DPO): Đột phá về FinOps

Bởi vì PPO quá nặng nề về chi phí vận hành (FinOps) và hạ tầng, giới nghiên cứu đã giới thiệu **DPO (Direct Preference Optimization)**. 

DPO tái cấu trúc toán học của PPO. Thay vì cần một Reward Model chấm điểm độc lập, DPO tối ưu trực tiếp Policy Model (Actor) bằng cách coi chính nó là một Reward Model ngầm định.

**Về mặt hệ thống, DPO giải phóng chúng ta khỏi 2 gánh nặng:**
1.  **Chỉ còn 2 Models trong VRAM:** Actor (Policy) và Reference Model. Hoàn toàn loại bỏ Reward và Critic Models. Giảm ~50% VRAM requirements.
2.  **Ổn định tính toán (No Rollouts):** PPO yêu cầu "Generation/Rollout phase" liên tục sinh ra token, làm GPU idle chờ đợi. DPO chỉ cần thực hiện standard Forward/Backward pass (Cross-Entropy style), giúp GPU Utilization có thể đạt 95%+.

### DPO Configuration với Hugging Face TRL

Dữ liệu đầu vào của DPO chỉ cần một cặp: `prompt`, `chosen_response`, và `rejected_response`. Dưới đây là config chuẩn:

```python
import torch
from trl import DPOConfig, DPOTrainer
from transformers import AutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset

model_id = "mistralai/Mistral-7B-v0.1"

# Load policy và reference model (có thể load reference trong 4-bit quantization để tiết kiệm thêm VRAM)
policy_model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.bfloat16)
ref_model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.bfloat16)
tokenizer = AutoTokenizer.from_pretrained(model_id)

dataset = load_dataset("Anthropic/hh-rlhf", split="train[:1000]")

dpo_config = DPOConfig(
    output_dir="./dpo_mistral",
    beta=0.1, # KL penalty coefficient. Quyết định mức độ model được phép chệch khỏi ref_model
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=5e-6,
    max_length=1024,
    max_prompt_length=512,
    gradient_checkpointing=True, # Bắt buộc bật để tránh OOM
    bf16=True, # Dùng bf16 cho Ampere+ GPUs để tránh NaN loss
)

trainer = DPOTrainer(
    model=policy_model,
    ref_model=ref_model,
    args=dpo_config,
    train_dataset=dataset, # Dataset format yêu cầu: prompt, chosen, rejected
    tokenizer=tokenizer,
)

trainer.train()
```

---

## Rủi ro Vận hành và Sự cố Thực tế (Operational Incidents)

### 1. Sự cố Reward Hacking & Mode Collapse
Trong RLHF, mô hình rất thông minh trong việc "khai thác lỗ hổng" của Reward Model. Ví dụ: Nếu Reward Model vô tình chấm điểm cao cho những câu trả lời "dài", Policy Model sẽ sinh ra các đoạn văn lặp đi lặp lại vô nghĩa chỉ để tối đa hóa độ dài.

**Cách khắc phục:** 
Đây là lý do Reference Model tồn tại. Hàm phần thưởng thực tế bị phạt bởi chỉ số **KL Divergence**.

$$ R(x, y) = r_\theta(x, y) - \beta \log \frac{\pi_\phi(y|x)}{\pi_{ref}(y|x)} $$

Nếu $\beta$ (hệ số phạt KL) cấu hình quá nhỏ -> Model bị Mode Collapse (sinh text vô nghĩa). 
Nếu $\beta$ quá lớn -> Model bám chặt lấy bản gốc, điểm Reward không tăng, quá trình học thất bại. Vận hành RLHF tốn rất nhiều chu kỳ compute chỉ để dò siêu tham số $\beta$ này.

### 2. VRAM Fragmentation & OOMKilled do Context Length Variable
Trong pha generation (Rollout) của PPO, LLM sinh ra câu trả lời có độ dài ngẫu nhiên. Nếu một batch chứa toàn những câu trả lời đạt max-token, KV Cache sẽ phình to đột biến, dẫn đến **VRAM Fragmentation** và crash `CUDA Out Of Memory` (OOMKilled) dù bộ nhớ tổng vẫn báo còn 10% VRAM trống.

**Cách khắc phục (Kiến trúc OpenRLHF):**
Các framework hiện đại cấp Enterprise (như **OpenRLHF**) giải quyết bài toán này bằng cách:
*   Tách biệt hẳn cụm **Inference (Rollout)** và cụm **Training (PPO)**. 
*   Cụm Inference dùng **vLLM (PagedAttention)** để dọn dẹp fragmentation của KV Cache và sinh token với Throughput cực cao.
*   Cụm Training thuần túy tính Gradient bằng DeepSpeed. 
*   Hai cụm này giao tiếp với nhau qua cấu trúc Ray Actor RPC. Đánh đổi lại là setup network topology phức tạp hơn nhiều so với `trl` chạy chung một process.

---

## Nguồn Tham Khảo (References)

*   **InstructGPT Architecture:** [Training language models to follow instructions with human feedback (Ouyang et al., 2022)](https://arxiv.org/abs/2203.02155) - Whitepaper gốc định hình kiến trúc RLHF.
*   **Direct Preference Optimization:** [DPO: Your Language Model is Secretly a Reward Model (Rafailov et al., 2023)](https://arxiv.org/abs/2305.18290) - Đột phá loại bỏ PPO.
*   **Hệ thống Phân tán cho RLHF:** [DeepSpeed-Chat: Easy, Fast and Affordable RLHF Training of ChatGPT-like Models at All Scales](https://arxiv.org/abs/2308.01320)
*   **OpenRLHF Architecture (Ray + vLLM):** [OpenRLHF: An Easy-to-use, Scalable and High-performance RLHF Framework](https://github.com/OpenRLHF/OpenRLHF)
*   **Hugging Face Documentation:** [TRL - Transformer Reinforcement Learning](https://huggingface.co/docs/trl/index)
