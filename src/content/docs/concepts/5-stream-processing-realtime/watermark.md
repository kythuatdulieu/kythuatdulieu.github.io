---
title: "Watermark - Cỗ Máy Thời Gian Của Streaming Engine"
difficulty: "Advanced"
tags: ["streaming", "watermark", "event-time", "late-data", "flink", "spark"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Watermark là gì? Kiến trúc xử lý Late Data & OOMKilled"
metaDescription: "Deep dive vào Watermark dưới góc nhìn Staff Data Engineer. Phân tích kiến trúc thực thi (DAG), trade-off hệ thống, JVM OOMKilled và cách xử lý Idle Partitions."
description: "Watermark không đơn thuần là một mốc thời gian. Trong kiến trúc phân tán, nó là 'đồng hồ logic' quyết định sự sống còn của bộ nhớ trạng thái (State Memory) và tính đúng đắn của dữ liệu."
---

Trong các hệ thống phân tán (Distributed Systems), yếu tố thời gian luôn là một biến số hỗn loạn. Dữ liệu từ các thiết bị di động, IoT, hay Microservices hiếm khi đến Kafka hay Kinesis theo đúng thứ tự (out-of-order) do sự cố mạng, độ trễ truyền dẫn (network delay), hoặc thiết bị mất kết nối tạm thời.

Bài toán đặt ra cho các hệ thống Stream Processing (như Apache Flink, Spark Structured Streaming) là: **Làm sao hệ thống biết được khi nào thì ĐÃ NHẬN ĐỦ dữ liệu của một khung giờ để kích hoạt (trigger) tính toán và xuất kết quả?**

Khái niệm **Watermark** (Dấu chuẩn thời gian) được sinh ra để giải quyết nghịch lý này. Dưới góc nhìn của một Kỹ sư Dữ liệu, Watermark không chỉ là một mốc thời gian đơn thuần—nó là cơ chế cốt lõi kiểm soát vòng đời của **State Memory** (Bộ nhớ Trạng thái) và trực tiếp định đoạt giới hạn vật lý của toàn bộ hệ thống Streaming.

---

## 1. Nghịch lý Thời gian: Event Time vs Processing Time

Trước khi đi sâu vào hệ thống vật lý, chúng ta cần phân biệt:

- **Event Time (Thời gian sự kiện):** Timestamp gắn liền với bản ghi tại thời điểm nó được sinh ra ở thiết bị nguồn (VD: User click vào nút Mua hàng lúc `12:00:05`).
- **Processing Time (Thời gian xử lý):** Timestamp của máy chủ (Worker Node) lúc nó thực sự nhận được và xử lý sự kiện đó.

Sự chênh lệch giữa hai cột mốc này gọi là **Event Time Skew** hay **Data Lateness**. Một sự kiện sinh ra lúc `12:00:05` có thể bị kẹt ở Network Shuffle và chỉ đến Engine lúc `12:05:00`. Nếu Engine tiến hành gom nhóm (Windowing) theo `Processing Time`, dữ liệu sẽ bị tính sai lệch vào khung giờ 12:05. Do đó, các hệ thống chuẩn doanh nghiệp luôn sử dụng `Event Time` để đảm bảo tính toàn vẹn (Accuracy).

---

## 2. Watermark dưới góc nhìn Kiến trúc Thực thi (Physical Execution)

Theo định nghĩa từ tác phẩm *Streaming Systems* (Tyler Akidau), Watermark là một "đồng hồ logic" (Logical Clock) trôi dọc theo DAG (Directed Acyclic Graph) của luồng xử lý.

Khi một Watermark có giá trị `W` đi qua một Operator, nó phát ra một lời cam kết cấp hệ thống:
> *"Tôi đảm bảo rằng từ giờ trở đi, sẽ không có thêm bất kỳ sự kiện nào có Event Time < W chạy tới Operator này nữa."*

Khi Watermark `W` vượt qua ngưỡng kết thúc của một Event-Time Window, Window đó sẽ được đóng lại, tiến hành tính toán kết quả (Aggregation), và **quan trọng nhất**: Giải phóng State (State Cleanup) khỏi bộ nhớ (RocksDB hoặc JVM Heap).

### Sơ đồ: Dữ liệu Out-of-order và Watermark

![Watermark Out of Order](/images/5-stream-processing-realtime/watermark-out-of-order.svg)
*Minh họa từ Apache Flink: Các sự kiện đến lộn xộn, Watermark đóng vai trò làm hàng rào để chốt sổ thời gian logic.*

### Sự lan truyền Watermark trong DAG (Watermark Propagation)

Trong thực tế, một Operator ở hạ nguồn (như `WindowJoin`) thường nhận dữ liệu từ nhiều Upstream Task (ví dụ: các Kafka Partitions khác nhau). Vậy Watermark của Operator hạ nguồn đó sẽ được tính như thế nào?

Nguyên tắc cốt lõi: **Watermark của một Downstream Operator = `MIN` (Tất cả Watermark của các Upstream Channel).**

```mermaid
graph TD
    subgraph Upstream["Kafka Partitions / Upstream Tasks"]
        P0["Partition 0<br/>Watermark: 12:05"]
        P1["Partition 1<br/>Watermark: 12:03"]
        P2["Partition 2<br/>Watermark: 12:07"]
    end

    subgraph Downstream["Downstream Window Operator"]
        OP["Window Operator<br/>Watermark = MIN("12:05, 12:03, 12:07") = 12:03<br/>Sẵn sàng đóng Window 12:00"]
    end

    P0 -->|Data + WM("12:05")| OP
    P1 -->|Data + WM("12:03")| OP
    P2 -->|Data + WM("12:07")| OP

    style OP fill:#f9f,stroke:#333,stroke-width:2px
```

Việc lấy `MIN()` đảm bảo rằng Downstream Operator không bị "cầm đèn chạy trước ô tô". Nó phải chờ luồng phân vùng dữ liệu chậm nhất bắt kịp trước khi ra quyết định đóng Window.

---

## 3. Cấu hình Code Thực chiến (Show, Don't Tell)

Trong môi trường phân tán (Internet), không bao giờ có **Perfect Watermark**. Chúng ta buộc phải sử dụng **Heuristic Watermark** bằng cách thiết lập một độ trễ cố định (Bounded Out-of-Orderness). 

Công thức chung: `Watermark = MAX(Event Time nhận được) - Bounded_Delay`

### Apache Flink (Java API)
```java
// Khai báo Watermark Strategy với độ trễ cho phép là 20 giây
WatermarkStrategy<Event> strategy = WatermarkStrategy
        .<Event>forBoundedOutOfOrderness(Duration.ofSeconds(20))
        .withTimestampAssigner((event, timestamp) -> event.getTimestamp())
        .withIdleness(Duration.ofMinutes(1)); // Chống kẹt Watermark do Idle Partition

// Áp dụng vào DataStream
DataStream<Event> streamWithWatermarks = stream.assignTimestampsAndWatermarks(strategy);
```

### Spark Structured Streaming (Python)
```python
# Cho phép dữ liệu trễ tối đa 10 phút trước khi bị loại bỏ khỏi memory state
aggregated_df = raw_events_df \
  .withWatermark("event_time", "10 minutes") \
  .groupBy(
      window("event_time", "5 minutes"), 
      "user_id"
  ) \
  .count()
```

---

## 4. Systemic Trade-offs & Sự cố Vận hành (Real-world Incidents)

Việc cấu hình `Bounded_Delay` (hay Allowed Lateness) chính là hành động vặn nút điều chỉnh trên một chiếc cân thăng bằng giữa **Độ trễ hệ thống (Latency)** và **Tính đầy đủ của số liệu (Accuracy)**. Nếu setup sai lầm, bạn sẽ phải trả giá bằng việc hệ thống đổ vỡ toàn tập.

### Sự cố 1: State Bloat và JVM OOMKilled
- **Bối cảnh:** Lo sợ mất dữ liệu do thiết bị IoT offline lâu, một Data Engineer cấu hình Bounded Delay của Watermark lên tới `24 hours` (hoặc cấu hình Allowed Lateness quá lớn).
- **Hệ lụy hệ thống:** Do Watermark bị kéo lùi lại 24 tiếng, Engine **KHÔNG ĐƯỢC PHÉP** giải phóng bất kỳ Window nào trong vòng 24 giờ qua (vì chúng chưa hết hạn - expire). Mọi dữ liệu bay vào hệ thống đều được nạp vào Memory/RocksDB.
- **Sự cố:** Khi lưu lượng tăng đột biến, hệ thống bị nghẽn Memory (State Bloat), dẫn tới hiện tượng `JVM OOMKilled` (Out of Memory) hoặc các nhịp GC Pause (Garbage Collection Pause) kéo dài hàng phút, làm sập toàn bộ Pipeline.
- **Cách khắc phục:** Giữ Bounded Delay ở mức tối thiểu gọn nhẹ (ví dụ 1-5 phút) để xả State nhanh. Những dữ liệu trễ hơn mức này sẽ được đẩy qua cơ chế **Late Data Handling** thay vì ôm trong State.

### Sự cố 2: Bài toán Idle Partition (Watermark bị kẹt)
- **Bối cảnh:** Một Kafka Topic được chia làm 50 Partitions. Vào ban đêm, lưu lượng ít, Partition số `49` hoàn toàn không có dòng sự kiện nào chảy qua (Idle).
- **Hệ lụy hệ thống:** Quay lại Sơ đồ DAG ở trên, Downstream Operator lấy `MIN()` của tất cả các Partition. Do Partition `49` không có event mới, Watermark của nó không tăng (mãi đứng im ở `12:00`). Điều này kéo theo Watermark của toàn bộ Downstream cũng đứng im ở `12:00`.
- **Sự cố:** Các Window bị treo vĩnh viễn và không bao giờ được trigger xuất kết quả, dù cho 49 Partitions kia dữ liệu vẫn đang đổ về.
- **Cách khắc phục:** Bắt buộc phải cấu hình `withIdleness()` trong Flink. Nếu một Partition không có dữ liệu sau một khoảng thời gian (ví dụ 1 phút), Flink sẽ đánh dấu nó là "Idle" và loại partition đó ra khỏi phép tính `MIN()`.

---

## 5. Xử lý Late Data: Khi Dữ liệu Đến Sau Khi Window Đóng

Điều gì xảy ra khi một event "thiên nga đen" vẫn đến sau khi Watermark đã đi qua và Window đã bị xóa sổ? Hệ thống cung cấp 3 cơ chế ứng phó:

1. **Drop (Bỏ qua mặc định):** Sự kiện bị vứt bỏ lập tức. Giải pháp này an toàn cho RAM và phổ biến cho các hệ thống Metric không cần độ chính xác tài chính 100%.
2. **Side Output (Dead Letter Queue):** Định tuyến (Route) những sự kiện "trễ tàu" này sang một luồng phụ riêng biệt (ví dụ: Ghi ra một Kafka Topic khác hoặc raw S3 bucket). Cuối ngày, một tiến trình Batch (như Airflow + Spark) sẽ chạy để quét luồng này và vá lại dữ liệu.
3. **Allowed Lateness (Retraction/Update):** Chấp nhận "hé cửa" thêm một khoảng thời gian. Khi dữ liệu muộn bay vào, hệ thống sẽ mở lại state, tính toán lại, và bắn ra một bản ghi **Update (Upsert)** hoặc **Retraction** để ghi đè kết quả cũ. 
   > *Trade-off Kiến trúc:* Cơ sở dữ liệu hạ nguồn (Sink) **bắt buộc** phải hỗ trợ Upsert (như Apache Iceberg, Apache Hudi, hoặc PostgreSQL). Nếu dùng Sink dạng Append-only (như ghi file text lên HDFS), việc bắn bản ghi Update sẽ tạo ra dữ liệu rác hoặc trùng lặp (Duplicate Data).

---

## 6. Nguồn Tham Khảo (References)

- **Sách:** *Streaming Systems: The What, Where, When, and How of Large-Scale Data Processing* - Tyler Akidau.
- **Apache Flink Official Docs:** [Timestamps and Watermarks](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/event-time/generating_watermarks/)
- **Databricks Engineering Blog:** [Multiple Stateful Operators in Structured Streaming](https://www.databricks.com/blog/2023/10/05/multiple-stateful-operators-structured-streaming.html)
- **Uber Engineering:** [Kappa Architecture at Uber: Unified Stream Processing](https://www.uber.com/en-US/blog/kappa-architecture-data-stream-processing/)
- **Netflix TechBlog:** Tham chiếu kiến trúc Data Mesh quản lý Iceberg Snapshots và Data High Watermarks trong xử lý trễ ([Data Mesh - A Data Movement and Processing Platform](https://netflixtechblog.com/data-mesh-a-data-movement-and-processing-platform-netflix-694d502d9996)).
