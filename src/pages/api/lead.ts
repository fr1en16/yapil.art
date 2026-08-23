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

function getWebhookUrl() {
  return (
    process.env.CUSTOM_WEBHOOK_URL ||
    process.env.WEBHOOK_URL ||
    import.meta.env.CUSTOM_WEBHOOK_URL
  );
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const {
      id = 'YP-LEAD',
      name = '—',
      phone = '—',
      email,
      services = [],
      message,
      budget,
      source = 'Сайт',
      sourceDetails,
      pageUrl = 'https://yapil.art',
      utm,
    } = payload || {};

    const { token, chatId } = getTelegramEnv();
    const webhookUrl = getWebhookUrl();

    let telegramSent = false;
    let telegramError: any = null;

    if (token && chatId) {
      const servicesText =
        Array.isArray(services) && services.length > 0 ? services.join(', ') : 'Консультация';

      let utmText = '';
      if (utm && typeof utm === 'object' && Object.keys(utm).length > 0) {
        const utmParts = Object.entries(utm)
          .filter(([_, v]) => Boolean(v))
          .map(([k, v]) => `${k}: ${v}`);
        if (utmParts.length > 0) {
          utmText = `\n📊 *UTM:* ${utmParts.join(' | ')}`;
        }
      }

      const text = `🔥 *Новая заявка на сайте Yapil!* (${id})
👤 *Клиент:* ${name}
📞 *Телефон:* ${phone}
${email ? `✉️ *Email:* ${email}\n` : ''}💼 *Услуги:* ${servicesText}
${budget ? `💰 *Бюджет:* ${budget}\n` : ''}${message ? `💬 *Сообщение:* ${message}\n` : ''}📍 *Источник:* ${sourceDetails || source}
🔗 *Страница:* ${pageUrl}${utmText}
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
          console.error('[API /api/lead] Telegram error:', tgData);
        }
      } catch (err: any) {
        telegramError = err?.message || String(err);
        console.error('[API /api/lead] Telegram fetch failed:', err);
      }
    } else {
      console.warn('[API /api/lead] Telegram environment variables are not set.');
    }

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'new_lead',
            timestamp: new Date().toISOString(),
            lead: payload,
          }),
        });
      } catch (err) {
        console.error('[API /api/lead] Webhook dispatch error:', err);
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
    console.error('[API /api/lead] Handler error:', err);
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
