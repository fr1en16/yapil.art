export const prerender = false;

import type { APIRoute } from 'astro';

function getTelegramEnv() {
  const token =
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.TELEGRAM_TOKEN ||
    process.env.TG_BOT_TOKEN ||
    process.env.BOT_TOKEN ||
    import.meta.env.TELEGRAM_BOT_TOKEN;

  const chatId =
    process.env.TELEGRAM_CHAT_ID ||
    process.env.TG_CHAT_ID ||
    process.env.CHAT_ID ||
    import.meta.env.TELEGRAM_CHAT_ID;

  return { token, chatId };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const review = await request.json();
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

      const text = `⭐️ *НОВЫЙ ОТЗЫВ КЛИЕНТА!* (${review.id || 'Отзыв'})
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
