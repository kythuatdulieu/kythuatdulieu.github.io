---
title: "Kiến trúc Medallion - Medallion Architecture"
category: "Data Lake & Lakehouse"
difficulty: "Beginner"
tags: ["medallion-architecture", "data-lakehouse", "bronze", "silver", "gold", "databricks"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Medallion Architecture là gì? Mô hình phân lớp trong Lakehouse"
metaDescription: "Tìm hiểu Medallion Architecture (Đồng - Bạc - Vàng) trong Data Lakehouse và Databricks. Chi tiết vai trò từng lớp dữ liệu."
definition: "Medallion Architecture (Kiến trúc Đồng - Bạc - Vàng) là mẫu thiết kế logic phân tầng dữ liệu giúp làm sạch, chuẩn hóa và tối ưu hóa dữ liệu một cách tuần tự từ thô đến tinh chọn trong Data Lakehouse."
---

Khi phong trào xây dựng **[Data Lake](/concepts/2-storage/data-lake-lakehouse/data-lake/) (Hồ dữ liệu)** bùng nổ, nhiều doanh nghiệp đã hào hứng đổ tất cả mọi nguồn dữ liệu họ có vào một nơi lưu trữ tập trung duy nhất (như Amazon S3 hay Google [Cloud Storage](/concepts/2-storage/cloud-data-platform/cloud-storage/)). Tuy nhiên, chỉ sau một thời gian ngắn, hồ dữ liệu nhanh chóng biến thành một **Đầm lầy dữ liệu (Data Swamp)**. Lý do rất đơn giản: không ai biết file nào là dữ liệu thô, file nào đã được làm sạch, và bảng nào là bảng chuẩn xác để làm báo cáo.

Để lập lại trật tự cho hồ dữ liệu, Databricks đã đề xuất **Kiến trúc Medallion (Medallion Architecture)** — hay còn gọi là kiến trúc phân tầng dữ liệu Đồng, Bạc, Vàng. Đây là một mẫu thiết kế logic giúp tổ chức dữ liệu một cách khoa học, nâng cấp dần chất lượng dữ liệu qua từng chặng để phục vụ tốt nhất cho mọi nhu cầu phân tích của doanh nghiệp.

![Sơ đồ kiến trúc minh họa cho Medallion Architecture](/images/medallion-architecture/medallion-architecture-flow.png)

## Lộ trình dòng chảy dữ liệu qua Ba lớp Huy chương

Kiến trúc Medallion chia nhỏ quy trình xử lý dữ liệu ([ETL](/concepts/3-integration/etl-elt/etl/)/[ELT](/concepts/3-integration/etl-elt/elt/)) thành ba lớp (zones) với các vai trò và mức độ tinh sạch khác nhau:

### 1. Bronze Layer (Lớp Đồng - Ingestion Zone)
Đây là điểm dừng chân đầu tiên của mọi dữ liệu đổ về từ các nguồn khác nhau (APIs, cơ sở dữ liệu quan hệ, IoT logs,...).
* **Nhiệm vụ**: Đón nhận và lưu trữ dữ liệu thô (raw data) nhanh nhất có thể.
* **Đặc điểm**: Dữ liệu được lưu trữ nguyên bản, không qua bất kỳ bộ lọc hay biến đổi logic nào (chỉ thêm mới - append-only). Chúng thường được tổ chức dưới dạng file thô (JSON, CSV, Avro) kèm theo một vài cột metadata kỹ thuật (như thời gian nạp dữ liệu, ID của batch chạy).
* **Mục đích**: Đóng vai trò là bản sao lưu lịch sử vĩnh viễn. Nếu sau này các bước xử lý phía sau gặp lỗi, chúng ta luôn có thể quay lại lớp Bronze để chạy lại hệ thống từ đầu mà không cần phải kết nối lại vào cơ sở dữ liệu gốc của doanh nghiệp.

### 2. Silver Layer (Lớp Bạc - Cleansed/Filtered Zone)
Ở chặng tiếp theo, dữ liệu từ lớp Bronze sẽ được gột rửa và chuẩn hóa.
* **Nhiệm vụ**: Làm sạch, lọc nhiễu, đồng nhất kiểu dữ liệu và khử trùng lặp ([deduplication](/concepts/3-integration/etl-elt/deduplication/)).
* **Đặc điểm**: Dữ liệu được ép vào một schema chung rõ ràng (schema enforcement), các bản ghi bị thiếu thông tin quan trọng hoặc có giá trị vô lý sẽ bị lọc bỏ. Định dạng lưu trữ thường được chuyển sang các tệp cột tối ưu như Parquet, [Delta Lake](/concepts/2-storage/data-lake-lakehouse/delta-lake/) hoặc Iceberg.
* **Mục đích**: Cung cấp một nguồn chân lý chung cho toàn doanh nghiệp (Enterprise View). Đây là khu vực yêu thích của các kỹ sư Machine Learning và Data Scientist vì họ cần dữ liệu chi tiết, đã được làm sạch nhưng chưa bị tổng hợp làm mất đi các đặc trưng tự nhiên.

### 3. Gold Layer (Lớp Vàng - Curated/Business Zone)
Đây là chặng cuối cùng của dòng chảy dữ liệu, nơi dữ liệu được chế biến thành món ăn sẵn sàng phục vụ thực khách.
* **Nhiệm vụ**: Tổng hợp và mô hình hóa dữ liệu theo các quy tắc nghiệp vụ kinh doanh (Business Rules).
* **Đặc điểm**: Dữ liệu tại đây được tổ chức theo các mô hình chuẩn hóa cho phân tích như [Star Schema](/concepts/2-storage/data-warehouse/star-schema/) (Fact và Dimension tables) hoặc được tổng hợp sẵn (aggregated) theo ngày, tháng, phòng ban.
* **Mục đích**: Tối ưu hóa tốc độ truy vấn cao nhất cho các công cụ BI (Tableau, PowerBI) và phục vụ trực tiếp cho các báo cáo của ban giám đốc.

---

## Luồng xử lý dữ liệu tổng quan

Dưới đây là sơ đồ dòng chảy dữ liệu tuần tự của kiến trúc Medallion:
```mermaid
flowchart LR
    %% Data Sources
    subgraph Sources ["Nguồn dữ liệu (Data Sources)"]
        direction TB
        DB[(RDBMS / Databases)]
        API([APIs])
        IoT[IoT / Logs]
    end

    %% Medallion Layers
    subgraph Medallion ["Kiến trúc Medallion (Medallion Architecture)"]
        direction LR
        Bronze["<b>Bronze Layer</b><br/>(Ingestion Zone)<br/>- Dữ liệu thô (Raw)<br/>- Append-only<br/>- JSON / CSV / Avro"]
        
        Silver["<b>Silver Layer</b><br/>(Cleansed Zone)<br/>- Làm sạch & Khử trùng<br/>- Đồng nhất Schema<br/>- Parquet / Delta Lake"]
        
        Gold["<b>Gold Layer</b><br/>(Curated Zone)<br/>- Tổng hợp (Aggregated)<br/>- Quy tắc Nghiệp vụ<br/>- Star Schema (Fact/Dim)"]
    end

    %% Consumers
    subgraph Consumers ["Nhóm Tiêu thụ (Consumers)"]
        direction TB
        DS[Data Science / ML]
        BI[Business Intelligence / BI]
        Report[Reports / Analysts]
    end

    %% Connections
    Sources -->|Ingest / CDC| Bronze
    Bronze -->|Clean & Conform| Silver
    Silver -->|Aggregate & Model| Gold
    
    Silver -->|Atomic Data| DS
    Gold -->|Structured Queries| BI
    Gold -->|Pre-aggregated| Report

    %% Styling
    style Sources fill:#edf2f4,stroke:#8d99ae
    style Consumers fill:#edf2f4,stroke:#8d99ae
    
    style Bronze fill:#cd7f32,stroke:#3a1d00,color:#fff
    style Silver fill:#c0c0c0,stroke:#3a3a3a,color:#000
    style Gold fill:#ffd700,stroke:#5c4d00,color:#000
```

---

## Minh họa thực tế: Hệ thống IoT đo lường không khí

Hãy xem cách dữ liệu của một thiết bị đo chất lượng không khí thay đổi qua 3 tầng:

**1. Tại tầng Bronze (Thô)**:
Hệ thống lưu lại nguyên vẹn chuỗi JSON nhận được từ thiết bị cảm biến:

```json
{"device_id": "A-123", "temp_f": "75.2", "pm25": "12", "timestamp": "1686090000"}
```
*(Lưu ý: Tầng này có thể chứa cả các bản ghi bị lỗi do thiết bị mất sóng như `"temp_f": "NULL"`)*.

**2. Tại tầng Silver (Làm sạch)**:
Dữ liệu được chuyển sang dạng bảng Delta Lake tối ưu. Nhiệt độ độ F (`temp_f`) được đổi sang độ C (`temp_c`). Lọc bỏ các dòng bị lỗi NULL hoặc các thiết bị gửi trùng lặp dữ liệu:

| device_id | temp_c | pm25 | event_time |
| :--- | :--- | :--- | :--- |
| A-123 | 24.0 | 12 | 2026-06-07 08:00:00 |

**3. Tại tầng Gold (N nghiệp vụ)**:
Các nhà phân tích không muốn đọc hàng triệu dòng dữ liệu theo từng giây. Họ cần báo cáo trung bình theo ngày và theo thành phố. Ta thực hiện JOIN bảng Silver với bảng danh mục thiết bị (`dim_device`) để lấy thông tin thành phố và tính toán:

| date | city | avg_temp_c | avg_pm25 | alert_level |
| :--- | :--- | :--- | :--- | :--- |
| 2026-06-07 | Hanoi | 30.5 | 45 | High |

---

## Điểm mạnh và điểm yếu

### Ưu điểm vượt trội (Pros)
* **Quy hoạch rõ ràng (Organizational Clarity)**: Phân định rạch ròi vai trò của từng tầng dữ liệu. Đội ngũ kỹ sư, phân tích và khoa học dữ liệu đều biết chính xác họ cần kết nối vào đâu để lấy dữ liệu phù hợp với công việc của mình.
* **Traceability & Easy Debugging**: Nếu báo cáo PowerBI ở lớp Gold hiển thị sai số, bạn có thể dễ dàng kiểm tra ngược lại lớp Silver xem dữ liệu sạch có bị sai không. Nếu Silver đúng, lỗi nằm ở code biến đổi lên Gold. Nếu Silver sai, lỗi nằm ở khâu làm sạch. Việc khoanh vùng sự cố trở nên cực kỳ đơn giản.
* **Bảo vệ hệ thống nguồn**: Các báo cáo BI chạy liên tục trên lớp Gold hoàn toàn độc lập và không gây ảnh hưởng gì đến hiệu năng của các cơ sở dữ liệu vận hành (RDBMS) của công ty.

### Hạn chế cần cân nhắc (Cons)
* **Độ trễ dữ liệu (Latency)**: Vì dữ liệu phải đi qua 3 trạm trung chuyển tuần tự, nếu bạn chạy pipeline theo lô (batch) thì người dùng cuối sẽ phải chấp nhận một độ trễ nhất định trước khi thấy dữ liệu mới trên dashboard.
* **Tăng chi phí lưu trữ**: Một bộ dữ liệu được sao lưu ở 3 trạng thái khác nhau trên cùng hệ thống. Tuy nhiên, với chi phí Cloud Storage (S3, GCS) cực rẻ hiện nay, đây thường không phải là rào cản quá lớn đối với hầu hết doanh nghiệp.

---

## Khi nào nên dùng và không nên dùng

### Nên dùng khi:
* Bạn đang xây dựng một kiến trúc **Data [Lakehouse](/concepts/2-storage/data-lake-lakehouse/lakehouse/)** hiện đại (đặc biệt là sử dụng hệ sinh thái Databricks hoặc [Apache Spark](/concepts/3-integration/batch-processing/apache-spark/)).
* Công ty bạn có nhiều nhóm khai thác dữ liệu khác nhau với các mục đích từ báo cáo BI truyền thống đến nghiên cứu AI/ML chuyên sâu.
* Hệ thống có nhiều đường ống xử lý dữ liệu phức tạp cần được module hóa để dễ quản trị và bảo trì.

### Không nên dùng khi:
* Doanh nghiệp có quy mô nhỏ, dữ liệu chủ yếu là dạng bảng có cấu trúc và có thể ném thẳng vào một [Data Warehouse](/concepts/2-storage/data-warehouse/data-warehouse/) (như BigQuery hoặc [Snowflake](/concepts/2-storage/cloud-data-platform/snowflake/)) để xử lý trực tiếp. Khi đó, các mô hình phân tầng đơn giản như Staging -> Core sẽ gọn nhẹ hơn nhiều.

---

## Các khái niệm liên quan

* [Data Lakehouse](/concepts/2-storage/data-lake-lakehouse/lakehouse/)
* [Delta Lake](/concepts/2-storage/data-lake-lakehouse/delta-lake/)
* [Dimensional Modeling](/concepts/2-storage/data-warehouse/dimensional-modeling/)
* [Dự án GCP: Serverless Lakehouse & Modern Data Stack](/projects/gcp-e2e-project/)

---

## Trọng tâm ôn luyện phỏng vấn

### 1. Tại sao các Data Scientists thường lấy dữ liệu từ lớp Silver (Bạc) thay vị lấy ở lớp Gold (Vàng) vốn đã được gom nhóm rất đẹp đẽ?
* **Mục đích của người phỏng vấn**: Kiểm tra xem bạn có hiểu sự khác biệt về bản chất công việc giữa Data Science (mang tính dự báo) và Business Intelligence (mang tính mô tả).
* **Gợi ý trả lời**:
  * Các thuật toán Machine Learning cần tìm kiếm các mẫu hành vi vi mô trong một lượng lớn dữ liệu chi tiết (atomic [grain](/concepts/2-storage/data-warehouse/grain/)). Lớp Gold thường là dữ liệu đã bị tổng hợp (aggregated) theo các chiều cụ thể (ví dụ: tổng doanh số theo ngày). 
  * Khi dữ liệu bị tổng hợp, các biến động tự nhiên và chi tiết của từng sự kiện sẽ bị biến mất, làm mất đi các tín hiệu (features) quan trọng giúp mô hình AI học hỏi. Do đó, lớp Silver — nơi dữ liệu đã được lọc sạch nhiễu nhưng vẫn giữ nguyên cấu trúc phẳng và chi tiết ban đầu — mới là nguồn nguyên liệu hoàn hảo cho Data Scientists.

### 2. Nếu logic kinh doanh để tính toán Doanh thu bị thay đổi (ví dụ: Doanh thu thực tế phải trừ đi phần phí hoàn tiền), bạn sẽ áp dụng sửa đổi này ở lớp nào trong Medallion Architecture? Tại sao?
* **Mục đích của người phỏng vấn**: Kiểm tra xem bạn có hiểu rõ ranh giới trách nhiệm giữa các tầng dữ liệu không.
* **Gợi ý trả lời**:
  * Logic nghiệp vụ này bắt buộc phải được áp dụng và chỉnh sửa ở bước biến đổi từ **Silver lên Gold**.
  * Bởi vì lớp Silver có nhiệm vụ làm sạch về mặt kỹ thuật (loại bỏ null, chuẩn hóa kiểu dữ liệu). Nó phải phản ánh trung thực thực tế khách quan (doanh thu là bao nhiêu, phí hoàn tiền là bao nhiêu dưới dạng các cột riêng biệt). 
  * Việc định nghĩa công thức *"Doanh thu thực tế = Doanh thu - Phí hoàn tiền"* là một Business Rule. Nếu chúng ta sửa đổi trực tiếp ở Silver, chúng ta sẽ bóp méo dữ liệu đầu vào chung của toàn doanh nghiệp, gây ảnh hưởng đến các phòng ban khác vốn có thể sử dụng công thức tính toán doanh thu khác. Lớp Gold mới là nơi dành riêng cho các Business Rules này.

## Xem thêm các khái niệm liên quan
* [ACID Transactions trên Data Lake](/concepts/2-storage/data-lake-lakehouse/acid-transactions-on-lake/)
* [Apache Hudi](/concepts/2-storage/data-lake-lakehouse/apache-hudi/)
* [Apache Iceberg - Định dạng bảng thế hệ mới](/concepts/2-storage/data-lake-lakehouse/apache-iceberg/)

## Tài liệu tham khảo

1. [Databricks Medallion Architecture Guide](https://www.databricks.com/glossary/medallion-architecture) - Official design pattern documentation detailing Bronze, Silver, and Gold layer structures.
2. [AWS Big Data Blog](https://aws.amazon.com/blogs/big-data/) - Official blog featuring case studies, tutorials, and best practices for building multi-hop data lake architectures on AWS.
3. [Apache Hudi Overview](https://hudi.apache.org/docs/overview) - Hudi guide on building incremental, multi-hop medallion data pipelines.
4. [Data Engineering with Databricks](https://www.oreilly.com/library/view/data-engineering-with/9781805128038/) - O'Reilly book on implementing medallion pipelines, [data governance](/concepts/5-quality-governance/governance-metadata/data-governance/), and analytics in Databricks.
5. [Google Cloud - Designing a Data Lakehouse](https://cloud.google.com/blog/products/databases/what-is-a-data-lakehouse) - Google Cloud blog post outlining data tiers and lakehouse design patterns.
6. [Snowflake - Iceberg Tables for Data Lakehouse](https://docs.snowflake.com/en/user-guide/tables-iceberg) - Snowflake's documentation on creating data architectures using external tables.
7. [Confluent - Medallion Architecture and Streaming](https://www.confluent.io/blog/medallion-architecture-stream-processing/) - Confluent blog post detailing streaming ingestion within medallion layers.
8. [Microsoft Azure - Medallion Architecture in Databricks](https://azure.microsoft.com/en-us/blog/azure-databricks-delta-lake-now-generally-available/) - Microsoft Azure post on Delta Lake medallion architectures.

## English summary

The Medallion Architecture is a data design pattern fundamentally associated with the Data Lakehouse (often popularized by Databricks) that logically organizes data flowing through a pipeline into three distinct zones: Bronze, Silver, and Gold. 
* **Bronze** ingests and stores raw, immutable data from [source systems](/concepts/1-foundations/foundation/source-systems/) exactly as it arrives. 
* **Silver** contains cleansed, deduped, and conformed data providing an "Enterprise view" optimized for data scientists and downstream processing. 
* **Gold** houses highly refined, business-aggregated data typically modeled in star schemas specifically for Business Intelligence and dashboarding. 
This multi-hop approach guarantees modularity, traceability, and strict separation of concerns, decoupling raw data storage from complex business-logic aggregations.