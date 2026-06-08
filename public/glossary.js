(function() {
    let conceptsData = {};
    let sortedKeys = [];
    let popoverEl = null;
    let hoverTimeout = null;
    let hideTimeout = null;
    const popoverCache = {};

    async function getConceptsData() {
        if (window.conceptsPromise) {
            return window.conceptsPromise;
        }
        window.conceptsPromise = (async () => {
            if (window.conceptsData && Object.keys(window.conceptsData).length > 0) {
                return window.conceptsData;
            }
            try {
                const conceptsResponse = await fetch('/concepts.json?v=' + new Date().getTime());
                if (conceptsResponse.ok) {
                    const data = await conceptsResponse.json();
                    window.conceptsData = data.concepts || {};
                    return window.conceptsData;
                }
            } catch (err) {
                console.warn('Cannot load concepts.json:', err);
            }
            return {};
        })();
        return window.conceptsPromise;
    }

    async function init() {
        try {
            const data = await getConceptsData();
            conceptsData = data || {};
            sortedKeys = Object.keys(conceptsData).sort((a, b) => b.length - a.length);
            initPopoverDOM();
            
            // Observe DOM changes or just apply to current content
            const container = document.querySelector('.sl-markdown-content') || document.body;
            applyConceptHighlights(container);
        } catch (err) {
            console.warn('Không thể tải glossary khái niệm:', err);
        }
    }

    function initPopoverDOM() {
        if (document.getElementById('concept-popover')) return;
        
        popoverEl = document.createElement('div');
        popoverEl.id = 'concept-popover';
        popoverEl.className = 'concept-popover hidden';
        popoverEl.innerHTML = `
            <div class="popover-body" id="popover-body"></div>
        `;
        
        document.body.appendChild(popoverEl);
        
        popoverEl.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
        });
        popoverEl.addEventListener('mouseleave', () => {
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                hidePopover();
            }, 300);
        });
        
        const closeBtn = document.getElementById('popover-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                hidePopover();
            });
        }
        
        document.addEventListener('click', (e) => {
            if (popoverEl && !popoverEl.classList.contains('hidden') && !popoverEl.contains(e.target) && !e.target.classList.contains('concept-link')) {
                hidePopover();
            }
        });
    }

    function wrapConcepts(element, concepts, sortedKeys) {
        const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        let node;
        while (node = walk.nextNode()) {
            const parent = node.parentNode;
            if (parent && (
                parent.tagName === 'CODE' || 
                parent.tagName === 'PRE' || 
                parent.tagName === 'A' || 
                parent.tagName === 'H1' || 
                parent.tagName === 'H2' || 
                parent.tagName === 'H3' || 
                parent.tagName === 'H4' || 
                parent.classList.contains('concept-link')
            )) {
                continue;
            }
            textNodes.push(node);
        }

        const escapedKeys = sortedKeys.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        const pattern = `(^|[^\\p{L}\\p{N}_])(${escapedKeys.join('|')})(?=[^\\p{L}\\p{N}_]|$)`;
        const regex = new RegExp(pattern, 'gui');

        for (const node of textNodes) {
            const text = node.nodeValue;
            regex.lastIndex = 0;
            
            if (regex.test(text)) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                regex.lastIndex = 0;
                let match;
                
                while ((match = regex.exec(text)) !== null) {
                    const matchedText = match[2];
                    const matchIndex = match.index + match[1].length;
                    
                    if (matchIndex > lastIndex) {
                        fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));
                    }
                    
                    const conceptKey = sortedKeys.find(key => key.toLowerCase() === matchedText.toLowerCase());
                    
                    const span = document.createElement('span');
                    span.className = 'concept-link';
                    span.dataset.concept = conceptKey;
                    span.textContent = matchedText;
                    fragment.appendChild(span);
                    
                    lastIndex = matchIndex + matchedText.length;
                    // reset regex lastIndex to match correctly in case of consecutive matches
                    regex.lastIndex = lastIndex;
                }
                
                if (lastIndex < text.length) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                }
                
                node.parentNode.replaceChild(fragment, node);
            }
        }
    }

    function applyConceptHighlights(containerElement) {
        if (!conceptsData || Object.keys(conceptsData).length === 0) return;
        
        wrapConcepts(containerElement, conceptsData, sortedKeys);
        
        const links = containerElement.querySelectorAll('.concept-link');
        links.forEach(link => {
            link.addEventListener('mouseenter', handleMouseEnter);
            link.addEventListener('mouseleave', handleMouseLeave);
            link.addEventListener('click', handleConceptClick);
        });
    }

    function extractPreview(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const contentArea = doc.querySelector('.sl-markdown-content');
        if (!contentArea) return null;
        
        // Find first paragraph with text
        const paragraphs = contentArea.querySelectorAll('p');
        for (const p of paragraphs) {
            const text = p.textContent.trim();
            if (text.length > 30 && !p.closest('.sl-aside')) {
                return p.innerHTML;
            }
        }
        return null;
    }

    function showPopoverLoading(link) {
        if (!popoverEl) return;
        
        const bodyEl = document.getElementById('popover-body');
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div class="popover-loading">
                    <div class="spinner"></div> Đang tải...
                </div>
            `;
        }
        
        const closeBtn = document.getElementById('popover-close');
        if (closeBtn) closeBtn.style.display = 'none';
        
        popoverEl.classList.remove('hidden');
        popoverEl.offsetWidth; // force reflow
        popoverEl.classList.add('visible');
        
        positionPopover(link);
    }

    function handleMouseEnter(e) {
        const link = e.currentTarget;
        const conceptKey = link.dataset.concept;
        const concept = conceptsData[conceptKey];
        if (!concept) return;

        clearTimeout(hideTimeout);
        clearTimeout(hoverTimeout);
        
        hoverTimeout = setTimeout(async () => {
            if (concept.definition) {
                showPopover(link, concept, false);
            } else if (concept.url) {
                // Show loading first
                showPopoverLoading(link);
                
                const url = concept.url;
                try {
                    let preview = popoverCache[url];
                    if (!preview) {
                        const res = await fetch(url);
                        if (res.ok) {
                            const html = await res.text();
                            preview = extractPreview(html);
                            if (preview) {
                                popoverCache[url] = preview;
                            }
                        }
                    }
                    
                    if (preview) {
                        const tempConcept = { ...concept, definition: preview };
                        showPopover(link, tempConcept, false);
                    } else {
                        const tempConcept = { ...concept, definition: 'Không tìm thấy trích dẫn.' };
                        showPopover(link, tempConcept, false);
                    }
                } catch (err) {
                    const tempConcept = { ...concept, definition: 'Lỗi tải dữ liệu.' };
                    showPopover(link, tempConcept, false);
                }
            } else {
                showPopover(link, concept, false);
            }
        }, 200);
    }

    function handleMouseLeave(e) {
        clearTimeout(hoverTimeout);
        clearTimeout(hideTimeout);
        
        hideTimeout = setTimeout(() => {
            hidePopover();
        }, 300);
    }

    function handleConceptClick(e) {
        // e.preventDefault(); // allow navigation
        e.stopPropagation();
        
        const link = e.currentTarget;
        const conceptKey = link.dataset.concept;
        const slug = conceptKey.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        const concept = conceptsData[conceptKey];
        if (concept && concept.url) {
            window.location.href = concept.url;
        } else {
            window.location.href = `/concepts/${slug}/`;
        }
    }

    function showPopover(link, concept, isSticky = false) {
        if (!popoverEl) return;
        
        const titleEl = document.getElementById('popover-title');
        if (titleEl) {
            titleEl.textContent = concept.title || '';
        }
        
        const categoryEl = document.getElementById('popover-category');
        if (categoryEl) {
            categoryEl.textContent = concept.category || 'Khái niệm';
        }
        
        const bodyEl = document.getElementById('popover-body');
        if (bodyEl) {
            let bulletsHtml = '';
            if (concept.bullets && concept.bullets.length > 0) {
                bulletsHtml = '<ul>' + concept.bullets.map(b => `<li>${b}</li>`).join('') + '</ul>';
            }
            bodyEl.innerHTML = `<p>${concept.definition}</p>${bulletsHtml}`;
        }
        
        const closeBtn = document.getElementById('popover-close');
        const tipEl = popoverEl.querySelector('.popover-tip');
        
        if (isSticky) {
            if (closeBtn) closeBtn.style.display = 'block';
            if (tipEl) tipEl.innerHTML = 'Đã ghim khái niệm';
        } else {
            if (closeBtn) closeBtn.style.display = 'none';
            if (tipEl) tipEl.innerHTML = 'Di chuột ra ngoài để đóng';
        }
        
        popoverEl.classList.remove('hidden');
        popoverEl.offsetWidth; // force reflow
        popoverEl.classList.add('visible');
        
        positionPopover(link);
    }

    function hidePopover() {
        if (!popoverEl) return;
        popoverEl.classList.remove('visible');
        setTimeout(() => {
            if (!popoverEl.classList.contains('visible')) {
                popoverEl.classList.add('hidden');
            }
        }, 200);
    }

    // Run init on initial load and view transitions
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    document.addEventListener('astro:page-load', init);
})();
