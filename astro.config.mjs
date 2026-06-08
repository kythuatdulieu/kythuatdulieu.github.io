// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkMermaid } from './mermaid-plugin.js';

// https://astro.build/config
export default defineConfig({
	site: 'https://kythuatdulieu.github.io',
	markdown: {
		remarkPlugins: [remarkMermaid],
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
					attrs: { src: '/glossary.js', defer: true },
				},
				{
					tag: 'script',
					attrs: { type: 'module', src: '/mermaid-init.js' },
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
					items: [
						{
							label: 'Cơ sở & Kiến trúc (Foundation)',
							autogenerate: { directory: 'concepts/foundation' }
						},
						{
							label: 'Cơ sở dữ liệu & Lưu trữ (Database & Storage)',
							autogenerate: { directory: 'concepts/database-storage' }
						},
						{
							label: 'Kho dữ liệu (Data Warehouse)',
							autogenerate: { directory: 'concepts/data-warehouse' }
						},
						{
							label: 'Hồ dữ liệu & Lakehouse (Data Lake & Lakehouse)',
							autogenerate: { directory: 'concepts/data-lake-lakehouse' }
						},
						{
							label: 'Tích hợp dữ liệu (ETL / ELT)',
							autogenerate: { directory: 'concepts/etl-elt' }
						},
						{
							label: 'Biến đổi & Phân tích (Transformation & Analytics)',
							autogenerate: { directory: 'concepts/transformation-analytics' }
						},
						{
							label: 'Kiến trúc hệ thống (System Architecture)',
							autogenerate: { directory: 'concepts/system-architecture' }
						},
						{
							label: 'Xử lý theo lô (Batch Processing)',
							autogenerate: { directory: 'concepts/batch-processing' }
						},
						{
							label: 'Xử lý luồng dữ liệu (Streaming Processing)',
							autogenerate: { directory: 'concepts/streaming-processing' }
						},
						{
							label: 'Điều phối quy trình (Orchestration)',
							autogenerate: { directory: 'concepts/orchestration' }
						},
						{
							label: 'Giám sát & Độ tin cậy (Observability & Reliability)',
							autogenerate: { directory: 'concepts/observability-reliability' }
						},
						{
							label: 'Chất lượng dữ liệu (Data Quality)',
							autogenerate: { directory: 'concepts/data-quality' }
						},
						{
							label: 'Quản trị & Siêu dữ liệu (Governance & Metadata)',
							autogenerate: { directory: 'concepts/governance-metadata' }
						},
						{
							label: 'Nền tảng Cloud (Cloud Data Platform)',
							autogenerate: { directory: 'concepts/cloud-data-platform' }
						},
						{
							label: 'GenAI & Machine Learning (GenAI / ML)',
							autogenerate: { directory: 'concepts/genai-ml' }
						}
					]
				},
				{
					label: 'Lộ trình học (Learning Paths)',
					autogenerate: { directory: 'learning-paths' },
				},
				{
					label: 'Phỏng vấn (Interview)',
					autogenerate: { directory: 'interview' },
				}
			],
		}),
	],
});
