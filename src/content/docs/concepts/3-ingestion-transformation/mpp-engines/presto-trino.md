---
title: "Concepts Deep-dive: MPP Engines - Presto/Trino"
description: "Phân tích kiến trúc MPP của Presto/Trino, In-memory pipelined execution, các loại Join và cơ chế query trực tiếp trên S3."
---

# Presto/Trino: MPP Engines - Tương tác với Petabytes dữ liệu

Presto (và sau này tách ra một nhánh là Trino) được Facebook phát triển ban đầu để giải quyết bài toán truy vấn SQL tương tác trên khối lượng dữ liệu khổng lồ (Petabytes), thay thế cho các batch job MapReduce vốn có độ trễ cao. Kiến trúc của chúng là điển hình cho một Massively Parallel Processing (MPP) SQL engine hiện đại được thiết kế riêng cho việc phân tích dữ liệu lớn.

Bài viết này đi sâu vào kiến trúc cốt lõi của Presto/Trino thông qua các nguyên lý được trình bày trong các tài liệu thiết kế ban đầu như *"Presto: SQL on Everything"*, cũng như cách thức hoạt động thực tế.

## 1. Kiến trúc MPP và In-memory Pipelined Execution

Sự khác biệt lớn nhất về hiệu năng giữa Presto/Trino và các hệ thống batch truyền thống (như Hadoop MapReduce hay Apache Spark trong các giai đoạn shuffle) nằm ở việc Presto tránh tối đa việc ghi dữ liệu xuống đĩa vật lý.

Presto/Trino sử dụng mô hình **In-memory Pipelined Execution**:

* **Điều phối và Lập lịch (Coordinator):** Khi nhận được một câu truy vấn (query), Coordinator sẽ phân tích cú pháp (parse), lập kế hoạch thực thi (plan), tối ưu hóa và chia nhỏ query thành các giai đoạn (stages). Các stage này lại được chia nhỏ thành các **Tasks** và lên lịch thực thi trên các Worker node.
* **Xử lý Dữ liệu (Workers) và Splits:** Dữ liệu nguồn được chia thành các khối công việc nhỏ gọi là **Splits**. Mỗi Worker nhận task và thực thi logic tính toán trên các splits này.
* **Pipelined Execution (Xử lý đường ống):** Quá trình tính toán diễn ra hoàn toàn trong bộ nhớ (RAM). Dữ liệu được xử lý và truyền qua các toán tử (operators) dưới dạng các trang dữ liệu (pages/blocks). Ngay khi một toán tử hoàn thành xử lý một block, nó lập tức đẩy dữ liệu sang toán tử tiếp theo trong pipeline hoặc gửi qua mạng (network) tới các Worker khác. 
* Không giống như MapReduce (phải chờ một phase kết thúc và ghi dữ liệu xuống đĩa rồi phase sau mới được đọc), Pipelined Execution cho phép các stage chạy song song và dữ liệu chảy liên tục. Điều này giảm triệt để độ trễ (latency), khiến Presto/Trino cực kỳ phù hợp với các truy vấn mang tính tương tác (interactive queries).

## 2. Xử lý Join phân tán: Hash Join vs Broadcast Join

Trong môi trường điện toán phân tán, thao tác Join là tốn kém nhất vì dữ liệu từ nhiều node phải được đối chiếu với nhau. Để thực hiện, dữ liệu thường phải được phân phối lại qua mạng sao cho các bản ghi có cùng khóa Join (join key) nằm trên cùng một Worker. Presto/Trino tối ưu việc này qua hai chiến lược chính:

### Partitioned (Distributed) Hash Join
Đây là chiến lược mặc định, được sử dụng khi cả hai bảng đều có kích thước lớn.
* Presto xác định bảng nào nhỏ hơn sẽ làm bảng **Build** và bảng lớn hơn làm bảng **Probe**.
* Hệ thống áp dụng một hàm băm (hash function) lên khóa Join của cả hai bảng.
* Dựa vào giá trị băm, các hàng dữ liệu từ cả hai bảng được phân mảnh (partitioned) và gửi qua mạng (shuffle) đến các Worker xử lý tương ứng.
* Trên mỗi Worker, dữ liệu của bảng Build được dùng để xây dựng một Hash Table nằm trên RAM (in-memory). Sau đó, Worker sẽ quét (scan) dữ liệu của bảng Probe đi qua qua mạng/ổ đĩa, tra cứu vào Hash Table để tìm các bản ghi khớp nhau.
* **Ưu điểm:** Khả năng mở rộng tốt, xử lý được các bảng rất lớn vì tải được chia đều cho toàn cụm.
* **Nhược điểm:** Tiêu tốn băng thông mạng cực lớn do phải shuffle dữ liệu của cả hai bảng.

### Broadcast Join
Được hệ thống ưu tiên sử dụng khi trình tối ưu hóa (Cost-Based Optimizer) nhận thấy một trong hai bảng (bảng Build) đủ nhỏ để nằm gọn trong RAM của một máy duy nhất.
* Thay vì băm và phân phối (shuffle) cả hai bảng, Presto/Trino sẽ **sao chép (broadcast) toàn bộ bảng Build** gửi tới *tất cả* các Worker đang có nhiệm vụ xử lý bảng Probe.
* Bảng Probe (bảng lớn) không hề bị dịch chuyển qua mạng. Các Worker chỉ việc đọc dữ liệu bảng Probe cục bộ từ nguồn lưu trữ, sau đó join với bản sao của bảng Build đã có sẵn trên RAM của nó.
* **Ưu điểm:** Loại bỏ hoàn toàn việc di chuyển mạng của bảng Probe khổng lồ, giảm thiểu độ trễ mạng và CPU cho thao tác băm.
* **Nhược điểm:** Chiếm dụng nhiều bộ nhớ. Mỗi Worker đều phải chứa toàn bộ bảng Build trên RAM. Nếu bảng Build thực chất quá lớn, nó có thể gây ra lỗi Out of Memory (OOM) khiến query thất bại.

## 3. Truy vấn trực tiếp trên S3 không cần copy xuống đĩa

Một trong những thế mạnh tuyệt đối của Presto/Trino là khả năng tách rời linh hoạt giữa tính toán và lưu trữ (Storage/Compute Separation). Câu hỏi đặt ra là: *Làm thế nào Trino có thể truy vấn hàng Terabyte, thậm chí Petabyte dữ liệu đang nằm trên Object Storage như Amazon S3 một cách nhanh chóng mà không cần bước tải (download) dữ liệu về ổ đĩa cứng (local disk) của cụm máy chủ trước?*

Câu trả lời nằm ở khả năng tích hợp sâu của hệ thống và cơ chế stream dữ liệu trực tiếp:

1. **Giao tiếp API trực tiếp (Native Connectors):** Trino sở hữu các connector như Hive, Iceberg, Hudi, hay Delta Lake. Các connector này giao tiếp trực tiếp với S3 thông qua HTTP/REST APIs thay vì đi qua một lớp file system trung gian đòi hỏi cài đặt phức tạp.
2. **Chỉ lấy dữ liệu cần thiết (Range GETs & Columnar formats):** Coordinator đọc siêu dữ liệu (metadata) từ Hive Metastore hoặc file manifest của Iceberg để biết chính xác file nào trên S3 thỏa mãn điều kiện lọc. Kết hợp với các định dạng lưu trữ dạng cột (Parquet, ORC), Worker không cần tải cả file về. Thay vào đó, nó sử dụng HTTP `Range GET` request tới S3 để chỉ kéo (fetch) đúng các byte chứa các cột dữ liệu cần thiết.
3. **Xử lý luồng (Stream Processing) và không cần staging:** Dữ liệu tải từ S3 qua mạng sẽ chạy **thẳng vào bộ nhớ (RAM)** của Worker. Ngay khi dữ liệu vừa đến, nó được đưa vào pipeline xử lý (filter, join, aggregate) và tiếp tục truyền đi. Trino không bao giờ yêu cầu phải tải file S3 lưu tạm vào ổ cứng cục bộ (local staging) rồi mới bắt đầu tính toán. Điều này loại bỏ hoàn toàn điểm nghẽn I/O của đĩa cứng vật lý trên cụm Worker.
4. **Tối ưu File System Caching (Tùy chọn):** Mặc dù nguyên lý gốc là không cần dùng đĩa cứng, Trino vẫn cung cấp một tính năng tùy chọn là *File System Cache*. Nếu được bật, trong khi stream dữ liệu từ S3 vào RAM, Worker có thể lưu lại một bản sao của các block dữ liệu đó trên SSD cục bộ. Với các truy vấn sau quét qua cùng file đó, dữ liệu sẽ được đọc từ ổ SSD siêu tốc thay vì gọi S3 API, giúp tiết kiệm chi phí mạng S3 và giảm độ trễ, nhưng nhắc lại: đây là bộ nhớ đệm (cache) chứ không phải yêu cầu bắt buộc (staging).

---

## Tài liệu Tham khảo
- Sethi, A., Traverso, M., et al. "Presto: SQL on Everything." 2019 IEEE 35th International Conference on Data Engineering (ICDE).
- Facebook Engineering Blog. "Presto: Interacting with Petabytes of Data at Facebook" (2013).
- Tài liệu Trino chính thức (trino.io) - Distributed Query Processing & S3 connectors.
