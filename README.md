# Sổ Tay Kỹ Thuật Dữ Liệu (Data Engineering Handbook)

<div align="center">

[![Trạng thái Build](https://github.com/kythuatdulieu/kythuatdulieu.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/kythuatdulieu/kythuatdulieu.github.io/actions/workflows/deploy.yml)
[![Nền tảng](https://img.shields.io/badge/N%E1%BB%81n_t%E1%BA%A3ng-Astro_Starlight-FF5D01?style=flat&logo=astro&logoColor=white)](https://starlight.astro.build/)
[![Ngôn ngữ](https://img.shields.io/badge/Ng%C3%B4n_ng%E1%BB%AF-Ti%E1%BA%BFng_Vi%E1%BB%87t-blue?style=flat)](https://kythuatdulieu.github.io)

*Sổ tay Kỹ thuật Dữ liệu (Data Engineering Handbook) là không gian mã nguồn mở nhằm tổng hợp, chuẩn hóa và tra cứu kiến thức chuyên ngành bằng tiếng Việt.*

**[Trải nghiệm trực tuyến tại kythuatdulieu.github.io](https://kythuatdulieu.github.io)**

</div>

---

## Điểm Nổi Bật (Key Features)

- **Trải Nghiệm Đọc Liền Mạch (Popover Backlinks):** Tích hợp tính năng popover cho phép xem lướt các định nghĩa và khái niệm liên quan ngay tại chỗ. Mạch tư duy của bạn sẽ không bị ngắt quãng bởi việc phải mở tab mới hay chuyển trang liên tục.
- **Hệ Thống Kiến Thức Kỹ Thuật:** Kiến thức được tổ chức theo luồng kỹ thuật thực tế: Hệ thống phân tán, Lưu trữ, Xử lý lô/luồng (Batch/Streaming), Mô hình hóa, DataOps và GenAI.
- **Ôn Tập Chứng Chỉ Bám Sát Thực Tế:** Cung cấp không gian luyện thi (Quiz) với bộ câu hỏi được biên soạn sát với độ khó và ngữ cảnh của các kỳ thi chứng chỉ Databricks (Data Engineer Professional & GenAI Associate).

## Kiến Trúc Nội Dung (Content Architecture)

Sổ tay bao quát các lĩnh vực cốt lõi trong Data Engineering:

1. **Khái Niệm Cốt Lõi (Concepts):** Đi sâu vào nguyên lý hoạt động của các thành phần trong Modern Data Stack.
2. **Lộ Trình Sự Nghiệp (Learning Paths):** Hướng dẫn phát triển bộ kỹ năng theo từng cấp độ và chuyên môn.
3. **Dự Án & Thiết Kế (Projects):** Phân tích thiết kế hệ thống và giải quyết các bài toán dữ liệu thực tế.
4. **Phỏng Vấn (Interview QA):** Tổng hợp câu hỏi kỹ thuật, thuật toán và system design thường gặp.
5. **Chứng Chỉ (Quizzes):** Khu vực thi thử và đánh giá kiến thức.

## Công Nghệ Sử Dụng (Tech Stack)

Dự án được xây dựng với ưu tiên về hiệu năng và trải nghiệm đọc:

- **Framework:** [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/) (Static Site Generator).
- **Mở rộng:** Hỗ trợ render sơ đồ với `Mermaid.js` và công thức toán học với `KaTeX`.
- **Triển khai:** Tự động deploy thông qua GitHub Actions.

## Dành Cho Kỹ Sư Đóng Góp (Development)

Dự án có cấu trúc tinh gọn. Dưới đây là cách bạn có thể chạy dự án trên máy cá nhân:

### 1. Yêu cầu hệ thống
- [Node.js](https://nodejs.org/) (Khuyến nghị LTS >= 18)
- Git

### 2. Cài đặt và Chạy cục bộ

```bash
# Clone kho lưu trữ
git clone https://github.com/kythuatdulieu/kythuatdulieu.github.io.git
cd kythuatdulieu.github.io

# Cài đặt các gói phụ thuộc
npm install

# Khởi động môi trường phát triển
npm run dev
```

Truy cập `http://localhost:4321` trên trình duyệt để xem kết quả.

### 3. Cấu trúc thư mục chính

- `/src/content/docs`: Nơi chứa toàn bộ bài viết (định dạng `.md` hoặc `.mdx`).
- `/src/assets`: Chứa hình ảnh và tài nguyên tĩnh.
- `astro.config.mjs`: Tệp cấu hình giao diện, menu điều hướng (sidebar), và các plugin.

### 4. Các Lệnh Hữu Ích

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run dev` | Chạy local server với hot-reload. |
| `npm run build` | Build dự án để chuẩn bị deploy. |
| `npm run preview` | Xem trước bản build cục bộ. |

## Giấy Phép (License)

Tài liệu và mã nguồn được chia sẻ dưới dạng mã nguồn mở (MIT License). Khuyến khích mọi sự đóng góp từ cộng đồng thông qua Pull Requests.

---
<div align="center">
  <i>Được xây dựng bởi Cộng đồng Kỹ sư Dữ liệu.</i>
</div>
