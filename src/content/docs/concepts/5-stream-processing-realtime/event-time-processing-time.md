---
title: "Thời gian sự kiện và Thời gian xử lý - Event Time vs Processing Time"
difficulty: "Intermediate"
tags: ["streaming", "event-time", "processing-time", "data-engineering", "flink"]
readingTime: "10 mins"
lastUpdated: 2026-06-16
seoTitle: "Event Time vs Processing Time trong Streaming Processing"
metaDescription: "Tìm hiểu sự khác biệt giữa Event Time (Thời gian sự kiện) và Processing Time (Thời gian xử lý) trong hệ thống Streaming, tại sao lại cần phân biệt và cách xử lý độ trễ với Watermarks."
description: "Khi xử lý dữ liệu luồng (Streaming Processing), việc hiểu rõ sự khác biệt giữa thời gian xảy ra sự kiện và thời gian hệ thống xử lý là cực kỳ quan trọng để đảm bảo tính chính xác của dữ liệu."
---



Khi chúng ta chuyển đổi từ mô hình xử lý dữ liệu theo lô (Batch Processing) sang xử lý dữ liệu luồng (Streaming Processing), một trong những khái niệm quan trọng và dễ gây nhầm lẫn nhất là **Thời gian (Time)**. Hệ thống Streaming hiện đại phân biệt rõ ràng giữa thời điểm một sự kiện thực sự xảy ra và thời điểm hệ thống bắt đầu xử lý sự kiện đó.

Khái niệm cốt lõi này thường được chia thành hai loại chính: **Event Time** (Thời gian sự kiện) và **Processing Time** (Thời gian xử lý). Một số hệ thống (như Apache Flink) còn định nghĩa thêm **Ingestion Time** (Thời gian nhập).

Việc lựa chọn sử dụng loại thời gian nào sẽ ảnh hưởng trực tiếp đến tính chính xác của kết quả, độ trễ của hệ thống và cách xử lý dữ liệu đến muộn (out-of-order data).

---

## 1. Processing Time (Thời gian xử lý)

### Định nghĩa
**Processing Time** là thời gian thực tế của đồng hồ hệ thống trên máy tính/máy chủ đang thực thi phép toán (operator) xử lý luồng dữ liệu. 

Ví dụ: Nếu một ứng dụng xử lý luồng chạy một phép toán gom nhóm (window) dữ liệu mỗi 5 phút, theo Processing Time, hệ thống sẽ gom tất cả các sự kiện mà nó nhận được trong khoảng thời gian 5 phút đó dựa trên đồng hồ cục bộ của nó, bất kể sự kiện đó thực sự xảy ra vào lúc nào ở thiết bị của người dùng.

### Ưu điểm
* **Hiệu suất cao và Độ trễ thấp:** Dữ liệu được xử lý ngay lập tức khi đến. Hệ thống không cần phải chờ đợi dữ liệu đến muộn hoặc theo dõi thời gian của từng sự kiện.
* **Đơn giản:** Dễ dàng triển khai và không yêu cầu cơ chế phức tạp như Watermarks.

### Nhược điểm
* **Tính không nhất quán (Non-deterministic):** Kết quả của ứng dụng xử lý luồng phụ thuộc vào tốc độ mạng, tốc độ nhập dữ liệu, và tải của hệ thống. Nếu bạn chạy lại cùng một luồng dữ liệu vào một thời điểm khác, bạn có thể nhận được kết quả khác nhau (do độ trễ mạng khác nhau).
* **Sai lệch thông tin:** Nếu thiết bị của người dùng bị ngắt kết nối mạng trong vài giờ và sau đó gửi lại toàn bộ sự kiện, hệ thống dùng Processing Time sẽ coi tất cả các sự kiện đó xảy ra ngay tại thời điểm nó nhận được, dẫn đến phân tích sai lệch.

### Khi nào nên sử dụng?
Sử dụng Processing Time khi tính chính xác tuyệt đối không phải là yêu cầu bắt buộc và bạn cần độ trễ thấp nhất có thể. Ví dụ: hệ thống giám sát tải của server theo thời gian thực (nếu log đến trễ vài phút thì có thể bỏ qua).

---

## 2. Event Time (Thời gian sự kiện)

### Định nghĩa
**Event Time** là thời điểm mà sự kiện thực sự xảy ra trên thiết bị hoặc hệ thống sinh ra dữ liệu (producer/client). Thời gian này thường được đính kèm vào dữ liệu dưới dạng một timestamp (dấu thời gian) khi bản ghi được tạo ra.

Ví dụ: Người dùng bấm nút "Mua hàng" trên điện thoại vào lúc 12:00:00. Điện thoại sinh ra một sự kiện với timestamp là `12:00:00`. Dù mạng bị lỗi và sự kiện này đến hệ thống xử lý lúc `12:05:00`, hệ thống vẫn biết rằng sự kiện này thuộc về thời điểm `12:00:00`.

### Ưu điểm
* **Tính chính xác tuyệt đối và Nhất quán (Deterministic):** Kết quả xử lý dựa trên thời gian thực tế xảy ra sự kiện. Nếu bạn tính tổng số lượt mua hàng trong khoảng từ 12:00 đến 12:05, bạn sẽ luôn nhận được cùng một kết quả dù xử lý dữ liệu ngay lập tức hay chạy lại từ log của ngày hôm qua.
* **Xử lý được dữ liệu đến muộn (Out-of-order data):** Cho phép hệ thống tái tạo lại đúng luồng sự kiện như khi chúng xảy ra, ngay cả khi chúng bị gửi đi lộn xộn do mạng Internet.

### Nhược điểm
* **Độ trễ cao hơn:** Hệ thống xử lý phải có một khoảng thời gian chờ (buffer) để đảm bảo thu thập đủ các sự kiện đến muộn trước khi xuất ra kết quả cuối cùng.
* **Phức tạp hơn:** Cần cấu hình và quản lý cơ chế **Watermarks** để báo hiệu cho hệ thống biết khi nào nó có thể an tâm xử lý và chốt kết quả của một khoảng thời gian.

### Khi nào nên sử dụng?
Sử dụng Event Time trong hầu hết các bài toán phân tích, tính toán tài chính, báo cáo hoặc khi tính chính xác (Correctness) là yêu cầu quan trọng nhất.

---

## 3. Ingestion Time (Thời gian nhập)

### Định nghĩa
**Ingestion Time** là thời điểm dữ liệu đi vào hệ thống stream processing (ví dụ: ngay tại nguồn (source operator) của Apache Flink). Sau khi được gán timestamp ở đầu vào, các bước xử lý tiếp theo sẽ sử dụng timestamp này thay vì đồng hồ cục bộ của từng node.

### Đặc điểm
Ingestion Time là một khái niệm nằm giữa Processing Time và Event Time.
* Khác với Event Time, nó không phụ thuộc vào thiết bị nguồn, nên không thể xử lý chính xác dữ liệu lưu trữ ngoại tuyến lâu rồi mới gửi đi.
* Khác với Processing Time, do timestamp được gán một lần ở đầu vào, kết quả của các phép toán trên các node khác nhau sẽ nhất quán hơn và không phụ thuộc vào độ trễ xử lý nội bộ của hệ thống.

*(Lưu ý: Kể từ Flink 1.12, Ingestion Time không còn được khuyến khích sử dụng nhiều, người ta thường dùng thẳng Event Time).*

---

## 4. Vấn đề dữ liệu đến muộn và theo thứ tự lộn xộn (Out-of-Order Data)

Trong môi trường thực tế (Internet, mạng di động), dữ liệu gần như không bao giờ đến hệ thống xử lý theo đúng trình tự thời gian mà nó được sinh ra do:
1. Độ trễ của mạng (Network latency).
2. Người dùng bị mất kết nối mạng và gửi lại hàng loạt sự kiện (Offline mode).
3. Sử dụng nhiều phân vùng Kafka (Kafka partitions) có tốc độ đọc ghi khác nhau.

Nếu bạn đang tính tổng doanh thu cho khung giờ `10:00 - 10:05`, nhưng một giao dịch lúc `10:04` lại đến vào lúc `10:10`, làm thế nào để hệ thống biết mà chờ đợi và không xuất báo cáo sớm, hoặc xuất báo cáo sớm rồi cập nhật lại như thế nào?

Câu trả lời cho Event Time Processing chính là **Watermarks**.

---

## 5. Watermarks trong Event Time Processing

### Khái niệm
**Watermark** (Dấu thuỷ ấn) là một khái niệm cốt lõi giúp hệ thống Streaming biết mức độ tiến triển của *Event Time*. Một Watermark mang giá trị thời gian $T$ ($W(T)$) báo hiệu cho hệ thống rằng: **"Từ thời điểm này trở đi, tôi đoán rằng sẽ không còn sự kiện nào có thời gian sinh ra (Event Time) nhỏ hơn hoặc bằng $T$ đến nữa."**

Khi hệ thống nhận được $W(T)$, nó sẽ chốt kết quả (trigger computation) cho tất cả các Window (cửa sổ tính toán) có thời gian kết thúc nhỏ hơn hoặc bằng $T$.

### Cách hoạt động
Nếu một Window đang đếm số lượng người dùng truy cập từ `12:00` đến `12:05`. Window này sẽ chỉ được tính toán và đóng lại khi hệ thống nhận được một Watermark có giá trị >= `12:05`.

### Allowed Lateness (Độ trễ cho phép)
Ngay cả khi có Watermark, thực tế vẫn có những sự kiện đến *cực kỳ muộn* (đến sau khi Watermark báo là đã kết thúc). Hầu hết các Framework Streaming (như Apache Flink, Google Cloud Dataflow) cung cấp cơ chế **Allowed Lateness**. 
Bạn có thể cấu hình cho phép dữ liệu trễ thêm một khoảng thời gian nhất định (ví dụ: 10 phút sau Watermark). Hệ thống sẽ giữ trạng thái (state) lại thêm 10 phút. Nếu có dữ liệu đến trong khoảng này, hệ thống sẽ tự động phát sinh kết quả cập nhật (update result). Qua khoảng allowed lateness, dữ liệu muộn có thể bị ghi ra một luồng riêng (Side Output) hoặc bị huỷ bỏ (Drop).

---

## 6. So sánh tổng quan (Tóm tắt)

| Tiêu chí | Processing Time | Event Time |
| :--- | :--- | :--- |
| **Nguồn thời gian** | Đồng hồ máy chủ xử lý dữ liệu. | Dấu thời gian (timestamp) tạo bởi thiết bị sinh sự kiện. |
| **Tính chính xác** | Thấp, thay đổi tuỳ thời điểm chạy (Non-deterministic). | Cao, luôn giống nhau kể cả khi chạy lại (Deterministic). |
| **Độ trễ xử lý (Latency)** | Cực thấp (Xử lý ngay lập tức). | Cao hơn (Phải chờ qua Watermark). |
| **Thứ tự sự kiện** | Theo thứ tự máy chủ nhận được. | Theo đúng thứ tự sự kiện đã xảy ra. |
| **Độ phức tạp** | Rất đơn giản. | Phức tạp (Cần quản lý Watermark, State, Allowed Lateness). |
| **Xử lý trễ (Out-of-order)** | Không thể (hoặc xử lý sai). | Xử lý rất tốt. |

---

## Kết luận

Việc lựa chọn giữa **Event Time** và **Processing Time** phụ thuộc hoàn toàn vào bài toán nghiệp vụ của bạn:

* Chọn **Event Time** cho các bài toán phân tích chính xác, báo cáo tài chính, phát hiện gian lận (Fraud Detection), hoặc khi bạn cần khả năng re-process (chạy lại) dữ liệu quá khứ mà vẫn thu được kết quả đúng.
* Chọn **Processing Time** cho các cảnh báo giám sát hệ thống tức thời (System Monitoring/Alerting) nơi một vài bản ghi sai sót hoặc mất mát không ảnh hưởng nhiều nhưng độ trễ buộc phải là tính bằng mili-giây.

Trong thực tế, **Event Time** đang trở thành tiêu chuẩn mặc định của hầu hết các hệ thống Xử lý luồng quy mô lớn hiện đại vì tính nhất quán và mạnh mẽ của nó.

---

## Tài Liệu Tham Khảo
* [Apache Flink Architecture - Flink Documentation](https://nightlies.apache.org/flink/flink-docs-stable/)
* [Kafka: a Distributed Messaging System for Log Processing - LinkedIn (NetDB 2011)](http://notes.stephenholiday.com/Kafka.pdf)
* **Streaming Systems: The What, Where, When, and How of Large-Scale Data Processing - Tyler Akidau**
* [Exactly-Once Semantics in Apache Kafka - Confluent Blog](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)
* [Stateful Stream Processing with RocksDB - Flink Forward](https://flink-forward.org/)
