// Resume-safe Tinify → R2 migration. Secrets are read only from the environment.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, createHmac } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
try { process.loadEnvFile(path.join(root, '.env')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const cache = path.join(root, '.cache/media-migration');
const manifestPath = path.join(root, 'media-manifest.json');
const raster = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const media = new Set([...raster, '.svg', '.gif', '.ico', '.mp4', '.webm', '.mov', '.mp3', '.wav', '.ogg', '.woff', '.woff2', '.ttf', '.otf', '.eot', '.pdf']);
const mime = { '.svg': 'image/svg+xml', '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.eot': 'application/vnd.ms-fontobject', '.pdf': 'application/pdf', '.webp': 'image/webp' };
const hash = (b) => createHash('sha256').update(b).digest('hex');
const hmac = (key, data) => createHmac('sha256', key).update(data).digest();
const encode = (s) => encodeURIComponent(s).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, '');

async function request(url, options = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(120000) });
      if (response.status === 429 && new URL(url).hostname === 'api.tinify.com') {
        const detail = await response.clone().json().catch(() => ({}));
        if (detail.message?.includes('monthly limit')) return response;
      }
      if ((response.status === 429 || response.status >= 500) && attempt < 3) {
        await response.arrayBuffer();
        await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt >= 3) throw new Error(`Network request failed (${new URL(url).hostname})`);
    }
  }
}

async function s3(method, key = '', body = Buffer.alloc(0), extra = {}, query = '') {
  const host = `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const uri = '/' + [process.env.R2_BUCKET, ...key.split('/')].filter(Boolean).map(encode).join('/');
  const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const payloadHash = hash(body);
  const headers = { host, 'x-amz-date': date, 'x-amz-content-sha256': payloadHash, ...extra };
  const names = Object.keys(headers).sort();
  const signed = names.join(';');
  const canonical = [method, uri, query, names.map(k => `${k}:${headers[k].trim()}\n`).join(''), signed, payloadHash].join('\n');
  const scope = `${date.slice(0, 8)}/auto/s3/aws4_request`;
  let signing = hmac(`AWS4${process.env.R2_SECRET_ACCESS_KEY}`, date.slice(0, 8));
  for (const part of ['auto', 's3', 'aws4_request']) signing = hmac(signing, part);
  const signature = createHmac('sha256', signing).update(`AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(canonical)}`).digest('hex');
  headers.Authorization = `AWS4-HMAC-SHA256 Credential=${process.env.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signed}, Signature=${signature}`;
  return request(`https://${host}${uri}${query ? '?' + query : ''}`, { method, headers, ...(!['GET', 'HEAD'].includes(method) ? { body } : {}) });
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]))).flat();
}

async function inventory() {
  const entries = [];
  for (const [folder, prefix] of [['public', ''], ['src/assets', 'assets']]) {
    for (const file of await walk(path.join(root, folder))) {
      if (media.has(path.extname(file).toLowerCase())) entries.push({ file, source: '/' + path.posix.join(prefix, path.relative(path.join(root, folder), file)) });
    }
  }
  const fontRoot = path.join(root, 'node_modules/@fontsource-variable/inter-tight');
  const fontCss = await fs.readFile(path.join(fontRoot, 'index.css'), 'utf8');
  for (const match of fontCss.matchAll(/url\(([^)]+)\)/g)) entries.push({ file: path.resolve(fontRoot, match[1]), source: '/fonts/' + path.basename(match[1]) });
  const ogRoot = path.join(root, 'dist/client/open-graph');
  const altOgRoot = path.join(root, 'dist/open-graph');
  for (const dir of [ogRoot, altOgRoot]) {
    try { for (const file of await walk(dir)) if (raster.has(path.extname(file))) entries.push({ file, source: '/open-graph/' + path.relative(dir, file) }); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  }
  // Repair the existing R2 JPEG using the same mandatory Tinify pipeline.
  const remote = 'https://media.yapil.art/media/iroh2.994ce8c3d0282ea3.jpg?v=2';
  entries.push({ remote, source: remote });
  const originals = new Set();
  for (const file of await walk(path.join(root, 'public/archive'))) {
    if (!['.html', '.css', '.js'].includes(path.extname(file))) continue;
    const text = await fs.readFile(file, 'utf8');
    for (const match of text.matchAll(/https?:\/\/[^\s"'<>`]+?\.(?:png|jpe?g|webp|svg|gif|avif|woff2?|ttf|mp4|webm)(?:\?[^\s"'<>`)]*)?(?=[\s"'<>`)]|$)/gi)) {
      if (new URL(match[0]).hostname === 'static.tildacdn.pro') originals.add(match[0]);
    }
  }
  try {
    const existing = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    for (const source of Object.keys(existing.assets)) if (source.startsWith('https://static.tildacdn.pro/')) originals.add(source);
  } catch (e) { if (e.code !== 'ENOENT') throw e; }
  for (const remote of originals) entries.push({ remote, source: remote, keyPrefix: 'archive/shanding/originals/' });
  entries.sort((a, b) => {
    const rank = e => e.source.startsWith('/articles/') ? 3 : e.source.startsWith('/archive/') ? 2 : 1;
    return rank(a) - rank(b) || a.source.localeCompare(b.source);
  });
  return entries;
}

async function main() {
  await fs.mkdir(cache, { recursive: true });
  for (const key of ['TINIFY_API_KEY', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET']) if (!process.env[key]) throw new Error(`Missing environment setting: ${key}`);
  if (base !== 'https://media.yapil.art') throw new Error('Unexpected R2 public destination');
  const auth = 'Basic ' + Buffer.from(`api:${process.env.TINIFY_API_KEY}`).toString('base64');
  if (process.argv.includes('--preflight')) {
    const t = await request('https://api.tinify.com/shrink', { method: 'POST', headers: { Authorization: auth } });
    console.log('Tinify validation HTTP', t.status, 'compression-count', t.headers.get('compression-count'));
    if (![400, 415].includes(t.status)) throw new Error(`Tinify validation failed: HTTP ${t.status}`);
    const b = await s3('HEAD');
    console.log('R2 bucket HTTP', b.status);
    if (!b.ok) throw new Error(`R2 access failed: HTTP ${b.status}`);
    const cors = await s3('GET', '', undefined, {}, 'cors=');
    console.log('R2 CORS HTTP', cors.status);
    if (cors.ok) console.log(await cors.text());
    console.log('Inventory:', (await inventory()).length, 'files');
    return;
  }
  let manifest;
  try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; manifest = { version: 1, assets: {} }; }
  const entries = await inventory();
  if (process.argv.includes('--plan')) {
    const pending = entries.filter(entry => !manifest.assets[entry.source]?.verifiedAt).map(({ source }) => source);
    await fs.writeFile(path.join(root, 'media-migration-pending.json'), JSON.stringify({ total: entries.length, verified: Object.keys(manifest.assets).length, pending }, null, 2) + '\n');
    console.log(`Migration plan: ${entries.length} assets; ${pending.length} pending.`);
    return;
  }
  const limitArg = process.argv.find(a => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : entries.length;
  let completed = 0;
  let persist = Promise.resolve();
  let cursor = 0;
  let failure;
  async function migrate(entry) {
    const extension = path.extname(entry.remote ? new URL(entry.remote).pathname : entry.file).toLowerCase();
    if (process.argv.includes('--originals-only') && raster.has(extension)) return;
    let input;
    if (entry.file) input = await fs.readFile(entry.file);
    else {
      const response = await request(entry.remote);
      if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
      input = Buffer.from(await response.arrayBuffer());
    }
    const sourceHash = hash(input);
    const previous = manifest.assets[entry.source];
    if (previous?.sourceHash === sourceHash && previous.verifiedAt) return;
    if (process.argv.includes('--cached-only') && raster.has(extension)) {
      try { await fs.access(path.join(cache, `${sourceHash}.webp`)); } catch { return; }
    }
    let output = input;
    const converted = raster.has(extension);
    if (converted) {
      const outputFile = path.join(cache, `${sourceHash}.webp`);
      try { output = await fs.readFile(outputFile); } catch (e) {
        if (e.code !== 'ENOENT') throw e;
        const compressed = await request('https://api.tinify.com/shrink', { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/octet-stream' }, body: input });
        if (!compressed.ok) throw new Error(`Tinify shrink HTTP ${compressed.status} for ${entry.source}`);
        const location = compressed.headers.get('location') || (await compressed.json()).output.url;
        if (new URL(location).hostname !== 'api.tinify.com') throw new Error('Unexpected Tinify output host');
        const result = await request(location, { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ convert: { type: 'image/webp' } }) });
        if (!result.ok) throw new Error(`Tinify conversion HTTP ${result.status} for ${entry.source}`);
        output = Buffer.from(await result.arrayBuffer());
        if (output.subarray(0, 4).toString() !== 'RIFF' || output.subarray(8, 12).toString() !== 'WEBP') throw new Error(`Tinify returned non-WebP: ${entry.source}`);
        // Avoid silently flattening an animated WebP or APNG.
        const animatedWebp = input.subarray(8, 12).toString() === 'WEBP' && input.includes(Buffer.from('ANIM'));
        const animatedPng = input.subarray(1, 4).toString() === 'PNG' && input.includes(Buffer.from('acTL'));
        if ((animatedWebp || animatedPng) && !output.includes(Buffer.from('ANIM'))) throw new Error(`Animation preservation requires attention: ${entry.source}`);
        await fs.writeFile(outputFile, output);
      }
    }
    const outputHash = hash(output);
    const ext = converted ? '.webp' : extension;
    const sourceKey = entry.keyPrefix ? '/' + entry.keyPrefix + decodeURIComponent(path.basename(new URL(entry.remote).pathname)) : entry.remote ? new URL(entry.remote).pathname : entry.source;
    const stem = sourceKey.slice(1).replace(/\.[^.\/]+$/, '').replace(/\.[a-f0-9]{16,64}$/, '');
    const key = `${stem}.${outputHash.slice(0, 16)}${ext}`;
    const contentType = mime[ext];
    if (!contentType) throw new Error(`Unknown Content-Type: ${ext}`);
    const upload = await s3('PUT', key, output, { 'content-type': contentType, 'cache-control': 'public, max-age=31536000, immutable' });
    if (!upload.ok) throw new Error(`R2 upload HTTP ${upload.status} for ${entry.source}`);
    const url = base + '/' + key.split('/').map(encode).join('/');
    const check = await request(url, { headers: { Origin: 'https://yapil.art' } });
    if (!check.ok || check.headers.get('content-type')?.split(';')[0] !== contentType) throw new Error(`Public URL status/type mismatch: ${entry.source}`);
    const actual = Buffer.from(await check.arrayBuffer());
    if (hash(actual) !== outputHash) throw new Error(`Public bytes mismatch: ${entry.source}`);
    if (['.pdf', '.woff', '.woff2', '.ttf', '.otf'].includes(ext) && !['*', 'https://yapil.art'].includes(check.headers.get('access-control-allow-origin'))) throw new Error(`Missing CORS for ${entry.source}`);
    manifest.assets[entry.source] = { url, sourceHash, sha256: outputHash, inputBytes: input.length, bytes: output.length, contentType, processing: converted ? 'tinify-webp' : 'original', verifiedAt: new Date().toISOString() };
    persist = persist.then(() => fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n'));
    await persist;
    completed++;
    console.log(`Verified ${Object.keys(manifest.assets).length}/${entries.length}: ${entry.source} (${input.length} → ${output.length})`);
  }
  async function worker() {
    while (!failure && cursor < entries.length && completed < limit) {
      const entry = entries[cursor++];
      try { await migrate(entry); } catch (error) { failure = error; }
    }
  }
  await Promise.all(Array.from({ length: limitArg ? 1 : 16 }, worker));
  if (failure) throw failure;
  console.log(`Done: ${completed} files processed; ${Object.keys(manifest.assets).length} verified manifest entries.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
