import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const cases = [
  [1, 'onmacabim', 'ONmacabim', '2024', 'Профессиональная уходовая израильская косметика', ['Поддержка', 'Полиграфия'], 'Держать визуал израильского бренда уходовой косметики в одном ключе: макеты для соцсетей, полиграфия, промо новых линеек.', 'Сделать так, чтобы упаковка, буклет и пост в ленте читались как один бренд, а новые материалы выходили без задержек.', 'https://media.yapil.art/case/onmacabim.d880b38bbd259603.webp?v=2'],
  [2, 'compass', 'Compass', '2022–2023', 'Консалтинговая компания в Узбекистане', ['Сайт', 'Брендинг'], 'Показать консалтинговую компанию из Узбекистана как надёжного партнёра: собрать бренд с нуля и сайт под него.', 'Дать бизнесу узнаваемый знак и сайт, который объясняет услуги без консалтингового тумана.', 'https://media.yapil.art/case/Compass.3635b3f1a8822370.webp?v=2'],
  [3, 'compass-management', 'Compass Management', '2025–2026', 'Консалтинговая компания', ['Сайт', 'Брендинг'], 'Обновить бренд консалтинговой компании и перенести его на новый сайт.', 'Отстроиться от конкурентов и показать уровень команды до первого созвона.', 'https://media.yapil.art/case/compass%20management.a7c9830274b8ca1a.webp?v=2'],
  [4, 'rv', 'Рыкунов и Кудряшов', '2023', 'Продюсеры', ['Лендинг'], null, null, 'https://media.yapil.art/case/%D0%A0%D1%8B%D0%BA%D1%83%D0%BD%D0%BE%D0%B2%20%D0%B8%20%D0%9A%D1%83%D0%B4%D1%80%D1%8F%D1%88%D0%BE%D0%B2.424534a52afb3e83.webm?v=2'],
  [5, 'bebble', 'Bebble', '2022', 'Болгарский бренд детской косметики', ['Сайт'], 'Сделать сайт болгарского бренда детской косметики: состав, линейки, доверие родителей.', 'Снять вопросы о безопасности состава и довести до покупки.', 'https://media.yapil.art/case/Bebble2.webp'],
  [6, 'parking24', 'Parking24', '2026', 'Автоматизация парковок', ['Презентация'], 'Объяснить, как работает автоматизация парковок, людям, которые принимают решение о закупке.', 'Провести читателя от проблемы до цифр за один просмотр и вывести на встречу.', 'https://media.yapil.art/case/Parking24.ad75e15011337707.webp?v=2'],
  [7, 'igorkochergin', 'Игорь Кочергин', '2025', 'Трейдер', ['Лендинг'], null, null, 'https://media.yapil.art/case/%D0%98%D0%B3%D0%BE%D1%80%D1%8C%20%D0%9A%D0%BE%D1%87%D0%B5%D1%80%D0%B3%D0%B8%D0%BD.0f072d12429a8c70.webp?v=2'],
  [8, 'tomaskralov', 'Томас Кралов', '2025', 'Трейдер #1 в мире', ['Лендинг'], null, null, 'https://media.yapil.art/case/%D0%A2%D0%BE%D0%BC%D0%B0%D1%81%20%D0%9A%D1%80%D0%B0%D1%81%D0%BE%D0%B2.673fb5efa93403e7.webp?v=2'],
  [9, 'boya', 'Boya', '2022–2024', 'Лакокрасочные материалы', ['Сайт', 'Брендинг'], 'Собрать бренд производителя лакокрасочных материалов и сайт с каталогом продукции.', 'Показать продукт дилерам и конечным покупателям в одном месте.', 'https://media.yapil.art/case/Boya.9a06e469ae3718a1.webp?v=2'],
  [10, 'shanding', 'Shanding', '2024', 'Логистическая компания', ['Лендинг', 'Полиграфия'], 'Объяснить услуги логистической компании и собрать складной буклет для встреч с партнёрами.', 'Дать менеджерам материал, который работает и на экране, и на столе переговорной.', 'https://media.yapil.art/case/shanding.d054ea401a23079e.webp?v=2'],
  [11, 'yatut', 'Я тут', '2024', 'Зона отдыха в Алматы', ['Логотип', 'Поддержка'], null, null, 'https://media.yapil.art/case/%D0%AF%20%D1%82%D1%83%D1%82.a067e288709a6dc8.webp?v=2'],
  [12, 'ugc-donskova', 'Дарья Донскова // UGC Creator', '2023', 'Блогер', ['Лендинг'], null, null, 'https://media.yapil.art/case/UGC%20CREATOR.12f63e2cd3a749b8.webp?v=2'],
  [13, 'baizakova', 'Байзакова', '2022', 'Блогер', ['Лендинг'], null, null, 'https://media.yapil.art/case/%D0%91%D0%B0%D0%B9%D0%B7%D0%B0%D0%BA%D0%BE%D0%B2%D0%B0.70b792e0e1c00a83.webp?v=2'],
  [14, 'dodo-hightower', 'Dodo Pizza // Hightower', '2023', 'Ням-ням', ['Лендинг'], null, null, 'https://media.yapil.art/case/Dodo%20Pizza.9c7e346f8f670d86.webp?v=2'],
  [15, 'uaz', 'УАЗ', '2025', 'Буханки на колёсах и не только', ['Сайт'], 'Собрать сайт под модельный ряд УАЗ: буханки, внедорожники, коммерческий транспорт.', 'Помочь посетителю выбрать модель и дойти до дилера, не утонув в характеристиках.', 'https://media.yapil.art/case/%D0%A3%D0%90%D0%97.a1895b637f58b268.webp?v=2'],
  [16, 'gippo', 'Gippo', '2024–2026', 'Первый стрит-фуд в Казахстане', ['Поддержка', 'Полиграфия'], 'Вести визуал первого стрит-фуда в Казахстане: промо комбо, макеты для соцсетей, печать.', 'Держать поток макетов и сохранять узнаваемость бренда на всех носителях.', 'https://media.yapil.art/case/Gippo.7a7a3e1aaaed7ae3.webp?v=2'],
  [17, 'takara', 'Takara Sushi Bar', '2024–2025', 'Суши-бар', ['Поддержка', 'Полиграфия'], 'Собрать складное меню суши-бара: сеты, цены, QR-коды и механика «портала в сокровищницу вкуса».', 'Сделать выбор быстрым, а средний чек выше за счёт понятной подачи сетов.', 'https://media.yapil.art/case/Takara%20Sushi%20Bar.ef0d21f3721710c3.webp?v=2'],
  [18, 'puma-kazakhstan', 'Puma Kazakhstan', '2025', 'В представлении не нуждается', ['Поддержка'], null, null, 'https://media.yapil.art/case/puma.f50f6869fb898fec.webp?v=2'],
  [19, 'brewbox', 'BrewBox', '2023', 'MVP пивного проекта', ['Упаковка', 'Соцсети'], null, null, 'https://media.yapil.art/case/BrewBox.c742b42e0de87fe0.webp?v=2'],
  [20, 'kenfasad', 'Kenfasad', '2022–2024', 'Фасады', ['Брендинг', 'Сайт', 'Полиграфия'], 'Представить фасадные работы: бренд, сайт с объектами, печатные материалы для тендеров.', 'Показать компанию как подрядчика, которому можно отдать объект целиком.', 'https://media.yapil.art/case/Kenfasad.f8c2d9b5215b1779.webp?v=2'],
  [21, 'taxikolesa', 'ТаксиКолеса', '2023', '#1 партнёр Yandex.Go в Казахстане', ['Лендинги'], null, null, 'https://media.yapil.art/case/taxi%20kolesa.4b965f4de6bff389.webp?v=2'],
  [22, 'business-cars', 'Business Cars', '2024–2025', 'Аренда и продажа премиальных китайских авто', ['Сайты'], 'Показать аренду и продажу премиальных китайских авто: каталог, условия, форма заявки.', 'Снять сомнения перед дорогой покупкой и довести клиента до звонка в салон.', 'https://media.yapil.art/case/Business%20cars.f9b7b8f562c16796.webp?v=2'],
  [23, 'rim-invest', 'Rim Invest', '2024', 'Финансовое сообщество', ['Лендинг'], null, null, 'https://media.yapil.art/case/Rim%20Invest.115329ef8314026b.webp?v=2'],
  [24, 'kirpi', 'Kirpi', '2022', 'Модный бренд', ['Интернет-магазин'], null, null, 'https://media.yapil.art/case/kirpi.d41d1be7ded30cac.webp?v=2'],
];

const vsyachina = [
  [1, 'gippo-doublecheese', 'Gippo — комбо «Дабл чиз»', 'Реклама', 'Фуд-композиция на тёмно-красном фоне', 'https://media.yapil.art/media/2gippo1.3ff044cfb132c289.webp?v=2'],
  [2, 'brewbox-smm', 'BrewBox', 'SMM', 'Фирменная коробка, вытянутая типографика, оранжевый с сиреневым', 'https://media.yapil.art/media/BrewBox1.ecd005649bf0c4b5.webp?v=2'],
  [3, 'cadillac-escalade', 'Cadillac Escalade', 'Реклама', 'Фронтальный ракурс, монохромный коллаж деталей, много воздуха', 'https://media.yapil.art/media/cadillac1.ca1b51fdeb691638.webp?v=2'],
  [4, 'chevrolet-cobalt', 'Chevrolet Cobalt', 'Реклама', 'Автомобиль в казахстанском пейзаже рядом с героем кампании', 'https://media.yapil.art/media/chevrolet1.3ad7c9c8f061a1af.webp?v=2'],
  [5, 'gippo-family', 'Gippo Family', 'SMM', 'Четыре бургера и кола на тёмном фоне с тёплыми бликами', 'https://media.yapil.art/media/gippo-1.9a0f6f6dc60e4245.webp?v=2'],
  [6, 'lukoil-video', 'LUKOIL', 'Видео', 'Видеоматериалы', 'https://media.yapil.art/media/lukoil1.b74213dad94cb5aa.mp4?v=2'],
  [7, 'onmacabim-concept', 'ONmacabim', 'Концепт', 'Человеческая и роботизированная руки на белом фоне', 'https://media.yapil.art/media/ONmacabim1.baf6a51b32cba0ee.webp?v=2'],
  [8, 'puma-inhale', 'Puma Inhale', 'SMM', 'Модель с парой кроссовок в индустриальной локации', 'https://media.yapil.art/media/puma1.7c7e54a3119bf220.webp?v=2'],
  [9, 'sold-out', 'Sold Out', 'SMM', 'Карточка про отдел продаж: фиолетовый градиент, белая типографика, красный акцент', 'https://media.yapil.art/media/RV1.d6175cc4972648a0.webp?v=2'],
  [10, 'shanding-booklet', 'Shanding', 'Полиграфия', 'Складной буклет с услугами и партнёрами логистической компании', 'https://media.yapil.art/media/shanding1.fd2a6c85b266d571.webp?v=2'],
  [11, 'takara-menu', 'Takara Sushi Bar', 'Полиграфия', 'Складное меню с механикой «портала в сокровищницу вкуса», фото сетов, QR-коды', 'https://media.yapil.art/media/takara1.11defa3cd0c5c0ec.webp?v=2'],
];

const frontmatter = (value) => `---\n${Object.entries(value)
  .filter(([, field]) => field !== null && field !== undefined)
  .map(([key, field]) => `${key}: ${JSON.stringify(field)}`)
  .join('\n')}\n---\n`;

await mkdir('src/content/cases', { recursive: true });
await mkdir('src/content/vsyachina', { recursive: true });

for (const [order, slug, title, year, summary, services, task, goal, cover] of cases) {
  const data = { title, year, summary, services, cover, order, featured: false, task, goal, reviewed: false };
  await writeFile(join('src/content/cases', `${slug}.md`), frontmatter(data), 'utf8');
}

for (const [order, slug, title, category, description, cover] of vsyachina) {
  const data = { title, category, cover, order, reviewed: false };
  await writeFile(join('src/content/vsyachina', `${slug}.md`), `${frontmatter(data)}\n${description}\n`, 'utf8');
}
