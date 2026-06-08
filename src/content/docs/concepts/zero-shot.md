---
title: "Học không cần ví dụ (Zero-shot)"
category: "GenAI / Data Engineering"
difficulty: "Beginner"
tags: ["genai", "prompt-engineering", "zero-shot", "llm", "nlp"]
readingTime: "10 mins"
lastUpdated: 2026-06-08
seoTitle: "Zero-shot Prompting là gì? Cẩm nang học không cần ví dụ cho LLM"
metaDescription: "Tìm hiểu chuyên sâu về kỹ thuật Zero-shot trong Prompt Engineering: định nghĩa, cơ chế hoạt động, best practices và các câu hỏi phỏng vấn thực tế."
---

# Học không cần ví dụ - Zero-shot Prompting

## Summary

**Zero-shot Prompting** (Học không cần ví dụ) là một kỹ thuật tương tác với các Mô hình Ngôn ngữ Lớn (LLM) trong đó người dùng đưa ra một yêu cầu (prompt) để mô hình thực hiện một tác vụ mà không cung cấp bất kỳ ví dụ minh họa (demonstrations/examples) nào trước đó. Kỹ thuật này phụ thuộc hoàn toàn vào khả năng học chuyển giao (transfer learning) và kiến thức tổng quát mà mô hình đã thu nhận được trong quá trình huấn luyện trước (pre-training) và tinh chỉnh theo chỉ dẫn (instruction tuning).

---

## Definition

Trong lĩnh vực Học máy (Machine Learning) truyền thống, **Zero-shot Learning** là khả năng của một mô hình nhận dạng hoặc phân loại các đối tượng thuộc những nhãn (labels) mà nó chưa từng thấy trong tập dữ liệu huấn luyện.

Trong bối cảnh của AI tạo sinh (GenAI) và Prompt Engineering, **Zero-shot Prompting** đơn giản là việc gửi một câu lệnh (instruction) hoặc câu hỏi cho LLM mà không đính kèm theo các cặp đầu vào-đầu ra mẫu. LLM phải phân tích yêu cầu từ ngôn ngữ tự nhiên và tự suy diễn ra cách trả lời dựa trên trọng số (weights) đã được học từ hàng nghìn tỷ token văn bản. 

---

## Why it exists

Sự ra đời của Zero-shot prompting xuất phát từ những hạn chế của các phương pháp tinh chỉnh mô hình (fine-tuning) và thiết kế ứng dụng ML truyền thống:
1. **Chi phí gán nhãn dữ liệu cao**: Việc thu thập hàng nghìn hoặc hàng triệu ví dụ để huấn luyện cho một tác vụ cụ thể tốn rất nhiều thời gian và tiền bạc. Zero-shot loại bỏ hoàn toàn nhu cầu này cho nhiều bài toán phổ biến.
2. **Thiếu linh hoạt (Rigidity)**: Các mô hình truyền thống thường hẹp (narrow AI) - một mô hình dịch thuật chỉ có thể dịch thuật, một mô hình phân loại cảm xúc chỉ có thể phân loại cảm xúc. Zero-shot cho phép một mô hình duy nhất (LLM) xử lý vô số tác vụ chưa được lập trình trước chỉ bằng cách thay đổi câu lệnh.
3. **Tiết kiệm Token (Token Efficiency)**: Cửa sổ ngữ cảnh (Context Window) của LLM có giới hạn và việc gửi nhiều ví dụ (few-shot) tiêu tốn nhiều token, làm tăng chi phí API và độ trễ (latency). Zero-shot giúp tiết kiệm tối đa lượng token đầu vào.

---

## Core idea

Nguyên lý cốt lõi của Zero-shot Prompting xoay quanh hai khả năng đặc biệt của LLM hiện đại:
* **Instruction Tuning (Tinh chỉnh theo chỉ dẫn)**: Hầu hết các LLM hiện đại (như GPT-4, Claude 3, Llama 3) không chỉ được huấn luyện để dự đoán từ tiếp theo (next-token prediction) mà còn trải qua giai đoạn tinh chỉnh đặc biệt (như RLHF - Reinforcement Learning from Human Feedback hoặc SFT - Supervised Fine-Tuning) để hiểu và tuân thủ các mệnh lệnh rõ ràng từ người dùng.
* **Semantic Abstraction (Trừu tượng hóa ngữ nghĩa)**: LLM có khả năng liên kết các khái niệm (concepts) trong prompt với biểu diễn vector (embeddings) của chúng trong không gian tiềm ẩn (latent space), từ đó áp dụng các quy luật logic, văn phạm hoặc toán học đã học vào bài toán mới mà không cần mẫu.

---

## How it works

Quy trình xử lý một Zero-shot Prompt diễn ra như sau:
1. **Input Encoding**: Chuỗi văn bản yêu cầu (prompt) được mã hóa (tokenized) thành các ma trận số.
2. **Contextual Attention**: Thông qua cơ chế Self-Attention của kiến trúc Transformer, mô hình phân tích mối quan hệ ngữ nghĩa giữa các từ trong chỉ dẫn (ví dụ: "Dịch", "tiếng Anh", "sang tiếng Pháp").
3. **Latent Knowledge Retrieval**: Mô hình kích hoạt các tham số (weights) liên quan đến định nghĩa của tác vụ (thế nào là dịch thuật) và kiến thức về ngôn ngữ (ngữ pháp tiếng Anh và tiếng Pháp).
4. **Generation**: Mô hình dự đoán từng token tiếp theo (Autoregressive Generation) cho đến khi hoàn thành yêu cầu dựa hoàn toàn vào hiểu biết nội tại.

---

## Practical example

**Tác vụ**: Phân loại cảm xúc của một câu phản hồi từ khách hàng.

**Prompt (Zero-shot)**:
```text
Classify the sentiment of the following customer review into exactly one of these categories: [Positive, Negative, Neutral].

Review: "The delivery was incredibly fast, but the packaging was severely damaged."
Sentiment:
```

**Output mong đợi của LLM**:
```text
Neutral
```

Trong ví dụ này, chúng ta không cung cấp bất kỳ cặp `Review - Sentiment` nào làm mẫu. LLM tự hiểu khái niệm "Positive", "Negative", "Neutral" và tự phân tích mệnh đề trái ngược ("fast" vs "damaged") để đưa ra kết quả.

---

## Best practices

* **Rõ ràng và cụ thể (Be Specific)**: Vì không có ví dụ, prompt phải cực kỳ rõ ràng, không chứa ngôn ngữ mơ hồ. Thay vì nói "Làm cho câu này hay hơn", hãy nói "Viết lại câu sau với giọng văn chuyên nghiệp và ngắn gọn hơn".
* **Định dạng đầu ra (Format Output)**: Chỉ định rõ định dạng mong muốn để dễ dàng phân tích cú pháp (parse) kết quả, ví dụ: "Chỉ trả về JSON hợp lệ", "Sử dụng danh sách dấu đầu dòng".
* **Sử dụng System Prompt**: Định nghĩa vai trò (Persona) hoặc ngữ cảnh tổng thể trong System Prompt để định hướng kiến thức mà LLM nên truy xuất (ví dụ: "Bạn là một chuyên gia cơ sở dữ liệu...").
* **Sử dụng cấu trúc phân tách**: Dùng các ký hiệu đặc biệt như `"""`, `---`, hoặc `<tags>` XML để phân tách rõ ràng giữa phần hướng dẫn và phần dữ liệu cần xử lý.

---

## Common mistakes

* **Quá tải thông tin (Prompt Overloading)**: Đưa ra quá nhiều yêu cầu phức tạp hoặc mâu thuẫn trong cùng một zero-shot prompt khiến LLM bị "nhiễu" và bỏ sót một số ràng buộc.
* **Kỳ vọng định dạng phức tạp mà không có mẫu**: Yêu cầu LLM trả về một cấu trúc dữ liệu rất đặc thù hoặc có logic lồng ghép sâu mà không giải thích bằng ví dụ thường dẫn đến lỗi (hallucination hoặc sai format).
* **Bỏ qua Role-playing**: Không cung cấp bối cảnh (context) khiến LLM trả lời quá chung chung hoặc lạc đề.

---

## Trade-offs

### Ưu điểm
* **Nhanh chóng và tối giản**: Dễ dàng triển khai và thử nghiệm ngay lập tức.
* **Tiết kiệm chi phí**: Tiêu thụ ít token đầu vào, giúp giảm chi phí API đáng kể khi xử lý ở quy mô lớn.
* **Linh hoạt cao**: Thích ứng nhanh với nhiều bài toán khác nhau mà không cần chuẩn bị dữ liệu mẫu.

### Nhược điểm
* **Độ chính xác thấp hơn Few-shot**: Với các tác vụ phức tạp, logic miền cụ thể (domain-specific) hoặc yêu cầu định dạng đầu ra nghiêm ngặt, zero-shot thường có tỷ lệ lỗi (hallucination) cao hơn.
* **Tính không ổn định (Non-deterministic)**: Việc thiếu ví dụ chuẩn hóa có thể khiến LLM thay đổi cách trả lời giữa các lần chạy khác nhau (khi temperature > 0).

---

## When to use

* Các tác vụ ngôn ngữ tự nhiên cơ bản mà LLM đã rất giỏi do được huấn luyện kỹ lưỡng (dịch thuật, tóm tắt, trích xuất thực thể phổ biến).
* Cần xử lý một lượng lớn văn bản dài (document-level processing) nơi mà context window không còn chỗ để chèn các ví dụ few-shot.
* Khi xây dựng các công cụ phân tích dữ liệu sơ bộ với chi phí thấp (proof-of-concept).

## When not to use

* Các bài toán suy luận logic nhiều bước (multi-step reasoning) hoặc toán học phức tạp (nên dùng Chain-of-Thought hoặc Few-shot).
* Tác vụ yêu cầu kết quả tuân thủ nghiêm ngặt một định dạng (schema) không phổ biến hoặc mã nội bộ của công ty.
* Khi kết quả đầu ra ảnh hưởng lớn đến quyết định quan trọng (như y tế, tài chính) yêu cầu độ chính xác cực cao.

---

## Related concepts

* [Few-shot Prompting](/concepts/few-shot)
* [System Prompt](/concepts/system-prompt)
* [Large Language Model (LLM)](/concepts/llm)
* [Ảo giác LLM (Hallucination)](/concepts/hallucination)

---

## Interview questions

### 1. Phân biệt Zero-shot Prompting và Zero-shot Learning trong Machine Learning truyền thống.
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết nền tảng về sự tiến hóa của các mô hình học máy và cách các thuật ngữ được áp dụng.
* **Gợi ý trả lời (Strong Answer)**: 
  * Zero-shot Learning (ML truyền thống) đề cập đến khả năng của một mô hình học thuật (ví dụ: Computer Vision) có thể phân loại một đối tượng mà nó chưa bao giờ nhìn thấy trong tập huấn luyện (ví dụ: huấn luyện nhận diện ngựa và sọc vằn, sau đó yêu cầu nhận diện ngựa vằn) thông qua việc ánh xạ các thuộc tính ngữ nghĩa. 
  * Zero-shot Prompting (GenAI) là thao tác giao tiếp trực tiếp ở quá trình suy luận (inference), nơi người dùng chỉ định rõ yêu cầu bằng ngôn ngữ tự nhiên để LLM thực hiện mà không cần huấn luyện lại hay cung cấp các ví dụ đầu vào/đầu ra cụ thể.
* **Lỗi cần tránh (Weak Answer)**: Cho rằng chúng hoàn toàn giống nhau hoặc chỉ mô tả Zero-shot Prompting mà thiếu đi bối cảnh của ML truyền thống.

### 2. Khi Zero-shot Prompting thất bại (trả về kết quả sai hoặc sai format), bạn sẽ áp dụng những bước nào để khắc phục?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng debug prompt (Prompt Engineering) và quy trình tối ưu hóa.
* **Gợi ý trả lời (Strong Answer)**:
  1. Kiểm tra lại ngữ pháp và tính rõ ràng của chỉ dẫn (Instruction clarity).
  2. Áp dụng kỹ thuật Role-playing (System Prompt) để bó hẹp không gian tìm kiếm từ vựng của LLM.
  3. Bổ sung các ràng buộc định dạng cụ thể (ví dụ: dùng JSON schema).
  4. Nếu vẫn thất bại, nâng cấp lên Few-shot Prompting bằng cách thêm 1-3 ví dụ (demonstrations).
  5. Đối với bài toán logic, áp dụng Zero-shot Chain-of-Thought bằng cách thêm câu lệnh "Let's think step by step".
* **Lỗi cần tránh**: Lập tức đề xuất Fine-tuning mô hình (quá đắt đỏ và không cần thiết cho những lỗi nhỏ).

### 3. Việc mô hình có khả năng làm tốt Zero-shot trên một task cụ thể chứng tỏ điều gì về quá trình huấn luyện của nó?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết về cơ chế Instruction Tuning và Pre-training.
* **Gợi ý trả lời (Strong Answer)**: Điều đó chứng tỏ hai yếu tố: (1) Mô hình đã thu thập đủ kiến thức liên quan đến miền dữ liệu đó trong giai đoạn Pre-training (sự phổ biến của tri thức trong corpus dữ liệu). (2) Quá trình Instruction Tuning (SFT/RLHF) đã thành công trong việc giúp mô hình hiểu được "ý định" (intent) đằng sau câu lệnh dạng mệnh lệnh (imperative instructions) và biết cách tổng hợp kiến thức nội tại để phản hồi thay vì chỉ đoán từ tiếp theo một cách ngẫu nhiên.

---

## References

1. **"Language Models are Few-Shot Learners"** - Brown et al. (OpenAI, 2020) (Nghiên cứu nền tảng về khả năng zero/few-shot của GPT-3).
2. **"Finetuned Language Models are Zero-Shot Learners" (FLAN)** - Wei et al. (Google Research, 2021) (Định hình khái niệm Instruction Tuning để cải thiện zero-shot performance).
3. **Prompt Engineering Guide** (DAIR.AI) - (Tài liệu tổng hợp thực tiễn về kỹ thuật viết prompt).
4. **OpenAI API Documentation** - Best practices for prompt engineering.

---

## English summary

**Zero-shot Prompting** is a technique in Prompt Engineering where a Large Language Model (LLM) is given a task description and asked to solve it without any demonstrations or examples provided in the prompt. This capability emerges from the model's extensive pre-training on vast amounts of text and subsequent instruction tuning (e.g., RLHF or SFT), enabling it to generalize instructions and leverage its latent knowledge to complete novel tasks. While highly token-efficient and flexible, zero-shot approaches may lack the accuracy and formatting adherence of few-shot prompting in complex or domain-specific scenarios.
