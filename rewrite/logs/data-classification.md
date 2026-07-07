# Assumptions
- Target audience is Data Engineers / Data & AI practitioners.
- Content requires deep dive into automated Data Classification at Exabyte scale, FinOps, tools like Macie, GCP DLP, Unity Catalog, and ABAC concepts.
- Language is Vietnamese, with standard English terminologies.

# Research map
- AWS Macie: https://aws.amazon.com/macie/features/ (AWS Docs, highly credible, provides info on automated discovery and sampling, EventBridge integration).
- Google Cloud DLP (Sensitive Data Protection): https://cloud.google.com/sensitive-data-protection/docs/best-practices (Google Cloud Docs, highly credible, provides info on native de-identification and SCC integration).
- Databricks Unity Catalog Data Classification: https://docs.databricks.com/en/data-governance/unity-catalog/data-classification.html (Databricks Docs, highly credible, explains Agentic AI / LLM approach, governed tags, incremental scan).

# Image/figure plan
- The Mermaid diagram `sequenceDiagram` is used for Event-driven Data Classification instead of a downloaded image to maintain consistency and clarity.

# Evidence map
- Claim: Macie full scan causes massive billing issues. Evidence: Macie pricing is per GB, full scan on PB lakes = high cost. Source: AWS best practices & FinOps community knowledge.
- Claim: Cloud DLP integrates with SCC to escalate bucket risk automatically. Evidence: Google Cloud documentation on Sensitive Data Protection & SCC. Source: GCP Docs.
- Claim: Unity Catalog uses AI to automatically classify. Evidence: Databricks documentation states LLM-based agentic AI identifies sensitive data and suggests governed tags. Source: Databricks Docs.

# Proposed outline
- Introduction: Data Classification at scale is automated discovery + tagging + ABAC + FinOps.
- Section 1: Architecture of Automated Data Classification Pipeline (Ingestion, Scanner, Catalog, Enforcement) + Mermaid diagram for Event-Driven.
- Section 2: Core Engines and System Trade-offs (Macie vs DLP vs Unity Catalog).
  - 2.1. AWS Macie (Sampling, Terraform example).
  - 2.2. Google Cloud DLP (De-identification, SCC integration).
  - 2.3. Unity Catalog (LLMs, Governed tags).
- Section 3: Operational Risks.
  - 3.1. Tag Propagation & PII leakage.
  - 3.2. Static vs Dynamic Masking (Trade-offs in CPU/Latency).
- Key Terms table.
- References.

# Editorial QA
- Humanize pass: Removed marketing fluff, AI-sounding phrases. Used direct, objective language.
- Source adequacy: Supported by AWS, GCP, Databricks docs.
- Overclaims: None, explicitly mentions trade-offs for each system.
- Clarity: Provided tangible examples (e.g., Spark CTAS dropping tags, SHA256 dynamic masking).
