---
title: "Data Lakehouse Architecture: Giải Phẫu Lõi Transaction và Thiết Kế Lưu Trữ"
description: "Mổ xẻ cơ chế OCC, Metadata Tree từ CIDR 2021 Whitepaper và chiến lược đánh đổi COW vs MOR trong Apache Iceberg."
lastUpdated: 2026-06-15
tags: ["data-engineering", "architecture", "data-lakehouse", "iceberg"]
---

Trong thập kỷ trước, kiến trúc dữ liệu bị chia cắt giữa Data Warehouse (đảm bảo ACID, hiệu năng cao nhưng đắt đỏ) và Data Lake (lưu trữ phi cấu trúc rẻ trên S3/GCS nhưng thiếu tính toàn vẹn dữ liệu). Theo **Databricks CIDR 2021 Whitepaper** ("Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics"), mô hình Lakehouse ra đời không chỉ như một buzzword marketing, mà là một bước nhảy vọt về System Design. Cốt lõi của nó là việc đưa một lớp Metadata/Transaction Layer (như Apache Iceberg, Delta Lake) lên trên Object Storage.

Bài viết này mổ xẻ sâu vào cơ chế hoạt động nội tại của Lakehouse, lý do tại sao nó giải quyết được bài toán concurrency ở quy mô lớn, và những thiết kế đánh đổi thực tế trong Production.

## 1. Bài Toán và Bối Cảnh (The Problem & Context)

Với Data Lake truyền thống (ví dụ: Amazon S3 kết hợp với Hive Metastore), các kỹ sư đối mặt với một vấn đề mang tính nền tảng: Object Storage không hỗ trợ ACID transactions.
- **Không có Atomic Commits:** Khi ghi 100 files Parquet vào S3, nếu job thất bại ở file thứ 50, người đọc (reader) sẽ thấy một phần dữ liệu (dirty read).
- **Metadata Bottleneck:** Hive Metastore lưu trạng thái thư mục/partition. Khi query một bảng có hàng triệu files, lệnh `LIST` trên S3 để tìm các files trong một partition thường mất nhiều phút, gây thắt cổ chai (bottleneck) tại bước Query Planning trước cả khi dữ liệu thực sự được đọc.
- **Concurrent Writes:** Rất khó để cho phép nhiều luồng (Spark jobs, Flink streams) cùng ghi vào một bảng mà không gây hỏng (corrupt) dữ liệu.

Lakehouse giải quyết bài toán này không phải bằng cách thay đổi S3, mà bằng cách thay đổi **cách chúng ta quản lý Metadata**.

## 2. Kiến trúc Hệ thống (System Architecture Deep Dive)

### Cơ chế Metadata Tree (Theo mô hình Apache Iceberg)

Thay vì dựa vào thao tác `LIST` thư mục vật lý (physical S3 directory tree) của Hive, Lakehouse xây dựng một **cây siêu dữ liệu (Metadata Tree)** độc lập để theo dõi chính xác từng file dữ liệu.

Cấu trúc này chia làm 4 tầng từ trên xuống:
1. **Metadata File (`.metadata.json`):** Chứa thông tin về schema, phân vùng (partition specs), và con trỏ (pointer) trỏ tới file Snapshot hiện tại. Mỗi lần commit tạo ra một version metadata mới.
2. **Manifest List:** Một Snapshot sẽ trỏ tới một Manifest List. File này liệt kê các file Manifest bên dưới, kèm theo thông tin thống kê (min/max values, partition bounds) của toàn bộ manifest đó để bỏ qua (pruning) nhanh chóng ở cấp độ cao.
3. **Manifest File:** Liệt kê trực tiếp các Data Files (đường dẫn S3, kích thước). Nó cũng chứa file-level statistics (min/max cột) giúp Query Engine quyết định có nên quét file này không.
4. **Data Files (Parquet/ORC):** Dữ liệu vật lý thực tế.

**Tại sao thiết kế này là một bước tiến?**
Khi Query Engine (Trino, Spark) đọc dữ liệu, nó sẽ đi từ Root (`metadata.json`) xuống Data Files. Quá trình này **O(1) cho việc xác định Snapshot** và cho phép lập kế hoạch truy vấn (Query Planning) hoàn toàn tách biệt khỏi Object Storage API. Mọi thao tác tìm kiếm file đều diễn ra trên các Manifest, loại bỏ hoàn toàn lệnh `LIST` chậm chạp.

## 3. Quyết định Thiết kế và Trade-offs (Design Decisions)

### 3.1. Optimistic Concurrency Control (OCC)

Làm sao để nhiều Spark jobs có thể ghi đồng thời vào một bảng Lakehouse? Sử dụng **Optimistic Concurrency Control (OCC)**. 
- **Cách hoạt động:** Khi hai luồng (Writer A và Writer B) cùng bắt đầu ghi, chúng đều đọc phiên bản Snapshot hiện tại (ví dụ: v10). Cả hai thực hiện ghi Data Files mới (hoàn toàn an toàn vì ghi file mới không ảnh hưởng ai). Khi commit metadata, Writer A nhanh hơn, tạo ra v11. Khi Writer B chuẩn bị commit, nó nhận ra Snapshot hiện tại đã là v11 (Conflict!). 
- **Giải quyết Conflict:** Writer B sẽ đọc lại metadata v11, kiểm tra xem những files mà Writer A vừa thêm có xung đột (overlap) với những files Writer B định thay đổi hay không. Nếu không (ví dụ ghi vào các partition khác nhau), Writer B tự động re-commit thành v12. Nếu có, job của Writer B thất bại và phải chạy lại (abort).
- **Đánh đổi:** OCC giả định rằng xung đột hiếm khi xảy ra. Trong môi trường Write-Heavy tập trung vào cùng một cụm dữ liệu, OCC có thể gây ra tỷ lệ Retry/Abort cao, tiêu tốn resource vô ích.

### 3.2. Copy-on-Write (COW) vs Merge-on-Read (MOR)

Đây là quyết định thiết kế quan trọng nhất khi vận hành Apache Iceberg. Làm thế nào để xử lý các lệnh `UPDATE` hoặc `DELETE`?

* **Copy-on-Write (COW):**
  - **Cơ chế:** Nếu muốn cập nhật 1 dòng trong 1 file Parquet chứa 1 triệu dòng, hệ thống phải đọc toàn bộ file, cập nhật 1 dòng đó, và ghi lại thành một file Parquet MỚI hoàn toàn.
  - **Trade-off:** Write penalty cực cao (Write latency lớn), nhưng Read latency cực thấp (người đọc chỉ cần quét các data files mới nhất, không cần tính toán gì thêm).
  - **Use-case:** Phù hợp cho Batch processing ban đêm, dữ liệu hiếm khi bị cập nhật, ưu tiên tốc độ truy vấn cho BI Dashboards.

* **Merge-on-Read (MOR):**
  - **Cơ chế:** Khi cập nhật/xóa, thay vì ghi lại toàn bộ file data, hệ thống chỉ ghi ra một file nhỏ gọi là **Delete File** (chứa ID hoặc vị trí của các dòng bị xóa/cập nhật) và thêm Data File mới (cho dòng cập nhật). 
  - **Trade-off:** Write latency siêu nhanh (vì chỉ ghi file nhỏ), nhưng Read penalty cao. Khi Query Engine (Trino/Spark) đọc dữ liệu, nó phải đọc cả Data File gốc VÀ Delete File, sau đó thực hiện thao tác **Merge** (loại bỏ dòng cũ) ngay trên bộ nhớ (on-the-fly).
  - **Use-case:** Bắt buộc cho Real-time Streaming, Flink CDC pipelines nơi dữ liệu liên tục bị upsert.

## 4. Những Bài Học Thực Tiễn (Production Lessons Learned)

### Bài Toán Small Files và Compaction (`rewrite_data_files`)

Một trong những cạm bẫy lớn nhất khi triển khai Lakehouse ở quy mô Production (nhất là với Streaming hoặc MOR) là hội chứng **Small Files**. Khi dữ liệu được ingest liên tục (ví dụ qua Flink/Spark Streaming), hệ thống sẽ tạo ra hàng vạn file Parquet có kích thước chỉ vài KB.
- **Hậu quả:** 
  - Query Planning chậm lại đáng kể vì Manifest Files phải chứa quá nhiều entry.
  - Thắt cổ chai tại NameNode (nếu dùng HDFS) hoặc quá tải S3 GET requests, đồng thời làm mất đi lợi thế nén và vectorization của Parquet.
- **Giải pháp Production:** Chạy các tiến trình Asynchronous Compaction (Gom tệp). Trong Apache Iceberg, điều này thực hiện qua action `rewrite_data_files`. 
- **Chiến lược:** Thiết lập một Airflow DAG chạy nền định kỳ (ví dụ mỗi 4 tiếng). Lệnh compaction sẽ đọc các file nhỏ, gom (merge) chúng lại thành các file tối ưu (thường là Target Size 512MB hoặc 1GB). Đặc biệt với bảng MOR, quá trình này cũng sẽ gộp luôn (reconcile) các Delete Files vào Data Files chính để biến chúng thành trạng thái giống như COW, giúp các lượt đọc sau đó (Read-path) nhanh hơn hẳn.

## Tài liệu Tham khảo

1. **[CIDR 2021 Whitepaper: Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf):** Nguồn gốc lý thuyết, phân tích tại sao việc chuyển transaction layer lên trên object storage lại cần thiết và cách nó giải quyết các điểm yếu của hệ thống Data Lake đời đầu.
2. **[Apache Iceberg Documentation - Spec & Concurrency](https://iceberg.apache.org/spec/#optimistic-concurrency-control):** Chi tiết kỹ thuật về cơ chế Optimistic Concurrency Control, Metadata Tree, và cấu trúc File hệ thống.
3. **[Apache Iceberg Documentation - Maintenance & Compaction](https://iceberg.apache.org/docs/latest/maintenance/):** Các chiến lược tối ưu hóa trong Production, bao gồm giải quyết bài toán small files thông qua `rewrite_data_files` và sự đánh đổi giữa COW/MOR.
