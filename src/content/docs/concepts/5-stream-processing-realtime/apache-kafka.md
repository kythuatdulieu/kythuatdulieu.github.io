---
title: "Apache Kafka"
difficulty: "Intermediate"
tags: ["apache-kafka", "message-broker", "event-streaming", "kraft", "distributed-systems"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Apache Kafka: Kiến trúc, Trade-offs và Rủi ro Vận hành"
metaDescription: "Đi sâu vào kiến trúc lưu trữ, cơ chế Zero-Copy, giao thức KRaft và những rủi ro vận hành (Consumer Lag, Rebalance Storm) khi triển khai Apache Kafka."
description: "Phân tích sâu về kiến trúc thực thi của Apache Kafka dưới góc độ Data Engineer: từ Page Cache, Zero-Copy, đồng thuận KRaft cho đến các sự cố kinh điển ở mức Production."
---

Khác với các hệ thống Message Queue truyền thống (như RabbitMQ hay ActiveMQ) hoạt động theo mô hình *Smart Broker - Dumb Consumer*, Apache Kafka được thiết kế dưới dạng **Distributed Commit Log** dựa trên cơ chế *Dumb Broker - Smart Consumer*. 

Việc chuyển dịch trách nhiệm quản lý state (trạng thái đọc) từ broker sang consumer giúp Kafka đạt được Throughput khổng lồ, nhưng đồng thời cũng đẩy những rủi ro vận hành (như *Consumer Lag*, *Rebalance Storms*) về phía người sử dụng. Dưới góc nhìn kiến trúc hệ thống, Kafka không đơn thuần là nơi chứa message, nó là một nền tảng Log-centric Storage.

---

## 1. Kiến trúc Thực thi Vật lý (Physical Execution & Storage)

Linh hồn của Kafka nằm ở cách nó ghi dữ liệu xuống đĩa cứng vật lý. Kafka tối ưu hóa tối đa IOPS bằng cách chỉ sử dụng **Sequential I/O** (Ghi tuần tự) và tận dụng triệt để **Page Cache** của Linux thay vì JVM Heap memory.

### 1.1. Append-Only Log và Segment Files

Mỗi Topic trong Kafka được chia thành nhiều Partition. Dưới mức vật lý, mỗi Partition là một thư mục trên ổ đĩa, chứa chuỗi các tệp **Log Segments** (thường là `1GB` mỗi file mặc định `log.segment.bytes`).

![Kafka Log Anatomy](/images/5-stream-processing-realtime/log_anatomy.png)

*Hình 1: Cấu trúc Append-Only Log của Kafka. Dữ liệu mới luôn được ghi vào cuối Log.*

- Dữ liệu luôn được **append (nối thêm)** vào cuối segment file đang mở (Active Segment).
- Khi file đầy, Kafka đóng segment này lại (Read-only) và mở segment mới.
- Thiết kế Append-only loại bỏ hoàn toàn Random I/O (I/O ngẫu nhiên) - nguyên nhân chính gây thắt cổ chai ở các database truyền thống (B-Tree). Sequential Write trên đĩa HDD đôi khi có thể đạt tốc độ tương đương với Random Write trên SSD.

### 1.2. Zero-Copy và Page Cache

Nếu Kafka phải đọc dữ liệu từ đĩa, chuyển lên RAM, rồi mới đẩy ra Network Socket, CPU sẽ phải thực hiện rất nhiều vòng lặp context switch và copy bộ nhớ (User-space vs Kernel-space).

Để giải quyết vấn đề này, Kafka sử dụng system call `sendfile()` (cơ chế **Zero-Copy**):
1. Dữ liệu từ đĩa được OS nạp thẳng vào **Page Cache** (RAM của Kernel).
2. Khi Consumer yêu cầu dữ liệu, OS DMA engine đẩy thẳng dữ liệu từ Page Cache sang Network Interface Card (NIC) buffer.
3. Không có byte nào bị copy qua lại giữa Kernel Space và User Space (JVM). Điều này giúp tiết kiệm CPU Cycles cực lớn và ngăn chặn tình trạng **JVM OOMKilled** hay GC Pauses dài.

---

## 2. Kiến trúc Đồng thuận Metadata: Từ ZooKeeper đến KRaft

Trước phiên bản 2.8.0, Kafka phụ thuộc vào một cluster **Apache ZooKeeper** riêng biệt để lưu trữ metadata (danh sách topic, broker nào còn sống, ai là Leader của partition). Sự phân tách này tạo ra "Split-brain" khi Controller của Kafka và ZooKeeper bị lệch pha (Out-of-sync).

**Giao thức KRaft (Kafka Raft)** ra đời để đưa quá trình đồng thuận (Consensus) vào chính nội tại của Kafka.

```mermaid
graph TD
    subgraph "ZooKeeper Era("Legacy")
        Z1("ZooKeeper Node") --- Z2("ZooKeeper Node")
        Z2 --- Z3("ZooKeeper Node")
        K1("Kafka Broker") -.-> Z1
        K2("Kafka Broker") -.-> Z2
    end
    
    subgraph "KRaft Era("Modern")
        KR1["Controller Node"] --- KR2["Controller Node"]
        KR2 --- KR3["Controller Node"]
        KB1["Broker Node"] -.-> KR1
        KB2["Broker Node"] -.-> KR2
    end
```

- Trong chế độ KRaft, một metadata topic đặc biệt tên là `@metadata` sẽ đóng vai trò như một luồng event duy nhất lưu trữ cấu hình hệ thống.
- Các node chạy ở chế độ `controller` sẽ bầu ra Leader thông qua thuật toán **Raft** thay vì ZAB (ZooKeeper Atomic Broadcast).
- **Trade-off:** Sự chuyển đổi này giúp hệ thống mở rộng lên hàng triệu partition mà không bị nghẽn cổ chai ở ZooKeeper, đồng thời giảm đáng kể độ trễ khởi động khi Controller Failover (từ vài phút xuống còn một phần giây). Tuy nhiên, bạn mất đi các công cụ monitor chuyên dụng đã được xây dựng hàng thập kỷ cho ZooKeeper.

---

## 3. Độ bền bỉ (Durability) và Các cấu hình Thực chiến

Mặc định, Kafka cấu hình theo thiên hướng High Availability (chấp nhận rủi ro mất mát dữ liệu nhỏ để giữ latency thấp). Để đạt được "Zero Data Loss" (thường dùng trong ngành tài chính), bạn phải đánh đổi Throughput.

Dưới đây là tổ hợp cấu hình bắt buộc cho hệ thống **Mission-Critical**:

```properties
# 1. Cấu hình phía Broker (server.properties)
default.replication.factor=3
min.insync.replicas=2
unclean.leader.election.enable=false

# 2. Cấu hình phía Producer
acks=all
enable.idempotence=true
max.in.flight.requests.per.connection=5
retries=2147483647
```

**Phân tích đánh đổi (Trade-off):**
- `acks=all` (hoặc `-1`): Producer sẽ bị block cho đến khi toàn bộ số node nằm trong danh sách **ISR (In-Sync Replicas)** báo cáo đã ghi xong xuống đĩa. *Đánh đổi: Latency tăng gấp 2-3 lần so với `acks=1`.*
- `min.insync.replicas=2`: Yêu cầu ít nhất 2 broker (Leader và 1 Follower) phải còn sống và đồng bộ. Nếu 1 broker trong cụm 3 node bị chết, hệ thống vẫn Write bình thường. Nếu 2 node chết, Producer sẽ nhận lỗi `NotEnoughReplicasException` - hệ thống hy sinh Availability để bảo vệ Consistency.

---

## 4. Rủi ro Vận hành: Những sự cố kinh điển

### 4.1. The Rebalance Storm (Bão Cân bằng tải)
Trong một Consumer Group, nếu một instance chết, Coordinator của Kafka sẽ kick hoạt tiến trình **Rebalance**: Tạm dừng (Stop-the-world) toàn bộ consumer khác, thu hồi tất cả partition và chia lại từ đầu.

Nếu một consumer bị kẹt CPU (chạy vòng lặp quá lâu) và bỏ lỡ nhịp `heartbeat.interval.ms` gửi về broker, nó bị coi là đã chết. Rebalance xảy ra. Sau khi rebalance xong, consumer kia lại tỉnh dậy, join lại group -> Lại Rebalance. Tiến trình này lặp lại liên tục gây tê liệt toàn bộ luồng xử lý (Rebalance Storm).

**Cách khắc phục:** 
- Sử dụng **Incremental Cooperative Rebalancing** (mặc định từ bản 2.4+).
- Tách biệt Thread fetch dữ liệu và Thread xử lý logic.
- Tăng `max.poll.interval.ms` lớn hơn tổng thời gian xử lý tối đa của một batch.

### 4.2. Cartesian Explosion và Spikes
Khi một Topic nhận được một cú Spike (tăng vọt) hàng triệu events, Consumer không kịp xử lý dẫn đến **Consumer Lag**. 

Nhiều Data Engineer cố gắng khắc phục bằng cách tăng thêm Consumer Instances. Tuy nhiên, nếu số lượng Consumer lớn hơn số lượng Partition, các Consumer dư thừa sẽ ở trạng thái **IDLE** (không làm gì cả). Bạn bắt buộc phải tăng cấu hình số lượng Partition từ trước. Nhưng việc có quá nhiều Partition lại làm bành trướng kích thước Metadata của Controller, dẫn đến OOM. Đây là một bài toán Scale giới hạn bởi kích thước Cụm.

---

## 5. Hệ sinh thái và Các lớp Layer mở rộng

Để không phải viết đi viết lại logic kết nối hay xử lý luồng, Confluent và cộng đồng đã xây dựng một hệ sinh thái mạnh mẽ xung quanh lõi Kafka.

![Kafka APIs and Ecosystem](/images/5-stream-processing-realtime/kafka-apis.png)

*Hình 2: Các nhóm API cốt lõi trong hệ sinh thái Apache Kafka.*

1. **Kafka Connect:** Framework chuyên biệt hóa Ingestion / Egestion. Thay vì tự viết code Java/Python để kéo dữ liệu từ Postgres hay đẩy vào S3, ta dùng các Connector cấu hình bằng JSON. Nó chịu trách nhiệm quản lý state, failover và auto-scaling ở mức worker. (Gắn chặt với Debezium trong kiến trúc CDC).
2. **Kafka Streams / ksqlDB:** Thư viện tính toán Stateful. Nó không chỉ filter mà còn xử lý các bài toán Aggregation (Tumbling/Sliding Window) hoặc Join giữa các luồng. Để chống mất state khi sập (Memory rỗng), nó dùng **RocksDB** ghi trạng thái trung gian xuống đĩa cục bộ cục bộ, đồng thời backup state này lên một topic đặc biệt (Changelog Topic).
3. **Schema Registry:** Đóng vai trò như một "Gatekeeper" kiểu tĩnh (Strongly Typed). Khi Producer gửi message (Avro/Protobuf), nó chỉ đính kèm `schema_id`. Consumer nhận message và pull schema từ Registry về để Deserialize. Tránh tình trạng Producer thả rác ("Poison Pill") làm sập luồng của Consumer.

---

## Nguồn Tham Khảo (References)

* [Apache Kafka Official Documentation - Design](https://kafka.apache.org/documentation/#design)
* [Confluent: Why ZooKeeper Was Replaced with KRaft](https://www.confluent.io/blog/why-kafka-is-moving-to-kraft/)
* [KIP-500: Replace ZooKeeper with a Self-Managed Metadata Quorum](https://cwiki.apache.org/confluence/display/KAFKA/KIP-500%3A+Replace+ZooKeeper+with+a+Self-Managed+Metadata+Quorum)
* [LinkedIn Engineering: Optimizing Kafka for the Cloud](https://engineering.linkedin.com/blog/topic/kafka)
* *Designing Data-Intensive Applications* - Martin Kleppmann (Chương 11: Stream Processing).
