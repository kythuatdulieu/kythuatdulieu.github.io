---
title: "Deep Dive: Adaptive Query Execution (AQE) trong Spark 3.x"
description: "Phân tích chuyên sâu về kiến trúc, cơ chế hoạt động, các tính năng cốt lõi và cách tinh chỉnh Adaptive Query Execution (AQE) trong Apache Spark."
---



Adaptive Query Execution (AQE) được giới thiệu chính thức và ổn định từ Apache Spark 3.0 (và được bật mặc định từ Spark 3.2.0), đánh dấu một bước ngoặt lớn trong quá trình tối ưu hóa truy vấn của hệ sinh thái Spark. Khác với Catalyst Optimizer thông thường vốn dĩ thực hiện tối ưu hóa tĩnh (Static Optimization) dựa trên các quy tắc (Rule-based) và chi phí ước tính (Cost-based) trước khi thực thi, AQE mang đến khả năng thích ứng động. Nó cho phép Spark thu thập số liệu thống kê thực tế (Runtime Statistics) trong quá trình chạy và tự động điều chỉnh Kế hoạch thực thi (Execution Plan) ngay giữa chừng.

Bài viết này sẽ đi sâu vào kiến trúc cơ sở của AQE, ba tính năng cốt lõi, cách cấu hình, phân tích Spark UI khi có AQE, cũng như các giới hạn của nó.

---

## 1. Kiến Trúc Và Cơ Chế Hoạt Động Của AQE

Trước Spark 3.x, Spark tính toán execution plan (kế hoạch thực thi) trước khi job bắt đầu chạy và tuân thủ nghiêm ngặt kế hoạch đó cho đến khi kết thúc. Tuy nhiên, các ước tính của Cost-Based Optimizer (CBO) có thể bị sai lệch nghiêm trọng do thống kê dữ liệu cũ, thiếu thống kê, hoặc do việc áp dụng các hàm tự định nghĩa (User-Defined Functions - UDF) khiến Spark "mù tịt" về kích thước dữ liệu đầu ra.

### 1.1 Ranh giới Shuffle (Shuffle Boundaries) và Điểm Dừng (Materialization Points)
Trong Spark, một Job được phân rã thành nhiều Stages. Các Stages được phân tách bởi ranh giới của các thao tác **Shuffle** (như `join`, `groupBy`, `repartition`, `distinct`). 
- Trong quá trình Shuffle, Map tasks ở stage trước sẽ tính toán, phân loại và ghi dữ liệu ra đĩa nội bộ của Executor (Shuffle Write).
- Reduce tasks ở stage sau sẽ kéo dữ liệu này qua mạng để tiếp tục xử lý (Shuffle Read).

AQE tận dụng chính các ranh giới Shuffle này làm các **Materialization Points** (Điểm chốt dữ liệu). Khi toàn bộ Map tasks của một Stage hoàn thành, hệ thống đã ghi nhận chính xác kích thước và số lượng record của dữ liệu được sinh ra. Dựa trên số liệu thống kê thực tế (exact runtime statistics) này, AQE sẽ:
1. Tạm dừng việc submit các stage tiếp theo.
2. Nạp số liệu thống kê thực tế trở lại Catalyst Optimizer.
3. Chạy lại tiến trình tối ưu hóa vật lý (Physical Planning) để xem xét và đánh giá lại kế hoạch của các Stage còn lại.
4. Chọn một kế hoạch thực thi mới (tối ưu hơn) và tiếp tục thực thi.

### 1.2 Vòng Đời Tối Ưu Hóa Của AQE
Vòng lặp vận hành của AQE diễn ra lặp đi lặp lại như sau:
`Thực thi Stage -> Thu thập Runtime Statistics -> Cập nhật Logical/Physical Plan -> Áp dụng Rule mới -> Thực thi Stage tiếp theo`.

Quá trình này biến việc lên lịch truy vấn tĩnh thành một quá trình phản hồi liên tục (feedback loop), đảm bảo kế hoạch luôn tốt nhất dựa trên tình trạng dữ liệu ở thời gian thực.

---

## 2. Ba Tính Năng Tối Ưu Hóa Cốt Lõi Của AQE

AQE giải quyết ba bài toán kinh điển gây đau đầu nhất cho Data Engineers và những nhà quản trị Spark Cluster.

### 2.1 Dynamically Coalescing Shuffle Partitions (Gom nhóm phân vùng tự động)
**Vấn đề:** 
Làm sao để cấu hình `spark.sql.shuffle.partitions` (mặc định luôn là 200) cho phù hợp với từng bài toán?
- Nếu set quá nhỏ (Ví dụ dữ liệu 1TB nhưng partition=200): Lượng dữ liệu trong mỗi partition quá lớn (hàng GB), dẫn đến Spill to Disk (tràn RAM ra đĩa), làm chậm quá trình xử lý cực kỳ nghiêm trọng, và dễ gặp lỗi OOM (Out of Memory).
- Nếu set quá lớn (Ví dụ dữ liệu 1GB nhưng partition=10000): Dữ liệu bị chia quá vụn thành các file/partition siêu nhỏ. Spark tốn rất nhiều overhead cho việc scheduling tasks, khởi tạo task, và tốn kém I/O để đọc/ghi network cho hàng ngàn task li ti (chỉ xử lý vài KB dữ liệu mỗi task).

**Giải pháp của AQE:**
Data Engineer có thể mạnh dạn set `spark.sql.shuffle.partitions` bằng một con số khá lớn từ đầu (ví dụ: 800, 2000) dựa vào cụm dữ liệu lớn nhất. Sau quá trình Shuffle Write, AQE sẽ phân tích kích thước thực tế của từng partition được sinh ra. Nếu phát hiện các partition liên tiếp nhau có kích thước quá nhỏ, AQE sẽ gộp (coalesce) chúng lại trong quá trình Shuffle Read, sao cho kích thước mỗi partition mới đạt tới mức lý tưởng tiệm cận `spark.sql.adaptive.advisoryPartitionSizeInBytes` (mặc định 64MB).

**Kết quả:** Số lượng Reduce Task được tối ưu hóa động (dynamic reduction of tasks), giảm mạnh overhead từ I/O và Task scheduling, giúp Job kết thúc nhanh chóng hơn.

### 2.2 Dynamically Switching Join Strategies (Chuyển đổi chiến lược Join động)
**Vấn đề:**
Broadcast Hash Join (BHJ) là thuật toán Join nhanh nhất trong Spark, vì nó chỉ định phát (broadcast) bảng nhỏ tới toàn bộ các Executors, loại bỏ hoàn toàn quá trình Shuffle qua mạng khét tiếng. Tuy nhiên, nếu Spark tĩnh không nhận diện được bảng đã nhỏ lại (ví dụ: sau khi áp dụng filter lọc dữ liệu trên một bảng rất lớn, kết quả trả về chỉ còn vài MB), Spark vẫn mù quáng chọn Sort-Merge Join (SMJ) - một thuật toán đòi hỏi phải sort (sắp xếp) và shuffle (phân phối lại) cả hai bảng qua mạng rất tốn kém tài nguyên và thời gian.

**Giải pháp của AQE:**
Ngay tại ranh giới shuffle (sau khi việc đọc/filter dữ liệu đã xong và ghi ra đĩa), AQE kiểm tra lại kích thước thực tế của các phía tham gia Join. Nếu kích thước thực tế của một phía Join nhỏ hơn cấu hình `spark.sql.autoBroadcastJoinThreshold` (mặc định 10MB), nó sẽ mạnh dạn "vứt bỏ" kế hoạch Sort-Merge Join ban đầu, hủy bỏ bước Sort (sắp xếp) và chuyển ngay sang Broadcast Hash Join.

**Kết quả:** Loại bỏ hoàn toàn Network Shuffle và Sort tốn kém tài nguyên ở Stage tiếp theo, tăng tốc truy vấn đáng kể. Bạn sẽ thấy node `BroadcastQueryStage` thay vì node `SortMergeJoin` truyền thống trong DAG.

### 2.3 Dynamically Optimizing Skew Joins (Tự động tối ưu hóa Data Skew)
**Vấn đề:**
Data Skew (Dữ liệu bị lệch/phân bổ không đồng đều) là kẻ thù số 1 của mô hình tính toán phân tán. Khi join dữ liệu trên một khóa (key) phân bố không đều (VD: `country = 'US'` chiếm 80% tổng số bản ghi), theo cơ chế băm (hash), 1 task sẽ phải gồng mình xử lý 80% dữ liệu đó, trong khi 199 tasks khác xử lý 20% còn lại xong rất nhanh rồi "ngồi chơi". Task bị kẹt (Straggler task) này làm đình trệ toàn bộ job, tiêu tốn toàn bộ bộ nhớ và CPU của một Executor và rất dễ gây văng ứng dụng do lỗi OOM.

**Giải pháp của AQE:**
AQE theo dõi chặt chẽ kích thước của các partition sau khi Shuffle Write. Nếu một partition lớn hơn `spark.sql.adaptive.skewJoin.skewedPartitionFactor` nhân với kích thước partition trung bình (VÀ đồng thời vượt qua ngưỡng `spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes`), nó được tự động dán nhãn là **Skewed Partition**.

Lúc này, thay vì để 1 task vật lộn với cục dữ liệu khổng lồ đó, AQE sẽ **chia nhỏ (split)** partition bị nghiêng của Bảng A thành N phần nhỏ bằng nhau (sub-partitions). Sau đó, nó sẽ nhân bản (duplicate) partition tương ứng của Bảng B lên N lần để tiến hành join. Nhờ kỹ thuật này, N tasks (thay vì 1 task như ban đầu) sẽ xử lý song song phần dữ liệu nghiêng đó một cách an toàn.

**Kết quả:** Giải quyết triệt để vấn đề "task chạy chậm kẹt tài nguyên" và OOM do skew, giúp hiệu năng ổn định, hoàn toàn không cần phải dùng kỹ thuật Salting (thêm muối ngẫu nhiên) thủ công rườm rà.

---

## 3. Các Tính Năng Nâng Cao Khác Của AQE (Spark 3.2+)

Ngoài 3 tính năng kinh điển, các bản cập nhật Spark sau này liên tục bổ sung cho AQE:
- **Demote BroadcastHashJoin:** Trong một số trường hợp, Catalyst ước tính một bảng rất nhỏ nhưng trong thực tế (runtime) bảng đó lại phình to bất thường (có thể do nén dữ liệu quá mức hoặc data skew). AQE có khả năng nhận ra nguy cơ quá tải bộ nhớ và lập tức "hạ cấp" (demote) kế hoạch từ Broadcast Join trở lại Sort Merge Join để tránh làm sập driver/executor do lỗi OOM.
- **Empty Relation Propagation:** Nếu AQE nhận ra một Stage trả về kết quả rỗng (0 rows) sau khi áp dụng filter, nó có thể báo cho Catalyst Optimizer chặn đứng và không cần phải chạy (skip execution) các logic Join phía sau liên quan đến partition rỗng đó, tiết kiệm cực kỳ nhiều tài nguyên cho Cluster.

---

## 4. Bảng Cấu Hình AQE Chi Tiết (Configuration)

Để tinh chỉnh AQE cho phù hợp với cụm cluster và bài toán, Data Engineer sử dụng các tham số sau trong cấu hình Spark Session hoặc khi submit qua `spark-submit`:

| Tham Số | Giá trị mặc định | Mô tả chi tiết |
| :--- | :---: | :--- |
| `spark.sql.adaptive.enabled` | `true` (từ bản 3.2) | Công tắc tổng để bật/tắt toàn bộ tính năng AQE. (Lưu ý: Spark 3.0-3.1 mặc định là `false`). |
| `spark.sql.adaptive.coalescePartitions.enabled` | `true` | Bật tính năng gộp các shuffle partitions có kích thước nhỏ lại với nhau. |
| `spark.sql.adaptive.coalescePartitions.initialPartitionNum` | _Not set_ | Số lượng partition khởi tạo ban đầu trước khi tính toán coalesce. Khuyên dùng: đặt bằng với `spark.sql.shuffle.partitions`. |
| `spark.sql.adaptive.advisoryPartitionSizeInBytes` | `64MB` | Kích thước partition mục tiêu mong muốn sau khi gom lại. (Nên điều chỉnh theo cấu hình máy và tốc độ I/O đĩa/mạng). |
| `spark.sql.adaptive.localShuffleReader.enabled` | `true` | Hỗ trợ tối ưu việc đọc dữ liệu shuffle cục bộ (local) mà không cần qua network khi chuyển đổi từ SMJ sang BHJ. |
| `spark.sql.adaptive.skewJoin.enabled` | `true` | Kích hoạt tính năng xử lý Skew Join (xử lý dữ liệu nghiêng lệch tự động). |
| `spark.sql.adaptive.skewJoin.skewedPartitionFactor` | `5` | Tỉ lệ gấp bao nhiêu lần so với kích thước partition trung vị (median) thì một partition sẽ bị coi là skew. |
| `spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes`| `256MB` | Kích thước tối thiểu tuyệt đối để một partition bị coi là skew (ngăn chặn việc chia nhỏ các partition dù lệch gấp 5 lần nhưng kích thước thực tế chỉ vài MB). |

---

## 5. Khi Nào AQE Không Hoạt Động Hoặc Kém Hiệu Quả?

AQE vô cùng thông minh nhưng không phải là "viên đạn bạc" giải quyết bách bệnh về mặt performance:

1. **Truy vấn không có ranh giới Shuffle:** AQE dựa hoàn toàn vào các điểm chốt dữ liệu (Materialization Points) sinh ra tại giai đoạn ghi Shuffle. Nếu ứng dụng Spark của bạn chỉ bao gồm các phép biến đổi hẹp (Narrow Transformations) như `map`, `filter`, `select` mà hoàn toàn không có `join` hay `groupBy`, AQE sẽ không có điểm can thiệp nào và việc bật nó lên sẽ không thay đổi bất kỳ điều gì.
2. **Spark Streaming / Structured Streaming:** Ở thời điểm hiện tại, AQE **không được hỗ trợ** trong các ứng dụng Structured Streaming. Bản chất của Streaming là xử lý các luồng dữ liệu vô tận theo các micro-batches cực ngắn (vài chục mili-giây đến vài giây), việc tạm dừng để đánh giá lại kế hoạch liên tục tốn quá nhiều overhead dẫn đến độ trễ không chấp nhận được cho bài toán thời gian thực.
3. **Data Skew Nội Tại Bên Trong Một Hàng (Row):** AQE xử lý skew ở cấp độ Partition. Nếu một giá trị key (ví dụ mảng Json rất lớn chứa hàng trăm ngàn phần tử) nằm gói gọn trong vỏn vẹn một dòng (row) và dòng này có kích thước lên đến hàng GB, AQE bất lực vì nó không thể xẻ nhỏ một dòng dữ liệu duy nhất ra chia cho các node. Đây là lỗi thiết kế cấu trúc dữ liệu tồi tệ, và vẫn sẽ đánh sập executor bởi OOM.
4. **Logic xử lý tồi và Thiết kế dữ liệu kém:** Nếu dữ liệu đầu vào không được phân vùng trên hệ thống lưu trữ (HDFS/S3) đúng cách, định dạng text lưu thô thay vì Parquet/ORC, hoặc ứng dụng của bạn gọi các truy vấn Cartesian Join (Cross Join) vô nghĩa tỷ x tỷ records, AQE chỉ giảm bớt phần ngọn chứ không chữa được cốt lõi của sự chậm chạp.

---

## 6. Theo Dõi AQE Trong Thực Tế

### Trong Spark SQL UI
Khi AQE can thiệp vào job đang chạy, giao diện Spark UI ở tab **SQL** là nơi quan sát sinh động nhất:
- Các node trên sơ đồ execution plan (DAG) ban đầu chưa được chạy (unresolved).
- Khi có thay đổi từ AQE, bạn sẽ thấy các node mới được gắn thêm tiền tố `AdaptiveSparkPlan`.
- Có node ghi nhận `CustomShuffleReader` với chỉ số `coalesced` (báo hiệu tính năng gom partition thành công).
- Node `SortMergeJoin` có thể sẽ bị gạch mờ và được thay thế hoàn toàn bởi nhánh `BroadcastHashJoin`.
- Sự xuất hiện của cờ `isSkew` = true trên một số nhánh cây của node báo hiệu Data Skew đã được xử lý.

### Thông qua lệnh `explain`
Nếu bạn dùng lệnh `df.explain(True)` để in ra execution plan trên console, ở phần cuối cùng dưới tiêu đề `== Physical Plan ==` sẽ có một dòng chữ bắt đầu bằng `AdaptiveSparkPlan isFinalPlan=false` (hoặc `true` nếu truy vấn đã chạy xong). Sự xuất hiện của node AdaptiveSparkPlan là minh chứng rõ ràng nhất chỉ ra rằng truy vấn của bạn đã và đang được tối ưu hóa động bởi AQE.

---

## Tài Liệu Tham Khảo Mở Rộng

* [Adaptive Query Execution: Speeding Up Spark SQL at Runtime - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* [Spark SQL Guide: Adaptive Query Execution - Apache Spark Docs](https://spark.apache.org/docs/latest/sql-performance-tuning.html#adaptive-query-execution)
* [Databricks: Optimizing Apache Spark with AQE (Video Session) - YouTube]
* [Designing Data-Intensive Applications - Martin Kleppmann (Chương 10: Batch Processing)]
* [Troubleshooting Adaptive Query Execution in Spark 3 - Uber Engineering Blog]
* [The Pragmatic Engineer: Joe Reis on Modern Spark Optimization Techniques]
