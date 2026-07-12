---
lastUpdated: 2026-07-11
title: "EcomLake: Hệ thống Data Lakehouse cho Thương Mại Điện Tử"
description: "Dự án E2E xây dựng hệ thống Data Lakehouse phân tán sử dụng Spark, MinIO, Dagster, Delta Lake và MLflow cho bài toán thương mại điện tử."
difficulty: "Intermediate"
tags: ["data-lakehouse", "delta-lake", "spark", "dagster", "minio", "mlflow", "star-schema", "e2e-project"]
readingTime: "18 mins"
seoTitle: "Dự án EcomLake: Lakehouse với Spark, Delta Lake, Dagster, MLflow"
metaDescription: "Xây dựng Data Lakehouse thương mại điện tử end-to-end: Spark standalone cluster, Delta Lake trên MinIO, Software-Defined Assets với Dagster, Spark Thrift Server và MLflow."
domains: ["DE", "Platform"]
level: "Middle"
---



**Credit:** Thank for Thanh Hùng

EcomLake được thiết kế theo kiến trúc Data Lakehouse phân tán, tích hợp các công nghệ xử lý dữ liệu lớn (Big Data) nhằm giải quyết bài toán về khả năng mở rộng (scalability), độ tin cậy (reliability) và hiệu năng (performance). Hệ thống tuân thủ nguyên tắc "Separation of Compute and Storage" (Tách biệt tính toán và lưu trữ), cho phép linh hoạt trong quản lý tài nguyên và tối ưu hóa chi phí hạ tầng (TCO).

---

## 1. Tổng Quan Kiến Trúc Hệ Thống

**Các Thành Phần Cốt Lõi:**
- **Orchestration & Workflow (Điều phối):** Sử dụng Dagster định nghĩa và giám sát pipeline.
- **Distributed Computing (Tính toán phân tán):** Apache Spark đảm nhiệm xử lý dữ liệu quy mô lớn.
- **Storage (Lưu trữ):** MinIO (S3-compatible) kết hợp Delta Lake đảm bảo tính ACID.
- **Analytics & BI (Phân tích):** Metabase và Streamlit trực quan hóa dữ liệu.
- **MLOps (Vận hành học máy):** MLflow quản lý vòng đời mô hình.

![Tổng quan kiến trúc](/images/projects/e2e/ecomlake/6c5d7a38.png)
*Hình 1. Tổng quan kiến trúc*

---

## 2. Chi Tiết Các Phân Hệ Chức Năng

### 2.1. Phân Hệ Điều Phối và Tính Toán (Orchestration & Computing)

#### Spark Master - Quản Trị Cụm Phân Tán
![Giao diện quản lý Spark Master Cluster](/images/projects/e2e/ecomlake/ce104ea3.png)
*Hình 2. Giao diện quản lý Spark Master Cluster*

**Vai trò hệ thống:**
Spark Master đóng vai trò Resource Manager trung tâm trong kiến trúc Master-Slave. Thành phần này chịu trách nhiệm:
- **Quản lý tài nguyên tập trung:** Phân bổ cores và RAM từ Worker nodes cho các ứng dụng.
- **Cơ chế Fault Tolerance:** Tự động điều hướng tác vụ khi Worker gặp sự cố, đảm bảo tính bền vững của hệ thống.

#### Dagster - Quản Lý Luồng Dữ Liệu
![Biểu đồ phụ thuộc dữ liệu (Data Lineage) trong Dagster](/images/projects/e2e/ecomlake/8c9da7bc.png)
*Hình 3. Biểu đồ phụ thuộc dữ liệu (Data Lineage) trong Dagster*

**Cơ chế hoạt động:**
Hệ thống sử dụng Dagster để định nghĩa Software-Defined Assets (SDAs), cung cấp khả năng quan sát toàn diện (Observability) về luồng dữ liệu.
- **Data Lineage:** Theo dõi trực quan sự phụ thuộc giữa các bảng từ Bronze -> Silver -> Gold.
- **Tái tính toán thông minh:** Chỉ kích hoạt lại các pipeline bị ảnh hưởng khi dữ liệu nguồn thay đổi, tối ưu hóa tài nguyên tính toán.

Khác biệt triết lý so với Airflow: Airflow điều phối **task** (hàm chạy), Dagster điều phối **asset** (bảng dữ liệu tồn tại sau khi chạy). Một asset Silver được khai báo phụ thuộc trực tiếp vào asset Bronze:

```python
@asset(deps=[bronze_orders], compute_kind="spark")
def silver_orders(context) -> None:
    spark = get_spark_session()
    (spark.read.format("delta").load("s3a://lakehouse/bronze/orders")
        .dropDuplicates(["order_id"])
        .withColumn("order_date", F.to_date("created_at"))
        .write.format("delta").mode("overwrite")
        .option("overwriteSchema", "true")
        .save("s3a://lakehouse/silver/orders"))
```

Nhờ khai báo dependency ở mức asset, Dagster tự vẽ lineage, biết asset nào **stale** (nguồn đã đổi nhưng chưa tính lại) và hỗ trợ backfill theo partition mà không cần viết logic thủ công — xem chi tiết trong bài [Software-Defined Assets](/concepts/7-dataops-orchestration-quality/software-defined-assets/).

![Trạng thái thực thi Distributed Tasks trên Spark Cluster](/images/projects/e2e/ecomlake/cc5c5c1c.png)
*Hình 4. Trạng thái thực thi Distributed Tasks trên Spark Cluster*

---

### 2.2. Phân Hệ Lưu Trữ Data Lakehouse (Storage Layer)

#### Kiến Trúc Lưu Trữ Đối Tượng (Object Storage)
![Cấu trúc Bucket Lakehouse trên MinIO](/images/projects/e2e/ecomlake/894a18e6.png)
*Hình 5. Cấu trúc Bucket Lakehouse trên MinIO*

**Giải pháp hạ tầng:**
Hệ thống triển khai MinIO làm giải pháp lưu trữ nền tảng. Việc tách biệt lớp lưu trữ (MinIO) khỏi lớp tính toán (Spark) mang lại lợi ích kép: khả năng mở rộng dung lượng lên Petabytes độc lập với tài nguyên tính toán và khả năng tích hợp chuẩn S3 API với mọi công cụ Big Data.

#### Tổ Chức Dữ Liệu và Định Dạng Delta Lake
![Tổ chức dữ liệu tầng Gold (Star Schema)](/images/projects/e2e/ecomlake/be925998.png)
*Hình 6. Tổ chức dữ liệu tầng Gold (Star Schema)*

**Cấu trúc dữ liệu:**
Dữ liệu tại tầng Gold được tổ chức theo mô hình [Star Schema](/concepts/6-data-modeling-transformation/star-schema/) (Fact & Dimension tables) để tối ưu cho các truy vấn phân tích (OLAP). Về mặt vật lý, dữ liệu được lưu trữ dưới định dạng [Delta Lake](/concepts/3-storage-engines-formats/delta-lake/) (dựa trên Parquet + Transaction Log), đảm bảo:
- **ACID Transactions:** Toàn vẹn dữ liệu khi ghi/đọc đồng thời. Cơ chế bên dưới là `_delta_log/` — chuỗi file JSON commit tuần tự; hai writer đụng độ được giải quyết bằng [Optimistic Concurrency Control](/concepts/3-storage-engines-formats/delta-optimistic-concurrency/).
- **Lưu trữ hướng cột (Columnar Storage):** Tối ưu hóa I/O và nén dữ liệu hiệu quả.
- **Time Travel:** Query lại phiên bản cũ bằng `VERSION AS OF` — cứu tinh khi job ghi sai dữ liệu tầng Gold.

Vận hành Delta trên MinIO có hai việc định kỳ bắt buộc, thường bị các dự án demo bỏ qua: `OPTIMIZE` (gom small files do nhiều lần ghi micro-batch) và `VACUUM` (dọn file mồ côi sau retention, mặc định 7 ngày) — phân tích đầy đủ tại [Delta OPTIMIZE & VACUUM](/concepts/3-storage-engines-formats/delta-optimize-vacuum/).

![Các Partition Files định dạng Parquet](/images/projects/e2e/ecomlake/aa3b246b.png)
*Hình 7. Các Partition Files định dạng Parquet*

---

### 2.3. Phân Hệ Phân Tích và Trực Quan Hóa (Analytics & BI)

#### Cổng Kết Nối Dữ thực Dữ Phân Tán
![Kết nối JDBC qua Spark Thrift Server](/images/projects/e2e/ecomlake/6a9b4900.png)
*Hình 8. Kết nối JDBC qua Spark Thrift Server*

**Cơ chế tích hợp:**
Hệ thống sử dụng Spark Thrift Server làm Gateway, cho phép các công cụ BI giao tiếp với Data Lakehouse qua giao thức JDBC chuẩn. Mọi truy vấn SQL từ người dùng được chuyển đổi thành Spark Jobs và thực thi phân tán, tận dụng sức mạnh xử lý của cụm.

**Trade-off cần biết:** Thrift Server giữ một Spark application chạy thường trực và các query BI **chia sẻ chung pool executor** — một analyst chạy query nặng có thể chiếm hết slot của dashboard. Hai van an toàn tối thiểu: bật Fair Scheduler pool (`spark.scheduler.mode=FAIR`) để query ngắn không chết đói, và giới hạn kết quả trả về (Metabase row limit) tránh driver OOM do `collect` triệu dòng. Ở quy mô lớn hơn, đây là lý do các đội chuyển serving sang Trino/Presto hoặc [OLAP](/concepts/3-storage-engines-formats/olap/) engine chuyên dụng.

#### Ứng Dụng Dữ Liệu và Báo Cáo
![Dashboard tổng hợp năng lực hệ thống](/images/projects/e2e/ecomlake/1948b093.png)
*Hình 9. Dashboard tổng hợp năng lực hệ thống*

Streamlit truy xuất dữ liệu đã được làm sạch và tổng hợp từ tầng Gold để hiển thị các chỉ số trọng yếu (KPIs) thời gian thực.
Đặc biệt, khả năng xử lý dữ liệu lớn được thể hiện qua Dashboard địa lý (Geospatial). Hệ thống đã tính toán trước (pre-compute) các chỉ số phức tạp trên hàng triệu bản ghi transaction tại tầng Gold, giúp việc hiển thị bản đồ nhiệt (Heatmap) diễn ra tức thì.

![Khả năng tổng hợp dữ liệu không gian lớn](/images/projects/e2e/ecomlake/ceee0f07.png)
*Hình 10. Khả năng tổng hợp dữ liệu không gian lớn*

---

### 2.4. Phân Hệ Vận Hành Học Máy (MLOps)

#### Quản Lý Vòng Đời Mô Hình
![Theo dõi thực nghiệm (Experiment Tracking) trên MLflow](/images/projects/e2e/ecomlake/01deb660.png)
*Hình 11. Theo dõi thực nghiệm (Experiment Tracking) trên MLflow*

**Quy trình chuẩn hóa:**
Hệ thống tích hợp MLflow để kiểm soát toàn bộ quy trình Data Science. Mọi tham số (Hyperparameters), chỉ số đánh giá (Metrics) và môi trường thực thi đều được ghi lại tự động, đảm bảo tính tái lập (Reproducibility) của các thí nghiệm.

#### Quản Lý Artifacts và Pipeline
![Lưu trữ SparkML Pipeline](/images/projects/e2e/ecomlake/f507f1c0.png)
*Hình 12. Lưu trữ SparkML Pipeline*

Hệ thống lưu trữ không chỉ mô hình cuối cùng mà cả toàn bộ pipeline xử lý (Preprocessing + Modeling) dưới dạng serialized objects trong MinIO. Điều này loại bỏ hoàn toàn vấn đề sai lệch dữ liệu (Training-Serving Skew) khi triển khai mô hình vào thực tế.

---

## 3. Rủi Ro Vận Hành & Nâng Cấp

1. **Spark Standalone không có resource isolation thật sự** — mọi app chia executor tĩnh. Khi nhiều pipeline chạy đồng thời, nên chuyển sang K8s/YARN với dynamic allocation.
2. **MinIO một node = mất dữ liệu khi hỏng đĩa.** Production cần distributed mode ≥4 node với erasure coding, hoặc chuyển thẳng lên S3.
3. **Small files từ ghi micro-batch:** mỗi lần Dagster materialize asset là một loạt file Parquet mới. Lịch `OPTIMIZE` hằng đêm + `spark.sql.shuffle.partitions` hợp lý (mặc định 200 là quá nhiều cho dữ liệu vài GB) là bắt buộc — xem [Compaction](/concepts/3-storage-engines-formats/compaction/) và [Spark Partition](/concepts/4-compute-engines-batch/spark-partition/).
4. **Training-Serving Skew đã xử lý đúng hướng** (serialize cả preprocessing pipeline vào MLflow), nhưng còn thiếu monitoring [distribution drift](/concepts/7-dataops-orchestration-quality/distribution-drift/) cho features đầu vào — bước tiếp theo tự nhiên là thêm [Feature Store](/concepts/1-distributed-systems-architecture/feature-store/).

## 4. Kết Luận

Kiến trúc EcomLake đã hiện thực hóa thành công mô hình Modern Data Lakehouse, giải quyết triệt để các thách thức của bài toán Big Data. Sự kết hợp chặt chẽ giữa Spark (Tính toán), MinIO (Lưu trữ), Dagster (Điều phối) và Metabase/Streamlit (BI) tạo nên một nền tảng dữ liệu thống nhất, mạnh mẽ và có khả năng mở rộng không giới hạn, phục vụ đắc lực cho cả nhu cầu Business Intelligence và Advanced Analytics.

> Tham khảo chi tiết tại GitHub Repository: [EcomLake](https://github.com/kythuatdulieu/EcomLake)

## Nguồn Tham Khảo

- [Delta Lake Documentation](https://docs.delta.io/latest/index.html) - Linux Foundation.
- [Dagster: Software-Defined Assets](https://docs.dagster.io/concepts/assets/software-defined-assets) - Dagster Labs.
- [Spark Standalone Mode](https://spark.apache.org/docs/latest/spark-standalone.html) - Apache Software Foundation.
- [Distributed Spark Thrift Server (JDBC/ODBC)](https://spark.apache.org/docs/latest/sql-distributed-sql-engine.html) - Apache Software Foundation.
- [MLflow Documentation](https://mlflow.org/docs/latest/index.html) - Linux Foundation.
- [MinIO Erasure Coding](https://min.io/docs/minio/linux/operations/concepts/erasure-coding.html) - MinIO.
