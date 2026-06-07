---
title: "Change Data Capture (CDC)"
category: "ETL / ELT"
difficulty: "Advanced"
tags: ["cdc", "data-extraction", "streaming", "debezium", "kafka"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Change Data Capture (CDC) - Giải pháp đồng bộ dữ liệu thời gian thực"
metaDescription: "Tìm hiểu công nghệ Change Data Capture (CDC) là gì. Cách lấy dữ liệu từ Transaction Log (Binlog/WAL) bằng Debezium để tạo Data Pipeline thời gian thực."
---

# Change Data Capture (CDC)

## Summary

Change Data Capture (CDC - Thu thập dữ liệu thay đổi) là một tập hợp các công nghệ và mẫu thiết kế phần mềm dùng để theo dõi, phát hiện và nắm bắt các thay đổi dữ liệu (Insert, Update, Delete) diễn ra trong các hệ thống cơ sở dữ liệu nguồn, sau đó truyền các thay đổi này thành một luồng sự kiện (event stream) tới các hệ thống đích trong thời gian thực (Real-time). CDC giải quyết triệt để những khiếm khuyết của các phương pháp trích xuất dữ liệu truyền thống (như Incremental query) mà không gây ảnh hưởng đến hiệu năng của hệ thống vận hành.

---

## Definition

Về mặt khái niệm, **CDC** là bất kỳ quy trình nào chỉ lấy ra những thay đổi thay vì toàn bộ dữ liệu. Tuy nhiên, trong Data Engineering hiện đại, thuật ngữ CDC được ngầm định dùng để chỉ **Log-based CDC** (CDC dựa trên nhật ký).

Thay vì phải liên tục chạy các câu lệnh truy vấn `SELECT * FROM table WHERE updated_at > X` (quá trình này gây tốn CPU và làm chậm ứng dụng đang chạy), các công cụ CDC (như Debezium) sẽ "lắng nghe" ở tầng hệ thống tệp. Nó đọc trực tiếp các tệp nhật ký giao dịch ẩn bên dưới (Transaction Logs) của cơ sở dữ liệu—nơi ghi chép lại mọi hành động thay đổi vật lý từng giây. Bằng cách dịch các byte nhật ký này thành thông điệp JSON, CDC tạo ra một luồng dữ liệu liên tục chảy ra ngoài Data Warehouse.

---

## Why it exists

Phương pháp trích xuất dựa trên thời gian (Incremental Load bằng câu lệnh SQL) có 3 điểm yếu chí mạng:
1. **Làm sập hệ thống (Performance Hit)**: Đặt lệnh `SELECT` đếm hàng triệu dòng mỗi 5 phút vào cơ sở dữ liệu thanh toán chính của công ty sẽ làm tắc nghẽn các tác vụ của khách hàng.
2. **Không bắt được dữ liệu bị xóa (The Delete Problem)**: Khi dùng lệnh `DELETE`, bản ghi vật lý bay mất khỏi Database. Lệnh `SELECT` tiếp theo không thể tìm thấy dấu vết nào để báo cho Data Warehouse biết rằng dòng đó đã bị xóa.
3. **Mất lịch sử trạng thái trung gian (State loss)**: Nếu trong 1 tiếng, tài khoản của bạn đổi số dư từ 10$ -> 20$ -> 50$. Lúc job ETL chạy theo lô kéo dữ liệu về, nó chỉ nhìn thấy con số cuối cùng là 50$. Trạng thái 10$ và 20$ bị mất vĩnh viễn, mô hình Machine Learning phát hiện gian lận không thể phân tích được.

CDC sinh ra là "liều thuốc tiên" giải quyết cả 3 vấn đề trên: Nó không dùng lệnh SELECT (zero-impact), nó thấy rõ lệnh DELETE, và nó ghi lại toàn bộ chuỗi 10$ -> 20$ -> 50$ theo luồng thời gian thực.

---

## Core idea

Ý tưởng cốt lõi của Log-based CDC là lợi dụng kiến trúc phục hồi của chính hệ cơ sở dữ liệu (Database Internals).

Mọi cơ sở dữ liệu quan hệ (RDBMS) vững chắc như MySQL, PostgreSQL, Oracle đều có cơ chế **Write-Ahead Log (WAL) hoặc Binlog**. Trước khi thực sự ghi dữ liệu lên ổ đĩa cứng, hệ thống phải ghi một dòng nhật ký (Log) mô tả giao dịch (Ví dụ: "Hàng thứ 5, bảng Users, chuyển cột Tuổi thành 30"). Log này tồn tại để nếu rớt điện, DB lúc khởi động lại sẽ đọc Log để khôi phục dữ liệu.

Các công cụ CDC (như Debezium) kết nối vào Database và giả vờ mình là một cơ sở dữ liệu dự phòng (Slave Replica). Master Database sẽ ngoan ngoãn "stream" toàn bộ nhật ký Binlog/WAL sang cho Debezium. Debezium nhận Log, dịch nó ra ngôn ngữ người đọc được (JSON), rồi đẩy thẳng vào một hàng đợi tin nhắn (Message Broker như Apache Kafka).

---

## How it works

Dưới đây là chu trình dữ liệu chảy qua một hệ thống CDC phổ biến (Postgres + Debezium + Kafka):

1. **Transaction Occurs (Giao dịch xảy ra)**: Một người dùng trên web đổi tên từ "Anna" thành "Bella". Ứng dụng gửi lệnh `UPDATE users SET name = 'Bella' WHERE id = 1` vào PostgreSQL.
2. **Write-Ahead Log (WAL)**: PostgreSQL ghi vào file WAL: `Row ID=1, OldValue='Anna', NewValue='Bella', Op=Update`.
3. **Debezium Connector**: Ứng dụng Debezium đang kết nối với cổng Replication của Postgres. Postgres lập tức đẩy dòng WAL này sang Debezium.
4. **Kafka Event**: Debezium tạo ra một JSON Payload chứa cả trạng thái cũ (`before`) và trạng thái mới (`after`), gửi nó vào một Kafka Topic tên là `postgres.users`.
5. **Consumption (Tiêu thụ)**: Hệ thống đích (ví dụ Snowflake hoặc một script Python) đọc Topic Kafka này liên tục. Nó thấy sự kiện Update, bèn gọi câu lệnh tương ứng trên DWH để đồng bộ dữ liệu.

---

## Architecture / Flow

```mermaid
graph TD
    subgraph Operational Database
        App[Web App] -->|INSERT/UPDATE/DELETE| DB[(MySQL / Postgres)]
        DB -->|Writes internal log| WAL[(Binlog / WAL)]
    end
    
    subgraph Change Data Capture (CDC Layer)
        CDCConnector[Debezium Source Connector]
        WAL -.->|Replication Stream| CDCConnector
    end
    
    subgraph Event Streaming Platform
        Kafka(Apache Kafka)
        Topic[Topic: db.schema.table]
        CDCConnector -->|Publishes JSON Event| Topic
    end
    
    subgraph Target Destinations
        SnowPipe[Target Connector / Flink]
        Topic -->|Subscribes| SnowPipe
        SnowPipe -->|Applies mutations| DWH[(Data Warehouse / Data Lakehouse)]
        Topic -->|Real-time alerts| FraudModel[Fraud Detection System]
    end
```

---

## Practical example

Một thông điệp (JSON payload) điển hình mà một công cụ CDC tạo ra và ném vào Kafka. Lưu ý sự tồn tại của cả giá trị trước và sau khi đổi:

```json
{
  "op": "u",  // Toán tử (Operation): 'c' (create/insert), 'u' (update), 'd' (delete)
  "ts_ms": 1656608542000, // Thời gian hệ thống nguồn thực hiện giao dịch
  "before": {
    "id": 1001,
    "name": "Anna",
    "email": "anna@test.com"
  },
  "after": {
    "id": 1001,
    "name": "Bella",  // Sự thay đổi diễn ra ở đây
    "email": "anna@test.com"
  },
  "source": {
    "db": "production",
    "table": "users",
    "lsn": 348574895 // Số sê-ri của dòng Log
  }
}
```

Nhờ cấu trúc này, khi hệ thống Data Warehouse đọc được (ví dụ mã `op = d`), nó có thể chủ động xóa (`DELETE`) bản ghi ở kho đích thay vì phải đoán.

---

## Best practices

* **Thiết lập Kafka / Message Broker làm trung gian**: Không nên cấu hình CDC Connector ghi thẳng dữ liệu vào Data Warehouse. Nếu DWH bị sập để bảo trì trong 1 tiếng, luồng CDC sẽ bị đứt và không thể lấy lại log bị mất. Dùng Kafka đứng giữa làm hệ thống đệm (buffer), nó sẽ lưu giữ các sự kiện an toàn cho đến khi DWH bật lại và đọc tiếp từ nơi nó dừng lại.
* **Xử lý ban đầu (Initial Snapshot)**: CDC chỉ bắt đầu ghi nhận từ khoảnh khắc nó được bật. Nó không biết quá khứ. Do đó, lần cấu hình đầu tiên phải trải qua giai đoạn Snapshot (chụp lại toàn bộ trạng thái DB hiện tại) trước khi chuyển sang giai đoạn streaming WAL. Hầu hết các tool như Debezium tự động làm việc này.
* **Quản lý lưu giữ WAL ở DB nguồn (Retention policies)**: Phải cấu hình Database nguồn không xóa file Log quá nhanh. Ví dụ nếu Debezium bị ngắt kết nối cuối tuần, Database dọn dẹp mất các file Binlog trước khi Debezium kịp lên mạng lại, toàn bộ luồng CDC sẽ bị gãy và phải thực hiện lại Initial Snapshot rất đau đớn.

---

## Common mistakes

* **Áp dụng CDC vào bảng thiết kế lỗi (Thiếu Primary Key)**: Log của Database không ghi chép đầy đủ nếu một bảng không có Khóa chính. CDC đẩy dữ liệu đi nhưng ở phía đầu nhận, DWH không có cơ sở nào (id) để biết dòng JSON này phải dùng để cập nhật (Update) vào đâu. (Điều kiện tiên quyết: Mọi bảng nguồn phải có Primary Key).
* **Quên xử lý thứ tự sự kiện (Out-of-order Events)**: Cập nhật A xảy ra trước Cập nhật B. Nhưng trong môi trường phân tán (Kafka partitions), gói tin B có thể đến Data Warehouse nhanh hơn gói tin A. Nếu hệ thống đích cập nhật mù quáng, dữ liệu sẽ ghi nhận sai lệch theo quá khứ. Hệ thống đích phải luôn thiết kế logic kiểm tra trường timestamp `ts_ms`, chỉ áp dụng bản ghi nếu `ts_ms_mới > ts_ms_cũ` ở DWH.

---

## Trade-offs

### Ưu điểm
* **Độ trễ thấp nhất (Low Latency)**: Mang lại dữ liệu Near Real-time (độ trễ dưới 1 giây).
* **Gần như Không ảnh hưởng hiệu năng (Near Zero-impact)**: Database nguồn không bị quá tải bởi các câu lệnh SELECT tốn CPU.
* **Hoàn thiện tính toàn vẹn (Integrity)**: Thu thập được 100% sự kiện, kể cả Hard Deletes (xóa cứng) hay các thay đổi diễn ra chớp nhoáng giữa hai lần quét.

### Nhược điểm
* **Cực kỳ phức tạp về hạ tầng**: Thiết lập, duy trì và vận hành kiến trúc Debezium + Kafka đòi hỏi đội ngũ Data Engineer cứng tay về hệ thống (DevOps / SysAdmin).
* **Nhạy cảm với bảo mật và cấu hình**: Phải thay đổi file cấu hình ở tầng thấp nhất của cơ sở dữ liệu nguồn (vd: đổi cấp độ `wal_level` lên `logical` trong Postgres). Việc này cần sự cho phép của Database Administrator (DBA), đôi khi gặp rào cản nội bộ công ty.

---

## When to use

* Xây dựng kiến trúc Data Lakehouse / Modern Data Stack mạnh mẽ.
* Cần dữ liệu thời gian thực cho các bài toán phân tích gian lận, cảnh báo an ninh, theo dõi chuỗi cung ứng.
* Khi hệ thống nguồn (Database vận hành) quá yếu, không thể chịu được luồng Job Batch SQL quét dữ liệu hàng ngày.

## When not to use

* Nếu công ty bạn chỉ cần báo cáo Dashboard xem vào mỗi buổi sáng thứ Hai (nhu cầu độ trễ 24 giờ). Việc xây hệ thống CDC đồ sộ là giết gà dùng dao mổ trâu. Hãy dùng Incremental Sync SQL truyền thống (Airbyte/Fivetran).
* Các hệ thống API bên thứ ba (SaaS như Facebook, Hubspot) - vì bạn không thể chui vào tầng đĩa cứng của họ để lấy transaction log được. CDC chỉ làm được cho DB mà công ty bạn sở hữu.

---

## Related concepts

* [Data Ingestion](/concepts/data-ingestion)
* [Incremental Load](/concepts/incremental-load)
* [Table Format (Hudi/Iceberg - Đích đến hoàn hảo của CDC)](/concepts/table-format)

---

## Interview questions

### 1. Phân biệt Log-based CDC và Query-based CDC (Incremental query). Tại sao Log-based được coi là kiến trúc tối ưu hơn?
* **Người phỏng vấn muốn kiểm tra**: Kiến thức nền tảng và nhận thức về thiết kế hệ thống.
* **Gợi ý trả lời (Strong Answer)**: 
  * *Query-based CDC* là phương pháp cổ điển, viết lệnh SQL `SELECT * WHERE updated_at > X`. Phương pháp này gây áp lực trực tiếp lên CPU/Memory của hệ thống (vì DB phải thực thi truy vấn), dễ lọt các giao dịch thay đổi quá nhanh (chưa kịp bắt đã bị update đè), và hoàn toàn mù lòa với thao tác `DELETE`.
  * *Log-based CDC* đọc trực tiếp từ các file nhật ký giao dịch ở cấp độ hệ thống tệp (Binlog/WAL). Nó bỏ qua hoàn toàn engine xử lý SQL của Database -> Không ảnh hưởng hiệu năng ứng dụng. Nó ghi nhận mọi thay đổi ở mức độ byte (bao gồm cả trạng thái trước-sau của record và thao tác Delete). Đó là lý do nó được coi là kiến trúc tối ưu chuẩn ngành hiện tại (Industry Standard) cho các luồng streaming.

### 2. Debezium đọc Log và ném vào Kafka. Vậy làm thế nào để đảm bảo tính thứ tự (Ordering) của các sự kiện cập nhật trên một bản ghi? Ví dụ: Lệnh INSERT phải đến DWH trước lệnh UPDATE.
* **Người phỏng vấn muốn kiểm tra**: Hiểu biết sâu về xử lý luồng phân tán (Distributed Stream Processing) và kiến trúc Kafka.
* **Gợi ý trả lời (Strong Answer)**:
  Trong kiến trúc Kafka, thứ tự của các tin nhắn (messages) CHỈ được đảm bảo một cách tuyệt đối bên trong cùng một Phân vùng (Partition). Để đảm bảo các sự kiện của cùng một dòng dữ liệu (cùng 1 User) đi đúng thứ tự Insert -> Update -> Delete, hệ thống CDC (như Debezium Connector) sẽ sử dụng **Khóa Chính (Primary Key)** của bảng nguồn làm **Message Key (Khóa tin nhắn)** khi ném vào Kafka. Cơ chế chia luồng (Hashing algorithm) của Kafka đảm bảo rằng tất cả các sự kiện có cùng một Key sẽ luôn rơi vào đúng một Partition duy nhất. Do đó, Consumer ở đầu ra sẽ đọc được các sự kiện của User đó theo đúng thứ tự thời gian tuyến tính đã xảy ra ở DB nguồn.

---

## References

1. **Debezium Documentation** - "Architecture" (Tài liệu về cách Debezium kết nối với Database nguồn).
2. **Designing Data-Intensive Applications** - Martin Kleppmann (Chương thảo luận về Log, Event Sourcing và Replication).

---

## English summary

Change Data Capture (CDC) is an advanced architectural pattern used to track and replicate data changes (Insert, Update, Delete) from an operational database to analytical systems in real-time. Modern CDC heavily relies on Log-based replication (using tools like Debezium reading Write-Ahead Logs / Binlogs) rather than traditional SQL polling. This approach creates a real-time event stream of data changes with near-zero performance impact on the source operational systems. CDC is highly effective at capturing transient intermediate states and physical hard-deletes, solving the biggest flaws of incremental batch queries, and serves as the backbone for modern streaming pipelines and Data Lakehouse architectures.
