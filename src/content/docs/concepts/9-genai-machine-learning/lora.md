---
title: "Low-Rank Adaptation (LoRA)"
difficulty: "Intermediate"
tags: ["lora", "peft", "llm", "fine-tuning", "genai"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Low-Rank Adaptation (LoRA) là gì? Tinh chỉnh LLM hiệu quả"
metaDescription: "Tìm hiểu chi tiết về Low-Rank Adaptation (LoRA), kỹ thuật PEFT giúp tinh chỉnh mô hình ngôn ngữ lớn (LLM) với chi phí thấp, giảm thiểu VRAM mà vẫn giữ nguyên hiệu suất."
description: "Khi bạn muốn biến một mô hình ngôn ngữ lớn (LLM) thô thành một chuyên gia trong một lĩnh vực cụ thể (ví dụ: một bot viết mã, hỗ trợ khách hàng, hoặc phân tích y tế), việc tinh chỉnh toàn bộ mô hình là rất tốn kém. LoRA cung cấp một giải pháp thanh lịch."
---



**LoRA (Low-Rank Adaptation)** là một trong những kỹ thuật phổ biến và hiệu quả nhất thuộc nhóm **PEFT** (Parameter-Efficient Fine-Tuning - Tinh chỉnh hiệu quả tham số). Thay vì cập nhật hàng chục tỷ tham số của một Mô hình Ngôn ngữ Lớn (LLM) vốn cực kỳ tốn VRAM và thời gian huấn luyện, LoRA "đóng băng" mô hình gốc và chèn thêm một vài ma trận nhỏ (low-rank matrices) vào mạng neural. Điều này cho phép chúng ta huấn luyện một mô hình ngôn ngữ mạnh mẽ (như LLaMA 3, Mistral) chỉ bằng một GPU dân dụng.

---

## 1. Vấn đề của Full Fine-Tuning



Khi một mô hình ngôn ngữ lớn (ví dụ GPT-3 175B hoặc LLaMA 70B) được huấn luyện trước (pre-trained) trên một lượng dữ liệu khổng lồ, nó có khả năng hiểu ngôn ngữ rất tốt nhưng chưa thực hiện tốt các tác vụ chuyên biệt theo yêu cầu (như trả lời câu hỏi y tế, lập trình, tóm tắt). 

Để mô hình làm tốt một tác vụ cụ thể, chúng ta cần **Fine-Tuning** (tinh chỉnh). Phương pháp truyền thống là **Full Fine-Tuning**, trong đó:
- Chúng ta cập nhật **toàn bộ** trọng số (weights) của mô hình dựa trên tập dữ liệu mới.
- **Nhược điểm:**
  - Tốn tài nguyên: Cần cập nhật hàng tỷ tham số, yêu cầu rất nhiều VRAM cho cả mô hình, trạng thái optimizer (optimizer states), gradient, và activation.
  - Tốn không gian lưu trữ: Mỗi lần tinh chỉnh cho một tác vụ mới, chúng ta tạo ra một bản sao toàn bộ của mô hình. Nếu mô hình nặng 140GB, mười tác vụ sẽ tốn 1.4TB lưu trữ.
  - Hiện tượng **Catastrophic Forgetting** (Quên thảm hoạ): Tinh chỉnh quá mạnh có thể khiến mô hình quên những kiến thức tổng quát đã học ở pha pre-training.

---

## 2. LoRA hoạt động như thế nào?

LoRA được giới thiệu bởi các nhà nghiên cứu từ Microsoft (Hu et al., 2021). Ý tưởng cốt lõi dựa trên một giả thuyết toán học: **Sự thay đổi trọng số trong quá trình tinh chỉnh mô hình có "hạng nội tại thấp" (low intrinsic rank).**

Điều này có nghĩa là chúng ta không cần cập nhật một ma trận lớn (ví dụ $10,000 \times 10,000$), mà có thể xấp xỉ sự thay đổi đó bằng tích của hai ma trận nhỏ hơn rất nhiều.

### Toán học cốt lõi của LoRA

Giả sử $W_0 \in \mathbb{R}^{d \times k}$ là một ma trận trọng số của mô hình gốc (pre-trained weights). Trong Full Fine-Tuning, trọng số này sẽ được cập nhật thành $W = W_0 + \Delta W$.

Trong LoRA, chúng ta **đóng băng (freeze)** $W_0$ (không cập nhật nó nữa). Thay vào đó, chúng ta biểu diễn phần cập nhật $\Delta W$ bằng tích của hai ma trận có hạng thấp:
$$ \Delta W = B \times A $$
Trong đó:
- $B \in \mathbb{R}^{d \times r}$
- $A \in \mathbb{R}^{r \times k}$
- $r$ là **hạng (rank)**, một số nguyên nhỏ hơn rất nhiều so với $d$ và $k$ (thường $r = 8, 16, 32, \dots$).

Khi thực hiện lan truyền xuôi (forward pass) với đầu vào $x$:
$$ h = W_0 x + \Delta W x = W_0 x + B A x $$

Trong quá trình huấn luyện:
1. $W_0$ bị đóng băng (gradient không được tính toán cho $W_0$).
2. Ma trận $A$ được khởi tạo bằng phân phối Gauss ngẫu nhiên.
3. Ma trận $B$ được khởi tạo bằng 0 (để lúc bắt đầu, $\Delta W = 0$ và mô hình hoạt động y hệt mô hình gốc).
4. Chỉ có tham số của $A$ và $B$ được cập nhật bằng Gradient Descent.

---

## 3. Các siêu tham số (Hyperparameters) quan trọng trong LoRA

Khi áp dụng LoRA, bạn sẽ cần cấu hình một số tham số cốt lõi:

* **Rank ($r$):** Kích thước của các ma trận cập nhật. $r$ càng lớn, $\Delta W$ càng có khả năng biểu diễn các thay đổi phức tạp, nhưng cũng tốn nhiều tham số hơn. Thực tế, ngay cả $r=8$ hoặc $r=16$ cũng thường mang lại hiệu suất tương đương với Full Fine-Tuning trên nhiều bài toán.
* **Alpha ($\alpha$):** Hệ số tỉ lệ (scaling factor). Trong thực tế, đầu ra của LoRA được nhân với một tỉ lệ $\frac{\alpha}{r}$. Alpha giúp kiểm soát tầm ảnh hưởng của LoRA adapter lên trọng số gốc. Quy tắc kinh nghiệm thông dụng là đặt $\alpha = 2 \times r$.
* **Target Modules:** Những lớp nào trong mạng neural sẽ được gắn LoRA. Thường LoRA được gắn vào các thành phần của khối Attention (ví dụ: `q_proj`, `v_proj` trong LLaMA) và đôi khi cả mạng Feed-Forward (MLP). Gắn vào càng nhiều module thì số tham số huấn luyện càng tăng.
* **Dropout:** Tỷ lệ ngẫu nhiên vô hiệu hóa một số kết nối trong ma trận LoRA để tránh overfitting. Thường đặt khoảng 0.05 đến 0.1.

---

## 4. Tại sao LoRA là một bước đột phá?

1. **Tiết kiệm phần cứng cực độ:** Bằng cách đóng băng mô hình gốc và chỉ huấn luyện $A$ và $B$, LoRA giảm **90-99%** số tham số cần cập nhật. VRAM cần thiết để huấn luyện giảm đi đáng kể (do không phải lưu trữ optimizer states cho $W_0$).
2. **Không làm chậm tốc độ suy luận (No Inference Latency):** Sau khi huấn luyện xong, chúng ta có thể gộp (merge) trọng số LoRA vào mô hình gốc bằng phép cộng đơn giản: $W_{\text{merged}} = W_0 + B A$. Kết quả là một mô hình mới có cùng kiến trúc với mô hình gốc, hoàn toàn không tăng thêm thời gian tính toán khi sử dụng (inference).
3. **Chuyển đổi Adapter dễ dàng (Modular & Swappable):** Do ma trận $\Delta W$ (gọi là LoRA Adapter) rất nhỏ (thường chỉ vài chục MB), bạn có thể lưu trữ nhiều adapter cho nhiều tác vụ khác nhau. Khi cần bot trả lời y tế, bạn tải mô hình gốc (vài chục GB) lên VRAM và đính kèm adapter y tế (50MB). Khi cần lập trình, bạn tháo adapter y tế và đính kèm adapter lập trình.
4. **Hiệu suất tương đương Full Fine-Tuning:** Các nghiên cứu chỉ ra rằng dù số tham số huấn luyện ít hơn hẳn, mô hình được tinh chỉnh bằng LoRA có hiệu năng không kém gì (đôi khi tốt hơn) so với mô hình tinh chỉnh toàn bộ tham số, đặc biệt trong các tác vụ thiếu dữ liệu.

---

## 5. Ví dụ mã nguồn: Tinh chỉnh bằng thư viện PEFT

Thư viện `peft` của Hugging Face giúp việc áp dụng LoRA trở nên vô cùng đơn giản, chỉ với vài dòng mã:

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model

# 1. Tải mô hình gốc và đóng băng (freeze) nó
model_id = "meta-llama/Llama-3-8b"
model = AutoModelForCausalLM.from_pretrained(
    model_id, 
    torch_dtype=torch.float16, 
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_id)

# 2. Định nghĩa cấu hình LoRA
lora_config = LoraConfig(
    r=16,                         # Rank
    lora_alpha=32,                # Alpha (thường = 2 * r)
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"], # Gắn vào lớp Attention
    lora_dropout=0.05,            # Chống overfitting
    bias="none",
    task_type="CAUSAL_LM"         # Bài toán mô hình ngôn ngữ
)

# 3. Đính kèm LoRA vào mô hình gốc
peft_model = get_peft_model(model, lora_config)

# Kiểm tra số lượng tham số huấn luyện
peft_model.print_trainable_parameters()
# Kết quả ví dụ: trainable params: 13,631,488 || all params: 8,043,907,072 || trainable%: 0.1694%

# 4. (Sau đó bạn đưa `peft_model` vào Trainer của HuggingFace để huấn luyện bình thường)
```

Như ví dụ trên, chúng ta chỉ phải huấn luyện khoảng **13 triệu** tham số (tương đương 0.17%), thay vì hơn **8 tỷ** tham số của LLaMA-3.

---

## 6. Sự tiến hoá: QLoRA (Quantized LoRA)

Dù LoRA giảm đáng kể dung lượng bộ nhớ cho optimizer, mô hình gốc $W_0$ vẫn được tải vào VRAM ở định dạng 16-bit (hoặc 32-bit). Một mô hình LLaMA-3 70B vẫn cần hơn 140GB VRAM chỉ để chứa trọng số gốc!

Năm 2023, Dettmers et al. (đội ngũ từ University of Washington) giới thiệu **QLoRA** (Quantized LoRA). QLoRA giải quyết vấn đề này bằng cách:
1. **Lượng tử hoá (Quantize)** mô hình gốc $W_0$ xuống định dạng 4-bit (chính xác hơn là 4-bit NormalFloat - NF4) thay vì 16-bit. Điều này giảm 4 lần bộ nhớ cần để chứa mô hình.
2. Giữ nguyên các ma trận LoRA adapter (A và B) ở 16-bit để bảo toàn độ chính xác.
3. Khi tính toán xuyên qua mạng (forward/backward pass), trọng số 4-bit được giải nén (dequantize) tạm thời thành 16-bit.

**Kết quả:** Nhờ QLoRA, việc tinh chỉnh các mô hình khổng lồ như 33B hay thậm chí 70B có thể thực hiện được trên một GPU cá nhân mạnh (như RTX 3090/4090 24GB) hoặc các GPU đám mây giá rẻ (như L4 hoặc A10G), mở ra kỷ nguyên dân chủ hoá AI (democratizing AI).

---

## 7. Các biến thể khác của LoRA

Từ thành công của LoRA, nhiều nhà nghiên cứu đã phát triển các phiên bản cải tiến:
* **AdaLoRA:** Tự động điều chỉnh Rank $r$ cho từng lớp trong mạng, phân bổ rank lớn cho những lớp cần thiết và thu hẹp rank ở các lớp ít quan trọng.
* **DoRA (Weight-Decomposed Low-Rank Adaptation):** Tách trọng số pre-trained thành độ lớn (magnitude) và hướng (direction), chỉ dùng LoRA để tinh chỉnh hướng. DoRA cho hiệu suất ổn định và sát với Full Fine-Tuning hơn.
* **LongLoRA:** Tinh chỉnh LoRA để mở rộng Context Window của các LLM hiệu quả.

---

## Tóm tắt

LoRA là một công nghệ bản lề mang tính cách mạng trong quá trình ứng dụng AI tạo sinh vào thực tế. Bằng cách tiếp cận toán học tinh tế (dùng ma trận hạng thấp), LoRA mang lại khả năng:
* Chi phí tinh chỉnh bằng một phần nhỏ so với truyền thống.
* Tránh "Catastrophic Forgetting".
* Cho phép một mô hình gốc duy nhất hỗ trợ hàng chục "nhân cách" chuyên biệt (Adapter) có thể tráo đổi tức thời.

---

## Tài Liệu Tham Khảo

* [LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021)](https://arxiv.org/abs/2106.09685)
* [QLoRA: Efficient Finetuning of Quantized LLMs (Dettmers et al., 2023)](https://arxiv.org/abs/2305.14314)
* [HuggingFace PEFT Documentation](https://huggingface.co/docs/peft/index)
* [Practical Tips for Finetuning LLMs Using LoRA (Sebastian Raschka)](https://magazine.sebastianraschka.com/p/practical-tips-for-finetuning-llms)
