import { Award, Briefcase, RefreshCw, Shapes } from 'lucide-react';

const cards = [
  {
    id: 'experience',
    icon: Award,
    title: (
      <>
        8&nbsp;лет
        <br />
        в&nbsp;дизайне
      </>
    ),
    text: 'Ведём проекты в\u00A0инфобизнесе и\u00A0в\u00A0корпоративном секторе. Лендинг для\u00A0трейдера и\u00A0полиграфия для\u00A0сети стрит-фуда требуют разного, мы\u00A0умеем и\u00A0то, и\u00A0другое.',
  },
  {
    id: 'full-cycle',
    icon: RefreshCw,
    title: (
      <>
        Полный
        <br />
        цикл
      </>
    ),
    text: 'Один проект ведёт один дизайнер: от\u00A0первой концепции до\u00A0финальной правки в\u00A0типографии. Ничего не\u00A0отдаём на\u00A0аутсорс.',
  },
  {
    id: 'agency',
    icon: Briefcase,
    title: (
      <>
        Опыт
        <br />
        агентства
      </>
    ),
    text: 'Яков\u00A0— сооснователь и\u00A0ключевой дизайнер thepeak.kz. Оттуда мы\u00A0принесли процессы, которые держат сроки на\u00A0больших проектах.',
  },
  {
    id: 'three-directions',
    icon: Shapes,
    title: (
      <>
        Три направления
        <br />
        в&nbsp;одних руках
      </>
    ),
    text: 'Бренд, сайт и\u00A0печать делает одна команда, поэтому логотип не\u00A0разъезжается с\u00A0сайтом, а\u00A0сайт\u00A0— с\u00A0буклетом.',
  },
];

export default function AboutCompact() {
  return (
    <section
      id="about-compact"
      aria-label="О студии в деталях"
      className="relative z-10 pt-6 pb-16 md:pb-24 text-white"
      style={{
        background:
          'linear-gradient(to top, #181818 0%, rgba(24, 24, 24, 0.96) 20%, rgba(24, 24, 24, 0.8) 42%, rgba(24, 24, 24, 0.45) 68%, rgba(24, 24, 24, 0.15) 86%, transparent 100%)',
      }}
    >
      <div className="container">
        {/* 4 Compact Cards Grid with Clean Lucide Icons */}
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-[var(--grid-gap)] list-none p-0 m-0">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <li
                key={card.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-white/10 bg-white/[0.04] p-7 sm:p-8 backdrop-blur-2xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08] min-h-[20rem] sm:min-h-[26rem] lg:min-h-[30rem]"
              >
                {/* Top: Title and description (Headings perfectly aligned along the same horizontal line) */}
                <div className="flex flex-col gap-5 sm:gap-6">
                  <h3
                    className="m-0 p-0 text-2xl sm:text-[2rem] font-normal leading-[1.05] tracking-[-0.035em] text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {card.title}
                  </h3>
                  <p className="m-0 p-0 text-base leading-[1.3] text-white/80 text-pretty">
                    {card.text}
                  </p>
                </div>

                {/* Bottom: Clean Icon pinned to bottom */}
                <div className="mt-auto pt-8 flex items-end">
                  <Icon className="size-6 sm:size-7 text-white transition-transform duration-300 group-hover:scale-110" strokeWidth={1.75} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
