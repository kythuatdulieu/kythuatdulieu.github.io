---
title: "Trôi dạt phân phối - Distribution Drift (Data Drift)"
difficulty: "Advanced"
tags: ["data-drift", "distribution-drift", "data-observability", "machine-learning", "monitoring"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Data Drift / Distribution Drift là gì? Cách giám sát phân phối dữ liệu"
metaDescription: "Distribution Drift (Data Drift) là sự thay đổi phân phối giá trị thống kê của dữ liệu theo thời gian. Tìm hiểu tác động, cách đo lường bằng các kiểm định thống kê và thiết lập Data Observability để xử lý triệt để."
description: "Hãy tưởng tượng bạn đang vận hành một đường ống dữ liệu ([data pipeline](/concepts/foundation/data-pipeline/)) rất mượt mà. Schema của các bảng không hề bị thay đổi, khối lượng dữ liệu (data volume) vẫn nằm trong ngưỡng dự đoán. Thế nhưng, độ chính xác của các mô hình Machine Learning (ML) sử dụng dữ liệu này lại bất ngờ lao dốc, hoặc các báo cáo BI bắt đầu đưa ra những con số vô lý. Nguyên nhân sâu xa thường nằm ở một kẻ thù thầm lặng: **Trôi dạt phân phối (Distribution Drift)** hay còn gọi phổ biến là **Data Drift**."
---



Hãy tưởng tượng bạn đang vận hành một đường ống dữ liệu ([data pipeline](/concepts/foundation/data-pipeline/)) rất mượt mà. Schema của các bảng không hề bị thay đổi, khối lượng dữ liệu (data volume) vẫn nằm trong ngưỡng dự đoán. Thế nhưng, độ chính xác của các mô hình Machine Learning (ML) sử dụng dữ liệu này lại bất ngờ lao dốc, hoặc các báo cáo BI bắt đầu đưa ra những con số vô lý. Nguyên nhân sâu xa thường nằm ở một kẻ thù thầm lặng: **Trôi dạt phân phối (Distribution Drift)** hay còn gọi phổ biến là **Data Drift**.

Distribution Drift (Sự trôi dạt phân phối) xảy ra khi hình thù thống kê của dữ liệu thay đổi ngầm theo thời gian. Khác với những lỗi kỹ thuật hiển nhiên như mất kết nối cơ sở dữ liệu hay thiếu cột (schema drift), trôi dạt phân phối không gây ra lỗi "crash" hệ thống. Nó gây ra những "thất bại thầm lặng" (silent failures) nơi dữ liệu vẫn chảy qua đường ống thành công, nhưng tính hợp lệ và giá trị phân tích của nó thì đã không còn.

## 1. Phân loại các dạng Trôi dạt dữ liệu (Drift)



Trong thế giới Data Science và Data Engineering, khi nói về "Data Drift", chúng ta thường nói đến ba hiện tượng chính liên quan chặt chẽ đến nhau:

### 1.1. Data Drift / Covariate Shift (Trôi dạt phân phối dữ liệu đầu vào)
Đây chính là "Distribution Drift" thuần túy nhất. Nó là sự thay đổi trong phân phối xác suất của các biến độc lập (features) $P(X)$.
* **Ví dụ:** Một mô hình đánh giá rủi ro tín dụng được huấn luyện với tệp khách hàng chủ yếu có thu nhập từ 10 - 20 triệu VNĐ. Vài năm sau, do lạm phát và tăng trưởng kinh tế, tệp khách hàng đăng ký vay chủ yếu có mức thu nhập 30 - 50 triệu VNĐ. Dù quy định về cấp vốn tín dụng không đổi, nhưng mô hình cũ có thể sẽ bối rối khi phải dự đoán rủi ro cho một nhóm khách hàng nằm ngoài phạm vi dữ liệu đã được học.

### 1.2. Concept Drift (Trôi dạt khái niệm)
Concept Drift phức tạp hơn Data Drift. Nó xảy ra khi mối quan hệ cơ bản giữa đầu vào (features) và đầu ra (target) thay đổi, tức là phân phối xác suất có điều kiện $P(Y|X)$ bị thay đổi.
* **Ví dụ:** Trước đại dịch COVID-19, việc mua số lượng lớn giấy vệ sinh và khẩu trang trên mạng thường được xem là dấu hiệu của việc mua sỉ hoặc hành vi bất thường (có thể là gian lận). Trong đại dịch, đó là hành vi mua sắm bình thường của các cá nhân. Khái niệm (concept) về "gian lận" đã hoàn toàn thay đổi.

### 1.3. Label Shift / Prior Probability Shift (Trôi dạt nhãn)
Đây là sự thay đổi trong phân phối của biến mục tiêu (target) $P(Y)$, trong khi mối quan hệ $P(X|Y)$ không đổi.
* **Ví dụ:** Do một chiến dịch marketing quá thành công, tỷ lệ phần trăm người dùng nhấp vào quảng cáo (CTR - Click-Through Rate) bỗng tăng vọt từ 2% lên 15%. Sự chênh lệch cực lớn giữa phân phối mục tiêu khi huấn luyện (chỉ có 2% số dương) và phân phối khi dự đoán (15% số dương) có thể làm giảm hiệu quả dự đoán của mô hình học máy.

---

## 2. Nguyên nhân dẫn đến Distribution Drift

Tại sao hình thù của dữ liệu lại thay đổi? Có vô vàn lý do thực tế tác động trực tiếp lên dữ liệu của doanh nghiệp:

* **Thay đổi theo tính chất mùa vụ / thời gian (Seasonality / Temporal Effects):** Thói quen mua sắm thay đổi vào các dịp lễ tết (Black Friday, Tết Nguyên Đán). Các mô hình dự báo không tính đến mùa vụ sẽ bị Drift nghiêm trọng trong những thời điểm này.
* **Thay đổi môi trường kinh doanh và xã hội:** Đại dịch, suy thoái kinh tế, luật pháp hoặc quy định mới (ví dụ GDPR) làm thay đổi mạnh mẽ hành vi người dùng.
* **Thay đổi từ hệ thống thượng nguồn (Upstream system changes):** 
    * Ứng dụng Frontend quyết định chuyển một trường nhập liệu từ "Text Box" (có thể nhập tùy ý) sang "Drop-down Menu" (chỉ được chọn 1 trong 3 giá trị).
    * Một bug trong code theo dõi (tracking code) thay vì ghi lại đơn vị là "Kilogram" thì lại ghi nhầm thành "Gram" (các giá trị tăng đột biến gấp 1000 lần).
* **Chiến lược của đối thủ hoặc chiến dịch nội bộ:** Việc giảm giá sâu một mặt hàng sẽ khiến phân phối của sản phẩm đó trong các giỏ hàng thay đổi đột ngột.

---

## 3. Tác động của Distribution Drift

Sự trôi dạt dữ liệu gây ra những hậu quả vô cùng nguy hiểm nếu không được giám sát:

1. **Suy giảm hiệu năng mô hình (Model Decay / Degradation):** Các mô hình ML (như Recommendation System, Fraud Detection, Churn Prediction) sẽ đưa ra những dự đoán sai lệch, ảnh hưởng đến doanh thu hoặc trải nghiệm người dùng. Tồi tệ nhất là chúng ta **không hề hay biết** cho đến khi khách hàng phàn nàn.
2. **Sai lệch các chỉ số kinh doanh (BI Metrics):** Các báo cáo phân tích, phân khúc khách hàng (RFM) có thể phân loại sai khách hàng tiềm năng.
3. **Lãng phí chi phí xử lý và lưu trữ:** Lỗi đơn vị (ví dụ giá trị nhân 1000 lần) có thể gây tràn số học (integer overflow), phá vỡ logic tính toán của ETL/ELT pipelines ở phía sau.

---

## 4. Cách nhận biết và đo lường Distribution Drift

Để phát hiện Distribution Drift, Data Engineer và Data Scientist phải áp dụng các kiểm định thống kê và các chỉ số đo lường khoảng cách giữa hai tập phân phối (thường là **Tập dữ liệu tham chiếu - Reference / Baseline Dataset** và **Tập dữ liệu hiện tại - Current Dataset**).

### 4.1. Đối với dữ liệu liên tục (Continuous/Numerical Data)
* **Kolmogorov-Smirnov (K-S) Test:** Là một bài kiểm tra phi tham số phổ biến giúp so sánh xem hai mẫu dữ liệu có đến từ cùng một phân phối không. K-S đo khoảng cách tối đa giữa hàm phân phối tích lũy (CDF) của hai mẫu. Nếu $p-value$ nhỏ hơn ngưỡng cho trước (ví dụ 0.05), ta kết luận có Drift.
* **Wasserstein Distance (Earth Mover's Distance):** Đo "chi phí tối thiểu" để biến đổi phân phối này thành phân phối kia. Giá trị càng cao, hai phân phối càng khác biệt. Nó rất nhạy với các điểm cực dị (outliers) hoặc các giá trị lệch lớn.
* **Population Stability Index (PSI):** Rất phổ biến trong ngành tài chính và chấm điểm tín dụng. 
  * PSI < 0.1: Không có sự khác biệt đáng kể.
  * 0.1 <= PSI <= 0.2: Có sự thay đổi nhẹ, cần lưu ý.
  * PSI > 0.2: Thay đổi phân phối nghiêm trọng, cần cập nhật/huấn luyện lại mô hình.

### 4.2. Đối với dữ liệu phân loại (Categorical Data)
* **Chi-Square Test:** So sánh tần suất xuất hiện của các giá trị hạng mục giữa hai mẫu. Phù hợp để kiểm tra xem tỷ lệ phần trăm giữa các danh mục có bị thay đổi lớn không.
* **Jensen-Shannon Divergence (JSD):** Dựa trên Kullback-Leibler (KL) Divergence nhưng mang tính đối xứng. Nó đo mức độ khác biệt thông tin giữa hai phân phối tần suất.

### 4.3. Giám sát các chỉ số thống kê cơ bản
Trong Data Engineering, chúng ta thường không cần chạy kiểm định quá phức tạp với mọi cột. Có thể thiết lập giám sát bằng Data Observability trên các chỉ số như:
* Tỷ lệ giá trị bị Null (Missing rates) tự nhiên tăng mạnh.
* Giá trị Trung bình (Mean), Trung vị (Median).
* Cực đại (Max), Cực tiểu (Min) vượt ngưỡng hợp lý (VD: Tuổi khách hàng > 150).
* Tỷ lệ các giá trị đặc thù, giá trị 0.

---

## 5. Xây dựng chiến lược giám sát (Monitoring) và xử lý

Một hệ thống [Data Observability](/concepts/7-dataops-orchestration-quality/data-observability/) tốt phải tự động phát hiện Distribution Drift và báo cáo.

### Bước 1: Xác định tập dữ liệu Baseline
Mọi sự so sánh đều cần hệ quy chiếu. Data Team cần thống nhất khoảng thời gian dữ liệu ổn định nhất hoặc tập huấn luyện mô hình (Training Dataset) để làm Baseline. Khi dữ liệu sản xuất (Production Data) mới đổ về mỗi ngày/tuần, nó sẽ được mang đi đối chiếu với Baseline này.

### Bước 2: Sử dụng công cụ đo lường tự động
Hiện nay, không cần phải tự code lại các kiểm định thống kê từ đầu. Rất nhiều công cụ mã nguồn mở và nền tảng cung cấp tính năng này một cách chuẩn xác:
* **Great Expectations:** Được tích hợp thẳng vào pipeline dbt hoặc Airflow. Thường dùng cho Data Quality và bắt các lỗi Min/Max/Mean hoặc Validation của Data Engineering.
* **Evidently AI:** Chuyên dụng cho Machine Learning Monitoring. Evidently tự động chạy ra các báo cáo trực quan so sánh phân phối, tính toán Data Drift cho cả Data Profile lẫn Feature Drift.
* **whylogs / Arize AI:** Được sử dụng chuyên sâu làm công cụ ghi log thông tin phân phối dữ liệu với độ nén nhỏ để phân tích xu hướng lâu dài trên ML Pipeline.

### Bước 3: Thiết lập ngưỡng cảnh báo (Alerting Thresholds)
Nếu thiết lập cảnh báo quá nhạy, Data Team sẽ gặp "Alert Fatigue" (Hội chứng kiệt sức vì cảnh báo rác). Nên:
* Bỏ qua các cảnh báo Data Drift với các trường dữ liệu mang tính định danh hoặc ít quan trọng (như Random User ID, IP Address không mang ý nghĩa dự báo).
* Thiết lập cấu hình trượt thời gian (Sliding Window) để Baseline tự động cập nhật nếu đó là thay đổi tự nhiên của mô hình kinh doanh dài hạn.

### Bước 4: Chiến lược khắc phục (Mitigation)
Khi Drift được xác nhận là rủi ro cao:
1. **Retraining (Huấn luyện lại):** Chạy lại đường ống tạo ML Models với tập dữ liệu mới gần đây nhất để nắm bắt hành vi mới.
2. **Rule-Based Fallback:** Tạm thời sử dụng hệ thống luật kinh doanh (Business Rules) dự phòng nếu Mô hình ML đang dự báo quá lỗi mà chưa kịp tạo mô hình mới.
3. **Phân tích với Business / Thượng nguồn:** Báo cáo ngay cho team Product/Software Engineering nếu Drift là do lỗi ứng dụng để có kế hoạch sửa dữ liệu (Backfill Data) ngược lại kho dữ liệu.

---

## 6. Tổng kết

Data Pipelines hiện đại không chỉ đảm bảo dữ liệu "chạy từ A sang B một cách nguyên vẹn" về hình thức. **Distribution Drift** minh chứng rằng dữ liệu là một thực thể sống, phản ánh hoạt động kinh doanh và hành vi con người liên tục thay đổi. Bằng việc áp dụng **Data Observability** với các chỉ số và kiểm định thống kê tiên tiến, Data Engineer cùng với Data Scientist có thể kiểm soát và phản ứng kịp thời trước những biến động "im lặng nhưng nguy hiểm" này, giữ cho hệ thống dữ liệu luôn tạo ra giá trị tin cậy.

## Tài Liệu Tham Khảo
* [DataOps Manifesto](https://dataopsmanifesto.org/)
* **Evidently AI - Data Drift Monitoring**
* [Great Expectations: Data Quality and Profiling](https://greatexpectations.io/)
* **Machine Learning Monitoring: Concept Drift and Data Drift**
* [dbt (data build tool) - Analytics Engineering Workflow](https://www.getdbt.com/product/what-is-dbt/)
