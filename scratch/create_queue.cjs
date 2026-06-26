const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../src/content/docs');
const conceptsDir = path.join(docsDir, 'concepts');

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

const allConceptFiles = getAllMdFiles(conceptsDir);

// Convert to relative paths
const relativeFiles = allConceptFiles.map(f => path.relative(docsDir, f));

fs.writeFileSync(
  path.join(__dirname, 'expansion_queue.json'),
  JSON.stringify(relativeFiles, null, 2),
  'utf-8'
);

console.log(`Created queue with ${relativeFiles.length} concept files for expansion.`);
