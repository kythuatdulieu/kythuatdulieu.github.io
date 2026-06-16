---
title: "Deep Dive: Watermarks & Late Data Handling"
description: "Khám phá chi tiết về cách Apache Flink quản lý thời gian, giải quyết bài toán dữ liệu đến muộn (late data) bằng cơ chế Watermarks và Allowed Lateness để đảm bảo tính chính xác cho các hệ thống Stream Processing."
---



Trong các hệ thống phân tích dữ liệu luồng (Stream Processing), việc tính toán tổng, đếm số lượng, hay tìm trung bình là những bài toán cốt lõi. Nhưng câu hỏi hóc búa nhất luôn là: **"Khi nào thì một Window (khung thời gian) được xem là ĐÃ ĐÓNG và có thể tự tin xuất kết quả ra ngoài?"**.

Trong môi trường mạng phân tán thực tế, dữ liệu không bao giờ là hoàn hảo. Sự kiện có thể đến muộn, đến sai thứ tự (Out-of-order) do đứt cáp quang, nghẽn mạng di động 4G/5G, thiết bị mất kết nối, hoặc do lỗi hệ thống ở các cụm downstream. 

**Watermarks (Mực nước)** là một trong những giải pháp thanh lịch và đột phá nhất mà Apache Flink (dựa trên mô hình Dataflow của Google) tạo ra để giải bài toán định tuyến thời gian này.

---

## 1. Các Khái Niệm Thời Gian (Time Semantics)

Trước khi đi sâu vào Watermark, bạn cần phải rạch ròi 3 khái niệm thời gian thường được sử dụng trong Stream Processing:

- **Event Time (Thời gian sự kiện):** Thời điểm mà một sự kiện thực sự xảy ra ở thiết bị nguồn (ví dụ: người dùng bấm vào nút "Mua Hàng" trên điện thoại lúc `10:00:05 AM`). Dữ liệu này thường được nhúng (embed) vào payload của chính sự kiện đó. Đây là thời gian khách quan và có giá trị nhất đối với Data Analyst vì nó phản ánh thực tại.
- **Processing Time (Thời gian xử lý):** Thời điểm mà một máy chủ/node của Flink nhận được hoặc bắt đầu xử lý sự kiện đó, được lấy từ đồng hồ hệ thống của server. Nếu mạng rớt, sự kiện lúc `10:00:05 AM` có thể chui vào Flink lúc `10:05:00 AM` (trễ 5 phút). 
- **Ingestion Time (Thời gian tiếp nhận):** Thời điểm mà sự kiện đi vào hệ thống xử lý stream (ví dụ: lúc Kafka hay Flink Source nhận được). Nó nằm giữa Event Time và Processing Time.

> [!WARNING] Cạm bẫy của Processing Time
> Nếu bạn tính doanh thu từ `10:00 - 10:01` dựa trên *Processing Time*, bạn sẽ vô tình đẩy các đơn hàng mua lúc 10:00 nhưng bị nghẽn mạng sang một Window của lúc `10:05`. Kết quả là biểu đồ doanh thu theo giờ/phút sẽ hoàn toàn sai lệch so với thực tế. Do đó, cho các bài toán phân tích chính xác, **Event Time** luôn là lựa chọn bắt buộc.

---

## 2. Bài Toán Dữ Liệu Không Theo Thứ Tự (Out-of-Order Data)

Trong một hệ thống Event Time, luồng dữ liệu tới Engine không bao giờ xếp hàng ngoan ngoãn theo thứ tự thời gian tăng dần. 

Hãy tưởng tượng một luồng các sự kiện với Event Time như sau:
`[10:01] -> [10:03] -> [10:02] -> [10:05] -> [10:04]`

Sự kiện `10:02` đến sau sự kiện `10:03`. Nếu Flink chỉ đơn giản đóng cửa Window `10:00 - 10:02` ngay khi nó thấy sự kiện `10:03` xuất hiện, thì sự kiện `10:02` sẽ bị bỏ lỡ hoàn toàn. Làm sao Flink biết nó phải chờ bao lâu để gom đủ sự kiện cho Window `[10:00 - 10:02]`?

Đó chính là lúc **Watermarks** lên tiếng.

---

## 3. Định Nghĩa Và Cơ Chế Hoạt Động Của Watermarks

### Watermark Là Gì?
**Watermark(t)** là một dòng chảy tín hiệu ngầm (metadata) chạy song song với luồng dữ liệu chính, mang ý nghĩa một lời tuyên bố của hệ thống: *"Tôi đoan chắc rằng toàn bộ các sự kiện xảy ra có Event Time <= t đã đến đủ rồi. Không còn sự kiện nào có thời gian <= t chưa được xử lý nữa!"*.

Khi Watermark tiến lên một mốc thời gian vượt qua ranh giới cuối cùng của một Window (ví dụ: Watermark đạt `10:02:00 AM`), Flink sẽ hiểu rằng: "Đã đến lúc đóng Window `[10:00 - 10:02]`, kích hoạt hàm tính tổng (Sum/Count) và đẩy kết quả ra Database".

### Perfect vs. Heuristic Watermarks
Làm sao hệ thống biết chắc chắn là không còn sự kiện nào trễ hơn? Có hai cách tiếp cận:

1. **Perfect Watermarks (Mực nước hoàn hảo):** Chỉ tồn tại khi bạn có một cơ chế đảm bảo tuyệt đối sự kiện được phát đi một cách đồng bộ và nghiêm ngặt (điều gần như vô lý trên môi trường Internet thực tế).
2. **Heuristic Watermarks (Mực nước dự đoán):** Giải pháp phổ biến nhất. Flink cho phép bạn định nghĩa một **Độ trễ tối đa cho phép - Bounded Out of Orderness**. 
   *Ví dụ: "Tôi sẽ tạo Watermark luôn đi sau sự kiện mới nhất là 5 giây"*.
   - Sự kiện mới nhất có Event Time là `10:00:10` -> Watermark hiện tại là `10:00:05`. 
   - Lúc này, hệ thống sẽ chốt sổ các sự kiện từ `10:00:05` trở về trước. Các sự kiện bị trễ <= 5 giây sẽ vẫn nằm kịp trong Window.

---

## 4. Xử Lý Dữ Liệu Đến Quá Trễ (Late Data Handling)

Điều gì xảy ra nếu bạn thiết lập Bounded Out of Orderness là "Trễ tối đa 1 phút", nhưng có một sự kiện bị kẹt trong điện thoại do rớt mạng 3G, và tận **10 phút sau** nó mới gửi tới hệ thống? 

Lúc này, Watermark đã đi qua rất xa và Window chứa sự kiện đó đã chính thức bị **đóng và xuất kết quả (emitted)**. Sự kiện này được gọi là **Late Data (Dữ liệu muộn)**. Flink cung cấp 3 cơ chế để bạn quyết định số phận của những dòng dữ liệu này:

### A. Drop (Bỏ qua - Mặc định)
Hành vi mặc định của Flink là vứt bỏ (Drop) sự kiện đó. Hệ thống không quan tâm vì Window đã đóng sổ. Phù hợp cho những hệ thống cần real-time nhanh chóng và chấp nhận một tỷ lệ sai số nhỏ (ví dụ: đếm view video Youtube).

### B. Allowed Lateness (Khoan hồng cho sự trễ nải)
Nếu bạn không muốn mất bất cứ sự kiện nào, Flink cung cấp **Allowed Lateness**. 
Bạn có thể cho phép: Window đã đóng, đã xuất kết quả, nhưng State (trạng thái lưu trữ) của Window đó vẫn "hé cửa" nằm chờ trên bộ nhớ RAM/RocksDB thêm 1 khoảng thời gian nữa (ví dụ: chờ thêm 2 tiếng).
- Khi cục data trễ 10 phút chui vào, Flink sẽ tra lại Window đang hé cửa.
- Flink tính toán lại (re-evaluate) và phóng ra một kết quả **Update (Upsert)** mới tinh đè lên kết quả cũ. (Bạn cần một Sink hỗ trợ Upsert như PostgreSQL, Cassandra, hoặc Elasticsearch).
- Qua đúng 2 tiếng sau, mọi dấu vết của Window đó mới chính thức bị thiêu rụi (Purged), giải phóng RAM.

### C. Side Output (Luồng dữ liệu chết)
Còn nếu cục dữ liệu đó đến trễ hẳn hơn 2 tiếng (vượt qua cả Allowed Lateness) thì sao? Bạn vẫn có thể bắt lấy nó và tống vào một **Side Output** (hay gọi là Dead Letter Queue). Từ Side Output này, bạn có thể lưu file thô lên S3, HDFS để đội Data Engineer chạy batch job bù lỗ lại vào sáng hôm sau. Đảm bảo dữ liệu không bao giờ biến mất!

---

## 5. Ví Dụ Cấu Hình Trong Apache Flink

Dưới đây là một đoạn code ví dụ minh họa cách thiết lập Watermark kết hợp cả `AllowedLateness` và `SideOutput` trong Flink Java API:

```java
// 1. Cấu hình Watermark chiến lược Heuristic (trễ tối đa 5 giây)
WatermarkStrategy<MyEvent> strategy = WatermarkStrategy
    .<MyEvent>forBoundedOutOfOrderness(Duration.ofSeconds(5))
    .withTimestampAssigner((event, timestamp) -> event.getEventTime());

DataStream<MyEvent> stream = env.addSource(myKafkaSource)
    .assignTimestampsAndWatermarks(strategy);

// 2. Định nghĩa Side Output Tag
final OutputTag<MyEvent> lateDataTag = new OutputTag<MyEvent>("late-data"){};

// 3. Tính toán Window
SingleOutputStreamOperator<Result> resultStream = stream
    .keyBy(event -> event.getUserId())
    .window(TumblingEventTimeWindows.of(Time.minutes(1)))
    .allowedLateness(Time.hours(2)) // Mở cửa sổ chờ thêm 2 tiếng
    .sideOutputLateData(lateDataTag) // Hứng dữ liệu vượt quá 2 tiếng
    .process(new MyWindowFunction());

// 4. Bắt luồng Side Output
DataStream<MyEvent> lateStream = resultStream.getSideOutput(lateDataTag);
lateStream.addSink(new S3Sink()); // Ghi dữ liệu quá trễ ra S3
```

---

## 6. Những Cạm Bẫy Thực Tế Cần Tránh

Trong quá trình vận hành Production với Watermarks, các Data Engineer thường gặp phải một số lỗi phổ biến:

1. **Idling Sources (Nguồn dữ liệu bị đóng băng):** 
   Nếu một Kafka Partition tự nhiên không nhận được dữ liệu (do người dùng đi ngủ vào ban đêm), Watermark của phân vùng đó sẽ đứng yên. Do Flink lấy Watermark tối thiểu (min) giữa tất cả các nguồn để tiến lên, toàn bộ hệ thống sẽ bị treo cứng lại, không một Window nào được xuất ra. 
   *Giải pháp:* Dùng hàm `.withIdleness(Duration.ofMinutes(1))` trong WatermarkStrategy để Flink tự động bỏ qua các source không có dữ liệu sau 1 khoảng thời gian.

2. **Trade-off Giữa Độ Trễ & Tính Chính Xác:** 
   Nếu `Bounded Out Of Orderness` quá lớn (ví dụ 1 tiếng), độ chính xác rất cao, nhưng Dashboard của bạn sẽ phải đợi 1 tiếng mới hiển thị data. Nếu quá nhỏ (1 giây), Dashboard cập nhật lẹ nhưng kết quả có thể thiếu hụt.

3. **Phình To State:** 
   Việc thiết lập `Allowed Lateness` quá dài (ví dụ: vài ngày) sẽ khiến Flink phải giữ hàng triệu Window trong bộ nhớ/RocksDB trong vài ngày, dẫn đến State size khổng lồ và kéo dài thời gian Checkpoint. Cần tính toán cẩn thận dựa trên dung lượng bộ nhớ hiện có.

---

## Tài Liệu Tham Khảo

* [Apache Flink Architecture - Timely Stream Processing](https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/)
* **Streaming Systems: The What, Where, When, and How of Large-Scale Data Processing - Tyler Akidau**
* [Kafka: a Distributed Messaging System for Log Processing - LinkedIn (NetDB 2011)](http://notes.stephenholiday.com/Kafka.pdf)
* [Exactly-Once Semantics in Apache Kafka - Confluent Blog](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)
* [Stateful Stream Processing with RocksDB - Flink Forward](https://flink-forward.org/)
