const serviceSlugByLabel: Record<string, string> = {
  'Сайты': 'websites',
  'Сайт': 'websites',
  'Лендинг': 'websites',
  'Лендинги': 'websites',
  'Интернет-магазин': 'websites',
  'Айдентика': 'identity',
  'Брендинг': 'identity',
  'Логотип': 'identity',
  'Полиграфия': 'print',
  'Упаковка': 'print',
  'Презентация': 'presentations',
  'Презентации': 'presentations',
  'SMM': 'smm',
  'Соцсети': 'smm',
  'Сопровождение': 'support',
  'Поддержка': 'support',
};

export const resolveServiceSlug = (labels: string | string[]) => {
  const values = Array.isArray(labels) ? labels : [labels];
  return values.map((label) => serviceSlugByLabel[label]).find(Boolean) ?? 'support';
};
