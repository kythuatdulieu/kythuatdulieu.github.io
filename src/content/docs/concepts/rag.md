---
title: "Retrieval-Augmented Generation (Tạo lập Truy xuất Tăng cường)"
category: "Kiến trúc hệ thống"
---

# Retrieval-Augmented Generation (Tạo lập Truy xuất Tăng cường)

## Summary
Kỹ thuật tối ưu hóa đầu ra của LLM bằng cách truy xuất dữ liệu từ các nguồn tài liệu bên ngoài (không nằm trong dữ liệu huấn luyện gốc) dựa trên truy vấn của người dùng, rồi đưa dữ liệu này vào ngữ cảnh (context) để LLM tạo câu trả lời chính xác, cập nhật và tránh ảo giác.

## Key Characteristics
- Giúp LLM tiếp cận thông tin thời gian thực hoặc tài liệu nội bộ.
- Giảm thiểu lỗi ảo giác (hallucination) nhờ có tài liệu đối chiếu làm căn cứ.
- Tiết kiệm chi phí hơn nhiều so với việc huấn luyện lại hoặc tinh chỉnh (fine-tuning) mô hình.

*(Bài viết đang trong quá trình hoàn thiện. Phiên bản đầy đủ sẽ được cập nhật sớm)*
