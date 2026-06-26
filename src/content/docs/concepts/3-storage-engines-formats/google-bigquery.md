---
title: "Google BigQuery - Phân Tích Kiến Trúc Máy Chủ Ảo (Serverless Data Warehouse)"
difficulty: "Advanced"
tags: ["google-cloud", "bigquery", "data-warehouse", "serverless", "dremel", "colossus"]
readingTime: "25 mins"
lastUpdated: 2026-06-26
seoTitle: "Kiến trúc BigQuery: Dremel, Colossus và Các Đánh Đổi Hệ Thống"
metaDescription: "Đi sâu vào kiến trúc vật lý của Google BigQuery (Borg, Colossus, Dremel, Jupiter). Phân tích mã nguồn Terraform, Tối ưu hoá truy vấn và các rủi ro vận hành OOMKilled, Slot Starvation."
description: "Phân tích kiến trúc phân tách Compute và Storage của BigQuery. Mổ xẻ cách Dremel thực thi truy vấn, định dạng Capacitor, và các đánh đổi (trade-offs) để tránh sập hệ thống hoặc bùng nổ chi phí."
---

Khác với các hệ thống RDBMS truyền thống (PostgreSQL, MySQL) nơi Compute và Storage bị trói buộc vào cùng một máy chủ vật lý, Google BigQuery là một Enterprise Data Warehouse theo đuổi triết lý **Decoupled Architecture** (Tách rời Tính toán và Lưu trữ). Nó cho phép bạn ném một truy vấn SQL phân tích hàng Petabyte dữ liệu và nhận kết quả trong vài giây, mà không cần quan tâm đến số lượng Node, RAM hay Disk I/O.

Bài viết này sẽ lật mở "cỗ máy" dưới mui xe của BigQuery, giải thích cách nó vận hành dưới góc độ vật lý, cách triển khai bằng mã nguồn thực tế (Terraform/SQL), và quan trọng nhất là các tình huống rủi ro vận hành (Operational Risks) mà một Kỹ sư Dữ liệu sẽ phải đối mặt.

## 1. Kiến trúc Vật lý (Physical Execution Architecture)

Tốc độ khủng khiếp của BigQuery không đến từ phép màu, mà từ 4 trụ cột cơ sở hạ tầng nội bộ của Google. 

```mermaid
graph TD
    subgraph Borg["Borg - Resource Management"]
        direction TB
        Client["Client / JDBC / UI"] -->|SQL Query| Root["Dremel: Root Node"]
    end

    subgraph Dremel["Dremel - Compute Engine"]
        Root -->|Rewrite SQL & Split| Mixer1["Mixer Node"]
        Root -->|Rewrite SQL & Split| Mixer2["Mixer Node"]
        
        Mixer1 -->|Shuffle & Aggregate| Leaf1["Leaf Node"]
        Mixer1 -->|Shuffle & Aggregate| Leaf2["Leaf Node"]
        Mixer2 -->|Shuffle & Aggregate| Leaf3["Leaf Node"]
        Mixer2 -->|Shuffle & Aggregate| Leaf4["Leaf Node"]
    end

    subgraph Jupiter["Jupiter - Petabit Network"]
        direction LR
        Net("(Network Shuffle 1 Petabit/s"))
    end
    
    Leaf1 & Leaf2 & Leaf3 & Leaf4 <--> Net

    subgraph Colossus["Colossus - Distributed Storage"]
        Net <--> Storage1["(Capacitor File 1)"]
        Net <--> Storage2["(Capacitor File 2)"]
        Net <--> Storage3["(Capacitor File N)"]
    end
```

### 1.1. Dremel: Execution Engine (Động cơ Thực thi Tính toán)
Dremel là engine xử lý MPP (Massively Parallel Processing). Khi bạn submit một truy vấn `SELECT`, Dremel biến nó thành một Execution Tree (cây thực thi):
- **Root Node**: Nhận truy vấn, kiểm tra quyền, đọc metadata từ hệ thống để tối ưu hóa, sau đó chia nhỏ công việc.
- **Mixer Nodes**: Làm nhiệm vụ gom nhóm (Aggregation) và xáo trộn dữ liệu (Shuffle) giữa các nhánh.
- **Leaf Nodes**: Chịu trách nhiệm giao tiếp trực tiếp với tầng Storage (Colossus) để quét, lọc (Filter) dữ liệu ở định dạng cột. 

> [!NOTE]
> Khái niệm **BigQuery Slot** chính là một đơn vị tài nguyên CPU, RAM và I/O mạng cấp phát cho các tiến trình chạy trên các Mixer và Leaf node này.

### 1.2. Colossus: Distributed Storage
Hệ thống file phân tán thế hệ 2 của Google (kế thừa GFS). Colossus chia dữ liệu thành các chunk nhỏ, lưu trữ dự phòng (erasure encoding) qua nhiều data center. BigQuery không bao giờ lưu dữ liệu trên ổ cứng local của các máy tính toán Dremel, mọi thứ đều nằm ở Colossus.

### 1.3. Jupiter: The Network Bottleneck Breaker
Nếu Dremel và Colossus bị tách rời, thì việc chuyển hàng Terabyte dữ liệu giữa chúng sẽ gây nghẽn cổ chai mạng (Network Bottleneck). Google giải quyết bằng **Jupiter Network**, cung cấp băng thông hai chiều lên tới 1 Petabit/giây (Pbps). Nhờ đó, việc đọc dữ liệu từ xa (remote storage) nhanh như đọc từ RAM cục bộ.

### 1.4. Capacitor: Định dạng lưu trữ theo Cột (Columnar Format)
Dữ liệu trên Colossus được nén dưới định dạng **Capacitor** (phiên bản nội bộ mạnh mẽ hơn Parquet). 
- Hỗ trợ Pushdown Predicates (đẩy điều kiện `WHERE` xuống tận cấp lưu trữ).
- Lưu metadata (min, max, count, nulls) ở file header để Leaf nodes có thể loại bỏ ngay lập tức (Data Pruning) các block không thỏa mãn điều kiện trước khi nén/giải mã.

---

## 2. Show, Don't Tell: Triển khai với Code Thực Chiến

Thay vì bấm giao diện UI, Staff Data Engineer phải quản lý hạ tầng như một mã nguồn (Infrastructure as Code - IaC). Dưới đây là cấu hình Terraform để khởi tạo một Dataset và Bảng chuẩn Enterprise, áp dụng Partitioning và Clustering.

```hcl
# main.tf
resource "google_bigquery_dataset" "analytics_dw" {
  dataset_id                  = "enterprise_analytics"
  friendly_name               = "Enterprise Analytics"
  description                 = "Data warehouse for real-time analytics"
  location                    = "US"
  default_table_expiration_ms = 31536000000 # 365 ngày hết hạn cho bảng tạm
}

resource "google_bigquery_table" "fact_transactions" {
  dataset_id = google_bigquery_dataset.analytics_dw.dataset_id
  table_id   = "fact_transactions"

  # Bắt buộc người dùng phải gõ WHERE transaction_date 
  # để tránh full-scan tốn chi phí
  require_partition_filter = true 

  time_partitioning {
    type  = "DAY"
    field = "transaction_date"
  }

  # Gom cụm dữ liệu vật lý theo nhóm để tối ưu tốc độ đọc và JOIN
  clustering = ["merchant_id", "status"]

  schema = <<EOF
[
  {"name": "transaction_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "transaction_date", "type": "DATE", "mode": "REQUIRED"},
  {"name": "merchant_id", "type": "STRING", "mode": "NULLABLE"},
  {"name": "amount", "type": "NUMERIC", "mode": "NULLABLE"},
  {"name": "status", "type": "STRING", "mode": "NULLABLE"}
]
EOF
}
```

> [!TIP]
> Thuộc tính `require_partition_filter = true` là "chốt chặn an toàn" sống còn. Nếu Data Analyst quên viết `WHERE transaction_date = '2023-10-01'`, BigQuery sẽ từ chối chạy truy vấn thay vì quét mờ 10 TB dữ liệu và gửi hóa đơn hàng trăm đô la.

---

## 3. Rủi ro Vận hành và Sự Đánh đổi (Systemic Trade-offs)

BigQuery rất mạnh, nhưng không phải viên đạn bạc. Khi kiến trúc mạng và lưu trữ bị lạm dụng, hệ thống sẽ gặp sự cố (Incident).

### 3.1. Slot Starvation (Đói tài nguyên)
**Tình huống:** Pipeline dữ liệu vào buổi sáng chạy rất chậm, thỉnh thoảng báo lỗi `Resources exceeded during query execution`.
**Nguyên nhân gốc rễ (Root Cause):** 
BigQuery theo mô hình Multi-tenant (dùng chung tài nguyên) nếu bạn chọn On-demand Pricing. Số lượng Slots (CPU) là hữu hạn. Khi hàng loạt câu lệnh `SELECT *`, `JOIN` phức tạp, hoặc Window functions được gọi cùng lúc, hệ thống không cấp đủ Slot (Slot Starvation).
**Giải pháp (Trade-off):**
- Đánh đổi Chi phí lấy Ổn định: Chuyển sang mô hình **Capacity Pricing** (Edition) để mua đứt ví dụ 1,000 Slots chạy độc quyền (Dedicated).
- Tối ưu hóa Code: Thay vì tính chính xác (Exact Math) tiêu tốn nhiều RAM trên Mixer nodes, hãy dùng xấp xỉ (Approximate Math).

```sql
-- TRƯỚC: Rất chậm, OOMKilled trên Mixer node do phải giữ mọi giá trị trong RAM
SELECT merchant_id, COUNT(DISTINCT user_id) 
FROM fact_transactions GROUP BY 1;

-- SAU: Cực kỳ nhanh, dùng thuật toán HyperLogLog++, sai số ~1-2%
SELECT merchant_id, APPROX_COUNT_DISTINCT(user_id) 
FROM fact_transactions GROUP BY 1;
```

### 3.2. Spill-to-Disk (Tràn RAM xuống ổ đĩa mạng) và OOM
**Tình huống:** `JOIN` 2 bảng Fact quá lớn (hàng tỷ dòng) không cùng Partition/Cluster keys, truy vấn mất 30 phút.
**Nguyên nhân:** Khi Mixer node nhận dữ liệu từ Leaf node để thực hiện `Hash Join`, nếu tổng lượng dữ liệu vượt quá dung lượng RAM của Mixer, nó buộc phải xả (spill) dữ liệu tạm xuống đĩa mạng qua Jupiter. Phép xáo trộn mạng (Network Shuffle) ở quy mô Petabyte cực kỳ đắt đỏ về độ trễ. Nếu vượt quá giới hạn Shuffle, truy vấn sẽ chết (OOM).
**Giải pháp:**
- Tránh Cartesian Explosion (Cross Join không điều kiện).
- Lọc (Filter) mạnh nhất có thể *trước* khi `JOIN` hoặc dùng CTE.

### 3.3. DML Updates & Anti-patterns (SCD Type 2)
**Tình huống:** Kỹ sư cố gắng mô phỏng Slowly Changing Dimension (SCD) Type 2 bằng cách `UPDATE` từng dòng dữ liệu mỗi 5 phút bằng Apache Airflow.
**Nguyên nhân:** BigQuery là một hệ thống OLAP thiết kế cho thao tác đọc lớn (Read-heavy) và nối thêm (Append-only). Nó KHÔNG phải OLTP (như Postgres). Các lệnh `UPDATE/DELETE` kích hoạt quá trình ghi đè toàn bộ block Capacitor, làm chậm toàn hệ thống và bị giới hạn Quota (chỉ vài trăm lệnh DML mỗi bảng một ngày).
**Giải pháp:** Sử dụng câu lệnh `MERGE` để batch các bản ghi thay đổi theo chu kỳ (ví dụ mỗi giờ 1 lần).

```sql
-- Dùng MERGE để thực hiện Upsert (Insert/Update) hàng loạt một cách tối ưu
MERGE `enterprise_analytics.dim_merchants` T
USING `enterprise_analytics.stg_merchants` S
ON T.merchant_id = S.merchant_id
WHEN MATCHED AND T.status != S.status THEN
  UPDATE SET status = S.status, updated_at = CURRENT_TIMESTAMP()
WHEN NOT MATCHED THEN
  INSERT (merchant_id, status, created_at, updated_at)
  VALUES (S.merchant_id, S.status, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
```

---

## 4. Tổng kết: Data Engineer cần nhớ gì?

1. **Compute != Storage:** Bạn không bao giờ quan tâm đến dung lượng ổ đĩa. Hãy tập trung vào việc dữ liệu đang được tổ chức vật lý như thế nào để đọc ít nhất (Partitioning + Clustering).
2. **Network is the Computer:** Tốc độ của BigQuery là nhờ mạng lưới Jupiter. Hạn chế tối đa các lệnh SQL gây xáo trộn mạng (Shuffle) quá lớn.
3. **No `SELECT *`:** Trả tiền cho Compute là trả tiền cho lượng byte quét từ Colossus. Định dạng cột (Capacitor) chỉ phát huy sức mạnh khi bạn chọn đúng cột mình cần.

---

## 5. Nguồn Tham Khảo (References)
* [A Look at Dremel - Interactive Analysis of Web-Scale Datasets (Google Research)](https://research.google/pubs/pub36632/)
* [BigQuery under the hood - Official Google Cloud Blog](https://cloud.google.com/blog/products/data-analytics/new-blog-series-bigquery-under-the-hood)
* [BigQuery Storage Architecture Overview (Google Cloud Docs)](https://cloud.google.com/bigquery/docs/storage-overview)
* Sách tham khảo: *Designing Data-Intensive Applications* (Martin Kleppmann) - Chương 3: Storage and Retrieval.
