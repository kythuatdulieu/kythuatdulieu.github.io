---
title: "Apache Iceberg - Định dạng bảng thế hệ mới"
category: "Data Lake & Lakehouse"
difficulty: "Advanced"
tags: ["data-lakehouse", "apache-iceberg", "open-table-format", "netflix", "acid", "metadata"]
readingTime: "12 mins"
lastUpdated: 2026-06-07
seoTitle: "Apache Iceberg là gì? Cuộc cách mạng Open Table Format cho Data Lake"
metaDescription: "Khám phá Apache Iceberg: Định dạng bảng mở do Netflix phát triển. Tính năng ACID, Hidden Partitioning, và cách Iceberg tối ưu hóa truy vấn Data Lake ở quy mô Petabyte."
---

# Apache Iceberg - Định dạng bảng thế hệ mới

## Summary

Apache Iceberg là một định dạng bảng mở (Open Table Format) hiệu năng cao dành cho các kho dữ liệu phân tích khổng lồ. Được tạo ra ban đầu bởi Netflix để giải quyết những giới hạn bế tắc của Apache Hive, Iceberg đóng vai trò là lớp "siêu dữ liệu" (metadata layer) trung gian nằm giữa các engine tính toán (như Spark, Trino, Snowflake) và lớp lưu trữ đám mây vật lý (S3, GCS). Iceberg mang đến khả năng giao dịch ACID an toàn, nâng cấp cấu trúc bảng (schema evolution) mượt mà, và tính năng "Hidden Partitioning" độc quyền. Cùng với Delta Lake, Iceberg đang là tiêu chuẩn thiết kế kiến trúc Lakehouse hiện đại.

---

## Definition

Trong hệ sinh thái Big Data, **Apache Iceberg** không phải là một công cụ thực thi tính toán (như Spark), cũng không phải là một định dạng file lưu trữ (như Parquet/ORC). 

Iceberg là một **Table Format** (Định dạng bảng). Nó là một bộ đặc tả kỹ thuật (specification) gồm các tệp manifest và metadata (JSON, Avro) định nghĩa thế nào là một "Bảng" dữ liệu phân tán. Iceberg giúp các Engine biết được bảng `sales` này gồm những file Parquet nào, nằm ở đâu, phân vùng ra sao, mà không cần phải quét qua toàn bộ cấu trúc thư mục (directory tree) đắt đỏ và thiếu chính xác như cơ chế cũ của Apache Hive.

---

## Why it exists

Suốt nhiều năm, Apache Hive là chuẩn mực (de facto) để định nghĩa bảng trên Hadoop/Data Lake. Bảng Hive theo dõi dữ liệu bằng khái niệm "Thư mục" (Folder-based). File Parquet nào bỏ vào thư mục `year=2026/month=06` thì tự động thuộc về phân vùng (partition) tháng 6/2026.

Tuy nhiên, cơ chế này của Hive gây ra các vấn đề nghiêm trọng khi Netflix phát triển kho dữ liệu lên hàng Petabytes:
1. **Quét thư mục quá lâu**: Nếu một bảng có 100,000 file, lệnh `SELECT` của Hive/Spark phải gọi AWS S3 API để "list" toàn bộ cấu trúc thư mục nhằm tìm file. Tác vụ này tốn hàng chục phút chỉ để... lên kế hoạch truy vấn (Query planning).
2. **Không có ACID**: Nếu quá trình ghi dữ liệu bị sập giữa chừng, thư mục S3 đã có chứa một nửa dữ liệu mới và một nửa dữ liệu cũ. Những ai đang đọc bảng đó sẽ đọc phải dữ liệu hỏng. Rất nguy hiểm.
3. **Partition lỏng lẻo**: Phải do người dùng tự quy định (Ví dụ `WHERE date_str = '2026-06-07'`). Nếu họ quên mệnh đề `WHERE` này, Spark sẽ Full-scan (quét toàn bộ) Petabyte dữ liệu, tiêu tốn hàng ngàn đô la điện toán.

Netflix tạo ra Iceberg để thiết kế lại hoàn toàn cách theo dõi "File" ở cấp độ từng tệp (File-level), thay vì cấp độ thư mục (Folder-level), giải quyết dứt điểm các cơn ác mộng trên.

---

## Core idea

Ý tưởng triết lý lớn nhất của Iceberg: **"Một bảng là một tập hợp các Files, chứ không phải là một Thư mục chứa Files."**

Bằng cách sử dụng một chuỗi cấu trúc Siêu dữ liệu phân cấp (Metadata files $\rightarrow$ Manifest lists $\rightarrow$ Manifest files), Iceberg theo dõi một cách chính xác từng file Parquet một. Nó biết file đó chứa cột gì, giá trị min/max của mỗi cột trong file đó là bao nhiêu. 

Khi thực hiện truy vấn, Iceberg không cần gọi S3 để liệt kê thư mục. Nó tải cấu trúc cây Metadata siêu nhỏ này vào RAM, cắt tỉa (Pruning) và tìm ra đích danh đúng 5 file Parquet cần đọc trong số hàng triệu file chỉ trong vòng vài mili-giây. Đây là tính toán cực kỳ thông minh (Data Skipping).

---

## Key Features (Các tính năng nổi bật)

1. **Giao dịch ACID**: Tương tự Delta Lake, hệ thống cung cấp Snapshot Isolation. Ghi và Đọc song song an toàn tuyệt đối.
2. **Hidden Partitioning (Phân vùng ẩn - *Vũ khí độc quyền*)**: 
   * Ở Hive, khi dữ liệu nguồn có cột timestamp (2026-06-07 10:15:00), ta phải viết ETL tạo thêm 1 cột `date_str = '2026-06-07'` để làm partition. Người dùng khi query bắt buộc phải biết `WHERE date_str = ...`.
   * Ở Iceberg, bạn chỉ cần chỉ định "Partition bảng theo **Ngày** của cột `timestamp` gốc". Iceberg sẽ tự xử lý ngầm (Hidden). Người dùng chỉ cần viết `WHERE timestamp > '2026-06-07'`, Iceberg tự động "chuyển hóa" câu lệnh và chỉ tìm đúng partition của ngày đó. Không còn lỗi Full-scan do con người quên cột partition.
3. **Schema Evolution chuẩn xác**: Thay tên cột, xóa cột, đổi kiểu dữ liệu (INT $\rightarrow$ BIGINT), thêm cột, đổi thứ tự cột... tất cả đều diễn ra mượt mà thông qua metadata. Không bao giờ bị lỗi do "trùng tên cột cũ" vì Iceberg quản lý cột bằng một ID ẩn không đổi, chứ không phải bằng Tên cột (Name-based).
4. **Time Travel và Version Rollback**: Xem lại dữ liệu quá khứ tại một snapshot ID cụ thể.

---

## Architecture / Flow

Iceberg theo dõi một bảng qua 3 tầng (Layers):

```mermaid
graph TD
    subgraph Catalog Layer
        A[Iceberg Catalog\nNessie, Hive Metastore, AWS Glue]
    end

    subgraph Metadata Layer (Tracking)
        B[Metadata JSON\nTable schema, Current Snapshot ID]
        C[Manifest List\nList of manifests for a snapshot]
        D1[Manifest File 1\nTracks files, partition bounds]
        D2[Manifest File 2\nTracks files, column min/max]
    end

    subgraph Data Layer (Storage on S3/GCS)
        E[Data File: Parquet 1]
        F[Data File: Parquet 2]
        G[Data File: ORC 3]
    end

    A -->|Pointers to latest| B
    B -->|Contains| C
    C -->|Points to| D1
    C -->|Points to| D2
    D1 -->|Points to| E
    D1 -->|Points to| F
    D2 -->|Points to| G
```

*Trong quá trình đọc, câu lệnh SQL sẽ đi qua Catalog $\rightarrow$ Metadata JSON $\rightarrow$ Manifest List $\rightarrow$ Lọc ra Manifest Files cần thiết dựa trên min/max $\rightarrow$ Cuối cùng mới chạm vào file Parquet thực tế. Cực kỳ tối ưu.*

---

## Practical example

Xây dựng bảng Iceberg bằng Spark SQL:

**1. Tạo bảng với Hidden Partitioning:**
```sql
CREATE TABLE local.db.events (
    event_id BIGINT,
    event_time TIMESTAMP,
    user_name STRING,
    event_type STRING
)
USING iceberg
-- Phân vùng ẩn: Tự động gom nhóm theo ngày từ cột event_time
PARTITIONED BY (days(event_time));
```

**2. Schema Evolution (Đổi tên cột ngay lập tức mà không cần viết lại dữ liệu):**
```sql
-- Thao tác này chỉ tốn vài mili-giây vì nó chỉ sửa file metadata JSON
ALTER TABLE local.db.events 
RENAME COLUMN user_name TO account_id;
```

**3. Time Travel (Lấy Snapshot):**
```sql
-- Đọc dữ liệu của bảng tại thời điểm Snapshot ID cụ thể
SELECT * FROM local.db.events 
FOR SYSTEM_VERSION AS OF 10963874102873;
```

---

## Best practices

* **Lựa chọn Catalog chất lượng**: Trái tim của Iceberg là Catalog (Nơi lưu con trỏ báo cho engine biết file `metadata.json` nào là mới nhất). Việc thiết lập catalog bằng AWS Glue, Snowflake, hoặc Project Nessie (cho phép quản lý data giống như Git: commit, branch, merge) là điều tối quan trọng để giữ an toàn cho dữ liệu.
* **Tối ưu hóa bảng định kỳ**: Tương tự Delta, các tính năng DML (Upsert/Delete) dạng Copy-on-Write hoặc Merge-on-Read trên file Parquet sẽ sinh ra rất nhiều file nhỏ rác. Phải cấu hình các tác vụ Compaction định kỳ (Rewrite Data Files) để hợp nhất chúng.
* **Không lạm dụng Time Travel**: Các bảng lớn cần chạy lệnh loại bỏ snapshot cũ (`ExpireSnapshots`) và file rác (`DeleteOrphanFiles`) để giảm tải tiền lưu trữ S3 và giữ cho cây Manifest list không bị phình to làm chậm tốc độ Compile query.

---

## Common mistakes

* **Quên dọn dẹp Orphan Files**: Khi các job Spark bị văng lỗi giữa chừng, hệ thống có thể tạo ra các file Parquet "trẻ mồ côi" (Orphan) nằm lại trên S3 nhưng không bao giờ được đưa vào file Manifest của Iceberg. Người dùng không thấy nó, nhưng công ty vẫn phải trả tiền lưu trữ. Lệnh dọn dẹp orphan files là bắt buộc.
* **Định nghĩa quá nhiều Partition nhỏ**: Dùng tính năng `hours()` hoặc `identity()` làm partition trên một cột có "high-cardinality" (quá nhiều giá trị khác biệt, ví dụ ID Khách Hàng) sẽ làm Iceberg sinh ra hàng triệu file Manifest. Metadata phình to sẽ bóp chết lợi thế siêu tốc của Iceberg.

---

## Trade-offs

### Ưu điểm
* **Trái tim mã nguồn mở (True Open Source)**: Không bị kiểm soát bởi một hãng phần mềm đám mây thương mại độc tôn (như Databricks với Delta). Iceberg đang được toàn bộ thế giới công nghệ như Snowflake, AWS, Google Cloud, Cloudera, Tabular hỗ trợ cực kỳ nồng nhiệt.
* **Hiệu năng Scale khổng lồ**: Tối ưu hóa cực tốt cho những bảng có dữ liệu lên đến hàng ngàn Petabytes, thứ mà Delta Lake hay Hive đôi khi vẫn gặp khó khăn ở khâu xử lý Metadata.
* **Hidden Partitioning thông minh**: Giải quyết hoàn toàn lỗi hiệu năng do người dùng viết thiếu bộ lọc trong SQL.

### Nhược điểm
* **Cài đặt và Vận hành phức tạp**: So với Delta Lake (nhấn 1 nút trên Databricks là có), việc tự vận hành hệ sinh thái Iceberg tích hợp với Kafka, Spark, Catalog đòi hỏi kỹ sư data phải cực kỳ am hiểu hệ thống hạ tầng lõi.
* **Tốc độ đọc/ghi dữ liệu siêu nhỏ (Streaming cấp độ giây)**: Dù rất mạnh trong Batch, nhưng việc Maintain cây Metadata liên tục khi nạp data Real-time (hàng nghìn transaction/s) vẫn tạo ra áp lực (overhead) cho Iceberg.

---

## When to use

* Doanh nghiệp muốn xây dựng **Kiến trúc Lakehouse hoàn toàn phi tập trung (Open Lakehouse)**, không bị khóa vào công nghệ của bất kỳ Vendor (Nhà cung cấp) đám mây nào. 
* Doanh nghiệp có nhiều phòng ban dùng nhiều Engine tính toán khác nhau (Data Science dùng Spark, BI dùng Trino/Athena, Finance dùng Snowflake) nhưng muốn tất cả truy vấn vào một vùng dữ liệu trung tâm thống nhất. Iceberg chính là ngôn ngữ giao tiếp chung tuyệt vời nhất.
* Bảng dữ liệu có dung lượng khổng lồ vượt mức hàng trăm Terabytes.

## When not to use

* Nếu công ty bạn đang toàn tâm toàn ý sử dụng Databricks, hãy cứ gắn bó với Delta Lake (Delta được tối ưu hóa riêng rất sâu cho nền tảng của họ).
* Nếu chỉ xử lý file CSV vài trăm Megabytes, Iceberg mang lại nhiều sự phức tạp về mặt Setup mà không đem lại cải thiện tốc độ nào rõ rệt.

---

## Related concepts

* [Data Lakehouse](/concepts/lakehouse)
* [Delta Lake](/concepts/delta-lake)
* [Apache Spark](/concepts/apache-spark)
* [Parquet](/concepts/parquet)

---

## Interview questions

### 1. Phân biệt sự khác nhau giữa "Folder-based partition" của Apache Hive và "Hidden Partition" của Apache Iceberg. Tại sao Hidden Partition lại ngăn ngừa được thảm họa hiệu năng (Full Table Scan)?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết bản chất về quy hoạch thư mục và nguyên nhân rò rỉ tài nguyên hệ thống.
* **Gợi ý trả lời**:
  * **Hive (Folder-based)**: Ép buộc người dùng và cấu trúc thư mục phải hòa làm một. Nếu thư mục lưu dữ liệu tên là `month_id=06`, người dùng viết SQL bắt buộc phải gõ mệnh đề `WHERE month_id = 06`. Nếu người dùng không rành hệ thống, họ gõ lệnh truy vấn dựa trên cột thật `WHERE order_date = '2026-06-01'`. Hive không hiểu, nó sẽ làm "Full Table Scan" (đọc toàn bộ các file trong tất cả các tháng trên ổ cứng) để tìm kết quả. Việc này làm sập hiệu năng.
  * **Iceberg (Hidden)**: Chia tách logic hiển thị với logic lưu trữ. Iceberg khai báo ngầm việc "chia vùng thư mục theo Tháng" dựa trên bản chất cột `order_date`. Người dùng tự do viết câu SQL tự nhiên `WHERE order_date = '2026-06-01'`. Iceberg bắt được lệnh này, nó âm thầm suy diễn ra là "Chỉ cần quét thư mục tháng 6", và cắt bỏ 11 thư mục của tháng khác. Thảm họa hiệu năng bị dập tắt ngay từ trong trứng nước.

### 2. Sự khác biệt cốt lõi trong Schema Evolution của Iceberg so với các hệ thống cũ là gì? Tại sao việc đổi tên cột (Rename) trong Iceberg không cần phải viết đè lại dữ liệu (Rewrite Data)?
* **Người phỏng vấn muốn kiểm tra**: Kiến thức quản lý Metadata cấp độ Column-level ID.
* **Gợi ý trả lời**: Hệ thống cũ quản lý cột bằng "Tên cột" (Name-based). Nếu file Parquet cũ lưu tên cột là `user_id`, ta không thể đổi nó thành `account_id` mà không đập file Parquet đi xây lại, vì Parquet vật lý chứa cái tên gốc.
Iceberg sử dụng **ID duy nhất cho cột (Unique Column IDs)**. Trong `metadata.json`, Iceberg ánh xạ ID `123` = Tên hiển thị `user_id`. File Parquet vật lý dưới đĩa được đọc theo ID `123`.
Khi gõ lệnh Đổi tên thành `account_id`, Iceberg chỉ làm duy nhất một việc là sửa file `metadata.json` (Đổi ánh xạ ID `123` = Tên `account_id`). Thao tác này mất 2 mili-giây. Mọi file Parquet cũ dưới đĩa (vốn đang bám theo ID `123`) lập tức tự động đồng nhất với cái tên mới mà không cần bất kỳ động tác copy (rewrite) vật lý nào cả.

---

## References

1. **Iceberg Specification Docs** (Tài liệu gốc mô tả cách tổ chức cây Manifest cực kỳ kinh điển của Apache Iceberg).
2. **Netflix Tech Blog**: "How Netflix built Iceberg" (Hành trình và lý do ra đời của dự án).
3. **Fundamentals of Data Engineering** - Joe Reis.

---

## English summary

Apache Iceberg is a high-performance open table format designed to manage massive analytics datasets on Data Lakes (Lakehouse architecture). Originating at Netflix to solve the severe performance scalability and reliability issues of Apache Hive, Iceberg completely abandons folder-based tracking in favor of precise, file-level metadata tracking (via Manifest trees). This innovative design enables robust ACID transactions, safe and instant Schema Evolution (via unique column IDs), and the game-changing "Hidden Partitioning" feature, which protects users from accidental full-table scans without requiring them to know the physical data layout. As an independent open standard, Iceberg serves as the universal metadata bridge allowing various analytical engines (Spark, Trino, Snowflake) to concurrently process petabytes of data on cost-effective cloud storage.
