export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb, getCfEnv } from '../../lib/cloudflareEnv';

function getTelegramEnv() {
  const token =
    getCfEnv('TELEGRAM_BOT_TOKEN') ||
    getCfEnv('TELEGRAM_TOKEN') ||
    getCfEnv('TG_BOT_TOKEN') ||
    getCfEnv('BOT_TOKEN');

  const chatId =
    getCfEnv('TELEGRAM_CHAT_ID') ||
    getCfEnv('TG_CHAT_ID') ||
    getCfEnv('CHAT_ID');

  return { token, chatId };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const review = await request.json();
    const now = new Date().toISOString();
    const id = review.id || `rev-${Date.now()}`;

    // 1. Cloudflare D1 Persistence
    const db = getDb();
    let dbSaved = false;

    if (db) {
      try {
        await db.prepare(`
          INSERT INTO reviews (
            id, author, role, company, website_url, contact, avatar, rating,
            services, quote, format_mode, liked_most, liked_special, to_improve,
            business_results, full_review_text, allow_publish, status,
            created_at, updated_at, page_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          String(review.author || '—'),
          String(review.role || '—'),
          String(review.company || ''),
          review.websiteUrl ? String(review.websiteUrl) : null,
          review.contact ? String(review.contact) : null,
          review.avatar ? String(review.avatar) : null,
          Number(review.rating || 5),
          JSON.stringify(Array.isArray(review.services) ? review.services : []),
          String(review.quote || '—'),
          String(review.formatMode || 'freeform'),
          review.likedMost ? String(review.likedMost) : null,
          review.likedSpecial ? String(review.likedSpecial) : null,
          review.toImprove ? String(review.toImprove) : null,
          review.businessResults ? String(review.businessResults) : null,
          review.fullReviewText ? String(review.fullReviewText) : null,
          review.allowPublish ? 1 : 0,
          String(review.status || 'pending'),
          review.createdAt || now,
          now,
          review.pageUrl ? String(review.pageUrl) : 'https://yapil.art/review'
        ).run();
        dbSaved = true;
      } catch (dbErr) {
        console.error('[API /api/review] Cloudflare D1 insert error:', dbErr);
      }
    }

    // 2. Telegram Notification
    const { token, chatId } = getTelegramEnv();
    let telegramSent = false;
    let telegramError: any = null;

    if (token && chatId) {
      const stars = '⭐️'.repeat(review.rating || 5);
      const servicesText =
        Array.isArray(review.services) && review.services.length > 0
          ? review.services.join(', ')
          : 'Не указано';

      let detailsBlock = '';
      if (review.formatMode === 'structured') {
        if (review.likedMost) detailsBlock += `\n\n👍 *Что понравилось больше всего:*\n${review.likedMost}`;
        if (review.likedSpecial) detailsBlock += `\n\n✨ *Особо выделили:*\n${review.likedSpecial}`;
        if (review.toImprove) detailsBlock += `\n\n⚠️ *Что можно улучшить:*\n${review.toImprove}`;
        if (review.businessResults) detailsBlock += `\n\n🚀 *Результаты для бизнеса:*\n${review.businessResults}`;
      } else if (review.fullReviewText) {
        detailsBlock += `\n\n📝 *Полный текст отзыва:*\n${review.fullReviewText}`;
      }

      const text = `⭐️ *НОВЫЙ ОТЗЫВ КЛИЕНТА!* (${id})
👤 *Клиент:* ${review.author || '—'}
💼 *Роль / Компания:* ${review.role || '—'}${review.company ? `, ${review.company}` : ''}
⭐️ *Оценка:* ${stars} (${review.rating || 5}/5)
🎯 *Услуги:* ${servicesText}
${review.contact ? `📞 *Контакт:* ${review.contact}\n` : ''}${review.websiteUrl ? `🌐 *Сайт:* ${review.websiteUrl}\n` : ''}💬 *Главная цитата:*
«${review.quote || '—'}»${detailsBlock}

🔒 *Разрешение на публикацию:* ${review.allowPublish ? 'Да ✅' : 'Только для внутреннего анализа 🔒'}
🕒 *Время:* ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'Markdown',
          }),
        });

        const tgData = await tgRes.json().catch(() => ({}));
        if (tgRes.ok && tgData.ok) {
          telegramSent = true;
        } else {
          telegramError = tgData;
          console.error('[API /api/review] Telegram error:', tgData);
        }
      } catch (err: any) {
        telegramError = err?.message || String(err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        id,
        dbSaved,
        telegramConfigured: Boolean(token && chatId),
        telegramSent,
        ...(telegramError ? { telegramError } : {}),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[API /api/review] Handler error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Internal Server Error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
