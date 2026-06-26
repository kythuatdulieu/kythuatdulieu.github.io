---
title: "Trôi dạt phân phối - Distribution Drift (Data Drift)"
difficulty: "Advanced"
tags: ["data-drift", "distribution-drift", "data-observability", "machine-learning", "monitoring"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Distribution Drift (Data Drift) là gì? Kiến trúc giám sát"
metaDescription: "Tìm hiểu kiến trúc giám sát Distribution Drift (Data Drift) trong hệ thống Data Engineering, cách tính toán K-S, PSI và tối ưu chi phí (Compute Cost) khi profiling dữ liệu lớn."
description: "Data pipeline không sập, schema không thay đổi, dữ liệu vẫn được ingest đúng giờ. Thế nhưng, doanh thu từ hệ thống Recommendation giảm mạnh. Chào mừng đến với Distribution Drift - cơn ác mộng thầm lặng nhất của mọi kiến trúc sư dữ liệu và kỹ sư ML."
---

Data pipeline không sập, schema không thay đổi, dữ liệu vẫn được ingest đúng giờ. Thế nhưng, doanh thu từ hệ thống Recommendation giảm mạnh, hoặc mô hình Fraud Detection bắt đầu khóa nhầm tài khoản của hàng loạt người dùng hợp lệ. Chào mừng đến với **Distribution Drift** (hay Data Drift) - cơn ác mộng thầm lặng nhất của mọi kỹ sư dữ liệu.

Khác với Schema Drift gây ra lỗi sập luồng (Hard Failures - ví dụ thiếu cột, sai kiểu dữ liệu), Distribution Drift tạo ra **Thất bại thầm lặng (Silent Failures)**. Dữ liệu vẫn hợp lệ về mặt vật lý, nhưng đã thay đổi hoàn toàn về bản chất thống kê. Bài viết này sẽ mổ xẻ kiến trúc để giám sát Drift ở quy mô lớn (Scale) và những Trade-offs về chi phí tính toán (Compute Cost) mà một Staff Data Engineer phải đối mặt.

---

## 1. Bản chất Vật lý của Data Drift

Trong kiến trúc hệ thống, Distribution Drift xảy ra khi **Hàm phân phối xác suất (Probability Distribution Function)** của luồng dữ liệu Production (Current) lệch khỏi luồng dữ liệu tham chiếu (Baseline - thường là tập Training Data). 

Có 3 hình thái chính:
1. **Covariate Shift (Data Drift):** $P(X)$ thay đổi. Ví dụ: Mô hình định giá nhà được train trên dữ liệu trước dịch với lãi suất thấp. Nay lãi suất tăng, phân phối thu nhập và khoản vay của người mua $X$ thay đổi hoàn toàn.
2. **Prior Probability Shift (Label Drift):** $P(Y)$ thay đổi. Tỷ lệ nhấp chuột (CTR) bỗng tăng vọt từ 2% lên 20% do một chiến dịch Marketing, làm sai lệch các baseline cũ.
3. **Concept Drift:** $P(Y|X)$ thay đổi. Mối quan hệ giữa Input và Output thay đổi. Ví dụ: Hành vi mua 50 cuộn giấy vệ sinh từng là dấu hiệu gian lận đầu cơ, nhưng trong đại dịch COVID-19, đó là hành vi bình thường.

---

## 2. Kiến trúc Giám sát Drift (Observability Plane)

Để bắt được Data Drift ở quy mô Petabyte, việc chạy một script Python cục bộ là bất khả thi. Chúng ta cần một kiến trúc Lakehouse Monitoring tích hợp trực tiếp vào vòng đời của dữ liệu.

Dưới đây là kiến trúc tham chiếu (dựa trên Databricks Lakehouse Monitoring & AWS SageMaker Clarify):

```mermaid
graph TD
    subgraph Data Pipeline
        A["Kafka / Kinesis"] -->|Ingestion| B("Bronze Table<br/>Raw Data")
        B -->|ETL| C("Silver Table<br/>Cleaned & Joined")
        C -->|Aggregations| D("Gold Table<br/>Business Level")
    end
    
    subgraph ML Infrastructure
        C -->|Feature Store| E["Training Data<br/>Baseline"]
        E --> F("(ML Model"))
        D --> F
        F -->|Predictions| G("Inference Table<br/>Inputs + Outputs")
    end

    subgraph Observability Plane("Drift Monitoring")
        E -.->|Generate Baseline Profile| H["Profile Baseline"]
        G -.->|Batch/Streaming Profiling| I["Profile Current"]
        
        H --> J{"Statistical Engine<br/>K-S Test, PSI, JSD"}
        I --> J
        
        J -->|Write Metrics| K["(Metrics Store<br/>Delta / Iceberg)"]
        K --> L["Drift Dashboards"]
        K -->|Threshold Alert| M["PagerDuty / Slack"]
        M -.->|Webhook| N["Trigger Model Retraining"]
    end
    
    classDef storage fill:#f9f6e5,stroke:#b8a36c;
    class B,C,D,E,G,K storage;
```

**Luồng thực thi:**
1. Mọi request (Input) và dự đoán (Output) của mô hình phải được lưu lại vào **Inference Table**.
2. Một tiến trình độc lập (thường chạy theo Batch mỗi đêm) sẽ quét Inference Table và so sánh với Baseline Table.
3. Tính toán các chỉ số Profile: Min, Max, Mean, Null counts, và chạy các phép toán thống kê (PSI, K-S Test).
4. Ghi kết quả vào một Metrics Store để vẽ Dashboard hoặc kích hoạt Alert.

---

## 3. Thực thi Giám sát (Executable Configuration)

Dưới đây là một ví dụ thực chiến cấu hình kiểm tra Drift sử dụng thư viện **Evidently AI** kết hợp với Python. Trong thực tế, đoạn code này sẽ được đóng gói vào một Airflow DAG hoặc Databricks Workflow.

```python
import pandas as pd
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset
from evidently.metrics import DataDriftTable

# 1. Tải dữ liệu Reference (Baseline) và Current (Production)
reference_data = pd.read_parquet("s3://data-lake/feature_store/training_v2.parquet")
current_data = pd.read_parquet("s3://data-lake/inference_tables/date=2026-06-25.parquet")

# 2. Định nghĩa Data Drift Report
# Dùng Population Stability Index (PSI) cho biến phân loại, và Wasserstein distance cho biến liên tục
drift_report = Report(metrics=[
    DataDriftPreset(
        num_stattest='wasserstein', 
        cat_stattest='psi',
        num_stattest_threshold=0.1,
        cat_stattest_threshold=0.2
    )
])

# 3. Tính toán 
drift_report.run(reference_data=reference_data, current_data=current_data)

# 4. Trích xuất kết quả Alert
result = drift_report.as_dict()
is_drift_detected = result["metrics"][0]["result"]["dataset_drift"]

if is_drift_detected:
    trigger_pagerduty_alert("Data Drift Detected in Production!")
```

---

## 4. Systemic Trade-offs: Tối ưu Chi phí (FinOps) vs Độ chính xác

Kiểm tra Data Drift là một bài toán **Compute-Intensive** (Tiêu tốn nhiều tài nguyên tính toán).

### 4.1. Bài toán OOM (Out Of Memory) và Shuffle
Để so sánh hàm phân phối của 1 Tỷ dòng dữ liệu hiện tại với 10 Tỷ dòng dữ liệu Training, bạn không thể dùng hàm `median()` hay `K-S test` truyền thống vì chúng yêu cầu phải **Sort (Sắp xếp)** dữ liệu. Sort trên hệ thống phân tán (Spark) sẽ gây ra **Network Shuffle** khổng lồ và rất dễ dẫn đến lỗi `JVM OOMKilled`.

**Trade-off:** Chấp nhận giảm độ chính xác tuyệt đối để tiết kiệm chi phí Compute.
- **Giải pháp 1: Approximate Algorithms.** Thay vì tính toán chính xác, sử dụng `t-digest` cho các chỉ số phân vị (quantiles/median) hoặc `HyperLogLog` để đếm số lượng biến duy nhất.
- **Giải pháp 2: Data Sampling (Lấy mẫu).** Chỉ profile trên 1% hoặc 5% dữ liệu Production ngẫu nhiên (Uniform Random Sampling).
- **Giải pháp 3: Aggregated Profiling (whylogs).** Thay vì lưu toàn bộ raw data để so sánh, các thư viện như `whylogs` tạo ra các "Bản phác thảo thống kê" (Statistical Sketches) siêu nhẹ tại ngay bước Ingestion, giúp việc merge và so sánh drift chỉ tốn vài MB RAM.

### 4.2. Độ trễ (Latency) vs Tần suất giám sát
- Nếu chạy Profile Drift mỗi giờ (Hourly): Rất dễ dính Alert giả do tính mùa vụ trong ngày (Ngày và Đêm có hành vi mua sắm khác nhau). Chi phí tính toán cũng bị đội lên cao.
- **Giải pháp:** Thiết lập **Sliding Windows** (Cửa sổ trượt). Sử dụng dữ liệu của 7 ngày gần nhất để so sánh với 7 ngày trước đó.

---

## 5. Rủi ro Vận hành và Sự cố thực tế (Troubleshooting)

### Incident 1: Hội chứng "Alert Fatigue" và "Retraining Storm"
**Triệu chứng:** Team Data nhận được hàng trăm email cảnh báo Drift mỗi tuần. Các kỹ sư bắt đầu phớt lờ cảnh báo (Alert Fatigue). Đồng thời, cấu hình tự động (Auto-retraining) liên tục kích hoạt các cụm GPU đắt đỏ để train lại mô hình, đẩy hóa đơn AWS tăng đột biến (Retraining Storm).
**Nguyên nhân:** Đặt ngưỡng (Threshold) K-S test quá nhạy ($p-value = 0.05$). Bất kỳ biến động nhỏ nào do ngày lễ (Tết, Black Friday) cũng làm kích hoạt Drift.
**Khắc phục:** 
- Phân tích Drift **theo cụm (Cohort)** hoặc theo thời vụ. 
- Không bao giờ set Auto-retrain ngay khi có Drift mà không qua bước Review của Data Scientist. 
- Giảm mức độ nghiêm trọng của cảnh báo nếu Drift xảy ra trên các Feature ít quan trọng (Low Feature Importance).

### Incident 2: Front-end Update gây sai lệch thầm lặng
**Triệu chứng:** Doanh thu hệ thống giảm 15% trong 1 tuần nhưng pipeline báo xanh (Success) toàn bộ. 
**Nguyên nhân:** Team Frontend đẩy một bản cập nhật thay đổi ô nhập liệu `age` (Tuổi) từ "Text" sang "Slider", và giá trị mặc định của Slider vô tình được set là `0`. Schema pipeline nhận số `0` (vẫn là kiểu Integer hợp lệ), không có Null sinh ra, nhưng phân phối độ tuổi lệch hẳn về 0, phá nát các dự báo của mô hình đằng sau.
**Khắc phục:** Kết hợp Data Drift Monitoring tại tầng Bronze/Silver (như dùng `Great Expectations`) để chặn các Anomalies trước khi nó kịp đi vào Model.

---

## Nguồn Tham Khảo

1. **AWS Architecture Blog:** *Detecting data drift using Amazon SageMaker Clarify* - Phân tích chi tiết cách AWS xây dựng vòng lặp phản hồi để đo lường dữ liệu đầu vào.
2. **Databricks Lakehouse Monitoring:** *Monitor data and AI assets* - Kiến trúc lưu trữ Metrics vào các bảng Delta Catalog và theo dõi qua Dashboards.
3. **Evidently AI & whylogs:** Các báo cáo nghiên cứu về Data Observability và tối ưu không gian bộ nhớ khi profiling bằng thuật toán Sketching. 
4. **Designing Data-Intensive Applications (Martin Kleppmann):** Tư duy về xử lý dị thường trong hệ thống phân tán.
