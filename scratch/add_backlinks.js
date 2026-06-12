import fs from 'fs';
import path from 'path';

const docsDir = '/home/duclinh/kythuatdulieu.github.io/src/content/docs';
const conceptsDir = path.join(docsDir, 'concepts');

// Walk directory to find all markdown files
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
console.log(`Scanning ${allFiles.length} files to add related links...`);

// Helper to parse title from frontmatter
function parseTitle(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const match = content.match(/^title:\s*(.*)$/m);
  if (match) {
    return match[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return path.basename(filepath, '.md');
}

// Map each file to its metadata (parent dir, slug, title)
const filesMeta = allFiles.map(file => {
  const relToDocs = path.relative(docsDir, file);
  const slug = relToDocs.replace(/\.md$/, '');
  const title = parseTitle(file);
  const dir = path.dirname(file);
  
  return {
    absolutePath: file,
    slug: slug,
    title: title,
    dir: dir
  };
});

let updatedCount = 0;

for (const meta of filesMeta) {
  let content = fs.readFileSync(meta.absolutePath, 'utf8');
  
  // Check if "Xem thêm" header already exists (case insensitive)
  if (/##\s*Xem thêm/i.test(content)) {
    continue;
  }
  
  // Find related files
  // First priority: same directory
  let related = filesMeta.filter(m => m.absolutePath !== meta.absolutePath && m.dir === meta.dir);
  
  // Second priority: sibling directories under same domain (e.g. 3-integration/)
  if (related.length < 3) {
    const parentDir = path.dirname(meta.dir);
    const siblings = filesMeta.filter(m => {
      return m.absolutePath !== meta.absolutePath && 
             m.dir !== meta.dir && 
             path.dirname(m.dir) === parentDir;
    });
    related = [...related, ...siblings];
  }
  
  // Third priority: any other concept files
  if (related.length < 3) {
    const others = filesMeta.filter(m => m.absolutePath !== meta.absolutePath && !related.includes(m));
    related = [...related, ...others];
  }
  
  // Select top 3 related files
  const selected = related.slice(0, 3);
  if (selected.length === 0) continue;
  
  // Build the "Xem thêm các khái niệm liên quan" block
  let backlinkBlock = `## Xem thêm các khái niệm liên quan\n`;
  selected.forEach(s => {
    backlinkBlock += `* [${s.title}](/${s.slug}/)\n`;
  });
  backlinkBlock += `\n`;
  
  // Find insertion point right before "## Tài liệu tham khảo" or "## References"
  const refIndex = content.indexOf('## Tài liệu tham khảo') !== -1 
    ? content.indexOf('## Tài liệu tham khảo') 
    : content.indexOf('## References');
    
  if (refIndex !== -1) {
    // Insert before references section
    content = content.slice(0, refIndex) + backlinkBlock + content.slice(refIndex);
  } else {
    // Append to end of body before any trailing newlines
    content = content.trimEnd() + '\n\n' + backlinkBlock;
  }
  
  fs.writeFileSync(meta.absolutePath, content, 'utf8');
  updatedCount++;
}

console.log(`Successfully updated ${updatedCount} files with related concept links.`);
