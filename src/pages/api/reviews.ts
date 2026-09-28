export const prerender = false;

import type { APIRoute } from 'astro';
import type { ClientReview } from '../../lib/reviewTypes';
import { getDb } from '../../lib/cloudflareEnv';

function parseJsonSafe(val: unknown, fallback: any) {
  if (typeof val !== 'string') return val || fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function rowToReview(row: Record<string, unknown>): ClientReview {
  return {
    id: String(row.id),
    author: String(row.author || ''),
    role: String(row.role || ''),
    company: String(row.company || ''),
    websiteUrl: row.website_url ? String(row.website_url) : undefined,
    contact: row.contact ? String(row.contact) : undefined,
    avatar: row.avatar ? String(row.avatar) : undefined,
    rating: Number(row.rating || 5),
    services: parseJsonSafe(row.services, []),
    quote: String(row.quote || ''),
    formatMode: (row.format_mode as ClientReview['formatMode']) || 'freeform',
    likedMost: row.liked_most ? String(row.liked_most) : undefined,
    likedSpecial: row.liked_special ? String(row.liked_special) : undefined,
    toImprove: row.to_improve ? String(row.to_improve) : undefined,
    businessResults: row.business_results ? String(row.business_results) : undefined,
    fullReviewText: row.full_review_text ? String(row.full_review_text) : undefined,
    allowPublish: Boolean(row.allow_publish),
    status: (row.status as ClientReview['status']) || 'published',
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
    pageUrl: row.page_url ? String(row.page_url) : 'https://yapil.art/review',
  };
}

export const GET: APIRoute = async ({ url }) => {
  const db = getDb();
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding DB is not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const statusParam = url.searchParams.get('status');
    let query = 'SELECT * FROM reviews ORDER BY created_at DESC';
    let params: any[] = [];

    if (statusParam && statusParam !== 'all') {
      query = 'SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC';
      params = [statusParam];
    }

    const { results } = await db.prepare(query).bind(...params).all();
    const reviews = (results || []).map((row: any) => rowToReview(row));

    return new Response(JSON.stringify(reviews), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to fetch reviews' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const db = getDb();
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding DB is not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const review: ClientReview = await request.json();
    const now = new Date().toISOString();
    await db.prepare(`
      INSERT OR REPLACE INTO reviews (
        id, author, role, company, website_url, contact, avatar, rating,
        services, quote, format_mode, liked_most, liked_special, to_improve,
        business_results, full_review_text, allow_publish, status,
        created_at, updated_at, page_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      review.id,
      review.author,
      review.role,
      review.company || '',
      review.websiteUrl || null,
      review.contact || null,
      review.avatar || null,
      review.rating || 5,
      JSON.stringify(review.services || []),
      review.quote,
      review.formatMode || 'freeform',
      review.likedMost || null,
      review.likedSpecial || null,
      review.toImprove || null,
      review.businessResults || null,
      review.fullReviewText || null,
      review.allowPublish ? 1 : 0,
      review.status || 'published',
      review.createdAt || now,
      now,
      review.pageUrl || 'https://yapil.art/review'
    ).run();

    return new Response(JSON.stringify({ success: true, id: review.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to save review' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PATCH: APIRoute = async ({ request, url }) => {
  const db = getDb();
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding DB is not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const id = url.searchParams.get('id');
    const updates = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing review id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existingRow = await db.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first();
    if (!existingRow) {
      return new Response(JSON.stringify({ error: 'Review not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString();
    const existing = rowToReview(existingRow as any);
    const merged: ClientReview = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    await db.prepare(`
      UPDATE reviews SET
        author = ?, role = ?, company = ?, website_url = ?, contact = ?,
        avatar = ?, rating = ?, services = ?, quote = ?, format_mode = ?,
        liked_most = ?, liked_special = ?, to_improve = ?, business_results = ?,
        full_review_text = ?, allow_publish = ?, status = ?, updated_at = ?, page_url = ?
      WHERE id = ?
    `).bind(
      merged.author,
      merged.role,
      merged.company,
      merged.websiteUrl || null,
      merged.contact || null,
      merged.avatar || null,
      merged.rating,
      JSON.stringify(merged.services || []),
      merged.quote,
      merged.formatMode,
      merged.likedMost || null,
      merged.likedSpecial || null,
      merged.toImprove || null,
      merged.businessResults || null,
      merged.fullReviewText || null,
      merged.allowPublish ? 1 : 0,
      merged.status,
      now,
      merged.pageUrl,
      id
    ).run();

    return new Response(JSON.stringify({ success: true, review: merged }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to update review' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  const db = getDb();
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding DB is not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing review id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to delete review' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
