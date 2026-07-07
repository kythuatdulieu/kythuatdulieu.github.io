# Assumptions
- Target reader: Senior Data Engineer, Platform Engineer, Data Architect.
- Goal: Explain access control beyond user creation, focusing on RBAC vs ABAC trade-offs, RLS/CLS execution plan performance impacts, and centralized governance.
- Content type: deep_dive.

# Research map
- Databricks Unity Catalog ABAC: Governed tags, dynamic policies, evaluates attributes at runtime (e.g. `pii`, `confidential`), reduces role explosion.
- Snowflake/BigQuery RLS Performance: RLS intercepts queries and applies filter predicates. Snowflake: use Search Optimization Service or Clustering. BigQuery: RLS does not participate in partition pruning. Both: avoid complex subqueries in policies, cache invalidation issues.
- Apache Ranger: Ranger UserSync syncs from AD/LDAP, centralized policy engine, delegates AuthN to IdP (Okta/Keycloak), plugins on Trino/Spark enforce policies.

# Evidence map
- Claim: ABAC reduces role explosion. Evidence: Databricks Unity Catalog documentation on Governed Tags.
- Claim: RLS affects query caching and can cause full table scans. Evidence: Snowflake row access policy optimization docs, BigQuery partition pruning limitations with RLS.
- Claim: Apache Ranger centralizes AuthZ but relies on SCIM/UserSync for Identity. Evidence: Apache Ranger architecture docs.

# Proposed outline
1. Introduction: Real-world access failure, system architecture perspective.
2. RBAC vs ABAC: The transition from static roles to dynamic attribute tags.
3. RLS & CLS Execution Impact: How security filters change query plans and impact performance (cache, partition pruning).
4. Centralized Governance & Federation: Okta, SCIM, Ranger, and the sync lag issue.
5. Best Practices: IaC, Service Accounts, Data Classification.
6. Key terms.
7. References.

# Editorial QA
- Humanized tone? Yes, avoiding buzzwords.
- No AI-sounding phrases? Checked.
- Technical depth? Yes, focusing on execution plans and partition pruning.
- Markdown links for references? Yes.
