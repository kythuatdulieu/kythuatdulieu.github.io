---
title: "Tinh chỉnh hiệu quả tham số (PEFT)"
difficulty: "Advanced"
tags: ["peft", "lora", "fine-tuning", "llm", "genai"]
readingTime: "14 mins"
lastUpdated: 2026-06-16
seoTitle: "PEFT là gì? Các kỹ thuật tinh chỉnh LLM hiệu quả (LoRA, QLoRA)"
metaDescription: "Tìm hiểu Parameter-Efficient Fine-Tuning (PEFT) và LoRA - kỹ thuật cách mạng giúp tinh chỉnh Mô hình Ngôn ngữ Lớn (LLM) trên một GPU duy nhất với chi phí thấp."
description: "Việc huấn luyện hay tinh chỉnh (fine-tune) các Mô hình Ngôn ngữ Lớn (LLM) từng được coi là cuộc chơi độc quyền của các ông lớn công nghệ sở hữu tiềm l..."
---



Việc huấn luyện hay tinh chỉnh (fine-tune) các Mô hình Ngôn ngữ Lớn (LLM) từng được coi là cuộc chơi độc quyền của các ông lớn công nghệ sở hữu tiềm lực tài chính khổng lồ. Tuy nhiên, sự ra đời của **PEFT (Parameter-Efficient Fine-Tuning)** đã làm thay đổi hoàn toàn cục diện, dân chủ hóa khả năng tạo ra các mô hình AI tùy chỉnh.

PEFT là thuật ngữ chung chỉ các phương pháp cho phép Fine-tune các Mô hình Ngôn ngữ Lớn (LLM) bằng cách chỉ cập nhật một số lượng tham số rất nhỏ. Việc này giúp giảm thiểu hàng chục lần chi phí tính toán và yêu cầu bộ nhớ so với quá trình Full Fine-tuning, trong khi vẫn đạt được hiệu suất gần như tương đương.

## Tại sao chúng ta cần PEFT?



Trước khi PEFT ra đời, để tinh chỉnh một mô hình như GPT-3 hay LLaMA cho một tác vụ cụ thể, chúng ta thường sử dụng **Full Fine-Tuning**. Phương pháp này yêu cầu cập nhật lại toàn bộ các trọng số (weights) của mô hình. Điều này mang đến một số vấn đề lớn:

1. **Chi phí tính toán khổng lồ**: Tinh chỉnh mô hình hàng tỷ tham số yêu cầu nhiều card đồ họa (GPU) cấu hình cao (như A100 80GB), gây tốn kém hàng nghìn đến hàng chục nghìn đô la.
2. **Quản lý bộ nhớ (VRAM)**: Ngoài trọng số mô hình, quá trình huấn luyện còn cần bộ nhớ cho optimizer states (như AdamW), gradients, và activations. Do đó, một mô hình 7B cần tới hơn 100GB VRAM để Full Fine-tune.
3. **Catastrophic Forgetting (Quên thảm họa)**: Khi huấn luyện lại toàn bộ tham số trên dữ liệu mới, mô hình có thể "quên" những kiến thức chung đã được học trong giai đoạn pre-training.
4. **Lưu trữ**: Mỗi tác vụ tinh chỉnh tạo ra một bản sao toàn bộ mô hình (dung lượng hàng chục GB), khiến việc triển khai (deployment) cho nhiều khách hàng hoặc tác vụ khác nhau trở nên bất khả thi.

PEFT giải quyết triệt để những vấn đề này bằng cách đóng băng (freeze) phần lớn các tham số gốc của mô hình và chỉ huấn luyện một số lượng nhỏ các tham số bổ sung (thường chiếm khoảng 1% đến 5% tổng số tham số).

## Các kỹ thuật PEFT phổ biến

### 1. LoRA (Low-Rank Adaptation)

**LoRA** là một trong những kỹ thuật PEFT phổ biến và hiệu quả nhất hiện nay, được giới thiệu bởi các nhà nghiên cứu từ Microsoft. Thay vì cập nhật trực tiếp ma trận trọng số $W$ có kích thước lớn ($d \times k$), LoRA đóng băng $W$ và học một ma trận cập nhật $\Delta W$ thông qua hai ma trận hạng thấp (low-rank matrices) $A$ và $B$.

Cụ thể, $\Delta W = B \times A$, trong đó:
- $B$ có kích thước $d \times r$
- $A$ có kích thước $r \times k$
- $r$ là rank, thường có giá trị rất nhỏ (ví dụ: 4, 8, 16) so với $d$ và $k$.

Nhờ đó, số lượng tham số cần cập nhật giảm đi đáng kể. Khi suy luận (inference), ma trận $B \times A$ đơn giản được cộng thẳng vào ma trận gốc $W$, do đó **không có độ trễ bổ sung (zero inference latency)**.

### 2. QLoRA (Quantized LoRA)

**QLoRA** là sự tiến hóa của LoRA, kết hợp với các kỹ thuật lượng tử hóa (quantization). Nó lượng tử hóa mô hình gốc xuống mức độ chính xác thấp hơn (ví dụ: 4-bit NormalFloat) để giảm lượng VRAM cần thiết xuống tối đa, trong khi vẫn huấn luyện các tham số LoRA (A và B) ở độ chính xác cao hơn (như 16-bit bfloat16).

Với QLoRA, bạn có thể tinh chỉnh mô hình 33B tham số trên một GPU duy nhất có 24GB VRAM!

### 3. Prefix Tuning và Prompt Tuning

Các phương pháp này không chạm vào cấu trúc bên trong của mô hình. Thay vào đó, chúng tối ưu hóa các vector đặc trưng (embeddings) ở đầu vào (input) hoặc ở các tầng (layers) của mô hình.

- **Prompt Tuning**: Thêm một số "soft prompt" (các vector liên tục có thể huấn luyện) vào đầu dãy input embedding. Mô hình sẽ học cách điều chỉnh các soft prompt này để định hướng kết quả đầu ra.
- **Prefix Tuning**: Tương tự như Prompt Tuning, nhưng các "prefix" được thêm vào mọi layer (tầng) của mô hình thay vì chỉ ở layer đầu vào. Kỹ thuật này thường được áp dụng tốt cho các mô hình tự hồi quy (autoregressive) và mô hình dạng encoder-decoder.

### 4. Adapters

Kỹ thuật này chèn thêm các mô-đun mạng nơ-ron nhỏ (gọi là "adapters") vào giữa các layer hiện có của mạng Transformer. Trong quá trình tinh chỉnh, chỉ các adapter modules này được cập nhật, trong khi toàn bộ mạng Transformer gốc bị đóng băng.

## Lợi ích của PEFT

* **Giảm chi phí phần cứng**: Có thể huấn luyện LLM trên phần cứng tiêu dùng (như RTX 3090, 4090) thay vì phải thuê cụm GPU đắt đỏ.
* **Huấn luyện nhanh hơn**: Do tính toán gradients trên ít tham số hơn, quá trình backpropagation diễn ra nhanh chóng hơn.
* **Linh hoạt khi triển khai**: Với LoRA, bạn chỉ cần lưu các file trọng số nhỏ (thường vài chục MB). Một mô hình nền tảng duy nhất có thể tải linh hoạt nhiều bộ trọng số LoRA khác nhau (gọi là LoRA adapters) cho các tác vụ riêng biệt mà không cần tải lại toàn bộ mô hình gốc.
* **Hạn chế Catastrophic Forgetting**: Mô hình vẫn giữ được kiến thức nền tảng vững chắc do phần lớn trọng số ban đầu bị đóng băng.

## Triển khai thực tế với thư viện PEFT

Hugging Face đã phát triển thư viện `peft`, tích hợp sâu với `transformers`, giúp việc sử dụng PEFT trở nên cực kỳ đơn giản:

```python
from transformers import AutoModelForCausalLM
from peft import get_peft_model, LoraConfig, TaskType

# Tải mô hình gốc (sẽ tự động được freeze)
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")

# Định nghĩa cấu hình LoRA
peft_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    inference_mode=False,
    r=8,              # rank
    lora_alpha=32,    # scaling factor
    lora_dropout=0.1,
    target_modules=["q_proj", "v_proj"] # Các ma trận mục tiêu
)

# Áp dụng LoRA vào mô hình
peft_model = get_peft_model(model, peft_config)

# Kiểm tra số tham số cần huấn luyện
peft_model.print_trainable_parameters()
# Đầu ra mẫu: trainable params: 4194304 || all params: 6742609920 || trainable%: 0.0622
```

Với chỉ vài dòng code, bạn đã sẵn sàng tinh chỉnh một LLM hàng tỷ tham số!

## Tài Liệu Tham Khảo

* [LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021)](https://arxiv.org/abs/2106.09685)
* [QLoRA: Efficient Finetuning of Quantized LLMs (Dettmers et al., 2023)](https://arxiv.org/abs/2305.14314)
* [Hugging Face PEFT Documentation](https://huggingface.co/docs/peft/index)
* [Prefix-Tuning: Optimizing Continuous Prompts for Generation (Li & Liang, 2021)](https://arxiv.org/abs/2101.00190)
* [The Power of Scale for Parameter-Efficient Prompt Tuning (Lester et al., 2021)](https://arxiv.org/abs/2104.08691)
