---
title: "Quản lý vòng đời Machine Learning với MLflow"
category: "Data Engineering / Machine Learning"
difficulty: "Intermediate"
tags: ["mlflow", "mlops", "model-registry", "experiment-tracking"]
readingTime: "10 mins"
lastUpdated: 2026-06-08
seoTitle: "MLflow là gì? Nền tảng quản lý MLOps và Model Lifecycle"
metaDescription: "Khám phá MLflow: công cụ mã nguồn mở hàng đầu cho MLOps. Tìm hiểu MLflow Tracking, Models, Model Registry và ứng dụng trong Data Engineering."
---

# MLflow

## Summary

MLflow là một nền tảng mã nguồn mở (open-source) được thiết kế để quản lý toàn bộ vòng đời của một dự án Học máy (Machine Learning Lifecycle). Nó giúp các Data Scientists và ML Engineers theo dõi các thử nghiệm (experiments), đóng gói code để có thể tái tạo lại (reproducibility), và quản lý, triển khai các mô hình (model deployment). MLflow đóng vai trò là "Git dành cho Machine Learning", là xương sống của mọi hệ thống MLOps hiện đại.

---

## Definition

Được phát triển ban đầu bởi Databricks, **MLflow** là một framework độc lập với các thư viện học máy (Framework-agnostic). Nghĩa là bạn có thể dùng nó với TensorFlow, PyTorch, Scikit-learn, hay thậm chí là các LLM (qua MLflow LLM Tracking) mà không gặp trở ngại nào.

MLflow bao gồm 4 thành phần (components) cốt lõi:
1. **MLflow Tracking**: Ghi lại và truy vấn các tham số (parameters), mã nguồn, chỉ số (metrics) và các tệp kết quả (artifacts) của từng lần chạy huấn luyện (run).
2. **MLflow Projects**: Đóng gói mã nguồn Data Science theo một định dạng chuẩn hóa (dùng Conda hoặc Docker) để có thể chạy lại chính xác trên bất kỳ máy tính nào.
3. **MLflow Models**: Một định dạng chuẩn để đóng gói các mô hình học máy, cho phép chúng dễ dàng được triển khai (deploy) lên các môi trường khác nhau (REST API, Batch Inference trên Apache Spark).
4. **Model Registry**: Một kho lưu trữ tập trung (như GitHub cho models) để quản lý phiên bản (versioning), vòng đời (Staging, Production, Archived) và các siêu dữ liệu của mô hình.

---

## Why it exists

Trước khi có MLflow (và các công cụ MLOps nói chung), việc huấn luyện Machine Learning diễn ra rất lộn xộn:
* **"Lost in parameters"**: Data Scientist huấn luyện 50 phiên bản mô hình với các tham số (Learning rate, Batch size) khác nhau. Đến cuối tuần, họ không nhớ mô hình tốt nhất đã được huấn luyện bằng tham số nào.
* **"It works on my machine"**: Mô hình chạy rất tốt trên laptop của người viết code nhưng khi đưa lên Server Production thì chết do lệch phiên bản thư viện (Dependency Hell).
* **Quản lý phiên bản thủ công**: Đặt tên file mô hình kiểu `model_v1_final_thatchu.pkl`, gây rủi ro cực lớn khi tích hợp vào phần mềm.

MLflow ra đời để tự động hóa, lưu vết và chuẩn hóa mọi bước trong quá trình này, biến việc huấn luyện ML từ "nghệ thuật thủ công" thành "quy trình công nghiệp phần mềm".

---

## Core idea

Ý tưởng lớn nhất của MLflow là **Centralized Tracking & Standardized Packaging (Lưu vết tập trung và Đóng gói chuẩn hóa)**.

Chỉ bằng cách chèn 2-3 dòng code vào script huấn luyện Python (ví dụ: `mlflow.autolog()`), toàn bộ quá trình chạy sẽ được gửi về một Server MLflow tập trung. Tại đây, mọi thành viên trong team có thể mở giao diện UI trên trình duyệt để so sánh biểu đồ Loss/Accuracy của hàng trăm lượt chạy (runs) khác nhau, và tải về trực tiếp file model (`.pkl`, `.h5`) của lượt chạy tốt nhất cùng file `requirements.txt` đi kèm nó.

---

## How it works

Quy trình sử dụng MLflow trong thực tế:

**1. Giai đoạn Huấn luyện (Tracking)**
```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestRegressor

# Tự động log toàn bộ tham số, metrics và model
mlflow.autolog()

with mlflow.start_run(run_name="Random_Forest_Experiment"):
    model = RandomForestRegressor(n_estimators=100, max_depth=5)
    model.fit(X_train, y_train)
    # Kết thúc block 'with', MLflow tự động lưu model và metrics lên server
```

**2. Giai đoạn Quản lý (Registry)**
* Kỹ sư mở UI MLflow, thấy lượt chạy `Random_Forest_Experiment` có độ chính xác cao nhất.
* Bấm nút "Register Model", đặt tên là `House_Pricing_Model` (Version 1).
* Chuyển trạng thái (Transition Stage) của Version 1 thành `Production`.

**3. Giai đoạn Triển khai (Deployment)**
Phần mềm Backend chỉ cần gọi API tới MLflow để tải về model đang ở trạng thái Production mới nhất mà không cần quan tâm nó là Version mấy hay file nằm ở đâu.

---

## Architecture / Flow

```mermaid
graph TD
    subgraph Data Scientist Environment
        A[Jupyter Notebook / Python Script] -->|mlflow.log_param()| B(MLflow Tracking Server)
        A -->|mlflow.log_metric()| B
        A -->|mlflow.log_model()| C[(Artifact Store: S3/GCS)]
    end

    subgraph Central MLflow Server
        B --> D[(Backend Store: PostgreSQL)]
        B --> E[MLflow UI]
        E --> F[Model Registry]
    end

    subgraph Deployment
        F -->|Fetch Production Model| G[REST API / Docker]
        C -->|Download Model Files| G
    end
```

---

## Best practices

* **Sử dụng Artifact Store dùng chung**: MLflow Tracking Server chỉ nên lưu metadata (param, metric) vào SQL Database (Backend Store). Các file mô hình nặng (Artifacts) phải được cấu hình để lưu trên Object Storage như AWS S3, Google Cloud Storage, hoặc MinIO.
* **Luôn dùng `mlflow.autolog()`**: Tận dụng tính năng autolog để tránh việc quên log các siêu tham số quan trọng. MLflow hỗ trợ autolog cho hầu hết thư viện (XGBoost, Keras, Scikit-learn).
* **Gắn Tags cho mọi thứ**: Sử dụng `mlflow.set_tag("dataset_version", "v2")` để dễ dàng lọc và tìm kiếm lại các thử nghiệm cũ trên UI.
* **Tích hợp với CI/CD**: Khi một model được chuyển trạng thái sang `Production` trong Model Registry, hãy kích hoạt (trigger) một Webhook để tự động chạy pipeline CI/CD build Docker image và deploy lên Kubernetes.

---

## Trade-offs

### Ưu điểm
* Rất dễ học và dễ cài đặt (có thể chạy local chỉ với lệnh `mlflow ui`).
* Tương thích với hầu hết mọi ngôn ngữ và framework (Python, R, Java).
* Cộng đồng khổng lồ, là tiêu chuẩn de-facto của ngành công nghiệp.

### Nhược điểm
* MLflow chỉ là công cụ "Track và Register", nó **KHÔNG** phải là một bộ lập lịch tự động chạy pipeline (như Airflow) hay công cụ xử lý dữ liệu.
* Tính năng bảo mật/phân quyền (RBAC) trên phiên bản mã nguồn mở khá sơ sài (bản thương mại trên Databricks thì rất tốt).

---

## When to use

* Bất kỳ dự án Machine Learning / Deep Learning nào có từ 2 thành viên trở lên.
* Khi bạn cần thử nghiệm hàng chục kiến trúc LLM/Prompts khác nhau (sử dụng tính năng MLflow LLM Evaluate).
* Khi cần một kho quản lý model phiên bản tập trung cho toàn doanh nghiệp.

## When not to use

* Nếu chỉ làm bài tập cá nhân, chạy 1-2 mô hình và không bao giờ đem lên production.
* Nếu dự án yêu cầu một hệ sinh thái MLOps End-to-End khép kín của riêng một Cloud Provider (ví dụ: đang dùng thuần túy AWS SageMaker Pipelines hoặc Google Vertex AI thì không bắt buộc phải cài thêm MLflow open-source).

---

## Related concepts

* MLOps (Machine Learning Operations)
* Model Registry
* [LLMOps](/concepts/llmops)

---

## Interview questions

### 1. Phân biệt Backend Store và Artifact Store trong kiến trúc MLflow.
* **Người phỏng vấn muốn kiểm tra**: Kiến thức thiết kế hệ thống (System Design) khi deploy MLflow lên môi trường Production.
* **Gợi ý trả lời (Strong Answer)**:
  * Backend Store là cơ sở dữ liệu quan hệ (thường là MySQL/PostgreSQL) dùng để lưu trữ các siêu dữ liệu nhẹ, có cấu trúc: Tên thí nghiệm, thông số tham số (parameters), điểm số metrics (để vẽ biểu đồ), và thông tin vòng đời mô hình.
  * Artifact Store là hệ thống lưu trữ file (ví dụ: AWS S3, Azure Blob, thư mục ổ cứng) dùng để lưu trữ các tệp vật lý nặng: file trọng số mô hình (`.pb`, `.pkl`), hình ảnh biểu đồ, thư viện pip. Việc tách bạch này giúp hệ thống truy vấn siêu dữ liệu nhanh chóng mà không bị nghẽn I/O bởi các tệp mô hình nặng hàng GB.

### 2. MLflow Model Registry giải quyết bài toán gì trong quy trình phát triển phần mềm?
* **Người phỏng vấn muốn kiểm tra**: Tư duy vận hành sản phẩm (Operations).
* **Gợi ý trả lời (Strong Answer)**:
  * Nó giải quyết bài toán quản trị trạng thái và giao tiếp giữa team Data (huấn luyện) và team Software (triển khai). 
  * Thay vì Data Scientist đưa file model cho Software Engineer qua Google Drive kèm theo lời dặn dò "dùng thư viện pandas bản này nhé", Model Registry cung cấp một API chuẩn mực. Software Engineer chỉ cần request tải mô hình đang có tag `alias="production"`, MLflow sẽ tự động cung cấp file mô hình cùng file môi trường (`conda.yaml`). Khi có mô hình mới tốt hơn, Data team chỉ cần cập nhật tag trên UI, hệ thống backend tự động pull model mới về mà không cần sửa code.

### 3. Bạn đã bao giờ sử dụng MLflow để tracking cho LLMs (Large Language Models) chưa? Khác gì so với ML truyền thống?
* **Người phỏng vấn muốn kiểm tra**: Mức độ cập nhật xu hướng GenAI/LLMOps.
* **Gợi ý trả lời (Strong Answer)**:
  * Trong ML truyền thống, ta track siêu tham số (learning rate) và Loss/Accuracy. 
  * Trong LLM Tracking (qua `mlflow.llm` hoặc `mlflow.evaluate`), thay vì lưu tham số mô hình, ta lưu vết **Prompt templates**, tham số suy luận (`temperature`, `top_p`), và kết quả đầu ra (Completion). Hơn nữa, MLflow tích hợp các metrics đánh giá LLM đặc thù (như tính độc hại - toxicity, độ chuẩn xác của câu trả lời - relevance) sử dụng kỹ thuật LLM-as-a-judge, giúp dễ dàng so sánh xem Prompt A hay Prompt B sinh ra câu trả lời tốt hơn trên cùng một tập dữ liệu test.

---

## English summary

MLflow is an open-source platform dedicated to managing the Machine Learning lifecycle (MLOps). It offers four primary components: Tracking (for logging parameters, metrics, and code versions), Projects (for standardizing code packaging), Models (for standardized model deployment), and Model Registry (for centralized versioning and lifecycle management). By decoupling metadata storage (Backend Store) from heavy file storage (Artifact Store), MLflow enables reproducible data science, seamless collaboration between data and engineering teams, and robust production deployments, making it the industry standard for both traditional ML and modern LLM operations.
