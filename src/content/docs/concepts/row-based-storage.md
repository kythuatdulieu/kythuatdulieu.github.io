---
title: "Lưu trữ dạng Dòng - Row-based Storage"
category: "Database & Storage"
difficulty: "Beginner"
tags: ["storage", "row-based", "oltp", "database"]
readingTime: "7 mins"
lastUpdated: 2026-06-07
seoTitle: "Lưu trữ dạng Dòng (Row-based Storage) - Cơ sở cho Hệ thống OLTP"
metaDescription: "Tìm hiểu kiến trúc lưu trữ dạng dòng (Row-oriented storage) truyền thống, lý do nó thống trị hệ thống OLTP và sự đối lập với lưu trữ dạng cột."
---

# Lưu trữ dạng Dòng - Row-based Storage

## Summary

Lưu trữ dạng dòng (Row-oriented storage / Row-based storage) là mô hình tổ chức dữ liệu vật lý truyền thống nhất, nơi toàn bộ thông tin của một bản ghi (row) được lưu trữ sát cạnh nhau trên ổ đĩa cứng. Mô hình này được sử dụng rộng rãi bởi các hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) kinh điển như MySQL, PostgreSQL hay Oracle, và được tối ưu hóa đặc biệt cho các hệ thống xử lý giao dịch trực tuyến (OLTP).

---

## Definition

Trong kiến trúc **Row-based Storage**, dữ liệu được sắp xếp tuần tự theo từng dòng. Khi một bảng dữ liệu được tạo ra, cấu trúc của nó sẽ bao gồm nhiều hàng, mỗi hàng chứa dữ liệu của tất cả các cột thuộc về thực thể đó.

Trên ổ đĩa (hoặc trong các khối bộ nhớ của Database - thường gọi là Data Pages / Blocks), giá trị của cột 1, cột 2, cột 3... của hàng đầu tiên sẽ được ghi liên tiếp. Sau khi kết thúc hàng 1, hệ thống mới ghi tiếp hàng thứ 2.

---

## Why it exists

Máy tính cơ bản đọc và ghi dữ liệu vào ổ đĩa theo khối (blocks/pages). Đối với các ứng dụng phần mềm hướng người dùng (ví dụ: một trang web bán hàng), thao tác phổ biến nhất là:
* **Thêm mới một thực thể hoàn chỉnh**: Thêm 1 User mới với đầy đủ Name, Email, Password, Address.
* **Lấy chi tiết một thực thể hoàn chỉnh**: Đọc ra tất cả thông tin của `user_id = 123` để hiển thị trang Profile.

Lưu trữ dạng dòng cho phép thao tác "đọc/ghi nguyên một thực thể" diễn ra trong một (hoặc rất ít) lần tìm kiếm trên đĩa (Disk seek). Nếu dữ liệu của User này bị xé lẻ ra 10 nơi khác nhau, ổ cứng sẽ phải "quay" (với HDD) hoặc nhảy địa chỉ (với SSD) 10 lần, làm giảm hiệu suất nghiêm trọng.

---

## Core idea

* **Ghi rất nhanh (Fast Writes)**: Để chèn một dòng dữ liệu mới, hệ thống chỉ cần tìm đến cuối file (append) và ghi liền một mạch toàn bộ thuộc tính của dòng đó.
* **Toàn vẹn thực thể (Entity Locality)**: Mọi thứ liên quan đến một bản ghi nằm cạnh nhau, thân thiện với bộ nhớ cache của hệ điều hành. Khi một dòng được kéo từ đĩa vào RAM, toàn bộ các cột của dòng đó đều sẵn sàng để sử dụng (cực kỳ hợp với câu lệnh `SELECT *`).
* **Hỗ trợ Index mạnh mẽ**: Việc sử dụng cây B-Tree Index để trỏ tới địa chỉ vật lý của nguyên một dòng dữ liệu trên đĩa là cách tiếp cận hoàn hảo nhất mà các RDBMS đã phát triển trong suốt 40 năm qua.

---

## How it works

Hãy hình dung dữ liệu trong bộ nhớ vật lý.

**Bảng dữ liệu logic:**
| ID | Name  | Age | City  |
|----|-------|-----|-------|
| 1  | Alice | 25  | Hanoi |
| 2  | Bob   | 25  | HCM   |

**Dữ liệu vật lý ghi trên đĩa (Row-based):**
Dữ liệu được tổ chức thành các block. Giả sử 1 block chứa được 1 dòng:
* Block 1: `[1, "Alice", 25, "Hanoi"]`
* Block 2: `[2, "Bob", 25, "HCM"]`

Khi câu lệnh `SELECT * FROM users WHERE ID = 1` được gọi, thông qua Index, Database biết bản ghi này nằm ở Block 1. Nó kéo toàn bộ Block 1 lên RAM trong 1 nhịp I/O duy nhất và trả kết quả cho người dùng.

---

## Architecture / Flow

```mermaid
graph LR
    subgraph Client Application
        App(Web App: Insert/Select 1 User)
    end

    subgraph Row-Oriented Database
        Index(B-Tree Index)
        subgraph Disk Blocks
            B1[1 | Alice | 25 | Hanoi]
            B2[2 | Bob | 25 | HCM]
        end
    end

    App -->|SELECT WHERE ID=2| Index
    Index -->|Pointer| B2
    B2 -->|Return complete row| App
```

---

## Practical example

Xét thao tác mua hàng trên E-commerce. Bạn tạo một đơn hàng mới.
Câu lệnh SQL:
```sql
INSERT INTO orders (id, user_id, total, status, created_at, shipping_addr)
VALUES (1001, 5, 250.00, 'PENDING', '2026-06-07 10:00:00', '123 P. Hue');
```
Với MySQL (Row-based InnoDB), toàn bộ mảng dữ liệu `(1001, 5, 250.00, 'PENDING', ...)` được đóng gói thành một byte array và ghi tuần tự vào cuối file nhật ký (WAL) và sau đó đẩy vào data page trên đĩa. Nó tốn chính xác 1 thao tác ghi đĩa (Sequential Write).

(Nếu hệ thống dùng Columnar, nó sẽ phải xé lẻ 6 giá trị này ra và ghi vào 6 file khác nhau, chậm hơn rất nhiều).

---

## Best practices

* **Đánh chỉ mục đúng cách**: Vì Row-based có nhược điểm chí mạng là Full Table Scan (nếu không có index, nó sẽ đọc toàn bộ dữ liệu cả bảng), bạn luôn phải tạo Index trên các trường dùng để tìm kiếm (`WHERE`).
* **Tránh bảng quá rộng (Quá nhiều cột)**: Nếu một bảng Row-based có 200 cột, mỗi lần đọc 1 dòng hệ thống sẽ phải kéo một khối dữ liệu khổng lồ vào RAM, gây lãng phí bộ nhớ (Buffer pool pollution) nếu ứng dụng chỉ thực sự dùng 3-4 cột. Hãy tách bảng bằng cách chuẩn hóa (Normalization).

---

## Common mistakes

* **Sử dụng CSDL Row-based cho Data Warehouse**: Data Analyst viết lệnh `SELECT sum(total) FROM orders`. Để tính tổng 1 cột, ổ đĩa vẫn phải đọc (scan) toàn bộ các cột còn lại (id, user_id, status, địa chỉ...) làm cho hệ thống cạn kiệt tài nguyên I/O đĩa.
* **Dùng `SELECT *` một cách bừa bãi**: Kéo hết 50 cột của một dòng từ CSDL lên RAM của server ứng dụng chỉ để hiển thị 2 cột tên và tuổi.

---

## Trade-offs

### Ưu điểm
* Hiệu năng vô song cho việc Thêm/Sửa/Xóa (INSERT, UPDATE, DELETE) từng bản ghi lẻ tẻ (Giao dịch OLTP).
* Tối ưu I/O tuyệt đối khi cần lấy toàn bộ thông tin của một đối tượng cụ thể (ví dụ dựa trên Khóa chính).

### Nhược điểm
* Hiệu suất cực kỳ tồi tệ đối với các truy vấn tổng hợp phân tích (Aggregation).
* Khả năng nén dữ liệu kém do các kiểu dữ liệu khác nhau (int, varchar, date) nằm đan xen nhau trên cùng một dòng vật lý, không thể áp dụng các thuật toán nén tối ưu.

---

## When to use

* Là lựa chọn tiêu chuẩn, mặc định cho phần Backend của hầu hết mọi ứng dụng phần mềm: Web apps, Mobile Apps, CRM, ERP, Hệ thống ngân hàng.

## When not to use

* Hệ thống chỉ phục vụ phân tích dữ liệu, báo cáo BI, Data Warehouse (Nơi OLAP và Columnar thống trị).

---

## Related concepts

* [Columnar Storage](/concepts/columnar-storage)
* [OLTP](/concepts/oltp)
* [Relational Database](/concepts/relational-database)

---

## Interview questions

### 1. Khi nào thì nên dùng Row-based và khi nào dùng Column-based storage?
* **Gợi ý trả lời**: Dùng Row-based cho hệ thống OLTP (Online Transaction Processing) nơi tần suất Ghi/Cập nhật từng dòng đơn lẻ cao và các câu lệnh truy vấn thường lấy toàn bộ hoặc phần lớn các cột của một bản ghi (Ví dụ: `SELECT * FROM user WHERE id=1`). Dùng Column-based cho hệ thống OLAP (Online Analytical Processing) / Data Warehouse nơi tần suất đọc lớn, truy vấn thường quét qua hàng triệu dòng nhưng chỉ tính toán (SUM, AVG) trên một vài cột cụ thể.

### 2. Nếu bảng Row-based không có Index, chuyện gì sẽ xảy ra khi ta chạy câu lệnh `SELECT name FROM users WHERE email='a@a.com'`?
* **Gợi ý trả lời**: Hệ thống sẽ phải quét toàn bộ bảng (Full Table Scan). Mặc dù chúng ta chỉ cần cột `name`, ổ cứng vẫn phải đọc tất cả các dòng dữ liệu, bao gồm toàn bộ các cột không liên quan nằm chung trên dòng đó (Age, Address, Bio...) đẩy lên RAM để lọc ra dòng có email tương ứng. Việc này làm cạn kiệt băng thông I/O của đĩa và tốn rất nhiều thời gian nếu bảng có hàng triệu dòng.

---

## References

1. **Designing Data-Intensive Applications** - Martin Kleppmann.
2. **PostgreSQL Documentation** (Storage Engine Overview).

---

## English summary

Row-based Storage organizes data physically on disk row by row, keeping all attributes (columns) of a single record adjacent to one another. This design is highly optimized for Online Transaction Processing (OLTP) systems, where typical operations involve inserting, updating, or fetching a complete entity (like a user profile) in a single disk I/O operation. While it provides excellent performance for transactions, it is inefficient for analytical queries (OLAP) because computing an aggregate over a single column requires the disk to read the entire row, causing massive I/O waste compared to columnar storage.
