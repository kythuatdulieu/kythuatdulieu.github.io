const fs = require('fs');
const files = [
  "src/content/docs/concepts/3-integration/batch-processing/apache-spark.md",
  "src/content/docs/concepts/4-realtime/message-queue/apache-kafka.md",
  "src/content/docs/concepts/4-realtime/stream-calculation/spark-vs-flink-comparison.md",
  "src/content/docs/concepts/2-storage/cloud-data-platform/snowflake.md",
  "src/content/docs/concepts/2-storage/cloud-data-platform/google-bigquery.md",
  "src/content/docs/concepts/2-storage/data-lake-lakehouse/delta-lake.md",
  "src/content/docs/concepts/2-storage/data-lake-lakehouse/apache-iceberg.md",
  "src/content/docs/concepts/2-storage/data-lake-lakehouse/apache-hudi.md",
  "src/content/docs/concepts/3-integration/orchestration/apache-airflow.md",
  "src/content/docs/concepts/3-integration/transformation-analytics/dbt.md",
  "src/content/docs/concepts/3-integration/etl-elt/change-data-capture.md",
  "src/content/docs/concepts/2-storage/data-lake-lakehouse/lakehouse.md",
  "src/content/docs/concepts/1-foundations/system-architecture/data-mesh.md",
  "src/content/docs/concepts/6-ai-ml/rag-search/rag.md",
  "src/content/docs/concepts/6-ai-ml/rag-search/vector-database.md"
];

for (const file of files) {
  if (!fs.existsSync(file)) {
      console.log(`NOT FOUND: ${file}`);
      continue;
  }
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let start = -1;
  let targetContent = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```mermaid')) {
      start = i;
      targetContent = [lines[i]];
    } else if (start !== -1) {
      targetContent.push(lines[i]);
      if (lines[i] === '```') {
        console.log(`\n=== ${file} ===`);
        console.log(`StartLine: ${start + 1}, EndLine: ${i + 1}`);
        console.log(targetContent.join('\n'));
        start = -1;
        targetContent = [];
      }
    }
  }
}
