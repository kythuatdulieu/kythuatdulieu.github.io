---
title: "Celery vs K8s Executor: Kiến trúc và Đánh đổi Hệ thống"
difficulty: "Advanced"
tags: ["airflow", "celery", "kubernetes", "executor", "finops", "architecture", "data-engineering"]
readingTime: "25 mins"
lastUpdated: 2026-06-29
seoTitle: "Airflow Executors: So sánh Celery vs Kubernetes (K8s) & Tối ưu FinOps"
metaDescription: "Phân tích sâu kiến trúc vật lý, rủi ro OOMKilled, độ trễ khởi động, và tối ưu chi phí (FinOps) giữa Celery Executor và Kubernetes Executor trong Airflow."
description: "Sự khác biệt cốt lõi giữa kiến trúc tĩnh của Celery và kiến trúc động (Ephemeral) của Kubernetes. Cách giải quyết bài toán OOM Blast Radius và K8s API Overload."
---

Apache Airflow không trực tiếp thực thi mã nguồn. Nó là bộ não điều phối trung tâm (Control Plane) chịu trách nhiệm theo dõi và ném việc cho các **Executors** (Data Plane). Khi hệ thống mở rộng lên hàng nghìn DAGs mỗi ngày, quyết định chọn Executor sai lầm không chỉ làm phình to hóa đơn Cloud (FinOps) mà còn gây ra những đợt sập hệ thống (System Outages) vô cùng đau đớn.

Trong thế giới Data Engineering, cuộc đối đầu kinh điển nhất luôn diễn ra giữa kiến trúc tĩnh của **Celery Executor** và kiến trúc động của **Kubernetes (K8s) Executor**.

---

## 1. Kiến trúc Thực thi Vật lý (Physical Execution)

### 1.1. Celery Executor: Mô hình Long-Running Workers

Celery Executor áp dụng kiến trúc hàng đợi phân tán (Distributed Task Queue) truyền thống. Các "Worker" ở đây là những máy ảo (EC2/VM) hoặc Docker Container tĩnh được bật 24/7. Chúng luôn trong trạng thái "warm" (nóng) và liên tục lắng nghe từ một Message Broker trung gian để kéo (pull) task về làm.

```mermaid
flowchart LR
    Scheduler["Airflow Scheduler"] -- Push Task --> Broker[["Message Broker\n('Redis/RabbitMQ']]]
    Broker -- Pull Task --> Worker1["Celery Worker 1\n('Concurrency: 16')"]
    Broker -- Pull Task --> Worker2["Celery Worker 2\n('Concurrency: 16')"]
    
    Worker1 -- Write State --> DB[("Metadata DB\n(PostgreSQL)")]
    Worker2 -- Write State --> DB
    
    style Broker fill:#f9f,stroke:#333,stroke-width:2px
    style Worker1 fill:#bbf,stroke:#333,stroke-width:2px
    style Worker2 fill:#bbf,stroke:#333,stroke-width:2px
```

*Cấu hình `airflow.cfg` kinh điển:*
```ini
[core]
executor = CeleryExecutor
parallelism = 1024

[celery]
# Bắt buộc phải có Broker (Redis] và Result Backend (DB)
broker_url = redis://redis:6379/0
result_backend = db+postgresql://airflow:airflow@postgres/airflow
worker_concurrency = 16 
```

### 1.2. Kubernetes Executor: Mô hình Ephemeral Pod-per-Task

Sự bùng nổ của Cloud Native mang đến khái niệm K8s Executor. Ở đây, khái niệm "Worker tĩnh" bị xóa sổ hoàn toàn. Không có Queue trung gian. Thay vào đó, mỗi khi có task mới, Scheduler nói chuyện trực tiếp với **Kubernetes API Server**. K8s sẽ khởi tạo một Pod (Container) mới tinh. Task chạy xong, Pod tự hủy (bốc hơi).

```mermaid
flowchart TD
    Scheduler["Airflow Scheduler"] -- Gọi API ('Create Pod') --> K8sAPI["Kubernetes API Server"]
    K8sAPI -- Schedule --> Node1["K8s Worker Node"]
    
    subgraph Node1
        Pod1["Task A Pod\n('Image: spark-env')"]
        Pod2["Task B Pod\n('Image: tf-gpu-env')"]
    end
    
    Pod1 -- Write State --> DB[("Metadata DB")]
    Pod2 -- Write State --> DB
    
    style K8sAPI fill:#f96,stroke:#333,stroke-width:2px
    style Pod1 fill:#bfb,stroke:#333,stroke-width:1px
    style Pod2 fill:#bfb,stroke:#333,stroke-width:1px
```

---

## 2. Phân tích Đánh đổi Hệ thống (Systemic Trade-offs)

Tùy thuộc vào đặc tính Workload, Staff Data Engineer phải cân bằng giữa 3 yếu tố: **Độ trễ (Latency)**, **Độ cô lập (Isolation)** và **Chi phí (FinOps)**.

| Đặc tính Kỹ thuật | Celery Executor (Static Workers) |" Kubernetes Executor (Ephemeral Pods) "|
| :--- | :--- | :--- |
|" **Độ trễ khởi động (Spin-up Latency)** "| **0 giây (Zero-latency).** Worker đã nạp sẵn RAM, task vào là chạy ngay. |" **Trễ cao (10s - 60s).** Đợi K8s API -> Schedule Node -> Pull Image -> Init Container. "|
|" **Cô lập môi trường (Environment Isolation)** "| **Kém (Dependency Hell).** 16 task trên cùng 1 Worker phải dùng chung tệp `requirements.txt`. |" **Tuyệt đối (Nirvana).** Mỗi task dùng một Docker Image khác biệt, độc lập hoàn toàn. "|
|" **Chi phí nhàn rỗi (FinOps Idle Cost)** "| **Cao.** Dù không có task, bạn vẫn phải nuôi Worker 24/7 (hoặc dựa dẫm vào KEDA nhưng vẫn chậm chạp). | **Zero.** Tính năng True Scale-to-Zero. Chỉ trả tiền cho CPU/RAM trong đúng số giây chạy Pod. |
| **Overhead vận hành** | Quản lý thêm thành phần ngoài (Redis/RabbitMQ) gây SPOF. | Lệ thuộc sức chịu tải của K8s Control Plane. Cần team SRE cứng. |

---

## 3. Rủi ro Vận hành và Sự cố (Real-world Incidents)

Lý thuyết là một chuyện, vận hành trên production lại là chuyện khác. Dưới đây là 2 thảm họa kinh điển.

### 3.1. Thảm họa OOMKilled "Chết Chùm" (Celery Blast Radius)
* **Tình huống:** Worker của bạn có 16GB RAM, được cấu hình `worker_concurrency = 16`. 15 task đầu tiên đang chạy ổn định (mỗi task ngốn 500MB). Đột nhiên, một Data Scientist kích hoạt task thứ 16, dùng Pandas đọc một tệp 10GB vào RAM.
* **Hệ quả:** Tiến trình ngốn cạn RAM. HĐH Linux kích hoạt `OOM Killer` (Out Of Memory) và giết ngay tiến trình Worker vật lý.
* **Blast Radius (Bán kính sát thương):** Toàn bộ 15 task chạy hoàn toàn hợp lệ kia cũng "chết chùm" oan uổng. Hệ thống chìm trong biển log lỗi.
* **Khắc phục:** 
  - K8s Executor xử lý triệt để OOM Blast Radius: OOM của một Pod bị giới hạn ở đúng Pod đó (do `resources.limits.memory`), 15 Pods khác vẫn sống khỏe.

### 3.2. DDoS vào Kubernetes Control Plane (K8s API Overload)
* **Tình huống:** Chạy Backfill lại dữ liệu 2 năm cho một DAG gồm 50 tasks cực nhẹ (chỉ tốn 1 giây để chạy câu lệnh báo cáo `SELECT COUNT`). Tổng cộng 36.500 tasks.
* **Hệ quả:** Scheduler Airflow đồng loạt xả 36.500 lệnh `Create Pod` vào K8s API Server. ETCD Database của Kubernetes phình to, cạn kiệt RAM (Memory Pressure). Toàn bộ cluster (không chỉ Airflow mà các Web App khác) bị sập. Tệ hơn, task mất 1 giây để chạy nhưng tốn 15 giây để tạo Pod $\rightarrow$ Lãng phí 1500% thời gian vô ích.
* **Khắc phục:** Dùng Celery cho các task nhỏ chạy cực nhanh, K8s chỉ dành cho batch processing hạng nặng.

---

## 4. Kiến trúc Hybrid (Airflow Multi-Executor)

Giải pháp tối thượng trong Data Engineering: **Làm sao vừa có Zero-latency của Celery cho 80% task nhẹ, vừa có sự cô lập tuyệt đối của K8s cho 20% task nặng (Spark/AI)?**

Airflow giới thiệu kiến trúc **Định tuyến (Routing/Multi-Executor)**. Bạn thiết lập mặc định hệ thống chạy bằng Celery. Đối với các Operator nặng, bạn cấu hình `queue` hoặc chỉ định thẳng sang K8s Executor.

*Code thực chiến: Phân luồng Task AI sang Pod K8s có GPU:*
```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from kubernetes.client import models as k8s
from datetime import datetime

def heavy_ml_training():
    # Logic huấn luyện mô hình TensorFlow
    pass

with DAG('hybrid_execution_finops', start_date=datetime(2023,1,1), schedule_interval='@daily') as dag:
    
    # 1. Task siêu nhẹ: Định tuyến mặc định chạy trên Celery Worker tĩnh
    extract_task = PythonOperator(
        task_id='extract_fast_data',
        python_callable=lambda: print("Đã lấy data xong trong 0.1s")
    )

    # 2. Task siêu nặng: Ép chạy trên một Pod K8s riêng biệt với 1 GPU
    train_model = PythonOperator(
        task_id='train_model',
        python_callable=heavy_ml_training,
        queue='kubernetes', # Định tuyến thoát khỏi luồng Celery!
        executor_config={
            "pod_override": k8s.V1Pod(
                spec=k8s.V1PodSpec(
                    containers=[
                        k8s.V1Container(
                            name="base",
                            resources=k8s.V1ResourceRequirements(
                                requests={"cpu": "4", "memory": "16Gi"},
                                limits={"nvidia.com/gpu": "1"} # Yêu cầu 1 GPU vật lý
                            )
                        )
                    ]
                )
            )
        }
    )
    
    extract_task >> train_model
```

Kiến trúc Hybrid là biểu hiện rõ ràng nhất của tư duy FinOps: Không lãng phí Worker nhàn rỗi cấu hình "khủng", nhưng cũng không bắt hệ thống phải sinh Pod chậm chạp cho các task quá nhỏ bé.

## Nguồn Tham Khảo [References]
* [Apache Airflow Core Concepts: Executors (Official Docs]][https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/executor/index.html]
* [Astronomer: Evaluating Airflow Executors - Reliability vs Performance][https://www.astronomer.io/blog/airflow-executors-explained/]
* [Kubernetes OOMKilled (Exit Code 137] Troubleshooting][https://sysdig.com/blog/troubleshoot-kubernetes-oom/]
* [Airflow 3 Multi-Executor Architecture](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/executor/index.html#multiple-executors]
