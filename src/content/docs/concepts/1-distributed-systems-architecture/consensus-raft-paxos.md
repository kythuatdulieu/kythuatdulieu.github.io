---
title: "Đồng Thuận Phân Tán: Paxos, Raft và FLP Impossibility"
difficulty: "Advanced"
readingTime: "12 mins"
lastUpdated: 2026-06-26
seoTitle: "Thuật toán Raft & Paxos - Cốt lõi của Hệ thống Phân tán"
metaDescription: "Tìm hiểu sâu sắc về kiến trúc thuật toán đồng thuận Raft, Paxos, định lý FLP và cách Apache Kafka (KRaft), Zookeeper ứng dụng thực tế."
description: "Tìm hiểu sâu sắc về kiến trúc thuật toán đồng thuận Raft, Paxos, định lý FLP và cách hệ thống như Apache Kafka ứng dụng."
---

Một hệ cơ sở dữ liệu phân tán (như Kafka, Cassandra hay etcd) là một dàn nhạc khổng lồ với nhiều nhạc công (nodes). Nếu không có một nhạc trưởng (Leader) kiểm soát nhịp điệu, dàn nhạc sẽ trở nên hỗn loạn. Quá trình chọn ra nhạc trưởng và ghi chép lại chính xác bản nhạc mà mọi người phải chơi được gọi là **Bài toán Đồng thuận Phân tán (Distributed Consensus)**.

Đối với một Kỹ sư Dữ liệu Cấp cao (Staff Data Engineer), việc hiểu rõ sự khác biệt giữa Raft và Paxos không phải để đi phỏng vấn, mà để biết cách cấu hình, xử lý sự cố (troubleshooting) và phục hồi thảm họa (Disaster Recovery) khi cụm broker Kafka của công ty đột nhiên "treo" không rõ nguyên nhân.

## 1. Nền Tảng Lý Thuyết: FLP Impossibility

Năm 1985, Fischer, Lynch, và Paterson đã chứng minh một định lý chấn động: **Định lý FLP (FLP Impossibility)**.
Nó phát biểu rằng: Trong một môi trường mạng bất đồng bộ (Asynchronous network - nơi thông điệp có thể bị trễ không đoán trước được), **không có bất kỳ thuật toán đồng thuận nào** có thể đảm bảo cả hai yếu tố sau nếu có dù chỉ 1 node bị chết (Crash):
- **Safety (An toàn):** Hệ thống không bao giờ đồng thuận ra 2 kết quả trái ngược nhau (tránh Split-brain).
- **Liveness (Sống sót):** Hệ thống chắc chắn sẽ hoàn tất việc đưa ra quyết định sau một khoảng thời gian hữu hạn.

Vì định lý FLP, cả Paxos và Raft đều chọn **đánh đổi Liveness để bảo vệ Safety**. Nghĩa là: Trong tình huống mạng tồi tệ (bão mạng - network partition), cụm Raft thà "đóng băng" (treo, không phản hồi - unavailability) chứ tuyệt đối không ghi sai dữ liệu.

## 2. Paxos: Đỉnh Cao Hàn Lâm

Do Leslie Lamport sáng tạo (1989), Paxos là thuật toán đầu tiên vượt qua được môi trường bất đồng bộ để đảm bảo Safety. 
- Cơ chế của nó liên quan đến việc các node đóng nhiều vai trò (Proposer, Acceptor, Learner) và tương tác qua 2 pha bắt tay (Prepare/Promise, Accept/Accepted).
- **Hạn chế kỹ thuật:** Paxos gốc (Basic Paxos) chỉ đồng thuận được *một giá trị duy nhất*. Để tạo ra một chuỗi log dữ liệu dài (Log Replication), ta cần **Multi-Paxos**. Lamport không hướng dẫn chi tiết cách viết Multi-Paxos, khiến các kỹ sư tại Google (Spanner, Chubby) hay AWS (Dynamo) phải tự "chế" ra hàng tá biến thể phức tạp, dẫn đến hệ thống cực kỳ khó maintain.

## 3. Raft: Chế Ngự Sự Phức Tạp (Understandability)

Năm 2014, Diego Ongaro và John Ousterhout tạo ra **Raft** với mục tiêu kỹ thuật rõ ràng: Tạo ra một thuật toán đồng thuận dễ hiểu và dễ lập trình nhưng an toàn tương đương Paxos. Thay vì để các node ngang hàng nhau đàm phán, Raft chia nhỏ bài toán bằng thiết chế **"Strong Leader" (Lãnh đạo độc tài)**.

Raft bao gồm 3 thành phần lõi: Leader Election, Log Replication, và Safety.

### 3.1. Bầu Cử Nhạc Trưởng (Leader Election)
Mọi node trong Raft chỉ nằm ở 1 trong 3 trạng thái: `Follower`, `Candidate`, hoặc `Leader`.

```mermaid
stateDiagram-v2["*"] --> Follower
    Follower --> Candidate : Không nhận được Heartbeat\n("Election Timeout ngẫu nhiên")
    Candidate --> Candidate : Bầu cử thất bại("Split Vote"),\ntăng Term và thử lại
    Candidate --> Leader : Nhận được Quorum đa số phiếu
    Candidate --> Follower : Phát hiện Leader hợp lệ ở Term cao hơn
    Leader --> Follower : Bị đứt mạng, phát hiện\nTerm của node khác cao hơn
```

- **Randomized Timeout:** Đây là sự xuất sắc của Raft. Để tránh việc nhiều node cùng nổi dậy tranh cử một lúc (gây ra Split Vote - hòa phiếu), Raft gán cho mỗi node một bộ đếm lùi ngẫu nhiên (VD: 150ms - 300ms). Node nào đếm về 0 trước sẽ trở thành Candidate và xin phiếu.
- **Term (Nhiệm kỳ):** Hoạt động như một đồng hồ logic (Logical clock). Mỗi lần bầu cử là một Term mới.

### 3.2. Sao Chép Log (Log Replication)
Chỉ Leader mới có quyền tương tác với Client.
1. Leader nhận data từ Client, ghi vào local log (nhưng chưa Commit).
2. Leader gửi bản tin `AppendEntries` kèm data tới toàn bộ Follower.
3. Khi hơn một nửa (`N/2 + 1`) Follower trả về xác nhận `ACK`.
4. Leader chính thức `Commit` data đó, apply vào State Machine, và trả kết quả cho Client. 

### 3.3. Xử Lý Sự Cố Khét Tiếng: Partitioned Candidate (Pre-Vote Phase)

Đây là vấn đề đau đầu nhất của Raft gốc mà Staff Engineer phải cấu hình fix lỗi:
Tưởng tượng cụm 5 node, node 5 bị đứt cáp mạng, rớt khỏi cụm. Node 5 không nhận được heartbeat từ Leader, nên nó tự động tăng Term (nhiệm kỳ) và liên tục kêu gọi bầu cử. Vài ngày sau, nó đạt đến Term = 9999.
Khi cáp mạng sửa xong, node 5 nối lại cụm. Cụm gốc đang có Leader ổn định ở Term = 10. Nhưng theo luật của Raft: *Node thấy Term to hơn phải hạ cấp (step down)*. Leader lập tức từ chức, cụm bị treo, và buộc phải bầu lại node 5 làm Leader mới, dù node 5 đang mang dữ liệu cũ rích.

**Cách Fix bằng Kiến trúc (Pre-Vote):**
Các hệ thống như Zookeeper hay KRaft tích hợp cơ chế **Pre-Vote**. Trước khi node 5 tăng Term, nó phải gửi một bản tin "thăm dò" (Pre-Vote). Vì mạng bị đứt, nó không nhận đủ số phiếu phản hồi, nên nó không bao giờ được phép tăng Term gốc. Hệ thống an toàn tuyệt đối.

## 4. Thực Chiến: Kafka Chuyển Từ Zookeeper Sang KRaft (KIP-500)

Ví dụ điển hình nhất của Raft trong Big Data là sự chuyển mình của Apache Kafka.
- **Trước kia:** Kafka dựa vào Zookeeper (dùng thuật toán ZAB - một biến thể của Paxos) để quản lý metadata. Zookeeper là nút thắt cổ chai, khiến Kafka bị kẹt khi tạo quá nhiều Partitions (giới hạn ~200,000 partitions).
- **Hiện nay (KRaft):** Kafka nhúng thuật toán Raft trực tiếp vào lõi (Kafka Raft Metadata). Broker tự tổ chức bầu cử Leader, truyền tải metadata qua event-log. Hệ thống nhẹ hơn, phục hồi lỗi siêu nhanh, scale lên hàng triệu partitions.

## 5. Tổng Kết Đánh Đổi

| Thuộc tính | Paxos (Spanner, Cassandra) | Raft (Kafka, etcd, Consul) |
| :--- | :--- | :--- |
| **Tính Leader** | Multi-Leader hoặc ngầm định. Mọi node đều có thể đề xuất (Propose). | Cực đoan (Strong Leader). Mọi luồng write phải qua Leader. |
| **Bảo trì / Debug** | Khó. Bắt buộc phải có đội ngũ Staff/Principal Eng để debug. | Dễ. Log tuyến tính, trạng thái rõ ràng, thư viện chuẩn hóa ở mọi ngôn ngữ. |
| **Hiệu Năng (Write)**| Cao nhưng phức tạp khi đồng bộ chéo. | Có thể bị thắt cổ chai tại Leader (Leader Bottleneck) do nó gánh toàn bộ disk I/O & Network out. |

## Nguồn Tham Khảo (References)
- [In Search of an Understandable Consensus Algorithm (Raft) - Diego Ongaro, John Ousterhout](https://raft.github.io/raft.pdf)
- [The Part-Time Parliament (Original Paxos) - Leslie Lamport](https://lamport.azurewebsites.net/pubs/lamport-paxos.pdf)
- [Kafka KIP-500: Replace ZooKeeper with a Self-Managed Metadata Quorum](https://cwiki.apache.org/confluence/display/KAFKA/KIP-500)
- [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
