---
title: "Định dạng Dữ liệu Data Lake: Parquet, ORC, Avro internals"
difficulty: "Advanced"
tags: ["file-formats", "parquet", "orc", "avro", "data-lake", "storage"]
readingTime: "20 mins"
lastUpdated: 2026-06-26
seoTitle: "Cấu trúc file Parquet, Avro chuyên sâu: Tối ưu Spark, Small Files Problem"
metaDescription: "Hiểu sâu Data Lake File Formats ở mức block: Row Groups, Dictionary Encoding trong Parquet. Schema Evolution trong Avro. Giải quyết Small Files Problem."
---

Data Lake không dùng cơ sở dữ liệu truyền thống, nó là một đại dương các file tĩnh (S3, GCS). Vì Tốc độ mạng (Network I/O) và Tốc độ Đọc/Ghi đĩa (Disk I/O) là nút thắt cổ chai đắt đỏ nhất trong Data Engineering, việc chọn đúng, hiểu sâu và tuning cấu hình vật lý của các File Formats quyết định hệ thống sẽ phản hồi trong 2 giây hay 2 tiếng.

## 1. Columnar Storage Internals: Apache Parquet

Parquet là trái tim của hệ sinh thái OLAP hiện đại (Spark, Trino, Snowflake). Không giống như CSV đọc tuần tự từ trên xuống dưới, Parquet được thiết kế phân tầng tinh vi để hệ thống phân tán (Distributed Engines) có thể đọc song song và "nhảy cóc" qua hàng TB dữ liệu mà không cần load chúng vào RAM.

### 1.1. Cấu trúc vật lý của Parquet

```mermaid
graph TD
    subgraph Parquet File
        Header["File Header"]
        subgraph Row Group 1["Row Group 1("128MB - 1GB")"]
            C1["Column 1 Chunk<br/>e.g., 'user_id'"]
            C2["Column 2 Chunk<br/>e.g., 'revenue'"]
            subgraph Column Chunk Structure
                P1["Page 1: 1MB compressed data"]
                P2["Page 2: 1MB compressed data"]
            end
        end
        RowGroupN["Row Group N"]
        Footer["File Footer / Metadata<br/>Schema, Min/Max stats, Offsets"]
    end
    Header --- Row Group 1
    Row Group 1 --- RowGroupN
    RowGroupN --- Footer
    C1 --> Column Chunk Structure
```

1. **Row Group:** File được chia ngang thành các khối dữ liệu khổng lồ (thường 128MB). Một Row Group chứa đầy đủ các cột cho một khoảng dòng nhất định (ví dụ 10 triệu dòng đầu tiên). Tính phân tán: Spark có thể cử 10 worker, mỗi worker đọc 1 Row Group độc lập!
2. **Column Chunk:** Trong một Row Group, dữ liệu được chia nhỏ theo cột. Nếu câu SQL là `SELECT revenue`, hệ thống bỏ qua toàn bộ Column Chunk của `user_id`.
3. **Pages:** Đơn vị vật lý nhỏ nhất (khoảng 1MB) nơi chứa data thực và dictionary.

### 1.2. Tính năng "Sát thủ": Predicate Pushdown (Filter Pushdown)
Trong `File Footer`, Parquet lưu các chỉ số thống kê (Min, Max, Null count) cho TỪNG Column Chunk.
Khi bạn chạy: `SELECT * FROM sales WHERE event_date = '2023-12-01'`
- Engine đọc phần Footer siêu nhẹ (vài KB).
- Nó kiểm tra: Row Group 1 có `event_date` (Min: '2023-01-01', Max: '2023-06-30'). Nó bỏ qua (Skip) hoàn toàn Row Group 1.
- Hiệu năng I/O giảm từ hàng Terabytes xuống chỉ còn vài Megabytes! Quá trình lặp qua từng file để check metadata mất mili-giây.

**Sự cố Đời thực:** Nếu dữ liệu ghi vào không được SORT (Sắp xếp) theo cột thường xuyên query (như `date` hoặc `tenant_id`), các khoảng Min-Max của mọi Row Groups sẽ giao nhau rộng khắp. Pushdown thất bại, hệ thống phải Full Scan và chạy rùa bò.

### 1.3. Cơ chế Nén Đặc thù (Encoding vs Compression)
Parquet thực hiện 2 bước thu nhỏ dung lượng:
- **Encoding (Mã hóa):** Ở mức logic. Nếu cột `Status` chỉ có 3 giá trị ('PENDING', 'SUCCESS', 'FAILED'), Parquet tự động dùng **Dictionary Encoding**: Lập map (0=PENDING, 1=SUCCESS, 2=FAILED) và lưu mảng data là một chuỗi các bit nhỏ xíu `0, 1, 2...` thay vì lặp lại chuỗi ký tự dài. 
- **Compression (Nén bằng thuật toán):** Ở mức vật lý. Nén các Pages đã encoded bằng Snappy, GZIP hoặc ZSTD.
  
## 2. Row-Based Storage Internals: Apache Avro

Avro là tiêu chuẩn vàng của Data Streaming (Kafka) và Dữ liệu hạ cánh (Landing Zone).

### 2.1. Schema là tối thượng
Không giống JSON hay CSV để mặc hệ thống tự đoán kiểu (gây lỗi khi data sai dị dạng), Avro lưu trữ tĩnh toàn bộ Schema (bằng JSON) ngay tại File Header. Dữ liệu bên dưới được ghi dưới dạng Byte nhị phân siêu tinh gọn (không lưu tên trường hay ngoặc nhọn).

### 2.2. Schema Evolution (Tiến hóa cấu trúc)
Đây là lý do Avro là vua. Khi hệ thống Microservices thay đổi, bảng dữ liệu thường bị thêm/bớt cột. Avro sinh ra để giải quyết việc này mà không phá vỡ pipeline downstream.
- Avro duy trì 2 schema: **Writer's Schema** (khi data được ghi) và **Reader's Schema** (khi data được hệ thống phân tích đọc).
- Nếu thêm một cột mới (có Default value), Avro tự động hòa trộn, data cũ vẫn đọc được như bình thường.
- Không bao giờ bị lỗi "Column not found" làm sập các Spark Job giữa đêm khuya.

## 3. Operational Risks: Kẻ thù số 1 - The Small Files Problem

Hệ thống Data Lake (HDFS, S3) sinh ra để xử lý các file lớn (GBs). Tuy nhiên, các luồng streaming (ví dụ Flink, Spark Streaming) xả data xuống S3 liên tục mỗi phút, tạo ra hàng triệu file cực nhỏ (vài KB).

**Hậu quả:**
1. **S3 Metadata Throttling (API Choke):** Gọi API S3 `ListObjects` và `GetObject` cho 1 triệu file tốn phí gọi API khổng lồ và bị S3 bóp băng thông (HTTP 503 Slow Down).
2. **NameNode OOM (HDFS):** Mỗi metadata của 1 file tốn 150 bytes trên RAM của Hadoop Master. Hàng trăm triệu file rác sẽ làm crash NameNode, sập toàn bộ Data Lake của tập đoàn.
3. **Execution Overhead:** Mở/đóng 1 file mất vài chục ms (Network TCP handshake). Đọc 10,000 file x 10KB chậm hơn rất nhiều so với đọc 1 file x 100MB dù dung lượng bằng nhau.

**Khắc phục (FinOps & Arch):**
- **Compaction Jobs:** Bắt buộc phải có các pipeline chạy ngầm định kỳ hàng giờ/ngày để gộp (Merge) các file nhỏ thành các file chuẩn 128MB - 512MB. Bằng Spark: `df.repartition(1).write.parquet()`.
- Sử dụng **Apache Iceberg / Delta Lake:** Chúng tự động quản lý metadata tree gọn gàng và cung cấp lệnh `OPTIMIZE` để tự thực hiện Compaction background.

## 4. Nguồn Tham Khảo (References)
*   [Apache Parquet Format Specifications](https://github.com/apache/parquet-format)
*   [Databricks: Small Files Problem and Delta Lake](https://docs.databricks.com/en/delta/tune-file-size.html)
*   [Designing Data-Intensive Applications - Martin Kleppmann (Part 1: Storage and Retrieval)](https://dataintensive.net/)
