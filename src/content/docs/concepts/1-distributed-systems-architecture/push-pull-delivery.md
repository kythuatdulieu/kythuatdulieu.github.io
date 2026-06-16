---
title: "Push vs Pull Delivery"
difficulty: "Intermediate"
tags: ["integration", "architecture", "push", "pull", "api"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Cơ chế giao tiếp Push và Pull trong tích hợp hệ thống dữ liệu"
metaDescription: "Tìm hiểu sự khác biệt cốt lõi giữa mô hình đẩy (Push) và mô hình kéo (Pull) trong thiết kế luồng dữ liệu, API và message broker."
description: "Khi thiết kế một hệ thống phần mềm hoặc xây dựng các đường ống dẫn dữ liệu (data pipelines), một trong những quyết định đầu tiên mà các kỹ sư kiến trúc phải đối mặt là lựa chọn giữa mô hình giao tiếp Push hay Pull."
---



Trong thiết kế hệ thống phân tán và tích hợp dữ liệu, việc quyết định cách dữ liệu di chuyển từ hệ thống này sang hệ thống khác là một yếu tố cốt lõi. Sự lựa chọn giữa mô hình **Push (Đẩy)** và **Pull (Kéo)** ảnh hưởng mạnh mẽ đến hiệu suất, độ trễ, khả năng mở rộng và tính ổn định của hệ thống.

Trong bài viết này, chúng ta sẽ đi sâu vào phân tích cơ chế, ưu nhược điểm, và các use case điển hình của cả hai mô hình.

---

## Mô Hình Push (Push Delivery)

### Khái niệm
Mô hình Push là cơ chế trong đó bên sản xuất dữ liệu (Producer/Server) chủ động gửi (đẩy) dữ liệu đến bên tiêu thụ (Consumer/Client) ngay khi dữ liệu sẵn sàng, mà không cần chờ bên tiêu thụ yêu cầu.

### Cách hoạt động
1. Consumer thường đăng ký (subscribe) nhận thông báo hoặc cung cấp một endpoint (như Webhook URL) cho Producer.
2. Khi có sự kiện hoặc dữ liệu mới, Producer sẽ tự động thiết lập kết nối và gửi dữ liệu trực tiếp đến Consumer.

### Ưu điểm
* **Độ trễ thấp (Low Latency):** Dữ liệu được truyền đi gần như ngay lập tức (real-time) sau khi được tạo ra.
* **Tiết kiệm tài nguyên mạng:** Không lãng phí tài nguyên cho việc kiểm tra liên tục (polling) khi không có dữ liệu mới.

### Nhược điểm
* **Rủi ro quá tải (Overwhelming the Consumer):** Nếu tốc độ sản xuất dữ liệu nhanh hơn tốc độ xử lý của Consumer, Consumer có thể bị "ngập" dữ liệu, dẫn đến cạn kiệt tài nguyên (memory/CPU) và sụp đổ (crash). Đây là vấn đề do thiếu cơ chế kiểm soát áp lực ngược (Backpressure).
* **Quản lý trạng thái phức tạp:** Producer phải biết Consumer nào đang online, IP/Endpoint là gì, và xử lý các kịch bản gửi lại (retry) nếu Consumer đang offline.

### Ví dụ điển hình
* **Webhooks:** GitHub gửi HTTP POST request đến server của bạn khi có một commit mới.
* **Server-Sent Events (SSE):** Server đẩy dữ liệu liên tục tới client qua một kết nối HTTP mở.
* **RabbitMQ (Mặc định):** Broker chủ động đẩy message xuống các consumer đang kết nối.
* **Push Notifications:** Thông báo trên điện thoại thông minh (FCM/APNs).

---

## Mô Hình Pull (Pull Delivery)

### Khái niệm
Mô hình Pull là cơ chế trong đó bên tiêu thụ (Consumer/Client) chủ động gửi yêu cầu (kéo) lấy dữ liệu từ bên sản xuất (Producer/Server/Broker) khi nó sẵn sàng và có khả năng xử lý.

### Cách hoạt động
1. Producer/Broker nhận và lưu trữ dữ liệu vào một hàng đợi (queue) hoặc bộ nhớ tạm (buffer).
2. Consumer định kỳ gửi yêu cầu (polling) để hỏi xem có dữ liệu mới không.
3. Nếu có, dữ liệu sẽ được trả về cho Consumer xử lý.

### Ưu điểm
* **Kiểm soát luồng xử lý (Flow Control & Backpressure):** Consumer hoàn toàn kiểm soát được lượng dữ liệu nó muốn lấy vào mỗi thời điểm, tránh được tình trạng quá tải. Thích hợp cho các hệ thống có tốc độ xử lý chậm hoặc không đều.
* **Khả năng mở rộng (Scalability):** Dễ dàng thêm bớt Consumer mà không cần thay đổi cấu hình phía Producer. Các Consumer tự quản lý tiến độ đọc của mình.
* **Đơn giản hóa phía Producer:** Producer không cần quan tâm đến trạng thái, địa chỉ mạng hay sự tồn tại của Consumer.

### Nhược điểm
* **Độ trễ cao hơn (Higher Latency):** Dữ liệu không được truyền đi ngay lập tức mà phải chờ đến chu kỳ lấy dữ liệu tiếp theo của Consumer.
* **Lãng phí tài nguyên mạng (Empty Polling):** Nếu Consumer liên tục gọi yêu cầu (poll) trong lúc không có dữ liệu mới, nó sẽ tiêu tốn băng thông mạng và CPU của cả hai bên một cách vô ích.

### Ví dụ điển hình
* **Apache Kafka:** Kafka Consumer liên tục poll dữ liệu từ các partition của Kafka Broker.
* **Amazon SQS:** Các worker thực hiện API call `ReceiveMessage` để lấy message từ SQS.
* **REST API Polling:** Client gửi GET request mỗi 5 phút để cập nhật trạng thái hệ thống.

---

## So sánh Push và Pull

| Tiêu chí | Push Delivery | Pull Delivery |
| :--- | :--- | :--- |
| **Bên khởi xướng** | Producer / Server | Consumer / Client |
| **Độ trễ (Latency)** | Rất thấp (Real-time) | Cao hơn (phụ thuộc vào tần suất polling) |
| **Rủi ro cho Consumer** | Dễ bị quá tải (Thiếu Backpressure) | An toàn (Tự kiểm soát tốc độ) |
| **Tiêu thụ mạng** | Hiệu quả (Chỉ truyền khi có dữ liệu) | Có thể lãng phí (Nếu poll liên tục nhưng không có dữ liệu) |
| **Trạng thái kết nối** | Cần theo dõi endpoint/kết nối của Consumer | Độc lập (Stateless) |
| **Khả năng lưu trữ tạm** | Thường ít lưu trữ, đẩy ngay lập tức | Yêu cầu bộ đệm/Queue tốt ở phía Server/Broker |

---

## Các Giải Pháp Kết Hợp (Hybrid) & Tối Ưu

Trong thực tế, người ta thường kết hợp cả hai mô hình hoặc sử dụng các kỹ thuật lai để tận dụng ưu điểm của từng cơ chế:

### 1. Long Polling
Đây là biến thể của Pull nhằm giảm lãng phí tài nguyên. Client vẫn gửi request lên Server, nhưng nếu chưa có dữ liệu, Server sẽ "treo" request đó lại (trong một khoảng thời gian timeout nhất định) thay vì trả về kết quả rỗng ngay lập tức. Khi có dữ liệu mới, Server sẽ lập tức phản hồi request đó.
* *Ví dụ:* Các ứng dụng chat truyền thống sử dụng HTTP Long Polling.

### 2. WebSockets / Bi-directional Streams
Mở một kết nối TCP duy trì lâu dài, cho phép truyền dữ liệu hai chiều full-duplex. Server có thể Push dữ liệu xuống Client bất cứ lúc nào, trong khi giao thức ở tầng dưới (như HTTP/2, gRPC) có thể có sẵn cơ chế kiểm soát luồng (Flow Control) để thực hiện Backpressure.

### 3. Message Broker (Pub/Sub với Pull Consumer)
Sử dụng một Message Broker trung gian như Kafka. Producer sẽ **Push** dữ liệu vào Broker với tốc độ cực nhanh, sau đó Broker lưu trữ an toàn trên đĩa. Các Consumer sẽ **Pull** dữ liệu từ Broker theo tốc độ riêng của chúng. Đây là kiến trúc tối ưu và phổ biến nhất trong hệ thống dữ liệu quy mô lớn (Data Pipelines).

---

## Tổng Kết

* Chọn **Push** khi bạn cần phản hồi theo thời gian thực (real-time events), Consumer có khả năng đáp ứng cao, hoặc khi số lượng sự kiện thưa thớt giúp tiết kiệm chi phí network.
* Chọn **Pull** khi bạn ưu tiên sự ổn định của hệ thống (resilience), cần bảo vệ Consumer khỏi lưu lượng dữ liệu tăng đột biến (traffic spikes), và quá trình xử lý mỗi message yêu cầu nhiều thời gian/tài nguyên.

---

## Tài Liệu Tham Khảo
* [Designing Data-Intensive Applications - Martin Kleppmann (Part 2: Distributed Data)](https://dataintensive.net/)
* [CAP Theorem and PACELC - Daniel Abadi](http://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html)
* [Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)
* [Time, Clocks, and the Ordering of Events in a Distributed System - Leslie Lamport](https://lamport.azurewebsites.net/pubs/time-clocks.pdf)
* [MapReduce: Simplified Data Processing on Large Clusters - Google](https://research.google.com/archive/mapreduce.html)
