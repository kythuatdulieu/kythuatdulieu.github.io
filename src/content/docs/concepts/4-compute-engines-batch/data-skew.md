---
title: "Lệch dữ liệu - Data Skew"
difficulty: "Advanced"
tags: ["data-skew", "performance-tuning", "spark-joins", "apache-spark"]
readingTime: "13 mins"
lastUpdated: 2026-06-07
seoTitle: "Data Skew là gì? Hiện tượng lệch phân vùng và cách xử lý trong Big Data"
metaDescription: "Tìm hiểu hiện tượng cực hình Data Skew (lệch dữ liệu) trong Apache Spark làm treo hệ thống, cách nhận biết qua Spark UI và các phương pháp giải quyết (Salting, Broadcast)."
description: "Hãy tưởng tượng bạn đang quản lý một đội công nhân gồm 200 người để dọn dẹp một đống đổ nát khổng lồ. Kế hoạch ban đầu là chia đều công việc cho tất c..."
---



Data Skew (Lệch dữ liệu) là một trong những cơn ác mộng lớn nhất trong các hệ thống xử lý phân tán (như Apache Spark, Hadoop, Presto). Hiện tượng này xảy ra khi một (hoặc một vài) Partition/Node phải gánh vác tới 90% khối lượng tính toán, trong khi phần lớn các Partition/Node khác đã hoàn thành công việc từ lâu và đang "ngồi chơi".

Trong bài viết này, chúng ta sẽ đi sâu tìm hiểu nguyên nhân, tác hại, cách nhận biết và các chiến lược khắc phục triệt để hiện tượng Data Skew.

## 1. Data Skew là gì?



Hãy tưởng tượng bạn đang quản lý một đội công nhân gồm 200 người để dọn dẹp một đống đổ nát khổng lồ. Kế hoạch ban đầu là chia đều công việc cho tất cả mọi người dựa trên mã khu vực. Tuy nhiên, trên thực tế, khu vực số 1 chiếm tới 80% tổng khối lượng gạch đá, trong khi 199 khu vực còn lại gộp lại chỉ chiếm 20%.

Kết quả là 199 công nhân hoàn thành phần việc của mình chỉ trong vài phút, nhưng toàn bộ dự án vẫn phải chờ người công nhân số 1 hì hục dọn dẹp khu vực số 1 trong suốt nhiều ngày liên tục, thậm chí người này còn có nguy cơ kiệt sức (tương đương với lỗi Out of Memory - OOM trong máy tính).

Trong ngữ cảnh dữ liệu: Khi bạn thực hiện các phép toán cần gom nhóm dữ liệu như `JOIN`, `GROUP BY`, hoặc `Window Functions`, hệ thống sẽ sử dụng một khóa (key) để phân phối dữ liệu (shuffle) về các partition khác nhau. Nếu giá trị của khóa phân phối không đồng đều (ví dụ: null, rỗng, giá trị phổ biến cực cao), toàn bộ dữ liệu mang cùng khóa đó sẽ dồn về chung một partition, gây ra hiện tượng Data Skew.

## 2. Nguyên nhân dẫn đến Data Skew

- **Phân phối dữ liệu tự nhiên không đồng đều:** Trong thực tế, dữ liệu thường tuân theo phân phối Pareto (quy tắc 80/20) hoặc Zipf. Chẳng hạn, một số người dùng/sản phẩm quá nổi tiếng (như tài khoản của một người nổi tiếng trên MXH) sẽ có lượng tương tác gấp hàng ngàn lần người dùng bình thường.
- **Dữ liệu Null/Rỗng (Missing values):** Trong quá trình join trên một khóa, nếu khóa đó có một lượng lớn dữ liệu là `null` hoặc chuỗi rỗng (`""`), tất cả những record bị khuyết này sẽ dồn vào một node duy nhất.
- **Thiết kế khóa (Key Design) chưa tối ưu:** Lựa chọn partition key có số lượng giá trị duy nhất quá ít so với kích thước tập dữ liệu, hoặc sử dụng các phép hash sinh ra nhiều đụng độ (collision).

## 3. Tác hại của Data Skew

- **Thời gian thực thi kéo dài (Straggler Tasks):** Job Spark của bạn có thể chạy xong 99% task trong vòng 1 phút, nhưng 1% task cuối cùng lại kẹt lại trong vài giờ mới kết thúc.
- **Out of Memory (OOM):** Node/executor xui xẻo nhận partition bị lệch sẽ nhanh chóng tiêu thụ hết tài nguyên bộ nhớ khả dụng. Nếu dữ liệu của partition đó quá lớn không vừa với bộ nhớ RAM và cả dung lượng spill xuống ổ đĩa, Spark sẽ văng ra lỗi `java.lang.OutOfMemoryError`.
- **Lãng phí tài nguyên cluster:** Do các task khác đã hoàn thành và tài nguyên của các Node khác đang ở trạng thái rảnh rỗi (idle) nhưng không thể giải phóng cho đến khi toàn bộ stage kết thúc.

## 4. Cách phát hiện Data Skew

Data skew không khó để phát hiện nếu bạn biết cách nhìn vào hệ thống giám sát như **Spark UI**:

1. **Xem xét màn hình Stages:** Trong Spark UI, tìm stage mất nhiều thời gian nhất để chạy.
2. **Quan sát Summary Metrics for Completed Tasks:** Nhìn vào phân phối (percentiles) của `Duration` (thời gian thực thi). Nếu thời gian của `Max` cao gấp nhiều lần so với `75th percentile` hoặc `Median`, đó là dấu hiệu rõ ràng của Data Skew. (Ví dụ: Median task tốn 2s, nhưng Max task mất 45 phút).
3. **Kiểm tra Shuffle Read Size / Records:** Nếu phần lớn các task chỉ đọc vài MB, trong khi một số ít task phải đọc đến hàng GB dữ liệu, chắc chắn dữ liệu đã phân bố không đồng đều.
4. **Cảnh báo lỗi ngầm định:** Các task thường xuyên gặp tình trạng bị chết (Failed) với lý do OOM hoặc "Disk space exhausted" lặp đi lặp lại.

## 5. Các phương pháp giải quyết Data Skew

Sau khi xác định được nguyên nhân, chúng ta có thể áp dụng các giải pháp dưới đây để làm phẳng lệch phân phối dữ liệu.

### 5.1 Xử lý giá trị Null / Rỗng trước khi Join

Nếu dữ liệu lệch hoàn toàn do các bản ghi mang giá trị `null`, bạn nên tách tập dữ liệu ra hoặc loại bỏ nó.
- **Filter Null:** Nếu các bản ghi `null` không quan trọng hoặc không khớp trong Inner Join, hãy loại bỏ (filter) chúng trước khi thực hiện join/group by.
- **Thay thế Null ngẫu nhiên:** Thay vì để mặc định, bạn có thể biến đổi các giá trị `null` thành những đoạn chuỗi/giá trị ngẫu nhiên (ví dụ `uuid()`) để khi shuffle, những bản ghi này sẽ phân tán đều trên các partition.

### 5.2 Broadcast Join (Map-Side Join)

Nếu một bảng cực kỳ lớn gặp hiện tượng skew, nhưng bảng còn lại mà bạn cần join lại khá nhỏ (thường < 10 MB đến một vài GB, tùy vào cấu hình RAM), bạn có thể dùng `Broadcast Hash Join`.

Thay vì "trộn" (shuffle) cả hai bảng dựa trên join key (gây ra skew ở các node nhận dữ liệu lớn), bảng nhỏ sẽ được Spark gửi trọn vẹn (broadcast) tới **tất cả** các executor. Nhờ đó, việc Join được diễn ra một cách cục bộ (map-side join) mà không cần bước shuffle, hoàn toàn loại bỏ vấn đề Data Skew.

```python
from pyspark.sql.functions import broadcast

# df_large chứa data skew, df_small là bảng dimension
result_df = df_large.join(broadcast(df_small), "join_key")
```

### 5.3 Kỹ thuật Salting (Thêm Muối)

Đây là kỹ thuật cổ điển nhưng vô cùng lợi hại khi cả 2 bảng đều quá lớn không thể Broadcast, và bạn biết chắc chắn khóa nào đang bị lệch.
Nguyên lý của Salting là biến đổi một key bị skew (ví dụ: "VIP_CUSTOMER") thành hàng chục hoặc hàng trăm key khác nhau (ví dụ: "VIP_CUSTOMER_1", "VIP_CUSTOMER_2",..., "VIP_CUSTOMER_10") để đánh lừa cơ chế shuffle, buộc nó phải phân tán lượng data khổng lồ kia ra nhiều node.

**Cách thực hiện (khi Join 2 bảng A và B):**
1. **Bước 1 (Với bảng bị skew - Bảng A):** Thêm một cột chứa một con số ngẫu nhiên từ 1 đến N (ví dụ `N=10`) vào bảng A. Tạo một "Salted Key" mới ghép giữa Khóa Cũ và con số ngẫu nhiên này.
2. **Bước 2 (Với bảng không bị skew - Bảng B):** Bạn phải nhân bản (explode) mỗi dòng của bảng B thành N dòng. Mỗi dòng mới có gắn một số từ 1 đến N, sau đó cũng tạo "Salted Key" ghép giữa Khóa Cũ và số tương ứng.
3. **Bước 3:** Tiến hành Join 2 bảng bằng "Salted Key". Sau khi Join xong, bạn có thể bỏ đi cột Salted Key.

Nhờ kỹ thuật này, data của "VIP_CUSTOMER" bên bảng A thay vì tập trung ở 1 node nay đã dàn đều qua 10 node khác nhau, giúp hiệu năng tăng lên đáng kể.

### 5.4 Sử dụng Spark Adaptive Query Execution (AQE)

Từ phiên bản Apache Spark 3.0 trở đi, tính năng **Adaptive Query Execution (AQE)** đã giới thiệu khả năng tự động xử lý Data Skew một cách thông minh được gọi là `Skew Join Optimization`.

Khi bật AQE, Spark có khả năng giám sát khối lượng dữ liệu ở runtime (trong lúc chạy). Nếu Spark phát hiện một partition lớn bất thường sau bước Map, nó sẽ tự động chia nhỏ (split) partition khổng lồ này thành nhiều partition nhỏ hơn để các task khác nhau xử lý (tương đương với tự động Salting).

Bạn có thể kích hoạt bằng cách cấu hình:
```properties
spark.sql.adaptive.enabled=true
spark.sql.adaptive.skewJoin.enabled=true
spark.sql.adaptive.skewJoin.skewedPartitionFactor=5
spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes=256MB
```
AQE là một "liều thuốc tiên" giúp kỹ sư dữ liệu giảm thiểu đáng kể thời gian ngồi debug thủ công với kỹ thuật Salting truyền thống.

### 5.5 Two-Stage Aggregation (Map-Side Reduce / Băm nhỏ phép Group By)

Nếu bạn gặp Data Skew khi thực hiện phép `GROUP BY` (ví dụ đếm số lượng giao dịch của từng khách hàng), bạn có thể áp dụng chiến lược gom nhóm 2 bước:
- **Bước 1 (Local Aggregation):** Thêm một thành phần random (salt) vào khóa gom nhóm ban đầu, sau đó group by theo khóa salted đó.
- **Bước 2 (Global Aggregation):** Loại bỏ salt để khôi phục khóa gốc, rồi group by thêm lần nữa để tính tổng số liệu thực tế.

Cơ chế này chia áp lực khổng lồ trên một node thành nhiều cụm tính toán ở bước 1, sau đó gom kết quả rút gọn ở bước 2 một cách nhẹ nhàng.

## 6. Tổng Kết

Hiểu và khắc phục được Data Skew là ranh giới phân biệt giữa một Data Engineer có kinh nghiệm và người mới vào nghề. Hãy luôn chủ động giám sát qua Spark UI, theo dõi các chỉ số về shuffle read và execution time percentile để phát hiện sớm các dấu hiệu Straggler Task. Tùy thuộc vào kích thước dữ liệu và bản chất phép toán, hãy chọn cho mình phương án phù hợp: từ việc làm sạch dữ liệu Null, áp dụng Broadcast Join, tận dụng tự động hóa của AQE cho đến triển khai kỹ thuật Salting chuyên sâu.

---

## Tài Liệu Tham Khảo
* [Apache Spark: A Unified Engine for Big Data Processing (CACM 2016)](https://cacm.acm.org/magazines/2016/11/209116-apache-spark/fulltext)
* [Adaptive Query Execution in Spark 3.0 - Databricks Blog](https://databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* **Troubleshooting Spark OOM and Memory Management - Uber Engineering**
* [Spark Shuffle Architecture - DataBricks Deep Dive](https://databricks.com/session/deep-dive-into-spark-sql-with-advanced-performance-tuning)
* **Presto: SQL on Everything - Facebook Engineering**
