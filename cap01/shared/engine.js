/* Real Line Lab - College Algebra I, Chapter 1 - engine
   Layout follows the Production Architecture Lab standard.
   The 3D scene (synthwave/outrun, house palette) loads only after "Start the lab". */
(function () {
  'use strict';
  var C = window.RL_CONTENT, U = C.util, fmt = U.fmt, M = U.M;
  var THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var qs = new URLSearchParams(location.search);
  var PHASE = qs.get('phase') || window.RL_PHASE || 'locate';
  var PH = C.phases[PHASE] || C.phases.locate;
  var SKILLS = ['locate', 'order', 'distance', 'intervals'];
  var STORE = 'rl-cap01-v1';
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Storage (shared by every phase on this origin) ---------- */
  function blank() { var s = { xp: 0, skills: {}, phases: {} }; SKILLS.forEach(function (k) { s.skills[k] = { streak: 0, mastered: false, done: 0 }; }); return s; }
  var store = blank();
  try { var raw = JSON.parse(localStorage.getItem(STORE) || 'null'); if (raw && raw.skills) { store.xp = raw.xp || 0; store.phases = raw.phases || {}; SKILLS.forEach(function (k) { if (raw.skills[k]) store.skills[k] = raw.skills[k]; }); } } catch (e) { }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(store)); } catch (e) { } }

  /* ---------- DOM ---------- */
  var root = document.getElementById('rl-root');
  var gauges = SKILLS.map(function (k) {
    return '<div class="u3d-gauge' + (PH.skills.indexOf(k) >= 0 ? ' cur' : '') + '" data-g="' + k + '"><span class="u3d-gname">' + C.skillNames[k] + '</span><span class="u3d-bar"><b></b></span><span class="u3d-gval">0</span></div>';
  }).join('');
  var legend = PH.legend.map(function (l) { return '<span><i style="--c:' + l[0] + '"></i>' + l[1] + '</span>'; }).join(' ');
  var phaseLabel = PH.n <= 4 ? 'Phase ' + PH.n + ' of 4' : 'Chapter review';
  root.innerHTML =
    '<section id="u3d-lab-section"><div class="u3d">' +
    '<div class="u3d-head"><span class="u3d-kicker">Interactive 3D Lab</span><h3>' + PH.title + '</h3><p>' + PH.intro + '</p>' +
    '<p class="u3d-note">Your progress stays in this browser only and is not submitted.</p></div>' +
    '<div class="u3d-stage">' +
    '<div class="u3d-left">' +
    '<div class="u3d-view" aria-label="3D number line">' +
    '<canvas class="u3d-canvas"></canvas><div class="u3d-labels"></div>' +
    '<div class="u3d-tools" hidden><button type="button" class="u3d-zoom" data-zoom="in" aria-label="Zoom in">+</button><button type="button" class="u3d-zoom" data-zoom="out" aria-label="Zoom out">\u2212</button><button type="button" class="u3d-reset">Reset view</button><button type="button" class="u3d-fs-btn">Full screen</button></div>' +
    '<div class="rl-tip" hidden></div>' +
    '<div class="rl-nav" hidden><button type="button" class="u3d-reset" data-nav="zero">Go back to 0</button><button type="button" class="u3d-reset" data-nav="side" aria-pressed="false">Side view</button></div>' +
    '<div class="rl-walk" hidden><span class="rl-pos" aria-live="off"></span><div><button type="button" class="u3d-zoom rl-wb" data-walk="-1" aria-label="Walk toward negative infinity">' + M + '\u221e</button><button type="button" class="u3d-zoom rl-wb" data-walk="1" aria-label="Walk toward positive infinity">+\u221e</button></div></div>' +
    '<div class="u3d-legend" hidden>' + legend + '</div>' +
    '<div class="rl-cover"><div class="rl-sky"></div><div class="rl-sun"></div><div class="rl-floor"></div>' +
    '<div class="rl-cover-txt"><span class="rl-cover-k">' + phaseLabel + '</span><strong>' + PH.short + '</strong>' +
    '<button type="button" class="u3d-btn rl-start">Start the lab</button><span class="rl-cover-p"></span></div></div>' +
    '<div class="rl-done" hidden role="dialog" aria-modal="false" aria-labelledby="rl-done-t"><div class="rl-done-card"><span class="rl-cover-k">' + phaseLabel + ' complete</span><strong id="rl-done-t">' + (PHASE === 'challenge' ? 'Well done! One right answer in every skill.' : 'Well done! Three correct answers.') + '</strong><p>You have shown you can do this. Return to the chapter, or stay and keep practising with new tasks that never run out.</p><div class="rl-done-b"><button type="button" class="u3d-btn" data-done="chapter">Continue with the chapter</button><button type="button" class="u3d-btn quiet" data-done="endless">Keep practising (endless mode)</button></div></div></div>' +
    '<div class="u3d-fallback" hidden>The 3D view is unavailable in this browser. You can still solve every task with the controls on the right.</div>' +
    '</div>' +
    '</div>' +
    '<div class="u3d-panel">' +
    '<div class="rl-ptitle"><span class="u3d-kicker">Interactive 3D Lab \u00b7 ' + phaseLabel + '</span><strong>' + PH.short + '</strong></div>' +
    '<div class="u3d-tabs" role="tablist" aria-label="Lab sections"><button type="button" role="tab" data-tab="task" aria-selected="true">1 Task</button><button type="button" role="tab" data-tab="guide" aria-selected="false">2 How it works</button></div>' +
    '<div class="u3d-pane" data-pane="task" role="tabpanel"><div class="rl-task"><p class="u3d-help">Press <b>Start the lab</b> to load the scene and receive your first task.</p></div></div>' +
    '<div class="u3d-pane" data-pane="guide" role="tabpanel" hidden>' + PH.guide + '<p class="u3d-help"><b>Moving around.</b> Click the scene first. A and D (or \u2190 \u2192) move your answer along the line; when there are two drones, click one to select it. W and S (or \u2191 \u2193) walk the camera, and the \u2212\u221e and +\u221e buttons do the same with a growing pace. Go back to 0 returns to zero, and Side view shows the line from beside it.</p></div>' +
    '<p class="u3d-takeaway rl-take' + (PHASE === 'locate' ? ' rl-fade' : '') + '"' + (PHASE === 'locate' ? ' hidden' : '') + '>' + PH.takeaway + '</p>' +
    '</div></div></div></section>';

  var $ = function (s) { return root.querySelector(s); };
  var viewEl = $('.u3d-view'), stageEl = $('.u3d-stage'), taskEl = $('.rl-task');

  root.querySelectorAll('.u3d-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      root.querySelectorAll('.u3d-tabs button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      root.querySelectorAll('.u3d-pane').forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== b.getAttribute('data-tab'); });
    });
  });

  function renderGauges() {
    SKILLS.forEach(function (k) {
      var s = store.skills[k], v = s.mastered ? 100 : Math.round(Math.min(s.streak, 3) / 3 * 100);
      var g = root.querySelector('[data-g="' + k + '"]'); if (!g) return;
      g.classList.toggle('done', !!s.mastered);
      g.querySelector('b').style.width = v + '%';
      g.querySelector('.u3d-gval').textContent = s.mastered ? '\u2713' : v;
    });
    if ($('.rl-xp')) $('.rl-xp').textContent = store.xp + ' XP';
    var mine = PH.skills.filter(function (k) { return store.skills[k].mastered; }).length;
    $('.rl-cover-p').textContent = store.phases && store.phases[PHASE] ? 'You have already completed this phase. You can practise again.' : (PHASE === 'challenge' ? 'Get one answer right in each of the four skills to complete the challenge.' : 'Get ' + GOAL + ' answers right to complete this phase.');
  }

  /* ---------- Task state ---------- */
  var GOAL = PHASE === 'challenge' ? 4 : 3, rightCount = 0, endless = false, chDone = {}, lastSkill = null;
  if (!store.phases) store.phases = {};
  var queue = (PHASE === 'challenge') ? [] : (C.fixed[PH.skills[0]] || []).slice();
  var st = null, count = 0, view = null;

  function pickWeakest(list) {
    return list.slice().sort(function (a, b) {
      var A = store.skills[a], B = store.skills[b];
      return (A.streak - B.streak) || (Math.random() - 0.5);
    })[0];
  }
  function weakest() {
    var list = PH.skills.slice().sort(function (a, b) {
      var A = store.skills[a], B = store.skills[b];
      return (A.mastered - B.mastered) || (A.streak - B.streak) || (Math.random() - 0.5);
    });
    return list[0];
  }
  function freshAnswer(it) {
    switch (it.type) {
      case 'locate': return { n: 1, k: 1 };
      case 'order': return { choice: null };
      case 'pair': {
        var offs = [0.5, 1, 1.5, 2].filter(function (o) { return o !== it.r; });
        var xs = [it.c + offs[0], it.c + offs[1]].map(function (x) { return Math.max(-7, Math.min(7, x)); });
        return { xs: xs };
      }
      case 'measure': return { val: '' };
      case 'build': {
        var a = { L: -1, R: 1, lc: true, rc: true, li: false, ri: false };
        if (C.evaluate(it, a).ok) a.R = 2;
        return a;
      }
      case 'read': return { choice: null, removed: [] };
    }
    return {};
  }
  renderGauges();
  function nextItem() {
    var it;
    if (st && st.reinforce) it = C.gen[st.item.skill](st.item.kind);
    else if (queue.length) it = queue.shift();
    else if (PHASE === 'challenge') {
      var pool = endless ? SKILLS.filter(function (k) { return k !== lastSkill; }) : SKILLS.filter(function (k) { return !chDone[k]; });
      var sk = endless ? pool[Math.floor(Math.random() * pool.length)] : pickWeakest(pool);
      it = C.gen[sk]();
    }
    else it = C.gen[PH.skills[0]]();
    lastSkill = it.skill;
    count++;
    st = { item: it, ans: freshAnswer(it), hint: 0, done: false, reinforce: false, isReinforce: !!(st && st.reinforce), vis: {}, flash: null };
    renderTask();
    sync();
    if (view) view.focus(center(it));
  }

  /* ---------- Panel ---------- */
  function stepper(label, act, out, aria) {
    return '<div class="rl-step"><span class="rl-lab">' + label + '</span><div class="rl-stepc">' +
      '<button type="button" data-act="' + act + '-" aria-label="' + aria + ' down">\u25c0</button>' +
      '<output data-out="' + out + '"></output>' +
      '<button type="button" data-act="' + act + '+" aria-label="' + aria + ' up">\u25b6</button></div></div>';
  }
  function seg(act, opts) {
    return '<div class="u3d-seg">' + opts.map(function (o) { return '<button type="button" data-act="' + act + '" data-v="' + o[0] + '" aria-pressed="false">' + o[1] + '</button>'; }).join('') + '</div>';
  }
  function chips() {
    if (PHASE !== 'challenge' || endless) return '';
    return '<div class="rl-chips" aria-label="Skills completed">' + SKILLS.map(function (k) {
      return '<span class="rl-chip' + (chDone[k] ? ' on' : '') + '">' + (chDone[k] ? '\u2713 ' : '') + C.skillNames[k] + '</span>';
    }).join('') + '</div>';
  }
  function renderTask() {
    var it = st.item, h = '';
    h += '<div class="u3d-act active"><div class="u3d-meta rl-tags"><span class="u3d-tag">Task ' + count + '</span><span class="u3d-tag">' + C.skillNames[it.skill] + '</span>' + (st.isReinforce ? '<span class="u3d-tag warn">Practice task</span>' : '') + '</div>' + chips();
    h += '<p class="rl-prompt">' + it.prompt + '</p><div class="rl-ctl">';
    if (it.type === 'locate') {
      h += stepper('Parts per unit', 'n', 'n', 'Parts per unit') + stepper('Marker', 'k', 'k', 'Marker');
    } else if (it.type === 'order') {
      h += seg('choice', [['<', it.ea + ' &lt; ' + it.eb], ['>', it.ea + ' &gt; ' + it.eb]]);
    } else if (it.type === 'pair') {
      h += stepper('Drone A', 'x0', 'x0', 'Drone A') + stepper('Drone B', 'x1', 'x1', 'Drone B');
    } else if (it.type === 'measure') {
      h += '<label class="rl-in">Distance<input type="text" inputmode="decimal" autocomplete="off" data-in="val" placeholder="e.g. 7"></label>';
    } else if (it.type === 'build') {
      h += '<div class="rl-end"><span class="rl-lab">Left end</span>' + stepper('', 'L', 'L', 'Left end') + seg('lmode', [['c', 'Included'], ['o', 'Excluded'], ['i', M + '\u221e']]) + '</div>';
      h += '<div class="rl-end"><span class="rl-lab">Right end</span>' + stepper('', 'R', 'R', 'Right end') + seg('rmode', [['c', 'Included'], ['o', 'Excluded'], ['i', '\u221e']]) + '</div>';
      h += '<p class="rl-live">Your beam: <b data-out="iv"></b></p>';
    } else if (it.type === 'read') {
      h += '<div class="u3d-seg rl-col">' + it.opts.map(function (o, i) { return '<button type="button" data-act="opt" data-v="' + i + '" aria-pressed="false">' + o.t + '</button>'; }).join('') + '</div>';
    }
    h += '</div><div class="rl-actions"><button type="button" class="u3d-btn" data-act="check">Check answer</button><button type="button" class="u3d-btn" data-act="next" hidden>Next task</button></div></div>';
    h += '<div class="u3d-result rl-fb" aria-live="polite"></div>';
    if (it.type === 'locate') h += '<button type="button" class="u3d-chip rl-bonus" data-act="sqrt2">Bonus: where is \u221a2?</button>';
    taskEl.innerHTML = h;
    var inp = taskEl.querySelector('[data-in="val"]');
    if (inp) inp.addEventListener('input', function () { st.ans.val = inp.value; });
    if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') act('check'); });
    readouts();
  }
  function kLabel(a) {
    if (a.k === 0) return 'At 0';
    return Math.abs(a.k) + ' part' + (Math.abs(a.k) > 1 ? 's' : '') + ' ' + (a.k < 0 ? 'left' : 'right') + ' of 0';
  }
  function readouts() {
    var it = st.item, a = st.ans, o = function (n, v) { var e = taskEl.querySelector('[data-out="' + n + '"]'); if (e) e.textContent = v; };
    if (it.type === 'locate') { o('n', a.n); o('k', kLabel(a)); }
    if (it.type === 'pair') { o('x0', fmt(a.xs[0])); o('x1', fmt(a.xs[1])); }
    if (it.type === 'build') {
      o('L', a.li ? M + '\u221e' : fmt(a.L)); o('R', a.ri ? '\u221e' : fmt(a.R)); o('iv', U.ivText(a));
      press('lmode', a.li ? 'i' : (a.lc ? 'c' : 'o')); press('rmode', a.ri ? 'i' : (a.rc ? 'c' : 'o'));
      taskEl.querySelectorAll('[data-act="L-"],[data-act="L+"]').forEach(function (b) { b.disabled = a.li; });
      taskEl.querySelectorAll('[data-act="R-"],[data-act="R+"]').forEach(function (b) { b.disabled = a.ri; });
    }
    if (it.type === 'order') press('choice', a.choice);
    if (it.type === 'read') {
      press('opt', a.choice == null ? null : String(a.choice));
      taskEl.querySelectorAll('[data-act="opt"]').forEach(function (b) { b.disabled = a.removed.indexOf(+b.getAttribute('data-v')) >= 0; });
    }
    taskEl.querySelectorAll('.rl-ctl button, .rl-ctl input').forEach(function (b) { if (st.done) b.disabled = true; });
  }
  function press(actName, v) {
    taskEl.querySelectorAll('[data-act="' + actName + '"]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === v ? 'true' : 'false'); });
  }
  function valText(p, q) {
    var v = p / q, f = U.fracStr(p, q);
    return Number.isInteger(v) ? fmt(v) : f + ' \u2248 ' + fmt(Math.round(v * 1000) / 1000);
  }
  function yours(it, a) {
    switch (it.type) {
      case 'locate': return 'Your marker is at <b>' + valText(a.k, a.n) + '</b>';
      case 'order': return 'You chose <b>' + it.ea + ' ' + (a.choice === '<' ? '&lt;' : '&gt;') + ' ' + it.eb + '</b>';
      case 'pair': return 'Your drones are at <b>' + fmt(a.xs[0]) + '</b> and <b>' + fmt(a.xs[1]) + '</b>, which are ' + fmt(Math.abs(a.xs[0] - it.c)) + ' and ' + fmt(Math.abs(a.xs[1] - it.c)) + ' units from ' + fmt(it.c);
      case 'measure': return 'You entered <b>' + String(a.val).trim().replace('-', M) + '</b>';
      case 'build': return 'Your beam is <b>' + U.ivText(a) + '</b>';
      case 'read': return 'You chose <b>' + it.opts[a.choice].t + '</b>';
    }
    return '';
  }
  function feedback(kind, head, text, mine) {
    var f = taskEl.querySelector('.rl-fb');
    f.innerHTML = '<div class="rl-fbh ' + kind + '">' + head + '</div>' + (mine ? '<p class="rl-yours">' + mine + '.</p>' : '') + '<p>' + text + '</p>';
  }

  taskEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    act(b.getAttribute('data-act'), b.getAttribute('data-v'));
  });

  function clampK(a) { var lim = 6 * a.n; a.k = Math.max(-lim, Math.min(lim, a.k)); }
  function act(name, v) {
    if (!st) return;
    var it = st.item, a = st.ans;
    if (name === 'check') return check();
    if (name === 'next') return nextItem();
    if (name === 'more') return nextItem();
    if (name === 'sqrt2') { if (view) view.playSqrt2(); feedback('hint', 'Bonus: \u221a2', sqrtNote()); showTake(true); return; }
    if (st.done) return;
    if (name === 'n-' || name === 'n+') {
      var old = a.n; a.n = Math.max(1, Math.min(20, a.n + (name === 'n+' ? 1 : -1)));
      a.k = Math.round(a.k / old * a.n); clampK(a);
    }
    if (name === 'k-') { a.k--; clampK(a); }
    if (name === 'k+') { a.k++; clampK(a); }
    if (/^x[01][+-]$/.test(name)) { var i = +name[1]; a.xs[i] = Math.max(-7, Math.min(7, a.xs[i] + (name[2] === '+' ? 0.5 : -0.5))); }
    if (name === 'L-') a.L = Math.max(-7, a.L - 1);
    if (name === 'L+') a.L = Math.min(7, a.L + 1);
    if (name === 'R-') a.R = Math.max(-7, a.R - 1);
    if (name === 'R+') a.R = Math.min(7, a.R + 1);
    if (name === 'lmode') { a.li = v === 'i'; a.lc = v === 'c'; if (a.li) a.lc = false; }
    if (name === 'rmode') { a.ri = v === 'i'; a.rc = v === 'c'; if (a.ri) a.rc = false; }
    if (name === 'choice') a.choice = v;
    if (name === 'opt') a.choice = +v;
    st.flash = null;
    readouts(); sync();
  }
  function sqrtNote() {
    var n = st.item.type === 'locate' ? Math.max(st.ans.n, 1) : 12, k = Math.round(Math.SQRT2 * n);
    var gap = Math.abs(k / n - Math.SQRT2);
    return 'The diagonal of a unit square has length \u221a2 \u2248 1.41421\u2026. Swing it down onto the line and it lands between ticks. With ' + n + ' part' + (n > 1 ? 's' : '') + ' per unit, the closest tick is ' + U.fracStr(k, n) + ', still ' + gap.toFixed(5) + ' away. No number of parts ever closes the gap, because \u221a2 is irrational.';
  }

  var takeEl = root.querySelector('.rl-take');
  function showTake(on) {
    if (PHASE !== 'locate' || !takeEl) return;
    if (on) { takeEl.hidden = false; requestAnimationFrame(function () { takeEl.classList.add('on'); }); }
    else if (!takeEl.hidden) { takeEl.classList.remove('on'); setTimeout(function () { if (!takeEl.classList.contains('on')) takeEl.hidden = true; }, 400); }
  }
  function showDone() {
    var d = $('.rl-done'); d.hidden = false;
    d.querySelector('[data-done="chapter"]').focus({ preventScroll: true });
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-done]'); if (!b) return;
    $('.rl-done').hidden = true; endless = true;
    if (b.getAttribute('data-done') === 'chapter') {
      taskEl.innerHTML = '<div class="u3d-act active rl-fin"><p class="rl-prompt"><b>Phase complete.</b> Close this lab and continue reading the chapter below.</p><button type="button" class="u3d-btn quiet" data-act="more">Practise more</button></div>';
    }
  });
  function check() {
    var it = st.item; if (st.done) return;
    var r = C.evaluate(it, st.ans);
    if (!r.invalid) showTake(false);
    if (r.invalid) { feedback('hint', 'Not yet', r.invalid); return; }
    var sk = store.skills[it.skill], mine = yours(it, st.ans);
    st.checked = JSON.parse(JSON.stringify(st.ans));
    if (r.ok) {
      sk.done++;
      if (st.hint <= 1) { sk.streak++; if (sk.streak >= 3) sk.mastered = true; } else sk.streak = 0;
      st.done = true; st.flash = 'ok';
      if (PHASE === 'challenge') { if (!endless) chDone[it.skill] = true; rightCount = Object.keys(chDone).length; } else rightCount++;
      var goal = rightCount === GOAL && !endless;
      if (goal) { store.phases[PHASE] = { done: true }; }
      save(); renderGauges();
      feedback('ok', 'Correct' + (endless ? '' : ' \u00b7 ' + Math.min(rightCount, GOAL) + ' of ' + GOAL), C.successNote(it), mine);
      finish(false);
      if (it.type === 'order' && view) view.playOrder(it);
      if (goal) setTimeout(showDone, it.type === 'order' ? 2300 : 700);
      return;
    }
    st.hint = it.type === 'order' ? 3 : Math.min(3, st.hint + 1);
    var h = C.hint(it, r.code, st.hint, st.ans);
    st.vis = h.vis || {}; st.flash = 'bad';
    if (st.vis.remove && it.type === 'read') {
      var wrong = it.opts.map(function (o, i) { return i; }).filter(function (i) { return i !== it.ans && i !== st.ans.choice && st.ans.removed.indexOf(i) < 0; });
      if (wrong.length) st.ans.removed.push(wrong[0]);
    }
    if (st.hint === 3) {
      sk.streak = 0; save(); renderGauges();
      reveal(); st.done = true; st.reinforce = true;
      feedback('bad', 'Solution', h.text + ' <span class="rl-sub">Next comes a similar task, so you can show the idea on your own.</span>', mine);
      finish(true);
      if (it.type === 'order' && view) view.playOrder(it);
    } else {
      feedback('hint', 'Hint ' + st.hint + ' of 3', h.text, mine);
      readouts(); sync();
    }
  }
  function reveal() {
    var it = st.item, a = st.ans;
    if (it.type === 'locate') { a.n = it.q; a.k = it.p; }
    if (it.type === 'pair') a.xs = [it.c - it.r, it.c + it.r];
    if (it.type === 'measure') { a.val = fmt(Math.abs(it.a - it.b)); var i = taskEl.querySelector('[data-in="val"]'); if (i) i.value = a.val; }
    if (it.type === 'build') { var t = it.iv; a.L = t.L; a.R = t.R; a.li = t.li; a.ri = t.ri; a.lc = t.lc; a.rc = t.rc; }
    if (it.type === 'read') a.choice = it.ans;
    if (it.type === 'order') a.choice = it.ans;
    st.flash = 'ok'; st.vis = {};
  }
  function finish(practice) {
    taskEl.querySelector('[data-act="check"]').hidden = true;
    var n = taskEl.querySelector('[data-act="next"]'); n.hidden = false; n.textContent = practice ? 'Next: practice task' : 'Next task';
    readouts(); sync();
    n.focus({ preventScroll: true });
  }

  /* ---------- Scene spec ---------- */
  function spec() {
    var it = st.item, a = st.ans, s = { parts: 1, markers: [], pins: [], drones: [], beam: null, ghost: null, hl: null, circle: null, flash: st.flash };
    if (st.vis.highlight) s.hl = st.vis.highlight;
    if (st.vis.circle) s.circle = st.vis.circle;
    if (it.type === 'locate') { s.parts = a.n; s.markers.push({ id: 'k', x: a.k / a.n, drag: true, col: 'stu', label: st.flash ? valText(a.k, a.n) : null }); }
    if (it.type === 'order') {
      s.markers.push({ id: 'a', x: it.a, col: 'a', label: 'a = ' + fmt(it.a) });
      s.markers.push({ id: 'b', x: it.b, col: 'stu', label: 'b = ' + fmt(it.b) });
    }
    if (it.type === 'pair') {
      s.parts = 2; s.pins.push({ x: it.c, label: fmt(it.c) });
      s.drones.push({ id: 'x0', x: a.xs[0], drag: true, side: -0.5, label: st.flash ? 'A = ' + fmt(a.xs[0]) : 'A', from: it.c });
      s.drones.push({ id: 'x1', x: a.xs[1], drag: true, side: 0.5, label: st.flash ? 'B = ' + fmt(a.xs[1]) : 'B', from: it.c });
    }
    if (it.type === 'measure') {
      s.drones.push({ id: 'm0', x: it.a, label: fmt(it.a) });
      s.drones.push({ id: 'm1', x: it.b, label: fmt(it.b), from: it.a });
    }
    if (it.type === 'build') { s.beam = a; if (st.vis.ghost) s.ghost = it.iv; }
    if (it.type === 'read') s.beam = it.iv;
    return s;
  }
  function center(it) {
    if (it.type === 'pair') return it.c;
    if (it.type === 'measure' || it.type === 'order') return (it.a + it.b) / 2;
    return 0.5;
  }
  function sync() { if (view && st) view.set(spec()); }
  function onStep(id, d) {
    if (!st || st.done) return;
    if (id === 'k') act(d > 0 ? 'k+' : 'k-');
    else if (id === 'x0' || id === 'x1') act(id + (d > 0 ? '+' : '-'));
  }
  function onDrag(id, x) {
    if (!st || st.done) return;
    var a = st.ans;
    if (id === 'k') { a.k = Math.round(x * a.n); clampK(a); }
    if (id === 'x0' || id === 'x1') a.xs[+id[1]] = Math.max(-7, Math.min(7, Math.round(x * 2) / 2));
    st.flash = null; readouts(); sync();
  }

  /* ---------- Start ---------- */
  var started = false;
  $('.rl-start').addEventListener('click', start);
  function start() {
    if (started) return; started = true;
    $('.rl-start').disabled = true; $('.rl-start').textContent = 'Loading\u2026';
    nextItem();
    var go = function () {
      $('.u3d').classList.add('rl-app'); window.scrollTo(0, 0); $('.rl-cover').hidden = true; $('.u3d-tools').hidden = false; $('.u3d-legend').hidden = false; $('.rl-nav').hidden = false; $('.rl-walk').hidden = false;
      try { view = createView(); sync(); view.focus(center(st.item)); } catch (e) { console.error(e); fallback(); }
    };
    if (window.THREE) return go();
    var s = document.createElement('script'); s.src = THREE_URL; s.onload = go;
    s.onerror = function () { $('.rl-cover').hidden = true; fallback(); };
    document.head.appendChild(s);
  }
  function fallback() { $('.u3d-fallback').hidden = false; }

  /* ================= 3D view ================= */
  function createView() {
    var T = THREE, S = 0.62;
    var COL = { line: 0xf5dfa6, gold: 0xcfaa65, grid: 0x3f9fd8, purple: 0x8f7ce8, stu: 0xb9adff, a: 0x7fd0ff, ok: 0x3cb98d, zero: 0x7fe3ff, bad: 0xe0625a, fog: 0x123f5c, ground: 0x061b2c };
    var canvas = viewEl.querySelector('canvas'), labelsEl = viewEl.querySelector('.u3d-labels');
    var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new T.Scene();
    scene.fog = new T.Fog(COL.fog, 22, 150);
    var camera = new T.PerspectiveCamera(42, 1, 0.1, 1200);
    var target = new T.Vector3(), yaw = 0.05, focus = 0, home = 0, zoom = 7, ZMIN = 2.4, ZMAX = 22, intro = REDUCED ? 1 : 0, BASE = Math.PI / 2;

    function tex(w, h, draw) { var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); var t = new T.CanvasTexture(c); return t; }
    var glowTex = tex(64, 64, function (g, w, h) { var r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
    var bandTex = tex(8, 64, function (g, w, h) { var r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(0.5, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });

    /* Sky dome: night navy to a horizon glow, all from the house palette */
    var skyTex = tex(4, 512, function (g, w, h) {
      var r = g.createLinearGradient(0, 0, 0, h);
      r.addColorStop(0, '#03111d'); r.addColorStop(0.3, '#061d30'); r.addColorStop(0.44, '#0b3552');
      r.addColorStop(0.49, '#2b4f86'); r.addColorStop(0.5, '#123f5c'); r.addColorStop(1, '#061b2c');
      g.fillStyle = r; g.fillRect(0, 0, w, h);
    });
    var far = new T.Group(); scene.add(far);
    var sky = new T.Mesh(new T.SphereGeometry(600, 32, 16), new T.MeshBasicMaterial({ map: skyTex, side: T.BackSide, fog: false, depthWrite: false }));
    far.add(sky);
    var starG = new T.BufferGeometry(), sp = [];
    for (var i = 0; i < 380; i++) { var th = Math.random() * Math.PI * 2, ph = 0.06 + Math.random() * 1.2; sp.push(500 * Math.cos(ph) * Math.cos(th), 500 * Math.sin(ph), 500 * Math.cos(ph) * Math.sin(th)); }
    starG.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
    far.add(new T.Points(starG, new T.PointsMaterial({ color: 0xcfe6f2, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));

    /* Striped sun: gold to violet, house tones */
    var sunTex = tex(512, 512, function (g, w, h) {
      var r = g.createLinearGradient(0, 0, 0, h);
      r.addColorStop(0, '#f5dfa6'); r.addColorStop(0.5, '#cfaa65'); r.addColorStop(1, '#8f7ce8');
      g.fillStyle = r; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'destination-out';
      for (var k = 0; k < 7; k++) { var y = 300 + k * 30, t = 3 + k * 2.6; g.fillRect(0, y, w, t); }
    });
    var sun = new T.Mesh(new T.PlaneGeometry(84, 84), new T.MeshBasicMaterial({ map: sunTex, transparent: true, fog: false, depthWrite: false }));
    sun.position.set(0, 15, -420); far.add(sun);
    var halo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xcfaa65, transparent: true, opacity: 0.35, fog: false, depthWrite: false, blending: T.AdditiveBlending }));
    halo.scale.set(200, 200, 1); halo.position.set(0, 15, -425); far.add(halo);

    /* Wireframe mountains */
    function mountains(x, w, hgt, seed, side) {
      var g = new T.PlaneGeometry(w, 70, 18, 7); g.rotateX(-Math.PI / 2);
      var p = g.attributes.position;
      for (var j = 0; j < p.count; j++) {
        var px = p.getX(j), pz = p.getZ(j), u = (px / w) + 0.5, back = (35 - pz) / 70;
        var peak = Math.sin(u * Math.PI) * (0.55 + 0.45 * Math.sin(u * 9 + seed)) * Math.min(1, back * 1.6);
        var jitter = (Math.sin(j * 12.9898 + seed) * 43758.5453) % 1;
        p.setY(j, Math.max(0, peak * hgt + jitter * 2.2 * back));
      }
      g.computeVertexNormals();
      var grp = new T.Group();
      grp.add(new T.Mesh(g, new T.MeshBasicMaterial({ color: 0x07203a, fog: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })));
      grp.add(new T.LineSegments(new T.WireframeGeometry(g), new T.LineBasicMaterial({ color: COL.purple, transparent: true, opacity: 0.75, fog: false })));
      if (side) { grp.rotation.y = Math.PI / 2; grp.position.set(-300, 0, -x); } else grp.position.set(x, 0, -330);
      far.add(grp);
    }
    mountains(-120, 190, 52, 1.3); mountains(110, 170, 44, 4.1); mountains(10, 110, 26, 7.7);

    /* Ground and grid. Everything here follows the camera, so the line can be walked
       as far as you like while the scene stays the same small size. */
    var ground = new T.Mesh(new T.PlaneGeometry(1400, 1400), new T.MeshBasicMaterial({ color: COL.ground }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; scene.add(ground);
    var gp = [], gx = 140;
    for (var c = -gx; c <= gx; c++) gp.push(c * S, 0, 0, c * S, 0, -1);
    var gridZ = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(gp, 3)), new T.LineBasicMaterial({ color: COL.grid, transparent: true, opacity: 0.5 }));
    gridZ.frustumCulled = false; scene.add(gridZ);
    var cp = []; for (var z = 0; z < 700; z++) cp.push(0, 0, -z * S, 1, 0, -z * S);
    var gridX = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(cp, 3)), new T.LineBasicMaterial({ color: COL.grid, transparent: true, opacity: 0.5 }));
    gridX.frustumCulled = false; scene.add(gridX);

    /* Number line rig (rotates for the order mirror). The visible stretch of line,
       ticks and labels is a small pool that is recentred on the camera as you walk. */
    var rig = new T.Group(); rig.rotation.y = BASE; scene.add(rig);
    var near = new T.Group(); rig.add(near);
    var lineMesh = new T.Mesh(new T.BoxGeometry(400, 0.035, 0.05), new T.MeshBasicMaterial({ color: COL.line }));
    lineMesh.position.y = 0.04; near.add(lineMesh);
    var lineGlow = new T.Mesh(new T.PlaneGeometry(400, 0.5), new T.MeshBasicMaterial({ map: bandTex, color: COL.gold, transparent: true, opacity: 0.6, blending: T.AdditiveBlending, depthWrite: false }));
    lineGlow.position.set(0, 0.04, -0.03); near.add(lineGlow);
    var tickG = new T.BoxGeometry(0.022, 0.24, 0.022), tickM = new T.MeshBasicMaterial({ color: COL.line });
    var POOL = 40;
    for (var n = -POOL; n <= POOL; n++) { var tk = new T.Mesh(tickG, tickM); tk.position.set(n * S, 0.1, 0); near.add(tk); }
    var minor = null, minorParts = 0;
    function setParts(p) {
      if (p === minorParts) return; minorParts = p;
      if (minor) { near.remove(minor); minor.geometry.dispose(); minor = null; }
      if (p <= 1) return;
      var arr = [];
      for (var q = -POOL * p; q <= POOL * p; q++) { if (q % p === 0) continue; var x = q / p * S; arr.push(x, 0.02, 0, x, 0.15, 0); }
      minor = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(arr, 3)), new T.LineBasicMaterial({ color: 0xd8ecf5, transparent: true, opacity: 0.85 }));
      near.add(minor);
    }
    var zeroGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: COL.zero, transparent: true, opacity: 0.5, blending: T.AdditiveBlending, depthWrite: false }));
    zeroGlow.scale.set(0.5, 0.5, 1); zeroGlow.position.y = 0.06; rig.add(zeroGlow);
    var zeroTick = new T.Mesh(new T.BoxGeometry(0.05, 0.42, 0.05), new T.MeshBasicMaterial({ color: COL.zero })); zeroTick.position.y = 0.2; rig.add(zeroTick);

    /* Integer labels */
    var labels = [];
    function addLabel(text, cls, obj, offset) {
      var el = document.createElement('div'); el.className = cls; el.innerHTML = text; labelsEl.appendChild(el);
      var L = { el: el, obj: obj, off: offset || new T.Vector3() }; labels.push(L); return L;
    }
    var numAnchors = [], nearC = null;
    for (var m = -POOL; m <= POOL; m++) { var o = new T.Object3D(); o.position.set(m * S, 0.02, 0.42); near.add(o); var NL = addLabel('', 'rl-num', o); NL.rel = m; numAnchors.push(NL); }
    function big(v) { return (v < 0 ? M : '') + Math.abs(v).toLocaleString('en-US'); }
    function recentre(c) {
      if (c === nearC) return; nearC = c; near.position.x = c * S;
      numAnchors.forEach(function (L) { L.val = c + L.rel; L.el.textContent = big(L.val); L.el.classList.toggle('zero', L.val === 0); });
    }
    recentre(0);

    /* Dynamic objects */
    var dyn = new T.Group(); rig.add(dyn);
    var dynLabels = [], hit = [], movers = {};
    var sphG = new T.SphereGeometry(0.1, 20, 14), stemG = new T.BoxGeometry(0.018, 0.32, 0.018), hitG = new T.SphereGeometry(0.34, 8, 6);
    var torG = new T.TorusGeometry(0.1, 0.028, 10, 28), boxG = new T.BoxGeometry(1, 1, 1);
    var hitM = new T.MeshBasicMaterial({ visible: false });
    var colOf = function (k) { return k === 'a' ? COL.a : k === 'gold' ? COL.gold : COL.stu; };
    function glowSprite(color, s, op) { var g = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: color, transparent: true, opacity: op || 0.8, blending: T.AdditiveBlending, depthWrite: false })); g.scale.set(s, s, 1); return g; }
    function clearDyn() {
      for (var i = dyn.children.length - 1; i >= 0; i--) {
        var ch = dyn.children[i]; dyn.remove(ch);
        ch.traverse(function (o) { if (o.userData.own) { o.geometry.dispose(); } });
      }
      dynLabels.forEach(function (L) { L.el.remove(); labels.splice(labels.indexOf(L), 1); });
      dynLabels = []; hit = []; movers = {};
    }
    function dLabel(text, cls, obj, off) { var L = addLabel(text, cls, obj, off); dynLabels.push(L); return L; }
    function marker(m, flash) {
      var g = new T.Group(), color = flash === 'ok' ? COL.ok : flash === 'bad' ? COL.bad : colOf(m.col);
      var stem = new T.Mesh(stemG, new T.MeshBasicMaterial({ color: color })); stem.position.y = 0.2; g.add(stem);
      var ball = new T.Mesh(sphG, new T.MeshBasicMaterial({ color: color })); ball.position.y = 0.42; g.add(ball);
      var gl = glowSprite(color, 0.75); gl.position.y = 0.42; g.add(gl);
      g.position.x = m.x * S; dyn.add(g);
      if (m.drag && m.id === sel && multiSel) selRing(g, 0.42, 0);
      if (m.drag) { var h = new T.Mesh(hitG, hitM); h.position.y = 0.4; h.userData.id = m.id; g.add(h); hit.push(h); }
      if (m.label) dLabel(m.label, 'u3d-mlabel', g, new T.Vector3(0, 0.75, 0));
      movers[m.id] = g; return g;
    }
    /* Drone model (GLB), loaded only in phases that actually show drones */
    var LOADER_URL = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
    var DRONE_URL = '../shared/models/drone.glb';
    var droneTpl = null, droneClip = null, droneState = 0, droneCache = {};
    function loadDrone() {
      if (droneState) return; droneState = 1;
      var go = function () {
        new T.GLTFLoader().load(DRONE_URL, function (gltf) {
          var src = gltf.scene;
          src.traverse(function (o) {
            if (o.isMesh) {
              var ms = Array.isArray(o.material) ? o.material : [o.material];
              ms.forEach(function (m) {
                m.transparent = false; m.alphaTest = 0.4; m.depthWrite = true;
                ['map', 'emissiveMap'].forEach(function (k) { if (m[k]) { m[k].encoding = T.LinearEncoding; m[k].needsUpdate = true; } });
                m.needsUpdate = true;
              });
            }
          });
          var box = new T.Box3().setFromObject(src), size = new T.Vector3(), mid = new T.Vector3();
          box.getSize(size); box.getCenter(mid);
          var span = Math.max(size.x, size.z) || 1;
          var pivot = new T.Group(); src.position.sub(mid); pivot.add(src);
          pivot.scale.setScalar(0.62 / span);
          /* The source clip flies the drone around the sky; keep only the parts that stay put (the propellers spinning) */
          var clip = gltf.animations && gltf.animations[0], moving = {};
          if (clip) {
            clip.tracks.forEach(function (tr) {
              if (/\.position$/.test(tr.name)) {
                var v = tr.values, mn = Infinity, mx = -Infinity; for (var i = 0; i < v.length; i++) { if (v[i] < mn) mn = v[i]; if (v[i] > mx) mx = v[i]; }
                var first = [v[0], v[1], v[2]], spread = 0;
                for (var q = 0; q < v.length; q += 3) spread = Math.max(spread, Math.abs(v[q] - first[0]), Math.abs(v[q + 1] - first[1]), Math.abs(v[q + 2] - first[2]));
                if (spread > 0.01) moving[tr.name.replace(/\.position$/, '')] = 1;
              }
            });
            clip.tracks = clip.tracks.filter(function (tr) {
              var node = tr.name.slice(0, tr.name.lastIndexOf('.'));
              return !moving[node] && !/\.position$/.test(tr.name) && !/\.scale$/.test(tr.name);
            });
            clip.resetDuration();
          }
          droneTpl = pivot; droneClip = clip && clip.tracks.length ? clip : null; droneState = 2; viewEl.setAttribute('data-drone', 'model');
          if (lastSpec) set(lastSpec);
        }, undefined, function () { droneState = 3; });
      };
      if (T.GLTFLoader) return go();
      var sc = document.createElement('script'); sc.src = LOADER_URL; sc.onload = go; sc.onerror = function () { droneState = 3; };
      document.head.appendChild(sc);
    }
    var hemi = new T.HemisphereLight(0xdcecff, 0x0b2a44, 1.4); scene.add(hemi);
    var key = new T.DirectionalLight(0xf5dfa6, 1.3); key.position.set(3, 6, 4); scene.add(key);
    function drone(d, flash) {
      var g = new T.Group(), color = flash === 'ok' ? COL.ok : flash === 'bad' ? COL.bad : COL.stu;
      loadDrone();
      if (droneTpl) {
        var c = droneCache[d.id];
        if (!c) {
          var o = droneTpl.clone(true), mx = null;
          if (droneClip) { mx = new T.AnimationMixer(o); mx.clipAction(droneClip).play(); }
          c = droneCache[d.id] = { o: o, mx: mx };
        }
        g.add(c.o);
        var halo = glowSprite(color, 0.9, 0.55); halo.position.y = -0.04; g.add(halo);
      } else {
        var body = new T.Mesh(boxG, new T.MeshBasicMaterial({ color: 0x0b2a44 })); body.scale.set(0.34, 0.08, 0.34); g.add(body);
        var edges = new T.LineSegments(new T.EdgesGeometry(boxG), new T.LineBasicMaterial({ color: color })); edges.scale.copy(body.scale); g.add(edges);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (cc) {
          var r = new T.Mesh(torG, new T.MeshBasicMaterial({ color: color })); r.rotation.x = Math.PI / 2; r.scale.set(0.9, 0.9, 0.9);
          r.position.set(cc[0] * 0.22, 0.05, cc[1] * 0.22); r.userData.spin = 1; g.add(r);
        });
        var eye = glowSprite(color, 0.55); eye.position.y = -0.05; g.add(eye);
      }
      var tether = new T.Mesh(boxG, new T.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.6 })); tether.scale.set(0.012, 0.75, 0.012); tether.position.y = -0.42; g.add(tether);
      g.scale.set(1.05, 1.05, 1.05); g.position.set(d.x * S, 0.85, 0); g.userData.bob = Math.random() * 6; dyn.add(g);
      if (d.drag && d.id === sel && multiSel) selRing(g, -0.02, 1);
      if (d.drag) { var h = new T.Mesh(hitG, hitM); h.scale.set(1.3, 1.3, 1.3); h.userData.id = d.id; g.add(h); hit.push(h); }
      if (d.label) dLabel(d.label, 'u3d-mlabel', g, new T.Vector3(0, 0.38, d.side || 0));
      movers[d.id] = g;
    }
    function segment(a, b, color, y, thick, op) {
      var m = new T.Mesh(boxG, new T.MeshBasicMaterial({ color: color, transparent: true, opacity: op || 0.9, blending: T.AdditiveBlending, depthWrite: false }));
      var l = Math.abs(b - a) * S; m.scale.set(Math.max(l, 0.001), thick, thick); m.position.set((a + b) / 2 * S, y, 0.02); dyn.add(m); return m;
    }
    function endCap(x, closed, color) {
      var g = new T.Group(); g.position.set(x * S, 0.07, 0.04);
      var mm = closed ? new T.Mesh(sphG, new T.MeshBasicMaterial({ color: color })) : new T.Mesh(torG, new T.MeshBasicMaterial({ color: color }));
      if (closed) mm.scale.set(1.25, 1.25, 1.25); else mm.scale.set(1.2, 1.2, 1.2);
      g.add(mm); var gl = glowSprite(color, closed ? 0.7 : 0.5, closed ? 0.8 : 0.45); g.add(gl); dyn.add(g);
    }
    var multiSel = false;
    var ringG = new T.RingGeometry(0.86, 1, 48); ringG.rotateX(-Math.PI / 2);
    function selRing(g, y, isDrone) {
      var r = new T.Mesh(ringG, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, side: T.DoubleSide, depthWrite: false }));
      r.scale.setScalar(isDrone ? 0.4 : 0.22); r.position.y = isDrone ? -0.8 : -0.38 + y; g.add(r);
    }
    var pulses = [];
    var sel = null, lastSpec = null;
    function set(s) {
      lastSpec = s;
      var drags = s.markers.concat(s.drones).filter(function (o) { return o.drag; }).map(function (o) { return o.id; });
      if (drags.indexOf(sel) < 0) sel = drags[0] || null;
      multiSel = drags.length > 1;
      clearDyn(); pulses = [];
      if (sq) { rig.remove(sq); sq = null; }
      setParts(s.parts || 1);
      if (s.hl) { var hlm = segment(s.hl[0], s.hl[1], COL.line, 0.05, 0.16, 0.5); hlm.userData.pulse = 1; pulses.push(hlm); }
      if (s.circle) {
        var pts = [], c = s.circle[0] * S, r = s.circle[1] * S;
        for (var i = 0; i <= 96; i++) { var t = i / 96 * Math.PI * 2; pts.push(c + Math.cos(t) * r, 0.03, Math.sin(t) * r); }
        var ring = new T.Line(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(pts, 3)), new T.LineBasicMaterial({ color: COL.gold }));
        ring.userData.own = 1; dyn.add(ring);
      }
      s.pins.forEach(function (p) {
        var g = new T.Group(); g.position.x = p.x * S;
        var col = new T.Mesh(boxG, new T.MeshBasicMaterial({ color: COL.gold })); col.scale.set(0.05, 0.6, 0.05); col.position.y = 0.3; g.add(col);
        var gl = glowSprite(COL.gold, 0.9); gl.position.y = 0.6; g.add(gl); dyn.add(g);
        dLabel('c = ' + p.label, 'u3d-mlabel gold', g, new T.Vector3(0, 0.9, 0));
      });
      s.markers.forEach(function (m) { marker(m, s.flash); });
      s.drones.forEach(function (d) {
        drone(d, s.flash);
        if (d.from != null && d.from !== d.x) segment(d.from, d.x, s.flash === 'ok' ? COL.ok : COL.stu, 0.06, 0.05, 0.85);
      });
      if (s.beam) {
        var b = s.beam, L = b.li ? -2e6 : b.L, R = b.ri ? 2e6 : b.R, colr = s.flash === 'ok' ? COL.ok : s.flash === 'bad' ? COL.bad : COL.stu;
        if (R >= L) {
          segment(L, R, colr, 0.07, 0.07, 0.95); segment(L, R, colr, 0.07, 0.2, 0.25);
          if (!b.li) endCap(b.L, b.lc, colr);
          if (!b.ri) endCap(b.R, b.rc, colr);
          if (b.li && b.lc) endCap(-6.6, true, COL.bad);
          if (b.ri && b.rc) endCap(6.6, true, COL.bad);
        }
      }
      if (s.ghost) {
        var gL = s.ghost.li ? -2e6 : s.ghost.L, gR = s.ghost.ri ? 2e6 : s.ghost.R;
        var gm = new T.Mesh(boxG, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, depthWrite: false }));
        gm.scale.set((gR - gL) * S, 0.5, 0.36); gm.position.set((gL + gR) / 2 * S, 0.25, 0); dyn.add(gm);
        var ge = new T.LineSegments(new T.EdgesGeometry(boxG), new T.LineBasicMaterial({ color: 0xffffff })); ge.scale.copy(gm.scale); ge.position.copy(gm.position); dyn.add(ge);
      }
    }

    /* Tweens */
    var tweens = [];
    function tween(ms, fn, done) { tweens.push({ t0: performance.now(), ms: REDUCED ? 1 : ms, fn: fn, done: done }); }
    var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
    function playOrder(it) {
      var f = function (v) { return it.op === 'add' ? v + it.k : v * it.k; };
      var A = movers.a, B = movers.b; if (!A || !B) return;
      var la = dynLabels[0], lb = dynLabels[1];
      var stage2 = function () {
        var a0 = it.op === 'mul' && it.k < 0 ? -it.a : it.a, b0 = it.op === 'mul' && it.k < 0 ? -it.b : it.b;
        A.position.x = a0 * S; B.position.x = b0 * S;
        tween(900, function (t) { var e = ease(t); A.position.x = (a0 + (f(it.a) - a0) * e) * S; B.position.x = (b0 + (f(it.b) - b0) * e) * S; }, function () {
          if (la) la.el.innerHTML = it.ea + ' = ' + fmt(f(it.a));
          if (lb) lb.el.innerHTML = it.eb + ' = ' + fmt(f(it.b));
        });
      };
      if (it.op === 'mul' && it.k < 0) {
        tween(1100, function (t) { rig.rotation.y = BASE + Math.PI * ease(t); }, function () { rig.rotation.y = BASE; stage2(); });
      } else stage2();
    }
    var sq = null;
    function playSqrt2() {
      if (sq) { rig.remove(sq); sq = null; }
      sq = new T.Group(); rig.add(sq);
      var lm = new T.LineBasicMaterial({ color: COL.gold });
      var pg = new T.PlaneGeometry(S, S); pg.rotateX(-Math.PI / 2); var box = new T.LineSegments(new T.EdgesGeometry(pg), lm); box.position.set(S / 2, 0.04, S / 2); sq.add(box);
      var piv = new T.Group(); piv.position.y = 0.04; sq.add(piv);
      var diag = new T.Mesh(boxG, new T.MeshBasicMaterial({ color: COL.stu })); diag.scale.set(Math.SQRT2 * S, 0.03, 0.03); diag.position.x = Math.SQRT2 * S / 2; piv.add(diag);
      var arc = [], R = Math.SQRT2 * S; for (var i = 0; i <= 40; i++) { var t = Math.PI / 4 * (1 - i / 40); arc.push(Math.cos(t) * R, 0.05, Math.sin(t) * R); }
      var arcL = new T.Line(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(arc, 3)), new T.LineDashedMaterial({ color: COL.stu, dashSize: 0.06, gapSize: 0.05 }));
      arcL.computeLineDistances(); sq.add(arcL);
      piv.rotation.y = -Math.PI / 4;
      var mine = sq;
      tween(1600, function (t) { piv.rotation.y = -Math.PI / 4 * (1 - ease(t)); }, function () {
        if (sq !== mine) return;
        var g = new T.Group(); g.position.x = Math.SQRT2 * S; sq.add(g);
        var ball = new T.Mesh(sphG, new T.MeshBasicMaterial({ color: COL.stu })); ball.position.y = 0.06; g.add(ball);
        g.add(glowSprite(COL.stu, 0.7));
        var L = addLabel('\u221a2 \u2248 1.41421\u2026', 'u3d-mlabel', g, new T.Vector3(0, 0.5, 0)); dynLabels.push(L);
      });
    }

    /* Camera. Road view rides behind the line toward the sun (+infinity);
       side view looks at the line from the side, positive to the right.
       focus = value at the centre of the view, zoom = camera distance. */
    var ray = new T.Raycaster(), ndc = new T.Vector2(), groundPl = new T.Plane(new T.Vector3(0, 1, 0), -0.05), tmp = new T.Vector3();
    var dragId = null, orbit = null, pts = {}, pinch = null, mode = 'road', LIM = 1e6;
    var clampF = function (v) { return Math.max(-LIM, Math.min(LIM, v)); };
    function toNdc(x, y) { var r = canvas.getBoundingClientRect(); ndc.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera); }
    function valueAt(x, y) { toNdc(x, y); if (!ray.ray.intersectPlane(groundPl, tmp)) return null; return rig.worldToLocal(tmp.clone()).x / S; }
    function setZoom(z, anchor) {
      z = Math.max(ZMIN, Math.min(ZMAX, z));
      if (anchor != null) focus = clampF(focus + (anchor - focus) * (1 - z / zoom));
      zoom = z;
    }
    var tip = viewEl.querySelector('.rl-tip'), tipT = 0;
    function say(msg, ms) { tip.textContent = msg; tip.hidden = false; clearTimeout(tipT); tipT = setTimeout(function () { tip.hidden = true; }, ms || 1800); }
    canvas.addEventListener('pointerdown', function (e) {
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 2) { var a = pts[ids[0]], b = pts[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: zoom }; dragId = null; orbit = null; return; }
      canvas.focus({ preventScroll: true });
      toNdc(e.clientX, e.clientY); var h = ray.intersectObjects(hit, false);
      if (h.length && !st.done) { dragId = h[0].object.userData.id; if (sel !== dragId) { sel = dragId; if (lastSpec) set(lastSpec); } viewEl.classList.add('dragging'); }
      else orbit = { x: e.clientX, y: e.clientY, yaw: yaw, focus: focus };
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (pts[e.pointerId]) pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (pinch) { var ids = Object.keys(pts); if (ids.length === 2) { var a = pts[ids[0]], b = pts[ids[1]]; setZoom(pinch.z * pinch.d / Math.max(20, Math.hypot(a.x - b.x, a.y - b.y))); } return; }
      if (dragId) { var v = valueAt(e.clientX, e.clientY); if (v != null) onDrag(dragId, v); return; }
      if (!orbit) return;
      var dx = e.clientX - orbit.x, dy = e.clientY - orbit.y, k = zoom * 0.0035;
      if (mode === 'side') {
        focus = clampF(orbit.focus - dx * k);
        if (e.pointerType === 'mouse') yaw = Math.max(-0.02, Math.min(0.6, orbit.yaw - dy * 0.004));
      } else {
        yaw = Math.max(-0.9, Math.min(0.9, orbit.yaw - dx * 0.005));
        if (e.pointerType === 'mouse') focus = clampF(orbit.focus + dy * k);
      }
    });
    var end = function (e) { delete pts[e.pointerId]; if (Object.keys(pts).length < 2) pinch = null; dragId = null; orbit = null; viewEl.classList.remove('dragging'); };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('wheel', function (e) {
      if (!(e.ctrlKey || e.metaKey || document.fullscreenElement)) { say('Use Ctrl + scroll (\u2318 + scroll on Mac) or the + and \u2212 buttons to zoom'); return; }
      e.preventDefault(); tip.hidden = true;
      setZoom(zoom * Math.exp(e.deltaY * 0.0022), valueAt(e.clientX, e.clientY));
    }, { passive: false });
    viewEl.querySelector('[data-zoom="in"]').addEventListener('click', function () { setZoom(zoom / 1.35); });
    viewEl.querySelector('[data-zoom="out"]').addEventListener('click', function () { setZoom(zoom * 1.35); });
    function resetView() { yaw = mode === 'side' ? 0 : 0.05; focus = home; zoom = 7; }
    viewEl.querySelector('.u3d-reset').addEventListener('click', resetView);
    function focusOn(v) { home = clampF(v); resetView(); }
    viewEl.querySelector('[data-nav="zero"]').addEventListener('click', function () { focus = 0; });
    var sideBtn = viewEl.querySelector('[data-nav="side"]');
    sideBtn.addEventListener('click', function () {
      mode = mode === 'side' ? 'road' : 'side'; yaw = mode === 'side' ? 0 : 0.05;
      sideBtn.textContent = mode === 'side' ? 'Road view' : 'Side view';
      sideBtn.setAttribute('aria-pressed', mode === 'side' ? 'true' : 'false');
    });
    /* Walking: hold a button (or an arrow key); the pace grows the longer you hold */
    var walkDir = 0, walkT0 = 0;
    function walk(d) { if (d && d !== walkDir) walkT0 = performance.now(); walkDir = d; }
    viewEl.querySelectorAll('[data-walk]').forEach(function (b) {
      var d = +b.getAttribute('data-walk');
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); b.setPointerCapture(e.pointerId); walk(d); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { b.addEventListener(ev, function () { if (walkDir === d) walk(0); }); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!e.repeat) walk(d); } });
      b.addEventListener('keyup', function () { walk(0); });
    });
    canvas.tabIndex = 0;
    canvas.addEventListener('keydown', function (e) {
      var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      var d = { ArrowUp: 1, w: 1, ArrowDown: -1, s: -1 }[key];
      if (d) { e.preventDefault(); if (!e.repeat) walk(d); }
      var m = { ArrowRight: 1, d: 1, ArrowLeft: -1, a: -1 }[key];
      if (m && sel) { e.preventDefault(); onStep(sel, m); }
      if (e.key === '0') focus = 0;
      if (e.key === '+' || e.key === '=') setZoom(zoom / 1.35);
      if (e.key === '-') setZoom(zoom * 1.35);
    });
    canvas.addEventListener('keyup', function (e) { var key = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (['w', 's', 'ArrowUp', 'ArrowDown'].indexOf(key) >= 0) walk(0); });
    canvas.addEventListener('blur', function () { walk(0); });
    var posEl = viewEl.querySelector('.rl-pos');

    var fsBtn = viewEl.querySelector('.u3d-fs-btn');
    fsBtn.addEventListener('click', function () {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      var req = stageEl.requestFullscreen || stageEl.webkitRequestFullscreen;
      var p = null; try { p = req && req.call(stageEl); } catch (e) { p = null; }
      if (!req) window.open(location.href, '_blank');
      else if (p && p.catch) p.catch(function () { window.open(location.href, '_blank'); });
    });
    document.addEventListener('fullscreenchange', function () {
      var on = document.fullscreenElement === stageEl; stageEl.classList.toggle('u3d-fs-on', on); fsBtn.textContent = on ? 'Exit full screen' : 'Full screen';
    });

    function resize() {
      var w = viewEl.clientWidth, h = viewEl.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(viewEl); resize();

    /* Run only while visible */
    var onScreen = true, running = false;
    new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; kick(); }, { threshold: 0.01 }).observe(viewEl);
    document.addEventListener('visibilitychange', kick);
    function kick() { var should = onScreen && !document.hidden; if (should && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); } else if (!should) { running = false; walk(0); } }

    var gScroll = 0, proj = new T.Vector3(), t0 = performance.now(), last = t0, camF = focus, camZ = zoom, camYaw = yaw, camAz = 0, lastX = 0, lastY = 0, shownPos = null, edgeSaid = false;
    function frame(now) {
      if (!running) return;
      var t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (walkDir) {
        var held = (now - walkT0) / 1000, speed = 2.2 * (zoom / 7) * Math.pow(2, held * 0.95);
        focus = clampF(focus + walkDir * speed * dt); camF = focus;
        if (Math.abs(focus) >= LIM && !edgeSaid) { edgeSaid = true; say('The line never ends, but the lab stops at one million. Use Go back to 0 to return.', 3200); }
      }
      if (intro < 1) { intro = Math.min(1, intro + 1 / 100); gScroll = intro >= 1 ? 0 : (gScroll + (1 - intro) * 0.25) % S; }
      var jump = Math.abs(focus - camF) > 60;
      camF = jump ? camF + (focus - camF) * 0.12 : camF + (focus - camF) * 0.18;
      camZ += (zoom - camZ) * 0.18; camYaw += (yaw - camYaw) * 0.25;
      var side = mode === 'side';
      camAz += ((side ? Math.PI / 2 : 0) - camAz) * 0.12;
      var d = camZ * (1 + 1.4 * Math.pow(1 - intro, 3));
      var k = Math.max(0, Math.min(1, (d - ZMIN) / (12 - ZMIN)));
      var wSide = camAz / (Math.PI / 2);
      var pitch = (1 - wSide) * (0.08 + 0.4 * (1 - k) * (1 - k)) + wSide * (0.035 + 0.06 * (1 - k)) + (side ? camYaw : 0);
      pitch = Math.max(0.03, Math.min(1.2, pitch)); /* never tilt below the floor */
      var az = camAz + (side ? 0 : camYaw);
      target.set(0, 0.35, -camF * S - 1.2 * (1 - wSide));
      camera.position.set(target.x + Math.sin(az) * Math.cos(pitch) * d, Math.sin(pitch) * d + 0.35, target.z + Math.cos(az) * Math.cos(pitch) * d);
      if (camera.position.y < 0.3) camera.position.y = 0.3; /* the camera stays above the grid */
      camera.lookAt(target);
      recentre(Math.round(camF));
      lineMesh.position.x = 0; lineGlow.position.x = 0;
      /* far scenery, ground and grid travel with the camera (whole units, so rows stay on the integers) */
      var cx = camera.position.x, cz = camera.position.z;
      far.position.set(cx, 0, cz); far.rotation.y = camAz; ground.position.set(cx, -0.02, cz);
      var gz = Math.floor((cz - 0.2) / S) * S, gxs = Math.round(cx / S) * S;
      if (wSide < 0.5) {
        gridZ.position.set(gxs, 0, gz); gridZ.scale.set(1, 1, 430);
        gridX.position.set(cx - 86, 0, gz + gScroll); gridX.scale.set(172, 1, 1);
      } else {
        gridZ.position.set(gxs, 0, gz + 250); gridZ.scale.set(1, 1, 680);
        gridX.position.set(cx - 0.4 - 170, 0, gz + 216 * S); gridX.scale.set(170, 1, 1);
      }
      if (posEl) { var pv = Math.round(camF); if (pv !== shownPos) { shownPos = pv; posEl.textContent = 'Centre of view: ' + big(pv); } }
      for (var i = tweens.length - 1; i >= 0; i--) { var tw = tweens[i], p = Math.min(1, (now - tw.t0) / tw.ms); tw.fn(p); if (p >= 1) { tweens.splice(i, 1); if (tw.done) tw.done(); } }
      dyn.traverse(function (o) {
        if (o.userData.spin) o.rotation.z += 0.4;
        if (o.userData.bob != null && !REDUCED) o.position.y = 0.85 + Math.sin(t * 2 + o.userData.bob) * 0.04;
      });
      for (var dk in droneCache) if (droneCache[dk].mx) droneCache[dk].mx.update(dt);
      pulses.forEach(function (m) { m.material.opacity = 0.3 + 0.25 * (1 + Math.sin(t * 4)) / 2; });
      renderer.render(scene, camera);
      var w = viewEl.clientWidth, h = viewEl.clientHeight;
      lastX = -1e9; lastY = -1e9;
      for (var j = 0; j < labels.length; j++) {
        var L = labels[j]; L.obj.updateWorldMatrix(true, false);
        proj.copy(L.off).applyMatrix4(L.obj.matrixWorld).project(camera);
        var vis = proj.z < 1 && proj.x > -1.05 && proj.x < 1.05 && proj.y > -1.05 && proj.y < 1.05;
        var sx = (proj.x + 1) / 2 * w, sy = (1 - proj.y) / 2 * h;
        if (vis && j < numAnchors.length) {
          /* number labels thin out where the line recedes and integers crowd together */
          var gap = 18 + 7 * String(L.val).length;
          if (L.val !== 0 && Math.hypot(sx - lastX, sy - lastY) < gap) vis = false; else { lastX = sx; lastY = sy; }
        }
        L.el.style.visibility = vis ? 'visible' : 'hidden';
        if (vis) L.el.style.transform = 'translate(' + sx + 'px,' + sy + 'px) translate(-50%,-50%)';
      }
      requestAnimationFrame(frame);
    }
    kick();
    return { set: set, playOrder: playOrder, playSqrt2: playSqrt2, focus: focusOn };
  }
})();
