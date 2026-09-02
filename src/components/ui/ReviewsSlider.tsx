import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { reviewsData, reviewsDataEn, typograph, type ReviewItem } from '../../data/reviewsData';

interface ReviewsSliderProps {
  theme?: 'dark' | 'light';
  items?: ReviewItem[];
  autoplayInterval?: number;
  lang?: 'ru' | 'en';
}

export default function ReviewsSlider({
  theme = 'dark',
  items,
  autoplayInterval = 7000,
  lang = 'ru',
}: ReviewsSliderProps) {
  const currentItems = items ?? (lang === 'en' ? reviewsDataEn : reviewsData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [activeReviewModal, setActiveReviewModal] = useState<ReviewItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const isLight = theme === 'light';
  const isEn = lang === 'en';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = currentItems.length;
  const currentItem = currentItems[currentIndex];

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Autoplay timer with pause on hover/focus and tab visibility check
  useEffect(() => {
    if (isPaused || activeReviewModal !== null || total <= 1) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleNext();
      }
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [isPaused, activeReviewModal, total, handleNext, autoplayInterval]);

  // Keyboard navigation when slider is focused or modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeReviewModal) {
        if (e.key === 'Escape') {
          setActiveReviewModal(null);
        }
        return;
      }

      if (
        containerRef.current &&
        containerRef.current.contains(document.activeElement)
      ) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReviewModal, handlePrev, handleNext]);

  // Lock body scroll and pause Lenis when modal is open
  useEffect(() => {
    if (activeReviewModal) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('overflow-hidden');
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.stop();
      }
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.classList.remove('overflow-hidden');
        if (typeof window !== 'undefined' && (window as any).lenis) {
          (window as any).lenis.start();
        }
      };
    }
  }, [activeReviewModal]);

  // Slide transition animation variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 32 },
        opacity: { duration: 0.35, ease: 'easeOut' as const },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 32 },
        opacity: { duration: 0.25, ease: 'easeIn' as const },
      },
    }),
  };

  const imageVariants: Variants = {
    enter: () => ({
      scale: 0.96,
      opacity: 0,
    }),
    center: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
    exit: () => ({
      scale: 0.96,
      opacity: 0,
      transition: {
        duration: 0.25,
        ease: 'easeIn' as const,
      },
    }),
  };

  const formattedCurrent = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(total).padStart(2, '0');

  return (
    <>
      <section
        ref={containerRef}
        id="reviews"
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label={isEn ? 'Client feedback' : 'Отзывы клиентов'}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className={`relative z-10 w-full overflow-hidden transition-colors duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FD4B32] ${
          isLight
            ? 'text-[#1D1D1D]'
            : 'text-white'
        }`}
        style={{
          paddingBlock: 'clamp(4.5rem, 8vw, 8rem)',
          background: isLight
            ? 'linear-gradient(to bottom, transparent 0%, #EAE5DF 100%)'
            : 'linear-gradient(to bottom, transparent 0%, #181818 100%)',
        }}
      >
        <div className="container">
          {/* Top Control Bar aligned to 12-column grid */}
          <header
            className={`grid grid-cols-12 gap-[var(--grid-gap)] items-center border-b pb-6 md:pb-8 transition-colors duration-300 ${
              isLight ? 'border-black/10' : 'border-white/10'
            }`}
          >
            {/* Left: Section Tag (cols 1-3) */}
            <div className="col-span-6 sm:col-span-5 md:col-start-1 md:col-span-3 flex items-center">
              <span
                className={`text-xs md:text-sm font-semibold tracking-wider uppercase ${
                  isLight ? 'text-[#1D1D1D]/90' : 'text-white/90'
                }`}
                style={{ fontVariationSettings: "'wght' 600" }}
              >
                {isEn ? 'Client feedback' : 'Что говорят клиенты'}
              </span>
            </div>

            {/* 4th Column: Slide Counter (starts at 4th column, aligned with the quote block below) */}
            <div
              className={`col-span-2 md:col-start-4 md:col-span-2 hidden md:flex items-center font-mono text-xs md:text-sm tracking-widest select-none ${
                isLight ? 'text-black/50' : 'text-white/50'
              }`}
              aria-live="polite"
              aria-atomic="true"
            >
              <span>{formattedCurrent}</span>
              <span className="mx-1.5 opacity-40">/</span>
              <span>{formattedTotal}</span>
            </div>

            {/* Right: Round Navigation Buttons (cols 6-12 / right-aligned) */}
            <div className="col-span-6 sm:col-span-7 md:col-start-6 md:col-span-7 flex items-center justify-end gap-2.5 sm:gap-3">
              {/* Mobile / Tablet Counter */}
              <div
                className={`md:hidden font-mono text-xs tracking-widest select-none mr-2 ${
                  isLight ? 'text-black/50' : 'text-white/50'
                }`}
              >
                <span>{formattedCurrent}</span>
                <span className="mx-1 opacity-40">/</span>
                <span>{formattedTotal}</span>
              </div>

              <button
                type="button"
                onClick={handlePrev}
                aria-label={isEn ? 'Previous review' : 'Предыдущий отзыв'}
                className={`group flex items-center justify-center p-1.5 sm:p-2 bg-transparent border-0 outline-none transition-colors duration-200 cursor-pointer ${
                  isLight
                    ? 'text-[#1D1D1D] hover:text-[#FD4B32]'
                    : 'text-white hover:text-[#FD4B32]'
                }`}
              >
                <ArrowLeft
                  className="size-5 sm:size-6 transition-transform duration-200 group-hover:-translate-x-1"
                  strokeWidth={1.5}
                />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label={isEn ? 'Next review' : 'Следующий отзыв'}
                className={`group flex items-center justify-center p-1.5 sm:p-2 bg-transparent border-0 outline-none transition-colors duration-200 cursor-pointer ${
                  isLight
                    ? 'text-[#1D1D1D] hover:text-[#FD4B32]'
                    : 'text-white hover:text-[#FD4B32]'
                }`}
              >
                <ArrowRight
                  className="size-5 sm:size-6 transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </header>

          {/* Main Review Content Slider aligned to 12-column grid */}
          <div
            className="relative mt-8 md:mt-12 lg:mt-16 touch-pan-y"
            aria-live="polite"
          >
            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.div
                key={currentItem.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 60) {
                    handlePrev();
                  } else if (info.offset.x < -60) {
                    handleNext();
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-12 gap-[var(--grid-gap)] items-start cursor-grab active:cursor-grabbing"
              >
                {/* Left Column (cols 1-2): Completed Project Preview & Caption (Hidden on Mobile) */}
                <div className="hidden md:flex md:col-span-2 flex-col gap-2">
                  <a
                    href={currentItem.projectUrl}
                    className="group block overflow-hidden relative border transition-all duration-300"
                    style={{
                      borderColor: isLight
                        ? 'rgba(0,0,0,0.1)'
                        : 'rgba(255,255,255,0.12)',
                      background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.03)',
                    }}
                    tabIndex={0}
                    aria-label={`Кейс ${currentItem.projectTitle}`}
                  >
                    <motion.div
                      custom={direction}
                      variants={imageVariants}
                      initial={false}
                      animate="center"
                      exit="exit"
                      className="relative aspect-[4/3] w-full overflow-hidden bg-black/5"
                    >
                      <img
                        src={currentItem.projectImage}
                        alt={`Кейс — ${currentItem.projectTitle}`}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-0"
                        style={{
                          background: isLight
                            ? 'rgba(0,0,0,0.02)'
                            : 'rgba(255,255,255,0.02)',
                        }}
                      />
                    </motion.div>
                  </a>

                  {/* Project Caption */}
                  <a
                    href={currentItem.projectUrl}
                    className={`text-xs sm:text-sm font-medium tracking-tight transition-colors duration-200 self-start ${
                      isLight
                        ? 'text-[#1D1D1D]/75 hover:text-[#FD4B32]'
                        : 'text-white/75 hover:text-[#FD4B32]'
                    }`}
                  >
                    {currentItem.projectTitle}
                  </a>
                </div>

                {/* Right Column (cols 4-11): Large Quote Typography, Author Row & Full Review Button */}
                <div className="col-span-12 md:col-start-4 md:col-span-8 flex flex-col justify-between">
                  <div>
                    {/* Editorial Quote Text with inline opening quote mark */}
                    <blockquote
                      className={`m-0 p-0 font-medium tracking-tight text-pretty ${
                        isLight ? 'text-[#1D1D1D]' : 'text-white'
                      }`}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'clamp(1.35rem, 2.5vw, 2.35rem)',
                        lineHeight: '1.24',
                        letterSpacing: '-0.025em',
                      }}
                    >
                      <span
                        className="font-serif mr-2.5 select-none inline-block align-top text-3xl sm:text-4xl md:text-5xl"
                        style={{
                          fontFamily: 'var(--font-display)',
                          color: isLight ? '#1D1D1D' : '#FFFFFF',
                          lineHeight: '0.8',
                        }}
                        aria-hidden="true"
                      >
                        “
                      </span>
                      {typograph(currentItem.quote)}
                    </blockquote>
                  </div>

                  {/* Author Block & Full Review Button aligned with Column 4 */}
                  <footer className="mt-8 md:mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-5 transition-colors duration-300"
                    style={{
                      borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* Author info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={currentItem.avatar}
                        alt={currentItem.author}
                        loading="lazy"
                        decoding="async"
                        width={56}
                        height={56}
                        className={`size-12 sm:size-14 rounded-none object-cover border flex-shrink-0 ${
                          isLight
                            ? 'border-black/10 bg-black/5'
                            : 'border-white/15 bg-white/5'
                        }`}
                      />
                      <div className="flex flex-col">
                        <span
                          className={`text-base sm:text-lg font-semibold leading-tight ${
                            isLight ? 'text-[#1D1D1D]' : 'text-white'
                          }`}
                        >
                          {currentItem.author}
                        </span>
                        <span
                          className={`text-xs sm:text-sm leading-normal mt-0.5 ${
                            isLight ? 'text-black/60' : 'text-white/60'
                          }`}
                        >
                          {currentItem.role}
                          {currentItem.company ? `, ${currentItem.company}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* "Полный отзыв" Button (Without container) */}
                    {currentItem.fullReview && (
                      <button
                        type="button"
                        onClick={() => setActiveReviewModal(currentItem)}
                        className={`group/btn inline-flex items-center gap-2 text-xs sm:text-sm font-medium bg-transparent border-0 p-0 cursor-pointer transition-colors duration-200 ${
                          isLight
                            ? 'text-[#1D1D1D] hover:text-[#FD4B32]'
                            : 'text-white hover:text-[#FD4B32]'
                        }`}
                      >
                        <span>{isEn ? 'Full review' : 'Полный отзыв'}</span>
                        <ArrowRight
                          className="size-3.5 sm:size-4 transition-transform duration-200 group-hover/btn:translate-x-1 text-[#FD4B32]"
                          strokeWidth={2}
                        />
                      </button>
                    )}
                  </footer>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Full Review Modal Portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeReviewModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                }}
                className={`fixed inset-0 w-screen h-screen z-[9990] overflow-y-auto md:overflow-hidden overscroll-contain transition-colors duration-300 ${
                  isLight
                    ? 'bg-black/10 text-[#1D1D1D]'
                    : 'bg-black/10 text-white'
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-review-title"
                onClick={() => setActiveReviewModal(null)}
                data-lenis-prevent="true"
              >
                {/* Standalone close button without container */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveReviewModal(null);
                  }}
                  aria-label={isEn ? 'Close review' : 'Закрыть отзыв'}
                  className={`fixed top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-[9999] p-2 bg-transparent border-0 outline-none cursor-pointer transition-colors duration-200 ${
                    isLight
                      ? 'text-[#1D1D1D] hover:text-[#FD4B32]'
                      : 'text-white hover:text-[#FD4B32]'
                  }`}
                >
                  <X className="size-7 sm:size-8 stroke-[1.5]" />
                </button>

                {/* 12-Column Grid Container */}
                <div className="container min-h-screen md:min-h-0 md:h-screen pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-start relative box-border md:overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-12 md:gap-[var(--grid-gap)] items-stretch w-full md:h-full md:max-h-full gap-y-10 min-h-0 md:overflow-hidden">
                    {/* Left Part: Author Profile & Case Link (Columns 1-4, Pinned) */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="col-span-1 md:col-start-1 md:col-span-4 flex flex-col justify-between h-auto md:h-full min-h-0 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Top section: Author Name, then Avatar and Role */}
                      <div>
                        <h2
                          id="modal-review-title"
                          className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-[-0.04em] m-0 leading-[0.9] mb-6 sm:mb-8 md:mb-10 ${
                            isLight ? 'text-[#1D1D1D]' : 'text-white'
                          }`}
                          style={{ fontFamily: 'var(--font-display)', lineHeight: '0.9' }}
                        >
                          {activeReviewModal.author}
                        </h2>

                        <div className="flex items-center gap-4">
                          <img
                            src={activeReviewModal.avatar}
                            alt={activeReviewModal.author}
                            width={64}
                            height={64}
                            className={`size-14 sm:size-16 rounded-none object-cover border flex-shrink-0 ${
                              isLight
                                ? 'border-black/10 bg-black/5'
                                : 'border-white/15 bg-white/5'
                            }`}
                          />
                          <div>
                            <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#FD4B32]">
                              {isEn ? 'Client Review' : 'Отзыв клиента'}
                            </span>
                            <p
                              className={`text-xs sm:text-sm mt-0.5 m-0 ${
                                isLight ? 'text-[#1D1D1D]/60' : 'text-white/60'
                              }`}
                            >
                              {activeReviewModal.role}
                              {activeReviewModal.company ? `, ${activeReviewModal.company}` : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom section: Case Link (Aligned to bottom) */}
                      {activeReviewModal.projectUrl && (
                        <div className="pt-10 md:pt-16 mt-8 md:mt-auto">
                          <a
                            href={activeReviewModal.projectUrl}
                            className={`inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-medium rounded-[100px] backdrop-blur-2xl transition-all duration-300 border no-underline ${
                              isLight
                                ? 'border-black/[0.08] bg-white/80 text-[#1D1D1D] hover:border-[#FD4B32]/50 hover:bg-white hover:text-[#FD4B32]'
                                : 'border-white/10 bg-white/[0.04] text-white hover:border-white/25 hover:bg-white/[0.08] hover:text-[#FD4B32]'
                            }`}
                          >
                            <span>{isEn ? 'View project case' : 'Смотреть кейс проекта'}</span>
                            <ArrowUpRight className="size-3.5 sm:size-4 text-[#FD4B32]" />
                          </a>
                        </div>
                      )}
                    </motion.div>

                    {/* Right Part: Dedicated Scrollable Review Container (Columns 5-10) */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                      data-lenis-prevent="true"
                      className={`col-span-1 md:col-start-5 md:col-span-6 flex flex-col h-auto md:h-full md:max-h-[calc(100vh-7rem)] min-h-0 md:overflow-y-auto md:overscroll-contain pr-2 md:pr-6 pb-12 md:pb-16 ${
                        isLight
                          ? '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/15 hover:[&::-webkit-scrollbar-thumb]:bg-black/30 [&::-webkit-scrollbar-thumb]:rounded-full'
                          : '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-full'
                      }`}
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: isLight ? 'rgba(0,0,0,0.2) transparent' : 'rgba(255,255,255,0.25) transparent',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Inner constrained container for optimal 60-75 character line length */}
                      <div className="max-w-[42rem] xl:max-w-[44rem] flex flex-col">
                        {/* Lead Title / Key Quote */}
                        {(activeReviewModal.fullReview?.lead || activeReviewModal.quote) && (
                          <h3
                            className={`m-0 p-0 font-medium tracking-tight text-pretty ${
                              isLight ? 'text-[#1D1D1D]' : 'text-white'
                            }`}
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: 'clamp(1.35rem, 2.1vw, 2.1rem)',
                              lineHeight: '1.24',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {typograph(activeReviewModal.fullReview?.lead || activeReviewModal.quote)}
                          </h3>
                        )}

                        {/* Paragraphs in editorial body style */}
                        {activeReviewModal.fullReview?.paragraphs && (
                          <div className="space-y-4 pt-3">
                            {activeReviewModal.fullReview.paragraphs.map((p, idx) => (
                              <p
                                key={idx}
                                className={`text-base sm:text-lg md:text-xl font-normal m-0 text-pretty ${
                                  isLight ? 'text-[#1D1D1D]/85' : 'text-white/85'
                                }`}
                                style={{
                                  fontFamily: 'var(--font-body)',
                                  lineHeight: '1.4',
                                }}
                              >
                                {typograph(p)}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Structured Sections with Theory of Proximity spacing */}
                        {activeReviewModal.fullReview?.sections && (
                          <div className="flex flex-col">
                            {activeReviewModal.fullReview.sections.map((section, sIdx) => (
                              <div
                                key={sIdx}
                                className="mt-8 sm:mt-10 md:mt-12 first:mt-6 sm:first:mt-8"
                              >
                                <h4
                                  className="text-base sm:text-lg font-semibold tracking-tight m-0 mb-2.5 sm:mb-3 text-[#FD4B32]"
                                  style={{ fontFamily: 'var(--font-body)' }}
                                >
                                  {typograph(section.title)}
                                </h4>
                                {section.items && (
                                  <ul className="space-y-2.5 sm:space-y-3 pl-5 m-0 list-disc marker:text-[#FD4B32]">
                                    {section.items.map((item, iIdx) => (
                                      <li
                                        key={iIdx}
                                        className={`text-base sm:text-lg text-pretty ${
                                          isLight ? 'text-[#1D1D1D]/85' : 'text-white/85'
                                        }`}
                                        style={{
                                          fontFamily: 'var(--font-body)',
                                          lineHeight: '1.38',
                                        }}
                                      >
                                        {typograph(item)}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                {section.text && (
                                  <p
                                    className={`text-base sm:text-lg m-0 text-pretty ${
                                      isLight ? 'text-[#1D1D1D]/85' : 'text-white/85'
                                    }`}
                                    style={{
                                      fontFamily: 'var(--font-body)',
                                      lineHeight: '1.38',
                                    }}
                                  >
                                    {typograph(section.text)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
