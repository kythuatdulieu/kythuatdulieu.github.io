function initImageViewer() {
    // Select all images in the main content area
    const images = document.querySelectorAll('.sl-markdown-content img');
    if (images.length === 0) return;
    
    images.forEach(img => {
        // Skip small icons, shields, or already wrapped images
        if (img.src.includes('shields.io') || img.clientWidth < 100) return;
        if (img.parentElement && img.parentElement.classList.contains('image-zoom-container')) return;
        if (img.closest('.mermaid-zoom-container')) return;
        
        // Create Zoom Container
        const container = document.createElement('div');
        container.className = 'image-zoom-container';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.width = '100%';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.padding = '1rem';
        container.style.margin = '2rem 0';
        container.style.backgroundColor = 'var(--sl-color-bg-nav)';
        container.style.border = '1px solid var(--sl-color-hairline)';
        container.style.borderRadius = '0.5rem';
        container.style.userSelect = 'none';
        
        // Prepare image for transform
        img.style.transition = 'transform 0.1s ease-out';
        img.style.transformOrigin = 'center center';
        img.style.cursor = 'grab';
        img.style.margin = '0';
        img.style.maxHeight = '70vh';
        img.style.objectFit = 'contain';
        
        // Wrap the image
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        
        // Create Controls Toolbar
        const controls = document.createElement('div');
        controls.className = 'image-controls';
        controls.style.position = 'absolute';
        controls.style.top = '12px';
        controls.style.right = '12px';
        controls.style.zIndex = '10';
        controls.style.display = 'flex';
        controls.style.gap = '6px';
        
        const btnStyle = 'width: 32px !important; height: 32px !important; margin: 0 !important; padding: 0 !important; border-radius: 6px !important; border: 1px solid var(--sl-color-hairline) !important; background-color: var(--sl-color-bg-nav) !important; color: var(--sl-color-text) !important; cursor: pointer !important; font-weight: bold !important; font-size: 16px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; transition: all 0.2s !important; box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;';
        
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
        reset.style.cssText = btnStyle + ' font-size: 14px !important;';
        
        const download = document.createElement('button');
        download.innerHTML = '⬇';
        download.title = 'Download Image';
        download.style.cssText = btnStyle + ' font-size: 14px !important;';
        
        const fullscreen = document.createElement('button');
        fullscreen.innerHTML = '⛶';
        fullscreen.title = 'Full Screen';
        fullscreen.style.cssText = btnStyle + ' font-size: 16px !important;';
        
        controls.appendChild(zoomIn);
        controls.appendChild(zoomOut);
        controls.appendChild(reset);
        controls.appendChild(download);
        controls.appendChild(fullscreen);
        container.appendChild(controls);
        
        // Hover effects for buttons
        [zoomIn, zoomOut, reset, download, fullscreen].forEach(btn => {
            btn.onmouseover = () => {
                btn.style.borderColor = 'var(--sl-color-accent)';
                btn.style.backgroundColor = 'rgba(var(--sl-color-accent-rgb), 0.1)';
            };
            btn.onmouseout = () => {
                btn.style.borderColor = 'var(--sl-color-hairline)';
                btn.style.backgroundColor = 'var(--sl-color-bg-nav)';
            };
        });
        
        // Zoom and Pan State
        let scale = 1.0;
        let panX = 0;
        let panY = 0;
        let isPanning = false;
        let startX = 0;
        let startY = 0;
        
        function updateTransform() {
            img.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        }
        
        // Pan Mouse Events
        container.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || e.target.closest('.image-controls')) return;
            isPanning = true;
            img.style.cursor = 'grabbing';
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
                img.style.cursor = 'grab';
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
        
        download.addEventListener('click', async () => {
            try {
                // Fetch the image as a blob to force download instead of opening in a new tab
                const response = await fetch(img.src);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                const filename = img.src.split('/').pop().split('?')[0] || 'architecture.png';
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (err) {
                // Fallback
                const a = document.createElement('a');
                a.href = img.src;
                a.download = 'architecture.png';
                a.target = '_blank';
                a.click();
            }
        });
        
        fullscreen.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
            overlay.style.backdropFilter = 'blur(5px)';
            overlay.style.zIndex = '999999';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.cursor = 'zoom-out';
            
            const modalImg = document.createElement('img');
            modalImg.src = img.src;
            modalImg.style.maxWidth = '95vw';
            modalImg.style.maxHeight = '95vh';
            modalImg.style.objectFit = 'contain';
            modalImg.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
            modalImg.style.borderRadius = '8px';
            
            // Add animation
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.2s ease-in-out';
            modalImg.style.transform = 'scale(0.95)';
            modalImg.style.transition = 'transform 0.2s ease-in-out';
            
            overlay.appendChild(modalImg);
            document.body.appendChild(overlay);
            
            // Trigger reflow for animation
            overlay.offsetHeight;
            
            overlay.style.opacity = '1';
            modalImg.style.transform = 'scale(1)';
            
            // Allow zoom/pan in full screen mode by adding a small listener
            // (Keeping it simple by closing on click for now, per "chỉ ảnh")
            overlay.addEventListener('click', () => {
                overlay.style.opacity = '0';
                modalImg.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                    }
                }, 200);
            });
        });
    });
}

// Initialize on DOM load and Astro page transitions
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initImageViewer, 300);
});
document.addEventListener('astro:page-load', () => {
    setTimeout(initImageViewer, 300);
});
