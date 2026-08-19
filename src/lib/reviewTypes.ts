export type ReviewStatus = 'new' | 'reviewed' | 'approved' | 'published' | 'archived';

export interface ReviewSectionData {
  title: string;
  items?: string[];
  text?: string;
}

export interface ClientReview {
  id: string;
  author: string;
  role: string;
  company: string;
  websiteUrl?: string;
  contact?: string; // Telegram / Phone / Email
  avatar?: string; // Base64 data URL or external URL
  rating: number; // 1 to 5
  services: string[]; // e.g. ['Сайты', 'Айдентика']
  quote: string; // Brief quote (key highlight for main slider)
  formatMode: 'structured' | 'freeform';
  fullReviewText?: string;
  likedMost?: string; // Что понравилось?
  likedSpecial?: string; // Что очень понравилось?
  toImprove?: string; // Что можно улучшить?
  businessResults?: string; // Результаты проекта
  allowPublish: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  pageUrl?: string;
  notes?: string;
}

export interface CreateReviewPayload {
  author: string;
  role: string;
  company: string;
  websiteUrl?: string;
  contact?: string;
  avatar?: string;
  rating: number;
  services: string[];
  quote: string;
  formatMode: 'structured' | 'freeform';
  fullReviewText?: string;
  likedMost?: string;
  likedSpecial?: string;
  toImprove?: string;
  businessResults?: string;
  allowPublish: boolean;
}

export interface ReviewStats {
  total: number;
  newCount: number;
  publishedCount: number;
  avgRating: number;
  fiveStarPercent: number;
}
