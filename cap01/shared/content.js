/* Real Line Lab - College Algebra I, Chapter 1
   Content: phases, chapter items, generators, checking and graded hints.
   Edit texts here; the engine reads window.RL_CONTENT. */
(function () {
  'use strict';
  var M = '\u2212';
  function fmt(x) {
    if (Object.is(x, -0)) x = 0;
    var s = String(Math.round(x * 1000) / 1000);
    return s.replace('-', M);
  }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function fracStr(p, q) {
    var g = gcd(p, q) || 1; p /= g; q /= g;
    if (q < 0) { p = -p; q = -q; }
    if (q === 1) return fmt(p);
    return (p < 0 ? M : '') + Math.abs(p) + '/' + q;
  }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function terminates(q) { while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5; return q === 1; }
  function decStr(p, q) {
    var v = p / q;
    if (terminates(q)) return fmt(v);
    var a = Math.abs(p), whole = Math.floor(a / q), r = a % q, d = '';
    for (var i = 0; i < 5; i++) { r *= 10; d += Math.floor(r / q); r = r % q; }
    return (p < 0 ? M : '') + whole + '.' + d + '\u2026';
  }
  function parseNum(s) {
    if (s == null) return NaN;
    s = String(s).trim().replace(/\u2212/g, '-').replace(',', '.');
    if (s === '') return NaN;
    if (/^-?\d+\/\d+$/.test(s)) { var t = s.split('/'); return Number(t[0]) / Number(t[1]); }
    return Number(s);
  }
  function absText(c, r, rel) {
    var inner = c === 0 ? 'x' : (c > 0 ? 'x ' + M + ' ' + fmt(c) : 'x + ' + fmt(-c));
    return '|' + inner + '| ' + rel + ' ' + fmt(r);
  }
  function ivText(iv) {
    var l = iv.li ? '(' : (iv.lc ? '[' : '(');
    var r = iv.ri ? ')' : (iv.rc ? ']' : ')');
    if (iv.li && iv.lc) l = '[';
    if (iv.ri && iv.rc) r = ']';
    return l + (iv.li ? M + '\u221e' : fmt(iv.L)) + ', ' + (iv.ri ? '\u221e' : fmt(iv.R)) + r;
  }
  function setBuilder(iv) {
    var lo = iv.lc ? '\u2264' : '<', hi = iv.rc ? '\u2264' : '<';
    if (iv.li && iv.ri) return '{x | x \u2208 \u211d}';
    if (iv.li) return '{x | x ' + hi + ' ' + fmt(iv.R) + '}';
    if (iv.ri) return '{x | x ' + (iv.lc ? '\u2265' : '>') + ' ' + fmt(iv.L) + '}';
    return '{x | ' + fmt(iv.L) + ' ' + lo + ' x ' + hi + ' ' + fmt(iv.R) + '}';
  }

  /* ---------- Phases ---------- */
  var phases = {
    locate: {
      n: 1, skills: ['locate'],
      title: 'Real Line Lab: placing real numbers',
      short: 'Placing real numbers',
      intro: 'Every real number corresponds to exactly one point on the line. Split each unit into equal parts, then count parts from zero to place fractions and decimals.',
      takeaway: 'A fraction a/b is placed by splitting each unit into b equal parts and counting a of them from zero. Terminating and repeating decimals land on ticks too, because they are rational. An irrational number such as \u221a2 never lands exactly on a tick.',
      legend: [['var(--rl-stu)', 'Your marker'], ['var(--rl-line)', 'Number line']],
      guide: '<p class="u3d-help">Choose how many equal parts each unit is split into, then move the marker. Drag it in the scene or use the arrow buttons; each step moves one part.</p><p class="u3d-help">A wrong answer opens a hint. Hints get more specific each time, and the third one shows the solution followed by a similar task for practice.</p><p class="u3d-help">XP comes from tasks solved without hints or with only the first one. Three such tasks in a row show mastery of the skill.</p>'
    },
    order: {
      n: 2, skills: ['order'],
      title: 'Real Line Lab: keep or reverse the order',
      short: 'Keep or reverse the order',
      intro: 'Apply the same operation to two numbers and predict whether their order survives. After you check, the line shows what the operation actually does.',
      takeaway: 'Adding, subtracting, or multiplying by a positive number keeps the order. Multiplying or dividing by a negative number mirrors the line around zero, so the inequality sign reverses.',
      legend: [['var(--rl-a)', 'Point a'], ['var(--rl-stu)', 'Point b']],
      guide: '<p class="u3d-help">Read the operation, then choose the statement that is true after it is applied to both numbers. When you check, the scene replays the operation so you can see why.</p><p class="u3d-help">These tasks have two options, so a wrong answer shows the full explanation at once and is followed by a similar task. Three correct first attempts in a row show mastery.</p>'
    },
    distance: {
      n: 3, skills: ['distance'],
      title: 'Real Line Lab: distance and absolute value',
      short: 'Distance and absolute value',
      intro: 'Absolute value measures distance on the line, never direction. Position the drones and measure the gaps between points.',
      takeaway: 'The distance between a and b is |a \u2212 b|, and it is never negative. A statement such as |x \u2212 c| = r has two solutions, one on each side of c.',
      legend: [['var(--rl-gold)', 'Reference point'], ['var(--rl-stu)', 'Drone']],
      guide: '<p class="u3d-help">Drag a drone in the scene or use its arrow buttons; each step moves half a unit. Some tasks ask you to place both drones, others ask you to type a distance.</p><p class="u3d-help">Hints get more specific after each wrong answer, and the third one shows the solution followed by a similar task.</p>'
    },
    intervals: {
      n: 4, skills: ['intervals'],
      title: 'Real Line Lab: building intervals',
      short: 'Building intervals',
      intro: 'Light up subsets of the real line. A solid end is included, a hollow ring is excluded, and a beam with no end keeps going forever.',
      takeaway: 'A bracket includes the endpoint and a parenthesis excludes it. Infinity is not a number the interval reaches, so it always takes a parenthesis.',
      legend: [['var(--rl-stu)', 'Your interval'], ['#ffffff', 'Hint outline']],
      guide: '<p class="u3d-help">Set each endpoint with the arrow buttons, decide whether it is included or excluded, or switch it to infinity. The notation of your beam updates as you go.</p><p class="u3d-help">Some tasks show a beam and ask you to choose its notation. Hints get more specific after each wrong answer.</p>'
    },
    challenge: {
      n: 5, skills: ['locate', 'order', 'distance', 'intervals'],
      title: 'Real Line Lab: final challenge',
      short: 'Final challenge',
      intro: 'Mixed tasks from the whole chapter. The lab picks each new task from the skill that needs the most practice.',
      takeaway: 'The number line connects every idea in this chapter: sets of numbers, order, distance and intervals are all ways of describing positions on it.',
      legend: [['var(--rl-stu)', 'Your answer'], ['var(--rl-gold)', 'Reference point']],
      guide: '<p class="u3d-help">Tasks come from all four skills. The bars show your mastery; the next task always comes from your weakest skill, so the challenge adapts as you work.</p><p class="u3d-help">Mastery saved in the earlier phases counts here when you use the same browser.</p>'
    }
  };

  var skillNames = { locate: 'Placing numbers', order: 'Order', distance: 'Distance', intervals: 'Intervals' };

  /* ---------- Item factories ---------- */
  function locItem(p, q, show, label, steps) {
    var g = gcd(p, q); p /= g; q /= g;
    var lab = label || (show === 'dec' ? decStr(p, q) : fracStr(p, q));
    return { skill: 'locate', type: 'locate', kind: show, p: p, q: q, label: lab, steps: steps || '',
      prompt: 'Place <b>' + lab + '</b> on the number line.' };
  }
  function ordItem(a, b, kind, k) {
    var opTxt, ea, eb;
    if (kind === 'add') {
      opTxt = k >= 0 ? 'Add ' + fmt(k) + ' to both numbers.' : 'Subtract ' + fmt(-k) + ' from both numbers.';
      ea = 'a ' + (k >= 0 ? '+ ' + fmt(k) : M + ' ' + fmt(-k)); eb = ea.replace('a', 'b');
    } else {
      opTxt = 'Multiply both numbers by ' + fmt(k) + '.';
      ea = (k === -1 ? M : fmt(k)) + 'a'; eb = (k === -1 ? M : fmt(k)) + 'b';
    }
    return { skill: 'order', type: 'order', kind: kind === 'add' ? 'add' : (k < 0 ? 'neg' : 'pos'), a: a, b: b, op: kind, k: k,
      ans: (kind === 'mul' && k < 0) ? '>' : '<', ea: ea, eb: eb,
      prompt: 'Here a = ' + fmt(a) + ' and b = ' + fmt(b) + ', so a &lt; b. ' + opTxt + ' Which statement is true?' };
  }
  function pairItem(c, r, form) {
    var t = form === 'abs'
      ? 'Find every x with <b>' + absText(c, r, '=') + '</b>. Place one drone on each solution.'
      : 'Place both drones exactly <b>' + fmt(r) + ' units</b> from ' + fmt(c) + '.';
    return { skill: 'distance', type: 'pair', kind: 'pair', c: c, r: r, form: form, prompt: t };
  }
  function measureItem(a, b) {
    return { skill: 'distance', type: 'measure', kind: 'measure', a: a, b: b,
      prompt: 'The drones sit at ' + fmt(a) + ' and ' + fmt(b) + '. How far apart are they? Enter |' + fmt(a) + ' ' + M + ' ' + (b < 0 ? '(' + fmt(b) + ')' : fmt(b)) + '|.' };
  }
  function buildItem(iv, absSrc) {
    var t = absSrc
      ? 'Light up every x with <b>' + absText(absSrc.c, absSrc.r, absSrc.rel) + '</b>.'
      : 'Light up the set <b>' + setBuilder(iv) + '</b>.';
    return { skill: 'intervals', type: 'build', kind: absSrc ? 'abs' : 'build', iv: iv, abs: absSrc || null, prompt: t };
  }
  function readItem(iv) {
    var right = ivText(iv), opts = [{ t: right, k: 'ok' }];
    var sw = { L: iv.L, R: iv.R, li: iv.li, ri: iv.ri, lc: iv.li ? false : !iv.lc, rc: iv.ri ? false : !iv.rc };
    opts.push({ t: ivText(sw), k: 'swap' });
    if (iv.li || iv.ri) {
      var inf = { L: iv.L, R: iv.R, li: iv.li, ri: iv.ri, lc: iv.li ? true : iv.lc, rc: iv.ri ? true : iv.rc };
      opts.push({ t: ivText(inf), k: 'inf' });
      var side = iv.li ? { L: iv.R, ri: true, li: false, lc: iv.rc, rc: false } : { R: iv.L, li: true, ri: false, rc: iv.lc, lc: false };
      opts.push({ t: ivText(side), k: 'side' });
    } else {
      opts.push({ t: ivText({ L: iv.L - 1, R: iv.R, lc: iv.lc, rc: iv.rc }), k: 'shift' });
      opts.push({ t: ivText({ L: iv.L, R: iv.R + 1, lc: !iv.lc, rc: iv.rc }), k: 'shift' });
    }
    var seen = {}; opts = opts.filter(function (o) { if (seen[o.t]) return false; seen[o.t] = 1; return true; });
    for (var i = opts.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = opts[i]; opts[i] = opts[j]; opts[j] = x; }
    return { skill: 'intervals', type: 'read', kind: 'read', iv: iv, opts: opts,
      ans: opts.findIndex(function (o) { return o.k === 'ok'; }),
      prompt: 'Which notation describes the lit beam?' };
  }

  /* Items taken from the chapter, used first in each phase */
  var fixed = {
    locate: [
      locItem(2, 3, 'frac'),
      locItem(-3, 2, 'frac'),
      locItem(17, 20, 'dec', '0.85'),
      locItem(2, 3, 'dec', '0.666\u2026', 'Let x = 0.666\u2026. Then 10x = 6.666\u2026, and 10x ' + M + ' x = 6, so 9x = 6 and x = 2/3.'),
      locItem(7, 12, 'dec', '0.58333\u2026', 'Align the repeating tails: 1000x = 583.333\u2026 and 100x = 58.333\u2026. Subtracting gives 900x = 525, so x = 7/12.')
    ],
    order: [ordItem(-2, 3, 'mul', -2), ordItem(1, 4, 'add', -5), ordItem(-3, 2, 'mul', 3), ordItem(-4, -1, 'mul', -1)],
    distance: [pairItem(-1, 3, 'plain'), measureItem(-3, 4), pairItem(0, 2.5, 'abs'), pairItem(2, 4, 'abs')],
    intervals: [
      buildItem({ L: -2, R: 3, lc: true, rc: false, li: false, ri: false }),
      buildItem({ L: 1, R: 0, lc: true, rc: false, li: false, ri: true }),
      readItem({ L: 0, R: 4, lc: false, rc: true, li: true, ri: false }),
      buildItem({ L: -1, R: 5, lc: false, rc: false, li: false, ri: false }, { c: 2, r: 3, rel: '<' })
    ]
  };

  /* Generators, used for reinforcement and after the chapter items */
  var gen = {
    locate: function (kind) {
      var show = kind || pick(['frac', 'dec']);
      var qs = show === 'dec' ? [2, 3, 4, 5, 6, 8, 10] : [2, 3, 4, 5, 6, 8];
      for (;;) {
        var q = pick(qs), p = rnd(-5 * q, 5 * q);
        if (p % q !== 0 && gcd(p, q) === 1) return locItem(p, q, show);
      }
    },
    order: function (kind) {
      var k = kind || pick(['neg', 'pos', 'add', 'neg']);
      for (;;) {
        var a = rnd(-5, 4), b = rnd(a + 1, 5);
        if (k === 'add') return ordItem(a, b, 'add', pick([-5, -4, -3, -2, 2, 3, 4]));
        if (k === 'pos') return ordItem(a, b, 'mul', pick([2, 3]));
        if (Math.abs(a) <= 3 && Math.abs(b) <= 3) return ordItem(a, b, 'mul', pick([-1, -2]));
      }
    },
    distance: function (kind) {
      var k = kind || pick(['pair', 'pair', 'measure']);
      if (k === 'measure') { var a = rnd(-6, 5), b = rnd(-6, 6); if (b === a) b = a + 3; return measureItem(a, b); }
      for (;;) {
        var c = rnd(-3, 3), r = pick([1, 1.5, 2, 2.5, 3, 3.5]);
        if (Math.abs(c) + r <= 6) return pairItem(c, r, pick(['plain', 'abs']));
      }
    },
    intervals: function (kind) {
      var k = kind || pick(['build', 'build', 'read', 'abs']);
      if (k === 'abs') {
        var c = rnd(-2, 2), r = rnd(1, 3), cl = Math.random() < 0.5;
        return buildItem({ L: c - r, R: c + r, lc: cl, rc: cl, li: false, ri: false }, { c: c, r: r, rel: cl ? '\u2264' : '<' });
      }
      var iv;
      if (Math.random() < 0.3) {
        var e = rnd(-4, 4), left = Math.random() < 0.5, cc = Math.random() < 0.5;
        iv = left ? { L: 0, R: e, li: true, ri: false, lc: false, rc: cc } : { L: e, R: 0, li: false, ri: true, lc: cc, rc: false };
      } else {
        var L = rnd(-5, 3), R = rnd(L + 1, 5);
        iv = { L: L, R: R, li: false, ri: false, lc: Math.random() < 0.5, rc: Math.random() < 0.5 };
      }
      return k === 'read' ? readItem(iv) : buildItem(iv);
    }
  };

  /* ---------- Checking ---------- */
  function sameIv(a, b) {
    if (a.li !== b.li || a.ri !== b.ri) return false;
    if (!a.li && a.L !== b.L) return false;
    if (!a.ri && a.R !== b.R) return false;
    return true;
  }
  function evaluate(it, ans) {
    switch (it.type) {
      case 'locate':
        if (ans.k * it.q === it.p * ans.n) return { ok: true };
        if (ans.k * it.q === -it.p * ans.n) return { ok: false, code: 'sign' };
        if (ans.n % it.q !== 0) return { ok: false, code: 'parts' };
        return { ok: false, code: 'off' };
      case 'order':
        if (!ans.choice) return { invalid: 'Choose one of the two statements first.' };
        return ans.choice === it.ans ? { ok: true } : { ok: false, code: it.kind };
      case 'pair': {
        var s = [it.c - it.r, it.c + it.r], x = ans.xs.slice().sort(function (a, b) { return a - b; });
        if (x[0] === s[0] && x[1] === s[1]) return { ok: true };
        var hits = x.filter(function (v) { return v === s[0] || v === s[1]; }).length;
        return { ok: false, code: hits ? 'one' : 'none' };
      }
      case 'measure': {
        var v = parseNum(ans.val), d = Math.abs(it.a - it.b);
        if (isNaN(v)) return { invalid: 'Type a number first, for example 7 or 2.5.' };
        if (Math.abs(v - d) < 1e-9) return { ok: true };
        if (v < 0) return { ok: false, code: 'neg' };
        if (Math.abs(v - Math.abs(Math.abs(it.a) - Math.abs(it.b))) < 1e-9) return { ok: false, code: 'sizes' };
        return { ok: false, code: 'off' };
      }
      case 'build': {
        var t = it.iv;
        if (!ans.li && !ans.ri && ans.L > ans.R) return { invalid: 'The left endpoint has to be smaller than the right one.' };
        if ((ans.li && ans.lc) || (ans.ri && ans.rc)) return { ok: false, code: 'infclosed' };
        if (!sameIv(ans, t)) return { ok: false, code: 'ends' };
        if ((!t.li && ans.lc !== t.lc) || (!t.ri && ans.rc !== t.rc)) return { ok: false, code: 'closure' };
        return { ok: true };
      }
      case 'read':
        if (ans.choice == null) return { invalid: 'Choose one of the notations first.' };
        return ans.choice === it.ans ? { ok: true } : { ok: false, code: it.opts[ans.choice].k };
    }
    return { ok: false, code: 'off' };
  }

  /* ---------- Hints (level 1: question, level 2: visual cue, level 3: solution) ---------- */
  function orderNumbers(it) {
    var f = function (v) { return it.op === 'add' ? v + it.k : v * it.k; };
    var na = f(it.a), nb = f(it.b);
    var show = function (v) {
      return it.op === 'add'
        ? fmt(v) + (it.k >= 0 ? ' + ' + fmt(it.k) : ' ' + M + ' ' + fmt(-it.k))
        : fmt(it.k) + ' \u00b7 ' + (v < 0 ? '(' + fmt(v) + ')' : fmt(v));
    };
    return show(it.a) + ' = ' + fmt(na) + ' and ' + show(it.b) + ' = ' + fmt(nb) + ', and ' + fmt(na) + ' ' + (na < nb ? '&lt;' : '&gt;') + ' ' + fmt(nb) + '. ';
  }
  function explainOrder(it) {
    var why = it.kind === 'neg'
      ? 'Multiplying by a negative number mirrors the line around zero, so the order reverses.'
      : it.kind === 'add'
        ? 'Adding or subtracting slides both points the same distance, so the order stays.'
        : 'A positive factor stretches distances from zero but keeps every point on its side, so the order stays.';
    return orderNumbers(it) + why;
  }
  function hint(it, code, level, ans) {
    if (it.type === 'locate') {
      var fl = Math.floor(it.p / it.q);
      if (level === 1) {
        if (code === 'sign') return { text: 'Check the sign. Negative numbers lie to the left of zero, positive numbers to the right.' };
        if (code === 'parts') return { text: it.kind === 'dec'
          ? 'Write ' + it.label + ' as a fraction first. Its denominator tells you how many equal parts each unit needs.'
          : 'With ' + ans.n + ' part' + (ans.n > 1 ? 's' : '') + ' per unit, no tick lands exactly on ' + it.label + '. How many equal parts does its denominator call for?' };
        return { text: 'Between which two consecutive integers does ' + it.label + ' lie? Start there and count the parts.' };
      }
      if (level === 2) return { text: it.label + ' lies between ' + fmt(fl) + ' and ' + fmt(fl + 1) + ', the glowing unit. Split each unit into ' + it.q + ' equal parts.', vis: { highlight: [fl, fl + 1] } };
      return { text: it.label + ' = ' + fracStr(it.p, it.q) + '. With ' + it.q + ' parts per unit, count ' + Math.abs(it.p) + ' part' + (Math.abs(it.p) > 1 ? 's' : '') + ' to the ' + (it.p < 0 ? 'left' : 'right') + ' of zero. ' + it.steps, vis: { reveal: true } };
    }
    if (it.type === 'order') return { text: explainOrder(it), vis: { reveal: true } };
    if (it.type === 'pair') {
      if (level === 1) {
        var pre = it.form === 'abs' ? absText(it.c, it.r, '=') + ' means that x is ' + fmt(it.r) + ' units from ' + fmt(it.c) + '. ' : '';
        return { text: pre + (code === 'one'
          ? 'One drone is right. Distance is measured in both directions: where else is a point ' + fmt(it.r) + ' units from ' + fmt(it.c) + '?'
          : 'Distance tells you how far, not which way. Count ' + fmt(it.r) + ' units from ' + fmt(it.c) + ', once to the left and once to the right.') };
      }
      if (level === 2) return { text: 'The ring has radius ' + fmt(it.r) + ' and is centred at ' + fmt(it.c) + '. Where does it cross the line?', vis: { circle: [it.c, it.r] } };
      return { text: 'x = ' + fmt(it.c) + ' ' + M + ' ' + fmt(it.r) + ' = ' + fmt(it.c - it.r) + ' or x = ' + fmt(it.c) + ' + ' + fmt(it.r) + ' = ' + fmt(it.c + it.r) + '.', vis: { reveal: true } };
    }
    if (it.type === 'measure') {
      var d = Math.abs(it.a - it.b);
      if (level === 1) {
        if (code === 'neg') return { text: 'A distance is never negative. What does the absolute value do to the sign?' };
        if (code === 'sizes') return { text: 'Subtract the coordinates themselves, not their sizes: |a ' + M + ' b|.' };
        return { text: 'Subtract one coordinate from the other, then take the absolute value.' };
      }
      if (level === 2) return { text: 'Count the units along the glowing stretch between the drones.', vis: { highlight: [Math.min(it.a, it.b), Math.max(it.a, it.b)] } };
      return { text: '|' + fmt(it.a) + ' ' + M + ' ' + (it.b < 0 ? '(' + fmt(it.b) + ')' : fmt(it.b)) + '| = |' + fmt(it.a - it.b) + '| = ' + fmt(d) + '.', vis: { reveal: true } };
    }
    if (it.type === 'build') {
      var t = it.iv;
      if (level === 1) {
        if (code === 'infclosed') return { text: '\u221e is not a number the interval can reach, so it can never be included. Infinity always takes a parenthesis.' };
        if (code === 'closure') return { text: 'The endpoints are right. Now check each one: \u2264 or \u2265 includes the endpoint, < or > excludes it.' };
        if (it.abs) return { text: absText(it.abs.c, it.abs.r, it.abs.rel) + ' describes the points ' + (it.abs.rel === '<' ? 'less than' : 'at most') + ' ' + fmt(it.abs.r) + ' units from ' + fmt(it.abs.c) + '. Where are the two boundary points?' };
        return { text: 'Read the inequality: which numbers bound x, and is either side unbounded?' };
      }
      if (level === 2) return { text: 'The white outline shows where the beam belongs. Decide for each end whether it is included.', vis: { ghost: true } };
      var why = (t.li ? 'The beam has no left end. ' : fmt(t.L) + (t.lc ? ' is included. ' : ' is excluded. ')) + (t.ri ? 'It has no right end.' : fmt(t.R) + (t.rc ? ' is included.' : ' is excluded.'));
      return { text: 'The answer is ' + ivText(t) + '. ' + why, vis: { reveal: true } };
    }
    if (it.type === 'read') {
      if (level === 1) {
        if (code === 'swap') return { text: 'Look at the ends of the beam. A solid end is included and takes a bracket; a hollow ring is excluded and takes a parenthesis.' };
        if (code === 'inf') return { text: 'Infinity can never be included, so it never takes a bracket.' };
        if (code === 'side') return { text: 'Check which way the beam runs: toward the left or toward the right?' };
        return { text: 'Check the endpoints: which numbers sit at the ends of the beam?' };
      }
      if (level === 2) return { text: 'One wrong option has been removed. Compare each end of the beam with the remaining choices.', vis: { remove: true } };
      return { text: 'The beam is ' + ivText(it.iv) + '.', vis: { reveal: true } };
    }
    return { text: '' };
  }

  function successNote(it) {
    if (it.type === 'locate') {
      var v = it.p / it.q;
      return it.label + ' = ' + fracStr(it.p, it.q) + (it.kind === 'dec' ? ' (' + fmt(Math.round(v * 100000) / 100000) + (terminates(it.q) ? ')' : '\u2026)') : '') + '. It belongs to \u211a and \u211d, but not to \u2124 or \u2115.';
    }
    if (it.type === 'order') return explainOrder(it);
    if (it.type === 'pair') return 'Both points are ' + fmt(it.r) + ' units from ' + fmt(it.c) + ': ' + fmt(it.c - it.r) + ' and ' + fmt(it.c + it.r) + '.';
    if (it.type === 'measure') return 'The distance is ' + fmt(Math.abs(it.a - it.b)) + ' units.';
    if (it.type === 'build') return 'The set is the interval ' + ivText(it.iv) + '.';
    if (it.type === 'read') return 'The beam is ' + ivText(it.iv) + '.';
    return '';
  }

  window.RL_CONTENT = {
    phases: phases, skillNames: skillNames, fixed: fixed, gen: gen,
    evaluate: evaluate, hint: hint, successNote: successNote,
    util: { fmt: fmt, fracStr: fracStr, ivText: ivText, M: M }
  };
})();
