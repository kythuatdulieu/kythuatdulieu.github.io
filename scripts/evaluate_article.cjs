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
            if (len >= 40 && len <= 100) {
                fmScore += 5;
            } else {
                reports.push({ section: "SEO", passed: false, score: 2, max: 5, message: `seoTitle length is ${len} (recommended: 40-70 chars)` });
                fmScore += 2;
            }
        } else {
            reports.push({ section: "SEO", passed: false, score: 0, max: 5, message: "Missing seoTitle in frontmatter" });
        }

        // Meta Description (100-250 chars)
        if (fm.metaDescription) {
            const len = fm.metaDescription.length;
            if (len >= 100 && len <= 250) {
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
            if (len >= 50 && len <= 400) {
                fmScore += 5;
            } else {
                reports.push({ section: "Popover", passed: false, score: 2, max: 5, message: `definition length is ${len} (recommended: 50-300 chars)` });
                fmScore += 2;
            }
        } else {
            reports.push({ section: "Popover", passed: false, score: 0, max: 5, message: "Missing definition in frontmatter (critical for popover preview)" });
        }

        score += fmScore;
    }

    const body = content.replace(/^---[\s\S]*?---/, '');

    // 2. Word Count
    const words = body.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    let wordScore = 0;
    
    let minWords = 1200;
    if (filePath.includes('/projects/')) minWords = 1200;
    if (filePath.includes('/learning-paths/')) minWords = 800;
    if (filePath.includes('/interview/')) minWords = 1000;
    
    if (wordCount >= minWords) {
        wordScore = 20;
    } else if (wordCount >= minWords * 0.7) {
        wordScore = 12;
        reports.push({ section: "Content Length", passed: false, score: 12, max: 20, message: `Word count is ${wordCount} (recommended: >= ${minWords} for this category)` });
    } else {
        reports.push({ section: "Content Length", passed: false, score: 5, max: 20, message: `Word count is ${wordCount} (too short: >= ${minWords} recommended)` });
        wordScore = 5;
    }
    score += wordScore;

    // 3. Mermaid diagram
    const hasMermaid = body.includes('```mermaid');
    let mermaidScore = 0;
    
    // Require mermaid only for concepts and projects
    if (filePath.includes('/concepts/') || filePath.includes('/projects/')) {
        mermaidScore = hasMermaid ? 10 : 0;
        if (!hasMermaid) {
            reports.push({ section: "Visuals", passed: false, score: 0, max: 10, message: "Missing architectural flow diagram (```mermaid block)" });
        }
    } else {
        mermaidScore = 10; // Free pass for interviews and learning paths
    }
    score += mermaidScore;

    // 4. External References
    const refSectionIndex = body.indexOf('## Tài liệu tham khảo') !== -1 ? body.indexOf('## Tài liệu tham khảo') : body.indexOf('## References');
    let refScore = 0;
    
    // Policy 2026-07: KHÔNG ép format/số lượng cứng như bản cũ, nhưng cuối bài NÊN có
    // mục References/Tài liệu tham khảo đầy đủ. Thiếu -> phạt nhẹ; có nhưng markdown gãy -> phạt nhẹ.
    if (refSectionIndex === -1 && !filePath.includes('/learning-paths/')) {
        reports.push({ section: "Citations", passed: false, score: 8, max: 15, message: "Nên có mục '## References' hoặc '## Tài liệu tham khảo' ở cuối bài (backlink/nguồn đầy đủ)" });
        refScore = 8;
    } else {
        refScore = 15;
        const refText = refSectionIndex !== -1 ? body.slice(refSectionIndex) : '';
        // Bắt lỗi markdown gãy kiểu [text][url] hoặc [text](url] của bản cũ
        const brokenRef = /\]\[https?:\/\/|\]\(https?:\/\/[^\s)]*\](?!\))/.test(refText);
        if (brokenRef) {
            reports.push({ section: "Citations", passed: false, score: 12, max: 15, message: "References section có link markdown gãy (kiểu [text][url] hoặc [text](url])" });
            refScore = 12;
        }
    }
    score += refScore;

    // 5. Internal Links
    const intLinkRegex = /\[([^\]]+)\]\((?!\s*https?:\/\/)([^)]+)\)/g;
    const internalLinks = [];
    let intMatch;
    while ((intMatch = intLinkRegex.exec(body)) !== null) {
        const url = intMatch[2];
        if (url.startsWith('/concepts/') || url.startsWith('/learning-paths/') || url.startsWith('/interview/') || url.startsWith('../') || url.startsWith('/projects/')) {
            internalLinks.push(url);
        }
    }

    let intScore = 0;
    // Internal links tay là OPTIONAL: auto-link (remark-auto-link) tự chèn lúc build từ prose.
    let minIntLinks = 0;
    if (internalLinks.length >= minIntLinks) {
        intScore = 10;
    } else {
        reports.push({ section: "Backlinks", passed: false, score: 4, max: 10, message: `Found only ${internalLinks.length} internal links (minimum ${minIntLinks} required)` });
        intScore = 4;
    }
    score += intScore;

    // 6. Structural Sections (Depends on category)
    let structScore = 15;
    let requiredSections = [];

    if (filePath.includes('/concepts/')) {
        // Khung v2 (2026-07): KHÔNG ràng section cứng. Nội dung phát triển theo từng bài,
        // miễn logic + dễ hiểu (phần này người review đánh giá, không auto-check).
        // Yêu cầu còn lại chỉ là: có sơ đồ (check riêng), và cuối bài có backlink/reference.
        requiredSections = [];
    } else if (filePath.includes('/projects/')) {
        requiredSections = [
            { regex: /##\s+Business\s+Problem|##\s+Bài toán\s+kinh\s+doanh/i, name: "Business Problem section" },
            { regex: /##\s+Tech\s+Stack|##\s+Công\s+nghệ\s+sử\s+dụng/i, name: "Tech Stack section" },
            { regex: /##\s+Architecture\s+Diagram|##\s+Kiến\s+trúc\s+hệ\s+thống/i, name: "Architecture Diagram section" },
            { regex: /##\s+Step-by-step\s+Implementation|##\s+Hướng\s+dẫn\s+triển\s+khai/i, name: "Step-by-step Implementation section" }
        ];
    } else if (filePath.includes('/learning-paths/')) {
        requiredSections = [
            { regex: /##\s+Roadmap|##\s+Lộ\s+trình/i, name: "Roadmap section" },
            { regex: /##\s+Milestones|##\s+Các\s+cột\s+mốc/i, name: "Milestones section" }
        ];
    } else if (filePath.includes('/interview/')) {
        requiredSections = [
            { regex: /##\s+Scenario|##\s+Tình\s+huống/i, name: "Scenario-based section" }
        ];
    }

    if (requiredSections.length > 0) {
        const scorePerSection = 15 / requiredSections.length;
        requiredSections.forEach(sec => {
            if (!sec.regex.test(body)) {
                structScore -= scorePerSection;
                reports.push({ section: "Structure", passed: false, score: 0, max: Math.ceil(scorePerSection), message: `Missing required ${sec.name}` });
            }
        });
        structScore = Math.max(0, Math.floor(structScore));
    }

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

const args = process.argv.slice(2);
if (args.length > 0) {
    const file = args[0];
    const result = evaluateFile(file);
    if (result) {
        if (result.reports.length === 0 || result.score >= 100) {
            // pass silently
        } else {
            console.log(`Issues found in ${result.filename}:`);
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
