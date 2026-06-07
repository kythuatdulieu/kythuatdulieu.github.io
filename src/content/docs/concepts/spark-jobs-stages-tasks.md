---
title: "Jobs, Stages, và Tasks trong Spark"
category: "Batch Processing"
difficulty: "Intermediate"
tags: ["spark-jobs", "spark-stages", "spark-tasks", "apache-spark", "dag"]
readingTime: "11 mins"
lastUpdated: 2026-06-07
seoTitle: "Cấu trúc phân cấp thực thi: Spark Jobs, Stages và Tasks"
metaDescription: "Hiểu sâu cấu trúc giải phẫu của một Spark Application thông qua biểu đồ phân cấp DAG: Application, Jobs, Stages và Tasks, giúp đọc hiểu Spark UI dễ dàng."
---

# Spark Jobs, Stages và Tasks

## Summary

Để thực thi khối lượng dữ liệu khổng lồ trên nhiều máy tính, Apache Spark phải chặt nhỏ chương trình của người dùng thành các đơn vị quản lý từ lớn xuống nhỏ. Giải phẫu cấu trúc thực thi này theo thứ bậc từ trên xuống gồm: **Application -> Jobs -> Stages -> Tasks**. Việc hiểu rõ sự phân cấp này là kỹ năng tối thiểu để Data Engineer có thể đọc báo cáo hiệu năng trên Spark UI và gỡ lỗi (debug) hệ thống.

---

## Definition

Khi ứng dụng chạy, Spark theo dõi và điều phối công việc qua 4 cấp độ vòng đời (Hierarchy of Execution):

1. **Spark Application**: Một chương trình người dùng được cấp phép tài nguyên. (Ví dụ: Một file `sales_etl_pipeline.py` chạy trên cụm). Một Application có chứa nhiều Jobs.
2. **Spark Job**: Một chuỗi các biến đổi (Transformations) hướng tới mục tiêu duy nhất. Một Job được khởi kích NGAY LẬP TỨC bởi một lệnh `Action` (như `count()`, `show()`, `write()`).
3. **Stage**: Một Job lớn sẽ bị cắt thành nhiều đoạn, mỗi đoạn gọi là một Stage. Ranh giới chia cắt là quá trình [Shuffle](/concepts/shuffle) (khi cần di chuyển dữ liệu qua mạng). Các tính toán nội bộ thì gom vào chung 1 Stage.
4. **Task**: Đơn vị công việc nguyên tử, nhỏ nhất. Spark chia dữ liệu của một Stage thành nhiều khối [Partitions](/concepts/spark-partition). Mỗi khối sẽ được một Task xử lý trên 1 CPU Core của cụm (Cluster).

---

## How it works

Spark sử dụng công cụ DAG Scheduler (Directed Acyclic Graph) để thiết kế sơ đồ cấp bậc này. 

1. Người dùng viết mã nguồn bằng PySpark (áp dụng tính chất Lazy Evaluation, chưa chạy gì).
2. Khi gọi một hàm `Action` như `df.write.parquet()`, Spark bắt đầu biên dịch: "À, tao phải làm 1 Job để hoàn thành Action này".
3. Spark nhìn ngược lại luồng dữ liệu xem có hàm gộp nhóm `groupBy()` hay kết nối `join()` nào không. Cứ mỗi lần gặp `groupBy` (tức là cần trao đổi dữ liệu vật lý qua lại - Wide Dependency), nó dùng chiếc kéo cắt sơ đồ DAG thành 2 khúc. Mỗi khúc là 1 **Stage**.
4. Ở trong 1 Stage, nếu dữ liệu đang có 100 cục **Partitions**, Spark sẽ giao nhiệm vụ cho 100 chú công nhân nhỏ, gọi là 100 **Tasks**. Tất cả 100 Tasks này thực hiện chung một thuật toán (ví dụ Filter > UpperCase > Map) trên cục dữ liệu nhỏ lẻ của riêng nó.

---

## Architecture / Flow

Mô phỏng cấu trúc DAG cho ứng dụng đơn giản: Đọc dữ liệu -> Lọc tuổi > 18 -> Gom nhóm theo tỉnh thành -> Đếm số người -> Ghi ra đĩa.

```mermaid
graph TD
    subgraph Application
        subgraph Job 1 (Kích hoạt bởi hàm .write)
            subgraph Stage 1 (Narrow Dependency)
                T1[Task 1: Read + Filter]
                T2[Task 2: Read + Filter]
                T3[Task 3: Read + Filter]
            end
            
            S[--- SHUFFLE --- Trao đổi dữ liệu qua mạng ---]
            Stage 1 --> S
            S --> Stage 2
            
            subgraph Stage 2 (Wide Dependency)
                T4[Task 4: GroupBy + Count + Write]
                T5[Task 5: GroupBy + Count + Write]
            end
        end
    end
```

---

## Practical example

```python
# Kích hoạt Application (Có 1 Application Master)
df = spark.read.csv("s3://data/users/")

# Hàm map, filter không chạy gì cả (Lazy evaluation)
adults_df = df.filter("age > 18")

# ACTION 1 -> Sinh ra Spark Job số 1
print(adults_df.count()) 
# Job 1 này không có Shuffle, vì hàm đếm không cần gom nhóm Key. DAG sinh ra chỉ có 1 Stage.
# Nếu df có 10 Partitions, sẽ có 1 Stage với 10 Tasks.

# Lại gọi map, groupBy
city_count_df = adults_df.groupBy("city").count()

# ACTION 2 -> Sinh ra Spark Job số 2
city_count_df.write.save("s3://output/")
# Job 2 có chứa GroupBy, nên cần Shuffle trao đổi mạng. DAG bẻ đôi nó thành 2 Stages (Stage 1 lọc, Stage 2 gom nhóm và ghi ra).
# Giả sử cấu hình shuffle partition mặc định là 200. Stage 2 sẽ sinh ra chính xác 200 Tasks.
```

---

## Best practices

* **Đọc Spark UI**: Sử dụng giao diện Spark Web UI (mặc định tại cổng `4040` trên local). Ở tab *Stages*, hãy chú ý vào các cột *Shuffle Read / Shuffle Write*. Nếu một Stage mất quá nhiều thời gian và dung lượng ghi màu đỏ khổng lồ, đó chính là nguyên nhân gây chậm (bottleneck).
* **Quản lý Task Size**: Nếu tab *Stages* báo cáo rằng Stage của bạn có 10,000 Tasks mà thời gian chạy mỗi task chỉ 10 mili-giây, bạn đang gặp hội chứng "Quá tải điều phối" (Scheduling Overhead). Hãy giảm số partitions đi (dùng coalesce). Nếu Task chạy quá lâu và dễ bị OOM, hãy tăng số partitions lên.

---

## Common mistakes

* **Quá nhiều Actions trong vòng lặp**: Viết lệnh `count()` hoặc `show()` bên trong một vòng lặp `for` của Python. Mỗi lần lặp nó sẽ bắn ra 1 Job mới, bắt Spark đọc lại dữ liệu và tính toán lại từ đầu hàng trăm lần, làm cụm bị kiệt sức. Lệnh Action đắt giá chỉ nên gọi ở cuối cùng của pipeline.
* **Không phân biệt được ranh giới Stage**: Rất nhiều người không hiểu tại sao pipeline sập. Khi mở DAG ra, hãy tìm điểm cắt Stage, đó chính xác là lúc Spark bị hết RAM trong bộ nhớ đệm Shuffle.

---

## Trade-offs

Việc Spark chia Stage dựa vào Shuffle giúp nó tạo các "Checkpoints tự nhiên" (Barriers). Nếu hệ thống mất điện làm một số Executor ở Stage 2 hỏng, hệ thống không cần chạy lại Stage 1 (vì kết quả Stage 1 đã được viết cứng xuống bộ đệm local disk của máy Worker), tiết kiệm rất nhiều công sức Re-compute.

---

## When to use

Kiến thức nền tảng bắt buộc để đọc hiểu Spark Web UI và tham gia các cuộc họp gỡ lỗi rớt Performance.

---

## Related concepts

* [Apache Spark](/concepts/apache-spark)
* [Spark Execution Model](/concepts/spark-execution-model)
* [Shuffle](/concepts/shuffle)
* [Spark Partition](/concepts/spark-partition)

---

## Interview questions

### 1. Phân biệt sự khác nhau giữa Job, Stage và Task trong Apache Spark?
* **Người phỏng vấn muốn kiểm tra**: Sự nắm vững kiến trúc lập lịch DAG lõi.
* **Gợi ý trả lời**: 
  * Job đại diện cho một luồng công việc kích hoạt bởi một Action duy nhất (như `.collect()`).
  * Stage là các mảng tính toán vật lý độc lập trong một Job, bị chia tách bởi ranh giới dữ liệu Shuffle (do các phép Wide Dependency như `JOIN` tạo ra).
  * Task là cấp độ phân mảnh nhỏ nhất trong Stage, nơi mỗi Task thi hành logic mã nguồn trên một và chỉ một cục dữ liệu Partition. Tổng số Tasks trong một Stage = Tổng số Partitions lúc đó.

### 2. Khi chạy lệnh `df.show()`, tại sao số lượng Task sinh ra thường không bằng với số lượng Partitions gốc của DataFrame?
* **Gợi ý trả lời**: Lệnh `.show()` là một action đặc biệt chỉ hiển thị 20 dòng mặc định. Catalyst Optimizer rất thông minh, thay vì khởi chạy tất cả n Tasks để quét toàn bộ dữ liệu, nó chỉ tạo một Job siêu nhỏ gọi là `Limit` và gửi yêu cầu tính toán 1 Task đầu tiên, nếu đọc đủ 20 dòng nó sẽ dừng luôn mà không cần thi hành các Task còn lại.

---

## References

* **Spark: The Definitive Guide** - Bill Chambers, Matei Zaharia (Chương về Spark UI và The Anatomy of a Spark Job).
* Official Spark Documentation: [Cluster Mode Overview](https://spark.apache.org/docs/latest/cluster-overview.html)

---

## English summary

The execution hierarchy of an Apache Spark application maps logical operations to physical execution resources. An Application spawns multiple Jobs triggered by Actions. A Job's Directed Acyclic Graph (DAG) is sliced into distinct Stages at shuffle boundaries (where wide dependencies necessitate network data movement). Within a Stage, the workload is distributed as discrete Tasks, each executing concurrently on an individual CPU core over a single Partition of data. Understanding this pipeline is the foundational prerequisite for debugging bottlenecks in the Spark UI.
