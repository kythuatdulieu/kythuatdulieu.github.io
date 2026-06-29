const fs = require('fs');

const files = [
  'src/content/docs/concepts/1-distributed-systems-architecture/kappa-architecture.md',
  'src/content/docs/concepts/4-compute-engines-batch/distributed-processing.md',
  'src/content/docs/concepts/4-compute-engines-batch/spark-aqe-adaptive-query.md',
  'src/content/docs/concepts/4-compute-engines-batch/spark-data-skew-salting.md',
  'src/content/docs/concepts/4-compute-engines-batch/spark-tungsten-engine.md',
  'src/content/docs/concepts/5-stream-processing-realtime/apache-kafka.md',
  'src/content/docs/concepts/6-data-modeling-transformation/data-vault-modeling.md',
  'src/content/docs/concepts/6-data-modeling-transformation/snowflake-schema.md',
  'src/content/docs/concepts/7-dataops-orchestration-quality/data-quality.md',
  'src/content/docs/concepts/7-dataops-orchestration-quality/task-dependency.md',
  'src/content/docs/concepts/9-genai-machine-learning/recall.md',
  'src/content/docs/concepts/9-genai-machine-learning/temperature.md'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    // Fix ![alt](url] to ![alt](url)
    content = content.replace(/!\[(.*?)\]\((.*?)]/g, '![$1]($2)');
    // Fix [text](url] to [text](url)
    content = content.replace(/\[(.*?)\]\((.*?)]/g, '[$1]($2)');
    // Fix [[LLM](/url]) to [LLM](/url)
    content = content.replace(/\[\[(.*?)\]\((.*?)]\)/g, '[$1]($2)');
    
    fs.writeFileSync(file, content);
  }
}
