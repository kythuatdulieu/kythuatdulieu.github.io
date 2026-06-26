---
title: "Databricks Under The Hood: Hiểu Sâu Cơ Chế OPTIMIZE & VACUUM"
difficulty: "Intermediate"
tags: ["optimize", "vacuum", "delta-lake", "performance", "databricks", "data-engineering"]
readingTime: "12 mins"
lastUpdated: 2026-06-26
seoTitle: "Cách sử dụng OPTIMIZE và VACUUM trong Databricks Delta Lake"
metaDescription: "Khám phá bài toán Small Files trong Big Data. Hiểu rõ cách lệnh OPTIMIZE (Bin-packing) và VACUUM dọn dẹp rác hoạt động dưới nền tảng Databricks."
description: "Phân tích sâu rủi ro I/O Bottleneck, sự tích tụ Tombstones trong Delta Log và cách khắc phục lỗi JVM OOMKilled khi vận hành Lakehouse quy mô lớn."
---

![Optimize & Vacuum Architecture](/images/3-storage-engines-formats/optimize-vacuum.png)

Hệ thống Data Lakehouse của bạn có thể đột ngột sụp đổ hiệu năng dù tổng lượng dữ liệu không tăng nhiều. Căn bệnh thầm lặng này được cấu thành từ hai yếu tố vật lý: **Small Files Syndrome** (Hội chứng tệp siêu nhỏ) và **Tombstone Accumulation** (Tích tụ rác lịch sử). 

Để sinh tồn trong môi trường Production, việc làm chủ hai công cụ `OPTIMIZE` (Chống phân mảnh) và `VACUUM` (Thu gom rác) là kỹ năng sống còn của mọi Data Engineer.

## 1. Bản chất Vật lý của "Small Files"

Trong luồng Streaming Ingestion hoặc Micro-batching, Spark Workers liên tục ghi xuống các tệp Parquet dung lượng vài chục Kilobyte. 
- **I/O Bottleneck:** Spark Driver phải tiêu tốn CPU cycle để mở (Open), đọc Metadata (Header, Footer) rồi mới đọc nội dung. Khi số lượng file lên tới hàng vạn, I/O Overhead áp đảo hoàn toàn thời gian xử lý dữ liệu.
- **Transaction Log Bloat:** Delta Log (`_delta_log/`) phình to. Thậm chí chỉ việc Driver tải danh sách file vào bộ nhớ cũng gây ra lỗi `java.lang.OutOfMemoryError: Java heap space` (OOMKilled).

## 2. OPTIMIZE: Thuật toán Bin-packing

`OPTIMIZE` không đơn thuần là gom file. Nó là một Spark Job chạy thuật toán **Bin-packing** (Đóng thùng) hạng nặng.
Hệ thống tải các file vụn vào bộ nhớ, trộn lại (Shuffle) và ghi ra các tệp Parquet kích thước tối ưu (mặc định Databricks nhắm mục tiêu 1GB/tệp).

```sql
-- Chạy gộp tệp giới hạn ở những phân vùng mới bị xé lẻ (Tiết kiệm Compute Cost)
OPTIMIZE events WHERE date >= current_date() - INTERVAL 1 DAY;
```

**Sự thật về Storage Cost:** Lệnh `OPTIMIZE` **KHÔNG xóa file cũ**. Nhờ cơ chế MVCC, nó chỉ đánh dấu các file vụn là "Đã xóa logic" (Tombstones) trong Delta Log và tạo file to mới. Nghĩa là sau khi chạy xong, dung lượng S3/GCS của bạn sẽ **tăng lên**.

## 3. VACUUM: Tránh thảm họa Query Conflict

Để giải phóng dung lượng vật lý, bạn phải gọi `VACUUM`. Quá trình này quét Delta Log và thực hiện xóa cứng (Hard Delete) khỏi Object Storage những file Tombstones cũ hơn một khoảng Retention.

```sql
-- Dọn dẹp Tombstones cũ hơn 7 ngày (An toàn tuyệt đối)
VACUUM events;
```

### Rủi ro Vận hành (Operational Risks): The 7-Day Rule
Tại sao Databricks thiết lập mặc định Retention là 7 ngày?
1.  **Tránh Query Conflicts:** Nếu một Pipeline ML cực lớn chạy mất 10 tiếng, đang đọc vào một file Tombstone, và bạn chạy lệnh `VACUUM RETAIN 0 HOURS` để ép xóa file đó đi. Pipeline ML sẽ lập tức văng lỗi `FileNotFoundException` và Crash toàn bộ job.
2.  **Khóa An Toàn (Safety Lock):** Databricks chủ động ném lỗi nếu bạn set Retention dưới 168 giờ (7 ngày). Để bypass (vô cùng nguy hiểm), bạn phải chèn config:
    ```text
    spark.databricks.delta.retentionDurationCheck.enabled false
    ```

## 4. Giải pháp Tự động (Predictive Optimization)

Thay vì viết cronjob lên lịch, Databricks hiện đại khuyến nghị giao phó hệ thống cho **Predictive Optimization**. Engine sẽ liên tục phân tích Delta Log ngầm, đo đạc mức độ phân mảnh, dự đoán Query Pattern và tự động kích hoạt background task để chạy `OPTIMIZE`, `VACUUM` hoặc `ANALYZE` vào thời điểm hệ thống rảnh rỗi nhất.

```sql
-- Bật Predictive Optimization ở mức Bảng (Unity Catalog)
ALTER TABLE main.default.events ENABLE PREDICTIVE OPTIMIZATION;
```

## Nguồn Tham Khảo (References)
* [Databricks Documentation: Optimize data file layout](https://docs.databricks.com/en/delta/optimize.html)
* [Databricks Documentation: Vacuum unused data files](https://docs.databricks.com/en/delta/vacuum.html)
* [Databricks Blog: Predictive Optimization for Delta Lake](https://www.databricks.com/blog/predictive-optimization-delta-lake)
