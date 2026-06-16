---
title: "Mô hình Ngôn ngữ Lớn (Large Language Model)"
difficulty: "Beginner"
tags: ["llm", "genai", "transformer", "nlp", "machine-learning"]
readingTime: "15 mins"
lastUpdated: 2026-06-08
seoTitle: "LLM là gì? Tổng quan về Mô hình Ngôn ngữ Lớn (Large Language Model)"
metaDescription: "Tìm hiểu kiến trúc cốt lõi của LLM (Large Language Model), cơ chế Transformer, Next-token prediction, và hành trình từ Pre-training đến Instruction Tuning."
description: "Nếu bạn đã từng trầm trồ trước khả năng làm thơ, viết code hay trả lời câu hỏi trôi chảy của ChatGPT, Claude hay Gemini, thì bạn đã chứng kiến sức mạnh của các Mô hình Ngôn ngữ Lớn (LLM)."
---



Nếu bạn đã từng trầm trồ trước khả năng làm thơ, viết code hay trả lời câu hỏi trôi chảy của ChatGPT, Claude hay Gemini, thì bạn đã chứng kiến sức mạnh của các **Mô hình Ngôn ngữ Lớn (Large Language Model - LLM)**. 

LLM là một đột phá trong lĩnh vực Trí tuệ Nhân tạo (AI) và Xử lý Ngôn ngữ Tự nhiên (NLP), đánh dấu bước chuyển mình sang kỷ nguyên của Generative AI (AI Tạo sinh). Vậy chính xác thì LLM là gì, nó hoạt động ra sao và làm thế nào mà nó có thể "hiểu" được ngôn ngữ của con người?

## 1. LLM (Large Language Model) là gì?



**Mô hình Ngôn ngữ Lớn (LLM)** là các mô hình trí tuệ nhân tạo được huấn luyện bằng các thuật toán học sâu (deep learning) trên những tập dữ liệu văn bản khổng lồ. Mục tiêu cốt lõi của chúng là hiểu và tạo ra ngôn ngữ tự nhiên hoặc các dạng ngôn ngữ khác (như mã nguồn lập trình, ngôn ngữ toán học) một cách mạch lạc.

Chữ **"Large" (Lớn)** trong LLM đề cập đến hai yếu tố chính:
1. **Kích thước dữ liệu huấn luyện:** Lên đến hàng Terabyte hoặc Petabyte dữ liệu văn bản được thu thập từ internet (Wikipedia, sách, bài báo, mã nguồn trên GitHub, v.v.).
2. **Số lượng tham số (Parameters):** Hàng tỷ cho đến hàng nghìn tỷ tham số (ví dụ: GPT-3 có 175 tỷ tham số, các mô hình hiện đại còn lớn hơn nhiều). Các tham số này đóng vai trò như các "khớp nối thần kinh" trong bộ não của mô hình, giúp nó ghi nhớ các khuôn mẫu, quy luật ngôn ngữ và kiến thức chung.

Về cơ bản, LLM là một "cỗ máy đoán từ tiếp theo" (Next-token predictor) cực kỳ tinh vi.

---

## 2. Kiến Trúc Cốt Lõi: Cú Hích Từ Transformer

Trước năm 2017, các mô hình ngôn ngữ như RNN (Recurrent Neural Networks) hoặc LSTM thường xử lý dữ liệu theo tuần tự từng từ một. Điều này gây khó khăn trong việc song song hóa quá trình huấn luyện và khiến mô hình "quên" mất ngữ cảnh khi câu quá dài.

Sự bùng nổ của LLM bắt nguồn từ bài báo lịch sử **"Attention Is All You Need"** của Google (2017), giới thiệu kiến trúc **Transformer**. Kiến trúc này thay đổi hoàn toàn cục diện NLP với hai cải tiến đột phá:

### Cơ chế Self-Attention (Tự chú ý)
Thay vì đọc từng từ từ trái sang phải, Self-Attention cho phép mô hình nhìn vào toàn bộ câu cùng một lúc và đánh giá mức độ liên quan (attention) giữa tất cả các từ với nhau, dù chúng nằm ở đâu trong câu.
*Ví dụ:* Trong câu "Ngân hàng đã khóa tài khoản của anh ấy vì nó có dấu hiệu lừa đảo." từ "nó" chỉ "tài khoản", không phải "ngân hàng". Self-Attention giúp mô hình gán trọng số liên kết mạnh giữa "nó" và "tài khoản".

### Tính toán Song song (Parallelization)
Vì mô hình có thể xử lý tất cả các từ trong chuỗi cùng một lúc, kiến trúc Transformer tận dụng tối đa sức mạnh tính toán song song của GPU/TPU, cho phép huấn luyện các mô hình khổng lồ trong thời gian ngắn hơn nhiều so với trước đây.

### Encoder và Decoder
Kiến trúc Transformer gốc bao gồm 2 phần:
- **Encoder:** Chuyên đọc và hiểu văn bản (VD: BERT - Rất giỏi phân tích cú pháp, trích xuất thực thể).
- **Decoder:** Chuyên sinh ra văn bản tiếp theo (VD: GPT - Rất giỏi tạo ra nội dung mới). Hầu hết các LLM nổi tiếng hiện nay (GPT, Llama, Claude) đều là mô hình *Decoder-only*.

---

## 3. Cơ Chế Hoạt Động Của LLM

Để biến một chuỗi ký tự thành "suy nghĩ", LLM trải qua các bước xử lý sau:

### 3.1. Tokenization (Băm nhỏ văn bản)
Mô hình không đọc trực tiếp chữ cái hay từ ngữ. Văn bản đầu vào được chia nhỏ thành các đơn vị gọi là **Token**. Một token có thể là một từ, một phần của từ (như tiền tố, hậu tố) hoặc một ký tự.
* Ví dụ: Từ "Hamburger" có thể được chia thành `Ham`, `bur`, `ger`.
* Các thuật toán phổ biến: Byte-Pair Encoding (BPE), WordPiece.

### 3.2. Embedding (Nhúng không gian vector)
Mỗi token được chuyển đổi thành một mảng số thực (vector) đa chiều, gọi là **Embedding**. Quá trình này giúp mô hình hiểu được ý nghĩa ngữ nghĩa của từ. Các từ có nghĩa tương tự (như "chó" và "mèo") sẽ có các vector nằm gần nhau trong không gian đa chiều này.

### 3.3. Xử lý qua các tầng Transformer
Các vector embedding cùng với thông tin về vị trí của từ (Positional Encoding) được đưa qua nhiều lớp Transformer (Layers). Tại đây, cơ chế Self-Attention và mạng nơ-ron truyền thẳng (Feed Forward Neural Network) thực hiện hàng tỷ phép tính để rút trích ngữ cảnh phức tạp.

### 3.4. Next-Token Prediction (Dự đoán từ tiếp theo)
Sau khi xử lý, lớp cuối cùng của mô hình xuất ra xác suất cho tất cả các token có thể xuất hiện tiếp theo trong từ điển. Mô hình sẽ chọn token có xác suất cao nhất hoặc dựa trên một độ ngẫu nhiên (*temperature*) và nối vào câu.
Quá trình này cứ lặp lại liên tục cho đến khi mô hình sinh ra một token đặc biệt báo hiệu kết thúc câu trả lời (`<EOS> - End of Sequence`).

---

## 4. Hành Trình Huấn Luyện Một LLM (The Training Pipeline)

Để tạo ra một trợ lý AI thông minh như ChatGPT, quá trình huấn luyện trải qua 3 giai đoạn chính:

### Giai đoạn 1: Pre-training (Tiền huấn luyện)
Đây là giai đoạn tốn kém nhất, cần hàng ngàn GPU chạy liên tục trong nhiều tháng.
- **Nhiệm vụ:** Đọc hàng nghìn tỷ token từ Internet để học ngữ pháp, từ vựng, sự kiện, khả năng suy luận cơ bản và ngôn ngữ lập trình.
- **Mục tiêu:** Dự đoán chính xác token tiếp theo.
- **Kết quả:** Chúng ta có một **Base Model** (Mô hình gốc). Mô hình này rất "thông minh" nhưng chưa biết cách trả lời câu hỏi như một trợ lý. Nếu bạn đưa vào "Thủ đô của Việt Nam là", nó có thể sinh ra "Hà Nội", nhưng nếu bạn đưa vào "Hãy viết cho tôi một bài thơ", nó có thể sinh ra tiếp "về quê hương..." thay vì thực sự viết bài thơ.

### Giai đoạn 2: Supervised Fine-Tuning (SFT) / Instruction Tuning
- **Nhiệm vụ:** Dạy mô hình cách hiểu các "lệnh" (instructions) và định dạng câu trả lời như một cuộc hội thoại.
- **Cách làm:** Con người tạo ra hàng chục nghìn cặp dữ liệu `[Câu hỏi / Lệnh] -> [Câu trả lời mẫu]`. Mô hình được học thêm trên tập dữ liệu nhỏ nhưng chất lượng cao này.
- **Kết quả:** Mô hình **Instruction-Tuned**. Nó bắt đầu biết cách tuân thủ mệnh lệnh và hoạt động như một chatbot.

### Giai đoạn 3: RLHF (Reinforcement Learning from Human Feedback)
- **Nhiệm vụ:** Căn chỉnh (Alignment) hành vi của mô hình với các giá trị cốt lõi của con người (hữu ích, vô hại, trung thực).
- **Cách làm:** Mô hình sinh ra nhiều câu trả lời khác nhau cho cùng một câu hỏi. Con người (Human Raters) sẽ xếp hạng các câu trả lời này từ tốt nhất đến kém nhất. Sau đó, một mô hình thứ hai (Reward Model) được học cách bắt chước sở thích của con người, và dùng nó để "chấm điểm" và tinh chỉnh lại LLM bằng thuật toán Học tăng cường (Reinforcement Learning - PPO/DPO).
- **Kết quả:** Một mô hình an toàn hơn, lịch sự hơn, biết từ chối trả lời các yêu cầu độc hại và cung cấp thông tin chất lượng cao.

---

## 5. Một Số Khái Niệm Quan Trọng Liên Quan

* **Context Window (Độ dài ngữ cảnh):** Giới hạn số lượng token (câu hỏi + câu trả lời) mà mô hình có thể "nhớ" và xử lý cùng một lúc. Ban đầu các mô hình chỉ hỗ trợ 4k - 8k tokens. Hiện nay (như Gemini 1.5 Pro) có context window lên tới 2 triệu token (tương đương với hàng chục cuốn sách).
* **Hallucination (Ảo giác):** Hiện tượng LLM sinh ra những thông tin sai lệch, không có thật hoặc vô nghĩa nhưng với một giọng điệu cực kỳ tự tin và thuyết phục. Đây là một trong những điểm yếu lớn nhất của LLM hiện tại.
* **Prompt Engineering:** Nghệ thuật và kỹ thuật thiết kế câu lệnh đầu vào để dẫn dắt LLM sinh ra kết quả tốt nhất, chính xác nhất theo ý muốn của người dùng.
* **RAG (Retrieval-Augmented Generation):** Kỹ thuật kết hợp sức mạnh ngôn ngữ của LLM với khả năng tìm kiếm từ một cơ sở dữ liệu bên ngoài (thường là dữ liệu nội bộ của doanh nghiệp). RAG giúp giảm thiểu hallucination vì mô hình chỉ được phép trả lời dựa trên thông tin đã truy xuất được.

---

## 6. Các Hệ Sinh Thái Và Họ Mô Hình Tiêu Biểu

Thế giới LLM được chia thành 2 phe chính:

### Mô hình Đóng (Proprietary / Closed-source)
- **OpenAI:** GPT-4, GPT-4o, o1 (Các mô hình mạnh nhất về lập luận và code).
- **Anthropic:** Claude 3 (Opus, Sonnet, Haiku), Claude 3.5 Sonnet (Nổi tiếng với văn phong tự nhiên, coding xuất sắc và context window lớn).
- **Google:** Gemini 1.5 Pro / Flash (Hỗ trợ đa phương thức - Multimodal từ trong lõi, xử lý cả text, ảnh, âm thanh, video cùng lúc).

### Mô hình Mở (Open-weights / Open-source)
- **Meta:** Llama 3 (Mô hình nguồn mở phổ biến nhất, với các phiên bản 8B, 70B, 400B tham số).
- **Mistral AI:** Mistral, Mixtral (MoE - Mixture of Experts), cực kỳ tối ưu về mặt hiệu năng.
- **Alibaba:** Qwen 2 (Mô hình nguồn mở xử lý tiếng Việt và các ngôn ngữ châu Á cực tốt).

---

## 7. Ứng Dụng Trong Data Engineering & Phân Tích Dữ Liệu

Trong lĩnh vực Dữ liệu, LLM không chỉ để chat mà đang dần trở thành công cụ không thể thiếu (AI-assisted Data Engineering):
* **Text-to-SQL:** Dịch các câu hỏi ngôn ngữ tự nhiên của người dùng doanh nghiệp (VD: "Cho tôi doanh thu tháng trước phân theo khu vực") thành câu lệnh SQL phức tạp chạy trên Data Warehouse.
* **Automated Documentation:** Tự động sinh tài liệu (docstrings) cho mã nguồn Python, dbt models, hoặc tự động giải thích các luồng ETL/ELT.
* **Data Cleansing & Transformation:** Sử dụng LLM để chuẩn hóa dữ liệu văn bản phi cấu trúc (ví dụ: trích xuất Tên, Địa chỉ, Email từ các file log hoặc review của khách hàng thành bảng dữ liệu có cấu trúc).
* **Data Copilots:** Tích hợp trực tiếp vào các công cụ như dbt, Snowflake, Databricks để gợi ý code, fix bugs và tối ưu hóa query.

---

## Tổng Kết

LLM thực chất là biểu hiện rõ nét nhất của việc nén một phần kiến thức của nhân loại vào những ma trận số học khổng lồ, thông qua sức mạnh tính toán và dữ liệu. Mặc dù vẫn còn những hạn chế như chi phí vận hành cao, ảo giác (hallucination) hay rủi ro bảo mật, không thể phủ nhận LLM đang định hình lại cách chúng ta tương tác với máy tính và mở ra một chương mới cho sự phát triển của công nghệ.

---
## Tài Liệu Tham Khảo

* [Attention Is All You Need - Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762)
* [State of AI Report](https://www.stateof.ai/)
* [Hugging Face Course on NLP](https://huggingface.co/learn/nlp-course/chapter1/1)
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
