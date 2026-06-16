---
title: "Troubleshooting: Xử lý lỗi Out Of Memory (OOM) trong Spark"
description: "Hướng dẫn toàn diện về cách phân tích, chẩn đoán và khắc phục lỗi Out of Memory (OOM) trong các ứng dụng Apache Spark ở cả Driver và Executor."
---



Lỗi **Out Of Memory (OOM - java.lang.OutOfMemoryError)** hoặc **Container killed by YARN for exceeding memory limits** là một trong những cơn ác mộng kinh điển của các kỹ sư Data khi làm việc với Apache Spark. Nó làm sụp đổ hoàn toàn ứng dụng, tốn nhiều thời gian chạy lại, và đôi khi nguyên nhân không hề rõ ràng.

Để "chữa bệnh", bạn phải hiểu rõ bản chất vấn đề và biết chính xác thành phần nào đang bị tràn bộ nhớ: Là **Driver** hay là **Executor**? Tràn ở vùng nhớ **JVM Heap** hay **Off-Heap**? Những căn bệnh này có nguyên nhân và cách chữa hoàn toàn trái ngược nhau.

Bài viết này sẽ đi sâu vào cấu trúc quản lý bộ nhớ của Spark, phân loại các lỗi OOM phổ biến và cung cấp hướng dẫn chi tiết để khắc phục từng trường hợp.

---

## 1. Tổng Quan Về Kiến Trúc Bộ Nhớ Trong Spark


Trước khi đi vào bắt bệnh, chúng ta cần hiểu Spark chia bộ nhớ như thế nào. Từ Spark 1.6, Spark sử dụng **Unified Memory Management** cho Executor. Một Executor hoặc Driver container do Cluster Manager (YARN, Kubernetes) cấp phát sẽ được chia làm nhiều phần:

*   **JVM Heap:** Vùng nhớ chính để chạy mã Java/Scala, cấu hình qua `spark.executor.memory` (hoặc `spark.driver.memory`). Nó được chia nhỏ tiếp thành:
    *   **Reserved Memory:** Khoảng 300MB dành riêng cho hệ thống Spark (để đảm bảo Spark luôn có đủ RAM cơ bản hoạt động).
    *   **User Memory:** (~25% của lượng còn lại sau khi trừ Reserved) Dùng cho cấu trúc dữ liệu người dùng tự định nghĩa, Hash map, UDFs, meta-data v.v.
    *   **Spark Memory:** (~75% còn lại, có thể điều chỉnh qua tham số `spark.memory.fraction`). Vùng nhớ này được chia động thành 2 phần:
        *   **Storage Memory:** Dùng cho caching (`persist()`, `cache()`), và lưu trữ broadcast variables.
        *   **Execution Memory:** Dùng cho các thao tác tính toán, xử lý dữ liệu trung gian (shuffles, joins, sorts, aggregations).
*   **Memory Overhead (Off-Heap):** Cấu hình qua `spark.executor.memoryOverhead` (mặc định là 10% của Executor memory, với tối thiểu 384MB). Đây là vùng nhớ bên ngoài JVM Heap, do hệ điều hành (OS) quản lý trực tiếp. Nó được dùng cho:
    *   Các thư viện native C/C++ (như Netty cho Network I/O).
    *   Tiến trình bộ nhớ cho Python khi dùng PySpark.
    *   Vùng đệm mạng (Network buffers).

Dựa trên cấu trúc này, chúng ta có thể phân loại OOM thành các nhóm chính.

---

## 2. Driver OOM (Node Điều Khiển Bị Quá Tải)
Driver là "nhạc trưởng" của ứng dụng Spark. Nhiệm vụ chính của nó là quản lý Metadata, xây dựng Abstract Syntax Tree (AST), tối ưu hóa Execution Plan (Catalyst Optimizer), lên lịch DAG, và giao việc cho Executor. Nó không được sinh ra để xử lý lượng lớn dữ liệu thực tế.

**Lỗi thường gặp trên log:** `java.lang.OutOfMemoryError: Java heap space` (trên UI của Job, hoặc log container của Driver).

### Nguyên Nhân
1.  **Thu gom quá nhiều dữ liệu về Driver:** Bạn gọi các action function như `collect()`, `show()`, `take(N)` (với N quá lớn), hoặc `toPandas()` trên một DataFrame khổng lồ. Spark sẽ ép buộc kéo toàn bộ khối dữ liệu phân tán từ hàng trăm Executor về nhét chung vào Driver (thường chỉ cấu hình 2GB - 4GB RAM).
2.  **Broadcast quá lớn:** Bạn cố gắng broadcast một bảng dữ liệu (Broadcast Hash Join) lớn hơn giới hạn an toàn. Khi thực hiện lệnh broadcast, Driver phải lấy toàn bộ bảng đó về, lưu trữ thành cấu trúc Collection trong RAM trước khi gửi (serialize) đến các Executor.
3.  **Metadata, DAG và Execution Plan quá phức tạp:** Khi câu query SQL quá dài (hàng chục ngàn dòng), xử lý truy vấn có hàng ngàn cột, thực hiện join hàng chục bảng, hoặc đọc trực tiếp dữ liệu từ một thư mục data lake chứa hàng triệu file nhỏ. Driver cần lưu giữ sơ đồ thực thi (Physical/Logical Plan) và schema của file. Số lượng object được tạo ra làm cạn kiệt User Memory.
4.  **Closure quá lớn:** Bạn tạo một danh sách/mảng Python/Scala cục bộ khổng lồ trên Driver và dùng mảng đó trong thân hàm `map()` hoặc `filter()` (Closure). Spark bắt buộc phải serialize object lớn đó để ném xuống các Executor.

### Cách Khắc Phục
*   **Loại bỏ `collect()` trong Production:** Tuyệt đối không dùng `collect()` trừ khi đã kiểm soát dữ liệu trả về bằng `limit()`. Để lấy kết quả xuất ra ngoài, luôn dùng hàm `write` để đẩy song song xuống storage (S3/HDFS/GCS) trực tiếp bằng các Executor.
*   **Tối ưu thao tác Broadcast:**
    *   Sử dụng tính năng phân tích ước tính kích thước của Spark (Catalyst Analyzer).
    *   Kiểm soát biến `spark.sql.autoBroadcastJoinThreshold` (mặc định 10MB). Không nên nâng lên quá 1GB.
    *   Với bảng lớn, chấp nhận đổi chiến thuật sang `Sort-Merge Join` hoặc `Shuffle Hash Join`.
*   **Xử lý bài toán file nhỏ (Small files problem):**
    *   Chạy Job nén/gộp các file nhỏ trước khi cho luồng chính đọc để giảm gánh nặng schema infer.
    *   Khai báo tường minh Schema (Custom Schema) khi đọc `spark.read.schema(...)` thay vì để hàm `inferSchema=True` hoạt động tốn kém.
*   **Tăng RAM dự phòng cho Driver:** Nếu bắt buộc phải xử lý một mảng Metadata lớn hoặc thuật toán phân bổ plan phức tạp, hãy chủ động tăng `spark.driver.memory` (vd: `8g` hoặc `16g`).

---

## 3. Executor OOM - JVM Heap Space (Node Thực Thi Bị Đột Tử)
Executor là những "công nhân dọn rác" thực thụ. Nếu khối lượng công việc giao cho công nhân quá khổ, hoặc rác thải tạo ra tại 1 thời điểm quá lớn hơn Execution/Storage Memory, công nhân sẽ gục ngã tại chỗ.

**Lỗi thường gặp trên log:** `java.lang.OutOfMemoryError: Java heap space` (trên các task fail trong Executor), task bị fail và retries liên tục.

### Nguyên Nhân
1.  **Data Skew (Lệch dữ liệu):** Nguyên nhân OOM khét tiếng và phổ biến nhất. Key dữ liệu phân phối không đồng đều (vd: key `null`, giá trị rỗng `""`, hoặc một nhóm id siêu phổ biến). Trong quá trình `join` hoặc `groupBy`, một Executor xui xẻo bị ép phải xử lý khối lượng dữ liệu gấp 100 lần các máy khác. Dữ liệu trung gian của task này vượt quá sức chứa của Execution Memory.
2.  **Kích thước Shuffle Partition quá lớn:** Tham số `spark.sql.shuffle.partitions` định nghĩa số lượng file sinh ra ở bước shuffle (mặc định là 200). Với dữ liệu hàng nghìn GB, chia 200 khối nghĩa là mỗi Executor phải ăn hàng chục GB dữ liệu tại cùng một thời điểm.
3.  **Concurrency quá cao (Quá nhiều Core):** Tham số `spark.executor.cores` quy định số task chạy đồng thời trên 1 JVM. Bộ nhớ JVM được chia sẻ chung. Ví dụ cấu hình 8GB RAM, 8 Cores -> Mỗi Task chỉ có xấp xỉ chưa tới 1GB RAM để hoạt động thực tế. Nếu nhiều task nặng cùng chạy, OOM sẽ xảy ra.
4.  **Cartesian Joins (Cross Join):** Lập trình viên quên điều kiện `ON` trong phép Join, khiến Spark sinh ra các record theo cấp số nhân (Cartesian product).
5.  **Caching/Persisting tham lam:** Cache/Persist quá nhiều DataFrame trong chương trình chiếm hết phần Storage Memory, chèn ép Execution Memory xuống mức tối thiểu. GC (Garbage Collector) của Java sẽ phải chạy dọn dẹp liên tục, gây ra "GC Pause" và cuối cùng là OOM.

### Cách Khắc Phục
*   **Tuyệt chiêu xử lý Data Skew:**
    *   **Bật Adaptive Query Execution (AQE):** Từ Spark 3.x, bạn nên luôn bật `spark.sql.adaptive.enabled=true` và `spark.sql.adaptive.skewJoin.enabled=true`. Spark sẽ tự động chẻ nhỏ các partition lệch khi chạy.
    *   **Salting:** Kỹ thuật thủ công gán thêm chuỗi ID ngẫu nhiên (salt) vào các key bị lệch để lừa Spark phân tán chúng ra đa dạng partition khác nhau trước khi join.
    *   **Lọc dữ liệu rác:** Tách riêng các dòng `id is null` ra xử lý song song thay vì nhét chung với luồng join chính.
*   **Chia để trị (Tăng Partitions):** Tăng mạnh `spark.sql.shuffle.partitions`. Một rule of thumb là chỉnh con số này sao cho mỗi partition có kích thước lý tưởng từ 100MB - 200MB. Có thể đẩy lên `1000`, `2000` hoặc hơn.
*   **Kiểm soát số Core:** Đảm bảo mỗi Core (Task) có tối thiểu `2GB - 4GB` RAM vật lý. Nếu Executor memory là 16GB, số core lý tưởng nhất là `4` hoặc `5` (`spark.executor.cores=5` là con số phổ biến tối ưu nhất trên HDFS/YARN để tránh nghẽn I/O).
*   **Giải phóng bộ nhớ tự động:** Quản lý vòng đời cache hợp lý. Sử dụng `unpersist()` hoặc dùng StorageLevel `MEMORY_AND_DISK` thay vì `MEMORY_ONLY`.

---

## 4. Container Killed by YARN (Off-Heap / Memory Overhead OOM)
Đây là loại lỗi "ảo ma" nhất đối với người mới. JVM Heap (bộ nhớ trong Java) vẫn còn trống thênh thang, nhưng Cluster Manager (YARN hoặc Kubernetes) lại nhẫn tâm "bắn bỏ" (kill) Container chứa Executor đó.

**Lỗi thường gặp trên log:** `Executor lost, Container killed by YARN for exceeding memory limits. 4.5 GB of 4 GB physical memory used. Consider boosting spark.yarn.executor.memoryOverhead`.

### Nguyên Nhân
Tình huống này xảy ra khi **Tiến trình sử dụng bộ nhớ ngoài hệ thống (Off-Heap) vượt quá hạn mức cho phép**. YARN/K8s đo tổng lượng RAM vật lý của cái vỏ Container chứ không quan tâm bên trong JVM còn dư bao nhiêu.
1.  **Chi phí cực lớn của Python UDF:** PySpark kiến trúc theo mô hình đa luồng phức tạp. Dữ liệu được tính toán trên JVM nhưng khi cần dùng Python UDF, Spark đẩy (serialize) dữ liệu qua một socket pipe tới tiến trình con Python. Tiến trình Python tiêu thụ RAM độc lập với JVM. Dữ liệu truyền lớn = Bộ nhớ Python phình to = Vượt trần Memory Overhead = YARN Kill.
2.  **Thư viện Native (C/C++):** Các định dạng nén (Snappy, Lz4, Zstandard) hoặc NIO Network thao tác trực tiếp trên vùng nhớ Off-Heap. Khi I/O mạng hoặc disk hoạt động quá công suất, buffer trào dâng.
3.  **Tác vụ chuỗi/Json quá lớn:** Các UDF thực hiện parse JSON string khổng lồ, bóc tách Regex regex phức tạp.
4.  **Tối ưu PyArrow:** Ngay cả khi dùng Pandas Vectorized UDF, cấu trúc Columnar Arrow format lưu trữ trên off-heap nếu Batch truyền quá lớn cũng gây "căng cứng" Overhead memory.

### Cách Khắc Phục
*   **Tăng dung lượng Memory Overhead:** Đây là cách giải quyết trực diện và cơ bản nhất. Tăng tham số `spark.executor.memoryOverhead` lên 15% - 20% dung lượng Executor Memory, hoặc thiết lập giá trị tuyệt đối (ví dụ `spark.executor.memoryOverhead=2048` hoặc `4096`). Nếu dùng Kubernetes, tham số này vô cùng quan trọng.
*   **Chuyển sang Pandas UDF:** Thay thế Python UDF chuẩn bằng `pandas_udf` (Vectorized). Chúng sử dụng Apache Arrow để đẩy dữ liệu dạng cột (columnar) thay vì dạng hàng (row-based), giảm rác overhead serialize.
*   **Ép giảm Arrow Batch Size:** Khi xài Pandas UDF, giới hạn tham số `spark.sql.execution.arrow.maxRecordsPerBatch` (mặc định `10000`) xuống con số an toàn hơn (như `1000`) để khống chế lượng RAM cấp phát cho 1 mẻ truyền.
*   **Hạn chế Python (Dùng Native):** Với tác vụ Data Engineering lõi, nếu có thể, hãy viết UDF bằng Scala/Java và gọi ngược lại qua DataFrame API trong PySpark. Lúc này bộ nhớ hoàn toàn nội khu JVM Heap và tránh rủi ro IPC memory.
*   **Off-Heap Memory tự cấp:** Thử kích hoạt cấu hình để Spark nhận diện sử dụng Off-Heap rõ ràng:
  `spark.memory.offHeap.enabled=true`
  `spark.memory.offHeap.size=2g`

---

## 5. Danh Sách Kiểm Tra Nhanh (Troubleshooting Checklist)
Đừng vội vàng nâng RAM ngay lập tức, tiền cloud của bạn sẽ tăng lên theo cấp số nhân mà ứng dụng rốt cuộc vẫn chết. Hãy tiến hành chẩn đoán theo thứ tự:

1.  **Xác định vùng báo lỗi:** Mở Log / Application Master -> Tìm dòng `java.lang.OutOfMemoryError` hay `Container killed`? Lỗi xảy ra trên Driver node hay Node thực thi?
2.  **Mở Spark UI để soi dữ kiện (Cực kỳ quan trọng):**
    *   **Tab Stages:** Kiểm tra sự chênh lệch (Min, Max, Median) ở cột **Duration** và **Data Read**. Nếu Task Max chạy mất 10 phút với 5GB dữ liệu, trong khi Median chỉ 2 giây và 10MB -> 100% ứng dụng của bạn dính **Data Skew**.
    *   **Tab Executors:** Kiểm tra cột **Task Time (GC Time)**. Nếu dải vạch đỏ của Garbage Collector (GC) dài hơn thời gian tính toán thực (GC chiếm > 10% - 20% thời lượng) -> Executor của bạn không đủ User Memory, liên tục dọn rác, làm lãng phí CPU tài nguyên nghiêm trọng.
    *   **Tab Storage:** Kiểm tra các RDD/DataFrame đang lưu vào cache. Khối lượng cache có lớn hơn 50% Storage Memory không? Có partition nào được cache toàn bộ trên một node không?
3.  **Tối ưu code logic:** Xác định dòng code gọi `action` (count, show, join, groupby) gây tràn bộ nhớ, áp dụng các kỹ thuật như Salting, Repartition, AQE, Unpersist cache.
4.  **Tăng cấu hình hợp lý:** Chỉ sau khi hoàn thành bước tối ưu phần mềm, mới tính đến việc cấp thêm phần cứng RAM và Cores.

---

## Tài Liệu Tham Khảo Mở Rộng
* [Tuning Spark - Apache Spark Official Documentation](https://spark.apache.org/docs/latest/tuning.html)
* [Memory Management in Spark](https://0x0fff.com/spark-memory-management/)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
