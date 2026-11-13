/**
 * भारतीय राजव्यवस्था (Indian Polity) 841 PYQ Exam Studio & Engine
 * Senior UI/UX Lead Redesign
 */

(function () {
  'use strict';

  // ============================================================================
  // APP STATE
  // ============================================================================
  const state = {
    rawBankData: null,
    allChapters: [],
    selectedChapterIds: new Set(),
    activeCategoryFilter: 'all',
    
    config: {
      questionLimit: 'all',
      timePerQuestionMin: 1.0,
      negativeMarking: 0.25,
      shuffleQuestions: true
    },
    
    quiz: {
      questions: [],
      currentIndex: 0,
      userAnswers: [],
      timerSecondsRemaining: 0,
      totalTimeSeconds: 0,
      timerInterval: null,
      isSubmitted: false,
      paletteFilter: 'all'
    },
    
    evaluation: {
      score: 0,
      accuracy: 0,
      correctCount: 0,
      wrongCount: 0,
      skippedCount: 0,
      chapterStats: {},
      reviewIndex: 0,
      reviewFilter: 'all',
      filteredReviewIndices: []
    },
    
    ui: {
      theme: localStorage.getItem('polity_quiz_theme') || 'dark',
      fontSizeRem: 1.05
    }
  };

  // ============================================================================
  // DOM REFERENCES
  // ============================================================================
  const dom = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeToggleText: document.getElementById('themeToggleText'),
    toastContainer: document.getElementById('toastContainer'),
    metaTotalBankBadge: document.getElementById('metaTotalBankBadge'),

    // Chapter Selection Studio
    chapterSearchInput: document.getElementById('chapterSearchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    selectAllChaptersBtn: document.getElementById('selectAllChaptersBtn'),
    deselectAllChaptersBtn: document.getElementById('deselectAllChaptersBtn'),
    selectCorePolityBtn: document.getElementById('selectCorePolityBtn'),
    chaptersGrid: document.getElementById('chaptersGrid'),
    selectedChaptersBadge: document.getElementById('selectedChaptersBadge'),
    selectedQuestionsBadge: document.getElementById('selectedQuestionsBadge'),
    selectionProgressBar: document.getElementById('selectionProgressBar'),
    selectionHelperNote: document.getElementById('selectionHelperNote'),
    stepIndicator1: document.getElementById('stepIndicator1'),
    step1SubText: document.getElementById('step1SubText'),
    startQuizBtn: document.getElementById('startQuizBtn'),
    cfgShuffle: document.getElementById('cfgShuffle'),

    // Quiz Engine
    examSubTitle: document.getElementById('examSubTitle'),
    examTimerBox: document.getElementById('examTimerBox'),
    examTimerDisplay: document.getElementById('examTimerDisplay'),
    examThemeToggleBtn: document.getElementById('examThemeToggleBtn'),
    btnFullscreenToggle: document.getElementById('btnFullscreenToggle'),
    btnSubmitTest: document.getElementById('btnSubmitTest'),
    
    qCurrentNumberPill: document.getElementById('qCurrentNumberPill'),
    qMarksPill: document.getElementById('qMarksPill'),
    btnFlagQuestion: document.getElementById('btnFlagQuestion'),
    flagBtnText: document.getElementById('flagBtnText'),
    questionScrollBox: document.getElementById('questionScrollBox'),
    questionBodyMount: document.getElementById('questionBodyMount'),
    optionsContainerMount: document.getElementById('optionsContainerMount'),

    btnClearResponse: document.getElementById('btnClearResponse'),
    btnReviewAndNext: document.getElementById('btnReviewAndNext'),
    btnPrevQuestion: document.getElementById('btnPrevQuestion'),
    btnSaveAndNext: document.getElementById('btnSaveAndNext'),

    cntAnswered: document.getElementById('cntAnswered'),
    cntNotAnswered: document.getElementById('cntNotAnswered'),
    cntNotVisited: document.getElementById('cntNotVisited'),
    cntReview: document.getElementById('cntReview'),
    cntAnsReview: document.getElementById('cntAnsReview'),
    paletteGridMount: document.getElementById('paletteGridMount'),
    paletteTotalQuestions: document.getElementById('paletteTotalQuestions'),
    btnHelpShortcuts: document.getElementById('btnHelpShortcuts'),
    btnToggleMobilePalette: document.getElementById('btnToggleMobilePalette'),
    btnClosePaletteDrawer: document.getElementById('btnClosePaletteDrawer'),
    paletteDrawerBackdrop: document.getElementById('paletteDrawerBackdrop'),
    ntaPaletteAside: document.getElementById('ntaPaletteAside'),

    // Modals
    submitConfirmModal: document.getElementById('submitConfirmModal'),
    btnCloseSubmitModal: document.getElementById('btnCloseSubmitModal'),
    btnResumeTest: document.getElementById('btnResumeTest'),
    btnFinalSubmitConfirm: document.getElementById('btnFinalSubmitConfirm'),
    modalTotalQ: document.getElementById('modalTotalQ'),
    modalAnsQ: document.getElementById('modalAnsQ'),
    modalNotAnsQ: document.getElementById('modalNotAnsQ'),
    modalRevQ: document.getElementById('modalRevQ'),
    modalRemainingTime: document.getElementById('modalRemainingTime'),

    shortcutsModal: document.getElementById('shortcutsModal'),
    btnCloseShortcutsModal: document.getElementById('btnCloseShortcutsModal'),
    btnDismissShortcuts: document.getElementById('btnDismissShortcuts'),

    // Result Dashboard
    resultSubtitle: document.getElementById('resultSubtitle'),
    btnRetakeAll: document.getElementById('btnRetakeAll'),
    btnRetakeWrongOnly: document.getElementById('btnRetakeWrongOnly'),
    btnRetakeWrongText: document.getElementById('btnRetakeWrongText'),
    btnNewTestChapters: document.getElementById('btnNewTestChapters'),
    btnPrintResult: document.getElementById('btnPrintResult'),

    kpiScore: document.getElementById('kpiScore'),
    kpiAccuracy: document.getElementById('kpiAccuracy'),
    kpiCorrect: document.getElementById('kpiCorrect'),
    kpiWrong: document.getElementById('kpiWrong'),
    kpiSkipped: document.getElementById('kpiSkipped'),

    badgeFilterAll: document.getElementById('badgeFilterAll'),
    badgeFilterWrong: document.getElementById('badgeFilterWrong'),
    badgeFilterCorrect: document.getElementById('badgeFilterCorrect'),
    badgeFilterSkipped: document.getElementById('badgeFilterSkipped'),

    revOutcomeBanner: document.getElementById('revOutcomeBanner'),
    revOutcomeText: document.getElementById('revOutcomeText'),
    revTimeSpent: document.getElementById('revTimeSpent'),
    revQIndex: document.getElementById('revQIndex'),
    revChapterName: document.getElementById('revChapterName'),
    revTypeBadge: document.getElementById('revTypeBadge'),
    revQuestionBody: document.getElementById('revQuestionBody'),
    revOptionsList: document.getElementById('revOptionsList'),
    revExplanationText: document.getElementById('revExplanationText'),
    btnRevPrev: document.getElementById('btnRevPrev'),
    btnRevNext: document.getElementById('btnRevNext'),
    revPositionIndicator: document.getElementById('revPositionIndicator'),

    revPaletteCount: document.getElementById('revPaletteCount'),
    revPaletteGrid: document.getElementById('revPaletteGrid'),
    chapterStatTableBody: document.getElementById('chapterStatTableBody')
  };

  // ============================================================================
  // STRICT SCREEN ISOLATION SWITCHER
  // ============================================================================
  function switchView(targetViewId) {
    const viewIds = ['view-chapter-selection', 'view-quiz-engine', 'view-result-evaluation'];
    viewIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === targetViewId) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });

    if (targetViewId === 'view-chapter-selection') {
      window.scrollTo(0, 0);
    }
  }

  // ============================================================================
  // AUDIO FEEDBACK
  // ============================================================================
  const soundEffects = {
    ctx: null,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    },
    click() {
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
      } catch (e) {}
    },
    success() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch (e) {}
    }
  };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  async function initApp() {
    applyTheme(state.ui.theme);
    setupEventListeners();
    switchView('view-chapter-selection');

    if (window.RAW_QUIZ_DATA && window.RAW_QUIZ_DATA.chapters) {
      loadBankData(window.RAW_QUIZ_DATA);
      return;
    }

    try {
      const resp = await fetch('Indian_Polity_PYQ_841_Questions.json');
      if (resp.ok) {
        const jsonData = await resp.json();
        loadBankData(jsonData);
      }
    } catch (err) {
      console.warn('Waiting for data bundle', err);
    }
  }

  function loadBankData(data) {
    state.rawBankData = data;
    state.allChapters = data.chapters || [];
    
    if (dom.metaTotalBankBadge) {
      dom.metaTotalBankBadge.textContent = `${state.allChapters.length} अध्याय • ${data.totalQuestions || 841} प्रश्न`;
    }
    
    renderChapterSelectionGrid();
    updateSelectionBadges();
  }

  // ============================================================================
  // CHAPTER CATALOG & SELECTION LOGIC
  // ============================================================================
  function renderChapterSelectionGrid() {
    dom.chaptersGrid.innerHTML = '';
    const query = (dom.chapterSearchInput.value || '').trim().toLowerCase();
    const cat = state.activeCategoryFilter;

    state.allChapters.forEach((ch) => {
      // Category check
      const chNum = ch.number;
      let inCategory = true;
      if (cat === 'constitution') inCategory = (chNum >= 1 && chNum <= 7);
      else if (cat === 'executive') inCategory = (chNum >= 8 && chNum <= 10);
      else if (cat === 'judiciary') inCategory = (chNum >= 11 && chNum <= 13);
      else if (cat === 'local') inCategory = (chNum >= 14 && chNum <= 18);

      if (!inCategory) return;

      // Search query check
      const titleMatches = !query || ch.title.toLowerCase().includes(query) || (`अध्याय ${chNum}`).includes(query);
      if (!titleMatches) return;

      const isSelected = state.selectedChapterIds.has(ch.id);
      const qCount = ch.questionCount || (ch.questions ? ch.questions.length : 0);

      // Category Section Pill
      let secName = 'संविधान';
      let secClass = 'sec-constitution';
      if (chNum >= 8 && chNum <= 10) {
        secName = 'संघ कार्यपालिका';
        secClass = 'sec-executive';
      } else if (chNum >= 11 && chNum <= 13) {
        secName = 'न्यायपालिका';
        secClass = 'sec-judiciary';
      } else if (chNum >= 14 && chNum <= 18) {
        secName = 'निकाय व आयोग';
        secClass = 'sec-local';
      }

      const card = document.createElement('div');
      card.className = `chapter-item-card ${isSelected ? 'selected' : ''}`;
      card.setAttribute('data-chid', ch.id);

      card.innerHTML = `
        <div class="chapter-card-top">
          <div class="chapter-card-meta-left">
            <span class="chapter-badge-num">अध्याय ${String(chNum).padStart(2, '0')}</span>
            <span class="chapter-sec-pill ${secClass}">${secName}</span>
          </div>
          <div class="chapter-custom-chk ${isSelected ? 'checked' : ''}" aria-label="चयन स्थिति">
            <svg class="chk-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
        <div class="chapter-card-body">
          <h3 class="chapter-title-h3">${escapeHtml(ch.title)}</h3>
        </div>
        <div class="chapter-item-footer">
          <span class="chapter-q-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            <strong>${qCount}</strong> प्रश्न
          </span>
          <span class="chapter-status-indicator ${isSelected ? 'selected' : ''}">
            ${isSelected ? '✓ चयनित' : '+ जोड़ें'}
          </span>
        </div>
      `;

      card.addEventListener('click', () => {
        toggleChapterSelection(ch.id);
        soundEffects.click();
      });

      dom.chaptersGrid.appendChild(card);
    });
  }

  function toggleChapterSelection(chId) {
    if (state.selectedChapterIds.has(chId)) {
      state.selectedChapterIds.delete(chId);
    } else {
      state.selectedChapterIds.add(chId);
    }
    
    const card = dom.chaptersGrid.querySelector(`[data-chid="${chId}"]`);
    if (card) {
      const isSel = state.selectedChapterIds.has(chId);
      card.classList.toggle('selected', isSel);
      const chk = card.querySelector('.chapter-custom-chk');
      if (chk) {
        chk.classList.toggle('checked', isSel);
      }
      const indicator = card.querySelector('.chapter-status-indicator');
      if (indicator) {
        indicator.classList.toggle('selected', isSel);
        indicator.textContent = isSel ? '✓ चयनित' : '+ जोड़ें';
      }
    }

    updateSelectionBadges();
  }

  function updateSelectionBadges() {
    const selectedCount = state.selectedChapterIds.size;
    const totalChapters = state.allChapters.length || 18;
    let availableQuestions = 0;

    state.allChapters.forEach(ch => {
      if (state.selectedChapterIds.has(ch.id)) {
        availableQuestions += (ch.questions ? ch.questions.length : (ch.questionCount || 0));
      }
    });

    if (dom.selectedChaptersBadge) dom.selectedChaptersBadge.textContent = selectedCount;
    if (dom.selectedQuestionsBadge) dom.selectedQuestionsBadge.textContent = availableQuestions;

    const pct = Math.round((selectedCount / totalChapters) * 100);
    if (dom.selectionProgressBar) {
      dom.selectionProgressBar.style.width = `${pct}%`;
    }
    const coverageTxt = document.getElementById('coveragePercentText');
    if (coverageTxt) coverageTxt.textContent = `${pct}%`;

    // Effective question limit
    let effectiveLimit = availableQuestions;
    if (state.config.questionLimit !== 'all') {
      const numLimit = parseInt(state.config.questionLimit, 10);
      effectiveLimit = Math.min(numLimit, availableQuestions);
    }
    const hintPill = document.getElementById('effectiveLimitHint');
    if (hintPill) {
      hintPill.textContent = state.config.questionLimit === 'all' 
        ? `सभी ${effectiveLimit} प्रश्न` 
        : `अधिकतम ${effectiveLimit} प्रश्न`;
    }

    // Live Forecast: Duration & Marks
    const forecastTime = document.getElementById('forecastTime');
    const forecastMarks = document.getElementById('forecastMarks');
    if (selectedCount > 0) {
      if (forecastMarks) forecastMarks.textContent = `अधिकतम: ${effectiveLimit}.0 अंक`;
      if (forecastTime) {
        if (state.config.timePerQuestionMin > 0) {
          const totalMin = Math.round(effectiveLimit * state.config.timePerQuestionMin);
          forecastTime.textContent = totalMin >= 60 
            ? `समय: ${(totalMin / 60).toFixed(1)} घंटे (${totalMin}m)`
            : `समय: ${totalMin} मिनट`;
        } else {
          forecastTime.textContent = 'समय: असीमित (Untimed)';
        }
      }
    } else {
      if (forecastMarks) forecastMarks.textContent = 'अधिकतम: -- अंक';
      if (forecastTime) forecastTime.textContent = 'समय: --';
    }

    if (dom.step1SubText) {
      dom.step1SubText.textContent = selectedCount > 0 ? `${selectedCount} अध्याय (${availableQuestions} प्रश्न) चयनित` : 'कम से कम 1 अध्याय चुनें';
    }

    const stepIndicator2 = document.getElementById('stepIndicator2');
    const stepConn1 = document.getElementById('stepConn1');
    if (stepIndicator2 && stepConn1) {
      if (selectedCount > 0) {
        stepIndicator2.classList.add('active');
        stepConn1.classList.add('active');
      } else {
        stepIndicator2.classList.remove('active');
        stepConn1.classList.remove('active');
      }
    }

    if (dom.selectionHelperNote) {
      if (selectedCount === 0) {
        dom.selectionHelperNote.textContent = '👈 बाईं ओर दिए गए अध्यायों पर क्लिक करके चुनें';
        dom.selectionHelperNote.className = 'selection-helper-note';
      } else {
        dom.selectionHelperNote.textContent = `✓ ${selectedCount} अध्याय तैयार! (${effectiveLimit} प्रश्न शामिल होंगे)`;
        dom.selectionHelperNote.className = 'selection-helper-note ready';
      }
    }

    if (dom.startQuizBtn) {
      dom.startQuizBtn.disabled = selectedCount === 0 || availableQuestions === 0;
      const btnText = document.getElementById('startQuizBtnText') || dom.startQuizBtn.querySelector('span');
      if (btnText) {
        if (selectedCount === 0) {
          btnText.textContent = '⚠️ अध्याय चुनें (कम से कम 1)';
        } else {
          btnText.textContent = `🚀 क्विज़ प्रारंभ करें (${effectiveLimit} प्रश्न) →`;
        }
      }
    }
  }

  function selectAllChapters() {
    state.selectedChapterIds.clear();
    state.allChapters.forEach(ch => state.selectedChapterIds.add(ch.id));
    renderChapterSelectionGrid();
    updateSelectionBadges();
    soundEffects.click();
    showToast('सभी 18 अध्याय चयनित किए गए!', 'success');
  }

  function deselectAllChapters() {
    state.selectedChapterIds.clear();
    renderChapterSelectionGrid();
    updateSelectionBadges();
    soundEffects.click();
    showToast('सभी चयन हटा दिए गए', 'info');
  }

  function selectCoreChapters() {
    // 5 Most prominent chapters in Indian Polity
    const coreIds = ['polity-ch05', 'polity-ch06', 'polity-ch08', 'polity-ch10', 'polity-ch12'];
    state.selectedChapterIds.clear();
    coreIds.forEach(id => {
      if (state.allChapters.some(c => c.id === id)) {
        state.selectedChapterIds.add(id);
      }
    });
    renderChapterSelectionGrid();
    updateSelectionBadges();
    soundEffects.click();
    showToast('प्रमुख 5 अध्याय (मौलिक अधिकार, DPSP, राष्ट्रपति, संसद, न्यायालय) चयनित किए गए!', 'success');
  }

  // ============================================================================
  // QUIZ ENGINE INITIALIZATION (SHUFFLED QUESTIONS)
  // ============================================================================
  function startQuiz(customQuestionsList = null) {
    let pool = [];

    if (customQuestionsList && Array.isArray(customQuestionsList)) {
      pool = [...customQuestionsList];
    } else {
      state.allChapters.forEach(ch => {
        if (state.selectedChapterIds.has(ch.id) && ch.questions) {
          ch.questions.forEach(q => {
            pool.push({
              ...q,
              chapterTitle: ch.title,
              chapterNum: ch.number
            });
          });
        }
      });
    }

    if (pool.length === 0) {
      showToast('कृपया कम से कम एक अध्याय चुनें!', 'error');
      return;
    }

    state.config.shuffleQuestions = dom.cfgShuffle.checked;

    // SHUFFLE ALGORITHM: "सभी क्वेश्चन सफल्ड हों, चैप्टर वाइज़ ना हों"
    if (state.config.shuffleQuestions) {
      shuffleArray(pool);
    }

    let finalQuestions = pool;
    if (state.config.questionLimit !== 'all') {
      const limit = parseInt(state.config.questionLimit, 10);
      if (!isNaN(limit) && limit > 0 && limit < pool.length) {
        finalQuestions = pool.slice(0, limit);
      }
    }

    state.quiz.questions = finalQuestions;
    state.quiz.currentIndex = 0;
    state.quiz.paletteFilter = 'all';
    state.quiz.isSubmitted = false;

    state.quiz.userAnswers = finalQuestions.map(() => ({
      optionIndex: null,
      status: 'not_visited',
      isFlagged: false,
      timeSpent: 0
    }));

    state.quiz.userAnswers[0].status = 'not_answered';

    if (state.config.timePerQuestionMin > 0) {
      state.quiz.totalTimeSeconds = Math.round(finalQuestions.length * (state.config.timePerQuestionMin * 60));
      state.quiz.timerSecondsRemaining = state.quiz.totalTimeSeconds;
      dom.examTimerBox.classList.remove('hidden');
      startTimer();
    } else {
      state.quiz.totalTimeSeconds = 0;
      state.quiz.timerSecondsRemaining = 0;
      dom.examTimerDisplay.textContent = 'अभ्यास मोड (Untimed)';
    }

    dom.examSubTitle.textContent = `${finalQuestions.length} प्रश्न • सभी प्रश्न सफल्ड • -${state.config.negativeMarking} नेगेटिव`;

    renderPaletteGrid();
    updatePaletteCounts();
    renderQuestion(0);

    switchView('view-quiz-engine');
    soundEffects.success();
    showToast(`क्विज़ प्रारंभ! ${finalQuestions.length} प्रश्न लोड हुए`, 'success');
  }

  // ============================================================================
  // QUESTION PARSER & ROBUST FORMATTER
  // ============================================================================
  function parseQuestionData(q) {
    const rawText = (q.question || '').trim();
    const table = q.table || null;

    // 1. Structured Table or Matching First (Prevents matching questions from being parsed as statements)
    if (table || q.type === 'matching' || q.type === 'table_based') {
      return {
        type: 'matching',
        typeLabel: (q.type === 'table_based' || (table && !q.type)) ? 'तालिका आधारित' : 'मिलान करें',
        typeClass: 'matching',
        intro: rawText,
        table
      };
    }

    // 2. Assertion - Reason
    const arRegex = /(?:(?:अभिकथन|कथन)\s*\([A|a|क]\)\s*[:\-–]\s*)(.+?)(?:कारण\s*\([R|r|ख|R]\)\s*[:\-–]\s*)(.+)/s;
    const arMatch = rawText.match(arRegex);
    if (arMatch) {
      const matchIndex = rawText.indexOf(arMatch[0]);
      const rawIntro = rawText.substring(0, matchIndex).trim();
      const intro = rawIntro.replace(/^(?:Q\.?\s*\d+|\d+)\s*[\.\:\-\)]\s*/i, '');
      const assertionText = arMatch[1].trim();
      let rest = arMatch[2].trim();

      const outroRegex = /(?:नीचे दिए गए|उपर्युक्त|सही (?:कूट|विकल्प|उत्तर)|कूट\s*:).+$/s;
      const outroMatch = rest.match(outroRegex);
      let reasonText = rest;
      let outro = '';

      if (outroMatch) {
        const outroIdx = rest.indexOf(outroMatch[0]);
        reasonText = rest.substring(0, outroIdx).trim();
        outro = rest.substring(outroIdx).trim();
      }

      return {
        type: 'assertion_reason',
        typeLabel: 'अभिकथन - कारण (A & R)',
        typeClass: 'ar',
        intro,
        assertion: assertionText,
        reason: reasonText,
        outro,
        table
      };
    }

    // 3. Statements with 'कथन 1:' / 'कथन 2:'
    const kathanRegex = /(?:^|\n|\s)(कथन\s*\d+\s*[:\-–])\s*/g;
    const kathanMatches = [...rawText.matchAll(kathanRegex)];
    if (kathanMatches.length >= 2) {
      const rawIntro = rawText.substring(0, kathanMatches[0].index).trim();
      const intro = rawIntro.replace(/^(?:Q\.?\s*\d+|\d+)\s*[\.\:\-\)]\s*/i, '');
      const statements = [];
      for (let i = 0; i < kathanMatches.length; i++) {
        const label = kathanMatches[i][1].replace(/[:\-–]/g, '').trim();
        const start = kathanMatches[i].index + kathanMatches[i][0].length;
        const end = (i + 1 < kathanMatches.length) ? kathanMatches[i + 1].index : rawText.length;
        statements.push({
          label: label.replace('कथन', '').trim(),
          text: rawText.substring(start, end).trim()
        });
      }
      return {
        type: 'statements',
        typeLabel: 'कथन आधारित',
        typeClass: 'statement',
        intro,
        statements,
        outro: '',
        table
      };
    }

    // 4. Numbered Statements (1., 2., (i), (ii), A., B.)
    // Strict bullet matcher: Must be preceded by newline or sentence punctuation (never bare mid-sentence spaces)
    // Restricted strictly to numbers 1-10, Roman numerals, or Devanagari letters.
    // Consecutive sequential verification prevents years like (1980) or clauses like 39(b) from breaking sentences.
    const stmtRegex = /(?:^|\n|(?<=[\?\!\.\:\;\-–—।॥])\s*|\s+(?=(?:[1-9]|10)[\.\)]|\([1-9]\)|\([iIvVxX]+\)|\([a-eA-E]\)|[a-eA-E]\.|\([क-ङ]\)))(?:([1-9]|10)[\.\)]|\(([1-9]|10)\)|\(([iIvVxX]+)\)|([iIvVxX]+)[\.\)]|\(([a-eA-E])\)|([a-eA-E])[\.\)]|\(([क-ङ])\))\s+/g;
    const rawMatches = [...rawText.matchAll(stmtRegex)];
    const stmtMatches = [];
    let expectedIndex = 1;

    for (const m of rawMatches) {
      const label = m[1] || m[2] || m[3] || m[4] || m[5] || m[6] || m[7];
      if (!label) continue;
      if (/^\d+$/.test(label)) {
        const n = parseInt(label, 10);
        if (n === expectedIndex) {
          stmtMatches.push({ match: m, label: String(n) });
          expectedIndex++;
        }
      } else if (['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'].includes(label.toLowerCase())) {
        const romanMap = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8 };
        if (romanMap[label.toLowerCase()] === expectedIndex) {
          stmtMatches.push({ match: m, label: label.toUpperCase() });
          expectedIndex++;
        }
      } else if (['क', 'ख', 'ग', 'घ', 'ङ'].includes(label)) {
        const hindiMap = { 'क': 1, 'ख': 2, 'ग': 3, 'घ': 4, 'ङ': 5 };
        if (hindiMap[label] === expectedIndex) {
          stmtMatches.push({ match: m, label });
          expectedIndex++;
        }
      } else if (['a', 'b', 'c', 'd', 'e'].includes(label.toLowerCase())) {
        const alphaMap = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        if (alphaMap[label.toLowerCase()] === expectedIndex) {
          stmtMatches.push({ match: m, label: label.toUpperCase() });
          expectedIndex++;
        }
      }
    }

    if (stmtMatches.length >= 2) {
      const rawIntro = rawText.substring(0, stmtMatches[0].match.index).trim();
      const intro = rawIntro.replace(/^(?:Q\.?\s*\d+|\d+)\s*[\.\:\-\)]\s*/i, '');
      const statements = [];

      for (let i = 0; i < stmtMatches.length; i++) {
        const item = stmtMatches[i];
        const start = item.match.index + item.match[0].length;
        const end = (i + 1 < stmtMatches.length) ? stmtMatches[i + 1].match.index : rawText.length;
        let content = rawText.substring(start, end).trim();
        let outro = '';

        if (i === stmtMatches.length - 1) {
          const outroRegex = /(?:नीचे दिए गए|उपर्युक्त|उपरोक्त|सही (?:कूट|विकल्प|उत्तर)|कूट\s*:).+$/s;
          const outroMatch = content.match(outroRegex);
          if (outroMatch) {
            const outroIdx = content.indexOf(outroMatch[0]);
            outro = content.substring(outroIdx).trim();
            content = content.substring(0, outroIdx).trim();
          }
        }

        statements.push({ label: item.label, text: content });
      }

      return {
        type: 'statements',
        typeLabel: 'कथन आधारित',
        typeClass: 'statement',
        intro,
        statements,
        outro: '',
        table
      };
    }

    // 5. Sequence
    if (q.type === 'sequence') {
      return {
        type: 'sequence',
        typeLabel: 'कालानुक्रम निर्धारण',
        typeClass: 'sequence',
        intro: rawText,
        table
      };
    }

    // 6. Standard MCQ
    const cleanStandard = rawText.replace(/^(?:Q\.?\s*\d+|\d+)\s*[\.\:\-\)]\s*/i, '');
    return {
      type: 'standard',
      typeLabel: 'एकल विकल्प (MCQ)',
      typeClass: 'standard',
      text: cleanStandard,
      table
    };
  }

  function formatExamText(text) {
    if (!text) return '';
    let clean = escapeHtml(text);
    clean = clean.replace(/\*([^*]+)\*/g, '$1');

    // Negative trap phrases: Must be sorted longest-first so "नहीं हैं" matches before "नहीं है"
    // and combining mark (anusvara ं) is never severed causing dotted circle rendering
    const negativeKeywords = [
      'सुमेलित नहीं है',
      'सुमेलित नहीं हैं',
      'सही नहीं है',
      'सही नहीं हैं',
      'सत्य नहीं है',
      'सत्य नहीं हैं',
      'गलत है',
      'गलत हैं',
      'असत्य है',
      'असत्य हैं',
      'नहीं हैं',
      'नहीं है'
    ];
    const negPattern = new RegExp('(' + negativeKeywords.join('|') + ')', 'g');
    clean = clean.replace(negPattern, '<span class="negative-trap-pill">$1</span>');

    // Clean detached punctuation spaces (e.g. " ?" -> "?", " ," -> ",", " ।" -> "।")
    clean = clean.replace(/\s+([\?\,\।\:\;])/g, '$1');

    // Convert newlines to <br> for clean formatting of multiline lists
    clean = clean.replace(/\r?\n/g, '<br>');

    return clean;
  }

  function renderFormattedQuestionHTML(parsed) {
    let html = '';

    if (parsed.type === 'assertion_reason') {
      if (parsed.intro) html += `<div class="q-intro-bold">${formatExamText(parsed.intro)}</div>`;
      html += `
        <div class="ar-blocks-wrapper">
          <div class="ar-block-item">
            <span class="ar-pill-label">अभिकथन (A)</span>
            <div class="ar-sentence-text">${formatExamText(parsed.assertion)}</div>
          </div>
          <div class="ar-block-item reason">
            <span class="ar-pill-label">कारण (R)</span>
            <div class="ar-sentence-text">${formatExamText(parsed.reason)}</div>
          </div>
        </div>
      `;
      if (parsed.outro) html += `<div class="q-outro-prompt-text">${formatExamText(parsed.outro)}</div>`;
    }
    else if (parsed.type === 'statements') {
      if (parsed.intro) html += `<div class="q-intro-bold">${formatExamText(parsed.intro)}</div>`;
      html += `<div class="stmts-container-list">`;
      parsed.statements.forEach(st => {
        html += `
          <div class="stmt-card-box">
            <span class="stmt-num-bullet">${escapeHtml(st.label)}</span>
            <div class="stmt-content-text">${formatExamText(st.text)}</div>
          </div>
        `;
      });
      html += `</div>`;
      if (parsed.outro) html += `<div class="q-outro-prompt-text">${formatExamText(parsed.outro)}</div>`;
    }
    else if (parsed.type === 'matching' || parsed.table) {
      html += `<div class="q-intro-bold">${formatExamText(parsed.intro || parsed.text)}</div>`;
      if (parsed.table && parsed.table.headers && parsed.table.rows) {
        html += `
          <div class="match-table-card">
            <table class="match-table-element">
              <thead>
                <tr>
                  ${parsed.table.headers.map(h => `<th>${formatExamText(h)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${parsed.table.rows.map(row => `
                  <tr>
                    ${row.map(cell => `<td>${formatExamText(cell)}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }
    else {
      html += `<div class="q-intro-bold">${formatExamText(parsed.text || parsed.intro)}</div>`;
    }

    return html;
  }

  // ============================================================================
  // QUIZ ENGINE QUESTION & OPTION RENDERING
  // ============================================================================
  function renderQuestion(index) {
    if (index < 0 || index >= state.quiz.questions.length) return;

    state.quiz.currentIndex = index;
    const q = state.quiz.questions[index];
    const userAns = state.quiz.userAnswers[index];

    if (userAns.status === 'not_visited') {
      userAns.status = 'not_answered';
    }

    if (dom.questionScrollBox) dom.questionScrollBox.scrollTop = 0;

    const parsed = parseQuestionData(q);

    dom.qCurrentNumberPill.textContent = `प्रश्न ${index + 1} / ${state.quiz.questions.length}`;
    if (dom.qMarksPill) {
      dom.qMarksPill.innerHTML = `<span class="score-pos">+1.00</span><span class="score-sep">|</span><span class="score-neg">-${state.config.negativeMarking}</span>`;
    }

    if (dom.btnFlagQuestion) {
      dom.btnFlagQuestion.classList.toggle('active', userAns.isFlagged);
    }
    if (dom.flagBtnText) {
      dom.flagBtnText.textContent = userAns.isFlagged ? 'चिह्नित किया गया' : 'समीक्षा हेतु चिह्नित';
    }

    dom.questionBodyMount.innerHTML = renderFormattedQuestionHTML(parsed);

    // Render Options
    dom.optionsContainerMount.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E'];

    q.options.forEach((opt, optIdx) => {
      const isSelected = userAns.optionIndex === optIdx;
      const letter = letters[optIdx] || opt.id || String(optIdx + 1);

      const optCard = document.createElement('div');
      optCard.className = `option-clickable-card ${isSelected ? 'selected' : ''}`;
      optCard.setAttribute('data-optidx', optIdx);

      optCard.innerHTML = `
        <div class="option-circle-letter">${letter}</div>
        <div class="option-label-text">${formatExamText(opt.text)}</div>
        <div class="option-radio-dot"></div>
      `;

      optCard.addEventListener('click', () => {
        selectOption(optIdx);
        soundEffects.click();
      });

      dom.optionsContainerMount.appendChild(optCard);
    });

    dom.btnPrevQuestion.disabled = (index === 0);
    const hasSelection = userAns.optionIndex !== null;
    if (dom.btnClearResponse) dom.btnClearResponse.disabled = !hasSelection;

    if (index === state.quiz.questions.length - 1) {
      dom.btnSaveAndNext.innerHTML = `<span>सहेजें व समीक्षा करें</span> <kbd class="dock-kbd-hint primary">✓</kbd> <svg class="dock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else {
      dom.btnSaveAndNext.innerHTML = `<span>सहेजें और अगला</span> <kbd class="dock-kbd-hint primary">↵</kbd> <svg class="dock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
    }

    updatePaletteActiveState();
    updatePaletteCounts();
  }

  function selectOption(optIndex) {
    const qIndex = state.quiz.currentIndex;
    const userAns = state.quiz.userAnswers[qIndex];
    userAns.optionIndex = optIndex;
    userAns.status = userAns.isFlagged ? 'ans_review' : 'answered';

    if (dom.btnClearResponse) dom.btnClearResponse.disabled = false;

    const cards = dom.optionsContainerMount.querySelectorAll('.option-clickable-card');
    cards.forEach((c, idx) => {
      c.classList.toggle('selected', idx === optIndex);
    });

    updatePaletteActiveState();
    updatePaletteCounts();

    // Auto-advance support (zero mouse travel)
    const chkAutoAdvance = document.getElementById('chkAutoAdvance');
    if (chkAutoAdvance && chkAutoAdvance.checked) {
      if (qIndex < state.quiz.questions.length - 1) {
        clearTimeout(state.autoAdvanceTimer);
        state.autoAdvanceTimer = setTimeout(() => {
          saveAndNext();
        }, 280);
      }
    }
  }

  function clearResponse() {
    const qIndex = state.quiz.currentIndex;
    const userAns = state.quiz.userAnswers[qIndex];
    userAns.optionIndex = null;
    userAns.status = userAns.isFlagged ? 'review' : 'not_answered';

    if (dom.btnClearResponse) dom.btnClearResponse.disabled = true;

    const cards = dom.optionsContainerMount.querySelectorAll('.option-clickable-card');
    cards.forEach(c => c.classList.remove('selected'));

    soundEffects.click();
    updatePaletteActiveState();
    updatePaletteCounts();
    showToast('प्रतिक्रिया साफ़ कर दी गई', 'info');
  }

  function toggleFlagQuestion() {
    const qIndex = state.quiz.currentIndex;
    const userAns = state.quiz.userAnswers[qIndex];
    userAns.isFlagged = !userAns.isFlagged;

    if (userAns.isFlagged) {
      userAns.status = (userAns.optionIndex !== null) ? 'ans_review' : 'review';
    } else {
      userAns.status = (userAns.optionIndex !== null) ? 'answered' : 'not_answered';
    }

    if (dom.btnFlagQuestion) dom.btnFlagQuestion.classList.toggle('active', userAns.isFlagged);
    if (dom.flagBtnText) dom.flagBtnText.textContent = userAns.isFlagged ? 'चिह्नित किया गया' : 'समीक्षा हेतु चिह्नित';

    soundEffects.click();
    updatePaletteActiveState();
    updatePaletteCounts();
  }

  function saveAndNext() {
    const qIndex = state.quiz.currentIndex;
    soundEffects.click();

    if (qIndex < state.quiz.questions.length - 1) {
      renderQuestion(qIndex + 1);
    } else {
      openSubmitConfirmModal();
    }
  }

  function reviewAndNext() {
    const qIndex = state.quiz.currentIndex;
    const userAns = state.quiz.userAnswers[qIndex];
    userAns.isFlagged = true;
    userAns.status = (userAns.optionIndex !== null) ? 'ans_review' : 'review';

    soundEffects.click();
    if (qIndex < state.quiz.questions.length - 1) {
      renderQuestion(qIndex + 1);
    } else {
      openSubmitConfirmModal();
    }
  }

  function prevQuestion() {
    const qIndex = state.quiz.currentIndex;
    if (qIndex > 0) {
      soundEffects.click();
      renderQuestion(qIndex - 1);
    }
  }

  // ============================================================================
  // PALETTE GRID
  // ============================================================================
  function openPaletteDrawer() {
    if (dom.ntaPaletteAside) dom.ntaPaletteAside.classList.add('open');
    if (dom.paletteDrawerBackdrop) dom.paletteDrawerBackdrop.classList.add('active');
  }

  function closePaletteDrawer() {
    if (dom.ntaPaletteAside) dom.ntaPaletteAside.classList.remove('open');
    if (dom.paletteDrawerBackdrop) dom.paletteDrawerBackdrop.classList.remove('active');
  }

  function renderPaletteGrid() {
    dom.paletteGridMount.innerHTML = '';
    const total = state.quiz.questions.length;
    dom.paletteTotalQuestions.textContent = total;

    for (let i = 0; i < total; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-palette-num st-not-visited';
      btn.textContent = i + 1;
      btn.setAttribute('data-qidx', i);

      btn.addEventListener('click', () => {
        soundEffects.click();
        renderQuestion(i);
        if (window.innerWidth <= 1024) {
          closePaletteDrawer();
        }
      });

      dom.paletteGridMount.appendChild(btn);
    }
  }

  function updatePaletteActiveState() {
    const btns = dom.paletteGridMount.querySelectorAll('.btn-palette-num');
    const filter = state.quiz.paletteFilter;

    btns.forEach((btn, idx) => {
      const userAns = state.quiz.userAnswers[idx];
      const isCurrent = idx === state.quiz.currentIndex;

      btn.className = 'btn-palette-num';
      if (isCurrent) {
        btn.classList.add('current');
        btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }

      switch (userAns.status) {
        case 'answered': btn.classList.add('st-answered'); break;
        case 'not_answered': btn.classList.add('st-not-answered'); break;
        case 'review': btn.classList.add('st-review'); break;
        case 'ans_review': btn.classList.add('st-ans-review'); break;
        default: btn.classList.add('st-not-visited'); break;
      }

      let visible = true;
      if (filter === 'answered') {
        visible = (userAns.status === 'answered' || userAns.status === 'ans_review');
      } else if (filter === 'unanswered') {
        visible = (userAns.status === 'not_answered' || userAns.status === 'not_visited');
      } else if (filter === 'marked') {
        visible = (userAns.status === 'review' || userAns.status === 'ans_review');
      }
      btn.style.display = visible ? 'flex' : 'none';
    });
  }

  function updatePaletteCounts() {
    let answered = 0;
    let notAnswered = 0;
    let notVisited = 0;
    let review = 0;
    let ansReview = 0;

    state.quiz.userAnswers.forEach(ans => {
      switch (ans.status) {
        case 'answered': answered++; break;
        case 'not_answered': notAnswered++; break;
        case 'review': review++; break;
        case 'ans_review': ansReview++; break;
        default: notVisited++; break;
      }
    });

    if (dom.cntAnswered) dom.cntAnswered.textContent = answered;
    if (dom.cntNotAnswered) dom.cntNotAnswered.textContent = notAnswered;
    if (dom.cntNotVisited) dom.cntNotVisited.textContent = notVisited;
    if (dom.cntReview) dom.cntReview.textContent = review;
    if (dom.cntAnsReview) dom.cntAnsReview.textContent = ansReview;
  }

  // ============================================================================
  // TIMER
  // ============================================================================
  function startTimer() {
    clearInterval(state.quiz.timerInterval);

    state.quiz.timerInterval = setInterval(() => {
      if (state.quiz.timerSecondsRemaining <= 0) {
        clearInterval(state.quiz.timerInterval);
        showToast('समय समाप्त हो गया है! परीक्षा स्वतः सबमिट की जा रही है...', 'error');
        submitTest();
        return;
      }

      state.quiz.timerSecondsRemaining--;
      renderTimerDisplay(state.quiz.timerSecondsRemaining);

      if (state.quiz.timerSecondsRemaining <= 300) {
        dom.examTimerBox.classList.add('alert');
      } else {
        dom.examTimerBox.classList.remove('alert');
      }
    }, 1000);

    renderTimerDisplay(state.quiz.timerSecondsRemaining);
  }

  function renderTimerDisplay(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    dom.examTimerDisplay.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // ============================================================================
  // SUBMIT & SCORE EVALUATION
  // ============================================================================
  function openSubmitConfirmModal() {
    let answered = 0;
    let notAnswered = 0;
    let review = 0;

    state.quiz.userAnswers.forEach(ans => {
      if (ans.status === 'answered' || ans.status === 'ans_review') answered++;
      if (ans.status === 'not_answered' || ans.status === 'not_visited') notAnswered++;
      if (ans.status === 'review' || ans.status === 'ans_review') review++;
    });

    dom.modalTotalQ.textContent = state.quiz.questions.length;
    dom.modalAnsQ.textContent = answered;
    dom.modalNotAnsQ.textContent = notAnswered;
    dom.modalRevQ.textContent = review;
    dom.modalRemainingTime.textContent = dom.examTimerDisplay.textContent;

    dom.submitConfirmModal.classList.remove('hidden');
  }

  function closeSubmitConfirmModal() {
    dom.submitConfirmModal.classList.add('hidden');
  }

  function submitTest() {
    clearInterval(state.quiz.timerInterval);
    closeSubmitConfirmModal();
    state.quiz.isSubmitted = true;

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    const chapterStats = {};

    state.quiz.questions.forEach((q, idx) => {
      const userAns = state.quiz.userAnswers[idx];
      const correctIdx = q.correctAnswer.optionIndex;
      const chId = q.chapterId || `ch-${q.chapterNum || 1}`;
      const chTitle = q.chapterTitle || 'अन्य';

      if (!chapterStats[chId]) {
        chapterStats[chId] = { title: chTitle, total: 0, correct: 0, wrong: 0, skipped: 0 };
      }
      chapterStats[chId].total++;

      if (userAns.optionIndex === null) {
        skippedCount++;
        chapterStats[chId].skipped++;
      } else if (userAns.optionIndex === correctIdx) {
        correctCount++;
        chapterStats[chId].correct++;
      } else {
        wrongCount++;
        chapterStats[chId].wrong++;
      }
    });

    const marksPerCorrect = 1.0;
    const negativePenalty = state.config.negativeMarking || 0;
    const rawScore = (correctCount * marksPerCorrect) - (wrongCount * negativePenalty);
    const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);

    const attemptedCount = correctCount + wrongCount;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    state.evaluation.score = finalScore;
    state.evaluation.accuracy = accuracy;
    state.evaluation.correctCount = correctCount;
    state.evaluation.wrongCount = wrongCount;
    state.evaluation.skippedCount = skippedCount;
    state.evaluation.chapterStats = chapterStats;
    state.evaluation.reviewFilter = 'all';

    renderResultDashboard();
    switchView('view-result-evaluation');
    soundEffects.success();
    showToast('परीक्षा समाप्त! आपका परिणाम तैयार है', 'success');
  }

  // ============================================================================
  // RESULT DASHBOARD & IN-DEPTH SOLUTION REVIEW
  // ============================================================================
  function renderResultDashboard() {
    const total = state.quiz.questions.length;
    dom.resultSubtitle.textContent = `भारतीय राजव्यवस्था — आपने ${total} प्रश्नों में से ${state.evaluation.correctCount + state.evaluation.wrongCount} प्रश्नों का उत्तर दिया।`;

    dom.kpiScore.textContent = `${state.evaluation.score.toFixed(2)} / ${total}`;
    dom.kpiAccuracy.textContent = `${state.evaluation.accuracy}%`;
    dom.kpiCorrect.textContent = state.evaluation.correctCount;
    dom.kpiWrong.textContent = state.evaluation.wrongCount;
    dom.kpiSkipped.textContent = state.evaluation.skippedCount;

    dom.badgeFilterAll.textContent = `(${total})`;
    dom.badgeFilterWrong.textContent = `(${state.evaluation.wrongCount})`;
    dom.badgeFilterCorrect.textContent = `(${state.evaluation.correctCount})`;
    dom.badgeFilterSkipped.textContent = `(${state.evaluation.skippedCount})`;

    if (state.evaluation.wrongCount === 0) {
      dom.btnRetakeWrongOnly.style.display = 'none';
    } else {
      dom.btnRetakeWrongOnly.style.display = 'inline-flex';
      dom.btnRetakeWrongText.textContent = `केवल ${state.evaluation.wrongCount} गलत प्रश्न दोहराएँ`;
    }

    // Populate Chapter Stats
    dom.chapterStatTableBody.innerHTML = '';
    Object.values(state.evaluation.chapterStats).forEach(stat => {
      const chAttempted = stat.correct + stat.wrong;
      const chAcc = chAttempted > 0 ? Math.round((stat.correct / chAttempted) * 100) : 0;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHtml(stat.title)}</strong></td>
        <td>${stat.total}</td>
        <td style="color:#059669; font-weight:700;">${stat.correct}</td>
        <td style="color:#dc2626; font-weight:700;">${stat.wrong}</td>
        <td style="color:#d97706;">${stat.skipped}</td>
        <td>
          <span style="font-weight:700; color:${chAcc >= 70 ? '#059669' : chAcc >= 40 ? '#d97706' : '#dc2626'};">${chAcc}%</span>
        </td>
      `;
      dom.chapterStatTableBody.appendChild(row);
    });

    buildFilteredReviewIndices();
    renderReviewPalette();
    renderReviewQuestion(0);
  }

  function buildFilteredReviewIndices() {
    const filter = state.evaluation.reviewFilter;
    const indices = [];

    state.quiz.questions.forEach((q, idx) => {
      const userAns = state.quiz.userAnswers[idx];
      const correctIdx = q.correctAnswer.optionIndex;

      if (filter === 'all') {
        indices.push(idx);
      } else if (filter === 'wrong') {
        if (userAns.optionIndex !== null && userAns.optionIndex !== correctIdx) indices.push(idx);
      } else if (filter === 'correct') {
        if (userAns.optionIndex === correctIdx) indices.push(idx);
      } else if (filter === 'skipped') {
        if (userAns.optionIndex === null) indices.push(idx);
      }
    });

    state.evaluation.filteredReviewIndices = indices;
    state.evaluation.reviewIndex = 0;
  }

  function renderReviewPalette() {
    dom.revPaletteGrid.innerHTML = '';
    const total = state.quiz.questions.length;
    dom.revPaletteCount.textContent = `${total} प्रश्न`;

    for (let i = 0; i < total; i++) {
      const q = state.quiz.questions[i];
      const userAns = state.quiz.userAnswers[i];
      const correctIdx = q.correctAnswer.optionIndex;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-result-num-pill';
      btn.textContent = i + 1;

      if (userAns.optionIndex === null) {
        btn.classList.add('skipped');
      } else if (userAns.optionIndex === correctIdx) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('wrong');
      }

      btn.addEventListener('click', () => {
        soundEffects.click();
        const targetIdxInFiltered = state.evaluation.filteredReviewIndices.indexOf(i);
        if (targetIdxInFiltered !== -1) {
          renderReviewQuestion(targetIdxInFiltered);
        } else {
          state.evaluation.reviewFilter = 'all';
          updateReviewFilterActiveButtons();
          buildFilteredReviewIndices();
          renderReviewPalette();
          const newIdx = state.evaluation.filteredReviewIndices.indexOf(i);
          renderReviewQuestion(newIdx !== -1 ? newIdx : 0);
        }
      });

      dom.revPaletteGrid.appendChild(btn);
    }
  }

  function renderReviewQuestion(filteredIdx) {
    const list = state.evaluation.filteredReviewIndices;
    if (list.length === 0) {
      dom.revOutcomeBanner.className = 'review-outcome-status-banner skipped';
      dom.revOutcomeText.textContent = 'इस फ़िल्टर में कोई प्रश्न नहीं मिला।';
      dom.revQuestionBody.innerHTML = '';
      dom.revOptionsList.innerHTML = '';
      dom.revExplanationText.textContent = '';
      return;
    }

    if (filteredIdx < 0) filteredIdx = 0;
    if (filteredIdx >= list.length) filteredIdx = list.length - 1;
    state.evaluation.reviewIndex = filteredIdx;

    const actualQIndex = list[filteredIdx];
    const q = state.quiz.questions[actualQIndex];
    const userAns = state.quiz.userAnswers[actualQIndex];
    const correctIdx = q.correctAnswer.optionIndex;
    const isCorrect = userAns.optionIndex === correctIdx;
    const isSkipped = userAns.optionIndex === null;

    const pBtns = dom.revPaletteGrid.querySelectorAll('.btn-result-num-pill');
    pBtns.forEach((b, idx) => {
      const isCur = idx === actualQIndex;
      b.classList.toggle('current', isCur);
      if (isCur) {
        b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });

    if (isCorrect) {
      dom.revOutcomeBanner.className = 'review-outcome-status-banner correct';
      dom.revOutcomeText.textContent = `✓ आपका उत्तर बिल्कुल सही है! (+1.00 अंक)`;
    } else if (isSkipped) {
      dom.revOutcomeBanner.className = 'review-outcome-status-banner skipped';
      dom.revOutcomeText.textContent = `⚪ आपने यह प्रश्न छोड़ दिया था (0.00 अंक)`;
    } else {
      dom.revOutcomeBanner.className = 'review-outcome-status-banner incorrect';
      dom.revOutcomeText.textContent = `✗ आपका उत्तर गलत है! (-${state.config.negativeMarking} अंक)`;
    }

    dom.revTimeSpent.textContent = `प्रश्नांक #${actualQIndex + 1}`;
    dom.revQIndex.textContent = `प्रश्न संख्या ${actualQIndex + 1} / ${state.quiz.questions.length}`;
    dom.revChapterName.textContent = q.chapterTitle || 'भारतीय राजव्यवस्था';

    const parsed = parseQuestionData(q);
    dom.revTypeBadge.textContent = parsed.typeLabel;
    dom.revTypeBadge.className = `tag-type-badge ${parsed.typeClass}`;

    dom.revQuestionBody.innerHTML = renderFormattedQuestionHTML(parsed);

    // Options Comparison: Green for correct, Red for user wrong choice
    dom.revOptionsList.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E'];

    q.options.forEach((opt, optIdx) => {
      const isThisCorrect = optIdx === correctIdx;
      const isUserChoice = optIdx === userAns.optionIndex;
      const letter = letters[optIdx] || opt.id || String(optIdx + 1);

      let rowClass = 'eval-option-comparison-item';
      let badgeHtml = '';

      if (isUserChoice && isThisCorrect) {
        rowClass += ' user-correct';
        badgeHtml = '<span class="eval-status-badge-tag ans-correct">✓ आपका चयन (सही उत्तर)</span>';
      } else if (isUserChoice && !isThisCorrect) {
        rowClass += ' user-wrong';
        badgeHtml = '<span class="eval-status-badge-tag ans-wrong">✗ आपका चयन (गलत)</span>';
      } else if (isThisCorrect) {
        rowClass += ' target-correct';
        badgeHtml = '<span class="eval-status-badge-tag target-correct">✓ सही उत्तर</span>';
      }

      const optRow = document.createElement('div');
      optRow.className = rowClass;
      optRow.innerHTML = `
        <div class="option-circle-letter" style="${isThisCorrect ? 'background:#10b981; color:#fff; border-color:#10b981;' : isUserChoice ? 'background:#ef4444; color:#fff; border-color:#ef4444;' : ''}">${letter}</div>
        <div class="option-label-text" style="font-weight:${isThisCorrect || isUserChoice ? '700' : '500'};">${formatExamText(opt.text)}</div>
        ${badgeHtml}
      `;

      dom.revOptionsList.appendChild(optRow);
    });

    dom.revExplanationText.innerHTML = formatExamText(q.explanation || 'इस प्रश्न की विस्तृत व्याख्या शीघ्र उपलब्ध होगी।');

    dom.btnRevPrev.disabled = (filteredIdx === 0);
    dom.btnRevNext.disabled = (filteredIdx === list.length - 1);
    dom.revPositionIndicator.textContent = `${filteredIdx + 1} / ${list.length}`;
  }

  function updateReviewFilterActiveButtons() {
    const filterBtns = document.querySelectorAll('.btn-filter-review-pill');
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-resfilter') === state.evaluation.reviewFilter);
    });
  }

  function retakeAll() {
    startQuiz(state.quiz.questions);
  }

  function retakeWrongOnly() {
    const mistakes = [];
    state.quiz.questions.forEach((q, idx) => {
      const userAns = state.quiz.userAnswers[idx];
      const correctIdx = q.correctAnswer.optionIndex;
      if (userAns.optionIndex !== null && userAns.optionIndex !== correctIdx) {
        mistakes.push(q);
      }
    });

    if (mistakes.length === 0) {
      showToast('कोई भी गलत प्रश्न नहीं है!', 'info');
      return;
    }

    startQuiz(mistakes);
    showToast(`केवल ${mistakes.length} गलत प्रश्नों का पुनः अभ्यास शुरू हुआ!`, 'success');
  }

  // ============================================================================
  // THEME & UTILITIES
  // ============================================================================
  function applyTheme(theme) {
    state.ui.theme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('polity_quiz_theme', theme);

    if (dom.themeToggleText) {
      dom.themeToggleText.textContent = (theme === 'dark') ? 'लाइट मोड' : 'डार्क मोड';
    }
  }

  function toggleTheme() {
    applyTheme(state.ui.theme === 'dark' ? 'light' : 'dark');
    soundEffects.click();
  }

  function adjustFontSize(delta) {
    state.ui.fontSizeRem = Math.max(0.85, Math.min(1.35, state.ui.fontSizeRem + delta));
    document.documentElement.style.setProperty('--q-font-scale', `${state.ui.fontSizeRem}rem`);
    soundEffects.click();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  }

  function handleKeyDown(e) {
    const quizView = document.getElementById('view-quiz-engine');
    if (!quizView || !quizView.classList.contains('active')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toUpperCase();
    if (key === '1' || key === 'A') { selectOption(0); soundEffects.click(); return; }
    if (key === '2' || key === 'B') { selectOption(1); soundEffects.click(); return; }
    if (key === '3' || key === 'C') { selectOption(2); soundEffects.click(); return; }
    if (key === '4' || key === 'D') { selectOption(3); soundEffects.click(); return; }

    if (key === 'ENTER' || key === 'ARROWRIGHT') { saveAndNext(); return; }
    if (key === 'ARROWLEFT') { prevQuestion(); return; }
    if (key === 'M') { toggleFlagQuestion(); return; }
    if (key === 'C') { clearResponse(); return; }
    if (key === 'ESCAPE') {
      closeSubmitConfirmModal();
      dom.shortcutsModal.classList.add('hidden');
      return;
    }
  }

  function setupEventListeners() {
    if (dom.themeToggleBtn) dom.themeToggleBtn.addEventListener('click', toggleTheme);

    if (dom.chapterSearchInput) {
      dom.chapterSearchInput.addEventListener('input', () => {
        const q = (dom.chapterSearchInput.value || '').trim();
        if (dom.btnClearSearch) {
          dom.btnClearSearch.classList.toggle('visible', q.length > 0);
        }
        renderChapterSelectionGrid();
      });
    }

    if (dom.btnClearSearch) {
      dom.btnClearSearch.addEventListener('click', () => {
        dom.chapterSearchInput.value = '';
        dom.btnClearSearch.classList.remove('visible');
        dom.chapterSearchInput.focus();
        renderChapterSelectionGrid();
      });
    }

    if (dom.selectAllChaptersBtn) dom.selectAllChaptersBtn.addEventListener('click', selectAllChapters);
    if (dom.deselectAllChaptersBtn) dom.deselectAllChaptersBtn.addEventListener('click', deselectAllChapters);
    if (dom.selectCorePolityBtn) dom.selectCorePolityBtn.addEventListener('click', selectCoreChapters);

    // Category Tabs in Studio
    const catBtns = document.querySelectorAll('.cat-tab-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        catBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.activeCategoryFilter = e.target.getAttribute('data-cat');
        renderChapterSelectionGrid();
        soundEffects.click();
      });
    });

    // Segmented Buttons Handler
    function setupSegmentedGroup(containerId, onSelect) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const buttons = container.querySelectorAll('.btn-seg-option');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const val = btn.getAttribute('data-val');
          onSelect(val);
          soundEffects.click();
        });
      });
    }

    setupSegmentedGroup('segQuestionLimit', (val) => {
      state.config.questionLimit = val;
      updateSelectionBadges();
    });

    setupSegmentedGroup('segTimerMode', (val) => {
      state.config.timePerQuestionMin = parseFloat(val) || 0;
      updateSelectionBadges();
    });

    setupSegmentedGroup('segNegativeMarking', (val) => {
      state.config.negativeMarking = parseFloat(val) || 0;
      updateSelectionBadges();
    });

    if (dom.startQuizBtn) {
      dom.startQuizBtn.addEventListener('click', () => startQuiz());
    }

    // Dock Buttons
    if (dom.btnClearResponse) dom.btnClearResponse.addEventListener('click', clearResponse);
    if (dom.btnReviewAndNext) dom.btnReviewAndNext.addEventListener('click', reviewAndNext);
    if (dom.btnFlagQuestion) dom.btnFlagQuestion.addEventListener('click', toggleFlagQuestion);
    if (dom.btnPrevQuestion) dom.btnPrevQuestion.addEventListener('click', prevQuestion);
    if (dom.btnSaveAndNext) dom.btnSaveAndNext.addEventListener('click', saveAndNext);

    // Nav tools
    if (dom.examThemeToggleBtn) dom.examThemeToggleBtn.addEventListener('click', toggleTheme);
    if (dom.btnFullscreenToggle) dom.btnFullscreenToggle.addEventListener('click', toggleFullscreen);
    if (dom.btnSubmitTest) dom.btnSubmitTest.addEventListener('click', openSubmitConfirmModal);

    // Palette filter tabs
    const paletteFilterBtns = document.querySelectorAll('.btn-palette-tab');
    paletteFilterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        paletteFilterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.quiz.paletteFilter = e.target.getAttribute('data-filter');
        updatePaletteActiveState();
      });
    });

    // Modals
    if (dom.btnCloseSubmitModal) dom.btnCloseSubmitModal.addEventListener('click', closeSubmitConfirmModal);
    if (dom.btnResumeTest) dom.btnResumeTest.addEventListener('click', closeSubmitConfirmModal);
    if (dom.btnFinalSubmitConfirm) dom.btnFinalSubmitConfirm.addEventListener('click', submitTest);

    // Mobile palette drawer
    if (dom.btnToggleMobilePalette) dom.btnToggleMobilePalette.addEventListener('click', openPaletteDrawer);
    if (dom.btnClosePaletteDrawer) dom.btnClosePaletteDrawer.addEventListener('click', closePaletteDrawer);
    if (dom.paletteDrawerBackdrop) dom.paletteDrawerBackdrop.addEventListener('click', closePaletteDrawer);

    if (dom.btnHelpShortcuts) dom.btnHelpShortcuts.addEventListener('click', () => dom.shortcutsModal.classList.remove('hidden'));
    if (dom.btnCloseShortcutsModal) dom.btnCloseShortcutsModal.addEventListener('click', () => dom.shortcutsModal.classList.add('hidden'));
    if (dom.btnDismissShortcuts) dom.btnDismissShortcuts.addEventListener('click', () => dom.shortcutsModal.classList.add('hidden'));

    // Result actions
    if (dom.btnRetakeAll) dom.btnRetakeAll.addEventListener('click', retakeAll);
    if (dom.btnRetakeWrongOnly) dom.btnRetakeWrongOnly.addEventListener('click', retakeWrongOnly);
    if (dom.btnNewTestChapters) {
      dom.btnNewTestChapters.addEventListener('click', () => {
        switchView('view-chapter-selection');
      });
    }
    if (dom.btnPrintResult) dom.btnPrintResult.addEventListener('click', () => window.print());

    const reviewFilterBtns = document.querySelectorAll('.btn-filter-review-pill');
    reviewFilterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        reviewFilterBtns.forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        state.evaluation.reviewFilter = target.getAttribute('data-resfilter');
        buildFilteredReviewIndices();
        renderReviewQuestion(0);
      });
    });

    if (dom.btnRevPrev) {
      dom.btnRevPrev.addEventListener('click', () => {
        soundEffects.click();
        renderReviewQuestion(state.evaluation.reviewIndex - 1);
      });
    }
    if (dom.btnRevNext) {
      dom.btnRevNext.addEventListener('click', () => {
        soundEffects.click();
        renderReviewQuestion(state.evaluation.reviewIndex + 1);
      });
    }

    window.addEventListener('keydown', handleKeyDown);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast-msg-item';
    if (type === 'error') toast.style.borderLeft = '4px solid #ef4444';
    if (type === 'success') toast.style.borderLeft = '4px solid #10b981';

    toast.textContent = message;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
