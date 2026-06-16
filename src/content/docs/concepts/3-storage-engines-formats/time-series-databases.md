---
title: "Time Series Databases (InfluxDB, TimescaleDB, ClickHouse)"
description: "Cơ sở dữ liệu chuỗi thời gian (TSDB): Đặc điểm, kiến trúc lưu trữ, thuật toán nén Gorilla, vấn đề High Cardinality và phân tích chi tiết InfluxDB, TimescaleDB, ClickHouse."
---



Trong thế giới Data Engineering và hệ thống phân tán, dữ liệu chuỗi thời gian (Time-Series Data) phát sinh từ các thiết bị IoT, log hệ thống, telemetry, hay giá cổ phiếu có đặc thù rất riêng: Khối lượng ghi (Write) khổng lồ, dữ liệu hầu như không bao giờ bị Update (chỉ có Insert), và các truy vấn thường quét theo một khoảng thời gian (Time-range queries).

Sử dụng RDBMS truyền thống (như MySQL hay PostgreSQL thuần) cho loại dữ liệu này thường dẫn đến các điểm nghẽn nghiêm trọng về hiệu năng và chi phí lưu trữ. Đó là lý do hệ quản trị Cơ sở dữ liệu chuỗi thời gian - **Time-Series Databases (TSDB)** ra đời.

---

## 1. Dữ Liệu Chuỗi Thời Gian (Time-Series Data) Là Gì?

Dữ liệu chuỗi thời gian là một tập hợp các điểm dữ liệu được thu thập theo trình tự thời gian. Khác với dữ liệu quan hệ thường mô tả trạng thái hiện tại của một thực thể (ví dụ: số dư tài khoản hiện tại), dữ liệu chuỗi thời gian ghi lại *mọi sự thay đổi* của thực thể đó qua thời gian.

**Đặc trưng cốt lõi của Time-Series Data:**
1. **Timestamp-centric:** Mọi bản ghi (record) đều gắn liền với một dấu thời gian (Timestamp) không thể tách rời.
2. **Write-heavy / Append-only:** Hàng triệu điểm dữ liệu được sinh ra mỗi giây. Dữ liệu mới liên tục được chèn vào (Insert), và gần như 100% là ghi tiếp nối (Append). Các thao tác Update hay Delete các bản ghi riêng lẻ là cực kỳ hiếm.
3. **Immutable:** Khi dữ liệu đã được sinh ra và ghi lại, nó phản ánh một thực tế lịch sử và hiếm khi bị sửa đổi.
4. **Time-range queries:** Đa số các truy vấn lấy dữ liệu để phân tích đều dựa trên một khung thời gian (ví dụ: *Lấy nhiệt độ trung bình của CPU trong 3 giờ qua, nhóm theo từng phút*).
5. **Độ phân giải và vòng đời (Resolution & Lifecycle):** Dữ liệu càng mới thì càng cần độ phân giải cao (từng giây). Dữ liệu càng cũ, giá trị chi tiết ít quan trọng hơn, người ta thường quan tâm tới giá trị tổng hợp (trung bình giờ/ngày) để tiết kiệm lưu trữ.

---

## 2. Tại Sao Không Dùng RDBMS Truyền Thống Cho Time-Series?

RDBMS truyền thống sử dụng cấu trúc **B-Tree** cho việc lập chỉ mục (Indexing). 
- B-Tree hoạt động rất tốt cho các thao tác đọc ngẫu nhiên (Random Read) và cập nhật (Update/Delete). Tuy nhiên, khi đối mặt với **High Ingestion Rate** (hàng triệu lượt ghi mỗi giây), cấu trúc B-Tree trở thành một thảm họa (Write Amplification) vì hệ thống liên tục phải phân tách node (page splits) và ghi lại index xuống đĩa.
- Hơn nữa, RDBMS lưu trữ dữ liệu theo từng dòng (Row-oriented). Khi bạn chỉ cần truy vấn một cột (ví dụ: cột `cpu_usage`) trong một khoảng thời gian dài, RDBMS vẫn phải nạp toàn bộ các dòng (chứa nhiều cột không liên quan) từ đĩa lên RAM, gây lãng phí I/O khổng lồ.
- Cuối cùng, RDBMS thiếu các cơ chế tích hợp sẵn để tự động nén hoặc xóa dữ liệu cũ theo thời gian một cách tối ưu. Thao tác `DELETE FROM table WHERE timestamp < ...` trong RDBMS rất nặng và tạo ra phân mảnh (fragmentation).

---

## 3. Kiến Trúc Lưu Trữ Của TSDB

Để giải quyết các rào cản của B-Tree và lưu trữ dạng hàng, các TSDB sử dụng sự kết hợp của nhiều kỹ thuật tiên tiến:

### 3.1. LSM-Trees (Log-Structured Merge-Tree)
Các TSDB (như InfluxDB, Prometheus) thường sử dụng kiến trúc lưu trữ dựa trên LSM-Trees.
LSM-Tree cho phép hệ thống hấp thụ hàng triệu thao tác ghi mỗi giây bằng cách ghi tuần tự vào bộ nhớ RAM (gọi là **MemTable**). Khi MemTable đầy, nó được xả (flush) xuống đĩa thành các file bất biến (ví dụ: **SSTables**). Điều này biến mọi thao tác ghi ngẫu nhiên thành ghi tuần tự (Sequential I/O) trên đĩa – vốn có tốc độ cực nhanh ngay cả trên ổ HDD hay SSD.

### 3.2. Columnar Storage (Lưu trữ hướng cột)
Lưu trữ theo cột giúp tối ưu hóa truy vấn phân tích (OLAP) và đặc biệt có ích cho các hàm tổng hợp (AGGREGATION) như `SUM()`, `AVG()`, `MAX()`. Do dữ liệu của một metric được lưu nằm cạnh nhau, TSDB có thể quét nhanh chóng mà không cần đọc các tag/metric khác. Hơn thế, việc nén dữ liệu trên một cột cùng kiểu dữ liệu sẽ mang lại tỷ lệ nén vượt trội.

### 3.3. Time-Partitioning (Phân mảnh theo thời gian)
TSDB tự động chia dữ liệu vật lý thành các khối (chunks / shards) dựa trên khoảng thời gian (ví dụ: mỗi khối chứa 1 ngày dữ liệu). Nhờ Time-Partitioning:
- Truy vấn chỉ cần chạm vào các khối nằm trong khoảng thời gian được yêu cầu (Query Pruning).
- Việc xóa dữ liệu cũ (Data Retention) được thực hiện cực nhanh bằng cách xóa (drop) hẳn file chunk vật lý trên đĩa (O(1) operation), thay vì dùng lệnh `DELETE` từng dòng.

---

## 4. Thuật Toán Nén Gorilla (Đột Phá Của Facebook)

Lưu trữ một lượng khổng lồ Time-series data đòi hỏi chi phí đĩa lớn. Đột phá lớn nhất về nén dữ liệu cho TSDB hiện đại là **thuật toán nén Gorilla**, do Facebook giới thiệu trong bài nghiên cứu năm 2015.

Dữ liệu chuỗi thời gian thường có đặc điểm:
1. Khoảng cách thời gian gửi dữ liệu rất đều đặn (vd: đúng 1 giây gửi 1 điểm dữ liệu).
2. Giá trị của metric ít thay đổi đột biến trong khoảng thời gian ngắn (vd: nhiệt độ CPU từ 50.1°C tăng lên 50.2°C).

Từ đặc điểm này, Gorilla áp dụng kỹ thuật nén cực kỳ hiệu quả:

### 4.1. Nén Timestamp với Delta-of-Delta
Thay vì lưu timestamp 64-bit khổng lồ cho mỗi record, hệ thống tính khoảng cách (Delta) giữa các timestamp. 
- Giả sử khoảng cách là đều đặn 60s, Delta luôn là 60. 
- Sau đó, hệ thống tiếp tục lấy **Hiệu số của hiệu số (Delta-of-Delta)**. Vì Delta không đổi, Delta-of-Delta phần lớn sẽ bằng 0. Gorilla có thể mã hóa số 0 này chỉ bằng **1 bit** duy nhất!

### 4.2. Nén Value (Float) với toán tử XOR
Đối với các giá trị đo lường, Gorilla sử dụng phép **XOR (Exclusive OR)** để so sánh giá trị Floating-point hiện tại với giá trị trước đó. 
- Nếu giá trị không đổi, kết quả XOR là 0 (lưu bằng 1 bit). 
- Nếu giá trị thay đổi nhỏ (như 50.1 và 50.2), phép XOR giữa hai số nhị phân Float sẽ tạo ra rất nhiều bit 0 ở đầu và cuối. Gorilla chỉ cần lưu các bit khác biệt ở giữa, tiết kiệm tối đa không gian.

Nhờ Gorilla, TSDB có thể nén dữ liệu nhỏ hơn tới **10-12 lần** so với lưu trữ thô, cho phép hệ thống nạp toàn bộ một khoảng thời gian dài dữ liệu "nóng" trực tiếp lên RAM để truy vấn siêu tốc.

---

## 5. Vấn Đề Nhức Nhối: High Cardinality

**Cardinality (Độ phân cực)** là số lượng chuỗi thời gian (time-series) duy nhất trong cơ sở dữ liệu. 
Một time-series được định nghĩa bằng sự kết hợp của: `Metric Name` + tập hợp các `Tags/Labels`.

Ví dụ bạn thu thập log hệ thống với tags: `host` (100 servers) và `region` (3 vùng).
Số Cardinality = 100 * 3 = 300 (Rất nhỏ).

Tuy nhiên, nếu nhà phát triển thêm một tag là `user_id` (với 10 triệu người dùng) hoặc `container_id` (được sinh ra ngẫu nhiên liên tục ở môi trường Kubernetes).
Số Cardinality lúc này = 100 * 3 * 10,000,000 = **3 tỷ**.

Khi gặp **High Cardinality (Độ phân cực cao)**, số lượng keys trong Inverted Index của các TSDB (như Prometheus, InfluxDB) sẽ phình to ra tới mức không thể nằm vừa trên RAM. Hậu quả là tốc độ ghi (Write) chậm lại khủng khiếp do hệ thống phải swap index xuống đĩa, và các query bị timeout hoặc Out Of Memory (OOM). Quản lý và xử lý High Cardinality là bài toán đau đầu nhất khi thiết kế Data Pipeline cho Time-series.

---

## 6. So Sánh Các TSDB Nổi Bật Hiện Nay

Thị trường Time-Series DB có ba hướng đi chính: Purpose-built (xây dựng chuyên dụng từ đầu), Relational Extension (kế thừa cơ sở dữ liệu quan hệ), và OLAP Engines (công cụ phân tích mạnh mẽ).

### 6.1. InfluxDB (Chuyên Dụng - Purpose-built)
InfluxDB là TSDB nổi tiếng nhất, được thiết kế chuyên biệt từ con số không cho mục đích xử lý chuỗi thời gian.
- **Engine lưu trữ:** Sử dụng **TSM (Time-Structured Merge Tree)** – một biến thể của LSM-Tree tối ưu cho Time-series, và **TSI (Time Series Index)** để chuyển bớt áp lực của index từ RAM xuống đĩa, giải quyết một phần rắc rối của High Cardinality.
- **Ngôn ngữ:** Hỗ trợ InfluxQL (giống SQL) và ngôn ngữ Flux mạnh mẽ cho việc phân tích.
- **Ưu điểm:** Hệ sinh thái tích hợp sẵn (TICK stack), dễ dàng cài đặt, quản lý Downsampling tự động (Continuous Queries), nén rất tốt.
- **Nhược điểm:** Phiên bản mã nguồn mở (Open Source) không hỗ trợ Cluster phân tán. Ngôn ngữ Flux có learning curve cao.

### 6.2. TimescaleDB (Kế thừa từ PostgreSQL)
Thay vì tạo ra một cơ sở dữ liệu mới, TimescaleDB tiếp cận bằng cách biến PostgreSQL – một RDBMS cực kỳ ổn định – thành một TSDB thông qua một Extension.
- **Khái niệm cốt lõi:** **Hypertables**. Lập trình viên nhìn thấy và tương tác với một bảng (table) duy nhất, nhưng ở dưới nền, TimescaleDB tự động chia nhỏ dữ liệu vật lý theo thời gian thành vô số các khối **Chunks**.
- **Ngôn ngữ:** Sử dụng 100% PostgreSQL tiêu chuẩn. Mọi tính năng của Postgres (như JOIN, Indexing cấu trúc đa dạng, PostGIS, Role-based Access) đều hoạt động.
- **Ưu điểm:** Bạn có thể JOIN dữ liệu time-series (VD: log nhiệt độ cảm biến) với dữ liệu quan hệ (Relational DB - VD: thông tin của loại cảm biến đó ở bảng thiết bị). Cực kỳ thân thiện nếu team đã vững SQL.
- **Nhược điểm:** Hiệu năng nén và Write Throughput có thể không đạt cực đại bằng các giải pháp Purpose-built (dù đã có Native Compression trong các phiên bản sau này).

### 6.3. ClickHouse (Cỗ Máy OLAP Khổng Lồ)
Mặc dù ClickHouse là một hệ quản trị CSDL phân tích dạng cột (Column-oriented OLAP), nó đang ngày càng trở thành sự lựa chọn số 1 cho các bài toán Observability (Logging, Tracing, Metrics) quy mô lớn. Công ty như Uber, Cloudflare sử dụng ClickHouse thay thế dần ElasticSearch và InfluxDB.
- **Engine:** Sử dụng họ **MergeTree**, dựa trên ý tưởng của LSM-Tree, thiết kế để quét (scan) dữ liệu siêu nhanh song song trên mọi core CPU. ClickHouse có khả năng nạp hàng chục tỷ dòng mỗi giây.
- **Ưu điểm cực lớn:** Giải quyết triệt để bài toán **High Cardinality**. ClickHouse không dùng cơ chế Inverted Index khổng lồ (vốn ngốn nhiều RAM) cho mọi tag như InfluxDB. Bằng cách thiết kế Primary Key thưa (Sparse Index) và tận dụng sức mạnh quét rễ dạng cột (brute-force scan on columns), nó vượt qua High Cardinality một cách dễ dàng.
- **Nhược điểm:** Thiếu một số hàm/tính năng xử lý Time-series đặc thù có sẵn (bạn phải tự viết bằng SQL), UPDATE/DELETE tương đối phức tạp (dạng Mutation phi đồng bộ).

---

## 7. Tổng Kết

- **Dùng InfluxDB/Prometheus khi:** Bạn chỉ cần thu thập metrics (CPU, RAM, Network) từ hệ thống giám sát, cần triển khai nhanh, sinh thái cảnh báo (alerting) được hỗ trợ tốt, cấu trúc dữ liệu không có tính phân cực quá lớn (Low/Medium Cardinality).
- **Dùng TimescaleDB khi:** Dữ liệu chuỗi thời gian của bạn có sự gắn kết mật thiết với dữ liệu nghiệp vụ quan hệ (Business Relational Data), và đội ngũ của bạn thích sử dụng chung hệ sinh thái Postgres để không phải quản lý thêm công nghệ mới.
- **Dùng ClickHouse khi:** Bạn đang xử lý quy mô từ hàng tỷ đến hàng nghìn tỷ bản ghi (Big Data), cần phân tích đa chiều ở tốc độ tính bằng mili-giây, gom chung Logs / Metrics / Traces vào chung một nền tảng, và đặc biệt cần trị tận gốc căn bệnh High Cardinality.

---

## Tài Liệu Tham Khảo

* [Gorilla: A Fast, Scalable, In-Memory Time Series Database - Facebook Engineering](https://www.vldb.org/pvldb/vol8/p1816-teller.pdf)
* [Design of Time-Structured Merge Tree (TSM) - InfluxData](https://docs.influxdata.com/influxdb/v1.8/concepts/storage_engine/)
* **TimescaleDB Architecture: Hypertables and Chunks**
* **Why ClickHouse is Great for Time Series Data**
* **Handling High Cardinality in Time Series Databases**
