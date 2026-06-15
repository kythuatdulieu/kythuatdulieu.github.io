# Audit Report: Foundations & System Architecture

## 1. Article-Level Mistakes

### `foundation/data-engineering.md`
- **Typo:** Line 282 has a typo "an sau" which should be "an toàn" ("đảm bảo dòng dầu (dữ liệu) chảy liên tục, sạch sẽ và an sau").

### `foundation/data-lifecycle.md`
- **SEO/Formatting Bug:** Line 9 duplicates the term in parentheses: `seoTitle: "Vòng đời Dữ liệu (Vòng đời Dữ liệu) - Từ lúc sinh ra đến khi tiêu hủy"`.

### `foundation/source-systems.md`
- **Formatting/Structure Bug:** Lines 121-122 list two common mistakes ("Quét toàn bảng" and "Tin tưởng tuyệt đối vào hệ thống nguồn") directly under the "Best Practices" section without a clear "Sai lầm thường gặp" sub-heading, making the document hard to read and visually confusing.
- **Structural Inconsistency:** This file deviates entirely from the framework of the other files. It uses headers like `## Summary`, `## Definition`, `## Why it exists`, `## Core idea`, and `## How it works`, completely breaking the template used by the rest of the directory.

### `system-architecture/data-platform-architecture.md`
- **Typo:** Line 234 has a typo in the "Xem thêm" section: `[Đường ông Dữ liệu]` instead of `[Đường ống Dữ liệu]`.

### `system-architecture/data-fabric.md`
- **Weird Translation:** Line 84 translates "Recommendation Engine" to "Động cơ Đề xuất", which sounds unnatural in Vietnamese tech contexts. "Hệ thống Đề xuất" or keeping the English term would be better.

### `system-architecture/kappa-architecture.md`
- **Outdated Code Snippet:** The Java code snippet uses `FlinkKafkaConsumer` (lines 79-91), which has been deprecated in Apache Flink since version 1.14+ in favor of the new `KafkaSource` API.

### `system-architecture/event-driven-schema-registry.md`
- **Bad Diagramming:** Instead of using a Mermaid diagram for the Schema Registry interaction flow (lines 87-95), it uses clunky ASCII art, which breaks the visual consistency of the documentation.

### `system-architecture/real-time-architecture.md`
- **Outdated SQL Syntax:** The Flink SQL example uses the `HOP()` function in the `GROUP BY` clause (Line 105), which is the legacy grouped window syntax. Modern Flink SQL prefers Table-Valued Functions (TVFs) like `TABLE(HOP(...))`.

---

## 2. Framework-Level Weaknesses

After reviewing all 13 files in the `1-foundations` directory, several structural and framework-level weaknesses emerge:

### A. Lack of Troubleshooting & Operational Guides
The articles focus heavily on theoretical definitions and "happy path" architectures. There is a glaring lack of practical troubleshooting sections. For example, what should a data engineer actually do when a Kafka consumer lags? How do you handle schema evolution failures in production? How do you perform a backfill in a Kappa architecture without bringing down the system? The documentation is purely academic.

### B. Inconsistent Article Templates
The transition between files feels disjointed because the structural template is not strictly enforced. While most files use `## Kiến trúc và Cơ chế hoạt động`, `## Điểm mạnh và điểm yếu`, `## Khi nào nên dùng`, files like `source-systems.md` completely ignore this and use arbitrary headers (`## Core idea`, `## How it works`). This harms the reading experience for users navigating through the "Concepts" documentation.

### C. Overly Simplified and Outdated Code Examples
The practical code examples are a major weakness. They are often pseudo-code or rely on outdated APIs (like `FlinkKafkaConsumer`). Furthermore, for "Advanced" system architecture topics (like Lambda, Kappa, Data Mesh), providing a 5-line Python pseudo-code snippet is not useful. The framework lacks real-world Infrastructure-as-Code (e.g., Terraform snippets) or CI/CD deployment strategies that would actually help a reader implement these architectures.

### D. Repetitive and Boilerplate "Xem thêm" Sections
The "Xem thêm các khái niệm liên quan" (See also) sections at the end of each file seem to be copied and pasted across multiple files without much thought. They repeatedly link back to the exact same 3-4 files (Data Fabric, Data Mesh, Platform Architecture) regardless of whether they are contextually the most relevant next step for the reader.

### E. Inconsistent Translation Strategy
The framework lacks a glossary or standard for translating English tech terms to Vietnamese. Sometimes terms are kept in English (`Data Mesh`, `Event Sourcing`), while other times they are forcefully translated into clunky phrases (`Động cơ đề xuất`, `Kiến trúc dệt dữ liệu tự động`, `Tự biên đạo`). A consistent nomenclature guide is missing.
