import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Check,
  Upload,
  X,
  ArrowRight,
  Sparkles,
  Send,
  MessageSquare,
  Building2,
  User,
  Briefcase,
  Globe,
  Phone,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { submitClientReview } from '../../lib/reviewStore';
import type { CreateReviewPayload } from '../../lib/reviewTypes';

interface ReviewFormProps {
  theme?: 'dark' | 'light';
}

const AVAILABLE_SERVICES = [
  'Сайты',
  'Айдентика',
  'Полиграфия',
  'SMM',
  'Презентации',
  'Сопровождение',
  'Упаковка',
  'UI/UX Дизайн',
];

const RATING_LABELS: Record<number, string> = {
  1: 'Были трудности',
  2: 'Ниже ожиданий',
  3: 'Хорошо, в рамках задачи',
  4: 'Отличная работа',
  5: 'Превзошло все ожидания! ⭐️',
};

export default function ReviewForm({ theme = 'dark' }: ReviewFormProps) {
  const isLight = theme === 'light';

  // Form State
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [contact, setContact] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>(['Сайты']);
  const [quote, setQuote] = useState('');
  const [formatMode, setFormatMode] = useState<'structured' | 'freeform'>('structured');
  const [likedMost, setLikedMost] = useState('');
  const [likedSpecial, setLikedSpecial] = useState('');
  const [toImprove, setToImprove] = useState('');
  const [businessResults, setBusinessResults] = useState('');
  const [fullReviewText, setFullReviewText] = useState('');
  const [allowPublish, setAllowPublish] = useState(true);

  // Status & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL Query Parameters prefill
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlName = params.get('name') || params.get('author');
      const urlCompany = params.get('company') || params.get('brand');
      const urlRole = params.get('role') || params.get('position');
      const urlProject = params.get('project') || params.get('url') || params.get('website');
      const urlServices = params.get('services');

      if (urlName) setAuthor(urlName);
      if (urlCompany) setCompany(urlCompany);
      if (urlRole) setRole(urlRole);
      if (urlProject) setWebsiteUrl(urlProject);
      if (urlServices) {
        const parsed = urlServices.split(',').map((s) => s.trim()).filter(Boolean);
        if (parsed.length > 0) setSelectedServices(parsed);
      }
    } catch {
      // ignore URL parsing errors
    }
  }, []);

  const toggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: 'Размер фото не должен превышать 5 МБ' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(String(reader.result));
      setErrors((prev) => {
        const { avatar, ...rest } = prev;
        return rest;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const digits = contact.replace(/\D/g, '');
    if (!contact.trim() || digits.length < 7 || digits.length > 15) {
      newErrors.contact = 'Пожалуйста, укажите полный номер телефона';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`${firstKey}-input`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const payload: CreateReviewPayload = {
      author,
      role,
      company,
      websiteUrl,
      contact,
      avatar: avatarPreview || undefined,
      rating,
      services: selectedServices.length > 0 ? selectedServices : ['Сайты'],
      quote,
      formatMode,
      likedMost: formatMode === 'structured' ? likedMost : undefined,
      likedSpecial: formatMode === 'structured' ? likedSpecial : undefined,
      toImprove: formatMode === 'structured' ? toImprove : undefined,
      businessResults: formatMode === 'structured' ? businessResults : undefined,
      fullReviewText: formatMode === 'freeform' ? fullReviewText : undefined,
      allowPublish,
    };

    try {
      await submitClientReview(payload);
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submit review error:', err);
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAuthor('');
    setRole('');
    setCompany('');
    setWebsiteUrl('');
    setContact('');
    setAvatarPreview('');
    setRating(5);
    setSelectedServices(['Сайты']);
    setQuote('');
    setLikedMost('');
    setLikedSpecial('');
    setToImprove('');
    setBusinessResults('');
    setFullReviewText('');
    setAllowPublish(true);
    setErrors({});
    setIsSubmitted(false);
  };

  const activeRatingDisplay = hoverRating || rating;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          /* ================= SUCCESS STATE ================= */
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full border p-8 sm:p-12 md:p-16 text-center flex flex-col items-center justify-center ${
              isLight
                ? 'bg-white border-[#D5D2CE] text-[#1D1D1D] shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
                : 'bg-[#0B0B0C] border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            }`}
          >
            {/* Success Icon */}
            <div className="size-20 sm:size-24 rounded-full bg-[#FD4B32]/10 border border-[#FD4B32]/30 flex items-center justify-center mb-8 relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CheckCircle2 className="size-10 sm:size-12 text-[#FD4B32]" strokeWidth={2} />
              </motion.div>
            </div>

            {/* Title */}
            <h2
              className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-[-0.03em] m-0 mb-4 max-w-2xl leading-[1.05]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Большое спасибо за ваш отзыв!
            </h2>

            {/* Subtitle */}
            <p
              className={`text-base sm:text-lg md:text-xl max-w-xl mb-8 leading-relaxed ${
                isLight ? 'text-[#66635F]' : 'text-white/70'
              }`}
            >
              {author ? `${author}, ваша` : 'Ваша'} обратная связь уже доставлена команде студии.
              Для нас это огромная ценность и главный ориентир в развитии.
            </p>

            {/* Review Summary Card */}
            <div
              className={`w-full max-w-lg p-6 mb-10 text-left border ${
                isLight ? 'bg-[#F7F5F2] border-[#E2DED9]' : 'bg-white/[0.03] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-3 border-b pb-3 border-inherit">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm sm:text-base">{company || 'Проект'}</span>
                  <span className={`text-xs ${isLight ? 'text-black/60' : 'text-white/60'}`}>
                    {author} · {role}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#FD4B32]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4"
                      fill={i < rating ? 'currentColor' : 'none'}
                      stroke="currentColor"
                    />
                  ))}
                </div>
              </div>
              <p
                className={`italic text-sm sm:text-base m-0 ${
                  isLight ? 'text-[#1D1D1D]/90' : 'text-white/90'
                }`}
              >
                «{quote}»
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1D1D1D] hover:bg-[#FD4B32] text-white text-sm font-semibold transition-all duration-300 transform active:scale-95 shadow-md no-underline"
              >
                <span>На главную Yapil.art</span>
                <ArrowRight className="size-4" />
              </a>

              <button
                type="button"
                onClick={handleReset}
                className={`inline-flex items-center gap-2 px-6 py-4 border text-sm font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'border-[#D5D2CE] text-[#1D1D1D] hover:bg-[#EDEAE6]'
                    : 'border-white/15 text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <RotateCcw className="size-4" />
                <span>Заполнить ещё раз</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ================= MAIN REVIEW FORM ================= */
          <form
            onSubmit={handleSubmit}
            noValidate
            className={`w-full border p-6 sm:p-10 md:p-12 transition-colors duration-300 ${
              isLight
                ? 'bg-white border-[#D5D2CE] text-[#1D1D1D] shadow-[0_20px_40px_rgba(0,0,0,0.06)]'
                : 'bg-[#0B0B0C] border-white/10 text-white shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
            }`}
          >
            {/* ================= STEP 1: CLIENT & PROJECT INFO ================= */}
            <section className="mb-10 sm:mb-12">
              <div className="flex items-center gap-3 border-b pb-4 mb-6 border-inherit">
                <span className="font-mono text-xs font-bold text-[#FD4B32] tracking-widest uppercase">
                  01 / Информация
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold m-0 tracking-tight">
                  О вас и вашем проекте
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {/* 1. Name & Surname */}
                <div className="flex flex-col gap-1.5" id="field-author">
                  <label className="text-xs sm:text-sm font-semibold flex items-center justify-between" htmlFor="author-input">
                    <span>
                      Имя и Фамилия
                    </span>
                    <span className={`text-[11px] font-normal ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                      Как указать в отзыве
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="author-input"
                      type="text"
                      value={author}
                      onChange={(e) => {
                        setAuthor(e.target.value);
                        if (errors.author) setErrors((prev) => ({ ...prev, author: '' }));
                      }}
                      placeholder="Например: Роман Рыкунов или Сайёра Аюпова"
                      className={`w-full px-4 py-3 text-sm sm:text-base border outline-none transition-all ${
                        isLight
                          ? 'bg-[#FDFDFD] text-[#1D1D1D] border-[#D5D2CE] focus:border-[#FD4B32] focus:ring-1 focus:ring-[#FD4B32]'
                          : 'bg-white/[0.04] text-white border-white/15 focus:border-[#FD4B32] focus:ring-1 focus:ring-[#FD4B32]'
                      } ${errors.author ? 'border-red-500 bg-red-500/5' : ''}`}
                    />
                  </div>
                  {errors.author && <span className="text-xs text-red-500 mt-1">{errors.author}</span>}
                </div>

                {/* 2. Role in Company */}
                <div className="flex flex-col gap-1.5" id="field-role">
                  <label className="text-xs sm:text-sm font-semibold flex items-center justify-between" htmlFor="role-input">
                    <span>
                      Ваша должность / Роль
                    </span>
                    <span className={`text-[11px] font-normal ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                      Основатель, Продюсер...
                    </span>
                  </label>
                  <input
                    id="role-input"
                    type="text"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
                    }}
                    placeholder="Например: Управляющий партнер / CEO / Арт-директор"
                    className={`w-full px-4 py-3 text-sm sm:text-base border outline-none transition-all ${
                      isLight
                        ? 'bg-[#FDFDFD] text-[#1D1D1D] border-[#D5D2CE] focus:border-[#FD4B32] focus:ring-1 focus:ring-[#FD4B32]'
                        : 'bg-white/[0.04] text-white border-white/15 focus:border-[#FD4B32] focus:ring-1 focus:ring-[#FD4B32]'
                    } ${errors.role ? 'border-red-500 bg-red-500/5' : ''}`}
                  />
                  {errors.role && <span className="text-xs text-red-500 mt-1">{errors.role}</span>}
                </div>

                {/* 3. Company / Brand */}
                <div className="flex flex-col gap-1.5" id="field-company">
                  <label className="text-xs sm:text-sm font-semibold flex items-center justify-between" htmlFor="company-input">
                    <span>
                      Компания / Бренд
                    </span>
                    <span className={`text-[11px] font-normal ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                      Название проекта
                    </span>
                  </label>
                  <input
                    id="company-input"
                    type="text"
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      if (errors.company) setErrors((prev) => ({ ...prev, company: '' }));
                    }}
                    placeholder="Например: Compass или Рыкунов и Кудряшов"
                    className={`w-full px-4 py-3 text-sm sm:text-base border outline-none transition-all ${
                      isLight
                        ? 'bg-[#FDFDFD] text-[#1D1D1D] border-[#D5D2CE] focus:border-[#FD4B32] focus:ring-1 focus:ring-[#FD4B32]'
                        : 'bg-white/[0.04] text-white border-white/15 focus:border-[#FD4B32] focus:ring-1 focus:ring-[#FD4B32]'
                    } ${errors.company ? 'border-red-500 bg-red-500/5' : ''}`}
                  />
                  {errors.company && <span className="text-xs text-red-500 mt-1">{errors.company}</span>}
                </div>

                {/* 4. Website or Social Link */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-semibold flex items-center justify-between" htmlFor="website-input">
                    <span>Сайт или соцсети компании</span>
                    <span className={`text-[11px] font-normal ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                      Опционально
                    </span>
                  </label>
                  <input
                    id="website-input"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourcompany.com или @username"
                    className={`w-full px-4 py-3 text-sm sm:text-base border outline-none transition-all ${
                      isLight
                        ? 'bg-[#FDFDFD] text-[#1D1D1D] border-[#D5D2CE] focus:border-[#FD4B32]'
                        : 'bg-white/[0.04] text-white border-white/15 focus:border-[#FD4B32]'
                    }`}
                  />
                </div>

                {/* 5. Phone */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs sm:text-sm font-semibold flex items-center justify-between" htmlFor="contact-input">
                    <span>Номер телефона <span className="text-[#FD4B32]">*</span></span>
                    <span className={`text-[11px] font-normal ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                      Только для связи студии с вами (не публикуется)
                    </span>
                  </label>
                  <input
                    id="contact-input"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    aria-invalid={Boolean(errors.contact)}
                    aria-describedby="contact-error"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      if (errors.contact) setErrors((prev) => ({ ...prev, contact: '' }));
                    }}
                    placeholder="+7 (___) ___-__-__"
                    className={`w-full px-4 py-3 text-sm sm:text-base border outline-none transition-all ${
                      isLight
                        ? 'bg-[#FDFDFD] text-[#1D1D1D] border-[#D5D2CE] focus:border-[#FD4B32]'
                        : 'bg-white/[0.04] text-white border-white/15 focus:border-[#FD4B32]'
                    }`}
                  />
                  <span id="contact-error" className="text-xs text-red-500" aria-live="polite">{errors.contact}</span>
                </div>

                {/* 6. Photo / Avatar Upload */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-xs sm:text-sm font-semibold flex items-center justify-between">
                    <span>Ваше фото или логотип компании</span>
                    <span className={`text-[11px] font-normal ${isLight ? 'text-black/40' : 'text-white/40'}`}>
                      Отображается рядом с отзывом
                    </span>
                  </label>

                  <div className="flex flex-wrap items-center gap-4">
                    {avatarPreview ? (
                      <div className="relative size-16 sm:size-20 border border-inherit flex-shrink-0 group overflow-hidden bg-black/10">
                        <img
                          src={avatarPreview}
                          alt="Предпросмотр аватара"
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          title="Удалить фото"
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="size-5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`size-16 sm:size-20 border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isLight
                            ? 'border-black/20 hover:border-[#FD4B32] hover:bg-black/5 text-black/50 hover:text-[#FD4B32]'
                            : 'border-white/20 hover:border-[#FD4B32] hover:bg-white/5 text-white/50 hover:text-[#FD4B32]'
                        }`}
                      >
                        <Upload className="size-5" />
                        <span className="text-[10px] mt-1 font-medium">Загрузить</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`text-xs font-semibold underline underline-offset-4 self-start bg-transparent border-0 p-0 cursor-pointer transition-colors ${
                          isLight ? 'text-[#1D1D1D] hover:text-[#FD4B32]' : 'text-white hover:text-[#FD4B32]'
                        }`}
                      >
                        {avatarPreview ? 'Выбрать другое фото' : 'Прикрепить фотографию (PNG, JPG, WebP)'}
                      </button>
                      <span className={`text-[11px] ${isLight ? 'text-black/50' : 'text-white/50'}`}>
                        Рекомендуется квадратное фото высокого качества (до 5 МБ)
                      </span>
                    </div>
                  </div>
                  {errors.avatar && <span className="text-xs text-red-500">{errors.avatar}</span>}
                </div>
              </div>
            </section>

            {/* ================= STEP 2: SERVICES & RATING ================= */}
            <section className="mb-10 sm:mb-12">
              <div className="flex items-center gap-3 border-b pb-4 mb-6 border-inherit">
                <span className="font-mono text-xs font-bold text-[#FD4B32] tracking-widest uppercase">
                  02 / Оценка и Услуги
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold m-0 tracking-tight">
                  Что мы реализовали и общие впечатления
                </h3>
              </div>

              {/* Service Chips */}
              <div className="mb-8">
                <label className="text-xs sm:text-sm font-semibold block mb-3">
                  Какие задачи / услуги выполняла студия?
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SERVICES.map((svc) => {
                    const isSelected = selectedServices.includes(svc);
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleService(svc)}
                        className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-[100px] border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#1D1D1D] text-white border-[#1D1D1D] dark:bg-[#FD4B32] dark:border-[#FD4B32]'
                            : isLight
                            ? 'bg-[#F6F4F2] text-[#1D1D1D] border-[#E2DED9] hover:border-[#1D1D1D]'
                            : 'bg-white/[0.04] text-white/80 border-white/15 hover:border-white/40 hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="size-3.5 stroke-[2.5]" />}
                        <span>{svc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating with Stars */}
              <div className="flex flex-col gap-3">
                <label className="text-xs sm:text-sm font-semibold flex items-center justify-between">
                  <span>Общая оценка работы студии Yapil</span>
                  <span className="text-xs sm:text-sm font-bold text-[#FD4B32]">
                    {RATING_LABELS[activeRatingDisplay]}
                  </span>
                </label>

                <div className="flex items-center gap-2 sm:gap-3 py-2">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled = starValue <= activeRatingDisplay;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(starValue)}
                        aria-label={`Оценка ${starValue} из 5`}
                        className="p-1 sm:p-2 bg-transparent border-0 cursor-pointer transform hover:scale-115 active:scale-95 transition-transform duration-150 focus:outline-none"
                      >
                        <Star
                          className={`size-7 sm:size-9 transition-colors duration-200 ${
                            isFilled
                              ? 'text-[#FD4B32] fill-[#FD4B32]'
                              : isLight
                              ? 'text-black/20 fill-transparent'
                              : 'text-white/20 fill-transparent'
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ================= STEP 3: REVIEW TEXT ================= */}
            <section className="mb-10 sm:mb-12">
              <div className="flex items-center gap-3 border-b pb-4 mb-6 border-inherit">
                <span className="font-mono text-xs font-bold text-[#FD4B32] tracking-widest uppercase">
                  03 / Текст отзыва
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold m-0 tracking-tight">
                  Ваши впечатления и детали
                </h3>
              </div>

              {/* Key Quote / Summary (High-Priority for Main Page Carousel) */}
              <div className="flex flex-col gap-1.5 mb-8" id="field-quote">
                <label className="text-xs sm:text-sm font-semibold flex items-center justify-between" htmlFor="quote-input">
                  <span>
                    Главное впечатление в 1–3 предложениях
                  </span>
                  <span className={`text-[11px] font-normal ${isLight ? 'text-black/50' : 'text-white/50'}`}>
                    Цитата для главного слайдера
                  </span>
                </label>
                <textarea
                  id="quote-input"
                  rows={3}
                  value={quote}
                  onChange={(e) => {
                    setQuote(e.target.value);
                    if (errors.quote) setErrors((prev) => ({ ...prev, quote: '' }));
                  }}
                  placeholder="Сотрудничеством очень довольны! Яков предложил современный визуальный язык, точно попал в бриф и сделал проект в сжатые сроки..."
                  className={`w-full px-4 py-3 text-sm sm:text-base border outline-none transition-all leading-relaxed ${
                    isLight
                      ? 'bg-[#FDFDFD] text-[#1D1D1D] border-[#D5D2CE] focus:border-[#FD4B32] focus:ring-1 focus:ring-[#FD4B32]'
                      : 'bg-white/[0.04] text-white border-white/15 focus:border-[#FD4B32] focus:ring-1 focus:ring-[#FD4B32]'
                  } ${errors.quote ? 'border-red-500 bg-red-500/5' : ''}`}
                />
                {errors.quote && <span className="text-xs text-red-500 mt-1">{errors.quote}</span>}
              </div>

              {/* Mode Switcher: Structured Questions vs Freeform */}
              <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs sm:text-sm font-semibold">
                  Формат подробного рассказа:
                </span>
                <div
                  className={`inline-flex border p-0.5 text-xs font-medium ${
                    isLight ? 'border-[#D5D2CE] bg-[#F6F4F2]' : 'border-white/15 bg-white/5'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setFormatMode('structured')}
                    className={`px-3 py-1.5 transition-all cursor-pointer ${
                      formatMode === 'structured'
                        ? 'bg-[#FD4B32] text-white shadow-sm'
                        : isLight
                        ? 'text-black/70 hover:text-black'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    По вопросам (рекомендуем)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormatMode('freeform')}
                    className={`px-3 py-1.5 transition-all cursor-pointer ${
                      formatMode === 'freeform'
                        ? 'bg-[#FD4B32] text-white shadow-sm'
                        : isLight
                        ? 'text-black/70 hover:text-black'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Свободный текст
                  </button>
                </div>
              </div>

              {/* Mode 1: Structured Questions */}
              {formatMode === 'structured' ? (
                <div className="space-y-6" id="field-structured">
                  {/* 1. What liked most? */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                      <span className="text-[#FD4B32] font-bold">1.</span>
                      <span>Что понравилось больше всего?</span>
                    </label>
                    <textarea
                      rows={3}
                      value={likedMost}
                      onChange={(e) => {
                        setLikedMost(e.target.value);
                        if (errors.structured) setErrors((prev) => ({ ...prev, structured: '' }));
                      }}
                      placeholder="Например: Попадание в бриф с первого раза, скорость обратной связи, чистота и эстетика вёрстки..."
                      className={`w-full px-4 py-3 text-sm border outline-none transition-all leading-relaxed ${
                        isLight
                          ? 'bg-[#FDFDFD] text-[#1D1D1D] border-[#D5D2CE] focus:border-[#FD4B32]'
                          : 'bg-white/[0.04] text-white border-white/15 focus:border-[#FD4B32]'
                      }`}
                    />
                  </div>

                  {/* 2. What liked special? */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                      <span className="text-[#FD4B32] font-bold">2.</span>
                      <span>Что особенно запомнилось или приятно удивило?</span>
                    </label>
                    <textarea
                      rows={2}
                      value={likedSpecial}
                      onChange={(e) => setLikedSpecial(e.target.value)}
                      placeholder="Например: Человечный подход, внимание к мельчайшим деталям, помощь с печатью..."
                      className={`w-full px-4 py-3 text-sm border outline-none transition-all leading-relaxed ${
                        isLight
                          ? 'bg-[#FDFDFD] text-[#1D1D1D] border-[#D5D2CE] focus:border-[#FD4B32]'
                          : 'bg-white/[0.04] text-white border-white/15 focus:border-[#FD4B32]'
                      }`}
                    />
                  </div>

                  {/* 3. What to improve? (Constructive feedback) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-[#FD4B32] font-bold">3.</span>
                        <span>Что можно улучшить или доработать?</span>
                      </span>
                      <span className={`text-[11px] font-normal ${isLight ? 'text-black/50' : 'text-white/50'}`}>
                        Честная обратная связь помогает нам расти
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      value={toImprove}
                      onChange={(e) => setToImprove(e.target.value)}
                      placeholder="Например: Хотелось бы чуть больше вариантов на первом этапе, либо строже фиксировать дедлайны по проверке..."
                      className={`w-full px-4 py-3 text-sm border outline-none transition-all leading-relaxed ${
                        isLight
                          ? 'bg-[#FDFDFD] text-[#1D1D1D] border-[#D5D2CE] focus:border-[#FD4B32]'
                          : 'bg-white/[0.04] text-white border-white/15 focus:border-[#FD4B32]'
                      }`}
                    />
                  </div>

                  {/* 4. Business Results */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                      <span className="text-[#FD4B32] font-bold">4.</span>
                      <span>Результаты проекта для вашего бизнеса</span>
                    </label>
                    <textarea
                      rows={2}
                      value={businessResults}
                      onChange={(e) => setBusinessResults(e.target.value)}
                      placeholder="Например: Увеличилась конверсия в заявку, клиенты делают комплименты брендингу, успешно презентовали проект инвесторам..."
                      className={`w-full px-4 py-3 text-sm border outline-none transition-all leading-relaxed ${
                        isLight
                          ? 'bg-[#FDFDFD] text-[#1D1D1D] border-[#D5D2CE] focus:border-[#FD4B32]'
                          : 'bg-white/[0.04] text-white border-white/15 focus:border-[#FD4B32]'
                      }`}
                    />
                  </div>

                  {errors.structured && (
                    <span className="text-xs text-red-500 block">{errors.structured}</span>
                  )}
                </div>
              ) : (
                /* Mode 2: Freeform */
                <div className="flex flex-col gap-1.5" id="field-freeform">
                  <label className="text-xs sm:text-sm font-semibold" htmlFor="freeform-input">
                    Развернутый рассказ о сотрудничестве
                  </label>
                  <textarea
                    id="freeform-input"
                    rows={7}
                    value={fullReviewText}
                    onChange={(e) => {
                      setFullReviewText(e.target.value);
                      if (errors.freeform) setErrors((prev) => ({ ...prev, freeform: '' }));
                    }}
                    placeholder="Расскажите обо всем процессе работы: как начинался проект, как проходило согласование концепций, какие впечатления от результата..."
                    className={`w-full px-4 py-3 text-sm sm:text-base border outline-none transition-all leading-relaxed ${
                      isLight
                        ? 'bg-[#FDFDFD] text-[#1D1D1D] border-[#D5D2CE] focus:border-[#FD4B32]'
                        : 'bg-white/[0.04] text-white border-white/15 focus:border-[#FD4B32]'
                    } ${errors.freeform ? 'border-red-500 bg-red-500/5' : ''}`}
                  />
                  {errors.freeform && <span className="text-xs text-red-500 mt-1">{errors.freeform}</span>}
                </div>
              )}
            </section>

            {/* ================= STEP 4: CONSENT & SUBMIT ================= */}
            <section className="pt-6 border-t border-inherit flex flex-col gap-6">
              {/* Permission Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowPublish}
                  onChange={(e) => setAllowPublish(e.target.checked)}
                  className="size-4.5 mt-0.5 accent-[#FD4B32] cursor-pointer"
                />
                <span className={`text-xs sm:text-sm leading-snug ${isLight ? 'text-black/80' : 'text-white/80'}`}>
                  Разрешаю опубликовать отзыв, мое имя и логотип/фото на сайте <strong>yapil.art</strong> и в соцсетях студии Yapil.
                </span>
              </label>

              {/* Submit Button */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#1D1D1D] hover:bg-[#FD4B32] text-white text-base font-semibold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(0,0,0,0.15)] cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Отправка отзыва...</span>
                  ) : (
                    <>
                      <span>Отправить отзыв</span>
                      <Send className="size-4 text-[#FD4B32] group-hover:text-white" />
                    </>
                  )}
                </button>

                <p className={`text-xs m-0 ${isLight ? 'text-black/50' : 'text-white/50'}`}>
                  Отправка безопасна · Студия Yapil {new Date().getFullYear()}
                </p>
              </div>
            </section>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
