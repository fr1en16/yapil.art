import type { APIRoute } from 'astro';
import { isBusinessSector } from '../../../data/business-sectors';
import { isServiceTag } from '../../../data/service-tags';
import { readPortfolioMeta, writePortfolioMeta, type PortfolioMeta } from '../../../lib/portfolio-meta';

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function localOnly(): Response | null {
  return import.meta.env.DEV ? null : json({ error: 'Редактирование портфолио доступно только локально.' }, 403);
}

export const GET: APIRoute = async () => {
  const blocked = localOnly();
  if (blocked) return blocked;
  return json(await readPortfolioMeta());
};

export const PUT: APIRoute = async ({ request }) => {
  const blocked = localOnly();
  if (blocked) return blocked;

  let payload: { prefix?: string; meta?: Partial<PortfolioMeta> };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Некорректный JSON.' }, 400);
  }

  const prefix = payload.prefix?.trim();
  const candidate = payload.meta;
  const label = candidate?.label?.trim();
  const sector = candidate?.sector?.trim() || '';
  const tags = Array.isArray(candidate?.tags)
    ? Array.from(new Set(candidate.tags.map((tag) => tag.trim()).filter(Boolean)))
    : [];
  const order = Number(candidate?.order);

  if (!prefix || !/^[a-zA-Z0-9_-]+$/.test(prefix) || !label || tags.length === 0 || !Number.isFinite(order)) {
    return json({ error: 'Укажите название, минимум один тег и порядок.' }, 400);
  }
  if (!tags.every(isServiceTag)) return json({ error: 'Выберите теги из списка.' }, 400);
  if (sector && !isBusinessSector(sector)) return json({ error: 'Выберите сферу из списка.' }, 400);

  const meta = await readPortfolioMeta();
  meta[prefix] = {
    label,
    tags,
    ...(sector ? { sector } : {}),
    caseSlug: candidate?.caseSlug?.trim() || undefined,
    order,
    published: candidate?.published !== false,
  };
  await writePortfolioMeta(meta);
  return json({ ok: true, meta: meta[prefix] });
};
