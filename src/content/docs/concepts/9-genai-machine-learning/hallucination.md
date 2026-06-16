---
title: "Ảo giác LLM (Hallucination)"
difficulty: "Beginner"
tags: ["hallucination", "llm", "genai", "rag", "ai-safety"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Ảo giác AI (Hallucination) là gì? Nguyên nhân và cách khắc phục"
metaDescription: "Tìm hiểu chi tiết về hiện tượng Ảo giác (Hallucination) trong các Mô hình Ngôn ngữ Lớn (LLM): hiểu rõ bản chất thống kê, nguyên nhân và các phương pháp phòng chống (RAG, CoT)."
description: "Trong cuộc cách mạng Trí tuệ Nhân tạo tạo sinh (GenAI), chúng ta đã chứng kiến các Mô hình Ngôn ngữ Lớn (LLM) làm thơ, lập trình và viết luận với tốc độ và khả năng đáng kinh ngạc. Tuy nhiên, rào cản lớn nhất ngăn cản AI được áp dụng vào các ứng dụng thực tế, đòi hỏi tính chính xác cao, chính là Hallucination (Ảo giác)."
---



**Hallucination (Ảo giác)** là hiện tượng các Mô hình Ngôn ngữ Lớn (Large Language Models - LLM) như ChatGPT, Gemini, Claude, Llama sinh ra các thông tin sai lệch, không có thật, hoặc vô lý nhưng lại trình bày với một thái độ cực kỳ tự tin và thuyết phục.

Trong ngữ cảnh con người, ảo giác thường mang ý nghĩa bệnh lý. Đối với AI, hiện tượng này xuất phát từ cách thức hoạt động cốt lõi của chúng: **Dự đoán từ tiếp theo dựa trên xác suất (next-token prediction)**. LLM không thực sự "hiểu" sự thật, nó chỉ học các mô hình ngôn ngữ từ hàng tỷ văn bản và đoán từ nào có khả năng xuất hiện cao nhất tiếp theo.

## Các Loại Hallucination Thường Gặp

1. **Sai lệch thực tế (Factual Inaccuracy):** AI bịa ra một sự kiện, người dùng, hoặc ngày tháng không tồn tại. *Ví dụ: AI khẳng định Việt Nam vô địch World Cup năm 2018.*
2. **Sai lệch logic (Logical Inconsistency):** AI đưa ra kết luận đi ngược lại với các dữ kiện nó vừa cung cấp. 
3. **Ảo giác trong mã nguồn (Code Hallucination):** AI sinh ra các hàm, thư viện hoặc API không tồn tại, khiến code không thể biên dịch hoặc chạy lỗi (thường gặp khi sử dụng các thư viện ít tài liệu).

---

## Nguyên Nhân Gây Ra Hallucination

Để giải quyết vấn đề, chúng ta cần hiểu rõ vì sao LLM lại "bịa chuyện".

### 1. Bản chất thống kê của Next-Token Prediction
LLM thực chất là cỗ máy tính toán xác suất. Nó không truy vấn cơ sở dữ liệu (Database) để lấy sự thật mà tính toán xác suất từ nào nên đi sau từ nào. Khi xác suất được phân bổ đều cho nhiều từ, hoặc người dùng sử dụng nhiệt độ (Temperature) cao để mô hình sáng tạo, nó sẽ ưu tiên sự mượt mà của ngôn từ hơn là tính chính xác của thông tin.

### 2. Sự thiên lệch và Nhiễu trong Dữ liệu Huấn Luyện
LLM được train trên một lượng dữ liệu khổng lồ từ Internet (Wikipedia, Reddit, các trang web tin tức...). Môi trường này chứa đựng vô vàn thông tin sai lệch, tin giả, và các thuyết âm mưu. Khi học từ những dữ liệu này, AI cũng sẽ "kế thừa" khả năng trả lời sai.

### 3. Thiếu Ngữ Cảnh (Context) hoặc Kiến thức Quá Hạn
Kiến thức của mô hình chỉ dừng lại ở thời điểm nó được huấn luyện (Knowledge Cutoff). Khi người dùng hỏi về các sự kiện mới xảy ra sau thời điểm này, AI có xu hướng cố gắng đoán và tạo ra câu trả lời thay vì thẳng thắn thừa nhận "Tôi không biết".

### 4. Vấn đề "Quên" Ngữ Cảnh Dài (Lost in the Middle)
Khi người dùng đưa một đoạn văn bản quá dài vào Prompt, LLM có xu hướng ghi nhớ tốt ở đầu và cuối văn bản, nhưng lại "quên" hoặc "ảo giác" với các thông tin nằm ở đoạn giữa.

---

## Các Trường Hợp Cụ Thể (Edge Cases & Examples)

* **Pháp lý (Legal):** Đã có trường hợp luật sư tại Mỹ sử dụng ChatGPT để tìm kiếm án lệ. AI đã "tự sáng tác" ra một loạt các vụ án không có thật với đầy đủ tên thẩm phán, mã số hồ sơ. Luật sư nộp tài liệu này lên tòa và phải đối mặt với hình phạt nghiêm khắc.
* **Lập trình (Programming):** Khi yêu cầu LLM viết code cho một API mới hoặc một thư viện ít người dùng, mô hình thường xuyên import các hàm không tồn tại.
* **Y tế (Healthcare):** AI có thể đề xuất các loại thuốc hoặc liều lượng sai lệch, rất nguy hiểm nếu người dùng không tham vấn bác sĩ.

---

## Cách Khắc Phục (Mitigation Strategies)

Việc loại bỏ 100% Hallucination ở các mô hình sinh ngôn ngữ hiện tại là gần như không thể. Tuy nhiên, chúng ta có thể giảm thiểu hiện tượng này xuống mức chấp nhận được bằng các kỹ thuật kỹ sư Prompt và Kiến trúc Hệ thống.

### 1. Kỹ Thuật Retrieval-Augmented Generation (RAG)

Đây là phương pháp phổ biến và hiệu quả nhất hiện nay. Thay vì dựa vào trí nhớ của LLM, chúng ta cung cấp cho nó một kho tài liệu nội bộ chính xác. Khi người dùng đặt câu hỏi, hệ thống sẽ:
1. **Truy xuất (Retrieve):** Tìm kiếm các đoạn tài liệu liên quan đến câu hỏi.
2. **Tăng cường (Augment):** Ghép các tài liệu này vào Prompt cùng với câu hỏi.
3. **Sinh (Generate):** Yêu cầu LLM chỉ trả lời dựa trên tài liệu được cung cấp.

**Ví dụ cấu trúc Prompt RAG:**
```text
Bạn là một trợ lý ảo hữu ích.
CHỈ sử dụng phần [Tài liệu tham khảo] bên dưới để trả lời câu hỏi.
Nếu thông tin không có trong tài liệu, hãy trả lời "Tôi không biết", không được tự bịa ra.

[Tài liệu tham khảo]:
{context}

Câu hỏi: {question}
```

### 2. Prompt Engineering: Chain of Thought (CoT)

Bắt buộc LLM phải suy nghĩ theo từng bước rõ ràng trước khi đưa ra kết quả cuối cùng. Kỹ thuật này giúp mô hình không bị "hớ" khi trả lời ngay lập tức, từ đó giảm đáng kể ảo giác logic.

**Ví dụ:** Thay vì hỏi "A có lớn hơn B không?", hãy thêm câu "Hãy suy nghĩ từng bước một (Think step-by-step)".

### 3. Tinh Chỉnh Tham Số (Parameter Tuning)

* **Temperature (Nhiệt độ):** Giảm Temperature về `0` hoặc mức thấp (0.1 - 0.3) khi cần sự chính xác, logic, phân tích dữ liệu. Mức thấp giúp LLM chọn những token có xác suất cao nhất, giảm thiểu rủi ro sáng tạo ra sự kiện ảo.
* **Top-P / Top-K:** Hạn chế tập các từ vựng tiềm năng, loại bỏ các từ "kỳ lạ".

### 4. Grounding (Neo chặn thông tin) bằng Tìm Kiếm (Search)

Nhiều nhà cung cấp dịch vụ như Google, Microsoft tích hợp sẵn công cụ Search vào mô hình. Nếu người dùng hỏi một sự kiện thực tế, mô hình sẽ ẩn danh thực hiện truy vấn web, lấy kết quả top đầu về đọc và tổng hợp. (Ví dụ: Search Grounding trong Google Gemini).

---

## Ví dụ Thực Tế Bằng Code (Python)

Dưới đây là ví dụ sử dụng LangChain và OpenAI để xây dựng một luồng (pipeline) chống ảo giác sử dụng RAG.

```python
import os
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Cấu hình API Key
os.environ["OPENAI_API_KEY"] = "your-api-key"

# 1. Khởi tạo mô hình với Temperature = 0 để tối đa hóa tính chính xác
llm = ChatOpenAI(model="gpt-4-turbo", temperature=0)

# 2. Tạo PromptTemplate ép mô hình tuân thủ quy tắc chống ảo giác
template = """
Bạn là một chuyên gia phân tích dữ liệu nghiêm ngặt.
Nhiệm vụ của bạn là trả lời câu hỏi dựa TRÊN thông tin được cung cấp ở Context.
QUY TẮC CỨNG:
1. Nếu câu trả lời không có trong Context, hãy nói: "Tôi xin lỗi, nhưng tôi không có đủ thông tin để trả lời."
2. Không bao giờ tự suy diễn hoặc bịa đặt thông tin.

Context: {context}

Câu hỏi: {question}

Trả lời:
"""

prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=template
)

chain = LLMChain(llm=llm, prompt=prompt)

# 3. Kịch bản kiểm thử
context_data = "Công ty ABC đạt doanh thu 5 triệu USD vào năm 2023. CEO hiện tại là ông Nguyễn Văn A."

# Câu hỏi có thể trả lời từ Context
answer_1 = chain.run({
    "context": context_data, 
    "question": "Doanh thu năm 2023 của công ty ABC là bao nhiêu?"
})
print("Đáp án 1:", answer_1) # Sẽ trả lời: 5 triệu USD

# Câu hỏi KHÔNG có trong Context (Kiểm tra chống Hallucination)
answer_2 = chain.run({
    "context": context_data, 
    "question": "Công ty ABC thành lập năm nào?"
})
print("Đáp án 2:", answer_2) # Sẽ trả lời từ chối theo quy tắc
```

---

## Kết Luận

Hallucination là một đặc tính cơ bản, không phải lỗi (it's a feature, not a bug) của các hệ thống sinh ngôn ngữ dựa trên xác suất. Mặc dù chúng ta không thể "vá" hoàn toàn hiện tượng này trong bản thân kiến trúc Transformer hiện tại, việc hiểu rõ nguyên nhân và áp dụng các mô hình kỹ thuật như **RAG**, **Prompt Engineering** chặt chẽ, và **Grounding** giúp các nhà phát triển xây dựng được các hệ thống AI ứng dụng (AI Agents/Applications) đủ độ tin cậy để phục vụ các bài toán doanh nghiệp khắt khe nhất.

## Tài Liệu Đọc Thêm (References)
* [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)](https://arxiv.org/abs/2005.11401)
* [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (Wei et al., 2022)](https://arxiv.org/abs/2201.11903)
* [OpenAI API Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
