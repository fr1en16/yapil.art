import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';

process.loadEnvFile('.env.local');
const client = createClient({ projectId: process.env.PUBLIC_SANITY_PROJECT_ID, dataset: process.env.PUBLIC_SANITY_DATASET, token: process.env.SANITY_API_TOKEN, apiVersion: '2025-01-01', useCdn: false });
const { data, content } = matter(await readFile('src/content/cases/thepeak.md', 'utf8'));
if (content.includes('<!-- screenshot:')) throw new Error('Screenshots must be ready before publishing');
const existing = await client.fetch('*[_type == "case" && slug.current == "thepeak"]{_id}');
if (existing.length) throw new Error('The Peak already exists; refusing to overwrite');
const document = { ...data, _id: 'case-thepeak', _type: 'case', slug: { _type: 'slug', current: 'thepeak' }, body: content.trim() };
await client.create(document);
const check = await client.getDocument('case-thepeak');
if (check?.body !== document.body || check?.cover !== '') throw new Error('Published content verification failed');
console.log('Verified Sanity case-thepeak, empty cover, screenshot content saved.');
