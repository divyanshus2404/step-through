/* Step Through animation engine.
   An animation is a list of frames. A frame is a list of shapes with stable ids,
   so when a shape's id survives between frames it glides to its new place. */
(function (g) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const VIZ = (g.VIZ = {});
  g.defViz = (id, def) => { VIZ[id] = Object.assign({ id, inputs: [] }, def); };

  /* ---------- shape primitives ---------- */
  const box = (id, x, y, w, h, text, o) => Object.assign({ k: 'box', id, x, y, w, h, text: text == null ? '' : String(text) }, o);
  const circ = (id, x, y, r, text, o) => Object.assign({ k: 'circ', id, x, y, r, text: text == null ? '' : String(text) }, o);
  const line = (id, x1, y1, x2, y2, o) => Object.assign({ k: 'line', id, x1, y1, x2, y2 }, o);
  const text = (id, x, y, str, o) => Object.assign({ k: 'text', id, x, y, text: String(str) }, o);
  const ptr = (id, x, y, name, o) => Object.assign({ k: 'ptr', id, x, y, text: name }, o);

  const stOf = (st, key) => (typeof st === 'function' ? st(key) : st ? st[key] : undefined);

  /* A row of cells with index numbers underneath and named pointers on top. */
  function cells(pre, arr, o = {}) {
    const s = o.s || 52, gap = o.gap ?? 6, x0 = o.x || 0, y0 = o.y || 0, out = [];
    arr.forEach((v, i) => {
      const key = o.ids ? o.ids[i] : i, x = x0 + i * (s + gap);
      out.push(box(pre + 'c' + key, x, y0, s, s, v, { state: stOf(o.st, i) }));
      if (o.idx !== false) out.push(text(pre + 'i' + i, x + s / 2, y0 + s + 15, i, { cls: 'idx', size: 12 }));
    });
    if (o.label) out.push(text(pre + 'L', x0, y0 - (o.ptr ? 34 : 10), o.label, { anchor: 'start', cls: 'lab', size: 13 }));
    const stacked = {};
    Object.entries(o.ptr || {}).forEach(([name, i]) => {
      if (i == null) return;
      const n = (stacked[i] = (stacked[i] || 0) + 1) - 1;
      out.push(ptr(pre + 'p' + name, x0 + i * (s + gap) + s / 2, y0 - 3 - n * 20, name, { state: o.ptrState }));
    });
    return out;
  }

  /* Vertical bars for sorting. y is the baseline. */
  function bars(pre, arr, o = {}) {
    const w = o.w || 46, gap = o.gap ?? 8, x0 = o.x || 0, base = o.y ?? 220, maxH = o.maxH || 180;
    const mx = o.max || Math.max(1, ...arr);
    const out = [];
    arr.forEach((v, i) => {
      const key = o.ids ? o.ids[i] : i, h = Math.max(6, (v / mx) * maxH);
      out.push(box(pre + 'b' + key, x0 + i * (w + gap), base - h, w, h, v, { state: stOf(o.st, i), bar: 1 }));
    });
    const stacked = {};
    Object.entries(o.ptr || {}).forEach(([name, i]) => {
      if (i == null) return;
      const n = (stacked[i] = (stacked[i] || 0) + 1) - 1;
      out.push(ptr(pre + 'p' + name, x0 + i * (w + gap) + w / 2, base + 26 + n * 20, name, { up: 1 }));
    });
    return out;
  }

  /* Binary tree: x comes from in-order position, y from depth. */
  function tree(pre, root, o = {}) {
    const dx = o.dx || 44, dy = o.dy || 66, x0 = o.x || 24, y0 = o.y || 24, r = o.r || 19, out = [], edges = [];
    let c = 0;
    (function walk(n, d, parent) {
      if (!n) return;
      walk(n.l, d + 1, n);
      n._x = x0 + c++ * dx; n._y = y0 + d * dy;
      walk(n.r, d + 1, n);
    })(root, 0);
    (function draw(n) {
      if (!n) return;
      [n.l, n.r].forEach((ch) => {
        if (ch) {
          edges.push(edgeBetween(pre + 'e' + ch.id, n._x, n._y, ch._x, ch._y, r, { state: stOf(o.edgeSt, ch.id) }));
          draw(ch);
        }
      });
      out.push(circ(pre + 'n' + n.id, n._x, n._y, r, n.v, { state: stOf(o.st, n.id), sub: n.sub }));
    })(root);
    return edges.concat(out);
  }

  function edgeBetween(id, x1, y1, x2, y2, r, o) {
    const d = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / d, uy = (y2 - y1) / d, rr = r || 0;
    return line(id, x1 + ux * rr, y1 + uy * rr, x2 - ux * (rr + (o && o.arrow ? 2 : 0)), y2 - uy * (rr + (o && o.arrow ? 2 : 0)), o);
  }

  /* Graph from {name:[x,y]} and [[a,b,weight?]] */
  function graph(pre, nodes, edges, o = {}) {
    const r = o.r || 20, out = [];
    edges.forEach(([a, b, w]) => {
      const [x1, y1] = nodes[a], [x2, y2] = nodes[b], key = a + '-' + b;
      out.push(edgeBetween(pre + 'e' + key, x1, y1, x2, y2, r, { arrow: o.directed, state: stOf(o.edgeSt, key), label: w }));
    });
    Object.entries(nodes).forEach(([n, [x, y]]) => {
      out.push(circ(pre + 'n' + n, x, y, r, n, { state: stOf(o.st, n), sub: stOf(o.sub, n) }));
    });
    return out;
  }

  /* A table. st(r,c) gives a state; rowL and colL label the edges. */
  function grid(pre, rows, o = {}) {
    const s = o.s || 40, x0 = o.x || 0, y0 = o.y || 0, out = [], gap = o.gap ?? 3, sw = o.w || s;
    rows.forEach((row, r) =>
      row.forEach((v, c) => {
        const st = o.st ? o.st(r, c) : undefined;
        out.push(box(pre + r + '_' + c, x0 + c * (sw + gap), y0 + r * (s + gap), sw, s, v === null || v === undefined ? '' : v, { state: st }));
      })
    );
    (o.colL || []).forEach((t, c) => out.push(text(pre + 'cl' + c, x0 + c * (sw + gap) + sw / 2, y0 - 9, t, { cls: 'idx', size: 13 })));
    (o.rowL || []).forEach((t, r) => out.push(text(pre + 'rl' + r, x0 - 10, y0 + r * (s + gap) + s / 2 + 4, t, { cls: 'idx', size: 13, anchor: 'end' })));
    return out;
  }

  /* Linked nodes. nodes: [{id,v}], drawn left to right with arrows. */
  function chain(pre, nodes, o = {}) {
    const s = o.s || 46, gap = o.gap ?? 34, x0 = o.x || 0, y0 = o.y || 60, out = [];
    nodes.forEach((n, i) => {
      const x = x0 + i * (s + gap);
      out.push(box(pre + 'n' + n.id, x, y0, s, s, n.v, { state: stOf(o.st, n.id) }));
      if (i < nodes.length - 1) out.push(line(pre + 'a' + n.id, x + s, y0 + s / 2, x + s + gap - 3, y0 + s / 2, { arrow: 1 }));
    });
    if (o.none !== false && nodes.length) {
      const x = x0 + (nodes.length - 1) * (s + gap) + s;
      out.push(line(pre + 'a' + nodes[nodes.length - 1].id, x, y0 + s / 2, x + 22, y0 + s / 2, { arrow: 1 }));
      out.push(text(pre + 'none', x + 44, y0 + s / 2 + 5, 'None', { cls: 'idx', size: 13 }));
    }
    const stacked = {};
    Object.entries(o.ptr || {}).forEach(([name, id]) => {
      if (id == null) return;
      const i = nodes.findIndex((n) => n.id === id);
      if (i < 0) return;
      const n = (stacked[i] = (stacked[i] || 0) + 1) - 1;
      out.push(ptr(pre + 'p' + name, x0 + i * (s + gap) + s / 2, y0 - 3 - n * 20, name));
    });
    return out;
  }

  /* A stack that grows upward from baseline y. */
  function stack(pre, items, o = {}) {
    const w = o.w || 90, h = o.h || 34, x = o.x || 0, y = o.y ?? 240, out = [];
    out.push(line(pre + 'wl', x - 6, y - (o.cap || 7) * (h + 3), x - 6, y + 4, { state: 'wall' }));
    out.push(line(pre + 'wr', x + w + 6, y - (o.cap || 7) * (h + 3), x + w + 6, y + 4, { state: 'wall' }));
    out.push(line(pre + 'wb', x - 6, y + 4, x + w + 6, y + 4, { state: 'wall' }));
    items.forEach((it, i) => {
      const key = it && it.id != null ? it.id : i, v = it && it.v != null ? it.v : it;
      out.push(box(pre + 's' + key, x, y - (i + 1) * (h + 3) + 3, w, h, v, { state: stOf(o.st, i) }));
    });
    if (o.label) out.push(text(pre + 'L', x + w / 2, y + 22, o.label, { cls: 'lab', size: 13 }));
    return out;
  }

  const label = (id, x, y, s, o) => text(id, x, y, s, Object.assign({ anchor: 'start', cls: 'lab', size: 13 }, o));
  const big = (id, x, y, s, o) => text(id, x, y, s, Object.assign({ anchor: 'start', cls: 'big', size: 18 }, o));

  g.Sh = { box, circ, line, text, ptr, cells, bars, tree, graph, grid, chain, stack, label, big, edgeBetween };

  /* ---------- input parsing ---------- */
  function parseInput(spec, raw) {
    const s = String(raw).trim();
    if (spec.type === 'nums') {
      const parts = s.split(/[\s,]+/).filter(Boolean);
      const lo = spec.lo ?? 0, hi = spec.hi ?? 99, min = spec.min ?? 1, max = spec.max ?? 9;
      if (parts.length < min || parts.length > max) throw new Error(`${spec.label}: enter between ${min} and ${max} numbers.`);
      const nums = parts.map(Number);
      if (nums.some((n) => !Number.isInteger(n) || n < lo || n > hi)) throw new Error(`${spec.label}: use whole numbers from ${lo} to ${hi}.`);
      return nums;
    }
    if (spec.type === 'num') {
      const n = Number(s), lo = spec.lo ?? 0, hi = spec.hi ?? 99;
      if (s === '' || !Number.isInteger(n) || n < lo || n > hi) throw new Error(`${spec.label}: enter a whole number from ${lo} to ${hi}.`);
      return n;
    }
    if (spec.type === 'word') {
      const max = spec.max ?? 10, min = spec.min ?? 1;
      if (s.length < min || s.length > max) throw new Error(`${spec.label}: use ${min} to ${max} characters.`);
      if (spec.only && !spec.only.test(s)) throw new Error(`${spec.label}: ${spec.onlyMsg || 'contains characters this demo cannot use.'}`);
      return s;
    }
    if (spec.type === 'words') {
      const parts = s.split(/[\s,]+/).filter(Boolean), max = spec.max ?? 6, min = spec.min ?? 1;
      if (parts.length < min || parts.length > max) throw new Error(`${spec.label}: enter ${min} to ${max} words.`);
      if (parts.some((w) => w.length > (spec.maxLen || 8) || !/^[a-z]+$/.test(w))) throw new Error(`${spec.label}: use lowercase letters, up to ${spec.maxLen || 8} per word.`);
      return parts;
    }
    return s;
  }
  g.parseVizInput = parseInput;

  function randomInput(spec) {
    const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    if (spec.type === 'nums') {
      const lo = spec.lo ?? 0, hi = Math.min(spec.hi ?? 99, spec.randHi ?? 40), n = r(Math.max(spec.min ?? 1, 4), Math.min(spec.max ?? 9, 8));
      let a = Array.from({ length: n }, () => r(lo, hi));
      if (spec.sorted) a.sort((x, y) => x - y);
      return a.join(', ');
    }
    if (spec.type === 'num') return String(r(spec.lo ?? 0, Math.min(spec.hi ?? 99, spec.randHi ?? 99)));
    return null;
  }

  g.buildFrames = function (def, values) {
    const frames = [];
    const add = (shapes, msg, ln, vars) => {
      frames.push({ shapes: [shapes].flat(Infinity).filter(Boolean), msg, line: ln, vars });
    };
    def.build(values, add);
    return frames;
  };
  g.defaultValues = (def) => {
    const v = {};
    (def.inputs || []).forEach((i) => (v[i.k] = i.def));
    return v;
  };

  function bboxOf(frames) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const ex = (a, b, c, d) => { x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d); };
    frames.forEach((f) =>
      f.shapes.forEach((s) => {
        if (s.k === 'box') ex(s.x, s.y, s.x + s.w, s.y + s.h);
        else if (s.k === 'circ') ex(s.x - s.r, s.y - s.r, s.x + s.r, s.y + s.r + (s.sub != null ? 16 : 0));
        else if (s.k === 'line') ex(Math.min(s.x1, s.x2), Math.min(s.y1, s.y2), Math.max(s.x1, s.x2), Math.max(s.y1, s.y2));
        else if (s.k === 'text') {
          const w = s.text.length * (s.size || 14) * 0.58;
          const a = s.anchor || 'middle';
          const left = a === 'start' ? s.x : a === 'end' ? s.x - w : s.x - w / 2;
          ex(left, s.y - (s.size || 14), left + w, s.y + 5);
        } else if (s.k === 'ptr') {
          const w = s.text.length * 8 + 6;
          if (s.up) ex(s.x - w / 2, s.y - 12, s.x + w / 2, s.y + 6);
          else ex(s.x - w / 2, s.y - 28, s.x + w / 2, s.y);
        }
      })
    );
    if (!isFinite(x0)) return { x: 0, y: 0, w: 100, h: 60 };
    const pad = 12;
    return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
  }

  /* ---------- SVG stage with tweening ---------- */
  const reduced = () => g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (name, attrs, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function Stage(svg) {
    const defs = el('defs', {}, svg);
    const mid = 'ah' + Math.random().toString(36).slice(2, 8);
    const marker = el('marker', { id: mid, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0L10 5L0 10z', class: 'vz-head' }, marker);
    const lines = el('g', {}, svg), shapes = el('g', {}, svg);
    const live = new Map();
    let raf = 0, active = [];

    function make(s) {
      const node = { s, cur: {}, from: {}, to: {}, op: 0, opFrom: 0, opTo: 1 };
      if (s.k === 'line') {
        node.g = el('g', { class: 'vz vz-line' }, lines);
        node.line = el('line', {}, node.g);
        node.lab = null;
      } else {
        node.g = el('g', { class: 'vz vz-' + s.k }, shapes);
        if (s.k === 'box') { node.rect = el('rect', { rx: 7 }, node.g); node.txt = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }, node.g); }
        if (s.k === 'circ') { node.c = el('circle', {}, node.g); node.txt = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }, node.g); node.subt = el('text', { 'text-anchor': 'middle', class: 'vz-sub' }, node.g); }
        if (s.k === 'text') node.txt = el('text', {}, node.g);
        if (s.k === 'ptr') { node.tri = el('path', {}, node.g); node.txt = el('text', { 'text-anchor': 'middle' }, node.g); }
      }
      return node;
    }
    const geom = (s) => (s.k === 'line' ? { x1: s.x1, y1: s.y1, x2: s.x2, y2: s.y2 } : s.k === 'box' ? { x: s.x, y: s.y, w: s.w, h: s.h } : s.k === 'circ' ? { x: s.x, y: s.y, r: s.r } : { x: s.x, y: s.y });

    function paint(n) {
      const c = n.cur, s = n.s;
      n.g.setAttribute('opacity', n.op.toFixed(3));
      if (s.k === 'line') {
        n.line.setAttribute('x1', c.x1); n.line.setAttribute('y1', c.y1); n.line.setAttribute('x2', c.x2); n.line.setAttribute('y2', c.y2);
        if (n.lab) { n.labBg.setAttribute('x', (c.x1 + c.x2) / 2 - 11); n.labBg.setAttribute('y', (c.y1 + c.y2) / 2 - 10); n.lab.setAttribute('x', (c.x1 + c.x2) / 2); n.lab.setAttribute('y', (c.y1 + c.y2) / 2); }
      } else if (s.k === 'box') {
        n.g.setAttribute('transform', `translate(${c.x} ${c.y})`);
        n.rect.setAttribute('width', Math.max(0, c.w)); n.rect.setAttribute('height', Math.max(0, c.h));
        n.txt.setAttribute('x', c.w / 2); n.txt.setAttribute('y', s.bar ? Math.max(c.h - 13, 10) : c.h / 2);
      } else if (s.k === 'circ') {
        n.g.setAttribute('transform', `translate(${c.x} ${c.y})`);
        n.c.setAttribute('r', c.r);
      } else {
        n.g.setAttribute('transform', `translate(${c.x} ${c.y})`);
      }
    }
    function dress(n, s) {
      n.s = s;
      n.g.setAttribute('class', `vz vz-${s.k}${s.state ? ' s-' + s.state : ''}${s.cls ? ' t-' + s.cls : ''}${s.bar ? ' is-bar' : ''}`);
      if (s.k === 'line') {
        if (s.arrow) n.line.setAttribute('marker-end', `url(#${mid})`); else n.line.removeAttribute('marker-end');
        if (s.label != null) {
          if (!n.lab) {
            n.labBg = el('rect', { width: 22, height: 20, rx: 5, class: 'vz-wbg' }, n.g);
            n.lab = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'vz-w' }, n.g);
          }
          n.lab.textContent = s.label;
        }
      } else if (s.k === 'box') {
        n.txt.textContent = s.text;
        const fit = Math.min(s.size || 19, s.h * 0.5, (s.w * 1.45) / Math.max(1, s.text.length));
        n.txt.setAttribute('font-size', Math.max(10, fit).toFixed(1));
      } else if (s.k === 'circ') {
        n.txt.textContent = s.text;
        const fit = Math.min(s.size || 16, (s.r * 2.5) / Math.max(1, s.text.length));
        n.txt.setAttribute('font-size', Math.max(10, fit).toFixed(1));
        n.subt.textContent = s.sub == null ? '' : s.sub;
        n.subt.setAttribute('y', s.r + 14);
      } else if (s.k === 'text') {
        n.txt.textContent = s.text;
        n.txt.setAttribute('text-anchor', s.anchor || 'middle');
        n.txt.setAttribute('font-size', s.size || 14);
      } else if (s.k === 'ptr') {
        n.txt.textContent = s.text;
        if (s.up) { n.tri.setAttribute('d', 'M0 -14L6 -5L-6 -5z'); n.txt.setAttribute('y', 8); }
        else { n.tri.setAttribute('d', 'M0 0L6 -9L-6 -9z'); n.txt.setAttribute('y', -13); }
      }
    }
    function tick(start, dur) {
      return function step(now) {
        const t = dur <= 0 ? 1 : Math.min(1, (now - start) / dur), e = ease(t);
        active.forEach((n) => {
          for (const k in n.to) n.cur[k] = n.from[k] + (n.to[k] - n.from[k]) * e;
          n.op = n.opFrom + (n.opTo - n.opFrom) * e;
          paint(n);
        });
        if (t < 1) raf = requestAnimationFrame(step);
        else {
          active.forEach((n) => { if (n.dying) { n.g.remove(); } });
          raf = 0;
        }
      };
    }
    return {
      setView(b) {
        svg.setAttribute('viewBox', `${b.x} ${b.y} ${b.w} ${b.h}`);
        svg.style.aspectRatio = `${b.w} / ${b.h}`;
        svg.style.maxWidth = Math.round(b.w * 1.35) + 'px';
      },
      clear() { live.forEach((n) => n.g.remove()); live.clear(); },
      show(frame, dur) {
        if (raf) cancelAnimationFrame(raf);
        active.forEach((n) => { if (n.dying) n.g.remove(); });
        active = [];
        if (reduced()) dur = 0;
        const seen = new Set();
        frame.shapes.forEach((s) => {
          seen.add(s.id);
          let n = live.get(s.id);
          const isNew = !n || n.s.k !== s.k;
          if (isNew) {
            if (n) n.g.remove();
            n = make(s);
            live.set(s.id, n);
            n.cur = geom(s);
            n.op = 0;
            dress(n, s);
            paint(n);
          } else dress(n, s);
          n.from = Object.assign({}, n.cur);
          n.to = geom(s);
          n.opFrom = n.op; n.opTo = 1; n.dying = false;
          n.g.parentNode.appendChild(n.g);
          active.push(n);
        });
        live.forEach((n, id) => {
          if (!seen.has(id)) {
            n.from = Object.assign({}, n.cur); n.to = {};
            n.opFrom = n.op; n.opTo = 0; n.dying = true;
            live.delete(id);
            active.push(n);
          }
        });
        raf = requestAnimationFrame(tick(performance.now(), dur));
      },
    };
  }

  /* ---------- the player ---------- */
  const SPEEDS = [['Slow', 1.7], ['Normal', 1], ['Fast', 0.55]];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let uid = 0;

  g.mountViz = function (host, def, opts = {}) {
    const id = 'viz' + ++uid;
    const hasInputs = (def.inputs || []).length > 0;
    const codeLines = def.code ? def.code.split('\n') : [];
    host.classList.add('player');
    host.innerHTML = `
      <div class="pl-top">
        <div class="pl-head"><h4>${esc(def.title)}</h4><p>${esc(def.intro || '')}</p></div>
        ${opts.done ? '' : ''}
      </div>
      <div class="pl-body ${codeLines.length ? '' : 'no-code'}">
        <div class="pl-left">
          <div class="pl-stage"><svg role="img" aria-label="${esc(def.title)} animation"></svg></div>
          <div class="pl-caption" aria-live="polite"><span class="pl-count"></span><p class="pl-msg"></p></div>
          <div class="pl-vars"></div>
          <div class="pl-controls">
            <button type="button" class="ic" data-a="reset" aria-label="Back to start" title="Back to start"><svg viewBox="0 0 24 24"><path d="M6 5v14M19 5l-10 7 10 7z"/></svg></button>
            <button type="button" class="ic" data-a="prev" aria-label="Previous step" title="Previous step"><svg viewBox="0 0 24 24"><path d="M16 5l-9 7 9 7z"/></svg></button>
            <button type="button" class="ic play" data-a="play" aria-label="Play"><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg><span>Play</span></button>
            <button type="button" class="ic" data-a="next" aria-label="Next step" title="Next step"><svg viewBox="0 0 24 24"><path d="M8 5l9 7-9 7z"/></svg></button>
            <input type="range" class="pl-scrub" min="0" value="0" aria-label="Scrub through steps" id="${id}-scrub">
            <label class="pl-speed"><span class="sr">Speed</span><select id="${id}-speed" aria-label="Speed">${SPEEDS.map(([n, v]) => `<option value="${v}" ${v === 1 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          </div>
        </div>
        ${codeLines.length ? `<div class="pl-code"><div class="pl-code-h">Python, running live</div><pre tabindex="0" aria-label="Python code">${codeLines.map((l, i) => `<div class="cl" data-l="${i + 1}"><span class="ln">${i + 1}</span><span class="lc">${g.highlightPy ? g.highlightPy(l) || ' ' : esc(l)}</span></div>`).join('')}</pre></div>` : ''}
      </div>
      ${hasInputs ? `<form class="pl-input" novalidate>
        <div class="pl-fields">${def.inputs.map((i, n) => {
          const fid = `${id}-i${n}`;
          if (i.type === 'choice') return `<label for="${fid}">${esc(i.label)}<select id="${fid}" data-k="${i.k}">${i.opts.map((o) => `<option ${o === i.def ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
          const val = Array.isArray(i.def) ? i.def.join(', ') : i.def;
          return `<label for="${fid}" class="${i.type === 'num' ? 'narrow' : ''}">${esc(i.label)}<input id="${fid}" data-k="${i.k}" value="${esc(val)}" autocomplete="off" spellcheck="false" inputmode="${i.type === 'word' || i.type === 'words' ? 'text' : 'text'}"></label>`;
        }).join('')}</div>
        <div class="pl-input-btns"><button type="submit" class="btn small">Run with this</button>${def.inputs.some((i) => i.type === 'nums' || i.type === 'num') ? '<button type="button" class="btn small ghost" data-a="rand">Random</button>' : ''}</div>
        <p class="pl-err" role="alert" hidden></p>
      </form>` : ''}`;

    const svg = host.querySelector('.pl-stage svg');
    const stage = Stage(svg);
    const q = (s) => host.querySelector(s);
    const msg = q('.pl-msg'), count = q('.pl-count'), vars = q('.pl-vars'), scrub = q('.pl-scrub'), speedSel = q('.pl-speed select'), playBtn = q('[data-a=play]');
    let frames = [], at = 0, timer = 0, playing = false, finished = false;

    function setPlayIcon() {
      playBtn.innerHTML = playing
        ? '<svg viewBox="0 0 24 24"><path d="M7 4h4v16H7zM13 4h4v16h-4z"/></svg><span>Pause</span>'
        : `<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg><span>${at >= frames.length - 1 && frames.length > 1 ? 'Replay' : 'Play'}</span>`;
      playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    }
    function render(dur) {
      const f = frames[at];
      if (!f) return;
      stage.show(f, dur);
      count.textContent = `Step ${at + 1} of ${frames.length}`;
      msg.innerHTML = f.msg ? g.inlineCode(f.msg) : '';
      vars.innerHTML = f.vars ? Object.entries(f.vars).map(([k, v]) => `<span class="var"><b>${esc(k)}</b><i>${esc(typeof v === 'string' ? v : JSON.stringify(v))}</i></span>`).join('') : '';
      scrub.value = at;
      scrub.style.setProperty('--fill', frames.length > 1 ? (at / (frames.length - 1)) * 100 + '%' : '0%');
      host.querySelectorAll('.cl.on').forEach((c) => c.classList.remove('on'));
      if (f.line) {
        (Array.isArray(f.line) ? f.line : [f.line]).forEach((l) => {
          const c = host.querySelector(`.cl[data-l="${l}"]`);
          if (c) {
            c.classList.add('on');
            const pre = c.parentNode;
            if (pre.scrollHeight > pre.clientHeight) pre.scrollTop = Math.max(0, c.offsetTop - pre.clientHeight / 2);
          }
        });
      }
      if (at >= frames.length - 1 && !finished) {
        finished = true;
        if (opts.onFinish) opts.onFinish();
      }
      setPlayIcon();
    }
    const speed = () => Number(speedSel.value) || 1;
    function schedule() {
      clearTimeout(timer);
      if (!playing) return;
      const f = frames[at], words = (f && f.msg ? f.msg.length : 0);
      const wait = (Math.min(3400, 900 + words * 22) ) * speed() * (opts.pace || 1);
      timer = setTimeout(() => {
        if (at < frames.length - 1) { at++; render(Math.min(520, 480 * speed())); schedule(); }
        else if (opts.loop) { at = 0; render(0); schedule(); }
        else { playing = false; setPlayIcon(); }
      }, wait);
    }
    const stop = () => { playing = false; clearTimeout(timer); setPlayIcon(); };
    function load(values) {
      frames = g.buildFrames(def, values);
      stage.clear();
      stage.setView(bboxOf(frames));
      at = 0;
      scrub.max = Math.max(0, frames.length - 1);
      render(0);
    }
    host.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'play') {
        if (playing) stop();
        else {
          if (at >= frames.length - 1) { at = 0; render(0); }
          playing = true; setPlayIcon(); schedule();
        }
      }
      if (a === 'prev') { stop(); if (at > 0) { at--; render(300); } }
      if (a === 'next') { stop(); if (at < frames.length - 1) { at++; render(380); } }
      if (a === 'reset') { stop(); at = 0; render(250); }
      if (a === 'rand') {
        def.inputs.forEach((i) => {
          const v = randomInput(i), inp = host.querySelector(`[data-k="${i.k}"]`);
          if (v != null && inp) inp.value = v;
        });
        host.querySelector('.pl-input').requestSubmit();
      }
    });
    scrub.addEventListener('input', () => { stop(); at = Number(scrub.value); render(160); });
    speedSel.addEventListener('change', () => { if (playing) schedule(); });
    const form = q('.pl-input');
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const err = q('.pl-err');
      try {
        const values = {};
        def.inputs.forEach((i) => {
          const inp = host.querySelector(`[data-k="${i.k}"]`);
          values[i.k] = parseInput(i, inp.value);
        });
        err.hidden = true;
        stop();
        load(values);
        playing = true; setPlayIcon(); schedule();
      } catch (ex) { err.textContent = ex.message; err.hidden = false; }
    });
    load(g.defaultValues(def));
    if (opts.autoplay && !reduced()) { playing = true; setPlayIcon(); schedule(); }
    return { stop, destroy() { stop(); } };
  };

  /* Tiny Python highlighter, line at a time. */
  const KW = new Set('def return if elif else for while in not and or is class import from as None True False pass break continue lambda with try except raise yield global nonlocal del assert'.split(' '));
  const BI = new Set('print len range enumerate sorted min max sum list dict set tuple str int float abs append pop map zip any all reversed self'.split(' '));
  g.highlightPy = function (line) {
    let out = '', i = 0;
    const re = /(#.*$)|("""[^"]*"""|'''[^']*'''|f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+)|(.)/g;
    let m;
    while ((m = re.exec(line))) {
      if (m[1]) out += `<span class="tk-c">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="tk-s">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="tk-n">${m[3]}</span>`;
      else if (m[4]) {
        if (KW.has(m[4])) out += `<span class="tk-k">${m[4]}</span>`;
        else if (BI.has(m[4])) out += `<span class="tk-b">${m[4]}</span>`;
        else out += m[4];
      } else out += esc(m[0]);
      if (m.index === re.lastIndex) re.lastIndex++;
    }
    return out;
  };
  g.inlineCode = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
})(window);
