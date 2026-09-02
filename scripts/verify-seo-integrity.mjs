import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve('.');
const buildRoot = path.join(projectRoot, 'dist/client');
const siteOrigin = 'https://yapil.art';
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : target;
  }));
  return files.flat();
}

const files = await walk(buildRoot);
const relativeFiles = new Set(files.map((file) => path.relative(buildRoot, file).split(path.sep).join('/')));
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const sitemapFiles = files.filter((file) => /sitemap-\d+\.xml$/.test(file));

if (!relativeFiles.has('sitemap.xml')) errors.push('Missing sitemap.xml entry point');
if (!relativeFiles.has('sitemap-index.xml')) errors.push('Missing generated sitemap-index.xml');
if (sitemapFiles.length === 0) errors.push('Missing generated sitemap payload');

const sitemapEntry = relativeFiles.has('sitemap.xml')
  ? await readFile(path.join(buildRoot, 'sitemap.xml'), 'utf8')
  : '';
if (!sitemapEntry.includes(`${siteOrigin}/sitemap-0.xml`)) errors.push('sitemap.xml does not reference sitemap-0.xml');

const sitemapXml = (await Promise.all(sitemapFiles.map((file) => readFile(file, 'utf8')))).join('\n');
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapPaths = new Set(sitemapUrls.map((url) => new URL(url).pathname));

const robots = await readFile(path.join(buildRoot, 'robots.txt'), 'utf8');
if (!/^Sitemap:\s+https:\/\/yapil\.art\/sitemap\.xml\s*$/m.test(robots)) {
  errors.push('robots.txt must point to https://yapil.art/sitemap.xml');
}
const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)/gm)].map((match) => match[1]);

const forbiddenSitemapPatterns = [
  /^\/(?:404|500|anal|archive\/shanding|brief|crm|en|kp(?:\/|$)|light|review|shanding-3d|site-map|threads)(?:\/|$)/,
  /^\/services\/[^/]+\/[^/]+\/[^/]+$/,
  /^\/cities\/(?:petropavlovsk|taldykorgan)$/,
  /^\/services\/[^/]+\/(?:petropavlovsk|taldykorgan)$/,
];

for (const pathname of sitemapPaths) {
  if (forbiddenSitemapPatterns.some((pattern) => pattern.test(pathname))) {
    errors.push(`Forbidden URL in sitemap: ${pathname}`);
  }
  if (disallowed.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    errors.push(`robots.txt conflicts with sitemap: ${pathname}`);
  }
}

const htmlByPath = new Map();
for (const file of htmlFiles) {
  const relative = path.relative(buildRoot, file).split(path.sep).join('/');
  const pathname = relative === 'index.html'
    ? '/'
    : relative === '404.html' || relative === '500.html'
      ? `/${relative.replace('.html', '')}`
      : `/${relative.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`;
  htmlByPath.set(pathname, await readFile(file, 'utf8'));
}

if (!htmlByPath.has('/404')) errors.push('Missing built 404 page');
if (!htmlByPath.has('/500')) errors.push('Missing built 500 page');

const seenTitles = new Map();
const seenCanonicals = new Map();
let checkedSchemaPages = 0;
let checkedInternalLinks = 0;

const collectSchemaTypes = (html) => {
  const types = new Set();
  const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];

  for (const script of scripts) {
    try {
      const value = JSON.parse(script[1]);
      const nodes = Array.isArray(value?.['@graph']) ? value['@graph'] : [value];
      for (const node of nodes) {
        const nodeTypes = Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']];
        nodeTypes.filter(Boolean).forEach((type) => types.add(type));
      }
    } catch {
      errors.push('Invalid JSON-LD payload');
    }
  }

  return types;
};

for (const url of sitemapUrls) {
  const pathname = new URL(url).pathname;
  const html = htmlByPath.get(pathname);
  if (!html) {
    errors.push(`Sitemap URL has no built HTML page: ${pathname}`);
    continue;
  }

  if (/name="robots" content="[^"]*noindex/i.test(html)) errors.push(`noindex URL in sitemap: ${pathname}`);

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const normalizedSitemapUrl = new URL(url).href;
  if (!title) errors.push(`Missing title: ${pathname}`);
  if (!canonical) errors.push(`Missing canonical: ${pathname}`);
  if (canonical && canonical !== normalizedSitemapUrl) errors.push(`Canonical mismatch: ${pathname} -> ${canonical}`);

  if (title) {
    const duplicate = seenTitles.get(title);
    if (duplicate) errors.push(`Duplicate title: ${title} (${duplicate}, ${pathname})`);
    seenTitles.set(title, pathname);
  }
  if (canonical) {
    const duplicate = seenCanonicals.get(canonical);
    if (duplicate) errors.push(`Duplicate canonical: ${canonical} (${duplicate}, ${pathname})`);
    seenCanonicals.set(canonical, pathname);
  }

  if (/^\/(?:services|solutions|cities|case|articles)(?:\/|$)/.test(pathname)) {
    checkedSchemaPages += 1;
    const types = collectSchemaTypes(html);
    for (const required of ['WebSite', 'BreadcrumbList']) {
      if (!types.has(required)) errors.push(`Missing ${required} schema: ${pathname}`);
    }
    if (!types.has('Organization') && !types.has('ProfessionalService')) {
      errors.push(`Missing Organization schema: ${pathname}`);
    }
    if (/^\/services\/[^/]+(?:\/[^/]+)?$/.test(pathname) && !types.has('Service')) {
      errors.push(`Missing Service schema: ${pathname}`);
    }
    if (/^\/articles\//.test(pathname) && !types.has('Article')) {
      errors.push(`Missing Article schema: ${pathname}`);
    }
  }

  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1].replaceAll('&amp;', '&'));
  for (const href of hrefs) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const linkedPath = href.split(/[?#]/)[0] || '/';
    if (linkedPath.startsWith('/api/')) continue;

    const normalizedLinkedPath = linkedPath.length > 1 ? linkedPath.replace(/\/$/, '') : linkedPath;
    const assetPath = normalizedLinkedPath.slice(1);
    if (!htmlByPath.has(normalizedLinkedPath) && !relativeFiles.has(assetPath)) {
      errors.push(`Broken internal link on ${pathname}: ${href}`);
    }
    checkedInternalLinks += 1;
  }
}

for (const [pathname, html] of htmlByPath) {
  if (!/name="robots" content="[^"]*noindex/i.test(html)) continue;
  if (sitemapPaths.has(pathname)) errors.push(`Built noindex page is present in sitemap: ${pathname}`);
}

const contentRoot = path.join(projectRoot, 'content-drafts/seo');
const serviceDirectories = (await readdir(contentRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
let publishedArticles = 0;
let generatedDrafts = 0;

for (const directory of serviceDirectories) {
  const directoryPath = path.join(contentRoot, directory.name);
  const entries = (await readdir(directoryPath)).filter((file) => file.endsWith('.md'));
  for (const file of entries) {
    const source = await readFile(path.join(directoryPath, file), 'utf8');
    const status = source.match(/^status:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1];
    if (file.startsWith('trend-')) {
      generatedDrafts += 1;
      if (status !== 'draft') errors.push(`Generated article is not draft: ${directory.name}/${file}`);
    } else if (status === 'published') {
      publishedArticles += 1;
    }
  }
}

const sitemapArticles = [...sitemapPaths].filter((pathname) => /^\/articles\/[^/]+$/.test(pathname)).length;
if (sitemapArticles !== publishedArticles) {
  errors.push(`Published article count mismatch: content=${publishedArticles}, sitemap=${sitemapArticles}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  sitemapUrls: sitemapUrls.length,
  publishedArticles,
  generatedDrafts,
  uniqueTitles: seenTitles.size,
  uniqueCanonicals: seenCanonicals.size,
  checkedSchemaPages,
  checkedInternalLinks,
}, null, 2));
