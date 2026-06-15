import fs from 'fs';
import path from 'path';

const report = JSON.parse(fs.readFileSync('/home/duclinh/kythuatdulieu.github.io/scratch/audit_visuals_report.json', 'utf8'));

const issues = {
  mermaid: [],
  tables: [],
  images: []
};

// Map to detect duplicate mermaid diagrams
const mermaidMap = new Map();

report.forEach(article => {
  const file = article.file;
  
  // 1. Audit Mermaid Diagrams
  article.mermaids.forEach((m, idx) => {
    const code = m.code;
    
    // Check for placeholders in Mermaid nodes
    const placeholders = ['TODO', 'placeholder', 'dummy', 'lorem ipsum', 'node1', 'node2', 'label1', 'label2'];
    placeholders.forEach(p => {
      if (code.toLowerCase().includes(p)) {
        issues.mermaid.push({
          file,
          issue: `Contains placeholder word "${p}" in diagram #${idx + 1}`,
          snippet: code.substring(0, 150) + '...'
        });
      }
    });

    // Check for extremely short diagrams (probably placeholders)
    if (code.split('\n').length < 3) {
      issues.mermaid.push({
        file,
        issue: `Mermaid diagram #${idx + 1} is too short (${code.split('\n').length} lines)`,
        snippet: code
      });
    }

    // Check for duplicates
    // Normalize code by removing whitespaces and newlines to check structure
    const normalized = code.replace(/\s+/g, '');
    if (mermaidMap.has(normalized)) {
      const existing = mermaidMap.get(normalized);
      issues.mermaid.push({
        file,
        issue: `Mermaid diagram #${idx + 1} is a duplicate of diagram in "${existing.file}"`,
        snippet: code.substring(0, 100) + '...'
      });
    } else {
      mermaidMap.set(normalized, { file, idx });
    }
  });

  // 2. Audit Tables
  article.tables.forEach((t, idx) => {
    const rows = t.rows;
    if (rows.length < 3) { // A table needs header, separator, and at least one data row
      issues.tables.push({
        file,
        line: t.startLine,
        issue: `Table #${idx + 1} has less than 3 rows (probably empty or broken)`
      });
      return;
    }

    // Check header
    const header = rows[0];
    const headerCols = header.split('|').map(c => c.trim()).filter(c => c !== '');
    
    // Check separator
    const separator = rows[1];
    const sepCols = separator.split('|').map(c => c.trim()).filter(c => c !== '');

    // Check column alignment
    let colMismatch = false;
    for (let rIdx = 2; rIdx < rows.length; rIdx++) {
      const rowCols = rows[rIdx].split('|').map(c => c.trim()).filter(c => c !== '');
      if (rowCols.length !== headerCols.length) {
        colMismatch = true;
        issues.tables.push({
          file,
          line: t.startLine + rIdx,
          issue: `Table #${idx + 1} row ${rIdx + 1} has ${rowCols.length} columns, but header has ${headerCols.length} columns`,
          snippet: rows[rIdx]
        });
      }
    }

    // Check for generic headers like "Column 1", "Header A"
    const genericHeaderRegex = /^(column|header|cột|tiêu đề|value|giá trị)\s*\d*$/i;
    headerCols.forEach((col, colIdx) => {
      if (genericHeaderRegex.test(col)) {
        issues.tables.push({
          file,
          line: t.startLine,
          issue: `Table #${idx + 1} header column #${colIdx + 1} uses a generic name: "${col}"`
        });
      }
    });

    // Check for placeholders in cell contents
    rows.forEach((row, rIdx) => {
      const cellPlaceholders = ['TODO', 'placeholder', 'dummy', 'null', 'temp'];
      cellPlaceholders.forEach(p => {
        if (row.toLowerCase().includes(`| ${p} |`) || row.toLowerCase().includes(`|${p}|`)) {
          issues.tables.push({
            file,
            line: t.startLine + rIdx,
            issue: `Table #${idx + 1} row ${rIdx + 1} contains placeholder value: "${p}"`,
            snippet: row
          });
        }
      });
    });
  });

  // 3. Audit Images
  article.images.forEach((img, idx) => {
    const url = img.url;
    
    // Check if the URL is external
    if (url.startsWith('http://') || url.startsWith('https://')) {
      issues.images.push({
        file,
        issue: `Image #${idx + 1} references external URL: "${url}"`,
        alt: img.alt
      });
    } else {
      // Check if file exists in the public directory
      // The public folder is at `/home/duclinh/kythuatdulieu.github.io/public`
      const localPath = path.join('/home/duclinh/kythuatdulieu.github.io/public', url);
      if (!fs.existsSync(localPath)) {
        issues.images.push({
          file,
          issue: `Image #${idx + 1} references non-existent local file: "${url}" (mapped to ${localPath})`,
          alt: img.alt
        });
      }
    }

    // Check for bad alt text
    const badAlts = ['image', 'img', 'screenshot', 'logo', 'diagram', 'sơ đồ', 'hình ảnh', 'hình', 'untitled'];
    if (badAlts.includes(img.alt.trim().toLowerCase())) {
      issues.images.push({
        file,
        issue: `Image #${idx + 1} uses generic alt text: "${img.alt}"`,
        url
      });
    }
  });
});

console.log('=== MERMAID DIAGRAM ISSUES ===');
console.log(JSON.stringify(issues.mermaid, null, 2));
console.log(`\nFound ${issues.mermaid.length} Mermaid diagram issues.\n`);

console.log('=== TABLE ISSUES ===');
console.log(JSON.stringify(issues.tables, null, 2));
console.log(`\nFound ${issues.tables.length} table issues.\n`);

console.log('=== IMAGE ISSUES ===');
console.log(JSON.stringify(issues.images, null, 2));
console.log(`\nFound ${issues.images.length} image issues.\n`);
