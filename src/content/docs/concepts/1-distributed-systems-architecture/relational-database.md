---
title: "Cơ sở Dữ liệu Quan hệ - Relational Database"
difficulty: "Beginner"
tags: ["rdbms", "sql", "acid", "database"]
readingTime: "8 mins"
lastUpdated: 2026-06-16
seoTitle: "Cơ sở Dữ liệu Quan hệ (RDBMS) - Nguyên lý và Ứng dụng"
metaDescription: "Tìm hiểu Cơ sở Dữ liệu Quan hệ (RDBMS) là gì, tính chất ACID, khóa chính, khóa ngoại và sự phổ biến của SQL trong quản trị dữ liệu."
description: "Trong thế giới lưu trữ dữ liệu, dù có bao nhiêu công nghệ mới ra đời thì **Cơ sở dữ liệu quan hệ (Relational Database - RDBMS)** vẫn luôn đứng vững nh..."
---



Relational Database (Cơ sở dữ liệu quan hệ) như MySQL, PostgreSQL, hay Oracle Database lưu trữ dữ liệu dưới dạng các bảng có cấu trúc nghiêm ngặt (hàng và cột), tuân thủ nguyên lý ACID. Nó được thiết kế bằng cấu trúc B-Tree để tối ưu hóa cho các giao dịch kinh doanh (OLTP) tốc độ cao, nhưng lại gặp thách thức trước các truy vấn phân tích quy mô cực lớn hoặc dữ liệu phi cấu trúc.

## 1. Mô hình Quan hệ (Relational Model) là gì?



Được giới thiệu bởi Edgar F. Codd vào năm 1970, mô hình quan hệ tổ chức dữ liệu thành các **quan hệ** (relations) hoặc bảng (tables).
Mỗi bảng bao gồm các **hàng** (rows hoặc records/tuples) và **cột** (columns hoặc attributes). Cấu trúc của các bảng này, cùng với các kiểu dữ liệu của chúng, được định nghĩa trước bởi một **Schema** (lược đồ).

### Các Khái niệm Cốt lõi:
* **Khóa chính (Primary Key - PK):** Định danh duy nhất cho một bản ghi trong bảng. Ví dụ: `user_id` trong bảng `Users`.
* **Khóa ngoại (Foreign Key - FK):** Một cột (hoặc nhiều cột) dùng để liên kết dữ liệu giữa hai bảng, giúp duy trì tính toàn vẹn tham chiếu (referential integrity).
* **Chuẩn hóa (Normalization):** Quá trình thiết kế cơ sở dữ liệu nhằm giảm thiểu sự trùng lặp dữ liệu (data redundancy) và tránh các bất thường khi cập nhật, thêm mới hay xóa dữ liệu. Các dạng chuẩn phổ biến gồm 1NF, 2NF, 3NF và BCNF.

## 2. Các Đặc tính ACID

Một trong những lý do chính khiến RDBMS là nền tảng cho hệ thống tài chính và ngân hàng là khả năng đảm bảo tính toàn vẹn của các giao dịch thông qua các tính chất **ACID**:

* **Atomicity (Tính Nguyên tử):** Mọi giao dịch (transaction) được xem là một đơn vị công việc duy nhất không thể chia nhỏ. Hoặc tất cả các thao tác thành công, hoặc không có thao tác nào được áp dụng (rollback).
* **Consistency (Tính Nhất quán):** Giao dịch đưa cơ sở dữ liệu từ một trạng thái hợp lệ này sang một trạng thái hợp lệ khác. Mọi ràng buộc, triggers và rules đã định nghĩa đều phải được tuân thủ.
* **Isolation (Tính Độc lập):** Các giao dịch thực hiện đồng thời không được can thiệp vào kết quả của nhau. Có nhiều mức độ cô lập (Isolation levels) khác nhau: *Read Uncommitted, Read Committed, Repeatable Read, Serializable*, thường đi kèm với các hiện tượng xử lý đồng thời như *Dirty Read, Non-repeatable Read, Phantom Read*.
* **Durability (Tính Bền vững):** Khi một giao dịch đã được commit, dữ liệu của nó sẽ tồn tại vĩnh viễn dù cho hệ thống có bị crash ngay sau đó.

## 3. Storage Engine và Indexing

Cơ sở dữ liệu quan hệ tổ chức dữ liệu trên đĩa từ thế nào để đảm bảo tốc độ truy xuất tối ưu?

### Cấu trúc B-Tree / B+Tree Index
Hầu hết các RDBMS hiện nay sử dụng cấu trúc **B+Tree** làm cơ chế Index mặc định.
* **Ưu điểm:** Cho phép tìm kiếm một bản ghi (Point query) cực nhanh và hỗ trợ tốt cho truy vấn trong một khoảng (Range query).
* **Nhược điểm:** Phải liên tục tái cân bằng cây khi có thao tác Write/Update/Delete, gây ra overhead đáng kể nếu số lượng Index quá nhiều trên một bảng.

### Write-Ahead Logging (WAL)
WAL là cơ chế mà trong đó mọi thay đổi đối với dữ liệu phải được ghi vào log (nhật ký) trên ổ đĩa cứng *trước khi* sự thay đổi đó được thực sự áp dụng vào vùng nhớ dữ liệu. Nhờ WAL, RDBMS cung cấp tính toàn vẹn và độ tin cậy (Durability), có khả năng khôi phục hệ thống (recovery) khi có sự cố tắt đột ngột, và hỗ trợ quá trình Replication dễ dàng.

## 4. Ngôn ngữ Truy vấn Có cấu trúc (SQL)

**SQL (Structured Query Language)** là ngôn ngữ tiêu chuẩn để tương tác với RDBMS, được chia thành các nhóm lệnh chính:
* **DDL (Data Definition Language):** `CREATE`, `ALTER`, `DROP` - Định nghĩa và thay đổi cấu trúc của cơ sở dữ liệu.
* **DML (Data Manipulation Language):** `SELECT`, `INSERT`, `UPDATE`, `DELETE` - Truy vấn và thao tác với dữ liệu bên trong các bảng.
* **DCL (Data Control Language):** `GRANT`, `REVOKE` - Quản lý quyền và bảo mật truy cập.
* **TCL (Transaction Control Language):** `COMMIT`, `ROLLBACK`, `SAVEPOINT` - Quản lý các giao dịch (Transactions).

## 5. Mở rộng hệ thống RDBMS (Scaling)

Mở rộng RDBMS để đáp ứng tải cao thường gặp nhiều giới hạn và thách thức hơn so với NoSQL:
* **Vertical Scaling (Scale-up):** Nâng cấp phần cứng (thêm CPU, RAM, ổ SSD) cho một máy chủ duy nhất. Đây là cách truyền thống và đơn giản nhất nhưng có điểm tới hạn về mặt vật lý (giới hạn của một server).
* **Replication (Master-Slave / Leader-Follower):** Scale để tăng tốc độ Read. Các thao tác Write ghi vào Master, sau đó dữ liệu được sao chép sang các Slaves. Hệ thống có thể gặp phải vấn đề độ trễ sao chép (Replication lag).
* **Horizontal Scaling / Sharding (Scale-out):** Phân mảnh dữ liệu thành các phần nhỏ (shards) và phân tán lên các nodes khác nhau. Quá trình này phức tạp trong RDBMS do phá vỡ khả năng thực thi các lệnh `JOIN` dễ dàng và khó duy trì ACID xuyên suốt nhiều node (Distributed Transactions).

## 6. Khi nào nên và không nên dùng RDBMS?

### Nên dùng:
* Khi dữ liệu có cấu trúc rõ ràng và schema ít thay đổi theo thời gian.
* Các hệ thống yêu cầu tính toàn vẹn dữ liệu và giao dịch ACID khắt khe (VD: Ngân hàng, E-commerce Checkout, Hệ thống Quản trị Kế toán - ERP).
* Khi cần các truy vấn phân tích phức tạp kết hợp nhiều bảng khác nhau (JOIN).

### Không nên dùng (Hoặc nên cân nhắc NoSQL / OLAP):
* Khi dữ liệu hoàn toàn phi cấu trúc, hoặc cấu trúc thay đổi rất liên tục.
* Khi hệ thống cần xử lý lượng thao tác Write siêu lớn (High write throughput) và cần mở rộng theo chiều ngang một cách liên tục.
* Hệ thống cần lưu trữ biểu đồ, quan hệ đồ thị sâu phức tạp (Graph Database như Neo4j sẽ phù hợp hơn).
* Truy vấn phân tích tổng hợp trên hàng tỷ bản ghi nhằm lấy report báo cáo (nên dùng Data Warehouse kiểu OLAP hoặc Columnar Database như ClickHouse, Amazon Redshift).

## Tài Liệu Tham Khảo
* [Designing Data-Intensive Applications - Martin Kleppmann (Part 2: Distributed Data)](https://dataintensive.net/)
* [Database System Concepts - Abraham Silberschatz, Henry F. Korth, S. Sudarshan](https://db-book.com/)
* [Use The Index, Luke - A Guide to Database Performance for Developers](https://use-the-index-luke.com/)
* [CAP Theorem and PACELC - Daniel Abadi](http://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html)
* [Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)
