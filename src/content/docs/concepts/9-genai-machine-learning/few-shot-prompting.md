---
title: "Học qua vài ví dụ - Few-shot Prompting"
difficulty: "Beginner"
tags: ["few-shot", "prompt-engineering", "in-context-learning", "llm"]
readingTime: "10 mins"
lastUpdated: 2026-06-16
seoTitle: "Few-shot Prompting là gì? Kỹ thuật Prompt Engineering cơ bản"
metaDescription: "Tìm hiểu Few-shot Prompting: kỹ thuật chèn ví dụ vào prompt để hướng dẫn LLM (In-context Learning) trả về đúng định dạng mà không cần fine-tune."
description: "Khi dạy một đứa trẻ nhận biết các loại trái cây, thay vì ngồi đọc một loạt định nghĩa lý thuyết dài dòng về vỏ, hạt hay lá, cách nhanh nhất là đưa ra vài ví dụ..."
---



Khi dạy một đứa trẻ nhận biết các loại trái cây, thay vì ngồi đọc một loạt định nghĩa lý thuyết dài dòng về vỏ, hạt hay lá, cách nhanh nhất là chỉ vào vài quả táo, quả cam và nói tên của chúng. Mô hình ngôn ngữ lớn (LLM) cũng học theo cách tương tự thông qua kỹ thuật **Few-shot Prompting**.

## Few-Shot Prompting là gì?



**Few-Shot Prompting** (Học qua một vài ví dụ) là kỹ thuật Prompt Engineering trong đó bạn cung cấp cho mô hình ngôn ngữ (như ChatGPT, Claude, Gemini) một vài ví dụ cụ thể về Đầu vào (Input) và Đầu ra (Output) mong muốn ngay bên trong Prompt. 

Việc "mớm mồi" này giúp mô hình nhận diện được khuôn mẫu (pattern), bắt chước nhanh chóng định dạng và giọng điệu cần thiết để xử lý câu hỏi hiện tại. Khả năng học ngay từ prompt của mô hình mà không cần phải cập nhật lại trọng số (weights) được gọi là **In-context Learning**.

## Zero-shot, One-shot và Few-shot

Để hiểu rõ hơn về Few-shot, chúng ta hãy so sánh nó với các khái niệm liên quan:

- **Zero-shot Prompting**: Bạn yêu cầu LLM thực hiện một tác vụ mà không cung cấp bất kỳ ví dụ nào. LLM dựa hoàn toàn vào những kiến thức đã được huấn luyện (pre-training) để trả lời.
- **One-shot Prompting**: Bạn cung cấp **chính xác một** ví dụ minh họa về cách làm.
- **Few-shot Prompting**: Bạn cung cấp **một vài** ví dụ (thường từ 2 đến 10 ví dụ) để chỉ dẫn rõ ràng hơn về độ phức tạp và định dạng của câu trả lời.

### Ví dụ minh họa sự khác biệt

Giả sử bạn muốn phân loại sắc thái cảm xúc của một câu nói:

**Zero-shot:**
```text
Phân loại cảm xúc của câu sau thành Tích cực, Tiêu cực hoặc Trung tính:
Câu: "Tôi rất thích cách phục vụ của nhà hàng này."
Cảm xúc: 
```

**Few-shot:**
```text
Phân loại cảm xúc của câu sau thành Tích cực, Tiêu cực hoặc Trung tính:

Câu: "Món ăn quá mặn, tôi không thể ăn nổi."
Cảm xúc: Tiêu cực

Câu: "Hôm nay trời mưa to."
Cảm xúc: Trung tính

Câu: "Nhân viên rất nhiệt tình và thân thiện."
Cảm xúc: Tích cực

Câu: "Tôi rất thích cách phục vụ của nhà hàng này."
Cảm xúc: 
```

Với **Zero-shot**, mô hình có thể trả lời bằng cả một đoạn văn dài như *"Dựa theo phân tích, câu nói này mang sắc thái Tích cực vì..."*. 
Tuy nhiên, với **Few-shot**, mô hình nhìn vào các ví dụ trước đó và hiểu rằng bạn chỉ cần một từ ngắn gọn là `"Tích cực"`.

## Tại sao cần Few-Shot Prompting?

1. **Kiểm soát định dạng đầu ra (Format Control)**: Đây là lý do phổ biến nhất. Rất khó để mô tả bằng lời một cấu trúc JSON phức tạp hoặc một định dạng text đặc thù. Việc đưa ra vài ví dụ là cách ngắn nhất để LLM hiểu format bạn cần.
2. **Thiết lập Tone of Voice**: Giúp mô hình hiểu được phong cách trả lời (ví dụ: chuyên nghiệp, mỉa mai, hay ngôn ngữ gen Z).
3. **Giải quyết các bài toán ngách**: Khi bài toán của bạn sử dụng thuật ngữ nội bộ hoặc quy tắc đặc biệt mà LLM chưa từng được học kỹ trong quá trình pre-training.

## Các ứng dụng thực tế

### 1. Chuyển đổi định dạng dữ liệu (Data Parsing / Formatting)

Trong Data Engineering, chúng ta thường cần trích xuất dữ liệu không có cấu trúc thành có cấu trúc. Few-shot cực kỳ hiệu quả để làm việc này.

```text
Trích xuất tên và tuổi từ đoạn văn bản sau, trả về định dạng JSON:

Văn bản: "Nam năm nay 25 tuổi, hiện đang là kỹ sư."
JSON: {"name": "Nam", "age": 25}

Văn bản: "Hôm qua sinh nhật lần thứ 30 của chị Lan."
JSON: {"name": "Lan", "age": 30}

Văn bản: "Bác Hùng, 55 tuổi, vừa trúng số."
JSON: 
```

### 2. Trích xuất thông tin (Information Extraction)

Bạn muốn lấy ra các thực thể cụ thể từ một văn bản dài.

```text
Trích xuất các kỹ năng công nghệ từ mô tả công việc:

Mô tả: "Cần tuyển lập trình viên am hiểu về Python và có kinh nghiệm với hệ quản trị cơ sở dữ liệu MySQL. Biết dùng Git là lợi thế."
Kỹ năng: Python, MySQL, Git

Mô tả: "Công việc yêu cầu ứng viên có khả năng phân tích dữ liệu bằng Pandas, trực quan hóa bằng Tableau và có hiểu biết cơ bản về AWS."
Kỹ năng: Pandas, Tableau, AWS

Mô tả: "Chúng tôi đang tìm kiếm kỹ sư dữ liệu thành thạo Apache Spark và Kafka, có kinh nghiệm làm việc với môi trường GCP."
Kỹ năng:
```

## Các nguyên tắc tốt nhất (Best Practices) khi dùng Few-shot

Để Few-shot Prompting đạt hiệu quả cao nhất, bạn nên tuân theo một số nguyên tắc sau:

1. **Cung cấp định dạng nhất quán**: Các ví dụ nên được format giống hệt nhau. Sử dụng dấu phân cách rõ ràng như `###`, `---`, hoặc ngoặc kép để tách biệt các ví dụ.
2. **Tính đại diện và Đa dạng**: Chọn các ví dụ bao quát các trường hợp khác nhau của vấn đề. Nếu bài toán phân loại có 3 nhãn, hãy đảm bảo cả 3 nhãn đều xuất hiện trong các ví dụ.
3. **Phân phối nhãn đồng đều**: Nếu bạn cung cấp 4 ví dụ và cả 4 đều có nhãn là "Tích cực", mô hình có thể bị thiên kiến (bias) và luôn đoán "Tích cực" cho input của bạn.
4. **Thứ tự của các ví dụ**: Mô hình có xu hướng bị ảnh hưởng bởi những ví dụ nằm ở cuối prompt (Recency bias). Cố gắng xáo trộn ngẫu nhiên thứ tự các ví dụ nếu bạn sinh prompt tự động.
5. **Số lượng ví dụ**: Thông thường từ 3 đến 5 ví dụ là đủ. Nếu bạn cần đưa vào quá nhiều ví dụ (hàng chục hay hàng trăm), có thể bạn nên cân nhắc kỹ thuật Fine-tuning (RAG hoặc Supervised Fine-Tuning).

## Hạn chế của Few-shot Prompting

Dù mạnh mẽ, Few-shot Prompting không phải là "viên đạn bạc". Nó thường **thất bại** khi bài toán đòi hỏi phải **suy luận logic phức tạp** hoặc tính toán toán học nhiều bước. 

Ví dụ, nếu bạn đưa vào các bài toán đố mẹo hoặc tính toán có nhiều biến số, dù bạn đưa 10 ví dụ thì mô hình vẫn có thể làm sai ở ví dụ thứ 11 vì nó chỉ cố gắng khớp khuôn mẫu (pattern matching) thay vì thực sự suy luận.

Trong những trường hợp như vậy, chúng ta sẽ cần kết hợp Few-shot với một kỹ thuật tiên tiến hơn: **Chain-of-Thought (CoT)**. Thay vì chỉ cung cấp Input và Output, chúng ta sẽ cung cấp cả **các bước suy luận trung gian** vào trong ví dụ.

## Tổng kết

Few-Shot Prompting là một trong những công cụ cơ bản và hiệu quả nhất trong bộ kỹ năng Prompt Engineering. Bằng cách chèn một vài ví dụ chất lượng vào prompt (In-context learning), bạn có thể dễ dàng hướng dẫn LLM thực hiện đúng định dạng, giọng điệu và quy tắc bài toán mà không tốn công sức cấu hình phức tạp.

## Tài Liệu Tham Khảo
* [Language Models are Few-Shot Learners (Nghiên cứu gốc từ OpenAI về GPT-3)](https://arxiv.org/abs/2005.14165)
* [Prompt Engineering Guide - Few-Shot Prompting](https://www.promptingguide.ai/techniques/fewshot)
* **Ng - Machine Learning Specialization (Coursera)**
