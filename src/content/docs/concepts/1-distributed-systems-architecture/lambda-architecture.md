---
title: "Lambda Architecture"
difficulty: "Advanced"
tags: ["architecture", "streaming", "batch", "lambda", "big-data"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Lambda Architecture - Phân Tích Chuyên Sâu Tầng Batch & Speed"
metaDescription: "Tìm hiểu kiến trúc Lambda ở góc độ kỹ thuật: Trade-offs, Data Sync, Deduplication, và sự phức tạp khi bảo trì hệ thống Batch/Stream song song."
description: "Sự đánh đổi kinh điển giữa Latency và Accuracy. Phân tích chi tiết cách gộp dữ liệu ở Serving Layer và những nỗi đau vận hành (Tech Debt)."
---

Kiến trúc **Lambda (Lambda Architecture)**, ra đời từ bộ não của Nathan Marz, là giải pháp "phá vỡ thế bế tắc" của thập kỷ trước, khi các công cụ Big Data chưa thể vẹn toàn được cả hai tiêu chí: **Độ trễ thấp (Low Latency)** và **Độ chính xác tuyệt đối (High Accuracy)**. 

Bằng cách phân tách hệ thống thành 2 luồng độc lập (Batch và Speed), Lambda chấp nhận sự phức tạp cực độ trong vận hành để lấy lại tính nhất quán và khả năng chịu lỗi (Fault Tolerance) cao nhất. Dưới góc độ một Staff Engineer, Lambda không chỉ là một sơ đồ 3 tầng, mà là nghệ thuật đồng bộ hóa và quản trị rủi ro dữ liệu.

## 1. Physical Execution & Kiến Trúc Tầng

Lambda Architecture xử lý cùng một sự kiện (Event) đi qua hai con đường song song.

```mermaid
graph TD
    A["Data Sources / Kafka"] -->|Immutable Append| B("Batch Layer<br/>HDFS/S3 + Spark")
    A -->|Stream Tailing| C("Speed Layer<br/>Flink/Storm")
    
    B -->|Precomputed Batch Views<br/>(100% Accurate)| D["(Serving Layer<br/>Cassandra/Druid)"]
    C -->|Real-time Views<br/>(Approximation/Fast)| D
    
    D --> E["Query/Dashboard: Merge("Batch + Realtime")"]
    
    style B fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style C fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style D fill:#f0f4c8,stroke:#827717,stroke-width:2px
```

### 1.1. Batch Layer (Tầng Chân Lý)
- **Nhiệm vụ:** Lưu trữ toàn bộ Master Dataset ở dạng Append-only (không bao giờ xóa sửa). Định kỳ (vd: mỗi đêm), chạy các job nặng nề (MapReduce/Spark) quét lại toàn bộ dữ liệu để tính ra các Batch Views chính xác tuyệt đối.
- **Bản chất vật lý:** Sequential Disk I/O. Tối ưu cho Throughput cực lớn, bất chấp Latency. Lỗi? Đơn giản là xóa View cũ và chạy lại (Reprocessing) từ dữ liệu gốc.

### 1.2. Speed Layer (Tầng Độ Trễ Thấp)
- **Nhiệm vụ:** Xử lý (chỉ) phần dữ liệu mới nhất mà Batch Layer *chưa kịp tính*. Cung cấp Real-time Views ngay lập tức.
- **Bản chất vật lý:** In-memory computation (RAM). Chấp nhận các thuật toán xấp xỉ (HyperLogLog, Bloom Filters) hoặc sự hy sinh nhỏ về độ chính xác (ví dụ có thể bị trùng lặp message nếu At-Least-Once semantics được dùng thay vì Exactly-Once để tăng tốc).

## 2. Hard Engineering Problems & Trade-offs

### Nỗi Đau 1: Tính Đồng Bộ & Xóa Bỏ Dữ Liệu Chồng Lấn (Overlap)
Làm sao để Serving Layer gộp (Merge) Batch View và Real-time View mà không bị **Double Counting** (đếm trùng)?

Giả sử Batch job chạy lúc 00:00, mất 2 tiếng để tính xong dữ liệu của ngày hôm qua (đến 23:59:59). Trong 2 tiếng đó, Speed Layer vẫn đang bơm dữ liệu mới.
- **Giải pháp:** Speed Layer phải gắn *Timestamp* rõ ràng cho mỗi computation. Tại thời điểm Serving Layer nhận được Batch View mới, nó phải thực hiện cơ chế **Cut-off**: Drop (hoặc truncate) toàn bộ kết quả của Speed Layer nằm trong khoảng thời gian mà Batch View đã phủ (từ 23:59:59 trở về trước).
- **Code SQL tại Serving Layer (Logical Merge):**
```sql
-- Dữ liệu hiển thị = Batch (Chuẩn xác) + Realtime (Phần thiếu sót của Batch)
SELECT 
    user_id, 
    SUM(clicks) as total_clicks
FROM (
    SELECT user_id, clicks FROM batch_views
    UNION ALL
    -- Chỉ lấy realtime từ thời điểm Batch kết thúc (Cut-off logic)
    SELECT user_id, clicks FROM realtime_views 
    WHERE event_time > (SELECT MAX(event_time) FROM batch_views)
)
GROUP BY user_id;
```

### Nỗi Đau 2: Duy Trì Hai Codebase (Tech Debt)
Để tính cùng một logic (ví dụ: Sessionization, Clicks per user), Data Engineer phải viết mã nguồn bằng hai framework khác biệt hoàn toàn (VD: Java MapReduce cho Batch và Clojure/Storm cho Real-time). 
- **Operational Risk:** Khi có sự thay đổi về Business Logic, Dev phải update cả 2 nơi. Việc đảm bảo Semantics (ý nghĩa tính toán) y hệt nhau giữa 2 engine là cực kỳ khó (đặc biệt khi dính đến xử lý timezone, null handling, type casting). Nợ kỹ thuật (Tech Debt) sẽ tích lũy theo cấp số nhân.

## 3. Tại Sao Kiến Trúc Lambda Đang Thoái Trào?

Lambda là một "bước đệm" lịch sử tuyệt vời, nhưng đang bị thay thế bởi Kappa Architecture và Lakehouse.

1. **Sự trưởng thành của Stream Engines:** Flink và Spark Structured Streaming hiện nay cung cấp cơ chế **Exactly-once Processing** rất mạnh thông qua Distributed Checkpointing (Chandy-Lamport algorithm). Chúng ta không còn phải "sợ" Stream tính sai để rồi phải dùng Batch để vá lỗi nữa.
2. **Unified APIs (Apache Beam / Spark):** Framework hiện đại cho phép viết code 1 lần, deploy dưới dạng stream hoặc batch.
3. **Table Formats trên Data Lake (Iceberg/Hudi):** Các công nghệ này cho phép Update/Delete và ACID transactions ngay trên S3. Bạn có thể push event streaming trực tiếp vào Data Lake và dùng Engine đọc liền lạc, làm mờ ranh giới giữa Batch/Stream.

## Nguồn Tham Khảo (References)

* [Big Data: Principles and best practices of scalable realtime data systems - Nathan Marz](https://www.manning.com/books/big-data)
* [Questioning the Lambda Architecture - Jay Kreps](https://www.oreilly.com/radar/questioning-the-lambda-architecture/)
* [Designing Data-Intensive Applications - Martin Kleppmann (Part 2: Distributed Data)](https://dataintensive.net/)
