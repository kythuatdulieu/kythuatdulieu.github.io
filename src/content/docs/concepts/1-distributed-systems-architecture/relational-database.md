---
title: "Relational Database (RDBMS) - Staff Engineer Deep Dive"
difficulty: "Advanced"
tags: ["rdbms", "postgresql", "mysql", "mvcc", "system-design", "database"]
readingTime: "25 mins"
lastUpdated: 2026-06-29
seoTitle: "Cơ sở Dữ liệu Quan hệ (RDBMS) Chuyên Sâu - PostgreSQL vs MySQL"
metaDescription: "Deep dive vào kiến trúc RDBMS: Phân tích MVCC, B+Tree, Write Amplification ở PostgreSQL, Clustered Index của MySQL và bài học vận hành từ Uber, GitHub."
description: "Vượt qua các khái niệm SQL cơ bản, bài viết phân tích sâu vào kiến trúc vật lý bên trong của RDBMS, đánh đổi giữa PostgreSQL và MySQL, và các sự cố Split-Brain."
domains: ["DE", "Platform"]
level: "Senior"
---

Relational Database [RDBMS] không chỉ là các bảng với hàng và cột. Ở quy mô lớn, RDBMS là những cỗ máy phức tạp giải quyết bài toán đồng bộ hóa (Synchronization), độ trễ đĩa (Disk Latency), và độ tin cậy (Reliability). Dưới góc nhìn của một Kỹ sư Hệ thống (Staff Engineer), chúng ta sẽ không học cách viết câu lệnh `SELECT`, mà sẽ đi sâu mổ xẻ **Cơ chế lưu trữ vật lý**, **Concurrency Control (MVCC)**, cuộc chiến kiến trúc giữa **PostgreSQL và MySQL**, và những sự cố sập hệ thống kinh điển.

---

## 1. Kiến Trúc Vật Lý & Thực Thi (Physical Storage & Execution)

### 1.1. B+Tree, Data Pages và Buffer Pool
Khác với In-memory database (như Redis), RDBMS được thiết kế tối ưu cho đĩa cứng (Disk I/O). Đơn vị đọc/ghi nhỏ nhất trên đĩa không phải là 1 byte hay 1 row, mà là một **Page** (Trang dữ liệu - thường là 8KB trong PostgreSQL hoặc 16KB trong MySQL InnoDB).

Cấu trúc **B+Tree** được sinh ra để giảm thiểu số lần tìm kiếm trên đĩa (Disk Seek). Một B+Tree với độ sâu (Depth) bằng 3 có thể lưu trữ hàng tỷ bản ghi. Nghĩa là hệ thống chỉ tốn tối đa 3 thao tác I/O để tìm ra dòng dữ liệu.

Tuy nhiên, đọc từ đĩa cứng luôn chậm (millisecond). Do đó, RDBMS duy trì một vùng RAM gọi là **Buffer Pool** (hay Shared Buffers) để cache các Data Pages.

:::danger
**Rủi ro vận hành (Cache Churn]:** RAM rất đắt đỏ. Buffer Pool sử dụng thuật toán **LRU** (Least Recently Used) để quyết định Page nào bị đẩy ra khỏi RAM (Evict). Nếu một Data Analyst viết câu truy vấn `SELECT * FROM massive_table` mà không có index, RDBMS phải quét toàn bảng (Full Table Scan). Nó sẽ kéo hàng GB data từ đĩa lên RAM, vô tình "xóa sạch" những dữ liệu nóng (Hot data) đang nằm trong Buffer Pool của hệ thống Production. Hệ quả: Hiệu năng toàn bộ database sụp đổ đột ngột.
:::

### 1.2. Write-Ahead Logging (WAL) & Syscall fsync()
Khi một Transaction báo `COMMIT`, RDBMS **không** ghi trực tiếp dữ liệu thay đổi vào các Data Pages trên đĩa (vì đó là Random I/O rất chậm chạp). 
Thay vào đó, nó ghi sự kiện thay đổi (Append-only) vào một tệp nhật ký tuần tự gọi là **WAL (Write-Ahead Log)**.

Chỉ khi WAL được đẩy xuống đĩa vật lý thành công (thông qua lệnh system call `fsync()`), Transaction mới được báo thành công cho Client (Đảm bảo tính **Durability** - Bền vững).

**Sự cố Đánh đổi (Trade-offs) thực tế:** Cấu hình `fsync` sai lệch.
Trong MySQL InnoDB, tham số `innodb_flush_log_at_trx_commit` quyết định mạng sống của hệ thống:
- **`1`**: Gọi `fsync` ở mỗi commit. An toàn nhất, không bao giờ mất data, nhưng chậm nhất (High Latency).
- **`2`**: Chỉ flush vào OS Cache (Hệ điều hành), OS sẽ tự flush xuống đĩa mỗi 1 giây. Nhanh hơn rất nhiều, nhưng mất tối đa 1 giây dữ liệu nếu Server bị cúp điện.
- **`0`**: Buffer trên RAM của MySQL và xả xuống đĩa mỗi giây. Nhanh nhất (Max Throughput), nhưng rủi ro mất dữ liệu nếu tiến trình MySQL crash.

---

## 2. Kiểm Soát Đồng Thời: MVCC vs. Khóa 2PL

Làm sao để 10,000 kết nối có thể đọc/ghi cùng một lúc mà không bị chặn (Block)?

Cách ngây thơ nhất là Khóa (Lock) dữ liệu: Muốn đọc thì dùng Shared Lock, ghi dùng Exclusive Lock (Đây gọi là **Two-Phase Locking - 2PL**). Nhược điểm tàn khốc của 2PL là: *Người đọc sẽ chặn người ghi, và người ghi sẽ chặn người đọc.*

Giải pháp của cơ sở dữ liệu hiện đại là **MVCC (Multi-Version Concurrency Control)**.
- **Nguyên lý:** Khi Update một dòng dữ liệu, DB không ghi đè lên dòng cũ, mà tạo ra một **phiên bản mới (Version)**.
- **Đọc:** Mỗi Transaction được cấp một Snapshot ID. Nó chỉ được phép nhìn thấy những phiên bản đã commit trước thời điểm nó bắt đầu.
- **Kết quả:** Người đọc không bao giờ chặn người ghi, vì người đọc cứ việc đọc phiên bản cũ, còn người ghi cứ việc tạo phiên bản mới.

---

## 3. Trận Chiến Kiến Trúc: PostgreSQL vs MySQL (Uber Migration)

Cả PostgreSQL và MySQL đều dùng MVCC, nhưng cách cài đặt vật lý hoàn toàn khác biệt. Quyết định này đã dẫn đến sự kiện kỹ thuật nổi tiếng: **Uber phải chuyển đổi (Migrate) từ PostgreSQL sang MySQL**. Tại sao?

### 3.1. PostgreSQL: Heap-based & Vấn đề Write Amplification
- **Kiến trúc:** PostgreSQL lưu dữ liệu ở vùng **Heap**. Tất cả Index (kể cả Primary Key) đều là Secondary Index, lưu con trỏ (TID - Tuple ID) trỏ trực tiếp đến vị trí vật lý của dòng dữ liệu trong Heap.
- **MVCC:** Khi Update, Postgres giữ nguyên phiên bản cũ, và tạo một row phiên bản mới ngay trong Heap. Vì row mới nằm ở vị trí vật lý mới (TID mới), **toàn bộ Index của bảng đó đều phải được cập nhật lại** để trỏ tới TID mới, dù bạn chỉ update một cột không liên quan đến index.
- **Hậu quả (Write Amplification):** Một Update nhỏ xíu có thể phình to thành hàng chục thao tác I/O. Hơn nữa, Postgres phải chạy một tiến trình ngầm gọi là **VACUUM** để dọn dẹp các phiên bản cũ (Dead tuples). Ở quy mô của Uber, VACUUM bị nghẽn (Lock bloat) khiến ổ cứng bị bào mòn và hiệu năng giảm thê thảm. *(Lưu ý: Tính năng HOT - Heap Only Tuples của Postgres giúp giảm thiểu vấn đề này, nhưng chỉ khi row mới vẫn nằm vừa vặn trong cùng một Data Page).*

### 3.2. MySQL InnoDB: Clustered Index & Undo Logs
- **Kiến trúc:** InnoDB dùng **Clustered Index**. Dữ liệu vật lý được lưu trữ ngay bên trong các nốt lá (Leaf nodes) của cây Primary Key. Secondary Index không trỏ tới vị trí vật lý, mà trỏ tới Primary Key.
- **MVCC:** Khi Update, InnoDB ghi đè (In-place update) dòng dữ liệu mới nhất vào Clustered Index, và đẩy dòng dữ liệu cũ vào một vùng riêng gọi là **Undo Logs**.
- **Kết quả:** Update rất nhanh. Secondary Index không cần phải cập nhật lại (vì Primary Key đâu có đổi). Giải quyết triệt để bài toán Write Amplification của Postgres. Tuy nhiên, nếu có một Long-running Query kéo dài nhiều tiếng đồng hồ, hệ thống không dám xóa Undo Logs, dẫn tới tràn đĩa cứng.

---

## 4. Kiến Trúc Nhân Bản & Rủi Ro Vận Hành (Replication)

RDBMS sử dụng **Replication** để chia sẻ tải đọc. 

### 4.1. Sự Cố Read-After-Write (Replication Lag)
Mô hình Leader-Follower hay gặp lỗi kinh điển: User vừa cập nhật ảnh đại diện, trang web tải lại và hiển thị ảnh cũ. Tại sao? Vì web đọc dữ liệu từ Replica (Follower) đang bị trễ 2 giây so với Leader (Replication Lag).

**Giải pháp System Design:**
Sử dụng **Client Pinning** hoặc đối chiếu **LSN (Log Sequence Number)**. API sẽ ghi LSN của lần Update vào Cache/Cookie. Khi User load lại trang, API kiểm tra xem Follower đã đồng bộ đến mức LSN đó chưa. Nếu chưa, API bắt buộc phải điều hướng (Route) câu lệnh SELECT thẳng vào Leader để đảm bảo Consistency.

### 4.2. Cạn Kiệt Kết Nối (Connection Starvation)
Mỗi connection vào PostgreSQL/MySQL không chỉ là một socket TCP, nó khởi tạo một Process/Thread riêng biệt, ngốn 10MB RAM. Nếu bạn có 200 microservices pods, mỗi pod mở pool 50 connections, DB sẽ phải gánh 10,000 connections. Hệ thống sẽ chết vì **OOM (Out of Memory)**.
*   **Giải pháp:** Phải đặt một **Connection Pooler** trung gian (như `PgBouncer` hoặc `ProxySQL`). 10,000 Apps sẽ trỏ tới PgBouncer. PgBouncer chỉ duy trì 200 connection vật lý tới Database và liên tục "nhồi" [multiplexing] các câu lệnh SQL qua 200 đường ống này.

### 4.3. Split-Brain: Cơn Ác Mộng Của GitHub (2018 Outage)
Tháng 10/2018, GitHub sập toàn bộ dịch vụ suốt 24 giờ. Nguyên nhân?
- Cáp mạng nối giữa hai Data Center (DC1 và DC2) bị chập chờn dưới 1 phút.
- Hệ thống Orchestrator lầm tưởng Leader ở DC1 đã chết, liền kích hoạt Auto-Failover, promote Follower ở DC2 lên làm Leader mới. Thực tế, Leader DC1 vẫn sống khỏe mạnh.
- **Hệ quả (Split-Brain):** Có 2 Leader cùng lúc nhận thao tác Ghi (Write) từ người dùng. Dữ liệu rẽ thành 2 nhánh mâu thuẫn (giống hệt Git Merge Conflict nhưng ở cấp độ cơ sở dữ liệu).
- **Khắc phục:** Các kỹ sư GitHub phải dừng toàn bộ hệ thống để merge dữ liệu bằng tay. *Bài học:* Mọi hệ thống Auto-Failover đều phải có cơ chế **Fencing / STONITH (Shoot The Other Node In The Head)**: Chủ động ra lệnh cắt nguồn điện hoặc tắt card mạng của Leader cũ trước khi dâng ngôi cho Leader mới.

---

## Nguồn Tham Khảo (References)
* [Designing Data-Intensive Applications (Martin Kleppmann]](https://dataintensive.net/) - Cuốn "Kinh thánh" cho System Design.
* [Uber's move from PostgreSQL to MySQL][https://www.uber.com/en-VN/blog/postgres-to-mysql-migration/] - Lý giải chi tiết MVCC và Write Amplification.
* [GitHub's 24-hour Outage Post-Mortem][https://github.blog/2018-10-30-oct21-post-incident-analysis/] - Bài học xương máu về Split-brain.
* [PostgreSQL Documentation: MVCC & VACUUM internals](https://www.postgresql.org/docs/current/routine-vacuuming.html]
