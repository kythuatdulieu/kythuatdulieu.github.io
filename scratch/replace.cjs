const fs = require('fs');

const replacements = [
  {
    file: "src/content/docs/concepts/2-storage/cloud-data-platform/google-bigquery.md",
    slug: "google-bigquery"
  },
  {
    file: "src/content/docs/concepts/3-integration/transformation-analytics/dbt.md",
    slug: "dbt"
  },
  {
    file: "src/content/docs/concepts/3-integration/etl-elt/change-data-capture.md",
    slug: "change-data-capture"
  },
  {
    file: "src/content/docs/concepts/2-storage/data-lake-lakehouse/lakehouse.md",
    slug: "lakehouse"
  },
  {
    file: "src/content/docs/concepts/6-ai-ml/rag-search/rag.md",
    slug: "rag"
  },
  {
    file: "src/content/docs/concepts/6-ai-ml/rag-search/vector-database.md",
    slug: "vector-database"
  }
];

for (const rep of replacements) {
  let content = fs.readFileSync(rep.file, 'utf8');
  const regex = /```mermaid[\s\S]*?```/;
  if (regex.test(content)) {
      content = content.replace(regex, `![Kiến trúc chính thức](/images/${rep.slug}/architecture.png)`);
      fs.writeFileSync(rep.file, content, 'utf8');
      console.log(`Replaced in ${rep.file}`);
  } else {
      console.log(`No mermaid found in ${rep.file}`);
  }
}
