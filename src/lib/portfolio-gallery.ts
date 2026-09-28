import { getCollection } from 'astro:content';
import gallerySource from '../data/vsyachina-gallery.json';
import { readPortfolioMeta } from './portfolio-meta';

export interface GalleryItem {
  name: string;
  width: number;
  height: number;
  isVideo: boolean;
  url: string;
  alt: string;
  title: string;
  /** Свои теги фото. Если не заданы — берутся теги кейса (или проекта, если кейса нет). */
  tags?: string[];
}

export interface PortfolioWork extends GalleryItem {
  group: string;
  label: string;
  caseSlug?: string;
  order: number;
  /** Итоговые теги: свои или унаследованные. */
  tags: string[];
  sector?: string;
  ownTags: boolean;
  anchor: string;
}

export const galleryItems = gallerySource as GalleryItem[];

export function galleryGroup(name: string): string {
  const stem = name.replace(/\.[^.]+$/, '');
  const prefix = stem.match(/^(.+?)-?\d+$/)?.[1] ?? stem;
  return prefix === '2gippo' ? 'gippo' : prefix;
}

export async function getCaseTagsMap(): Promise<Record<string, string[]>> {
  const cases = await getCollection('cases');
  return Object.fromEntries(cases.map((entry) => [entry.id.replace(/\.md$/, ''), entry.data.tags]));
}

/** Опубликованные макеты галереи с итоговыми тегами. */
export async function getPortfolioWorks(): Promise<PortfolioWork[]> {
  const [meta, caseTags] = await Promise.all([readPortfolioMeta(), getCaseTagsMap()]);
  const works: PortfolioWork[] = [];
  galleryItems.forEach((item, index) => {
    const group = galleryGroup(item.name);
    const groupMeta = meta[group];
    if (!groupMeta?.published) return;
    const caseSlug = groupMeta.caseSlug && caseTags[groupMeta.caseSlug] ? groupMeta.caseSlug : undefined;
    const ownTags = Boolean(item.tags?.length);
    works.push({
      ...item,
      group,
      label: groupMeta.label,
      caseSlug,
      order: groupMeta.order * 100 + index,
      tags: ownTags ? item.tags! : (caseSlug ? caseTags[caseSlug] : groupMeta.tags),
      sector: groupMeta.sector,
      ownTags,
      anchor: `work-${item.name.replace(/\.[^.]+$/, '')}`,
    });
  });
  return works;
}

export async function getCaseWorks(slug: string): Promise<PortfolioWork[]> {
  return (await getPortfolioWorks()).filter((work) => work.caseSlug === slug).sort((a, b) => a.order - b.order);
}
