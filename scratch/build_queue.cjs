const fs = require('fs');
const path = require('path');

const docsDir = path.join('/home/duclinh/kythuatdulieu.github.io/src/content/docs');
let filesList = [];

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath);
    } else {
      if (fullPath.endsWith('.md')) {
        filesList.push(fullPath);
      }
    }
  });
}

walk(docsDir);
fs.writeFileSync('scratch/queue.txt', filesList.join('\n'));
console.log(`Found ${filesList.length} files for processing.`);
