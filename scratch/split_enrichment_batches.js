const fs = require('fs');
const path = require('path');

const lines = fs.readFileSync(path.join(__dirname, 'needs_enrichment.txt'), 'utf-8').trim().split('\n');
const BATCH_SIZE = 15;
let batchNum = 1;

for (let i = 0; i < lines.length; i += BATCH_SIZE) {
  const chunk = lines.slice(i, i + BATCH_SIZE);
  fs.writeFileSync(path.join(__dirname, `enrichment_batch_${batchNum}.txt`), chunk.join('\n'));
  batchNum++;
}

console.log(`Created ${batchNum - 1} batches for enrichment.`);
