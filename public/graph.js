(function() {
    function initGraph() {
        const container = document.getElementById('graph-container');
        if (!container) return;
        
        // Check if graph already initialized
        if (container.hasChildNodes() && container.querySelector('.force-graph-container')) return;

        // Force cleanup if something was there but not fully initialized
        container.innerHTML = '';

        fetch('/concepts.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
                const concepts = data.concepts || {};
                const nodes = [];
                const links = [];
                const categoryMap = {};
                
                // Get computed styles for theme colors
                const computedStyle = getComputedStyle(document.body);
                const textColor = computedStyle.getPropertyValue('--sl-color-white').trim() || '#fff';
                const bgColors = [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                ];
                
                // Build Nodes
                Object.keys(concepts).forEach(key => {
                    const c = concepts[key];
                    const cat = c.category || 'Chung';
                    
                    if (!categoryMap[cat]) {
                        categoryMap[cat] = Object.keys(categoryMap).length + 1;
                        nodes.push({ 
                            id: cat, 
                            name: cat, 
                            group: categoryMap[cat], 
                            val: 8, 
                            isCategory: true 
                        });
                    }
                    
                    // Slugify logic similar to Astro Starlight
                    let slug = key.toLowerCase()
                        .replace(/ /g, '-')
                        .replace(/[^\w-]/g, '');
                    
                    nodes.push({
                        id: key,
                        name: c.title || key,
                        group: categoryMap[cat],
                        val: 2,
                        url: '/concepts/' + slug + '/'
                    });
                    
                    links.push({ source: key, target: cat });
                });
                
                if (typeof ForceGraph === 'undefined') {
                    console.warn('ForceGraph library not loaded.');
                    return;
                }
                
                const Graph = ForceGraph()(container)
                    .graphData({ nodes, links })
                    .nodeId('id')
                    .nodeVal('val')
                    .nodeLabel('name')
                    .nodeColor(node => {
                        if (node.isCategory) return '#64748b';
                        return bgColors[(node.group - 1) % bgColors.length];
                    })
                    .linkColor(() => 'rgba(150, 150, 150, 0.2)')
                    .linkWidth(1)
                    .onNodeClick(node => {
                        if (node.url) {
                            window.location.href = node.url;
                        }
                    })
                    .onNodeHover(node => {
                        container.style.cursor = node && node.url ? 'pointer' : 'grab';
                    })
                    .width(container.clientWidth)
                    .height(container.clientHeight)
                    .backgroundColor('transparent');
                    
                // Render text for categories (optional, makes it look cooler)
                Graph.nodeCanvasObject((node, ctx, globalScale) => {
                    const label = node.isCategory ? node.name : '';
                    const fontSize = node.isCategory ? 12/globalScale : 0;
                    
                    // Draw node circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, Math.sqrt(node.val) * 2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();
                    
                    // Draw text
                    if (label) {
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = textColor;
                        ctx.fillText(label, node.x, node.y + Math.sqrt(node.val) * 2 + fontSize);
                    }
                });
                    
                // Resize observer
                const ro = new ResizeObserver(entries => {
                    if (container.clientWidth > 0 && container.clientHeight > 0) {
                        Graph.width(container.clientWidth).height(container.clientHeight);
                    }
                });
                ro.observe(container);
            })
            .catch(err => {
                console.warn('Cannot load graph data:', err);
            });
    }

    // Run init on initial load and view transitions
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGraph);
    } else {
        initGraph();
    }
    document.addEventListener('astro:page-load', initGraph);
})();
