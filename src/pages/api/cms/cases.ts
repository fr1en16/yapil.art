import type { APIRoute } from 'astro';
import matter from 'gray-matter';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { isBusinessSector } from '../../../data/business-sectors';
import { isServiceTag } from '../../../data/service-tags';

export const prerender = false;

const casesDirectory = path.join(process.cwd(), 'src/content/cases');

function localOnly() {
  return new Response(JSON.stringify({ error: 'Редактирование доступно только локально.' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function safeSlug(value: unknown) {
  const slug = String(value || '');
  return /^[a-z0-9][a-z0-9-]*$/.test(slug) ? slug : null;
}

async function readCase(slug: string) {
  const source = await fs.readFile(path.join(casesDirectory, `${slug}.md`), 'utf8');
  const parsed = matter(source);
  return { slug, ...parsed.data, body: parsed.content.trim() };
}

export const GET: APIRoute = async () => {
  if (!import.meta.env.DEV) return localOnly();
  const files = (await fs.readdir(casesDirectory)).filter((file) => file.endsWith('.md'));
  const cases = await Promise.all(files.map((file) => readCase(file.replace(/\.md$/, ''))));
  cases.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  return Response.json({ cases }, { headers: { 'Cache-Control': 'no-store' } });
};

export const PUT: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) return localOnly();
  const input = await request.json();
  const slug = safeSlug(input.slug);
  if (!slug) return Response.json({ error: 'Некорректный slug.' }, { status: 400 });

  const data = {
    title: String(input.title || '').trim(),
    year: String(input.year || '').trim(),
    summary: String(input.summary || '').trim(),
    tags: Array.isArray(input.tags) ? Array.from(new Set(input.tags.map((item: unknown) => String(item).trim()).filter(Boolean))) : [],
    ...(String(input.sector || '').trim() ? { sector: String(input.sector).trim() } : {}),
    cover: String(input.cover || '').trim(),
    ...(String(input.socialImage || '').trim() ? { socialImage: String(input.socialImage).trim() } : {}),
    order: Number(input.order || 0),
    featured: Boolean(input.featured),
    ...(String(input.task || '').trim() ? { task: String(input.task).trim() } : {}),
    ...(String(input.goal || '').trim() ? { goal: String(input.goal).trim() } : {}),
    ...(String(input.link || '').trim() ? { link: String(input.link).trim() } : {}),
    reviewed: Boolean(input.reviewed),
  };

  if (!data.title || !data.year || !data.summary || data.tags.length === 0) {
    return Response.json({ error: 'Заполните название, год, описание и теги.' }, { status: 400 });
  }
  if (!data.tags.every(isServiceTag)) {
    return Response.json({ error: 'Выберите теги из списка.' }, { status: 400 });
  }
  if (data.sector && !isBusinessSector(data.sector)) {
    return Response.json({ error: 'Выберите сферу из списка.' }, { status: 400 });
  }

  const body = String(input.body || '').trim();
  await fs.writeFile(path.join(casesDirectory, `${slug}.md`), matter.stringify(body ? `${body}\n` : '', data), 'utf8');
  return Response.json({ case: await readCase(slug) });
};
