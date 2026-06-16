---
title: "Real-time Architecture"
difficulty: "Advanced"
tags: ["architecture", "streaming", "real-time", "kafka", "flink"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Kiến trúc hệ thống dữ liệu Thời gian thực (Real-time Architecture)"
metaDescription: "Tìm hiểu kiến trúc dữ liệu thời gian thực, tầm quan trọng, các công nghệ như Kafka, Flink, CSDL In-memory và cách phân biệt với kiến trúc Batch truyền thống."
description: "Trong thế giới công nghệ hiện đại, dữ liệu không còn là những khối thông tin tĩnh lặng nằm im trong các ổ đĩa cứng chờ được xử lý vào cuối ngày. Dữ li..."
---



Real-time Architecture (Kiến trúc thời gian thực) là các thiết kế hệ thống đảm bảo độ trễ từ khi sự kiện xảy ra đến khi có trong báo cáo chỉ tính bằng giây hoặc mili-giây. Nó thường dựa vào các công cụ Event Streaming (Kafka), Stream Processing (Flink), và Real-time OLAP (Pinot/Druid).

Trong thế giới kinh doanh hiện đại, giá trị của dữ liệu thường giảm dần theo thời gian. Một giao dịch gian lận cần được phát hiện ngay lập tức, một khuyến mãi cần được gửi cho khách hàng ngay khi họ đang ở gần cửa hàng. Đây là những Use Cases (trường hợp sử dụng) bắt buộc phải có kiến trúc thời gian thực.

## Các Thành Phần Cốt Lõi (Core Components)

Một hệ thống dữ liệu thời gian thực thường được chia thành 3 phần chính: **Ingestion & Messaging**, **Stream Processing**, và **Serving & Real-time OLAP**.

### 1. Ingestion & Messaging Layer (Message Broker / Event Streaming)
Lớp này đóng vai trò như một bộ đệm (buffer) cực lớn và phân phối dữ liệu (Pub/Sub). Hệ thống cần xử lý khối lượng dữ liệu khổng lồ (High Throughput) với độ trễ thấp (Low Latency), đảm bảo không mất dữ liệu ngay cả khi hệ thống xử lý phía sau bị quá tải.

*   **Công nghệ tiêu biểu:** Apache Kafka, Apache Pulsar, AWS Kinesis, Google Cloud Pub/Sub.
*   **Đặc điểm:** Dữ liệu được lưu trữ dưới dạng Immutable Append-only Log (nhật ký chỉ thêm vào và không thể thay đổi). Phân vùng (Partitioning) dữ liệu cho phép mở rộng hệ thống theo chiều ngang (Horizontal Scaling).

### 2. Stream Processing Layer (Xử Lý Dòng Sự Kiện)
Thay vì chờ gom dữ liệu thành từng lô (Batch) như MapReduce hay Spark Batch, lớp này xử lý dữ liệu ngay khi nó vừa đến (Event-at-a-time hoặc Micro-batching).

*   **Công nghệ tiêu biểu:** Apache Flink, Apache Spark Streaming, Kafka Streams.
*   **Các tác vụ chính:**
    *   **Filtering & Transformation:** Lọc và biến đổi định dạng dữ liệu (ví dụ: JSON sang Avro/Parquet).
    *   **Stateful Processing & Windowing:** Thực hiện tính toán trên một khung thời gian (Tumbling, Sliding, Session Windows). Ví dụ: Tính tổng số tiền giao dịch của mỗi user trong 5 phút gần nhất.
    *   **Join Streams:** Kết hợp nhiều luồng dữ liệu khác nhau theo thời gian thực.

### 3. Serving & Real-time OLAP Layer
Đây là nơi lưu trữ kết quả đã xử lý hoặc cho phép truy vấn trực tiếp khối lượng dữ liệu khổng lồ với độ trễ sub-second (dưới 1 giây) phục vụ cho Dashboard, Cảnh báo (Alerts), hoặc Machine Learning Models.

*   **Công nghệ tiêu biểu:** Apache Druid, Apache Pinot, ClickHouse, Elasticsearch, Redis.
*   **Đặc điểm:** Indexing cực mạnh (Inverted index, Bitmap index), khả năng tối ưu query phân tán (Scatter-Gather) trên cả dữ liệu streaming và historical data.

## Lambda vs. Kappa Architecture

Khi xây dựng hệ thống dữ liệu, việc kết hợp xử lý Batch và Real-time là bài toán kinh điển. Có hai mô hình kiến trúc phổ biến nhất:

### Lambda Architecture
Kiến trúc này được giới thiệu bởi Nathan Marz (người tạo ra Apache Storm), sử dụng cả hai luồng xử lý riêng biệt: **Batch Layer** và **Speed Layer**.
*   **Speed Layer (Real-time):** Cung cấp kết quả tạm thời nhanh nhất có thể. Tuy nhiên, nó có thể không hoàn toàn chính xác hoặc bỏ sót do dữ liệu đến trễ (late-arriving data).
*   **Batch Layer:** Chạy định kỳ (ví dụ: mỗi đêm) trên toàn bộ dữ liệu Immutable. Nó tính toán kết quả chính xác tuyệt đối để "sửa sai" cho Speed Layer.
*   **Serving Layer:** Merge (kết hợp) kết quả từ Batch và Speed để trả về cho người dùng.
*   **Nhược điểm:** Phải duy trì hai bộ code (Logic xử lý cho Batch và cho Real-time thường viết bằng hai Framework khác nhau).

### Kappa Architecture
Được giới thiệu bởi Jay Kreps (đồng sáng lập Kafka), Kappa đơn giản hóa hệ thống bằng cách loại bỏ hoàn toàn Batch Layer. Mọi thứ đều được coi là một Stream.
*   Tất cả dữ liệu chạy qua một hệ thống Stream Processing duy nhất (ví dụ Flink).
*   Khi cần xử lý lại dữ liệu quá khứ (Backfilling / Reprocessing), ta chỉ cần "Tua lại" (Rewind) Offset của Kafka từ đầu và cho luồng dữ liệu chạy lại qua Stream Processing framework.
*   **Ưu điểm:** Chỉ phải duy trì một bộ code logic xử lý.
*   **Thách thức:** Cần Message Broker đủ mạnh để lưu trữ dữ liệu lịch sử lâu dài (Kafka Tiered Storage) và hệ thống Stream Processing xử lý đủ nhanh khi chạy lại lượng dữ liệu lớn.

## Các Thách Thức Kỹ Thuật Khi Làm Real-time

1.  **State Management (Quản lý trạng thái):** Khi xử lý dữ liệu Stateful (ví dụ đếm số lượng click), nếu Node bị crash, làm sao để phục hồi lại con số chính xác? Framework như Flink giải quyết bài toán này bằng Checkpointing (thuật toán Chandy-Lamport) kết hợp với State Backend như RocksDB.
2.  **Exactly-Once Processing Semantics (Xử lý chính xác một lần):** Đảm bảo rằng dù hệ thống có lỗi, mỗi sự kiện chỉ cập nhật kết quả đầu ra đúng một lần, không bị trùng (At-least-once) hay mất (At-most-once). Cần có sự kết hợp của Two-Phase Commit giữa Stream Processor và hệ thống đích (Sink).
3.  **Event Time vs. Processing Time & Watermarks:** Dữ liệu sinh ra tại thời điểm A (Event Time) nhưng có thể do mạng lag nên đến hệ thống xử lý tại thời điểm B (Processing Time). Để xử lý đúng thứ tự và không phải chờ đợi vô tận dữ liệu đến trễ, hệ thống sinh ra khái niệm Watermarks để đánh dấu ranh giới thời gian hợp lý.

## Khi Nào KHÔNG Nên Dùng Real-time Architecture?
Kiến trúc thời gian thực rất tốn kém (nhân lực, hạ tầng vận hành phức tạp). Đừng xây dựng hệ thống Real-time nếu:
*   Báo cáo chỉ cần xem vào cuối tháng/cuối tuần.
*   Chưa có văn hóa và quy trình "Hành động theo thời gian thực" (có báo cáo ngay lập tức nhưng quyết định lại chờ cuộc họp vào ngày mai).
*   Ngân sách hạn hẹp và hệ thống hiện tại chưa quá tải.

## Tài Liệu Tham Khảo
* [Designing Data-Intensive Applications - Martin Kleppmann (Part 2: Distributed Data)](https://dataintensive.net/)
* [The Log: What every software engineer should know about real-time data's unifying abstraction - Jay Kreps](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)
* **Streaming Systems - Tyler Akidau, Slava Chernyak, Reuven Lax**
* **Questioning the Lambda Architecture - Jay Kreps**
* [Apache Flink Architecture Documentation](https://flink.apache.org/flink-architecture.html)
