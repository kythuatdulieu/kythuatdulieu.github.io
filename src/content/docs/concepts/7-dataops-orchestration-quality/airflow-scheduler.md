---
title: "Airflow Scheduler - Bộ não điều phối"
difficulty: "Advanced"
tags: ["airflow", "scheduler", "orchestration", "architecture", "data-engineering"]
readingTime: "12 mins"
lastUpdated: 2026-06-16
seoTitle: "Airflow Scheduler hoạt động như thế nào? Cấu trúc và Tối ưu"
metaDescription: "Tìm hiểu chi tiết về Airflow Scheduler, trái tim của hệ thống Apache Airflow. Cách nó phân tích DAG, lên lịch tác vụ và vòng lặp DagFileProcessor."
description: "Trong hệ sinh thái Apache Airflow, nếu giao diện Web UI là gương mặt đại diện giúp bạn dễ dàng theo dõi hệ thống, các Worker là những 'công nhân' chăm chỉ, thì Scheduler chính là 'bộ não' trung tâm."
---



Trong hệ sinh thái Apache Airflow, nếu giao diện Web UI là gương mặt đại diện giúp bạn dễ dàng theo dõi hệ thống, các Worker là những "công nhân" chăm chỉ thực hiện công việc, thì **Scheduler** chính là "bộ não" trung tâm. 

Airflow Scheduler chịu trách nhiệm liên tục theo dõi tất cả các DAG (Directed Acyclic Graphs) và các Task tương ứng, đánh giá các điều kiện phụ thuộc (Dependencies), và quyết định khi nào một Task đã sẵn sàng để được thực thi.

---

## 1. Vai trò cốt lõi của Airflow Scheduler



Airflow Scheduler không trực tiếp thực thi (execute) các tác vụ, mà nó làm nhiệm vụ **điều phối và lập lịch**. Cụ thể, các trách nhiệm chính của Scheduler bao gồm:

1. **Quét và phân tích cú pháp (Parsing) thư mục DAGs**: Định kỳ đọc các file Python trong thư mục `dags/` để phát hiện các DAG mới, cập nhật cấu trúc của các DAG hiện có, hoặc xóa bỏ những DAG không còn tồn tại.
2. **Tạo DAG Runs**: Dựa trên thuộc tính `schedule_interval` (hoặc `schedule` trong các phiên bản mới), Scheduler quyết định khi nào cần tạo ra một phiên bản chạy mới (DAG Run).
3. **Đánh giá Task Instances (TIs)**: Kiểm tra trạng thái của các Task bên trong một DAG. Nếu các điều kiện tiền đề (như các Task trước đó đã hoàn thành thành công) được thỏa mãn, nó sẽ chuyển trạng thái Task thành `Scheduled`.
4. **Gửi Task tới Executor**: Sau khi quyết định Task nào cần chạy, Scheduler đẩy chúng vào một hàng đợi (Queue) thông qua cơ chế của **Executor** (ví dụ: CeleryExecutor, KubernetesExecutor), từ đó các Worker sẽ nhận nhiệm vụ và thực thi.

---

## 2. Kiến trúc tổng quan của Scheduler

Bắt đầu từ Airflow 2.0, kiến trúc của Scheduler đã được cải tiến mạnh mẽ để hỗ trợ **High Availability (HA)** (chạy nhiều Scheduler cùng lúc) và tăng hiệu năng.

Các thành phần chính phối hợp với Scheduler bao gồm:

*   **Meta Database**: Cơ sở dữ liệu lưu trữ toàn bộ metadata của Airflow (trạng thái của DAG, Task, Connections, Variables...). Scheduler liên tục đọc và ghi vào database này.
*   **DagFileProcessorManager**: Quản lý nhiều tiến trình con (`DagFileProcessorProcess`) để phân tích các file Python một cách song song.
*   **Scheduler Loop**: Vòng lặp vô tận (infinite loop) thực hiện việc kiểm tra database, tìm kiếm các Task sẵn sàng, và đẩy chúng cho Executor.
*   **Executor**: Giao diện (Interface) trung gian nhận nhiệm vụ từ Scheduler và chuyển chúng cho hệ thống thực thi thực tế (ví dụ: đẩy vào Redis/RabbitMQ nếu dùng Celery, hoặc tạo Pod nếu dùng Kubernetes).

### Cơ chế High Availability (Active-Active Schedulers)

Trước Airflow 2.0, hệ thống chỉ cho phép chạy 1 Scheduler duy nhất (Single Point of Failure). Nếu Scheduler chết, toàn bộ hệ thống ngừng lên lịch. 

Từ Airflow 2.0, bạn có thể chạy nhiều tiến trình Scheduler cùng lúc (mô hình Active-Active). Điều này đạt được nhờ cơ chế **Row-level locking (SKIP LOCKED)** của cơ sở dữ liệu (hỗ trợ bởi PostgreSQL 9.5+ và MySQL 8.0+). Khi một Scheduler chọn một Task để xử lý, nó sẽ "khóa" dòng dữ liệu đó lại, đảm bảo các Scheduler khác không thể xử lý cùng một Task, giúp tăng tốc độ xử lý và đảm bảo tính dự phòng.

---

## 3. Vòng lặp Scheduler (The Scheduler Loop)

Hoạt động của Scheduler có thể được hình dung qua một vòng lặp liên tục gồm các bước sau:

1.  **Cập nhật trạng thái DAGs**: Tiến trình DagFileProcessor lưu kết quả phân tích file Python vào Database (bảng `dag`, `serialized_dag`).
2.  **Khởi tạo DAG Run**: Scheduler quét bảng `dag`, kiểm tra các DAG đang `active` và có `schedule_interval` đã đến hạn. Nếu có, nó tạo ra các bản ghi `dag_run` với trạng thái `Running`.
3.  **Lên lịch Task Instances (Scheduling TIs)**:
    *   Scheduler tìm kiếm các DAG Run đang chạy.
    *   Nó kiểm tra các Task Instances bên trong DAG Run đó.
    *   Nếu Task không có dependencies nào chưa hoàn thành (các upstream tasks đã `success`), Task Instance được chuyển sang trạng thái `Scheduled`.
4.  **Đẩy vào hàng đợi (Queuing TIs)**:
    *   Scheduler lấy một số lượng TIs đang ở trạng thái `Scheduled` (số lượng bị giới hạn bởi các cấu hình concurrency).
    *   Chuyển trạng thái của chúng thành `Queued` và gửi lệnh thực thi đến Executor.
5.  **Executor đảm nhận (Executor adoption)**: Executor chuyển tiếp các tác vụ này tới Worker. Khi Worker bắt đầu chạy, trạng thái TI chuyển thành `Running`. Scheduler sau đó cập nhật kết quả cuối cùng (`Success` hoặc `Failed`) dựa trên báo cáo từ Worker/Database.

---

## 4. Tối ưu hóa hiệu suất (Tuning the Scheduler)

Để Airflow xử lý hàng ngàn DAGs mà không bị giật lag, bạn cần điều chỉnh cấu hình trong file `airflow.cfg` (hoặc thông qua Environment Variables) dựa trên tài nguyên phần cứng (CPU/RAM).

### Tối ưu thời gian phân tích DAG (Parsing)

Quá trình "Parse" file Python là nguyên nhân phổ biến nhất gây ra sự chậm trễ.

*   **`parsing_processes`** (hoặc `max_threads` ở bản cũ): Số lượng tiến trình con dùng để parse file thư mục DAG song song. Khuyến nghị: Bằng `2 * Số_lượng_CPU_cores - 1`.
*   **`min_file_process_interval`**: Thời gian chờ (giây) sau khi một file được parse trước khi tiến trình parse nó lần tiếp theo. Tăng giá trị này (vd: `30` hoặc `60` thay vì `0` mặc định ở một số bản cũ) giúp giảm tải CPU nếu các DAG của bạn ít bị thay đổi logic thường xuyên.
*   **`dag_dir_list_interval`**: Tần suất (giây) quét thư mục để tìm kiếm file DAG mới. 

> [!WARNING]
> **Nguyên tắc vàng "Top-level code"**: Tuyệt đối tránh việc thực thi logic nặng, kết nối database, gọi API, hoặc thực hiện tính toán (pandas/spark) ở cấp độ ngoài cùng (top-level) của file DAG. Những đoạn code này sẽ được chạy **mỗi khi Scheduler parse file** (vài giây một lần), dẫn đến sập toàn bộ hệ thống. Logic công việc phải luôn được đặt bên trong các Operators (hoặc hàm của `PythonOperator`).

### Tối ưu vòng lặp Scheduler

*   **`scheduler_heartbeat_sec`**: Thời gian Scheduler "báo cáo" sự tồn tại của nó.
*   **`max_tis_per_query`**: Số lượng Task Instances Scheduler truy vấn từ DB mỗi lần quét. Tăng lên nếu DB mạnh.
*   **`parallelism`**: Số lượng Task Instances tối đa có thể chạy song song trên **toàn bộ** hệ thống Airflow.
*   **`max_active_tasks_per_dag`** (trước đây là `dag_concurrency`): Số lượng TIs tối đa có thể chạy đồng thời trong **một** DAG.
*   **`max_active_runs_per_dag`**: Số lượng DAG Runs (phiên bản chạy) đồng thời của một DAG. Tránh trường hợp backfill chạy quá nhiều làm cạn kiệt tài nguyên.

---

## 5. Xử lý sự cố thường gặp với Scheduler (Troubleshooting)

Trong quá trình vận hành, Scheduler có thể gặp một số tình trạng sau:

### Tình trạng Zombie Tasks
Zombie task là hiện tượng database ghi nhận trạng thái task là `Running`, nhưng thực tế Worker đang chạy task đó đã bị sập (OOM, mất kết nối, v.v.).
*   **Cách giải quyết**: Airflow có một tiến trình nhỏ gọi là `Zombie Killer` chạy bên trong Scheduler. Nó sẽ tìm các task không gửi heartbeat về, đánh dấu chúng là `Failed` và lên lịch chạy lại (retry) nếu có cấu hình. Bạn có thể chỉnh `scheduler_zombie_task_threshold` để điều chỉnh độ nhạy.

### Trễ thời gian lên lịch (High Scheduling Latency)
Task hiển thị `Scheduled` hoặc `None` trong một khoảng thời gian dài trước khi được chuyển sang `Queued` hoặc `Running`.
*   **Cách giải quyết**: 
    1. Kiểm tra giới hạn Pool (Pool slots đã bị đầy).
    2. Kiểm tra `parallelism` hoặc concurrency config đã chạm ngưỡng giới hạn.
    3. Máy chủ Scheduler đang bị thắt cổ chai CPU (CPU Bottleneck) do có quá nhiều file DAG lớn, cần phải tối ưu mã nguồn (xóa top-level code) hoặc tăng số lượng tiến trình Scheduler (chạy HA).

### Scheduler ngừng hoạt động (Stuck)
Do lỗi DB lock, hết bộ nhớ hoặc lỗi thư viện, tiến trình Scheduler có thể bị treo mà không crash.
*   **Cách giải quyết**: Triển khai cảnh báo giám sát (Prometheus/Grafana) dựa trên số liệu `scheduler_heartbeat`. Nếu heartbeat không cập nhật quá 5 phút, kích hoạt tự động khởi động lại (restart) container/service của Scheduler. Sử dụng mô hình High Availability với từ 2 Schedulers trở lên.

---

## 6. Tổng kết

Airflow Scheduler là một hệ thống tinh vi với khả năng tự phục hồi, mở rộng và quản lý luồng dữ liệu khổng lồ. Hiểu sâu về cách thức hoạt động của vòng lặp Scheduler, phân biệt rõ vai trò của DagFileProcessor và Executor, cũng như áp dụng triệt để các kỹ thuật tối ưu mã nguồn DAG sẽ giúp bạn xây dựng được một hạ tầng dữ liệu (DataOps) bền bỉ, mượt mà và có độ tin cậy cao.

---

## Tài Liệu Tham Khảo
* [Apache Airflow Architecture - Airflow Docs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html)
* [Airflow Scheduler Internals](https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/scheduler.html)
* [DataOps Manifesto](https://dataopsmanifesto.org/)
* [Dagster: Data Orchestration for Machine Learning and Analytics](https://dagster.io/)
* [dbt (data build tool) - Analytics Engineering Workflow](https://www.getdbt.com/product/what-is-dbt/)
