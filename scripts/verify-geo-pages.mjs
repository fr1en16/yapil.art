import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist/client');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : target;
  }));
  return files.flat();
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith('index.html'));
const relativeHtml = htmlFiles.map((file) => path.relative(root, file).split(path.sep).join('/'));
const relativeFiles = new Set(files.map((file) => path.relative(root, file).split(path.sep).join('/')));
const cityPages = relativeHtml.filter((file) => /^services\/[^/]+\/[^/]+\/index\.html$/.test(file));
const districtPages = relativeHtml.filter((file) => /^services\/[^/]+\/[^/]+\/[^/]+\/index\.html$/.test(file));
const cityHubs = relativeHtml.filter((file) => /^cities\/(?:[^/]+\/)?index\.html$/.test(file));

const expected = { cityPages: 90, districtPages: 0, cityHubs: 16 };
const actual = { cityPages: cityPages.length, districtPages: districtPages.length, cityHubs: cityHubs.length };

for (const [key, count] of Object.entries(expected)) {
  if (actual[key] !== count) throw new Error(`${key}: expected ${count}, received ${actual[key]}`);
}

const geoPages = cityPages;
const titles = new Set();
let checkedInternalLinks = 0;
const sitemapFiles = files.filter((file) => /sitemap-\d+\.xml$/.test(file));
const sitemap = (await Promise.all(sitemapFiles.map((file) => readFile(file, 'utf8')))).join('\n');

for (const relative of geoPages) {
  const html = await readFile(path.join(root, relative), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const pathname = `/${relative.replace(/\/index\.html$/, '')}`;
  const expectedCanonical = `https://yapil.art${pathname}`;

  if (!title) throw new Error(`Missing title: ${relative}`);
  if (titles.has(title)) throw new Error(`Duplicate title: ${title}`);
  if (canonical !== expectedCanonical) throw new Error(`Bad canonical: ${relative} -> ${canonical}`);
  if (!/<h1(?:\s|>)/.test(html)) throw new Error(`Missing H1: ${relative}`);
  if (!html.includes('application/ld+json')) throw new Error(`Missing JSON-LD: ${relative}`);
  if (/name="robots" content="[^"]*noindex/i.test(html)) throw new Error(`Unexpected noindex: ${relative}`);
  if (!sitemap.includes(`<loc>${expectedCanonical}</loc>`)) {
    throw new Error(`Missing from sitemap: ${expectedCanonical}`);
  }
  titles.add(title);
}

for (const relative of [...geoPages, ...cityHubs]) {
  const html = await readFile(path.join(root, relative), 'utf8');
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1].replaceAll('&amp;', '&'));

  for (const href of hrefs) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const pathname = href.split(/[?#]/)[0] || '/';
    const candidate = pathname === '/'
      ? 'index.html'
      : pathname.includes('.')
        ? pathname.slice(1)
        : `${pathname.slice(1).replace(/\/$/, '')}/index.html`;
    if (!relativeFiles.has(candidate)) throw new Error(`Broken internal link in ${relative}: ${href}`);
    checkedInternalLinks += 1;
  }
}

const vercelConfig = await readFile(path.resolve('.vercel/output/config.json'), 'utf8');
const permanentRedirects = [...vercelConfig.matchAll(/"status":\s*301/g)].length;
if (permanentRedirects !== 128) throw new Error(`permanent redirects: expected 128, received ${permanentRedirects}`);

console.log(JSON.stringify({ ...actual, uniqueTitles: titles.size, checkedInternalLinks, sitemapFiles: sitemapFiles.length, permanentRedirects }, null, 2));
