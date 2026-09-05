import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createHash } from 'node:crypto';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT_ROOT = join(ROOT, 'content-drafts/seo');
const PUBLIC_ROOT = join(ROOT, 'public');
const serviceSlugs = ['websites', 'identity', 'print', 'presentations', 'smm', 'support'];
const mediaManifest = JSON.parse(await readFile(join(ROOT, 'media-manifest.json'), 'utf8')).assets;
const errors = [];
const seenSlugs = new Set();
const seenAlts = new Set();
let trendCount = 0;
let totalCount = 0;
let publishedCoreCount = 0;

const field = (source, name) => {
  const match = source.match(new RegExp(`^${name}: (.+)$`, 'm'));
  return match ? JSON.parse(match[1]) : undefined;
};

for (const serviceSlug of serviceSlugs) {
  const dir = join(CONTENT_ROOT, serviceSlug);
  const files = (await readdir(dir)).filter((file) => file.endsWith('.md'));
  const trendFiles = files.filter((file) => file.startsWith('trend-'));
  if (trendFiles.length !== 100) errors.push(`${serviceSlug}: expected 100 trend drafts, found ${trendFiles.length}`);

  for (const file of files) {
    totalCount += 1;
    if (file.startsWith('trend-')) trendCount += 1;
    const slug = file.replace(/\.md$/, '');
    const source = await readFile(join(dir, file), 'utf8');
    const title = field(source, 'title');
    const description = field(source, 'description');
    const h1 = field(source, 'h1');
    const cover = field(source, 'cover');
    const coverAlt = field(source, 'coverAlt');
    const status = field(source, 'status');

    if (seenSlugs.has(slug)) errors.push(`${file}: duplicate slug`);
    seenSlugs.add(slug);
    if (!title || title.length > 65) errors.push(`${file}: invalid title length`);
    if (!description || description.length < 120 || description.length > 160) errors.push(`${file}: invalid description length`);
    if (!h1) errors.push(`${file}: missing h1`);
    if (!cover || !coverAlt) errors.push(`${file}: missing cover metadata`);
    if (file.startsWith('trend-') && status !== 'draft') errors.push(`${file}: generated article must remain draft until editorial review`);
    if (!file.startsWith('trend-') && status === 'published') publishedCoreCount += 1;
    if (file.startsWith('trend-') && source.length < 5000) errors.push(`${file}: generated draft is too short`);
    if (file.startsWith('trend-') && seenAlts.has(coverAlt)) errors.push(`${file}: duplicate generated alt text`);
    seenAlts.add(coverAlt);

    if (cover) {
      const migrated = Object.values(mediaManifest).find(asset => asset.url === cover);
      const coverPath = migrated
        ? join(ROOT, '.cache/media-migration', `${migrated.sourceHash}.webp`)
        : join(PUBLIC_ROOT, cover.replace(/^\//, ''));
      if (cover.startsWith('http') && !migrated?.verifiedAt) errors.push(`${file}: remote cover has not been verified`);
      try {
        const bytes = await readFile(coverPath).catch(async (error) => {
          if (!migrated || error.code !== 'ENOENT') throw error;
          const response = await fetch(cover);
          if (!response.ok) throw new Error(`Cover HTTP ${response.status}`);
          return Buffer.from(await response.arrayBuffer());
        });
        if (migrated && createHash('sha256').update(bytes).digest('hex') !== migrated.sha256) errors.push(`${file}: migrated cover checksum mismatch`);
        const metadata = await sharp(bytes).metadata();
        if (metadata.width !== 1600 || metadata.height !== 840 || metadata.format !== 'webp') {
          errors.push(`${file}: cover must be 1600×840 WebP`);
        }
      } catch {
        errors.push(`${file}: cover file not found`);
      }
    }
  }
}

if (trendCount !== 600) errors.push(`expected 600 generated drafts, found ${trendCount}`);
if (totalCount !== 624) errors.push(`expected 624 total articles, found ${totalCount}`);
if (publishedCoreCount !== 24) errors.push(`expected 24 curated published articles, found ${publishedCoreCount}`);

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`SEO library verified: ${publishedCoreCount} published articles, ${trendCount} generated drafts, all covers and metadata valid.`);
