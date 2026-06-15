---
title: "Uber Kafka: Vận hành Kafka ở quy mô Petabyte"
description: "Mổ xẻ kiến trúc Kafka tại Uber với hàng nghìn tỷ tin nhắn mỗi ngày. Phân tích KIP-405 Tiered Storage, uForwarder Proxy và Federated Clusters trong môi trường Production."
lastUpdated: 2026-06-15
tags: ["data-engineering", "architecture", "kafka", "real-time"]
---

Uber sở hữu một trong những hệ thống Apache Kafka lớn nhất thế giới, xử lý hàng nghìn tỷ (trillions) tin nhắn mỗi ngày, tương đương nhiều petabyte dữ liệu với băng thông xấp xỉ 89 GB/s. Để đạt được quy mô này mà không làm sập hệ thống hay đốt tiền vào hạ tầng, đội ngũ Data Platform của Uber không chỉ dùng Kafka theo cách thông thường mà phải thiết kế lại các thành phần cốt lõi, đóng góp ngược lại KIP-405 (Tiered Storage) cho cộng đồng mã nguồn mở, và xây dựng các proxy chuyên biệt như uForwarder.

## 1. Bài Toán và Bối Cảnh (The Problem & Context)

Với Uber, Kafka là xương sống cho gần như mọi luồng dữ liệu thời gian thực: từ tính toán cước phí (Dynamic Pricing), phát hiện gian lận, ghép cuốc (Rider-Driver matching), đến việc ingest dữ liệu vào Data Lakehouse (HDFS/Iceberg) thông qua Presto và Spark.

Tuy nhiên, khi scale Kafka đến quy mô hàng nghìn microservices, họ gặp phải 3 "điểm nghẽn" (bottlenecks) tử huyệt:
1. **Coupling Storage và Compute:** Kafka truyền thống lưu dữ liệu trên ổ cứng nội bộ (Local Disk) của Broker. Khi cần tăng thời gian lưu trữ (retention) để phục vụ cho các job xử lý lại dữ liệu (backfill), họ buộc phải thêm Broker node. Điều này dẫn đến sự lãng phí khổng lồ về CPU và RAM vốn không cần thiết.
2. **Head-of-Line Blocking và Operational Overhead tại Consumer:** Standard Kafka Consumer hoạt động theo cơ chế Pull (kéo). Nếu một message bị lỗi khi xử lý, nó chặn toàn bộ các message phía sau trong cùng một partition (Head-of-line blocking). Hơn nữa, hàng nghìn dịch vụ bằng các ngôn ngữ khác nhau (Go, Java, Python) đều phải tự viết logic quản lý Offset, Retry, Dead-letter Queue (DLQ), tạo ra nợ kỹ thuật (technical debt) khổng lồ.
3. **Blast Radius (Phạm vi ảnh hưởng):** Một cụm Kafka khổng lồ nếu "sập" sẽ kéo theo sự ngưng trệ của toàn bộ hệ thống Uber trên toàn cầu.

## 2. Kiến trúc Hệ thống (System Architecture Deep Dive)

Để giải quyết các bài toán trên, Uber đã tái cấu trúc Kafka theo 3 trụ cột chính:

### 2.1. KIP-405 Tiered Storage (Tách biệt Storage và Compute)
Uber chia hệ thống lưu trữ Kafka thành 2 Tier (Cấp độ):
- **Local Tier (Tier 1):** Lưu trữ dữ liệu "nóng" (recent data) trong vài giờ trên ổ cứng Local SSD/NVMe cực nhanh của Broker để phục vụ cho luồng Real-time (Low-latency).
- **Remote Tier (Tier 2):** Các segment dữ liệu "lạnh" (older data) được tự động đẩy (offload) sang Object Storage (như HDFS, S3, hoặc GCS). RemoteLogManager và RemoteStorageManager là các component nội bộ tự động hóa luồng này mà không cần các script đồng bộ ngoài.

### 2.2. uForwarder: Push-based Consumer Proxy
Thay vì để các dịch vụ trực tiếp dùng Kafka Consumer Client kéo (Pull) dữ liệu, Uber đứng giữa Kafka và Microservices bằng **uForwarder** (đã mã nguồn mở).
- Đây là một gRPC-based Proxy. uForwarder sẽ "Pull" dữ liệu từ Kafka, sau đó "Push" xuống cho các service.
- Quản lý Offset được tập trung tại uForwarder.
- Nó hỗ trợ sẵn Retry Queue và Dead-Letter Queue (DLQ). Nếu một message bị lỗi, nó được ném vào DLQ để xử lý sau, giải phóng phân vùng (Partition) để các message khác tiếp tục chạy, loại bỏ hoàn toàn hiện tượng Head-of-Line blocking.

### 2.3. Federated Clusters (Phân rã cụm)
Thay vì một Mega-Cluster, Uber chia Kafka thành hàng chục cụm nhỏ hơn (Federated Clusters), mỗi cụm khoảng 150 nodes.
Họ xây dựng các công cụ như **uReplicator** (bản nâng cấp của MirrorMaker) để đồng bộ dữ liệu chéo (Active-Active Replication) giữa các Data Center theo khu vực địa lý, đảm bảo High Availability (HA).

## 3. Quyết định Thiết kế và Trade-offs (Design Decisions)

### Pull-based (Kafka native) vs Push-based (Proxy)
- **Trade-off:** Dùng proxy trung gian (uForwarder) có thể làm tăng độ trễ mạng (Network hop latency) thêm vài mili-giây so với việc Pull trực tiếp từ Kafka Broker.
- **Tại sao chọn:** Đổi lại độ trễ nhỏ này, Uber đạt được sự ổn định tuyệt đối (Reliability) và tối ưu hóa tài nguyên. Các service có thể scale thread xử lý độc lập với số lượng Kafka partition. Nó giải phóng lập trình viên khỏi gánh nặng quản lý offset/retry.

### Local SSD vs Remote Object Storage
- **Trade-off:** Đọc dữ liệu từ Object Storage (Remote) luôn chậm hơn so với đọc từ ổ đĩa NVMe cục bộ. Nếu có một job backfill đọc lượng lớn data lạnh, nó sẽ chịu độ trễ cao.
- **Tại sao chọn:** Lợi ích về chi phí (Cost Efficiency) là quá lớn. Object Storage rẻ hơn nhiều. Đồng thời, kiến trúc này giúp việc Rebalance partition hoặc khôi phục node bị chết (Node recovery) diễn ra nhanh chóng, do lượng dữ liệu phải copy giữa các Broker được giảm thiểu (chỉ copy phần hot data).

## 4. Những Bài Học Thực Tiễn (Production Lessons Learned)

- **Giảm Blast Radius:** Chiến lược Federated Clusters là minh chứng rõ nhất cho việc "không bỏ tất cả trứng vào một giỏ". Khi một cụm gặp sự cố (ví dụ OOM hoặc Controller bị lỗi), nó chỉ ảnh hưởng đến một nhóm dịch vụ (hoặc một khu vực) thay vì toàn bộ Uber toàn cầu.
- **Chống OOM và Disk Full:** Bằng cách offload dữ liệu lạnh, Uber giải quyết được bài toán đầy ổ đĩa (Disk Full) vốn rất ám ảnh với Data Engineer vận hành Kafka.
- **Giải quyết Head-of-line blocking:** Push-based Proxy chứng minh sự ưu việt trong môi trường Microservice phức tạp. Không còn cảnh một message lỗi làm tắc nghẽn luồng xử lý đơn hàng hay luồng định giá.

## Tài liệu Tham khảo

1. **[Introducing uForwarder: The Consumer Proxy for Kafka Async Queuing](https://www.uber.com/blog/uforwarder/):** Tech Blog từ Uber giải thích kiến trúc và lý do ra đời của uForwarder Proxy.
2. **[Introduction to Kafka Tiered Storage at Uber](https://www.uber.com/en-JP/blog/kafka-tiered-storage/):** Bài viết gốc phân tích KIP-405, đi sâu vào thiết kế decoupling compute và storage, giúp Uber tiết kiệm chi phí khổng lồ.
3. **[Petabyte Scale Kafka with Tiered Storage](https://www.uber.com/en-IN/blog/petabyte-scale-kafka-with-tiered-storage/):** Chi tiết vận hành Kafka lưu trữ phân tầng tại Uber.
