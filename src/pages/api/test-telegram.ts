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

export const ALL: APIRoute = async ({ request }) => {
  try {
    let customToken: string | undefined;
    let customChatId: string | undefined;

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        customToken = body.token;
        customChatId = body.chatId;
      } catch {
        // ignore
      }
    }

    const { token: envToken, chatId: envChatId } = getTelegramEnv();
    const token = (customToken || envToken || '').trim();
    const chatId = (customChatId || envChatId || '').trim();

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'TELEGRAM_BOT_TOKEN не задан ни в переменных окружения, ни в запросе.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!chatId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'TELEGRAM_CHAT_ID не задан ни в переменных окружения, ни в запросе.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Test getMe first
    const getMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const getMeData = await getMeRes.json().catch(() => ({}));

    if (!getMeRes.ok || !getMeData.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          stage: 'getMe',
          error: 'Неверный TELEGRAM_BOT_TOKEN. Telegram API отклонил токен бота.',
          details: getMeData,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const botName = getMeData.result?.username || getMeData.result?.first_name || 'Bot';

    // Send test message
    const testMessage = `✅ *Тестовое сообщение с сайта Yapil.art!*\n\nБот: @${botName}\nChat ID: \`${chatId}\`\nИнтеграция работает корректно!\n🕒 ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`;

    const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'Markdown',
      }),
    });

    const sendData = await sendRes.json().catch(() => ({}));

    if (!sendRes.ok || !sendData.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          stage: 'sendMessage',
          error: `Бот найден (@${botName}), но не смог отправить сообщение в Chat ID "${chatId}". Убедитесь, что вы нажали /start в боте или добавили бота в группу!`,
          details: sendData,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        bot: botName,
        chatId,
        message: 'Тестовое сообщение успешно доставлено в Telegram!',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
