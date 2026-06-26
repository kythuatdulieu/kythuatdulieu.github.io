const fs = require('fs');
const path = require('path');

const docsDir = path.join('/home/duclinh/kythuatdulieu.github.io/src/content/docs');

const filesToCreate = [
  { path: 'concepts/3-storage-engines-formats/time-series-databases.md', title: 'Time Series Databases (InfluxDB, TimescaleDB, ClickHouse)' },
  { path: 'concepts/3-storage-engines-formats/z-order-liquid-clustering.md', title: 'Tối ưu hóa truy vấn: Z-Ordering vs Liquid Clustering' },
  { path: 'concepts/3-storage-engines-formats/file-formats-deep-dive.md', title: 'Cấu trúc định dạng File: Parquet, ORC, Avro và JSON' },
  { path: 'concepts/4-compute-engines-batch/troubleshooting-spark-oom.md', title: 'Troubleshooting: Xử lý lỗi Out Of Memory (OOM) trong Spark' }
];

filesToCreate.forEach(file => {
  const fullPath = path.join(docsDir, file.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  if (!fs.existsSync(fullPath)) {
    const content = `---
title: "${file.title}"
description: "Bài viết đang được cập nhật..."
---

Bài viết này thuộc khuôn khổ V6 MECE Curriculum và đang chờ Wave Manager xử lý.
`;
    fs.writeFileSync(fullPath, content);
    console.log(`Created: ${file.path}`);
  }
});
