import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'node:fs/promises';

export const prerender = false;

const contentFile = new URL('../../../data/cms-overrides.json', import.meta.url);

interface ContentEntry {
  route: string;
  selector: string;
  textIndex: number;
  value: string;
  updatedAt: string;
}

interface ContentStore {
  version: number;
  updatedAt: string | null;
  entries: Record<string, ContentEntry>;
}

const emptyStore = (): ContentStore => ({ version: 1, updatedAt: null, entries: {} });

async function readStore(): Promise<ContentStore> {
  try {
    const source = await readFile(contentFile, 'utf8');
    const parsed = JSON.parse(source) as ContentStore;
    return parsed?.entries ? parsed : emptyStore();
  } catch {
    return emptyStore();
  }
}

async function saveStore(store: ContentStore): Promise<void> {
  store.updatedAt = new Date().toISOString();
  await writeFile(contentFile, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

function localOnly(): Response | null {
  if (import.meta.env.DEV) return null;
  return new Response(JSON.stringify({ error: 'Локальный редактор отключён в production.' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export const GET: APIRoute = async () => {
  const blocked = localOnly();
  if (blocked) return blocked;
  return json(await readStore());
};

export const PUT: APIRoute = async ({ request }) => {
  const blocked = localOnly();
  if (blocked) return blocked;

  let payload: Partial<ContentEntry> & { key?: string };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Некорректный JSON.' }, 400);
  }

  const key = payload.key?.trim();
  const route = payload.route?.trim();
  const selector = payload.selector?.trim();
  const value = typeof payload.value === 'string' ? payload.value.trim() : '';
  const textIndex = Number(payload.textIndex);

  if (!key || !route || !selector || !value || !Number.isInteger(textIndex) || textIndex < 0) {
    return json({ error: 'Не заполнены обязательные поля.' }, 400);
  }
  if (key.length > 1000 || selector.length > 800 || value.length > 20_000) {
    return json({ error: 'Поле превышает допустимый размер.' }, 413);
  }

  const store = await readStore();
  store.entries[key] = {
    route,
    selector,
    textIndex,
    value,
    updatedAt: new Date().toISOString(),
  };
  await saveStore(store);
  return json({ ok: true, entry: store.entries[key], updatedAt: store.updatedAt });
};

export const DELETE: APIRoute = async ({ request }) => {
  const blocked = localOnly();
  if (blocked) return blocked;

  let payload: { key?: string };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Некорректный JSON.' }, 400);
  }

  const key = payload.key?.trim();
  if (!key) return json({ error: 'Не указан ключ.' }, 400);

  const store = await readStore();
  delete store.entries[key];
  await saveStore(store);
  return json({ ok: true, updatedAt: store.updatedAt });
};
