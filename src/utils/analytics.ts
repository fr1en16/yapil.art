import { getFirstTouch } from './leadAttribution';

type AnalyticsParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __yapilContactTrackingInstalled?: boolean;
  }
}

const knownCities = new Set([
  'almaty', 'astana', 'shymkent', 'aktobe', 'karaganda', 'taraz', 'ust-kamenogorsk',
  'pavlodar', 'semey', 'atyrau', 'kyzylorda', 'aktau', 'kostanay', 'uralsk', 'turkestan',
]);

const pageContext = () => {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const firstTouch = getFirstTouch();
  const campaignSource = firstTouch.campaign.utm_source;
  let referrerSource = 'direct';

  try {
    if (firstTouch.referrer) referrerSource = new URL(firstTouch.referrer).hostname;
  } catch {
    // Keep the direct fallback for malformed or unavailable referrers.
  }

  let pageType = 'page';
  if (segments.length === 0) pageType = 'home';
  else if (segments[0] === 'articles') pageType = segments.length > 1 ? 'article' : 'article_index';
  else if (segments[0] === 'services') pageType = segments.length > 2 ? 'service_city' : 'service';
  else if (segments[0] === 'websites') pageType = segments.length > 2 ? 'website_city' : 'website_service';
  else if (segments[0] === 'cities') pageType = segments.length > 1 ? 'city' : 'city_index';
  else if (segments[0] === 'case') pageType = 'case';
  else if (segments[0] === 'brief') pageType = 'brief';
  else if (segments[0] === 'ads') pageType = 'ad_landing';

  const city = segments.find((segment) => knownCities.has(segment)) ?? 'not_applicable';
  const service = segments[0] === 'services'
    ? segments[1]
    : segments[0] === 'websites'
      ? 'websites'
      : 'not_applicable';

  return {
    page_location: window.location.href,
    debug_mode: new URLSearchParams(window.location.search).get('debug_mode') === '1' || undefined,
    page_type: pageType,
    service: service ?? 'not_applicable',
    city,
    form_id: 'not_applicable',
    lead_source: campaignSource || referrerSource,
  };
};

export function trackAnalyticsEvent(name: string, params: AnalyticsParams = {}) {
  window.gtag?.('event', name, { ...pageContext(), ...params });
}

export function installContactClickTracking() {
  if (window.__yapilContactTrackingInstalled) return;
  window.__yapilContactTrackingInstalled = true;

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!target) return;

    const href = target.href.toLowerCase();
    const overrides = {
      form_id: target.dataset.ctaId || target.dataset.analyticsId || 'contact_link',
      service: target.dataset.service,
      city: target.dataset.city,
    };

    if (href.startsWith('tel:')) {
      trackAnalyticsEvent('click_phone', overrides);
    } else if (href.startsWith('mailto:')) {
      trackAnalyticsEvent('click_email', overrides);
    } else if (/https?:\/\/(?:wa\.me|api\.whatsapp\.com|t\.me|telegram\.me)\//.test(href)) {
      trackAnalyticsEvent('click_messenger', {
        ...overrides,
        messenger: href.includes('t.me') || href.includes('telegram.me') ? 'telegram' : 'whatsapp',
      });
    }
  });
}
