import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const cases = await getCollection('cases');
const pages = Object.fromEntries(cases.map(({ id, data }) => [id, data]));

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: `${page.year} · ${page.summary}`,
    bgGradient: [
      [29, 29, 29],
      [163, 42, 23],
    ],
    border: {
      color: [253, 75, 50],
      width: 18,
      side: 'inline-start',
    },
    fonts: ['./public/fonts/InterTight-Variable.ttf'],
    font: {
      title: {
        families: ['Inter Tight'],
        weight: 'Bold',
        size: 76,
      },
      description: {
        families: ['Inter Tight'],
        size: 34,
        color: [247, 200, 191],
      },
    },
  }),
});
