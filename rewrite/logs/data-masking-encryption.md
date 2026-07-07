# Assumptions
- Target reader: Senior Data Engineers, Data Platform Engineers.
- Content goal: Explain the physical execution, architecture trade-offs, and operational risks of Data Masking and Encryption (KMS, DDM, Tokenization, FPE) at scale.
- Scope includes: Envelope Encryption (AWS KMS), KMS Throttling, Dynamic Data Masking (DDM) on Databricks/Snowflake, Tokenization, Format-Preserving Encryption (FPE), and Cartesian Explosions during joins on masked/tokenized data.

# Research map
- Envelope Encryption AWS KMS data lake architecture: AWS docs and blogs explain the KEK/DEK pattern to avoid sending TBs of data over HTTP.
- S3 Bucket Keys & KMS Throttling: S3 Bucket Keys reduce KMS API calls by up to 99%, preventing ThrottlingException when reading thousands of small files.
- Databricks Dynamic Data Masking & Predicate Pushdown: DDM uses UDFs evaluated at query time. Complex UDFs break predicate pushdown, leading to full table scans and performance bottlenecks.
- Format-Preserving Encryption (FPE) vs Tokenization: FPE (e.g., AES-FF3) encrypts data keeping original format without a vault. Tokenization replaces data with a token via a vault (Vaulted) or vaultless. 
- Cartesian Explosion: Joining masked/tokenized datasets with high frequency of same masked values (e.g., "***") leads to OOM errors.

# Evidence map
| Claim | Evidence | Source | Confidence | Notes |
| --- | --- | --- | --- | --- |
| Envelope Encryption uses KEK and DEK | AWS KMS documentation | AWS | High | Standard practice |
| S3 Bucket Keys reduce KMS requests by up to 99% | AWS documentation | AWS | High | Essential for FinOps and preventing throttling |
| DDM breaks predicate pushdown | Databricks documentation on Row Filters and Column Masks | Databricks | High | Crucial performance trade-off |
| Join on masked column causes Cartesian explosion | Engineering experience / General DE | General DE | High | Known anti-pattern |
| FPE preserves format allowing schema compatibility | NIST SP 800-38G | NIST | High | AES-FF1/FF3 |

# Proposed outline
1. Mở bài bằng vấn đề cụ thể (Security vs Performance vs Cost).
2. Tầng Storage: Envelope Encryption (AWS KMS). Giải thích KEK/DEK. Rủi ro Throttling và giải pháp S3 Bucket Keys.
3. Tầng Compute: Dynamic Data Masking (DDM). Cơ chế hoạt động (UDF). Rủi ro mất Predicate Pushdown.
4. Tầng Integration: Format-Preserving Encryption (FPE) & Tokenization. Xử lý legacy system. Rủi ro Cartesian Explosion.
5. Khi nào nên dùng công nghệ nào (Decision Framework).
6. References.

# Editorial QA
- Humanized? Yes, removed marketing terms and vague claims.
- Enough sources? Yes.
- No AI sounding phrases.
- Addressed operational risks (OOM, Throttling, Full Table Scan).
