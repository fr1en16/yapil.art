import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Check, X, RotateCcw } from 'lucide-react';

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  caseBadge: string;
  caseLink: string;
  image: string;
  color: string;
}

export const services: ServiceItem[] = [
  {
    id: 'websites',
    number: '01',
    title: 'Сайты',
    description: 'Проектируем структуру, рисуем макеты, верстаем, запускаем. Делаем лендинги, интернет-магазины, сервисы.',
    caseBadge: 'Кейс // Compass',
    caseLink: '/case/compass',
    image: 'https://media.yapil.art/services/%D1%81%D0%B0%D0%B9%D1%82%D1%8B.webp',
    color: '#141416',
  },
  {
    id: 'identity',
    number: '02',
    title: 'Айдентика',
    description: 'Придумываем логотип, типографику, графический язык. Собираем брендбук, по которому ваш подрядчик соберёт макет без вопросов к нам.',
    caseBadge: 'Кейс // Compass Management',
    caseLink: '/case/compass-management',
    image: 'https://media.yapil.art/services/%D0%B0%D0%B9%D0%B4%D0%B5%D0%BD%D1%82%D0%B8%D0%BA%D0%B0.webp',
    color: '#141416',
  },
  {
    id: 'print',
    number: '03',
    title: 'Полиграфия',
    description: 'Разрабатываем упаковку, POS-материалы, мерч, многостраничные издания. Готовим файлы к печати, проверяем цветопробу в типографии.',
    caseBadge: 'Кейс // Shanding',
    caseLink: '/case/shanding',
    image: 'https://media.yapil.art/services/%D0%BF%D0%BE%D0%BB%D0%B8%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%8F.webp',
    color: '#141416',
  },
  {
    id: 'smm',
    number: '04',
    title: 'SMM',
    description: 'Собираем концепцию профиля, шаблоны постов, рекламные креативы, сторис.',
    caseBadge: 'Кейс // Gippo',
    caseLink: '/case/gippo',
    image: 'https://media.yapil.art/services/smm.webp',
    color: '#141416',
  },
  {
    id: 'presentations',
    number: '05',
    title: 'Презентации',
    description: 'Оформляем инвест-питчи, коммерческие предложения, годовые отчёты. Переводим цифры в схемы, графики, инфографику.',
    caseBadge: 'Кейс // Parking24',
    caseLink: '/case/parking24',
    image: 'https://media.yapil.art/services/%D0%BF%D1%80%D0%B5%D0%B7%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D0%B8.webp',
    color: '#141416',
  },
];

const ALL_SERVICE_CHIPS = ['Сайты', 'Айдентика', 'Полиграфия', 'SMM', 'Презентации', 'Поддержка'];

const scaleAnimation = {
  initial: { scale: 0, x: '-50%', y: '-50%' },
  enter: {
    scale: 1,
    transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] as const },
    x: '-50%',
    y: '-50%',
  },
  closed: {
    scale: 0,
    transition: { duration: 0.35, ease: [0.32, 0, 0.67, 0] as const },
    x: '-50%',
    y: '-50%',
  },
};

export default function ServicesAnimatedModal({
  theme = 'dark',
}: {
  theme?: 'dark' | 'light';
}) {
  const isLight = theme === 'light';
  const [hoverModal, setHoverModal] = useState<{ active: boolean; index: number }>({
    active: false,
    index: 0,
  });
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceItem | null>(null);
  const reduceMotion = useReducedMotion();

  const handleOpenModal = (service: ServiceItem) => {
    setHoverModal((prev) => ({ ...prev, active: false }));
    setActiveServiceModal(service);
  };

  const handleCloseModal = () => {
    setActiveServiceModal(null);
  };

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className={`relative z-10 py-20 md:py-32 overflow-hidden transition-colors duration-300 ${
        isLight ? 'text-[#1D1D1D]' : 'text-white'
      }`}
      style={{
        background: isLight
          ? 'linear-gradient(to bottom, #F7F5F2 0%, #F0ECE7 50%, #EAE5DF 100%)'
          : 'linear-gradient(to bottom, #181818 0%, #121213 50%, #0b0b0c 100%)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 md:mb-18 grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-[var(--grid-gap)] md:items-end">
          <div className="col-span-1 md:col-span-7">
            <h2
              id="services-title"
              className={`text-[clamp(2.75rem,7vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.045em] m-0 ${
                isLight ? 'text-[#1D1D1D]' : 'text-white'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Услуги
            </h2>
          </div>
          <p
            className={`col-span-1 md:col-start-8 md:col-span-5 text-base md:text-lg leading-[1.3] m-0 ${
              isLight ? 'text-[#1D1D1D]/65' : 'text-white/60'
            }`}
          >
            Собираем сайты, бренды и коммуникации — от стратегии до ежедневного контента.
            Нажмите на услугу, чтобы обсудить задачу и заказать проект.
          </p>
        </div>

        {/* Interactive Services List */}
        <div
          className={`relative flex flex-col ${isLight ? 'border-t border-black/10' : 'border-t border-white/15'}`}
          role="list"
        >
          {services.map((item, index) => (
            <ServiceRow
              key={item.id}
              item={item}
              index={index}
              isLight={isLight}
              setHoverModal={setHoverModal}
              onOpenModal={handleOpenModal}
            />
          ))}
        </div>

        {/* Floating Modal Preview & Magnetic Cursor (only if no active dialog) */}
        {!reduceMotion && !activeServiceModal && (
          <HoverModalPreview modal={hoverModal} services={services} isLight={isLight} />
        )}
      </div>

      {/* Pop-up Service Application Modal */}
      <AnimatePresence>
        {activeServiceModal && (
          <ServiceApplicationModal
            service={activeServiceModal}
            isLight={isLight}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ServiceRow({
  item,
  index,
  isLight = false,
  setHoverModal,
  onOpenModal,
}: {
  item: ServiceItem;
  index: number;
  isLight?: boolean;
  setHoverModal: React.Dispatch<React.SetStateAction<{ active: boolean; index: number }>>;
  onOpenModal: (service: ServiceItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenModal(item)}
      className={`group relative flex flex-col md:flex-row md:items-center justify-between py-8 sm:py-10 md:py-12 transition-all duration-300 px-2 sm:px-4 cursor-pointer text-inherit no-underline text-left w-full bg-transparent appearance-none border-t-0 border-l-0 border-r-0 ${
        isLight
          ? 'border-b border-black/10 hover:bg-black/[0.02]'
          : 'border-b border-white/15 hover:bg-white/[0.02]'
      }`}
      onMouseEnter={() => setHoverModal({ active: true, index })}
      onMouseLeave={() => setHoverModal({ active: false, index })}
      aria-label={`Услуга: ${item.title}. Нажмите, чтобы открыть форму заявки`}
      aria-haspopup="dialog"
    >
      {/* Left side: Number & Title */}
      <div className="flex items-baseline gap-4 sm:gap-8 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
        <span
          className={`font-mono text-sm sm:text-base transition-colors duration-300 ${
            isLight ? 'text-[#1D1D1D]/40 group-hover:text-[#FD4B32]' : 'text-white/40 group-hover:text-[#FD4B32]'
          }`}
        >
          {item.number}
        </span>
        <h3
          className={`m-0 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-none tracking-[-0.04em] transition-colors duration-300 ${
            isLight ? 'text-[#1D1D1D] group-hover:text-[#FD4B32]' : 'text-white group-hover:text-white'
          }`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {item.title}
        </h3>
      </div>

      {/* Right side: Description & Arrow */}
      <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 sm:gap-10 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-2">
        <div className="text-left md:text-right max-w-md lg:max-w-xl">
          <p
            className={`m-0 text-base leading-[1.3] transition-colors duration-300 text-pretty ${
              isLight
                ? 'text-[#1D1D1D]/60 group-hover:text-[#1D1D1D]/90'
                : 'text-white/55 group-hover:text-white/85'
            }`}
          >
            {item.description}
          </p>
        </div>

        <div
          className={`size-10 sm:size-12 rounded-none border flex items-center justify-center transition-all duration-300 shrink-0 ${
            isLight
              ? 'border-black/15 text-[#1D1D1D]/70 group-hover:border-[#FD4B32] group-hover:bg-[#FD4B32] group-hover:text-white'
              : 'border-white/20 text-white/60 group-hover:border-[#FD4B32] group-hover:bg-[#FD4B32] group-hover:text-white'
          }`}
        >
          <ArrowUpRight className="size-4 sm:size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </button>
  );
}

function HoverModalPreview({
  modal,
  services,
  isLight = false,
}: {
  modal: { active: boolean; index: number };
  services: ServiceItem[];
  isLight?: boolean;
}) {
  const { active, index } = modal;
  const modalContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const xMoveContainer = gsap.quickTo(modalContainer.current, 'left', {
      duration: 0.75,
      ease: 'power3.out',
    });
    const yMoveContainer = gsap.quickTo(modalContainer.current, 'top', {
      duration: 0.75,
      ease: 'power3.out',
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      xMoveContainer(clientX);
      yMoveContainer(clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      ref={modalContainer}
      variants={scaleAnimation}
      initial="initial"
      animate={active ? 'enter' : 'closed'}
      className={`pointer-events-none fixed z-30 hidden md:flex h-[22rem] w-[26rem] lg:h-[24rem] lg:w-[30rem] items-center justify-center overflow-hidden ${
        isLight
          ? 'border border-black/10 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)]'
          : 'border border-white/20 bg-[#161616] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]'
      }`}
    >
      <div
        className="absolute h-full w-full transition-[top] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ top: `${index * -100}%` }}
      >
        {services.map((item) => (
          <div
            key={item.id}
            className="relative flex h-full w-full items-center justify-center overflow-hidden"
            style={{ backgroundColor: item.color }}
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ServiceApplicationModal({
  service,
  isLight = false,
  onClose,
}: {
  service: ServiceItem;
  isLight?: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([service.title]);
  const [message, setMessage] = useState('');
  const [privacy, setPrivacy] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; privacy?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus trap, Escape listener, Lenis pause, and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('overflow-hidden');
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.stop();
    }

    // Focus first field
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove('overflow-hidden');
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.start();
      }
      clearTimeout(timer);
    };
  }, [onClose]);

  // Update preselected service if service prop changes
  useEffect(() => {
    setSelectedServices([service.title]);
  }, [service]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let digits = val.replace(/\D/g, '');
    if (!digits) {
      setPhone('');
      return;
    }

    // Handle paste when +7 prefix was already present (e.g. 78705... or 77705... with 12 digits)
    if (digits.length > 11 && (digits.startsWith('77') || digits.startsWith('78'))) {
      digits = digits.slice(1);
    }

    let raw = digits;
    if (raw.startsWith('8') || raw.startsWith('7')) {
      raw = '7' + raw.slice(1);
    } else {
      raw = '7' + raw;
    }
    raw = raw.slice(0, 11);

    let res = '+7';
    if (raw.length > 1) {
      res += ' (' + raw.slice(1, 4);
    }
    if (raw.length > 4) {
      res += ') ' + raw.slice(4, 7);
    }
    if (raw.length > 7) {
      res += '-' + raw.slice(7, 9);
    }
    if (raw.length > 9) {
      res += '-' + raw.slice(9, 11);
    }
    setPhone(res);
    if (errors.phone && raw.length === 11) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && phone.length <= 4) {
      setPhone('');
    }
  };

  const handleToggleService = (s: string) => {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string; privacy?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Пожалуйста, укажите ваше имя';
    }

    const digits = phone.replace(/\D/g, '');
    if (!phone.trim() || digits.length < 11) {
      newErrors.phone = 'Пожалуйста, укажите полный номер телефона';
    }

    if (!privacy) {
      newErrors.privacy = 'Необходимо согласие с политикой конфиденциальности';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const inquiryData = {
      name: name.trim(),
      phone: phone.trim(),
      services: selectedServices.length > 0 ? selectedServices : [service.title],
      message: message.trim(),
      sourceService: service.title,
      date: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem('yapil_inquiries') || '[]');
      stored.push(inquiryData);
      localStorage.setItem('yapil_inquiries', JSON.stringify(stored));
    } catch {
      // ignore localStorage errors
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 450);
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setSelectedServices([service.title]);
    setMessage('');
    setPrivacy(true);
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-service-title"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md pointer-events-none"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full max-w-xl md:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto overscroll-contain ${
          isLight
            ? 'bg-[#FAF8F5] border border-black/15 text-[#1D1D1D] shadow-[0_30px_90px_rgba(0,0,0,0.35)]'
            : 'bg-[#121214] border border-white/20 text-white shadow-[0_30px_90px_rgba(0,0,0,0.95)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Glow Top Border */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FD4B32] via-[#FD4B32]/70 to-[#FD4B32]" />

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-6 sm:p-8 md:p-10 space-y-6 overscroll-contain">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-baseline gap-3 sm:gap-4">
              <span className="font-mono text-base sm:text-lg text-[#FD4B32]">
                {service.number}
              </span>
              <h3
                id="modal-service-title"
                className={`text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.04em] m-0 ${
                  isLight ? 'text-[#1D1D1D]' : 'text-white'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {service.title}
              </h3>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 sm:p-2.5 -mr-2 -mt-2 transition-colors border border-transparent cursor-pointer ${
                isLight
                  ? 'text-black/50 hover:text-black hover:bg-black/10 hover:border-black/10'
                  : 'text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
              aria-label="Закрыть окно"
            >
              <X className="size-5 sm:size-6" />
            </button>
          </div>

          {isSubmitted ? (
            /* Success State */
            <div className="py-8 sm:py-10 text-center space-y-5">
              <div className="size-16 sm:size-20 mx-auto bg-[#FD4B32]/15 border border-[#FD4B32] text-[#FD4B32] flex items-center justify-center">
                <Check className="size-8 sm:size-10 stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <h4
                  className={`text-2xl sm:text-3xl font-normal m-0 ${
                    isLight ? 'text-[#1D1D1D]' : 'text-white'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Заявка успешно отправлена!
                </h4>
                <p
                  className={`text-sm sm:text-base max-w-md mx-auto m-0 leading-relaxed ${
                    isLight ? 'text-[#1D1D1D]/60' : 'text-white/60'
                  }`}
                >
                  Спасибо за обращение. Мы изучим вашу задачу по направлению «{service.title}» и ответим в ближайшие часы.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-[#FD4B32] hover:bg-[#E63A22] text-white font-medium text-sm transition-colors cursor-pointer border-0"
                >
                  Отлично, закрыть
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className={`w-full sm:w-auto px-6 py-3 font-medium text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 ${
                    isLight
                      ? 'bg-black/[0.05] hover:bg-black/10 text-[#1D1D1D]/75 hover:text-[#1D1D] border border-black/15'
                      : 'bg-white/[0.05] hover:bg-white/10 text-white/75 hover:text-white border border-white/15'
                  }`}
                >
                  <RotateCcw className="size-3.5" />
                  <span>Отправить ещё</span>
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Name & Phone in grid on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="service-name-input"
                    className={`block text-xs font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
                  >
                    Имя <span className="text-[#FD4B32]">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    id="service-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name && e.target.value.trim()) {
                        setErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    placeholder="Как к вам обращаться"
                    className={`w-full px-3.5 py-2.5 border text-sm focus:outline-none focus:border-[#FD4B32] transition-colors ${
                      isLight
                        ? `bg-white ${
                            errors.name ? 'border-red-500 bg-red-50' : 'border-black/15'
                          } text-[#1D1D1D] placeholder-black/30`
                        : `bg-white/[0.04] ${
                            errors.name ? 'border-red-500 bg-red-950/10' : 'border-white/15'
                          } text-white placeholder-white/30`
                    }`}
                    required
                  />
                  {errors.name && (
                    <span className="block text-xs text-red-500">{errors.name}</span>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="service-phone-input"
                    className={`block text-xs font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
                  >
                    Телефон <span className="text-[#FD4B32]">*</span>
                  </label>
                  <input
                    id="service-phone-input"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                    onFocus={() => {
                      if (!phone) setPhone('+7 (');
                    }}
                    onBlur={() => {
                      if (phone === '+7' || phone === '+7 (' || phone === '+7 ()') {
                        setPhone('');
                      }
                    }}
                    placeholder="+7 (___) ___-__-__"
                    className={`w-full px-3.5 py-2.5 border text-sm focus:outline-none focus:border-[#FD4B32] transition-colors ${
                      isLight
                        ? `bg-white ${
                            errors.phone ? 'border-red-500 bg-red-50' : 'border-black/15'
                          } text-[#1D1D1D] placeholder-black/30`
                        : `bg-white/[0.04] ${
                            errors.phone ? 'border-red-500 bg-red-950/10' : 'border-white/15'
                          } text-white placeholder-white/30`
                    }`}
                    required
                    inputMode="tel"
                  />
                  {errors.phone && (
                    <span className="block text-xs text-red-500">{errors.phone}</span>
                  )}
                </div>
              </div>

              {/* Service Selection Chips */}
              <div className="space-y-2">
                <label
                  id="service-select-label"
                  className={`block text-xs font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
                >
                  Интересующие направления
                </label>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-labelledby="service-select-label"
                >
                  {ALL_SERVICE_CHIPS.map((chip) => {
                    const isSelected = selectedServices.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleToggleService(chip)}
                        className={`px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#FD4B32] text-white border-[#FD4B32]'
                            : isLight
                              ? 'bg-black/[0.04] text-[#1D1D1D]/75 border-black/10 hover:border-black/30 hover:text-[#1D1D]'
                              : 'bg-white/[0.04] text-white/70 border-white/15 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label
                  htmlFor="service-message-input"
                  className={`block text-xs font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
                >
                  О задаче (необязательно)
                </label>
                <textarea
                  id="service-message-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Опишите задачу, примерные сроки или оставьте ссылку на материалы"
                  rows={3}
                  className={`w-full px-3.5 py-2.5 border text-sm focus:outline-none focus:border-[#FD4B32] transition-colors resize-none ${
                    isLight
                      ? 'bg-white border-black/15 text-[#1D1D1D] placeholder-black/30'
                      : 'bg-white/[0.04] border-white/15 text-white placeholder-white/30'
                  }`}
                />
              </div>

              {/* Privacy Consent */}
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={privacy}
                    onChange={(e) => {
                      setPrivacy(e.target.checked);
                      if (errors.privacy && e.target.checked) {
                        setErrors((prev) => ({ ...prev, privacy: undefined }));
                      }
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`size-4 mt-0.5 border flex items-center justify-center transition-colors shrink-0 ${
                      privacy
                        ? 'bg-[#FD4B32] border-[#FD4B32] text-white'
                        : isLight
                          ? 'border-black/30 bg-white'
                          : 'border-white/30 bg-white/[0.04]'
                    }`}
                  >
                    {privacy && <Check className="size-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs leading-normal ${
                      isLight ? 'text-[#1D1D1D]/60' : 'text-white/60'
                    }`}
                  >
                    Согласен на обработку персональных данных в соответствии с{' '}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FD4B32] hover:underline"
                    >
                      политикой конфиденциальности
                    </a>
                    .
                  </span>
                </label>
                {errors.privacy && (
                  <span className="block text-xs text-red-500">{errors.privacy}</span>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-[#FD4B32] hover:bg-[#E63A22] disabled:opacity-60 text-white font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer border-0"
                >
                  <span>{isSubmitting ? 'Отправка...' : 'Отправить заявку'}</span>
                  {!isSubmitting && (
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
