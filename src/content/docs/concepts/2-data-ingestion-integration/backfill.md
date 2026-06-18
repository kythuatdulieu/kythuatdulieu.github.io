---
title: "Backfill"
difficulty: "Beginner"
tags: ["backfill", "etl", "data-pipeline", "data-engineering", "orchestration"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Backfill trong Kỹ thuật Dữ liệu - Chiến lược xử lý và cập nhật dữ liệu lịch sử"
metaDescription: "Khái niệm Backfill là gì trong Data Engineering? Các trường hợp cần chạy quy trình backfill lịch sử, thách thức và chiến lược xử lý hiệu quả với Airflow, dbt."
description: "Backfill là quá trình xử lý, cập nhật hoặc khôi phục dữ liệu cho một khoảng thời gian trong quá khứ. Đây là một tác vụ quan trọng và diễn ra thường xuyên trong Kỹ thuật Dữ liệu."
---



Trong trạng thái vận hành bình thường, một đường ống dẫn dữ liệu ([Data Pipeline](/concepts/1-distributed-systems-architecture/data-pipeline)) thường sẽ tải và xử lý dữ liệu mới được sinh ra mỗi ngày (hoặc mỗi giờ). Tuy nhiên, mọi thứ hiếm khi hoàn hảo. Bạn sẽ thường xuyên đối mặt với việc cần phải xử lý lại dữ liệu của quá khứ. Quá trình đó được gọi là **Backfill** (Điền lấp lịch sử / Chạy bù).

## 1. Backfill là gì?

**Backfill** là quá trình chạy lại (hoặc chạy bù) Data Pipeline cho một hoặc nhiều khoảng thời gian trong quá khứ. 

Trong kiến trúc dữ liệu hiện đại, thay vì xử lý lại toàn bộ cơ sở dữ liệu mỗi ngày (Full Refresh), các pipeline thường chạy theo kiểu **Incremental** (Tăng dần). Nghĩa là, pipeline chạy ngày hôm nay sẽ chỉ xử lý dữ liệu sinh ra của ngày hôm qua. Nhưng nếu bạn cần áp dụng một logic xử lý mới cho dữ liệu của 3 năm trước, bạn không thể chỉ đợi pipeline tự động chạy tiếp. Bạn cần kích hoạt một tiến trình Backfill để rà soát và xử lý lại dữ liệu lịch sử đó.

## 2. Khi nào bạn cần thực hiện Backfill?

Backfill là một tác vụ rất phổ biến và có thể xuất phát từ nhiều nguyên nhân khác nhau:

### 2.1. Bổ sung dữ liệu mới (New Data / Metrics / Columns)
- **Thêm cột mới:** Đội Data Science cần một feature mới (ví dụ: `customer_lifetime_value`) cho mô hình Machine Learning. Pipeline hiện tại bắt đầu tính toán nó từ hôm nay, nhưng mô hình ML cần dữ liệu của 2 năm qua để huấn luyện. Bạn phải backfill cột này cho 2 năm lịch sử.
- **Tạo bảng tổng hợp mới (Data Mart):** Doanh nghiệp ra mắt một dashboard mới để theo dõi "hành vi người dùng hàng ngày". Dashboard cần hiển thị biểu đồ xu hướng trong 6 tháng qua. Bạn cần backfill dữ liệu cho bảng tổng hợp này bắt đầu từ 6 tháng trước.

### 2.2. Khắc phục sự cố và sửa lỗi (Bug Fixes)
- **Lỗi logic tính toán:** Bạn phát hiện ra rằng công thức tính "Doanh thu thuần" bị sai trong 3 tuần vừa qua (ví dụ: quên trừ đi thuế). Sau khi sửa code, bạn cần backfill dữ liệu của 3 tuần đó để có con số chính xác.
- **Pipeline bị hỏng (Downtime / Failure):** Hệ thống Source (database gốc hoặc API của bên thứ 3) bị lỗi và không trả về dữ liệu trong 2 ngày. Pipeline của bạn thất bại. Khi hệ thống Source hoạt động trở lại, bạn phải backfill (chạy bù) cho 2 ngày bị thiếu.

### 2.3. Dữ liệu đến muộn (Late-arriving Data)
Một số dữ liệu không được gửi về hệ thống ngay lập tức (ví dụ: người dùng sử dụng app offline và chỉ đồng bộ dữ liệu khi có mạng sau đó vài ngày). Nếu pipeline chạy hàng ngày đã tổng hợp dữ liệu của hôm qua, bạn cần có cơ chế backfill định kỳ để tính toán lại và bao gồm cả những bản ghi "đến muộn" này.

### 2.4. Di chuyển dữ liệu (Data Migration)
Khi chuyển đổi từ hệ thống cũ sang hệ thống mới (ví dụ: từ kho dữ liệu On-premise lên Snowflake trên Cloud), bạn cần đồng bộ toàn bộ dữ liệu lịch sử bằng cách sử dụng các tác vụ backfill lịch sử (Historical Backfill).

## 3. Những thách thức khi thực hiện Backfill

Nghe có vẻ đơn giản là "chỉ cần chạy lại code cho những ngày cũ", nhưng thực tế, Backfill ở quy mô lớn là cơn ác mộng nếu pipeline không được thiết kế tốt ngay từ đầu.

### 3.1. Tính không thay đổi (Idempotency)
Đây là khái niệm quan trọng nhất đối với Backfill. Một pipeline **idempotent** nghĩa là nếu bạn chạy nó 1 lần, 10 lần hay 100 lần cho cùng một khoảng thời gian, kết quả cuối cùng trong Data Warehouse vẫn phải giống hệt nhau (không tạo ra dữ liệu trùng lặp). 
Nếu pipeline của bạn dùng lệnh `INSERT` thay vì `MERGE` (hoặc `DELETE` rồi `INSERT`), việc backfill sẽ làm nhân đôi dữ liệu.

### 3.2. Hiệu năng và Chi phí (Performance & Cost)
- Chạy pipeline cho 1 ngày tốn 5 phút và 1 USD. Backfill cho 3 năm (1095 ngày) có thể tốn gần 4 ngày và hàng nghìn USD nếu chạy tuần tự.
- Chạy song song (Parallel) có thể làm sập hệ thống cơ sở dữ liệu nguồn (Source DB) hoặc vượt quá hạn mức API (Rate Limit) của bên thứ 3.

### 3.3. Dữ liệu nguồn đã thay đổi (Source Data Mutability)
Bạn muốn backfill dữ liệu của tháng trước, nhưng hệ thống nguồn không lưu trữ trạng thái lịch sử (không có cơ chế Change Data Capture - CDC). Ví dụ: Bảng `User` bị cập nhật trực tiếp `status` từ `active` sang `inactive`. Khi bạn backfill, bạn sẽ lấy trạng thái `inactive` hiện tại và gán nhầm cho dữ liệu lịch sử của tháng trước, làm sai lệch báo cáo quá khứ.

### 3.4. Phụ thuộc chuỗi (Dependency Chain)
Bảng A tạo ra B, B tạo ra C, C tạo ra D. Khi bạn sửa lỗi ở B, bạn không chỉ backfill B, mà phải backfill cả C và D theo đúng thứ tự (B xong mới đến C, C xong mới đến D). Điều này đòi hỏi công cụ Orchestration (như Airflow) hỗ trợ quản lý phụ thuộc (dependencies).

## 4. Các chiến lược thực hiện Backfill

Tùy vào công cụ, nguồn lực và yêu cầu nghiệp vụ, bạn có thể áp dụng các chiến lược sau:

### 4.1. Full Refresh (Làm mới toàn bộ)
Thay vì backfill từng ngày, bạn xóa trắng bảng đích và chạy lại toàn bộ dữ liệu lịch sử trong một truy vấn lớn.
- **Ưu điểm:** Nhanh chóng, đơn giản, không lo về Idempotency.
- **Nhược điểm:** Rất tốn kém (compute cost), không thể thực hiện nếu bảng có hàng tỷ bản ghi. Có thể gây gián đoạn (Downtime) cho người dùng cuối khi bảng đang bị xóa.

### 4.2. Chunking / Windowing (Chia nhỏ theo cửa sổ thời gian)
Khi lịch sử quá lớn, chia nhỏ tiến trình backfill theo tuần, tháng hoặc quý thay vì từng ngày.
- **Ví dụ:** Thay vì chạy 365 job cho 1 năm, bạn cấu hình chạy 12 job (mỗi job xử lý 1 tháng).

### 4.3. Backfill song song (Parallel Backfill) với giới hạn đồng thời (Concurrency Limits)
Kích hoạt chạy song song nhiều khoảng thời gian cùng lúc. Tuy nhiên, phải thiết lập giới hạn (ví dụ: tối đa 5 ngày chạy song song) để không làm quá tải Data Warehouse hoặc làm tắc nghẽn các Pipeline hàng ngày đang chạy bình thường.

### 4.4. Reverse Backfilling (Backfill ngược)
Trong nhiều trường hợp, báo cáo dữ liệu của các ngày gần đây quan trọng hơn dữ liệu của 2 năm trước. Reverse backfill sẽ xử lý theo thứ tự giảm dần: chạy ngày hôm qua, rồi ngày kia, lùi dần về quá khứ. Nhờ đó, người dùng có thể thấy và sử dụng dữ liệu mới nhất sớm nhất có thể trong khi quá trình backfill vẫn tiếp diễn.

## 5. Backfill trong các công cụ Data Engineering

Các công cụ hiện đại cung cấp nhiều tính năng để hỗ trợ quá trình Backfill:

### Apache Airflow
Airflow được thiết kế với tư duy về mặt thời gian (`execution_date`). Lệnh CLI của Airflow hỗ trợ backfill một khoảng thời gian cụ thể một cách dễ dàng:
```bash
airflow dags backfill my_dag_name \
    --start-date 2023-01-01 \
    --end-date 2023-12-31 \
    --max-active-runs 5
```
Airflow sẽ tạo ra các DagRuns tương ứng với từng ngày trong khoảng thời gian trên, tôn trọng cấu trúc phụ thuộc (dependencies) của DAG. *Lưu ý:* tính năng `--catchup` trong Airflow cũng tự động backfill khi bạn mới khởi tạo một DAG với `start_date` trong quá khứ.

### dbt (Data Build Tool)
dbt xử lý backfill thông qua cấu hình `incremental_strategy`. Nếu cần backfill lại từ đầu (Full Refresh) cho một mô hình incremental:
```bash
dbt run --select my_incremental_model --full-refresh
```
Tuy nhiên, nếu bảng quá lớn, dbt cung cấp các gói mở rộng (như `dbt_utils.insert_by_period`) để backfill theo từng chunk (tháng/tuần). Hoặc bạn có thể lợi dụng biến số (variables) trong dbt để filter khoảng thời gian cần chạy lại.

### Apache Iceberg / Delta Lake
Các định dạng bảng dữ liệu mở (Open Table Formats) hỗ trợ **Time Travel** và **ACID Transactions**. Khi thực hiện backfill, bạn có thể `MERGE` dữ liệu một cách an toàn mà không lo hỏng cấu trúc đang đọc, hoặc thậm chí khôi phục lại (Rollback) toàn bộ phiên bản (Snapshot) trước khi backfill nếu có lỗi xảy ra.

## 6. Các Best Practices cho Backfill

1. **Thiết kế Idempotent Pipeline:** Luôn sử dụng `UPSERT` (hoặc `DELETE` trước khi `INSERT`) thay vì `INSERT` trực tiếp. Cột `updated_at` hoặc `execution_date` luôn cần thiết.
2. **Cô lập tài nguyên (Resource Isolation):** Cấu hình một hàng đợi (Queue) riêng hoặc Cụm máy chủ (Warehouse/Cluster) riêng cho các tác vụ Backfill. Đừng để một tiến trình backfill dữ liệu của 3 năm trước chiếm dụng tài nguyên và làm chậm pipeline hàng ngày đang xử lý dữ liệu của hôm qua.
3. **Chạy thử nghiệm (Dry Run/Shadow Mode):** Trước khi chạy trên Production, hãy thử backfill 1 tuần vào môi trường Staging/Dev để đo lường thời gian chạy và kiểm tra tính chính xác của dữ liệu.
4. **Thông báo cho Stakeholders:** Backfill có thể làm thay đổi các con số trên dashboard lịch sử. Hãy thông báo rõ ràng cho đội ngũ Business / Data Analysts lý do tại sao chỉ số của tháng trước hôm nay lại khác đi.
5. **Ghi log đầy đủ (Audit logging):** Đảm bảo bạn lưu lại ai là người kích hoạt backfill, vì lý do gì, và thời gian chạy từ lúc nào đến lúc nào.

## Tổng Kết
Backfill không phải là một công việc làm một lần rồi thôi (one-off task). Trong sự nghiệp Data Engineering, bạn sẽ cần backfill thường xuyên. Thiết kế các đường ống dẫn dữ liệu theo nguyên tắc **Idempotent** và quản lý phụ thuộc (dependencies) rõ ràng sẽ giúp những lần backfill trở nên nhẹ nhàng và tránh rủi ro phá hỏng hệ thống phân tích của toàn công ty.

## Tài Liệu Tham Khảo
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* [Airflow Documentation on Backfill](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dag-run.html#backfill)
* [dbt Incremental Models](https://docs.getdbt.com/docs/build/incremental-models)
