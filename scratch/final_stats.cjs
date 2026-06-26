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

let totalArticles = allFiles.length;
let totalImages = 0;
let totalReferences = 0;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Count images
  const imgRegex = /!\[.*?\]\(.*?\)|<img.*?>/g;
  const images = content.match(imgRegex);
  if (images) {
    totalImages += images.length;
  }
  
  // Count references
  const lines = content.split('\n');
  let inRefSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## Tài Liệu Tham Khảo') || line.startsWith('### Tài Liệu Tham Khảo')) {
      inRefSection = true;
      continue;
    }
    if (inRefSection && line.startsWith('## ')) {
      // Reached next section
      inRefSection = false;
    }
    if (inRefSection) {
      if (line.startsWith('-') || line.startsWith('*')) {
        totalReferences++;
      }
    }
  }
}

console.log(`==== BÁO CÁO TỔNG QUAN ====`);
console.log(`1. Tổng số bài viết (Articles): ${totalArticles}`);
console.log(`2. Tổng số hình ảnh (Images): ${totalImages}`);
console.log(`3. Tổng số Tài liệu tham khảo (Citations/References): ${totalReferences}`);
