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

let modifiedCount = 0;

for (const file of mdFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const initialContent = content;

  // Remove lines that have images with "diagram_" or "mwaa-architecture" or "placeholder"
  // For both markdown and HTML images.
  const lines = content.split('\n');
  const newLines = lines.filter(line => {
    if ((line.includes('<img') || line.includes('![')) && 
        (line.includes('diagram_') || line.includes('mwaa-architecture') || line.includes('placeholder'))) {
      return false; // exclude this line
    }
    return true;
  });

  content = newLines.join('\n');

  if (content !== initialContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Removed bad images from ${file}`);
  }
}

console.log(`Total files modified: ${modifiedCount}`);
