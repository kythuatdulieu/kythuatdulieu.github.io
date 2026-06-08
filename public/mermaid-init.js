import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

function getTheme() {
    return document.documentElement.dataset.theme === 'light' ? 'default' : 'dark';
}

mermaid.initialize({
  startOnLoad: false,
  theme: getTheme(),
  fontFamily: 'var(--sl-font)'
});

document.addEventListener('DOMContentLoaded', async () => {
    await renderMermaid();
});

document.addEventListener('astro:page-load', async () => {
    // Re-init theme if it changed across navigation (though usually handled by Starlight)
    mermaid.initialize({ theme: getTheme() });
    await renderMermaid();
});

// Observe theme changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            // Theme changed, we might need to re-render or just let the user refresh
            // Full re-render is complex because original text is hidden, 
            // but we can at least update the init for future renders.
            mermaid.initialize({ theme: getTheme() });
        }
    });
});
observer.observe(document.documentElement, { attributes: true });

async function renderMermaid() {
    const mermaidPres = document.querySelectorAll('pre[data-language="mermaid"]');
    
    for (let i = 0; i < mermaidPres.length; i++) {
        const pre = mermaidPres[i];
        const figure = pre.closest('figure.frame');
        
        if (pre.dataset.mermaidRendered) continue;
        
        const lines = pre.querySelectorAll('.ec-line');
        let text = '';
        if (lines.length > 0) {
            text = Array.from(lines).map(line => line.textContent).join('\n');
        } else {
            text = pre.textContent;
        }
        
        const id = `mermaid-${Date.now()}-${i}`;
        
        try {
            const container = document.createElement('div');
            container.className = 'mermaid-rendered';
            container.style.width = '100%';
            container.style.overflowX = 'auto'; // CRITICAL: allows scrolling instead of shrinking
            container.style.margin = '2rem 0';
            container.style.padding = '1rem';
            container.style.backgroundColor = 'var(--sl-color-bg-nav)';
            container.style.borderRadius = '0.5rem';
            container.style.textAlign = 'center'; // Center the SVG if it's smaller than container
            
            const { svg } = await mermaid.render(id, text);
            container.innerHTML = svg;
            
            const svgEl = container.querySelector('svg');
            if (svgEl) {
                // Ensure SVG doesn't strictly scale down to unreadable sizes
                svgEl.style.minWidth = '600px'; 
                svgEl.style.maxWidth = 'max-content';
                svgEl.style.height = 'auto';
                svgEl.style.margin = '0 auto';
            }
            
            if (figure) {
                figure.parentNode.insertBefore(container, figure);
                figure.style.display = 'none';
            } else {
                pre.parentNode.insertBefore(container, pre);
                pre.style.display = 'none';
            }
            
            pre.dataset.mermaidRendered = 'true';
        } catch (e) {
            console.error('Mermaid render error:', e);
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'var(--sl-color-red)';
            errorDiv.style.fontSize = '0.8rem';
            errorDiv.innerText = 'Mermaid syntax error';
            pre.parentNode.insertBefore(errorDiv, pre);
        }
    }
}
