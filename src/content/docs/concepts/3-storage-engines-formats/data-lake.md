---
title: "Hồ dữ liệu - Data Lake"
difficulty: "Intermediate"
tags: ["data-lake", "s3", "hdfs", "small-file-problem", "parquet", "system-design"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Kiến trúc Data Lake: Trade-offs, Sự cố Vận hành và Tối ưu Chi phí"
metaDescription: "Đi sâu vào kiến trúc vật lý của Data Lake (S3/HDFS), phân tích sự cố Small File Problem, Partitioning Bottlenecks và các kỹ thuật FinOps cho Data Engineer."
description: "Phân tích kiến trúc hệ thống của Data Lake dưới góc nhìn Kỹ thuật Dữ liệu (Data Engineering). Bài viết mổ xẻ cơ chế lưu trữ vật lý, bài toán nghẽn cổ chai I/O, sự cố Small File, và các Trade-offs khi thiết kế Data Lake trên Cloud Object Storage."
---

Data Lake không đơn thuần là một "cái kho" ném mọi thứ vào. Dưới góc độ System Design, Data Lake là một hệ thống lưu trữ phân tán (Distributed Storage) tách rời hoàn toàn với tầng tính toán (Compute), tận dụng tối đa Object Storage để đạt khả năng mở rộng vô hạn với chi phí thấp nhất. 

Bài viết này sẽ bỏ qua các định nghĩa cơ bản, đi thẳng vào kiến trúc thực thi vật lý, các rủi ro vận hành (Operational Risks) và sự đánh đổi (Trade-offs) khi triển khai Data Lake ở quy mô Enterprise.

## 1. Kiến trúc Thực thi Vật lý (Physical Execution)

### 1.1. Tách biệt Compute và Storage (Decoupled Architecture)
Sự khác biệt cốt lõi của Data Lake trên Cloud so với hệ sinh thái Hadoop truyền thống nằm ở việc tách rời Disk và CPU.

- **Hadoop (HDFS):** Data Node chứa cả ổ cứng lưu dữ liệu và CPU/RAM để chạy các task MapReduce/Spark. Gắn chặt (Coupled) Compute và Storage khiến việc scale hệ thống gặp khó khăn (bạn không thể chỉ mua thêm đĩa cứng mà không mua thêm CPU).
- **Cloud Data Lake (S3, GCS, ADLS):** Dữ liệu nằm hoàn toàn trên Object Storage. Compute cluster (Spark, Presto, Trino) là các cluster Stateless (không trạng thái). Bạn có thể bật/tắt Compute bất cứ lúc nào, trong khi dữ liệu vẫn nằm an toàn trên S3.

**Sơ đồ Kiến trúc Data Lake (Medallion Architecture)**

```mermaid
graph LR
    subgraph Data Sources
        DB["(OLTP DB)"]
        Kafka["Kafka Stream"]
        API["3rd Party APIs"]
    end

    subgraph "Cloud Object Storage("S3 / GCS")"
        Bronze["("Bronze Zone\n("Raw JSON/CSV")")"]
        Silver["("Silver Zone\n("Cleansed Parquet")")"]
        Gold["("Gold Zone\n("Aggregated/Business")")"]
        
        Bronze -- "Spark/Flink("Cleanse")" --> Silver
        Silver -- "Spark/Trino("Aggregate")" --> Gold
    end

    subgraph "Compute & Serving"
        Trino["Trino/Presto"]
        BI["BI Dashboards"]
        ML["ML Models"]
    end

    DB -->|"DMS/Debezium"| Bronze
    Kafka -->|"Kafka Connect"| Bronze
    API -->|"Airflow/Python"| Bronze

    Gold --> Trino
    Trino --> BI
    Gold --> ML
```

### 1.2. Object Storage không phải là File System
S3 hoặc GCS không có khái niệm thư mục (Directory). Đường dẫn `s3://my-lake/year=2026/month=06/data.parquet` bản chất chỉ là một key duy nhất (Key-Value store). 
**Trade-off:**
- **Ưu điểm:** Scale out không giới hạn, không bị nghẽn ở metadata server (như NameNode trong HDFS).
- **Nhược điểm:** Phép toán `RENAME` hoặc `MOVE` một thư mục thực chất là thao tác `COPY` toàn bộ file và `DELETE` file cũ, tốn cực nhiều thời gian và chi phí I/O. Lên ý tưởng schema, nếu nhầm lẫn cấu trúc partition, việc sửa đổi sẽ rất khó khăn.

## 2. Rủi ro Vận hành (Operational Risks) & Khắc phục

### 2.1. Sự cố Tệp Nhỏ (The Small File Problem)
Khi hệ thống Ingestion (như Kafka hoặc Kinesis) liên tục xả dữ liệu xuống S3 mỗi vài giây, nó tạo ra hàng triệu file Parquet/JSON có kích thước siêu nhỏ (vài KB).

**Hệ lụy hệ thống (Incident):**
1. **Metadata Overhead:** Spark Driver bị cạn kiệt bộ nhớ (OOMKilled) chỉ vì cố gắng `list` hàng triệu file trên Data Lake.
2. **I/O Bottleneck:** Thời gian mở/đóng kết nối HTTP (để đọc S3) lớn hơn gấp nhiều lần thời gian thực sự đọc dữ liệu.
3. **S3 API Rate Limits:** Vượt quá giới hạn 5,500 GET/HEAD requests mỗi giây trên một prefix của S3, gây ra lỗi `503 Slow Down`.

**Cách khắc phục (Compaction & Auto-Optimize):**
Trong Databricks hoặc Spark, cần lên lịch gom cụm (Compaction) định kỳ hoặc bật tính năng Auto Optimize:

```python
# Cấu hình Spark (Databricks) để tự động gộp file nhỏ khi ghi
spark.conf.set("spark.databricks.delta.optimizeWrite.enabled", "true")
spark.conf.set("spark.databricks.delta.autoCompact.enabled", "true")
```

Với Delta Lake, bạn có thể chạy lệnh `OPTIMIZE` kết hợp Z-Ordering để nhóm các dữ liệu thường xuyên được filter lại gần nhau:
```sql
-- Gộp các file nhỏ thành các file lớn (~1GB)
-- Z-ORDER giúp tối ưu hóa Data Skipping khi truy vấn
OPTIMIZE events_silver ZORDER BY (user_id, event_type);
```

### 2.2. Over-Partitioning & Cartesian Explosion
Phân vùng (Partitioning) bằng cách tạo các thư mục như `year=../month=../day=..` giúp giảm lượng dữ liệu bị quét (Partition Pruning). Tuy nhiên, nếu bạn partition theo một cột có quá nhiều cardinality (ví dụ: `customer_id` với hàng triệu user), hệ thống sẽ sụp đổ.

**Sự cố:** Thay vì đọc một file 1GB, Spark phải quét qua 1 triệu prefix S3, mỗi prefix chứa 1 file 1KB. S3 API sẽ phản hồi cực chậm và Driver có nguy cơ sập.

**Best Practice:**
- Kích thước lý tưởng của một file Parquet là 128MB - 1GB.
- Chỉ Partition theo những trường có độ biến thiên thấp (Low Cardinality) như Ngày (Date), Tháng (Month), hoặc Quốc gia (Country).

### 2.3. Data Swamp (Đầm lầy dữ liệu)
Schema-on-Read mang lại sự linh hoạt ở tầng Write, nhưng đẩy toàn bộ gánh nặng về tầng Read. Thiếu quản trị Metadata (Data Catalog) sẽ biến Data Lake thành bãi rác (Data Swamp). 

**Giải pháp:** Bắt buộc phải gắn Glue Data Catalog hoặc Hive Metastore. Sử dụng Terraform để cấp quyền (IAM/Lake Formation) chặt chẽ cho từng Zone.

## 3. Tối ưu Chi phí (FinOps) trong Data Lake

Chi phí lưu trữ có thể bùng nổ nếu giữ mọi thứ ở cấp độ Standard Storage. Một Data Engineer giỏi phải thiết kế **Lifecycle Policies** ngay từ cấp độ Infrastructure as Code (IaC).

**Terraform Code - S3 Lifecycle Policy:**
Đoạn code cấu hình vòng đời dữ liệu, tự động đẩy data ít dùng (Cold Data) xuống Storage Class rẻ hơn để cắt giảm chi phí.

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "lake_lifecycle" {
  bucket = aws_s3_bucket.data_lake_raw.id

  rule {
    id     = "archive_raw_data_after_30_days"
    status = "Enabled"

    filter {
      prefix = "raw_events/"
    }

    # Đẩy xuống S3 Standard-IA sau 30 ngày (rẻ hơn cho dữ liệu ít đọc)
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    # Đẩy xuống Glacier (Cold storage) sau 90 ngày
    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    # Xóa hoàn toàn sau 1 năm (Data Retention)
    expiration {
      days = 365
    }
  }
}
```

## 4. Tổng kết Trade-offs

| Quyết định Kiến trúc | Bạn nhận được (Pros) | Bạn đánh đổi (Cons/Risks) |
|----------------------|----------------------|---------------------------|
| **Tách rời Compute & Storage** | Scale tính toán và lưu trữ độc lập, giảm chi phí nhàn rỗi. | Tăng Latency qua mạng (Network I/O) khi Compute đọc S3. |
| **Schema-on-Read** | Ingestion cực nhanh, không lo lỗi ETL làm nghẽn pipeline. | Áp lực lên hệ thống Read, rủi ro Data Swamp nếu thiếu Data Catalog. |
| **Ghi Real-time xuống S3** | Dữ liệu tươi mới (Freshness) cho downstream. | Small File Problem, tốn chi phí gọi API PUT của S3, cần Compaction định kỳ. |

## 5. Sự Tiến Hóa: Data Lakehouse
Để giải quyết những hạn chế của Data Lake (không có ACID transactions, không xử lý tốt update/delete như UPSERT, CDC), các định dạng bảng mở (Open Table Formats) như **Apache Iceberg**, **Delta Lake**, và **Apache Hudi** đã ra đời. Chúng là lớp metadata (metadata layer) nằm giữa Object Storage và Compute Engine, biến Data Lake thành Data Lakehouse - hỗ trợ ACID mà vẫn giữ được tính linh hoạt.

## Nguồn Tham Khảo
- [AWS Architecture Blog: Data Lakes and Analytics](https://aws.amazon.com/blogs/architecture/)
- [Databricks: The Small File Problem and How to Fix It](https://docs.databricks.com/en/optimizations/auto-optimize.html)
- [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
- *Designing Data-Intensive Applications* - Martin Kleppmann (Phần Batch Processing & HDFS).
