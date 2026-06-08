(function() {
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

    function attachPopovers() {
        // Find all internal links to concepts or learning paths or interview QAs
        const links = document.querySelectorAll('a[href^="/concepts/"], a[href^="/learning-paths/"], a[href^="/interview/"]');
        
        window.ensureTippyLoaded().then(() => {
            links.forEach(link => {
                // Avoid attaching multiple times
                if (link.dataset.hasPopover) return;
                link.dataset.hasPopover = "true";

                const url = link.getAttribute('href');
                if (url.startsWith('#') || url === '/learning-paths/' || url === '/interview/') return;

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

                        // Check if this URL matches a concept with a hand-written definition
                        const concepts = await window.getConceptsData();
                        const concept = Object.values(concepts).find(c => {
                            const cleanUrl = url.replace(/\/$/, '').toLowerCase();
                            const cleanCUrl = c.url.replace(/\/$/, '').toLowerCase();
                            return cleanUrl === cleanCUrl;
                        });

                        if (concept && concept.definition) {
                            let bulletsHtml = '';
                            if (concept.bullets && concept.bullets.length > 0) {
                                bulletsHtml = '<ul>' + concept.bullets.map(b => `<li>${b}</li>`).join('') + '</ul>';
                            }
                            const category = concept.category || window.getCategoryLabel(url);
                            const content = window.buildPopoverHtml(concept.title || link.textContent, category, `<p>${concept.definition}</p>${bulletsHtml}`, url);
                            window.popoverCache[url] = content;
                            instance.setContent(content);
                            return;
                        }

                        // Fetch fallback preview
                        try {
                            const res = await fetch(url);
                            if (res.ok) {
                                const html = await res.text();
                                const details = window.extractPageDetails(html);
                                if (details.preview) {
                                    const category = window.getCategoryLabel(url);
                                    const title = details.title || link.textContent;
                                    const content = window.buildPopoverHtml(title, category, `<p>${details.preview}</p>`, url);
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


            });
        });
    }

    // Run on initial load and view transitions
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachPopovers);
    } else {
        attachPopovers();
    }
    document.addEventListener('astro:page-load', attachPopovers);
})();
