---
title: "Kafka Topics và Partitions"
difficulty: "Intermediate"
tags: ["kafka-topics", "kafka-partitions", "apache-kafka", "parallelism"]
readingTime: "10 mins"
lastUpdated: 2026-06-07
seoTitle: "Topics và Partitions trong Kafka: Cơ chế song song hóa"
metaDescription: "Hiểu rõ cấu trúc dữ liệu của Apache Kafka: Topic là gì, tại sao việc chia Partition lại là chìa khóa sống còn tạo nên thông lượng khổng lồ cho Kafka."
description: "Khi xây dựng các hệ thống xử lý dữ liệu thời gian thực (Real-time Streaming) ở quy mô lớn, Apache Kafka luôn là cái tên được nhắc đến đầu tiên. Sự mạn..."
---



Khi xây dựng các hệ thống xử lý dữ liệu thời gian thực (Real-time Streaming) ở quy mô lớn, Apache Kafka luôn là cái tên được nhắc đến đầu tiên. Sự mạnh mẽ của Kafka không chỉ đến từ việc nó lưu trữ dữ liệu dưới dạng log (append-only) mà còn từ cách nó chia nhỏ và tổ chức dữ liệu một cách tối ưu. Cốt lõi của kiến trúc này nằm ở hai khái niệm nền tảng: **Topic** và **Partition**.

Trong bài viết này, chúng ta sẽ đi sâu vào việc tìm hiểu Topic và Partition là gì, cách chúng hoạt động, và tại sao Partition lại là "chìa khóa vàng" giúp Kafka có thể mở rộng (scale) để xử lý hàng triệu tin nhắn mỗi giây.

---

## 1. Topic: Danh mục logic của luồng dữ liệu

Trong thế giới của Kafka, **Topic** là cách cơ bản nhất để phân loại và tổ chức các thông điệp (messages/records).

Hãy tưởng tượng bạn đang quản lý một tờ báo lớn. Tờ báo này có các chuyên mục như "Thể thao", "Kinh tế", "Công nghệ". Người đọc quan tâm đến lĩnh vực nào thì sẽ tìm đến chuyên mục đó. Topic trong Kafka cũng tương tự như vậy:

- **Định nghĩa**: Topic là một "ngăn chứa" logic (logical category/feed name) mà các hệ thống sản xuất dữ liệu (Producer) gửi thông điệp vào, và các hệ thống tiêu thụ dữ liệu (Consumer) sẽ đăng ký để đọc từ đó.
- **Tương đồng**: Nếu bạn quen thuộc với các Hệ quản trị Cơ sở dữ liệu (RDBMS), bạn có thể coi Topic giống như một "Bảng" (Table). Nếu bạn quen thuộc với hệ thống File, Topic giống như một "Thư mục" (Directory).
- **Multi-subscriber**: Một điểm đặc biệt của Kafka là các Topic có tính chất *multi-subscriber*. Tức là, một Topic có thể có 0, 1 hoặc nhiều nhóm Consumer khác nhau cùng đọc dữ liệu tại các điểm (offset) khác nhau mà không can thiệp vào nhau.
- **Lưu trữ lâu dài (Retention)**: Khác với các hệ thống Message Queue truyền thống (như RabbitMQ sẽ xóa tin nhắn ngay khi đọc xong), dữ liệu trong Kafka Topic được giữ lại trong một khoảng thời gian cấu hình trước (ví dụ: 7 ngày) hoặc dựa trên dung lượng tối đa, bất kể dữ liệu đã được đọc hay chưa.

Mặc dù Topic là khái niệm chúng ta giao tiếp trực tiếp trên tầng ứng dụng, nhưng ở tầng vật lý, Kafka không lưu toàn bộ dữ liệu của một Topic vào một file hay một máy chủ duy nhất. Đó là lúc **Partition** xuất hiện.

---

## 2. Partition: Trái tim của sự song song và khả năng mở rộng

Nếu một Topic có hàng triệu tin nhắn được gửi đến mỗi giây, việc lưu trữ và xử lý tất cả trên một máy chủ (Broker) duy nhất sẽ nhanh chóng tạo ra "nút thắt cổ chai" (bottleneck) về cả mạng, CPU và ổ cứng. Để giải quyết vấn đề này, Kafka chia nhỏ Topic thành nhiều **Partition** (phân vùng vật lý).

### Bản chất của Partition
Mỗi Topic bao gồm một hoặc nhiều Partition. Một Partition là một chuỗi các bản ghi không thể bị thay đổi (immutable) và có thứ tự (ordered). Các bản ghi mới gửi vào Partition sẽ luôn được nối thêm vào cuối (append-only).

- Mỗi tin nhắn khi được đẩy vào một Partition sẽ được gán cho một ID định danh duy nhất gọi là **Offset** (số thứ tự). Offset là một số nguyên tăng dần bắt đầu từ 0.
- Offset chỉ có ý nghĩa **trong phạm vi một Partition**. Tức là, tin nhắn có Offset=5 ở Partition 0 và Offset=5 ở Partition 1 là hai tin nhắn hoàn toàn khác nhau.
- **Đảm bảo thứ tự (Ordering Guarantee)**: Kafka chỉ đảm bảo thứ tự của các tin nhắn *bên trong cùng một Partition*. Không có sự đảm bảo thứ tự toàn cục (global ordering) trên toàn bộ Topic nếu Topic đó có nhiều hơn 1 Partition.

### Tại sao Partition lại quan trọng đến vậy?

1. **Khả năng mở rộng ngang (Horizontal Scalability)**: Các Partition của một Topic không bắt buộc phải nằm trên cùng một Broker. Chúng có thể được phân tán ra nhiều Broker (máy chủ) khác nhau trong cụm Kafka Cluster. Điều này cho phép một Topic có thể lưu trữ lượng dữ liệu vượt quá khả năng của bất kỳ một máy chủ đơn lẻ nào.
2. **Thông lượng song song (Parallel Throughput)**: Vì dữ liệu nằm rải rác trên nhiều máy chủ, nhiều Producer có thể cùng lúc ghi dữ liệu vào các Partition khác nhau. Tương tự, nhiều Consumer có thể cùng lúc đọc dữ liệu từ các Partition khác nhau, nâng thông lượng (throughput) lên mức khổng lồ.

---

## 3. Producer chọn Partition như thế nào? (Partitioning Strategies)

Khi một hệ thống (Producer) gửi một tin nhắn vào một Topic có nhiều Partition, làm sao nó biết nên đẩy tin nhắn đó vào Partition nào? Kafka cung cấp các chiến lược (strategies) sau:

### 3.1. Phân bổ đều (Round-Robin / Default)
Nếu Producer gửi tin nhắn mà **không cung cấp Khóa (Key == null)**, Kafka sẽ mặc định sử dụng chiến lược Round-Robin (hoặc Sticky Partitioner trong các phiên bản mới) để phân phối tin nhắn đều đặn (load balance) đập vào tất cả các Partition.
- **Ưu điểm**: Phân bổ tải cực kỳ đều đặn. Không có Partition nào bị quá tải.
- **Nhược điểm**: Bỏ qua hoàn toàn tính thứ tự. Dữ liệu của cùng một đối tượng (ví dụ: các sự kiện click của cùng một User) sẽ bị rải rác ở khắp các Partition và khi Consumer đọc, thứ tự các sự kiện này sẽ bị xáo trộn.

### 3.2. Phân vùng dựa trên Khóa (Key-based Partitioning / Hashing)
Đây là cách phổ biến nhất trong thực tế. Nếu Producer cung cấp một **Key** (ví dụ: `user_id`, `order_id`, `device_id`), Kafka sẽ lấy mã băm (Hash) của Key này và chia lấy dư cho tổng số Partition:

```text
Partition_Index = Hash(Key) % Number_Of_Partitions
```

- **Đặc tính sống còn**: Tất cả các tin nhắn có **cùng một Key** sẽ *chắc chắn* được đưa vào **cùng một Partition**.
- **Ứng dụng**: Nhờ đặc tính này, Kafka đảm bảo thứ tự tuyến tính cho tất cả dữ liệu của cùng một thực thể (entity). Ví dụ: trạng thái đơn hàng (Tạo -> Thanh toán -> Giao hàng) có key là `order_id` sẽ luôn vào cùng một Partition và Consumer sẽ đọc được chuỗi sự kiện này đúng theo thứ tự thời gian.
- **Lưu ý**: Cần chọn Key sao cho dữ liệu phân bổ đều. Nếu nhiều tin nhắn tập trung vào một số lượng nhỏ các Key phổ biến, hiện tượng **Data Skew** (lệch dữ liệu) sẽ xảy ra, làm một số Partition bị quá tải (Hot Partition).

### 3.3. Tùy chỉnh (Custom Partitioner)
Kafka cho phép lập trình viên tự định nghĩa Logic chọn Partition của riêng mình bằng cách implement interface `Partitioner`. Ví dụ: Đưa toàn bộ các tin nhắn của người dùng "VIP" vào Partition 0 có tài nguyên phần cứng tốt hơn, và các người dùng khác vào các Partition còn lại.

---

## 4. Consumer Groups và Partition: Ràng buộc của sự song song

Nếu Partition quy định mức độ song song ở phía lưu trữ, thì nó cũng quy định giới hạn song song ở phía tiêu thụ (đọc) dữ liệu. Mối quan hệ giữa Partition và các thành viên trong một **Consumer Group** tuân theo một bộ quy tắc rất chặt chẽ:

1. **Quy tắc 1-1**: Bên trong một Consumer Group, mỗi Partition **chỉ có thể** được đọc bởi **tối đa một** Consumer instance tại một thời điểm. Điều này đảm bảo không có hai Consumer nào cùng đọc và xử lý trùng lặp một thông điệp (tránh race-condition và giúp dễ dàng quản lý Offset).
2. **Consumer ít hơn Partition**: Nếu bạn có 4 Partitions nhưng chỉ chạy 2 Consumer instances, mỗi Consumer sẽ chịu trách nhiệm đọc từ 2 Partitions.
3. **Consumer bằng Partition**: Đây là trạng thái lý tưởng nhất. Nếu bạn có 4 Partitions và 4 Consumers, mỗi Consumer sẽ "ôm" trọn 1 Partition. Tối đa hóa hiệu năng song song.
4. **Consumer nhiều hơn Partition**: Nếu bạn có 4 Partitions nhưng lại chạy đến 5 Consumers, Consumer thứ 5 sẽ rơi vào trạng thái **Idle (nhàn rỗi)** hoàn toàn và không được phân công đọc bất cứ Partition nào. Nó chỉ đóng vai trò dự bị nếu 1 trong 4 Consumer kia bị chết.

**=> Kết luận quan trọng:** Số lượng Partition của một Topic chính là **giới hạn trên (Upper Bound)** của mức độ song song hóa phía Consumer. Bạn không thể xử lý nhanh hơn bằng cách tăng thêm Consumer nếu số lượng Consumer đã lớn hơn số lượng Partition.

---

## 5. Cấu trúc vật lý: Bên trong Partition là gì?

Ở góc độ hệ điều hành trên máy chủ Broker, mỗi Partition được biểu diễn dưới dạng một thư mục (Directory). Tên thư mục thường có dạng `topic_name-partition_number` (VD: `click_logs-0`, `click_logs-1`).

Vì một Partition có thể chứa lượng dữ liệu khổng lồ theo thời gian và không thể lưu trên một file vô tận (giới hạn của hệ điều hành và gây khó khăn cho việc dọn dẹp dữ liệu cũ), Kafka tiếp tục chia Partition thành nhiều file nhỏ hơn gọi là **Segments**.

Mỗi Segment bao gồm 3 file chính:
1. **`.log` file**: Chứa nội dung dữ liệu (payload) thực tế của các thông điệp.
2. **`.index` file**: Lưu trữ bản đồ ánh xạ (mapping) giữa Offset và vị trí byte vật lý (physical byte position) trong file `.log`. Giúp Kafka tìm kiếm tin nhắn theo Offset cực kỳ nhanh O(1) hoặc O(log n).
3. **`.timeindex` file**: Ánh xạ giữa Timestamp (thời gian) và Offset. Dùng khi Consumer muốn bắt đầu đọc dữ liệu từ một thời điểm cụ thể trong quá khứ.

Chỉ có Segment cuối cùng (Active Segment) mới được phép ghi thêm dữ liệu. Khi Segment này đạt tới kích thước tối đa (mặc định là 1GB - `segment.bytes`), Kafka sẽ đóng nó lại (chỉ cho phép đọc) và tạo ra một Active Segment mới. Nhờ cơ chế chia Segment, Kafka có thể dễ dàng xóa các file `.log` cũ để giải phóng ổ cứng (Log Retention) khi dữ liệu quá hạn.

---

## 6. Lựa chọn số lượng Partition bao nhiêu là hợp lý?

Đây là một câu hỏi phỏng vấn cực kỳ phổ biến. Nhiều người có xu hướng "tham lam" và tạo ra hàng trăm, hàng ngàn Partition để "phòng ngừa tương lai". Tuy nhiên, đây là một **Anti-pattern**. Việc chọn số lượng Partition đòi hỏi sự cân nhắc tỉ mỉ:

### 6.1. Khi nào nên tăng Partition?
Bạn có thể xác định số lượng Partition cần thiết dựa trên công thức ước lượng thông lượng (Throughput Formula):
- Giả sử **`t`** là thông lượng ghi (Write Throughput) bạn mong muốn (VD: 100 MB/s).
- **`p`** là thông lượng ghi tối đa trên một Partition (bị giới hạn bởi I/O ổ cứng hoặc mạng của 1 Broker, VD: 10 MB/s).
- **`c`** là thông lượng đọc và xử lý tối đa của một Consumer instance (phụ thuộc vào logic xử lý nặng hay nhẹ của ứng dụng bạn viết, VD: 5 MB/s).

=> Số lượng Partition tối thiểu nên là: `Max(t/p, t/c)`.
Trong trường hợp này `t/c = 100 / 5 = 20`. Bạn nên có ít nhất 20 Partitions.

### 6.2. Hậu quả của việc có quá nhiều Partition
Partition không miễn phí. Mỗi Partition đi kèm với một cái giá về tài nguyên:
- **Tốn Open File Handles (File descriptors)**: Mỗi Partition gồm ít nhất 3 file (log, index, timeindex). Hàng vạn Partition trên một Broker có thể làm tràn giới hạn số lượng file được phép mở của hệ điều hành.
- **Tăng độ trễ Unavailability khi Broker sập**: Mỗi Partition có một Replica làm Leader. Nếu Broker chứa hàng ngàn Leader bị sập, Controller của Kafka sẽ phải tốn rất nhiều thời gian (nhiều giây, thậm chí hàng chục giây) để bầu chọn (Leader Election) hàng ngàn Leader mới ở các Broker khác. Trong thời gian này, Topic sẽ không khả dụng. (Mặc dù Kafka KRaft mode đã cải thiện tốc độ bầu chọn này đáng kể so với Zookeeper).
- **Tốn bộ nhớ Client**: Cả Consumer và Producer đều phải phân bổ bộ nhớ đệm (buffer memory) cho mỗi Partition mà chúng tương tác. Quá nhiều Partition gây tràn RAM (OOM) ở phía Client.

### 6.3. Có thể thay đổi số lượng Partition sau khi tạo không?
- **Tăng Partition**: Bạn CÓ THỂ tăng số lượng Partition của một Topic đang chạy bất cứ lúc nào (VD: từ 10 lên 20). **TUY NHIÊN**, nếu bạn sử dụng *Key-based partitioning*, việc tăng Partition sẽ làm thay đổi công thức Hash (`Hash(Key) % Number_Of_Partitions`). Những tin nhắn có cùng một Key trước đây vào Partition 2, nay có thể lọt sang Partition 15. Điều này phá vỡ tính thứ tự (Ordering) nếu Consumer của bạn dựa dẫm vào nó.
- **Giảm Partition**: Kafka **KHÔNG HỖ TRỢ** việc giảm số lượng Partition. Bạn chỉ có cách tạo một Topic mới với số Partition nhỏ hơn, rồi copy dữ liệu từ Topic cũ sang Topic mới.

**Best Practice**: Hãy cố gắng dự phóng số lượng lớn nhất có thể cho 2-3 năm tới (thường nằm ở mức vài chục đến vài trăm Partition, tùy quy mô công ty). Nếu hệ thống thực sự cần scale vượt dự kiến ban đầu, việc tăng Partition và thiết kế lại quy trình xử lý không đồng bộ (như tạo một topic mới chuyển tiếp dữ liệu) là phương án an toàn nhất.

---

## 7. Tổng kết

Topic và Partition là bộ đôi không thể tách rời, định hình nên sức mạnh vô song của Apache Kafka trong mảng Data Streaming. 

- **Topic** cung cấp giao diện logic gọn gàng để chúng ta phân chia và tương tác với dữ liệu. 
- **Partition** chính là cỗ máy "chia để trị" (divide-and-conquer) nằm dưới vỏ bọc, biến Kafka từ một hệ thống hàng đợi đơn lẻ trở thành một kho dữ liệu phân tán có sức bền đáng nể, sẵn sàng co giãn với sự lớn mạnh của doanh nghiệp bạn.

Việc hiểu sâu sắc cơ chế Partitioning, các chiến lược phân bổ dữ liệu và ảnh hưởng của nó đến Consumer Group là nền tảng tối quan trọng cho bất kỳ Data Engineer hay Backend Engineer nào đang xây dựng một kiến trúc hướng sự kiện (Event-driven Architecture).

## Tài Liệu Tham Khảo
* [Apache Kafka Documentation - Topics and Logs](https://kafka.apache.org/documentation/#intro_topics)
* **Streaming Systems: The What, Where, When, and How of Large-Scale Data Processing - Tyler Akidau**
* [Confluent: How to choose the number of topics/partitions in a Kafka cluster?](https://www.confluent.io/blog/how-choose-number-topics-partitions-kafka-cluster/)
* [Kafka: a Distributed Messaging System for Log Processing - LinkedIn (NetDB 2011)](http://notes.stephenholiday.com/Kafka.pdf)
