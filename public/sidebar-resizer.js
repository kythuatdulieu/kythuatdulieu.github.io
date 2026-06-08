document.addEventListener('DOMContentLoaded', () => {
  // Only apply on desktop where sidebar is visible as a pane
  if (window.innerWidth < 1024) return;

  const sidebar = document.querySelector('.sidebar-pane') || document.querySelector('sl-sidebar');
  if (!sidebar) return;

  const resizer = document.createElement('div');
  resizer.style.position = 'absolute';
  resizer.style.top = '0';
  resizer.style.right = '-2px';
  resizer.style.width = '5px';
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

  // Starlight uses a specific DOM structure. The sidebar is inside a grid.
  // We attach the resizer to the sidebar pane.
  sidebar.style.position = 'relative';
  sidebar.appendChild(resizer);

  let isResizing = false;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    // Calculate new width
    // e.clientX is the mouse position. The sidebar starts from the left edge (0).
    const newWidth = e.clientX;
    
    // Set boundaries (e.g. between 200px and 500px)
    if (newWidth > 200 && newWidth < 600) {
      document.documentElement.style.setProperty('--sl-sidebar-width', `${newWidth}px`);
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Save user preference
      const finalWidth = document.documentElement.style.getPropertyValue('--sl-sidebar-width');
      if (finalWidth) {
        localStorage.setItem('sidebarWidth', finalWidth);
      }
    }
  });

  // Restore saved width
  const savedWidth = localStorage.getItem('sidebarWidth');
  if (savedWidth) {
    document.documentElement.style.setProperty('--sl-sidebar-width', savedWidth);
  }
});
