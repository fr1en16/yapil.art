import React, { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  Send,
  Plus,
  Search,
  Filter,
  Download,
  Settings as SettingsIcon,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  BarChart3,
  List,
  Kanban,
  X,
  ExternalLink,
  Volume2,
  Copy,
  Check,
  TrendingUp,
  ArrowUpRight,
  Moon,
  Sun,
  Lock,
  LogOut,
  ShieldCheck,
  KeyRound,
  Star,
  MessageSquare,
  Link as LinkIcon,
  Share2,
  Sparkles,
} from 'lucide-react';
import type {
  Lead,
  LeadStatus,
  LeadPriority,
  LeadSource,
  CrmSettings,
  CrmStats,
} from '../../lib/crmTypes';
import {
  getLeads,
  saveLeads,
  submitLead,
  updateLead,
  changeLeadStatus,
  changeLeadPriority,
  addLeadNote,
  deleteLead,
  resetToDemoLeads,
  clearAllLeads,
  calculateStats,
  getCrmSettings,
  saveCrmSettings,
  exportLeadsToCsv,
  exportLeadsToJson,
  playLeadChime,
  normalizePhoneDigits,
  syncLeadsFromSupabase,
  isSupabaseConfigured,
  getAdminSession,
  signInAdmin,
  clearAdminSession,
  type AdminSession,
} from '../../lib/crmStore';
import type {
  ClientReview,
  ReviewStatus,
  ReviewStats,
} from '../../lib/reviewTypes';
import {
  getStoredReviews,
  saveStoredReviews,
  updateReviewStatus,
  deleteReview,
  calculateReviewStats,
  generateReviewTypeScriptSnippet,
} from '../../lib/reviewStore';

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string; badgeClass: string }
> = {
  new: {
    label: 'Новые',
    bg: 'rgba(253, 75, 50, 0.12)',
    text: '#FD4B32',
    border: 'rgba(253, 75, 50, 0.35)',
    badgeClass: 'bg-[#FD4B32]/15 text-[#FD4B32] border-[#FD4B32]/40',
  },
  contacted: {
    label: 'В работе',
    bg: 'rgba(99, 102, 241, 0.12)',
    text: '#818CF8',
    border: 'rgba(99, 102, 241, 0.35)',
    badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/40',
  },
  meeting: {
    label: 'Встреча / Бриф',
    bg: 'rgba(245, 158, 11, 0.12)',
    text: '#FBBF24',
    border: 'rgba(245, 158, 11, 0.35)',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  },
  proposal: {
    label: 'КП отправлено',
    bg: 'rgba(236, 72, 153, 0.12)',
    text: '#F472B6',
    border: 'rgba(236, 72, 153, 0.35)',
    badgeClass: 'bg-pink-500/15 text-pink-400 border-pink-500/40',
  },
  won: {
    label: 'Сделка закрыта',
    bg: 'rgba(128, 239, 201, 0.12)',
    text: '#80EFC9',
    border: 'rgba(128, 239, 201, 0.35)',
    badgeClass: 'bg-emerald-500/15 text-[#80EFC9] border-emerald-500/40',
  },
  lost: {
    label: 'Отказ / Архив',
    bg: 'rgba(156, 163, 175, 0.08)',
    text: '#9CA3AF',
    border: 'rgba(156, 163, 175, 0.25)',
    badgeClass: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  },
};

const REVIEW_STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; bg: string; text: string; border: string; badgeClass: string }
> = {
  new: {
    label: 'Новый',
    bg: 'rgba(253, 75, 50, 0.12)',
    text: '#FD4B32',
    border: 'rgba(253, 75, 50, 0.35)',
    badgeClass: 'bg-[#FD4B32]/15 text-[#FD4B32] border-[#FD4B32]/40',
  },
  reviewed: {
    label: 'Проверен',
    bg: 'rgba(99, 102, 241, 0.12)',
    text: '#818CF8',
    border: 'rgba(99, 102, 241, 0.35)',
    badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/40',
  },
  approved: {
    label: 'Одобрен',
    bg: 'rgba(245, 158, 11, 0.12)',
    text: '#FBBF24',
    border: 'rgba(245, 158, 11, 0.35)',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  },
  published: {
    label: 'Опубликован',
    bg: 'rgba(128, 239, 201, 0.12)',
    text: '#80EFC9',
    border: 'rgba(128, 239, 201, 0.35)',
    badgeClass: 'bg-emerald-500/15 text-[#80EFC9] border-emerald-500/40',
  },
  archived: {
    label: 'В архиве',
    bg: 'rgba(156, 163, 175, 0.08)',
    text: '#9CA3AF',
    border: 'rgba(156, 163, 175, 0.25)',
    badgeClass: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  },
};

const PRIORITY_CONFIG: Record<LeadPriority, { label: string; color: string; badge: string }> = {
  normal: { label: 'Обычный', color: '#9CA3AF', badge: 'border-white/10 text-white/70' },
  high: { label: 'Высокий', color: '#F59E0B', badge: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  urgent: { label: 'Срочный', color: '#FD4B32', badge: 'border-[#FD4B32]/40 text-[#FD4B32] bg-[#FD4B32]/10' },
};

const AVAILABLE_SERVICES = ['Сайты', 'Айдентика', 'Полиграфия', 'SMM', 'Презентации', 'Сопровождение'];

export function CrmApp() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [settings, setSettings] = useState<CrmSettings>(getCrmSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'analytics' | 'reviews'>('kanban');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [telegramTestStatus, setTelegramTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Reviews view filters and link generator modal
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('all');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<string>('all');
  const [copiedReviewSnippetId, setCopiedReviewSnippetId] = useState<string | null>(null);
  const [isGenerateLinkModalOpen, setIsGenerateLinkModalOpen] = useState(false);
  const [linkClientName, setLinkClientName] = useState('');
  const [linkClientCompany, setLinkClientCompany] = useState('');
  const [linkClientRole, setLinkClientRole] = useState('');
  const [linkClientServices, setLinkClientServices] = useState<string[]>(['Сайты']);
  const [copiedLinkSuccess, setCopiedLinkSuccess] = useState(false);

  // Check auth session
  useEffect(() => {
    const currentSession = getAdminSession();
    setSession(currentSession);
    setAuthLoaded(true);

    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<AdminSession | null>;
      setSession(customEvent.detail);
    };

    window.addEventListener('yapil_admin_auth_changed', handleAuthChange);
    return () => window.removeEventListener('yapil_admin_auth_changed', handleAuthChange);
  }, []);

  // Load leads and reviews and subscribe to real-time events when authenticated
  useEffect(() => {
    if (!session && isSupabaseConfigured) return;

    setLeads(getLeads());
    setReviews(getStoredReviews());
    setSettings(getCrmSettings());

    // Sync with Supabase on mount
    if (isSupabaseConfigured) {
      syncLeadsFromSupabase().then((cloudLeads) => {
        if (cloudLeads && cloudLeads.length > 0) {
          setLeads(cloudLeads);
        }
      });
    }

    const handleLeadsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<Lead[]>;
      if (customEvent.detail) {
        setLeads(customEvent.detail);
      } else {
        setLeads(getLeads());
      }
    };

    const handleReviewsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<ClientReview[]>;
      if (customEvent.detail) {
        setReviews(customEvent.detail);
      } else {
        setReviews(getStoredReviews());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'yapil_crm_leads_v1' && e.newValue) {
        try {
          setLeads(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
      if (e.key === 'yapil_crm_reviews_v1' && e.newValue) {
        try {
          setReviews(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('yapil_crm_leads_changed', handleLeadsChanged);
    window.addEventListener('yapil_reviews_changed', handleReviewsChanged);
    window.addEventListener('storage', handleStorage);

    // Cross-tab broadcast listener
    let channel: BroadcastChannel | null = null;
    let revChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('yapil_crm_channel');
        channel.onmessage = (msg) => {
          if (msg.data?.type === 'leads_updated' && msg.data.leads) {
            setLeads(msg.data.leads);
          } else if (msg.data?.type === 'settings_updated' && msg.data.settings) {
            setSettings(msg.data.settings);
          }
        };

        revChannel = new BroadcastChannel('yapil_reviews_channel');
        revChannel.onmessage = (msg) => {
          if (msg.data?.type === 'reviews_updated' && msg.data.reviews) {
            setReviews(msg.data.reviews);
          }
        };
      } catch {
        // ignore
      }
    }

    return () => {
      window.removeEventListener('yapil_crm_leads_changed', handleLeadsChanged);
      window.removeEventListener('yapil_reviews_changed', handleReviewsChanged);
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
      if (revChannel) revChannel.close();
    };
  }, [session]);

  // Update selected lead when leads state changes
  useEffect(() => {
    if (selectedLead) {
      const updated = leads.find((l) => l.id === selectedLead.id);
      if (updated) {
        setSelectedLead(updated);
      }
    }
  }, [leads, selectedLead]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const res = await signInAdmin(loginEmail, loginPassword);
    setIsLoggingIn(false);

    if (res.success) {
      setSession(getAdminSession());
    } else {
      setLoginError(res.error || 'Ошибка авторизации. Проверьте Email и пароль.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Выйти из панели управления CRM?')) {
      clearAdminSession();
      setSession(null);
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(q);
        const matchesPhone = lead.phone.toLowerCase().includes(q) || lead.rawPhone.includes(q);
        const matchesMessage = (lead.message || '').toLowerCase().includes(q);
        const matchesId = lead.id.toLowerCase().includes(q);
        const matchesService = lead.services.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesPhone && !matchesMessage && !matchesId && !matchesService) {
          return false;
        }
      }

      if (statusFilter !== 'all' && lead.status !== statusFilter) {
        return false;
      }

      if (serviceFilter !== 'all' && !lead.services.includes(serviceFilter)) {
        return false;
      }

      return true;
    });
  }, [leads, searchQuery, statusFilter, serviceFilter]);

  const stats: CrmStats = useMemo(() => calculateStats(leads), [leads]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const matchesSearch =
        !reviewSearchQuery ||
        rev.author.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
        rev.company.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
        rev.quote.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
        rev.role.toLowerCase().includes(reviewSearchQuery.toLowerCase());

      const matchesStatus = reviewStatusFilter === 'all' || rev.status === reviewStatusFilter;
      const matchesRating = reviewRatingFilter === 'all' || String(rev.rating) === reviewRatingFilter;

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, reviewSearchQuery, reviewStatusFilter, reviewRatingFilter]);

  const reviewStats = useMemo(() => calculateReviewStats(reviews), [reviews]);
  const newReviewsCount = useMemo(() => reviews.filter((r) => r.status === 'new').length, [reviews]);

  const handleCopyReviewSnippet = (rev: ClientReview) => {
    const code = generateReviewTypeScriptSnippet(rev);
    navigator.clipboard.writeText(code);
    setCopiedReviewSnippetId(rev.id);
    setTimeout(() => setCopiedReviewSnippetId(null), 2500);
  };

  const handleReviewStatusChange = (id: string, newStatus: ReviewStatus) => {
    const updated = updateReviewStatus(id, newStatus);
    if (updated) {
      setReviews(getStoredReviews());
    }
  };

  const handleDeleteReview = (id: string) => {
    if (window.confirm('Удалить этот отзыв безвозвратно?')) {
      deleteReview(id);
      setReviews(getStoredReviews());
    }
  };

  const generateShareLink = () => {
    if (typeof window === 'undefined') return '';
    const base = `${window.location.origin}/review`;
    const params = new URLSearchParams();
    if (linkClientName.trim()) params.set('name', linkClientName.trim());
    if (linkClientCompany.trim()) params.set('company', linkClientCompany.trim());
    if (linkClientRole.trim()) params.set('role', linkClientRole.trim());
    if (linkClientServices.length > 0) params.set('services', linkClientServices.join(','));
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    const updated = changeLeadStatus(id, newStatus);
    if (updated) {
      setLeads(getLeads());
    }
  };

  const handlePriorityChange = (id: string, priority: LeadPriority) => {
    const updated = changeLeadPriority(id, priority);
    if (updated) {
      setLeads(getLeads());
    }
  };

  const handleAddNote = (id: string) => {
    if (!noteInput.trim()) return;
    const updated = addLeadNote(id, noteInput, 'Яков Пиль');
    if (updated) {
      setLeads(getLeads());
      setNoteInput('');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      deleteLead(id);
      setLeads(getLeads());
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
    }
  };

  const handleTestTelegram = async () => {
    setTelegramTestStatus('testing');
    try {
      const res = await fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: settings.telegramBotToken || undefined,
          chatId: settings.telegramChatId || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setTelegramTestStatus('success');
      } else {
        setTelegramTestStatus('error');
        alert(`Ошибка проверки Telegram:\n${data.error || 'Не удалось отправить сообщение'}`);
      }
    } catch (err: any) {
      setTelegramTestStatus('error');
      alert(`Сетевая ошибка при проверке Telegram:\n${err?.message || err}`);
    }
    setTimeout(() => setTelegramTestStatus('idle'), 4000);
  };

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн назад`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const themeClass = isDarkTheme ? 'bg-[#0B0B0C] text-white' : 'bg-[#FFFAF9] text-[#1D1D1D]';
  const cardBg = isDarkTheme ? 'bg-[#141416] border-white/10' : 'bg-white border-black/[0.08] shadow-sm';

  if (!authLoaded) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center text-white/50 font-mono text-xs">
        Инициализация защищённой сессии...
      </div>
    );
  }

  // --- LOGIN SCREEN IF NOT AUTHENTICATED ---
  if (!session && isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm p-6 sm:p-8 border border-white/15 bg-[#121214] shadow-2xl">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                <Lock className="size-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email"
              autoFocus
              className="w-full px-4 py-3 bg-black/60 border border-white/15 text-white text-sm outline-none focus:border-[#FD4B32] transition-colors rounded-none"
            />

            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full px-4 py-3 bg-black/60 border border-white/15 text-white text-sm outline-none focus:border-[#FD4B32] transition-colors rounded-none"
            />

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-[#FD4B32] hover:bg-[#E63A22] text-white font-medium text-sm transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 rounded-none cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RotateCcw className="size-4 animate-spin" />
                  <span>Вход...</span>
                </>
              ) : (
                <span>Войти</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClass} font-sans selection:bg-[#FD4B32] selection:text-white transition-colors duration-200`}>
      {/* Top Bar / Navigation */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-2xl transition-colors ${
        isDarkTheme ? 'bg-[#0B0B0C]/85 border-white/10' : 'bg-[#FFFAF9]/85 border-black/[0.08]'
      }`}>
        <div className="container py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Status Badge */}
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="group inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              title="Вернуться на сайт yapil.art"
            >
              <div className={`px-2.5 py-1 border text-xs font-mono tracking-wider flex items-center gap-2 ${
                isDarkTheme ? 'border-white/15 bg-white/5 text-white' : 'border-black/15 bg-black/5 text-[#1D1D1D]'
              }`}>
                <span className="font-bold text-[#FD4B32] tracking-widest">YAPIL</span>
                <span className="text-white/40">/</span>
                <span>CRM</span>
              </div>
            </a>

            {/* Live Indicator */}
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Лиды · Live</span>
            </div>

            {/* Supabase Cloud Sync Indicator */}
            {isSupabaseConfigured && (
              <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border border-sky-500/30 bg-sky-500/10 text-sky-400">
                <ShieldCheck className="size-3.5 text-sky-400" />
                <span>Supabase Secure RLS</span>
              </div>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className={`flex items-center border p-0.5 ${
            isDarkTheme ? 'border-white/15 bg-black/40' : 'border-black/15 bg-black/5'
          }`}>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3.5 py-1.5 text-xs font-medium flex items-center gap-2 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-[#FD4B32] text-white shadow-sm'
                  : isDarkTheme ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
              }`}
            >
              <Kanban className="size-3.5" />
              <span className="hidden sm:inline">Канбан</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-1.5 text-xs font-medium flex items-center gap-2 transition-all ${
                viewMode === 'table'
                  ? 'bg-[#FD4B32] text-white shadow-sm'
                  : isDarkTheme ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
              }`}
            >
              <List className="size-3.5" />
              <span className="hidden sm:inline">Таблица</span>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3.5 py-1.5 text-xs font-medium flex items-center gap-2 transition-all ${
                viewMode === 'analytics'
                  ? 'bg-[#FD4B32] text-white shadow-sm'
                  : isDarkTheme ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
              }`}
            >
              <BarChart3 className="size-3.5" />
              <span className="hidden sm:inline">Аналитика</span>
            </button>
            <button
              onClick={() => setViewMode('reviews')}
              className={`px-3.5 py-1.5 text-xs font-medium flex items-center gap-2 transition-all ${
                viewMode === 'reviews'
                  ? 'bg-[#FD4B32] text-white shadow-sm'
                  : isDarkTheme ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
              }`}
            >
              <Star className="size-3.5" />
              <span className="hidden sm:inline">Отзывы</span>
              {newReviewsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#FD4B32] text-white rounded-full leading-none">
                  {newReviewsCount}
                </span>
              )}
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Quick manual lead */}
            <button
              onClick={() => setIsNewLeadModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#FD4B32] hover:bg-[#E63A22] text-white border border-[#FD4B32] flex items-center gap-1.5 transition-all transform active:scale-95 shadow-[0_4px_14px_rgba(253,75,50,0.3)]"
            >
              <Plus className="size-3.5 stroke-[2.5]" />
              <span>Создать заявку</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={() => exportLeadsToCsv(leads)}
              title="Экспорт в CSV"
              className={`p-1.5 border text-xs flex items-center transition-colors ${
                isDarkTheme ? 'border-white/15 text-white/70 hover:text-white hover:border-white/30 bg-white/5' : 'border-black/15 text-black/70 hover:text-black hover:border-black/30 bg-black/5'
              }`}
            >
              <Download className="size-4" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              title="Настройки Telegram и CRM"
              className={`p-1.5 border text-xs flex items-center transition-colors ${
                isDarkTheme ? 'border-white/15 text-white/70 hover:text-white hover:border-white/30 bg-white/5' : 'border-black/15 text-black/70 hover:text-black hover:border-black/30 bg-black/5'
              }`}
            >
              <SettingsIcon className="size-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              title="Сменить тему оформления"
              className={`p-1.5 border text-xs flex items-center transition-colors ${
                isDarkTheme ? 'border-white/15 text-white/70 hover:text-white hover:border-white/30 bg-white/5' : 'border-black/15 text-black/70 hover:text-black hover:border-black/30 bg-black/5'
              }`}
            >
              {isDarkTheme ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            {/* Logout button */}
            {session && (
              <button
                onClick={handleLogout}
                title={`Выйти (${session.user.email})`}
                className={`p-1.5 border text-xs flex items-center transition-colors text-red-400 hover:text-red-300 ${
                  isDarkTheme ? 'border-white/15 bg-white/5 hover:border-red-500/40' : 'border-black/15 bg-black/5 hover:border-red-500/40'
                }`}
              >
                <LogOut className="size-4" />
              </button>
            )}

            {/* Link back to website */}
            <a
              href="/"
              className={`hidden md:inline-flex items-center gap-1 text-xs px-2.5 py-1.5 border transition-colors ${
                isDarkTheme ? 'border-white/10 text-white/60 hover:text-white hover:border-white/20' : 'border-black/10 text-black/60 hover:text-black hover:border-black/20'
              }`}
            >
              <span>Сайт</span>
              <ArrowUpRight className="size-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container py-6 space-y-6">
        {viewMode !== 'reviews' && (
          <>
            {/* KPI / Pipeline Health Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className={`p-4 border ${cardBg}`}>
                <span className="text-xs text-white/50 block mb-1">Всего заявок</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    {stats.totalLeads}
                  </span>
                  <span className="text-xs font-mono text-white/40">100%</span>
                </div>
              </div>

              <div className={`p-4 border ${cardBg}`}>
                <span className="text-xs text-[#FD4B32] flex items-center gap-1 mb-1">
                  <span className="size-1.5 rounded-full bg-[#FD4B32] animate-ping" />
                  Новые (ждут ответа)
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#FD4B32]" style={{ fontFamily: 'var(--font-display)' }}>
                    {stats.newLeads}
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    {stats.totalLeads > 0 ? Math.round((stats.newLeads / stats.totalLeads) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className={`p-4 border ${cardBg}`}>
                <span className="text-xs text-indigo-400 block mb-1">В работе / Встречи</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-indigo-400" style={{ fontFamily: 'var(--font-display)' }}>
                    {stats.inProgressLeads}
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    {stats.totalLeads > 0 ? Math.round((stats.inProgressLeads / stats.totalLeads) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className={`p-4 border ${cardBg}`}>
                <span className="text-xs text-[#80EFC9] block mb-1">Сделки закрыты</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#80EFC9]" style={{ fontFamily: 'var(--font-display)' }}>
                    {stats.wonLeads}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    {stats.conversionRate}% CR
                  </span>
                </div>
              </div>

              <div className={`p-4 border ${cardBg}`}>
                <span className="text-xs text-amber-400 block mb-1">Оценка пайплайна</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg sm:text-xl font-mono font-bold text-amber-400 truncate" title={`${stats.totalEstimatedBudget.toLocaleString()} ₸`}>
                    {stats.totalEstimatedBudget > 0 ? `${(stats.totalEstimatedBudget / 1000000).toFixed(1)}M ₸` : '0 ₸'}
                  </span>
                </div>
              </div>

              <div className={`p-4 border ${cardBg}`}>
                <span className="text-xs text-white/50 block mb-1">За сегодня</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    +{stats.todayLeadsCount}
                  </span>
                  <span className="text-xs font-mono text-white/40">сегодня</span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className={`p-4 border flex flex-wrap items-center justify-between gap-3.5 ${cardBg}`}>
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по имени, номеру телефона (+7...), услуге, сообщению или #ID..."
                  className={`w-full pl-9 pr-8 py-2 text-xs sm:text-sm border outline-none transition-colors ${
                    isDarkTheme
                      ? 'bg-black/30 border-white/10 text-white placeholder-white/30 focus:border-[#FD4B32]'
                      : 'bg-black/[0.02] border-black/10 text-black placeholder-black/30 focus:border-[#FD4B32]'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 hidden sm:inline">Услуга:</span>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className={`px-3 py-2 text-xs border outline-none cursor-pointer ${
                    isDarkTheme ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-black/15 text-black'
                  }`}
                >
                  <option value="all">Все услуги ({leads.length})</option>
                  {AVAILABLE_SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 hidden sm:inline">Этап:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-2 text-xs border outline-none cursor-pointer ${
                    isDarkTheme ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-black/15 text-black'
                  }`}
                >
                  <option value="all">Все этапы</option>
                  {Object.entries(STATUS_CONFIG).map(([st, cfg]) => (
                    <option key={st} value={st}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* --- VIEW 1: KANBAN BOARD --- */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
            {(['new', 'contacted', 'meeting', 'won', 'lost'] as LeadStatus[]).map((colStatus) => {
              const colConfig = STATUS_CONFIG[colStatus];
              const colLeads = filteredLeads.filter((l) => {
                if (colStatus === 'meeting') {
                  return l.status === 'meeting' || l.status === 'proposal';
                }
                return l.status === colStatus;
              });

              return (
                <div
                  key={colStatus}
                  className={`border flex flex-col min-h-[500px] ${
                    isDarkTheme ? 'bg-[#101012] border-white/10' : 'bg-[#F7F5F2] border-black/10'
                  }`}
                >
                  <div className="p-3.5 border-b flex items-center justify-between" style={{ borderColor: colConfig.border }}>
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-none" style={{ backgroundColor: colConfig.text }} />
                      <h3 className="text-xs font-mono uppercase tracking-wider font-semibold" style={{ color: colConfig.text }}>
                        {colStatus === 'meeting' ? 'Встреча / КП' : colConfig.label}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-mono border bg-white/5 border-white/10 text-white/70">
                      {colLeads.length}
                    </span>
                  </div>

                  <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[75vh]">
                    {colLeads.length === 0 ? (
                      <div className="py-12 text-center text-xs text-white/30 font-mono">
                        Нет заявок в этом статусе
                      </div>
                    ) : (
                      colLeads.map((lead) => {
                        const priorityInfo = PRIORITY_CONFIG[lead.priority];
                        return (
                          <div
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            className={`p-3.5 border cursor-pointer group relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                              isDarkTheme
                                ? 'bg-[#18181A] border-white/10 hover:border-white/25 hover:bg-[#1E1E22]'
                                : 'bg-white border-black/10 hover:border-[#FD4B32] hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 text-xs mb-2">
                              <span className="font-mono text-white/40 font-semibold group-hover:text-[#FD4B32] transition-colors">
                                #{lead.id}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {lead.priority !== 'normal' && (
                                  <span className={`px-1.5 py-0.2 text-[10px] uppercase font-mono border ${priorityInfo.badge}`}>
                                    {priorityInfo.label}
                                  </span>
                                )}
                                <span className="font-mono text-[11px] text-white/40">
                                  {formatTimeAgo(lead.createdAt)}
                                </span>
                              </div>
                            </div>

                            <h4 className="text-sm font-semibold text-white group-hover:text-[#FD4B32] transition-colors mb-1.5 line-clamp-1">
                              {lead.name}
                            </h4>

                            <div className="flex flex-wrap gap-1 mb-2.5">
                              {lead.services.map((svc) => (
                                <span
                                  key={svc}
                                  className="px-2 py-0.5 text-[10px] font-mono border border-white/10 bg-white/5 text-white/80"
                                >
                                  {svc}
                                </span>
                              ))}
                            </div>

                            {lead.message && (
                              <p className="text-xs text-white/60 line-clamp-2 mb-3 leading-relaxed">
                                {lead.message}
                              </p>
                            )}

                            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <a
                                  href={`https://wa.me/${lead.rawPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                                  title="Написать в WhatsApp"
                                >
                                  <MessageCircle className="size-3.5" />
                                </a>
                                <a
                                  href={`tel:+${lead.rawPhone}`}
                                  className="p-1 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-colors"
                                  title="Позвонить"
                                >
                                  <Phone className="size-3.5" />
                                </a>
                              </div>

                              <span className="text-[10px] font-mono text-white/40 truncate max-w-[120px]" title={lead.sourceDetails}>
                                {lead.source === 'service_modal' ? '★ Модалка' : '⚡ Форма'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- VIEW 2: TABLE LIST --- */}
        {viewMode === 'table' && (
          <div className={`border overflow-x-auto ${cardBg}`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-white/60 font-mono uppercase tracking-wider">
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Клиент</th>
                  <th className="p-3.5">Телефон</th>
                  <th className="p-3.5">Услуги</th>
                  <th className="p-3.5">Статус</th>
                  <th className="p-3.5">Приоритет</th>
                  <th className="p-3.5">Бюджет</th>
                  <th className="p-3.5">Источник</th>
                  <th className="p-3.5">Дата</th>
                  <th className="p-3.5 text-right">Связь</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-white/40 font-mono">
                      Заявок не найдено
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const statusCfg = STATUS_CONFIG[lead.status];
                    const priorityCfg = PRIORITY_CONFIG[lead.priority];

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                      >
                        <td className="p-3.5 font-mono text-white/50 font-semibold">#{lead.id}</td>
                        <td className="p-3.5 font-medium text-white hover:text-[#FD4B32]">{lead.name}</td>
                        <td className="p-3.5 font-mono text-white/70">{lead.phone}</td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {lead.services.map((s) => (
                              <span key={s} className="px-1.5 py-0.5 text-[10px] font-mono border border-white/10 bg-white/5">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 font-mono text-[11px] border ${statusCfg.badgeClass}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-1.5 py-0.5 font-mono text-[10px] uppercase border ${priorityCfg.badge}`}>
                            {priorityCfg.label}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-amber-400">{lead.budget || '—'}</td>
                        <td className="p-3.5 font-mono text-white/40 text-[11px]">{lead.sourceDetails || lead.source}</td>
                        <td className="p-3.5 font-mono text-white/40 text-[11px]">{formatTimeAgo(lead.createdAt)}</td>
                        <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/${lead.rawPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                              title="WhatsApp"
                            >
                              <MessageCircle className="size-3.5" />
                            </a>
                            <a
                              href={`tel:+${lead.rawPhone}`}
                              className="p-1 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20"
                              title="Позвонить"
                            >
                              <Phone className="size-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- VIEW 3: ANALYTICS --- */}
        {viewMode === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-6 border ${cardBg} space-y-4`}>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Briefcase className="size-4 text-[#FD4B32]" />
                <span>Спрос по направлениям услуг</span>
              </h3>
              <div className="space-y-3 pt-2">
                {Object.entries(stats.servicesBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([serviceName, count]) => {
                    const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0;
                    return (
                      <div key={serviceName} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-white">{serviceName}</span>
                          <span className="font-mono text-white/50">
                            {count} заявок ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/5 border border-white/10 overflow-hidden">
                          <div className="h-full bg-[#FD4B32]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className={`p-6 border ${cardBg} space-y-4`}>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="size-4 text-[#80EFC9]" />
                <span>Распределение по этапам воронки</span>
              </h3>
              <div className="space-y-3 pt-2">
                {Object.entries(STATUS_CONFIG).map(([stKey, cfg]) => {
                  const count = leads.filter((l) => l.status === stKey).length;
                  const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0;
                  return (
                    <div key={stKey} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium" style={{ color: cfg.text }}>
                          {cfg.label}
                        </span>
                        <span className="font-mono text-white/50">
                          {count} лидов ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-white/5 border border-white/10 overflow-hidden">
                        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: cfg.text }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`p-6 border ${cardBg} space-y-4 lg:col-span-2`}>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Layers className="size-4 text-amber-400" />
                <span>Источники конверсии</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {Object.entries(stats.sourceBreakdown).map(([sourceName, count]) => {
                  const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0;
                  return (
                    <div key={sourceName} className="p-4 border border-white/10 bg-white/[0.02]">
                      <span className="text-xs text-white/50 block mb-1">{sourceName}</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-mono font-bold text-white">{count}</span>
                        <span className="text-xs font-mono text-[#FD4B32]">{pct}% доли</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 4: CLIENT REVIEWS DASHBOARD --- */}
        {viewMode === 'reviews' && (
          <div className="space-y-6">
            {/* Reviews KPI Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className={`p-4 border ${cardBg}`}>
                <span className="text-xs text-white/50 block mb-1">Всего отзывов</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    {reviewStats.total}
                  </span>
                  <span className="text-xs font-mono text-white/40">100%</span>
                </div>
              </div>

              <div className={`p-4 border ${cardBg}`}>
                <span className="text-xs text-[#FD4B32] flex items-center gap-1 mb-1">
                  {reviewStats.newCount > 0 && <span className="size-1.5 rounded-full bg-[#FD4B32] animate-ping" />}
                  Новые (не проверены)
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#FD4B32]" style={{ fontFamily: 'var(--font-display)' }}>
                    {reviewStats.newCount}
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    {reviewStats.total > 0 ? Math.round((reviewStats.newCount / reviewStats.total) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className={`p-4 border ${cardBg}`}>
                <span className="text-xs text-[#80EFC9] block mb-1">Опубликованы</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#80EFC9]" style={{ fontFamily: 'var(--font-display)' }}>
                    {reviewStats.publishedCount}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    на сайте
                  </span>
                </div>
              </div>

              <div className={`p-4 border ${cardBg}`}>
                <span className="text-xs text-amber-400 block mb-1">Средняя оценка</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400">
                    {reviewStats.avgRating} ★
                  </span>
                  <span className="text-xs font-mono text-white/40">из 5.0</span>
                </div>
              </div>

              <div className={`p-4 border ${cardBg}`}>
                <span className="text-xs text-white/50 block mb-1">Доля 5★ отзывов</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    {reviewStats.fiveStarPercent}%
                  </span>
                  <span className="text-xs font-mono text-[#FD4B32]">максимум</span>
                </div>
              </div>
            </div>

            {/* Reviews Search & Action Bar */}
            <div className={`p-4 border flex flex-wrap items-center justify-between gap-3.5 ${cardBg}`}>
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <input
                  type="text"
                  value={reviewSearchQuery}
                  onChange={(e) => setReviewSearchQuery(e.target.value)}
                  placeholder="Поиск по автору, компании, цитате или должности..."
                  className={`w-full pl-9 pr-8 py-2 text-xs sm:text-sm border outline-none transition-colors ${
                    isDarkTheme
                      ? 'bg-black/30 border-white/10 text-white placeholder-white/30 focus:border-[#FD4B32]'
                      : 'bg-black/[0.02] border-black/10 text-black placeholder-black/30 focus:border-[#FD4B32]'
                  }`}
                />
                {reviewSearchQuery && (
                  <button
                    onClick={() => setReviewSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 hidden sm:inline">Статус:</span>
                <select
                  value={reviewStatusFilter}
                  onChange={(e) => setReviewStatusFilter(e.target.value)}
                  className={`px-3 py-2 text-xs border outline-none cursor-pointer ${
                    isDarkTheme ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-black/15 text-black'
                  }`}
                >
                  <option value="all">Все статусы ({reviews.length})</option>
                  {Object.entries(REVIEW_STATUS_CONFIG).map(([st, cfg]) => (
                    <option key={st} value={st}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 hidden sm:inline">Оценка:</span>
                <select
                  value={reviewRatingFilter}
                  onChange={(e) => setReviewRatingFilter(e.target.value)}
                  className={`px-3 py-2 text-xs border outline-none cursor-pointer ${
                    isDarkTheme ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-black/15 text-black'
                  }`}
                >
                  <option value="all">Любая оценка</option>
                  <option value="5">5 звезд ★★★★★</option>
                  <option value="4">4 звезды ★★★★☆</option>
                  <option value="3">3 звезды ★★★☆☆</option>
                  <option value="2">2 звезды ★★☆☆☆</option>
                  <option value="1">1 звезда ★☆☆☆☆</option>
                </select>
              </div>

              {/* Action: Generate Client Share Link */}
              <button
                type="button"
                onClick={() => setIsGenerateLinkModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-[#FD4B32] hover:bg-[#E63A22] text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Share2 className="size-3.5" />
                <span>Ссылка для клиента</span>
              </button>

            </div>

            {/* Reviews Grid */}
            {filteredReviews.length === 0 ? (
              <div className={`p-12 border text-center font-mono text-xs ${cardBg} text-white/40`}>
                Отзывов по заданным фильтрам не найдено
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredReviews.map((rev) => {
                  const isCopied = copiedReviewSnippetId === rev.id;

                  return (
                    <div
                      key={rev.id}
                      className={`p-6 border flex flex-col justify-between gap-5 transition-all ${cardBg} ${
                        rev.status === 'new' ? 'border-[#FD4B32]/40 ring-1 ring-[#FD4B32]/30' : ''
                      }`}
                    >
                      {/* Top Row: Author Info, Status, Rating */}
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3.5">
                            {rev.avatar ? (
                              <img
                                src={rev.avatar}
                                alt={rev.author}
                                className="size-12 rounded-none object-cover border border-white/15 bg-white/5 shrink-0"
                              />
                            ) : (
                              <div className="size-12 border border-white/15 bg-white/5 flex items-center justify-center font-bold text-white/60 font-mono text-sm shrink-0">
                                {rev.author.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base sm:text-lg font-bold text-white m-0">
                                  {rev.author}
                                </h4>
                                {rev.allowPublish ? (
                                  <span className="text-[10px] px-1.5 py-0.2 font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" title="Разрешено публиковать на сайте">
                                    Публичный
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.2 font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30" title="Только для внутреннего анализа">
                                    Приватный
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/60 m-0 mt-0.5">
                                {rev.role}{rev.company ? ` · ${rev.company}` : ''}
                              </p>
                              {rev.contact && (
                                <span className="text-[11px] font-mono text-[#FD4B32] mt-0.5 block">
                                  {rev.contact}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stars & Date */}
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center text-[#FD4B32]">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="size-4"
                                  fill={i < rev.rating ? 'currentColor' : 'none'}
                                  stroke="currentColor"
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-mono text-white/40">
                              {new Date(rev.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>

                        {/* Services Tags */}
                        {rev.services && rev.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {rev.services.map((s) => (
                              <span key={s} className="px-2 py-0.5 text-[11px] font-mono border border-white/10 bg-white/5 text-white/75">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Quote Block */}
                        <blockquote className="m-0 p-3.5 bg-white/[0.03] border-l-2 border-[#FD4B32] text-sm text-white/90 italic leading-relaxed mb-4">
                          «{rev.quote}»
                        </blockquote>

                        {/* Breakdown Answers */}
                        <div className="space-y-3 text-xs text-white/70 border-t border-white/10 pt-3">
                          {rev.likedMost && (
                            <div>
                              <span className="font-semibold text-white/90 block mb-0.5">👍 Что понравилось:</span>
                              <p className="m-0 whitespace-pre-line leading-relaxed text-white/75">{rev.likedMost}</p>
                            </div>
                          )}

                          {rev.likedSpecial && (
                            <div>
                              <span className="font-semibold text-[#FD4B32] block mb-0.5">🔥 Что особенно понравилось:</span>
                              <p className="m-0 whitespace-pre-line leading-relaxed text-white/75">{rev.likedSpecial}</p>
                            </div>
                          )}

                          {rev.toImprove && (
                            <div>
                              <span className="font-semibold text-amber-400 block mb-0.5">💡 Что улучшить:</span>
                              <p className="m-0 whitespace-pre-line leading-relaxed text-white/75">{rev.toImprove}</p>
                            </div>
                          )}

                          {rev.businessResults && (
                            <div>
                              <span className="font-semibold text-emerald-400 block mb-0.5">📈 Результаты бизнеса:</span>
                              <p className="m-0 whitespace-pre-line leading-relaxed text-white/75">{rev.businessResults}</p>
                            </div>
                          )}

                          {rev.fullReviewText && (
                            <div>
                              <span className="font-semibold text-white/90 block mb-0.5">📝 Полный текст:</span>
                              <p className="m-0 whitespace-pre-line leading-relaxed text-white/75">{rev.fullReviewText}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions: Status Select, Copy Code, Delete */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-white/40">Статус:</span>
                          <select
                            value={rev.status}
                            onChange={(e) => handleReviewStatusChange(rev.id, e.target.value as ReviewStatus)}
                            className="px-2.5 py-1 text-xs border border-white/15 bg-black/60 text-white outline-none cursor-pointer"
                          >
                            {Object.entries(REVIEW_STATUS_CONFIG).map(([st, cfg]) => (
                              <option key={st} value={st}>
                                {cfg.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyReviewSnippet(rev)}
                            className={`px-3 py-1 text-xs font-mono font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'border-[#FD4B32]/40 text-[#FD4B32] hover:bg-[#FD4B32] hover:text-white bg-[#FD4B32]/10'
                            }`}
                            title="Скопировать готовый TypeScript объект для reviewsData.ts"
                          >
                            {isCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
                            <span>{isCopied ? 'Скопировано!' : 'Код для reviewsData.ts'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                            title="Удалить отзыв"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- MODAL 1: LEAD DETAIL PROFILE DRAWER --- */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-md"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className={`w-full max-w-xl h-full overflow-y-auto border-l p-6 sm:p-8 space-y-6 animate-in slide-in-from-right duration-200 ${
              isDarkTheme ? 'bg-[#121214] border-white/15 text-white' : 'bg-white border-black/15 text-[#1D1D1D]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-[#FD4B32] font-semibold">#{selectedLead.id}</span>
                  <span className="text-xs text-white/40 font-mono">· {new Date(selectedLead.createdAt).toLocaleString('ru-RU')}</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  {selectedLead.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 border border-white/10 hover:border-white/30 text-white/60 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <a
                href={`https://wa.me/${selectedLead.rawPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="size-5" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:+${selectedLead.rawPhone}`}
                className="p-3 border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="size-5" />
                <span>Позвонить</span>
              </a>

              <button
                onClick={() => handleCopy(`${selectedLead.name} ${selectedLead.phone}`, 'copy-all')}
                className="p-3 border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                {copiedId === 'copy-all' ? <Check className="size-5 text-emerald-400" /> : <Copy className="size-5" />}
                <span>{copiedId === 'copy-all' ? 'Скопировано' : 'Скопировать'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 border border-white/10 bg-white/[0.02]">
              <div>
                <label className="text-xs font-mono text-white/50 block mb-1.5 uppercase">Статус заявки</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStatusChange(selectedLead.id, e.target.value as LeadStatus)}
                  className={`w-full p-2 text-xs border font-medium outline-none cursor-pointer ${
                    isDarkTheme ? 'bg-black/60 border-white/20 text-white' : 'bg-white border-black/20 text-black'
                  }`}
                >
                  {Object.entries(STATUS_CONFIG).map(([stKey, cfg]) => (
                    <option key={stKey} value={stKey}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-white/50 block mb-1.5 uppercase">Приоритет</label>
                <select
                  value={selectedLead.priority}
                  onChange={(e) => handlePriorityChange(selectedLead.id, e.target.value as LeadPriority)}
                  className={`w-full p-2 text-xs border font-medium outline-none cursor-pointer ${
                    isDarkTheme ? 'bg-black/60 border-white/20 text-white' : 'bg-white border-black/20 text-black'
                  }`}
                >
                  {Object.entries(PRIORITY_CONFIG).map(([prKey, cfg]) => (
                    <option key={prKey} value={prKey}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono text-white/50 uppercase block mb-1">Выбранные направления</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLead.services.map((svc) => (
                    <span key={svc} className="px-2.5 py-1 text-xs font-mono border border-white/20 bg-white/5 text-white">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-white/50 uppercase block mb-1">Номер телефона</span>
                <div className="flex items-center justify-between p-2.5 border border-white/10 bg-white/[0.02]">
                  <span className="font-mono text-sm text-white font-medium">{selectedLead.phone}</span>
                  <button
                    onClick={() => handleCopy(selectedLead.phone, 'phone')}
                    className="text-xs font-mono text-white/40 hover:text-white"
                  >
                    {copiedId === 'phone' ? 'Скопировано!' : 'Копировать'}
                  </button>
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <span className="text-xs font-mono text-white/50 uppercase block mb-1">Описание задачи / Сообщение</span>
                  <div className="p-3.5 border border-white/10 bg-white/[0.02] text-sm text-white/90 leading-relaxed">
                    {selectedLead.message}
                  </div>
                </div>
              )}

              <div className="p-3.5 border border-white/10 bg-black/40 space-y-1.5 text-xs font-mono text-white/60">
                <div className="flex justify-between">
                  <span className="text-white/40">Источник:</span>
                  <span>{selectedLead.sourceDetails || selectedLead.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Страница:</span>
                  <span className="truncate max-w-[280px]">{selectedLead.pageUrl}</span>
                </div>
                {selectedLead.utm?.source && (
                  <div className="flex justify-between text-amber-400">
                    <span>UTM Source:</span>
                    <span>{selectedLead.utm.source}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/10">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white/70 font-semibold flex items-center gap-2">
                <Briefcase className="size-3.5 text-[#FD4B32]" />
                <span>Заметки менеджера / История общения</span>
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote(selectedLead.id)}
                  placeholder="Добавить комментарий (созвонились, КП до пятницы)..."
                  className={`flex-1 px-3 py-2 text-xs border outline-none ${
                    isDarkTheme ? 'bg-black/50 border-white/15 text-white placeholder-white/30' : 'bg-black/5 border-black/15 text-black'
                  }`}
                />
                <button
                  onClick={() => handleAddNote(selectedLead.id)}
                  className="px-3 py-2 bg-[#FD4B32] hover:bg-[#E63A22] text-white text-xs font-semibold"
                >
                  <Send className="size-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedLead.notes.length === 0 ? (
                  <p className="text-xs text-white/30 font-mono py-2">Заметок пока нет</p>
                ) : (
                  selectedLead.notes.map((note) => (
                    <div key={note.id} className="p-3 border border-white/10 bg-white/[0.02] text-xs space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-white/40">
                        <span className="text-[#FD4B32] font-medium">{note.author || 'Менеджер'}</span>
                        <span>{new Date(note.createdAt).toLocaleString('ru-RU')}</span>
                      </div>
                      <p className="text-white/85 leading-relaxed">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedLead.id)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 py-1 px-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span>Удалить заявку</span>
              </button>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 border border-white/15 text-xs text-white/70 hover:text-white hover:border-white/30"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CREATE LEAD MANUALLY --- */}
      {isNewLeadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsNewLeadModalOpen(false)}
        >
          <div
            className={`w-full max-w-lg border p-6 sm:p-8 space-y-5 ${
              isDarkTheme ? 'bg-[#141416] border-white/15 text-white' : 'bg-white border-black/15 text-[#1D1D1D]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Новая заявка вручную
              </h3>
              <button onClick={() => setIsNewLeadModalOpen(false)} className="text-white/40 hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                const name = fd.get('name') as string;
                const phone = fd.get('phone') as string;
                const message = fd.get('message') as string;
                const budget = fd.get('budget') as string;
                const priority = fd.get('priority') as LeadPriority;
                const services = fd.getAll('services') as string[];

                if (!phone?.trim()) return;

                submitLead({
                  name,
                  phone,
                  message,
                  budget,
                  priority,
                  services: services.length > 0 ? services : ['Консультация'],
                  source: 'manual',
                  sourceDetails: 'Создано вручную в CRM',
                }).then(() => {
                  setLeads(getLeads());
                  setIsNewLeadModalOpen(false);
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-white/70 mb-1 font-medium">Имя клиента</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Имя или название компании"
                  className={`w-full px-3 py-2 border outline-none ${
                    isDarkTheme ? 'bg-black/50 border-white/15 text-white' : 'bg-black/5 border-black/15'
                  }`}
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-medium">Номер телефона *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+7 (___) ___-__-__"
                  className={`w-full px-3 py-2 border outline-none font-mono ${
                    isDarkTheme ? 'bg-black/50 border-white/15 text-white' : 'bg-black/5 border-black/15'
                  }`}
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-medium">Услуги</label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_SERVICES.map((s) => (
                    <label key={s} className="flex items-center gap-2 p-2 border border-white/10 bg-white/[0.02] cursor-pointer">
                      <input type="checkbox" name="services" value={s} className="accent-[#FD4B32]" />
                      <span className="text-white/80">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-medium">Ориентир бюджета</label>
                  <input
                    name="budget"
                    type="text"
                    placeholder="напр. 2 500 000 ₸"
                    className={`w-full px-3 py-2 border outline-none font-mono ${
                      isDarkTheme ? 'bg-black/50 border-white/15 text-white' : 'bg-black/5 border-black/15'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-medium">Приоритет</label>
                  <select
                    name="priority"
                    defaultValue="normal"
                    className={`w-full px-3 py-2 border outline-none ${
                      isDarkTheme ? 'bg-black/60 border-white/15 text-white' : 'bg-white border-black/15'
                    }`}
                  >
                    <option value="normal">Обычный</option>
                    <option value="high">Высокий</option>
                    <option value="urgent">Срочный</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-medium">Комментарий / Задача</label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Детали запроса..."
                  className={`w-full px-3 py-2 border outline-none resize-none ${
                    isDarkTheme ? 'bg-black/50 border-white/15 text-white' : 'bg-black/5 border-black/15'
                  }`}
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="px-4 py-2 border border-white/15 text-white/60 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FD4B32] hover:bg-[#E63A22] text-white font-semibold shadow-md"
                >
                  Сохранить лид
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: SETTINGS & INTEGRATIONS --- */}
      {isSettingsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsSettingsModalOpen(false)}
        >
          <div
            className={`w-full max-w-xl border p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto ${
              isDarkTheme ? 'bg-[#141416] border-white/15 text-white' : 'bg-white border-black/15 text-[#1D1D1D]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <SettingsIcon className="size-5 text-[#FD4B32]" />
                <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  Настройки интеграций и CRM
                </h3>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-white/40 hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            {/* Telegram Bot Integration */}
            <div className="p-4 border border-white/10 bg-white/[0.02] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="size-4 text-sky-400" />
                  <span className="text-sm font-semibold">Уведомления в Telegram</span>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.telegramEnabled}
                    onChange={(e) => {
                      const updated = saveCrmSettings({ telegramEnabled: e.target.checked });
                      setSettings(updated);
                    }}
                    className="accent-[#FD4B32]"
                  />
                  <span className="text-white/70">Включить</span>
                </label>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-white/50 mb-1">Telegram Bot Token (от @BotFather):</label>
                  <input
                    type="password"
                    value={settings.telegramBotToken}
                    onChange={(e) => {
                      const updated = saveCrmSettings({ telegramBotToken: e.target.value });
                      setSettings(updated);
                    }}
                    placeholder="напр. 7123456789:AAHk..."
                    className="w-full px-3 py-2 border border-white/15 bg-black/40 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-white/50 mb-1">Chat ID (личный или группы):</label>
                  <input
                    type="text"
                    value={settings.telegramChatId}
                    onChange={(e) => {
                      const updated = saveCrmSettings({ telegramChatId: e.target.value });
                      setSettings(updated);
                    }}
                    placeholder="напр. 94829104 или -10012345678"
                    className="w-full px-3 py-2 border border-white/15 bg-black/40 text-white font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={telegramTestStatus === 'testing'}
                    className="px-3 py-1.5 border border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {telegramTestStatus === 'testing' && <RotateCcw className="size-3 animate-spin" />}
                    {telegramTestStatus === 'success' && <Check className="size-3 text-emerald-400" />}
                    <span>{telegramTestStatus === 'success' ? 'Тест доставлен!' : 'Проверить отправку (Ping)'}</span>
                  </button>

                  <span className="text-[11px] text-white/40">Мгновенный дубль всех заявок</span>
                </div>
              </div>
            </div>

            {/* Custom Webhook */}
            <div className="p-4 border border-white/10 bg-white/[0.02] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="size-4 text-amber-400" />
                  <span className="text-sm font-semibold">Внешний Webhook URL</span>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.customWebhookEnabled}
                    onChange={(e) => {
                      const updated = saveCrmSettings({ customWebhookEnabled: e.target.checked });
                      setSettings(updated);
                    }}
                    className="accent-[#FD4B32]"
                  />
                  <span className="text-white/70">Включить</span>
                </label>
              </div>

              <input
                type="url"
                value={settings.customWebhookUrl}
                onChange={(e) => {
                  const updated = saveCrmSettings({ customWebhookUrl: e.target.value });
                  setSettings(updated);
                }}
                placeholder="https://hook.eu1.make.com/... или Zapier / Slack"
                className="w-full px-3 py-2 text-xs border border-white/15 bg-black/40 text-white font-mono"
              />
            </div>

            {/* Sound & Notifications */}
            <div className="p-4 border border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="size-4 text-[#FD4B32]" />
                <div>
                  <span className="text-xs font-semibold block">Звуковой колокольчик</span>
                  <span className="text-[11px] text-white/40">Приятный студийный звуковой сигнал при получении нового лида</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playLeadChime()}
                  className="px-2 py-1 border border-white/15 text-[11px] text-white/70 hover:text-white"
                >
                  Тест звука
                </button>
                <input
                  type="checkbox"
                  checked={settings.soundAlerts}
                  onChange={(e) => {
                    const updated = saveCrmSettings({ soundAlerts: e.target.checked });
                    setSettings(updated);
                  }}
                  className="accent-[#FD4B32] size-4"
                />
              </div>
            </div>

            {/* Data Operations: Reset / Backup */}
            <div className="p-4 border border-white/10 bg-black/40 space-y-3 text-xs">
              <span className="font-mono text-white/50 uppercase block">Управление базой данных</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => exportLeadsToJson(leads)}
                  className="px-3 py-1.5 border border-white/20 text-white/80 hover:text-white hover:border-white/40 flex items-center gap-1.5"
                >
                  <Download className="size-3.5" />
                  <span>Скачать JSON бэкап</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('ОЧИСТИТЬ ВСЕ ЗАЯВКИ? Это действие нельзя отменить.')) {
                      clearAllLeads();
                      setLeads([]);
                    }
                  }}
                  className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  <span>Очистить базу</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-5 py-2 bg-[#FD4B32] text-white text-xs font-semibold cursor-pointer"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: GENERATE CLIENT REVIEW LINK --- */}
      {isGenerateLinkModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          onClick={() => setIsGenerateLinkModalOpen(false)}
        >
          <div
            className={`w-full max-w-lg border p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 ${
              isDarkTheme ? 'bg-[#121214] border-white/15 text-white' : 'bg-white border-black/15 text-[#1D1D1D]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Share2 className="size-5 text-[#FD4B32]" />
                <h3 className="text-lg font-bold m-0" style={{ fontFamily: 'var(--font-display)' }}>
                  Персональная ссылка для клиента
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateLinkModalOpen(false)}
                className="p-1 border border-white/10 hover:border-white/30 text-white/60 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed m-0">
              Заполните данные клиента, чтобы при переходе по ссылке поля с именем, компанией и услугами были уже предзаполнены.
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">Имя клиента</label>
                <input
                  type="text"
                  value={linkClientName}
                  onChange={(e) => setLinkClientName(e.target.value)}
                  placeholder="Например: Сайёра Аюпова или Роман"
                  className="w-full px-3 py-2 border border-white/15 bg-black/40 text-white outline-none focus:border-[#FD4B32]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Компания / Бренд</label>
                <input
                  type="text"
                  value={linkClientCompany}
                  onChange={(e) => setLinkClientCompany(e.target.value)}
                  placeholder="Например: Compass"
                  className="w-full px-3 py-2 border border-white/15 bg-black/40 text-white outline-none focus:border-[#FD4B32]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Должность / Роль</label>
                <input
                  type="text"
                  value={linkClientRole}
                  onChange={(e) => setLinkClientRole(e.target.value)}
                  placeholder="Например: Управляющий партнер"
                  className="w-full px-3 py-2 border border-white/15 bg-black/40 text-white outline-none focus:border-[#FD4B32]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">Услуги</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_SERVICES.map((s) => {
                    const sel = linkClientServices.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setLinkClientServices((prev) =>
                            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                          )
                        }
                        className={`px-2.5 py-1 rounded-full border text-[11px] cursor-pointer transition-colors ${
                          sel ? 'bg-[#FD4B32] text-white border-[#FD4B32]' : 'bg-white/5 border-white/15 text-white/70 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="font-semibold block mb-1 text-white/90">Готовая ссылка для отправки клиенту:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generateShareLink()}
                    className="w-full px-3 py-2 border border-white/15 bg-black/60 text-white font-mono text-[11px] select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generateShareLink());
                      setCopiedLinkSuccess(true);
                      setTimeout(() => setCopiedLinkSuccess(false), 2500);
                    }}
                    className="px-4 py-2 bg-[#FD4B32] hover:bg-[#E63A22] text-white font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedLinkSuccess ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    <span>{copiedLinkSuccess ? 'Скопировано!' : 'Копировать'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
