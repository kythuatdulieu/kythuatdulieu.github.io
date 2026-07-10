---
title: "Snowflake Pipeline: Hệ thống Xử lý Dữ liệu Tài chính"
description: "Dự án mô phỏng luồng dữ liệu tài chính từ nhiều nguồn vào Snowflake, xử lý với Snowpipe, Snowflake Tasks theo mô hình event-driven."
---



![System Architecture](/images/projects/e2e/snowflakedemo/ab627f48.png)

Dự án này mô phỏng một luồng dữ liệu (data pipeline) dành cho dữ liệu tài chính. Hệ thống bao gồm việc thu thập (crawling) dữ liệu từ nhiều nguồn khác nhau, lưu trữ vào Google Cloud Storage (GCP), và đưa vào Snowflake để xử lý và phân tích.

:::danger
**Disclaimer:** Nội dung assignment này được tìm hiểu và thực hiện trong thời gian ngắn nhằm mục đích demo các concept kiến trúc dữ liệu. Giải pháp hiện tại **chưa ở mức Production-ready**.
:::

---

## 1. Giới thiệu Nguồn Dữ liệu

Luồng dữ liệu thu thập từ 4 nguồn chính:

1. **Yahoo Finance - Hàng hóa (Commodities)**
2. **Yahoo Finance - Chỉ số thế giới (World Indices)**
3. **Yahoo Finance - Tiền tệ (Currencies)**
4. **Investing.com - Lịch Kinh tế (Economic Calendar)**

**Định dạng file & Tần suất:**
- **Tần suất:** Dữ liệu được thu thập mỗi 15 phút.
- **Quy tắc đặt tên:** Các file được thêm hậu tố là timestamp của thời điểm crawl.
- **Định dạng:** JSON và CSV.

---

## 2. Chi tiết Luồng Dữ liệu (Data Flow)

### 2.1. Lớp Ingestion (Bronze)

Quá trình thu thập dữ liệu (ingestion) hoạt động theo cơ chế hướng sự kiện (event-driven) để đảm bảo độ trễ thấp nhất cho dữ liệu thô.

1. **Tích hợp GCP:** Một Notification Integration (`GCS_PUBSUB_INT`) kết nối Snowflake với GCP Pub/Sub.
2. **Snowpipe:** Khi có file mới được đẩy vào GCS bucket, một thông báo sẽ tự động kích hoạt Snowpipe tương ứng.
3. **Bảng dữ liệu thô (Raw Tables):** Dữ liệu được tải ngay lập tức vào các bảng `RAW_*` (ví dụ: `RAW_YFH_COMMODITIES`).

:::tip
**Tại sao lại dùng Snowpipe?** 
Sử dụng Snowpipe thay vì các tác vụ chạy theo lịch (scheduled task) vì muốn dữ liệu thô có mặt tại lớp Bronze ngay khi vừa được thu thập, không cần phải chờ đến khung giờ chạy batch.
:::

![Bronze Ingestion Flow](/images/projects/e2e/snowflakedemo/40957be5.png)

### 2.2. Chiến lược Điều phối (Orchestration)

Trong khi bước ingestion là event-driven, quá trình biến đổi dữ liệu (transformation) phía sau được quản lý bởi một chuỗi các Snowflake Tasks phức tạp.

**Mô hình "Hàng đợi" (Queue Pattern):** Thay vì xử lý ngay lập tức mọi file ở lớp Silver, chúng tôi triển khai hệ thống Hàng đợi (Queue) để kiểm soát luồng và đảm bảo tính nhất quán của dữ liệu.

1. **Kiểm toán & Đưa vào hàng đợi (Audit & Enqueue):**
   - Chạy định kỳ để phát hiện các dòng mới trong Raw streams, tính toán mã băm (hashes) và ghi log.
   - Đẩy các file mới vào bảng `FILE_QUEUE` với trạng thái 'PENDING'.
2. **Xử lý (Processing):**
   - Lấy một batch các file 'PENDING' và chuyển trạng thái thành 'RUNNING'.
3. **Hoàn thành (Completion):**
   - Chỉ chạy sau khi tất cả các task transformation đã hoàn tất, đánh dấu các file thành 'DONE'.

![Orchestration Strategy](/images/projects/e2e/snowflakedemo/4e039b96.png)

### 2.3. Lớp Biến đổi (Silver)

Logic biến đổi được chia thành hai loại bảng cho mỗi thực thể:

#### Các View Chuẩn hóa (`VW_*_NORMALIZED`)
Các view này parse dữ liệu thô (JSON/CSV variant) thành các cột có cấu trúc.

![View Logic](/images/projects/e2e/snowflakedemo/e0c28ac1.png)

#### Bảng Lịch sử (`H_*` - History Tables)
- **Vai trò:** Lưu trữ toàn bộ lịch sử thay đổi. Mỗi bản ghi snapshot từ crawler đều được append vào đây (Insert-only).

![History Tables](/images/projects/e2e/snowflakedemo/d8bfd6a3.png)

#### Bảng Trạng thái Hiện tại (`L_*` - Last/Current Tables)
- **Vai trò:** Chỉ lưu trạng thái mới nhất của mỗi symbol/event.
- **Logic:** Sử dụng lệnh `MERGE`. Cập nhật các bản ghi đã tồn tại nếu mã hash thay đổi, hoặc thêm mới nếu chưa có.

![Current State Tables](/images/projects/e2e/snowflakedemo/4f776c46.png)

### 2.4. Chất lượng Dữ liệu (Data Quality - DQ)

Chất lượng dữ liệu được thực thi thông qua **Data Metric Functions (DMFs)** của Snowflake. Các DMFs này được lên lịch chạy trên các bảng Silver để liên tục theo dõi "sức khỏe" của dữ liệu.

- `COUNT_NULLS`: Kiểm tra các giá trị quan trọng bị thiếu.
- `COUNT_NEGATIVE_VALUES`: Đảm bảo giá trị giá cả hoặc khối lượng không bị âm.
- `COUNT_DUPLICATES`: Kiểm tra các vi phạm về tính duy nhất.

![DQ Application](/images/projects/e2e/snowflakedemo/1c6f7e5c.png)

### 2.5. Khả năng Mở rộng & Linh hoạt (Scalability & Flexibility)

Hệ thống được thiết kế để dễ dàng scale tự động:
- **Tham số hóa (Parameterization):** Các giới hạn batch được lưu trữ trong bảng cấu hình, cho phép tinh chỉnh hiệu suất mà không cần thay đổi code.
- **Sự tách biệt (Decoupling):** Quá trình ingestion (Snowpipe) tách biệt hoàn toàn khỏi logic biến đổi (Tasks).

### 2.6. Lớp Gold: Demo Truy vấn & Insight

Lớp Gold chứa các bảng đã được denormalize (khử chuẩn) và aggregate (tổng hợp), tối ưu cho các công cụ BI và các truy vấn ad-hoc.

![Gold Layer Demo](/images/projects/e2e/snowflakedemo/78b20056.png)

> Tham khảo chi tiết tại GitHub Repository: [snowflakedemo](https://github.com/kythuatdulieu/snowflakedemo)
