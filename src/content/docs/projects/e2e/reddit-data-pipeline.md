---
title: "Hướng Dẫn Dự Án Data Engineering End-to-End: Reddit API, Airflow & Amazon Redshift"
description: "Phân tích và xây dựng một dự án Data Engineering thực tế (End-to-End), thu thập dữ liệu từ Reddit API, điều phối bằng Apache Airflow, xử lý với AWS Glue và phân tích trên Amazon Redshift."
---

Trong bài viết này, chúng ta sẽ đi sâu vào việc thiết kế và triển khai một kiến trúc Data Pipeline phân tán, một trong những project kinh điển giúp rèn luyện tư duy Data Engineering theo chuẩn FAANG. Hệ thống này sử dụng API của Reddit để lấy dữ liệu thô, sử dụng **Apache Airflow** để điều phối, và lưu trữ dữ liệu tại **Amazon Redshift** sau khi đã qua bước Transform bằng **AWS Glue** và **Amazon Athena**.

Dự án không chỉ tập trung vào việc ghép nối các công cụ lại với nhau (duct-tape engineering), mà còn đi sâu vào các vấn đề kỹ thuật nâng cao như **Out of Memory (OOM)** khi xử lý batch lớn, **Data Skew** trong hệ thống cơ sở dữ liệu phân tán (Distributed Database), và cách xử lý Rate Limit của một API phổ biến.

## Kiến Trúc Tổng Thể (Architecture Diagram)



Kiến trúc bên dưới mô phỏng mô hình **ELT (Extract, Load, Transform)**, tối ưu cho các hệ thống Cloud-native hiện đại. Thay vì Transform trực tiếp trong lúc kéo dữ liệu (ETL cổ điển), hệ thống dump thẳng raw data vào S3 (Data Lake) trước, đảm bảo an toàn dữ liệu và khả năng xử lý lại (replayability) trong trường hợp pipeline bị lỗi logic ở các bước sau.



### Các thành phần chính trong hệ thống:
1. **Reddit API (PRAW)**: Đóng vai trò là Source Data, cung cấp metadata của các bài đăng (posts), bình luận (comments), và chỉ số tương tác (upvotes, downvotes) của các subreddit.
2. **Apache Airflow & Celery**: Airflow đóng vai trò "nhạc trưởng" (Orchestrator). Celery Executor được cấu hình để phân tán các tác vụ (Task) ra nhiều Worker, tối ưu hóa quá trình chạy song song (Parallel execution).
3. **PostgreSQL**: Lưu trữ metadata của chính Airflow (các log về DAG runs, task status, retries).
4. **Amazon S3**: Đóng vai trò là **Landing Zone (Data Lake)**. Dữ liệu thô (JSON/CSV) từ Reddit API được tải thẳng lên S3 mà không qua biến đổi.
5. **AWS Glue & Amazon Athena**: AWS Glue Crawler quét S3 để suy diễn schema (Schema Inference) và tạo Data Catalog. Athena cung cấp khả năng truy vấn dữ liệu thô trên S3 thông qua SQL tiêu chuẩn (Presto-based). Glue Jobs (thường viết bằng PySpark) dùng để làm sạch và chuyển định dạng dữ liệu từ CSV/JSON sang Parquet.
6. **Amazon Redshift**: Một Data Warehouse dạng cột (Columnar Database) tối ưu cho việc truy vấn phân tích khối lượng lớn (OLAP). Redshift sẽ COPY dữ liệu Parquet từ S3 vào các bảng fact/dimension để Metabase hoặc Tableau query.

---

## Luồng Dữ Liệu Chuyên Sâu (Deep Dive Data Flow)

### 1. Extract: Từ Reddit API đến Airflow Worker
Quá trình bắt đầu khi Airflow kích hoạt một DAG (Directed Acyclic Graph) được lập lịch (ví dụ: chạy mỗi giờ). Trong task đầu tiên, Python sử dụng thư viện **PRAW (Python Reddit API Wrapper)** để gọi Reddit API. 

Tại đây, Engineer phải đối mặt với hai vấn đề kỹ thuật lớn:
- **API Rate Limits**: Reddit giới hạn số lượng request (thường là 60-100 requests mỗi phút cho OAuth clients). Nếu vi phạm, bạn sẽ nhận mã lỗi `HTTP 429 Too Many Requests`. 
  - *Giải pháp*: Airflow DAG cần được thiết lập cơ chế `retries` và `retry_delay`. Ví dụ: `retries=3, retry_delay=timedelta(minutes=5)`. Bên cạnh đó, nên sử dụng Exponential Backoff trong logic của Python script để giãn thời gian gọi API khi gặp lỗi.
- **Vấn Đề Out of Memory (OOM) trong Worker**: Nếu một subreddit có hàng nghìn bài post mới và bạn cố gắng gán tất cả vào một list/dictionary trong RAM của một Celery Worker, tiến trình đó sẽ bị OOM Killed bởi Linux OOM Killer.
  - *Giải pháp*: Cần áp dụng kỹ thuật **Streaming/Chunking**. Thay vì tải toàn bộ, worker đọc từng trang (pagination) từ API, ghi tạm xuống ổ đĩa cục bộ (Local Disk) bằng một file CSV/JSON hoặc trực tiếp dùng `boto3` `upload_fileobj` để stream dữ liệu lên S3 dưới dạng Multipart Upload.

### 2. Load: Chuyển Dữ Liệu Thô Vào Landing Zone (Amazon S3)
Mọi dữ liệu từ bước Extract được coi là *immutable* (không thể thay đổi). Việc lưu dữ liệu nguyên gốc trên S3 giúp đảm bảo **Data Lineage**. Nếu logic Transform của bạn bị sai, bạn không cần phải gọi lại API của Reddit (việc này có thể bất khả thi vì Reddit API không giữ hết lịch sử vĩnh viễn), mà chỉ cần chạy lại luồng Transform từ S3.

**Best Practice:** Tổ chức thư mục S3 theo phân vùng thời gian (Time-based Partitioning) để tối ưu hóa việc đọc sau này.
`s3://reddit-data-lake/raw/year=2026/month=06/day=16/reddit_posts.csv`

### 3. Transform: Xử Lý Phân Tán Với AWS Glue
Dữ liệu lúc này có thể chứa các ký tự đặc biệt (emoji trong tiêu đề post), chuỗi JSON lồng nhau, hoặc bị thiếu trường (Null fields). 
Sử dụng **AWS Glue**, một dịch vụ Serverless ETL dựa trên Apache Spark:
- **Xử lý String:** Biến đổi các tiêu đề chứa ký tự Unicode, loại bỏ dấu cách thừa, và trích xuất các hashtag hoặc URL.
- **Convert File Format:** Chuyển đổi file từ định dạng theo hàng (CSV/JSON) sang định dạng theo cột (Apache Parquet). Parquet giúp nén dữ liệu rất tốt (giảm 70-80% dung lượng S3) và tích hợp hoàn hảo với kiến trúc cột của Amazon Redshift. Nhờ Parquet, các query lấy một vài cột nhất định sẽ không phải scan toàn bộ file, tiết kiệm I/O.

### 4. Load (Final): Amazon Redshift và Cạm Bẫy Data Skew
Dữ liệu sạch dưới định dạng Parquet được load vào Amazon Redshift thông qua lệnh `COPY`.

```sql
COPY reddit_posts 
FROM 's3://reddit-data-lake/processed/reddit_posts/' 
IAM_ROLE 'arn:aws:iam::123456789012:role/RedshiftS3ReadRole' 
FORMAT AS PARQUET;
```

Khi làm việc với các MPP (Massively Parallel Processing) Data Warehouse như Redshift, **Data Skew** (Lệch Dữ Liệu) là cơn ác mộng lớn nhất. Nếu bạn chọn sai `DISTKEY` (Distribution Key), toàn bộ cụm Redshift sẽ bị nghẽn (bottleneck) ở một node duy nhất.

- **Vấn đề Data Skew với cột `subreddit`**: Giả sử bạn chọn `DISTKEY = subreddit`. Dữ liệu sẽ được băm (hash) và chia đều các subreddit ra các node tính toán (Compute Nodes). Tuy nhiên, subreddit `r/AskReddit` hoặc `r/funny` có lượng post khổng lồ so với các subreddit nhỏ. Kết quả là, Node chứa dữ liệu của `r/AskReddit` sẽ tốn 100% CPU để xử lý, trong khi các Node khác ngồi chơi (Idle).
- **Cách Tối Ưu**: Đối với bảng Fact chứa các post từ Reddit, nên sử dụng `DISTKEY = post_id` (trường có High Cardinality, đảm bảo dữ liệu phân tán cực đều trên tất cả các slice của Redshift). Đối với bảng Dimension cực nhỏ (ví dụ: danh sách tác giả nhỏ), có thể dùng `DISTSTYLE ALL` để broadcast bảng đó lên mọi node, giúp các lệnh JOIN diễn ra ở cục bộ (Local Join) cực kỳ nhanh.

---

## Chi Tiết Kỹ Thuật: Tính Tự Đồng Nhất (Idempotence)

Một hệ thống FAANG-level phải đảm bảo tính **Idempotent** (chạy 1 lần hay 100 lần với cùng một tham số đầu vào đều cho ra đúng một kết quả, không bị nhân đôi dữ liệu).
- Trong Airflow, không bao giờ dùng `datetime.now()` trong code của Task. Luôn luôn dùng `{{ ds }}` hoặc `{{ data_interval_start }}` (các Airflow Macros). Điều này đảm bảo khi bạn **Backfill** (chạy lại dữ liệu của tháng trước), DAG vẫn hiểu nó đang fetch dữ liệu của khoảng thời gian trong quá khứ chứ không phải hiện tại.
- Lệnh `COPY` vào Redshift không có khả năng tự update nếu trùng lặp (Upsert). Để giải quyết, hãy load dữ liệu vào một `staging_table` trong Redshift trước, sau đó dùng SQL `DELETE ... WHERE id IN (...)` ở bảng chính, rồi mới `INSERT INTO target_table SELECT * FROM staging_table`. Cơ chế này được gọi là **Staging Delete-Insert**, mô phỏng lại thao tác UPSERT trong Data Warehouse.

---

## Mở Rộng Hệ Thống (Scaling Considerations)

Khi lượng dữ liệu lớn lên (ví dụ: track hàng triệu comment mỗi giờ), Airflow + Python operator không còn phù hợp để handle data processing. Lúc này, bạn chỉ dùng Airflow để Trigger các Job chạy trên các hệ thống phân tán chuyên dụng khác:
1. Thay vì Celery Worker kéo data, Airflow sử dụng `EcsOperator` để khởi tạo một Docker Container trên AWS Fargate chuyên làm nhiệm vụ API pulling.
2. Với việc xử lý luồng (Streaming), kiến trúc có thể mở rộng bằng cách để API scraper publish dữ liệu trực tiếp vào **Apache Kafka** hoặc **Amazon Kinesis**, sau đó dùng **Apache Flink** để tính toán Sliding Windows cho các post trending theo thời gian thực (Real-time aggregation).

## Tài Liệu Tham Khảo

Bài viết được tổng hợp từ các kinh nghiệm thực tế khi xây dựng data pipeline mở rộng và các dự án mã nguồn mở chất lượng:
1. Nguồn chính của kiến trúc này đến từ repository mã nguồn mở phổ biến: [airscholar/RedditDataEngineering (GitHub)](https://github.com/airscholar/RedditDataEngineering) - Một dự án tham khảo tuyệt vời để học cách vận hành Airflow và AWS trong thực tế.
2. Tài liệu chính thức về **Amazon Redshift Distribution Styles** (AWS Documentation) - Giải quyết triệt để bài toán Data Skew.
3. Best Practices khi viết DAG từ [Apache Airflow Documentation](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html).
4. Để lấy dữ liệu từ Reddit một cách hiệu quả, luôn tham khảo **PRAW (Python Reddit API Wrapper) Documentation**.
