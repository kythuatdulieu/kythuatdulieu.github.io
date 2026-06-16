---
title: "Architecture: Celery Executor vs Kubernetes Executor trong Apache Airflow"
description: "Phân tích chuyên sâu về kiến trúc, ưu nhược điểm và ứng dụng thực tế của Celery Executor và Kubernetes Executor trong các hệ thống Data quy mô lớn. Hướng dẫn lựa chọn và triển khai kiến trúc tối ưu (bao gồm cả CeleryKubernetesExecutor)."
---



Apache Airflow không tự chạy các task (như truy vấn SQL, chạy Python script hay huấn luyện Machine Learning model). Airflow chỉ đóng vai trò là "bộ não" điều phối, và giao việc thực thi cho các **Executors** (Máy thực thi). Khi hệ thống Data lớn lên, việc lựa chọn Executor phù hợp sẽ quyết định đến chi phí, tốc độ, độ ổn định và khả năng bảo trì của toàn bộ nền tảng dữ liệu. Cuộc chiến kinh điển nhất và cũng là bài toán kiến trúc phổ biến nhất trong Data Engineering là giữa **Celery Executor** và **Kubernetes (K8s) Executor**.

Trong bài viết này, chúng ta sẽ mổ xẻ chi tiết từng kiến trúc, so sánh chúng trên nhiều góc độ và khám phá cách kết hợp cả hai để tạo ra một hệ thống hoàn hảo.

---

## 1. Celery Executor: Cỗ Máy "Sống Dai" (Long-Running Workers)



Celery là kiến trúc mặc định và phổ biến nhất cho hầu hết các cụm Airflow truyền thống từ nhiều năm nay. Kiến trúc này dựa trên mô hình phân tán (distributed task queue) của framework Celery.

### 1.1 Kiến trúc và Cách hoạt động
Một cụm Airflow chạy Celery Executor thường bao gồm các thành phần sau:
- **Scheduler:** Bộ phận lập lịch, liên tục kiểm tra các DAG và tạo ra các task instance cần chạy.
- **Message Broker (Hàng đợi tin nhắn):** Thường là **Redis** hoặc **RabbitMQ**. Khi Scheduler thấy có task cần chạy, nó sẽ "đẩy" (push) thông tin của task đó vào hàng đợi này.
- **Celery Workers:** Là các máy chủ (EC2, VM) được cấu hình để chạy 24/7. Các Worker này liên tục "lắng nghe" Message Broker. Khi có task xuất hiện, Worker nào đang rảnh sẽ bốc task đó ra và thực thi.
- **Result Backend:** Một cơ sở dữ liệu (thường dùng chung Metadata Database như PostgreSQL/MySQL) lưu trữ trạng thái của các task sau khi Worker chạy xong (Success/Failed).
- **Flower (Optional):** Một giao diện web UI dùng để giám sát trực tiếp hàng đợi Celery và trạng thái của các Workers.

### 1.2 Ưu điểm
- **Độ trễ bằng 0 (Zero Latency):** Khởi động task cực nhanh vì các máy chủ (Worker) đã được bật sẵn và các tiến trình daemon luôn sẵn sàng nhận việc. Task được thực thi ngay lập tức khi vào Queue.
- **Hoạt động ổn định với tải đều đặn:** Rất hiệu quả cho các khối lượng công việc (workloads) có số lượng task phân bổ đều đặn trong ngày.
- **Dễ dàng giám sát qua Flower:** Cung cấp cái nhìn trực quan về resource của toàn bộ cụm Workers, số lượng task đang trong hàng đợi.

### 1.3 Nhược điểm và Thách thức
- **Lãng phí tài nguyên (Idle Cost):** Bạn phải trả tiền cho các Worker 24/7, ngay cả khi lúc 2h sáng không có task nào chạy. Để tiết kiệm, bạn có thể thiết lập Auto-scaling group, nhưng việc này phức tạp và thời gian scale-up máy ảo khá chậm (mất vài phút).
- **Thảm họa thư viện (Dependency Hell):** Các Worker là môi trường tĩnh. Nếu Task A cần thư viện `pandas==1.0` và Task B cần `pandas==2.0`, việc cài đặt chúng trên cùng một Worker là cực kỳ khó khăn. Rủi ro xung đột thư viện rất cao.
- **Một Task lỗi có thể kéo sập Worker (Resource Starvation):** Nếu một task bị memory leak hoặc sử dụng 100% CPU, toàn bộ các task khác chạy chung trên cùng một Worker đó có thể bị treo hoặc chết chùm.

---

## 2. Kubernetes Executor: Sát Thủ "Dùng Một Lần" (Ephemeral Pods)

Với sự trỗi dậy của Cloud Native, Kubernetes Executor đã thay đổi hoàn toàn cách chúng ta chạy Airflow. Khái niệm "Worker tĩnh chạy 24/7" hoàn toàn biến mất.

### 2.1 Kiến trúc và Cách hoạt động
- **Không có Message Broker và Worker tĩnh:** Kubernetes Executor giao tiếp trực tiếp với Kubernetes API.
- **Mỗi Task là một Pod (Pod-per-Task):** Khi Airflow Scheduler nhận thấy có một task cần chạy, nó sẽ gửi lệnh đến Kubernetes API để tạo ra một **Pod** (Container) mới tinh. 
- **Độc lập và tự hủy:** Pod này chứa đúng môi trường cần thiết, chạy duy nhất task đó. Sau khi task hoàn thành (thành công hoặc thất bại), Pod sẽ tự động bốc hơi, giải phóng hoàn toàn tài nguyên.

### 2.2 Ưu điểm
- **Cô lập hoàn toàn (Total Isolation):** Đây là "vũ khí hủy diệt" của K8s Executor. Task A có thể chạy trên một Docker image Python 3.6 với thư viện Pytorch cũ. Task B có thể chạy trên image R hay Java. Không có bất kỳ sự xung đột nào. Lỗi OOM (Out of Memory) của Task A cũng chỉ giết chết Pod của Task A, không ảnh hưởng đến ai.
- **Tối ưu chi phí tuyệt đối (True Autoscaling):** Tính đàn hồi siêu việt. Lúc 2h sáng không có task, Kubernetes (đặc biệt khi dùng cùng KEDA hoặc Karpenter) sẽ scale cụm node về 0, bạn tốn 0 đồng cho việc thực thi. Lúc 8h sáng cần xử lý 1000 tasks, K8s sẽ đẻ ra 1000 Pods, khi xong lại dọn dẹp sạch sẽ.
- **Linh hoạt tài nguyên phần cứng:** Bạn có thể chỉ định riêng biệt cho từng task. Ví dụ: Task A cần 100MB RAM, nhưng Task huấn luyện ML cần 1 GPU và 16GB RAM. K8s sẽ cấp phát chính xác yêu cầu này cho từng Pod tương ứng qua thông số `resources.requests` và `resources.limits`.

### 2.3 Nhược điểm và Thách thức
- **Độ trễ khởi động cao (Spin-up Latency):** Kubernetes mất thời gian để giao tiếp với API, lên lịch xếp Pod vào Node, tải (pull) Docker image và khởi động Container. Quá trình này có thể mất từ vài giây đến cả chục giây. 
- **Không phù hợp cho short-tasks:** Đối với các DAG có hàng trăm task siêu nhỏ (chỉ mất 1-2 giây để chạy như một câu truy vấn SQL ngắn hay API call nhanh), thời gian chờ khởi tạo Pod thậm chí còn lớn hơn cả thời gian chạy task, làm tổng thời gian chạy DAG tăng lên gấp nhiều lần.
- **Gây áp lực lớn lên Kubernetes API:** Nếu bạn ném hàng vạn task vào cùng một lúc, Kubernetes Control Plane có thể bị quá tải vì phải xử lý quá nhiều lệnh tạo/xóa Pod liên tục.

---

## 3. So Sánh Chi Tiết (Matrix)

| Tiêu chí | Celery Executor | Kubernetes Executor |
| :--- | :--- | :--- |
| **Kiến trúc thực thi** | Máy ảo tĩnh (Long-running Workers) | Container dùng một lần (Ephemeral Pods) |
| **Tốc độ khởi động task** | Siêu nhanh (Zero latency) | Chậm (Mất vài giây đến cả phút để tạo Pod) |
| **Mức độ cô lập (Isolation)** | Thấp (Các task chia sẻ chung môi trường) | Tuyệt đối (Mỗi task một Docker Image / Môi trường riêng) |
| **Khả năng mở rộng (Scaling)** | Khó, thường scale theo Node (VM/EC2) | Dễ, scale đến từng Pod, hỗ trợ scale to Zero |
| **Bảo trì / Quản lý thư viện** | Ác mộng (Dependency hell) | Dễ dàng (Đóng gói sẵn vào Docker Images) |
| **Quản lý tài nguyên (CPU/RAM)** | Cấp phát chung cho cả Worker | Cấp phát chi tiết cho từng Task (Pod) |
| **Mức độ phức tạp hạ tầng** | Trung bình (cần duy trì thêm Redis/RabbitMQ) | Cao (Yêu cầu đội ngũ am hiểu sâu về K8s) |

---

## 4. Kiến Trúc Tối Thượng: CeleryKubernetesExecutor

Trong thực tế doanh nghiệp, một hệ thống dữ liệu luôn có sự pha trộn:
- 80% là các task rất nhẹ, chạy nhanh, lặp lại nhiều lần (gọi API lấy dữ liệu, dọn dẹp DB, trigger hệ thống khác).
- 20% là các task cực nặng, cần cô lập, hoặc cần cấu hình thư viện độc đáo (chạy model Machine Learning, Spark submit).

Nhận thấy điều này, Airflow từ phiên bản 2.0 đã giới thiệu **`CeleryKubernetesExecutor`**. Đây không phải là một Executor mới, mà là một hệ thống định tuyến (router) cho phép chạy song song CẢ HAI!

**Cách hoạt động của CeleryKubernetesExecutor:**
- Mặc định, tất cả các task sẽ được chuyển vào hàng đợi của **Celery Executor**. Nhờ vậy, hàng vạn task nhẹ sẽ được chạy tức thì, không gặp vấn đề về độ trễ tạo Pod.
- Đối với những task cụ thể cần sự cô lập hoặc tài nguyên khủng, Data Engineer chỉ cần khai báo `queue='kubernetes'` trực tiếp trong code của Task (hoặc DAG). Lập tức, Airflow sẽ định tuyến task đó sang **Kubernetes Executor** để tạo Pod riêng.

**Ví dụ cấu hình Task chạy K8s trong môi trường hỗn hợp:**
```python
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import KubernetesPodOperator

# Task chạy trên K8s Pod riêng, dùng image chứa GPU và thư viện Tensorflow
ml_training_task = KubernetesPodOperator(
    task_id="train_model",
    name="train_model_pod",
    image="my-registry.com/data-science/tensorflow-env:v1",
    cmds=["python", "train.py"],
    namespace="airflow-tasks",
    queue="kubernetes", # Lệnh định tuyến qua K8s Executor
    get_logs=True
)
```

---

## 5. Lời Khuyên: Bạn Nên Chọn Gì?

Việc lựa chọn phụ thuộc hoàn toàn vào quy mô hạ tầng, đặc thù dữ liệu và khả năng của đội ngũ:

1. **Chọn Celery Executor nếu:**
   - Công ty bạn chưa có sẵn hạ tầng Kubernetes và chưa có kỹ sư chuyên vận hành K8s.
   - Luồng công việc chủ yếu là các task ngắn, yêu cầu phản hồi nhanh, chạy trên cùng một tập thư viện Python tiêu chuẩn.
   - Team của bạn nhỏ, muốn hệ thống đơn giản, dễ debug trực tiếp trên máy chủ.

2. **Chọn Kubernetes Executor nếu:** (Được coi là chuẩn mực hiện đại)
   - Công ty bạn đã chuyển đổi số sang Kubernetes và có đội ngũ DevOps vận hành cụm K8s vững chắc.
   - Bạn quản lý một nền tảng Data chung cho nhiều phòng ban (Marketing, Data Science, BI...), mỗi team sử dụng một bộ công cụ, thư viện và ngôn ngữ khác nhau.
   - Bạn muốn tối ưu chi phí hạ tầng triệt để vào ban đêm hoặc những lúc không có task chạy.

3. **Chọn CeleryKubernetesExecutor nếu:**
   - Cụm Airflow của bạn có quy mô rất lớn (Enterprise Level), phục vụ hàng nghìn DAGs mỗi ngày. Bạn muốn tốc độ thần tốc của Celery cho luồng dữ liệu chuẩn, nhưng vẫn cần sự độc lập của K8s cho các quy trình AI/ML phức tạp.

Việc hiểu sâu sắc ưu nhược điểm của các Executor không chỉ giúp hệ thống chạy nhanh hơn, mà còn có thể giúp công ty tiết kiệm hàng nghìn đô la chi phí máy chủ mỗi tháng.

---

## Tài Liệu Tham Khảo Mở Rộng
* [Apache Airflow Executors Explained - Airflow Docs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/executor/index.html)
* [Kubernetes Executor in Airflow](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/executor/kubernetes.html)
* [Celery Architecture](https://docs.celeryq.dev/en/stable/getting-started/introduction.html)
* [DataOps Manifesto - The Foundation of Modern Data Engineering](https://dataopsmanifesto.org/)
* **Astronomer: The hybrid approach (CeleryKubernetes Executor)**
