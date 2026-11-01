const { test, expect } = require('@playwright/test');
const { default: AxeBuilder } = require('@axe-core/playwright');

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
