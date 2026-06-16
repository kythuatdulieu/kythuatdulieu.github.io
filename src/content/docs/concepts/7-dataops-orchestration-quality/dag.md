---
title: "DAG (Đồ thị có hướng không chu trình) trong Data Engineering"
difficulty: "Beginner"
tags: ["dag", "directed-acyclic-graph", "airflow", "pipeline", "orchestration"]
readingTime: "8 mins"
lastUpdated: 2026-06-16
seoTitle: "DAG là gì? Directed Acyclic Graph trong Data Pipeline"
metaDescription: "Đồ thị có hướng không chu trình (DAG) là gì? Lý do các công cụ Orchestration như Airflow, dbt, Spark sử dụng kiến trúc DAG để mô hình hóa Data Pipeline."
description: "Trong thế giới Kỹ thuật dữ liệu (Data Engineering), nếu có một khái niệm toán học được áp dụng rộng rãi nhất làm nền tảng cho việc vận hành luồng xử lý, đó chính là DAG."
---



DAG (Directed Acyclic Graph - Đồ thị có hướng không chu trình) là một khái niệm mượn từ lý thuyết đồ thị trong toán học, nhưng đã trở thành "xương sống" không thể thiếu trong hệ sinh thái Data Engineering, đặc biệt là trong lĩnh vực Data Orchestration (Điều phối dữ liệu). Trong các công cụ như Apache Airflow, Dagster, hay dbt, DAG định nghĩa chuỗi các Task (tác vụ) chạy theo một thứ tự nghiêm ngặt và tuyệt đối không bao giờ quay vòng thành vòng lặp vô tận.

## DAG là gì? Phân tích theo từng từ khóa



Hãy bẻ nhỏ cụm từ **Directed Acyclic Graph** để hiểu rõ bản chất của nó:

1. **Graph (Đồ thị):** 
   Một tập hợp gồm các **Nodes (Đỉnh/Nút)** và các **Edges (Cạnh)** nối chúng lại với nhau. Trong Data Pipeline, một Node đại diện cho một công việc cụ thể (ví dụ: Tải dữ liệu từ API, Chạy câu lệnh SQL, Gửi email báo cáo), và một Edge đại diện cho mối liên hệ giữa các công việc đó.

2. **Directed (Có hướng):**
   Các cạnh nối giữa các Node có một hướng rõ ràng (thường được biểu diễn bằng mũi tên). Nếu có một mũi tên từ Node A đến Node B (A $\rightarrow$ B), điều đó có nghĩa là **Node A phải hoàn thành trước khi Node B có thể bắt đầu**. Mũi tên này thiết lập thứ tự thực hiện và sự phụ thuộc dữ liệu/tác vụ (Dependencies).

3. **Acyclic (Không chu trình / Không tuần hoàn):**
   Bạn không bao giờ có thể bắt đầu từ một Node, đi theo các mũi tên, và quay trở lại chính Node đó. Nghĩa là đồ thị không có các vòng lặp (No loops). Đặc tính này cực kỳ quan trọng vì nó đảm bảo Data Pipeline của bạn luôn tiến về phía trước và có điểm kết thúc rõ ràng, tránh rơi vào tình trạng lặp lại vô tận (infinite loop).

---

## Vai trò của DAG trong Data Engineering

Trong xây dựng Data Pipeline, luồng công việc hiếm khi chỉ là "chạy Script A, xong đến Script B". Thực tế, một pipeline phức tạp sẽ bao gồm hàng chục đến hàng trăm tác vụ đan xen nhau. 

Giả sử bạn có luồng công việc:
1. Extract dữ liệu từ MySQL (A).
2. Extract dữ liệu từ MongoDB (B).
3. Transform dữ liệu MySQL (C) - Phụ thuộc vào A.
4. Transform dữ liệu MongoDB (D) - Phụ thuộc vào B.
5. Join dữ liệu (E) - Phụ thuộc vào C và D.
6. Load vào Data Warehouse (F) - Phụ thuộc vào E.

Nếu không có DAG, bạn sẽ phải tự viết các đoạn code phức tạp để kiểm tra xem "A đã xong chưa, B đã xong chưa thì mới chạy E...". DAG giải quyết bài toán này một cách triệt để:

* **Quản lý Sự phụ thuộc (Dependency Management):** Đảm bảo một Task chỉ chạy khi tất cả các Task tiền quyết (upstream) của nó đã chạy thành công.
* **Xử lý Song song (Parallelism):** Nhìn vào đồ thị DAG, hệ thống biết được Task A và Task B không phụ thuộc vào nhau, nên có thể phân bổ tài nguyên để chạy chúng song song, tối ưu hóa thời gian xử lý.
* **Tự động hóa & Lên lịch (Orchestration):** Điều phối toàn bộ vòng đời của hàng nghìn quy trình dữ liệu tự động thay vì con người phải theo dõi thủ công.

---

## Các khái niệm cốt lõi trong một DAG

Khi làm việc với các hệ thống dựa trên DAG (như Airflow), bạn sẽ thường xuyên gặp các thuật ngữ sau:

### 1. Task (Tác vụ)
Một Task là một nút (Node) trong DAG. Nó thực thi một đoạn logic hoặc lệnh duy nhất. Ví dụ: chạy một lệnh Bash, thực thi một đoạn script Python, hay gọi một truy vấn SQL trong Snowflake.

### 2. Upstream và Downstream
Quan hệ giữa các Task được xác định thông qua hướng của đồ thị:
* **Upstream:** Là những Task nằm trước một Task cụ thể trên đồ thị. Task hiện tại phải đợi các Upstream Tasks thành công mới được chạy.
* **Downstream:** Là những Task nằm sau một Task cụ thể. Chúng chỉ có thể chạy sau khi Task hiện tại đã thành công.

*Ví dụ: Nếu DAG có luồng `Extract -> Transform -> Load`. Với Task `Transform`, thì `Extract` là Upstream, còn `Load` là Downstream.*

### 3. Trạng thái (Task Status)
Trong quá trình thực thi, mỗi Task trong DAG sẽ trải qua nhiều trạng thái khác nhau. Các trạng thái phổ biến nhất gồm:
* **Queued:** Đang chờ tài nguyên hệ thống (worker) để chạy.
* **Running:** Đang được thực thi.
* **Success:** Đã chạy thành công.
* **Failed:** Chạy thất bại.
* **Skipped:** Bỏ qua (có thể do logic rẽ nhánh, ví dụ: nếu hôm nay là Chủ nhật thì không cần xuất báo cáo).
* **Upstream Failed:** Không thể chạy được do một (hoặc nhiều) Task nằm trước nó đã bị lỗi.

---

## Lợi ích to lớn của mô hình DAG

1. **Khả năng phục hồi (Resiliency / Retryability):**
   Khi một lỗi xảy ra ở bước `Transform` (C), toàn bộ pipeline sẽ tạm dừng các bước phía sau. Nhờ kiến trúc DAG, bạn có thể sửa lỗi trong đoạn code Transform, sau đó yêu cầu hệ thống **chạy lại (retry) bắt đầu từ điểm bị lỗi** (Task C) và tiếp tục đi tới cuối, thay vì phải mất thời gian và tiền bạc chạy lại toàn bộ từ bước `Extract` đầu tiên.

2. **Trực quan hóa và Giám sát (Observability):**
   DAG cung cấp một mô hình hoàn hảo để tạo ra giao diện người dùng (UI) trực quan. Thay vì đào bới trong hàng ngàn dòng log văn bản để tìm nguyên nhân pipeline bị chậm, Data Engineer chỉ cần mở UI, nhìn vào đồ thị DAG và ngay lập tức biết Node nào đang màu xanh (Success), Node nào đang màu đỏ (Failed), và thắt cổ chai (bottleneck) nằm ở đâu.

3. **Tính dự đoán (Predictability):**
   Vì đồ thị "không có chu trình", bạn được đảm bảo rằng pipeline sẽ luôn có điểm bắt đầu và điểm kết thúc cụ thể. Hệ thống sẽ không bị kẹt trong một vòng lặp vĩnh viễn, điều này vô cùng quan trọng đối với sự ổn định của hệ thống dữ liệu.

---

## Sự hiện diện của DAG trong hệ sinh thái Data

Khái niệm DAG không bị giới hạn ở một công cụ duy nhất. Bạn sẽ bắt gặp nó ở khắp nơi:

* **Apache Airflow / Dagster / Prefect:** Đây là những Data Orchestrator chuyên dụng. Toàn bộ mã nguồn định nghĩa luồng dữ liệu của bạn sẽ được biên dịch và biểu diễn dưới dạng các DAG. 
* **dbt (Data Build Tool):** Trong dbt, bạn sử dụng hàm `{{ ref() }}` để gọi các model khác. Dựa vào những lời gọi này, dbt tự động biên dịch và vẽ ra một DAG sự phụ thuộc giữa hàng trăm bảng SQL. Nó sẽ biết cần phải xây dựng (build) bảng Staging nào trước, và bảng Fact/Dimension nào sau.
* **Apache Spark:** Mặc dù là một engine tính toán (compute engine), Spark ở dưới nền (backend) sẽ tối ưu hóa các lệnh `map`, `filter`, `reduce` của bạn bằng cách xây dựng một "Execution DAG". Nó gộp các phép tính lại với nhau (Pipelining) trước khi thực sự thi hành lệnh để giảm thiểu số lần đọc/ghi xuống ổ cứng.

---

## Ví dụ: Xây dựng DAG đơn giản bằng Apache Airflow (Python)

Dưới đây là một ví dụ trực quan về cách tạo một DAG đơn giản bằng code trong Apache Airflow để thực hiện quy trình ETL căn bản:

```python
from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

# Định nghĩa các thông số mặc định cho DAG
default_args = {
    'owner': 'data_team',
    'depends_on_past': False,
    'start_date': datetime(2023, 1, 1),
    'email_on_failure': True,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

# Khởi tạo DAG
with DAG(
    'my_simple_etl_dag',
    default_args=default_args,
    description='A simple ETL pipeline',
    schedule_interval='@daily', # Chạy mỗi ngày 1 lần
    catchup=False
) as dag:

    # Khởi tạo các Node (Tasks)
    extract_task = BashOperator(
        task_id='extract_data_from_api',
        bash_command='python /scripts/extract.py'
    )

    transform_task = BashOperator(
        task_id='transform_data',
        bash_command='python /scripts/transform.py'
    )

    load_task = BashOperator(
        task_id='load_to_data_warehouse',
        bash_command='python /scripts/load.py'
    )
    
    notify_task = BashOperator(
        task_id='send_slack_notification',
        bash_command='echo "Pipeline completed successfully!"'
    )

    # ĐỊNH NGHĨA DAG (Edges / Dependencies)
    # Ký hiệu >> nghĩa là "phải chạy xong cái trước mới đến cái sau" (Set downstream)
    extract_task >> transform_task >> load_task >> notify_task
```

Trong ví dụ trên, hướng luồng dữ liệu (Directed) được thể hiện rõ qua biểu thức `extract_task >> transform_task >> load_task`. Không hề có vòng lặp nào (Acyclic).

---

## Best Practices khi thiết kế DAG

1. **Thiết kế Tasks mang tính Nguyên tử (Atomic):** Mỗi Task chỉ nên làm đúng **một việc**. Đừng gộp việc tải dữ liệu từ 3 API khác nhau vào chung một Task. Hãy chia thành 3 Task riêng biệt để nếu API thứ 2 chết, bạn chỉ cần chạy lại Task thứ 2 mà không ảnh hưởng tới các API khác.
2. **Tính Đẳng cấu (Idempotency):** Một DAG nên được thiết kế sao cho dù bạn có chạy nó 1 lần hay 100 lần với cùng một khoảng thời gian đầu vào, kết quả ở đầu ra (trong database) phải hoàn toàn giống hệt nhau (không làm nhân bản hay trùng lặp dữ liệu).
3. **Tránh lưu trữ dữ liệu giữa các Node (State-less):** Các hệ thống như Airflow dùng DAG để *điều phối*, không phải để *truyền dữ liệu*. Không nên đẩy 1 file CSV 10GB từ Node này sang Node kia. Thay vào đó, Node 1 hãy lưu file vào S3/GCS, và truyền đường dẫn (URL) cho Node 2.
4. **Không chạy quá nhiều việc trong một DAG (Granularity):** Tránh tạo một "Super DAG" bao gồm hàng ngàn Task kiểm soát cả công ty. Hãy chia nhỏ thành các DAG con theo từng domain/nghiệp vụ.

## Tài Liệu Tham Khảo

* [Apache Airflow Core Concepts](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html)
* **Dagster: What is Data Orchestration?**
* [dbt (data build tool) Docs - DAG](https://docs.getdbt.com/terms/dag)
* [DataOps Manifesto](https://dataopsmanifesto.org/)
