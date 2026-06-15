---
title: "Deep-dive: Dự án E2E Frostlake CNCOps"
description: "Mổ xẻ kiến trúc Open-source Lakehouse với Apache Iceberg và Trino MPP cho hệ thống nhà máy thông minh."
---

Dự án [Frostlake CNCOps](https://github.com/prochalo/frostlake-cncops) là một nền tảng dữ liệu dạng Data Lakehouse thiết kế theo chuẩn enterprise, mô phỏng hệ thống quản lý nhà máy thông minh (Smart CNC Factory). Điểm nhấn của dự án là việc sử dụng bộ công cụ hoàn toàn mã nguồn mở (Open-source) bao gồm Apache Iceberg kết hợp với Trino MPP thay vì các dịch vụ managed.

## Kiến trúc Lakehouse Open-source: Iceberg và Trino MPP

Thay vì sử dụng các hệ thống Data Warehouse truyền thống hoặc các dịch vụ đám mây đóng gói, kiến trúc của Frostlake CNCOps được xây dựng xoay quanh **Apache Iceberg** làm định dạng bảng (table format) mở và **Trino** làm công cụ truy vấn (MPP SQL Engine). 

* **Apache Iceberg**: Đóng vai trò là Storage Layer cho dữ liệu phân tầng (Bronze, Silver, Gold). Khả năng xử lý metadata thông minh của Iceberg giúp dễ dàng thực hiện Time Travel, tiến hóa lược đồ (Schema Evolution) và tiến hóa phân vùng (Partition Evolution), đồng thời hỗ trợ các thao tác CDC-style upserts (`MERGE INTO`).
* **Trino MPP Engine**: Đóng vai trò là Compute Layer, truy vấn trực tiếp dữ liệu trên Iceberg/MinIO. Với kiến trúc xử lý song song khối lượng lớn (Massively Parallel Processing - MPP), Trino xử lý dữ liệu với hiệu năng cực cao mà không cần phải chuyển dữ liệu vào hệ thống độc quyền.
* Hệ thống kết hợp Kafka và Spark Structured Streaming để đưa dữ liệu chuỗi thời gian (telemetry) trực tiếp vào Iceberg.

## Đánh đổi Thiết kế (Design Trade-offs): Tự xây (Open-source) vs Dịch vụ Đám mây (Managed)

Khi quyết định sử dụng stack Open-source (Iceberg, Trino, MinIO, Nessie) thay vì các dịch vụ Managed Data Warehouse (BigQuery, Snowflake), chúng ta phải cân nhắc những điểm đánh đổi sau:

### Điểm mạnh (Ưu điểm)
* **Tránh Vendor Lock-in**: Dữ liệu được lưu trữ trên S3/MinIO dưới định dạng chuẩn mở (Parquet + Iceberg). Compute và Storage hoàn toàn độc lập, có thể linh hoạt chuyển đổi engine xử lý (Trino, Spark) mà không mất phí dịch chuyển dữ liệu.
* **Tối ưu chi phí cho dữ liệu lớn**: Trả phí theo hạ tầng phần cứng (EC2/GCE hoặc On-premise servers) thay vì phí quét dữ liệu/Compute đắt đỏ của BigQuery/Snowflake khi phải liên tục scale-up khối lượng truy vấn.
* **Quyền kiểm soát**: Tùy chỉnh chi tiết về bảo mật, tài nguyên, phân bổ bộ nhớ cho Trino clusters dựa trên đặc thù query.

### Đánh đổi (Nhược điểm)
* **Chi phí Vận hành (OpEx) cao**: Đòi hỏi đội ngũ Data/Platform Engineer có chuyên môn cao để triển khai, duy trì, và bảo trì (ví dụ: vá lỗi, nâng cấp cluster).
* **Khó khăn trong Tuning hiệu năng**: Snowflake/BigQuery tự động tối ưu query, phân vùng. Với Trino/Iceberg, đội ngũ phải tự thiết kế tuning, lên lịch sắp xếp data (compaction) để giữ hiệu năng cao.

## Rủi ro Production: Hạ tầng Kubernetes & Iceberg Compaction

Triển khai một Data Stack Open-source lên môi trường Production ẩn chứa những rủi ro lớn về vận hành (CNCOps):

### 1. Quản lý Hạ tầng Kubernetes (CNCOps)
Việc triển khai toàn bộ hệ sinh thái (Trino worker, Spark executors, Kafka brokers, Airflow) trên Kubernetes đòi hỏi mức độ trưởng thành cao trong quản trị hạ tầng.
* **Cấp phát tài nguyên động**: Spark và Trino cần tự động mở rộng (autoscaling) để đáp ứng các đợt dữ liệu đột biến. Cấu hình sai giới hạn tài nguyên (requests/limits) trên k8s dễ gây lỗi OOM (Out Of Memory) hoặc lãng phí node.
* **Lưu trữ State và Persistent Volumes**: Các workload stateful (Kafka, MinIO) trên Kubernetes tiềm ẩn rủi ro mất mát dữ liệu nếu hệ thống đĩa cứng hoặc StatefulSets gặp trục trặc không được sao lưu hợp lý.

### 2. Iceberg Compaction và Maintenance
Trong môi trường streaming liên tục từ Kafka/Spark vào Iceberg, hàng nghìn data file nhỏ (small files problem) và các delta metadata sẽ được sinh ra mỗi ngày.
* **Rủi ro suy giảm hiệu năng**: Nếu không có cơ chế compaction (gộp file) định kỳ, việc query của Trino sẽ cực kỳ chậm do phải quét và đọc quá nhiều file nhỏ, đồng thời metadata bùng nổ làm giảm tốc độ planning của query.
* **Xử lý Orphan Files và Snapshots**: Các tiến trình bảo trì (Expire Snapshots, Remove Orphan Files) cần được điều phối (bằng Airflow) chặt chẽ. Nếu lỗi, hệ thống Storage (MinIO) sẽ phình to không kiểm soát.

## Tài liệu Tham khảo
* [Base Repository: prochalo/frostlake-cncops](https://github.com/prochalo/frostlake-cncops)
* [Tài liệu Apache Iceberg](https://iceberg.apache.org/docs/latest/)
* [Tài liệu Trino](https://trino.io/docs/current/)
