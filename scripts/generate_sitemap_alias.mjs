import fs from 'node:fs/promises';
import path from 'node:path';

const distDirectory = path.resolve('dist');
const indexPath = path.join(distDirectory, 'sitemap-index.xml');
const aliasPath = path.join(distDirectory, 'sitemap.xml');

let sitemapIndex;
try {
	sitemapIndex = await fs.readFile(indexPath, 'utf8');
} catch {
	throw new Error(`Astro sitemap index not found at ${indexPath}`);
}

if (!sitemapIndex.includes('<sitemapindex')) {
	throw new Error(`Expected ${indexPath} to contain a sitemap index`);
}

await fs.writeFile(aliasPath, sitemapIndex, 'utf8');
console.log('Created sitemap.xml as an alias of sitemap-index.xml.');
