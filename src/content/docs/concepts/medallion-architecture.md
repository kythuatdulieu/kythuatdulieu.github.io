---
title: "Kiến trúc Medallion - Medallion Architecture"
category: "Data Lake & Lakehouse"
difficulty: "Beginner"
tags: ["medallion-architecture", "data-lakehouse", "bronze", "silver", "gold", "databricks"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Medallion Architecture là gì? Kiến trúc Bronze - Silver - Gold trong Lakehouse"
metaDescription: "Tìm hiểu chi tiết về Medallion Architecture (Kiến trúc phân lớp dữ liệu Đồng - Bạc - Vàng) phổ biến trong Data Lakehouse và Databricks. Vai trò của từng lớp dữ liệu."
---

# Kiến trúc Medallion - Medallion Architecture

## Summary

Medallion Architecture (Kiến trúc Huy chương) là một mô hình thiết kế logic để tổ chức dữ liệu trong các hệ thống Data Lakehouse. Được phổ biến rộng rãi bởi Databricks, kiến trúc này mô tả hành trình dòng chảy dữ liệu (Data Pipeline) qua 3 lớp phân cấp chính: Đồng (Bronze), Bạc (Silver), và Vàng (Gold). Tại mỗi bước chuyển giao giữa các lớp, chất lượng và cấu trúc của dữ liệu được nâng cấp dần dần (từ thô ráp đến hoàn thiện) nhằm phục vụ các cấp độ nhu cầu phân tích khác nhau của doanh nghiệp.

---

## Definition

**Medallion Architecture** là một mẫu thiết kế quản trị dữ liệu (Data Design Pattern) phân tầng dữ liệu thành 3 khu vực lưu trữ (Zones) riêng biệt dựa trên mức độ tinh sạch và sẵn sàng của dữ liệu:
* **Bronze Layer (Lớp Đồng - Raw/Ingestion Zone)**: Nơi chứa dữ liệu thô (Raw) nguyên bản, được thu thập trực tiếp từ các hệ thống nguồn mà chưa qua bất kỳ quá trình biến đổi nào.
* **Silver Layer (Lớp Bạc - Cleansed/Filtered Zone)**: Dữ liệu đã được làm sạch, đồng nhất kiểu dữ liệu, lọc bỏ rác và chuẩn hóa, sẵn sàng cho các công việc khai phá hoặc đào tạo AI/Machine Learning.
* **Gold Layer (Lớp Vàng - Aggregated/Business Zone)**: Dữ liệu đã được tổng hợp, biến đổi theo các quy tắc nghiệp vụ kinh doanh phức tạp (thường được thiết kế theo mô hình Star Schema: Fact và Dimension) để phục vụ trực tiếp cho báo cáo BI và Dashboards.

---

## Why it exists

Khi khái niệm Data Lake mới ra đời, nhiều công ty đơn giản là "đổ" tất cả mọi thứ họ có vào một Bucket duy nhất (như Amazon S3). Rất nhanh chóng, hồ dữ liệu biến thành một "Đầm lầy dữ liệu" (Data Swamp) vì không ai biết file nào là dữ liệu nháp, file nào đã được làm sạch, file nào đã sẵn sàng làm báo cáo.

Kiến trúc Medallion ra đời để áp đặt kỷ luật lên Data Lakehouse. Nó đảm bảo:
1. **Lưu vết (Traceability)**: Nếu báo cáo ở lớp Gold bị sai, kỹ sư luôn có thể lùi về lớp Silver hoặc Bronze để tìm ra nguyên nhân, và chạy lại đường ống biến đổi mà không phải kết nối lại vào hệ thống nguồn.
2. **Quản trị quyền truy cập (Access Control)**: Các nhà phân tích BI chỉ được cấp quyền đọc ở lớp Gold. Data Scientists được cấp quyền ở lớp Silver. Lớp Bronze bị khóa kín, chỉ có hệ thống kỹ thuật ETL mới được chạm vào.
3. **Mô-đun hóa (Modularity)**: Việc tách các pipeline làm sạch riêng khỏi pipeline tính toán doanh số giúp hệ thống dễ debug và phát triển hơn.

---

## Core idea

Cốt lõi của Medallion Architecture là nguyên lý: **"Ghi dữ liệu một lần từ hệ thống nguồn, sau đó liên tục tinh chỉnh giá trị từ Đồng lên Vàng."**

Cách tiếp cận này còn được gọi là Multi-hop Architecture (Kiến trúc nhiều bước nhảy). 

Thay vì viết một kịch bản ETL khổng lồ (và cực kỳ rủi ro): đọc từ API, parse JSON, đổi định dạng ngày, join 5 bảng, tính doanh thu, và ghi vào Data Warehouse... thì ta chia nhỏ ra. Tác vụ Ingest chỉ làm đúng 1 việc là lưu JSON (Bronze). Tác vụ Clean chỉ làm đúng 1 việc là đổi JSON sang Parquet và sửa ngày tháng (Silver). Tác vụ Business làm đúng 1 việc là JOIN và tính doanh thu (Gold).

---

## The Three Layers (Chi tiết 3 lớp dữ liệu)

### 1. Bronze Layer (Lớp Đồng)
* **Nhiệm vụ**: "Hạ cánh" dữ liệu an toàn và nhanh nhất có thể.
* **Đặc điểm**: Giữ nguyên trạng thái thô. Dữ liệu thường được lưu dưới dạng Append-only (Chỉ thêm mới). Có thể là file JSON, CSV, hoặc định dạng nhị phân Kafka. Có lưu thêm các thông tin metadata của quá trình nạp (thời gian nạp, tên file nguồn, batch ID).
* **Mục đích**: Làm một bản sao lưu (Archive) vĩnh viễn của hệ thống nguồn. Nếu lỗi logic xảy ra ở các bước sau, ta luôn có thể chạy lại từ lớp Bronze.

### 2. Silver Layer (Lớp Bạc)
* **Nhiệm vụ**: Làm sạch (Cleanse), Lọc (Filter), và Đồng nhất (Conform).
* **Đặc điểm**: Loại bỏ các bản ghi bị thiếu thông tin hoặc sai định dạng. Ánh xạ dữ liệu về đúng schema chung của tổ chức (Schema enforcement). Chuyển hóa tất cả các định dạng lộn xộn (JSON, CSV) về định dạng tối ưu lưu trữ như Parquet, Delta Lake hoặc Iceberg. Giải quyết việc trùng lặp dữ liệu (Deduplication).
* **Mục đích**: Cung cấp một Single Source of Truth ở mức độ doanh nghiệp (Enterprise view). Data Scientists rất thích lớp này vì họ cần dữ liệu chi tiết, đã được làm sạch để tìm kiếm pattern, chứ không cần dữ liệu đã bị tổng hợp mất đi chi tiết.

### 3. Gold Layer (Lớp Vàng)
* **Nhiệm vụ**: Mô hình hóa để tiêu thụ (Consumption).
* **Đặc điểm**: Tổ chức dữ liệu theo kiến trúc Dimensional Modeling (Star Schema - Fact/Dimension Tables). Dữ liệu có thể được tổng hợp (Aggregated - tính tổng theo ngày, theo khu vực) tùy theo yêu cầu của Business.
* **Mục đích**: Tối ưu hóa tốc độ cao nhất cho các công cụ BI (Tableau, PowerBI). Chỉ những ai hiểu rõ nghiệp vụ kinh doanh mới biết cách thiết kế lớp Vàng.

---

## Architecture / Flow

Mô phỏng đường ống dữ liệu (Pipeline) trong Medallion Architecture:

```mermaid
graph LR
    subgraph Sources
        A(IoT Sensors)
        B(CRM Database)
        C(Web Logs)
    end

    subgraph Data Lakehouse (Cloud Storage)
        D[Bronze Zone\nRaw JSON/CSV]
        E[Silver Zone\nCleaned Delta/Iceberg]
        F[Gold Zone\nAggregated Star Schema]
        
        D -->|Data Quality / Parsing| E
        E -->|Joins / Aggregations| F
    end

    subgraph Consumers
        G(Data Engineers)
        H(Data Scientists)
        I(Data Analysts & BI)
    end

    A -->|Ingest| D
    B -->|Ingest| D
    C -->|Ingest| D
    
    D -.-> G
    E -.-> H
    F -.-> I
```

---

## Practical example

Xét một hệ thống đo lường chất lượng không khí từ thiết bị IoT.

**1. Bronze (Raw): `bronze_iot_readings`**
Lưu y xì chuỗi JSON bắn về từ thiết bị, cộng thêm thời gian nhận.
```json
{"device_id": "A-123", "temp_f": "75.2", "pm25": "12", "timestamp": "1686090000"}
-- Có thể chứa các dòng lỗi như "temp_f": "NULL"
```

**2. Silver (Cleaned): `silver_iot_metrics`**
Chuyển đổi thành dạng Cột (Delta Lake). Chuyển `temp_f` sang `temp_c`. Lọc bỏ các dòng có giá trị nhiệt độ âm vô lý. Loại bỏ các dòng trùng lặp do thiết bị lỗi gửi 2 lần.
| device_id | temp_c | pm25 | event_time |
| :--- | :--- | :--- | :--- |
| A-123 | 24.0 | 12 | 2026-06-07 08:00:00 |

**3. Gold (Business): `gold_daily_city_air_quality`**
Nhà phân tích không quan tâm từng giây của 1 cái máy. Họ muốn xem chất lượng trung bình theo Ngày và theo Thành phố. Ta JOIN `silver_iot_metrics` với `dim_device` để lấy thành phố, tính AVG theo ngày.
| date | city | avg_temp_c | avg_pm25 | alert_level |
| :--- | :--- | :--- | :--- | :--- |
| 2026-06-07 | Hanoi | 30.5 | 45 | High |

---

## Best practices

* **Đừng quá cứng nhắc với 3 lớp**: Kiến trúc Medallion là Guideline, không phải Luật lệ. Tùy công ty, bạn có thể thiết kế thêm lớp "Landing/Staging" trước Bronze, hoặc tách lớp Gold thành nhiều Data Marts.
* **Lớp Silver là lõi tích hợp**: Khi tích hợp nhiều nguồn dữ liệu (Ví dụ dữ liệu khách hàng từ cả Salesforce và Shopify), hãy thực hiện việc hợp nhất và khử trùng (deduplication) tại lớp Silver để tạo ra một "Enterprise Customer View" duy nhất.
* **Không cấp quyền sửa/xóa thủ công**: Người dùng không bao giờ được phép can thiệp bằng câu lệnh Update/Delete thủ công vào bất kỳ lớp nào (kể cả Gold). Mọi sự thay đổi phải được thực hiện thông qua mã code (Git) của ETL pipeline.

---

## Common mistakes

* **Quên lưu dữ liệu gốc ở lớp Bronze**: Lọc và bỏ ngay lập tức các dòng JSON "có vẻ lỗi" ở ngay lúc Ingest (tải) dữ liệu xuống Data Lake. Hai tháng sau, Business thông báo đó là một loại giao dịch mới cần phân tích, nhưng dữ liệu gốc đã bị bạn xóa vĩnh viễn. (Nguyên tắc: Bronze là một bản ghi bất di bất dịch của vạn vật).
* **Thiết kế lớp Silver như một Star Schema**: Dùng Star Schema (Fact/Dimension) ở lớp Silver là sai lầm. Ở lớp Silver, dữ liệu chỉ cần được làm sạch và chuẩn hóa schema, giữ nguyên cấu trúc phẳng (Flat) gốc của thực thể. Star Schema chỉ nên được áp dụng ở tầng Gold phục vụ BI.

---

## Trade-offs

### Ưu điểm
* **Dễ tổ chức (Organizational Clarity)**: Mọi nhân viên (Data Engineer, Data Scientist, Data Analyst) đều biết họ nên kết nối và lấy dữ liệu từ đâu (Silver cho Machine Learning, Gold cho Báo cáo).
* **Bảo vệ hệ thống nguồn**: Các tác vụ tính toán nặng của lớp Gold không đụng gì đến Database thực tế của công ty. Nó chỉ lấy data từ lớp Silver/Bronze vốn nằm trên S3/GCS.
* **Rất dễ bảo trì và gỡ lỗi (Easy Debugging)**: Nếu một báo cáo Gold bị lỗi, ta có thể kiểm tra xem dữ liệu ở Silver có sai không. Nếu Silver đúng thì lỗi do code biến đổi từ Silver sang Gold. Rất dễ khoanh vùng sự cố.

### Nhược điểm
* **Trễ thời gian (Latency)**: Dữ liệu phải đi qua 3 trạm (Bronze $\rightarrow$ Silver $\rightarrow$ Gold) mới đến được tay người dùng cuối. Nếu pipeline được cấu hình chạy theo lô (Batch) thì độ trễ có thể lên đến hàng giờ.
* **Nhân bản dữ liệu (Data Duplication)**: Cùng một bộ dữ liệu nhưng tồn tại ở 3 trạng thái trên cùng 1 hệ thống lưu trữ, gây tốn kém ổ cứng (Mặc dù Cloud Storage hiện tại khá rẻ).

---

## When to use

* Khi bạn đang xây dựng kiến trúc **Data Lakehouse** (Đặc biệt là hệ sinh thái Databricks hoặc Spark).
* Doanh nghiệp có đội ngũ đa dạng: vừa có team Data Science cần data sạch chưa tổng hợp, vừa có team BI cần data tổng hợp theo báo cáo.
* Đường ống ETL phức tạp cần chia nhỏ thành các module để dễ quản lý.

## When not to use

* Với các startup siêu nhỏ dùng trực tiếp cơ sở dữ liệu OLTP làm nguồn báo cáo, hoặc dùng kiến trúc ELT ném thẳng vào Data Warehouse (như BigQuery) làm nơi biến đổi thì chỉ cần lớp Staging và Core/Mart (tương tự như tư duy truyền thống).

---

## Related concepts

* [Data Lakehouse](/concepts/lakehouse)
* [Delta Lake](/concepts/delta-lake)
* [Dimensional Modeling](/concepts/dimensional-modeling)
* [ETL / ELT](#)

---

## Interview questions

### 1. Tại sao các Data Scientists / Machine Learning Engineers thường lấy dữ liệu từ lớp Silver (Bạc) thay vì lấy dữ liệu từ lớp Gold (Vàng) vốn đã được thiết kế tối ưu rất đẹp?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết về sự khác biệt giữa Data Science/Machine Learning (Predictive) và Business Intelligence (Descriptive).
* **Gợi ý trả lời**: Mục tiêu của Machine Learning là tìm kiếm các "Patterns" (mẫu số bí ẩn) ở cấp độ hành vi chi tiết. Lớp Gold đã bị biến đổi cấu trúc thành Star Schema và đã bị "Aggregated" (tổng hợp/gom nhóm theo nhận thức của con người) để phục vụ cho các câu hỏi kinh doanh cụ thể. Khi dữ liệu bị tổng hợp, tính nhiễu (noise) và đặc trưng gốc của dữ liệu biến mất, làm mất đi "tín hiệu" để mô hình AI học hỏi. Lớp Silver cung cấp một lượng dữ liệu khổng lồ, chi tiết đến từng sự kiện (atomic grain), đã được dọn sạch rác, là nguyên liệu hoàn hảo nhất cho các thuật toán Machine Learning.

### 2. Nếu logic kinh doanh để tính toán Doanh thu bị thay đổi (ví dụ: giờ Doanh thu phải trừ đi phần hoàn tiền), bạn sẽ áp dụng sửa đổi này ở lớp nào trong Medallion Architecture và tại sao?
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết sâu sắc về vai trò của từng lớp dữ liệu.
* **Gợi ý trả lời**: Logic nghiệp vụ (Business logic/metrics calculation) luôn phải được áp dụng và sửa đổi ở đoạn biến đổi từ **Silver lên Gold**, tức là nằm gọn trong khu vực lớp Gold. 
*Lý do*: Lớp Silver có nhiệm vụ làm sạch kỹ thuật (Technical cleansing: xóa NULL, ép kiểu dữ liệu), nó phải phản ánh trung thực thực thể (Doanh thu gộp là A, Hoàn tiền là B). Việc quyết định "Net Revenue = A - B" là nhận thức của bộ phận kinh doanh. Việc sửa logic ở Silver sẽ vô tình bóp méo nguyên liệu đầu vào chung của cả hệ thống (bao gồm cả phòng ban khác có thể không đồng ý với công thức này). Lớp Gold mới là nơi dành cho các Business Rules.

---

## References

1. **Databricks Documentation**: "What is a Medallion Architecture?".
2. **Data Engineering with Databricks** (Các khóa học chứng chỉ của Databricks giải thích cực sâu về mô hình này).

---

## English summary

The Medallion Architecture is a data design pattern fundamentally associated with the Data Lakehouse (often popularized by Databricks) that logically organizes data flowing through a pipeline into three distinct zones: Bronze, Silver, and Gold. 
* **Bronze** ingests and stores raw, immutable data from source systems exactly as it arrives. 
* **Silver** contains cleansed, deduped, and conformed data providing an "Enterprise view" optimized for data scientists and downstream processing. 
* **Gold** houses highly refined, business-aggregated data typically modeled in star schemas specifically for Business Intelligence and dashboarding. 
This multi-hop approach guarantees modularity, traceability, and strict separation of concerns, decoupling raw data storage from complex business-logic aggregations.
