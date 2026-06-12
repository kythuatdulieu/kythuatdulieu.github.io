const fs = require('fs');
const path = require('path');

function evaluateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File does not exist: ${filePath}`);
        return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);
    
    let score = 0;
    const reports = [];

    // 1. Frontmatter parsing
    const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!fmMatch) {
        reports.push({ section: "Frontmatter", passed: false, score: 0, max: 30, message: "Missing frontmatter block (---)" });
    } else {
        const fmText = fmMatch[1];
        const fm = {};
        fmText.split('\n').forEach(line => {
            line = line.trim();
            if (!line || !line.includes(':')) return;
            const idx = line.indexOf(':');
            const k = line.slice(0, idx).trim();
            const v = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
            fm[k] = v;
        });

        let fmScore = 0;
        const fmChecks = [
            { key: 'title', weight: 3, msg: "Title is required in frontmatter" },
            { key: 'category', weight: 3, msg: "Category is required in frontmatter" },
            { key: 'difficulty', weight: 3, msg: "Difficulty is required in frontmatter" },
            { key: 'tags', weight: 2, msg: "Tags are required in frontmatter" },
            { key: 'readingTime', weight: 2, msg: "readingTime is required in frontmatter" },
            { key: 'lastUpdated', weight: 2, msg: "lastUpdated is required in frontmatter" },
        ];

        fmChecks.forEach(check => {
            if (fm[check.key]) {
                fmScore += check.weight;
            } else {
                reports.push({ section: "Frontmatter", passed: false, score: 0, max: check.weight, message: check.msg });
            }
        });

        // SEO Title (40-70 chars)
        if (fm.seoTitle) {
            const len = fm.seoTitle.length;
            if (len >= 40 && len <= 70) {
                fmScore += 5;
            } else {
                reports.push({ section: "SEO", passed: false, score: 2, max: 5, message: `seoTitle length is ${len} (recommended: 40-70 chars)` });
                fmScore += 2;
            }
        } else {
            reports.push({ section: "SEO", passed: false, score: 0, max: 5, message: "Missing seoTitle in frontmatter" });
        }

        // Meta Description (100-160 chars)
        if (fm.metaDescription) {
            const len = fm.metaDescription.length;
            if (len >= 100 && len <= 160) {
                fmScore += 5;
            } else {
                reports.push({ section: "SEO", passed: false, score: 2, max: 5, message: `metaDescription length is ${len} (recommended: 100-160 chars)` });
                fmScore += 2;
            }
        } else {
            reports.push({ section: "SEO", passed: false, score: 0, max: 5, message: "Missing metaDescription in frontmatter" });
        }

        // Definition (for Popovers: 50-300 chars)
        if (fm.definition) {
            const len = fm.definition.length;
            if (len >= 50 && len <= 300) {
                fmScore += 5;
            } else {
                reports.push({ section: "Popover", passed: false, score: 2, max: 5, message: `definition length is ${len} (recommended: 50-300 chars)` });
                fmScore += 2;
            }
        } else {
            reports.push({ section: "Popover", passed: false, score: 0, max: 5, message: "Missing definition in frontmatter (critical for popover preview)" });
        }

        score += fmScore;
        reports.push({ section: "Frontmatter & SEO Summary", passed: fmScore >= 25, score: fmScore, max: 30, message: `Frontmatter scoring: ${fmScore}/30` });
    }

    // Body validation
    const body = content.replace(/^---[\s\S]*?---/, '');

    // 2. Word Count (Vietnamese text, standard whitespace split)
    const words = body.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    let wordScore = 0;
    if (wordCount >= 1200) {
        wordScore = 20;
    } else if (wordCount >= 800) {
        wordScore = 12;
        reports.push({ section: "Content Length", passed: false, score: 12, max: 20, message: `Word count is ${wordCount} (recommended: >= 1200 for deep knowledge)` });
    } else {
        reports.push({ section: "Content Length", passed: false, score: 5, max: 20, message: `Word count is ${wordCount} (too short: >= 1200 recommended)` });
        wordScore = 5;
    }
    score += wordScore;

    // 3. Mermaid diagram
    const hasMermaid = body.includes('```mermaid');
    let mermaidScore = hasMermaid ? 10 : 0;
    score += mermaidScore;
    if (!hasMermaid) {
        reports.push({ section: "Visuals", passed: false, score: 0, max: 10, message: "Missing architectural flow diagram (```mermaid block)" });
    }

    // 4. External References
    // Must contain a References section with at least 5 external links from authority domains
    const refSectionIndex = body.indexOf('## Tài liệu tham khảo') !== -1 ? body.indexOf('## Tài liệu tham khảo') : body.indexOf('## References');
    let refScore = 0;
    if (refSectionIndex === -1) {
        reports.push({ section: "Citations", passed: false, score: 0, max: 15, message: "Missing '## Tài liệu tham khảo' or '## References' section" });
    } else {
        const refText = body.slice(refSectionIndex);
        const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
        const links = [];
        let match;
        while ((match = mdLinkRegex.exec(refText)) !== null) {
            links.push(match[2]);
        }

        const bigtechDomains = ['aws.amazon', 'cloud.google', 'azure.microsoft', 'databricks', 'apache.org', 'confluent.io', 'snowflake.com'];
        const authoritativeLinks = links.filter(link => {
            return bigtechDomains.some(domain => link.includes(domain));
        });

        if (links.length >= 5) {
            refScore = 15;
            if (authoritativeLinks.length < 3) {
                reports.push({ section: "Citations", passed: true, score: 12, max: 15, message: `Found ${links.length} references, but only ${authoritativeLinks.length} are from major BigTech DE docs (AWS, GCP, Azure, Databricks, Apache, Snowflake)` });
                refScore = 12;
            } else {
                refScore = 15;
            }
        } else {
            reports.push({ section: "Citations", passed: false, score: 5, max: 15, message: `Found only ${links.length} references (minimum 5 required, ideally 5-10)` });
            refScore = 5;
        }
    }
    score += refScore;

    // 5. Internal Links (Backlinks)
    const intLinkRegex = /\[([^\]]+)\]\((?!\s*https?:\/\/)([^)]+)\)/g;
    const internalLinks = [];
    let intMatch;
    while ((intMatch = intLinkRegex.exec(body)) !== null) {
        const url = intMatch[2];
        if (url.startsWith('/concepts/') || url.startsWith('/learning-paths/') || url.startsWith('/interview/') || url.startsWith('../')) {
            internalLinks.push(url);
        }
    }

    let intScore = 0;
    if (internalLinks.length >= 3) {
        intScore = 10;
    } else {
        reports.push({ section: "Backlinks", passed: false, score: 4, max: 10, message: `Found only ${internalLinks.length} internal links (minimum 3 required for site-wide context integration)` });
        intScore = 4;
    }
    score += intScore;

    // 6. Structural Sections (Pros/Cons, When to use, Interview QA, English Summary)
    let structScore = 15;
    const requiredSections = [
        { regex: /##\s+Điểm mạnh\s+\(Pros\)|##\s+Điểm mạnh\s+và\s+điểm\s+yếu/i, name: "Pros/Cons section" },
        { regex: /##\s+Khi nào\s+(nên|không nên)\s+dùng/i, name: "When to use / not to use section" },
        { regex: /##\s+Trọng tâm\s+ôn\s+luyện\s+phỏng\s+vấn/i, name: "Interview preparation Q&As section" },
        { regex: /##\s+English\s+Summary/i, name: "English Summary section" }
    ];

    requiredSections.forEach(sec => {
        if (!sec.regex.test(body)) {
            structScore -= 3;
            reports.push({ section: "Structure", passed: false, score: 0, max: 3, message: `Missing required ${sec.name}` });
        }
    });

    // Check placeholders
    const placeholders = ['TODO', 'lorem ipsum', 'chưa viết', 'placeholder'];
    let hasPlaceholder = false;
    placeholders.forEach(pl => {
        if (body.toLowerCase().includes(pl)) {
            hasPlaceholder = true;
        }
    });

    if (hasPlaceholder) {
        structScore = Math.max(0, structScore - 5);
        reports.push({ section: "Structure", passed: false, score: 0, max: 5, message: "Contains placeholder text (TODO, lorem, etc.)" });
    }

    score += structScore;

    return {
        filename,
        score,
        wordCount,
        reports
    };
}

// CLI entry point
const args = process.argv.slice(2);
if (args.length > 0) {
    const file = args[0];
    const result = evaluateFile(file);
    if (result) {
        console.log(`\n========================================`);
        console.log(`Evaluation Report for: ${result.filename}`);
        console.log(`Final Score: ${result.score} / 100`);
        console.log(`Word Count: ${result.wordCount}`);
        console.log(`========================================`);
        if (result.reports.length === 0 || result.score === 100) {
            console.log(`✅ All checks passed! Score: 100/100.`);
        } else {
            console.log(`Issues found:`);
            result.reports.forEach(r => {
                if (!r.passed) {
                    console.log(`- [${r.section}] ${r.message} (-${r.max - r.score} pts)`);
                }
            });
        }
    }
} else {
    console.log("Usage: node scripts/evaluate_article.cjs <filepath>");
}

module.exports = { evaluateFile };
