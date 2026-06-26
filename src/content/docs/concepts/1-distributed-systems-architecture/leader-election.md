---
title: "Bầu chọn Leader (Leader Election)"
difficulty: "Advanced"
readingTime: "15 mins"
lastUpdated: "2026-06-26"
seoTitle: "Leader Election (Raft/ZAB) - Giải phẫu sự cố Split-Brain & Fencing Tokens"
metaDescription: "Phân tích sâu về Consensus, Raft, ZAB, các sự cố Split-brain do GC Pauses, Network Partitions và cách khắc phục triệt để bằng Fencing Tokens."
description: "Tại sao hệ thống phân tán cần Leader? Cách Raft hoạt động. Các sự cố sập hệ thống (Split-brain, GC Pauses) và Fencing Tokens để bảo vệ dữ liệu."
---

Trong hệ thống phân tán, khi hàng chục node cùng chia sẻ chung một tài nguyên (ví dụ: cùng ghi vào một file, hoặc cùng làm Controller phân bổ nhiệm vụ), hệ thống sẽ rơi vào hỗn loạn. Cơ chế **Leader Election (Bầu Cử Thủ Lĩnh)** đảm bảo tại một thời điểm, chỉ duy nhất **một node** (Leader/Master) có quyền ra quyết định, các node còn lại (Followers/Standby) sẽ phục tùng và đồng bộ trạng thái.

Dưới góc độ Staff Engineer, bầu cử không đơn giản là gọi API `lock()` vào Redis. Đó là một bài toán hóc búa về **Consensus (Sự đồng thuận)**, liên quan đến tính đúng đắn của dữ liệu (Safety) và tính sẵn sàng của hệ thống (Liveness).

## 1. Physical Execution: Thuật Toán Raft & Quorum

Các hệ thống chuẩn mực (Kubernetes dùng `etcd`, Kafka cũ dùng `Zookeeper`, Kafka mới dùng `KRaft`, HashiCorp Consul) đều dựa trên các thuật toán đồng thuận như **Raft** hoặc **ZAB**.

### Quorum (Đa số) là nguyên tắc cốt lõi
Để trở thành Leader, một node phải thu thập được phiếu bầu từ một **Quorum (Đa số)**, công thức là $\lfloor \frac{N}{2} \rfloor + 1$. 
- Với cụm 3 nodes, Quorum = 2. Chịu được 1 node chết.
- Với cụm 5 nodes, Quorum = 3. Chịu được 2 node chết.
- *Trade-off:* Không bao giờ triển khai cụm số chẵn (VD: 4 nodes), vì để đạt Quorum là 3, hệ thống cũng chỉ chịu được 1 node chết, y hệt cụm 3 nodes nhưng tốn chi phí hơn và dễ gặp **Split Vote** (2 người cùng được 2 phiếu).

### Vòng đời của Raft (Mermaid Diagram)

```mermaid
stateDiagram-v2["*"] --> Follower
    Follower --> Candidate : Election Timeout("Không nhận được Heartbeat")
    Candidate --> Candidate : Split Vote("Hết giờ, bầu lại")
    Candidate --> Leader : Nhận được phiếu từ Đa số (Quorum)
    Leader --> Follower : Phát hiện node khác có Term cao hơn
    Candidate --> Follower : Node khác đã làm Leader
```

## 2. Operational Risks & Những Thảm Họa (Incidents) Thực Tế

Nhiều hệ thống tự chế (Home-grown) sử dụng Redis (Redlock) hoặc Database để tự làm Leader Election và kết cục thường là thảm họa khi gặp các "kẻ thù vật lý".

### Kẻ thù số 1: Network Partitions gây Split-Brain
Nếu cụm 5 nodes bị đứt cáp chia thành 2 phe (Phe A có 2 nodes, Phe B có 3 nodes).
- Phe A (Leader cũ ở đây): Bị cắt mạng, không liên lạc được Phe B. Mất Quorum -> Leader cũ tự động từ chức (Stepping down).
- Phe B (3 nodes): Thấy Leader cũ mất tích, bầu ra Leader mới (đạt đủ Quorum 3 phiếu). Hệ thống vẫn sống sót an toàn.
- Nếu không có Quorum (ví dụ dùng cấu hình Active-Active lỏng lẻo), cả 2 phe sẽ đều tưởng đối phương chết và tự xưng là Leader, dẫn đến **Split-Brain (Phân mảnh não)**. Cả 2 cùng ghi dữ liệu độc lập, phá nát tính toàn vẹn (Data Corruption). Vụ sập mạng lịch sử của GitHub năm 2012 cũng bắt nguồn một phần từ cấu hình Split-Brain trong MySQL HA.

### Kẻ thù số 2: Stop-The-World GC Pauses (Tạm dừng gom rác)
Đồng hồ thời gian (Wall-clock) trong hệ thống phân tán là một lời nói dối. 
Hãy tưởng tượng Node A đang làm Leader. Một đợt dọn rác bộ nhớ (GC Pause) của Java/Go xảy ra, đóng băng toàn bộ tiến trình của Node A trong 15 giây.
1. Node B và C không nhận được Heartbeat từ A -> Tưởng A đã chết -> Bầu B lên làm Leader mới.
2. GC Pause kết thúc, Node A "tỉnh lại". Nó không hề biết 15 giây đã trôi qua. Nó vẫn cầm trong tay trạng thái cũ và cố gắng đẩy dữ liệu xuống Storage (Database/S3).
3. Hậu quả: Dữ liệu bị ghi đè, hỏng hóc nghiêm trọng.

## 3. The Ultimate Fix: Fencing Tokens (Hàng Rào Bảo Vệ)

Để chặn đứng "Zombie Leader" (Node A sau khi tỉnh dậy), tầng Storage/Database phải tham gia vào việc bảo vệ tính đúng đắn. Giải pháp là **Fencing Tokens** (hoặc Epoch Numbers).

Cơ chế hoạt động:
1. Mỗi khi bầu Leader mới, hệ thống cấp một mã Token (số nguyên đơn điệu tăng).
   - Node A làm Leader: Token = 33
   - Node B được bầu làm Leader mới: Token = 34
2. Bất kỳ lệnh Ghi (Write) nào xuống Storage cũng **bắt buộc** đính kèm Token này.
3. Khi Node A tỉnh dậy từ GC Pause, nó cố ghi dữ liệu với `Token=33`. Tầng Storage phát hiện ra nó đã phục vụ `Token=34` trước đó, lập tức **Từ chối (Reject)** giao dịch của Node A với lỗi `StaleTokenException`.

```sql
-- Logical representation of Fencing at Storage Layer (PostgreSQL)
UPDATE my_resource 
SET data = 'new_value', current_token = 34
WHERE id = 1 
  -- Điều kiện tối quan trọng: Chỉ cho phép ghi nếu Token cung cấp >= Token hiện tại
  AND current_token <= 34;
```

## 4. Tuning etcd cho Leader Election (Config Mẫu)

Trong thực tế với etcd (trái tim của Kubernetes), việc tinh chỉnh Election Timeout là bài toán đánh đổi (Trade-off):
- Timeout quá thấp: Hệ thống phản ứng lẹ (Fast Failover), nhưng chập chờn mạng chút xíu là đòi bầu lại, gây flap toàn hệ thống.
- Timeout quá cao: Khi Leader sập thật, hệ thống bị đóng băng (Downtime) quá lâu chờ bầu chọn.

```bash
# etcd.conf - Dành cho mạng cloud nội bộ có ping < 1ms
# Heartbeat interval: 100ms
ETCD_HEARTBEAT_INTERVAL=100
# Election timeout = 5 đến 10 lần Heartbeat interval (500ms - 1000ms) để an toàn
ETCD_ELECTION_TIMEOUT=1000
```

## Nguồn Tham Khảo (References)

* [Designing Data-Intensive Applications - Martin Kleppmann (Chapter 8 & 9)](https://dataintensive.net/)
* [In Search of an Understandable Consensus Algorithm (Raft Paper)](https://raft.github.io/raft.pdf)
* [How to do distributed locking - Martin Kleppmann (Redlock Critique)](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
* [KIP-500: Replace ZooKeeper with a Self-Managed Metadata Quorum (KRaft)](https://cwiki.apache.org/confluence/display/KAFKA/KIP-500%3A+Replace+ZooKeeper+with+a+Self-Managed+Metadata+Quorum)
