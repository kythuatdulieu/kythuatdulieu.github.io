---
title: "Xử lý dữ liệu theo lô - Batch Processing"
difficulty: "Intermediate"
tags: ["batch-processing", "distributed-systems", "apache-spark", "mapreduce", "shuffle"]
readingTime: "13 mins"
lastUpdated: 2026-06-07
seoTitle: "Xử lý dữ liệu theo lô - Cẩm nang Batch Processing phân tán"
metaDescription: "Tìm hiểu toàn diện về Batch Processing: định nghĩa, kiến trúc xử lý phân tán MapReduce vs Spark, cơ chế Shuffle, lỗi Data Skew và các kỹ thuật tối ưu hóa Spark Job."
description: "Trong thế giới kỹ thuật dữ liệu, nếu xử lý dòng ([Streaming Processing](/concepts/5-streaming-processing/streaming-processing/)) được ví như dòng nước chảy liên tục, thì xử lý theo lô (Batch Processing) giống như việc gom góp nước vào một hồ chứa khổng lồ rồi xử lý tất cả trong một lần. Đây là trụ cột vững chắc của mọi hệ thống dữ liệu."
---



Trong thế giới kỹ thuật dữ liệu, nếu xử lý dòng ([Streaming Processing](/concepts/5-streaming-processing/streaming-processing/)) được ví như dòng nước chảy liên tục cần xử lý ngay lập tức, thì **xử lý theo lô (Batch Processing)** giống như việc gom góp nước vào một hồ chứa khổng lồ rồi đưa qua nhà máy lọc nước để xử lý toàn bộ trong một đợt. 

Batch Processing (Xử lý theo lô) là mô hình tính toán trên các tập dữ liệu lớn đã được thu thập trong một khoảng thời gian nhất định (ví dụ: một giờ, một ngày, hoặc một tháng) và chạy theo định kỳ (được lập lịch). Dù thế giới ngày nay luôn khao khát dữ liệu theo thời gian thực (real-time), Batch Processing vẫn là "xương sống" và chiếm đến hơn 80% khối lượng công việc của bất kỳ hệ thống Data Engineering nào vì tính ổn định, dễ quản lý và chi phí tối ưu.

---

## 1. Bản chất và Đặc điểm của Batch Processing



Batch Processing làm việc trên mô hình **Bounded Data** (Dữ liệu có giới hạn). Khi một Batch Job bắt đầu, nó biết chính xác kích thước dữ liệu đầu vào (bao nhiêu files, bao nhiêu rows, bao nhiêu Terabytes) và nó sẽ kết thúc khi toàn bộ dữ liệu này được xử lý xong.

### Các đặc trưng chính:
1. **Độ trễ cao (High Latency)**: Không phù hợp cho các ứng dụng cần phản hồi tính bằng mili-giây. Kết quả của Batch Processing thường có sẵn sau vài phút, vài giờ hoặc thậm chí là ngày hôm sau.
2. **Khối lượng lớn (High Volume)**: Xử lý hiệu quả từ vài Gigabytes đến hàng Petabytes dữ liệu một lúc mà các công cụ xử lý đơn luồng (như Python pandas trên máy cá nhân) không thể làm được.
3. **Chi phí tối ưu (Cost Efficiency)**: Các Batch Jobs thường được chạy vào ban đêm hoặc giờ thấp điểm khi chi phí thuê server (như Spot Instances trên AWS/GCP) rẻ nhất.
4. **Dễ tái tạo và khắc phục lỗi (Reproducibility & Fault Tolerance)**: Nếu job chạy lỗi ở giữa chừng, rất dễ dàng chạy lại (rerun) toàn bộ batch data đó (Backfill) mà không lo ảnh hưởng đến hệ thống, miễn là các task được thiết kế theo hướng **Idempotent** (chạy bao nhiêu lần kết quả vẫn ra giống nhau).

---

## 2. Kiến trúc Xử lý Phân tán (Distributed Processing)

Khi dữ liệu vượt quá giới hạn RAM và Disk của một chiếc máy chủ (Dữ liệu lớn - Big Data), chúng ta không thể "Scale Up" (mua máy xịn hơn) mãi được, mà phải "Scale Out" (ghép nhiều máy bình thường lại với nhau thành một cụm - Cluster).

Có 2 thế hệ Compute Engines nổi bật nhất trong lịch sử Batch Processing:

### 2.1 Hadoop MapReduce (Thế hệ 1)
Tiên phong bởi Google và Yahoo, mô hình MapReduce chia quá trình tính toán thành hai giai đoạn chính:
* **Map**: Chia dữ liệu thành từng mảnh nhỏ và xử lý song song trên nhiều nodes. Các nodes sẽ filter, parse dữ liệu và emit ra dạng cặp `(Key, Value)`.
* **Reduce**: Tổng hợp (Aggregate) các kết quả có chung `Key` từ các nodes khác nhau để cho ra kết quả cuối cùng.

**Nhược điểm chí mạng của MapReduce**: Mọi bước trung gian đều phải **ghi và đọc từ Ổ Cứng (Disk - HDFS)** để đảm bảo an toàn nếu có node chết. Việc tương tác với Disk liên tục khiến MapReduce cực kỳ chậm chạp với các tác vụ phức tạp cần nhiều vòng lặp (như Machine Learning).

### 2.2 Apache Spark (Thế hệ 2 - In-Memory Computing)
Spark ra đời giải quyết triệt để điểm yếu của MapReduce. Spark tận dụng sức mạnh của **RAM (Memory)**. 
Thay vì viết xuống Disk sau mỗi bước, Spark giữ toàn bộ dữ liệu trung gian trên RAM (Resilient Distributed Datasets - RDDs hoặc DataFrames). Nhờ đó, Spark nhanh hơn MapReduce đến **100 lần** khi lưu dữ liệu trong bộ nhớ và nhanh hơn gấp 10 lần ngay cả khi phải đọc ghi trên Disk.
Spark hiện nay là tiêu chuẩn vàng (de facto) cho Batch Processing.

> **Đọc thêm:** Chi tiết về kiến trúc [Apache Spark](/concepts/4-compute-engines-batch/apache-spark) và [Spark Execution Model](/concepts/4-compute-engines-batch/spark-execution-model).

---

## 3. Các Khái niệm Cốt lõi Trong Xử lý Batch (Đặc biệt với Spark)

Để làm chủ Batch Processing, bạn cần hiểu sâu sắc về cách dữ liệu di chuyển trong một hệ thống phân tán.

### 3.1 Partitioning (Phân vùng dữ liệu)
Không một Executor (máy Worker) nào xử lý toàn bộ dữ liệu. Dữ liệu đầu vào (ví dụ: file Parquet 1TB trên S3) sẽ được cắt thành hàng ngàn cục nhỏ gọi là **Partitions**.
Mỗi Core (CPU) trên một Executor sẽ gắp 1 Partition lên RAM để xử lý độc lập. Việc chia đúng số lượng và kích thước Partition quyết định tốc độ của toàn bộ Job.
> **Tìm hiểu sâu hơn:** [Spark Partitions](/concepts/4-compute-engines-batch/spark-partition)

### 3.2 Cơ chế Shuffle (Nỗi ám ảnh kinh hoàng)
**Shuffle** xảy ra khi chúng ta thực hiện các hàm Gom nhóm (Group By) hoặc Nối bảng (Join). Do dữ liệu ban đầu nằm rải rác trên nhiều node, khi cần nhóm các ID giống nhau lại, dữ liệu bắt buộc phải di chuyển qua mạng (Network) từ Node này sang Node khác.
Shuffle là nguyên nhân chính gây ra chậm trễ, nghẽn mạng và tốn Disk I/O. Tối ưu hóa Batch Job thường bắt đầu bằng việc: **Làm sao để giảm thiểu Shuffle?**
> **Đọc thêm về Shuffle:** [Hiểu rõ cơ chế Shuffle](/concepts/4-compute-engines-batch/shuffle)

### 3.3 Lệch Dữ Liệu (Data Skew)
Hãy tưởng tượng bạn chạy `GROUP BY city` ở Việt Nam. Khả năng cao partition chứa dữ liệu "Hồ Chí Minh" và "Hà Nội" sẽ to gấp 50 lần các tỉnh khác.
Hậu quả là: 99 task (xử lý tỉnh nhỏ) chạy xong trong 1 phút, nhưng toàn bộ Job phải đợi 1 task (xử lý TP.HCM) kẹt lại chạy suốt 1 tiếng đồng hồ, thậm chí văng lỗi **Out of Memory (OOM)**.
Đây gọi là lỗi Data Skew - Căn bệnh nan y nhất của Batch Processing.
> **Cách trị Data Skew:** [Kỹ thuật Salting xử lý Data Skew](/concepts/4-compute-engines-batch/spark-data-skew-salting)

### 3.4 Distributed Joins (Join Phân Tán)
Join trong hệ thống phân tán không đơn giản như trong SQL bình thường. Để nối hai bảng khổng lồ, hệ thống có nhiều thuật toán:
* **Broadcast Hash Join**: Copy toàn bộ bảng nhỏ gửi tới tất cả các máy đang chứa bảng lớn. Cực nhanh, không tốn Shuffle, nhưng chỉ dùng được khi bảng cực kỳ nhỏ (thường < 10MB).
* **Sort Merge Join / Shuffle Hash Join**: Phải shuffle cả 2 bảng dựa trên khóa Join để đảm bảo các record cùng khóa tụ về cùng một Node, sau đó mới thực hiện Sort và Merge lại.
> **Khám phá các loại Joins:** [Distributed Joins Mechanisms](/concepts/4-compute-engines-batch/distributed-joins-mechanisms)

---

## 4. Vòng đời của một hệ thống Batch Data Pipeline

Một pipeline điển hình để xử lý dữ liệu Batch thường được cấu trúc dưới dạng **ELT (Extract, Load, Transform)** hoặc **ETL**:

1. **Ingestion (Thu thập)**: Các công cụ như Airbyte, Fivetran hoặc kịch bản tự viết sẽ lấy dữ liệu từ cơ sở dữ liệu nguồn (PostgreSQL, MySQL, APIs) lúc nửa đêm và đẩy dữ liệu thô (Raw) vào Data Lake (như Amazon S3, GCS) dưới định dạng JSON, CSV hoặc Parquet.
2. **Processing/Transformation (Xử lý)**:
    * Job Apache Spark chạy trên EMR / Dataproc, hoặc các câu lệnh dbt chạy trên BigQuery / Snowflake.
    * Thực hiện làm sạch dữ liệu (Data Cleaning), lọc bỏ dữ liệu Null, Join với các bảng Dimension, tính toán tổng doanh thu.
3. **Serving (Phân phối)**: Dữ liệu đã xử lý sạch sẽ, được tổng hợp (Aggregated) sẽ ghi vào Data Warehouse thành các bảng Rộng (Wide Tables) hoặc mô hình Star-Schema để kết nối trực tiếp với Tableau, PowerBI cho Data Analyst vẽ báo cáo buổi sáng.
4. **Orchestration (Điều phối)**: Toàn bộ quá trình từ bước 1 tới bước 3 sẽ được các công cụ lập lịch như **Apache Airflow**, Dagster, Prefect theo dõi, tạo thành các chuỗi đồ thị DAG, kích hoạt báo động (Alert) lên Slack nếu có bất kỳ bước nào thất bại.

---

## 5. Ứng dụng phổ biến của Batch Processing

* **Báo cáo định kỳ (Reporting & BI)**: Tính toán Doanh thu, Chi phí, Tỷ lệ Lợi nhuận hàng ngày/tuần/tháng cho Ban Giám Đốc.
* **Huấn luyện Machine Learning (Model Training)**: Quét qua dữ liệu lịch sử hàng chục năm của khách hàng để tạo ra mô hình dự đoán hành vi gian lận (Fraud Detection) hoặc Gợi ý sản phẩm (Recommendation System).
* **Billing / Tính cước**: Các công ty Viễn thông, Điện nước gom lại log sử dụng để phát hành hóa đơn vào cuối tháng thay vì xuất từng đồng một.
* **Đồng bộ hóa dữ liệu cốt lõi (Core Data Sync)**: Tạo các bảng Master Data, Customer 360 để phục vụ cho các hệ thống Marketing, CRM.

---

## 6. So Sánh Batch Processing và Streaming Processing

| Tiêu chí | Batch Processing | Streaming Processing |
| :--- | :--- | :--- |
| **Dữ liệu đầu vào** | Giới hạn (Bounded), có điểm dừng | Vô hạn (Unbounded), liên tục đến |
| **Độ trễ (Latency)** | Phút, Giờ, Ngày | Mili-giây đến vài giây |
| **Chi phí** | Thấp, dễ dự đoán | Khá đắt, hệ thống phải luôn bật (Always-on) |
| **Độ phức tạp** | Dễ vận hành, dễ debug và backfill | Rất phức tạp (Out-of-order data, Watermarks, Windowing) |
| **Công cụ tiêu biểu** | Apache Spark, Hive, Snowflake, BigQuery | Apache Flink, Kafka Streams, Spark Structured Streaming |

*(Lưu ý: Thực tế hiện nay có mô hình **Micro-batching** trong Spark Streaming, chia luồng dữ liệu liên tục thành các lô cực nhỏ xử lý mỗi 1-5 giây. Nó nằm ở giữa Batch và Real-time Streaming).*

---

## Tổng kết

Batch Processing là một trong những khái niệm nền tảng lâu đời nhất nhưng vẫn không ngừng phát triển mạnh mẽ. Với sự tiến hóa của **Data Warehouse hiện đại (MPP Architecture)** và các Compute Engine In-Memory như **Spark**, khả năng xử lý khối lượng khổng lồ với chi phí thấp trong thời gian ngắn đã biến Batch Processing thành xương sống của mọi chiến lược Dữ liệu lớn (Big Data). 

Để thực sự giỏi thiết kế Batch Pipeline, một Kỹ sư Dữ liệu giỏi phải làm chủ nghệ thuật tối ưu hóa tài nguyên (CPU/Memory) và xử lý triệt để các bài toán khó nhằn như Shuffle, Data Skew hay OOM (Out of Memory).

---
## Tài Liệu Tham Khảo
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* **Presto: SQL on Everything - Facebook Engineering**
