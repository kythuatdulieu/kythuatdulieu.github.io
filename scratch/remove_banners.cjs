const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../src/content/docs');

function getAllMdFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllMdFiles(filePath, fileList);
    } else if (filePath.endsWith('.md') || filePath.endsWith('.mdx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = getAllMdFiles(docsDir);

let filesModified = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // The regex to match the banner. It might have slight variations (with or without the second sentence).
  const bannerRegex = /> 🚧 \*\*Bản thảo Đang được Nâng cấp\*\*[\s\n]*>[\s\n]*> Bài viết này đang được tự động viết lại theo chuẩn Kỹ sư Dữ liệu \(Senior DE V5.0\) bởi hệ thống Agent\.( Toàn bộ nội dung cũ đã được xoá bỏ để đảm bảo tính MECE và chuyên sâu\.)?[\s\n]*/gm;
  
  if (bannerRegex.test(content)) {
    content = content.replace(bannerRegex, '');
    fs.writeFileSync(file, content, 'utf-8');
    filesModified++;
  }
}

console.log(`Removed the banner from ${filesModified} files.`);
