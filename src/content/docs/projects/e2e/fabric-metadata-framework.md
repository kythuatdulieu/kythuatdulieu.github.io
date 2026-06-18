---
title: "Fabric Metadata-Driven Framework (FMD): Tự Động Hóa Pipeline Trong Microsoft Fabric"
description: "Khám phá Fabric Metadata-Driven Framework (FMD) - một giải pháp giúp tự động hóa và tiêu chuẩn hóa các luồng dữ liệu (Data Pipeline) theo hướng siêu dữ liệu (Metadata-Driven) trên nền tảng Microsoft Fabric."
---

# Fabric Metadata-Driven Framework (FMD)

Trong kỷ nguyên của Data Lakehouse, việc xây dựng và duy trì hàng trăm data pipeline thủ công sẽ nhanh chóng biến thành "cơn ác mộng" bảo trì. Đó là lý do các hệ thống **Metadata-Driven** (điều khiển bằng siêu dữ liệu) ra đời. 

Hôm nay, chúng ta sẽ tìm hiểu về **Fabric Metadata-Driven Framework (FMD)** - một framework mã nguồn mở mạnh mẽ được thiết kế đặc biệt cho nền tảng Microsoft Fabric, cho phép bạn tự động hóa, điều phối và tiêu chuẩn hóa toàn bộ luồng dữ liệu.

> **Mã Nguồn (GitHub):** [kythuatdulieu/FMD_FRAMEWORK](https://github.com/kythuatdulieu/FMD_FRAMEWORK) *(Forked từ repo gốc của Erwin de Kreuk)*

---

## 1. FMD Framework Là Gì?

**FMD Framework** là một hệ thống cấu trúc sẵn (pre-built framework) xây dựng trên Microsoft Fabric. Nó áp dụng các quy chuẩn thiết kế Data Pipeline theo **Medallion Architecture** (Bronze - Silver - Gold) và tiếp cận theo tư duy **Lakehouse-First**.

Thay vì tạo riêng biệt hàng tá Data Factory Pipelines cho mỗi nguồn dữ liệu khác nhau (như SQL Server, API, Oracle, CSV files), FMD tập trung logic vào **Metadata** (các bảng cấu hình trong cơ sở dữ liệu). Hệ thống sẽ đọc các siêu dữ liệu này ở thời điểm thực thi (runtime) để tự động sinh ra các tham số và động (dynamic) xử lý dữ liệu.

### Tại sao lại chọn FMD Framework?
*   **Dynamic Pipelines (Động):** Tự động điều chỉnh quá trình thực thi pipeline dựa trên metadata. Lý tưởng cho môi trường đa luồng, đa nguồn dữ liệu.
*   **Sự Nhất Quán (Consistency):** Đảm bảo mọi bước từ Ingestion (thu thập) đến Publishing (công bố) đều tuân thủ một chuẩn duy nhất.
*   **Giảm Thiểu Nỗ Lực Kỹ Thuật:** Không cần "phát minh lại bánh xe", tái sử dụng các mẫu (patterns) có sẵn để đưa dữ liệu vào Lakehouse nhanh nhất.

---

## 2. Kiến Trúc Tổng Quan Của FMD

FMD Framework được thiết kế dưới dạng module, tách biệt rõ ràng giữa Dữ Liệu (Data), Mã Nguồn (Code) và Điều Phối (Orchestration).

### 2.1. Quản Trị Bằng Siêu Dữ Liệu (Metadata-Driven)
Trái tim của hệ thống là một cơ sở dữ liệu (Fabric SQL Database) làm nhiệm vụ lưu trữ Metadata. Nó chứa cấu hình về:
- Danh sách các nguồn dữ liệu (Source Connections).
- Tần suất chạy (Schedules).
- Các luật làm sạch dữ liệu (Cleansing Rules).
- Tình trạng xử lý của từng bảng (Load Statuses).

### 2.2. Medallion Architecture
FMD tích hợp chặt chẽ với kiến trúc huy chương của Databricks & Fabric:
*   **Bronze Layer:** Nơi dữ liệu thô (Raw) được đẩy vào một cách tự động thông qua tính năng Copy Data của Fabric.
*   **Silver Layer:** Sử dụng Fabric Notebooks (PySpark) được tham số hóa (Parameterized Notebooks) để làm sạch, khử trùng lặp và ghi dưới định dạng Delta Lake chuẩn hóa.
*   **Gold Layer:** Tạo các mô hình dữ liệu (Data Model) phục vụ cho PowerBI và Reporting.

### 2.3. Điều Phối Bằng Taskflow
Thay vì dùng các hệ thống orchestration bên ngoài như Apache Airflow, FMD tích hợp trực tiếp **Taskflow Orchestration** của Fabric Data Factory. Nó hỗ trợ:
- Kích hoạt tuần tự (Sequential) hoặc song song (Parallel) các chuỗi pipeline.
- Quản lý phụ thuộc (Dependencies) giữa các tiến trình.

### 2.4. Khả Năng Mở Rộng & Quản Lý Domain (Business Domains)
Khung FMD được thiết kế để mở rộng theo kiến trúc **Data Mesh**. Mới đây, FMD đã bổ sung tính năng *Business Domain Deployment*, giúp tự động triển khai cơ sở hạ tầng Fabric cho từng phòng ban nghiệp vụ (Sales, HR, Marketing) mà vẫn giữ được sự kiểm soát tập trung.

---

## 3. Quản Trị & Giám Sát (Governance & Observability)

Bên cạnh khả năng di chuyển dữ liệu, FMD giải quyết cực tốt bài toán **Data Observability**:
- Hệ thống tự động theo dõi số lượng bản ghi được xử lý (rows processed).
- Log lại trạng thái Load (Thành công, Thất bại) và Timestamp từng bước.
- Cung cấp Audit Logs hoàn chỉnh, dễ dàng tích hợp vào một Dashboard tổng quan để Team Data Engineering chủ động phát hiện sự cố trước khi User phàn nàn.

---

## 4. Tổng Kết

Nếu bạn đang chuyển dịch hệ thống dữ liệu của doanh nghiệp lên Microsoft Fabric (từ Synapse hoặc Azure Data Factory), **FMD Framework** là một lựa chọn "ăn liền" tuyệt vời. Việc tách biệt logic cấu hình khỏi mã nguồn (Code) giúp hệ thống của bạn mở rộng dễ dàng hàng ngàn Data Pipelines mà không phình to độ phức tạp. 

Tham khảo thêm cách cấu hình dữ liệu mẫu và tích hợp các nguồn tại [FMD Data Integration Wiki](https://github.com/edkreuk/FMD_FRAMEWORK/wiki).
