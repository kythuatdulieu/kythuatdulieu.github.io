const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../src/content/docs');

function getAllMdFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllMdFiles(filePath, fileList);
    } else if (filePath.endsWith('.md') || filePath.endsWith('.mdx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = getAllMdFiles(docsDir);

const suspiciousFiles = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Extract content without frontmatter
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
  const body = content.replace(frontmatterRegex, '').trim();
  
  // Also remove the "## Tài Liệu Tham Khảo" section to see if there is any actual article text
  const bodyWithoutRef = body.replace(/## Tài Liệu Tham Khảo[\s\S]*$/, '').trim();
  
  if (bodyWithoutRef.length < 200) { // arbitrary threshold, 200 chars is too small for an article
    suspiciousFiles.push({ file: path.relative(docsDir, file), length: bodyWithoutRef.length });
  }
}

suspiciousFiles.sort((a, b) => a.length - b.length);

console.log(`Found ${suspiciousFiles.length} files that have suspiciously short content (< 200 chars):`);
suspiciousFiles.forEach(f => {
  console.log(`- ${f.file} (${f.length} chars)`);
});
