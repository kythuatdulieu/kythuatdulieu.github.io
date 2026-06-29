---
title: "Internals: Optimistic Concurrency Control (OCC) trong Delta Lake"
difficulty: "Advanced"
tags: ["delta-lake", "occ", "transactions", "acid", "databricks", "concurrency"]
readingTime: "15 mins"
lastUpdated: 2026-06-29
seoTitle: "Optimistic Concurrency Control trong Delta Lake: Kiến trúc và Rủi ro"
metaDescription: "Phân tích kiến trúc của Optimistic Concurrency Control (OCC) trong Delta Lake. Các vấn đề xung đột ghi, Atomic Commits, Deletion Vectors và Retry Storms."
description: "Phân tích kiến trúc của Optimistic Concurrency Control (OCC) trong Delta Lake. Các vấn đề xung đột ghi, Atomic Commits trên Cloud Storage, Deletion Vectors và các rủi ro vận hành thực chiến."
---

Khi chuyển dịch từ Data Warehouse (RDBMS) sang kiến trúc Data Lakehouse, một trong những thách thức lớn nhất là vấn đề **Concurrency (Đồng thời)**. Các hệ thống Object Storage (như Amazon S3, ADLS Gen2) vốn được thiết kế cho thao tác *append-only* và hoàn toàn không có khái niệm "Row-level lock" hay "Table lock" như PostgreSQL hay MySQL. 

Vậy, điều gì xảy ra nếu có hai job Spark cùng lúc chạy lệnh `UPDATE` hoặc `MERGE INTO` trên cùng một bảng Delta Lake? Để đảm bảo tính ACID (đặc biệt là Isolation - Cô lập), Delta Lake sử dụng cơ chế **Optimistic Concurrency Control (OCC - Kiểm soát đồng thời lạc quan)**. 

Dưới lăng kính của một **Staff Data Engineer**, bài viết này sẽ mổ xẻ cách OCC hoạt động ở tầng vật lý, những sự đánh đổi hệ thống (systemic trade-offs) và các "tai nạn" thường gặp (Operational Risks) khi vận hành hệ thống phân tán ở quy mô Petabyte.

---

## 1. Physical Execution của OCC (Kiến trúc 3 Pha)

Thay vì sử dụng phương pháp **Pessimistic Locking** (Khóa bi quan - chặn ngay từ đầu, bắt các query khác phải xếp hàng đợi như trong RDBMS truyền thống gây thắt cổ chai throughput), Delta Lake đặt cược vào **Optimistic Concurrency Control**. 

Nguyên lý cơ bản: *Cứ để tất cả các job cùng đọc và xử lý tính toán song song. Xung đột chỉ được kiểm tra ở khoảnh khắc "commit" cuối cùng vào Transaction Log.*

Mọi giao dịch ghi trong Delta Lake đều trải qua giao thức 3 pha (3-Phase Protocol):

```mermaid
sequenceDiagram
    participant Job A
    participant Storage (Parquet)
    participant Delta Log (_delta_log)
    participant Job B
    
    Note over Job A, Delta Log: Snapshot V1 (00001.json)
    
    Job A->>Delta Log: 1. READ("Latest version = 1")
    Job B->>Delta Log: 1. READ("Latest version = 1")
    
    Job A->>Storage: 2. WRITE("Tạo file part-A.parquet")
    Job B->>Storage: 2. WRITE("Tạo file part-B.parquet")
    
    Note over Storage: Các file Parquet lúc này là "mồ côi", chưa có trong bảng.
    
    Job A->>Delta Log: 3. VALIDATE & COMMIT("Ghi 00002.json")
    Note over Delta Log: Lệnh Put-If-Absent thành công.<br/>Bảng hiện tại là V2.
    
    Job B->>Delta Log: 3. VALIDATE & COMMIT("Ghi 00002.json")
    Note over Delta Log: Bị từ chối (FileAlreadyExists)!
    
    Job B-->>Job B: Chạy thuật toán Auto-Merge (Conflict Resolution)
```

1.  **READ (Đọc Snapshot):** Giao dịch đọc phiên bản mới nhất của bảng (ví dụ: `000001.json`). Nó lấy danh sách các file dữ liệu (metadata) mà nó cần đọc. Hệ thống ghi nhận (record) snapshot `V1`.
2.  **WRITE (Ghi Dữ liệu):** Job (ví dụ Spark) tiến hành xử lý phân tán và đẩy các file `.parquet` mới lên Storage. Ở bước này, dữ liệu đã nằm trên S3/ADLS nhưng *tuyệt đối vô hình* với người dùng vì chưa có commit log nào xác nhận. Việc này tốn chi phí Compute và Storage I/O.
3.  **VALIDATE & COMMIT (Xác nhận & Ghi Log):** Job cố gắng đẩy một file log mới `000002.json` vào thư mục `_delta_log`. 
    *   Nếu thành công, giao dịch hoàn tất.
    *   Nếu file `000002.json` đã tồn tại (do Job A nhanh tay hơn), Delta Lake sẽ ném ra lỗi xung đột và bước vào pha **Conflict Resolution**.

---

## 2. Atomic Commit trên Object Storage

Sự thành bại của OCC phụ thuộc 100% vào khả năng hệ thống lưu trữ có hỗ trợ **Atomic Commit** (Ghi nguyên tử) hay không. Delta Lake dựa vào tính năng `Put-If-Absent` (Chỉ tạo file nếu file đó chưa tồn tại).

-   **Azure Data Lake Storage (ADLS Gen2) & HDFS:** Hỗ trợ Atomic Rename tự nhiên.
-   **Google Cloud Storage (GCS):** Sử dụng *Precondition checks* (`If-Generation-Match: 0`) để đảm bảo không ai ghi đè lên file log đang được tạo.
-   **Amazon S3:** Trong quá khứ, S3 chỉ có mô hình *Eventual Consistency* và thiếu thao tác `Put-If-Absent`. Các Data Engineer từng phải dựng một bảng Amazon DynamoDB (`LogStore`) làm cơ chế Locking. Hiện nay, S3 đã bổ sung tính năng **Conditional Writes** (Tháng 8/2024), giúp Delta Lake sử dụng trực tiếp S3 mà không cần DynamoDB, loại bỏ một system dependency đắt đỏ.

---

## 3. Conflict Resolution & Logical Auto-Merge

Khi hai Job cùng cố gắng ghi log `000002.json`, Job B (chậm chân hơn) sẽ bị Storage từ chối. Thay vì ném lỗi (crash pipeline) ngay lập tức, Delta sẽ tự động kiểm tra xem những thay đổi có thực sự mâu thuẫn hay không (Logical Auto-Merge).

**Khớp logic (Tương thích):**
-   Job A `INSERT` dữ liệu. Job B cũng `INSERT`. Hai Job ghi vào 2 file Parquet độc lập.
-   Job A cập nhật dữ liệu của user ở `Country='US'`. Job B cập nhật user ở `Country='UK'` (khác Partition).
$\rightarrow$ Delta tự động gộp sự thay đổi và thử commit lại lần nữa ở bản ghi `000003.json`.

**Xung đột không thể hòa giải (Exceptions):**
Nếu sự mâu thuẫn xảy ra trên cùng một tập file, Delta bắt buộc hủy Job B để bảo vệ tính toàn vẹn (Strict Serializable Isolation).
*   **`ConcurrentAppendException`**: Job A `OVERWRITE` một partition, trong khi Job B đang cố `INSERT` vào partition đó.
*   **`ConcurrentDeleteReadException`**: Rất phổ biến khi chạy `MERGE INTO`. Job A vừa `DELETE` một file, nhưng Job B lại đang đọc (read) chính file đó.

---

## 4. Xóa Bỏ False Positives bằng Deletion Vectors (Row-Level Concurrency)

Một điểm yếu chết người của OCC truyền thống là nó cô lập ở **cấp độ File (File-level isolation)**. 
Ví dụ: File Parquet có 1 triệu dòng. Job A chỉ `UPDATE` dòng 1, Job B chỉ `UPDATE` dòng 1,000,000. Dù về mặt logic hai Job không dẫm chân lên nhau, nhưng về mặt vật lý, cả hai đều cố gắng viết lại (rewrite) cùng 1 file Parquet $\rightarrow$ Dẫn đến **False Positive Conflict**.

Giải pháp cho vấn đề này là **Deletion Vectors** (Row-level concurrency).

```sql
-- Kích hoạt Deletion Vectors trên Databricks
ALTER TABLE main.default.events SET TBLPROPERTIES ('delta.enableDeletionVectors' = true);
```

**Kiến trúc Deletion Vectors:**
Thay vì phải chép lại toàn bộ file Parquet sang 1 file mới khi có 1 dòng bị thay đổi, Delta Lake tạo ra một file bitmap siêu nhỏ (`.bin`). File này đánh dấu *chỉ mục (index)* của dòng bị xóa/cập nhật (tương tự như Tombstones trong RocksDB/Cassandra). 
Nhờ vậy, hai Job hoàn toàn có thể cập nhật cùng 1 file Parquet, miễn là chúng không chạm vào chung một dòng. Thao tác rewrite file Parquet nặng nề sẽ được đẩy lại (deferred) cho tiến trình `OPTIMIZE` chạy ngầm.

---

## 5. Rủi Ro Vận Hành (Operational Risks)

Sử dụng OCC mang lại Throughput khổng lồ, nhưng đi kèm với các cạm bẫy vận hành:

### 5.1. The "Retry Storm" [Bão thử lại]
Khi Job B gặp lỗi xung đột, hầu hết các Data Engineer sẽ cấu hình `Task Retry` trong Airflow. Nhưng ở bước 2 của OCC (phần WRITE), Job phải cấp phát Executor tính toán và tạo lại file Parquet mới. 
Nếu có 50 pipeline chạy đồng thời, chúng sẽ liên tục đánh nhau, liên tục fail, và liên tục chạy lại bước WRITE. Hậu quả là tiêu tốn hàng ngàn đô la tiền Compute Cost mà dữ liệu vẫn không thể ghi thành công.
*   **Khắc phục:** Sử dụng thuật toán **Exponential Backoff with Jitter** (Lùi bước theo cấp số nhân kèm độ nhiễu ngẫu nhiên) khi cấu hình Retry. Tối đa 3 lần retry cho lỗi Concurrency.

### 5.2. Chống chỉ định Single-Row Updates (Point-writes)
Data Lake không phải là OLTP Database (như Postgres). Bạn không thể cho Kafka đập thẳng 1000 lệnh `MERGE INTO` độc lập vào Delta Table mỗi giây, hệ thống sẽ sụp đổ vì Lock Contention và Metadata Bloat.
*   **Khắc phục (Micro-batching):** Bắt buộc phải gom dữ liệu vào một lớp Staging (Bronze). Sau đó dùng Spark Structured Streaming chạy `MERGE INTO` theo từng batch 1 phút/lần.

### 5.3. Cô lập các Pipeline (Vertical Separation)
Để triệt tiêu hoàn toàn xung đột, kiến trúc sư hệ thống phải thiết kế sao cho các Job chạy song song không bao giờ chạm vào cùng một tập tin vật lý.
Ví dụ: Job xử lý dữ liệu Châu Á và Châu Âu phải ghi vào hai Partition hoàn toàn riêng biệt. 

---

## Nguồn Tham Khảo

1.  [Databricks: Concurrency Control in Delta Lake][https://docs.delta.io/latest/concurrency-control.html]
2.  [Databricks: What is Deletion Vectors in Delta Lake?][https://docs.databricks.com/en/delta/deletion-vectors.html]
3.  [Amazon S3 Conditional Writes (2024]](https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-conditional-writes/)
4.  *Designing Data-Intensive Applications (Chapter 7: Transactions & OCC)* - Martin Kleppmann.
