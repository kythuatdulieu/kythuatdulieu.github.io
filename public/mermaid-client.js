import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  fontFamily: 'Inter, sans-serif',
  securityLevel: 'loose'
});

async function initAndRender() {
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }
    
    setTimeout(async () => {
        const mermaidNodes = document.querySelectorAll('pre.mermaid');
        if (mermaidNodes.length === 0) return;
        
        for (let i = 0; i < mermaidNodes.length; i++) {
            const pre = mermaidNodes[i];
            
            if (pre.dataset.mermaidRendered) continue;
            
            // Apply wrapper styles directly to the pre element
            pre.style.width = '100%';
            pre.style.overflowX = 'auto';
            pre.style.margin = '2rem 0';
            pre.style.padding = '1.5rem';
            pre.style.backgroundColor = 'var(--sl-color-bg-nav)';
            pre.style.borderRadius = '0.5rem';
            pre.style.textAlign = 'center';
            pre.style.border = '1px solid var(--sl-color-hairline)';
            
            pre.dataset.mermaidRendered = 'true';
        }
        
        try {
            await mermaid.run({
                querySelector: 'pre.mermaid'
            });
            
            // Add extra min-width to generated SVGs to prevent squishing
            document.querySelectorAll('pre.mermaid svg').forEach(svg => {
                svg.style.minWidth = '500px';
                svg.style.maxWidth = 'max-content';
                svg.style.height = 'auto';
                svg.style.margin = '0 auto';
            });
        } catch (e) {
            console.error('Mermaid run error:', e);
        }
    }, 150);
}

document.addEventListener('DOMContentLoaded', initAndRender);

document.addEventListener('astro:page-load', async () => {
    mermaid.initialize({ theme: 'neutral' });
    await initAndRender();
});
