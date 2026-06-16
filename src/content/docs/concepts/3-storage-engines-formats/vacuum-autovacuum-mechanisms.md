---
title: "Operational: Vacuum & Quản lý Dead Tuples trong Data Warehouse"
description: "Tìm hiểu cơ chế MVCC, cách sinh ra Dead Tuples, và cách Vacuum/Autovacuum hoạt động để quản lý không gian lưu trữ và duy trì hiệu suất trong PostgreSQL, Delta Lake, và Apache Iceberg."
---



Trong các hệ thống quản trị cơ sở dữ liệu (như PostgreSQL) và Data Lakehouse hiện đại (như Delta Lake, Apache Iceberg), cơ chế **MVCC (Multi-Version Concurrency Control)** được sử dụng rộng rãi để cho phép nhiều giao dịch (transaction) cùng đọc và ghi dữ liệu đồng thời mà không bị lock (khóa) lẫn nhau. Tuy nhiên, cái giá phải trả của MVCC là sự phình to dữ liệu do các phiên bản cũ không còn sử dụng, được gọi là **Data Bloat**. 

Cơ chế **Vacuum** sinh ra để "dọn dẹp bãi chiến trường" này, đảm bảo hệ thống lưu trữ được tối ưu và hiệu suất truy vấn không bị suy giảm theo thời gian. Bài viết này sẽ đi sâu vào cơ chế sinh ra rác (Dead Tuples) và cách vận hành Vacuum từ RDBMS truyền thống đến các định dạng bảng hiện đại (Table Formats).

## 1. Cơ chế MVCC và Sự hình thành "Rác" (Dead Tuples / Orphan Files)



### 1.1. Trong RDBMS (PostgreSQL)
Khi bạn thực hiện lệnh `UPDATE` hoặc `DELETE` trong PostgreSQL, hệ thống **không thực sự xóa bỏ** dòng dữ liệu cũ trên đĩa ngay lập tức.
- **DELETE:** Dòng dữ liệu được đánh dấu là "đã chết" bằng cách cập nhật metadata (trường `xmax` được gán bằng ID của transaction thực hiện lệnh DELETE).
- **UPDATE:** Thực chất là một sự kết hợp của `DELETE` và `INSERT`. Dòng cũ được đánh dấu "chết" và một dòng dữ liệu mới tinh được thêm vào bảng.

Việc này giúp các truy vấn đang chạy (được bắt đầu từ trước khi có lệnh UPDATE/DELETE) vẫn có thể đọc được phiên bản cũ của dữ liệu một cách an toàn (tính nhất quán của snapshot). Nhưng qua thời gian, nếu bạn có các bảng OLTP/OLAP phải UPDATE hàng triệu dòng mỗi ngày, bảng của bạn sẽ tràn ngập "xác chết" (Dead Tuples).

### 1.2. Trong Data Lakehouse (Delta Lake / Apache Iceberg)
Các hệ thống Data Lakehouse sử dụng các file dữ liệu bất biến (immutable files) như Parquet hay ORC.
- Khi có một thao tác `UPDATE` hoặc `DELETE`, hệ thống không thể sửa trực tiếp file Parquet hiện có.
- Thay vào đó, nó tạo ra các file dữ liệu mới chứa kết quả sau khi cập nhật, và ghi nhận vào Transaction Log (Delta Log) hoặc Metadata Tree (Iceberg) rằng các file mới được thêm vào và các file cũ bị loại bỏ (tombstoned).
- Các file cũ này giờ đây trở thành rác, nhưng chúng vẫn nằm trên Object Storage (S3, GCS) để hỗ trợ tính năng **Time Travel** (quay ngược thời gian). 

Theo thời gian, số lượng file bị loại bỏ (orphan files hoặc unreferenced files) sẽ tăng lên, tiêu tốn chi phí lưu trữ khổng lồ.

---

## 2. Vacuum / Autovacuum Làm Nhiệm Vụ Gì?

**Vacuum** là quá trình quét lại không gian lưu trữ, dọn dẹp dữ liệu rác, và giải phóng hoặc tái sử dụng không gian đĩa. Tùy thuộc vào hệ thống, quá trình này có những đặc thù riêng:

### 2.1. Vacuum trong PostgreSQL
PostgreSQL cung cấp 2 chế độ chính:
1. **VACUUM (Standard):** Quét qua các table, tìm các Dead Tuples và đánh dấu vùng trống đó vào **Free Space Map (FSM)** để các lệnh `INSERT`/`UPDATE` sau này có thể ghi đè lên. 
   - Quá trình này **không làm giảm dung lượng file vật lý** (không trả lại dung lượng cho OS).
   - Có thể chạy song song với các thao tác đọc/ghi khác.
2. **VACUUM FULL:** Ghi lại toàn bộ bảng sang một file vật lý mới, loại bỏ hoàn toàn các khoảng trống.
   - Giải phóng được dung lượng ổ cứng thực sự.
   - **Nhược điểm chí mạng:** Sẽ lock (khóa cứng) toàn bộ bảng (`AccessExclusiveLock`), gây ra downtime, không ai có thể đọc hay ghi trong lúc này.

Để tự động hóa, PostgreSQL có daemon **Autovacuum** chạy ngầm. Nó liên tục theo dõi mức độ thay đổi dữ liệu của các bảng và tự động kích hoạt `VACUUM` (standard) cũng như `ANALYZE` để cập nhật thống kê (statistics) khi cần thiết. 

### 2.2. Vacuum trong Delta Lake và Apache Iceberg
Khác với PostgreSQL, rác trong Data Lakehouse là các file vật lý nằm trên Object Storage. Lệnh `VACUUM` trên Delta Lake (hoặc Expire Snapshots trong Iceberg) sẽ:
- Duyệt qua Transaction Log để xác định các file dữ liệu không còn thuộc về trạng thái dữ liệu hiện tại (hoặc không nằm trong phạm vi lịch sử được giữ lại).
- Xóa vĩnh viễn các file Parquet/ORC này khỏi ổ cứng/S3.

Ví dụ lệnh trong Databricks (Delta Lake):
```sql
VACUUM events_table RETAIN 168 HOURS; -- Giữ lại lịch sử 7 ngày
```

---

## 3. Quản lý và Tối Ưu Autovacuum / Vacuum

### 3.1. Tối ưu Autovacuum cho PostgreSQL
Với các bảng cập nhật thường xuyên, cấu hình Autovacuum mặc định thường không đủ nhanh để dọn dẹp, dẫn đến bảng bị Bloat nặng nề. Bạn có thể cần điều chỉnh:
- **`autovacuum_vacuum_scale_factor`:** Mặc định là 0.2 (20%). Nghĩa là nếu 20% số dòng của bảng bị thay đổi, autovacuum mới chạy. Với bảng 100 triệu dòng, phải có 20 triệu dòng thay đổi mới kích hoạt. Hãy giảm mức này xuống (ví dụ 0.05 hoặc 0.01) cho các bảng lớn.
- **`autovacuum_vacuum_cost_limit` và `autovacuum_vacuum_cost_delay`:** Tinh chỉnh để autovacuum chạy "mạnh" hơn thay vì ngủ đông quá lâu giữa các lần quét.
- **Transaction ID Wraparound:** PostgreSQL dùng số nguyên 32-bit cho Transaction ID. Nếu hệ thống chạm ngưỡng 2 tỷ transaction, nó sẽ bị bọc vòng (wraparound) dẫn đến nguy cơ mất dữ liệu. Vacuum đóng vai trò quan trọng trong việc "đóng băng" (freeze) các transaction cũ để ngăn chặn thảm họa này.

### 3.2. Chiến lược Vacuum cho Data Lakehouse
- **Schedule định kỳ:** Luôn thiết lập một job chạy định kỳ (hàng ngày hoặc hàng tuần) để `VACUUM` dữ liệu rác, nhằm tối ưu hóa chi phí lưu trữ AWS S3 / Azure Blob Storage.
- **Tránh việc Vacuum quá ngắn:** Đừng đặt thời gian Retention quá thấp (ví dụ: `RETAIN 0 HOURS`), nếu không bạn sẽ đối mặt với rủi ro cực lớn.

---

## 4. Cảnh Báo "Sập Bẫy" Khi Chạy Vacuum trên Data Lakehouse

Rất nhiều Junior Data Engineer mắc sai lầm chí mạng: Chạy lệnh `VACUUM` với Retention = 0 giờ trên Delta Lake để "tiết kiệm tối đa chi phí S3 ngay lập tức". Hậu quả để lại rất khôn lường:

1. **Mất khả năng Time Travel:** Tính năng `Time Travel` (quay ngược thời gian dữ liệu, ví dụ đọc lại trạng thái bảng lúc 8h sáng) bị vô hiệu hóa hoàn toàn, vì các file lưu trữ trạng thái đó đã bị xóa mất. Khả năng phục hồi khi ghi nhầm dữ liệu (Disaster Recovery) là số không.
2. **Crash Streaming Jobs và Long-running Queries:** Nếu có một job đọc dữ liệu chậm, hoặc một streaming job đang âm thầm đọc các file cũ, job đó sẽ **crash lập tức** vì file đã "bốc hơi" khỏi ổ cứng (Lỗi `FileNotFoundException`). 
3. **Môi trường Production:** Ở môi trường Production, quy tắc bất thành văn là luôn giữ Retention của Vacuum tối thiểu từ **3 đến 7 ngày**, đủ thời gian để các batch job/streaming hoàn tất cũng như xử lý các sự cố khẩn cấp.

---

## Tài Liệu Tham Khảo

* [PostgreSQL Documentation: Routine Vacuuming](https://www.postgresql.org/docs/current/routine-vacuuming.html)
* [Databricks: Vacuum a Delta table](https://docs.databricks.com/en/delta/vacuum.html)
* [Apache Iceberg: Maintenance (Expire Snapshots, Remove Orphan Files)](https://iceberg.apache.org/docs/latest/maintenance/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
