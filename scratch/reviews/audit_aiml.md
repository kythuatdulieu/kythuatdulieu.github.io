# Audit Report for AI/ML Directory

## 1. Article-Level Mistakes
* **`recall.md` (Factual error)**: The Mermaid diagram contains a logical flaw. The node for "Focus on Precision" is labeled `E("Low FP, False FN")`. It should be `High FN` (High False Negatives). "False FN" is meaningless.
* **`rag.md` & `chunking.md` (Formatting bug)**: The "Pros and Cons" section has a redundant heading nesting: `## Điểm mạnh (Pros)` followed immediately by `### Điểm mạnh (Pros)`.
* **`mlflow.md` (Conceptual error & Formatting bug)**:
  * In the Mermaid diagram, the node `C["(Artifact Store: S3/GCS)"]` is erroneously placed inside the `subgraph "Data Scientist Environment"`. Cloud object storage is part of the central backend infrastructure, not the local environment.
  * Formatting bug: There are empty markdown divider blocks (`---`) hanging between lines 117 and 123.
* **`context-window.md` (Formatting bug & Code snippet flaw)**: 
  * Triplicated related concepts sections. The file lists `## Khái niệm liên quan & Tài liệu tham khảo`, then `## Xem thêm các khái niệm liên quan`, and finally `## Tài liệu tham khảo` one after another.
  * The Python code snippet declares `MAX_TOKENS = 8192` and then checks `if len(tokens) > MAX_TOKENS: tokens = tokens[:MAX_TOKENS]`, but applies this logic to an artificially tiny example string ("Context Window là..."). While conceptually okay, it is awkward as a practical code sample.
* **`feature-store.md` (Technical inaccuracy)**: The Mermaid diagram contains raw `\n` line breaks inside quoted text for node labels (e.g., `E["(Offline Store \n e.g. S3...")]`). This is not standard Mermaid syntax and often causes rendering errors (should use `<br/>` instead).
* **`ai-agent.md` (Formatting bug)**: Extraneous empty newlines exist in the code block around line 20.
* **`llm-as-a-judge.md` (Missing practical code)**: The article lacks any practical Python code or framework examples (like using Ragas, LangChain, or direct OpenAI API). It just contains a generic text prompt block, rendering it purely theoretical.

## 2. Framework-Level Weaknesses
* **Extreme Content Duplication (`lora.md` vs. `peft.md`)**: `peft.md` claims to introduce PEFT but focuses entirely on LoRA, covering the exact same math, mechanisms, and examples as `lora.md`. They even share nearly identical English summaries and interview questions. They should be merged into a single comprehensive guide.
* **Boilerplate and Redundant "Related Concepts"**: Almost all files feature a manually hardcoded `## Xem thêm các khái niệm liên quan` section that identically links back to `AI Agent`, `Chunking` (or `Embedding Models`), and `Context Window`. This demonstrates a lack of true contextual cross-linking and creates significant maintenance debt. Many files also contain conflicting `## Khái niệm liên quan` sections.
* **Inconsistent Section Structures**: The headings for Pros/Cons are highly inconsistent across files. Some use `## Điểm mạnh và điểm yếu` followed by `### Ưu điểm`/`### Nhược điểm`, others use `### Điểm mạnh (Pros)`, and some accidentally nest them.
* **Complete Lack of Troubleshooting/Debugging Guides**: Despite covering advanced engineering and operational concepts like Fine-tuning, MLOps, and Model Serving, none of the files contain a "Troubleshooting" or "Common Errors" section. There is no practical guidance on debugging Out-Of-Memory (OOM) issues, environment dependency hell, or latency bottlenecks.
