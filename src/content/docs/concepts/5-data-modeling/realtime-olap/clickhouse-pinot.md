---
title: "Concepts Deep-dive: Real-time OLAP với ClickHouse & Pinot"
description: "Mổ xẻ kiến trúc Real-time OLAP qua hai đại diện tiêu biểu là ClickHouse và Apache Pinot. Phân tích MergeTree Engine, Sparse Indexing và các case study thực tế từ Cloudflare, Uber."
lastUpdated: 2026-06-15
tags: ["data-modeling", "olap", "clickhouse", "pinot", "real-time", "data-engineering"]
---

Trong kỷ nguyên dữ liệu hiện tại, các Data Warehouse truyền thống (hay Cloud Data Warehouse như Redshift, BigQuery, Snowflake) rất xuất sắc cho các batch processing và internal BI dashboard. Tuy nhiên, khi đối mặt với **Real-time User-Facing Analytics** — nơi hàng nghìn người dùng đồng thời truy vấn dữ liệu vừa mới sinh ra vài giây trước với yêu cầu độ trễ dưới 1 giây (sub-second latency) — các hệ thống truyền thống bắt đầu bộc lộ hạn chế. 

Đó là lúc **Real-time OLAP** (Online Analytical Processing) lên ngôi. Bài viết này sẽ mổ xẻ hai "gã khổng lồ" trong mảng này: **ClickHouse** và **Apache Pinot**, thông qua kiến trúc cốt lõi và các bài toán thực tế (case studies) từ Cloudflare và Uber.

---

## 1. ClickHouse và "vũ khí tối thượng" MergeTree Engine

ClickHouse ban đầu được Yandex phát triển cho hệ thống phân tích web (Yandex.Metrica), được thiết kế để "nhai" một lượng lớn dữ liệu log với tốc độ chóng mặt. 

Trái tim của ClickHouse nằm ở **MergeTree Engine**. Khác với các hệ thống OLTP sử dụng B-Tree, MergeTree được thiết kế chuyên biệt cho việc *append-only* (chỉ ghi thêm mới) với hiệu năng cực cao.

### 1.1. Cách MergeTree hoạt động
Khi dữ liệu được insert vào ClickHouse, thay vì cập nhật trực tiếp vào một cấu trúc dữ liệu khổng lồ, nó ghi dữ liệu vào các *parts* (phân mảnh) nhỏ trên ổ cứng. Mỗi part được sắp xếp (sorted) dựa trên `ORDER BY` (thường là Primary Key). Ở dưới nền (background), ClickHouse sẽ liên tục thực hiện việc **Merge** các parts nhỏ này lại thành các parts lớn hơn (giống cơ chế LSM-Tree). Việc này giúp tối đa hóa tốc độ ghi (Ingestion Speed) do là ghi tuần tự (sequential write), không gặp tình trạng lock database.

### 1.2. Sparse Indexing (Chỉ mục thưa)
Tại sao ClickHouse lại truy vấn nhanh trên lượng dữ liệu hàng tỷ dòng? Bí quyết nằm ở **Sparse Indexing**.
- Nếu B-Tree index từng dòng một (chiếm rất nhiều RAM và storage), thì ClickHouse chia dữ liệu (đã được sort) thành các khối gọi là **Granules** (mặc định 8192 dòng/granule).
- ClickHouse chỉ lưu lại giá trị Primary Key của dòng *đầu tiên* trong mỗi granule vào RAM.
- **Kết quả:** Index siêu nhỏ gọn, hoàn toàn vừa khít trong RAM. Khi có query, ClickHouse dùng binary search trên index này để xác định chính xác các granules chứa dữ liệu, rồi đọc thẳng chúng từ disk (Data Skipping), bỏ qua hàng tỷ dòng không liên quan.

### 1.3. Case Study: Cloudflare Engineering
Cloudflare sử dụng ClickHouse làm "trái tim" cho hệ thống phân tích lưu lượng HTTP và DNS (HTTP Analytics & Logs). 
Trước đây, họ sử dụng kiến trúc Kafka kết hợp PostgreSQL/Citus. Tuy nhiên, với lượng request lên tới hàng chục triệu requests/giây (peak traffic), hệ thống cũ gặp vấn đề về scale và chi phí lưu trữ (Storage Cost).
Khi chuyển sang ClickHouse:
- **Compression rate (Tỷ lệ nén):** Do ClickHouse lưu trữ dữ liệu theo dạng cột (Columnar Storage) và dùng dictionary/LZ4/ZSTD encoding, tỷ lệ nén của Cloudflare đạt mức khó tin, giúp giảm chi phí lưu trữ log xuống mức cực thấp.
- **Tốc độ Ingestion:** ClickHouse có thể tiêu thụ (ingest) hàng triệu sự kiện mỗi giây một cách dễ dàng nhờ kiến trúc MergeTree.

---

## 2. Apache Pinot: Giải pháp User-facing từ Uber

Nếu ClickHouse thiên về xử lý lượng dữ liệu khổng lồ cho internal analytics với tốc độ cao, thì **Apache Pinot** được tạo ra để giải quyết bài toán: **User-facing Analytics với độ trễ (latency) cực thấp và lượng truy cập đồng thời (concurrency) cực cao.**

### 2.1. Nguồn gốc từ Uber
Uber tạo ra Pinot và open-source nó vào năm 2015. Một trong những use case điển hình là **Uber Restaurant Manager** (cho UberEats). 
Hãy tưởng tượng hàng trăm nghìn chủ nhà hàng cần xem số liệu (doanh thu, lượt orders) realtime ngay trên ứng dụng di động. Nếu dùng Data Warehouse thông thường, hệ thống sẽ bị sập vì số lượng Query Per Second (QPS) quá lớn. Uber cần một hệ thống:
- Real-time ingestion trực tiếp từ Apache Kafka.
- Query độ trễ vài chục mili-giây (sub-second query).
- SLA đảm bảo cho hàng ngàn User đồng thời truy vấn.

### 2.2. Điểm mạnh kiến trúc: Rich Indexing (Hệ thống Index phong phú)
Pinot hy sinh một phần không gian lưu trữ và thời gian lúc ingestion để tính toán sẵn (pre-compute) và tạo ra hàng loạt các bộ Index cực mạnh:
- **Inverted Index:** Phục vụ cho các truy vấn tìm kiếm/lọc (như Elasticsearch).
- **Star-Tree Index:** Tự động pre-aggregate dữ liệu. Khi query tính tổng (SUM) hay đếm (COUNT), Pinot chỉ cần đọc kết quả đã được tính sẵn thay vì scan dữ liệu thật, giúp query siêu nhanh với QPS cực cao.

---

## 3. Trade-offs: Ingestion speed vs Query speed vs Storage cost

Khi chọn giữa ClickHouse và Pinot, các Data Engineer phải đối mặt với **Tam giác đánh đổi (Trade-offs)**:

| Tiêu chí | ClickHouse | Apache Pinot |
| :--- | :--- | :--- |
| **Ingestion Speed (Tốc độ nạp)** | **Cực tốt.** Tối ưu nhất khi ingest dữ liệu theo batch lớn (Micro-batching) nhờ MergeTree. Không tối ưu cho việc insert từng dòng đơn lẻ. | **Tốt.** Hỗ trợ streaming ingestion trực tiếp từ Kafka rất mượt mà. Hỗ trợ tốt Upsert/Mutable data ở dạng realtime. |
| **Query Speed (Tốc độ truy vấn)** | Rất nhanh cho các câu lệnh scan tập dữ liệu lớn, join phức tạp. Thích hợp cho Internal BI / Ad-hoc Query. | **Xuất sắc cho User-facing.** Tối ưu cực mạnh cho point-queries, low-latency, và high concurrency (hàng ngàn QPS) nhờ Star-Tree/Inverted Index. |
| **Storage Cost (Chi phí lưu trữ)** | **Rất thấp.** Tỷ lệ nén dữ liệu tuyệt vời, Sparse Indexing chiếm cực ít không gian. Tối ưu chi phí hạ tầng hoàn hảo. | **Cao hơn.** Đánh đổi Storage để lấy Tốc độ. Việc sử dụng các loại Index phong phú (Inverted, Star-tree) khiến dung lượng đĩa phình to nhanh chóng so với bản ghi gốc. |

**Tóm lại:** 
- Chọn **ClickHouse** nếu bạn cần lưu trữ log, event tracking khổng lồ, chi phí cực rẻ, tốc độ truy vấn khối dữ liệu lớn siêu nhanh và chủ yếu phục vụ Data Team/Internal Dashboard.
- Chọn **Apache Pinot** nếu bạn đang xây dựng một tính năng Analytics hiển thị trực tiếp cho end-user (VD: merchant dashboard, user profile metrics), nơi mà sự sống còn phụ thuộc vào việc hệ thống chịu tải được hàng ngàn queries cùng lúc mà không có độ trễ.

---

## 4. Tài liệu Tham khảo
- [Cloudflare: HTTP Analytics for 6M requests per second using ClickHouse](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/)
- [Uber Engineering: Real-time Analytics at Uber Scale](https://www.uber.com/en-VN/blog/real-time-exactly-once-ad-event-processing/)
- [ClickHouse Documentation: MergeTree Engine Family](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree)
- [Apache Pinot: Star-Tree Index](https://docs.pinot.apache.org/basics/indexing/star-tree-index)
