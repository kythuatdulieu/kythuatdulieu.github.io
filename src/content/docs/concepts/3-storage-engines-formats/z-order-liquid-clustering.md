---
title: "Tối ưu hóa truy vấn: Z-Ordering vs Liquid Clustering"
description: "Chi tiết về kỹ thuật tối ưu hóa dữ liệu đa chiều Z-Ordering và thế hệ tiếp theo Liquid Clustering trong kiến trúc Data Lakehouse."
---



Trong các hệ thống cơ sở dữ liệu truyền thống (RDBMS), chúng ta thường tạo **B-Tree Index** để tăng tốc độ truy vấn. Tuy nhiên, trong kiến trúc Big Data (Data Lake/Lakehouse) lưu trữ dữ liệu dưới dạng các tệp (files) phân tán trên Object Storage (như Amazon S3, ADLS, GCS), việc duy trì Index là bất khả thi hoặc kém hiệu quả.

Để giải quyết bài toán này, các công cụ xử lý dữ liệu lớn như Apache Spark, Presto/Trino sử dụng kỹ thuật **Data Skipping** (Bỏ qua dữ liệu). Quá trình này hoạt động dựa trên việc đọc metadata (min/max statistics của từng cột) ở mức độ tệp (ví dụ Parquet footers) để bỏ qua các tệp chắc chắn không chứa dữ liệu thỏa mãn điều kiện `WHERE`.

Tuy nhiên, Data Skipping chỉ thực sự hiệu quả khi dữ liệu được sắp xếp và gom cụm (clustered) một cách hợp lý. Bài viết này sẽ đi sâu vào hai kỹ thuật tổ chức dữ liệu tiên tiến nhất trong Data Lakehouse: **Z-Ordering** và **Liquid Clustering**.

## 1. Bài Toán Tổ Chức Dữ Liệu Trong Data Lakehouse

Trước khi hiểu Z-Ordering, chúng ta cần xem xét các phương pháp lưu trữ cũ và tại sao chúng thất bại trong môi trường dữ liệu quy mô lớn.

### 1.1. Hive Partitioning (Phân mảnh thư mục)
Đây là cách tổ chức cơ bản và lâu đời nhất. Bạn chia dữ liệu thành các thư mục vật lý theo cột (ví dụ: `year=2023/month=10/day=01/`).
- **Ưu điểm**: Cực kỳ nhanh nếu truy vấn lấy dữ liệu theo đúng cột được partition (hệ thống chỉ cần đọc thẳng vào thư mục đó).
- **Nhược điểm**:
  - **Over-partitioning / Small files problem**: Nếu partition theo một cột có cardinality lớn (như `customer_id`, `order_id` hoặc timestamp), bạn sẽ tạo ra hàng triệu tệp nhỏ. Điều này làm sập Namenode (trong HDFS) hoặc làm chậm quá trình `LIST` danh sách tệp trên S3.
  - **Cứng nhắc**: Dữ liệu chỉ được tối ưu khi truy vấn theo đúng cột được partition. Nếu bạn partition theo `Ngày` nhưng lại truy vấn theo `Thành Phố`, hệ thống sẽ phải đọc toàn bộ dữ liệu.
  - **Data Skew (Lệch dữ liệu)**: Một số partition (ví dụ ngày Siêu Sale) có dung lượng cực lớn, trong khi các ngày khác rất ít, gây mất cân bằng khi thực thi xử lý phân tán.

### 1.2. Linear Sorting (Sắp xếp tuyến tính)
Khi lưu trữ, bạn có thể gom dữ liệu (Sort) theo nhiều cột: `ORDER BY NgayBan, ThanhPho`.
- File 1: `(2023-01-01, Hanoi)`, `(2023-01-01, HCM)`
- File 2: `(2023-01-02, DaNang)`, `(2023-01-02, Hanoi)`

Sắp xếp tuyến tính tạo ra **độ lệch tối ưu (optimization bias)**. Nó sẽ tối ưu cực tốt cho cột đầu tiên (`NgayBan`), gom nhóm dữ liệu của cùng một ngày vào một số ít file. Nhờ vậy `WHERE NgayBan = '2023-01-01'` chạy rất nhanh (Data Skipping hoạt động tốt).

Tuy nhiên, đối với cột thứ hai (`ThanhPho`), dữ liệu của Hà Nội sẽ bị phân tán trên toàn bộ các file của tất cả các ngày. Một truy vấn `WHERE ThanhPho = 'Hanoi'` buộc engine phải mở và đọc hầu hết mọi file, làm mất hoàn toàn tác dụng của Data Skipping đối với các cột phía sau.

## 2. Z-Ordering: Phép Thuật Tối Ưu Hóa Đa Chiều (Multi-Dimensional)

**Z-Ordering** (hay Z-order curve) là giải pháp toán học xuất sắc để giải quyết bài toán "bias" của Linear Sorting. Nó là kỹ thuật ánh xạ không gian đa chiều (nhiều cột) xuống một không gian một chiều duy nhất, đồng thời **bảo tồn được tính cục bộ (data locality)** của tất cả các cột tham gia.

### 2.1. Đường Cong Morton Hoạt Động Như Thế Nào?
Hãy tưởng tượng dữ liệu của bạn có 2 chiều (ví dụ trục X là `NgayBan`, trục Y là `ThanhPho`). Thay vì đi theo từng hàng (quét hết trục X rồi mới xuống trục Y như Linear Sort), thuật toán vẽ một đường cong hình chữ **Z** xuyên qua không gian này, len lỏi qua lại giữa các cụm.

Về mặt kỹ thuật, hệ thống tạo ra một **Z-value (Morton code)** bằng cách "đan xen" (interleave) các bit nhị phân của các giá trị từ từng cột với nhau.
* Ví dụ đơn giản:
  * Giá trị cột X: `3` (nhị phân: `0 1 1`)
  * Giá trị cột Y: `5` (nhị phân: `1 0 1`)
  * Giá trị Z đan xen kết hợp (Y,X): `10 01 11` (nhị phân của `43`).

Việc sắp xếp các bản ghi vào các file vật lý dựa theo `Z-value` đảm bảo rằng: Các bản ghi có giá trị gần nhau trong không gian đa chiều (cùng ngày, hoặc cùng thành phố) sẽ có tỷ lệ cực kỳ cao nằm gần nhau trong danh sách file vật lý.

### 2.2. Lợi Ích Của Z-Ordering Đối Với Data Skipping
Khi bạn chạy lệnh:
```sql
OPTIMIZE table ZORDER BY (NgayBan, ThanhPho)
```
Hệ thống sẽ đọc toàn bộ file cũ và viết lại vào các file Parquet mới tuân theo thứ tự Z-Order. Lúc này, cả hai cột đều được đối xử bình đẳng:
- Khoảng Min/Max của `NgayBan` trong mỗi file sẽ hẹp lại.
- Khoảng Min/Max của `ThanhPho` trong mỗi file cũng sẽ hẹp lại.

Kết quả là: Dù bạn thực hiện truy vấn `WHERE NgayBan = ...` hay `WHERE ThanhPho = ...` (hoặc kết hợp cả hai), Engine đều có khả năng skip được một lượng lớn tệp tin (ví dụ skip 80-90% tổng số file). Tốc độ I/O giảm mạnh, truy vấn chạy nhanh hơn gấp nhiều lần.

### 2.3. Hạn Chế Của Z-Ordering
Dù mạnh mẽ và phổ biến, Z-Ordering mang theo những nhược điểm lớn trong vận hành thực tế:
1. **Phải chạy thủ công**: Dữ liệu mới ghi vào (Ingestion stream) sẽ không tự động được Z-Order. Bạn phải tự thiết lập lịch chạy lệnh `OPTIMIZE` định kỳ (ví dụ mỗi đêm).
2. **Chi phí ghi (Write Amplification) khổng lồ**: Để tính toán đường cong Z toàn cục, Spark buộc phải xáo trộn (shuffle) và viết lại (rewrite) phần lớn dữ liệu. Đối với các bảng có hàng trăm Terabyte, chi phí compute để chạy lệnh này là cực kỳ tốn kém.
3. **Hiệu ứng phân rã (Decay)**: Khi dữ liệu mới liên tục được `INSERT` vào bảng, chúng nằm ngoài cấu trúc Z-Order cũ. Tính ngăn nắp bị "pha loãng", dẫn đến hiệu suất truy vấn sẽ suy giảm (decay) từng ngày cho đến lần chạy `OPTIMIZE` tiếp theo.
4. **Hạn chế số lượng cột**: Chỉ nên Z-Order trên tối đa 3-4 cột có tỷ lệ truy vấn cao nhất. Càng đưa vào nhiều cột, tính "locality" của từng cột càng giảm sút theo quy luật hàm mũ.
5. **Khó thích ứng**: Nếu yêu cầu kinh doanh đổi từ lọc theo `ThanhPho` sang lọc theo `NganhHang`, bạn không có cách nào khác ngoài việc chạy lại lệnh Z-Order toàn bộ dữ liệu lịch sử từ đầu.

## 3. Liquid Clustering: Kỷ Nguyên Mới Của Tối Ưu Hóa

Nhận thấy những "nỗi đau" trong việc duy trì cấu trúc Z-Ordering và Hive Partitioning, Databricks đã ra mắt **Liquid Clustering** cho Delta Lake. Đây được xem là bản nâng cấp toàn diện, sinh ra để thay thế cả hai phương pháp cũ, mang lại một trải nghiệm hoàn toàn "thích ứng" (Adaptive) cho Data Engineer.

### 3.1. Cơ Chế Hoạt Động
Liquid Clustering thay thế hoàn toàn cấu trúc thư mục tĩnh. Nó lưu toàn bộ file vào một không gian phẳng (flat namespace) dưới object storage, và sử dụng thuật toán Clustering nội bộ (được cải tiến từ Z-Order và Hilbert Curve) để tự động nhóm dữ liệu.

Thay vì phải chạy `PARTITIONED BY` lúc tạo bảng, cú pháp mới sẽ là:
```sql
CREATE TABLE sales_table (
  id INT,
  ngay_ban DATE,
  thanh_pho STRING,
  doanh_thu DOUBLE
)
CLUSTER BY (ngay_ban, thanh_pho);
```

### 3.2. Ưu Điểm Vượt Trội Của Liquid Clustering
1. **Tự động và Tăng dần (Incremental)**: Khi bạn `INSERT` dữ liệu mới, hệ thống Liquid sẽ tự động cố gắng gom dữ liệu vào đúng "cụm" ngay lúc ghi. Đặc biệt, lệnh `OPTIMIZE` lúc này hoạt động theo cơ chế *incremental*, tức là nó tự động phát hiện và chỉ tổ chức lại các file chưa được gom cụm tốt. Điều này tốn chi phí compute cực nhỏ so với việc shuffle toàn bộ dữ liệu của Z-Order.
2. **Giải quyết triệt để Data Skew và File Nhỏ**: Liquid tự động cân bằng kích thước của các cụm (auto-balance). Khái niệm thư mục partition cứng nhắc biến mất, do đó bạn không bao giờ còn gặp tình trạng một partition sinh ra 10,000 file nhỏ và một partition khác lại chứa file khổng lồ.
3. **Thích ứng linh hoạt với sự thay đổi (Adaptive)**: Nếu thói quen truy vấn thay đổi, bạn có thể dễ dàng thay đổi cột clustering mà không gây ra thảm họa viết lại dữ liệu:
   ```sql
   ALTER TABLE sales_table CLUSTER BY (ngay_ban, nganh_hang);
   ```
   Sau lệnh này, dữ liệu cũ vẫn giữ nguyên cấu trúc cũ (không bị ép viết lại toàn bộ). Chỉ có dữ liệu mới thêm vào sẽ được tổ chức theo cấu trúc mới. Bạn có thể dần dần re-cluster bảng cũ thông qua các lần chạy `OPTIMIZE` tiếp theo, dàn trải chi phí tối ưu hóa.
4. **Hỗ trợ Cardinality cao**: Hoạt động mượt mà với các cột có độ phân tán dữ liệu rất cao (ví dụ: `customer_id`, timestamp chi tiết đến mili-giây) - những yếu tố vốn dĩ sẽ "bóp chết" Partitioning truyền thống.

## 4. Bảng So Sánh Tổng Hợp

| Đặc Điểm | Hive Partitioning | Z-Ordering | Liquid Clustering |
| :--- | :--- | :--- | :--- |
| **Bản chất tổ chức** | Phân mảnh bằng cây thư mục vật lý | Sắp xếp nhiều chiều trong tệp vật lý | Gom cụm linh hoạt động (Dynamic File Clustering) |
| **Phù hợp với** | Cột có Cardinality thấp (VD: Năm, Tháng, Phân khúc) | Cột có Cardinality cao | Mọi loại cột, mọi Cardinality |
| **Độ phủ tối ưu** | Cứng nhắc (Chỉ tối ưu theo đúng cột phân mảnh) | Tốt (Đồng đều cho nhiều cột) | Rất tốt (Tự động thích ứng nhiều cột) |
| **Vấn đề lệch (Skew)** | Dễ bị lệch dữ liệu, sinh ra nhiều file nhỏ | Giảm thiểu được Skew | Tự động cân bằng cụm dung lượng (Auto-balance) |
| **Bảo trì (Maintenance)** | Dữ liệu được ghi thẳng vào các thư mục | Phải chạy `OPTIMIZE` tốn kém xáo trộn lại toàn bảng | Lệnh `OPTIMIZE` diễn ra cực nhanh, tự động gom dần theo thời gian |
| **Sự thay đổi cấu trúc** | Không thể (Phải viết lại toàn bộ bảng) | Cần đổi lệnh và chạy `OPTIMIZE` lại từ đầu | Đổi nhẹ nhàng bằng `ALTER TABLE`, áp dụng tăng dần |

## 5. Khi Nào Nên Sử Dụng Kỹ Thuật Nào?

* **Trạng thái hiện tại (Từ 2024 trở đi)**: Nếu bạn đang xây dựng kiến trúc Data Lakehouse mới trên nền tảng hỗ trợ tốt tính năng này (ví dụ Databricks Delta Lake phiên bản mới), **Liquid Clustering là sự lựa chọn ưu tiên tuyệt đối**. Thực tế, Databricks khuyến nghị không sử dụng Partitioning và Z-Ordering cho các bảng mới, hãy chuyển hẳn sang Liquid Clustering để tiết kiệm công sức Data Engineering.
* **Vẫn dùng Hive Partitioning khi**: Bạn đang xây dựng Lakehouse nhưng cần đảm bảo khả năng tương thích ngược với các hệ thống truy vấn cũ (Legacy Presto, Athena cũ, Hadoop Hive) vốn chỉ hiểu được cấu trúc dữ liệu chia theo thư mục. Hoặc, khi bạn có một pattern truy vấn cực kỳ ổn định, cố định và không bao giờ thay đổi.
* **Vẫn dùng Z-Ordering khi**: Bạn đang ở trên các engine mã nguồn mở (OSS Delta Lake phiên bản cũ) hoặc Apache Iceberg, Hudi (các hệ thống có hỗ trợ Z-Order/Hilbert curve sorting) chưa có các tính năng fully-dynamic clustering như Liquid, và bạn gặp bài toán phải tối ưu lọc dữ liệu theo nhiều ID phức tạp.

## Tổng Kết
Kiểm soát cách dữ liệu được sắp xếp vật lý trên bộ nhớ là chìa khóa tối thượng định đoạt hiệu suất trong Big Data. Bằng việc chuyển đổi qua lại giữa các tư duy phân mảnh vật lý tĩnh (Partitioning) sang sắp xếp thông minh đa chiều (Z-Ordering), và đỉnh cao hiện tại là tự động hóa gom cụm thích ứng (Liquid Clustering), các kỹ sư dữ liệu đã có thể mang lại tốc độ truy vấn tiệm cận Data Warehouse truyền thống cho kiến trúc Lakehouse, trong khi giữ chi phí vận hành ở mức dễ chịu nhất.

## Tài Liệu Tham Khảo
* [Apache Parquet Format Specifications](https://parquet.apache.org/docs/)
* [Apache Iceberg: An Architectural Look Under the Covers](https://iceberg.apache.org/docs/latest/)
* [Delta Lake: High-Performance ACID Table Storage - Databricks](https://delta.io/)
* [SSTables and LSM-Trees - Designing Data-Intensive Applications (Chapter 3)](https://dataintensive.net/)
* **Z-Ordering and Liquid Clustering - Databricks Optimization**
