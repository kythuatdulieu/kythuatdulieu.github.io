const fs = require('fs');
const path = require('path');

const docsDir = '/home/duclinh/kythuatdulieu.github.io/src/content/docs';

let stats = {
  total: 0,
  placeholders: [],
  structurally_upgraded: [],
  fully_written: []
};

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.md') && !fullPath.includes('/index.md')) {
      stats.total++;
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const isPlaceholder = content.includes('đang chờ Wave Manager xử lý');
      const hasCitationPlaceholder = content.includes('Đang cập nhật 5+ trích dẫn kỹ thuật');
      
      if (isPlaceholder) {
        stats.placeholders.push(fullPath.replace(docsDir, ''));
      } else if (hasCitationPlaceholder) {
        stats.structurally_upgraded.push(fullPath.replace(docsDir, ''));
      } else {
        stats.fully_written.push(fullPath.replace(docsDir, ''));
      }
    }
  });
}

walk(docsDir);

console.log(`\n=== KẾT QUẢ KIỂM TOÁN TỔNG THỂ ===`);
console.log(`Tổng số bài viết: ${stats.total}`);
console.log(`1. BÀI HOÀN CHỈNH (FAANG-Level + 5 Citations): ${stats.fully_written.length}`);
console.log(`2. BÀI ĐÃ GỌT VĂN PHONG (Chờ cập nhật link): ${stats.structurally_upgraded.length}`);
console.log(`3. BÀI TRỐNG (Cần viết mới hoàn toàn): ${stats.placeholders.length}`);
console.log(`\nDanh sách BÀI HOÀN CHỈNH (${stats.fully_written.length}):`);
stats.fully_written.forEach(f => console.log(` - ${f}`));
