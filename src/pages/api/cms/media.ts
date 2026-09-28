import type { APIRoute } from 'astro';
import { createHash, createHmac } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

export const prerender = false;

const libraryFile = new URL('../../../data/cms-media.json', import.meta.url);
const rasterTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif']);
const passthroughTypes = new Set(['image/svg+xml', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/ogg']);
const extensions: Record<string, string> = {
  'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/avif': '.avif',
  'image/svg+xml': '.svg', 'image/gif': '.gif', 'video/mp4': '.mp4', 'video/webm': '.webm',
  'audio/mpeg': '.mp3', 'audio/ogg': '.ogg',
};

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  contentType: string;
  bytes: number;
  sha256: string;
  processing: 'tinify-webp' | 'original';
  createdAt: string;
}

function response(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}

function requiredEnv(name: string): string {
  const value = import.meta.env[name] || process.env[name];
  if (!value) throw new Error(`Не задана переменная ${name}.`);
  return value;
}

const sha256 = (data: Uint8Array | string) => createHash('sha256').update(data).digest('hex');
const hmac = (key: string | Buffer, data: string) => createHmac('sha256', key).update(data).digest();
const encode = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

async function uploadR2(key: string, body: Buffer, contentType: string): Promise<void> {
  const accountId = requiredEnv('R2_ACCOUNT_ID');
  const accessKey = requiredEnv('R2_ACCESS_KEY_ID');
  const secretKey = requiredEnv('R2_SECRET_ACCESS_KEY');
  const bucket = requiredEnv('R2_BUCKET');
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const uri = `/${[bucket, ...key.split('/')].map(encode).join('/')}`;
  const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const payloadHash = sha256(body);
  const headers: Record<string, string> = {
    host,
    'cache-control': 'public, max-age=31536000, immutable',
    'content-type': contentType,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': date,
  };
  const headerNames = Object.keys(headers).sort();
  const signedHeaders = headerNames.join(';');
  const canonicalHeaders = headerNames.map((name) => `${name}:${headers[name].trim()}\n`).join('');
  const canonical = ['PUT', uri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const scope = `${date.slice(0, 8)}/auto/s3/aws4_request`;
  let signingKey = hmac(`AWS4${secretKey}`, date.slice(0, 8));
  for (const part of ['auto', 's3', 'aws4_request']) signingKey = hmac(signingKey, part);
  const signature = createHmac('sha256', signingKey).update(`AWS4-HMAC-SHA256\n${date}\n${scope}\n${sha256(canonical)}`).digest('hex');
  headers.Authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const upload = await fetch(`https://${host}${uri}`, { method: 'PUT', headers, body });
  if (!upload.ok) throw new Error(`Cloudflare R2 вернул HTTP ${upload.status}.`);
}

async function tinify(input: Buffer): Promise<Buffer> {
  const auth = `Basic ${Buffer.from(`api:${requiredEnv('TINIFY_API_KEY')}`).toString('base64')}`;
  const shrink = await fetch('https://api.tinify.com/shrink', {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/octet-stream' },
    body: input,
  });
  if (!shrink.ok) throw new Error(`Tinify вернул HTTP ${shrink.status}.`);
  const shrinkData = await shrink.json();
  const location = shrink.headers.get('location') || shrinkData?.output?.url;
  if (!location || new URL(location).hostname !== 'api.tinify.com') throw new Error('Tinify не вернул безопасный URL результата.');
  const converted = await fetch(location, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ convert: { type: ['image/webp'] } }),
  });
  if (!converted.ok) throw new Error(`Tinify WebP-конвертация вернула HTTP ${converted.status}.`);
  const output = Buffer.from(await converted.arrayBuffer());
  if (output.subarray(0, 4).toString() !== 'RIFF' || output.subarray(8, 12).toString() !== 'WEBP') {
    throw new Error('Tinify вернул файл, который не является WebP.');
  }
  return output;
}

function safeStem(name: string): string {
  return name.replace(/\.[^.]+$/, '').normalize('NFKD').replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'media';
}

export const GET: APIRoute = async () => {
  if (!import.meta.env.DEV) return response({ error: 'Локальная медиатека отключена в production.' }, 403);
  return response(JSON.parse(await readFile(libraryFile, 'utf8')));
};

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) return response({ error: 'Загрузка доступна только локально.' }, 403);
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0) return response({ error: 'Выберите файл.' }, 400);
    if (file.size > 100 * 1024 * 1024) return response({ error: 'Максимальный размер файла — 100 МБ.' }, 413);
    if (!rasterTypes.has(file.type) && !passthroughTypes.has(file.type)) return response({ error: `Формат ${file.type || 'неизвестен'} не поддерживается.` }, 415);

    const input = Buffer.from(await file.arrayBuffer());
    const processed = rasterTypes.has(file.type) ? await tinify(input) : input;
    const contentType = rasterTypes.has(file.type) ? 'image/webp' : file.type;
    const extension = rasterTypes.has(file.type) ? '.webp' : extensions[file.type];
    const hash = sha256(processed);
    const folder = String(form.get('folder') || 'portfolio').replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+|\/+$/g, '') || 'portfolio';
    const key = `${folder}/${safeStem(file.name)}.${hash.slice(0, 16)}${extension}`;
    await uploadR2(key, processed, contentType);

    const baseUrl = requiredEnv('R2_PUBLIC_BASE_URL').replace(/\/+$/, '');
    if (baseUrl !== 'https://media.yapil.art') throw new Error('Настроен неожиданный публичный адрес R2.');
    const publicUrl = `${baseUrl}/${key.split('/').map(encode).join('/')}`;
    const check = await fetch(publicUrl, { cache: 'no-store' });
    if (!check.ok || check.headers.get('content-type')?.split(';')[0] !== contentType) throw new Error('Опубликованный файл не прошёл проверку Content-Type.');
    const verified = Buffer.from(await check.arrayBuffer());
    if (sha256(verified) !== hash) throw new Error('Опубликованный файл не совпадает с загруженным.');

    const library = JSON.parse(await readFile(libraryFile, 'utf8')) as { version: number; assets: MediaAsset[] };
    const asset: MediaAsset = {
      id: hash.slice(0, 16), name: file.name, url: publicUrl, contentType, bytes: processed.length, sha256: hash,
      processing: rasterTypes.has(file.type) ? 'tinify-webp' : 'original', createdAt: new Date().toISOString(),
    };
    library.assets.unshift(asset);
    await writeFile(libraryFile, `${JSON.stringify(library, null, 2)}\n`, 'utf8');
    return response({ ok: true, asset });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : 'Ошибка обработки файла.' }, 500);
  }
};
