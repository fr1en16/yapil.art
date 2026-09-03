export const INDEXABLE_CITY_SLUGS = Object.freeze([
  'almaty',
  'astana',
  'shymkent',
  'aktobe',
  'karaganda',
  'taraz',
  'ust-kamenogorsk',
  'pavlodar',
  'semey',
  'atyrau',
  'kyzylorda',
  'aktau',
  'kostanay',
  'uralsk',
  'turkestan',
]);

export const ARCHIVED_CITY_SLUGS = Object.freeze(['petropavlovsk', 'taldykorgan']);

export const SERVICE_SLUGS = Object.freeze([
  'websites',
  'identity',
  'print',
  'presentations',
  'smm',
  'support',
]);

export const DISTRICT_SLUGS_BY_CITY = Object.freeze({
  almaty: ['alatau', 'almaly', 'auezov', 'bostandyk', 'zhetysu', 'medeu', 'nauryzbai', 'turksib'],
  astana: ['almaty', 'baikonyr', 'esil', 'nura', 'saraishyk', 'saryarka'],
  shymkent: ['abai', 'al-farabi', 'enbekshi', 'karatau', 'turan'],
});

const INDEXABLE_CITY_SET = new Set(INDEXABLE_CITY_SLUGS);

export const isIndexableCitySlug = (slug) => INDEXABLE_CITY_SET.has(slug);

export const buildPermanentRedirects = () => Object.fromEntries([
  ...ARCHIVED_CITY_SLUGS.map((city) => [
    `/cities/${city}`,
    { destination: '/cities', status: 301 },
  ]),
  ...SERVICE_SLUGS.flatMap((service) => ARCHIVED_CITY_SLUGS.map((city) => [
    `/services/${service}/${city}`,
    { destination: `/services/${service}`, status: 301 },
  ])),
  ...SERVICE_SLUGS.flatMap((service) => Object.entries(DISTRICT_SLUGS_BY_CITY).flatMap(([city, districts]) =>
    districts.map((district) => [
      `/services/${service}/${city}/${district}`,
      { destination: `/services/${service}/${city}`, status: 301 },
    ]),
  )),
]);

export const PRIVATE_PATH_PREFIXES = Object.freeze([
  '/anal',
  '/archive/shanding',
  '/brief',
  '/crm',
  '/en',
  '/kp',
  '/light',
  '/process-work',
  '/review',
  '/shanding-3d',
  '/site-map',
  '/threads',
]);

export const isPrivatePath = (pathname) => {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';

  if (normalizedPath === '/404' || normalizedPath === '/500') return true;

  return PRIVATE_PATH_PREFIXES.some(
    (privatePath) => normalizedPath === privatePath || normalizedPath.startsWith(`${privatePath}/`),
  );
};

export const isIndexableGeoPath = (pathname) => {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  const cityHubMatch = normalizedPath.match(/^\/cities\/([^/]+)$/);

  if (cityHubMatch) return isIndexableCitySlug(cityHubMatch[1]);

  const serviceCityMatch = normalizedPath.match(/^\/services\/[^/]+\/([^/]+)$/);
  if (serviceCityMatch) return isIndexableCitySlug(serviceCityMatch[1]);

  if (/^\/services\/[^/]+\/[^/]+\/[^/]+$/.test(normalizedPath)) return false;

  return true;
};
