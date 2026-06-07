---
title: "Backfill"
category: "ETL / ELT"
difficulty: "Beginner"
tags: ["backfill", "etl", "data-pipeline", "data-engineering", "orchestration"]
readingTime: "7 mins"
lastUpdated: 2026-06-07
seoTitle: "Backfill trong Kỹ thuật Dữ liệu - Khôi phục và cập nhật dữ liệu quá khứ"
metaDescription: "Khái niệm Backfill là gì trong Data Engineering? Các trường hợp cần chạy quy trình backfill lịch sử, khó khăn và cách xử lý hiệu quả với các công cụ như Airflow, dbt."
---

# Backfill

## Summary

Backfill (Lấp đầy/Chạy bù lịch sử) là một quy trình kỹ thuật dữ liệu nhằm chạy lại hệ thống Data Pipeline để xử lý, biến đổi và nạp dữ liệu cho một khoảng thời gian trong quá khứ. Đây là một thao tác thiết yếu để lấp đầy các khoảng trống dữ liệu bị thiếu do lỗi hệ thống (outage), sửa chữa các dữ liệu lịch sử bị tính toán sai, hoặc áp dụng một logic nghiệp vụ hoàn toàn mới (ví dụ: thêm một cột công thức tính lợi nhuận) áp dụng cho toàn bộ dữ liệu từ trước tới nay.

---

## Definition

**Backfill** hiểu đơn giản là hành động "quay ngược thời gian" của hệ thống ETL/ELT. 

Trong trạng thái bình thường, Data Pipeline là một luồng xử lý xuôi theo thời gian: mỗi ngày đến hẹn, hệ thống chạy để xử lý dữ liệu của ngày hôm đó (Incremental/Daily run). Tuy nhiên, **Backfilling** là hành động ra lệnh cho hệ thống điều phối (Orchestrator, ví dụ như Apache Airflow) quay lại và kích hoạt các tác vụ xử lý cho các ngày (hoặc tháng) đã trôi qua trong lịch sử. Quá trình này sẽ đọc lại dữ liệu thô (raw data) của khoảng thời gian đó, chạy lại các script biến đổi hiện tại, và ghi đè/cập nhật lại kết quả vào bảng đích ở Data Warehouse.

---

## Why it exists

Dù kiến trúc đường ống dữ liệu có tốt đến đâu, việc chạy lại dữ liệu quá khứ là điều không thể tránh khỏi trong vòng đời của sản phẩm dữ liệu vì ba nguyên nhân phổ biến:

1. **Lỗi hệ thống hoặc Rớt mạng (Outage / Downtime)**: Cuối tuần qua, máy chủ chứa ứng dụng bị sập, hoặc API Facebook ngừng hoạt động. Pipeline ngày Thứ Bảy và Chủ Nhật bị lỗi và không kéo được dữ liệu. Hôm nay Thứ Hai, bạn phải "backfill" lại dữ liệu của Thứ 7 và Chủ Nhật để các bảng Dashboard không bị lủng hai ngày trắng.
2. **Phát hiện bug ở logic cũ (Bug Fix)**: Bạn phát hiện ra công thức tính Thuế trong code biến đổi dữ liệu bị sai mất 0.5% trong suốt 6 tháng qua. Bạn sửa lại code thành đúng cho ngày mai, nhưng sếp yêu cầu toàn bộ báo cáo doanh thu của 6 tháng qua cũng phải được tính lại cho đúng chuẩn.
3. **Thêm logic / Nguồn dữ liệu mới (New Features)**: Công ty quyết định thêm một tính năng phân loại khách hàng VIP. Bạn viết một đoạn code mới để sinh ra cột `is_vip`. Nhưng bạn cần áp dụng cột mới này cho hàng triệu khách hàng đã đăng ký từ 3 năm trước. Bạn cần một quy trình Backfill toàn bộ lịch sử 3 năm.

---

## Core idea

Cốt lõi để có thể thực hiện Backfill một cách dễ dàng phụ thuộc vào tính **Idempotency (Lũy đẳng)** của các script viết trong Pipeline.

Nếu một job được thiết kế Lũy đẳng, việc bạn chạy nó 1 lần cho ngày 01-01-2026, hay chạy nó 100 lần cho ngày 01-01-2026 thì kết quả trên Data Warehouse vẫn luôn giống hệt nhau (không bị nhân đôi dữ liệu, không sinh ra rác). Khi đó, Backfill thực chất chỉ là việc gọi một lệnh điều phối (command) chạy một vòng lặp `for date in past_dates: run_pipeline(date)`.

Và để làm được điều đó, mọi logic lấy dữ liệu (Extract) và xóa/ghi đè ở đích (Load) phải được thiết kế phụ thuộc vào các tham số thời gian ngoại cảnh (Parameterization) được truyền vào lúc thực thi, thay vì hard-code kiểu `CURRENT_DATE()`.

---

## How it works

Dưới đây là một quy trình Backfill sử dụng Apache Airflow (một công cụ điều phối - Orchestrator):

1. **Phát hiện nhu cầu**: Kỹ sư nhận thấy cần chạy lại dữ liệu từ ngày `2026-05-01` đến `2026-05-31` (Tháng 5).
2. **Chuẩn bị môi trường**: Kỹ sư kiểm tra các bảng phụ thuộc để đảm bảo việc ghi đè (overwrite) sẽ không làm hỏng các luồng dữ liệu khác ở hạ nguồn.
3. **Kích hoạt Backfill**: Kỹ sư chạy một dòng lệnh trên terminal:
   `airflow dags backfill my_daily_etl_job -s 2026-05-01 -e 2026-05-31`
4. **Thực thi song song (Execution)**: Airflow sẽ "giả vờ" quay ngược lại ngày 1/5, truyền tham số `execution_date='2026-05-01'` vào code. Sau đó nó xóa dữ liệu cũ của ngày 1/5 và nạp dữ liệu mới. Lệnh Backfill của Airflow có thể chạy 10 ngày cùng một lúc (song song) để rút ngắn thời gian.
5. **Hoàn tất**: Sau vài giờ, toàn bộ 31 ngày lịch sử đã được cập nhật logic mới nhất. Các dashboard tự động phản ánh số liệu mới.

---

## Architecture / Flow

```mermaid
graph TD
    subgraph Execution Timeline
        Normal[Normal Daily Runs<br/>Logic V1]
        Incident[Bug Detected!<br/>Update logic to V2]
        Back[Backfill Process<br/>Runs Logic V2 for Past Dates]
    end
    
    subgraph Execution Mechanism (e.g. Airflow)
        Input[Parameters:<br/>Start Date: 2026-01-01<br/>End Date: 2026-05-31]
        Input --> Job1[Run: 2026-01-01]
        Input --> Job2[Run: 2026-01-02]
        Input --> JobN[Run: ...]
    end
    
    subgraph Data Warehouse
        DWH[(Target Table)]
        Job1 -->|DELETE Date=01-01<br/>INSERT V2 Data| DWH
        Job2 -->|DELETE Date=01-02<br/>INSERT V2 Data| DWH
    end
```

---

## Practical example

Sử dụng **dbt** (data build tool), thao tác backfill rất đơn giản khi bạn cấu hình bảng dưới dạng thiết kế xóa và thay thế phân vùng (partition replacement) hoặc incremental model. 

Ví dụ dbt cung cấp cờ `--full-refresh`. Khi bạn đổi một logic (như thêm cột `is_vip`) trong mô hình `fact_orders` và cần áp dụng cho toàn bộ quá khứ, bạn không cần phải chạy lại từng ngày. Bạn chỉ cần:

```bash
# Chạy dbt với lệnh full-refresh
dbt run --select fact_orders --full-refresh
```
dbt sẽ gửi lệnh SQL xuống Data Warehouse (như BigQuery):
1. `DROP TABLE fact_orders` (Xóa hoàn toàn bảng cũ).
2. `CREATE TABLE fact_orders AS SELECT ... (logic mới) FROM raw_data`. (Chạy đọc lại toàn bộ lịch sử thô và xây lại bảng bằng logic mới). Quá trình Backfill hoàn tất trong 1 dòng lệnh.

---

## Best practices

* **Bảo vệ Raw Data (Dữ liệu Thô)**: Định luật sống còn là bạn chỉ có thể Backfill thành công (sửa chữa dữ liệu) nếu bạn vẫn còn lưu trữ dữ liệu Raw gốc 100%. Nếu luồng Ingestion ban đầu của bạn có thói quen xóa/xóa sửa trực tiếp dữ liệu thô, bạn sẽ không bao giờ có thể tính toán lại lịch sử (vì gốc đã mất). Luôn thiết kế Data Lake / Cloud Storage ở dạng Append-only.
* **Tham số hóa câu lệnh SQL (Parameterization)**: Tuyệt đối tránh sử dụng các hàm như `CURRENT_DATE()` hay `NOW()` trong câu lệnh WHERE của quá trình làm ETL. Hãy dùng các biến môi trường do Orchestrator truyền vào (ví dụ trong Airflow là `{{ ds }}` - date string). 
  * *Sai*: `SELECT * FROM sales WHERE order_date = CURRENT_DATE()`
  * *Đúng*: `SELECT * FROM sales WHERE order_date = '{{ ds }}'`
  Khi đó, thao tác Backfill mới có thể can thiệp truyền ngày quá khứ vào chữ `{{ ds }}`.
* **Sử dụng Phân vùng (Partitioning)**: Backfill một bảng 100 tỷ dòng (Full-refresh) có thể gây tốn hàng ngàn USD tính toán. Nếu dữ liệu được phân vùng theo Ngày (`event_date`), thao tác Backfill chỉ tốn chi phí thay thế dữ liệu của những ngày (partition) bị lỗi, bỏ qua các vùng dữ liệu không liên quan.

---

## Common mistakes

* **Quên thông báo cho hạ nguồn (Downstream impact)**: Bạn lặng lẽ chạy quy trình Backfill sửa doanh thu của tháng trước trong Data Warehouse. Nhưng tháng trước, team Tài chính đã báo cáo con số cũ (đã chốt sổ) cho các nhà đầu tư. Việc số liệu bị đổi cái "rụp" mà không có sự thông báo hay phân tích kiểm toán sẽ gây ra thảm họa mất niềm tin (Trust Issue) vào đội Data. Luôn thống nhất với Business (Nghiệp vụ) khi thực hiện Backfill các chỉ số trọng yếu trong quá khứ.
* **Hệ thống nguồn không cho phép xem lịch sử**: Bạn muốn backfill lại trạng thái `status` của đơn hàng trong tháng trước từ một hệ thống CRM (API). Nhưng API của họ chỉ hiển thị trạng thái hiện tại (không có tính năng Time Travel). Pipeline của bạn không thể nào quay về quá khứ để lấy được trạng thái cũ -> Backfill bất khả thi. Điều này nhấn mạnh tầm quan trọng của CDC/Log-based extraction.

---

## Trade-offs

### Ưu điểm
* Sửa chữa mọi sai sót kỹ thuật và logic.
* Đảm bảo tính linh hoạt vô cực cho hệ thống phân tích: Bạn có quyền sai hôm nay, và ngày mai bạn viết lại quy trình để sửa đổi toàn bộ lịch sử cho đúng chuẩn.

### Nhược điểm
* **Rủi ro vận hành**: Chạy lại hệ thống hàng loạt song song (Massive parallel execution) có thể tiêu tốn 100% CPU của cụm Data Warehouse hoặc khóa (Lock) cơ sở dữ liệu làm gián đoạn báo cáo hiện tại.
* **Khó khăn ở môi trường Streaming**: Backfill đối với pipeline Batch rất dễ. Nhưng backfill trên các môi trường Real-time Streaming (Flink/Kafka) phức tạp hơn rất nhiều do phải quản lý khái niệm Watermarks của stream và Event-time so với Processing-time.

---

## When to use

* Gặp sự cố hạ tầng làm gãy luồng Ingestion kéo dữ liệu hàng ngày.
* Thêm mới một nguồn dữ liệu, một cột dữ liệu quan trọng và có yêu cầu phân tích xu hướng dài hạn (Historical trend analysis).
* Sửa chữa một logic nghiệp vụ sai lầm đã diễn ra trong thời gian dài.

## When not to use

* Dữ liệu Kế toán / Tài chính đã được "Đóng băng" (Freeze) và chốt sổ cuối năm. Những dữ liệu này không được phép sửa (Backfill) mà phải được xử lý bằng các Giao dịch điều chỉnh (Adjustment transactions) mới tạo ra trong tháng hiện tại.

---

## Related concepts

* [Incremental Load](/concepts/incremental-load)
* [Data Transformation](/concepts/data-transformation)
* [ELT](/concepts/elt)

---

## Interview questions

### 1. "Tính Lũy đẳng (Idempotency)" là gì và tại sao nó lại là yêu cầu bắt buộc để một Data Pipeline có thể thực hiện thao tác Backfill an toàn?
* **Người phỏng vấn muốn kiểm tra**: Tư duy nền tảng về thiết kế phần mềm, thiết kế Data Pipeline.
* **Gợi ý trả lời (Strong Answer)**: 
  Idempotency (Lũy đẳng) là tính chất mô tả việc một quy trình chạy 1 lần hay n lần với cùng một tham số đầu vào thì kết quả đầu ra không thay đổi. Nếu một Pipeline ETL không lũy đẳng (Ví dụ: code chỉ viết lệnh `INSERT` nối tiếp mà quên `DELETE` trước), khi ta dùng Airflow gọi chạy Backfill (hoặc chạy lại do lỗi mạng), dữ liệu sẽ bị nhân đôi gây sai lệch báo cáo. Tính Lũy đẳng đảm bảo rằng quá trình Backfill lịch sử hoạt động như một cỗ máy thay thế (Replacement) sạch sẽ, giúp kỹ sư tự tin bấm nút chạy lại lịch sử mà không cần sợ hãi việc phải đi dọn dẹp các bản ghi rác.

### 2. Khi Backfill (hoặc Full Refresh) một bảng Fact rất lớn (VD: 5 Terabyte), việc `DROP TABLE` và `CREATE TABLE AS SELECT` có thể tốn thời gian dài và gây sập (downtime) hệ thống BI. Bạn sẽ sử dụng kỹ thuật nào để Backfill mà vẫn đảm bảo No-Downtime?
* **Người phỏng vấn muốn kiểm tra**: Kỹ năng quản trị hệ thống phân tán, kiến thức về chiến lược "Blue-Green deployment" trong Data.
* **Gợi ý trả lời (Strong Answer)**:
  Tôi sẽ không dùng `DROP TABLE` trực tiếp lên bảng đang Production. Tôi sẽ sử dụng kỹ thuật **Hoán đổi (Swap/View pointing)**:
  1. Tạo một bảng tạm ẩn (VD: `fact_orders_backfill`).
  2. Thực thi toàn bộ quá trình xử lý, tính toán và ghi 5TB dữ liệu vào cái bảng tạm ẩn đó. Quá trình này mất 2 giờ, nhưng bảng Production cũ vẫn đang trực tuyến và phục vụ các truy vấn của người dùng.
  3. Sau khi ghi và kiểm tra (Test) bảng ảo thành công, thực hiện câu lệnh hoán đổi metadata (Ví dụ đổi tên bảng hoặc trỏ View chính từ bảng cũ sang bảng ẩn). Quá trình đổi con trỏ chỉ tốn 0.1 giây. Người dùng lập tức thấy dữ liệu mới mà không gặp chút downtime nào. Cuối cùng, drop bảng cũ để dọn rác.

---

## References

1. **Apache Airflow Documentation** - "Backfill and Catchup" (Giải thích chi tiết về tham số thời gian execution_date).
2. **Fundamentals of Data Engineering** - Joe Reis.
3. **dbt Labs** - "Backfilling incremental models" - Tài liệu mô tả kỹ thuật full-refresh.

---

## English summary

Backfilling is the process of executing a data pipeline for historical dates rather than the current or next expected interval. It involves re-running extraction, transformation, and loading logic over past data periods. Data engineering teams rely on backfilling to recover from system outages, retroactively apply bug fixes to calculations, or back-propagate new business rules (like a newly created dimension column) to the entire dataset. A successful backfilling architecture heavily depends on maintaining immutable raw data and designing pipeline jobs to be idempotent—ensuring that running a job multiple times for the same historical window yields identical, safe, and correct results in the Data Warehouse.
