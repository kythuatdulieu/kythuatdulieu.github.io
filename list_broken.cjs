const fs = require('fs');

const report = JSON.parse(fs.readFileSync('detailed_broken_links.json', 'utf8'));
const brokenExternal = report.brokenExternal;

const groups = {};
brokenExternal.forEach(item => {
    if (!groups[item.url]) {
        groups[item.url] = {
            text: item.text,
            count: 0,
            status: item.status,
            error: item.error,
            occurrences: []
        };
    }
    groups[item.url].count++;
    groups[item.url].occurrences.push({ file: item.file, line: item.line });
});

const sorted = Object.entries(groups).sort((a, b) => b[1].count - a[1].count);

console.log(`=== Unique Broken External Links (${sorted.length}) ===`);
sorted.forEach(([url, data]) => {
    console.log(`\nURL: ${url}`);
    console.log(`Text: "${data.text}" | Count: ${data.count} | Status: ${data.status} | Error: ${data.error}`);
    console.log(`Occurrences in files:`);
    data.occurrences.forEach(occ => {
        console.log(`  - ${occ.file}:${occ.line}`);
    });
});
