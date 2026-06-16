---
title: "Thuật toán nén dữ liệu - Compression Algorithms"
difficulty: "Intermediate"
tags: ["compression", "storage", "snappy", "gzip", "zstd", "lz4"]
readingTime: "15 mins"
lastUpdated: 2026-06-07
seoTitle: "Thuật toán nén dữ liệu (Compression Algorithms) - Snappy, Gzip, Zstd"
metaDescription: "Tìm hiểu chi tiết về các thuật toán nén dữ liệu trong Big Data: Snappy, Gzip, Zstd, LZ4. So sánh hiệu năng, tỉ lệ nén và cách lựa chọn phù hợp."
description: "Trong thiết kế hệ thống dữ liệu lớn (Big Data), việc tối ưu hóa dung lượng lưu trữ và tốc độ truyền tải thông tin là một bài toán sống còn. Các thuật toán nén đóng vai trò then chốt trong việc giảm thiểu I/O bottleneck."
---



Trong thiết kế hệ thống dữ liệu lớn (Big Data), việc tối ưu hóa dung lượng lưu trữ và tốc độ truyền tải thông tin là một bài toán sống còn. Các thuật toán nén (Compression Algorithms) được sử dụng rộng rãi để giảm dung lượng file lưu trữ, giảm băng thông mạng và quan trọng nhất là giảm I/O đĩa (Disk I/O). Trong Data Engineering, việc lựa chọn thuật toán nén phải luôn cân nhắc sự đánh đổi giữa **Tỉ lệ nén (Compression Ratio)**, **Tốc độ nén (Compression Speed)** và **Tốc độ giải nén (Decompression Speed)**.

## 1. Tại sao nén dữ liệu lại quan trọng trong Big Data?

Trong các hệ thống phân tán như Hadoop, Spark hay các Cloud Data Warehouse, nút thắt cổ chai (bottleneck) phổ biến nhất thường không phải là CPU, mà là **Disk I/O** hoặc **Network I/O**.

*   **Tăng tốc độ đọc từ đĩa (Disk I/O):** Đọc 1GB dữ liệu đã nén từ đĩa nhanh hơn rất nhiều so với việc đọc 4GB dữ liệu chưa nén. Dù CPU phải hoạt động để giải nén (decompress), nhưng CPU trong các server hiện đại xử lý cực kỳ nhanh, dẫn đến thời gian tiết kiệm được từ I/O lớn hơn rất nhiều so với thời gian mất đi để giải nén.
*   **Giảm chi phí lưu trữ đám mây:** Trên S3, GCS hay ADLS, dung lượng nén nhỏ giúp giảm trực tiếp chi phí lưu trữ hàng tháng (Storage Cost).
*   **Tối ưu băng thông mạng (Network Bandwidth):** Trong các giai đoạn xử lý phân tán phức tạp như thao tác *Shuffle* trong Spark, dữ liệu di chuyển liên tục giữa các node. Nén dữ liệu giúp giảm lưu lượng truyền tải trên mạng.

## 2. Tiêu chí đánh giá các Thuật toán nén

Khi quyết định sử dụng một thuật toán nén, Data Engineer sẽ dựa trên 4 yếu tố chính:

1.  **Compression Ratio (Tỉ lệ nén):** Kích thước file sau khi nén so với kích thước ban đầu. File có tỉ lệ nén càng cao (kích thước càng nhỏ) thì càng tiết kiệm lưu trữ nhưng thường sẽ giải nén chậm.
2.  **Compression Speed (Tốc độ nén):** Tốc độ nén dữ liệu (MB/s). Quan trọng trong các tác vụ ghi (Data Ingestion, ETL Write).
3.  **Decompression Speed (Tốc độ giải nén):** Tốc độ đọc dữ liệu (MB/s). Rất quan trọng trong các ứng dụng phân tích (Analytics), vì dữ liệu thường được ghi một lần (Write-Once) nhưng đọc rất nhiều lần (Read-Many).
4.  **Splittability (Khả năng phân chia):** Một file nén khổng lồ có thể được chia cắt (split) để nhiều CPU Core / Node cùng đọc song song mà không cần giải nén từ đầu đến cuối file hay không. Tính năng này đóng vai trò quyết định trong Spark và Hadoop.

## 3. Các thuật toán nén "hạng nặng" (Heavy-weight) phổ biến

### 3.1. Snappy (Bởi Google)
*   **Ưu điểm:** Tốc độ nén và giải nén cực nhanh, độ tiêu thụ CPU rất thấp.
*   **Nhược điểm:** Tỉ lệ nén không ấn tượng so với các thuật toán khác (file sau khi nén vẫn lớn hơn Gzip hoặc Zstd).
*   **Khả năng Splittability:** Không thể split khi nén text thuần túy. Tuy nhiên, khi nhúng bên trong định dạng Parquet hoặc ORC (được nén ở từng Data Page/Block nhỏ độc lập), file Parquet Snappy hoàn toàn có thể được đọc song song.
*   **Ứng dụng:** Snappy từng là thuật toán nén mặc định của Apache Parquet và Kafka. Nó tối ưu khi hệ thống yêu cầu ưu tiên thông lượng (throughput) ghi/đọc nhanh, phù hợp cho các khu vực dữ liệu tạm hoặc lớp Bronze (Landing).

### 3.2. Zstandard / Zstd (Bởi Meta/Facebook)
*   **Ưu điểm:** Được đánh giá là tạo ra **sự cân bằng hoàn hảo nhất** hiện nay. Zstd có tỉ lệ nén tương đương (hoặc hơn) Gzip, nhưng mang lại tốc độ giải nén nhanh tiệm cận với Snappy. Đồng thời, nó hỗ trợ rất nhiều Cấp độ nén (Compression Level từ 1 đến 22) để tùy chỉnh (cấp độ càng cao, file càng nhỏ, nhưng nén càng chậm).
*   **Khả năng Splittability:** Giống Snappy, nó không tự nhiên splittable cho Text file nhưng splittable tuyệt vời trong Parquet blocks.
*   **Ứng dụng:** Trở thành tiêu chuẩn mới. Mặc định của Parquet v2.0+ và được khuyên dùng rộng rãi trong hầu hết các nền tảng Datalake và Data Warehouse hiện đại.

### 3.3. Gzip / Zlib
*   **Ưu điểm:** Thuật toán rất lâu đời, phổ biến và cung cấp tỉ lệ nén rất tốt. Mọi công cụ đều có thể giải nén Gzip.
*   **Nhược điểm:** Tốc độ nén và giải nén chậm, tiêu thụ nhiều CPU.
*   **Khả năng Splittability:** **Hoàn toàn không splittable.** Nếu bạn lưu một file JSON hoặc CSV nén Gzip có kích thước 10GB, Spark sẽ chỉ dùng đúng 1 Task (1 CPU Core) để xử lý file này từ đầu đến cuối, gây ra Data Skew và OOM trầm trọng.
*   **Ứng dụng:** Chủ yếu dùng cho **Cold Data** – những file dữ liệu lưu trữ dài hạn ít khi truy xuất.

### 3.4. LZ4
*   **Ưu điểm:** Tốc độ nén siêu tốc và giải nén gần như là **nhanh nhất** (đạt hàng GB/s mỗi core).
*   **Nhược điểm:** Đánh đổi lại là tỉ lệ nén thấp nhất.
*   **Ứng dụng:** Được dùng cho việc nén in-memory, các ứng dụng time-series streaming. Trong Apache Spark, LZ4 là thuật toán mặc định để nén các file trung gian sinh ra trong giai đoạn **Shuffle**.

### 3.5. Bzip2 và LZO
*   **Bzip2:** Tỉ lệ nén siêu cao, siêu chậm. Điều đặc biệt là Bzip2 hỗ trợ splittable ngay trên text file (CSV/JSON), nên Spark có thể đọc song song một file `data.bz2` khổng lồ. Tuy nhiên vì nó quá nặng CPU nên không còn được ưa chuộng.
*   **LZO:** Thuật toán truyền thống trong kỉ nguyên Hadoop, vừa có tính splittable vừa tốc độ nhanh nhưng việc cài đặt phức tạp do yêu cầu library ngoài và lập chỉ mục (index).

## 4. Encoding (Mã hóa) vs Compression (Nén)

Trước khi thực hiện các thuật toán nén "hạng nặng" (như Snappy/Zstd) lên toàn bộ block, các định dạng Columnar như Parquet và ORC áp dụng các kỹ thuật **Light-weight Encoding** (Mã hóa nhẹ) ở cấp độ Column. Các thuật toán này chỉ áp dụng cho một số cấu trúc dữ liệu nhất định, tiết kiệm đáng kể dung lượng nhưng tốn rất ít chi phí CPU:

*   **Dictionary Encoding:** Hữu ích với các cột có tính chọn lọc thấp (Low Cardinality) như "Thành phố", "Giới tính". Thay vì lưu lặp đi lặp lại chữ "Hồ Chí Minh" 1 triệu lần, nó đánh index `0 = "Hồ Chí Minh"` và lưu số `0`.
*   **Run-Length Encoding (RLE):** Nén chuỗi các giá trị lặp lại liền kề. Chuỗi giá trị `A, A, A, A, B, B` sẽ được lưu thành `4A, 2B`. Việc sắp xếp dữ liệu (Sorting) trước khi lưu sẽ tối đa hóa hiệu quả của RLE.
*   **Bit-packing:** Khi các giá trị số nằm trong một dải hẹp, thay vì dùng loại dữ liệu mặc định Int32 (32 bit), nó có thể dùng ít bit hơn (ví dụ giá trị chỉ từ 0-7 thì chỉ cần dùng 3 bit để biểu diễn).

> **Pipeline thực thi nén trong Parquet:**
> `Dữ liệu vào` $\rightarrow$ `Dictionary/RLE Encoding` $\rightarrow$ `Snappy/Zstd Compression` $\rightarrow$ `Ghi xuống ổ cứng`.

## 5. Chiến lược Lựa chọn Thực tế (Best Practices)

Để tối ưu hệ thống Datalake / Lakehouse của bạn, hãy áp dụng các nguyên tắc sau:

1.  **Dùng Zstandard làm mặc định cho Datalake:** Với dữ liệu Data Warehouse hay Lakehouse (vùng Silver / Gold), luôn chọn Parquet hoặc Iceberg / Delta Lake với Zstd. Nó mang lại sự tối ưu toàn diện nhất.
2.  **Chỉ định Snappy cho Real-time/Streaming:** Khi cần ingest một lượng lớn dữ liệu raw (ví dụ Log từ Kafka, Kinesis) vào landing zone (Bronze layer) với mục tiêu ghi siêu tốc để tránh trễ (latency), Snappy hoặc LZ4 là các lựa chọn thích hợp.
3.  **Tuyệt đối tránh file Text nén Gzip dung lượng lớn:** Tránh lưu trữ CSV/JSON nén `.gz` có size quá lớn (ví dụ >256MB). Hãy chia nhỏ các file gz này trước khi đọc, hoặc chuyển dữ liệu sang định dạng Parquet.
4.  **Khai thác RLE bằng Sorting / Z-Ordering:** Nếu bạn biết cột dữ liệu nào thường xuyên được filter (ví dụ `created_date`), hãy sắp xếp (Sort) DataFrame theo cột đó trước khi `.write.parquet`. Dữ liệu có tính tuần tự cao sẽ làm cho RLE và Dictionary Encoding nén cực kì nhỏ, nâng tỉ lệ nén chung lên mức tối đa.

## Tài Liệu Tham Khảo
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/file-format/)
* [Zstandard - Real-time data compression algorithm](https://facebook.github.io/zstd/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
