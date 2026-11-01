const { test, expect } = require('@playwright/test');
const { default: AxeBuilder } = require('@axe-core/playwright');
const SLOW = require('../slow-solutions.js');

let problems;
test.beforeEach(async ({ page }) => {
  problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
});
test.afterEach(() => { expect(problems).toEqual([]); });

const noSidewaysScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

async function finishPlayers(page) {
  await page.evaluate(() => {
    for (const p of document.querySelectorAll('.player')) {
      let guard = 0;
      while (guard++ < 400 && !/Step (\d+) of \1$/.test(p.querySelector('.pl-count').textContent)) p.querySelector('[data-a=next]').click();
    }
  });
}

test('home shows the whole syllabus', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.stop')).toHaveCount(45);
  await expect(page.locator('#hero-demo .pl-stage svg')).toBeVisible();
  expect(await noSidewaysScroll(page)).toBe(true);
});

test('every topic renders, every animation reaches its end, nothing overflows', async ({ page }) => {
  await page.goto('/');
  const ids = await page.evaluate(() => TOPICS.map((t) => t.id));
  for (const id of ids) {
    await page.evaluate((x) => { location.hash = x; }, id);
    await expect(page.locator('h1')).toContainText(await page.evaluate((x) => TOPICS.find((t) => t.id === x).title, id));
    await finishPlayers(page);
    expect(await noSidewaysScroll(page), `${id} scrolls sideways`).toBe(true);
    await expect(page.locator('.chk').first()).toHaveClass(/on/);
  }
});

test('a full topic can be completed, and progress survives a reload', async ({ page }) => {
  await page.goto('/#two-pointers');
  await finishPlayers(page);
  const T = await page.evaluate(() => { const t = TOPICS.find((x) => x.id === 'two-pointers'); return { quiz: t.quiz.map((q) => q.a), sol: t.coding.map((c) => c.solution) }; });
  for (const [i, a] of T.quiz.entries()) await page.click(`.opt[data-q="${i}"][data-o="${a}"]`);
  await expect(page.locator('.q-end')).toContainText('You passed');
  const tasks = page.locator('.task');
  await tasks.nth(0).locator('[data-run]').click();
  await expect(tasks.nth(0).locator('.verdict')).toContainText('tests passed', { timeout: 120000 });
  for (const [i, sol] of T.sol.entries()) {
    await tasks.nth(i).locator('textarea').fill(sol);
    await tasks.nth(i).locator('[data-run]').click();
    await expect(tasks.nth(i).locator('.verdict')).toContainText('Solved', { timeout: 30000 });
  }
  for (const b of await page.locator('#hw input').all()) await b.check();
  await expect(page.locator('.chk.on')).toHaveCount(4);
  await expect(page.locator('.chk-state')).toHaveText('Learned');
  await page.goto('/');
  await page.reload();
  await expect(page.locator('#counts')).toContainText('1 learned');
  await expect(page.locator('.stop.is-done')).toHaveCount(1);
  await page.goto('/#two-pointers');
  await expect(page.locator('.chk.on')).toHaveCount(4);
});

test('Python errors and endless loops are handled', async ({ page }) => {
  await page.goto('/#variables');
  const task = page.locator('.task').first();
  await task.locator('textarea').fill('def last_digit(n):\n    return 1 / 0\n');
  await task.locator('[data-run]').click();
  await expect(task.locator('.tests')).toContainText('ZeroDivisionError', { timeout: 120000 });
  await task.locator('textarea').fill('while True:\n    pass\n');
  await task.locator('[data-run]').click();
  await expect(task.locator('.err')).toContainText('infinite loop', { timeout: 30000 });
});

test('a stack overflow is explained, and Python keeps working afterwards', async ({ page }) => {
  await page.goto('/#variables');
  const task = page.locator('.task').first();
  await task.locator('textarea').fill('from functools import lru_cache\n\n@lru_cache(None)\ndef go(n):\n    return go(n + 1)\n\ndef last_digit(n):\n    return go(0)\n');
  await task.locator('[data-run]').click();
  await expect(task.locator('.out')).toContainText(/recursed too deeply|RecursionError/, { timeout: 120000 });
  await task.locator('[data-reset]').click();
  await task.locator('textarea').fill('def last_digit(n):\n    return n % 10\n');
  await task.locator('[data-run]').click();
  await expect(task.locator('.verdict')).toContainText('Solved', { timeout: 120000 });
  /* Pyodide logs its own crash report here, which is expected in this test only. */
  problems = problems.filter((m) => !/fatal error|Maximum call stack|too much recursion|Pyodide/i.test(m));
});

test('the theme button switches and is remembered', async ({ page }) => {
  await page.goto('/');
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const first = await bg();
  await page.click('#theme-toggle');
  const second = await bg();
  expect(second).not.toBe(first);
  await page.reload();
  expect(await bg()).toBe(second);
});

test('mock interview runs from start to finish', async ({ page }) => {
  await page.goto('/#interview');
  await expect(page.locator('.iv-group')).toHaveCount(17);
  expect(await noSidewaysScroll(page)).toBe(true);
  await page.click('#mock-start');
  await expect(page.locator('#mock-left')).toHaveText(/^(30:00|29:\d\d)$/);
  const sol = await page.evaluate(() => {
    const title = document.querySelector('[data-m="0"] h3').textContent.replace('Question 1: ', '');
    return TOPICS.flatMap((t) => t.coding).find((c) => c.title === title).solution;
  });
  const q = page.locator('[data-m="0"]');
  await q.locator('textarea').fill(sol);
  await q.locator('[data-mock-run]').click();
  await expect(q.locator('.verdict')).toContainText('All tests passed', { timeout: 120000 });
  expect(await noSidewaysScroll(page)).toBe(true);
  await page.click('#mock-finish');
  await expect(page.locator('#mock-box .verdict')).toContainText('You solved 1 of 2');
  await expect(page.locator('.mock-hist li')).toHaveCount(1);
  await page.locator('.lc-list input').first().check();
  await page.reload();
  await expect(page.locator('.lc-list input').first()).toBeChecked();
  await expect(page.locator('.mock-hist li')).toHaveCount(1);
});

test('Python questions can be searched, opened and ticked', async ({ page }) => {
  await page.goto('/#interview');
  const total = await page.locator('.pq-row').count();
  expect(total).toBeGreaterThan(80);
  await page.fill('#pq-search', 'decorator');
  await expect(page.locator('.pq-row:not([hidden])').first()).toContainText('decorator');
  expect(await page.locator('.pq-row:not([hidden])').count()).toBeLessThan(total);
  await page.fill('#pq-search', '');
  await page.check('#pq-popular');
  await expect(page.locator('.pq-row:not([hidden])')).toHaveCount(await page.locator('.pq-row[data-pop="1"]').count());
  await page.uncheck('#pq-popular');
  const row = page.locator('.pq-row').first();
  await row.locator('summary').click();
  await expect(row.locator('details p').first()).toBeVisible();
  await page.check('#pq-is-vs-eq');
  await page.reload();
  await expect(page.locator('#pq-is-vs-eq')).toBeChecked();
  await expect(page.locator('#pq-count')).toContainText('You can explain 1');
  expect(await noSidewaysScroll(page)).toBe(true);
});

test('slow but correct answers are not marked solved, and good answers are', async ({ page }, info) => {
  await page.goto('/#hash-patterns');
  const task = page.locator('.task').first();
  await expect(task.locator('.target')).toContainText('O(n)');
  await task.locator('textarea').fill(SLOW['two-sum']);
  await task.locator('[data-run]').click();
  await expect(task.locator('.verdict')).toContainText('too slow', { timeout: 120000 });
  await expect(task.locator('[data-tick]')).not.toHaveClass(/on/);
  const sol = await page.evaluate(() => TOPICS.find((t) => t.id === 'hash-patterns').coding[0].solution);
  await task.locator('textarea').fill(sol);
  await task.locator('[data-run]').click();
  await expect(task.locator('.verdict')).toContainText('Solved', { timeout: 120000 });
  await expect(task.locator('[data-tick]')).toHaveClass(/on/);
});

test('every speed check gives the right verdict in a real browser', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'One full sweep is enough; other browsers run the test above.');
  test.setTimeout(1200000);
  await page.goto('/');
  const results = await page.evaluate(async (slow) => {
    const out = [];
    const all = TOPICS.flatMap((t) => t.coding);
    for (const id of Object.keys(PERF)) {
      const c = all.find((x) => x.id === id);
      const good = await Py.speedCheck(c, PERF[id], c.solution);
      const bad = await Py.speedCheck(c, PERF[id], slow[id]);
      out.push([id, good.state, bad.state]);
    }
    return out;
  }, SLOW);
  expect(results.filter(([, good, bad]) => good !== 'ok' || bad !== 'slow')).toEqual([]);
});

test('reasonable alternative answers are not failed for speed', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'One browser is enough for this.');
  test.setTimeout(300000);
  const alts = {
    'has-dup': 'def has_duplicate(nums):\n    return len(set(nums)) != len(nums)\n',
    'two-sum': 'def two_sum(nums, target):\n    order = sorted(range(len(nums)), key=lambda i: nums[i])\n    l, r = 0, len(nums) - 1\n    while l < r:\n        s = nums[order[l]] + nums[order[r]]\n        if s == target:\n            return sorted([order[l], order[r]])\n        if s < target:\n            l += 1\n        else:\n            r -= 1\n',
    kth: 'def kth_largest(nums, k):\n    return sorted(nums)[-k]\n',
    'merge-two': 'def merge(x, y):\n    return sorted(x + y)\n',
    msort: 'def merge_sort(a):\n    return sorted(a)\n',
    rob: 'from functools import lru_cache\n\ndef rob(money):\n    @lru_cache(None)\n    def go(i):\n        if i >= len(money):\n            return 0\n        return max(go(i + 1), money[i] + go(i + 2))\n    return go(0)\n',
    coin: 'def min_coins(coins, amount):\n    memo = {0: 0}\n    def go(a):\n        if a < 0:\n            return float("inf")\n        if a not in memo:\n            memo[a] = min(go(a - c) + 1 for c in coins)\n        return memo[a]\n    r = go(amount)\n    return -1 if r == float("inf") else r\n',
    paths: 'import math\n\ndef paths(rows, cols):\n    return math.comb(rows + cols - 2, rows - 1)\n',
    'll-cycle': 'def has_cycle(head):\n    seen = set()\n    while head:\n        if head in seen:\n            return True\n        seen.add(head)\n        head = head.next\n    return False\n',
    'valid-parens': 'def is_valid(s):\n    st = []\n    pairs = {"(": ")", "[": "]", "{": "}"}\n    for c in s:\n        if c in pairs:\n            st.append(pairs[c])\n        elif not st or st.pop() != c:\n            return False\n    return not st\n',
    'first-uniq': 'from collections import Counter\n\ndef first_unique(s):\n    c = Counter(s)\n    for i, ch in enumerate(s):\n        if c[ch] == 1:\n            return i\n    return -1\n',
    'stones': 'import bisect\n\ndef last_stone(stones):\n    s = sorted(stones)\n    while len(s) > 1:\n        a, b = s.pop(), s.pop()\n        if a != b:\n            bisect.insort(s, a - b)\n    return s[0] if s else 0\n',
    'merge-int': 'def merge_intervals(items):\n    items = sorted(items)\n    out = []\n    i = 0\n    while i < len(items):\n        s, e = items[i]\n        i += 1\n        while i < len(items) and items[i][0] <= e:\n            e = max(e, items[i][1])\n            i += 1\n        out.append([s, e])\n    return out\n',
  };
  await page.goto('/');
  const results = await page.evaluate(async (alts) => {
    const out = [];
    const all = TOPICS.flatMap((t) => t.coding);
    for (const id of Object.keys(alts)) {
      const c = all.find((x) => x.id === id);
      const small = await Py.run(alts[id], c.tests, c.setup || '');
      const sp = await Py.speedCheck(c, PERF[id], alts[id]);
      out.push([id, small.tests.every((t) => t.pass), sp.state, sp.error || '']);
    }
    return out;
  }, alts);
  expect(results.filter(([, small, state]) => !small || state !== 'ok')).toEqual([]);
});

test('progress can be backed up and restored', async ({ page }, info) => {
  await page.goto('/#variables');
  await page.locator('#hw input').first().check();
  await page.goto('/');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#backup')]);
  const file = info.outputPath('backup.json');
  await dl.saveAs(file);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('.stop.is-doing')).toHaveCount(0);
  await page.setInputFiles('#restore', file);
  await expect(page.locator('.stop.is-doing')).toHaveCount(1);
  await page.setInputFiles('#restore', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('nope') });
  await expect(page.locator('#toast')).toContainText("isn't a Step Through backup");
  await expect(page.locator('.stop.is-doing')).toHaveCount(1);
});

for (const theme of ['light', 'dark']) {
  test(`no serious accessibility problems in ${theme} theme`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('stepthrough.theme', t), theme);
    const bad = [];
    for (const hash of ['', '#binary-search', '#interview']) {
      await page.goto('/' + hash);
      await page.reload();
      await page.waitForTimeout(500);
      const { violations } = await new AxeBuilder({ page }).options({ preload: false }).analyze();
      for (const v of violations) {
        if (['serious', 'critical'].includes(v.impact)) bad.push(`${hash} ${v.id}: ${v.nodes.slice(0, 6).map((n) => n.target.join(' ')).join(' | ')}`);
      }
    }
    expect(bad).toEqual([]);
  });
}
