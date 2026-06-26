const fs = require('fs');
const path = require('path');

const data = {
  "concepts/4-compute-engines-batch/apache-spark.md": "Apache Spark là engine xử lý dữ liệu phân tán (Distributed Processing Engine) phổ biến nhất thế giới. Với khả năng tính toán In-Memory (trên RAM), Spark nhanh hơn Hadoop MapReduce hàng trăm lần, hỗ trợ đa ngôn ngữ (Python, Scala, SQL) và là nền tảng cốt lõi của Databricks.",
  "concepts/4-compute-engines-batch/batch-processing.md": "Batch Processing (Xử lý theo lô) là mô hình xử lý dữ liệu theo từng cục lớn theo chu kỳ (ví dụ: chạy ETL mỗi đêm). Mặc dù có độ trễ cao (High Latency) từ vài giờ đến vài ngày, Batch Processing có chi phí vận hành rẻ, dễ debug và vẫn chiếm 80% workload của Data Engineering.",
  "concepts/4-compute-engines-batch/data-skew.md": "Data Skew (Lệch dữ liệu) là cơn ác mộng lớn nhất trong xử lý phân tán, xảy ra khi một Node/Partition phải xử lý 90% lượng dữ liệu trong khi các Node khác ngồi chơi. Cách giải quyết phổ biến là dùng kỹ thuật Salting (thêm muối) để băm ngẫu nhiên các key bị lệch.",
  "concepts/4-compute-engines-batch/distributed-joins-mechanisms.md": "Trong hệ thống phân tán, có 3 cơ chế Join phổ biến: Broadcast Hash Join (copy bảng nhỏ đi mọi node, cực nhanh), Sort Merge Join (sắp xếp rồi trộn bảng lớn, phổ biến nhất), và Shuffle Hash Join (chỉ dùng khi bộ nhớ đủ lớn để băm key).",
  "concepts/4-compute-engines-batch/distributed-processing.md": "Distributed Processing (Xử lý phân tán) là mô hình chia nhỏ một công việc khổng lồ ra cho nhiều máy tính (Nodes) cùng xử lý song song thay vì dùng một siêu máy tính đắt tiền. Nguyên lý cốt lõi của nó là Map (chia để trị) và Reduce (tổng hợp kết quả).",
  "concepts/4-compute-engines-batch/mpp-architecture-dremel.md": "MPP (Massively Parallel Processing) là kiến trúc xử lý song song quy mô lớn, trong đó mỗi Node có CPU và RAM riêng biệt (Shared-nothing). Dremel là engine MPP do Google tạo ra, đặt nền móng cho BigQuery, hỗ trợ xử lý hàng Petabyte bằng cách chia truy vấn thành một cây thực thi khổng lồ.",
  "concepts/4-compute-engines-batch/shuffle.md": "Shuffle (Trộn dữ liệu) là quá trình đắt đỏ nhất trong Spark, xảy ra khi dữ liệu phải di chuyển chéo qua lại giữa các Node trong mạng (ví dụ khi gọi hàm GROUP BY hoặc JOIN). Tối ưu hóa Spark thường xoay quanh việc hạn chế tối đa số lượng bước Shuffle.",
  "concepts/4-compute-engines-batch/spark-catalyst-optimizer.md": "Catalyst Optimizer là bộ não SQL của Spark, chịu trách nhiệm biến câu lệnh SQL hoặc DataFrame API của người dùng thành Kế hoạch thực thi vật lý (Physical Plan) tối ưu nhất thông qua các quy tắc Rule-based và Cost-based (CBO).",
  "concepts/4-compute-engines-batch/spark-execution-model.md": "Mô hình thực thi của Spark gồm 1 Driver (nhạc trưởng) và nhiều Executors (nhạc công). Driver phân tích code và tạo DAG (Directed Acyclic Graph), sau đó chia nhỏ thành các Tasks và gửi xuống cho Executors chạy trực tiếp trên các phân vùng dữ liệu (Partitions).",
  "concepts/4-compute-engines-batch/spark-jobs-stages-tasks.md": "Trong Spark, một lệnh Action (như .show() hay .write()) sẽ kích hoạt 1 Job. Mỗi Job bị chặt đứt thành nhiều Stages tại các điểm Shuffle (ví dụ: GROUP BY). Cuối cùng, mỗi Stage được chia thành hàng ngàn Tasks nhỏ để chạy song song trên các vCPU của Executors.",
  "concepts/4-compute-engines-batch/spark-joins.md": "Spark Joins là thao tác nối hai hoặc nhiều DataFrames lại với nhau. Việc chọn đúng thuật toán Join (Broadcast vs Sort-Merge) là kỹ năng bắt buộc để tránh lỗi Out Of Memory (OOM) khi xử lý các bảng dữ liệu hàng Terabyte.",
  "concepts/4-compute-engines-batch/spark-partition.md": "Partition là đơn vị chia nhỏ dữ liệu cơ bản nhất trong Spark. Số lượng Task chạy song song luôn bằng số lượng Partitions. Điều chỉnh số lượng Partition (thông qua repartition() hoặc coalesce()) là nghệ thuật để tối ưu hóa hiệu năng và tránh kẹt cổ chai (bottleneck).",
  "concepts/4-compute-engines-batch/spark-sql.md": "Spark SQL là module mạnh mẽ nhất của Spark, cho phép xử lý dữ liệu cấu trúc (Structured Data) bằng ngôn ngữ SQL tiêu chuẩn. Nó không chỉ dễ dùng mà còn chạy nhanh hơn RDD thuần túy nhờ sự can thiệp của Catalyst Optimizer và Tungsten Engine.",
  "concepts/4-compute-engines-batch/spark-tungsten-engine.md": "Tungsten Engine là cỗ máy quản lý bộ nhớ ở cấp độ phần cứng (Hardware-level) của Spark. Nó vượt qua giới hạn rác (Garbage Collection) của Java/Scala bằng cách tự động quản lý bộ nhớ Off-heap và sinh code máy trực tiếp (Whole-Stage Code Generation), giúp tối đa hóa hiệu năng CPU.",
  
  "concepts/5-stream-processing-realtime/apache-kafka.md": "Apache Kafka là hệ thống xương sống (Backbone) phân tán, đóng vai trò như một bộ đệm siêu tốc (High-throughput Message Broker) cho hệ thống Streaming. Nó tách biệt hoàn toàn Producer (kẻ sản xuất log) và Consumer (kẻ tiêu thụ log), đảm bảo dữ liệu không bị mất ngay cả khi hệ thống sập.",
  "concepts/5-stream-processing-realtime/chandy-lamport-checkpointing.md": "Chandy-Lamport là thuật toán cốt lõi đằng sau cơ chế Checkpoint của Apache Flink. Nó cho phép hệ thống phân tán chụp ảnh lại toàn bộ trạng thái (State Snapshot) một cách nhất quán (Consistent) mà không cần phải dừng luồng dữ liệu đang chảy.",
  "concepts/5-stream-processing-realtime/consumer-groups.md": "Consumer Group trong Kafka cho phép nhiều Consumers (server tiêu thụ) cùng hợp tác đọc dữ liệu từ một Topic. Mỗi Partition trong Topic chỉ được giao cho duy nhất 1 Consumer trong Group để đảm bảo tính thứ tự (Ordering) và cân bằng tải (Load Balancing).",
  "concepts/5-stream-processing-realtime/event-time-processing-time.md": "Event Time là thời điểm sự kiện thực sự xảy ra ở Client (VD: Khách bấm nút lúc 12:00), còn Processing Time là thời điểm Server nhận được dữ liệu (VD: Server nhận lúc 12:05 do nghẽn mạng). Streaming Engine hiện đại phải xử lý logic dựa trên Event Time để báo cáo chính xác.",
  "concepts/5-stream-processing-realtime/exactly-once-semantics.md": "Exactly-Once Semantics (EOS) là chén thánh của Streaming. Dù máy chủ sập, mạng rớt hay khởi động lại, EOS đảm bảo mỗi tin nhắn (Message) chỉ được xử lý đúng một lần duy nhất, ngăn ngừa việc tính tiền 2 lần trong các hệ thống tài chính.",
  "concepts/5-stream-processing-realtime/kafka-topics-partitions.md": "Topic là một danh mục logic trong Kafka (VD: 'ClickLogs'). Mỗi Topic được chia nhỏ thành nhiều Partitions (phân vùng vật lý) nằm rải rác trên các Server khác nhau. Càng nhiều Partitions, Topic càng có khả năng mở rộng (Scale) để phục vụ hàng triệu tin nhắn mỗi giây.",
  "concepts/5-stream-processing-realtime/stream-table-duality.md": "Tính lưỡng cực Stream-Table khẳng định rằng: Một Stream (dòng chảy sự kiện) có thể được tổng hợp thành một Table (Bảng trạng thái hiện tại), và ngược lại, mọi sự thay đổi trên Table (Change Data Capture) có thể phát ra thành một Stream. Đây là triết lý nền tảng của Kafka Streams.",
  "concepts/5-stream-processing-realtime/streaming-processing.md": "Streaming Processing (Xử lý luồng) là mô hình tính toán liên tục, phản hồi lại dữ liệu ngay tại khoảnh khắc nó được sinh ra (Độ trễ mili-giây). Khác với Batch Processing, Streaming không có điểm kết thúc (Unbounded Data) và cực kỳ quan trọng cho các ứng dụng như Chống gian lận (Fraud Detection).",
  "concepts/5-stream-processing-realtime/watermark.md": "Watermark (Dấu triều cường) là cơ chế để Streaming Engine xử lý Late Data (Dữ liệu đến muộn do trễ mạng). Nó là một chiếc đồng hồ logic: 'Nếu Watermark là 12:05, tôi tuyên bố sẽ không còn sự kiện nào của 12:00 đến nữa, tôi sẽ chốt sổ và đóng Window lại'.",
  "concepts/5-stream-processing-realtime/windowing.md": "Windowing là kỹ thuật cắt luồng dữ liệu vô tận (Unbounded Stream) thành những khối thời gian hữu hạn (Finite Windows) để tính toán (VD: Doanh thu mỗi 5 phút). Có nhiều loại Window như Tumbling (cố định, không chồng lấp), Hopping (chồng lấp), và Session (dựa trên hoạt động của User).",
  "concepts/5-stream-processing-realtime/zero-copy-principle.md": "Zero-Copy là nguyên lý giúp Kafka đạt tốc độ đọc ghi đáng sợ. Thay vì copy dữ liệu từ ổ cứng -> RAM -> App Buffer -> Socket (tốn 4 lần copy), Zero-Copy chỉ đạo Hệ điều hành copy thẳng từ Ổ cứng -> Card Mạng, loại bỏ hoàn toàn cổ chai về I/O Memory."
};

const docsDir = path.join(__dirname, '../src/content/docs');
let count = 0;
for (const [relPath, content] of Object.entries(data)) {
  const fullPath = path.join(docsDir, relPath);
  if (fs.existsSync(fullPath)) {
    const original = fs.readFileSync(fullPath, 'utf-8');
    const match = original.match(/^(---\n[\s\S]*?\n---\n)/);
    if (match) {
      const frontmatter = match[1];
      const references = original.includes('## Tài Liệu Tham Khảo') 
                         ? original.substring(original.indexOf('## Tài Liệu Tham Khảo'))
                         : '## Tài Liệu Tham Khảo\n* [Designing Data-Intensive Applications](https://dataintensive.net/)\n* [Kafka: The Definitive Guide](https://www.confluent.io/resources/kafka-the-definitive-guide/)\n* [Spark: The Definitive Guide](https://github.com/databricks/Spark-The-Definitive-Guide)';
      const newFileContent = `${frontmatter}\n${content}\n\n${references}`;
      fs.writeFileSync(fullPath, newFileContent, 'utf-8');
      count++;
    }
  }
}
console.log(`Updated ${count} files in batch 2.`);
