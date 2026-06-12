import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsDir = path.resolve(__dirname, '../src/content/docs');

const pathMappings = {
  'foundation': '1-foundations/foundation',
  'system-architecture': '1-foundations/system-architecture',
  'database-storage': '2-storage/database-storage',
  'data-lake-lakehouse': '2-storage/data-lake-lakehouse',
  'cloud-data-platform': '2-storage/cloud-data-platform',
  'data-warehouse': '2-storage/data-warehouse',
  'etl-elt': '3-integration/etl-elt',
  'transformation-analytics': '3-integration/transformation-analytics',
  'orchestration': '3-integration/orchestration',
  'batch-processing': '3-integration/batch-processing',
  'streaming-processing': '4-realtime/streaming-processing',
  'data-quality': '5-quality-governance/data-quality',
  'governance-metadata': '5-quality-governance/governance-metadata',
  'observability-reliability': '5-quality-governance/observability-reliability',
  'genai-ml': '6-ai-ml/genai-ml'
};

const categories = Object.keys(pathMappings);
const regexPattern = new RegExp(`\\/concepts\\/(${categories.join('|')})\\b`, 'g');

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, callback);
    } else if (stat.isFile() && (file.endsWith('.md') || file.endsWith('.mdx'))) {
      callback(filepath);
    }
  }
}

let updatedCount = 0;
let totalMatches = 0;

walk(docsDir, (filepath) => {
  const content = fs.readFileSync(filepath, 'utf8');
  let matchFound = false;
  
  const newContent = content.replace(regexPattern, (match, cat) => {
    const replacement = `/concepts/${pathMappings[cat]}`;
    totalMatches++;
    matchFound = true;
    return replacement;
  });
  
  if (matchFound) {
    fs.writeFileSync(filepath, newContent, 'utf8');
    updatedCount++;
    console.log(`Updated links in: ${path.relative(docsDir, filepath)}`);
  }
});

console.log(`\nLink rewriting complete!`);
console.log(`Updated ${updatedCount} files.`);
console.log(`Total link occurrences rewritten: ${totalMatches}`);
