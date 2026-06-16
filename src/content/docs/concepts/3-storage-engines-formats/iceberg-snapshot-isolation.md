---
title: "Iceberg Snapshot Isolation"
difficulty: "Advanced"
readingTime: "10 mins"
lastUpdated: 2026-06-15
seoTitle: "Iceberg Snapshot Isolation - Data Engineering Deep Dive"
metaDescription: "Cách Apache Iceberg quản lý Metadata để cung cấp ACID Transactions trên Data Lake."
description: "Cách Apache Iceberg quản lý Metadata để cung cấp ACID Transactions trên Data Lake."
---



Snapshot Isolation trong Apache Iceberg là cơ chế kiểm soát đồng thời (Concurrency Control) cho phép nhiều người dùng cùng đọc và ghi dữ liệu mà không bị xung đột. Mỗi lần commit tạo ra một Snapshot mới, đảm bảo các reader luôn nhìn thấy một phiên bản dữ liệu nhất quán.

## 1. Vấn đề của Data Lake truyền thống (Hive-like)



Trước khi có Apache Iceberg, kiến trúc Data Lake truyền thống dựa trên Hive Metastore quản lý dữ liệu bằng khái niệm **thư mục (directories)**. Việc đọc và ghi dữ liệu đồng nghĩa với việc list (liệt kê) các file trong một thư mục trên HDFS hoặc S3.

Cách tiếp cận này gặp nhiều vấn đề nghiêm trọng khi có nhiều người dùng cùng tương tác:
*   **Dirty Reads (Đọc dữ liệu rác/chưa hoàn thiện):** Nếu một job đang ghi hàng triệu bản ghi (ghi ra nhiều file), và một job khác đọc dữ liệu trong cùng lúc đó, job đọc sẽ thấy một phần dữ liệu mới và một phần dữ liệu cũ. Không có khái niệm "Isolation" (Cô lập).
*   **Không có ACID Transactions:** Việc cập nhật (Update) hoặc xóa (Delete) nhiều file yêu cầu di chuyển hoặc ghi đè file. Trong quá trình này nếu job thất bại, Data Lake sẽ ở trong trạng thái không nhất quán.
*   **Hiệu năng list thư mục trên Cloud Storage:** Việc sử dụng các lệnh như `aws s3 ls` (File Listing) rất chậm và tốn kém khi thư mục có hàng vạn file. Việc lập kế hoạch truy vấn (Query Planning) mất rất nhiều thời gian.

## 2. Cách Iceberg giải quyết với Snapshot Isolation

Apache Iceberg thay đổi hoàn toàn cách Data Lake theo dõi dữ liệu. Thay vì theo dõi **thư mục**, Iceberg theo dõi **từng file dữ liệu (data files)** một cách tường minh thông qua một cây phân cấp metadata.

### 2.1. Khái niệm Snapshot

Một **Snapshot** trong Iceberg đại diện cho trạng thái của toàn bộ một bảng (table) tại một thời điểm cụ thể. 
Mỗi khi có thao tác thay đổi dữ liệu (Insert, Update, Delete), Iceberg không sửa đổi trực tiếp các Snapshot hiện tại. Thay vào đó, nó tạo ra các file dữ liệu mới và tạo ra một **Snapshot mới** trỏ đến tập hợp các file dữ liệu hợp lệ mới nhất. Snapshot cũ vẫn được giữ nguyên.

### 2.2. Kiến trúc cây Metadata

Để thực hiện điều này nhanh chóng, Iceberg thiết kế metadata thành 4 tầng:

1.  **Catalog:** Nơi lưu trữ con trỏ đến file *Metadata* hiện tại của bảng. Ví dụ: Hive Metastore, AWS Glue, Nessie, hoặc REST Catalog. Đây là điểm duy nhất hỗ trợ các thao tác *Atomic* (Nguyên tử) để đảm bảo đồng thời.
2.  **Metadata File (`.json`):** Chứa thông tin về schema, phân vùng (partition spec), các thuộc tính của bảng và **danh sách tất cả các Snapshots** từ trước đến nay. Nó cũng chỉ định ID của *Current Snapshot*.
3.  **Manifest List (`.avro`):** Mỗi Snapshot trỏ đến một Manifest List. File này chứa danh sách các *Manifest Files*, kèm theo số liệu thống kê (min/max của cột phân vùng) để loại bỏ nhanh các Manifest Files không cần thiết (Partition Pruning ở cấp độ file metadata).
4.  **Manifest File (`.avro`):** Chứa danh sách các file dữ liệu thực tế (`.parquet`, `.orc`, `.avro`), kèm theo thống kê chi tiết (column-level min/max, null counts, NaN counts) cho từng file, giúp Query Engine (Spark, Trino) quyết định xem có cần đọc file dữ liệu đó hay không.
5.  **Data Files:** Các file dữ liệu thực sự lưu trữ trên S3, GCS, ADLS, v.v.

Khi Query Engine bắt đầu đọc bảng, nó sẽ:
`Catalog -> Current Metadata File -> Current Snapshot -> Manifest List -> Manifest Files -> Data Files`.

## 3. Cơ chế đọc/ghi đồng thời (Concurrency Control)

Nhờ kiến trúc trên, Iceberg đạt được **Snapshot Isolation**.

### 3.1. Phía Người Đọc (Readers)

Khi một Reader (ví dụ: truy vấn SELECT từ Trino) bắt đầu, nó sẽ hỏi Catalog để lấy file Metadata hiện tại.
Reader sẽ khóa chặt tầm nhìn của nó vào **Current Snapshot ID** tại thời điểm truy vấn bắt đầu. 

*   Reader sẽ đi theo nhánh metadata của Snapshot này.
*   Nếu có một Writer (người ghi) đang tạo dữ liệu mới hoặc cập nhật dữ liệu, Writer đó sẽ tạo ra các file dữ liệu mới và một Snapshot mới *ẩn* chưa được commit.
*   Reader hoàn toàn không bị ảnh hưởng, nó vẫn tiếp tục đọc dữ liệu theo các file được định nghĩa trong Snapshot cũ. 
*   Hiện tượng **Dirty Reads** hoặc **Torn Reads** bị loại bỏ hoàn toàn.

### 3.2. Phía Người Ghi (Writers) - Optimistic Concurrency Control (OCC)

Iceberg hỗ trợ nhiều người ghi cùng lúc bằng cơ chế **Optimistic Concurrency Control (OCC)** (Kiểm soát đồng thời lạc quan).

Quy trình một Writer thực hiện:
1.  **Đọc trạng thái hiện tại:** Lấy file Metadata hiện tại từ Catalog (giả sử version `v1.json`).
2.  **Thực hiện thay đổi:** Ghi các file dữ liệu thực tế (Parquet) lên storage. Ghi các file Manifest và Manifest List mới.
3.  **Tạo file Metadata mới:** Tạo ra `v2.json` dựa trên `v1.json`, bổ sung thêm Snapshot mới.
4.  **Commit (Giai đoạn quan trọng nhất):** Writer cố gắng hoán đổi (swap) con trỏ trong Catalog từ `v1.json` sang `v2.json` bằng thao tác nguyên tử (ví dụ: CAS - Compare And Swap).
    *   **Thành công:** Nếu trong lúc Writer thực hiện bước 2 và 3, không ai khác thay đổi Catalog, thao tác swap thành công. `v2.json` trở thành trạng thái mới nhất của bảng.
    *   **Xung đột (Conflict):** Nếu một Writer khác đã commit thành công trước đó (Catalog hiện tại đã trỏ sang một `vX.json` nào đó, không còn là `v1.json` nữa), thao tác swap sẽ thất bại. Iceberg sẽ không làm hỏng bảng, nó sẽ thực hiện **Retry** (thử lại). Trong lần thử lại, nó đọc lại `vX.json` mới nhất, tạo lại metadata (không cần ghi lại data files), và thử commit lần nữa.

## 4. Các tính năng nổi bật từ Snapshot Isolation

Vì hệ thống lưu trữ nhiều phiên bản (Snapshots) thay vì ghi đè, Iceberg mở ra hàng loạt các tính năng mạnh mẽ:

*   **Time Travel (Du hành thời gian):** Người dùng có thể dễ dàng truy vấn lại dữ liệu tại một thời điểm hoặc một ID Snapshot trong quá khứ.
    ```sql
    -- Đọc dữ liệu tại thời điểm quá khứ
    SELECT * FROM my_table TIMESTAMP AS OF '2026-06-01 10:00:00';
    ```
*   **Rollback:** Nếu phát hiện lỗi trong pipeline ghi dữ liệu mới, Data Engineer có thể chuyển (rollback) con trỏ Current Snapshot trong file Metadata về phiên bản tốt trước đó một cách tức thì (O(1) time complexity) mà không cần phải xóa hay chạy lại dữ liệu tốn kém.
*   **Tagging và Branching:** Iceberg cho phép tạo tag cho các Snapshot (ví dụ: `Q1_End`, `Tax_Audit`) để lưu trữ vĩnh viễn không bị xóa mòn (expire). Nó cũng cho phép rẽ nhánh (branching) theo phong cách Git (như nhánh WAP - Write-Audit-Publish), bạn có thể ghi vào nhánh staging, kiểm tra chất lượng bằng audit, rồi fast-forward commit sang nhánh chính (`main`).

## 5. Quản lý vòng đời dữ liệu rác (Snapshot Lifecycle)

Mặc dù giữ nhiều phiên bản là tốt, nhưng nếu cứ lưu trữ mãi thì dung lượng Data Lake sẽ phình to không giới hạn, dẫn đến chi phí lưu trữ tăng vọt. Do đó, Iceberg yêu cầu cơ chế dọn dẹp định kỳ:

*   **Expire Snapshots:** Quá trình xóa bỏ các Snapshot cũ không còn được cần tới (thường giữ lại vài ngày đến 1 tuần). Thao tác này sẽ dọn dẹp các metadata files (Manifests, Manifest List) cũ.
*   **Remove Orphan Files (Vacuum):** Quá trình quét dọc trên storage để tìm và xóa các file Data (`.parquet`) thực sự không còn thuộc về bất kỳ Snapshot hợp lệ nào trên bảng nữa.

Việc chạy định kỳ các tác vụ `expire_snapshots` là best practice không thể thiếu trong kiến trúc Apache Iceberg.

## Tài Liệu Tham Khảo
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Apache Iceberg Spec: Metadata](https://iceberg.apache.org/spec/#table-metadata)
* [Optimistic Concurrency Control (Wikipedia)](https://en.wikipedia.org/wiki/Optimistic_concurrency_control)
* [Write-Audit-Publish Pattern in Data Engineering](https://lakefs.io/blog/write-audit-publish/)
