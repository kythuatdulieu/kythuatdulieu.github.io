---
title: "B-Tree vs LSM-Tree"
difficulty: "Advanced"
readingTime: "10 mins"
lastUpdated: 2026-06-15
seoTitle: "B-Tree vs LSM-Tree - Data Engineering Deep Dive"
metaDescription: "Bản chất vật lý của Storage Engine: Đánh đổi giữa tốc độ Read (B-Tree) và tốc độ Write (LSM-Tree)."
description: "Bản chất vật lý của Storage Engine: Đánh đổi giữa tốc độ Read (B-Tree) và tốc độ Write (LSM-Tree)."
---



B-Tree (cây cân bằng) là cấu trúc lõi của RDBMS truyền thống, tối ưu cho thao tác Đọc nhưng chậm khi Ghi liên tục. Ngược lại, LSM-Tree (Log-Structured Merge-Tree) là cấu trúc lõi của NoSQL và Time-Series DB (như Cassandra, RocksDB), sinh ra để tối ưu hóa việc Ghi (Write-Heavy) với tốc độ khủng khiếp bằng cách chỉ nối thêm (append-only).

Hiểu rõ sự khác biệt giữa hai cấu trúc dữ liệu này là chìa khóa để lựa chọn đúng storage engine cho hệ thống dữ liệu của bạn, từ các giao dịch tài chính yêu cầu độ trễ thấp (OLTP) đến các hệ thống thu thập log khổng lồ với yêu cầu thông lượng cao.

---

## 1. B-Tree (Bayer-Tree / Balanced-Tree)

B-Tree là kiến trúc nền tảng được sử dụng trong gần như mọi hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) như **MySQL (InnoDB)**, **PostgreSQL**, **Oracle** và cả một số NoSQL databases như **MongoDB** (WiredTiger) hay **Couchbase**.

### 1.1. Cơ chế hoạt động

- **Phân trang (Paging):** B-Tree chia đĩa cứng thành các khối (blocks) hoặc trang (pages) có kích thước cố định, thường là 4KB hoặc 8KB. Mỗi thao tác đọc/ghi đều thực hiện trên toàn bộ một page.
- **Cấu trúc phân cấp:** Dữ liệu được tổ chức dưới dạng một cây cân bằng. Các node gốc (root) và node nhánh (internal) chứa khóa (keys) và con trỏ (pointers) trỏ đến các page con. Các node lá (leaf) nằm ở tầng cuối cùng chứa dữ liệu thực tế (hoặc con trỏ tới bản ghi dữ liệu).
- **Cập nhật tại chỗ (In-place updates):** Khi muốn sửa một bản ghi, Storage Engine sẽ tìm đúng page chứa bản ghi đó, tải page lên bộ nhớ, cập nhật dữ liệu, và ghi đè (overwrite) toàn bộ page đó xuống đĩa cứng.

### 1.2. Ưu điểm
*   **Tốc độ đọc nhanh và ổn định:** Độ sâu của cây B-Tree thường rất nông (thường 3-4 tầng). Một cây B-Tree 4 tầng với page 4KB có thể lưu trữ lên đến 256TB dữ liệu. Việc tìm kiếm một bản ghi chỉ tốn tối đa 3-4 lần đọc từ đĩa (disk I/O).
*   **Truy vấn theo dải (Range Queries) hiệu quả:** Với B+Tree (một biến thể phổ biến nhất của B-Tree), các node lá được liên kết với nhau bằng danh sách liên kết đôi (doubly-linked list). Nhờ vậy, việc duyệt và lấy các bản ghi liền kề nhau cực kỳ nhanh chóng.
*   **Hỗ trợ Transaction tốt:** Việc khóa (Locking) ở cấp độ dòng (row) hoặc trang (page) để hỗ trợ ACID transaction dễ dàng hơn vì dữ liệu nằm tại một vị trí cố định trên đĩa.

### 1.3. Nhược điểm
*   **Chi phí ghi cao (Write Penalty):** Ghi dữ liệu ngẫu nhiên (random writes) yêu cầu phải tìm và cập nhật đúng page. Nếu một page bị đầy, việc chèn thêm dữ liệu sẽ gây ra hiện tượng chia tách trang (**Page Split**), làm thay đổi cấu trúc cây và tốn rất nhiều tài nguyên Disk I/O.
*   **Phân mảnh (Fragmentation):** Việc xóa và chèn dữ liệu liên tục sẽ tạo ra các khoảng trống bên trong các page (internal fragmentation), làm giảm hiệu suất lưu trữ và yêu cầu quá trình `VACUUM` (trong PostgreSQL) hoặc `OPTIMIZE TABLE` (trong MySQL) để dọn dẹp không gian.

---

## 2. LSM-Tree (Log-Structured Merge-Tree)

LSM-Tree ra đời như một giải pháp cứu cánh cho các hệ thống yêu cầu tốc độ ghi khổng lồ (write-intensive) như ứng dụng chat, time-series, log monitoring. Đây là cấu trúc cốt lõi của **Cassandra, HBase, RocksDB, LevelDB, ClickHouse**.

### 2.1. Cơ chế hoạt động

Thay vì cập nhật tại chỗ như B-Tree, LSM-Tree biến mọi thao tác ghi, sửa, và xóa thành **ghi nối tiếp (Append-only)**.

1.  **Write-Ahead Log (WAL):** Khi có dữ liệu mới, hệ thống trước tiên ghi nối tiếp vào một tệp log trên đĩa để đảm bảo không mất dữ liệu nếu xảy ra sự cố sập nguồn (crash). Thao tác này cực kỳ nhanh vì sử dụng đĩa theo kiểu tuần tự (Sequential I/O).
2.  **MemTable:** Sau khi ghi vào WAL, dữ liệu được đẩy vào một cấu trúc dữ liệu dạng cây nằm trên bộ nhớ RAM (gọi là MemTable, thường là Red-Black Tree hoặc Skip List).
3.  **SSTable (Sorted String Table):** Khi MemTable đạt kích thước giới hạn (VD: 32MB - 64MB), nó sẽ được "đóng băng" và xả (flush) xuống đĩa tạo thành một file gọi là SSTable. SSTable là **bất biến (immutable)** - dữ liệu bên trong đã được sắp xếp theo khóa và không bao giờ bị sửa đổi.
4.  **Compaction (Hợp nhất):** Theo thời gian, sẽ có hàng chục đến hàng trăm file SSTable trên đĩa. Một tiến trình chạy ngầm gọi là Compaction sẽ tiến hành gộp nhiều SSTable cũ lại với nhau. Quá trình này sẽ giữ lại bản ghi mới nhất, loại bỏ các bản ghi đã bị xóa (được đánh dấu bằng một cờ *tombstone*) hoặc ghi đè, sau đó tạo ra các SSTable mới và xóa các SSTable cũ.

### 2.2. Ưu điểm
*   **Tốc độ ghi siêu hạng:** Việc ghi dữ liệu vào LSM-Tree chỉ là thao tác ghi vào bộ nhớ (RAM) và ghi nối tiếp vào cuối file log (Sequential Disk I/O). Việc này không tốn chi phí tìm kiếm hay cập nhật page ngẫu nhiên như B-Tree, giúp Write Throughput cao hơn gấp nhiều lần.
*   **Tỷ lệ nén tốt hơn:** Vì file SSTable là bất biến và không có các khoảng trống do hiện tượng page splitting như của B-Tree, dữ liệu được đóng gói chặt chẽ và nén rất hiệu quả.

### 2.3. Nhược điểm
*   **Tốc độ đọc chậm hơn và không ổn định:** Để đọc một bản ghi, hệ thống phải kiểm tra trong MemTable trước. Nếu không tìm thấy, nó phải dò tìm ở nhiều file SSTables trên đĩa (từ mới nhất đến cũ nhất). Dù có sử dụng **Bloom Filters** để nhanh chóng bỏ qua các SSTable không chứa key đó, chi phí đọc vẫn cao hơn đáng kể so với B-Tree.
*   **Xung đột I/O do Compaction:** Tiến trình Compaction chạy ngầm tiêu tốn rất nhiều CPU và Disk I/O. Khi hệ thống đang có tải ghi rất lớn, tiến trình này có thể làm ảnh hưởng hiệu suất chung của hệ thống, gây ra những "cú giật" về độ trễ (latency spikes) cho cả thao tác đọc và ghi.

---

## 3. Các Khái Niệm Amplification (Hệ số khuếch đại)

Khi đánh giá hiệu suất của Storage Engines, các kỹ sư hệ thống thường xem xét ba loại Amplification:

1.  **Write Amplification (Khuếch đại Ghi):** Tỉ lệ giữa lượng dữ liệu vật lý thực tế được ghi xuống đĩa so với lượng dữ liệu logic mà ứng dụng yêu cầu ghi.
    *   **LSM-Tree:** Có Write Amplification rất cao. Một bản ghi có thể bị ghi lại hàng chục lần xuống đĩa trong suốt vòng đời của nó do các quá trình Compaction (khi các SSTable liên tục được hợp nhất).
    *   **B-Tree:** Cũng có Write Amplification ở mức vừa phải. Mỗi khi thay đổi 1 byte, hệ thống vẫn phải ghi lại toàn bộ một Page (VD: 4KB - 8KB) cùng với việc ghi nhật ký vào WAL.
2.  **Read Amplification (Khuếch đại Đọc):** Số lần phải đọc từ đĩa vật lý (I/O) để phục vụ cho một thao tác đọc logic.
    *   **LSM-Tree:** Rất cao. Một thao tác tìm kiếm khóa duy nhất có thể yêu cầu mở và rà soát nhiều file SSTable khác nhau trên đĩa.
    *   **B-Tree:** Thấp và rất dễ dự đoán. Nó chỉ phụ thuộc vào chiều sâu của cây B-Tree, thông thường chỉ tốn tối đa 3-4 lần disk reads.
3.  **Space Amplification (Khuếch đại Không gian):** Lượng dung lượng đĩa thực tế tiêu tốn để lưu trữ so với kích thước logic của dữ liệu.
    *   **LSM-Tree:** Đòi hỏi nhiều dung lượng trống tạm thời trong quá trình Compaction (cần không gian để ghi file mới trước khi xoá file cũ). Mặc dù bản thân các file nén rất tốt. Dữ liệu rác/cũ có thể tồn tại lâu trước khi bị dọn dẹp.
    *   **B-Tree:** Do tình trạng phân mảnh (fragmentation), các page thường không bao giờ chứa 100% dữ liệu (thường để lại khoảng 20-30% trống để dành cho các thao tác updates/inserts tương lai), dẫn đến Space Amplification cũng đáng kể.

---

## 4. Tổng Kết Bảng So Sánh

| Đặc điểm | B-Tree | LSM-Tree |
| :--- | :--- | :--- |
| **Bản chất** | Cập nhật tại chỗ (In-place updates) | Ghi nối tiếp (Append-only) và Hợp nhất |
| **Cấu trúc lưu trữ** | Cây cân bằng, phân mảnh theo các Pages/Blocks | MemTable (RAM) + SSTables (Disk) |
| **Cách thức truy xuất Đĩa (Disk I/O)** | Đọc / Ghi ngẫu nhiên (Random I/O) | Đọc / Ghi tuần tự (Sequential I/O) |
| **Tốc độ Đọc (Read Performance)** | Rất nhanh, độ trễ thấp và dự đoán được ($O(\log N)$) | Chậm hơn, độ trễ biến động, phụ thuộc số lượng SSTable |
| **Tốc độ Ghi (Write Performance)** | Chậm hơn dưới tải nặng (do chi phí Page Split) | Cực kì nhanh, thông lượng (throughput) khổng lồ |
| **Read Amplification** | Thấp | Cao |
| **Write Amplification** | Vừa phải | Rất cao (do Compaction) |
| **Space Amplification** | Cao (do rỗng và phân mảnh trong Page) | Thấp (Dữ liệu đặc và nén chặt, ít khoảng trống) |
| **Quản lý không gian** | Xử lý bằng Page Split và Vacuum (dọn dẹp phân mảnh) | Dọn dẹp rác định kỳ thông qua Compaction |
| **Trường hợp sử dụng (Use Cases)** | Dữ liệu giao dịch truyền thống, OLTP (MySQL, PostgreSQL). Yêu cầu cân bằng giữa Đọc - Ghi. | Event Logging, Time-Series DB, NoSQL, Write-heavy workloads (Cassandra, HBase). |

> **Tóm lại:**
>
> 💡 Sử dụng **B-Tree** khi hệ thống của bạn thực hiện nhiều thao tác **Đọc (Read-Heavy)**, hoặc yêu cầu một mức độ phản hồi ổn định nhất, hỗ trợ tốt cho các truy vấn Range Query, và đặc biệt là trong các hệ thống đòi hỏi tính ACID giao dịch khắt khe.
>
> 💡 Sử dụng **LSM-Tree** khi hệ thống đối mặt với tải **Ghi (Write-Heavy)** liên tục và khổng lồ, nơi mà băng thông (throughput) của việc chèn/lưu trữ dữ liệu được ưu tiên cao nhất, như lưu trữ metrics, logs, hoặc các dữ liệu phân tích dạng time-series.

## Tài Liệu Tham Khảo
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
