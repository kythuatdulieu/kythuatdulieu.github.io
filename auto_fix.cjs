const fs = require('fs');
const path = require('path');

// 1. FIX BROKEN LINKS
const brokenLinks = JSON.parse(fs.readFileSync('broken_links.json', 'utf8'));
let linkFixCount = 0;
brokenLinks.forEach(({ file, target }) => {
    const fullPath = path.join(__dirname, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    // Escape target for regex
    const escapedTarget = target.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Regex to find: [Some Text](target)
    const regex = new RegExp(`\\[([^\\]]+)\\]\\(${escapedTarget}\\)`, 'g');
    
    // Replace with just the text
    const newContent = content.replace(regex, '$1');
    if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        linkFixCount++;
    }
});
console.log(`Fixed ${linkFixCount} broken links by converting them to plain text.`);

// 2. FIX MERMAID ERRORS
const mermaidErrors = JSON.parse(fs.readFileSync('mermaid_errors.json', 'utf8'));
let mermaidFixCount = 0;

mermaidErrors.forEach(({ file, blockIndex, content: mermaidContent }) => {
    const fullPath = path.join(__dirname, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    let fixedMermaid = mermaidContent
        // 1. Fix unquoted square brackets: A[Text with (parens)] -> A["Text with (parens)"]
        .replace(/([A-Za-z0-9_]+)\[([^\]"']+)\]/g, '$1["$2"]')
        // 2. Fix unquoted parens: A(Text) -> A(["Text"])
        .replace(/([A-Za-z0-9_]+)\(([^)"']+)\)/g, '$1(["$2"])')
        // 3. Fix unquoted curly braces: A{Text} -> A{"Text"}
        .replace(/([A-Za-z0-9_]+)\{([^}"']+)\}/g, '$1{"$2"}')
        // 4. Fix subgraph with parens
        .replace(/subgraph\s+([A-Za-z0-9_\s]+)\(([^)]+)\)/g, 'subgraph "$1 ($2)"')
        // 5. Fix subgraph with spaces but no quotes
        .replace(/subgraph\s+([^"\n\[]+)$/gm, (match, p1) => {
            const trimmed = p1.trim();
            if (trimmed.includes(' ')) return `subgraph "${trimmed}"`;
            return `subgraph ${trimmed}`;
        })
        // 6. Fix edge labels with parens or special chars
        .replace(/-->\|([^|"']+)\|/g, '-->|"$1"|')
        .replace(/\.->\|([^|"']+)\|/g, '.->|"$1"|')
        .replace(/-\.->\|([^|"']+)\|/g, '-.->|"$1"|')
        // 7. Double quotes inside quotes (invalid in mermaid without html entities, strip them or convert to single)
        .replace(/"([^"]*)"/g, (match, p1) => {
             // wait, if we are quoting everything, we might double quote. 
             // We'll let it be for now, simple regex is safer.
             return `"${p1.replace(/"/g, "'")}"`;
        });

    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    let match;
    
    const parts = content.split(/```mermaid\n[\s\S]*?```/);
    const blocks = [];
    while ((match = mermaidRegex.exec(content)) !== null) {
        blocks.push(match[1]);
    }
    
    if (blocks.length >= blockIndex) {
        blocks[blockIndex - 1] = fixedMermaid + '\n';
        
        let built = parts[0];
        for (let i = 0; i < blocks.length; i++) {
            built += '```mermaid\n' + blocks[i] + '```' + (parts[i + 1] || '');
        }
        
        if (built !== content) {
            fs.writeFileSync(fullPath, built, 'utf8');
            mermaidFixCount++;
        }
    }
});

console.log(`Applied regex fixes to ${mermaidFixCount} mermaid blocks.`);
