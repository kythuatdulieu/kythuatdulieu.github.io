/**
 * Quiz App - Certified Data Engineer Professional
 * Core quiz engine with navigation, scoring, review modes, Vietnamese toggle, and theme switching.
 */
(function () {
    'use strict';

    // ========================
    // State
    // ========================
    // Dynamically load the STATE_KEY based on the path
    const quizId = window.location.pathname.split('/').filter(Boolean).pop() || 'quiz';
    const STATE_KEY = `quiz_state_${quizId}_v1`;

    let questions = [];
    let questionOrder = [];
    let currentIndex = 0;
    let userAnswers = {};
    let showVietnamese = false;
    let showImage = false;
    let shuffleMode = false;
    let filterMode = 'all';
    let darkTheme = false; // Default to Light theme as per GenAI Associate style

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
        btnTheme: $('btnTheme'),
        themeIconSun: $('themeIconSun'),
        themeIconMoon: $('themeIconMoon'),
        btnMenu: $('btnMenu'),
        sidePanel: $('sidePanel'),
        overlay: $('overlay'),
        btnClosePanel: $('btnClosePanel'),
        gridModal: $('gridModal'),
        questionGrid: $('questionGrid'),
        btnCloseGrid: $('btnCloseGrid'),
        toggleVi: $('toggleVi'),
        toggleShuffle: $('toggleShuffle'),
        toggleTheme: $('toggleTheme'),
        statCorrect: $('statCorrect'),
        statIncorrect: $('statIncorrect'),
        statUnanswered: $('statUnanswered'),
        statTotal: $('statTotal'),
        countAll: $('countAll'),
        countCorrect: $('countCorrect'),
        countIncorrect: $('countIncorrect'),
        countUnanswered: $('countUnanswered'),
        btnReviewAll: $('btnReviewAll'),
        btnReviewCorrect: $('btnReviewCorrect'),
        btnReviewIncorrect: $('btnReviewIncorrect'),
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
                darkTheme,
                currentIndex,
                filterMode,
                questionOrder: shuffleMode ? questionOrder : null,
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
            darkTheme = state.darkTheme !== undefined ? state.darkTheme : true;
            currentIndex = state.currentIndex || 0;
            filterMode = state.filterMode || 'all';
            if (state.questionOrder && shuffleMode) {
                questionOrder = state.questionOrder;
            }
        } catch (e) { /* ignore */ }
    }

    // ========================
    // Theme
    // ========================
    function applyTheme() {
        if (darkTheme) {
            document.documentElement.removeAttribute('data-theme');
            els.themeIconSun.style.display = '';
            els.themeIconMoon.style.display = 'none';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            els.themeIconSun.style.display = 'none';
            els.themeIconMoon.style.display = '';
        }
        if (els.toggleTheme) els.toggleTheme.checked = !darkTheme;
    }

    function toggleTheme() {
        darkTheme = !darkTheme;
        applyTheme();
        showToast(darkTheme ? '🌙 Giao diện tối' : '☀️ Giao diện sáng');
        saveState();
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
        } else if (filterMode === 'unanswered') {
            indices = indices.filter(i => userAnswers[questions[i].id] === undefined);
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

    // ========================
    // Rendering
    // ========================
    function renderQuestion() {
        const filtered = getFilteredIndices();
        if (filtered.length === 0) {
            els.questionBadge.textContent = 'Không có câu hỏi';
            els.topicBadge.textContent = '';
            els.questionText.textContent = filterMode === 'correct' ? 'Chưa có câu trả lời đúng nào.' :
                filterMode === 'incorrect' ? 'Chưa có câu trả lời sai nào.' :
                    filterMode === 'unanswered' ? 'Đã hoàn thành tất cả câu hỏi! 🎉' :
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
                els.btnPdf.disabled = false;
                const pdfPath = encodeURI('Certified Data Engineer Professional_Answers_new.pdf');
                els.btnPdf.onclick = () => window.open(`${pdfPath}#page=${q.page}`, '_blank');
            } else {
                els.btnPdf.disabled = true;
                els.btnPdf.onclick = null;
            }
        }

        if (els.questionImageBox && els.questionImage) {
            if (q.image && showImage) {
                els.questionImage.src = q.image;
                els.questionImageBox.style.display = 'block';
            } else {
                els.questionImageBox.style.display = 'none';
                els.questionImage.removeAttribute('src');
            }
        }

        // Counter
        els.questionCounter.textContent = `${currentIndex + 1} / ${filtered.length}`;

        // Badge
        els.questionBadge.textContent = `Question #${q.id}`;
        els.topicBadge.textContent = `Topic ${q.topic}`;

        // Question text
        els.questionText.textContent = q.question;

        // Vietnamese question text
        if (showVietnamese && q.question_vi) {
            els.questionTextVi.textContent = q.question_vi;
            els.questionTextVi.style.display = 'block';
        } else {
            els.questionTextVi.style.display = 'none';
        }

        // Options
        els.optionsList.innerHTML = '';
        const optionLetters = Object.keys(q.options).sort();

        optionLetters.forEach(letter => {
            const div = document.createElement('div');
            div.className = 'option-item';

            if (answered) {
                div.classList.add('disabled');
                if (letter === q.answer) {
                    div.classList.add('correct-answer');
                }
                if (letter === userAns && letter !== q.answer) {
                    div.classList.add('wrong-answer');
                }
            }

            const letterSpan = document.createElement('span');
            letterSpan.className = 'option-letter';
            letterSpan.textContent = letter;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'option-content';

            const textSpan = document.createElement('div');
            textSpan.className = 'option-text';
            textSpan.textContent = q.options[letter];

            if (showVietnamese) {
                const viOpt = getVietnameseOption(q, letter);
                if (viOpt) {
                    const viSpan = document.createElement('div');
                    viSpan.className = 'option-text-vi';
                    viSpan.textContent = viOpt;
                    viSpan.style.display = 'block';
                    textSpan.appendChild(viSpan);
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

        // Explanation — shown after answering
        let explanationDiv = document.getElementById('explanationBox');
        if (!explanationDiv) {
            explanationDiv = document.createElement('div');
            explanationDiv.id = 'explanationBox';
            explanationDiv.className = 'explanation-box';
            els.optionsList.parentNode.insertBefore(explanationDiv, els.optionsList.nextSibling);
        }

        if (answered && q.explanation_vi) {
            explanationDiv.innerHTML = '';
            const title = document.createElement('div');
            title.className = 'explanation-title';
            title.textContent = '💡 Giải thích';
            explanationDiv.appendChild(title);
            const body = document.createElement('pre');
            body.className = 'explanation-body';
            body.textContent = q.explanation_vi;
            explanationDiv.appendChild(body);
            explanationDiv.style.display = 'block';
        } else {
            explanationDiv.style.display = 'none';
        }



        // Animate card
        els.questionCard.style.animation = 'none';
        requestAnimationFrame(() => {
            els.questionCard.style.animation = 'fadeInUp 0.3s ease';
        });

        saveState();
    }

    function selectAnswer(qId, letter) {
        userAnswers[qId] = letter;
        updateScores();
        renderQuestion();
        saveState();
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
        }
    }

    function goPrev() {
        if (currentIndex > 0) {
            currentIndex--;
            showImage = false;
            renderQuestion();
        }
    }

    function goToQuestion(idx) {
        currentIndex = idx;
        renderQuestion();
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
        applyShuffle();
        renderQuestion();
        showToast(on ? '🔀 Đã bật xáo trộn' : '📋 Thứ tự gốc');
        saveState();
    }

    // ========================
    // Review Modes
    // ========================
    function setReviewMode(mode) {
        filterMode = mode;
        currentIndex = 0;
        renderQuestion();
        closePanel();
        const labels = {
            all: '📋 Tất cả câu hỏi',
            correct: '✅ Câu trả lời đúng',
            incorrect: '❌ Câu trả lời sai',
            unanswered: '⬜ Câu chưa làm',
        };
        showToast(labels[mode] || mode);
        saveState();
    }

    // ========================
    // Reset
    // ========================
    function resetAll() {
        if (!confirm('Bạn có chắc muốn reset tất cả? Mọi tiến trình sẽ bị xóa.')) return;
        userAnswers = {};
        currentIndex = 0;
        filterMode = 'all';
        updateScores();
        renderQuestion();
        closePanel();
        showToast('🔄 Đã reset tất cả');
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

        // Theme toggle
        els.btnTheme.addEventListener('click', toggleTheme);
        if (els.toggleTheme) {
            els.toggleTheme.addEventListener('change', () => toggleTheme());
        }

        // Shuffle toggle
        els.btnShuffle.addEventListener('click', () => toggleShuffleMode(!shuffleMode));
        els.toggleShuffle.addEventListener('change', (e) => toggleShuffleMode(e.target.checked));

        // Review modes
        els.btnReviewAll.addEventListener('click', () => setReviewMode('all'));
        els.btnReviewCorrect.addEventListener('click', () => setReviewMode('correct'));
        els.btnReviewIncorrect.addEventListener('click', () => setReviewMode('incorrect'));
        els.btnReviewUnanswered.addEventListener('click', () => setReviewMode('unanswered'));

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
    }

    // ========================
    // Init
    // ========================
    async function init() {
        try {
            // Check if questions are already embedded (legacy support) or if we need to fetch
            if (typeof QUESTIONS_DATA !== 'undefined') {
                questions = QUESTIONS_DATA.map(q => ({ ...q }));
            } else {
                const response = await fetch('questions.json');
                const data = await response.json();
                questions = data.map(q => ({ ...q }));
            }
        } catch (err) {
            console.error('Failed to load questions.json:', err);
            els.questionText.innerHTML = '<span style="color:red">Lỗi tải dữ liệu câu hỏi. Vui lòng thử lại.</span>';
            return;
        }

        questionOrder = questions.map((_, i) => i);
        
        loadState();

        // Apply saved UI states
        applyTheme();
        els.btnViToggle.classList.toggle('active', showVietnamese);
        els.toggleVi.checked = showVietnamese;
        els.btnShuffle.classList.toggle('active', shuffleMode);
        els.toggleShuffle.checked = shuffleMode;

        if (!shuffleMode) {
            questionOrder = questions.map((_, i) => i);
        }

        updateScores();
        renderQuestion();
        bindEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
