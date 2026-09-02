export type LeadStatus = 'new' | 'contacted' | 'meeting' | 'proposal' | 'won' | 'lost';

export type LeadPriority = 'normal' | 'high' | 'urgent';

export type LeadSource = 'contacts_form' | 'service_modal' | 'case_inquiry' | 'calculator' | 'manual' | 'threads_landing' | 'en_landing';

export interface LeadNote {
  id: string;
  text: string;
  createdAt: string;
  author?: string;
}

export interface LeadActivity {
  id: string;
  type: 'created' | 'status_change' | 'priority_change' | 'note_added' | 'budget_change' | 'webhook_sent';
  description: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  rawPhone: string;
  email?: string;
  services: string[];
  message?: string;
  status: LeadStatus;
  priority: LeadPriority;
  budget?: string;
  source: LeadSource;
  sourceDetails?: string;
  pageUrl: string;
  referrer?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  createdAt: string;
  updatedAt: string;
  notes: LeadNote[];
  activities: LeadActivity[];
}

export interface CreateLeadPayload {
  name: string;
  phone: string;
  email?: string;
  services?: string[];
  message?: string;
  source?: LeadSource;
  sourceDetails?: string;
  budget?: string;
  priority?: LeadPriority;
}

export interface CrmSettings {
  telegramBotToken: string;
  telegramChatId: string;
  telegramEnabled: boolean;
  customWebhookUrl: string;
  customWebhookEnabled: boolean;
  soundAlerts: boolean;
  desktopNotifications: boolean;
  currency: string;
}

export interface CrmStats {
  totalLeads: number;
  newLeads: number;
  inProgressLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  totalEstimatedBudget: number;
  servicesBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  todayLeadsCount: number;
}
