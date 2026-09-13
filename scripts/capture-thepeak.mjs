import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const dir = '/private/tmp/thepeak-case';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
async function prepare() {
  // Exclude development controls from portfolio captures, without changing the site.
  await page.addStyleTag({ content: 'nextjs-portal, astro-dev-toolbar { display: none !important; }' });
  await page.getByRole('button', { name: /Сетка/ }).evaluateAll(els => els.forEach(el => el.style.display = 'none'));
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.race([Promise.all(Array.from(document.images).filter(i => i.getBoundingClientRect().top < innerHeight && i.getBoundingClientRect().bottom > 0).map(i => i.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 5000))]);
  });
  await page.waitForTimeout(1800);
}
await prepare();
await page.screenshot({ path: `${dir}/home-desktop.png` });
for (const id of ['team', 'contacts']) {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await prepare();
  await page.locator('header, nav').evaluateAll(els => els.forEach(el => el.style.visibility = 'hidden'));
  await page.locator(`#${id}`).screenshot({ path: `${dir}/${id}-desktop.png` });
}
await page.goto('http://localhost:3000/cases', { waitUntil: 'networkidle' });
await prepare();
await page.screenshot({ path: `${dir}/cases-desktop.png` });
console.log(await page.locator('a[href^="/cases/"]').evaluateAll(els => els.map(el => el.getAttribute('href')).slice(0, 5)));
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await prepare();
await page.screenshot({ path: `${dir}/home-mobile.png` });
await page.goto('http://localhost:3000/cases', { waitUntil: 'networkidle' });
await prepare();
await page.screenshot({ path: `${dir}/cases-mobile.png` });
await browser.close();
