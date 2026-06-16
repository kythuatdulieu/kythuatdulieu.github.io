---
title: "Học không cần ví dụ (Zero-shot)"
difficulty: "Beginner"
tags: ["genai", "prompt-engineering", "zero-shot", "llm", "nlp"]
readingTime: "10 mins"
lastUpdated: 2026-06-16
seoTitle: "Zero-shot Prompting là gì? Cẩm nang học không cần ví dụ cho LLM"
metaDescription: "Tìm hiểu chuyên sâu về kỹ thuật Zero-shot trong Prompt Engineering: định nghĩa, cơ chế hoạt động, best practices và các câu hỏi phỏng vấn thực tế."
description: "Khám phá kỹ thuật Zero-shot Prompting: Khi nào bạn nên giao phó nhiệm vụ cho AI mà không cần đưa ra ví dụ mẫu. Cơ chế, ứng dụng và cách tối ưu hóa."
---



## 1. Zero-shot Prompting là gì?



Hãy tưởng tượng bạn tuyển dụng một người trợ lý vô cùng xuất chúng, vừa tốt nghiệp xuất sắc từ mọi trường đại học hàng đầu trên thế giới. Bạn đưa cho họ một tài liệu tiếng Anh và yêu cầu: *"Hãy dịch tài liệu này sang tiếng Việt"*. Bạn không hề đưa ra bất kỳ mẫu dịch nào trước đó (ví dụ: "Apple dịch là Quả Táo, Hello là Xin Chào"). Dù vậy, người trợ lý vẫn hiểu ngay lập tức và hoàn thành xuất sắc công việc. 

Trong thế giới của Trí tuệ Nhân tạo (AI) và các Mô hình Ngôn ngữ Lớn (LLM - Large Language Models), **Zero-shot Prompting** chính là tình huống đó.

Cụ thể hơn, **Zero-Shot Prompting** (Học không cần ví dụ) là kỹ thuật mà người dùng đưa ra một mệnh lệnh, yêu cầu thẳng thừng cho mô hình AI mà **không cung cấp thêm bất kỳ ví dụ mẫu nào** (Zero examples) trong phần prompt. Mô hình phải dựa hoàn toàn vào những "kiến thức bản năng" đã được học trong quá trình huấn luyện (pre-training) và tinh chỉnh (instruction tuning) để tự suy luận ý định của người dùng và định dạng cần thiết để phản hồi.

## 2. Cơ chế hoạt động của Zero-shot

Để một mô hình AI có thể hiểu được lệnh Zero-shot, nó cần trải qua hai quá trình quan trọng:

1. **Pre-training (Tiền huấn luyện):** Mô hình được tiếp xúc với một lượng dữ liệu khổng lồ (văn bản trên internet, sách, bài báo...). Tại đây, nó học được ngữ pháp, từ vựng, kiến thức chung và cả khả năng suy luận logic cơ bản của con người.
2. **Instruction Tuning (Tinh chỉnh theo hướng dẫn) & RLHF (Học tăng cường từ phản hồi của con người):** Đây là bước "dạy" cho mô hình biết cách lắng nghe mệnh lệnh và hành xử như một trợ lý thay vì chỉ dự đoán từ tiếp theo. Nhờ bước này, LLM biết rằng khi bạn nói "Hãy tóm tắt...", nó cần thực hiện hành động tóm tắt chứ không phải viết tiếp đoạn văn bản đó.

**Ví dụ một prompt Zero-shot cơ bản:**

```text
Phân loại cảm xúc của câu sau đây thành Tích cực, Tiêu cực hoặc Trung tính:
"Dịch vụ chăm sóc khách hàng của công ty này thật sự rất tệ, tôi phải chờ hơn một tiếng đồng hồ mới có người nhấc máy."

Kết quả:
```

Trong ví dụ này, chúng ta không hề đưa ra ví dụ mẫu nào về câu tích cực hay tiêu cực trước đó, nhưng mô hình vẫn dễ dàng trả về `Tiêu cực`.

## 3. Các ứng dụng phổ biến của Zero-shot Prompting

Zero-shot Prompting tỏa sáng trong các tác vụ liên quan đến hiểu biết ngôn ngữ tự nhiên cơ bản:

* **Phân loại văn bản (Text Classification):** Phân loại tin tức (thể thao, chính trị, giải trí), phân tích cảm xúc (tích cực, tiêu cực), phát hiện thư rác (spam).
* **Dịch thuật (Translation):** Dịch các đoạn văn bản từ ngôn ngữ này sang ngôn ngữ khác.
* **Tóm tắt (Summarization):** Trích xuất ý chính từ các văn bản dài.
* **Trích xuất thông tin (Information Extraction):** Lấy các thực thể (Tên người, Địa điểm, Thời gian) ra khỏi một đoạn văn.
* **Trả lời câu hỏi (Question Answering):** Trả lời các câu hỏi về kiến thức chung.

## 4. Ưu điểm và Nhược điểm

### Ưu điểm

* **Đơn giản, dễ sử dụng:** Bạn chỉ cần gõ yêu cầu của mình như đang nói chuyện với một người bình thường.
* **Tiết kiệm Token (và chi phí):** Việc không phải nhồi nhét nhiều ví dụ vào prompt giúp tiết kiệm đáng kể số lượng token, từ đó giảm chi phí khi sử dụng API và tăng tốc độ phản hồi.
* **Khả năng tổng quát hóa cao:** Những mô hình ngôn ngữ lớn hiện đại như GPT-4, Claude 3, Gemini 1.5 xử lý cực kỳ tốt Zero-shot trên nhiều lĩnh vực.

### Nhược điểm

* **Kém hiệu quả với các tác vụ phức tạp:** Khi yêu cầu đòi hỏi những logic đặc thù, nghiệp vụ riêng biệt của doanh nghiệp, hoặc cấu trúc phản hồi quá phức tạp, Zero-shot thường thất bại hoặc đưa ra kết quả không nhất quán.
* **Dễ gặp ảo giác (Hallucination):** Mô hình có thể "bịa" ra thông tin nếu không có các ràng buộc chặt chẽ từ ví dụ mẫu.
* **Khó kiểm soát định dạng:** Mặc dù bạn có thể yêu cầu mô hình trả về định dạng JSON hay XML, nhưng nếu không có ví dụ cụ thể, mô hình đôi khi vẫn trả về kèm theo các đoạn văn bản thừa (ví dụ: "Dưới đây là kết quả JSON của bạn: ...").

## 5. Best Practices khi sử dụng Zero-shot

Để tối đa hóa sức mạnh của Zero-shot Prompting, bạn nên áp dụng các mẹo sau:

1. **Rõ ràng và cụ thể (Clear and Specific):** Hãy nêu chính xác những gì bạn muốn. Tránh những câu từ mơ hồ.
   * ❌ *Kém:* "Làm cho câu này hay hơn."
   * ✅ *Tốt:* "Hãy viết lại câu sau đây theo phong cách chuyên nghiệp, ngôn ngữ trang trọng để gửi cho đối tác kinh doanh."
2. **Xác định vai trò (Role-playing):** Gán cho AI một vai trò cụ thể để định hình cách trả lời.
   * *"Đóng vai một chuyên gia phân tích dữ liệu với 10 năm kinh nghiệm..."*
3. **Cung cấp đủ bối cảnh (Context is King):** Dù không có ví dụ mẫu, bạn vẫn phải cung cấp bối cảnh đầy đủ cho dữ liệu bạn đang đưa vào.
4. **Chỉ định rõ ràng định dạng đầu ra (Output Formatting):** Sử dụng các ký hiệu rõ ràng (như ngoặc kép, dấu gạch ngang) để phân tách giữa hướng dẫn và dữ liệu đầu vào.
   * *"Trả về kết quả duy nhất ở định dạng JSON, không giải thích gì thêm."*

## 6. Zero-shot vs. Few-shot: Khi nào nên dùng kỹ thuật nào?

Một trong những quyết định quan trọng của Prompt Engineering là lựa chọn giữa Zero-shot và Few-shot (Đưa ra một vài ví dụ).

| Tiêu chí | Zero-shot | Few-shot |
| :--- | :--- | :--- |
| **Sử dụng khi nào?** | Tác vụ chung chung, phổ biến. AI đã được huấn luyện rất kỹ. | Tác vụ đặc thù, logic nội bộ, format đầu ra khắt khe. |
| **Chi phí Token** | Thấp | Cao (tốn thêm token cho các ví dụ) |
| **Tốc độ phản hồi** | Nhanh hơn | Chậm hơn một chút (phụ thuộc độ dài ví dụ) |
| **Tính nhất quán của Output** | Trung bình - Khá | Rất cao |

**Luật bất thành văn:** Luôn luôn bắt đầu với **Zero-shot**. Nếu mô hình thực hiện tốt, hãy giữ nguyên. Nếu kết quả không đạt yêu cầu, lúc đó hãy nâng cấp lên **Few-shot**.

## 7. Câu hỏi phỏng vấn thực tế

**Câu hỏi 1: Sự khác biệt giữa Zero-shot learning trong AI truyền thống và Zero-shot prompting đối với LLMs là gì?**
> **Gợi ý trả lời:**
> * Trong AI truyền thống, "Zero-shot learning" (ZSL) thường ám chỉ việc huấn luyện một mô hình phân loại (hình ảnh hoặc văn bản) có khả năng nhận diện các nhãn (labels) mà nó *chưa từng* được nhìn thấy trong tập huấn luyện (thường thông qua việc dùng các attribute hoặc word embeddings làm cầu nối).
> * Trong LLMs, "Zero-shot prompting" là quá trình tương tác (inference time) nơi chúng ta không cung cấp các ví dụ input-output minh họa nào trong prompt, mà dựa vào khả năng tổng quát hóa từ lượng kiến thức khổng lồ có sẵn của mô hình (đã được fine-tune qua Instruction Tuning).

**Câu hỏi 2: Tại sao một mô hình mạnh (như GPT-4) đôi khi vẫn thất bại với Zero-shot ở những tác vụ tưởng chừng đơn giản (như in ra kết quả JSON chuẩn)? Cách khắc phục?**
> **Gợi ý trả lời:**
> * Mô hình thường được huấn luyện để trở nên "thân thiện và giải thích" (như một chatbot), dẫn đến việc nó hay thêm các cụm từ đệm như "Chắc chắn rồi, đây là đoạn mã JSON của bạn:".
> * **Cách khắc phục trong Zero-shot:** 
>   1. Sử dụng System Prompt mạnh (ví dụ: "You are a JSON generator API. Output only valid JSON. No Markdown formatting. No explanations.").
>   2. Cung cấp tiền tố cho câu trả lời (Assistant pre-fill): Ví dụ bắt đầu phần phản hồi bằng ký tự `{`.
>   3. Nếu vẫn thất bại, buộc phải chuyển sang Few-shot hoặc sử dụng các công cụ ép kiểu trả về của API (như JSON mode / Structured Outputs của OpenAI).

## 8. Tài liệu tham khảo

* [Kojima, T. et al. (2022). "Large Language Models are Zero-Shot Reasoners" (Let's think step by step)](https://arxiv.org/abs/2205.11916)
* [Wei, J. et al. (2021). "Finetuned Language Models Are Zero-Shot Learners"](https://arxiv.org/abs/2109.01652)
* [OpenAI Prompt Engineering Guide - Zero-shot](https://platform.openai.com/docs/guides/prompt-engineering)
* **Learn Prompting: Zero-Shot Prompting**
