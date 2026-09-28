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

function getWebhookUrl() {
  return (
    getCfEnv('CUSTOM_WEBHOOK_URL') ||
    getCfEnv('WEBHOOK_URL')
  );
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const now = new Date().toISOString();
    const {
      id = `YP-${Math.floor(1000 + Math.random() * 9000)}`,
      name = '—',
      phone = '—',
      rawPhone,
      email,
      services = [],
      message,
      budget,
      source = 'Сайт',
      sourceDetails,
      pageUrl = 'https://yapil.art',
      referrer,
      utm,
      firstLandingPage,
      firstReferrer,
    } = payload || {};

    // 1. Cloudflare D1 Persistence
    const db = getDb();
    let dbSaved = false;

    if (db) {
      try {
        await db.prepare(`
          INSERT INTO leads (
            id, name, phone, raw_phone, email, services, message, status,
            priority, budget, source, source_details, page_url, referrer,
            utm, notes, activities, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          String(name),
          String(phone),
          rawPhone ? String(rawPhone) : String(phone),
          email ? String(email) : null,
          JSON.stringify(Array.isArray(services) ? services : []),
          message ? String(message) : null,
          'new',
          'normal',
          budget ? String(budget) : null,
          String(source || 'Сайт'),
          sourceDetails ? String(sourceDetails) : null,
          String(pageUrl || 'https://yapil.art'),
          referrer ? String(referrer) : null,
          JSON.stringify(utm && typeof utm === 'object' ? utm : {}),
          JSON.stringify([]),
          JSON.stringify([
            {
              id: `act-${Date.now()}`,
              type: 'created',
              description: `Заявка создана через форму (${sourceDetails || source})`,
              createdAt: now,
            }
          ]),
          now,
          now
        ).run();
        dbSaved = true;
      } catch (dbErr) {
        console.error('[API /api/lead] Cloudflare D1 insert error:', dbErr);
      }
    }

    // 2. Telegram Notification
    const { token, chatId } = getTelegramEnv();
    const webhookUrl = getWebhookUrl();

    let telegramSent = false;
    let webhookSent = false;

    if (token && chatId) {
      const servicesText =
        Array.isArray(services) && services.length > 0 ? services.join(', ') : 'Консультация';

      let utmText = '';
      if (utm && typeof utm === 'object' && Object.keys(utm).length > 0) {
        const utmParts = Object.entries(utm)
          .filter(([_, v]) => Boolean(v))
          .map(([k, v]) => `${k}: ${v}`);
        if (utmParts.length > 0) {
          utmText = `\n📊 UTM: ${utmParts.join(' | ')}`;
        }
      }

      const text = `🔥 Новая заявка на сайте Yapil! (${id})
👤 Клиент: ${name}
📞 Телефон: ${phone}
${email ? `✉️ Email: ${email}\n` : ''}💼 Услуги: ${servicesText}
${budget ? `💰 Бюджет: ${budget}\n` : ''}${message ? `💬 Сообщение: ${message}\n` : ''}📍 Источник: ${sourceDetails || source}
🔗 Страница: ${pageUrl}${firstLandingPage ? `\nПервая страница: ${firstLandingPage}` : ''}${firstReferrer ? `\nПервый переход: ${firstReferrer}` : ''}${utmText}
🕒 Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
          }),
        });

        const tgData = await tgRes.json().catch(() => ({}));
        if (tgRes.ok && tgData.ok) {
          telegramSent = true;
        } else {
          console.error('[API /api/lead] Telegram error:', tgData);
        }
      } catch (err: any) {
        console.error('[API /api/lead] Telegram fetch failed:', err);
      }
    } else {
      console.warn('[API /api/lead] Telegram environment variables are not set.');
    }

    // 3. Webhook Notification
    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'new_lead',
            timestamp: now,
            lead: { ...payload, id },
          }),
        });
        webhookSent = webhookResponse.ok;
        if (!webhookResponse.ok) {
          console.error('[API /api/lead] Webhook returned:', webhookResponse.status);
        }
      } catch (err) {
        console.error('[API /api/lead] Webhook dispatch error:', err);
      }
    }

    const delivered = dbSaved || telegramSent || webhookSent;

    return new Response(
      JSON.stringify({
        success: delivered,
        leadId: id,
        dbSaved,
        telegramConfigured: Boolean(token && chatId),
        telegramSent,
        webhookSent,
        deliveryChannel: dbSaved ? 'd1_database' : telegramSent ? 'telegram' : webhookSent ? 'webhook' : null,
        ...(!delivered ? { error: 'Не удалось доставить заявку. Попробуйте ещё раз или напишите в WhatsApp.' } : {}),
      }),
      {
        status: delivered ? 200 : 502,
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
