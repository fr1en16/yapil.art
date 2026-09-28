export const prerender = false;

import type { APIRoute } from 'astro';
import type { Lead } from '../../lib/crmTypes';
import { getDb } from '../../lib/cloudflareEnv';

function parseJsonSafe(val: unknown, fallback: any) {
  if (typeof val !== 'string') return val || fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function rowToLead(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    phone: String(row.phone || ''),
    rawPhone: String(row.raw_phone || row.rawPhone || ''),
    email: row.email ? String(row.email) : undefined,
    services: parseJsonSafe(row.services, []),
    message: row.message ? String(row.message) : undefined,
    status: (row.status as Lead['status']) || 'new',
    priority: (row.priority as Lead['priority']) || 'normal',
    budget: row.budget ? String(row.budget) : undefined,
    source: (row.source as Lead['source']) || 'contacts_form',
    sourceDetails: row.source_details ? String(row.source_details) : undefined,
    pageUrl: String(row.page_url || row.pageUrl || 'https://yapil.art'),
    referrer: row.referrer ? String(row.referrer) : undefined,
    utm: parseJsonSafe(row.utm, undefined),
    notes: parseJsonSafe(row.notes, []),
    activities: parseJsonSafe(row.activities, []),
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
    updatedAt: String(row.updated_at || row.updatedAt || new Date().toISOString()),
  };
}

export const GET: APIRoute = async () => {
  const db = getDb();
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database binding DB is not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { results } = await db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    const leads = (results || []).map((row: any) => rowToLead(row));
    return new Response(JSON.stringify(leads), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to fetch leads' }), {
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
    const lead: Lead = await request.json();
    const now = new Date().toISOString();
    await db.prepare(`
      INSERT OR REPLACE INTO leads (
        id, name, phone, raw_phone, email, services, message, status,
        priority, budget, source, source_details, page_url, referrer,
        utm, notes, activities, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      lead.id,
      lead.name,
      lead.phone,
      lead.rawPhone || lead.phone,
      lead.email || null,
      JSON.stringify(lead.services || []),
      lead.message || null,
      lead.status || 'new',
      lead.priority || 'normal',
      lead.budget || null,
      lead.source || 'contacts_form',
      lead.sourceDetails || null,
      lead.pageUrl || 'https://yapil.art',
      lead.referrer || null,
      JSON.stringify(lead.utm || {}),
      JSON.stringify(lead.notes || []),
      JSON.stringify(lead.activities || []),
      lead.createdAt || now,
      now
    ).run();

    return new Response(JSON.stringify({ success: true, id: lead.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to save lead' }), {
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
      return new Response(JSON.stringify({ error: 'Missing lead id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existingRow = await db.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first();
    if (!existingRow) {
      return new Response(JSON.stringify({ error: 'Lead not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString();
    const existing = rowToLead(existingRow as any);
    const merged: Lead = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    await db.prepare(`
      UPDATE leads SET
        name = ?, phone = ?, raw_phone = ?, email = ?, services = ?,
        message = ?, status = ?, priority = ?, budget = ?, source = ?,
        source_details = ?, page_url = ?, referrer = ?, utm = ?,
        notes = ?, activities = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      merged.name,
      merged.phone,
      merged.rawPhone || merged.phone,
      merged.email || null,
      JSON.stringify(merged.services || []),
      merged.message || null,
      merged.status,
      merged.priority,
      merged.budget || null,
      merged.source,
      merged.sourceDetails || null,
      merged.pageUrl,
      merged.referrer || null,
      JSON.stringify(merged.utm || {}),
      JSON.stringify(merged.notes || []),
      JSON.stringify(merged.activities || []),
      now,
      id
    ).run();

    return new Response(JSON.stringify({ success: true, lead: merged }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to update lead' }), {
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
      return new Response(JSON.stringify({ error: 'Missing lead id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to delete lead' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
