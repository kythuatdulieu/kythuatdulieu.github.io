import fs from 'fs';

const reportPath = '/home/duclinh/kythuatdulieu.github.io/scratch/audit_report.json';
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const short = [];
const medium = [];
const long = [];

report.forEach(item => {
  if (item.wordCount < 1500) {
    short.push(item);
  } else if (item.wordCount < 2500) {
    medium.push(item);
  } else {
    long.push(item);
  }
});

console.log(`=== Word Count Distribution ===`);
console.log(`Short articles (< 1500 words): ${short.length}`);
console.log(`Medium articles (1500 - 2500 words): ${medium.length}`);
console.log(`Long articles (> 2500 words): ${long.length}`);

console.log(`\nShort articles list (first 20):`);
short.slice(0, 20).forEach(s => {
  console.log(`- [${s.wordCount} words] ${s.path}`);
});
