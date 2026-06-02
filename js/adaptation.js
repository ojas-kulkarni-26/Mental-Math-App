const STORAGE_KEY = 'mental-math-stats-v1';
const TOTAL_GOAL = 35000;

let Stats = {
  totalAnswered: 0,
  todayCount: 0,
  todayDate: '',
  focusMode: false,
  subTopics: {},
  enabledTemplates: {}
};

function initStats() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Stats.totalAnswered = parsed.totalAnswered || 0;
      Stats.todayCount = parsed.todayCount || 0;
      Stats.todayDate = parsed.todayDate || '';
      Stats.focusMode = parsed.focusMode || false;
      Stats.subTopics = parsed.subTopics || {};
      Stats.enabledTemplates = parsed.enabledTemplates || {};
    } catch (e) {
      resetStats();
    }
  } else {
    resetStats();
  }
  checkDayReset();
  ensureAllSubTopics();
}

function resetStats() {
  Stats.totalAnswered = 0;
  Stats.todayCount = 0;
  Stats.todayDate = new Date().toISOString().split('T')[0];
  Stats.focusMode = false;
  Stats.subTopics = {};
  Stats.enabledTemplates = {};
  ensureAllSubTopics();
  saveStats();
}

function ensureAllSubTopics() {
  for (const t of TEMPLATES) {
    if (!Stats.subTopics[t.id]) {
      Stats.subTopics[t.id] = {
        level: t.minLevel,
        attempted: 0,
        correct: 0,
        totalTimeMs: 0
      };
    }
  }
}

function checkDayReset() {
  const today = new Date().toISOString().split('T')[0];
  if (Stats.todayDate !== today) {
    Stats.todayCount = 0;
    Stats.todayDate = today;
    saveStats();
  }
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Stats));
}

function getSubTopicStats(id) {
  return Stats.subTopics[id] || { level: 1, attempted: 0, correct: 0, totalTimeMs: 0 };
}

function recordAnswer(subTopic, correct, timeMs) {
  const s = getSubTopicStats(subTopic);
  s.attempted++;
  s.totalTimeMs += timeMs;
  if (correct) s.correct++;
  Stats.totalAnswered++;
  Stats.todayCount++;
  checkDayReset();
  saveStats();
}

function getAccuracy(subTopic) {
  const s = getSubTopicStats(subTopic);
  if (s.attempted === 0) return null;
  return s.correct / s.attempted;
}

function getAvgTime(subTopic) {
  const s = getSubTopicStats(subTopic);
  if (s.attempted === 0) return null;
  return s.totalTimeMs / s.attempted;
}

const TIME_THRESHOLDS = [8000, 7000, 6000, 5000, 4000, 3500, 3000, 2500, 2000, 1500];

function getTimeThreshold(level) {
  return TIME_THRESHOLDS[Math.min(clamp(level, 1, 10) - 1, 9)];
}

const ADAPT_EVERY = 5;

let lastLevelChange = null;

function evaluateAdaptation(subTopic) {
  const s = getSubTopicStats(subTopic);
  if (s.attempted < ADAPT_EVERY) return s.level;
  const accuracy = s.correct / s.attempted;
  let newLevel = s.level;
  if (Stats.focusMode) {
    const avgTime = s.totalTimeMs / s.attempted;
    const threshold = getTimeThreshold(s.level);
    if (accuracy > 0.85 && avgTime < threshold) {
      newLevel = Math.min(s.level + 1, 10);
    } else if (accuracy < 0.6 || avgTime > threshold * 2) {
      newLevel = Math.max(s.level - 1, 1);
    }
  } else {
    if (accuracy > 0.85) {
      newLevel = Math.min(s.level + 1, 10);
    } else if (accuracy < 0.6) {
      newLevel = Math.max(s.level - 1, 1);
    }
  }
  if (newLevel !== s.level) {
    const oldLevel = s.level;
    s.level = newLevel;
    s.attempted = 0;
    s.correct = 0;
    s.totalTimeMs = 0;
    saveStats();
    lastLevelChange = { subTopic, oldLevel, newLevel };
  }
  return newLevel;
}

function getLevel(subTopic) {
  return getSubTopicStats(subTopic).level;
}

function toggleFocusMode() {
  Stats.focusMode = !Stats.focusMode;
  saveStats();
}

function isTemplateEnabled(id) {
  if (Stats.enabledTemplates[id] === false) return false;
  const t = TEMPLATES.find(t => t.id === id);
  if (!t) return true;
  return Stats.enabledTemplates[id] !== false;
}

function setTemplateEnabled(id, enabled) {
  Stats.enabledTemplates[id] = enabled;
  saveStats();
}

function toggleTemplate(id) {
  setTemplateEnabled(id, !isTemplateEnabled(id));
}

function getEnabledTemplates() {
  return TEMPLATES.filter(t => isTemplateEnabled(t.id));
}

function getQuestionWeight(subTopic) {
  const s = getSubTopicStats(subTopic);
  if (s.attempted === 0) return 3;
  const acc = s.correct / s.attempted;
  return 1 / (acc + 0.05);
}

function buildQuestionQueue(size) {
  const enabled = getEnabledTemplates();
  if (enabled.length === 0) return [];
  const ids = new Set();
  const result = [];
  const weighted = enabled.map(t => ({
    template: t,
    weight: getQuestionWeight(t.id)
  }));
  while (result.length < size) {
    const remaining = weighted.filter(w => !ids.has(w.template.id));
    if (remaining.length === 0) break;
    const rTotal = remaining.reduce((s, w) => s + w.weight, 0);
    let r = Math.random() * rTotal;
    for (const w of remaining) {
      r -= w.weight;
      if (r <= 0) {
        result.push(w.template);
        ids.add(w.template.id);
        break;
      }
    }
  }
  if (result.length < size) {
    const remaining = enabled.filter(t => !ids.has(t.id));
    for (const t of remaining) {
      if (result.length >= size) break;
      result.push(t);
    }
  }
  return shuffle(result);
}

function getProgressPercent() {
  return Math.min(Stats.totalAnswered / TOTAL_GOAL * 100, 100);
}

function getTopicStats() {
  const topicMap = {};
  for (const t of getEnabledTemplates()) {
    if (!topicMap[t.topic]) topicMap[t.topic] = { attempted: 0, correct: 0, totalTimeMs: 0 };
    const s = Stats.subTopics[t.id] || { attempted: 0, correct: 0, totalTimeMs: 0 };
    topicMap[t.topic].attempted += s.attempted;
    topicMap[t.topic].correct += s.correct;
    topicMap[t.topic].totalTimeMs += s.totalTimeMs;
  }
  return topicMap;
}

function getSubTopicDetails() {
  return getEnabledTemplates().map(t => {
    const s = Stats.subTopics[t.id] || { level: t.minLevel, attempted: 0, correct: 0, totalTimeMs: 0 };
    return {
      id: t.id,
      name: t.name,
      topic: t.topic,
      level: s.level,
      attempted: s.attempted,
      correct: s.correct,
      accuracy: s.attempted > 0 ? (s.correct / s.attempted * 100).toFixed(0) + '%' : '—',
      avgTime: s.attempted > 0 ? formatTime(s.totalTimeMs / s.attempted) : '—',
    };
  });
}
