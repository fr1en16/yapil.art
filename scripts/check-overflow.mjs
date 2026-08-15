import { chromium } from 'playwright';

const widths = [375, 768, 1024, 1440];
const path = process.argv[2] || '/';
const base = process.env.CHECK_BASE_URL || 'http://localhost:4321';

const browser = await chromium.launch();
let failed = false;
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  console.log(`${width}px: ${overflow ? 'FAIL — горизонтальный скролл' : 'OK'}`);
  if (overflow) failed = true;
}
await browser.close();
process.exit(failed ? 1 : 0);
