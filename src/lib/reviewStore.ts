import type { ClientReview, CreateReviewPayload, ReviewStatus, ReviewStats } from './reviewTypes';
import { getCrmSettings, isSupabaseConfigured, playLeadChime } from './crmStore';

const STORAGE_KEY_REVIEWS = 'yapil_crm_reviews_v1';
const BROADCAST_REVIEWS_CHANNEL = 'yapil_reviews_channel';

// Supabase environment variables
const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SUPABASE_URL) || '';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SUPABASE_ANON_KEY) || '';

export const INITIAL_DEMO_REVIEWS: ClientReview[] = [
  {
    id: 'rev-compass',
    author: 'Сайёра Аюпова',
    role: 'Управляющий партнер',
    company: 'Compass',
    websiteUrl: 'https://yapil.art/case/compass',
    contact: '@sayora_compass',
    avatar: '/reviews/sayora-ayupova.webp',
    rating: 5,
    services: ['Сайты', 'Полиграфия'],
    quote:
      'Проектом довольна и хочу продолжать сотрудничество! Яша предложил современный дизайн в точном соответствии с брифом. Понравилась четкая техническая работа, отработка комментариев и конструктивная коммуникация.',
    formatMode: 'structured',
    likedMost:
      'Работа по технической части сайта, процесс дизайна, точная коррекция в соответствии с комментариями, поиск решений.\nКороткий и качественный процесс брифинга и обмена обратной связью.',
    likedSpecial: 'Данное предложение по обратной связи на проект 👍🏻\nКонструктивная коммуникация с вами, Яков 🤝🙌',
    toImprove:
      'С обеих сторон были задержки с реакцией на обратную связь, из-за чего затянулся проект. Возможно, нужно более реалистично согласовывать сроки на коррекции.',
    businessResults: 'Сайт запущен, получили отличную обратную связь от партнеров и клиентов.',
    allowPublish: true,
    status: 'published',
    createdAt: '2025-11-14T10:00:00.000Z',
    updatedAt: '2025-11-14T10:00:00.000Z',
    pageUrl: 'https://yapil.art/review',
  },
  {
    id: 'rev-rv',
    author: 'Роман Рыкунов',
    role: 'Продюсер',
    company: 'Рыкунов и Кудряшов',
    websiteUrl: 'https://yapil.art/case/rv',
    contact: '+7 (999) 000-00-00',
    avatar: '/reviews/roman-rykunov.webp',
    rating: 5,
    services: ['Сайты', 'Айдентика', 'Презентации'],
    quote:
      'Сотрудничаем с Яшей с 2020 года. За это время реализовали огромный объем работы и запустили множество сайтов. Это специалист, который работает быстро, качественно и всегда готов выручить в сжатые сроки.',
    formatMode: 'freeform',
    fullReviewText:
      'Сотрудничаем с Яковом с начала 2020 года. За эти годы проделали колоссальную работу, запустили десятки проектов и сайтов. Безотказный, супер-профессиональный подход и одни из лучших визуальных решений на рынке.',
    allowPublish: true,
    status: 'published',
    createdAt: '2025-10-20T14:30:00.000Z',
    updatedAt: '2025-10-20T14:30:00.000Z',
    pageUrl: 'https://yapil.art/review',
  },
  {
    id: 'rev-shanding',
    author: 'Александр Кугуенко',
    role: 'CEO',
    company: 'Shanding Partners',
    websiteUrl: 'https://yapil.art/case/shanding',
    contact: '+7 (777) 000-00-00',
    avatar: '/reviews/shanding.webp',
    rating: 5,
    services: ['Лендинг', 'Полиграфия'],
    quote:
      'Cотрудничали по созданию лендинга и разработке POS-материалов. Главный показатель профессионализма для нас, что макеты не потребовали правок и сразу ушли в печать. Результатом довольны на сто процентов.',
    formatMode: 'freeform',
    fullReviewText:
      'Cотрудничали по созданию лендинга и разработке POS-материалов. Главный показатель профессионализма для нас, что макеты не потребовали правок и сразу ушли в печать. Результатом довольны на сто процентов. Периодически обращаемся к Якову, когда появляются новые задачи.',
    allowPublish: true,
    status: 'published',
    createdAt: '2025-12-05T12:00:00.000Z',
    updatedAt: '2025-12-05T12:00:00.000Z',
    pageUrl: 'https://yapil.art/review',
  },
];

let reviewBroadcastChannel: BroadcastChannel | null = null;

function getReviewBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!reviewBroadcastChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      reviewBroadcastChannel = new BroadcastChannel(BROADCAST_REVIEWS_CHANNEL);
    } catch {
      reviewBroadcastChannel = null;
    }
  }
  return reviewBroadcastChannel;
}

export function getStoredReviews(): ClientReview[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_REVIEWS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(INITIAL_DEMO_REVIEWS));
      return INITIAL_DEMO_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_DEMO_REVIEWS;
    return parsed;
  } catch {
    return INITIAL_DEMO_REVIEWS;
  }
}

export function saveStoredReviews(reviews: ClientReview[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent('yapil_reviews_changed', { detail: reviews }));
    const ch = getReviewBroadcastChannel();
    if (ch) {
      ch.postMessage({ type: 'reviews_updated', reviews });
    }
  } catch (err) {
    console.error('Failed to save reviews to localStorage:', err);
  }
}

export function generateReviewId(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REV-${dateStr}-${rand}`;
}

// Send formatted Telegram Alert to Studio
export async function sendReviewTelegramNotification(review: ClientReview): Promise<boolean> {
  const settings = getCrmSettings();
  if (!settings.telegramEnabled || !settings.telegramBotToken || !settings.telegramChatId) {
    return false;
  }

  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  const servicesText = review.services.length > 0 ? review.services.join(', ') : 'Не указано';

  let detailsBlock = '';
  if (review.formatMode === 'structured') {
    if (review.likedMost) detailsBlock += `\n\n👍 *Что понравилось:*\n${review.likedMost}`;
    if (review.likedSpecial) detailsBlock += `\n\n🔥 *Что особенно понравилось:*\n${review.likedSpecial}`;
    if (review.toImprove) detailsBlock += `\n\n💡 *Что можно улучшить:*\n${review.toImprove}`;
    if (review.businessResults) detailsBlock += `\n\n📈 *Результаты:* \n${review.businessResults}`;
  } else if (review.fullReviewText) {
    detailsBlock += `\n\n📝 *Полный отзыв:*\n${review.fullReviewText}`;
  }

  const text = `⭐️ *НОВЫЙ ОТЗЫВ КЛИЕНТА!* (${review.id})
👤 *Клиент:* ${review.author}
💼 *Роль / Компания:* ${review.role}${review.company ? `, ${review.company}` : ''}
⭐️ *Оценка:* ${stars} (${review.rating}/5)
🎯 *Услуги:* ${servicesText}
${review.contact ? `📞 *Контакт:* ${review.contact}\n` : ''}${review.websiteUrl ? `🌐 *Сайт:* ${review.websiteUrl}\n` : ''}💬 *Главная цитата:*
«${review.quote}»${detailsBlock}

🔒 *Разрешение на публикацию:* ${review.allowPublish ? 'Да ✅' : 'Только для внутреннего анализа 🔒'}
🕒 *Время:* ${new Date(review.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`;

  try {
    const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: settings.telegramChatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Review Telegram notification error:', err);
    return false;
  }
}

// Convert Review to Supabase format
function reviewToSupabaseRow(review: ClientReview) {
  return {
    id: review.id,
    author: review.author,
    role: review.role,
    company: review.company,
    website_url: review.websiteUrl || null,
    contact: review.contact || null,
    avatar: review.avatar || null,
    rating: review.rating,
    services: review.services,
    quote: review.quote,
    format_mode: review.formatMode,
    full_review_text: review.fullReviewText || null,
    liked_most: review.likedMost || null,
    liked_special: review.likedSpecial || null,
    to_improve: review.toImprove || null,
    business_results: review.businessResults || null,
    allow_publish: review.allowPublish,
    status: review.status,
    created_at: review.createdAt,
    updated_at: review.updatedAt,
    page_url: review.pageUrl || null,
  };
}

// Submit a Client Review
export async function submitClientReview(payload: CreateReviewPayload): Promise<ClientReview> {
  const currentReviews = getStoredReviews();
  const now = new Date().toISOString();
  const id = generateReviewId();

  const newReview: ClientReview = {
    id,
    author: payload.author.trim(),
    role: payload.role.trim(),
    company: payload.company.trim(),
    websiteUrl: payload.websiteUrl?.trim(),
    contact: payload.contact?.trim(),
    avatar: payload.avatar,
    rating: payload.rating || 5,
    services: payload.services && payload.services.length > 0 ? payload.services : ['Комплексный проект'],
    quote: payload.quote.trim(),
    formatMode: payload.formatMode || 'structured',
    fullReviewText: payload.fullReviewText?.trim(),
    likedMost: payload.likedMost?.trim(),
    likedSpecial: payload.likedSpecial?.trim(),
    toImprove: payload.toImprove?.trim(),
    businessResults: payload.businessResults?.trim(),
    allowPublish: payload.allowPublish !== false,
    status: 'new',
    createdAt: now,
    updatedAt: now,
    pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://yapil.art/review',
  };

  const updatedReviews = [newReview, ...currentReviews];
  saveStoredReviews(updatedReviews);

  // Play audio chime
  playLeadChime();

  // Desktop notification if permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`Новый отзыв от ${newReview.author}`, {
        body: `${newReview.company} — ${newReview.rating}★: ${newReview.quote.slice(0, 80)}...`,
        icon: '/apple-touch-icon.png',
      });
    } catch {
      // ignore
    }
  }

  // Supabase background insertion (Public anon insert via RLS)
  if (isSupabaseConfigured) {
    fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(reviewToSupabaseRow(newReview)),
    }).catch((err) => console.warn('Supabase review insert error:', err));
  }

  // Dispatch to server-side API (Telegram notification using Vercel env vars)
  if (typeof window !== 'undefined') {
    fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview),
    }).catch((err) => console.warn('[submitReview] /api/review request failed:', err));
  }

  // Send client-side Telegram notification if configured in local settings
  sendReviewTelegramNotification(newReview).catch((err) => {
    console.warn('Failed to send Telegram review notification:', err);
  });

  return newReview;
}

export function updateReviewStatus(id: string, status: ReviewStatus): ClientReview | null {
  const reviews = getStoredReviews();
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: ClientReview = {
    ...reviews[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  reviews[index] = updated;
  saveStoredReviews(reviews);

  // Supabase sync
  if (isSupabaseConfigured) {
    fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ status, updated_at: updated.updatedAt }),
    }).catch((err) => console.warn('Supabase review patch error:', err));
  }

  return updated;
}

export function deleteReview(id: string): void {
  const reviews = getStoredReviews().filter((r) => r.id !== id);
  saveStoredReviews(reviews);

  if (isSupabaseConfigured) {
    fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }).catch((err) => console.warn('Supabase review delete error:', err));
  }
}

export function calculateReviewStats(reviews: ClientReview[]): ReviewStats {
  const total = reviews.length;
  if (total === 0) {
    return { total: 0, newCount: 0, publishedCount: 0, avgRating: 5.0, fiveStarPercent: 100 };
  }

  const newCount = reviews.filter((r) => r.status === 'new').length;
  const publishedCount = reviews.filter((r) => r.status === 'published').length;
  const sumRating = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  const avgRating = Math.round((sumRating / total) * 10) / 10;
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fiveStarPercent = Math.round((fiveStarCount / total) * 100);

  return {
    total,
    newCount,
    publishedCount,
    avgRating,
    fiveStarPercent,
  };
}

// Generate ready-to-use TypeScript code for pasting directly into src/data/reviewsData.ts
export function generateReviewTypeScriptSnippet(review: ClientReview): string {
  const slug = review.company.toLowerCase().replace(/[^a-zа-я0-9]/gi, '-').slice(0, 16) || 'client';

  const sections: string[] = [];

  if (review.formatMode === 'structured') {
    if (review.likedMost) {
      const items = review.likedMost
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `            '${s.replace(/'/g, "\\'")}',`)
        .join('\n');

      sections.push(`        {
          title: 'Что понравилось?',
          items: [
${items}
          ],
        }`);
    }

    if (review.likedSpecial) {
      const items = review.likedSpecial
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `            '${s.replace(/'/g, "\\'")}',`)
        .join('\n');

      sections.push(`        {
          title: 'Что очень понравилось?',
          items: [
${items}
          ],
        }`);
    }

    if (review.toImprove) {
      const items = review.toImprove
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `            '${s.replace(/'/g, "\\'")}',`)
        .join('\n');

      sections.push(`        {
          title: 'Что напрягало / что улучшить?',
          items: [
${items}
          ],
        }`);
    }

    if (review.businessResults) {
      sections.push(`        {
          title: 'Результаты проекта',
          text: '${review.businessResults.replace(/'/g, "\\'")}',
        }`);
    }
  }

  let fullReviewCode = '';
  if (review.formatMode === 'structured' && sections.length > 0) {
    fullReviewCode = `,
    fullReview: {
      lead: '${review.quote.slice(0, 120).replace(/'/g, "\\'")}',
      sections: [
${sections.join(',\n')}
      ],
    }`;
  } else if (review.fullReviewText) {
    const paragraphs = review.fullReviewText
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `        '${p.replace(/'/g, "\\'")}',`)
      .join('\n');

    fullReviewCode = `,
    fullReview: {
      lead: '${review.quote.slice(0, 120).replace(/'/g, "\\'")}',
      paragraphs: [
${paragraphs}
      ],
    }`;
  }

  return `  {
    id: '${slug}',
    author: '${review.author.replace(/'/g, "\\'")}',
    role: '${review.role.replace(/'/g, "\\'")}',
    company: '${review.company.replace(/'/g, "\\'")}',
    avatar: '${review.avatar || '/reviews/avatar-placeholder.webp'}',
    projectTitle: '${review.company.replace(/'/g, "\\'")}',
    projectUrl: '${review.websiteUrl || `/case/${slug}`}',
    projectImage: '/case/${slug}.webp',
    quote:
      '${review.quote.replace(/'/g, "\\'")}'${fullReviewCode}
  },`;
}
