import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import seedMeta from '../data/portfolio-meta.json';

export interface PortfolioMeta {
  label: string;
  tags: string[];
  sector?: string;
  caseSlug?: string;
  order: number;
  published: boolean;
}

export type PortfolioMetaMap = Record<string, PortfolioMeta>;

export const portfolioMetaFile = resolve(process.cwd(), 'cms-data', 'portfolio-meta.json');

export async function readPortfolioMeta(): Promise<PortfolioMetaMap> {
  try {
    const { readFile } = await import('node:fs/promises');
    return JSON.parse(await readFile(portfolioMetaFile, 'utf8')) as PortfolioMetaMap;
  } catch {
    return structuredClone(seedMeta) as PortfolioMetaMap;
  }
}

export async function writePortfolioMeta(meta: PortfolioMetaMap): Promise<void> {
  await mkdir(dirname(portfolioMetaFile), { recursive: true });
  await writeFile(portfolioMetaFile, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
}
