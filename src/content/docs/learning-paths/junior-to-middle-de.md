---
title: Junior to Middle Data Engineer (Kỹ sư dữ liệu thực chiến)
description: Lộ trình nâng cao năng lực thực chiến, từ kỹ sư sơ cấp lên trung cấp với Dimensional Modeling, ETL/ELT và Cloud Data Warehouse.
---

Lộ trình **Junior to Middle Data Engineer** tập trung vào việc phát triển tư duy thiết kế hệ thống và giải quyết các bài toán dữ liệu thực tế tại doanh nghiệp. Nội dung chính bao gồm thiết kế mô hình dữ liệu đa chiều ([Dimensional Modeling](/concepts/data-warehouse/dimensional-modeling/)), tích hợp dữ liệu ([ETL](/concepts/etl-elt/etl/)/[ELT](/concepts/etl-elt/elt/)), phân vùng dữ liệu và làm việc với các kho dữ liệu đám mây (Cloud [Data Warehouse](/concepts/data-warehouse/data-warehouse/)).

## Đối tượng của lộ trình

Lộ trình này dành riêng cho:
* **Các kỹ sư dữ liệu hoặc kỹ sư phần mềm** đã có từ 1 đến 2 năm kinh nghiệm thực tế.
* **Những bạn đã có nền tảng cơ bản vững chắc** và mong muốn nâng cao tư duy thiết kế mô hình dữ liệu, tối ưu hóa hệ thống kho dữ liệu phục vụ trực tiếp cho hoạt động phân tích và báo cáo thông minh (BI).

## Điểm tựa cần chuẩn bị (Prerequisites)

Để tiếp thu lộ trình này một cách trọn vẹn nhất, bạn cần:
* Hoàn thành chặng đường học tập của lộ trình **Beginner Data Engineer**.
* Sở hữu kỹ năng lập trình cơ bản tốt và sử dụng thành thạo cơ sở dữ liệu quan hệ.

## Lộ trình bứt phá năng lực thực chiến

Để tự tin gánh vác các hệ thống dữ liệu tiêu chuẩn trong doanh nghiệp, bạn cần tập trung phát triển các kỹ năng cốt lõi sau:

### Bước 1: Làm chủ mô hình hóa đa chiều (Dimensional Modeling)
Đây là triết lý thiết kế nền tảng cho mọi kho dữ liệu. Bạn cần thấm nhuần các khái niệm kinh điển của Ralph Kimball: từ cách thiết kế **[Star Schema](/concepts/data-warehouse/star-schema/)** (Lược đồ hình sao) tinh gọn, phân biệt giữa **[Fact table](/concepts/data-warehouse/fact-table/)** (Bảng chứa các chỉ số đo lường) và **[Dimension table](/concepts/data-warehouse/dimension-table/)** (Bảng chứa các thông tin mô tả ngữ nghĩa). Tư duy thiết kế tốt ở bước này sẽ giúp hệ thống chạy nhanh hơn và người dùng cuối dễ dàng khai thác hơn.

### Bước 2: Kỹ nghệ tích hợp dữ liệu (ETL vs ELT)
Hãy hiểu sâu sắc và phân biệt rõ hai tư duy tích hợp dữ liệu phổ biến:
* **ETL (Extract - Transform - Load)**: Biến đổi dữ liệu trước khi nạp vào kho.
* **ELT (Extract - Load - Transform)**: Tận dụng sức mạnh tính toán của các kho dữ liệu hiện đại để nạp dữ liệu thô vào trước rồi mới thực hiện biến đổi sau.
Bên cạnh đó, bạn cần học cách tối ưu hóa hiệu năng khi nạp dữ liệu với số lượng lớn (Bulk Loading) để tránh làm nghẽn hệ thống.

### Bước 3: Phân vùng và Phân cụm dữ liệu (Partitioning & Clustering)
Khi lượng dữ liệu lên tới hàng triệu hay hàng tỷ dòng, việc quét toàn bộ bảng để lấy thông tin là một "thảm họa" về chi phí và thời gian. Bạn cần làm chủ kỹ thuật chia nhỏ dữ liệu thành các phân vùng vật lý (**[Partitioning](/concepts/database-storage/partitioning/)**) và phân cụm thông minh (**[Clustering](/concepts/database-storage/clustering/)**) trên cả hệ cơ sở dữ liệu lẫn các định dạng tệp tin lưu trữ tối ưu như Parquet.

### Bước 4: Đồng bộ dữ liệu thời gian thực với Change Data Capture (CDC)
Trong thực tế, bạn không thể cứ quét toàn bộ bảng nguồn để lấy dữ liệu mới mỗi giờ. Bạn cần tìm hiểu cơ chế **CDC ([Change Data Capture](/concepts/etl-elt/change-data-capture/))** giúp lắng nghe và thu thập các sự thay đổi dữ liệu (thêm, sửa, xóa) từ hệ thống vận hành ([OLTP](/concepts/database-storage/oltp/)) theo thời gian thực để đồng bộ liên tục về kho dữ liệu phân tích.

### Bước 5: Làm chủ kho dữ liệu đám mây (Cloud Data Warehouse)
Hãy bắt tay vào thực hành trên các nền tảng kho dữ liệu hiện đại và phổ biến nhất hiện nay như [Google BigQuery](/concepts/cloud-data-platform/google-bigquery/) hoặc [Snowflake](/concepts/cloud-data-platform/snowflake/). Học cách vận hành, phân quyền và tối ưu hóa các câu truy vấn phân tích ([OLAP](/concepts/database-storage/olap/)) trên các kiến trúc tính toán phân tán này.

## Dự án thực hành nâng tầm kỹ năng

Hãy chứng minh sự tiến bộ của mình bằng cách xây dựng dự án:

* **Dự án: Xây dựng luồng dữ liệu phân tích doanh thu cho sàn thương mại điện tử (E-commerce)**
  * **Mô tả:** Bạn sẽ thiết lập một quy trình trích xuất dữ liệu giao dịch từ cơ sở dữ liệu PostgreSQL (hệ thống OLTP). Sau đó, thiết kế một kiến trúc lược đồ hình sao (`Star Schema`) tối ưu trên Google BigQuery. Dùng công cụ biến đổi dữ liệu chuyên nghiệp `dbt` (data build tool) để viết các script SQL làm sạch, chuẩn hóa và tổng hợp dữ liệu thô thành các bảng Fact và Dimension hoàn chỉnh phục vụ cho việc dựng các báo cáo doanh thu kinh doanh.
  * **Kết quả đạt được:** Tự tin thiết kế mô hình dữ liệu đa chiều phục vụ BI từ đầu, làm chủ tư duy ELT hiện đại và viết các pipeline tải dữ liệu lớn đảm bảo tính toàn vẹn và nhất quán.

## Trọng tâm ôn luyện phỏng vấn

Ở cấp độ này, nhà tuyển dụng sẽ đánh giá rất kỹ tư duy thiết kế và sự am hiểu bản chất công nghệ của bạn:
* **Thiết kế Star Schema**: Khả năng phác thảo nhanh sơ đồ thực thể mối quan hệ cho các bài toán nghiệp vụ thực tế (ví dụ: mô hình E-commerce, quản lý kho bãi Logistics, hay chuỗi cửa hàng bán lẻ).
* **Xử lý sự thay đổi dữ liệu**: Giải thích chi tiết và đưa ra giải pháp xử lý sự thay đổi của dữ liệu thuộc tính theo thời gian bằng kỹ thuật `Slowly Changing Dimension` (đặc biệt là SCD Type 2 - lưu vết lịch sử thay đổi).
* **Hiểu bản chất kiến trúc**: So sánh chi tiết sự khác biệt lớn nhất giữa hệ thống tối ưu cho giao dịch (**OLTP**) và hệ thống tối ưu cho phân tích (**OLAP**).
