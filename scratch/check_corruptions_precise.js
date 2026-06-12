import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsDir = path.resolve(__dirname, '../src/content/docs');

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, callback);
    } else if (stat.isFile() && (file.endsWith('.md') || file.endsWith('.mdx'))) {
      callback(filepath);
    }
  }
}

console.log("Running precise scan for corruptions and duplicates...\n");

let issuesFound = 0;
const reports = [];

walk(docsDir, (filepath) => {
  const content = fs.readFileSync(filepath, 'utf8');
  const relativePath = path.relative(docsDir, filepath);
  const fileIssues = [];
  
  // 1. Check for unclosed code blocks
  const codeBlockMatches = content.match(/```/g);
  const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0;
  if (codeBlockCount % 2 !== 0) {
    fileIssues.push(`Unclosed code block (odd number of triple backticks: ${codeBlockCount})`);
  }
  
  // 2. Check for duplicate frontmatter blocks (multiple "title:" fields)
  const titleMatches = content.match(/^title:\s+/gm);
  if (titleMatches && titleMatches.length > 1) {
    fileIssues.push(`Duplicate frontmatter detected (${titleMatches.length} title fields)`);
  }

  // 3. Check for duplicate standard H2 headings
  const headings = content.match(/^##\s+.+$/gm);
  if (headings) {
    const seen = new Set();
    for (const h of headings) {
      const clean = h.trim();
      if (seen.has(clean)) {
        fileIssues.push(`Duplicate heading: "${clean}"`);
      }
      seen.add(clean);
    }
  }
  
  // 4. Check for corrupt characters (\uFFFD or raw replacement char)
  if (content.includes('\uFFFD')) {
    fileIssues.push(`Contains unicode replacement character ()`);
  }
  
  if (fileIssues.length > 0) {
    issuesFound += fileIssues.length;
    reports.push({
      file: relativePath,
      issues: fileIssues
    });
  }
});

reports.forEach(r => {
  console.log(`\nFile: ${r.file}`);
  r.issues.forEach(issue => console.log(`  - [ISSUE] ${issue}`));
});

console.log(`\nPrecise Scan finished. Total real issues found: ${issuesFound}`);
