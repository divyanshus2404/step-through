/* Animations: sorting, searching, linked lists, stacks, queues, hashing */
(function () {
  const { box, circ, line, text, cells, bars, grid, chain, stack, label, big, ptr } = Sh;
  const tag = (arr) => arr.map((v, i) => ({ v, id: i }));
  const NUMS = (def) => ({ k: 'arr', label: 'Numbers', type: 'nums', def, min: 2, max: 8, lo: 1, hi: 60, randHi: 40 });

  defViz('sort-bubble', {
    title: 'Bubble sort',
    intro: 'Compare neighbours and swap if they are out of order. The largest value floats to the end on each pass.',
    inputs: [NUMS([5, 2, 8, 1, 6])],
    code: 'def bubble_sort(a):\n    n = len(a)\n    for end in range(n - 1, 0, -1):\n        swapped = False\n        for j in range(end):\n            if a[j] > a[j + 1]:\n                a[j], a[j + 1] = a[j + 1], a[j]\n                swapped = True\n        if not swapped:\n            break',
    build({ arr }, add) {
      const it = tag(arr), mx = Math.max(...arr);
      const v = (st, ptrs) => bars('s', it.map((x) => x.v), { ids: it.map((x) => x.id), max: mx, st, ptr: ptrs });
      let cmp = 0, sw = 0;
      add(v(), 'Tall bars are big numbers. We want them in order from short to tall.', 1, { comparisons: 0, swaps: 0 });
      for (let end = it.length - 1; end > 0; end--) {
        let swapped = false;
        for (let j = 0; j < end; j++) {
          cmp++;
          const J = j, E = end, big_ = it[j].v > it[j + 1].v;
          add(v((i) => (i === J || i === J + 1 ? 'compare' : i > E ? 'done' : undefined), { j }), `Is ${it[j].v} bigger than ${it[j + 1].v}? ${big_ ? 'Yes.' : 'No, leave them.'}`, 6, { comparisons: cmp, swaps: sw });
          if (big_) {
            [it[j], it[j + 1]] = [it[j + 1], it[j]]; sw++; swapped = true;
            add(v((i) => (i === J || i === J + 1 ? 'active' : i > E ? 'done' : undefined), { j }), 'Swap them.', 7, { comparisons: cmp, swaps: sw });
          }
        }
        const E = end;
        add(v((i) => (i >= E ? 'done' : undefined)), `Pass finished. \`${it[end].v}\` has bubbled into its final place.`, 3, { comparisons: cmp, swaps: sw });
        if (!swapped) { add(v(() => 'done'), 'No swaps in that pass, so the list is already sorted. Stop early.', 10, { comparisons: cmp, swaps: sw }); return; }
      }
      add(v(() => 'done'), `Sorted with ${cmp} comparisons and ${sw} swaps. Time O(n²), space O(1).`, null, { comparisons: cmp, swaps: sw });
    },
  });

  defViz('sort-selection', {
    title: 'Selection sort',
    intro: 'Scan the unsorted part for the smallest value, then move it to the front of that part.',
    inputs: [NUMS([6, 3, 9, 2, 7])],
    code: 'def selection_sort(a):\n    for i in range(len(a) - 1):\n        low = i\n        for j in range(i + 1, len(a)):\n            if a[j] < a[low]:\n                low = j\n        a[i], a[low] = a[low], a[i]',
    build({ arr }, add) {
      const it = tag(arr), mx = Math.max(...arr);
      const v = (st, p) => bars('s', it.map((x) => x.v), { ids: it.map((x) => x.id), max: mx, st, ptr: p });
      for (let i = 0; i < it.length - 1; i++) {
        let low = i;
        const I = i;
        add(v((k) => (k < I ? 'done' : k === I ? 'active' : undefined), { i, low }), `Position ${i} needs the smallest remaining value. Assume \`${it[i].v}\` for now.`, 3, { i, low });
        for (let j = i + 1; j < it.length; j++) {
          const J = j, L = low, sm = it[j].v < it[low].v;
          add(v((k) => (k < I ? 'done' : k === J ? 'compare' : k === L ? 'active' : undefined), { low, j }), `Is ${it[j].v} smaller than ${it[low].v}? ${sm ? 'Yes, remember this one.' : 'No.'}`, 5, { i, j, low });
          if (sm) low = j;
        }
        [it[i], it[low]] = [it[low], it[i]];
        add(v((k) => (k <= I ? 'done' : undefined)), `Swap the smallest into position ${i}. It's final now.`, 7, { i, low });
      }
      add(v(() => 'done'), 'Sorted. It always scans the rest, so it takes O(n²) even on a sorted list.', null);
    },
  });

  defViz('sort-insertion', {
    title: 'Insertion sort',
    intro: 'Like sorting playing cards in your hand: take the next card and slide it left into its place.',
    inputs: [NUMS([5, 2, 4, 6, 1, 3])],
    code: 'def insertion_sort(a):\n    for i in range(1, len(a)):\n        key = a[i]\n        j = i - 1\n        while j >= 0 and a[j] > key:\n            a[j + 1] = a[j]\n            j -= 1\n        a[j + 1] = key',
    build({ arr }, add) {
      const it = tag(arr), mx = Math.max(...arr);
      const v = (st, p) => bars('s', it.map((x) => x.v), { ids: it.map((x) => x.id), max: mx, st, ptr: p });
      add(v((k) => (k === 0 ? 'done' : undefined)), 'One card on its own is already sorted.', 1);
      for (let i = 1; i < it.length; i++) {
        let j = i;
        const key = it[i].v;
        add(v((k) => (k === i ? 'active' : k < i ? 'done' : undefined), { key: i }), `Take the next card: \`${key}\`.`, 3, { key });
        while (j > 0 && it[j - 1].v > key) {
          [it[j - 1], it[j]] = [it[j], it[j - 1]];
          j--;
          const J = j;
          add(v((k) => (k === J ? 'active' : k <= i ? 'done' : undefined), { key: j }), `${it[j + 1].v} is bigger than ${key}, so it shifts right and \`${key}\` moves left.`, [5, 6], { key, j });
        }
        const J = j;
        add(v((k) => (k === J ? 'compare' : k <= i ? 'done' : undefined), { key: j }), `\`${key}\` is in place. The left part stays sorted.`, 8, { key });
      }
      add(v(() => 'done'), 'Sorted. On nearly sorted data it runs close to O(n), which is why real sorting libraries use it for small pieces.', null);
    },
  });

  defViz('sort-merge', {
    title: 'Merge sort: split, then merge',
    intro: 'Keep halving until pieces have one item. Then join sorted pieces by repeatedly taking the smaller front item.',
    inputs: [{ ...NUMS([6, 3, 8, 1, 5, 2]), max: 7 }],
    code: 'def merge_sort(a):\n    if len(a) <= 1:\n        return a\n    mid = len(a) // 2\n    left = merge_sort(a[:mid])\n    right = merge_sort(a[mid:])\n    return merge(left, right)\n\ndef merge(x, y):\n    out, i, j = [], 0, 0\n    while i < len(x) and j < len(y):\n        if x[i] <= y[j]:\n            out.append(x[i]); i += 1\n        else:\n            out.append(y[j]); j += 1\n    return out + x[i:] + y[j:]',
    build({ arr }, add) {
      const S = 44, G = 4, DY = 70;
      const items = tag(arr);
      let pos = {};
      items.forEach((it, i) => (pos[it.id] = { x: i * (S + G), y: 0 }));
      const state = {};
      const draw = () => items.map((it) => box('m' + it.id, pos[it.id].x, pos[it.id].y, S, S, it.v, { state: state[it.id] }));
      const place = (seg, depth, startIdx, gapScale) => seg.forEach((it, k) => { pos[it.id] = { x: (startIdx + k) * (S + G) + gapScale, y: depth * DY }; });
      add(draw(), 'The whole list, unsorted.', 1);
      function sort(seg, depth, start, off) {
        if (seg.length <= 1) { seg.forEach((s) => (state[s.id] = 'done')); add(draw(), `\`[${seg[0].v}]\` has one item, so it's already sorted.`, [2, 3]); return seg; }
        const mid = seg.length >> 1;
        const L = seg.slice(0, mid), R = seg.slice(mid);
        const offL = off - 10 * Math.max(0, 3 - depth), offR = off + 10 * Math.max(0, 3 - depth);
        place(L, depth + 1, start, offL); place(R, depth + 1, start + mid, offR);
        seg.forEach((s) => (state[s.id] = 'active'));
        add(draw(), `Split \`[${seg.map((s) => s.v).join(', ')}]\` into two halves.`, [4, 5, 6]);
        seg.forEach((s) => (state[s.id] = undefined));
        const a = sort(L, depth + 1, start, offL), b = sort(R, depth + 1, start + mid, offR);
        const out = [];
        let i = 0, j = 0;
        while (i < a.length || j < b.length) {
          let pick;
          if (j >= b.length || (i < a.length && a[i].v <= b[j].v)) {
            if (i < a.length && j < b.length) { state[a[i].id] = 'compare'; state[b[j].id] = 'compare'; add(draw(), `Compare the fronts: ${a[i].v} and ${b[j].v}. Take ${a[i].v}.`, [11, 12]); state[b[j].id] = 'done'; }
            pick = a[i++];
          } else {
            if (i < a.length) { state[a[i].id] = 'compare'; state[b[j].id] = 'compare'; add(draw(), `Compare the fronts: ${a[i].v} and ${b[j].v}. Take ${b[j].v}.`, [11, 14]); state[a[i].id] = 'done'; }
            pick = b[j++];
          }
          pos[pick.id] = { x: (start + out.length) * (S + G) + off, y: depth * DY };
          state[pick.id] = 'active';
          out.push(pick);
          add(draw(), `\`${pick.v}\` goes up into the merged list.`, i < a.length || j < b.length ? (a.includes(pick) ? 13 : 15) : 16);
          state[pick.id] = 'done';
        }
        return out;
      }
      const res = sort(items, 0, 0, 0);
      res.forEach((s) => (state[s.id] = 'done'));
      add(draw(), `Sorted. There are about log n levels, and each level does n work: O(n log n). It needs O(n) extra space for merging.`, 7);
    },
  });

  defViz('sort-quick', {
    title: 'Quick sort: partition around a pivot',
    intro: 'Pick a pivot, move smaller values to its left, and the pivot lands in its final place. Repeat on each side.',
    inputs: [NUMS([7, 2, 9, 4, 3, 8, 5])],
    code: 'def quick_sort(a, lo, hi):\n    if lo >= hi:\n        return\n    pivot = a[hi]\n    store = lo\n    for j in range(lo, hi):\n        if a[j] < pivot:\n            a[j], a[store] = a[store], a[j]\n            store += 1\n    a[store], a[hi] = a[hi], a[store]\n    quick_sort(a, lo, store - 1)\n    quick_sort(a, store + 1, hi)',
    build({ arr }, add) {
      const it = tag(arr), mx = Math.max(...arr), fin = new Set();
      const v = (st, p) => bars('s', it.map((x) => x.v), { ids: it.map((x) => x.id), max: mx, st: (i) => (st && st(i)) || (fin.has(i) ? 'done' : undefined), ptr: p });
      function qs(lo, hi) {
        if (lo > hi) return;
        if (lo === hi) { fin.add(lo); add(v(), `Only \`${it[lo].v}\` here, so it's already in place.`, [2, 3]); return; }
        const pv = it[hi].v;
        let s = lo;
        const scope = (i) => i < lo || i > hi;
        add(v((i) => (i === hi ? 'pivot' : scope(i) && !fin.has(i) ? 'muted' : undefined), { store: s }), `Working on positions ${lo} to ${hi}. The last value \`${pv}\` is the pivot.`, [4, 5], { pivot: pv, store: s });
        for (let j = lo; j < hi; j++) {
          const J = j, S = s, sm = it[j].v < pv;
          add(v((i) => (i === hi ? 'pivot' : i === J ? 'compare' : i >= lo && i < S ? 'active' : scope(i) && !fin.has(i) ? 'muted' : undefined), { store: s, j }), `Is ${it[j].v} smaller than the pivot ${pv}? ${sm ? 'Yes, move it into the small group.' : 'No, leave it.'}`, 7, { pivot: pv, store: s, j });
          if (sm) {
            [it[j], it[s]] = [it[s], it[j]]; s++;
            const S2 = s;
            add(v((i) => (i === hi ? 'pivot' : i >= lo && i < S2 ? 'active' : scope(i) && !fin.has(i) ? 'muted' : undefined), { store: s, j }), 'Swap, then the small group grows by one.', [8, 9], { pivot: pv, store: s, j });
          }
        }
        [it[s], it[hi]] = [it[hi], it[s]];
        fin.add(s);
        add(v(), `Pivot \`${pv}\` swaps into position ${s}. Everything left is smaller, everything right is bigger or equal. It never moves again.`, 10, { pivot: pv });
        qs(lo, s - 1); qs(s + 1, hi);
      }
      qs(0, it.length - 1);
      add(v(() => 'done'), 'Sorted in place. Usually O(n log n). A bad pivot every time, as with sorted input here, makes it O(n²).', null);
    },
  });

  defViz('bs-basic', {
    title: 'Binary search: halve the problem',
    intro: 'Check the middle of a sorted list. Half of what remains is ruled out with a single comparison.',
    inputs: [{ k: 'arr', label: 'Numbers (auto sorted)', type: 'nums', def: [3, 8, 12, 17, 23, 31, 42, 56], min: 1, max: 9, randHi: 60 }, { k: 't', label: 'Find', type: 'num', def: 31, lo: 0, hi: 99 }],
    code: 'def binary_search(a, target):\n    lo, hi = 0, len(a) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if a[mid] == target:\n            return mid\n        if a[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1',
    build({ arr, t }, add) {
      const a = arr.slice().sort((x, y) => x - y);
      let lo = 0, hi = a.length - 1, n = 0;
      const v = (mid, st) => cells('a', a, { s: 48, ptr: { lo, hi, ...(mid != null ? { mid } : {}) }, st: (i) => (i === mid ? st : i < lo || i > hi ? 'muted' : 'active2') });
      add(v(), `Looking for ${t}. The answer could be anywhere from ${lo} to ${hi}.`, 2, { lo, hi });
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        n++;
        add(v(mid, 'compare'), `Middle is index ${mid}, holding ${a[mid]}.`, 4, { lo, hi, mid, checks: n });
        if (a[mid] === t) { add(v(mid, 'done'), `Found ${t} at index ${mid} after ${n} check${n > 1 ? 's' : ''}. A plain scan could take ${a.length}.`, 6, { lo, hi, mid, checks: n }); return; }
        if (a[mid] < t) {
          add(v(mid, 'bad'), `${a[mid]} is less than ${t}, and everything left of it is smaller still. Throw that half away.`, 8, { lo, hi, mid, checks: n });
          lo = mid + 1;
        } else {
          add(v(mid, 'bad'), `${a[mid]} is more than ${t}, and everything right of it is bigger still. Throw that half away.`, 10, { lo, hi, mid, checks: n });
          hi = mid - 1;
        }
      }
      add(cells('a', a, { s: 48, st: () => 'muted' }), `\`lo\` passed \`hi\`, so nothing is left to check. ${t} isn't in the list.`, 11, { result: -1, checks: n });
    },
  });

  defViz('bs-first', {
    title: 'Find the first position with duplicates',
    intro: 'Even after finding the target, keep searching left. This is called the lower bound.',
    inputs: [{ k: 'arr', label: 'Numbers (auto sorted)', type: 'nums', def: [1, 3, 3, 3, 5, 5, 8], min: 1, max: 9, randHi: 8 }, { k: 't', label: 'Target', type: 'num', def: 3, lo: 0, hi: 99 }],
    code: 'def lower_bound(a, target):\n    lo, hi = 0, len(a)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo',
    build({ arr, t }, add) {
      const a = arr.slice().sort((x, y) => x - y);
      let lo = 0, hi = a.length;
      add(cells('a', a, { s: 48, ptr: { lo, hi } }), `Find the first slot with a value of at least ${t}. \`hi\` starts one past the end.`, 2, { lo, hi });
      while (lo < hi) {
        const mid = (lo + hi) >> 1, less = a[mid] < t;
        const L = lo, H = hi;
        add(cells('a', a, { s: 48, ptr: { lo, hi, mid }, st: (i) => (i === mid ? 'compare' : i < L || i >= H ? 'muted' : undefined) }), less ? `${a[mid]} < ${t}, so the answer is further right.` : `${a[mid]} ≥ ${t}. This slot might be the answer, but an earlier one might too. Keep it and look left.`, less ? [5, 6] : 8, { lo, hi, mid });
        if (less) lo = mid + 1; else hi = mid;
      }
      add(cells('a', a, { s: 48, ptr: { 'answer': lo }, st: (i) => (i === lo ? 'done' : undefined) }), lo < a.length ? `\`lo\` and \`hi\` meet at index ${lo}. That's the first slot holding at least ${t}.` : `They meet past the end: every value is smaller than ${t}.`, 9, { answer: lo });
    },
  });

  defViz('bs-answer', {
    title: 'Binary search on the answer',
    intro: 'Sometimes you search possible answers, not a list. Here: what is the slowest eating speed that still finishes the bananas in time?',
    inputs: [{ k: 'p', label: 'Banana piles', type: 'nums', def: [3, 6, 7, 11], min: 1, max: 6, lo: 1, hi: 30, randHi: 20 }, { k: 'h', label: 'Hours allowed', type: 'num', def: 8, lo: 1, hi: 30 }],
    code: 'def hours_needed(piles, speed):\n    return sum((p + speed - 1) // speed for p in piles)\n\ndef min_speed(piles, h):\n    lo, hi = 1, max(piles)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if hours_needed(piles, mid) <= h:\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo',
    build({ p, h }, add) {
      h = Math.max(h, p.length);
      const need = (s) => p.reduce((a, x) => a + Math.ceil(x / s), 0);
      let lo = 1, hi = Math.max(...p);
      const range = Array.from({ length: hi }, (_, i) => i + 1);
      const S = range.length > 12 ? 24 : 36, G = 3;
      const r = (mid, st) => [label('h', 0, 12, `Piles: ${p.join(', ')}   ·   allowed: ${h} hours`), label('h2', 0, 36, 'Possible speeds (bananas per hour)'), cells('r', range, { y: 82, s: S, gap: G, idx: false, ptr: { lo: lo - 1, hi: hi - 1, ...(mid ? { mid: mid - 1 } : {}) }, st: (i) => { const v = i + 1; return v === mid ? st : v < lo || v > hi ? 'muted' : 'active2'; } })];
      add(r(), `The answer is between 1 and ${hi}. If a speed works, every faster speed works too. That's what lets us halve the range.`, 5, { lo, hi });
      while (lo < hi) {
        const mid = (lo + hi) >> 1, n = need(mid);
        add(r(mid, 'compare'), `Try speed ${mid}: it takes ${n} hours.`, [7, 8], { lo, hi, mid, hours: n });
        if (n <= h) {
          add(r(mid, 'done'), `${n} ≤ ${h}, so it works. Maybe a slower speed works too, so \`hi = ${mid}\`.`, 9, { lo, hi, mid, hours: n });
          hi = mid;
        } else {
          add(r(mid, 'bad'), `${n} > ${h}, too slow. Rule out ${mid} and everything slower, so \`lo = ${mid + 1}\`.`, 11, { lo, hi, mid, hours: n });
          lo = mid + 1;
        }
      }
      add(r(lo, 'done'), `\`lo\` meets \`hi\`. The minimum speed is ${lo}, taking ${need(lo)} hours.`, 12, { answer: lo });
    },
  });

  defViz('ll-ops', {
    title: 'Linked list: walk, insert, delete',
    intro: "Nodes can live anywhere in memory. Each one only knows the next. Inserting means re-pointing arrows, so nothing has to shift.",
    inputs: [{ k: 'arr', label: 'Values', type: 'nums', def: [4, 8, 15, 23], min: 2, max: 5 }, { k: 'val', label: 'New value', type: 'num', def: 42, lo: 0, hi: 99 }, { k: 'pos', label: 'Insert after index', type: 'num', def: 1, lo: 0, hi: 4 }],
    code: 'class Node:\n    def __init__(self, val, next=None):\n        self.val = val\n        self.next = next\n\ndef insert_after(node, val):\n    new = Node(val)\n    new.next = node.next\n    node.next = new\n\ndef delete_after(node):\n    node.next = node.next.next',
    build({ arr, val, pos }, add) {
      pos = Math.min(pos, arr.length - 2);
      const nodes = arr.map((v, i) => ({ id: i, v }));
      const S = 46, G = 34, X = (i) => i * (S + G);
      add(chain('l', nodes, { ptr: { head: 0 } }), 'Each box holds a value and an arrow to the next box. `head` marks the start.', 1);
      for (let i = 0; i <= pos; i++) add(chain('l', nodes, { ptr: { head: 0, cur: i }, st: (id) => (id === i ? 'active' : id < i ? 'muted' : undefined) }), i < pos ? `No jumping to an index here. To reach index ${pos} we follow arrows one at a time: O(n).` : `Reached index ${pos}.`, 6, { cur: nodes[i].v });
      const A = nodes[pos], B = nodes[pos + 1], nid = 'N';
      const arrows = (first, second) => {
        const out = [];
        nodes.forEach((n, i) => {
          out.push(box('ln' + n.id, X(i), 70, S, S, n.v, { state: n.id === pos ? 'active' : undefined }));
          if (i < nodes.length - 1 && !(i === pos)) out.push(line('la' + n.id, X(i) + S, 93, X(i + 1) - 3, 93, { arrow: 1 }));
        });
        out.push(line('lan', X(nodes.length - 1) + S, 93, X(nodes.length - 1) + S + 22, 93, { arrow: 1 }));
        out.push(text('lnone', X(nodes.length - 1) + S + 44, 98, 'None', { cls: 'idx', size: 13 }));
        out.push(box('new', X(pos) + S / 2 + G / 2 + S / 2 - S / 2, 150, S, S, val, { state: 'done' }));
        out.push(first);
        out.push(second);
        return out;
      };
      const midX = X(pos) + S / 2 + G / 2 + S / 2;
      add(arrows(line('la' + pos, X(pos) + S, 93, X(pos + 1) - 3, 93, { arrow: 1 })), `Make a new node holding \`${val}\`. Nothing is connected yet.`, 7);
      add(arrows(line('la' + pos, X(pos) + S, 93, X(pos + 1) - 3, 93, { arrow: 1 }), line('nw', midX + 6, 150, X(pos + 1) + S / 2 - 4, 118, { arrow: 1, state: 'path' })), `Point the new node at \`${B.v}\`. Do this first, otherwise the rest of the list would be lost.`, 8);
      add(arrows(line('la' + pos, X(pos) + S / 2, 116, midX - 6, 148, { arrow: 1, state: 'path' }), line('nw', midX + 6, 150, X(pos + 1) + S / 2 - 4, 118, { arrow: 1 })), `Point \`${A.v}\` at the new node. Done in 2 steps, O(1), with nothing shifted.`, 9);
      const n2 = nodes.slice(); n2.splice(pos + 1, 0, { id: 'new', v: val });
      add(chain('l', n2, { y: 70, ptr: { head: 0 }, st: (id) => (id === 'new' ? 'done' : undefined) }), 'Tidied up: the new node sits in the chain.', 9);
      add(chain('l', n2, { y: 70, ptr: { head: 0, cur: pos }, st: (id) => (id === 'new' ? 'bad' : id === pos ? 'active' : undefined) }), 'To delete it, make the node before skip over it.', 11);
      add(chain('l', nodes, { y: 70, ptr: { head: 0 }, st: (id) => (id === pos ? 'done' : undefined) }), '`node.next = node.next.next`. Nothing points to the removed node, so Python frees it.', 12);
    },
  });

  defViz('ll-reverse', {
    title: 'Reverse a linked list',
    intro: 'Three pointers walk along, flipping one arrow per step. Save next first, or you lose the rest of the list.',
    inputs: [{ k: 'arr', label: 'Values', type: 'nums', def: [1, 2, 3, 4, 5], min: 2, max: 6 }],
    code: 'def reverse(head):\n    prev = None\n    cur = head\n    while cur:\n        nxt = cur.next\n        cur.next = prev\n        prev = cur\n        cur = nxt\n    return prev',
    build({ arr }, add) {
      const n = arr.length, S = 46, G = 36, Y = 70, X = (i) => i * (S + G);
      const draw = (flip, cur, prev, nxt, st) => {
        const out = arr.map((v, i) => box('n' + i, X(i), Y, S, S, v, { state: st ? st(i) : i === cur ? 'active' : i < flip ? 'done' : undefined }));
        for (let i = 0; i < n; i++) {
          if (i < flip) { if (i > 0) out.push(line('a' + i, X(i), Y + S / 2, X(i - 1) + S + 3, Y + S / 2, { arrow: 1, state: 'path' })); }
          else if (i < n - 1) out.push(line('a' + i, X(i) + S, Y + S / 2, X(i + 1) - 3, Y + S / 2, { arrow: 1 }));
        }
        const P = {}, stack = {};
        const tag = (nm, i) => { if (i == null || i < 0 || i >= n) return null; const k = (stack[i] = (stack[i] || 0) + 1) - 1; return ptr('p' + nm, X(i) + S / 2, Y - 3 - k * 20, nm); };
        return [out, tag('prev', prev), tag('cur', cur), tag('nxt', nxt)];
      };
      add(draw(0, 0, null, null), '`prev` starts as `None`, and `cur` starts at the head.', [2, 3], { prev: 'None', cur: arr[0] });
      for (let i = 0; i < n; i++) {
        add(draw(i, i, i - 1, i + 1), `Save the next node so we don't lose it: \`nxt = ${i + 1 < n ? arr[i + 1] : 'None'}\`.`, 5, { prev: i ? arr[i - 1] : 'None', cur: arr[i], nxt: i + 1 < n ? arr[i + 1] : 'None' });
        add(draw(i + 1, i, i - 1, i + 1), `Flip the arrow: \`${arr[i]}\` now points back to \`${i ? arr[i - 1] : 'None'}\`.`, 6, { prev: i ? arr[i - 1] : 'None', cur: arr[i], nxt: i + 1 < n ? arr[i + 1] : 'None' });
        add(draw(i + 1, i + 1, i, null), 'Step forward: `prev` takes `cur`, then `cur` takes `nxt`.', [7, 8], { prev: arr[i], cur: i + 1 < n ? arr[i + 1] : 'None' });
      }
      add(draw(n, null, n - 1, null, () => 'done'), `\`cur\` is \`None\`, so we stop. \`prev\` at \`${arr[n - 1]}\` is the new head. Time O(n), space O(1).`, 9, { 'new head': arr[n - 1] });
    },
  });

  defViz('ll-floyd', {
    title: 'Cycle detection: tortoise and hare',
    intro: 'A slow pointer moves one step, a fast one moves two. On a circular track the fast one must catch the slow one.',
    inputs: [{ k: 'tail', label: 'Nodes before loop', type: 'num', def: 2, lo: 0, hi: 3 }, { k: 'ring', label: 'Nodes in loop', type: 'num', def: 5, lo: 2, hi: 7 }],
    code: 'def has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False',
    build({ tail, ring }, add) {
      const n = tail + ring, R = 74, cx = tail * 62 + R + 30, cy = 110, pos = [];
      for (let i = 0; i < tail; i++) pos.push([i * 62 + 20, cy]);
      for (let k = 0; k < ring; k++) { const a = Math.PI + (2 * Math.PI * k) / ring; pos.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
      const next = (i) => (i === n - 1 ? tail : i + 1);
      const scene = (s, f, st) => {
        const out = [];
        for (let i = 0; i < n; i++) { const j = next(i); out.push(Sh.edgeBetween('e' + i, pos[i][0], pos[i][1], pos[j][0], pos[j][1], 18, { arrow: 1 })); }
        for (let i = 0; i < n; i++) out.push(circ('c' + i, pos[i][0], pos[i][1], 18, i, { state: i === s && i === f ? st || 'done' : i === s ? 'active' : i === f ? 'compare' : undefined }));
        return out;
      };
      let s = 0, f = 0, step = 0;
      add(scene(s, -1, 'active'), 'Both pointers start at node 0. Blue is slow, yellow is fast.', 2, { slow: s, fast: f });
      while (true) {
        s = next(s); f = next(next(f)); step++;
        if (s === f) { add(scene(s, f, 'done'), `Round ${step}: both land on node ${s}. They met, so there's a cycle. Time O(n), extra space O(1).`, [6, 7], { slow: s, fast: f, result: 'True' }); break; }
        add(scene(s, f), `Round ${step}: slow moves 1 to node ${s}, fast moves 2 to node ${f}.`, [4, 5], { slow: s, fast: f });
      }
    },
  });

  defViz('stack-ops', {
    title: 'A stack: last in, first out',
    intro: 'Like a pile of plates, you only touch the top. A Python list works perfectly: the end of the list is the top.',
    inputs: [{ k: 'arr', label: 'Values to push', type: 'nums', def: [3, 7, 1, 9], min: 1, max: 6 }],
    code: 'stack = []\nfor v in values:\n    stack.append(v)   # push\nprint(stack[-1])      # peek\nwhile stack:\n    v = stack.pop()   # pop',
    build({ arr }, add) {
      const s = [];
      const it = arr.map((v, i) => ({ v, id: i }));
      const v = (st) => stack('s', s, { x: 60, y: 230, cap: 6, st });
      add(v(), 'An empty stack.', 1, { size: 0 });
      it.forEach((x) => { s.push(x); add(v((i) => (i === s.length - 1 ? 'active' : undefined)), `Push \`${x.v}\`. It lands on top. O(1).`, 3, { top: x.v, size: s.length }); });
      add(v((i) => (i === s.length - 1 ? 'compare' : undefined)), `Peek shows the top item \`${s[s.length - 1].v}\` without removing it.`, 4, { top: s[s.length - 1].v, size: s.length });
      const out = [];
      while (s.length) {
        const x = s.pop();
        out.push(x.v);
        add([v(), cells('o', out, { x: 200, y: 100, s: 40, gap: 4, idx: false, label: 'popped, in order' })], `Pop gives \`${x.v}\`. The last one in is the first one out.`, 6, { popped: x.v, size: s.length });
      }
      add([v(), cells('o', out, { x: 200, y: 100, s: 40, gap: 4, idx: false, label: 'popped, in order', st: () => 'done' })], 'The order came out reversed. That is the signature of a stack.', 5);
    },
  });

  defViz('stack-parens', {
    title: 'Checking brackets with a stack',
    intro: 'Every opening bracket waits on the stack. Every closing bracket must match whatever is on top.',
    inputs: [{ k: 's', label: 'Brackets', type: 'word', def: '{[()]}', max: 10, only: /^[()[\]{}]+$/, onlyMsg: 'use only ( ) [ ] { }.' }],
    code: 'def is_valid(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for ch in s:\n        if ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n        else:\n            stack.append(ch)\n    return not stack',
    build({ s }, add) {
      const c = s.split(''), pairs = { ')': '(', ']': '[', '}': '{' }, st = [];
      let id = 0;
      const v = (i, cs, ss) => [cells('b', c, { s: 42, gap: 4, y: 20, idx: false, st: (k) => (k === i ? cs || 'active' : k < i ? 'muted' : undefined) }), stack('s', st, { x: 0, y: 270, cap: 4, w: 70, h: 32, st: ss, label: 'stack' })];
      add(v(-1), 'Read the brackets from left to right.', 3);
      for (let i = 0; i < c.length; i++) {
        const ch = c[i];
        if (pairs[ch]) {
          const top = st[st.length - 1];
          const ok = top && top.v === pairs[ch];
          add(v(i, ok ? 'done' : 'bad', (k) => (k === st.length - 1 ? (ok ? 'done' : 'bad') : undefined)), ok ? `\`${ch}\` closes the \`${top.v}\` on top. A match.` : top ? `\`${ch}\` needs \`${pairs[ch]}\`, but the top is \`${top.v}\`. Not valid.` : `\`${ch}\` has nothing to close. Not valid.`, ok ? 6 : [6, 7], { ch, result: ok ? '…' : 'False' });
          if (!ok) return;
          st.pop();
          add(v(i, 'done'), 'Pop the matched bracket away.', 6, { ch });
        } else {
          st.push({ v: ch, id: id++ });
          add(v(i, 'active', (k) => (k === st.length - 1 ? 'active' : undefined)), `\`${ch}\` is an opener. It waits on the stack for its partner.`, 9, { ch });
        }
      }
      add(v(c.length), st.length ? `Openers are still waiting (${st.map((x) => x.v).join('')}), so it's not valid.` : 'The stack is empty, so every bracket found its partner. Valid!', 10, { result: st.length ? 'False' : 'True' });
    },
  });

  defViz('mono-nge', {
    title: 'Monotonic stack: next greater element',
    intro: 'The stack keeps positions still waiting for a bigger value. When one arrives, everyone smaller gets their answer at once.',
    inputs: [{ k: 'arr', label: 'Numbers', type: 'nums', def: [2, 7, 3, 5, 4, 8], min: 2, max: 7, randHi: 20 }],
    code: 'def next_greater(nums):\n    ans = [-1] * len(nums)\n    stack = []  # indexes waiting\n    for i, x in enumerate(nums):\n        while stack and nums[stack[-1]] < x:\n            ans[stack.pop()] = x\n        stack.append(i)\n    return ans',
    build({ arr }, add) {
      const ans = arr.map(() => -1), st = [];
      const v = (i, hot) => [cells('a', arr, { s: 46, ptr: i != null ? { i } : {}, st: (k) => (k === i ? 'active' : hot === k ? 'done' : st.includes(k) ? 'compare' : undefined) }), cells('r', ans, { y: 100, s: 46, idx: false, label: 'ans', st: (k) => (hot === k ? 'done' : ans[k] !== -1 ? 'done2' : undefined) }), stack('s', st.map((k) => ({ id: k, v: arr[k] })), { x: 2, y: 306, w: 62, h: 26, cap: 5, label: 'stack (values shown)' })];
      add(v(), 'Every answer starts at -1, meaning nothing bigger to the right. The stack starts empty.', [2, 3]);
      arr.forEach((x, i) => {
        add(v(i), `Now at \`${x}\`. Can it answer anyone waiting?`, [4, 5], { i, x });
        while (st.length && arr[st[st.length - 1]] < x) {
          const k = st.pop();
          ans[k] = x;
          add(v(i, k), `${arr[k]} < ${x}, so the next greater value for ${arr[k]} is \`${x}\`. Pop it.`, 6, { i, x });
        }
        st.push(i);
        add(v(i), `\`${x}\` joins the stack and waits. Values in the stack always decrease going up.`, 7, { i, x });
      });
      add(v(), 'Done. Each index was pushed once and popped at most once, so this is O(n) despite the nested loop.', 8, { ans: JSON.stringify(ans) });
    },
  });

  defViz('queue-ops', {
    title: 'A queue: first in, first out',
    intro: 'People join at the back and leave from the front. Use collections.deque, because list.pop(0) has to shift everything.',
    inputs: [{ k: 'arr', label: 'Arriving', type: 'nums', def: [5, 2, 9, 4], min: 1, max: 6 }],
    code: 'from collections import deque\nq = deque()\nfor v in arriving:\n    q.append(v)      # join the back\nwhile q:\n    v = q.popleft()  # leave the front\n    print("serve", v)',
    build({ arr }, add) {
      const q = [], S = 50, G = 8, out = [];
      const items = arr.map((v, i) => ({ v, id: i }));
      const v = (hot) => [
        label('f', 0, 30, 'front'),
        q.map((x, i) => box('q' + x.id, i * (S + G), 38, S, S, x.v, { state: x.id === hot ? 'active' : i === 0 ? 'compare' : undefined })),
        out.length ? label('o', 0, 126, 'served') : null,
        out.map((x, i) => box('q' + x.id, i * (S + G), 134, S, S, x.v, { state: 'done' })),
      ];
      add(v(), 'An empty line.', 2, { size: 0 });
      items.forEach((x) => { q.push(x); add(v(x.id), `\`${x.v}\` joins the back of the line. O(1).`, 4, { size: q.length }); });
      while (q.length) {
        const x = q.shift();
        out.push(x);
        add(v(), `\`${x.v}\` was waiting longest, so it's served first. With a deque this is O(1).`, [6, 7], { size: q.length, served: x.v });
      }
      add(v(), 'They left in exactly the order they came: first in, first out.', 5);
    },
  });

  defViz('deque-window', {
    title: 'Sliding window maximum with a deque',
    intro: 'The deque keeps candidates, biggest at the front. Anything smaller than a newcomer can never win, so it leaves.',
    inputs: [{ k: 'arr', label: 'Numbers', type: 'nums', def: [1, 3, 2, 5, 4, 2, 6], min: 2, max: 8, randHi: 20 }, { k: 'k', label: 'Window k', type: 'num', def: 3, lo: 1, hi: 8 }],
    code: 'from collections import deque\ndef window_max(nums, k):\n    dq, out = deque(), []\n    for i, x in enumerate(nums):\n        while dq and nums[dq[-1]] <= x:\n            dq.pop()\n        dq.append(i)\n        if dq[0] <= i - k:\n            dq.popleft()\n        if i >= k - 1:\n            out.append(nums[dq[0]])\n    return out',
    build({ arr, k }, add) {
      k = Math.min(k, arr.length);
      const dq = [], out = [], S = 46 + 6;
      const v = (i, hot) => {
        const l = Math.max(0, i - k + 1);
        return [i != null ? box('win', l * S - 4, -4, (i - l + 1) * S + 2, 54, '', { state: 'window' }) : null, cells('a', arr, { s: 46, st: (x) => (x === i ? 'active' : undefined) }), label('d', 0, 96, 'deque (front on the left)'), dq.map((d, p) => box('d' + d, p * 52, 104, 46, 46, arr[d], { state: d === hot ? 'bad' : p === 0 ? 'done' : 'compare' })), label('o', 0, 174, 'answers'), cells('o', out, { y: 182, s: 46, idx: false, st: (p) => (p === out.length - 1 ? 'done' : undefined) })];
      };
      arr.forEach((x, i) => {
        while (dq.length && arr[dq[dq.length - 1]] <= x) {
          const d = dq[dq.length - 1];
          add(v(i, d), `\`${arr[d]}\` is no bigger than the newcomer \`${x}\`, so it can never be a maximum again. Remove it from the back.`, [5, 6], { i, x });
          dq.pop();
        }
        dq.push(i);
        add(v(i), `\`${x}\` joins the back of the deque.`, 7, { i, x });
        if (dq[0] <= i - k) {
          add(v(i, dq[0]), `\`${arr[dq[0]]}\` has fallen out of the window. Remove it from the front.`, [8, 9], { i, x });
          dq.shift();
        }
        if (i >= k - 1) {
          out.push(arr[dq[0]]);
          add(v(i), `The window is full. The front of the deque, \`${arr[dq[0]]}\`, is its maximum.`, [10, 11], { i, x, max: arr[dq[0]] });
        }
      });
      add(v(arr.length - 1), `Finished. Each index enters and leaves once, so this is O(n), and the answer is [${out.join(', ')}].`, 12);
    },
  });

  defViz('hash-buckets', {
    title: 'Inside a hash table',
    intro: 'A hash function turns a key into a bucket number. Looking up just repeats that sum, so there is no searching.',
    inputs: [{ k: 'words', label: 'Keys', type: 'words', def: ['cat', 'dog', 'owl', 'bee', 'fox', 'act'], min: 1, max: 7, maxLen: 5 }, { k: 'find', label: 'Look up', type: 'word', def: 'act', max: 5, only: /^[a-z]+$/, onlyMsg: 'use lowercase letters.' }, { k: 'm', label: 'Buckets', type: 'num', def: 5, lo: 2, hi: 7 }],
    code: 'def bucket(key, size):\n    return sum(ord(c) for c in key) % size\n\ntable = [[] for _ in range(size)]\nfor key in keys:\n    table[bucket(key, size)].append(key)\n\ndef has(key):\n    return key in table[bucket(key, size)]',
    build({ words, find, m }, add) {
      const hash = (w) => [...w].reduce((a, c) => a + c.charCodeAt(0), 0);
      const tb = Array.from({ length: m }, () => []);
      const rows = (hotB, hotK, st) => {
        const out = [];
        tb.forEach((b, i) => {
          out.push(box('b' + i, 0, 40 + i * 46, 42, 40, i, { state: i === hotB ? 'compare' : 'head' }));
          b.forEach((w, k) => {
            if (k === 0) out.push(line('bl' + i, 44, 60 + i * 46, 60, 60 + i * 46, { arrow: 1 }));
            else out.push(line('w' + w + k, 62 + k * 72 - 12, 60 + i * 46, 62 + k * 72 - 2, 60 + i * 46, { arrow: 1 }));
            out.push(box('k' + w + k, 62 + k * 72, 40 + i * 46, 60, 40, w, { state: w === hotK ? st || 'active' : undefined, size: 15 }));
          });
        });
        return out;
      };
      add(rows(), `A table of ${m} empty buckets.`, 4);
      words.forEach((w) => {
        const h = hash(w), b = h % m;
        add([rows(b), big('f', 0, 18, `${w}: sum of codes ${h}, ${h} % ${m} = ${b}`, { size: 15 })], `Hash \`${w}\`: add its letter codes to get ${h}, then take the remainder by ${m}. Bucket ${b}.`, [1, 2], { key: w, bucket: b });
        const coll = tb[b].length > 0;
        tb[b].push(w);
        add([rows(b, w), big('f', 0, 18, `${w} goes in bucket ${b}`, { size: 15 })], coll ? `Bucket ${b} is already used. That's a collision. We chain the new key after the old one.` : `\`${w}\` goes in bucket ${b}.`, 6, { key: w, bucket: b });
      });
      const h = hash(find), b = h % m, present = tb[b].includes(find);
      add([rows(b), big('f', 0, 18, `look up ${find}: ${h} % ${m} = ${b}`, { size: 15 })], `Look up \`${find}\`: the same sum sends us straight to bucket ${b}. The other buckets are never touched.`, 9, { bucket: b });
      add([rows(b, present ? find : null, 'done'), big('f', 0, 18, present ? `${find} found` : `${find} not in table`, { size: 15 })], present ? `Found it after a very short check. With a good hash and few collisions, this is O(1) on average.` : `Bucket ${b} doesn't contain it, so \`${find}\` is not in the table. We still only looked in one bucket.`, 9, { found: present ? 'True' : 'False' });
    },
  });

  defViz('hash-twosum', {
    title: 'Two Sum with a dict',
    intro: 'For each number, ask: has the partner I need already been seen? The dict answers in one step.',
    inputs: [{ k: 'arr', label: 'Numbers', type: 'nums', def: [7, 2, 11, 15, 4, 5], min: 2, max: 8, randHi: 20 }, { k: 't', label: 'Target', type: 'num', def: 9, lo: 0, hi: 99 }],
    code: 'def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return None',
    build({ arr, t }, add) {
      const seen = [], m = {};
      const tbl = (hot) => [label('d', 0, 96, 'seen  (value → index)'), seen.map((x, i) => [box('dk' + x, i * 58, 104, 54, 34, x, { state: x === hot ? 'done' : undefined }), box('dv' + x, i * 58, 140, 54, 30, m[x], { state: x === hot ? 'done' : 'head', size: 14 })])];
      add([cells('a', arr, { s: 48 }), tbl()], `Find two numbers adding up to ${t}. \`seen\` starts empty.`, 2);
      for (let i = 0; i < arr.length; i++) {
        const x = arr[i], need = t - x, I = i;
        add([cells('a', arr, { s: 48, ptr: { i }, st: (k) => (k === I ? 'active' : k < I ? 'muted' : undefined) }), tbl()], `At \`${x}\`, we need a partner of ${t} - ${x} = ${need}.`, [3, 4], { i, x, need });
        if (m[need] !== undefined) {
          const j = m[need];
          add([cells('a', arr, { s: 48, ptr: { i }, st: (k) => (k === I || k === j ? 'done' : 'muted') }), tbl(need)], `${need} is in the dict, at index ${j}. Answer: [${j}, ${i}]. Only one pass, so O(n).`, [5, 6], { answer: `[${j}, ${i}]` });
          return;
        }
        if (m[x] === undefined) seen.push(x);
        m[x] = i;
        add([cells('a', arr, { s: 48, ptr: { i }, st: (k) => (k === I ? 'active' : k < I ? 'muted' : undefined) }), tbl(x)], `${need} isn't there yet. Save \`${x}\` for later numbers.`, 7, { i, x, need });
      }
      add([cells('a', arr, { s: 48, st: () => 'muted' }), tbl()], `We reached the end with no match, so no pair adds up to ${t}.`, 8);
    },
  });

  defViz('hash-group', {
    title: 'Grouping with a dict of lists',
    intro: 'Give every item a key so that items that belong together share the same key. Here the key is the sorted letters.',
    inputs: [{ k: 'words', label: 'Words', type: 'words', def: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'], min: 1, max: 7, maxLen: 5 }],
    code: 'from collections import defaultdict\n\ndef group(words):\n    groups = defaultdict(list)\n    for w in words:\n        key = "".join(sorted(w))\n        groups[key].append(w)\n    return list(groups.values())',
    build({ words }, add) {
      const g = {}, order = [];
      const view = (hot, i) => [cells('w', words, { s: 52, gap: 4, idx: false, st: (k) => (k === i ? 'active' : i != null && k < i ? 'muted' : undefined) }), order.map((key, r) => [box('gk' + key, 0, 84 + r * 44, 62, 38, key, { state: key === hot ? 'compare' : 'head', size: 14 }), g[key].map((w, c) => box('gv' + w + c, 72 + c * 62, 84 + r * 44, 56, 38, w, { state: key === hot && c === g[key].length - 1 ? 'done' : undefined, size: 14 }))])];
      add(view(), 'Empty dict. Keys will appear as we need them.', 4);
      words.forEach((w, i) => {
        const key = [...w].sort().join('');
        add(view(g[key] ? key : null, i), `Sort the letters of \`${w}\` to get the key \`${key}\`.`, 6, { word: w, key });
        if (!g[key]) { g[key] = []; order.push(key); }
        g[key].push(w);
        add(view(key, i), `Add \`${w}\` to the \`${key}\` group.`, 7, { word: w, key });
      });
      add(view(), `${order.length} group${order.length > 1 ? 's' : ''} from ${words.length} words. Each lookup is O(1) on average, so the time is spent only on sorting each word's letters.`, 8);
    },
  });
})();
