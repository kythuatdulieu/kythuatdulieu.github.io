---
title: "Deep Dive: Adaptive Query Execution (AQE)"
difficulty: "Advanced"
readingTime: "30 mins"
lastUpdated: 2026-06-29
seoTitle: "Spark AQE (Adaptive Query Execution): Runtime Physical Plan Optimization"
metaDescription: "Kiến trúc và vòng đời hoạt động của Adaptive Query Execution (AQE) trong Spark. Cách AQE xử lý Data Skew, gom nhóm partition và chuyển đổi Join Strategy tự động."
description: "Spark AQE chấm dứt thời đại phải tune tay hàng chục thông số. Bằng cách chèn các vòng phản hồi (feedback loop) tại ranh giới Shuffle, AQE định hình lại Kế hoạch Vật lý (Physical Plan) ngay tại thời gian chạy (Runtime)."
---

Trước Apache Spark 3.x, Catalyst Optimizer thực hiện tối ưu hóa hoàn toàn tĩnh (Static Optimization). Hệ thống dựa trên số liệu thống kê thu thập từ trước (Cost-Based Optimizer - CBO) để lên Kế hoạch Thực thi Vật lý (Physical Execution Plan) trước khi bất kỳ một Task nào thực sự chạy. Nhưng "kế hoạch trên giấy" hiếm khi sống sót qua thực tế chiến trường.

Việc dữ liệu phình to sau một hàm UDF [User-Defined Function] hay bị thu hẹp đột ngột sau bước `Filter` khiến các chiến lược được dự tính (như `SortMergeJoin`) trở thành thảm họa I/O. **Adaptive Query Execution (AQE)** thay đổi luật chơi bằng cách thu thập *Runtime Statistics* và thay đổi Kế hoạch Thực thi ngay giữa chừng. Trong các hệ sinh thái như Databricks và Uber, AQE đã trở thành tiêu chuẩn vàng để tự động hóa việc tuning hiệu năng Spark cho hàng vạn Job ETL quy mô Petabyte.

## 1. Cơ Chế Bắt Nhịp Của AQE (Materialization Points)

AQE không can thiệp vào giữa một Task đang chạy. Thay vào đó, nó tận dụng ranh giới tự nhiên của các Stage trong kiến trúc phân tán của Spark: **Ranh giới Shuffle (Shuffle Boundaries)**. 

Khi dữ liệu được tính toán xong ở Map-side và Spill xuống đĩa (Shuffle Write), Spark gọi đây là một **Điểm chốt dữ liệu (Materialization Point)**. Tại khoảnh khắc này, kích thước chính xác của từng partition đã được biết rành mạch. Dữ liệu thực tế này được gửi ngược về cho Catalyst Optimizer để nó có thể đánh giá lại và đưa ra một Kế hoạch Vật lý (Physical Plan) mới tốt hơn cho các Stage tiếp theo.

![Adaptive Query Execution Architecture](/images/4-compute-engines-batch/aqe-framework.png)
*Kiến trúc luồng dữ liệu của AQE phản hồi số liệu trở lại Catalyst Optimizer tại ranh giới Shuffle. (Nguồn: Databricks)*

Quy trình hoạt động cốt lõi của vòng phản hồi AQE:
1. **Lên kế hoạch sơ bộ (Initial Planning):** Spark tạo một kế hoạch thực thi ban đầu dựa trên CBO tĩnh (nếu có).
2. **Thực thi đến ranh giới Shuffle:** Các task của Stage đầu tiên chạy, tiến hành Local Reduce và ghi dữ liệu ra đĩa (Shuffle Write).
3. **Phản hồi số liệu (Feedback Loop):** Kích thước dữ liệu và số bản ghi chính xác của mọi Partitions được thu thập và báo cáo về Spark Driver.
4. **Tối ưu hóa lại (Re-optimization):** Catalyst dùng thông tin mới cực kỳ chính xác này để điều chỉnh kế hoạch (ví dụ đổi thuật toán Join, gộp phân vùng, xử lý Skew).
5. **Tiếp tục thực thi:** Stage tiếp theo chạy với kế hoạch đã được "thay máu" hoàn toàn tối ưu.

## 2. Các Tính Năng Cốt Lõi Của AQE

AQE cung cấp 3 tính năng cốt lõi giải quyết triệt để 3 cơn ác mộng lớn nhất của Data Engineers. Việc bật AQE rất đơn giản thông qua cấu hình trong `spark-defaults.conf`.

### Cấu hình kích hoạt AQE
```yaml
# spark-defaults.conf
# Khởi động tính năng AQE từ Spark 3.x
spark.sql.adaptive.enabled true

# Kích hoạt 3 công năng cốt lõi của AQE
spark.sql.adaptive.coalescePartitions.enabled true
spark.sql.adaptive.skewJoin.enabled true
spark.sql.adaptive.localShuffleReader.enabled true
```

### 2.1. Gom Phân Vùng Động (Dynamically Coalescing Shuffle Partitions)

**Trade-off cũ:** Khi sử dụng Spark trước đây, Engineer thường phải đau đầu thiết lập thông số `spark.sql.shuffle.partitions` (mặc định quá nhỏ là 200). Nếu đặt cấu hình này quá lớn (VD: 10,000) nhưng dữ liệu thực tế lọc ra lại ít, Spark sẽ sinh ra 10,000 file lắt nhắt (Small files problem). Hệ thống tốn Overhead khổng lồ cho I/O Scheduling chỉ để điều phối 10,000 tasks xử lý vài KB dữ liệu. Ngược lại, nếu đặt quá nhỏ (VD: 50), Task bị phình to (Fat Task) gây Garbage Collection (GC) tồi tệ và OOM (Out Of Memory).

**Cách AQE giải quyết:** 
Bạn cứ mạnh dạn set `spark.sql.shuffle.partitions` thật lớn ở mức khởi tạo (Ví dụ: 8192). Khi Shuffle Write hoàn tất, AQE tự động gom các partition liền kề (Coalesce) có kích thước nhỏ lại với nhau sao cho tiệm cận mức dung lượng an toàn `spark.sql.adaptive.advisoryPartitionSizeInBytes` (mặc định 64MB). 

Số lượng Reduce Task giảm xuống một mức hoàn hảo mà không đòi hỏi bất kỳ công sức tuning thủ công mệt mỏi nào.

```sql
-- Ví dụ truy vấn SQL được AQE tối ưu gom nhóm
SELECT date, count(1) AS total_events
FROM events_table 
GROUP BY date;
```
Trong truy vấn trên, dù `shuffle.partitions = 8192`, nhưng nếu `events_table` chỉ có 1GB dữ liệu output sau khi Group By, AQE sẽ phân tích runtime stats và gom chúng lại thành khoảng 16 phân vùng (1024MB / 64MB) để xử lý hiệu quả nhất cho bước ghi đĩa ở Sink.

### 2.2. Chuyển Đổi Kế Hoạch Join (Dynamically Switching Join Strategies)

**Vấn đề:** Catalyst Optimizer lên kế hoạch sử dụng `SortMergeJoin` (SMJ) vì bảng A và B ban đầu (khi chưa chạy lệnh lọc) đều lớn (hàng chục GB). Tuy nhiên, Stage 1 của bảng B có một phép `filter(col('date') == '2026-01-01')`. Do CBO tính toán sai hoặc Metadata Catalog không có Histogram cập nhật, nó vẫn lầm tưởng bảng B sau filter rất lớn. Thực tế bảng B chỉ còn vỏn vẹn 5MB. Nếu Spark tiếp tục ngoan cố dùng SMJ, nó sẽ lãng phí hàng giờ cho thao tác Shuffle Network và Sort Disk không cần thiết.

**Hành động của AQE:**
Ngay tại ranh giới Shuffle, AQE đo đạc lại và nhận ra bảng B chỉ còn 5MB (< ngưỡng `spark.sql.autoBroadcastJoinThreshold` mặc định 10MB). AQE lập tức "hủy bỏ" kế hoạch SMJ. Kế hoạch vật lý được bẻ lái thần tốc sang **Broadcast Hash Join (BHJ)**. Bảng B 5MB được thu hồi đẩy lên bộ nhớ của Driver và Broadcast thẳng xuống vùng RAM của tất cả Executors đang chứa bảng A. Toàn bộ chi phí Network I/O Shuffle siêu đắt đỏ của bảng A khổng lồ được triệt tiêu hoàn toàn.

### 2.3. Cứu Nguy Skew Join Động (Dynamically Optimizing Skew Joins)

Data Skew (dữ liệu lệch đổ dồn về một vài Key cụ thể) là nguyên nhân số 1 gây ra hiện tượng *Straggler Tasks* trong lập trình phân tán (1 task kẹt lại chạy 3 tiếng trong khi 99 task khác chạy 3 phút đã xong). 

Thường các Engineer phải dùng thủ thuật **Salting** (thêm khóa ngẫu nhiên) để chia để trị, làm SQL logic trở nên cực kỳ phức tạp và dơ. Với AQE, việc chia để trị diễn ra trong bóng tối tự động:

1. AQE quét số liệu Shuffle Write, nếu một Partition có dung lượng lớn hơn `skewedPartitionFactor` (mặc định 5 lần) so với dung lượng trung vị và lớn hơn `skewedPartitionThresholdInBytes` (256MB), nó dán nhãn **Skew Partition**.
2. AQE xẻ (Split) Partition bị nghiêng bên bảng A thành $N$ phần nhỏ bằng nhau.
3. Đồng thời, AQE nhân bản (Replicate) Partition tương ứng ở bảng B thành $N$ bản sao.
4. $N$ task mới được lập lịch độc lập để thực hiện Join cục bộ giữa mảnh nhỏ của A và bản sao của B, giải tỏa nút thắt cổ chai.

**Code ví dụ mô phỏng Data Skew trong Spark SQL:**
```sql
-- Join giữa một bảng Transaction lớn bị lệch (rất nhiều giao dịch ở store_id = 1, ví dụ gian hàng quốc gia) và bảng Store
SELECT t.*, s.store_name 
FROM transactions t
JOIN stores s ON t.store_id = s.store_id;
```
Với sự hiện diện của AQE, nỗi lo OOMKilled do Data Skew bị đánh bại hoàn toàn mà kỹ sư Data không cần phải bận tâm sửa một dòng code SQL nào.

## 3. Ứng Dụng Thực Tế Tại Các Big Tech

### Databricks Architecture Context
Trong kiến trúc Databricks Lakehouse, lớp AQE nằm giữa **Query Optimizer** (Catalyst) và **Distributed Scheduler**. Hơn thế nữa, AQE được tích hợp sâu vào *Photon Engine* (Native vectorized engine viết bằng C++ của Databricks). Việc này giúp Photon chạy các Fragment của Query Plan nhanh hơn, đẩy nhanh các toán tử, đồng thời tận dụng thuật toán tự động đổi Join Strategy của AQE mà không bắt người dùng phải cung cấp các *Query Hints* rối rắm trong code. Sự kết hợp giữa Photon và AQE giúp Databricks đè bẹp các hệ thống xử lý Data Warehouse truyền thống về mặt Benchmarks.

### Uber Architecture Context
Uber vận hành hàng trăm ngàn ứng dụng Spark quy mô Exabyte mỗi ngày. Việc đảm bảo mọi Engineer đều tận dụng tốt AQE là bất khả thi nếu quản lý lỏng lẻo. Uber áp dụng 2 chiến lược kiến trúc:
- **Spark-as-a-Service (uSCS):** Uber sử dụng nền tảng nội bộ này để trừu tượng hóa (abstract) hạ tầng, gói trọn mọi cấu hình chuẩn của AQE cho hàng vạn Data Scientist mà không cần họ phải tự setting.
- **Spark Analysers:** Không phải ai cũng hiểu giới hạn của AQE. Uber phát triển hệ thống *Spark Analysers* bằng cách lắng nghe các gói `SparkListenerEvent`. Hệ thống tự động phân tích (dựa trên Flink Streaming) xem Job nào đang gặp hiện tượng Skew quá quắt mà AQE bó tay (ví dụ: Row-level Skew). Sau đó, nó tự động gửi Report/Alert Slack hướng dẫn người dùng sửa code triệt để các Anti-patterns.

## 4. Triển Khai Hạ Tầng Cho Spark AQE (Infrastructure as Code)

Để đảm bảo hệ thống có đủ Memory cho AQE hoạt động linh hoạt (đặc biệt là tính năng Demote/Promote Broadcast Join), chúng ta cần cấu hình cấp phát Resource thông minh qua Kubernetes hoặc Terraform. Việc Enable Dynamic Allocation cũng bổ trợ cực tốt cho AQE, cho phép Spark trả lại hoặc xin thêm Executor theo nhu cầu động.

```terraform
# Terraform cấp phát Amazon EMR Cluster với AQE Defaults cho Data Engineering Pipeline
resource "aws_emr_cluster" "spark_aqe_cluster" {
  name          = "spark-aqe-optimized"
  release_label = "emr-6.10.0" # Hỗ trợ Spark 3.x trở lên
  applications  = ["Spark", "Hadoop", "Hive"]

  configurations_json = <<EOF
  [
    {
      "Classification": "spark-defaults",
      "Properties": {
        "spark.sql.adaptive.enabled": "true",
        "spark.sql.adaptive.coalescePartitions.enabled": "true",
        "spark.sql.adaptive.skewJoin.enabled": "true",
        "spark.sql.autoBroadcastJoinThreshold": "20971520", # Đẩy Broadcast threshold lên 20MB
        "spark.memory.fraction": "0.7",
        "spark.dynamicAllocation.enabled": "true",
        "spark.dynamicAllocation.minExecutors": "10",
        "spark.dynamicAllocation.maxExecutors": "100"
      }
    }
  ]
  EOF

  master_instance_group {
    instance_type = "m5.xlarge"
  }

  core_instance_group {
    instance_type = "r5.4xlarge" # RAM lớn phục vụ Broadcast Join
    instance_count = 5
  }
}
```

## 5. Trouble-shooting & Trade-offs (Phân Tích Cân Nhắc)

Dù được xem là "Ma thuật đen" của Spark 3, AQE không phải là viên đạn bạc [Silver bullet]. Việc hiểu rõ ranh giới của nó giúp kiến trúc hệ thống Data Platform ổn định hơn.

### 5.1. Rủi Ro Vận Hành: AQE Demote Broadcast Hash Join (Lỗi tràn Driver)
Có những rủi ro khi CBO tĩnh đánh giá một bảng là nhỏ gọn (dưới 10MB) và quyết định dùng Broadcast Hash Join ngay từ đầu. Tuy nhiên, khi truy vấn chạy thực tế (runtime), bảng này có thể giãn nở khổng lồ (Decompress ratio cao từ chuẩn lưu trữ Parquet sang bộ nhớ In-memory) hoặc bị nghiêng cực độ, khiến bộ nhớ của Driver và Executor vượt quá giới hạn gây ra lỗi (Broadcast Timeout / Driver OOM).

**Trouble-shooting:**
Từ Spark 3.2 trở lên, AQE bổ sung tính năng **Demote Broadcast Hash Join**. Ngay tại Shuffle boundary, nếu AQE phát hiện dung lượng bảng vượt quá ngưỡng dung lượng an toàn thực tế sau khi giải nén, nó sẽ chủ động *Hạ cấp* kế hoạch, từ chối BHJ và ép về lại Sort Merge Join (SMJ) để tránh làm Crash cụm máy chủ. Điều này tuân thủ nguyên tắc cốt lõi **Availability over Latency** (Ưu tiên sống sót hơn là tốc độ) trong thiết kế hệ thống phân tán.

### 5.2. Hạn Chế Của AQE (Limitations)

- **Không Hỗ Trợ Structured Streaming:** 
  Bản chất AQE đòi hỏi việc *tạm dừng* (Pause) tại các điểm chốt dữ liệu (Shuffle boundaries) để đo lường phân tích kích thước Partition một cách toàn diện. Với Structured Streaming (đặc biệt khi xử lý Micro-batch độ trễ thấp vài chục mili-giây), độ trễ do việc Stop-the-world để Re-optimize là hoàn toàn không thể chấp nhận được. Do đó, hiện tại AQE chỉ hiệu lực trong môi trường Batch Processing.
- **Skew Trong Một Bản Ghi Đơn Trọng (Row-Level Skew):** 
  Thuật toán AQE chỉ cắt Skew ở cấp độ Partition. Nếu Skew xảy ra do *một dòng dữ liệu duy nhất* (Ví dụ một Column JSON dạng List chứa mảng khổng lồ nặng 2GB trong một ID khách hàng duy nhất), AQE hoàn toàn vô dụng, vì nó không thể xẻ 1 Row làm nhiều nửa được. Máy nghiền I/O vẫn sẽ nhồi dòng đó vào 1 Task và làm sập Executor. Lỗi này bắt buộc phải sửa bằng cách Normalize Data Model (chia tách bảng con) trước khi đưa vào Spark.
- **Overhead Của Tiến Trình Re-planning:** 
  Mỗi lần chạm ranh giới Shuffle, Executor phải Push dữ liệu Metrics cho Driver, sau đó Catalyst Optimizer phải chạy lại quá trình lập kế hoạch vật lý phức tạp. Với các đồ thị thực thi DAG (Directed Acyclic Graph) lớn có hàng ngàn Shuffle Stage, Overhead tính toán của Driver do AQE tạo ra có thể làm chậm Job đi vài phút. Dẫu vậy, so với hàng giờ đồng hồ mòn mỏi được cứu rỗi nhờ tránh Data Skew, sự đánh đổi này là hoàn toàn xứng đáng với giá trị mang lại.

## Nguồn Tham Khảo (References)
- [Adaptive Query Execution: Speeding Up Spark SQL at Runtime - Databricks][https://www.databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html]
- Uber Engineering Blog, *Making Apache Spark Effortless for All of Uber*.
- [Spark SQL Guide: Adaptive Query Execution](https://spark.apache.org/docs/latest/sql-performance-tuning.html#adaptive-query-execution)
