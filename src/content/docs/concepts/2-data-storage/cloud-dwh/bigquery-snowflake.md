---
title: "Cloud DWH: BigQuery vs Snowflake - Mổ Xẻ Kiến Trúc Phân Tán và Tốc Độ Shuffle"
description: "Phân tích sâu sự tách biệt giữa Storage và Compute, Distributed Query Execution, và sức mạnh của mạng Petabit (Jupiter) ảnh hưởng thế nào đến tốc độ Shuffle."
lastUpdated: 2026-06-15
tags: ["data-engineering", "architecture", "bigquery", "snowflake"]
---

Các hệ thống Cloud Data Warehouse (DWH) như BigQuery và Snowflake đã thay đổi hoàn toàn cách chúng ta xử lý dữ liệu ở quy mô Petabyte. Khác với kiến trúc "shared-nothing" truyền thống (nơi compute và storage bị khóa chặt vào cùng một node vật lý), cả hai hệ thống này đều áp dụng một triết lý thiết kế mang tính bước ngoặt: **Tách biệt hoàn toàn Storage và Compute**.

Bài viết này dựa trên whitepaper nguyên bản của Snowflake (SIGMOD 2016) và các bài viết nội bộ của Google (BigQuery Under the Hood) để mổ xẻ cơ chế thực thi truy vấn phân tán (Distributed Query Execution), và giải thích tại sao cơ sở hạ tầng mạng (Petabit network) lại là "vũ khí bí mật" quyết định hiệu năng của toàn bộ hệ thống.

## 1. Bài Toán và Bối Cảnh (The Problem & Context)

Trước khi BigQuery và Snowflake ra đời, kiến trúc **Shared-Nothing** (như Teradata, Hadoop/Hive đời đầu, hay Amazon Redshift thời kỳ đầu) là tiêu chuẩn. Trong kiến trúc này, mỗi node trong cluster sở hữu CPU, RAM và Disk riêng. Khi truy vấn chạy, dữ liệu được phân chia (partition) trên các ổ đĩa của từng node.

**Vấn đề lớn nhất:** 
- **Rất khó đàn hồi (Elasticity):** Nếu bạn muốn thêm Compute (vì CPU bị thắt cổ chai), bạn bắt buộc phải mua thêm Node (bao gồm cả Disk), sau đó phải thực hiện **redistribute data** (phân bổ lại dữ liệu) sang các node mới. Quá trình này vô cùng đắt đỏ, chậm chạp và thường gây ra downtime.
- **Thiếu hụt khả năng chia sẻ tài nguyên (Resource Isolation):** Nếu nhiều phòng ban cùng chạy query nặng, họ sẽ tranh giành tài nguyên trên cùng một cluster, gây ra hiện tượng "noisy neighbor" nghiêm trọng.

Sự tách biệt vật lý giữa Storage và Compute (Decoupled Architecture) đã giải quyết triệt để bài toán này, cho phép Storage scale theo nhu cầu lưu trữ dữ liệu, và Compute scale theo nhu cầu tính toán hoàn toàn độc lập.

## 2. Kiến trúc Hệ thống (System Architecture Deep Dive)

Mặc dù cùng tách biệt Storage và Compute, cách BigQuery và Snowflake triển khai **Distributed Query Execution** lại khác nhau rõ rệt.

### 2.1. Snowflake: Multi-Cluster, Shared-Data Architecture
Theo bài báo SIGMOD 2016, Snowflake giới thiệu kiến trúc **Multi-Cluster, Shared-Data**:
- **Storage Layer:** Dữ liệu được lưu trữ tập trung trên Cloud Object Storage (như Amazon S3, GCS). Dữ liệu được nén, tổ chức dạng cột và chia nhỏ thành các **Micro-partitions** (mỗi partition thường vài chục tới vài trăm MB).
- **Compute Layer:** Sử dụng các "Virtual Warehouses" (VW). Các VW là các cluster Compute hoàn toàn độc lập (stateless), không lưu trữ dữ liệu cố định. Khi query chạy, worker nodes trên VW sẽ tự động kéo (pull) các micro-partitions cần thiết từ Remote Storage (S3) về SSD cục bộ để cache hoặc nạp thẳng vào Memory.

Nhờ tách biệt Compute, Snowflake cho phép nhiều Virtual Warehouses truy cập đồng thời vào một tập dữ liệu dùng chung (Shared-Data) mà không hề xảy ra tranh chấp (contention).

### 2.2. BigQuery: Dremel, Colossus và Sức Mạnh Mạng Jupiter
Trong BigQuery, mọi thứ được "vô hình hóa" dưới dạng Serverless, nhưng thực chất dựa trên các hệ thống khổng lồ của Google:
- **Storage (Colossus):** Hệ thống tệp phân tán của Google, lưu trữ dữ liệu dạng cột nén (Capacitor format).
- **Compute (Dremel):** Engine thực thi truy vấn theo mô hình cây (Execution Tree). Khi người dùng submit query, **Borg** (trình quản lý cluster của Google) tự động phân bổ hàng nghìn **Slots** (worker nodes). Dremel chia nhỏ query thành các task cho Slot (như leaf nodes làm việc đọc/tính toán, mixer nodes để tổng hợp dữ liệu).
- **Network (Jupiter):** Chìa khóa vàng của BigQuery, đóng vai trò như cầu nối cực nhanh giữa Compute và Storage.

### 2.3. Distributed Query Execution & Tốc Độ "Shuffle"
Khi thực thi một query phức tạp (như `JOIN` hai bảng Petabyte hoặc `GROUP BY` số lượng lớn), dữ liệu trung gian (intermediate data) cần được di chuyển và phân phối lại giữa các worker nodes để những row có chung "Key" nằm trên cùng một node. Quá trình này gọi là **Shuffle**.

Trong kiến trúc truyền thống, Shuffle là cơn ác mộng vì phụ thuộc vào I/O của đĩa cục bộ (ghi xuống đĩa rồi gửi qua mạng).
- **BigQuery:** Giải quyết bài toán Shuffle bằng kiến trúc **In-memory Shuffle Service**. Điểm mấu chốt: Google xây dựng mạng nội bộ **Jupiter Network** với băng thông lên tới **1 Petabit/sec** (bisection bandwidth). Tốc độ mạng này khủng khiếp đến mức việc gửi dữ liệu từ Compute node này sang Compute node khác qua mạng Jupiter còn **nhanh hơn đọc dữ liệu từ Local Disk (SSD)**. Bằng cách lưu trữ trạng thái Shuffle trên RAM phân tán và truyền cực nhanh qua mạng Petabit, BigQuery biến Shuffle từ một Disk I/O bottleneck thành một bài toán Network In-Memory.
- **Snowflake:** Khi Shuffle (ví dụ Hash Join lớn), Snowflake cũng ưu tiên thực hiện trên Memory. Tuy nhiên, nếu lượng dữ liệu intermediate quá lớn (vượt quá RAM của Virtual Warehouse), Snowflake sẽ **spill** (ghi tràn) xuống Local SSD của worker node. Nếu Local SSD đầy, nó tiếp tục spill xuống Remote Storage (S3/GCS). Do đó, trong Snowflake, mạng không phải là "thần dược" duy nhất; việc cung cấp đủ RAM và Disk qua cỡ Warehouse (Size) là chìa khóa.

## 3. Quyết định Thiết kế và Trade-offs (Design Decisions)

| Đặc điểm | BigQuery | Snowflake |
| :--- | :--- | :--- |
| **Bản chất Compute** | Serverless. Slot được cấp phát tự động theo từng query dựa trên Dremel Tree. | Virtual Warehouses. Người dùng chủ động chọn kích cỡ cluster (X-Small đến 4X-Large). |
| **Shuffle Data** | Dựa trên mạng Petabit (Jupiter) cho phép Shuffle In-Memory tốc độ cực cao, ít phụ thuộc Local Disk. | Chạy In-memory hoặc Local Disk. Nếu thiếu tài nguyên, spill xuống Remote Storage. |
| **Tối ưu hóa (Optimization)** | Hạn chế "Bytes Shuffled" bằng cách lọc dữ liệu, tránh join thừa. | Hạn chế "Bytes Spilled to Remote" bằng cách Scale up Warehouse hoặc dùng Micro-partition pruning. |
| **Đánh đổi (Trade-off)** | Giảm quyền kiểm soát tài nguyên chi tiết. Chi phí query (pay-per-byte scan) nhạy cảm với cách viết câu lệnh SELECT. | Phải chủ động quản lý kích cỡ và thời gian chạy của Warehouse. Dễ bị ngập nếu Warehouse quá nhỏ. |

## 4. Những Bài Học Thực Tiễn (Production Lessons Learned)

1. **Snowflake - Bài toán "Spilling":** 
   Một lỗi phổ biến là chạy các lệnh `JOIN` khổng lồ với Warehouse size `X-Small`. Khi Memory và Local Disk của các node cạn kiệt, Snowflake bắt đầu "Spill to Remote Storage" (chạy Shuffle xuống tận Object Storage). Anti-pattern này có thể khiến thời gian query từ 5 giây vọt lên 5 tiếng. *Cách giải quyết:* Scale up Warehouse để có thêm RAM/Local Disk, hoặc tối ưu cấu trúc dữ liệu trước khi join.
   
2. **BigQuery - Bẫy "Select *":** 
   Dù Jupiter network vô cùng mạnh mẽ với Petabit bandwidth, việc "Shuffle" toàn bộ column thay vì chỉ các column cần thiết vẫn là sự lãng phí tài nguyên khủng khiếp. Luôn chỉ `SELECT` các cột sử dụng và filter dữ liệu sớm (Predicate pushdown) để giảm bớt dữ liệu trung gian cần "Mix" giữa hàng nghìn Dremel slots.

3. **Cơ chế Pruning (Tỉa dữ liệu):** Cả hai hệ thống đều sống dựa vào Data Pruning (Bỏ qua các file không liên quan khi scan). Ở Snowflake, điều này diễn ra qua Micro-partitions (Metadata min/max cho từng file nhỏ). Ở BigQuery, kỹ thuật Clustered/Partitioned Tables là bắt buộc cho bảng lớn. Tối ưu Pruning giúp giảm thiểu lượng I/O phải đi qua mạng ngay từ khâu đọc đầu tiên.

## 5. Kết quả Hệ thống (Proof of Work)

Sự tách rời Storage/Compute cùng cơ chế Shuffle mạnh mẽ mang lại hiệu suất khó tin:
- **Snowflake** cho phép khởi tạo/tắt Virtual Warehouses trong vòng chưa tới 1 giây, phục vụ nhiều data pipelines riêng biệt mà không ai tranh giành I/O của ai, đồng thời tận dụng bộ nhớ cache trên SSD cực hiệu quả.
- **BigQuery** có thể scan hàng Petabyte log, thực thi Shuffle thông qua mạng Petabit Jupiter, và tổng hợp kết quả (`GROUP BY`, `JOIN`) trong vài chục giây mà người dùng không cần quản lý một con server nào.

## Tài liệu Tham khảo

1. **[The Snowflake Elastic Data Warehouse (SIGMOD 2016)](https://dl.acm.org/doi/10.1145/2882903.2903741):** Nền tảng gốc giải thích về kiến trúc Multi-Cluster Shared-Data, cơ chế tách rời Compute khỏi Storage và khái niệm Micro-partitions.
2. **[BigQuery Under the Hood (Google Cloud Blog)](https://cloud.google.com/blog/products/data-analytics/new-blog-series-bigquery-under-the-hood):** Cung cấp tài liệu sâu về Dremel, Colossus, và quan trọng nhất là vai trò của hạ tầng mạng Jupiter network với băng thông Petabit trong việc xử lý Shuffle.
