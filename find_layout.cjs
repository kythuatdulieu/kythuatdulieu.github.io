const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'node_modules', '@astrojs', 'starlight');

function walk(dir, query) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath, query));
        } else if (filePath.endsWith('.astro') || filePath.endsWith('.css') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes(query)) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const queries = ['content-panel', 'right-sidebar-panel', 'sidebar-content'];
queries.forEach(q => {
    console.log(`\nSearching for: "${q}"`);
    const found = walk(targetDir, q);
    found.forEach(f => console.log(` - ${f.replace(__dirname, '')}`));
});
