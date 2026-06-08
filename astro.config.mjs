// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeMermaidLite from 'rehype-mermaid-lite';
import { conceptCategories } from './src/config/categories.js';

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
					items: conceptCategories.map(cat => ({
						label: cat.label,
						collapsed: true,
						autogenerate: { directory: `concepts/${cat.slug}` }
					}))
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
