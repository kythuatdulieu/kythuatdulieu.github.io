import fs from 'fs';
import path from 'path';

const DOCS_DIR = '/home/duclinh/kythuatdulieu.github.io/src/content/docs';

// Helper to recursively get all markdown files
function getMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(filePath));
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = getMarkdownFiles(DOCS_DIR);
const imageContexts = [];

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(DOCS_DIR, filePath);
  const articleSlug = path.basename(filePath, path.extname(filePath));

  lines.forEach((line, idx) => {
    // Check for markdown image: ![alt](url)
    const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = mdRegex.exec(line)) !== null) {
      const alt = match[1];
      const url = match[2];

      // Extract context: 3 lines before and 3 lines after
      const start = Math.max(0, idx - 3);
      const end = Math.min(lines.length - 1, idx + 3);
      const contextLines = lines.slice(start, end + 1);
      const context = contextLines.join('\n');

      // Check if image path contains article slug or keywords
      const imageFilename = path.basename(url);
      const imageFolder = path.basename(path.dirname(url));
      
      let isSuspicious = false;
      const reasons = [];

      // Reason 1: Alt text is too short or generic
      const genericAlts = ['image', 'img', 'screenshot', 'logo', 'diagram', 'sơ đồ', 'hình ảnh', 'hình', 'untitled', 'placeholder'];
      if (!alt || genericAlts.includes(alt.trim().toLowerCase()) || alt.length < 5) {
        isSuspicious = true;
        reasons.push(`Generic alt text: "${alt}"`);
      }

      // Reason 2: Folder mismatch (if image is in a different folder than the article slug, unless it's a shared image)
      // Standard local images should be under /images/<article-slug>/
      if (url.startsWith('/images/')) {
        const pathParts = url.split('/');
        // Format is usually /images/<folder>/<filename>
        const expectedFolder = articleSlug;
        const actualFolder = pathParts[2];
        
        // Some shared images might be normal, but let's flag if they look totally different
        if (actualFolder !== expectedFolder) {
          // Allow shared images if they contain common folders, else flag
          const sharedFolders = ['common', 'shared', 'architecture'];
          if (!sharedFolders.includes(actualFolder)) {
            // Check if folder name is similar or related
            const normalizedActual = actualFolder.replace(/-/g, '').toLowerCase();
            const normalizedExpected = expectedFolder.replace(/-/g, '').toLowerCase();
            
            // Check if one contains the other
            if (!normalizedActual.includes(normalizedExpected) && !normalizedExpected.includes(normalizedActual)) {
              isSuspicious = true;
              reasons.push(`Folder name mismatch: expected "${expectedFolder}", got "${actualFolder}"`);
            }
          }
        }
      }

      imageContexts.push({
        file: relativePath,
        lineNum: idx + 1,
        alt,
        url,
        context,
        isSuspicious,
        reasons
      });
    }
  });
});

fs.writeFileSync('/home/duclinh/kythuatdulieu.github.io/scratch/image_contexts_report.json', JSON.stringify(imageContexts, null, 2));

console.log(`Audited ${imageContexts.length} image references.`);
const suspicious = imageContexts.filter(i => i.isSuspicious);
console.log(`Found ${suspicious.length} potentially suspicious images.`);

suspicious.forEach((item, idx) => {
  console.log(`\n[${idx + 1}] File: ${item.file}:${item.lineNum}`);
  console.log(`    URL: ${item.url}`);
  console.log(`    Alt: "${item.alt}"`);
  console.log(`    Reasons: ${item.reasons.join(' | ')}`);
  console.log(`    Context around line:\n---`);
  console.log(item.context);
  console.log(`---`);
});
