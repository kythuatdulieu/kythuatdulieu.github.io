import { visit } from 'unist-util-visit';

export function remarkMermaid() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang === 'mermaid') {
        node.type = 'html';
        node.value = `<div class="mermaid-container" style="width: 100%; overflow-x: auto; margin: 2rem 0; padding: 1.5rem; background-color: var(--sl-color-bg-nav); border-radius: 0.5rem; text-align: center; border: 1px solid var(--sl-color-hairline);">
          <div class="mermaid">${escapeHtml(node.value)}</div>
        </div>`;
      }
    });
  };
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
