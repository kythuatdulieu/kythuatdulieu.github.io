<h1 align="center">Sổ Tay Kỹ Thuật Dữ Liệu</h1>

<p align="center">
  Ghi chú, concept và bài thực hành Data Engineering bằng tiếng Việt.<br>
  <a href="https://kythuatdulieu.github.io">kythuatdulieu.github.io</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Apache%20Spark-E25A1C?style=flat&logo=apachespark&logoColor=white" />
  <img src="https://img.shields.io/badge/Databricks-FF3621?style=flat&logo=databricks&logoColor=white" />
  <img src="https://img.shields.io/badge/Microsoft%20Fabric-0078D4?style=flat&logo=microsoft&logoColor=white" />
  <img src="https://img.shields.io/badge/Snowflake-29B5E8?style=flat&logo=snowflake&logoColor=white" />
  <img src="https://img.shields.io/badge/dbt-FF694B?style=flat&logo=dbt&logoColor=white" />
  <img src="https://img.shields.io/badge/Airflow-017CEE?style=flat&logo=apacheairflow&logoColor=white" />
</p>

---

### Về phần này

Mình là Nguyễn Đức Linh. Mình xây [kythuatdulieu.github.io](https://kythuatdulieu.github.io) để ghi lại kiến thức data engineering theo cách có thể đọc lại, sửa lại và nối được với nhau.

Site tập trung vào các chủ đề thường gặp trong công việc dữ liệu: ETL/ELT, lakehouse, data pipeline, orchestration, data quality, observability, governance, cloud data platform và GenAI. Mục tiêu không phải viết thật nhiều thuật ngữ, mà là làm rõ một concept tồn tại để giải quyết vấn đề gì và nó liên quan thế nào đến những phần còn lại của hệ thống.

Một vài phần đang được phát triển:

- **Concepts:** giải thích các khái niệm nền tảng và liên kết chéo giữa những bài liên quan.
- **Learning Paths:** gợi ý thứ tự học theo giai đoạn nghề nghiệp và hướng chuyên sâu.
- **Interview QA:** nhóm câu hỏi theo SQL, Python, data modeling, Spark, Kafka, cloud và incident.
- **Quizzes:** bộ câu hỏi để tự kiểm tra, trong đó có phần ôn Databricks.

---

### Một số repo thực hành

Các repo dưới đây là nơi mình thử nghiệm pipeline, công cụ và kiến trúc. Bài viết trên website dùng chúng làm ví dụ để phân tích lại thiết kế, trade-off và những điểm cần chú ý khi vận hành.

- [**EcomLake**](https://github.com/kythuatdulieu/EcomLake) — ELT pipeline cho dữ liệu thương mại điện tử với Dagster, Spark, Delta Lake, MinIO và Streamlit.  
  [Đọc ghi chú](https://kythuatdulieu.github.io/projects/e2e/ecomlake/)

- [**snowflakedemo**](https://github.com/kythuatdulieu/snowflakedemo) — thử nghiệm Medallion Architecture trên Snowflake, gồm Snowpipe, event-driven ingestion và data quality.  
  [Đọc ghi chú](https://kythuatdulieu.github.io/projects/e2e/snowflakedemo/)

- [**FMD_FRAMEWORK**](https://github.com/kythuatdulieu/FMD_FRAMEWORK) — thử nghiệm metadata-driven pipeline trên Microsoft Fabric. Repo này được fork và tùy chỉnh từ FMD Framework gốc.  
  [Đọc ghi chú](https://kythuatdulieu.github.io/projects/e2e/fabric-metadata-framework/)

- [**movie-analytics-pipeline**](https://github.com/kythuatdulieu/movie-analytics-pipeline) — local data stack với DuckDB, dbt, Apache Airflow và Superset.  
  [Đọc ghi chú](https://kythuatdulieu.github.io/projects/e2e/movie-analytics-pipeline/)

---

### Tài liệu ôn tập

<p align="left">
  <img src="https://img.shields.io/badge/Databricks-Data%20Engineer%20Professional-FF3621?style=flat&logo=databricks&logoColor=white" />
  <img src="https://img.shields.io/badge/Databricks-Generative%20AI%20Associate-FF3621?style=flat&logo=databricks&logoColor=white" />
</p>

Một phần quiz trên site được viết để ôn lại kiến thức cho Databricks Data Engineer Professional và Databricks Generative AI Associate. Mình dùng chúng như checklist học lại concept, không xem đây là thay thế cho tài liệu gốc của Databricks.

---

<p align="center">
  Nếu thấy chỗ nào sai, thiếu nguồn, hoặc giải thích chưa rõ, issue và pull request đều hữu ích.
</p>
