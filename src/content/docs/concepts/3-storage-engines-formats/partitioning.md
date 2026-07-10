---
title: "Phân vùng Dữ liệu (Partitioning) - Từ Hive-style đến Liquid Clustering"
domains: ["DE", "Platform"]
level: "Middle"
difficulty: "Advanced"
tags: ["partitioning", "performance", "data-warehouse", "big-data", "iceberg", "spark", "data-skew"]
readingTime: "25 mins"
lastUpdated: 2026-06-29
seoTitle: "Kiến trúc Phân vùng dữ liệu (Partitioning) và Các Rủi ro Vận hành"
metaDescription: "Tìm hiểu kiến trúc thực thi vật lý của Data Partitioning. Phân tích OOMKilled, Data Skew, Salting, Small Files Problem và sự tiến hóa lên Iceberg Hidden Partitioning, Databricks Liquid Clustering."
description: "Khi hệ thống phình to lên Petabytes, lệnh quét bảng không chỉ chậm mà có thể đánh sập cả cụm Cluster do tràn RAM. Partitioning là chốt chặn đầu tiên về I/O, nhưng thiết kế sai lầm sẽ dẫn đến thảm họa Data Skew."
---

Khi xử lý các tập dữ liệu ở quy mô hàng chục Terabyte hoặc Petabyte, việc quét toàn bộ (Full Table Scan) không chỉ tiêu tốn tài nguyên I/O, CPU, RAM mà còn dẫn đến nguy cơ sập Cluster (OOMKilled) hoặc tắc nghẽn mạng do Xáo trộn dữ liệu (Network Shuffle). **Partitioning (Phân vùng)** là chốt chặn đầu tiên và cơ bản nhất để tối ưu hóa I/O bằng cách giới hạn phạm vi dữ liệu cần đọc, hay còn gọi là **Partition Pruning** (Cắt tỉa phân vùng).

Tuy nhiên, các Junior Data Engineer thường mắc kẹt ở khái niệm "chia nhỏ dữ liệu theo thư mục". Dưới góc nhìn của một Kỹ sư Hệ thống (Staff Engineer), Partitioning đòi hỏi sự đánh đổi khốc liệt giữa tốc độ đọc (Read Path) và chi phí bảo trì (Write Path).

---

## 1. Kiến trúc Thực thi Vật lý (Physical Execution)

Trong môi trường điện toán phân tán (Spark, Trino) và lưu trữ Object Storage (S3, GCS) hoặc HDFS, Partitioning không phải là một tính năng "ảo" của Database, mà nó phản ánh trực tiếp **Layout vật lý** trên ổ cứng.

### 1.1. The Legacy: Hive-style Partitioning (Phân vùng kiểu cũ)

Trong kỷ nguyên Hadoop/Hive, Partitioning đồng nghĩa với việc tạo ra cấu trúc thư mục lồng nhau dạng `key=value`.

```mermaid
graph TD
    A["s3://datalake/orders/"] --> B["year=2026/"]
    A --> C["year=2027/"]
    C --> D["month=01/"]
    C --> E["month=02/"]
    D --> F["part-0001.parquet"]
    D --> G["part-0002.parquet"]
    E --> H["part-0001.parquet"]
```

**Cơ chế hoạt động:**
Khi Engine nhận câu lệnh `SELECT * FROM orders WHERE year=2027 AND month=01`, nó sẽ gọi tới **Metastore** (thường là HMS - Hive Metastore). Metastore trả về danh sách URI S3 cụ thể của thư mục đó. Quá trình này giúp Engine bỏ qua việc gọi API S3 `LIST` đắt đỏ trên thư mục `year=2026`. Đây gọi là **Static Partition Pruning** (Cắt tỉa tĩnh).

**Trade-off (Đánh đổi hệ thống):**
- **Sự ràng buộc tĩnh (Static Coupling):** Nếu bạn lưu theo `year/month/day`, nhưng User muốn Query theo `customer_id`, hệ thống bắt buộc phải **Full Table Scan**.
- **Thắt cổ chai ở Metastore:** Việc lưu Metadata của hàng triệu thư mục làm phình to HMS (MySQL/Postgres base) và gây chậm trễ nghiêm trọng khi lập kế hoạch truy vấn (Query Planning Phase).
- **Gánh nặng cho User:** User phải biết chính xác cột Partition vật lý (Ví dụ cột `year`) để thêm vào WHERE clause. Nếu họ chỉ filter theo `created_at` (cột timestamp gốc), Hive sẽ không nhận diện được và quét toàn bộ hệ thống.

### 1.2. Kỷ nguyên Hiện đại: Hidden Partitioning (Apache Iceberg)

Thay vì dựa vào thư mục vật lý, các định dạng Data Lakehouse hiện đại (Iceberg, Delta Lake) sử dụng **Cây siêu dữ liệu (Metadata Tree)** để theo dõi phân vùng, kết hợp với Metadata thống kê cấp độ file (Min/Max/Count/Nulls).

Iceberg giới thiệu một triết lý thiết kế mang tính cách mạng: **Hidden Partitioning (Phân vùng ẩn)**. Bạn lưu trường Timestamp `created_at` ở file vật lý, nhưng định nghĩa quy tắc Partitioning là `day(created_at)`. 

```sql
-- Ví dụ tạo bảng Iceberg phân vùng ẩn theo tháng trên Athena/Trino
CREATE TABLE datalake.orders (
    order_id BIGINT,
    customer_id VARCHAR,
    amount DECIMAL(10, 2),
    created_at TIMESTAMP
)
PARTITIONED BY (month(created_at)) -- Khai báo Transform Function, KHÔNG PHẢI tạo cột mới
WITH (
    format = 'PARQUET',
    write_compression = 'ZSTD'
);
```

**Cơ chế hoạt động:**
- Khi User Query: `WHERE created_at BETWEEN '2026-01-01' AND '2026-01-31'`.
- Iceberg Engine tự động hiểu rằng nó cần trích xuất hàm `month()` từ điều kiện WHERE, và thực hiện **Partition Pruning** tự động mà không bắt User phải gõ `WHERE year = 2026 AND month = 1`. 
- Data Engineer không phải tạo thêm các cột ảo (Virtual columns) như `created_day`, `created_month` bên trong file Parquet, giúp tiết kiệm dung lượng lưu trữ (Space Amplification).

---

## 2. Các Chiến lược Phân vùng Phức tạp

### 2.1. Range Partitioning (Phân vùng theo khoảng)
Tuyệt đại đa số Data Warehouse dùng Range Partitioning dựa trên trục thời gian (`event_date`, `created_at`). Nó hoàn hảo cho các Query có tính chất Time-series.

### 2.2. Hash Partitioning (Bucketing / Phân xô)
Khi cần JOIN hai bảng khổng lồ (ví dụ: bảng `users` 100GB và `transactions` 1TB), việc thực hiện Hash Join thông thường sẽ kích hoạt **Network Shuffle** toàn cụm để gom cùng `customer_id` về một Node. Việc xáo trộn 1TB dữ liệu qua mạng TCP/IP là nguyên nhân chính gây tràn RAM (Spill-to-disk) và làm sập Cluster.

Bằng cách dùng **Bucketing** (Hash Partitioning), ta ép hệ thống chia file vật lý dựa trên hàm Hash của `customer_id` ngay từ lúc ghi (Write-time). 

```python
# Spark DataFrame API: Phân vùng kết hợp Range (Date) và Hash (Bucketing)
(df.write
   .partitionBy("event_date")
   .bucketBy(64, "customer_id") # Chia đều data vào 64 buckets
   .sortBy("customer_id")       # Sort trong mỗi bucket để chuẩn bị cho Sort-Merge Join
   .format("parquet")
   .saveAsTable("optimized_transactions"))
```

Khi JOIN hai bảng đã được Bucket cùng một hàm Hash và cùng số lượng Bucket, Spark sẽ đọc thẳng các Bucket tương ứng và thực hiện JOIN cục bộ trên từng Node mà **KHÔNG CẦN NETWORK SHUFFLE** (Đây gọi là *Colocated Join*).

---

## 3. Rủi ro Vận hành (Operational Risks) & Khắc phục

Partitioning là con dao hai lưỡi. Thiết kế sai lầm có thể giết chết hệ thống.

### 3.1. Thảm họa Data Skew (Lệch Dữ liệu)

**Triệu chứng:** Một Spark Job chạy 99% rất nhanh, nhưng 1% Task cuối cùng bị treo hàng giờ, sau đó ném lỗi `Executor OOMKilled`. Toàn bộ Job thất bại và chạy lại từ đầu.

**Nguyên nhân gốc:** Khi phân vùng hoặc `GROUP BY` theo một cột có phân phối luật Pareto (ví dụ: `country_code` trong đó Việt Nam chiếm 95% Volume traffic). Một Worker Node (Executor) bất hạnh sẽ phải gánh lượng dữ liệu khổng lồ của Việt Nam vào trong RAM của nó, trong khi các Node khác rảnh rỗi chờ đợi (Straggler Node). Node bị nhồi nhét sẽ cạn kiệt Heap Memory và bị Linux Kernel bắn bỏ (OOM).

**Cách khắc phục:**
1.  **Salting Technique (Thêm muối):** Kỹ thuật kinh điển. Thêm một số ngẫu nhiên (Salt) vào Partition Key để "đánh tơi" dữ liệu ra nhiều Node, sau đó gom lại ở bước thứ hai.
    ```sql
    -- Thay vì Group By country_code trực tiếp gây Skew
    -- Bước 1: Thêm Salt (0-9) để chia đều tải ra 10 Workers tính toán cục bộ
    WITH salted_data AS (
        SELECT 
            CONCAT(country_code, '_', CAST(RAND() * 10 AS INT)) as salted_key,
            revenue
        FROM transactions
    ),
    -- Bước 2: Gom lại để tính tổng cuối cùng
    local_agg AS (
        SELECT salted_key, SUM(revenue) as partial_rev FROM salted_data GROUP BY salted_key
    )
    SELECT SUBSTRING(salted_key, 1, 2) as country_code, SUM(partial_rev) 
    FROM local_agg GROUP BY 1;
    ```
2.  **Kích hoạt AQE (Adaptive Query Execution):** Trên Spark 3.0+, AQE có tính năng `Skew Join`. Khi phát hiện một Partition quá bự lúc Shuffle, Spark sẽ tự động xé nhỏ (Split) Partition đó thành nhiều phần để các Task khác cùng chia sẻ gánh nặng.
    ```properties
    # Bật tính năng chống Skew tự động trong cấu hình Spark
    spark.sql.adaptive.enabled=true
    spark.sql.adaptive.skewJoin.enabled=true
    spark.sql.adaptive.skewJoin.skewedPartitionFactor=5
    ```

### 3.2. Thảm họa "Small Files Problem" [Vấn đề File Nhỏ]

**Triệu chứng:** Query load 10GB dữ liệu lại tốn thời gian hơn Query 100GB dữ liệu. S3 trả về lỗi `503 Slow Down` do thắt cổ chai API. Hadoop NameNode báo động đỏ do cạn RAM.

**Nguyên nhân (Over-partitioning):** Data Engineer quyết định phân vùng theo mức độ siêu nhỏ: `year/month/day/hour` và thêm cột phân loại `status`. Hậu quả là sinh ra hàng triệu thư mục, mỗi thư mục chỉ chứa 1 file Parquet nặng vài KB. Khi quét dữ liệu, chi phí Network I/O để mở (Open file) và lấy siêu dữ liệu (Metadata Fetch) còn lớn hơn hàng chục lần so với việc tải khối dữ liệu thô.

**Quy tắc ngón tay cái (FinOps & Arch):**
- File Parquet hoạt động hiệu quả nhất ở dung lượng từ **128MB - 512MB** (Tối đa 1GB).
- Bắt buộc phải gom file định kỳ (Compaction) để dọn dẹp các file nhỏ bằng tiến trình chạy ngầm vào ban đêm.
    ```sql
    -- Gom các file nhỏ thành file 512MB bằng Iceberg (Hạn chế Network HTTP Calls)
    CALL catalog.system.rewrite_data_files(
        table => 'datalake.orders',
        options => map('target-file-size-bytes', '536870912')
    );
    ```

---

## 4. Kỷ nguyên mới: Liquid Clustering (Định tuyến Động)

Rào cản lớn nhất của Partitioning là **Tính cứng nhắc (Static)**. Dữ liệu chỉ được xếp theo 1 chiều (ví dụ: Thời gian). Nếu ta Query theo ID, hệ thống vẫn phải Scan diện rộng (Full Scan trên các thư mục Date). Hơn nữa, khi Data Model thay đổi, việc đổi Partition Key đồng nghĩa với việc Rewrite lại toàn bộ Petabyte dữ liệu (Nỗi ác mộng Migration).

Databricks giới thiệu **Liquid Clustering** để thay thế hoàn toàn Partitioning truyền thống.

Kỹ thuật này sử dụng đường cong Z-Order (Z-Order Curve) kết hợp với thuật toán gom cụm động (Dynamic Layout) để:
1. **Đa chiều (Multi-dimensional):** Ánh xạ nhiều cột (ví dụ `event_date` và `customer_id`) vào chung một không gian vật lý. Query theo Date cũng nhanh, mà Query theo Customer ID cũng cực nhanh.
2. **Auto-tuning:** Tự động phân bổ lại Layout dựa trên Query Pattern nền mà không cần can thiệp thủ công.
3. **High Concurrency:** Bằng việc gỡ bỏ thư mục vật lý để quản lý ở cấp độ File (Row-level), nó giải quyết triệt để lỗi `ConcurrentAppendException` khi có nhiều Pipeline (Kafka Streams) cùng đâm dữ liệu vào 1 Partition.

```sql
-- Khởi tạo bảng với Liquid Clustering thay vì Partitioning (Databricks)
CREATE TABLE events (
  id STRING, 
  user_id STRING, 
  event_time TIMESTAMP
)
CLUSTER BY (user_id, event_time);
```

---

## 5. Tổng Kết

Partitioning không chỉ đơn thuần là phân chia dữ liệu vào các folder. Nó là quá trình kiến trúc nhằm tối ưu hóa I/O, giảm áp lực lên RAM (OOM), tránh tràn đĩa (Spill-to-disk) và cứu sống hệ thống trước thảm họa Cartesian Explosion. Dù với Hive-style cổ điển, Iceberg Hidden Partitioning hay Liquid Clustering tiên tiến, cốt lõi của Data Engineering vẫn là thấu hiểu vòng đời, mô hình truy cập dữ liệu và quản lý rủi ro tại tầng vật lý.

---

## Nguồn Tham Khảo
* [Designing Data-Intensive Applications (Chapter 6: Partitioning]][https://dataintensive.net/]
* [Apache Iceberg: Hidden Partitioning & Metadata Tree][https://iceberg.apache.org/docs/latest/partitioning/]
* [Apache Spark: Adaptive Query Execution (AQE] and Skew Optimization][https://spark.apache.org/docs/latest/sql-performance-tuning.html#adaptive-query-execution]
* [Databricks Blog: Debunking data layout myths - why Liquid Clustering outperforms partitioning](https://www.databricks.com/blog/debunking-8-data-layout-myths-why-liquid-clustering-outperforms-partitioning]
