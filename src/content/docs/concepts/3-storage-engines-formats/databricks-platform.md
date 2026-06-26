---
title: "Databricks Platform: System Architecture & Execution Engines"
difficulty: "Advanced"
tags: ["databricks", "spark", "lakehouse", "photon", "liquid-clustering", "unity-catalog"]
readingTime: "20 mins"
lastUpdated: 2026-06-26
seoTitle: "Databricks Platform Architecture: Control Plane, Photon & Trade-offs"
metaDescription: "Phân tích kiến trúc kỹ thuật sâu của Databricks: Control Plane, Data Plane, Photon Vectorized Engine, Liquid Clustering vs Z-Ordering và xử lý lỗi OOMKilled."
description: "Mổ xẻ kiến trúc Databricks từ góc nhìn System Design: Các luồng thực thi vật lý, Photon C++ Engine, Liquid Clustering và các rủi ro vận hành (OOM, Shuffle Spill)."
---

Bỏ qua các định nghĩa mang tính tiếp thị về "Data Intelligence Platform", ở góc độ **System Design**, Databricks bản chất là một hệ thống phân tán mạnh mẽ kết hợp giữa năng lực điều phối cụm (Cluster Orchestration) và lõi xử lý dữ liệu được tinh chỉnh (Spark/Photon) chạy trên Cloud Object Storage.

Bài viết này sẽ mổ xẻ kiến trúc vật lý của Databricks, các engine thực thi cốt lõi (Photon), quản trị layout dữ liệu (Liquid Clustering), và các sự cố vận hành (OOMKilled) dưới góc nhìn của một Data Engineer.

---

## 1. Kiến trúc Vật lý (Physical Execution Architecture)

Kiến trúc Databricks tuân thủ mô hình bảo mật chia sẻ (Shared Security Model) trên Cloud (AWS/Azure/GCP), phân tách hoàn toàn giữa **Control Plane** và **Data Plane**. Sự phân tách này đảm bảo nguyên tắc: *Databricks quản lý Compute, nhưng Customer nắm giữ Data.*

```mermaid
architecture-beta
    group control_plane("cloud")[Control Plane("Databricks Account")]
    group data_plane("cloud")[Data Plane("Customer VPC")]
    
    service web_ui("server")[Web UI / Notebooks] in control_plane
    service job_sched("server")[Workflow Scheduler] in control_plane
    service cluster_mgr("server")[Cluster Manager] in control_plane
    
    service compute_nodes("server")[Spark/Photon Clusters("EC2/VMs")] in data_plane
    service object_storage("database")[S3 / ADLS / GCS] in data_plane
    
    web_ui --> job_sched
    job_sched --> cluster_mgr
    cluster_mgr -- "Provision & Monitor("Secure Tunnel")" --> compute_nodes
    compute_nodes -- "Read/Write Data("High Bandwidth")" --> object_storage
```

### 1.1. Control Plane (Quản lý bởi Databricks)
Đây là bộ não điều phối chạy trên tài khoản Cloud của Databricks.
* **Cluster Manager:** Giao tiếp với Cloud API của nhà cung cấp (ví dụ AWS EC2 API) để khởi tạo, mở rộng (auto-scale) hoặc hủy các Spot/On-Demand Instances.
* **Job Scheduler:** Trình kích hoạt DAG, quản lý luồng thực thi của các job (Databricks Workflows).
* Dữ liệu truyền qua đây chỉ là Metadata, Logs và cấu hình. Khách hàng không lưu dữ liệu thô tại Control Plane (ngoại trừ cấu hình Serverless SQL/Compute - nơi Compute node cũng được Databricks host).

### 1.2. Data Plane (VPC của Khách hàng)
Nơi xảy ra các tác vụ tính toán nặng (Heavy Lifting).
* **Compute Layer:** Các Node Worker (Databricks Runtime) được cấp phát ngay trong VPC của bạn. Bạn phải cấu hình Subnet, Security Groups và NAT Gateway để đảm bảo các node này có thể kéo (pull) container image từ hệ thống của Databricks một cách an toàn.
* **Storage Layer:** Dữ liệu hoàn toàn nằm trên S3/ADLS bucket của bạn. Compute Node sẽ mount hoặc truy cập qua IAM Roles/Instance Profiles.

> [!WARNING]
> **Cross-AZ Traffic Costs (Chi phí băng thông):** Trong Data Plane, nếu bạn khởi tạo cluster trải dài trên nhiều Availability Zones (AZ) để tăng tính khả dụng, các thao tác Shuffle (xáo trộn dữ liệu qua mạng) giữa các node khác AZ sẽ sinh ra cước phí Network Egress rất cao từ Cloud Provider. Đây là trade-off giữa High Availability và Compute Cost.

---

## 2. Compute Layer: Dấu chấm hết của JVM với Photon Engine

Spark truyền thống chạy trên **JVM (Java Virtual Machine)**. Mặc dù Tungsten Engine (từ Spark 2.x) đã tạo ra mã byte-code (whole-stage code generation) rất tốt, JVM vẫn phải chịu overhead về Garbage Collection (GC) và không có khả năng tận dụng triệt để kiến trúc phần cứng CPU hiện đại.

Databricks đã viết lại engine thực thi bằng C++ gọi là **Photon**.

### 2.1. Vectorized Execution (Thực thi Vector hóa)
Thay vì xử lý từng dòng (row-by-row) truyền thống, Photon xử lý dữ liệu theo các **Columnar Batches** (lô cột). Điều này cho phép engine tận dụng trực tiếp tập lệnh **SIMD (Single Instruction, Multiple Data)** của CPU. 
Ví dụ: Để cộng hai cột A và B, thay vì CPU lặp qua 1000 dòng mất 1000 chu kỳ, nó sử dụng thanh ghi 256-bit (AVX2) hoặc 512-bit (AVX-512) để nạp và cộng hàng loạt các phần tử trong cùng một chu kỳ xung nhịp (clock cycle), giảm thiểu CPU branch prediction lỗi và tối ưu cache cấp L1/L2.

### 2.2. Sự kiện "Fallback" về Spark JVM
Photon tích hợp sâu vào Catalyst Optimizer, nó không đứng độc lập.
* Nếu Catalyst phát hiện query node (ví dụ: Hash Aggregate, Filter, Sort) được Photon hỗ trợ, nó sẽ sinh ra `Photon-optimized Plan`.
* Nếu gặp một thao tác không được hỗ trợ (ví dụ: Custom UDF viết bằng Python, xử lý chuỗi Regex phức tạp ngoài chuẩn, hoặc một số hàm JSON đặc thù), engine sẽ tự động **fallback** (rơi về) Spark JVM. Quá trình chuyển đổi định dạng bộ nhớ giữa bộ nhớ unmanaged của C++ và bộ nhớ heap của JVM sẽ tạo ra overhead nhỏ.

> [!TIP]
> Để tận dụng tối đa sức mạnh Photon, tuyệt đối hạn chế sử dụng Python UDFs. Hãy sử dụng các hàm built-in của Spark SQL, vì chúng được map trực tiếp với các hàm C++ hiệu năng cao của Photon.

---

## 3. Storage Layout: Z-Ordering vs. Liquid Clustering

Tối ưu hóa layout file (cách dữ liệu sắp xếp vật lý trong Object Storage) là chìa khóa để giảm I/O qua kỹ thuật Data Skipping. 

### 3.1. Hạn chế của Z-Ordering (Legacy)
Trước đây, các kỹ sư thường dùng Partitioning kết hợp với **Z-Ordering** (thuật toán không gian ánh xạ đa chiều thành 1D - Z-order curve) để gom cụm dữ liệu liên quan vào cùng một file Parquet.
* **Trade-offs:** Z-Ordering gây ra hiện tượng **Write Amplification** (khuếch đại ghi) cực kỳ lớn. Mỗi lần chạy lệnh `OPTIMIZE ... ZORDER BY`, engine phải đọc lại dữ liệu cũ, sort lại cùng dữ liệu mới, và ghi đè hàng loạt file Parquet. Quan trọng hơn, nếu bạn quyết định thay đổi chiến lược cột (change z-order keys), bạn phải rewrite lại toàn bộ table.

### 3.2. Sự trỗi dậy của Liquid Clustering
Liquid Clustering ra đời nhằm thay thế hoàn toàn Partitioning tĩnh và Z-Ordering. Nó sử dụng thuật toán gom cụm động (dynamic clustering) để tự động điều chỉnh layout file khi dữ liệu (và cả query pattern) thay đổi.

```sql
-- Tạo bảng với Liquid Clustering thay vì PARTITIONED BY lỗi thời
CREATE TABLE events_prod (
  event_id STRING,
  user_id STRING,
  event_time TIMESTAMP,
  payload STRING
)
USING DELTA
CLUSTER BY (user_id, DATE(event_time));

-- Đổi chiến lược Cluster on-the-fly mà không cần rewrite data cũ
ALTER TABLE events_prod CLUSTER BY (event_id);

-- Hệ thống sẽ tự động điều chỉnh layout cho các data mới khi chạy OPTIMIZE
OPTIMIZE events_prod;
```
**Lợi ích hệ thống:** Liquid Clustering giải quyết triệt để lỗi High-cardinality partitioning (tạo ra hàng triệu folder nhỏ làm sập NameNode/Metadata layer), và mang lại khả năng flexibility tuyệt đối cho các bảng Delta lớn.

---

## 4. Rủi ro Vận hành: Nỗi ám ảnh OOMKilled và Shuffle Spill

Dù kiến trúc Databricks có mạnh mẽ, hệ thống vẫn sẽ sập nếu Data Engineer không hiểu cơ chế Shuffle. Khi dữ liệu được join (đặc biệt là SortMergeJoin) hoặc aggregate, Spark buộc phải phân phối lại dữ liệu qua mạng giữa các node (**Network Shuffle**).

### 4.1. Hiện tượng Shuffle Spill
Khi bộ nhớ thực thi (Execution Memory) của Executor bị đầy do lượng dữ liệu dồn về một task quá lớn, Spark buộc phải "tràn" (spill) dữ liệu bộ nhớ ra ổ cứng SSD cục bộ (Local Disk) của Node. 
Trong giao diện Spark UI, nếu bạn thấy chỉ số **Shuffle Spill (Disk)** > 0, hiệu năng pipeline của bạn đang bị bóp nghẹt nghiêm trọng do Disk I/O Bottleneck.

### 4.2. JVM OOMKilled (Exit Code 137)
Khi lượng dữ liệu Spill quá lớn gây cạn kiệt Disk, hoặc khi bộ dọn rác GC làm việc liên tục không nghỉ (GC Stall) khiến Node bị treo, hệ thống quản lý tài nguyên (YARN/K8s) sẽ thẳng tay kill luôn container đó với lỗi `OOMKilled`. Tình trạng này đặc biệt dễ xảy ra khi gặp hiện tượng **Data Skew** (Dữ liệu lệch - một task phải ôm 90% lượng data cần xử lý).

**Kỹ thuật Khắc phục (Troubleshooting Code):**

```python
# 1. Bật Adaptive Query Execution (AQE) để engine tự động xử lý Skew Join
# AQE sẽ chia nhỏ các task bị lệch thành các task nhỏ hơn ở runtime
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")

# 2. Tăng Shuffle Partitions (Mặc định 200 là quá nhỏ cho Terabyte data)
# Quy tắc hệ thống: Target kích thước mỗi partition sau shuffle khoảng 100MB - 200MB.
# Giả sử shuffle data size là 400GB -> cần ít nhất 2000 partitions.
spark.conf.set("spark.sql.shuffle.partitions", "2000")

# 3. Tăng Memory Overhead nếu dùng Python UDFs hoặc Photon (Off-heap memory)
# Container có thể bị kill không phải do JVM heap, mà do bộ nhớ C++ (Off-heap) vượt ngưỡng.
# Cấu hình trong Cluster Init (tăng lên 20% hoặc 30% thay vì 10% mặc định)
spark.conf.set("spark.executor.memoryOverheadFactor", "0.2")
```

---

## 5. Unity Catalog: Quản trị Kiến trúc (Data Governance)

Ở môi trường Data Lake truyền thống, Data Engineer quản lý phân quyền qua các ACL (Access Control List) rời rạc như AWS S3 Bucket Policies hay IAM Roles. Điều này dẫn đến địa ngục bảo mật khi scale up. **Unity Catalog (UC)** giải quyết bằng cách cung cấp một lớp Meta-store tập trung và độc lập.

Unity Catalog hoạt động như một "Người gác cổng" (Gatekeeper):
1. User (hoặc BI Tool) chạy query `SELECT * FROM prod.finance.revenue`.
2. Engine tính toán sẽ kiểm tra quyền hạn (Access Control) với Unity Catalog Server (thuộc Control Plane).
3. Nếu hợp lệ, UC sẽ cấp phát một **Temporary Credentials** (Token hết hạn trong thời gian ngắn như AWS STS) để Compute Node đọc dữ liệu trực tiếp từ S3.

Kiến trúc này giúp các kỹ sư (và cả Cluster) không bao giờ cần phải lưu trữ Access Key dài hạn của Object Storage, triệt tiêu rủi ro lộ cấu hình (Credential Leaks). Ngoài ra, UC hỗ trợ Row-level và Column-level Security bằng chuẩn SQL GRANT, một mức độ chi tiết mà S3 Policy không thể chạm tới.

---

## Nguồn Tham Khảo (References)
* [Databricks Blog: Photon Vectorized Query Engine](https://www.databricks.com/blog/2021/06/17/announcing-photon-public-preview-the-next-generation-query-engine-on-the-databricks-lakehouse-platform.html)
* [Databricks Blog: Announcing Liquid Clustering](https://www.databricks.com/blog/2023/10/24/announcing-general-availability-liquid-clustering.html)
* [Understanding Spark OOM, Spill, and Data Skew - Databricks Architecture](https://www.databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html)
* *Designing Data-Intensive Applications* - Martin Kleppmann (O'Reilly).
