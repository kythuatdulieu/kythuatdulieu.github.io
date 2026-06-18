import fs from 'fs';
import path from 'path';
import { findAndReplace } from 'mdast-util-find-and-replace';

export function remarkAutoLink() {
    let dictionary = null;
    let sortedKeys = [];

    // Load dictionary on plugin initialization
    try {
        const conceptsPath = path.join(process.cwd(), 'public', 'concepts.json');
        if (fs.existsSync(conceptsPath)) {
            const data = JSON.parse(fs.readFileSync(conceptsPath, 'utf8'));
            dictionary = data.concepts;
            
            // Sort keys by length descending to match longest phrases first (e.g., "Data Engineer" before "Data")
            sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
        }
    } catch (e) {
        console.warn('remark-auto-link: Could not load concepts.json', e);
    }

    return (tree, file) => {
        if (!dictionary || sortedKeys.length === 0) return;

        // Ensure we don't link terms to their own articles!
        // We can check the VFile path
        let currentUrlPath = null;
        if (file.history && file.history.length > 0) {
            const filePath = file.history[file.history.length - 1];
            const relPath = path.relative(path.join(process.cwd(), 'src', 'content', 'docs'), filePath);
            currentUrlPath = '/' + relPath.replace(/\.mdx?$/, '/').replace(/\\/g, '/');
            if (currentUrlPath.endsWith('index/')) {
                currentUrlPath = currentUrlPath.replace('index/', '');
            }
        }

        // Track which terms have already been replaced in this file to enforce "First Occurrence Only"
        const replacedTerms = new Set();

        const replaceList = [];

        for (const key of sortedKeys) {
            const concept = dictionary[key];
            if (!concept || !concept.url) continue;
            
            // Skip linking to the same page
            if (currentUrlPath && currentUrlPath === concept.url) continue;

            const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            // Regex to match whole words, case-insensitive
            // Since JS regex doesn't easily support full unicode word boundaries \b for Vietnamese,
            // we use negative lookbehind/lookahead if available, or boundary checks.
            const regex = new RegExp(`(?<=^|[^\\p{L}\\p{N}_])(${escapedKey})(?=[^\\p{L}\\p{N}_]|$)`, 'gui');

            replaceList.push([
                regex,
                (match) => {
                    // Normalize the matched text to compare against our set
                    const normalizedMatch = key.toLowerCase();

                    // If we've already replaced this term in this document, return false to ignore
                    if (replacedTerms.has(normalizedMatch)) {
                        return false; 
                    }

                    // Otherwise, mark it as replaced and create the link node
                    replacedTerms.add(normalizedMatch);
                    return {
                        type: 'link',
                        url: concept.url,
                        children: [{ type: 'text', value: match }]
                    };
                }
            ]);
        }

        if (replaceList.length > 0) {
            findAndReplace(tree, replaceList);
        }
    };
}
