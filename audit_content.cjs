const fs = require('fs');
const path = require('path');

const conceptsDir = path.join(__dirname, 'src', 'content', 'docs', 'concepts');
const files = fs.readdirSync(conceptsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

let total = 0;
let missingMermaid = [];
let missingCode = [];
let poorTranslation = [];

files.forEach(file => {
    total++;
    const content = fs.readFileSync(path.join(conceptsDir, file), 'utf8');
    
    if (!content.includes('```mermaid')) {
        missingMermaid.push(file);
    }
    
    if (!content.includes('```sql') && !content.includes('```python') && !content.includes('```json') && !content.includes('```yaml')) {
        missingCode.push(file);
    }
    
    // Check if it has english terms in parens like: (Data Warehouse)
    // A simple regex to check if there is at least some english-style capitalized terms in parens
    const englishTermRegex = /\([A-Z][a-zA-Z\s\-]+\)/;
    if (!englishTermRegex.test(content)) {
        poorTranslation.push(file);
    }
});

console.log('--- Content Quality Audit Report ---');
console.log(`Total concepts scanned: ${total}`);
console.log(`Concepts with Mermaid Diagrams: ${total - missingMermaid.length} / ${total}`);
console.log(`Concepts with Practical Code: ${total - missingCode.length} / ${total}`);
console.log(`Concepts adhering to Smart Bilingual standard: ${total - poorTranslation.length} / ${total}`);

fs.writeFileSync('audit_results.json', JSON.stringify({ missingMermaid, missingCode, poorTranslation }, null, 2));
