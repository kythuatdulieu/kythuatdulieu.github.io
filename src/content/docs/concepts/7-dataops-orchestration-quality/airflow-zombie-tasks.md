---
title: "Troubleshooting: Airflow Zombie Tasks & Pool Starvation"
description: "Hướng dẫn chi tiết cách phát hiện, xử lý và phòng tránh hai vấn đề đau đầu nhất khi vận hành Apache Airflow: Zombie Tasks (Task bóng ma) và Pool Starvation (Tắc nghẽn tài nguyên)."
---



Nếu bạn từng vận hành Apache Airflow trên môi trường Production ở quy mô lớn, chắc chắn bạn đã từng trải qua cảm giác bất lực khi một DAG chạy mãi không xong. Bạn mở giao diện Airflow (UI) lên, thấy một loạt các task hiện màu xanh lá cây (`Running`) hoặc màu xám (`Queued`). Bạn chờ 1 tiếng, 2 tiếng, trạng thái vẫn không đổi. Nhưng khi bạn kiểm tra logs của task đó, chả có dòng log mới nào được sinh ra, hoặc task thậm chí còn chưa được cấp phát để chạy. 

Chúc mừng, hệ thống của bạn đang gặp phải một trong hai "căn bệnh" phổ biến nhất của Airflow: **Zombie Tasks** (Task bóng ma) hoặc **Pool Starvation** (Đói tài nguyên Pool).

Bài viết này sẽ đi sâu vào nguyên nhân gốc rễ của hai hiện tượng này và cách cấu hình, tối ưu để hệ thống Data Orchestration của bạn luôn mượt mà.

---

## 1. Zombie Task (Task Bóng Ma) Là Gì?



Trong kiến trúc của Apache Airflow, khi một Task được lập lịch và giao cho Worker chạy (ví dụ qua Celery Executor hoặc Kubernetes Executor), Database lưu trữ Metadata của Airflow sẽ cập nhật trạng thái của Task đó thành `running`. Khi tiến trình vật lý thực sự chạy code kết thúc (thành công hay thất bại), nó sẽ báo cáo lại trạng thái (`success` hoặc `failed`) cho Database.

Tuy nhiên, **Zombie Task** xảy ra khi có sự bất đồng bộ giữa Database và Worker: Tiến trình vật lý đang chạy Task trên Worker đã bị "giết chết" hoặc biến mất một cách tàn bạo, nhưng nó không kịp "hấp hối" để báo cáo lại cho Database của Airflow là "Tôi chết rồi".

Kết quả là: Database của Airflow vẫn đinh ninh Task đang ở trạng thái `running`. Do không có ai báo fail, Scheduler không biết để chạy lại (retry), dẫn đến toàn bộ luồng DAG bị tắc nghẽn vĩnh viễn vì phải chờ đợi một cái "xác không hồn".

### 1.1 Nguyên Nhân Gốc Rễ Gây Ra Zombie Task

Zombie không tự sinh ra, nó thường là hậu quả của các sự cố hạ tầng hoặc lỗi cấu hình nghiêm trọng:

- **OOM Killed (Hết RAM):** Đây là nguyên nhân số 1. Task Python của bạn (ví dụ xài Pandas) cố gắng load một file dữ liệu 10GB vào bộ nhớ trong khi Container/Worker chỉ được cấp 4GB RAM. Hệ điều hành Linux ngay lập tức tung ra đòn OOM Killer (Out Of Memory) giết chết tiến trình Python không thương tiếc để bảo vệ hệ thống. Tiến trình bị ngắt đột ngột (SIGKILL) nên không thể bắn ra exception hay dọn dẹp log, Airflow hoàn toàn mù tịt về cái chết này.
- **Node Của Kubernetes Bị Rút (Eviction / Spot Instances):** Nếu bạn xài Kubernetes Executor và chạy trên các máy chủ giá rẻ (Spot Instances của AWS/GCP bị thu hồi bất cứ lúc nào), hoặc Node bị quá tải dẫn đến trạng thái `NotReady`. K8s sẽ evict (đuổi) Pod đi chỗ khác. Pod biến mất thình lình, mất mạng, mang theo cả tiến trình đang chạy task.
- **Mất Kết Nối Database (Database Timeout / Deadlock):** Database lưu trữ Metadata của Airflow (PostgreSQL/MySQL) bị quá tải vì có quá nhiều kết nối từ Scheduler và các Worker. Worker chạy code xong, nhưng khi cố gắng ghi chữ `success` vào Database thì bị Timeout hoặc rớt mạng. Tiến trình Worker kết thúc, nhưng Database chưa ghi nhận được trạng thái mới, và task biến thành Zombie.
- **Cấu hình Graceful Shutdown sai:** Khi cập nhật phiên bản Airflow hoặc deploy code mới, các Worker bị restart. Nếu quá trình restart không chờ các task đang chạy hoàn thành (Graceful Shutdown) mà ép buộc dừng (Force kill), các task đó sẽ trở thành Zombies.

### 1.2 Airflow Dọn Dẹp Zombie Như Thế Nào?

Scheduler của Airflow có một cơ chế tuần tra ngầm định kỳ gọi là `Zombie Killer`.

Mỗi tiến trình Task đang chạy (`LocalTaskJob`) sẽ định kỳ gửi một tín hiệu (gọi là Heartbeat) cập nhật cột `latest_heartbeat` trong bảng `job` của database.
Scheduler sẽ liên tục quét bảng `job` này. Nếu nó thấy một task đang `running` nhưng **đã quá lâu không phát ra nhịp tim**, Scheduler sẽ tự động đánh dấu task đó là Zombie (chuyển sang `failed` hoặc kích hoạt cơ chế Retry theo cấu hình).

Tuy nhiên, cơ chế này phụ thuộc vào cấu hình: `scheduler_zombie_task_threshold` (mặc định thường là 5 phút). Nếu task bị kẹt, bạn sẽ mất ít nhất khoảng thời gian này để Airflow nhận ra sự thật.

### 1.3 Cách Xử Lý và Phòng Chống Zombie Task

1. **Kiểm Soát Tài Nguyên (Memory & CPU):** 
   - Đừng dùng Pandas để xử lý dữ liệu lớn trong bộ nhớ trực tiếp trên Worker. Hãy dùng Spark, dbt (đẩy tải xuống Data Warehouse), hoặc chunking dữ liệu.
   - Nếu dùng Kubernetes Executor, luôn set `resources.requests` và `resources.limits` cẩn thận để tránh Node bị OOM.
2. **Luôn Thiết Lập Timeout Cho Task:** 
   - Tuyệt đối không để một task được quyền chạy vô cực. Hãy set `execution_timeout` cho MỌI task. Ví dụ: `execution_timeout = timedelta(hours=2)`. Nếu quá 2 tiếng task không xong, Airflow tự động huỷ tiến trình đó đi, giúp tránh bị kẹt ảo.
3. **Theo Dõi Metrics:** 
   - Tích hợp StatsD/Prometheus với Airflow để theo dõi metric `zombies_killed`. Nếu con số này tăng đột biến, hạ tầng của bạn đang có vấn đề nghiêm trọng.
4. **Tối Ưu Kết Nối Database:** 
   - Sử dụng PgBouncer (với PostgreSQL) để thực hiện Connection Pooling, giảm tải số lượng kết nối trực tiếp đến Database, tránh tình trạng Worker không thể update state.

---

## 2. Pool Starvation (Tắc Nghẽn Tài Nguyên Pool)

Nếu Zombie Task thường biểu hiện bằng màu xanh lá (`running`) kẹt vĩnh viễn, thì **Pool Starvation** biểu hiện bằng màu xám (`queued` hoặc `scheduled`) kẹt vô tận. Các task chờ mãi nhưng không bao giờ được chuyển sang `running`.

### 2.1 Airflow Pools Là Gì?

Airflow Pools là cơ chế giúp giới hạn mức độ đồng thời (concurrency) của một nhóm các Task.
Ví dụ: Bạn có một API lấy dữ liệu chỉ cho phép 5 request đồng thời. Bạn tạo một Pool có tên `api_pool` với số lượng slots = 5. Nếu có 100 task cần gọi API này và đều được gán vào `api_pool`, Airflow sẽ chỉ chạy tối đa 5 task cùng lúc. 95 task còn lại sẽ phải nằm xếp hàng chờ ở trạng thái `queued`.

**Pool Starvation** (Đói Pool) xảy ra khi toàn bộ slots trong một Pool (hoặc `default_pool`) bị chiếm dụng hoàn toàn, không nhả ra, khiến các task khác đang xếp hàng bị "chết đói" vì không bao giờ đến lượt mình.

### 2.2 Nguyên Nhân Gây Tắc Nghẽn Pool

- **Zombie Tasks Chiếm Dụng Slots:** Bất ngờ chưa! Các task bóng ma không chỉ làm kẹt DAG của chúng, mà chúng còn GIỮ LUÔN SLOT TRONG POOL. Vì Database tưởng nó vẫn đang `running`, nên slot không được trả lại. Kéo theo toàn bộ hệ thống tê liệt.
- **Dùng Sensor Ở Chế Độ `poke` Cho Tác Vụ Lâu Dài:** 
  - Sensor trong Airflow dùng để đợi một file xuất hiện trên S3 hoặc đợi một sự kiện. Mặc định, Sensor chạy ở mode `poke`: nó sẽ chiếm một slot của Worker và vòng lặp check liên tục (`time.sleep`) cho đến khi có dữ liệu.
  - Nếu file đó mất 5 tiếng mới có, Sensor sẽ chiếm giữ 1 slot trong Worker (và 1 slot trong Pool) suốt 5 tiếng đó mà không làm gì hữu ích. Nhiều Sensor như vậy chạy cùng lúc sẽ làm sập toàn bộ Worker pool.
- **Task Có Thời Gian Chạy Quá Dài (Long-running Tasks):** Các task training Machine Learning hoặc query SQL khổng lồ chạy mất 10-20 tiếng chiếm hết Pool mặc định. Các task nhỏ lẻ (gửi email, check file) chạy chỉ tốn 5 giây cũng bị block không thể chạy được.
- **Deadlock giữa các DAG:** Các DAG có độ ưu tiên thấp chiếm hết slot, ngăn cản các DAG quan trọng (chạy hàng giờ, phục vụ báo cáo tài chính) lấy được tài nguyên để khởi chạy.

### 2.3 Cách Xử Lý và Phòng Chống Pool Starvation

1. **Đổi Cấu Hình Sensor Sang Chế Độ `reschedule`:**
   - LUÔN LUÔN cân nhắc thay đổi tham số `mode='poke'` thành `mode='reschedule'` đối với các Sensor phải đợi lâu (trên 5 phút). Ở chế độ `reschedule`, Sensor sẽ check dữ liệu, nếu chưa có, nó sẽ tự động rơi vào trạng thái `up_for_reschedule`, TRẢ LẠI SLOT CHO POOL, và hẹn giờ vài phút sau tỉnh dậy check lại. Điều này giải phóng tài nguyên vô cùng lớn.
2. **Sử Dụng Deferrable Operators (Async Operators):**
   - Từ Airflow 2.2+, tính năng **Deferrable Operators** được ra mắt. Thay vì dùng Sensor, bạn có thể đẩy quá trình chờ đợi (chờ API, chờ database) sang một tiến trình bất đồng bộ siêu nhẹ gọi là `Triggerer`. Tính năng này giúp hàng ngàn task đang đợi chỉ tốn một lượng tài nguyên RAM/CPU cực kỳ nhỏ bé, giải quyết triệt để bài toán chiếm slot của Sensor truyền thống.
3. **Phân Lập Các Pool (Pool Isolation):**
   - Không nên đổ tất cả mọi thứ vào `default_pool`. Hãy tạo các Pool riêng biệt: `fast_queries_pool`, `ml_training_pool`, `api_requests_pool`.
   - Bằng cách này, nếu có sự cố làm kẹt API, thì chỉ `api_requests_pool` bị đầy, các pipeline báo cáo quan trọng chạy trên pool khác vẫn không bị ảnh hưởng.
4. **Quản Lý Độ Ưu Tiên (Priority Weights):**
   - Sử dụng tham số `priority_weight` cho các Task hoặc DAG cực kỳ quan trọng (Core Data Pipeline). Khi có slot trống, Scheduler sẽ ưu tiên lôi các task có `priority_weight` cao ra chạy trước thay vì chạy theo thuật toán FIFO (First-In-First-Out) thông thường.
5. **Kiểm Soát Tham Số Concurrency Mức Toàn Cục:**
   - Hiểu rõ sự khác biệt và giới hạn đúng các tham số: `core.parallelism` (Tối đa bao nhiêu task chạy toàn cụm Airflow), `core.max_active_tasks_per_dag` (Một DAG được chạy tối đa bao nhiêu task), và cấu hình conccurency của chính Executor đang dùng (Celery worker_concurrency).

---

## 3. Tổng Kết

Zombie Tasks và Pool Starvation là hai người bạn đồng hành thường thấy khi hệ thống dữ liệu bắt đầu Scale lên vài trăm hoặc vài ngàn DAGs. Việc nắm vững cách tương tác giữa Scheduler, Worker và Database, cũng như tuân thủ các Best Practices (Sử dụng `reschedule`, `timeout`, Phân mảnh `Pool`, Monitor metrics) sẽ giúp bạn có những giấc ngủ ngon hơn, không còn bị báo động (pager) dựng dậy lúc nửa đêm.

---

## Tài Liệu Tham Khảo

* [Apache Airflow Architecture - Airflow Docs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html)
* **Airflow Concepts: Pools**
* [Deferrable Operators & Triggers](https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/deferring.html)
* [DataOps Manifesto](https://dataopsmanifesto.org/)
