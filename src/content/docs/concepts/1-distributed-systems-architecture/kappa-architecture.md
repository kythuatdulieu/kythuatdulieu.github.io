---
title: "Kiến trúc Kappa (Kappa Architecture): Lấy Streaming Làm Cốt Lõi"
difficulty: "Advanced"
tags: ["architecture", "streaming", "kappa", "event-driven", "kafka", "flink", "event-sourcing"]
readingTime: "25 mins"
lastUpdated: 2026-06-29
seoTitle: "Kappa Architecture - Thiết Kế Hệ Thống Xử Lý Luồng Hiện Đại"
metaDescription: "Phân tích kiến trúc Kappa ở mức Staff Engineer: Cơ chế Reprocessing, Event Sourcing, Flink vs Kafka Streams, State Management, và Late Events."
description: "Mọi dữ liệu đều là Stream. Đào sâu vào kiến trúc Kappa: Giải quyết bài toán Reprocessing, Event Sourcing, RocksDB state, Watermarks và FinOps lưu trữ log."
domains: ["Platform", "DE"]
level: "Senior"
---

Được đề xuất bởi **Jay Kreps** [nhà sáng lập Apache Kafka] vào năm 2014, **Kappa Architecture** sinh ra để xóa sổ tầng Batch rườm rà của [Lambda Architecture](/concepts/1-distributed-systems-architecture/lambda-architecture). Tuyên ngôn của nó rất đơn giản: **Mọi thứ đều là một luồng (Everything is a Stream)**. 

Dữ liệu lịch sử (Historical data) về cơ bản chỉ là một luồng sự kiện đã xảy ra trong quá khứ. Vậy tại sao phải duy trì hai hệ thống code khác biệt (Hadoop/Spark cho Batch, Flink/Storm cho Stream) để tính toán cùng một logic? Kappa thống nhất luồng xử lý bằng một codebase duy nhất.

Tuy nhiên, đằng sau sự đơn giản về mặt khái niệm là những thách thức kỹ thuật khủng khiếp về **State Management**, **Data Retention**, và **FinOps** mà các Data Engineer phải đối mặt khi hiện thực hóa.

---

## 1. Mối Liên Hệ Với Event Sourcing

Kiến trúc Kappa vay mượn rất nhiều từ triết lý **Event Sourcing** trong Software Engineering. Trong Event Sourcing, trạng thái của hệ thống không được lưu trữ dưới dạng một bảng cơ sở dữ liệu bị ghi đè liên tục (CRUD), mà được suy ra (derived) từ một chuỗi các sự kiện bất biến (Immutable Events). 

Kappa áp dụng nguyên lý này ở quy mô Big Data: Hệ thống lưu trữ sự kiện (Event Storage) như Apache Kafka, Redpanda, hoặc Pulsar trở thành **Nguồn Chân Lý Duy Nhất (Single Source of Truth - SSOT)**.

---

## 2. Các Thành Phần Cốt Lõi và Bài Toán Lưu Trữ

Khác với Lambda, Kappa nén mọi logic xử lý vào một luồng duy nhất.

```mermaid
graph LR
    A["Data Sources"] -->|Events| B["Kafka / Event Log (SSOT)"]
    B -->|Stream/Replay| C{"Stream Processor<br/>(Flink / Kafka Streams)"}
    C -->|Real-time Updates| D["(Serving Layer<br/>ClickHouse / Druid)"]
    D --> E["Dashboards / APIs"]
```

### Immutable Log & Vấn Đề Lưu Trữ (FinOps)
Mô hình Kappa yêu cầu giữ lại **tất cả** dữ liệu lịch sử trên Kafka để có thể "Reprocess" (chạy lại) bất cứ khi nào cần. Nhưng lưu trữ dữ liệu vĩnh viễn trên Kafka (vốn dùng ổ cứng EBS tốc độ cao) là hành động "đốt tiền".
- **Giải pháp thực tế (KIP-405 Tiered Storage):** Kafka nay đã hỗ trợ Tiered Storage. Dữ liệu mới/nóng lưu trên Local SSD/EBS để phục vụ real-time với độ trễ mili-giây. Dữ liệu cũ (ví dụ: > 7 ngày) tự động offload xuống Object Storage (Amazon S3 / GCS) với chi phí rẻ hơn hàng chục lần, tạo nên kho lưu trữ lịch sử vô hạn nhưng vẫn truy xuất thông qua cùng một Kafka API.

---

## 3. Lựa chọn Stream Processor: Flink hay Kafka Streams?

Để thực thi logic trong Kappa, bạn cần một Stream Processing Engine. Hai lựa chọn phổ biến nhất có những triết lý khác biệt:

| Tiêu chí | Kafka Streams | Apache Flink |
| :--- | :--- | :--- |
| **Bản chất** | Lightweight Library nhúng vào ứng dụng Java. |" Distributed Framework độc lập (có cụm riêng). "|
| **Triển khai** | Triển khai như các Microservices thông thường trên Kubernetes. |" Đòi hỏi Flink Cluster (JobManager / TaskManager). "|
| **Khi nào dùng**| Ứng dụng tích hợp sâu với Kafka, Event-driven microservices. |" Cần xử lý khối lượng khổng lồ (High-throughput), thuật toán Window cực phức tạp, hợp nhất Batch/Stream. "|

---

## 4. Reprocessing: Khởi Tạo Lại Lịch Sử (The Hard Way)

Điểm ăn tiền của Kappa là cách xử lý khi bạn cần đổi logic code (ví dụ: cập nhật thuật toán Machine Learning hoặc vá một bug tính toán sai từ 1 năm trước).

Quy trình Reprocessing (Replay) trong Kappa:
1. Khởi tạo một job Flink mới (Version B) chứa code đã fix bug.
2. Trỏ Flink job này đọc dữ liệu từ Kafka tại vị trí `offset = earliest` (đọc từ đầu dòng thời gian).
3. Ghi kết quả tính toán vào một bảng mới (Table B) trên Serving Layer.
4. Job này sẽ chạy bứt tốc (burst) để "bắt kịp" (catch-up) với luồng sự kiện hiện tại.
5. Khi đã đồng bộ (Lag = 0), đổi routing ứng dụng sang Table B và khai tử Table A (Version A).

```sql
-- Ví dụ: Flink SQL config để đọc từ đầu cho Reprocessing
CREATE TABLE raw_events (
  user_id STRING,
  event_time TIMESTAMP(3),
  WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
  'connector' = 'kafka',
  'topic' = 'clickstream',
  'properties.bootstrap.servers' = 'broker:9092',
  'scan.startup.mode' = 'earliest-offset' -- Bắt buộc cho quá trình Reprocessing
);
```

### Systemic Trade-off: Reprocessing Speed vs Compute Resources
Khi chạy lại luồng dữ liệu của 3 năm (vài Petabytes), Job sẽ cố kéo dữ liệu nhanh nhất có thể. Điều này dẫn đến **Network Spikes** và CPU throttling cho toàn bộ Kafka cluster, ảnh hưởng trực tiếp đến các real-time consumers khác.
- **Tuning:** Cần cấu hình Rate Limiting hoặc cô lập tài nguyên cho các Catch-up Jobs để tránh DDoS chính hệ thống Kafka của mình.

---

## 5. Operational Risks: State Management & OOM

Đây là tử huyệt của kiến trúc Kappa. Stream Processing (đặc biệt là các phép Join hoặc Long-Window Aggregation) yêu cầu duy trì **State** (Trạng thái).

Ví dụ: Bạn cần tính tổng doanh thu của User trong 30 ngày. Hệ thống phải giữ lại thông tin (State) của User đó trong suốt 30 ngày.
- Khi Replay lịch sử với tốc độ cao, State này phình to cực nhanh. Nếu dùng RAM thuần túy (`HashMapStateBackend`), Job Manager / Task Manager sẽ ngay lập tức dính **Out Of Memory (OOM)** và sập.
- **Fix:** Phải cấu hình Flink sử dụng **RocksDB State Backend** (hoặc State Stores trong Kafka Streams). RocksDB ghi state xuống ổ đĩa cục bộ (Local Disk) dưới dạng SSTables và chỉ cache một phần lên RAM, sau đó checkpoint định kỳ ra S3. 

```yaml
# flink-conf.yaml cho Production Kappa
state.backend: rocksdb
state.backend.incremental: true # Bắt buộc để checkpoint nhanh, chống phình State
state.checkpoints.dir: s3://my-bucket/flink-checkpoints/
```

---

## 6. Late Events & Watermarks (Sự Kiện Đến Trễ)

Ở môi trường Batch, do dữ liệu đã tĩnh (bounded), bạn chỉ việc count. Ở môi trường Stream, mạng di động có thể mất sóng, một event sinh ra lúc 8:00 AM nhưng 12:00 PM mới chui vào Kafka. 

Kappa giải quyết bằng **Watermarks** (Mốc nước thời gian logic). Watermark là một threshold nói với hệ thống rằng: *"Tôi tin là không còn sự kiện nào cũ hơn thời điểm X nữa, hãy đóng Window và tính toán đi"*. 

*Trade-off cốt lõi:* 
- Nếu set Watermark quá ngắn (VD: trễ 1 phút): Hệ thống chạy nhanh (Low Latency), nhưng bỏ lỡ dữ liệu trễ $\rightarrow$ **Độ chính xác thấp (Data Loss)**.
- Nếu set Watermark quá dài (VD: trễ 1 tiếng): Dữ liệu chính xác tuyệt đối, nhưng kết quả bị delay 1 tiếng $\rightarrow$ **Mất đi tính Real-time**.

Kiến trúc Kappa buộc bạn phải thiết kế cơ chế **Allowed Lateness**, chấp nhận việc cập nhật lại bản ghi trong Serving Layer (như `ReplacingMergeTree` của ClickHouse) khi có sự kiện trễ.

---

## Tổng Kết: Kappa vs Lambda Dưới Góc Nhìn Staff

1. **Lambda an toàn nhưng đắt đỏ và phức tạp:** Việc duy trì 2 codebase song song (Spark cho Batch, Flink cho Stream) tạo ra Nợ kỹ thuật (Tech Debt) lớn. Việc hợp nhất (merge) kết quả luôn tiềm ẩn nguy cơ "double counting" [đếm trùng].
2. **Kappa tinh gọn nhưng phức tạp về hạ tầng:** Một codebase duy nhất, dễ CI/CD. Tuy nhiên, nó đẩy mọi gánh nặng khó nhất của khoa học máy tính phân tán (State Management, Time skew, Checkpointing, FinOps) về phía Stream Processor.

Với sự tiến bộ của Apache Flink và sự ra đời của các chuẩn Iceberg/Delta Lake, Streaming đang dần lấn át Batch. Kappa (hoặc các biến thể Lakehouse streaming) đang là thiết kế chuẩn mực (defacto) cho thập kỷ tới.

## Nguồn Tham Khảo
* [Questioning the Lambda Architecture - Jay Kreps][https://www.oreilly.com/radar/questioning-the-lambda-architecture/]
* [Apache Flink State Backends (RocksDB]][https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/state_backends/]
* [KIP-405: Kafka Tiered Storage][https://cwiki.apache.org/confluence/display/KAFKA/KIP-405%3A+Kafka+Tiered+Storage]
* [Streaming Systems: The What, Where, When, and How of Large-Scale Data Processing - Tyler Akidau](https://www.oreilly.com/library/view/streaming-systems/9781491983867/)
