function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand(...items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

function simplifyFrac(num, den) {
  if (den < 0) { num = -num; den = -den; }
  if (num === 0) return [0, 1];
  const g = gcd(Math.abs(num), Math.abs(den));
  return [num / g, den / g];
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatNum(n) {
  return n.toLocaleString();
}

function plural(n, word) {
  if (n === 0) return 'no ' + word + 's';
  return n === 1 ? n + ' ' + word : n + ' ' + word + 's';
}

function formatTime(ms) {
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
  const min = Math.floor(ms / 60000);
  const sec = Math.round((ms % 60000) / 1000);
  return min + 'm ' + sec + 's';
}

function generateWrongs(correct, count, spread) {
  if (spread === undefined) spread = Math.max(3, Math.floor(Math.abs(correct) * 0.15) + 1);
  const wrongs = new Set();
  const strategies = shuffle([
    () => correct + randInt(1, spread),
    () => correct - randInt(1, spread),
    () => correct + randInt(spread + 1, spread * 3),
    () => correct - randInt(spread + 1, spread * 3),
    () => -correct,
    () => correct + 10 * Math.sign(correct || 1),
    () => correct - 10 * Math.sign(correct || 1),
    () => Math.round(correct * 0.5),
    () => Math.round(correct * 1.5),
    () => Math.round(correct * 2),
    () => Math.round(correct / 2),
  ]);
  for (const s of strategies) {
    if (wrongs.size >= count) break;
    const val = s();
    if (val !== correct && !isNaN(val) && isFinite(val) && Number.isInteger(val)) {
      wrongs.add(val);
    }
  }
  for (let i = 1; wrongs.size < count && i < 1000; i++) {
    const vals = [correct + i, correct - i];
    for (const v of vals) {
      if (v !== correct && !isNaN(v) && isFinite(v) && Number.isInteger(v)) {
        wrongs.add(v);
      }
      if (wrongs.size >= count) break;
    }
  }
  return [...wrongs].slice(0, count);
}

function generateWrongsFrac(num, den, count) {
  const wrongs = new Set();
  const strategies = shuffle([
    () => simplifyFrac(num + 1, den),
    () => simplifyFrac(num - 1, den),
    () => simplifyFrac(num, den + 1),
    () => simplifyFrac(num, den - 1),
    () => simplifyFrac(den, num),
    () => simplifyFrac(num + den, den),
    () => simplifyFrac(num, den + num),
  ]);
  for (const s of strategies) {
    if (wrongs.size >= count) break;
    const [n, d] = s();
    if (n !== num || d !== den) {
      wrongs.add(n + '/' + d);
    }
  }
  for (let i = 1; wrongs.size < count && i < 1000; i++) {
    const [n1, d1] = simplifyFrac(num + i, den);
    if (n1 !== num || d1 !== den) wrongs.add(n1 + '/' + d1);
    if (wrongs.size >= count) break;
    const [n2, d2] = simplifyFrac(num - i, den);
    if (n2 !== num || d2 !== den) wrongs.add(n2 + '/' + d2);
  }
  return [...wrongs].slice(0, count);
}

function buildOptions(correct, wrongs) {
  const set = new Set([String(correct)]);
  for (const w of wrongs) {
    const s = String(w);
    if (s !== String(correct)) set.add(s);
    if (set.size >= 4) break;
  }
  while (set.size < 4) {
    const n = parseInt(correct) + set.size;
    if (!isNaN(n)) set.add(String(n));
    else set.add('option' + set.size);
  }
  return shuffle([...set]);
}

function getCorrectIndex(options, correct) {
  return options.indexOf(String(correct));
}

function fracStr(n, d) {
  if (d === 1) return String(n);
  return n + '/' + d;
}
