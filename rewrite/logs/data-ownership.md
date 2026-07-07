# Assumptions
- Target audience is Data Engineers, Data Architects, Platform Engineers.
- The concept of Data Ownership intersects heavily with Data Mesh, FinOps, and Data Governance.
- The tone should be technical, avoiding marketing jargon.

# Research map
- Zhamak Dehghani: "How to Move Beyond a Monolithic Data Lake to a Distributed Data Mesh" (MartinFowler.com). Credible source on Data Mesh 4 principles.
- Uber Engineering Blog: "Batch Data Cloud Migration Using Data Mesh Principles". Credible source on physical boundaries mapping to domains on GCP.
- Netflix TechBlog: "Data Mesh — A Data Movement and Processing Platform @ Netflix". Credible source on streaming architectures using Kafka/Flink for decentralized domains.
- Martin Kleppmann: "Designing Data-Intensive Applications". Generic source for data engineering principles.

# Image/figure plan
- A mermaid diagram to illustrate Domain-driven Storage with Kafka/Spark/Iceberg and FinOps separation using buckets. Replaces external images.

# Evidence map
- Data Mesh has 4 principles: Domain ownership, Data as a product, Self-serve infrastructure, Federated governance. (Source: Zhamak Dehghani).
- Uber maps data domains to specific GCS buckets for chargeback. (Source: Uber Engineering Blog).
- Netflix uses Kafka and Flink for data mesh pipeline. (Source: Netflix TechBlog).

# Proposed outline
1. Intro: The bottleneck of centralized teams.
2. The Four Core Principles of Data Mesh.
3. Physical Execution (Uber & Netflix).
4. Implementing Data Ownership with IaC (Terraform examples).
5. Systemic Trade-offs and Failure Modes (OOMKilled, Network Shuffle, FinOps Nightmare).
6. Key terms.
7. References.

# Editorial QA
- Humanized? Yes, replaced marketing words with system bottlenecks like `Network Shuffle` and `OOMKilled`.
- Enough sources? Yes, Zhamak, Uber, Netflix, Kleppmann.
- Marketing removed? Yes.
- Clear and concise? Yes.
