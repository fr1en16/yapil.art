#!/usr/bin/env node
// One-off migration: src/content/cases/*.md + src/data/vsyachina-gallery.json -> Sanity.
// Usage: node scripts/migrate-to-sanity.mjs
//
// Idempotent: uses deterministic _id per document (case-<slug>, vsyachina-<filename stem>),
// so re-running safely upserts (createOrReplace) rather than duplicating.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';

process.loadEnvFile?.(new URL('../.env.local', import.meta.url));

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET / SANITY_API_TOKEN in env.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  token,
  useCdn: false,
});

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const casesDir = path.join(rootDir, 'src/content/cases');
const galleryPath = path.join(rootDir, 'src/data/vsyachina-gallery.json');

function slugify(fileName) {
  return fileName.replace(/\.md$/, '');
}

// Sanity array-of-object fields need a unique `_key` per item so Studio can
// address/reorder them — plain arrays from source data don't have one.
function withKeys(items) {
  return (items ?? []).map((item, index) => ({ _key: `k${index}`, ...item }));
}

async function migrateCases() {
  const files = readdirSync(casesDir).filter((f) => f.endsWith('.md'));
  console.log(`Найдено кейсов: ${files.length}`);

  const mutations = files.map((file) => {
    const raw = readFileSync(path.join(casesDir, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = slugify(file);

    const doc = {
      _id: `case-${slug}`,
      _type: 'case',
      title: data.title,
      slug: { _type: 'slug', current: slug },
      year: String(data.year),
      summary: data.summary,
      services: data.services ?? [],
      cover: data.cover,
      order: data.order,
      featured: Boolean(data.featured),
      reviewed: Boolean(data.reviewed),
      body: content.trim(),
    };

    if (data.task) doc.task = data.task;
    if (data.goal) doc.goal = data.goal;
    if (data.link) doc.link = data.link;

    return doc;
  });

  const tx = client.transaction();
  for (const doc of mutations) tx.createOrReplace(doc);
  await tx.commit();
  console.log(`Загружено кейсов в Sanity: ${mutations.length}`);
}

async function migrateVsyachina() {
  const items = JSON.parse(readFileSync(galleryPath, 'utf8'));
  console.log(`Найдено элементов «Всячина»: ${items.length}`);

  const tx = client.transaction();
  items.forEach((item, index) => {
    const stem = item.name.replace(/\.[^.]+$/, '');
    tx.createOrReplace({
      _id: `vsyachina-${stem}`,
      _type: 'vsyachinaItem',
      fileName: item.name,
      title: item.title,
      alt: item.alt,
      url: item.url,
      width: item.width,
      height: item.height,
      isVideo: Boolean(item.isVideo),
      order: index,
    });
  });
  await tx.commit();
  console.log(`Загружено элементов «Всячина» в Sanity: ${items.length}`);
}

async function migrateHomepage() {
  const doc = {
    _id: 'homepage',
    _type: 'homepage',
    hero: {
      title: 'Дизайн, который<br />работает на бизнес',
      description:
        'Мы — дизайн-агентство Yapil. Создаём сайты и айдентику, которые выделяют компанию среди конкурентов и приносят заявки.',
      ctaText: 'Связаться',
    },
    aboutCards: withKeys([
      {
        title: '8 лет<br />в дизайне',
        text: 'Ведём проекты в инфобизнесе и в корпоративном секторе. Лендинг для трейдера и полиграфия для сети стрит-фуда требуют разного, мы умеем и то, и другое.',
        icon: 'award',
      },
      {
        title: 'Полный<br />цикл',
        text: 'Один проект ведёт один дизайнер: от первой концепции до финальной правки в типографии. Ничего не отдаём на аутсорс.',
        icon: 'refresh-cw',
      },
      {
        title: 'Опыт<br />агентства',
        text: 'Яков был ключевым дизайнером в thePeak, которое делало визуал для LUKOIL, Cadillac и PUMA, Gippo. Оттуда — процессы, по которым мы держим сроки на больших проектах.',
        icon: 'briefcase',
      },
      {
        title: 'Три направления<br />в одних руках',
        text: 'Бренд, сайт и печать делает одна команда, поэтому логотип не разъезжается с сайтом, а сайт — с буклетом.',
        icon: 'shapes',
      },
    ]),
    founderBio:
      'Яков Пилипюк — дизайнер с восьмилетним опытом, который лежит в основе подхода Yapil. Мы уделяем внимание деталям и смыслу, объединяем сайты, айдентику и печатные материалы в единый визуальный язык и доводим проекты от первой идеи до запуска.',
  };

  await client.createOrReplace(doc);
  console.log('Загружена главная страница в Sanity.');
}

async function migrateServices() {
  const { servicesData } = await import('../src/data/servicesData.ts');
  const entries = Object.values(servicesData);
  console.log(`Найдено услуг: ${entries.length}`);

  const tx = client.transaction();
  entries.forEach((service, index) => {
    tx.createOrReplace({
      _id: `service-${service.slug}`,
      _type: 'service',
      slug: { _type: 'slug', current: service.slug },
      order: index,
      number: service.number,
      name: service.name,
      tag: service.tag,
      heroH1: service.heroH1,
      heroLead: service.heroLead,
      metrics: withKeys(service.metrics),
      formatsTitle: service.formatsTitle,
      formats: withKeys(service.formats),
      deliverablesTitle: service.deliverablesTitle,
      deliverables: withKeys(service.deliverables),
      processTitle: service.processTitle,
      steps: withKeys(service.steps),
      casesTitle: service.casesTitle,
      caseSlugs: service.caseSlugs,
      faqTitle: service.faqTitle,
      faq: withKeys(service.faq),
      ctaTitle: service.ctaTitle,
      ctaLead: service.ctaLead,
      crossLinksTitle: service.crossLinksTitle,
      crossLinks: withKeys(service.crossLinks),
      seo: service.seo,
    });
  });
  await tx.commit();
  console.log(`Загружено услуг в Sanity: ${entries.length}`);
}

async function migrateSolutions() {
  const { solutionsData } = await import('../src/data/solutionsData.ts');
  const entries = Object.values(solutionsData);
  console.log(`Найдено решений: ${entries.length}`);

  const tx = client.transaction();
  entries.forEach((solution, index) => {
    tx.createOrReplace({
      _id: `solution-${solution.slug}`,
      _type: 'solution',
      slug: { _type: 'slug', current: solution.slug },
      order: index,
      number: solution.number,
      name: solution.name,
      tag: solution.tag,
      heroH1: solution.heroH1,
      heroLead: solution.heroLead,
      metrics: withKeys(solution.metrics),
      challengesTitle: solution.challengesTitle,
      challenges: withKeys(solution.challenges),
      deliverablesTitle: solution.deliverablesTitle,
      deliverables: withKeys(solution.deliverables),
      casesTitle: solution.casesTitle,
      caseSlugs: solution.caseSlugs,
      faqTitle: solution.faqTitle,
      faq: withKeys(solution.faq),
      ctaTitle: solution.ctaTitle,
      ctaLead: solution.ctaLead,
      seo: solution.seo,
    });
  });
  await tx.commit();
  console.log(`Загружено решений в Sanity: ${entries.length}`);
}

async function migrateSiteSettings() {
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    contactEmail: 'hi@yapil.art',
    contactPhone: '+77067436197',
    whatsappPhone: '77067436197',
    telegramUsername: 'yakov_pil',
    logoUrl: 'https://media.yapil.art/apple-touch-icon.f863e8a7cc523f9f.webp',
    defaultOgImage: 'https://media.yapil.art/social-cover.9512ed9be1051235.webp',
  });
  console.log('Загружены настройки сайта в Sanity.');
}

await migrateCases();
await migrateVsyachina();
await migrateHomepage();
await migrateServices();
await migrateSolutions();
await migrateSiteSettings();
console.log('Готово.');
