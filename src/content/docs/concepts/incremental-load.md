---
title: "Incremental Load"
category: "ETL / ELT"
difficulty: "Intermediate"
tags: ["incremental-load", "etl", "data-pipeline", "watermark", "upsert"]
readingTime: "8 mins"
lastUpdated: 2026-06-07
seoTitle: "Incremental Load - Nạp dữ liệu gia tăng tối ưu Data Pipeline"
metaDescription: "Tìm hiểu phương pháp Incremental Load (Nạp gia tăng) trong ETL/ELT: cách sử dụng High Watermark, quản lý trạng thái (State) và khác biệt so với Full Load."
---

# Incremental Load

## Summary

Incremental Load (Nạp gia tăng) là một cơ chế trích xuất và nạp dữ liệu trong quy trình ETL/ELT, nơi hệ thống chỉ kéo về (pull) những bản ghi đã được tạo mới hoặc bị thay đổi kể từ lần chạy cuối cùng của Data Pipeline. Trái ngược với Full Load (kéo toàn bộ dữ liệu lại từ đầu), Incremental Load là giải pháp tối thượng để xây dựng các đường ống dữ liệu hiệu năng cao, giảm tải áp lực cho hệ thống nguồn và tiết kiệm chi phí tính toán đám mây cho doanh nghiệp.

---

## Definition

**Incremental Load** hoạt động dựa trên việc nhận diện phần **"Delta" (Sự thay đổi)**. Để nhận diện được Delta, luồng Ingestion phải được thiết kế một cách có chủ ý dựa trên hai yếu tố bắt buộc:
1. **Cột theo dõi thời gian (Tracking column)** ở cơ sở dữ liệu nguồn: Ví dụ các cột `created_at`, `updated_at`, hoặc một chuỗi số ID tăng dần (`auto_increment_id`).
2. **Khóa chính (Primary Key)** ở cơ sở dữ liệu đích: Để hệ thống biết bản ghi nào cần Thêm mới (Insert) và bản ghi nào cần Cập nhật (Update - Ghi đè trạng thái cũ).

Khái niệm Incremental Load áp dụng cho cả quá trình Extract (Chỉ trích xuất dòng mới từ nguồn) lẫn quá trình Load/Transform (Chỉ xử lý tính toán lại phần dữ liệu mới thay vì tính toán lại báo cáo của 10 năm trước).

---

## Why it exists

Hãy tưởng tượng một bảng ghi nhận lịch sử giao dịch ngân hàng có kích thước 2 Terabytes (khoảng 5 tỷ dòng). Mỗi ngày có khoảng 1 triệu giao dịch mới (chỉ khoảng 50 Megabytes).
* Nếu dùng phương pháp Full Load (Lấy toàn bộ): Kỹ sư dữ liệu sẽ phải bắt hệ thống truyền 2 Terabytes dữ liệu qua mạng mỗi ngày chỉ để cập nhật thêm 50 MB dữ liệu mới. Điều này tốn băng thông, mất hàng chục giờ đồng hồ để chạy, và làm sập Database vận hành.
* Nếu dùng Incremental Load: Hệ thống chỉ hỏi xin 50 MB dữ liệu của riêng ngày hôm nay. Thời gian chạy rút xuống từ 10 giờ xuống còn 2 phút.

Incremental Load sinh ra để giúp hệ thống Data Warehouse có thể theo kịp sự phình to của Big Data mà không làm nổ hóa đơn tiền điện toán (Compute Costs).

---

## Core idea

Ý tưởng cốt lõi của Incremental Load là việc sử dụng và quản lý **High Watermark (Dấu mực nước cao nhất)**. 

Giống như cách bạn đọc một cuốn sách dày, bạn kẹp một chiếc Đánh dấu trang (Bookmark) ở trang 100. Ngày mai đọc tiếp, bạn chỉ cần mở ra và đọc từ trang 101, không phải đọc lại từ trang 1. 

Trong Data Engineering:
1. Máy chủ ETL có một kho lưu trữ trạng thái (State/Metadata storage). Nó ghi lại: Lần cuối cùng tao chạy thành công cho bảng X là lúc `2026-06-05 23:59:59`. Dấu thời gian này chính là High Watermark (hoặc Cursor/Bookmark).
2. Lần chạy kế tiếp, máy chủ ETL phát ra lệnh truy vấn: `SELECT * FROM table_X WHERE updated_at > '2026-06-05 23:59:59'`.
3. Nhận về dữ liệu, xử lý xong xuôi. Lưu High Watermark mới: `2026-06-06 23:59:59`.

---

## How it works

Dưới đây là chu trình Incremental sử dụng mô hình Upsert (Merge) phổ biến nhất:

1. **Extract (Trích xuất theo Watermark)**: 
   Sử dụng Cursor cuối cùng (vd: Hôm qua) để truy vấn CSDL nguồn. Hệ thống trả về 100 bản ghi mới tạo, và 20 bản ghi cũ nhưng vừa mới bị chỉnh sửa trạng thái ngày hôm nay. (Tổng cộng 120 dòng Delta).
2. **Transform (Biến đổi)**: 
   Làm sạch 120 dòng dữ liệu này tại vùng Staging.
3. **Load (Nạp Upsert)**:
   Tại Data Warehouse, engine (vd: Snowflake) lấy 120 dòng Staging này ra so sánh với bảng chính dựa trên ID.
   - Với 100 dòng mới tạo (ID chưa từng xuất hiện) -> INSERT.
   - Với 20 dòng bị chỉnh sửa (ID đã có sẵn ở DWH) -> UPDATE đè lên trạng thái cũ.
4. **Cập nhật State**: 
   Cập nhật Watermark thành thời gian mới nhất (hoặc MAX(updated_at) của tập dữ liệu vừa nạp).

---

## Architecture / Flow

```mermaid
graph TD
    subgraph State Management
        Watermark[(High Watermark<br/>Last_Run = T1)]
    end
    
    subgraph Operational Source
        SourceDB[(Source Database<br/>Includes updated_at column)]
    end
    
    subgraph ETL Pipeline
        Extract[1. Extract: SELECT * WHERE updated_at > T1]
        Merge[3. Load: MERGE into Target (Upsert)]
        UpdateState[4. Update State: Last_Run = T2]
    end
    
    subgraph Target DWH
        TargetDB[(Data Warehouse)]
    end

    Watermark -.->|Inject Parameter| Extract
    SourceDB -->|Returns Delta Data| Extract
    Extract -->|Staging Data| Merge
    Merge --> TargetDB
    Merge -.->|On Success| UpdateState
```

---

## Practical example

Triển khai cấu hình Incremental bằng công cụ **dbt (data build tool)**. Đây là cách cực kỳ thanh lịch để xử lý Incremental Load bằng mã SQL thuần túy.

File `daily_sales.sql`:

```sql
-- Khai báo cho dbt biết đây là model Incremental, và khóa chính là order_id
{{ config(
    materialized='incremental',
    unique_key='order_id'
) }}

SELECT 
    order_id,
    customer_id,
    amount,
    status,
    updated_at
FROM raw_orders

-- Khối lệnh này CHỈ CHẠY ở những lần chạy sau (không chạy lần đầu tạo bảng)
{ % if is_incremental() % }
  -- Filter chỉ lấy những dòng có updated_at LỚN HƠN thời gian max của bảng đích
  WHERE updated_at > (SELECT MAX(updated_at) FROM {{ this }})
{ % endif % }
```

Bên dưới nền, dbt sẽ dịch khối lệnh này thành một câu lệnh MERGE (Upsert) khổng lồ và xử lý phần Watermark tự động qua hàm `MAX(updated_at)`.

---

## Best practices

* **Look-back Window (Cửa sổ lùi thời gian)**: Các Database có thể bị trễ một chút khi commit giao dịch (ví dụ transaction A bắt đầu lúc 10:00 nhưng 10:02 mới ghi xong. Transaction B chạy lúc 10:01 và ghi xong luôn). Nếu Watermark lấy đúng mốc 10:01, thì ở lần chạy sau bạn sẽ bị lọt mất transaction A. Luôn thiết lập Look-back window: `WHERE updated_at >= (watermark - interval '1 hour')` để quét lùi lại quá khứ một chút. Khi kết hợp với câu lệnh Upsert, việc lấy trùng lại một chút dữ liệu giờ cũ sẽ không gây ra lỗi trùng lặp (Idempotent).
* **Index cột thời gian**: Đảm bảo cột `updated_at` hoặc `created_at` ở hệ thống nguồn (MySQL/Postgres) đã được đánh Index. Nếu không, câu lệnh `WHERE updated_at > X` của luồng ETL sẽ kích hoạt một cuộc quét toàn bộ bảng (Full Table Scan), làm sập DB nguồn không khác gì phương pháp Full Load.
* **Xử lý Xóa (Hard Deletes)**: Incremental thông thường dựa trên cột `updated_at` là vô phương cứu chữa với các dòng dữ liệu bị xóa cứng (hard delete - xóa bay khỏi ổ đĩa). Bạn phải yêu cầu bên phần mềm chuyển sang Soft Delete (thêm cột `is_deleted = true`), lúc này bản ghi sẽ bị cập nhật lại cột `updated_at` và được ETL kéo về.

---

## Common mistakes

* **Sử dụng ID tự tăng thay cho Updated_at**: Một số kỹ sư dùng Auto-increment ID làm Watermark (`WHERE id > last_id`). Cơ chế này lấy được dòng thêm mới (Insert) rất tốt, nhưng nó vĩnh viễn không bao giờ bắt được các dòng dữ liệu cũ bị Cập nhật (Update) trạng thái. Vì ID của chúng không đổi, nó sẽ luôn nhỏ hơn `last_id`.
* **Thiếu trường Primary Key đáng tin cậy**: Cố gắng chạy chế độ Incremental Upsert trên một bảng (như Log Clicks) không có ID duy nhất. Kết quả là DWH không biết so sánh dựa trên điều kiện gì, dẫn đến dữ liệu cứ đắp đống (nhân đôi) mỗi khi có một khoảng Look-back lặp lại.

---

## Trade-offs

### Ưu điểm
* Giảm băng thông (Network Traffic) và chi phí I/O đi hàng trăm, ngàn lần.
* Tốc độ chạy Job nhanh, cho phép chạy với tần suất cao (vd: mỗi 15 phút một lần thay vì mỗi đêm một lần), đáp ứng nhu cầu báo cáo thời gian thực (Near real-time).
* Tiết kiệm hàng ngàn USD tiền Compute (Snowflake/BigQuery) hàng tháng.

### Nhược điểm
* **Kiến trúc phức tạp**: Đòi hỏi phải cài đặt kho lưu trữ State (Watermark). Nếu file State bị hỏng, luồng pipeline bị hỏng.
* **Nguy cơ sai lệch dữ liệu (Data Drift)**: Do bản chất là luồng nối ghép, nếu có một ngày Job bị lỗi, một số dòng bị sót, sự sai lệch này sẽ tích tụ dần. Cần định kỳ (vd: mỗi tháng 1 lần) chạy một luồng "Full Refresh" để đồng bộ chuẩn lại bảng đích so với nguồn.

---

## When to use

* Là tiêu chuẩn vàng cho bất kỳ bảng dữ liệu vận hành nào (Transactions, Users, Inventory) có kích thước vượt quá vài chục triệu dòng.
* Khi hệ thống nguồn có sẵn cấu trúc tốt (Có cột `updated_at` đáng tin cậy).

## When not to use

* Với các bảng Category, Mapping nhỏ (như bảng chứa 50 Bang của Mỹ, hay 200 Quốc gia). Cứ dùng Full Load vì chi phí quản lý logic Incremental cho các bảng này đắt hơn chi phí chạy thẳng Full Load.

---

## Related concepts

* [Data Extraction](/concepts/data-extraction)
* [Data Loading](/concepts/data-loading)
* [Change Data Capture (CDC)](/concepts/change-data-capture)
* [ELT](/concepts/elt)

---

## Interview questions

### 1. Nêu ra nhược điểm lớn nhất của phương pháp Incremental Load dựa trên High Watermark (Cột `updated_at`). Bạn đề xuất giải pháp thay thế nào?
* **Người phỏng vấn muốn kiểm tra**: Tư duy tìm lỗ hổng hệ thống và hiểu biết về CDC.
* **Gợi ý trả lời (Strong Answer)**: 
  Nhược điểm lớn nhất là nó không thể phát hiện được "Hard Deletes" (Các bản ghi bị xóa vật lý). Vì khi một dòng bị xóa khỏi Database, nó không để lại dấu vết gì, cột `updated_at` của nó biến mất. Pipeline ETL kéo Incremental sẽ không biết để gửi lệnh `DELETE` sang Data Warehouse, dẫn đến DWH lưu trữ dữ liệu "ma" (Ghost data). Để khắc phục, giải pháp tốt nhất là chuyển sang sử dụng công nghệ Log-based CDC (Change Data Capture như Debezium). CDC đọc trực tiếp transaction log của Database, nên dù hệ thống gọi lệnh `DELETE`, sự kiện đó vẫn được ghi vào log và được luồng CDC bắt lấy truyền sang DWH.

### 2. "Look-back window" là gì và tại sao chúng ta nên sử dụng nó trong quá trình trích xuất Incremental?
* **Người phỏng vấn muốn kiểm tra**: Kinh nghiệm thực chiến với độ trễ giao dịch (Transaction Latency).
* **Gợi ý trả lời (Strong Answer)**:
  Look-back window (Cửa sổ lùi) là việc cố tình trừ đi một khoảng thời gian (ví dụ 30 phút hoặc 1 tiếng) khỏi High Watermark khi thực hiện câu lệnh Extract ở lần chạy tiếp theo. Chúng ta dùng nó vì trong các Database thực tế, một giao dịch (Transaction A) có thể bắt đầu trước, được cấp timestamp trước, nhưng bị "treo" hoặc chạy lâu (Long-running transaction) và commit sau một Giao dịch B (bắt đầu sau và timestamp muộn hơn). Nếu Job ETL lấy Watermark dựa trên timestamp lớn nhất của giao dịch B, nó sẽ vô tình bỏ qua giao dịch A (đang chạy ngầm và mới commit xong). Việc lùi cửa sổ lại 30 phút giúp ta quét vớt lại (sweep) các transaction chạy chậm này. Bù lại, ta sẽ bị lấy trùng dữ liệu cũ một chút, nhưng ta dễ dàng xử lý trùng lặp ở đích bằng lệnh `UPSERT`.

---

## References

1. **Airbyte Documentation** - Incremental Sync (https://docs.airbyte.com/understanding-airbyte/connections/incremental-deduped-history/)
2. **dbt Labs** - About Incremental Models.
3. **Fundamentals of Data Engineering** - Joe Reis.

---

## English summary

Incremental Load is a highly efficient data pipeline strategy that extracts and loads only new or updated records rather than pulling the entire dataset from the source (Full Load). By utilizing a tracking column (like `updated_at`) and maintaining a state cursor (High Watermark), pipelines query only the delta changes since the last run. Combined with an Upsert/Merge strategy at the destination (Data Warehouse), incremental loading dramatically reduces network bandwidth, execution time, and cloud computing costs. However, it requires careful handling of edge cases such as long-running transactions (solved by look-back windows) and struggles to detect physical hard deletes (often requiring CDC as an alternative).
