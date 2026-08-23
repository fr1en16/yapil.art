import type {
  Lead,
  LeadStatus,
  LeadPriority,
  LeadSource,
  CreateLeadPayload,
  CrmSettings,
  CrmStats,
  LeadNote,
  LeadActivity,
} from './crmTypes';

const STORAGE_KEY_LEADS = 'yapil_crm_leads_v1';
const STORAGE_KEY_SETTINGS = 'yapil_crm_settings_v1';
const STORAGE_KEY_AUTH = 'yapil_admin_session_v1';
const BROADCAST_CHANNEL_NAME = 'yapil_crm_channel';

const DEFAULT_SETTINGS: CrmSettings = {
  telegramBotToken: '',
  telegramChatId: '',
  telegramEnabled: false,
  customWebhookUrl: '',
  customWebhookEnabled: false,
  soundAlerts: true,
  desktopNotifications: false,
  currency: '₸',
};

// Supabase environment variables
const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SUPABASE_URL) || '';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export interface AdminSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
  };
}

// Auth State Management
export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveAdminSession(session: AdminSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('yapil_admin_auth_changed', { detail: session }));
  } catch (err) {
    console.error('Failed to save admin session:', err);
  }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_AUTH);
  window.dispatchEvent(new CustomEvent('yapil_admin_auth_changed', { detail: null }));
}

// Sign in with Supabase Auth (Email + Password)
export async function signInAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    // Local fallback PIN/Password if Supabase is not configured
    if (password === 'yapil2026' || password === 'admin') {
      const mockSession: AdminSession = {
        accessToken: 'local-token',
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
        user: { id: 'local-admin', email: email || 'admin@yapil.art' },
      };
      saveAdminSession(mockSession);
      return { success: true };
    }
    return { success: false, error: 'Неверный пароль администратора' };
  }

  try {
    const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim(),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data.error_description || data.msg || data.message || 'Ошибка входа. Проверьте Email и пароль.';
      return { success: false, error: msg };
    }

    const session: AdminSession = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };

    saveAdminSession(session);
    return { success: true };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Сетевая ошибка при авторизации';
    return { success: false, error: errMsg };
  }
}

// Demo / legacy mock lead IDs for filtering
const DEMO_LEAD_IDS = new Set(['YP-8491', 'YP-8488', 'YP-8472', 'YP-8450', 'YP-8410']);

// Demo leads for initializing or previewing the CRM (empty by default for production)
export const DEMO_LEADS: Lead[] = [];

// BroadcastChannel instance (browser only)
let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!broadcastChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch {
      broadcastChannel = null;
    }
  }
  return broadcastChannel;
}

// Subtle Swiss audio chime on new incoming lead
export function playLeadChime() {
  if (typeof window === 'undefined') return;
  const settings = getCrmSettings();
  if (!settings.soundAlerts) return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.08);
    gain2.gain.setValueAtTime(0.15, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch {
    // ignore
  }
}

// Normalize phone to clean digits (e.g. 77015551284)
export function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('8') && digits.length === 11) {
    return '7' + digits.slice(1);
  }
  if (digits.length === 10) {
    return '7' + digits;
  }
  return digits;
}

// Generate human-friendly ID like YP-8492
export function generateLeadId(): string {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `YP-${randNum}`;
}

// Read UTM parameters from current URL
export function getUtmParams(): Lead['utm'] {
  if (typeof window === 'undefined') return undefined;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('utm_source') || undefined;
    const medium = urlParams.get('utm_medium') || undefined;
    const campaign = urlParams.get('utm_campaign') || undefined;
    const term = urlParams.get('utm_term') || undefined;
    const content = urlParams.get('utm_content') || undefined;

    if (source || medium || campaign || term || content) {
      return { source, medium, campaign, term, content };
    }
  } catch {
    // ignore
  }
  return undefined;
}

// Settings management
export function getCrmSettings(): CrmSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveCrmSettings(settings: Partial<CrmSettings>): CrmSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const current = getCrmSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    const channel = getBroadcastChannel();
    if (channel) {
      channel.postMessage({ type: 'settings_updated', settings: updated });
    }
  } catch (err) {
    console.error('Failed to save CRM settings:', err);
  }
  return updated;
}

// Map Lead to Supabase Table Row format
function leadToSupabaseRow(lead: Lead) {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    raw_phone: lead.rawPhone,
    email: lead.email || null,
    services: lead.services,
    message: lead.message || null,
    status: lead.status,
    priority: lead.priority,
    budget: lead.budget || null,
    source: lead.source,
    source_details: lead.sourceDetails || null,
    page_url: lead.pageUrl,
    referrer: lead.referrer || null,
    utm: lead.utm || {},
    notes: lead.notes || [],
    activities: lead.activities || [],
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  };
}

// Map Supabase Table Row to Lead
function supabaseRowToLead(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    phone: String(row.phone || ''),
    rawPhone: String(row.raw_phone || row.rawPhone || ''),
    email: row.email ? String(row.email) : undefined,
    services: Array.isArray(row.services) ? (row.services as string[]) : [],
    message: row.message ? String(row.message) : undefined,
    status: (row.status as LeadStatus) || 'new',
    priority: (row.priority as LeadPriority) || 'normal',
    budget: row.budget ? String(row.budget) : undefined,
    source: (row.source as LeadSource) || 'contacts_form',
    sourceDetails: row.source_details ? String(row.source_details) : undefined,
    pageUrl: String(row.page_url || row.pageUrl || 'https://yapil.art'),
    referrer: row.referrer ? String(row.referrer) : undefined,
    utm: (row.utm as Lead['utm']) || undefined,
    notes: Array.isArray(row.notes) ? (row.notes as LeadNote[]) : [],
    activities: Array.isArray(row.activities) ? (row.activities as LeadActivity[]) : [],
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
    updatedAt: String(row.updated_at || row.updatedAt || new Date().toISOString()),
  };
}

// Get Auth Headers for Admin actions
function getAuthHeaders(): HeadersInit {
  const session = getAdminSession();
  const token = session?.accessToken || SUPABASE_ANON_KEY;
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };
}

// Sync with Supabase in background
export async function syncLeadsFromSupabase(): Promise<Lead[] | null> {
  if (!isSupabaseConfigured || typeof window === 'undefined') return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows)) {
        const cloudLeads = rows.map(supabaseRowToLead);
        saveLeadsLocally(cloudLeads);
        return cloudLeads;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch error:', err);
  }
  return null;
}

function saveLeadsLocally(leads: Lead[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
    window.dispatchEvent(new CustomEvent('yapil_crm_leads_changed', { detail: leads }));
    const channel = getBroadcastChannel();
    if (channel) {
      channel.postMessage({ type: 'leads_updated', leads });
    }
  } catch (err) {
    console.error('Failed to save CRM leads locally:', err);
  }
}

// Leads Management
export function getLeads(): Lead[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Automatically purge legacy demo leads
    const realLeads = parsed.filter((lead: Lead) => !DEMO_LEAD_IDS.has(lead.id));
    if (realLeads.length !== parsed.length) {
      saveLeadsLocally(realLeads);
    }
    return realLeads;
  } catch {
    return [];
  }
}

export function saveLeads(leads: Lead[]): void {
  saveLeadsLocally(leads);
}

// Dispatch Telegram Notification
export async function sendTelegramNotification(lead: Lead, settings: CrmSettings): Promise<boolean> {
  if (!settings.telegramEnabled || !settings.telegramBotToken || !settings.telegramChatId) {
    return false;
  }

  const servicesText = lead.services.length > 0 ? lead.services.join(', ') : 'Не указано';
  const text = `🔥 *Новая заявка на сайте Yapil!* (${lead.id})
👤 *Клиент:* ${lead.name}
📞 *Телефон:* ${lead.phone}
💼 *Услуги:* ${servicesText}
💬 *Сообщение:* ${lead.message || '—'}
📍 *Источник:* ${lead.sourceDetails || lead.source}
🔗 *Страница:* ${lead.pageUrl}
🕒 *Время:* ${new Date(lead.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`;

  try {
    const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: settings.telegramChatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Telegram notification failed:', err);
    return false;
  }
}

// Dispatch Custom Webhook
export async function sendCustomWebhook(lead: Lead, settings: CrmSettings): Promise<boolean> {
  if (!settings.customWebhookEnabled || !settings.customWebhookUrl) {
    return false;
  }

  try {
    const res = await fetch(settings.customWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'new_lead',
        timestamp: new Date().toISOString(),
        lead,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Custom webhook failed:', err);
    return false;
  }
}

// Central Entry Point for Form Submissions (Public Anonymous insertion)
export async function submitLead(payload: CreateLeadPayload): Promise<Lead> {
  const currentLeads = getLeads();
  const rawPhone = normalizePhoneDigits(payload.phone);
  const now = new Date().toISOString();
  const leadId = generateLeadId();

  const newLead: Lead = {
    id: leadId,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    rawPhone,
    email: payload.email?.trim(),
    services: payload.services && payload.services.length > 0 ? payload.services : ['Консультация'],
    message: payload.message?.trim(),
    status: 'new',
    priority: payload.priority || 'normal',
    budget: payload.budget,
    source: payload.source || 'contacts_form',
    sourceDetails: payload.sourceDetails || (typeof window !== 'undefined' ? window.location.pathname : 'Форма сайта'),
    pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://yapil.art',
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    utm: getUtmParams(),
    createdAt: now,
    updatedAt: now,
    notes: [],
    activities: [
      {
        id: `act-${Date.now()}`,
        type: 'created',
        description: `Заявка поступила через ${payload.sourceDetails || payload.source || 'форму'}`,
        timestamp: now,
      },
    ],
  };

  const updatedLeads = [newLead, ...currentLeads];
  saveLeads(updatedLeads);

  // Play audio chime
  playLeadChime();

  // Desktop notification if enabled
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`Новая заявка от ${newLead.name}`, {
        body: `${newLead.services.join(', ')} — ${newLead.phone}`,
        icon: '/favicon.svg',
      });
    } catch {
      // ignore
    }
  }

  // Supabase background insertion (Allowed for anon via RLS policy)
  if (isSupabaseConfigured) {
    fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(leadToSupabaseRow(newLead)),
    }).catch((err) => console.warn('Supabase lead insertion error:', err));
  }

  // Dispatch to server-side API (Telegram + Webhooks using Vercel / server env vars)
  if (typeof window !== 'undefined') {
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    }).catch((err) => console.warn('[submitLead] /api/lead request failed:', err));
  }

  // Send external notifications from client settings if configured
  const settings = getCrmSettings();
  Promise.allSettled([
    sendTelegramNotification(newLead, settings),
    sendCustomWebhook(newLead, settings),
  ]).catch(() => {
    // ignore
  });

  return newLead;
}

// Lead Updates
export function updateLead(id: string, updates: Partial<Lead>, activityDescription?: string): Lead | null {
  const currentLeads = getLeads();
  const index = currentLeads.findIndex((l) => l.id === id);
  if (index === -1) return null;

  const existing = currentLeads[index];
  const now = new Date().toISOString();

  const newActivities = [...existing.activities];
  if (activityDescription) {
    newActivities.unshift({
      id: `act-${Date.now()}`,
      type: 'status_change',
      description: activityDescription,
      timestamp: now,
    });
  }

  const updated: Lead = {
    ...existing,
    ...updates,
    updatedAt: now,
    activities: newActivities,
  };

  currentLeads[index] = updated;
  saveLeads(currentLeads);

  // Supabase sync (Uses Admin Session token)
  if (isSupabaseConfigured) {
    fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(leadToSupabaseRow(updated)),
    }).catch((err) => console.warn('Supabase patch error:', err));
  }

  return updated;
}

export function changeLeadStatus(id: string, newStatus: LeadStatus): Lead | null {
  const statusNames: Record<LeadStatus, string> = {
    new: 'Новая',
    contacted: 'В работе',
    meeting: 'Встреча / Бриф',
    proposal: 'КП отправлено',
    won: 'Сделка закрыта (Успешно)',
    lost: 'Отказ / В архиве',
  };

  return updateLead(id, { status: newStatus }, `Статус изменен на «${statusNames[newStatus]}»`);
}

export function changeLeadPriority(id: string, priority: LeadPriority): Lead | null {
  const priorityNames: Record<LeadPriority, string> = {
    normal: 'Обычный',
    high: 'Высокий',
    urgent: 'Срочный',
  };

  return updateLead(id, { priority }, `Приоритет изменен на «${priorityNames[priority]}»`);
}

export function addLeadNote(id: string, noteText: string, author: string = 'Менеджер'): Lead | null {
  const currentLeads = getLeads();
  const lead = currentLeads.find((l) => l.id === id);
  if (!lead) return null;

  const now = new Date().toISOString();
  const newNote: LeadNote = {
    id: `note-${Date.now()}`,
    text: noteText.trim(),
    createdAt: now,
    author,
  };

  const updatedNotes = [newNote, ...lead.notes];
  const updatedActivities: LeadActivity[] = [
    {
      id: `act-${Date.now()}`,
      type: 'note_added',
      description: `Добавлена заметка: "${noteText.slice(0, 45)}${noteText.length > 45 ? '...' : ''}"`,
      timestamp: now,
    },
    ...lead.activities,
  ];

  return updateLead(id, { notes: updatedNotes, activities: updatedActivities });
}

export function deleteLead(id: string): boolean {
  const currentLeads = getLeads();
  const filtered = currentLeads.filter((l) => l.id !== id);
  if (filtered.length === currentLeads.length) return false;
  saveLeads(filtered);

  if (isSupabaseConfigured) {
    fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).catch((err) => console.warn('Supabase delete error:', err));
  }

  return true;
}

export function resetToDemoLeads(): void {
  saveLeads(DEMO_LEADS);
}

export function clearAllLeads(): void {
  saveLeads([]);
}

// Analytics & Stats
export function calculateStats(leads: Lead[]): CrmStats {
  const now = new Date();
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  let newLeads = 0;
  let inProgressLeads = 0;
  let wonLeads = 0;
  let lostLeads = 0;
  let todayLeadsCount = 0;
  let totalEstimatedBudget = 0;
  const servicesBreakdown: Record<string, number> = {};
  const sourceBreakdown: Record<string, number> = {};

  leads.forEach((l) => {
    if (l.status === 'new') newLeads++;
    else if (l.status === 'contacted' || l.status === 'meeting' || l.status === 'proposal') inProgressLeads++;
    else if (l.status === 'won') wonLeads++;
    else if (l.status === 'lost') lostLeads++;

    if (isToday(l.createdAt)) todayLeadsCount++;

    if (l.budget) {
      const num = parseInt(l.budget.replace(/\D/g, ''), 10);
      if (!isNaN(num)) totalEstimatedBudget += num;
    }

    l.services.forEach((s) => {
      servicesBreakdown[s] = (servicesBreakdown[s] || 0) + 1;
    });

    const srcName = l.source === 'contacts_form' ? 'Форма контактов' : l.source === 'service_modal' ? 'Модалка услуг' : l.source === 'threads_landing' ? 'Лендинг Threads' : 'Ручное / Другое';
    sourceBreakdown[srcName] = (sourceBreakdown[srcName] || 0) + 1;
  });

  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return {
    totalLeads,
    newLeads,
    inProgressLeads,
    wonLeads,
    lostLeads,
    conversionRate,
    totalEstimatedBudget,
    servicesBreakdown,
    sourceBreakdown,
    todayLeadsCount,
  };
}

// Export to CSV
export function exportLeadsToCsv(leads: Lead[]): void {
  if (typeof window === 'undefined') return;

  const headers = ['ID', 'Имя', 'Телефон', 'Услуги', 'Статус', 'Приоритет', 'Бюджет', 'Сообщение', 'Источник', 'Дата'];
  const statusLabels: Record<LeadStatus, string> = {
    new: 'Новая',
    contacted: 'В работе',
    meeting: 'Встреча / Бриф',
    proposal: 'КП отправлено',
    won: 'Сделка закрыта',
    lost: 'Отказ',
  };

  const rows = leads.map((l) => [
    l.id,
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    `"${(l.services || []).join('; ').replace(/"/g, '""')}"`,
    `"${statusLabels[l.status] || l.status}"`,
    `"${l.priority}"`,
    `"${(l.budget || '').replace(/"/g, '""')}"`,
    `"${(l.message || '').replace(/"/g, '""')}"`,
    `"${(l.sourceDetails || l.source || '').replace(/"/g, '""')}"`,
    `"${new Date(l.createdAt).toLocaleString('ru-RU')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `yapil_leads_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export to JSON
export function exportLeadsToJson(leads: Lead[]): void {
  if (typeof window === 'undefined') return;
  const jsonContent = JSON.stringify(leads, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `yapil_leads_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
