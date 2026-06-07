---
title: "Các loại Join trong Spark"
category: "Batch Processing"
difficulty: "Advanced"
tags: ["spark-joins", "broadcast-hash-join", "shuffle-hash-join", "sort-merge-join"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Spark Joins: Broadcast Hash Join, Shuffle Hash Join và Sort Merge Join"
metaDescription: "Phân tích 3 chiến lược kết nối dữ liệu (Joins) vật lý cốt lõi trong Apache Spark: Broadcast Hash Join, Shuffle Hash Join và Sort Merge Join. Cách Catalyst tự động lựa chọn."
---

# Các loại Join trong Spark

## Summary

Trong Apache Spark, việc kết nối hai bảng dữ liệu khổng lồ (Joins) là hoạt động phức tạp nhất và tiêu hao nhiều tài nguyên nhất. Khi bạn gõ lệnh `df1.join(df2)`, Spark SQL không thực thi một cách ngây thơ. Thông qua Catalyst Optimizer, Spark quyết định sử dụng một trong các chiến lược (Strategy) kết nối vật lý khác nhau để tìm ra phương án tốn ít bộ nhớ và mạng nhất. Ba chiến lược quan trọng nhất cần nắm là: **Broadcast Hash Join (BHJ)**, **Shuffle Hash Join (SHJ)**, và **Sort Merge Join (SMJ)**.

---

## Definition

Khi người dùng viết logical plan là "Kết hợp Bảng A và Bảng B", quá trình kết nối vật lý (Physical Join Strategies) sẽ quyết định cách thức dữ liệu di chuyển qua các node trong cụm để so khớp (matching). Mỗi chiến lược có thế mạnh và điểm yếu riêng phụ thuộc vào **kích thước của bảng dữ liệu** và **có cần sắp xếp hay không**.

1. **Broadcast Hash Join (BHJ)**: Dành cho bảng siêu nhỏ join với bảng khổng lồ.
2. **Shuffle Hash Join (SHJ)**: Dành cho hai bảng có kích thước vừa và lớn.
3. **Sort Merge Join (SMJ)**: Dành cho hai bảng khổng lồ. (Là mặc định truyền thống của Spark).

---

## How it works

### 1. Broadcast Hash Join (BHJ)
**Khi nào xảy ra:** Khi một bảng có kích thước bé hơn biến `spark.sql.autoBroadcastJoinThreshold` (Mặc định là 10MB).
**Cơ chế:** 
* Thay vì băm (hash) và xáo trộn (shuffle) cả 2 bảng. Spark Master (Driver) kéo bảng nhỏ về, tạo ra một bảng băm (Hash Table) trong RAM. 
* Sau đó, nó "phát sóng" (Broadcast) toàn bộ bảng nhỏ này tới từng Worker Node đang chứa bảng lớn.
* Các Worker tự dò bảng lớn cục bộ với bản sao bảng nhỏ trên RAM mà không cần xáo trộn dữ liệu qua mạng.
**Hiệu năng:** Cực kì nhanh, KHÔNG CÓ SHUFFLE (Narrow Dependency).

### 2. Shuffle Hash Join (SHJ)
**Khi nào xảy ra:** Khi cả 2 bảng đều lớn (vượt ngưỡng Broadcast) nhưng vẫn có thể chia nhỏ ra và đẩy vừa vào RAM của từng Executor.
**Cơ chế:** 
* Cả hai bảng bị băm (Hash) bằng một hàm chung trên khóa Join và xáo trộn (Shuffle) qua mạng. Các bản ghi có chung khóa của cả 2 bảng sẽ hội tụ về cùng một Node.
* Tại mỗi Node, Spark lấy bảng nhỏ hơn (trong 2 bảng lớn) để xây dựng Hash Table nhét vào RAM. Sau đó quét qua bảng còn lại để so khớp.
**Hiệu năng:** Nhanh nhưng rủi ro Out-Of-Memory (OOM) nếu Hash Table xây dựng không vừa RAM của Executor.

### 3. Sort Merge Join (SMJ)
**Khi nào xảy ra:** Là chiến lược mặc định của Spark khi join hai bảng khổng lồ (Big x Big Join).
**Cơ chế:** 
* Hai bảng cũng bị băm và xáo trộn (Shuffle) qua mạng như SHJ.
* *Điểm khác biệt*: Tại mỗi Node, thay vì cố nhét toàn bộ bảng vào RAM để làm Hash Table (dễ gây OOM), Spark tiến hành **sắp xếp (Sort)** cả 2 bảng theo khóa Join.
* Sau khi sắp xếp, Spark dùng 2 con trỏ quét song song từ trên xuống dưới trên 2 bảng. Bằng cách này, nó chỉ cần giữ 1 bản ghi trong RAM tại một thời điểm.
**Hiệu năng:** Chậm hơn do tốn thêm bước Sắp xếp (Sort), nhưng cực kì an toàn. Bạn có thể join 2 bảng Petabytes mà không bao giờ bị OOM.

---

## Practical example

```python
# Kích hoạt Broadcast Hash Join chủ động (Ép Spark dùng Broadcast)
from pyspark.sql.functions import broadcast

fact_sales = spark.read.parquet("s3://data/sales/")    # 100GB
dim_store = spark.read.parquet("s3://data/stores/")    # 5MB

# Bằng cách bọc hàm broadcast(), Spark sẽ bỏ qua Sort Merge và dùng BHJ
optimized_df = fact_sales.join(broadcast(dim_store), "store_id")

# Kiểm tra Physical Plan:
optimized_df.explain()
# Bạn sẽ thấy Output ghi chữ: BroadcastHashJoin
```

---

## Best practices

* **Mở rộng kích thước Broadcast**: Mặc định là 10MB. Nếu cụm máy tính của bạn rất mạnh, có thể tự tin tăng lên `spark.conf.set("spark.sql.autoBroadcastJoinThreshold", 104857600)` (tương đương 100MB) để tận dụng lợi thế của BHJ nhiều hơn.
* **Tận dụng AQE (Adaptive Query Execution)**: Trên Spark 3+, nhớ bật `spark.sql.adaptive.enabled = true`. Trình tối ưu hóa sẽ đo đạc kích thước dữ liệu trong thời gian chạy (run-time) thay vì chỉ phỏng đoán. Nếu thấy một bảng sau khi Filter đột nhiên bé lại dưới 10MB, nó sẽ "quay xe" tự động chuyển SMJ thành BHJ ngay lập tức để tiết kiệm chi phí.
* **Bucketing**: Nếu bạn thường xuyên Join 2 bảng khổng lồ (SMJ) ngày qua ngày, hãy cân nhắc kỹ thuật Bucketing (phân lô) khi lưu file lúc viết. Spark sẽ sắp xếp và lưu sẵn thứ tự vào file. Ở lần đọc lên sau, pha "Sort" trong SMJ sẽ bị bỏ qua (Sort-free SMJ), nhanh gấp hàng chục lần.

---

## Common mistakes

* **Ép Broadcast bảng quá lớn**: Bạn thấy Broadcast nhanh nên ép `broadcast(df_to)` cho bảng 1GB. Driver sẽ kéo 1GB về (có thể vỡ RAM) rồi nhồi 1GB gửi cho hàng ngàn Executor qua mạng (nghẽn cổ chai mạng cục bộ), khiến toàn bộ Application chết đứng.
* **Không làm sạch khóa rỗng (NULL Keys)**: Trong SMJ hay SHJ, dữ liệu rỗng ở khóa JOIN sẽ bị Hash về cùng 1 vách partition gây ra Data Skew nghiêm trọng.

---

## Trade-offs

| Chiến lược | Ưu điểm | Nhược điểm |
|------------|---------|------------|
| **Broadcast Hash Join** | Không Shuffle mạng, cực siêu tốc. | Bảng nhỏ phải để vừa RAM của tất cả Node và Driver. |
| **Shuffle Hash Join** | Nhanh hơn Sort Merge vì không cần pha Sắp xếp (Sort). | Dễ bị Crash (OOM) nếu một mảnh Shuffle lớn bất thường không nhét vừa RAM. |
| **Sort Merge Join** | Ổn định tuyệt đối với mọi dung lượng khổng lồ. | Rất chậm do phải trả chi phí CPU và Disk I/O cho thuật toán Sort mệt mỏi. |

---

## When to use

Kiến thức này cực kỳ quan trọng để điều chỉnh (tuning) các bài toán SQL Pipeline chạy quá chậm. Đọc bản kế hoạch vật lý `df.explain()` là yêu cầu bắt buộc của Senior Data Engineer.

---

## Related concepts

* [Shuffle](/concepts/shuffle)
* [Data Skew](/concepts/data-skew)
* [Spark SQL](/concepts/spark-sql)

---

## Interview questions

### 1. Phân biệt Broadcast Hash Join và Sort Merge Join?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết lõi về phương thức kết hợp dữ liệu trong Big Data.
* **Gợi ý trả lời**: 
  * Broadcast Join gửi nguyên bản sao của bảng siêu nhỏ đến mọi node đang chứa bảng to, KHÔNG gây xáo trộn (shuffle) phân vùng của bảng to. Giúp join tốc độ ánh sáng.
  * Sort Merge Join xáo trộn toàn mạng lưới cả 2 bảng bự. Sau đó nó sắp xếp (sort) dữ liệu rồi lướt đối chiếu. Giúp join lượng dữ liệu vô hạn không sợ sập RAM.

### 2. Tại sao Sort Merge Join (SMJ) lại là thiết lập mặc định trong Spark kể từ phiên bản 2.3 thay cho Shuffle Hash Join?
* **Gợi ý trả lời**: Hash Join yêu cầu toàn bộ phân vùng (partition) của bảng nhỏ hơn (tại mỗi node) phải được tải lên thành một bảng băm trong bộ nhớ (RAM). Nếu dữ liệu lệch (Skew) làm phân vùng đó bự đột biến, node đó sẽ văng Out Of Memory. Ngược lại, Sort Merge Join sau khi sắp xếp chỉ cần duyệt qua dữ liệu bằng con trỏ mà không cần giữ toàn cục trong RAM. SMJ hy sinh tốc độ để lấy sự ỔN ĐỊNH - tiêu chí tối cao nhất cho mọi job Big Data chạy production.

---

## References

* **Spark: The Definitive Guide** - Bill Chambers, Matei Zaharia (Chương Joins).
* Databricks Blogs on Spark SQL Physical Plans.

---

## English summary

In Apache Spark, logical join operations are translated into distinct physical execution strategies by the Catalyst Optimizer based on dataset sizes. The **Broadcast Hash Join (BHJ)** bypasses the network shuffle entirely by replicating a small table to all nodes, making it phenomenally fast but bounded by memory. For massive datasets, Spark defaults to **Sort Merge Join (SMJ)**, which shuffles both tables by key, sorts them, and iterates sequentially. While SMJ is slower due to the expensive sorting phase, it provides exceptional robustness against Out-Of-Memory errors compared to the riskier **Shuffle Hash Join (SHJ)**.
