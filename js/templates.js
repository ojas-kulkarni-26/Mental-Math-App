const TEMPLATES = [];

function def(id, name, topic, minLevel, maxLevel, gen) {
  TEMPLATES.push({ id, name, topic, minLevel, maxLevel, generate: gen });
}

function genOpts(correct, wrongSet) {
  const arr = [...wrongSet].filter(w => w !== correct && w !== undefined && w !== null);
  while (arr.length < 3) {
    arr.push(correct + arr.length + 1);
  }
  return buildOptions(correct, arr.slice(0, 3));
}

function genQ(correct, ...wrongs) {
  return buildOptions(correct, wrongs.slice(0, 3));
}

function ansIdx(options, correct) {
  return getCorrectIndex(options, correct);
}

function wrap(question, correct, wrongs, solution, solutionSteps, subTopic) {
  const options = genQ(correct, ...wrongs);
  return {
    question,
    options,
    correctIndex: ansIdx(options, correct),
    solution,
    solutionSteps,
    subTopic
  };
}

// ─── Natural Number Addition ───────────────────────────────────────────

def('nat-add-no-carry', 'Addition (No Carry)', 'Natural Numbers', 1, 4, function(lv) {
  const digs = clamp(lv, 1, 4);
  let a, b;
  for (let tries = 0; tries < 200; tries++) {
    const min = Math.pow(10, digs - 1);
    const max = Math.pow(10, digs) - 1;
    a = randInt(min, max);
    b = randInt(min, max);
    let ok = true;
    for (let t = a, u = b; t > 0 || u > 0; t = Math.floor(t / 10), u = Math.floor(u / 10)) {
      if ((t % 10) + (u % 10) >= 10) { ok = false; break; }
    }
    if (ok) break;
  }
  const correct = a + b;
  return wrap(
    formatNum(a) + ' + ' + formatNum(b),
    correct,
    [correct + 9, correct - 9, correct + 10, correct - 10, correct + 100, correct - 100],
    formatNum(a) + ' + ' + formatNum(b) + ' = ' + formatNum(correct),
    [
      'Add digits column by column from right:',
      ...(() => { const st = []; let ta = a, tb = b, p = 1; while (ta > 0 || tb > 0) { const da = ta % 10, db = tb % 10; st.push('  ' + da + ' + ' + db + ' = ' + (da + db) + ' (write ' + (da + db) + ')'); ta = Math.floor(ta / 10); tb = Math.floor(tb / 10); p *= 10; } return st; })(),
      'Result: ' + formatNum(correct)
    ],
    'nat-add-no-carry'
  );
});

def('nat-add-carry', 'Addition (With Carry)', 'Natural Numbers', 1, 6, function(lv) {
  let a, b;
  const levels = [
    [1, 1, 5, 9],
    [2, 2, 10, 50],
    [2, 2, 50, 99],
    [3, 2, 100, 500],
    [3, 3, 100, 500],
    [4, 3, 1000, 5000]
  ];
  const [d1, d2, lo, hi] = levels[Math.min(clamp(lv, 1, 6) - 1, 5)];
  for (let tries = 0; tries < 200; tries++) {
    a = randInt(Math.max(lo, Math.pow(10, d1 - 1)), Math.min(hi, Math.pow(10, d1) - 1));
    b = randInt(Math.max(lo, Math.pow(10, d2 - 1)), Math.min(hi, Math.pow(10, d2) - 1));
    let hasCarry = false;
    for (let t = a, u = b; t > 0 || u > 0; t = Math.floor(t / 10), u = Math.floor(u / 10)) {
      if ((t % 10) + (u % 10) >= 10) { hasCarry = true; break; }
    }
    if (hasCarry) break;
  }
  const correct = a + b;
  const steps = [];
  let ta = a, tb = b, carry = 0, place = 1;
  while (ta > 0 || tb > 0 || carry > 0) {
    const da = ta % 10, db = tb % 10;
    const sum = da + db + carry;
    const digit = sum % 10;
    steps.push('  ' + da + ' + ' + db + (carry ? ' + ' + carry + ' (carry)' : '') + ' = ' + sum + ' → write ' + digit + (sum >= 10 ? ', carry ' + Math.floor(sum / 10) : ''));
    carry = Math.floor(sum / 10);
    ta = Math.floor(ta / 10);
    tb = Math.floor(tb / 10);
    place *= 10;
  }
  return wrap(
    formatNum(a) + ' + ' + formatNum(b),
    correct,
    [correct - 9, correct + 9, correct - 10 * Math.floor(correct / 100 || 1), correct + 10 * Math.floor(correct / 100 || 1), correct - 1, correct + 1],
    formatNum(a) + ' + ' + formatNum(b) + ' = ' + formatNum(correct),
    ['Add column by column, carrying when sum ≥ 10:', ...steps, 'Result: ' + formatNum(correct)],
    'nat-add-carry'
  );
});

// ─── Natural Number Subtraction ────────────────────────────────────────

def('nat-sub-no-borrow', 'Subtraction (No Borrow)', 'Natural Numbers', 1, 4, function(lv) {
  const digs = clamp(lv, 1, 4);
  let a, b;
  for (let tries = 0; tries < 200; tries++) {
    const min = Math.pow(10, digs - 1);
    const max = Math.pow(10, digs) - 1;
    a = randInt(min, max);
    b = randInt(min, max);
    if (b > a) { [a, b] = [b, a]; }
    let ok = true;
    for (let t = a, u = b; u > 0; t = Math.floor(t / 10), u = Math.floor(u / 10)) {
      if ((t % 10) < (u % 10)) { ok = false; break; }
    }
    if (ok) break;
  }
  const correct = a - b;
  return wrap(
    formatNum(a) + ' − ' + formatNum(b),
    correct,
    [correct + 10, correct - 10, correct + 1, correct - 1, correct + 100, correct - 100],
    formatNum(a) + ' − ' + formatNum(b) + ' = ' + formatNum(correct),
    ['Subtract each column from right to left:', ...(() => { const st = []; let ta = a, tb = b; while (ta > 0 || tb > 0) { const da = ta % 10, db = tb % 10; st.push('  ' + da + ' − ' + db + ' = ' + (da - db)); ta = Math.floor(ta / 10); tb = Math.floor(tb / 10); } return st; })(), 'Result: ' + formatNum(correct)],
    'nat-sub-no-borrow'
  );
});

def('nat-sub-borrow', 'Subtraction (With Borrow)', 'Natural Numbers', 2, 6, function(lv) {
  let a, b;
  const configs = [
    [2, 1], [2, 2], [3, 2], [3, 3], [4, 3]
  ];
  const [d1, d2] = configs[Math.min(clamp(lv, 2, 6) - 2, 4)];
  for (let tries = 0; tries < 200; tries++) {
    const min1 = Math.pow(10, d1 - 1);
    const max1 = Math.pow(10, d1) - 1;
    a = randInt(min1, max1);
    b = randInt(Math.pow(10, d2 - 1), Math.min(a - 1, Math.pow(10, d2) - 1));
    if (b <= 0) continue;
    let needsBorrow = false;
    for (let t = a, u = b; u > 0; t = Math.floor(t / 10), u = Math.floor(u / 10)) {
      if ((t % 10) < (u % 10)) { needsBorrow = true; break; }
    }
    if (needsBorrow) { break; }
  }
  const correct = a - b;
  const steps = [];
  let ta = a, tb = b;
  const aDigits = [], bDigits = [];
  while (ta > 0 || tb > 0) {
    aDigits.push(ta % 10);
    bDigits.push(tb % 10);
    ta = Math.floor(ta / 10);
    tb = Math.floor(tb / 10);
  }
  let borrow = 0;
  for (let i = 0; i < aDigits.length; i++) {
    let da = aDigits[i] - borrow;
    const db = i < bDigits.length ? bDigits[i] : 0;
    if (da < db) {
      steps.push('  Borrow 1 from the next column: ' + (da + 10) + ' − ' + db + ' = ' + ((da + 10) - db));
      borrow = 1;
    } else {
      steps.push('  ' + da + ' − ' + db + ' = ' + (da - db));
      borrow = 0;
    }
  }
  return wrap(
    formatNum(a) + ' − ' + formatNum(b),
    correct,
    [correct + 10, correct - 10, correct + 9, correct - 9, Math.abs(correct) < 20 ? correct + 100 : correct + 99],
    formatNum(a) + ' − ' + formatNum(b) + ' = ' + formatNum(correct),
    ['Subtract column by column, borrowing when needed:', ...steps, 'Result: ' + formatNum(correct)],
    'nat-sub-borrow'
  );
});

// ─── Multiplication ────────────────────────────────────────────────────

def('nat-mul', 'Multiplication', 'Natural Numbers', 1, 6, function(lv) {
  const configs = [
    [1, 1, 2, 9],
    [2, 1, 10, 9],
    [2, 2, 10, 30],
    [3, 1, 100, 9],
    [3, 2, 100, 30],
    [3, 3, 100, 100]
  ];
  const [d1, d2, rMin, rMax] = configs[Math.min(clamp(lv, 1, 6) - 1, 5)];
  const min1 = Math.pow(10, d1 - 1);
  const max1 = Math.pow(10, d1) - 1;
  const a = randInt(min1, Math.max(min1, Math.min(rMin * 2, max1)));
  const b = d2 === 1 ? randInt(rMax > 9 ? 2 : rMax > 4 ? 2 : 2, rMax) : randInt(Math.pow(10, d2 - 1), Math.min(rMax, Math.pow(10, d2) - 1));
  const correct = a * b;
  return wrap(
    formatNum(a) + ' × ' + formatNum(b),
    correct,
    [correct + a, correct + b, correct - a, correct - b, Math.round(correct * 0.5), correct + 10 * Math.floor(correct / 10), correct + Math.floor(correct / 10)],
    formatNum(a) + ' × ' + formatNum(b) + ' = ' + formatNum(correct),
    (a < 20 && b < 20)
      ? [formatNum(a) + ' × ' + formatNum(b) + ' = ' + formatNum(correct)]
      : ['Break ' + formatNum(b) + ' into parts:', ...(() => { const st = []; let t = b, p = 1; while (t > 0) { const d = t % 10; if (d > 0) st.push('  ' + formatNum(a) + ' × ' + d + ' = ' + (a * d) + ' (×' + p + ')'); t = Math.floor(t / 10); p *= 10; } return st; })(), 'Add the partial products: ' + formatNum(correct)],
    'nat-mul'
  );
});

// ─── Integer Operations ────────────────────────────────────────────────

def('int-add', 'Integer Addition', 'Integers', 1, 6, function(lv) {
  const ranges = [[1, 9], [1, 20], [1, 50], [1, 100], [1, 200], [1, 500]];
  const [lo, hi] = ranges[Math.min(clamp(lv, 1, 6) - 1, 5)];
  const a = rand(1, -1) * randInt(lo, hi);
  const b = rand(1, -1) * randInt(lo, hi);
  const correct = a + b;
  const signA = a >= 0 ? '' : '−';
  const signB = b >= 0 ? (b >= 0 ? '+' : '') : '';
  const bStr = b >= 0 ? '+ ' + b : '− ' + Math.abs(b);
  return wrap(
    (a >= 0 ? formatNum(a) : '−' + formatNum(Math.abs(a))) + ' ' + bStr,
    correct,
    [-(a + b), a - b, b - a, a + b + rand(1, -1) * randInt(1, 5), a + b + randInt(1, 5) * Math.sign(correct || 1)],
    formatNum(a) + ' + ' + (b >= 0 ? '+' : '') + formatNum(b) + ' = ' + formatNum(correct),
    [
      'Signs: ' + (a >= 0 ? 'positive' : 'negative') + ' + ' + (b >= 0 ? 'positive' : 'negative'),
      (a >= 0 && b >= 0) ? 'Both positive: add absolute values → ' + formatNum(correct) :
      (a < 0 && b < 0) ? 'Both negative: add absolute values, keep negative → −' + formatNum(Math.abs(correct)) :
      'Different signs: subtract smaller from larger, keep sign of larger → ' + formatNum(correct)
    ],
    'int-add'
  );
});

def('int-sub', 'Integer Subtraction', 'Integers', 1, 6, function(lv) {
  const ranges = [[1, 9], [1, 20], [1, 50], [1, 100], [1, 200], [1, 500]];
  const [lo, hi] = ranges[Math.min(clamp(lv, 1, 6) - 1, 5)];
  const a = rand(1, -1) * randInt(lo, hi);
  const b = rand(1, -1) * randInt(lo, hi);
  const correct = a - b;
  const bStr = b >= 0 ? formatNum(b) : '( −' + formatNum(Math.abs(b)) + ')';
  return wrap(
    (a >= 0 ? formatNum(a) : '−' + formatNum(Math.abs(a))) + ' − ' + bStr,
    correct,
    [a + b, b - a, -(a - b), a - b + rand(1, -1) * randInt(1, 5), correct + randInt(1, 5) * Math.sign(correct || 1)],
    formatNum(a) + ' − ' + formatNum(b) + ' = ' + formatNum(correct),
    [
      'Rewrite: ' + formatNum(a) + ' − ' + formatNum(b) + ' = ' + formatNum(a) + ' + (−' + formatNum(b) + ')',
      'Now add: ' + formatNum(a) + ' + ' + formatNum(-b) + ' = ' + formatNum(correct)
    ],
    'int-sub'
  );
});

def('int-mul', 'Integer Multiplication', 'Integers', 1, 5, function(lv) {
  const ranges = [[1, 9], [1, 12], [1, 20], [1, 50], [1, 100]];
  const [lo, hi] = ranges[Math.min(clamp(lv, 1, 5) - 1, 4)];
  const a = rand(1, -1) * randInt(lo, hi);
  const b = rand(1, -1) * randInt(lo, hi);
  const correct = a * b;
  return wrap(
    (a >= 0 ? formatNum(a) : '−' + formatNum(Math.abs(a))) + ' × ' + (b >= 0 ? formatNum(b) : '−' + formatNum(Math.abs(b))),
    correct,
    [Math.abs(a * b), -(a * b), a * Math.abs(b), Math.abs(a) * b, a * b + rand(1, -1) * randInt(1, Math.min(Math.abs(a * b), 10))],
    formatNum(a) + ' × ' + formatNum(b) + ' = ' + formatNum(correct),
    [
      'Multiply absolute values: ' + formatNum(Math.abs(a)) + ' × ' + formatNum(Math.abs(b)) + ' = ' + formatNum(Math.abs(correct)),
      'Sign: ' + (correct > 0 ? 'positive (same signs)' : 'negative (different signs)'),
      'Result: ' + formatNum(correct)
    ],
    'int-mul'
  );
});

def('int-div', 'Integer Division', 'Integers', 2, 6, function(lv) {
  const ranges = [[1, 12], [1, 20], [1, 30], [1, 50], [1, 100]];
  const [lo, hi] = ranges[Math.min(clamp(lv, 2, 6) - 2, 4)];
  const divisor = randInt(lo, hi);
  const quotient = randInt(lo, Math.min(hi, 50));
  const a = divisor * quotient;
  const sign = rand(1, -1);
  const dividend = sign * a;
  const divSign = rand(1, -1);
  const signedDivisor = divSign * divisor;
  const correct = quotient * sign * divSign;
  return wrap(
    (dividend >= 0 ? formatNum(dividend) : '−' + formatNum(Math.abs(dividend))) + ' ÷ ' + (signedDivisor >= 0 ? formatNum(signedDivisor) : '−' + formatNum(Math.abs(signedDivisor))),
    correct,
    [Math.abs(correct), -correct, correct + rand(1, -1) * randInt(1, 5), Math.abs(correct) + rand(1, -1) * randInt(1, 5)],
    formatNum(dividend) + ' ÷ ' + formatNum(signedDivisor) + ' = ' + formatNum(correct),
    [
      'Divide absolute values: ' + formatNum(Math.abs(dividend)) + ' ÷ ' + formatNum(Math.abs(signedDivisor)) + ' = ' + formatNum(Math.abs(correct)),
      'Sign: ' + (correct > 0 ? 'positive (same signs)' : 'negative (different signs)'),
      'Check: ' + formatNum(correct) + ' × ' + formatNum(signedDivisor) + ' = ' + formatNum(correct * signedDivisor)
    ],
    'int-div'
  );
});

// ─── Rational Numbers ──────────────────────────────────────────────────

def('frac-add', 'Fraction Addition', 'Rational Numbers', 2, 7, function(lv) {
  const denoms = [[2, 4], [3, 5], [2, 6], [4, 8], [3, 7], [5, 9]];
  const [d1, d2] = denoms[Math.min(clamp(lv, 2, 7) - 2, 5)];
  const den1 = randInt(d1, Math.min(d1 + 2, 9));
  const den2 = randInt(d2, Math.min(d2 + 2, 9));
  const num1 = randInt(1, den1 - 1);
  const num2 = randInt(1, den2 - 1);
  const l = lcm(den1, den2);
  const newNum1 = num1 * (l / den1);
  const newNum2 = num2 * (l / den2);
  const [rNum, rDen] = simplifyFrac(newNum1 + newNum2, l);
  const correctStr = rDen === 1 ? String(rNum) : rNum + '/' + rDen;
  const wrongs = generateWrongsFrac(rNum, rDen, 3);
  const options = genQ(correctStr, ...wrongs);
  return {
    question: fracStr(num1, den1) + ' + ' + fracStr(num2, den2),
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: fracStr(num1, den1) + ' + ' + fracStr(num2, den2) + ' = ' + correctStr,
    solutionSteps: [
      'LCM of ' + den1 + ' and ' + den2 + ' = ' + l,
      'Convert: ' + fracStr(num1, den1) + ' = ' + fracStr(newNum1, l) + ',  ' + fracStr(num2, den2) + ' = ' + fracStr(newNum2, l),
      'Add: ' + fracStr(newNum1, l) + ' + ' + fracStr(newNum2, l) + ' = ' + fracStr(newNum1 + newNum2, l),
      (rDen !== l || rNum !== newNum1 + newNum2) ? 'Simplify: ' + fracStr(newNum1 + newNum2, l) + ' = ' + correctStr : 'Already in lowest terms'
    ],
    subTopic: 'frac-add'
  };
});

def('frac-sub', 'Fraction Subtraction', 'Rational Numbers', 2, 7, function(lv) {
  const denoms = [[2, 4], [3, 5], [2, 6], [4, 8], [3, 7], [5, 9]];
  const [d1, d2] = denoms[Math.min(clamp(lv, 2, 7) - 2, 5)];
  const den1 = randInt(d1, Math.min(d1 + 2, 9));
  const den2 = randInt(d2, Math.min(d2 + 2, 9));
  let num1 = randInt(1, den1 - 1);
  let num2 = randInt(1, den2 - 1);
  const l = lcm(den1, den2);
  const newNum1 = num1 * (l / den1);
  let newNum2 = num2 * (l / den2);
  const [rNum, rDen] = simplifyFrac(newNum1 - newNum2, l);
  const correctStr = rDen === 1 ? String(rNum) : rNum + '/' + rDen;
  const wrongs = generateWrongsFrac(rNum, rDen, 3);
  const options = genQ(correctStr, ...wrongs);
  return {
    question: fracStr(num1, den1) + ' − ' + fracStr(num2, den2),
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: fracStr(num1, den1) + ' − ' + fracStr(num2, den2) + ' = ' + correctStr,
    solutionSteps: [
      'LCM of ' + den1 + ' and ' + den2 + ' = ' + l,
      'Convert: ' + fracStr(num1, den1) + ' = ' + fracStr(newNum1, l) + ',  ' + fracStr(num2, den2) + ' = ' + fracStr(newNum2, l),
      'Subtract: ' + fracStr(newNum1, l) + ' − ' + fracStr(newNum2, l) + ' = ' + fracStr(newNum1 - newNum2, l),
      (rDen !== l || rNum !== newNum1 - newNum2) ? 'Simplify: ' + fracStr(newNum1 - newNum2, l) + ' = ' + correctStr : 'Already in lowest terms'
    ],
    subTopic: 'frac-sub'
  };
});

def('frac-mul', 'Fraction Multiplication', 'Rational Numbers', 2, 6, function(lv) {
  const ranges = [[3, 2], [5, 3], [7, 4], [9, 5], [12, 7]];
  const [r1, r2] = ranges[Math.min(clamp(lv, 2, 6) - 2, 4)];
  const num1 = randInt(1, r1);
  const den1 = randInt(2, r1);
  const num2 = randInt(1, r2);
  const den2 = randInt(2, r2);
  const [rNum, rDen] = simplifyFrac(num1 * num2, den1 * den2);
  const correctStr = rDen === 1 ? String(rNum) : rNum + '/' + rDen;
  const wrongs = generateWrongsFrac(rNum, rDen, 3);
  const options = genQ(correctStr, ...wrongs);
  return {
    question: fracStr(num1, den1) + ' × ' + fracStr(num2, den2),
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: fracStr(num1, den1) + ' × ' + fracStr(num2, den2) + ' = ' + correctStr,
    solutionSteps: [
      'Multiply numerators: ' + num1 + ' × ' + num2 + ' = ' + (num1 * num2),
      'Multiply denominators: ' + den1 + ' × ' + den2 + ' = ' + (den1 * den2),
      'Result: ' + fracStr(num1 * num2, den1 * den2),
      (rDen !== den1 * den2 || rNum !== num1 * num2) ? 'Simplify: ' + fracStr(num1 * num2, den1 * den2) + ' = ' + correctStr : 'Already in lowest terms'
    ],
    subTopic: 'frac-mul'
  };
});

def('frac-div', 'Fraction Division', 'Rational Numbers', 3, 8, function(lv) {
  const ranges = [[3, 2], [5, 3], [7, 4], [9, 5], [12, 7], [15, 9]];
  const [r1, r2] = ranges[Math.min(clamp(lv, 3, 8) - 3, 5)];
  const num1 = randInt(1, r1);
  const den1 = randInt(2, r1);
  const num2 = randInt(1, r2);
  const den2 = randInt(2, r2);
  const [rNum, rDen] = simplifyFrac(num1 * den2, den1 * num2);
  const correctStr = rDen === 1 ? String(rNum) : rNum + '/' + rDen;
  const wrongs = generateWrongsFrac(rNum, rDen, 3);
  const options = genQ(correctStr, ...wrongs);
  return {
    question: fracStr(num1, den1) + ' ÷ ' + fracStr(num2, den2),
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: fracStr(num1, den1) + ' ÷ ' + fracStr(num2, den2) + ' = ' + correctStr,
    solutionSteps: [
      'Flip the second fraction (reciprocal): ' + fracStr(num2, den2) + ' → ' + fracStr(den2, num2),
      'Multiply: ' + fracStr(num1, den1) + ' × ' + fracStr(den2, num2),
      '= ' + fracStr(num1 * den2, den1 * num2),
      (rDen !== den1 * num2 || rNum !== num1 * den2) ? 'Simplify: ' + fracStr(num1 * den2, den1 * num2) + ' = ' + correctStr : 'Already in lowest terms'
    ],
    subTopic: 'frac-div'
  };
});

def('frac-simplify', 'Simplify Fractions', 'Rational Numbers', 1, 5, function(lv) {
  const ranges = [[6, 12], [10, 24], [15, 36], [20, 50], [30, 72]];
  const [lo, hi] = ranges[Math.min(clamp(lv, 1, 5) - 1, 4)];
  const factor = randInt(2, Math.min(6, Math.floor(hi / lo)));
  const baseNum = randInt(1, Math.floor(lo / factor));
  const baseDen = randInt(2, Math.floor(lo / factor));
  const num = baseNum * factor;
  const den = baseDen * factor;
  const correctStr = fracStr(baseNum, baseDen);
  const originalStr = fracStr(num, den);
  const wrongs = generateWrongsFrac(baseNum, baseDen, 3);
  const options = genQ(correctStr, ...wrongs);
  return {
    question: 'Simplify: ' + originalStr,
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: originalStr + ' = ' + correctStr,
    solutionSteps: [
      'Find GCD of numerator and denominator:',
      '  ' + num + ' and ' + den + ' → GCD = ' + factor,
      'Divide both by GCD:',
      '  ' + num + ' ÷ ' + factor + ' = ' + baseNum,
      '  ' + den + ' ÷ ' + factor + ' = ' + baseDen,
      'Result: ' + originalStr + ' = ' + correctStr
    ],
    subTopic: 'frac-simplify'
  };
});

def('frac-compare', 'Compare Fractions', 'Rational Numbers', 2, 6, function(lv) {
  const ranges = [[3, 5], [5, 7], [7, 10], [8, 12], [10, 15]];
  const [r1, r2] = ranges[Math.min(clamp(lv, 2, 6) - 2, 4)];
  const den1 = randInt(2, r1);
  const den2 = randInt(2, r2);
  let num1 = randInt(1, den1 - 1);
  let num2 = randInt(1, den2 - 1);
  const l = lcm(den1, den2);
  const v1 = num1 * l / den1;
  const v2 = num2 * l / den2;
  const cmp = v1 > v2 ? '>' : v1 < v2 ? '<' : '=';
  const correctStr = fracStr(num1, den1) + ' ' + cmp + ' ' + fracStr(num2, den2);
  const allSymbols = ['>', '<', '='];
  const otherSymbols = allSymbols.filter(s => s !== cmp);
  const wrongs = [
    fracStr(num1, den1) + ' ' + otherSymbols[0] + ' ' + fracStr(num2, den2),
    fracStr(num1, den1) + ' ' + otherSymbols[1] + ' ' + fracStr(num2, den2),
    fracStr(num2, den2) + ' ' + cmp + ' ' + fracStr(num1, den1)
  ];
  const options = genQ(correctStr, ...wrongs);
  return {
    question: 'Which symbol makes this true? ' + fracStr(num1, den1) + ' __ ' + fracStr(num2, den2),
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: fracStr(num1, den1) + ' ' + cmp + ' ' + fracStr(num2, den2),
    solutionSteps: [
      'Find common denominator: ' + den1 + ', ' + den2 + ' → LCM = ' + l,
      'Convert: ' + fracStr(num1, den1) + ' = ' + fracStr(v1, l),
      'Convert: ' + fracStr(num2, den2) + ' = ' + fracStr(v2, l),
      'Compare numerators: ' + v1 + ' ' + cmp + ' ' + v2,
      'So ' + fracStr(num1, den1) + ' ' + cmp + ' ' + fracStr(num2, den2)
    ],
    subTopic: 'frac-compare'
  };
});

// ─── Exponents ─────────────────────────────────────────────────────────

def('pow-basic', 'Power Evaluation', 'Exponents', 1, 5, function(lv) {
  const configs = [[2, 4, 2, 5], [2, 6, 2, 4], [3, 8, 2, 4], [2, 10, 2, 3], [2, 12, 3, 4]];
  const [baseLo, baseHi, expLo, expHi] = configs[Math.min(clamp(lv, 1, 5) - 1, 4)];
  const base = randInt(baseLo, baseHi);
  const exp = randInt(expLo, expHi);
  const correct = Math.pow(base, exp);
  return wrap(
    base + '<sup>' + exp + '</sup>',
    correct,
    [base * exp, Math.pow(base, exp - 1), Math.pow(base + 1, exp), correct + base, correct - base, Math.pow(base, exp + 1)],
    base + '^' + exp + ' = ' + formatNum(correct),
    [
      'Multiply ' + base + ' by itself ' + exp + ' times:',
      ...(() => { const st = [base + '^1 = ' + base]; let v = base; for (let i = 2; i <= exp; i++) { v *= base; st.push(base + '^' + i + ' = ' + v); } return st; })(),
      'Result: ' + formatNum(correct)
    ],
    'pow-basic'
  );
});

def('pow-product', 'Product of Powers', 'Exponents', 3, 7, function(lv) {
  const bases = [2, 3, 5, 6, 10];
  const base = pickRandom(bases);
  const expRanges = [[1, 3], [2, 4], [2, 5], [3, 5], [3, 6]];
  const [eLo, eHi] = expRanges[Math.min(clamp(lv, 3, 7) - 3, 4)];
  const exp1 = randInt(eLo, eHi);
  const exp2 = randInt(eLo, eHi);
  const correct = Math.pow(base, exp1 + exp2);
  return wrap(
    base + '<sup>' + exp1 + '</sup> × ' + base + '<sup>' + exp2 + '</sup>',
    correct,
    [Math.pow(base, exp1) + Math.pow(base, exp2), Math.pow(base, exp1 * exp2), Math.pow(base, exp1) * exp2, Math.pow(base, exp1) * Math.pow(base, exp2) + randInt(-10, 10)],
    base + '^' + exp1 + ' × ' + base + '^' + exp2 + ' = ' + base + '^' + (exp1 + exp2) + ' = ' + formatNum(correct),
    [
      'Rule: a^m × a^n = a^(m + n)',
      'Add exponents: ' + exp1 + ' + ' + exp2 + ' = ' + (exp1 + exp2),
      'Compute: ' + base + '^' + (exp1 + exp2) + ' = ' + formatNum(correct)
    ],
    'pow-product'
  );
});

def('pow-power', 'Power of a Power', 'Exponents', 4, 8, function(lv) {
  const bases = [2, 3, 5];
  const base = pickRandom(bases);
  const expRanges = [[1, 3], [2, 3], [2, 4], [3, 4], [3, 5]];
  const [eLo, eHi] = expRanges[Math.min(clamp(lv, 4, 8) - 4, 4)];
  const exp1 = randInt(eLo, eHi);
  const exp2 = randInt(eLo, eHi);
  const correct = Math.pow(base, exp1 * exp2);
  return wrap(
    '(' + base + '<sup>' + exp1 + '</sup>)<sup>' + exp2 + '</sup>',
    correct,
    [Math.pow(Math.pow(base, exp1), exp2 - 1), Math.pow(base, exp1 + exp2), Math.pow(base, exp1 * exp2) + randInt(-5, 5), Math.pow(base * exp1, exp2)],
    '(' + base + '^' + exp1 + ')^' + exp2 + ' = ' + base + '^' + (exp1 * exp2) + ' = ' + formatNum(correct),
    [
      'Rule: (a^m)^n = a^(m × n)',
      'Multiply exponents: ' + exp1 + ' × ' + exp2 + ' = ' + (exp1 * exp2),
      'Compute: ' + base + '^' + (exp1 * exp2) + ' = ' + formatNum(correct)
    ],
    'pow-power'
  );
});

def('pow-neg', 'Negative Exponents', 'Exponents', 3, 7, function(lv) {
  const configs = [[2, 4, 1, 3], [2, 5, 1, 3], [3, 6, 2, 3], [2, 8, 2, 4], [3, 10, 2, 4]];
  const [bLo, bHi, eLo, eHi] = configs[Math.min(clamp(lv, 3, 7) - 3, 4)];
  const base = randInt(bLo, bHi);
  const exp = randInt(eLo, eHi);
  const pow = Math.pow(base, exp);
  const correctStr = '1/' + pow;
  const wrongs = ['−' + pow, String(-pow), String(pow), '1/' + (pow + 1), '1/' + (pow - 1), String(exp * base)];
  const options = genQ(correctStr, ...wrongs);
  return {
    question: base + '<sup>−' + exp + '</sup>',
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: base + '^−' + exp + ' = 1/' + base + '^' + exp + ' = 1/' + pow,
    solutionSteps: [
      'Rule: a^(−n) = 1 / a^n',
      'Compute: ' + base + '^' + exp + ' = ' + pow,
      'Result: 1 / ' + pow + ' = ' + correctStr
    ],
    subTopic: 'pow-neg'
  };
});

// ─── Logarithms ────────────────────────────────────────────────────────

def('log-basic', 'Logarithm Evaluation', 'Logarithms', 3, 7, function(lv) {
  const configs = [
    [2, 1, 5], [2, 2, 7], [3, 2, 5], [4, 2, 4], [5, 2, 3]
  ];
  const [base, minE, maxE] = configs[Math.min(clamp(lv, 3, 7) - 3, 4)];
  const exp = randInt(minE, maxE);
  const arg = Math.pow(base, exp);
  return wrap(
    'log<sub>' + base + '</sub>(' + arg + ')',
    exp,
    [exp + 1, exp - 1, base, arg, arg / base, exp * base],
    'log_' + base + '(' + arg + ') = ' + exp,
    [
      'Ask: ' + base + ' raised to what power equals ' + arg + '?',
      base + '^' + exp + ' = ' + arg,
      'So log_' + base + '(' + arg + ') = ' + exp
    ],
    'log-basic'
  );
});

def('log-sum', 'Logarithm Sum', 'Logarithms', 4, 8, function(lv) {
  const configs = [[2, 2, 4], [2, 3, 5], [3, 2, 4], [5, 2, 3], [2, 4, 6]];
  const [base, minE, maxE] = configs[Math.min(clamp(lv, 4, 8) - 4, 4)];
  const exp1 = randInt(minE, maxE);
  const exp2 = randInt(minE, maxE);
  const a1 = Math.pow(base, exp1);
  const a2 = Math.pow(base, exp2);
  const correct = exp1 + exp2;
  return wrap(
    'log<sub>' + base + '</sub>(' + a1 + ') + log<sub>' + base + '</sub>(' + a2 + ')',
    correct,
    [exp1 * exp2, Math.abs(exp1 - exp2), exp1 + exp2 + 1, exp1 + exp2 - 1, a1 + a2],
    'log_' + base + '(' + a1 + ') + log_' + base + '(' + a2 + ') = ' + correct,
    [
      'Rule: log(a) + log(b) = log(a × b)',
      'Evaluate each: log_' + base + '(' + a1 + ') = ' + exp1 + ',  log_' + base + '(' + a2 + ') = ' + exp2,
      'Sum: ' + exp1 + ' + ' + exp2 + ' = ' + correct,
      'Alternatively: log_' + base + '(' + (a1 * a2) + ') = ' + correct
    ],
    'log-sum'
  );
});

def('log-diff', 'Logarithm Difference', 'Logarithms', 4, 8, function(lv) {
  const configs = [[2, 2, 5], [2, 3, 6], [3, 2, 5], [5, 2, 4], [2, 4, 7]];
  const [base, minE, maxE] = configs[Math.min(clamp(lv, 4, 8) - 4, 4)];
  const exp1 = randInt(minE + 1, maxE);
  const exp2 = randInt(minE, exp1 - 1);
  const a1 = Math.pow(base, exp1);
  const a2 = Math.pow(base, exp2);
  const correct = exp1 - exp2;
  return wrap(
    'log<sub>' + base + '</sub>(' + a1 + ') − log<sub>' + base + '</sub>(' + a2 + ')',
    correct,
    [exp1 + exp2, exp2 - exp1, exp1 - exp2 + 1, exp1 - exp2 - 1, Math.abs(a1 - a2)],
    'log_' + base + '(' + a1 + ') − log_' + base + '(' + a2 + ') = ' + correct,
    [
      'Rule: log(a) − log(b) = log(a ÷ b)',
      'Evaluate each: log_' + base + '(' + a1 + ') = ' + exp1 + ',  log_' + base + '(' + a2 + ') = ' + exp2,
      'Difference: ' + exp1 + ' − ' + exp2 + ' = ' + correct,
      'Alternatively: log_' + base + '(' + Math.round(a1 / a2) + ') = ' + correct
    ],
    'log-diff'
  );
});

def('log-change', 'Change of Base', 'Logarithms', 5, 9, function(lv) {
  const configs = [
    [4, 8, 2], [8, 32, 2], [9, 27, 3], [25, 125, 5], [4, 32, 2], [27, 81, 3]
  ];
  const [base, arg, newBase] = pickRandom(configs);
  const expB = Math.round(Math.log(base) / Math.log(newBase));
  const expA = Math.round(Math.log(arg) / Math.log(newBase));
  const [rNum, rDen] = simplifyFrac(expA, expB);
  const correctStr = rDen === 1 ? String(rNum) : fracStr(rNum, rDen);
  const wrongs = [
    fracStr(rNum + 1, rDen), fracStr(rNum, rDen + 1),
    fracStr(Math.abs(rNum - rDen), rDen),
    String(Math.round(rNum / rDen) || 0),
    String(Math.round(rNum / rDen) + 1)
  ];
  const uniqueWrongs = [...new Set(wrongs.filter(w => w !== correctStr))].slice(0, 3);
  while (uniqueWrongs.length < 3) uniqueWrongs.push(String(Math.round(rNum / rDen) + uniqueWrongs.length));
  const options = genQ(correctStr, ...uniqueWrongs);
  return {
    question: 'log<sub>' + base + '</sub>(' + arg + ')',
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: 'log_' + base + '(' + arg + ') = ' + correctStr,
    solutionSteps: [
      'Rewrite with common base ' + newBase + ':',
      newBase + '^' + expB + ' = ' + base + ',  ' + newBase + '^' + expA + ' = ' + arg,
      'So log_' + base + '(' + arg + ') = ' + expA + '/' + expB + ' = ' + correctStr
    ],
    subTopic: 'log-change'
  };
});

// ─── Quadratics ────────────────────────────────────────────────────────

def('quad-roots', 'Quadratic Roots', 'Quadratics', 4, 9, function(lv) {
  const rRanges = [[1, 5], [1, 8], [1, 12], [1, 15], [-5, 5], [-10, 10]];
  const [rLo, rHi] = rRanges[Math.min(clamp(lv, 4, 9) - 4, 5)];
  const r1 = randInt(rLo, rHi);
  let r2 = randInt(rLo, rHi);
  if (r2 === r1) r2 = r1 + rand(1, -1, 2, -2);
  const b = -(r1 + r2);
  const c = r1 * r2;
  const correctStr = r1 + ', ' + r2;
  const wrongs = [
    (-r1) + ', ' + (-r2),
    (r1 + 1) + ', ' + (r2 - 1),
    (r1 - 1) + ', ' + (r2 + 1),
    (r1 * r2) + ', ' + (r1 + r2),
    r1 + ', ' + (-r2)
  ];
  const options = genQ(correctStr, ...wrongs);
  return {
    question: 'Find the roots of: x<sup>2</sup> ' + (b < 0 ? '− ' + Math.abs(b) : '+ ' + b) + 'x ' + (c < 0 ? '− ' + Math.abs(c) : '+ ' + c) + ' = 0',
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: 'x = ' + r1 + ', x = ' + r2,
    solutionSteps: [
      'Find two numbers that multiply to ' + c + ' and add to ' + (-b) + ':',
      '  ' + r1 + ' × ' + r2 + ' = ' + c,
      '  ' + r1 + ' + ' + r2 + ' = ' + (-b),
      'Therefore the factors are (x ' + (r1 > 0 ? '− ' + r1 : '+ ' + Math.abs(r1)) + ')(x ' + (r2 > 0 ? '− ' + r2 : '+ ' + Math.abs(r2)) + ')',
      'Roots: x = ' + r1 + ', x = ' + r2
    ],
    subTopic: 'quad-roots'
  };
});

def('quad-disc', 'Quadratic Discriminant', 'Quadratics', 5, 9, function(lv) {
  const configs = [[1, 5, 1, 5], [1, 7, 1, 7], [1, 10, 1, 10], [2, 5, 1, 8], [1, 12, 1, 12]];
  const [aLo, aHi, cLo, cHi] = configs[Math.min(clamp(lv, 5, 9) - 5, 4)];
  const a = randInt(aLo, aHi);
  const b = randInt(-10, 10);
  const c = randInt(cLo, cHi);
  const disc = b * b - 4 * a * c;
  const eqStr = formatNum(a) + 'x<sup>2</sup> ' + (b < 0 ? '− ' + Math.abs(b) : '+ ' + b) + 'x ' + (c < 0 ? '− ' + Math.abs(c) : '+ ' + c) + ' = 0';
  return wrap(
    'Find the discriminant of: ' + eqStr,
    disc,
    [b * b + 4 * a * c, Math.sqrt(Math.abs(disc)), disc + 4 * a, disc - 4 * a, (b * b) - 2 * a * c, 4 * a * c - b * b],
    'D = b² − 4ac = ' + disc,
    [
      'Formula: D = b² − 4ac',
      'a = ' + a + ', b = ' + b + ', c = ' + c,
      'b² = ' + (b * b) + ',  4ac = ' + (4 * a * c),
      'D = ' + (b * b) + ' − ' + (4 * a * c) + ' = ' + disc
    ],
    'quad-disc'
  );
});

def('quad-sum-prod', 'Sum & Product of Roots', 'Quadratics', 4, 8, function(lv) {
  const configs = [[1, 5, 1, 6], [1, 7, 1, 8], [1, 10, 1, 10], [2, 6, 1, 9], [3, 8, 2, 12]];
  const [aLo, aHi, rLo, rHi] = configs[Math.min(clamp(lv, 4, 8) - 4, 4)];
  const a = randInt(aLo, aHi);
  const r1 = randInt(rLo, rHi);
  const r2 = randInt(rLo, rHi);
  const b = -(r1 + r2) * a;
  const c = a * r1 * r2;
  const sum = r1 + r2;
  const prod = r1 * r2;
  const askSum = Math.random() > 0.5;
  const correctVal = askSum ? -b / a : c / a;
  return wrap(
    (askSum ? 'Sum of roots' : 'Product of roots') + ' of: ' + a + 'x<sup>2</sup> ' + (b < 0 ? '− ' + Math.abs(b) : '+ ' + b) + 'x ' + (c < 0 ? '− ' + Math.abs(c) : '+ ' + c) + ' = 0',
    correctVal,
    [askSum ? c / a : -b / a, askSum ? -(b / a) + 1 : c / a + 1, askSum ? -(b / a) - 1 : c / a - 1, askSum ? b / a : -c / a],
    (askSum ? 'Sum' : 'Product') + ' = ' + correctVal,
    [
      'For ax² + bx + c = 0:',
      askSum ? 'Sum of roots = −b/a' : 'Product of roots = c/a',
      askSum ? 'Sum = −(' + b + ')/' + a + ' = ' + correctVal : 'Product = ' + c + '/' + a + ' = ' + correctVal
    ],
    'quad-sum-prod'
  );
});

def('quad-ineq', 'Quadratic Inequality', 'Quadratics', 5, 10, function(lv) {
  const ranges = [[1, 5], [1, 8], [1, 12], [-3, 5], [-5, 8]];
  const [lo, hi] = ranges[Math.min(clamp(lv, 5, 10) - 5, 4)];
  const r1 = randInt(lo, hi);
  const r2 = randInt(lo, hi);
  const a = 1;
  const b = -(r1 + r2);
  const c = r1 * r2;
  const useLess = Math.random() > 0.5;
  if (r1 > r2) { [r1, r2] = [r2, r1]; }
  const correctStr = useLess
    ? r1 + ' < x < ' + r2
    : 'x < ' + r1 + ' or x > ' + r2;
  const sign = useLess ? '<' : '>';
  const wrongs = [
    'x < ' + r2 + ' or x > ' + r1,
    r2 + ' < x < ' + r1,
    'x < ' + (r1 - 1) + ' or x > ' + (r2 + 1),
    (r1 + 1) + ' < x < ' + (r2 - 1)
  ];
  const options = genQ(correctStr, ...wrongs);
  return {
    question: 'Solve: x<sup>2</sup> ' + (b < 0 ? '− ' + Math.abs(b) : '+ ' + b) + 'x ' + (c < 0 ? '− ' + Math.abs(c) : '+ ' + c) + ' ' + sign + ' 0',
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: correctStr,
    solutionSteps: [
      'Factor: (x ' + (r1 > 0 ? '− ' + r1 : '+ ' + Math.abs(r1)) + ')(x ' + (r2 > 0 ? '− ' + r2 : '+ ' + Math.abs(r2)) + ') ' + sign + ' 0',
      'Critical points: x = ' + r1 + ', x = ' + r2,
      'Test intervals: (−∞, ' + r1 + '), (' + r1 + ', ' + r2 + '), (' + r2 + ', ∞)',
      useLess
        ? 'Expression is negative between the roots'
        : 'Expression is positive outside the roots',
      'Solution: ' + correctStr
    ],
    subTopic: 'quad-ineq'
  };
});

// ─── Inequalities & Polynomials ────────────────────────────────────────

def('mod-ineq', 'Modulus Inequality', 'Inequalities', 4, 8, function(lv) {
  const ranges = [[2, 6], [3, 10], [5, 15], [5, 20], [10, 30]];
  const [bLo, bHi] = ranges[Math.min(clamp(lv, 4, 8) - 4, 4)];
  const center = randInt(-10, 10);
  const bound = randInt(bLo, bHi);
  const useLess = Math.random() > 0.3;
  const correctStr = useLess
    ? (center - bound) + ' < x < ' + (center + bound)
    : 'x < ' + (center - bound) + ' or x > ' + (center + bound);
  const sign = useLess ? '<' : '>';
  const wrongs = [
    'x < ' + (center + bound) + ' or x > ' + (center - bound),
    (center - bound + 1) + ' < x < ' + (center + bound - 1),
    (center + bound) + ' < x < ' + (center - bound),
    'x < ' + (center - bound - 1) + ' or x > ' + (center + bound + 1)
  ];
  const options = genQ(correctStr, ...wrongs);
  return {
    question: 'Solve: |x ' + (center >= 0 ? '− ' + center : '+ ' + Math.abs(center)) + '| ' + sign + ' ' + bound,
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: correctStr,
    solutionSteps: useLess
      ? [
        '|x − ' + center + '| < ' + bound + ' means:',
        '−' + bound + ' < x − ' + center + ' < ' + bound,
        'Add ' + center + ' to all parts:',
        center + ' − ' + bound + ' < x < ' + center + ' + ' + bound,
        'Result: ' + correctStr
      ]
      : [
        '|x − ' + center + '| > ' + bound + ' means:',
        'x − ' + center + ' < −' + bound + ' OR x − ' + center + ' > ' + bound,
        'Add ' + center + ' to both:',
        'x < ' + (center - bound) + ' OR x > ' + (center + bound),
        'Result: ' + correctStr
      ],
    subTopic: 'mod-ineq'
  };
});

def('rat-root', 'Rational Root Theorem', 'Polynomials', 6, 10, function(lv) {
  const rRanges = [[1, 4], [1, 6], [1, 8], [2, 6], [2, 8]];
  const [rLo, rHi] = rRanges[Math.min(clamp(lv, 6, 10) - 6, 4)];
  const root = randInt(rLo, rHi) * rand(1, -1);
  const a = randInt(1, Math.min(3, rHi));
  const b = randInt(rLo, rHi) * rand(1, -1);
  const c = randInt(rLo, rHi) * rand(1, -1);
  const d = -(a * root * root * root + b * root * root + c * root);
  const eqStr = a + 'x<sup>3</sup> ' + (b < 0 ? '− ' + Math.abs(b) : '+ ' + b) + 'x<sup>2</sup> ' + (c < 0 ? '− ' + Math.abs(c) : '+ ' + c) + 'x ' + (d < 0 ? '− ' + Math.abs(d) : '+ ' + d) + ' = 0';
  const factorsA = [];
  const factorsD = [];
  for (let i = 1; i <= Math.abs(a); i++) if (a % i === 0) factorsA.push(i);
  for (let i = 1; i <= Math.abs(d); i++) if (d % i === 0) factorsD.push(i);
  const otherRoots = [];
  for (const fa of factorsA) {
    for (const fd of factorsD) {
      for (const sign of [1, -1]) {
        const r = sign * fd / fa;
        const val = a * Math.pow(r, 3) + b * Math.pow(r, 2) + c * r + d;
        if (Math.abs(val) < 0.001 && Math.abs(r - root) > 0.001 && !otherRoots.includes(r)) {
          otherRoots.push(r);
          if (otherRoots.length >= 2) break;
        }
      }
      if (otherRoots.length >= 2) break;
    }
    if (otherRoots.length >= 2) break;
  }
  const wrongRoots = new Set(
    [root + 1, root - 1, -root, root * 2, Math.floor(root / 2)].filter(r => r !== root && r !== 0)
  );
  const options = genQ(String(root), ...[...wrongRoots].slice(0, 3));
  return {
    question: 'Find a rational root: ' + eqStr,
    options,
    correctIndex: ansIdx(options, String(root)),
    solution: 'x = ' + root + ' is a rational root',
    solutionSteps: [
      'Rational root candidates: ±(factors of ' + d + ') / (factors of ' + a + ')',
      'Test x = ' + root + ':',
      a + '(' + root + ')³ + ' + b + '(' + root + ')² + ' + c + '(' + root + ') + ' + d,
      '= ' + (a * Math.pow(root, 3) + b * Math.pow(root, 2) + c * root + d),
      '= 0, so x = ' + root + ' is a root'
    ],
    subTopic: 'rat-root'
  };
});

// ─── Combined / Multi-step ─────────────────────────────────────────────

def('combined', 'Multi-Step Simplification', 'Mixed', 5, 10, function(lv) {
  const level = clamp(lv, 5, 10);
  const parts = [];
  let expr = '';
  let correct = 0;
  const configs = [
    function() {
      const a = randInt(2, 6);
      const b = randInt(2, 4);
      parts.push({ type: 'pow', base: a, exp: b });
      return { expr: a + '^' + b, val: Math.pow(a, b) };
    },
    function() {
      const base = randInt(2, 5);
      const exp = randInt(1, 3);
      const arg = Math.pow(base, exp);
      parts.push({ type: 'log', base, arg, exp });
      return { expr: 'log_' + base + '(' + arg + ')', val: exp };
    },
    function() {
      const a = randInt(1, 12);
      const b = randInt(1, 12);
      parts.push({ type: 'mul', a, b });
      return { expr: a + ' × ' + b, val: a * b };
    },
    function() {
      const a = randInt(1, 20);
      const b = randInt(1, 15);
      parts.push({ type: 'add', a, b });
      return { expr: a + ' + ' + b, val: a + b };
    },
    function() {
      const a = randInt(10, 50);
      const b = randInt(1, a - 1);
      parts.push({ type: 'sub', a, b });
      return { expr: a + ' − ' + b, val: a - b };
    }
  ];
  const numOps = level <= 6 ? 2 : level <= 8 ? 3 : 4;
  const ops = [];
  for (let i = 0; i < numOps; i++) {
    ops.push(configs[i % configs.length]);
  }
  const results = ops.map(fn => fn());
  const displayParts = results.map(r => r.expr);
  let exprStr = displayParts.join(' + ');
  correct = results.reduce((sum, r) => sum + r.val, 0);
  return wrap(
    exprStr,
    correct,
    [correct + randInt(2, 10), correct - randInt(2, 10), correct + randInt(10, 20), correct - randInt(10, 20), Math.floor(correct * 1.2), Math.floor(correct * 0.8)],
    exprStr + ' = ' + correct,
    [
      'Evaluate each part:',
      ...results.map((r, i) => '  Step ' + (i + 1) + ': ' + displayParts[i] + ' = ' + r.val),
      'Add all results: ' + results.map(r => r.val).join(' + ') + ' = ' + correct
    ],
    'combined'
  );
});

// ─── Expanded Templates ─────────────────────────────────────────────

// ─── Natural Numbers Division ───────────────────────────────────────

def('nat-div', 'Division', 'Natural Numbers', 1, 5, function(lv) {
  const cfg = [[2, 9, 2, 9], [2, 9, 9, 20], [2, 12, 10, 50], [3, 15, 10, 40], [5, 25, 10, 30]];
  const [dLo, dHi, qLo, qHi] = cfg[clamp(lv, 1, 5) - 1];
  const divisor = randInt(dLo, dHi);
  const quotient = randInt(qLo, qHi);
  const dividend = divisor * quotient;
  return wrap(
    formatNum(dividend) + ' ÷ ' + formatNum(divisor),
    quotient,
    [quotient + 1, quotient - 1, Math.round(dividend / (divisor + 1)), quotient + 10, quotient - 10],
    formatNum(dividend) + ' ÷ ' + formatNum(divisor) + ' = ' + formatNum(quotient),
    [formatNum(dividend) + ' ÷ ' + formatNum(divisor) + ' = ' + formatNum(quotient) + ' because ' + formatNum(divisor) + ' × ' + formatNum(quotient) + ' = ' + formatNum(dividend)],
    'nat-div'
  );
});

def('nat-square', 'Square Numbers', 'Natural Numbers', 2, 6, function(lv) {
  const cfg = [[11, 19], [20, 30], [31, 50], [51, 75], [76, 99]];
  const [lo, hi] = cfg[clamp(lv, 2, 6) - 2];
  const n = randInt(lo, hi);
  const correct = n * n;
  return wrap(
    formatNum(n) + '<sup>2</sup>',
    correct,
    [n * (n + 1), (n + 1) * (n + 1), (n - 1) * (n - 1), correct + n, correct - n, n * 2],
    formatNum(n) + '² = ' + formatNum(correct),
    [
      'Compute: ' + formatNum(n) + ' × ' + formatNum(n),
      (n >= 11 && n <= 19) ? 'Trick: (' + formatNum(n - 10) + ' + ' + formatNum(n - 10) + ') squared' : '',
      '= ' + formatNum(correct)
    ],
    'nat-square'
  );
});

def('nat-sqrt', 'Square Roots', 'Natural Numbers', 2, 6, function(lv) {
  const cfg = [[2, 9], [10, 15], [16, 25], [26, 40], [41, 60]];
  const [lo, hi] = cfg[clamp(lv, 2, 6) - 2];
  const root = randInt(lo, hi);
  const square = root * root;
  return wrap(
    '√' + formatNum(square),
    root,
    [root + 1, root - 1, root + 2, root - 2, Math.floor(root * 1.2), Math.floor(root * 0.8)],
    '√' + formatNum(square) + ' = ' + formatNum(root),
    ['Find number that squared gives ' + formatNum(square) + ':', formatNum(root) + ' × ' + formatNum(root) + ' = ' + formatNum(square), 'So √' + formatNum(square) + ' = ' + formatNum(root)],
    'nat-sqrt'
  );
});

// ─── Cubes ──────────────────────────────────────────────────────────

def('cubes', 'Cube Numbers', 'Natural Numbers', 2, 5, function(lv) {
  const cfg = [[2, 5], [6, 10], [11, 15], [2, 12]];
  const [lo, hi] = cfg[clamp(lv, 2, 5) - 2];
  const n = randInt(lo, hi);
  const correct = n * n * n;
  return wrap(
    formatNum(n) + '<sup>3</sup>',
    correct,
    [n * n * (n + 1), (n + 1) * (n + 1) * (n + 1), (n - 1) * (n - 1) * (n - 1), correct + n * n, correct - n * n, n * n],
    formatNum(n) + '³ = ' + formatNum(correct),
    [formatNum(n) + ' × ' + formatNum(n) + ' × ' + formatNum(n), '= ' + formatNum(n * n) + ' × ' + formatNum(n), '= ' + formatNum(correct)],
    'cubes'
  );
});

def('cube-root', 'Cube Roots', 'Natural Numbers', 3, 6, function(lv) {
  const cfg = [[2, 5], [6, 10], [11, 15], [2, 15]];
  const [lo, hi] = cfg[clamp(lv, 3, 6) - 3];
  const root = randInt(lo, hi);
  const cube = root * root * root;
  return wrap(
    '∛' + formatNum(cube),
    root,
    [root + 1, root - 1, root * 2, Math.floor(root * 1.5), root + 2],
    '∛' + formatNum(cube) + ' = ' + formatNum(root),
    ['Find number that cubed gives ' + formatNum(cube) + ':', formatNum(root) + '³ = ' + formatNum(cube), 'So ∛' + formatNum(cube) + ' = ' + formatNum(root)],
    'cube-root'
  );
});

def('squares-diff', 'Difference of Squares', 'Natural Numbers', 3, 7, function(lv) {
  const cfg = [[2, 5], [3, 7], [4, 10], [5, 12], [6, 15]];
  const [lo, hi] = cfg[clamp(lv, 3, 7) - 3];
  const a = randInt(lo + 1, hi);
  const b = randInt(lo, a - 1);
  const correct = a * a - b * b;
  return wrap(
    formatNum(a) + '<sup>2</sup> − ' + formatNum(b) + '<sup>2</sup>',
    correct,
    [(a + b) * (a + b), correct + a, correct - a, (a - b) * (a - b), a * a + b * b],
    formatNum(a) + '² − ' + formatNum(b) + '² = ' + formatNum(correct),
    ['Formula: a² − b² = (a + b)(a − b)', '= (' + formatNum(a + b) + ')(' + formatNum(a - b) + ')', '= ' + formatNum((a + b) * (a - b)) + ' = ' + formatNum(correct)],
    'squares-diff'
  );
});

// ─── Averages & Percentages ─────────────────────────────────────────

def('avg-basic', 'Average', 'Arithmetic', 2, 6, function(lv) {
  const cfg = [[3, 2, 20], [3, 3, 30], [4, 3, 50], [5, 4, 80], [5, 5, 100]];
  const [cnt, dLo, dHi] = cfg[clamp(lv, 2, 6) - 2];
  const numbers = [];
  let sum = 0;
  for (let i = 0; i < cnt; i++) {
    const n = randInt(dLo, dHi);
    numbers.push(n);
    sum += n;
  }
  const correct = Math.floor(sum / cnt);
  return wrap(
    'Average of: ' + numbers.join(', '),
    correct,
    [correct + 1, correct - 1, Math.ceil(sum / cnt) + 1, sum, Math.floor(sum / cnt) + 2],
    'Average = ' + correct,
    ['Sum = ' + sum, 'Count = ' + cnt, 'Average = ' + sum + ' ÷ ' + cnt + ' = ' + correct],
    'avg-basic'
  );
});

def('pct-basic', 'Percentage', 'Arithmetic', 2, 6, function(lv) {
  const cfg = [[10, 50, 10, 100], [20, 200, 5, 50], [25, 300, 10, 40], [10, 500, 8, 25], [15, 200, 10, 60]];
  const [pLo, pHi, nLo, nHi] = cfg[clamp(lv, 2, 6) - 2];
  const pct = randInt(pLo, pHi);
  const num = randInt(nLo, nHi);
  const correct = Math.round(pct * num / 100);
  return wrap(
    formatNum(pct) + '% of ' + formatNum(num),
    correct,
    [correct + Math.round(pct / 10), correct - Math.round(pct / 10), Math.round((pct + 10) * num / 100), Math.round(pct * (num + 10) / 100), Math.round(pct * num / 50)],
    formatNum(pct) + '% of ' + formatNum(num) + ' = ' + formatNum(correct),
    ['= (' + formatNum(pct) + '/100) × ' + formatNum(num), '= ' + formatNum(correct)],
    'pct-basic'
  );
});

def('ratio-basic', 'Ratio', 'Arithmetic', 2, 5, function(lv) {
  const cfg = [[2, 10], [3, 15], [4, 20], [6, 30]];
  const [lo, hi] = cfg[clamp(lv, 2, 5) - 2];
  let a = randInt(lo, hi);
  let b = randInt(lo, hi);
  const g = gcd(a, b);
  const sa = a / g, sb = b / g;
  const correctStr = sa + ' : ' + sb;
  const wrongs = [sa + 1 + ' : ' + sb, sa + ' : ' + (sb + 1), sb + ' : ' + sa, (sa * 2) + ' : ' + (sb * 2)];
  const options = genQ(correctStr, ...wrongs);
  return {
    question: 'Simplify: ' + formatNum(a) + ' : ' + formatNum(b),
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: formatNum(a) + ' : ' + formatNum(b) + ' = ' + correctStr,
    solutionSteps: ['Find GCD of ' + formatNum(a) + ' and ' + formatNum(b) + ' = ' + formatNum(g), 'Divide: ' + formatNum(a) + ' ÷ ' + formatNum(g) + ' = ' + formatNum(sa) + ',  ' + formatNum(b) + ' ÷ ' + formatNum(g) + ' = ' + formatNum(sb), 'Simplified: ' + correctStr],
    subTopic: 'ratio-basic'
  };
});

// ─── Sequences ──────────────────────────────────────────────────────

def('seq-ap', 'Arithmetic Progression', 'Sequences', 3, 7, function(lv) {
  const cfg = [[1, 5, 1, 3, 3], [1, 8, 2, 4, 4], [2, 10, 2, 5, 5], [3, 12, 3, 6, 6], [5, 15, 4, 8, 6]];
  const [aLo, aHi, dLo, dHi, n] = cfg[clamp(lv, 3, 7) - 3];
  const a = randInt(aLo, aHi);
  const d = randInt(dLo, dHi);
  const term = randInt(2, n);
  const nth = a + (term - 1) * d;
  return wrap(
    'AP: ' + a + ', ' + (a + d) + ', ' + (a + 2 * d) + ', … Find T<sub>' + term + '</sub>',
    nth,
    [a + (term - 1) * (d + 1), a + term * d, a + (term - 2) * d, a + (term - 1) * d + a],
    'T' + term + ' = ' + nth,
    ['Formula: Tn = a + (n − 1)d', 'a = ' + a + ', d = ' + d + ', n = ' + term, 'T' + term + ' = ' + a + ' + (' + term + ' − 1) × ' + d, '= ' + a + ' + ' + ((term - 1) * d) + ' = ' + nth],
    'seq-ap'
  );
});

def('seq-gp', 'Geometric Progression', 'Sequences', 4, 8, function(lv) {
  const cfg = [[1, 3, 2, 3, 4], [1, 4, 2, 4, 5], [2, 5, 2, 3, 5], [1, 6, 3, 4, 5], [1, 4, 2, 5, 6]];
  const [aLo, aHi, rLo, rHi, n] = cfg[clamp(lv, 4, 8) - 4];
  const a = randInt(aLo, aHi);
  const r = randInt(rLo, rHi);
  const term = randInt(2, n);
  const nth = a * Math.pow(r, term - 1);
  return wrap(
    'GP: ' + a + ', ' + (a * r) + ', ' + (a * r * r) + ', … Find T<sub>' + term + '</sub>',
    nth,
    [a * Math.pow(r + 1, term - 1), a * Math.pow(r, term), a * Math.pow(r, term - 2), nth * r, Math.floor(nth / r)],
    'T' + term + ' = ' + formatNum(nth),
    ['Formula: Tn = a × r^(n − 1)', 'a = ' + a + ', r = ' + r + ', n = ' + term, 'T' + term + ' = ' + a + ' × ' + r + '^' + (term - 1) + ' = ' + formatNum(nth)],
    'seq-gp'
  );
});

// ─── Trigonometry ───────────────────────────────────────────────────

const TRIG_ANGLES = [
  { deg: 0, sin: 0, cos: 1, tan: 0 },
  { deg: 30, sin: 0.5, cos: Math.sqrt(3)/2, tan: 1/Math.sqrt(3) },
  { deg: 45, sin: 1/Math.sqrt(2), cos: 1/Math.sqrt(2), tan: 1 },
  { deg: 60, sin: Math.sqrt(3)/2, cos: 0.5, tan: Math.sqrt(3) },
  { deg: 90, sin: 1, cos: 0, tan: Infinity }
];

const TRIG_STR = {
  '0_0': '0', '0_1': '1', '0_2': '0',
  '30_0': '1/2', '30_1': '√3/2', '30_2': '1/√3',
  '45_0': '1/√2', '45_1': '1/√2', '45_2': '1',
  '60_0': '√3/2', '60_1': '1/2', '60_2': '√3',
  '90_0': '1', '90_1': '0', '90_2': 'undefined'
};

def('tri-ratios', 'Trig Ratios', 'Trigonometry', 3, 7, function(lv) {
  const idx = clamp(lv, 3, 7) - 3;
  const angles = idx < 2 ? [30, 45, 60] : [0, 30, 45, 60, 90];
  const angle = pickRandom(angles);
  const funcs = ['sin', 'cos', 'tan'];
  const fi = funcs.indexOf(pickRandom(funcs));
  const key = angle + '_' + fi;
  const correctStr = TRIG_STR[key];
  const wrongKeys = [angle + '_' + ((fi + 1) % 3), angle + '_' + ((fi + 2) % 3), ((angle + 30) % 180) + '_' + fi, ((angle + 60) % 180) + '_' + fi];
  const wrongs = wrongKeys.map(k => TRIG_STR[k]).filter(s => s && s !== correctStr).slice(0, 3);
  while (wrongs.length < 3) wrongs.push('1');
  const options = genQ(correctStr, ...wrongs);
  return {
    question: funcs[fi] + ' ' + angle + '°',
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: funcs[fi] + ' ' + angle + '° = ' + correctStr,
    solutionSteps: [funcs[fi] + ' ' + angle + '° = ' + correctStr],
    subTopic: 'tri-ratios'
  };
});

def('tri-identities', 'Trig Identities', 'Trigonometry', 4, 8, function(lv) {
  const angle = rand(30, 45, 60);
  const rad = angle * Math.PI / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const identities = [
    { q: 'sin²' + angle + '° + cos²' + angle + '°', val: 1, sol: 'sin²θ + cos²θ = 1' },
    { q: 'sec²' + angle + '° − tan²' + angle + '°', val: 1, sol: 'sec²θ − tan²θ = 1' },
    { q: 'cosec²' + angle + '° − cot²' + angle + '°', val: 1, sol: 'cosec²θ − cot²θ = 1' },
    { q: '1 − sin²' + angle + '°', val: Math.round(cos * cos * 100) / 100, sol: 'cos²' + angle + '°' },
    { q: '1 − cos²' + angle + '°', val: Math.round(sin * sin * 100) / 100, sol: 'sin²' + angle + '°' }
  ];
  const id = pickRandom(identities);
  const correctVal = Math.round(id.val * 100) / 100;
  return wrap(
    id.q,
    correctVal,
    [0, correctVal + 1, correctVal === 1 ? 2 : 1, Math.round(1 / correctVal * 100) / 100],
    id.q + ' = ' + correctVal,
    [id.sol, 'Value = ' + correctVal],
    'tri-identities'
  );
});

// ─── Complex Numbers ────────────────────────────────────────────────

def('complex-basic', 'Complex Numbers', 'Complex Numbers', 4, 8, function(lv) {
  const varieties = [
    function() {
      const p = randInt(1, 4);
      const vals = ['i', '−1', '−i', '1'];
      return { q: 'i<sup>' + p + '</sup>', val: vals[(p - 1) % 4], sol: 'i^' + p + ' = ' + vals[(p - 1) % 4] };
    },
    function() {
      const a = randInt(1, 5), b = randInt(1, 5);
      const c = randInt(1, 5), d = randInt(1, 5);
      const sign = rand(1, -1);
      const real = a + sign * c;
      const imag = b + (sign === 1 ? d : -d);
      return { q: '(' + a + '+' + b + 'i) ' + (sign > 0 ? '+' : '−') + ' (' + c + '+' + d + 'i)', val: real + (imag >= 0 ? '+' + imag + 'i' : imag + 'i'), sol: 'Real: ' + a + ' ' + (sign > 0 ? '+ ' + c : '− ' + c) + ' = ' + real + ', Imag: ' + b + ' ' + (sign > 0 ? '+ ' + d : '− ' + d) + ' = ' + imag + 'i' };
    },
    function() {
      const a = randInt(1, 3), b = randInt(1, 3);
      const c = randInt(1, 3), d = randInt(1, 3);
      const real = a * c - b * d;
      const imag = a * d + b * c;
      return { q: '(' + a + '+' + b + 'i)(' + c + '+' + d + 'i)', val: real + (imag >= 0 ? '+' + imag + 'i' : imag + 'i'), sol: '= ' + a * c + ' + ' + a * d + 'i + ' + b * c + 'i + ' + b * d + 'i² = ' + real + ' + ' + imag + 'i' };
    }
  ];
  const v = pickRandom(varieties)();
  const wPool = ['1', '−1', 'i', '−i', '0', '−' + v.val, v.val + 'i', v.val.replace(/i/g, ''), v.val + '1'].filter(s => s !== v.val);
  const wrongs = [...new Set(wPool)].slice(0, 3);
  while (wrongs.length < 3) wrongs.push('1');
  const options = genQ(v.val, ...wrongs);
  return {
    question: v.q,
    options,
    correctIndex: ansIdx(options, v.val),
    solution: v.sol,
    solutionSteps: [v.sol],
    subTopic: 'complex-basic'
  };
});

// ─── Coordinate Geometry ────────────────────────────────────────────

def('coord-dist', 'Distance Formula', 'Coordinate Geometry', 3, 7, function(lv) {
  const cfg = [[0, 5], [0, 10], [0, 15], [-5, 10], [-10, 15]];
  const [lo, hi] = cfg[clamp(lv, 3, 7) - 3];
  const x1 = randInt(lo, hi), y1 = randInt(lo, hi);
  const x2 = randInt(lo, hi), y2 = randInt(lo, hi);
  const dx = x2 - x1, dy = y2 - y1;
  const distSq = dx * dx + dy * dy;
  const dist = Math.round(Math.sqrt(distSq) * 100) / 100;
  const correctStr = Number.isInteger(Math.sqrt(distSq)) ? String(Math.sqrt(distSq)) : String(dist);
  return wrap(
    'Distance (' + x1 + ',' + y1 + ') to (' + x2 + ',' + y2 + ')',
    correctStr,
    [String(Math.abs(dx + dy)), String(Math.abs(dx) + Math.abs(dy)), String(Math.round(dist * 1.2 * 100) / 100), String(Math.round(dist * 0.8 * 100) / 100)],
    'Distance = ' + correctStr,
    ['d = √((x₂−x₁)² + (y₂−y₁)²)', 'dx = ' + dx + ', dy = ' + dy, 'd = √(' + (dx * dx) + ' + ' + (dy * dy) + ') = √' + distSq + ' = ' + correctStr],
    'coord-dist'
  );
});

def('coord-slope', 'Slope Formula', 'Coordinate Geometry', 3, 7, function(lv) {
  const cfg = [[0, 5], [0, 10], [0, 15], [-5, 10], [-10, 15]];
  const [lo, hi] = cfg[clamp(lv, 3, 7) - 3];
  let x1 = randInt(lo, hi), y1 = randInt(lo, hi);
  let x2 = randInt(lo, hi), y2 = randInt(lo, hi);
  if (x1 === x2) x2 = x1 + 1;
  const dy = y2 - y1, dx = x2 - x1;
  const [sNum, sDen] = simplifyFrac(dy, dx);
  const correctStr = sDen === 1 ? String(sNum) : fracStr(sNum, sDen);
  const wrongs = [fracStr(dx, dy), fracStr(-sNum, sDen), fracStr(sNum + 1, sDen), fracStr(sNum, sDen + 1), String(Math.round(dy / dx))];
  const options = genQ(correctStr, ...wrongs);
  return {
    question: 'Slope through (' + x1 + ',' + y1 + ') and (' + x2 + ',' + y2 + ')',
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: 'Slope = ' + correctStr,
    solutionSteps: ['m = (y₂−y₁)/(x₂−x₁)', 'm = (' + y2 + '−' + y1 + ')/(' + x2 + '−' + x1 + ')', '= ' + dy + '/' + dx + ' = ' + correctStr],
    subTopic: 'coord-slope'
  };
});

// ─── HCF / LCM ─────────────────────────────────────────────────────

def('hcf-lcm', 'HCF & LCM', 'Number Theory', 2, 6, function(lv) {
  const cfg = [[2, 9], [3, 12], [4, 15], [6, 20], [8, 25]];
  const [lo, hi] = cfg[clamp(lv, 2, 6) - 2];
  const a = randInt(lo, hi);
  let b = randInt(lo, hi);
  if (b === a) b = a + 1;
  const g = gcd(a, b);
  const l = a * b / g;
  const askHcf = Math.random() > 0.5;
  const correct = askHcf ? g : l;
  return wrap(
    (askHcf ? 'HCF' : 'LCM') + ' of ' + formatNum(a) + ' and ' + formatNum(b),
    correct,
    [askHcf ? l : g, correct + 1, correct - 1, Math.floor((a + b) / 2), a + b],
    (askHcf ? 'HCF' : 'LCM') + ' = ' + formatNum(correct),
    askHcf
      ? ['Factors of ' + formatNum(a) + ': 1' + (a > 1 ? ', ...' : ''), 'Factors of ' + formatNum(b) + ': 1' + (b > 1 ? ', ...' : ''), 'Largest common factor: ' + formatNum(g), 'HCF = ' + formatNum(g)]
      : ['HCF = ' + formatNum(g), 'LCM = a × b / HCF', '= ' + formatNum(a * b) + ' / ' + formatNum(g) + ' = ' + formatNum(l)],
    'hcf-lcm'
  );
});

// ─── Prime Numbers ─────────────────────────────────────────────────

def('prime-check', 'Prime Numbers', 'Number Theory', 2, 5, function(lv) {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50, 51, 52, 54, 55, 56, 57, 58, 60, 62, 63, 64, 65, 66, 68, 69, 70, 72, 74, 75, 76, 77, 78, 80, 81, 82, 84, 85, 86, 87, 88, 90, 91, 92, 93, 94, 95, 96, 98, 99, 100];
  const isPrime = Math.random() > 0.4;
  const n = pickRandom(isPrime ? primes : composites);
  return wrap(
    'Is ' + formatNum(n) + ' prime or composite?',
    isPrime ? 'Prime' : 'Composite',
    [isPrime ? 'Composite' : 'Prime', 'Neither', 'Both'],
    formatNum(n) + ' is ' + (isPrime ? 'prime' : 'composite'),
    isPrime
      ? ['Check primes up to √' + formatNum(n), 'Not divisible by any prime ≤ √' + formatNum(n), formatNum(n) + ' is prime']
      : ['Check divisibility:', ...(() => { for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return ['Divisible by ' + i]; return []; })(), formatNum(n) + ' is composite'],
    'prime-check'
  );
});

// ─── Speed, Distance, Time ─────────────────────────────────────────

def('speed-time', 'Speed Distance Time', 'Arithmetic', 3, 7, function(lv) {
  const cfg = [[2, 5, 5, 10], [3, 8, 10, 15], [5, 10, 10, 20], [10, 20, 15, 30], [15, 30, 20, 40]];
  const [sLo, sHi, tLo, tHi] = cfg[clamp(lv, 3, 7) - 3];
  const speed = randInt(sLo, sHi);
  const time = randInt(tLo, tHi);
  const dist = speed * time;
  const ask = rand('speed', 'distance', 'time');
  if (ask === 'speed') {
    return wrap('D=' + dist + ', T=' + time + '. Speed?', speed, [speed + 1, speed - 1, Math.floor(dist / (time + 1))], 'Speed = ' + speed, ['Speed = D/T = ' + dist + '/' + time + ' = ' + speed], 'speed-time');
  } else if (ask === 'distance') {
    return wrap('S=' + speed + ', T=' + time + '. Distance?', dist, [dist + speed, dist + time, dist - speed], 'Distance = ' + dist, ['Distance = S×T = ' + speed + '×' + time + ' = ' + dist], 'speed-time');
  } else {
    return wrap('S=' + speed + ', D=' + dist + '. Time?', time, [time + 1, time - 1, Math.floor(dist / (speed + 1))], 'Time = ' + time, ['Time = D/S = ' + dist + '/' + speed + ' = ' + time], 'speed-time');
  }
});

// ─── Linear Inequalities ───────────────────────────────────────────

def('ineq-linear', 'Linear Inequalities', 'Inequalities', 4, 8, function(lv) {
  const cfg = [[1, 5, 5, 15], [2, 8, 10, 30], [3, 10, 10, 50], [2, 12, 20, 100]];
  const [cLo, cHi, rLo, rHi] = cfg[clamp(lv, 4, 8) - 4];
  const coeff = rand(1, 2, 3);
  const constTerm = rand(1, -1) * randInt(cLo, cHi);
  const rhs = randInt(rLo, rHi);
  const sign = rand('>', '<', '≥', '≤');
  const xVal = Math.floor((rhs - constTerm) / coeff);
  const flip = coeff < 0;
  const solStr = flip ? 'x ' + (sign === '>' ? '<' : sign === '<' ? '>' : sign === '≥' ? '≤' : '≥') + ' ' + xVal : 'x ' + sign + ' ' + xVal;
  const cStr = coeff === 1 ? '' : coeff === -1 ? '−' : String(coeff);
  const qStr = cStr + 'x ' + (constTerm >= 0 ? '+ ' + constTerm : '− ' + Math.abs(constTerm)) + ' ' + sign + ' ' + rhs;
  const wrongs = ['x ' + sign + ' ' + (xVal + 1), 'x ' + sign + ' ' + (xVal - 1), 'x ' + (sign === '>' ? '<' : sign === '<' ? '>' : sign === '≥' ? '≤' : '≥') + ' ' + xVal];
  const options = genQ(solStr, ...wrongs);
  return {
    question: 'Solve: ' + qStr,
    options,
    correctIndex: ansIdx(options, solStr),
    solution: solStr,
    solutionSteps: [qStr, 'Move terms: ' + cStr + 'x ' + sign + ' ' + (rhs - constTerm), 'Divide by ' + coeff + (flip ? ' (flip sign)' : ''), 'Result: ' + solStr],
    subTopic: 'ineq-linear'
  };
});

// ─── Remainder Theorem ─────────────────────────────────────────────

def('poly-remainder', 'Remainder Theorem', 'Polynomials', 5, 9, function(lv) {
  const cfg = [[1, 3], [1, 5], [2, 6], [3, 8], [1, 10]];
  const [lo, hi] = cfg[clamp(lv, 5, 9) - 5];
  const a = randInt(1, 3);
  const b = randInt(lo, hi) * rand(1, -1);
  const c = randInt(lo, hi) * rand(1, -1);
  const d = randInt(lo, hi) * rand(1, -1);
  const x0 = randInt(1, 4) * rand(1, -1);
  const rem = a * Math.pow(x0, 3) + b * Math.pow(x0, 2) + c * x0 + d;
  const pStr = a + 'x³ ' + (b < 0 ? '− ' + Math.abs(b) : '+ ' + b) + 'x² ' + (c < 0 ? '− ' + Math.abs(c) : '+ ' + c) + 'x ' + (d < 0 ? '− ' + Math.abs(d) : '+ ' + d);
  return wrap(
    'Remainder: (' + pStr + ') ÷ (x ' + (x0 > 0 ? '− ' + x0 : '+ ' + Math.abs(x0)) + ')',
    rem,
    [rem + randInt(1, 5), rem - randInt(1, 5), -rem, a * x0 * x0 + b * x0 + c],
    'Remainder = ' + formatNum(rem),
    ['P(' + x0 + ') = ' + a + '(' + x0 + ')³ + ' + b + '(' + x0 + ')² + ' + c + '(' + x0 + ') + ' + d, '= ' + formatNum(rem)],
    'poly-remainder'
  );
});

// ─── Permutations & Combinations ───────────────────────────────────

def('perm-basic', 'Permutations', 'Combinatorics', 4, 8, function(lv) {
  const cfg = [[4, 2], [5, 2], [6, 2], [6, 3], [7, 3], [8, 3]];
  const [n, r] = cfg[Math.min(clamp(lv, 4, 8) - 4, 5)];
  let perm = 1;
  for (let i = n; i > n - r; i--) perm *= i;
  return wrap(
    'P(' + n + ', ' + r + ')',
    perm,
    [perm + n, perm - r, n * r, Math.floor(perm / n)],
    'P(' + n + ', ' + r + ') = ' + formatNum(perm),
    ['P(n,r) = n!/(n−r)!', ...(() => { const st = []; let p = 1; for (let i = 0; i < r; i++) { p *= (n - i); st.push('×' + (n - i) + ' = ' + p); } return st; })(), 'Result: ' + formatNum(perm)],
    'perm-basic'
  );
});

def('comb-basic', 'Combinations', 'Combinatorics', 4, 8, function(lv) {
  const cfg = [[4, 2], [5, 2], [6, 2], [6, 3], [7, 3], [8, 3]];
  const [n, r] = cfg[Math.min(clamp(lv, 4, 8) - 4, 5)];
  let perm = 1;
  for (let i = n; i > n - r; i--) perm *= i;
  let factR = 1;
  for (let i = 2; i <= r; i++) factR *= i;
  const comb = perm / factR;
  return wrap(
    'C(' + n + ', ' + r + ')',
    comb,
    [comb + 1, comb - 1, perm, n + r],
    'C(' + n + ', ' + r + ') = ' + formatNum(comb),
    ['C(n,r) = n!/(r!(n−r)!)', 'P(' + n + ', ' + r + ') = ' + formatNum(perm), 'r! = ' + formatNum(factR), 'C = ' + formatNum(perm) + '/' + formatNum(factR) + ' = ' + formatNum(comb)],
    'comb-basic'
  );
});

// ─── Probability ───────────────────────────────────────────────────

def('prob-basic', 'Probability', 'Probability', 4, 8, function(lv) {
  const cfg = [[2, 6], [2, 8], [3, 10], [4, 12], [5, 15]];
  const [lo, hi] = cfg[clamp(lv, 4, 8) - 4];
  const total = randInt(lo, hi);
  const fav = randInt(1, Math.max(1, total - 1));
  const [sNum, sDen] = simplifyFrac(fav, total);
  const correctStr = sDen === 1 ? String(sNum) : fracStr(sNum, sDen);
  const wrongs = [fracStr(total - fav, total), fracStr(total, fav), fracStr(sNum + 1, sDen), fracStr(sNum, sDen + 1)].filter(w => w !== correctStr);
  const options = genQ(correctStr, ...wrongs);
  const items = rand('balls', 'cards', 'marbles', 'tickets');
  return {
    question: 'P(1 from ' + formatNum(fav) + ' ' + items + ' out of ' + formatNum(total) + ')',
    options,
    correctIndex: ansIdx(options, correctStr),
    solution: 'P = ' + correctStr,
    solutionSteps: ['P = Favorable/Total = ' + formatNum(fav) + '/' + formatNum(total) + ' = ' + correctStr],
    subTopic: 'prob-basic'
  };
});

// ─── Matrices ──────────────────────────────────────────────────────

def('mat-det', 'Matrix Determinant', 'Matrices', 4, 8, function(lv) {
  const cfg = [[1, 5], [1, 8], [2, 10], [2, 12], [3, 15]];
  const [lo, hi] = cfg[clamp(lv, 4, 8) - 4];
  const a = randInt(lo, hi) * rand(1, -1);
  const b = randInt(lo, hi) * rand(1, -1);
  const c = randInt(lo, hi) * rand(1, -1);
  const d = randInt(lo, hi) * rand(1, -1);
  const det = a * d - b * c;
  return wrap(
    'det [[' + a + ' ' + b + '][' + c + ' ' + d + ']]',
    det,
    [a * d + b * c, b * c - a * d, det + randInt(1, 5), det - randInt(1, 5)],
    'det = ' + formatNum(det),
    ['det = ad − bc = (' + a + ')(' + d + ') − (' + b + ')(' + c + ')', '= ' + (a * d) + ' − ' + (b * c) + ' = ' + formatNum(det)],
    'mat-det'
  );
});

// ─── Log & Exponential Equations ───────────────────────────────────

def('log-eq', 'Log Equations', 'Logarithms', 4, 8, function(lv) {
  const cfg = [[2, 6, 8], [2, 5, 10], [3, 5, 8], [2, 7, 12], [3, 6, 10]];
  const [bLo, bHi] = cfg[clamp(lv, 4, 8) - 4];
  const base = randInt(bLo, bHi);
  const exp = randInt(2, 6);
  const result = Math.pow(base, exp);
  if (Math.random() > 0.5) {
    return wrap('log<sub>' + base + '</sub>(x) = ' + exp, result, [result + 1, result - 1, base * exp, Math.pow(base, exp + 1)], 'x = ' + formatNum(result), [base + '^' + exp + ' = x', 'x = ' + formatNum(result)], 'log-eq');
  } else {
    const arg = Math.pow(base, randInt(2, 5));
    const ans = Math.round(Math.log(arg) / Math.log(base));
    return wrap('log<sub>' + base + '</sub>(' + arg + ') = x', ans, [ans + 1, ans - 1, base, arg], 'x = ' + ans, [base + '^x = ' + arg, 'x = ' + ans], 'log-eq');
  }
});

def('exp-eq', 'Exponential Equations', 'Exponents', 4, 8, function(lv) {
  const cfg = [[2, 8], [2, 10], [3, 6], [2, 12], [5, 5]];
  const [bLo, bHi] = cfg[clamp(lv, 4, 8) - 4];
  const base = randInt(bLo, bHi);
  const exp = randInt(2, 6);
  const result = Math.pow(base, exp);
  return wrap(
    base + '<sup>x</sup> = ' + formatNum(result),
    exp,
    [exp + 1, exp - 1, result, base, base * exp],
    'x = ' + exp,
    [base + '^x = ' + formatNum(result), base + '^' + exp + ' = ' + formatNum(result), 'So x = ' + exp],
    'exp-eq'
  );
});

// ─── Simple Interest ───────────────────────────────────────────────

def('simple-interest', 'Simple Interest', 'Arithmetic', 4, 8, function(lv) {
  const cfg = [[100, 500, 5, 10, 1, 3], [500, 2000, 5, 12, 1, 4], [1000, 5000, 8, 15, 2, 5], [2000, 10000, 10, 20, 2, 5]];
  const [pLo, pHi, rLo, rHi, tLo, tHi] = cfg[clamp(lv, 4, 8) - 4];
  const p = randInt(pLo, pHi);
  const r = randInt(rLo, rHi);
  const t = randInt(tLo, tHi);
  const si = p * r * t / 100;
  return wrap(
    'SI: P=' + p + ', R=' + r + '%, T=' + t + 'yr',
    si,
    [Math.round(si + p / 100), Math.round(si - p / 100), Math.round(si * 1.5), Math.round(si * 0.5)],
    'SI = ' + formatNum(si),
    ['SI = P × R × T / 100', '= ' + formatNum(p) + ' × ' + r + ' × ' + t + ' / 100', '= ' + formatNum(p * r * t) + ' / 100', '= ' + formatNum(si)],
    'simple-interest'
  );
});

// ─── Profit & Loss ─────────────────────────────────────────────────

def('profit-loss', 'Profit & Loss', 'Arithmetic', 4, 8, function(lv) {
  const cfg = [[10, 50, 5, 20], [20, 100, 10, 30], [50, 200, 15, 40], [100, 500, 20, 50]];
  const [cLo, cHi, pLo, pHi] = cfg[clamp(lv, 4, 8) - 4];
  const cp = randInt(cLo, cHi);
  const pct = randInt(pLo, pHi);
  const isProfit = Math.random() > 0.4;
  const sp = isProfit ? Math.round(cp * (100 + pct) / 100) : Math.round(cp * (100 - pct) / 100);
  return wrap(
    'CP=' + cp + ', ' + (isProfit ? 'profit' : 'loss') + ' ' + pct + '%. SP?',
    sp,
    [isProfit ? Math.round(cp * (100 - pct) / 100) : Math.round(cp * (100 + pct) / 100), sp + Math.round(cp * 0.05), sp - Math.round(cp * 0.05)],
    'SP = ' + formatNum(sp),
    ['SP = CP × (100 ' + (isProfit ? '+' : '−') + pct + ') / 100', '= ' + formatNum(cp) + ' × ' + (isProfit ? (100 + pct) : (100 - pct)) + ' / 100', '= ' + formatNum(sp)],
    'profit-loss'
  );
});

// ─── Number Series ─────────────────────────────────────────────────

def('num-series', 'Number Series', 'Patterns', 3, 7, function(lv) {
  const patterns = [
    { gen: i => i * 2, name: '×2' },
    { gen: i => i * 3, name: '×3' },
    { gen: i => i + 3, name: '+3' },
    { gen: i => i + 5, name: '+5' },
    { gen: i => i * i, name: 'n²' },
    { gen: i => Math.pow(2, i), name: '2^n' },
    { gen: i => Math.pow(3, i), name: '3^n' }
  ];
  const pat = pickRandom(patterns);
  const start = randInt(1, 3);
  const terms = [];
  for (let i = 0; i < 4; i++) terms.push(pat.gen(start + i));
  const next = pat.gen(start + 4);
  return wrap(
    'Next: ' + terms.join(', ') + ', ?',
    next,
    [next + 1, next - 1, terms[3] + 1, next * 2],
    'Next = ' + formatNum(next),
    ['Pattern: ' + pat.name, terms.join(', ') + ', ' + formatNum(next)],
    'num-series'
  );
});
