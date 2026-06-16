---
title: "Google BigQuery - Nền tảng phân tích Serverless"
difficulty: "Intermediate"
tags: ["google-cloud", "bigquery", "data-warehouse", "serverless", "olap"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Google BigQuery là gì? Kiến trúc và Hướng dẫn tối ưu hóa"
metaDescription: "Tìm hiểu kiến trúc độc đáo của Google BigQuery (Borg, Colossus, Dremel), ưu nhược điểm, cách tính giá và các thủ thuật tối ưu hóa truy vấn chi phí thấp."
description: "Trong thế giới phân tích dữ liệu, việc phải quản lý hạ tầng máy chủ, cấu hình bộ nhớ đệm hay thiết lập các chỉ mục (index) cho database luôn là nỗi ám ảnh. BigQuery ra đời để giải quyết triệt để bài toán này."
---



Google BigQuery là một Enterprise Data Warehouse hoàn toàn Serverless (không máy chủ) và Highly Scalable (khả năng mở rộng cao) của Google Cloud Platform (GCP). Kế thừa các công nghệ xử lý dữ liệu khổng lồ nội bộ của Google, BigQuery có khả năng thực thi các câu lệnh truy vấn SQL trên các tập dữ liệu kích thước Petabyte, thậm chí Exabyte, chỉ trong vài giây đến vài phút mà không yêu cầu quản trị viên quản lý máy chủ, tối ưu hóa index hay cấu hình phần cứng (mô hình NoOps).

Trong bài viết này, chúng ta sẽ đi sâu vào kiến trúc cốt lõi đứng sau tốc độ kinh hoàng của BigQuery, định dạng lưu trữ Capacitor, cách tổ chức dữ liệu thông minh và các best practices để sử dụng BigQuery một cách tiết kiệm và hiệu quả.

## 1. Kiến trúc phân tách Compute và Storage



Lợi thế cạnh tranh lớn nhất của BigQuery so với các Data Warehouse truyền thống nằm ở việc **tách rời hoàn toàn tầng tính toán (Compute) và tầng lưu trữ (Storage)**. Hai tầng này giao tiếp với nhau qua một mạng nội bộ siêu tốc độ của Google.

Điều này có nghĩa là bạn có thể mở rộng khả năng lưu trữ không giới hạn mà không cần mua thêm CPU, và ngược lại, quy mô tính toán tự động co giãn dựa trên độ phức tạp của câu truy vấn. Kiến trúc phân tách này dựa trên 4 trụ cột công nghệ chính:

### Dremel: Execution Engine (Động cơ thực thi)
Dremel là cỗ máy tính toán phân tán cho phép truy vấn trực tiếp trên dữ liệu có cấu trúc và bán cấu trúc với tốc độ chóng mặt. Dremel chuyển đổi các câu lệnh SQL thành một cây thực thi (execution tree) nhiều tầng. 
- Nút gốc (Root) nhận câu truy vấn và phân chia thành các truy vấn nhỏ hơn, gửi đến các nút trung gian (Mixers).
- Các nút trung gian tiếp tục chia nhỏ nhiệm vụ và gửi tới các nút lá (Leaf nodes).
- Các nút lá làm nhiệm vụ đọc dữ liệu song song trực tiếp từ Storage, tính toán sơ bộ và trả kết quả ngược lên trên.

### Colossus: Distributed Storage (Hệ thống lưu trữ phân tán)
Colossus là thế hệ tiếp theo của Google File System (GFS). Đây là hệ thống file phân tán siêu bền bỉ (high durability), chịu trách nhiệm đảm bảo dữ liệu không bao giờ bị mất mát hay gián đoạn thông qua cơ chế sao chép đa vùng (replication) và mã hóa dự phòng (erasure encoding). Nhờ Colossus, BigQuery không bị giới hạn về dung lượng một bảng như các cơ sở dữ liệu truyền thống.

### Jupiter: High-Speed Network (Mạng lưới tốc độ cao)
Để Compute (Dremel) và Storage (Colossus) hoàn toàn tách biệt mà không bị nghẽn cổ chai (bottleneck) về băng thông, Google sử dụng kiến trúc mạng Jupiter siêu tốc. Jupiter cung cấp băng thông lên đến mức độ Petabit/s (hàng ngàn Terabit/s), giúp Dremel có thể đọc hàng Terabyte dữ liệu từ Colossus trong chớp mắt mà không cần tải dữ liệu về một "ổ cứng" cục bộ nào.

### Borg: Resource Manager (Quản lý tài nguyên)
Mọi tác vụ của Dremel, Colossus đều được phân bổ và vận hành bởi Borg - tiền thân của hệ thống Kubernetes mã nguồn mở ngày nay. Borg điều phối các "slot" (đơn vị tính toán của BigQuery) để đảm bảo hàng nghìn truy vấn đồng thời trên toàn bộ Google Cloud Platform được phục vụ đúng cam kết SLA.

## 2. Capacitor: Định dạng lưu trữ theo cột

BigQuery lưu trữ dữ liệu nội bộ bằng một định dạng độc quyền gọi là **Capacitor**. Nó là một định dạng file theo cột (Columnar format) tương tự như Apache Parquet hay ORC, nhưng được tối ưu hóa sâu hơn cho hệ sinh thái của Google.

Lợi ích của lưu trữ cột bằng Capacitor:
1. **Giảm thiểu dung lượng I/O**: Truy vấn SQL chỉ đọc những cột được `SELECT`, bỏ qua hoàn toàn dữ liệu ở các cột không liên quan. Điều này tiết kiệm rất nhiều chi phí do BigQuery tính phí dựa trên số byte dữ liệu được quét.
2. **Mã hóa và nén cao cấp**: Các dữ liệu trong cùng một cột thường có độ tương đồng cao (cùng kiểu dữ liệu, nhiều giá trị trùng lặp). Capacitor tự động sử dụng nhiều kỹ thuật nén tiên tiến (như Run-length Encoding, Dictionary Encoding) để nén dữ liệu. Thậm chí nó có khả năng thay đổi chiến lược nén ngay trong quá trình nạp dữ liệu (data loading).
3. **Lưu trữ metadata thông minh**: Capacitor lưu lại các con số thống kê (min, max, count...) ở cấp độ block lưu trữ. Khi truy vấn tìm một bản ghi có giá trị cụ thể, Dremel sẽ dùng metadata này để "bỏ qua" (skip) các block không chứa dữ liệu cần thiết mà không cần quét toàn bộ.

## 3. Tổ chức dữ liệu: Partitioning và Clustering

Dù có khả năng quét hàng Petabyte trong vài giây, quét quá nhiều dữ liệu sẽ tiêu tốn chi phí cực lớn. Để tối ưu hóa, BigQuery cung cấp hai cơ chế vật lý để giới hạn phạm vi quét:

### Table Partitioning (Phân vùng bảng)
Partitioning chia một bảng lớn thành nhiều mảnh (partitions) nhỏ hơn dựa trên giá trị của một cột. Khi truy vấn có điều kiện lọc (`WHERE`) nằm trên cột được phân vùng, BigQuery chỉ quét duy nhất các phân vùng thỏa mãn.

BigQuery hỗ trợ 3 loại phân vùng:
- **Time-unit column partitioning**: Phân vùng dựa trên 1 cột `DATE`, `TIMESTAMP`, hoặc `DATETIME` theo ngày (Daily), tháng (Monthly), năm (Yearly) hoặc giờ (Hourly).
- **Ingestion time partitioning**: Tự động tạo phân vùng dựa trên thời gian dữ liệu được insert vào hệ thống (thông qua cột ảo `_PARTITIONTIME` hoặc `_PARTITIONDATE`).
- **Integer range partitioning**: Phân vùng theo các giá trị nguyên (Integer), ví dụ: CustomerID từ 1-1000, 1001-2000.

### Table Clustering (Phân cụm bảng)
Trong khi Partitioning chia bảng ở mức file hệ thống theo 1 tiêu chí, **Clustering** sẽ sắp xếp dữ liệu *bên trong* các phân vùng đó (hoặc toàn bộ bảng nếu không có partition) theo một nhóm lên tới 4 cột.

Dữ liệu có cùng giá trị trong các cột được cluster sẽ được đặt cạnh nhau (co-located) trong các block lưu trữ. 
Khi bạn dùng điều kiện `WHERE` hoặc `JOIN` trên các cột đã được cluster, BigQuery sử dụng block metadata để loại bỏ (prune) những block không khớp một cách nhanh chóng, mang lại tốc độ ưu việt hơn và giảm đáng kể lượng byte processed.

*Nguyên tắc:* Luôn thiết kế Partition trước để giảm khối lượng dữ liệu quét theo thời gian, sau đó kết hợp thêm Cluster theo những trường thường xuyên dùng để Filter (WHERE) hoặc nhóm (GROUP BY).

## 4. Các mô hình định giá (Pricing Models)

Chi phí trong BigQuery được cấu thành từ hai phần rõ rệt: **Storage** (Lưu trữ) và **Compute / Analysis** (Tính toán).

### Storage Pricing
BigQuery chia dữ liệu thành 2 cấp độ:
- **Active Storage**: Dữ liệu được sửa đổi hoặc truy cập trong 90 ngày qua. Chi phí thông thường cao hơn.
- **Long-term Storage**: Dữ liệu không có bất kỳ thay đổi nào trong 90 ngày liên tiếp sẽ tự động giảm giá lưu trữ xuống xấp xỉ 50%. (Việc đọc dữ liệu không làm mất trạng thái Long-term).
- BigQuery cũng tính giá dựa trên **Logical Bytes** (trước khi nén, rẻ hơn mỗi byte) hoặc **Physical Bytes** (sau khi nén trên disk, giá cao hơn mỗi byte). Bạn có thể chọn cách tính có lợi cho mình.

### Compute / Analysis Pricing
- **On-demand Pricing**: Trả tiền theo lượng dữ liệu thực tế bị quét (bytes processed) tính bằng Terabytes (TB) khi chạy từng câu SQL. Mô hình này phù hợp cho người dùng mới, tải truy vấn không đều. (Mỗi tháng Google miễn phí quét 1TB đầu tiên).
- **Capacity Pricing**: Trả tiền để "thuê" một số lượng cố định các khe cắm tính toán (Compute Slots) theo từng khung giờ hoặc tháng. Bạn sẽ không bị tính phí theo số lượng dữ liệu quét nữa, chỉ cần trả một khoản chi phí phẳng dựa trên số máy chủ chuyên dụng mà Google dành riêng cho bạn. Phù hợp cho tổ chức lớn với ngân sách cần dự báo chính xác.

## 5. Ecosystem & Advanced Features

BigQuery không chỉ là kho lưu trữ dữ liệu, nó đóng vai trò là hạt nhân của toàn bộ hệ sinh thái Dữ liệu và AI của GCP.
* **BigQuery ML (BQML)**: Cho phép Data Analyst huấn luyện các mô hình Machine Learning (Linear Regression, K-Means, XGBoost, ARIMA, thậm chí gọi các mô hình LLM thông qua Vertex AI) sử dụng thuần cú pháp SQL ngay bên trong BigQuery mà không cần xuất dữ liệu ra Python/Pandas.
* **BigLake & BigQuery Omni**: Mở rộng định dạng và phạm vi truy vấn. Với Omni, bạn có thể gửi truy vấn từ giao diện BigQuery để phân tích dữ liệu đang nằm tại Amazon S3 hay Azure Blob Storage cục bộ bên đó mà không tốn băng thông dịch chuyển dữ liệu.
* **BI Engine**: Dịch vụ tính toán lưu trong bộ nhớ (In-memory analysis) hoạt động bên cạnh BigQuery. BI Engine hỗ trợ Looker, Data Studio hay Tableau truy xuất kết quả dưới 1 giây (sub-second response) ngay trên hàng tỉ dòng dữ liệu gốc.
* **Materialized Views**: BigQuery hỗ trợ pre-compute các bảng view tổng hợp. Điểm đặc biệt của Materialized Views trong BigQuery là khả năng "Smart Tuning" tự động định tuyến lại các truy vấn SQL thông thường vào View nếu nó nhận thấy view đó có thể tối ưu truy vấn tốt hơn, và tính năng cập nhật gia tăng tự động (automatic incremental refresh) khi bảng gốc có dữ liệu mới.

## 6. Tổng hợp Best Practices tối ưu hóa (Cost & Performance Tuning)

Để tránh gặp phải các hoá đơn hàng ngàn đô la cho BigQuery, hãy nằm lòng các nguyên tắc:

1. **KHÔNG bao giờ dùng `SELECT *`**: Do BigQuery là database hướng cột, `SELECT *` sẽ buộc hệ thống phải quét và trả phí cho toàn bộ mọi cột trong bảng. Hãy chỉ định đích danh từng cột: `SELECT id, name, created_at`.
2. **Luôn sử dụng Partitioning và Clustering** trên các bảng lớn (fact tables). Đặc biệt với Partitioning theo ngày/tháng, và cấu hình cờ *"Require partition filter"* để ép người dùng bắt buộc phải điền điều kiện thời gian khi truy vấn bảng đó.
3. **Hạn chế dùng `COUNT(DISTINCT col)`**: Tìm kiếm các bản ghi duy nhất trên tập dữ liệu hàng tỉ dòng là siêu đắt đỏ. Nếu bạn chỉ cần số liệu ước lượng tương đối, hãy thay thế bằng **`APPROX_COUNT_DISTINCT(col)`**. Nó dùng thuật toán HyperLogLog++ để cho ra kết quả nhanh gấp nhiều lần và tiết kiệm tài nguyên mà độ lệch chỉ ~1-2%.
4. **Tránh Filter trên các chuỗi bằng hàm LIKE '%...%'**: Tìm kiếm kiểu full-scan này vô hiệu hoá mọi nỗ lực Pruning (chặn quét) dữ liệu của Capacitor. Thay vào đó hãy xem xét thiết lập BigQuery Search Index cho các cột Text.
5. **Dùng Table Expiration**: Đối với các tập dữ liệu staging (trung gian), tập dữ liệu tạm thời, hãy cấu hình Auto-expire (hết hạn) trên mức độ Dataset hoặc Table. BigQuery sẽ tự động xoá dọn dữ liệu, không làm phát sinh chi phí lưu trữ Active kéo dài.
6. **Kiểm tra chi phí bằng `--dry-run`**: Trên giao diện hoặc CLI, hãy chạy chế độ Dry Run trước khi thực sự ấn Execute câu lệnh. Nó sẽ trả về dung lượng bytes processed thực tế để bạn quyết định có nên chạy SQL hay không, chế độ dry-run là hoàn toàn miễn phí.

## Tài Liệu Tham Khảo Thêm
* [A Look at Dremel - Interactive Analysis of Web-Scale Datasets (Google Research)](https://research.google/pubs/pub36632/)
* [BigQuery under the hood - Official Google Cloud Blog](https://cloud.google.com/blog/products/data-analytics/new-blog-series-bigquery-under-the-hood)
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
