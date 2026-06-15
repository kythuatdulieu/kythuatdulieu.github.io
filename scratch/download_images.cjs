const https = require('https');
const fs = require('fs');
const path = require('path');

const configs = [
  { slug: 'apache-spark', url: 'https://spark.apache.org/docs/latest/img/cluster-overview.png' },
  { slug: 'apache-kafka', url: 'https://kafka.apache.org/20/images/kafka-apis.png' },
  { slug: 'apache-flink', url: 'https://flink.apache.org/img/flink-home-architecture.png' },
  { slug: 'snowflake', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Snowflake_Inc._Logo.svg/1200px-Snowflake_Inc._Logo.svg.png' },
  { slug: 'google-bigquery', url: 'https://cloud.google.com/static/architecture/images/bigquery-architecture.svg' },
  { slug: 'delta-lake', url: 'https://docs.delta.io/latest/_static/delta-lake-logo.png' },
  { slug: 'apache-iceberg', url: 'https://iceberg.apache.org/img/iceberg-architecture.png' },
  { slug: 'apache-hudi', url: 'https://hudi.apache.org/assets/images/hudi-architecture-1.png' },
  { slug: 'apache-airflow', url: 'https://airflow.apache.org/docs/apache-airflow/stable/_images/arch-diag-basic.png' },
  { slug: 'dbt', url: 'https://docs.getdbt.com/img/dbt-logo.svg' },
  { slug: 'change-data-capture', url: 'https://debezium.io/documentation/reference/stable/_images/debezium-architecture.png' },
  { slug: 'lakehouse', url: 'https://databricks.com/wp-content/uploads/2020/01/data-lakehouse-architecture-1.png' },
  { slug: 'data-mesh', url: 'https://martinfowler.com/articles/data-monolith-to-mesh/data-mesh.png' },
  { slug: 'rag', url: 'https://python.langchain.com/v0.1/assets/images/rag_landscape-e836968d90fa6195fbaf7956cf9b7b9f.png' },
  { slug: 'vector-database', url: 'https://milvus.io/docs/v2.1.x/assets/milvus_architecture.png' }
];

function downloadImage(url, filepath, fallbackSlug) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href, filepath, fallbackSlug).then(resolve).catch(reject);
      } else {
        const fallbackUrl = `https://placehold.co/800x400/e2e8f0/1e293b.png?text=${fallbackSlug}+Architecture`;
        https.get(fallbackUrl, (fallbackRes) => {
            const fileStream = fs.createWriteStream(filepath);
            fallbackRes.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
        }).on('error', reject);
      }
    }).on('error', (err) => {
        const fallbackUrl = `https://placehold.co/800x400/e2e8f0/1e293b.png?text=${fallbackSlug}+Architecture`;
        https.get(fallbackUrl, (fallbackRes) => {
            const fileStream = fs.createWriteStream(filepath);
            fallbackRes.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
        }).on('error', reject);
    });
  });
}

async function main() {
  for (const config of configs) {
    const dir = path.join('public', 'images', config.slug);
    fs.mkdirSync(dir, { recursive: true });
    const filepath = path.join(dir, 'architecture.png');
    console.log(`Downloading ${config.slug}...`);
    try {
        await downloadImage(config.url, filepath, config.slug);
    } catch(e) {
        console.error(`Error downloading ${config.slug}`, e);
    }
  }
  console.log("All done");
}

main();
