---
title: "Nhiệt độ - Temperature"
category: "GenAI & Machine Learning"
difficulty: "Beginner"
tags: [llm, temperature, decoding, prompt-engineering, generation]
readingTime: "7 mins"
lastUpdated: 2026-06-08
seoTitle: "Temperature trong AI là gì? Cách tinh chỉnh độ sáng tạo của LLM"
metaDescription: "Tìm hiểu thông số Temperature (Nhiệt độ) trong các mô hình AI/LLM, cách nó điều khiển tính ngẫu nhiên và sáng tạo của câu trả lời."
definition: "Temperature là tham số điều khiển tính ngẫu nhiên và độ sáng tạo của mô hình ngôn ngữ lớn (LLM) bằng cách làm phẳng hoặc làm nhọn phân phối xác suất của các token đầu ra."
---

Trong thế giới của các Mô hình Ngôn ngữ Lớn ([LLM](/concepts/6-ai-ml/genai-ml/llm/)), có một tham số vô cùng quyền lực giúp bạn quyết định xem AI sẽ trả lời một cách cứng nhắc, chính xác như một cuốn sách giáo khoa, hay bay bổng, đầy tính sáng tạo như một nhà thơ. Tham số đó được gọi là **Temperature (Nhiệt độ)**. 

Bằng cách can thiệp vào các thuật toán toán học ngay trước khi mô hình lựa chọn từ vựng để xuất ra, Temperature đóng vai trò như một chiếc nút vặn điều chỉnh mức độ ngẫu nhiên và tính sáng tạo của đoạn văn bản được sinh ra.

![Mô tả phân phối xác suất Token theo Temperature](/images/temperature/diagram_1.svg)

![Biến đổi Logits sang xác suất qua hàm Softmax](/images/temperature/diagram_2.webp)


## Bản chất toán học của "Nhiệt độ" trong AI

Về mặt kỹ thuật, **Temperature** ($T$) là một hằng số được dùng để chia trực tiếp cho các giá trị đầu ra thô (logits) của lớp mạng nơ-ron cuối cùng trước khi chúng đi qua hàm Softmax để quy đổi thành xác suất phân bố từ vựng:

* **Khi $T = 0$:** Mô hình rơi vào trạng thái hoàn toàn tất định (Deterministic). Nó luôn luôn chọn từ có xác suất cao nhất ở mọi bước sinh từ.
* **Khi \\$0 < T < 1$:** Làm cho phân phối xác suất trở nên "nhọn" hơn. Các từ có khả năng xuất hiện cao sẽ được gia tăng cơ hội, trong khi các từ có xác suất thấp sẽ bị dìm sâu hơn nữa.
* **Khi $T > 1$:** Làm cho phân phối xác suất trở nên "phẳng" hơn. Thu hẹp khoảng cách xác suất giữa các từ vựng, tạo cơ hội cho những từ hiếm hoặc "mạo hiểm" được xuất hiện.

## Tại sao chúng ta cần đến thông số Temperature?

Bản chất của một LLM là công cụ dự đoán từ tiếp theo (Next Token Prediction). Giả sử chúng ta đưa cho AI câu: *"Bầu trời hôm nay có màu..."*. Hệ thống sẽ tính toán và đưa ra danh sách xác suất của các từ tiếp theo như sau:
* `"xanh"`: 80%
* `"đen"`: 15%
* `"đỏ"`: 4%
* `"tím"`: 1%

Nếu không có tham số Temperature (hoặc thiết lập $T=0$), mô hình sẽ luôn chọn từ có tỷ lệ cao nhất là `"xanh"`. Nếu bạn gọi API này 100 lần, bạn sẽ nhận về 100 câu trả lời giống hệt nhau. 

Điều này cực kỳ lý tưởng cho các tác vụ toán học, viết code hoặc tra cứu dữ liệu. Tuy nhiên, nếu bạn đang cần AI sáng tác một câu chuyện hay viết một bài thơ, câu trả lời sẽ trở nên vô cùng nhàm chán và rập khuôn. Temperature ra đời nhằm cho phép người dùng chủ động bơm thêm sự "hỗn loạn" (entropy) vào quá trình sinh từ, giúp mô hình thỉnh thoảng lựa chọn các từ yếu thế hơn như `"đen"` hoặc `"đỏ"` để tạo nên sự mới lạ.

## Ba mức nhiệt độ phổ biến và tác động thực tế

* **Nhiệt độ thấp ($T = 0$ - Logic & Chính xác):** Hoàn toàn không có sự sáng tạo. Phù hợp cho các tác vụ hỏi đáp dữ liệu thực tế (QA), trích xuất thông tin, viết mã nguồn, và kiến trúc [RAG](/concepts/6-ai-ml/genai-ml/rag/). Mức này giúp hạn chế tối đa hiện tượng Ảo giác ([Hallucination](/concepts/6-ai-ml/genai-ml/hallucination/)) của AI.
* **Nhiệt độ trung bình ($T = 0.7 \rightarrow 1.0$ - Cân bằng):** Đây là chế độ mặc định của phần lớn các chatbot hiện nay (như ChatGPT, Claude). Câu văn tạo ra tự nhiên, từ vựng phong phú nhưng vẫn đảm bảo tính logic và mạch lạc của nội dung.
* **Nhiệt độ cao ($T > 1.5$ - Hỗn loạn):** Mức độ sáng tạo đạt đỉnh điểm, nhưng đi kèm rủi ro cực kỳ lớn về việc câu văn bị sai ngữ pháp, vô nghĩa hoặc hoàn toàn lạc đề.

## Phép toán Softmax hoạt động thế nào dưới ảnh hưởng của T?

Chúng ta có công thức Softmax có tích hợp Temperature ($T$):

$$ p_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)} $$

Trong đó $z_i$ là điểm số thô (logit) của từ vựng $i$.

Hãy cùng xem hiệu ứng của phép chia cho $T$:
Giả sử hệ thống đang cân nhắc giữa từ "A" (điểm thô 2.0) và từ "B" (điểm thô 1.0).
* **Nếu $T = 1$ (Bình thường):** Tỷ lệ chọn từ A là $\approx 73\%$, từ B là \\$27\%$.
* **Nếu $T = 0.1$ (Lạnh):** Điểm thô bị phóng đại lên thành 20 và 10. Khoảng cách $\exp(20)$ và $\exp(10)$ trở nên khổng lồ. Tỷ lệ chọn từ A vọt lên $\approx 99.99\%$. Từ B hầu như không còn cơ hội.
* **Nếu $T = 2$ (Nóng):** Điểm thô co lại thành 1.0 và 0.5. Khoảng cách xác suất bị thu hẹp đáng kể. Tỷ lệ chọn từ A giảm xuống $\approx 62\%$, từ B tăng lên \\$38\%$. Từ B giờ đây có cơ hội "ra sân" rất cao.

## Sơ đồ luồng xử lý logits

Dưới đây là cách mà tham số Temperature can thiệp vào quá trình tạo từ vựng của AI:
```mermaid
graph TD
    A["Logits từ Transformer"] --> B{"Tham số Temperature T"}
    B -->|"Chia nhỏ T < 1"| C["Phân phối nhọn: Nhấn mạnh Top 1"]
    B -->|"Chia lớn T > 1"| D["Phân phối phẳng: Nâng đỡ nhóm yếu"]
    C --> E["Áp dụng Softmax"]
    D --> E
    E --> F["Lấy mẫu ngẫu nhiên token"]
    F --> G["Từ được sinh ra"]


```

## Ví dụ thực tế bằng Python

Đoạn code minh họa việc điều chỉnh Temperature bằng OpenAI API:
```python
import openai

prompt = "Con chim bay lượn trên..."

# Yêu cầu tính chính xác cao (T = 0)
resp_cold = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.0
)
# Kết quả thường là: "...bầu trời xanh thẳm."

# Yêu cầu tính sáng tạo (T = 1.2)
resp_hot = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}],
    temperature=1.2
)
# Kết quả có thể biến đổi rất đa dạng: 
# "...mặt nước hồ thu trong vắt" hoặc "...những ngọn mây hồng phiêu lãng."
```

## Quy tắc vàng khi tinh chỉnh Temperature

* **Mặc định với hệ thống RAG:** Luôn đặt `temperature = 0`. RAG yêu cầu câu trả lời phải dựa sát sườn vào tài liệu được cung cấp. Bất kỳ sự "sáng tạo" nào ở đây đều là định nghĩa của Ảo giác (Hallucination).
* **Kết hợp khéo léo với [Prompt Engineering](/concepts/6-ai-ml/genai-ml/prompt-engineering/):** Thay vì cố gắng tăng Temperature lên quá cao để AI viết hay hơn (dẫn đến vỡ định dạng cấu trúc), hãy giữ Temperature ở mức cân bằng (\\$0.7$) và sử dụng kỹ thuật viết prompt định hướng (ví dụ: *"Hãy viết theo giọng điệu lãng mạn, sử dụng nhiều phép ẩn dụ..."*).
* **Tránh tinh chỉnh đồng thời cả Temperature và Top-p:** Cả hai thông số này đều dùng để điều khiển tính ngẫu nhiên. Việc điều chỉnh cả hai cùng lúc sẽ khiến đầu ra của mô hình trở nên cực kỳ bất ổn và rất khó kiểm soát.

## Điểm mạnh và điểm yếu

### Điểm mạnh (Pros)
* **Dễ dàng kiểm soát:** Chỉ cần tinh chỉnh một tham số đơn lẻ để thay đổi tính chất câu trả lời của LLM.
* **Hỗ trợ suy luận logic:** Giúp ép mô hình đi theo suy luận logic, chặt chẽ khi giảm sát về mức 0.

### Điểm yếu (Cons)
* **Không kiểm soát được cấu trúc:** Thiết lập nhiệt độ quá cao ($T > 1.5$) dễ làm AI bị loạn, sinh ra từ ngữ vô nghĩa, lặp ký tự hoặc sai cú pháp nghiêm trọng.

## Khi nào nên dùng

### Nên dùng:
* **Nhiệt độ thấp ($T \approx 0$):** Khi làm việc với các tác vụ đòi hỏi sự chính xác tuyệt đối như viết code, phân tích cú pháp, trích xuất dữ liệu JSON, lập luận toán học hoặc truy xuất thông tin (RAG).
* **Nhiệt độ trung bình ($T \approx 0.7 - 1.0$):** Khi xây dựng các chatbot giao tiếp thông thường, trả lời email, viết báo cáo hoặc tóm tắt tài liệu một cách tự nhiên.
* **Nhiệt độ cao ($T \ge 1.2$):** Khi cần mô hình brainstorm ý tưởng mới, sáng tác nghệ thuật, viết truyện hoặc thơ ca phong phú.

### Không nên dùng:
* Không nên tăng nhiệt độ khi đang cấu hình hệ thống xử lý tự động cần tính ổn định cao và định dạng đầu ra cố định (như phân tích log hệ thống hoặc gọi API trả về JSON).

## Khái niệm liên quan & Tài liệu tham khảo

**Khái niệm liên quan:**
* [Nucleus Sampling (Top-p)](/concepts/6-ai-ml/genai-ml/top-p/)
* [Token (Đơn vị từ vựng)](/concepts/6-ai-ml/genai-ml/token/)

## Trọng tâm ôn luyện phỏng vấn

### 1. Về mặt toán học, chuyện gì xảy ra với phân phối xác suất khi ta đẩy Temperature T tiến tới vô cùng ($T \rightarrow \infty$)?
**Gợi ý trả lời:**
Khi $T \rightarrow \infty$, tỷ số $z_i / T$ sẽ tiến dần về 0 với mọi điểm số thô $z_i$. Do đó, tử số $\exp(z_i / T)$ trong công thức Softmax sẽ tiến tới $\exp(0) = 1$ cho tất cả các token có mặt trong từ điển. 

Khi áp dụng phép toán Softmax, mọi token đều có xác suất xuất hiện ngang nhau (phân phối đều - Uniform Distribution). Việc sinh từ lúc này tương đương với việc bốc thăm ngẫu nhiên 100%, dẫn đến một chuỗi ký tự hỗn loạn, vô nghĩa hoàn toàn.

### 2. Trong một ứng dụng RAG phân tích các điều khoản hợp đồng pháp lý, bạn sẽ thiết lập tham số Temperature và Top-p như thế nào?
**Gợi ý trả lời:**
Đối với bài toán phân tích pháp lý, tính chính xác và trung thực của dữ liệu là quan trọng nhất. Tôi sẽ thiết lập **Temperature = 0** để kích hoạt cơ chế Greedy Decoding (luôn chọn từ có xác suất cao nhất), giúp loại bỏ tính ngẫu nhiên và ngăn chặn ảo giác. 

Ở mức $T=0$, tham số Top-p sẽ không còn tác dụng. Nếu vì lý do nào đó cần câu văn mềm mại hơn một chút và để $T > 0$ cực nhỏ (ví dụ \\$0.1$), tôi sẽ giới hạn **Top-p ở mức rất thấp (khoảng 0.1)** để đảm bảo AI chỉ được lựa chọn trong số các từ vựng an toàn nhất.

---

## Xem thêm các khái niệm liên quan
* [Tác nhân AI (AI Agent)](/concepts/6-ai-ml/genai-ml/ai-agent/)
* [Phân tách văn bản - Chunking and Chunking Strategy](/concepts/6-ai-ml/genai-ml/chunking/)
* [Cửa sổ ngữ cảnh - Context Window](/concepts/6-ai-ml/genai-ml/context-window/)

## Tài liệu tham khảo

1. [Google Cloud - Adjust Generation Parameters in Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/adjust-generation-parameters)
2. [AWS - Amazon Bedrock Inference Parameters](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-titan.html)
3. [Azure - Azure OpenAI Service API Reference Guide](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)
4. [Databricks - Model Serving and LLM Index Configuration](https://docs.databricks.com/en/large-language-models/index.html)
5. [Snowflake - Snowflake Cortex AI LLM Inference Settings](https://docs.snowflake.com/en/user-guide/snowflake-cortex/llm-overview)

---

## English summary

Temperature is a hyperparameter applied to the logits output of a Large Language Model before the Softmax function, controlling the randomness and creativity of the generated text. A Temperature of 0 equates to greedy decoding (deterministic), which is optimal for coding, structured [data extraction](/concepts/3-integration/etl-elt/data-extraction/), and RAG architectures where factual accuracy is paramount and hallucinations are unacceptable. As Temperature increases (e.g., 0.7 - 1.0), the probability distribution flattens, allowing lower-probability words to be sampled, thereby fostering diverse and creative outputs like poetry or brainstorming. Exceedingly high temperatures result in chaotic, nonsensical text.