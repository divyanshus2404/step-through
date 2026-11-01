// Loads the site's JS in node, checks structure and animations with default + edge inputs, dumps data for python and LeetCode checks.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = process.argv[2] || path.join(__dirname, '..'), out = process.argv[3] || path.join(require('os').tmpdir(), 'step-through-data.json');
const w = {}; w.window = w; w.console = console; w.Math = Math; w.JSON = JSON;
const ctx = vm.createContext(w);
['engine', 'viz-1', 'viz-2', 'viz-3', 'content-1', 'content-2', 'content-3'].forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(root, 'js', f + '.js'), 'utf8'), ctx, { filename: f });
});
const { VIZ, TOPICS, STAGES } = w;
let errs = 0;
const bad = (m) => { errs++; console.log('FAIL', m); };

const ids = new Set();
const usedViz = new Set();
TOPICS.forEach((t) => {
  if (ids.has(t.id)) bad('dup topic ' + t.id);
  ids.add(t.id);
  if (!STAGES.find((s) => s.id === t.stage)) bad('stage ' + t.id);
  for (const f of ['analogy', 'tagline', 'title']) if (!t[f]) bad(t.id + ' missing ' + f);
  if (t.learn.length < 3) bad(t.id + ' short learn');
  if (!t.anims.length) bad(t.id + ' no anims');
  t.anims.forEach((a) => { if (!VIZ[a]) bad(t.id + ' unknown viz ' + a); usedViz.add(a); });
  if (t.quiz.length < 4) bad(t.id + ' quiz');
  t.quiz.forEach((q, i) => { if (q.a < 0 || q.a >= q.o.length || !q.why) bad(`${t.id} q${i}`); });
  if (t.coding.length < 2) bad(t.id + ' coding');
  if (t.homework.length < 3) bad(t.id + ' hw');
  if (t.reallife.length < 2) bad(t.id + ' real');
  if (t.leetcode.length < 3) bad(t.id + ' lc');
  if (!t.code.length) bad(t.id + ' code');
});
Object.keys(VIZ).forEach((k) => { if (!usedViz.has(k)) console.log('unused viz', k); });

// Animations: default inputs plus stress inputs.
function check(def, vals, label) {
  let fr;
  try { fr = w.buildFrames(def, vals); } catch (e) { bad(`${def.id} ${label}: threw ${e.message}`); return; }
  if (!fr.length) bad(`${def.id} ${label}: no frames`);
  const lines = def.code ? def.code.split('\n').length : 0;
  fr.forEach((f, i) => {
    const seen = new Set();
    f.shapes.forEach((s) => {
      if (!s.id) bad(`${def.id} ${label} f${i}: shape without id`);
      if (seen.has(s.id)) bad(`${def.id} ${label} f${i}: dup id ${s.id}`);
      seen.add(s.id);
      for (const k of ['x', 'y', 'w', 'h', 'r', 'x1', 'y1', 'x2', 'y2']) if (k in s && !Number.isFinite(s[k])) bad(`${def.id} ${label} f${i}: ${s.id}.${k}=${s[k]}`);
      if (/undefined|NaN/.test(s.text || '')) bad(`${def.id} ${label} f${i}: text ${s.text}`);
    });
    if (!f.msg) bad(`${def.id} ${label} f${i}: no msg`);
    if (/undefined|NaN/.test(f.msg || '')) bad(`${def.id} ${label} f${i}: msg ${f.msg}`);
    [].concat(f.line || []).forEach((l) => { if (l > lines) bad(`${def.id} ${label} f${i}: line ${l} > ${lines}`); });
  });
  return fr.length;
}
const counts = {};
Object.values(VIZ).forEach((def) => {
  const d = w.defaultValues(def);
  counts[def.id] = check(def, d, 'default');
  // edge inputs
  for (let t = 0; t < 40; t++) {
    const v = {};
    def.inputs.forEach((i) => {
      const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
      if (i.type === 'nums') { const lo = i.lo ?? 0, hi = i.hi ?? 99, n = r(i.min ?? 1, i.max ?? 9); v[i.k] = Array.from({ length: n }, () => r(lo, t % 2 ? Math.min(hi, lo + 3) : hi)); }
      else if (i.type === 'num') v[i.k] = t % 3 === 0 ? (i.lo ?? 0) : t % 3 === 1 ? (i.hi ?? 99) : r(i.lo ?? 0, i.hi ?? 99);
      else if (i.type === 'choice') v[i.k] = i.opts[t % i.opts.length];
      else if (i.type === 'word') { const al = i.only && /\(\)/.test(String(i.only)) ? '()[]{}' : 'abcab'; const n = r(i.min ?? 1, i.max ?? 8); v[i.k] = Array.from({ length: n }, () => al[r(0, al.length - 1)]).join(''); }
      else if (i.type === 'words') { const n = r(i.min ?? 1, i.max ?? 6); v[i.k] = Array.from({ length: n }, () => Array.from({ length: r(1, i.maxLen || 5) }, () => 'abc'[r(0, 2)]).join('')); }
    });
    check(def, v, 'rand' + t + ' ' + JSON.stringify(v));
  }
});
// default input parse check
Object.values(VIZ).forEach((def) => def.inputs.forEach((i) => {
  if (i.type === 'choice') return;
  try { w.parseVizInput(i, Array.isArray(i.def) ? i.def.join(',') : i.def); } catch (e) { bad(`${def.id} default input: ${e.message}`); }
}));
console.log('topics', TOPICS.length, 'viz', Object.keys(VIZ).length, 'frames(max)', Math.max(...Object.values(counts)), 'errors', errs);
fs.writeFileSync(out, JSON.stringify(TOPICS.map((t) => ({ id: t.id, code: t.code, coding: t.coding, leetcode: t.leetcode }))));
console.log('data written to', out);
process.exit(errs ? 1 : 0);
