export type WebsiteSeoOverride = {
  title: string;
  description: string;
};

// Search Console opportunities with impressions, top-10 positions and weak CTR.
// Keep this list evidence-based: add a page only after reviewing its query-to-page match.
export const websiteSeoOverrides: Record<string, WebsiteSeoOverride> = {
  '/websites/pricing/astana': {
    title: 'Разработка сайта в Астане: цены 2026',
    description:
      'Стоимость разработки сайта в Астане: лендинг, корпоративный сайт или интернет-магазин. Состав работ, сроки и цены от Yapil.',
  },
  '/websites/landing': {
    title: 'Заказать лендинг под ключ — цена и сроки',
    description:
      'Разработка лендинга под ключ: структура, дизайн, адаптивная вёрстка, форма и аналитика. Узнайте состав работ, сроки и стоимость.',
  },
  '/websites/landing-design/astana': {
    title: 'Дизайн лендинга в Астане — цена и сроки',
    description:
      'Закажите дизайн landing page в Астане: первый экран, аргументы, мобильная версия и форма заявки. Состав работ, сроки и стоимость.',
  },
};
