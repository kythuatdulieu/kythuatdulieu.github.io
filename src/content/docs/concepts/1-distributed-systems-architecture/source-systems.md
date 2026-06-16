---
title: "Hệ thống Nguồn - Source Systems"
difficulty: "Beginner"
tags: ["source-systems", "oltp", "api", "logs", "iot"]
readingTime: "8 mins"
lastUpdated: 2026-06-16
seoTitle: "Hệ thống Nguồn (Source Systems) - Điểm bắt đầu của Dữ liệu"
metaDescription: "Tìm hiểu chi tiết về các hệ thống nguồn (Source Systems) trong kiến trúc dữ liệu bao gồm OLTP, APIs, Event Logs và hệ thống IoT."
description: "Hệ thống Nguồn (Source Systems) là các hệ thống tác nghiệp (operational systems) nơi dữ liệu lần đầu tiên được tạo ra hoặc thu thập trong một tổ chức...."
---



**Source Systems (Hệ thống nguồn)** là nơi khai sinh ra dữ liệu gốc của doanh nghiệp, chẳng hạn như hệ thống quản lý quan hệ khách hàng CRM (Salesforce), phần mềm quản trị doanh nghiệp ERP (SAP), cơ sở dữ liệu của ứng dụng (PostgreSQL, MySQL), hoặc hệ thống phân tích người dùng (Google Analytics, Mixpanel). 

Trách nhiệm tối quan trọng của một Data Engineer là thu thập, trích xuất (extract) dữ liệu từ các hệ thống nguồn này một cách an toàn, đáng tin cậy và **đảm bảo không làm ảnh hưởng đến hiệu năng của hệ thống tác nghiệp (production systems)**.

## 1. Phân loại các Hệ thống Nguồn phổ biến

Các hệ thống nguồn rất đa dạng về cấu trúc, giao thức giao tiếp và tần suất sinh dữ liệu. Dưới đây là các loại phổ biến nhất:

### 1.1 Cơ sở dữ liệu tác nghiệp (OLTP Databases)
OLTP (Online Transaction Processing) là các cơ sở dữ liệu phục vụ trực tiếp cho ứng dụng (app/web).
* **Đặc điểm:** Tối ưu hoá cho việc đọc/ghi dữ liệu liên tục với độ trễ thấp, xử lý lượng lớn các giao dịch nhỏ (ví dụ: thêm đơn hàng, cập nhật thông tin user). Thường được chuẩn hoá (normalized) để tránh dư thừa dữ liệu.
* **Ví dụ:** Hệ quản trị cơ sở dữ liệu quan hệ (PostgreSQL, MySQL, SQL Server, Oracle) hoặc cơ sở dữ liệu NoSQL (MongoDB, DynamoDB).

### 1.2 APIs và các ứng dụng SaaS
Nhiều doanh nghiệp không tự xây dựng mọi thứ mà sử dụng các phần mềm dịch vụ (Software as a Service) từ bên thứ ba. Dữ liệu này nằm trên server của nhà cung cấp và phải được lấy thông qua các API.
* **Đặc điểm:** Giao tiếp qua HTTP (RESTful, GraphQL, SOAP). Dữ liệu trả về thường ở định dạng JSON/XML.
* **Ví dụ:** Salesforce (CRM), Zendesk (Customer Support), Stripe (Payment), Shopify (E-commerce).

### 1.3 Hệ thống tệp và lưu trữ đối tượng (Files & Object Storage)
Dữ liệu đôi khi không nằm trong database mà định kỳ được xuất (export) ra dưới dạng tệp.
* **Đặc điểm:** Dữ liệu có thể ở định dạng có cấu trúc (CSV, TSV), bán cấu trúc (JSON) hoặc lưu trữ dạng cột (Parquet).
* **Ví dụ:** Amazon S3, Google Cloud Storage, SFTP/FTP servers, các file nhật ký (logs) định kỳ lưu trữ từ hệ thống.

### 1.4 Nhật ký sự kiện và Streaming (Event Logs & IoT)
Dữ liệu được tạo ra liên tục dưới dạng dòng thời gian, ghi lại các sự kiện cụ thể.
* **Đặc điểm:** Tốc độ tạo (Velocity) cực nhanh, dung lượng (Volume) cực lớn. Dữ liệu thường là "append-only" (chỉ ghi thêm, không cập nhật lại).
* **Ví dụ:** Clickstream logs (hành vi của user trên web), logs máy chủ (Nginx, Apache), tín hiệu cảm biến IoT từ các nhà máy. Thường sử dụng Apache Kafka, Amazon Kinesis hoặc RabbitMQ làm buffer trung gian.

## 2. Thách thức khi trích xuất dữ liệu (Extraction Challenges)

Lấy dữ liệu từ nguồn không đơn giản chỉ là chạy một câu lệnh `SELECT *`. Data Engineer phải đối mặt với nhiều thách thức kỹ thuật:

* **Ảnh hưởng đến hiệu năng (Performance Impact):** Việc chạy một truy vấn phân tích nặng (quét hàng triệu dòng) trên DB OLTP có thể khóa bảng (table lock), tiêu tốn tài nguyên (CPU/RAM) và làm chậm hoặc sụp đổ ứng dụng của người dùng cuối.
* **Thay đổi cấu trúc dữ liệu (Schema Evolution):** Software Engineer (SWE) thường xuyên cập nhật ứng dụng, như đổi tên cột, xóa trường, hoặc thay đổi kiểu dữ liệu. Sự bất đồng bộ này có thể làm vỡ (break) toàn bộ Data Pipeline ở hạ lưu.
* **Giới hạn tỷ lệ API (Rate Limiting & Pagination):** Các hệ thống SaaS luôn có cơ chế bảo vệ như giới hạn số lượng request API trong một phút (ví dụ: tối đa 100 requests/phút). Data pipeline phải xử lý việc tự động thử lại (retry) với cơ chế exponential backoff và quản lý phân trang (pagination) trơn tru.

## 3. Các chiến lược Trích xuất Dữ liệu (Extraction Strategies)

Để giải quyết các thách thức trên, Data Engineers áp dụng nhiều chiến lược khác nhau tùy thuộc vào bài toán cụ thể:

### 3.1 Full Extract (Trích xuất toàn bộ)
* **Khái niệm:** Kéo toàn bộ bảng hoặc dữ liệu mỗi lần chạy pipeline.
* **Ưu điểm:** Dễ triển khai, đơn giản hóa logic xử lý vì bạn luôn có bản sao đầy đủ nhất.
* **Nhược điểm:** Tốn kém tài nguyên và thời gian chạy lâu nếu dữ liệu lớn. Thường chỉ dùng cho các bảng nhỏ (vài ngàn dòng) hoặc dimension tables (bảng danh mục) ít bị thay đổi.

### 3.2 Incremental Extract (Trích xuất tăng dần)
* **Khái niệm:** Chỉ lấy phần dữ liệu mới được sinh ra hoặc thay đổi kể từ lần trích xuất cuối cùng (dựa trên watermark). Thường tận dụng cột `updated_at` hoặc `id` tăng tự động.
* **Ưu điểm:** Rất tối ưu về hiệu năng và băng thông vì chỉ truyền tải lượng dữ liệu nhỏ mỗi khoảng thời gian (như mỗi ngày hoặc mỗi giờ).
* **Nhược điểm:** Có nguy cơ bỏ sót dữ liệu nếu hệ thống tác nghiệp có thao tác xóa cứng (hard-delete) mà không đánh dấu (ví dụ: không có cột `is_deleted`).

### 3.3 Change Data Capture (CDC)
* **Khái niệm:** Thay vì chạy câu lệnh truy vấn SQL liên tục, CDC đọc trực tiếp từ "Transaction Logs" (nhật ký giao dịch) của CSDL nguồn (ví dụ: *binlog* của MySQL, *WAL* của PostgreSQL, *Oplog* của MongoDB).
* **Ưu điểm:** Bắt được mọi thay đổi (Insert, Update, Delete) theo thời gian thực (Real-time). Tác động đến DB nguồn là cực thấp (near-zero impact). Không bị mất dữ liệu dù bản ghi có bị thêm rồi xóa đi ngay lập tức trong tích tắc.
* **Nhược điểm:** Kiến trúc phức tạp, đòi hỏi thiết lập chuyên sâu. Yêu cầu quyền truy cập mức cao (admin/root) vào cơ sở dữ liệu nguồn.
* **Công cụ nổi bật:** Debezium, AWS Database Migration Service (DMS), Fivetran.

---

## Tài Liệu Tham Khảo
* [Designing Data-Intensive Applications - Martin Kleppmann (Part 2: Distributed Data)](https://dataintensive.net/)
* [CAP Theorem and PACELC - Daniel Abadi](http://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html)
* [Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)
* [Time, Clocks, and the Ordering of Events in a Distributed System - Leslie Lamport](https://lamport.azurewebsites.net/pubs/time-clocks.pdf)
* [MapReduce: Simplified Data Processing on Large Clusters - Google](https://research.google.com/archive/mapreduce.html)
