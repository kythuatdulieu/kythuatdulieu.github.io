---
title: "Deep-dive: Databricks DataOps & Enterprise Template"
description: "Mổ xẻ dự án Databricks Asset Bundles (DABs), thiết lập CI/CD, DataOps và các quyết định thiết kế cốt lõi trong Databricks."
---

## 1. Tổng quan Dự án (Project Overview)

Dự án này ứng dụng template kiến trúc chuẩn từ [andre-salvati/databricks-template](https://github.com/andre-salvati/databricks-template) để triển khai DataOps và CI/CD trên Databricks. Đây là một nền tảng "Production-ready" sử dụng **Databricks Asset Bundles (DABs)** nhằm tự động hóa việc triển khai Data Pipeline, quản lý môi trường và vòng đời phát triển phần mềm (SDLC) theo triết lý DataOps hiện đại.

### Mục tiêu cốt lõi
- **Chuyển đổi quy trình**: Chuyển từ việc phát triển thủ công trên Notebook sang quy trình IDE-based chuyên nghiệp.
- **Tự động hóa toàn diện**: Tự động hóa quá trình đóng gói, kiểm thử và triển khai bằng DABs.
- **Infrastructure as Code (IaC)**: Quản lý cơ sở hạ tầng dưới dạng mã nhằm đảm bảo tính nhất quán trên mọi môi trường.

## 2. Kiến trúc & Công nghệ (Architecture & Technology)

### Databricks Asset Bundles (DABs)
Databricks Asset Bundles (DABs) - hay Declarative Automation Bundles - là công cụ cốt lõi cho phép định nghĩa các tài nguyên Databricks (Jobs, DLT Pipelines, ML Models, v.v.) dưới dạng code (IaC) qua các file YAML. Thay vì cấu hình Job thủ công trên giao diện UI, toàn bộ hạ tầng được quản trị thống nhất trên Git.
- **Dễ dàng cấu hình môi trường**: Sử dụng `databricks.yml` để khai báo rõ các targets như `dev`, `staging`, `prod`.
- **Triển khai nhất quán**: Lệnh `databricks bundle deploy` đóng gói toàn bộ code và đẩy lên Workspace một cách tự động, liền mạch và đáng tin cậy.

### CI/CD và DataOps
CI/CD trong Databricks yêu cầu sự kết hợp nhịp nhàng giữa mã nguồn (Python/Scala) và hạ tầng phân bổ tài nguyên.
- **Continuous Integration (CI)**: Sử dụng các testing framework (như `pytest`) để chạy Unit Tests cục bộ và Integration Tests trực tiếp trên các cụm tính toán Databricks tạm thời (ephemeral clusters). Mã nguồn Python thường được đóng gói thành file `.whl` (Python Wheels).
- **Continuous Deployment (CD)**: Sau khi test thành công, mã nguồn cùng cấu hình DABs được tự động deploy lên staging hoặc prod. Quy trình này đáp ứng nguyên tắc cốt lõi của DataOps: Khả năng lặp lại (Repeatability) và Độ tin cậy (Reliability).

## 3. Đánh đổi thiết kế (Design Trade-offs)

### Notebook-based Development vs IDE-based Development
Mối quan tâm lớn nhất trong dự án Databricks là chọn phương pháp phát triển phù hợp:

- **Notebook-based Development**:
  - *Ưu điểm*: Trực quan, dễ khám phá dữ liệu (EDA), hiển thị kết quả biểu đồ ngay lập tức. Phù hợp cho Data Science, POC.
  - *Nhược điểm*: Rất khó review code trên Git (vì file Notebook thường được xuất ra dưới định dạng JSON hoặc source code thô không chứa cấu trúc project chuẩn). Khó viết unit test và dễ dẫn đến "spaghetti code" nếu không quản lý tốt.
  
- **IDE-based Development (Khuyến nghị cho Production)**:
  - *Ưu điểm*: Cho phép viết mã Python thuần (Python modules/packages) bằng VS Code/PyCharm. Kế thừa các tiêu chuẩn của Software Engineering như linting, type checking, thiết kế hướng đối tượng (OOP) và unit testing độc lập.
  - *Nhược điểm*: Rào cản học tập ban đầu cao hơn đối với Data Engineer và Data Scientist vốn chỉ quen dùng Notebook. Yêu cầu setup thêm Databricks Connect hoặc Databricks VS Code Extension để test code cục bộ.

*Dự án template này tuân thủ chặt chẽ IDE-based development*, ưu tiên việc đóng gói logic tính toán phức tạp thành các module Python độc lập để dễ bảo trì, và chỉ sử dụng Notebook ở những bước orchestration tối giản hoặc khi thực sự cần.

## 4. Quản trị Rủi ro Production (Production Risks & Mitigation)

### Quản lý môi trường (Dev/Staging/Prod) & Cô lập tài nguyên
Khi đưa dự án dữ liệu vào Production, rủi ro lớn nhất là thao tác nhầm lẫn giữa các môi trường làm hỏng hoặc lộ lọt dữ liệu. Để quản lý hiệu quả, dự án áp dụng:
- **Cô lập Workspace/Catalog**: Khai báo nhiều *Targets* trong DABs. Mỗi Target (ví dụ `dev` và `prod`) sẽ trỏ đến Workspace tương ứng. Unity Catalog được dùng để cấp phát các Catalog tách biệt hoàn toàn (`dev_catalog`, `prod_catalog`), ngăn chặn rủi ro code dev can thiệp vào bảng prod.
- **Xác thực tự động (Automated Identity)**: Ứng dụng Workload Identity Federation kết hợp Service Principals thay vì dùng Personal Access Token (PAT) của cá nhân. Việc này loại bỏ rủi ro bảo mật khi nhân sự nghỉ việc hoặc khi token bị đánh cắp.
- **Bảo mật và Cấu hình động**: Các khóa mật mã (Secrets) không bao giờ bị hard-code. Chúng được tham chiếu thông qua Azure Key Vault hoặc Databricks Secret Scopes tuỳ vào môi trường thực thi hiện tại.

## Tài liệu Tham khảo
- [Base Repository: andre-salvati/databricks-template](https://github.com/andre-salvati/databricks-template)
- [Databricks Asset Bundles Documentation](https://docs.databricks.com/en/dev-tools/bundles/index.html)
- [Databricks CI/CD & MLOps Workflow](https://docs.databricks.com/en/machine-learning/mlops/mlops-workflow.html)
