import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'src/content/docs');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });
  return arrayOfFiles;
}

const allFiles = getAllFiles(DOCS_DIR);

let internalLinks = [];

const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const text = match[1];
    let url = match[2];
    
    // Ignore images, anchor links, or mailto
    if (url.startsWith('data:') || url.startsWith('#') || url.startsWith('mailto:')) continue;
    
    // Remove hash fragments
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      url = url.substring(0, hashIndex);
    }
    
    if (!url) continue; // It was only a hash

    // Only collect internal links
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      internalLinks.push({ file, text, url });
    }
  }
});

console.log("== CHECKING INTERNAL LINKS ==");
const brokenInternal = [];

internalLinks.forEach(link => {
  let targetPath = '';
  
  if (link.url.startsWith('/images/')) {
    // Images are served from public folder
    targetPath = path.join(process.cwd(), 'public', link.url);
  } else if (link.url.startsWith('/')) {
    // Absolute from docs root
    targetPath = path.join(DOCS_DIR, link.url);
  } else {
    // Relative
    targetPath = path.join(path.dirname(link.file), link.url);
  }
  
  let found = false;
  
  // Clean up trailing slash
  if (targetPath.endsWith('/')) {
    targetPath = targetPath.slice(0, -1);
  }

  const possiblePaths = [
    targetPath,
    targetPath + '.md',
    targetPath + '.mdx',
    targetPath + '/index.md',
    targetPath + '/index.mdx'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      found = true;
      break;
    }
  }

  if (!found) {
    brokenInternal.push(link);
  }
});

console.log(`Found ${internalLinks.length} total internal links.`);

if (brokenInternal.length > 0) {
  console.error(`\n[ERROR] Found ${brokenInternal.length} BROKEN internal links:`);
  brokenInternal.forEach(link => {
    const relativeFile = path.relative(DOCS_DIR, link.file);
    console.error(`- [${link.text}](${link.url}) (in src/content/docs/${relativeFile})`);
  });
  console.error("\nPlease fix the broken links before committing!");
  process.exit(1);
} else {
  console.log("All internal links are valid!");
}
