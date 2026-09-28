export const businessSectors = [
  'HoReCa',
  'Ритейл и e-commerce',
  'Fashion',
  'Красота и косметика',
  'Авто и транспорт',
  'Недвижимость и строительство',
  'Финансы и инвестиции',
  'B2B и консалтинг',
  'IT и технологии',
  'Образование и эксперты',
  'Медицина и здоровье',
  'Производство',
  'Логистика',
  'Туризм и отдых',
  'Медиа и развлечения',
  'НКО и социальные проекты',
  'Другое',
] as const;

export type BusinessSector = (typeof businessSectors)[number];

export function isBusinessSector(value: string): value is BusinessSector {
  return businessSectors.includes(value as BusinessSector);
}
