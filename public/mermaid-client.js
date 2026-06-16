import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

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
            pre.style.overflow = 'visible';
            pre.style.margin = '2rem 0';
            pre.style.padding = '0'; // Let zoom container handle padding
            pre.style.backgroundColor = 'var(--sl-color-bg-nav)';
            pre.style.borderRadius = '0.5rem';
            pre.style.textAlign = 'center';
            pre.style.border = '1px solid var(--sl-color-hairline)';
            pre.style.position = 'relative'; // Crucial for floating controls
            
            pre.dataset.mermaidRendered = 'true';
        }
        
        try {
            await mermaid.run({
                querySelector: 'pre.mermaid'
            });
            
            // Add zoom and pan functionality to each rendered SVG
            document.querySelectorAll('pre.mermaid').forEach(pre => {
                const svg = pre.querySelector('svg');
                if (!svg) return;
                
                // Prevent duplicate wrapper injection
                if (svg.parentElement.classList.contains('mermaid-zoom-container')) return;
                
                // Style the SVG for transforms
                svg.style.transition = 'transform 0.1s ease-out';
                svg.style.transformOrigin = 'center center';
                svg.style.cursor = 'grab';
                svg.style.display = 'block';
                svg.style.margin = '0 auto';
                svg.style.maxWidth = 'none'; // Prevent Starlight scaling
                svg.style.height = 'auto';
                
                // Create zoom container
                const container = document.createElement('div');
                container.className = 'mermaid-zoom-container';
                container.style.position = 'relative';
                container.style.overflow = 'hidden';
                container.style.width = '100%';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';
                container.style.padding = '2.5rem 1.5rem';
                container.style.minHeight = '300px';
                container.style.userSelect = 'none';
                
                // Wrap the SVG
                svg.parentNode.insertBefore(container, svg);
                container.appendChild(svg);
                
                // Create floating controls overlay
                const controls = document.createElement('div');
                controls.className = 'mermaid-controls';
                controls.style.position = 'absolute';
                controls.style.top = '12px';
                controls.style.right = '12px';
                controls.style.zIndex = '10';
                controls.style.display = 'flex';
                controls.style.flexDirection = 'row';
                controls.style.flexWrap = 'nowrap';
                controls.style.alignItems = 'center';
                controls.style.gap = '6px';
                
                const btnStyle = 'width: 32px !important; height: 32px !important; margin: 0 !important; padding: 0 !important; box-sizing: border-box !important; border-radius: 6px !important; border: 1px solid var(--sl-color-hairline) !important; background-color: var(--sl-color-bg-nav) !important; color: var(--sl-color-text) !important; cursor: pointer !important; font-weight: bold !important; font-size: 16px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; transition: all 0.2s !important; box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important; flex-shrink: 0 !important;';
                
                const zoomIn = document.createElement('button');
                zoomIn.innerHTML = '+';
                zoomIn.title = 'Zoom In';
                zoomIn.style.cssText = btnStyle;
                
                const zoomOut = document.createElement('button');
                zoomOut.innerHTML = '-';
                zoomOut.title = 'Zoom Out';
                zoomOut.style.cssText = btnStyle;
                
                const reset = document.createElement('button');
                reset.innerHTML = '⟲';
                reset.title = 'Reset Zoom';
                reset.style.cssText = btnStyle;
                reset.style.fontSize = '14px';
                
                const download = document.createElement('button');
                download.innerHTML = '⬇';
                download.title = 'Download SVG';
                download.style.cssText = btnStyle;
                download.style.fontSize = '14px';
                
                controls.appendChild(zoomIn);
                controls.appendChild(zoomOut);
                controls.appendChild(reset);
                controls.appendChild(download);
                pre.appendChild(controls);
                
                // Add hover states
                [zoomIn, zoomOut, reset, download].forEach(btn => {
                    btn.onmouseover = () => {
                        btn.style.borderColor = 'var(--sl-color-accent)';
                        btn.style.backgroundColor = 'rgba(var(--sl-color-accent-rgb), 0.1)';
                    };
                    btn.onmouseout = () => {
                        btn.style.borderColor = 'var(--sl-color-hairline)';
                        btn.style.backgroundColor = 'var(--sl-color-bg-nav)';
                    };
                });
                
                // Zoom & Pan state variables
                let scale = 1.0;
                let panX = 0;
                let panY = 0;
                let isPanning = false;
                let startX = 0;
                let startY = 0;
                
                function updateTransform() {
                    svg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
                }
                
                // Drag to Pan
                container.addEventListener('mousedown', (e) => {
                    if (e.button !== 0 || e.target.closest('.mermaid-controls')) return;
                    isPanning = true;
                    svg.style.cursor = 'grabbing';
                    startX = e.clientX - panX;
                    startY = e.clientY - panY;
                    e.preventDefault();
                });
                
                window.addEventListener('mousemove', (e) => {
                    if (!isPanning) return;
                    panX = e.clientX - startX;
                    panY = e.clientY - startY;
                    updateTransform();
                });
                
                window.addEventListener('mouseup', () => {
                    if (isPanning) {
                        isPanning = false;
                        svg.style.cursor = 'grab';
                    }
                });
                

                
                // Button Actions
                zoomIn.addEventListener('click', () => {
                    if (scale < 6.0) scale *= 1.25;
                    updateTransform();
                });
                
                zoomOut.addEventListener('click', () => {
                    if (scale > 0.2) scale /= 1.25;
                    updateTransform();
                });
                
                reset.addEventListener('click', () => {
                    scale = 1.0;
                    panX = 0;
                    panY = 0;
                    updateTransform();
                });
                
                download.addEventListener('click', () => {
                    const svgClone = svg.cloneNode(true);
                    svgClone.style.transform = 'none';
                    svgClone.style.cursor = 'default';
                    
                    const svgData = new XMLSerializer().serializeToString(svgClone);
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    const svgUrl = URL.createObjectURL(svgBlob);
                    
                    const downloadLink = document.createElement('a');
                    downloadLink.href = svgUrl;
                    
                    let filename = 'mermaid-diagram.svg';
                    const heading = pre.previousElementSibling;
                    if (heading && heading.tagName.match(/^H[1-6]$/)) {
                        filename = heading.textContent.toLowerCase().trim().replace(/[\s\W]+/g, '-') + '.svg';
                    } else {
                        const pageTitle = document.querySelector('h1');
                        if (pageTitle) {
                            filename = pageTitle.textContent.toLowerCase().trim().replace(/[\s\W]+/g, '-') + '-diagram.svg';
                        }
                    }
                    
                    downloadLink.download = filename;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(svgUrl);
                });
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
