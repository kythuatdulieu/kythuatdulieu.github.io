---
title: "Kiến trúc MPP & Dremel"
difficulty: "Advanced"
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Kiến trúc MPP & Dremel - Data Engineering Deep Dive"
metaDescription: "Bí mật đằng sau khả năng quét hàng Petabyte dữ liệu trong vài giây của Google BigQuery. Tìm hiểu kiến trúc MPP và Google Dremel."
description: "Khám phá kiến trúc MPP (Massively Parallel Processing) và công cụ Dremel của Google - trái tim của BigQuery."
---



MPP (Massively Parallel Processing) là kiến trúc xử lý song song quy mô lớn, trong đó mỗi Node có CPU và RAM riêng biệt (Shared-nothing). Dremel là engine MPP do Google tạo ra, đặt nền móng cho BigQuery, hỗ trợ xử lý hàng Petabyte bằng cách chia truy vấn thành một cây thực thi khổng lồ.

Bài viết này sẽ đi sâu vào kiến trúc cốt lõi của MPP, khám phá cách Dremel hoạt động và giải mã bí mật giúp công nghệ này thực hiện các truy vấn tương tác cực nhanh trên khối lượng dữ liệu khổng lồ.

---

## 1. Kiến trúc MPP (Massively Parallel Processing) là gì?



MPP là một mô hình kiến trúc tính toán phân tán, được thiết kế để xử lý lượng lớn dữ liệu bằng cách chia nhỏ một công việc lớn thành nhiều phần nhỏ gọn hơn và thực thi chúng song song trên nhiều node máy chủ khác nhau.

### Đặc điểm cốt lõi của MPP
* **Shared-Nothing Architecture:** Mỗi node trong cụm MPP đều sở hữu bộ vi xử lý (CPU), bộ nhớ (RAM) và đĩa lưu trữ (Disk) độc lập. Các node không chia sẻ tài nguyên phần cứng với nhau, loại bỏ điểm nghẽn (bottleneck) phổ biến trong kiến trúc shared-memory.
* **Xử lý phân tán (Distributed Processing):** Khi một truy vấn (Query) được gửi đến, một Node điều phối (Master/Coordinator Node) sẽ phân tích, lập kế hoạch thực thi và chia nhỏ truy vấn này thành nhiều Query Plan nhỏ hơn, phân phối cho các Node xử lý (Worker Nodes/Compute Nodes) thực thi đồng thời.
* **Giao tiếp qua mạng tốc độ cao:** Vì các node không chia sẻ bộ nhớ, chúng phải trao đổi dữ liệu (ví dụ: trong quá trình JOIN hoặc Aggregation) thông qua hạ tầng mạng nội bộ. Việc này đòi hỏi mạng phải có băng thông cực lớn và độ trễ thấp.

### Sự khác biệt giữa SMP và MPP
* **SMP (Symmetric Multiprocessing):** Các CPU chia sẻ chung RAM và hệ điều hành. Phù hợp cho xử lý đa nhiệm quy mô nhỏ. Mở rộng (Scale-up) bị giới hạn bởi phần cứng vật lý của một máy chủ.
* **MPP:** Các node độc lập hoàn toàn. Mở rộng (Scale-out) dễ dàng bằng cách thêm node mới vào cụm. Phù hợp cho Data Warehouse, Big Data Analytics.

Các hệ thống cơ sở dữ liệu truyền thống nổi tiếng sử dụng kiến trúc MPP bao gồm: Teradata, Netezza, Greenplum, Amazon Redshift.

---

## 2. Sự ra đời của Google Dremel

Trong hệ sinh thái Big Data ban đầu của Google, công nghệ MapReduce (được Google công bố năm 2004) là giải pháp hoàn hảo cho việc xử lý hàng loạt (Batch Processing) các tệp dữ liệu khổng lồ. Tuy nhiên, MapReduce gặp phải một số hạn chế:
* **Độ trễ cao (High Latency):** Việc khởi chạy các tác vụ map/reduce tốn thời gian, và phải ghi kết quả trung gian xuống đĩa, không thích hợp cho các truy vấn cần kết quả ngay (Ad-hoc / Interactive Query).
* **Khó khăn cho Data Analyst:** MapReduce đòi hỏi viết mã lập trình phức tạp (Java, C++), trong khi các nhà phân tích muốn sử dụng ngôn ngữ truy vấn tiêu chuẩn như SQL.

Để giải quyết nhu cầu "truy vấn dữ liệu với tốc độ suy nghĩ" (Interactive Analysis), Google đã phát triển **Dremel** và giới thiệu nó thông qua một bài báo khoa học nổi tiếng vào năm 2010. Dremel không sinh ra để thay thế MapReduce mà để bổ sung khả năng truy vấn dữ liệu web-scale trong khoảng thời gian chỉ vài giây.

---

## 3. Kiến trúc Cây thực thi (Execution Tree) của Dremel

Thiết kế độc đáo nhất của Dremel chính là cấu trúc xử lý phân tán theo hình cây (Execution Tree), kết hợp với kỹ thuật **Scatter-Gather**.

Cấu trúc này chia làm nhiều tầng:
1. **Root Server (Máy chủ gốc):** 
   Nhận truy vấn SQL từ người dùng, đọc siêu dữ liệu (metadata) của bảng, sau đó định tuyến (route) truy vấn xuống các node ở tầng dưới. Nó cũng chịu trách nhiệm tổng hợp kết quả cuối cùng để trả về cho người dùng.
2. **Intermediate Servers (Máy chủ trung gian):**
   Nằm ở các nhánh của cây. Chúng nhận một phần của truy vấn từ Root Server, tiếp tục viết lại (rewrite) hoặc chia nhỏ truy vấn và đẩy xuống các tầng sâu hơn. Khi có kết quả từ dưới gửi lên, chúng đóng vai trò làm bộ giảm (reducer/aggregator) để gộp kết quả một phần (partial aggregation) trước khi gửi lên Root.
3. **Leaf Servers (Máy chủ lá):**
   Nằm ở tận cùng của cây thực thi. Đây là các node thực thi việc đọc dữ liệu thực tế từ hệ thống lưu trữ phân tán (Colossus/GFS). Chúng quét các khối dữ liệu (chunks), thực hiện lọc (filtering), tính toán cơ bản và trả kết quả ngược lên tầng trung gian.

**Ví dụ quy trình Scatter-Gather:**
Khi bạn `SELECT COUNT(*)` trên 1 Petabyte dữ liệu, truy vấn sẽ được Root chẻ nhỏ truyền tới hàng chục nghìn Leaf Nodes. Mỗi Leaf Node đếm số dòng trên một block dữ liệu nhỏ vài trăm MB do nó phụ trách. Sau đó, nó trả con số cục bộ lên máy chủ trung gian. Các máy chủ trung gian cộng tổng các số này lại, và cuối cùng Root Server đưa ra con số `COUNT` cuối cùng cho bạn chỉ sau vài giây.

---

## 4. Columnar Storage & Xử lý dữ liệu Nested (Lồng nhau)

Thành công của Dremel không chỉ đến từ xử lý song song, mà phần lớn đến từ cách nó lưu trữ dữ liệu. Dremel đã tiên phong sử dụng định dạng lưu trữ theo cột (Columnar Storage) hỗ trợ tối đa cho cấu trúc dữ liệu lồng nhau (Nested Data) - điển hình như dữ liệu Protocol Buffers hoặc JSON.

### Lợi ích của Columnar Storage
Trong phân tích dữ liệu, các truy vấn thường chỉ quét một vài cột trong một bảng có hàng trăm cột. Lưu trữ dạng cột cho phép:
* **Giảm thiểu IO:** Hệ thống chỉ đọc chính xác các block chứa dữ liệu của cột cần thiết (Projection Pushdown), bỏ qua dữ liệu không liên quan.
* **Tối ưu hóa nén dữ liệu (Compression):** Dữ liệu trong cùng một cột thường có chung kiểu và mang tính tương đồng cao, thuật toán nén (như RLE, Dictionary encoding, Snappy) hoạt động cực kỳ hiệu quả, giúp tiết kiệm dung lượng đĩa và băng thông mạng.

### Phân tích kỹ thuật: Repetition Level & Definition Level
Để biểu diễn các cấu trúc phức tạp (như danh sách, mảng lồng nhau) thành các cột phẳng (flat columns) mà không mất đi cấu trúc cây ban đầu, Dremel sáng tạo ra khái niệm:
* **Definition Level (DL):** Xác định có bao nhiêu field trong đường dẫn (path) của một nested field thực sự tồn tại (để xử lý dữ liệu NULL/Optional).
* **Repetition Level (RL):** Xác định ở mức độ (level) nào thì field lồng nhau này bắt đầu một mục lặp mới (xử lý dữ liệu Repeated/Array).

Mô hình định dạng lưu trữ mạnh mẽ này sau đó đã tạo nguồn cảm hứng trực tiếp để cộng đồng mã nguồn mở tạo ra **Apache Parquet**, một trong những định dạng file Big Data phổ biến nhất hiện nay.

---

## 5. Từ Dremel đến Google BigQuery (Hiện tại)

**Google BigQuery** chính là dịch vụ Public Cloud được xây dựng dựa trên cốt lõi của Dremel. Tuy nhiên, BigQuery hiện tại (có thể coi là Dremel v2+) đã được nâng cấp với nhiều công nghệ độc quyền của hệ sinh thái Google Cloud:

* **Tách biệt Compute và Storage (Separation of Storage and Compute):** 
  Khác với kiến trúc MPP truyền thống (như Teradata, nơi CPU và Đĩa cứng gắn liền nhau trên cùng một rack), BigQuery tách rời hoàn toàn:
  - **Storage:** Sử dụng **Colossus** (hệ thống file thế hệ mới thay thế GFS), lưu trữ dữ liệu bền vững ở định dạng cột (Capacitor format - tiến hóa từ format cũ của Dremel).
  - **Compute:** Sử dụng cụm Dremel khổng lồ chạy trên hạ tầng quản lý container **Borg** (tiền thân của Kubernetes). Khi có truy vấn, Borg có thể spin-up hàng ngàn container CPU trong tích tắc để phục vụ xử lý.
* **Jupiter Network:**
  Để việc tách rời Storage và Compute khả thi mà không bị nghẽn cổ chai IO, Google dùng mạng quang nội bộ Jupiter Network, cung cấp băng thông lên đến mức 1 Petabit/giây (bisection bandwidth). Điều này cho phép các compute node đọc dữ liệu từ storage node nhanh như đọc từ đĩa cứng cục bộ.
* **Trạng thái lưu trữ tạm thời trong RAM (Shuffle Layer):**
  Trong quá trình JOIN hoặc tính toán phức tạp cần chuyển đổi vị trí dữ liệu (Shuffle), Dremel hiện đại sử dụng một lớp bộ nhớ cực lớn phân tán (In-Memory Shuffle Tier) để ghi nhận dữ liệu trung gian, giúp truy vấn hoàn thành siêu tốc mà không phải chờ ghi dữ liệu xuống đĩa.

---

## 6. Ưu điểm và Hạn chế của Dremel/MPP

### Ưu điểm
* **Tốc độ cực nhanh:** Thích hợp cho Data Warehousing và Ad-hoc Analytics, OLAP (Online Analytical Processing).
* **Scale lớn:** Xử lý tốt các bảng dữ liệu hàng tỷ, nghìn tỷ dòng. Cung cấp mô hình Serverless (với BigQuery), không cần người dùng tự cấp phép và quản lý server.

### Hạn chế (Trade-offs)
* **Fault-tolerance hạn chế (So với MapReduce):** Dremel được thiết kế cho các truy vấn ngắn (short-lived queries). Nếu một compute node sập giữa chừng, hệ thống cố gắng thử lại (retry) phần nhỏ đó. Tuy nhiên, nếu truy vấn chạy hàng giờ liền với nhiều quá trình xáo trộn dữ liệu (Shuffle), kiến trúc gốc của Dremel kém bền bỉ hơn so với MapReduce/Spark. Mặc dù gần đây BigQuery đã cải thiện điều này qua các cập nhật nội bộ, đây vẫn là một điểm cần cân nhắc trong thiết kế MPP.
* **Không tối ưu cho Transaction/OLTP:** Kiến trúc lưu trữ theo cột và phân tán này tốn kém cho việc ghi nhỏ lẻ liên tục (row-level insert/update). Dremel/MPP yêu cầu dữ liệu append-only hoặc xử lý theo lô lớn (bulk loading) để đạt hiệu năng tốt nhất.

---

## Tổng kết

Google Dremel và kiến trúc MPP đã thay đổi cách thế giới tiếp cận Big Data Analytics. Sự đột phá trong định dạng Columnar Storage cho cấu trúc Nested và mô hình Execution Tree đã làm cho những báo cáo mất vài giờ bằng MapReduce có thể được trích xuất trong vài giây bằng SQL. 

Các tư tưởng thiết kế của Dremel vẫn tiếp tục tồn tại và định hình nền công nghiệp dữ liệu, không chỉ trên Google Cloud (BigQuery) mà còn thông qua hàng loạt dự án mã nguồn mở như Apache Impala, Apache Drill, Trino/Presto, và Apache Parquet.

---

## Tài Liệu Tham Khảo
* [Dremel: Interactive Analysis of Web-Scale Datasets (VLDB 2010)](https://research.google/pubs/pub36632/)
* [A Look at Dremel (Google Cloud Blog)](https://cloud.google.com/blog/products/data-analytics/a-look-at-dremel)
* [Dremel made simple with Parquet (Twitter Engineering)](https://blog.twitter.com/engineering/en_us/a/2013/dremel-made-simple-with-parquet.html)
* **BigQuery under the hood (Google Cloud Documentation)**
