---
title: "Phân tách văn bản (Chunking)"
category: "Xử lý Dữ liệu"
---

# Phân tách văn bản (Chunking)

## Summary
Kỹ thuật chia nhỏ các tài liệu văn bản lớn thành các đoạn (chunks) có kích thước phù hợp trước khi nhúng và lưu trữ vào vector store.

## Key Characteristics
- Rần quan trọng vì LLM có giới hạn cửa sổ ngữ cảnh và việc gửi đoạn văn bản ngắn, tập trung giúp tăng độ chính xác truy xuất.
- Có nhiều chiến lược chunking: theo số lượng ký tự cố định, theo đoạn văn, theo chương hoặc phân tách theo cấu trúc ngữ nghĩa (semantic chunking).
- Có thể cấu hình thêm độ chồng lấn (chunk overlap) giữa các đoạn liền kề để tránh mất mát ngữ cảnh ở biên.

*(Bài viết đang trong quá trình hoàn thiện. Phiên bản đầy đủ sẽ được cập nhật sớm)*
