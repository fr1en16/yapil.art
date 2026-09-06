import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, ChevronRight, Check, X, RotateCcw, Clock, UserCheck, ShieldCheck } from 'lucide-react';
import { submitLead } from '../../lib/crmStore';
import { CoverflowCarousel } from './coverflow-carousel';
import './homepage-services.css';

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  price: string;
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
    price: 'от 150 000 ₸',
    caseBadge: 'Кейс // Compass',
    caseLink: '/case/compass',
    image: 'https://media.yapil.art/services/sites.d7a0bf3e30b3f1df.webp',
    color: '#141416',
  },
  {
    id: 'identity',
    number: '02',
    title: 'Айдентика',
    description: 'Придумываем логотип, типографику, графический язык. Собираем брендбук, по которому ваш подрядчик соберёт макет без вопросов к нам.',
    price: 'от 180 000 ₸',
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
    price: 'от 40 000 ₸',
    caseBadge: 'Кейс // Shanding',
    caseLink: '/case/shanding',
    image: 'https://media.yapil.art/services/polygraphy.de6b0b9d86fc262c.webp',
    color: '#141416',
  },
  {
    id: 'smm',
    number: '04',
    title: 'SMM',
    description: 'Собираем концепцию профиля, шаблоны постов, рекламные креативы, сторис.',
    price: 'от 40 000 ₸',
    caseBadge: 'Кейс // Gippo',
    caseLink: '/case/gippo',
    image: 'https://media.yapil.art/services/smm.6daf973a8ce29345.webp',
    color: '#141416',
  },
  {
    id: 'presentations',
    number: '05',
    title: 'Презентации',
    description: 'Оформляем инвест-питчи, коммерческие предложения, годовые отчёты. Переводим цифры в схемы, графики, инфографику.',
    price: 'от 60 000 ₸',
    caseBadge: 'Кейс // Parking24',
    caseLink: '/case/parking24',
    image: 'https://media.yapil.art/services/presentations.4d39d5565335b0b1.webp',
    color: '#141416',
  },
  {
    id: 'support',
    number: '06',
    title: 'Сопровождение',
    description: 'Работаем как ваш внешний арт-отдел: закрываем регулярные задачи, готовим промо, держим стиль по гайдлайну.',
    price: 'от 150 000 ₸',
    caseBadge: 'Кейс // ONmacabim',
    caseLink: '/case/onmacabim',
    image: 'https://media.yapil.art/services/support.5dc90c0aa5331630.webp',
    color: '#141416',
  },
];

const PRICES_USD_RU: Record<string, string> = {
  websites: 'от $300',
  identity: 'от $360',
  print: 'от $80',
  smm: 'от $80',
  presentations: 'от $120',
  support: 'от $300 / мес.',
};

const PRICES_USD_EN: Record<string, string> = {
  websites: 'from $390',
  identity: 'from $470',
  print: 'from $105',
  smm: 'from $105',
  presentations: 'from $160',
  support: 'from $390 / mo',
};

const SERVICES_EN: Record<string, { title: string; description: string; personalDescription: string; caseBadge: string }> = {
  websites: {
    title: 'Websites',
    description: 'Structuring UX, designing UI in Figma, writing clean code, launching. Turnkey landing pages, e-commerce, web apps.',
    personalDescription: 'Structuring UX, designing UI in Figma, writing clean code, launching. Turnkey landing pages, e-commerce, web apps.',
    caseBadge: 'Case // Compass',
  },
  identity: {
    title: 'Identity',
    description: 'Logo design, typography systems, visual language, and brandbooks your contractors can implement with zero confusion.',
    personalDescription: 'Logo design, typography systems, visual language, and brandbooks your contractors can implement with zero confusion.',
    caseBadge: 'Case // Compass Management',
  },
  print: {
    title: 'Print',
    description: 'Product packaging, POS materials, merchandise, multi-page catalogs. Full prepress files and color proofing.',
    personalDescription: 'Product packaging, POS materials, merchandise, multi-page catalogs. Full prepress files and color proofing.',
    caseBadge: 'Case // Shanding',
  },
  smm: {
    title: 'SMM',
    description: 'Profile visual concepts, post templates, motion graphics, and high-CTR ad creatives.',
    personalDescription: 'Profile visual concepts, post templates, motion graphics, and high-CTR ad creatives.',
    caseBadge: 'Case // Gippo',
  },
  presentations: {
    title: 'Presentations',
    description: 'Investor pitch decks, commercial proposals, annual reports. Transforming raw data into structured infographics.',
    personalDescription: 'Investor pitch decks, commercial proposals, annual reports. Transforming raw data into structured infographics.',
    caseBadge: 'Case // Parking24',
  },
  support: {
    title: 'Support',
    description: 'Acting as your external art department: solving daily design tasks, building promo, maintaining brand consistency.',
    personalDescription: 'Acting as your external art department: solving daily design tasks, building promo, maintaining brand consistency.',
    caseBadge: 'Case // ONmacabim',
  },
};

const ALL_SERVICE_CHIPS_RU = ['Сайты', 'Айдентика', 'Полиграфия', 'SMM', 'Презентации', 'Сопровождение'];
const ALL_SERVICE_CHIPS_EN = ['Websites', 'Identity', 'Print', 'SMM', 'Presentations', 'Support'];

const SERVICE_CTA_DESCRIPTIONS_RU: Record<string, string> = {
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

const SERVICE_CTA_DESCRIPTIONS_EN: Record<string, string> = {
  websites:
    'Describe your project or leave your contact details. During a call, we will pick the right stack and estimate the timeline and budget.',
  identity:
    'Tell me about your brand or leave your contact details. We will analyze your style, prepare a scope of work, and calculate project milestones.',
  print:
    'Specify the print run and materials or leave your contact details. We will tailor the layout for print production and provide a quote.',
  smm:
    'Tell me about your social media channels. We will refine your visual positioning and propose a publication and creative plan.',
  presentations:
    'Tell me about the goal of your presentation. We will build the structure and pack your data into clean infographics, setting the timeline right on our call.',
  support:
    'Describe your ongoing design needs or leave your contact details. We will select the right retainer format, scope, and delivery schedule.',
};

const SERVICE_DESCRIPTIONS_PERSONAL_RU: Record<string, string> = {
  websites: 'Проектирую структуру, рисую макеты, верстаю, запускаю. Делаю лендинги, интернет-магазины, сервисы.',
  identity: 'Придумываю логотип, типографику, графический язык. Собираю брендбук, по которому ваш подрядчик соберёт макет без вопросов ко мне.',
  print: 'Разрабатываю упаковку, POS-материалы, мерч, многостраничные издания. Готовлю файлы к печати, проверяю цветопробу в типографии.',
  smm: 'Собираю концепцию профиля, шаблоны постов, рекламные креативы, сторис.',
  presentations: 'Оформляю инвест-питчи, коммерческие предложения, годовые отчёты. Перевожу цифры в схемы, графики, инфографику.',
  support: 'Работаю как ваш внешний арт-отдел: закрываю регулярные задачи, готовлю промо, держу стиль по гайдлайну.',
};

const SERVICE_CTA_DESCRIPTIONS_PERSONAL_RU: Record<string, string> = {
  websites: 'Опишите задачу или оставьте контакты. На созвоне подберу стек под неё и посчитаю сроки со сметой.',
  identity: 'Расскажите о бренде или оставьте контакты. Разберу стиль, соберу ТЗ и посчитаю этапы работы.',
  print: 'Укажите тираж и материалы или оставьте контакты. Подгоню макет под типографию и посчитаю стоимость.',
  smm: 'Расскажите о ваших соцсетях. Разберу позиционирование и предложу план публикаций.',
  presentations: 'Расскажите о цели презентации. Соберу структуру и упакую данные в инфографику, сроки назову сразу на созвоне.',
  support: 'Опишите ваши задачи по дизайну или оставьте контакты. Подберу формат сопровождения, объём и график под них.',
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
  personal = false,
  cards = false,
  currency = 'kzt',
  lang = 'ru',
  homepage = false,
  items = services,
  heading,
  intro,
  sectionId = 'services',
  typographyOff = false,
}: {
  theme?: 'dark' | 'light';
  personal?: boolean;
  cards?: boolean;
  currency?: 'kzt' | 'usd';
  lang?: 'ru' | 'en';
  homepage?: boolean;
  items?: ServiceItem[];
  heading?: string;
  intro?: string;
  sectionId?: string;
  typographyOff?: boolean;
}) {
  const isLight = theme === 'light';
  const isEn = lang === 'en';

  const displayedServices: ServiceItem[] = items.map((item) => {
    let title = item.title;
    let description = personal
      ? (SERVICE_DESCRIPTIONS_PERSONAL_RU[item.id] ?? item.description)
      : item.description;
    let price = item.price;
    let caseBadge = item.caseBadge;

    if (currency === 'usd') {
      price = isEn ? (PRICES_USD_EN[item.id] ?? item.price) : (PRICES_USD_RU[item.id] ?? item.price);
    }

    if (isEn && SERVICES_EN[item.id]) {
      const enItem = SERVICES_EN[item.id];
      title = enItem.title;
      description = personal ? enItem.personalDescription : enItem.description;
      caseBadge = enItem.caseBadge;
    }

    return {
      ...item,
      title,
      description,
      price,
      caseBadge,
    };
  });

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
      id={sectionId}
      aria-labelledby={`${sectionId}-title`}
      data-typography={typographyOff ? 'off' : undefined}
      className={`relative z-10 py-20 md:py-32 overflow-hidden transition-colors duration-300 ${
        isLight ? 'text-[#1D1D1D]' : 'text-white'
      }`}
      style={{
        background: isLight
          ? 'var(--page-neutral-surface, linear-gradient(to bottom, #F7F5F2 0%, #F0ECE7 50%, #EAE5DF 100%))'
          : 'linear-gradient(to bottom, #181818 0%, #121213 50%, #0b0b0c 100%)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 md:mb-18 grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-[var(--grid-gap)] md:items-end">
          <div className="col-span-1 md:col-span-7">
            <h2
              id={`${sectionId}-title`}
              className={`text-[clamp(2.75rem,7vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.04em] m-0 ${
                isLight ? 'text-[#1D1D1D]' : 'text-white'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {heading ?? (isEn ? 'Services' : 'Услуги')}
            </h2>
          </div>
          <p
            className={`col-span-1 md:col-start-8 md:col-span-5 text-base md:text-lg leading-[1.3] m-0 ${
              isLight ? 'text-[#1D1D1D]/65' : 'text-white/60'
            }`}
          >
            {intro ?? (isEn
              ? (personal
                  ? 'Structuring websites, brands, and visual communications: from strategy to daily content. Click any service to discuss your project.'
                  : 'Building websites, brands, and visual communications — from strategy to daily content. Click any service to discuss your project.')
              : (personal
                  ? 'Собираю сайты, бренды и коммуникации: делаю стратегию, веду контент каждый день. Нажмите на услугу, чтобы обсудить задачу и заказать проект.'
                  : 'Собираем сайты, бренды и коммуникации — от стратегии до ежедневного контента. Нажмите на услугу, чтобы обсудить задачу и заказать проект.'))}
          </p>
        </div>

        {cards ? (
          <CoverflowCarousel
            slides={displayedServices.map((item) => ({
              src: item.image,
              alt: isEn ? `Work example for "${item.title}"` : `Пример работы по услуге «${item.title}»`,
              title: item.title,
              subtitle: item.price,
              meta: [{ label: isEn ? 'Description' : 'Описание', value: item.description }],
            }))}
            cardWidth="clamp(210px, 28vw, 400px)"
            aspectRatio={5 / 4}
            activeScale={1.2}
            rotate={42}
            depth={0.58}
            perspective={3.2}
            gap={0.08}
            fade={0.14}
            showCaption
            showPagination
            showNavigation
            label={isEn ? 'Services — drag or use arrows' : 'Услуги — перетаскивайте или используйте стрелки'}
            className="services-coverflow relative left-1/2 w-screen -translate-x-1/2"
            cardClassName={isLight ? 'border border-black/10' : 'border border-white/15'}
            onSlideClick={(index) => handleOpenModal(displayedServices[index])}
          />
        ) : (
          <div
            className={`relative flex flex-col ${isLight ? 'border-t border-black/10' : 'border-t border-white/15'}`}
            role="list"
          >
            {displayedServices.map((item, index) => (
              <div key={item.id} role="listitem" className="w-full">
                {homepage ? <HomepageServiceRow item={item} isLight={isLight} /> : <ServiceRow
                  item={item}
                  index={index}
                  isLight={isLight}
                  setHoverModal={setHoverModal}
                  onOpenModal={handleOpenModal}
                />}
              </div>
            ))}
          </div>
        )}

        {/* Floating Modal Preview & Magnetic Cursor (only if no active dialog) */}
        {!homepage && !cards && !reduceMotion && !activeServiceModal && (
          <HoverModalPreview modal={hoverModal} services={displayedServices} isLight={isLight} />
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
                personal={personal}
                lang={lang}
                onClose={handleCloseModal}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}

function HomepageServiceRow({
  item,
  isLight,
}: {
  item: ServiceItem;
  isLight: boolean;
}) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const mobileMotion = window.matchMedia('(max-width: 767px) and (prefers-reduced-motion: no-preference)');
    let observer: IntersectionObserver | undefined;

    const updateObserver = () => {
      observer?.disconnect();
      setIsInView(false);
      if (!mobileMotion.matches || !rowRef.current) return;

      observer = new IntersectionObserver(
        ([entry]) => setIsInView(entry.isIntersecting),
        { rootMargin: '0px', threshold: 0 },
      );
      observer.observe(rowRef.current);
    };

    updateObserver();
    mobileMotion.addEventListener('change', updateObserver);
    return () => {
      observer?.disconnect();
      mobileMotion.removeEventListener('change', updateObserver);
    };
  }, []);

  return (
    <a
      ref={rowRef}
      href={`/services/${item.id}`}
      className={`homepage-service-row${isLight ? ' homepage-service-row--light' : ''}${isInView ? ' homepage-service-row--in-view' : ''}`}
    >
      <span className="homepage-service-media" aria-hidden="true">
        <img src={item.image} alt="" loading="lazy" decoding="async" width={1000} height={576} />
      </span>
      <span className="homepage-service-copy">
        <span className="homepage-service-heading">
          <h3>{item.title}</h3>
          <ChevronRight className="homepage-service-arrow" aria-hidden="true" />
        </span>
        <span className="homepage-service-description">{item.description}</span>
      </span>
    </a>
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
      className={`pointer-events-none fixed z-30 hidden aspect-[5/4] w-[22rem] md:flex lg:w-[24rem] items-center justify-center overflow-hidden ${
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
  personal = false,
  lang = 'ru',
  onClose,
}: {
  service: ServiceItem;
  isLight?: boolean;
  personal?: boolean;
  lang?: 'ru' | 'en';
  onClose: () => void;
}) {
  const isEn = lang === 'en';
  const ctaDescriptions = isEn
    ? SERVICE_CTA_DESCRIPTIONS_EN
    : personal
      ? SERVICE_CTA_DESCRIPTIONS_PERSONAL_RU
      : SERVICE_CTA_DESCRIPTIONS_RU;
  const defaultCtaDescription = isEn
    ? 'Tell me about your task or leave contact details — I will get back to you to discuss the project in detail, suggest the best execution approach, and provide an estimate with timeline.'
    : personal
      ? 'Расскажите о задаче или оставьте контактные данные — свяжусь с вами, чтобы подробно обсудить проект, предложить лучшие варианты реализации и рассчитать сроки со сметой.'
      : 'Расскажите о задаче или оставьте контактные данные — мы свяжемся с вами, чтобы подробно обсудить проект, предложить лучшие варианты реализации и рассчитать сроки со сметой.';

  const allChips = isEn ? ALL_SERVICE_CHIPS_EN : ALL_SERVICE_CHIPS_RU;

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
    if (isEn) {
      setPhone(val);
      if (errors.phone && val.trim()) {
        setErrors((prev) => ({ ...prev, phone: undefined }));
      }
      return;
    }

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
    if (!isEn && e.key === 'Backspace' && phone.length <= 4) {
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

    if (isEn) {
      const digits = phone.replace(/\D/g, '');
      if (!phone.trim() || digits.length < 7 || digits.length > 15) {
        newErrors.phone = 'Please enter your full phone number';
      }
    } else {
      const digits = phone.replace(/\D/g, '');
      if (!phone.trim() || digits.length < 11) {
        newErrors.phone = 'Пожалуйста, укажите полный номер телефона';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    submitLead({
      name: name.trim(),
      phone: phone.trim(),
      services: selectedServices.length > 0 ? selectedServices : [service.title],
      message: message.trim(),
      source: 'service_modal',
      sourceDetails: `Modal: ${service.title} (${lang})`,
    }).catch((err) => {
      console.error('CRM submit error:', err);
    });

    try {
      const stored = JSON.parse(localStorage.getItem('yapil_inquiries') || '[]');
      stored.push({
        name: name.trim(),
        phone: phone.trim(),
        services: selectedServices.length > 0 ? selectedServices : [service.title],
        message: message.trim(),
        sourceService: service.title,
        date: new Date().toISOString(),
      });
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
      data-lenis-prevent="true"
    >
      {/* Standalone close button without container */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={isEn ? 'Close' : 'Закрыть'}
        className={`fixed top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-[9999] p-2 bg-transparent border-0 outline-none cursor-pointer transition-colors duration-200 ${
          isLight
            ? 'text-[#1D1D1D] hover:text-[#FD4B32]'
            : 'text-white hover:text-[#FD4B32]'
        }`}
      >
        <X className="size-7 sm:size-8 stroke-[1.5]" />
      </button>

      {/* 12-Column Grid Container */}
      <div className="container min-h-screen py-4 md:py-6 flex flex-col justify-center relative">
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-x-[var(--grid-gap)] items-stretch w-full my-auto gap-y-10 md:gap-y-12">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1 md:col-start-1 md:col-span-4 md:row-start-1"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="modal-service-title"
              className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-[-0.04em] m-0 leading-[0.9] mb-6 sm:mb-8 md:mb-10 ${
                isLight ? 'text-[#1D1D1D]' : 'text-white'
              }`}
              style={{ fontFamily: 'var(--font-display)', lineHeight: '0.9' }}
            >
              {isEn ? 'Leave a request' : 'Оставьте заявку'}
            </h2>

            <p
              className={`text-base sm:text-lg md:text-xl leading-relaxed m-0 max-w-md ${
                isLight ? 'text-[#1D1D1D]/75' : 'text-white/75'
              }`}
            >
              {ctaDescriptions[service.id] || defaultCtaDescription}
            </p>
          </motion.div>

          {/* Right Part: Form Input Fields (Columns 8-12) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="col-span-1 md:col-start-8 md:col-span-5 md:row-start-1 md:row-span-2 flex flex-col space-y-6"
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
                  {isEn ? 'Request sent successfully!' : 'Заявка успешно отправлена!'}
                </h4>
                <p
                  className={`text-sm sm:text-base max-w-md mx-auto m-0 leading-relaxed ${
                    isLight ? 'text-[#1D1D1D]/60' : 'text-white/60'
                  }`}
                >
                  {isEn
                    ? `Thank you for reaching out. I will review your project regarding "${service.title}" and reply shortly.`
                    : `Спасибо за обращение. Мы изучим вашу задачу по направлению «${service.title}» и ответим в ближайшие часы.`}
                </p>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="form-cta-button sm:!w-auto !min-h-[3rem] !py-3 !px-7 text-sm"
                >
                  <span className="btn-inner">
                    <span className="btn-text">{isEn ? 'Great, close' : 'Отлично, закрыть'}</span>
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
                    <span className="btn-text">{isEn ? 'Send another' : 'Отправить ещё'}</span>
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-9" noValidate>

              {/* Name & Phone in grid on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {/* Name */}
                <div className="space-y-3">
                  <label
                    htmlFor="service-name-input"
                    className={`block text-sm sm:text-base font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
                  >
                    {isEn ? 'Name' : 'Имя'}
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
                    placeholder={isEn ? 'How to address you' : 'Как к вам обращаться'}
                    style={{ outline: 'none' }}
                    className={`w-full px-5 py-4 sm:py-4.5 rounded-none backdrop-blur-2xl border text-sm sm:text-base outline-none focus:outline-none focus-visible:outline-none transition-all duration-300 ${
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
                  />
                  {errors.name && (
                    <span className="block text-xs text-red-500">{errors.name}</span>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-3">
                  <label
                    htmlFor="service-phone-input"
                    className={`block text-sm sm:text-base font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
                  >
                    {isEn ? 'Phone number' : 'Телефон'} <span className="text-[#FD4B32]">*</span>
                  </label>
                  <input
                    id="service-phone-input"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                    onFocus={() => {
                      if (!isEn && !phone) setPhone('+7 (');
                    }}
                    onBlur={() => {
                      if (!isEn && (phone === '+7' || phone === '+7 (' || phone === '+7 ()')) {
                        setPhone('');
                      }
                    }}
                    placeholder={isEn ? '+1 (___) ___ ____' : '+7 (___) ___-__-__'}
                    style={{ outline: 'none' }}
                    className={`w-full px-5 py-4 sm:py-4.5 rounded-none backdrop-blur-2xl border text-sm sm:text-base outline-none focus:outline-none focus-visible:outline-none transition-all duration-300 ${
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
              <div className="space-y-3.5" hidden style={{ display: 'none' }}>
                <label
                  id="service-select-label"
                  className={`block text-sm sm:text-base font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
                >
                  {isEn ? 'Areas of interest' : 'Интересующие направления'}
                </label>
                <div
                  className="flex flex-wrap gap-3 sm:gap-3.5"
                  role="group"
                  aria-labelledby="service-select-label"
                >
                  {allChips.map((chip) => {
                    const isSelected = selectedServices.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleToggleService(chip)}
                        style={{ borderRadius: '100px' }}
                        className={`px-5 py-3 text-sm sm:text-base font-medium rounded-[100px] backdrop-blur-2xl transition-all duration-300 cursor-pointer border outline-none focus:outline-none focus-visible:outline-none ${
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
              <div className="space-y-3">
                <label
                  htmlFor="service-message-input"
                  className={`block text-sm sm:text-base font-medium ${isLight ? 'text-[#1D1D1D]/70' : 'text-white/70'}`}
                >
                  {isEn ? 'About the task (optional)' : 'О задаче (необязательно)'}
                </label>
                <textarea
                  id="service-message-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Describe your project, approximate timeline, or share a link to materials'
                      : 'Опишите задачу, примерные сроки или оставьте ссылку на материалы'
                  }
                  rows={4}
                  style={{ outline: 'none' }}
                  className={`w-full px-5 py-4 sm:py-4.5 rounded-none backdrop-blur-2xl border text-sm sm:text-base outline-none focus:outline-none focus-visible:outline-none transition-all duration-300 resize-none leading-relaxed ${
                    isLight
                      ? 'border-black/[0.08] bg-white/80 text-[#1D1D1D] placeholder-black/35 hover:border-[#FD4B32]/50 hover:bg-white focus:border-[#FD4B32] focus:bg-white focus:shadow-[0_8px_20px_-4px_rgba(253,75,50,0.12)]'
                      : 'border-white/10 bg-white/[0.04] text-white placeholder-white/30 hover:border-white/25 hover:bg-white/[0.08] focus:border-[#FD4B32] focus:bg-white/[0.08]'
                  }`}
                />
              </div>

              {/* Privacy Consent */}
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-3.5 cursor-pointer select-none">
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
                    className={`size-4.5 mt-0.5 rounded-none border flex items-center justify-center transition-all duration-300 shrink-0 ${
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
                    {isEn ? (
                      <>
                        I agree to the processing of personal data in accordance with the{' '}
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FD4B32] hover:underline"
                        >
                          privacy policy
                        </a>
                        .
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </span>
                </label>
                {errors.privacy && (
                  <span className="block text-xs text-red-500">{errors.privacy}</span>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="form-cta-button !py-4.5 sm:!py-5 !text-base sm:!text-lg"
                >
                  <span className="btn-inner">
                    <span className="btn-text">
                      {isSubmitting
                        ? (isEn ? 'Sending...' : 'Отправка...')
                        : (isEn ? 'Send request' : 'Отправить заявку')}
                    </span>
                    {!isSubmitting && (
                      <ArrowRight className="btn-icon size-5" />
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}
          </motion.div>

          {/* Benefits follow the form on mobile and stay in the left column on desktop. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="col-span-1 space-y-8 md:col-start-1 md:col-span-4 md:row-start-2 md:self-end"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <Clock className="size-6 text-[#FD4B32] shrink-0 mt-0.5" />
              <div className="text-base sm:text-lg leading-snug">
                <span className={`font-medium ${isLight ? 'text-[#1D1D1D]' : 'text-white'}`}>
                  {isEn ? 'Reply within 2 hours' : personal ? 'Отвечаю в течение 2 часов' : 'Ответ в течение 2 часов'}
                </span>
                <span className={`block text-xs sm:text-sm mt-1 ${isLight ? 'text-[#1D1D1D]/60' : 'text-white/60'}`}>
                  {isEn
                    ? 'via Telegram, WhatsApp, or email'
                    : personal
                      ? 'в Telegram, WhatsApp или по телефону'
                      : 'свяжемся в Telegram, WhatsApp или по телефону'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <UserCheck className="size-6 text-[#FD4B32] shrink-0 mt-0.5" />
              <div className="text-base sm:text-lg leading-snug">
                <span className={`font-medium ${isLight ? 'text-[#1D1D1D]' : 'text-white'}`}>
                  {isEn ? 'Direct collaboration' : personal ? 'Сам веду проект' : 'Прямой диалог'}
                </span>
                <span className={`block text-xs sm:text-sm mt-1 ${isLight ? 'text-[#1D1D1D]/60' : 'text-white/60'}`}>
                  {isEn
                    ? 'I lead and estimate all tasks personally'
                    : personal
                      ? 'и сам оцениваю задачи'
                      : 'проект сразу ведёт и оценивает ключевой дизайнер'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <ShieldCheck className="size-6 text-[#FD4B32] shrink-0 mt-0.5" />
              <div className="text-base sm:text-lg leading-snug">
                <span className={`font-medium ${isLight ? 'text-[#1D1D1D]' : 'text-white'}`}>
                  {isEn ? 'Transparent quote' : personal ? 'Смета фиксирует этапы' : 'Прозрачная смета'}
                </span>
                <span className={`block text-xs sm:text-sm mt-1 ${isLight ? 'text-[#1D1D1D]/60' : 'text-white/60'}`}>
                  {isEn
                    ? 'Milestones and final cost fixed before kickoff'
                    : personal
                      ? 'и итоговую стоимость до старта работы'
                      : 'фиксируем этапы и финальную стоимость до старта'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
