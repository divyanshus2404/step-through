/* Step Through app: routing, progress, syllabus and topic pages */
(function () {
  'use strict';
  const STAGES = window.STAGES, TOPICS = window.TOPICS;
  const app = document.getElementById('app');
  const KEY = 'stepthrough.progress.v1', DRAFT = 'stepthrough.drafts.v1', THEME = 'stepthrough.theme';
  const byId = Object.fromEntries(TOPICS.map((t, i) => { t.n = i; return [t.id, t]; }));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- storage ---------- */
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private window */ } };
  let P = read(KEY, { t: {} });
  const rec = (id) => (P.t[id] = P.t[id] || { w: {}, q: null, c: {}, h: {}, l: {} });
  let cloud = null, cloudTimer = 0;
  function save() {
    P.u = Date.now();
    write(KEY, P);
    syncProgress();
    if (cloud) {
      clearTimeout(cloudTimer);
      cloudTimer = setTimeout(() => cloud.set({ u: P.u, json: JSON.stringify(P) }).catch(() => {}), 800);
    }
  }
  /* On the hosted page, progress also lives in the viewer's private store. */
  async function connectCloud() {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return;
    const id = await user.id();
    if (!id) return;
    const ref = db.collection('data/users/' + id).doc('progress');
    const snap = await ref.get();
    if (snap.exists && (snap.data().u || 0) > (P.u || 0)) {
      P = JSON.parse(snap.data().json);
      write(KEY, P);
      route();
    }
    cloud = ref;
  }

  /* A topic has four checkpoints. LeetCode is a bonus on top. */
  const CHECKS = [['w', 'Watch'], ['q', 'Quiz'], ['c', 'Code'], ['h', 'Homework']];
  function status(t) {
    const r = P.t[t.id] || {};
    const w = t.anims.every((a) => r.w && r.w[a]);
    const q = !!(r.q && r.q.passed);
    const c = t.coding.every((x) => r.c && r.c[x.id]);
    const h = t.homework.every((_, i) => r.h && r.h[i]);
    const count = [w, q, c, h].filter(Boolean).length;
    const touched = count > 0 || (r.w && Object.keys(r.w).length) || (r.c && Object.keys(r.c).length) || (r.h && Object.keys(r.h).length) || r.q || (r.l && Object.keys(r.l).length);
    return { w, q, c, h, count, state: count === 4 ? 'done' : touched ? 'doing' : 'todo' };
  }
  const STATE_LABEL = { done: 'Learned', doing: 'In progress', todo: 'Not started' };
  function totals() {
    let done = 0, doing = 0, checks = 0;
    TOPICS.forEach((t) => { const s = status(t); checks += s.count; if (s.state === 'done') done++; else if (s.state === 'doing') doing++; });
    return { done, doing, todo: TOPICS.length - done - doing, checks, all: TOPICS.length * 4, pct: Math.round((checks / (TOPICS.length * 4)) * 100) };
  }
  function nextTopic() {
    if (P.last && byId[P.last] && status(byId[P.last]).state === 'doing') return byId[P.last];
    return TOPICS.find((t) => status(t).state === 'doing') || TOPICS.find((t) => status(t).state === 'todo') || null;
  }

  /* ---------- theme ---------- */
  function setTheme(v) {
    if (v) document.documentElement.setAttribute('data-theme', v); else document.documentElement.removeAttribute('data-theme');
  }
  try { setTheme(localStorage.getItem(THEME)); } catch { /* ignore */ }
  const isDark = () => { const a = document.documentElement.getAttribute('data-theme'); return a ? a === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };

  /* ---------- shell ---------- */
  function header() {
    return `<header class="top"><div class="top-in">
      <a class="brand" href="#" data-go=""><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="20" width="7" height="9" rx="2" class="b1"/><rect x="12.5" y="12" width="7" height="17" rx="2" class="b2"/><rect x="22" y="3" width="7" height="26" rx="2" class="b3"/></svg><span>Step Through</span></a>
      <div class="top-meter" title="All checkpoints across the syllabus"><span class="meter"><i data-bar></i></span><b data-pct></b></div>
      <button type="button" class="theme" id="theme-toggle" aria-label="Switch between light and dark"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 7a5 5 0 0 1 0 10z" class="half"/></svg></button>
    </div></header>`;
  }
  let players = [];
  function clearPlayers() { players.forEach((p) => p.destroy()); players = []; }

  function syncProgress() {
    const t = totals();
    document.querySelectorAll('[data-pct]').forEach((e) => (e.textContent = t.pct + '%'));
    document.querySelectorAll('[data-bar]').forEach((e) => (e.style.width = t.pct + '%'));
    if (current && current.kind === 'home') refreshHome();
    if (current && current.kind === 'topic') refreshTopicStatus(current.topic);
  }

  /* ---------- home ---------- */
  let filter = 'all';
  function pips(s) {
    return `<span class="pips" role="img" aria-label="${s.count} of 4 checkpoints done">${CHECKS.map(([k, l]) => `<i class="${s[k] ? 'on' : ''}" title="${l}"></i>`).join('')}</span>`;
  }
  function stageBoard() {
    return STAGES.map((st) => {
      const list = TOPICS.filter((t) => t.stage === st.id);
      const c = list.reduce((a, t) => a + status(t).count, 0), max = list.length * 4;
      return `<a class="seg" href="#" data-jump="${st.id}" style="flex-grow:${list.length}" title="${esc(st.title)}: ${c} of ${max} checkpoints"><i style="width:${(c / max) * 100}%"></i></a>`;
    }).join('');
  }
  function syllabusHTML() {
    let out = '';
    STAGES.forEach((st, si) => {
      const list = TOPICS.filter((t) => t.stage === st.id);
      const shown = list.filter((t) => filter === 'all' || status(t).state === filter);
      if (!shown.length) return;
      const done = list.filter((t) => status(t).state === 'done').length;
      out += `<section class="stage" id="${st.id}">
        <div class="stage-h">
          <p class="eyebrow"><span class="lvl lvl-${st.level.toLowerCase()}">${st.level}</span></p>
          <h3>${esc(st.title)}</h3>
          <p class="stage-b">${esc(st.blurb)}</p>
          <p class="stage-c"><b>${done}</b> of ${list.length} learned</p>
        </div>
        <ol class="route">${shown.map((t) => {
          const s = status(t);
          return `<li class="stop is-${s.state}"><a href="#${t.id}" data-go="${t.id}">
            <span class="dot" aria-hidden="true"></span>
            <span class="num">[${pad(t.n)}]</span>
            <span class="tt"><b>${esc(t.title)}</b><small>${esc(t.tagline)}</small></span>
            <span class="meta">${pips(s)}<span class="pill p-${s.state}">${STATE_LABEL[s.state]}</span></span>
          </a></li>`;
        }).join('')}</ol>
      </section>`;
    });
    return out || `<p class="empty-state">${filter === 'done' ? 'Nothing is marked as learned yet. Finish all four checkpoints in a topic and it appears here.' : filter === 'doing' ? 'No topics in progress. Open any topic to begin.' : 'Everything is learned. Well done.'}</p>`;
  }
  function renderHome() {
    current = { kind: 'home' };
    document.title = 'Step Through';
    const nx = nextTopic(), started = Object.keys(P.t).length > 0;
    app.innerHTML = header() + `<main class="home">
      <section class="hero wrap">
        <div class="hero-txt">
          <p class="eyebrow">Python · total beginner to advanced</p>
          <h1>Watch every algorithm run, one step at a time.</h1>
          <p class="lede">Data structures and algorithms in plain English. Press play, press step, and change the input to see what the code really does. No experience needed.</p>
          <div class="hero-cta" id="hero-cta"></div>
        </div>
        <div class="hero-demo" id="hero-demo" aria-label="Live example of bubble sort"></div>
      </section>
      <section class="board wrap" aria-label="Your progress">
        <div class="board-top">
          <h2>Your syllabus</h2>
          <div class="counts" id="counts"></div>
        </div>
        <div class="segs" id="segs"></div>
        <div class="filters" role="group" aria-label="Filter topics">${[['all', 'All'], ['todo', 'Left to do'], ['doing', 'In progress'], ['done', 'Learned']].map(([k, l]) => `<button type="button" data-f="${k}" class="${filter === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <p class="legend"><span class="pips"><i class="on"></i><i class="on"></i><i></i><i></i></span> Each topic has four checkpoints: watch the animations, pass the quiz, solve the code, finish the homework.</p>
      </section>
      <div class="syllabus wrap" id="syllabus"></div>
      <footer class="foot wrap">
        <p>Progress saves automatically in this browser.</p>
        <div id="reset-zone"><button type="button" class="link" id="reset">Reset all progress</button></div>
      </footer>
    </main>`;
    const def = Object.assign({}, VIZ['sort-bubble'], { code: null, inputs: [], title: 'Bubble sort, running live', intro: '', build: (_, add) => VIZ['sort-bubble'].build({ arr: [5, 2, 8, 1, 6, 3] }, add) });
    players.push(mountViz(document.getElementById('hero-demo'), def, { autoplay: true, loop: true, pace: 0.62 }));
    refreshHome();
  }
  function refreshHome() {
    const t = totals(), nx = nextTopic();
    const cta = document.getElementById('hero-cta');
    if (cta) {
      const started = TOPICS.some((x) => status(x).state !== 'todo');
      cta.innerHTML = nx ? `<a class="btn" href="#${nx.id}" data-go="${nx.id}">${started ? 'Continue' : 'Start'}: ${esc(nx.title)}</a><span class="sub">${started ? `Topic ${nx.n} of ${TOPICS.length - 1}` : 'Begins with variables. No setup needed.'}</span>` : '<span class="sub">You have learned every topic in the syllabus.</span>';
    }
    const c = document.getElementById('counts');
    if (c) c.innerHTML = `<span><b>${t.done}</b> learned</span><span><b>${t.doing}</b> in progress</span><span><b>${t.todo}</b> left</span><span class="c-pct"><b>${t.pct}%</b> of checkpoints</span>`;
    const sg = document.getElementById('segs');
    if (sg) sg.innerHTML = stageBoard();
    const sy = document.getElementById('syllabus');
    if (sy) sy.innerHTML = syllabusHTML();
  }

  /* ---------- topic page ---------- */
  const NAV = [['s-explain', 'Explain'], ['s-watch', 'Watch'], ['s-python', 'Python'], ['s-quiz', 'Quiz'], ['s-code', 'Practice'], ['s-home', 'Homework'], ['s-real', 'Real life'], ['s-lc', 'LeetCode']];

  function renderTopic(t) {
    current = { kind: 'topic', topic: t };
    document.title = `${t.title} · Step Through`;
    P.last = t.id;
    write(KEY, P);
    const st = STAGES.find((x) => x.id === t.stage), prev = TOPICS[t.n - 1], next = TOPICS[t.n + 1], r = rec(t.id);
    app.innerHTML = header() + `<main class="topic">
      <div class="wrap t-head">
        <a class="back" href="#" data-go="">← Syllabus</a>
        <p class="eyebrow">${esc(st.title)} · <span class="lvl lvl-${st.level.toLowerCase()}">${st.level}</span> · about ${t.mins} min</p>
        <h1><span class="num">[${pad(t.n)}]</span> ${esc(t.title)}</h1>
        <p class="lede">${esc(t.tagline)}</p>
        <div class="checks" id="checks"></div>
      </div>
      <nav class="t-nav" aria-label="Sections"><div class="t-nav-in">${NAV.map(([id, l]) => `<a href="#${t.id}" data-sec="${id}">${l}</a>`).join('')}</div></nav>
      <div class="wrap t-body">
        <section id="s-explain" class="sec">
          <h2>The idea</h2>
          <blockquote class="pic"><span>Picture this</span><p>${fmt(t.analogy)}</p></blockquote>
          <div class="prose">${t.learn.map((p) => `<p>${fmt(p)}</p>`).join('')}</div>
          <div class="keys"><h3>Remember</h3><ul>${t.keys.map((k) => `<li>${fmt(k)}</li>`).join('')}</ul></div>
          ${t.cost ? `<div class="scroll"><table class="cost"><thead><tr><th>Operation</th><th>Cost</th></tr></thead><tbody>${t.cost.map(([a, b]) => `<tr><td>${fmt(a)}</td><td><code>${esc(b)}</code></td></tr>`).join('')}</tbody></table></div>` : ''}
        </section>
        <section id="s-watch" class="sec">
          <h2>Watch it run</h2>
          <p class="sec-note">Press Play, or use the arrows to go one step at a time. Change the input and run it again. Reaching the last step counts as watched.</p>
          <div id="players" class="players"></div>
        </section>
        <section id="s-python" class="sec">
          <h2>In Python</h2>
          <div id="snips"></div>
        </section>
        <section id="s-quiz" class="sec"><h2>Quick quiz</h2><p class="sec-note">Answer all ${t.quiz.length}. You pass with at least ${passMark(t)} right, and you can retake it.</p><div id="quiz"></div></section>
        <section id="s-code" class="sec"><h2>Coding practice</h2><p class="sec-note">Write Python here and run it in your browser. Tests check your answer right away.</p><div id="coding"></div></section>
        <section id="s-home" class="sec"><h2>Homework</h2><p class="sec-note">Do these away from the screen where you can. Tick each one when finished.</p><ul class="hw" id="hw"></ul></section>
        <section id="s-real" class="sec"><h2>Real-life questions</h2><p class="sec-note">Think about your answer first, then open it.</p><div class="reals">${t.reallife.map((q) => `<details class="real"><summary>${fmt(q.q)}</summary><p>${fmt(q.a)}</p></details>`).join('')}</div></section>
        <section id="s-lc" class="sec"><h2>On LeetCode</h2><p class="sec-note">Real problems to try next, easiest first. These open on leetcode.com. Ticks are a bonus and don't affect your checkpoints.</p><ul class="lc-list" id="lc"></ul></section>
        <nav class="pn" aria-label="Other topics">
          ${prev ? `<a href="#${prev.id}" data-go="${prev.id}"><small>Previous</small><b>${esc(prev.title)}</b></a>` : '<span></span>'}
          ${next ? `<a class="nx" href="#${next.id}" data-go="${next.id}"><small>Next</small><b>${esc(next.title)}</b></a>` : '<a class="nx" href="#" data-go=""><small>All done</small><b>Back to the syllabus</b></a>'}
        </nav>
      </div>
    </main>`;
    refreshTopicStatus(t);
    mountPlayers(t);
    mountSnips(t);
    mountQuiz(t);
    mountCoding(t);
    mountHomework(t);
    mountLeetcode(t);
  }

  const passMark = (t) => Math.ceil(t.quiz.length * 0.75);

  function refreshTopicStatus(t) {
    const el = document.getElementById('checks');
    if (!el) return;
    const s = status(t), r = rec(t.id);
    const sub = {
      w: `${t.anims.filter((a) => r.w[a]).length} of ${t.anims.length} animations`,
      q: r.q ? `Best score ${r.q.best} of ${t.quiz.length}` : `${t.quiz.length} questions`,
      c: `${t.coding.filter((x) => r.c[x.id]).length} of ${t.coding.length} solved`,
      h: `${t.homework.filter((_, i) => r.h[i]).length} of ${t.homework.length} ticked`,
    };
    const target = { w: 's-watch', q: 's-quiz', c: 's-code', h: 's-home' };
    el.innerHTML = CHECKS.map(([k, l]) => `<a class="chk ${s[k] ? 'on' : ''}" href="#${t.id}" data-sec="${target[k]}"><span class="tick" aria-hidden="true">${s[k] ? '✓' : ''}</span><span><b>${l}</b><small>${sub[k]}</small></span></a>`).join('') + `<span class="pill p-${s.state} chk-state">${STATE_LABEL[s.state]}</span>`;
    if (s.state === 'done' && !t._celebrated && t._wasIncomplete) { toast(`${t.title} learned. ${totals().done} of ${TOPICS.length} topics finished.`); t._celebrated = true; }
    if (s.state !== 'done') t._wasIncomplete = true;
  }

  function mountPlayers(t) {
    const box = document.getElementById('players'), r = rec(t.id);
    t.anims.forEach((id) => {
      const host = document.createElement('article');
      box.appendChild(host);
      players.push(mountViz(host, VIZ[id], { onFinish() { if (!r.w[id]) { r.w[id] = 1; save(); } } }));
    });
  }

  function codeBlock(src, id) {
    return `<pre class="py" id="${id}">${src.split('\n').map((l) => g_h(l)).join('\n')}</pre>`;
  }
  const g_h = (l) => window.highlightPy(l);

  function mountSnips(t) {
    const box = document.getElementById('snips');
    box.innerHTML = t.code.map((c, i) => `<figure class="snip"><figcaption><span>${esc(c.title)}</span><span class="snip-btns"><button type="button" class="btn small ghost" data-copy="${i}">Copy</button><button type="button" class="btn small" data-runs="${i}">Run</button></span></figcaption>${codeBlock(c.src, `snip-${i}`)}<div class="snip-out" id="snip-out-${i}" hidden></div></figure>`).join('');
    box.addEventListener('click', async (e) => {
      const copy = e.target.closest('[data-copy]'), run = e.target.closest('[data-runs]');
      if (copy) {
        const src = t.code[+copy.dataset.copy].src;
        try { await navigator.clipboard.writeText(src); copy.textContent = 'Copied'; setTimeout(() => (copy.textContent = 'Copy'), 1200); } catch { copy.textContent = 'Select the code to copy'; }
      }
      if (run) {
        const i = +run.dataset.runs, out = document.getElementById(`snip-out-${i}`);
        out.hidden = false; out.className = 'snip-out';
        out.textContent = Py.isReady ? 'Running…' : 'Loading Python. This takes a few seconds the first time.';
        run.disabled = true;
        try {
          const res = await Py.run(t.code[i].src, [], '');
          out.textContent = (res.stdout || '') + (res.error ? res.error : '') || 'This code ran but printed nothing.';
          if (res.error) out.classList.add('is-err');
        } catch (ex) { out.textContent = ex.message; out.classList.add('is-err'); }
        run.disabled = false;
      }
    });
  }

  function mountQuiz(t) {
    const box = document.getElementById('quiz'), r = rec(t.id);
    let ans = {};
    function draw() {
      const answered = Object.keys(ans).length, correct = t.quiz.filter((q, i) => ans[i] === q.a).length, finished = answered === t.quiz.length, pass = correct >= passMark(t);
      box.innerHTML = t.quiz.map((q, i) => {
        const picked = ans[i];
        return `<div class="q ${picked != null ? 'answered' : ''}"><p class="q-t"><span>Q${i + 1}</span> ${fmt(q.q)}</p><div class="opts">${q.o.map((o, j) => {
          let cls = '';
          if (picked != null) { if (j === q.a) cls = 'right'; else if (j === picked) cls = 'wrong'; }
          return `<button type="button" class="opt ${cls}" data-q="${i}" data-o="${j}" ${picked != null ? 'disabled' : ''}>${fmt(o)}</button>`;
        }).join('')}</div>${picked != null ? `<p class="why ${picked === q.a ? 'ok' : 'no'}"><b>${picked === q.a ? 'Correct.' : 'Not quite.'}</b> ${fmt(q.why)}</p>` : ''}</div>`;
      }).join('') + (finished ? `<div class="q-end ${pass ? 'ok' : 'no'}"><b>${correct} of ${t.quiz.length} right.</b> ${pass ? 'You passed this checkpoint.' : `You need ${passMark(t)} to pass. Read the feedback above and try again.`}<button type="button" class="btn small ghost" id="retake">Retake quiz</button></div>` : (r.q && r.q.passed ? `<p class="sec-note">You have already passed this quiz, with a best score of ${r.q.best} of ${t.quiz.length}.</p>` : ''));
    }
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.opt');
      if (b) {
        ans[+b.dataset.q] = +b.dataset.o;
        if (Object.keys(ans).length === t.quiz.length) {
          const c = t.quiz.filter((q, i) => ans[i] === q.a).length;
          r.q = { best: Math.max(c, r.q ? r.q.best : 0), passed: (r.q && r.q.passed) || c >= passMark(t) };
          save();
        }
        draw();
      }
      if (e.target.id === 'retake') { ans = {}; draw(); }
    });
    draw();
  }

  /* ---------- coding ---------- */
  function mountCoding(t) {
    const box = document.getElementById('coding'), r = rec(t.id), drafts = read(DRAFT, {});
    box.innerHTML = t.coding.map((c, i) => {
      const did = `${t.id}/${c.id}`;
      return `<article class="task" data-i="${i}">
        <header><h3><span class="tick ${r.c[c.id] ? 'on' : ''}" data-tick aria-hidden="true">${r.c[c.id] ? '✓' : ''}</span>${esc(c.title)}</h3></header>
        <p class="prompt">${fmt(c.prompt)}</p>
        <label class="sr" for="ed-${c.id}">Your Python code for ${esc(c.title)}</label>
        <textarea class="editor" id="ed-${c.id}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" rows="${Math.max(7, c.starter.split('\n').length + 3)}">${esc(drafts[did] != null ? drafts[did] : c.starter)}</textarea>
        <div class="task-btns">
          <button type="button" class="btn small" data-run>Run and check</button>
          <button type="button" class="btn small ghost" data-hint>Hint</button>
          <button type="button" class="btn small ghost" data-sol>Show solution</button>
          <button type="button" class="btn small ghost" data-reset>Reset code</button>
        </div>
        <p class="hint" hidden>${fmt(c.hint)}</p>
        <div class="sol" hidden><p class="sec-note">Try it yourself before reading. Understanding beats copying.</p><pre class="py">${c.solution.trimEnd().split('\n').map(g_h).join('\n')}</pre></div>
        <div class="out" aria-live="polite"></div>
      </article>`;
    }).join('');

    box.addEventListener('keydown', (e) => {
      if (!e.target.classList.contains('editor')) return;
      const ta = e.target, s = ta.selectionStart, end = ta.selectionEnd;
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        ta.setRangeText('    ', s, end, 'end');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const line = ta.value.slice(ta.value.lastIndexOf('\n', s - 1) + 1, s);
        const indent = (line.match(/^\s*/) || [''])[0] + (/:\s*$/.test(line) ? '    ' : '');
        ta.setRangeText('\n' + indent, s, end, 'end');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') e.preventDefault();
    });
    box.addEventListener('input', (e) => {
      if (!e.target.classList.contains('editor')) return;
      const card = e.target.closest('.task'), c = t.coding[+card.dataset.i], d = read(DRAFT, {});
      d[`${t.id}/${c.id}`] = e.target.value;
      write(DRAFT, d);
    });
    box.addEventListener('click', async (e) => {
      const card = e.target.closest('.task');
      if (!card) return;
      const c = t.coding[+card.dataset.i], out = card.querySelector('.out'), ta = card.querySelector('.editor');
      if (e.target.closest('[data-hint]')) card.querySelector('.hint').hidden = !card.querySelector('.hint').hidden;
      if (e.target.closest('[data-sol]')) card.querySelector('.sol').hidden = !card.querySelector('.sol').hidden;
      if (e.target.closest('[data-reset]')) {
        ta.value = c.starter; ta.dispatchEvent(new Event('input', { bubbles: true })); out.innerHTML = '';
      }
      if (e.target.closest('[data-manual]')) { markSolved(); }
      function markSolved() {
        if (!r.c[c.id]) { r.c[c.id] = 1; save(); }
        const tk = card.querySelector('[data-tick]'); tk.classList.add('on'); tk.textContent = '✓';
      }
      const runBtn = e.target.closest('[data-run]');
      if (!runBtn) return;
      runBtn.disabled = true;
      out.innerHTML = `<p class="running">${Py.isReady ? 'Running your code…' : 'Loading Python. This takes a few seconds the first time.'}</p>`;
      try {
        const res = await Py.run(ta.value, c.tests, c.setup || '');
        const passed = res.tests.filter((x) => x.pass).length, all = !res.error && res.tests.length > 0 && passed === res.tests.length;
        let html = '';
        if (res.stdout) html += `<div class="printed"><small>Printed</small><pre>${esc(res.stdout)}</pre></div>`;
        if (res.error) html += `<div class="err"><b>Your code stopped with an error.</b><pre>${esc(res.error)}</pre></div>`;
        else {
          html += `<p class="verdict ${all ? 'ok' : 'no'}">${all ? 'All tests passed. Solved!' : `${passed} of ${res.tests.length} tests passed. ${c.starter.includes('pass') && ta.value === c.starter ? 'Write your solution above and run it.' : 'Check the first failing test.'}`}</p>`;
          html += `<ul class="tests">${res.tests.map((x) => `<li class="${x.pass ? 'ok' : 'no'}"><span class="mark" aria-hidden="true">${x.pass ? '✓' : '✕'}</span><div><code>${esc(x.call)}</code>${x.pass ? '' : `<small>Expected <code>${esc(x.expected)}</code>, got <code>${esc(x.got)}</code></small>`}</div></li>`).join('')}</ul>`;
        }
        out.innerHTML = html;
        if (all) markSolved();
      } catch (ex) {
        out.innerHTML = `<div class="err"><b>${esc(ex.message)}</b><p>You can still practise: solve this in your own Python editor, then mark it here.</p><button type="button" class="btn small ghost" data-manual>I solved this elsewhere</button></div>`;
      }
      runBtn.disabled = false;
    });
  }

  function mountHomework(t) {
    const box = document.getElementById('hw'), r = rec(t.id);
    box.innerHTML = t.homework.map((h, i) => `<li><label><input type="checkbox" id="hw-${i}" data-h="${i}" ${r.h[i] ? 'checked' : ''}><span>${fmt(h)}</span></label></li>`).join('');
    box.addEventListener('change', (e) => { const i = e.target.dataset.h; if (e.target.checked) r.h[i] = 1; else delete r.h[i]; save(); });
  }

  function mountLeetcode(t) {
    const box = document.getElementById('lc'), r = rec(t.id);
    box.innerHTML = t.leetcode.map(([n, title, slug, d]) => `<li><input type="checkbox" id="lc-${n}" data-l="${n}" aria-label="Mark ${esc(title)} as solved" ${r.l[n] ? 'checked' : ''}><a href="https://leetcode.com/problems/${slug}/" target="_blank" rel="noopener noreferrer"><span class="lc-n">${n}.</span> ${esc(title)} <span class="ext" aria-hidden="true">↗</span></a><span class="d d-${d.toLowerCase()}">${d}</span></li>`).join('');
    box.addEventListener('change', (e) => { const n = e.target.dataset.l; if (e.target.checked) r.l[n] = 1; else delete r.l[n]; save(); });
  }

  /* ---------- toast ---------- */
  let toastTimer = 0;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 4200);
  }

  /* ---------- routing ---------- */
  let current = null;
  function route() {
    clearPlayers();
    const id = decodeURIComponent(location.hash.slice(1));
    if (byId[id]) renderTopic(byId[id]); else renderHome();
    syncProgress();
    window.scrollTo(0, 0);
  }
  function go(id) {
    if (decodeURIComponent(location.hash.slice(1)) === id) { route(); return; }
    location.hash = id;
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]');
    if (a) { e.preventDefault(); go(a.dataset.go); return; }
    const s = e.target.closest('[data-sec]');
    if (s) {
      e.preventDefault();
      const el = document.getElementById(s.dataset.sec);
      if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    const j = e.target.closest('[data-jump]');
    if (j) {
      e.preventDefault();
      if (filter !== 'all') { filter = 'all'; document.querySelectorAll('.filters button').forEach((b) => b.classList.toggle('on', b.dataset.f === 'all')); refreshHome(); }
      const el = document.getElementById(j.dataset.jump);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const f = e.target.closest('[data-f]');
    if (f) {
      filter = f.dataset.f;
      document.querySelectorAll('.filters button').forEach((b) => b.classList.toggle('on', b === f));
      refreshHome();
      return;
    }
    if (e.target.closest('#theme-toggle')) {
      const v = isDark() ? 'light' : 'dark';
      setTheme(v);
      try { localStorage.setItem(THEME, v); } catch { /* ignore */ }
      return;
    }
    if (e.target.id === 'reset') {
      document.getElementById('reset-zone').innerHTML = `<span class="confirm">This clears every checkpoint. <button type="button" class="link danger" id="reset-yes">Yes, reset</button> <button type="button" class="link" id="reset-no">Keep my progress</button></span>`;
      return;
    }
    if (e.target.id === 'reset-no') { document.getElementById('reset-zone').innerHTML = '<button type="button" class="link" id="reset">Reset all progress</button>'; return; }
    if (e.target.id === 'reset-yes') {
      P = { t: {} };
      save();
      TOPICS.forEach((t) => { delete t._celebrated; delete t._wasIncomplete; });
      route();
      toast('Progress reset.');
    }
  });
  window.addEventListener('hashchange', route);
  /* Keep several open tabs in step. */
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) { P = read(KEY, { t: {} }); syncProgress(); }
  });
  route();
  connectCloud().catch(() => {});
})();
