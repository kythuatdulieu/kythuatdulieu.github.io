---
title: "Databricks Under The Hood: Hiểu Sâu Cơ Chế OPTIMIZE & VACUUM"
difficulty: "Intermediate"
tags: ["optimize", "vacuum", "delta-lake", "performance", "databricks", "data-engineering"]
readingTime: "12 mins"
lastUpdated: 2026-06-26
seoTitle: "Cách sử dụng OPTIMIZE và VACUUM trong Databricks Delta Lake"
metaDescription: "Khám phá bài toán Small Files trong Big Data. Hiểu rõ cách lệnh OPTIMIZE (Bin-packing) và VACUUM dọn dẹp rác hoạt động dưới nền tảng Databricks."
description: "Tại sao bảng Delta Lake của bạn càng ngày càng chậm và tốn dung lượng ổ cứng dù dữ liệu không tăng nhiều? Bí mật nằm ở bài toán 'Small Files' và các tệp rác ẩn giấu. Cùng tìm hiểu cách OPTIMIZE và VACUUM giải cứu hệ thống của bạn."
---

Khi vận hành Data Lakehouse với hàng ngàn đường ống dữ liệu (Pipelines) chạy liên tục mỗi giờ, các Data Engineer thường đối mặt với một hiện tượng kỳ lạ: Dữ liệu nghiệp vụ không tăng nhiều, nhưng thời gian truy vấn ngày càng chậm chạp và hóa đơn lưu trữ (Cloud Storage) thì tăng phi mã.

Nguyên nhân gốc rễ của thảm họa này thường tóm gọn trong hai chữ: **Small Files** (Tệp nhỏ) và **Tombstones** (Rác dữ liệu lịch sử). Databricks và Delta Lake cung cấp hai lệnh bảo trì vũ khí hạng nặng để giải quyết vấn đề này: `OPTIMIZE` và `VACUUM`.

## 1. Bài Toán "Small Files" (Tệp Nhỏ) Là Gì?

Trong kiến trúc Big Data (như Spark, Hadoop), dữ liệu được lưu trữ phân tán. Tốc độ đọc dữ liệu cực kỳ tối ưu khi bạn đọc một số ít các tệp lớn (ví dụ: 10 tệp, mỗi tệp 1GB).

Tuy nhiên, trong thực tế, nếu bạn có một luồng Streaming (Streaming job) cứ mỗi 1 phút lại ghi một batch dữ liệu nhỏ, hoặc có hàng chục worker node cùng lúc ghi dữ liệu vào bảng, kết quả sinh ra sẽ là hàng vạn tệp Parquet siêu nhỏ (chỉ vài Kilobyte mỗi tệp).

**Hậu quả của Small Files:**
1.  **I/O Overhead:** Để đọc dữ liệu, Spark phải thực hiện tác vụ mở tệp (Open), đọc Metadata (Header, Footer), rồi mới đọc nội dung. Nếu phải mở 10,000 tệp 100KB, chi phí (Overhead) để mở tệp còn tốn thời gian hơn chính việc xử lý dữ liệu bên trong tệp đó. Cả hệ thống sẽ treo cứng ở bước I/O.
2.  **Metadata phình to:** Transaction Log của Delta Lake (`_delta_log/`) phải lưu dấu vết của tất cả các tệp này. Hàng vạn tệp nhỏ sẽ khiến chính việc đọc file Log cũng trở thành cổ chai (Bottleneck).

## 2. Lệnh OPTIMIZE: Thuật Toán Bin-Packing

Lệnh `OPTIMIZE` sinh ra để khắc phục bài toán Small Files. Về bản chất, nó sử dụng thuật toán **Bin-Packing** (Đóng thùng).

Hệ thống sẽ đi vòng quanh, thu gom tất cả các tệp nhỏ rải rác lại, nén và gộp chúng (compact) thành các tệp Parquet lớn hơn, có kích thước "chuẩn chỉnh" và tối ưu nhất cho việc quét dữ liệu (mặc định trong Databricks thường là mục tiêu 1GB/tệp).

```sql
-- Chạy gộp tệp cho toàn bộ bảng
OPTIMIZE events;

-- Chạy gộp tệp nhưng giới hạn ở những dữ liệu mới nhất (để tiết kiệm chi phí tính toán)
OPTIMIZE events WHERE date >= current_date() - INTERVAL 1 DAY;
```

### Cơ Chế Hoạt Động Dưới Mái Tôn (Under the hood)
Khi bạn chạy `OPTIMIZE`:
1.  Spark sẽ quét Transaction Log để liệt kê tất cả các tệp đang hoạt động (Active files).
2.  Nó đọc các tệp có kích thước quá nhỏ vào bộ nhớ (RAM).
3.  Nó trộn và ghi lại thành các tệp Parquet mới to và đẹp hơn.
4.  Nó tạo ra một Commit mới vào Delta Log, đánh dấu các tệp nhỏ cũ là "Đã xóa" (Logical delete), và thêm các tệp lớn mới vào trạng thái "Active".

**Lưu ý quan trọng:** Lệnh `OPTIMIZE` **không hề xóa tệp vật lý cũ**! Kể cả khi chạy xong, dung lượng lưu trữ trên S3/GCS của bạn không những không giảm mà còn TĂNG LÊN (vì bạn đang chứa cả tệp nhỏ cũ lẫn tệp lớn mới). Tại sao? Để phục vụ tính năng **Time Travel** (Quay ngược thời gian) của Delta Lake.

## 3. Lệnh VACUUM: Kẻ Dọn Rác (Garbage Collector)

Như đã đề cập ở trên, khi bạn chạy lệnh `UPDATE`, `DELETE`, `MERGE` hoặc `OPTIMIZE`, Delta Lake áp dụng nguyên tắc **MVCC (Multi-Version Concurrency Control)**. Nó không bao giờ xóa tệp vật lý ngay lập tức để tránh làm sập các query của người khác đang đọc dữ liệu cũ. Các tệp cũ chỉ bị đánh dấu là "đã chết" (Tombstones) trong thư mục.

Theo thời gian, hàng đống tệp "Tombstones" này sẽ tích tụ và ngốn hàng Terabyte dung lượng ổ cứng vô ích. Lúc này, bạn cần gọi `VACUUM`.

Lệnh `VACUUM` sẽ quét toàn bộ thư mục, đối chiếu với Delta Log, và **xóa vĩnh viễn khỏi ổ cứng vật lý** tất cả những tệp không còn nằm trong trạng thái Active VÀ đã cũ hơn một ngưỡng thời gian giữ lại (Retention Period - mặc định là 7 ngày).

```sql
-- Dọn dẹp các tệp rác cũ hơn 7 ngày (Mặc định an toàn)
VACUUM events;

-- Dọn dẹp các tệp rác cũ hơn 100 giờ
VACUUM events RETAIN 100 HOURS;
```

### Tại Sao Mặc Định Retention Là 7 Ngày?
Tại sao không xóa luôn rác của 1 giờ trước? Khung thời gian 7 ngày là một khoảng đệm an toàn (Buffer) cực kỳ quan trọng:
1.  **Tránh xung đột truy vấn (Query Conflicts):** Nếu một câu lệnh `SELECT` khổng lồ mất 10 tiếng để chạy, và nó đang đọc các tệp cũ. Nếu bạn VACUUM xóa ngay tệp đó, câu lệnh `SELECT` kia sẽ bị crash (Lỗi `FileNotFoundException`).
2.  **Khả năng phục hồi (Time Travel & Rollback):** Trong vòng 7 ngày, nếu có người lỡ tay `DELETE` nhầm dữ liệu, bạn vẫn có thể Time Travel hoặc khôi phục lại bảng. Một khi đã chạy `VACUUM`, dữ liệu đó bị bốc hơi khỏi ổ cứng vĩnh viễn và không thể khôi phục (trừ khi có backup hạ tầng).

*(Lưu ý: Databricks có lớp bảo vệ chặn không cho bạn chạy `VACUUM RETAIN 0 HOURS`. Nếu bạn cố tình làm vậy, hệ thống sẽ báo lỗi. Chỉ có thể bypass bằng cách tắt cờ an toàn, nhưng đó là hành động cực kỳ rủi ro).*

## 4. Tự Động Hóa (Auto Optimize) Trong Databricks

Là một Data Engineer, bạn không nên (và không thể) ngày nào cũng vào gõ tay 2 lệnh này cho hàng ngàn bảng. Databricks cung cấp các tính năng tự động hóa ở mức Engine:

*   **Auto Compaction (Tự động gộp):** Sau khi một Spark Write Job kết thúc, hệ thống sẽ tự động kiểm tra xem có quá nhiều tệp nhỏ vừa được sinh ra không. Nếu có, nó nán lại vài giây để tự động chạy một luồng gộp tệp mini (mini-OPTIMIZE) trước khi đóng job. Tính năng này được cấu hình qua thuộc tính bảng: `delta.autoOptimize.autoCompact = true`.
*   **Optimized Writes (Ghi tối ưu):** Thay vì để 1000 worker đua nhau ghi ra 1000 tệp siêu nhỏ, Spark sẽ thực hiện một bước xáo trộn (shuffle) nội bộ, gom dữ liệu của 1000 worker này vào một vài node duy nhất, và để các node này ghi ra đĩa các tệp có kích thước lớn, chuẩn mực. Thuộc tính: `delta.autoOptimize.optimizeWrite = true`.

## Tổng Kết

Duy trì một Lakehouse khỏe mạnh giống như việc dọn dẹp nhà cửa:
- **`OPTIMIZE`** là hành động gom đồ lặt vặt (Small Files) đóng vào các thùng carton lớn gọn gàng. Nó giúp việc tìm kiếm đồ đạc (Truy vấn) nhanh hơn.
- **`VACUUM`** là hành động gọi xe rác đến chở các thùng đồ cũ hỏng (Tombstones) ra bãi rác. Nó giúp giải phóng không gian nhà bạn (Tiết kiệm chi phí Cloud Storage).

Kết hợp hài hòa hai lệnh này (thường là lên lịch Job chạy hằng ngày hoặc hằng tuần) là tiêu chuẩn bắt buộc cho mọi Data Engineer vận hành hệ thống Databricks ở môi trường Production.
