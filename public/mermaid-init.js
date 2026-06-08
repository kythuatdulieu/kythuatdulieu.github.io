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
        const mermaidPres = document.querySelectorAll('pre[data-language="mermaid"]');
        if (mermaidPres.length === 0) return;
        
        const nodesToRun = [];
        
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
            
            text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
            
            // Create a native mermaid container
            const container = document.createElement('div');
            container.className = 'mermaid mermaid-rendered';
            container.textContent = text;
            container.style.width = '100%';
            container.style.overflowX = 'auto';
            container.style.margin = '2rem 0';
            container.style.padding = '1.5rem';
            container.style.backgroundColor = 'var(--sl-color-bg-nav)';
            container.style.borderRadius = '0.5rem';
            container.style.textAlign = 'center';
            container.style.border = '1px solid var(--sl-color-hairline)';
            
            if (figure) {
                figure.parentNode.insertBefore(container, figure);
                figure.style.display = 'none';
            } else {
                pre.parentNode.insertBefore(container, pre);
                pre.style.display = 'none';
            }
            
            pre.dataset.mermaidRendered = 'true';
            nodesToRun.push(container);
        }
        
        if (nodesToRun.length > 0) {
            try {
                await mermaid.run({
                    nodes: nodesToRun
                });
                
                // Add extra min-width to generated SVGs to prevent squishing
                nodesToRun.forEach(container => {
                    const svg = container.querySelector('svg');
                    if (svg) {
                        svg.style.minWidth = '500px';
                        svg.style.maxWidth = 'max-content';
                        svg.style.height = 'auto';
                        svg.style.margin = '0 auto';
                    }
                });
            } catch (e) {
                console.error('Mermaid run error:', e);
            }
        }
    }, 150);
}

document.addEventListener('DOMContentLoaded', initAndRender);

document.addEventListener('astro:page-load', async () => {
    mermaid.initialize({ theme: 'neutral' });
    await initAndRender();
});
