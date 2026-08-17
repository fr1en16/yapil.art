import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceRoot = resolve(process.argv[2] ?? '../yapil');
const readJson = async (path) => JSON.parse(await readFile(resolve(sourceRoot, path), 'utf8'));

const catalog = await readJson('src/data/media-catalog.json');
const content = await readJson('src/data/pinterest-content.json');
const storage = await readJson('src/data/media-storage.json');
const contentByFile = new Map(content.map((item) => [item.file, item]));
const nativeVideoDimensions = new Map([
  ['iroh1.mp4', { width: 720, height: 900 }],
  ['lukoil1.mp4', { width: 1080, height: 1080 }],
  ['ONmacabim6.mp4', { width: 1080, height: 1080 }],
  ['RVgold1.mp4', { width: 1280, height: 1080 }],
  ['RVgold2.mp4', { width: 1280, height: 1080 }],
]);

const gallery = catalog.map((item) => {
  const copy = contentByFile.get(item.name);
  const media = storage[`/media/${item.name}`];
  const nativeDimensions = nativeVideoDimensions.get(item.name);

  if (!copy || !media) throw new Error(`Missing gallery data for ${item.name}`);

  return {
    name: item.name,
    width: nativeDimensions?.width ?? item.width,
    height: nativeDimensions?.height ?? item.height,
    isVideo: Boolean(item.isVideo),
    url: media.url,
    alt: copy.alt,
    title: copy.title,
  };
});

const outputPath = resolve('src/data/vsyachina-gallery.json');
await mkdir(resolve('src/data'), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(gallery, null, 2)}\n`,
  'utf8',
);
