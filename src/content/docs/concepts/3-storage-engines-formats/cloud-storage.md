---
title: "Kiến trúc Cloud Object Storage (Amazon S3) dưới góc nhìn Hệ thống"
difficulty: "Intermediate"
tags: ["cloud-storage", "object-storage", "aws-s3", "gcs", "data-lake", "architecture"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Kiến trúc Cloud Object Storage: Amazon S3 Internals, HDFS vs S3"
metaDescription: "Phân tích chuyên sâu về kiến trúc Cloud Object Storage: S3 Internals, Erasure Coding, Strong Consistency, và cách giải quyết bài toán Small Files trong Data Lake."
---

Cloud Object Storage (Amazon S3, GCS, Azure Blob) đã trở thành "trái tim" của Modern Data Stack, thay thế hoàn toàn kiến trúc HDFS nguyên thủy. Tuy nhiên, đằng sau giao diện API RESTful đơn giản là những hệ thống phân tán khổng lồ với hàng trăm microservices xử lý hàng chục triệu request mỗi giây. 

Bài viết này mổ xẻ **Cloud Object Storage** dưới góc độ kỹ thuật hệ thống (System Architecture), tập trung vào thiết kế bên trong (Internals) của S3, cơ chế đánh đổi (Trade-offs), và các sự cố vận hành (Operational Incidents) thực tế.

---

## 1. Kiến trúc phân tách Metadata và Payload (S3 Internals)

Không giống như File System (POSIX) cấp phát ổ đĩa qua các Block, Object Storage là một không gian phẳng (flat namespace). Dưới nền tảng vật lý, một hệ thống như Amazon S3 phân tách hoàn toàn việc lưu trữ **Metadata (Siêu dữ liệu)** và **Payload (Dữ liệu thực tế)** thành hai hệ thống con độc lập.

```mermaid
architecture-beta
    group api("cloud")[API & Routing Layer]
    group meta("database")[Metadata Fleet]
    group data("server")[Storage Fleet]

    service client("internet")[Client / Spark]
    service lb("api")[Load Balancer / Gateway] in api
    service index("database")[Distributed Key-Value Store] in meta
    service disk1("disk")[HDD/SSD Node 1] in data
    service disk2("disk")[HDD/SSD Node 2] in data
    service disk3("disk")[HDD/SSD Node 3] in data

    client:R --> L:lb
    lb:B --> T:index
    lb:B --> T:disk1
    lb:B --> T:disk2
    lb:B --> T:disk3
```

- **Metadata Fleet:** Lưu trữ ánh xạ (mapping) giữa `Object Key` (ví dụ: `s3://bucket/data.parquet`) và vị trí vật lý của nó trên các Data Nodes. Nó thường là một Distributed Key-Value Store cực kỳ tốc độ cao.
- **Storage Fleet:** Lưu trữ bản thân các byte dữ liệu. Do các file Big Data thường rất lớn, payload được ghi trực tiếp xuống Storage Fleet thành các chunk nhỏ mà không qua Metadata Fleet để tránh nghẽn cổ chai (bottleneck).

### 1.1. Erasure Coding: Đạt 11 số 9 (119s) Độ bền mà không tốn kém
Nếu dùng chuẩn HDFS cũ (Replication Factor = 3), một file 1TB sẽ tiêu tốn 3TB dung lượng đĩa vật lý (overhead 200%). Đối với quy mô Exabytes của S3, việc này là quá đắt đỏ.

Thay vào đó, S3 và GCS sử dụng thuật toán **Erasure Coding** (thường là biến thể của Reed-Solomon).
- Dữ liệu được chia thành $k$ phần (Data chunks).
- Hệ thống tính toán thêm $m$ phần (Parity chunks).
- Tổng cộng $n = k + m$ chunks được phân tán ra nhiều Availability Zones (AZs).

**Trade-off:**
- **Được (Pros):** Độ bền đạt 99.999999999% (11 số 9) trong khi Storage Overhead chỉ khoảng 20-50% (thay vì 200%). Chịu được $m$ ổ cứng hoặc cả 1 AZ chết cùng lúc.
- **Mất (Cons):** Tốn CPU (Compute-intensive) để mã hóa/giải mã và khôi phục dữ liệu. Khi đọc dữ liệu, nếu một mảnh bị lỗi, hệ thống phải đọc các mảnh khác qua mạng (Network I/O) và dùng CPU để suy luận (reconstruct) lại mảnh bị hỏng $\rightarrow$ Tăng Latency.

---

## 2. Bài toán "Strong Consistency" trên S3

Trước tháng 12/2020, Amazon S3 chỉ đảm bảo **Eventual Consistency** (Nhất quán cuối) cho các thao tác ghi đè (PUT/DELETE). 
**Hậu quả cũ:** Một Spark Job ghi đè file `part-0001.parquet`, ngay sau đó một Job khác vào đọc (GET) có thể vẫn thấy nội dung cũ, hoặc LIST thư mục chưa thấy file mới. Các kỹ sư phải dùng các công cụ vá lỗi như `S3Guard` (dùng DynamoDB làm Metadata layer phụ) để đảm bảo tính nhất quán.

Từ cuối 2020, S3 chính thức hỗ trợ **Strong Read-After-Write Consistency** (Nhất quán mạnh) mà không tăng giá hay giảm hiệu suất.
Để làm được điều này, hệ thống Metadata của S3 phải triển khai các thuật toán đồng thuận (Consensus Protocols) như **Paxos/Raft** kết hợp với các cơ chế Witness node và Time synchronization cực kỳ phức tạp để đảm bảo mọi node trong Metadata Fleet đều đồng ý với phiên bản mới nhất của Object trước khi trả về HTTP `200 OK`.

---

## 3. Tại sao S3 đánh bại HDFS? (Decoupling Compute & Storage)

Hadoop (HDFS) sử dụng kiến trúc **Coupled Compute & Storage** (Tính toán và Lưu trữ gắn liền trên cùng một máy chủ vật lý / DataNode).
- Nếu CPU hết công suất (Cần thêm Compute để chạy Spark), bạn phải mua thêm máy chủ chứa cả Ổ cứng.
- Nếu Hết dung lượng (Cần thêm Storage), bạn phải mua thêm máy chủ chứa cả CPU.
$\rightarrow$ Lãng phí tài nguyên khủng khiếp.

Kiến trúc hiện đại (Modern Data Stack) sử dụng S3 làm trung tâm, tạo ra sự **Tách biệt (Separation of Compute and Storage)**:

```mermaid
graph TD
    subgraph Compute Layer["Compute Engines("Ephemeral")"]
        A("Spark Cluster")
        B("Trino / Presto")
        C("Snowflake Warehouse")
    end
    
    subgraph Storage Layer["Cloud Object Storage("Persistent")"]
        D["(Amazon S3 / GCS)"]
    end
    
    A -- Network I/O("100Gbps") --> D
    B -- Network I/O("100Gbps") --> D
    C -- Network I/O("100Gbps") --> D
```

**Systemic Trade-offs:**
- S3/GCS có thể mở rộng lên Exabytes vô hạn với giá rất rẻ. Các cluster Compute chỉ bật lên khi query, chạy xong thì tự hủy (Ephemeral), tiết kiệm tiền.
- **Điểm yếu chí mạng:** Dữ liệu phải đi qua mạng lưới (Network Shuffle) thay vì Data Locality (đọc thẳng từ đĩa local như HDFS). Nếu hệ thống mạng VPC không đủ băng thông, hoặc file quá lớn, Compute node có thể bị **OOMKilled (Out of Memory)** khi cố kéo dữ liệu từ S3 về RAM.

---

## 4. Rủi ro Vận hành & Troubleshooting thực chiến

### 4.1. Sự cố thắt cổ chai: The Small Files Problem
Một trong những nguyên nhân phổ biến nhất gây sập pipeline dữ liệu trên S3 là **Vấn đề tập tin nhỏ (Small Files Problem)**.
S3 có giới hạn (Hard Limit) về số lượng I/O mỗi giây (IOPS) dựa trên tiền tố thư mục (Prefix): **3,500 PUT/COPY/POST/DELETE** và **5,500 GET/HEAD** requests mỗi giây trên một prefix.

Nếu hệ thống streaming (như Kafka Connect hoặc Flink) ghi liên tục hàng triệu file JSON kích thước vài KB vào cùng một thư mục `s3://datalake/logs/year=2023/month=10/day=01/`:
1. Metadata Fleet của S3 bị quá tải request.
2. Trả về mã lỗi **HTTP 503 Slow Down (Throttling)**.
3. Các Spark/Trino queries bị chậm gấp 100 lần vì phải mở hàng triệu HTTP connection để GET từng file nhỏ (Network Overhead & Latency).

**Giải pháp khắc phục:**
1. **File Compaction:** Dùng Spark chạy job định kỳ gộp (compact) các file nhỏ thành các file từ `128MB - 512MB` (kích thước tối ưu cho Parquet/ORC).
2. **Entropy Injection (Random Prefix):** Rải đều dữ liệu ra nhiều prefix vật lý bằng cách băm (hash) khóa phân vùng để lách luật giới hạn 5500 requests/s của AWS S3.

*Minh họa dùng Delta Lake (OPTIMIZE) để giải quyết Small files:*
```sql
-- Chạy lệnh này trên Databricks / Spark SQL để tự động gộp file nhỏ (Z-Ordering)
OPTIMIZE events_table 
ZORDER BY (event_type, user_id);
```

### 4.2. Khắc phục OOMKilled khi đọc từ S3
Object Storage là read-only (Immutable). Khi chạy câu lệnh `SELECT * FROM table WHERE user_id = 123`, nếu không cẩn thận, Spark sẽ kéo toàn bộ file Parquet 1GB qua mạng về Node, giải nén vào RAM gây tràn bộ nhớ (Spill-to-disk hoặc JVM OOMKilled).

**Cơ chế phòng thủ (Pushdown Predicates & Byte-Range Fetch):**
Các định dạng Columnar (Parquet) có lưu min/max metadata ở cuối file. Khi dùng Spark đọc S3, Spark sẽ gửi HTTP `GET Range: bytes=...` để chỉ kéo phần Footer của Parquet về trước. Nếu `user_id = 123` không nằm trong khoảng min/max của Row Group đó, Spark sẽ bỏ qua (Skip) không kéo data block đó về mạng nữa.

*Cấu hình Terraform chuẩn bị một S3 Bucket cho Data Lake an toàn:*
```hcl
resource "aws_s3_bucket" "data_lake" {
  bucket = "company-data-lake-prod"
}

# Ngăn chặn xóa nhầm, bắt buộc lưu Version
resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.data_lake.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Tự động đẩy file cũ sang lớp rẻ hơn để tối ưu FinOps
resource "aws_s3_bucket_lifecycle_configuration" "tiering" {
  bucket = aws_s3_bucket.data_lake.id

  rule {
    id     = "archive-cold-data"
    status = "Enabled"
    filter {
      prefix = "raw_layer/"
    }
    transition {
      days          = 90
      storage_class = "STANDARD_IA" # Tiết kiệm 40% chi phí
    }
    transition {
      days          = 365
      storage_class = "GLACIER"     # Cold storage
    }
  }
}
```

---

## 5. ACID Transaction trên Không gian Phẳng
Nhược điểm lớn nhất của S3 là **Immutable (Bất biến)**. Bạn không thể ghi đè (Update) một dòng trong file CSV. Bạn phải tải về, sửa, và upload đè lại file CSV. Điều này làm cho việc chạy lệnh `UPDATE` hay `DELETE` trên Data Lake trở thành ác mộng.

**Giải pháp (Open Table Formats):** 
Kiến trúc Data Lakehouse sử dụng **Apache Iceberg**, **Delta Lake**, hoặc **Apache Hudi** làm lớp Transaction Layer phía trên S3.
Thay vì sửa file cũ, các công cụ này sẽ ghi ra file Parquet mới chứa dữ liệu đã update, và cập nhật một file log (Metadata JSON file) báo cho hệ thống biết "Hãy lờ file cũ đi, đọc file mới này". Mọi thao tác này đảm bảo tính ACID, giúp biến S3 phẳng phiu thành một Data Warehouse thực thụ.

---

## Nguồn Tham Khảo
- [Amazon S3 Strong Read-After-Write Consistency](https://aws.amazon.com/s3/consistency/) - AWS Official Documentation
- [Amazon S3 Performance Guidelines (Prefix partitioning & IOPS limits)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html)
- *Designing Data-Intensive Applications (Chapter 3: Storage and Retrieval)* - Martin Kleppmann
- [The Small Files Problem in Data Lakes](https://delta.io/blog/2023-01-25-delta-lake-small-file-problem/) - Delta.io Engineering Blog
- [Erasure Coding in Distributed Storage Systems](https://www.usenix.org/system/files/conference/atc12/atc12-final181.pdf) - USENIX Papers
