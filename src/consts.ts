// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Kỹ Thuật Dữ Liệu';
export const SITE_DESCRIPTION = 'Cộng đồng chia sẻ kiến thức về Data Analytics, Engineering, Science và AI';

export const CATEGORIES = {
  'data-analytics-bi': {
    name: 'Data Analytics & Business Intelligence',
    description: 'Tập trung vào kỹ năng phân tích dữ liệu và trực quan hóa để tạo insight hỗ trợ quyết định kinh doanh',
    icon: 'chart-line',
    color: '#2563eb',
    order: 1
  },
  'data-engineering-infra': {
    name: 'Data Engineering & Infrastructure',
    description: 'Bao phủ kỹ năng thiết kế, xây dựng và quản lý hạ tầng dữ liệu',
    icon: 'database',
    color: '#dc2626',
    order: 2
  },
  'data-science-ml': {
    name: 'Data Science & Machine Learning',
    description: 'Tập trung vào phát triển các mô hình machine learning',
    icon: 'brain',
    color: '#7c3aed',
    order: 3
  },
  'generative-ai-llm': {
    name: 'Generative AI & Large Language Models',
    description: 'Khai thác AI thế hệ mới, bao gồm LLMs, prompt engineering',
    icon: 'robot',
    color: '#059669',
    order: 4
  },
  'automation-workflow': {
    name: 'Automation & Workflow Optimization',
    description: 'Tự động hóa quy trình làm việc sử dụng n8n, Make, Zapier',
    icon: 'cogs',
    color: '#ea580c',
    order: 5
  },
  'life-career-skills': {
    name: 'Life, Career & Other Skills',
    description: 'Kinh nghiệm, góc nhìn, kỹ năng mềm, phương pháp học tập',
    icon: 'user-graduate',
    color: '#0891b2',
    order: 6
  }
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
