import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import mediaUrls from '../../data/media-urls.json';

export async function getStaticPaths() {
  const cases = await getCollection('cases');
  return cases.map((c) => ({
    params: { route: `${c.id}.png` },
    props: { slug: c.id },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const target = (mediaUrls as Record<string, string>)[`/open-graph/${props.slug}.png`];
  if (target) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: target,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }
  return new Response('Not Found', { status: 404 });
};
