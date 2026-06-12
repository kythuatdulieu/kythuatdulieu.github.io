import fs from 'fs';
import path from 'path';

const docsDir = '/home/duclinh/kythuatdulieu.github.io/src/content/docs';
const conceptsDir = path.join(docsDir, 'concepts');

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (stat.isFile() && item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = walk(conceptsDir).map(file => path.relative('/home/duclinh/kythuatdulieu.github.io', file));
allFiles.sort();

const group1 = allFiles.filter(f => f.includes('1-foundations') || f.includes('4-realtime'));
const group2 = allFiles.filter(f => f.includes('5-quality-governance') || f.includes('6-ai-ml'));

const storageFiles = allFiles.filter(f => f.includes('2-storage'));
const group3 = storageFiles.filter(f => f.includes('database-storage') || f.includes('data-lake-lakehouse'));
const group4 = storageFiles.filter(f => f.includes('cloud-data-platform') || f.includes('data-warehouse'));

const integrationFiles = allFiles.filter(f => f.includes('3-integration'));
const group5 = integrationFiles.filter(f => f.includes('batch-processing') || f.includes('etl-elt'));
const group6 = integrationFiles.filter(f => f.includes('orchestration') || f.includes('transformation-analytics'));

const groups = {
  group1,
  group2,
  group3,
  group4,
  group5,
  group6
};

fs.writeFileSync('/home/duclinh/kythuatdulieu.github.io/scratch/split_groups.json', JSON.stringify(groups, null, 2), 'utf8');

console.log(`Split complete!`);
console.log(`Group 1 (Foundations & Real-Time): ${group1.length} files`);
console.log(`Group 2 (Quality & AI/ML): ${group2.length} files`);
console.log(`Group 3 (Storage P1): ${group3.length} files`);
console.log(`Group 4 (Storage P2): ${group4.length} files`);
console.log(`Group 5 (Integration P1): ${group5.length} files`);
console.log(`Group 6 (Integration P2): ${group6.length} files`);
console.log(`Total accounted: ${group1.length + group2.length + group3.length + group4.length + group5.length + group6.length}/${allFiles.length}`);
