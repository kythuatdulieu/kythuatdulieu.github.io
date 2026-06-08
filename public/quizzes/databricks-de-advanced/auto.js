// ═══════════════════════════════════════════════════════════
// AUTO-CLICKER FOR "Accept" BUTTON
// Searches inside iframes and auto-clicks
// ═══════════════════════════════════════════════════════════

(function () {
    'use strict';

    // ==================== STATE MANAGEMENT ====================
    const state = {
        interval: null,
        ui: null,
        totalClicks: 0,
        totalScrolls: 0,
        targetScrollElement: null,
        targetIframe: null,
        isCollapsed: true
    };

    // ==================== CLEANUP ====================
    function cleanup() {
        if (window.autoClickerInterval) {
            clearInterval(window.autoClickerInterval);
            console.log('🛑 Stopped previous auto-clicker interval');
        }

        if (window.autoClickerUI) {
            window.autoClickerUI.remove();
            console.log('🛑 Removed previous UI');
        }

        const oldUI = document.getElementById('auto-clicker-indicator');
        if (oldUI) oldUI.remove();

        // Clean up references
        window.autoClickerInterval = null;
        window.autoClickerUI = null;

        console.clear();
        console.log('═'.repeat(80));
        console.log('🎯 AUTO-CLICKER FOR "Accept" BUTTON');
        console.log('═'.repeat(80));
    }

    // ==================== UI CREATION ====================
    function createUI() {
        const container = document.createElement('div');
        container.id = 'auto-clicker-indicator';
        container.style.cssText = `
            position: fixed; top: 20px; left: 20px;
            background: #2d2d30; color: #cccccc;
            padding: 8px 12px; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px; z-index: 999999;
            border: 1px solid #007acc; min-width: auto;
        `;

        // Create title bar
        const titleBar = document.createElement('div');
        titleBar.id = 'title-bar';
        titleBar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0; cursor: move;';

        const title = document.createElement('div');
        title.style.cssText = 'font-weight: bold; color: #4ec9b0; flex: 1;';
        title.textContent = '🎯 Accept Auto-Clicker';

        const collapseBtn = document.createElement('button');
        collapseBtn.id = 'collapse-btn';
        collapseBtn.textContent = '+';
        collapseBtn.style.cssText = 'background: transparent; color: #cccccc; border: 1px solid #555; border-radius: 3px; cursor: pointer; font-size: 18px; width: 24px; height: 24px; padding: 0; line-height: 1; margin-left: 10px;';

        titleBar.appendChild(title);
        titleBar.appendChild(collapseBtn);

        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.id = 'content-wrapper';
        contentWrapper.style.display = 'none';

        // Clicked count
        const clickedDiv = document.createElement('div');
        clickedDiv.style.cssText = 'margin-bottom: 8px; color: #858585;';
        clickedDiv.textContent = 'Clicked: ';
        const clickCount = document.createElement('span');
        clickCount.id = 'click-count';
        clickCount.style.cssText = 'color: #4ec9b0; font-weight: bold;';
        clickCount.textContent = '0';
        clickedDiv.appendChild(clickCount);
        clickedDiv.appendChild(document.createTextNode(' times'));

        // Scroll into view checkbox
        const scrollLabel = document.createElement('label');
        scrollLabel.style.cssText = 'display: flex; align-items: center; cursor: pointer; user-select: none; margin-bottom: 8px;';
        const scrollCheckbox = document.createElement('input');
        scrollCheckbox.type = 'checkbox';
        scrollCheckbox.id = 'scroll-into-view-checkbox';
        scrollCheckbox.checked = true;
        scrollCheckbox.style.cssText = 'margin-right: 8px; cursor: pointer; width: 16px; height: 16px;';
        const scrollText = document.createElement('span');
        scrollText.textContent = 'Scroll Button Into View';
        scrollLabel.appendChild(scrollCheckbox);
        scrollLabel.appendChild(scrollText);

        // Auto-click checkbox
        const clickLabel = document.createElement('label');
        clickLabel.style.cssText = 'display: flex; align-items: center; cursor: pointer; user-select: none; margin-bottom: 8px;';
        const clickCheckbox = document.createElement('input');
        clickCheckbox.type = 'checkbox';
        clickCheckbox.id = 'auto-click-checkbox';
        clickCheckbox.checked = true;
        clickCheckbox.style.cssText = 'margin-right: 8px; cursor: pointer; width: 16px; height: 16px;';
        const clickText = document.createElement('span');
        clickText.textContent = 'Enable Auto-Click';
        clickLabel.appendChild(clickCheckbox);
        clickLabel.appendChild(clickText);

        // Stop button
        const killBtn = document.createElement('button');
        killBtn.id = 'kill-btn';
        killBtn.textContent = '🛑 Stop';
        killBtn.style.cssText = 'width: 100%; padding: 8px; margin-top: 8px; background: #c74440; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;';

        // Status text
        const status = document.createElement('div');
        status.style.cssText = 'margin-top: 10px; font-size: 11px; color: #858585;';
        status.textContent = 'Scanning every 3 seconds';

        // Assemble content wrapper
        contentWrapper.appendChild(clickedDiv);
        contentWrapper.appendChild(scrollLabel);
        contentWrapper.appendChild(clickLabel);
        contentWrapper.appendChild(killBtn);
        contentWrapper.appendChild(status);

        // Assemble container
        container.appendChild(titleBar);
        container.appendChild(contentWrapper);
        document.body.appendChild(container);

        // Setup event listeners
        setupEventListeners(container);
        setupDraggable(container);

        return container;
    }

    // ==================== EVENT LISTENERS ====================
    function setupEventListeners(container) {
        const collapseBtn = container.querySelector('#collapse-btn');
        const contentWrapper = container.querySelector('#content-wrapper');
        const titleBar = container.querySelector('#title-bar');

        collapseBtn.onclick = () => {
            state.isCollapsed = !state.isCollapsed;
            if (state.isCollapsed) {
                contentWrapper.style.display = 'none';
                collapseBtn.textContent = '+';
                container.style.minWidth = 'auto';
                container.style.padding = '8px 12px';
                titleBar.style.marginBottom = '0';
            } else {
                contentWrapper.style.display = 'block';
                collapseBtn.textContent = '−';
                container.style.minWidth = '250px';
                container.style.padding = '15px 20px';
                titleBar.style.marginBottom = '10px';
            }
        };

        container.querySelector('#kill-btn').onclick = () => {
            clearInterval(state.interval);
            container.remove();
            window.autoClickerInterval = null;
            window.autoClickerUI = null;
            console.log('🛑 AUTO-CLICKER STOPPED');
        };
    }

    // ==================== DRAGGABLE ====================
    function setupDraggable(container) {
        let isDragging = false;
        let currentX = 0, currentY = 0;
        let initialX = 0, initialY = 0;
        let xOffset = 0, yOffset = 0;

        const titleBar = container.querySelector('#title-bar');
        const collapseBtn = container.querySelector('#collapse-btn');

        titleBar.addEventListener('mousedown', (e) => {
            if (e.target === collapseBtn) return;
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            container.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        });

        document.addEventListener('mouseup', () => {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        });
    }

    // ==================== SCROLL INSPECTOR ====================
    function startScrollInspector() {
        console.log('🔍 SCROLL INSPECTOR ACTIVATED');
        console.log('📌 Hover over the scrollable element and press SPACE to capture it');
        console.log('❌ Press ESC to cancel');

        const { overlay, indicator, label } = createInspectorUI();
        let hoveredElement = null;
        let hoveredIframe = null;

        function updateHighlight(e) {
            const result = findElementAtPoint(e.clientX, e.clientY);
            if (result) {
                hoveredElement = result.element;
                hoveredIframe = result.iframe;
                updateIndicatorPosition(indicator, label, result);
            }
        }

        function handleKeyDown(e) {
            if (e.code === 'Space' && hoveredElement) {
                e.preventDefault();
                e.stopPropagation();
                captureScrollElement(hoveredElement, hoveredIframe);
                cleanupInspector();
            } else if (e.code === 'Escape') {
                console.log('❌ Scroll inspector cancelled');
                cleanupInspector();
            }
        }

        function cleanupInspector() {
            document.removeEventListener('mousemove', updateHighlight, true);
            document.removeEventListener('keydown', handleKeyDown, true);
            overlay.remove();
            indicator.remove();
            label.remove();
        }

        document.addEventListener('mousemove', updateHighlight, true);
        document.addEventListener('keydown', handleKeyDown, true);
    }

    function createInspectorUI() {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 123, 255, 0.1); z-index: 999998; pointer-events: none;';

        const indicator = document.createElement('div');
        indicator.style.cssText = 'position: fixed; background: rgba(0, 123, 255, 0.3); border: 2px solid #007acc; pointer-events: none; z-index: 999999; display: none; box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);';

        const label = document.createElement('div');
        label.style.cssText = 'position: fixed; background: #007acc; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; z-index: 1000000; pointer-events: none; display: none;';
        label.textContent = 'Press SPACE to capture';

        document.body.append(overlay, indicator, label);
        return { overlay, indicator, label };
    }

    function findElementAtPoint(x, y) {
        const iframes = document.querySelectorAll('iframe');

        for (const iframe of iframes) {
            try {
                const rect = iframe.getBoundingClientRect();
                if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const element = iframeDoc.elementFromPoint(x - rect.left, y - rect.top);
                    if (element) return { element, iframe, rect };
                }
            } catch (e) { /* Can't access iframe */ }
        }

        const element = document.elementFromPoint(x, y);
        return element ? { element, iframe: null, rect: element.getBoundingClientRect() } : null;
    }

    function updateIndicatorPosition(indicator, label, { element, rect, iframe }) {
        const elemRect = element.getBoundingClientRect();
        const left = iframe ? rect.left + elemRect.left : elemRect.left;
        const top = iframe ? rect.top + elemRect.top : elemRect.top;

        indicator.style.cssText += `display: block; left: ${left}px; top: ${top}px; width: ${elemRect.width}px; height: ${elemRect.height}px;`;
        label.style.cssText += `display: block; left: ${left}px; top: ${top - 25}px;`;
        label.textContent = `${element.tagName} - Press SPACE`;
    }

    function captureScrollElement(element, iframe) {
        const scrollableElements = findScrollableParents(element);

        console.log('🔍 FOUND SCROLLABLE ELEMENTS:', scrollableElements.length);
        scrollableElements.forEach((info, i) => {
            console.log(`  [${i}] ${info.tag}${info.id ? '#' + info.id : ''}${info.classes ? '.' + info.classes.split(' ')[0] : ''}`);
            console.log(`      Scroll: ${info.scrollTop} / ${info.scrollHeight - info.clientHeight}`);
        });

        if (scrollableElements.length > 0) {
            const scrollable = scrollableElements[0];
            state.targetScrollElement = scrollable.element;
            state.targetIframe = iframe;
            console.log('✅ CAPTURED SCROLL ELEMENT:', scrollable.element);
            alert(`✅ Captured: ${scrollable.tag}${scrollable.id ? '#' + scrollable.id : ''}\nScroll range: 0-${scrollable.scrollHeight - scrollable.clientHeight}px`);
        } else {
            console.warn('⚠️ No scrollable element found!');
            alert('⚠️ No scrollable element found at this location');
        }
    }

    function findScrollableParents(element) {
        const scrollableElements = [];
        let current = element;

        while (current) {
            const hasVerticalScroll = current.scrollHeight > current.clientHeight;
            const style = window.getComputedStyle(current);
            const hasOverflow = style.overflowY !== 'visible' && style.overflowY !== 'hidden';

            if (hasVerticalScroll && hasOverflow) {
                scrollableElements.push({
                    element: current,
                    scrollHeight: current.scrollHeight,
                    clientHeight: current.clientHeight,
                    scrollTop: current.scrollTop,
                    tag: current.tagName,
                    classes: current.className,
                    id: current.id
                });
            }
            current = current.parentElement;
        }

        return scrollableElements;
    }

    // ==================== SCROLL FUNCTIONS ====================
    function scrollIframeToBottom(iframe) {
        try {
            if (state.targetScrollElement && state.targetIframe === iframe) {
                const maxScroll = state.targetScrollElement.scrollHeight - state.targetScrollElement.clientHeight;
                state.targetScrollElement.scrollTop = maxScroll;
                state.totalScrolls++;
                console.log(`  ✓ Scrolled targeted element to: ${state.targetScrollElement.scrollTop} (max: ${maxScroll})`);
                return true;
            }

            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const iframeWin = iframe.contentWindow;

            if (iframeWin && iframeDoc) {
                const scrollHeight = iframeDoc.documentElement.scrollHeight;
                iframeWin.scrollTo({ top: scrollHeight, behavior: 'smooth' });
                state.totalScrolls++;
                console.log(`  ⬇️  Scrolled iframe to bottom`);
                return true;
            }
        } catch (e) {
            console.log(`  ❌ Cannot access iframe: ${e.message}`);
        }
        return false;
    }

    // ==================== BUTTON FINDER ====================
    function findAndClickButton() {
        try {
            const foundButtons = [];
            const iframes = document.querySelectorAll('iframe');
            const autoClickEnabled = document.getElementById('auto-click-checkbox').checked;
            const scrollIntoViewEnabled = document.getElementById('scroll-into-view-checkbox').checked;

            iframes.forEach((iframe) => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const buttons = iframeDoc.querySelectorAll('button');

                    buttons.forEach(button => {
                        const text = (button.textContent || '').trim();
                        const className = button.className?.toString() || '';

                        if (text.toLowerCase().includes('accept') &&
                            (className.includes('hover:bg-ide-button-hover') || className.includes('bg-ide-button-bac')) &&
                            button.offsetWidth > 0 && button.offsetHeight > 0 && !button.disabled) {
                            foundButtons.push({ button, iframe });
                        }
                    });
                } catch (e) { /* Can't access iframe */ }
            });

            updateUI(foundButtons.length);
            logScanResults(iframes.length, foundButtons.length);

            if (autoClickEnabled && foundButtons.length > 0) {
                clickButtons(foundButtons, scrollIntoViewEnabled);
            }
        } catch (error) {
            console.error('❗ Error:', error);
        }
    }

    function clickButtons(buttons, scrollIntoView) {
        buttons.forEach(({ button }, index) => {
            if (scrollIntoView) {
                button.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                setTimeout(() => {
                    console.log(`  🖱️  Clicking button ${index + 1}`);
                    button.click();
                    state.totalClicks++;
                    document.getElementById('click-count').textContent = state.totalClicks;
                }, 300);
            } else {
                console.log(`  🖱️  Clicking button ${index + 1}`);
                button.click();
                state.totalClicks++;
                document.getElementById('click-count').textContent = state.totalClicks;
            }
        });
    }

    function updateUI(buttonCount) {
        const scrollStatus = document.getElementById('scroll-status');
        if (scrollStatus) {
            scrollStatus.textContent = state.totalScrolls;
        }
    }

    function logScanResults(iframeCount, buttonCount) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Scanned ${iframeCount} iframe(s) | Found ${buttonCount} button(s) | Total scrolls: ${state.totalScrolls}`);
    }

    // ==================== INITIALIZATION ====================
    cleanup();

    const ui = createUI();
    state.ui = ui;
    window.autoClickerUI = ui;

    console.log('✅ AUTO-CLICKER ACTIVE');
    console.log('🔍 Searching for "Accept" buttons in iframes');
    console.log('📊 Scanning every 3 seconds');
    console.log('☑️  Check the box to enable auto-clicking');
    console.log('═'.repeat(80));

    findAndClickButton();
    state.interval = setInterval(findAndClickButton, 3000);
    window.autoClickerInterval = state.interval;

})();