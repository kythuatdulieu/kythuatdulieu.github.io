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
					label: 'Cẩm nang (Handbook)',
					items: [
						{
							label: '1. Nền tảng & Kiến trúc (Foundations & Architecture)',
							collapsed: true,
							items: conceptCategories.filter(cat => cat.slug.startsWith('1-')).map(cat => ({
								label: cat.label,
								collapsed: true,
								autogenerate: { directory: `concepts/${cat.slug}` }
							}))
						},
						{
							label: '2. Tầng Lưu trữ (Data Storage)',
							collapsed: true,
							items: conceptCategories.filter(cat => cat.slug.startsWith('2-')).map(cat => ({
								label: cat.label,
								collapsed: true,
								autogenerate: { directory: `concepts/${cat.slug}` }
							}))
						},
						{
							label: '3. Thu thập & Biến đổi (Ingestion & Transformation)',
							collapsed: true,
							items: conceptCategories.filter(cat => cat.slug.startsWith('3-')).map(cat => ({
								label: cat.label,
								collapsed: true,
								autogenerate: { directory: `concepts/${cat.slug}` }
							}))
						},
						{
							label: '4. Thời gian thực & Luồng (Real-time)',
							collapsed: true,
							items: conceptCategories.filter(cat => cat.slug.startsWith('4-')).map(cat => ({
								label: cat.label,
								collapsed: true,
								autogenerate: { directory: `concepts/${cat.slug}` }
							}))
						},
						{
							label: '5. Phục vụ & Phân tích (Serving & Analytics)',
							collapsed: true,
							items: conceptCategories.filter(cat => cat.slug.startsWith('5-')).map(cat => ({
								label: cat.label,
								collapsed: true,
								autogenerate: { directory: `concepts/${cat.slug}` }
							}))
						},
						{
							label: '6. DataOps & Điều phối (DataOps)',
							collapsed: true,
							items: conceptCategories.filter(cat => cat.slug.startsWith('6-')).map(cat => ({
								label: cat.label,
								collapsed: true,
								autogenerate: { directory: `concepts/${cat.slug}` }
							}))
						},
						{
							label: '7. Bảo mật & Quản trị (Security & Governance)',
							collapsed: true,
							items: conceptCategories.filter(cat => cat.slug.startsWith('7-')).map(cat => ({
								label: cat.label,
								collapsed: true,
								autogenerate: { directory: `concepts/${cat.slug}` }
							}))
						},
						{
							label: '8. GenAI & ML Engineering',
							collapsed: true,
							items: conceptCategories.filter(cat => cat.slug.startsWith('8-')).map(cat => ({
								label: cat.label,
								collapsed: true,
								autogenerate: { directory: `concepts/${cat.slug}` }
							}))
						}
					]
				},
				{
					label: 'Dự án E2E (E2E Projects)',
					collapsed: true,
					autogenerate: { directory: 'projects' },
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
