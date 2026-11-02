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
  if (!P || typeof P.t !== 'object' || !P.t) P = { t: {} };
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
    return `<a class="skip" href="#" data-sec="main-content">Skip to content</a><header class="top"><div class="top-in">
      <a class="brand" href="#" data-go="" aria-label="Step Through home"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="20" width="7" height="9" rx="2" class="b1"/><rect x="12.5" y="12" width="7" height="17" rx="2" class="b2"/><rect x="22" y="3" width="7" height="26" rx="2" class="b3"/></svg><span>Step Through</span></a>
      <a class="nav-link" href="#roadmap" data-go="roadmap">Roadmap</a>
      <a class="nav-link" href="#interview" data-go="interview">Interview</a>
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
    app.innerHTML = header() + `<main class="home" id="main-content" tabindex="-1">
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
        <div class="filters" role="group" aria-label="Filter topics">${[['all', 'All'], ['todo', 'Left to do'], ['doing', 'In progress'], ['done', 'Learned']].map(([k, l]) => `<button type="button" data-f="${k}" aria-pressed="${filter === k}" class="${filter === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <p class="legend"><span class="pips"><i class="on"></i><i class="on"></i><i></i><i></i></span> Each topic has four checkpoints: watch the animations, pass the quiz, solve the code, finish the homework.</p>
      </section>
      <div class="syllabus wrap" id="syllabus"></div>
      <footer class="foot wrap">
        <p>Progress saves automatically in this browser. Nothing is sent anywhere.</p>
        <div class="foot-btns"><button type="button" class="link" id="backup">Back up progress</button><label class="link" for="restore">Restore backup</label><input class="sr" type="file" id="restore" accept="application/json,.json"><span id="reset-zone"><button type="button" class="link" id="reset">Reset all progress</button></span></div>
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
      cta.innerHTML = nx ? `<a class="btn" href="#${nx.id}" data-go="${nx.id}">${started ? 'Continue' : 'Start'}: ${esc(nx.title)}</a><a class="btn ghost" href="#roadmap" data-go="roadmap">See the roadmap</a><span class="sub">${started ? `Topic ${nx.n} of ${TOPICS.length - 1}` : 'Begins with variables. No setup needed.'}</span>` : '<span class="sub">You have learned every topic in the syllabus.</span>';
    }
    const c = document.getElementById('counts');
    if (c) c.innerHTML = `<span><b>${t.done}</b> learned</span><span><b>${t.doing}</b> in progress</span><span><b>${t.todo}</b> left</span><span class="c-pct"><b>${t.pct}%</b> of checkpoints</span>`;
    const sg = document.getElementById('segs');
    if (sg) sg.innerHTML = stageBoard();
    const sy = document.getElementById('syllabus');
    if (sy) sy.innerHTML = syllabusHTML();
  }

  /* ---------- roadmap ---------- */
  const phaseOf = (t) => window.ROADMAP.find((p) => p.stages && p.stages.includes(t.stage));
  const lcBySlug = {};
  window.INTERVIEW.forEach((g) => g.items.forEach((i) => (lcBySlug[i[2]] = i)));
  TOPICS.forEach((t) => t.leetcode.forEach((i) => (lcBySlug[i[2]] = i)));
  function renderRoadmap() {
    current = { kind: 'roadmap' };
    document.title = 'Roadmap · Step Through';
    const nx = nextTopic(), totalWeeks = window.ROADMAP.reduce((n, p) => n + p.weeks, 0), months = Math.round(totalWeeks / 4.3);
    const pqTotal = window.PYQ.reduce((n, g) => n + g.items.length, 0), lcTotal = window.INTERVIEW.reduce((n, g) => n + g.items.length, 0);
    const tabs = (t) => window.ROUTINE.map(([sec, label]) => `<a href="#${t.id}--${sec}" data-go="${t.id}--${sec}">${label}</a>`).join('');
    const nxPhase = nx ? phaseOf(nx) : null;
    app.innerHTML = header() + `<main class="topic" id="main-content" tabindex="-1">
      <div class="wrap t-head">
        <a class="back" href="#" data-go="">← Syllabus</a>
        <h1>Your DSA roadmap</h1>
        <p class="lede">Nine phases, from your first line of Python to interview ready. Follow them in order. At about an hour a day, six days a week, expect around ${months} months. Going slower is fine.</p>
      </div>
      <nav class="t-nav" aria-label="Phases"><div class="t-nav-in">${window.ROADMAP.map((p, i) => `<a href="#roadmap--${p.id}" data-sec="${p.id}">Phase ${i + 1}</a>`).join('')}</div></nav>
      <div class="wrap t-body">
        <section class="sec rm-here" id="rm-here">
          <h2>${nx ? 'You are here' : 'Every topic learned'}</h2>
          ${nx ? `<p><a class="btn" href="#${nx.id}" data-go="${nx.id}">${TOPICS.some((x) => status(x).state !== 'todo') ? 'Continue' : 'Start'}: ${esc(nx.title)}</a></p>
          <p class="sec-note">Phase ${window.ROADMAP.indexOf(nxPhase) + 1}: ${esc(nxPhase.title)}. Jump straight to a tab in this topic:</p>
          <div class="rm-tabs">${tabs(nx)}</div>` : `<p class="sec-note">Move on to <a href="#roadmap--phase-9" data-go="roadmap--phase-9">getting interview ready</a>.</p>`}
        </section>
        <section class="sec" id="rm-routine">
          <h2>How to study each topic</h2>
          <p class="sec-note">Every topic page has the same tabs. Go through them in this order. Plan on about two sittings per topic.</p>
          <ol class="rm-steps">${window.ROUTINE.map(([sec, label, text]) => `<li>${nx ? `<a href="#${nx.id}--${sec}" data-go="${nx.id}--${sec}"><b>${label}</b></a>` : `<b>${label}</b>`} ${esc(text)}</li>`).join('')}</ol>
          <p class="sec-note">A topic counts as learned once you've finished its four checkpoints: Watch, Quiz, Practice and Homework.</p>
        </section>
        <div class="syllabus rm-phases">${window.ROADMAP.map((p, i) => {
          const list = p.stages ? TOPICS.filter((t) => p.stages.includes(t.stage)) : [];
          const done = list.filter((t) => status(t).state === 'done').length;
          const lc = p.problems.map((s) => lcBySlug[s]);
          return `<section class="stage" id="${p.id}">
            <div class="stage-h">
              <p class="eyebrow">Phase ${i + 1} of ${window.ROADMAP.length}${p === nxPhase ? ' · <span class="lvl lvl-beginner">You are here</span>' : ''}</p>
              <h3>${esc(p.title)}</h3>
              <p class="stage-b">${esc(p.goal)}</p>
              <p class="stage-c">About ${p.weeks} weeks${list.length ? ` · <b>${done}</b> of ${list.length} learned` : ''}</p>
            </div>
            <div class="rm-body">
              ${list.length ? `<ol class="route">${list.map((t) => { const st = status(t); return `<li class="stop is-${st.state}"><a href="#${t.id}" data-go="${t.id}"><span class="dot" aria-hidden="true"></span><span class="num">[${pad(t.n)}]</span><span class="tt"><b>${esc(t.title)}</b><small>${esc(t.tagline)}</small></span><span class="meta">${pips(st)}<span class="pill p-${st.state}">${STATE_LABEL[st.state]}</span></span></a></li>`; }).join('')}</ol>` : `<ul class="rm-links">
                <li><a href="#interview--s-pyq" data-go="interview--s-pyq"><b>Popular Python questions</b></a> You can explain ${Object.keys(P.pq || {}).length} of ${pqTotal}.</li>
                <li><a href="#interview--s-list" data-go="interview--s-list"><b>LeetCode by pattern</b></a> You've ticked ${Object.keys(P.iv || {}).length} of ${lcTotal}.</li>
                <li><a href="#interview--s-mock" data-go="interview--s-mock"><b>Timed mock interviews</b></a> You've done ${(P.mocks || []).length}. Start with one a week.</li>
              </ul>`}
              <div class="rm-exit"><h4>Move on when</h4><ul>${p.exit.map((x) => `<li>${fmt(x)}</li>`).join('')}</ul>
              ${lc.length ? `<p class="rm-try">Prove it, with no hints:</p><ul class="rm-lc">${lc.map(([n, title, slug, d]) => `<li><a href="https://leetcode.com/problems/${slug}/" target="_blank" rel="noopener noreferrer"><span class="lc-n">${n}.</span> ${esc(title)} <span class="ext" aria-hidden="true">↗</span></a> <span class="d d-${d.toLowerCase()}">${d}</span></li>`).join('')}</ul>` : ''}</div>
            </div>
          </section>`;
        }).join('')}</div>
      </div>
    </main>`;
  }

  /* ---------- topic page ---------- */
  const NAV = [['s-explain', 'Explain'], ['s-watch', 'Watch'], ['s-python', 'Python'], ['s-quiz', 'Quiz'], ['s-code', 'Practice'], ['s-home', 'Homework'], ['s-real', 'Real life'], ['s-lc', 'LeetCode']];

  function renderTopic(t) {
    current = { kind: 'topic', topic: t };
    document.title = `${t.title} · Step Through`;
    P.last = t.id;
    write(KEY, P);
    const st = STAGES.find((x) => x.id === t.stage), prev = TOPICS[t.n - 1], next = TOPICS[t.n + 1], r = rec(t.id);
    app.innerHTML = header() + `<main class="topic" id="main-content" tabindex="-1">
      <div class="wrap t-head">
        <a class="back" href="#" data-go="">← Syllabus</a>
        <p class="eyebrow">${esc(st.title)} · <span class="lvl lvl-${st.level.toLowerCase()}">${st.level}</span> · about ${t.mins} min · <a href="#roadmap--${phaseOf(t).id}" data-go="roadmap--${phaseOf(t).id}">Roadmap phase ${window.ROADMAP.indexOf(phaseOf(t)) + 1}</a></p>
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
        <section id="s-code" class="sec"><h2>Coding practice</h2><p class="sec-note">Write Python here and run it in your browser. Tests check your answer right away. In the editor, Tab adds spaces. Press Esc, then Tab, to move out of it.</p><div id="coding"></div></section>
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
    return `<pre class="py" id="${id}" tabindex="0">${src.split('\n').map((l) => g_h(l)).join('\n')}</pre>`;
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
  const targetLine = (c) => (window.PERF[c.id] ? `<p class="target">Target: <code>${esc(window.PERF[c.id].target)}</code> time. Correct answers are also timed on a large input.</p>` : '');
  /* Runs the speed check and says what to do about the result. Only unknown or ok count as solved. */
  async function speedVerdict(c, code) {
    const p = window.PERF[c.id];
    if (!p) return { ok: true, html: '' };
    const r = await Py.speedCheck(c, p, code);
    if (r.state === 'ok') return { ok: true, html: `It's also fast enough for ${esc(p.size)}.` };
    if (r.state === 'unknown') return { ok: true, html: '' };
    if (r.state === 'slow') return { ok: false, html: `Your answers are correct, but too slow for ${esc(p.size)}. Target: <code>${esc(p.target)}</code>. ${fmt(p.tip)}` };
    if (r.state === 'wrong') return { ok: false, html: `It passes the small tests but gives a different answer on ${esc(p.size)}. Check for edge cases.` };
    return { ok: false, html: `It passes the small tests but crashes on ${esc(p.size)}: <code>${esc(r.error.split('\n')[0])}</code>. Very deep recursion is a common cause.` };
  }

  function mountCoding(t) {
    const box = document.getElementById('coding'), r = rec(t.id), drafts = read(DRAFT, {});
    box.innerHTML = t.coding.map((c, i) => {
      const did = `${t.id}/${c.id}`;
      return `<article class="task" data-i="${i}">
        <header><h3><span class="tick ${r.c[c.id] ? 'on' : ''}" data-tick aria-hidden="true">${r.c[c.id] ? '✓' : ''}</span>${esc(c.title)}</h3></header>
        <p class="prompt">${fmt(c.prompt)}</p>${targetLine(c)}
        <label class="sr" for="ed-${c.id}">Your Python code for ${esc(c.title)}</label>
        <textarea class="editor" id="ed-${c.id}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" rows="${Math.max(7, c.starter.split('\n').length + 3)}">${esc(drafts[did] != null ? drafts[did] : c.starter)}</textarea>
        <div class="task-btns">
          <button type="button" class="btn small" data-run>Run and check</button>
          <button type="button" class="btn small ghost" data-hint>Hint</button>
          <button type="button" class="btn small ghost" data-sol>Show solution</button>
          <button type="button" class="btn small ghost" data-reset>Reset code</button>
        </div>
        <p class="hint" hidden>${fmt(c.hint)}</p>
        <div class="sol" hidden><p class="sec-note">Try it yourself before reading. Understanding beats copying.</p><pre class="py" tabindex="0">${c.solution.trimEnd().split('\n').map(g_h).join('\n')}</pre></div>
        <div class="out" aria-live="polite"></div>
      </article>`;
    }).join('');

    enhanceEditors(box);
    bindEditorKeys(box);
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
        if (all) {
          const v = out.querySelector('.verdict');
          if (window.PERF[c.id]) {
            v.className = 'verdict running';
            v.textContent = 'All tests passed. Now timing it on a large input…';
          }
          const sp = await speedVerdict(c, ta.value);
          v.className = `verdict ${sp.ok ? 'ok' : 'no'}`;
          v.innerHTML = sp.ok ? `All tests passed. ${sp.html} Solved!` : sp.html;
          if (sp.ok) markSolved();
        }
      } catch (ex) {
        out.innerHTML = `<div class="err"><b>${esc(ex.message)}</b><p>You can still practise: solve this in your own Python editor, then mark it here.</p><button type="button" class="btn small ghost" data-manual>I solved this elsewhere</button></div>`;
      }
      runBtn.disabled = false;
    });
  }

  /* Colours typed code: a highlighted copy sits behind a transparent textarea. */
  function enhanceEditors(root) {
    root.querySelectorAll('textarea.editor').forEach((ta) => {
      if (ta.parentNode.classList.contains('ed-wrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'ed-wrap';
      const bg = document.createElement('pre');
      bg.className = 'ed-bg';
      bg.setAttribute('aria-hidden', 'true');
      ta.parentNode.insertBefore(wrap, ta);
      wrap.append(bg, ta);
      const paint = () => {
        bg.innerHTML = ta.value.split('\n').map(g_h).join('\n') + '\n';
        bg.scrollTop = ta.scrollTop;
        bg.scrollLeft = ta.scrollLeft;
      };
      ta.addEventListener('input', paint);
      ta.addEventListener('scroll', () => { bg.scrollTop = ta.scrollTop; bg.scrollLeft = ta.scrollLeft; });
      paint();
    });
  }
  function bindEditorKeys(root) {
    root.addEventListener('keydown', (e) => {
      if (!e.target.classList.contains('editor')) return;
      const ta = e.target, st = ta.selectionStart, end = ta.selectionEnd;
      /* Escape then Tab leaves the editor, so keyboard users are never trapped. */
      if (e.key === 'Escape') { ta.dataset.leave = '1'; return; }
      if (e.key === 'Tab' && !e.shiftKey) {
        if (ta.dataset.leave) { delete ta.dataset.leave; return; }
        e.preventDefault();
        ta.setRangeText('    ', st, end, 'end');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const line = ta.value.slice(ta.value.lastIndexOf('\n', st - 1) + 1, st);
        const indent = (line.match(/^\s*/) || [''])[0] + (/:\s*$/.test(line) ? '    ' : '');
        ta.setRangeText('\n' + indent, st, end, 'end');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      } else delete ta.dataset.leave;
    });
  }

  /* ---------- interview practice ---------- */
  const MOCK_MINUTES = 30;
  let mock = null, mockTimer = 0;
  const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const pickFrom = (stages) => {
    const pool = TOPICS.filter((t) => stages.includes(t.stage)).flatMap((t) => t.coding.map((c) => ({ c, t })));
    return pool[Math.floor(Math.random() * pool.length)];
  };
  function renderInterview() {
    current = { kind: 'interview' };
    document.title = 'Interview practice · Step Through';
    const all = window.INTERVIEW.flatMap((g) => g.items), iv = P.iv || {};
    const history = (P.mocks || []).slice(-5).reverse();
    app.innerHTML = header() + `<main class="topic" id="main-content" tabindex="-1">
      <div class="wrap t-head">
        <a class="back" href="#" data-go="">← Syllabus</a>
        <h1>Interview practice</h1>
        <p class="lede">Practise under time pressure, then work through real problems grouped by pattern. Finish the syllabus topics first if these feel too hard.</p>
      </div>
      <nav class="t-nav" aria-label="Sections"><div class="t-nav-in"><a href="#interview" data-sec="s-mock">Mock interview</a><a href="#interview" data-sec="s-pyq">Python questions</a><a href="#interview" data-sec="s-list">LeetCode by pattern</a></div></nav>
      <div class="wrap t-body">
        <section class="sec" id="s-mock">
          <h2>Timed mock interview</h2>
          <p class="sec-note">Two questions and ${MOCK_MINUTES} minutes, with no hints. Say your approach out loud and state the Big-O before you code, as you would in a real interview. Mocks don't change your syllabus progress.</p>
          <div id="mock-box"></div>
          ${history.length ? `<div><h3 class="mock-h">Recent mocks</h3><ul class="mock-hist">${history.map((m) => `<li>${esc(m.date)}: <b>${m.score} of ${m.total}</b> solved in ${clock(m.secs)}</li>`).join('')}</ul></div>` : ''}
        </section>
        ${pyqSection()}
        <section class="sec" id="s-list">
          <h2>Problems by pattern</h2>
          <p class="sec-note">${all.length} free LeetCode problems, easiest first in each group. <span id="iv-count"></span> Hard problems are stretch goals. Plan on doing most of the Easy and Medium ones before a real interview.</p>
          ${window.INTERVIEW.map((g) => `<div class="iv-group"><h3>${esc(g.title)}</h3><ul class="lc-list">${g.items.map(([n, title, slug, d]) => `<li><input type="checkbox" id="iv-${slug}" data-iv="${slug}" aria-label="Mark ${esc(title)} as solved" ${iv[slug] ? 'checked' : ''}><a href="https://leetcode.com/problems/${slug}/" target="_blank" rel="noopener noreferrer"><span class="lc-n">${n}.</span> ${esc(title)} <span class="ext" aria-hidden="true">↗</span></a><span class="d d-${d.toLowerCase()}">${d}</span></li>`).join('')}</ul></div>`).join('')}
        </section>
      </div>
    </main>`;
    const count = () => { document.getElementById('iv-count').textContent = `You've ticked ${Object.keys(P.iv || {}).length}.`; };
    count();
    document.getElementById('s-list').addEventListener('change', (e) => {
      const slug = e.target.dataset.iv;
      if (!slug) return;
      P.iv = P.iv || {};
      if (e.target.checked) P.iv[slug] = 1; else delete P.iv[slug];
      save();
      count();
    });
    drawMock();
    bindPyq();
  }
  /* ---------- popular Python questions ---------- */
  function pyqSection() {
    const known = P.pq || {};
    const total = window.PYQ.reduce((n, g) => n + g.items.length, 0);
    return `<section class="sec" id="s-pyq">
      <h2>Popular Python questions</h2>
      <p class="sec-note">${total} questions that keep coming up. Answer each one out loud first, then open it to check. Tick the ones you can explain without looking.</p>
      <div class="pq-tools">
        <label class="pq-search" for="pq-search"><span class="sr">Search questions</span><input id="pq-search" type="search" placeholder="Search, for example decorator" autocomplete="off"></label>
        <label class="pq-only"><input type="checkbox" id="pq-popular"> Popular only</label>
        <span id="pq-count" aria-live="polite"></span>
      </div>
      ${window.PYQ.map((g) => `<div class="pq-group"><h3>${esc(g.title)}</h3><div class="reals">${g.items.map((q) => `<div class="pq-row" data-text="${esc((q.q + ' ' + q.a).toLowerCase())}" data-pop="${q.pop ? 1 : 0}">
        <input type="checkbox" id="pq-${q.id}" data-pq="${q.id}" aria-label="I can explain: ${esc(q.q.replace(/\`/g, ''))}" ${known[q.id] ? 'checked' : ''}>
        <details class="real"><summary>${fmt(q.q)}${q.pop ? ' <span class="d d-medium">Popular</span>' : ''}</summary><p>${fmt(q.a)}</p>${q.code ? `<pre class="py" tabindex="0">${q.code.split('\n').map(g_h).join('\n')}</pre><div class="pq-out"><small>Output</small><pre tabindex="0">${esc(q.out)}</pre></div>` : ''}${q.topic ? `<p><a href="#${q.topic}" data-go="${q.topic}">Learn this in ${esc(byId[q.topic].title)}</a></p>` : ''}</details>
      </div>`).join('')}</div></div>`).join('')}
      <p class="sec-note">Question topics were chosen by comparing ${window.PYQ_SOURCES.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${esc(n)}</a>`).join(', ')}. "Popular" means a question appears on at least three of these four lists. The answers and code here were written for this site.</p>
    </section>`;
  }
  function bindPyq() {
    const box = document.getElementById('s-pyq'), search = document.getElementById('pq-search'), popular = document.getElementById('pq-popular');
    const total = box.querySelectorAll('.pq-row').length;
    const draw = () => {
      const words = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      let shown = 0;
      box.querySelectorAll('.pq-row').forEach((r) => {
        const show = (!popular.checked || r.dataset.pop === '1') && words.every((w) => r.dataset.text.includes(w));
        r.hidden = !show;
        if (show) shown++;
      });
      box.querySelectorAll('.pq-group').forEach((g) => { g.hidden = !g.querySelector('.pq-row:not([hidden])'); });
      const known = Object.keys(P.pq || {}).length;
      document.getElementById('pq-count').textContent = `${shown === total ? '' : `Showing ${shown}. `}You can explain ${known} of ${total}.`;
    };
    search.addEventListener('input', draw);
    popular.addEventListener('change', draw);
    box.addEventListener('change', (e) => {
      const id = e.target.dataset.pq;
      if (!id) return;
      P.pq = P.pq || {};
      if (e.target.checked) P.pq[id] = 1; else delete P.pq[id];
      save();
      draw();
    });
    draw();
  }
  function drawMock() {
    const box = document.getElementById('mock-box');
    if (!box) return;
    if (!mock) { box.innerHTML = '<button type="button" class="btn" id="mock-start">Start a mock interview</button>'; return; }
    if (mock.done) {
      box.innerHTML = `<p class="verdict ${mock.score === mock.qs.length ? 'ok' : 'no'}" role="status">You solved ${mock.score} of ${mock.qs.length} in ${clock(mock.used)}.</p>
        ${mock.qs.map((q) => `<article class="task"><h3>${esc(q.c.title)} <small class="mock-from">from <a href="#${q.t.id}" data-go="${q.t.id}">${esc(q.t.title)}</a></small></h3><p>${q.solved ? 'Solved.' : 'Not solved. Compare your attempt with this answer:'}</p><pre class="py" tabindex="0">${q.c.solution.trimEnd().split('\n').map(g_h).join('\n')}</pre></article>`).join('')}
        <button type="button" class="btn" id="mock-start">Start another</button>`;
      return;
    }
    box.innerHTML = `<p class="mock-clock"><span class="sr">Time left: </span><b id="mock-left">${clock(mock.left)}</b><button type="button" class="btn small ghost" id="mock-finish">Finish now</button></p>
      <div class="mock-tasks">${mock.qs.map((q, i) => `<article class="task" data-m="${i}"><h3>Question ${i + 1}: ${esc(q.c.title)}</h3><p class="prompt">${fmt(q.c.prompt)}</p>${targetLine(q.c)}
        <label class="sr" for="mock-ed-${i}">Your Python code for question ${i + 1}</label>
        <textarea class="editor" id="mock-ed-${i}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" rows="${Math.max(9, q.c.starter.split('\n').length + 4)}">${esc(q.code)}</textarea>
        <div class="task-btns"><button type="button" class="btn small" data-mock-run="${i}">Run and check</button></div><div class="out" aria-live="polite"></div></article>`).join('')}</div>`;
    const tasks = box.querySelector('.mock-tasks');
    enhanceEditors(tasks);
    bindEditorKeys(tasks);
  }
  function finishMock() {
    clearInterval(mockTimer);
    if (!mock || mock.done) return;
    mock.done = true;
    mock.used = MOCK_MINUTES * 60 - mock.left;
    mock.score = mock.qs.filter((q) => q.solved).length;
    P.mocks = (P.mocks || []).concat({ date: new Date().toLocaleDateString(), score: mock.score, total: mock.qs.length, secs: mock.used }).slice(-20);
    save();
    if (current && current.kind === 'interview') renderInterview();
  }
  function startMock() {
    const a = pickFrom(['s2', 's3', 's4', 's5', 's6']), b = pickFrom(['s7', 's8', 's9', 's10']);
    mock = { left: MOCK_MINUTES * 60, qs: [a, b].map((q) => ({ ...q, code: q.c.starter, solved: false })) };
    clearInterval(mockTimer);
    mockTimer = setInterval(() => {
      if (!mock || mock.done) return;
      mock.left--;
      const el = document.getElementById('mock-left');
      if (el) el.textContent = clock(mock.left);
      if (mock.left <= 0) finishMock();
    }, 1000);
    drawMock();
  }
  document.addEventListener('input', (e) => {
    const m = e.target.closest && e.target.closest('[data-m]');
    if (m && mock) mock.qs[+m.dataset.m].code = e.target.value;
  });

  /* ---------- backup ---------- */
  function backup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(P, null, 1)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'step-through-progress.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Backup saved. Use Restore backup on any device.');
  }
  async function restore(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data.t !== 'object' || !data.t) throw new Error('bad');
      P = data;
      save();
      route();
      toast('Progress restored.');
    } catch { toast("That file isn't a Step Through backup. Nothing changed."); }
  }
  document.addEventListener('change', (e) => { if (e.target.id === 'restore' && e.target.files[0]) restore(e.target.files[0]); });

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
  let current = null, started = false;
  function route() {
    clearPlayers();
    /* A link can name a tab too: #two-pointers--s-quiz opens that topic at its quiz. */
    const [page, section] = decodeURIComponent(location.hash.slice(1)).split('--');
    try {
      if (page === 'interview') renderInterview();
      else if (page === 'roadmap') renderRoadmap();
      else if (byId[page]) renderTopic(byId[page]);
      else renderHome();
    } catch (ex) {
      console.error(ex);
      app.innerHTML = '<main class="wrap crash"><h1>This page failed to load</h1><p>Your progress is safe. <a href="#" data-go="">Go back to the syllabus</a>, or reload the page.</p></main>';
    }
    syncProgress();
    window.scrollTo(0, 0);
    const main = document.getElementById('main-content');
    if (main && started) main.focus({ preventScroll: true });
    started = true;
    const target = section && document.getElementById(section);
    if (target) {
      target.scrollIntoView({ block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
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
      if (el) {
        el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
      return;
    }
    const j = e.target.closest('[data-jump]');
    if (j) {
      e.preventDefault();
      if (filter !== 'all') { filter = 'all'; document.querySelectorAll('.filters button').forEach((b) => { b.classList.toggle('on', b.dataset.f === 'all'); b.setAttribute('aria-pressed', b.dataset.f === 'all'); }); refreshHome(); }
      const el = document.getElementById(j.dataset.jump);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const f = e.target.closest('[data-f]');
    if (f) {
      filter = f.dataset.f;
      document.querySelectorAll('.filters button').forEach((b) => { b.classList.toggle('on', b === f); b.setAttribute('aria-pressed', b === f); });
      refreshHome();
      return;
    }
    if (e.target.closest('#theme-toggle')) {
      const v = isDark() ? 'light' : 'dark';
      setTheme(v);
      try { localStorage.setItem(THEME, v); } catch { /* ignore */ }
      return;
    }
    if (e.target.id === 'mock-start') { startMock(); return; }
    if (e.target.id === 'mock-finish') { finishMock(); return; }
    if (e.target.id === 'backup') { backup(); return; }
    const mr = e.target.closest('[data-mock-run]');
    if (mr) { runMock(mr); return; }
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
  async function runMock(btn) {
    const i = +btn.dataset.mockRun, q = mock.qs[i], card = btn.closest('.task'), out = card.querySelector('.out');
    btn.disabled = true;
    out.innerHTML = `<p class="running">${Py.isReady ? 'Running your code…' : 'Loading Python. This takes a few seconds the first time.'}</p>`;
    try {
      const res = await Py.run(card.querySelector('textarea').value, q.c.tests, q.c.setup || '');
      const passed = res.tests.filter((x) => x.pass).length, all = !res.error && res.tests.length > 0 && passed === res.tests.length;
      out.innerHTML = res.error ? `<div class="err"><b>Your code stopped with an error.</b><pre>${esc(res.error)}</pre></div>` : `<p class="verdict ${all ? 'running' : 'no'}">${all ? 'All tests passed. Now checking speed…' : `${passed} of ${res.tests.length} tests passed.`}</p>`;
      if (all) {
        const sp = await speedVerdict(q.c, card.querySelector('textarea').value);
        q.solved = sp.ok;
        const v = out.querySelector('.verdict');
        v.className = `verdict ${sp.ok ? 'ok' : 'no'}`;
        v.innerHTML = sp.ok ? `All tests passed. ${sp.html}` : sp.html;
      }
    } catch (ex) { out.innerHTML = `<div class="err"><b>${esc(ex.message)}</b></div>`; }
    btn.disabled = false;
  }
  window.addEventListener('hashchange', route);
  /* Keep several open tabs in step. */
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) { P = read(KEY, { t: {} }); syncProgress(); if (current && current.kind === 'roadmap') renderRoadmap(); }
  });
  route();
  connectCloud().catch(() => {});
})();
