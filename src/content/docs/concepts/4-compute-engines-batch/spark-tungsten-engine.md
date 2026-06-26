---
title: "Spark Tungsten Engine"
difficulty: "Advanced"
tags: ["tungsten", "apache-spark", "memory-management", "jvm", "code-generation"]
readingTime: "20 mins"
lastUpdated: 2026-06-26
seoTitle: "Spark Tungsten Engine: Tối Ưu Hóa RAM và CPU Cấp Độ Phần Cứng"
metaDescription: "Khám phá kiến trúc Project Tungsten của Apache Spark: Memory Layout (UnsafeRow), Cache-aware Computation, và Whole-Stage Code Generation (WSCG)."
description: "Để vượt qua giới hạn của Garbage Collector (GC) và JVM object overhead, Spark đã đập đi xây lại toàn bộ engine thực thi với Project Tungsten, nhắm thẳng vào tốc độ của L1/L2 Cache và thanh ghi CPU."
---

Khi các hệ thống Big Data thời kỳ đầu (Hadoop MapReduce, Spark đời đầu) được thiết kế, cộng đồng Data Engineering mặc định rằng **Disk I/O** và **Network I/O** luôn là những nút thắt cổ chai (bottlenecks). Tuy nhiên, với sự trỗi dậy của SSD NVMe, kết nối mạng 100Gbps, và các định dạng lưu trữ dạng cột (Columnar Formats) như Parquet/ORC, bài toán I/O dần được giải quyết.

Databricks nhận ra một sự thật nghiệt ngã: Khi đĩa cứng và mạng không còn là rào cản, lõi thực thi của JVM (Java Virtual Machine) lại trở thành vật cản khổng lồ. 

**Project Tungsten** ra đời từ Spark 1.4 không phải là một bản vá. Nó là cuộc cách mạng đập đi xây lại toàn bộ Engine, giúp mã nguồn Spark tiến sát đến mức "Bare-metal performance" (tốc độ của phần cứng trần) bằng cách quản lý bộ nhớ trực tiếp và sinh mã C++ giả lập trên nền JVM.

---

## 1. Sự Dịch Chuyển Nút Thắt (Bottleneck Shift) và Lời Giải JVM

Sự phình to (Overhead) của Java Object là nỗi kinh hoàng cho bất kỳ hệ thống phân tán nào. Một chuỗi `"abcd"` (4 bytes) trong Java có thể chiếm tới 48 bytes RAM để chứa các header thông tin đối tượng. Khi Spark phải xử lý hàng chục tỷ dòng dữ liệu, việc tạo ra hàng chục tỷ Java Objects sẽ lập tức kích hoạt bộ thu gom rác **Garbage Collection (GC)**.

Khi GC chạy, nó kích hoạt sự kiện *Stop-The-World*, làm toàn bộ cluster "đóng băng", sụt giảm throughput (thông lượng) và thậm chí gây ra crash hệ thống do Timeout.

**Tungsten khắc phục bằng 3 trụ cột thiết kế chính:**

1. **Memory Management and Binary Processing**
2. **Cache-aware Computation**
3. **Whole-Stage Code Generation (WSCG)**

---

## 2. Quản Lý Bộ Nhớ và Xử Lý Nhị Phân (Binary Processing)

Thay vì phó mặc bộ nhớ cho JVM, Tungsten sử dụng API `sun.misc.Unsafe` của Java để cấp phát và thao tác trực tiếp với RAM giống hệt các ngôn ngữ C/C++ (chức năng `malloc`).

```mermaid
graph LR
    A["Java Object \n 'String', 'Int'"] -.->|GC Overhead, \n Cache Miss| JVM["JVM Heap Memory"]
    B["Tungsten UnsafeRow \n 'Binary Data'"] ==>|Direct Memory Access, \n No GC| OS["Off-Heap Memory"]
    
    style A fill:#ffcccc,stroke:#333
    style B fill:#ccffcc,stroke:#333,stroke-width:2px
```

### Memory Layout: Cơ chế UnsafeRow

Dữ liệu không còn là Object. Tungsten thiết kế lại hoàn toàn cấu trúc lưu trữ thành **UnsafeRow** – bản chất là những dải byte thô (binary format).
Mỗi một vùng nhớ do Tungsten kiểm soát được quản lý bởi một **Page** lớn (tương tự OS Virtual Memory). Một con trỏ 64-bit được dùng để truy xuất:
- `13-bit` đầu định danh Page Number.
- `51-bit` sau định vị Offset (độ dời) của dữ liệu bên trong Page.

![Tungsten Memory Management](/images/4-compute-engines-batch/tungsten-memory.png)

*Hình: Sơ đồ quản lý Page và Offset trong Tungsten Engine.*

**Đánh đổi (Trade-offs):**
- **Điểm lợi:** Vì là vùng nhớ **Off-heap**, GC hoàn toàn "mù" trước lượng dữ liệu này. Nó không quét qua, không dọn rác, loại bỏ 100% chi phí GC Pause trên data payload. Dữ liệu cũng nhỏ gọn hơn rất nhiều.
- **Rủi ro:** Khi sử dụng Off-heap, bạn phải cấp phát dung lượng cứng qua tham số (VD: `spark.memory.offHeap.size=4g`). Nếu dữ liệu phình to vượt mức này, container sẽ bị hệ điều hành (YARN/K8s) bắn hạ (OOMKilled) tàn nhẫn, không có ngoại lệ.

---

## 3. Tính Toán Nhận Thức Cache (Cache-aware Computation)

Tốc độ L1/L2 Cache của CPU là ~0.5ns, trong khi truy xuất từ RAM lên CPU tốn ~100ns. 

Trong Java, các object thường liên kết qua các con trỏ trỏ lung tung trên Heap. Khi CPU truy xuất tuần tự, nó liên tục bị **Cache Miss** và phải mất 100ns chờ load từ RAM.

Tungsten tổ chức dữ liệu nhị phân thành các mảng liền kề (contiguous memory arrays). 
**Ví dụ kinh điển: Cache-aware Sorting.**
Khi thực hiện Sort, thay vì load toàn bộ Row dữ liệu to lớn lên CPU, Tungsten chỉ duy trì một mảng con trỏ 8-byte liền kề. 
- 4-byte đầu là `Key Prefix` (tiền tố của khóa dùng để so sánh).
- 4-byte sau là địa chỉ trỏ ngược về Row vật lý.

CPU nạp toàn bộ mảng 8-byte này vào L1 Cache, thực hiện so sánh 4-byte Prefix với tốc độ chớp mắt. Rất nhiều thao tác so sánh hoàn tất mà không cần phải truy xuất Row gốc dưới RAM.

---

## 4. Whole-Stage Code Generation (WSCG)

Trước Spark 2.0, các toán tử được liên kết theo mô hình **Volcano Iterator Model**. Ví dụ: `Scan -> Filter -> Aggregate`. Để lấy 1 record, `Aggregate` gọi `Filter.next()`, `Filter` gọi `Scan.next()`. Hàng vạn lời gọi hàm ảo (Virtual Function Calls) phá vỡ cơ chế đẩy luồng (pipelining) của thanh ghi CPU.

Tungsten áp dụng **Whole-Stage Code Generation**. Nó gom toàn bộ physical plan lại, sau đó dùng compiler **Janino** biên dịch ngược chúng thành một vòng lặp `for` khổng lồ duy nhất trong Java bytecode.

Không còn `next()`, không còn Virtual Calls. Dữ liệu một khi chui vào L1 Cache sẽ được lọc (Filter) và cộng gộp (Aggregate) trong cùng một chu kỳ (CPU Registers) trước khi nhả kết quả xuống RAM. 

---

## 5. Tối Ưu Hệ Thống (System Tuning)

### Debug & Kiểm Chứng WSCG
Làm sao để biết Spark của bạn có đang chạy Tungsten hay không?
Hãy gọi hàm sau trên một DataFrame bất kỳ:
```python
df.queryExecution.debug.codegen()
```
Terminal sẽ in ra toàn bộ đoạn mã Java khổng lồ đã được "fused" (nén lại) và sinh ra bởi Tungsten. Trên giao diện Spark UI (SQL Tab), các node toán tử có dấu sao `*` đứng trước (như `*Filter`, `*SortMergeJoin`) đại diện cho việc WSCG đã được kích hoạt thành công.

### Cấu hình Off-Heap Thực Chiến
Trên môi trường Production, nếu bạn phải đối mặt với các Job có lượng Cache quá lớn (Persistent Storage) hoặc bị ngạt thở bởi GC Pause, hãy kích hoạt Off-heap của Tungsten:

```yaml
# Cấu hình trên spark-defaults.conf hoặc Terraform/Helm chart
spark.memory.offHeap.enabled: "true"
# Luôn dự trù dư 20% so với lý thuyết
spark.memory.offHeap.size: "8g" 
# Đảm bảo YARN/K8s có đủ headroom để chứa Off-heap
spark.executor.memoryOverhead: "10g" 
```

**Cảnh báo Kiến trúc:** Tungsten CHỈ CÓ TÁC DỤNG nếu Spark hiểu được schema của bạn. Nếu bạn ngoan cố dùng RDD (Resilient Distributed Dataset) chứa các custom Java Objects, Tungsten bị mù hoàn toàn và sẽ thoái lui về cơ chế xử lý object cũ rích của JVM. Luôn ưu tiên dùng DataFrames/Datasets.

---

## 6. Nguồn Tham Khảo (References)

* [Project Tungsten: Bringing Apache Spark Closer to Bare Metal - Databricks](https://databricks.com/blog/2015/04/28/project-tungsten-bringing-spark-closer-to-bare-metal.html)
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Spark Shuffle Architecture - DataBricks Deep Dive (Reynold Xin)](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
