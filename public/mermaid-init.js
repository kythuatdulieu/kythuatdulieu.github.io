import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

function getTheme() {
    // The neutral theme has high contrast shapes and text that work well on both dark and light backgrounds.
    // It prevents the "invisible nodes" bug where default themes clash with site CSS.
    return 'neutral';
}

mermaid.initialize({
  startOnLoad: false,
  theme: getTheme(),
  fontFamily: 'Inter, sans-serif',
  securityLevel: 'loose'
});

async function initAndRender() {
    // Crucial: Wait for fonts to load so Mermaid can accurately measure text bounding boxes!
    // Otherwise nodes will have 0 width/height and arrows will be scattered.
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }
    // Give a tiny extra delay for expressive code to finish DOM manipulation
    setTimeout(async () => {
        await renderMermaid();
    }, 100);
}

document.addEventListener('DOMContentLoaded', initAndRender);

document.addEventListener('astro:page-load', async () => {
    mermaid.initialize({ theme: getTheme() });
    await initAndRender();
});

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            mermaid.initialize({ theme: getTheme() });
            // Cannot reliably re-render without storing original text, 
            // but next page load will have the correct theme.
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
        
        // Remove zero-width spaces or weird characters that expressive code might inject
        text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
        
        const id = `mermaid-${Date.now()}-${i}`;
        
        try {
            const container = document.createElement('div');
            container.className = 'mermaid-rendered';
            container.style.width = '100%';
            container.style.overflowX = 'auto';
            container.style.margin = '2rem 0';
            container.style.padding = '1.5rem';
            container.style.backgroundColor = 'var(--sl-color-bg-nav)';
            container.style.borderRadius = '0.5rem';
            container.style.textAlign = 'center';
            container.style.border = '1px solid var(--sl-color-hairline)';
            
            const { svg } = await mermaid.render(id, text);
            container.innerHTML = svg;
            
            const svgEl = container.querySelector('svg');
            if (svgEl) {
                svgEl.style.minWidth = '500px'; 
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
            console.error('Mermaid render error for block:', text);
            console.error(e);
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'var(--sl-color-red)';
            errorDiv.style.fontSize = '0.8rem';
            errorDiv.innerText = 'Mermaid syntax error';
            pre.parentNode.insertBefore(errorDiv, pre);
        }
    }
}
