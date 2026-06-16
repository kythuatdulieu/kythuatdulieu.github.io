---
title: "Nucleus Sampling - Top-p"
difficulty: "Intermediate"
tags: ["llm", "decoding", "generation", "top-p", "nucleus-sampling"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Top-p (Nucleus Sampling) là gì? - Tinh chỉnh thông số LLM"
metaDescription: "Tìm hiểu chi tiết về Nucleus Sampling (Top-p) trong quá trình sinh văn bản của LLM, cách hoạt động và sự khác biệt giữa Top-p và Temperature."
description: "Hãy tưởng tượng bạn đang chơi trò chơi nối chữ với một nhà thông thái. Tại mỗi lượt đi, thay vì lôi toàn bộ cuốn từ điển tiếng Việt ra để chọn từ tiếp theo (có thể dẫn đến những từ vô nghĩa), hay chỉ khăng khăng dùng một từ phổ biến nhất (gây nhàm chán), nhà thông thái chỉ tập trung vào một nhóm các từ hợp lý nhất. Top-p chính là phương pháp giúp Mô hình Ngôn ngữ Lớn (LLM) làm điều tương tự."
---



## 1. Top-p (Nucleus Sampling) là gì?



**Top-p**, hay còn được giới nghiên cứu gọi là **Nucleus Sampling**, là một chiến lược giải mã (decoding strategy) được sử dụng rộng rãi trong các Mô hình Ngôn ngữ Lớn (Large Language Models - LLMs) như GPT-4, Llama, hay Gemini để quyết định từ (token) nào sẽ được sinh ra tiếp theo.

Thay vì chọn một từ hoàn toàn ngẫu nhiên từ toàn bộ từ vựng, hoặc luôn chọn từ có xác suất cao nhất một cách máy móc, Top-p thiết lập một ngưỡng xác suất tích lũy $p$ (ví dụ: $p = 0.9$). Mô hình sẽ sắp xếp các từ ứng viên theo xác suất giảm dần và chỉ giữ lại một nhóm nhỏ các từ hàng đầu sao cho **tổng xác suất của chúng vừa đạt (hoặc vượt) ngưỡng $p$**. Tập hợp các từ được giữ lại này gọi là "hạt nhân" (nucleus). Cuối cùng, LLM sẽ chọn ngẫu nhiên một từ nằm trong cái hạt nhân đó, bỏ qua toàn bộ phần "đuôi" gồm những từ có xác suất quá thấp hoặc kỳ quặc.

## 2. Vì sao chúng ta cần Top-p? (Vấn đề của các phương pháp cũ)

Để hiểu giá trị của Top-p, chúng ta cần xem xét các phương pháp lấy mẫu (sampling) truyền thống và điểm yếu của chúng trong việc sinh văn bản tự nhiên (open-ended text generation):

### 2.1. Greedy Decoding (Giải mã tham lam)
Mô hình **luôn luôn** chọn từ có xác suất cao nhất tại mỗi bước.
*   **Ưu điểm:** Nhanh, logic và đáng tin cậy cho các tác vụ phân tích, toán học.
*   **Nhược điểm:** Văn bản sinh ra bị lặp từ nghiêm trọng, thiếu tính tự nhiên và vô cùng nhàm chán. Con người không bao giờ nói chuyện theo kiểu luôn dùng những từ dễ đoán nhất.

### 2.2. Pure Random Sampling (Lấy mẫu ngẫu nhiên thuần túy)
Mô hình quay một vòng quay may mắn trên **toàn bộ** từ điển dựa theo phân phối xác suất.
*   **Ưu điểm:** Đa dạng và sáng tạo.
*   **Nhược điểm:** Mô hình rất dễ "trượt chân" chọn trúng một từ ở "đuôi dài" (long tail) của phân phối — tức là một từ hoàn toàn lạc quẻ, vô nghĩa. Chỉ cần chọn sai một từ, toàn bộ ngữ cảnh của câu phía sau sẽ bị phá hỏng (hiện tượng này gọi là *text degeneration*).

### 2.3. Top-k Sampling (Cắt bỏ cố định $k$ từ)
Chỉ cho phép mô hình chọn ngẫu nhiên trong $k$ từ có xác suất cao nhất (ví dụ: $k = 50$).
*   **Vấn đề:** Nếu $k$ được cố định là 50:
    *   **Trường hợp 1 (Phân phối phẳng):** Có rất nhiều từ khả thi (ví dụ: "Hôm nay tôi ăn [cơm/phở/bún/miến/cháo/...]"). Việc cố định $k=50$ có thể cắt đi từ thứ 51, 52 dù chúng vẫn rất hợp lý.
    *   **Trường hợp 2 (Phân phối dốc):** Chỉ có 1 hoặc 2 từ là hợp lý (ví dụ: "Việt Nam là một [quốc/nước]"). Từ thứ 3 trở đi tới từ thứ 50 hoàn toàn là những từ vô nghĩa. Việc giữ lại cả 50 từ sẽ đưa những từ rác vào tập hợp lấy mẫu, tăng nguy cơ sinh ra câu vô nghĩa.

**Đây chính là lúc Top-p (Nucleus Sampling) tỏa sáng!** Top-p giải quyết triệt để điểm yếu của Top-k bằng cách **co giãn linh hoạt (dynamic) số lượng từ ứng viên** tùy thuộc vào độ chắc chắn của mô hình.

---

## 3. Top-p hoạt động như thế nào? (Từng bước chi tiết)

Thuật toán Top-p hoạt động tại mỗi bước sinh từ (token) theo trình tự sau:

1.  **Dự đoán xác suất:** Mô hình ngôn ngữ (LLM) đưa ra phân phối xác suất cho tất cả các từ trong từ điển (thông thường khoảng 30,000 đến 100,000 từ).
2.  **Sắp xếp:** Sắp xếp tất cả các từ theo thứ tự xác suất giảm dần.
3.  **Cộng dồn (Cumulative Probability):** Tính tổng xác suất lũy kế từ trên xuống dưới.
4.  **Cắt bỏ (Truncation):** Dừng lại ngay khi tổng xác suất lũy kế vừa đạt hoặc vượt qua giá trị $p$ mà bạn cài đặt.
5.  **Chuẩn hóa:** Tập hợp các từ được giữ lại (nucleus) sẽ được chuẩn hóa lại xác suất sao cho tổng của chúng bằng 100%.
6.  **Lấy mẫu:** Chọn ngẫu nhiên một từ từ tập hợp hạt nhân đó.

### 🌟 Ví dụ minh họa thực tế

Giả sử câu đang viết dở là: *"Buổi sáng, tôi thường uống một tách..."* và bạn đang set **$p = 0.9$**.

Mô hình dự đoán các từ tiếp theo với xác suất như sau (đã sắp xếp giảm dần):

| Hạng | Từ (Token) | Xác suất (%) | Tổng xác suất lũy kế (%) | Hành động của Top-p ($p=0.9$) |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `cà phê` | 65% | 65% | ✅ Giữ lại (65 < 90) |
| 2 | `trà` | 20% | 85% | ✅ Giữ lại (85 < 90) |
| 3 | `sữa` | 7% | **92%** | ✅ Giữ lại (92 > 90, vượt ngưỡng -> Dừng) |
| 4 | `nước` | 4% | 96% | ❌ Loại bỏ |
| 5 | `nhựa` | 0.01%| 96.01% | ❌ Loại bỏ |
| ... | ... | ... | ... | ❌ Loại bỏ |

**Kết quả:**
*   Mô hình sẽ **chỉ được phép** chọn ngẫu nhiên giữa 3 từ: `cà phê`, `trà`, và `sữa`.
*   Từ thứ 4 (`nước`) và thứ 5 (`nhựa`) bị loại bỏ hoàn toàn. Dù `nhựa` ("uống một tách nhựa") là cực kỳ vô lý, nhưng nếu dùng Random Sampling, đôi khi mô hình vẫn xui xẻo chọn trúng. Top-p đã ngăn chặn hoàn toàn rủi ro này bằng cách cắt đứt cái "đuôi" rác.
*   **Số lượng từ ứng viên ($k$) ở ví dụ này tự động điều chỉnh thành 3.** Nếu ở một ngữ cảnh khác, phân phối phẳng hơn, để đạt được 90% có thể mô hình phải gom tới 50 từ. Đây chính là tính "co giãn linh hoạt" của Top-p.

---

## 4. Top-p (Nucleus Sampling) khác gì với Temperature?

Nếu bạn đã từng dùng API của OpenAI (ChatGPT) hay Anthropic (Claude), bạn sẽ thấy luôn có 2 thông số đi liền với nhau: `temperature` và `top_p`. Chúng đều ảnh hưởng đến tính "ngẫu nhiên" hoặc "sáng tạo", nhưng theo hai cách hoàn toàn khác nhau.

*   **Temperature (Thay đổi hình dáng phân phối):** Hoạt động bằng cách bóp méo xác suất *trước khi* quá trình loại bỏ diễn ra.
    *   Temperature > 1.0: San phẳng phân phối (tăng xác suất của từ hiếm, giảm xác suất từ phổ biến).
    *   Temperature < 1.0: Làm sắc nét phân phối (tăng cường sự thống trị của từ phổ biến).
*   **Top-p (Cắt bỏ phân phối):** Không thay đổi xác suất gốc của các từ, mà hoạt động như một cái "kéo cắt", cắt bỏ hoàn toàn phần đuôi của phân phối để đảm bảo an toàn.

**Nói một cách hình tượng:**
*   **Temperature** giống như việc điều chỉnh nhiệt độ trong phòng: làm mọi thứ nóng lên (hỗn loạn hơn) hoặc lạnh đi (đóng băng/chắc chắn hơn).
*   **Top-p** giống như một người bảo vệ đứng ở cửa tiệm: chỉ cho phép nhóm khách hàng VIP (nhóm chiếm tỷ trọng $p$ quan trọng nhất) bước vào vòng quay may mắn, và đuổi những vị khách lang thang (từ vựng kỳ quặc) đi.

> **💡 Best Practice (Lưu ý quan trọng):**
> Các nhà nghiên cứu và kỹ sư AI khuyên rằng **chỉ nên tinh chỉnh MỘT TRONG HAI thông số này** tại một thời điểm, trong khi giữ nguyên thông số còn lại ở mức mặc định (thường `temperature = 1.0` hoặc `top_p = 1.0`). Việc chỉnh sửa đồng thời cả hai có thể dẫn đến các kết quả rất khó dự đoán và kiểm soát.

---

## 5. Hướng dẫn tinh chỉnh Top-p theo từng Use Case

Tùy vào mục tiêu tác vụ mà bạn đang yêu cầu LLM thực hiện, việc cài đặt Top-p nên được điều chỉnh để đạt hiệu quả cao nhất:

| Giá trị Top-p | Độ sáng tạo | Nhóm Tác vụ (Use Cases) phù hợp nhất | Giải thích |
| :--- | :--- | :--- | :--- |
| **0.0 - 0.1** | Rất thấp (Logic) | Viết Code, Trích xuất JSON, Dịch thuật kỹ thuật, QA dựa trên tài liệu (RAG). | Thu hẹp cực độ, mô hình gần như chỉ chọn từ tốt nhất. Đảm bảo tính chính xác, tính logic, tránh việc mô hình "ảo giác" (hallucination) thêm thắt rườm rà. |
| **0.3 - 0.5** | Trung bình thấp | Viết email công việc, tóm tắt bài báo, giải thích khái niệm. | Cho phép một chút linh hoạt về mặt ngôn từ nhưng vẫn bám sát ý tưởng cốt lõi, tránh dùng từ ngữ quá hoa mỹ hoặc đi xa khỏi chủ đề. |
| **0.7 - 0.9** | Trung bình cao | Viết blog, sáng tạo nội dung marketing, đối thoại chatbot (Persona), brainstorming. | Sự cân bằng tuyệt vời. Mô hình có thể dùng các cấu trúc câu đa dạng, từ vựng phong phú, nhưng Top-p vẫn sẽ cắt đi những từ rác rưởi phá hoại câu văn. |
| **0.95 - 1.0** | Rất cao (Sáng tạo) | Viết thơ, sáng tác tiểu thuyết viễn tưởng, tạo ý tưởng điên rồ. | Mô hình được tự do lựa chọn hầu như toàn bộ phổ từ vựng. Văn bản sinh ra rất độc đáo và ít khi bị lặp lại, nhưng rủi ro đi chệch hướng hoặc sinh từ khó hiểu sẽ cao hơn. |

## 6. Tổng kết

**Nucleus Sampling (Top-p)** là một bước tiến quan trọng trong lĩnh vực Xử lý Ngôn ngữ Tự nhiên (NLP). Nó khắc phục được sự cứng nhắc của Top-k bằng cách tạo ra một "bộ lọc linh hoạt" dựa trên độ chắc chắn của mô hình tại từng khoảnh khắc sinh từ. Bằng cách hiểu rõ cách Top-p hoạt động và cách kết hợp nó với các thông số khác, bạn sẽ làm chủ được "ngòi bút" của các LLM mạnh mẽ nhất, khiến chúng vừa có thể bay bổng sáng tạo, vừa có thể tuân thủ logic sắt đá khi cần.

---

## Tài Liệu Tham Khảo Thực Tế Về Top-p

*(Lưu ý: Các tài liệu tham khảo về kiến trúc hệ thống phân tán ở bản nháp cũ đã được thay thế bằng các tài liệu chính xác về NLP & LLM)*

*   [The Curious Case of Neural Text Degeneration - Holtzman et al. (2019)](https://arxiv.org/abs/1904.09751) - *Paper gốc và kinh điển nhất giới thiệu khái niệm Nucleus Sampling (Top-p).*
*   [How to generate text: using different decoding methods for language generation with Transformers - Hugging Face Blog](https://huggingface.co/blog/how-to-generate) - *Giải thích trực quan và dễ hiểu về các chiến lược decoding.*
*   [OpenAI API Documentation - Parameter Details](https://platform.openai.com/docs/api-reference/chat/create#chat/create-top_p) - *Cách OpenAI khuyên dùng Temperature và Top-p trong thực tiễn.*
*   [Attention Is All You Need - Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762) - *Nền tảng của các mô hình Transformer hiện đại.*
