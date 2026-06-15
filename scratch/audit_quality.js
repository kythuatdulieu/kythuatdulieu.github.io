import fs from 'fs';
import path from 'path';

// Using Node 20+ import.meta.dirname, or fallback
const __dirname = import.meta.dirname || path.dirname(new URL(import.meta.url).pathname);
const docsDir = path.join(__dirname, '../src/content/docs');

// Helper to recursively get all markdown files
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      getFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

// Very basic frontmatter parser
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  
  const yaml = match[1];
  const meta = {};
  
  const lines = yaml.split('\n');
  for (const line of lines) {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join(':').trim();
      if (val.startsWith('"') || val.startsWith("'")) {
        val = val.substring(1, val.length - 1);
      }
      meta[key] = val;
    }
  }
  return meta;
}

const allFiles = getFiles(docsDir);
const failingFiles = [];

for (const filePath of allFiles) {
  if (filePath.endsWith('index.mdx')) continue;

  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(docsDir, filePath);
  
  const issues = [];
  
  // 1. Check frontmatter description
  const meta = parseFrontmatter(content);
  if (!meta.description || meta.description.length < 15) {
    issues.push('Missing or too short description in frontmatter');
  }

  // 2. Check RESEARCH METADATA
  const metadataBlockMatch = content.match(/<!--\s*\[RESEARCH METADATA\]\s*([\s\S]*?)-->/);
  if (!metadataBlockMatch) {
    issues.push('Missing [RESEARCH METADATA] block');
  } else {
    const metadataText = metadataBlockMatch[1];
    
    // Check links count
    const links = [...metadataText.matchAll(/https?:\/\/[^\s>]+/g)];
    if (links.length < 5) {
      issues.push(`Only ${links.length} baseline links found, need 5-10`);
    }
    
    // Check if one is marked as primary/core
    const hasPrimary = metadataText.toLowerCase().includes('primary') || 
                       metadataText.toLowerCase().includes('core') || 
                       metadataText.toLowerCase().includes('nguồn chính');
    if (!hasPrimary && links.length > 0) {
      issues.push('No source designated as Primary/Core');
    }
  }

  // 3. Check Images
  const hasMarkdownImg = /!\[.*?\]\(.*?\)/.test(content);
  const hasHtmlImg = /<img.*?src=.*?>/.test(content);
  if (!hasMarkdownImg && !hasHtmlImg) {
    issues.push('No images found in content');
  }

  if (issues.length > 0) {
    failingFiles.push({ file: relPath, issues });
  }
}

fs.writeFileSync(path.join(__dirname, 'needs_enrichment.json'), JSON.stringify(failingFiles, null, 2));
const filePathsOnly = failingFiles.map(f => path.join(docsDir, f.file));
fs.writeFileSync(path.join(__dirname, 'needs_enrichment.txt'), filePathsOnly.join('\n'));

console.log(`Audit complete. Out of ${allFiles.length - 1} articles, ${failingFiles.length} failed the strict quality checks.`);
console.log(`Saved failure details to needs_enrichment.json`);
