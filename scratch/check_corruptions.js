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

console.log("Scanning files for corruptions and formatting issues...\n");

let issuesFound = 0;

walk(docsDir, (filepath) => {
  const content = fs.readFileSync(filepath, 'utf8');
  const relativePath = path.relative(docsDir, filepath);
  
  // 1. Check for unclosed code blocks (odd number of ``` occurrences)
  const codeBlockMatches = content.match(/```/g);
  const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0;
  if (codeBlockCount % 2 !== 0) {
    console.log(`[ISSUE] Unclosed code block: ${relativePath} has ${codeBlockCount} triple-backticks (odd number).`);
    issuesFound++;
  }
  
  // 2. Check for duplicate main H2 headings (excluding standard repeats inside list items)
  const headings = content.match(/^##\s+.+$/gm);
  if (headings) {
    const seen = new Set();
    for (const h of headings) {
      const clean = h.trim();
      if (seen.has(clean)) {
        console.log(`[ISSUE] Duplicate heading "${clean}": ${relativePath}`);
        issuesFound++;
      }
      seen.add(clean);
    }
  }
  
  // 3. Check for specific corrupted UTF-8 replacement characters (e.g.  or illegal Unicode characters)
  if (content.includes('\uFFFD') || content.includes('')) {
    console.log(`[ISSUE] Corrupt replacement character : ${relativePath}`);
    issuesFound++;
  }

  // 4. Check for double frontmatter indicators (e.g. more than 2 instances of --- at start/middle)
  const frontmatterMatches = content.match(/^---$/gm);
  const frontmatterCount = frontmatterMatches ? frontmatterMatches.length : 0;
  if (frontmatterCount > 2) {
    console.log(`[ISSUE] Extra frontmatter separator: ${relativePath} has ${frontmatterCount} instances of "---".`);
    issuesFound++;
  }
});

console.log(`\nScan finished. Total issues found: ${issuesFound}`);
