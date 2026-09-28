-- Migration 0001_init.sql: Schema for Yapil CRM (leads) and Reviews
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  raw_phone TEXT,
  email TEXT,
  services TEXT, -- JSON array
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'normal',
  budget TEXT,
  source TEXT NOT NULL DEFAULT 'contacts_form',
  source_details TEXT,
  page_url TEXT NOT NULL DEFAULT 'https://yapil.art',
  referrer TEXT,
  utm TEXT, -- JSON object
  notes TEXT, -- JSON array
  activities TEXT, -- JSON array
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY NOT NULL,
  author TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  website_url TEXT,
  contact TEXT,
  avatar TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  services TEXT, -- JSON array
  quote TEXT NOT NULL,
  format_mode TEXT NOT NULL DEFAULT 'freeform',
  liked_most TEXT,
  liked_special TEXT,
  to_improve TEXT,
  business_results TEXT,
  full_review_text TEXT,
  allow_publish INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  page_url TEXT DEFAULT 'https://yapil.art/review'
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Seed initial 3 verified client reviews
INSERT OR IGNORE INTO reviews (
  id, author, role, company, website_url, contact, avatar, rating, services,
  quote, format_mode, liked_most, liked_special, to_improve, business_results,
  full_review_text, allow_publish, status, created_at, updated_at, page_url
) VALUES
(
  'rev-compass',
  'Сайёра Аюпова',
  'Управляющий партнер',
  'Compass',
  'https://yapil.art/case/compass',
  '@sayora_compass',
  'https://media.yapil.art/reviews/sayora-ayupova.24e1945995e49890.webp',
  5,
  '["Сайты","Полиграфия"]',
  'Проектом довольна и хочу продолжать сотрудничество! Яша предложил современный дизайн в точном соответствии с брифом. Понравилась четкая техническая работа, отработка комментариев и конструктивная коммуникация.',
  'structured',
  'Работа по технической части сайта, процесс дизайна, точная коррекция в соответствии с комментариями, поиск решений. Короткий и качественный процесс брифинга и обмена обратной связью.',
  'Данное предложение по обратной связи на проект 👍🏻 Конструктивная коммуникация с вами, Яков 🤝🙌',
  'С обеих сторон были задержки с реакцией на обратную связь, из-за чего затянулся проект. Возможно, нужно более реалистично согласовывать сроки на коррекции.',
  'Сайт запущен, получили отличную обратную связь от партнеров и клиентов.',
  NULL,
  1,
  'published',
  '2025-11-14T10:00:00.000Z',
  '2025-11-14T10:00:00.000Z',
  'https://yapil.art/review'
),
(
  'rev-rv',
  'Роман Рыкунов',
  'Продюсер',
  'Рыкунов и Кудряшов',
  'https://yapil.art/case/rv',
  '+7 (999) 000-00-00',
  'https://media.yapil.art/reviews/roman-rykunov.04a394fe23c867f2.webp',
  5,
  '["Сайты","Айдентика","Презентации"]',
  'Сотрудничаем с Яшей с 2020 года. За это время реализовали огромный объем работы и запустили множество сайтов. Это специалист, который работает быстро, качественно и всегда готов выручить в сжатые сроки.',
  'freeform',
  NULL,
  NULL,
  NULL,
  NULL,
  'Сотрудничаем с Яковом с начала 2020 года. За эти годы проделали колоссальную работу, запустили десятки проектов и сайтов. Безотказный, супер-профессиональный подход и одни из лучших визуальных решений на рынке.',
  1,
  'published',
  '2025-10-20T14:30:00.000Z',
  '2025-10-20T14:30:00.000Z',
  'https://yapil.art/review'
),
(
  'rev-shanding',
  'Александр Кугуенко',
  'CEO',
  'Shanding Partners',
  'https://yapil.art/case/shanding',
  '+7 (777) 000-00-00',
  'https://media.yapil.art/reviews/shanding.e266d4a797de87da.webp',
  5,
  '["Лендинг","Полиграфия"]',
  'Cотрудничали по созданию лендинга и разработке POS-материалов. Главный показатель профессионализма для нас, что макеты не потребовали правок и сразу ушли в печать. Результатом довольны на сто процентов.',
  'freeform',
  NULL,
  NULL,
  NULL,
  NULL,
  'Cотрудничали по созданию лендинга и разработке POS-материалов. Главный показатель профессионализма для нас, что макеты не потребовали правок и сразу ушли в печать. Результатом довольны на сто процентов. Периодически обращаемся к Якову, когда появляются новые задачи.',
  1,
  'published',
  '2025-12-05T12:00:00.000Z',
  '2025-12-05T12:00:00.000Z',
  'https://yapil.art/review'
);
