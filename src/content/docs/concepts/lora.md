---
title: "Low-Rank Adaptation (LoRA)"
category: "Huấn luyện AI"
---

# Low-Rank Adaptation (LoRA)

## Summary
Kỹ thuật tinh chỉnh hiệu quả tham số (PEFT) hoạt động bằng cách đóng băng các trọng số gốc của mô hình ngôn ngữ lớn và chỉ huấn luyện các ma trận bổ sung có thứ hạng thấp (low-rank matrices).

## Key Characteristics
- Giảm thiểu cực kỳ lớn số lượng tham số cần huấn luyện (thường giảm hơn 99%), giúp tiết kiệm bộ nhớ GPU.
- Cho phép triển khai nhiều mô hình tinh chỉnh chuyên biệt khác nhau trên cùng một phần cứng cơ sở.
- Không làm tăng độ trễ suy luận vì các ma trận bổ sung có thể được cộng gộp trực tiếp vào trọng số gốc sau khi huấn luyện xong.

*(Bài viết đang trong quá trình hoàn thiện. Phiên bản đầy đủ sẽ được cập nhật sớm)*
