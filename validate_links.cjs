const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'src', 'content', 'docs');
const errors = [];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(docsDir);
let totalLinks = 0;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Match markdown links: [text](target)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
        totalLinks++;
        let target = match[2].trim();
        
        // Ignore external links, mailto, tel, empty
        if (target.startsWith('http') || target.startsWith('mailto:') || target.startsWith('tel:') || target.startsWith('#')) {
            continue;
        }

        // Strip hash
        const hashIndex = target.indexOf('#');
        if (hashIndex !== -1) {
            target = target.substring(0, hashIndex);
        }

        // If target is empty after stripping hash, it was an intra-page link
        if (!target) continue;

        // Resolve absolute vs relative
        let resolvedPath = '';
        if (target.startsWith('/')) {
            // Absolute to the site root, meaning it maps to src/content/docs/
            // e.g. /concepts/foo/ -> src/content/docs/concepts/foo.md
            // or /concepts/foo -> src/content/docs/concepts/foo.md
            let cleanTarget = target;
            if (cleanTarget.endsWith('/')) cleanTarget = cleanTarget.slice(0, -1);
            if (cleanTarget === '') cleanTarget = 'index'; // Root maps to index.md
            
            resolvedPath = path.join(docsDir, cleanTarget + '.md');
            if (!fs.existsSync(resolvedPath)) {
                resolvedPath = path.join(docsDir, cleanTarget + '.mdx');
            }
            if (!fs.existsSync(resolvedPath)) {
                resolvedPath = path.join(docsDir, cleanTarget, 'index.md');
            }
            if (!fs.existsSync(resolvedPath)) {
                resolvedPath = path.join(docsDir, cleanTarget, 'index.mdx');
            }
        } else {
            // Relative to current file
            let cleanTarget = target;
            if (cleanTarget.endsWith('/')) cleanTarget = cleanTarget.slice(0, -1);
            if (!cleanTarget.endsWith('.md') && !cleanTarget.endsWith('.mdx')) {
                cleanTarget += '.md';
            }
            
            resolvedPath = path.resolve(path.dirname(file), cleanTarget);
            if (!fs.existsSync(resolvedPath)) {
                // Try .mdx if .md failed
                resolvedPath = resolvedPath.replace(/\.md$/, '.mdx');
            }
        }

        if (!fs.existsSync(resolvedPath)) {
            // Also check if it's an asset in public/
            let publicPath = path.join(__dirname, 'public', target);
            if (!fs.existsSync(publicPath)) {
                errors.push({
                    file: file.replace(__dirname, ''),
                    target: match[2],
                    resolvedPath
                });
            }
        }
    }
});

if (errors.length > 0) {
    fs.writeFileSync('broken_links.json', JSON.stringify(errors, null, 2));
    console.log(`Found ${errors.length} broken links! Saved to broken_links.json`);
} else {
    console.log(`✅ Scanned ${totalLinks} links. All internal links are perfectly valid!`);
}
