export interface BriefOption {
  value: string;
  label: string;
}

export interface BriefCondition {
  field: string;
  values: string[];
}

export interface BriefQuestion {
  name: string;
  label: string;
  type: 'text' | 'url' | 'number' | 'textarea' | 'radio' | 'checkbox' | 'select';
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: BriefOption[];
  showWhen?: BriefCondition;
}

export interface BriefGroup {
  title: string;
  intro: string;
  questions: BriefQuestion[];
}

export interface ServiceBrief {
  slug: string;
  number: string;
  service: string;
  title: string;
  lead: string;
  groups: BriefGroup[];
}

const yesNo: BriefOption[] = [
  { value: 'Да', label: 'Да' },
  { value: 'Нет', label: 'Нет' },
  { value: 'Нужно обсудить', label: 'Нужно обсудить' },
];

export const briefsData: Record<string, ServiceBrief> = {
  websites: {
    slug: 'websites', number: '01', service: 'Сайты',
    title: 'Бриф на сайт',
    lead: 'Поможет определить масштаб, ключевые сценарии, контент и технические требования будущего сайта.',
    groups: [
      {
        title: 'Задача и формат',
        intro: 'Начнём с роли сайта в бизнесе и ожидаемого результата.',
        questions: [
          { name: 'site_type', label: 'Какой сайт нужен?', type: 'radio', required: true, options: [
            { value: 'Лендинг', label: 'Лендинг / промо-страница' }, { value: 'Корпоративный сайт', label: 'Корпоративный сайт' }, { value: 'Интернет-магазин', label: 'Каталог / интернет-магазин' }, { value: 'Сервис или MVP', label: 'Сервис / личный кабинет / MVP' }, { value: 'Редизайн', label: 'Редизайн существующего сайта' },
          ] },
          { name: 'business_goal', label: 'Какую бизнес-задачу должен решить сайт?', type: 'textarea', required: true, placeholder: 'Например: получать заявки, объяснять сложный продукт, продавать онлайн…' },
          { name: 'primary_action', label: 'Главное действие посетителя', type: 'text', required: true, placeholder: 'Оставить заявку, купить, записаться, скачать…' },
          { name: 'current_site', label: 'Ссылка на существующий сайт', type: 'url', placeholder: 'https://', showWhen: { field: 'site_type', values: ['Редизайн'] } },
          { name: 'redesign_reason', label: 'Что не устраивает в текущем сайте?', type: 'textarea', showWhen: { field: 'site_type', values: ['Редизайн'] } },
        ],
      },
      {
        title: 'Аудитория и содержание',
        intro: 'Определим, кому и что должен говорить сайт.',
        questions: [
          { name: 'audience', label: 'Кто ваша основная аудитория?', type: 'textarea', required: true, placeholder: 'Сегменты, должности, география, уровень знакомства с продуктом' },
          { name: 'offer', label: 'Что именно вы предлагаете?', type: 'textarea', required: true },
          { name: 'advantages', label: 'Почему выбирают вас?', type: 'textarea', placeholder: '3–5 отличий от альтернатив' },
          { name: 'pages', label: 'Какие страницы или разделы нужны?', type: 'textarea', placeholder: 'Главная, услуги, кейсы, команда, блог, контакты…' },
          { name: 'content_ready', label: 'Что уже готово?', type: 'checkbox', options: [
            { value: 'Тексты', label: 'Тексты' }, { value: 'Фото', label: 'Фото' }, { value: 'Видео', label: 'Видео' }, { value: 'Айдентика', label: 'Айдентика / брендбук' }, { value: 'Ничего', label: 'Нужно подготовить всё' },
          ] },
        ],
      },
      {
        title: 'Функции и интеграции',
        intro: 'Зафиксируем сценарии, которые влияют на архитектуру и оценку.',
        questions: [
          { name: 'catalog_size', label: 'Сколько товаров и категорий планируется?', type: 'text', showWhen: { field: 'site_type', values: ['Интернет-магазин'] } },
          { name: 'commerce_features', label: 'Что требуется магазину?', type: 'checkbox', showWhen: { field: 'site_type', values: ['Интернет-магазин'] }, options: [
            { value: 'Онлайн-оплата', label: 'Онлайн-оплата' }, { value: 'Доставка', label: 'Расчёт доставки' }, { value: 'Личный кабинет', label: 'Личный кабинет' }, { value: 'Промокоды', label: 'Промокоды' }, { value: 'Склад', label: 'Синхронизация со складом' },
          ] },
          { name: 'user_roles', label: 'Какие роли и личные сценарии нужны?', type: 'textarea', showWhen: { field: 'site_type', values: ['Сервис или MVP'] }, placeholder: 'Клиент, менеджер, администратор…' },
          { name: 'integrations', label: 'Какие интеграции нужны?', type: 'checkbox', options: [
            { value: 'CRM', label: 'CRM' }, { value: 'Аналитика', label: 'Аналитика' }, { value: 'Платежи', label: 'Платежи' }, { value: 'Email', label: 'Email-рассылки' }, { value: 'Telegram', label: 'Telegram' }, { value: 'Другое', label: 'Другое API' },
          ] },
          { name: 'languages', label: 'Языковые версии', type: 'text', placeholder: 'Русский, английский, казахский…' },
          { name: 'cms', label: 'Нужно ли самостоятельно редактировать контент?', type: 'radio', options: yesNo },
        ],
      },
    ],
  },

  identity: {
    slug: 'identity', number: '02', service: 'Айдентика',
    title: 'Бриф на айдентику',
    lead: 'Поможет понять характер бренда, конкурентное поле и набор носителей, на которых система должна работать.',
    groups: [
      {
        title: 'Контекст бренда', intro: 'Разберём исходную точку и задачу изменений.', questions: [
          { name: 'brand_stage', label: 'На каком этапе бренд?', type: 'radio', required: true, options: [
            { value: 'Новый бренд', label: 'Запуск с нуля' }, { value: 'Ребрендинг', label: 'Ребрендинг' }, { value: 'Обновление системы', label: 'Обновление отдельных элементов' },
          ] },
          { name: 'brand_name', label: 'Название бренда', type: 'text', required: true },
          { name: 'naming_status', label: 'Название окончательное?', type: 'radio', options: yesNo },
          { name: 'current_identity', label: 'Ссылка на текущий стиль или сайт', type: 'url', showWhen: { field: 'brand_stage', values: ['Ребрендинг', 'Обновление системы'] } },
          { name: 'keep_elements', label: 'Что важно сохранить и почему?', type: 'textarea', showWhen: { field: 'brand_stage', values: ['Ребрендинг', 'Обновление системы'] } },
          { name: 'change_reason', label: 'Почему решили менять стиль сейчас?', type: 'textarea', showWhen: { field: 'brand_stage', values: ['Ребрендинг', 'Обновление системы'] } },
        ],
      },
      {
        title: 'Стратегия и характер', intro: 'Сформулируем смысл, который должна передавать визуальная система.', questions: [
          { name: 'product', label: 'Что продаёт или делает бренд?', type: 'textarea', required: true },
          { name: 'audience', label: 'Кто принимает решение о покупке?', type: 'textarea', required: true },
          { name: 'positioning', label: 'Одно предложение о позиционировании', type: 'textarea', placeholder: 'Для кого вы, какую ценность даёте и чем отличаетесь' },
          { name: 'brand_traits', label: 'Выберите характер бренда', type: 'checkbox', options: [
            { value: 'Рациональный', label: 'Рациональный' }, { value: 'Смелый', label: 'Смелый' }, { value: 'Премиальный', label: 'Премиальный' }, { value: 'Дружелюбный', label: 'Дружелюбный' }, { value: 'Технологичный', label: 'Технологичный' }, { value: 'Ироничный', label: 'Ироничный' },
          ] },
          { name: 'avoid_traits', label: 'Каким бренд точно не должен выглядеть?', type: 'textarea' },
          { name: 'competitors', label: 'Конкуренты и альтернативы', type: 'textarea', placeholder: 'Названия или ссылки, плюс короткий комментарий' },
        ],
      },
      {
        title: 'Визуальный охват', intro: 'Определим состав системы и реальные точки контакта.', questions: [
          { name: 'deliverables', label: 'Что нужно разработать?', type: 'checkbox', required: true, options: [
            { value: 'Логотип', label: 'Логотип и знак' }, { value: 'Типографика', label: 'Типографика и цвета' }, { value: 'Графика', label: 'Графическая система' }, { value: 'Брендбук', label: 'Гайдлайн / брендбук' }, { value: 'Носители', label: 'Фирменные носители' }, { value: 'Шаблоны', label: 'Шаблоны для команды' },
          ] },
          { name: 'touchpoints', label: 'Где бренд встречается с аудиторией чаще всего?', type: 'textarea', required: true, placeholder: 'Сайт, вывеска, упаковка, документы, соцсети…' },
          { name: 'priority_carriers', label: 'Какие носители нужно показать в первой презентации?', type: 'textarea' },
          { name: 'references', label: 'Ссылки на близкие по духу бренды', type: 'textarea' },
          { name: 'restrictions', label: 'Есть ли юридические, культурные или отраслевые ограничения?', type: 'textarea' },
        ],
      },
    ],
  },

  print: {
    slug: 'print', number: '03', service: 'Полиграфия', title: 'Бриф на полиграфию и упаковку',
    lead: 'Соберём сведения о формате, тираже, материалах и производственных ограничениях до начала дизайна.',
    groups: [
      { title: 'Тип проекта', intro: 'Определим носитель и его задачу.', questions: [
        { name: 'print_type', label: 'Что нужно разработать?', type: 'radio', required: true, options: [
          { value: 'Упаковка', label: 'Упаковка / этикетка' }, { value: 'Многостраничное', label: 'Каталог / буклет / журнал' }, { value: 'HoReCa', label: 'Меню / материалы HoReCa' }, { value: 'Событие', label: 'Выставка / событие' }, { value: 'Другое', label: 'Другой печатный носитель' },
        ] },
        { name: 'purpose', label: 'Какую задачу должен решить материал?', type: 'textarea', required: true },
        { name: 'audience_context', label: 'Кто, где и как будет им пользоваться?', type: 'textarea', required: true },
        { name: 'product_variants', label: 'Сколько SKU или вариантов дизайна?', type: 'number', showWhen: { field: 'print_type', values: ['Упаковка'] } },
        { name: 'page_count', label: 'Ориентировочное количество страниц', type: 'number', showWhen: { field: 'print_type', values: ['Многостраничное', 'HoReCa'] } },
      ] },
      { title: 'Производство', intro: 'Проверим параметры, от которых зависит подготовка макета.', questions: [
        { name: 'dimensions', label: 'Формат и размеры', type: 'text', required: true, placeholder: 'A4, 210×297 мм, коробка 120×80×40 мм…' },
        { name: 'dieline', label: 'Есть готовая развёртка или чертёж?', type: 'radio', options: yesNo, showWhen: { field: 'print_type', values: ['Упаковка'] } },
        { name: 'printer', label: 'Типография уже выбрана?', type: 'radio', options: yesNo },
        { name: 'print_run', label: 'Планируемый тираж', type: 'text' },
        { name: 'materials', label: 'Материал и способ печати, если известны', type: 'textarea', placeholder: 'Бумага, картон, плёнка, офсет, цифра, флексо…' },
        { name: 'finishing', label: 'Нужны специальные эффекты?', type: 'checkbox', options: [
          { value: 'Ламинация', label: 'Ламинация' }, { value: 'Фольга', label: 'Фольга' }, { value: 'Тиснение', label: 'Тиснение' }, { value: 'Лак', label: 'Выборочный лак' }, { value: 'Вырубка', label: 'Вырубка' }, { value: 'Не знаю', label: 'Нужна рекомендация' },
        ] },
      ] },
      { title: 'Контент и стиль', intro: 'Соберём материалы и визуальные ориентиры.', questions: [
        { name: 'content_status', label: 'Тексты и обязательная информация готовы?', type: 'radio', required: true, options: yesNo },
        { name: 'legal_copy', label: 'Какая обязательная информация должна попасть в макет?', type: 'textarea', placeholder: 'Состав, штрихкод, маркировка, реквизиты, возрастные ограничения…' },
        { name: 'brand_assets', label: 'Есть брендбук и исходники логотипа?', type: 'radio', options: yesNo },
        { name: 'photo_status', label: 'Фото и иллюстрации', type: 'select', options: [
          { value: 'Готовы', label: 'Готовы' }, { value: 'Нужна съёмка', label: 'Нужна фотосъёмка' }, { value: 'Нужен поиск', label: 'Нужен поиск / генерация' }, { value: 'Не нужны', label: 'Не нужны' },
        ] },
        { name: 'references', label: 'Референсы и антиреференсы', type: 'textarea' },
      ] },
    ],
  },

  presentations: {
    slug: 'presentations', number: '04', service: 'Презентации', title: 'Бриф на презентацию',
    lead: 'Определим аудиторию, сценарий показа, состояние контента и необходимую глубину редактирования.',
    groups: [
      { title: 'Сценарий', intro: 'Контекст показа определяет структуру и плотность слайдов.', questions: [
        { name: 'presentation_type', label: 'Тип презентации', type: 'radio', required: true, options: [
          { value: 'Pitch deck', label: 'Pitch deck для инвесторов' }, { value: 'Коммерческая', label: 'Коммерческое предложение' }, { value: 'Выступление', label: 'Презентация для выступления' }, { value: 'Отчёт', label: 'Отчёт / исследование' }, { value: 'Шаблон', label: 'Корпоративный шаблон' },
        ] },
        { name: 'audience', label: 'Кто аудитория?', type: 'textarea', required: true },
        { name: 'desired_action', label: 'Что аудитория должна понять или сделать после просмотра?', type: 'textarea', required: true },
        { name: 'show_mode', label: 'Как презентацию будут использовать?', type: 'checkbox', options: [
          { value: 'Выступление', label: 'Живое выступление' }, { value: 'Email', label: 'Самостоятельное чтение / email' }, { value: 'Печать', label: 'Печать' }, { value: 'Онлайн-встреча', label: 'Онлайн-встреча' },
        ] },
        { name: 'duration', label: 'Длительность выступления', type: 'text', showWhen: { field: 'show_mode', values: ['Выступление', 'Онлайн-встреча'] } },
      ] },
      { title: 'Материалы', intro: 'Поймём, насколько глубоко нужно работать со смыслом.', questions: [
        { name: 'content_stage', label: 'В каком состоянии контент?', type: 'radio', required: true, options: [
          { value: 'Готовая структура', label: 'Структура и тексты готовы' }, { value: 'Черновик', label: 'Есть черновик' }, { value: 'Тезисы', label: 'Есть только тезисы / данные' }, { value: 'С нуля', label: 'Нужно собрать с нуля' },
        ] },
        { name: 'slides', label: 'Ориентировочное число слайдов', type: 'number' },
        { name: 'data', label: 'Есть таблицы, цифры или исследования для визуализации?', type: 'radio', options: yesNo },
        { name: 'data_details', label: 'Какие данные и диаграммы нужны?', type: 'textarea', showWhen: { field: 'data', values: ['Да'] } },
        { name: 'assets', label: 'Какие материалы доступны?', type: 'checkbox', options: [
          { value: 'Брендбук', label: 'Брендбук' }, { value: 'Фото', label: 'Фото' }, { value: 'Видео', label: 'Видео' }, { value: 'Иконки', label: 'Иконки / иллюстрации' }, { value: 'Примеры', label: 'Старые презентации' },
        ] },
      ] },
      { title: 'Выходной формат', intro: 'Настроим результат под рабочий процесс команды.', questions: [
        { name: 'software', label: 'Предпочтительный формат', type: 'checkbox', options: [
          { value: 'PowerPoint', label: 'PowerPoint' }, { value: 'Google Slides', label: 'Google Slides' }, { value: 'Figma', label: 'Figma' }, { value: 'PDF', label: 'PDF' }, { value: 'Keynote', label: 'Keynote' },
        ] },
        { name: 'editable', label: 'Команда должна редактировать презентацию самостоятельно?', type: 'radio', options: yesNo },
        { name: 'languages', label: 'Язык или языковые версии', type: 'text' },
        { name: 'animation', label: 'Нужны анимация и переходы?', type: 'radio', options: yesNo },
        { name: 'references', label: 'Примеры презентаций, которые нравятся или не нравятся', type: 'textarea' },
      ] },
    ],
  },

  smm: {
    slug: 'smm', number: '05', service: 'SMM', title: 'Бриф на дизайн для соцсетей',
    lead: 'Поможет спроектировать систему шаблонов и креативов под реальные рубрики, площадки и темп публикаций.',
    groups: [
      { title: 'Каналы и задача', intro: 'Определим площадки и роль дизайна в контенте.', questions: [
        { name: 'platforms', label: 'Для каких площадок нужен дизайн?', type: 'checkbox', required: true, options: [
          { value: 'Instagram', label: 'Instagram' }, { value: 'Telegram', label: 'Telegram' }, { value: 'TikTok', label: 'TikTok' }, { value: 'VK', label: 'VK' }, { value: 'LinkedIn', label: 'LinkedIn' }, { value: 'Ads', label: 'Рекламные сети' },
        ] },
        { name: 'goal', label: 'Главная цель контента', type: 'textarea', required: true, placeholder: 'Узнаваемость, продажи, экспертность, запуск продукта…' },
        { name: 'account_links', label: 'Ссылки на действующие аккаунты', type: 'textarea' },
        { name: 'audience', label: 'Кто ваша аудитория?', type: 'textarea', required: true },
        { name: 'metrics', label: 'По каким показателям оцениваете результат?', type: 'text', placeholder: 'CTR, заявки, охват, сохранения…' },
      ] },
      { title: 'Контент-система', intro: 'Соберём рабочий набор форматов, а не случайные макеты.', questions: [
        { name: 'work_format', label: 'Какой формат работы нужен?', type: 'radio', required: true, options: [
          { value: 'Шаблоны', label: 'Набор редактируемых шаблонов' }, { value: 'Креативы', label: 'Пакет готовых креативов' }, { value: 'Сопровождение', label: 'Регулярное сопровождение' }, { value: 'Запуск', label: 'Оформление запуска / кампании' },
        ] },
        { name: 'rubrics', label: 'Основные рубрики и типы публикаций', type: 'textarea', required: true },
        { name: 'monthly_volume', label: 'Примерный объём в месяц', type: 'text', placeholder: '12 постов, 30 stories, 8 баннеров…' },
        { name: 'template_users', label: 'Кто будет работать с шаблонами?', type: 'text', showWhen: { field: 'work_format', values: ['Шаблоны'] } },
        { name: 'campaign', label: 'Продукт, оффер и даты кампании', type: 'textarea', showWhen: { field: 'work_format', values: ['Запуск'] } },
        { name: 'motion', label: 'Нужны видео и анимация?', type: 'radio', options: yesNo },
      ] },
      { title: 'Визуальная база', intro: 'Проверим, что уже можно использовать и что предстоит создать.', questions: [
        { name: 'identity_status', label: 'Есть брендбук или сложившийся стиль?', type: 'radio', required: true, options: yesNo },
        { name: 'photo_source', label: 'Откуда берётся визуальный контент?', type: 'checkbox', options: [
          { value: 'Своя съёмка', label: 'Своя съёмка' }, { value: 'Стоки', label: 'Стоки' }, { value: 'UGC', label: 'UGC' }, { value: 'Генерация', label: 'AI-генерация' }, { value: 'Нужна помощь', label: 'Нужна помощь с производством' },
        ] },
        { name: 'references', label: 'Аккаунты и визуальные референсы', type: 'textarea' },
        { name: 'anti_references', label: 'Что точно не подходит?', type: 'textarea' },
        { name: 'accessibility', label: 'Есть требования к языкам, субтитрам или доступности?', type: 'textarea' },
      ] },
    ],
  },

  support: {
    slug: 'support', number: '06', service: 'Сопровождение', title: 'Бриф на дизайн-сопровождение',
    lead: 'Поможет оценить поток задач, SLA, нужный пул часов и способ взаимодействия с вашей командой.',
    groups: [
      { title: 'Поток задач', intro: 'Зафиксируем объём и типичную нагрузку.', questions: [
        { name: 'task_types', label: 'Какие задачи возникают регулярно?', type: 'checkbox', required: true, options: [
          { value: 'Сайт', label: 'Сайт и лендинги' }, { value: 'SMM', label: 'Соцсети и реклама' }, { value: 'Презентации', label: 'Презентации' }, { value: 'Полиграфия', label: 'Полиграфия' }, { value: 'Айдентика', label: 'Развитие айдентики' }, { value: 'Motion', label: 'Motion / видео' },
        ] },
        { name: 'task_examples', label: 'Примеры задач за последний месяц', type: 'textarea', required: true },
        { name: 'monthly_hours', label: 'Ожидаемый пул часов', type: 'radio', options: [
          { value: '10 часов', label: 'До 10 часов' }, { value: '20 часов', label: 'Около 20 часов' }, { value: '40 часов', label: 'Около 40 часов' }, { value: 'Более 40', label: 'Более 40 часов' }, { value: 'Не знаю', label: 'Нужно оценить' },
        ] },
        { name: 'request_frequency', label: 'Как часто появляются новые задачи?', type: 'text' },
        { name: 'urgent_share', label: 'Какая доля задач срочная?', type: 'select', options: [
          { value: 'Редко', label: 'Редко' }, { value: 'До 25%', label: 'До 25%' }, { value: 'До 50%', label: 'До 50%' }, { value: 'Большинство', label: 'Большинство задач' },
        ] },
      ] },
      { title: 'Команда и процесс', intro: 'Настроим удобный канал постановки и согласования.', questions: [
        { name: 'stakeholders', label: 'Кто ставит и согласовывает задачи?', type: 'textarea', required: true },
        { name: 'workflow', label: 'Где удобнее вести задачи?', type: 'checkbox', options: [
          { value: 'Telegram', label: 'Telegram' }, { value: 'Notion', label: 'Notion' }, { value: 'Asana', label: 'Asana' }, { value: 'Trello', label: 'Trello' }, { value: 'Jira', label: 'Jira' }, { value: 'Email', label: 'Email' },
        ] },
        { name: 'sla', label: 'Желаемый срок реакции и выполнения типовой задачи', type: 'text', placeholder: 'Например: ответ 2 часа, макет 1–2 дня' },
        { name: 'meetings', label: 'Нужны регулярные встречи?', type: 'radio', options: yesNo },
        { name: 'meeting_frequency', label: 'Как часто?', type: 'text', showWhen: { field: 'meetings', values: ['Да'] } },
      ] },
      { title: 'Визуальная система', intro: 'Проверим готовность материалов и зоны ответственности.', questions: [
        { name: 'brand_assets', label: 'Что уже есть?', type: 'checkbox', options: [
          { value: 'Брендбук', label: 'Брендбук' }, { value: 'Figma', label: 'Figma-библиотека' }, { value: 'Шаблоны', label: 'Рабочие шаблоны' }, { value: 'Архив', label: 'Архив исходников' }, { value: 'Ничего', label: 'Системы пока нет' },
        ] },
        { name: 'brand_keeper', label: 'Нужен контроль материалов других подрядчиков?', type: 'radio', options: yesNo },
        { name: 'external_team', label: 'Какие подрядчики и специалисты уже участвуют?', type: 'textarea' },
        { name: 'software', label: 'Какие рабочие форматы обязательны?', type: 'text', placeholder: 'Figma, Adobe, PowerPoint, Canva…' },
        { name: 'first_month', label: 'Какие задачи нужно закрыть в первый месяц?', type: 'textarea', required: true },
      ] },
    ],
  },
};

export const briefsList = Object.values(briefsData);
