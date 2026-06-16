---
title: "Internals: Bloom Filters, SSTables & LSM-Trees"
description: "Khám phá chi tiết kiến trúc lưu trữ đằng sau các hệ cơ sở dữ liệu hiện đại, cách LSM-Trees tối ưu hóa tốc độ ghi và vai trò ma thuật của Bloom Filters trong việc cứu rỗi hiệu năng đọc. Ứng dụng thực chiến trong Data Engineering với Parquet, Spark và các hệ thống phân tán."
---



SSTables (Sorted String Tables) và LSM-Trees (Log-Structured Merge-Trees) là kiến trúc lưu trữ nền tảng đằng sau hầu hết các cơ sở dữ liệu và hệ thống lưu trữ hiện đại yêu cầu tốc độ ghi (Write) cực cao như Apache Cassandra, RocksDB, InfluxDB, HBase và Google Bigtable. Mặc dù mang lại ưu thế tuyệt đối về tốc độ ghi, kiến trúc này lại gặp phải một nhược điểm chí mạng về tốc độ đọc (Read). Để giải quyết bài toán này, **Bloom Filters** nổi lên như một mảnh ghép ma thuật không thể thiếu.

Bài viết này sẽ đi sâu vào cấu trúc bên trong của các thành phần này, sự kết hợp giữa chúng và cách chúng được ứng dụng trong Data Engineering thực chiến.

## 1. Đi sâu vào LSM-Trees và SSTables



Thay vì cập nhật dữ liệu trực tiếp tại các vị trí ngẫu nhiên trên ổ cứng (như cấu trúc B-Trees của MySQL hay PostgreSQL, vốn gây ra Random I/O rất tốn thời gian cơ học của ổ đĩa), LSM-Trees sử dụng một hướng tiếp cận hoàn toàn khác: ưu tiên **Sequential I/O** (Ghi tuần tự).

### 1.1. MemTable: Vùng đệm trên RAM
Khi có một yêu cầu ghi (Write hoặc Update/Delete), hệ thống không ghi trực tiếp xuống đĩa ngay lập tức. Thay vào đó, dữ liệu được đưa vào một cấu trúc dữ liệu lưu trên bộ nhớ RAM, được gọi là **MemTable**.
- **Cấu trúc lưu trữ:** MemTable thường được triển khai dưới dạng cây nhị phân cân bằng (Red-Black Tree), AVL Tree hoặc Skip List. Điều này đảm bảo rằng dữ liệu trong RAM luôn được duy trì theo trạng thái **đã sắp xếp (Sorted)** theo khóa (Key).
- **Tốc độ:** Vì mọi thao tác đều diễn ra trên RAM, tốc độ ghi gần như đạt mức tối đa của hệ thống.

*(Lưu ý: Để tránh mất dữ liệu khi cúp điện, mọi thao tác ghi cũng được ghi tuần tự vào một file Log trên đĩa gọi là WAL - Write Ahead Log).*

### 1.2. Quá trình Flush và sự hình thành SSTable
Khi MemTable đạt đến một giới hạn kích thước nhất định (ví dụ: vài chục Megabytes), nó sẽ bị đóng băng. Hệ thống tạo ra một MemTable mới để phục vụ các yêu cầu ghi tiếp theo, trong khi MemTable cũ được "flush" (đẩy) thẳng xuống ổ cứng.
File được tạo ra trên đĩa này chính là **SSTable (Sorted String Table)**.
- **Tính chất Immutable (Không thể thay đổi):** Một khi SSTable được ghi xuống đĩa, nó sẽ không bao giờ bị chỉnh sửa nữa. Nếu có bản cập nhật mới cho một Key cũ, Key đó sẽ được ghi vào một SSTable mới hơn. Việc xóa (Delete) thực chất cũng là việc thêm một bản ghi đặc biệt gọi là "Tombstone" (Bia mộ) vào SSTable mới.
- **Sequential I/O:** Vì MemTable đã được sắp xếp sẵn, việc ghi nó xuống SSTable chỉ là ghi tuần tự liên tục vào ổ cứng. Tốc độ ghi tuần tự của ổ cứng (kể cả HDD) là cực kỳ nhanh, lên tới hàng trăm MB/s.

### 1.3. Cấu trúc nội bộ của SSTable
Một file SSTable thường được chia thành nhiều khối (Data Blocks) để tiện cho việc đọc và giải nén. Kèm theo đó là một khối **Index Block** nằm ở cuối file.
- Index Block chứa danh sách các khóa đầu tiên của mỗi Data Block kèm theo offset (vị trí) của chúng trong file.
- Khi cần tìm một khóa, hệ thống chỉ cần đọc Index Block vào RAM, dùng tìm kiếm nhị phân (Binary Search) để biết khóa cần tìm nằm ở Block nào, sau đó mới seek đến đúng vị trí đó trên đĩa để đọc.

### 1.4. Nút thắt cổ chai: Hiệu năng Đọc (Read Amplification)
Theo thời gian, quá trình Flush sẽ tạo ra hàng chục, hàng trăm file SSTable trên ổ cứng. 
**Vấn đề:** Khi cần đọc (Read) một record (ví dụ: `user_id = 123`), hệ thống thực hiện theo thứ tự:
1. Tìm trong MemTable hiện tại.
2. Nếu không có, tìm trong các Immutable MemTable đang chờ flush.
3. Nếu vẫn không có, nó phải lùng sục qua **TẤT CẢ** các file SSTable trên ổ cứng từ mới nhất đến cũ nhất.

Trường hợp tồi tệ nhất: Bản ghi bạn tìm kiếm không hề tồn tại trong database. Hệ thống sẽ phải mở tất cả các file SSTable ra, tải Index Block lên, tìm kiếm, đọc Data Block và cuối cùng trả về tập rỗng. Việc phải thực hiện hàng chục lần Random Disk I/O để trả lời cho một truy vấn sẽ giết chết hiệu năng hệ thống. Hiện tượng này gọi là **Read Amplification** (Khuếch đại đọc).

Để giảm lượng SSTable, hệ thống chạy một tiến trình ngầm gọi là **Compaction** (Gộp file). Các SSTable nhỏ cũ sẽ được merge lại thành các SSTable lớn hơn và loại bỏ các dữ liệu rác/tombstone. Tuy nhiên, quá trình này rất tốn tài nguyên và không thể diễn ra ngay lập tức. Chúng ta cần một giải pháp khác để cứu vãn tốc độ đọc theo thời gian thực.

## 2. Bloom Filters: Vị Cứu Tinh Của Disk I/O

Làm sao để biết `user_id = 123` CÓ NẰM TRONG một file SSTable cụ thể hay không MÀ KHÔNG CẦN mở file đó ra đọc? Đó là lúc **Bloom Filters** xuất hiện.

### 2.1. Khái niệm cơ bản
Bloom Filter là một cấu trúc dữ liệu xác suất (Probabilistic Data Structure) được phát minh bởi Burton Howard Bloom năm 1970. Nó được thiết kế để kiểm tra xem một phần tử có thuộc về một tập hợp hay không, với chi phí lưu trữ cực kỳ nhỏ.

Cấu trúc cốt lõi bao gồm:
- Một **mảng bit (Bit array)** độ dài `m`, ban đầu tất cả các bit được set bằng `0`.
- `k` **Hàm băm (Hash functions)** độc lập. Các hàm này sẽ băm một giá trị đầu vào thành `k` con số nguyên khác nhau, ánh xạ tới các vị trí index trong mảng bit.

### 2.2. Cơ chế hoạt động

**Thêm dữ liệu (Add):**
Giả sử có một khóa `user_id = 123` được ghi vào SSTable. Ta đưa `123` qua `k` hàm băm (ví dụ k=3).
- `Hash1("123") % m = 4`
- `Hash2("123") % m = 15`
- `Hash3("123") % m = 8`

Hệ thống sẽ bật (set bằng 1) các bit tại vị trí 4, 8, 15 trong mảng bit.

**Kiểm tra dữ liệu (Check):**
Khi có truy vấn "SSTable này có `user_id = 123` không?". Hệ thống lại băm "123" bằng đúng `k` hàm băm đó, thu được các vị trí 4, 8, 15. Nó nhìn vào mảng bit tại các vị trí này:
- Nếu **có BẤT KỲ BIT NÀO BẰNG 0**: Khẳng định **chắc chắn 100% là KHÔNG CÓ**. Hệ thống tự tin bỏ qua file SSTable này ngay lập tức, tiết kiệm được 1 lần Disk I/O đắt đỏ.
- Nếu **TẤT CẢ ĐỀU BẰNG 1**: Câu trả lời là **"CÓ THỂ CÓ"**. Lúc này, hệ thống mới thực sự chạm vào ổ cứng để mở file SSTable ra kiểm tra. Tại sao lại là "có thể"? Bởi vì các bit số 4, 8, 15 này có thể đã bị bật lên bằng `1` vô tình do sự kết hợp của các khóa khác trước đó (gọi là **False Positive - Dương tính giả**).

### 2.3. Tối ưu toán học và Trade-off
Bloom Filter không lưu trữ chính dữ liệu nên nó vô cùng nhỏ gọn. Bạn có thể đại diện cho hàng triệu khóa chỉ với vài Megabytes RAM.
Tỷ lệ dương tính giả (FPP - False Positive Probability) có thể được kiểm soát dựa trên việc tùy chỉnh kích thước mảng bit (`m`) và số lượng hàm băm (`k`) cho một số lượng khóa dự kiến (`n`).

Công thức tính toán số lượng hàm băm tối ưu: 
$$k = \frac{m}{n} \ln(2)$$

Ví dụ: Trong RocksDB, với tỷ lệ False Positive mong muốn là 1%, bạn chỉ cần cấu hình khoảng **10 bits cho mỗi khóa** trong mảng Bloom Filter. Một cái giá quá rẻ để đổi lấy việc loại bỏ 99% các lần truy cập ổ cứng vô ích.

## 3. Tích hợp Bloom Filters vào SSTables

Trong thực tế hệ thống LSM-Trees, Bloom Filter được gắn liền với vòng đời của SSTable:
1. **Quá trình Flush:** Khi MemTable đang được ghi xuống ổ đĩa thành SSTable, các khóa cũng đồng thời được đưa qua bộ tạo Bloom Filter.
2. **Lưu trữ:** Mảng bit Bloom Filter sau khi hoàn thiện sẽ được đính kèm vào phần cuối của file SSTable (cùng với Index Block, tạo thành phần Footer).
3. **Quá trình Đọc:** Khi Database khởi động hoặc khi mở một file SSTable, khối Bloom Filter này sẽ được nạp (load) thẳng vào RAM và giữ ở đó.
4. **Loại bỏ truy cập ổ cứng thừa:** Mỗi khi truy vấn một khóa, RAM sẽ check Bloom Filter trước tiên, chỉ khi hệ thống báo "CÓ THỂ CÓ" (bị Dương tính giả hoặc có thật) thì hệ thống mới phải chịu phạt Disk I/O để xác minh. 

Nhờ chặn đứng hơn 99% các truy vấn vô ích, kiến trúc LSM-Trees mới có thể đạt được tốc độ Read gần tương đương với B-Trees trong khi vẫn giữ nguyên vị thế bá chủ về tốc độ Write.

## 4. Ứng Dụng Trong Data Engineering Thực Chiến

Khái niệm Bloom Filter không chỉ giới hạn trong các OLTP database. Trong Data Engineering hiện đại, nó là xương sống của việc tối ưu hóa truy vấn Big Data.

### 4.1. Định dạng dữ liệu Columnar (Apache Parquet & ORC)
Các định dạng file lưu trữ hướng cột cực kỳ phổ biến trong Data Lake/Data Warehouse. Các định dạng này lưu dữ liệu thành các cục nhỏ gọi là Row Groups (Parquet) hoặc Stripes (ORC).
- **Nhúng Bloom Filters:** Parquet/ORC cho phép cấu hình tạo Bloom Filter cho một số cột cụ thể (thường là các cột hay được dùng trong mệnh đề `WHERE` hoặc `JOIN`). Các Bloom Filters này lưu ở dạng metadata trong Footer của file.
- **Predicate Pushdown:** Khi một Query Engine (như Amazon Athena, Presto, Spark SQL) đọc dữ liệu từ Cloud Storage (như AWS S3). Thay vì phải tải toàn bộ hàng Gigabytes dữ liệu xuống, engine sẽ đọc cái Footer trước để lấy metadata và Bloom Filter. Nếu câu truy vấn là `SELECT * FROM table WHERE id = 100`, engine check Bloom Filter của từng Row Group. Nếu ra kết quả "KHÔNG", nó sẽ bỏ qua hoàn toàn việc tải Row Group đó từ S3. Điều này giảm thiểu triệt để chi phí mạng lưới và chi phí quét (scan cost).

### 4.2. Runtime Filtering (Dynamic Bloom Filters) trong Apache Spark & Trino
Khi thực hiện JOIN giữa một bảng khổng lồ (Fact Table) và một bảng nhỏ (Dimension Table), việc xáo trộn dữ liệu (Shuffle) trên mạng lưới cluster là một nguyên nhân gây chậm trễ hàng đầu.
- Các Distributed SQL Engine sử dụng chiến thuật **Dynamic Bloom Filter**: Đầu tiên, engine quét bảng Dimension nhỏ và xây dựng nhanh một Bloom Filter chứa tất cả các khóa join.
- Do bản chất cực kỳ nhỏ gọn, Bloom Filter này được gửi (Broadcast) đến tất cả các worker nodes đang chịu trách nhiệm quét Fact Table.
- Khi các worker quét bảng lớn, ngay tại thời điểm đọc từng dòng (hoặc từng file), chúng đẩy khóa qua Bloom Filter. Nếu khóa không có trong bảng nhỏ, dòng dữ liệu đó bị ném bỏ ngay lập tức tại nguồn, trước cả khi tham gia vào quá trình Shuffle hay Hash Join nặng nề. Kỹ thuật này giảm lượng dữ liệu truyền qua mạng một cách đáng kinh ngạc.

### 4.3. Các cơ sở dữ liệu phân tán (Cassandra, HBase)
Các hệ thống NoSQL Column-Family này sử dụng gốc LSM-Trees. Các Data Engineer và DBA thường xuyên phải tinh chỉnh tham số `bloom_filter_fp_chance` khi thiết kế schema của bảng.
- **Giảm tỷ lệ dương tính giả** (ví dụ: `0.01` tương đương 1% FPP) sẽ làm Bloom Filter có kích thước lớn hơn, tốn nhiều bộ nhớ RAM hơn, nhưng Disk I/O do đọc nhầm sẽ cực kỳ ít. Thích hợp cho các workload đọc ngẫu nhiên tần suất cao.
- **Tăng tỷ lệ dương tính giả** (ví dụ: `0.1` tương đương 10% FPP) sẽ tiết kiệm RAM đáng kể, nhưng bù lại khoảng 10% số lần truy vấn không tồn tại sẽ lọt lưới và hệ thống phải đọc đĩa thừa. Thích hợp cho Time-series data (vì dữ liệu chủ yếu là đọc các mốc thời gian liền kề) hoặc khi dữ liệu quá lớn so với dung lượng RAM khả dụng.

## 5. Hạn chế và Các Biến Thể Cải Tiến

Dù hoàn hảo và gọn nhẹ, Bloom Filter nguyên thủy có một điểm yếu cơ bản: **Không hỗ trợ xóa phần tử (No Delete)**.
Bởi vì một bit được bật lên `1` có thể do nhiều phần tử cùng băm vào đó do sự trùng lặp giá trị băm (Hash Collision). Nếu ta lật bit đó thành `0` để xóa một phần tử, ta có thể vô tình hủy luôn dấu vết của các phần tử khác cũng đang dùng chung bit đó.
Để giải quyết bài toán này, các cấu trúc dữ liệu mới hơn (được gọi là Approximate Membership Queries - AMQ) đã ra đời:

- **Counting Bloom Filter:** Thay vì dùng 1 bit đơn giản, nó thay thế bằng một biến đếm (counter) nhỏ (ví dụ 4 bits) cho mỗi vị trí index. Khi thêm phần tử thì cộng dồn counter (`+1`), khi xóa thì trừ đi (`-1`). Đánh đổi lại là nó sẽ tốn bộ nhớ gấp vài lần so với Bloom Filter gốc.
- **Cuckoo Filter:** Dựa trên thuật toán Cuckoo Hashing. Nó hiệu quả hơn Bloom Filter khi tỷ lệ FPP yêu cầu thấp (dưới 3%), hoạt động nhanh hơn và đặc biệt là hỗ trợ thao tác Xóa (Delete) an toàn.
- **Ribbon Filter / Xor Filter:** Các biến thể tối ưu cao cấp đang được các database hiệu năng cao như RocksDB tích cực áp dụng để giảm "footprint" tiêu thụ RAM hơn nữa so với Bloom Filter nguyên bản.

## 6. Tổng Kết

SSTables và LSM-Trees mang đến khả năng mở rộng (Scalability) tuyệt vời và thông lượng Ghi dường như vô hạn. Tuy nhiên, kiến trúc này phải hy sinh chi phí tìm kiếm, gây ra hiện tượng Read Amplification. 

Bằng cách khai thác quy luật xác suất qua cấu trúc toán học tinh tế gọn nhẹ của **Bloom Filter**, các kỹ sư phần mềm đã cân bằng lại được cán cân hiệu năng. Sự kết hợp giữa LSM-Trees và Bloom Filter đã thiết lập nền tảng chuẩn mực cho hệ thống dữ liệu hiện đại. Hiểu sâu sắc về cơ chế này không chỉ giúp bạn cấu hình cơ sở dữ liệu tốt hơn, mà còn là chìa khóa để vận dụng hiệu quả các định dạng file và tinh chỉnh hiệu năng tận gốc rễ cho mọi pipeline xử lý Big Data.

## Tài Liệu Tham Khảo
* [RocksDB Wiki - Bloom Filter](https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter)
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
