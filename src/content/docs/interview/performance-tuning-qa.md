---
title: "Tối ưu hóa hiệu năng (Phỏng vấn) - Performance Tuning QA"
category: "Interview Preparation"
difficulty: "Advanced"
tags: ["performance-tuning", "sql", "indexing", "partitioning", "interview"]
readingTime: "13 mins"
lastUpdated: 2026-07-10
seoTitle: "Performance Tuning QA - Phỏng vấn tối ưu hóa truy vấn dữ liệu"
metaDescription: "Trả lời phỏng vấn tối ưu hiệu năng truy vấn: đọc EXPLAIN plan, partition pruning, indexing, COUNT DISTINCT xấp xỉ, và bài toán small files."
domains: ["DE"]
---

Một câu SQL chạy đúng trên vài nghìn dòng dữ liệu test không nói lên điều gì. Cũng câu đó trên bảng chục tỷ dòng có thể treo hàng giờ, chặn cả pipeline phía sau, và — trên warehouse tính tiền theo lượng dữ liệu quét — đốt tiền theo đúng nghĩa đen. Vòng Performance Tuning tồn tại để kiểm tra bạn có nhìn thấy trước những điều đó không, và đây thường là vòng phân định rõ nhất giữa Junior và Senior.

Về bản chất kỹ thuật, tối ưu hiệu năng là giảm lượng I/O (đọc đĩa, truyền mạng) và CPU mà engine phải tiêu để trả về cùng một kết quả. Mọi kỹ thuật trong bài này — pruning, indexing, pre-computation — đều là biến thể của một câu: *đừng đọc thứ không cần đọc*.

---

## Bốn nguyên tắc áp dụng cho mọi hệ thống lưu trữ

**Cắt tỉa từ sớm (pushdown/pruning).** Đẩy điều kiện lọc (`WHERE`) và danh sách cột cần lấy xuống càng sâu càng tốt, trước các phép toán nặng như `GROUP BY` hay `JOIN`. Các optimizer hiện đại tự làm việc này phần lớn — vai trò của bạn là *không viết code cản trở nó* (xem bài toán bên dưới).

**Tổ chức dữ liệu vật lý.** [Partitioning](/concepts/3-storage-engines-formats/partitioning) chia dữ liệu thành các khối theo giá trị (thường là ngày) để engine bỏ qua nguyên khối không liên quan; [Clustering](/concepts/3-storage-engines-formats/clustering)/Z-Ordering xếp các dòng giá trị gần nhau nằm cạnh nhau để tăng khả năng skip trong từng file. Partition trả lời "quét thư mục nào", clustering trả lời "trong file đó đọc khúc nào".

**[Indexing](/concepts/3-storage-engines-formats/indexing).** B-Tree index thay full table scan bằng tìm kiếm O(log n) — công cụ chủ lực của hệ [OLTP](/concepts/3-storage-engines-formats/oltp). Lưu ý ranh giới quan trọng: các cloud warehouse như BigQuery *không có* index truyền thống — vai trò đó do partitioning và clustering đảm nhận. Áp kinh nghiệm OLTP nguyên xi sang [OLAP](/concepts/3-storage-engines-formats/olap) là lỗi nhận diện hệ thống, và người phỏng vấn để ý điều này.

**Tính trước (pre-computation).** Dashboard mở ra mỗi sáng không nên kích hoạt phép quét 5 năm dữ liệu mỗi lần. Materialized view lưu sẵn kết quả tổng hợp và refresh phần thay đổi — trả giá bằng dung lượng và độ trễ dữ liệu để mua thời gian phản hồi.

---

## Quy trình 4 bước xử lý một câu SQL chậm

1. **Đọc execution plan trước, sửa code sau.** Chạy `EXPLAIN` (hoặc `EXPLAIN ANALYZE`) tìm điểm nghẽn: full table scan ở đâu, có JOIN Cartesian không chủ đích không, có disk spill do thiếu RAM không. Tài liệu PostgreSQL xếp việc đọc plan là bước đầu tiên của mọi quy trình tối ưu — sửa code khi chưa nhìn plan là đoán mò.
2. **Tối ưu logic câu lệnh**: bỏ `SELECT *`, viết lại điều kiện lọc để không bọc hàm quanh cột, cân nhắc thay subquery lồng nhau bằng JOIN hoặc CTE.
3. **Tối ưu cấu trúc vật lý**: thêm index đúng cột (OLTP), đặt partition key theo mẫu truy vấn thực tế (OLAP), chuyển định dạng file sang Parquet/ORC nếu đang là CSV/JSON.
4. **Caching cho dữ liệu đọc nhiều đổi ít**: query cache của warehouse, hoặc Redis ở tầng ứng dụng. Đây là bước cuối vì cache là giải pháp *che* độ chậm chứ không chữa — và mang theo bài toán invalidation riêng của nó.

---

## Bài toán thực chiến: câu đếm người dùng mất 5 phút

**Đề bài**: *"Câu này chạy 5 phút trên warehouse của chúng tôi. Chỉ ra vấn đề và cách sửa."*

```sql
SELECT product_id, COUNT(DISTINCT user_id)
FROM events
WHERE EXTRACT(YEAR FROM event_date) = 2026
GROUP BY product_id;
```

**Vấn đề 1 — hàm bọc quanh cột lọc.** `EXTRACT(YEAR FROM event_date) = 2026` buộc engine tính hàm trên *từng dòng* rồi mới so sánh — index trên `event_date` trở nên vô dụng và partition pruning bị vô hiệu hóa, vì engine không suy ra được khoảng giá trị gốc từ biểu thức hàm. Cách sửa: đưa cột về đứng độc lập một vế:

```sql
WHERE event_date >= '2026-01-01' AND event_date < '2027-01-01'
```

Cùng ngữ nghĩa, nhưng giờ engine so khoảng giá trị trực tiếp với index/partition metadata. Dạng lỗi này có tên riêng — non-sargable predicate — và là lỗi hiệu năng phổ biến bậc nhất trong code SQL thực tế.

**Vấn đề 2 — `COUNT(DISTINCT)` trên dữ liệu lớn.** Đếm chính xác số giá trị duy nhất đòi hỏi tập hợp toàn bộ `user_id` về để khử trùng — trong hệ phân tán nghĩa là shuffle nặng qua mạng và bộ nhớ lớn trên node tổng hợp. Nếu nghiệp vụ là dashboard xu hướng không cần chính xác tuyệt đối, đề xuất `APPROX_COUNT_DISTINCT(user_id)` — cài đặt thuật toán HyperLogLog, sai số thường quanh 1-2% đổi lấy tốc độ nhanh hơn nhiều lần và bộ nhớ gần như không đáng kể. Câu hỏi bạn nên hỏi ngược người phỏng vấn: *"con số này dùng để làm gì — báo cáo tài chính hay theo dõi xu hướng?"* — vì đó chính là điều kiện quyết định có được dùng xấp xỉ hay không.

---

## Ba kỹ thuật cấu trúc đáng chủ động nêu

**Materialized view cho tổng hợp lặp lại.** BigQuery và Snowflake tự động refresh phần dữ liệu thay đổi và thậm chí tự rewrite truy vấn để dùng materialized view khi phù hợp. Trade-off: tốn storage, tốn compute duy trì, và có độ trễ so với bảng gốc — hợp với báo cáo, không hợp với dữ liệu cần realtime.

**Chọn chiến lược JOIN theo kích thước bảng.** Bảng lớn join bảng nhỏ: broadcast bảng nhỏ tới các worker, tránh shuffle bảng lớn. Hai bảng cùng lớn: đảm bảo cả hai được phân phối/bucket theo cùng khóa join để dữ liệu liên quan nằm sẵn cùng node. Nói được "JOIN chậm thường không phải vì JOIN, mà vì dữ liệu chưa nằm đúng chỗ trước khi JOIN" là nắm được bản chất.

**[Columnar Storage](/concepts/3-storage-engines-formats/columnar-storage) làm mặc định cho OLAP.** Truy vấn cần 3 cột trong bảng 100 cột: định dạng cột chỉ đọc file của đúng 3 cột đó. Cộng thêm nén tốt hơn (dữ liệu cùng kiểu nằm liền nhau) — Parquet/ORC không phải "lựa chọn tối ưu" mà là điểm xuất phát chuẩn.

---

## Ba sai lầm kinh điển

**`SELECT *` trên warehouse dạng cột.** Vô hiệu hóa toàn bộ lợi thế của columnar storage, và trên hệ tính tiền theo bytes quét (BigQuery on-demand) thì mỗi lần chạy là một khoản phí không cần thiết. Liệt kê cột cần lấy — luôn luôn.

**Index tràn lan.** Mỗi index tăng tốc đọc nhưng làm chậm mọi INSERT/UPDATE vì cây chỉ mục phải được cập nhật theo. Hệ ghi nhiều theo lô (bulk load vào warehouse) vì thế gần như không dùng B-Tree index — sort key và partitioning thay thế. Index là công cụ của OLTP với truy vấn điểm; câu "cứ chậm thì thêm index" là câu trả lời của người chưa từng trả giá cho tốc độ ghi.

**Small files problem.** Phân vùng quá mịn (đến giờ, đến phút) sinh hàng triệu file vài KB trên S3/HDFS. Chi phí mở/đóng file và quản lý metadata vượt cả thời gian đọc dữ liệu thật; Spark và các engine tương tự suy giảm rõ rệt. Giữ file trong khoảng 128MB-512MB, gộp định kỳ bằng compaction (các table format như Delta/Iceberg có sẵn cơ chế này). Nghịch lý đáng nói ra: partition là công cụ tăng tốc, nhưng partition *quá tay* lại là nguyên nhân làm chậm phổ biến hàng đầu.

---

## Nguyên lý chung phía sau: đổi storage lấy compute

Index, materialized view, cache, cả Parquet — tất cả cùng một nguyên lý: dùng thêm dung lượng lưu trữ để bớt thời gian tính toán. Trong bối cảnh giá storage giảm liên tục còn compute (và thời gian chờ của con người) vẫn đắt, chiều đánh đổi này gần như luôn có lợi. Gói được các kỹ thuật rời rạc về một nguyên lý như vậy khi trả lời là tín hiệu tư duy hệ thống — thứ vòng phỏng vấn này thật sự tìm kiếm.

---

## Ba câu hỏi thực tế và cách trả lời

### 1. `EXPLAIN` dùng làm gì, bạn tìm gì trong kết quả?

`EXPLAIN` hiển thị kế hoạch thực thi mà optimizer chọn; `EXPLAIN ANALYZE` chạy thật và cho số liệu thực tế. Ba thứ cần soi: **cơ chế quét** — `Seq Scan` trên bảng lớn là cờ đỏ, `Index Scan` là dấu hiệu tốt; **chênh lệch giữa rows ước tính và rows thực tế** — lệch xa nghĩa là statistics cũ, optimizer đang quyết định trên thông tin sai (chạy `ANALYZE` cập nhật statistics trước khi sửa gì khác); **thuật toán JOIN** — `Nested Loop` giữa hai bảng lớn là thảm họa, `Hash Join` cho bảng vừa, `Merge Join` khi hai bên đã sắp xếp theo khóa. Điểm cộng: nói rõ ước tính của `EXPLAIN` chỉ đúng khi statistics mới — cost-based optimizer sống bằng statistics.

### 2. `WHERE` khác `HAVING` thế nào dưới góc nhìn hiệu năng?

`WHERE` lọc *trước* khi `GROUP BY` chạy; `HAVING` lọc *sau* khi đã gom nhóm và tính hàm tổng hợp. Hệ quả hiệu năng: điều kiện đặt được ở `WHERE` mà đem xuống `HAVING` nghĩa là bắt engine gom nhóm cả đống dữ liệu lẽ ra đã bị loại từ đầu. Quy tắc: `HAVING` chỉ dành cho điều kiện trên kết quả hàm tổng hợp (`HAVING SUM(amount) > 1000`); mọi điều kiện trên cột thường thuộc về `WHERE`.

### 3. Tối ưu truy vấn `LIKE '%abc%'` chậm ra sao?

Wildcard `%` đứng *đầu* chuỗi làm B-Tree index vô dụng — index sắp xếp theo tiền tố, mà tiền tố lại là phần chưa biết — nên engine quét cả bảng. Hai hướng: trong PostgreSQL, tạo **trigram index** (extension `pg_trgm` với GIN index) hỗ trợ tìm chuỗi con ngay trong database; nếu nhu cầu là full-text search cường độ cao, đưa luồng đó sang công cụ chuyên dụng như Elasticsearch với **inverted index**. Nêu cả ngưỡng chuyển: một tính năng search nhỏ không đáng để gánh thêm một hệ thống Elasticsearch phải vận hành — `pg_trgm` trước, Elasticsearch khi search trở thành tính năng trung tâm.

---

## Tài liệu tham khảo

* [PostgreSQL Documentation — Chapter 14: Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html) — dùng EXPLAIN, statistics và các kỹ thuật tối ưu chính thức.
* [Google BigQuery — Optimize query computation](https://cloud.google.com/bigquery/docs/best-practices-performance-compute) — best practice chính thức cho warehouse serverless, gồm partitioning/clustering và approximate aggregation.
* [Snowflake — SQL Query Optimization: Techniques and Best Practices](https://www.snowflake.com/en/fundamentals/query-optimization/) — góc nhìn tối ưu trên kiến trúc tách compute/storage.
* **Designing Data-Intensive Applications — Martin Kleppmann (O'Reilly)** — chương 3 giải thích B-Tree, LSM-Tree và columnar storage, nền tảng của mọi câu "vì sao" trong bài này.
* **High Performance MySQL, 4th Edition — Silvia Botros & Jeremy Tinley (O'Reilly)** — tối ưu ở tầng OLTP: index, schema và query design.
