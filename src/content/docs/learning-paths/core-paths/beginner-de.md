---
title: Beginner Data Engineer (Kỹ sư dữ liệu nhập môn)
description: Lộ trình học tập cơ bản dành cho người mới bắt đầu làm quen với kỹ thuật dữ liệu, từ SQL, Python đến Data Pipelines.
---



Lộ trình **Beginner Data Engineer** được xây dựng nhằm cung cấp nền tảng kiến thức cơ bản về SQL, lập trình Python, cơ sở dữ liệu quan hệ và quy trình quản lý mã nguồn (Git) trước khi tiếp cận các hệ thống dữ liệu lớn.

## Lộ trình này dành cho ai?



Chúng tôi thiết kế lộ trình này đặc biệt hướng đến:
* **Các bạn sinh viên ngành Công nghệ thông tin** mới ra trường đang tìm kiếm một hướng đi triển vọng.
* **Kỹ sư phần mềm (Software Engineer)** hoặc **Chuyên viên phân tích dữ liệu (Data Analyst)** muốn chuyển mình sang thế giới của kỹ thuật dữ liệu ([Data Engineering](/concepts/foundation/data-engineering/)).
* **Những ai bắt đầu từ con số 0** và chưa từng có cơ hội làm việc với các hệ thống dữ liệu lớn.

## Điểm xuất phát của bạn (Prerequisites)

Để hành trình này diễn ra suôn sẻ nhất, bạn chỉ cần chuẩn bị:
* Khả năng thao tác và sử dụng máy tính cơ bản, làm quen với hệ điều hành (Windows/macOS/Linux).
* Một tư duy logic tốt và hiểu biết cơ bản về các thuật toán căn bản.

## Hành trình xây dựng nền tảng vững chắc

Đừng quá lo lắng về các công cụ phức tạp hay các hệ thống phân tán khổng lồ vào lúc này. Hãy bắt đầu từ những viên gạch cốt lõi nhất. Nếu bạn thích có một cái nhìn tổng quan trực quan, bạn nên tham khảo [roadmap.sh/data-engineer](https://roadmap.sh/data-engineer), một hướng dẫn bằng hình ảnh từng bước rất chi tiết và được cộng đồng dữ liệu công nhận rộng rãi.

### Bước 1: Làm chủ SQL căn bản (Kỹ năng bắt buộc)
SQL là chiếc chìa khóa vạn năng và là kỹ năng không thể thương lượng (non-negotiable skill). Bạn cần làm quen và thành thạo các câu lệnh truy vấn cấu trúc cơ bản như `SELECT`, `JOIN`, `GROUP BY`, và `Subqueries`. 
* **Mẹo học tập:** [Mode Analytics SQL Tutorial](https://mode.com/sql-tutorial/) là một trong những tài nguyên thực hành tương tác miễn phí tốt nhất hiện nay, giúp đưa người mới bắt đầu từ các câu truy vấn cơ bản đến các hàm SQL phân tích nâng cao.

### Bước 2: Python - Tiêu chuẩn của công nghiệp dữ liệu
Trong hệ sinh thái dữ liệu, Python là tiêu chuẩn công nghiệp (industry standard) để xây dựng các đường ống dữ liệu nhờ sự đơn giản và mạnh mẽ. Ở bước này, hãy tập trung nắm vững các cấu trúc dữ liệu cốt lõi (List, Dictionary, Tuple), thao tác với file (File handling), và tư duy lập trình hướng đối tượng (OOP).
* **Mẹo học tập:** Bạn có thể tham khảo lộ trình **Data Engineer Path của Dataquest**, nơi cung cấp môi trường tương tác tuyệt vời để học Python (và cả Git) chuyên biệt cho bối cảnh kỹ thuật dữ liệu.

### Bước 3: Cơ sở dữ liệu quan hệ (Relational Database) và Thiết kế lược đồ
Hãy tìm hiểu xem dữ liệu được lưu trữ một cách khoa học ra sao thông qua các hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) phổ biến như PostgreSQL hay MySQL. Đồng thời, bạn cần nắm bắt các quy tắc chuẩn hóa dữ liệu (1NF, 2NF, 3NF) để đảm bảo dữ liệu được lưu trữ tối ưu, hạn chế sự dư thừa.

### Bước 4: Git & GitHub - Kỹ năng làm việc chuyên nghiệp
Một kỹ sư dữ liệu giỏi không thể làm việc độc lập mà không có công cụ quản lý phiên bản. Bạn cần học cách sử dụng Git để theo dõi lịch sử code của mình: từ những lệnh cơ bản như `commit`, `push`, `pull`, đến cách phối hợp làm việc nhóm thông qua quy trình tạo `pull request`.

### Bước 5: Chạm ngõ khái niệm Data Pipeline
Cuối cùng, bạn sẽ học cách hình dung và vẽ nên một đường ống dữ liệu ([Data Pipeline](/concepts/foundation/data-pipeline/)). Hãy hiểu rõ luồng đi của dữ liệu từ nguồn phát sinh (`Source`), qua các quá trình ETL/ELT (Trích xuất - Extract, Tải - Load, Biến đổi - Transform) để đưa đến điểm lưu trữ đích (`Destination`). Khi nhắc đến điều phối (orchestration) các luồng dữ liệu này, **Apache Airflow** hiện đang là công cụ tiêu chuẩn trong ngành (industry-standard) để lên lịch trình và giám sát hệ thống mà bạn nên làm quen.

## Tài nguyên học tập khuyến nghị (Cực kỳ quan trọng)

Để củng cố thêm kiến thức cho lộ trình trên, đây là những tài liệu và khóa học hàng đầu được giới chuyên môn đánh giá cao:

* **Sách nền tảng (The Core Foundation):** *Fundamentals of Data Engineering* của Joe Reis và Matt Housley (O'Reilly Media). Đây được xem là điểm xuất phát chuẩn mực nhất, giúp bạn hiểu toàn diện về "Vòng đời Kỹ thuật Dữ liệu" (Data Engineering Lifecycle).
* **Khóa học thực chiến miễn phí:** *Data Engineering Zoomcamp* của DataTalks.Club. Khóa học miễn phí kéo dài 9 tuần cực kỳ nổi tiếng, giúp bạn tự tay xây dựng các đường ống dữ liệu với Python, SQL, Docker và Apache Airflow thông qua các dự án thực tế.
* **Sách nâng cao (Dành cho bước tiến tiếp theo):** *Designing Data-Intensive Applications* của Martin Kleppmann. Thường được ví như "Kinh thánh" (Bible) của các hệ thống dữ liệu hiện đại. Sau khi vững nền tảng, đây là cột mốc tiếp theo bạn nhất định phải đọc để nâng trình độ lên mức Senior.

## Học đi đôi với hành: Dự án đầu tay

**Dự án gợi ý:** Xây dựng hệ thống thu thập dữ liệu thời tiết tự động.
* **Mô tả dự án:** Bạn sẽ viết một chương trình Python tự động gọi API từ OpenWeather để lấy thông tin thời tiết hàng ngày dưới dạng JSON. Sau đó, dùng Python để xử lý, làm sạch và lưu các thông tin này vào cơ sở dữ liệu SQLite hoặc PostgreSQL. Cuối cùng, viết các đoạn script SQL để tính toán các chỉ số như nhiệt độ trung bình hay lượng mưa trong tuần. Để hệ thống chạy tự động, bạn có thể thiết lập một Linux Cron job đơn giản để chạy script này mỗi ngày.
* **Kết quả đạt được:** Bạn sẽ tự tin làm việc với API, xử lý định dạng JSON, tương tác với hệ cơ sở dữ liệu qua Python, và làm quen với việc tự động hóa tác vụ cơ bản.

## Ghi điểm trong mắt nhà tuyển dụng (Góc phỏng vấn)

Khi phỏng vấn cho các vị trí Fresher hoặc Junior Data Engineer, nhà tuyển dụng thường sẽ đánh giá cao các yếu tố sau:
* **Tư duy SQL nhạy bén**: Khả năng viết các câu truy vấn từ trung bình đến khó, đặc biệt là cách sử dụng các hàm cửa sổ (Window Functions) và biểu thức bảng tạm thời (CTE).
* **Tối ưu hóa cơ bản**: Giải thích được cơ chế hoạt động của `Indexing` (đánh chỉ mục) trong cơ sở dữ liệu và cách nó giúp tăng tốc độ truy xuất dữ liệu.
* **Kỹ năng giải quyết vấn đề bằng Python**: Khả năng xử lý linh hoạt các cấu trúc dữ liệu như danh sách (array) hay từ điển (dict) thông qua các bài test thuật toán nhỏ.

## Tài Liệu Tham Khảo
* **Fundamentals of Data Engineering - Joe Reis & Matt Housley**
* [Data Engineering Zoomcamp - DataTalks.Club](https://github.com/DataTalksClub/data-engineering-zoomcamp)
* [Designing Data-Intensive Applications - Martin Kleppmann](https://dataintensive.net/)
* **A Beginner's Guide to Data Engineering - Robert Chang (Airbnb)**
* [The Data Engineering Roadmap - SeattleDataGuy](https://awesomedataengineering.com/)
