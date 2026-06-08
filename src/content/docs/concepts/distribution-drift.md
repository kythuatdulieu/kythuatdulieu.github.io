---
title: "Trôi dạt phân phối - Distribution Drift (Data Drift)"
category: "Observability & Reliability"
difficulty: "Advanced"
tags: ["data-drift", "distribution-drift", "data-observability", "machine-learning", "monitoring"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Data Drift / Distribution Drift là gì? Cách giám sát phân phối dữ liệu"
metaDescription: "Distribution Drift (Data Drift) là sự thay đổi phân phối giá trị thống kê của dữ liệu theo thời gian. Tìm hiểu tác động và cách cấu hình Data Observability để xử lý."
---

# Trôi dạt phân phối - Distribution Drift (Data Drift)

## Summary

Trôi dạt phân phối (Distribution Drift hay Data Drift) là sự thay đổi đáng kể về các đặc trưng thống kê cơ bản (như giá trị trung bình, độ lệch chuẩn, phân phối chuẩn) của dữ liệu đầu vào theo thời gian. Khác với sự thay đổi về cấu trúc kỹ thuật (Schema Drift), Distribution Drift là sự thay đổi về **ngữ nghĩa và nội dung** bên trong dữ liệu. Đây là kẻ thù nguy hiểm nhất của các mô hình Machine Learning đang chạy trên Production (MLOps) và là một trụ cột cốt lõi của Data Observability.

---

## Definition

**Distribution Drift (Data Drift)** mô tả hiện tượng các giá trị thực tế của một cột dữ liệu bị thay đổi hình dáng phân phối (Distribution shape) một cách âm thầm và khác biệt so với baseline lịch sử hoặc khác với tập dữ liệu từng dùng để huấn luyện mô hình.

Ví dụ thống kê:
* Một cột `user_age` (tuổi) trước đây có phân phối chuẩn (chuông) tập trung ở dải `[25-35]`, nay đột nhiên lệch phải (skewed) và tập trung nhiều ở dải `[45-55]`.
* Tỷ lệ phần trăm giá trị NULL (NULL rate) của cột `phone_number` bất ngờ tăng từ 5% lên 60%.

Cấu trúc cột (Schema) vẫn không đổi (vẫn là kiểu INT), khối lượng dữ liệu (Volume) vẫn bình thường. Nhưng **chất lượng thống kê** của dữ liệu đã bị lệch.

---

## Why it exists

Distribution Drift xảy ra do hai nguyên nhân chính:
1. **Thay đổi trong Thế giới thực (Concept/Environment Drift)**: Sở thích của khách hàng thay đổi, xu hướng thị trường dịch chuyển, hoặc đại dịch (như Covid-19) xuất hiện làm hành vi mua sắm trực tuyến thay đổi hoàn toàn so với trước đây.
2. **Lỗi quy trình hoặc Hệ thống (Systematic Errors)**: Backend đổi logic lấy dữ liệu (ví dụ trước đây lưu giá tiền là USD, nay ngầm định lưu là VND khiến các giá trị tăng vọt gấp 25.000 lần); Hoặc một thiết bị IoT (cảm biến nhiệt độ) bị hỏng, liên tục trả về giá trị `0` thay vì `25` độ.

Hệ quả: Các Dashboard BI sẽ hiển thị các chỉ số vô nghĩa, và trầm trọng hơn, các mô hình Machine Learning (như Churn Prediction, Fraud Detection) sẽ dự đoán sai hoàn toàn (Model Decay/Degradation) vì chúng đang áp dụng những bài học cũ lên một thế giới đã thay đổi.

---

## Core idea

Cốt lõi của việc xử lý Data Drift nằm ở **Kiểm định Thống kê (Statistical Testing)**.

Không thể dùng các rule tĩnh (Ví dụ: `age > 0 AND age < 100`) để bắt Data Drift, vì tuổi 25 hay 55 đều hợp lệ, nhưng sự *chuyển dịch đám đông* từ 25 sang 55 mới là vấn đề.

Để phát hiện, hệ thống Data Observability phải:
1. **Profiling (Tính toán đặc trưng)**: Liên tục lấy mẫu (sample) hoặc tính toán các chỉ số thống kê (Mean, Median, Standard Deviation, Min, Max, % Null) cho từng batch dữ liệu hàng ngày.
2. **Statistical Distance (Đo khoảng cách thống kê)**: Dùng các thuật toán kiểm định (như Kolmogorov-Smirnov (K-S) test, Population Stability Index (PSI), hoặc Wasserstein distance) để so sánh hai phân phối: Phân phối tham chiếu (Reference) và Phân phối hiện tại (Current). Nếu khoảng cách vượt ngưỡng -> Cảnh báo Drift.

---

## How it works

Cách thức triển khai một hệ thống giám sát Distribution Drift (MLOps/DataOps):

1. **Khởi tạo Reference Dataset (Tập tham chiếu)**: Với MLOps, đây là tập dữ liệu ban đầu dùng để train model. Với DataOps, đây là lượng dữ liệu trung bình của 30 ngày gần nhất (Baseline).
2. **Định kỳ quét (Periodic Profiling)**: Hàng ngày, công cụ Observability (ví dụ Great Expectations, Monte Carlo, Evidently AI) sẽ chạy các câu lệnh SQL/Spark để tổng hợp dữ liệu ngày hôm qua (Current Dataset).
3. **Tính toán Metric**: Tính toán chỉ số PSI (Population Stability Index) cho các cột dạng phân loại (Categorical: Nam/Nữ/Khác) và kiểm định K-S cho các cột liên tục (Continuous: Lương, Tuổi).
4. **Phân tích kết quả**:
   * Nếu `PSI < 0.1`: Không có thay đổi đáng kể (No drift).
   * Nếu `0.1 <= PSI < 0.2`: Cảnh báo nhẹ, cần chú ý theo dõi.
   * Nếu `PSI >= 0.2`: Thay đổi lớn (Significant drift). Hệ thống bắn cảnh báo màu đỏ (Red Alert) cho đội ngũ Data Scientist để kiểm tra hoặc train lại model (Retraining).

---

## Architecture / Flow

```mermaid
graph TD
    subgraph Data Pipeline
        DB[(Production DWH)]
    end

    subgraph Drift Monitoring Engine (Evidently / Monte Carlo)
        Ref[Reference Data Profile \n Baseline (Past 30d)]
        Cur[Current Data Profile \n Today]
        
        Ref --> Test{Statistical Tests \n PSI, K-S Test}
        Cur --> Test
    end

    subgraph Actions
        Alert[Slack Alert: Distribution Drift]
        MLOps[Trigger ML Pipeline to Retrain Model]
    end

    DB -- "Daily Extract/Sample" --> Cur
    Test -- "Distance > Threshold" --> Alert
    Alert --> MLOps
```

---

## Practical example

**Bối cảnh:** Bảng `customer_loans` chứa thông tin cho vay. Cột `credit_score` (điểm tín dụng) có giá trị từ 300 - 850. Mô hình duyệt vay tự động được dựa trên cột này.

*Tháng 1 (Reference)*: Trung bình `credit_score` của khách hàng là `650`, độ lệch chuẩn là `50`. Mô hình hoạt động hoàn hảo.
*Tháng 4 (Current)*: Ngân hàng chạy một chiến dịch Marketing mới nhắm vào sinh viên đại học. Do đó, điểm `credit_score` trung bình đột ngột giảm xuống còn `550`.

**Hệ thống giám sát (bằng code Python/Evidently):**
Hệ thống giám sát chạy vào cuối ngày, so sánh phân phối của Tháng 4 với Tháng 1. Thuật toán phát hiện sự trượt phân phối về phía trái (Left skew drift).

```python
import pandas as pd
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset

# 1. Tải dữ liệu tham chiếu (Tháng 1) và dữ liệu hiện tại (Tháng 4)
reference_data = pd.read_parquet("data/january_baseline.parquet")
current_data = pd.read_parquet("data/april_current.parquet")

# 2. Khởi tạo báo cáo Drift bằng thư viện Evidently
drift_report = Report(metrics=[DataDriftPreset()])
drift_report.run(reference_data=reference_data, current_data=current_data)

# 3. Trích xuất kết quả dưới dạng JSON (để bắn Alert)
results = drift_report.as_dict()

# Nếu phát hiện trượt dữ liệu lớn trên các cột quan trọng
if results["metrics"][0]["result"]["dataset_drift"]:
    print("CẢNH BÁO: Phát hiện Distribution Drift! Cần kiểm tra lại dữ liệu và mô hình.")
```

**Hậu quả nếu không bắt được:** Mô hình AI cũ sẽ từ chối 95% khách hàng sinh viên này vì nghĩ họ rủi ro cao (do chỉ quen với điểm >650), làm chiến dịch Marketing thất bại thảm hại.

**Hành động (Resolution):** Hệ thống bắn cảnh báo Drift. Data Scientist vào phân tích, xác nhận đây là thay đổi "thực tế", do đó kích hoạt Retrain lại model với dữ liệu của tháng 4 để mô hình học hành vi mới.

---

## Best practices

* **Đừng giám sát mọi thứ**: Việc tính toán đặc trưng phân phối (Profiling) tốn tài nguyên toán học rất lớn. Hãy chỉ kích hoạt tính năng Distribution Monitor cho các Cột Tính Năng (Feature columns) quan trọng được dùng trong Model ML, hoặc các KPI quan trọng (như Doanh thu).
* **Kết hợp Time-windows hợp lý**: Chọn cửa sổ thời gian (window) đủ lớn để không bị nhạy cảm quá mức. So sánh dữ liệu "hôm nay với hôm qua" thường rất nhiễu. Tốt hơn là so sánh "Tuần này với Tuần trước" hoặc "Tháng này với Tháng trước".
* **Phân biệt Data Drift và Concept Drift**:
  * *Data Drift*: Biến số đầu vào (X) thay đổi phân phối (Ví dụ: khách hàng trẻ tuổi nhiều hơn).
  * *Concept Drift*: Mối quan hệ giữa (X) và biến mục tiêu dự đoán (Y) thay đổi (Ví dụ: trước Covid, khách trẻ hay mua giày thể thao; trong Covid, khách trẻ chuyển sang mua máy chơi game).

---

## Common mistakes

* **Sử dụng MIN/MAX để phát hiện Drift**: Chỉ theo dõi giá trị cao nhất và thấp nhất là sai lầm, vì một Outlier (giá trị ngoại lai) duy nhất có thể làm thay đổi MAX, nhưng không thay đổi bản chất phân phối của 99.9% dữ liệu còn lại. Phải dùng phân phối hoặc các phân vị (Percentiles: P25, P50, P75).
* **Báo động giả (False Positive) liên tục**: Cấu hình thuật toán kiểm định thống kê với P-value quá khắt khe, dẫn đến ngày nào hệ thống cũng báo Drift, tạo ra hội chứng "Chó sói và Cậu bé" khiến team phớt lờ cảnh báo thực sự.

---

## Trade-offs

### Ưu điểm
* Là công cụ bảo hiểm bắt buộc để duy trì độ tin cậy và chính xác cho các hệ thống Machine Learning trên Production.
* Bắt được những lỗi logic (Systematic bugs) cực kỳ tinh vi từ backend (ví dụ lỗi đổi đơn vị tính toán) mà không một luật rule-based nào bắt được.

### Nhược điểm
* Rất khó giải thích cho nhóm Business hiểu (họ hiểu `NULL > 0` là lỗi, nhưng họ khó hiểu tại sao `PSI = 0.25` lại là lỗi).
* Khối lượng tính toán khổng lồ (Heavy computation). Tính toán Percentiles và kiểm định trên Data Warehouse quy mô lớn tiêu tốn cực nhiều Compute resource.

---

## When to use

* Bắt buộc trong MLOps: Khi bạn có các mô hình Machine Learning dự đoán tự động (Recommendation, Pricing, Scoring) ảnh hưởng trực tiếp tới khách hàng.
* Các bảng Fact quan trọng trong tài chính, ngân hàng (chỉ số rủi ro, dòng tiền).

## When not to use

* Với các bảng dữ liệu tĩnh, bảng chiều (Dimension) ít thay đổi, hoặc các cột chỉ chứa ID định danh (Surrogate keys).
* Môi trường DWH quy mô nhỏ, chủ yếu phục vụ các báo cáo BI tĩnh (Static reporting) không có hệ thống Machine Learning.

---

## Related concepts

* [Trôi dạt cấu trúc - Schema Drift](/concepts/schema-drift)
* [Khả năng quan sát dữ liệu - Data Observability](/concepts/data-observability)
* [Data Quality](/concepts/data-quality)

---

## Interview questions

### 1. Phân biệt Schema Drift và Data Drift?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết khái quát về Data Reliability.
* **Gợi ý trả lời**: Schema Drift là lỗi kỹ thuật về cấu trúc (VD: cột bị đổi từ INT sang VARCHAR, cột bị xóa) làm Crash pipeline (Hard failure). Data Drift (Distribution Drift) là sự thay đổi nội dung, ý nghĩa thống kê của dữ liệu bên trong cấu trúc đó (VD: giá trị trung bình từ 10 tăng lên 1000). Pipeline vẫn chạy qua bình thường (Silent failure), nhưng làm hỏng kết quả của Dashboard và Model Machine Learning.

### 2. Một cột dữ liệu `order_amount` bị báo là có Distribution Drift lớn. Bạn sẽ tiếp cận vấn đề này như thế nào để tìm Root Cause?
* **Người phỏng vấn muốn kiểm tra**: Tư duy phân tích sự cố (Incident Response).
* **Gợi ý trả lời**:
  1. Kiểm tra Data Lineage để xem dữ liệu đến từ nguồn nào.
  2. Phân tích phân phối (Plot distribution/Histogram): Xem dữ liệu bị trượt sang bên phải (tăng đột biến) hay bị xuất hiện nhiều giá trị 0.
  3. Đặt câu hỏi nghiệp vụ: Có chương trình khuyến mãi nào đang chạy (Giảm giá 100%)? (Thay đổi thế giới thực).
  4. Đặt câu hỏi kỹ thuật: Có ai cập nhật App đổi loại tiền tệ từ USD sang Cents không? (Lỗi hệ thống).
  5. Nếu do nghiệp vụ (Thế giới thực), ta cập nhật Baseline và/hoặc retrain model. Nếu do lỗi, ta yêu cầu Backend sửa và chạy lại backfill dữ liệu.

---

## References

1. **Evidently AI Documentation** - What is Data Drift?
2. **Machine Learning Engineering in Action** - Ben Wilson. (Chương về Monitoring Models).
3. **A Primer on Population Stability Index (PSI)** - Cách đo lường sự khác biệt phân phối cho ML.

---

## English summary

Distribution Drift (or Data Drift) is a Data Observability pillar referring to significant changes in the statistical properties (e.g., mean, variance, data shape) of a dataset over time, while the structural schema remains intact. It is a critical concern in MLOps, as models trained on historical data rapidly degrade (Model Decay) when the live data distribution drifts due to real-world behavioral changes or systematic backend bugs. Unlike static quality rules, drift detection requires profiling and statistical distance metrics (like Population Stability Index or Kolmogorov-Smirnov tests) to compare current data against a historical baseline, triggering alerts or automated model retraining when thresholds are exceeded.
