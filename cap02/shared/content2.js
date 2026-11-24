/* Power Line Lab - College Algebra I, Chapter 2 (Activity 1 of the anchor "Function challenges")
   Loaded after content.js (chapter 1), which it reuses only for the synthesis phase. */
(function () {
  'use strict';
  var C = window.RL_CONTENT, U = C.util, fmt = U.fmt, M = U.M;
  var cap1 = { locate: C.gen.locate, order: C.gen.order, distance: C.gen.distance, intervals: C.gen.intervals };
  var base1 = { evaluate: C.evaluate, hint: C.hint, successNote: C.successNote };

  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function near(a, b) { return Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b)); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function pw(b, e) { return b + '<sup>' + String(e).replace('-', M) + '</sup>'; }
  function root(n, x) { return (n === 2 ? '\u221a' : n === 3 ? '\u221b' : '<sup>' + n + '</sup>\u221a') + x; }
  function rad(k, m, n) { if (m === 1) return fmt(k); return (k === 1 ? '' : fmt(k)) + root(n, m); }
  function primes(N) { var f = [], d = 2; while (N > 1 && d * d <= N) { while (N % d === 0) { f.push(d); N /= d; } d++; } if (N > 1) f.push(N); return f; }
  function factorText(N) {
    var f = primes(N), c = {}; f.forEach(function (p) { c[p] = (c[p] || 0) + 1; });
    return Object.keys(c).map(function (p) { return c[p] > 1 ? pw(p, c[p]) : p; }).join(' \u00b7 ');
  }
  function hasPower(m, n) { for (var d = 2; Math.pow(d, n) <= m; d++) if (m % Math.pow(d, n) === 0) return true; return false; }
  function fracLabel(p, q) { var g = gcd(p, q) || 1; p /= g; q /= g; return q === 1 ? fmt(p) : (p < 0 ? M : '') + Math.abs(p) + '/' + q; }

  /* Every chapter 2 task is a "param" task: the student sets parameters, the marker lands on the value of
     the expression they built, and a gold pin marks the target. */
  function task(o) {
    o.type = 'param';
    /* never start on the answer: nudge the first parameter if the starting values already solve the task */
    var init = {}; o.params.forEach(function (q) { init[q.id] = q.init; });
    if (o.check(init).ok) {
      var q = o.params[0];
      if (q.opts) q.init = (q.init + 1) % q.opts.length; else q.init = q.init + 1 <= q.max ? q.init + 1 : q.init - 1;
    }
    return o;
  }

  /* ---------- Phase 1: powers ---------- */
  function powItem(b, e, kind, extra) {
    extra = extra || {};
    var target = Math.pow(b, e);
    var tl = extra.label || (e < 0 ? '1/' + Math.pow(b, -e) : fmt(target));
    var prompt = extra.prompt || 'Land the marker on <b>' + tl + '</b> using a power of ' + b + '.';
    return task({
      skill: 'powers', kind: kind, b: b, e: e, rule: extra.rule || null, wrong: extra.wrong,
      prompt: prompt, target: target, targetLabel: 'Target ' + tl,
      params: [{ id: 'k', label: 'Exponent', min: -6, max: 9, init: 1 }],
      value: function (p) { return Math.pow(b, p.k); },
      expr: function (p) { return pw(b, p.k); },
      solution: function () { return { k: e }; },
      check: function (p) {
        if (p.k === e) return { ok: true };
        if (e !== 0 && p.k === -e) return { ok: false, code: 'sign' };
        if (e === 0) return { ok: false, code: 'zero' };
        if (extra.wrong != null && p.k === extra.wrong) return { ok: false, code: 'rule' };
        return { ok: false, code: 'off' };
      },
      hint: function (code, level, p) {
        if (level === 1) {
          if (code === 'sign') return e < 0 ? 'The target is smaller than 1, so it is a reciprocal. A negative exponent makes a reciprocal (b' + '<sup>' + M + 'n</sup> = 1/b<sup>n</sup>), never a negative number.' : 'Your power landed below 1, because a negative exponent makes a reciprocal. The target is larger than 1.';
          if (code === 'zero') return 'Any nonzero base raised to the power 0 equals 1, not 0. Which exponent gives 1?';
          if (code === 'rule' && extra.rule) return extra.rule.why;
          return extra.rule ? 'Use the rules for the same base: multiplying adds exponents, dividing subtracts them, and a power of a power multiplies them.' : 'Count factors: how many times must ' + b + ' be multiplied by itself to reach the target?';
        }
        if (level === 2) return extra.rule ? extra.rule.step : 'Write the target as a power of ' + b + ': ' + tl + ' = ' + (e < 0 ? '1/' + pw(b, -e) : e === 0 ? b + '<sup>0</sup>' : pw(b, e)) + '.';
        return 'The exponent is ' + fmt(e) + ': ' + pw(b, e) + ' = ' + tl + '.' + (extra.rule ? ' ' + extra.rule.step : '');
      },
      note: function () { return pw(b, e) + ' = ' + tl + '.'; }
    });
  }
  function ruleItem(type) {
    var b = 2, a, c, d, e, prompt, wrong, rule;
    if (type === 'power') {
      a = rnd(1, 3); c = rnd(2, 3); e = a * c; if (e > 8) { a = 2; c = 3; e = 6; }
      prompt = 'Write <b>(' + pw(b, a) + ')<sup>' + c + '</sup></b> as a single power of 2.';
      wrong = a + c;
      rule = { why: 'A power raised to a power multiplies the exponents; it does not add them.', step: '(' + pw(b, a) + ')<sup>' + c + '</sup> = ' + pw(b, a + ' \u00b7 ' + c) + ' = ' + pw(b, e) + '.' };
    } else {
      for (;;) { a = rnd(1, 5); c = rnd(1, 5); d = rnd(1, 7); e = a + c - d; if (e >= -3 && e <= 6) break; }
      prompt = 'Write <b>' + pw(b, a) + ' \u00b7 ' + pw(b, c) + ' \u00f7 ' + pw(b, d) + '</b> as a single power of 2.';
      wrong = a * c - d;
      rule = { why: 'Multiplying powers with the same base adds the exponents (it does not multiply them); dividing subtracts.', step: pw(b, a) + ' \u00b7 ' + pw(b, c) + ' \u00f7 ' + pw(b, d) + ' = ' + pw(b, a + ' + ' + c + ' ' + M + ' ' + d) + ' = ' + pw(b, e) + '.' };
    }
    return powItem(b, e, 'rule-' + type, { prompt: prompt, label: pw(b, e) === pw(b, e) ? (e < 0 ? '1/' + Math.pow(b, -e) : fmt(Math.pow(b, e))) : '', wrong: wrong, rule: rule });
  }

  /* ---------- Phase 2: roots and radicals ---------- */
  function simpItem(N, n) {
    var k = 1, m = N; for (var d = 2; Math.pow(d, n) <= m; d++) while (m % Math.pow(d, n) === 0) { m /= Math.pow(d, n); k *= d; }
    var target = Math.pow(N, 1 / n);
    return task({
      skill: 'radicals', kind: 'simp' + n, prompt: 'Simplify <b>' + root(n, N) + '</b>: write it as k' + root(n, 'm') + ' with the smallest possible m.',
      target: target, targetLabel: 'Target ' + root(n, N),
      params: [{ id: 'k', label: 'Coefficient k', min: 1, max: 99, init: 1 }, { id: 'm', label: 'Radicand m', min: 1, max: 99, init: 1 }],
      value: function (p) { return p.k * Math.pow(p.m, 1 / n); },
      expr: function (p) { return (p.k === 1 ? '' : p.k) + root(n, p.m); },
      solution: function () { return { k: k, m: m }; },
      check: function (p) {
        var same = Math.pow(p.k, n) * p.m === N;
        if (same && !hasPower(p.m, n)) return { ok: true };
        if (same) return { ok: false, code: 'notsimplest' };
        return { ok: false, code: 'off' };
      },
      hint: function (code, level) {
        if (level === 1) return code === 'notsimplest'
          ? 'Same value, but m still contains a perfect ' + (n === 2 ? 'square' : 'cube') + ' factor. Take it outside the radical.'
          : 'Factor ' + N + ' into primes and group identical factors in ' + (n === 2 ? 'pairs' : 'triples') + '.';
        if (level === 2) return N + ' = ' + factorText(N) + '. Each ' + (n === 2 ? 'pair' : 'triple') + ' of equal factors leaves the radical as one factor.';
        return root(n, N) + ' = ' + root(n, '(' + factorText(N) + ')') + ' = ' + rad(k, m, n) + '.';
      },
      note: function () { return root(n, N) + ' = ' + rad(k, m, n) + ' \u2248 ' + fmt(Math.round(target * 1000) / 1000) + '.'; }
    });
  }
  function combItem(kind, a, b, m) {
    var prompt, target, val, ans, label, steps, wrong;
    if (kind === 'add') { ans = a + b; target = ans * Math.sqrt(m); prompt = 'Combine <b>' + rad(a, m, 2) + ' + ' + rad(b, m, 2) + '</b> into k' + root(2, m) + '.'; label = rad(a, m, 2) + ' + ' + rad(b, m, 2); steps = 'Like radicals add their coefficients: (' + a + ' + ' + b + ')' + root(2, m) + ' = ' + rad(ans, m, 2) + '.'; wrong = a * b;
      val = function (p) { return p.k * Math.sqrt(m); }; }
    else if (kind === 'mul') { ans = Math.sqrt(a * b); target = ans; prompt = 'Find k with <b>' + root(2, a) + ' \u00b7 ' + root(2, b) + ' = k</b>.'; label = root(2, a) + ' \u00b7 ' + root(2, b); steps = 'Same index: multiply the radicands. ' + root(2, a) + ' \u00b7 ' + root(2, b) + ' = ' + root(2, a * b) + ' = ' + ans + '.'; wrong = a + b;
      val = function (p) { return p.k; }; }
    else { ans = Math.sqrt(a / b); target = ans; prompt = 'Find k with <b>' + root(2, a) + ' \u00f7 ' + root(2, b) + ' = k</b>.'; label = root(2, a) + ' \u00f7 ' + root(2, b); steps = 'Same index: divide the radicands. ' + root(2, a) + ' \u00f7 ' + root(2, b) + ' = ' + root(2, a / b) + ' = ' + ans + '.'; wrong = a - b;
      val = function (p) { return p.k; }; }
    return task({
      skill: 'radicals', kind: kind, prompt: prompt, target: target, targetLabel: 'Target ' + label,
      params: [{ id: 'k', label: 'k', min: 1, max: 99, init: 1 }],
      value: val, expr: function (p) { return kind === 'add' ? rad(p.k, m, 2) : fmt(p.k); },
      solution: function () { return { k: ans }; },
      check: function (p) { return p.k === ans ? { ok: true } : { ok: false, code: p.k === wrong ? 'wrong' : 'off' }; },
      hint: function (code, level) {
        if (level === 1) return kind === 'add'
          ? (code === 'wrong' ? 'Adding like radicals adds the coefficients; it does not multiply them.' : 'Treat ' + root(2, m) + ' like a unit: how many of them are there in total?')
          : 'With the same index, ' + (kind === 'mul' ? 'multiply' : 'divide') + ' the radicands first, then take the root.';
        if (level === 2) return kind === 'add' ? 'Think of it as ' + a + ' apples + ' + b + ' apples, where each apple is ' + root(2, m) + '.' : (kind === 'mul' ? root(2, a + ' \u00b7 ' + b) + ' = ' + root(2, a * b) : root(2, a + ' \u00f7 ' + b) + ' = ' + root(2, a / b)) + '. Is that a perfect square?';
        return steps;
      },
      note: function () { return steps + ' Note: radicals with different radicands do not combine; ' + root(2, 2) + ' + ' + root(2, 3) + ' \u2248 3.15, not ' + root(2, 5) + ' \u2248 2.24.'; }
    });
  }

  /* ---------- Phase 3: rationalizing ---------- */
  function sq(x) { return x === 1 ? '1' : root(2, x); }
  function ratItem(a, p, s, q) {
    // fraction a / (sqrt p + s*sqrt q); q = 0 means a single root
    var den = q === 0 ? sq(p) : sq(p) + ' ' + (s > 0 ? '+' : M) + ' ' + sq(q);
    var dv = Math.sqrt(p) + s * Math.sqrt(q);
    var conjT = q === 0 ? sq(p) : sq(p) + ' ' + (s > 0 ? M : '+') + ' ' + sq(q);
    var cv = q === 0 ? Math.sqrt(p) : Math.sqrt(p) - s * Math.sqrt(q);
    var opts = q === 0 ? [[sq(p), Math.sqrt(p)], [p + '', p], ['2', 2]] : [[conjT, cv], [den, dv], [sq(p), Math.sqrt(p)], [sq(q), Math.sqrt(q)]];
    opts = opts.filter(function (o, i) { return opts.findIndex(function (x) { return x[0] === o[0]; }) === i; });
    for (var i = opts.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = opts[i]; opts[i] = opts[j]; opts[j] = t; }
    var right = opts.findIndex(function (o) { return o[0] === conjT; });
    var target = a / dv, newDen = q === 0 ? p : p - q;
    var res = q === 0 ? (a % p === 0 ? (a / p === 1 ? '' : a / p) + sq(p) : a + sq(p) + '/' + p)
      : (newDen === 1 ? (a === 1 ? '' : a) + '(' + conjT + ')' : (a % newDen === 0 ? (a / newDen === 1 ? '' : fmt(a / newDen)) + '(' + conjT + ')' : a + '(' + conjT + ')/' + fmt(newDen)));
    var frac = a + '/(' + den + ')';
    return task({
      skill: 'rational', kind: q === 0 ? 'mono' : 'bin', prompt: 'Rationalize <b>' + frac + '</b>: choose the factor and where to multiply by it, so the value stays on the target and the denominator has no root.',
      target: target, targetLabel: 'Target ' + frac,
      params: [{ id: 'f', label: 'Multiply by', opts: opts.map(function (o) { return o[0]; }), init: right === 0 ? 1 : 0 },
               { id: 'w', label: 'Multiply', opts: ['numerator and denominator', 'denominator only'], init: 1 }],
      value: function (pp) { var fv = opts[pp.f][1]; return pp.w === 0 ? target : a / (dv * fv); },
      expr: function (pp) { var f = opts[pp.f][0]; return pp.w === 0 ? a + '(' + f + ') / ((' + den + ')(' + f + '))' : a + ' / ((' + den + ')(' + f + '))'; },
      solution: function () { return { f: right, w: 0 }; },
      check: function (pp) {
        if (pp.w === 1) return { ok: false, code: 'denonly' };
        return pp.f === right ? { ok: true } : { ok: false, code: 'notconj' };
      },
      hint: function (code, level) {
        if (level === 1) return code === 'denonly'
          ? 'The marker left the target: multiplying only the denominator changes the value. Multiply the numerator and the denominator by the same factor, which is the same as multiplying by 1.'
          : 'The value stays on the target, but the new denominator still contains a root. ' + (q === 0 ? 'Which factor turns ' + sq(p) + ' into a whole number?' : 'Which factor makes the middle terms cancel?');
        if (level === 2) return q === 0 ? sq(p) + ' \u00b7 ' + sq(p) + ' = ' + p + '.' : '(' + root(2, 'a') + ' + ' + root(2, 'b') + ')(' + root(2, 'a') + ' ' + M + ' ' + root(2, 'b') + ') = a ' + M + ' b: the cross terms cancel.';
        return 'Multiply both by ' + conjT + ': the denominator becomes ' + fmt(newDen) + ', so ' + frac + ' = ' + res + '.';
      },
      note: function () { return frac + ' = ' + res + ' \u2248 ' + fmt(Math.round(target * 1000) / 1000) + '. The denominator is now ' + fmt(newDen) + ', a rational number.'; }
    });
  }

  /* ---------- Phase 4: exponential and radical notation ---------- */
  function fracItem(b, p, q, label, prompt) {
    var target = Math.pow(b, p / q);
    return task({
      skill: 'notation', kind: 'frac', prompt: prompt || 'Write <b>' + label + '</b> as a single power of ' + b + ': ' + b + '<sup>p/q</sup>.',
      target: target, targetLabel: 'Target ' + label,
      params: [{ id: 'p', label: 'Numerator p', min: -9, max: 12, init: 1 }, { id: 'q', label: 'Denominator q', min: 1, max: 12, init: 1 }],
      value: function (x) { return Math.pow(b, x.p / x.q); },
      expr: function (x) { return b + '<sup>' + fracLabel(x.p, x.q) + '</sup>'; },
      solution: function () { return { p: p, q: q }; },
      check: function (x) {
        if (x.p * q === p * x.q) return { ok: true };
        if (x.p === q && x.q === p) return { ok: false, code: 'swap' };
        if (p * x.p < 0) return { ok: false, code: 'sign' };
        return { ok: false, code: 'off' };
      },
      hint: function (code, level) {
        if (level === 1) {
          if (code === 'swap') return 'Numerator and denominator are swapped: in a<sup>m/n</sup> = ' + root('n', 'a<sup>m</sup>') + ', the root index goes in the denominator.';
          if (code === 'sign') return 'Check the sign: a root in the denominator, as in 1/' + root(2, 'a') + ', means a negative exponent.';
          return 'Rewrite each root as a power: ' + root(2, 'a') + ' = a<sup>1/2</sup>, ' + root(3, 'a') + ' = a<sup>1/3</sup>. Then use the exponent rules.';
        }
        if (level === 2) return 'a<sup>m/n</sup> = ' + root('n', 'a<sup>m</sup>') + ': the power m goes on top, the index n below. Products of the same base add the exponents.';
        return label + ' = ' + b + '<sup>' + fracLabel(p, q) + '</sup>.';
      },
      note: function () { return label + ' = ' + b + '<sup>' + fracLabel(p, q) + '</sup> \u2248 ' + fmt(Math.round(target * 1000) / 1000) + '.'; }
    });
  }
  function evalItem(b, p, q) {
    var target = Math.pow(b, p / q), ans = Math.round(target), lab = b + '<sup>' + p + '/' + q + '</sup>';
    var wrong = Math.round(b * p / q);
    return task({
      skill: 'notation', kind: 'eval', prompt: 'Place <b>' + lab + '</b> on the line: find its exact value v.',
      target: target, targetLabel: 'Target ' + lab,
      params: [{ id: 'v', label: 'Value v', min: 0, max: 99, init: 1 }],
      value: function (x) { return x.v; }, expr: function (x) { return fmt(x.v); },
      solution: function () { return { v: ans }; },
      check: function (x) { return x.v === ans ? { ok: true } : { ok: false, code: x.v === wrong ? 'divide' : 'off' }; },
      hint: function (code, level) {
        if (level === 1) return code === 'divide' ? lab + ' is not ' + b + ' \u00b7 ' + p + '/' + q + '. A fractional exponent is a root: the denominator ' + q + ' is the index.' : 'Rewrite it as a root: ' + lab + ' = ' + root(q, b + (p > 1 ? '<sup>' + p + '</sup>' : '')) + '.';
        if (level === 2) return 'Take the root first, then the power: (' + root(q, b) + ')' + (p > 1 ? '<sup>' + p + '</sup>' : '') + '.';
        return lab + ' = (' + root(q, b) + ')' + (p > 1 ? '<sup>' + p + '</sup>' : '') + ' = ' + ans + '.';
      },
      note: function () { return lab + ' = ' + ans + '.'; }
    });
  }

  /* ---------- Fixed chapter items and generators ---------- */
  var fixed = {
    powers: [powItem(2, 3, 'pow'), powItem(5, 0, 'pow'), powItem(2, -3, 'pow'),
      powItem(2, 2, 'rule-prod', { prompt: 'Write <b>' + pw(2, 3) + ' \u00b7 ' + pw(2, 4) + ' \u00f7 ' + pw(2, 5) + '</b> as a single power of 2.', label: '4', wrong: 7, rule: { why: 'Multiplying powers with the same base adds the exponents (it does not multiply them); dividing subtracts.', step: pw(2, 3) + ' \u00b7 ' + pw(2, 4) + ' \u00f7 ' + pw(2, 5) + ' = ' + pw(2, '3 + 4 ' + M + ' 5') + ' = ' + pw(2, 2) + '.' } }),
      powItem(2, 6, 'rule-power', { prompt: 'Write <b>(' + pw(2, 2) + ')<sup>3</sup></b> as a single power of 2.', label: '64', wrong: 5, rule: { why: 'A power raised to a power multiplies the exponents; it does not add them.', step: '(' + pw(2, 2) + ')<sup>3</sup> = ' + pw(2, '2 \u00b7 3') + ' = ' + pw(2, 6) + '.' } })],
    radicals: [simpItem(50, 2), combItem('add', 2, 4, 3), combItem('mul', 3, 12), simpItem(54, 3), simpItem(5625, 2)],
    rational: [ratItem(6, 3, 1, 0), ratItem(5, 3, 1, 2), ratItem(4, 5, -1, 1)],
    notation: [evalItem(64, 1, 3), fracItem(2, 5, 6, root(3, 2) + ' \u00b7 ' + root(2, 2)), fracItem(5, 2, 3, root(3, '5<sup>2</sup>')), fracItem(7, -1, 2, '1/' + root(2, 7))]
  };
  var gen = {
    powers: function (kind) {
      var k = kind || pick(['pow', 'pow', 'rule-prod', 'rule-power']);
      if (k === 'rule-prod') return ruleItem('prod');
      if (k === 'rule-power') return ruleItem('power');
      var b = pick([2, 3, 10]), lim = b === 2 ? 5 : 3, e = rnd(-3, lim);
      return powItem(b, e, 'pow');
    },
    radicals: function (kind) {
      var k = kind || pick(['simp2', 'simp2', 'simp3', 'add', 'mul', 'div']);
      if (k === 'simp2') { var kk = rnd(2, 6), m = pick([2, 3, 5, 6, 7]); return simpItem(kk * kk * m, 2); }
      if (k === 'simp3') { var k3 = rnd(2, 3), m3 = pick([2, 3, 4]); return simpItem(k3 * k3 * k3 * m3, 3); }
      if (k === 'add') return combItem('add', rnd(1, 6), rnd(1, 6), pick([2, 3, 5, 7]));
      var x = pick([2, 3, 5]), y = rnd(2, 4), z = rnd(1, 4);
      if (k === 'mul') return combItem('mul', x * y * y, x * z * z);
      return combItem('div', x * y * y * z * z, x * z * z);
    },
    rational: function (kind) {
      var k = kind || pick(['mono', 'bin', 'bin']);
      if (k === 'mono') { var p0 = pick([2, 3, 5, 7]); return ratItem(p0 * rnd(1, 3), p0, 1, 0); }
      for (;;) {
        var p = pick([2, 3, 5, 6, 7, 10]), q = pick([1, 2, 3, 5]), s = pick([1, -1]);
        if (p > q && !(p === 4)) { var nd = p - q; return ratItem(nd * rnd(1, 3), p, s, q); }
      }
    },
    notation: function (kind) {
      var k = kind || pick(['frac', 'frac', 'eval']);
      if (k === 'eval') { var c = pick([[8, 1, 3], [27, 1, 3], [16, 1, 2], [25, 1, 2], [8, 2, 3], [16, 3, 4], [32, 2, 5], [9, 3, 2]]); return evalItem(c[0], c[1], c[2]); }
      var b = pick([2, 3, 5]), t = pick(['prod', 'pow', 'recip']);
      if (t === 'prod') return fracItem(b, 5, 6, root(3, b) + ' \u00b7 ' + root(2, b));
      if (t === 'pow') { var mm = pick([2, 4, 5]), n = 3; return fracItem(b, mm, n, root(n, b + '<sup>' + mm + '</sup>')); }
      return fracItem(b, -1, 2, '1/' + root(2, b));
    },
    realline: function (kind, prev) {
      var sub = prev && prev.sub ? prev.sub : pick(['locate', 'order', 'distance', 'intervals']);
      var it = cap1[sub](prev && prev.sub ? kind : undefined);
      it.sub = sub; it.skill = 'realline'; return it;
    }
  };

  /* ---------- Hooks into the shared engine ---------- */
  C.evaluate = function (it, ans) { return it.type === 'param' ? it.check(ans) : base1.evaluate(it, ans); };
  C.hint = function (it, code, level, ans) {
    if (it.type !== 'param') return base1.hint(it, code, level, ans);
    var vis = level === 3 ? { reveal: true } : level === 2 ? { highlight: [Math.floor(it.target), Math.floor(it.target) + 1] } : null;
    return { text: it.hint(code, level, ans), vis: vis || undefined };
  };
  C.successNote = function (it) { return it.type === 'param' ? it.note() : base1.successNote(it); };

  C.skills = ['powers', 'radicals', 'rational', 'notation', 'realline'];
  C.storeKey = 'rl-cap02-v1';
  C.skillNames = { powers: 'Powers', radicals: 'Radicals', rational: 'Rationalizing', notation: 'Notation', realline: 'Real line (Ch. 1)',
    locate: 'Placing numbers', order: 'Order', distance: 'Distance', intervals: 'Intervals' };
  C.fixed = fixed;
  C.gen = gen;

  var common = '<p class="u3d-help">Type your answer in each field and press Enter or Check answer. The purple marker lands on the value of the expression you built; the gold pin marks the target. A wrong answer opens a hint, and the third hint shows the solution followed by a similar task.</p><p class="u3d-help">Three correct answers complete the phase. You can then return to the chapter or keep practising.</p>';
  var legend = [['var(--rl-stu)', 'Your expression'], ['var(--rl-gold)', 'Target']];
  C.phases = {
    powers: { n: 1, skills: ['powers'], legend: legend, title: 'Power Line: exponents', short: 'Exponents',
      intro: 'Every power lands somewhere on the real line. Adjust the exponent until your marker reaches the target, and use the exponent rules to rewrite products, quotients and powers of powers.',
      takeaway: 'Same base: multiplying adds exponents, dividing subtracts them, and a power of a power multiplies them. a<sup>0</sup> = 1, and a negative exponent makes a reciprocal, not a negative number.',
      guide: common },
    radicals: { n: 2, skills: ['radicals'], legend: legend, title: 'Power Line: roots and radicals', short: 'Roots and radicals',
      intro: 'Build radical expressions that land on the target. Simplify by pulling pairs or triples of prime factors out of the radical, and combine radicals only when they are alike.',
      takeaway: 'A radical is simplified when its radicand has no perfect square (or cube) factor. Like radicals add their coefficients; radicals with a common index multiply and divide their radicands.',
      guide: common },
    rational: { n: 3, skills: ['rational'], legend: legend, title: 'Power Line: rationalizing denominators', short: 'Rationalizing',
      intro: 'Remove the root from a denominator without moving the value. Your marker must stay on the target while you choose the factor and where to multiply by it.',
      takeaway: 'Multiply the numerator and the denominator by the same factor. For a two-term denominator use the conjugate: (\u221aa + \u221ab)(\u221aa \u2212 \u221ab) = a \u2212 b.',
      guide: common },
    notation: { n: 4, skills: ['notation'], legend: legend, title: 'Power Line: exponential and radical notation', short: 'Two notations',
      intro: 'Move between a<sup>m/n</sup> and the n-th root of a<sup>m</sup>. Set the exponent as a fraction, or evaluate a fractional power, so the marker lands on the target.',
      takeaway: 'a<sup>m/n</sup> = (\u207f\u221aa)<sup>m</sup>: the denominator is the root index, the numerator the power. Fractional exponents make products of different roots easy to combine.',
      guide: common },
    challenge: { n: 5, label: 'Synthesis (assessed)', what: 'the synthesis', skills: ['powers', 'radicals', 'rational', 'notation', 'realline'], legend: legend,
      title: 'Power Line: synthesis', short: 'Synthesis',
      intro: 'One task from each skill of this chapter, plus one from the real line of Chapter 1. The lab starts with the skill that needs the most practice and records whether you solved each one on the first try.',
      takeaway: 'Powers and roots describe the same relationship from two directions, and every result is still a point on the real line.',
      guide: '<p class="u3d-help">The synthesis asks for one right answer in each of five skills: the four of this chapter and one task from Chapter 1. The chips above the task show which skills are done.</p><p class="u3d-help">At the end you see how many skills you solved on the first try. After that, endless mode draws tasks at random from all five skills.</p>' }
  };
})();
