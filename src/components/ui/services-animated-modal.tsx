import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Check, X, RotateCcw, Clock, UserCheck, ShieldCheck } from 'lucide-react';

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
  {
    id: 'support',
    number: '06',
    title: 'Сопровождение',
    description: 'Работаем как ваш внешний арт-отдел: закрываем регулярные задачи, готовим промо, держим стиль по гайдлайну.',
    caseBadge: 'Кейс // ONmacabim',
    caseLink: '/case/onmacabim',
    image: '/services/support.webp',
    color: '#141416',
  },
];

const ALL_SERVICE_CHIPS = ['Сайты', 'Айдентика', 'Полиграфия', 'SMM', 'Презентации', 'Сопровождение'];

const SERVICE_CTA_DESCRIPTIONS: Record<string, string> = {
  websites:
    'Опишите задачу или оставьте контакты. На созвоне подберём стек под неё и посчитаем сроки со сметой.',
  identity:
    'Расскажите о бренде или оставьте контакты. Разберём стиль, соберём ТЗ и посчитаем этапы работы.',
  print:
    'Укажите тираж и материалы или оставьте контакты. Подгоним макет под типографию и посчитаем стоимость.',
  smm:
    'Расскажите о ваших соцсетях. Разберём позиционирование и предложим план публикаций.',
  presentations:
    'Расскажите о цели презентации. Соберём структуру и упакуем данные в инфографику, сроки назовём сразу на созвоне.',
  support:
    'Опишите ваши задачи по дизайну или оставьте контакты. Подберём формат сопровождения, объём и график под них.',
};

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
  const [mounted, setMounted] = useState(false);
  const [hoverModal, setHoverModal] = useState<{ active: boolean; index: number }>({
    active: false,
    index: 0,
  });
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceItem | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

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
              className={`text-[clamp(2.75rem,7vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.04em] m-0 ${
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
            <div key={item.id} role="listitem" className="w-full">
              <ServiceRow
                item={item}
                index={index}
                isLight={isLight}
                setHoverModal={setHoverModal}
                onOpenModal={handleOpenModal}
              />
            </div>
          ))}
        </div>

        {/* Floating Modal Preview & Magnetic Cursor (only if no active dialog) */}
        {!reduceMotion && !activeServiceModal && (
          <HoverModalPreview modal={hoverModal} services={services} isLight={isLight} />
        )}
      </div>

      {/* Pop-up Service Application Modal Portal (rendered into body above header) */}
      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activeServiceModal && (
              <ServiceApplicationModal
                service={activeServiceModal}
                isLight={isLight}
                onClose={handleCloseModal}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
      }}
      className={`fixed inset-0 w-screen h-screen z-[9990] overflow-y-auto overscroll-contain transition-colors duration-300 ${
        isLight
          ? 'bg-black/10 text-[#1D1D1D]'
          : 'bg-black/10 text-white'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-service-title"
      onClick={onClose}
    >
      {/* 12-Column Grid Container */}
      <div className="container min-h-screen py-12 md:py-20 flex flex-col justify-center relative">
        <div className="grid grid-cols-1 md:grid-cols-12 md:gap-[var(--grid-gap)] items-stretch w-full my-auto gap-y-12">
          {/* Left Part: Title & CTA (Columns 1-4) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1 md:col-start-1 md:col-span-4 flex flex-col justify-between h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top section: Title and Description with generous breathing room */}
            <div>
              <h2
                id="modal-service-title"
                className={`text-4xl sm:text-5xl md:text-6xl font-normal tracking-[-0.04em] m-0 leading-[1.05] mb-8 sm:mb-10 md:mb-12 ${
                  isLight ? 'text-[#1D1D1D]' : 'text-white'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Оставьте заявку
              </h2>

              <p
                className={`text-base sm:text-lg leading-relaxed m-0 ${
                  isLight ? 'text-[#1D1D1D]/75' : 'text-white/75'
                }`}
              >
                {SERVICE_CTA_DESCRIPTIONS[service.id] ||
                  'Расскажите о задаче или оставьте контактные данные — мы свяжемся с вами, чтобы подробно обсудить проект, предложить лучшие варианты реализации и рассчитать сроки со сметой.'}
              </p>
            </div>

            {/* Bottom section: CTAs aligned to bottom with standalone icons */}
            <div className="pt-12 md:pt-16 mt-10 md:mt-auto space-y-6">
              <div className="flex items-start gap-3.5">
                <Clock className="size-5 text-[#FD4B32] shrink-0 mt-0.5" />
                <div className="text-sm leading-snug">
                  <span className={`font-medium ${isLight ? 'text-[#1D1D1D]' : 'text-white'}`}>
                    Ответ в течение 2 часов
                  </span>
                  <span className={`block text-xs mt-0.5 ${isLight ? 'text-[#1D1D1D]/60' : 'text-white/60'}`}>
                    свяжемся в Telegram, WhatsApp или по телефону
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <UserCheck className="size-5 text-[#FD4B32] shrink-0 mt-0.5" />
                <div className="text-sm leading-snug">
                  <span className={`font-medium ${isLight ? 'text-[#1D1D1D]' : 'text-white'}`}>
                    Прямой диалог
                  </span>
                  <span className={`block text-xs mt-0.5 ${isLight ? 'text-[#1D1D1D]/60' : 'text-white/60'}`}>
                    проект сразу ведёт и оценивает ключевой дизайнер
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <ShieldCheck className="size-5 text-[#FD4B32] shrink-0 mt-0.5" />
                <div className="text-sm leading-snug">
                  <span className={`font-medium ${isLight ? 'text-[#1D1D1D]' : 'text-white'}`}>
                    Прозрачная смета
                  </span>
                  <span className={`block text-xs mt-0.5 ${isLight ? 'text-[#1D1D1D]/60' : 'text-white/60'}`}>
                    фиксируем этапы и финальную стоимость до старта
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Part: Form Input Fields (Columns 8-12) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="col-span-1 md:col-start-8 md:col-span-5 flex flex-col space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
          {isSubmitted ? (
            /* Success State */
            <div className="py-10 sm:py-12 text-center space-y-6">
              <div className="size-16 sm:size-20 mx-auto rounded-none border border-[#FD4B32]/40 bg-[#FD4B32]/10 backdrop-blur-2xl text-[#FD4B32] flex items-center justify-center">
                <Check className="size-8 sm:size-10 stroke-[2.5]" />
              </div>
              <div className="space-y-3">
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

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="form-cta-button sm:!w-auto !min-h-[3rem] !py-3 !px-7 text-sm"
                >
                  <span className="btn-inner">
                    <span className="btn-text">Отлично, закрыть</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className={`form-secondary-button backdrop-blur-2xl !py-3 !px-7 text-sm ${
                    isLight
                      ? 'border-black/[0.08] bg-white/80 text-[#1D1D1D]/75 hover:border-[#FD4B32]/50 hover:bg-white hover:text-[#1D1D1D]'
                      : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-white/25 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span className="btn-inner">
                    <RotateCcw className="btn-icon size-3.5" />
                    <span className="btn-text">Отправить ещё</span>
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7" noValidate>

              {/* Name & Phone in grid on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {/* Name */}
                <div className="space-y-2.5">
                  <label
                    htmlFor="service-name-input"
                    className={`block text-xs sm:text-sm font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
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
                    style={{ outline: 'none' }}
                    className={`w-full px-4 py-3 sm:py-3.5 rounded-none backdrop-blur-2xl border text-sm outline-none focus:outline-none focus-visible:outline-none transition-all duration-300 ${
                      isLight
                        ? `${
                            errors.name
                              ? 'border-red-500 bg-red-50 text-[#1D1D1D]'
                              : 'border-black/[0.08] bg-white/80 text-[#1D1D1D] placeholder-black/35 hover:border-[#FD4B32]/50 hover:bg-white focus:border-[#FD4B32] focus:bg-white focus:shadow-[0_8px_20px_-4px_rgba(253,75,50,0.12)]'
                          }`
                        : `${
                            errors.name
                              ? 'border-red-500 bg-red-950/20 text-white'
                              : 'border-white/10 bg-white/[0.04] text-white placeholder-white/30 hover:border-white/25 hover:bg-white/[0.08] focus:border-[#FD4B32] focus:bg-white/[0.08]'
                          }`
                    }`}
                    required
                  />
                  {errors.name && (
                    <span className="block text-xs text-red-500">{errors.name}</span>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2.5">
                  <label
                    htmlFor="service-phone-input"
                    className={`block text-xs sm:text-sm font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
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
                    style={{ outline: 'none' }}
                    className={`w-full px-4 py-3 sm:py-3.5 rounded-none backdrop-blur-2xl border text-sm outline-none focus:outline-none focus-visible:outline-none transition-all duration-300 ${
                      isLight
                        ? `${
                            errors.phone
                              ? 'border-red-500 bg-red-50 text-[#1D1D1D]'
                              : 'border-black/[0.08] bg-white/80 text-[#1D1D1D] placeholder-black/35 hover:border-[#FD4B32]/50 hover:bg-white focus:border-[#FD4B32] focus:bg-white focus:shadow-[0_8px_20px_-4px_rgba(253,75,50,0.12)]'
                          }`
                        : `${
                            errors.phone
                              ? 'border-red-500 bg-red-950/20 text-white'
                              : 'border-white/10 bg-white/[0.04] text-white placeholder-white/30 hover:border-white/25 hover:bg-white/[0.08] focus:border-[#FD4B32] focus:bg-white/[0.08]'
                          }`
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
              <div className="space-y-3">
                <label
                  id="service-select-label"
                  className={`block text-xs sm:text-sm font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
                >
                  Интересующие направления
                </label>
                <div
                  className="flex flex-wrap gap-2.5 sm:gap-3"
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
                        style={{ borderRadius: '100px' }}
                        className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-[100px] backdrop-blur-2xl transition-all duration-300 cursor-pointer border outline-none focus:outline-none focus-visible:outline-none ${
                          isSelected
                            ? 'bg-[#FD4B32] text-white border-[#FD4B32] shadow-[0_4px_14px_rgba(253,75,50,0.35)]'
                            : isLight
                              ? 'bg-white/80 text-[#1D1D1D]/75 border-black/[0.08] hover:border-[#FD4B32]/50 hover:bg-white hover:text-[#1D1D1D] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)]'
                              : 'bg-white/[0.04] text-white/75 border-white/10 hover:border-white/25 hover:bg-white/[0.08] hover:text-white'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2.5">
                <label
                  htmlFor="service-message-input"
                  className={`block text-xs sm:text-sm font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
                >
                  О задаче (необязательно)
                </label>
                <textarea
                  id="service-message-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Опишите задачу, примерные сроки или оставьте ссылку на материалы"
                  rows={3}
                  style={{ outline: 'none' }}
                  className={`w-full px-4 py-3 sm:py-3.5 rounded-none backdrop-blur-2xl border text-sm outline-none focus:outline-none focus-visible:outline-none transition-all duration-300 resize-none leading-relaxed ${
                    isLight
                      ? 'border-black/[0.08] bg-white/80 text-[#1D1D1D] placeholder-black/35 hover:border-[#FD4B32]/50 hover:bg-white focus:border-[#FD4B32] focus:bg-white focus:shadow-[0_8px_20px_-4px_rgba(253,75,50,0.12)]'
                      : 'border-white/10 bg-white/[0.04] text-white placeholder-white/30 hover:border-white/25 hover:bg-white/[0.08] focus:border-[#FD4B32] focus:bg-white/[0.08]'
                  }`}
                />
              </div>

              {/* Privacy Consent */}
              <div className="space-y-1.5 pt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
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
                    className={`size-4 mt-0.5 rounded-none border flex items-center justify-center transition-all duration-300 shrink-0 ${
                      privacy
                        ? 'bg-[#FD4B32] border-[#FD4B32] text-white'
                        : isLight
                          ? 'border-black/[0.15] bg-white/80 hover:border-[#FD4B32]/50 hover:bg-white'
                          : 'border-white/20 bg-white/[0.04] hover:border-white/35 hover:bg-white/[0.08]'
                    }`}
                  >
                    {privacy && <Check className="size-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs sm:text-sm leading-normal ${
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
              <div className="pt-3 sm:pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="form-cta-button"
                >
                  <span className="btn-inner">
                    <span className="btn-text">{isSubmitting ? 'Отправка...' : 'Отправить заявку'}</span>
                    {!isSubmitting && (
                      <ArrowRight className="btn-icon size-4.5" />
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
