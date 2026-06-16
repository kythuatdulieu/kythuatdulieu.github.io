---
title: "Apache Kafka"
difficulty: "Intermediate"
tags: ["apache-kafka", "message-broker", "pub-sub", "event-streaming"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Apache Kafka là gì? Nền tảng phân phối Event Streaming phân tán"
metaDescription: "Giới thiệu cốt lõi về Apache Kafka: kiến trúc Pub/Sub phân tán, ưu điểm bền bỉ so với RabbitMQ và vai trò xương sống trong hệ thống Data Engineering hiện đại."
description: "Trong các hệ thống phần mềm lớn, dữ liệu không chỉ nằm im một chỗ mà cần phải di chuyển liên tục giữa các ứng dụng: dữ liệu nhấp chuột của người dùng ..."
---



Apache Kafka là hệ thống xương sống (Backbone) phân tán, đóng vai trò như một bộ đệm siêu tốc (High-throughput Message Broker) cho hệ thống Streaming. Nó tách biệt hoàn toàn Producer (kẻ sản xuất log) và Consumer (kẻ tiêu thụ log), đảm bảo dữ liệu không bị mất ngay cả khi hệ thống sập.

Trong các hệ thống phần mềm lớn, dữ liệu không chỉ nằm im một chỗ mà cần phải di chuyển liên tục giữa các ứng dụng: dữ liệu nhấp chuột của người dùng, log hệ thống, thông tin giao dịch mua hàng, v.v. Apache Kafka ra đời như một giải pháp nền tảng cho phép vận chuyển, lưu trữ và xử lý hàng triệu sự kiện (events) mỗi giây một cách bền bỉ và theo thời gian thực.

## 1. Lịch sử và Bối cảnh ra đời

Kafka ban đầu được phát triển bởi LinkedIn vào năm 2011 để giải quyết vấn đề xử lý khối lượng khổng lồ dữ liệu tracking của người dùng và log hệ thống mà các giải pháp Message Queue truyền thống (như ActiveMQ hay RabbitMQ) không thể đáp ứng được về mặt hiệu suất và khả năng mở rộng. 

Tên gọi "Kafka" được đặt theo tên của nhà văn Franz Kafka vì đây là một hệ thống được thiết kế chủ yếu tối ưu cho việc "viết" (write-heavy). Năm 2012, Kafka được đóng góp cho Apache Software Foundation và nhanh chóng trở thành một dự án Top-Level mã nguồn mở thành công nhất trong thế giới Big Data.

## 2. Các khái niệm cốt lõi trong Kafka

Để hiểu cách Kafka hoạt động, chúng ta cần nắm vững các thành phần cấu trúc cơ bản của nó.

### 2.1. Event / Message
Sự kiện (Event) hay tin nhắn (Message) là đơn vị dữ liệu cơ bản trong Kafka. Nó đại diện cho một "sự kiện đã xảy ra" ở thế giới thực. Mỗi sự kiện thường bao gồm:
- **Key (khóa):** Tùy chọn, dùng để định tuyến message vào các partition cụ thể. Nếu cùng Key, dữ liệu sẽ luôn đi vào cùng một Partition.
- **Value (giá trị):** Nội dung thực sự của dữ liệu (thường ở định dạng JSON, Avro, Protobuf, hoặc String thô).
- **Timestamp:** Thời gian sự kiện được tạo ra hoặc được ghi vào Kafka.
- **Headers:** Tùy chọn, chứa các metadata bổ sung, tương tự như HTTP Header.

### 2.2. Topic và Partition
- **Topic:** Tương tự như một thư mục (folder) trong hệ điều hành hoặc một bảng (table) trong database. Các event cùng loại sẽ được xuất bản (publish) vào chung một Topic. Hệ thống có thể chứa hàng ngàn Topic.
- **Partition:** Để hệ thống có thể mở rộng (scale-out) trên nhiều server, một Topic được chia nhỏ thành nhiều Partition. Mỗi Partition là một chuỗi các message có thứ tự, không thể thay đổi (immutable) và liên tục được ghi nối thêm vào cuối (append-only log).
  - Dữ liệu trong một partition được đảm bảo thứ tự tuyệt đối.
  - Mỗi message trong partition được gắn một số ID tuần tự tăng dần gọi là **Offset**.

### 2.3. Producer, Consumer và Consumer Group
- **Producer:** Ứng dụng xuất bản (write) các sự kiện vào một hoặc nhiều Topic. Producer chủ động quyết định message nào thuộc về partition nào (thường dựa trên mã băm Hash của Key hoặc thuật toán Round-robin để cân bằng tải).
- **Consumer:** Ứng dụng đăng ký (read) để đọc các sự kiện từ một hoặc nhiều Topic. Khác với nhiều hệ thống queue kiểu push (đẩy), Kafka Consumer sử dụng mô hình **pull** (kéo), cho phép nó chủ động kiểm soát tốc độ tiêu thụ dữ liệu, tránh tình trạng bị "quá tải" (overwhelmed) khi dữ liệu về quá nhanh.
- **Consumer Group:** Một tập hợp các Consumer cùng làm một nhiệm vụ logic. Kafka chia sẻ công việc đọc dữ liệu trong một topic giữa các consumer trong cùng một group. Mỗi partition trong topic chỉ có thể được đọc bởi tối đa **một** consumer trong một consumer group tại bất kỳ thời điểm nào. Điều này đảm bảo xử lý song song, tránh việc xử lý trùng lặp và mang lại khả năng mở rộng/chịu lỗi linh hoạt.

### 2.4. Broker và Cluster
- **Broker:** Một server đơn lẻ chạy Kafka. Một broker nhận các message từ producer, gán offset cho chúng, và lưu trữ xuống ổ đĩa cứng (disk).
- **Cluster:** Một nhóm nhiều broker hoạt động cùng nhau tạo thành một Kafka Cluster. Kafka phân tán các partition của một topic trên nhiều broker để cân bằng tải và cấu hình dự phòng dữ liệu (replication) nhằm phòng chống lỗi phần cứng.

### 2.5. ZooKeeper và KRaft
- Trong quá khứ, Kafka phụ thuộc vào **Apache ZooKeeper** để quản lý thông tin trạng thái cụm (metadata), chẳng hạn như theo dõi broker nào đang sống, ai là Leader của partition nào, hay lưu trữ danh sách các topic.
- Bắt đầu từ bản phát hành Kafka 2.8.0, một giao thức đồng thuận nội bộ mới gọi là **Kafka Raft (KRaft)** được giới thiệu để dần thay thế và loại bỏ Zookeeper. Điều này giúp đơn giản hóa kiến trúc, giúp Kafka tự quản lý metadata, tăng tốc độ khôi phục khi sập và mở rộng quy mô tới hàng triệu partition.

## 3. Kiến trúc lưu trữ và tính khả dụng cao (High Availability)

Sức mạnh lớn nhất của Kafka nằm ở khả năng hoạt động ổn định và không làm mất dữ liệu ngay cả khi hệ thống mạng hoặc server gặp sự cố.

### Cơ chế Replication (Sao chép dữ liệu)
Mỗi partition trong Kafka thường được cấu hình một hệ số sao chép (Replication Factor), ví dụ là 3. Điều này có nghĩa là mọi message của partition đó sẽ được lưu ở 3 broker khác nhau.
- **Leader:** Một broker duy nhất đóng vai trò là Leader của partition. Mọi thao tác Ghi (Produce) và Đọc (Consume) mặc định đều được thực hiện trên Leader này.
- **Follower:** Các bản sao còn lại trên các broker khác đóng vai trò là Follower. Chúng liên tục "kéo" (fetch) dữ liệu từ Leader một cách thụ động để giữ cho dữ liệu đồng bộ.
- **ISR (In-Sync Replicas):** Danh sách các Follower đã theo kịp dữ liệu với Leader. Nếu broker chứa Leader bất ngờ bị sập, một Follower nằm trong danh sách ISR sẽ lập tức được hệ thống (Controller) tự động đưa lên làm Leader mới để duy trì sự liên tục mà không gây mất mát dữ liệu.

### Log Retention (Chính sách lưu giữ)
Trái với các Message Queue truyền thống (thường xóa bản ghi ngay sau khi nó được gửi đến người nhận), Kafka không xóa dữ liệu ngay lập tức. Dữ liệu được lưu trữ bền vững trên đĩa cứng dựa theo 2 tiêu chí chính:
- **Theo thời gian (Time-based):** Ví dụ giữ lại toàn bộ event trong 7 ngày hoặc 30 ngày.
- **Theo dung lượng (Size-based):** Ví dụ giữ lại tối đa 100GB dữ liệu cho mỗi partition. Khi vượt quá, dữ liệu cũ nhất sẽ bị xoá đi.

Việc dữ liệu vẫn tồn tại trên ổ đĩa cho phép các Consumer dễ dàng "tua lại" (replay) dữ liệu từ một mốc thời gian trong quá khứ để chạy lại thuật toán phân tích, nạp lại data cho database khi bị lỗi, hoặc cho phép các ứng dụng mới hoàn toàn đọc toàn bộ lịch sử sự kiện từ ban đầu.

## 4. Hệ sinh thái Apache Kafka

Kafka hiện tại đã tiến hóa từ một "message broker" đơn thuần thành một Nền tảng luồng sự kiện phân tán (Event Streaming Platform) toàn diện, bao gồm một hệ sinh thái mạnh mẽ xung quanh:

- **Kafka Connect:** Một framework tiện ích giúp kết nối và tích hợp hệ thống lưu trữ bên ngoài với Kafka một cách dễ dàng mà không cần phải tự viết code. 
  - *Source Connector:* Liên tục kéo dữ liệu từ hệ thống nguồn (như MySQL, Postgres qua Debezium CDC) vào Kafka.
  - *Sink Connector:* Đẩy dữ liệu đã xử lý từ Kafka vào Data Warehouse (Snowflake, BigQuery), ElasticSearch hoặc Amazon S3.
- **Kafka Streams:** Một thư viện nhẹ (viết bằng Java/Scala) cho phép bạn xây dựng các ứng dụng stream processing chạy độc lập và xử lý theo thời gian thực (như lọc, biến đổi, gom nhóm (aggregation), hoặc join nhiều luồng với nhau) ngay trên tập dữ liệu sự kiện.
- **ksqlDB:** Nền tảng cơ sở dữ liệu xử lý luồng (streaming database) mạnh mẽ được phát triển bởi Confluent. Nó cho phép bạn trực tiếp sử dụng ngôn ngữ truy vấn **SQL** thân thuộc để phân tích dữ liệu luồng thay vì phải viết code Java dài dòng như Kafka Streams.
- **Schema Registry:** Dịch vụ dùng để quản lý các siêu dữ liệu cấu trúc (Schema) của dòng tin nhắn như Avro, Protobuf hoặc JSON Schema. Nó hoạt động như một hệ thống kiểm soát chất lượng, đảm bảo Producer không vô tình thay đổi cấu trúc dữ liệu gửi đi, làm gián đoạn và phá vỡ Consumer ở đầu cuối.

## 5. Ưu điểm và Thách thức

### Ưu điểm
- **Hiệu năng cực cao (High Throughput & Low Latency):** Kafka có thể xử lý hàng triệu message mỗi giây với độ trễ chỉ vài milli-giây. Nó tận dụng tối đa cơ chế "Ghi tuần tự" (sequential I/O) trên ổ đĩa cứng và công nghệ **Zero-Copy** của hệ điều hành Linux để truyền tải dữ liệu trực tiếp vào buffer mạng, bỏ qua các bước sao chép qua memory không cần thiết.
- **Khả năng mở rộng ngang (Horizontal Scalability):** Việc tăng băng thông hoặc dung lượng đơn giản chỉ bằng cách bổ sung thêm broker vào cluster hiện tại, người dùng sẽ không cảm nhận được thời gian ngưng trệ.
- **Độ bền bỉ & Chịu lỗi cao (Durability & Fault-tolerance):** Sự kết hợp giữa bộ lưu trữ ổ đĩa (disk-based) bền vững thay vì lưu trên RAM cùng hệ thống Replication mạnh mẽ giúp Kafka gần như "bất khả xâm phạm" trước các sự cố sập server hoặc lỗi ổ cứng.
- **Phân tách hoàn toàn (Decoupling):** Kafka trở thành điểm trung chuyển dữ liệu trung tâm, tách rời rủi ro và áp lực tải giữa những hệ thống sản sinh ra sự kiện (producer) và những nhóm hệ thống phân tích, lưu trữ phía sau (consumer).

### Thách thức trong vận hành
- **Độ phức tạp cao:** Vận hành và bảo trì một Kafka Cluster cần nhiều nỗ lực về DevOps/DataOps. Thiết lập security, quản lý cân bằng tải (rebalance), quản lý phiên bản với ZooKeeper/KRaft không hề dễ dàng.
- **Thiếu các tính năng Routing chi tiết:** Kafka đơn giản hóa cơ chế định tuyến (routing) bằng Topic. Nó không có những rule routing phức tạp (kiểu wildcard patterns dựa trên header) như RabbitMQ đang có.
- **Giải quyết vấn đề Consumer Lag:** Cần liên tục monitor hệ thống để phát hiện hiện tượng "Consumer Lag" (Consumer xử lý dữ liệu chậm hơn quá nhiều so với tốc độ Producer đưa vào), và thiết kế số lượng Partition/Consumer hợp lý ngay từ giai đoạn kiến trúc ban đầu.

## 6. So sánh Kafka với Message Queue truyền thống

Nhiều người thường phân vân giữa Kafka và các Message Queue như RabbitMQ, ActiveMQ, hay Amazon SQS. Dưới đây là những khác biệt căn bản:

| Tiêu chí | Apache Kafka | RabbitMQ / ActiveMQ |
| :--- | :--- | :--- |
| **Bản chất kiến trúc** | Distributed Event Log (Nhật ký sự kiện phân tán), Append-only | Message Queue tập trung, Broker phân phối (Smart broker, dumb consumer) |
| **Giao nhận dữ liệu** | Consumer tự giác **Pull** (kéo) dữ liệu theo năng lực | Broker **Push** (đẩy) dữ liệu trực tiếp cho Consumer để giải phóng queue |
| **Lưu trữ dữ liệu** | Lưu trên ổ đĩa cứng bền vững, đọc xong vẫn được **giữ lại** (Retention) | Lưu trữ chính trên Memory, dữ liệu **bị xóa** ngay sau khi Consumer xác nhận (ACK) |
| **Thứ tự Message** | Đảm bảo tuyệt đối (Strict ordering) bên trong từng Partition | Có thể đảm bảo với queue đơn, nhưng mất thứ tự nếu có nhiều consumer |
| **Khả năng định tuyến** | Đơn giản, dựa trên Topic hoặc Key | Linh hoạt và đa dạng: Direct, Topic, Fanout (Exchange, Binding) |
| **Mục đích phù hợp** | Stream Processing, Big Data Pipeline, CDC, Event Sourcing, Phân tích Log. | Microservices Communication truyền thống, Task Queue, Lập lịch email/thông báo. |

## 7. Các Use Case phổ biến nhất của Kafka

1. **Log Aggregation (Gom cụm log):** Thu thập log hoạt động, log hệ thống từ hàng ngàn máy chủ, vi dịch vụ tập trung về một Topic. Từ đó xuất dữ liệu vào ElasticSearch phục vụ cho truy vết (tracing) hoặc phân tích sự cố.
2. **Website Activity Tracking:** Ghi nhận chuỗi hành vi real-time như người dùng nhấp chuột, cuộn trang, xem sản phẩm, lượt tìm kiếm để phục vụ phân tích hành vi và tạo các mô hình Đề xuất thời gian thực (Real-time Recommendation).
3. **Change Data Capture (CDC):** Đồng bộ hóa các thay đổi dữ liệu từ Database giao dịch (ví dụ lệnh INSERT, UPDATE, DELETE trên MySQL) theo thời gian thực tới các kho dữ liệu phân tích Data Warehouse.
4. **Event Sourcing trong Microservices:** Ở kiến trúc Event-Driven Microservices, trạng thái hiện tại của một domain (ví dụ "Đơn hàng") được xây dựng thông qua một luồng thay đổi bất biến liên tục. Kafka giữ vai trò như một sổ cái lưu trữ lịch sử dài hạn (Source of Truth) cho các hệ thống nhỏ lẻ này.
5. **Real-time Stream Processing & Analytics:** Ứng dụng trong việc phát hiện gian lận thẻ tín dụng (Fraud Detection) tại ngân hàng ngay khi giao dịch diễn ra, định tuyến tối ưu xe công nghệ trên bản đồ, hay cập nhật tức thời bảng xếp hạng trong game online.

## Tài Liệu Tham Khảo

* [Apache Kafka Official Documentation](https://kafka.apache.org/documentation/)
* [Apache Flink Architecture - Flink Documentation](https://nightlies.apache.org/flink/flink-docs-stable/)
* [Kafka: a Distributed Messaging System for Log Processing - LinkedIn (NetDB 2011)](http://notes.stephenholiday.com/Kafka.pdf)
* **Streaming Systems: The What, Where, When, and How of Large-Scale Data Processing - Tyler Akidau**
* [Exactly-Once Semantics in Apache Kafka - Confluent Blog](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)
* [Stateful Stream Processing with RocksDB - Flink Forward](https://flink-forward.org/)
* [Confluent Developer - Kafka Tutorials and Learning Center](https://developer.confluent.io/)
