---
title: "DAG (Đồ thị có hướng không chu trình) trong Data Engineering"
category: "Orchestration"
difficulty: "Beginner"
tags: ["dag", "directed-acyclic-graph", "airflow", "pipeline", "orchestration"]
readingTime: "8 mins"
lastUpdated: 2026-06-07
seoTitle: "DAG là gì? Directed Acyclic Graph trong Data Pipeline"
metaDescription: "Đồ thị có hướng không chu trình (DAG) là gì? Lý do các công cụ Orchestration như Airflow, dbt, Spark sử dụng kiến trúc DAG để mô hình hóa Data Pipeline."
---

# DAG - Đồ thị có hướng không chu trình

## Summary

Trong Data Engineering, **DAG (Directed Acyclic Graph)**, dịch sang tiếng Việt là "Đồ thị có hướng không chu trình", là một khái niệm toán học được áp dụng làm khung xương kiến trúc để mô hình hóa các luồng công việc (Data Pipelines). Một DAG biểu diễn một tập hợp các tác vụ (Tasks) có quy định rõ ràng thứ tự thực thi (có hướng - Directed), nhưng nghiêm cấm việc tạo ra các vòng lặp vô hạn (không chu trình - Acyclic). Khái niệm này là nền tảng cốt lõi của hầu hết các công cụ xử lý và điều phối dữ liệu hiện đại như Apache Airflow, dbt, Apache Spark và Snowflake.

---

## Definition

Về mặt toán học, **DAG** là một đồ thị bao gồm:
1. **Các đỉnh (Nodes / Vertices)**: Biểu diễn cho các Tác vụ (Tasks) cần thực hiện. Ví dụ: Extract Data, Transform Data, Send Email.
2. **Các cạnh có hướng (Directed Edges)**: Biểu diễn bằng mũi tên $A \rightarrow B$, quy định mối quan hệ phụ thuộc (Dependency). Nó mang ý nghĩa "Task A phải hoàn thành xong thì Task B mới được phép chạy".
3. **Đặc tính Không chu trình (Acyclic)**: Nếu bạn đi theo bất kỳ chiều mũi tên nào từ một Task, bạn sẽ **không bao giờ** quay trở lại chính Task đó. Không tồn tại đường đi $A \rightarrow B \rightarrow C \rightarrow A$.

---

## Why it exists

Thử tưởng tượng bạn xây dựng một quy trình tính lương cho nhân viên:
1. Tổng hợp giờ làm (Task A)
2. Lấy thông tin thưởng KPI (Task B)
3. Tính thuế và tổng lương (Task C, yêu cầu A và B phải xong)
4. Gửi email xác nhận (Task D, yêu cầu C phải xong).

Nếu dùng một file Script chạy từ trên xuống dưới, việc kiểm soát song song rất khó (Task A và B có thể chạy cùng lúc để tiết kiệm thời gian). Còn nếu có một lỗi xảy ra trong logic thiết kế mà bạn lỡ quy định "Để tính KPI (B), hệ thống cần xem lại bảng tổng lương (C) của tháng này", bạn đã tạo ra một **Vòng lặp vô tận (Infinite Loop)** (C cần B, B lại cần C). Hệ thống sẽ treo (deadlock) mãi mãi.

**DAG** sinh ra như một cấu trúc dữ liệu bắt buộc (Constraint) trong hệ thống Orchestration để:
1. Quy hoạch lộ trình thực thi rõ ràng, cho phép tối đa hóa việc chạy song song (Parallelism) các nhánh không phụ thuộc.
2. Đảm bảo tính hữu hạn (luôn có điểm kết thúc), không bao giờ xảy ra bế tắc (deadlock) do vòng lặp.

---

## Core idea

Cấu trúc DAG cho phép công cụ điều phối (Scheduler) trả lời được hai câu hỏi quan trọng nhất của hệ thống phân tán:
1. **Tiếp theo tôi có thể chạy những tác vụ nào?** (Bằng cách tìm các Node có tất cả mũi tên hướng vào nó (Upstream) đã báo trạng thái SUCCESS).
2. **Chuyện gì xảy ra nếu Node X bị lỗi?** (Hệ thống sẽ tự động tạm dừng toàn bộ các Node nằm ở phía hạ lưu (Downstream) của mũi tên xuất phát từ X, ngăn chặn luồng dữ liệu lỗi lây lan, trong khi các nhánh không liên quan khác vẫn chạy bình thường).

---

## How it works

Quy trình giải mã và thực thi DAG của một Scheduler (VD: Airflow):
1. **Topological Sort (Sắp xếp Topo)**: Scheduler nhận bản thiết kế DAG và áp dụng thuật toán Topo để trải phẳng đồ thị thành một mảng tuyến tính có thứ tự. Thuật toán này sẽ ném lỗi ngay lập tức nếu phát hiện chu trình (Cycle).
2. **Giai đoạn khởi chạy**: Các Node không có mũi tên nào hướng vào (Roots - Các tác vụ đầu tiên) sẽ được đưa vào hàng đợi (Queue) để chạy ngay.
3. **Chờ tín hiệu**: Khi một Root hoàn tất, nó gửi tín hiệu cho DAG. DAG đánh giá các Node con. Nếu một Node con đã thu thập đủ các tín hiệu "Thành công" từ tất cả các Node cha của nó, nó sẽ chuyển trạng thái sang Ready và được đẩy vào Queue.
4. **Kết thúc**: DAG hoàn tất khi Node cuối cùng (không có mũi tên nào hướng ra ngoài) hoàn tất thành công.

---

## Architecture / Flow

Dưới đây là một ví dụ trực quan về DAG hợp lệ và DAG không hợp lệ:

```mermaid
graph TD
    subgraph Hợp lệ (DAG)
        A1(Extract MySQL) --> C1(Load to Data Warehouse)
        B1(Extract API) --> C1
        C1 --> D1(Transform using dbt)
        D1 --> E1(Generate Report)
        D1 --> F1(Send Alert)
    end

    subgraph KHÔNG Hợp lệ (Có chu trình)
        A2(Task A) --> B2(Task B)
        B2 --> C2(Task C)
        C2 -. Lỗi vòng lặp .-> A2
    end
    
    style C2 fill:#ffcccc,stroke:#ff0000
```

Trong phần "Hợp lệ", `Extract MySQL` và `Extract API` có thể chạy song song (do không ai chờ ai). `Transform using dbt` bắt buộc phải đợi cả 2 việc kia xong mới chạy.

---

## Practical example

Ví dụ định nghĩa DAG trong Apache Airflow (Sử dụng toán tử bitwise `>>` của Python để vẽ mũi tên):

```python
from airflow import DAG
from airflow.operators.empty import EmptyOperator
from datetime import datetime

with DAG(dag_id="example_dag", start_date=datetime(2026, 6, 1)) as dag:
    # Định nghĩa các Node (Tasks)
    task_a = EmptyOperator(task_id="extract_postgres")
    task_b = EmptyOperator(task_id="extract_mongodb")
    task_c = EmptyOperator(task_id="transform_merge")
    task_d = EmptyOperator(task_id="notify_slack")
    task_e = EmptyOperator(task_id="notify_email")

    # Vẽ các cạnh (Edges) để tạo Đồ thị
    [task_a, task_b] >> task_c  # A và B là Upstream của C. C chạy khi A & B xong.
    task_c >> [task_d, task_e]  # C là Upstream của D và E. C xong thì D & E chạy song song.
```

Trong **dbt (data build tool)**, bạn không dùng toán tử `>>`, mà dùng hàm `{{ ref() }}` trong mã SQL. dbt sẽ ngầm tự biên dịch các lệnh `ref()` thành một DAG khổng lồ.
Ví dụ mô hình `marts_revenue.sql`:
```sql
SELECT * FROM {{ ref('stg_sales') }} JOIN {{ ref('stg_users') }} ...
```
dbt hiểu rằng: `stg_sales` và `stg_users` $\rightarrow$ `marts_revenue`.

---

## Best practices

* **Định hướng dòng chảy (Flow Direction)**: Hãy thiết kế DAG đi theo luồng nghiệp vụ kinh doanh. Điểm bắt đầu (Extract) luôn nằm bên trái/trên cùng, điểm kết thúc (Load/Report) nằm bên phải/dưới cùng. Đừng tạo ra các DAG có đường đi chéo ngoe ngoắt cực kỳ khó đọc bảo trì.
* **Quy mô của DAG (DAG Size)**: Một DAG không nên quá nhỏ (1 tác vụ) và tuyệt đối không được quá to (hàng ngàn tác vụ). Một hệ thống với đồ thị hàng ngàn node (Mega-DAG) sẽ làm công cụ Scheduler bị quá tải khi tính toán thuật toán Topo và UI sẽ đơ khi load trình duyệt web. Hãy tách Mega-DAG ra thành các SubDAGs hoặc dùng TriggerDagRun để gọi các DAG độc lập theo Module nghiệp vụ.
* **Nguyên tắc Nguyên tử (Atomicity)**: Mỗi Node trong DAG chỉ nên làm đúng MỘT việc duy nhất. Đừng gộp việc Extract và Transform vào cùng một Node Python. Nếu nó lỗi ở bước Transform, bạn không thể Retry độc lập mà phải tải lại Data từ đầu, cực kỳ lãng phí.

---

## Common mistakes

* **Vô tình tạo Cyclic Dependency (Chu trình)**: Lỗi kinh điển nhất. Task A import thư viện của Task B, nhưng Task B lại phụ thuộc vào dữ liệu của Task A. Scheduler sẽ crash lập tức báo lỗi `AirflowDagCycleException`. 
* **Cố gắng dùng vòng lặp `while/for` chờ đợi vô tận bên trong 1 Node**: Cố tình phá vỡ cấu trúc DAG bằng cách viết logic lập trình bắt Node A chạy vòng lặp vô hạn chờ Node C ở DAG khác. Việc này giữ chỗ (hold lock) tài nguyên của worker, gây thắt cổ chai toàn hệ thống. Hãy sử dụng khái niệm **Sensors** (Tác vụ cảm biến).

---

## Trade-offs

### Ưu điểm
* Giải quyết triệt để tính phụ thuộc phức tạp, đảm bảo Data Pipeline luôn chạy đúng thứ tự toán học.
* Cung cấp một khung nhìn trực quan (Visual Graph) cực kỳ dễ hiểu, giúp người không chuyên kỹ thuật (Business) cũng có thể nhìn hình và biết dữ liệu đang tắc ở đâu.
* Tối đa hóa khả năng xử lý song song trên môi trường Cluster phân tán.

### Nhược điểm
* **Không hỗ trợ luồng logic lặp lại (Do-While / For Loop)**: Vì đặc tính "Không chu trình", bạn không thể vẽ một DAG có logic "Thử gửi API, nếu lỗi thì quay lại bước 1, làm vòng tròn đến khi thành công". (Bạn phải dùng tính năng `Retries` ngầm định của task thay vì vẽ vòng lặp trên DAG).
* Mất đi sự linh hoạt của code động thời gian thực: Cấu trúc DAG phải được xác định rõ (compile) trước khi bắt đầu thực thi (mặc dù một số công cụ như Prefect có hỗ trợ dynamic DAG nhưng rất phức tạp).

---

## When to use

* Là cấu trúc bắt buộc khi làm việc với hầu hết các hệ thống Data Engineering hiện đại: Apache Airflow, Dagster, Prefect, dbt, Apache Spark RDD Execution Engine, Tez.
* Khi luồng công việc của bạn có sự phân nhánh, kết hợp và có thứ tự trước sau rõ ràng.

## When not to use

* Với các dịch vụ Microservices thông thường tương tác gọi API lẫn nhau vô hướng.
* Với các bài toán yêu cầu thuật toán đệ quy (Recursion) hoặc cần vòng lặp quy hồi (Loop). Hệ DAG không thiết kế cho việc này.

---

## Related concepts

* [Orchestration](/concepts/orchestration)
* [Apache Airflow](/concepts/apache-airflow)
* [Task Dependency](/concepts/task-dependency)

---

## Interview questions

### 1. Giải thích ý nghĩa của chữ "Acyclic" (Không chu trình) trong DAG. Nếu có chu trình thì sao?
* **Người phỏng vấn muốn kiểm tra**: Nắm vững nền tảng kiến trúc lý thuyết đồ thị.
* **Gợi ý trả lời (Strong Answer)**: Acyclic nghĩa là các mũi tên phụ thuộc chỉ đi về một hướng, không có bất kỳ đường đi nào đưa bạn quay ngược lại điểm xuất phát. Nếu một pipeline có chu trình (Cyclic), ví dụ A chờ B, B chờ C, C lại chờ A, thì nó sẽ tạo ra vòng lặp vô tận (Deadlock/Infinite Loop). Hệ thống Scheduler sẽ bị treo cứng không thể bắt đầu thực thi bất kỳ task nào vì không tìm được điểm xuất phát (Root node). Các công cụ như Airflow áp dụng thuật toán Topological Sort và sẽ báo lỗi biên dịch ngay lập tức nếu phát hiện điều này.

### 2. Sự khác biệt giữa việc tạo 1 DAG có 100 tác vụ và 10 DAGs, mỗi DAG có 10 tác vụ là gì?
* **Người phỏng vấn muốn kiểm tra**: Tư duy thiết kế hệ thống (Design pattern) thực tế.
* **Gợi ý trả lời (Strong Answer)**: Đây là câu chuyện quy mô (Scalability). 1 DAG khổng lồ 100 tác vụ giúp gom mọi thứ vào một nơi, dễ theo dõi toàn bộ luồng từ đầu đến cuối trên 1 màn hình. Nhược điểm là UI load rất chậm, scheduler tốn nhiều CPU để tính DAG, và quan trọng nhất: Một task nhỏ ở nhánh phụ bị lỗi cũng sẽ đánh dấu cả DAG khổng lồ đó là thất bại (Failed). Tách ra 10 DAGs theo từng vùng nghiệp vụ (Domain-based) làm cho hệ thống mô-đun hóa cao hơn, các team khác nhau tự quản lý DAG của họ, sửa lỗi độc lập, triển khai nhanh hơn, dùng Sensors để liên kết chúng lại. Best practice khuyên dùng cách thứ 2.

### 3. Trong dbt, DAG được tạo ra như thế nào? Nó có khác biệt với DAG của Airflow không?
* **Người phỏng vấn muốn kiểm tra**: Sự hiểu biết đa công cụ trong hệ sinh thái Data.
* **Gợi ý trả lời (Strong Answer)**: Cả hai đều dùng DAG nhưng cách tiếp cận khác nhau. Trong Airflow, DAG là "Explicit" (Tường minh): Data Engineer phải viết code Python tự vẽ mũi tên `A >> B`. Trong dbt, DAG là "Implicit" (Ngầm định): Analytics Engineer chỉ viết code SQL cho các file Model riêng biệt. dbt tự động biên dịch và suy luận ra cấu trúc DAG dựa trên cú pháp hàm `{{ ref('model_name') }}`. Nếu Model B `ref` tới Model A, dbt tự vẽ mũi tên từ A sang B.

### 4. Thuật toán Sắp xếp Topo (Topological Sort) được sử dụng để làm gì trong hệ DAG?
* **Người phỏng vấn muốn kiểm tra**: Kiến thức sâu về cấu trúc dữ liệu và giải thuật trong hệ thống.
* **Gợi ý trả lời (Strong Answer)**: Topological Sort là thuật toán trải phẳng một đồ thị có hướng thành một mảng danh sách tuyến tính 1 chiều, sao cho với mọi cung $U \rightarrow V$, đỉnh U luôn đứng trước đỉnh V trong danh sách. Lợi ích là: (1) Nó dùng để phát hiện vòng lặp (nếu thuật toán không lấy được hết đỉnh, tức là có chu trình). (2) Nó giúp Scheduler biết chính xác thứ tự ưu tiên Task nào cần cấp phát tài nguyên chạy trước để không vi phạm quy tắc luồng.

### 5. Làm sao để chạy lặp đi lặp lại một khối công việc trong kiến trúc DAG (Ví dụ: Call API phân trang liên tục)?
* **Người phỏng vấn muốn kiểm tra**: Khả năng "Lách luật" (Workaround) giải quyết bài toán nghiệp vụ trên hệ thống.
* **Gợi ý trả lời (Strong Answer)**: Vì DAG cấm vòng lặp logic (Acyclic), ta không thể vẽ mũi tên quay lại trên Airflow. Cách giải quyết là đóng gói toàn bộ logic vòng lặp `while/for` đó vào bên trong nội bộ của MỘT Task (một PythonOperator duy nhất). Nghĩa là, Task đó sẽ giữ kết nối và gọi API liên tục cho đến khi hết trang mới thôi, sau đó báo Success cho DAG đi tiếp. Khối logic lặp nằm trong Data Plane thay vì Control Plane (Orchestrator).

---

## References

1. **Airflow Official Documentation** - Concepts: DAGs.
2. **Introduction to Algorithms** - Thomas H. Cormen (Thuật toán đồ thị và Topological Sort).

---

## English summary

A **DAG (Directed Acyclic Graph)** is a mathematical structure representing a collection of tasks with defined, directional dependencies, strictly forbidding any loops or cycles. In data engineering frameworks like Apache Airflow, dbt, and Spark, DAGs serve as the architectural blueprint for modeling workflows. By explicitly mapping out which tasks must precede others, the Orchestrator can intelligently parallelize independent tasks, prevent execution deadlocks (since there are no cycles), efficiently pinpoint points of failure, and halt downstream execution when upstream errors occur. While a DAG limits dynamic, looping control-flow at the orchestration level, it forces developers into creating atomic, predictable, and robust data pipelines.
