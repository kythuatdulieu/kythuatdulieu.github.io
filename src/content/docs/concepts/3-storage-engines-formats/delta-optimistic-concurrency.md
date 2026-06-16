---
title: "Internals: Optimistic Concurrency Control trong Delta Lake"
description: "Phân tích sâu về cơ chế Optimistic Concurrency Control (OCC) trong Delta Lake, cách giải quyết xung đột khi nhiều người dùng cùng ghi dữ liệu, và các bài học thiết kế hệ thống thực chiến."
---



Khi chuyển đổi từ Data Warehouse truyền thống sang Data Lakehouse (như Delta Lake), một câu hỏi lớn được đặt ra: *"Nếu có 2 User cùng lúc thực hiện lệnh UPDATE trên cùng một bảng nằm trên Data Lake (S3, ADLS, GCS) thì sao?"*. Các hệ thống Object Storage như Amazon S3 hay Google Cloud Storage không có cơ chế "Lock" (khóa) dòng hay khóa bảng như các hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) như PostgreSQL hay MySQL. Để giải quyết việc này đảm bảo tính ACID, Delta Lake sử dụng cơ chế **Optimistic Concurrency Control (OCC - Kiểm soát đồng thời lạc quan)**.

## 1. Triết Lý "Lạc Quan" Của OCC

Trong RDBMS truyền thống (Pessimistic - Bi quan), hệ thống sử dụng các loại khóa (Row-level lock, Table-level lock). Khi bạn bắt đầu một Transaction để sửa dữ liệu, hệ thống sẽ **khóa (lock)** các dòng dữ liệu đó lại. Bất kỳ ai muốn ghi hoặc đôi khi là đọc dữ liệu đó đều phải xếp hàng đứng đợi. Điều này rất an toàn, đảm bảo tính toàn vẹn dữ liệu cao nhất, nhưng lại làm giảm tốc độ xử lý xuống mức thảm hại trong môi trường dữ liệu khổng lồ (Big Data), nơi có hàng trăm pipeline chạy song song.

Ngược lại, Delta Lake mang tư tưởng **Lạc quan (Optimistic)**. Cơ chế này hoạt động dựa trên giả định rằng: Khả năng 2 người dùng (hoặc 2 process) cùng lúc sửa *chính xác cùng một phần dữ liệu (cùng một file Parquet)* là rất thấp. Do đó, thay vì khóa bảng ngay từ đầu, Delta Lake cứ "thả cửa" cho tất cả mọi người cùng đọc và tiến hành sửa dữ liệu song song trên bộ nhớ tạm của họ. Việc kiểm tra xung đột chỉ diễn ra vào phút chót, ngay trước khi quá trình ghi (Commit) hoàn tất.

## 2. Vòng Đời Của Một Transaction Với OCC

Một giao dịch (Transaction) trong Delta Lake tuân theo 3 bước cơ bản của giao thức OCC:

1. **Đọc (Read):** Delta Lake đọc dữ liệu từ phiên bản mới nhất của bảng (ví dụ: version 000001). Nó ghi nhận (record) lại danh sách các file dữ liệu mà nó đã đọc, và phiên bản hiện tại đang làm việc.
2. **Sửa đổi (Write/Modify):** Hệ thống thực hiện tính toán các thay đổi và ghi các file dữ liệu mới (Parquet files) vào thư mục của bảng. Các file này ở trạng thái mồ côi (tồn tại trên storage nhưng chưa ai biết đến) vì chưa có commit log nào ghi nhận chúng.
3. **Xác nhận (Commit & Validate):** Hệ thống cố gắng ghi một commit log mới (ví dụ: `000002.json`) vào thư mục `_delta_log`. Nếu trong khoảng thời gian từ bước 1 đến bước 3, không ai khác tạo ra file `000002.json`, quá trình commit thành công. Nếu đã có người khác nhanh tay hơn, một *Xung đột (Conflict)* sẽ xảy ra và Delta Lake sẽ chuyển sang bước xử lý xung đột.

## 3. Quá Trình Giải Quyết Xung Đột (Conflict Resolution)

Mọi bí mật về thứ tự và tính toàn vẹn của Delta Lake nằm ở thư mục `_delta_log`, nơi chứa các file JSON đánh số thứ tự tuần tự (ví dụ: `000001.json`, `000002.json`). Tính nguyên tử (Atomicity) được đảm bảo nhờ khả năng tạo file độc quyền (Put-If-Absent hoặc thao tác nguyên tử tương tự tùy theo Storage Provider).

Giả sử User A và User B cùng đọc phiên bản `000001` và cùng muốn ghi:
- User A hoàn thành trước. Hệ thống tạo ra các file Parquet mới và ghi thành công file `000002.json` vào log. Bảng hiện tại ở version 2.
- Một giây sau, User B hoàn thành và cũng cố gắng ghi file log `000002.json`.

Lúc này, cơ chế tạo file nguyên tử của Cloud Storage sẽ phát hiện ra file `000002.json` đã tồn tại và báo lỗi `FileAlreadyExistsException` (hoặc tương tự) cho User B.

Đây chính là lúc **Xung đột (Conflict)** xảy ra. Thay vì báo lỗi cho người dùng và bắt họ gõ lại lệnh (như các hệ thống ngây thơ khác), Delta Lake sẽ tự động thực hiện **Kiểm tra tương thích (Compatibility Check)**:

1. Delta Lake của User B sẽ đọc nội dung file `000002.json` mà User A vừa tạo ra.
2. Nó sẽ so sánh xem liệu những thay đổi của User A có mâu thuẫn trực tiếp với những thay đổi mà User B đang định ghi hay không.

### Các Kịch Bản Tương Thích (Tự động gộp - Auto Merge)
Nếu thay đổi không xung đột, Delta Lake sẽ tự gộp:
- Nếu User A `INSERT` thêm dữ liệu mới, còn User B cũng `INSERT` dữ liệu mới.
- Nếu User A cập nhật (UPDATE) dữ liệu ở Partition `Year=2023`, còn User B cập nhật Partition `Year=2024`.
Trong các trường hợp này, hai người làm việc trên các file Parquet hoàn toàn khác nhau. Delta Lake sẽ tự động thử commit lại thay đổi của User B dưới dạng phiên bản `000003.json`. Quá trình diễn ra vô hình với người dùng.

### Các Kịch Bản Bất Tương Thích (Báo Lỗi)
Chỉ khi sự tương thích bị phá vỡ, Delta Lake mới "đầu hàng" và quăng lỗi (Exception) ra màn hình, buộc User B (hoặc pipeline của User B) phải chạy lại lệnh từ đầu với dữ liệu mới nhất:

- **`ConcurrentAppendException`**: Xảy ra khi một giao dịch cố gắng `INSERT` vào một phân vùng, nhưng giao dịch khác đồng thời `OVERWRITE` hoặc xóa dữ liệu ở phân vùng đó.
- **`ConcurrentDeleteReadException`**: User A thực hiện `DELETE` một file Parquet, trong khi User B đang cố gắng đọc chính file đó để thực hiện `UPDATE` hoặc `MERGE`.
- **`ConcurrentDeleteDeleteException`**: Cả User A và User B cùng cố gắng `DELETE` hoặc `UPDATE` cùng một tập hợp file Parquet giống hệt nhau.
- **`MetadataChangedException`**: User A thay đổi cấu trúc bảng (ALTER TABLE thêm cột mới), trong khi User B đang thực hiện ghi dữ liệu dựa trên cấu trúc cũ.

## 4. Atomic Commit trên Các Nền Tảng Lưu Trữ Khác Nhau

Cơ chế OCC phụ thuộc hoàn toàn vào khả năng đảm bảo chỉ có duy nhất một process có thể tạo được file log thứ `N` (ví dụ `000002.json`). 

- **HDFS/Azure Data Lake Storage Gen2 (ADLS Gen2):** Các hệ thống này hỗ trợ thao tác đổi tên file nguyên tử (Atomic Rename) hoặc tạo file nếu chưa tồn tại (Put-If-Absent) một cách tự nhiên.
- **Google Cloud Storage (GCS):** GCS hỗ trợ precondition checks, cho phép đảm bảo nguyên tử tính khi ghi object.
- **Amazon S3:** Trong quá khứ, S3 không có tính năng Put-If-Absent một cách chuẩn mực, do đó mã nguồn mở của Delta Lake thường phải dùng kèm một cơ sở dữ liệu bên ngoài như DynamoDB để quản lý Lock (LogStore). Tuy nhiên, hiện nay khi S3 đã bổ sung tính năng Conditional Writes mạnh mẽ, cơ chế này đã được cải thiện đáng kể và đơn giản hóa kiến trúc triển khai Delta Lake trên AWS.

## 5. Bài Học Thực Chiến & Best Practices

OCC vô cùng xuất sắc trong môi trường Big Data nơi các pipeline làm việc trên các khối lượng dữ liệu khác nhau. Nhưng nếu không hiểu hệ thống, bạn có thể khiến hiệu suất giảm sút. Dưới đây là những nguyên tắc thiết kế quan trọng:

1. **Phân vùng (Partitioning) Hợp Lý:**
   - Tránh việc nhiều job cùng lúc ghi vào một bảng không có Partition.
   - Nếu bạn có nhiều job update đồng thời, hãy đảm bảo chúng cập nhật lên các Partition khác nhau. Conflict check của Delta Lake xử lý việc này rất hoàn hảo.

2. **Cách Ly Job Thay Đổi Dữ Liệu:**
   - Gom các lệnh `MERGE`, `UPDATE`, `DELETE` chạy theo các khung giờ (Schedule) tách biệt nhau nếu chúng chạm vào cùng một phạm vi dữ liệu. 
   - Thay vì chạy song song 10 pipeline siêu nhỏ cập nhật liên tục vào 1 bảng, hãy gộp chúng lại (micro-batching) và cập nhật 1 lần với 1 lệnh MERGE lớn. Tốc độ sẽ nhanh hơn và không có xung đột.

3. **Sử dụng Deletion Vectors (Phiên bản mới):**
   - Với các phiên bản Delta Lake mới, việc sử dụng các tính năng như **Deletion Vectors** giúp giảm thiểu việc đụng độ các file Parquet. Thay vì ghi lại toàn bộ file, hệ thống chỉ đánh dấu (tombstone) các dòng bị xóa trong một file vector nhỏ bên cạnh, giúp khả năng đồng thời diễn ra trơn tru hơn và ít phải lo về xung đột ghi/xóa.

4. **Lệnh `OPTIMIZE` và `VACUUM` chạy độc lập:**
   - Trong quá trình các pipeline liên tục `INSERT` vào bảng, bạn hoàn toàn có thể chạy song song các tác vụ bảo trì như `OPTIMIZE` (gom các file nhỏ thành file lớn - Compaction) mà không làm hỏng dữ liệu. OCC được thiết kế để lệnh đọc và ghi mới không bị block bởi lệnh OPTIMIZE. 

5. **Xây dựng cơ chế Retry (Thử Lại):**
   - Lỗi do OCC ném ra là có chủ đích để bảo vệ dữ liệu. Đừng coi đó là bug của nền tảng.
   - Trong kiến trúc pipeline (như sử dụng Airflow hoặc Databricks Workflows), bạn nên thiết lập cấu hình `retries = 3` để các task nếu gặp lỗi xung đột sẽ tự động đọc lại trạng thái mới nhất và thử ghi lại.

## Tổng Kết
Cơ chế **Optimistic Concurrency Control** là trái tim giúp Delta Lake đạt được tốc độ ghi dữ liệu khổng lồ của Data Lake trong khi vẫn giữ được tính toàn vẹn của giao dịch (ACID) như Data Warehouse. Việc nắm vững cách Delta giải quyết xung đột giúp Data Engineer thiết kế các pipeline mượt mà, phân mảnh (partition) chính xác và xử lý lỗi một cách tinh tế.

## Tài Liệu Tham Khảo
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [Concurrency Control in Delta Lake (Delta Documentation)](https://docs.delta.io/latest/concurrency-control.html)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
