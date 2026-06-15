---
title: "GCP Streaming Pipeline: Deep-dive dự án Streamify"
description: "Mổ xẻ kiến trúc và luồng xử lý dữ liệu của dự án Streamify sử dụng Kafka và Spark Streaming trên Google Cloud Platform."
---

# GCP Streaming Pipeline: Deep-dive dự án Streamify

Trong bài viết này, chúng ta sẽ đi sâu vào kiến trúc và cách thức hoạt động của một dự án Data Engineering thực tế: **Streamify**. Đây là một dự án mã nguồn mở giả lập lại luồng xử lý sự kiện của một ứng dụng nghe nhạc trực tuyến (tương tự như Spotify), nơi hàng loạt các sự kiện (events) như nghe nhạc, chuyển trang, hoặc đăng nhập được sinh ra và xử lý theo thời gian thực.

## 1. Bức tranh toàn cảnh kiến trúc (Architecture)

Dự án sử dụng bộ công cụ rất phổ biến trong giới Data Engineering:
- **Nguồn phát sinh dữ liệu:** [Eventsim](https://github.com/Interana/eventsim) (sinh log sự kiện ảo).
- **Message Broker:** Apache Kafka.
- **Stream Processing:** Apache Spark (Spark Streaming).
- **Lưu trữ (Data Lake):** Google Cloud Storage (GCS).
- **Data Warehouse:** Google BigQuery.
- **Transformation:** dbt (Data Build Tool).
- **Orchestration:** Apache Airflow.
- **Infrastructure as Code (IaC):** Terraform.

Kiến trúc tổng thể của Streamify hoạt động theo mô hình ELT (Extract - Load - Transform), kết hợp với luồng xử lý streaming để đưa dữ liệu thô vào Data Lake liên tục mỗi 2 phút, trước khi các batch job (Airflow + dbt) chạy hàng giờ để tổng hợp lên Data Warehouse.

## 2. Quyết định thiết kế: Tại sao dùng Kafka thay vì Pub/Sub?

Khi triển khai trên Google Cloud Platform (GCP), một câu hỏi rất tự nhiên là: *"Tại sao không dùng luôn Google Cloud Pub/Sub cho tiện mà lại tự host Kafka?"*

Việc lựa chọn **Apache Kafka** trong kiến trúc này mang lại những bài học và sự đánh đổi rõ rệt:

1. **Tránh Vendor Lock-in (Tính di động):** Kafka là một giải pháp mã nguồn mở và cloud-agnostic. Một khi pipeline đã chạy ổn định với Kafka, bạn có thể dễ dàng bứng toàn bộ hệ thống này sang AWS (dùng MSK) hoặc On-premise mà không phải sửa đổi lại code ứng dụng. Pub/Sub là dịch vụ độc quyền của GCP.
2. **Khả năng quản lý State và Replay data:** Kafka lưu trữ dữ liệu dưới dạng commit log, cho phép Spark Streaming có thể dễ dàng quản lý offset, thực hiện replay lại dữ liệu từ quá khứ nếu có lỗi xảy ra. Mặc dù Pub/Sub có hỗ trợ lưu trữ, Kafka mang lại sự kiểm soát chi tiết hơn về mặt partition và độ trễ.
3. **Mục đích học tập và mức độ phổ biến:** Trong hệ sinh thái Data Engineering, Kafka gần như là một chuẩn mực cho streaming. Tự tay triển khai và tích hợp Kafka mang lại kinh nghiệm xử lý lỗi và quản lý hạ tầng (Zookeeper, Kafka Broker) - điều mà Pub/Sub (Serverless) che giấu đi.
4. **Sự đánh đổi (Trade-off):** Đổi lại tính linh hoạt, người kỹ sư phải tự quản lý việc cấp phát tài nguyên, giám sát sức khỏe của cụm Kafka. Tác giả dự án cũng đã nhận định trong phần cải tiến rằng việc chuyển sang "Managed Infra" như Confluent Cloud sẽ giúp giảm bớt gánh nặng vận hành này.

## 3. Mổ xẻ luồng xử lý của Spark Streaming

Trung tâm của hệ thống xử lý thời gian thực trong Streamify là **Spark Streaming**. Hãy cùng xem xét cách nó tiêu thụ và xử lý dữ liệu từ Kafka.

Spark Streaming trong dự án thực hiện một luồng công việc bao gồm: **Đọc -> Parse -> Enrich -> Lưu trữ**.

### Các bước xử lý chi tiết:
- **Subscribe vào Kafka Topics:** Spark liên kết đến 3 topic chính của Kafka: `listen_events`, `page_view_events`, và `auth_events`. Nó sử dụng `DataStreamReader` với chế độ lấy dữ liệu từ `earliest` (cũ nhất chưa đọc).
- **Giải mã JSON (Parse):** Dữ liệu từ Kafka đến dưới dạng chuỗi byte nhị phân hoặc string. Spark áp dụng hàm `from_json` cùng với schema định nghĩa sẵn để bóc tách (flatten) thành các cột dữ liệu có cấu trúc.
- **Enrich dữ liệu (Thêm thời gian):** Trường timestamp `ts` (dạng milliseconds) được chuyển thành kiểu Timestamp. Spark tính toán và tạo thêm các cột `year`, `month`, `day`, `hour`. Việc này có mục đích cực kỳ quan trọng: **phân vùng (partitioning) dữ liệu khi lưu trữ xuống Data Lake**.
- **Xử lý lỗi Encoding:** Đối với các log nghe nhạc (`listen_events`), Spark xử lý lỗi chuỗi Unicode (octal-escaping) qua một UDF `string_decode` để đảm bảo tên bài hát và ca sĩ hiển thị chính xác.
- **Micro-batching xuống GCS:** Dữ liệu cuối cùng được ghi dưới định dạng **Parquet** xuống Google Cloud Storage. Spark dùng cơ chế `trigger(processingTime="120 seconds")`, nghĩa là cứ mỗi 2 phút, một micro-batch sẽ được gom lại và đẩy lên GCS, chia thư mục theo dạng `month=.../day=.../hour=...`. 

Sử dụng định dạng Parquet kết hợp với phân vùng theo giờ/ngày giúp các truy vấn của BigQuery (external table) sau này diễn ra nhanh chóng và tiết kiệm chi phí quét dữ liệu.

## 4. Đánh đổi & Bài học Production

Khi đưa một mô hình như Streamify lên môi trường Production thực tế, có một số điểm đánh đổi (Trade-offs) và bài học rút ra:

1. **Vấn đề "Small Files" (Các file quá nhỏ):** 
   - **Thực tế:** Việc trigger Spark ghi file mỗi 2 phút sẽ tạo ra hàng nghìn file Parquet rất nhỏ trên GCS trong một khoảng thời gian dài.
   - **Hệ quả:** Khi BigQuery hay Spark đọc lại dữ liệu này, hiệu suất sẽ bị giảm đáng kể do độ trễ (latency) khi phải mở quá nhiều file (Small files problem).
   - **Bài học:** Trong môi trường Production, cần cân nhắc tăng thời gian trigger (ví dụ 5-10 phút) nếu độ trễ này chấp nhận được, hoặc phải chạy thêm một job định kỳ để gom (compact) các file nhỏ thành các file lớn hơn.
2. **Xử lý Batch vs Incremental (dbt):**
   - **Thực tế:** Các model trong dbt của dự án đang chạy theo dạng "full refresh" (xây dựng lại toàn bộ bảng dimension/fact mỗi giờ).
   - **Bài học:** Khi dữ liệu lên đến hàng Terabyte, việc tính toán lại toàn bộ sẽ làm chi phí BigQuery tăng vọt và chạy rất chậm. Cần phải áp dụng các **Incremental Models** của dbt để chỉ transform và insert những dữ liệu mới được đưa vào GCS trong vòng 1 giờ qua.
3. **Quản lý hạ tầng bằng Terraform:**
   - Việc dùng Terraform giúp dễ dàng spin-up và tear-down cụm máy chủ, tiết kiệm chi phí học tập. Trên Production, các cụm Kafka và Spark tự host (Compute Engine) nên được thay thế bằng các dịch vụ quản lý (Dataproc cho Spark, Confluent cho Kafka, hoặc Composer cho Airflow) để đảm bảo tính sẵn sàng cao (High Availability) mà không mất công maintain.

## 5. Dashboard phân tích

Sau khi dữ liệu thô được đưa vào BigQuery và được làm sạch/tổng hợp qua dbt, Google Data Studio (Looker Studio) được sử dụng để trực quan hóa. Dashboard phản ánh các chỉ số như: số lượng người dùng hoạt động, top các bài hát được nghe nhiều nhất, hay tỷ lệ chuyển đổi.

![Dashboard](https://raw.githubusercontent.com/ankurchavda/streamify/main/images/dashboard.png)

Tài liệu Tham khảo
- [Base Repository: ankurchavda/streamify](https://github.com/ankurchavda/streamify)
- [GCP Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Apache Kafka Official Documentation](https://kafka.apache.org/documentation/)
- [Spark Structured Streaming Programming Guide](https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html)
