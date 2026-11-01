/* Animations: spanning trees, negative edges, string matching, Fenwick trees, bitmask DP */
(function () {
  const { box, text, cells, grid, label, big, graph } = Sh;

  defViz('mst-kruskal', {
    title: "Kruskal: the cheapest way to connect everything",
    intro: 'Try the cheapest cables first. Keep a cable only if it joins two groups that are not yet connected.',
    code: 'def kruskal(n, edges):\n    parent = list(range(n))\n    def find(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n    total = 0\n    for w, a, b in sorted(edges):\n        ra, rb = find(a), find(b)\n        if ra != rb:\n            parent[ra] = rb\n            total += w\n    return total',
    build(_, add) {
      const N = { A: [30, 70], B: [150, 16], C: [280, 16], D: [90, 170], E: [220, 170], F: [340, 110] };
      const E = [['A', 'B', 4], ['A', 'D', 2], ['B', 'C', 6], ['B', 'D', 5], ['B', 'E', 3], ['C', 'E', 1], ['C', 'F', 7], ['D', 'E', 8], ['E', 'F', 9]];
      const sorted = E.slice().sort((x, y) => x[2] - y[2]);
      const parent = {}; Object.keys(N).forEach((k) => (parent[k] = k));
      const find = (x) => { while (parent[x] !== x) x = parent[x]; return x; };
      const kept = new Set(), dropped = new Set();
      let total = 0;
      const V = (cur, msg, ln) => add([
        graph('g', N, E, { edgeSt: (k) => (cur && k === cur[0] + '-' + cur[1] ? 'hot' : kept.has(k) ? 'path' : dropped.has(k) ? 'faint' : undefined), st: (n) => (cur && (n === cur[0] || n === cur[1]) ? 'compare' : undefined), sub: () => null }),
        label('l', 0, 222, 'Edges, cheapest first'),
        sorted.map((e, i) => { const k = e[0] + '-' + e[1]; return box('e' + k, (i % 5) * 72, 230 + Math.floor(i / 5) * 36, 68, 32, `${e[0]}${e[1]} ${e[2]}`, { size: 14, state: cur && k === cur[0] + '-' + cur[1] ? 'compare' : kept.has(k) ? 'done' : dropped.has(k) ? 'muted' : undefined }); }),
      ], msg, ln, { total });
      V(null, 'Six towers and nine possible cables. Sort the cables by price.', 9);
      sorted.forEach((e) => {
        const [a, b, w] = e, k = a + '-' + b, ra = find(a), rb = find(b);
        V(e, `Try ${a}–${b}, which costs ${w}. Are ${a} and ${b} already connected?`, [9, 10]);
        if (ra !== rb) {
          parent[ra] = rb; kept.add(k); total += w;
          V(null, `No, so keep it. Total cost is now ${total}.`, [11, 12, 13]);
        } else {
          dropped.add(k);
          V(null, `Yes. This cable would only make a loop, so skip it.`, 11);
        }
      });
      V(null, `All towers are connected with ${kept.size} cables, for a total of ${total}. A spanning tree always has V − 1 edges. Time O(E log E).`, 14);
    },
  });

  defViz('bellman-ford', {
    title: 'Bellman-Ford: shortest paths with negative edges',
    intro: 'Go over every edge, again and again. After V − 1 rounds all distances are final. If anything still improves, there is a negative cycle.',
    inputs: [{ k: 'g', label: 'Graph', type: 'choice', opts: ['Negative edge', 'Negative cycle'], def: 'Negative edge' }],
    code: 'def bellman_ford(n, edges, start):\n    dist = [float("inf")] * n\n    dist[start] = 0\n    for _ in range(n - 1):\n        for u, v, w in edges:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n    for u, v, w in edges:\n        if dist[u] + w < dist[v]:\n            return None  # negative cycle\n    return dist',
    build({ g }, add) {
      const N = { A: [30, 95], B: [165, 22], C: [165, 170], D: [310, 22], E: [310, 170] };
      const E = [['A', 'B', 4], ['A', 'C', 5], ['C', 'B', -3], ['B', 'D', 2], ['D', 'E', 3], ['C', 'E', 6]];
      if (g === 'Negative cycle') E.push(['E', 'C', -10]);
      const names = Object.keys(N), dist = { A: 0 };
      const V = (cur, st, msg, ln, vars) => add(graph('g', N, E, { directed: 1, r: 19, edgeSt: (k) => (cur && k === cur[0] + '-' + cur[1] ? st : undefined), st: (n) => (cur && n === cur[1] ? 'compare' : cur && n === cur[0] ? 'active' : dist[n] != null ? 'queued' : undefined), sub: (n) => (dist[n] != null ? dist[n] : '∞') }), msg, ln, vars);
      V(null, null, 'Start at A with distance 0. Everything else is infinitely far. Edge C → B costs −3, which Dijkstra cannot handle.', [2, 3], { round: 0 });
      for (let round = 1; round < names.length; round++) {
        let changed = false;
        E.forEach((e) => {
          const [u, v, w] = e;
          if (dist[u] == null) return;
          const nd = dist[u] + w;
          if (dist[v] == null || nd < dist[v]) {
            const old = dist[v];
            dist[v] = nd; changed = true;
            V(e, 'path', `${u} → ${v}: ${dist[u]} + (${w}) = ${nd}, better than ${old == null ? '∞' : old}. Update ${v}.`, [6, 7], { round });
          }
        });
        if (!changed) { V(null, null, `Nothing changed in round ${round}, so every distance is final and we can stop early.`, 4, { round }); break; }
        V(null, null, `Round ${round} finished. After round k, paths using up to k edges are correct.`, 4, { round });
      }
      const bad = E.find(([u, v, w]) => dist[u] != null && dist[u] + w < dist[v]);
      if (bad) V(bad, 'hot', `Extra check: ${bad[0]} → ${bad[1]} still improves after V − 1 rounds. That proves a negative cycle, so no shortest path exists.`, [8, 9, 10], { result: 'None' });
      else V(null, null, 'Extra check: no edge improves anything, so there is no negative cycle. Time O(V × E), slower than Dijkstra but safe with negative edges.', 11);
    },
  });

  const LOWER = { only: /^[a-z]+$/, onlyMsg: 'use lowercase letters only.' };
  defViz('kmp-search', {
    title: 'KMP: never re-read the text',
    intro: 'When a match fails, the pattern already knows how much of itself still lines up, so it jumps ahead while the text pointer stays put.',
    inputs: [{ k: 't', label: 'Text', type: 'word', def: 'abxabcabcaby', max: 13, ...LOWER }, { k: 'p', label: 'Pattern', type: 'word', def: 'abcaby', max: 7, ...LOWER }],
    code: 'def build_lps(p):\n    lps = [0] * len(p)\n    k = 0\n    for i in range(1, len(p)):\n        while k and p[i] != p[k]:\n            k = lps[k - 1]\n        if p[i] == p[k]:\n            k += 1\n        lps[i] = k\n    return lps\n\ndef kmp(t, p):\n    lps = build_lps(p)\n    j = 0\n    for i, ch in enumerate(t):\n        while j and ch != p[j]:\n            j = lps[j - 1]\n        if ch == p[j]:\n            j += 1\n        if j == len(p):\n            return i - j + 1\n    return -1',
    build({ t, p }, add) {
      const T = t.split(''), P = p.split(''), S = 30, G = 3, lps = P.map(() => '');
      const L = (hot) => [label('ll', 0, 170, 'lps: longest prefix that is also a suffix'), cells('lp', P, { y: 178, s: S, gap: G, idx: false }), cells('lv', lps, { y: 211, s: S, gap: G, idx: false, st: (i) => (i === hot ? 'compare' : lps[i] === '' ? 'empty' : undefined) })];
      let k = 0;
      lps[0] = 0;
      add([L(0)], 'First, study the pattern. `lps[i]` says how many characters at the end of `p[0..i]` also appear at its start. The first entry is always 0.', 2, { k });
      for (let i = 1; i < P.length; i++) {
        while (k && P[i] !== P[k]) k = lps[k - 1];
        if (P[i] === P[k]) k++;
        lps[i] = k;
        add([L(i)], k ? `\`p[${i}]\`: the last ${k} character${k > 1 ? 's' : ''} also start the pattern, so \`lps[${i}] = ${k}\`.` : `\`p[${i}]\`: no ending here matches the start, so \`lps[${i}] = 0\`.`, [5, 7, 9], { i, k });
      }
      let j = 0, steps = 0, found = -1;
      const X = (j0, i0) => (i0 - j0) * (S + G);
      const V = (i, st, msg, ln) => add([cells('t', T, { y: 26, s: S, gap: G, ptr: { i }, st: (q) => (q === i ? st : q < i ? 'muted' : undefined) }), label('pl', 0, 96, 'pattern'), cells('m', P, { x: Math.max(0, X(j, i)), y: 102, s: S, gap: G, idx: false, ptr: {}, st: (q) => (q < j ? 'done' : q === j ? st : undefined) }), L()], msg, ln, { i, j, comparisons: steps });
      for (let i = 0; i < T.length; i++) {
        while (j && T[i] !== P[j]) {
          steps++;
          V(i, 'bad', `\`${T[i]}\` ≠ \`${P[j]}\`. Don't move \`i\` back. \`lps[${j - 1}] = ${lps[j - 1]}\` tells the pattern where to continue.`, [16, 17]);
          j = lps[j - 1];
        }
        steps++;
        if (T[i] === P[j]) {
          V(i, 'done', `\`${T[i]}\` matches \`${P[j]}\`.`, [18, 19]);
          j++;
        } else V(i, 'bad', `\`${T[i]}\` ≠ \`${P[j]}\`, and the pattern is at its start, so move on to the next character.`, 15);
        if (j === P.length) {
          found = i - j + 1;
          j = lps[j - 1];
          add([cells('t', T, { y: 26, s: S, gap: G, st: (q) => (q >= found && q <= i ? 'done' : 'muted') }), L()], `Found the pattern at index ${found}. \`i\` never moved backwards, so time is O(n + m).`, [20, 21], { answer: found, comparisons: steps });
          return;
        }
      }
      add([cells('t', T, { y: 26, s: S, gap: G, st: () => 'muted' }), L()], `The text ran out, so the pattern isn't there. That took ${steps} comparisons for a text of ${T.length}. Time O(n + m).`, 22, { answer: -1, comparisons: steps });
    },
  });

  defViz('fenwick-ops', {
    title: 'Fenwick tree: running totals using binary',
    intro: 'Each slot stores the sum of a small range, sized by the lowest 1 bit of its index. Updates and prefix sums each touch about log n slots.',
    inputs: [{ k: 'arr', label: 'Numbers', type: 'nums', def: [3, 2, 5, 1, 4, 7, 6, 2], min: 2, max: 8, randHi: 20 }, { k: 'i', label: 'Add to position (from 1)', type: 'num', def: 3, lo: 1, hi: 8 }, { k: 'd', label: 'Amount', type: 'num', def: 4, lo: 0, hi: 20 }, { k: 'q', label: 'Sum of first', type: 'num', def: 7, lo: 1, hi: 8 }],
    code: 'class Fenwick:\n    def __init__(self, n):\n        self.t = [0] * (n + 1)\n\n    def add(self, i, delta):\n        while i < len(self.t):\n            self.t[i] += delta\n            i += i & -i\n\n    def prefix(self, i):\n        s = 0\n        while i > 0:\n            s += self.t[i]\n            i -= i & -i\n        return s',
    build({ arr, i, d, q }, add) {
      const n = arr.length, t = Array(n + 1).fill(0), S = 50, G = 5, a = arr.slice();
      i = Math.min(i, n); q = Math.min(q, n);
      const bin = (x) => x.toString(2).padStart(4, '0');
      const V = (hot, st, msg, ln, vars) => add([
        label('a', 0, 10, 'nums, counting from 1'),
        cells('n', a, { y: 18, s: S, gap: G, idx: false }),
        label('b', 0, 92, 't: each slot sums the range shown below it'),
        cells('t', t.slice(1), { y: 100, s: S, gap: G, idx: false, st: (k) => (hot && hot.includes(k + 1) ? st : undefined) }),
        t.slice(1).map((_, k) => { const x = k + 1, low = x & -x; return [text('r' + x, k * (S + G) + S / 2, 166, x - low + 1 === x ? `${x}` : `${x - low + 1}–${x}`, { cls: 'idx', size: 12 }), text('m' + x, k * (S + G) + S / 2, 182, bin(x), { cls: 'idx', size: 11 })]; }),
      ], msg, ln, vars);
      V(null, null, 'Look at the binary labels. Slot 4 is `0100`: its lowest 1 bit is worth 4, so it covers 4 numbers. Slot 6 is `0110`: its lowest bit is worth 2, so it covers 2 numbers.', 3);
      arr.forEach((v, idx) => {
        const path = [];
        for (let x = idx + 1; x <= n; x += x & -x) { t[x] += v; path.push(x); }
        V(path, 'active', `Add \`${v}\` at position ${idx + 1}. It updates slots ${path.join(', ')}, every slot whose range includes this position.`, [6, 7, 8], { position: idx + 1 });
      });
      let x = i; const path = [];
      a[i - 1] += d;
      while (x <= n) { path.push(x); x += x & -x; }
      path.forEach((s, k) => {
        t[s] += d;
        V(path.slice(0, k + 1), 'compare', k === 0 ? `Add ${d} to position ${i}. Start at slot ${s}.` : `Add the lowest bit to move up: ${path[k - 1]} + ${path[k - 1] & -path[k - 1]} = ${s}.`, [7, 8], { i: s });
      });
      V(path, 'done', `The update touched ${path.length} slots out of ${n}. That's O(log n).`, 8);
      let s = 0; const qp = [];
      for (let y = q; y > 0; y -= y & -y) {
        s += t[y]; qp.push(y);
        const nx = y - (y & -y);
        V(qp.slice(), 'compare', `Prefix sum of the first ${q}: add slot ${y} (${t[y]}), giving ${s}. ${nx ? `Remove the lowest bit: ${y} − ${y & -y} = ${nx}.` : 'Removing the lowest bit reaches 0, so stop.'}`, [13, 14], { i: y, s });
      }
      V(qp, 'done', `The first ${q} numbers add up to ${s}, using just ${qp.length} slots. Same speed as a segment tree, with much less code.`, 15, { answer: s });
    },
  });

  const MAPS = { 'Square route': [[0, 2, 9, 10], [1, 0, 6, 4], [15, 7, 0, 8], [6, 3, 12, 0]], 'Even distances': [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]] };
  defViz('bitmask-dp', {
    title: 'Bitmask DP: remembering which places you visited',
    intro: 'A number can stand for a set: bit i is on if city i was visited. So "visited these, standing here" fits in a table.',
    inputs: [{ k: 'm', label: 'Distances', type: 'choice', opts: Object.keys(MAPS), def: 'Square route' }],
    code: 'def shortest_tour(d):\n    n = len(d)\n    INF = float("inf")\n    dp = [[INF] * n for _ in range(1 << n)]\n    dp[1][0] = 0\n    for mask in range(1 << n):\n        for last in range(n):\n            if dp[mask][last] == INF:\n                continue\n            for nxt in range(n):\n                if mask >> nxt & 1:\n                    continue\n                new = mask | 1 << nxt\n                cost = dp[mask][last] + d[last][nxt]\n                dp[new][nxt] = min(dp[new][nxt], cost)\n    full = (1 << n) - 1\n    return min(dp[full][i] + d[i][0] for i in range(n))',
    build({ m }, add) {
      const d = MAPS[m], n = 4, masks = [];
      for (let k = 1; k < 16; k += 2) masks.push(k);
      const dp = {}; masks.forEach((k) => (dp[k] = Array(n).fill(null)));
      dp[1][0] = 0;
      const o = { s: 32, w: 46, x: 70, y: 24, colL: ['at 0', 'at 1', 'at 2', 'at 3'], rowL: masks.map((k) => k.toString(2).padStart(4, '0')) };
      const V = (from, to, msg, ln, vars) => add(grid('g', masks.map((k) => dp[k].map((v) => (v == null ? '' : v))), { ...o, st: (r, c) => (to && masks[r] === to[0] && c === to[1] ? 'done' : from && masks[r] === from[0] && c === from[1] ? 'compare' : dp[masks[r]][c] == null ? 'empty' : undefined) }), msg, ln, vars);
      V([1, 0], null, 'Each row label is a set of visited cities, read from the right: `0101` means cities 0 and 2. Start at city 0 with cost 0.', 5);
      masks.forEach((mask) => {
        for (let last = 0; last < n; last++) {
          if (dp[mask][last] == null) continue;
          for (let nxt = 0; nxt < n; nxt++) {
            if (mask >> nxt & 1) continue;
            const nw = mask | (1 << nxt), c = dp[mask][last] + d[last][nxt], old = dp[nw][nxt];
            if (old == null || c < old) {
              dp[nw][nxt] = c;
              V([mask, last], [nw, nxt], `From \`${mask.toString(2).padStart(4, '0')}\` at city ${last}, go to city ${nxt}: ${dp[mask][last]} + ${d[last][nxt]} = ${c}${old != null ? `, beating ${old}` : ''}.`, [13, 14, 15], { mask: mask.toString(2).padStart(4, '0'), last, nxt });
            } else V([mask, last], [nw, nxt], `Going to city ${nxt} costs ${c}, which doesn't beat ${old}. Keep the old value.`, 15, { mask: mask.toString(2).padStart(4, '0'), last, nxt });
          }
        }
      });
      let best = Infinity, end = 0;
      for (let i = 1; i < n; i++) if (dp[15][i] + d[i][0] < best) { best = dp[15][i] + d[i][0]; end = i; }
      V([15, end], null, `All cities visited. Add the trip home: the best tour costs ${best}, ending at city ${end}. Trying every order takes n! steps, while this takes O(2ⁿ × n²).`, [16, 17], { answer: best });
    },
  });
})();
