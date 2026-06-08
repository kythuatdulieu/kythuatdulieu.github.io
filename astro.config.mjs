// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeMermaidLite from 'rehype-mermaid-lite';

// https://astro.build/config
export default defineConfig({
	site: 'https://kythuatdulieu.github.io',
	markdown: {
		rehypePlugins: [
			[rehypeMermaidLite, { 
				// By default it turns ```mermaid into <pre class="mermaid">
			}]
		],
	},
	integrations: [
		starlight({
			title: 'Data Engineering Handbook',
			defaultLocale: 'root',
			locales: {
				root: { label: 'Tiếng Việt', lang: 'vi' }
			},
			components: {
				PageSidebar: './src/components/InteractiveGraphSidebar.astro',
				Footer: './src/components/BacklinksFooter.astro',
			},
			customCss: [
				'./src/styles/custom.css'
			],
			head: [
				{
					tag: 'script',
					attrs: { src: '/sidebar-resizer.js', defer: true },
				},
				{
					tag: 'script',
					attrs: { src: '/glossary.js', defer: true },
				},
				{
					tag: 'script',
					attrs: { type: 'module', src: '/mermaid-client.js' },
				},
				{
					tag: 'script',
					attrs: { src: 'https://unpkg.com/@popperjs/core@2', defer: true },
				},
				{
					tag: 'script',
					attrs: { src: 'https://unpkg.com/tippy.js@6', defer: true },
				},
				{
					tag: 'script',
					attrs: { src: '/popover.js', defer: true },
				},
				{
					tag: 'script',
					attrs: { src: '/focus.js', defer: true },
				},
				{
					tag: 'link',
					attrs: { rel: 'stylesheet', href: 'https://unpkg.com/tippy.js@6/animations/shift-away.css' },
				}
			],
			social: { github: 'https://github.com/kythuatdulieu' },
			sidebar: [
				{
					label: 'Khái niệm (Concepts)',

					collapsed: true,

					items: [
						{
							label: 'Cơ sở & Kiến trúc (Foundation)',

							collapsed: true,

							autogenerate: { directory: 'concepts/foundation' }
						},
						{
							label: 'Cơ sở dữ liệu & Lưu trữ (Database & Storage)',

							collapsed: true,

							autogenerate: { directory: 'concepts/database-storage' }
						},
						{
							label: 'Kho dữ liệu (Data Warehouse)',

							collapsed: true,

							autogenerate: { directory: 'concepts/data-warehouse' }
						},
						{
							label: 'Hồ dữ liệu & Lakehouse (Data Lake & Lakehouse)',

							collapsed: true,

							autogenerate: { directory: 'concepts/data-lake-lakehouse' }
						},
						{
							label: 'Tích hợp dữ liệu (ETL / ELT)',

							collapsed: true,

							autogenerate: { directory: 'concepts/etl-elt' }
						},
						{
							label: 'Biến đổi & Phân tích (Transformation & Analytics)',

							collapsed: true,

							autogenerate: { directory: 'concepts/transformation-analytics' }
						},
						{
							label: 'Kiến trúc hệ thống (System Architecture)',

							collapsed: true,

							autogenerate: { directory: 'concepts/system-architecture' }
						},
						{
							label: 'Xử lý theo lô (Batch Processing)',

							collapsed: true,

							autogenerate: { directory: 'concepts/batch-processing' }
						},
						{
							label: 'Xử lý luồng dữ liệu (Streaming Processing)',

							collapsed: true,

							autogenerate: { directory: 'concepts/streaming-processing' }
						},
						{
							label: 'Điều phối quy trình (Orchestration)',

							collapsed: true,

							autogenerate: { directory: 'concepts/orchestration' }
						},
						{
							label: 'Giám sát & Độ tin cậy (Observability & Reliability)',

							collapsed: true,

							autogenerate: { directory: 'concepts/observability-reliability' }
						},
						{
							label: 'Chất lượng dữ liệu (Data Quality)',

							collapsed: true,

							autogenerate: { directory: 'concepts/data-quality' }
						},
						{
							label: 'Quản trị & Siêu dữ liệu (Governance & Metadata)',

							collapsed: true,

							autogenerate: { directory: 'concepts/governance-metadata' }
						},
						{
							label: 'Nền tảng Cloud (Cloud Data Platform)',

							collapsed: true,

							autogenerate: { directory: 'concepts/cloud-data-platform' }
						},
						{
							label: 'GenAI & Machine Learning (GenAI / ML)',

							collapsed: true,

							autogenerate: { directory: 'concepts/genai-ml' }
						}
					]
				},
				{
					label: 'Lộ trình học (Learning Paths)',

					collapsed: true,

					autogenerate: { directory: 'learning-paths' },
				},
				{
					label: 'Phỏng vấn (Interview)',

					collapsed: true,

					autogenerate: { directory: 'interview' },
				},
				{
					label: 'Luyện đề thi thử (Quizzes)',

					collapsed: true,

					items: [
						{ 
							label: 'Databricks DE Professional',
							link: '/quizzes/databricks-de-advanced/',
							attrs: { 'data-astro-reload': true }
						},
						{ 
							label: 'Databricks GenAI Associate',
							link: '/quizzes/databricks-genai-associate/',
							attrs: { 'data-astro-reload': true }
						}
					]
				}
			],
		}),
	],
});
