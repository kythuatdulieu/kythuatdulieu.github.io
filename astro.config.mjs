// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeMermaidLite from 'rehype-mermaid-lite';
import { conceptCategories } from './src/config/categories.js';

// https://astro.build/config
export default defineConfig({
	site: 'https://kythuatdulieu.github.io',
	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [
			[rehypeKatex, { strict: 'ignore' }],
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
				Footer: './src/components/BacklinksFooter.astro',
				Head: './src/components/CustomHead.astro',
			},
			customCss: [
				'./src/styles/custom.css'
			],
			head: [
				{
					tag: 'script',
					attrs: { src: 'https://www.googletagmanager.com/gtag/js?id=G-0B1XQQ61EY', async: true },
				},
				{
					tag: 'script',
					content: `
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', 'G-0B1XQQ61EY');
					`,
				},
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
					tag: 'script',
					attrs: { src: '/code-toggle.js', defer: true },
				},
				{
					tag: 'script',
					attrs: { src: '/image-viewer.js', defer: true },
				},
				{
					tag: 'link',
					attrs: { rel: 'stylesheet', href: 'https://unpkg.com/tippy.js@6/dist/tippy.css' },
				},
				{
					tag: 'link',
					attrs: { rel: 'stylesheet', href: 'https://unpkg.com/tippy.js@6/animations/shift-away.css' },
				}
			],
			social: { github: 'https://github.com/kythuatdulieu/kythuatdulieu.github.io' },
			sidebar: [
				{
					label: '1. Khái niệm Cốt lõi (Concepts)',
					items: [
						{
							label: '1. Hệ thống Phân tán & Kiến trúc',
							collapsed: true,
							autogenerate: { directory: 'concepts/1-distributed-systems-architecture' }
						},
						{
							label: '2. Thu nạp & Tích hợp Dữ liệu',
							collapsed: true,
							autogenerate: { directory: 'concepts/2-data-ingestion-integration' }
						},
						{
							label: '3. Lưu trữ & Định dạng (Storage)',
							collapsed: true,
							autogenerate: { directory: 'concepts/3-storage-engines-formats' }
						},
						{
							label: '4. Tính toán Lô (Batch Compute)',
							collapsed: true,
							autogenerate: { directory: 'concepts/4-compute-engines-batch' }
						},
						{
							label: '5. Xử lý Luồng (Real-time Streaming)',
							collapsed: true,
							autogenerate: { directory: 'concepts/5-stream-processing-realtime' }
						},
						{
							label: '6. Mô hình hóa & Biến đổi',
							collapsed: true,
							autogenerate: { directory: 'concepts/6-data-modeling-transformation' }
						},
						{
							label: '7. Điều phối & DataOps',
							collapsed: true,
							autogenerate: { directory: 'concepts/7-dataops-orchestration-quality' }
						},
						{
							label: '8. Bảo mật, Quản trị & FinOps',
							collapsed: true,
							autogenerate: { directory: 'concepts/8-security-governance-finops' }
						},
						{
							label: '9. AI & Machine Learning',
							collapsed: true,
							autogenerate: { directory: 'concepts/9-genai-machine-learning' }
						}
					]
				},
				{
					label: '2. Lộ trình & Sự nghiệp (Learning Paths)',
					collapsed: true,
					autogenerate: { directory: 'learning-paths' }
				},
				{
					label: '3. Dự án & Thiết kế Hệ thống (Projects)',
					collapsed: true,
					autogenerate: { directory: 'projects' }
				},
				{
					label: '4. Phỏng vấn (Interview QA)',
					collapsed: true,
					autogenerate: { directory: 'interview' },
				},
				{
					label: 'Ôn thi Certificate (Quizzes)',

					collapsed: true,

					items: [
						{ 
							label: 'Databricks Certified Data Engineer Professional',
							link: '/quizzes/databricks-de-advanced/',
							attrs: { 'data-astro-reload': true }
						},
						{ 
							label: 'Databricks Certified Generative AI Engineer Associate',
							link: '/quizzes/databricks-genai-associate/',
							attrs: { 'data-astro-reload': true }
						}
					]
				}
			],
		}),
	],
});
