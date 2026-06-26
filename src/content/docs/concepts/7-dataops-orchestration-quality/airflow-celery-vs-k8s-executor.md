---
title: "Architecture: Celery Executor vs Kubernetes Executor trong Apache Airflow"
description: "Phân tích kiến trúc vật lý, trade-offs hệ thống và các sự cố vận hành (OOMKilled, API Overload) giữa Celery Executor và Kubernetes Executor."
lastUpdated: "2026-06-26"
---

Apache Airflow không tự thực thi các task. Nó là bộ não điều phối (Control Plane) giao việc cho các **Executors** (Data Plane). Khi hệ thống mở rộng, việc chọn sai Executor không chỉ làm phình to chi phí hạ tầng (Idle Cost) mà còn gây ra các thảm họa hệ thống (System Outages) khó debug. Cuộc đối đầu kinh điển nhất về kiến trúc luôn diễn ra giữa **Celery Executor** và **Kubernetes (K8s) Executor**.

---

## 1. Kiến trúc Thực thi Vật lý (Physical Execution)

### 1.1. Celery Executor: Mô hình Long-Running Workers

Celery Executor áp dụng kiến trúc phân tán truyền thống (Distributed Task Queue). Các "Worker" là các máy ảo (EC2, VM) hoặc Container tĩnh được bật 24/7, liên tục pooling (nghe ngóng) các task từ một Message Broker trung gian.

```mermaid
flowchart LR
    Scheduler["Airflow Scheduler"] -- Push Task --> Broker[("Message Broker\n(Redis/RabbitMQ)")]
    Broker -- Pull Task --> Worker1["Celery Worker 1\n(Concurrency: 16)"]
    Broker -- Pull Task --> Worker2["Celery Worker 2\n(Concurrency: 16)"]
    
    Worker1 -- Write State --> DB[("Result Backend\n(PostgreSQL)")]
    Worker2 -- Write State --> DB
    
    style Broker fill:#f9f,stroke:#333,stroke-width:2px
    style Worker1 fill:#bbf,stroke:#333,stroke-width:2px
    style Worker2 fill:#bbf,stroke:#333,stroke-width:2px
```

*Cấu hình `airflow.cfg` kinh điển cho Celery:*
```ini
[core]
executor = CeleryExecutor
parallelism = 1024

[celery]
# Yêu cầu bắt buộc phải có Broker và Result Backend
broker_url = redis://redis:6379/0
result_backend = db+postgresql://airflow:airflow@postgres/airflow
worker_concurrency = 16 
```

### 1.2. Kubernetes Executor: Mô hình Ephemeral Pod-per-Task

Sự bùng nổ của Cloud Native mang đến Kubernetes Executor. Ở đây, khái niệm "Worker tĩnh" bị xóa bỏ. Thay vì đẩy task vào Queue, Scheduler nói chuyện trực tiếp với K8s API. Mỗi khi có task, một Pod (Container) mới tinh được khởi tạo. Chạy xong, Pod lập tức tự hủy (bốc hơi).

```mermaid
flowchart TD
    Scheduler["Airflow Scheduler"] -- API Call (Create Pod) --> K8sAPI["Kubernetes API Server"]
    K8sAPI -- Schedule --> Node1["K8s Worker Node"]
    
    subgraph Node1
        Pod1["Task A Pod\n(Image: pandas_env)"]
        Pod2["Task B Pod\n(Image: tf_env\nGPU: 1)"]
    end
    
    Pod1 -- Write State --> DB[("Metadata DB")]
    Pod2 -- Write State --> DB
    
    style K8sAPI fill:#f96,stroke:#333,stroke-width:2px
    style Pod1 fill:#bfb,stroke:#333,stroke-width:1px
    style Pod2 fill:#bfb,stroke:#333,stroke-width:1px
```

*Template cấu hình `pod_template.yaml` cấp phát tài nguyên chi tiết:*
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: airflow-worker-template
spec:
  containers:
    - name: base
      image: apache/airflow:2.7.0-python3.9
      resources:
        requests:
          memory: "512Mi"
          cpu: "250m"
        limits:
          memory: "1Gi"  # OOMKilled nếu vượt quá giới hạn này
          cpu: "500m"
  restartPolicy: Never
```

---

## 2. Phân tích Đánh đổi Hệ thống (Systemic Trade-offs)

Quyết định chọn Executor phụ thuộc vào việc bạn sẵn sàng đánh đổi yếu tố nào giữa **Độ trễ (Latency)**, **Độ cô lập (Isolation)** và **Độ phức tạp vận hành (Operational Complexity)**.

| Đặc tính Kỹ thuật | Celery Executor (Static Workers) | Kubernetes Executor (Ephemeral Pods) |
| :--- | :--- | :--- |
| **Spin-up Latency** (Độ trễ khởi động) | **Zero (Tính bằng ms)**. Worker đã nạp sẵn RAM, task vào là chạy. | **Cao (5s - 60s)**. Phải gọi K8s API -> Schedule Node -> Pull Image -> Init Container. |
| **Environment Isolation** (Cô lập môi trường) | **Kém (Dependency Hell)**. Các task chung Worker phải dùng chung thư viện Python (`requirements.txt`). | **Tuyệt đối (Nirvana)**. Mỗi task có thể dùng một Docker Image khác nhau (Python, R, Java). |
| **Resource Allocation** (Cấp phát tài nguyên) | Tĩnh (Static). Worker to nhưng task nhỏ sẽ gây lãng phí (Idle). | Động (Granular). Định nghĩa CPU/RAM limit chính xác đến từng task. |
| **State Management** (Lưu trữ trạng thái) | Dựa vào Broker phụ trợ (Redis/RabbitMQ) - Thêm Single Point of Failure (SPOF). | Trực tiếp qua K8s API và Airflow DB - Lệ thuộc sức chịu tải của K8s Control Plane. |

---

## 3. Rủi ro Vận hành và Troubleshooting (Real-world Incidents)

Không có kiến trúc nào hoàn hảo. Dưới đây là các tình huống sập hệ thống (Incidents) phổ biến nhất khi vận hành ở quy mô lớn (Enterprise Scale).

### 3.1. Thảm họa OOMKilled "Chết chùm" (Celery Executor Blast Radius)
- **Vấn đề:** Giả sử Worker của bạn có 16GB RAM, `worker_concurrency = 16` (chạy 16 task đồng thời). Một Data Scientist push lên một task Pandas `read_csv` một file 10GB.
- **Hệ quả:** Tiến trình ngốn cạn RAM. Linux Kernel kích hoạt `OOM Killer` (Out Of Memory) và kill luôn tiến trình Worker đó.
- **Blast Radius (Bán kính sát thương):** Toàn bộ 15 task khác đang chạy hoàn toàn bình thường trên Worker đó lập tức bị "chết chùm" (Zombies/Failed).
- **Khắc phục:** 
  - Đổi sang dùng Spark/Dask thay vì Pandas cho dữ liệu lớn.
  - Sử dụng Kubernetes Executor để giới hạn `Blast Radius` (OOM của một Pod không lan sang Pod khác).

### 3.2. Tấn công DDoS vào Kubernetes Control Plane (K8s Executor Overload)
- **Vấn đề:** Bạn cần Backfill lại dữ liệu của 1 năm qua cho một DAG gồm 50 tasks rất nhẹ (mỗi task chỉ chạy câu SQL mất 2 giây). Tổng cộng: $365 \times 50 = 18,250$ tasks.
- **Hệ quả:** Scheduler đồng loạt gửi hàng ngàn lệnh Create Pod đến **Kubernetes API Server**. ETCD Database của K8s bị quá tải (API Server Overload/Memory Pressure). K8s Control Plane bị đơ, không thể schedule Pod, dẫn đến toàn bộ cụm Airflow (kể cả Webserver) bị timeout. Hơn nữa, tổng thời gian chạy DAG chậm đi gấp 10 lần vì *Spin-up Latency* (Mất 10 giây để tạo Pod cho một task chạy 2 giây).
- **Khắc phục:** 
  - Không dùng K8s Executor cho các task siêu nhỏ. 
  - Gộp các task siêu nhỏ (Task Consolidation) hoặc chuyển sang dùng Celery.

---

## 4. Tối ưu Chi phí (FinOps) & Cấu trúc Hỗn hợp (Hybrid Routing)

### True Autoscaling với K8s Executor
Nếu hệ thống của bạn có "đỉnh tải" (Spiky workloads) rõ rệt (Vd: chỉ chạy mạnh vào 2h sáng, ban ngày rảnh rỗi), Kubernetes Executor kết hợp với **Karpenter** hoặc **Cluster Autoscaler** mang lại khả năng *Scale-to-Zero* (Về 0 đồng khi không có task). Ngược lại, Celery luôn yêu cầu bạn trả tiền cho "Idle Capacity" (Dung lượng nhàn rỗi) 24/7.

### Kiến trúc Hybrid (Airflow 2: CeleryKubernetesExecutor / Airflow 3: Multi-Executor)
Đế giải quyết bài toán: *Làm sao vừa có Zero-latency của Celery cho 80% task nhẹ, vừa có Isolation của Kubernetes cho 20% task nặng (ML, Spark)?*

Airflow cung cấp tính năng định tuyến. Bạn cấu hình mặc định là Celery, và chỉ định tuyến các task đặc thù sang K8s bằng tham số `queue='kubernetes'`.

*Code ví dụ định tuyến Task AI/ML sang K8s Pod riêng (Cấp phát GPU):*
```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from kubernetes.client import models as k8s

def heavy_ml_training():
    # Training logic using TensorFlow
    pass

with DAG('hybrid_execution_dag') as dag:
    
    # Task nhẹ: Chạy mặc định trên Celery Worker tĩnh (Nhanh, không có cold-start)
    extract_data = PythonOperator(
        task_id='extract_data',
        python_callable=lambda: print("Light ELT task via Celery")
    )

    # Task nặng: Yêu cầu cô lập môi trường và cấu hình 1 GPU
    train_model = PythonOperator(
        task_id='train_model',
        python_callable=heavy_ml_training,
        queue='kubernetes', # 🚀 Định tuyến sang Kubernetes Executor
        executor_config={
            "pod_override": k8s.V1Pod(
                spec=k8s.V1PodSpec(
                    containers=[
                        k8s.V1Container(
                            name="base",
                            resources=k8s.V1ResourceRequirements(
                                limits={"nvidia.com/gpu": "1", "memory": "16Gi"}
                            )
                        )
                    ]
                )
            )
        }
    )
    
    extract_data >> train_model
```
*(Lưu ý: Bắt đầu từ Airflow 3, `CeleryKubernetesExecutor` được thay thế bằng khái niệm Multi-Executors native, cho phép khai báo nhiều executor trên cùng một cụm một cách linh hoạt hơn).*

---

## 5. Nguồn Tham Khảo (References)

* [Apache Airflow Core Concepts: Executors (Official Docs)](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/executor/index.html)
* [Astronomer: Evaluating Airflow Executors - Reliability vs Performance](https://www.astronomer.io/blog/airflow-executors-explained/)
* [Kubernetes OOMKilled (Exit Code 137) Troubleshooting](https://sysdig.com/blog/troubleshoot-kubernetes-oom/)
* [Airflow 3 Multi-Executor Architecture](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/executor/index.html#multiple-executors)
