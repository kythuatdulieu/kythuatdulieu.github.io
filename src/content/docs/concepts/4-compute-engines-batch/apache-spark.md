---
title: "Apache Spark"
difficulty: "Intermediate"
tags: ["apache-spark", "big-data", "in-memory", "cluster", "distributed-systems"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "Apache Spark: Kiến trúc hệ thống, Trade-offs và Tối ưu Memory"
metaDescription: "Phân tích kiến trúc cốt lõi của Apache Spark: Spark SQL Catalyst Optimizer, Tungsten Execution Engine, RDD vs DataFrame, Lineage DAG và cơ chế quản trị Memory."
description: "Để vận hành Spark trên môi trường production, bạn không thể chỉ biết API. Bài viết này đi sâu vào kiến trúc Driver-Executor, Catalyst Optimizer, bộ máy Tungsten và cách Spark quản lý Memory/CPU dưới tầng vật lý."
---

Khởi nguồn từ AMPLab (UC Berkeley), Apache Spark hiện là tiêu chuẩn công nghiệp cho tính toán phân tán. Khác với cách tiếp cận MapReduce ghi đĩa liên tục, kiến trúc của Spark được xây dựng trên một nguyên lý duy nhất: **In-Memory Computation** (Tính toán trên RAM).

Bài viết này đi thẳng vào kiến trúc vật lý, hệ thống Memory Management, trình tối ưu hóa truy vấn và những nguyên nhân khiến Spark "sập" trên môi trường Production.

---

## 1. Kiến Trúc Cụm (Physical Cluster Architecture)

Spark ứng dụng mô hình **Master/Worker Architecture**. Nó không quản lý tài nguyên vật lý mà ủy quyền việc này cho Cluster Managers (YARN, Kubernetes, Mesos).

![Spark Cluster Architecture](/images/4-compute-engines-batch/spark-cluster-architecture.png)
*Kiến trúc Driver và Executor của Apache Spark (Nguồn: Apache Spark Docs).*

### 1.1 Driver Process (Khối điều khiển trung tâm)
- **Nhiệm vụ:** Duy trì thông tin trạng thái của ứng dụng, phân tích mã nguồn (Logical Plan), tạo Đồ thị Thực thi (Physical Execution DAG) và lập lịch Task tới các Executors.
- **Rủi ro vận hành (Bottlenecks):** Driver có bộ nhớ hạn chế (thường cấu hình `spark.driver.memory`). Nếu bạn chạy lệnh `df.collect()` hoặc `df.toPandas()` trên một DataFrame 50GB, toàn bộ dữ liệu sẽ dồn ngược về Driver, dẫn đến ngay lập tức gặp lỗi `java.lang.OutOfMemoryError: Java heap space`.

### 1.2 Executor Processes (Công nhân tính toán)
- **Nhiệm vụ:** Thực thi các Tasks và duy trì dữ liệu trung gian trong BlockManager.
- **Kiến trúc luồng:** Mỗi Executor là một JVM (Java Virtual Machine). Bên trong Executor có nhiều CPU Cores (thường cấu hình `spark.executor.cores = 5` để tối ưu HDFS/Network I/O throughput mà không gây quá tải GC). Mỗi Core xử lý độc lập một Partition dữ liệu.

---

## 2. Kiến Trúc Cốt Lõi: Catalyst Optimizer & Tungsten Engine

Từ Spark 2.x, RDD thuần túy (Low-level API) không còn được khuyến khích do Overhead của Serialization (Kryo/Java) và Garbage Collection. Sức mạnh của Spark hiện tại nằm ở **Spark SQL/DataFrame API** nhờ vào 2 bộ máy:

### 2.1 Catalyst Optimizer (Trình tối ưu Query)
Khi bạn viết Spark DataFrame code, Catalyst phân tích và tối ưu hóa nó qua 4 bước:
1. **Unresolved Logical Plan:** Phân tích cú pháp.
2. **Resolved Logical Plan:** Kiểm tra tính hợp lệ của Cột/Bảng với Catalog.
3. **Optimized Logical Plan:** Đẩy Filters xuống nguồn dữ liệu (Predicate Pushdown), loại bỏ các cột không cần thiết (Column Pruning).
4. **Physical Plan:** Chọn chiến lược tối ưu nhất. Ví dụ, nếu Join một bảng 1TB với bảng 10MB, Catalyst tự động chọn `BroadcastHashJoin` thay vì `SortMergeJoin`.

### 2.2 Project Tungsten (Quản lý Memory & Code Generation)
Tungsten vượt qua giới hạn của JVM truyền thống:
- **Off-Heap Memory Management:** Quản lý bộ nhớ nhị phân (Binary Processing) bên ngoài JVM Heap, giảm thiểu hoàn toàn thời gian Garbage Collection (GC) tốn kém.
- **Whole-Stage Code Generation:** Gộp nhiều hàm xử lý (Filter, Map) thành một hàm Java nguyên khối duy nhất, tối ưu chỉ thị CPU (CPU Register & L1/L2 Cache) thay vì duyệt từng hàm.

---

## 3. Giải phẫu Quản trị Bộ Nhớ (Spark Memory Management)

Lý do lớn nhất khiến Spark chết vì OOM là lập trình viên không hiểu bộ nhớ trong Executor được chia như thế nào. Bộ nhớ Executor (Heap) được chia thành 2 phần chính (`spark.memory.fraction` mặc định 0.6):

1. **Storage Memory (Bộ nhớ lưu trữ):** Dùng để Cache dữ liệu (khi bạn gọi `df.cache()` hoặc `df.persist()`).
2. **Execution Memory (Bộ nhớ thực thi):** Dùng cho các phép tính Shuffles, Joins, Aggregations.

**Cơ chế Unified Memory:** Từ Spark 1.6, Execution và Storage có thể "mượn" chéo của nhau. Tuy nhiên, nếu Execution cần RAM, nó có quyền đuổi (Evict) các khối Storage rớt xuống đĩa cứng (Spill-to-disk). Ngược lại thì không được. Hậu quả là nếu ứng dụng Shuffle quá nhiều, Storage Cache sẽ bị tống khứ hết.

```python
# Cấu hình PySpark để cân bằng Memory cho tác vụ nặng về Shuffle (giảm Storage, tăng Execution)
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("Heavy-Shuffle-Job") \
    .config("spark.memory.fraction", "0.8") \
    .config("spark.memory.storageFraction", "0.3") \
    .config("spark.sql.shuffle.partitions", "800") \
    .getOrCreate()
```

---

## 4. Trade-offs và Khắc Phục Lỗi (Troubleshooting)

### 4.1. Lỗi Spill-to-Disk và Disk Space Exhausted
- **Hiện tượng:** Spark UI báo lỗi `No space left on device` hoặc Task chạy quá chậm.
- **Nguyên nhân:** Khi Execution Memory đầy, Spark xả dữ liệu qua Disk. Nếu Disk cục bộ của Node quá nhỏ, hệ thống sẽ sập.
- **Giải pháp:** Tăng RAM, hoặc chia nhỏ dữ liệu ra nhiều Partitions hơn (`repartition()`), hoặc sử dụng EC2 Instances có NVMe SSD lớn.

### 4.2. Khủng hoảng JVM Garbage Collection (GC Pause)
- **Hiện tượng:** Task bị ngưng trệ, mất kết nối Heartbeat tới Driver.
- **Trade-off:** Tạo Executor siêu lớn (ví dụ: 64GB RAM, 16 Cores) tưởng chừng tốt nhưng thực chất JVM dọn rác cực chậm.
- **Giải pháp:** Giữ Executor ở mức vừa phải (16-32GB RAM, 4-5 Cores).

---

## Nguồn Tham Khảo (References)
* [Apache Spark Architecture - Official Docs](https://spark.apache.org/docs/latest/cluster-overview.html)
* [Deep Dive into Spark SQL's Catalyst Optimizer (Databricks Blog)](https://databricks.com/blog/2015/04/13/deep-dive-into-spark-sqls-catalyst-optimizer.html)
* [Project Tungsten: Bringing Apache Spark Closer to Bare Metal (Databricks Blog)](https://databricks.com/blog/2015/04/28/project-tungsten-bringing-spark-closer-to-bare-metal.html)
* [Designing Data-Intensive Applications (Martin Kleppmann)](https://dataintensive.net/)
