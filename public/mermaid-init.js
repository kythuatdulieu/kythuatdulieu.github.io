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
    const mermaidBlocks = document.querySelectorAll('pre.language-mermaid > code, pre.mermaid > code, div.mermaid');
    
    for (let i = 0; i < mermaidBlocks.length; i++) {
        const block = mermaidBlocks[i];
        // If it's a code block inside pre
        const parent = block.tagName === 'CODE' ? block.parentElement : block;
        
        if (parent.dataset.mermaidRendered) continue;
        
        const text = block.textContent;
        const id = `mermaid-${Date.now()}-${i}`;
        
        try {
            const container = document.createElement('div');
            container.className = 'mermaid-rendered';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.margin = '2rem 0';
            
            const { svg } = await mermaid.render(id, text);
            container.innerHTML = svg;
            
            parent.parentNode.insertBefore(container, parent);
            parent.style.display = 'none'; // hide the code block
            parent.dataset.mermaidRendered = 'true';
        } catch (e) {
            console.error('Mermaid render error:', e);
            // Leave the code block visible if error
        }
    }
}
