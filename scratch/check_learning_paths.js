import fs from 'fs';
import path from 'path';

const dir = '/home/duclinh/kythuatdulieu.github.io/src/content/docs/learning-paths';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');
  console.log(`=== File: ${file} ===`);
  lines.forEach(line => {
    if (line.startsWith('#')) {
      console.log(`  ${line}`);
    }
  });
  console.log();
});
