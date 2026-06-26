---
title: "Deep Dive: Adaptive Query Execution (AQE)"
difficulty: "Advanced"
readingTime: "20 mins"
lastUpdated: 2026-06-26
seoTitle: "Spark AQE (Adaptive Query Execution): Runtime Physical Plan Optimization"
metaDescription: "Kiến trúc và vòng đời hoạt động của Adaptive Query Execution (AQE) trong Spark. Cách AQE xử lý Data Skew, gom nhóm partition và chuyển đổi Join Strategy tự động."
description: "Spark AQE chấm dứt thời đại phải tune tay hàng chục thông số. Bằng cách chèn các vòng phản hồi (feedback loop) tại ranh giới Shuffle, AQE định hình lại Kế hoạch Vật lý (Physical Plan) ngay tại thời gian chạy (Runtime)."
---

Trước Apache Spark 3.x, Catalyst Optimizer thực hiện tối ưu hóa hoàn toàn tĩnh (Static Optimization). Hệ thống dựa trên số liệu thống kê thu thập từ trước (Cost-Based Optimizer - CBO) để lên Kế hoạch Thực thi Vật lý (Physical Execution Plan). Nhưng "kế hoạch trên giấy" hiếm khi sống sót qua thực tế chiến trường.

Việc dữ liệu phình to sau một hàm UDF (User-Defined Function) hay bị thu hẹp đột ngột sau bước `Filter` khiến các chiến lược được dự tính (như `SortMergeJoin`) trở thành thảm họa I/O. **Adaptive Query Execution (AQE)** thay đổi luật chơi bằng cách thu thập *Runtime Statistics* và thay đổi Kế hoạch Thực thi ngay giữa chừng.

## 1. Cơ Chế Bắt Nhịp Của AQE (Materialization Points)

AQE không can thiệp vào giữa một Task đang chạy. Thay vào đó, nó tận dụng ranh giới tự nhiên của các Stage trong kiến trúc Spark: **Ranh giới Shuffle (Shuffle Boundaries)**.

Khi dữ liệu được tính toán xong ở Map-side và Spill xuống đĩa (Shuffle Write), Spark gọi đây là một **Điểm chốt dữ liệu (Materialization Point)**. Tại khoảnh khắc này, kích thước chính xác của từng partition đã được biết rành mạch.

```mermaid
graph TD
    A["Start Stage 1"] --> B("Map Tasks Execute")
    B --> C{"Materialization Point \n("Shuffle Write")}
    C -->|Feed Exact Stats| D["AQE Framework"]
    D --> E("Catalyst: Re-optimize Logical Plan")
    E --> F("Catalyst: Generate New Physical Plan")
    F --> G["Submit Stage 2 with New Plan"]
```

![AQE Architecture Diagram](/images/4-compute-engines-batch/aqe-framework.png)
*Kiến trúc luồng dữ liệu của AQE phản hồi số liệu trở lại Catalyst Optimizer tại ranh giới Shuffle. (Nguồn: Databricks)*

## 2. Các Đòn Bẩy Hệ Thống Của AQE

AQE cung cấp 3 tính năng cốt lõi giải quyết triệt để 3 cơn ác mộng lớn nhất của Data Engineers.

### 2.1. Gom Phân Vùng Động (Dynamically Coalescing Shuffle Partitions)

**Trade-off cũ:** Nếu `spark.sql.shuffle.partitions` quá lớn (VD: 10,000) nhưng dữ liệu thực tế ít, Spark sẽ sinh ra 10,000 file lắt nhắt (Small files problem). Hệ thống tốn I/O Scheduling khổng lồ chỉ để điều phối 10,000 tasks xử lý vài KB. Nếu quá nhỏ, Task bị phình to gây OOM.

**Cách AQE giải quyết:** 
Bạn cứ mạnh dạn set `spark.sql.shuffle.partitions` thật lớn ở mức khởi tạo (Initial Number). Khi Shuffle Write hoàn tất, AQE gom các partition liền kề (Coalesce) có kích thước nhỏ lại với nhau sao cho tiệm cận mức `spark.sql.adaptive.advisoryPartitionSizeInBytes` (mặc định 64MB). Số lượng Reduce Task giảm xuống một mức hoàn hảo mà không đòi hỏi bất kỳ công sức tuning thủ công nào.

### 2.2. Chuyển Đổi Kế Hoạch Join (Dynamically Switching Join Strategies)

**Vấn đề:** Catalyst Optimizer lên kế hoạch `SortMergeJoin` (SMJ) vì bảng A và B đều lớn (hàng chục GB). Tuy nhiên, Stage 1 của bảng B có một phép `filter(col('date') == '2026-01-01')`. Sau khi Stage 1 chạy xong, bảng B thực tế chỉ còn vỏn vẹn 5MB. Nếu Spark tiếp tục dùng SMJ, nó sẽ lãng phí hàng giờ cho thao tác Shuffle Network và Sort.

**Hành động của AQE:**
Ngay tại ranh giới Shuffle, AQE nhận ra bảng B chỉ còn 5MB (< `spark.sql.autoBroadcastJoinThreshold` mặc định 10MB). AQE lập tức "hủy bỏ" kế hoạch SMJ. Kế hoạch vật lý được bẻ lái sang **Broadcast Hash Join (BHJ)**. Bảng B 5MB được đẩy lên Driver và Broadcast thẳng xuống bộ nhớ (RAM) của tất cả Executors đang chứa bảng A. Network I/O Shuffle của bảng A được triệt tiêu hoàn toàn.

### 2.3. Cứu Nguy Skew Join Động (Dynamically Optimizing Skew Joins)

Data Skew (dữ liệu lệch đổ dồn về một vài Key) là nguyên nhân số 1 gây ra hiện tượng *Straggler Tasks* (1 task chạy 3 tiếng trong khi 99 task khác chạy 3 phút xong). 

Thường các Engineer phải dùng thủ thuật **Salting** (thêm khóa ngẫu nhiên) để chia để trị. Với AQE, việc này là tự động:
1. AQE quét số liệu Shuffle Write, nếu một Partition có dung lượng lớn hơn `skewedPartitionFactor` (mặc định 5 lần) so với trung vị và lớn hơn `skewedPartitionThresholdInBytes` (256MB), nó dán nhãn **Skew**.
2. AQE xẻ (Split) Partition bị nghiêng bên bảng A thành $N$ phần nhỏ bằng nhau.
3. Đồng thời, AQE nhân bản (Replicate) Partition tương ứng ở bảng B thành $N$ bản sao.
4. $N$ task mới được lập lịch để thực hiện Join cục bộ giữa mảnh nhỏ của A và bản sao của B.

OOMKilled bị đánh bại hoàn toàn mà không cần sửa một dòng code SQL nào.

## 3. Rủi Ro Vận Hành & Fallbacks: AQE Demote Broadcast Hash Join

Có những rủi ro khi CBO tĩnh đánh giá một bảng là nhỏ gọn (dưới 10MB) và quyết định dùng Broadcast Hash Join ngay từ đầu. Tuy nhiên, khi truy vấn chạy thực tế (runtime), bảng này có thể giãn nở (Decompress ratio) hoặc bị nghiêng cực độ khiến bộ nhớ của Driver và Executor vượt quá giới hạn (Broadcast Timeout / Driver OOM).

Từ Spark 3.2+, AQE hỗ trợ tính năng **Demote Broadcast Hash Join**. Ngay tại Shuffle boundary, nếu AQE phát hiện bảng vượt quá ngưỡng dung lượng an toàn thực tế, nó sẽ chủ động *Hạ cấp* kế hoạch từ BHJ về lại SMJ để tránh làm Crash cụm máy chủ, đặt tính toàn vẹn (Availability) lên trên tốc độ (Latency).

## 4. Những Góc Khuất Của AQE (Limitations)

- **Không hỗ trợ Streaming:** Bản chất AQE đòi hỏi việc *tạm dừng* (Pause) tại các điểm chốt dữ liệu để phân tích. Với Structured Streaming (xử lý Micro-batch vài ms), độ trễ do việc tạm dừng để Re-optimize là không thể chấp nhận được.
- **Skew Trong Một Bản Ghi (Row-Level Skew):** AQE cắt Skew ở cấp độ Partition. Nếu Skew xảy ra do *một dòng dữ liệu duy nhất* (Ví dụ một JSON mảng khổng lồ nặng 2GB), AQE vô dụng. Máy nghiền I/O vẫn sẽ làm sập Executor chứa dòng đó.

## Nguồn Tham Khảo (References)
- [Adaptive Query Execution: Speeding Up Spark SQL at Runtime - Databricks](https://www.databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
- [Spark SQL Guide: Adaptive Query Execution](https://spark.apache.org/docs/latest/sql-performance-tuning.html#adaptive-query-execution)
- Uber Engineering Blog, *Troubleshooting Adaptive Query Execution in Spark 3*.
