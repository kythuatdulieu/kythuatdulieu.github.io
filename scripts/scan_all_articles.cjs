const fs = require('fs');
const path = require('path');
const { evaluateFile } = require('./evaluate_article.cjs');

function getFiles(dir, files = []) {
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files);
        } else if (name.endsWith('.md') || name.endsWith('.mdx')) {
            files.push(name);
        }
    }
    return files;
}

function scan() {
    const conceptsDir = path.join(__dirname, '..', 'src', 'content', 'docs', 'concepts');
    if (!fs.existsSync(conceptsDir)) {
        console.error("Concepts directory not found:", conceptsDir);
        process.exit(1);
    }

    const files = getFiles(conceptsDir);
    console.log(`Scanning ${files.length} articles...\n`);

    const failed = [];
    let passedCount = 0;

    files.forEach(file => {
        const result = evaluateFile(file);
        if (result) {
            const relPath = path.relative(path.join(__dirname, '..'), file);
            if (result.score === 100) {
                passedCount++;
            } else {
                failed.push({
                    file: relPath,
                    filename: result.filename,
                    score: result.score,
                    wordCount: result.wordCount,
                    reports: result.reports.filter(r => !r.passed)
                });
            }
        }
    });

    console.log(`========================================`);
    console.log(`Scan Summary:`);
    console.log(`Total files: ${files.length}`);
    console.log(`Passed (100/100): ${passedCount}`);
    console.log(`Failed (< 100/100): ${failed.length}`);
    console.log(`========================================\n`);

    if (failed.length > 0) {
        // Group by directory category
        const categories = {};
        failed.forEach(item => {
            const parts = item.file.split(path.sep);
            // parts is like ['src', 'content', 'docs', 'concepts', 'category', 'file.md']
            const cat = parts[4] || 'unknown';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(item);
        });

        Object.keys(categories).forEach(cat => {
            console.log(`Category: [${cat}] (${categories[cat].length} files)`);
            categories[cat].forEach(item => {
                console.log(`  - ${item.filename} (Score: ${item.score}/100, Words: ${item.wordCount})`);
                item.reports.forEach(r => {
                    console.log(`    * [${r.section}] ${r.message}`);
                });
            });
            console.log();
        });

        // Write scan results to file
        fs.writeFileSync(
            path.join(__dirname, '..', 'public', 'scan_results.json'),
            JSON.stringify({ total: files.length, passed: passedCount, failed: failed.length, details: failed }, null, 2),
            'utf8'
        );
    } else {
        console.log("🎉 Outstanding! All articles score 100/100!");
    }
}

scan();
