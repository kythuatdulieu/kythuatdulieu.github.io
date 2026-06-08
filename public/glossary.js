(function() {
    let conceptsData = {};
    let sortedKeys = [];
    window.popoverCache = window.popoverCache || {};

    // Define shared functions on window conditionally to support any script loading order
    window.ensureTippyLoaded = window.ensureTippyLoaded || function() {
        if (typeof tippy !== 'undefined') {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof tippy !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);
        });
    };

    window.getConceptsData = window.getConceptsData || async function() {
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
    };

    window.extractPageDetails = window.extractPageDetails || function(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract title from h1
        const titleEl = doc.querySelector('h1');
        const title = titleEl ? titleEl.textContent.trim() : '';

        const contentArea = doc.querySelector('.sl-markdown-content');
        let preview = '';
        if (contentArea) {
            const paragraphs = contentArea.querySelectorAll('p');
            for (const p of paragraphs) {
                const text = p.textContent.trim();
                if (text.length > 30 && !p.closest('.sl-aside')) {
                    preview = p.innerHTML;
                    break;
                }
            }
        }
        return { title, preview };
    };

    window.getCategoryLabel = window.getCategoryLabel || function(url) {
        const lower = url.toLowerCase();
        if (lower.includes('/concepts/')) {
            return 'Khái niệm';
        }
        if (lower.includes('/learning-paths/')) {
            return 'Lộ trình học';
        }
        if (lower.includes('/interview/')) {
            return 'Phỏng vấn';
        }
        return 'Tài liệu';
    };

    window.buildPopoverHtml = window.buildPopoverHtml || function(title, category, bodyHtml, url) {
        return `
            <div class="popover-wrapper">
                <div class="popover-header">
                    <span class="popover-category">${category}</span>
                    <h3 class="popover-title"><a href="${url}">${title}</a></h3>
                </div>
                <div class="popover-body">
                    ${bodyHtml}
                </div>
                <div class="popover-footer">
                    <a href="${url}" class="popover-more">Xem chi tiết →</a>
                </div>
            </div>
        `;
    };

    async function init() {
        try {
            const data = await window.getConceptsData();
            conceptsData = data || {};
            sortedKeys = Object.keys(conceptsData).sort((a, b) => b.length - a.length);
            
            const container = document.querySelector('.sl-markdown-content') || document.body;
            applyConceptHighlights(container);
        } catch (err) {
            console.warn('Không thể tải glossary khái niệm:', err);
        }
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
        
        window.ensureTippyLoaded().then(() => {
            links.forEach(link => {
                if (link.dataset.hasPopover) return;
                link.dataset.hasPopover = "true";

                const conceptKey = link.dataset.concept;
                const concept = conceptsData[conceptKey];
                if (!concept) return;

                const slug = conceptKey.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
                const url = concept.url || `/concepts/${slug}/`;

                tippy(link, {
                    content: '<div class="popover-loading"><div class="spinner"></div> Đang tải...</div>',
                    allowHTML: true,
                    theme: 'starlight',
                    animation: 'shift-away',
                    interactive: true,
                    maxWidth: 400,
                    placement: 'auto',
                    appendTo: document.body,
                    onShow: async (instance) => {
                        if (window.popoverCache[url]) {
                            instance.setContent(window.popoverCache[url]);
                            return;
                        }

                        if (concept.definition) {
                            let bulletsHtml = '';
                            if (concept.bullets && concept.bullets.length > 0) {
                                bulletsHtml = '<ul>' + concept.bullets.map(b => `<li>${b}</li>`).join('') + '</ul>';
                            }
                            const content = window.buildPopoverHtml(concept.title || conceptKey, concept.category || 'Khái niệm', `<p>${concept.definition}</p>${bulletsHtml}`, url);
                            window.popoverCache[url] = content;
                            instance.setContent(content);
                            return;
                        }

                        // Fallback fetching
                        try {
                            const res = await fetch(url);
                            if (res.ok) {
                                const html = await res.text();
                                const details = window.extractPageDetails(html);
                                if (details.preview) {
                                    const content = window.buildPopoverHtml(details.title || conceptKey, concept.category || 'Khái niệm', `<p>${details.preview}</p>`, url);
                                    window.popoverCache[url] = content;
                                    instance.setContent(content);
                                } else {
                                    instance.setContent('<div class="popover-error">Không tìm thấy trích dẫn.</div>');
                                }
                            } else {
                                instance.setContent('<div class="popover-error">Không tìm thấy trích dẫn.</div>');
                            }
                        } catch (e) {
                            instance.setContent('<div class="popover-error">Lỗi tải dữ liệu.</div>');
                        }
                    }
                });

                // Intercept click: show preview on first click (prevent navigation), navigate on second click
                link.addEventListener('click', (e) => {
                    const isVisible = link._tippy && link._tippy.state.isVisible;
                    if (!isVisible) {
                        e.preventDefault();
                        link._tippy.show();
                    } else {
                        window.location.href = url;
                    }
                });
            });
        });
    }

    // Run init on initial load and view transitions
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    document.addEventListener('astro:page-load', init);
})();
