---
title: "Schema Evolution"
category: "Data Lake & Lakehouse"
difficulty: "Intermediate"
tags: ["schema-evolution", "data-lakehouse", "table-format", "data-engineering"]
readingTime: "8 mins"
lastUpdated: 2026-06-07
seoTitle: "Schema Evolution - Quản lý cấu trúc dữ liệu Data Lake"
metaDescription: "Tìm hiểu Schema Evolution là gì: cơ chế tự động thích ứng với thay đổi cấu trúc bảng (thêm, xóa, đổi tên cột) mà không cần ghi lại dữ liệu cũ trên Data Lake."
---

# Schema Evolution

## Summary

Schema Evolution (Tiến hóa lược đồ) là một tính năng mạnh mẽ của các hệ thống quản lý dữ liệu hiện đại (đặc biệt là các Table Formats như Apache Iceberg, Delta Lake) cho phép thay đổi cấu trúc của một bảng (thêm cột, đổi kiểu dữ liệu, đổi tên cột, xóa cột) một cách an toàn mà không cần phải ghi lại (rewrite) toàn bộ dữ liệu lịch sử đã lưu trước đó. Điều này giúp các Data Pipeline trở nên linh hoạt và bền bỉ trước sự thay đổi liên tục của dữ liệu từ các hệ thống nguồn.

---

## Definition

**Schema Evolution** là quá trình tự động theo dõi, quản lý và áp dụng các thay đổi trong định nghĩa của một lược đồ dữ liệu (schema) theo thời gian. Khi lược đồ thay đổi, hệ thống đảm bảo rằng các truy vấn vẫn có thể đọc cả dữ liệu cũ (được ghi bằng lược đồ cũ) và dữ liệu mới (được ghi bằng lược đồ mới) một cách liền mạch, không gây ra lỗi tương thích (compatibility errors) hay yêu cầu việc thực hiện các thao tác DDL tốn kém như `ALTER TABLE ...` rồi `UPDATE` toàn bộ hệ thống.

---

## Why it exists

Trong quá trình phát triển phần mềm, cấu trúc dữ liệu ở hệ thống vận hành (OLTP) thay đổi liên tục: một tính năng mới yêu cầu thêm cột `user_tier`, hoặc một cột `phone_number` bị đổi từ kiểu `INT` sang `VARCHAR`.

Trước đây, khi đẩy dữ liệu này vào Data Warehouse hoặc Data Lake dựa trên Hive:
1. **Lỗi Pipeline**: Nếu Schema của dữ liệu đến không khớp chính xác 100% với Schema của bảng đích, job ETL/ELT sẽ "crash" (đổ vỡ).
2. **Chi phí cập nhật khổng lồ**: Để đổi tên một cột hoặc xóa một cột trong Data Lake truyền thống (sử dụng Parquet trơn), kỹ sư dữ liệu phải đọc toàn bộ petabytes dữ liệu, biến đổi, và ghi lại thành các tệp Parquet mới. Quá trình này có thể mất hàng ngày và tốn hàng ngàn đô la chi phí máy chủ.
3. **Mất an toàn dữ liệu**: Đôi khi dữ liệu mới được ép kiểu (cast) tự động vào kiểu cũ gây mất mát thông tin (ví dụ FLOAT thành INT) mà không có cảnh báo.

Schema Evolution ra đời để biến việc thay đổi cấu trúc trở thành một **thao tác metadata (siêu dữ liệu) tức thì**, giải phóng kỹ sư dữ liệu khỏi những cơn ác mộng bảo trì pipeline.

---

## Core idea

Cơ chế cốt lõi của Schema Evolution khác nhau tùy vào công nghệ, nhưng ý tưởng chung tốt nhất (được áp dụng bởi Apache Iceberg) là **Sử dụng ID cột duy nhất (Column ID Tracking)** thay vì dựa vào Tên cột (Column Name).

1. **Gán ID cho cột**: Khi một bảng được tạo, mỗi cột được gán một ID duy nhất và bất biến. Ví dụ: cột `id` có ID=1, cột `name` có ID=2.
2. **Bản đồ Metadata**: Table Format duy trì một tệp metadata ánh xạ Tên Cột hiện tại vào ID của nó. Dữ liệu vật lý (tệp Parquet) bên dưới luôn được tham chiếu bằng ID.
3. **Đổi tên / Thay đổi không chạm vào file vật lý**:
   - Nếu bạn đổi `name` thành `full_name`, hệ thống chỉ cập nhật bản đồ trong metadata: `full_name` -> ID=2. Các tệp Parquet cũ vẫn giữ nguyên, khi engine đọc, nó thấy yêu cầu đọc `full_name`, nó tra metadata ra ID=2, và đọc dữ liệu của ID=2 trong file cũ trả về.
4. **Cấp phát giá trị mặc định**: Nếu thêm cột `age` (ID=3), hệ thống cập nhật metadata. Khi đọc các file Parquet cũ (chưa có ID=3), engine tự động trả về `NULL` cho cột `age` mà không bị lỗi.

---

## How it works

Cách các quy tắc tiến hóa cơ bản được xử lý khi đọc dữ liệu:

* **Thêm cột (Add column)**: Engine đọc dữ liệu cũ, không thấy cột đó, sẽ trả về giá trị mặc định (thường là NULL).
* **Xóa cột (Drop column)**: Metadata đánh dấu cột đó (ví dụ ID=2) bị ẩn đi. Engine đọc file cũ sẽ bỏ qua không lấy dữ liệu của cột ID=2 lên bộ nhớ. (Dữ liệu rác vẫn nằm trong file cũ cho đến khi bị compact, nhưng người dùng không thấy).
* **Đổi tên cột (Rename column)**: Engine dùng ánh xạ từ metadata (như mô tả ở trên). Dựa vào Column ID, engine đọc được đúng dữ liệu dù file cũ có lưu tên cột là gì.
* **Đổi kiểu (Type promotion/Upcasting)**: Nâng cấp kiểu dữ liệu an toàn (ví dụ `INT` -> `BIGINT`, `FLOAT` -> `DOUBLE`). Khi đọc file cũ có chứa `INT`, engine tự động ép kiểu thành `BIGINT` trên bộ nhớ (on-the-fly) trước khi trả về.

---

## Architecture / Flow

```mermaid
graph TD
    subgraph Metadata Layer
        SchemaV1[Schema V1<br/>1: id (INT)<br/>2: email (STRING)]
        SchemaV2[Schema V2<br/>1: id (INT)<br/>2: user_email (STRING)<br/>3: age (INT)]
    end
    
    subgraph Physical Data Files
        File1[File 1 (Written with V1)<br/>Contains IDs: 1, 2]
        File2[File 2 (Written with V2)<br/>Contains IDs: 1, 2, 3]
    end
    
    subgraph Query Execution (SELECT * FROM table)
        Engine[Query Engine]
    end

    SchemaV1 -->|Evolves to| SchemaV2
    Engine -->|Reads current schema| SchemaV2
    
    File1 -->|Reads ID 1, 2. ID 3 is NULL| Engine
    File2 -->|Reads ID 1, 2, 3| Engine
    
    Note right of SchemaV2: Đổi tên 'email' -> 'user_email' (ID 2 giữ nguyên)<br/>Thêm cột 'age' (Cấp ID 3)
```

---

## Practical example

Ví dụ sử dụng Spark với **Delta Lake** để tự động tiến hóa schema khi có thêm cột mới trong quá trình ghi dữ liệu:

```python
# DataFrame cũ có 2 cột
df_v1 = spark.createDataFrame([(1, "Alice")], ["id", "name"])
df_v1.write.format("delta").save("/tmp/my_table")

# DataFrame mới có thêm cột 'age'
df_v2 = spark.createDataFrame([(2, "Bob", 30)], ["id", "name", "age"])

# Nếu lưu bình thường sẽ báo lỗi Schema Mismatch.
# Sử dụng mergeSchema để kích hoạt Schema Evolution:
df_v2.write.format("delta") \
     .mode("append") \
     .option("mergeSchema", "true") \
     .save("/tmp/my_table")

# Khi đọc lại:
spark.read.format("delta").load("/tmp/my_table").show()
# Kết quả:
# +---+-----+----+
# | id| name| age|
# +---+-----+----+
# |  1|Alice|null| -> File cũ tự động nhận NULL cho cột age
# |  2|  Bob|  30|
# +---+-----+----+
```

---

## Best practices

* **Thiết lập cảnh báo / Validation**: Dù hệ thống cho phép tự động tiến hóa, bạn vẫn nên có cơ chế validation ở đầu vào (ví dụ dùng thư viện Great Expectations). Đôi khi sự thay đổi schema ở nguồn là một lỗi do con người (ví dụ typo tên cột) chứ không phải thay đổi nghiệp vụ.
* **Tránh Downcasting**: Schema evolution chỉ hỗ trợ "nâng cấp" kiểu dữ liệu (widening). Không thể tự động thay đổi từ kiểu dữ liệu rộng sang kiểu hẹp (ví dụ `STRING` thành `INT`) vì có thể gây mất hoặc lỗi dữ liệu. Trong trường hợp này, hãy tạo cột mới hoặc ghi đè (overwrite) lại bảng.
* **Sử dụng Column ID Tracking (Iceberg)**: Nếu đang thiết kế Data Lake mới từ đầu, Apache Iceberg có hệ thống theo dõi Schema Evolution ưu việt hơn nhờ Column IDs so với một số Table Format khác vẫn còn phụ thuộc một phần vào việc khớp tên cột.

---

## Common mistakes

* **Xóa cột vô tội vạ**: Mặc dù thao tác xóa cột diễn ra nhanh chóng trên metadata, nhưng bản chất file vật lý cũ chưa được làm sạch. Nếu một bảng bị thêm/xóa cột liên tục hàng ngàn lần, file metadata sẽ trở nên quá cồng kềnh.
* **Lạm dụng "mergeSchema = true"**: Bật tự động merge schema cho tất cả các job có thể khiến bảng lưu trữ tích tụ hàng chục cột "rác" do các nguồn dữ liệu gửi sai định dạng vào. Tốt nhất nên để thao tác Schema Evolution là chủ động (Explicit DDL) qua các lệnh `ALTER TABLE` có kiểm soát.

---

## Trade-offs

### Ưu điểm
* Giải phóng nguồn lực Data Engineer khỏi việc phải bảo trì thủ công các lỗi pipeline do đổi cấu trúc.
* Cho phép dữ liệu liên tục chảy vào hệ thống mà không có downtime.
* Không phải thực hiện các tác vụ backfill/rewrite tốn hàng giờ/ngày để sửa schema cũ.

### Nhược điểm
* **Nguy cơ tích tụ nợ kỹ thuật (Technical Debt)**: Lược đồ bảng có thể trở thành một bãi rác các cột với hàng chục cột null nếu không được quản trị cẩn thận.
* **Phức tạp ở tầng đọc**: Engine phải thực hiện nhiều phép toán kiểm tra và ánh xạ metadata khi đọc dữ liệu, gây ra một chút độ trễ nhỏ so với việc đọc một tệp có cấu trúc cố định từ đầu đến cuối.

---

## When to use

* Pipeline ETL/ELT lấy dữ liệu từ các API bên thứ 3 (Facebook Ads, Google Analytics) nơi cấu trúc JSON trả về có thể thay đổi liên tục không báo trước.
* Kiến trúc Data Lakehouse sử dụng các Table Formats (Iceberg, Delta, Hudi).
* Môi trường phát triển ứng dụng linh hoạt (Agile) nơi schema của database OLTP thay đổi mỗi tuần.

## When not to use

* Các Core Data Warehouse (như mô hình Kimball Star Schema) cần tính tuân thủ và độ chính xác cấu trúc tuyệt đối. Tại đây, mọi thay đổi schema phải được phê duyệt và quy hoạch cẩn thận chứ không được tự động tiến hóa.

---

## Related concepts

* [Table Format](/concepts/table-format)
* [Data Lakehouse](/concepts/data-lakehouse)
* [Delta Lake](/concepts/delta-lake)
* [Apache Iceberg](/concepts/apache-iceberg)

---

## Interview questions

### 1. Tại sao Apache Iceberg được cho là hỗ trợ Schema Evolution tốt hơn Apache Hive truyền thống?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết sâu về cách hệ thống theo dõi metadata.
* **Gợi ý trả lời (Strong Answer)**: 
  Apache Hive theo dõi cột dựa vào **Tên Cột (Column Name)** hoặc **Vị trí (Position)** trong file. Do đó, nếu đổi tên cột hoặc xóa cột ở giữa, Hive sẽ bị nhầm lẫn dữ liệu hoặc báo lỗi khi đọc file cũ. Ngược lại, Apache Iceberg gán cho mỗi cột một **ID duy nhất và bất biến**. Bất kể bạn đổi tên hay thứ tự cột, hệ thống vẫn dùng ID này để tham chiếu vào dữ liệu bên trong file Parquet. Nhờ vậy, Iceberg xử lý việc Rename và Drop cột một cách hoàn hảo và an toàn (O(1) metadata operation).

### 2. Upcasting (Widening) trong Schema Evolution là gì? Tại sao hệ thống thường không hỗ trợ Downcasting?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết về kiểu dữ liệu và rủi ro mất mát dữ liệu.
* **Gợi ý trả lời (Strong Answer)**:
  Upcasting là việc thay đổi kiểu dữ liệu của một cột sang một kiểu rộng hơn có thể bao hàm hoàn toàn kiểu cũ (ví dụ: `INT` -> `BIGINT` hoặc `FLOAT` -> `DOUBLE`). Điều này an toàn và được hệ thống thực hiện tự động khi đọc. Downcasting (ví dụ: `BIGINT` -> `INT` hoặc `STRING` -> `DATE`) không được hỗ trợ tự động vì nguy cơ tràn bộ nhớ (overflow) hoặc lỗi phân tích chuỗi (parse error) trên dữ liệu cũ đang tồn tại, gây ra hỏng hóc dữ liệu hoặc sai lệch tính toán ở hạ nguồn.

---

## References

1. **Apache Iceberg Documentation**: Schema Evolution (iceberg.apache.org/evolution) - Giải thích chi tiết về Column ID tracking.
2. **Delta Lake Documentation**: Schema Validation & Evolution.

---

## English summary

Schema Evolution is a critical feature in modern Data Lakehouse architectures (via table formats like Iceberg, Delta Lake, and Hudi) that allows users to modify a table's structure—such as adding, dropping, renaming, or upcasting columns—without the need to rewrite historical data files. By utilizing metadata mapping and unique column ID tracking, query engines can seamlessly read old data formats alongside new ones. This eliminates costly pipeline breakages and rewrite operations when upstream source schemas change, significantly enhancing the agility and reliability of data engineering workflows.
