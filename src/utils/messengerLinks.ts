/**
 * Utility for creating structured, context-aware WhatsApp and Telegram links with automatic page attribution.
 */

export interface MessengerLinkOptions {
  pageUrl?: string;
  sourceContext?: string;
}

export function getWhatsAppUrl(options: MessengerLinkOptions = {}): string {
  const phone = '77067436197';
  let page = '/';

  if (options.pageUrl) {
    try {
      const url = new URL(options.pageUrl, 'https://yapil.art');
      page = `${url.pathname}${url.search}${url.hash}` || '/';
    } catch {
      page = options.pageUrl;
    }
  }

  const lines = [
    'Здравствуйте! Хочу обсудить проект',
    '',
    `Страница: ${page}`,
    `Форма: ${options.sourceContext || 'site_contact'}`,
  ];

  const message = lines.join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getTelegramUrl(options: MessengerLinkOptions = {}): string {
  const username = 'yakov_pil';
  return `https://t.me/${username}`;
}
