---
title: "AWS GitHub Archive: Từ Batch Processing đến Anti-Pattern 'Zombie Cluster'"
description: "Mổ xẻ kiến trúc Data Pipeline sử dụng Airflow, EMR (Ephemeral) và Redshift. Phân tích lý do tại sao cấu hình orchestration mặc định có thể đốt sạch tiền AWS của bạn."
lastUpdated: 2026-06-15
tags: ["data-engineering", "architecture", "aws", "airflow", "emr", "redshift"]
---

Trong các dự án Data Engineering thực tế, việc xây dựng một pipeline chạy trơn tru lúc "Happy Path" là rất dễ, nhưng để hệ thống tự động dọn dẹp khi có lỗi lại là một bài toán khác. Bài viết này sẽ mổ xẻ một kiến trúc xử lý Batch điển hình trên AWS dựa trên repository mã nguồn mở từ Nerdward. Chúng ta sẽ cùng phân tích các quyết định thiết kế về Ephemeral Cluster, cơ chế ghi dữ liệu vào Redshift, và những cái bẫy chết người như "Zombie Cluster".

## 1. Bài Toán và Bối Cảnh (The Problem & Context)

Nhóm R&D cần phân tích hoạt động của lập trình viên trên GitHub (GitHub Archive) để xác định thời điểm có lưu lượng truy cập cao nhất và đánh giá mức độ phổ biến của các sự kiện (events). 

Dữ liệu được GitHub Archive cung cấp dưới dạng các file nén `json.gz` sinh ra đều đặn mỗi giờ. Yêu cầu đặt ra là phải xây dựng một Batch Data Pipeline tự động chạy hàng ngày (Daily schedule) để:
- Tải dữ liệu JSON phân tán.
- Chuyển đổi và tổng hợp số liệu (Aggregation).
- Phục vụ cho hệ thống Dashboard trực quan hoá.

## 2. Kiến trúc Hệ thống (System Architecture Deep Dive)

Hệ thống được thiết kế hoàn toàn trên hệ sinh thái AWS, sử dụng Apache Airflow làm bộ điều phối (Orchestrator).

Luồng dữ liệu (Data Flow) diễn ra theo các bước sau:
1. **Ingestion:** Airflow kích hoạt một `BashOperator` để tải các file `json.gz` từ trang GitHub Archive xuống local, sau đó đẩy lên Amazon S3 làm vùng Data Lake thô (Raw layer).
2. **Compute:** Airflow sử dụng `EmrCreateJobFlowOperator` để khởi tạo một cụm **Amazon EMR (Elastic MapReduce)** hoàn toàn mới.
3. **Processing:** Spark Job được submit vào EMR để thực hiện chuyển đổi kiểu dữ liệu (Timestamp), đổi tên cột, và thực hiện truy vấn SQL (`GROUP BY EventType`).
4. **Loading:** Kết quả từ Spark được ghi trực tiếp vào Amazon Redshift Data Warehouse.
5. **Clean-up:** Cụm EMR được chủ động hủy bỏ (Terminate) ngay khi Job hoàn thành để giải phóng tài nguyên.

## 3. Quyết định Thiết kế và Trade-offs (Design Decisions)

### Tại sao dùng Ephemeral EMR thay vì Persistent EMR?

Trong kiến trúc này, tác giả chọn thiết kế **Ephemeral Cluster** (Cụm tạm thời - khởi tạo lúc chạy và hủy khi xong) thay vì **Persistent Cluster** (Cụm chạy 24/7). 

- **Ưu điểm (Cost-effective):** Dữ liệu được xử lý theo lô (Batch) mỗi ngày một lần. Việc giữ một cụm Spark chạy 24/7 khi chỉ thực hiện tác vụ trong 30 phút là sự lãng phí tiền bạc khổng lồ. Ephemeral Cluster giúp công ty tiết kiệm 95% chi phí so với cụm Persistent.
- **Trade-offs (Start-up Latency):** Đánh đổi lớn nhất là thời gian trễ. Mỗi lần chạy DAG, hệ thống sẽ mất thêm khoảng 5-10 phút để AWS cấp phát EC2, cài đặt Hadoop/Spark trước khi thực sự chạy job. Tuy nhiên, đối với một Daily Batch Pipeline không yêu cầu độ trễ thấp (low latency), sự đánh đổi này là hoàn toàn xứng đáng.

### Tại sao cần S3 `tempdir` khi copy vào Redshift?

Khi xem xét mã nguồn Spark, ta thấy khi ghi dữ liệu vào Redshift, cấu hình Spark Connector có khai báo biến `tempdir`:

```python
    general_table.write\
        .format("io.github.spark_redshift_community.spark.redshift")\
        .option("url", "jdbc:redshift://...")\
        .option("dbtable", "general_table")\
        .option("tempdir", f"s3://{bucket_name}/spark_logs")\
        .mode("append").save()
```

Lý do là vì **chèn trực tiếp (JDBC INSERT) vào Data Warehouse là cực kỳ chậm và là một Anti-pattern**. Redshift có kiến trúc xử lý song song khổng lồ (MPP - Massively Parallel Processing).
Khi Spark Connector hoạt động, nó không đẩy dữ liệu thẳng vào Database. Thay vào đó:
1. Spark sẽ ghi kết quả xử lý thành các file phân tán (thường là định dạng Avro/CSV) lên S3 vào thư mục `tempdir`.
2. Sau đó, Connector phát ra một lệnh **`COPY`** từ S3 vào Redshift.
3. Các Compute Node của Redshift sẽ kéo dữ liệu từ S3 song song cùng một lúc, cho phép load hàng Terabyte dữ liệu chỉ trong vài phút.

## 4. Những Bài Học Thực Tiễn (Production Lessons Learned)

Mặc dù kiến trúc trên giấy rất hoàn hảo, việc cấu hình Airflow sai có thể gây ra thảm họa tài chính và hiệu năng.

### Rủi ro tài chính: "Zombie Cluster" khi DAG thất bại
Trong thiết kế DAG `Batch_Github_Archives`, ta thấy tiến trình như sau:
`create_emr_cluster >> step_adder >> step_checker >> terminate_emr_cluster`

**Vấn đề:** Mặc định của Airflow (Trigger Rule) là `all_success`. Nghĩa là nếu task `step_checker` phát hiện Spark Job bị lỗi (Data format sai, OOM), task này sẽ được đánh dấu là **FAILED**. Khi đó, toàn bộ các task phía sau sẽ bị hủy (Skipped).
**Hậu quả:** Task `terminate_emr_cluster` sẽ không bao giờ được chạy. Cụm EMR vẫn sẽ tiếp tục tồn tại ngầm trên AWS dưới dạng **"Zombie Cluster"** (Cụm thây ma). Nó không xử lý dữ liệu nào nhưng vẫn tính phí EC2 cho đến khi có kỹ sư phát hiện ra vào cuối tháng.
**Cách giải quyết:** BẮT BUỘC phải đổi trigger rule của task dọn dẹp thành `all_done` để luôn dọn dẹp dù cho tác vụ trước đó có lỗi hay không.
```python
terminate_emr_cluster = EmrTerminateJobFlowOperator(
    task_id="Terminate_EMR_Cluster",
    trigger_rule="all_done",
    ...
)
```

### S3 Small Files Penalty
Pipeline tải các file `.json.gz` của từng giờ và đẩy rải rác lên S3. 
Khi chạy Big Data bằng Spark trên S3, chi phí (Overhead) để liệt kê (listing metadata) và khởi tạo kết nối HTTP đến hàng ngàn file nhỏ (vài chục KB đến vài MB) là vô cùng lớn. Hiện tượng này gọi là **Small Files Penalty**. Một task Spark mất nhiều thời gian để "mở file" hơn là thời gian "xử lý dữ liệu".
**Giải pháp:** Cần có một quá trình Compaction trước khi chạy Spark (hoặc thiết kế lại Ingestion layer) để gom các file dữ liệu lại thành các khối lớn (~128MB) định dạng Parquet.

## 5. Kết quả Hệ thống (Proof of Work)

Sau khi Pipeline chạy thành công, kết quả cuối cùng được trực quan hoá thông qua Dashboard.

![Dashboard Thống kê Sự Kiện Github](https://raw.githubusercontent.com/Nerdward/batch_gh_archive/main/images/dashboard.png)

Tài liệu Tham khảo
- **[Nerdward/batch_gh_archive](https://github.com/Nerdward/batch_gh_archive):** Base repository của dự án triển khai Airflow, AWS EMR và Redshift.
- **[AWS EMR Ephemeral vs Persistent](https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-plan-longrunning-transient.html):** Phân tích chi tiết giữa hai mô hình cung cấp cụm EMR.
- **[Amazon Redshift COPY](https://docs.aws.amazon.com/redshift/latest/dg/r_COPY.html):** Cơ chế tải dữ liệu hàng loạt tối ưu bằng lệnh COPY từ S3 vào Redshift.
