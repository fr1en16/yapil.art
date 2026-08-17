import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  caseBadge: string;
  caseLink: string;
  image: string;
  color: string;
}

const services: ServiceItem[] = [
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

export default function ServicesAnimatedModal() {
  const [modal, setModal] = useState<{ active: boolean; index: number }>({
    active: false,
    index: 0,
  });
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative z-10 py-20 md:py-32 text-white overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #181818 0%, #121213 50%, #0b0b0c 100%)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 md:mb-18 grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-[var(--grid-gap)] md:items-end">
          <div className="col-span-1 md:col-span-7">
            <h2
              id="services-title"
              className="text-[clamp(2.75rem,7vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.045em] m-0 text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Услуги
            </h2>
          </div>
          <p className="col-span-1 md:col-start-8 md:col-span-5 text-base md:text-lg leading-[1.3] text-white/60 m-0">
            Собираем сайты, бренды и коммуникации — от стратегии до ежедневного контента.
            Один проект ведёт один дизайнер от первой концепции до релиза.
          </p>
        </div>

        {/* Interactive Services List */}
        <div className="relative flex flex-col border-t border-white/15">
          {services.map((item, index) => (
            <ServiceRow
              key={item.id}
              item={item}
              index={index}
              setModal={setModal}
            />
          ))}
        </div>

        {/* Floating Modal Preview & Magnetic Cursor */}
        {!reduceMotion && (
          <HoverModalPreview modal={modal} services={services} />
        )}
      </div>
    </section>
  );
}

function ServiceRow({
  item,
  index,
  setModal,
}: {
  item: ServiceItem;
  index: number;
  setModal: React.Dispatch<React.SetStateAction<{ active: boolean; index: number }>>;
}) {
  return (
    <a
      href={item.caseLink}
      className="group relative flex flex-col md:flex-row md:items-center justify-between border-b border-white/15 py-8 sm:py-10 md:py-12 transition-all duration-300 hover:bg-white/[0.02] px-2 sm:px-4 cursor-pointer text-inherit no-underline"
      onMouseEnter={() => setModal({ active: true, index })}
      onMouseLeave={() => setModal({ active: false, index })}
      aria-label={`Услуга: ${item.title}. Смотреть кейс: ${item.caseBadge}`}
    >
      {/* Left side: Number & Title */}
      <div className="flex items-baseline gap-4 sm:gap-8 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
        <span className="font-mono text-sm sm:text-base text-white/40 group-hover:text-[#FD4B32] transition-colors duration-300">
          {item.number}
        </span>
        <h3
          className="m-0 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-none tracking-[-0.04em] text-white transition-colors duration-300 group-hover:text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {item.title}
        </h3>
      </div>

      {/* Right side: Description & Arrow */}
      <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 sm:gap-10 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-2">
        <div className="text-left md:text-right max-w-md lg:max-w-xl">
          <p className="m-0 text-base leading-[1.3] text-white/55 group-hover:text-white/85 transition-colors duration-300 text-pretty">
            {item.description}
          </p>
        </div>

        <div className="size-10 sm:size-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 group-hover:border-[#FD4B32] group-hover:bg-[#FD4B32] group-hover:text-white transition-all duration-300 shrink-0">
          <ArrowUpRight className="size-4 sm:size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </a>
  );
}

function HoverModalPreview({
  modal,
  services,
}: {
  modal: { active: boolean; index: number };
  services: ServiceItem[];
}) {
  const { active, index } = modal;
  const modalContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // QuickTo for super-fluid mouse following with zero React re-render overhead
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
      className="pointer-events-none fixed z-30 hidden md:flex h-[22rem] w-[26rem] lg:h-[24rem] lg:w-[30rem] items-center justify-center overflow-hidden border border-white/20 bg-[#161616] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]"
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
