/* Animations: Python foundations, complexity, arrays, strings, recursion */
(function () {
  const { box, circ, line, text, cells, bars, grid, stack, label, big, tree } = Sh;

  defViz('vars-names', {
    title: 'A variable is a name tag',
    intro: 'Watch names point at values. When two names share one list, a change through one name shows through the other.',
    inputs: [{ k: 'a', label: 'Value of a', type: 'num', def: 5, lo: 0, hi: 99 }],
    code: 'a = value\nb = a\na = a + 2\nnums = [1, 2]\nsame = nums\nsame.append(3)\nprint(nums)',
    build({ a }, add) {
      const N = (id, y, t, st) => box('n' + id, 0, y, 70, 38, t, { state: st });
      const O = (id, y, t, st, w) => box('o' + id, 220, y, w || 70, 38, t, { state: st });
      const A = (id, y1, y2, st) => line('l' + id, 72, y1 + 19, 216, y2 + 19, { arrow: 1, state: st });
      const heading = [label('h1', 0, -12, 'Names'), label('h2', 220, -12, 'Values in memory')];
      add([heading, N('a', 0, 'a', 'active'), O('v', 0, a, 'active'), A('a', 0, 0)], `Python creates the value \`${a}\`, then ties the name \`a\` to it.`, 1, { a });
      add([heading, N('a', 0, 'a'), N('b', 56, 'b', 'active'), O('v', 0, a), A('a', 0, 0), A('b', 56, 0, 'path')], `\`b = a\` makes no copy. \`b\` becomes a second name tag on the same value.`, 2, { a, b: a });
      add([heading, N('a', 0, 'a', 'active'), N('b', 56, 'b'), O('v', 56, a), O('w', 0, a + 2, 'active'), A('a', 0, 0, 'path'), A('b', 56, 56)], `Numbers can't change. So \`a + 2\` makes a new value \`${a + 2}\` and \`a\` moves to it. \`b\` still sees \`${a}\`.`, 3, { a: a + 2, b: a });
      const base = [heading, N('a', 0, 'a'), N('b', 56, 'b'), O('v', 56, a), O('w', 0, a + 2), A('a', 0, 0), A('b', 56, 56)];
      add([base, N('nums', 112, 'nums', 'active'), O('L', 112, '[1, 2]', 'active', 120), A('nums', 112, 112)], 'A list is one object in memory. `nums` is tied to it.', 4, { nums: '[1, 2]' });
      add([base, N('nums', 112, 'nums'), N('same', 168, 'same', 'active'), O('L', 112, '[1, 2]', null, 120), A('nums', 112, 112), A('same', 168, 112, 'path')], '`same = nums` gives the same list a second name. There is still only one list.', 5, { nums: '[1, 2]', same: '[1, 2]' });
      add([base, N('nums', 112, 'nums'), N('same', 168, 'same', 'active'), O('L', 112, '[1, 2, 3]', 'compare', 120), A('nums', 112, 112), A('same', 168, 112, 'path')], 'Lists can change in place. `same.append(3)` edits the shared list.', 6, { nums: '[1, 2, 3]', same: '[1, 2, 3]' });
      add([base, N('nums', 112, 'nums', 'done'), N('same', 168, 'same'), O('L', 112, '[1, 2, 3]', 'done', 120), A('nums', 112, 112, 'path'), A('same', 168, 112)], 'Printing `nums` shows `[1, 2, 3]` even though we used the other name. Use `nums.copy()` when you need a separate list.', 7, { 'print': '[1, 2, 3]' });
    },
  });

  defViz('loop-trace', {
    title: 'A loop visiting each number',
    intro: 'The loop looks at one number at a time. The if decides whether the number gets added.',
    inputs: [{ k: 'nums', label: 'Numbers', type: 'nums', def: [3, 8, 5, 4, 10], min: 1, max: 8, randHi: 20 }],
    code: 'total = 0\nfor x in nums:\n    if x % 2 == 0:\n        total += x\nprint(total)',
    build({ nums }, add) {
      let total = 0;
      const tot = (st) => box('tot', 0, 100, 110, 50, total, { state: st });
      const tl = label('tl', 0, 92, 'total');
      add([cells('a', nums, {}), tl, tot('active')], 'Start the running total at `0`.', 1, { total });
      nums.forEach((x, i) => {
        const st = (j) => (j === i ? 'active' : j < i ? 'muted' : undefined);
        add([cells('a', nums, { st, ptr: { x: i } }), tl, tot()], `The loop picks the next number: \`x = ${x}\`.`, 2, { x, total });
        const even = x % 2 === 0;
        add([cells('a', nums, { st: (j) => (j === i ? (even ? 'done' : 'bad') : j < i ? 'muted' : undefined), ptr: { x: i } }), tl, tot()], `Is \`${x} % 2 == 0\`? ${x} divided by 2 leaves remainder ${x % 2}, so that is ${even ? 'True' : 'False'}.`, 3, { x, 'x % 2': x % 2, total });
        if (even) {
          total += x;
          add([cells('a', nums, { st: (j) => (j === i ? 'done' : j < i ? 'muted' : undefined), ptr: { x: i } }), tl, tot('compare')], `Even, so add it. total is now \`${total}\`.`, 4, { x, total });
        }
      });
      add([cells('a', nums, { st: () => 'muted' }), tl, tot('done')], `No numbers left, so the loop ends. Python prints \`${total}\`.`, 5, { total });
    },
  });

  defViz('fn-call', {
    title: 'Functions stack up, then return',
    intro: 'Each call gets its own frame with its own variables. The newest frame sits on top and must finish first.',
    inputs: [{ k: 'a', label: 'a', type: 'num', def: 3, lo: 0, hi: 12 }, { k: 'b', label: 'b', type: 'num', def: 4, lo: 0, hi: 12 }],
    code: 'def square(n):\n    return n * n\n\ndef sum_squares(a, b):\n    x = square(a)\n    y = square(b)\n    return x + y\n\nprint(sum_squares(a, b))',
    build({ a, b }, add) {
      const W = 300, H = 46;
      const frame = (id, i, t, st) => box('f' + id, 0, 170 - i * (H + 6), W, H, t, { state: st, size: 15 });
      const m = frame('m', 0, 'main program');
      const head = label('hd', 0, 14, 'Call stack (top runs first)');
      add([head, frame('m', 0, 'main program', 'active')], 'Python starts at the bottom line and needs `sum_squares` to answer.', 9);
      add([head, m, frame('s', 1, `sum_squares  a=${a}  b=${b}`, 'active')], 'A new frame goes on the stack. `a` and `b` live inside it.', 4, { a, b });
      add([head, m, frame('s', 1, `sum_squares  a=${a}  b=${b}`), frame('q', 2, `square  n=${a}`, 'active')], `\`square(${a})\` is called. \`sum_squares\` pauses and waits.`, 5, { n: a });
      add([head, m, frame('s', 1, `sum_squares  a=${a}  b=${b}`), frame('q', 2, `square  returns ${a * a}`, 'done')], `\`square\` works out ${a} × ${a} and hands back \`${a * a}\`.`, 2, { returned: a * a });
      add([head, m, frame('s', 1, `sum_squares  x=${a * a}`, 'active')], `Its frame is gone. \`x\` receives \`${a * a}\`.`, 5, { x: a * a });
      add([head, m, frame('s', 1, `sum_squares  x=${a * a}`), frame('r', 2, `square  n=${b}`, 'active')], `Same again for \`square(${b})\`. It gets a brand new frame.`, 6, { n: b });
      add([head, m, frame('s', 1, `sum_squares  x=${a * a}`), frame('r', 2, `square  returns ${b * b}`, 'done')], `It returns \`${b * b}\`.`, 2, { returned: b * b });
      add([head, m, frame('s', 1, `sum_squares  x=${a * a}  y=${b * b}`, 'active')], `Now \`y\` is \`${b * b}\`.`, 6, { x: a * a, y: b * b });
      add([head, m, frame('s', 1, `sum_squares  returns ${a * a + b * b}`, 'done')], `It returns ${a * a} + ${b * b} = \`${a * a + b * b}\`.`, 7, { returned: a * a + b * b });
      add([head, frame('m', 0, `main program  prints ${a * a + b * b}`, 'done')], 'Every frame has finished and vanished. The stack is back to just the main program.', 9, { output: a * a + b * b });
    },
  });

  defViz('list-methods', {
    title: 'What list operations really do',
    intro: 'Adding at the end is quick. Adding at the front moves everyone. Slices build a new list.',
    inputs: [{ k: 'arr', label: 'Start list', type: 'nums', def: [4, 7, 2, 9], min: 2, max: 6 }],
    code: 'nums = start\nnums.append(5)\nnums.pop()\nnums.insert(0, 1)\nnums.pop(0)\npart = nums[1:3]',
    build({ arr }, add) {
      let ids = arr.map((_, i) => i), a = arr.slice(), nid = 100;
      const show = (st, extra, ptrs) => [cells('a', a, { ids, st, ptr: ptrs }), extra];
      add(show(), 'Here is the list. Each slot has a position number starting at `0`.', 1, { 'len(nums)': a.length });
      a.push(5); ids.push(nid++);
      add(show((i) => (i === a.length - 1 ? 'done' : undefined)), '`append(5)` drops the value in the next free slot. Nobody else moves. That is O(1).', 2, { 'len(nums)': a.length, moved: 0 });
      a.pop(); ids.pop();
      add(show(), '`pop()` removes the last item. Also O(1).', 3, { 'len(nums)': a.length, moved: 0 });
      const n = a.length;
      a.unshift(1); ids.unshift(nid++);
      add(show((i) => (i === 0 ? 'done' : 'compare')), `\`insert(0, 1)\` needs slot 0, so all ${n} items slide right. That is O(n).`, 4, { 'len(nums)': a.length, moved: n });
      a.shift(); ids.shift();
      add(show((i) => 'compare'), `\`pop(0)\` leaves a hole at the front, so all ${n} items slide back. Also O(n).`, 5, { 'len(nums)': a.length, moved: n });
      const part = a.slice(1, 3);
      add(show((i) => (i >= 1 && i < 3 ? 'active' : 'muted'), [cells('s', part, { y: 110, label: 'part (a new list)' })]), '`nums[1:3]` copies positions 1 and 2. The stop position 3 is left out. The original list is untouched.', 6, { part: JSON.stringify(part) });
    },
  });

  defViz('dict-set', {
    title: 'Counting with a dict, remembering with a set',
    intro: 'A dict links a key to a value. A set remembers only whether something has been seen. Both find items in one hop.',
    inputs: [{ k: 'word', label: 'Word', type: 'word', def: 'banana', max: 9, only: /^[a-z]+$/, onlyMsg: 'use lowercase letters only.' }],
    code: 'freq = {}\nseen = set()\nfor ch in word:\n    freq[ch] = freq.get(ch, 0) + 1\n    seen.add(ch)\nprint(freq, seen)',
    build({ word }, add) {
      const chars = word.split(''), f = {}, order = [], seen = [];
      const dict = (hot) => [label('dl', 0, 96, 'freq (dict)'), order.map((k, i) => [box('dk' + k, i * 62, 104, 58, 34, k, { state: k === hot ? 'active' : undefined }), box('dv' + k, i * 62, 140, 58, 34, f[k], { state: k === hot ? 'compare' : undefined })])];
      const st = (hot) => [label('sl', 0, 200, 'seen (set)'), seen.map((k, i) => circ('s' + k, 20 + i * 48, 228, 19, k, { state: k === hot ? 'done' : undefined }))];
      add([cells('w', chars, { s: 44 }), dict(), st()], 'Both start empty.', [1, 2]);
      chars.forEach((c, i) => {
        const old = f[c] || 0;
        add([cells('w', chars, { s: 44, st: (j) => (j === i ? 'active' : j < i ? 'muted' : undefined), ptr: { ch: i } }), dict(), st()], `Next letter is \`${c}\`. ${old ? `The dict already has it with count ${old}.` : `\`freq.get('${c}', 0)\` finds nothing, so it gives 0.`}`, 3, { ch: c });
        if (!old) order.push(c);
        f[c] = old + 1;
        add([cells('w', chars, { s: 44, st: (j) => (j === i ? 'active' : j < i ? 'muted' : undefined), ptr: { ch: i } }), dict(c), st()], `Store \`freq['${c}'] = ${f[c]}\`.`, 4, { ch: c, [`freq['${c}']`]: f[c] });
        const dup = seen.includes(c);
        if (!dup) seen.push(c);
        add([cells('w', chars, { s: 44, st: (j) => (j === i ? 'active' : j < i ? 'muted' : undefined), ptr: { ch: i } }), dict(c), st(c)], dup ? `\`${c}\` is already in the set, so nothing changes. Sets never hold duplicates.` : `\`${c}\` joins the set.`, 5, { 'len(seen)': seen.length });
      });
      add([cells('w', chars, { s: 44, st: () => 'muted' }), dict(), st()], `Done. The word has ${chars.length} letters and ${seen.length} different ones.`, 6);
    },
  });

  defViz('bigo-race', {
    title: 'The growth race',
    intro: 'Same input size, five kinds of code. Watch how quickly the step counts pull apart as n doubles.',
    inputs: [{ k: 'n', label: 'Biggest n', type: 'num', def: 32, lo: 4, hi: 64 }],
    build({ n }, add) {
      const fs = [['O(1)', () => 1], ['O(log n)', (m) => Math.max(1, Math.ceil(Math.log2(m)))], ['O(n)', (m) => m], ['O(n log n)', (m) => Math.max(1, Math.ceil(m * Math.log2(m)))], ['O(n²)', (m) => m * m]];
      const mx = n * n, W = 190;
      const sizes = [];
      for (let m = 2; m < n; m *= 2) sizes.push(m);
      sizes.push(n);
      const row = (m) => fs.map(([name, fn], i) => {
        const v = fn(m), w = Math.max(3, (v / mx) * W), y = 34 + i * 50;
        return [text('t' + i, 96, y + 22, name, { anchor: 'end', size: 15, cls: 'mono' }), box('b' + i, 106, y, w, 36, '', { state: ['done', 'done', 'active', 'compare', 'bad'][i] }), text('v' + i, 106 + w + 8, y + 23, v.toLocaleString(), { anchor: 'start', size: 15, cls: 'mono' })];
      });
      sizes.forEach((m) => {
        const msg = m === 2 ? 'With tiny input every approach looks the same. This is why slow code can seem fine at first.' : m === n ? `At n = ${n}, O(n²) takes ${(n * n).toLocaleString()} steps. O(log n) takes only ${Math.ceil(Math.log2(n))}.` : `n doubled to ${m}. O(n) doubled too. O(n²) became 4 times bigger. O(log n) added just 1 step.`;
        add([big('nl', 106, 14, `n = ${m}`), row(m)], msg, null, { n: m });
      });
    },
  });

  defViz('bigo-loops', {
    title: 'Why nested loops mean n²',
    intro: 'Every lit square is one run of the inner line. One loop lights one row. A loop inside a loop lights the whole square.',
    inputs: [{ k: 'n', label: 'n', type: 'num', def: 4, lo: 2, hi: 6 }],
    code: 'count = 0\nfor i in range(n):\n    for j in range(n):\n        count += 1\nprint(count)',
    build({ n }, add) {
      const empty = Array.from({ length: n }, () => Array(n).fill(''));
      let count = 0;
      const lab = { rowL: [...Array(n).keys()].map((i) => 'i=' + i), colL: [...Array(n).keys()].map((j) => 'j=' + j), x: 40, y: 22, s: 42 };
      add(grid('g', empty, lab), `An ${n} × ${n} grid. Rows are \`i\`, columns are \`j\`.`, 1, { count });
      const vals = empty.map((r) => r.slice());
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          count++;
          vals[i][j] = count;
          const v = vals.map((r) => r.slice());
          if (i === 0 || j === n - 1) {
            add(grid('g', v, { ...lab, st: (r, c) => (r === i && c === j ? 'active' : v[r][c] !== '' ? 'done' : undefined) }), j === n - 1 ? `Row ${i} is finished: the inner loop ran ${n} times for this one \`i\`.` : `\`i=${i}, j=${j}\`: the inner line runs. count is ${count}.`, [3, 4], { i, j, count });
          }
        }
      }
      add(grid('g', vals, { ...lab, st: () => 'done' }), `${n} rows × ${n} columns = ${n * n} steps. Double n and the work becomes 4 times bigger. That's O(n²).`, 5, { count });
    },
  });

  defViz('dynamic-array', {
    title: 'How a Python list grows',
    intro: 'A list reserves spare slots. When they run out it moves everything to a bigger block. That move is rare, so append stays O(1) on average.',
    inputs: [{ k: 'n', label: 'Number of appends', type: 'num', def: 9, lo: 2, hi: 12 }],
    code: 'items = []\nfor v in range(1, n + 1):\n    items.append(v)',
    build({ n }, add) {
      let cap = 1, size = 0, copies = 0, writes = 0;
      const row = (st) => Array.from({ length: cap }, (_, i) => box('a' + i, (i % 8) * 44, Math.floor(i / 8) * 44, 40, 40, i < size ? i + 1 : '', { state: i >= size ? 'empty' : st ? st(i) : undefined }));
      add([label('c', 0, -10, `capacity ${cap}`), row()], 'Start with room for one item.', 1, { size, capacity: cap, 'total copies': copies });
      for (let v = 1; v <= n; v++) {
        if (size === cap) {
          const moved = size;
          cap *= 2;
          copies += moved;
          add([label('c', 0, -10, `capacity ${cap}`), row(() => 'compare')], `Full! Get a block of ${cap} and copy all ${moved} items across. Expensive, but rare.`, 3, { size, capacity: cap, 'total copies': copies });
        }
        size++; writes++;
        add([label('c', 0, -10, `capacity ${cap}`), row((i) => (i === size - 1 ? 'done' : undefined))], `Put \`${v}\` in the next free slot. One step.`, 3, { size, capacity: cap, 'total copies': copies });
      }
      add([label('c', 0, -10, `capacity ${cap}`), row(() => 'done')], `${n} appends needed only ${copies} copies in total, under 2 per append on average. So we call append "amortised O(1)".`, null, { size, capacity: cap, 'total copies': copies });
    },
  });

  defViz('space-inplace', {
    title: 'Reverse with extra space vs. no extra space',
    intro: 'Both give the same answer. The first builds a second list that grows with n. The second only needs two index variables.',
    inputs: [{ k: 'arr', label: 'Numbers', type: 'nums', def: [1, 2, 3, 4, 5], min: 2, max: 7 }],
    code: '# Way 1: O(n) extra space\nout = []\nfor x in nums[::-1]:\n    out.append(x)\n\n# Way 2: O(1) extra space\ni, j = 0, len(nums) - 1\nwhile i < j:\n    nums[i], nums[j] = nums[j], nums[i]\n    i += 1; j -= 1',
    build({ arr }, add) {
      add([cells('a', arr, {}), label('o', 0, 100, 'out')], 'Way 1 makes a new empty list.', 2, { 'extra slots': 0 });
      const out = [];
      for (let k = arr.length - 1; k >= 0; k--) {
        out.push(arr[k]);
        add([cells('a', arr, { st: (i) => (i === k ? 'active' : undefined) }), label('o', 0, 100, 'out'), cells('b', out, { y: 108, idx: false, st: (i) => (i === out.length - 1 ? 'compare' : undefined) })], `Copy \`${arr[k]}\`. out now takes ${out.length} extra slot${out.length > 1 ? 's' : ''}.`, 4, { 'extra slots': out.length });
      }
      add([cells('a', arr, {}), label('o', 0, 100, 'out'), cells('b', out, { y: 108, idx: false, st: () => 'bad' })], `Way 1 needed ${arr.length} extra slots. That's O(n) space.`, 4, { 'extra slots': arr.length });
      const a = arr.slice(), ids = arr.map((_, i) => i);
      let i = 0, j = a.length - 1;
      add([cells('m', a, { ids, ptr: { i, j } })], 'Way 2 works inside the same list, using just `i` and `j`.', 7, { i, j, 'extra slots': 2 });
      while (i < j) {
        [a[i], a[j]] = [a[j], a[i]]; [ids[i], ids[j]] = [ids[j], ids[i]];
        const I = i, J = j;
        add([cells('m', a, { ids, ptr: { i, j }, st: (k) => (k === I || k === J ? 'compare' : k < I || k > J ? 'done' : undefined) })], `Swap positions ${i} and ${j}.`, 9, { i, j, 'extra slots': 2 });
        i++; j--;
      }
      add([cells('m', a, { ids, st: () => 'done' })], 'Same result, and the extra memory stayed at 2 variables however long the list is. That is O(1) space.', 10, { 'extra slots': 2 });
    },
  });

  defViz('array-access', {
    title: 'Why arr[i] is instant',
    intro: "Slots sit side by side in memory, so the computer works out where slot i is with one multiplication. It doesn't search.",
    inputs: [{ k: 'arr', label: 'Numbers', type: 'nums', def: [12, 40, 7, 33, 21, 58], min: 2, max: 8 }, { k: 'i', label: 'Index i', type: 'num', def: 4, lo: 0, hi: 7 }],
    code: 'value = arr[i]\n# address = start + i * slot_size\nprint(value)',
    build({ arr, i }, add) {
      i = Math.min(i, arr.length - 1);
      const base = 1000, size = 8;
      const addr = arr.map((_, k) => text('ad' + k, k * 58 + 26, 84, base + k * size, { cls: 'idx', size: 11 }));
      add([cells('a', arr, { idx: false }), addr, label('l', 0, 106, 'Memory addresses: every slot is 8 bytes wide')], 'Each slot has an address. They go up by 8 each time because the slots touch.', 1);
      add([cells('a', arr, { idx: false }), addr, big('f', 0, 134, `${base} + ${i} × ${size} = ${base + i * size}`)], `To get \`arr[${i}]\`, do one sum: start address plus ${i} × slot size.`, 2, { i, address: base + i * size });
      add([cells('a', arr, { idx: false, st: (k) => (k === i ? 'done' : undefined), ptr: { 'arr[i]': i } }), addr, big('f', 0, 134, `${base} + ${i} × ${size} = ${base + i * size}`)], `Jump straight there. Found \`${arr[i]}\` in one step, however long the list is. That's O(1).`, 3, { value: arr[i] });
    },
  });

  defViz('array-insert', {
    title: 'Insert and delete move everyone behind',
    intro: 'Slots must stay side by side, so making or closing a gap means shifting items one at a time.',
    inputs: [{ k: 'arr', label: 'Numbers', type: 'nums', def: [10, 20, 30, 40, 50], min: 2, max: 7 }, { k: 'idx', label: 'Index', type: 'num', def: 1, lo: 0, hi: 7 }, { k: 'val', label: 'New value', type: 'num', def: 99, lo: 0, hi: 99 }],
    code: 'def insert_at(arr, idx, val):\n    arr.append(None)\n    for k in range(len(arr) - 1, idx, -1):\n        arr[k] = arr[k - 1]\n    arr[idx] = val\n\ndef delete_at(arr, idx):\n    for k in range(idx, len(arr) - 1):\n        arr[k] = arr[k + 1]\n    arr.pop()',
    build({ arr, idx, val }, add) {
      idx = Math.min(idx, arr.length);
      let a = arr.slice(), shifts = 0;
      add(cells('a', a, {}), `Goal: put \`${val}\` at index ${idx}.`, 1, { shifts });
      a.push(''); add(cells('a', a, { st: (k) => (k === a.length - 1 ? 'empty' : undefined) }), 'Grow the list by one empty slot at the end.', 2, { shifts });
      for (let k = a.length - 1; k > idx; k--) {
        a[k] = a[k - 1]; a[k - 1] = '';
        shifts++;
        const K = k;
        add(cells('a', a, { st: (j) => (j === K ? 'compare' : j === K - 1 ? 'empty' : undefined), ptr: { k } }), `Shift \`${a[k]}\` from slot ${k - 1} to slot ${k}.`, [3, 4], { k, shifts });
      }
      a[idx] = val;
      add(cells('a', a, { st: (j) => (j === idx ? 'done' : undefined) }), `The gap is at ${idx}. Drop in \`${val}\`. That took ${shifts} shift${shifts === 1 ? '' : 's'}: O(n) at worst.`, 5, { shifts });
      let dels = 0;
      add(cells('a', a, { st: (j) => (j === idx ? 'bad' : undefined) }), `Now delete it again, to see the reverse.`, 7, { shifts: 0 });
      a[idx] = '';
      for (let k = idx; k < a.length - 1; k++) {
        a[k] = a[k + 1]; a[k + 1] = '';
        dels++;
        const K = k;
        add(cells('a', a, { st: (j) => (j === K ? 'compare' : j === K + 1 ? 'empty' : undefined), ptr: { k } }), `Close the gap: \`${a[k]}\` moves left to slot ${k}.`, [8, 9], { k, shifts: dels });
      }
      a.pop();
      add(cells('a', a, { st: () => 'done' }), `Remove the empty end slot. Back to the original with ${dels} shift${dels === 1 ? '' : 's'}.`, 10, { shifts: dels });
    },
  });

  defViz('tp-pairsum', {
    title: 'Two pointers: find a pair with a target sum',
    intro: 'In a sorted list, one pointer starts at each end. The sum tells you exactly which pointer to move.',
    inputs: [{ k: 'arr', label: 'Numbers (auto sorted)', type: 'nums', def: [1, 3, 4, 6, 8, 11], min: 2, max: 8, randHi: 30 }, { k: 't', label: 'Target', type: 'num', def: 10, lo: 0, hi: 99 }],
    code: 'def pair_sum(nums, target):\n    left, right = 0, len(nums) - 1\n    while left < right:\n        s = nums[left] + nums[right]\n        if s == target:\n            return [left, right]\n        if s < target:\n            left += 1\n        else:\n            right -= 1\n    return None',
    build({ arr, t }, add) {
      const a = arr.slice().sort((x, y) => x - y);
      let l = 0, r = a.length - 1;
      const view = (st) => cells('a', a, { ptr: { left: l, right: r }, st: (i) => (i === l || i === r ? st || 'active' : i < l || i > r ? 'muted' : undefined) });
      add(view(), `Target is ${t}. Start at both ends of the sorted list.`, 2, { left: l, right: r });
      while (l < r) {
        const s = a[l] + a[r];
        add(view('compare'), `${a[l]} + ${a[r]} = ${s}.`, 4, { left: l, right: r, sum: s });
        if (s === t) {
          add(view('done'), `That equals the target. The pair is at indexes ${l} and ${r}.`, 6, { left: l, right: r, sum: s });
          return;
        }
        if (s < t) {
          add(view('compare'), `${s} is too small. Moving right would only shrink it, so \`left\` moves up to get a bigger number.`, 8, { left: l, right: r, sum: s });
          l++;
        } else {
          add(view('compare'), `${s} is too big. \`right\` moves down to get a smaller number.`, 10, { left: l, right: r, sum: s });
          r--;
        }
      }
      add(cells('a', a, { st: () => 'muted' }), `The pointers met, so no pair adds up to ${t}. We checked at most n numbers: O(n).`, 11);
    },
  });

  defViz('tp-dedup', {
    title: 'Slow and fast pointers: remove duplicates',
    intro: 'The fast pointer reads every item. The slow pointer marks where the next new value should be written.',
    inputs: [{ k: 'arr', label: 'Numbers (auto sorted)', type: 'nums', def: [1, 1, 2, 2, 2, 3, 5, 5], min: 1, max: 9, randHi: 6 }],
    code: 'def dedupe(nums):\n    slow = 0\n    for fast in range(1, len(nums)):\n        if nums[fast] != nums[slow]:\n            slow += 1\n            nums[slow] = nums[fast]\n    return slow + 1',
    build({ arr }, add) {
      const a = arr.slice().sort((x, y) => x - y);
      let s = 0;
      add(cells('a', a, { ptr: { slow: 0 }, st: (i) => (i === 0 ? 'done' : undefined) }), 'The first item is always unique, so `slow` starts on it.', 2, { slow: 0 });
      for (let f = 1; f < a.length; f++) {
        const diff = a[f] !== a[s], F = f;
        add(cells('a', a, { ptr: { slow: s, fast: f }, st: (i) => (i === F ? 'compare' : i <= s ? 'done' : undefined) }), `Compare \`${a[f]}\` with \`${a[s]}\`. ${diff ? 'Different, so this is a new value.' : 'Same, so skip it.'}`, 4, { slow: s, fast: f });
        if (diff) {
          s++;
          a[s] = a[f];
          add(cells('a', a, { ptr: { slow: s, fast: f }, st: (i) => (i <= s ? 'done' : undefined) }), `Move \`slow\` forward and write \`${a[f]}\` there.`, [5, 6], { slow: s, fast: f });
        }
      }
      add(cells('a', a, { st: (i) => (i <= s ? 'done' : 'muted') }), `The first ${s + 1} slots hold the unique values. Time O(n), extra space O(1).`, 7, { answer: s + 1 });
    },
  });

  defViz('sw-maxsum', {
    title: 'Fixed window: best sum of k items',
    intro: 'Sliding the window drops one number and adds one. You never re-add the whole window.',
    inputs: [{ k: 'arr', label: 'Numbers', type: 'nums', def: [2, 1, 5, 1, 3, 2, 6], min: 2, max: 9, randHi: 15 }, { k: 'k', label: 'Window size k', type: 'num', def: 3, lo: 1, hi: 8 }],
    code: 'def best_window(nums, k):\n    window = sum(nums[:k])\n    best = window\n    for r in range(k, len(nums)):\n        window += nums[r] - nums[r - k]\n        best = max(best, window)\n    return best',
    build({ arr, k }, add) {
      k = Math.min(k, arr.length);
      let w = arr.slice(0, k).reduce((a, b) => a + b, 0), best = w;
      const S = 52 + 6;
      const frameBox = (l) => box('win', l * S - 4, -4, k * S + 2, 60, '', { state: 'window' });
      const v = (l, st) => [frameBox(l), cells('a', arr, { st })];
      add(v(0, (i) => (i < k ? 'active' : undefined)), `Add the first ${k} numbers once: window sum is ${w}.`, 2, { window: w, best });
      for (let r = k; r < arr.length; r++) {
        const out = arr[r - k], inn = arr[r], R = r;
        w += inn - out;
        add(v(r - k + 1, (i) => (i === R ? 'done' : i === R - k ? 'bad' : i > R - k && i < R ? 'active' : undefined)), `Slide right: lose \`${out}\`, gain \`${inn}\`. New sum is ${w}, using just 2 operations.`, 5, { window: w, best });
        const nb = Math.max(best, w);
        add(v(r - k + 1, (i) => (i > R - k && i <= R ? 'active' : undefined)), w > best ? `${w} beats ${best}. New best!` : `${w} doesn't beat ${best}. Keep the best.`, 6, { window: w, best: nb });
        best = nb;
      }
      add(v(arr.length - k, () => 'muted'), `The best sum of ${k} neighbours is ${best}. Each number entered and left once: O(n).`, 7, { best });
    },
  });

  defViz('sw-longest', {
    title: 'Growing window: longest part with no repeats',
    intro: 'The right side grows the window. When a letter repeats, the left side shrinks until the window is valid again.',
    inputs: [{ k: 's', label: 'Text', type: 'word', def: 'abcabcd', max: 9, only: /^[a-z]+$/, onlyMsg: 'use lowercase letters only.' }],
    code: 'def longest(s):\n    seen = set()\n    left = best = 0\n    for right, ch in enumerate(s):\n        while ch in seen:\n            seen.remove(s[left])\n            left += 1\n        seen.add(ch)\n        best = max(best, right - left + 1)\n    return best',
    build({ s }, add) {
      const c = s.split(''), seen = new Set();
      let l = 0, best = 0;
      const S = 58;
      const v = (r, st) => [box('win', l * S - 4, -4, Math.max(0, r - l + 1) * S + 2, 60, '', { state: 'window' }), cells('a', c, { ptr: { left: l, right: r }, st: (i) => (st && st(i)) || (i >= l && i <= r ? 'active' : undefined) })];
      c.forEach((ch, r) => {
        while (seen.has(ch)) {
          add(v(r, (i) => (i === r || c[i] === ch && i >= l && i < r ? 'bad' : undefined)), `\`${ch}\` is already in the window. Drop \`${c[l]}\` from the left.`, [5, 6, 7], { left: l, right: r, seen: [...seen].join(' '), best });
          seen.delete(c[l]); l++;
        }
        seen.add(ch);
        best = Math.max(best, r - l + 1);
        add(v(r), `Window \`${c.slice(l, r + 1).join('')}\` has no repeats. Its length is ${r - l + 1}, and the best so far is ${best}.`, [8, 9], { left: l, right: r, seen: [...seen].join(' '), best });
      });
      add(cells('a', c, { st: () => 'muted' }), `Longest stretch without repeats: ${best}. Each letter joins and leaves at most once: O(n).`, 10, { best });
    },
  });

  defViz('prefix-build', {
    title: 'Prefix sums: range totals in one subtraction',
    intro: 'Store running totals once. Then any range sum is just the difference of two stored totals.',
    inputs: [{ k: 'arr', label: 'Numbers', type: 'nums', def: [3, 1, 4, 2, 6, 5], min: 2, max: 8, randHi: 20 }, { k: 'l', label: 'From index', type: 'num', def: 2, lo: 0, hi: 7 }, { k: 'r', label: 'To index', type: 'num', def: 4, lo: 0, hi: 7 }],
    code: 'prefix = [0]\nfor x in nums:\n    prefix.append(prefix[-1] + x)\n\ndef range_sum(l, r):\n    return prefix[r + 1] - prefix[l]',
    build({ arr, l, r }, add) {
      r = Math.min(r, arr.length - 1); l = Math.min(l, r);
      const p = [0];
      add([cells('a', arr, { label: 'nums' }), cells('p', p, { y: 124, label: 'prefix' })], '`prefix[0]` is 0, the sum of nothing.', 1, { prefix: p });
      arr.forEach((x, i) => {
        p.push(p[p.length - 1] + x);
        add([cells('a', arr, { label: 'nums', st: (j) => (j === i ? 'active' : j < i ? 'muted' : undefined) }), cells('p', p, { y: 124, label: 'prefix', st: (j) => (j === i + 1 ? 'done' : j === i ? 'compare' : undefined) })], `\`prefix[${i + 1}]\` = ${p[i]} + ${x} = ${p[i + 1]}. It holds the total of the first ${i + 1} number${i ? 's' : ''}.`, 3, { 'prefix[-1]': p[i + 1] });
      });
      add([cells('a', arr, { label: 'nums', st: (j) => (j >= l && j <= r ? 'active' : undefined) }), cells('p', p, { y: 124, label: 'prefix' })], `Question: what is the sum from index ${l} to ${r}?`, 5, { l, r });
      add([cells('a', arr, { label: 'nums', st: (j) => (j >= l && j <= r ? 'active' : undefined) }), cells('p', p, { y: 124, label: 'prefix', st: (j) => (j === r + 1 ? 'done' : j === l ? 'bad' : undefined) })], `Answer: \`prefix[${r + 1}] - prefix[${l}]\` = ${p[r + 1]} - ${p[l]} = ${p[r + 1] - p[l]}. Everything before index ${l} cancels out. One step: O(1).`, 6, { answer: p[r + 1] - p[l] });
    },
  });

  defViz('str-palindrome', {
    title: 'Is it a palindrome?',
    intro: 'Compare the outside letters and walk inward. One mismatch ends the search.',
    inputs: [{ k: 's', label: 'Word', type: 'word', def: 'racecar', max: 10, only: /^[a-z]+$/, onlyMsg: 'use lowercase letters only.' }],
    code: 'def is_palindrome(s):\n    i, j = 0, len(s) - 1\n    while i < j:\n        if s[i] != s[j]:\n            return False\n        i += 1\n        j -= 1\n    return True',
    build({ s }, add) {
      const c = s.split('');
      let i = 0, j = c.length - 1;
      const O = {};
      add(cells('a', c, { s: 46, ptr: { i, j } }), 'Start with the first and last letters.', 2, { i, j });
      while (i < j) {
        const same = c[i] === c[j], I = i, J = j;
        add(cells('a', c, { s: 46, ptr: { i, j }, st: (k) => (k === I || k === J ? (same ? 'done' : 'bad') : k < I || k > J ? 'muted' : undefined) }), `\`${c[i]}\` and \`${c[j]}\` ${same ? 'match. Move both inward.' : "don't match, so this is not a palindrome."}`, same ? [6, 7] : [4, 5], { i, j });
        if (!same) return;
        i++; j--;
      }
      add(cells('a', c, { s: 46, st: () => 'done' }), `Every pair matched. \`${s}\` reads the same both ways.`, 8, { result: 'True' });
    },
  });

  defViz('str-anagram', {
    title: 'Are two words anagrams?',
    intro: 'Count letters going up for the first word and down for the second. If every count returns to zero, they use the same letters.',
    inputs: [{ k: 'a', label: 'Word 1', type: 'word', def: 'listen', max: 8, only: /^[a-z]+$/, onlyMsg: 'use lowercase letters only.' }, { k: 'b', label: 'Word 2', type: 'word', def: 'silent', max: 8, only: /^[a-z]+$/, onlyMsg: 'use lowercase letters only.' }],
    code: 'def is_anagram(a, b):\n    if len(a) != len(b):\n        return False\n    count = {}\n    for ch in a:\n        count[ch] = count.get(ch, 0) + 1\n    for ch in b:\n        count[ch] = count.get(ch, 0) - 1\n    return all(v == 0 for v in count.values())',
    build({ a, b }, add) {
      const A = a.split(''), B = b.split(''), cnt = {}, order = [];
      const table = (hot) => order.map((k, i) => [box('k' + k, i * 50, 146, 46, 30, k, { state: k === hot ? 'active' : undefined }), box('v' + k, i * 50, 178, 46, 36, cnt[k], { state: k === hot ? 'compare' : cnt[k] === 0 ? 'done' : cnt[k] < 0 ? 'bad' : undefined })]);
      const w = (ai, bi) => [cells('a', A, { s: 42, idx: false, st: (i) => (i === ai ? 'active' : ai != null && i < ai ? 'muted' : undefined) }), cells('b', B, { s: 42, y: 62, idx: false, st: (i) => (i === bi ? 'active' : bi != null && i < bi ? 'muted' : undefined) }), label('tt', 0, 138, 'count')];
      if (a.length !== b.length) {
        add(w(), `Lengths are ${a.length} and ${b.length}, so they can't be anagrams.`, [2, 3], { result: 'False' });
        return;
      }
      add(w(), 'Same length, so count the letters. The table starts empty.', 4);
      A.forEach((ch, i) => {
        if (cnt[ch] == null) { order.push(ch); cnt[ch] = 0; }
        cnt[ch]++;
        add([w(i), table(ch)], `\`${ch}\` from word 1: count goes up to ${cnt[ch]}.`, 6, { ch });
      });
      B.forEach((ch, i) => {
        if (cnt[ch] == null) { order.push(ch); cnt[ch] = 0; }
        cnt[ch]--;
        add([w(A.length, i), table(ch)], `\`${ch}\` from word 2: count goes down to ${cnt[ch]}.`, 8, { ch });
      });
      const ok = Object.values(cnt).every((v) => v === 0);
      add([w(A.length, B.length), table()], ok ? 'Every count is 0. The two words are anagrams.' : 'Some counts are not 0, so these are not anagrams.', 9, { result: ok ? 'True' : 'False' });
    },
  });

  defViz('rec-factorial', {
    title: 'Recursion: going down, then coming back',
    intro: 'Each call waits for a smaller version of itself. The base case stops the descent, and answers travel back up.',
    inputs: [{ k: 'n', label: 'n', type: 'num', def: 4, lo: 1, hi: 6 }],
    code: 'def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\n\nprint(fact(n))',
    build({ n }, add) {
      const W = 260, H = 36;
      const fr = (d, t, st) => box('f' + d, 0, 34 + (n - d) * 0 + (d) * 0 + 0 + 200 - (n - d + 1) * (H + 5), W, H, t, { state: st, size: 15 });
      const lab = label('h', 0, -10 + 16, 'Call stack');
      const stackDown = (upto, activeD) => { const s = []; for (let d = n; d >= upto; d--) s.push(fr(d, `fact(${d})  waiting…`, d === activeD ? 'active' : undefined)); return s; };
      add([lab, fr(n, `fact(${n})`, 'active')], `Call \`fact(${n})\`. It's not 1 yet, so it needs \`fact(${n - 1})\` first.`, 1, { n });
      for (let d = n - 1; d >= 1; d--) {
        add([lab, stackDown(d + 1), fr(d, `fact(${d})`, 'active')], d === 1 ? 'Now `n` is 1. This is the base case that stops the calls.' : `\`fact(${d})\` joins the stack and asks for \`fact(${d - 1})\`.`, d === 1 ? 2 : 4, { n: d });
      }
      let val = 1;
      add([lab, stackDown(2), fr(1, 'fact(1) returns 1', 'done')], 'The base case returns `1`. The way back begins.', 3, { returned: 1 });
      for (let d = 2; d <= n; d++) {
        const prev = val;
        val *= d;
        const s = [];
        for (let e = n; e > d; e--) s.push(fr(e, `fact(${e})  waiting…`));
        add([lab, s, fr(d, `fact(${d}) = ${d} × ${prev} = ${val}`, 'done')], `\`fact(${d})\` receives ${prev}, multiplies by ${d}, and returns ${val}.`, 4, { returned: val });
      }
      add([lab, big('r', 0, 90, `fact(${n}) = ${val}`, { size: 24 })], `The stack is empty and the answer is ${val}. Depth was ${n}, so it used O(n) stack space.`, 6, { answer: val });
    },
  });

  defViz('rec-fib', {
    title: 'A call tree: why plain fib is slow',
    intro: 'Each call makes two more. Watch how the same values get worked out again and again.',
    inputs: [{ k: 'n', label: 'n', type: 'num', def: 4, lo: 2, hi: 5 }],
    code: 'def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)',
    build({ n }, add) {
      let idc = 0;
      const mk = (m) => { const nd = { id: idc++, m, v: 'f' + m }; if (m >= 2) { nd.l = mk(m - 1); nd.r = mk(m - 2); } return nd; };
      const root = mk(n);
      const vis = new Set(), done = {}, counts = {};
      let calls = 0;
      const prune = (t) => (t && vis.has(t.id) ? { id: t.id, v: done[t.id] != null ? done[t.id] : t.v, l: prune(t.l), r: prune(t.r) } : null);
      const dx = n >= 5 ? 28 : 36, r = n >= 5 ? 14 : 18;
      const snap = (act, msg) => add(tree('t', fullMask(root), { dx, dy: 58, r, st: (id) => (id === act ? 'active' : done[id] != null ? 'done' : vis.has(id) ? 'compare' : 'ghost') }), msg, act != null && isLeaf(act) ? [2, 3] : 4, { calls, 'repeated work': Object.values(counts).reduce((a, c) => a + Math.max(0, c - 1), 0) });
      const byId = {};
      (function idx(t) { if (t) { byId[t.id] = t; idx(t.l); idx(t.r); } })(root);
      const isLeaf = (id) => byId[id].m < 2;
      function fullMask(t) { return t ? { id: t.id, v: done[t.id] != null ? done[t.id] : vis.has(t.id) ? t.v : '', l: fullMask(t.l), r: fullMask(t.r) } : null; }
      function go(t) {
        vis.add(t.id); calls++;
        counts[t.m] = (counts[t.m] || 0) + 1;
        const rep = counts[t.m] > 1 && t.m >= 2;
        snap(t.id, rep ? `\`fib(${t.m})\` again! This value was already worked out, but plain recursion does it all over.` : t.m < 2 ? `\`fib(${t.m})\` is a base case. It returns ${t.m}.` : `\`fib(${t.m})\` needs \`fib(${t.m - 1})\` and \`fib(${t.m - 2})\`.`);
        if (t.m < 2) { done[t.id] = t.m; return t.m; }
        const a = go(t.l), b = go(t.r);
        done[t.id] = a + b;
        snap(t.id, `\`fib(${t.m})\` = ${a} + ${b} = ${a + b}. Hand it back up.`);
        return a + b;
      }
      const ans = go(root);
      add(tree('t', fullMask(root), { dx, dy: 58, r, st: () => 'done' }), `\`fib(${n})\` = ${ans}, after ${calls} calls. Calls roughly double as n grows: O(2ⁿ). Dynamic programming fixes this later.`, 4, { calls });
    },
  });
})();
