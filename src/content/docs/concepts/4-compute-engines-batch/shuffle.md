---
title: "Shuffle trong Spark và Kiến trúc Remote Shuffle Service (RSS)"
domains: ["DE"]
level: "Senior"
difficulty: "Advanced"
tags: ["shuffle", "apache-spark", "performance-tuning", "bottleneck", "rss"]
readingTime: "25 mins"
lastUpdated: 2026-06-29
seoTitle: "Spark Shuffle Architecture & Remote Shuffle Service (RSS/Zeus) Uber"
metaDescription: "Đi sâu vào kiến trúc vật lý của Spark Shuffle. Phân tích nguyên nhân Spill-to-disk, OOMKilled và giải pháp Remote Shuffle Service (RSS) từ Uber."
description: "Shuffle là 'cơn ác mộng' tài nguyên trong tính toán phân tán. Hiểu rõ cơ bản về Map/Reduce side, Disk Spill và cách các Big Tech giải quyết bằng Disaggregated Shuffle."
---

Khi vận hành các hệ thống Big Data với hàng trăm Petabytes, bạn sẽ sớm nhận ra rằng tính toán (CPU) hiếm khi là nút thắt cổ chai. Kẻ thù thực sự luôn là **Disk I/O** và **Network Bandwidth**. Trong kiến trúc phân tán như Apache Spark, cơ chế kích hoạt sự bùng nổ của cả hai nút thắt này được gọi là quá trình **Shuffle**. 

Hầu hết các lỗi `OOMKilled` (Out Of Memory), `FetchFailedException`, hay `ExecutorLostFailure` đều bắt nguồn trực tiếp từ một quá trình Shuffle không được tối ưu hoặc do giới hạn phần cứng cục bộ.

## 1. Kiến trúc Vật lý của Spark Shuffle (Physical Execution)

Khác với các phép biến đổi hẹp (Narrow Transformations) như `.map()` hay `.filter()` hoạt động hoàn toàn trên RAM (In-memory) trong cùng một máy chủ, các phép toán rộng (Wide Transformations) như `.groupByKey()`, `.join()`, `.repartition()` yêu cầu dữ liệu phải được phân phối lại qua mạng để tập hợp các bản ghi có chung Key.

Trong kiến trúc mặc định, Spark chia quá trình Shuffle thành hai giai đoạn vật lý rạch ròi: **Shuffle Write** (Map side) và **Shuffle Read** (Reduce side), với `MapOutputTracker` làm cầu nối điều phối.

### 1.1. Shuffle Write (Giai đoạn Map)
Tại Map side, Spark phải phân loại dữ liệu xem mỗi bản ghi (record) sẽ đi về Reduce task nào. Để tránh tràn RAM, dữ liệu được ghi vào một bộ đệm (Shuffle RAM Buffer). Khi buffer đầy, dữ liệu bị **Spill-to-disk** (ghi tạm xuống đĩa cứng cục bộ của Executor) thành các tệp tin `*.data` và `*.index` (đánh dấu vị trí byte-offset của từng partition).
- **Trade-off:** Quá trình này tốn CPU để Serialize dữ liệu và tạo ra lượng khổng lồ Disk I/O. Nếu dùng ổ cứng cơ (HDD) thay vì NVMe SSD, quá trình này sẽ làm treo hệ thống.

### 1.2. Shuffle Read (Giai đoạn Reduce)
Tại Reduce side, các task sẽ gọi RPC đến `MapOutputTracker` (nằm trên Driver) để lấy tọa độ dữ liệu. Sau đó, chúng mở các kết nối TCP để kéo (Fetch) dữ liệu qua mạng từ toàn bộ các Map Executor.
- **Rủi ro vận hành (Operational Risk):** Kiến trúc này là **All-to-All communication**. Một Reduce task phải mở hàng ngàn kết nối mạng để kéo dữ liệu. Nếu một Map Executor bị chết do lỗi phần cứng, Reducer sẽ văng lỗi `FetchFailedException`, buộc Spark phải tính toán lại (re-compute) toàn bộ Stage trước đó.

## 2. Nút Thắt Cổ Chai Ở Quy Mô Exabyte (Uber's Scale)

Khi các công ty như Uber hay Facebook vận hành Spark trên cụm 10,000+ nodes, kiến trúc Shuffle cục bộ (Local Disk Shuffle) bắt đầu vỡ vụn. 

### 2.1. Thảm Họa Disk Wear-out (Hỏng SSD)
Trong thiết kế chuẩn, các máy chủ Compute sẽ ghi Shuffle data xuống ổ cứng SSD cục bộ. Với các job ETL xử lý hàng Terabyte dữ liệu mỗi phút, lượng dữ liệu Shuffle ghi xuống đĩa vượt qua giới hạn **DWPD (Drive Writes Per Day)** của SSD. Tại Uber, thay vì tuổi thọ 3 năm, các ổ SSD trên cụm YARN bị "vắt kiệt" và hỏng hoàn toàn chỉ sau 6 tháng.

### 2.2. Noisy Neighbor (Hàng Xóm Ồn Ào)
Trong một máy chủ đa nhiệm (Multi-tenant), nếu Job A ghi 500GB dữ liệu Shuffle và làm đầy ổ đĩa (Disk Full), nó sẽ kéo theo sự sụp đổ của Job B và Job C đang chạy cùng trên máy chủ đó, dù B và C không làm gì sai.

## 3. Kiến Trúc Cứu Cánh: Remote Shuffle Service (RSS)

Để giải quyết triệt để nút thắt Disk I/O cục bộ, Uber đã phát minh ra **Zeus / Remote Shuffle Service (RSS)** (hiện đã đóng góp cho mã nguồn mở, tạo nguồn cảm hứng cho Apache Celeborn, Apache Uniffle).

**Tư tưởng cốt lõi (Disaggregated Compute and Storage):**
Tách biệt hoàn toàn việc lưu trữ dữ liệu Shuffle ra khỏi các máy chủ tính toán (Compute nodes).

1. Thay vì Map Task ghi dữ liệu xuống đĩa cục bộ, nó sẽ **Stream qua mạng** đến một cụm máy chủ chuyên dụng chỉ làm nhiệm vụ lưu trữ Shuffle (RSS Servers).
2. Các cụm RSS này được trang bị phần cứng chuyên biệt cho I/O (I/O-Optimized) với mảng đĩa RAID hoặc NVMe siêu tốc.
3. **Reverse MapReduce Paradigm:** Trong RSS của Uber, các Mapper không sinh ra file hỗn hợp nữa. Chúng trực tiếp push các khối dữ liệu cùng Partition ID về cùng một RSS Server. Nhờ vậy, Reducer chỉ cần đến 1 RSS Server duy nhất để tải toàn bộ dữ liệu, thay vì phải kết nối "All-to-All".

Kiến trúc này giúp giảm thiểu kết nối mạng, bảo vệ cụm Compute không bao giờ bị đầy ổ cứng, và loại bỏ hoàn toàn tình trạng Noisy Neighbor.

### 3.1. Triển khai Remote Shuffle Service (Helm Chart / Kubernetes)
Ngày nay, để triển khai RSS trên Kubernetes, chúng ta có thể dùng Apache Celeborn. Dưới đây là ví dụ Helm values cấu hình Celeborn cho môi trường Cloud-Native.

```yaml
# celeborn-values.yaml
# Cấu hình triển khai Apache Celeborn (Remote Shuffle Service) trên K8s
master:
  replicas: 3
  resources:
    requests:
      memory: "4Gi"
      cpu: "2"

worker:
  replicas: 10
  resources:
    requests:
      memory: "16Gi"
      cpu: "4"
  # Cấu hình nhiều ổ đĩa chuyên dụng để chứa Shuffle Data
  volumes:
    - name: shuffle-vol-1
      hostPath: /mnt/nvme01
    - name: shuffle-vol-2
      hostPath: /mnt/nvme02
  
config:
  celeborn.network.bind.preferExtIP: "true"
  celeborn.worker.storage.dirs: "/mnt/nvme01,/mnt/nvme02"
  celeborn.worker.monitor.disk.enabled: "true"
```

## 4. Rủi ro Vận hành: Điểm mù của Developer

Dù có RSS, bản thân code SQL/Spark viết tồi vẫn có thể giết chết hệ thống.

### 4.1. Nút thắt cổ chai OOM với `groupByKey`
Một sai lầm kinh điển của các Junior Engineer là sử dụng `groupByKey()` thay vì `reduceByKey()` trong RDD API.

**Tại sao `groupByKey` làm sập hệ thống?**
`groupByKey` đẩy **toàn bộ dữ liệu thô** qua mạng sang Reduce side trước khi thực hiện tổng hợp. Nếu một Key có 1 tỷ records, Reducer chứa Key đó sẽ kéo 1 tỷ records vào RAM, dẫn đến `JVM OOMKilled`.

**Code Thực chiến: Hãy dùng `reduceByKey`**
`reduceByKey` thực hiện *Pre-aggregation* (Map-side Combine). Nó gom dữ liệu cục bộ ngay trên Mapper trước, sau đó chỉ gửi kết quả qua mạng (giống như Combiner trong Hadoop).

```python
# ❌ TRÁNH DÙNG: Gây ra Full Network Shuffle và OOM
rdd.map(lambda x: (x, 1)) \
   .groupByKey() \
   .mapValues(sum) 

# ✅ NÊN DÙNG: Pre-aggregation giảm 90% Network I/O
rdd.map(lambda x: (x, 1)) \
   .reduceByKey(lambda a, b: a + b)
```

### 4.2. Khắc phục Data Skew với kỹ thuật Salting
**Data Skew** xảy ra khi dữ liệu phân bố không đồng đều theo Hash Key. Một Reduce Task phải gồng gánh 80% tải của toàn hệ thống (Straggler Task), trong khi các task khác đã xong và ngồi chơi. 

**Giải pháp cốt lõi:** Kỹ thuật Salting. Thêm một số ngẫu nhiên (Salt) vào khóa (Key) bị nghiêng để "phân mảnh" nó ra nhiều Reducer khác nhau, tính toán một phần [Partial Aggregate], sau đó gộp lại.

```sql
-- Dữ liệu bị Skew ở store_id = 'DEFAULT_STORE'
-- Thay vì GROUP BY thông thường, ta băm nhỏ Key bằng cách thêm SALT ngẫu nhiên từ 1 đến 10
WITH salted_data AS (
    SELECT 
        store_id,
        amount,
        CAST(RAND() * 10 AS INT) AS salt
    FROM sales
),
partial_aggregation AS (
    -- Giai đoạn 1: Gom nhóm cục bộ trên Key đã bị băm (Phân tán qua mạng đều đặn)
    SELECT 
        store_id,
        salt,
        SUM(amount) AS partial_sum
    FROM salted_data
    GROUP BY store_id, salt
)
-- Giai đoạn 2: Gom nhóm lần cuối
SELECT 
    store_id,
    SUM(partial_sum) AS total_amount
FROM partial_aggregation
GROUP BY store_id;
```

## 5. Tối ưu Chi phí (FinOps) với Shuffle Tuning

Nếu bạn chạy Spark trên Cloud (AWS EMR, Databricks), Shuffle tồi tệ đồng nghĩa với đốt tiền tốn kém:
1. **Tinh chỉnh `spark.sql.shuffle.partitions`:** Mặc định là 200. Quy tắc vàng (Rule of Thumb) là đặt giá trị này sao cho mỗi partition có dung lượng khoảng `100MB - 200MB`. Nếu có 1TB dữ liệu sau filter, hãy set tham số này thành `5000` đến `10000`. 
2. **Kích hoạt Adaptive Query Execution (AQE):** Từ Spark 3.x, hãy đảm bảo `spark.sql.adaptive.enabled=true`. AQE tự động gom các phân vùng nhỏ lại (Auto Coalesce), đồng thời xử lý Data Skew một cách tự động ở ranh giới Shuffle.
3. **Loại bỏ Shuffle với Broadcast Join:** Luôn sử dụng HINT `/*+ BROADCAST(small_table) */` khi Join bảng nhỏ (< 2GB, tùy vào RAM của Executor). Thay vì Shuffle, bảng nhỏ được serialize và đẩy thẳng vào RAM của mọi Executor, tiết kiệm 100% Shuffle Network.
4. **Cấu hình Off-Heap Memory:** Với các dữ liệu dạng Struct nặng nề, bộ nhớ Heap của JVM dễ bị đầy và kích hoạt Garbage Collection (GC Pause) liên tục khi giải mã Shuffle. Hãy bật `spark.memory.offHeap.enabled=true` và cấp phát `spark.memory.offHeap.size` để Spark sử dụng bộ nhớ ngoài (Direct Memory) thông qua Project Tungsten.

## Nguồn Tham Khảo (References)
- [Uber Engineering Blog: Highly Scalable and Distributed Shuffle as a Service][https://www.uber.com/en-US/blog/ubers-highly-scalable-and-distributed-shuffle-as-a-service/]
- [Apache Spark Architecture Explained - Databricks][https://www.databricks.com/blog/2025/06/10/apache-spark-architecture-explained-how-the-unified-analytics-engine-actually-works.html]
- [Project Tungsten: Bringing Apache Spark Closer to Bare Metal - Databricks](https://www.databricks.com/blog/2015/04/28/project-tungsten-bringing-apache-spark-closer-to-bare-metal.html]
- Martin Kleppmann, *Designing Data-Intensive Applications*, Chapter 10: Batch Processing.
