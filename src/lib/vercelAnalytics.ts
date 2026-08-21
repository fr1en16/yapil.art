export type AnalyticsRow = {
  timestamp?: string;
  pageviews: number;
  visitors: number;
  requestPath?: string;
  referrerHostname?: string;
  country?: string;
  deviceType?: string;
};

type AnalyticsResponse = {
  data: AnalyticsRow[];
};

export type AnalyticsReport = {
  trend: AnalyticsRow[];
  pages: AnalyticsRow[];
  referrers: AnalyticsRow[];
  countries: AnalyticsRow[];
  devices: AnalyticsRow[];
};

type AnalyticsConfig = {
  token: string;
  projectId: string;
  teamId?: string;
};

const API_URL = 'https://api.vercel.com/v1/query/web-analytics/visits/aggregate';

async function queryAnalytics(
  config: AnalyticsConfig,
  since: string,
  until: string,
  by: string,
  limit = 10,
): Promise<AnalyticsRow[]> {
  const url = new URL(API_URL);
  url.searchParams.set('projectId', config.projectId);
  url.searchParams.set('since', since);
  url.searchParams.set('until', until);
  url.searchParams.set('by', by);
  url.searchParams.set('limit', String(limit));
  if (config.teamId) url.searchParams.set('teamId', config.teamId);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.token}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Vercel Analytics API: ${response.status} ${message.slice(0, 180)}`);
  }

  const payload = (await response.json()) as AnalyticsResponse;
  return payload.data;
}

export async function getAnalyticsReport(
  config: AnalyticsConfig,
  days: number,
): Promise<AnalyticsReport> {
  const untilDate = new Date();
  const sinceDate = new Date(untilDate);
  sinceDate.setUTCDate(sinceDate.getUTCDate() - (days - 1));
  const since = sinceDate.toISOString().slice(0, 10);
  const until = untilDate.toISOString().slice(0, 10);

  const [trend, pages, referrers, countries, devices] = await Promise.all([
    queryAnalytics(config, since, until, 'day', days),
    queryAnalytics(config, since, until, 'requestPath', 12),
    queryAnalytics(config, since, until, 'referrerHostname', 8),
    queryAnalytics(config, since, until, 'country', 8),
    queryAnalytics(config, since, until, 'deviceType', 8),
  ]);

  return { trend, pages, referrers, countries, devices };
}
