#!/bin/bash
urls=(
  "https://spark.apache.org/docs/latest/img/cluster-overview.png"
  "https://docs.confluent.io/platform/current/_images/kafka-architecture.png"
  "https://nightlies.apache.org/flink/flink-docs-release-1.19/fig/flink-architecture.png"
  "https://docs.snowflake.com/en/_images/architecture-1-diagram.png"
  "https://iceberg.apache.org/img/iceberg-architecture.png"
  "https://airflow.apache.org/docs/apache-airflow/stable/_images/arch-diag-basic.png"
  "https://debezium.io/documentation/reference/stable/_images/debezium-architecture.png"
  "https://martinfowler.com/articles/data-monolith-to-mesh/data-mesh.png"
)

for url in "${urls[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "$url : $status"
done
