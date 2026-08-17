import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  BarChart3,
  Layers,
  LayoutTemplate,
  RefreshCw,
  Share2,
  Sparkles,
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

interface ServiceCard {
  title: string;
  description: string;
  icon: typeof LayoutTemplate;
  image: string;
  caseBadge: string;
  caseLink: string;
  className: string;
  mediaClassName?: string;
}

const cards: ServiceCard[] = [
  {
    title: 'Сайты',
    description: 'Проектируем структуру, рисуем макеты, верстаем, запускаем. Делаем лендинги, интернет-магазины, сервисы.',
    icon: LayoutTemplate,
    image: 'https://media.yapil.art/services/%D1%81%D0%B0%D0%B9%D1%82%D1%8B.webp',
    caseBadge: 'Кейс // Compass',
    caseLink: '/case/compass',
    className: 'md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-1',
    mediaClassName: 'h-[13rem] sm:h-[15rem] md:h-full min-h-[13rem]',
  },
  {
    title: 'Полиграфия',
    description: 'Разрабатываем упаковку, POS-материалы, мерч, многостраничные издания. Готовим файлы к печати, проверяем цветопробу в типографии.',
    icon: Layers,
    image: 'https://media.yapil.art/services/%D0%BF%D0%BE%D0%BB%D0%B8%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%8F.webp',
    caseBadge: 'Кейс // Shanding',
    caseLink: '/case/shanding',
    className: 'md:col-span-2 md:col-start-3 md:row-start-1',
    mediaClassName: 'h-[8.5rem] sm:h-[9.5rem]',
  },
  {
    title: 'Айдентика',
    description: 'Придумываем логотип, типографику, графический язык. Собираем брендбук, по которому ваш подрядчик соберёт макет без вопросов к нам.',
    icon: Sparkles,
    image: 'https://media.yapil.art/services/%D0%B0%D0%B9%D0%B4%D0%B5%D0%BD%D1%82%D0%B8%D0%BA%D0%B0.webp',
    caseBadge: 'Кейс // Compass Management',
    caseLink: '/case/compass-management',
    className: 'md:col-span-2 md:row-span-2 md:col-start-5 md:row-start-1',
    mediaClassName: 'h-[13rem] sm:h-[15rem] md:h-full min-h-[13rem]',
  },
  {
    title: 'SMM',
    description: 'Собираем концепцию профиля, шаблоны постов, рекламные креативы, сторис.',
    icon: Share2,
    image: 'https://media.yapil.art/services/smm.webp',
    caseBadge: 'Кейс // Gippo',
    caseLink: '/case/gippo',
    className: 'md:col-span-2 md:col-start-3 md:row-start-2',
    mediaClassName: 'h-[8.5rem] sm:h-[9.5rem]',
  },
  {
    title: 'Презентации',
    description: 'Оформляем инвест-питчи, коммерческие предложения, годовые отчёты. Переводим цифры в схемы, графики, инфографику.',
    icon: BarChart3,
    image: 'https://media.yapil.art/services/%D0%BF%D1%80%D0%B5%D0%B7%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D0%B8.webp',
    caseBadge: 'Кейс // Parking24',
    caseLink: '/case/parking24',
    className: 'md:col-span-3 md:col-start-1 md:row-start-3',
    mediaClassName: 'h-[9rem] sm:h-[10.5rem]',
  },
  {
    title: 'Дизайн-поддержка',
    description: 'Работаем как ваш внешний арт-отдел: закрываем регулярные задачи, готовим промо, держим стиль по гайдлайну.',
    icon: RefreshCw,
    image: 'https://media.yapil.art/case/puma.f50f6869fb898fec.webp?v=2',
    caseBadge: 'Кейс // Puma Kazakhstan',
    caseLink: '/case/puma-kazakhstan',
    className: 'md:col-span-3 md:col-start-4 md:row-start-3',
    mediaClassName: 'h-[9rem] sm:h-[10.5rem]',
  },
];

export default function BentoGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="py-20 text-white md:py-28"
      style={{
        background: 'linear-gradient(to bottom, #181818 0%, #131314 50%, #0b0b0c 100%)',
      }}
    >
      <div className="container">
        <div className="mb-10 grid grid-cols-1 gap-4 md:mb-14 md:grid-cols-12 md:gap-[var(--grid-gap)] md:items-end">
          <h2 id="services-title" className="col-span-1 md:col-span-7 text-[clamp(2.5rem,6vw,5rem)] font-normal leading-[1] tracking-[-0.055em] m-0">
            Услуги
          </h2>
          <p className="col-span-1 md:col-start-9 md:col-span-4 text-base leading-[1.3] text-white/55 m-0">
            Собираем сайты, бренды и коммуникации — от стратегии до ежедневного контента.
          </p>
        </div>

        {/* Bento Grid layout with real project case photography */}
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18.5rem] lg:auto-rows-[19.5rem] md:gap-[var(--grid-gap)] list-none p-0 m-0">
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.li
                key={card.title}
                className={`${card.className} group relative flex flex-col overflow-hidden border border-white/10 bg-[#222222] p-5 transition-all duration-400 hover:border-white/25 hover:bg-[#252525] sm:p-6`}
                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.65, delay: reduceMotion ? 0 : index * 0.07, ease }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
              >
                {/* Subtle top inner gradient for depth */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Project Case Photo Presentation */}
                <div className="min-h-0 flex-1 flex flex-col mb-4 overflow-hidden">
                  <a
                    href={card.caseLink}
                    className={`relative w-full ${card.mediaClassName || 'h-full'} overflow-hidden border border-white/10 bg-[#161616] group/media block cursor-pointer`}
                    tabIndex={-1}
                    aria-label={`Кейс: ${card.title}`}
                  >
                    <img
                      src={card.image}
                      alt={`${card.title} — ${card.caseBadge}`}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for Legibility */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Case Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 border border-white/15 bg-black/60 px-2 py-0.5 backdrop-blur-md">
                      <span className="size-1.5 rounded-full bg-[#FD4B32]" />
                      <span className="font-mono text-[0.55rem] uppercase tracking-wider text-white/90">
                        {card.caseBadge}
                      </span>
                    </div>

                    {/* Quick Link Arrow Button */}
                    <div className="absolute top-2.5 right-2.5 size-5 border border-white/20 bg-black/60 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <ArrowUpRight className="size-3 text-white" />
                    </div>
                  </a>
                </div>

                {/* Card Title & Info */}
                <div className="relative z-10 mt-auto flex flex-col">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-[#FD4B32]" />
                    </div>
                    <a
                      href={card.caseLink}
                      className="font-mono text-[0.6rem] text-white/40 uppercase tracking-wider hover:text-white transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      Кейс <ArrowUpRight className="size-2.5" />
                    </a>
                  </div>
                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    <h3 className="m-0 p-0 text-xl sm:text-[1.85rem] lg:text-[2rem] font-normal leading-[1] tracking-[-0.035em] text-white">
                      {card.title}
                    </h3>
                    <p className="m-0 p-0 text-sm leading-[1.3] text-white/50">{card.description}</p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
