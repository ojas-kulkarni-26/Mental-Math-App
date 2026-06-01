let currentQuestion = null;
let questionStartTime = null;
let questionQueue = [];
let answering = false;

const $ = id => document.getElementById(id);

function init() {
  initStats();
  questionQueue = buildQuestionQueue(10);
  renderFocusToggle();
  renderProgress();
  renderTodayCount();
  showNextQuestion();
  bindEvents();
}

function bindEvents() {
  $('focus-toggle').addEventListener('click', function() {
    toggleFocusMode();
    renderFocusToggle();
  });
  $('stats-toggle').addEventListener('click', function() {
    $('stats-panel').classList.toggle('visible');
    renderStatsPanel();
  });
  $('stats-close').addEventListener('click', function() {
    $('stats-panel').classList.remove('visible');
  });
  $('customize-toggle').addEventListener('click', function() {
    $('customize-panel').classList.toggle('visible');
    renderCustomizePanel();
  });
  $('customize-close').addEventListener('click', function() {
    $('customize-panel').classList.remove('visible');
  });
  $('reset-btn').addEventListener('click', function() {
    if (confirm('Reset all stats? Your progress will be lost.')) {
      resetStats();
      questionQueue = buildQuestionQueue(10);
      showNextQuestion();
    }
  });
  document.addEventListener('keydown', function(e) {
    if (answering) {
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key) - 1;
        const btn = $('option-' + idx);
        if (btn && !btn.disabled) handleAnswer(idx);
      }
    } else {
      if (e.key === 'Enter' || e.key === ' ') {
        showNextQuestion();
      }
    }
    if (e.key === 'Escape') {
      $('stats-panel').classList.remove('visible');
      $('customize-panel').classList.remove('visible');
    }
  });
}

function clearQuestionArea() {
  $('question-area').innerHTML = '';
  $('feedback-area').innerHTML = '';
  $('next-area').innerHTML = '';
}

function renderQuestion(q) {
  currentQuestion = q;
  answering = true;
  questionStartTime = Date.now();
  const t = TEMPLATES.find(t => t.id === q.subTopic);
  const level = getLevel(q.subTopic);
  $('question-area').innerHTML =
    '<div class="topic-badge"><span class="topic-name">' +
    (t ? t.name : q.subTopic) +
    '</span><span class="level-badge">Level ' + level + '</span></div>' +
    '<div class="question-text">' + q.question + '</div>' +
    '<div class="options-grid">' +
    q.options.map((opt, i) =>
      '<button class="option-btn" id="option-' + i + '" data-idx="' + i + '">' +
      '<span class="opt-key">' + (i + 1) + '</span>' +
      '<span class="opt-text">' + opt + '</span>' +
      '</button>'
    ).join('') +
    '</div>';
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      handleAnswer(parseInt(this.dataset.idx));
    });
  });
}

function handleAnswer(idx) {
  if (!answering) return;
  answering = false;
  const timeMs = Date.now() - questionStartTime;
  const isCorrect = idx === currentQuestion.correctIndex;
  recordAnswer(currentQuestion.subTopic, isCorrect, timeMs);
  evaluateAdaptation(currentQuestion.subTopic);
  const correctText = currentQuestion.options[currentQuestion.correctIndex];
  renderFeedback(isCorrect, correctText, currentQuestion.solution, currentQuestion.solutionSteps);
  highlightOptions(currentQuestion.correctIndex, idx);
  renderProgress();
  renderTodayCount();
  questionQueue.shift();
  if (questionQueue.length < 5) {
    questionQueue = questionQueue.concat(buildQuestionQueue(10));
    questionQueue = shuffle(questionQueue);
  }
  $('next-area').innerHTML =
    '<button class="next-btn" id="next-btn">Next → <span class="key-hint">(Enter)</span></button>';
  $('next-btn').addEventListener('click', function() {
    showNextQuestion();
  });
  setTimeout(function() {
    const nb = $('next-btn');
    if (nb) nb.focus();
  }, 100);
}

function renderFeedback(isCorrect, correctText, solution, solutionSteps) {
  const icon = isCorrect ? '✅' : '❌';
  const label = isCorrect ? 'Correct' : 'Incorrect';
  const timeMs = Date.now() - questionStartTime;
  $('feedback-area').innerHTML =
    '<div class="feedback ' + (isCorrect ? 'feedback-correct' : 'feedback-incorrect') + '">' +
    '<span class="feedback-icon">' + icon + '</span> ' +
    '<span class="feedback-label">' + label + '</span>' +
    '<span class="feedback-time">(' + formatTime(timeMs) + ')</span>' +
    '</div>' +
    '<div class="solution-box">' +
    '<div class="solution-line">' + solution + '</div>' +
    (solutionSteps && solutionSteps.length > 0 ?
      '<div class="solution-steps-toggle" id="steps-toggle">📖 Show detailed steps <span class="steps-arrow">▾</span></div>' +
      '<div class="solution-steps" id="steps-content">' +
      solutionSteps.map(s => '<div class="step-line">' + s + '</div>').join('') +
      '</div>'
      : '') +
    '</div>';
  const toggle = $('steps-toggle');
  if (toggle) {
    toggle.addEventListener('click', function() {
      const content = $('steps-content');
      const arrow = this.querySelector('.steps-arrow');
      content.classList.toggle('visible');
      arrow.textContent = content.classList.contains('visible') ? '▴' : '▾';
    });
  }
}

function highlightOptions(correctIdx, selectedIdx) {
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    const idx = parseInt(btn.dataset.idx);
    if (idx === correctIdx) btn.classList.add('correct');
    else if (idx === selectedIdx) btn.classList.add('incorrect');
  });
}

function showNextQuestion() {
  if (questionQueue.length === 0) {
    questionQueue = buildQuestionQueue(10);
  }
  if (questionQueue.length === 0) {
    clearQuestionArea();
    $('question-area').innerHTML = '<div class="question-text" style="font-size:16px;color:var(--text-secondary);padding:40px 0">Enable at least one question type in <strong>Customize</strong> to continue.</div>';
    return;
  }
  const template = questionQueue[0];
  const level = getLevel(template.id);
  const q = template.generate(level);
  clearQuestionArea();
  renderQuestion(q);
}

function renderFocusToggle() {
  const btn = $('focus-toggle');
  if (Stats.focusMode) {
    btn.innerHTML = '⚡ Focus: ON';
    btn.classList.add('active');
  } else {
    btn.innerHTML = '⚡ Focus: OFF';
    btn.classList.remove('active');
  }
}

function renderProgress() {
  const pct = getProgressPercent();
  $('progress-fill').style.width = pct + '%';
  $('progress-text').textContent = formatNum(Stats.totalAnswered) + ' / ' + formatNum(TOTAL_GOAL);
}

function renderTodayCount() {
  $('today-count').textContent = 'Today: ' + Stats.todayCount + ' question' + (Stats.todayCount !== 1 ? 's' : '');
}

function renderStatsPanel() {
  const details = getSubTopicDetails();
  const topics = getTopicStats();
  let topicHtml = '';
  for (const [topic, st] of Object.entries(topics)) {
    const acc = st.attempted > 0 ? (st.correct / st.attempted * 100).toFixed(0) + '%' : '—';
    topicHtml += '<div class="stat-topic-row"><span class="stat-topic-name">' + topic + '</span><span class="stat-topic-val">' + plural(st.attempted, 'Q') + ', ' + acc + '</span></div>';
  }
  let subHtml = '';
  for (const d of details) {
    const accClass = d.accuracy === '—' ? '' : parseFloat(d.accuracy) >= 80 ? ' acc-high' : parseFloat(d.accuracy) >= 60 ? ' acc-mid' : ' acc-low';
    subHtml += '<div class="stat-sub-row"><span class="stat-sub-name">' + d.name + '</span><span class="stat-sub-level">Lv' + d.level + '</span><span class="stat-sub-acc' + accClass + '">' + d.accuracy + '</span><span class="stat-sub-time">' + d.avgTime + '</span></div>';
  }
  $('stats-panel-content').innerHTML =
    '<div class="stats-section"><h3>Topics</h3>' + topicHtml + '</div>' +
    '<div class="stats-section"><h3>Sub-Topics</h3><div class="stats-header-row"><span>Skill</span><span>Lv</span><span>Acc</span><span>Avg T</span></div>' + subHtml + '</div>' +
    '<div class="stats-footer"><button id="reset-btn" class="reset-btn">Reset All Progress</button></div>';
}

function renderCustomizePanel() {
  const topics = {};
  for (const t of TEMPLATES) {
    if (!topics[t.topic]) topics[t.topic] = [];
    topics[t.topic].push(t);
  }
  let html = '';
  for (const [topic, templates] of Object.entries(topics)) {
    const allOn = templates.every(t => isTemplateEnabled(t.id));
    html += '<div class="customize-topic">' +
      '<div class="customize-topic-header">' +
      '<span class="customize-topic-name">' + topic + '</span>' +
      '<label class="customize-toggle-all">' +
      '<input type="checkbox" class="topic-toggle-all" data-topic="' + topic + '" ' + (allOn ? 'checked' : '') + '>' +
      '<span class="toggle-label">All</span>' +
      '</label>' +
      '</div>';
    for (const t of templates) {
      const enabled = isTemplateEnabled(t.id);
      html += '<label class="customize-item">' +
        '<input type="checkbox" class="template-check" data-id="' + t.id + '" ' + (enabled ? 'checked' : '') + '>' +
        '<span class="customize-item-name">' + t.name + '</span>' +
        '</label>';
    }
    html += '</div>';
  }
  $('customize-panel-content').innerHTML = html;
  document.querySelectorAll('.template-check').forEach(cb => {
    cb.addEventListener('change', function() {
      toggleTemplate(this.dataset.id);
      renderCustomizePanel();
    });
  });
  document.querySelectorAll('.topic-toggle-all').forEach(cb => {
    cb.addEventListener('change', function() {
      const topic = this.dataset.topic;
      const enabled = this.checked;
      for (const t of TEMPLATES) {
        if (t.topic === topic) setTemplateEnabled(t.id, enabled);
      }
      renderCustomizePanel();
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
