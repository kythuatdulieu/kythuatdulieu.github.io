---
title: "Phát hiện bất thường - Anomaly Detection"
category: "Data Quality"
difficulty: "Advanced"
tags: ["anomaly-detection", "data-observability", "machine-learning", "data-quality"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Phát hiện bất thường dữ liệu (Anomaly Detection) là gì?"
metaDescription: "Khám phá Anomaly Detection trong Data Quality: Ứng dụng thống kê và Machine Learning để tự động phát hiện các dị thường không lường trước trong đường ống dữ liệu."
---

# Phát hiện bất thường dữ liệu - Anomaly Detection

## Summary

Phát hiện bất thường (Anomaly Detection hay Outlier Detection) trong bối cảnh Data Quality/Data Observability là quá trình ứng dụng thuật toán Thống kê (Statistics) và Học máy (Machine Learning) để tự động giám sát luồng dữ liệu theo chuỗi thời gian (time-series). Nó tự học hành vi "bình thường" của dữ liệu trong quá khứ và cảnh báo tức thì khi phát hiện một điểm dữ liệu "bất thường" — thứ mà các bài kiểm thử tĩnh (Static Data Tests) dùng quy tắc cứng (hard-coded rules) không thể nắm bắt được.

---

## Definition

**Anomaly Detection** là khả năng hệ thống tự động xác định các mẫu hình (patterns) hoặc giá trị không tuân theo hành vi dự kiến của phần lớn tập dữ liệu.
Trong Kỹ thuật Dữ liệu, nó thường được áp dụng vào 2 khía cạnh:
1. **Metadata Anomaly**: Bất thường ở tầng vận hành (Ví dụ: Thể tích dữ liệu (Volume) hút về mỗi ngày thường là 1GB, hôm nay bỗng dưng tụt xuống 10MB; hoặc thời gian chạy pipeline (Freshness) tăng vọt từ 1 tiếng lên 5 tiếng).
2. **Data Payload Anomaly**: Bất thường ở giá trị kinh doanh (Ví dụ: Tỉ lệ NULL của cột `user_id` lịch sử là 1%, tự nhiên hôm nay tăng vọt lên 40%).

---

## Why it exists

"We don't know what we don't know" (Chúng ta không biết những điều mà ta không biết).
Các công cụ như dbt Testing hay Data Contracts dựa trên **Rule-based** (Luật cứng). Bạn chỉ có thể viết Test chặn rớt dữ liệu nếu bạn LƯỜNG TRƯỚC ĐƯỢC lỗi đó.
* Ví dụ: Bạn viết test `revenue > 0`. Nhưng nếu ngày thường doanh thu là 1 tỷ, hôm nay rớt mạng rớt kết nối nên doanh thu ghi nhận là 500 ngàn. `500 ngàn > 0`, test vẫn báo Xanh (PASS). 
* Nếu dùng Rule-based, bạn phải viết: `revenue > 500_000_000`. Nhưng vào ngày nghỉ Tết, doanh thu sụt là bình thường, thế là bài Test của bạn liên tục báo lỗi sai (False Positive). Lập trình viên không thể ngồi cập nhật ngưỡng (threshold) này thủ công mỗi ngày được.

Anomaly Detection ra đời để thay con người tự tính toán "Ngưỡng động" (Dynamic thresholds) dự đoán tương lai dựa trên chu kỳ quá khứ, giúp bắt được "Unknown Unknowns" (Những lỗi vô danh chưa từng xuất hiện).

---

## Core idea

Cốt lõi của Anomaly Detection là **Phân tích chuỗi thời gian (Time-series Forecasting)**.
1. Khảo sát một Metric cụ thể (Ví dụ: Số dòng mới được sinh ra mỗi giờ).
2. Xây dựng dải ruy băng dự đoán (Confidence Interval / Bounds). Thuật toán (như ARIMA, Prophet, hoặc phân phối Z-score) sẽ dự đoán: "Vào trưa thứ 6, số dòng mới nên nằm trong khoảng từ 8.000 đến 12.000 dòng".
3. Nếu giá trị thực tế đo được vượt ra ngoài dải ruy băng này (Ví dụ: chỉ có 2.000 dòng), hệ thống đánh dấu đó là một Anomaly (Dị thường) và phát cảnh báo.

Hệ thống thông minh có khả năng nhận biết Tính mùa vụ (Seasonality) (thứ 7, Chủ nhật traffic tự động thấp đi) và Tính xu hướng (Trend) (công ty đang phát triển, số dòng mỗi tháng một tăng lên).

---

## How it works

Hệ thống Data Observability (như Monte Carlo, re_data) thường triển khai ngầm Anomaly Detection như sau:
1. Định kỳ 1 giờ, hệ thống chạy lệnh `SELECT COUNT(*), COUNT(NULL_id) FROM target_table` và lưu các metric này vào kho Metadata.
2. Nạp dữ liệu lịch sử của 14-30 ngày gần nhất vào mô hình Machine Learning.
3. Mô hình tính toán đường Baseline (Cơ sở) và ngưỡng Upper Bound (Giới hạn trên), Lower Bound (Giới hạn dưới).
4. Khớp dữ liệu của giờ hiện tại vào mô hình. Nếu nó nằm ngoài đường giới hạn, một cảnh báo Slack được kích hoạt tự động với biểu đồ minh họa.

---

## Practical example

Trường hợp sử dụng **Z-score** (Thuật toán đơn giản nhưng hiệu quả cao) áp dụng thẳng bằng SQL trong dbt:

Dự đoán bất thường về số lượng đơn đặt hàng (Volume):
1. Tính trung bình (Mean) và Độ lệch chuẩn (StdDev) lượng đơn hàng của 7 ngày qua.
2. Công thức Z-score: `Z = (Giá_trị_hôm_nay - Mean) / StdDev`
3. Nếu `Z > 3` hoặc `Z < -3` (Nghĩa là dữ liệu lệch chuẩn quá 3 lần, tỷ lệ xuất hiện theo phân phối chuẩn chỉ là 0.3%), báo hiệu bất thường tột độ.

```sql
-- Dùng CTE tính toán lịch sử
WITH historical_stats AS (
  SELECT 
    AVG(daily_count) as mean_count,
    STDDEV(daily_count) as stddev_count
  FROM daily_volume_log
  WHERE date >= CURRENT_DATE - INTERVAL '7 DAY'
)
-- So sánh với hôm nay
SELECT 
  today.daily_count,
  h.mean_count,
  (today.daily_count - h.mean_count) / h.stddev_count AS z_score
FROM today_volume today
CROSS JOIN historical_stats h
WHERE ABS((today.daily_count - h.mean_count) / h.stddev_count) > 3;
```
Nếu truy vấn trả ra dòng, tức là có bất thường.

---

## Best practices

* **Đừng tự xây lại bánh xe**: Không nên cố tự viết Python code chạy Machine Learning để giám sát Data Quality nếu tổ chức chưa đủ lớn. Các công cụ Data Observability SaaS (như Monte Carlo, Datafold) đã làm việc này xuất sắc. Nếu nguồn lực hạn hẹp, có thể dùng thư viện mã nguồn mở `re_data` (chạy như một dbt package).
* **Kết hợp Rule-based và ML**: Anomaly Detection không thay thế Data Testing. Dùng Data Tests (Rule-based) để chặn các lỗi Logic bắt buộc (như Tuổi > 0). Dùng Anomaly Detection để giám sát Thể tích (Volume) và Tỷ lệ khuyết thiếu (Null rate) trên diện rộng (At-scale).
* **Train mô hình cần thời gian**: Đừng bật cảnh báo vào ngày thứ nhất bảng được tạo. Các mô hình ML cần ít nhất 14-21 ngày thu thập metadata để hiểu được chu kỳ (seasonality) của dữ liệu. Thời gian đầu nó sẽ đưa ra vô số báo động giả (False Positive) cho tới khi học xong.

---

## Common mistakes

* **Mệt mỏi vì cảnh báo (Alert Fatigue)**: Bật Anomaly Detection cho 10.000 bảng trong Data Warehouse. Mỗi ngày hệ thống gửi 500 cái Slack message vì dữ liệu trồi sụt thất thường. Người dùng chán nản và bấm "Mute" kênh cảnh báo mãi mãi. 
  * *Giải pháp*: Chỉ bật cho các bảng Tier 1 (Cốt lõi tài chính, BI Dashboard).
* **Phớt lờ tác động của các sự kiện đặc biệt (Black Swan events)**: Vào ngày siêu sale Black Friday, dữ liệu tăng gấp 10 lần. ML model không biết Black Friday là gì, nó báo đỏ chót toàn hệ thống. Cần có cơ chế can thiệp thủ công (Mute/Acknowledge alert) để hệ thống ML tự bỏ qua (ignore) ngày đó khi tính toán cho chu kỳ tuần sau.

---

## Trade-offs

### Ưu điểm
* Hoạt động thụ động (Zero-configuration): Không cần viết hàng ngàn dòng code YAML test. Chỉ cần bật công tắc, hệ thống sẽ tự quét mọi bảng và học.
* Bao phủ được các vấn đề (Unknown Unknowns) mà con người không lường trước được.

### Nhược điểm
* **Thiếu khả năng giải thích (Black box)**: Hệ thống báo lỗi, nhưng nó không giải thích được "TẠI SAO" tỷ lệ NULL lại tăng, Kỹ sư vẫn phải tự lội ngược dòng (Data Lineage) để debug.
* **Cảnh báo chậm (Reactive)**: Dữ liệu đã vào Data Warehouse và model xử lý xong nó mới báo lỗi. Dữ liệu rác có thể đã hiển thị vài phút trên Dashboard rồi. Không mang tính chặn đứng (Preventative) như Data Contract.

---

## When to use

* Kiến trúc dữ liệu của bạn quá khổng lồ (hàng nghìn bảng, hàng vạn cột), không thể nào dùng sức người (Data Engineers) ngồi viết Unit Test bằng tay cho từng cột một. Bạn cần một "Đội tuần tra tự động diện rộng".

## When not to use

* Với các pipeline xử lý dữ liệu nhỏ lẻ, dữ liệu không có tính chu kỳ (ví dụ dữ liệu campaign chạy 1 lần rồi bỏ) thì ML Model không có lịch sử để học. Việc cấu hình Anomaly Detection trở nên vô dụng.

---

## Related concepts

* [Data Observability](/concepts/data-observability)
* [Data Testing](/concepts/data-testing)
* [Data Quality Dimensions](/concepts/data-quality-dimensions)

---

## Interview questions

### 1. Sự khác biệt triết lý giữa Data Testing và Anomaly Detection là gì?
* **Người phỏng vấn muốn kiểm tra**: Tư duy kiến trúc, phân loại các lớp phòng thủ chất lượng dữ liệu.
* **Gợi ý trả lời (Strong Answer)**: Data Testing là **Deterministic** (Tất định) - dùng các bộ luật tĩnh do con người định nghĩa trước (Known bounds) để chặn các "Known Unknowns". Anomaly Detection là **Probabilistic** (Xác suất) - dùng Machine Learning và lịch sử động để giám sát và phát hiện các "Unknown Unknowns" (những lỗi kỳ quái ta không thể lường trước). Testing chặn lỗi ở cửa hẹp, Anomaly Detection quét bằng rada trên diện rộng.

### 2. Thuật toán phân tích chuỗi thời gian hay gặp phải vấn đề False Positive vào các dịp lễ tết. Bạn xử lý việc này thế nào trên hệ thống Data Observability?
* **Người phỏng vấn muốn kiểm tra**: Kinh nghiệm thực chiến khi làm việc với Machine Learning Monitors.
* **Gợi ý trả lời (Strong Answer)**: Có hai phương pháp. (1) Khai báo sự kiện (Event mapping): Truyền các ngày Lễ/Tết hoặc ngày Sale (Campains) vào model dưới dạng một biến ngoại lai (Exogenous variables), để model như Prophet hiểu và không phạt (penalize) sự tăng vọt vào ngày đó. (2) Cấu hình cửa sổ đào tạo linh hoạt (Training Window): Thu hẹp hoặc sử dụng kỹ thuật loại bỏ Outlier trong chính tập training, hoặc cho phép người dùng ấn nút "Đánh dấu là bình thường" trên UI để model điều chỉnh trọng số ngay lập tức.

---

## References

1. **"Data Quality Fundamentals"** - Barr Moses, Lior Gavish (CEO của Monte Carlo, người định nghĩa ra Data Observability và Anomaly Detection trong DWH).
2. **Prophet (Meta)** - Tài liệu học thuật về Time Series Forecasting được ứng dụng rộng rãi.

---

## English summary

Anomaly Detection in Data Quality refers to the application of statistical methods and Machine Learning (like Z-score or time-series forecasting) to autonomously monitor datasets for unexpected behavioral deviations. Unlike hard-coded rule-based Data Testing, which catches anticipated structural errors, anomaly detection learns historical patterns (seasonality and trend) to construct dynamic thresholds. It acts as an automated wide-net radar, sending alerts for "unknown unknowns"—such as a sudden 40% drop in row volume or an unexplained spike in NULL rates—without requiring manual configuration for every single table.
