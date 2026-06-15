const fs = require('fs');

function insertImage(file, slug) {
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let newLines = [];
  let frontmatterEnd = false;
  let inserted = false;
  for(let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);
    if (i > 0 && lines[i] === '---' && !frontmatterEnd) {
      frontmatterEnd = true;
      continue;
    }
    if (frontmatterEnd && !inserted && lines[i].trim() !== '') {
        // Insert right before the first header or paragraph
        newLines.splice(newLines.length - 1, 0, `![Kiến trúc chính thức](/images/${slug}/architecture.png)\n`);
        inserted = true;
    }
  }
  fs.writeFileSync(file, newLines.join('\n'), 'utf8');
  console.log(`Inserted in ${file}`);
}

insertImage("src/content/docs/concepts/3-integration/orchestration/apache-airflow.md", "apache-airflow");
insertImage("src/content/docs/concepts/1-foundations/system-architecture/data-mesh.md", "data-mesh");

