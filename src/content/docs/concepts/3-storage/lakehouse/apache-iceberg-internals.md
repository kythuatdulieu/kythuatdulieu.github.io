---
title: "Apache Iceberg: Metadata Tree & OCC"
description: "Deep-dive vào kiến trúc nội bộ của Apache Iceberg, cấu trúc Metadata Tree và cơ chế Optimistic Concurrency Control (OCC)."
---

# Apache Iceberg: Metadata Tree & Optimistic Concurrency Control (OCC)

Apache Iceberg không phải là một công cụ thực thi truy vấn (query engine) hay một hệ thống lưu trữ phân tán. Nó là một **Table Format** hiệu suất cao dành cho các Data Lake quy mô lớn. Sức mạnh cốt lõi của Iceberg nằm ở cách nó quản lý metadata dưới dạng cây (Metadata Tree) và xử lý đồng thời thông qua Optimistic Concurrency Control (OCC).

## 1. Cấu trúc Metadata Tree

Iceberg theo dõi toàn bộ trạng thái của một bảng (table) qua các thời điểm khác nhau bằng cách sử dụng một cấu trúc dữ liệu phân cấp được gọi là **Metadata Tree**.

```mermaid
flowchart TD
    Catalog["Catalog (REST, Hive Metastore, Glue)"]
    Meta1["Metadata File (v1.metadata.json)"]
    Meta2["Metadata File (v2.metadata.json)"]
    
    ManifestList["Manifest List (snap-123.avro)"]
    
    Manifest1["Manifest File 1 (.avro)"]
    Manifest2["Manifest File 2 (.avro)"]
    
    Data1["Data File (Parquet/ORC)"]
    Data2["Data File (Parquet/ORC)"]
    Data3["Data File (Parquet/ORC)"]

    Catalog -- "Pointer (Current Snapshot)" --> Meta2
    Catalog -.- "Old Pointer" -.- Meta1
    
    Meta2 -- "Snapshot-123" --> ManifestList
    
    ManifestList -- "Partition Stats" --> Manifest1
    ManifestList -- "Partition Stats" --> Manifest2
    
    Manifest1 -- "File Paths, Min/Max" --> Data1
    Manifest1 -- "File Paths, Min/Max" --> Data2
    Manifest2 -- "File Paths, Min/Max" --> Data3
```

### Kiến trúc các tầng (Levels):
1. **Catalog**: Là điểm neo (entry point) của Iceberg. Nó chỉ lưu một con trỏ (pointer) duy nhất trỏ tới `metadata.json` hiện tại của bảng. Phép cập nhật con trỏ này phải là một thao tác **atomic** (nguyên tử).
2. **Metadata File (`.json`)**: Lưu trữ schema, phân vùng (partition spec), các thuộc tính (properties), và danh sách các **Snapshots**. Một bảng sẽ có nhiều file metadata qua thời gian, nhưng catalog chỉ trỏ tới file mới nhất.
3. **Manifest List (`.avro`)**: Mỗi Snapshot trỏ tới một file Manifest List. File này chứa danh sách các Manifest Files, đồng thời lưu trữ các metadata tổng hợp (thống kê phân vùng, số file thêm/xóa) giúp engine lọc (skip) nhanh các Manifest File không liên quan.
4. **Manifest File (`.avro`)**: File này theo dõi trực tiếp các Data Files. Nó lưu đường dẫn tuyệt đối (absolute path) tới các file Parquet/ORC, kèm theo thống kê chi tiết ở mức độ cột (column-level stats: `min`, `max`, `null_count`).
5. **Data Files**: Nơi chứa dữ liệu thực tế.

## 2. Tại sao Iceberg không dùng lệnh list thư mục `O(N)` của S3?

Các hệ thống truyền thống (như Apache Hive) thiết kế bảng dựa trên các **thư mục (directories)**. Khi một query engine như Spark/Presto truy vấn một bảng Hive trên S3, nó phải thực hiện lệnh `LIST` trên thư mục S3 (`O(N)` độ phức tạp, với N là số lượng file). 

**Vấn đề của Hive/S3:**
- S3 `LIST` API cực kỳ chậm và tốn kém khi thư mục có hàng triệu file. S3 thường chỉ trả về 1000 objects mỗi API call, dẫn đến hiện tượng nghẽn cổ chai (throttling).
- Tính toàn vẹn (Consistency) bị phá vỡ nếu có một job đang ghi file mới vào thư mục trong khi lệnh `LIST` đang diễn ra.

**Cách Iceberg giải quyết:**
Iceberg thay đổi mô hình quản lý từ **"Thư mục (Directories)"** sang **"File-level (Đối tượng File)"**.
- **Không bao giờ dùng lệnh LIST**: Query engine không cần hỏi S3 "thư mục này có những file nào". Thay vào đó, nó đọc **Manifest File** bằng phép toán `O(1)` để lấy trực tiếp đường dẫn tuyệt đối của tất cả các file Parquet cần thiết.
- **Data Skipping hiệu quả**: Dựa vào thống kê `min/max` có sẵn trong Manifest List và Manifest File, query engine loại bỏ hàng loạt các block dữ liệu không thỏa mãn điều kiện `WHERE` trước khi phải mở trực tiếp file dữ liệu.

## 3. Optimistic Concurrency Control (OCC) xử lý xung đột ghi đồng thời như thế nào?

Trong môi trường Data Lakehouse, việc có nhiều process (Spark, Flink, Trino) cùng đọc/ghi đồng thời vào một bảng là rất phổ biến. Thay vì sử dụng cơ chế khóa bi quan (Pessimistic Locking) gây đình trệ (block) các quá trình khác, Iceberg áp dụng **Optimistic Concurrency Control (OCC)**.

Triết lý của OCC là: *Sự xung đột ghi (Write Conflicts) thường hiếm khi xảy ra. Cứ để các writers xử lý độc lập, chỉ kiểm tra xung đột ở phút chót (lúc commit).*

### Vòng đời của một Commit theo cơ chế OCC:
1. **Read (Đọc trạng thái hiện tại):** Writer đọc Catalog để lấy phiên bản Metadata hiện tại (gọi là *Base Snapshot*).
2. **Stage (Thực thi độc lập - Isolation):** Writer bắt đầu ghi Data Files mới và sinh ra Manifest Files / Manifest List mới. Toàn bộ quá trình này diễn ra cô lập trên Storage, không ai nhìn thấy dữ liệu này cho đến khi nó được commit.
3. **Atomic Commit & Compare-and-Swap (CAS):** 
   - Writer gửi yêu cầu tới Catalog để cập nhật con trỏ: *"Đổi con trỏ từ Base Snapshot sang New Metadata File"*.
   - Catalog sử dụng **Compare-and-Swap (CAS)** để kiểm tra: "Base Snapshot lúc writer bắt đầu có còn là phiên bản hiện tại trên Catalog không?".
   - **Thành công:** Nếu chưa có ai commit chen vào giữa, thao tác đổi con trỏ diễn ra atomic. Dữ liệu mới lập tức khả dụng (Snapshot Isolation).

### Xử lý Xung đột và Retry Loop
Nếu thao tác CAS thất bại (nghĩa là một Writer B khác đã commit thành công trong lúc Writer A đang thực thi), Iceberg không bắt Writer A phải chạy lại toàn bộ từ đầu. Thay vào đó, hệ thống thực hiện một **Retry Loop**:
- Iceberg lấy *Metadata Snapshot mới nhất* do Writer B vừa tạo.
- Xác minh (Validate) xem dữ liệu Writer A vừa tính toán có **xung đột luận lý** với Writer B không.
    - *Ví dụ:* Writer A ghi vào partition `date=2023-01-01`, Writer B xóa dữ liệu ở `date=2023-01-02`. Sự thay đổi này độc lập, Iceberg tiến hành **Merge** các thay đổi của A lên trên snapshot của B và tự động thử commit lại.
    - *Ví dụ (Xung đột nghiêm trọng):* Writer A và Writer B cùng UPDATE/DELETE một Row. Khi đó, Retry sẽ thất bại (nảy sinh `CommitFailedException`) để ngăn chặn việc hỏng dữ liệu (Data Corruption).

---

- Netflix Technology Blog: How Netflix manages Petabyte scale data with Iceberg
- Apple Engineering Blog: Modernizing Data Lakehouse Architecture with Apache Iceberg
- Tabular Blog: Iceberg Metadata: The Secret to High Performance
- Tabular Blog: Adaptive Metadata Trees and the Future of Iceberg
- CIDR 2023 Paper: Analyzing and Comparing Lakehouse Storage Systems (LHBench)
