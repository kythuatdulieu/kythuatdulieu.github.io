import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const SITE_URL = 'https://kythuatdulieu.github.io';
const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'sitemap-index.xml');

function parseXml(filePath) {
	const xml = fs.readFileSync(filePath, 'utf8');
	const dom = new JSDOM(xml, { contentType: 'application/xml' });
	const document = dom.window.document;
	if (document.documentElement?.localName === 'parsererror') {
		throw new Error(`${path.basename(filePath)} is not well-formed XML`);
	}
	return { dom, document };
}

function readLocs(document, tagName) {
	return [...document.getElementsByTagNameNS(SITEMAP_NAMESPACE, tagName)]
		.map((element) => element.textContent.trim())
		.filter(Boolean);
}

if (!fs.existsSync(indexPath)) {
	throw new Error('Astro did not generate dist/sitemap-index.xml');
}

const index = parseXml(indexPath);
if (index.document.documentElement?.localName !== 'sitemapindex' || index.document.documentElement.namespaceURI !== SITEMAP_NAMESPACE) {
	index.dom.window.close();
	throw new Error('sitemap-index.xml has an unexpected root element or namespace');
}

const sitemapUrls = readLocs(index.document, 'loc');
index.dom.window.close();
if (sitemapUrls.length === 0) {
	throw new Error('sitemap-index.xml does not reference any child sitemaps');
}

const pageUrls = [];
for (const sitemapUrl of sitemapUrls) {
	const url = new URL(sitemapUrl);
	if (url.origin !== SITE_URL || url.search || url.hash) {
		throw new Error(`Unexpected child sitemap URL: ${sitemapUrl}`);
	}
	const childPath = path.resolve(distDir, `.${decodeURIComponent(url.pathname)}`);
	if (!childPath.startsWith(`${distDir}${path.sep}`) || !fs.existsSync(childPath)) {
		throw new Error(`Referenced child sitemap is missing or outside dist/: ${sitemapUrl}`);
	}

	const child = parseXml(childPath);
	if (child.document.documentElement?.localName !== 'urlset' || child.document.documentElement.namespaceURI !== SITEMAP_NAMESPACE) {
		child.dom.window.close();
		throw new Error(`${path.basename(childPath)} has an unexpected root element or namespace`);
	}
	pageUrls.push(...readLocs(child.document, 'loc'));
	child.dom.window.close();
}

if (pageUrls.length === 0 || pageUrls.length > 50_000) {
	throw new Error(`Cannot create a text sitemap from ${pageUrls.length} URLs; expected between 1 and 50,000`);
}
if (new Set(pageUrls).size !== pageUrls.length) {
	throw new Error('XML sitemap files contain duplicate URLs');
}
for (const pageUrl of pageUrls) {
	const url = new URL(pageUrl);
	if (url.origin !== SITE_URL || url.hash || pageUrl.length > 2_048) {
		throw new Error(`Invalid page URL in XML sitemap: ${pageUrl}`);
	}
}

const output = `${pageUrls.join('\n')}\n`;
if (Buffer.byteLength(output, 'utf8') > 50 * 1024 * 1024) {
	throw new Error('Generated sitemap.txt exceeds the 50 MB sitemap limit');
}
fs.writeFileSync(path.join(distDir, 'sitemap.txt'), output, 'utf8');
console.log(`Generated dist/sitemap.txt with ${pageUrls.length} unique URLs.`);
