const fs = require('fs');
const path = require('path');

const docsDir = path.join('/home/duclinh/kythuatdulieu.github.io/src/content/docs');

const filesToCreate = [
  // System Design
  { path: 'system-design/lambda-vs-kappa-architecture.md', title: 'Lambda vs Kappa Architecture' },
  { path: 'system-design/modern-vs-post-modern-data-stack.md', title: 'Modern Data Stack vs Post-Modern Data Stack' },
  { path: 'system-design/data-mesh-vs-data-fabric.md', title: 'Data Mesh vs Data Fabric' },
  { path: 'system-design/finops-architecture.md', title: 'Thiết kế Kiến trúc tối ưu chi phí (FinOps)' },
  { path: 'system-design/uber-log-analytics-case-study.md', title: 'Case Study: Kiến trúc Log Analytics tại Uber' },
  { path: 'system-design/netflix-recommendation-architecture.md', title: 'Case Study: Kiến trúc Recommendation tại Netflix' },
  { path: 'system-design/airbnb-dynamic-pricing.md', title: 'Case Study: Dynamic Pricing tại Airbnb' },
  { path: 'system-design/idempotency-in-data-pipelines.md', title: 'Design Pattern: Idempotency trong Data Pipelines' },
  { path: 'system-design/rate-limiting-data-apis.md', title: 'Design Pattern: Rate Limiting cho Data APIs' },
  { path: 'system-design/distributed-caching-strategies.md', title: 'Design Pattern: Distributed Caching' },

  // Career Leadership (Adding to the existing files)
  { path: 'career-leadership/writing-design-docs-rfc.md', title: 'Nghệ thuật viết Design Doc (RFC / Tech Spec)' },
  { path: 'career-leadership/on-call-survival-guide.md', title: 'On-call Survival Guide & Incident Management' },
  { path: 'career-leadership/boring-data-engineering.md', title: 'Boring Data Engineering: Tại sao SQL và Cronjob vẫn "gánh" 90% doanh nghiệp?' },
  { path: 'career-leadership/big-tech-vs-startups.md', title: 'Làm Data Engineer ở Big Tech vs Công ty truyền thống vs Startup' },
  { path: 'career-leadership/post-mortems-culture.md', title: 'Văn hóa viết Post-mortems (Không đổ lỗi)' },
  { path: 'career-leadership/proving-data-roi.md', title: 'Cách chứng minh ROI và Business Value của Data Pipeline' }
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
