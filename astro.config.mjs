// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://kythuatdulieu.github.io',
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
				{ tag: 'script', attrs: { src: '/glossary.js', defer: true } }
			],
			social: { github: 'https://github.com/kythuatdulieu' },
			sidebar: [
				{
					label: 'Khái niệm (Concepts)',
					autogenerate: { directory: 'concepts' },
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
