---
title: "Troubleshooting: Spark Spill to Disk & Memory Tuning"
description: "Khám phá bản chất của OOMKilled và Spill-to-disk trong Spark Unified Memory. Hướng dẫn Tuning bộ nhớ và phân tích Overhead của Serialization."
difficulty: "Advanced"
tags: ["spark", "spill-to-disk", "oom", "memory-management", "tungsten"]
readingTime: "15 mins"
lastUpdated: 2026-06-26
---

Trong môi trường Cluster thực chiến, hệ thống của bạn không chết vì CPU yếu, mà chết vì hết RAM. Apache Spark xử lý In-Memory cực nhanh, nhưng khi khối lượng công việc của một Task (Partition) vượt quá dung lượng khả dụng trong Heap của JVM, Spark sẽ thi triển cơ chế phòng vệ cuối cùng: **Spill to Disk**. 

Spill là một "kẻ giết người thầm lặng" (Silent Killer): Job không sụp đổ ngay (`OOMKilled`) mà sẽ rơi vào vũng bùn (thrashing), làm tổng thời gian chạy tăng theo cấp số nhân.

## 1. Kiến trúc Bộ nhớ Thống nhất (Unified Memory Management)

Kể từ Project Tungsten (Spark 1.6+), Spark sử dụng Unified Memory Manager, phá bỏ vách ngăn cứng giữa không gian tính toán và không gian lưu trữ.

![Tungsten Memory Architecture](/images/4-compute-engines-batch/tungsten-memory.png)

Bên trong `spark.executor.memory`, Spark chia thành hai phân vùng linh hoạt:
- **Execution Memory:** Nơi cấp phát Hash Maps, Buffer cho Sort/Shuffle/Join.
- **Storage Memory:** Nơi chứa Cached Data (khi gọi `df.cache()`) và Broadcast Variables.

**Systemic Trade-offs:** Hai vùng này có thể "vay mượn" (Eviction/Borrowing) nhau. Nếu Execution cạn kiệt và Storage không thể nhường thêm (vì chứa block bị ghim), bộ đệm (buffer) tính toán sẽ xả dữ liệu trung gian xuống ổ cứng cục bộ (Local Disk) của Worker Node.

## 2. Giải phẫu Overhead của Spill (Tại sao nó lại quá chậm?)

Nhiều Kỹ sư lầm tưởng Spill chậm chỉ vì Disk I/O chậm. Thực tế, rào cản chí mạng nằm ở chi phí CPU:

1. **Serialization:** Object Java trong RAM phải được "phẳng hoá" (Flattened) thành chuỗi byte nhị phân. CPU hoạt động 100% cho quá trình này.
2. **Compression:** Chuỗi byte được nén (thường bằng thuật toán LZ4 hoặc Snappy) để giảm kích thước lưu trữ.
3. **Disk I/O Write:** Ghi block nén xuống đĩa `HDD / SSD`.
4. **Decompression & Deserialization:** Khi cần Join/Sort tiếp, Spark lại phải tốn ngần ấy công sức để phục hồi dữ liệu về RAM.

Sự xáo trộn ngữ cảnh (Context Switch) này làm ngạt CPU, dẫn đến tình trạng Task có vẻ đang chạy nhưng Disk I/O và CPU Spikes liên tục chạm nóc.

## 3. Chẩn đoán lâm sàng qua Spark UI

Dấu hiệu cảnh báo cấp độ đỏ trên Spark UI ở tab **Stages**:
- **Spill (Memory):** Kích thước dữ liệu RAM "bị" yêu cầu lưu xuống đĩa. (Ví dụ: 25GB)
- **Spill (Disk):** Kích thước vật lý thực sự ghi vào đĩa sau khi Serialize và Compress. (Ví dụ: 3GB)

> 💡 **Staff Engineer Tip:** Nếu bạn thấy `Spill (Memory) > 5GB` trong một Stage, hệ thống của bạn đang lãng phí hàng ngàn USD tiền Cloud Compute cho các thao tác rác (Garbage Collection & Serialization Overhead).

## 4. Tối ưu Hệ thống (System Tuning & Mitigation)

Tăng `spark.executor.memory` là cách của Junior. Một Staff Data Engineer sẽ tìm cách điều tiết Luồng dữ liệu (Data Flow) thay vì ném tiền vào Cloud.

### 4.1. Tăng mức độ song song (Concurrency Tuning)
Giảm tải cho mỗi Core bằng cách cắt nhỏ dữ liệu hơn nữa.
```bash
# Tăng từ cấu hình mặc định (200) lên mức độ song song khổng lồ
# Mục tiêu: Kéo kích thước 1 Partition về mức an toàn 100MB - 150MB
spark.conf.set("spark.sql.shuffle.partitions", 2000)
```
Nếu 100GB dữ liệu chia cho 200 partitions = 500MB/task (Dễ Spill). 
Nhưng nếu chia cho 2000 partitions = 50MB/task (Vừa khít L3 Cache và Execution Memory).

### 4.2. Tối ưu Hashing & Cấu trúc Dữ liệu
Các phép toán `GROUP BY`, `COUNT DISTINCT` sinh ra HashMap cực lớn.
- **Dùng hàm xấp xỉ (Approximate functions):** Nếu Business không yêu cầu độ chính xác tuyệt đối, hãy dùng `approx_count_distinct` thay vì `count(distinct)`. Nó triển khai cấu trúc *HyperLogLog* sử dụng chưa tới 1KB RAM thay vì tạo HashMap chiếm hàng trăm MB.

```python
from pyspark.sql.functions import approx_count_distinct

# Tránh Spill bằng thuật toán xác suất HLL
df.groupBy("store_id").agg(approx_count_distinct("customer_id", rsd=0.05))
```

### 4.3. Skewness Target
Nếu 199/200 Tasks xong trong 10 giây, và 1 Task chạy 4 tiếng văng Spill 50GB. Đó là Skew. Khắc phục bằng AQE Skew Join hoặc Salting như đã đề cập trong lý thuyết Partition.

### 4.4. Điều tiết lại Bộ nhớ (Memory Fraction Config)
Nếu Job của bạn không dùng `cache()` nhưng thực hiện tính toán (Join, Agg) quá nặng.
```python
# Mặc định Spark chia 50% Execution - 50% Storage
# Bóp Storage xuống còn 20%, giải phóng 80% RAM cho thuật toán xử lý
spark.conf.set("spark.memory.storageFraction", "0.2")
```

## 5. Nguồn Tham Khảo (References)
- [Deep Dive: Apache Spark Memory Management (Databricks)](https://databricks.com/)
- [Project Tungsten: Bringing Apache Spark Closer to Bare Metal](https://databricks.com/blog/2015/04/28/project-tungsten-bringing-spark-closer-to-bare-metal.html)
- [Spark Memory Management - Xin Li](https://0x0fff.com/spark-memory-management/)
