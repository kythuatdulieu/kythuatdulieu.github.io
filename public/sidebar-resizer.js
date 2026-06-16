function initLeftSidebarResizer() {
  const sidebar = document.querySelector('.sidebar-pane') || document.querySelector('sl-sidebar');
  if (!sidebar || sidebar.querySelector('.left-resizer')) return;

  const resizer = document.createElement('div');
  resizer.className = 'left-resizer';
  resizer.style.position = 'absolute';
  resizer.style.top = '0';
  resizer.style.right = '-2px';
  resizer.style.width = '6px';
  resizer.style.height = '100%';
  resizer.style.cursor = 'col-resize';
  resizer.style.zIndex = '999';
  resizer.style.backgroundColor = 'transparent';
  resizer.style.transition = 'background-color 0.2s';
  
  resizer.addEventListener('mouseenter', () => {
    resizer.style.backgroundColor = 'var(--sl-color-accent)';
  });
  resizer.addEventListener('mouseleave', () => {
    resizer.style.backgroundColor = 'transparent';
  });

  const computedPosition = window.getComputedStyle(sidebar).position;
  if (computedPosition === 'static') {
    sidebar.style.position = 'relative';
  }
  sidebar.appendChild(resizer);

  let isResizing = false;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const newWidth = e.clientX;
    const maxAllowedWidth = Math.min(600, window.innerWidth * 0.4);
    if (newWidth > 200 && newWidth < maxAllowedWidth) {
      document.documentElement.style.setProperty('--sl-sidebar-width', `${newWidth}px`);
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      const finalWidth = document.documentElement.style.getPropertyValue('--sl-sidebar-width');
      if (finalWidth) {
        localStorage.setItem('sidebarWidth', finalWidth);
      }
    }
  });

  const savedWidth = localStorage.getItem('sidebarWidth');
  if (savedWidth) {
    const parsedWidth = parseInt(savedWidth, 10);
    const maxAllowedWidth = Math.min(600, window.innerWidth * 0.4);
    
    if (!isNaN(parsedWidth) && parsedWidth >= 200 && parsedWidth <= maxAllowedWidth) {
      document.documentElement.style.setProperty('--sl-sidebar-width', `${parsedWidth}px`);
    } else {
      localStorage.removeItem('sidebarWidth');
    }
  }
}

function initRightSidebarResizer() {
  const rightSidebarContainer = document.querySelector('.right-sidebar-container');
  if (!rightSidebarContainer || rightSidebarContainer.querySelector('.right-resizer')) return;

  const resizer = document.createElement('div');
  resizer.className = 'right-resizer';
  resizer.style.position = 'absolute';
  resizer.style.top = '0';
  resizer.style.left = '-2px';
  resizer.style.width = '6px';
  resizer.style.height = '100%';
  resizer.style.cursor = 'col-resize';
  resizer.style.zIndex = '999';
  resizer.style.backgroundColor = 'transparent';
  resizer.style.transition = 'background-color 0.2s';
  
  resizer.addEventListener('mouseenter', () => {
    resizer.style.backgroundColor = 'var(--sl-color-accent)';
  });
  resizer.addEventListener('mouseleave', () => {
    resizer.style.backgroundColor = 'transparent';
  });

  if (!document.getElementById('right-sidebar-resizer-style')) {
    const style = document.createElement('style');
    style.id = 'right-sidebar-resizer-style';
    style.textContent = `
      @media (min-width: 72rem) {
        .right-sidebar-container {
          width: var(--custom-right-sidebar-width, calc(var(--sl-sidebar-width) + (100% - var(--sl-content-width) - var(--sl-sidebar-width)) / 2)) !important;
        }
        :global([data-has-sidebar][data-has-toc]) .main-pane {
          width: calc(100% - var(--custom-right-sidebar-width, calc(var(--sl-sidebar-width) + (100% - var(--sl-content-width) - var(--sl-sidebar-width)) / 2))) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  rightSidebarContainer.appendChild(resizer);

  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = rightSidebarContainer.getBoundingClientRect().width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    // Moving left increases width, moving right decreases width
    const delta = startX - e.clientX;
    const newWidth = startWidth + delta;
    
    if (newWidth > 150 && newWidth < 500) {
      document.documentElement.style.setProperty('--custom-right-sidebar-width', `${newWidth}px`);
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      const finalWidth = document.documentElement.style.getPropertyValue('--custom-right-sidebar-width');
      if (finalWidth) {
        localStorage.setItem('rightSidebarWidth', finalWidth);
      }
    }
  });

  const savedWidth = localStorage.getItem('rightSidebarWidth');
  if (savedWidth) {
    const parsedWidth = parseInt(savedWidth, 10);
    if (!isNaN(parsedWidth) && parsedWidth >= 150 && parsedWidth <= 500) {
      document.documentElement.style.setProperty('--custom-right-sidebar-width', `${parsedWidth}px`);
    } else {
      localStorage.removeItem('rightSidebarWidth');
    }
  }
}

function initSidebarScrollRestoration() {
  const sidebar = document.getElementById('starlight__sidebar') || document.querySelector('.sidebar-pane');
  if (!sidebar) return;

  const SCROLL_KEY = 'starlight-sidebar-scroll-y';

  const savedScroll = sessionStorage.getItem(SCROLL_KEY);
  if (savedScroll !== null) {
    sidebar.scrollTop = parseInt(savedScroll, 10);
  } else {
    const activeLink = sidebar.querySelector('a[aria-current="page"]');
    if (activeLink) {
      activeLink.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }

  let timeout;
  sidebar.addEventListener('scroll', () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      sessionStorage.setItem(SCROLL_KEY, sidebar.scrollTop.toString());
    }, 100);
  }, { passive: true });
}

function initAllResizers() {
  if (window.innerWidth >= 1024) {
    initLeftSidebarResizer();
    initRightSidebarResizer();
  }
  initSidebarScrollRestoration();
}

document.addEventListener('DOMContentLoaded', initAllResizers);
document.addEventListener('astro:page-load', initAllResizers);
window.addEventListener('beforeunload', () => {
  const sidebar = document.getElementById('starlight__sidebar') || document.querySelector('.sidebar-pane');
  if (sidebar) {
    sessionStorage.setItem('starlight-sidebar-scroll-y', sidebar.scrollTop.toString());
  }
});
