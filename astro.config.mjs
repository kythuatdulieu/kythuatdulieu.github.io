// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeMermaidLite from 'rehype-mermaid-lite';
import { conceptCategories } from './src/config/categories.js';
import { remarkAutoLink } from './src/plugins/remark-auto-link.js';
import fs from 'fs';
import path from 'path';

const quizManifest = JSON.parse(fs.readFileSync(path.resolve('./public/quizzes/manifest.json'), 'utf-8'));
const quizGroups = {};
for (const q of quizManifest) {
	if (!quizGroups[q.provider]) quizGroups[q.provider] = [];
	quizGroups[q.provider].push({
		label: q.name + (q.vi ? ' (song ngữ)' : ''),
		link: `/quizzes/${q.id}/index.html?v=1`,
		attrs: { target: '_blank', rel: 'noopener noreferrer' }
	});
}
const quizSidebarItems = [{ label: 'Danh sách bộ đề', link: '/quizzes/' }];
for (const [provider, items] of Object.entries(quizGroups)) {
	quizSidebarItems.push({
		label: provider,
		collapsed: true,
		items: items.sort((a, b) => a.label.localeCompare(b.label))
	});
}

// https://astro.build/config
export default defineConfig({
	site: 'https://kythuatdulieu.github.io',
	// Redirect các slug bị gộp trong audit 2026-07 (giữ link cũ không gãy)
	redirects: {
		'/concepts/9-genai-machine-learning/embedding-model/': '/concepts/9-genai-machine-learning/embedding-models/',
		'/concepts/9-genai-machine-learning/reranker/': '/concepts/9-genai-machine-learning/reranking/',
		'/concepts/9-genai-machine-learning/few-shot/': '/concepts/9-genai-machine-learning/few-shot-prompting/',
		'/concepts/9-genai-machine-learning/chunking-strategy/': '/concepts/9-genai-machine-learning/chunking/',
		'/concepts/3-storage-engines-formats/vector-store/': '/concepts/3-storage-engines-formats/vector-database/',
		'/concepts/9-genai-machine-learning/row-based-storage/': '/concepts/3-storage-engines-formats/row-based-storage/',
		'/concepts/1-distributed-systems-architecture/file-formats/': '/concepts/3-storage-engines-formats/file-formats-deep-dive/',
	},
	markdown: {
		remarkPlugins: [remarkMath, remarkAutoLink],
		rehypePlugins: [
			[rehypeKatex, { strict: 'ignore' }],
			[rehypeMermaidLite, { 
				// By default it turns ```mermaid into <pre class="mermaid">
			}]
		],
	},
	integrations: [
		starlight({
			title: 'Sổ tay Kỹ thuật Dữ liệu',
			defaultLocale: 'root',
			locales: {
				root: { label: 'Tiếng Việt', lang: 'vi' }
			},
			components: {
				Footer: './src/components/BacklinksFooter.astro',
				Head: './src/components/CustomHead.astro',
				PageTitle: './src/components/PageTitle.astro',
			},
			customCss: [
				// Design system tokens (thứ tự: colors -> type -> spacing -> base) trước custom.css
				'./src/styles/tokens/colors.css',
				'./src/styles/tokens/typography.css',
				'./src/styles/tokens/spacing.css',
				'./src/styles/tokens/base.css',
				'./src/styles/reading.css',
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
					attrs: { src: '/reading-panel.js', defer: true },
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
					items: [
						{ label: 'Tổng quan Lộ trình', link: '/learning-paths/overview/' },
						{
							label: 'A. Lộ trình chính (Core Paths)',
							items: [
								{ label: '1. Beginner DE', link: '/learning-paths/core-paths/beginner-de/' },
								{ label: '2. Junior to Middle DE', link: '/learning-paths/core-paths/junior-to-middle-de/' },
								{ label: '3. Middle to Senior DE', link: '/learning-paths/core-paths/middle-to-senior-de/' },
								{ label: 'Phân tích Nghề nghiệp', link: '/learning-paths/core-paths/de-career-paths/' },
							]
						},
						{
							label: 'B. Hướng đi chuyên sâu',
							collapsed: true,
							autogenerate: { directory: 'learning-paths/specializations' }
						},
						{
							label: 'C. Lãnh đạo & Văn hóa',
							collapsed: true,
							autogenerate: { directory: 'learning-paths/leadership-culture' }
						},
						{ label: 'Chuẩn bị Phỏng vấn', link: '/learning-paths/interview-prep/' }
					]
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
					items: quizSidebarItems
				}
			],
		}),
	],
});
