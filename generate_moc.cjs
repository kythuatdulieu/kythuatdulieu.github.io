const fs = require('fs');

const planContent = fs.readFileSync('/home/duclinh/.gemini/antigravity-cli/brain/7b095aea-be80-4c74-a751-5ce4c085271c/detailed_plan.md', 'utf-8');

const lines = planContent.split('\n');
let html = `<div class="moc-container">\n`;

let inConceptSection = false;

for (let line of lines) {
    line = line.trim();
    if (line.startsWith('### 1. Danh sách Khái niệm')) {
        inConceptSection = true;
        continue;
    }
    if (inConceptSection && line.startsWith('### 2.')) {
        break;
    }

    if (!inConceptSection) continue;

    if (line.startsWith('#### Nhóm')) {
        const title = line.replace('#### ', '').trim();
        html += `  <h3 class="moc-category">${title}</h3>\n  <ul class="moc-list">\n`;
    } else if (line.match(/^\d+\.\s+`([^`]+)`:\s+(.*)$/)) {
        const match = line.match(/^\d+\.\s+`([^`]+)`:\s+(.*)$/);
        const slug = match[1];
        let desc = match[2].trim();
        
        // title format
        let titleText = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (slug.includes(' ')) {
            titleText = slug; // if it wasn't slugified
        }
        const finalSlug = slug.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        
        html += `    <li><a href="/concepts/${finalSlug}/" class="concept-link" data-concept="${finalSlug}"><strong>${titleText}</strong></a>: ${desc}</li>\n`;
    } else if (line === '' && html.endsWith('  <ul class="moc-list">\n')) {
        // empty line inside list? ignore or close
    } else if (line === '' || line.startsWith('---')) {
        if (html.includes('<ul class="moc-list">') && !html.endsWith('</ul>\n')) {
             html += `  </ul>\n`;
        }
    }
}
if (!html.endsWith('</ul>\n')) {
    html += `  </ul>\n`;
}

html += `</div>\n`;

html += `
<style>
.moc-container {
    max-width: 800px;
    margin: 0 auto;
    font-family: var(--sl-font);
}
.moc-category {
    margin-top: 2.5rem !important;
    margin-bottom: 1rem !important;
    font-size: 1.5rem;
    color: var(--sl-color-white);
    border-bottom: 1px solid var(--sl-color-gray-5);
    padding-bottom: 0.5rem;
}
.moc-list {
    list-style-type: none;
    padding-left: 0;
}
.moc-list li {
    margin-bottom: 0.75rem;
    line-height: 1.6;
    color: var(--sl-color-gray-3);
}
.concept-link {
    color: var(--sl-color-accent-high);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
}
.concept-link:hover {
    color: var(--sl-color-accent);
    text-decoration: underline;
}
</style>
`;

fs.writeFileSync('src/components/MapOfContent.astro', html);
console.log('Generated src/components/MapOfContent.astro');
