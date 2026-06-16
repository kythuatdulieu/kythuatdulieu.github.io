---
title: "Watermark - Dấu chuẩn thời gian"
difficulty: "Intermediate"
tags: ["streaming", "watermark", "event-time", "late-data", "flink"]
readingTime: "11 mins"
lastUpdated: 2026-06-07
seoTitle: "Watermark là gì? Xử lý Late Data trong Streaming"
metaDescription: "Tìm hiểu chi tiết về Watermark trong kiến trúc Streaming, cách nó giải quyết bài toán dữ liệu đến muộn (late data) và cân bằng giữa độ trễ và tính chính xác."
description: "Trong lập trình xử lý luồng dữ liệu (Stream Processing), một trong những thử thách lớn nhất là kiểm soát yếu tố thời gian. Không giống như xử lý theo ..."
---



Trong xử lý dữ liệu luồng (Stream Processing), một trong những thử thách lớn nhất là kiểm soát yếu tố thời gian. Trong môi trường thực tế, dữ liệu hiếm khi đến hệ thống theo đúng thứ tự mà chúng được tạo ra. Sự chậm trễ của mạng, sự cố phần cứng, hoặc các thiết bị di động mất kết nối tạm thời đều có thể khiến các sự kiện đến muộn hoặc không theo thứ tự (out-of-order). 

Để giải quyết bài toán "Khi nào thì nên chốt kết quả tính toán cho một khoảng thời gian?", các hệ thống phân tán đã đưa ra một khái niệm mạnh mẽ gọi là **Watermark** (Dấu chuẩn thời gian).

---

## 1. Bài toán: Sự chênh lệch giữa Event Time và Processing Time

Trước khi đi sâu vào Watermark, chúng ta cần phân biệt rõ hai khái niệm thời gian cốt lõi trong Streaming:

- **Event Time (Thời gian sự kiện):** Thời điểm mà sự kiện thực sự xảy ra tại thiết bị nguồn (ví dụ: người dùng nhấp vào nút "Mua hàng" lúc `12:00:05`).
- **Processing Time (Thời gian xử lý):** Thời điểm mà hệ thống xử lý luồng (như Flink, Spark Streaming) nhận được và thực sự xử lý sự kiện đó.

Trong một thế giới lý tưởng, `Event Time` và `Processing Time` là bằng nhau. Nhưng thực tế, luôn có một độ trễ nhất định. Một sự kiện sinh ra lúc `12:00:05` có thể bị kẹt mạng và chỉ đến được hệ thống xử lý lúc `12:05:00`. Sự chênh lệch này được gọi là **Event Time Skew** hay **Data Lateness**.

Nếu chúng ta gom nhóm dữ liệu (Windowing) theo `Processing Time`, kết quả phân tích sẽ bị sai lệch vì những dữ liệu thuộc về 12:00 lại bị đưa vào tính toán cho khung giờ 12:05. Do đó, các hệ thống streaming hiện đại đều khuyến khích xử lý theo `Event Time` để đảm bảo tính chính xác (Accuracy). Nhưng điều này dẫn tới một câu hỏi cốt lõi: **Làm sao hệ thống biết được khi nào thì ĐÃ NHẬN ĐỦ dữ liệu của một khung giờ Event Time để tiến hành đóng Window và xuất kết quả?**

Đây chính là lúc Watermark xuất hiện.

---

## 2. Watermark là gì?

Theo định nghĩa từ cuốn sách kinh điển *Streaming Systems* của Tyler Akidau, **Watermark** là một *khái niệm logic*, một cột mốc thời gian (timestamp) trôi theo dòng dữ liệu, đóng vai trò như một lời khẳng định từ hệ thống: 

> *"Nếu hệ thống phát ra một Watermark có giá trị là `W`, điều đó có nghĩa là hệ thống tin chắc rằng **tất cả các sự kiện có Event Time < W đã được nhận đủ**, và sẽ không còn sự kiện nào có Event Time nhỏ hơn `W` đến nữa trong tương lai."*

Watermark đóng vai trò như một chiếc "đồng hồ logic" của hệ thống xử lý theo Event Time. Nó quyết định sự tiến triển của thời gian bên trong Streaming Engine. Khi Watermark tiến qua mốc thời gian kết thúc của một Window, Window đó sẽ được kích hoạt (trigger), chốt sổ số liệu và xuất kết quả ra ngoài (ví dụ: ghi vào Database, Kafka).

### Ví dụ minh họa

Giả sử bạn đang tính tổng doanh thu mỗi 5 phút (Tumbling Window: `[12:00 - 12:05)`, `[12:05 - 12:10)`...).
1. Hệ thống nhận các sự kiện có Event Time `12:01`, `12:03`, `12:02` (không theo thứ tự). Nó tiếp tục gom nhóm vào Window `[12:00 - 12:05)`.
2. Sau đó, hệ thống nhận được một **Watermark(12:05)**.
3. Khi Watermark(12:05) đi qua, hệ thống hiểu rằng: "Sẽ không còn dữ liệu nào của khung giờ trước 12:05 đến nữa". Ngay lập tức, nó đóng Window `[12:00 - 12:05)` và xuất kết quả doanh thu của 5 phút đó.

---

## 3. Phân loại Watermark

Watermark về bản chất là một dự đoán của hệ thống về việc dữ liệu đã đến đủ hay chưa. Dựa trên tính chắc chắn của dự đoán này, Watermark được chia làm hai loại:

### 3.1. Perfect Watermark (Watermark hoàn hảo)
Đây là trường hợp hệ thống có khả năng biết chính xác 100% thời gian trễ của dữ liệu (ví dụ: đọc dữ liệu từ các file log tĩnh đã được ghi sẵn). Khi sử dụng Perfect Watermark, hệ thống không bao giờ bị sai. Mọi dữ liệu đều được tính toán một cách hoàn hảo và không bao giờ có sự kiện nào đến trễ hơn Perfect Watermark. 

Tuy nhiên, trong môi trường Streaming thời gian thực và phân tán qua mạng internet, Perfect Watermark là **điều không tưởng** (impossible), vì chúng ta không thể đoán trước được đứt cáp quang hay thiết bị mất kết nối mạng vào lúc nào.

### 3.2. Heuristic Watermark (Watermark theo kinh nghiệm)
Đây là loại phổ biến nhất trong thực tế. Hệ thống sử dụng một thuật toán để *ước lượng* (estimate) Watermark dựa trên dữ liệu đang đến. Một cách đơn giản nhất là Bounded-Out-Of-Orderness (Độ trễ tối đa cho phép):

`Watermark = Max(Event Time đã nhận được) - Fixed_Delay`

**Ví dụ:** Nếu gán `Fixed_Delay = 1 phút`. 
Khi hệ thống nhận được sự kiện có Event Time lớn nhất là `12:06`, nó sẽ phát ra một Watermark là `12:06 - 1 phút = 12:05`. Điều này ngụ ý: "Tôi giả định rằng dữ liệu chỉ trễ tối đa 1 phút. Nhìn thấy sự kiện 12:06 nghĩa là mọi sự kiện từ 12:05 trở về trước đáng lẽ đã phải đến hết rồi".

Vì là ước lượng, Heuristic Watermark có thể sai. Sự sai sót này sinh ra một loại dữ liệu gọi là **Late Data** (Dữ liệu đến quá muộn).

---

## 4. Đánh đổi giữa Độ trễ (Latency) và Tính chính xác (Accuracy)

Khi thiết kế thuật toán sinh Heuristic Watermark, Data Engineer phải đối mặt với một sự đánh đổi kinh điển:

1. **Watermark đi quá nhanh (Độ trễ thấp, Thích hợp cho Real-time):** 
   - Nếu bạn cấu hình Watermark bám sát dòng Event Time (chỉ chờ thêm vài giây), hệ thống sẽ tính toán và xuất kết quả rất nhanh.
   - **Đánh đổi:** Kết quả xuất ra có thể chưa đầy đủ (độ chính xác thấp) vì quá nhiều dữ liệu bị coi là Late Data và bị loại bỏ khỏi tính toán của Window.
2. **Watermark đi quá chậm (Tính chính xác cao, Gần giống Batch):**
   - Nếu bạn bắt hệ thống phải chờ thêm 30 phút cho chắc ăn (Delay = 30 phút), phần lớn dữ liệu bị nghẽn mạng đều có đủ thời gian để về đích.
   - **Đánh đổi:** Kết quả báo cáo theo thời gian thực bị chậm trễ 30 phút, mất đi giá trị của "Real-time processing". Đồng thời, hệ thống phải tốn nhiều RAM/State Memory để duy trì trạng thái của các Window đang mở ròng rã 30 phút mà chưa thể giải phóng.

---

## 5. Xử lý dữ liệu "Trễ hơn cả Watermark" (Late Data Handling)

Dù bạn chọn thuật toán Watermark tốt đến đâu, sự kiện "thiên nga đen" vẫn sẽ xảy ra (như một cái điện thoại di động bị mất sóng suốt 1 tiếng mới có lại wifi). Sự kiện này khi đến Streaming Engine thì Watermark đã vượt qua từ lâu và Window chứa sự kiện đó đã bị đóng. Lúc này, hệ thống Streaming có 3 cách để ứng xử với luồng Late Data này:

1. **Drop (Bỏ qua hoàn toàn):** Đơn giản nhất. Hệ thống coi sự kiện này quá cũ và vứt bỏ nó để tiết kiệm tài nguyên. Phù hợp với các hệ thống metric không yêu cầu độ chính xác tuyệt đối.
2. **Side Output / Dead Letter Queue:** Dữ liệu trễ không được đưa vào tính toán Window, nhưng thay vì bị vứt đi, nó được định tuyến (route) sang một luồng phụ riêng biệt (ví dụ: ghi ra một file S3 hoặc Kafka topic khác) để rà soát hoặc xử lý batch bổ sung vào cuối ngày.
3. **Allowed Lateness (Khoan hồng cập nhật muộn):** Hệ thống cho phép "hé cửa" một khoảng thời gian bổ sung sau khi Window đã kích hoạt. Dữ liệu đến muộn trong cửa sổ này vẫn được tính toán lại, và hệ thống sẽ xuất ra một kết quả **Update (Retraction/Upsert)** để ghi đè (overwrite) lên kết quả cũ trước đó trong cơ sở dữ liệu hạ nguồn.

---

## 6. Tổng kết

Watermark không chỉ là một tính năng cụ thể của các engine (như Flink, Spark hay Google Cloud Dataflow), mà nó là **khái niệm thiết kế cốt lõi của nền tảng Streaming hiện đại**. Hiểu và điều chỉnh được cơ chế Watermark đồng nghĩa với việc bạn đang trực tiếp kiểm soát chiếc cân thăng bằng giữa **Độ trễ của báo cáo** và **Tính chính xác của số liệu**.

Việc thiết lập Watermark hoàn hảo không tồn tại; thay vào đó, điều này đòi hỏi Data Engineer phải am hiểu sâu sắc về đặc tính dữ liệu (Data profile), khả năng của cơ sở hạ tầng mạng, cũng như yêu cầu nghiệp vụ khắt khe (SLA) từ phía người dùng cuối.

## Tài Liệu Tham Khảo
* [Apache Flink Architecture - Flink Documentation](https://nightlies.apache.org/flink/flink-docs-stable/)
* [Kafka: a Distributed Messaging System for Log Processing - LinkedIn (NetDB 2011)](http://notes.stephenholiday.com/Kafka.pdf)
* **Streaming Systems: The What, Where, When, and How of Large-Scale Data Processing - Tyler Akidau**
* [Exactly-Once Semantics in Apache Kafka - Confluent Blog](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)
* [Stateful Stream Processing with RocksDB - Flink Forward](https://flink-forward.org/)
