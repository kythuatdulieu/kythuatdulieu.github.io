document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const elements = {
        loadingState: document.getElementById('loading-state'),
        questionSection: document.getElementById('question-section'),
        explanationSection: document.getElementById('explanation-section'),
        completionSection: document.getElementById('completion-section'),
        
        questionPromptEn: document.getElementById('question-prompt-en'),
        questionPromptVi: document.getElementById('question-prompt-vi'),
        optionsContainer: document.getElementById('options-container'),
        questionTypeBadge: document.getElementById('question-type-badge'),
        questionNumberBadge: document.getElementById('question-number-badge'),
        translateToggleBtn: document.getElementById('translate-toggle-btn'),
        
        explanationContent: document.getElementById('explanation-content'),
        referencesContainer: document.getElementById('references-container'),
        referencesList: document.getElementById('references-list'),
        
        submitBtn: document.getElementById('submit-btn'),
        nextBtn: document.getElementById('next-btn'),
        prevBtn: document.getElementById('prev-btn'),
        resetProgressBtn: document.getElementById('reset-progress-btn'),
        
        questionJump: document.getElementById('question-jump'),
        scoreCounter: document.getElementById('score-counter'),
        progressBar: document.getElementById('progress-bar'),
        finalScoreValue: document.getElementById('final-score-value')
    };

    // State
    let quizData = [];
    let state = {
        currentQuestionIndex: 0,
        score: 0,
        answers: {}, // index -> Set of selected options
        submitted: {}, // index -> boolean
        showTranslation: false
    };

    // Initialization
    async function init() {
        try {
            // Load state from cache if exists
            const cachedState = localStorage.getItem('genai_quiz_state');
            if (cachedState) {
                const parsed = JSON.parse(cachedState);
                state.currentQuestionIndex = parsed.currentQuestionIndex || 0;
                state.score = parsed.score || 0;
                state.showTranslation = parsed.showTranslation || false;
                
                // Reconstruct Sets
                state.answers = {};
                for (const [k, v] of Object.entries(parsed.answers || {})) {
                    state.answers[k] = new Set(v);
                }
                state.submitted = parsed.submitted || {};
            }

            const response = await fetch('data.json?v=' + new Date().getTime());
            if (!response.ok) throw new Error('Không thể tải dữ liệu');
            
            const data = await response.json();
            // We do NOT shuffle to keep navigation indices consistent with cache
            quizData = data.questions;
            
            initJumpSelect();
            
            elements.loadingState.classList.add('hidden');
            elements.questionSection.classList.remove('hidden');
            
            loadQuestion();
        } catch (error) {
            console.error('Error loading data:', error);
            elements.loadingState.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: var(--danger)"></i>
                <p>Lỗi tải dữ liệu: ${error.message}</p>
                <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 1rem;">Hãy xóa Cache trình duyệt và thử lại.</p>
            `;
        }
    }

    function initJumpSelect() {
        elements.questionJump.innerHTML = '';
        quizData.forEach((_, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = `Câu hỏi ${index + 1} / ${quizData.length}`;
            elements.questionJump.appendChild(opt);
        });
        
        elements.questionJump.addEventListener('change', (e) => {
            state.currentQuestionIndex = parseInt(e.target.value);
            loadQuestion();
        });
    }

    function saveState() {
        const stateToSave = {
            currentQuestionIndex: state.currentQuestionIndex,
            score: state.score,
            showTranslation: state.showTranslation,
            answers: {},
            submitted: state.submitted
        };
        
        for (const [k, v] of Object.entries(state.answers)) {
            stateToSave.answers[k] = Array.from(v);
        }
        
        localStorage.setItem('genai_quiz_state', JSON.stringify(stateToSave));
    }

    function resetState() {
        localStorage.removeItem('genai_quiz_state');
        state = {
            currentQuestionIndex: 0,
            score: 0,
            answers: {},
            submitted: {},
            showTranslation: false
        };
        elements.completionSection.classList.add('hidden');
        elements.questionSection.classList.remove('hidden');
        loadQuestion();
    }

    // Load a question
    function loadQuestion() {
        if (state.currentQuestionIndex >= quizData.length) {
            showCompletion();
            return;
        }

        const question = quizData[state.currentQuestionIndex];
        const isSubmitted = state.submitted[state.currentQuestionIndex] || false;
        
        if (!state.answers[state.currentQuestionIndex]) {
            state.answers[state.currentQuestionIndex] = new Set();
        }
        
        const selectedOptions = state.answers[state.currentQuestionIndex];
        
        // Update UI state
        elements.questionJump.value = state.currentQuestionIndex;
        elements.prevBtn.disabled = state.currentQuestionIndex === 0;
        
        if (isSubmitted) {
            elements.submitBtn.classList.add('hidden');
            elements.nextBtn.classList.remove('hidden');
        } else {
            elements.submitBtn.classList.remove('hidden');
            elements.nextBtn.classList.add('hidden');
            elements.submitBtn.disabled = selectedOptions.size === 0;
        }
        
        elements.explanationSection.classList.add('hidden');
        
        // Update stats
        updateStats();
        
        // Set question badge
        elements.questionNumberBadge.textContent = `Câu ${state.currentQuestionIndex + 1}`;
        const isMultiple = question.type === 'multiple_choice';
        elements.questionTypeBadge.textContent = isMultiple ? 'Multiple Choice' : 'Single Choice';
        
        // Set Prompts using marked.js
        elements.questionPromptEn.innerHTML = marked.parse(question.prompt_en || question.prompt || '');
        elements.questionPromptVi.innerHTML = marked.parse(question.prompt_vi || '');
        
        applyTranslationState();
        
        // Render options
        elements.optionsContainer.innerHTML = '';
        const optionsEn = question.options_en || question.options;
        const optionsVi = question.options_vi || question.options;
        
        optionsEn.forEach((optionEnText, index) => {
            const optionViText = optionsVi[index];
            const optionEl = document.createElement('div');
            optionEl.className = 'option';
            optionEl.dataset.index = index;
            
            if (selectedOptions.has(index)) {
                optionEl.classList.add('selected');
            }
            
            const iconClass = isMultiple ? 'fa-check' : 'fa-circle';
            const borderRadius = isMultiple ? '6px' : '50%';
            
            optionEl.innerHTML = `
                <div class="option-checkbox" style="border-radius: ${borderRadius}">
                    <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="option-content">
                    <div class="option-text-en markdown-body">${marked.parseInline(optionEnText)}</div>
                    <div class="option-text-vi markdown-body ${state.showTranslation ? '' : 'hidden'}">${marked.parseInline(optionViText)}</div>
                </div>
            `;
            
            if (!isSubmitted) {
                optionEl.addEventListener('click', () => handleOptionClick(index, optionEl, isMultiple));
            }
            elements.optionsContainer.appendChild(optionEl);
        });

        if (isSubmitted) {
            highlightCorrectOptions(question, selectedOptions);
            showExplanation(question, true);
        }

        saveState();
    }

    function applyTranslationState() {
        if (state.showTranslation) {
            elements.translateToggleBtn.classList.add('active');
            elements.translateToggleBtn.innerHTML = '<i class="fa-solid fa-lightbulb"></i> Ẩn Gợi ý';
            elements.questionPromptVi.classList.remove('hidden');
            document.querySelectorAll('.option-text-vi').forEach(el => el.classList.remove('hidden'));
        } else {
            elements.translateToggleBtn.classList.remove('active');
            elements.translateToggleBtn.innerHTML = '<i class="fa-solid fa-lightbulb"></i> Gợi ý & Dịch thuật';
            elements.questionPromptVi.classList.add('hidden');
            document.querySelectorAll('.option-text-vi').forEach(el => el.classList.add('hidden'));
        }
    }

    function toggleTranslation() {
        state.showTranslation = !state.showTranslation;
        applyTranslationState();
        saveState();
    }

    function handleOptionClick(index, optionEl, isMultiple) {
        const selectedOptions = state.answers[state.currentQuestionIndex];
        
        if (isMultiple) {
            if (selectedOptions.has(index)) {
                selectedOptions.delete(index);
                optionEl.classList.remove('selected');
            } else {
                selectedOptions.add(index);
                optionEl.classList.add('selected');
            }
        } else {
            selectedOptions.clear();
            document.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
            selectedOptions.add(index);
            optionEl.classList.add('selected');
        }
        
        elements.submitBtn.disabled = selectedOptions.size === 0;
        saveState();
    }

    function submitAnswer() {
        const selectedOptions = state.answers[state.currentQuestionIndex];
        if (selectedOptions.size === 0 || state.submitted[state.currentQuestionIndex]) return;
        
        state.submitted[state.currentQuestionIndex] = true;
        elements.submitBtn.classList.add('hidden');
        elements.nextBtn.classList.remove('hidden');
        
        const question = quizData[state.currentQuestionIndex];
        const correctIndexes = question.correct_option_indexes;
        
        let isCorrect = true;
        if (selectedOptions.size !== correctIndexes.length) {
            isCorrect = false;
        } else {
            for (let idx of selectedOptions) {
                if (!correctIndexes.includes(idx)) {
                    isCorrect = false;
                    break;
                }
            }
        }
        
        if (isCorrect) state.score++;
        
        highlightCorrectOptions(question, selectedOptions);
        showExplanation(question, false); // false = scroll to it
        updateStats();
        saveState();
    }

    function highlightCorrectOptions(question, selectedOptions) {
        const correctIndexes = question.correct_option_indexes;
        
        document.querySelectorAll('.option').forEach(el => {
            const idx = parseInt(el.dataset.index);
            const isSelected = selectedOptions.has(idx);
            const isActuallyCorrect = correctIndexes.includes(idx);
            
            const icon = el.querySelector('.option-checkbox i');
            
            if (isActuallyCorrect) {
                el.classList.add('correct');
                icon.className = 'fa-solid fa-check';
            } else if (isSelected && !isActuallyCorrect) {
                el.classList.add('incorrect');
                icon.className = 'fa-solid fa-xmark';
            }
            
            if (!isSelected && !isActuallyCorrect) {
                el.style.opacity = '0.5';
            }
            
            // disable pointer events
            el.style.pointerEvents = 'none';
        });
    }

    function showExplanation(question, isRestoring) {
        elements.explanationSection.classList.remove('hidden');
        
        const selectedOptions = state.answers[state.currentQuestionIndex];
        const correctIndexes = question.correct_option_indexes;
        let isCorrect = selectedOptions.size === correctIndexes.length && Array.from(selectedOptions).every(idx => correctIndexes.includes(idx));
        
        const headerIcon = elements.explanationSection.querySelector('.explanation-header i');
        const headerText = elements.explanationSection.querySelector('h3');
        
        if (isCorrect) {
            headerIcon.className = 'fa-solid fa-circle-check';
            headerIcon.style.color = 'var(--success)';
            headerText.style.color = 'var(--success)';
        } else {
            headerIcon.className = 'fa-solid fa-circle-xmark';
            headerIcon.style.color = 'var(--danger)';
            headerText.style.color = 'var(--danger)';
        }
        
        const text = question.explanation_vn || 'Không có giải thích chi tiết cho câu hỏi này.';
        elements.explanationContent.innerHTML = marked.parse(text);
        
        // Handle References
        if (question.references && question.references.length > 0) {
            elements.referencesContainer.classList.remove('hidden');
            elements.referencesList.innerHTML = '';
            question.references.forEach(ref => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.title || ref.url}</a>`;
                elements.referencesList.appendChild(li);
            });
        } else {
            elements.referencesContainer.classList.add('hidden');
        }
        
        if (!isRestoring) {
            setTimeout(() => {
                elements.explanationSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }

    function nextQuestion() {
        state.currentQuestionIndex++;
        loadQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    function prevQuestion() {
        if (state.currentQuestionIndex > 0) {
            state.currentQuestionIndex--;
            loadQuestion();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function showCompletion() {
        elements.questionSection.classList.add('hidden');
        elements.explanationSection.classList.add('hidden');
        elements.completionSection.classList.remove('hidden');
        
        const percentage = Math.round((state.score / quizData.length) * 100);
        let currentScore = 0;
        const interval = setInterval(() => {
            currentScore += 1;
            elements.finalScoreValue.textContent = currentScore;
            if (currentScore >= percentage) {
                clearInterval(interval);
                elements.finalScoreValue.textContent = percentage;
            }
        }, 20);
        
        const scoreEl = document.querySelector('.final-score');
        if (percentage >= 80) {
            scoreEl.style.color = 'var(--success)';
        } else if (percentage >= 50) {
            scoreEl.style.color = 'var(--warning)';
        } else {
            scoreEl.style.color = 'var(--danger)';
        }
    }

    function updateStats() {
        elements.scoreCounter.innerHTML = `<i class="fa-solid fa-star" style="color: var(--warning)"></i> Điểm: ${state.score}`;
        const progress = (state.currentQuestionIndex / quizData.length) * 100;
        elements.progressBar.style.width = `${progress}%`;
    }

    // Event Listeners
    elements.submitBtn.addEventListener('click', submitAnswer);
    elements.nextBtn.addEventListener('click', nextQuestion);
    elements.prevBtn.addEventListener('click', prevQuestion);
    elements.resetProgressBtn.addEventListener('click', resetState);
    elements.translateToggleBtn.addEventListener('click', toggleTranslation);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (!elements.submitBtn.disabled && !elements.submitBtn.classList.contains('hidden')) {
                submitAnswer();
            } else if (!elements.nextBtn.classList.contains('hidden')) {
                nextQuestion();
            }
        }
    });

    // Start
    init();
});
