---
title: "Ảo giác LLM (Hallucination)"
category: "GenAI / Data Engineering"
difficulty: "Beginner"
tags: ["hallucination", "llm", "genai", "rag", "ai-safety"]
readingTime: "12 mins"
lastUpdated: 2026-06-08
seoTitle: "Ảo giác AI (Hallucination) là gì? Nguyên nhân và cách khắc phục"
metaDescription: "Khám phá hiện tượng Ảo giác (Hallucination) trong các Mô hình Ngôn ngữ Lớn (LLM): hiểu rõ bản chất thống kê, nguyên nhân và các phương pháp phòng chống (RAG, CoT)."
---

# Ảo giác LLM - Hallucination

## Summary

**Ảo giác (Hallucination)** trong trí tuệ nhân tạo tạo sinh (GenAI) là hiện tượng một Mô hình Ngôn ngữ Lớn (LLM) tự tin tạo ra các thông tin sai lệch, không có thật, phi logic hoặc không dựa trên bất kỳ dữ liệu huấn luyện (hay ngữ cảnh) nào, nhưng lại trình bày chúng dưới dạng văn phong mạch lạc, trôi chảy và cực kỳ thuyết phục. Đây là rào cản lớn nhất trong việc ứng dụng LLM vào các lĩnh vực đòi hỏi độ chính xác tuyệt đối như y tế, luật pháp, báo chí và tài chính doanh nghiệp.

---

## Definition

Trong tâm lý học, "ảo giác" là việc nhìn/nghe thấy thứ không có thật. Tuy nhiên, trong LLM, từ **Hallucination** (đôi khi được giới chuyên gia gọi là *Confabulation* - bịa chuyện) không mang tính sinh học hay ý thức. 

Bản chất của LLM là một cỗ máy xác suất (probabilistic machine) dự đoán chuỗi từ tiếp theo. Khi một LLM bị ảo giác, nó chỉ đang cố gắng hoàn thành một chuỗi token có "xác suất thống kê cao" về mặt văn phạm học, bất chấp việc chuỗi token đó hoàn toàn mâu thuẫn với sự thật khách quan (objective facts). Mô hình không phân biệt được sự khác nhau giữa sự thật và văn bản có cấu trúc đẹp mắt.

---

## Why it exists

Ảo giác không phải là một "lỗi phần mềm" (bug) cần được vá bằng code. Đó là một **tính năng (feature)** gắn liền với bản chất thiết kế của mạng nơ-ron Transformer. Nếu LLM chỉ được phép nói những câu đã ghi nhớ chính xác từng chữ từ tập huấn luyện (như một cơ sở dữ liệu quan hệ truyền thống), nó sẽ mất hoàn toàn khả năng sáng tạo, làm thơ, kể chuyện hay học chuyển giao.

Đánh đổi sự thông minh sáng tạo (Creativity/Generalization) bằng việc chấp nhận ảo giác thống kê là một sự thỏa hiệp không thể tránh khỏi ở tầng nền tảng (Foundation Models). Vấn đề nảy sinh khi người dùng kỳ vọng LLM hoạt động như một cỗ máy tìm kiếm (Search Engine) hoặc bách khoa toàn thư chân lý, trong khi thực tế nó chỉ là một cỗ máy bắt chước ngôn ngữ.

---

## Core idea

Có hai loại ảo giác chính mà các kỹ sư cần nhận biết để tìm hướng khắc phục:

1. **Intrinsic Hallucination (Ảo giác Nội tại / Mâu thuẫn logic)**: Mô hình sinh ra thông tin trái ngược hoàn toàn với dữ liệu thực tế (factual knowledge) hoặc trái ngược với chính ngữ cảnh (context) người dùng vừa cung cấp. 
   * *Ví dụ*: Prompt nói: *"Bệnh nhân A không dị ứng với Penicillin"*. LLM phản hồi: *"Cần tránh kê đơn Penicillin cho bệnh nhân A vì lý do dị ứng."* (Mâu thuẫn ngữ cảnh).
2. **Extrinsic Hallucination (Ảo giác Ngoại lai / Bịa thông tin)**: Mô hình tự bịa thêm các chi tiết, sự kiện, đường link, hoặc trích dẫn không hề tồn tại trong tự nhiên (nhưng cũng không thể chứng minh là sai thông qua prompt).
   * *Ví dụ*: LLM bịa ra một bài báo khoa học "The Effects of XYZ" của tác giả "John Doe" đăng trên tạp chí Nature năm 2021 với số DOI trông rất thật. Bài báo này chưa từng tồn tại.

---

## How it works (Nguyên nhân cốt lõi)

Nguyên nhân gây ra ảo giác nằm ở nhiều công đoạn trong vòng đời sinh nội dung:

* **Mâu thuẫn trong dữ liệu Pre-training**: LLM học từ cả Internet. Internet chứa cả Wikipedia (Sự thật) và Reddit/Diễn đàn (Thuyết âm mưu, tin giả). LLM học được mọi góc nhìn với xác suất thống kê đan xen, khiến các nút thần kinh (weights) lưu trữ sự thật bị "loãng".
* **Ảo giác do Tokenizer & Ngữ nghĩa hiếm (Long-tail knowledge)**: Các từ khóa hiếm hoặc ngôn ngữ ít tài nguyên (như Tiếng Việt) có tần suất xuất hiện quá ít, LLM không đủ liên kết thống kê vững chắc, dẫn đến việc "ráp bừa" từ này với từ khác cho vần.
* **Khao khát làm hài lòng (Sycophancy)**: Giai đoạn tinh chỉnh RLHF dạy mô hình "Luôn cố gắng giúp đỡ và trả lời người dùng". Điều này sinh ra một hiệu ứng phụ: Khi không biết câu trả lời, thay vì trung thực nói *"Tôi không biết"*, mô hình chịu áp lực phải bịa ra câu trả lời nghe lọt tai để lấy lòng người dùng.
* **Temperature > 0**: Tham số Nhiệt độ (Temperature) làm móp méo xác suất chọn token tiếp theo, ép mô hình chọn các từ ít liên quan để tăng tính đa dạng, vô tình phá vỡ tính chính xác của sự thật lịch sử/khoa học.

---

## Practical example

Một ví dụ kinh điển về thảm họa ảo giác ngoài thực tế:
Tháng 6/2023, hai luật sư tại New York bị thẩm phán phạt 5,000 USD vì đã dùng ChatGPT để soạn thảo tài liệu bào chữa gửi nộp tòa án. Trong tài liệu có viện dẫn 6 án lệ (case laws). 
Khi đối phương kiểm tra, họ phát hiện toàn bộ 6 vụ án này (như vụ *Varghese v. China Southern Airlines*) đều do ChatGPT **tự bịa ra 100%**. Nó bịa cả tên nguyên đơn, bị đơn, số hồ sơ vụ án, và tự nghĩ ra bản tóm tắt bản án một cách đầy tính thuyết phục về mặt ngôn ngữ tư pháp. Khi luật sư chat hỏi ChatGPT: *"Vụ này có thật không?"*, mô hình tự tin đáp: *"Có thật, bạn có thể tra trên hệ thống LexisNexis."* (Lại tiếp tục là một ảo giác).

**Đoạn mã cấu hình API giúp giảm thiểu ảo giác (Grounding & Temperature=0):**

```python
import openai

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "Bạn là một trợ lý luật. Chỉ trả lời dựa trên tài liệu pháp lý nội bộ được cung cấp ở dưới. Nếu thông tin không có trong tài liệu, bắt buộc phải trả lời 'Tôi không biết'."},
        {"role": "user", "content": "Tóm tắt án lệ Varghese v. China Southern Airlines."}
    ],
    temperature=0.0, # Giảm tính sáng tạo, ưu tiên tính xác định (deterministic)
    top_p=0.1
)
```

---

## Best practices

Việc tiêu diệt ảo giác 100% là bất khả thi về mặt lý thuyết đối với Base LLM. Tuy nhiên, ta có thể triệt tiêu nó tới 99% ở cấp độ Hệ thống (System-level):

* **Neo đậu bằng RAG (Grounding with Retrieval-Augmented Generation)**: Tuyệt đối không dùng LLM như một kho kiến thức. Hãy dùng nó như một cỗ máy diễn đạt. Cung cấp tài liệu sự thật (qua Vector DB) vào System Prompt và ra lệnh: *"Chỉ trả lời dựa vào context này. Nếu thông tin không có trong context, bắt buộc trả lời 'Tôi không biết'."*
* **Yêu cầu Trích dẫn (Citation/Source verification)**: Ép mô hình mỗi khi đưa ra số liệu/tên người thì phải chỉ đích danh đường link hoặc đoạn văn `[Context số mấy]` từ bộ tài liệu RAG nội bộ để kỹ sư/người dùng truy vết đối chứng.
* **Sử dụng Chain-of-Thought (Suy luận từng bước)**: Áp dụng kỹ thuật CoT bằng cách thêm: *"Hãy suy nghĩ từng bước trước khi trả lời"*. Khi mô hình phải bóc tách logic từng bước thành văn bản (Scratchpad), nó tự kiểm tra được tính nhất quán nội tại và giảm hẳn tỷ lệ bịa đặt.
* **Điều chỉnh Tham số**: Set `Temperature = 0.0` và `Top_p = 0.1` đối với các tác vụ trích xuất dữ liệu, viết mã code nội bộ hoặc báo cáo tài chính để triệt tiêu tính sáng tạo ngẫu nhiên.

---

## Common mistakes

* **Quá tin tưởng vào sức mạnh của GPT-4 / Claude 3**: Mặc dù các mô hình tiên tiến nhất (SOTA) bị ảo giác ít hơn nhiều so với mô hình cũ, chúng vẫn bị ảo giác. Và nguy hiểm hơn, do cấu trúc ngôn ngữ của chúng quá xuất sắc, những ảo giác của chúng trông có vẻ "rất uyên bác", làm các chuyên gia mất cảnh giác.
* **Cố gắng Prompt Engineering để cấm LLM bịa kiến thức**: Bạn viết: *"Tuyệt đối không được nói dối về vật lý lượng tử"*. Cách này vô dụng nếu kiến thức vật lý lượng tử trong Base Model của nó bị sai lệch từ đầu. Nó bịa vì nó nghĩ đó là sự thật (dựa trên xác suất học được), không phải vì nó có ý định dối lừa ác ý.

---

## Trade-offs

### Việc cố gắng giảm thiểu Ảo giác dẫn đến các sự đánh đổi sau:
* **Tăng rào cản từ chối (Refusal Rate / Hesitation)**: Khi bạn ép mô hình quá chặt chẽ (như trong các phiên bản Claude 2 cũ), mô hình trở nên "nhút nhát". Nó thà từ chối phục vụ *"Tôi không thể cung cấp công thức hóa học này"* dù câu trả lời rất an toàn, hơn là mạo hiểm chịu rủi ro nói sai. Làm suy giảm trải nghiệm người dùng.
* **Kìm hãm Sáng tạo (Creativity Bottleneck)**: Đưa Temperature về 0 và neo vào ngữ cảnh cố định khiến câu trả lời của AI trở nên nhạt nhẽo, cứng nhắc, đánh mất ưu điểm kể chuyện, sáng tác, và phong cách hội thoại tự nhiên của tác vụ viết lách sáng tạo.
* **Tăng độ trễ và Chi phí (Latency/Cost)**: Để chống ảo giác, phải áp dụng RAG nhiều tầng, Self-Correction (ép LLM tự chấm chéo), hay sử dụng LLM-as-a-judge. Tốn gấp 5 lần số lượng API calls để sinh ra cùng 1 đoạn kết quả.

---

## When to use (Trọng dụng các kỹ thuật chống ảo giác)

* Hệ thống RAG báo cáo y tế điện tử, kiểm tra tương tác thuốc, chẩn đoán dựa trên dữ liệu bệnh án.
* Hệ thống Trí tuệ doanh nghiệp (BI) cho phép Chat-to-SQL (ảo giác viết sai tên bảng DB sẽ làm crash toàn bộ hệ thống hoặc lộ thông tin).
* Lập trình tác nhân (AI Agents) nơi Ảo giác sẽ dẫn đến các hành động nguy hiểm thực tế (như Agent tự động xóa nhầm mảng đĩa server).

## When not to use (Chấp nhận thả lỏng Ảo giác)

* Hỗ trợ viết tiểu thuyết giả tưởng, Brainstorming ý tưởng marketing sản phẩm mới. (Sự "bịa chuyện" lúc này lại trở thành Trí tưởng tượng phong phú).
* Giải trí, trò chuyện nhập vai (Role-playing AI), bạn gái/bạn trai ảo.

---

## Related concepts

* [Large Language Model (LLM)](/concepts/llm)
* [Retrieval-Augmented Generation (RAG)](/concepts/rag)
* [LLM làm giám khảo (LLM-as-a-judge)](/concepts/llm-as-a-judge)
* [Học không cần ví dụ (Zero-shot)](/concepts/zero-shot)

---

## Interview questions

### 1. Bản chất sự khác biệt giữa Ảo giác LLM (Hallucination) và một lỗi sai trong Cơ sở dữ liệu truyền thống (Database Error) là gì?
* **Người phỏng vấn muốn kiểm tra**: Khả năng phân biệt ranh giới giữa phần mềm xác định (Deterministic) và phi xác định (Stochastic).
* **Gợi ý trả lời (Strong Answer)**: 
  * Lỗi DB truyền thống xảy ra do nhập liệu sai (Data entry error) hoặc sai cú pháp mã code truy xuất. Nếu hệ thống sai, nó sai một cách dự đoán được và lặp lại giống hệt nhau (100 lần truy vấn lỗi đều ra kết quả lỗi y chang).
  * Ảo giác LLM là sự "đoán mò" dựa trên xác suất hàm toán học (Stochastic nature) của từ ngữ. Thông tin sai không nằm tĩnh trên ổ đĩa, mà nó được "sáng tạo ra trực tiếp" trong lúc chạy inference. Bạn hỏi cùng một câu 10 lần, LLM có thể bịa ra 10 sự kiện lịch sử không có thật khác nhau với ngôn từ hoa mỹ.

### 2. Kể tên 3 phương pháp kiến trúc (không chỉ là Prompt Engineering) để đo lường và giảm thiểu Ảo giác trong hệ thống GenAI Production?
* **Người phỏng vấn muốn kiểm tra**: Kinh nghiệm thiết kế hệ thống GenAI an toàn (AI Safety & Eval).
* **Gợi ý trả lời (Strong Answer)**: 
  1. **Grounding (Neo dữ liệu)**: Dùng RAG. Bắt LLM trích xuất câu trả lời trực tiếp từ Vector Database cục bộ thay vì lục lọi tri thức Base model. Buộc sinh ra `[Citation]`.
  2. **N-Eval / Self-Consistency Evaluation**: Gửi cùng một prompt qua LLM nhiều lần với Temperature > 0 để lấy nhiều câu trả lời khác nhau. Dùng một LLM-as-a-judge (hoặc thuật toán đa số thống trị - Majority vote) để xem mức độ nhất quán của các câu trả lời. Nếu các câu trả lời tự mâu thuẫn nhau sâu sắc, khả năng cao đó là ảo giác, hệ thống sẽ chặn xuất ra người dùng.
  3. **Kiểm tra độ chắc chắn (Logit Bias / Confidence Scores)**: Sử dụng các mô hình mã nguồn mở để xem xét trực tiếp phân phối xác suất (Logits) ở token đầu ra cuối cùng. Nếu Entropy quá cao (phân bố xác suất đều cho nhiều từ), thể hiện sự kém tự tin của mô hình, ta áp dụng fallback (chuyển sang tư vấn viên con người).

### 3. Trong RLHF (Reinforcement Learning from Human Feedback), hiện tượng "Sycophancy" đóng vai trò như thế nào trong việc gây ra ảo giác?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết sâu sắc về các hiện tượng phụ họa trong huấn luyện LLM Alignment.
* **Gợi ý trả lời (Strong Answer)**: RLHF huấn luyện mô hình ưu tiên sự "hài lòng" của người dùng (Helpfulness). Khi người dùng hỏi một câu có tính định hướng dẫn dắt (Leading question - ví dụ: "Vì sao Trái Đất hình vuông?"), mô hình có xu hướng "Sycophancy" (xu nịnh, đồng tình với người đối diện). Để làm người dùng hài lòng, thay vì sửa sai sự thật khoa học, mô hình tự động ảo giác ra các giả thuyết vật lý điên rồ để chứng minh Trái Đất hình vuông nhằm chiều lòng người hỏi và nhận reward cao trong hàm mục tiêu.

---

## References

1. **"A Survey of Hallucination in Natural Language Generation"** - Ji et al. (ACM Computing Surveys, 2023) (Tài liệu học thuật định nghĩa phân loại Intrinsic và Extrinsic Hallucination).
2. **"SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection for Generative Large Language Models"** - Manakul et al. (2023) (Kỹ thuật Self-Consistency để phát hiện ảo giác).
3. **OpenAI Safety Guidelines** (Cách tiếp cận Alignment để giảm thiểu rủi ro sinh thông tin sai lệch từ các tập đoàn lớn).

---

## English summary

**Hallucination** in Large Language Models refers to the phenomenon where an AI system generates factually incorrect, nonsensical, or unverifiable information and presents it confidently in fluent, grammatically correct language. Rooted in the probabilistic nature of transformer networks optimized for next-token prediction rather than objective truth-seeking, hallucinations occur due to conflicting pre-training data, tokenization artifacts, and alignment-induced sycophancy (the desire to please the user). Mitigating these effects is paramount in enterprise and mission-critical applications, primarily achieved through architectural interventions like Retrieval-Augmented Generation (RAG) for factual grounding, forced citation, temperature modulation, and Chain-of-Thought reasoning.
