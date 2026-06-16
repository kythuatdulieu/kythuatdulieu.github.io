---
title: "Windowing - Phân nhóm dữ liệu luồng theo thời gian"
difficulty: "Intermediate"
tags: ["streaming", "windowing", "tumbling", "sliding", "session", "flink"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Windowing là gì? Tumbling, Sliding, Session Windows trong Streaming"
metaDescription: "Tìm hiểu các loại Windowing trong xử lý dữ liệu Streaming: Tumbling, Sliding, Session. Cách chia cắt luồng dữ liệu vô hạn thành các nhóm hữu hạn để phân tích."
description: "Dữ liệu luồng (Streaming Data) về bản chất là một dòng chảy vô hạn, không có điểm dừng. Việc thực hiện các phép tính toán tổng hợp như đếm số lượng gi..."
---

Dữ liệu luồng (Streaming Data) về bản chất là một dòng chảy vô hạn (unbounded), không có điểm dừng. Việc thực hiện các phép tính toán tổng hợp (aggregation) như đếm số lượng giao dịch, tính tổng doanh thu hay tìm giá trị lớn nhất trên toàn bộ luồng dữ liệu là điều bất khả thi, bởi vì chúng ta không bao giờ có được toàn bộ dữ liệu. 

Để giải quyết bài toán này, chúng ta sử dụng khái niệm **Windowing**.

## 1. Windowing là gì?

**Windowing** (chia cửa sổ) là kỹ thuật cắt luồng dữ liệu vô tận (Unbounded Stream) thành những khối dữ liệu hữu hạn (Finite/Bounded Windows) dựa trên một tiêu chí nào đó (thường là thời gian hoặc số lượng sự kiện) để có thể thực hiện các phép tính toán trên đó.

Bạn có thể tưởng tượng Windowing giống như việc dùng một chiếc xô để múc nước từ một dòng sông đang chảy. Dòng sông là vô hạn, nhưng nước trong chiếc xô là hữu hạn, và bạn có thể dễ dàng đo lường xem trong xô có bao nhiêu lít nước.

### Tại sao cần Windowing?
- **Tính toán tổng hợp (Aggregation):** Để trả lời các câu hỏi như "Có bao nhiêu lượt truy cập trong 5 phút qua?", "Trung bình nhiệt độ của cảm biến trong 1 giờ qua là bao nhiêu?".
- **Phát hiện bất thường (Anomaly Detection):** Nhận biết các hành vi đáng ngờ diễn ra liên tục trong một khoảng thời gian ngắn (ví dụ: đăng nhập sai mật khẩu 5 lần trong 1 phút).
- **Phân tích theo phiên (Session Analysis):** Theo dõi hành vi người dùng trong một phiên truy cập trang web.

---

## 2. Các khái niệm Thời gian (Time Concepts) trong Stream Processing

Trước khi đi sâu vào các loại Window, chúng ta cần hiểu rõ 3 khái niệm thời gian thường được sử dụng trong các hệ thống xử lý luồng (như Apache Flink, Kafka Streams):

1. **Event Time (Thời gian sự kiện):** Đây là thời gian thực sự xảy ra sự kiện ở thiết bị phát sinh (ví dụ: thời gian cảm biến ghi nhận nhiệt độ, hoặc lúc user click vào nút). Thời gian này thường được đính kèm vào payload của event.
2. **Ingestion Time (Thời gian tiếp nhận):** Thời gian hệ thống streaming (như Kafka) nhận được sự kiện.
3. **Processing Time (Thời gian xử lý):** Thời gian máy chủ xử lý sự kiện đang chạy đoạn code windowing.

**Event Time** là quan trọng nhất vì nó phản ánh chính xác thế giới thực, giúp kết quả tính toán nhất quán dù hệ thống có bị delay, hay phải xử lý lại dữ liệu lịch sử (re-processing).

---

## 3. Các loại Windowing phổ biến

### 3.1. Tumbling Window (Cửa sổ cuộn)
Tumbling Window chia dữ liệu thành các khoảng thời gian có **độ dài cố định** và **không chồng lấp** (non-overlapping). Mỗi sự kiện chỉ thuộc về duy nhất một Tumbling Window.

- **Đặc điểm:** Cố định, không chồng lấp.
- **Tham số:** Kích thước cửa sổ (Window Size).
- **Ví dụ:** Tumbling Window với kích thước 5 phút. Các cửa sổ sẽ là `[00:00 - 00:05)`, `[00:05 - 00:10)`, `[00:10 - 00:15)`.

![Tumbling Window](https://nightlies.apache.org/flink/flink-docs-release-1.18/fig/tumbling-windows.svg)
*(Minh họa Tumbling Window. Nguồn: Apache Flink)*

**Ứng dụng thực tế:**
- Thống kê doanh thu theo mỗi giờ.
- Báo cáo số lượng request vào server mỗi phút để vẽ biểu đồ tổng quan.

### 3.2. Sliding Window / Hopping Window (Cửa sổ trượt)
Sliding Window cũng có **độ dài cố định**, nhưng các cửa sổ có thể **chồng lấp lên nhau** (overlapping). Nó trượt đi một khoảng thời gian đều đặn gọi là Slide (bước trượt).

- **Đặc điểm:** Cố định, có chồng lấp (nếu Slide < Size).
- **Tham số:** Kích thước cửa sổ (Window Size) và Bước trượt (Slide Size).
- **Ví dụ:** Sliding Window với kích thước 10 phút, bước trượt 5 phút. Các cửa sổ sẽ là `[00:00 - 00:10)`, `[00:05 - 00:15)`, `[00:10 - 00:20)`. Một sự kiện xảy ra lúc `00:07` sẽ thuộc về cả cửa sổ thứ nhất và thứ hai.

![Sliding Window](https://nightlies.apache.org/flink/flink-docs-release-1.18/fig/sliding-windows.svg)
*(Minh họa Sliding Window. Nguồn: Apache Flink)*

**Ứng dụng thực tế:**
- Tính toán đường trung bình động (Moving Average) của giá cổ phiếu trong 1 giờ qua, cập nhật mỗi 5 phút.
- Cảnh báo: Gửi alert nếu có quá 100 lỗi (Error Logs) trong vòng 5 phút qua, kiểm tra lại cứ sau mỗi 1 phút.

### 3.3. Session Window (Cửa sổ phiên)
Session Window không có độ dài cố định. Nó nhóm các sự kiện theo hoạt động của người dùng (hoặc một key nào đó). Một session được mở ra khi có sự kiện đầu tiên, và sẽ đóng lại (kết thúc) nếu **không có sự kiện nào xảy ra trong một khoảng thời gian im lặng nhất định** (Session Gap).

- **Đặc điểm:** Không cố định, dựa vào hoạt động, phụ thuộc vào dữ liệu.
- **Tham số:** Khoảng thời gian nghỉ (Session Gap Timeout).
- **Ví dụ:** Session Window với gap là 15 phút. Người dùng click vào lúc `10:00`, sau đó click tiếp lúc `10:10`. Vì thời gian nghỉ chưa tới 15 phút, cả 2 click này ở chung một session. Sau đó họ rời đi. Đến `10:30` (đã qua hơn 15 phút từ click cuối), phiên cũ sẽ đóng lại. Nếu họ trở lại lúc `10:35`, một session window mới sẽ được tạo ra.

![Session Window](https://nightlies.apache.org/flink/flink-docs-release-1.18/fig/session-windows.svg)
*(Minh họa Session Window. Nguồn: Apache Flink)*

**Ứng dụng thực tế:**
- Phân tích hành vi người dùng (User Analytics): đo lường một phiên mua sắm kéo dài bao lâu, họ đã xem bao nhiêu sản phẩm trước khi checkout.
- Gom nhóm các log liên quan đến một giao dịch phức tạp kéo dài nhưng có độ trễ không lường trước được giữa các bước.

### 3.4. Global Window (Cửa sổ toàn cục)
Global Window gom tất cả các sự kiện (thường là cùng chung một khóa - key) vào một cửa sổ duy nhất không bao giờ tự đóng. 
Bởi vì cửa sổ này không tự đóng lại, bạn **bắt buộc** phải cấu hình một **Trigger** (điều kiện kích hoạt) để hệ thống biết khi nào thì nên thực hiện tính toán.

**Ứng dụng thực tế:**
- Tính toán những logic tùy chỉnh phức tạp không dựa hoàn toàn vào thời gian. Ví dụ: Tính tổng khi giỏ hàng đạt 10 items, bất kể mất bao lâu.

---

## 4. Xử lý Dữ Liệu Đến Trễ (Late Data) với Watermarks

Trong thực tế, khi sử dụng **Event Time**, do sự cố mạng hoặc đặc thù của thiết bị mobile (mất sóng rồi có lại), dữ liệu có thể đến hệ thống không theo thứ tự thời gian, và có những dữ liệu đến rất trễ (Late Events). 

Nếu hệ thống cứ đợi mãi để đóng Window, nó sẽ không bao giờ xuất ra được kết quả. Nếu hệ thống đóng Window quá sớm, nó sẽ tính sai vì bỏ sót dữ liệu trễ. 

**Watermark** ra đời để giải quyết việc này. Watermark là một mốc thời gian khai báo rằng: *"Tôi tin chắc rằng từ giờ trở đi, sẽ không còn dữ liệu nào có Event Time cũ hơn mức Watermark này gửi đến nữa. Đã đến lúc đóng Window và tính toán!"*. 

Nếu sau khi Window đã đóng và tính toán xong, vẫn có những sự kiện "cực trễ" đến (Late Data vượt qua cả Watermark timeout), các hệ thống như Flink cung cấp cơ chế:
- **Drop (Bỏ qua):** Bỏ luôn những dữ liệu này.
- **Side Output (Xuất ra nhánh rẽ):** Đẩy dữ liệu trễ vào một luồng phụ để kỹ sư kiểm tra hoặc lưu vào kho lạnh thay vì làm hỏng luồng tính toán chính.
- **Allowed Lateness (Cho phép trễ):** Cho phép Window sống thêm một khoảng thời gian nữa sau khi có Watermark, cập nhật (update) lại kết quả trước đó nếu có dữ liệu trễ rớt vào.

---

## 5. Triggers và Evictors

Bên cạnh cách Window chia dữ liệu, hệ thống streaming còn sử dụng 2 khái niệm nâng cao để điều khiển chính xác khi nào window được thực thi:

- **Triggers (Bộ kích hoạt):** Quyết định *khi nào* một window sẵn sàng để được hệ thống tính toán (evaluate) và xuất kết quả. Ví dụ: Trigger khi thời gian Watermark vượt qua thời gian kết thúc của Window, hoặc Trigger mỗi khi Window nhận đủ 100 events, hoặc kết hợp cả hai.
- **Evictors (Bộ thanh lọc):** Hoạt động trước hoặc sau khi hàm tính toán của Window chạy. Nó có tác dụng xóa bớt các phần tử trong Window theo một logic riêng biệt nào đó (ví dụ: chỉ giữ lại 10 phần tử mới nhất trước khi tính tổng).

---

## 6. Ví dụ Mã Nguồn: Apache Flink Windowing (Java)

Dưới đây là đoạn mã giả lập sử dụng Apache Flink để định nghĩa các loại Window:

```java
DataStream<SensorReading> stream = env.addSource(new SensorSource());

// 1. Tumbling Window 5 phút
stream
    .keyBy(SensorReading::getId)
    .window(TumblingEventTimeWindows.of(Duration.ofMinutes(5)))
    .process(new MyProcessWindowFunction());

// 2. Sliding Window 10 phút, trượt đi 1 phút
stream
    .keyBy(SensorReading::getId)
    .window(SlidingEventTimeWindows.of(Duration.ofMinutes(10), Duration.ofMinutes(1)))
    .process(new MyProcessWindowFunction());

// 3. Session Window với gap 15 phút
stream
    .keyBy(SensorReading::getId)
    .window(EventTimeSessionWindows.withGap(Duration.ofMinutes(15)))
    .process(new MyProcessWindowFunction());
```

---

## Tổng kết

Hiểu rõ **Windowing** là một trong những bước quan trọng nhất khi làm việc với Streaming Data. Tùy thuộc vào yêu cầu nghiệp vụ (Business Requirements), bạn cần chọn đúng loại Window:
- Cần báo cáo định kỳ không chồng chéo? Dùng **Tumbling**.
- Cần chỉ số mượt mà, tính toán trượt để vẽ biểu đồ và alert? Dùng **Sliding**.
- Cần phân tích hành vi theo từng "phiên" của người dùng? Dùng **Session**.

Kèm theo đó, nắm vững **Event Time** và **Watermark** sẽ giúp hệ thống của bạn đưa ra những con số chính xác nhất kể cả khi mạng internet ngoài đời thực không hề hoàn hảo.

## Tài Liệu Tham Khảo
* [Apache Flink Windowing - Flink Documentation](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/operators/windows/)
* **Streaming Systems: The What, Where, When, and How of Large-Scale Data Processing - Tyler Akidau**
* [Kafka Streams Windowing - Confluent Documentation](https://docs.confluent.io/platform/current/streams/developer-guide/dsl-api.html#windowing)
