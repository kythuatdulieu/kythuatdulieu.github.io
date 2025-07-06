// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://kythuatdulieu.github.io',
	output: 'static',
	build: {
		assets: '_astro'
	}
});
