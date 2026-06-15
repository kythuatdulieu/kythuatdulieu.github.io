---
title: "Apache Spark: Deep Dive into Unified Memory Management & Data Skew Handling"
description: "Mổ xẻ cơ chế Unified Memory Manager (Execution vs Storage), Spill-to-disk, sự đánh đổi giữa Broadcast Join vs Sort Merge Join và kỹ thuật Salting xử lý Data Skew trong Production."
lastUpdated: 2026-06-15
tags: ["data-engineering", "architecture", "spark"]
---

Trong môi trường phân tán xử lý dữ liệu lớn (Big Data), tài nguyên bộ nhớ (Memory) luôn là điểm nghẽn lớn nhất gây ra hiện tượng thắt cổ chai (bottleneck) và lỗi Out-Of-Memory (OOM). Apache Spark từ phiên bản 1.6 đã giới thiệu Unified Memory Management nhằm giải quyết triệt để các hạn chế của mô hình tĩnh (Static Memory Manager) cũ. Bài viết này sẽ mổ xẻ sâu vào cơ chế quản lý bộ nhớ nội tại, sự đánh đổi thiết kế giữa các chiến lược Join (Broadcast vs Sort Merge), và cách xử lý "ác mộng" Data Skew trong production.

## 1. Bài Toán và Bối Cảnh (The Problem & Context)

Các kỹ sư Data Engineer khi triển khai Spark pipeline trên quy mô Petabyte thường xuyên đối mặt với hai vấn đề chí mạng:
1. **Quản lý bộ nhớ kém hiệu quả:** Spark cần memory cho cả việc tính toán (Execution - như Shuffle, Join, Sort) và lưu trữ cache (Storage). Nếu chia tỷ lệ bộ nhớ một cách cứng nhắc, hệ thống dễ rơi vào tình trạng thiếu memory cho execution nhưng lại dư thừa bên storage (hoặc ngược lại).
2. **Data Skew (Lệch dữ liệu):** Trong thực tế, dữ liệu hiếm khi phân phối đồng đều. Một partition có thể chứa 80% khối lượng dữ liệu do sự phân bổ tự nhiên của business (ví dụ: dữ liệu tập trung vào một thành phố lớn hoặc một khách hàng VIP). Điều này khiến một số ít Task chạy cực kỳ chậm (stragglers), kéo lùi toàn bộ Stage.

## 2. Kiến trúc Hệ thống: Unified Memory Manager (Architecture Deep Dive)

Trước Spark 1.6, bộ nhớ được chia cắt cứng (Static Memory Manager). Bắt đầu từ Spark 1.6+, **Unified Memory Manager** ra đời, cho phép Execution Memory và Storage Memory chia sẻ một không gian chung (unified region).

### Cơ chế chia sẻ bộ nhớ (Execution vs Storage)
Toàn bộ Heap memory của Executor được chia thành các vùng:
- **Reserved Memory:** Thường là 300MB, dành cho Spark internal system.
- **User Memory:** Chiếm khoảng 25% tổng bộ nhớ còn lại, dành cho user data structures, UDFs.
- **Spark Memory (Unified Memory):** Phần còn lại (khoảng 60%), được chia đôi một cách động (dynamically) giữa Storage và Execution.

**Sự tương tác:**
- Nếu Execution cần thêm memory và Storage đang trống, nó có thể mượn memory từ Storage.
- Nếu Storage cần memory và Execution đang trống, nó cũng có thể mượn ngược lại.
- **Cơ chế thu hồi (Eviction):** Tuy nhiên, Execution có quyền ưu tiên cao hơn. Nếu Execution cần bộ nhớ mà nó đã cho Storage mượn trước đó, nó có thể ép Storage phải nhả bộ nhớ (bằng cách xóa các block cache hoặc **Spill-to-disk**). Ngược lại, Storage *không thể* ép Execution nhả bộ nhớ, vì việc ngắt quãng tính toán sẽ làm hỏng task.

### Cơ chế Spill-to-disk
Khi Execution Memory (được sử dụng cho ExternalSorter, Shuffle, Aggregation) vượt quá giới hạn ngay cả khi đã đòi lại không gian từ Storage, Spark bắt buộc phải thực hiện **Spill-to-disk**.
Dữ liệu đang xử lý trên RAM sẽ được ghi tuần tự ra Local Disk của Worker Node, sau đó đọc lại vào bộ nhớ từng phần (chunk) để tiếp tục xử lý.
- **Trade-off:** Spill cứu job khỏi OOM, nhưng cái giá phải trả là chi phí Disk I/O khổng lồ (Serialization/Deserialization + Write/Read), làm tăng Latency lên nhiều lần. Do đó, việc monitor chỉ số Spilled Metrics (Spilled Memory / Spilled Disk) trong Spark UI là yếu tố cốt lõi để tuning pipeline.

## 3. Quyết định Thiết kế và Trade-offs (Design Decisions)

Trong việc kết hợp các tập dữ liệu, Spark Engine cung cấp nhiều thuật toán Join. Quyết định chọn Broadcast Hash Join (BHJ) hay Sort Merge Join (SMJ) phụ thuộc hoàn toàn vào kích thước dữ liệu và tài nguyên network/memory.

### Broadcast Hash Join (BHJ)
Thay vì Shuffle dữ liệu của cả hai bảng (tốn Network I/O), Spark chọn một bảng nhỏ, thu thập nó về Driver, sau đó Broadcast toàn bộ bảng đó đến tất cả các Executor.
- **Thiết kế:** Bảng nhỏ được build thành một Hash Map ngay trong Memory của Executor. Bảng lớn sẽ stream qua và tra cứu (probe) Hash Map này.
- **Trade-offs:** 
  - *Ưu điểm:* KHÔNG có Shuffle. Tốc độ thực thi cực nhanh do tránh được disk I/O và network transfer của bảng lớn.
  - *Nhược điểm:* Đòi hỏi Memory lớn tại Driver và Executor. Nếu bảng Broadcast vượt qua `spark.sql.autoBroadcastJoinThreshold` (mặc định 10MB) hoặc không cẩn thận broadcast bảng quá to, hệ thống sẽ gặp OOM trực tiếp tại Driver hoặc gây ra Driver Timeout.

### Sort Merge Join (SMJ)
Đây là default join strategy của Spark cho các tập dữ liệu lớn. 
- **Thiết kế:** Nó hoạt động qua 3 bước: Shuffle (để các keys giống nhau từ 2 bảng về cùng 1 partition) -> Sort (sắp xếp dữ liệu trong từng partition) -> Merge (duyệt tuần tự qua 2 partition đã sort để ghép nối).
- **Trade-offs:**
  - *Ưu điểm:* Robust và an toàn trước các tập dữ liệu khổng lồ vì nó tận dụng hiệu quả cơ chế Spill-to-disk. Không yêu cầu bảng phải lọt thỏm vào RAM.
  - *Nhược điểm:* Cực kỳ đắt đỏ về mặt CPU (để Sort) và Network/Disk I/O (để Shuffle). Trong một pipeline lớn, quá trình Shuffle luôn là nút thắt cổ chai lớn nhất.

## 4. Những Bài Học Thực Tiễn (Production Lessons Learned)

Data Skew là thảm họa thường trực với Sort Merge Join, khi 99% task chạy xong trong vài phút, nhưng 1% task cuối cùng mất tới hàng giờ đồng hồ do nhận vào khối lượng dữ liệu khổng lồ (các bản ghi có cùng key đổ dồn về một vị trí Shuffle blocks duy nhất).

### Xử lý rủi ro Data Skew bằng Kỹ thuật Salting
Salting là kỹ thuật chia nhỏ các key bị lệch ra nhiều partition khác nhau bằng cách "rắc muối" - tức thêm vào khóa một tiền tố/hậu tố ngẫu nhiên (salt).

**Cách thực hiện:**
1. Khảo sát dữ liệu, phát hiện ra Key gây skew (ví dụ: `null` keys hoặc `user_id = VIP`).
2. **Thêm Salt vào bảng Skew:** Thêm một giá trị ngẫu nhiên từ `1` đến `N` (với N là hệ số phân mảnh) vào Key của bảng lớn. 
   - Ví dụ: `Key` biến thành `Key_1`, `Key_2`, ..., `Key_N`. Lúc này khối lượng của Key gốc được chia nhỏ ra N node khác nhau.
3. **Replicate bảng bình thường (Bảng nhỏ hơn/Bảng không Skew):** Không thể thêm random cho bảng này vì sẽ làm mất tính toàn vẹn khi join. Ta phải nhân bản (explode) mỗi row của bảng này lên `N` lần, đính kèm hậu tố tương ứng từ `1` đến `N`.
4. Thực hiện Join trên cột `Salted_Key` mới.

**Trade-offs của Salting:**
- Ta giải quyết được Data Skew triệt để, dàn đều tải cho tất cả các Executor. Biến một task khổng lồ dễ dính OOM thành N task nhỏ chạy song song mượt mà.
- Bù lại, kích thước của bảng không Skew bị nhân lên `N` lần. Đây là sự đánh đổi kinh điển: Chủ động tăng nhẹ khối lượng dữ liệu (Data Volume) thông qua việc Replicate để đổi lấy sự phân phối tính toán đồng đều (Compute Parallelism), mang lại thời gian thực thi cuối cùng (SLA) ổn định hơn.

*(Lưu ý: Từ Spark 3.0+, tính năng Adaptive Query Execution (AQE) đã có khả năng tự động tách và xử lý các Skewed Partitions (dynamically handling skew), tuy nhiên việc nắm vững triết lý Salting vẫn là kỹ năng sinh tồn của Data Engineer khi tuning ở tầm thấp).*

## Tài liệu Tham khảo
1. **[Databricks Engineering Blog: Project Tungsten and Memory Management](https://databricks.com/blog/2015/04/28/project-tungsten-bringing-spark-closer-to-bare-metal.html):** Bối cảnh tối ưu hệ thống và nền tảng của quản lý bộ nhớ hiện đại trong Spark.
2. **[Databricks: Unified Memory Management in Spark 1.6](https://databricks.com/blog/2016/05/11/spark-2-0-technical-preview-easier-faster-and-smarter.html):** Phân tích cơ chế Execution mượn Storage memory và giới hạn của thiết kế cũ (Dựa trên JIRA SPARK-10000).
3. **[Spark SQL Performance Tuning Guide](https://spark.apache.org/docs/latest/sql-performance-tuning.html):** Tài liệu chính thức từ Apache Spark về cấu hình Join strategy, cách hoạt động của Adaptive Query Execution (AQE) đối với Skew Join.
