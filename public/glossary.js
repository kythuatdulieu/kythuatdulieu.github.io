(function() {
    let conceptsData = {};
    let sortedKeys = [];
    let popoverEl = null;
    let hoverTimeout = null;
    let hideTimeout = null;

    async function init() {
        try {
            const conceptsResponse = await fetch('/concepts.json?v=' + new Date().getTime());
            if (conceptsResponse.ok) {
                const data = await conceptsResponse.json();
                conceptsData = data.concepts || {};
                sortedKeys = Object.keys(conceptsData).sort((a, b) => b.length - a.length);
                initPopoverDOM();
                
                // Observe DOM changes or just apply to current content
                const container = document.querySelector('.sl-markdown-content') || document.body;
                applyConceptHighlights(container);
            }
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
            <div class="popover-header">
                <h4 id="popover-title">Khái niệm</h4>
                <span class="popover-badge" id="popover-category">Danh mục</span>
            </div>
            <div class="popover-body" id="popover-body"></div>
            <div class="popover-footer">
                <span class="popover-tip">Chạm bên ngoài hoặc nhấn nút để đóng</span>
                <button class="popover-close-btn" id="popover-close">Đóng</button>
            </div>
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
        
        document.getElementById('popover-close').addEventListener('click', (e) => {
            e.preventDefault();
            hidePopover();
        });
        
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

    function handleMouseEnter(e) {
        const link = e.currentTarget;
        const conceptKey = link.dataset.concept;
        const concept = conceptsData[conceptKey];
        if (!concept) return;

        clearTimeout(hideTimeout);
        clearTimeout(hoverTimeout);
        
        hoverTimeout = setTimeout(() => {
            showPopover(link, concept, false);
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
        e.preventDefault();
        e.stopPropagation();
        
        const link = e.currentTarget;
        const conceptKey = link.dataset.concept;
        const concept = conceptsData[conceptKey];
        if (!concept) return;
        
        clearTimeout(hoverTimeout);
        clearTimeout(hideTimeout);
        
        showPopover(link, concept, true);
    }

    function showPopover(link, concept, isSticky = false) {
        if (!popoverEl) return;
        
        document.getElementById('popover-title').textContent = concept.title || conceptKey;
        document.getElementById('popover-category').textContent = concept.category || 'Khái niệm';
        
        const bodyEl = document.getElementById('popover-body');
        let bulletsHtml = '';
        if (concept.bullets && concept.bullets.length > 0) {
            bulletsHtml = '<ul>' + concept.bullets.map(b => `<li>${b}</li>`).join('') + '</ul>';
        }
        bodyEl.innerHTML = `<p>${concept.definition}</p>${bulletsHtml}`;
        
        const closeBtn = document.getElementById('popover-close');
        const tipEl = popoverEl.querySelector('.popover-tip');
        
        if (isSticky) {
            closeBtn.style.display = 'block';
            tipEl.innerHTML = 'Đã ghim khái niệm';
        } else {
            closeBtn.style.display = 'none';
            tipEl.innerHTML = 'Di chuột ra ngoài để đóng';
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

    function positionPopover(link) {
        const rect = link.getBoundingClientRect();
        const popoverWidth = popoverEl.offsetWidth;
        const popoverHeight = popoverEl.offsetHeight;
        
        let left = rect.left + window.scrollX + (rect.width / 2) - (popoverWidth / 2);
        let top = rect.top + window.scrollY - popoverHeight - 12;
        
        if (left < 10) left = 10;
        else if (left + popoverWidth > window.innerWidth - 10) left = window.innerWidth - popoverWidth - 10;
        
        if (rect.top - popoverHeight - 12 < 10) top = rect.bottom + window.scrollY + 12;
        
        popoverEl.style.left = `${left}px`;
        popoverEl.style.top = `${top}px`;
    }

    // Run init on initial load and view transitions
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    document.addEventListener('astro:page-load', init);
})();
