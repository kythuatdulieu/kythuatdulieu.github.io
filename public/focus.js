(function() {
    function initFocusMode() {
        // Prevent duplicate buttons
        if (document.getElementById('focus-toggle-btn')) return;

        // Only add button if we are on a content page (not the splash homepage)
        if (document.querySelector('.sl-markdown-content')) {
            const btn = document.createElement('button');
            btn.id = 'focus-toggle-btn';
            btn.className = 'focus-toggle-btn';
            btn.title = 'Tắt/Bật chế độ đọc tập trung';
            
            // Icon SVG for focus mode (e.g. expand arrows)
            const iconExpand = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;
            const iconCollapse = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;
            
            // Check localStorage
            const isFocus = localStorage.getItem('focus-mode') === 'true';
            if (isFocus) {
                document.body.classList.add('focus-mode');
                btn.innerHTML = iconCollapse;
            } else {
                btn.innerHTML = iconExpand;
            }

            btn.addEventListener('click', () => {
                document.body.classList.toggle('focus-mode');
                const active = document.body.classList.contains('focus-mode');
                localStorage.setItem('focus-mode', active);
                btn.innerHTML = active ? iconCollapse : iconExpand;
                
                // Trigger resize event to fix graph width if it exists
                setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
            });

            document.body.appendChild(btn);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFocusMode);
    } else {
        initFocusMode();
    }
    document.addEventListener('astro:page-load', initFocusMode);
})();
