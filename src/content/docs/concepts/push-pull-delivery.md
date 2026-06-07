---
title: "Push vs Pull Delivery"
category: "System Architecture"
difficulty: "Intermediate"
tags: ["integration", "architecture", "push", "pull", "api"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Cơ chế giao tiếp Push và Pull trong tích hợp hệ thống dữ liệu"
metaDescription: "Tìm hiểu sự khác biệt cốt lõi giữa mô hình đẩy (Push) và mô hình kéo (Pull) trong thiết kế luồng dữ liệu, API và message broker."
---

# Push vs Pull Delivery (Cơ chế đẩy và kéo dữ liệu)

## Summary

Trong kỹ thuật tích hợp hệ thống và xây dựng luồng dữ liệu, Push (Đẩy) và Pull (Kéo) là hai mô hình nền tảng định hình cách thức thông tin được truyền từ điểm phát (Producer/Source) đến điểm nhận (Consumer/Destination). Việc quyết định ai là người "chủ động" khởi xướng việc di chuyển dữ liệu sẽ quyết định trực tiếp đến độ trễ, khả năng chịu tải, và tính bảo mật của toàn bộ kiến trúc.

---

## Definition

Sự khác biệt cốt lõi nằm ở "Động lực" (Control of flow):

* **Push Model (Mô hình Đẩy)**: Nguồn phát dữ liệu (Producer) là người giữ vai trò chủ động. Ngay khi có dữ liệu mới sinh ra, nó sẽ lập tức "đẩy" (gửi) dữ liệu đó đến thẳng hệ thống nhận. (Ví dụ: Webhooks, Push Notifications điện thoại).
* **Pull Model (Mô hình Kéo)**: Nguồn nhận dữ liệu (Consumer) là người giữ vai trò chủ động. Nguồn phát chỉ nằm im tạo dữ liệu. Hệ thống nhận sẽ định kỳ kết nối tới hệ thống phát và hỏi (poll): "Có dữ liệu mới không? Đưa cho tôi". (Ví dụ: Các job chạy ETL theo giờ, REST API GET requests).

---

## Why it exists

Không có một phương pháp truyền tải dữ liệu nào hoàn hảo cho mọi hoàn cảnh. 

Mô hình Push sinh ra để giải quyết bài toán thời gian thực (Real-time). Khi mỗi mili-giây đều quan trọng, hệ thống không thể thụ động chờ người khác hỏi thăm mới đưa dữ liệu.
Tuy nhiên, Push lại gây ra "thảm họa" khi một hệ thống lớn (phát 10.000 tin/giây) nhồi nhét dữ liệu vào một máy chủ nhận nhỏ bé. Lúc này, mô hình Pull là cứu cánh: Máy chủ nhận yếu có thể chủ động kéo dữ liệu về theo sức của nó (ví dụ 10 tin/giây) để không bị sập (Backpressure).

Hai cơ chế tồn tại song song để các Software/Data Architect lựa chọn sự cân bằng giữa **Độ trễ (Latency)** và **Sự ổn định (Stability)**.

---

## Core idea

**1. Mô hình Đẩy (Push) - Tối đa hóa tính Tức thì (Immediacy):**
- Nhà phát hành kiểm soát nhịp độ.
- Hệ thống nhận không tốn CPU để hỏi thăm liên tục.
- Yêu cầu hệ thống nhận phải luôn online (Always-on) và cấu hình mở cổng mạng (Open port/Firewall) để nhà phát hành chui vào.

**2. Mô hình Kéo (Pull) - Tối đa hóa sự An toàn và Tự chủ (Autonomy):**
- Hệ thống tiêu thụ tự điều tiết nhịp điệu (Self-pacing).
- Tránh được hiện tượng quá tải từ xa (Denial of Service tự nhiên).
- Hệ thống phát không cần biết người nhận là ai, chỉ việc trưng bày hàng hóa ra kệ.

---

## How it works

Cách hoạt động của 2 mô hình trong bối cảnh Data Engineering:

**Kịch bản: Hệ thống A (Cửa hàng) muốn đưa dữ liệu đơn hàng vào Hệ thống B (Data Warehouse).**

* **Luồng Push**: 
  - Hệ thống B (DWH) mở sẵn một HTTP Endpoint (API mở).
  - Khi Cửa hàng có đơn mới, nó tự chạy đoạn code POST HTTP request bắn trực tiếp gói JSON chứa đơn hàng đập thẳng vào Endpoint của Hệ thống B.
  - B phải xử lý ngay lúc đó. Nếu B đang bảo trì hoặc rớt mạng, A sẽ báo lỗi và có thể làm rơi mất dữ liệu đơn hàng.

* **Luồng Pull**:
  - Hệ thống A (Cửa hàng) lưu đơn hàng xuống Database hoặc REST API của mình.
  - Hệ thống B (công cụ như Fivetran, hoặc Cron Job Airflow) định cứ 5 phút 1 lần tự khởi động. Nó gọi lệnh GET tới API của Hệ thống A: "Hãy đưa tôi các đơn hàng sinh ra từ 09:00 đến 09:05". 
  - Hệ thống A đáp trả. Nếu lúc 09:05 Hệ thống B đang cúp điện, nó sẽ gọi bù vào lúc 09:10 lấy đơn hàng. Không rơi rớt dữ liệu.

---

## Architecture / Flow

```mermaid
graph LR
    subgraph PUSH MODEL
        A1[Producer (Active)] -->|Webhook / POST (Instantly)| B1[Consumer (Passive/Waiting)]
        style A1 fill:#cce5ff
    end

    subgraph PULL MODEL
        A2[Producer (Passive/Storing)] -.->|Returns Data| B2[Consumer (Active/Polling)]
        B2 -->|Cron Job: GET Request (Every 5m)| A2
        style B2 fill:#cce5ff
    end

    subgraph MESSAGE BROKER (Hybrid)
        A3[Producer] -->|Push to Topic| C[(Kafka / Broker)]
        B3[Consumer] -->|Pull/Fetch at own pace| C
    end
```

---

## Practical example

**Trong thực tế, các kiến trúc sư thường kết hợp cả hai để tạo ra Kiến trúc Hybrid thông qua Message Brokers (như Apache Kafka).**

* Tại sao Kafka kết hợp cả Push và Pull?
  * Từ Producer đến Kafka: Dùng mô hình **Push**. Hệ thống IoT cảm biến cực kỳ nhiều và liên tục. Cứ có tín hiệu là nó "nhổ" (Push) ngay vào cụm Kafka cực lớn mà không cần đợi Kafka đi xin xỏ. Tránh rớt gói tin tại biên (Edge).
  * Từ Kafka đến Consumer (Data Processing Engine): Dùng mô hình **Pull**. Engine phân tích (như Flink, Spark Streaming) sẽ chủ động "Kéo" (Poll) sự kiện từ Kafka về. Việc này giúp Consumer tự quản lý được sức mạnh CPU của nó. Nếu dữ liệu dội về quá đông, Consumer cứ thong thả kéo theo năng lực tối đa, phần còn lại Kafka giữ hộ. Điều này sinh ra một cơ chế sống còn gọi là **Kháng áp suất ngược (Backpressure handling)**.

---

## Best practices

* **Ưu tiên Pull cho Data Engineering Ingestion**: Khi xây dựng Data Lake / DWH, ưu tiên dùng các tool Pull (Batch orchestration) để kéo dữ liệu từ các ứng dụng nội bộ/SaaS. Nó tạo ra sự chủ động trong việc chạy lại (retry), quản lý checkpoint (vị trí đọc cuối cùng) và không bắt các hệ thống phần mềm phải viết thêm code để push data cho bạn.
* **Sử dụng Webhook an toàn**: Nếu cung cấp mô hình Push cho đối tác (ví dụ bên giao hàng Push trạng thái đơn vào hệ thống bạn), phải thiết kế API nhận có tính Idempotent (chịu được việc đối tác push trùng lặp 1 sự kiện nhiều lần) và đẩy thẳng nó vào queue (RabbitMQ/Kafka) ngay lập tức để giải phóng HTTP connection nhanh nhất có thể.

---

## Common mistakes

* **Polling Delay (Nhược điểm của Pull)**: Cài đặt Pull (kéo) mỗi giây một lần vào một Database có hàng chục triệu bản ghi để tìm dữ liệu mới (liên tục quét vòng lặp). Hành động này vắt kiệt I/O của Database và làm sập hệ thống (Polling Hell).
* **Quá tải Consumer (Nhược điểm của Push)**: Cấu hình hệ thống A bắn event Push thẳng vào hệ thống báo cáo B mà không có hàng đợi (Message queue) ở giữa. Ngày Black Friday, A xử lý 10,000 đơn/giây và Push tới tấp vào B. B (bình thường chỉ chịu được 500 đơn/giây) sẽ sập bộ nhớ ngay lập tức (Out of Memory - OOM).

---

## Trade-offs

### Mô hình Push
* **Ưu điểm**: Độ trễ (Latency) thấp nhất. Ít phí phạm tài nguyên phần cứng (Không có dữ liệu mới thì không có giao tiếp vô ích trên mạng).
* **Nhược điểm**: Có thể gây quá tải từ chối dịch vụ (DDoS) đối với Consumer. Khó khôi phục dữ liệu nếu Consumer bị mất mạng lúc data đang gửi.

### Mô hình Pull
* **Ưu điểm**: Consumer tự do điều khiển nhịp độ xử lý (Scalability & Backpressure). Khả năng chịu lỗi cao (Tự lấy lại data nếu sập mạng). Dễ dàng triển khai bảo mật (Consumer đi xuyên tường lửa ra ngoài xin data thì dễ hơn bắt Firewall phải mở cổng cho Nguồn Push vào).
* **Nhược điểm**: Tốn tài nguyên mạng để thực hiện các cuộc thăm dò trống (Empty polling) - gọi API nhưng không có dữ liệu mới. Luôn tồn tại độ trễ bằng thời gian chờ giữa 2 lần Pull.

---

## When to use

* **Dùng PUSH khi**: 
  - Yêu cầu Event-driven / Real-time tuyệt đối.
  - Người nhận (Consumer) có tài nguyên vô hạn hoặc cực khỏe để đỡ đòn (Serverless Functions, Kafka Broker).
  - Tích hợp các hệ thống SaaS thứ 3 (như Stripe báo thanh toán thành công).

## When not to use (Khi nào dùng PULL)

* **Dùng PULL khi**: 
  - Hệ thống nhận (Consumer) xử lý dữ liệu nặng nề và phức tạp (ETL Pipelines, ML models).
  - Dữ liệu ở dạng Lô (Batch files) khổng lồ, cần kéo định kỳ.
  - Môi trường nhận là Private Network (Mạng nội bộ kín, không thể mở endpoint ra internet để nhận Push).

---

## Related concepts

* [Event-Driven Architecture](/concepts/event-driven-architecture)
* [Real-time Architecture](/concepts/real-time-architecture)
* [Lambda Architecture](/concepts/lambda-architecture)

---

## Interview questions

### 1. Giải thích "Backpressure" (Áp suất ngược) là gì? Mô hình Push hay Pull giải quyết nó tốt hơn?
* **Người phỏng vấn muốn kiểm tra**: Tư duy kiến trúc hệ thống phân tán và khả năng xử lý quá tải.
* **Gợi ý trả lời (Strong Answer)**: Backpressure là hiện tượng hệ thống phát (Producer) gửi dữ liệu nhanh hơn tốc độ mà hệ thống nhận (Consumer) có thể xử lý. Việc này làm dồn ứ bộ nhớ ở người nhận và có thể làm crash server. Mô hình Pull giải quyết backpressure tuyệt vời và tự nhiên nhất. Vì ở mô hình Pull, Consumer có quyền tự quyết định kích thước dữ liệu lấy về (ví dụ Poll 100 bản ghi/lần). Dù Producer có sản sinh 1 triệu bản ghi, Consumer vẫn cứ túc tắc lấy 100 cái, Producer/Hệ thống đệm (Broker) phải tự lo liệu việc cất trữ 1 triệu bản ghi đó.

### 2. Tại sao Apache Kafka được thiết kế để các Consumer "Pull" dữ liệu thay vì Kafka "Push" cho chúng như RabbitMQ truyền thống?
* **Người phỏng vấn muốn kiểm tra**: Kiến thức sâu sắc về công nghệ Message Broker Streaming (Kafka).
* **Gợi ý trả lời (Strong Answer)**: Mục tiêu thiết kế của Kafka là phục vụ cùng lúc hàng ngàn Consumer thuộc mọi phòng ban khác nhau, với tốc độ phần cứng đa dạng. Nếu Kafka dùng Push, Broker sẽ phải theo dõi trạng thái, sức khỏe và tính toán nhịp đẩy (flow control) cho từng Consumer một, làm sập khả năng mở rộng (Scale) của Broker. Việc thiết kế Consumer Pull chuyển toàn bộ gánh nặng theo dõi trạng thái (Offset tracking) và nhịp độ xử lý (Pacing) cho người tiêu dùng. Kafka broker do đó được giải phóng và hoạt động cực nhẹ, trở thành cỗ máy chỉ chuyên tâm vào việc ghi đĩa siêu tốc và giữ I/O tốt.

---

## References

1. **Designing Data-Intensive Applications** - Martin Kleppmann (Phân tích sâu về luồng Message Passing).
2. **Kafka: The Definitive Guide** - Lý giải triết lý thiết kế Consumer Pull của LinkedIn.

---

## English summary

Push and Pull delivery models define the locus of control in data transmission. In a Push model, the data producer actively sends information to the consumer the moment it's available, minimizing latency but risking overwhelming the receiver if spikes occur. In a Pull model, the consumer actively queries the producer for new data at its own pace, providing natural flow control and backpressure handling at the cost of potential polling delays and higher network overhead. Modern distributed streaming architectures (like Apache Kafka) often combine both—pushing high-throughput data to an immutable log, while allowing diverse downstream consumers to pull at a sustainable speed.
