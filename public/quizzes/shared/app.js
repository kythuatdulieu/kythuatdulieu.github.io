/**
 * Quiz App - Certified Data Engineer Professional
 * Core quiz engine with navigation, scoring, review modes, Vietnamese toggle, and theme switching.
 */
(function () {
    'use strict';

    // Áp theme của blog ngay khi script chạy, trước khi init() chờ fetch câu hỏi
    try {
        const t = localStorage.getItem('dehb-theme');
        if (t) document.documentElement.setAttribute('data-theme', t);
    } catch (e) { /* ignore */ }

    // ========================
    // State
    // ========================
    // Dynamically load the STATE_KEY based on the path
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length > 0 && segments[segments.length - 1].includes('.')) {
        segments.pop();
    }
    const quizId = segments.pop() || 'quiz';
    const STATE_KEY = `quiz_state_${quizId}_v1`;

    let questions = [];
    let questionOrder = [];
    let currentIndex = 0;
    let userAnswers = {};
    let showVietnamese = false;
    let showImage = false;
    let redoIncorrectIds = []; // Store IDs of questions to redo
    let unansweredIds = []; // Store IDs of unanswered questions for the review session
    let shuffleMode = false;
    let filterMode = 'all';

    // ========================
    // DOM References
    // ========================
    const $ = id => document.getElementById(id);

    const els = {
        questionCounter: $('questionCounter'),
        questionBadge: $('questionBadge'),
        topicBadge: $('topicBadge'),
        questionText: $('questionText'),
        questionTextVi: $('questionTextVi'),
        optionsList: $('optionsList'),
        btnPdf: $('btnPdf'),
        btnImage: $('btnImage'),
        questionImageBox: $('questionImageBox'),
        questionImage: $('questionImage'),

        scoreCorrect: $('scoreCorrect'),
        scoreIncorrect: $('scoreIncorrect'),
        scoreUnanswered: $('scoreUnanswered'),
        progressBar: $('progressBar'),
        btnPrev: $('btnPrev'),
        btnNext: $('btnNext'),
        btnGrid: $('btnGrid'),
        btnViToggle: $('btnViToggle'),
        btnShuffle: $('btnShuffle'),
        btnMenu: $('btnMenu'),
        sidePanel: $('sidePanel'),
        overlay: $('overlay'),
        btnClosePanel: $('btnClosePanel'),
        gridModal: $('gridModal'),
        questionGrid: $('questionGrid'),
        btnCloseGrid: $('btnCloseGrid'),
        toggleVi: $('toggleVi'),
        toggleShuffle: $('toggleShuffle'),
        statCorrect: $('statCorrect'),
        statIncorrect: $('statIncorrect'),
        statUnanswered: $('statUnanswered'),
        statTotal: $('statTotal'),
        countAll: $('countAll'),
        countCorrect: $('countCorrect'),
        countIncorrect: $('countIncorrect'),
        countRedoIncorrect: $('countRedoIncorrect'),
        countUnanswered: $('countUnanswered'),
        btnReviewAll: $('btnReviewAll'),
        btnReviewCorrect: $('btnReviewCorrect'),
        btnReviewIncorrect: $('btnReviewIncorrect'),
        btnRedoIncorrect: $('btnRedoIncorrect'),
        btnReviewUnanswered: $('btnReviewUnanswered'),
        btnResetAll: $('btnResetAll'),
        btnResetIncorrect: $('btnResetIncorrect'),
        btnResetCorrect: $('btnResetCorrect'),
        questionCard: $('questionCard'),
    };

    // ========================
    // Persistence
    // ========================
    function saveState() {
        try {
            const state = {
                userAnswers,
                showVietnamese,
                shuffleMode,
                questionOrder: shuffleMode ? questionOrder : null,
                currentIndex,
            };
            localStorage.setItem(STATE_KEY, JSON.stringify(state));
        } catch (e) { /* ignore */ }
    }

    function loadState() {
        try {
            const saved = localStorage.getItem(STATE_KEY);
            if (!saved) return;
            const state = JSON.parse(saved);
            userAnswers = state.userAnswers || {};
            showVietnamese = state.showVietnamese || false;
            shuffleMode = state.shuffleMode || false;
            // Always default to 'all' on page load to prevent confusing empty states
            filterMode = 'all';
            if (state.questionOrder && shuffleMode) {
                questionOrder = state.questionOrder;
            }
            if (state.currentIndex !== undefined) {
                currentIndex = state.currentIndex;
            }
        } catch (e) { /* ignore */ }
    }


    // ========================
    // Scoring
    // ========================
    function getCounts() {
        let correct = 0, incorrect = 0, unanswered = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] !== undefined) {
                if (userAnswers[q.id] === q.answer) correct++;
                else incorrect++;
            } else {
                unanswered++;
            }
        });
        return { correct, incorrect, unanswered };
    }

    function updateScores() {
        const { correct, incorrect, unanswered } = getCounts();
        els.scoreCorrect.textContent = correct;
        els.scoreIncorrect.textContent = incorrect;
        els.scoreUnanswered.textContent = unanswered;

        els.statCorrect.textContent = correct;
        els.statIncorrect.textContent = incorrect;
        els.statUnanswered.textContent = unanswered;
        els.statTotal.textContent = questions.length;

        els.countAll.textContent = questions.length;
        els.countCorrect.textContent = correct;
        els.countIncorrect.textContent = incorrect;
        if (els.countRedoIncorrect) els.countRedoIncorrect.textContent = incorrect;
        els.countUnanswered.textContent = unanswered;

        const answered = correct + incorrect;
        const pct = questions.length > 0 ? (answered / questions.length) * 100 : 0;
        els.progressBar.style.width = pct + '%';
    }

    // ========================
    // Filter / Order
    // ========================
    function getFilteredIndices() {
        let indices = [...questionOrder];
        if (filterMode === 'correct') {
            indices = indices.filter(i => userAnswers[questions[i].id] === questions[i].answer);
        } else if (filterMode === 'incorrect') {
            indices = indices.filter(i => userAnswers[questions[i].id] !== undefined && userAnswers[questions[i].id] !== questions[i].answer);
        } else if (filterMode === 'redo_incorrect') {
            indices = indices.filter(i => redoIncorrectIds.includes(questions[i].id));
        } else if (filterMode === 'unanswered') {
            indices = indices.filter(i => unansweredIds.includes(questions[i].id));
        }
        return indices;
    }

    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function applyShuffle() {
        if (shuffleMode) {
            questionOrder = shuffleArray(questions.map((_, i) => i));
        } else {
            questionOrder = questions.map((_, i) => i);
        }
        currentIndex = 0;
        showImage = false;
    }

    // ========================
    // Vietnamese Translation
    // ========================
    function getVietnameseQuestion(q) {
        if (q.question_vi) return q.question_vi;
        // Auto-generate a label since we don't have full translations
        return null;
    }

    function getVietnameseOption(q, letter) {
        if (q.options_vi && q.options_vi[letter]) return q.options_vi[letter];
        return null;
    }

    async function fetchTranslation(text) {
        if (!text) return '';
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data && data[0]) {
                return data[0].map(item => item[0]).join('');
            }
        } catch (e) {
            console.error(e);
            return '*Lỗi dịch: ' + e.message + '*';
        }
        return '*Không thể dịch*';
    }

    // Helper to append text with bold, inline code, and images formatted
    function appendFormattedText(element, text) {
        const parts = text.split(/(\*\*.*?\*\*|`{3,}[\s\S]*?`{3,}|``.*?``|`.*?`|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/);
        parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const bold = document.createElement('strong');
                bold.textContent = part.slice(2, -2);
                element.appendChild(bold);
            } else if (part.startsWith('```') && part.endsWith('```')) {
                const code = document.createElement('code');
                code.className = 'code-block';
                let codeContent = part.slice(3, -3);
                // Clean up language prefix if present (e.g. "python\n")
                codeContent = codeContent.replace(/^(python|yaml|sql|bash|json)\n/, '');
                code.textContent = codeContent;
                element.appendChild(code);
            } else if (part.startsWith('``') && part.endsWith('``')) {
                const code = document.createElement('code');
                code.textContent = part.slice(2, -2);
                element.appendChild(code);
            } else if (part.startsWith('`') && part.endsWith('`')) {
                const code = document.createElement('code');
                code.textContent = part.slice(1, -1);
                element.appendChild(code);
            } else if (part.startsWith('![') && part.includes('](') && part.endsWith(')')) {
                const img = document.createElement('img');
                const altEnd = part.indexOf('](');
                const altText = part.slice(2, altEnd);
                const url = part.slice(altEnd + 2, -1);
                img.src = url;
                img.alt = altText;
                img.className = 'markdown-img';
                img.style.maxWidth = '100%';
                img.style.display = 'block';
                img.style.margin = '10px 0';
                element.appendChild(img);
            } else if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
                const a = document.createElement('a');
                const textEnd = part.indexOf('](');
                const linkText = part.slice(1, textEnd);
                const url = part.slice(textEnd + 2, -1);
                a.href = url;
                a.textContent = linkText;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.className = 'markdown-link';
                element.appendChild(a);
            } else if (part) {
                element.appendChild(document.createTextNode(part));
            }
        });
    }

    function parseMarkdown(markdownText) {
        if (!markdownText) return "";
        
        const codeBlocks = [];
        let processedText = markdownText.replace(/```([\s\S]*?)```/g, (match, codeContent) => {
            const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`;
            let cleanCode = codeContent.trim();
            const langMatch = cleanCode.match(/^(kusto|python|yaml|sql|bash|json|javascript|js|html|css)\r?\n/i);
            if (langMatch) {
                cleanCode = cleanCode.substring(langMatch[0].length);
            }
            codeBlocks.push(cleanCode);
            return placeholder;
        });

        const lines = processedText.split('\n');
        let htmlLines = [];
        let currentList = null;

        const closeListIfNeeded = () => {
            if (currentList) {
                htmlLines.push(`</${currentList}>`);
                currentList = null;
            }
        };

        const formatInline = (text) => {
            if (!text) return "";
            
            let escaped = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
                
            escaped = escaped.replace(/``(.*?)``/g, '<code>$1</code>');
            escaped = escaped.replace(/`(.*?)`/g, '<code>$1</code>');
            escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
            escaped = escaped.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="markdown-link">$1</a>');
            escaped = escaped.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="markdown-img" style="max-width:100%; display:block; margin:10px 0;" />');

            return escaped;
        };

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) {
                closeListIfNeeded();
                return;
            }

            const codeBlockMatch = trimmed.match(/^___CODE_BLOCK_(\d+)___$/);
            if (codeBlockMatch) {
                closeListIfNeeded();
                const index = parseInt(codeBlockMatch[1], 10);
                const codeContent = codeBlocks[index];
                const escapedCode = codeContent
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
                htmlLines.push(`<pre><code class="code-block">${escapedCode}</code></pre>`);
                return;
            }

            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                if (currentList !== 'ul') {
                    closeListIfNeeded();
                    htmlLines.push('<ul class="explanation-list">');
                    currentList = 'ul';
                }
                const content = trimmed.substring(2);
                htmlLines.push(`<li>${formatInline(content)}</li>`);
            }
            else if (/^(?:\-\s*)?\d+\.\s+/.test(trimmed)) {
                const match = trimmed.match(/^(?:\-\s*)?(\d+\.\s+)(.*)/);
                if (currentList !== 'ol') {
                    closeListIfNeeded();
                    htmlLines.push('<ol class="explanation-list">');
                    currentList = 'ol';
                }
                const content = match[2];
                htmlLines.push(`<li>${formatInline(content)}</li>`);
            }
            else if (trimmed.startsWith('### ')) {
                closeListIfNeeded();
                const content = trimmed.substring(4);
                htmlLines.push(`<h4 class="explanation-heading">${formatInline(content)}</h4>`);
            } else if (trimmed.startsWith('## ')) {
                closeListIfNeeded();
                const content = trimmed.substring(3);
                htmlLines.push(`<h3 class="explanation-heading">${formatInline(content)}</h3>`);
            }
            else {
                closeListIfNeeded();
                htmlLines.push(`<p class="explanation-paragraph">${formatInline(trimmed)}</p>`);
            }
        });

        closeListIfNeeded();
        return htmlLines.join('\n');
    }

    // Helper to render markdown-like text to a container safely
    function renderMarkdownSafely(container, markdownText) {
        container.innerHTML = parseMarkdown(markdownText);
    }

    function renderQuestionText(element, text, imagesStr) {
        element.replaceChildren();
        if (!text) return;
        
        let images = [];
        if (imagesStr) {
            images = imagesStr.split(/[\n,]/).map(img => img.trim()).filter(Boolean);
        }
        
        const segments = text.split('//IMG//');
        segments.forEach((segment, idx) => {
            appendFormattedText(element, segment);
            if (idx < segments.length - 1 && images[idx]) {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'question-image';
                imgDiv.style.textAlign = 'center';
                imgDiv.style.margin = '10px 0';
                
                const img = document.createElement('img');
                img.src = images[idx];
                img.alt = 'Hình ảnh câu hỏi';
                img.style.maxWidth = '100%';
                img.style.borderRadius = '8px';
                img.style.border = '1px solid var(--border)';
                
                imgDiv.appendChild(img);
                element.appendChild(imgDiv);
            }
        });
    }

    // ========================
    // Rendering
    // ========================
    function renderQuestion(animate = true) {
        const filtered = getFilteredIndices();
        if (filtered.length === 0) {
            els.questionBadge.textContent = 'Không có câu hỏi';
            els.topicBadge.textContent = '';
            els.questionText.textContent = filterMode === 'correct' ? 'Chưa có câu trả lời đúng nào.' :
                filterMode === 'incorrect' ? 'Chưa có câu trả lời sai nào.' :
                    filterMode === 'unanswered' ? 'Đã hoàn thành tất cả câu hỏi.' :
                        'Không có câu hỏi.';
            els.questionTextVi.style.display = 'none';
            els.optionsList.innerHTML = '';

            els.questionCounter.textContent = '0 / 0';
            return;
        }

        if (currentIndex >= filtered.length) currentIndex = filtered.length - 1;
        if (currentIndex < 0) currentIndex = 0;

        const qIdx = filtered[currentIndex];
        const q = questions[qIdx];
        const userAns = userAnswers[q.id];
        const answered = userAns !== undefined;

        if (els.btnPdf) {
            if (q.page) {
                els.btnPdf.style.display = '';
                els.btnPdf.disabled = false;
                const pdfPath = encodeURI('Certified Data Engineer Professional_Answers_new.pdf');
                els.btnPdf.onclick = () => window.open(`${pdfPath}#page=${q.page}`, '_blank');
            } else {
                els.btnPdf.style.display = 'none';
                els.btnPdf.disabled = true;
                els.btnPdf.onclick = null;
            }
        }

        if (els.btnImage) {
            if (q.image) {
                els.btnImage.style.display = '';
            } else {
                els.btnImage.style.display = 'none';
            }
        }

        if (els.questionImageBox) {
            els.questionImageBox.replaceChildren();
            if (q.image && showImage && !(q.question && q.question.includes('//IMG//'))) {
                const images = q.image.split(/[\n,]/).map(img => img.trim()).filter(Boolean);
                images.forEach(imgUrl => {
                    const img = document.createElement('img');
                    img.src = imgUrl;
                    img.alt = 'Hình ảnh câu hỏi';
                    img.style.maxWidth = '100%';
                    img.style.borderRadius = '8px';
                    img.style.border = '1px solid var(--border)';
                    img.style.margin = '10px auto';
                    img.style.display = 'block';
                    els.questionImageBox.appendChild(img);
                });
                els.questionImageBox.style.display = 'block';
            } else {
                els.questionImageBox.style.display = 'none';
            }
        }

        // Counter
        els.questionCounter.textContent = `${currentIndex + 1} / ${filtered.length}`;

        // Badge
        els.questionBadge.textContent = `Question #${q.id}`;
        els.topicBadge.textContent = `Topic ${q.topic}`;

        // Question text
        renderQuestionText(els.questionText, q.question, showImage ? q.image : null);

        // Vietnamese question text
        if (showVietnamese) {
            if (q.question_vi) {
                renderQuestionText(els.questionTextVi, q.question_vi, showImage ? q.image : null);
                els.questionTextVi.style.display = 'block';
            } else {
                els.questionTextVi.replaceChildren();
                els.questionTextVi.innerHTML = '<span style="color:var(--sl-color-gray-4);font-style:italic">✨ Đang dịch tự động...</span>';
                els.questionTextVi.style.display = 'block';
                
                fetchTranslation(q.question).then(translated => {
                    q.question_vi = translated;
                    if (window.currentSelectionQId === q.id) {
                        renderQuestionText(els.questionTextVi, translated, showImage ? q.image : null);
                    }
                });
            }
        } else {
            els.questionTextVi.style.display = 'none';
        }

        // Options
        els.optionsList.innerHTML = '';
        const optionLetters = Object.keys(q.options).sort();

        // Ensure currentSelection exists and is reset if switching questions
        if (typeof window.currentSelectionQId === 'undefined' || window.currentSelectionQId !== q.id) {
            window.currentSelection = new Set();
            window.currentSelectionQId = q.id;
        }

        optionLetters.forEach(letter => {
            const div = document.createElement('div');
            div.className = 'option-item';

            if (answered) {
                div.classList.add('disabled');
                const userAnsArr = userAns.split(',');
                const correctAnsArr = q.answer ? q.answer.split(',') : [];
                
                if (correctAnsArr.includes(letter)) {
                    div.classList.add('correct-answer');
                } else if (userAnsArr.includes(letter)) {
                    div.classList.add('wrong-answer');
                }
            } else if (q.isMulti && window.currentSelection.has(letter)) {
                div.classList.add('selected'); // Use the selected class from style.css
            }

            const letterSpan = document.createElement('span');
            letterSpan.className = 'option-letter';
            
            if (answered) {
                const userAnsArr = userAns.split(',');
                const correctAnsArr = q.answer ? q.answer.split(',') : [];
                
                if (correctAnsArr.includes(letter)) {
                    letterSpan.textContent = '✓';
                } else if (userAnsArr.includes(letter)) {
                    letterSpan.textContent = '✗';
                } else {
                    letterSpan.textContent = letter;
                }
            } else {
                letterSpan.textContent = letter;
            }

            const contentDiv = document.createElement('div');
            contentDiv.className = 'option-content';

            const textSpan = document.createElement('div');
            textSpan.className = 'option-text';
            appendFormattedText(textSpan, q.options[letter]);

            if (showVietnamese) {
                const viOpt = getVietnameseOption(q, letter);
                if (viOpt) {
                    const viSpan = document.createElement('div');
                    viSpan.className = 'option-text-vi';
                    appendFormattedText(viSpan, viOpt);
                    viSpan.style.display = 'block';
                    textSpan.appendChild(viSpan);
                } else {
                    const viSpan = document.createElement('div');
                    viSpan.className = 'option-text-vi';
                    viSpan.innerHTML = '<span style="color:var(--sl-color-gray-4);font-style:italic">✨ Đang dịch...</span>';
                    viSpan.style.display = 'block';
                    textSpan.appendChild(viSpan);
                    
                    fetchTranslation(q.options[letter]).then(translated => {
                        q.options_vi = q.options_vi || {};
                        q.options_vi[letter] = translated;
                        if (window.currentSelectionQId === q.id) {
                            viSpan.replaceChildren();
                            appendFormattedText(viSpan, translated);
                        }
                    });
                }
            }

            contentDiv.appendChild(textSpan);

            div.appendChild(letterSpan);
            div.appendChild(contentDiv);

            if (!answered) {
                div.addEventListener('click', () => selectAnswer(q.id, letter));
            }

            els.optionsList.appendChild(div);
        });

        // Render Submit Button for Multi-choice if not answered
        if (q.isMulti && !answered) {
            const submitBtn = document.createElement('button');
            submitBtn.className = 'multi-submit-btn';
            const requiredCount = q.answer ? q.answer.split(',').length : 1;
            submitBtn.textContent = `Xác nhận (${window.currentSelection.size}/${requiredCount})`;
            
            if (window.currentSelection.size === requiredCount) {
                submitBtn.disabled = false;
                submitBtn.addEventListener('click', () => {
                    const ansStr = Array.from(window.currentSelection).sort().join(',');
                    userAnswers[q.id] = ansStr;
                    window.currentSelection.clear();
                    
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'quiz_answer', {
                            quiz_id: quizId,
                            question_id: q.id,
                            is_correct: ansStr === q.answer,
                            question_type: 'multi'
                        });
                    }

                    updateScores();
                    saveState();
                    renderQuestion();
                });
            } else {
                submitBtn.disabled = true;
            }
            els.optionsList.appendChild(submitBtn);
        }

        // Render Show Answer button if no options are present
        if (optionLetters.length === 0) {
            const noOptDiv = document.createElement('div');
            noOptDiv.className = 'no-options-container';
            noOptDiv.style.marginTop = '1.5rem';
            noOptDiv.style.textAlign = 'center';
            
            const showBtn = document.createElement('button');
            showBtn.className = 'btn-show-answer';
            showBtn.id = 'btnShowAnswer';
            showBtn.textContent = 'Xem đáp án';
            
            if (answered) {
                showBtn.style.display = 'none';
            } else {
                showBtn.addEventListener('click', () => {
                    userAnswers[q.id] = 'VIEWED';
                    updateScores();
                    saveState();
                    renderQuestion(false);
                });
            }
            noOptDiv.appendChild(showBtn);
            els.optionsList.appendChild(noOptDiv);
        }

        // Explanation — shown after answering
        let explanationDiv = document.getElementById('explanationBox');
        if (!explanationDiv) {
            explanationDiv = document.createElement('div');
            explanationDiv.id = 'explanationBox';
            explanationDiv.className = 'explanation-box';
            els.optionsList.parentNode.insertBefore(explanationDiv, els.optionsList.nextSibling);
        }

        if (answered) {
            explanationDiv.replaceChildren();

            if (q.explanation_vi || q.answer_image) {
                const title = document.createElement('div');
                title.className = 'explanation-title';
                title.textContent = '💡 Giải thích';
                explanationDiv.appendChild(title);

                if (q.answer_image) {
                    const ansImgBox = document.createElement('div');
                    ansImgBox.className = 'answer-image-box';
                    ansImgBox.style.marginBottom = '1.5rem';
                    ansImgBox.style.textAlign = 'center';
                    
                    const ansImgTitle = document.createElement('div');
                    ansImgTitle.style.fontSize = '0.85rem';
                    ansImgTitle.style.fontWeight = '600';
                    ansImgTitle.style.color = 'var(--accent)';
                    ansImgTitle.style.marginBottom = '0.5rem';
                    ansImgTitle.style.textAlign = 'left';
                    ansImgTitle.textContent = 'Đáp án đúng (Hình ảnh):';
                    ansImgBox.appendChild(ansImgTitle);
                    
                    const ansImgs = q.answer_image.split(/[\n,]/).map(img => img.trim()).filter(Boolean);
                    ansImgs.forEach(imgUrl => {
                        const img = document.createElement('img');
                        img.src = imgUrl;
                        img.alt = 'Đáp án';
                        img.style.maxWidth = '100%';
                        img.style.borderRadius = '8px';
                        img.style.border = '1px solid var(--border)';
                        img.style.margin = '10px auto';
                        img.style.display = 'block';
                        ansImgBox.appendChild(img);
                    });
                    explanationDiv.appendChild(ansImgBox);
                }

                const contentContainer = document.createElement('div');
                contentContainer.className = 'explanation-content';
                renderMarkdownSafely(contentContainer, q.explanation_vi);
                explanationDiv.appendChild(contentContainer);

                // References (Citations)
                if (q.references && q.references.length > 0) {
                    const refBox = document.createElement('div');
                    refBox.className = 'references-box';

                    const refTitle = document.createElement('div');
                    refTitle.className = 'references-title';
                    refTitle.textContent = '📚 Tài liệu tham khảo:';
                    refBox.appendChild(refTitle);

                    const refList = document.createElement('ul');
                    refList.className = 'references-list';

                    q.references.forEach(ref => {
                        if (ref.title && ref.url) {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.setAttribute('href', ref.url);
                            a.setAttribute('target', '_blank');
                            a.setAttribute('rel', 'noopener noreferrer');
                            a.className = 'reference-link';
                            a.textContent = ref.title;
                            li.appendChild(a);
                            refList.appendChild(li);
                        }
                    });

                    refBox.appendChild(refList);
                    explanationDiv.appendChild(refBox);
                }

                explanationDiv.style.display = 'block';
            } else if (showVietnamese) {
                const title = document.createElement('div');
                title.className = 'explanation-title';
                title.textContent = '💡 Gợi ý';
                explanationDiv.appendChild(title);

                const contentContainer = document.createElement('div');
                contentContainer.className = 'explanation-content';
                
                if (q.explanation) {
                    const trPlaceholder = document.createElement('div');
                    trPlaceholder.innerHTML = '<p><span style="color:var(--sl-color-gray-4);font-style:italic">✨ Đang dịch giải thích...</span></p>';
                    contentContainer.appendChild(trPlaceholder);
                    
                    fetchTranslation(q.explanation).then(translated => {
                        q.explanation_vi = translated;
                        if (window.currentSelectionQId === q.id) {
                            trPlaceholder.replaceChildren();
                            renderMarkdownSafely(trPlaceholder, translated);
                        }
                    });
                } else {
                    contentContainer.innerHTML = '<p><em>Chưa có giải thích chi tiết bằng tiếng Việt cho câu hỏi này.</em></p>';
                }
                
                explanationDiv.appendChild(contentContainer);
                
                explanationDiv.style.display = 'block';
            } else {
                explanationDiv.style.display = 'none';
            }
        } else {
            explanationDiv.style.display = 'none';
        }



        if (animate) {
            // Animate card
            els.questionCard.style.animation = 'none';
            requestAnimationFrame(() => {
                els.questionCard.style.animation = 'fadeInUp 0.3s ease';
            });
        }

        saveState();
    }

    function selectAnswer(qId, letter) {
        const q = questions.find(q => q.id === qId);
        if (q && q.isMulti) {
            const requiredCount = q.answer ? q.answer.split(',').length : 1;
            if (window.currentSelection.has(letter)) {
                window.currentSelection.delete(letter);
            } else {
                if (window.currentSelection.size < requiredCount) {
                    window.currentSelection.add(letter);
                } else {
                    showToast(`Chỉ được chọn tối đa ${requiredCount} đáp án`);
                }
            }
            renderQuestion(false);
        } else {
            userAnswers[qId] = letter;
            
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'quiz_answer', {
                    quiz_id: quizId,
                    question_id: qId,
                    is_correct: letter === q.answer,
                    question_type: 'single'
                });
            }

            updateScores();
            saveState();
            renderQuestion(false);
        }
    }

    // ========================
    // Navigation
    // ========================
    function goNext() {
        const filtered = getFilteredIndices();
        if (currentIndex < filtered.length - 1) {
            currentIndex++;
            showImage = false;
            renderQuestion();
            saveState();
        }
    }

    function goPrev() {
        if (currentIndex > 0) {
            currentIndex--;
            showImage = false;
            renderQuestion();
            saveState();
        }
    }

    function goToQuestion(idx) {
        currentIndex = idx;
        renderQuestion();
        saveState();
        closeGrid();
    }

    // ========================
    // Grid
    // ========================
    function renderGrid(filter) {
        const gridFilter = filter || 'all';
        els.questionGrid.innerHTML = '';

        document.querySelectorAll('.grid-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === gridFilter);
        });

        let indices = [...questionOrder];
        if (gridFilter === 'correct') {
            indices = indices.filter(i => userAnswers[questions[i].id] === questions[i].answer);
        } else if (gridFilter === 'incorrect') {
            indices = indices.filter(i => userAnswers[questions[i].id] !== undefined && userAnswers[questions[i].id] !== questions[i].answer);
        } else if (gridFilter === 'redo_incorrect') {
            indices = indices.filter(i => redoIncorrectIds.includes(questions[i].id));
        } else if (gridFilter === 'unanswered') {
            indices = indices.filter(i => userAnswers[questions[i].id] === undefined);
        }

        const filtered = getFilteredIndices();

        indices.forEach((qOrderIdx) => {
            const q = questions[qOrderIdx];
            const btn = document.createElement('button');
            btn.className = 'grid-item';
            btn.textContent = q.id;

            const posInFiltered = filtered.indexOf(qOrderIdx);

            if (userAnswers[q.id] !== undefined) {
                if (userAnswers[q.id] === q.answer) {
                    btn.classList.add('answered-correct');
                } else {
                    btn.classList.add('answered-incorrect');
                }
            }

            if (posInFiltered === currentIndex) {
                btn.classList.add('current');
            }

            btn.addEventListener('click', () => {
                if (gridFilter !== 'all' && gridFilter !== filterMode) {
                    filterMode = gridFilter;
                }
                const newFiltered = getFilteredIndices();
                const pos = newFiltered.indexOf(qOrderIdx);
                if (pos >= 0) {
                    goToQuestion(pos);
                } else {
                    filterMode = 'all';
                    const allFiltered = getFilteredIndices();
                    const allPos = allFiltered.indexOf(qOrderIdx);
                    if (allPos >= 0) goToQuestion(allPos);
                }
            });

            els.questionGrid.appendChild(btn);
        });
    }

    function openGrid() {
        renderGrid('all');
        els.gridModal.classList.add('visible');
    }

    function closeGrid() {
        els.gridModal.classList.remove('visible');
    }

    // ========================
    // Side Panel
    // ========================
    function openPanel() {
        updateScores();
        els.sidePanel.classList.add('open');
        els.overlay.classList.add('visible');
    }

    function closePanel() {
        els.sidePanel.classList.remove('open');
        els.overlay.classList.remove('visible');
    }

    // ========================
    // Vietnamese Toggle
    // ========================
    function toggleVietnamese(on) {
        showVietnamese = on;
        els.btnViToggle.classList.toggle('active', on);
        els.toggleVi.checked = on;
        
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'quiz_language_toggle', {
                quiz_id: quizId,
                language: on ? 'vi' : 'en'
            });
        }

        renderQuestion();
        saveState();
    }

    // ========================
    // Shuffle Toggle
    // ========================
    function toggleShuffleMode(on) {
        shuffleMode = on;
        els.btnShuffle.classList.toggle('active', on);
        els.toggleShuffle.checked = on;
        
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'quiz_shuffle_toggle', {
                quiz_id: quizId,
                shuffle_on: on
            });
        }

        applyShuffle();
        renderQuestion();
        showToast(on ? 'Đã bật xáo trộn' : 'Thứ tự gốc');
        saveState();
    }

    // ========================
    // Review Modes
    // ========================
    function setReviewMode(mode) {
        filterMode = mode;
        els.btnReviewAll.classList.toggle('active', mode === 'all');
        els.btnReviewCorrect.classList.toggle('active', mode === 'correct');
        els.btnReviewIncorrect.classList.toggle('active', mode === 'incorrect');
        if (els.btnRedoIncorrect) els.btnRedoIncorrect.classList.toggle('active', mode === 'redo_incorrect');
        els.btnReviewUnanswered.classList.toggle('active', mode === 'unanswered');

        currentIndex = 0;
        renderQuestion();
        closePanel();
        const labels = {
            all: 'Tất cả câu hỏi',
            correct: 'Câu trả lời đúng',
            incorrect: 'Câu trả lời sai',
            redo_incorrect: 'Làm lại câu sai',
            unanswered: '⬜ Câu chưa làm',
        };
        showToast(labels[mode] || mode);
        saveState();
    }

    // ========================
    // Reset Handlers
    // ========================
    function handleRedoIncorrect() {
        // Lấy danh sách ID các câu đang sai
        redoIncorrectIds = questions
            .filter(q => userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.answer)
            .map(q => q.id);
            
        if (redoIncorrectIds.length === 0) {
            alert('Tuyệt vời! Bạn không có câu sai nào để làm lại.');
            return;
        }

        // Xóa kết quả của các câu sai
        redoIncorrectIds.forEach(id => delete userAnswers[id]);
        
        saveState();
        updateScores();
        setReviewMode('redo_incorrect');
        closePanel();
    }

    function resetAll() {
        if (!confirm('Bạn có chắc muốn reset tất cả? Mọi tiến trình sẽ bị xóa.')) return;
        userAnswers = {};
        currentIndex = 0;
        filterMode = 'all';
        
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'quiz_reset_all', {
                quiz_id: quizId
            });
        }

        updateScores();
        renderQuestion();
        closePanel();
        showToast('Đã reset tất cả');
        saveState();
    }

    function resetIncorrect() {
        const toReset = questions.filter(q => userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.answer);
        if (toReset.length === 0) {
            showToast('Không có câu sai nào để reset');
            return;
        }
        if (!confirm(`Reset ${toReset.length} câu trả lời sai?`)) return;
        toReset.forEach(q => delete userAnswers[q.id]);
        updateScores();
        renderQuestion();
        closePanel();
        showToast(`↩️ Đã reset ${toReset.length} câu sai`);
        saveState();
    }

    function resetCorrect() {
        const toReset = questions.filter(q => userAnswers[q.id] === q.answer);
        if (toReset.length === 0) {
            showToast('Không có câu đúng nào để reset');
            return;
        }
        if (!confirm(`Reset ${toReset.length} câu trả lời đúng?`)) return;
        toReset.forEach(q => delete userAnswers[q.id]);
        updateScores();
        renderQuestion();
        closePanel();
        showToast(`↩️ Đã reset ${toReset.length} câu đúng`);
        saveState();
    }

    // ========================
    // Toast
    // ========================
    let toastTimer;
    function showToast(msg) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        clearTimeout(toastTimer);
        toast.textContent = msg;
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    // ========================
    // Keyboard & Swipe
    // ========================
    function handleKeyboard(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            goNext();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            goPrev();
        } else if (e.key === 'Escape') {
            closePanel();
            closeGrid();
        }
    }

    let touchStartX = 0;
    let touchStartY = 0;
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }

    function handleTouchEnd(e) {
        const dx = e.changedTouches[0].screenX - touchStartX;
        const dy = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
            if (dx < 0) goNext();
            else goPrev();
        }
    }

    // ========================
    // Event Bindings
    // ========================
    function bindEvents() {
        // Navigation
        els.btnNext.addEventListener('click', goNext);
        els.btnPrev.addEventListener('click', goPrev);

        // Grid
        els.btnGrid.addEventListener('click', openGrid);
        els.btnCloseGrid.addEventListener('click', closeGrid);
        els.gridModal.addEventListener('click', (e) => {
            if (e.target === els.gridModal) closeGrid();
        });

        document.querySelectorAll('.grid-tab').forEach(tab => {
            tab.addEventListener('click', () => renderGrid(tab.dataset.filter));
        });

        // Side Panel
        els.btnMenu.addEventListener('click', openPanel);
        els.btnClosePanel.addEventListener('click', closePanel);
        els.overlay.addEventListener('click', closePanel);
        if (els.btnImage) {
            els.btnImage.addEventListener('click', () => {
                showImage = !showImage;
                renderQuestion();
            });
        }

        // Vietnamese toggle
        els.btnViToggle.addEventListener('click', () => toggleVietnamese(!showVietnamese));
        els.toggleVi.addEventListener('change', (e) => toggleVietnamese(e.target.checked));

        // Shuffle toggle
        els.btnShuffle.addEventListener('click', () => toggleShuffleMode(!shuffleMode));
        els.toggleShuffle.addEventListener('change', (e) => toggleShuffleMode(e.target.checked));

        // Review modes
        els.btnReviewAll.addEventListener('click', () => { redoIncorrectIds = []; unansweredIds = []; setReviewMode('all'); });
        els.btnReviewCorrect.addEventListener('click', () => { redoIncorrectIds = []; unansweredIds = []; setReviewMode('correct'); });
        els.btnReviewIncorrect.addEventListener('click', () => { redoIncorrectIds = []; unansweredIds = []; setReviewMode('incorrect'); });
        if (els.btnRedoIncorrect) els.btnRedoIncorrect.addEventListener('click', handleRedoIncorrect);
        els.btnReviewUnanswered.addEventListener('click', () => {
            redoIncorrectIds = [];
            unansweredIds = questions.filter(q => userAnswers[q.id] === undefined).map(q => q.id);
            setReviewMode('unanswered');
        });

        // Reset
        els.btnResetAll.addEventListener('click', resetAll);
        els.btnResetIncorrect.addEventListener('click', resetIncorrect);
        els.btnResetCorrect.addEventListener('click', resetCorrect);

        // Keyboard
        document.addEventListener('keydown', handleKeyboard);

        // Swipe
        const quizContainer = document.querySelector('.quiz-container');
        quizContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
        quizContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Quiz selector (trỏ index.html để chạy được cả ở dev server lẫn GitHub Pages)
        const selectQuiz = $('selectQuiz');
        if (selectQuiz) {
            selectQuiz.addEventListener('change', (e) => {
                const targetQuiz = e.target.value;
                window.location.href = `/quizzes/${targetQuiz}/index.html`;
            });
        }
    }

    // Dựng dropdown chọn bộ đề từ manifest (sinh bởi scripts/generate_quiz_manifest.mjs)
    async function populateQuizSelect() {
        const sel = $('selectQuiz');
        if (!sel) return;
        try {
            const res = await fetch('/quizzes/manifest.json');
            if (!res.ok) return;
            const list = await res.json();
            if (!Array.isArray(list) || list.length === 0) return;
            const groups = new Map();
            list.forEach(q => {
                if (!groups.has(q.provider)) groups.set(q.provider, []);
                groups.get(q.provider).push(q);
            });
            sel.innerHTML = '';
            groups.forEach((items, provider) => {
                const og = document.createElement('optgroup');
                og.label = provider;
                items.forEach(q => {
                    const o = document.createElement('option');
                    o.value = q.id;
                    o.textContent = q.vi ? q.name + ' — tiếng Việt' : q.name;
                    og.appendChild(o);
                });
                sel.appendChild(og);
            });
            sel.value = quizId;
        } catch (e) { /* giữ options tĩnh trong HTML */ }
    }

    // ========================
    // Init
    // ========================
    async function init() {
        try {
            const normalizeQ = q => {
                let ans = q.answer || '';
                let isMulti = q.isMulti;
                if (ans.length > 1 && !ans.includes(',')) {
                    ans = ans.split('').join(',');
                }
                if (ans.includes(',')) {
                    isMulti = true;
                }
                return { ...q, answer: ans, isMulti };
            };
            
            if (typeof QUESTIONS_DATA !== 'undefined') {
                questions = QUESTIONS_DATA.map(normalizeQ);
            } else {
                const response = await fetch(`/quizzes/${quizId}/questions.json`);
                const data = await response.json();
                const questionsArray = Array.isArray(data) ? data : (data.questions || []);
                questions = questionsArray.map(normalizeQ);
            }
        } catch (err) {
            console.error('Failed to load questions.json:', err);
            els.questionText.innerHTML = '<span style="color:red">Lỗi tải dữ liệu câu hỏi. Vui lòng thử lại.</span>';
            return;
        }

        questionOrder = questions.map((_, i) => i);
        
        loadState();

        // Kiểm tra xem bộ đề này có dữ liệu tiếng Việt hay không
        const hasVi = questions.some(q => q.question_vi || (q.options_vi && Object.keys(q.options_vi).length > 0) || q.explanation_vi);
        if (!hasVi) {
            if (els.btnViToggle) els.btnViToggle.style.display = 'none';
            if (els.toggleVi) {
                const settingRow = els.toggleVi.closest('.setting-item') || els.toggleVi.parentElement;
                if (settingRow) settingRow.style.display = 'none';
            }
            // Nếu không có tiếng Việt, ép tắt showVietnamese
            showVietnamese = false;
        } else {
            if (els.btnViToggle) els.btnViToggle.style.display = '';
            if (els.toggleVi) {
                const settingRow = els.toggleVi.closest('.setting-item') || els.toggleVi.parentElement;
                if (settingRow) settingRow.style.display = '';
            }
        }

        // Initialize question order based on shuffleMode and loaded state
        if (shuffleMode) {
            if (!questionOrder || questionOrder.length !== questions.length) {
                questionOrder = shuffleArray(questions.map((_, i) => i));
                currentIndex = 0;
            }
        } else {
            questionOrder = questions.map((_, i) => i);
        }

        els.btnViToggle.classList.toggle('active', showVietnamese);
        els.toggleVi.checked = showVietnamese;
        els.btnShuffle.classList.toggle('active', shuffleMode);
        els.toggleShuffle.checked = shuffleMode;

        // Dựng danh sách bộ đề từ manifest rồi chọn quiz hiện tại
        populateQuizSelect();

        // Cập nhật trạng thái active cho menu review
        els.btnReviewAll.classList.toggle('active', filterMode === 'all');
        els.btnReviewCorrect.classList.toggle('active', filterMode === 'correct');
        els.btnReviewIncorrect.classList.toggle('active', filterMode === 'incorrect');
        if (els.btnRedoIncorrect) els.btnRedoIncorrect.classList.toggle('active', filterMode === 'redo_incorrect');
        els.btnReviewUnanswered.classList.toggle('active', filterMode === 'unanswered');

        updateScores();
        renderQuestion();
        renderGrid(filterMode);
        bindEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
