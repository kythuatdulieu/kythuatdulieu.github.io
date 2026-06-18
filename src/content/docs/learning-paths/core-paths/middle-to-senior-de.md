---
title: Middle to Senior Data Engineer (Kỹ sư dữ liệu cao cấp)
description: Lộ trình trở thành kỹ sư cao cấp, làm chủ các hệ thống phân tán, xử lý dữ liệu lớn Big Data, tối ưu hiệu năng và triển khai CI/CD hạ tầng.
sidebar:
  order: 3
prev:
  link: /learning-paths/core-paths/junior-to-middle-de/
  label: Junior to Middle Data Engineer
next:
  link: /learning-paths/leadership-culture/de-traits-and-mindset/
  label: Lãnh đạo & Văn hóa Data
---

Tại cấp độ Senior, bạn không chỉ tạo ra các đường ống dữ liệu (pipelines) chạy được, mà phải đảm bảo chúng chạy **nhanh nhất, rẻ nhất, và không thể gãy (fault-tolerant)** dưới áp lực của hàng Petabytes dữ liệu.

## Mục tiêu lộ trình

* Xử lý độ trễ (latency), khả năng mở rộng (scalability) ở quy mô Big Data.
* Tối ưu hóa chuyên sâu các công cụ tính toán phân tán (như Apache Spark).
* Xây dựng kiến trúc Data Lakehouse và tự động hóa chất lượng dữ liệu.

## Bắt đầu từ đâu? (Prerequisites)

* **Hoàn thành chặng đường:** 👉 **[Junior to Middle Data Engineer](./junior-to-middle-de.md)**.
* **Kinh nghiệm:** Trên 3 năm thực chiến.
* **Mong muốn:** Trở thành người thiết kế hệ thống (System Architect) hoặc giải quyết các sự cố dữ liệu phức tạp nhất trong tổ chức.

## Kỹ năng cốt lõi

### 1. Kiến trúc Hệ thống Phân tán (Distributed Systems)
Làm việc với mạng lưới hàng trăm máy chủ chạy song song.
* Hiểu sâu về định lý **CAP Theorem** (Sự đánh đổi giữa Nhất quán - Sẵn sàng - Chịu lỗi).
* Khái niệm Master-Worker, cơ chế đồng thuận (Consensus), Network Partitions.

### 2. Tối ưu hóa Apache Spark chuyên sâu
Vượt xa việc chỉ dùng `.filter()` hay `.groupBy()`.
* Nắm vững cơ chế của **[Catalyst Optimizer](/concepts/4-compute-engines-batch/apache-spark)**.
* Xử lý "ác mộng" **[Out of Memory (OOM) / Data Skew](/concepts/4-compute-engines-batch/data-skew)**.
* Tối ưu hóa **[Shuffle](/concepts/4-compute-engines-batch/shuffle)** và sử dụng `Broadcast Joins` để tránh dữ liệu chạy chéo mạng.

### 3. Open Table Formats (Iceberg / Delta / Hudi)
Chuyển đổi [Data Lake](/concepts/3-storage-engines-formats/data-lake) thô sơ thành [Data Lakehouse](/concepts/3-storage-engines-formats/lakehouse) có tính năng giao dịch ACID.
* **[Delta Lake](/concepts/3-storage-engines-formats/delta-lake):** Nhật ký giao dịch (Transaction Log).
* **[Apache Iceberg](/concepts/3-storage-engines-formats/apache-iceberg):** Cây siêu dữ liệu (Metadata Tree) khắc phục điểm yếu của Hive Metastore.
* **[Apache Hudi](/concepts/3-storage-engines-formats/apache-hudi):** Tối ưu hóa cho Streaming (Merge-on-Read).

### 4. Khung quản trị chất lượng dữ liệu (Data Quality Framework)
Dữ liệu sai nguy hiểm hơn không có dữ liệu. Áp dụng mô hình **WAP (Write-Audit-Publish)**:
* **Write:** Ghi dữ liệu vào vùng đệm (Staging).
* **Audit:** Kiểm định tự động với `Great Expectations` hoặc `Soda`.
* **Publish:** Chỉ cấp quyền truy cập nếu dữ liệu "Sạch".

### 5. Infrastructure as Code (IaC)
Tự động hóa hoàn toàn cơ sở hạ tầng.
* Dùng **Terraform** để định nghĩa S3 Buckets, IAM Roles, Databricks Clusters bằng code. Đảm bảo môi trường (Dev/Staging/Prod) đồng nhất và có thể dễ dàng khôi phục.

## Dự án thực hành

**Dự án:** Kiến tạo và Tối ưu Data Lakehouse quy mô lớn
* **Công cụ:** AWS S3, Apache Iceberg, Apache Spark, Terraform.
* **Nhiệm vụ:**
  1. Dùng Terraform tự động hóa khởi tạo S3 Bucket và cấp quyền IAM.
  2. Xây dựng Data Lakehouse bằng định dạng Iceberg.
  3. Viết script Spark sinh ra 1 Terabyte dữ liệu "bị lệch" (Data skew) cố ý.
  4. Thực hiện Tối ưu hóa Spark (Salting key, Broadcast join) để giải quyết lỗi tràn RAM.
* **Kết quả:** Sở hữu kỹ năng phân tích lỗi hệ thống phân tán và quản trị bằng Code.

## Góc phỏng vấn (Interview QA)

* **Thiết kế hệ thống (System Design):** Vẽ kiến trúc hệ thống tổng hợp Clickstream theo thời gian thực (Real-time).
* **Spark Internals:** Giải thích cách Spark thực thi một truy vấn `JOIN` phân tán dưới mui xe?
* **Tối ưu Lakehouse:** Trình bày nguyên nhân và giải pháp cho vấn đề "Nhiều tệp tin nhỏ" (**Small files problem**) trên Data Lake.

## Bước tiếp theo

Khi bạn đã vững vàng với công nghệ, con đường tiếp theo là nhân rộng tầm ảnh hưởng (Impact) và dẫn dắt đội ngũ.
👉 **[Lãnh đạo & Văn hóa Kỹ thuật](../leadership-culture/de-traits-and-mindset.md)**
