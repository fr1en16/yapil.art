// ============================================================================
// НЕЙРОИЛЛЮСТРАШКИ (Схематичные векторные иллюстрации услуг)
// Резервная копия компонента услуг с векторной штриховой графикой
// ============================================================================

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  BarChart3,
  Bookmark,
  Check,
  CheckCircle2,
  Heart,
  Layers,
  LayoutTemplate,
  Lock,
  MessageCircle,
  MousePointer2,
  RefreshCw,
  Share2,
  Sparkles,
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

/* =========================================================================
   01. САЙТЫ (SitesPreview)
   ========================================================================= */
function SitesPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-full w-full items-center justify-center p-2 sm:p-3">
      <motion.div
        className="relative w-full max-w-[17.5rem] sm:max-w-[18.5rem] overflow-hidden border border-white/15 bg-[#121212] p-3 shadow-2xl backdrop-blur-md transition-all duration-500 group-hover:border-white/30 group-hover:bg-[#151515]"
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#FD4B32]" />
            <span className="size-1.5 rounded-full bg-white/30" />
            <span className="size-1.5 rounded-full bg-white/20" />
          </div>
          <div className="flex items-center gap-1.5 rounded-none border border-white/10 bg-white/[0.04] px-2 py-0.5 text-white/70">
            <Lock className="size-2 text-[#FD4B32]" />
            <span className="font-mono text-[0.55rem] tracking-tight">yapil.art / studio</span>
          </div>
          <div className="w-3" />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.5rem] tracking-widest text-[#FD4B32] uppercase">
              01 // Digital Core
            </span>
            <span className="font-mono text-[0.5rem] text-white/40">GRID 12-COL</span>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-2.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1">
                <div className="h-2 w-4/5 bg-white/90" />
                <div className="h-1.5 w-3/5 bg-white/40" />
              </div>
              <div className="size-5 border border-dashed border-[#FD4B32]/60 flex items-center justify-center">
                <span className="font-mono text-[0.45rem] text-[#FD4B32]">Я</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 bg-[#FD4B32] px-2.5 py-1 text-white shadow-sm shadow-[#FD4B32]/30 transition-transform group-hover:scale-[1.02]">
                <span className="font-mono text-[0.55rem] font-medium tracking-tight">Start Project</span>
                <ArrowUpRight className="size-2.5" />
              </div>
              <div className="flex items-center gap-1">
                <span className="size-1 rounded-full bg-emerald-400" />
                <span className="font-mono text-[0.5rem] text-white/50">ONLINE</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="border border-white/10 bg-white/[0.03] p-2 flex flex-col justify-between h-14">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[0.45rem] text-white/40">SEC // 01</span>
                <span className="size-1 rounded-full bg-[#FD4B32]" />
              </div>
              <div className="space-y-1">
                <div className="h-1 w-full bg-white/30" />
                <div className="h-1 w-2/3 bg-white/20" />
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-2 flex flex-col justify-between h-14">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[0.45rem] text-white/40">METRIC</span>
                <span className="font-mono text-[0.5rem] font-semibold text-[#FD4B32]">99.8%</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-4/5 bg-white/50" />
                <div className="h-0.5 w-1/2 bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="pointer-events-none absolute right-4 bottom-5"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, -10, 4, 0],
                  y: [0, -8, 2, 0],
                }
          }
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MousePointer2 className="size-3.5 fill-[#FD4B32] text-[#FD4B32] drop-shadow-md" />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* =========================================================================
   02. ПОЛИГРАФИЯ (PrintPreview)
   ========================================================================= */
function PrintPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-full w-full items-center justify-center p-2">
      <div className="relative flex items-center justify-center w-full max-w-[18rem] h-[13.5rem]">
        <span className="absolute -top-1 -left-1 font-mono text-[0.55rem] text-white/30 select-none">+</span>
        <span className="absolute -top-1 -right-1 font-mono text-[0.55rem] text-white/30 select-none">+</span>
        <span className="absolute -bottom-1 -left-1 font-mono text-[0.55rem] text-white/30 select-none">+</span>
        <span className="absolute -bottom-1 -right-1 font-mono text-[0.55rem] text-white/30 select-none">+</span>

        <motion.div
          className="absolute -left-1 top-2 h-26 w-36 sm:h-28 sm:w-38 border border-white/15 bg-[#121212] p-2.5 shadow-xl backdrop-blur-sm transition-all duration-500 group-hover:-translate-x-3 group-hover:-translate-y-2 group-hover:border-white/25"
          animate={reduceMotion ? undefined : { y: [0, -3, 0], rotate: [-4, -3, -4] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute inset-y-0 left-1/2 w-px border-r border-dashed border-white/20" />
          <div className="grid grid-cols-2 gap-2 h-full">
            <div className="flex flex-col justify-between pr-1">
              <span className="font-mono text-[0.45rem] text-white/40 tracking-wider">P. 12 // EDITORIAL</span>
              <div className="space-y-1 my-auto">
                <div className="h-1 w-full bg-white/40" />
                <div className="h-0.5 w-4/5 bg-white/20" />
                <div className="h-0.5 w-full bg-white/20" />
                <div className="h-0.5 w-2/3 bg-white/15" />
              </div>
              <div className="h-0.5 w-3 bg-[#FD4B32]" />
            </div>

            <div className="flex flex-col justify-between pl-1">
              <div className="h-8 w-full border border-white/15 bg-white/[0.04] p-1 flex flex-col justify-end">
                <div className="h-1 w-2/3 bg-[#FD4B32]" />
              </div>
              <div className="space-y-0.5">
                <div className="h-0.5 w-full bg-white/25" />
                <div className="h-0.5 w-3/5 bg-white/15" />
              </div>
              <span className="font-mono text-[0.4rem] text-white/30 self-end">350 GSM</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute right-0 top-3 z-10 flex h-26 w-32 sm:h-28 sm:w-34 flex-col justify-between border border-white/20 bg-[#161616] p-2.5 shadow-2xl backdrop-blur-md transition-all duration-500 group-hover:translate-x-3 group-hover:rotate-[4deg] group-hover:border-white/35"
          animate={reduceMotion ? undefined : { y: [0, -4, 0], rotate: [3, 4, 3] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex justify-between items-center">
            <span className="font-mono text-[0.45rem] tracking-wider text-[#FD4B32] font-semibold">DIE-CUT SPEC</span>
            <div className="flex gap-0.5">
              <span className="size-1 bg-[#00E5FF]" title="Cyan" />
              <span className="size-1 bg-[#FF007F]" title="Magenta" />
              <span className="size-1 bg-[#FFE600]" title="Yellow" />
              <span className="size-1 bg-white" title="Black" />
            </div>
          </div>

          <div className="my-auto flex items-center gap-2 border border-white/10 bg-white/[0.03] p-1.5">
            <div className="size-7 border border-[#FD4B32] bg-[#FD4B32]/10 flex items-center justify-center shrink-0">
              <span className="font-serif text-xs font-normal text-[#FD4B32]">Я</span>
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="block font-mono text-[0.45rem] font-semibold text-white/90 truncate">YAPIL PRINT</span>
              <span className="block font-mono text-[0.4rem] text-white/40">COTTON • EMBOSS</span>
            </div>
          </div>

          <div className="border-t border-dashed border-white/15 pt-1 flex justify-between items-center">
            <span className="font-mono text-[0.4rem] text-white/40">CUT LINE 2.0mm</span>
            <span className="size-1 rounded-full bg-[#FD4B32]" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* =========================================================================
   03. АЙДЕНТИКА (IdentityPreview)
   ========================================================================= */
function IdentityPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-full w-full items-center justify-center p-3 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-36 rounded-full border border-dashed border-white/10" />
        <div className="absolute size-28 rounded-full border border-white/10" />
        <div className="absolute size-20 rounded-full border border-[#FD4B32]/25" />
        <div className="absolute h-44 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
        <div className="absolute w-44 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute h-40 w-px rotate-45 bg-gradient-to-b from-transparent via-[#FD4B32]/30 to-transparent" />
      </div>

      <motion.div
        className="relative flex size-28 sm:size-32 items-center justify-center border border-white/15 bg-[#141414]/90 backdrop-blur-md shadow-2xl transition-all duration-500 group-hover:border-white/30"
        animate={reduceMotion ? undefined : { scale: [1, 1.02, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="absolute -top-3.5 left-0 font-mono text-[0.45rem] tracking-wider text-white/40">
          W: 120 // H: 120
        </span>
        <span className="absolute -bottom-3.5 right-0 font-mono text-[0.45rem] tracking-wider text-[#FD4B32]">
          R 45.0°
        </span>

        <div className="absolute -top-1 -left-1 size-2 border border-white/40 bg-[#121212]" />
        <div className="absolute -top-1 -right-1 size-2 border border-white/40 bg-[#121212]" />
        <div className="absolute -bottom-1 -left-1 size-2 border border-white/40 bg-[#121212]" />
        <div className="absolute -bottom-1 -right-1 size-2 border border-white/40 bg-[#121212]" />

        <div className="absolute -top-4 right-3 flex items-center gap-1">
          <div className="h-3 w-px bg-[#FD4B32]" />
          <div className="size-1.5 rounded-full bg-[#FD4B32] shadow-sm shadow-[#FD4B32]/50" />
        </div>

        <div className="relative flex items-center justify-center">
          <span className="select-none font-serif text-4xl sm:text-5xl font-normal tracking-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
            Я
          </span>
          <div className="pointer-events-none absolute size-14 border border-dashed border-[#FD4B32]/40 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================================
   04. SMM (SmmPreview)
   ========================================================================= */
function SmmPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-full w-full items-center justify-center p-2">
      <motion.div
        className="w-full max-w-[13.5rem] sm:max-w-[14.5rem] overflow-hidden border border-white/15 bg-[#121212] p-2.5 shadow-2xl backdrop-blur-md transition-all duration-500 group-hover:border-white/30"
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="mb-2 flex gap-1">
          <div className="h-0.5 flex-1 bg-white/70" />
          <div className="h-0.5 flex-1 bg-[#FD4B32]" />
          <div className="h-0.5 flex-1 bg-white/20" />
        </div>

        <div className="mb-2 flex items-center justify-between text-white/80">
          <div className="flex items-center gap-1.5">
            <div className="grid size-4 place-items-center rounded-full bg-white/10 border border-white/20 font-serif text-[0.5rem] text-white">
              Я
            </div>
            <span className="font-mono text-[0.55rem] font-medium text-white">@yapil.art</span>
            <CheckCircle2 className="size-2.5 text-[#FD4B32]" />
          </div>
          <span className="font-mono text-[0.45rem] text-white/40">2h ago</span>
        </div>

        <div className="relative flex aspect-16/9 flex-col justify-between overflow-hidden border border-white/10 bg-gradient-to-br from-[#1c1c1c] to-[#101010] p-2.5">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[0.45rem] tracking-wider text-[#FD4B32] uppercase">Visual Drop</span>
            <span className="font-mono text-[0.45rem] text-white/50">04 // 12</span>
          </div>

          <div className="space-y-1">
            <div className="h-1.5 w-3/4 bg-white/90" />
            <div className="h-1 w-1/2 bg-white/40" />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <div className="h-0.5 w-1/3 bg-[#FD4B32]" />
            <span className="font-mono text-[0.4rem] text-white/40">YAPIL.ART</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-white/60">
          <div className="flex items-center gap-2">
            <Heart className="size-3 fill-[#FD4B32] text-[#FD4B32]" />
            <MessageCircle className="size-3 hover:text-white transition-colors" />
            <Share2 className="size-3 hover:text-white transition-colors" />
          </div>
          <Bookmark className="size-3 hover:text-white transition-colors" />
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================================
   05. ПРЕЗЕНТАЦИИ (PresentationPreview)
   ========================================================================= */
function PresentationPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-full w-full items-center justify-center p-2">
      <motion.div
        className="relative aspect-16/9 w-full max-w-[21rem] sm:max-w-[22.5rem] overflow-hidden border border-white/15 bg-[#121212] p-3 shadow-2xl backdrop-blur-md flex flex-col justify-between transition-all duration-500 group-hover:border-white/30"
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.5rem] font-semibold text-[#FD4B32]">SLIDE 08 / 24</span>
            <span className="text-white/20 font-mono text-[0.45rem]">|</span>
            <span className="font-mono text-[0.45rem] tracking-wider text-white/60 uppercase">Investor Pitch Deck</span>
          </div>
          <span className="font-mono text-[0.45rem] text-white/40">SERIES A</span>
        </div>

        <div className="grid grid-cols-12 gap-2 my-auto items-center py-1">
          <div className="col-span-5 border-r border-white/10 pr-2">
            <span className="block font-mono text-[0.45rem] text-white/40 uppercase tracking-wide">Key Growth</span>
            <span className="block font-serif text-2xl sm:text-3xl font-normal leading-none text-[#FD4B32] my-0.5">
              +184%
            </span>
            <span className="block font-mono text-[0.45rem] text-white/60">Annual Metric Yield</span>
          </div>

          <div className="col-span-7 pl-1 space-y-1.5">
            <div>
              <div className="flex justify-between items-center text-[0.45rem] font-mono text-white/50 mb-0.5">
                <span>Q1 // FOUNDATION</span>
                <span>42%</span>
              </div>
              <div className="h-1 w-full bg-white/10 overflow-hidden">
                <div className="h-full w-[42%] bg-white/40" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[0.45rem] font-mono text-white/70 mb-0.5">
                <span className="text-white/90">Q4 // SCALED PRODUCTION</span>
                <span className="text-[#FD4B32] font-semibold">100%</span>
              </div>
              <div className="h-1 w-full bg-white/10 overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-white/50 via-[#FD4B32] to-[#FD4B32]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-1 text-[0.45rem] font-mono text-white/35">
          <span>YAPIL STRATEGY & DESIGN</span>
          <span>CONFIDENTIAL</span>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================================
   06. ДИЗАЙН-ПОДДЕРЖКА (SupportPreview)
   ========================================================================= */
function SupportPreview() {
  const reduceMotion = useReducedMotion();

  const deliverables = [
    {
      id: '01',
      title: 'Brand Kit',
      status: 'COMPLETE',
      active: false,
      badgeColor: 'text-white/40',
    },
    {
      id: '02',
      title: '3D Motion',
      status: 'IN SPRINT',
      active: true,
      badgeColor: 'text-[#FD4B32]',
    },
    {
      id: '03',
      title: 'Guidelines',
      status: 'QUEUED',
      active: false,
      badgeColor: 'text-white/30',
    },
  ];

  return (
    <div className="relative flex h-full w-full items-center justify-center p-2">
      <motion.div
        className="w-full max-w-[20.5rem] sm:max-w-[22rem] overflow-hidden border border-white/15 bg-[#121212] p-3 shadow-2xl backdrop-blur-md flex flex-col justify-between transition-all duration-500 group-hover:border-white/30"
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[0.5rem] font-semibold text-white">DESIGN OPS // SPRINT 14</span>
          </div>
          <div className="flex items-center gap-1 rounded bg-white/[0.04] border border-white/10 px-1.5 py-0.5">
            <span className="size-1.5 rounded-full bg-[#FD4B32] animate-pulse" />
            <span className="font-mono text-[0.45rem] tracking-wider text-[#FD4B32] font-semibold">LIVE SYNC</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {deliverables.map((item) => (
            <div
              key={item.id}
              className={`relative flex aspect-4/3 flex-col justify-between border p-2 ${
                item.active
                  ? 'border-[#FD4B32]/70 bg-[#FD4B32]/[0.08] shadow-sm shadow-[#FD4B32]/20'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.45rem] text-white/40">#{item.id}</span>
                {item.active ? (
                  <span className="size-1.5 rounded-full bg-[#FD4B32]" />
                ) : item.status === 'COMPLETE' ? (
                  <Check className="size-2 text-white/50" />
                ) : (
                  <span className="size-1 rounded-full bg-white/20" />
                )}
              </div>

              <div className="space-y-0.5 my-auto">
                <span className="block font-mono text-[0.55rem] font-medium text-white/90 leading-tight">
                  {item.title}
                </span>
                <span className={`block font-mono text-[0.42rem] tracking-wider font-semibold ${item.badgeColor}`}>
                  {item.status}
                </span>
              </div>

              <div className="h-0.5 w-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full ${
                    item.active
                      ? 'w-3/4 bg-[#FD4B32]'
                      : item.status === 'COMPLETE'
                        ? 'w-full bg-white/40'
                        : 'w-1/4 bg-white/10'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-1 text-[0.45rem] font-mono text-white/35">
          <span>DEDICATED ART DIRECTION</span>
          <span>EST. 24H TURNAROUND</span>
        </div>
      </motion.div>
    </div>
  );
}

const cards = [
  {
    title: 'Сайты',
    description: 'Проектируем структуру, рисуем макеты, верстаем, запускаем. Делаем лендинги, интернет-магазины, сервисы.',
    icon: LayoutTemplate,
    preview: SitesPreview,
    className: 'md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-1',
  },
  {
    title: 'Полиграфия',
    description: 'Разрабатываем упаковку, POS-материалы, мерч, многостраничные издания. Готовим файлы к печати, проверяем цветопробу в типографии.',
    icon: Layers,
    preview: PrintPreview,
    className: 'md:col-span-2 md:col-start-3 md:row-start-1',
  },
  {
    title: 'Айдентика',
    description: 'Придумываем логотип, типографику, графический язык. Собираем брендбук, по которому ваш подрядчик соберёт макет без вопросов к нам.',
    icon: Sparkles,
    preview: IdentityPreview,
    className: 'md:col-span-2 md:row-span-2 md:col-start-5 md:row-start-1',
  },
  {
    title: 'SMM',
    description: 'Собираем концепцию профиля, шаблоны постов, рекламные креативы, сторис.',
    icon: Share2,
    preview: SmmPreview,
    className: 'md:col-span-2 md:col-start-3 md:row-start-2',
  },
  {
    title: 'Презентации',
    description: 'Оформляем инвест-питчи, коммерческие предложения, годовые отчёты. Переводим цифры в схемы, графики, инфографику.',
    icon: BarChart3,
    preview: PresentationPreview,
    className: 'md:col-span-3 md:col-start-1 md:row-start-3',
  },
  {
    title: 'Дизайн-поддержка',
    description: 'Работаем как ваш внешний арт-отдел: закрываем регулярные задачи, готовим промо, держим стиль по гайдлайну.',
    icon: RefreshCw,
    preview: SupportPreview,
    className: 'md:col-span-3 md:col-start-4 md:row-start-3',
  },
];

export default function BentoGridNeuro() {
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
          <h2 id="services-title" className="col-span-1 md:col-span-7 text-[clamp(2.5rem,6vw,5rem)] font-normal leading-[1] tracking-[-0.055em] m-0">Услуги</h2>
          <p className="col-span-1 md:col-start-9 md:col-span-4 text-base leading-[1.3] text-white/55 m-0">Собираем сайты, бренды и коммуникации — от стратегии до ежедневного контента.</p>
        </div>

        <ol className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18.5rem] lg:auto-rows-[19.5rem] md:gap-[var(--grid-gap)] list-none p-0 m-0">
          {cards.map((card, index) => {
            const Preview = card.preview;
            const Icon = card.icon;

            return (
              <motion.li
                key={card.title}
                className={`${card.className} group relative flex cursor-default flex-col overflow-hidden border border-white/10 bg-[#222222] p-5 transition-all duration-300 hover:border-white/25 hover:bg-[#262626] sm:p-6`}
                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.65, delay: reduceMotion ? 0 : index * 0.07, ease }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="min-h-0 flex-1 flex items-center justify-center" aria-hidden="true">
                  <Preview />
                </div>
                <div className="relative z-10 mt-auto pt-2 flex flex-col">
                  <div className="mb-2.5 flex items-center gap-2">
                    <Icon className="size-4 text-[#FD4B32]" />
                  </div>
                  <div className="flex flex-col gap-3 sm:gap-3.5">
                    <h3 className="m-0 p-0 text-xl sm:text-[2rem] font-normal leading-[1] tracking-[-0.035em] text-white">{card.title}</h3>
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
