const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer'); // We have it because mermaid-cli uses it

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

(async () => {
    const files = walk(docsDir);
    const mermaidBlocks = [];

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
        let match;
        let blockIndex = 0;
        while ((match = mermaidRegex.exec(content)) !== null) {
            blockIndex++;
            mermaidBlocks.push({
                file: file.replace(__dirname, ''),
                blockIndex,
                content: match[1].trim()
            });
        }
    });

    console.log(`Found ${mermaidBlocks.length} mermaid blocks to validate.`);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Inject mermaid from CDN
    await page.goto('about:blank');
    await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js' });
    
    await page.evaluate(() => {
        mermaid.initialize({ startOnLoad: false });
    });

    for (let i = 0; i < mermaidBlocks.length; i++) {
        const block = mermaidBlocks[i];
        
        try {
            const isValid = await page.evaluate(async (code, id) => {
                try {
                    await mermaid.parse(code);
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.message || e.str };
                }
            }, block.content, `id-${i}`);
            
            if (!isValid.success) {
                console.error(`❌ Syntax Error in ${block.file} (Block ${block.blockIndex}):\n${isValid.error}`);
                errors.push({
                    file: block.file,
                    blockIndex: block.blockIndex,
                    error: isValid.error,
                    content: block.content
                });
            } else {
                process.stdout.write('.');
            }
        } catch (e) {
            console.error(`❌ Evaluation Error in ${block.file} (Block ${block.blockIndex}):`, e.message);
            errors.push({
                file: block.file,
                blockIndex: block.blockIndex,
                error: e.message,
                content: block.content
            });
        }
    }
    
    console.log('\n');
    await browser.close();

    if (errors.length > 0) {
        fs.writeFileSync('mermaid_errors.json', JSON.stringify(errors, null, 2));
        console.log(`\nFound ${errors.length} mermaid syntax errors! Saved to mermaid_errors.json`);
    } else {
        console.log("✅ All mermaid syntax is valid!");
    }
})();
