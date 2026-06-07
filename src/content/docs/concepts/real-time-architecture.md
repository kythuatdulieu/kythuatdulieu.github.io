---
title: "Real-time Architecture"
category: "System Architecture"
difficulty: "Advanced"
tags: ["architecture", "streaming", "real-time", "kafka", "flink"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Kiến trúc hệ thống dữ liệu Thời gian thực (Real-time Architecture)"
metaDescription: "Tìm hiểu kiến trúc dữ liệu thời gian thực, tầm quan trọng, các công nghệ như Kafka, Flink, CSDL In-memory và cách phân biệt với kiến trúc Batch truyền thống."
---

# Real-time Architecture (Kiến trúc Thời gian thực)

## Summary

Real-time Architecture (Kiến trúc thời gian thực) là một thiết kế hệ thống dữ liệu tập trung vào việc thu thập, xử lý, tính toán và phân phối luồng dữ liệu (data streaming) với độ trễ (latency) cực thấp, thường là từ mili-giây (milliseconds) đến vài giây. Mục tiêu của kiến trúc này là cung cấp thông tin và phản hồi ngay lập tức khi một sự kiện kinh doanh vừa phát sinh để hỗ trợ ra quyết định hoặc điều khiển hệ thống tự động.

---

## Definition

**Real-time Architecture** chuyển dịch mô hình xử lý dữ liệu từ việc lưu trữ trước rồi xử lý sau (Batch processing) sang mô hình dữ liệu liên tục chuyển động (Data in motion).

Mọi thay đổi trên hệ thống nguồn (người dùng click vào web, cảm biến IoT thay đổi nhiệt độ, giao dịch thanh toán quẹt thẻ) được ghi nhận thành một *Event (Sự kiện)*. Các sự kiện này ngay lập tức được đẩy vào một ống dẫn thông điệp (Message Broker) và được xử lý tính toán trong khi đang di chuyển (In-flight processing) trước khi cập bến cơ sở dữ liệu để phục vụ cho các ứng dụng trực tiếp hoặc các bảng điều khiển trực quan.

---

## Why it exists

Đối với nhiều doanh nghiệp số, thời gian dữ liệu sinh ra tỷ lệ nghịch với giá trị của dữ liệu. 
Dữ liệu của 1 giờ trước là quá trễ để:
* Phát hiện và chặn một giao dịch quẹt thẻ tín dụng bị đánh cắp (Fraud Detection).
* Gợi ý món hàng giảm giá flash-sale khi khách hàng chuẩn bị rời trang web (Dynamic Recommendation).
* Điều hướng xe tự hành hoặc tối ưu hóa lộ trình tài xế công nghệ (Ride-hailing apps như Uber, Grab).

Kiến trúc xử lý lô (Batch) như Data Warehouse truyền thống hoặc Hadoop không thể đáp ứng được các kịch bản sử dụng (use cases) đòi hỏi phản hồi tính bằng mili-giây. Real-time Architecture ra đời để bắt kịp giá trị thời gian (time-value) của dữ liệu.

---

## Core idea

Ý tưởng thiết kế cốt lõi của Real-time bao gồm:
* **Decoupling (Sự tách rời)**: Hệ thống sinh ra sự kiện (Producers) và hệ thống xử lý (Consumers) không được kết nối trực tiếp, mà trao đổi thông qua một hệ thống hàng đợi nhật ký chịu lỗi (Distributed Log).
* **Stateful Stream Processing**: Khả năng tính toán trực tiếp trên các dòng dữ liệu vô tận. Các động cơ (Engine) duy trì trạng thái bộ nhớ đệm nội bộ để đếm, nhóm (windowing), và tham chiếu dữ liệu mà không cần truy xuất cơ sở dữ liệu vật lý nhiều lần.
* **Push over Pull**: Thay vì hệ thống đích chủ động hỏi định kỳ xem "Có data mới không?" (Pull), hệ thống xử lý sẽ chủ động đẩy (Push) dữ liệu tới ứng dụng ngay khi kết quả được tính xong.

---

## How it works

Kiến trúc chuẩn của hệ thống Real-time Data thường chia làm 3-4 thành phần công nghệ:

1. **Ingestion Layer (Thu thập liên tục)**: 
   - Dùng các công cụ Change Data Capture (CDC) như Debezium để bắt các sự thay đổi (INSERT/UPDATE/DELETE) ở tầng CSDL nguồn. Hoặc SDK gửi trực tiếp dữ liệu sự kiện (Clickstream).
2. **Message/Event Broker (Xương sống luồng dữ liệu)**: 
   - **Apache Kafka**, Amazon Kinesis hoặc Google Pub/Sub. Hệ thống này tiếp nhận hàng triệu sự kiện một giây, sắp xếp thứ tự và lưu giữ chúng an toàn trên bộ nhớ đệm phân tán để sẵn sàng cho Consumer lấy.
3. **Stream Processing Engine (Xử lý thời gian thực)**: 
   - **Apache Flink**, Spark Streaming, ksqlDB. Engine này tiêu thụ dữ liệu từ Kafka, thực hiện các logic như: Lọc dữ liệu, làm giàu (ví dụ: JOIN sự kiện với dữ liệu tĩnh trong Redis), gom nhóm theo cửa sổ thời gian (Windowing).
4. **Real-time Serving & Analytics (Kho lưu trữ đáp ứng nhanh)**: 
   - Kết quả xuất ra được đẩy thẳng qua WebSockets lên màn hình người dùng, hoặc ghi vào một CSDL In-memory/OLAP hỗ trợ chỉ mục cao để báo cáo trực tiếp như Redis, Apache Druid, ClickHouse, Apache Pinot.

---

## Architecture / Flow

```mermaid
graph TD
    subgraph Data Sources / Producers
        A[Mobile App SDK (Clickstream)]
        B[IoT Sensors (Telemetry)]
        C[OLTP DB (CDC via Debezium)]
    end

    subgraph Streaming Backbone
        D[(Distributed Event Log \n e.g., Apache Kafka / Kinesis)]
    end

    subgraph Stream Processing Layer
        E[Stream Engine \n e.g., Apache Flink / Spark Streaming]
        F[(Fast Key-Value Store \n e.g., Redis for Enriching)]
    end

    subgraph Real-time Analytics & Serving
        G[(Real-time OLAP \n e.g., Apache Druid / ClickHouse)]
        H[Live Alerting System]
    end

    A -->|Events| D
    B -->|Events| D
    C -->|Events| D
    
    D --> E
    E <-->|Lookups/Joins| F
    
    E -->|Processed Streams| G
    E -->|Critical Alerts| H
    
    G --> I[Live Dashboards]
```

---

## Practical example

Một ứng dụng Ngân hàng cần cảnh báo giao dịch gian lận.

1. Khách hàng quẹt thẻ tín dụng tại một máy POS. CSDL giao dịch thay đổi. **Debezium (CDC)** phát hiện sự kiện này, lập tức đẩy message `TransactionEvent(Card=123, Amount=5000, Location=Hanoi)` vào Kafka topic `card_transactions`.
2. Ứng dụng **Apache Flink** đang chạy lắng nghe topic này.
3. Flink nhận sự kiện, tra cứu tức thì thông tin thẻ 123 trên **Redis**. Flink nhận thấy: 5 phút trước thẻ này vừa quẹt mua hàng vật lý ở TP.HCM.
4. Flink đánh giá luật (Rule): Một người không thể di chuyển từ TP.HCM ra Hà Nội trong 5 phút. Xác suất rủi ro là 99%.
5. Flink lập tức phát một sự kiện `FraudAlert(Card=123)` vào một Kafka topic khác, để hệ thống bảo mật tự động khóa thẻ và gửi SMS cho khách hàng.
Toàn bộ quá trình diễn ra trong 200 mili-giây.

---

## Best practices

* **Thiết kế Idempotent (Đảm bảo chỉ xử lý 1 lần)**: Lỗi mạng ở hạ tầng phân tán luôn xảy ra. Hệ thống xử lý phải có cơ chế bỏ qua dữ liệu bị trùng lặp khi Broker gửi lại sự kiện (Exactly-once semantics).
* **Xử lý sự kiện đến muộn (Late Data Handling)**: Dữ liệu di động có thể mất mạng và được đẩy lên trễ vài giờ. Hệ thống thời gian thực cần sử dụng khái niệm **Event Time** (thời gian thật tạo ra) thay vì Processing Time (thời gian hệ thống nhận được) và Watermarks để kết sổ dữ liệu trễ hợp lý.
* **Tách riêng CSDL ghi và đọc (CQRS)**: Không lưu trữ kết quả phân tích thời gian thực ngược về OLTP Database đang phục vụ ứng dụng vì sẽ gây deadlocks hoặc quá tải đọc. Luôn sử dụng một kiến trúc truy vấn chuyên biệt (như Elasticsearch, Druid).

---

## Common mistakes

* **Micro-batching giả danh Real-time**: Cấu hình pipeline định kỳ query lấy dữ liệu (Pull) mỗi 1 phút một lần. Đây không phải thời gian thực, vì nó không phản ứng theo sự kiện (Event-driven). Nó sẽ không tối ưu tải hệ thống khi không có dữ liệu (vẫn truy vấn lãng phí) và khi dữ liệu tăng vọt (không gánh nổi tải batch).
* **Tính toán quá nặng trong Stream**: Cố gắng thực hiện các phép JOIN 5-7 bảng với hàng triệu dòng lịch sử bên trong Stream Engine. Lớp bộ nhớ nội tại (State) của Flink sẽ phình to không giới hạn, gây Crash/OOM. Các logic phức tạp lịch sử lớn vẫn nên nhường cho Batch (Kiến trúc Lambda).

---

## Trade-offs

### Ưu điểm
* **Trải nghiệm người dùng vô song**: Các tính năng cập nhật tức thì (Live updates), tương tác nhanh mang lại giá trị nghiệp vụ tối đa.
* **Phân tải dữ liệu (Load Smoothing)**: Dữ liệu được xử lý liên tục 24/7 theo từng sự kiện (vài KB), thay vì bị dồn lại thành một khối khổng lồ (hàng trăm GB) và xử lý chật vật vào ban đêm.

### Nhược điểm
* **Độ phức tạp lập trình rất cao**: Tư duy lập trình luồng vô tận (Streaming mentality) khó gấp nhiều lần so với lập trình bảng tĩnh (SQL tables). Rất khó debug.
* **Chi phí bảo trì / Hạ tầng**: Hệ thống luôn phải trực chiến (Always-on) 100% tài nguyên CPU kể cả lúc thấp điểm. Việc duy trì một cụm Kafka và Flink đòi hỏi những Kỹ sư cực kỳ dày dạn (Kỹ sư hệ thống phân tán).

---

## When to use

* Fraud detection (Phát hiện gian lận), Cybersecurity threat detection (Phát hiện tấn công an ninh mạng).
* Ứng dụng IoT giám sát nhà máy, sức khỏe máy móc, telemetry xe thông minh.
* Real-time recommendation (Gợi ý e-commerce tùy biến theo hành vi khách trong vòng 1-2 phút).
* Dynamic Pricing (Định giá linh hoạt trên ứng dụng gọi xe, đặt phòng).

## When not to use

* Nhu cầu chỉ là báo cáo định kỳ tuần/tháng cho các phòng ban (Tài chính, Kế toán).
* Không có kỹ sư chuyên môn (DevOps/Data Engineers giỏi) để đối phó với hệ thống Message Broker sụp đổ do tràn bộ nhớ hoặc Data Skew.
* Ngân sách hạ tầng mỏng (Batch qua Snowflake/BigQuery rẻ hơn).

---

## Related concepts

* [Event-Driven Architecture](/concepts/event-driven-architecture)
* [Kappa Architecture](/concepts/kappa-architecture)
* [Lambda Architecture](/concepts/lambda-architecture)

---

## Interview questions

### 1. Windowing trong xử lý stream là gì? Phân biệt Tumbling Window và Sliding Window.
* **Người phỏng vấn muốn kiểm tra**: Kiến thức nền tảng bắt buộc của xử lý luồng dữ liệu liên tục.
* **Gợi ý trả lời (Strong Answer)**: Vì dòng sự kiện (stream) không bao giờ kết thúc, ta không thể `SUM()` hay `COUNT()` nó được. Ta phải chặt nó ra thành các khúc thời gian hữu hạn, gọi là Window. 
  * Tumbling Window (Cửa sổ nhào lộn): Cắt thời gian thành các khối cố định, không xếp chồng lên nhau (ví dụ: [00:00-00:05], [00:05-00:10]). Sự kiện rơi vào đúng 1 khối duy nhất.
  * Sliding Window (Cửa sổ trượt): Cửa sổ có độ dài cố định nhưng sẽ "trượt" lên một bước nhẩy ngắn hơn (ví dụ: Cửa sổ dài 5 phút, nhưng cập nhật tính toán mỗi 1 phút). Sự kiện có thể thuộc về nhiều khối cửa sổ trùng nhau (overlap). Rất hữu ích cho biểu đồ đường di chuyển trung bình (Moving Average).

### 2. Sự khác biệt giữa CDC (Change Data Capture) và Batch ETL Query-based? Tại sao kiến trúc Real-time luôn chuộng CDC?
* **Người phỏng vấn muốn kiểm tra**: Kỹ thuật Ingestion từ CSDL nghiệp vụ vào Kafka.
* **Gợi ý trả lời (Strong Answer)**: Trong Batch Query-based, hệ thống phải chạy câu lệnh `SELECT * FROM table WHERE updated_at > X` liên tục vào DB, gây hao tốn tài nguyên DB rất lớn và dễ bỏ lọt sự kiện DELETE phần cứng. CDC (như Debezium) hoạt động bằng cách đọc thẳng vào file Write-Ahead Log (WAL / Binlog) của Database. Nó có độ trễ bằng 0, không ảnh hưởng (zero-impact) tới tải truy vấn của DB nghiệp vụ, và bắt được 100% mọi sự thay đổi gồm cả câu lệnh DELETE. Vì vậy CDC là nguồn cấp liệu chuẩn của Real-time Architecture.

---

## References

1. **Streaming Systems** - Tyler Akidau (Tác giả khái niệm Apache Beam). Cuốn sách xuất sắc nhất thế giới về khái niệm Stream Processing.
2. **Designing Event-Driven Systems** - Ben Stopford (Confluent).
3. **Kafka: The Definitive Guide** - Gwen Shapira, Todd Palino.

---

## English summary

Real-time Architecture shifts data processing from a static, scheduled batch paradigm to continuous, event-driven streaming. Utilizing distributed message brokers (like Apache Kafka) and stateful stream processing engines (like Apache Flink), the architecture ingests, processes, and acts upon data points in milliseconds. It is crucial for use cases where the time-value of data decays rapidly—such as fraud detection, dynamic pricing, and live recommendations—though it significantly increases the complexity of infrastructure management, state recovery, and programming models (e.g., handling event time vs. processing time).
