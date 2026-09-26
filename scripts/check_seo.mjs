import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://kythuatdulieu.github.io';
const distDir = path.resolve('dist');
const errors = [];

function walk(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		return entry.isDirectory() ? walk(fullPath) : [fullPath];
	});
}

function attribute(tag, name) {
	const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
	return match?.[1] ?? '';
}

function hasMeta(tags, attrName, attrValue) {
	return tags.some(
		(tag) => tag.startsWith('<meta') && attribute(tag, attrName).toLowerCase() === attrValue.toLowerCase()
	);
}

function metaContent(tags, attrName, attrValue) {
	const tag = tags.find(
		(candidate) =>
			candidate.startsWith('<meta') &&
			attribute(candidate, attrName).toLowerCase() === attrValue.toLowerCase()
	);
	return tag ? attribute(tag, 'content').toLowerCase() : '';
}

if (!fs.existsSync(distDir)) {
	console.error('SEO check requires a built dist/ directory. Run npm run build first.');
	process.exit(1);
}

const files = walk(distDir);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
let inspectedPages = 0;
let skippedRedirects = 0;

for (const file of htmlFiles) {
	const html = fs.readFileSync(file, 'utf8');
	if (!/<html(?:\s|>)/i.test(html)) {
		skippedRedirects += 1;
		continue;
	}

	inspectedPages += 1;
	const relative = path.relative(distDir, file).replaceAll(path.sep, '/');
	const pathname = `/${relative.replace(/index\.html$/, '')}`;
	const tags = html.match(/<(?:meta|link)\b[^>]*>/gi) ?? [];
	const canonicalTags = tags.filter(
		(tag) => tag.startsWith('<link') && attribute(tag, 'rel').toLowerCase().split(/\s+/).includes('canonical')
	);

	if (canonicalTags.length !== 1) {
		errors.push(`${pathname}: expected exactly one canonical link, found ${canonicalTags.length}`);
	} else if (!attribute(canonicalTags[0], 'href').startsWith(SITE_URL)) {
		errors.push(`${pathname}: canonical URL is outside ${SITE_URL}`);
	}

	for (const [attrName, attrValue] of [
		['name', 'robots'],
		['property', 'og:title'],
		['property', 'og:description'],
		['property', 'og:url'],
		['name', 'twitter:card'],
	]) {
		if (!hasMeta(tags, attrName, attrValue)) {
			errors.push(`${pathname}: missing ${attrName}=${attrValue}`);
		}
	}

	const robots = metaContent(tags, 'name', 'robots');
	const isQuestionPage = /\/quizzes\/[^/]+\/question-\d+\/$/.test(pathname);
	if (isQuestionPage && !robots.includes('noindex')) {
		errors.push(`${pathname}: question page must be noindex`);
	}
	if (!isQuestionPage && robots.includes('noindex')) {
		errors.push(`${pathname}: non-question page must remain indexable`);
	}
}

const robotsPath = path.join(distDir, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
	errors.push('robots.txt is missing from the build output');
} else {
	const robots = fs.readFileSync(robotsPath, 'utf8');
	if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap-index.xml`)) {
		errors.push('robots.txt does not point to sitemap-index.xml');
	}
	if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.txt`)) {
		errors.push('robots.txt does not point to sitemap.txt');
	}
}

const sitemapFiles = files.filter((file) => file.endsWith('.xml'));
if (!sitemapFiles.some((file) => path.basename(file) === 'sitemap-index.xml')) {
	errors.push('sitemap-index.xml is missing from the build output');
}
for (const file of sitemapFiles) {
	const sitemap = fs.readFileSync(file, 'utf8');
	if (/\/quizzes\/[^<]+\/question-\d+\//.test(sitemap)) {
		errors.push(`${path.relative(distDir, file)} contains noindex question pages`);
	}
}

const textSitemapPath = path.join(distDir, 'sitemap.txt');
if (!fs.existsSync(textSitemapPath)) {
	errors.push('sitemap.txt is missing from the build output');
} else {
	const textUrls = fs.readFileSync(textSitemapPath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
	const xmlUrls = sitemapFiles
		.filter((file) => /^sitemap-\d+\.xml$/.test(path.basename(file)))
		.flatMap((file) =>
			[...fs.readFileSync(file, 'utf8').matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) =>
				match[1].replace(/&(?:amp|lt|gt|quot|apos);/g, (entity) => ({
					'&amp;': '&',
					'&lt;': '<',
					'&gt;': '>',
					'&quot;': '"',
					'&apos;': "'",
				})[entity])
			)
		);
	if (textUrls.length !== xmlUrls.length) {
		errors.push(`sitemap.txt has ${textUrls.length} URLs but XML sitemaps have ${xmlUrls.length}`);
	} else if (textUrls.some((url, index) => url !== xmlUrls[index])) {
		errors.push('sitemap.txt URLs do not match the generated XML sitemap URLs');
	}
	if (new Set(textUrls).size !== textUrls.length) {
		errors.push('sitemap.txt contains duplicate URLs');
	}
	if (textUrls.some((url) => !url.startsWith(`${SITE_URL}/`) && url !== `${SITE_URL}/`)) {
		errors.push('sitemap.txt contains a URL outside the configured site');
	}
	if (textUrls.some((url) => /\/quizzes\/[^/]+\/question-\d+\//.test(url))) {
		errors.push('sitemap.txt contains noindex question pages');
	}
}

const hasTechArticle = htmlFiles.some((file) => fs.readFileSync(file, 'utf8').includes('"@type":"TechArticle"'));
if (!hasTechArticle) {
	errors.push('no TechArticle JSON-LD was found in the build output');
}

if (errors.length) {
	console.error(`SEO check failed with ${errors.length} issue(s):`);
	for (const error of errors.slice(0, 40)) console.error(`- ${error}`);
	process.exit(1);
}

console.log(`SEO check passed: ${inspectedPages} HTML pages inspected, ${skippedRedirects} redirect/verification pages skipped.`);
