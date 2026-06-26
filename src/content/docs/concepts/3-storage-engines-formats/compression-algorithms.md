---
title: "Thuật toán nén dữ liệu - Compression Algorithms"
difficulty: "Advanced"
tags: ["compression", "storage", "snappy", "gzip", "zstd", "lz4", "parquet", "spark"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Thuật toán nén dữ liệu (Compression Algorithms) - Snappy, Gzip, Zstd, LZ4"
metaDescription: "Phân tích sâu về kiến trúc và sự đánh đổi (trade-offs) của các thuật toán nén dữ liệu trong Big Data: Zstd, Snappy, LZ4, Gzip. Giải quyết các sự cố OOM và Data Skew."
description: "Trong hệ thống dữ liệu phân tán, nén dữ liệu không chỉ là câu chuyện tiết kiệm ổ cứng. Nó là bài toán tối ưu thông lượng I/O, giảm nghẽn mạng trong quá trình Shuffle và đánh đổi chu kỳ CPU."
---

Trong thiết kế hệ thống dữ liệu lớn (Big Data), việc tối ưu hóa dung lượng lưu trữ đôi khi chỉ là lợi ích phụ. Mục tiêu tối thượng của các thuật toán nén (Compression Algorithms) là **giảm thiểu I/O bottleneck** ở các tầng Network và Disk, bằng cách đánh đổi chu kỳ tính toán của CPU (CPU Cycles). 

Đối với một Staff Data Engineer, việc lựa chọn thuật toán nén không dừng lại ở câu hỏi "Thuật toán nào nén nhỏ nhất?", mà là bài toán hệ thống: **Tỉ lệ nén (Compression Ratio)** vs. **Thông lượng giải nén (Decompression Throughput)** vs. **Khả năng phân mảnh (Splittability)**.

---

## 1. Bản chất Vật lý của Nén dữ liệu trong Big Data

Trong các hệ thống phân tán như Spark, Presto hay các Cloud Data Warehouse, nút thắt cổ chai (bottleneck) phổ biến nhất hiếm khi nằm ở CPU, mà nằm ở **Disk I/O** hoặc **Network Bandwidth**.

Tại sao nén dữ liệu lại làm hệ thống chạy nhanh hơn, mặc dù CPU phải tốn thời gian để giải nén? 
Bởi vì trong kiến trúc máy tính hiện đại, băng thông từ Disk lên RAM và từ RAM vào CPU Cache (L1/L2) chênh lệch nhau nhiều bậc cường độ. Việc đọc 1GB dữ liệu đã nén từ đĩa NVMe/S3 sau đó giải nén trên RAM bằng CPU (có thể đạt tốc độ 2-3 GB/s/core) luôn nhanh hơn rất nhiều so với việc phải chờ I/O tải 4GB dữ liệu chưa nén qua network.

Hơn nữa, trong các pha **Network Shuffle** (xáo trộn dữ liệu giữa các Node), nén dữ liệu giúp giảm trực tiếp lưu lượng mạng, tránh tắc nghẽn NIC (Network Interface Card) và giảm hiện tượng ghi tràn đĩa (*Spill-to-disk*).

## 2. Parquet Compression Pipeline: Encoding vs. Compression

Rất nhiều kỹ sư nhầm lẫn giữa **Encoding** (Mã hóa hạng nhẹ) và **Compression** (Nén hạng nặng). Trong các định dạng Columnar như Parquet hoặc ORC, dữ liệu không được nén "nguyên cục". Nó trải qua một Pipeline nhiều bước ở mức độ Data Page.

```mermaid
graph TD
    A["Raw Data Column"] --> B{"Cardinality Check"}
    B -- Low Cardinality --> C["Dictionary Encoding"]
    B -- Sequential Data --> D["Run-Length Encoding - RLE"]
    B -- Narrow Range Int --> E["Bit-Packing"]
    C --> F("(Uncompressed Page"))
    D --> F
    E --> F
    F --> G{"Compression Codec"}
    G -- Snappy --> H["Compressed Parquet Block"]
    G -- Zstd --> H
    G -- LZ4 --> H
```

*   **Dictionary Encoding:** Nếu cột `city` có 10 triệu dòng nhưng chỉ có 50 giá trị duy nhất (Low Cardinality), Parquet sẽ lập một từ điển (vd: `0 = "Hanoi"`, `1 = "HCM"`). Dữ liệu thực tế chỉ lưu các số nguyên `0`, `1` thay vì chuỗi string dài.
*   **Run-Length Encoding (RLE):** Nếu dữ liệu lặp lại liên tục (ví dụ sau khi `ORDER BY` hoặc Z-Ordering), chuỗi `M, M, M, M, F, F` được lưu thành `4M, 2F`.
*   **Compression Codec:** Sau khi các encoding hạng nhẹ đã loại bỏ sự dư thừa cấu trúc, một thuật toán "hạng nặng" (như Zstd, Snappy) mới được áp dụng lên toàn bộ Data Page đó để nén byte-level.

> [!TIP]
> **Data Engineering Tip:** Để tối đa hóa tỉ lệ nén, hãy dùng hàm `ORDER BY` (Sorting) hoặc `Z-ORDER` theo các cột có low cardinality trước khi ghi ra Parquet. Việc này xếp các giá trị giống nhau nằm cạnh nhau, giúp RLE phát huy sức mạnh 100%, có thể giảm dung lượng file xuống còn 1/10 mà không tốn thêm CPU cho Codec nén.

---

## 3. Cuộc chiến của các Heavy-weight Codecs

### 3.1. LZ4: Kẻ thống trị Thông lượng (Extreme Speed)
*   **Đặc điểm:** Tốc độ giải nén siêu tưởng (đạt nhiều GB/s trên mỗi lõi CPU). LZ4 hi sinh tỉ lệ nén để lấy tốc độ.
*   **Ứng dụng:** Là chuẩn vàng cho các luồng dữ liệu **In-memory** và **Network Streaming**. Trong Apache Spark, LZ4 được chọn làm thuật toán nén mặc định cho quá trình **Shuffle** và dọn dẹp các RDD tạm thời. Khi các Executor đẩy dữ liệu qua mạng cho nhau, chúng dùng LZ4 để giảm tải cho Network I/O mà không làm CPU quá tải.

### 3.2. Snappy: Lựa chọn an toàn (Legacy Standard)
*   **Đặc điểm:** Do Google phát triển, Snappy từng là thuật toán mặc định của Parquet và Kafka trong nhiều năm. Nó cân bằng giữa tốc độ tốt và tỉ lệ nén vừa phải (thường nén file xuống còn 50-60%).
*   **Ứng dụng:** Ingestion (ghi dữ liệu thô) ở lớp Bronze/Landing. Khi bạn cần đẩy log từ Kafka xuống S3 cực nhanh (Latency-sensitive) và không quá bận tâm đến việc file lớn hơn Zstd một chút.

### 3.3. Zstandard (Zstd): Tiêu chuẩn của Lakehouse hiện đại
*   **Đặc điểm:** Do Meta (Facebook) phát triển, Zstd đã tạo ra cuộc cách mạng. Nó cung cấp tỉ lệ nén ngang ngửa Gzip nhưng tốc độ giải nén lại nhanh gấp 3-5 lần, tiệm cận với Snappy. Đặc biệt, Zstd hỗ trợ mức độ nén (Compression Levels) từ 1 đến 22.
*   **Ứng dụng:** Trở thành codec mặc định cho Apache Iceberg, Delta Lake và Parquet v2. Zstd tối ưu nhất cho khu vực Datalake tĩnh (Silver/Gold layers), nơi dữ liệu được đọc (Read-heavy) hàng triệu lần bởi các engine như Trino, Athena hay Spark SQL.

### 3.4. Gzip: Tàn dư của thời đại cũ
*   **Đặc điểm:** Tỉ lệ nén cực kỳ cao, nhưng ngốn CPU kinh khủng khiếp và giải nén rất chậm. 
*   **Tử huyệt (Khả năng Splittability):** Gzip **TUYỆT ĐỐI KHÔNG** thể chia cắt (Splittable) khi nén các file văn bản (CSV, JSON). Nếu bạn có một file `logs.json.gz` nặng 20GB, Spark không thể chia cho 100 CPU Cores đọc song song. Nó bắt buộc phải dùng 1 Task duy nhất để giải nén file từ đầu đến cuối tuần tự.

---

## 4. Systemic Trade-offs & Sự cố Thực chiến (Troubleshooting)

Đây là nơi khác biệt giữa một Kỹ sư biết dùng tool và một Staff Engineer hiểu về hệ thống.

### 🚨 Incident 1: Spark OOMKilled do Gzip Data Skew
*   **Ngữ cảnh:** Một Data Engineer nén file JSON xuất từ MongoDB bằng Gzip để tiết kiệm tiền S3. File `users_dump.json.gz` nặng 50GB (sau khi nén).
*   **Triệu chứng:** Khi chạy Spark Job, 99 Tasks hoàn thành trong 10 giây. Duy nhất 1 Task bị treo trong 2 giờ, sau đó Executor báo lỗi `java.lang.OutOfMemoryError: Java heap space` hoặc `OOMKilled` bởi Kubernetes.
*   **Nguyên nhân:** File Gzip không có cơ chế "sync markers" ở giữa file. Spark phải nhồi toàn bộ khối lượng 50GB (cộng thêm hàng trăm GB dung lượng phình to khi giải nén trong RAM) vào một Executor duy nhất. Hiện tượng này gây ra **Data Skew** phần cứng cực đoan.
*   **Giải pháp:** 
    1. Tiền xử lý: Dùng một script Python/Bash chia nhỏ file Gzip thành 500 files (mỗi file 100MB) trước khi đẩy lên S3.
    2. Chuyển đổi định dạng: Đọc file thô và ghi lại thành định dạng Parquet với Snappy/Zstd. Bên trong Parquet, Gzip/Snappy được áp dụng ở mức độ từng Block/Row Group (thường là 128MB), do đó Spark có thể "nhảy" đến các Row Group khác nhau và đọc song song hoàn toàn trơn tru.

### 🚨 Incident 2: Hiệu ứng "Zstd Level 19" cắn nát Cloud Bill
*   **Ngữ cảnh:** Một team Data quyết định chuyển toàn bộ kho dữ liệu sang Zstd với cấu hình cực đoan `compressionLevel = 19` (mức cao nhất) nhằm giảm hóa đơn lưu trữ S3.
*   **Đánh đổi (The Trade-off):** Mức độ 19 sử dụng các thuật toán nén phức tạp và tốn một lượng khổng lồ CPU RAM. Kết quả là, chi phí lưu trữ S3 giảm được $500/tháng, nhưng hóa đơn tính toán (Compute Cost) của Databricks/EMR tăng lên $3000/tháng do các Cluster phải chạy lâu hơn và dùng nhiều node to hơn chỉ để làm toán giải nén.
*   **Giải pháp (The Sweet Spot):** Zstd Level 3. Các Benchmark thực tế chứng minh Zstd Level 3 là điểm "Cân bằng vàng". Nó tiết kiệm dung lượng hơn Snappy ~15% mà hầu như không tăng độ trễ (Latency).

---

## 5. Show Code: Cấu hình Thực chiến

Thay vì để mặc định, hãy kiểm soát trực tiếp các thuật toán nén trong hệ thống của bạn.

**Apache Spark (PySpark):** Tối ưu Shuffle và Parquet Write
```python
# Tối ưu cho Data Mesh / Network: Dùng LZ4 cho Shuffle để giải tỏa tắc nghẽn mạng
spark.conf.set("spark.shuffle.compress", "true")
spark.conf.set("spark.shuffle.spill.compress", "true")
spark.conf.set("spark.io.compression.codec", "lz4")

# Tối ưu cho Storage: Dùng Zstd cho Output Parquet
spark.conf.set("spark.sql.parquet.compression.codec", "zstd")

# Ghi dữ liệu với Z-Ordering để RLE hoạt động mạnh nhất
df.sort("tenant_id", "created_date") \
  .write \
  .format("parquet") \
  .mode("overwrite") \
  .save("s3://datalake/gold/users/")
```

**Apache Kafka (Producer):** Tối ưu Ingestion cho Streaming
```properties
# Sử dụng LZ4 hoặc Snappy để giảm Latency nhưng tăng thông lượng ghi.
# (Producer tốn một chút CPU, nhưng giảm dung lượng mạng truyền đến Broker)
compression.type=lz4
linger.ms=50
batch.size=131072
```

---

## 6. Tổng kết (The Codec Cheat Sheet)

Nếu bạn không muốn suy nghĩ quá nhiều, đây là bộ nguyên tắc thiết kế mặc định:

| Kịch bản sử dụng (Use Case) | Định dạng khuyên dùng | Lựa chọn Codec | Lý do kiến trúc |
| :--- | :--- | :--- | :--- |
| **Real-time Streaming (Kafka)** | JSON / Avro | `LZ4` / `Snappy` | Latency là ưu tiên số một. Giảm nhẹ tải mạng mà không ngốn CPU. |
| **Spark Intermediate Shuffle** | Spark internal | `LZ4` | Tốc độ giải nén siêu nhanh, tránh tắc nghẽn NIC (Network). |
| **Datalake Landing (Bronze)** | Parquet / JSON | `Snappy` | "Set and forget", xử lý ingest nhanh, tương thích ngược tốt. |
| **Warehouse / Lakehouse (Gold)**| Parquet / Iceberg | `Zstd` (Level 3) | Cân bằng hoàn hảo. Dung lượng nhỏ hơn Snappy, đọc cực nhanh. |
| **Cold Data Archival** | Parquet / CSV | `Zstd` (Level 9+) hoặc `Gzip` | Dữ liệu Write-Once, Read-Rarely. Tối ưu chi phí lưu trữ S3. |

---

## Nguồn Tham Khảo (References)
*   [Zstandard - Real-time data compression algorithm (Meta)](https://facebook.github.io/zstd/)
*   [Apache Parquet Format Specifications (File Format & Encoding)](https://parquet.apache.org/docs/file-format/)
*   [Designing Data-Intensive Applications (Chapter 3: Storage and Retrieval)](https://dataintensive.net/)
*   [Databricks Engineering Blog: Z-Ordering and Data Skipping](https://www.databricks.com/blog/2018/07/31/processing-petabytes-of-data-in-seconds-with-databricks-delta.html)
