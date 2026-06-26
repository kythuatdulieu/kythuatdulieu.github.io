---
title: "Normalized Discounted Cumulative Gain - NDCG"
difficulty: "Advanced"
tags: ["ndcg", "metrics", "search-engine", "reranking", "information-retrieval", "machine-learning"]
readingTime: "10 mins"
lastUpdated: 2026-06-16
seoTitle: "Chỉ số NDCG là gì? Đánh giá mô hình Search và Reranking"
metaDescription: "Tìm hiểu chi tiết Normalized Discounted Cumulative Gain (NDCG). Metric cốt lõi để đánh giá hiệu năng xếp hạng (ranking) trong hệ thống Tìm kiếm, RecSys và RAG."
description: "Khi xây dựng một công cụ tìm kiếm (Search Engine), hệ thống gợi ý (Recommender System) hay bước tái xếp hạng (Reranking), NDCG là chỉ số không thể thiếu để đo lường chất lượng xếp hạng dựa trên độ liên quan."
---

NDCG (Normalized Discounted Cumulative Gain) là một chỉ số cực kỳ quan trọng dùng để đánh giá các thuật toán Xếp hạng (Ranking) và các hệ thống như Search Engine, Recommender Systems hay Hệ thống Hỏi đáp (RAG). Nó không chỉ quan tâm đến việc "Có trả về tài liệu đúng hay không" mà còn đặc biệt chú trọng việc "Tài liệu đúng nhất (độ liên quan cao nhất) có nằm ở vị trí đầu tiên (top 1) hay không".

---

## 1. Vấn đề mà NDCG giải quyết

Trong các hệ thống Information Retrieval truyền thống, chúng ta thường dùng các độ đo như Precision, Recall, hay F1-Score. Tuy nhiên, các metric này gặp phải hai điểm nghẽn chính khi áp dụng cho bài toán Ranking:
1. **Chỉ dùng nhị phân (Binary Relevance):** Tài liệu chỉ có thể là "Có liên quan" hoặc "Không liên quan". Trong thực tế, độ liên quan thường là một thang điểm liên tục (ví dụ: từ 0 đến 3, trong đó 3 là cực kỳ liên quan, 0 là không liên quan).
2. **Không xét thứ hạng (Order-agnostic):** Nếu một tài liệu cực kỳ liên quan nằm ở vị trí thứ 10, Precision@10 sẽ đánh giá nó tương đương với việc tài liệu đó nằm ở vị trí thứ 1. Điều này không đúng với kỳ vọng của người dùng khi họ hầu như chỉ nhìn vào các kết quả đầu tiên.

NDCG ra đời để giải quyết triệt để hai vấn đề này.

---

## 2. Phân tích từng thành phần: CG, DCG và NDCG

Để hiểu NDCG, chúng ta cần đi qua từng khái niệm tạo nên nó. Giả sử hệ thống trả về danh sách $p$ kết quả cho một truy vấn. Mỗi kết quả có một mức độ liên quan (relevance score) $rel_i$, trong đó $i$ là vị trí xếp hạng.

### 2.1. Cumulative Gain (CG)

**Cumulative Gain** là tổng các độ liên quan của $p$ kết quả trả về. Nó chỉ đơn giản là cộng dồn điểm liên quan mà không quan tâm đến thứ tự.

$$CG_p = \sum_{i=1}^{p} rel_i$$

**Nhược điểm:** Nếu hệ thống A trả về tài liệu tốt ở vị trí top 1, và hệ thống B trả về tài liệu tốt ở vị trí top 10, thì $CG_{10}$ của cả hai hệ thống là bằng nhau.

### 2.2. Discounted Cumulative Gain (DCG)

Để phạt (penalize) những tài liệu có độ liên quan cao nhưng lại xuất hiện ở vị trí thấp, chúng ta áp dụng một hàm phạt (discount function) dựa trên vị trí (logarithm của vị trí xếp hạng). Tài liệu càng nằm sâu bên dưới thì "đóng góp" của nó vào tổng điểm càng bị giảm đi (discounted).

Công thức DCG thường dùng nhất (do Burges et al. đề xuất và áp dụng mạnh mẽ tại Microsoft):

$$DCG_p = \sum_{i=1}^{p} \frac{2^{rel_i} - 1}{\log_2(i + 1)}$$

- **Tử số ($2^{rel_i} - 1$):** Đề cao mạnh mẽ các tài liệu có độ liên quan cao (vì dùng hàm mũ).
- **Mẫu số ($\log_2(i + 1)$):** Phạt các tài liệu nằm ở vị trí thấp. $\log$ được dùng thay vì tuyến tính để phản ánh đúng thực tế hành vi người dùng: Sự khác biệt giữa top 1 và top 2 quan trọng hơn rất nhiều so với top 11 và top 12.

### 2.3. Normalized Discounted Cumulative Gain (NDCG)

Giá trị DCG phụ thuộc vào truy vấn (query). Có truy vấn dễ, hệ thống tìm được nhiều tài liệu cực kỳ liên quan (DCG sẽ rất lớn). Có truy vấn khó, chỉ có vài tài liệu hơi liên quan (DCG sẽ nhỏ). Do đó, chúng ta không thể dùng DCG để so sánh hay tính trung bình qua nhiều truy vấn khác nhau.

Để chuẩn hóa, ta chia DCG cho **IDCG (Ideal DCG)**.
IDCG là giá trị DCG tối đa có thể đạt được cho truy vấn đó (tức là khi các tài liệu được sắp xếp giảm dần theo mức độ liên quan thực tế).

$$NDCG_p = \frac{DCG_p}{IDCG_p}$$

Giá trị của $NDCG_p$ luôn nằm trong khoảng $[0, 1]$. Điểm $1.0$ có nghĩa là hệ thống đã trả về danh sách hoàn hảo y hệt như danh sách tối ưu lý tưởng.

---

## 3. Ví dụ Tính Toán Chi Tiết

Giả sử chúng ta có một truy vấn *"cách tính ndcg"* và hệ thống Search trả về 5 tài liệu ($p=5$).
Các chuyên gia đánh giá mức độ liên quan thực tế ($rel_i$) theo thang điểm từ 0 đến 3 (3 là cao nhất) cho 5 tài liệu này theo thứ tự hệ thống trả về lần lượt là: **2, 0, 3, 1, 2**.

**Bước 1: Tính DCG@5**

| Vị trí (i) | Độ liên quan ($rel_i$) | Tử số ($2^{rel_i} - 1$) | Mẫu số ($\log_2(i+1)$) | Gain được discount |
|------------|-----------------------|-------------------------|------------------------|--------------------|
| 1          | 2                     | $2^2 - 1 = 3$           | $\log_2(2) = 1$        | 3.000              |
| 2          | 0                     | $2^0 - 1 = 0$           | $\log_2(3) \approx 1.585$| 0.000              |
| 3          | 3                     | $2^3 - 1 = 7$           | $\log_2(4) = 2$        | 3.500              |
| 4          | 1                     | $2^1 - 1 = 1$           | $\log_2(5) \approx 2.322$| 0.431              |
| 5          | 2                     | $2^2 - 1 = 3$           | $\log_2(6) \approx 2.585$| 1.160              |

Tổng $DCG_5 = 3.000 + 0.000 + 3.500 + 0.431 + 1.160 = \mathbf{8.091}$

**Bước 2: Tính IDCG@5 (Trường hợp lý tưởng)**

Để đạt DCG lớn nhất, thứ tự lý tưởng của các tài liệu phải được sắp xếp giảm dần theo điểm liên quan: **3, 2, 2, 1, 0**.

| Vị trí (i) | Độ liên quan ($rel_i$) lý tưởng | Gain được discount lý tưởng |
|------------|---------------------------------|-----------------------------|
| 1          | 3                               | $(2^3-1)/\log_2(2) = 7.000$ |
| 2          | 2                               | $(2^2-1)/\log_2(3) \approx 1.893$|
| 3          | 2                               | $(2^2-1)/\log_2(4) = 1.500$ |
| 4          | 1                               | $(2^1-1)/\log_2(5) \approx 0.431$|
| 5          | 0                               | $(2^0-1)/\log_2(6) = 0.000$ |

Tổng $IDCG_5 = 7.000 + 1.893 + 1.500 + 0.431 + 0.000 = \mathbf{10.824}$

**Bước 3: Tính NDCG@5**

$$NDCG_5 = \frac{8.091}{10.824} \approx \mathbf{0.748}$$

Kết quả $0.748$ (hay $74.8\%$) cho thấy thuật toán Ranking hiện tại còn dư địa cải thiện, chủ yếu vì tài liệu siêu liên quan (3 điểm) bị tụt xuống vị trí số 3, trong khi tài liệu rác (0 điểm) lại chễm chệ ở vị trí số 2.

---

## 4. Các Trường Hợp Cần Lưu Ý (Edge Cases)

* **IDCG bằng 0:** Xảy ra khi toàn bộ tài liệu trong tập dữ liệu (hoặc kết quả trả về) đều có độ liên quan bằng 0 ($rel_i = 0, \forall i$). Khi đó phép chia cho 0 sẽ gây lỗi `ZeroDivisionError`. Cách xử lý chuẩn là quy ước $NDCG = 0.0$ trong trường hợp này.
* **Tài liệu thiếu nhãn (Unjudged Documents):** Trong thực tế, không thể đánh nhãn thủ công cho toàn bộ kho tài liệu hàng triệu bản ghi. Các tài liệu chưa có nhãn thường được giả định mặc định là không liên quan ($rel = 0$). Điều này có thể khiến $NDCG$ đánh giá sai lệch các thuật toán có khả năng khám phá tài liệu tốt mà chưa ai từng chấm điểm.
* **$k$ lớn hơn số lượng tài liệu có sẵn:** Khi tính NDCG@k nhưng tập dữ liệu chỉ có $n$ kết quả ($n < k$), thuật toán thường sẽ đệm thêm (padding) các vị trí còn lại bằng tài liệu có điểm liên quan bằng 0 để đảm bảo công bằng khi so sánh.

---

## 5. Triển Khai Code (Python)

Bạn có thể tự cài đặt NDCG hoặc sử dụng các thư viện Machine Learning phổ biến như `scikit-learn`.

### 5.1. Sử dụng Scikit-Learn

```python
from sklearn.metrics import ndcg_score
import numpy as np

# y_true chứa mức độ liên quan thực tế của danh sách kết quả
# Phải reshape thành mảng 2D (n_samples, n_labels)
y_true = np.asarray([[2, 0, 3, 1, 2]])

# y_score chứa điểm số do model dự đoán (được dùng để sắp xếp kết quả)
# Ở đây ta giả sử mô hình dự đoán ra điểm số giảm dần để giữ nguyên thứ tự hiện tại của y_true
y_score = np.asarray([[5.0, 4.0, 3.0, 2.0, 1.0]])

# Tính NDCG@5
ndcg_at_5 = ndcg_score(y_true, y_score, k=5)
print(f"NDCG@5: {ndcg_at_5:.4f}") 
# Kết quả có thể khác đôi chút do công thức mặc định của scikit-learn sử dụng log base 2 và tử số (rel_i) nguyên bản hoặc 2^(rel_i)-1.
```

### 5.2. Tự cài đặt từ đầu (From Scratch)

```python
import numpy as np

def dcg_at_k(r, k):
    """Tính toán DCG@k cho list điểm liên quan r."""
    r = np.asfarray(r)[:k]
    if r.size:
        return np.sum((np.power(2, r) - 1) / np.log2(np.arange(2, r.size + 2)))
    return 0.

def ndcg_at_k(r, k):
    """Tính toán NDCG@k cho list điểm liên quan r."""
    dcg_max = dcg_at_k(sorted(r, reverse=True), k) # IDCG
    if not dcg_max:
        return 0.
    return dcg_at_k(r, k) / dcg_max

# Ví dụ như bài toán trên
relevance_scores = [2, 0, 3, 1, 2]
print(f"NDCG@5: {ndcg_at_k(relevance_scores, 5):.4f}")
# Output: NDCG@5: 0.7475
```

---

## 6. Ưu Điểm và Nhược Điểm của NDCG

| Khía Cạnh | NDCG |
|-----------|------|
| **Ưu điểm** | - Đánh giá cao thứ hạng của các kết quả hàng đầu (phù hợp với thực tế người dùng).<br>- Hỗ trợ các nhãn độ liên quan đa bậc (multi-level relevance) thay vì chỉ nhị phân (0-1).<br>- Chuẩn hóa được qua các truy vấn khác nhau, dễ dàng tính trung bình để đánh giá toàn hệ thống. |
| **Nhược điểm**| - Không phạt các tài liệu xấu (bad documents). Tài liệu rác chỉ đơn giản là có gain = 0, chứ không làm giảm chỉ số DCG tổng.<br>- Tính toán phức tạp hơn Precision/Recall.<br>- Gặp khó khăn khi có nhiều unjudged documents trong pool kết quả. |

---

## 7. Tài Liệu Tham Khảo Mở Rộng

* [Manning, Raghavan, Schütze - Introduction to Information Retrieval (Chapter 8: Evaluation in IR)](https://nlp.stanford.edu/IR-book/pdf/08eval.pdf)
* [Burges et al. - Learning to Rank using Gradient Descent (ICML 2005)](https://icml.cc/2015/wp-content/uploads/2015/06/icml_ranking.pdf)
* [Scikit-learn documentation for ndcg_score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.ndcg_score.html)
