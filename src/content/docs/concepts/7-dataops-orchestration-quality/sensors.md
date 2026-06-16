---
title: "Sensors - Tác vụ cảm biến chờ đợi"
difficulty: "Intermediate"
tags: ["airflow", "sensors", "orchestration", "polling", "event-driven"]
readingTime: "15 mins"
lastUpdated: 2026-06-16
seoTitle: "Airflow Sensors là gì? Cảm biến dữ liệu trong Orchestration"
metaDescription: "Tìm hiểu về Sensors trong Apache Airflow. Cách thiết lập tác vụ chờ đợi, cơ chế Polling (Poke vs Reschedule) và tối ưu hóa tài nguyên Worker."
description: "Trong công việc của một Data Engineer, việc lập lịch chạy job dựa trên thời gian cứng nhắc (ví dụ: cứ đúng 1 giờ sáng là chạy) thường tiềm ẩn rất nhiều rủi ro. Sensors là giải pháp giúp pipeline linh hoạt hơn."
---



Sensors (Cảm biến) trong Airflow (và các công cụ Orchestration tương tự) là một loại Task đặc biệt. Thay vì thực thi mã nguồn xử lý dữ liệu nặng nề, nó có nhiệm vụ "nằm chờ" (Polling) liên tục cho đến khi một sự kiện cụ thể xảy ra (Ví dụ: Một file CSV vừa được đối tác đẩy lên S3, một bảng trong database được cập nhật dữ liệu, hoặc một job khác đã chạy xong) rồi mới cho phép luồng xử lý tiếp theo được kích hoạt.

## 1. Tại sao cần dùng Sensors?



Trong thực tế, Data Pipelines thường phụ thuộc vào các nguồn dữ liệu bên ngoài mà ta không thể kiểm soát chính xác thời gian hoàn thành.

Ví dụ: Bạn có một job cần xử lý file dữ liệu bán hàng từ đối tác. Đối tác hứa sẽ upload file lên Amazon S3 trước 1:00 AM mỗi ngày. 
Nếu bạn đặt lịch chạy job cứng nhắc vào đúng `01:00 AM`:
*   **Trường hợp 1:** Đối tác upload trễ vào lúc `01:15 AM` -> Job của bạn chạy lúc `01:00 AM` sẽ bị báo lỗi (File Not Found) hoặc chạy với dữ liệu rỗng.
*   **Trường hợp 2:** Bạn dời lịch chạy sang `02:00 AM` để "chắc ăn" -> Dữ liệu của bạn luôn bị delay ít nhất 1 tiếng so với thực tế, làm giảm tính kịp thời (freshness) của báo cáo.

**Giải pháp:** Sử dụng `S3KeySensor`. 
Thay vì lập lịch chạy task xử lý vào thời gian cố định, bạn lập lịch chạy Sensor lúc `00:30 AM`. Sensor sẽ liên tục kiểm tra S3 bucket (cứ mỗi 5 phút một lần). Ngay khi file xuất hiện (dù là `00:45 AM` hay `01:15 AM`), Sensor sẽ đánh dấu là thành công (Success) và kích hoạt task xử lý tiếp theo chạy ngay lập tức. Điều này giúp pipeline vừa đáng tin cậy vừa đảm bảo độ trễ thấp nhất có thể.

## 2. Các loại Sensors phổ biến trong Airflow

Airflow cung cấp sẵn rất nhiều Sensors thông qua các Provider Packages. Một số loại phổ biến nhất bao gồm:

*   **FileSensor:** Chờ một file hoặc thư mục xuất hiện trên local filesystem.
*   **S3KeySensor / GCSObjectExistenceSensor:** Chờ một file (object) xuất hiện trên Cloud Storage (Amazon S3, Google Cloud Storage).
*   **SqlSensor:** Chạy một câu lệnh SQL định kỳ và chờ cho đến khi kết quả trả về thoả mãn một điều kiện nhất định (ví dụ: đếm số dòng mới thêm vào có lớn hơn 0 hay không).
*   **HttpSensor:** Gọi một API endpoint và chờ cho đến khi API trả về status code thành công hoặc một response body cụ thể.
*   **ExternalTaskSensor:** Chờ một Task khác trong một DAG khác hoàn thành. Rất hữu ích khi bạn có nhiều DAG phụ thuộc lẫn nhau.
*   **TimeDeltaSensor:** Chờ một khoảng thời gian nhất định rồi mới chạy tiếp (giống như lệnh `sleep` nhưng tương thích tốt hơn với kiến trúc Airflow).

## 3. Cơ chế hoạt động: Chế độ Poke vs Reschedule

Việc Sensor liên tục kiểm tra trạng thái có thể tiêu tốn tài nguyên của hệ thống (đặc biệt là các Worker slots). Airflow cung cấp 2 chế độ (mode) chính cho Sensor để bạn tối ưu hóa việc này:

### Chế độ `poke` (Mặc định)
Trong chế độ `poke`, Sensor chiếm dụng vĩnh viễn một **Worker slot** (một tiến trình/luồng đang chạy) trong suốt thời gian nó chờ đợi. 
*   **Hoạt động:** Sensor kiểm tra điều kiện -> Nếu sai, nó dùng lệnh `time.sleep()` để ngủ trong một khoảng `poke_interval` -> Thức dậy kiểm tra tiếp.
*   **Ưu điểm:** Độ trễ cực thấp. Ngay khi điều kiện thoả mãn, nó phản hồi ngay lập tức.
*   **Nhược điểm:** Lãng phí tài nguyên khủng khiếp. Nếu bạn có 100 Sensors đang chờ file trong 2 tiếng, bạn sẽ mất 100 Worker slots "ngồi chơi xơi nước", làm cho các task khác bị tắc nghẽn (starvation) vì không còn slot để chạy.
*   **Khi nào dùng:** Chỉ dùng khi bạn biết chắc thời gian chờ là rất ngắn (dưới 1-2 phút) và khoảng thời gian `poke_interval` cực ngắn (vài giây).

### Chế độ `reschedule`
Trong chế độ `reschedule`, Sensor không giữ Worker slot khi đang ngủ.
*   **Hoạt động:** Sensor được đẩy vào Worker -> Kiểm tra điều kiện -> Nếu sai, nó tự kết thúc task (trạng thái đổi thành `UP_FOR_RESCHEDULE`), **giải phóng Worker slot** cho task khác dùng. -> Sau khi hết `poke_interval`, Scheduler sẽ đưa Sensor vào hàng đợi để chạy lại như một task mới.
*   **Ưu điểm:** Tiết kiệm tối đa tài nguyên Worker. 100 Sensors đang chờ trong chế độ reschedule gần như không chiếm dụng CPU hay RAM của hệ thống khi đang trong khoảng thời gian chờ.
*   **Nhược điểm:** Độ trễ nhỉnh hơn một chút vì mỗi lần kiểm tra lại, task phải xếp hàng chờ Scheduler cấp phát Worker slot mới. Tạo ra nhiều log và overhead cho Scheduler/Database hơn.
*   **Khi nào dùng:** Luôn luôn dùng `mode='reschedule'` khi dự kiến thời gian chờ lâu (từ vài phút đến vài giờ) và `poke_interval` lớn (chẳng hạn kiểm tra mỗi 5-10 phút).

## 4. Deferrable Operators (Async Sensors) - Giải pháp tối ưu hiện đại

Mặc dù `reschedule` giải quyết bài toán Worker slots, nó lại tạo gánh nặng lớn lên Airflow Database và Scheduler do phải liên tục ghi lại trạng thái và lập lịch lại hàng nghìn task liên tục.

Từ Airflow 2.2, khái niệm **Deferrable Operators** (và một thành phần mới là **Triggerer**) được giới thiệu để giải quyết triệt để vấn đề này. 
*   Sensor khi chạy với chế độ Deferrable sẽ kiểm tra lần 1, nếu chưa có, nó sẽ "đóng gói" điều kiện chờ và gửi cho tiến trình **Triggerer**. 
*   Sau đó task trên Worker tự động kết thúc và giải phóng slot hoàn toàn giống `reschedule`.
*   Triggerer là một tiến trình dùng `asyncio` (bất đồng bộ). Một Triggerer duy nhất có thể quản lý hàng chục ngàn Sensor đang chờ cùng một lúc chỉ với một luồng (single thread) bằng cách lắng nghe event mạng bất đồng bộ thay vì sleep/poll truyền thống.
*   Ngay khi sự kiện xảy ra, Triggerer đẩy thông báo cho Scheduler để đánh thức task trở lại Worker hoàn thành xử lý.

**Khuyên dùng:** Nếu bạn dùng Airflow >= 2.2 và thư viện Provider hỗ trợ Async (ví dụ `S3KeySensorAsync` hoặc truyền tham số `deferrable=True`), hãy ưu tiên sử dụng Deferrable Sensors cho các tác vụ chờ đợi dài hạn quy mô lớn.

## 5. Các cấu hình quan trọng và Best Practices

Khi viết Sensor, hãy luôn chú ý cấu hình các tham số sau để tránh làm sập hệ thống (đặc biệt là tình trạng Deadlock):

*   `poke_interval`: Khoảng thời gian (giây) giữa 2 lần kiểm tra. Đừng đặt quá nhỏ (ví dụ 1 giây) để tránh spam API của hệ thống nguồn hoặc làm quá tải Database. Thường để từ 60s đến 300s.
*   `timeout`: Tổng thời gian tối đa Sensor được phép chờ. Nếu quá thời gian này mà vẫn chưa thoả mãn điều kiện, Sensor sẽ báo lỗi. Đừng bao giờ để Sensor chạy vô thời hạn (mặc định của Airflow lên tới 7 ngày!). Hãy set `timeout` phù hợp với SLA (ví dụ: 2 tiếng `timeout=60 * 60 * 2`).
*   `soft_fail`: Cấu hình này cực kỳ hữu dụng. 
    *   Mặc định `soft_fail=False`: Khi Sensor hết hạn (`timeout`), task bị đánh dấu là `FAILED`, điều này có thể trigger cảnh báo (alert) gởi email vào giữa đêm.
    *   Nếu bạn set `soft_fail=True`: Khi Sensor hết hạn, task sẽ đổi trạng thái thành `SKIPPED` (bỏ qua) thay vì `FAILED`. Phù hợp cho những job tính chất "có dữ liệu thì chạy, không có thì thôi bỏ qua chờ batch sau" mà không muốn tạo ra False Alarm.
*   **Phòng chống Sensor Deadlock:** Nếu bạn dùng `mode='poke'` và cấu hình Pool (số lượng concurrency) quá nhỏ, các Sensor có thể chiếm toàn bộ Worker và nằm chờ các task khác hoàn thành. Nhưng các task khác không thể chạy vì Sensor đã chiếm hết Worker! Để tránh điều này, hãy luôn dùng `mode='reschedule'` cho Sensor có thời gian chờ dài, hoặc tạo một Airflow Pool riêng chuyên chỉ dành cho Sensors.

## 6. Lựa chọn thay thế: Data-aware Scheduling (Airflow Datasets)

Bắt đầu từ Airflow 2.4+, tính năng **Datasets** ra đời như một sự thay thế hiện đại hơn cho Sensors trong nhiều trường hợp. Thay vì dùng `ExternalTaskSensor` hoặc `S3KeySensor` để liên tục hỏi máy chủ "Dữ liệu có chưa?", bạn có thể định nghĩa Data Pipeline theo dạng Event-driven (Phản ứng theo sự kiện).

Job A sau khi chạy xong sẽ báo là nó vừa cập nhật `Dataset("s3://my-bucket/sales-data")`. Job B khai báo rằng nó "phụ thuộc" vào Dataset này. Ngay khi Job A hoàn thành việc ghi dữ liệu, Scheduler sẽ tự động kích hoạt Job B mà không cần bất kỳ Sensor nào phải nằm chờ. Đây là bước dịch chuyển quan trọng trong DataOps, chuyển Orchestration từ cơ chế "Pull" (Sensors phải liên tục kéo/hỏi) sang cơ chế "Push" (Event-driven - tự động kích hoạt).

## Tài Liệu Tham Khảo
* [Apache Airflow Concepts - Sensors](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/sensors.html)
* [Deferrable Operators & Triggers - Airflow Docs](https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/deferring.html)
* [Data-aware Scheduling - Airflow Datasets](https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/datasets.html)
* [Airflow Best Practices cho Sensor của Astronomer](https://docs.astronomer.io/learn/what-is-a-sensor)
