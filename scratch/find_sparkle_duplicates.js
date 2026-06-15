import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const targetPath = '/home/duclinh/kythuatdulieu.github.io/public/images/context-window/diagram_1.png';
const publicImagesDir = '/home/duclinh/kythuatdulieu.github.io/public/images';

if (!fs.existsSync(targetPath)) {
  console.log(`Target file does not exist: ${targetPath}`);
  process.exit(0);
}

const targetBuffer = fs.readFileSync(targetPath);
const hashSum = crypto.createHash('md5');
hashSum.update(targetBuffer);
const targetHash = hashSum.digest('hex');
console.log(`Target MD5 Hash: ${targetHash}`);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (stat.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = walk(publicImagesDir);
const matches = [];

allFiles.forEach(file => {
  if (file === targetPath) return;
  const buffer = fs.readFileSync(file);
  const hash = crypto.createHash('md5').update(buffer).digest('hex');
  if (hash === targetHash) {
    matches.push(file);
  }
});

console.log(`Found ${matches.length} matching files with the same hash:`);
matches.forEach(m => console.log(`- ${path.relative(publicImagesDir, m)}`));
