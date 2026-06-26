---
title: "Azure Synapse Analytics: MPP, Polaris Engine & System Trade-offs"
difficulty: "Advanced"
tags: ["azure", "data-warehouse", "big-data", "synapse", "cloud", "mpp"]
readingTime: "25 mins"
lastUpdated: 2026-06-26
seoTitle: "Azure Synapse Analytics Architecture - MPP, Polaris Engine & Trade-offs"
metaDescription: "Deep dive into Azure Synapse Analytics architecture. Exploring Dedicated SQL Pool (MPP), Serverless SQL (Polaris Engine), Data Movement Service, and system trade-offs."
description: "Vượt qua những định nghĩa marketing, bài viết này mổ xẻ kiến trúc vật lý bên dưới Azure Synapse Analytics: Cách MPP phân tán dữ liệu, Polaris Engine tách biệt Compute/State, và những cạm bẫy dẫn đến sập hệ thống (Spill-to-disk, Data Skew)."
---

Trong các doanh nghiệp lớn, dữ liệu thường bị phân mảnh: dữ liệu có cấu trúc ổn định nằm trong Data Warehouse (phục vụ BI), còn dữ liệu phi cấu trúc khổng lồ nằm rải rác trên Data Lake (phục vụ ML/AI). **Azure Synapse Analytics** ra đời với tham vọng hợp nhất (Unified) hai thế giới này. 

Tuy nhiên, đằng sau lớp vỏ bọc giao diện "All-in-one" (Synapse Studio), Synapse thực chất vận hành dựa trên các Engine điện toán hoàn toàn khác biệt nhau về mặt kiến trúc vật lý. Đối với một Data Engineer, việc hiểu nhầm hoặc chọn sai Engine/Chiến lược phân bổ dữ liệu sẽ dẫn đến thảm họa về hiệu năng và chi phí.

---

## 1. Kiến trúc Vật lý: Hai thế giới của Synapse SQL

Thay vì cung cấp một Engine duy nhất, Synapse phân mảnh sức mạnh tính toán của mình thành các Pool chuyên biệt. Trong phạm vi SQL, Synapse tồn tại hai kiến trúc cốt lõi với triết lý thiết kế đối lập nhau:

1. **Dedicated SQL Pool (trước đây là Azure SQL DW):** Kiến trúc **MPP (Massively Parallel Processing)** kinh điển, yêu cầu cấp phát tài nguyên tĩnh (Provisioned) qua các Data Warehouse Units (DWUs). Compute và Storage được tách biệt nhưng Compute nodes là cố định và quản lý trạng thái cục bộ (local tempdb).
2. **Serverless SQL Pool:** Thế hệ Engine phân tán mới mang tên **Polaris Engine**. Nó hoàn toàn phi máy chủ (serverless), thu phóng động (auto-scaling) theo từng câu truy vấn và đọc dữ liệu trực tiếp từ Data Lake (Data Lakehouse architecture).

---

## 2. Dedicated SQL Pool: Kiến trúc MPP và Bài toán "60 Phân vùng"

Để tối ưu hóa Dedicated SQL Pool, kỹ sư bắt buộc phải hiểu cơ chế hoạt động của kiến trúc MPP. Không giống như SMP (Symmetric Multiprocessing) trên SQL Server truyền thống, MPP chia nhỏ khối lượng công việc.

### 2.1. Cấu phẫu Kiến trúc MPP

```mermaid
architecture-beta
    group synapse("cloud")[Azure Synapse Dedicated Pool]
    
    service control("server")[Control Node] in synapse
    service compute1("server")[Compute Node 1] in synapse
    service compute2("server")[Compute Node n] in synapse
    service dms("network")[Data Movement Service] in synapse
    
    service db1("database")[Distribution 1..x] in synapse
    service db2("database")[Distribution y..60] in synapse
    service storage("disk")[Azure Storage] in synapse

    control:R --> L:compute1
    control:R --> L:compute2
    compute1:B --> T:dms
    compute2:B --> T:dms
    
    compute1:R --> L:db1
    compute2:R --> L:db2
    db1:B --> T:storage
    db2:B --> T:storage
```

*   **Control Node:** Não bộ của hệ thống. Chịu trách nhiệm nhận câu T-SQL, biên dịch thành kế hoạch thực thi phân tán (Distributed Execution Plan) và điều phối công việc xuống các Compute Nodes.
*   **Compute Nodes:** Các công nhân xử lý dữ liệu. Số lượng node phụ thuộc vào mức DWU bạn mua (Ví dụ: DW1000c có thể có ít node hơn DW30000c).
*   **Data Movement Service (DMS):** *Đây là nút thắt cổ chai lớn nhất.* DMS là dịch vụ điều phối việc di chuyển dữ liệu (Network Shuffle) giữa các Compute Nodes khi thực hiện các phép JOIN phức tạp không nằm trên cùng một Node.
*   **60 Distributions (Phân vùng cố định):** Bất kể bạn cấp phát bao nhiêu Compute Node, dữ liệu trong Synapse Dedicated Pool **luôn luôn được chia thành 60 logical distributions** (vùng phân bổ). Các Compute Node sẽ chia nhau quản lý 60 vùng này (Ví dụ: Có 6 Compute nodes thì mỗi node quản lý 10 distributions).

### 2.2. Chiến lược Phân phối (Distribution Strategies) & Trade-offs

Việc bạn map dữ liệu vào 60 distributions này quyết định 90% sinh mạng của hệ thống.

1.  **Hash Distribution (Băm theo cột):** Dữ liệu được băm (hash) dựa trên một cột khóa (Distribution Key) và đưa vào 60 vùng.
    *   *Best for:* Bảng Fact khổng lồ (hàng tỷ dòng).
    *   *Trade-off:* Nếu chọn sai cột khóa (ví dụ cột có nhiều giá trị `NULL` hoặc độ phân tán thấp - Low Cardinality), sẽ xảy ra hiện tượng **Data Skew**. Một Compute Node sẽ ôm đồm quá nhiều dữ liệu và trở thành *straggler* (kẻ chậm chạp), kéo lùi toàn bộ hệ thống.
2.  **Round-Robin (Xoay vòng):** Dữ liệu được chia đều vào 60 vùng một cách ngẫu nhiên.
    *   *Best for:* Bảng Staging tạm thời, tải dữ liệu nhanh.
    *   *Trade-off:* Khi JOIN, hệ thống bắt buộc phải kích hoạt DMS để Broadcast hoặc Shuffle dữ liệu qua mạng, gây tốn I/O và tăng Latency đột biến.
3.  **Replicated (Nhân bản):** Copy toàn bộ dữ liệu ra tất cả các Compute Nodes.
    *   *Best for:* Bảng Dimension nhỏ (dưới 2GB).
    *   *Trade-off:* Tốn dung lượng lưu trữ và chi phí cập nhật (khi update bảng Replicate, hệ thống phải đồng bộ trên tất cả các node). Nhưng bù lại, loại bỏ hoàn toàn Network Shuffle khi JOIN.

---

## 3. Rủi ro Vận hành: Data Skew và OOM TempDB (Spill-to-disk)

Một trong những sự cố tồi tệ nhất khi vận hành Dedicated SQL Pool là tràn bộ nhớ tạm (`TempDB Spill`).

**Kịch bản sập hệ thống (The Incident):**
Bạn thực hiện một lệnh `JOIN` giữa bảng `Sales` (Hash phân phối theo `Store_ID`) và bảng `Customers` (Hash phân phối theo `Region_ID`).
Vì khóa phân phối không khớp, Control Node buộc phải gọi DMS thực hiện lệnh `ShuffleMove` để gom dữ liệu lại trước khi JOIN. Đồng thời, bảng `Sales` bị Skew cực nặng (Một Store khổng lồ chiếm 40% doanh thu).
-> Compute Node xử lý Store khổng lồ đó bị cạn kiệt RAM được cấp phát. Nó buộc phải tràn dữ liệu xuống ổ đĩa cục bộ (TempDB). 
-> TempDB đầy 100%. Toàn bộ Data Warehouse bị kẹt (Lock/Blocked), các tác vụ của user khác cũng bị fail với lỗi *“Out of space in TempDB”*.

**Cách khắc phục & Bắt lỗi bằng SQL:**
Tuyệt đối không cấp phát thêm DWU ngay lập tức (ném tiền qua cửa sổ). Cần check Data Skew bằng query:

```sql
-- Kiểm tra mức độ Skewness của một bảng
DBCC PDW_SHOWSPACEUSED('dbo.FactSales');

-- Hoặc truy vấn trực tiếp vào DMV để xem dữ liệu dồn vào Distribution nào
SELECT 
    pnp.pdw_node_id,
    pnp.distribution_id,
    COUNT(*) as row_count,
    SUM(row_count) OVER() as total_rows,
    CAST(COUNT(*) * 100.0 / SUM(row_count) OVER() AS DECIMAL(5,2)) AS percentage_of_total
FROM sys.pdw_nodes_partitions pnp
JOIN sys.pdw_nodes_tables pnt 
    ON pnp.object_id = pnt.object_id 
    AND pnp.pdw_node_id = pnt.pdw_node_id
JOIN sys.pdw_table_mappings ptm 
    ON pnt.name = ptm.physical_name
WHERE ptm.object_id = OBJECT_ID('dbo.FactSales')
GROUP BY pnp.pdw_node_id, pnp.distribution_id
ORDER BY row_count DESC;
```
*Action:* Nếu thấy `percentage_of_total` của một vài node lên tới 10-20% (thay vì ~1.6% lý tưởng cho 1/60), hãy dùng lệnh `CREATE TABLE AS SELECT (CTAS)` để đổi Distribution Key sang một cột có độ phân tán cao hơn (ví dụ: `Transaction_ID` hoặc phối hợp nhiều cột).

---

## 4. Serverless SQL Pool: Kiến trúc Polaris Engine (The Future)

Nhận thấy hạn chế của việc cấp phát phần cứng tĩnh và local TempDB ở Dedicated Pool, Microsoft đã thiết kế ra **Polaris Engine** – động cơ điện toán đám mây gốc (Cloud-native) cung cấp sức mạnh cho Serverless SQL.

```mermaid
flowchart TD
    Client["SQL Client / BI Tool"] --> Gateway["Control Node / Gateway"]
    
    subgraph Polaris Distributed Execution
        QueryOpt["Distributed Query Optimizer"]
        TaskGen["Task Generator"]
    end
    
    Gateway --> QueryOpt
    QueryOpt --> TaskGen
    
    subgraph Compute Pool("Stateless Workers")
        Worker1["Worker Node"]
        Worker2["Worker Node"]
        WorkerN["Worker Node N"]
    end
    
    TaskGen -->|Fine-grained Tasks| Worker1
    TaskGen -->|Fine-grained Tasks| Worker2
    TaskGen -->|Fine-grained Tasks| WorkerN
    
    subgraph Data Lake("Storage")
        Delta["Delta Lake / Parquet Files"]
    end
    
    Worker1 -->|Read| Delta
    Worker2 -->|Read| Delta
    WorkerN -->|Read| Delta
```

### 4.1. Tách biệt Compute và State hoàn toàn
Trong Polaris, các Worker Nodes hoàn toàn không lưu trạng thái (Stateless). Chúng không có TempDB cục bộ gắn liền với phần cứng vật lý. Dữ liệu trung gian được đổ ngược ra một lớp Storage phân tán tốc độ cao. Nếu một Worker Node bị chết giữa chừng, Control Node chỉ việc giao Task đó cho Node khác làm lại mà không làm hỏng toàn bộ Query.

### 4.2. Khái niệm "Cell" Abstraction
Polaris chia nhỏ khối lượng công việc thành các **Cells** (các tác vụ cực nhỏ). Khi bạn query một file Parquet 100GB, Polaris không gán tĩnh file đó cho 1 Node, mà chia nó thành hàng ngàn Cells. Một cụm hàng trăm Worker Nodes sẽ liên tục "nhặt" các Cells này để xử lý. Nếu dữ liệu bị lệch (Skew), kiến trúc Cell sẽ tự động cân bằng tải (Dynamic Load Balancing) – Node nào rảnh sẽ nhặt thêm Cell, giải quyết triệt để vấn đề Data Skew kinh niên của kiến trúc MPP cũ.

### 4.3. Trade-offs của Serverless SQL
*   **Pros:** Khởi động lập tức (Zero-warmup), chi phí cực thấp (trả tiền theo TB dữ liệu quét, ~$5/TB), truy vấn thẳng vào Data Lake (Zero-ETL).
*   **Cons:** Phụ thuộc vào tốc độ mạng (Network I/O) và định dạng file. Nếu bạn query hàng triệu file `.csv` nhỏ (Small Files Problem) thay vì file `.parquet` được nén Snappy/ZSTD với Z-Ordering, Polaris sẽ phải quét qua toàn bộ siêu dữ liệu, khiến Query chạy chậm như rùa bò và tiêu tốn hàng đống tiền.

---

## 5. Tổng kết: Bước đệm tiến tới Microsoft Fabric

Azure Synapse Analytics là một cỗ máy khổng lồ. Tuy nhiên, kiến trúc Dedicated SQL Pool (MPP) đang dần trở thành "di sản" (Legacy) do chi phí duy trì cao và độ khó trong việc tinh chỉnh (Distribution, Indexing, Statistics).

Nhận thấy tương lai nằm ở sự linh hoạt, Microsoft đã lấy **Polaris Engine** của Synapse Serverless, nâng cấp nó để hỗ trợ chuẩn ACID Transactions trên Delta Lake (Lakehouse), và cho ra mắt **Microsoft Fabric**. Trong Fabric Data Warehouse, bạn có được hiệu năng của Dedicated Pool nhưng với sự tự động hóa thu phóng (Auto-scaling) phi máy chủ của Polaris, tất cả chạy trên một chuẩn dữ liệu mở duy nhất: OneLake (Parquet/Delta).

Việc am hiểu sự đánh đổi giữa Network Shuffle, Data Skew và Spill-to-disk trong Synapse sẽ trang bị cho bạn tư duy thiết kế hệ thống vững chắc để chinh phục bất kỳ kiến trúc Data Platform hiện đại nào.

---

## 6. Nguồn Tham Khảo

1.  [Azure Synapse Analytics Dedicated SQL pool (formerly SQL DW) architecture](https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/massively-parallel-processing-mpp-architecture) - Microsoft Learn.
2.  [Polaris: The Distributed SQL Engine in Azure Synapse (VLDB Paper)](https://vldb.org/pvldb/vol13/p3204-saborit.pdf) - Chi tiết kỹ thuật về kiến trúc State/Compute Separation.
3.  [Distributed Tables - Hash, Round-Robin, and Replicate](https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/sql-data-warehouse-tables-distribute) - Microsoft Learn.
4.  [Troubleshooting TempDB errors in Dedicated SQL Pool](https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/sql-data-warehouse-manage-monitor#monitor-tempdb) - Cẩm nang tối ưu hóa I/O và Data Skew.
