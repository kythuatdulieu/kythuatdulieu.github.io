---
title: "Xử lý thời gian thực - Streaming Processing"
difficulty: "Advanced"
tags: ["streaming-processing", "real-time", "event-driven", "kafka", "flink", "exactly-once", "watermarks"]
readingTime: "25 mins"
lastUpdated: 2026-06-26
seoTitle: "Streaming Processing là gì? Kiến trúc và Trade-offs hệ thống Real-time"
metaDescription: "Đi sâu vào kiến trúc Streaming Processing, phân tích Event Time vs Processing Time, Watermarks, Exactly-Once Semantics, và các sự cố OOM/Consumer Lag thực tế."
description: "Streaming Processing không đơn thuần là xử lý dữ liệu nhanh. Ở quy mô Enterprise, nó là bài toán đánh đổi giữa Latency, Throughput và Correctness khi dữ liệu liên tục chảy, độ trễ mạng bấp bênh và hệ thống phân tán có thể sập bất cứ lúc nào."
---

Khác với Batch Processing—nơi dữ liệu tĩnh (Bounded Data) nằm yên trên các node HDFS hay S3 chờ được scan—**Streaming Processing** xử lý một dòng dữ liệu vô tận (Unbounded Data). Dữ liệu chảy qua các engine phân tán, State được cập nhật liên tục, và kết quả được phát ra với độ trễ (Latency) tính bằng mili-giây.

Trong môi trường thực chiến của một Staff Data Engineer, xây dựng hệ thống Streaming không chỉ là dựng Apache Kafka hay Apache Flink lên rồi chạy. Nó là cuộc chiến xử lý **Out-of-order data** (dữ liệu đến trễ), **State Bloat** (phình to trạng thái bộ nhớ), và **Rebalance Storms** (bão phân bổ lại phân vùng) trong các cụm phân tán.

---

## 1. Thời Gian Trong Streaming (The Domains of Time)

Tyler Akidau (Google/Dataflow) đã chỉ ra rằng, để một hệ thống streaming đạt được độ chính xác (Correctness) tương đương Batch, chúng ta phải tách biệt hoàn toàn hai khái niệm thời gian:

1. **Event Time (Thời gian sự kiện):** Mốc thời gian thực tế mà sự kiện xảy ra tại thiết bị phát (Ví dụ: Log time trên điện thoại người dùng).
2. **Processing Time (Thời gian xử lý):** Mốc thời gian (Wall-clock time) khi Worker Node trong cluster nhận được và xử lý sự kiện.

### Vấn Đề "The Skew" (Độ Trễ Phân Tán)

Trong mạng phân tán, **Processing Time luôn trễ hơn Event Time**, và khoảng cách này (Skew) dao động không dự đoán được do Network Latency, Garbage Collection (GC) pauses, hoặc thiết bị mất kết nối (Offline). 

Nếu bạn thiết kế hệ thống báo cáo tài chính (Ví dụ: Tính tổng giao dịch trong ngày) dựa trên Processing Time, dữ liệu sẽ bị lệch (Non-deterministic) mỗi khi mạng chậm. Do đó, các hệ thống lõi **bắt buộc phải dùng Event Time**. 

---

## 2. Giải Quyết Dữ Liệu Đến Trễ: Windowing & Watermarks

Làm sao tính tổng doanh thu của "khung giờ 10:00 - 10:05" khi sự kiện lúc 10:04 bị rớt mạng và tới tận 10:15 mới đến máy chủ? Chúng ta không thể đợi mãi mãi, nhưng cũng không thể đóng cửa sổ quá sớm.

### Watermarks (Dấu Gờ Nước)

**Watermark** là một metric ẩn do hệ thống (như Flink) sinh ra, chạy song song với luồng dữ liệu. Watermark có giá trị `T` mang ý nghĩa: *"Hệ thống cam kết sẽ không còn sự kiện nào có Event Time nhỏ hơn T đến nữa (hoặc nếu đến, chúng được coi là Late Data)"*.

```mermaid
sequenceDiagram
    participant User Device
    participant Kafka Broker
    participant Flink Operator("Window 10:00-10:05")
    
    User Device->>Kafka Broker: Event 10:04("Arrives at 10:04")
    User Device->>Kafka Broker: Event 10:03("Delayed, Arrives at 10:08")
    Note over Kafka Broker: Watermark generated: 10:05
    Kafka Broker->>Flink Operator("Window 10:00-10:05"): Watermark(10:05) reaches Window
    Note over Flink Operator("Window 10:00-10:05"): Window Closes & Materializes Result!
    User Device->>Kafka Broker: Event 10:04("Extremely Delayed, Arrives at 10:12")
    Note over Flink Operator("Window 10:00-10:05"): Handled as Late Data("Drop or Update Sink")
```

**Trade-offs khi cấu hình Watermark:**
- **Watermark quá khắt khe (chạy nhanh):** Latency cực thấp, nhưng hy sinh Correctness vì đánh rớt quá nhiều Late Data.
- **Watermark quá lỏng (chờ lâu):** Correctness cao, nhưng Latency tăng và **State Size phình to** (vì Window phải giữ trong RAM lâu hơn chờ dữ liệu).

*Mã cấu hình Watermark với bounded-out-of-orderness trong Flink SQL:*
```sql
CREATE TABLE user_clicks (
    user_id STRING,
    click_time TIMESTAMP(3),
    WATERMARK FOR click_time AS click_time - INTERVAL '5' SECOND -- Chấp nhận trễ tối đa 5s
) WITH (
    'connector' = 'kafka',
    'topic' = 'clicks',
    'properties.bootstrap.servers' = 'localhost:9092'
);
```

---

## 3. Kiến Trúc Thực Thi Vật Lý (Physical Execution)

Một Dataflow tiêu chuẩn thường bao gồm **Storage Layer (Kafka)** và **Compute Layer (Flink)**.

### 3.1. Storage Layer: Kafka & Cơ chế Log

Kafka không phải là một queue truyền thống (như RabbitMQ), nó là một **Distributed Append-Only Commit Log**. Khi dữ liệu được ghi vào Kafka, nó được ghi tuần tự vào đĩa cứng (Sequential Disk I/O) và sử dụng **Page Cache** kết hợp **Zero-Copy** của OS Linux (syscall `sendfile`) để bypass hoàn toàn JVM heap, cho phép đẩy Throughput lên hàng trăm ngàn message/giây mà không bị GC pause.

Để đảm bảo không mất dữ liệu (Fault Tolerance), hệ thống production luôn phải cấu hình Replication nghiêm ngặt.
*Ví dụ Cấu hình Kafka Production Server & Producer:*
```properties
# --- Kafka Broker (server.properties) ---
default.replication.factor=3
min.insync.replicas=2 # Yêu cầu ít nhất 2 bản sao thành công mới báo ack
log.retention.bytes=1073741824 # Giữ dung lượng log không thổi bay ổ cứng

# --- Kafka Producer ---
acks=all # Đảm bảo Leader và tất cả In-sync Replicas đã ghi xong
enable.idempotence=true # Ngăn chặn Duplicate do Retry mạng (Retries storm)
max.in.flight.requests.per.connection=5 # Kết hợp Idempotence để giữ trật tự tin nhắn
```

### 3.2. Compute Layer: Stateful Processing & Checkpointing

Tại Compute engine như Apache Flink, dữ liệu chảy qua liên tục, nhưng hệ thống phải "nhớ" trạng thái. Ví dụ: Để tính *Distinct Users*, Flink phải lưu một HashMap các User ID đã gặp. 

Khi lượng State lên tới hàng trăm GB (State Bloat), lưu trên Heap Memory của JVM sẽ dẫn tới **OOMKilled** (Out of Memory). Giải pháp vật lý là **Spill-to-disk** bằng cách nhúng engine **RocksDB** (một Key-Value store tối ưu cho ghi nhanh bằng LSM-Tree) vào trong từng Task Manager của Flink.

Để chịu lỗi, Flink dùng thuật toán **Chandy-Lamport** sinh ra các **Barrier** chảy trong luồng dữ liệu. Khi Barrier đi qua, Operator sẽ chụp ảnh (Snapshot) toàn bộ State trong RocksDB và upload lên S3/HDFS.

```mermaid
graph TD
    subgraph Flink Task Manager("Node")
        A["Kafka Source"] -->|Stream + Barriers| B("Window Operator")
        B --> C["Sink to PostgreSQL"]
        
        B <-->|Read/Write State| D["(RocksDB Local State)"]
    end
    D -.->|Async Checkpoint| E["(AWS S3 / HDFS)"]
```

---

## 4. Ngữ Nghĩa Exactly-Once (Exactly-Once Semantics - EOS)

Trong kịch bản ngân hàng, nếu node Flink bị sập, nó restart và đọc lại (Replay) log Kafka từ Checkpoint cũ. Làm sao đảm bảo tiền không bị cộng 2 lần vào database đích?

**Exactly-Once** là sự kết hợp của 2 cơ chế:
1. **Idempotent Producers:** Kafka gán cho Producer một PID và cấp Sequence Number cho mỗi message. Broker lưu Sequence Number lớn nhất. Nếu message bị gửi trùng (do mạng chập chờn, Producer retry), Broker sẽ drop message trùng.
2. **Two-Phase Commit (2PC):** Tích hợp Transactional API của Kafka với Flink Checkpoint.
   - **Phase 1 (Pre-commit):** Flink xử lý và ghi data vào Kafka Sink, nhưng đánh dấu là `uncommitted`. Các Transactional Consumer ở downstream (như Dashboard) chưa được phép đọc.
   - **Phase 2 (Commit):** Khi Flink hoàn thành Checkpoint thành công lên S3, Barrier cuối cùng kích hoạt lệnh `commit` transaction trên Kafka. Lúc này Consumer mới thấy dữ liệu.

---

## 5. Rủi Ro Vận Hành & Troubleshooting (Real-World Incidents)

Dưới đây là những cơn ác mộng hệ thống thực tế và cách xử lý:

### 5.1. Bão phân bổ lại Consumer (Rebalance Storms)
- **Sự cố:** Kafka Consumer Group có 10 nodes. Một node bị GC pause quá lâu (vượt quá `session.timeout.ms`), Kafka lầm tưởng node chết nên kích hoạt Rebalance toàn bộ Partitions. Đang Rebalance thì node kia tỉnh dậy, gây nhiễu loạn toàn hệ thống. Dữ liệu ngưng trệ, Lag tăng vọt.
- **Khắc phục:** Sử dụng giao thức **Static Membership** (`group.instance.id`). Tách biệt timeout của heartbeat (`session.timeout.ms`) và timeout xử lý lô data (`max.poll.interval.ms`). Tối ưu JVM tuning (G1GC hoặc ZGC) để giảm pause.

### 5.2. Cartesian Explosion trong Stream-Stream Join
- **Sự cố:** Kỹ sư viết câu SQL `JOIN` hai luồng Kafka A và B mà quên không khai báo Time Window (Ví dụ: Interval Join). Flink buộc phải lưu *toàn bộ* lịch sử của Stream A và Stream B trong RocksDB vĩnh viễn để chờ match. Ổ cứng EBS trên AWS đầy 100% trong vòng 2 ngày, Cluster sập.
- **Khắc phục:** Luôn luôn thiết lập ranh giới thời gian cho State (State Time-To-Live - TTL).
  ```sql
  -- Thiết lập TTL ở mức Flink Configuration
  SET 'table.exec.state.ttl' = '24 h'; 
  ```

### 5.3. Nút Thắt Cổ Chai (Data Skew & Hot Partitions)
- **Sự cố:** Dùng `customer_id` làm Partition Key trong Kafka. Khách hàng lớn (như Apple) chiếm 80% volume sự kiện. Một Partition nhận quá tải, một Flink Task Manager bị vắt kiệt 100% CPU, trong khi các Task khác nhàn rỗi.
- **Khắc phục:** 
  - Thêm "muối" vào key (Salting key: `customer_id + random(0, 10)`) để chia đều tải ra nhiều partition trước khi Aggregate.
  - Sau đó Aggregate cục bộ (Local Aggregate) rồi mới Aggregate toàn cục (Global Aggregate).

---

## 6. Infrastructure-as-Code: Triển khai Streaming Platform

Thay vì click tay, mọi thứ cần được module hóa. Dưới đây là snippet Terraform triển khai AWS MSK (Managed Streaming for Kafka) kết hợp các best practices về Security và Tiered Storage:

```hcl
# Tách cụm MSK vào Private Subnet, kích hoạt IAM Auth và Tiered Storage
resource "aws_msk_cluster" "realtime_pipeline" {
  cluster_name           = "core-streaming-cluster"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = [aws_subnet.private_1.id, aws_subnet.private_2.id, aws_subnet.private_3.id]
    security_groups = [aws_security_group.msk_sg.id]
    
    storage_info {
      ebs_storage_info {
        volume_size = 1000
        volume_type = "gp3"
      }
    }
  }

  client_authentication {
    sasl {
      iam = true
    }
  }

  # Bật Tiered Storage để đẩy data cũ xuống S3, tiết kiệm chi phí EBS
  storage_mode = "TIERED" 
}
```

---

## 7. Kết Luận

Streaming Processing không chỉ là câu chuyện chuyển từ "Chạy 1 ngày 1 lần" sang "Chạy ngay lập tức". Nó đòi hỏi bạn phải tư duy lại toàn bộ về sự bất biến (Immutability), Thời gian (Time Domains) và khả năng chấp nhận lỗi (Fault Tolerance). Khi làm chủ được kiến trúc Streaming, bạn đang trao cho doanh nghiệp vũ khí mạnh nhất: **Ra quyết định dựa trên khoảnh khắc hiện tại.**

## Nguồn Tham Khảo (References)
* **Streaming 101/102 (Tyler Akidau - O'Reilly):** Nền tảng cốt lõi về Event Time vs Processing Time và Watermarks. [Link](https://www.oreilly.com/radar/the-world-beyond-batch-streaming-101/)
* **Exactly-Once Semantics are Possible (Confluent Blog):** Đi sâu vào kiến trúc Idempotent và Transactional API của Apache Kafka. [Link](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)
* **Apache Flink Architecture Documentation:** Cơ chế Checkpointing, Chandy-Lamport và quản lý State với RocksDB. [Link](https://nightlies.apache.org/flink/flink-docs-stable/)
* **Designing Data-Intensive Applications (Martin Kleppmann):** Chương 11 - Stream Processing. Cuốn sách gối đầu giường cho mọi Data Engineer.
