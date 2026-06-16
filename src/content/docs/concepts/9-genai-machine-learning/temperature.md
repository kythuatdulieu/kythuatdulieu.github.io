---
title: "Nhiệt độ (Temperature) trong LLM"
difficulty: "Beginner"
tags: ["llm", "temperature", "decoding", "prompt-engineering", "generation"]
readingTime: "10 mins"
lastUpdated: 2026-06-16
seoTitle: "Temperature trong AI là gì? Cách tinh chỉnh độ sáng tạo của LLM"
metaDescription: "Tìm hiểu thông số Temperature (Nhiệt độ) trong các mô hình AI/LLM, cách nó điều khiển tính ngẫu nhiên và sáng tạo của câu trả lời, cùng cách tối ưu hóa cho từng tình huống."
description: "Trong thế giới của các Mô hình Ngôn ngữ Lớn (LLM), Temperature là một tham số vô cùng quyền lực giúp bạn quyết định tính ngẫu nhiên và độ sáng tạo của AI. Khám phá cách tham số này hoạt động dưới nền tảng toán học và cách lựa chọn mức nhiệt độ phù hợp cho dự án của bạn."
---



Trong thế giới của các Mô hình Ngôn ngữ Lớn ([LLM](/concepts/genai-ml/llm/)), **Temperature** (Nhiệt độ) là một trong những siêu tham số (hyperparameter) phổ biến và quan trọng nhất để điều khiển hành vi của mô hình khi sinh văn bản (text generation). Bằng cách tinh chỉnh tham số này, bạn có thể biến một AI từ một "nhà toán học" cứng nhắc, chính xác thành một "nhà thơ" bay bổng, đầy sức sáng tạo.

## Temperature là gì?



Về bản chất, LLM dự đoán từ (hoặc token) tiếp theo trong một chuỗi văn bản bằng cách tính toán xác suất cho tất cả các từ có thể xuất hiện tiếp theo. 

**Temperature** là một hằng số được sử dụng để điều chỉnh phân phối xác suất này *trước khi* mô hình đưa ra quyết định chọn từ. Tham số này kiểm soát sự cân bằng giữa **tính ngẫu nhiên (randomness)** và **tính quyết định (determinism)** trong đầu ra của mô hình.

- **Temperature thấp (gần 0)**: Mô hình có xu hướng luôn chọn từ có xác suất cao nhất. Kết quả trở nên dễ đoán, nhất quán và ít ngẫu nhiên.
- **Temperature cao (gần 1 hoặc cao hơn)**: Mô hình giảm sự chênh lệch xác suất giữa các từ, tạo cơ hội cho những từ ít phổ biến hơn được chọn. Kết quả trở nên đa dạng, bất ngờ và sáng tạo hơn.

## Cơ Chế Hoạt Động Của Temperature 

Để hiểu rõ cách Temperature hoạt động, chúng ta cần nhìn vào hàm **Softmax** – bước cuối cùng trong mạng nơ-ron của LLM để chuyển đổi điểm số thô (logits) thành xác suất (probabilities).

Công thức Softmax có Temperature ($T$) được biểu diễn như sau:

$$
P(x_i) = \frac{e^{z_i / T}}{\sum_j e^{z_j / T}}
$$

Trong đó:
- $z_i$ là điểm số thô (logit) của từ thứ $i$.
- $T$ là giá trị Temperature.
- $P(x_i)$ là xác suất cuối cùng của từ thứ $i$.

**Tác động của $T$ đối với phân phối xác suất:**

1. **Khi $T = 1$**: Phân phối xác suất giữ nguyên giá trị mặc định của mô hình.
2. **Khi $T < 1$ (Ví dụ: $T = 0.1$)**: Các giá trị logit lớn sẽ bị khuếch đại mạnh mẽ khi chia cho số nhỏ, làm cho từ có xác suất cao nhất trở nên vượt trội hoàn toàn so với phần còn lại (phân phối trở nên "nhọn" hơn). Điều này dẫn đến mô hình hoạt động theo kiểu *Greedy Search*.
3. **Khi $T > 1$ (Ví dụ: $T = 2.0$)**: Các giá trị logit bị san phẳng. Các từ có xác suất cao bị giảm bớt sự thống trị, trong khi các từ có xác suất thấp được "kéo lên". Phân phối xác suất trở nên "phẳng" hơn, gần với phân phối đồng đều (uniform distribution). Sự lựa chọn trở nên ngẫu nhiên.

## Thang Đo Temperature: Chọn Mức Nào Cho Phù Hợp?

Việc chọn Temperature phụ thuộc hoàn toàn vào **Mục đích sử dụng (Use Case)**. Dưới đây là cách chia mức Temperature phổ biến:

### 1. Nhiệt độ cực thấp (0.0 - 0.2): "Người máy chính xác"
- **Đặc điểm:** Đầu ra mang tính quyết định cao (deterministic). Với cùng một prompt, mô hình gần như luôn trả về cùng một câu trả lời. Ít có sự đa dạng.
- **Phù hợp cho:**
  - **Lập trình và Viết Code:** Nơi cú pháp và logic phải chính xác tuyệt đối.
  - **Trích xuất thông tin (Data Extraction):** Rút trích thực thể từ văn bản, trả về đúng định dạng JSON/XML theo yêu cầu.
  - **RAG (Retrieval-Augmented Generation):** Trả lời câu hỏi dựa trên ngữ cảnh được cung cấp, nơi sự chính xác của thông tin quan trọng hơn sự hoa mỹ của từ ngữ.
  - **Phân tích và Toán học:** Giải toán, logic học.

### 2. Nhiệt độ trung bình thấp (0.3 - 0.5): "Trợ lý đáng tin cậy"
- **Đặc điểm:** Cân bằng giữa sự chính xác và một chút đa dạng hóa trong ngôn từ.
- **Phù hợp cho:**
  - **Dịch thuật:** Giữ nguyên ý nghĩa nhưng cho phép cách diễn đạt ngôn ngữ tự nhiên, không bị cứng nhắc.
  - **Tóm tắt văn bản (Summarization):** Tránh việc lặp lại chính xác từng chữ của bản gốc nhưng vẫn đảm bảo bao quát đúng ý tưởng.
  - **Trợ lý hỗ trợ khách hàng (Customer Support):** Trả lời chuyên nghiệp, mạch lạc nhưng không quá máy móc.

### 3. Nhiệt độ trung bình cao (0.6 - 0.8): "Nhà tư vấn linh hoạt"
- **Đặc điểm:** Tăng tính đa dạng đáng kể. AI có thể đưa ra những gợi ý mà bạn không ngờ tới, nhưng đôi khi có thể lạc đề một chút.
- **Phù hợp cho:**
  - **Conversational AI / Chatbot giao tiếp thông thường:** Tạo cảm giác giống con người hơn, có "cảm xúc" hơn trong ngôn từ.
  - **Viết email, viết blog cơ bản:** Tạo ra nhiều phiên bản (drafts) với các cách tiếp cận khác nhau để người dùng lựa chọn.
  - **Brainstorming:** Đưa ra các ý tưởng, góc nhìn mới mẻ.

### 4. Nhiệt độ cao (0.9 - 1.0+): "Nghệ sĩ phóng túng"
- **Đặc điểm:** Cực kỳ sáng tạo, từ ngữ bay bổng. Tuy nhiên, rủi ro ảo giác thông tin (Hallucinations) và sinh ra nội dung vô nghĩa tăng mạnh.
- **Phù hợp cho:**
  - **Sáng tác nghệ thuật:** Viết thơ, sáng tác lời bài hát, viết truyện viễn tưởng.
  - **Ideation phá cách:** Tạo ra những ý tưởng tiếp thị "điên rồ", không bị gò bó bởi tư duy thông thường.
- **Lưu ý:** Mức nhiệt độ trên 1.5 thường khiến văn bản trở nên lộn xộn, sai ngữ pháp và mất kiểm soát hoàn toàn về nội dung.

## Temperature so với Top-p và Top-k

Temperature không hoạt động một cách cô lập. Thông thường, nó được sử dụng kết hợp với hai tham số khác để kiểm soát quá trình lấy mẫu (sampling). Bạn nên hiểu rõ cách chúng tương tác:

- **Top-k Sampling:** Giới hạn việc lựa chọn từ tiếp theo chỉ trong danh sách $K$ từ có xác suất cao nhất. Mọi từ nằm ngoài danh sách này đều bị loại bỏ (gán xác suất = 0).
- **Top-p Sampling (Nucleus Sampling):** Cắt bỏ các từ có xác suất thấp bằng cách chỉ giữ lại nhóm các từ hàng đầu sao cho tổng xác suất của chúng đạt một ngưỡng $p$ nhất định (ví dụ: $0.9$). 

**Nên dùng cái nào?**
Một nguyên tắc phổ biến từ các nhà nghiên cứu là: **Chỉ nên điều chỉnh Temperature HOẶC Top-p, không nên thay đổi cả hai cùng lúc.**
- Nếu bạn muốn kiểm soát sự ngẫu nhiên một cách tuyến tính và mượt mà: Dùng **Temperature**.
- Nếu bạn muốn loại bỏ hoàn toàn "phần đuôi" của những từ có xác suất cực thấp (tránh rủi ro sinh ra từ ngữ vô nghĩa nhưng vẫn muốn có tính ngẫu nhiên nhất định): Dùng **Top-p**.

## Ví dụ Thực Tế Về Tác Động Của Temperature

**Prompt:** "Bầu trời hôm nay có màu..."

*   **Temperature = 0.1:** Bầu trời hôm nay có màu xanh. (Từ có xác suất cao nhất luôn được chọn, câu văn đi thẳng vào vấn đề).
*   **Temperature = 0.5:** Bầu trời hôm nay có màu xanh trong vắt, điểm xuyết vài đám mây trắng. (Vẫn giữ ý chính nhưng bắt đầu mở rộng câu văn, thêm chi tiết miêu tả).
*   **Temperature = 0.9:** Bầu trời hôm nay có màu ngọc bích lấp lánh như một bức tranh nhuộm đẫm nước mắt của ánh bình minh rực rỡ. (Câu văn trở nên hoa mỹ, dùng phép ẩn dụ và nhân hóa mạnh mẽ).

## Tóm Lại

Temperature đóng vai trò như "núm vặn điều chỉnh sự sáng tạo" của LLM. Bằng cách hiểu rõ cơ chế toán học phía sau nó, bạn có thể:
1. Giảm Temperature về 0 cho các tác vụ cần độ chính xác tuyệt đối, logic chặt chẽ và có tính lặp lại (Code, RAG, trích xuất dữ liệu, tính toán).
2. Nâng Temperature lên gần 1 cho các tác vụ đòi hỏi sự đa dạng, khám phá ý tưởng (Viết sáng tạo, Brainstorming, sáng tác).
3. Thử nghiệm dần dần bằng cách tinh chỉnh biên độ nhỏ (VD: từ 0.7 lên 0.75) để tìm ra "điểm cân bằng" (sweet spot) hoàn hảo nhất cho ứng dụng của bạn.

---

## Tài Liệu Tham Khảo

* [Hugging Face: How to generate text](https://huggingface.co/blog/how-to-generate)
* [OpenAI API Reference - Chat Completions Temperature](https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature)
* [Cohere: Controlling Generation with Temperature](https://docs.cohere.com/docs/temperature)
* [The Illustrated Word2vec and Text Generation by Jay Alammar](https://jalammar.github.io/)
