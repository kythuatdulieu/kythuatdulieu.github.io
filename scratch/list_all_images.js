import fs from 'fs';
import path from 'path';

const DOCS_DIR = '/home/duclinh/kythuatdulieu.github.io/src/content/docs';

function getMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(filePath));
    } else if (filePath.endsWith('.md') || filePath.endsWith('.mdx')) {
      results.push(filePath);
    }
  }
  return results;
}

const mdFiles = getMarkdownFiles(DOCS_DIR);
const imageRegex = /<img[^>]+src="([^">]+)"[^>]*>|!\[[^\]]*\]\(([^)]+)\)/g;

const images = {};

for (const file of mdFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const src = match[1] || match[2];
    if (!images[file]) {
      images[file] = [];
    }
    images[file].push(src);
  }
}

console.log(JSON.stringify(images, null, 2));
