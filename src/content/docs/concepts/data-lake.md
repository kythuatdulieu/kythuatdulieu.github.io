---
title: "Hồ dữ liệu - Data Lake"
category: "Data Lake & Lakehouse"
difficulty: "Beginner"
tags: ["data-lake", "parquet", "object-storage", "schema-on-read", "big-data"]
readingTime: "11 mins"
lastUpdated: 2026-06-07
seoTitle: "Hồ dữ liệu - Hướng dẫn chuyên sâu về Data Lake"
metaDescription: "Tìm hiểu toàn diện về Data Lake (Hồ dữ liệu): định nghĩa, cấu trúc tổ chức dữ liệu thô, định dạng Parquet/Avro, sự cố tệp nhỏ và cách phân biệt DWH vs Data Lake."
---

# Hồ dữ liệu - Data Lake

## Summary

Data Lake (Hồ dữ liệu) là hệ thống lưu trữ tập trung cho phép lưu giữ toàn bộ dữ liệu ở mọi định dạng (cấu trúc, bán cấu trúc và phi cấu trúc) tại quy mô cực lớn mà không cần thiết kế lược đồ (schema) trước khi ghi. Dữ liệu được lưu trữ ở dạng nguyên bản (raw format) trên các hệ thống lưu trữ đối tượng (object storage) chi phí thấp và chỉ được định cấu trúc khi bắt đầu truy xuất để xử lý (schema-on-read).

---

## Definition

**Data Lake - Hồ dữ liệu thô** là một kho chứa dữ liệu tập trung quy mô lớn, lưu trữ dữ liệu ở định dạng tự nhiên hoặc nguyên bản (raw format), bao gồm cả dữ liệu có cấu trúc (bảng SQL), bán cấu trúc (JSON, XML, CSV) và phi cấu trúc (hình ảnh, âm thanh, video, tài liệu văn bản tự do).

Khác với Data Warehouse áp dụng mô hình *schema-on-write* (phải thiết kế bảng và định nghĩa kiểu dữ liệu trước khi ghi), Data Lake áp dụng nguyên tắc *schema-on-read* (lưu dữ liệu thô trước, khi nào đọc mới phân tích cú pháp và áp cấu trúc lược đồ lên dữ liệu).

---

## Why it exists

Mặc dù Data Warehouse (DWH) rất hiệu quả cho phân tích kinh doanh, nhưng khi dữ liệu bùng nổ về thể tích (Volume) và sự đa dạng (Variety), DWH bộc lộ 3 hạn chế lớn dẫn đến sự ra đời của Data Lake:
1. **Chi phí lưu trữ quá đắt**: DWH sử dụng bộ nhớ lưu trữ hiệu năng cao liên kết chặt chẽ với tài nguyên tính toán. Việc lưu trữ hàng Terabytes hoặc Petabytes dữ liệu thô chưa biến đổi trên DWH là không khả thi về mặt tài chính.
2. **Bỏ lỡ dữ liệu phi cấu trúc**: Một lượng lớn tri thức doanh nghiệp nằm ở dữ liệu phi cấu trúc (ví dụ: file ghi âm cuộc gọi của khách hàng, ảnh chụp chứng từ, log hệ thống). DWH truyền thống không thể lưu trữ trực tiếp các tệp tin này.
3. **Mất thông tin gốc do biến đổi sớm**: Trong quy trình ETL của DWH, dữ liệu bị cắt tỉa và tổng hợp (aggregate) ngay từ đầu để phù hợp với Star Schema. Nếu sau này nhóm Data Science cần các điểm dữ liệu thô ban đầu để huấn luyện mô hình Machine Learning, họ sẽ không thể tìm lại được.

Data Lake giải quyết các vấn đề này bằng cách tận dụng các hệ thống lưu trữ đối tượng phân tán (như AWS S3, Google Cloud Storage, HDFS) có chi phí cực rẻ để lưu giữ lại mọi thông tin gốc vô thời hạn.

---

## Core idea

Ý tưởng cốt lõi của một Data Lake xoay quanh 4 nguyên lý chính:
* **Lưu giữ mọi thứ (Store everything)**: Thu thập tất cả dữ liệu từ mọi nguồn vận hành và giữ lại ở dạng nguyên bản nhất có thể. Không thực hiện cắt xén hay tổng hợp dữ liệu trước khi lưu trữ.
* **Tách biệt Tính toán và Lưu trữ (Decoupled Compute and Storage)**: Lưu trữ dữ liệu trên hệ thống đĩa phân tán giá rẻ độc lập. Khi cần chạy tính toán (ví dụ: Spark, Athena), ta mới khởi động tài nguyên CPU/RAM để đọc đĩa đó. Xử lý xong có thể tắt tài nguyên tính toán đi để tiết kiệm chi phí mà không ảnh hưởng tới dữ liệu lưu trữ.
* **Schema-on-Read**: Không ép buộc dữ liệu phải tuân thủ một bảng cố định khi ghi vào hồ. Cấu trúc dữ liệu sẽ được định nghĩa linh hoạt bởi ứng dụng đọc (ví dụ: Spark DataFrame Schema, Hive Metastore Table definition).
* **Đa dạng công cụ truy cập (Multi-tool Access)**: Một vùng dữ liệu lưu trữ có thể được đọc đồng thời bởi nhiều công cụ khác nhau tùy mục đích: Spark cho ETL, Python/TensorFlow cho Machine Learning, Presto/Athena cho phân tích SQL ad-hoc.

---

## How it works

Dữ liệu di chuyển qua Data Lake thường được tổ chức theo các phân vùng thư mục logic đại diện cho các trạng thái xử lý dữ liệu:
1. **Raw Zone (Vùng thô / Landing Zone)**: Nơi dữ liệu từ nguồn được đổ vào trực tiếp dưới dạng nguyên bản (JSON từ API, CSV, DB dump). Dữ liệu ở đây không bao giờ được chỉnh sửa.
2. **Structured Zone (Vùng cấu trúc / Processing Zone)**: Dữ liệu từ Raw Zone được nạp lên, làm sạch cơ bản (loại bỏ dòng lỗi, xử lý timezone) và chuyển đổi sang các định dạng tệp tin tối ưu cho phân tích như **Apache Parquet** hoặc **Apache ORC**.
3. **Curated Zone (Vùng tinh chọn / Analytics Zone)**: Lớp dữ liệu đã được gộp, tính toán chỉ số tổng hợp và tổ chức rõ ràng để sẵn sàng phục vụ cho các báo cáo phân tích hoặc các mô hình học máy tiêu thụ trực tiếp.

---

## Architecture / Flow

Dưới đây là sơ đồ kiến trúc tổ chức thư mục vật lý điển hình trên Object Storage của một Data Lake:

```text
s3://my-company-data-lake/
├── raw/ (Raw Zone)
│   ├── orders/
│   │   ├── year=2026/month=05/day=27/order_data_123.json
│   │   └── year=2026/month=05/day=28/order_data_124.json
│   └── clickstream/
│       └── event_logs_20260527.csv
├── structured/ (Structured Zone)
│   └── orders/
│       ├── year=2026/month=05/day=27/part-000.snappy.parquet
│       └── year=2026/month=05/day=28/part-000.snappy.parquet
└── curated/ (Curated Zone)
    └── monthly_user_activity/
        └── year=2026/month=05/summary.parquet
```

---

## Practical example

Giả sử chúng ta thu thập dữ liệu nhật ký hoạt động (clickstream logs) của người dùng trên website thương mại điện tử ở dạng JSON thô.

**Dữ liệu JSON thô đổ vào Raw Zone (`s3://data-lake/raw/clickstream/year=2026/month=05/`)**:
```json
{"user_id": "U109", "event": "click_product", "product_id": "P99", "timestamp": "2026-05-27T10:15:30Z"}
{"user_id": "U110", "event": "add_to_cart", "product_id": "P102", "timestamp": "2026-05-27T10:17:12Z"}
```

**Script PySpark đọc dữ liệu thô, ép kiểu dữ liệu và chuyển đổi sang định dạng Parquet nén Snappy để ghi vào Structured Zone**:
```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_timestamp

spark = SparkSession.builder.appName("RawToStructured").getOrCreate()

# 1. Đọc dữ liệu JSON thô từ Raw Zone
df_raw = spark.read.json("s3://data-lake/raw/clickstream/year=2026/month=05/*")

# 2. Làm sạch và định kiểu dữ liệu
df_structured = df_raw.withColumn("event_time", to_timestamp(col("timestamp"))) \
                      .drop("timestamp")

# 3. Ghi dữ liệu dạng Parquet phân vùng theo ngày vào Structured Zone
df_structured.write \
    .partitionBy("event") \
    .mode("overwrite") \
    .parquet("s3://data-lake/structured/clickstream/year=2026/month=05/")
```

---

## Best practices

* **Thiết kế phân vùng thư mục hợp lý (Partitioning)**: Phân chia thư mục trên Object Storage theo thời gian (ví dụ: `year=YYYY/month=MM/day=DD`) hoặc theo các thuộc tính truy vấn thường xuyên. Việc này giúp các công cụ đọc thực hiện **Partition Pruning** (chỉ quét các thư mục cần thiết, bỏ qua toàn bộ các thư mục khác để tăng tốc truy vấn và tiết kiệm chi phí).
* **Chuẩn hóa định dạng lưu trữ**: Ưu tiên sử dụng định dạng lưu trữ dạng cột (columnar format) như **Apache Parquet** hoặc **Apache ORC** cho các vùng xử lý phân tích. Chỉ sử dụng các định dạng hàng như **Apache Avro** cho các luồng dữ liệu cần ghi nhanh (streaming ingestion).
* **Quản lý Siêu dữ liệu (Metadata Management)**: Bắt buộc phải triển khai một Data Catalog (như AWS Glue Catalog hoặc Hive Metastore) để đăng ký cấu trúc lược đồ cho các tệp tin trong hồ. Nếu không có catalog, Data Lake sẽ nhanh chóng trở thành **Data Swamp** (đầm lầy dữ liệu — nơi chứa đầy các file không ai biết cấu trúc bên trong là gì để đọc).
* **Xử lý sự cố tệp nhỏ (Small Files Problem)**: Tránh ghi hàng triệu tệp tin kích thước vài Kilobytes vào hồ (ví dụ như ghi trực tiếp từng event từ IoT). Hãy gom dữ liệu hoặc chạy tiến trình Compaction định kỳ để gộp chúng thành các tệp tin có kích thước tối ưu (khoảng 128MB đến 512MB) nhằm giảm tải cho bộ nhớ quản lý của Metadata Engine và NameNode.

---

## Common mistakes

* **Biến Data Lake thành bãi rác (Data Swamp)**: Đổ đống mọi loại file vào Object Storage mà không phân loại thư mục, không viết tài liệu mô tả dữ liệu và không đăng ký lược đồ vào Data Catalog.
* **Sử dụng sai định dạng tệp**: Lưu trữ dữ liệu phân tích quy mô lớn dưới dạng CSV hoặc JSON nén. Khi cần tính toán, công cụ buộc phải tải toàn bộ tệp tin về bộ nhớ để phân tích cú pháp chữ, gây lãng phí băng thông mạng và hiệu năng tính toán CPU gấp hàng chục lần so với Parquet.
* **Không phân quyền truy cập chi tiết**: Để toàn bộ nhân viên có quyền truy cập chung vào bucket dữ liệu thô (Raw bucket), dẫn đến rủi ro lộ lọt thông tin nhạy cảm của khách hàng (PII) hoặc vô tình xóa nhầm dữ liệu lịch sử không thể khôi phục.

---

## Trade-offs

### Ưu điểm
* Chi phí lưu trữ cực thấp, dễ dàng mở rộng quy mô lưu trữ tuyến tính độc lập với năng lực tính toán.
* Lưu trữ được mọi định dạng dữ liệu (bán cấu trúc, phi cấu trúc).
* Độc giả có thể tiếp cận dữ liệu gốc nguyên bản bất kỳ lúc nào để phục vụ cho các phân tích mới hoặc huấn luyện AI/ML.

### Nhược điểm
* **Hiệu năng đọc thô chậm hơn DWH**: Do dữ liệu được lưu trữ dưới dạng tệp tin phân tán trên Object Storage thông thường, tốc độ truy vấn thô không thể nhanh bằng các công cụ lưu trữ chuyên biệt được lập chỉ mục sâu (indexed) của DWH.
* **Khó khăn trong cập nhật dữ liệu (Update/Delete)**: Bản chất các tệp tin trên Object Storage là bất biến (immutable). Để cập nhật hoặc xóa một dòng dữ liệu, ta buộc phải đọc toàn bộ tệp tin chứa dòng đó, lọc bỏ dòng cần xóa và ghi đè một tệp tin mới hoàn toàn.
* **Không hỗ trợ ACID mặc định**: Không có cơ chế khóa (locking) hay phân luồng giao dịch, dẫn đến việc người dùng có thể đọc phải dữ liệu không nhất quán khi pipeline đang thực hiện ghi đè tệp tin.

---

## When to use

* Hệ thống cần lưu trữ lượng dữ liệu khổng lồ (Petabytes) với chi phí thấp nhất.
* Cần phục vụ đa dạng đối tượng tiêu thụ dữ liệu bao gồm cả Data Scientists (cần dữ liệu thô, phi cấu trúc cho ML) và Analysts.
* Lưu trữ dữ liệu nhật ký hệ thống (clickstream logs, IoT metrics) có tần suất ghi cực cao nhưng tần suất đọc phân tích thấp hơn.

## When not to use

* Doanh nghiệp chỉ cần báo cáo tài chính hoặc các chỉ số kinh doanh chuẩn hóa từ các bảng dữ liệu có cấu trúc rõ ràng (DWH là lựa chọn phù hợp nhất).
* Yêu cầu hệ thống phải hỗ trợ các tác vụ cập nhật dữ liệu thường xuyên ở cấp độ dòng (ví dụ: cập nhật thông tin đơn hàng liên tục).
* Cần thực hiện các truy vấn SQL phân tích phức tạp với thời gian phản hồi bắt buộc dưới 1 giây để phục vụ ứng dụng người dùng cuối.

---

## Related concepts

* [Data Warehouse](/concepts/data-warehouse)
* [Lakehouse](/concepts/lakehouse)
* [Apache Parquet](/concepts/parquet)
* [Small Files Problem](/concepts/small-files-problem)

---

## Interview questions

### 1. Phân biệt sự khác biệt cốt lõi giữa Data Warehouse và Data Lake.
* **Người phỏng vấn muốn kiểm tra**: Khả năng phân loại và lựa chọn công nghệ lưu trữ dữ liệu phù hợp với nhu cầu doanh nghiệp.
* **Gợi ý trả lời (Strong Answer)**:
  * **Cấu trúc dữ liệu**: DWH áp dụng mô hình *schema-on-write* (chỉ lưu dữ liệu có cấu trúc rõ ràng đã qua thiết kế). Data Lake áp dụng *schema-on-read* (lưu giữ mọi dạng dữ liệu thô cấu trúc, phi cấu trúc).
  * **Tách biệt Compute/Storage**: DWH truyền thống ghép chặt tính toán và lưu trữ cùng nhau để đạt hiệu năng tối đa (dù DWH hiện đại bắt đầu tách rời). Data Lake tách rời hoàn toàn Compute và Storage ngay từ kiến trúc gốc.
  * **Đối tượng sử dụng**: DWH phục vụ chủ yếu cho Business Analysts, BI Developers cần dữ liệu sạch, tổng hợp để làm báo cáo. Data Lake phục vụ thêm cả Data Scientists, Data Engineers cần dữ liệu thô chi tiết cho mô hình học máy và chế biến sâu.
  * **Chi phí**: DWH có chi phí trên mỗi đơn vị lưu trữ cao hơn đáng kể so với Data Lake.
* **Lỗi cần tránh**: Trả lời đơn giản rằng "DWH dùng SQL còn Data Lake dùng Python" (đây là cách hiểu sai lệch vì hiện nay có rất nhiều công cụ cho phép truy vấn SQL trực tiếp trên Data Lake).

### 2. Sự cố tệp nhỏ (Small Files Problem) trên Data Lake là gì? Tại sao nó nguy hiểm và cách giải quyết thế nào?
* **Người phỏng vấn muốn kiểm tra**: Kinh nghiệm thực tế vận hành và gỡ lỗi hiệu năng trên hệ thống lưu trữ lớn.
* **Gợi ý trả lời (Strong Answer)**:
  * **Khái niệm**: Xảy ra khi hệ thống lưu trữ hàng triệu tệp tin có kích thước rất nhỏ (vài KB đến vài MB) thay vì một số lượng ít hơn các tệp tin có kích thước tối ưu (128MB - 512MB).
  * **Nguy cơ**:
    * Đối với HDFS: NameNode lưu trữ metadata của các tệp tin trong bộ nhớ RAM. Hàng triệu tệp nhỏ sẽ làm cạn kiệt RAM của NameNode, làm sập toàn bộ cụm Hadoop.
    * Đối với Object Storage (S3/GCS): Mỗi lần đọc file yêu cầu gửi một yêu cầu HTTP GET. Quét hàng triệu file nhỏ làm phát sinh chi phí gọi API khổng lồ và độ trễ mạng tích lũy cực kỳ lớn, làm chậm hiệu năng của Spark/Athena đi hàng trăm lần.
  * **Giải pháp**:
    * Gom dữ liệu ở vùng đệm (Staging) trước khi ghi xuống hồ bằng các công cụ streaming thu thập (ví dụ: dùng Kafka Connect với tính năng flush.size lớn).
    * Chạy các Spark jobs dọn dẹp định kỳ (Compaction pipeline): đọc các file nhỏ, dùng hàm `.coalesce()` hoặc `.repartition()` để gộp dữ liệu lại và ghi đè thành các file lớn hơn.
* **Lỗi cần tránh**: Trả lời chung chung là "dùng Spark để gộp" mà không giải thích được lý do sâu xa liên quan đến bộ nhớ metadata của NameNode hoặc chi phí gọi HTTP API của S3.

### 3. Tại sao định dạng Apache Parquet lại tối ưu hơn CSV cho các truy vấn phân tích trên Data Lake?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết sâu về cơ chế lưu trữ vật lý của tệp tin.
* **Gợi ý trả lời (Strong Answer)**:
  * **Lưu trữ dạng cột (Columnar Storage)**: Parquet lưu trữ dữ liệu theo từng cột. Khi chạy truy vấn phân tích (ví dụ: tính trung bình doanh thu), công cụ chỉ cần đọc cột doanh thu và bỏ qua toàn bộ các cột khác. Với CSV (dạng dòng), hệ thống buộc phải đọc toàn bộ file và phân tích cú pháp từng dòng để lấy dữ liệu cột đó, gây lãng phí I/O ổ đĩa và băng thông mạng.
  * **Kiểu dữ liệu mạnh (Strongly typed)**: Parquet lưu trữ dữ liệu kèm metadata định nghĩa kiểu dữ liệu rõ ràng của từng cột. CSV là file văn bản thuần túy, công cụ đọc phải tự suy luận kiểu dữ liệu làm tốn tài nguyên CPU.
  * **Nén dữ liệu hiệu quả**: Lưu trữ dạng cột giúp các giá trị có cùng kiểu dữ liệu nằm cạnh nhau, tối ưu hóa các thuật toán nén như Snappy hay Gzip, giúp tiết kiệm từ 60% đến 80% dung lượng lưu trữ so với CSV.
  * **Hỗ trợ thống kê tại chỗ (Metadata statistics)**: Parquet lưu trữ giá trị Min/Max của từng cột trong mỗi nhóm dòng (row group). Công cụ đọc có thể nhìn vào metadata này để quyết định bỏ qua không đọc cả một phân đoạn dữ liệu lớn nếu giá trị cần tìm không nằm trong khoảng Min/Max, tăng tốc truy vấn đáng kể.
* **Lỗi cần tránh**: Chỉ trả lời chung chung là "Parquet nén tốt hơn và nhanh hơn" mà không giải thích được cơ chế lưu trữ dạng cột và I/O pruning.

### 4. Giải thích sự khác biệt giữa Schema-on-Write và Schema-on-Read.
* **Người phỏng vấn muốn kiểm tra**: Kiến thức nền tảng về lý thuyết mô hình dữ liệu.
* **Gợi ý trả lời (Strong Answer)**:
  * **Schema-on-Write (Áp dụng khi ghi)**: Hệ thống cơ sở dữ liệu yêu cầu lược đồ bảng (schema) phải được định nghĩa trước. Khi nạp dữ liệu, hệ thống sẽ kiểm tra tính hợp lệ của dữ liệu đầu vào. Nếu dữ liệu không khớp kiểu dữ liệu hoặc thiếu cột bắt buộc, việc ghi sẽ thất bại. Điển hình là Relational Databases và Data Warehouses. Ưu điểm là dữ liệu ghi vào luôn sạch sẽ, nhất quán.
  * **Schema-on-Read (Áp dụng khi đọc)**: Dữ liệu được ghi thẳng vào kho lưu trữ ở dạng thô mà không cần kiểm tra tính hợp lệ về cấu trúc. Khi ứng dụng đọc dữ liệu lên để xử lý, ứng dụng đó mới chịu trách nhiệm áp cấu trúc lược đồ để phân tích cú pháp. Điển hình là Data Lakes. Ưu điểm là tốc độ ghi cực nhanh, linh hoạt đón nhận mọi định dạng dữ liệu, nhưng nhược điểm là đẩy độ phức tạp và rủi ro kiểm soát chất lượng dữ liệu sang phía người đọc.
* **Lỗi cần tránh**: Trả lời là "Schema-on-Write tốt hơn" hoặc ngược lại. Cả hai là sự đánh đổi thiết kế cho các mục tiêu khác nhau.

### 5. Phân vùng dữ liệu (Partitioning) trên Data Lake hoạt động thế nào? Khi nào phân vùng quá mức (Over-partitioning) là một vấn đề?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng tối ưu hóa lưu trữ và hiểu biết về giới hạn vật lý của hệ thống.
* **Gợi ý trả lời (Strong Answer)**:
  * **Cơ chế**: Partitioning chia dữ liệu thành các thư mục vật lý riêng biệt dựa trên giá trị của một hoặc nhiều cột (ví dụ: `/year=2026/month=05/`). Khi chạy câu lệnh SQL có điều kiện lọc tương ứng trong mệnh đề `WHERE`, công cụ tính toán sẽ trực tiếp truy cập vào thư mục đó và bỏ qua tất cả các thư mục khác (Partition Pruning), giúp giảm lượng dữ liệu cần quét.
  * **Over-partitioning**: Xảy ra khi ta chọn một cột có độ phân tán giá trị quá cao (high cardinality) làm cột phân vùng (ví dụ: phân vùng theo `user_id` hoặc `timestamp` chi tiết đến từng phút). Việc này tạo ra hàng trăm ngàn thư mục con, mỗi thư mục chỉ chứa một vài tệp tin siêu nhỏ.
  * **Hậu quả**: Làm phát sinh sự cố tệp nhỏ, khiến Metadata Engine (như Hive Metastore) quá tải bộ nhớ khi phải quản lý danh sách thư mục quá lớn, làm giảm nghiêm trọng tốc độ lập kế hoạch truy vấn (query planning time).
* **Lỗi cần tránh**: Không nêu được khái niệm "high cardinality" và ảnh hưởng của nó đến Metadata Engine khi giải thích về Over-partitioning.

---

## References

1. **Fundamentals of Data Engineering** - Joe Reis, Matt Housley (Chương 7: Data Storage - Phân tích chi tiết về kiến trúc Data Lake và Object Storage).
2. **Designing Data-Intensive Applications** - Martin Kleppmann (Chương 3: Phân tích về các định dạng tệp Parquet và cơ chế nén dạng cột).
3. **AWS Architecture Blog** - *Design patterns for building a data lake on Amazon S3* (Hướng dẫn thiết kế phân vùng và tổ chức thư mục vật lý tối ưu hiệu năng).
4. **Apache Spark Documentation** - Spark SQL and DataFrames Guide (Tài liệu hướng dẫn thao tác ghi, đọc phân vùng và chuyển đổi Parquet).
5. **Databricks Blog** - *The Metadata Bottleneck in Large Scale Data Lakes* (Bài phân tích chuyên sâu về tác hại của sự cố tệp nhỏ và phân vùng quá mức đến query planner).

---

## English summary

A Data Lake is a scalable, centralized storage repository that holds vast amounts of raw data in its native format, including structured, semi-structured, and unstructured data. Operating under the "schema-on-read" principle, it decouples compute from storage, utilizing low-cost distributed object storage systems (like Amazon S3 or Google Cloud Storage) to persist raw assets indefinitely. Data in a Data Lake is typically organized into logical zones (Raw, Structured, Curated) and stored in optimized columnar file formats like Apache Parquet or ORC for analytical performance. Implementing a Data Lake requires rigorous metadata management via a Data Catalog and proactive measures to prevent the "small files problem" and "over-partitioning," which can degrade query execution performance.
