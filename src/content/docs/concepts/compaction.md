---
title: "Compaction"
category: "Data Lake & Lakehouse"
difficulty: "Intermediate"
tags: ["compaction", "data-lakehouse", "optimization", "small-files-problem"]
readingTime: "8 mins"
lastUpdated: 2026-06-07
seoTitle: "Compaction - Tối ưu hóa hiệu năng Data Lake (Small Files Problem)"
metaDescription: "Tìm hiểu Compaction trong Data Engineering: giải pháp cho Small Files Problem, cách gom tệp tin nhỏ thành tệp lớn để tăng tốc độ truy vấn trên Data Lake."
---

# Compaction

## Summary

Compaction (Gom tệp) là quá trình bảo trì định kỳ chạy nền nhằm kết hợp (merge) hàng ngàn tệp tin dữ liệu nhỏ lẻ thành số lượng ít các tệp tin lớn hơn có kích thước tối ưu. Đây là kỹ thuật cốt lõi để giải quyết vấn đề nghẽn cổ chai kinh điển "Small Files Problem" trên các hệ thống tệp phân tán (HDFS) và Object Storage đám mây (Amazon S3, GCS), giúp cải thiện đáng kể hiệu năng truy vấn đọc và giảm bớt áp lực lưu trữ siêu dữ liệu (metadata).

---

## Definition

**Compaction** là một kỹ thuật tổ chức lại dữ liệu vật lý. Nó lấy các tệp tin lưu trữ (như Parquet, ORC, Avro) có kích thước dưới mức tối ưu (ví dụ: vài chục KB đến vài MB) do quá trình ghi theo lô nhỏ (micro-batches) hoặc dữ liệu luồng (streaming) tạo ra, giải nén chúng, gộp chúng lại trong bộ nhớ, và ghi ra thành các tệp tin lớn đạt kích thước chuẩn (thường từ 128MB đến 1GB tùy hệ thống).

Trong các hệ thống Table Formats hiện đại (Apache Hudi, Delta Lake, Apache Iceberg), Compaction còn đi kèm với việc dọn dẹp các bản ghi đã bị xóa (deletions) hoặc hợp nhất các nhật ký thay đổi (changelogs) vào các tệp cơ sở (base files).

---

## Why it exists: The Small Files Problem

Trong Data Engineering, việc ghi dữ liệu liên tục (streaming ingestion) với độ trễ thấp dẫn đến một tác dụng phụ nghiêm trọng gọi là **Small Files Problem (Vấn đề tệp tin nhỏ)**.

Nếu mỗi giây một hệ thống ghi ra một tệp JSON hoặc Parquet dung lượng 10KB lên S3, sau một tháng bạn sẽ có hàng triệu tệp. Điều này gây ra 3 thảm họa:
1. **Quá tải Listing (Liệt kê)**: Các hệ thống phân tán như Spark hay Presto cần liệt kê danh sách tệp trước khi đọc. Việc liệt kê hàng triệu tệp trên S3 mất rất nhiều thời gian (có thể mất hàng chục phút chỉ để bắt đầu câu lệnh SELECT).
2. **Quá tải File Opening (Mở tệp)**: Mở một kết nối mạng để đọc một file trên Cloud mất khoảng thời gian độ trễ cố định (latency overhead). Mở 1 triệu file 10KB tốn nhiều thời gian hơn hàng trăm lần so với mở 10 file 1GB.
3. **Mất khả năng nén (Compression ineffectiveness)**: Các thuật toán nén dạng cột như Snappy hay Zstd (dùng trong Parquet) hoạt động rất kém trên tập dữ liệu quá nhỏ vì không đủ mẫu để tối ưu hóa từ điển (dictionary).

Compaction ra đời như một "nhân viên dọn dẹp", đi theo sau các luồng ghi nhanh, gom các tệp vụn vặt này lại thành những khối (blocks) lớn gọn gàng.

---

## Core idea

Ý tưởng của Compaction là đánh đổi tài nguyên tính toán (CPU và I/O) chạy ngầm để lấy lại tốc độ đọc (Read performance) cực nhanh ở tầng phục vụ (Serving). 

Có hai chiến lược thực hiện Compaction phổ biến:
1. **Synchronous Compaction (Gom tệp đồng bộ)**: Engine cố gắng gộp tệp ngay tại thời điểm thực thi câu lệnh Ghi. Điều này làm chậm quá trình Ingestion nhưng đảm bảo dữ liệu luôn ở trạng thái tốt nhất. Thường được gọi là `OPTIMIZE` commands.
2. **Asynchronous Compaction (Gom tệp bất đồng bộ)**: Quy trình Ingestion cứ việc ghi file nhỏ nhanh nhất có thể (Write-heavy). Một luồng tính toán khác (hoặc một cụm máy chủ khác) sẽ chạy ở chế độ nền (background service), âm thầm đọc các file nhỏ và ghi thành file lớn mà không can thiệp vào luồng chính.

---

## How it works

Dưới đây là một chu kỳ hoạt động Compaction trong Apache Hudi (loại bảng Merge-on-Read):
1. **Ingestion**: Spark Streaming liên tục đẩy các thay đổi (Update/Insert) thành các tệp Avro log rất nhỏ (delta files) lên Data Lake. Cập nhật diễn ra tính bằng giây.
2. **Scheduling**: Tiến trình điều phối xác định rằng tổng kích thước các tệp log ở một phân vùng đã vượt quá ngưỡng (ví dụ 100MB) hoặc số lượng commits đã đạt tới cấu hình. Nó đánh dấu phân vùng này cần được Compaction.
3. **Execution**: Tiến trình Compaction lấy tệp Parquet gốc (Base file), đọc tất cả các tệp Avro log đi kèm để hợp nhất (merge) dữ liệu.
4. **Commit**: Nó ghi ra một tệp Parquet gốc phiên bản mới (Base file V2) có kích thước chuẩn ~256MB.
5. **Clean up**: Siêu dữ liệu cập nhật trỏ người đọc đến tệp V2. Các tệp Avro log nhỏ và Parquet V1 cũ sẽ bị dọn dẹp sau một thời gian (Vacuum/Clean).

---

## Architecture / Flow

```mermaid
graph TD
    subgraph Data Ingestion (Streaming/Micro-batch)
        Stream[Kafka Streams] --> WriteEngine[Spark/Flink]
        WriteEngine -->|Writes every 1 min| File1[File: 2MB]
        WriteEngine -->|Writes every 1 min| File2[File: 3MB]
        WriteEngine -->|Writes every 1 min| File3[File: 1.5MB]
        WriteEngine -->|Writes every 1 min| FileN[File: ... 2MB]
    end
    
    subgraph Background Compaction Service
        Compactor[Compaction Job]
        File1 --> Compactor
        File2 --> Compactor
        File3 --> Compactor
        FileN --> Compactor
    end
    
    subgraph Optimized Storage
        Compactor -->|Merges and Writes| OptFile[Optimized File: 128MB Parquet]
    end
    
    subgraph Query Execution
        Reader[Trino / Spark SQL] -->|Reads 1 big file<br/>Fast!| OptFile
        Reader -.->|Avoids reading 100 small files| File1
    end
```

---

## Practical example

Sử dụng lệnh `OPTIMIZE` trong Delta Lake (được xây dựng trên Spark) để thực hiện Compaction thủ công:

```sql
-- Gom tất cả các file dữ liệu nhỏ trong bảng thành các file lớn (thường mục tiêu là 1GB)
OPTIMIZE delta.`s3://bucket/events_table`;

-- Gom tệp kết hợp với kỹ thuật Z-Ordering (sắp xếp dữ liệu đa chiều) để tăng tốc độ quét cột
OPTIMIZE delta.`s3://bucket/events_table` ZORDER BY (customer_id, event_date);
```

Trong Apache Iceberg:
```java
// Sử dụng Java API để gọi tiến trình gom tệp nền
SparkActions
    .get()
    .rewriteDataFiles(table)
    .filter(Expressions.equal("date", "2026-06-07")) // Chỉ gom tệp ở một partition cụ thể
    .option("target-file-size-bytes", Long.toString(512 * 1024 * 1024)) // 512 MB
    .execute();
```

---

## Best practices

* **Thiết lập Target File Size hợp lý**: Kích thước tệp lý tưởng phụ thuộc vào Engine tính toán. Với HDFS truyền thống, thường là 128MB (để khớp với HDFS block size). Với hệ thống Cloud Object Storage và các Table Format hiện đại, từ 256MB đến 1GB là kích thước mang lại sự cân bằng tốt nhất giữa số lượng luồng tải xuống (parallel downloads) và băng thông mạng.
* **Tự động hóa theo lịch (Scheduled Cron)**: Hãy lên lịch chạy tiến trình Compaction vào những khung giờ thấp điểm (đêm khuya, cuối tuần) để tận dụng tài nguyên máy chủ rảnh rỗi và không tranh giành CPU với các ứng dụng tính toán ETL đang chạy ban ngày.
* **Chỉ Compaction các phân vùng "Nóng"**: Thay vì quét toàn bộ hệ thống lưu trữ petabytes, hãy thiết lập script chỉ gom tệp đối với các phân vùng (partitions) của vài ngày gần nhất, nơi dữ liệu mới thường xuyên ghi vào tạo ra file nhỏ. Dữ liệu của các tháng trước thường đã ổn định (cold data) và không cần gom lại.

---

## Common mistakes

* **Kích thước file target quá lớn (Quá mức cần thiết)**: Nếu ép hệ thống gom lại thành các tệp 5GB-10GB, bạn sẽ mất lợi thế đọc song song. Một con Spark Worker (với 1 core) sẽ phải tốn quá nhiều thời gian và memory bộ nhớ RAM để kéo và giải nén hết 10GB này, có thể gây ra lỗi OutOfMemory (OOM).
* **Compaction dữ liệu chưa định hình**: Chạy compaction mỗi 5 phút một lần. Hành động này vô tình biến Compaction thành tác nhân làm chậm hệ thống (Write Amplification) vì một bản ghi cứ bị viết đi viết lại qua nhiều lần gom tệp. Chỉ chạy khi số lượng file nhỏ đã đạt ngưỡng đáng kể.

---

## Trade-offs

### Ưu điểm
* Giải quyết triệt để sự cố "Small Files Problem".
* Giảm số lượng file đáng kể giúp Catalog (như Hive Metastore) hoạt động nhẹ nhàng hơn, thời gian lên kế hoạch truy vấn (query planning time) nhanh hơn.
* Tăng tốc độ đọc dữ liệu (Read-throughput) lên hàng chục lần do tối ưu hóa I/O và tính năng nén tệp.

### Nhược điểm
* **Tiêu tốn tài nguyên**: Tiến trình đọc file, sắp xếp lại (sorting) và ghi lại ra Parquet tốn một lượng CPU và Memory khá lớn.
* **Write Amplification (Khuếch đại tác vụ ghi)**: Dữ liệu được ghi ban đầu (từ source), sau đó lại được đọc ra và ghi lại một lần nữa vào một tệp lớn hơn. Việc này làm tăng lượng I/O tổng thể của ổ đĩa/mạng.

---

## When to use

* Bất kỳ kiến trúc Data Lake nào thu thập dữ liệu bằng luồng (Streaming Kafka, CDC) do tính chất tạo ra micro-batches với file siêu nhỏ.
* Khi thấy tốc độ các câu lệnh SQL tự nhiên bị chậm dần theo thời gian dù lượng dữ liệu tăng không đáng kể.
* Các bảng lưu trữ Event Logs, IoT data thu thập với tần suất cao.

## When not to use

* Các đường ống dẫn dữ liệu theo lô (Batch Processing) chạy mỗi ngày một lần (Daily ETL). Vì bản thân các job Batch nếu được cấu hình tốt số lượng Partitions (ví dụ `df.repartition()`) đã có khả năng ghi ra các file có dung lượng lý tưởng ngay từ lần ghi đầu tiên. Khi đó Compaction là thừa thãi.

---

## Related concepts

* [Data Lakehouse](/concepts/data-lakehouse)
* [Apache Hudi](/concepts/apache-hudi) (Table Format mạnh mẽ nhất về cơ chế Auto-Compaction)
* [Delta Lake](/concepts/delta-lake)
* [Data Ingestion](/concepts/data-ingestion)

---

## Interview questions

### 1. Tại sao "Small Files Problem" lại làm suy giảm hiệu năng của Hadoop HDFS nghiêm trọng hơn so với Amazon S3?
* **Người phỏng vấn muốn kiểm tra**: Kiến thức sâu về kiến trúc hệ thống tệp phân tán (HDFS NameNode).
* **Gợi ý trả lời (Strong Answer)**: 
  Trong HDFS, mọi siêu dữ liệu (metadata) của tệp tin, đường dẫn thư mục và vị trí Block đều được NameNode lưu trên RAM (Main Memory) để phục vụ tra cứu nhanh. Trung bình một file nhỏ (dù chỉ 10KB) cũng tiêu tốn khoảng 150 bytes trên RAM của NameNode. Nếu có 100 triệu file nhỏ, NameNode sẽ bị cạn kiệt RAM, dẫn đến làm sập toàn bộ cụm Hadoop, bất kể dung lượng đĩa cứng dưới DataNode còn trống bao nhiêu. Trên Amazon S3, S3 có kiến trúc Metadata phân tán siêu lớn nên không bị sập do RAM, nhưng người dùng sẽ chịu phạt bằng tốc độ listing cực chậm và bị S3 throttling (giới hạn request).

### 2. Sự khác biệt giữa Asynchronous Compaction và Synchronous Compaction (như OPTIMIZE). Khi nào nên dùng loại nào?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng vận hành, thiết kế luồng dữ liệu (Data Pipeline Architecture).
* **Gợi ý trả lời (Strong Answer)**:
  * *Synchronous Compaction*: Dữ liệu được gom lại trong chính tiến trình luồng chính đang chạy. Ưu điểm là dữ liệu luôn sạch sẽ, nhưng nhược điểm là nó làm nghẽn quá trình tải (Ingestion), không phù hợp cho các luồng streaming yêu cầu độ trễ thấp (low latency).
  * *Asynchronous Compaction*: Gom tệp được chạy dưới dạng một dịch vụ chạy nền độc lập hoàn toàn với Ingestion. Hệ thống Ingestion cứ ghi file nhỏ nhanh nhất có thể. Ưu điểm là tối đa hóa throughput ghi, không gây tắc nghẽn.
  * *Sử dụng*: Dùng Synchronous (như cuối pipeline Daily Batch chạy lệnh OPTIMIZE) cho các hệ thống tải theo ngày. Dùng Asynchronous (như cấu trúc Hudi MoR) cho các luồng dữ liệu thời gian thực (Real-time CDC/Streaming).

---

## References

1. **Databricks Documentation**: "Optimize performance with file management (Z-Ordering)".
2. **Apache Hudi Documentation**: "Compaction - Hudi Services" - Giải thích cơ chế gom tệp nền của Hudi.
3. **"Hadoop: The Definitive Guide"** - Tom White (Chương lý thuyết về NameNode Memory và Small Files Problem).

---

## English summary

Compaction is a crucial background maintenance process in Data Engineering designed to solve the "Small Files Problem." When data is ingested continuously via streaming or micro-batches, it creates millions of tiny files that severely degrade query performance due to metadata listing overhead, inefficient file opening times, and poor compression ratios. Compaction asynchronously (or synchronously via OPTIMIZE commands) reads these small files, merges them, and rewrites them into larger, optimally-sized blocks (e.g., 256MB - 1GB Parquet files). This drastically improves read performance and reduces metadata catalog pressure in modern Data Lakehouses.
