export const categories = [
    { slug: '1-distributed-systems-architecture', label: '1. Kiến Trúc Hệ Thống Phân Tán' },
    { slug: '2-data-ingestion-integration', label: '2. Tích Hợp & Thu Thập Dữ Liệu' },
    { slug: '3-storage-engines-formats', label: '3. Storage Engines & Định Dạng' },
    { slug: '4-compute-engines-batch', label: '4. Compute Engines & Batch' },
    { slug: '5-stream-processing-realtime', label: '5. Xử Lý Luồng & Real-time' },
    { slug: '6-data-modeling-transformation', label: '6. Data Modeling & Biến Đổi' },
    { slug: '7-dataops-orchestration-quality', label: '7. DataOps & Quản Trị Chất Lượng' },
    { slug: '8-security-governance-finops', label: '8. Bảo Mật, Quản Trị & FinOps' },
    { slug: '9-genai-machine-learning', label: '9. GenAI & Machine Learning' }
];

export const domains = [
  { id: 'DE', label: 'Data Engineering', color: '#378add' },
  { id: 'DA', label: 'Analytics', color: '#1d9e75' },
  { id: 'DS', label: 'Data Science', color: '#7f77dd' },
  { id: 'Platform', label: 'Platform', color: '#5f5e5a' },
];

export const levels = [
  { id: 'Fresher', label: 'Fresher', order: 1 },
  { id: 'Junior',  label: 'Junior',  order: 2 },
  { id: 'Middle',  label: 'Middle',  order: 3 },
  { id: 'Senior',  label: 'Senior',  order: 4 },
];

// Helpers để validate + lọc
export const domainIds = domains.map(d => d.id);
export const levelIds = levels.map(l => l.id);
export const categorySlugs = categories.map(c => c.slug);
export const domainById = Object.fromEntries(domains.map(d => [d.id, d]));
export const levelById = Object.fromEntries(levels.map(l => [l.id, l]));

// Backward-compat: nhiều nơi đang import { conceptCategories } from './categories.js'
export const conceptCategories = categories;
