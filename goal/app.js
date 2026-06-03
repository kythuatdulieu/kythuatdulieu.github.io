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
        translateToggleBtn: document.getElementById('translate-toggle-btn'),
        
        explanationContent: document.getElementById('explanation-content'),
        
        submitBtn: document.getElementById('submit-btn'),
        nextBtn: document.getElementById('next-btn'),
        restartBtn: document.getElementById('restart-btn'),
        
        questionCounter: document.getElementById('question-counter'),
        scoreCounter: document.getElementById('score-counter'),
        progressBar: document.getElementById('progress-bar'),
        finalScoreValue: document.getElementById('final-score-value')
    };

    // State
    let quizData = [];
    let currentQuestionIndex = 0;
    let selectedOptions = new Set();
    let score = 0;
    let isAnswerSubmitted = false;
    let showTranslation = false;

    // Initialization
    async function init() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Không thể tải dữ liệu');
            
            const data = await response.json();
            // Shuffle questions
            quizData = shuffleArray(data.questions);
            
            elements.loadingState.classList.add('hidden');
            elements.questionSection.classList.remove('hidden');
            
            loadQuestion();
        } catch (error) {
            console.error('Error loading data:', error);
            elements.loadingState.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: var(--danger)"></i>
                <p>Lỗi tải dữ liệu. Vui lòng thử lại sau.</p>
            `;
        }
    }

    // Load a question
    function loadQuestion() {
        const question = quizData[currentQuestionIndex];
        isAnswerSubmitted = false;
        selectedOptions.clear();
        
        // Update UI state
        elements.submitBtn.disabled = true;
        elements.submitBtn.classList.remove('hidden');
        elements.nextBtn.classList.add('hidden');
        elements.explanationSection.classList.add('hidden');
        
        // Update stats
        updateStats();
        
        // Set question type badge
        const isMultiple = question.type === 'multiple_choice';
        elements.questionTypeBadge.textContent = isMultiple ? 'Multiple Choice' : 'Single Choice';
        elements.questionTypeBadge.style.backgroundColor = isMultiple ? 'rgba(236, 72, 153, 0.2)' : 'rgba(99, 102, 241, 0.2)';
        elements.questionTypeBadge.style.color = isMultiple ? '#f9a8d4' : '#a5b4fc';
        elements.questionTypeBadge.style.borderColor = isMultiple ? 'rgba(236, 72, 153, 0.3)' : 'rgba(99, 102, 241, 0.3)';
        
        // Set Prompts (English by default, Vietnamese hidden unless toggled)
        elements.questionPromptEn.textContent = question.prompt_en || question.prompt;
        elements.questionPromptVi.textContent = question.prompt_vi || '';
        
        if (showTranslation) {
            elements.questionPromptVi.classList.remove('hidden');
        } else {
            elements.questionPromptVi.classList.add('hidden');
        }
        
        // Render options
        elements.optionsContainer.innerHTML = '';
        const optionsEn = question.options_en || question.options;
        const optionsVi = question.options_vi || question.options;
        
        optionsEn.forEach((optionEnText, index) => {
            const optionViText = optionsVi[index];
            const optionEl = document.createElement('div');
            optionEl.className = 'option';
            optionEl.dataset.index = index;
            
            const iconClass = isMultiple ? 'fa-check' : 'fa-circle';
            const borderRadius = isMultiple ? '6px' : '50%';
            
            optionEl.innerHTML = `
                <div class="option-checkbox" style="border-radius: ${borderRadius}">
                    <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="option-content">
                    <div class="option-text-en">${formatText(optionEnText)}</div>
                    <div class="option-text-vi ${showTranslation ? '' : 'hidden'}">${formatText(optionViText)}</div>
                </div>
            `;
            
            optionEl.addEventListener('click', () => handleOptionClick(index, optionEl, isMultiple));
            elements.optionsContainer.appendChild(optionEl);
        });
    }

    // Toggle Translation
    function toggleTranslation() {
        showTranslation = !showTranslation;
        
        if (showTranslation) {
            elements.translateToggleBtn.classList.add('active');
            elements.translateToggleBtn.innerHTML = '<i class="fa-solid fa-language"></i> Ẩn Tiếng Việt';
            elements.questionPromptVi.classList.remove('hidden');
            document.querySelectorAll('.option-text-vi').forEach(el => el.classList.remove('hidden'));
        } else {
            elements.translateToggleBtn.classList.remove('active');
            elements.translateToggleBtn.innerHTML = '<i class="fa-solid fa-language"></i> Hiển thị Tiếng Việt';
            elements.questionPromptVi.classList.add('hidden');
            document.querySelectorAll('.option-text-vi').forEach(el => el.classList.add('hidden'));
        }
    }

    // Handle option selection
    function handleOptionClick(index, optionEl, isMultiple) {
        if (isAnswerSubmitted) return;
        
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
    }

    // Submit answer
    function submitAnswer() {
        if (selectedOptions.size === 0 || isAnswerSubmitted) return;
        
        isAnswerSubmitted = true;
        elements.submitBtn.classList.add('hidden');
        elements.nextBtn.classList.remove('hidden');
        
        const question = quizData[currentQuestionIndex];
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
        
        if (isCorrect) score++;
        
        // Highlight options
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
        });
        
        showExplanation(question.explanation_vn, isCorrect);
        updateStats();
    }

    // Show Explanation
    function showExplanation(text, isCorrect) {
        elements.explanationSection.classList.remove('hidden');
        
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
        
        const formattedText = formatText(text || 'Không có giải thích chi tiết cho câu hỏi này.');
        elements.explanationContent.innerHTML = formattedText;
        
        setTimeout(() => {
            elements.explanationSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    // Next Question
    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            loadQuestion();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showCompletion();
        }
    }

    function showCompletion() {
        elements.questionSection.classList.add('hidden');
        elements.explanationSection.classList.add('hidden');
        elements.completionSection.classList.remove('hidden');
        
        const percentage = Math.round((score / quizData.length) * 100);
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
            scoreEl.style.textShadow = '0 0 30px rgba(16, 185, 129, 0.4)';
        } else if (percentage >= 50) {
            scoreEl.style.color = 'var(--warning)';
            scoreEl.style.textShadow = '0 0 30px rgba(245, 158, 11, 0.4)';
        } else {
            scoreEl.style.color = 'var(--danger)';
            scoreEl.style.textShadow = '0 0 30px rgba(239, 68, 68, 0.4)';
        }
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        quizData = shuffleArray(quizData);
        
        elements.completionSection.classList.add('hidden');
        elements.questionSection.classList.remove('hidden');
        
        loadQuestion();
    }

    function updateStats() {
        elements.questionCounter.textContent = \`Câu hỏi \${currentQuestionIndex + 1} / \${quizData.length}\`;
        elements.scoreCounter.innerHTML = \`<i class="fa-solid fa-star" style="color: #fcd34d"></i> Điểm: \${score}\`;
        const progress = ((currentQuestionIndex) / quizData.length) * 100;
        elements.progressBar.style.width = \`\${progress}%\`;
    }

    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    function formatText(text) {
        if (!text) return '';
        let html = text
            .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
            .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
            .replace(/\`([^\`]+)\`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 4px;border-radius:4px;font-family:monospace;">$1</code>');
            
        const lines = html.split('\\n');
        let inList = false;
        let result = '';
        
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            if (line.startsWith('- ') || line.startsWith('* ')) {
                if (!inList) {
                    result += '<ul>';
                    inList = true;
                }
                result += \`<li>\${line.substring(2)}</li>\`;
            } else {
                if (inList) {
                    result += '</ul>';
                    inList = false;
                }
                result += \`<p>\${line}</p>\`;
            }
        }
        if (inList) result += '</ul>';
        return result;
    }

    // Event Listeners
    elements.submitBtn.addEventListener('click', submitAnswer);
    elements.nextBtn.addEventListener('click', nextQuestion);
    elements.restartBtn.addEventListener('click', restartQuiz);
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
