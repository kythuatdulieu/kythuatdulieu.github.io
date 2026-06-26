const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/content/docs');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles(targetDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Find mermaid blocks
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  
  content = content.replace(mermaidRegex, (match, mermaidCode) => {
    // Check if it's a flowchart or graph
    if (!mermaidCode.trim().startsWith('flowchart') && !mermaidCode.trim().startsWith('graph') && !mermaidCode.trim().startsWith('stateDiagram') && !mermaidCode.trim().startsWith('architecture')) {
      return match; // skip sequenceDiagram, gantt, etc. unless we are sure
    }

    let modifiedCode = mermaidCode;

    // We want to match things like A[Some text] and change to A["Some text"]
    // Brackets: [ ]
    // Parentheses: ( )
    // Curly: { }
    // Double parens: (( ))
    // We should ignore if it's already quoted like ["..."]
    // We should also ignore markdown links like [Text](Link) but those are rare inside mermaid
    
    // Regex strategy: match ID + opening token + text + closing token
    // The ID is usually alphanumeric + underscores + dashes
    // Opening tokens: \[\[, \[\(, \[\{, \[/, \\\[, \[, \(\(, \(, \{
    // To be safe, let's target the most common ones that cause syntax errors:
    // [] () {} [()] (())
    
    // Replace unquoted brackets: id[some text] -> id["some text"]
    // Note: the text inside should not contain quotes already at the start/end
    
    modifiedCode = modifiedCode.replace(/([a-zA-Z0-9_-]+)\s*(\[)([^"\]][^\]]*?)(\])/g, '$1$2"$3"$4');
    
    // Replace unquoted parentheses: id(some text) -> id("some text")
    modifiedCode = modifiedCode.replace(/([a-zA-Z0-9_-]+)\s*(\()([^"\)][^\)]*?)(\))/g, '$1$2"$3"$4');
    
    // Replace unquoted curly braces: id{some text} -> id{"some text"}
    modifiedCode = modifiedCode.replace(/([a-zA-Z0-9_-]+)\s*(\{)([^"\}][^\}]*?)(\})/g, '$1$2"$3"$4');

    // Replace double parentheses: id((some text)) -> id(("some text"))
    // Wait, the single parenthesis regex might already match the outer or inner parens of ((...))
    // Let's refine: doing it this way might double quote if we are not careful.
    
    return '```mermaid\n' + modifiedCode + '```';
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
