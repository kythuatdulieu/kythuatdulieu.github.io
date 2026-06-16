---
title: "Độ phủ - Recall trong Máy học"
difficulty: "Beginner"
tags: ["recall", "precision", "f1-score", "metrics", "classification", "retrieval"]
readingTime: "8 mins"
lastUpdated: 2026-06-16
seoTitle: "Độ phủ (Recall) là gì? Tầm quan trọng trong Machine Learning & RAG"
metaDescription: "Tìm hiểu chi tiết về Recall (Độ phủ) trong Machine Learning và Information Retrieval. Công thức, Trade-off với Precision và ứng dụng thực tế trong RAG."
description: "Khi đánh giá hiệu năng của một mô hình học máy (Machine Learning) hay một hệ thống tìm kiếm thông tin, chúng ta thường nghe nhắc đến thuật ngữ **Recall**..."
---



Recall (Độ phủ), hay còn được gọi là Sensitivity (Độ nhạy) hoặc True Positive Rate (Tỷ lệ True Positive), là một chỉ số quan trọng trong Machine Learning (đặc biệt là bài toán phân loại - classification) và Information Retrieval (truy xuất thông tin). Nó trả lời cho câu hỏi: "Trong số **tất cả** các mẫu/tài liệu thực sự thuộc lớp Positive (hoặc thực sự liên quan), mô hình/hệ thống đã tìm ra và dự đoán đúng được bao nhiêu phần trăm?".

Cùng với Precision (Độ chính xác), Recall giúp chúng ta có cái nhìn toàn diện hơn về hiệu suất của một mô hình, đặc biệt là khi làm việc với các tập dữ liệu mất cân bằng (imbalanced datasets) hoặc các hệ thống tìm kiếm như RAG (Retrieval-Augmented Generation).

## 1. Công thức tính Recall trong bài toán Phân loại (Classification)



Trong bài toán phân loại nhị phân (binary classification), kết quả dự đoán của mô hình thường được đánh giá dựa trên một **Confusion Matrix** (Ma trận nhầm lẫn), bao gồm 4 thành phần:

*   **True Positive (TP):** Mô hình dự đoán là Positive và thực tế là Positive (Dự đoán ĐÚNG).
*   **True Negative (TN):** Mô hình dự đoán là Negative và thực tế là Negative (Dự đoán ĐÚNG).
*   **False Positive (FP):** Mô hình dự đoán là Positive nhưng thực tế là Negative (Dự đoán SAI - Lỗi loại I).
*   **False Negative (FN):** Mô hình dự đoán là Negative nhưng thực tế là Positive (Dự đoán SAI - Lỗi loại II).

Công thức tính Recall như sau:

$$
\text{Recall} = \frac{TP}{TP + FN}
$$

**Diễn giải:** Recall là tỷ lệ giữa số lượng mẫu Positive được dự đoán đúng ($TP$) trên tổng số lượng mẫu Positive thực tế (bao gồm cả những mẫu dự đoán đúng $TP$ và những mẫu bị bỏ sót $FN$).

**Ví dụ thực tế:** Hãy tưởng tượng bạn đang xây dựng một mô hình phát hiện bệnh ung thư.
*   $TP$: Số bệnh nhân thực sự bị ung thư và mô hình chẩn đoán là CÓ.
*   $FN$: Số bệnh nhân thực sự bị ung thư nhưng mô hình chẩn đoán là KHÔNG (bỏ sót bệnh).
*   **Recall** trong trường hợp này đo lường: Trong tất cả các bệnh nhân bị ung thư, mô hình phát hiện ra được bao nhiêu %?

Nếu Recall thấp, có nghĩa là mô hình bỏ sót rất nhiều bệnh nhân bị bệnh ($FN$ cao), điều này cực kỳ nguy hiểm trong y tế!

## 2. Recall trong Truy xuất thông tin (Information Retrieval & RAG)

Trong ngữ cảnh của các hệ thống tìm kiếm (Search Engines), hệ thống gợi ý (Recommender Systems) hay RAG, khái niệm Recall hơi khác một chút nhưng bản chất vẫn giữ nguyên.

*   **Tài liệu liên quan (Relevant Documents):** Những tài liệu thực sự chứa thông tin giải quyết truy vấn của người dùng.
*   **Tài liệu được truy xuất (Retrieved Documents):** Những tài liệu mà hệ thống tìm kiếm trả về.

Công thức tính Recall trong trường hợp này:

$$
\text{Recall} = \frac{\text{Số tài liệu liên quan được truy xuất}}{\text{Tổng số tài liệu liên quan có trong cơ sở dữ liệu}}
$$

**Ví dụ trong RAG:** Cơ sở dữ liệu (Vector DB) của bạn có tổng cộng 20 tài liệu nói về "chính sách nghỉ phép". Khi người dùng hỏi "Quy định nghỉ phép năm như thế nào?", hệ thống tìm kiếm trả về 5 tài liệu, nhưng trong đó chỉ có 3 tài liệu thực sự nói về nghỉ phép (2 tài liệu kia không liên quan - nhiễu). Đồng thời, hệ thống đã bỏ sót 17 tài liệu về nghỉ phép còn nằm trong DB.

*   **Recall** = $3 / 20 = 15\%$

Một hệ thống RAG có Recall thấp nghĩa là nó không tìm đủ thông tin (ngữ cảnh) cần thiết để LLM có thể trả lời đầy đủ và chính xác, dễ dẫn đến hiện tượng Hallucination (ảo giác) do thiếu thông tin đầu vào.

## 3. Sự đánh đổi (Trade-off) giữa Recall và Precision

Trong thế giới lý tưởng, chúng ta muốn mô hình có cả Precision (Độ chính xác) và Recall (Độ phủ) đều đạt 100%. Tuy nhiên, trong thực tế, việc tăng chỉ số này thường dẫn đến việc giảm chỉ số kia.

*   **Precision (Độ chính xác):** Trả lời câu hỏi "Trong số tất cả những dự đoán là Positive, có bao nhiêu % thực sự đúng?".
    $$ \text{Precision} = \frac{TP}{TP + FP} $$
*   **Nếu muốn tăng Recall:** Bạn có thể làm cho mô hình dự đoán "Positive" dễ dàng hơn (giảm ngưỡng - threshold). Mô hình sẽ bắt được nhiều trường hợp Positive hơn (TP tăng, FN giảm), Recall sẽ tăng. NHƯNG, việc dễ dãi dự đoán "Positive" sẽ kéo theo việc dự đoán sai nhiều trường hợp Negative thành Positive (FP tăng), làm cho **Precision giảm**.
*   **Nếu muốn tăng Precision:** Bạn có thể làm cho mô hình khó tính hơn, chỉ dự đoán "Positive" khi cực kỳ chắc chắn. Khi đó FP sẽ giảm (Precision tăng). NHƯNG, sự khó tính đó sẽ làm mô hình bỏ sót nhiều trường hợp Positive thực sự (FN tăng), làm cho **Recall giảm**.

Để cân bằng giữa Precision và Recall, người ta thường dùng chỉ số **F1-Score**, là trung bình điều hòa của cả hai:

$$
F1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}
$$

## 4. Khi nào nên ưu tiên Recall? Khi nào nên ưu tiên Precision?

Tùy vào bài toán cụ thể, bạn sẽ quyết định việc ưu tiên chỉ số nào:

### Ưu tiên Recall (Chấp nhận False Positive cao để không bỏ sót)
*   **Y tế / Y khoa:** Phát hiện bệnh hiểm nghèo (ung thư, COVID-19). Thà chẩn đoán nhầm người khỏe mạnh thành bệnh nhân (False Positive - người này sau đó có thể làm các xét nghiệm chuyên sâu hơn để xác định lại), còn hơn là bỏ sót bệnh nhân mắc bệnh (False Negative - hậu quả chết người).
*   **Phát hiện gian lận (Fraud Detection) / Hệ thống bảo mật:** Thà khóa nhầm một giao dịch hợp lệ hoặc chặn nhầm một email (sau đó người dùng có thể xác thực lại), còn hơn là để lọt một giao dịch lừa đảo hoặc mã độc.
*   **Recall-oriented Search:** Trong việc tìm kiếm tài liệu pháp lý cho một vụ kiện, luật sư muốn xem TẤT CẢ các tài liệu có thể liên quan (Recall cao), chấp nhận phải đọc qua một vài tài liệu không liên quan (Precision thấp).

### Ưu tiên Precision (Chấp nhận False Negative cao để đảm bảo độ chính xác)
*   **Hệ thống gợi ý (Recommender Systems):** Chẳng hạn như gợi ý video trên YouTube hoặc sản phẩm trên Shopee. Nếu gợi ý sai (False Positive), người dùng sẽ cảm thấy phiền phức và trải nghiệm kém đi. Thà gợi ý ít nhưng chắc chắn đúng sở thích của họ, còn hơn là đưa ra hàng loạt gợi ý tào lao.
*   **Xếp hạng kết quả tìm kiếm (Top-K Search):** Người dùng Google thường chỉ xem trang đầu tiên (top 10 kết quả). Do đó, những kết quả đầu tiên này phải CỰC KỲ chính xác và liên quan (Precision@K cao), nếu có bỏ sót một số kết quả ở trang 10 thì cũng không sao.

## 5. Cải thiện Recall trong RAG

Trong các hệ thống GenAI và RAG, nếu Recall của bước Retrieval (tìm kiếm ngữ cảnh) quá thấp, LLM sẽ không có đủ dữ liệu để trả lời đúng. Để tăng Recall, ta có thể áp dụng các kỹ thuật sau:
1.  **Tăng `top_k`:** Truy xuất nhiều tài liệu hơn (ví dụ tăng từ 5 lên 10, 20 kết quả). Tuy nhiên điều này sẽ làm tăng chi phí token và có thể vượt quá Context Window của LLM.
2.  **Hybrid Search:** Kết hợp tìm kiếm theo vector (Semantic Search) và tìm kiếm từ khóa (BM25 / Keyword Search) để bù trừ khuyết điểm của nhau.
3.  **Query Expansion:** Mở rộng câu truy vấn gốc bằng các từ đồng nghĩa hoặc định dạng lại câu hỏi để hệ thống bắt được nhiều ngữ cảnh hơn.
4.  **Metadata Filtering:** Gắn thẻ metadata vào chunk dữ liệu để thu hẹp phạm vi tìm kiếm, giúp kết quả tìm được chính xác hơn với bài toán.

## Tài Liệu Tham Khảo
* [Precision and recall - Wikipedia](https://en.wikipedia.org/wiki/Precision_and_recall)
* [Evaluating Machine Learning Models - Google ML Crash Course](https://developers.google.com/machine-learning/crash-course/classification/precision-and-recall)
* [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)](https://arxiv.org/abs/2005.11401)
* [Information Retrieval - Christopher D. Manning](https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-unranked-retrieval-sets-1.html)
