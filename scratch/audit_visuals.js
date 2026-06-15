import fs from 'fs';
import path from 'path';

const DOCS_DIR = '/home/duclinh/kythuatdulieu.github.io/src/content/docs';

// Helper to recursively get all markdown files
function getMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(filePath));
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = getMarkdownFiles(DOCS_DIR);
console.log(`Found ${files.length} articles to audit for visuals (images, tables, diagrams).`);

const auditResults = [];

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(DOCS_DIR, filePath);
  
  // Extract images
  const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/g;
  const htmlImageRegex2 = /<img[^>]+alt=["']([^"']*)["'][^>]+src=["']([^"']+)["'][^>]*>/g;

  const images = [];
  let match;
  
  while ((match = mdImageRegex.exec(content)) !== null) {
    images.push({ type: 'markdown', alt: match[1], url: match[2], raw: match[0] });
  }
  while ((match = htmlImageRegex.exec(content)) !== null) {
    images.push({ type: 'html', alt: match[2], url: match[1], raw: match[0] });
  }
  while ((match = htmlImageRegex2.exec(content)) !== null) {
    images.push({ type: 'html', alt: match[1], url: match[2], raw: match[0] });
  }

  // Extract Mermaid diagrams
  const mermaidRegex = /```mermaid\s*\n([\s\S]*?)\n```/g;
  const mermaids = [];
  while ((match = mermaidRegex.exec(content)) !== null) {
    mermaids.push({ code: match[1].trim(), raw: match[0] });
  }

  // Extract Tables, ignoring code blocks
  const lines = content.split('\n');
  const tables = [];
  let currentTable = null;
  let inCodeBlock = false;
  
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('```') || trimmed.startsWith('````')) {
      inCodeBlock = !inCodeBlock;
      if (currentTable) {
        tables.push(currentTable);
        currentTable = null;
      }
      return;
    }
    
    if (inCodeBlock) return;

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!currentTable) {
        currentTable = { startLine: idx + 1, rows: [] };
      }
      currentTable.rows.push(trimmed);
    } else {
      if (currentTable) {
        tables.push(currentTable);
        currentTable = null;
      }
    }
  });
  if (currentTable) {
    tables.push(currentTable);
  }

  auditResults.push({
    file: relativePath,
    title: filePath.split('/').pop(),
    imagesCount: images.length,
    images,
    mermaidsCount: mermaids.length,
    mermaids,
    tablesCount: tables.length,
    tables
  });
});

// Write audit report
fs.writeFileSync('/home/duclinh/kythuatdulieu.github.io/scratch/audit_visuals_report.json', JSON.stringify(auditResults, null, 2));
console.log(`Audit complete! Visuals report written to scratch/audit_visuals_report.json`);

// Summary statistics
let totalImages = 0;
let totalMermaids = 0;
let totalTables = 0;
auditResults.forEach(r => {
  totalImages += r.imagesCount;
  totalMermaids += r.mermaidsCount;
  totalTables += r.tablesCount;
});
console.log(`Total images: ${totalImages}`);
console.log(`Total Mermaid diagrams: ${totalMermaids}`);
console.log(`Total markdown tables: ${totalTables}`);
