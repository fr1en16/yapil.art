const origin = new URL(process.env.SEO_AUDIT_ORIGIN || 'https://yapil.art').origin;
const concurrency = Math.max(1, Number(process.env.SEO_AUDIT_CONCURRENCY || 20));
const errors = [];

const forbiddenPatterns = [
  /^\/(?:ads|anal|api|brief|crm|en|site-map|threads)(?:\/|$)/,
];

const request = async (url, init = {}) => {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(20_000),
        headers: { 'user-agent': 'YapilSeoAudit/1.0', ...(init.headers || {}) },
        ...init,
      });
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 250));
    }
  }
  errors.push(`Request failed: ${url} (${lastError instanceof Error ? lastError.message : lastError})`);
  return null;
};

const locations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replaceAll('&amp;', '&'));

async function loadSitemap(url, seen = new Set()) {
  if (seen.has(url)) return [];
  seen.add(url);
  const response = await request(url);
  if (!response) return [];
  if (response.status !== 200) {
    errors.push(`Sitemap must return 200 without redirect: ${url} (${response.status})`);
    return [];
  }
  const xml = await response.text();
  const entries = locations(xml);
  if (/<sitemapindex\b/.test(xml)) {
    const nested = await Promise.all(entries.map((entry) => loadSitemap(entry, seen)));
    return nested.flat();
  }
  if (!/<urlset\b/.test(xml)) errors.push(`Unrecognized sitemap payload: ${url}`);
  return entries;
}

async function parallel(items, worker) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index], index);
    }
  }));
}

const sitemapUrl = `${origin}/sitemap.xml`;
const sitemapUrls = await loadSitemap(sitemapUrl);
const uniqueUrls = [...new Set(sitemapUrls)];
if (uniqueUrls.length !== sitemapUrls.length) errors.push(`Duplicate sitemap URLs: ${sitemapUrls.length - uniqueUrls.length}`);

const robotsResponse = await request(`${origin}/robots.txt`);
if (robotsResponse?.status !== 200) errors.push(`robots.txt must return 200 (${robotsResponse?.status ?? 'request failed'})`);
const robots = robotsResponse ? await robotsResponse.text() : '';
const sitemapDirectives = [...robots.matchAll(/^Sitemap:\s*(\S+)\s*$/gmi)].map((match) => match[1]);
if (sitemapDirectives.length !== 1 || sitemapDirectives[0] !== sitemapUrl) {
  errors.push(`robots.txt must expose only ${sitemapUrl}`);
}
const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)\s*$/gmi)].map((match) => match[1]);

const legacySitemap = await request(`${origin}/sitemap-index.xml`);
const expectedLegacyLocation = sitemapUrl;
if (legacySitemap?.status !== 301 || new URL(legacySitemap.headers.get('location') || '/', origin).href !== expectedLegacyLocation) {
  errors.push('/sitemap-index.xml must return one 301 to /sitemap.xml');
}

const seenTitles = new Map();
const seenCanonicals = new Map();
const internalLinks = new Map();
let checkedSlashRedirects = 0;

const collectSchemaTypes = (html, url) => {
  const types = new Set();
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const value = JSON.parse(match[1]);
      const nodes = Array.isArray(value?.['@graph']) ? value['@graph'] : [value];
      for (const node of nodes) {
        const nodeTypes = Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']];
        nodeTypes.filter(Boolean).forEach((type) => types.add(type));
      }
    } catch {
      errors.push(`Invalid JSON-LD: ${url}`);
    }
  }
  return types;
};

await parallel(uniqueUrls, async (url) => {
  const parsed = new URL(url);
  if (parsed.origin !== origin) errors.push(`Foreign origin in sitemap: ${url}`);
  if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) errors.push(`Trailing slash in sitemap: ${url}`);
  if (forbiddenPatterns.some((pattern) => pattern.test(parsed.pathname))) errors.push(`Forbidden sitemap URL: ${url}`);
  if (disallowed.some((prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`))) {
    errors.push(`robots.txt conflict: ${url}`);
  }

  const response = await request(url);
  if (!response) return;
  if (response.status !== 200) {
    errors.push(`Sitemap URL must return direct 200: ${url} (${response.status})`);
    return;
  }
  if (!/text\/html/i.test(response.headers.get('content-type') || '')) {
    errors.push(`Sitemap URL is not HTML: ${url}`);
    return;
  }
  const html = await response.text();
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) errors.push(`noindex URL in sitemap: ${url}`);

  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
  if (!title) errors.push(`Missing title: ${url}`);
  if (!canonical) errors.push(`Missing canonical: ${url}`);
  if (canonical && new URL(canonical, origin).href !== parsed.href) errors.push(`Canonical mismatch: ${url} -> ${canonical}`);
  if (title && seenTitles.has(title)) errors.push(`Duplicate title: ${title} (${seenTitles.get(title)}, ${url})`);
  if (canonical && seenCanonicals.has(canonical)) errors.push(`Duplicate canonical: ${canonical}`);
  if (title) seenTitles.set(title, url);
  if (canonical) seenCanonicals.set(canonical, url);

  if (/^\/(?:services|solutions|cities|case|articles|websites)(?:\/|$)/.test(parsed.pathname)) {
    const types = collectSchemaTypes(html, url);
    for (const required of ['WebSite', 'BreadcrumbList']) {
      if (!types.has(required)) errors.push(`Missing ${required} schema: ${url}`);
    }
    if (!types.has('Organization') && !types.has('ProfessionalService')) errors.push(`Missing Organization schema: ${url}`);
    if (/^\/(?:services|websites)\/[^/]+(?:\/[^/]+)?$/.test(parsed.pathname) && !types.has('Service')) {
      errors.push(`Missing Service schema: ${url}`);
    }
    if (/^\/articles\/[^/]+$/.test(parsed.pathname) && !types.has('Article')) errors.push(`Missing Article schema: ${url}`);
  }

  for (const href of [...html.matchAll(/href=["']([^"']+)["']/gi)].map((match) => match[1].replaceAll('&amp;', '&'))) {
    if (/^(?:#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    const linked = new URL(href, url);
    if (linked.origin !== origin || linked.pathname.startsWith('/api/')) continue;
    linked.hash = '';
    internalLinks.set(linked.href, url);
  }

  if (parsed.pathname !== '/') {
    const slashUrl = `${origin}${parsed.pathname}/${parsed.search}`;
    const slashResponse = await request(slashUrl);
    checkedSlashRedirects += 1;
    const location = slashResponse ? new URL(slashResponse.headers.get('location') || '/', origin).href : '';
    if (slashResponse?.status !== 301 || location !== url) errors.push(`Trailing-slash URL must 301 once: ${slashUrl} -> ${slashResponse?.status ?? 'failed'} ${location}`);
  }
});

await parallel([...internalLinks], async ([url, source]) => {
  const response = await request(url, { method: 'HEAD' });
  if (response && response.status !== 200) errors.push(`Internal link is not direct 200: ${source} -> ${url} (${response.status})`);
});

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  origin,
  sitemapUrls: uniqueUrls.length,
  uniqueTitles: seenTitles.size,
  uniqueCanonicals: seenCanonicals.size,
  checkedSlashRedirects,
  checkedInternalLinks: internalLinks.size,
}, null, 2));
