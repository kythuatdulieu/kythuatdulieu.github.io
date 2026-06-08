---
title: "Học qua vài ví dụ - Few-shot Prompting"
category: "GenAI"
difficulty: "Beginner"
tags: ["few-shot", "prompt-engineering", "in-context-learning", "llm"]
readingTime: "7 mins"
lastUpdated: 2026-06-08
seoTitle: "Few-shot Prompting là gì? Kỹ thuật Prompt Engineering cơ bản"
metaDescription: "Tìm hiểu Few-shot Prompting: kỹ thuật chèn ví dụ vào prompt để hướng dẫn LLM (In-context Learning) trả về đúng định dạng mà không cần fine-tune."
---

# Học qua vài ví dụ - Few-shot Prompting

## Summary

Few-shot Prompting (Học qua vài ví dụ) là một kỹ thuật cốt lõi trong Kỹ nghệ Gợi ý (Prompt Engineering). Phương pháp này liên quan đến việc cung cấp cho Mô hình ngôn ngữ lớn (LLM) một số lượng nhỏ các ví dụ mẫu (cặp Đầu vào - Đầu ra) ngay bên trong câu lệnh (prompt) trước khi yêu cầu mô hình giải quyết nhiệm vụ chính. Thông qua các ví dụ này, mô hình học được "luật chơi", hiểu được ngữ điệu, và ép được định dạng đầu ra (như JSON) một cách chính xác mà không cần phải trải qua quá trình huấn luyện lại tốn kém (Fine-tuning).

---

## Definition

Về mặt học máy, **Few-shot Prompting** tận dụng khả năng **In-context Learning (Học trong ngữ cảnh)** của kiến trúc Transformer.

Mô hình không thực sự cập nhật bất kỳ trọng số (weights) nào trong não bộ của nó. Thay vào đó, nó dựa vào cơ chế Attention để phân tích các khuôn mẫu (patterns) từ các ví dụ bạn cung cấp trong ngữ cảnh hiện tại (context window) và từ đó dự đoán chuỗi token tiếp theo sao cho khớp với khuôn mẫu đó nhất. 

* *Zero-shot*: Không cho ví dụ nào.
* *One-shot*: Cho 1 ví dụ.
* *Few-shot*: Cho từ 2 đến vài chục ví dụ.

---

## Why it exists

LLMs (như GPT-4, Llama) cực kỳ thông minh trong suy luận chung, nhưng chúng lại "ngây thơ" trước các yêu cầu định dạng cứng nhắc của phần mềm truyền thống.

Nếu bạn bảo LLM: "Phân loại sắc thái câu nói này thành Tích cực, Tiêu cực, Trung lập", nó có thể trả lời:
* "Câu này mang ý nghĩa tiêu cực bạn nhé!"
* "Tiêu cực."
* "Tôi nghĩ đây là một câu tiêu cực."

Sự bất định này làm sập toàn bộ các pipeline tự động (API) vì code lập trình cần đúng một chữ "Negative". Few-shot Prompting sinh ra để "thiết lập khuôn mẫu". Khi LLM nhìn thấy các ví dụ trước đều trả lời cộc lốc 1 chữ, nó sẽ tự động trả lời cộc lốc 1 chữ.

---

## Core idea

Cấu trúc của một Few-shot Prompt thường bao gồm 3 phần rạch ròi:
1. **Task Description (Chỉ thị)**: Mô tả tổng quan nhiệm vụ.
2. **Demonstrations (Các ví dụ)**: Chuỗi các cặp `[Input] -> [Output]` mẫu.
3. **Target Input (Đầu vào thực tế)**: Dữ liệu bạn cần mô hình xử lý, với phần `[Output]` để trống chờ mô hình sinh ra.

---

## How it works (Ví dụ thực tiễn)

**Bài toán: Trích xuất tên viết tắt của công ty.**

*(Prompt gửi cho mô hình)*
```text
Trích xuất tên viết tắt của các công ty công nghệ trong câu sau.

Văn bản: Apple Inc. vừa phát hành điện thoại mới.
Viết tắt: AAPL

Văn bản: Cổ phiếu của Microsoft Corporation đang tăng giá.
Viết tắt: MSFT

Văn bản: Google Alphabet bị kiện vì độc quyền.
Viết tắt: GOOGL

Văn bản: Tập đoàn Meta Platforms ra mắt kính thực tế ảo.
Viết tắt: 
```

*(Output của mô hình)*
```text
META
```

Mô hình tự nhìn vào 3 ví dụ trên, nhận ra pattern: "A, output chỉ chứa đúng mã cổ phiếu viết hoa 4-5 chữ cái", và nó sinh ra kết quả tương ứng.

---

## Best practices

* **Định dạng nhất quán**: Các ví dụ mẫu phải giống hệt nhau về dấu câu, khoảng trắng, và từ khóa (như `Văn bản:`, `Viết tắt:`). Sự lộn xộn trong ví dụ sẽ làm mô hình bối rối.
* **Chất lượng và sự đa dạng**: Nếu bài toán phân loại sắc thái, đừng chỉ đưa 3 ví dụ "Tích cực". Hãy đưa cả "Tích cực", "Tiêu cực", "Trung lập" và các ca khó (edge cases) để mô hình học được toàn bộ không gian vấn đề.
* **Sử dụng Dấu phân cách (Delimiters)**: Dùng các ký hiệu như `---` hoặc `###` để tách biệt các ví dụ với nhau, giúp mô hình nhận diện ranh giới rõ ràng hơn.
* **Số lượng ví dụ**: Thông thường 3-5 ví dụ là điểm ngọt (sweet spot). Nhiều hơn sẽ tốn token và làm chậm hệ thống mà tỷ lệ chính xác tăng thêm không đáng kể (Diminishing returns).

---

## Trade-offs

### Ưu điểm
* **Dễ triển khai nhất**: Không cần biết code phức tạp, không cần huấn luyện mô hình, kết quả thấy ngay lập tức.
* **Linh hoạt cực độ**: Đổi luật chơi? Chỉ cần sửa vài dòng text trong ví dụ là xong.
* **Hiệu quả cao trong định dạng**: Gần như loại bỏ hoàn toàn các văn bản rườm rà thừa thãi (như "Chắc chắn rồi, đây là kết quả của bạn:").

### Nhược điểm
* **Tốn Token**: Việc nhét 5 ví dụ vào mỗi câu lệnh gửi đi API sẽ làm phình to số lượng token, dẫn đến tốn tiền và trễ mạng (latency) cao hơn Zero-shot.
* **Khó khăn với bài toán suy luận phức tạp**: Few-shot chỉ giúp mô hình bắt chước *định dạng*, chứ không giúp mô hình tự dưng thông minh hơn trong toán học hay logic. (Đó là lý do Chain-of-Thought ra đời).

---

## When to use

* Ép mô hình trả về đúng định dạng chuẩn (JSON, XML, CSV).
* Dạy mô hình thực hiện các tác vụ chuyển đổi cấu trúc lạ (ví dụ: chuyển tên người Việt Nam thành không dấu viết hoa).
* Phân loại văn bản, phân tích cảm xúc (Sentiment Analysis) phục vụ pipeline API.

## When not to use

* Bài toán quá đơn giản mà mô hình Zero-shot đã giải quyết chính xác 100%.
* Bài toán cần mô hình phải có lượng kiến thức nghiệp vụ khổng lồ. (Đưa 1000 ví dụ vào prompt sẽ tràn Context Window, lúc này phải chuyển sang [Fine-tuning](/concepts/fine-tuning)).
* Các bài toán toán học nhiều bước (Hãy chuyển sang Few-shot Chain-of-Thought).

---

## Related concepts

* [Prompt Engineering](/concepts/prompt-engineering)
* [Fine-tuning](/concepts/fine-tuning)

---

## Interview questions

### 1. In-context Learning là gì và nó khác biệt thế nào với Transfer Learning (Fine-tuning)?
* **Người phỏng vấn muốn kiểm tra**: Nắm bắt nguyên lý cốt lõi của Machine Learning hiện đại.
* **Gợi ý trả lời (Strong Answer)**:
  * In-context Learning (Học qua ngữ cảnh - diễn ra trong Few-shot Prompting) chỉ xảy ra trong thời gian chạy (Inference). Mô hình phân tích các mẫu text lưu trong Context Window (với sự hỗ trợ của Attention Mechanism) để sinh kết quả, nhưng **trọng số (weights) của mô hình không hề thay đổi**. Mọi kiến thức học được sẽ biến mất sau khi câu lệnh kết thúc.
  * Transfer Learning (Fine-tuning) diễn ra trong quá trình huấn luyện (Training). Mô hình sử dụng đạo hàm và backpropagation để cập nhật vĩnh viễn các **trọng số (weights)** bên trong cấu trúc của nó.

### 2. Nếu Few-shot Prompting với 5 ví dụ vẫn bị sai, bạn nên làm gì tiếp theo?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng gỡ lỗi (Debugging) và kinh nghiệm thực tiễn.
* **Gợi ý trả lời (Strong Answer)**:
  * 1. Kiểm tra lại chất lượng 5 ví dụ xem có bị sai nhãn (mismatched labels) hay không.
  * 2. Thay đổi trật tự các ví dụ: LLMs có thiên kiến recency bias (nhớ tốt ví dụ cuối cùng). Đảo lộn trật tự xem có cải thiện không.
  * 3. Nếu bài toán cần suy luận logic, nâng cấp lên kỹ thuật **Chain-of-Thought (CoT)**: thêm phần giải thích các bước suy luận vào phần Output của các ví dụ.
  * 4. Nếu vẫn thất bại, thu thập 500 mẫu và tiến hành **Fine-tuning** (LoRA).

---

## English summary

Few-shot Prompting is a foundational Prompt Engineering technique where a Large Language Model (LLM) is provided with a small number of demonstration examples (input-output pairs) directly within the prompt's context window before asking it to perform a task. It leverages the "In-context Learning" capability of Transformers to strictly enforce output formatting, adhere to specific styles, or perform novel tasks without the need to permanently update the model's parameters (Fine-tuning). While highly effective and easy to implement, it increases token consumption per request and relies solely on pattern matching rather than enhancing underlying reasoning capabilities.
