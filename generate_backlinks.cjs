const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
        const name = dir + '/' + file;
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files);
        } else if (name.endsWith('.md') || name.endsWith('.mdx')) {
            files.push(name);
        }
    }
    return files;
}

function updateGlossary() {
    const conceptsDir = path.join(__dirname, 'src', 'content', 'docs', 'concepts');
    const outPath = path.join(__dirname, 'public', 'concepts.json');
    
    if (!fs.existsSync(conceptsDir)) {
        console.warn('Concepts directory not found.');
        return;
    }

    const mdFiles = [];
    function walkDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walkDir(fullPath);
            } else if (file.endsWith('.md')) {
                mdFiles.push(fullPath);
            }
        }
    }
    walkDir(conceptsDir);

    const concepts = {};

    mdFiles.forEach(file => {
        const slug = path.basename(file, '.md');
        const relPath = path.relative(path.join(__dirname, 'src', 'content', 'docs'), file);
        const urlPath = '/' + relPath.replace(/\.md$/, '/').replace(/\\/g, '/');

        let key = slug.replace(/-/g, ' ');
        if (key.toLowerCase() === 'etl') key = 'ETL';
        else if (key.toLowerCase() === 'elt') key = 'ELT';
        else if (key.toLowerCase() === 'olap') key = 'OLAP';
        else if (key.toLowerCase() === 'oltp') key = 'OLTP';
        else if (key.toLowerCase() === 'rag') key = 'RAG';
        else if (key.toLowerCase() === 'llm') key = 'LLM';
        else if (key === key.toLowerCase()) {
            key = key.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }

        const content = fs.readFileSync(file, 'utf8');
        const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        const meta = {};
        if (fmMatch) {
            const yamlText = fmMatch[1];
            yamlText.split('\n').forEach(line => {
                line = line.trim();
                if (!line || !line.includes(':')) return;
                const idx = line.indexOf(':');
                const k = line.slice(0, idx).trim();
                const v = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
                meta[k] = v;
            });
        }

        const title = meta.seoTitle || meta.title || key;
        const category = meta.category || 'Khái niệm';
        const definition = meta.definition || '';
        const level = meta.level || '';

        // Parse aliases (YAML array 1 dòng: aliases: ["Kafka", "Apache Kafka"])
        let aliases = [];
        if (meta.aliases) {
            try {
                aliases = JSON.parse(meta.aliases.replace(/'/g, '"'));
            } catch (e) {
                aliases = meta.aliases.replace(/^\[|\]$/g, '').split(',')
                    .map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
            }
            if (!Array.isArray(aliases)) aliases = [];
        }

        // Parse domains
        let domains = [];
        if (meta.domains) {
            try {
                domains = JSON.parse(meta.domains.replace(/'/g, '"'));
            } catch (e) {
                domains = meta.domains.replace(/^\[|\]$/g, '').split(',')
                    .map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
            }
            if (!Array.isArray(domains)) domains = [];
        }

        concepts[key] = {
            title: title,
            category: category,
            definition: definition,
            level: level,
            domains: domains,
            aliases: aliases,
            bullets: [],
            url: urlPath
        };
    });

    fs.writeFileSync(outPath, JSON.stringify({ concepts }, null, 2), 'utf8');
    console.log('concepts.json generated/updated.');
}

// Update concepts.json before building backlinks
updateGlossary();

const docsDir = path.join(__dirname, 'src', 'content', 'docs');
const files = getFiles(docsDir);

const backlinks = {};
const slugToUrl = {};

files.forEach(file => {
    let relPath = path.relative(docsDir, file);
    let urlPath = '/' + relPath.replace(/\.mdx?$/, '/').replace(/\\/g, '/');
    if (urlPath.endsWith('index/')) {
        urlPath = urlPath.replace('index/', '');
    }
    const slug = path.basename(file, path.extname(file));
    slugToUrl[slug] = urlPath;
});


files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Extract title from frontmatter
    let title = '';
    const titleMatch = content.match(/^title:\s*(.+)$/m);
    if (titleMatch) {
        title = titleMatch[1].replace(/['"]/g, '').trim();
    } else {
        title = path.basename(file, path.extname(file));
    }
    
    // Create source URL path based on file path
    let relPath = path.relative(docsDir, file);
    let urlPath = '/' + relPath.replace(/\.mdx?$/, '/').replace(/\\/g, '/');
    if (urlPath.endsWith('index/')) {
        urlPath = urlPath.replace('index/', '');
    }
    
    // Find all markdown links [text](link)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
        let linkUrl = match[2];
        // clean up linkUrl
        if (linkUrl.startsWith('http') || linkUrl.startsWith('#') || linkUrl.startsWith('mailto:')) continue;
        
        // Resolve relative links if needed, or assume they are root relative if they start with /
        if (!linkUrl.startsWith('/')) {
            // Assume it's relative to current file
            const dir = path.dirname(urlPath);
            // very naive resolution
            linkUrl = path.join(dir, linkUrl).replace(/\\/g, '/');
            if (!linkUrl.startsWith('/')) linkUrl = '/' + linkUrl;
        }
        
        // Remove hash
        linkUrl = linkUrl.split('#')[0];
        if (!linkUrl.endsWith('/')) linkUrl += '/';
        
        if (!backlinks[linkUrl]) {
            backlinks[linkUrl] = [];
        }
        
        // Prevent duplicates
        if (!backlinks[linkUrl].find(b => b.url === urlPath)) {
            backlinks[linkUrl].push({
                url: urlPath,
                title: title
            });
        }
    }
});

// Also add implicit concept backlinks by reading concepts.json
try {
    const conceptsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'concepts.json'), 'utf8')).concepts;
    const sortedKeys = Object.keys(conceptsData).sort((a, b) => b.length - a.length);
    const escapedKeys = sortedKeys.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const pattern = `(^|[^\\p{L}\\p{N}_])(${escapedKeys.join('|')})(?=[^\\p{L}\\p{N}_]|$)`;
    const regex = new RegExp(pattern, 'gui');
    
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        let title = '';
        const titleMatch = content.match(/^title:\s*(.+)$/m);
        if (titleMatch) title = titleMatch[1].replace(/['"]/g, '').trim();
        else title = path.basename(file, path.extname(file));
        
        let relPath = path.relative(docsDir, file);
        let urlPath = '/' + relPath.replace(/\.mdx?$/, '/').replace(/\\/g, '/');
        if (urlPath.endsWith('index/')) urlPath = urlPath.replace('index/', '');
        
        // Exclude frontmatter for searching
        const bodyContent = content.replace(/^---[\s\S]+?---/, '');
        
        regex.lastIndex = 0;
        const matches = new Set();
        let m;
        while ((m = regex.exec(bodyContent)) !== null) {
            const matchedText = m[2];
            const conceptKey = sortedKeys.find(key => key.toLowerCase() === matchedText.toLowerCase());
            if (conceptKey) matches.add(conceptKey);
        }
        
        matches.forEach(conceptKey => {
            let slug = conceptKey.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
            let linkUrl = slugToUrl[slug] || ('/concepts/' + slug + '/');
            
            // Exclude self links
            if (linkUrl === urlPath) return;
            
            if (!backlinks[linkUrl]) backlinks[linkUrl] = [];
            if (!backlinks[linkUrl].find(b => b.url === urlPath)) {
                backlinks[linkUrl].push({
                    url: urlPath,
                    title: title
                });
            }
        });
    });
} catch(e) {
    console.error("Error processing implicit concepts for backlinks:", e);
}

fs.writeFileSync(path.join(__dirname, 'public', 'backlinks.json'), JSON.stringify(backlinks, null, 2));
console.log('Backlinks generated successfully.');
