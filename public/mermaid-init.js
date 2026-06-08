import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  fontFamily: 'var(--sl-font)'
});

document.addEventListener('DOMContentLoaded', async () => {
    await renderMermaid();
});

// For Astro View Transitions / SPA navigation
document.addEventListener('astro:page-load', async () => {
    await renderMermaid();
});

async function renderMermaid() {
    // Find Astro Starlight Expressive Code blocks that are mermaid
    const mermaidPres = document.querySelectorAll('pre[data-language="mermaid"]');
    
    for (let i = 0; i < mermaidPres.length; i++) {
        const pre = mermaidPres[i];
        const figure = pre.closest('figure.frame');
        
        if (pre.dataset.mermaidRendered) continue;
        
        // Extract text line by line to preserve newlines
        const lines = pre.querySelectorAll('.ec-line');
        let text = '';
        if (lines.length > 0) {
            text = Array.from(lines).map(line => line.textContent).join('\n');
        } else {
            // Fallback for regular unstyled pre>code
            text = pre.textContent;
        }
        
        const id = `mermaid-${Date.now()}-${i}`;
        
        try {
            const container = document.createElement('div');
            container.className = 'mermaid-rendered';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.margin = '2rem 0';
            container.style.padding = '1rem';
            container.style.backgroundColor = 'var(--sl-color-bg-nav)';
            container.style.borderRadius = '0.5rem';
            
            const { svg } = await mermaid.render(id, text);
            container.innerHTML = svg;
            
            // Insert the rendered SVG
            if (figure) {
                figure.parentNode.insertBefore(container, figure);
                figure.style.display = 'none'; // Hide original code block
            } else {
                pre.parentNode.insertBefore(container, pre);
                pre.style.display = 'none';
            }
            
            pre.dataset.mermaidRendered = 'true';
        } catch (e) {
            console.error('Mermaid render error:', e);
            // Leave the code block visible if error
            
            // Optionally, show a small error banner
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'var(--sl-color-red)';
            errorDiv.style.fontSize = '0.8rem';
            errorDiv.innerText = 'Mermaid syntax error';
            pre.parentNode.insertBefore(errorDiv, pre);
        }
    }
}
