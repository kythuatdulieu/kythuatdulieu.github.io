const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../src/content/docs');

function getAllMdFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
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
const relativeFiles = allFiles.map(f => path.relative(docsDir, f));

fs.writeFileSync(
  path.join(__dirname, 'global_index.txt'),
  relativeFiles.join('\n'),
  'utf-8'
);

console.log(`Created global_index.txt with ${relativeFiles.length} files.`);
