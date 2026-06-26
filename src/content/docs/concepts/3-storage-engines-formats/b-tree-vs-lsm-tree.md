---
title: "B-Tree vs LSM-Tree"
difficulty: "Advanced"
readingTime: "15 mins"
lastUpdated: 2026-06-26
seoTitle: "B-Tree vs LSM-Tree: Kiến Trúc Lưu Trữ & Đánh Đổi Hệ Thống"
metaDescription: "Phân tích kiến trúc cốt lõi của Storage Engines: B-Tree (Tối ưu Read) và LSM-Tree (Tối ưu Write). Đi sâu vào các Trade-off hệ thống, Amplification Triad và cấu hình thực chiến."
description: "Phân tích kiến trúc cốt lõi của Storage Engines: B-Tree (Tối ưu Read) và LSM-Tree (Tối ưu Write). Đi sâu vào các Trade-off hệ thống, Amplification Triad và cấu hình thực chiến."
---

Lựa chọn Storage Engine là quyết định thiết kế kiến trúc quan trọng bậc nhất, ảnh hưởng trực tiếp đến hiệu năng, chi phí vận hành và tính ổn định của hệ thống dữ liệu. Ở tầng vật lý, gần như tất cả các cơ sở dữ liệu hiện đại đều dựa trên một trong hai họ cấu trúc dữ liệu cốt lõi: **B-Tree** (và các biến thể như B+Tree) hoặc **LSM-Tree** (Log-Structured Merge-Tree).

Bài viết này không dừng lại ở định nghĩa cơ bản, mà mổ xẻ sâu vào **Kiến trúc Thực thi Vật lý (Physical Execution)**, **Amplification Triad (Hệ số khuếch đại)**, và các **Rủi ro Vận hành (Operational Risks)** từ góc nhìn của một Kỹ sư Hệ thống.

---

## 1. Kiến Trúc Thực Thi Vật Lý (Physical Execution)

### 1.1. B-Tree: Triết lý "Cập nhật tại chỗ" (In-place Updates)

B-Tree (đặc biệt là B+Tree) là xương sống của các hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) truyền thống như MySQL (InnoDB), PostgreSQL, và Oracle. Thiết kế của nó nhắm đến việc tối ưu hóa độ trễ đọc (Read Latency) và hỗ trợ các truy vấn dải (Range Queries).

**Cơ chế hoạt động ở tầng đĩa:**

B-Tree chia không gian đĩa thành các khối (blocks) hoặc trang (pages) có kích thước cố định (thường là 4KB đến 16KB). Các node của cây được ánh xạ trực tiếp vào các pages này. 

Khi một truy vấn `UPDATE` hoặc `INSERT` diễn ra:
1. Hệ thống tìm page chứa dữ liệu trên đĩa bằng cách duyệt từ Root node xuống Leaf node.
2. Tải page đó vào RAM (Buffer Pool).
3. Sửa đổi dữ liệu trên page trong RAM.
4. Ghi lại (Overwrite) toàn bộ page đó xuống đĩa.

```mermaid
graph TD
    Root["Root Node - Page 0"] --> Branch1["Branch Node - Page 1"]
    Root --> Branch2["Branch Node - Page 2"]
    Branch1 --> Leaf1["Leaf Node - Page 3: Khóa 1-10"]
    Branch1 --> Leaf2["Leaf Node - Page 4: Khóa 11-20"]
    Branch2 --> Leaf3["Leaf Node - Page 5: Khóa 21-30"]
    
    style Leaf1 fill:#f9f,stroke:#333,stroke-width:2px
    style Leaf2 fill:#f9f,stroke:#333,stroke-width:2px
    style Leaf3 fill:#f9f,stroke:#333,stroke-width:2px
```

**Tại sao In-place update lại đắt đỏ (Write Penalty)?**
Do các page có kích thước cố định, nếu bạn chèn thêm một bản ghi vào một page đã đầy, B-Tree bắt buộc phải chia page đó làm hai (hiện tượng **Page Split**). Điều này kéo theo việc cập nhật lại các con trỏ ở node cha. Thao tác này sinh ra rất nhiều Random I/O trên đĩa, làm suy giảm nghiêm trọng thông lượng ghi (Write Throughput) khi hệ thống chịu tải cao.

---

### 1.2. LSM-Tree: Triết lý "Ghi nối tiếp" (Append-only)

Khi đối mặt với các tải dữ liệu khổng lồ như Event Logging, Time-Series Data, hay hệ thống Chat (nơi lượng Insert áp đảo lượng Read), B-Tree nhanh chóng trở thành nút thắt cổ chai do Random Disk I/O. **LSM-Tree** ra đời để giải bài toán này bằng cách biến mọi thao tác ghi (kể cả Update và Delete) thành thao tác ghi nối tiếp (Sequential I/O).

Các Database tiêu biểu dùng LSM-Tree: Cassandra, RocksDB, ScyllaDB, InfluxDB, HBase.

**Luồng dữ liệu (Data Pipeline) của LSM-Tree:**

```mermaid
flowchart LR
    Client("(Client")) --> |1. Write| WAL["Write-Ahead Log<br/>Disk - Sequential"]
    Client --> |2. Write| MemTable["MemTable<br/>RAM - Balanced Tree"]
    MemTable --> |3. Flush when full| SST1["SSTable L0<br/>Disk - Immutable"]
    SST1 --> |4. Compaction| SST2["SSTable L1<br/>Disk - Merged"]
    
    style MemTable fill:#bbf,stroke:#333,stroke-width:2px
    style WAL fill:#f96,stroke:#333,stroke-width:2px
    style SST1 fill:#dfd,stroke:#333,stroke-width:2px
    style SST2 fill:#dfd,stroke:#333,stroke-width:2px
```

1. **Write-Ahead Log (WAL):** Dữ liệu đến được ghi nối tiếp vào cuối một file log trên đĩa. Thao tác này cực nhanh vì nó là Sequential I/O, dùng để chống mất dữ liệu khi sập nguồn.
2. **MemTable:** Dữ liệu được đưa vào một cấu trúc cây cân bằng (như Red-Black Tree hoặc Skip List) nằm trên RAM. 
3. **SSTable (Sorted String Table):** Khi MemTable đạt kích thước ngưỡng (ví dụ 64MB), nó bị đóng băng và xả (flush) xuống đĩa thành một file SSTable. File này là **Bất biến (Immutable)**.
4. **Compaction:** Theo thời gian, hệ thống sẽ sinh ra hàng ngàn SSTable. Một tiến trình chạy nền (Compaction) sẽ liên tục đọc các SSTable cũ, trộn chúng lại (Merge Sort), loại bỏ các bản ghi bị xóa (tombstones) hoặc bị ghi đè, và tạo ra các SSTable lớn hơn ở tầng sâu hơn.

---

## 2. Hệ Số Khuếch Đại (The Amplification Triad)

Khi tinh chỉnh hệ thống lưu trữ, các Data Engineer phải cân bằng giữa 3 loại hệ số khuếch đại (Amplification). Không có cấu trúc nào hoàn hảo ở cả 3 mặt.

| Loại Amplification | Ý nghĩa hệ thống | B-Tree | LSM-Tree |
| :--- | :--- | :--- | :--- |
| **Write Amplification** | Lượng byte ghi xuống đĩa / Lượng byte logic cần ghi. Ảnh hưởng tuổi thọ SSD và băng thông đĩa. | **Vừa phải**. Khi sửa 1 byte, phải ghi đè cả Page (4-16KB) + ghi WAL. | **Cao**. Do quá trình Compaction, một dữ liệu có thể bị đọc lên ghi xuống (merged) hàng chục lần. |
| **Read Amplification** | Số lượng disk reads / Lượng đọc logic. Ảnh hưởng trực tiếp đến Read Latency. | **Rất Thấp**. Tối đa bằng độ sâu của cây (thường 3-4 thao tác). | **Cao**. Có thể phải đọc nhiều SSTables, kiểm tra Bloom Filters, và dò MemTable. |
| **Space Amplification** | Kích thước đĩa / Kích thước logic. Ảnh hưởng tới chi phí lưu trữ (FinOps). | **Cao**. Do hiện tượng phân mảnh (Fragmentation) và các khoảng trống dự phòng trong page. | **Thấp**. File bất biến được nén (Snappy, LZ4) rất chặt chẽ, tối đa hóa mật độ dữ liệu. |

---

## 3. Rủi Ro Vận Hành & Tình Huống Sập Hệ Thống

### 3.1. B-Tree: Rủi ro Phân mảnh (Fragmentation)

Trong các hệ thống RDBMS chạy lâu năm với cường độ DELETE/UPDATE lớn, các page của B-Tree sẽ bị "rỗ". Không gian trống bên trong page (Internal Fragmentation) tăng lên, dẫn đến Disk I/O tăng cao do hệ thống phải đọc nhiều page hơn để lấy cùng một lượng bản ghi.

*   **Triệu chứng:** Câu lệnh `SELECT` tốn nhiều I/O hơn, độ trễ tăng dần theo thời gian dù số lượng bản ghi không tăng.
*   **Cách khắc phục:** Cần thực hiện `VACUUM FULL` (PostgreSQL) hoặc `OPTIMIZE TABLE` (MySQL). Cảnh báo: Các thao tác này thường block table hoặc tiêu tốn tài nguyên khổng lồ, cần lên lịch vào giờ thấp điểm.

### 3.2. LSM-Tree: Ác Mộng Cổ Chai Compaction (Compaction Stalling)

Đây là cơn ác mộng kinh điển của các hệ thống dùng Cassandra hoặc RocksDB. 
Khi tốc độ xả MemTable xuống đĩa (Flush) nhanh hơn khả năng tiến trình Compaction gộp các file SSTable, số lượng SSTable ở Level 0 (L0) sẽ tăng vọt.

*   **Triệu chứng (Write Stall):** Khi số lượng L0 SSTable vượt ngưỡng nguy hiểm (ví dụ: `level0_slowdown_writes_trigger` trong RocksDB), hệ thống sẽ cố tình bóp nghẹt tốc độ ghi (Throttling) hoặc từ chối hoàn toàn thao tác ghi (Stop-the-world) để Compaction đuổi kịp. Hệ quả là API chèn dữ liệu bị Timeout hàng loạt, Kafka Consumer Lag tăng đột biến.
*   **Triệu chứng Read (Read Amplification Spike):** Số file SSTable nhiều khiến các câu truy vấn Read phải dò qua hàng tá file, làm tăng độ trễ đọc một cách chóng mặt.

**Khắc phục bằng cấu hình thực chiến (RocksDB Example):**

Thay vì dùng cấu hình mặc định, cần can thiệp vào RocksDB properties để cân bằng tốc độ flush và compaction:

```ini
# Tăng số lượng thread chạy Compaction và Flush
max_background_compactions=4
max_background_flushes=2

# Tăng kích thước MemTable để giảm tần suất flush
write_buffer_size=134217728 # 128MB
max_write_buffer_number=4

# Mở rộng ngưỡng gây Write Stall để chịu tải đột biến (Burst Traffic)
level0_slowdown_writes_trigger=20
level0_stop_writes_trigger=36
```

### 3.3. LSM-Tree: Quản lý Bộ nhớ (OOMKilled)

Mọi cấu trúc LSM-Tree đều duy trì MemTable và Block Cache trên RAM. Nếu không khống chế giới hạn cấp phát bộ nhớ (đặc biệt trong môi trường Kubernetes container), tiến trình cơ sở dữ liệu sẽ dễ dàng bị hệ điều hành đóng băng hoặc "bắn bỏ" (OOMKilled - Out Of Memory). Bạn phải cấu hình chặt chẽ giới hạn bộ nhớ dùng chung (ví dụ: sử dụng bộ đệm chung `LRUCache` cho cả Block Cache và giới hạn MemTable).

---

## 4. Tổng Kết Cấu Trúc Đánh Đổi (Systemic Trade-offs)

Quyết định chọn B-Tree hay LSM-Tree không nằm ở việc cái nào "nhanh hơn", mà nằm ở việc bạn **chấp nhận hy sinh điều gì**:

1.  **Latency vs Throughput:**
    *   B-Tree hi sinh thông lượng ghi (Write Throughput) để đảm bảo độ trễ đọc siêu thấp và cực kỳ ổn định (Predictable Latency). Nó là trái tim của hệ thống OLTP, Payment gateways.
    *   LSM-Tree hi sinh sự ổn định của độ trễ (sinh ra Latency Spikes do quá trình Compaction) để đạt được băng thông ghi khổng lồ. Nó sinh ra cho Data Ingestion từ IoT, Clickstream, Logs.
2.  **Storage Cost vs Compute Cost:**
    *   B-Tree tiêu tốn nhiều dung lượng đĩa hơn (Space Amplification cao) nhưng ít hao tốn CPU chạy nền.
    *   LSM-Tree lưu trữ cực kỳ tối ưu, nén dữ liệu rất chặt (tiết kiệm SSD hiệu quả), nhưng đổi lại nó "đốt" CPU liên tục cho quá trình gộp (Compaction).

Việc hiểu sâu đến tầng vật lý giúp Data Engineer không chỉ chọn đúng công cụ ngay từ đầu, mà còn làm chủ được hệ thống khi phải đối mặt với các sự cố vỡ tải trong thực tế.

---

## Nguồn Tham Khảo
*   [Designing Data-Intensive Applications - Chapter 3: Storage and Retrieval](https://dataintensive.net/)
*   [RocksDB Tuning Guide - GitHub Wiki](https://github.com/facebook/rocksdb/wiki/RocksDB-Tuning-Guide)
*   [How we use RocksDB at Cloudflare](https://blog.cloudflare.com/how-we-use-rocksdb-at-cloudflare/)
*   [ScyllaDB Architecture: LSM-Tree](https://docs.scylladb.com/stable/architecture/architecture-lsm.html)
