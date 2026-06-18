---
title: "Schema Evolution"
difficulty: "Intermediate"
tags: ["schema-evolution", "data-lakehouse", "table-format", "data-engineering"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Schema Evolution - Quản lý cấu trúc dữ liệu Data Lake"
metaDescription: "Tìm hiểu Schema Evolution là gì: cơ chế tự động thích ứng với thay đổi cấu trúc bảng (thêm, xóa, đổi tên cột) mà không cần ghi lại dữ liệu cũ trên Data Lake."
description: "Trong thế giới [Data Engineering](/concepts/1-distributed-systems-architecture/data-engineering), có một sự thật hiển nhiên: **Dữ liệu luôn thay đổi**. Hôm nay, ứng dụng nguồn gửi 5 cột, ngày mai có thể là 7 cột hoặc đổi tên 1 cột. Xử lý những thay đổi này một cách trơn tru là nhiệm vụ của Schema Evolution."
---



Trong thế giới [Data Engineering](/concepts/1-distributed-systems-architecture/data-engineering), có một sự thật hiển nhiên: **Dữ liệu luôn thay đổi**. Ứng dụng nguồn liên tục cập nhật tính năng mới, dẫn đến việc dữ liệu sinh ra có thêm các trường mới, đổi tên trường cũ, hoặc thậm chí xóa bỏ các trường không còn sử dụng. Nếu hệ thống dữ liệu không thể xử lý những thay đổi này một cách uyển chuyển, toàn bộ pipeline (đường ống dữ liệu) sẽ bị gián đoạn.

**Schema Evolution (Tiến hóa cấu trúc)** là khả năng thay đổi cấu trúc của một bảng (như thêm, xóa, đổi tên cột, hay thay đổi kiểu dữ liệu) theo thời gian **mà không cần phải viết lại (rewrite) toàn bộ dữ liệu lịch sử**. Đây là một tính năng tối quan trọng trong các kiến trúc Data Lake và Lakehouse hiện đại.

---

## 1. Tại sao Schema Evolution lại quan trọng?

Trong các hệ thống cơ sở dữ liệu quan hệ (RDBMS) truyền thống, việc thay đổi schema (như `ALTER TABLE ADD COLUMN`) có thể rất tốn kém về mặt hiệu năng hoặc gây lock (khóa) bảng trong thời gian dài, đặc biệt với các bảng chứa hàng tỷ dòng.

Trong môi trường Big Data và Data Lake:
1. **Dữ liệu được lưu trữ dưới dạng file tĩnh** (như CSV, JSON, Parquet) trên Cloud Storage (S3, GCS).
2. Khi ứng dụng thay đổi, dữ liệu mới sẽ được ghi vào các file mới với cấu trúc (schema) mới.
3. Khi query, engine (ví dụ: Spark, Trino) phải đọc cả file cũ và file mới. Nếu schema của file cũ và mới không khớp nhau, query có thể bị lỗi (`SchemaMismatchException`) hoặc trả về dữ liệu sai lệch.

Schema Evolution giải quyết vấn đề này bằng cách thiết lập các quy tắc rõ ràng để đọc cả dữ liệu cũ và mới bằng một schema hợp nhất (unified schema) hoặc theo thời điểm lịch sử (time-travel).

---

## 2. Các Loại Thay Đổi Schema Thường Gặp

Một hệ thống hỗ trợ Schema Evolution toàn diện cần xử lý được các thao tác sau:

### 2.1. Thêm Cột (Add Column)
- **Tình huống:** Thêm các metric mới hoặc metadata vào dữ liệu.
- **Hành vi:** Dữ liệu mới sẽ chứa cột mới. Khi đọc dữ liệu lịch sử (không có cột này), hệ thống sẽ tự động điền giá trị `NULL`.

### 2.2. Xóa Cột (Drop / Remove Column)
- **Tình huống:** Một trường không còn được sử dụng do lo ngại về quyền riêng tư (như PII) hoặc ứng dụng không còn gửi.
- **Hành vi:** Schema mới sẽ không có cột này. Khi đọc dữ liệu cũ, hệ thống đơn giản là bỏ qua (không đọc) cột đó từ file vật lý.

### 2.3. Đổi Tên Cột (Rename Column)
- **Tình huống:** Đổi tên cột cho rõ nghĩa hơn (ví dụ: `cust_id` thành `customer_id`).
- **Hành vi:** Cột cũ và cột mới thực chất trỏ tới cùng một dữ liệu vật lý. Hệ thống phải biết cách map (ánh xạ) dữ liệu cũ của `cust_id` sang `customer_id` mà không cần sửa file cũ.

### 2.4. Thay Đổi Kiểu Dữ Liệu (Type Promotion / Widening)
- **Tình huống:** Kích thước dữ liệu vượt quá giới hạn hiện tại.
- **Hành vi:** Nâng cấp kiểu dữ liệu sang kiểu rộng hơn mà không làm mất thông tin. Ví dụ:
  - `INT` $\rightarrow$ `BIGINT`
  - `FLOAT` $\rightarrow$ `DOUBLE`
  - `DECIMAL(10,2)` $\rightarrow$ `DECIMAL(18,2)`

### 2.5. Đổi Vị Trí Cột (Reorder Columns)
- **Hành vi:** Đổi vị trí các cột trong bảng (ví dụ: đẩy cột `id` lên đầu). Tính năng này ít ảnh hưởng đến dữ liệu vật lý nhưng giúp trải nghiệm query tốt hơn.

---

## 3. Quy Tắc Tương Thích Schema (Schema Compatibility)

Khi quản lý schema bằng các công cụ như Schema Registry (Kafka), chúng ta thường bắt gặp các khái niệm về tương thích:

*   **Backward Compatibility (Tương thích ngược):** Mã (code) sử dụng schema *mới* có thể đọc được dữ liệu ghi bằng schema *cũ*. (Ví dụ: Thêm cột mới với giá trị mặc định, khi đọc dữ liệu cũ sẽ lấy giá trị mặc định).
*   **Forward Compatibility (Tương thích xuôi):** Mã sử dụng schema *cũ* có thể đọc dữ liệu ghi bằng schema *mới*. (Ví dụ: Xóa cột, mã cũ khi đọc dữ liệu mới sẽ không thấy cột bị xóa nhưng vẫn hoạt động bình thường nếu bỏ qua nó).
*   **Full / Both Compatibility:** Đảm bảo cả hai chiều trên.

---

## 4. Cách Các Định Dạng Lưu Trữ Xử Lý Schema Evolution

Cách dữ liệu được lưu trữ ảnh hưởng trực tiếp đến khả năng Schema Evolution.

### CSV và JSON
*   **Hỗ trợ:** Rất kém.
*   **Cơ chế:** Dựa vào thứ tự cột (CSV) hoặc tên field (JSON). Nếu một cột bị đổi tên hoặc chèn vào giữa trong CSV, toàn bộ quá trình đọc sẽ bị sai lệch cấu trúc. Việc quản lý thay đổi vô cùng thủ công và dễ vỡ.

### Apache Parquet
*   **Hỗ trợ:** Khá tốt (Schema Enforcement và Add Column).
*   **Cơ chế:** Parquet lưu trữ metadata và schema ở phần *footer* của mỗi file. Mặc định, Parquet giải quyết schema theo tên (Tên cột trong file khớp với tên cột khi query).
*   **Hạn chế:** Không thể tự động hiểu việc đổi tên cột. Đổi `id` thành `user_id` sẽ khiến Parquet hiểu là cột `id` bị drop (trả về NULL) và cột `user_id` mới được thêm vào (cũng NULL cho dữ liệu cũ).

### Apache Avro
*   **Hỗ trợ:** Xuất sắc. Rất phổ biến trong Streaming (Kafka).
*   **Cơ chế:** Avro lưu schema chuẩn (JSON format) cùng với dữ liệu. Nó sử dụng khái niệm **Writer's Schema** (lúc ghi) và **Reader's Schema** (lúc đọc). Khi đọc, Avro sẽ tự động so sánh hai schema và resolve (giải quyết) các khác biệt. Ví dụ, nếu Reader cần cột A nhưng Writer không có, Reader nhận giá trị mặc định. Nếu Writer có cột B nhưng Reader không cần, cột B bị bỏ qua.

---

## 5. Schema Evolution trong Table Formats (Lakehouse)

Đây là nơi Schema Evolution thực sự tỏa sáng ở quy mô Big Data. Table Formats giải quyết những hạn chế của Parquet bằng cách sử dụng metadata layer.

### Apache Iceberg
Iceberg là chuẩn mực cho in-place schema evolution (tiến hóa tại chỗ).
*   **Cách hoạt động (Column IDs):** Iceberg gán một **ID duy nhất** cho mỗi cột thay vì dùng tên cột làm định danh vật lý.
*   Khi bạn đổi tên cột `id` thành `user_id`, Iceberg chỉ cập nhật metadata (Tên `user_id` $\rightarrow$ Column ID `1`).
*   Dữ liệu lịch sử (Parquet files) bên dưới vẫn lưu trữ theo ID `1`. Do đó, không có dữ liệu nào cần được ghi lại. Xóa hay thêm cột cũng chỉ là việc cấp phát hoặc loại bỏ ID trong metadata.

### Delta Lake
Delta Lake hỗ trợ Schema Evolution kết hợp với Schema Enforcement (Ngăn chặn việc vô tình ghi dữ liệu rác).
*   **Schema Enforcement:** Nếu cố ghi DataFrame có schema khác với bảng Delta, thao tác sẽ bị từ chối để bảo vệ tính toàn vẹn dữ liệu.
*   **Schema Evolution (Merge Schema):** Khi bạn *chủ động* muốn cập nhật schema, bạn thêm tùy chọn `mergeSchema=true`. Delta sẽ tự động gộp (union) schema cũ và mới.
*   **Column Mapping:** Tương tự Iceberg, Delta (từ các bản cập nhật mới) hỗ trợ Column Mapping gán ID cho cột, cho phép đổi tên và xóa cột mà không cần viết lại Parquet.

### Apache Hudi
Hudi sử dụng cơ chế Schema Evolution kế thừa sức mạnh của Avro. Schema của bảng Hudi được duy trì trong `.hoodie` metadata dựa trên chuẩn Avro. Nó hỗ trợ backward compatibility rất mạnh mẽ, lý tưởng cho dữ liệu streaming có schema thay đổi liên tục.

---

## 6. Ví Dụ: Schema Evolution với Delta Lake (PySpark)

Giả sử bạn có một bảng lưu thông tin User. Hôm sau, đội Data Science yêu cầu thêm cột `age`.

```python
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

# 1. Tạo dữ liệu ban đầu
data_v1 = [("Alice", "HR"), ("Bob", "Engineering")]
schema_v1 = StructType([
    StructField("name", StringType(), True),
    StructField("department", StringType(), True)
])

df_v1 = spark.createDataFrame(data_v1, schema_v1)

# Ghi dữ liệu vào Delta Table
df_v1.write.format("delta").save("/tmp/users_delta")

# 2. Dữ liệu ngày thứ 2 có thêm cột 'age'
data_v2 = [("Charlie", "Sales", 28), ("Diana", "Marketing", 32)]
schema_v2 = StructType([
    StructField("name", StringType(), True),
    StructField("department", StringType(), True),
    StructField("age", IntegerType(), True) # Cột mới
])

df_v2 = spark.createDataFrame(data_v2, schema_v2)

# Cố gắng ghi đè hoặc thêm vào sẽ bị LỖI (Schema Enforcement)
# df_v2.write.format("delta").mode("append").save("/tmp/users_delta") # Lỗi: Schema mismatch

# Sử dụng option mergeSchema="true" để thực hiện Schema Evolution
df_v2.write.format("delta") \
    .mode("append") \
    .option("mergeSchema", "true") \
    .save("/tmp/users_delta")

# 3. Đọc lại bảng
spark.read.format("delta").load("/tmp/users_delta").show()
# Kết quả:
# +-------+-----------+----+
# |   name| department| age|
# +-------+-----------+----+
# |  Alice|         HR|null| <- Dữ liệu cũ tự động điền null cho cột age
# |    Bob|Engineering|null|
# |Charlie|      Sales|  28|
# |  Diana|  Marketing|  32|
# +-------+-----------+----+
```

---

## 7. Thách Thức và Best Practices

1.  **Chỉ cấp phép Type Widening, tránh Type Narrowing:** Chuyển từ `INT` lên `BIGINT` là an toàn vì không mất dữ liệu (widening). Nhưng từ `BIGINT` xuống `INT` có thể gây tràn số (narrowing) và phá vỡ sự tương thích. Table formats hiện đại thường cấm thao tác này.
2.  **Cẩn thận với kiểu dữ liệu phức tạp:** Schema Evolution trên các mảng (Arrays), Struct hay Map phức tạp thường khó khăn hơn và dễ sinh lỗi hơn các kiểu dữ liệu nguyên thủy (Primitive types).
3.  **Governance & Schema Registry:** Ở quy mô lớn, việc tự động `mergeSchema` mọi lúc có thể dẫn đến một bảng rác với hàng trăm cột không ai hiểu. Cần có quy trình kiểm duyệt (như tích hợp Confluent Schema Registry) để kiểm soát các phiên bản schema trước khi chúng được đẩy xuống Data Lake.
4.  **Tác động hiệu năng của 'Null' ngầm định:** Việc có hàng chục cột bị Drop nhưng vật lý vẫn nằm trên file cũ không tốn thêm dung lượng (bởi tính chất columnar storage của Parquet/ORC bỏ qua đọc rất nhanh), nhưng quá trình rewrite (compact/vacuum) sau này cần được lên lịch để dọn dẹp triệt để các file cũ.

---

## Tài Liệu Tham Khảo
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: Schema Evolution](https://iceberg.apache.org/docs/latest/evolution/)
* [Delta Lake: Schema Update - Databricks](https://docs.databricks.com/en/delta/update-schema.html)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
* [Confluent: Schema Registry and Schema Evolution](https://docs.confluent.io/platform/current/schema-registry/avro.html)
