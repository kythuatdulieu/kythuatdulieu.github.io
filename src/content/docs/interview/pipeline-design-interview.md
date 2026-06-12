---
title: "Thiết kế Data Pipeline (Phỏng vấn) - Pipeline Design Interview"
category: "Interview Preparation"
difficulty: "Advanced"
tags: ["data-pipeline", "etl", "elt", "interview", "system-design", "fault-tolerance"]
readingTime: "16 mins"
lastUpdated: 2026-06-12
seoTitle: "Pipeline Design Interview - Thiết kế Data Pipeline hệ thống dữ liệu"
metaDescription: "Hướng dẫn thiết kế kiến trúc Data Pipeline (ETL/ELT) trong phỏng vấn Data Engineering: Khả năng mở rộng, tính lũy đẳng (Idempotency) và Data Quality."
definition: "Cẩm nang phỏng vấn thiết kế Data Pipeline (ETL/ELT) cho Data Engineer: Đảm bảo tính lũy đẳng (Idempotency), kiến trúc Medallion, xử lý dữ liệu đến muộn và Change Data Capture (CDC)."
---

Trong quy trình tuyển dụng Data Engineer (từ cấp độ Mid, Senior cho đến Staff), vòng phỏng vấn **Thiết kế [Data Pipeline](/concepts/1-foundations/foundation/data-pipeline/)** (đôi khi gọi là System Design cho Data) luôn là vòng thi quan trọng nhất. Vòng này kiểm tra toàn diện khả năng tư duy hệ thống, thiết kế kiến trúc và giải quyết các bài toán dữ liệu thực tế của ứng viên.

---

## Khi đường ống dữ liệu đối mặt với thực tế tàn khốc

Môi trường Production thực tế luôn diễn ra vô số sự cố ngoài tầm kiểm soát: các đối tác API đột ngột thay đổi cấu trúc dữ liệu mà không báo trước, cụm Apache Spark bị tràn bộ nhớ RAM giữa chừng, đường truyền internet bị gián đoạn, hay dữ liệu rác trôi vào làm hỏng toàn bộ báo cáo doanh thu gửi ban giám đốc. 

Nhà tuyển dụng muốn thông qua vòng phỏng vấn này để đánh giá xem hệ thống bạn thiết kế có đủ bền bỉ để đứng vững trước những sóng gió đó hay không, hay nó sẽ dễ dàng bị gãy đổ và bắt các kỹ sư phải thức đêm để chạy lại luồng dữ liệu một cách thủ công.

---

## Bản chất của việc thiết kế Data Pipeline

Thiết kế một đường ống dữ liệu (Data Pipeline) không đơn thuần chỉ là vẽ các mũi tên kết nối các công cụ lại với nhau (ví dụ vẽ sơ đồ: *Airbyte $\rightarrow$ S3 $\rightarrow$ Spark $\rightarrow$ [Snowflake](/concepts/2-storage/cloud-data-platform/snowflake/)*). 

Đó là quá trình bạn phải định nghĩa chi tiết toàn bộ vòng đời của dữ liệu:
* **Phương thức trích xuất**: Kéo dữ liệu (Pull) hay đẩy dữ liệu (Push)?
* **Tần suất cập nhật**: Xử lý theo lô (Batch) hay thời gian thực (Streaming)?
* **Mô hình biến đổi**: [ETL](/concepts/3-integration/etl-elt/etl/) (Extract - Transform - Load) truyền thống hay [ELT](/concepts/3-integration/etl-elt/elt/) (Extract - Load - Transform) hiện đại?
* **Khả năng phục hồi**: Làm thế nào để xử lý dữ liệu bị trễ (Late arriving data), cơ chế báo lỗi, và chiến lược nạp lại dữ liệu lịch sử (Backfilling) an toàn?

---

## Những nguyên tắc thiết kế sống còn đối với một kỹ sư dữ liệu

* **Tính lũy đẳng (Idempotency)**: Đây là nguyên tắc quan trọng bậc nhất. Một pipeline dù được chạy 1 lần hay 100 lần với cùng một tham số đầu vào (ví dụ: cùng chạy cho ngày hôm qua) thì kết quả cuối cùng ghi nhận trong Data Warehouse phải hoàn toàn trùng khớp nhau, tuyệt đối không được xảy ra hiện tượng nhân đôi dữ liệu.
* **Tách rời Compute và Storage**: Phân tách rõ ràng tài nguyên tính toán (như Spark, dbt) và tài nguyên lưu trữ (như S3, BigQuery) để hệ thống có thể co giãn tài nguyên một cách độc lập và giúp tiết kiệm tối đa chi phí hạ tầng.
* **Chốt chặn chất lượng dữ liệu (Data Quality Gates)**: Xây dựng các cơ chế tự động kiểm tra tính bất thường (Anomalies) hoặc sai lệch định dạng dữ liệu ở ngay đầu vào và giữa các tầng lưu trữ, ngăn chặn triệt để tình trạng dữ liệu rác chảy vào các báo cáo cuối (áp dụng triết lý *Garbage in, Garbage out*).
* **Khả năng Backfill dễ dàng**: Cho phép hệ thống dễ dàng nạp lại dữ liệu của một khoảng thời gian bất kỳ trong quá khứ khi phát hiện lỗi nghiệp vụ mà không làm ảnh hưởng hay xáo trộn dữ liệu của các ngày khác.

---

## Bộ khung tư duy giải quyết bài toán thiết kế Pipeline

1. **Xác định quy mô hệ thống (Scope the System)**: Làm rõ dung lượng dữ liệu cần xử lý hàng ngày (Gigabytes, Terabytes hay Petabytes), định dạng của nguồn dữ liệu đầu vào (JSON, CSV, DB logs) và yêu cầu về tần suất cập nhật dữ liệu (Real-time, Hourly hay Daily).
2. **Thiết kế kiến trúc tổng thể (High-Level Design)**: Đưa ra lựa chọn mô hình ETL hay ELT, và lựa chọn công nghệ lưu trữ tương ứng (Object Storage hay Cloud [Data Warehouse](/concepts/2-storage/data-warehouse/data-warehouse/)).
3. **Thu nhận dữ liệu ([Data Ingestion](/concepts/3-integration/etl-elt/data-ingestion/))**: Thiết kế luồng kéo dữ liệu định kỳ hay bắt sự kiện thay đổi. Thảo luận cách thức tải dữ liệu tăng thêm ([Incremental Load](/concepts/3-integration/etl-elt/incremental-load/)) thay vì tải lại toàn bộ.
4. **Biến đổi và Lưu trữ (Transformation & Storage)**: Thiết kế luồng dữ liệu đi qua các tầng của kiến trúc Medallion (từ tầng thô Bronze, tầng làm sạch Silver cho đến tầng tổng hợp Gold).
5. **Điều phối và Quan sát ([Orchestration](/concepts/3-integration/orchestration/orchestration/) & Observability)**: Đề xuất các công cụ điều phối (như [Apache Airflow](/concepts/3-integration/orchestration/apache-airflow/), Dagster), thiết lập cơ chế giám sát lỗi, theo dõi nguồn gốc dữ liệu ([Data Lineage](/concepts/5-quality-governance/governance-metadata/data-lineage/)) và tự động chạy lại (Retry) khi gặp lỗi tạm thời.

---

## Trực quan hóa kiến trúc Medallion trong mô hình ELT

Sơ đồ dưới đây mô tả luồng di chuyển dữ liệu áp dụng kiến trúc Medallion kết hợp mô hình ELT hiện đại:

```mermaid
graph LR
    subgraph "Data Sources"
        A["PostgreSQL OLTP"]
        B["Third-party API"]
    end

    subgraph "Data Ingestion"
        C["Airbyte / Fivetran"]
    end

    subgraph "Cloud Data Warehouse"
        D["(Bronze: Raw Data)"]
        E["(Silver: Clean & Join)"]
        F["(Gold: Data Marts)"]
        D -. "dbt (Transform)" .-> E
        E -. "dbt (Transform)" .-> F
    end

    subgraph "Orchestration & Monitoring"
        G["Apache Airflow"]
        H["Great Expectations / dbt tests"]
    end

    A -->|"CDC"| C
    B -->|"REST / Batch"| C
    C -->|"Load (EL)"| D
    G -. "Trigger Ingestion" .-> C
    G -. "Trigger Transform" .-> D
    H -. "Data Quality Check" .-> E
```

---

## Tình huống thực tế: Thiết kế pipeline đối soát giao dịch ngân hàng

**Đề bài từ người phỏng vấn**: *"Hãy thiết kế một hệ thống Data Pipeline thu thập thông tin giao dịch hàng ngày để phục vụ báo cáo đối soát tài chính (Reconciliation). Nguồn dữ liệu đến từ một hệ thống cơ sở dữ liệu Oracle cũ kỹ của ngân hàng."*

**Phân tích & Hướng thiết kế**:
* **Ingestion (Thu nhận)**: Do hệ thống cơ sở dữ liệu Oracle cũ không thể chịu nổi các truy vấn quét dữ liệu lớn hàng ngày, tôi sẽ không dùng phương thức Full Load. Thay vào đó, tôi thiết lập cơ chế bắt sự kiện thay đổi dữ liệu (CDC - [Change Data Capture](/concepts/3-integration/etl-elt/change-data-capture/)) bằng cách dùng Debezium để đọc file ghi nhật ký giao dịch (Transaction Log) của Oracle, sau đó đẩy các sự kiện INSERT/UPDATE/DELETE này vào Kafka.
* **Storage (Lưu trữ thô)**: Viết một chương trình Consumer để đẩy dữ liệu từ Kafka xuống Amazon S3 (Bronze Layer) theo định dạng Parquet để tối ưu hóa hiệu năng đọc ghi, phân chia phân vùng theo ngày xảy ra giao dịch (`year/month/day/`).
* **Transformation (Biến đổi)**: Sử dụng [Apache Spark](/concepts/3-integration/batch-processing/apache-spark/) (hoặc [dbt](/concepts/3-integration/transformation-analytics/dbt/) trên Snowflake) để đọc dữ liệu từ tầng Bronze, tiến hành loại bỏ các bản ghi trùng lặp (do cơ chế At-least-once của Kafka), áp dụng cấu trúc bảng (schema) chuẩn hóa và lưu trữ kết quả đã làm sạch vào tầng Silver.
* **Orchestration (Điều phối)**: Cấu hình Apache Airflow chạy định kỳ vào 00:30 sáng hàng ngày để kích hoạt các job tính toán tổng hợp dữ liệu từ tầng Silver sang Gold Layer để phục vụ trực tiếp cho báo cáo đối soát.
* **[Data Quality](/concepts/5-quality-governance/data-quality/data-quality/) (Kiểm soát chất lượng)**: Chèn thêm bước kiểm tra dữ liệu tự động giữa tầng Silver và Gold: so sánh tổng số tiền giao dịch tính được với checksum từ hệ thống nguồn gửi sang. Nếu phát hiện độ lệch vượt quá 0.01%, hệ thống sẽ lập tức dừng quy trình báo cáo và gửi cảnh báo khẩn cấp qua Slack cho đội vận hành.

---

## Điểm mạnh và điểm yếu

Khi thiết kế đường ống dữ liệu, hai mô hình vận hành phổ biến là **Xử lý theo lô (Batch Processing)** và **Xử lý thời gian thực (Streaming Processing)**:

### Kiến trúc Xử lý theo lô (Batch)
* **Điểm mạnh (Pros)**: Cực kỳ vững chắc, dễ kiểm tra chất lượng dữ liệu và bảo đảm tính lũy đẳng (chỉ cần xóa dữ liệu phân vùng cũ và chạy lại). Chi phí hạ tầng rẻ vì máy chủ chỉ bật lên tính toán ở các khung giờ cố định và tắt đi khi hoàn thành.
* **Điểm yếu (Cons)**: Độ trễ dữ liệu (Data Latency) cao. Người dùng kinh doanh phải đợi đến ngày hôm sau mới xem được kết quả phân tích của ngày hôm trước.

### Kiến trúc Xử lý thời gian thực (Streaming)
* **Điểm mạnh (Pros)**: Độ trễ cực thấp (tính bằng giây/mili-giây), cho phép ra quyết định kinh doanh hoặc phát hiện gian lận thẻ tín dụng tức thì.
* **Điểm yếu (Cons)**: Lập trình cực kỳ phức tạp (xử lý dữ liệu đến trễ, quản lý trạng thái, cửa sổ thời gian lồng nhau). Chi phí vận hành đắt đỏ do hệ thống máy chủ thu nạp dữ liệu và tính toán phải duy trì hoạt động liên tục 24/7.

---

## Khi nào nên dùng

* **Nên dùng Batch Pipeline**: Cho các báo cáo tài chính chính thức, đối soát doanh thu cuối ngày, tính toán lương thưởng nhân sự — những tác vụ yêu cầu tính chính xác 100% và không đòi hỏi phản hồi tức thì.
* **Nên dùng Streaming Pipeline**: Chỉ áp dụng khi nghiệp vụ kinh doanh thực sự cần (ví dụ: phát hiện gian lận thẻ tín dụng, hệ thống gợi ý sản phẩm khi khách đang lướt web, theo dõi vị trí tài xế gọi xe).
* **Nên dùng mô hình ELT**: Thích hợp khi lưu trữ dữ liệu trên các Cloud Data Warehouse hiện đại (Snowflake, BigQuery) để tận dụng tối đa năng lực xử lý phân tán của chúng và giúp code SQL rõ ràng hơn.

---

## Trọng tâm ôn luyện phỏng vấn

Dưới đây là 3 tình huống phỏng vấn thực tế giả định kiểm tra năng lực thiết kế Data Pipeline bền bỉ:

### Tình huống 1: Khắc phục lỗi trùng lặp dữ liệu do Airflow Scheduler chạy trùng Job
**Câu hỏi**: *"Đêm qua, do lỗi bộ điều phối của Airflow scheduler, job tính toán doanh thu của chúng tôi đã bị kích hoạt chạy song song 2 lần. Kết quả là báo cáo trên dashboard của ban giám đốc hiển thị số liệu doanh thu bị nhân đôi hoàn toàn. Bạn sẽ triage sự cố này, thực hiện backfill khắc phục dữ liệu thế nào, và refactor code ra sao để đảm bảo lỗi này không bao giờ xảy ra nữa?"*

**Trả lời (Quy trình Triage-Mitigate-Communicate-RCA)**:
* **Triage**: Nhận báo cáo từ ban giám đốc về số liệu doanh thu bị nhân đôi. Xác nhận Airflow log ghi nhận task `calculate_revenue` chạy song song 2 luồng cùng lúc cho run_date ngày hôm qua. Mức độ ảnh hưởng là Sev-1 vì trực tiếp làm sai số liệu tài chính.
* **Mitigate**: Đăng thông báo khẩn cấp lên Slack `#data-alerts` và treo nhãn cảnh báo hiệu chỉnh dữ liệu trên dashboard BI. Thực hiện chạy script khẩn cấp để xóa phân vùng dữ liệu ngày hôm qua trong bảng doanh thu.
* **Action (RCA & Refactoring)**:
  1. *Nguyên nhân*: Mã nguồn SQL sử dụng cú pháp `INSERT INTO fact_revenue SELECT ...` (Append-only). Khi chạy 2 lần, dữ liệu bị chèn đè trùng lặp.
  2. *Refactor sang Idempotent*: Tôi sửa lại code SQL biến đổi dữ liệu sang cơ chế ghi đè phân vùng (Overwrite) dựa trên cột ngày chạy:
     `INSERT OVERWRITE TABLE fact_revenue PARTITION(event_date='2026-06-11') SELECT ...` (đối với Spark/Hive) hoặc viết câu lệnh `MERGE INTO fact_revenue USING (...) ON fact_revenue.transaction_id = source.transaction_id WHEN MATCHED THEN UPDATE... WHEN NOT MATCHED THEN INSERT...` (đối với Delta Lake/Snowflake).
  3. *Backfill*: Chạy lại Airflow DAG cho ngày hôm qua. Nhờ cơ chế ghi đè mới, dữ liệu bị trùng lập lập tức bị dọn sạch và thay bằng dữ liệu chuẩn duy nhất.
* **Result**: Số liệu báo cáo trở lại nhất quán hoàn toàn. Từ nay trở đi, dù job có bị kích hoạt chạy lại bao nhiêu lần, dữ liệu vẫn không bao giờ bị nhân đôi.

### Tình huống 2: Thiết kế giải pháp xử lý dữ liệu IoT đến muộn (Late-Arriving Data)
**Câu hỏi**: *"Vào ngày Chủ nhật, trạm phát sóng di động gặp sự cố khiến hàng triệu thiết bị IoT bị mất kết nối. Khi có mạng trở lại vào sáng thứ Hai, các thiết bị này đồng loạt gửi dữ liệu của ngày Chủ nhật về hệ thống. Dashboard báo cáo hiển thị số liệu ngày Chủ nhật bị thiếu hụt, còn ngày thứ Hai lại tăng vọt bất thường. Hãy giải thích nguyên nhân và đề xuất phương án thiết kế khắc phục."*

**Trả lời (Khung STAR)**:
* **Situation**: Dữ liệu gửi muộn làm sai lệch báo cáo thống kê theo ngày do hệ thống phân loại sai mốc thời gian.
* **Task**: Thiết kế giải pháp phân tách Event Time và Processing Time để tự động hiệu chỉnh dữ liệu lịch sử đến muộn.
* **Action**:
  1. *Phân tích*: Sự cố xảy ra do pipeline phân vùng dữ liệu dựa trên thời gian hệ thống nhận được dữ liệu (Processing Time - ngày thứ Hai). Dẫn đến dữ liệu thực tế phát sinh vào ngày Chủ nhật (Event Time) lại bị ghi nhận vào thư mục của ngày thứ Hai.
  2. *Giải pháp*: Tôi tái cấu trúc pipeline để luôn phân vùng dữ liệu dựa trên **Event Time** (cột timestamp ghi nhận trực tiếp từ cảm biến thiết bị).
  3. Để xử lý việc dữ liệu đến trễ, tôi sử dụng câu lệnh `MERGE INTO fact_sensor_data` thay vì append. Khi dữ liệu của ngày Chủ nhật truyền đến vào ngày thứ Hai, câu lệnh MERGE sẽ tự động định tuyến dữ liệu vào phân vùng ngày Chủ nhật và thực hiện ghi đè hoặc bổ sung bản ghi tương ứng.
  4. Cấu hình cơ chế Watermarking (ví dụ 24 giờ) trong Spark Streaming để cho phép giữ cửa sổ trạng thái bộ nhớ đệm và chấp nhận dữ liệu đến muộn trong vòng 1 ngày.
* **Result**: Số liệu của ngày Chủ nhật tự động được cập nhật đầy đủ và chính xác sau khi thiết bị gửi bù dữ liệu, báo cáo ngày thứ Hai không còn bị tăng vọt ảo.

### Tình huống 3: Di chuyển pipeline Ingestion từ Full Scan sang Change Data Capture (CDC)
**Câu hỏi**: *"Chúng tôi đang chạy một batch job hàng đêm quét toàn bộ bảng giao dịch kích thước 50TB bằng lệnh `SELECT *` từ cơ sở dữ liệu SQL Server nguồn để nạp vào Data Lake. Job này liên tục bị quá hạn thời gian chạy (Timeout) và làm khóa bảng nguồn, khiến người dùng ứng dụng bị lỗi nghẽn API. Bạn sẽ thiết kế lại pipeline này thế nào?"*

**Trả lời (Khung STAR)**:
* **Situation**: Quét toàn bộ bảng 50TB hàng đêm làm nghẽn I/O hệ thống nguồn và gây lỗi API cho khách hàng.
* **Task**: Thiết kế một giải pháp nạp dữ liệu tăng thêm (Incremental Ingestion) không xâm lấn hệ thống nguồn.
* **Action**:
  1. *Lựa chọn công nghệ*: Tôi loại bỏ hoàn toàn cơ chế quét bảng ad-hoc theo giờ. Thay vào đó, tôi đề xuất áp dụng **Change Data Capture (CDC)** bằng cách sử dụng Debezium kết hợp Apache Kafka.
  2. *Cấu hình CDC*: Debezium sẽ đọc trực tiếp Transaction Log của SQL Server dưới nền (không lock bảng, không tốn tài nguyên CPU truy vấn). Mỗi khi có sự kiện INSERT, UPDATE hay DELETE phát sinh, sự kiện sẽ được gửi tức thì dưới dạng JSON/Avro vào Kafka topic `sqlserver_transactions`.
  3. *Ghi Data Lake*: Viết một Kafka Connect consumer để ghi trực tiếp luồng sự kiện từ Kafka xuống S3 Bronze Layer theo cơ chế chia nhỏ file nhỏ 128MB.
  4. *Hợp nhất dữ liệu (Compaction)*: Viết một job chạy Spark SQL hàng đêm để thực hiện `MERGE INTO` từ bảng Bronze (chỉ chứa các sự kiện thay đổi trong ngày) sang bảng Silver chính trong Data Warehouse.
* **Result**: Loại bỏ hoàn toàn hiện tượng khóa bảng nguồn. Thời gian nạp dữ liệu giảm từ 6 tiếng xuống còn luồng streaming thời gian thực dưới 5 giây, tải CPU của database nguồn giảm xuống dưới 10%.

---

## English Summary

The Pipeline Design Interview evaluates a candidate's capability to build scalable, resilient, and accurate data movement systems. It focuses heavily on crucial principles such as [Idempotency](/concepts/3-integration/etl-elt/idempotency/) (ensuring multiple pipeline runs produce the exact same outcome without data duplication), decoupling storage and compute, handling late-arriving data, and implementing data quality checks (Data Contracts/WAP pattern). Candidates should be prepared to discuss the trade-offs between Batch and Streaming architectures, justify the shift from ETL to ELT (e.g., using [Medallion Architecture](/concepts/2-storage/data-lake-lakehouse/medallion-architecture/) with dbt and cloud warehouses), and design robust data ingestion strategies using Change Data Capture (CDC) over repetitive full database loads.

---

## Xem thêm các khái niệm liên quan

* [CDC (Change Data Capture)](../concepts/3-integration/etl-elt/change-data-capture/) - Bắt sự kiện thay đổi dữ liệu từ log.
* [Tính lũy đẳng (Idempotency)](../concepts/3-integration/etl-elt/idempotency/) - Đảm bảo pipeline không trùng lặp dữ liệu.
* [Orchestration (Điều phối)](../concepts/3-integration/orchestration/orchestration/) - Quản lý DAG phụ thuộc trong hệ thống dữ liệu.

---

## Tài liệu tham khảo

1. [AWS Data Pipeline Developer Guide - Architecture and Best Practices](https://docs.aws.amazon.com/datapipeline/latest/DeveloperGuide/what-is-datapipeline.html)
2. [Google Cloud Dataflow - Stream and Batch Data Processing Guides](https://cloud.google.com/dataflow/docs/)
3. [Databricks Glossary - Medallion Architecture Implementation References](https://www.databricks.com/glossary/medallion-architecture)
4. [Apache Airflow Official Documentation - Best Practices for Pipeline Scheduling](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html)
5. [Snowflake Cloud Guide - Continuous Data Loading Best Practices](https://docs.snowflake.com/en/user-guide/data-load-considerations)
