(function() {
    const popoverCache = {};
    let isTippyLoaded = false;

    // Check if Tippy is loaded
    function ensureTippyLoaded() {
        if (isTippyLoaded || typeof tippy !== 'undefined') {
            isTippyLoaded = true;
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof tippy !== 'undefined') {
                    isTippyLoaded = true;
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);
        });
    }

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
                // Return cleaned HTML
                return p.innerHTML;
            }
        }
        return null;
    }

    function attachPopovers() {
        // Find all internal links to concepts or learning paths
        const links = document.querySelectorAll('a[href^="/concepts/"], a[href^="/learning-paths/"]');
        
        links.forEach(link => {
            // Avoid attaching multiple times
            if (link.dataset.hasPopover) return;
            link.dataset.hasPopover = "true";

            let tippyInstance = null;
            let isFetching = false;

            link.addEventListener('mouseenter', async () => {
                const url = link.getAttribute('href');
                
                // Exclude links on the same page (hash links)
                if (url.startsWith('#')) return;
                
                // Initialize tippy if not exists
                if (!tippyInstance) {
                    await ensureTippyLoaded();
                    tippyInstance = tippy(link, {
                        content: '<div class="popover-loading"><div class="spinner"></div> Đang tải...</div>',
                        allowHTML: true,
                        theme: 'starlight',
                        animation: 'shift-away',
                        interactive: true,
                        maxWidth: 400,
                        placement: 'auto',
                        appendTo: document.body,
                    });
                }
                
                if (popoverCache[url]) {
                    tippyInstance.setContent('<div class="popover-content">' + popoverCache[url] + '</div>');
                    return;
                }

                // Check if this URL matches a concept with a hand-written definition
                const concepts = await getConceptsData();
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
                    const content = `<p>${concept.definition}</p>${bulletsHtml}`;
                    popoverCache[url] = content;
                    tippyInstance.setContent('<div class="popover-content">' + content + '</div>');
                    return;
                }

                if (!isFetching) {
                    isFetching = true;
                    try {
                        const res = await fetch(url);
                        if (res.ok) {
                            const html = await res.text();
                            const preview = extractPreview(html);
                            if (preview) {
                                popoverCache[url] = preview;
                                tippyInstance.setContent('<div class="popover-content">' + preview + '</div>');
                            } else {
                                tippyInstance.setContent('<div class="popover-error">Không tìm thấy trích dẫn.</div>');
                            }
                        }
                    } catch (e) {
                        tippyInstance.setContent('<div class="popover-error">Lỗi tải dữ liệu.</div>');
                    }
                    isFetching = false;
                }
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
