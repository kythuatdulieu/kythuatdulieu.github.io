---
title: "Stream-Table Duality - Tính lưỡng tính Dòng - Bảng"
difficulty: "Advanced"
tags: ["streaming", "table", "stream-table-duality", "kafka-streams", "flink", "rocksdb"]
readingTime: "20 mins"
lastUpdated: 2026-06-26
seoTitle: "Stream-Table Duality: Kiến trúc cốt lõi của Kafka & Flink"
metaDescription: "Tìm hiểu sâu về Stream-Table Duality ở góc độ System Design. Cơ chế Materialization bằng RocksDB, Log Compaction trong Kafka, và Retract Stream trong Flink."
description: "Stream-Table Duality không chỉ là lý thuyết, nó là nền tảng vật lý định hình cách các hệ thống như Kafka Streams và Apache Flink quản lý State (trạng thái), xử lý Fault Tolerance và vận hành CDC (Change Data Capture) ở quy mô lớn."
---

Trong thiết kế hệ thống phân tán xử lý luồng, **Stream-Table Duality (Tính lưỡng tính Dòng - Bảng)** không đơn thuần là một khái niệm trừu tượng. Nó là nguyên lý vật lý (physical principle) chi phối cách dữ liệu được lưu trữ, truyền tải, và phục hồi (fault tolerance) dưới nền tảng của các cỗ máy như Apache Kafka và Apache Flink. 

Đứng ở góc độ Staff Engineer, mọi State Store, mọi cơ chế CDC (Change Data Capture), và mọi phép Join trong streaming đều là hệ quả trực tiếp của nguyên lý này. Về mặt kiến trúc:
- **Stream** là *sự tiến hóa của dữ liệu theo thời gian* (Data over time - Immutable, Append-only, Unbounded).
- **Table** là *hình chiếu trạng thái tại một thời điểm* (Snapshot/Data at rest - Mutable, Bounded).

Mọi Table đều có thể được tái tạo bằng cách replay một Stream từ con số 0. Ngược lại, mọi sự thay đổi (mutate) trên Table đều sẽ phát sinh ra một Stream (Changelog/Redo Log).

## 1. Kiến trúc Thực thi Vật lý (Physical Execution Mechanisms)

### 1.1. Từ Stream sang Table: Materialization & State Store

Khi bạn tính tổng số đơn hàng theo từng User ID từ một luồng giao dịch liên tục, bạn đang thực hiện thao tác **Materialize** (Vật chất hóa) một Stream thành một Table. Ở tầng vật lý, hệ thống không thể lưu trữ Table này trên RAM mãi mãi vì sẽ dẫn đến tràn bộ nhớ (`OOMKilled`).

Thay vào đó, các framework như Kafka Streams hay Flink nhúng một Embedded Key-Value Database (thường là **RocksDB**) trực tiếp vào memory space của ứng dụng Stream Processing (JVM). 

```mermaid
flowchart TD
    subgraph StreamingNode["Streaming Node(JVM)"]
        StreamIn["Input Stream\n("Event Log")"]
        MemTable["In-Memory Cache\n(MemTable)"]
        RocksDB["(RocksDB\n("Local Disk SSTables")"]
        TableOut["Materialized Table\n(State)"]
    end
    
    Changelog["(Kafka Changelog Topic\n(Compacted)"]
    
    StreamIn -- "Materialize" --> MemTable
    MemTable -- "Spill-to-disk\n("Memory Mgmt") --> RocksDB
    RocksDB -. "Ad-hoc Query" .-> TableOut
    MemTable -- "Async flush" --> Changelog
    Changelog -- "Replay("Fault Tolerance") -.-> MemTable
```

Dữ liệu mới đến sẽ đi vào In-Memory Cache (MemTable), khi đầy sẽ xả xuống đĩa cứng (Spill-to-disk) dưới dạng SSTables (Sorted String Tables) của RocksDB. Table chính là giao diện truy vấn phía trên cấu trúc vật lý này.

### 1.2. Từ Table sang Stream: Changelog & Log Compaction

Khi bạn cập nhật một record trên Table (ví dụ `UPDATE balances SET amount = 100 WHERE id = 1`), Database engine sẽ ghi nhận hành động này vào một Redo Log (như WAL trong PostgreSQL hoặc Binlog trong MySQL).

Sử dụng các công cụ CDC (như **Debezium**), chúng ta "bắt" các transaction log này và đẩy nó ra thành một Stream. Luồng này gọi là **Changelog Stream**. 

Để Changelog Stream không dài ra vô hạn, Kafka sử dụng cơ chế **Log Compaction**. Kafka broker sẽ chạy background thread, quét các segment và chỉ giữ lại message *mới nhất* (latest value) cho mỗi Key, tự động xóa (tombstone) các giá trị cũ.

**Cấu hình Kafka Topic thực chiến cho Changelog (Terraform):**
```hcl
resource "kafka_topic" "balance_changelog" {
  name               = "balance-changelog-topic"
  replication_factor = 3
  partitions         = 12
  config = {
    # Kích hoạt tính năng Table -> Stream nén
    "cleanup.policy"       = "compact"
    # Giữ lại delete marker (tombstone) trong 24h trước khi xóa hẳn
    "delete.retention.ms"  = "86400000"
    # Kích hoạt bộ nhớ đệm cho quá trình compaction
    "min.compaction.lag.ms"= "3600000" # 1 giờ
    "segment.bytes"        = "1073741824" # 1GB/segment
  }
}
```

## 2. Hiện thực hóa trong Apache Flink (Dynamic Tables)

Apache Flink mở rộng Stream-Table Duality thành khái niệm **Dynamic Tables**. Khi bạn viết một câu truy vấn SQL (`Continuous Query`) trên luồng dữ liệu, Flink ngầm định tạo ra Dynamic Tables. Đầu ra của câu truy vấn này tiếp tục là một Dynamic Table khác.

Tùy thuộc vào thao tác SQL (Aggregation, Join), Flink sẽ phát ra các loại Stream khác nhau để đồng bộ State:
1. **Append-only Stream:** Nếu query không có cập nhật (ví dụ `SELECT ... WHERE ...`), kết quả chỉ sinh ra dòng mới.
2. **Retract Stream / Upsert Stream:** Nếu query có Aggregation (`GROUP BY`), khi một nhóm cập nhật giá trị mới, Flink sẽ gửi một message "Retract" (thu hồi giá trị cũ) và một message "Insert" (chèn giá trị mới). 

**Flink SQL Thực chiến kết nối với Debezium (CDC):**
```sql
-- Khai báo Input Stream từ bảng MySQL thông qua Debezium
CREATE TABLE mysql_orders_cdc (
  order_id INT,
  user_id INT,
  amount DECIMAL(10, 2),
  order_status STRING,
  PRIMARY KEY (order_id) NOT ENFORCED
) WITH (
  'connector' = 'mysql-cdc',
  'hostname' = 'db.internal.svc',
  'port' = '3306',
  'username' = 'flink_user',
  'password' = '${secret:flink_password}',
  'database-name' = 'ecommerce',
  'table-name' = 'orders'
);

-- Khai báo Output Table (Materialized View) ghi vào Elasticsearch
CREATE TABLE user_spend_summary (
  user_id INT,
  total_spend DECIMAL(10, 2),
  PRIMARY KEY (user_id) NOT ENFORCED
) WITH (
  'connector' = 'elasticsearch-7',
  'hosts' = 'http://es:9200',
  'index' = 'user_summary'
);

-- Flink sẽ tự động biên dịch câu SQL này thành quá trình:
-- Stream (CDC) -> Dynamic Table (Group By) -> Stream (Upsert/Retract) -> Elasticsearch
INSERT INTO user_spend_summary
SELECT 
  user_id,
  SUM(amount) as total_spend
FROM mysql_orders_cdc
WHERE order_status = 'COMPLETED'
GROUP BY user_id;
```

## 3. Hiện thực hóa trong Kafka Streams (KStream & KTable)

Kafka Streams API trừu tượng hóa tính lưỡng tính này rất rõ rệt qua hai interface:
- **`KStream<K, V>`**: Mỗi record là một sự kiện độc lập (Insert-only).
- **`KTable<K, V>`**: Mỗi record là một bản cập nhật dựa trên Key (Upsert). `null` value ứng với Delete (Tombstone).

Sức mạnh thực sự nằm ở việc lưu trạng thái. Khi ta tạo `KTable`, Kafka Streams tạo ra một **State Store** (RocksDB by default) và tự động tạo ra một internal topic có `cleanup.policy=compact` đóng vai trò là Changelog. Nếu node Kafka Streams bị crash, State Store local bị mất, node mới (hoặc node phục hồi) sẽ đọc lại Changelog topic này để khôi phục State Store.

**Tối ưu State Store Config trong Kafka Streams (Java):**
```java
Properties props = new Properties();
props.put(StreamsConfig.APPLICATION_ID_CONFIG, "fraud-detection-app");
props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka-broker:9092");

// Tối ưu RocksDB để tránh Write Amplification khi materialize KTable
props.put(StreamsConfig.ROCKSDB_CONFIG_SETTER_CLASS_CONFIG, CustomRocksDBConfig.class);
props.put(StreamsConfig.TOPOLOGY_OPTIMIZATION_CONFIG, StreamsConfig.OPTIMIZE);

StreamsBuilder builder = new StreamsBuilder();
KStream<String, Transaction> txStream = builder.stream("transactions");

// Stream to Table: Materialize
KTable<String, Long> userTxCount = txStream
    .groupByKey()
    .count(Materialized.<String, Long, KeyValueStore<Bytes, byte[]>>as("user-tx-count-store")
        .withCachingEnabled() // Batch update lên Changelog (tránh gửi Retract/Upsert liên tục)
        .withLoggingEnabled(Collections.emptyMap())); // Bật tính năng đồng bộ xuống Changelog topic
```

## 4. Systemic Trade-offs & Rủi ro Vận hành (Operational Risks)

Lưu trữ Table (State) trong các hệ thống Streaming là một con dao hai lưỡi. Dưới đây là những cạm bẫy thiết kế và cách xử lý (Troubleshooting) thực tế khi chạy production.

### 4.1. Cạm bẫy State Store Bloat (Phình to Trạng thái) & OOMKilled
**Triệu chứng:** Khi luồng có quá nhiều Key duy nhất (ví dụ: Key là Session ID của khách vãng lai thay vì User ID thực), kích thước Table lớn dần vô hạn. Ổ cứng của container chạy Flink/Kafka Streams bị đầy (No space left on device), hoặc JVM văng lỗi `OOMKilled` do off-heap memory của RocksDB phình to vượt quá RAM limit.
**Giải pháp:**
- Áp dụng **Time-To-Live (TTL)**. Trong Flink, cấu hình `table.exec.state.ttl` để hệ thống tự động dọn dẹp các State cũ không còn được truy cập.
- Chuyển từ *Global Window* sang *Sliding/Tumbling Window* để state được chủ động clear đi sau khi window đóng.
- Khống chế memory footprint của RocksDB: Giới hạn `Block Cache` và `Write Buffer Manager` của RocksDB chia sẻ chung trên toàn TaskManager/Instance thay vì để cấp phát tự do cho từng store.

### 4.2. Write Amplification (Khuếch đại Ghi) trong Changelog
**Triệu chứng:** Mỗi sự thay đổi nhỏ trên KTable (ví dụ biến đếm count tăng từ 1 lên 2, 2 lên 3 trong cùng một mili-giây) đều kích hoạt một bản ghi xuống Changelog topic. Hậu quả là Network I/O bị thắt cổ chai, IOPS của ổ cứng tăng vọt, Kafka Broker bị quá tải.
**Giải pháp:** 
- Kích hoạt cơ chế **In-Memory Caching** trước khi xả xuống (Spill) Changelog. Trong Kafka Streams là hàm `withCachingEnabled()`. Dữ liệu sẽ được gộp (batch) lại trên bộ nhớ, và chỉ ghi trạng thái cuối cùng xuống Changelog (Ví dụ: nhảy thẳng từ 1 lên 100 thay vì ghi 100 lần tăng liên tiếp).

### 4.3. Consumer Lag do Reprocessing Storm (Bão phục hồi)
**Triệu chứng:** Khi một node Kafka Streams chết, node dự phòng (standby) tiếp quản. Tuy nhiên, node mới cần khôi phục lại KTable (State Store) từ Changelog topic. Quá trình Replay này phải đọc tải về hàng trăm GB dữ liệu (dù đã được Log Compaction) dẫn đến hệ thống mất hàng giờ mới khởi động xong (*Cold Start Problem*). Trong lúc đó, Consumer Lag tăng vọt, pipeline Real-time vô tình biến thành Batch.
**Giải pháp:**
- Thiết lập cơ chế **Standby Replicas** (`num.standby.replicas=1` trong Kafka Streams). Một node phụ ở Availability Zone khác luôn duy trì bản sao của RocksDB (*Shadow State Store*) bằng cách đọc âm thầm từ Changelog. Khi node chính chết, node phụ lập tức Promote lên thành Active mà không cần Replay từ đầu. Đánh đổi (Trade-off): Tốn gấp đôi dung lượng lưu trữ (Disk) và CPU để chạy Standby.

## 5. Nguồn Tham Khảo (References)

1. **Streaming Systems: The What, Where, When, and How of Large-Scale Data Processing** - Tyler Akidau, Slava Chernyak, Reuven Lax (O'Reilly). Chương 1 & 2 phân tích chuyên sâu nguyên lý Dòng và Bảng.
2. [Streams and Tables in Apache Kafka: Two Sides of the Same Coin](https://www.confluent.io/blog/kafka-streams-tables-part-1-event-streaming/) - Confluent Blog.
3. [Apache Flink Documentation: Dynamic Tables](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/table/concepts/dynamic_tables/) - Thiết kế kiến trúc Continuous Queries và Changelog Stream của Flink.
4. [Kafka Streams Architecture & State Management](https://docs.confluent.io/platform/current/streams/architecture.html) - Trọng tâm về Local State Store (RocksDB) và Fault Tolerance bằng Changelogs.
