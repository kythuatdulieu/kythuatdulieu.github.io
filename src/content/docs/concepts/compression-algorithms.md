---
title: "Thuật toán nén dữ liệu - Compression Algorithms"
category: "Database & Storage"
difficulty: "Intermediate"
tags: ["compression", "storage", "snappy", "gzip", "zstd", "lz4"]
readingTime: "15 mins"
lastUpdated: 2026-06-07
seoTitle: "Thuật toán nén dữ liệu (Compression Algorithms) - Snappy, Gzip, Zstd"
metaDescription: "Tìm hiểu chi tiết về các thuật toán nén dữ liệu trong Big Data: Snappy, Gzip, Zstd, LZ4. So sánh hiệu năng, tỉ lệ nén và cách lựa chọn phù hợp."
---

# Thuật toán nén dữ liệu - Compression Algorithms

## Summary

Compression Algorithms (Các thuật toán nén dữ liệu) trong ngữ cảnh Hệ thống cơ sở dữ liệu (Database) và Lưu trữ dữ liệu lớn (Big Data Storage) là tập hợp các kỹ thuật mã hóa dữ liệu nhằm giảm kích thước vật lý của dữ liệu trên đĩa cứng hoặc trên đường truyền mạng. Bằng cách giảm thiểu kích thước dữ liệu (storage footprint), các hệ thống phân tán không chỉ tiết kiệm chi phí lưu trữ mà còn tối ưu hóa đáng kể tốc độ đọc/ghi (I/O) và băng thông mạng (Network I/O) - những nút thắt cổ chai (bottlenecks) phổ biến nhất trong hệ thống dữ liệu.

---

## Definition

**Thuật toán nén dữ liệu** trong Big Data thường đề cập đến các thuật toán nén không mất dữ liệu (lossless compression) giúp chuyển đổi một khối dữ liệu lớn thành một định dạng nhỏ gọn hơn mà từ đó có thể khôi phục lại dữ liệu nguyên bản một cách chính xác 100%.

Các thuật toán phổ biến trong Data Engineering bao gồm: Snappy (do Google phát triển), Gzip (chuẩn GNU nén tốt), Zstandard/Zstd (do Facebook phát triển) và LZ4. Chúng đều dựa trên các biến thể của thuật toán từ điển (dictionary-based) như LZ77/LZ78 kết hợp với mã hóa entropy (Huffman coding).

---

## Why it exists

Trong các hệ thống phân tán quy mô lớn (Hadoop, Spark, Kafka) và kiến trúc lưu trữ cột (Column-oriented storage như Parquet, ORC), CPU hiếm khi là điểm nghẽn (bottleneck). Thay vào đó, tốc độ đọc dữ liệu từ ổ cứng (Disk I/O) và thời gian truyền tải dữ liệu qua mạng giữa các node (Network I/O) là những yếu tố giới hạn hiệu năng.

Các thuật toán nén ra đời trong ngữ cảnh này để:
1. **Giảm chi phí lưu trữ (Storage Cost)**: Dữ liệu nén nhỏ hơn giúp tiết kiệm tiền thuê Cloud Storage (S3, GCS) hoặc đĩa cứng vật lý.
2. **Đẩy nhanh tốc độ truy xuất (I/O Speed)**: Đọc 1GB dữ liệu nén từ đĩa vào RAM và giải nén (bằng CPU) thường nhanh hơn nhiều so với việc đọc 5GB dữ liệu chưa nén từ đĩa. Tốc độ CPU để giải nén hiện đại vượt trội hơn so với thông lượng đĩa cứng.
3. **Giảm Network Bandwidth**: Trong quá trình xử lý song song (ví dụ: giai đoạn Shuffle trong MapReduce/Spark), dữ liệu nén giúp giảm đáng kể lượng traffic mạng giữa các node.

---

## Core idea

Nguyên lý hoạt động của hầu hết các thuật toán nén dựa trên hai khái niệm chính:
* **Từ điển (Dictionary / Lempel-Ziv)**: Tìm kiếm và thay thế các chuỗi ký tự/byte lặp lại bằng các tham chiếu (references) ngắn hơn. Nếu từ 'database' xuất hiện 100 lần, nó chỉ được lưu đầy đủ ở lần đầu, 99 lần sau được thay bằng con trỏ tham chiếu. (LZ4, Snappy, LZO áp dụng rất mạnh điều này để đạt tốc độ cao).
* **Mã hóa Entropy (Entropy Encoding / Huffman)**: Biểu diễn các ký tự hoặc byte xuất hiện thường xuyên bằng số lượng bit ít hơn, và những ký tự hiếm gặp bằng nhiều bit hơn. (Gzip kết hợp cả LZ77 và Huffman để đạt tỉ lệ nén cao).

---

## How it works

Hệ thống lưu trữ áp dụng nén thông qua các giai đoạn:
1. **Chia khối (Block/Chunking)**: Dữ liệu (ví dụ file Parquet) được chia thành các row groups hoặc blocks nhỏ (ví dụ 64MB hoặc 128MB). Nén được thực hiện độc lập trên từng block.
2. **Lọc/Tiền xử lý (Filtering/Pre-processing)**: Tùy chọn áp dụng các thuật toán như Bit-packing, Run-Length Encoding (RLE) hoặc Delta Encoding trước để làm dữ liệu đồng nhất hơn (đặc biệt hữu ích với lưu trữ dạng cột).
3. **Nén (Compressing)**: Block dữ liệu được đưa qua thuật toán như Snappy hoặc Zstd để tạo ra block nén.
4. **Giải nén (Decompressing)**: Khi có truy vấn đọc, hệ thống (như Spark/Presto) sẽ nạp block nén vào RAM và giải nén ngay tức thì bằng CPU trước khi xử lý.

---

## Algorithm Comparison

| Thuật toán | Tỉ lệ nén (Compression Ratio) | Tốc độ nén (Compression Speed) | Tốc độ giải nén (Decompression Speed) | CPU Usage | Best for |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Snappy** | Thấp (Khoảng 1.5x - 2x) | Rất nhanh (~500 MB/s) | Cực nhanh (~1.5 GB/s) | Thấp | Dữ liệu trung gian (Shuffle), Cache, Kafka |
| **LZ4** | Rất thấp (Gần bằng Snappy) | Nhanh nhất (~800 MB/s) | Nhanh nhất (~4.0 GB/s) | Rất thấp | In-memory storage, Caching |
| **Gzip** | Cao (Khoảng 3x - 4x) | Chậm (~50 MB/s) | Chậm (~150 MB/s) | Cao | Lưu trữ Cold Data, Logs, JSON/CSV dài hạn |
| **Zstandard (Zstd)** | Rất cao (Tương đương Gzip) | Nhanh (~250 MB/s) | Rất nhanh (~750 MB/s) | Trung bình | Lưu trữ Data Lake (Parquet), Hầu hết mọi Use case hiện nay |

---

## Practical example

Xét một file Parquet chứa dữ liệu Clickstream với cấu trúc dạng cột. Cột `country` chỉ có vài chục giá trị lặp lại hàng triệu lần ("VN", "US", "UK").

Nếu lưu trữ dưới dạng text thông thường (Uncompressed), nó sẽ chiếm một lượng dung lượng khổng lồ.
Áp dụng nén bằng PySpark:

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("CompressionExample").getOrCreate()

# Đọc dữ liệu lớn
df = spark.read.csv("s3://bucket/raw_data/*.csv", header=True)

# 1. Lưu với Snappy (Tốc độ cao, dung lượng vừa) - Thường là default của Parquet cũ
df.write.parquet("s3://bucket/processed/snappy_data/", compression="snappy")

# 2. Lưu với Gzip (Tỉ lệ nén tốt, tốc độ chậm)
df.write.parquet("s3://bucket/processed/gzip_data/", compression="gzip")

# 3. Lưu với Zstandard (Cân bằng xuất sắc giữa Tỉ lệ nén và Tốc độ) - Lựa chọn tối ưu nhất
df.write.parquet("s3://bucket/processed/zstd_data/", compression="zstd")
```

Trong thực tế, file gốc 10GB có thể thành:
* Snappy: ~4GB
* Zstd: ~2.5GB (nhưng tốc độ đọc/ghi nhanh gấp đôi Gzip)
* Gzip: ~2.4GB

---

## Best practices

* **Zstandard là Vua hiện tại**: Luôn coi Zstd là lựa chọn mặc định khi cấu hình lưu trữ Data Lake (Parquet/ORC) vì nó cung cấp mức nén tương đương Gzip nhưng tốc độ nén/giải nén nhanh hơn gấp 3-5 lần.
* **Sử dụng Splittable Compression**: Khi làm việc với hệ sinh thái Hadoop/Spark và file văn bản (CSV/JSON), tránh dùng Gzip thông thường vì nó không thể chia cắt (not splittable). Một file Gzip 10GB chỉ được xử lý bởi 1 CPU core. Hãy dùng định dạng file hỗ trợ block-level compression như Parquet, ORC, Avro (chúng chia file thành các block nén độc lập), hoặc dùng bzip2 (tốc độ siêu chậm nhưng splittable).
* **Kết hợp Cột (Column-oriented) và Nén**: Thiết kế dữ liệu theo cột (Parquet) giúp các dữ liệu có cùng kiểu đứng cạnh nhau. Điều này kết hợp cực tốt với RLE (Run-Length Encoding) và Dictionary Encoding trước khi đưa vào thuật toán nén tổng thể.

---

## Common mistakes

* **Cố nén dữ liệu đã được nén**: Dùng Snappy/Gzip để nén các tệp hình ảnh (JPEG), video (MP4) hoặc âm thanh (MP3). Những tệp này bản chất đã bị nén bằng thuật toán lossy. Nén thêm không làm giảm kích thước mà chỉ lãng phí CPU.
* **Lựa chọn Gzip cho Spark Shuffle**: Gzip quá tốn CPU và chậm cho các công đoạn trung gian cần tốc độ I/O liên tục. Shuffle data nên dùng Snappy hoặc LZ4.
* **Đánh đổi quá nhiều cho Tỉ lệ nén**: Chỉnh mức nén Zstd lên level quá cao (ví dụ level 19) để cố ép dung lượng thêm vài MB, nhưng lại tiêu tốn gấp 10 lần thời gian CPU, gây chậm toàn bộ pipeline ETL.

---

## Trade-offs

### Snappy / LZ4
* **Pros**: Tốc độ siêu việt, ít tải CPU.
* **Cons**: Tỉ lệ nén kém, tốn nhiều ổ đĩa hơn.

### Gzip
* **Pros**: Khả năng nén mạnh mẽ, tiêu chuẩn được hỗ trợ ở mọi nơi.
* **Cons**: Tốc độ xử lý rùa bò, tốn kém tài nguyên CPU, không hỗ trợ xử lý song song trên một file (not splittable).

### Zstandard (Zstd)
* **Pros**: Điểm ngọt (Sweet spot) hoàn hảo. Nén tốt như Gzip nhưng tốc độ tiệm cận Snappy. Hỗ trợ nhiều cấp độ (levels) linh hoạt. Có tính năng "Train with dictionary" cho các file JSON nhỏ.
* **Cons**: Ít tích hợp mặc định trên các hệ thống cũ kỹ so với Gzip/Snappy.

---

## When to use

* **Dùng LZ4/Snappy**: Khi xử lý stream (Kafka, Flink), dữ liệu cache trong RAM, hoặc ghi/đọc dữ liệu trung gian (Shuffle) trong Spark. Ở đây Tốc độ I/O quan trọng hơn Không gian.
* **Dùng Zstd**: Dành cho lưu trữ dài hạn trên Data Lake (Parquet/Iceberg), data warehouse, tối ưu cả lưu trữ lẫn chi phí đọc.
* **Dùng Gzip**: Khi yêu cầu bắt buộc xuất file Text/CSV/JSON chuẩn hóa cho bên thứ ba, hoặc lưu trữ archival data không bao giờ chạm tới.

## When not to use

* Không dùng thuật toán nén lossless cho dữ liệu multimedia (Hình ảnh, Video, Âm thanh).
* Tránh nén các tệp tin đã được mã hóa (Encrypted data), vì dữ liệu mã hóa là ngẫu nhiên và entropy cực đại, dẫn đến tỉ lệ nén gần bằng không hoặc thậm chí làm tăng kích thước tệp.

---

## Related concepts

* [Columnar Storage](/concepts/columnar-storage)
* [Parquet](/concepts/parquet)
* [Data Lake](/concepts/data-lake)

---

## Interview questions

### 1. Tại sao nén dữ liệu lại làm TĂNG tốc độ của các truy vấn phân tích (OLAP) dù phải mất thêm thời gian CPU để giải nén?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết về Bottleneck của hệ thống: Disk/Network I/O vs CPU.
* **Gợi ý trả lời (Strong Answer)**:
  * Trong các truy vấn phân tích quét khối lượng dữ liệu khổng lồ (table scan), nút thắt cổ chai lớn nhất là tốc độ đọc từ đĩa (Disk I/O throughput) và băng thông mạng (Network bandwidth), không phải CPU.
  * Tốc độ giải nén của CPU (ví dụ LZ4/Snappy đạt hàng GB/s) nhanh hơn nhiều so với tốc độ đọc đĩa (HDD chỉ khoảng 100-200 MB/s, SSD SATA ~500 MB/s). Do đó, đọc 1GB dữ liệu đã nén từ đĩa vào RAM rồi giải nén ra 3GB sẽ hoàn thành nhanh hơn việc phải đọc thô 3GB từ đĩa cứng.

### 2. Sự khác biệt giữa Block-level Compression (trong Parquet/ORC) và File-level Compression (như .csv.gz) là gì?
* **Người phỏng vấn muốn kiểm tra**: Khái niệm Splittability (khả năng chia cắt dữ liệu) trong xử lý phân tán.
* **Gợi ý trả lời (Strong Answer)**:
  * File `.csv.gz` nén toàn bộ tệp thành một khối liên tục. Gzip không có chỉ mục (index) và trạng thái giải nén phụ thuộc vào chuỗi byte trước đó. Khi Spark đọc file này, nó buộc phải nạp toàn bộ file vào 1 executor (1 CPU core) để giải nén từ đầu đến cuối, mất đi sức mạnh xử lý song song.
  * Định dạng Parquet sử dụng Block-level compression. File lớn được chia thành các blocks (ví dụ 128MB), và mỗi block được nén độc lập. Spark có thể cấp phát 10 executors để đọc 10 blocks cùng lúc từ nhiều node khác nhau, giữ được khả năng xử lý phân tán song song.

### 3. Bạn sẽ chọn thuật toán nén nào cho Data Lake hiện đại và tại sao?
* **Người phỏng vấn muốn kiểm tra**: Kiến thức cập nhật về công nghệ (Zstandard).
* **Gợi ý trả lời (Strong Answer)**:
  * Lựa chọn Zstandard (Zstd) cho Data Lake.
  * Zstd giải quyết được bài toán đánh đổi kinh điển giữa "Tốc độ" và "Tỉ lệ nén". Nó cung cấp tỉ lệ nén ngang ngửa Gzip nhưng tốc độ đọc/ghi nhanh hơn gấp nhiều lần. Nhờ vậy, ta vừa giảm thiểu được chi phí lưu trữ S3, vừa đảm bảo hiệu năng tối ưu cho các công cụ query như Athena, Trino hoặc Spark.

---

## References

1. **Designing Data-Intensive Applications** - Martin Kleppmann (Chương 3: Bàn về Column Compression, Run-Length Encoding).
2. **Zstandard Documentation** (Facebook) - Whitepapers về hiệu năng của Zstd.
3. **Apache Parquet Documentation** - Các chuẩn nén hỗ trợ cho Row Group.
4. **Fundamentals of Data Engineering** - Joe Reis (Chương 7: Storage - Compression tradeoff).

---

## English summary

Compression algorithms in data engineering (like Snappy, Gzip, Zstd, LZ4) are critical techniques for reducing storage footprint and mitigating I/O bottlenecks. In distributed systems, CPU cycles are relatively abundant while disk and network throughput are scarce; thus, compressing data accelerates query execution by trading fast CPU decompression for minimized Disk/Network I/O. Modern architectures heavily favor Zstandard (Zstd) for analytical storage (Parquet/ORC) as it strikes a perfect balance—achieving Gzip-level compression ratios with speeds approaching Snappy—while Snappy or LZ4 remains ideal for ephemeral operations like streaming and Spark shuffle. Splittability, achieved via block-level compression in formats like Parquet, is essential to enable parallel distributed processing.
