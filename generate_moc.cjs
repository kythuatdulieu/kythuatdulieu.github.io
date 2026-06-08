const fs = require('fs');

const planContent = fs.readFileSync('/home/duclinh/.gemini/antigravity-cli/brain/7b095aea-be80-4c74-a751-5ce4c085271c/detailed_plan.md', 'utf-8');

const lines = planContent.split('\n');
let html = `<div class="moc-container">\n`;

let inConceptSection = false;

for (let line of lines) {
    line = line.trim();
    if (line.startsWith('### 5. Danh mục')) {
        inConceptSection = true;
        continue;
    }
    if (inConceptSection && line.startsWith('### 6.')) {
        break;
    }

    if (!inConceptSection) continue;

    if (line.startsWith('#### Nhóm')) {
        const title = line.replace('#### ', '').trim();
        html += `  <h3 class="moc-category">${title}</h3>\n  <div class="moc-grid">\n`;
    } else if (line.match(/^\d+\.\s+`([^`]+)`:\s+(.*)$/)) {
        const match = line.match(/^\d+\.\s+`([^`]+)`:\s+(.*)$/);
        const slug = match[1];
        
        let titleText = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (slug.includes(' ')) {
            titleText = slug;
        }
        const finalSlug = slug.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        
        html += `    <a href="/concepts/${finalSlug}/" class="concept-tag" data-concept="${finalSlug}">${titleText}</a>\n`;
    } else if (line === '' && html.endsWith('  <div class="moc-grid">\n')) {
        // empty line inside list? ignore or close
    } else if (line === '' || line.startsWith('---')) {
        if (html.includes('<div class="moc-grid">') && !html.endsWith('</div>\n')) {
             html += `  </div>\n`;
        }
    }
}
if (!html.endsWith('</div>\n')) {
    html += `  </div>\n`;
}

html += `</div>\n`;

html += `
<style>
.moc-container {
    max-width: 850px;
    margin: 0 auto;
    font-family: var(--sl-font);
}
.moc-category {
    margin-top: 2rem !important;
    margin-bottom: 1.2rem !important;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--sl-color-white);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--sl-color-hairline);
}
.moc-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
}
.concept-tag {
    display: inline-block;
    padding: 0.4rem 0.85rem;
    background-color: var(--sl-color-bg-nav);
    color: var(--sl-color-text-accent);
    border: 1px solid var(--sl-color-hairline);
    border-radius: 9999px;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none !important;
    transition: all 0.2s ease-in-out;
}
.concept-tag:hover {
    background-color: var(--sl-color-accent);
    color: var(--sl-color-text-invert);
    border-color: var(--sl-color-accent);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
}
</style>
`;

fs.writeFileSync('src/components/MapOfContent.astro', html);
console.log('Generated src/components/MapOfContent.astro');
