import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { evaluateFile } = require('../scripts/evaluate_article.cjs');

const conceptsDir = '/home/duclinh/kythuatdulieu.github.io/src/content/docs/concepts';

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

const allFiles = walk(conceptsDir);
console.log(`Found ${allFiles.length} concept articles to audit.`);

const results = [];
let perfectCount = 0;

for (const file of allFiles) {
  const relPath = path.relative(conceptsDir, file);
  try {
    const res = evaluateFile(file);
    if (res) {
      const issues = res.reports.filter(r => !r.passed).map(r => r.message);
      results.push({
        path: relPath,
        absolutePath: file,
        score: res.score,
        wordCount: res.wordCount,
        issues: issues
      });
      if (res.score === 100) {
        perfectCount++;
      }
    }
  } catch (err) {
    console.error(`Error evaluating ${relPath}:`, err.message);
  }
}

// Sort by score ascending, so we see worst first
results.sort((a, b) => a.score - b.score);

const reportPath = '/home/duclinh/kythuatdulieu.github.io/scratch/audit_report.json';
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');

console.log(`\nAudit finished!`);
console.log(`Perfect score articles (100/100): ${perfectCount}/${allFiles.length}`);
console.log(`Detailed audit report written to: ${reportPath}`);
