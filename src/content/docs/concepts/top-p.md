---
title: "Nucleus Sampling (Top-p)"
category: "Cấu hình LLM"
---

# Nucleus Sampling (Top-p)

## Summary
Phương pháp lấy mẫu trong đó mô hình chỉ xem xét nhóm các token có tổng xác suất tích lũy đạt đến giá trị p (từ 0 đến 1).

## Key Characteristics
- Ví dụ, nếu top-p = 0.9, mô hình sẽ chỉ chọn từ top 90% các từ có xác suất cao nhất, loại bỏ 10% các từ ít có khả năng xảy ra nhất.
- Giúp duy trì tính đa dạng của câu trả lời nhưng tránh được các từ vô nghĩa hoặc lạc đề.
- Thường được tinh chỉnh song song hoặc thay thế cho Temperature.

*(Bài viết đang trong quá trình hoàn thiện. Phiên bản đầy đủ sẽ được cập nhật sớm)*
