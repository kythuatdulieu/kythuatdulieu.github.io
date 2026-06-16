---
title: "Phục vụ mô hình (Model Serving)"
difficulty: "Intermediate"
tags: ["mlops", "model-serving", "inference", "vllm", "triton", "genai"]
readingTime: "20 mins"
lastUpdated: 2026-06-16
seoTitle: "Model Serving là gì? Cách triển khai mô hình AI/ML lên Production"
metaDescription: "Tìm hiểu kiến trúc Model Serving (Phục vụ mô hình) trong MLOps. Kiến thức chuyên sâu về Real-time, Batch Serving, Dynamic Batching và các công cụ như vLLM, Triton, Ray Serve."
description: "Sau khi dành nhiều tuần liền để xử lý dữ liệu và huấn luyện mô hình Machine Learning hay Generative AI, kết quả cuối cùng bạn thu được thường chỉ là các trọng số mô hình. Model Serving là quá trình biến chúng thành API phục vụ sản phẩm."
---



Model Serving (Phục vụ mô hình) là quá trình đóng gói một mô hình Machine Learning hoặc AI đã được huấn luyện xong thành một dịch vụ (thường là REST API hoặc gRPC) để các phần mềm khác có thể gọi vào và lấy dự đoán (Inference). Trong hệ thống phân tán, tốc độ phản hồi (Low Latency), thông lượng (High Throughput) và khả năng chịu tải cao (High Availability) là những yêu cầu cốt lõi.

Bài viết này sẽ đi sâu vào các chiến lược Model Serving, cơ chế tối ưu và các framework phổ biến như NVIDIA Triton, Ray Serve, hay vLLM trong thời đại Generative AI.

---

## 1. Các Chiến Lược Phục Vụ Mô Hình (Serving Strategies)



Dựa trên yêu cầu của ứng dụng, chúng ta có hai cách tiếp cận chính: **Real-time Serving** (Online) và **Batch Serving** (Offline).

### 1.1 Real-time Serving (Online Inference)

Mô hình hoạt động như một web service, lắng nghe các yêu cầu từ client và trả về dự đoán ngay lập tức. Phù hợp cho các ứng dụng tương tác người dùng như:
- Hệ thống gợi ý (Recommender Systems).
- Trợ lý ảo, Chatbot (LLMs).
- Phát hiện gian lận giao dịch (Fraud Detection).

**Ưu điểm:** Phản hồi tức thời (độ trễ từ vài mili-giây đến vài giây).
**Nhược điểm:** Đòi hỏi tài nguyên máy chủ luôn bật (always-on). Xử lý tải không ổn định rất tốn kém (spike traffic).

**Ví dụ mã giả (FastAPI + PyTorch):**

```python
from fastapi import FastAPI
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

app = FastAPI()

# Tải mô hình vào bộ nhớ khi khởi động ứng dụng
model_name = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

@app.post("/predict")
async def predict(text: str):
    inputs = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        logits = model(**inputs).logits
    predicted_class_id = logits.argmax().item()
    return {"class_id": predicted_class_id}
```

### 1.2 Batch Serving (Offline Inference)

Mô hình dự đoán trên một tập dữ liệu lớn định kỳ (ví dụ: mỗi đêm lúc 2h sáng). Kết quả thường được lưu trữ vào Data Warehouse, Feature Store hoặc Database để hệ thống khác tra cứu lại sau.

**Ứng dụng:** Chấm điểm tín dụng định kỳ, phân khúc khách hàng hàng tháng.

**Ưu điểm:** Khả năng tận dụng tối đa phần cứng (Throughput cao) do chạy các batch lớn. Tài nguyên có thể tắt đi khi hoàn tất (Tiết kiệm chi phí).
**Nhược điểm:** Không xử lý được dữ liệu tức thời.

---

## 2. Các Kỹ Thuật Tối Ưu Hóa (Optimization Techniques)

Khi đưa mô hình ra hệ thống phân tán (Production), mã FastAPI đơn giản sẽ gặp vấn đề về tài nguyên, đặc biệt khi dùng GPU.

### 2.1 Dynamic Batching (Batching Động)

GPU thường tính toán song song rất tốt. Việc chạy dự đoán từng request một sẽ gây lãng phí. Dynamic Batching là kỹ thuật gom nhóm nhiều requests riêng lẻ trong một khoảng thời gian cực nhỏ (ví dụ 10ms) để xử lý một lượt.

* **Cách hoạt động:** Khi có Request 1 đến, hệ thống đợi thêm `N` milliseconds xem có Request 2, 3 không. Nếu có, ghép chúng thành Tensor lớn `(Batch_Size=3)` đẩy vào GPU một lần.
* **Lợi ích:** Tăng thông lượng (throughput) gấp nhiều lần, chỉ hy sinh một chút độ trễ (latency).

### 2.2 Continuous Batching (Cho LLM)

Với các mô hình tạo văn bản (Large Language Models), quá trình sinh ra từng token là tuần tự. Việc batching truyền thống sẽ kém hiệu quả nếu độ dài đầu ra khác nhau (Request A cần 10 tokens, Request B cần 100 tokens).

**Continuous Batching** (hay Iteration-level Scheduling) cho phép chèn thêm request mới hoặc lấy request hoàn thành ra ở *bất kỳ bước tạo token nào*, không cần đợi toàn bộ batch kết thúc. Framework nổi tiếng như **vLLM** hay **Triton TensorRT-LLM** đang áp dụng rất thành công kỹ thuật này.

### 2.3 Model Quantization (Lượng tử hóa)

Chuyển đổi trọng số mô hình từ FP32 (dấu phẩy động 32-bit) sang FP16, INT8, hoặc INT4.
* Giảm bộ nhớ (RAM/VRAM) cần thiết để tải mô hình.
* Tốc độ tính toán nhanh hơn nhờ các chỉ thị phần cứng (Hardware instructions) tối ưu hóa số nguyên.

---

## 3. Kiến Trúc Hệ Thống & Frameworks Phổ Biến

Trong MLOps hiện đại, chúng ta ít tự viết lại Server từ đầu mà tận dụng các Framework chuyên dụng:

### 3.1 NVIDIA Triton Inference Server

Triton là một Model Server do NVIDIA phát triển. Nó hỗ trợ:
- **Multiple Frameworks:** TensorFlow, PyTorch, ONNX, TensorRT.
- **Dynamic Batching:** Tích hợp sẵn và dễ cấu hình.
- **Model Ensembling:** Kết nối đầu ra của mô hình này thành đầu vào của mô hình khác trực tiếp trong C++ để tránh nghẽn I/O.

### 3.2 Ray Serve

Được xây dựng trên nền tảng tính toán phân tán **Ray**. Ray Serve rất mạnh mẽ nếu bạn có logic inference phức tạp:
- Gọi nhiều mô hình song song (như A/B Testing).
- Tích hợp trực tiếp với mã Python (PyTorch/Scikit-learn).
- Dễ dàng mở rộng ngang (Horizontal Scaling) trên các cụm máy chủ.

### 3.3 vLLM (Generative AI Serving)

Với các LLMs (Llama 3, Mistral, GPT-4), vLLM hiện đang thống trị nhờ cơ chế **PagedAttention**.
- **PagedAttention:** Hoạt động giống quản lý bộ nhớ ảo trên Hệ Điều Hành, giúp giảm phân mảnh bộ nhớ của K-V Cache xuống gần như 0%.
- Giúp phục vụ LLM với lượng Request đồng thời cao hơn 2-4 lần so với các cách truyền thống (như Hugging Face Transformers).

---

## 4. Các Lưu Ý Về Edge Cases

- **Out Of Memory (OOM):** Lỗi kinh điển khi có lượng dữ liệu đến GPU quá lớn hoặc Memory leak. Cần có cấu hình *Max Batch Size* chặt chẽ và công cụ Monitor.
- **Cold Start:** Khởi động một cụm máy chạy LLM 70 Tỷ tham số có thể mất vài phút. Việc tự động mở rộng (Auto-scaling) cần dựa trên độ trễ trung bình thay vì đợi CPU lên 100%.
- **Model Drift:** Dữ liệu thực tế thay đổi khiến mô hình hết chính xác. Model Serving Server phải hỗ trợ Shadow Deployment (chạy ngầm mô hình mới cùng lúc với bản cũ để theo dõi kết quả).

---

## Tài Liệu Tham Khảo
* [NVIDIA Triton Inference Server Documentation](https://developer.nvidia.com/triton-inference-server)
* [vLLM: Easy, fast, and cheap LLM serving for everyone](https://github.com/vllm-project/vllm)
* [Ray Serve - Scalable Model Serving](https://docs.ray.io/en/latest/serve/index.html)
* **Designing Machine Learning Systems - Chip Huyen**
* [Designing Data-Intensive Applications - Martin Kleppmann (Part 2: Distributed Data)](https://dataintensive.net/)
