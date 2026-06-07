---
title: "Tái sắp xếp kết quả (Reranking)"
category: "Truy xuất thông tin"
---

# Tái sắp xếp kết quả (Reranking)

## Summary
Kỹ thuật tối ưu hóa RAG bằng cách chạy một mô hình chấm điểm sâu (Cross-Encoder) trên danh sách tài liệu thô được tìm kiếm từ Vector Store nhằm xếp lại thứ tự từ cao xuống thấp.

## Key Characteristics
- Giúp xử lý giới hạn cửa sổ ngữ cảnh bằng cách chỉ gửi các đoạn có chất lượng cao nhất cho LLM.
- Cực kỳ hữu ích để cải thiện recall@K thấp của các phương pháp tìm kiếm thô sơ.
- Thường được dùng làm bước đệm ngay trước khi đưa dữ liệu vào Prompt.

*(Bài viết đang trong quá trình hoàn thiện. Phiên bản đầy đủ sẽ được cập nhật sớm)*
