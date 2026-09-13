import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const response = await page.goto('http://localhost:4321/case/thepeak', { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.addStyleTag({ content: 'astro-dev-toolbar { display:none !important; }' });
    assert.equal(await page.locator('.case-page h1').textContent(), 'The Peak');
    assert.equal(await page.locator('.case-cover').count(), 0);
    assert.equal(await page.locator('.case-body img').count(), 6);
    assert.match(await page.locator('.case-body').textContent(), /Я\s+стоял\s+у\s+его\s+основания/);
    for (const img of await page.locator('.case-body img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el => el.decode());
      assert.ok(await img.evaluate(el => el.naturalWidth > 0));
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `/private/tmp/thepeak-case/yapil-${width}.png`, fullPage: true });
    console.log(`Verified ${width}px: 200, 6 loaded screenshots, no cover, no overflow.`);
  }
  await page.goto('http://localhost:4321/cases', { waitUntil: 'networkidle' });
  assert.ok(await page.locator('a[href="/case/thepeak"]').count());
  assert.equal(await page.locator('a[href="/case/thepeak"] img').count(), 0);
  assert.deepEqual(errors, []);
  console.log('Verified case catalog entry and no browser errors.');
} finally {
  await browser.close();
}
