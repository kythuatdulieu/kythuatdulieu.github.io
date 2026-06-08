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
        try {
            await mermaid.run({
                querySelector: '.mermaid'
            });
            
            // Post-process to prevent squishing
            document.querySelectorAll('.mermaid svg').forEach(svg => {
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
