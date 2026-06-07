---
title: "Cửa sổ ngữ cảnh (Context Window)"
category: "Thông số LLM"
---

# Cửa sổ ngữ cảnh (Context Window)

## Summary
Giới hạn tối đa về số lượng token (bao gồm cả prompt đầu vào và phản hồi đầu ra) mà mô hình ngôn ngữ lớn có thể xử lý cùng một lúc trong một lượt suy luận.

## Key Characteristics
- Nếu đoạn hội thoại vượt quá cửa sổ ngữ cảnh, mô hình sẽ quên đi các phần thông tin đầu tiên.
- Các dòng mô hình hiện đại đã nâng cấp cửa sổ ngữ cảnh rất lớn (từ 8K, 32K lên đến 1M hoặc hơn).
- Dù cửa sổ ngữ cảnh lớn, mô hình vẫn có thể gặp hiện tượng 'lost in the middle' (bỏ sót thông tin ở giữa tài liệu dài).

*(Bài viết đang trong quá trình hoàn thiện. Phiên bản đầy đủ sẽ được cập nhật sớm)*
