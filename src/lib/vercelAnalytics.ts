export type AnalyticsRow = {
  timestamp?: string;
  pageviews: number;
  visitors: number;
  requestPath?: string;
  referrerHostname?: string;
  country?: string;
  deviceType?: string;
};

type AggregateResponse = {
  data: AnalyticsRow[];
};

type CountResponse = {
  data: {
    pageviews: number;
    visitors: number;
  };
};

export type AnalyticsReport = {
  totals: CountResponse['data'];
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

export type AnalyticsRange = {
  since: string;
  until: string;
};

type AnalyticsOptions = AnalyticsRange & {
  requestPath?: string;
};

const API_URL = 'https://api.vercel.com/v1/query/web-analytics/visits';

function addUtcDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function analyticsFilter(requestPath?: string) {
  const filters = ["environment eq 'production'"];
  if (requestPath) filters.push(`requestPath eq '${requestPath.replaceAll("'", "''")}'`);
  return filters.join(' and ');
}

function analyticsUrl(config: AnalyticsConfig, endpoint: 'count' | 'aggregate', options: AnalyticsOptions) {
  const url = new URL(`${API_URL}/${endpoint}`);
  url.searchParams.set('projectId', config.projectId);
  url.searchParams.set('since', options.since);
  url.searchParams.set('until', options.until);
  url.searchParams.set('filter', analyticsFilter(options.requestPath));
  if (config.teamId) url.searchParams.set('teamId', config.teamId);
  return url;
}

async function fetchAnalytics<T>(config: AnalyticsConfig, url: URL): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.token}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Vercel Analytics API: ${response.status} ${message.slice(0, 180)}`);
  }

  return response.json() as Promise<T>;
}

async function queryCount(config: AnalyticsConfig, options: AnalyticsOptions) {
  const payload = await fetchAnalytics<CountResponse>(config, analyticsUrl(config, 'count', options));
  return payload.data;
}

async function queryAggregate(
  config: AnalyticsConfig,
  options: AnalyticsOptions,
  by: string,
  limit = 10,
): Promise<AnalyticsRow[]> {
  const url = analyticsUrl(config, 'aggregate', options);
  url.searchParams.set('by', by);
  url.searchParams.set('limit', String(limit));
  const payload = await fetchAnalytics<AggregateResponse>(config, url);
  return payload.data;
}

export async function getAnalyticsReport(
  config: AnalyticsConfig,
  options: AnalyticsOptions,
): Promise<AnalyticsReport> {
  const days = Math.round(
    (new Date(`${options.until}T00:00:00.000Z`).getTime() -
      new Date(`${options.since}T00:00:00.000Z`).getTime()) /
      86_400_000,
  ) + 1;
  const dimensionOptions = { ...options, until: addUtcDays(options.until, 1) };
  const allPagesOptions = { ...dimensionOptions, requestPath: undefined };

  const [totals, trend, pages, referrers, countries, devices] = await Promise.all([
    queryCount(config, options),
    queryAggregate(config, options, 'day', Math.min(days, 30)),
    queryAggregate(config, allPagesOptions, 'requestPath', 100),
    queryAggregate(config, dimensionOptions, 'referrerHostname', 20),
    queryAggregate(config, dimensionOptions, 'country', 20),
    queryAggregate(config, dimensionOptions, 'deviceType', 10),
  ]);

  return { totals, trend, pages, referrers, countries, devices };
}
