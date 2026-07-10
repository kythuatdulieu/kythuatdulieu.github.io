// Danh mục bộ đề luyện chứng chỉ trong public/quizzes/.
// Một nguồn sự thật cho: trang /quizzes/, manifest.json (dropdown trong quiz),
// và mô tả trên trang chủ. Thư mục nào chưa khai báo ở đây sẽ rơi vào nhóm "Khác"
// với tên lấy từ id.

export const quizProviders = [
  'Databricks',
  'AWS',
  'Microsoft',
  'Google Cloud',
  'Snowflake',
  'Salesforce',
  'Khác',
];

// Bộ đề bị ẩn khỏi danh sách/manifest (bản raw trùng với bản đã có dịch tiếng Việt)
export const quizHidden = [
  'certified-data-engineer-professional',
  'certified-generative-ai-engineer-associate',
];

export const quizMeta = {
  // Databricks — 2 bộ song ngữ (vi: true) được ưu tiên, bản raw trùng nằm trong quizHidden
  'databricks-de-advanced': { name: 'Data Engineer Professional', provider: 'Databricks', vi: true },
  'databricks-genai-associate': { name: 'Generative AI Engineer Associate', provider: 'Databricks', vi: true },
  'certified-data-engineer-associate': { name: 'Data Engineer Associate', provider: 'Databricks' },
  'certified-machine-learning-associate': { name: 'Machine Learning Associate', provider: 'Databricks' },
  'certified-machine-learning-professional': { name: 'Machine Learning Professional', provider: 'Databricks' },
  'certified-data-analyst-associate': { name: 'Data Analyst Associate', provider: 'Databricks' },

  // AWS
  'aws-certified-ai-practitioner-aif-c01': { name: 'AI Practitioner (AIF-C01)', provider: 'AWS' },
  'aws-certified-data-engineer-associate-dea-c01': { name: 'Data Engineer Associate (DEA-C01)', provider: 'AWS' },
  'aws-certified-generative-ai-developer-professional-aip-c01': { name: 'Generative AI Developer Professional (AIP-C01)', provider: 'AWS' },
  'aws-certified-machine-learning-engineer-associate-mla-c01': { name: 'ML Engineer Associate (MLA-C01)', provider: 'AWS' },

  // Microsoft
  'ai-900': { name: 'AI-900: Azure AI Fundamentals', provider: 'Microsoft' },
  'ai-102': { name: 'AI-102: Azure AI Engineer Associate', provider: 'Microsoft' },
  'dp-900': { name: 'DP-900: Azure Data Fundamentals', provider: 'Microsoft' },
  'dp-100': { name: 'DP-100: Azure Data Scientist Associate', provider: 'Microsoft' },
  'dp-203': { name: 'DP-203: Azure Data Engineer Associate', provider: 'Microsoft' },
  'dp-300': { name: 'DP-300: Azure Database Administrator', provider: 'Microsoft' },
  'dp-420': { name: 'DP-420: Azure Cosmos DB Developer', provider: 'Microsoft' },
  'dp-600': { name: 'DP-600: Fabric Analytics Engineer', provider: 'Microsoft' },
  'dp-700': { name: 'DP-700: Fabric Data Engineer', provider: 'Microsoft' },

  // Google Cloud
  'associate-data-practitioner': { name: 'Associate Data Practitioner', provider: 'Google Cloud' },
  'professional-data-engineer': { name: 'Professional Data Engineer', provider: 'Google Cloud' },
  'professional-machine-learning-engineer': { name: 'Professional Machine Learning Engineer', provider: 'Google Cloud' },
  'professional-cloud-database-engineer': { name: 'Professional Cloud Database Engineer', provider: 'Google Cloud' },
  'generative-ai-leader': { name: 'Generative AI Leader', provider: 'Google Cloud' },

  // Snowflake
  'snowpro-advanced-data-engineer': { name: 'SnowPro Advanced: Data Engineer', provider: 'Snowflake' },
  'snowpro-advanced-data-scientist': { name: 'SnowPro Advanced: Data Scientist', provider: 'Snowflake' },
  'snowpro-specialty-gen-ai-ges-c01': { name: 'SnowPro Specialty: Gen AI (GES-C01)', provider: 'Snowflake' },

  // Salesforce
  'certified-ai-specialist': { name: 'Certified AI Specialist', provider: 'Salesforce' },
  'certified-data-cloud-consultant': { name: 'Data Cloud Consultant', provider: 'Salesforce' },
  'certified-data-architect': { name: 'Data Architect', provider: 'Salesforce' },

  // Khác
  'aigp': { name: 'IAPP AI Governance Professional (AIGP)', provider: 'Khác' },
  'ai-fundamentals': { name: 'AI Fundamentals', provider: 'Khác' },
  'd-dp-fn-01': { name: 'Dell Data Protection Foundations (D-DP-FN-01)', provider: 'Khác' },
};
