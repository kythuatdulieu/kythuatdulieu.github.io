---
title: "Lưu trữ dạng Dòng - Row-based Storage"
difficulty: "Beginner"
tags: ["storage", "row-based", "oltp", "database"]
readingTime: "7 mins"
lastUpdated: 2026-06-07
seoTitle: "Lưu trữ dạng Dòng (Row-based Storage) - Cơ sở cho Hệ thống OLTP"
metaDescription: "Tìm hiểu kiến trúc lưu trữ dạng dòng (Row-oriented storage) truyền thống, lý do nó thống trị hệ thống OLTP và sự đối lập với lưu trữ dạng cột."
description: "Khi bắt đầu tìm hiểu về cách cơ sở dữ liệu lưu trữ thông tin vật lý trên đĩa cứng, chúng ta sẽ bắt gặp hai trường phái thiết kế kinh điển: Lưu trữ dạng dòng (Row-based) và Lưu trữ dạng cột (Column-based)."
---



**Row-based Storage** (hay Row-oriented Storage) là mô hình lưu trữ dữ liệu truyền thống, trong đó toàn bộ dữ liệu của một hàng (row/record) được lưu trữ kề sát nhau trên các block (khối) của ổ đĩa cứng. Đây là cách tiếp cận phổ biến nhất trong các Hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) từ những ngày đầu và đóng vai trò xương sống cho các hệ thống **OLTP** (Online Transaction Processing - Xử lý giao dịch trực tuyến).

## 1. Cơ chế hoạt động trên ổ đĩa

Để hiểu tại sao mô hình này lại chiếm ưu thế trong các ứng dụng truyền thống, hãy xem xét cách nó lưu trữ dữ liệu vật lý. Giả sử bạn có một bảng dữ liệu người dùng (`Users`) với 4 cột như sau:

| ID | Name | Age | Email |
|---|---|---|---|
| 1 | Alice | 30 | alice@email.com |
| 2 | Bob | 25 | bob@email.com |
| 3 | Charlie | 35 | charlie@email.com |

Trong kiến trúc Row-based, thay vì phân tách từng cột ra các khu vực khác nhau, dữ liệu này sẽ được lưu trữ trên ổ cứng dưới dạng một chuỗi các bản ghi liên tiếp:

```text
[1, Alice, 30, alice@email.com] | [2, Bob, 25, bob@email.com] | [3, Charlie, 35, charlie@email.com]
```

Khi Hệ quản trị cơ sở dữ liệu (DBMS) ghi dữ liệu của "Alice", toàn bộ thông tin từ `ID` cho đến `Email` sẽ được ghi vào một khối nhớ (block/page) duy nhất. Nhờ vậy, khi đĩa cứng (HDD) quay đầu từ hoặc khi ổ cứng thể rắn (SSD) truy cập block bộ nhớ, toàn bộ chi tiết về "Alice" có thể được nạp vào bộ nhớ RAM thông qua **một thao tác I/O duy nhất** (I/O operation).

## 2. Ưu điểm nổi bật

Thiết kế lưu trữ từng dòng cạnh nhau mang lại những lợi ích tối quan trọng cho các ứng dụng tương tác trực tiếp với người dùng:

- **Ghi dữ liệu (Insert) cực kỳ nhanh chóng:** Khi có một bản ghi mới (Ví dụ: một khách hàng mới đăng ký tài khoản), toàn bộ dữ liệu của khách hàng đó đơn giản chỉ cần được "đính kèm" (append) vào cuối tập tin dữ liệu hoặc được đặt vào một block còn trống. Đây là thao tác tuần tự nên rất tiết kiệm tài nguyên I/O đĩa.
- **Cập nhật (Update) & Xóa (Delete) tối ưu:** Để thay đổi thông tin của một người (ví dụ đổi Email), hệ thống định vị được bản ghi đó và thực hiện sửa đổi "tại chỗ" (in-place update) trên một vài block liền kề mà không cần phải truy tìm ở nhiều file khác nhau.
- **Tối ưu cho việc đọc từng thực thể (Entity-level Reads):** Rất nhiều truy vấn trong ứng dụng backend thường có dạng: `SELECT * FROM Users WHERE ID = 1`. Row-based trả về ngay lập tức toàn bộ đối tượng vì chúng ở cạnh nhau trên đĩa.
- **Hỗ trợ tuyệt đối cho giao dịch ACID:** Row-based storage dễ dàng kết hợp với các cơ chế khóa cấp độ hàng (row-level locking). Điều này đảm bảo tính toàn vẹn dữ liệu cho các ứng dụng có số lượng truy cập đồng thời khổng lồ (high concurrency), chẳng hạn như thanh toán ngân hàng hoặc giỏ hàng thương mại điện tử.

## 3. Nhược điểm và Giới hạn

Tuy xuất sắc ở việc xử lý từng tác vụ độc lập, Row-based storage bộc lộ nhược điểm chí mạng khi đối mặt với dữ liệu phân tích (Analytics):

- **Chậm chạp với các truy vấn phân tích tổng hợp (Slow Analytical Queries):** Giả sử bạn muốn tính tuổi trung bình của tập khách hàng: `SELECT AVG(Age) FROM Users`. Dù bạn chỉ cần đúng một cột `Age`, cơ sở dữ liệu vẫn phải đọc **toàn bộ dữ liệu** của từng hàng (bao gồm cả `Name`, `Email`, v.v.) từ ổ cứng lên RAM, sau đó mới vứt bỏ các cột không cần thiết để tính toán. Hiện tượng này gây ra nghẽn cổ chai đĩa (I/O bottleneck) nghiêm trọng và lãng phí bộ nhớ RAM khi chạy phân tích trên bảng chứa hàng trăm triệu dòng và hàng chục cột.
- **Tỉ lệ nén dữ liệu thấp (Poor Compression):** Các thuật toán nén hoạt động tốt nhất khi gặp các dữ liệu có tính lặp lại hoặc đồng nhất. Với Row-based, trong cùng một khối dữ liệu có chứa lẫn lộn các kiểu int (ID), varchar (Name, Email), datetime,... khiến việc nén rất kém hiệu quả.

## 4. Các trường hợp sử dụng lý tưởng (Use Cases)

Mô hình này sinh ra để phục vụ cho các **Hệ thống OLTP (Online Transaction Processing)**. Bạn sẽ sử dụng Row-based storage khi:

- Ứng dụng phải xử lý lượng lớn các tác vụ đọc/ghi diễn ra với tốc độ rất nhanh (tính bằng mili-giây).
- Ứng dụng Web/Mobile Backend, Hệ thống quản trị nội dung (CMS), Phần mềm bán lẻ (POS).
- Lưu trữ lịch sử giao dịch thanh toán, giỏ hàng trực tuyến, tài khoản người dùng.
- Ứng dụng mà hầu hết các truy vấn `SELECT` sẽ cần trả về gần như toàn bộ các cột của một vài dòng cụ thể.

## 5. So sánh nhanh với Lưu trữ dạng Cột (Column-based Storage)

Để nhìn nhận rõ ràng hơn, hãy so sánh nó với người anh em đối lập - kiến trúc được sử dụng trong các hệ thống OLAP (Data Warehouse):

| Tiêu chí | Row-based Storage (Dạng Dòng) | Column-based Storage (Dạng Cột) |
| :--- | :--- | :--- |
| **Mục đích chính** | OLTP (Hệ thống giao dịch trực tuyến) | OLAP (Hệ thống phân tích, Data Warehouse) |
| **Tác vụ Ghi (Insert)** | Nhanh - Ghi theo một khối liền mạch. | Chậm hơn - Phải tách nhỏ dữ liệu ra và ghi vào các vùng lưu trữ khác nhau cho từng cột. |
| **Đọc toàn bộ thực thể** | Cực nhanh - Thường chỉ mất 1 đến vài I/O operation. | Chậm - Phải gom nhặt, lắp ráp (reconstruct) dữ liệu từ nhiều file của nhiều cột khác nhau. |
| **Truy vấn tổng hợp (Aggregation)**| Chậm - Đọc thừa vô số dữ liệu dù chỉ cần 1 cột. | Cực nhanh - Đọc chính xác những cột cần thiết cho việc tính toán. |
| **Khả năng nén dữ liệu** | Kém hiệu quả. | Rất hiệu quả (Vì dữ liệu cùng loại, cùng cột được đặt cạnh nhau). |

## 6. Các Hệ quản trị cơ sở dữ liệu (DBMS) tiêu biểu

Vì là kiến trúc nền tảng của mô hình quan hệ từ những năm 1970, hầu như tất cả các RDBMS phổ biến nhất hiện nay đều mặc định sử dụng cơ chế Row-based (hoặc sử dụng nó làm core engine chính):

- **Hệ sinh thái mã nguồn mở:** MySQL, MariaDB, PostgreSQL.
- **Cơ sở dữ liệu thương mại Enterprise:** Microsoft SQL Server, Oracle Database, IBM Db2.
- **Cơ sở dữ liệu nhúng (Embedded):** SQLite.

> **Lưu ý trong kỷ nguyên hiện đại:** Ranh giới đang dần mờ đi. Ví dụ, PostgreSQL mặc định là Row-based nhưng đã bắt đầu hỗ trợ các phần mở rộng lưu trữ dạng cột (như Citus), trong khi đó Microsoft SQL Server đã tích hợp thêm công nghệ *Columnstore Indexes* để phục vụ cả việc tính toán phân tích (mô hình HTAP - Hybrid Transactional/Analytical Processing).

## 7. Kết luận

Mặc dù các kho dữ liệu hiện đại khổng lồ trong Data Engineering (như Snowflake, BigQuery, Redshift) đều sử dụng hoàn toàn Column-based Storage, mô hình **Row-based Storage** vẫn sẽ là cấu trúc lưu trữ cơ sở dữ liệu không thể thay thế trong phát triển phần mềm và xây dựng các hệ thống hướng người dùng cuối. Việc hiểu rõ bản chất vật lý của nó giúp Data Engineer thiết kế các pipeline trích xuất dữ liệu (ELT/ETL) từ các cơ sở dữ liệu nguồn (Source DB) một cách trơn tru mà không làm sập (crash) hệ thống do nghẽn I/O.

---

## Tài Liệu Tham Khảo
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [The Pragmatic Engineer - Gergely Orosz](https://blog.pragmaticengineer.com/)
* **Data Engineering at Scale: Netflix Tech Blog**
* **Building Data Infrastructure at Airbnb**
