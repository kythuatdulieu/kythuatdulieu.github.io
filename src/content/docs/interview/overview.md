---
title: Ngân hàng Phỏng vấn (Interview)
description: Cẩm nang toàn tập về các chủ đề, kiến trúc, và kỹ thuật chuyên sâu dùng trong phỏng vấn Data Engineering từ cơ bản đến nâng cao
sidebar:
  label: Tổng quan
  order: 1
---



Trong kỷ nguyên dữ liệu hiện đại, vai trò của Data Engineer (DE) không chỉ dừng lại ở việc di chuyển dữ liệu đơn thuần (ETL/ELT). Kỹ sư Dữ liệu ngày nay thực chất là những Kỹ sư Phần mềm (Software Engineers) chuyên sâu về **hệ thống phân tán (Distributed Systems)**, **xử lý dữ liệu lớn (Big Data Processing)**, và **tối ưu hóa chi phí điện toán (Cost-efficiency Optimization)**. 

Tuyển tập các câu hỏi phỏng vấn [Data Engineering](/concepts/1-distributed-systems-architecture/data-engineering) này được thiết kế theo format chuẩn của các công ty công nghệ hàng đầu (FAANG, Grab, Gojek, VNG, ...), tập trung vào các trụ cột cốt lõi:

- **System Design & Architecture**: Thiết kế kiến trúc luồng dữ liệu, đánh giá trade-off, xử lý sự cố ở quy mô Petabyte.
- **Advanced SQL & Data Modeling**: Tối ưu hóa truy vấn chuyên sâu, phân tích Execution Plan, và thiết kế mô hình dữ liệu (Kimball, Data Vault).
- **Spark & Distributed Computing**: Hiểu biết thấu đáo về cơ chế phân tán, quản lý bộ nhớ, Catalyst Optimizer, và các chiến lược xử lý Data Skew.
- **Kafka & Real-time Streaming**: Thiết kế hệ thống thời gian thực, hiểu rõ internals của Kafka (Zero-copy, ISR, Exactly-once semantics).
- **Orchestration, CI/CD & DataOps**: Quản lý quy trình làm việc (Airflow, Dagster), áp dụng CI/CD cho mã nguồn dữ liệu, và quản trị Data Quality.

Bài viết này cung cấp một cái nhìn tổng quan, sâu sắc và mang tính kỹ thuật cao, đóng vai trò là "la bàn" định hướng cho bạn trong suốt quá trình chuẩn bị cho các vòng phỏng vấn khó nhằn từ mức độ Mid-level đến Senior/Staff.

---

## 1. System Design: Kiến Trúc Dữ Liệu Ở Quy Mô Lớn (Data Architecture at Scale)

Vòng System Design không có câu trả lời đúng tuyệt đối. Phỏng vấn viên đánh giá cách bạn thu thập yêu cầu hệ thống (Gathering Requirements), phân tích thiết kế, và đặc biệt là khả năng bảo vệ các quyết định kỹ thuật (defend decisions) dựa trên sự đánh đổi (trade-offs) giữa Latency (Độ trễ), Throughput (Thông lượng), Consistency (Tính nhất quán), và Cost (Chi phí).

### 1.1. Lambda Architecture vs. Kappa Architecture

Các ứng viên thường được yêu cầu thiết kế hệ thống xử lý dữ liệu phục vụ báo cáo realtime kết hợp dữ liệu lịch sử. Bạn cần nắm vững hai mẫu kiến trúc này:

*   **Lambda Architecture**: Chia luồng dữ liệu làm hai nhánh độc lập. 
    *   **Batch Layer** (Hệ thống lưu trữ dữ liệu immutable dài hạn như HDFS/S3, xử lý bằng Spark/Hadoop): Đảm bảo tính toán lại toàn bộ dữ liệu với độ chính xác tuyệt đối, nhưng độ trễ cao (hàng giờ).
    *   **Speed Layer** (Kafka + Flink/Spark Streaming): Xử lý luồng thời gian thực, bù đắp độ trễ của Batch layer nhưng có thể có sai số hoặc dữ liệu bị lặp. 
    *   Dữ liệu từ hai nhánh được hợp nhất tại **Serving Layer** để phục vụ ứng dụng.
    *   *Nhược điểm chí mạng*: Phải duy trì và đồng bộ hai hệ thống codebase song song cho cùng một logic nghiệp vụ, gây ác mộng trong việc bảo trì.

*   **Kappa Architecture**: Một kiến trúc cấp tiến hơn do Jay Kreps (Co-founder Confluent/Kafka) đề xuất, loại bỏ hoàn toàn Batch Layer.
    *   Coi mọi thay đổi dữ liệu đều là luồng sự kiện liên tục (Event stream). 
    *   Sử dụng một hệ thống lưu trữ log phân tán (như Kafka) làm hệ thống lưu trữ duy nhất (single source of truth) với thời gian lưu giữ (retention time) vô hạn hoặc rất dài.
    *   Chỉ sử dụng một Framework Stream Processing duy nhất (như Apache Flink). Khi cần chạy Batch/Backfill, đơn giản là replay lại toàn bộ luồng dữ liệu lịch sử trên Kafka với lượng tài nguyên lớn (high throughput).
    *   *Ưu điểm*: Codebase đồng nhất (Unified processing), dễ bảo trì và mở rộng.

### 1.2. Mẫu Kiến Trúc: Hệ Thống Phát Hiện Gian Lận Thời Gian Thực (Real-time Fraud Detection)

Dưới đây là một bản thiết kế System Design kinh điển cho bài toán phát hiện gian lận thanh toán theo thời gian thực (yêu cầu SLA xử lý < 100ms).

```mermaid
graph TD
    subgraph "Data Ingestion"
        A["Mobile/Web Payment Client"] -->|HTTP POST| B("API Gateway")
        B -->|Event Validation| C["Ingestion Microservice"]
    end

    subgraph "Messaging / Buffer Layer"
        C -->|Produce| D["Apache Kafka - Topic: Raw_Tx"]
    end

    subgraph "Real-time Stream Processing"
        D -->|Consume Stream| E{"Apache Flink"}
        E -->|Lookup Historic Features| F["("Redis - Feature Store")"]
        E -->|gRPC Call| G["ML Model Serving Container"]
    end

    subgraph "Serving & Downstream Actions"
        E -->|If Fraud Score > Threshold| H["Alert / Block Transaction API"]
        E -->|Output Cleaned Events| I["Kafka Topic: Clean_Tx"]
    end

    subgraph "Data Lakehouse & ML Training"
        I -->|Kafka Connect / Spark| J["("Data Lakehouse - S3/GCS + Iceberg")"]
        J -->|Batch ETL Spark| K["Update Features in Redis"]
        J -->|Historical Data| L["ML Training Pipeline / Airflow"]
        L -->|Deploy New Model| G
    end
    
    style D fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#bfb,stroke:#333,stroke-width:2px
    style J fill:#fbb,stroke:#333,stroke-width:2px
```

**Các phân tích Trade-off cần nhấn mạnh:**
*   **Tại sao chọn Flink thay vì Spark Streaming?** Spark Streaming hoạt động dựa trên cơ chế Micro-batching, dẫn đến độ trễ tối thiểu (overhead latency) thường > 100ms-500ms, khó đáp ứng SLA của Fraud Detection. Flink cung cấp kiến trúc Continuous Streaming thực sự, quản lý State cực tốt và xử lý Event-Time chuẩn xác với khái niệm *Watermarks*, giúp hệ thống phản hồi trong vòng vài mili-giây.
*   **Feature Store (Redis)**: Tại sao không dùng RDBMS (PostgreSQL) hay Cassandra? Việc tính điểm Fraud cần kết hợp dữ liệu dòng hiện tại (ví dụ: location, IP) và dữ liệu lịch sử của user đó (ví dụ: số giao dịch thất bại trong 1 giờ qua). Redis (In-memory Key-Value store) đảm bảo độ trễ truy xuất < 1ms, trong khi Cassandra (Disk-based) có thể mất vài ms đến hàng chục ms, PostgreSQL sẽ chết cứng (lock) khi chịu vài chục nghìn Concurrent Reads.
*   **Lưu trữ dài hạn (Lakehouse)**: Sử dụng các Table Format hiện đại như Apache Iceberg hoặc Delta Lake trên nền tảng Cloud Storage (S3/GCS) để tận dụng ACID transactions và Time-travel, thay thế kiến trúc Data Lake truyền thống (chỉ có Hive tables).

---

## 2. SQL & Data Modeling: Tối Ưu Hóa Trọng Tâm

Cho dù hệ sinh thái Big Data có tiến hóa rực rỡ đến đâu, **SQL** và **Data Modeling** vẫn là những kỹ năng không thể thiếu. Các vòng phỏng vấn Data Engineering từ Mid đến Senior luôn có những câu hỏi cực kỳ lắt léo về Analytical SQL, Execution Plans, và các triết lý mô hình hóa dữ liệu.

### 2.1. So Sánh Các Mô Hình Dữ Liệu Kinh Điển

Phỏng vấn viên sẽ hỏi bạn khi nào nên dùng mô hình nào cho Enterprise Data Warehouse (EDW).

| Tiêu Chí | Inmon (Enterprise Information Factory) | Kimball (Dimensional Modeling) | Data Vault 2.0 |
| :--- | :--- | :--- | :--- |
| **Cách tiếp cận** | Top-down (Từ tổng thể xuống chi tiết). Thiết kế mô hình chuẩn hóa (3NF) cho toàn công ty trước. | Bottom-up (Từ bộ phận kinh doanh). Bắt đầu từ các Data Mart độc lập với Star Schema. | Hybrid. Tập trung vào tính lịch sử (Auditability), linh hoạt mở rộng. Rất phù hợp với Agile. |
| **Cấu trúc lõi** | 3rd Normal Form (3NF) Entity-Relationship (ER). | Star Schema / Snowflake Schema (Fact & Dimension Tables). | Hubs (Core keys), Links (Relationships), Satellites (Attributes/History). |
| **Ưu điểm** | Dữ liệu đồng nhất, không dư thừa (No redundancy), toàn vẹn cao. | Dễ hiểu cho End-user/BI. Truy vấn cực nhanh (ít JOIN). Nhanh có kết quả (Quick wins). | Cực kỳ linh hoạt, thêm nguồn dữ liệu mới không phá vỡ mô hình cũ. Rút ngắn thời gian tải song song (Parallel load). |
| **Khuyết điểm** | Thời gian triển khai rất lâu. Truy vấn báo cáo phức tạp (Nhiều thao tác JOIN lớn). | Dễ tạo ra các "Silos" rời rạc nếu không kiểm soát tốt "Conformed Dimensions". Khó theo dõi lịch sử phức tạp. | Khó truy vấn trực tiếp (Quá nhiều bảng). Cần phải xây dựng một lớp Information Mart (dạng Kimball view) ở trên để Business dùng. |

### 2.2. Kỹ Thuật Xử Lý Slowly Changing Dimensions (SCD)

Trong mô hình Kimball, thay đổi thông tin (như khách hàng đổi địa chỉ) phải được lưu trữ đúng đắn để không làm hỏng số liệu quá khứ.
*   **SCD Type 1**: Ghi đè trực tiếp giá trị (Overwrite). Nhược điểm: Mất toàn bộ lịch sử (Historical loss).
*   **SCD Type 2**: Thêm dòng (Row) mới (Add new row). Quản lý bằng các cột Surrogate Key, `effective_date`, `expiration_date`, `is_current_flag`. Đây là cách phổ biến nhất và **chắc chắn sẽ được hỏi** về cách hiện thực bằng SQL (Dùng `MERGE` statement hoặc Left Join / Insert).
*   **SCD Type 3**: Thêm cột (Column) mới trên cùng một dòng (Add attribute column). Ví dụ: `current_address`, `previous_address`. Khuyết điểm: Chỉ lưu được một trạng thái lịch sử, không theo dõi được chuỗi thời gian đầy đủ.

### 2.3. Tối Ưu Hóa Truy Vấn Nâng Cao (Advanced Query Optimization)

**Anti-pattern: Dùng `COUNT(DISTINCT)` cho phân tích vĩ mô**
Khi phải đếm số lượng Daily Active Users (DAU) trên hệ thống hàng chục tỷ events/ngày, việc dùng `COUNT(DISTINCT user_id)` bắt buộc Database engine phải duy trì một Hash Table khổng lồ trong bộ nhớ để loại bỏ bản sao, dẫn đến rủi ro **Out of Memory (OOM)** hoặc suy giảm hiệu năng nghiêm trọng do phải Spill to Disk.

**Giải pháp: Các hàm xấp xỉ (Approximate Functions - thuật toán HyperLogLog)**
Bạn cần phải chủ động nhắc đến `APPROX_COUNT_DISTINCT`. Các DWH như BigQuery, Snowflake, Presto đều hỗ trợ hàm này.

```sql
-- Kém tối ưu: Chậm, tốn hàng chục GB bộ nhớ, dễ dính OOM
SELECT 
    date_trunc('day', event_timestamp) AS event_date,
    COUNT(DISTINCT user_id) AS exact_dau_count
FROM raw_events_log
GROUP BY 1;

-- Tối ưu: Nhanh gấp 10-100 lần, bộ nhớ cực thấp (~KB), sai số kiểm soát ở mức 1-2%
SELECT 
    date_trunc('day', event_timestamp) AS event_date,
    APPROX_COUNT_DISTINCT(user_id) AS approx_dau_count
FROM raw_events_log
GROUP BY 1;
```

**Anti-pattern: Self-Joins quá lạm dụng**
Khi tìm ra hành động đầu tiên hoặc cuối cùng của một đối tượng, ứng viên Junior thường dùng một subquery tìm thời gian `MIN()`, rồi `JOIN` lại với chính bảng gốc. Điều này bắt engine phải cày ải (Full table scan) bảng gốc hai lần.

**Giải pháp: Window Functions (`ROW_NUMBER()`)**
Sử dụng phân tích cửa sổ chỉ cần 1 lần quét qua bảng (sau khi phân nhóm và sắp xếp).

```sql
-- Truy vấn tìm giao dịch gần nhất của mỗi khách hàng
WITH RankedTransactions AS (
    SELECT 
        customer_id,
        transaction_id,
        amount,
        transaction_date,
        ROW_NUMBER() OVER(PARTITION BY customer_id ORDER BY transaction_date DESC) as ranking
    FROM sales_transactions
)
SELECT customer_id, transaction_id, amount, transaction_date
FROM RankedTransactions
WHERE ranking = 1;
```

---

## 3. Distributed Computing & Apache Spark Internals

Nếu bạn phỏng vấn vị trí liên quan đến Big Data, hãy quên đi các thao tác Pandas Dataframe cơ bản. Phỏng vấn viên sẽ "xoáy" vào nguyên lý phía sau API.

### 3.1. Tại Sao Spark Nhanh Hơn Hadoop MapReduce?

*   **In-Memory Processing**: Trong khi MapReduce đọc/ghi dữ liệu tạm xuống đĩa (HDFS) sau mỗi step (Map xong ghi đĩa, Reduce đọc lên), Spark lưu các RDDs (Resilient Distributed Datasets) trực tiếp trong RAM (In-Memory). Dữ liệu chỉ ghi xuống đĩa khi RAM không đủ.
*   **Lazy Evaluation**: Khi bạn gọi các lệnh Transformations (ví dụ `map`, `filter`), Spark không thực thi ngay mà chỉ tạo ra một Đồ thị phụ thuộc có hướng (DAG - Directed Acyclic Graph) lưu lại Logical Plan. Spark chỉ kích hoạt quá trình tính toán khi gặp lệnh Action (ví dụ `collect()`, `count()`, `write()`).
*   **Catalyst Optimizer & Project Tungsten**: Catalyst là công cụ tối ưu hóa tự động của Spark (áp dụng Predicate Pushdown, Column Pruning, Cost-Based Optimization). Project Tungsten giúp Spark trực tiếp quản lý phân bổ bộ nhớ nhị phân (Off-heap memory allocation), vượt mặt Garbage Collector (GC) của máy ảo Java (JVM), ngăn chặn hiện tượng khựng lại (GC pause) khi xử lý bộ dữ liệu khổng lồ.

### 3.2. Data Skewness (Lệch Dữ Liệu) và Kỹ Thuật Salting

Đây là câu hỏi phân loại ứng viên Senior. Lệch dữ liệu xảy ra khi dữ liệu phân phối không đều qua các khóa (keys). Một Partition có thể chứa 90% dữ liệu, trong khi các Partitions khác trống rỗng. Hậu quả là một "Straggler Task" phải làm việc suốt hàng giờ, trong khi toàn bộ Cluster tài nguyên khác lại nhàn rỗi ngồi chờ (idle). Stage đó không thể hoàn thành cho đến khi Task cuối cùng xong.

**Giải pháp Vàng: Kỹ thuật Salting (Thêm Muối)**
Bạn cố tình gắn thêm các con số ngẫu nhiên vào "skewed key" để chia tay cục dữ liệu khổng lồ đó ra, ép Spark gửi nó đến các Executors khác nhau tính toán song song, sau đó mới tổng hợp ở bước cuối.

```python
from pyspark.sql import functions as F
from pyspark.sql.types import IntegerType

# Bối cảnh: Bạn muốn đếm số lượng event_id theo customer_id.
# Vấn đề: Customer 'Shopee' chiếm 85% lưu lượng sự kiện, gây nghẽn 1 executor.

# Bước 1: Salting - Thêm 1 cột salt ngẫu nhiên (từ 0 đến 19)
df_salted = df_large.withColumn("salt", (F.rand() * 20).cast(IntegerType()))

# Bước 2: Aggregation Lần 1 (Gom nhóm theo khóa chính VÀ salt)
# Cục dữ liệu khổng lồ của 'Shopee' đã bị chia làm 20 phần nhỏ xử lý song song ở 20 tasks!
df_partial = df_salted.groupBy("customer_id", "salt").agg(
    F.count("event_id").alias("partial_count")
)

# Bước 3: Aggregation Lần 2 (Tổng hợp lại theo khóa chính, bỏ salt)
df_final = df_partial.groupBy("customer_id").agg(
    F.sum("partial_count").alias("total_events")
)
```

### 3.3. Hiểu Về Các Chiến Lược Join Trong Spark

*   **Broadcast Hash Join (BHJ)**: Là phép Join nhanh nhất. Spark sẽ phát (Broadcast) nguyên một bảng nhỏ (< 10MB mặc định, có thể chỉnh `spark.sql.autoBroadcastJoinThreshold`) tới toàn bộ các Worker Nodes, lưu tại Memory của mỗi Node. Bảng lớn quét qua Worker nào thì thực hiện Hash-lookup ngay tại Node đó. **Tuyệt đối không sinh ra Shuffle**. (Mẹo: Nếu OOM khi xài Broadcast, hãy kiểm tra bảng broadcast có đang lớn dần theo thời gian không).
*   **Sort Merge Join (SMJ)**: Phép Join mặc định và ổn định nhất đối với hai bảng lớn. Gồm 3 pha: (1) **Shuffle Phase** (Phân phối dữ liệu cùng Key về cùng 1 Executor qua Network). (2) **Sort Phase** (Sắp xếp các key trong từng Partition). (3) **Merge Phase** (Kết hợp dữ liệu đã sắp xếp lại với nhau theo Key). Tốn nhiều I/O đĩa và Network I/O. 

---

## 4. Kafka & Real-Time Streaming Internals

Apache Kafka thường bị nhầm lẫn là một "Message Queue" truyền thống như RabbitMQ, nhưng thực chất nó là một **Distributed Commit Log**.

### 4.1. Kafka Đạt Hiệu Năng Khổng Lồ Bằng Cách Nào?

Khi bị hỏi tại sao Kafka có thể xử lý hàng triệu tin nhắn mỗi giây với độ trễ thấp, hãy nêu bật 3 yếu tố kiến trúc:

1.  **Sequential Disk I/O**: Ổ cứng HDD/SSD dù chậm ở thao tác đọc/ghi ngẫu nhiên (Random Access - do cần seek time) nhưng lại cực kì nhanh khi đọc/ghi tuần tự (Sequential Access). Kafka coi dữ liệu là các file Log liên tục (Append-only logs), do đó tốc độ I/O đĩa xấp xỉ ngang tốc độ mạng lưới.
2.  **Nguyên tắc Zero-Copy (Bypass User Space)**: Trong các ứng dụng truyền thống, để gửi dữ liệu từ ổ cứng ra mạng, OS phải kéo dữ liệu đĩa vào Kernel Space (Page Cache), sau đó copy lên User Space (RAM ứng dụng), rồi lại dội ngược về Kernel Buffer, trước khi đẩy ra NIC (Network Interface Card) Socket. Tốn rất nhiều lần Context-Switch và memory copy. Kafka sử dụng API `sendfile()` của OS Unix, yêu cầu OS "bốc" thẳng dữ liệu từ Page Cache trên RAM hệ điều hành ném vào Network Socket. Cực kỳ nhanh và tiết kiệm CPU.
3.  **Batching & Data Compression**: Tối ưu hóa Network. Producer gửi hàng nghìn tin nhắn theo 1 lô (batch) và tự động nén (Snappy, LZ4, Zstd) từ phía client trước khi gửi tới Broker.

### 4.2. Khái Niệm Consumer Groups & Rebalancing

Kafka hỗ trợ mô hình Publish-Subscribe và Point-to-Point nhờ vào Consumer Groups. Các Consumer trong cùng một Group cùng nhau tiêu thụ một Topic.
*   **Quy tắc Vàng**: Một Partition chỉ có thể được đọc bởi **duy nhất một** Consumer trong một Group tại một thời điểm. (Do đó, số luồng tối đa của Group = Số lượng Partitions).
*   **Rebalance**: Khi một Consumer chết (fail heartbeat) hoặc có Consumer mới gia nhập Group, Coordinator sẽ tiến hành chia lại Partitions. Trong quá trình Rebalance, toàn bộ các luồng tiêu thụ (consumption) có thể bị đứng (Stop-The-World).

### 4.3. Đảm Bảo Exactly-Once Semantics (EOS)

Câu hỏi cực kỳ phổ biến: "Hệ thống sập mạng giữa chừng, làm sao đảm bảo bạn không bị cộng tiền 2 lần (Duplicates) hay mất bản tin chuyển tiền?".
Có 3 dạng bảo đảm (Delivery Guarantees):
1.  **At-most-once**: Gửi xong là quên. Có thể mất bản tin. Dùng cho Telemetry logs.
2.  **At-least-once**: Đảm bảo gửi đến nơi (Retry liên tục). Sẽ có lúc tin nhắn bị Duplicate. Dùng khá phổ biến.
3.  **Exactly-once**: Đích đến cao nhất. Kafka đạt được bằng 2 cơ chế:
    *   **Idempotent Producers** (`enable.idempotence=true`): Mỗi Producer được gán 1 PID (Producer ID) và mỗi tin nhắn có Sequence Number liên tục. Nếu có Retry xảy ra do Network timeout nhưng Broker đã nhận được bản ghi rồi, Broker sẽ nhận diện qua Tuple `(PID, Seq_No)` và mạnh tay vứt bỏ bản ghi trùng lặp.
    *   **Transactions API**: Cho ứng dụng Stream Processing (Kafka Stream/Flink). Phép đọc dữ liệu + Xử lý + Ghi kết quả ngược lại Kafka (hoặc Cập nhật Offset) diễn ra theo giao dịch (Atomic). Nếu crash giữa chừng, toàn bộ các output và offset sẽ bị Rollback lại trạng thái ban đầu, hoặc ẩn đi với các consumer dùng tùy chọn `isolation.level=read_committed`.

---

## 5. Orchestration, CI/CD & DataOps

Công việc của DE không kết thúc khi pipeline chạy được 1 lần, mà làm sao đảm bảo nó chạy ổn định mỗi ngày.

### 5.1. Apache Airflow và Tính Năng Idempotency

Airflow là công cụ tiêu chuẩn để tạo các Data Pipelines (DAGs - Directed Acyclic Graphs).
**Idempotency** (Tính lũy đẳng) là tính chất bắt buộc cho mọi DAGs tốt. Nghĩa là: *Dù bạn chạy lại (Rerun / Backfill) DAG đó 1 lần hay 100 lần cho cùng một chu kỳ (Logical Date), kết quả cuối cùng sinh ra ở kho dữ liệu đích luôn luôn y hệt nhau, không bao giờ bị nhân đôi dữ liệu (Data Duplication).*

**Làm sao để đạt được?**
Không sử dụng lệnh `INSERT` đơn thuần. Luôn dùng:
*   Mẫu `TRUNCATE / DELETE` dữ liệu của partition ngày đó trước, sau đó mới `INSERT`.
*   Hoặc sử dụng câu lệnh `MERGE INTO` (UPSERT) dựa trên Primary Keys.
*   Sử dụng Cloud Storage path chứa thông số Execution Date: `s3://bucket/data/year={{ execution_date.year }}/month={{ execution_date.month }}/...` rồi ghi đè file toàn bộ.

### 5.2. Môi Trường CI/CD Cho Dữ Liệu (dbt & Git)

Sử dụng dbt (data build tool) để áp dụng các chuẩn mực Software Engineering vào Data.

```mermaid
gitGraph
    commit
    branch feature/add-revenue-model
    checkout feature/add-revenue-model
    commit id:"Write SQL in dbt"
    commit id:"Add dbt tests (unique, not_null)"
    checkout main
    merge feature/add-revenue-model id:"Pull Request + CI Check"
    commit id:"Airflow/Git Actions Trigger Deploy"
```
*   **Data Testing**: CI/CD tự động kích hoạt `dbt test` để kiểm tra Referential Integrity (Toàn vẹn tham chiếu), null values, uniqueness trước khi merge code lên Production. Đảm bảo triết lý "Garbage In, Garbage Out" bị chặn ngay từ đầu.

---

## 6. Tiêu Chí Đánh Giá Trong Phỏng Vấn (Evaluation Rubric)

Dưới đây là ma trận chuẩn mực các công ty công nghệ cao (Tech Giants) sử dụng để xác định Level ứng viên:

| Khía Cạnh | Mid-Level DE (Tập trung vào Triển Khai) | Senior DE (Tập trung vào Tối Ưu & Giải Pháp) | Staff/Principal DE (Tập trung vào Chiến Lược & Nền tảng) |
| :--- | :--- | :--- | :--- |
| **System Design** | Biết sử dụng framework có sẵn. Thiết kế được pipeline 1 chiều hoàn chỉnh. Quan tâm "làm sao cho chạy được". | Chủ động định hình kiến trúc. Đánh giá cặn kẽ Trade-offs. Thiết kế xử lý lỗi linh hoạt (Dead Letter Queue, Fallbacks, High Availability). | Dẫn dắt tầm nhìn kiến trúc (Architectural Vision) cho toàn bộ hệ thống dữ liệu doanh nghiệp. Thiết kế Data Platform/Data Mesh cho nhiều teams. |
| **Distributed Systems**| Viết code Spark, Flink API tương đối tốt. Hiểu được map, reduce, filter, join cơ bản. | Phân tích sâu Execution Plan, xử lý mượt Data Skew, OOM, điều hướng Tuning Memory. Nắm vững rào cản Network I/O. | Cống hiến trực tiếp (Commit) vào mã nguồn mở OSS. Tìm ra các giới hạn của Framekworks và override nội bộ. |
| **SQL & Modeling** | Viết SQL trôi chảy (CTEs, Window func). Áp dụng Star Schema ở mức cơ bản. | Tối ưu truy vấn phức tạp ngốn tài nguyên. Giải quyết bài toán Slowly Changing Dimension lớn. Thiết kế kho dữ liệu chịu tải cao. | Định hình chính sách quản trị Data Governance toàn công ty. Tối ưu hóa Database Engine Storage Formats. |
| **DataOps & Mindset**| Viết Airflow DAGs và CI/CD cơ bản. | Áp dụng CI/CD nghiêm ngặt. Cài đặt Data Quality SLA/SLO bài bản. Mentor cho hệ thống và Juniors. | Xây dựng Data Catalog tự động, Data Lineage diện rộng. Thúc đẩy văn hóa Data-driven minh bạch (Self-serve data). |

---

## 7. Tài Liệu Tham Khảo "Gối Đầu Giường"

Để chinh phục những nấc thang cao nhất, đây là danh sách những tài nguyên bắt buộc phải nghiền ngẫm:

1.  ****Fundamentals of Data Engineering**** - *Joe Reis & Matt Housley*: Cuốn sách tuyệt vời để nắm bắt bức tranh toàn cảnh (Big Picture) của hệ sinh thái dữ liệu và vòng đời dữ liệu hiện đại.
2.  **[Designing Data-Intensive Applications (DDIA)](https://dataintensive.net/)** - *Martin Kleppmann*: Được mệnh danh là "Kinh Thánh" của các kĩ sư dữ liệu. Hãy đọc nát các chương về Replication, Partitioning, ACID Transactions, Consensus, và Streaming/Batch.
3.  ****Spark: The Definitive Guide**** - *Bill Chambers & Matei Zaharia*: Do chính cha đẻ Spark viết, sách đi sâu vào cội nguồn của RDDs, Memory Tuning, và Catalyst.
4.  ****Kafka: The Definitive Guide (2nd Edition)**** - *Neha Narkhede*: Không thể thiếu để mổ xẻ Kafka Internals, Log compaction, Leader election và Consumer Groups.
5.  **Theo dõi các Engineering Blogs thực chiến (Real-world Use Cases)**:
    *   **Netflix Tech Blog: Data Engineering at Scale**
    *   **Uber Engineering: Data Infrastructure**
    *   **Airbnb Engineering: Data**
    *   [The Pragmatic Engineer](https://blog.pragmaticengineer.com/) - *Gergely Orosz*: Giúp phát triển tư duy hệ thống và cách các gã khổng lồ công nghệ giải quyết vấn đề.
