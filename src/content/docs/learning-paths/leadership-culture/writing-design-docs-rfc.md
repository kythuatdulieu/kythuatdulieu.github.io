---
title: "Nghệ thuật viết Design Doc (RFC / Tech Spec)"
description: "Cách viết design doc cho hệ thống dữ liệu: bối cảnh, mục tiêu, non-goals, phương án, trade-off, rollout, rollback và review."
tags: ["design-doc", "rfc", "adr", "architecture", "engineering-culture"]
readingTime: "10 mins"
lastUpdated: 2026-07-11
seoTitle: "Nghệ thuật viết Design Doc (RFC / Tech Spec)"
metaDescription: "Cách viết design doc cho hệ thống dữ liệu: bối cảnh, mục tiêu, non-goals, phương án, trade-off, rollout, rollback và review."
difficulty: "Intermediate"
domains: ["DE"]
---

Design doc giúp team ra quyết định kỹ thuật trước khi code quá xa. Với Data Engineering, điều này đặc biệt quan trọng vì quyết định sai về warehouse, table format, orchestration, streaming hay governance có thể tạo chi phí trong nhiều năm. Sau khi quyết định đã được chốt, ADR là cách nhẹ hơn để lưu lại bối cảnh và trade-off cho người đến sau: [Architecture decision records](https://cloud.google.com/architecture/architecture-decision-records).

Khi viết design doc cho hệ thống dữ liệu, nên link trực tiếp đến concept nội bộ thay vì giải thích lại từ đầu. Ví dụ: [Lambda Architecture](/concepts/1-distributed-systems-architecture/lambda-architecture/), [Kappa Architecture](/concepts/1-distributed-systems-architecture/kappa-architecture/), [Lakehouse](/concepts/3-storage-engines-formats/lakehouse/), [Data Contract](/concepts/6-data-modeling-transformation/data-contract/), [Data Observability](/concepts/7-dataops-orchestration-quality/data-observability/).

Một design doc tốt không cần văn hoa. Nó cần rõ vấn đề, rõ lựa chọn, rõ trade-off và rõ cách biết quyết định có hiệu quả hay không.

## Khi nào cần design doc?

Không phải thay đổi nào cũng cần RFC. Nên viết khi:

- Thay đổi kiến trúc pipeline hoặc platform.
- Migration warehouse/lakehouse/orchestrator.
- Thêm streaming vào hệ thống đang batch.
- Thay đổi schema hoặc metric có nhiều downstream.
- Dữ liệu nhạy cảm, compliance hoặc phân quyền phức tạp.
- Chi phí hoặc độ tin cậy có tác động lớn.

## Cấu trúc đề xuất

| Phần | Câu hỏi cần trả lời |
|---|---|
| Context | Hiện trạng là gì, vì sao cần thay đổi? |
| Goals | Thành công nghĩa là gì? |
| Non-goals | Việc gì cố tình không giải quyết? |
| Requirements | Functional và non-functional requirement là gì? |
| Proposal | Thiết kế đề xuất hoạt động thế nào? |
| Alternatives | Đã cân nhắc phương án nào, vì sao loại? |
| Risks | Rủi ro kỹ thuật, dữ liệu, bảo mật, chi phí? |
| Rollout | Triển khai từng bước thế nào? |
| Rollback | Nếu sai thì quay lại thế nào? |
| Metrics | Đo thành công bằng gì? |

Concept nên trích trong từng phần: [Data Lineage](/concepts/8-security-governance-finops/data-lineage/) cho impact analysis, [Access Control](/concepts/8-security-governance-finops/access-control/) cho security, [Backfill](/concepts/2-data-ingestion-integration/backfill/) cho migration, [Schema Evolution](/concepts/3-storage-engines-formats/schema-evolution/) cho thay đổi schema.

## Ví dụ khung mở đầu

```md
# RFC: Chuyển order mart sang incremental model

## Context
Order mart hiện rebuild toàn bảng mỗi đêm, mất 4 giờ và scan 8 TB dữ liệu.

## Goals
- Giảm runtime xuống dưới 45 phút.
- Giữ reconciliation lệch dưới 0.1%.
- Cho phép backfill theo từng ngày.

## Non-goals
- Không thay đổi định nghĩa revenue trong phase này.
- Không thay BI dashboard trong phase này.
```

Non-goals rất quan trọng. Nó bảo vệ scope khỏi câu “tiện thể làm luôn”.

Tiếp tục ví dụ trên, phần Rollout/Rollback — nơi phân biệt design doc "để duyệt" với design doc "để vận hành":

```md
## Rollout
1. Tuần 1: chạy incremental song song với full rebuild (shadow mode),
   so sánh reconciliation hằng ngày, ngưỡng lệch cho phép < 0.1%.
2. Tuần 2: chuyển 2 dashboard nội bộ ít rủi ro sang bảng mới.
3. Tuần 3: chuyển toàn bộ BI, giữ full rebuild ở chế độ weekly làm đối chứng.
4. Tuần 6: tắt full rebuild nếu 3 tuần liên tiếp lệch = 0.

## Rollback
- Bảng cũ giữ nguyên tên; bảng mới đứng sau view `analytics.fct_orders`.
- Rollback = đổi view về bảng cũ (1 câu SQL, < 1 phút, không mất dữ liệu).

## Metrics
- Runtime: 4h → mục tiêu < 45 phút (đo qua Airflow task duration).
- Scan cost: 8 TB/đêm → mục tiêu < 500 GB/đêm.
- Reconciliation: lệch < 0.1% (job so sánh tự động, alert nếu vượt).
```

Hai chi tiết đáng học: **shadow mode** (chạy song song, so số trước khi cắt chuyển — mọi migration dữ liệu nghiêm túc đều cần) và **rollback qua view** (đổi con trỏ thay vì đổi dữ liệu, biến quyết định rủi ro thành quyết định đảo ngược được trong 1 phút). Cùng tư tưởng với [Blue-Green Deployment cho dữ liệu](/concepts/7-dataops-orchestration-quality/blue-green-deployment-data/).

## Viết trade-off như kỹ sư

Trade-off tốt không chỉ nói “phương án A nhanh hơn”. Hãy nói đủ:

- A nhanh hơn trong trường hợp nào?
- A làm gì phức tạp hơn?
- A thất bại theo kiểu nào?
- Team có đủ kỹ năng vận hành A không?
- Chi phí chuyển đổi và rollback là gì?

Ví dụ:

| Phương án | Lợi ích | Chi phí/rủi ro | Kết luận |
|---|---|---|---|
| Rebuild full table | Đơn giản, dễ hiểu | Runtime tăng theo dữ liệu, scan cost cao | Giữ tạm cho bảng nhỏ |
| Incremental merge | Nhanh hơn, rẻ hơn | Cần xử lý late update và delete | Chọn cho order mart |
| Streaming update | Latency thấp | Tăng vận hành, chưa cần theo SLA hiện tại | Không chọn trong phase 1 |

## Review design doc

Người review nên tập trung vào:

- Vấn đề có thật và đáng giải không?
- Requirement có đo được không?
- Proposal có bỏ sót failure mode không?
- Alternatives có được cân nhắc công bằng không?
- Rollout/rollback có thực tế không?
- Ai sẽ vận hành sau khi ship?

Review không phải cuộc thi chứng minh ai thông minh hơn. Review là cách giảm rủi ro trước khi team trả chi phí bằng production.

## Design doc và ADR

Design doc thường dùng cho thay đổi lớn trước khi triển khai. ADR dùng để ghi lại quyết định kiến trúc đã chọn và lý do. Với hệ thống dữ liệu dài hạn, nên giữ cả hai:

- Design doc: thảo luận và ra quyết định.
- ADR: lưu lại quyết định cuối, bối cảnh, trade-off và hậu quả.

## Checklist trước khi gửi

- Có số liệu hiện trạng, không chỉ cảm giác.
- Có mục tiêu đo được.
- Có non-goals.
- Có ít nhất hai phương án thay thế.
- Có sơ đồ hoặc luồng dữ liệu.
- Có kế hoạch rollout và rollback.
- Có owner vận hành sau khi triển khai.

## References

- [Architecture decision records](https://cloud.google.com/architecture/architecture-decision-records) - Google Cloud.
- [Simplicity](https://sre.google/sre-book/simplicity/) - Google SRE.
- [DORA metrics](https://dora.dev/guides/dora-metrics/) - DORA.
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) - Amazon Web Services.
