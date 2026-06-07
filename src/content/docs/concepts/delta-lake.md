---
title: "Delta Lake - Bảng dữ liệu giao dịch mở"
category: "Data Lake & Lakehouse"
difficulty: "Advanced"
tags: ["data-lakehouse", "delta-lake", "databricks", "acid", "parquet", "open-table-format"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Delta Lake là gì? Tính năng ACID trên Data Lakehouse"
metaDescription: "Khám phá Delta Lake: Định dạng Open Table Format mã nguồn mở hỗ trợ giao dịch ACID, Time Travel và Schema Evolution trên Data Lake."
---

# Delta Lake - Bảng dữ liệu giao dịch mở

## Summary

Delta Lake là một lớp lưu trữ mã nguồn mở (Open Table Format) được phát triển ban đầu bởi Databricks (và hiện đã được trao tặng cho Linux Foundation) nhằm giải quyết các lỗ hổng chết người của Data Lake truyền thống. Bằng cách phủ một tầng ghi nhận nhật ký giao dịch (Transaction Log) lên trên các tệp Parquet thông thường, Delta Lake mang những "siêu năng lực" vốn chỉ có ở cơ sở dữ liệu quan hệ (như giao dịch ACID, khả năng UPDATE/DELETE dữ liệu, Schema Enforcement và Time Travel) đến với kho lưu trữ Data Lake giá rẻ khổng lồ, tạo thành nền tảng vững chắc nhất cho kiến trúc Lakehouse.

---

## Definition

Về mặt vật lý, **Delta Lake** không phải là một "hệ quản trị cơ sở dữ liệu" (RDBMS) hay một máy chủ phần mềm. Nó chỉ đơn giản là một bộ định dạng dữ liệu và thư viện lập trình (có thể cài vào Spark, Pandas, Trino...).

Dữ liệu của một bảng Delta được lưu hoàn toàn trên Object Storage (S3/GCS/ADLS) bao gồm 2 phần:
1. **Dữ liệu (Data Files)**: Các tệp định dạng Apache Parquet tiêu chuẩn.
2. **Siêu dữ liệu (Delta Log)**: Một thư mục `_delta_log` chứa các file JSON (và file Checkpoint) ghi lại lịch sử thao tác của mọi hành động từng xảy ra trên bảng dữ liệu đó (Thêm tệp A, Xóa tệp B).

---

## Why it exists

Trước năm 2019, các kỹ sư làm việc với Data Lake bằng Apache Spark phải đối mặt với một loạt ác mộng (Được gọi là bài toán "Data Swamp" - Đầm lầy dữ liệu):
1. **Thiếu vắng ACID**: Nếu một job Spark đang ghi dở 100 file Parquet vào S3 thì máy chủ bị sập nguồn. Kết quả là S3 xuất hiện 50 file Parquet lỗi và không ai biết file nào đúng file nào sai. Người đọc dữ liệu sẽ đọc phải dữ liệu rác.
2. **Không thể UPDATE/DELETE**: Data Lake dùng Parquet là dạng file tĩnh (immutable). Để tuân thủ luật xóa dữ liệu người dùng (GDPR), kỹ sư phải viết đoạn mã kinh khủng: Đọc toàn bộ thư mục S3 vào RAM, lọc bỏ người dùng cần xóa, và ghi đè lại toàn bộ hệ thống file. Quá tốn kém và nguy hiểm.
3. **Mất kiểm soát Schema**: Ai đó vô tình ghi một file Parquet trong đó cột `Age` là kiểu `STRING` vào chung thư mục chứa các file Parquet có cột `Age` kiểu `INT`. Khi Spark đọc lên, toàn bộ pipeline sẽ đổ vỡ tung tóe (Schema mismatch).

Delta Lake sinh ra để giải quyết triệt để cả 3 bài toán trên.

---

## Core idea

Cơ chế sức mạnh cốt lõi của Delta Lake chính là **Transaction Log (Tệp nhật ký giao dịch)**.

Cơ chế này hoạt động dựa trên nguyên tắc **Thỏa thuận kiểm soát phiên bản (Optimistic Concurrency Control)**. 
Khi bạn gọi lệnh `UPDATE` hoặc ghi dữ liệu mới:
1. Delta Lake không sửa trực tiếp vào file Parquet cũ. Nó ghi một file Parquet MỚI tinh chứa dữ liệu đã được sửa (Copy-on-write).
2. Sau khi ghi thành công file mới, nó tạo một file JSON (`0000X.json`) vào thư mục `_delta_log` ghi nhận giao dịch: "Hủy bỏ file Parquet cũ (đánh dấu Tombstone), Bổ sung file Parquet mới".

*Nhờ đó, một người dùng đang đọc dữ liệu (đọc theo trạng thái trước thay đổi) sẽ không hề bị gián đoạn hay bị block bởi người đang ghi dữ liệu. Đây là nền tảng của giao dịch ACID (Atomicity, Consistency, Isolation, Durability).*

---

## Key Features (Các tính năng nổi bật)

1. **ACID Transactions**: Đảm bảo an toàn dữ liệu nhiều người dùng. Một thao tác chạy sẽ thành công toàn bộ hoặc không thành công tí nào (Không có trạng thái file lỗi lửng lơ).
2. **Time Travel (Du hành thời gian)**: Vì các file Parquet cũ không bị xóa lập tức (mà chỉ bị đánh dấu gạch ngang trong Log), bạn có thể đọc chính xác trạng thái của bảng ở bất kỳ phiên bản nào trong quá khứ.
   `SELECT * FROM my_table TIMESTAMP AS OF '2026-06-01'`
3. **Schema Enforcement & Evolution**: 
   * **Enforcement**: Ngăn chặn (ném lỗi) ngay lập tức nếu bạn cố ghi dữ liệu sai kiểu (INT vs STRING) vào bảng.
   * **Evolution**: Hỗ trợ cú pháp `mergeSchema = "true"` để tự động thêm cột mới vào cấu trúc bảng nếu nguồn dữ liệu có thêm trường mới một cách chủ ý.
4. **DML Support**: Cho phép chạy trực tiếp các lệnh SQL chuẩn `UPDATE`, `DELETE`, và đặc biệt là `MERGE INTO` (Upsert dữ liệu) y hệt như đang dùng PostgreSQL.
5. **Thống nhất Batch và Streaming**: Cùng một bảng Delta, bạn vừa có thể ghi dữ liệu Streaming bằng Kafka, vừa chạy các tác vụ truy vấn Batch bằng SQL song song cùng lúc mà không sợ đụng độ.

---

## Practical example

Một vòng đời ngắn của bảng Delta bằng PySpark:

**1. Khởi tạo và ghi dữ liệu (Batch):**
```python
df = spark.createDataFrame([("Alice", 25), ("Bob", 30)], ["Name", "Age"])

# Ghi ra định dạng delta (thay thế cho .parquet)
df.write.format("delta").save("s3://bucket/bronze/users")
```

**2. Thực hiện MERGE INTO (Upsert):**
Khi có dữ liệu khách hàng mới (Alice đổi tuổi thành 26, Charlie là khách mới).
```python
from delta.tables import DeltaTable

deltaTable = DeltaTable.forPath(spark, "s3://bucket/bronze/users")
new_data = spark.createDataFrame([("Alice", 26), ("Charlie", 22)], ["Name", "Age"])

deltaTable.alias("target").merge(
    new_data.alias("source"),
    "target.Name = source.Name"
).whenMatchedUpdateAll(
).whenNotMatchedInsertAll(
).execute()
# Kết quả bảng: Alice(26), Bob(30), Charlie(22). 
# Đây là cách làm SCD Type 1 cực kỳ dễ dàng trên Lakehouse.
```

**3. Khôi phục thảm họa (Time Travel):**
Lỡ tay xóa nhầm bảng? Phục hồi nó về phiên bản số 0.
```sql
RESTORE TABLE delta.`s3://bucket/bronze/users` TO VERSION AS OF 0;
```

---

## Best practices

* **Thường xuyên dọn dẹp bằng VACUUM**: Tính năng Time Travel lưu trữ các file Parquet cũ. Theo thời gian, rác sẽ ngập tràn ổ S3 và bạn sẽ mất rất nhiều tiền lưu trữ. Hãy chạy câu lệnh `VACUUM delta_table RETAIN 168 HOURS` (Dọn dẹp các file rác cũ hơn 7 ngày) định kỳ mỗi tuần. (Lưu ý: Sau khi Vacuum, bạn không thể Time Travel xa hơn mốc thời gian đó).
* **Tối ưu hóa file nhỏ bằng OPTIMIZE**: Khi luồng dữ liệu liên tục đổ về (streaming), bảng sẽ chứa hàng ngàn file Parquet dung lượng winRAR (1-2 MB). Tình trạng này làm CPU tốn thời gian mở nắp file hơn là đọc file. Hãy chạy câu lệnh `OPTIMIZE delta_table` thường xuyên để tự động gom (compact) các file nhỏ thành 1 file 1GB lý tưởng.
* **Dùng Z-Ordering cho cột tra cứu thường xuyên**: Lệnh `OPTIMIZE delta_table ZORDER BY (customer_id)` sắp xếp các giá trị trong bảng theo vùng đa chiều (Z-order). Khi bạn query tìm `customer_id`, Delta Lake sẽ bỏ qua 99% các file rác (Data Skipping) và mang lại tốc độ truy vấn gần như ngay lập tức.

---

## Common mistakes

* **Đọc trực tiếp thư mục bằng Engine không tương thích**: Dùng một engine hoặc thư viện đời cũ (không hiểu được giao thức `_delta_log`) trỏ thẳng vào thư mục S3 đọc file Parquet. Kết quả là nó sẽ đọc TẤT CẢ các file (Bao gồm cả các file đã bị xóa/tombstone trong log và file cũ), dẫn đến dữ liệu bị nhân ba nhân bốn và gây sai lệch nghiêm trọng. Luôn phải dùng thư viện Delta reader.
* **Update từng dòng đơn lẻ**: Chạy câu lệnh `UPDATE` liên tục theo vòng lặp (For loop) trên từng ID. Vì Delta Lake sử dụng Copy-on-write, mỗi lệnh Update nhỏ xíu sẽ tạo ra 1 file Parquet mới. Hãy dồn hàng ngàn update lại thành 1 cục (Batch) và dùng lệnh `MERGE INTO`.

---

## Trade-offs

### Ưu điểm
* **Mã nguồn mở (Open Source)**: Miễn phí, không phụ thuộc hoàn toàn vào Databricks (Dù Databricks sở hữu phiên bản tối ưu riêng của họ).
* **Độ tin cậy dữ liệu (Data Reliability)**: Gần như không thể làm hỏng file dữ liệu với cấu trúc ACID.
* **Hệ sinh thái Spark tích hợp sâu**: Nếu công ty bạn đang sử dụng Spark (Data Engineering mạnh mẽ), Delta Lake là hệ sinh thái tự nhiên và dễ dùng nhất.

### Nhược điểm
* **Overhead của Copy-on-write**: Đối với bảng khổng lồ, việc thay đổi 1 dòng dữ liệu yêu cầu phải chép lại toàn bộ 1 file Parquet (có thể lên tới 1GB). Điều này làm cho tốc độ `UPDATE` chậm hơn so với Data Warehouse truyền thống (Mặc dù các phiên bản Delta mới đã ra mắt tính năng Merge-on-read nhưng vẫn phức tạp).
* **Quản trị Metadata cồng kềnh**: Nếu bảng có hàng triệu transaction, thư mục `_delta_log` chứa triệu file JSON. Dù có kỹ thuật Checkpoint gộp log, nhưng thời gian để engine tải bảng (parse metadata) lần đầu tiên vẫn có thể bị chậm. (Iceberg giải quyết bài toán Metadata tốt hơn Delta).

---

## When to use

* Delta Lake là lựa chọn mặc định và tốt nhất khi bạn đang xây dựng Lakehouse trên hệ sinh thái phần mềm **Databricks** hoặc dùng **Apache Spark** làm công cụ ETL cốt lõi.
* Bạn cần lưu trữ một lượng dữ liệu vô hạn trên Cloud (S3/ADLS/GCS) nhưng yêu cầu tính năng Data Warehouse (ACID, Update, Delete) để phục vụ Data Engineers và BI Tools (PowerBI, Tableau).

## When not to use

* Với các CSDL yêu cầu giao dịch Online (OLTP) tính bằng mili-giây.
* Nếu Data Stack của bạn thiên về Data Warehouse độc quyền (như BigQuery hoặc Snowflake thuần túy), việc thêm Delta Lake vào giữa có thể gây cồng kềnh hệ thống (Snowflake có Iceberg hỗ trợ native tốt hơn).

---

## Related concepts

* [Data Lakehouse](/concepts/lakehouse)
* [Apache Iceberg](/concepts/apache-iceberg)
* [Parquet](/concepts/parquet)
* [Apache Spark](/concepts/apache-spark)

---

## Interview questions

### 1. Hãy giải thích cơ chế Optimistic Concurrency Control (Kiểm soát đồng thời lạc quan) trong Delta Lake hoạt động ra sao khi có 2 người cùng UPDATE 1 bảng?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết sâu sắc về cấu trúc phân tán và cơ chế Conflict Resolution.
* **Gợi ý trả lời**: Cơ chế "Lạc quan" (Optimistic) cho rằng xác suất 2 giao dịch đụng chạm vào cùng một file dữ liệu là rất nhỏ, do đó nó không dùng cơ chế Lock (Khóa) cứng toàn bộ bảng như cơ sở dữ liệu truyền thống. 
Khi User A và User B cùng submit lệnh UPDATE:
  1. Cả 2 đều đọc phiên bản hiện tại của bảng (Ví dụ Version 10).
  2. Cả 2 thực hiện tính toán trên bộ nhớ máy tính riêng và ghi file Parquet dữ liệu mới của họ xuống đĩa.
  3. Khi bắt đầu ghi file Log (Để tăng version lên 11), Delta dựa vào nguyên tắc "Mutual Exclusion" (loại trừ lẫn nhau) của hệ thống lưu trữ S3. Nếu User A ghi tệp `0011.json` thành công trước chớp nhoáng, giao dịch của A thành công (Version 11).
  4. User B cố gắng ghi `0011.json` nhưng phát hiện file đã tồn tại. Thao tác bị văng lỗi.
  5. User B (engine của Delta) sẽ tự động kiểm tra xem thay đổi của A ở version 11 có đụng chạm gì đến các file mà B muốn sửa không. Nếu KHÔNG đụng chạm (Ví dụ A sửa khách ở HN, B sửa khách ở SG), Delta sẽ tự động chèn kết quả của B thành Version 12. Nếu CÓ đụng chạm, giao dịch của B thất bại và văng Exception báo cho người dùng biết.

### 2. Time Travel trong Delta Lake là một tính năng tuyệt vời. Nhưng làm thế nào tôi có thể duy trì dữ liệu của 10 năm quá khứ mà không tốn chi phí ổ cứng khổng lồ cho các file Parquet bị thay thế?
* **Người phỏng vấn muốn kiểm tra**: Khả năng phân tích kinh phí lưu trữ thực tế và hiểu biết về tính năng cốt lõi.
* **Gợi ý trả lời**: Câu trả lời là: **Bạn không nên và không thể dùng Time Travel để lưu trữ lịch sử dài hạn (10 năm)**. 
Time Travel sinh ra với mục đích khắc phục thảm họa (Disaster Recovery - lỡ tay xóa nhầm, rollback lại hôm qua) hoặc tái lập trạng thái của model Machine Learning trong ngắn hạn. Giữ toàn bộ file cũ sẽ tiêu tốn chi phí S3 khủng khiếp.
Để quản lý chi phí, ta bắt buộc phải chạy lệnh `VACUUM` thường xuyên để xóa vĩnh viễn các file cũ (từ bỏ tính năng Time Travel sau 7-30 ngày). Nếu doanh nghiệp muốn phân tích dữ liệu lịch sử 10 năm, giải pháp là phải sử dụng thiết kế **SCD Type 2 (Slowly Changing Dimension)** ở lớp cấp liệu Data Modeling, nơi lịch sử được lưu dưới dạng dòng (row) mới trong cùng 1 file, thay vì trông cậy vào tính năng Time Travel của hạ tầng.

---

## References

1. **Databricks Lakehouse Documentation** - "What is Delta Lake?".
2. **Delta.io** (Trang chủ của open-source project, tài liệu về Delta format).
3. **Fundamentals of Data Engineering** - Joe Reis.

---

## English summary

Delta Lake is an open-source storage layer (an open table format) initially developed by Databricks that brings relational database "superpowers"—such as ACID transactions, scalable metadata handling, Schema Enforcement, DML support (UPDATE/DELETE/MERGE), and Time Travel—to massive, low-cost Data Lakes. It achieves this by overlaying a transaction log (`_delta_log`) on top of static Apache Parquet files, utilizing Optimistic Concurrency Control to manage concurrent reads and writes safely. Acting as the foundational building block for the Data Lakehouse architecture, Delta Lake eliminates the "data swamp" problem, enabling organizations to unify batch processing, streaming, Machine Learning, and Business Intelligence workloads on a single, highly reliable data copy.
