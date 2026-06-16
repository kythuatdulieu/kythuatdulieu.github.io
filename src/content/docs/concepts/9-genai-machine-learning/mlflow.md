---
title: "Quản lý vòng đời Machine Learning với MLflow"
difficulty: "Intermediate"
tags: ["mlflow", "mlops", "model-registry", "experiment-tracking"]
readingTime: "10 mins"
lastUpdated: 2026-06-08
seoTitle: "MLflow là gì? Nền tảng quản lý MLOps và Model Lifecycle"
metaDescription: "Khám phá MLflow: công cụ mã nguồn mở hàng đầu cho MLOps. Tìm hiểu MLflow Tracking, Models, Model Registry và ứng dụng trong Data Engineering."
description: "Nếu bạn từng tham gia huấn luyện các mô hình Machine Learning, chắc hẳn bạn đã trải qua những tình huống 'dở khóc dở cười' này:"
---



Nếu bạn từng tham gia huấn luyện các mô hình Machine Learning, chắc hẳn bạn đã trải qua những tình huống 'dở khóc dở cười' này:
- *“Tham số nào đã cho ra kết quả tốt nhất vào tuần trước nhỉ?”*
- *“Mô hình chạy ngon trên máy mình, nhưng deploy lên server thì lỗi từa lưa!”*
- *“Ủa model version 3 khác gì version 2 vậy?”*
- *“Làm sao để biết model đang chạy trên production có thực sự tốt hơn model cũ không?”*

Đó là lúc bạn cần đến **MLflow**.

MLflow là nền tảng mã nguồn mở (được tạo bởi Databricks) dùng để quản lý toàn bộ vòng đời của Machine Learning (MLOps). Nó theo dõi các thông số chạy thử nghiệm (Tracking), lưu trữ mô hình (Model Registry), và đóng gói code để dễ dàng triển khai từ Laptop lên Production.

---

## 1. Kiến trúc tổng quan của MLflow

MLflow được thiết kế theo triết lý "API-first", cho phép tích hợp với hầu hết các thư viện Machine Learning phổ biến (Scikit-learn, TensorFlow, PyTorch, XGBoost...) và có thể chạy ở mọi môi trường từ máy cá nhân đến Cloud.

Một hệ thống MLflow tiêu chuẩn xoay quanh 4 thành phần chính (Components):
1. **MLflow Tracking**: Hệ thống ghi log các parameters, metrics, source code, và artifact (hình ảnh, file model) cho từng lần chạy thử nghiệm (run).
2. **MLflow Projects**: Đóng gói source code data science dưới một định dạng chuẩn (sử dụng Conda/Docker) để có thể chạy lại một cách thống nhất ở bất cứ đâu.
3. **MLflow Models**: Định dạng chuẩn hóa (flavor) để đóng gói các mô hình ML, giúp triển khai dễ dàng thông qua REST API hoặc batch inference trên Apache Spark.
4. **MLflow Model Registry**: Nơi lưu trữ và quản lý tập trung các phiên bản mô hình, bao gồm việc theo dõi trạng thái (Staging, Production, Archived).

---

## 2. Đi sâu vào các thành phần cốt lõi

### 2.1. MLflow Tracking

Tracking là thành phần được sử dụng nhiều nhất. Mỗi khi bạn train một mô hình, MLflow sẽ tạo ra một `Run`. Một run bao gồm:
- **Parameters**: Các tham số đầu vào dưới dạng Key-Value (vd: `learning_rate = 0.01`).
- **Metrics**: Các chỉ số đánh giá có thể thay đổi theo thời gian thực (vd: `loss`, `accuracy`).
- **Tags**: Các metadata giúp phân loại và tìm kiếm run (vd: `env = dev`, `author = duclinh`).
- **Artifacts**: File đầu ra ở bất kì định dạng nào (file `.pkl`, log file, biểu đồ phân tích).

**Cách hoạt động (Code Example):**
Ví dụ với một mô hình RandomForest cơ bản sử dụng thư viện `scikit-learn`:

```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
import pandas as pd

# Load data
data = pd.read_csv("data.csv")
X = data.drop(["target"], axis=1)
y = data["target"]
X_train, X_test, y_train, y_test = train_test_split(X, y)

# Khởi tạo MLflow Tracking
mlflow.set_tracking_uri("http://localhost:5000") # Cấu hình Tracking Server
mlflow.set_experiment("my_house_price_prediction")

with mlflow.start_run(run_name="RandomForest_Base"):
    n_estimators = 100
    max_depth = 5
    
    # 1. Log Parameters
    mlflow.log_param("n_estimators", n_estimators)
    mlflow.log_param("max_depth", max_depth)
    
    # Huấn luyện mô hình
    rf = RandomForestRegressor(n_estimators=n_estimators, max_depth=max_depth)
    rf.fit(X_train, y_train)
    
    # Đánh giá
    predictions = rf.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    
    # 2. Log Metrics
    mlflow.log_metric("mse", mse)
    
    # 3. Log Model (Tạo Artifacts)
    mlflow.sklearn.log_model(rf, "random_forest_model")
```

> [!TIP]
> **MLflow Autologging**: Thay vì gọi `mlflow.log_param()` một cách thủ công cho từng tham số, MLflow cung cấp tính năng **autolog()** cực kì hữu ích cho các framework phổ biến:
> ```python
> import mlflow.xgboost
> mlflow.xgboost.autolog() # Tự động log toàn bộ hyperparameter và metrics!
> ```

---

### 2.2. MLflow Models

Thành phần này giải quyết bài toán khó nhất của MLOps: **Đóng gói mô hình như thế nào để team Software Engineering có thể sử dụng mà không cần hiểu về code Machine Learning?**

Mỗi model được log lên MLflow sẽ đi kèm một file `MLmodel` chứa định nghĩa (flavor).
Ví dụ nội dung file `MLmodel`:

```yaml
artifact_path: random_forest_model
flavors:
  python_function: # Flavor dùng để chạy Python chung
    env: conda.yaml
    loader_module: mlflow.sklearn
    model_path: model.pkl
    predict_fn: predict
    python_version: 3.9.12
  sklearn: # Flavor đặc thù của scikit-learn
    pickled_model: model.pkl
    sklearn_version: 1.0.2
    serialization_format: cloudpickle
```

Cách phục vụ mô hình thông qua API rất đơn giản bằng CLI của mlflow:
```bash
# Phục vụ mô hình bằng REST API ở port 5002
mlflow models serve -m "runs:/<RUN_ID>/random_forest_model" -p 5002
```

---

### 2.3. MLflow Model Registry

Đây là kho quản lý vòng đời trung tâm. Khi một mô hình được đánh giá tốt ở môi trường thử nghiệm, bạn sẽ đăng ký nó vào Model Registry để bắt đầu quá trình quản lý version.

Các bước vòng đời thông thường:
`None -> Staging -> Production -> Archived`

**Code Example cho Model Registry:**
```python
import mlflow

# 1. Đăng ký một model từ một Run đã chạy
result = mlflow.register_model(
    "runs:/<RUN_ID>/random_forest_model",
    "HousePriceModel"
)

# 2. Chuyển trạng thái mô hình sang Production
client = mlflow.tracking.MlflowClient()
client.transition_model_version_stage(
    name="HousePriceModel",
    version=result.version,
    stage="Production"
)
```

Tại application logic (Backend API), kỹ sư phần mềm sẽ luôn trỏ lấy version đang ở "Production" để dự đoán mà không cần phải thay đổi code khi có mô hình mới:
```python
import mlflow.pyfunc

# Luôn fetch mô hình đang ở Production state
model_production_uri = "models:/HousePriceModel/Production"
loaded_model = mlflow.pyfunc.load_model(model_production_uri)

# Thực thi inference
predictions = loaded_model.predict(new_data)
```

---

## 3. Setup MLflow Tracking Server trong môi trường thực tế

Để ứng dụng MLflow vào một dự án thực tế với nhiều team data, bạn không thể sử dụng file system local (`localhost`). Cần triển khai một Tracking Server có chia 2 luồng rõ rệt:

1. **Backend Store:** Lưu metadata (Parameters, Metrics, Tags). Thường dùng Relational Database như MySQL hoặc PostgreSQL.
2. **Artifact Store:** Lưu file models/images/datasets. Thường dùng Object Storage như AWS S3, Google Cloud Storage, hoặc MinIO.

> [!NOTE]
> MLflow chỉ lưu tham chiếu đến Artifact Store trên Backend Store. MLflow Client sẽ nói chuyện với Backend Store để lấy URI, sau đó trực tiếp đẩy file model lên Artifact Store.

### Cách khởi chạy MLflow Tracking Server

```bash
mlflow server \
    --backend-store-uri postgresql://user:password@db_host:5432/mlflow_db \
    --default-artifact-root s3://my-mlflow-bucket/artifacts/ \
    --host 0.0.0.0 \
    --port 5000
```

### Các edge cases và lưu ý thực tế (Best Practices):

* **Bảo mật (Authentication & Authorization):** MLflow phiên bản mã nguồn mở thông thường không có sẵn phân quyền chặt chẽ. Đa phần các tổ chức sẽ đặt Tracking server sau một Reverse Proxy (ví dụ Nginx) có hỗ trợ HTTP Basic Auth, LDAP hoặc tích hợp OAuth2.
* **Kích thước Artifacts quá lớn:** Việc ghi lại data mỗi lần training có thể khiến dung lượng lưu trữ phình to nhanh chóng và tốn kém chi phí. Nên tránh việc tự động ghi các artifacts lớn (như nguyên bộ dataset) và chỉ nên lưu đường dẫn (URI/ID) tới dataset đó, hoặc kết hợp các công cụ chuyên dụng như DVC (Data Version Control) với MLflow.
* **Xử lý định dạng dữ liệu trong Production:** Khi phục vụ mô hình dạng REST API (`mlflow models serve`), MLflow sẽ luôn mong muốn input format tương thích với cấu trúc của pandas DataFrame (đặc biệt khi dùng `mlflow.pyfunc`). Cần hết sức cẩn trọng khi JSON request có dạng đa lớp (nested). Lúc này cần viết `Custom PyFunc model` để tự parse JSON theo format riêng của bạn trước khi đưa vào hàm `predict`.
* **Dọn dẹp tự động (Garbage Collection):** MLflow không tự xóa các thí nghiệm đã bị bỏ đi (deleted runs). Cần thiết lập các cron job chạy `mlflow gc` để giải phóng dung lượng trên Backend và Artifact store theo chu kỳ.

---

## 4. Tổng Kết

**Ưu điểm:**
- Giao diện UI thân thiện, có khả năng visualize và so sánh (compare) nhiều runs cạnh nhau.
- Tương thích tốt với hầu như mọi ngôn ngữ và framework Data / ML (Python, R, Java, XGBoost, TensorFlow, PyTorch).
- Cơ chế quản lý Model Registry tuyệt vời, giúp luân chuyển staging và production một cách có kiểm soát.
- Triển khai độc lập với hạ tầng Cloud, ngăn chặn Vendor Lock-in (chỉ cần Docker và Database).

**Nhược điểm:**
- Không phải là công cụ CI/CD hay Data Orchestration, không tự động quản lý workflow hay data pipeline. Bạn cần kết hợp với Airflow, Prefect, hoặc Kubeflow để tự động hóa toàn bộ luồng huấn luyện.
- Cơ chế Role-Based Access Control (RBAC) ở bản open-source còn hạn chế so với bản Managed MLflow của Databricks.

MLflow giúp chuyển biến tư duy làm việc với Machine Learning từ việc "*Gõ lệnh trong Jupyter notebook một cách tùy hứng*" sang "*Xây dựng luồng kỹ thuật phần mềm có kiểm soát*". Đây được xem là một kỹ năng thiết yếu dành cho Data Scientist và Machine Learning Engineer để đưa mô hình ra thế giới thực.

---

## Tài Liệu Tham Khảo

* [MLflow Official Documentation](https://mlflow.org/docs/latest/index.html)
* [The Databricks Blog: Managed MLflow](https://www.databricks.com/product/managed-mlflow)
* [MLOps Principles - ml-ops.org](https://ml-ops.org/)
* [Designing Data-Intensive Applications - Martin Kleppmann (Part 2: Distributed Data)](https://dataintensive.net/)
* [Time, Clocks, and the Ordering of Events in a Distributed System - Leslie Lamport](https://lamport.azurewebsites.net/pubs/time-clocks.pdf)
