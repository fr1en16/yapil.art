export const serviceTags = [
  'Айдентика',
  'Логотип',
  'Упаковка',
  'Полиграфия',
  'Презентация',
  'Многостраничный сайт',
  'Лендинг',
  'Интернет-магазин',
  'SMM',
  'Креативы',
  'Анимашки',
  'Упаковка инсты',
  'Дизайн-Поддержка',
] as const;

export type ServiceTag = (typeof serviceTags)[number];

export function isServiceTag(value: string): value is ServiceTag {
  return serviceTags.includes(value as ServiceTag);
}
