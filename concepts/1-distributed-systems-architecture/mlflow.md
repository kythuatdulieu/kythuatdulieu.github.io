---
title: "Quản lý vòng đời Machine Learning với MLflow"
difficulty: "Intermediate"
tags: ["mlflow", "mlops", "model-registry", "experiment-tracking", "llmops"]
readingTime: "25 mins"
lastUpdated: 2026-06-16
seoTitle: "MLflow là gì? Nền tảng quản lý MLOps, Model Lifecycle và LLMOps"
metaDescription: "Khám phá MLflow toàn tập: công cụ mã nguồn mở hàng đầu cho MLOps. Tìm hiểu Tracking, Projects, Models, Model Registry, Custom PyFunc, và ứng dụng trong LLMOps."
description: "Hướng dẫn toàn diện về MLflow, từ việc theo dõi các thử nghiệm cơ bản, đóng gói mô hình, quản lý vòng đời, đến triển khai hệ thống MLflow phân tán và LLMOps trong môi trường Production."
---

Nếu bạn từng tham gia huấn luyện các mô hình Machine Learning, chắc hẳn bạn đã trải qua những tình huống "dở khóc dở cười" này:
- *“Tham số nào đã cho ra kết quả tốt nhất vào tuần trước nhỉ?”*
- *“Mô hình chạy ngon trên máy mình, nhưng deploy lên server thì lỗi từa lưa do thiếu thư viện!”*
- *“Ủa model version 3 khác gì version 2 vậy? Ai là người đã train nó?”*
- *“Làm sao để biết model đang chạy trên production có thực sự tốt hơn model cũ không?”*
- *“Chúng ta đang dùng prompt nào để gọi API OpenAI và kết quả đánh giá (evaluation) ra sao?”*

Đó là lúc bạn cần đến **MLflow**.

Được phát triển bởi Databricks và mã nguồn mở dưới sự quản lý của Linux Foundation, MLflow đã trở thành tiêu chuẩn công nghiệp (de-facto standard) cho việc quản lý vòng đời Machine Learning. Nó không chỉ giải quyết bài toán của MLOps truyền thống mà trong các phiên bản mới (MLflow 2.x), nó còn mở rộng mạnh mẽ sang **LLMOps** (Large Language Model Operations).

---

## 1. Kiến trúc tổng quan của MLflow

MLflow được thiết kế theo triết lý **"API-first"** và **"Agnostic"** (không phụ thuộc vào nền tảng cụ thể). Bạn có thể sử dụng MLflow với bất kỳ thư viện Machine Learning nào (Scikit-learn, TensorFlow, PyTorch, XGBoost, Hugging Face...) và trên mọi môi trường (Laptop, On-premise servers, AWS, GCP, Azure).

Một hệ thống MLflow tiêu chuẩn xoay quanh 4 thành phần cốt lõi (Components) và các tính năng mở rộng:

1. **MLflow Tracking**: Hệ thống theo dõi và ghi nhận (log) các thông số, số liệu (metrics), mã nguồn, và artifact (hình ảnh, file model) cho từng lần chạy thử nghiệm (run).
2. **MLflow Projects**: Tiêu chuẩn đóng gói mã nguồn Data Science (sử dụng Conda/Docker) để có thể tái tạo (reproduce) và chạy lại một cách thống nhất ở bất cứ đâu.
3. **MLflow Models**: Định dạng chuẩn hóa (flavor) để đóng gói các mô hình ML, cho phép các hệ thống downstream (REST API, batch inference trên Apache Spark, BentoML) sử dụng mà không cần biết cách mô hình được train.
4. **MLflow Model Registry**: Nơi lưu trữ và quản lý tập trung các phiên bản mô hình, theo dõi vòng đời của chúng từ giai đoạn Staging, Production cho đến khi bị Archived.
5. **MLflow AI Gateway / LLM Tracking** *(Mới trong MLflow 2.x)*: Quản lý các kết nối tới LLM Providers (OpenAI, Anthropic), quản lý prompt, và đánh giá (evaluate) các mô hình ngôn ngữ lớn.

---

## 2. Đi sâu vào các thành phần cốt lõi

### 2.1. MLflow Tracking: Trái tim của quá trình thử nghiệm

Tracking là thành phần được sử dụng nhiều nhất. Mỗi khi bạn chạy một đoạn script để train mô hình, MLflow sẽ tạo ra một `Run` nằm trong một `Experiment`. Một Run bao gồm:

- **Parameters**: Các tham số đầu vào cố định (ví dụ: `learning_rate = 0.01`, `batch_size = 32`).
- **Metrics**: Các chỉ số đánh giá động có thể thay đổi trong quá trình train (ví dụ: `train_loss`, `val_accuracy` log theo từng epoch).
- **Tags**: Metadata giúp phân loại, tìm kiếm và thêm ngữ cảnh (ví dụ: `env = dev`, `data_version = v1.2`).
- **Artifacts**: Bất kỳ file đầu ra nào (file `.pkl`, file trọng số `.h5`, biểu đồ ROC curve `.png`, file log hệ thống).

#### Code Example Cơ Bản
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

# Cấu hình Tracking Server (thường là URL của máy chủ trung tâm)
mlflow.set_tracking_uri("http://localhost:5000") 
mlflow.set_experiment("my_house_price_prediction")

# Bắt đầu một Run mới
with mlflow.start_run(run_name="RandomForest_Base"):
    n_estimators = 100
    max_depth = 5
    
    # 1. Log Parameters
    mlflow.log_params({"n_estimators": n_estimators, "max_depth": max_depth})
    
    # Huấn luyện mô hình
    rf = RandomForestRegressor(n_estimators=n_estimators, max_depth=max_depth)
    rf.fit(X_train, y_train)
    
    # Đánh giá
    predictions = rf.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    
    # 2. Log Metrics
    mlflow.log_metric("mse", mse)
    
    # Thêm tag cho run này
    mlflow.set_tag("team", "data-science-alpha")
    
    # 3. Log Model (Lưu Artifacts)
    mlflow.sklearn.log_model(rf, "random_forest_model")
```

> [!TIP]
> **MLflow Autologging**: Thay vì gọi `mlflow.log_param()` thủ công cho hàng tá tham số, MLflow cung cấp tính năng **autolog()** cực kì mạnh mẽ cho hầu hết framework (TensorFlow, Keras, PyTorch, XGBoost, LightGBM...).
> ```python
> import mlflow.xgboost
> mlflow.xgboost.autolog() # Tự động log hyperparameters, metrics, feature importance và mô hình!
> ```

#### Nested Runs (Chạy thử nghiệm lồng nhau)
Trong các bài toán Grid Search hoặc Hyperparameter Tuning (như dùng Optuna), bạn sẽ muốn nhóm các Runs lại với nhau để dễ bề quản lý. MLflow hỗ trợ Nested Runs:

```python
with mlflow.start_run(run_name="Hyperparameter_Search") as parent_run:
    for lr in [0.01, 0.05, 0.1]:
        with mlflow.start_run(run_name=f"lr_{lr}", nested=True) as child_run:
            # Code train model ở đây
            mlflow.log_param("learning_rate", lr)
```
Giao diện UI của MLflow sẽ hiển thị cấu trúc cây (tree structure) cho phép gập/mở các parent runs rất tiện lợi.

---

### 2.2. MLflow Projects: Đóng gói và Tái tạo

Một trong những vấn đề lớn nhất của Data Science là *"Mã nguồn này chạy được trên máy tôi nhưng lại lỗi ở máy bạn"*. MLflow Projects chuẩn hóa cách định nghĩa môi trường và lệnh thực thi.

Một MLflow Project chỉ là một thư mục chứa mã nguồn và một file `MLproject` (dạng YAML):

```yaml
name: House_Price_Prediction

# Môi trường chạy
conda_env: conda.yaml
# Hoặc dùng docker: 
# docker_env:
#   image: my-docker-image:latest

entry_points:
  main:
    parameters:
      data_file: {type: string, default: "data.csv"}
      max_depth: {type: int, default: 5}
    command: "python train.py --data_file {data_file} --max_depth {max_depth}"
```

Để chạy project này từ bất kỳ đâu (kể cả trực tiếp từ một Git repository):
```bash
mlflow run git@github.com:my-org/my-repo.git -v version_hash -P max_depth=10
```
MLflow sẽ tự động clone repo, tải môi trường Conda/Docker theo đúng cấu hình và thực thi lệnh.

---

### 2.3. MLflow Models: Tiêu chuẩn hóa định dạng Mô hình

Đây là thành phần giải quyết "nút thắt cổ chai" giữa team Data Science và team Software/Data Engineering: **Đóng gói mô hình như thế nào để phục vụ (serve) ở bất kì đâu?**

Khái niệm cốt lõi ở đây là **Flavors** (hương vị). Một mô hình lưu bằng MLflow có thể được xem dưới nhiều "góc độ" khác nhau. MLflow tự động sinh ra một thư mục artifact chứa file cấu hình `MLmodel`.

Ví dụ nội dung file `MLmodel`:
```yaml
artifact_path: model
flavors:
  python_function: # Flavor chung dùng để chạy bất kì code Python nào (PyFunc)
    env: conda.yaml
    loader_module: mlflow.sklearn
    model_path: model.pkl
    predict_fn: predict
    python_version: 3.9.12
  sklearn: # Flavor đặc thù của scikit-learn
    pickled_model: model.pkl
    sklearn_version: 1.0.2
    serialization_format: cloudpickle
signature:
  inputs: '[{"name": "square_meters", "type": "double"}, {"name": "num_rooms", "type": "integer"}]'
  outputs: '[{"type": "tensor", "tensor-spec": {"dtype": "float64", "shape": [-1]}}]'
```

#### Model Signatures và Input Examples
Bạn để ý trường `signature` ở YAML trên. **Model Signature** khai báo rõ schema của dữ liệu đầu vào và đầu ra. Điều này vô cùng quan trọng để hệ thống serving (như REST API) có thể tự động validate dữ liệu, bắt lỗi ngay từ cửa ngõ nếu client gửi sai kiểu dữ liệu (ví dụ: gửi `string` thay vì `double`).

```python
from mlflow.models.signature import infer_signature

# Tự động suy luận schema từ Pandas DataFrame
signature = infer_signature(X_train, rf.predict(X_train))

mlflow.sklearn.log_model(
    rf, 
    "random_forest_model", 
    signature=signature,
    input_example=X_train.head(3) # Cung cấp ví dụ để tự động sinh Swagger UI / tài liệu API
)
```

#### Custom PyFunc Models (Rất quan trọng trong thực tế)
Không phải lúc nào mô hình cũng lấy dữ liệu thuần túy (raw). Thông thường bạn cần tiền xử lý (nhân chia, parse JSON, gọi API bên thứ 3) trước khi đưa dữ liệu vào thuật toán. MLflow giải quyết vấn đề này qua `Custom PyFunc`:

```python
import mlflow.pyfunc

class CustomPredictLogic(mlflow.pyfunc.PythonModel):
    def load_context(self, context):
        # Hàm chạy 1 lần khi load model (load từ file, khởi tạo biến môi trường)
        import pickle
        with open(context.artifacts["preprocessing_pipeline"], "rb") as f:
            self.preprocessor = pickle.load(f)
            
    def predict(self, context, model_input):
        # Tiền xử lý
        processed_data = self.preprocessor.transform(model_input)
        # Tự tính toán logic hoặc gọi mô hình khác
        return [x * 2.5 for x in processed_data] # Trả về list/array/dataframe

# Lưu Custom Model
mlflow.pyfunc.log_model(
    artifact_path="my_custom_model",
    python_model=CustomPredictLogic(),
    artifacts={"preprocessing_pipeline": "path/to/pipeline.pkl"}
)
```

Để phục vụ mô hình này dưới dạng REST API, bạn chỉ cần gõ lệnh:
```bash
mlflow models serve -m "runs:/<RUN_ID>/my_custom_model" -p 5002
```

---

### 2.4. MLflow Model Registry: Quản lý vòng đời trung tâm

Khi có hàng nghìn Runs, làm sao để biết cái nào đang được dùng trên Production? Model Registry là kho lưu trữ trung tâm có giao diện quản lý phiên bản (version control).

Các kỹ sư có thể gán nhãn trạng thái (Stage) hoặc bí danh (Alias) cho từng version. Kể từ MLflow 2.x, Databricks khuyến nghị chuyển từ **Stages (Staging/Production)** sang **Aliases (như `@champion`, `@challenger`)** để linh hoạt hơn.

**Đăng ký và quản lý bằng Python API:**
```python
import mlflow
from mlflow.tracking import MlflowClient

# 1. Đăng ký một model từ một Run đã chạy
result = mlflow.register_model("runs:/<RUN_ID>/model", "HousePriceModel")

client = MlflowClient()

# 2. Gán Alias (MLflow >= 2.4.0)
client.set_registered_model_alias(
    name="HousePriceModel", 
    alias="champion", 
    version=result.version
)
```

Tại Application Logic (Backend Node.js, Python FastAPI, Java), lập trình viên sẽ luôn tải mô hình bằng Alias thay vì hardcode version:
```python
import mlflow.pyfunc

# Luôn fetch mô hình đang mang danh hiệu "champion"
model_uri = "models:/HousePriceModel@champion"
loaded_model = mlflow.pyfunc.load_model(model_uri)

predictions = loaded_model.predict(new_data)
```
Khi Data Scientist train xong một mô hình tốt hơn, họ chỉ cần trỏ thẻ `@champion` sang version mới. Hệ thống Backend sẽ tự động (nếu có cơ chế reload) hoặc sau khi restart sẽ dùng mô hình mới mà **không cần sửa một dòng code nào của Backend**.

---

### 2.5. LLMOps với MLflow (MLflow 2.x)

Sự bùng nổ của GenAI đã buộc MLflow tiến hóa. Không chỉ là log MSE hay Accuracy, MLflow giờ đây hỗ trợ theo dõi Prompt, nhiệt độ (temperature), chuỗi hội thoại và đánh giá câu trả lời của mô hình ngôn ngữ.

* **Prompt Tracking**: Bạn có thể log toàn bộ nội dung prompt và kết quả trả về bằng flavor `mlflow.openai` hoặc `mlflow.langchain`.
* **MLflow Evaluate**: Khung đánh giá các kết quả của LLM. Có thể dùng chính LLM khác (LLM-as-a-Judge) để chấm điểm tính chính xác (relevance), mức độ độc hại (toxicity) hay độ trung thành (faithfulness) của kết quả.
* **MLflow Deployments / AI Gateway**: Đóng vai trò như một Proxy chuẩn hóa các API từ nhiều nhà cung cấp (OpenAI, Anthropic, Cohere, tự host LLama 3). Giúp ẩn các API Keys và chuẩn hóa định dạng request/response để khi thay đổi nhà cung cấp, ứng dụng không bị ảnh hưởng.

---

## 3. Kiến trúc triển khai MLflow Tracking Server trong môi trường thực tế

Sử dụng `localhost` và file system chỉ phù hợp cho cá nhân. Để một team gồm nhiều Data Scientists làm việc, chia sẻ kết quả, và tự động hóa qua CI/CD, bạn cần một **Distributed Tracking Server**.

Kiến trúc thực tế luôn tách biệt 2 luồng lưu trữ:
1. **Backend Store:** Lưu metadata (Parameters, Metrics, Tags). Yêu cầu truy vấn nhanh, thường dùng Cơ sở dữ liệu quan hệ (Relational Database) như MySQL, PostgreSQL, hoặc AWS RDS.
2. **Artifact Store:** Lưu file models, đồ thị, dataset. Yêu cầu dung lượng lớn, giá rẻ, thường dùng Object Storage như AWS S3, Google Cloud Storage (GCS), Azure Blob hoặc MinIO (On-premise).

> [!IMPORTANT]
> **Cơ chế hoạt động:** MLflow Server không trực tiếp truyền file artifact (trừ khi dùng proxy mode). MLflow Client (ví dụ máy tính của Data Scientist) sẽ gọi Server để lấy metadata và nhận về một URL/Token, sau đó **Client trực tiếp upload file lên Artifact Store (S3)**. Điều này giúp Tracking Server không bị nghẽn băng thông khi ghi các mô hình hàng chục GB.

### Câu lệnh khởi chạy Server kinh điển

```bash
mlflow server \
    --backend-store-uri postgresql://db_user:password@my-rds-db.aws.com:5432/mlflowdb \
    --default-artifact-root s3://my-mlflow-bucket/artifacts/ \
    --host 0.0.0.0 \
    --port 5000 \
    --workers 4
```

### Các Best Practices cho Production:

1. **Bảo mật (Authentication & Authorization):**
   - MLflow core không có hệ thống User/Password tích hợp sâu.
   - **Giải pháp:** Chạy MLflow Server phía sau một Reverse Proxy (như Nginx hoặc HAProxy). Cấu hình Nginx yêu cầu Basic Auth, OAuth2 (với GitHub/Google Workspace) hoặc LDAP. Chỉ những IP từ nội bộ mạng VPN công ty mới được truy cập.

2. **Artifact Proxy (Cho môi trường cấm Client truy cập Internet trực tiếp):**
   - Nếu Data Scientist nằm trong môi trường bảo mật cao, không có quyền push trực tiếp lên S3, hãy sử dụng cờ `--serve-artifacts` trên Server. Lúc này MLflow Server sẽ đóng vai trò trung gian, nhận file từ Client và tự đẩy lên S3. Tốn tài nguyên server hơn nhưng an toàn về mặt network.

3. **Garbage Collection (Dọn dẹp tự động):**
   - Xóa một Run trên giao diện web MLflow thực chất chỉ là gán cờ `deleted_time` (Soft Delete). Dữ liệu rác vẫn nằm trong Database và S3 gây tốn kém.
   - **Giải pháp:** Thiết lập một CronJob (Airflow/Kubernetes) định kỳ hàng tuần chạy lệnh `mlflow gc --backend-store-uri ...` để xóa vật lý (Hard Delete) toàn bộ các Runs đã bị đánh dấu.

4. **Tích hợp Webhooks (CI/CD Automation):**
   - Model Registry có hỗ trợ Webhooks. Bạn có thể cấu hình: *"Mỗi khi một mô hình được chuyển trạng thái sang Production, MLflow hãy bắn một HTTP POST (Webhook) đến Jenkins hoặc GitHub Actions"*. Hệ thống CI/CD sẽ nhận tín hiệu, tự động tải mô hình mới xuống, build thành Docker Image và deploy lên Kubernetes.

---

## 4. Tích hợp MLflow vào Hệ Sinh Thái MLOps

MLflow là một công cụ tuyệt vời, nhưng nó không phải là giải pháp "All-in-one" bao thầu toàn bộ vòng đời. Sự thực là, nó hoạt động tốt nhất khi đóng vai trò "Hub" và giao tiếp với các công cụ chuyên dụng khác:

* **Data Versioning (DVC + MLflow)**: MLflow không tối ưu để phiên bản hóa dữ liệu lớn. Hãy dùng DVC (Data Version Control) để lưu trữ dataset, lấy mã hash của dữ liệu và log mã hash đó vào thẻ `Tag` hoặc `Parameter` của MLflow.
* **Orchestration (Airflow/Prefect/Kubeflow + MLflow)**: Thay vì gõ code tay trên Jupyter, hãy viết DAG trên Airflow. Airflow sẽ lập lịch chạy pipeline: Lấy dữ liệu từ Data Warehouse -> Train model -> Log lên MLflow. Airflow điều phối luồng, MLflow ghi nhận kết quả.
* **Serving (BentoML/Seldon + MLflow)**: Công cụ `mlflow models serve` (dựa trên Flask/Gunicorn) phù hợp cho nội bộ hoặc lưu lượng nhỏ. Để scale lên mức hàng nghìn Request/s ở production, các tổ chức lớn thường lấy mô hình từ MLflow Registry và đóng gói bằng **BentoML** hoặc deploy qua **KServe/Seldon Core** trên Kubernetes để tận dụng Auto-scaling và GPU allocation.

---

## 5. So sánh với các công cụ phổ biến khác

| Tiêu chí | MLflow (Open-source) | Weights & Biases (W&B) | Kubeflow |
| :--- | :--- | :--- | :--- |
| **Trọng tâm chính** | Experiment Tracking & Model Registry | Đỉnh cao về Visualization và Experiment Tracking | Orchestration & Machine Learning Pipeline trên K8s |
| **Mức độ dễ cài đặt** | Dễ (Chỉ cần `pip install` và DB/S3) | Dễ (Managed SaaS, host trên Cloud của W&B) | Rất khó (Yêu cầu Kubernetes và kiến thức DevOps sâu) |
| **Model Registry** | Trưởng thành, rất mạnh và được chuẩn hóa cao | Có hỗ trợ Artifacts, nhưng không phải chuẩn MLOps thuần túy | Phụ thuộc vào các component bên thứ 3 (như MLflow/KServe) |
| **UI / Đồ thị** | Cơ bản, đủ dùng, tập trung vào so sánh parameter | Tuyệt đẹp, tương tác cao, tracking hệ thống GPU chi tiết | Rời rạc, sử dụng nhiều UI khác nhau (Katib, Pipelines) |
| **Giá cả** | Miễn phí 100% (Bạn trả tiền hạ tầng) | Dùng thử miễn phí, đắt đỏ cho team lớn | Miễn phí (Nhưng chi phí duy trì cụm K8s rất cao) |

---

## 6. Tổng Kết

MLflow đã tạo ra một cuộc cách mạng nhỏ gọn trong thế giới MLOps. Bằng cách thiết lập các tiêu chuẩn rõ ràng cho việc Tracking và Đóng gói (Packaging), nó giúp thu hẹp khoảng cách văn hóa giữa Data Scientists (những người làm nghiên cứu) và Software Engineers (những người vận hành hệ thống).

**Điểm mạnh:**
- Triết lý thiết kế agnostic, không ép buộc người dùng sử dụng một ngôn ngữ hay framework duy nhất.
- Ngăn chặn Vendor Lock-in (bạn có thể dọn toàn bộ database và S3 chuyển từ AWS sang Azure mà không mất dữ liệu lịch sử).
- Quản lý phiên bản mô hình (Registry) có tính ứng dụng thực tiễn rất cao.

**Hạn chế:**
- Phiên bản Open-source thiếu Role-Based Access Control (RBAC). (Databricks giữ lại tính năng này cho phiên bản Managed MLflow trả phí của họ).
- Không có sẵn hệ thống lập lịch tự động, phải kết hợp với Airflow/Jenkins.

Biết sử dụng MLflow giúp bạn chuyển đổi tư duy làm việc từ việc *"Gõ lệnh trong Jupyter notebook một cách tùy hứng, lưu model thành model_v1_final_final.pkl"* sang *"Xây dựng luồng kỹ thuật phần mềm có hệ thống và kiểm soát"*. Đây là một bước đệm bắt buộc để trở thành một Machine Learning Engineer thực thụ.

---

## Tài Liệu Tham Khảo

* [MLflow Official Documentation](https://mlflow.org/docs/latest/index.html)
* [Databricks: Managed MLflow & LLMOps](https://www.databricks.com/product/managed-mlflow)
* [MLOps Principles - ml-ops.org](https://ml-ops.org/)
* [Sách: Designing Machine Learning Systems (Chip Huyen)](https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/)
* [Hướng dẫn chạy MLflow trên AWS với S3 và RDS (Boto3)](https://aws.amazon.com/blogs/machine-learning/managing-your-machine-learning-lifecycle-with-mlflow-and-amazon-sagemaker/)
* [MLflow vs W&B Comparison](https://neptune.ai/blog/mlflow-vs-weights-and-biases)
