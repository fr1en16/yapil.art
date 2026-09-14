const key = 'yapil:first-touch:v1';
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'] as const;
export type FirstTouch = { landingPage: string; referrer: string; campaign: Record<string, string> };
let cached: FirstTouch | undefined;

export function captureFirstTouch(href: string, referrer: string, storage?: Pick<Storage, 'getItem' | 'setItem'>): FirstTouch {
  try {
    const saved = JSON.parse(storage?.getItem(key) || 'null');
    if (saved && typeof saved.landingPage === 'string' && typeof saved.referrer === 'string' && saved.campaign && typeof saved.campaign === 'object' && !Array.isArray(saved.campaign)) {
      return { landingPage: saved.landingPage, referrer: saved.referrer, campaign: Object.fromEntries(campaignKeys.filter(k => typeof saved.campaign[k] === 'string').map(k => [k, saved.campaign[k]])) };
    }
  } catch { /* Storage can be disabled or contain invalid data. */ }
  const url = new URL(href);
  let source = '';
  try { const r = new URL(referrer); source = `${r.origin}${r.pathname}`; } catch { /* Direct visit. */ }
  const value: FirstTouch = {
    landingPage: `${url.origin}${url.pathname}`,
    referrer: source,
    campaign: Object.fromEntries(campaignKeys.flatMap(k => url.searchParams.get(k) ? [[k, url.searchParams.get(k)!.slice(0, 500)]] : [])),
  };
  try { storage?.setItem(key, JSON.stringify(value)); } catch { /* The browser wrapper also retains an in-memory copy. */ }
  return value;
}

export function getFirstTouch(): FirstTouch {
  if (cached) return cached;
  let storage: Storage | undefined;
  try { storage = window.sessionStorage; } catch { /* Private/restricted storage. */ }
  cached = captureFirstTouch(window.location.href, document.referrer, storage);
  return cached;
}
