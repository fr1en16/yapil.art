import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'node:fs/promises';
import { isServiceTag } from '../../../data/service-tags';
import { readPortfolioMeta } from '../../../lib/portfolio-meta';

export const prerender = false;

const galleryFile = new URL('../../../data/vsyachina-gallery.json', import.meta.url);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) return json({ error: 'Редактирование доступно только локально.' }, 403);
  try {
    const input = await request.json();
    const group = String(input.group || '').trim();
    const title = String(input.title || '').trim();
    const alt = String(input.alt || '').trim();
    const url = new URL(String(input.url || ''));
    const width = Math.max(1, Math.round(Number(input.width || 1200)));
    const height = Math.max(1, Math.round(Number(input.height || 1200)));
    const isVideo = Boolean(input.isVideo);
    if (!/^[a-zA-Z0-9_-]+$/.test(group) || !title || !alt) return json({ error: 'Укажите проект, название и alt-текст.' }, 400);
    if (url.protocol !== 'https:' || url.hostname !== 'media.yapil.art') return json({ error: 'Допустимы только медиа с media.yapil.art.' }, 400);

    const meta = await readPortfolioMeta();
    if (!meta[group]) return json({ error: 'Группа портфолио не найдена.' }, 404);
    const gallery = JSON.parse(await readFile(galleryFile, 'utf8')) as Record<string, unknown>[];
    const extension = url.pathname.match(/\.[a-z0-9]+$/i)?.[0] || (isVideo ? '.mp4' : '.webp');
    const sequence = gallery.filter((item) => String(item.name || '').startsWith(group)).length + 1;
    const name = `${group}-${String(sequence).padStart(3, '0')}${extension}`;
    const item = { name, width, height, isVideo, url: url.href, alt, title };
    gallery.push(item);
    await writeFile(galleryFile, `${JSON.stringify(gallery, null, 2)}\n`, 'utf8');
    return json({ ok: true, item });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Не удалось добавить работу.' }, 400);
  }
};

// Свои теги фото. Пустой список — фото снова наследует теги кейса.
export const PUT: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) return json({ error: 'Редактирование доступно только локально.' }, 403);
  try {
    const input = await request.json();
    const name = String(input.name || '').trim();
    const tags = Array.isArray(input.tags)
      ? Array.from(new Set(input.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)))
      : [];
    if (!tags.every((tag) => isServiceTag(tag as string))) return json({ error: 'Выберите теги из списка.' }, 400);

    const gallery = JSON.parse(await readFile(galleryFile, 'utf8')) as Record<string, unknown>[];
    const item = gallery.find((entry) => entry.name === name);
    if (!item) return json({ error: 'Фото не найдено.' }, 404);
    if (tags.length) item.tags = tags;
    else delete item.tags;
    await writeFile(galleryFile, `${JSON.stringify(gallery, null, 2)}\n`, 'utf8');
    return json({ ok: true, name, tags });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Не удалось сохранить теги.' }, 400);
  }
};
