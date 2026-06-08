(function() {
    function initGraph() {
        const container = document.getElementById('graph-container');
        if (!container) return;
        
        // Check if graph already initialized
        if (container.hasChildNodes() && container.querySelector('.force-graph-container')) return;
        container.innerHTML = '';

        Promise.all([
            fetch('/concepts.json?v=' + new Date().getTime()).then(res => res.json()),
            fetch('/backlinks.json?v=' + new Date().getTime()).then(res => res.json())
        ])
        .then(([conceptsData, backlinksData]) => {
            const concepts = conceptsData.concepts || {};
            const nodes = [];
            const links = [];
            const nodeMap = new Set();
            
            // Get computed styles for theme colors
            const computedStyle = getComputedStyle(document.body);
            const textColor = computedStyle.getPropertyValue('--sl-color-white').trim() || '#fff';
            const bgColors = [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
            ];

            const categoryMap = {};

            // Helper to get group by category
            function getGroup(cat) {
                if (!categoryMap[cat]) categoryMap[cat] = Object.keys(categoryMap).length + 1;
                return categoryMap[cat];
            }

            // Build Nodes from concepts
            Object.keys(concepts).forEach(key => {
                const c = concepts[key];
                const cat = c.category || 'Chung';
                let slug = key.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
                let url = c.url || ('/concepts/' + slug + '/');
                
                nodes.push({
                    id: url,
                    name: c.title || key,
                    group: getGroup(cat),
                    val: 3,
                    url: url
                });
                nodeMap.add(url);
            });

            // Build links from backlinks
            Object.keys(backlinksData).forEach(targetUrl => {
                const sources = backlinksData[targetUrl];
                sources.forEach(source => {
                    // Only add if source and target are both in our nodes (to keep graph clean)
                    if (nodeMap.has(source.url) && nodeMap.has(targetUrl)) {
                        links.push({
                            source: source.url,
                            target: targetUrl
                        });
                        
                        // Increase val (size) based on connections
                        const targetNode = nodes.find(n => n.id === targetUrl);
                        if (targetNode) targetNode.val += 0.5;
                        
                        const sourceNode = nodes.find(n => n.id === source.url);
                        if (sourceNode) sourceNode.val += 0.1;
                    }
                });
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
                .nodeColor(node => bgColors[(node.group - 1) % bgColors.length])
                .linkColor(() => 'rgba(150, 150, 150, 0.25)')
                .linkWidth(1.5)
                .onNodeClick(node => {
                    if (node.url) window.location.href = node.url;
                })
                .onNodeHover(node => {
                    container.style.cursor = node && node.url ? 'pointer' : 'grab';
                })
                .width(container.clientWidth)
                .height(container.clientHeight)
                .backgroundColor('transparent');
                
            Graph.d3Force('charge').strength(-50);
            Graph.d3Force('link').distance(40);
                
            // Render text
            Graph.nodeCanvasObject((node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 14/globalScale;
                
                // Draw node circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, Math.sqrt(node.val) * 2, 0, 2 * Math.PI, false);
                ctx.fillStyle = node.color;
                ctx.fill();
                
                // Draw text for bigger nodes
                if (node.val > 5 && globalScale > 1.5) {
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGraph);
    } else {
        initGraph();
    }
    document.addEventListener('astro:page-load', initGraph);
})();
