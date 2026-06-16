---
title: "Token - Đơn vị từ vựng trong LLM và NLP"
difficulty: "Beginner"
tags: ["token", "tokenization", "llm", "nlp", "preprocessing", "ai"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Token là gì? Đơn vị từ vựng trong LLM và NLP"
metaDescription: "Tìm hiểu Token là gì trong ngữ cảnh AI/LLM, cách tính token, thuật toán BPE (Byte-Pair Encoding), ảnh hưởng đến chi phí API và sự khác biệt về token ở các ngôn ngữ."
description: "Khi bắt đầu lập trình hoặc sử dụng các Mô hình Ngôn ngữ Lớn (LLM) như GPT-4 hay Claude, bạn sẽ liên tục bắt gặp từ khóa **Token**. Nhà cung cấp API tính phí theo token, giới hạn ngữ cảnh cũng được đo bằng token. Vậy chính xác token là gì?"
---



Khi bắt đầu làm quen với lĩnh vực Trí tuệ Nhân tạo (AI), Xử lý Ngôn ngữ Tự nhiên (NLP), hay sử dụng API của các Mô hình Ngôn ngữ Lớn (LLM) như GPT-4, Claude, Llama, bạn sẽ liên tục bắt gặp thuật ngữ **Token**. Nhà cung cấp API tính phí dựa trên số token, giới hạn đầu vào (context window) cũng được đo lường bằng số token. 

Vậy chính xác **Token** là gì, tại sao nó lại quan trọng, và cơ chế đằng sau quá trình **Tokenization** (mã hóa chuỗi từ vựng) hoạt động như thế nào?

---

## 1. Token là gì?



**Token** có thể được hiểu là "mảnh ghép" hoặc **đơn vị xử lý cơ bản nhất** của văn bản mà một mô hình ngôn ngữ (LLM) có thể đọc, hiểu và xử lý. 

Đối với con người, chúng ta đọc hiểu văn bản theo từng từ (word) hoặc câu (sentence). Nhưng máy tính chỉ hiểu các con số. Để một mô hình AI hiểu được ngôn ngữ của con người, văn bản đầu vào cần phải được cắt nhỏ ra thành các phần nhỏ hơn gọi là token, sau đó mỗi token sẽ được ánh xạ tới một con số (ID) trong một cuốn từ điển khổng lồ của mô hình (vocabulary).

Một Token không nhất thiết phải là một từ nguyên vẹn. Nó có thể là:
- **Một từ hoàn chỉnh:** ví dụ `apple`, `hello`
- **Một phần của từ (âm tiết):** ví dụ từ `Hamburger` có thể bị chia thành `Ham`, `bur`, `ger`
- **Một ký tự đơn lẻ:** ví dụ `a`, `b`, `c`
- **Một dấu câu hoặc khoảng trắng:** ví dụ `,`, `.`, ` `

### Nguyên tắc chung (Rule of Thumb) của OpenAI

Trong tiếng Anh, OpenAI đưa ra một ước lượng cơ bản để người dùng dễ hình dung:
- **1 Token** ≈ 4 ký tự tiếng Anh.
- **100 Tokens** ≈ 75 từ.

Tuy nhiên, quy tắc này không đúng đối với các ngôn ngữ khác như tiếng Việt, tiếng Nhật, tiếng Hàn hay ngôn ngữ lập trình.

---

## 2. Tại sao AI không xử lý theo từng ký tự hoặc từng từ trọn vẹn?

Có ba cách phân chia văn bản chính trong NLP: Word-level (theo từng từ), Character-level (theo từng ký tự), và Subword-level (theo một phần của từ). Hầu hết các LLM hiện đại đều sử dụng Subword-level tokenization. Tại sao lại như vậy?

### 2.1. Phân chia theo từng từ (Word-level Tokenization)
- **Ưu điểm:** Ý nghĩa của mỗi token rất rõ ràng (vì nó là một từ).
- **Nhược điểm:**
  - **Từ vựng quá lớn (Out of Vocabulary - OOV):** Một ngôn ngữ có hàng trăm ngàn, thậm chí hàng triệu từ (tính cả từ lóng, tên riêng, thuật ngữ). Mô hình sẽ cần một bộ từ điển khổng lồ, làm tăng chi phí tính toán và bộ nhớ.
  - **Không xử lý được từ mới:** Nếu gặp một từ chưa từng thấy trong từ điển huấn luyện (ví dụ: `ChatbotGPT`), mô hình sẽ báo lỗi "Unknown" (`<UNK>`).

### 2.2. Phân chia theo ký tự (Character-level Tokenization)
- **Ưu điểm:** Bộ từ điển cực kỳ nhỏ (chỉ vài trăm ký tự ASCII/Unicode). Không bao giờ gặp lỗi từ mới (OOV).
- **Nhược điểm:**
  - **Mất đi ý nghĩa ngữ nghĩa:** Một ký tự đơn lẻ như `h` hay `o` không mang ý nghĩa gì so với từ `house`. Mô hình phải vất vả học cách ghép các chữ cái lại với nhau trước khi hiểu được ngữ nghĩa.
  - **Độ dài chuỗi quá lớn:** Một câu 10 từ có thể biến thành 50-60 tokens, khiến chuỗi đầu vào trở nên quá dài. Điều này làm cạn kiệt *Context Window* và làm tăng chi phí tính toán cấp số nhân trong kiến trúc Transformer.

### 2.3. Phân chia theo Subword (Subword-level Tokenization) - Tiêu chuẩn hiện tại
Đây là sự kết hợp hoàn hảo giữa cả hai:
- Các từ phổ biến (như `hello`, `world`) sẽ được giữ nguyên làm 1 token.
- Các từ hiếm, từ ghép hoặc từ mượn sẽ được chia nhỏ thành các âm tiết (subwords) có nghĩa. Ví dụ: từ `unbelievable` có thể được tách thành `un`, `believ`, `able`.
- Nhờ đó, từ điển không quá lớn (thường chỉ khoảng 30,000 - 100,000 tokens), không còn lỗi OOV, nhưng vẫn giữ được chuỗi đầu vào ở độ dài hợp lý.

---

## 3. Các thuật toán Tokenization phổ biến

Để cắt văn bản thành các subwords một cách hiệu quả, các nhà nghiên cứu đã phát triển nhiều thuật toán Tokenization khác nhau. Một số thuật toán phổ biến nhất bao gồm:

### 3.1. Byte-Pair Encoding (BPE)
BPE là thuật toán tokenization được sử dụng phổ biến nhất hiện nay, đằng sau sự thành công của họ mô hình GPT của OpenAI (GPT-3, GPT-4, Tiktoken), LLaMA, RoBERTa.
- **Cơ chế hoạt động:** BPE bắt đầu bằng việc tách toàn bộ văn bản thành các ký tự đơn lẻ (hoặc byte). Sau đó, nó liên tục tìm kiếm và gộp các cặp ký tự/token xuất hiện cạnh nhau nhiều nhất thành một token mới. Quá trình gộp này dừng lại khi đạt được kích thước từ điển mong muốn (ví dụ: 50,000 tokens).
- **Lợi ích:** BPE rất linh hoạt, đặc biệt hiệu quả trong việc biểu diễn các từ xa lạ thành các token phổ biến hơn. Thuật toán `tiktoken` của OpenAI là một biến thể tối ưu hóa cao độ của BPE.

### 3.2. WordPiece
Được sử dụng bởi Google cho các mô hình như BERT, DistilBERT.
- **Cơ chế:** Tương tự như BPE, nhưng thay vì chỉ gộp dựa trên tần suất xuất hiện (frequency), WordPiece tính toán khả năng tối đa hóa xác suất (likelihood) của dữ liệu huấn luyện khi gộp hai token lại với nhau. Các subword (không đứng đầu từ) thường được đánh dấu bằng tiền tố `##` (ví dụ: `play` và `##ing`).

### 3.3. SentencePiece
Phổ biến trong các mô hình như T5, ALBERT, và nhiều mô hình đa ngôn ngữ (multilingual).
- **Cơ chế:** Thay vì dựa vào khoảng trắng để tách từ ban đầu (như BPE, vì một số ngôn ngữ như tiếng Trung, tiếng Nhật không sử dụng khoảng trắng), SentencePiece xem toàn bộ câu văn (kể cả khoảng trắng) là một luồng ký tự thô liên tục. Khoảng trắng được thay thế bằng ký tự đặc biệt `_` và sau đó nó áp dụng BPE hoặc Unigram model.

---

## 4. Tokenization với tiếng Việt và Đa ngôn ngữ (Multilingual)

Một vấn đề lớn khi sử dụng các mô hình LLM quốc tế là tính **bất bình đẳng về giá và hiệu năng** giữa các ngôn ngữ.

Các mô hình như GPT-4 được huấn luyện chủ yếu trên dữ liệu tiếng Anh, do đó từ điển token của BPE tối ưu rất tốt cho tiếng Anh. Một từ tiếng Anh thường là 1 token.
Nhưng với tiếng Việt, do từ điển BPE chưa được tối ưu đủ tốt, văn bản thường bị "băm" nát thành các token rất nhỏ (thậm chí tới mức ký tự hoặc byte). 

**Ví dụ thực tế:**
- Câu tiếng Anh: `I am reading a book about artificial intelligence.` (48 ký tự) 
  => Chỉ tốn **9 tokens**.
- Câu tiếng Việt: `Tôi đang đọc một cuốn sách về trí tuệ nhân tạo.` (49 ký tự)
  => Có thể tốn tới **15-25 tokens** (tùy thuộc vào bộ tokenizer).
  
**Hậu quả:**
1. **Chi phí đắt đỏ hơn:** Nếu gọi API tính phí theo token, người dùng tiếng Việt sẽ phải trả nhiều tiền hơn 2-3 lần cho cùng một lượng thông tin.
2. **Context Window hẹp hơn:** Nếu mô hình giới hạn 4096 tokens, bạn có thể đưa vào ~3000 từ tiếng Anh, nhưng chỉ đưa được ~1500 từ tiếng Việt.
3. **Hiệu năng có thể giảm:** Việc bị chia nhỏ thành quá nhiều token rời rạc có thể khiến mô hình khó nắm bắt ngữ nghĩa cục bộ của các từ ghép tiếng Việt (ví dụ: `trí`, `tuệ`, `nhân`, `tạo`).

Để giải quyết vấn đề này, các mô hình ngôn ngữ dành riêng cho người Việt (như PhoBERT, VinaLLaMA, hay SeaLLM) thường tự huấn luyện lại bộ Tokenizer (ví dụ mở rộng kích thước từ điển vocabulary) nhằm ghép đúng các từ tiếng Việt thành 1 token, giúp tối ưu chi phí và chất lượng.

---

## 5. Token ảnh hưởng đến chi phí và Context Window như thế nào?

### Chi phí (Pricing)
Các nhà cung cấp API (OpenAI, Anthropic, Google) tính phí dựa trên hai loại token:
- **Input Tokens (Prompt tokens):** Số lượng token bạn gửi lên cho LLM. Quá trình xử lý đầu vào diễn ra song song (parallel) nên thường rẻ hơn.
- **Output Tokens (Completion tokens):** Số lượng token LLM sinh ra để trả lời. LLM sinh ra văn bản theo cơ chế tự hồi quy (autoregressive - sinh từng token một), tốn nhiều tài nguyên hơn, nên giá thường đắt hơn Input Tokens từ 2 đến 3 lần.

### Context Window (Cửa sổ ngữ cảnh)
Mọi mô hình LLM đều có giới hạn bộ nhớ ngắn hạn, gọi là *Context Window*, được tính bằng số lượng token (ví dụ: GPT-3.5 có giới hạn 4K/16K tokens, GPT-4 là 8K/32K/128K tokens, Claude 3 Opus hỗ trợ lên tới 200K tokens).
- Nếu tổng số Prompt Tokens + Output Tokens vượt quá Context Window, mô hình sẽ bị "quên" phần mở đầu của đoạn hội thoại, hoặc thậm chí trả về lỗi (Context Length Exceeded).

---

## 6. Công cụ hỗ trợ tính toán Token

Để biết chính xác đoạn văn bản của bạn tiêu tốn bao nhiêu token trước khi gửi API, bạn có thể sử dụng các công cụ đếm token trực tuyến:

1. **[OpenAI Tokenizer](https://platform.openai.com/tokenizer):** Công cụ chính thức của OpenAI để đếm token theo chuẩn GPT-3 / GPT-4. Cực kỳ trực quan, hiển thị đoạn văn của bạn được cắt nhỏ thành các block màu sắc khác nhau.
2. **Thư viện Tiktoken (Python):** Nếu bạn muốn viết code tự động đếm token trong hệ thống của mình, OpenAI cung cấp thư viện mã nguồn mở `tiktoken` rất nhanh và chính xác.

```python
import tiktoken

# Sử dụng chuẩn encoding của GPT-4
enc = tiktoken.encoding_for_model("gpt-4")
text = "Hello, world! Xin chào thế giới."
tokens = enc.encode(text)

print(f"Số lượng tokens: {len(tokens)}")
print(f"ID của các tokens: {tokens}")
```

## Tổng kết

Hiểu rõ **Token** là một kỹ năng bắt buộc với bất kỳ lập trình viên nào muốn làm việc hiệu quả với các LLM. Nó không chỉ giúp bạn tối ưu hóa chi phí API, quản lý độ dài bộ nhớ hội thoại, mà còn cho bạn cái nhìn sâu sắc hơn về cách mà trí tuệ nhân tạo đang "đọc" và "hiểu" ngôn ngữ của loài người.

---
## Tài Liệu Tham Khảo Mở Rộng
* **OpenAI API Documentation - What are tokens?**
* [HuggingFace NLP Course - Tokenizers](https://huggingface.co/learn/nlp-course/chapter2/4?fw=pt)
* [Byte-Pair Encoding (BPE) in NLP - Papers With Code](https://paperswithcode.com/method/bpe)
* [Tiktoken by OpenAI (GitHub)](https://github.com/openai/tiktoken)
