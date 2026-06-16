---
title: "Spark Tungsten Engine"
difficulty: "Advanced"
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Spark Tungsten Engine - Data Engineering Deep Dive"
metaDescription: "Tìm hiểu kiến trúc lõi của Project Tungsten: Tối ưu hoá Memory Management, Cache-aware Computation và Whole-Stage Code Generation để vượt qua giới hạn của JVM."
description: "Tối ưu hoá Memory Management và Code Generation để vượt qua giới hạn của JVM, tối đa hóa hiệu suất CPU và bộ nhớ trong Apache Spark."
---



Tungsten Engine là cỗ máy thực thi tính toán và quản lý bộ nhớ ở cấp độ phần cứng (Hardware-level) của Apache Spark. Được Databricks giới thiệu từ phiên bản Spark 1.4 dưới tên gọi **Project Tungsten**, nó đánh dấu một cuộc đại tu lớn nhất trong lịch sử kiến trúc thực thi của nền tảng này. Thay vì phụ thuộc vào cách trình dọn rác (Garbage Collection - GC) và cách lưu trữ object truyền thống của Java/Scala, Tungsten quản lý bộ nhớ một cách độc lập bằng cách thao tác trực tiếp với byte và sinh code (Code Generation) trong thời gian thực. Những điều này giúp Spark đẩy hiệu suất của CPU và bộ nhớ (Memory) đến cực hạn.

---

## 1. Tại Sao Cần Project Tungsten? (Sự Dịch Chuyển Của Nút Thắt)



Trước khi Project Tungsten ra đời, cộng đồng Data Engineering thường mặc định cho rằng nút thắt cổ chai (bottleneck) của các hệ thống xử lý Big Data như Hadoop MapReduce hay Spark đời đầu (dựa trên RDD) luôn nằm ở **Disk I/O** (tốc độ đọc/ghi đĩa) hoặc **Network I/O** (truyền dữ liệu qua mạng). 

Tuy nhiên, với sự phát triển nhanh chóng của phần cứng (như sự phổ biến của ổ cứng SSD tốc độ cao, mạng nội bộ 10Gbps/100Gbps) và các định dạng lưu trữ dữ liệu dạng cột ưu việt (Parquet, ORC với độ nén cao), Disk/Network I/O không còn là giới hạn lớn nhất nữa. Databricks nhận ra rằng nút thắt mới chính là **CPU và Memory (RAM)**. Nguyên nhân chủ yếu xuất phát từ hạn chế của Java Virtual Machine (JVM):

*   **Object Overhead (Sự phình to của Java Object):** Việc lưu trữ dữ liệu dạng Java object là cực kỳ tốn kém. Ví dụ, một chuỗi string đơn giản chứa 4 ký tự ("abcd" - 4 bytes) trong Java có thể chiếm đến 48 bytes trong RAM do đi kèm với các header (thông tin định danh) của đối tượng JVM.
*   **Garbage Collection (GC) Overhead:** Trong quá trình phân tích hàng tỷ bản ghi dữ liệu, Spark phải liên tục tạo mới và hủy bỏ hàng tỷ Java Object. Việc này tạo áp lực khổng lồ lên bộ thu dọn rác (Garbage Collector) của JVM. Khi GC tiến hành dọn dẹp, nó thường phải thực hiện thao tác "Stop-The-World" - làm ngưng trệ toàn bộ tiến trình ứng dụng, dẫn đến thông lượng (throughput) giảm nghiêm trọng, đôi khi làm ứng dụng "treo" giả.

Project Tungsten được ra đời để vượt qua những rào cản kỹ thuật này, đưa quá trình tính toán của Spark tiến gần nhất có thể đến hiệu năng của phần cứng vật lý (bare-metal performance).

---

## 2. Ba Trụ Cột Chính Của Tungsten Engine

Tungsten thay đổi cách Spark thực thi SQL và DataFrame/Dataset thông qua ba yếu tố cốt lõi:

### 2.1. Quản Lý Bộ Nhớ và Xử Lý Nhị Phân (Memory Management and Binary Processing)

Tungsten tự triển khai một trình quản lý bộ nhớ riêng, tránh được sự can thiệp của JVM.

*   **Custom Memory Layout (UnsafeRow):** Dữ liệu không còn được biến thành các Object của Java (`Integer`, `String`, v.v.). Thay vào đó, Tungsten tổ chức dữ liệu thành các khối nhị phân thô (binary format). Spark giới thiệu cấu trúc `UnsafeRow`, thực chất chỉ là con trỏ chỉ vào một mảng byte thuần túy.
*   **Off-heap Memory:** Thông qua API `sun.misc.Unsafe` của Java (cho phép truy cập trực tiếp bộ nhớ giống như `malloc` trong ngôn ngữ C/C++), Spark có thể cấp phát trực tiếp bộ nhớ Off-heap (nằm ngoài không gian quản lý của JVM Heap).
    *   Giúp Spark tránh hoàn toàn sự quét và dọn rác của Garbage Collector đối với khối dữ liệu thực tế này.
    *   Hạn chế rủi ro Out-Of-Memory (OOM) do rác ứ đọng chưa kịp dọn.
*   **Binary Processing (Tính toán trên dữ liệu nhị phân):** Tungsten có thể tiến hành các phép toán (ví dụ: so sánh Hash, Filter) trực tiếp lên các dải byte nhị phân thô này. Nó hoàn toàn bỏ qua bước giải nén ngược (deserialize) ra Java object. Việc này tiết kiệm được một lượng lớn chu kỳ xử lý của CPU.

### 2.2. Tính Toán Nhận Thức Cache (Cache-aware Computation)

Tốc độ của CPU quá nhanh so với tốc độ của RAM. CPU phải liên tục chờ đợi dữ liệu từ RAM được đưa lên. Để khắc phục, CPU sử dụng bộ nhớ đệm nội bộ: L1, L2, L3 Cache (tốc độ truy cập của L1 cache là ~0.5ns, trong khi truy xuất từ RAM lên đến ~100ns). Tuy nhiên, nếu dữ liệu nằm rải rác lộn xộn trong bộ nhớ (đặc trưng của Java Objects khi liên kết qua con trỏ tham chiếu), CPU sẽ gặp hiện tượng **Cache Miss** và bị ép phải nạp dữ liệu liên tục từ RAM.

Tungsten giải quyết bài toán Data Locality bằng các cấu trúc dữ liệu thân thiện với Cache CPU:
*   **Ví dụ với Cache-aware Sort/Hash:** Thay vì chứa một danh sách gồm các bản ghi trỏ tới nhiều vùng nhớ lung tung, Tungsten sử dụng một mảng con trỏ 8-byte (Pointer Array) được cấp phát liền kề nhau. Mỗi phần tử 8-byte trong mảng sẽ dùng 4-byte đầu lưu trữ *tiền tố của khóa* (Key Prefix - như một vài ký tự đầu của string), 4-byte sau lưu trữ địa chỉ của toàn bộ bản ghi dữ liệu. 
*   Khi thực hiện thao tác sắp xếp (Sorting), CPU có thể load liền một lúc mảng con trỏ này vào L1/L2 Cache và tiến hành so sánh trực tiếp các tiền tố `Key Prefix`. Rất nhiều thao tác so sánh có thể ngã ngũ ngay tại bước này mà không cần truy xuất tới dữ liệu đầy đủ. Nhờ đó hạn chế tối đa Cache miss.

### 2.3. Whole-Stage Code Generation (Sinh Code Toàn Cục)

Spark trước đây (cũng giống như nhiều engine Database lâu đời) sử dụng mô hình **Volcano Iterator Model**. Mỗi toán tử (như `Filter`, `Project`, `Aggregate`) là một Class/Object độc lập. Quá trình di chuyển dữ liệu qua các toán tử này đòi hỏi liên tục gọi các hàm `next()`. Điều này sinh ra một lượng khổng lồ các lời gọi hàm ảo (Virtual Function Calls), tốn kém chi phí chuyển ngữ cảnh (context switch) và làm CPU không thể tối ưu hóa quy trình đẩy luồng (Pipelining).

**Whole-Stage Code Generation** (áp dụng từ Spark 2.0) là giải pháp tối thượng:
*   Thay vì gọi `next()` theo chuỗi rời rạc, Tungsten hợp nhất toàn bộ các bước xử lý (Pipeline) của một đoạn Physical Plan thành **một hàm Java (Single Function) khổng lồ**.
*   Spark sử dụng compiler nội bộ siêu nhanh tên là **Janino** để biên dịch động (compile dynamically) hàm này thành bytecode chạy trên JVM trực tiếp ở thời gian chạy (Runtime).
*   Đoạn code do Tungsten sinh ra hoạt động như một vòng lặp `for-loop` được viết thủ công bằng ngôn ngữ C++ cực kỳ tinh gọn, giúp loại bỏ mọi virtual calls rườm rà. Dữ liệu nhờ vậy được "nhốt" trong các thanh ghi (Registers) của CPU càng lâu càng tốt để xử lý triệt để trước khi bị ghi trả xuống bộ nhớ.

*(Ví dụ: Một câu truy vấn `SELECT count(*) FROM table WHERE age > 20` thay vì chạy qua 3 node ảo Scan -> Filter -> Aggregate, giờ đây Tungsten "viết" lại thành một vòng lặp for quét qua mảng nhị phân, kiểm tra giá trị int của age, và cộng gộp biến count đếm tổng).*

---

## 3. Cấu Trúc Trỏ Trang Bộ Nhớ (Tungsten Memory Layout)

Mô hình cấp phát bộ nhớ của Tungsten rất giống cách Hệ điều hành phân trang bộ nhớ ảo (OS Virtual Memory Page):

1.  **Memory Page:** Thay vì cấp phát từng object rời rạc, bộ nhớ được cấp phát theo từng khối lớn (Page).
2.  **64-bit Address Pointer:** Bất kỳ phần dữ liệu nào do Tungsten quản lý đều được tham chiếu đến thông qua một con trỏ 64-bit.
    *   `13-bit` đầu tiên chứa Page Number (Số hiệu của trang nhớ).
    *   `51-bit` tiếp theo chứa phần Offset (Độ dời vị trí của dữ liệu trong trang nhớ đó).
3.  Cơ chế này linh hoạt quản lý hàng trăm triệu mẩu dữ liệu nhỏ bên trong các "trang" bằng các phép tính toán bit cực nhanh mà không tạo ra thêm bất kỳ Object Java mới nào.

---

## 4. Sự Tương Khắc và Tương Trợ Với Catalyst Optimizer

Tungsten không hoạt động độc lập mà là "đôi bạn cùng tiến" với **Catalyst Optimizer**:
*   Catalyst Optimizer đóng vai trò như bộ não chiến lược, phân tích câu truy vấn SQL/DataFrame để lập ra **Kế hoạch Thực thi Mức Vật Lý (Physical Plan)** tối ưu nhất (ví dụ: Quyết định dùng Hash Join hay Sort Merge Join, đẩy Filter xuống cấp nguồn dữ liệu).
*   Khi có Physical Plan tốt, Tungsten Engine sẽ đóng vai trò như "cơ bắp", bắt tay vào **Code Generation** dựa trên kế hoạch đó và thực hiện thao tác nhào nặn lên các dải byte.

**Lưu ý cực kỳ quan trọng:** Tungsten CHỈ hoạt động khi Spark nắm rõ cấu trúc dữ liệu của bạn (Schema). Điều này có nghĩa Tungsten chỉ được kích hoạt khi bạn dùng API **DataFrame, Dataset** hoặc **Spark SQL**. Nếu bạn dùng API cổ điển như **RDD**, Spark không hiểu rõ kiểu dữ liệu bên trong các object tùy chỉnh của bạn, do đó Tungsten không thể sinh code tối ưu và bạn sẽ không nhận được lợi ích tăng tốc độ nào.

---

## 5. Giám Sát và Cấu Hình Tungsten

Kể từ Spark 1.5, Tungsten được kích hoạt mặc định. Tuy nhiên, dưới đây là một số cấu hình hữu ích để kiểm soát hoặc tinh chỉnh:

*   **`spark.sql.codegen.wholeStage`** (Mặc định: `true`): Cho phép bật/tắt tính năng Whole-Stage Code Generation. Chỉ nên tắt để debug lỗi.
*   **`spark.memory.offHeap.enabled`** (Mặc định: `false`): Cho phép Tungsten sử dụng bộ nhớ Off-heap (thay vì On-heap `long[]` arrays). Việc này giúp giảm tải hoàn toàn GC. Tuy nhiên, khi bật, bạn phải khai báo kèm theo cấu hình kích thước thông qua tham số bên dưới.
*   **`spark.memory.offHeap.size`**: Định mức dung lượng bộ nhớ Off-heap tối đa mà Tungsten có thể yêu cầu, ví dụ `2g` hoặc `4g`.
*   **Xem Source Code do Tungsten tự động viết:** Bạn có thể xem trực tiếp đoạn mã Java "khủng" mà Tungsten sinh ra trong quá trình chạy bằng cách gọi phương thức: `df.queryExecution.debug.codegen()`.
*   **Trên giao diện Spark UI (Tab SQL):** Bạn sẽ dễ dàng nhận thấy các hộp chữ có dấu sao `*` đứng trước các toán tử (ví dụ: `*Filter`, `*SortMergeJoin`). Các bước có dấu sao chung màu nền nghĩa là chúng đã được gộp lại (fused) thành một đoạn mã duy nhất thông qua cơ chế Whole-Stage Code Generation.

---

## Tóm Lược

Project Tungsten là cốt lõi công nghệ biến Apache Spark trở thành một siêu cỗ máy xử lý Big Data hiện đại. Nhờ tối ưu hóa ở mức độ sát với phần cứng như quản lý phân trang nhị phân, cấu trúc thân thiện với L1/L2 Cache, và biên dịch mã thời gian thực thành một hàm duy nhất, Tungsten vượt xa giới hạn của hệ sinh thái JVM cổ điển. Đối với người kỹ sư dữ liệu (Data Engineer), hiểu về Tungsten là cơ sở vững chắc nhất để chuyển đổi tư duy từ viết RDD truyền thống sang sử dụng hoàn toàn **DataFrame/Dataset** nhằm đạt thông lượng (throughput) dữ liệu lớn nhất.

## Tài Liệu Tham Khảo

*   [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
*   [Project Tungsten: Bringing Apache Spark Closer to Bare Metal - Databricks](https://databricks.com/blog/2015/04/28/project-tungsten-bringing-spark-closer-to-bare-metal.html)
*   [Deep Dive into Spark SQL's Catalyst Optimizer - Databricks](https://databricks.com/blog/2015/04/13/deep-dive-into-spark-sqls-catalyst-optimizer.html)
*   **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
*   [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
