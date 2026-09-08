import { createClient } from '@sanity/client';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'j2cx2dtx';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  useCdn: true,
});

export interface SanityCase {
  slug: string;
  title: string;
  year: string;
  summary: string;
  services: string[];
  cover: string;
  order: number;
  featured: boolean;
  task?: string;
  goal?: string;
  link?: string;
  reviewed: boolean;
  body?: string;
}

export interface SanityVsyachinaItem {
  name: string;
  title: string;
  alt: string;
  url: string;
  width: number;
  height: number;
  isVideo: boolean;
  order: number;
}

const CASE_PROJECTION = `{
  "slug": slug.current,
  title,
  year,
  summary,
  services,
  cover,
  order,
  featured,
  task,
  goal,
  link,
  reviewed,
  body
}`;

export async function getCases(): Promise<SanityCase[]> {
  return sanityClient.fetch(`*[_type == "case"] | order(order asc) ${CASE_PROJECTION}`);
}

export async function getCaseBySlug(slug: string): Promise<SanityCase | null> {
  return sanityClient.fetch(
    `*[_type == "case" && slug.current == $slug][0] ${CASE_PROJECTION}`,
    { slug },
  );
}

export interface SanityHomepage {
  hero: { title: string; description: string; ctaText: string };
  aboutCards: { title: string; text: string; icon: string }[];
  founderBio: string;
}

export async function getHomepage(): Promise<SanityHomepage | null> {
  return sanityClient.fetch(`*[_type == "homepage"][0]{ hero, aboutCards, founderBio }`);
}

export interface ServiceMetric {
  number: string;
  label: string;
  text: string;
}

export interface ServiceFormat {
  title: string;
  subtitle: string;
  description: string;
}

export interface ServiceDeliverable {
  title: string;
  text: string;
}

export interface ServiceStep {
  number: string;
  title: string;
  text: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceCrossLink {
  slug: string;
  number: string;
  title: string;
  description: string;
}

export interface SanityService {
  slug: string;
  order: number;
  number: string;
  name: string;
  tag: string;
  heroH1: string;
  heroLead: string;
  metrics: ServiceMetric[];
  formatsTitle: string;
  formats: ServiceFormat[];
  deliverablesTitle: string;
  deliverables: ServiceDeliverable[];
  processTitle: string;
  steps: ServiceStep[];
  casesTitle: string;
  caseSlugs: string[];
  faqTitle: string;
  faq: ServiceFaq[];
  ctaTitle: string;
  ctaLead: string;
  crossLinksTitle: string;
  crossLinks: ServiceCrossLink[];
  seo: { title: string; description: string; h1: string; keywords: string[] };
}

const SERVICE_PROJECTION = `{
  "slug": slug.current,
  order,
  number,
  name,
  tag,
  heroH1,
  heroLead,
  metrics,
  formatsTitle,
  formats,
  deliverablesTitle,
  deliverables,
  processTitle,
  steps,
  casesTitle,
  caseSlugs,
  faqTitle,
  faq,
  ctaTitle,
  ctaLead,
  crossLinksTitle,
  crossLinks,
  seo
}`;

export async function getServices(): Promise<SanityService[]> {
  return sanityClient.fetch(`*[_type == "service"] | order(order asc) ${SERVICE_PROJECTION}`);
}

export async function getServiceBySlug(slug: string): Promise<SanityService | null> {
  return sanityClient.fetch(
    `*[_type == "service" && slug.current == $slug][0] ${SERVICE_PROJECTION}`,
    { slug },
  );
}

export interface SolutionChallenge {
  title: string;
  desc: string;
}

export interface SanitySolution {
  slug: string;
  order: number;
  number: string;
  name: string;
  tag: string;
  heroH1: string;
  heroLead: string;
  metrics: ServiceMetric[];
  challengesTitle: string;
  challenges: SolutionChallenge[];
  deliverablesTitle: string;
  deliverables: ServiceDeliverable[];
  casesTitle: string;
  caseSlugs: string[];
  faqTitle: string;
  faq: ServiceFaq[];
  ctaTitle: string;
  ctaLead: string;
  seo: { title: string; description: string; h1: string; keywords: string[] };
}

const SOLUTION_PROJECTION = `{
  "slug": slug.current,
  order,
  number,
  name,
  tag,
  heroH1,
  heroLead,
  metrics,
  challengesTitle,
  challenges,
  deliverablesTitle,
  deliverables,
  casesTitle,
  caseSlugs,
  faqTitle,
  faq,
  ctaTitle,
  ctaLead,
  seo
}`;

export async function getSolutions(): Promise<SanitySolution[]> {
  return sanityClient.fetch(`*[_type == "solution"] | order(order asc) ${SOLUTION_PROJECTION}`);
}

export async function getSolutionBySlug(slug: string): Promise<SanitySolution | null> {
  return sanityClient.fetch(
    `*[_type == "solution" && slug.current == $slug][0] ${SOLUTION_PROJECTION}`,
    { slug },
  );
}

export interface SanitySiteSettings {
  contactEmail: string;
  contactPhone: string;
  whatsappPhone: string;
  telegramUsername: string;
  logoUrl: string;
  defaultOgImage: string;
}

let siteSettingsPromise: Promise<SanitySiteSettings | null> | undefined;

export function getSiteSettings(): Promise<SanitySiteSettings | null> {
  // Called from Base.astro/Footer.astro/Contacts.astro on nearly every page — memoized
  // so a full static build doesn't fire hundreds of identical requests for one singleton.
  siteSettingsPromise ??= sanityClient.fetch(
    `*[_type == "siteSettings"][0]{ contactEmail, contactPhone, whatsappPhone, telegramUsername, logoUrl, defaultOgImage }`,
  );
  return siteSettingsPromise;
}

export async function getVsyachinaItems(): Promise<SanityVsyachinaItem[]> {
  return sanityClient.fetch(
    `*[_type == "vsyachinaItem"] | order(order asc) {
      "name": fileName,
      title,
      alt,
      url,
      width,
      height,
      isVideo,
      order
    }`,
  );
}
