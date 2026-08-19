/**
 * Utility for creating structured, context-aware WhatsApp and Telegram links with automatic page attribution.
 */

export interface MessengerLinkOptions {
  pageTitle?: string;
  pageUrl?: string;
  sourceContext?: string;
  customNote?: string;
}

export function getWhatsAppUrl(options: MessengerLinkOptions = {}): string {
  const phone = '77067436197';
  const lines: string[] = ['Здравствуйте! Хочу обсудить проект с командой Yapil.'];

  if (options.pageTitle) {
    lines.push(`Тема / Услуга: ${options.pageTitle}`);
  }
  if (options.sourceContext) {
    lines.push(`Контекст: ${options.sourceContext}`);
  }
  if (options.customNote) {
    lines.push(`Детали: ${options.customNote}`);
  }
  if (options.pageUrl) {
    lines.push(`Страница: ${options.pageUrl}`);
  } else {
    lines.push('Канал: Сайт yapil.art');
  }

  const message = lines.join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getTelegramUrl(options: MessengerLinkOptions = {}): string {
  const username = 'yakov_pil';
  return `https://t.me/${username}`;
}
