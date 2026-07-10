# Sổ Tay Kỹ Thuật Dữ Liệu (Data Engineering Handbook)

<div align="center">

[![Trạng thái Build](https://github.com/kythuatdulieu/kythuatdulieu.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/kythuatdulieu/kythuatdulieu.github.io/actions/workflows/deploy.yml)
[![Nền tảng](https://img.shields.io/badge/N%E1%BB%81n_t%E1%BA%A3ng-Astro_Starlight-FF5D01?style=flat&logo=astro&logoColor=white)](https://starlight.astro.build/)
[![Ngôn ngữ](https://img.shields.io/badge/Ng%C3%B4n_ng%E1%BB%AF-Ti%E1%BA%BFng_Vi%E1%BB%87t-blue?style=flat)](https://kythuatdulieu.github.io)

Một sổ tay mở về kỹ thuật dữ liệu bằng tiếng Việt: giải thích concept, nối các concept với nhau, và đặt chúng vào bối cảnh công việc data engineering thực tế.

**[Đọc trực tuyến tại kythuatdulieu.github.io](https://kythuatdulieu.github.io)**

</div>

---

## Dự án này là gì?

`kythuatdulieu.github.io` là website tài liệu cho người học và làm data engineering. Mục tiêu của repo không phải gom càng nhiều bài càng tốt, mà là xây một bản đồ kiến thức có thể tra cứu lại được: từ hệ thống phân tán, ingestion, storage, batch/stream processing, data modeling, DataOps, governance, đến GenAI trong hệ thống dữ liệu.

Nội dung được viết theo hướng:

- Giải thích rõ concept, không chỉ đưa định nghĩa ngắn.
- Liên kết giữa các concept liên quan để người đọc thấy được bối cảnh.
- Đưa thêm lời giải thích, checklist, và ví dụ gắn với công việc data engineer.
- Tách riêng learning paths, interview, projects và quizzes để phục vụ nhiều cách học khác nhau.

## Nội dung chính

| Khu vực | Vai trò |
| --- | --- |
| [Concepts](https://kythuatdulieu.github.io/concepts/1-distributed-systems-architecture/distributed-systems/) | Nền tảng kỹ thuật: distributed systems, ingestion, storage, compute, streaming, modeling, DataOps, governance và GenAI. |
| [Learning Paths](https://kythuatdulieu.github.io/learning-paths/overview/) | Lộ trình phát triển theo cấp độ và hướng chuyên sâu: beginner, junior-to-middle, middle-to-senior, analytics, cloud, platform, streaming. |
| [Projects](https://kythuatdulieu.github.io/projects/e2e/ecomlake/) | Case study và thiết kế hệ thống dữ liệu đầu cuối, đặt concept vào tình huống cụ thể. |
| [Interview QA](https://kythuatdulieu.github.io/interview/overview/) | Câu hỏi phỏng vấn theo nhóm kỹ năng: SQL, Python, data modeling, pipeline design, cloud, Kafka, Spark, incident. |
| [Quizzes](https://kythuatdulieu.github.io/quizzes/) | Khu vực ôn tập và tự kiểm tra, gồm các bộ câu hỏi phục vụ học concept và chứng chỉ. |

## Cách đọc hiệu quả

Nếu mới bắt đầu, nên đi theo `Learning Paths` trước để biết mình cần học gì và vì sao. Khi gặp một thuật ngữ mới, quay lại `Concepts` để đọc kỹ phần nền tảng. Sau đó dùng `Projects` và `Interview QA` để kiểm tra xem mình có áp dụng được concept vào tình huống thực tế hay chưa.

Một luồng học gợi ý:

1. Đọc tổng quan trong [Learning Paths](https://kythuatdulieu.github.io/learning-paths/overview/).
2. Chọn một chặng học phù hợp với hiện tại.
3. Đọc các concept được link trong chặng học đó.
4. Làm lại một project nhỏ hoặc tự viết design doc.
5. Dùng interview questions và quizzes để phát hiện phần còn hổng.

## Kiến trúc nội dung

```text
src/content/docs/
├── concepts/          # Concept cốt lõi theo nhóm kỹ thuật
├── learning-paths/    # Lộ trình học và phát triển nghề nghiệp
├── projects/          # Case study, system design, E2E projects
└── interview/         # Câu hỏi phỏng vấn và hướng dẫn ôn tập

public/
├── quizzes/           # Quiz static assets
├── backlinks.json     # Dữ liệu liên kết ngược giữa các bài
└── concepts.json      # Index concept dùng cho popover/tra cứu
```

## Tech stack

- [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/) cho static documentation site.
- Markdown/MDX cho nội dung.
- `Mermaid.js` cho sơ đồ kỹ thuật.
- `KaTeX` cho công thức.
- Custom scripts để sinh backlinks và quiz manifest.
- GitHub Actions để build và deploy lên GitHub Pages.

## Chạy local

### Yêu cầu

- [Node.js](https://nodejs.org/) LTS, khuyến nghị từ 18 trở lên.
- Git.

### Cài đặt

```bash
git clone https://github.com/kythuatdulieu/kythuatdulieu.github.io.git
cd kythuatdulieu.github.io
npm install
npm run dev
```

Sau khi server chạy, mở `http://localhost:4321`.

### Lệnh hữu ích

| Lệnh | Ý nghĩa |
| --- | --- |
| `npm run dev` | Sinh backlinks, sinh quiz manifest và chạy dev server. |
| `npm run build` | Build bản static để deploy. |
| `npm run preview` | Xem trước bản build trên máy local. |

## Đóng góp nội dung

Đóng góp tốt nhất là đóng góp làm cho người đọc hiểu sâu hơn:

- Sửa một định nghĩa còn mơ hồ.
- Thêm ví dụ hoặc sơ đồ cho concept khó.
- Nối link giữa hai concept đang liên quan nhưng chưa được dẫn.
- Bổ sung checklist, lời giải thích, hoặc bài tập nhỏ trong learning paths.
- Báo lỗi link hỏng, typo, hoặc nội dung đã lỗi thời.

Khi thêm bài mới, nên giữ mỗi bài tập trung vào một ý chính, viết rõ ngữ cảnh, và link đến các concept liên quan trong site.

## License

Nội dung và mã nguồn được chia sẻ theo giấy phép MIT. Mọi đóng góp qua Pull Request đều được khuyến khích nếu giúp tài liệu rõ ràng và đúng kỹ thuật hơn.

---

<div align="center">
  <i>Được xây dựng bởi cộng đồng quan tâm đến kỹ thuật dữ liệu bằng tiếng Việt.</i>
</div>
