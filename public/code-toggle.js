function initCodeToggle() {
    // Wait briefly to ensure Expressive Code DOM is fully hydrated
    setTimeout(() => {
        const codeBlocks = document.querySelectorAll('.expressive-code');
        codeBlocks.forEach(block => {
            // Prevent adding multiple buttons if already initialized
            if (block.previousElementSibling && block.previousElementSibling.classList.contains('code-toggle-btn')) {
                return;
            }

            // Find the code content
            const codeContent = block.querySelector('pre code');
            if (!codeContent) return;
            
            const lines = codeContent.textContent.split('\n').length;
            
            // Only add toggle for multi-line code blocks
            if (lines > 2) {
                // Default to collapsed state
                block.classList.add('code-collapsed');
                
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'code-toggle-btn';
                toggleBtn.innerHTML = '👁️ Hiển thị Code';
                
                // Toggle Logic
                toggleBtn.addEventListener('click', () => {
                    block.classList.toggle('code-collapsed');
                    if (block.classList.contains('code-collapsed')) {
                        toggleBtn.innerHTML = '👁️ Hiển thị Code';
                    } else {
                        toggleBtn.innerHTML = '🔽 Thu gọn Code';
                    }
                });
                
                // Insert button right before the code block container
                block.parentNode.insertBefore(toggleBtn, block);
            }
        });
    }, 200);
}

document.addEventListener('DOMContentLoaded', initCodeToggle);
document.addEventListener('astro:page-load', initCodeToggle);
