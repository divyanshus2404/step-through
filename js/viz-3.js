/* Animations: trees, heaps, graphs, greedy, backtracking, DP, advanced */
(function () {
  const { box, circ, line, text, cells, grid, stack, label, big, tree, graph, edgeBetween } = Sh;

  /* level-order list to tree nodes */
  const fromLevel = (arr) => {
    const ns = arr.map((v, i) => ({ id: i, v }));
    ns.forEach((n, i) => { n.l = ns[2 * i + 1] || null; n.r = ns[2 * i + 2] || null; });
    return ns[0] || null;
  };

  defViz('tree-traversals', {
    title: 'Four ways to walk a tree',
    intro: 'Pre-order visits a node before its children, in-order between them, post-order after. Level-order goes row by row.',
    inputs: [{ k: 'order', label: 'Order', type: 'choice', opts: ['Pre-order', 'In-order', 'Post-order', 'Level-order'], def: 'In-order' }, { k: 'arr', label: 'Values, row by row', type: 'nums', def: [4, 2, 6, 1, 3, 5, 7], min: 1, max: 7 }],
    code: 'def preorder(n):\n    if not n: return\n    visit(n); preorder(n.left); preorder(n.right)\n\ndef inorder(n):\n    if not n: return\n    inorder(n.left); visit(n); inorder(n.right)\n\ndef postorder(n):\n    if not n: return\n    postorder(n.left); postorder(n.right); visit(n)\n\ndef level_order(root):\n    q = deque([root])\n    while q:\n        n = q.popleft(); visit(n)\n        if n.left: q.append(n.left)\n        if n.right: q.append(n.right)',
    build({ order, arr }, add) {
      const root = fromLevel(arr), done = new Set(), out = [];
      const lines = { 'Pre-order': 3, 'In-order': 7, 'Post-order': 11, 'Level-order': 16 };
      const snap = (act, msg, q) => add([tree('t', root, { dx: 54, dy: 68, r: 20, st: (id) => (id === act ? 'active' : done.has(id) ? 'done' : undefined) }), label('o', 0, 250, 'visit order'), cells('o', out, { y: 258, s: 38, gap: 4, idx: false, st: (i) => (i === out.length - 1 ? 'active' : undefined) })], msg, lines[order], q ? { queue: q } : undefined);
      snap(null, `${order} traversal starts at the root.`);
      const visit = (n, why) => { done.add(n.id); out.push(n.v); snap(n.id, why); };
      if (order === 'Level-order') {
        const q = [root];
        while (q.length) {
          const n = q.shift();
          visit(n, `Take \`${n.v}\` from the front of the queue and visit it.`);
          if (n.l) q.push(n.l);
          if (n.r) q.push(n.r);
          if (n.l || n.r) snap(n.id, 'Its children join the back of the queue, so they wait for the current row to finish.', q.map((x) => x.v).join(', ') || 'empty');
        }
      } else {
        (function walk(n) {
          if (!n) return;
          if (order === 'Pre-order') visit(n, `Visit \`${n.v}\` first, then go to its children.`);
          else snap(n.id, `At \`${n.v}\`. ${order === 'In-order' ? 'Finish its left side first.' : 'Finish both children first.'}`);
          walk(n.l);
          if (order === 'In-order') visit(n, `Left side finished, so visit \`${n.v}\`.`);
          walk(n.r);
          if (order === 'Post-order') visit(n, `Both children finished, so visit \`${n.v}\`.`);
        })(root);
      }
      snap(null, `Visit order: ${out.join(', ')}. Every node is visited once: O(n).${order === 'In-order' ? ' On a BST, in-order comes out sorted.' : ''}`);
    },
  });

  const bstInsert = (root, v, id) => { if (!root) return { id, v }; if (v < root.v) root.l = bstInsert(root.l, v, id); else if (v > root.v) root.r = bstInsert(root.r, v, id); return root; };

  defViz('bst-ops', {
    title: 'Binary search tree: insert and search',
    intro: 'At each node, smaller values go left and larger values go right. Half the tree can vanish with each comparison.',
    inputs: [{ k: 'arr', label: 'Insert in order', type: 'nums', def: [8, 3, 10, 1, 6, 14, 4], min: 1, max: 8 }, { k: 't', label: 'Search for', type: 'num', def: 6, lo: 0, hi: 99 }],
    code: 'def insert(node, val):\n    if not node:\n        return Node(val)\n    if val < node.val:\n        node.left = insert(node.left, val)\n    elif val > node.val:\n        node.right = insert(node.right, val)\n    return node\n\ndef search(node, val):\n    while node and node.val != val:\n        node = node.left if val < node.val else node.right\n    return node',
    build({ arr, t }, add) {
      let root = null;
      const vw = (st) => tree('t', root, { dx: 46, dy: 62, r: 19, st });
      arr.forEach((v, i) => {
        if (!root) { root = { id: i, v }; add(vw((id) => (id === i ? 'done' : undefined)), `\`${v}\` becomes the root.`, [2, 3]); return; }
        let cur = root;
        while (cur) {
          if (v === cur.v) { add(vw((id) => (id === cur.id ? 'bad' : undefined)), `\`${v}\` is already here, so we skip duplicates.`, 8); return; }
          const c = cur;
          add(vw((id) => (id === c.id ? 'compare' : undefined)), `Insert ${v}: compare with ${cur.v}. ${v < cur.v ? 'Smaller, go left.' : 'Larger, go right.'}`, v < cur.v ? [4, 5] : [6, 7], { val: v, node: cur.v });
          const nx = v < cur.v ? cur.l : cur.r;
          if (!nx) break;
          cur = nx;
        }
        root = bstInsert(root, v, i);
        add(vw((id) => (id === i ? 'done' : undefined)), `That spot is empty, so \`${v}\` goes there.`, [2, 3], { val: v });
      });
      let cur = root, steps = 0;
      while (cur) {
        steps++;
        const c = cur;
        if (cur.v === t) { add(vw((id) => (id === c.id ? 'done' : undefined)), `Found ${t} after ${steps} comparison${steps > 1 ? 's' : ''}. A balanced tree takes O(log n). A lopsided one can take O(n).`, 13, { node: cur.v, steps }); return; }
        add(vw((id) => (id === c.id ? 'compare' : undefined)), `Search ${t}: compare with ${cur.v}. ${t < cur.v ? 'Go left.' : 'Go right.'}`, [11, 12], { val: t, node: cur.v, steps });
        cur = t < cur.v ? cur.l : cur.r;
      }
      add(vw(), `We fell off the tree, so ${t} isn't here. That took ${steps} comparisons.`, 13, { steps });
    },
  });

  defViz('bst-delete', {
    title: 'Binary search tree: delete, three cases',
    intro: 'A leaf just goes. A node with one child gets replaced by that child. A node with two children takes the value of its in-order successor.',
    inputs: [{ k: 'arr', label: 'Build from', type: 'nums', def: [8, 3, 10, 1, 6, 14, 4, 7], min: 2, max: 9 }, { k: 't', label: 'Delete', type: 'num', def: 3, lo: 0, hi: 99 }],
    code: 'def delete(node, val):\n    if not node:\n        return None\n    if val < node.val:\n        node.left = delete(node.left, val)\n    elif val > node.val:\n        node.right = delete(node.right, val)\n    else:\n        if not node.left: return node.right\n        if not node.right: return node.left\n        succ = node.right\n        while succ.left:\n            succ = succ.left\n        node.val = succ.val\n        node.right = delete(node.right, succ.val)\n    return node',
    build({ arr, t }, add) {
      let root = null;
      arr.forEach((v, i) => (root = bstInsert(root, v, i)));
      const vw = (st, r) => tree('t', r || root, { dx: 46, dy: 62, r: 19, st });
      let par = null, cur = root;
      add(vw(), `Delete ${t}. First, find it.`, 1);
      while (cur && cur.v !== t) {
        const c = cur;
        add(vw((id) => (id === c.id ? 'compare' : undefined)), `${t} ${t < cur.v ? '<' : '>'} ${cur.v}. Go ${t < cur.v ? 'left' : 'right'}.`, t < cur.v ? [4, 5] : [6, 7], { node: cur.v });
        par = cur; cur = t < cur.v ? cur.l : cur.r;
      }
      if (!cur) { add(vw(), `${t} isn't in the tree. Nothing to delete.`, [2, 3]); return; }
      const relink = (nw) => { if (!par) root = nw; else if (par.l === cur) par.l = nw; else par.r = nw; };
      const tgt = cur;
      add(vw((id) => (id === tgt.id ? 'bad' : undefined)), `Found ${t}. It has ${(cur.l ? 1 : 0) + (cur.r ? 1 : 0)} child${cur.l && cur.r ? 'ren' : cur.l || cur.r ? '' : 'ren'}.`, 8);
      if (cur.l && cur.r) {
        let sp = cur, s = cur.r;
        const hilite = () => { const S = s; return vw((id) => (id === tgt.id ? 'bad' : id === S.id ? 'compare' : undefined)); };
        add(hilite(), 'Two children. Use the in-order successor: the smallest value in the right subtree.', 11, { succ: s.v });
        while (s.l) { sp = s; s = s.l; add(hilite(), 'Keep going left to reach the smallest.', [12, 13], { succ: s.v }); }
        const sv = s.v;
        tgt.v = sv;
        if (sp.l === s) sp.l = s.r; else sp.r = s.r;
        add(vw((id) => (id === tgt.id ? 'done' : undefined)), `Copy ${sv} up into this node and remove the old ${sv} lower down. The BST order still holds.`, [14, 15], { val: sv });
      } else {
        const ch = cur.l || cur.r;
        relink(ch);
        if (!root) { add([label('e', 0, 30, 'The tree is now empty.')], 'That was the only node.', 9); return; }
        add(vw((id) => (ch && id === ch.id ? 'done' : undefined)), ch ? `One child: \`${ch.v}\` takes the removed node's place.` : 'A leaf has nothing below, so it simply goes.', ch ? 9 : 9);
      }
      add(vw(() => 'done'), 'Done. In-order traversal still gives sorted values.', 16);
    },
  });

  /* heap in two views */
  function heapView(h, hot, st2) {
    const W = 360, shapes = [];
    const pos = (i) => { const l = Math.floor(Math.log2(i + 1)), first = 2 ** l - 1; return [((i - first + 0.5) / 2 ** l) * W, 22 + l * 58]; };
    h.forEach((x, i) => { if (i) { const [x1, y1] = pos(i), [x2, y2] = pos((i - 1) >> 1); shapes.push(edgeBetween('e' + i, x2, y2, x1, y1, 18)); } });
    h.forEach((x, i) => { const [cx, cy] = pos(i); shapes.push(circ('hn' + x.id, cx, cy, 18, x.v, { state: stateOf(i, hot) })); });
    const arrY = 22 + 4 * 58 - 22;
    shapes.push(label('al', 0, arrY - 8, 'The same heap stored as a plain list'));
    shapes.push(cells('ha', h.map((x) => x.v), { ids: h.map((x) => x.id), y: arrY, s: 36, gap: 3, st: (i) => stateOf(i, hot) }));
    return shapes;
  }
  const stateOf = (i, hot) => (hot ? hot[i] : undefined);

  defViz('heap-ops', {
    title: 'Min-heap: push and pop',
    intro: 'The smallest value always sits on top. A parent is never larger than its children. Push bubbles up, pop sinks down.',
    inputs: [{ k: 'arr', label: 'Push in order', type: 'nums', def: [7, 3, 9, 1, 5, 2], min: 2, max: 8 }],
    code: 'import heapq\n\nh = []\nfor v in values:\n    heapq.heappush(h, v)   # bubble up\n\nsmallest = heapq.heappop(h)  # sink down\n\n# children of i: 2*i + 1 and 2*i + 2\n# parent of i: (i - 1) // 2',
    build({ arr }, add) {
      const h = [];
      add(heapView(h), 'An empty heap. It looks like a tree but lives in a list.', 3, { size: 0 });
      arr.forEach((v, id) => {
        h.push({ v, id });
        let i = h.length - 1;
        add(heapView(h, { [i]: 'active' }), `Push ${v}: add it to the end of the list, the next free spot in the tree.`, 5, { i });
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (h[p].v <= h[i].v) { add(heapView(h, { [i]: 'done', [p]: 'compare' }), `Parent ${h[p].v} ≤ ${h[i].v}. The rule holds, so stop.`, 5, { i, parent: p }); break; }
          add(heapView(h, { [i]: 'active', [p]: 'compare' }), `Parent ${h[p].v} > ${h[i].v}. Rule broken, so swap upward.`, 5, { i, parent: p });
          [h[p], h[i]] = [h[i], h[p]];
          i = p;
        }
      });
      add(heapView(h, { 0: 'done' }), `The smallest value, ${h[0].v}, is on top. Reading it is O(1).`, 7, { top: h[0].v });
      const min = h[0].v;
      add(heapView(h, { 0: 'bad', [h.length - 1]: 'active' }), 'Pop: take the top, then move the last item into its place.', 7, { popped: min });
      const last = h.pop();
      if (h.length) {
        h[0] = last;
        let i = 0;
        add(heapView(h, { 0: 'active' }), `\`${last.v}\` is now on top, probably too big. Let it sink.`, 7);
        while (true) {
          const l = 2 * i + 1, r = 2 * i + 2;
          let s = i;
          if (l < h.length && h[l].v < h[s].v) s = l;
          if (r < h.length && h[r].v < h[s].v) s = r;
          if (s === i) break;
          add(heapView(h, { [i]: 'active', [s]: 'compare' }), `Its smaller child is ${h[s].v}. Swap downward.`, 7, { i, child: s });
          [h[i], h[s]] = [h[s], h[i]];
          i = s;
        }
        add(heapView(h, { [i]: 'done', 0: 'done' }), `Rule restored after at most log n swaps. New top: ${h[0].v}. Push and pop are O(log n).`, 7, { top: h[0].v, popped: min });
      }
    },
  });

  const GN = { A: [40, 40], B: [160, 20], C: [290, 40], D: [90, 150], E: [220, 150], F: [340, 165] };
  const GE = [['A', 'B'], ['A', 'D'], ['B', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'E'], ['C', 'F'], ['E', 'F']];
  const adj = (edges) => { const a = {}; edges.forEach(([x, y]) => { (a[x] = a[x] || []).push(y); (a[y] = a[y] || []).push(x); }); Object.values(a).forEach((l) => l.sort()); return a; };
  const startInput = { k: 's', label: 'Start at', type: 'choice', opts: Object.keys(GN), def: 'A' };

  defViz('graph-repr', {
    title: 'Turning a picture into a dict',
    intro: 'A graph is nodes plus connections. An adjacency list stores, for each node, who its neighbours are.',
    code: 'graph = {}\nfor a, b in edges:\n    graph.setdefault(a, []).append(b)\n    graph.setdefault(b, []).append(a)',
    build(_, add) {
      const a = {}, nodes = Object.keys(GN);
      const tbl = (hot) => nodes.map((n, i) => { const x = (i % 2) * 188, y = 205 + Math.floor(i / 2) * 36; return a[n] ? [box('k' + n, x, y, 34, 32, n, { state: hot && hot.includes(n) ? 'active' : 'head', size: 15 }), box('v' + n, x + 38, y, 140, 32, a[n].join(', '), { state: hot && hot.includes(n) ? 'compare' : undefined, size: 14 })] : null; });
      add(graph('g', GN, []), 'Six people in a network, with no connections yet. The table below will be our dict.', 1);
      const es = [];
      GE.forEach(([x, y]) => {
        es.push([x, y]);
        (a[x] = a[x] || []).push(y); (a[y] = a[y] || []).push(x);
        add([graph('g', GN, es, { edgeSt: { [x + '-' + y]: 'path' }, st: { [x]: 'active', [y]: 'active' } }), tbl([x, y])], `Edge ${x}–${y}: add ${y} to ${x}'s list and ${x} to ${y}'s list.`, [3, 4]);
      });
      add([graph('g', GN, es), tbl()], `Done. Space is O(V + E): one row per node, and each of the ${GE.length} edges is stored twice.`, 2);
    },
  });

  defViz('graph-bfs', {
    title: 'Breadth-first search: ripples from the start',
    intro: 'A queue makes BFS visit everything 1 hop away, then 2 hops, and so on. That gives the fewest hops to each node.',
    inputs: [startInput],
    code: 'from collections import deque\n\ndef bfs(graph, start):\n    dist = {start: 0}\n    q = deque([start])\n    while q:\n        node = q.popleft()\n        for nb in graph[node]:\n            if nb not in dist:\n                dist[nb] = dist[node] + 1\n                q.append(nb)\n    return dist',
    build({ s }, add) {
      const a = adj(GE), dist = { [s]: 0 }, q = [s], doneSet = new Set();
      const V = (cur, nb, msg, ln) => add([graph('g', GN, GE, { edgeSt: (k) => (nb && (k === cur + '-' + nb || k === nb + '-' + cur) ? 'path' : undefined), st: (n) => (n === cur ? 'active' : n === nb ? 'compare' : doneSet.has(n) ? 'done' : dist[n] != null ? 'queued' : undefined), sub: (n) => (dist[n] != null ? 'd=' + dist[n] : null) }), label('q', 0, 215, 'queue'), cells('q', q, { x: 0, y: 223, s: 34, gap: 4, idx: false, ids: q })], msg, ln, { queue: q.join(' ') || 'empty' });
      V(null, null, `Start at ${s}, which is 0 hops away.`, [4, 5]);
      while (q.length) {
        const n = q.shift();
        V(n, null, `Take ${n} from the front of the queue.`, 7);
        a[n].forEach((nb) => {
          if (dist[nb] == null) {
            dist[nb] = dist[n] + 1; q.push(nb);
            V(n, nb, `${nb} is new, ${dist[nb]} hop${dist[nb] > 1 ? 's' : ''} from ${s}. It joins the queue.`, [10, 11]);
          } else V(n, nb, `${nb} is already discovered. Skip it.`, 9);
        });
        doneSet.add(n);
      }
      V(null, null, `All reachable nodes are visited. Time O(V + E). The \`d\` labels are the fewest hops from ${s}.`, 12);
    },
  });

  defViz('graph-dfs', {
    title: 'Depth-first search: go deep, then back up',
    intro: 'DFS follows one path as far as it can, then backtracks to try the next option. Recursion handles the backtracking.',
    inputs: [startInput],
    code: 'def dfs(graph, node, seen):\n    seen.add(node)\n    for nb in graph[node]:\n        if nb not in seen:\n            dfs(graph, nb, seen)',
    build({ s }, add) {
      const a = adj(GE), seen = new Set(), st = [], fin = new Set(), usedE = new Set();
      const V = (cur, nb, msg, ln) => add([graph('g', GN, GE, { edgeSt: (k) => (usedE.has(k) ? 'path' : undefined), st: (n) => (n === cur ? 'active' : n === nb ? 'compare' : fin.has(n) ? 'done' : seen.has(n) ? 'queued' : undefined) }), stack('c', st.map((x) => ({ id: x, v: 'dfs(' + x + ')' })), { x: 384, y: 200, w: 78, h: 26, cap: 6, label: 'call stack' })], msg, ln);
      (function go(n, from) {
        seen.add(n); st.push(n);
        if (from) usedE.add(from + '-' + n), usedE.add(n + '-' + from);
        V(n, null, `Visit ${n} and mark it seen.`, 2);
        a[n].forEach((nb) => {
          if (seen.has(nb)) V(n, nb, `Neighbour ${nb} is already seen. Skip it.`, 4);
          else { V(n, nb, `${nb} is new. Go deeper right away.`, 5); go(nb, n); V(n, null, `Back at ${n}. Try its next neighbour.`, 3); }
        });
        st.pop(); fin.add(n);
        V(null, null, `${n} has no more options, so backtrack.`, 3);
      })(s);
      V(null, null, 'Everything reachable has been visited. Time O(V + E), with stack depth up to V.', 1);
    },
  });

  const GRIDS = { 'Three islands': ['11000', '11000', '00100', '00011'], 'One big island': ['11110', '11010', '11000', '00000'], 'Scattered': ['10101', '01010', '10101', '00000'] };
  defViz('grid-islands', {
    title: 'A grid is a graph: count islands',
    intro: 'Each land cell connects to its neighbours up, down, left and right. When you find new land, flood it so you only count it once.',
    inputs: [{ k: 'g', label: 'Map', type: 'choice', opts: Object.keys(GRIDS), def: 'Three islands' }],
    code: 'def islands(grid):\n    count = 0\n    def flood(r, c):\n        if not (0 <= r < len(grid) and 0 <= c < len(grid[0])):\n            return\n        if grid[r][c] != "1":\n            return\n        grid[r][c] = "#"\n        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:\n            flood(r + dr, c + dc)\n    for r in range(len(grid)):\n        for c in range(len(grid[0])):\n            if grid[r][c] == "1":\n                count += 1\n                flood(r, c)\n    return count',
    build({ g }, add) {
      const G = GRIDS[g].map((r) => r.split('')), R = G.length, C = G[0].length, own = {};
      let count = 0;
      const COL = ['done', 'active', 'compare', 'queued', 'pivot', 'path2', 'done2', 'active2', 'bad'];
      const V = (hot, msg, ln) => add(grid('g', G.map((r, i) => r.map((_, j) => own[i + ',' + j] || '')), { s: 50, st: (r, c) => { const k = r + ',' + c; if (k === hot) return 'hot'; if (own[k]) return COL[(own[k] - 1) % COL.length]; return G[r][c] === '1' ? 'land' : 'water'; } }), msg, ln, { islands: count });
      V(null, 'Green-grey cells are land and pale cells are water. We scan from the top left.', 2);
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        if (G[r][c] === '1' && !own[r + ',' + c]) {
          count++;
          V(r + ',' + c, `New land at row ${r}, column ${c}. That's island number ${count}.`, [13, 14]);
          (function flood(x, y) {
            if (x < 0 || y < 0 || x >= R || y >= C || G[x][y] !== '1' || own[x + ',' + y]) return;
            own[x + ',' + y] = count;
            V(x + ',' + y, `Flood row ${x}, column ${y} and mark it, so it won't be counted again.`, [8, 9, 10]);
            flood(x + 1, y); flood(x - 1, y); flood(x, y + 1); flood(x, y - 1);
          })(r, c);
        }
      }
      V(null, `Scan finished: ${count} island${count === 1 ? '' : 's'}. Each cell is visited a limited number of times, so time is O(rows × columns).`, 16);
    },
  });

  defViz('topo-kahn', {
    title: 'Topological sort: an order that respects dependencies',
    intro: 'A task can start once everything it depends on is finished. Kahn’s method repeatedly takes a task with zero remaining dependencies.',
    code: 'from collections import deque\n\ndef topo(n, edges):\n    graph = [[] for _ in range(n)]\n    need = [0] * n\n    for a, b in edges:\n        graph[a].append(b)\n        need[b] += 1\n    q = deque(i for i in range(n) if need[i] == 0)\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in graph[u]:\n            need[v] -= 1\n            if need[v] == 0:\n                q.append(v)\n    return order if len(order) == n else []',
    build(_, add) {
      const N = { Shop: [30, 40], Wash: [160, 20], Chop: [290, 40], Boil: [160, 120], Cook: [300, 140], Eat: [430, 90] };
      const names = { Shop: 'S', Wash: 'W', Chop: 'C', Boil: 'B', Cook: 'K', Eat: 'E' };
      const E = [['Shop', 'Wash'], ['Wash', 'Chop'], ['Shop', 'Boil'], ['Chop', 'Cook'], ['Boil', 'Cook'], ['Cook', 'Eat']];
      const pos = {}; Object.entries(N).forEach(([k, v]) => (pos[names[k]] = v));
      const ed = E.map(([a, b]) => [names[a], names[b]]);
      const need = {}, g = {};
      Object.values(names).forEach((n) => { need[n] = 0; g[n] = []; });
      ed.forEach(([a, b]) => { g[a].push(b); need[b]++; });
      const key = label('k', 0, 186, 'S shop · W wash · C chop · B boil · K cook · E eat');
      const q = Object.keys(need).filter((n) => need[n] === 0), order = [];
      const V = (cur, hot, msg, ln) => add([graph('g', pos, ed, { directed: 1, r: 18, st: (n) => (n === cur ? 'active' : n === hot ? 'compare' : order.includes(n) ? 'done' : q.includes(n) ? 'queued' : undefined), sub: (n) => 'needs ' + need[n], edgeSt: (k) => (order.includes(k[0]) ? 'faint' : undefined) }), key, label('q', 0, 214, 'order'), cells('o', order, { y: 222, s: 38, gap: 4, idx: false })], msg, ln, { ready: q.join(' ') || 'empty' });
      V(null, null, 'The label under each task shows how many tasks it is still waiting for.', [7, 8]);
      V(null, null, `Only ${q.join(', ')} needs nothing, so it's ready to start.`, 9);
      while (q.length) {
        const u = q.shift();
        order.push(u);
        V(u, null, `Do ${u} and add it to the order.`, [12, 13]);
        g[u].forEach((v) => {
          need[v]--;
          if (need[v] === 0) q.push(v);
          V(u, v, need[v] === 0 ? `${v} has nothing left to wait for. It's ready.` : `${v} loses one dependency, but still needs ${need[v]} more.`, need[v] === 0 ? [16, 17] : 15);
        });
      }
      V(null, null, `Valid order: ${order.join(' → ')}. If a cycle existed, some tasks would never reach 0 and the order would come up short. Time O(V + E).`, 18);
    },
  });

  defViz('dijkstra', {
    title: 'Dijkstra: the cheapest route',
    intro: 'Always finalise the unvisited node with the smallest known distance, using a heap. Its distance can never improve afterwards.',
    inputs: [{ k: 's', label: 'Start at', type: 'choice', opts: ['A', 'B', 'C', 'D', 'E', 'F'], def: 'A' }],
    code: 'import heapq\n\ndef dijkstra(graph, start):\n    dist = {start: 0}\n    heap = [(0, start)]\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d > dist[u]:\n            continue\n        for v, w in graph[u]:\n            if d + w < dist.get(v, float("inf")):\n                dist[v] = d + w\n                heapq.heappush(heap, (d + w, v))\n    return dist',
    build({ s }, add) {
      const E = [['A', 'B', 4], ['A', 'D', 1], ['B', 'C', 3], ['D', 'B', 2], ['B', 'E', 6], ['D', 'E', 7], ['C', 'E', 1], ['C', 'F', 5], ['E', 'F', 2]];
      const a = {};
      E.forEach(([x, y, w]) => { (a[x] = a[x] || []).push([y, w]); (a[y] = a[y] || []).push([x, w]); });
      const dist = { [s]: 0 }, fin = new Set();
      let h = [[0, s]];
      const via = {};
      const V = (cur, nb, msg, ln) => add([graph('g', GN, E, { edgeSt: (k) => { const [p, q] = k.split('-'); if (cur && nb && ((p === cur && q === nb) || (p === nb && q === cur))) return 'hot'; return via[p] === q || via[q] === p ? 'path' : undefined; }, st: (n) => (n === cur ? 'active' : n === nb ? 'compare' : fin.has(n) ? 'done' : dist[n] != null ? 'queued' : undefined), sub: (n) => (dist[n] != null ? dist[n] : '∞') }), label('h', 0, 215, 'heap (distance, node)'), cells('h', h.slice().sort((x, y) => x[0] - y[0]).map((x) => x[0] + x[1]), { y: 223, s: 40, gap: 4, idx: false })], msg, ln, {});
      V(null, null, `Everything starts as infinitely far away, except ${s} at distance 0.`, [4, 5]);
      while (h.length) {
        h.sort((x, y) => x[0] - y[0]);
        const [d, u] = h.shift();
        if (fin.has(u)) { V(u, null, `(${d}, ${u}) is out of date, as ${u} is already final. Skip it.`, [8, 9]); continue; }
        fin.add(u);
        V(u, null, `The smallest in the heap is ${u} at ${d}. That's final, since any other route would already cost at least this much.`, 7);
        a[u].slice().sort().forEach(([v, w]) => {
          if (fin.has(v)) return;
          const nd = d + w, old = dist[v];
          if (old == null || nd < old) {
            dist[v] = nd; via[v] = u; h.push([nd, v]);
            V(u, v, `${u} → ${v}: ${d} + ${w} = ${nd}${old != null ? `, better than ${old}` : ''}. Update and add to the heap.`, [11, 12, 13]);
          } else V(u, v, `${u} → ${v}: ${d} + ${w} = ${nd}, no better than ${old}. Ignore it.`, 11);
        });
      }
      V(null, null, 'All distances are final. Time O((V + E) log V). Edge weights must not be negative.', 14);
    },
  });

  defViz('greedy-intervals', {
    title: 'Greedy: fit in the most meetings',
    intro: 'Sort by finish time, then keep every meeting that starts after the last one you kept. Finishing early leaves the most room.',
    inputs: [{ k: 'p', label: 'Meetings', type: 'choice', opts: ['Busy morning', 'Long talks', 'Back to back'], def: 'Busy morning' }],
    code: 'def max_meetings(meetings):\n    meetings.sort(key=lambda m: m[1])\n    count = 0\n    last_end = float("-inf")\n    for start, end in meetings:\n        if start >= last_end:\n            count += 1\n            last_end = end\n    return count',
    build({ p }, add) {
      const sets = { 'Busy morning': [[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11]], 'Long talks': [[0, 10], [1, 3], [4, 6], [7, 9], [2, 8]], 'Back to back': [[1, 2], [2, 3], [3, 4], [1, 4], [2, 5]] };
      const ms = sets[p].slice(), U = 36;
      const bar = (m, i, st) => box('m' + m[0] + '_' + m[1], 16 + m[0] * U, 26 + i * 34, (m[1] - m[0]) * U, 28, `${m[0]}–${m[1]}`, { state: st, size: 13 });
      const ticks = Array.from({ length: 12 }, (_, i) => text('t' + i, 16 + i * U, 16, i, { cls: 'idx', size: 11 }));
      add([ticks, ms.map((m, i) => bar(m, i))], 'Each bar is a meeting on a timeline. Which ones should we keep?', 1);
      const sorted = ms.slice().sort((a, b) => a[1] - b[1]);
      add([ticks, sorted.map((m, i) => bar(m, i))], 'Sort by finish time.', 2);
      let last = -Infinity, count = 0;
      const st = {};
      sorted.forEach((m, i) => {
        const ok = m[0] >= last;
        add([ticks, sorted.map((x, j) => bar(x, j, j === i ? 'compare' : st[j]))], `Meeting ${m[0]}–${m[1]}: does it start at or after ${last === -Infinity ? 'the beginning' : last}? ${ok ? 'Yes.' : 'No, it overlaps.'}`, 6, { last_end: last === -Infinity ? '-inf' : last, count });
        if (ok) { count++; last = m[1]; st[i] = 'done'; } else st[i] = 'muted';
        add([ticks, sorted.map((x, j) => bar(x, j, st[j]))], ok ? `Keep it. The room is busy until ${last}.` : 'Skip it.', ok ? [7, 8] : 5, { last_end: last, count });
      });
      add([ticks, sorted.map((x, j) => bar(x, j, st[j]))], `${count} meetings fit. Sorting costs O(n log n) and the scan is O(n).`, 9, { count });
    },
  });

  defViz('greedy-coins', {
    title: 'When greedy works, and when it fails',
    intro: 'Taking the largest coin works for everyday coins. With odd coin sets it can be wrong, and you need DP.',
    inputs: [{ k: 'c', label: 'Coins', type: 'choice', opts: ['1, 2, 5, 10', '1, 3, 4'], def: '1, 3, 4' }, { k: 'n', label: 'Amount', type: 'num', def: 6, lo: 1, hi: 40 }],
    code: 'def greedy_change(coins, amount):\n    used = []\n    for c in sorted(coins, reverse=True):\n        while amount >= c:\n            amount -= c\n            used.append(c)\n    return used',
    build({ c, n }, add) {
      const coins = c.split(',').map(Number).sort((a, b) => b - a), used = [];
      let rest = n;
      const V = (hot) => [big('r', 0, 20, `left to pay: ${rest}`), used.map((x, i) => circ('c' + i, 22 + i % 12 * 44, 62 + Math.floor(i / 12) * 44, 19, x, { state: 'compare' })), coins.map((x, i) => box('k' + x, i * 56, 120, 50, 40, x, { state: x === hot ? 'active' : 'head' })), label('kk', 0, 112, 'coins available')];
      add(V(), `Pay ${n} using as few coins as possible.`, 2, { amount: rest });
      coins.forEach((x) => {
        if (rest < x) { add(V(x), `\`${x}\` is too big for ${rest}. Try the next coin.`, 4, { amount: rest }); return; }
        while (rest >= x) { rest -= x; used.push(x); add(V(x), `Take \`${x}\`. Left: ${rest}.`, [5, 6], { amount: rest, used: used.length }); }
      });
      // true optimal
      const dp = Array(n + 1).fill(Infinity); dp[0] = 0;
      for (let a = 1; a <= n; a++) coins.forEach((x) => { if (a >= x) dp[a] = Math.min(dp[a], dp[a - x] + 1); });
      add(V(), used.length === dp[n] ? `Greedy used ${used.length} coin${used.length > 1 ? 's' : ''}, and that is the true minimum here.` : `Greedy used ${used.length} coins, but the true minimum is ${dp[n]}. A local best choice can lose overall. Coin change with odd sets needs DP.`, 7, { greedy: used.length, best: dp[n] });
    },
  });

  defViz('bt-subsets', {
    title: 'Backtracking: a tree of choices',
    intro: 'For each item, decide take or skip. After exploring one choice, undo it and try the other.',
    inputs: [{ k: 'arr', label: 'Items', type: 'nums', def: [1, 2, 3], min: 1, max: 3 }],
    code: 'def subsets(nums):\n    result, path = [], []\n    def go(i):\n        if i == len(nums):\n            result.append(path[:])\n            return\n        path.append(nums[i])\n        go(i + 1)\n        path.pop()\n        go(i + 1)\n    go(0)\n    return result',
    build({ arr }, add) {
      const out = [], path = [];
      let idc = 0;
      const mk = (i, lab) => { const n = { id: idc++, v: '', lab }; if (i < arr.length) { n.l = mk(i + 1, '+' + arr[i]); n.r = mk(i + 1, '−'); } return n; };
      const root = mk(0, '');
      const seen = new Set(), done = new Set();
      const mask = (t) => (t ? { id: t.id, v: t.txt || '', l: mask(t.l), r: mask(t.r) } : null);
      const dx = arr.length === 3 ? 30 : 48;
      const V = (act, msg, ln) => add([tree('t', mask(root), { dx, dy: 56, r: 14, st: (id) => (id === act ? 'active' : done.has(id) ? 'done' : seen.has(id) ? 'queued' : 'ghost') }), label('p', 0, 56 * (arr.length + 1) + 8, `path = [${path.join(', ')}]`), label('rs', 0, 56 * (arr.length + 1) + 30, `found: ${out.map((s) => '[' + s.join(',') + ']').join(' ') || 'none yet'}`)], msg, ln, { path: JSON.stringify(path) });
      function go(n, i) {
        seen.add(n.id);
        n.txt = i;
        if (i === arr.length) {
          n.txt = path.length;
          out.push(path.slice());
          done.add(n.id);
          V(n.id, `A decision was made for every item. Record \`[${path.join(', ')}]\`.`, [4, 5]);
          return;
        }
        V(n.id, `Choosing for \`${arr[i]}\`. First option: take it.`, 7);
        path.push(arr[i]);
        go(n.l, i + 1);
        path.pop();
        V(n.id, `Undo: remove \`${arr[i]}\` from the path. This is the backtrack.`, 9);
        V(n.id, `Second option: skip \`${arr[i]}\`.`, 10);
        go(n.r, i + 1);
        done.add(n.id);
      }
      go(root, 0);
      V(null, `All ${out.length} subsets found. Each item has 2 options, so there are 2ⁿ results.`, 12);
    },
  });

  defViz('bt-nqueens', {
    title: 'N-Queens: try, check, undo',
    intro: 'Place one queen per row. If a spot is attacked, try the next. When a row has no safe spot, go back and move the previous queen.',
    inputs: [{ k: 'n', label: 'Board size', type: 'choice', opts: ['4', '5'], def: '4' }],
    code: 'def solve(n):\n    cols, d1, d2, q = set(), set(), set(), []\n    def place(r):\n        if r == n:\n            return True\n        for c in range(n):\n            if c in cols or r-c in d1 or r+c in d2:\n                continue\n            cols.add(c); d1.add(r-c); d2.add(r+c); q.append(c)\n            if place(r + 1):\n                return True\n            cols.remove(c); d1.remove(r-c); d2.remove(r+c); q.pop()\n        return False\n    place(0)\n    return q',
    build({ n }, add) {
      n = Number(n);
      const q = [];
      let tries = 0;
      const board = (hot, st) => grid('b', Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (q[r] === c ? '♛' : hot && hot[0] === r && hot[1] === c ? '♛' : ''))), { s: 50, st: (r, c) => (hot && hot[0] === r && hot[1] === c ? st : q[r] === c ? 'done' : (r + c) % 2 ? 'dark' : 'light') });
      const safe = (r, c) => q.every((qc, qr) => qc !== c && Math.abs(qc - c) !== r - qr);
      function place(r) {
        if (r === n) return true;
        for (let c = 0; c < n; c++) {
          tries++;
          if (!safe(r, c)) { add(board([r, c], 'bad'), `Row ${r}, column ${c} is attacked by an earlier queen. Try the next column.`, [7, 8], { tries }); continue; }
          add(board([r, c], 'active'), `Row ${r}, column ${c} is safe. Place a queen and move to the next row.`, 9, { tries });
          q.push(c);
          if (place(r + 1)) return true;
          q.pop();
          add(board([r, c], 'compare'), `Row ${r + 1} had no safe spot. Remove this queen and try further along.`, 12, { tries });
        }
        add(board(), `Row ${r} ran out of options. Go back up one row.`, 13, { tries });
        return false;
      }
      add(board(), `Place ${n} queens so that none attack each other.`, 3);
      place(0);
      add(board(), `Solved after trying ${tries} positions. Without undoing, you'd have to check every possible arrangement.`, 5, { tries });
    },
  });

  defViz('dp-memo', {
    title: 'Memoisation: never solve the same thing twice',
    intro: 'Save each answer in a dict the first time. Repeat calls return right away. The tree shrinks to a thin line.',
    inputs: [{ k: 'n', label: 'n', type: 'num', def: 6, lo: 2, hi: 9 }],
    code: 'memo = {}\ndef fib(n):\n    if n < 2:\n        return n\n    if n in memo:\n        return memo[n]\n    memo[n] = fib(n - 1) + fib(n - 2)\n    return memo[n]',
    build({ n }, add) {
      const memo = {}, trail = [];
      let calls = 0, hits = 0;
      const plain = (m) => (m < 2 ? 1 : 1 + plain(m - 1) + plain(m - 2));
      const V = (msg, ln, hot) => add([label('t', 0, 12, 'Memo table: n → fib(n)'), grid('m', [Array.from({ length: n + 1 }, (_, i) => i), Array.from({ length: n + 1 }, (_, i) => (i < 2 ? i : memo[i] ?? ''))], { y: 22, s: 38, w: 44, st: (r, c) => (r === 0 ? 'head' : c === hot ? 'compare' : memo[c] != null || c < 2 ? 'done' : undefined) }), label('c', 0, 130, 'Stack now'), trail.map((m, i) => box('s' + i, i * 58, 138, 52, 34, 'f(' + m + ')', { state: i === trail.length - 1 ? 'active' : undefined, size: 14 }))], msg, ln, { calls, 'memo hits': hits });
      function f(m) {
        calls++; trail.push(m);
        if (m < 2) { V(`\`fib(${m})\` is a base case.`, [3, 4], m); trail.pop(); return m; }
        if (memo[m] != null) { hits++; V(`\`fib(${m})\` is already saved. Return ${memo[m]} right away with no extra calls.`, [5, 6], m); trail.pop(); return memo[m]; }
        V(`\`fib(${m})\` isn't saved yet. Work it out.`, 7, m);
        const r = f(m - 1) + f(m - 2);
        memo[m] = r;
        V(`Save \`memo[${m}] = ${r}\`.`, [7, 8], m);
        trail.pop();
        return r;
      }
      V(`Compute \`fib(${n})\`.`, 1);
      const a = f(n);
      V(`\`fib(${n})\` = ${a} in ${calls} calls. The plain version needs ${plain(n)}. O(2ⁿ) became O(n).`, 8);
    },
  });

  defViz('dp-table', {
    title: 'Filling a table: House Robber',
    intro: 'At each house choose: skip it and keep the previous best, or rob it and add to the best from two houses back.',
    inputs: [{ k: 'arr', label: 'Money in each house', type: 'nums', def: [2, 7, 9, 3, 1, 8], min: 1, max: 8, randHi: 20 }],
    code: 'def rob(money):\n    n = len(money)\n    dp = [0] * (n + 2)\n    for i in range(n):\n        skip = dp[i + 1]\n        take = dp[i] + money[i]\n        dp[i + 2] = max(skip, take)\n    return dp[n + 1]',
    build({ arr }, add) {
      const n = arr.length, dp = Array(n + 2).fill(0);
      const V = (i, st, msg, ln, vars) => add([cells('a', arr, { s: 46, x: 104, label: undefined, st: (k) => (k === i ? st || 'active' : undefined) }), label('m', 0, 28, 'money'), cells('d', dp.map((v, k) => (k < 2 || k <= (i == null ? n + 1 : i + (st === 'done' ? 2 : 1)) ? v : '')), { y: 96, s: 46, idx: false, st: (k) => (i != null && k === i + 2 ? (st === 'done' ? 'done' : 'empty') : i != null && st !== 'done' && k === i + 1 ? 'compare' : i != null && st !== 'done' && k === i ? 'compare' : undefined) }), label('dl', 0, 90, 'dp: best total so far')], msg, ln, vars);
      V(null, null, 'Each `dp` slot means: the most money with the houses so far. The first two 0s stand for no houses at all.', 3);
      for (let i = 0; i < n; i++) {
        const skip = dp[i + 1], take = dp[i] + arr[i];
        V(i, 'active', `House ${i} has ${arr[i]}. Skip it and keep ${skip}, or rob it and get ${dp[i]} + ${arr[i]} = ${take}.`, [5, 6], { skip, take });
        dp[i + 2] = Math.max(skip, take);
        V(i, 'done', `Keep the better: ${dp[i + 2]}.`, 7, { skip, take, best: dp[i + 2] });
      }
      V(null, null, `The answer is ${dp[n + 1]}. One pass over the houses: O(n) time. Only the last two values are ever needed, so it can even use O(1) space.`, 8, { answer: dp[n + 1] });
    },
  });

  defViz('dp-grid', {
    title: '2-D table: counting paths through a grid',
    intro: 'A robot only moves right or down. The paths reaching a cell equal the paths from above plus the paths from the left.',
    inputs: [{ k: 'r', label: 'Rows', type: 'num', def: 3, lo: 1, hi: 5 }, { k: 'c', label: 'Columns', type: 'num', def: 4, lo: 1, hi: 6 }],
    code: 'def paths(rows, cols):\n    dp = [[1] * cols for _ in range(rows)]\n    for r in range(1, rows):\n        for c in range(1, cols):\n            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]\n    return dp[-1][-1]',
    build({ r: R, c: C }, add) {
      const dp = Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => (r === 0 || c === 0 ? 1 : '')));
      const V = (hot, msg, ln, vars) => add(grid('g', dp.map((x) => x.slice()), { s: 50, st: (r, c) => (hot && r === hot[0] && c === hot[1] ? 'active' : hot && ((r === hot[0] - 1 && c === hot[1]) || (r === hot[0] && c === hot[1] - 1)) ? 'compare' : dp[r][c] !== '' ? 'done' : 'empty') }), msg, ln, vars);
      V(null, 'The top row and left column have only one way in: straight along the edge.', 2);
      for (let r = 1; r < R; r++) for (let c = 1; c < C; c++) {
        V([r, c], `Cell (${r}, ${c}) can be reached from above (${dp[r - 1][c]} ways) or from the left (${dp[r][c - 1]} ways).`, 5, { above: dp[r - 1][c], left: dp[r][c - 1] });
        dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
        V([r, c], `So ${dp[r - 1][c]} + ${dp[r][c - 1]} = ${dp[r][c]}.`, 5, { 'dp[r][c]': dp[r][c] });
      }
      V(null, `The bottom right cell holds the answer: ${dp[R - 1][C - 1]} paths. Time and space are O(rows × columns).`, 6, { answer: dp[R - 1][C - 1] });
    },
  });

  defViz('dp-lcs', {
    title: 'Longest common subsequence',
    intro: 'If the letters match, extend the diagonal answer by one. If not, take the better of leaving out either letter.',
    inputs: [{ k: 'a', label: 'Text 1', type: 'word', def: 'abcde', max: 6, only: /^[a-z]+$/, onlyMsg: 'use lowercase letters.' }, { k: 'b', label: 'Text 2', type: 'word', def: 'ace', max: 6, only: /^[a-z]+$/, onlyMsg: 'use lowercase letters.' }],
    code: 'def lcs(a, b):\n    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]\n    for i in range(1, len(a) + 1):\n        for j in range(1, len(b) + 1):\n            if a[i - 1] == b[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1] + 1\n            else:\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n    return dp[-1][-1]',
    build({ a, b }, add) {
      const A = a.length, B = b.length;
      const dp = Array.from({ length: A + 1 }, (_, i) => Array.from({ length: B + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : '')));
      const o = { s: 42, x: 30, y: 26, colL: ['', ...b.split('')], rowL: ['', ...a.split('')] };
      const V = (hot, st, msg, ln, tr) => add(grid('g', dp.map((x) => x.slice()), { ...o, st: (i, j) => (tr && tr.has(i + ',' + j) ? 'done' : hot && hot[0] === i && hot[1] === j ? st : hot && st === 'match' && i === hot[0] - 1 && j === hot[1] - 1 ? 'compare' : hot && st === 'nomatch' && ((i === hot[0] - 1 && j === hot[1]) || (i === hot[0] && j === hot[1] - 1)) ? 'compare' : dp[i][j] === '' ? 'empty' : undefined) }), msg, ln, hot ? { 'a[i-1]': a[hot[0] - 1], 'b[j-1]': b[hot[1] - 1] } : undefined);
      V(null, null, 'Row 0 and column 0 are empty text, so their answer is 0.', 2);
      for (let i = 1; i <= A; i++) for (let j = 1; j <= B; j++) {
        const m = a[i - 1] === b[j - 1];
        V([i, j], m ? 'match' : 'nomatch', m ? `\`${a[i - 1]}\` matches \`${b[j - 1]}\`. Take the diagonal value and add 1.` : `\`${a[i - 1]}\` and \`${b[j - 1]}\` differ. Take the larger of above and left.`, m ? [5, 6] : 8);
        dp[i][j] = m ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
      const tr = new Set(); let i = A, j = B, s = '';
      while (i > 0 && j > 0) {
        if (a[i - 1] === b[j - 1]) { tr.add(i + ',' + j); s = a[i - 1] + s; i--; j--; }
        else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--;
      }
      V(null, null, `Longest common subsequence has length ${dp[A][B]}${s ? `, for example \`${s}\`` : ''}. Green cells mark the matched letters. Time O(n × m).`, 9, tr);
    },
  });

  defViz('dp-knapsack', {
    title: '0/1 Knapsack',
    intro: 'Each cell asks: with these items and this much room, what is the best value? For each item you either leave it or take it.',
    inputs: [{ k: 'w', label: 'Weights', type: 'nums', def: [1, 3, 4], min: 1, max: 4, lo: 1, hi: 6, randHi: 6 }, { k: 'v', label: 'Values', type: 'nums', def: [15, 20, 30], min: 1, max: 4, lo: 1, hi: 99, randHi: 50 }, { k: 'cap', label: 'Bag size', type: 'num', def: 4, lo: 1, hi: 7 }],
    code: 'def knapsack(w, v, cap):\n    n = len(w)\n    dp = [[0] * (cap + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        for c in range(cap + 1):\n            dp[i][c] = dp[i - 1][c]\n            if w[i - 1] <= c:\n                take = dp[i - 1][c - w[i - 1]] + v[i - 1]\n                dp[i][c] = max(dp[i][c], take)\n    return dp[n][cap]',
    build({ w, v, cap }, add) {
      const n = Math.min(w.length, v.length);
      const dp = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: cap + 1 }, () => (i === 0 ? 0 : '')));
      const o = { s: 40, w: 44, x: 74, y: 26, colL: [...Array(cap + 1).keys()].map((c) => 'c' + c), rowL: ['none', ...w.slice(0, n).map((x, i) => `w${x} v${v[i]}`)] };
      const V = (hot, src, msg, ln, vars) => add(grid('g', dp.map((x) => x.slice()), { ...o, st: (i, c) => (hot && hot[0] === i && hot[1] === c ? 'active' : src && src.some((s) => s[0] === i && s[1] === c) ? 'compare' : dp[i][c] === '' ? 'empty' : undefined) }), msg, ln, vars);
      V(null, null, 'With no items, the best value is 0 for any bag size. Rows add one item at a time, columns grow the bag.', 3);
      for (let i = 1; i <= n; i++) for (let c = 0; c <= cap; c++) {
        const wi = w[i - 1], vi = v[i - 1], leave = dp[i - 1][c];
        if (wi <= c) {
          const take = dp[i - 1][c - wi] + vi;
          V([i, c], [[i - 1, c], [i - 1, c - wi]], `Item (weight ${wi}, value ${vi}) with room ${c}: leave it for ${leave}, or take it for ${dp[i - 1][c - wi]} + ${vi} = ${take}.`, [6, 8], { leave, take });
          dp[i][c] = Math.max(leave, take);
          V([i, c], null, `Best is ${dp[i][c]}.`, 9, { 'dp[i][c]': dp[i][c] });
        } else {
          dp[i][c] = leave;
          if (c === 0 || c === wi - 1) V([i, c], [[i - 1, c]], `Weight ${wi} doesn't fit in room ${c}, so copy ${leave} from above.`, [6, 7]);
        }
      }
      V([n, cap], null, `Best total value is ${dp[n][cap]}. Time and space are O(n × capacity).`, 10, { answer: dp[n][cap] });
    },
  });

  defViz('trie-ops', {
    title: 'A trie: words sharing their beginnings',
    intro: 'Each edge is a letter. Words with the same start share the same path, so prefix lookups only depend on the prefix length.',
    inputs: [{ k: 'words', label: 'Words', type: 'words', def: ['car', 'cat', 'cart', 'dog', 'do'], min: 1, max: 5, maxLen: 5 }, { k: 'q', label: 'Search prefix', type: 'word', def: 'ca', max: 5, only: /^[a-z]+$/, onlyMsg: 'use lowercase letters.' }],
    code: 'class Trie:\n    def __init__(self):\n        self.root = {}\n\n    def insert(self, word):\n        node = self.root\n        for ch in word:\n            node = node.setdefault(ch, {})\n        node["$"] = True\n\n    def starts_with(self, prefix):\n        node = self.root\n        for ch in prefix:\n            if ch not in node:\n                return False\n            node = node[ch]\n        return True',
    build({ words, q }, add) {
      const root = { id: 'r', ch: '·', kids: {}, end: false, path: '' };
      const layout = () => {
        let x = 0; const out = {};
        (function w(n, d) {
          const ks = Object.keys(n.kids).sort();
          if (!ks.length) { n._x = x * 46 + 20; x++; }
          else { ks.forEach((k) => w(n.kids[k], d + 1)); n._x = (n.kids[ks[0]]._x + n.kids[ks[ks.length - 1]]._x) / 2; }
          n._y = 22 + d * 54;
        })(root, 0);
      };
      const draw = (hot, doneSet) => {
        layout();
        const out = [], ed = [];
        (function w(n) {
          Object.values(n.kids).forEach((c) => { ed.push(edgeBetween('e' + c.id, n._x, n._y, c._x, c._y, 17, {})); w(c); });
          out.push(circ('n' + n.id, n._x, n._y, 17, n.ch, { state: n === hot ? 'active' : doneSet && doneSet.has(n) ? 'done' : n.end ? 'endw' : undefined }));
        })(root);
        return ed.concat(out);
      };
      add(draw(), 'The empty trie has just a root. Darker nodes will mark the end of a word.', 3);
      words.forEach((w) => {
        let n = root, path = new Set();
        add(draw(n), `Insert \`${w}\`, starting at the root.`, 6, { word: w });
        for (const ch of w) {
          const had = !!n.kids[ch];
          if (!had) n.kids[ch] = { id: n.id + ch, ch, kids: {}, end: false };
          n = n.kids[ch];
          add(draw(n), had ? `\`${ch}\` already exists on this path. Reuse it.` : `No \`${ch}\` here, so create a node.`, 8, { word: w, ch });
        }
        n.end = true;
        add(draw(n), `Mark the end of \`${w}\`.`, 9, { word: w });
      });
      let n = root, path = new Set([root]);
      add(draw(root, path), `Is \`${q}\` the start of any word?`, 12, { prefix: q });
      for (const ch of q) {
        if (!n.kids[ch]) { add(draw(n, path), `No \`${ch}\` below here, so no word starts with \`${q}\`.`, [14, 15], { result: 'False' }); return; }
        n = n.kids[ch]; path.add(n);
        add(draw(n, path), `Follow \`${ch}\`.`, 16, { ch });
      }
      add(draw(null, path), `The whole prefix exists. That took ${q.length} steps, however many words are stored. Time O(length of prefix).`, 17, { result: 'True' });
    },
  });

  defViz('uf-ops', {
    title: 'Union-Find: which group are you in?',
    intro: 'Each group is a small tree and its root is the name of the group. Path compression flattens the tree so later finds are nearly instant.',
    inputs: [{ k: 'p', label: 'Unions', type: 'choice', opts: ['0-1, 2-3, 1-3, 4-5, 3-5', '0-1, 1-2, 2-3, 3-4, 4-5', '0-5, 1-4, 2-3'], def: '0-1, 2-3, 1-3, 4-5, 3-5' }],
    code: 'parent = list(range(n))\nsize = [1] * n\n\ndef find(x):\n    if parent[x] != x:\n        parent[x] = find(parent[x])\n    return parent[x]\n\ndef union(a, b):\n    ra, rb = find(a), find(b)\n    if ra == rb:\n        return False\n    if size[ra] < size[rb]:\n        ra, rb = rb, ra\n    parent[rb] = ra\n    size[ra] += size[rb]\n    return True',
    build({ p }, add) {
      const n = 6, parent = [0, 1, 2, 3, 4, 5], size = Array(n).fill(1);
      const pairs = p.split(',').map((s) => s.trim().split('-').map(Number));
      const forest = (hot, st2) => {
        const kids = {}; parent.forEach((q, i) => { if (q !== i) (kids[q] = kids[q] || []).push(i); });
        let xc = 0; const pos = {};
        const w = (i, d) => { const ks = kids[i] || []; if (!ks.length) { pos[i] = [xc++ * 54 + 22, 22 + d * 58]; } else { ks.forEach((k) => w(k, d + 1)); pos[i] = [(pos[ks[0]][0] + pos[ks[ks.length - 1]][0]) / 2, 22 + d * 58]; } };
        parent.forEach((q, i) => { if (q === i) w(i, 0); });
        const out = [];
        parent.forEach((q, i) => { if (q !== i) out.push(edgeBetween('e' + i, pos[i][0], pos[i][1], pos[q][0], pos[q][1], 18, { arrow: 1 })); });
        parent.forEach((q, i) => out.push(circ('n' + i, pos[i][0], pos[i][1], 18, i, { state: hot && hot.includes(i) ? st2 || 'active' : q === i ? 'head2' : undefined })));
        out.push(label('pl', 0, 216, 'parent list'), cells('p', parent.slice(), { y: 224, s: 40, gap: 4, st: (i) => (hot && hot.includes(i) ? st2 || 'active' : undefined) }));
        return out;
      };
      const find = (x) => { while (parent[x] !== x) x = parent[x]; return x; };
      add(forest(), 'Six separate groups. Each node is its own parent, so each one is a root.', [1, 2]);
      pairs.forEach(([a, b]) => {
        const ra = find(a), rb = find(b);
        add(forest([a, b], 'compare'), `Union(${a}, ${b}): follow parents up to find their roots, ${ra} and ${rb}.`, 10, { a, b, 'root a': ra, 'root b': rb });
        if (ra === rb) { add(forest([ra]), 'Same root. They are already together. If these were edges, this one would make a cycle.', [11, 12]); return; }
        let big_ = ra, small = rb;
        if (size[big_] < size[small]) [big_, small] = [small, big_];
        parent[small] = big_; size[big_] += size[small];
        add(forest([big_, small]), `Attach root ${small} under root ${big_}. The smaller tree goes under the larger, keeping trees short.`, [13, 14, 15, 16], { size: size[big_] });
      });
      const deep = parent.map((_, i) => { let d = 0, x = i; while (parent[x] !== x) { x = parent[x]; d++; } return d; });
      const far = deep.indexOf(Math.max(...deep));
      if (deep[far] > 1) {
        const root = find(far), pth = []; let x = far;
        while (x !== root) { pth.push(x); x = parent[x]; }
        add(forest(pth.concat(root), 'compare'), `\`find(${far})\` has to climb ${deep[far]} steps to reach root ${root}.`, [4, 5, 6]);
        pth.forEach((q) => (parent[q] = root));
        add(forest(pth, 'done'), `Path compression points every node on the way directly at the root, so next time takes 1 step.`, 6);
      }
      const groups = new Set(parent.map((_, i) => find(i))).size;
      add(forest(), `${groups} group${groups > 1 ? 's' : ''} remain. With both tricks, each operation is almost O(1): the math name is inverse Ackermann, α(n).`, 17);
    },
  });

  defViz('segtree', {
    title: 'Segment tree: range sums with updates',
    intro: 'Each node stores the sum of a range. A query combines a few nodes, and an update changes one root-to-leaf path. Both are O(log n).',
    inputs: [{ k: 'arr', label: 'Numbers', type: 'nums', def: [2, 5, 1, 4, 9, 3, 7, 6], min: 2, max: 8 }, { k: 'l', label: 'Query from', type: 'num', def: 2, lo: 0, hi: 7 }, { k: 'r', label: 'Query to', type: 'num', def: 6, lo: 0, hi: 7 }, { k: 'i', label: 'Update index', type: 'num', def: 3, lo: 0, hi: 7 }, { k: 'v', label: 'to value', type: 'num', def: 10, lo: 0, hi: 99 }],
    code: 'def build(node, lo, hi):\n    if lo == hi:\n        tree[node] = a[lo]; return\n    mid = (lo + hi) // 2\n    build(2*node, lo, mid); build(2*node+1, mid+1, hi)\n    tree[node] = tree[2*node] + tree[2*node+1]\n\ndef query(node, lo, hi, l, r):\n    if r < lo or hi < l: return 0\n    if l <= lo and hi <= r: return tree[node]\n    mid = (lo + hi) // 2\n    return (query(2*node, lo, mid, l, r)\n            + query(2*node+1, mid+1, hi, l, r))\n\ndef update(node, lo, hi, i, val):\n    if lo == hi:\n        tree[node] = val; return\n    mid = (lo + hi) // 2\n    if i <= mid: update(2*node, lo, mid, i, val)\n    else: update(2*node+1, mid+1, hi, i, val)\n    tree[node] = tree[2*node] + tree[2*node+1]',
    build({ arr, l, r, i, v }, add) {
      const n = arr.length, a = arr.slice(), t = {}, rng = {}, ch = {};
      r = Math.min(r, n - 1); l = Math.min(l, r); i = Math.min(i, n - 1);
      const W = 56 * n;
      const pos = {};
      (function mk(k, lo, hi, d) {
        rng[k] = [lo, hi];
        pos[k] = [((lo + hi + 1) / 2) * 56, 24 + d * 62];
        if (lo === hi) { t[k] = a[lo]; return; }
        const m = (lo + hi) >> 1;
        mk(2 * k, lo, m, d + 1); mk(2 * k + 1, m + 1, hi, d + 1);
        t[k] = t[2 * k] + t[2 * k + 1];
      })(1, 0, n - 1, 0);
      const keys = Object.keys(t).map(Number);
      const V = (shown, st) => {
        const out = [];
        keys.forEach((k) => { if (k > 1 && shown.has(k) && shown.has(k >> 1)) out.push(edgeBetween('e' + k, pos[k >> 1][0], pos[k >> 1][1], pos[k][0], pos[k][1], 19, {})); });
        keys.forEach((k) => { if (shown.has(k)) out.push(circ('n' + k, pos[k][0], pos[k][1], 19, t[k], { state: st ? st(k) : undefined, sub: `${rng[k][0]}–${rng[k][1]}` })); });
        return out;
      };
      const all = new Set(keys), upTo = new Set();
      const leaves = keys.filter((k) => rng[k][0] === rng[k][1]);
      leaves.forEach((k) => upTo.add(k));
      add(V(upTo, () => 'active'), 'The leaves are the original numbers. The small label under each circle is its index range.', 3);
      const byDepth = keys.filter((k) => rng[k][0] !== rng[k][1]).sort((x, y) => y - x);
      byDepth.forEach((k) => { upTo.add(k); if ((k & (k - 1)) === 0 || k === byDepth[0]) add(V(upTo, (q) => (q === k ? 'compare' : q === 2 * k || q === 2 * k + 1 ? 'active' : undefined)), `Each parent stores the sum of its two children: ${t[2 * k]} + ${t[2 * k + 1]} = ${t[k]}.`, 6); });
      add(V(all), 'Built. There are about 2n nodes, so O(n) build time and space.', 6);
      const used = new Set(), seen = new Set();
      const seq = [];
      (function q(k) {
        const [lo, hi] = rng[k];
        if (r < lo || hi < l) { seen.add(k); seq.push([k, 'out']); return; }
        if (l <= lo && hi <= r) { used.add(k); seen.add(k); seq.push([k, 'use']); return; }
        seen.add(k); seq.push([k, 'split']);
        q(2 * k); q(2 * k + 1);
      })(1);
      let sum = 0;
      const seenNow = new Set(), usedNow = new Set();
      seq.forEach(([k, what]) => {
        seenNow.add(k);
        if (what === 'use') { usedNow.add(k); sum += t[k]; }
        const [lo, hi] = rng[k];
        add(V(all, (q) => (q === k ? (what === 'use' ? 'done' : what === 'out' ? 'bad' : 'compare') : usedNow.has(q) ? 'done' : seenNow.has(q) ? 'muted' : undefined)), what === 'use' ? `Range ${lo}–${hi} is fully inside ${l}–${r}. Use ${t[k]} without going deeper. Running sum: ${sum}.` : what === 'out' ? `Range ${lo}–${hi} is outside. It adds 0.` : `Range ${lo}–${hi} partly overlaps, so ask both children.`, what === 'use' ? 10 : what === 'out' ? 9 : [12, 13], { 'query': `${l}..${r}`, sum });
      });
      add(V(all, (q) => (usedNow.has(q) ? 'done' : undefined)), `Sum of ${l} to ${r} is ${sum}. It used only ${usedNow.size} stored node${usedNow.size > 1 ? 's' : ''}.`, 13, { sum });
      const path = [];
      (function up(k) { path.push(k); const [lo, hi] = rng[k]; if (lo === hi) return; const m = (lo + hi) >> 1; up(i <= m ? 2 * k : 2 * k + 1); })(1);
      add(V(all, (q) => (path.includes(q) ? 'compare' : undefined)), `Update index ${i} to ${v}. Only this one path from root to leaf can change.`, [18, 19, 20]);
      const rev = path.slice().reverse();
      rev.forEach((k, idx) => {
        if (idx === 0) t[k] = v; else t[k] = t[2 * k] + t[2 * k + 1];
        add(V(all, (q) => (q === k ? 'active' : rev.slice(0, idx).includes(q) ? 'done' : path.includes(q) ? 'compare' : undefined)), idx === 0 ? `The leaf becomes ${v}.` : `Recalculate the parent: ${t[2 * k]} + ${t[2 * k + 1]} = ${t[k]}.`, idx === 0 ? 17 : 21);
      });
      add(V(all, (q) => (path.includes(q) ? 'done' : undefined)), `${path.length} nodes changed, about log n. A plain prefix-sum array would need up to n changes.`, 21);
    },
  });

  defViz('bits-ops', {
    title: 'Bits: the switches inside a number',
    intro: 'Every integer is a row of 0s and 1s. AND, OR, XOR and shifts work on all the switches at once.',
    inputs: [{ k: 'a', label: 'a', type: 'num', def: 12, lo: 0, hi: 255 }, { k: 'b', label: 'b', type: 'num', def: 10, lo: 0, hi: 255 }],
    code: 'print(a & b)   # 1 only if both are 1\nprint(a | b)   # 1 if either is 1\nprint(a ^ b)   # 1 if they differ\nprint(a << 1)  # shift left: times 2\nprint(a >> 1)  # shift right: halve\nprint(a & (a - 1))  # clears the lowest 1',
    build({ a, b }, add) {
      const S = 40, G = 3, X = 74;
      const bits = (n, w = 8) => Array.from({ length: w }, (_, i) => (n >> (w - 1 - i)) & 1);
      const row = (pre, n, y, name, hot) => [text(pre + 'L', 66, y + 26, name, { anchor: 'end', size: 15, cls: 'mono' }), bits(n).map((v, i) => box(pre + i, X + i * (S + G), y, S, S, v, { state: v ? (hot || 'bitOn') : 'bitOff' }))];
      const heads = bits(0).map((_, i) => text('w' + i, X + i * (S + G) + S / 2, 10, 2 ** (7 - i), { cls: 'idx', size: 11 }));
      const three = (r, name, msg, ln) => add([heads, row('a', a, 18, String(a)), row('b', b, 64, String(b)), row('r', r, 124, String(r), 'done'), line('sep', X, 113, X + 8 * (S + G), 113, { state: 'wall' }), text('nm', X - 8, 116, name, { anchor: 'end', size: 14, cls: 'mono' })], msg, ln, { result: r });
      add([heads, row('a', a, 18, String(a)), row('b', b, 64, String(b))], `Each slot is a power of 2. ${a} = ${bits(a).map((v, i) => (v ? 2 ** (7 - i) : 0)).filter(Boolean).join(' + ') || '0'}.`, null);
      three(a & b, '&', `AND keeps a 1 only where both have a 1. ${a} & ${b} = ${a & b}.`, 1);
      three(a | b, '|', `OR keeps a 1 where either has a 1. ${a} | ${b} = ${a | b}.`, 2);
      three(a ^ b, '^', `XOR keeps a 1 where they differ. Handy fact: x ^ x = 0. ${a} ^ ${b} = ${a ^ b}.`, 3);
      const two = (r, name, msg, ln) => add([heads, row('a', a, 18, String(a)), row('r', r, 124, String(r), 'done'), text('nm', X - 8, 116, name, { anchor: 'end', size: 14, cls: 'mono' })], msg, ln, { result: r });
      two((a << 1) & 255, '<<1', `Shift left moves every bit up one place, doubling the number: ${a} × 2 = ${a * 2}${a * 2 > 255 ? ' (only 8 bits are drawn)' : ''}.`, 4);
      two(a >> 1, '>>1', `Shift right drops the last bit, halving and rounding down: ${a} // 2 = ${a >> 1}.`, 5);
      if (a > 0) {
        add([heads, row('a', a, 18, String(a)), row('b', a - 1, 64, String(a - 1), 'compare'), row('r', a & (a - 1), 124, String(a & (a - 1)), 'done'), line('sep', X, 113, X + 8 * (S + G), 113, { state: 'wall' }), text('nm', X - 8, 116, '&', { anchor: 'end', size: 14, cls: 'mono' })], `Subtracting 1 flips the lowest 1 and everything after it. So \`a & (a - 1)\` removes the lowest 1 bit. If the result is 0, a was a power of 2.`, 6, { result: a & (a - 1) });
      }
    },
  });
})();
