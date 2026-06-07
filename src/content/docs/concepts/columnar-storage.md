---
title: "Lưu trữ dạng Cột - Columnar Storage"
category: "Database & Storage"
difficulty: "Intermediate"
tags: ["storage", "columnar", "olap", "big-data"]
readingTime: "9 mins"
lastUpdated: 2026-06-07
seoTitle: "Lưu trữ dạng Cột (Columnar Storage) - Cốt lõi của Data Warehouse"
metaDescription: "Tìm hiểu chi tiết về Lưu trữ dạng cột (Column-oriented storage), cách thức nén dữ liệu, tối ưu hóa truy vấn phân tích (OLAP) và sự khác biệt với dạng dòng."
---

# Lưu trữ dạng Cột - Columnar Storage

## Summary

Lưu trữ dạng cột (Column-oriented storage / Columnar storage) là một phương pháp tổ chức dữ liệu vật lý trên ổ đĩa, trong đó tất cả các giá trị của một cột (column) được ghi liên tiếp nhau, thay vì ghi theo từng dòng (row). Cấu trúc này là "vũ khí bí mật" đứng sau tốc độ truy vấn đáng kinh ngạc của các kho dữ liệu phân tích (OLAP) như Google BigQuery, Amazon Redshift hay định dạng tệp Apache Parquet.

---

## Definition

Trong cơ sở dữ liệu truyền thống (Row-based), dữ liệu được lưu theo khối dựa trên các dòng. Nếu bảng có 100 cột, để lấy giá trị của cột số 5, hệ thống phải đọc từ đĩa cả 99 cột còn lại của hàng đó.

Ngược lại, **Columnar Storage** lưu trữ mỗi cột thành các khối dữ liệu (data blocks) độc lập trên đĩa. Do đó, nếu một câu truy vấn chỉ cần tính tổng của một cột `Doanh_thu`, ổ đĩa chỉ cần đọc chính xác file chứa cột `Doanh_thu` và bỏ qua hoàn toàn các file chứa `Ten_khach_hang` hay `Dia_chi`. 

---

## Why it exists

Thực tế trong phân tích dữ liệu (Analytics), các bảng dữ liệu (Fact tables) thường cực kỳ "rộng" (có thể lên tới hàng trăm cột). Tuy nhiên, một câu lệnh SQL báo cáo kinh doanh thông thường chỉ sử dụng khoảng 3 đến 5 cột (ví dụ: Ngày, Loại Sản phẩm, Doanh thu) để tính toán `SUM`, `AVG`, `COUNT`.

Nếu dùng lưu trữ dòng, hệ thống lãng phí đến 95% thời gian I/O (Input/Output) ổ đĩa để đọc những dữ liệu rác không tham gia vào truy vấn. Columnar Storage sinh ra để giải quyết triệt để sự lãng phí I/O ổ đĩa này.

---

## Core idea

Sức mạnh của Columnar Storage đến từ hai cơ chế chính:
1. **Chỉ lấy những gì cần thiết (Projection Pushdown)**: Truy vấn gọi tên cột nào, đĩa cứng chỉ đọc cột đó.
2. **Nén dữ liệu đỉnh cao (High Compression)**: Vì các dữ liệu trong cùng một cột có chung một kiểu dữ liệu (ví dụ: cột `Quoc_gia` toàn chứa chữ, cột `Doanh_thu` toàn chứa số), và thường có nhiều giá trị lặp lại (ví dụ cột `Gioi_tinh` chỉ có 'Nam', 'Nữ'), chúng có thể được nén cực kỳ hiệu quả bằng các thuật toán như *Run-Length Encoding (RLE)* hoặc *Dictionary Encoding*. Kích thước file trên đĩa thường nhỏ hơn 5 đến 10 lần so với lưu trữ dòng.

---

## How it works

Hãy xem cách dữ liệu được ghi vật lý trên ổ đĩa.

**Bảng dữ liệu logic:**
| ID | Name  | Age | City  |
|----|-------|-----|-------|
| 1  | Alice | 25  | Hanoi |
| 2  | Bob   | 25  | HCM   |
| 3  | Carol | 30  | Hanoi |

**Lưu trữ dạng Dòng (Row-based):**
Dữ liệu trên đĩa: `1,Alice,25,Hanoi; 2,Bob,25,HCM; 3,Carol,30,Hanoi;`

**Lưu trữ dạng Cột (Column-based):**
Dữ liệu trên đĩa (tách thành các file/khối riêng):
* Khối ID: `1,2,3`
* Khối Name: `Alice,Bob,Carol`
* Khối Age: `25,25,30` -> Có thể nén RLE thành `(25, 2), (30, 1)`
* Khối City: `Hanoi,HCM,Hanoi`

Khi chạy `SELECT SUM(Age) FROM table`, hệ thống chỉ chạm vào "Khối Age", đọc `25,25,30` và bỏ qua ID, Name, City.

---

## Architecture / Flow

```mermaid
graph TD
    subgraph Logical Table
        T[ID | Name | Age | City]
    end

    subgraph Columnar Files on Disk
        F1[(File: ID.col)]
        F2[(File: Name.col)]
        F3[(File: Age.col)]
        F4[(File: City.col)]
    end

    subgraph Query Execution
        Q(SELECT AVG(Age) FROM Table)
    end

    T -.-> F1
    T -.-> F2
    T -.-> F3
    T -.-> F4

    Q ==>|Only reads| F3
    Q -.->|Ignores| F1
    Q -.->|Ignores| F2
    Q -.->|Ignores| F4
```

---

## Practical example

Hiệu quả của Dictionary Encoding (Nén từ điển) trong Columnar Storage:

Cột `Thanh_pho` có 1 triệu dòng, nhưng chỉ xoay quanh 3 giá trị: "Hanoi", "Ho Chi Minh", "Da Nang".
Thay vì lưu chuỗi text dài lặp đi lặp lại hàng triệu lần (tốn rất nhiều dung lượng), Columnar engine tạo ra một "Từ điển":
* `0` = Hanoi
* `1` = Ho Chi Minh
* `2` = Da Nang

Và dữ liệu thực sự ghi trên đĩa chỉ là một mảng các bit nhỏ xíu: `0, 0, 1, 2, 0, 1, 1...`
Khi truy vấn tính toán, CPU có thể đếm các con số `0, 1, 2` cực nhanh trong RAM mà không cần phải giải mã text, giúp tăng tốc độ xử lý lên mức không tưởng.

---

## Best practices

* **Sắp xếp dữ liệu (Sorting / Clustering)**: Để tối đa hóa khả năng nén RLE, hãy sắp xếp bảng theo một cột có số lượng giá trị trùng lặp cao trước khi ghi xuống đĩa (ví dụ: `ORDER BY date, category`).
* **Sử dụng định dạng mở**: Khi làm việc với Data Lake, hãy lưu dữ liệu thô dưới định dạng **Apache Parquet** thay vì JSON hoặc CSV để tận dụng lợi ích của columnar storage.
* **Chỉ SELECT các cột cần thiết**: Mặc dù Parquet rất nhanh, nhưng nếu bạn viết `SELECT *`, hệ thống vẫn phải ghép tất cả các cột lại với nhau trong bộ nhớ (Row reconstruction), làm mất đi hoàn toàn ưu thế của thiết kế cột.

---

## Common mistakes

* **Cập nhật từng dòng (Row-level UPDATE)**: Columnar storage rất kém trong việc `UPDATE` một dòng đơn lẻ. Để đổi tên "Alice" thành "Alicia", hệ thống phải tìm file của cột Name, giải nén toàn bộ khối, thay đổi giá trị, và nén lại. Do đó, các Data Warehouse thường chỉ dùng lệnh `APPEND` (thêm mới lịch sử) thay vì `UPDATE`.
* **Dùng Columnar cho hệ thống OLTP**: Dùng Parquet hoặc BigQuery làm backend cho website e-commerce là thảm họa, vì mỗi lần insert 1 đơn hàng mới (1 dòng), hệ thống phải xẻ dòng đó ra thành hàng chục mảnh để nhét vào hàng chục file cột khác nhau, gây chậm trễ khủng khiếp.

---

## Trade-offs

### Ưu điểm
* Giảm đáng kể chi phí I/O ổ đĩa cho các câu truy vấn phân tích (chỉ đọc những cột cần thiết).
* Tỷ lệ nén dữ liệu cực kỳ cao (thường từ 3x đến 10x), tiết kiệm tiền lưu trữ Cloud.
* Tối ưu hóa mạnh mẽ cho bộ nhớ cache của CPU (CPU Vectorized Processing).

### Nhược điểm
* Rất chậm khi phải ghi dữ liệu mới theo từng dòng lẻ tẻ (phải gom thành batch lớn rồi mới ghi).
* Tốn chi phí CPU để gom (stitch) các cột lại thành một dòng hoàn chỉnh nếu người dùng `SELECT *`.

---

## When to use

* (Bắt buộc) Trong Data Warehouse, Data Lake, và mọi hệ thống phục vụ OLAP (truy vấn phân tích).
* Định dạng Parquet/ORC cho việc lưu trữ dữ liệu log và event dài hạn.

## When not to use

* Hệ thống giao dịch (OLTP) nơi các ứng dụng cần truy xuất hoặc cập nhật toàn bộ thuộc tính của một bản ghi (ví dụ: hiển thị trang Profile người dùng).

---

## Related concepts

* [Row-based Storage](/concepts/row-based-storage)
* [OLAP](/concepts/olap)
* [File Formats](/concepts/file-formats)

---

## Interview questions

### 1. Giải thích sự khác biệt cơ bản giữa Row-based và Columnar Storage về mặt I/O ổ đĩa?
* **Gợi ý trả lời**: Row-based lưu toàn bộ dữ liệu của 1 dòng sát cạnh nhau trên đĩa, rất tốt nếu ta cần đọc 1 bản ghi hoàn chỉnh (OLTP). Tuy nhiên nếu chỉ cần tính tổng 1 cột, ổ đĩa vẫn phải đọc toàn bộ dữ liệu của các cột khác, gây lãng phí băng thông I/O. Columnar tách mỗi cột ra lưu riêng. Nếu query chỉ gọi 2 cột trên tổng số 100 cột, I/O ổ đĩa chỉ phải đọc đúng 2 file tương ứng, giảm được 98% lượng dữ liệu phải đọc từ đĩa cứng.

### 2. Tại sao Columnar Storage lại có khả năng nén dữ liệu tốt hơn Row-based?
* **Gợi ý trả lời**: Vì Columnar nhóm các dữ liệu có *cùng kiểu* (data type) và *cùng ngữ nghĩa* lại với nhau (ví dụ: một cột chỉ chứa toàn chữ số, hoặc toàn tên quốc gia). Dữ liệu đồng nhất (Homogeneous) có nhiều giá trị lặp lại rất dễ để áp dụng các thuật toán nén như Run-Length Encoding (RLE) hoặc Dictionary Encoding. Trong khi đó, Row-based chứa dữ liệu hỗn hợp (chữ, số, ngày tháng đan xen trong 1 dòng) nên entropy cao, rất khó nén hiệu quả.

---

## References

1. **Designing Data-Intensive Applications** - Martin Kleppmann (Chương 3 - Column-oriented Storage).
2. **The Vertica Analytic Database: C-Store 7 Years Later** - Andrew Lamb et al.
3. **Apache Parquet Documentation**.

---

## English summary

Columnar Storage organizes data physically on disk by column rather than by row. This architecture is the cornerstone of modern OLAP systems and Data Warehouses (like BigQuery or Snowflake) and open file formats like Apache Parquet. By storing each column independently, analytical queries that only select a few columns avoid scanning the entire dataset (Projection Pushdown), massively reducing disk I/O. Furthermore, storing homogeneous data together enables extraordinary compression ratios (using techniques like Run-Length and Dictionary Encoding), though it makes row-level updates and inserts heavily inefficient.
