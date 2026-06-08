const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync('detailed_broken_links.json', 'utf8'));
const brokenExternal = report.brokenExternal;

// Known manual fixes for books/citations
const urlCorrections = {
    'https://www.oreilly.com/library/view/learning-spark-2nd/9781491933015/': 'https://www.oreilly.com/library/view/learning-spark-2nd/9781492050032/',
    'https://www.oreilly.com/library/view/learning-azure-synapse/9781098105303/': 'https://www.oreilly.com/library/view/learning-azure-synapse/9781098127688/',
    'https://www.oreilly.com/library/view/hadoop-the-definitive/9781491901625/': 'https://www.oreilly.com/library/view/hadoop-the-definitive/9781491901687/'
};

let correctedCount = 0;
let removedCount = 0;
let skippedCount = 0;

// Group by file to minimize writes
const fileChanges = {};

brokenExternal.forEach(item => {
    const { file, url, text, status } = item;
    
    // Determine the action
    let action = 'skip';
    let newUrl = null;
    
    if (urlCorrections[url]) {
        action = 'correct';
        newUrl = urlCorrections[url];
    } else if (status === 404 || status === 401 || status === 410) {
        action = 'remove';
    } else {
        // Skip 403, 406, or fetch failed/timeouts which are often anti-bot/transient false positives
        action = 'skip';
    }
    
    if (action !== 'skip') {
        if (!fileChanges[file]) {
            fileChanges[file] = [];
        }
        fileChanges[file].push({ url, text, action, newUrl });
    } else {
        skippedCount++;
    }
});

// Perform the fixes in markdown files
Object.entries(fileChanges).forEach(([relPath, changes]) => {
    const fullPath = path.join(__dirname, relPath);
    if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${fullPath}`);
        return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    changes.forEach(change => {
        const { url, text, action, newUrl } = change;
        
        // Escape URL and text for regex
        const escapedUrl = url.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const escapedText = text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        
        // Regex to match [text](url) or <a href="url">text</a>
        const mdRegex = new RegExp(`\\[(${escapedText}|[^\\]]+)\\]\\(${escapedUrl}\\)`, 'g');
        const htmlRegex = new RegExp(`<a\\s+[^>]*href=["']${escapedUrl}["'][^>]*>(.*?)<\/a>`, 'g');
        
        if (action === 'correct') {
            // Replace with correct URL
            content = content.replace(mdRegex, `[$1](${newUrl})`);
            content = content.replace(htmlRegex, (match, p1) => {
                return match.replace(url, newUrl);
            });
            console.log(`[CORRECT] In ${relPath}: ${url} -> ${newUrl}`);
            correctedCount++;
        } else if (action === 'remove') {
            // Replace with plain text (removing link)
            content = content.replace(mdRegex, '$1');
            content = content.replace(htmlRegex, '$1');
            console.log(`[REMOVE LINK] In ${relPath}: Removed link from "${text}" (${url})`);
            removedCount++;
        }
    });
    
    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
    }
});

console.log('\n=== Fix Summary ===');
console.log(`Links corrected with updated URLs: ${correctedCount}`);
console.log(`Dead links removed (converted to plain text): ${removedCount}`);
console.log(`Links skipped (likely false positives or transient): ${skippedCount}`);
