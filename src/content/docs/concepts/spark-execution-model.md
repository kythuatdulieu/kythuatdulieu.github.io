---
title: "Mô hình thực thi Spark - Spark Execution Model"
category: "Batch Processing"
difficulty: "Intermediate"
tags: ["spark-execution-model", "apache-spark", "driver", "executor"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Spark Execution Model: Kiến trúc Driver, Cluster Manager và Executor"
metaDescription: "Hiểu sâu về kiến trúc thực thi (Execution Model) trong Apache Spark: Vai trò của Driver, Cluster Manager, và Worker/Executor Node trong phân phối khối lượng công việc."
---

# Mô hình thực thi Spark - Spark Execution Model

## Summary

Spark Execution Model (Mô hình thực thi Spark) định nghĩa cách mà một đoạn mã nguồn (Data pipeline hoặc Machine Learning) của người dùng được chuyển đổi, phân bổ và thực thi trên một cụm máy tính phân tán. Nó tuân theo kiến trúc Master-Slave kinh điển, bao gồm ba thành phần chủ chốt: **Driver Program** (bộ não điều phối), **Cluster Manager** (bộ đàm phán tài nguyên), và các **Executors** (những cỗ máy công nhân tính toán trực tiếp).

---

## Definition

Trong Apache Spark, ứng dụng của người dùng không chạy độc lập trên một máy tính duy nhất. Khi bạn kích hoạt một Spark Application, hệ thống sẽ tách biệt luồng điều khiển (Control Flow) và luồng dữ liệu (Data Flow). Mô hình thực thi này tổ chức ứng dụng thành một tiến trình trung tâm quản lý hàng chục hoặc hàng trăm tiến trình phân tán (JVM processes) chạy song song trên nhiều máy vật lý (Nodes) khác nhau.

---

## Architecture / Flow

Mô hình thực thi Spark gồm các thành phần sau:

```mermaid
graph TD
    User[User Script / spark-submit] --> Driver[Driver Program (SparkContext)]
    Driver <-->|Yêu cầu tài nguyên| CM[Cluster Manager: YARN / K8s / Standalone]
    
    CM -.->|Khởi tạo| Node1[Worker Node 1]
    CM -.->|Khởi tạo| Node2[Worker Node 2]
    
    subgraph Node 1
        Exec1[Executor]
        Exec1_Task[Tasks (Cores)]
        Exec1_Cache[In-Memory Cache]
        Exec1 --> Exec1_Task
        Exec1 --> Exec1_Cache
    end

    subgraph Node 2
        Exec2[Executor]
        Exec2_Task[Tasks (Cores)]
        Exec2_Cache[In-Memory Cache]
        Exec2 --> Exec2_Task
        Exec2 --> Exec2_Cache
    end
    
    Driver ==>|Phân phối Tasks| Exec1
    Driver ==>|Phân phối Tasks| Exec2
    Exec1 -.->|Trả kết quả / Trạng thái| Driver
    Exec2 -.->|Trả kết quả / Trạng thái| Driver
```

1. **Driver Program (Master)**: Là tiến trình khởi tạo biến `SparkContext` hoặc `SparkSession`. Nhiệm vụ của nó là dịch mã nguồn của bạn thành các Job, tạo DAG (Directed Acyclic Graph), chia nhỏ thành các Stage/Task, và giao việc cho Executor.
2. **Cluster Manager**: Một phần mềm quản lý tài nguyên độc lập (ví dụ: Hadoop YARN, Apache Mesos, hoặc Kubernetes). Nó giống như phòng nhân sự: Driver yêu cầu "Tôi cần 10 máy, mỗi máy 4 CPU 16GB RAM", Cluster Manager sẽ đi tìm các máy rảnh rỗi và khởi động tiến trình Executor trên đó.
3. **Worker Nodes**: Các máy chủ vật lý (hoặc máy ảo) trong cụm máy tính, nơi cung cấp CPU và RAM.
4. **Executor (Slaves)**: Tiến trình JVM được khởi tạo trên Worker Node. Executor sẽ nhận các đơn vị công việc nhỏ (Tasks) từ Driver, chạy code phân tích trên một phần dữ liệu, lưu cache tạm thời (In-memory) và báo cáo trạng thái lại cho Driver.

---

## Why it exists

Mô hình này ra đời để giải quyết các bài toán của tính toán phân tán:
* **Điều phối tập trung (Centralized Coordination)**: Có một bộ não (Driver) lập kế hoạch tổng thể, đảm bảo tiến độ thay vì để các máy con tự hoạt động loạn xạ.
* **Tính độc lập của Trình quản lý tài nguyên**: Tách biệt Cluster Manager giúp Spark linh hoạt chạy trên bất kỳ hạ tầng nào (On-premise bằng YARN hoặc Cloud bằng Kubernetes) mà không cần viết lại mã nguồn nền tảng.
* **Tính bền bỉ (Resilience)**: Nếu một Executor (Worker) bị "chết" (Crash/OOM), Driver sẽ nhận ra ngay và tái giao lại phần việc (Task) đó cho một Executor khác đang sống sót, giúp ứng dụng không bị sập.

---

## Practical example

Xét lệnh đếm số dòng:
```python
# 1. Đoạn code này chạy trên Driver
df = spark.read.parquet("s3://huge-logs/")
count = df.count()
print(count)
```

**Quá trình thực thi:**
1. **Driver** phân tích file Parquet trên S3, nhận thấy nó gồm 1000 mảnh file nhỏ (partitions). Nó tạo ra 1000 Tasks độc lập.
2. Driver đàm phán với **Cluster Manager** lấy 10 **Executors**. Mỗi Executor có 4 Cores. (Tổng cộng 40 Tasks có thể chạy cùng một lúc).
3. Driver phân bổ đợt 1 (40 Tasks đầu) cho các Executor. Mỗi Task (đại diện cho 1 core) sẽ tới S3 lấy 1 file, đếm số dòng, ghi nhận lại.
4. Khi 1 Task xong, nó gửi con số cục bộ (ví dụ: 50.000 dòng) về cho Driver. Driver tiếp tục giao Task thứ 41. Quá trình lặp lại đến Task 1000.
5. Cuối cùng, **Driver** tự tính tổng số đếm cục bộ từ 1000 Tasks và in kết quả `print(count)` ra màn hình của User.

---

## Best practices

* **Cấu hình tài nguyên hợp lý (Right-sizing)**: Không cấp phát Executor quá bự (ví dụ 64 Cores, 256GB RAM) vì JVM Garbage Collection sẽ chạy rất lâu và làm nghẽn ứng dụng. Cấu hình "Sweet spot" thường là 5 Cores và 16-32GB RAM cho mỗi Executor (YARN best practices).
* **Đủ bộ nhớ cho Driver**: Dù Driver không tính toán nặng, nhưng nếu bạn dùng hàm `collect()` gom hàng triệu dòng dữ liệu về, Driver phải có đủ RAM để chứa số lượng đó, nếu không tiến trình Driver sẽ bị OOM (Out Of Memory) và chết toàn bộ Application.

---

## Common mistakes

* **Thực thi code nặng trên Driver thay vì Executor**: Viết vòng lặp `for` thông thường của Python để duyệt DataFrame. Điều này kéo toàn bộ dữ liệu về máy Master để chạy tuần tự bằng 1 CPU, phá vỡ hoàn toàn nguyên lý Xử lý phân tán.
* **Mất kết nối Driver**: Trên môi trường mạng không ổn định, nếu tín hiệu "Heartbeat" giữa Executor và Driver bị đứt, Driver tưởng Executor chết và hủy bỏ hàng tá công việc đã làm xong.

---

## Trade-offs

### Ưu điểm
* **Dễ scale (Mở rộng linh hoạt)**: Khi lượng dữ liệu tăng, chỉ cần tăng số lượng Executor (--num-executors).
* **Data Locality (Tối ưu cục bộ)**: Driver cố gắng giao Task đọc HDFS cho Executor nằm ngay trên cái máy tính vật lý chứa mảnh dữ liệu đó để khỏi phải truyền dữ liệu qua mạng.

### Nhược điểm
* **Single Point of Failure tại Driver**: Nếu máy chứa Driver Program gặp sự cố (bị ngắt điện ngẫu nhiên), toàn bộ tiến trình Application sẽ bị hủy diệt hoàn toàn vì mất luồng điều khiển, các Executor sẽ tự động giải tán.
* **Overhead mạng**: Liên tục gửi các mã biên dịch (serialized closure) từ Driver xuống hàng ngàn Executor tốn một phần băng thông.

---

## When to use

* Là kiến trúc bắt buộc đi liền với Apache Spark. Bạn cần hiểu mô hình này để tinh chỉnh tham số `spark-submit` (như `executor-memory`, `driver-memory`, `executor-cores`) cho các quy trình ETL hiệu suất cao.

---

## Related concepts

* [Apache Spark](/concepts/apache-spark)
* [Spark Jobs, Stages, Tasks](/concepts/spark-jobs-stages-tasks)
* [Spark Partition](/concepts/spark-partition)

---

## Interview questions

### 1. Sự khác biệt giữa `Client Mode` và `Cluster Mode` trong khi submit Spark job?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết môi trường triển khai thực tế của Spark.
* **Gợi ý trả lời**: 
  * **Client Mode**: Driver Program chạy trực tiếp trên cái máy tính/máy chủ nơi bạn gõ lệnh `spark-submit`. Nếu bạn tắt terminal hoặc mạng máy bạn rớt, Driver chết -> Job thất bại. Thường dùng để tương tác code, debug.
  * **Cluster Mode**: Driver Program được Cluster Manager đưa vào chạy ngầm bên trong một Worker Node (như một application master). Bạn tắt terminal thoải mái, hệ thống cluster tự duy trì sự sống của Driver. Dùng cho Production.

### 2. Chuyện gì xảy ra nếu một Executor bị hỏng (OOM/Crash) giữa chừng khi đang chạy Job?
* **Gợi ý trả lời**: Nhờ cấu trúc Fault Tolerance của Spark, Driver sẽ nhận thấy Executor bị rớt mạng qua việc không thấy tín hiệu Heartbeat. Nó sẽ đánh dấu các Task đang chạy dở trên Executor đó là "Failed". Dựa vào biểu đồ DAG, Driver sẽ tạo ra các Task thay thế (Recompute) và phân bổ chúng vào các Executor khác đang sống sót để hoàn tất mà không làm sập toàn bộ Application.

---

## References

* **Spark: The Definitive Guide** - Bill Chambers, Matei Zaharia (Chương về Application Architecture).
* **Databricks documentation** - Hardware Provisioning.

---

## English summary

The Spark Execution Model defines how applications distribute their workloads across a cluster. It relies on a central Driver Program that breaks logic into tasks, schedules them, and interacts with a Cluster Manager (like YARN or Kubernetes) to acquire resources. The actual data processing and caching happen concurrently on distributed worker nodes via Executor processes (JVMs). This Master-Slave architecture enables high scalability, fault tolerance, and data locality, though it requires precise resource tuning to prevent Out Of Memory errors and ensure optimal performance.
