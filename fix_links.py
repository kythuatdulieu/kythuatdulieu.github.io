import os
import re

files = [
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
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace ![alt](url] with ![alt](url)
        content = re.sub(r'!\[(.*?)\]\((.*?)]', r'![\1](\2)', content)
        
        # Replace [text](url] with [text](url)
        content = re.sub(r'\[(.*?)\]\((.*?)]', r'[\1](\2)', content)
        
        # Replace [[LLM](/url]) with [LLM](/url)
        content = re.sub(r'\[\[(.*?)\]\((.*?)]\)', r'[\1](\2)', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

