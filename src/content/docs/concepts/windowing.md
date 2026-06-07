---
title: "Windowing - Phân nhóm dữ liệu luồng theo thời gian"
category: "Streaming Processing"
difficulty: "Intermediate"
tags: ["streaming", "windowing", "tumbling", "sliding", "session", "flink"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Windowing là gì? Tumbling, Sliding, Session Windows trong Streaming"
metaDescription: "Tìm hiểu các loại Windowing trong xử lý dữ liệu Streaming: Tumbling, Sliding, Session. Cách chia cắt luồng dữ liệu vô hạn thành các nhóm hữu hạn để phân tích."
---

# Windowing - Phân nhóm dữ liệu luồng theo thời gian

## Summary

Dữ liệu luồng (Streaming Data) bản chất là vô hạn và không bao giờ kết thúc. Để thực hiện các phép tính tổng hợp (như đếm số lượng, tính tổng doanh thu) trên một tập dữ liệu vô hạn là điều bất khả thi về mặt kỹ thuật. **Windowing** (Phân nhóm theo cửa sổ) là kỹ thuật "cắt" dòng dữ liệu vô hạn này thành các khối (chunks) hữu hạn dựa trên thời gian (hoặc số lượng bản ghi). Kỹ thuật này cho phép các công cụ streaming áp dụng các phép tính logic (Aggregations, Joins) trên từng nhóm dữ liệu một cách độc lập và tuần tự.

---

## Definition

**Windowing** là cơ chế chia dữ liệu của một stream thành các nhóm logic gọn gàng (buckets / windows) dựa trên một tiêu chí nhất định (phổ biến nhất là Event Time hoặc Processing Time).

Mỗi khi một bản ghi (record) đi qua hệ thống, nó sẽ được gán vào một hoặc nhiều cửa sổ. Khi một cửa sổ đạt đến điều kiện kết thúc (dựa trên thời gian hoặc Watermark), cửa sổ đó sẽ được đóng lại, hàm tính toán sẽ được chạy trên toàn bộ bản ghi thuộc cửa sổ đó và phát ra kết quả ra bên ngoài.

---

## Why it exists

Bạn không thể chạy một lệnh SQL `SELECT SUM(revenue) FROM real_time_stream` trên một stream không bao giờ dừng, vì hệ thống không biết khi nào là điểm kết thúc để đưa ra con số tổng cuối cùng.

Để có kết quả, chúng ta phải đặt câu hỏi theo giới hạn: "Tổng doanh thu **trong 5 phút vừa qua** là bao nhiêu?". 
Cụm từ "trong 5 phút vừa qua" chính là một Window. Windowing sinh ra để biến đổi bài toán xử lý vô hạn thành tập hợp các bài toán xử lý batch vi mô (micro-batches), cho phép thực thi các phép toán thống kê một cách khả thi.

---

## Core idea

Có 3 mô hình Windowing cốt lõi dựa trên thời gian được sử dụng rộng rãi trong các hệ thống như Apache Flink, Spark Structured Streaming, Kafka Streams:

1. **Tumbling Window (Cửa sổ nhào lộn - Cố định)**:
   * Kích thước cố định, **không chồng lấn** lên nhau.
   * *Ví dụ*: Window 5 phút. `[10:00 - 10:05)`, `[10:05 - 10:10)`. Mỗi bản ghi chỉ thuộc về đúng một cửa sổ duy nhất. Dùng cho các báo cáo định kỳ (Hourly metrics).

2. **Sliding Window (Cửa sổ trượt)**:
   * Kích thước cố định, nhưng có tham số "bước trượt" (slide/hop) ngắn hơn kích thước, dẫn đến **chồng lấn** lên nhau.
   * *Ví dụ*: Window 10 phút, trượt mỗi 5 phút. `[10:00 - 10:10)`, `[10:05 - 10:15)`. Một bản ghi lúc `10:06` sẽ nằm trong cả hai cửa sổ này. Dùng cho bài toán Moving Average (Trung bình động) hoặc cảnh báo trend.

3. **Session Window (Cửa sổ phiên hoạt động)**:
   * Kích thước **không cố định**, được xác định dựa trên khoảng thời gian tĩnh lặng (Gap / Inactivity).
   * *Ví dụ*: Theo dõi hành vi người dùng trên web. Nếu người dùng liên tục click, chúng thuộc về một phiên (session). Nếu người dùng dừng tương tác quá 30 phút, cửa sổ đóng lại. Lần click tiếp theo sẽ mở một Session mới.

*(Lưu ý: Ngoài ra còn có Global Window hoặc Count-based Window dựa trên số lượng bản ghi thay vì thời gian).*

---

## Architecture / Flow

```mermaid
graph TD
    subgraph Tumbling Window (Kích thước: 5m)
        A1[10:00 - 10:05] --- B1[10:05 - 10:10] --- C1[10:10 - 10:15]
    end

    subgraph Sliding Window (Kích thước: 10m, Trượt: 5m)
        A2[10:00 - 10:10]
        B2[10:05 - 10:15]
        C2[10:10 - 10:20]
    end

    subgraph Session Window (Gap: 10m)
        A3[User1 Click... 5m ...Click] -->|Gap 10m| B3[Đóng Window 1]
        C3[User1 Click mới] --> D3[Mở Window 2]
    end
```

---

## Practical example

Sử dụng Apache Flink (Java API) để cấu hình các loại Window:

**1. Tumbling Window (Tổng doanh thu mỗi 1 phút):**
```java
stream
    .keyBy(event -> event.getStoreId())
    .window(TumblingEventTimeWindows.of(Time.minutes(1)))
    .sum("revenue");
```

**2. Sliding Window (Đếm số truy cập trong 1 giờ qua, cập nhật mỗi 10 phút):**
```java
stream
    .keyBy(event -> event.getUrl())
    .window(SlidingEventTimeWindows.of(Time.hours(1), Time.minutes(10)))
    .process(new CountAccessFunction());
```

**3. Session Window (Gom nhóm hành vi User theo phiên, ngắt phiên nếu nghỉ 30 phút):**
```java
stream
    .keyBy(event -> event.getUserId())
    .window(EventTimeSessionWindows.withGap(Time.minutes(30)))
    .process(new UserBehaviorAnalysisFunction());
```

---

## Best practices

* **Kết hợp KeyBy trước khi Window**: Luôn luôn phân mảng dữ liệu (partitioning) bằng `keyBy()` trước khi áp dụng Window. Cú pháp `stream.windowAll()` gom toàn bộ dữ liệu hệ thống vào một node duy nhất để phân cửa sổ, làm mất đi khả năng xử lý song song (parallelism) và gây thắt cổ chai (bottleneck) nghiêm trọng.
* **Cẩn thận với Sliding Windows có bước trượt quá nhỏ**: Nếu cấu hình Window size = 1 giờ, Slide = 1 giây. Mỗi sự kiện sẽ bị sao chép vào 3600 cửa sổ khác nhau đang mở, làm bùng nổ bộ nhớ State và đánh sập hệ thống (State Explosion).
* **Kết hợp Incremental Aggregation**: Nếu chỉ cần tính SUM, MIN, MAX, hãy dùng hàm Reduce/Aggregate (tính gộp dần dần ngay khi dữ liệu đến) thay vì dùng ProcessWindowFunction (lưu toàn bộ dữ liệu thô vào bộ nhớ rồi mới tính một lần khi đóng cửa sổ).

---

## Common mistakes

* **Sử dụng ProcessWindowFunction vô tội vạ**: Quét và lưu trữ hàng triệu bản ghi thô trong State chờ cửa sổ đóng thay vì sử dụng Pre-aggregation.
* **Quên xử lý Late Data**: Với Event Time Window, các window đã đóng do Watermark chạy qua sẽ rớt (drop) dữ liệu đến muộn nếu không cấu hình `allowedLateness` hoặc Side-output.
* **Không tối ưu Session Window Merge**: Session Window hoạt động bằng cách tạo ra các cửa sổ nhỏ gọn và sáp nhập (merge) chúng lại mỗi khi có sự kiện mới chen vào giữa. Chi phí tính toán sáp nhập rất đắt đỏ, cần theo dõi tải CPU.

---

## Trade-offs

### Tumbling Window
* **Ưu**: Hiệu năng cao nhất, ít tốn bộ nhớ vì các cửa sổ độc lập hoàn toàn, dễ hiểu và dễ báo cáo.
* **Nhược**: Không phát hiện được các xu hướng nằm đè lên ranh giới thời gian (ví dụ đợt tăng đột biến kéo dài từ 10:04 đến 10:06 bị cắt đôi vào 2 window).

### Sliding Window
* **Ưu**: Làm mượt dữ liệu (smoothing), rất tuyệt vời cho các chỉ số trung bình động hoặc cảnh báo sớm (Alerting).
* **Nhược**: Chi phí bộ nhớ và CPU tăng nhân lên theo tỷ lệ `Size / Slide_Step` do dữ liệu bị trùng lặp ở nhiều window.

### Session Window
* **Ưu**: Phản ánh đúng nghiệp vụ lấy người dùng làm trung tâm (User-centric), dữ liệu đóng gói theo hành vi thực tế.
* **Nhược**: Cực kỳ tốn kém tài nguyên CPU do thuật toán hợp nhất (merging logic) và khó dự đoán thời điểm xuất kết quả (do không biết khi nào người dùng thực sự dừng lại).

---

## When to use

* **Tumbling Window**: Dashboard báo cáo tài chính hàng ngày/giờ, ETL đẩy vào Data Warehouse.
* **Sliding Window**: Cảnh báo hệ thống (CPU quá 90% trong 5 phút qua, kiểm tra mỗi 10 giây), Phát hiện gian lận (Fraud Detection - Quẹt thẻ quá 5 lần trong 10 phút, bất kể bắt đầu từ phút nào).
* **Session Window**: Phân tích phễu chuyển đổi (Funnel), Clickstream analysis, theo dõi giỏ hàng.

## When not to use

* Nếu chỉ cần biến đổi dữ liệu 1-1 (ETL cơ bản: Parse JSON -> Lưu Database), không cần bất kỳ loại Window nào. Xử lý trực tiếp từng Record (Stateless transformation).

---

## Related concepts

* [Event Time & Processing Time](/concepts/event-time-processing-time)
* [Watermark](/concepts/watermark)
* [Stream-Table Duality](/concepts/stream-table-duality)

---

## Interview questions

### 1. Phân biệt Tumbling Window và Sliding Window.
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết cơ bản về các mô hình phân nhóm thời gian.
* **Gợi ý trả lời (Strong Answer)**: Tumbling Window là cửa sổ cố định thời gian và không chồng lấn. Mỗi bản ghi chỉ thuộc về 1 cửa sổ (ví dụ: chia thời gian thành các mốc 10 phút). Sliding Window cũng cố định kích thước nhưng có khoảng trượt (slide) nhỏ hơn kích thước, dẫn đến các cửa sổ chồng lấn lên nhau. Một bản ghi có thể thuộc về nhiều cửa sổ Sliding (ví dụ: Cửa sổ 10 phút, cập nhật mỗi 1 phút). Tumbling tốt cho báo cáo chốt sổ, Sliding tốt cho hệ thống trung bình động (moving average) và alerting.
* **Lỗi cần tránh**: Mô tả mơ hồ, không nêu bật được từ khóa "chồng lấn" (overlapping) vs "không chồng lấn" (non-overlapping).

### 2. Session Window khác biệt gì so với Tumbling/Sliding Window? Làm sao engine biết khi nào đóng Session Window?
* **Người phỏng vấn muốn kiểm tra**: Kiến thức sâu về Session logic.
* **Gợi ý trả lời (Strong Answer)**: Session Window không có kích thước cố định như Tumbling/Sliding mà dựa trên hành vi của dữ liệu. Engine sử dụng cấu hình "Inactivity Gap" (khoảng im lặng). Nếu trong khoảng thời gian Gap này không có thêm sự kiện nào từ cùng một khóa (ví dụ: cùng `user_id`), engine sẽ kết luận phiên hoạt động đã kết thúc và đóng Window. Dưới nền tảng, engine thường tạo mỗi sự kiện thành một window nhỏ, sau đó liên tục sáp nhập (merge) các window sát nhau lại cho đến khi khoảng cách vượt quá Gap.
* **Lỗi cần tránh**: Cho rằng Session có thời gian kết thúc cố định.

### 3. Tại sao cấu hình Sliding Window với `size = 1 day` và `slide = 1 second` lại là một thảm họa hệ thống?
* **Người phỏng vấn muốn kiểm tra**: Kinh nghiệm thực tế và nhận thức về tối ưu hiệu năng bộ nhớ.
* **Gợi ý trả lời (Strong Answer)**: Đây là hiện tượng State Explosion (Bùng nổ trạng thái). Trong một Sliding Window, một bản ghi sẽ được copy/tham chiếu tới `Size / Slide` cửa sổ đang mở. Với size 1 ngày (86400 giây) và slide 1 giây, MỖI một sự kiện đi vào hệ thống sẽ phải được đưa vào 86,400 cửa sổ khác nhau trên bộ nhớ State. RAM hệ thống sẽ cạn kiệt ngay lập tức và hiệu năng CPU chạm đáy vì phải quản lý quá nhiều metadata.
* **Lỗi cần tránh**: Không biết về thuật toán phân bổ dữ liệu của Sliding Window.

### 4. Nếu tôi muốn cảnh báo ngay khi một tài khoản bị lỗi đăng nhập 5 lần trong vòng 10 phút, tôi nên dùng loại Window nào?
* **Người phỏng vấn muốn kiểm tra**: Ứng dụng lý thuyết vào giải quyết Use Case.
* **Gợi ý trả lời (Strong Answer)**: Sử dụng Sliding Window. Ta có thể set Window Size là 10 phút và Slide là 1 phút (hoặc 10 giây) với Key là UserID. Hàm aggregation sẽ đếm số lần lỗi. Nếu số lỗi >= 5, ta kích hoạt cảnh báo. Không thể dùng Tumbling Window vì nếu User lỗi 3 lần ở phút 9 của window trước, và 2 lần ở phút 1 của window sau, thì Tumbling Window sẽ không phát hiện ra sự kiện này (ranh giới cắt ngang).
* **Lỗi cần tránh**: Trả lời dùng Tumbling Window (sẽ bỏ lọt cảnh báo).

### 5. Sự khác biệt giữa `windowAll()` và `keyBy().window()` là gì?
* **Người phỏng vấn muốn kiểm tra**: Khái niệm tính toán phân tán (Distributed Computing) và Parallelism.
* **Gợi ý trả lời (Strong Answer)**: `keyBy().window()` sẽ băm (hash) các khóa và phân phối dữ liệu cho nhiều Worker Node khác nhau, mỗi Node tự quản lý Window cho nhóm khóa của nó $\rightarrow$ chạy song song đa luồng, mở rộng tốt (Scalable). Ngược lại, `windowAll()` buộc TẤT CẢ luồng dữ liệu của hệ thống phải hội tụ về một Worker/Task duy nhất để tính toán Window chung. Điều này giết chết khả năng tính toán phân tán, gây thắt cổ chai và chỉ dùng cho các bài toán đặc biệt yêu cầu Global Scope trên dữ liệu rất nhỏ.

---

## References

1. **Streaming Systems** - Tyler Akidau (Chương 2, "Windowing" - Trình bày mô hình cốt lõi của Google Dataflow).
2. **Apache Flink Documentation** - Windows.
3. **Kafka Streams Documentation** - Windowing data.

---

## English summary

**Windowing** is a core streaming technique used to slice infinite data streams into finite, manageable blocks based on time (or count) so that aggregations and computations can be applied. The three primary types of time-based windows are:
1. **Tumbling Windows**: Fixed size, non-overlapping (e.g., hourly reports).
2. **Sliding Windows**: Fixed size, overlapping (e.g., moving averages, continuous alerting).
3. **Session Windows**: Dynamic size based on user activity gaps, merging events until a period of inactivity occurs (e.g., user behavior analysis).
Properly choosing the window type and configuring its size/slide is critical, as improper configurations (like extremely tiny sliding steps) can lead to catastrophic state memory explosions in the processing engine.
