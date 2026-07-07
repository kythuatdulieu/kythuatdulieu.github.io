# Assumptions
- The reader is a Data/Platform Engineer interested in the evolution of Data Catalogs and the technical trade-offs between batch crawling (Amundsen) and event-driven pushing (DataHub).
- We will focus on physical architecture, particularly Push vs Pull ingestion and Graph databases.

# Research map
- **DataHub Architecture**: DataHub docs (datahubproject.io/docs/architecture/architecture/). Push-based via Kafka (MetadataChangeEvent) and Pull-based. Real-time, schema-first approach.
- **Amundsen Architecture**: Lyft Engineering blog. Pull-based crawler (Databuilder), Neo4j for relationships, Elasticsearch for search. PageRank for ranking.
- **Modern Data Catalog / Metadata Control Plane**: Active metadata, decoupled governance, operational intelligence.

# Evidence map
| Claim | Evidence | Source | Confidence | Notes |
| --- | --- | --- | --- | --- |
| Amundsen uses Databuilder to crawl metadata via Airflow to Neo4j/Elasticsearch | Lyft Engineering blog | Amundsen Docs / Lyft | High | Batch crawling trade-offs: staleness, warehouse compute costs |
| DataHub uses a push-based architecture via Kafka and REST | DataHub docs | DataHub | High | Real-time, decoupled storage but high integration cost |

# Proposed outline
1. Vấn đề cốt lõi: Dark Data và Metadata Drift.
2. Định nghĩa: Data Catalog như một Metadata Control Plane.
3. Kiến trúc vật lý và hai trường phái Ingestion:
    - Thế hệ 2 (Pull-Based / Batch) - Kiến trúc Lyft Amundsen.
    - Thế hệ 3 (Push-Based / Real-time) - Kiến trúc LinkedIn DataHub.
4. Schema-First Modeling (Aspects trong DataHub).
5. Rủi ro vận hành (Elasticsearch mapping explosion, Graph query explosion).
6. Khi nào nên dùng Push hay Pull.
7. Thuật ngữ chính.

# Editorial QA
- Đã humanize: Có, giọng văn kỹ thuật, loại bỏ AI sounding.
- Đủ nguồn: Trích dẫn DataHub và Lyft engineering.
- Hình/sơ đồ: Dùng Mermaid cho kiến trúc Push/Pull.
