import fs from 'fs';
import path from 'path';

const DIR = '/home/duclinh/kythuatdulieu.github.io/src/content/docs/learning-paths';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));

for (const file of files) {
  const filePath = path.join(DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip Interview QA
  content = content.replace(/##\s+Trọng tâm ôn luyện phỏng vấn[\s\S]*?(?=##|$)/gi, '');

  // Add Roadmap if missing
  if (!/##\s+Roadmap|##\s+Lộ\s+trình/i.test(content)) {
    // Replace something like "## Hành trình..." or "## Lộ trình..." with "## Lộ trình (Roadmap)"
    content = content.replace(/##\s+(Hành trình|Lộ trình)[^\n]*/i, '## Lộ trình (Roadmap)');
  }
  
  // If it still doesn't have it, prepend to the first Steps section
  if (!/##\s+Roadmap|##\s+Lộ\s+trình/i.test(content)) {
     content = content.replace(/(###\s+Bước\s+1)/i, '## Lộ trình (Roadmap)\n\n$1');
  }

  // Add Milestones if missing
  if (!/##\s+Milestones|##\s+Các\s+cột\s+mốc/i.test(content)) {
    // Insert before the first "### Bước" or "### Milestone"
    content = content.replace(/(###\s+Bước\s+1)/i, '## Các cột mốc (Milestones)\n\n$1');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed formatting for ${file}`);
}
