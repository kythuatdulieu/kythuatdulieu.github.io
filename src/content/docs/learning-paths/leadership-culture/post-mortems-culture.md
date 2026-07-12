---
title: "Văn hóa viết postmortem không đổ lỗi"
description: "Cách viết postmortem cho sự cố dữ liệu: tập trung vào học hỏi, timeline, tác động, nguyên nhân hệ thống và hành động phòng ngừa."
tags: ["postmortem", "incident-response", "blameless", "engineering-culture"]
readingTime: "9 mins"
lastUpdated: 2026-07-11
seoTitle: "Văn hóa viết postmortem không đổ lỗi"
metaDescription: "Cách viết postmortem cho sự cố dữ liệu: tập trung vào học hỏi, timeline, tác động, nguyên nhân hệ thống và hành động phòng ngừa."
difficulty: "Intermediate"
domains: ["DE"]
---

Postmortem tốt không tìm người để trách. Nó giúp team hiểu hệ thống đã cho phép sự cố xảy ra như thế nào, vì sao phát hiện chậm, vì sao giảm tác động khó, và cần thay đổi gì để lần sau bớt đau hơn. Google SRE mô tả postmortem culture theo hướng học từ sự cố và cải thiện hệ thống thay vì tìm lỗi cá nhân: [Postmortem Culture](https://sre.google/sre-book/postmortem-culture/).

Đọc trong site trước khi áp dụng: [Root Cause Analysis](/concepts/7-dataops-orchestration-quality/root-cause-analysis/), [Alerting Incident Response](/concepts/7-dataops-orchestration-quality/alerting-incident-response/), [Data Observability](/concepts/7-dataops-orchestration-quality/data-observability/).

Trong Data Engineering, postmortem càng quan trọng vì lỗi dữ liệu thường âm thầm. Một bảng sai có thể tồn tại nhiều giờ hoặc nhiều ngày trước khi ai đó nhìn thấy số bất thường.

## Khi nào cần postmortem?

Không phải lỗi nào cũng cần tài liệu dài. Nhưng nên viết postmortem khi:

- Dashboard hoặc báo cáo quan trọng sai.
- Pipeline trễ vượt SLO.
- Dữ liệu nhạy cảm bị cấp quyền sai.
- Backfill hoặc retry tạo duplicate lớn.
- Sự cố lặp lại.
- Người dùng downstream mất niềm tin vào bảng/mart quan trọng.

## Cấu trúc postmortem

| Phần | Nội dung |
|---|---|
| Tóm tắt | Chuyện gì xảy ra, tác động chính, trạng thái hiện tại. |
| Tác động | Ai bị ảnh hưởng, dữ liệu nào sai/trễ, trong bao lâu. |
| Timeline | Các mốc phát hiện, triage, mitigation, recovery. |
| Nguyên nhân | Điều kiện kỹ thuật và quy trình dẫn tới sự cố. |
| Điều làm tốt | Phần nào giúp phát hiện hoặc giảm tác động nhanh. |
| Điều cần cải thiện | Gaps về test, alert, ownership, rollout, docs. |
| Action items | Việc cụ thể, owner, deadline, cách kiểm chứng. |

## Ngôn ngữ nên dùng

Viết theo hướng hệ thống:

- Thay vì “A quên cập nhật schema”, viết “quy trình deploy source cho phép schema thay đổi mà không chạy contract check downstream”.
- Thay vì “B rerun sai ngày”, viết “runbook chưa nêu rõ partition range và tool không có dry-run”.
- Thay vì “team X không báo”, viết “không có kênh thông báo bắt buộc cho breaking change”.

Ngôn ngữ này không né trách nhiệm. Nó chỉ đưa trách nhiệm về nơi có thể cải thiện bằng thiết kế, quy trình và automation.

## Ví dụ action item tốt

Action item yếu:

- “Cẩn thận hơn khi chạy backfill.”

Action item tốt:

- “Thêm dry-run cho script backfill, in ra partition range và số dòng dự kiến trước khi ghi. Owner: Data Platform. Deadline: 2026-08-15. Kiểm chứng: backfill job không cho chạy nếu thiếu `--start-date` và `--end-date`.”

## Ví dụ rút gọn: sự cố doanh thu trùng 2 lần

Để thấy khác biệt giữa "nguyên nhân trực tiếp" và "nguyên nhân hệ thống", xét một sự cố có thật ở nhiều công ty:

**Hiện tượng:** Sáng thứ Hai, doanh thu trên dashboard cao gấp đôi. **Nguyên nhân trực tiếp:** job load thứ Bảy timeout ở bước cuối nhưng đã ghi một phần; Airflow retry chạy lại toàn bộ, `INSERT` thêm lần nữa → trùng dữ liệu.

Phân tích 5-whys đưa về nguyên nhân hệ thống:

1. Vì sao trùng? — Job ghi bằng `INSERT INTO` thuần, không idempotent.
2. Vì sao không idempotent? — Template pipeline của team không có mẫu MERGE/overwrite-partition sẵn.
3. Vì sao không ai phát hiện suốt Chủ Nhật? — Chỉ có alert "job fail", không có alert "số liệu bất thường" ([volume anomaly](/concepts/7-dataops-orchestration-quality/volume-anomalies/)).
4. Vì sao dashboard vẫn hiển thị số sai? — Không có quality gate giữa mart và BI.

Action items tương ứng đi thẳng vào 4 tầng đó: thêm mẫu [idempotent write](/concepts/2-data-ingestion-integration/idempotency/) vào template (chặn tái diễn cho *mọi* pipeline, không chỉ pipeline này), thêm anomaly check số dòng ±30%, thêm test reconciliation chạy trước giờ dashboard được xem nhiều nhất. Đo lường sau 1 tháng: MTTD (thời gian phát hiện) giảm từ 36 giờ xuống dưới 1 giờ.

Chú ý điểm mấu chốt: không một action item nào là "nhắc bạn X cẩn thận hơn" — tất cả đều là thay đổi hệ thống có thể kiểm chứng.

## Các lỗi postmortem thường gặp

- Timeline thiếu thời gian phát hiện thật.
- Chỉ ghi nguyên nhân trực tiếp, không phân tích vì sao hệ thống không chặn.
- Action item quá chung, không có owner.
- Viết xong không review lại sau một tháng.
- Dùng postmortem để hợp thức hóa kết luận đã có sẵn.

Khi sự cố liên quan dữ liệu, kiểm thêm các concept: [Schema Drift](/concepts/7-dataops-orchestration-quality/schema-drift/), [Freshness Monitoring](/concepts/7-dataops-orchestration-quality/freshness-monitoring/), [Data Reconciliation](/concepts/7-dataops-orchestration-quality/data-reconciliation/), [Data Ownership](/concepts/8-security-governance-finops/data-ownership/).

## Template ngắn

```md
## Summary

## Impact

## Timeline

## What went well

## What went wrong

## Contributing factors

## Action items

| Action | Owner | Due date | Verification |
|---|---|---|---|
```

## Duy trì văn hóa học hỏi

Postmortem chỉ có giá trị nếu action item được làm. Hãy review định kỳ:

- Có bao nhiêu action item quá hạn?
- Sự cố lặp lại có cùng nguyên nhân không?
- Alert mới có giảm thời gian phát hiện không?
- Runbook có được cập nhật sau incident không?

## References

- [Postmortem Culture](https://sre.google/sre-book/postmortem-culture/) - Google SRE.
- [Managing Incidents](https://sre.google/sre-book/managing-incidents/) - Google SRE.
- [Cloud Architecture Framework](https://cloud.google.com/architecture/framework) - Google Cloud.
- [DORA metrics](https://dora.dev/guides/dora-metrics/) - DORA.
