import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  rotate?: number;
  depth?: number;
  perspective?: number;
  falloff?: number;
  fade?: number;
  cardWidth?: string;
  /** Width divided by height. */
  aspectRatio?: number;
  /** Scale applied to the card currently in the centre. */
  activeScale?: number;
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  label?: string;
  className?: string;
  cardClassName?: string;
  onSlideClick?: (index: number) => void;
}

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = 'clamp(148px, 22vw, 260px)',
  aspectRatio = 1,
  activeScale = 1,
  gap = 0.05,
  loop = true,
  showCaption = false,
  showPagination = false,
  showNavigation = false,
  label = 'Карусель',
  className,
  cardClassName,
  onSlideClick,
}: CoverflowCarouselProps) {
  const count = slides.length;
  const frameRef = React.useRef<HTMLDivElement>(null);
  const captionFrameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const captionRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const captionWidthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
    moved: boolean;
    pitch: number;
  } | null>(null);
  const ignoreClickRef = React.useRef(false);
  const [selected, setSelected] = React.useState(0);

  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  const paint = React.useCallback(() => {
    if (count === 0) return;
    const pos = posRef.current;

    const paintLane = (
      elements: (HTMLButtonElement | null)[],
      width: number,
      blurInactive = false,
    ) => {
      if (!width) return;
      const pitch = width * (1 + gap);

      elements.forEach((element, index) => {
        if (!element) return;
        let offset = index - pos;
        if (loop) {
          offset = ((offset % count) + count) % count;
          if (offset > count / 2) offset -= count;
        }

        const distance = Math.abs(offset);
        const ramp = Math.pow(distance, falloff);
        const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);
        const scale = 1 + (activeScale - 1) * Math.max(0, 1 - distance);
        const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;

        element.style.transform =
          `translateX(calc(-50% + ${offset * pitch}px)) ` +
          `translateY(-50%) translateZ(${-depth * width * ramp}px) ` +
          `rotateY(${-tilt}deg) scale(${scale})`;
        element.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
        element.style.filter = blurInactive
          ? `blur(${Math.min(3, distance * 3)}px)`
          : '';
        element.style.zIndex = String(100 - Math.round(distance));
      });
    };

    paintLane(cardRefs.current, widthRef.current, true);
    paintLane(captionRefs.current, captionWidthRef.current, true);
  }, [activeScale, count, depth, fade, falloff, gap, loop, rotate]);

  const indexAtSafe = React.useCallback(
    (position: number) => (count > 0 ? indexAt(position) : 0),
    [count, indexAt],
  );

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAtSafe(target));

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAtSafe, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      if (count === 0) return;
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>, laneWidth: number) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
      moved: false,
      pitch: laneWidth * (1 + gap),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const pitch = drag.pitch;
    if (!pitch) return;

    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 5) drag.moved = true;
    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - delta / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAtSafe(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    ignoreClickRef.current = drag.moved;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
    if (drag.moved) requestAnimationFrame(() => { ignoreClickRef.current = false; });
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    const captionFrame = captionFrameRef.current;
    if (!frame) return;
    const measure = () => {
      const card = cardRefs.current[0];
      const caption = captionRefs.current[0];
      if (card) widthRef.current = card.offsetWidth;
      if (caption) captionWidthRef.current = caption.offsetWidth;
      paint();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    if (captionFrame) observer.observe(captionFrame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const initialLaneStyle = (index: number): React.CSSProperties => ({
    transform: `translate(-50%, -50%) scale(${index === 0 ? activeScale : 1})`,
    opacity: index === 0 ? 1 : 0,
    filter: index === 0 ? 'blur(0px)' : 'blur(3px)',
    zIndex: 100 - index,
  });

  if (count === 0) return null;
  return (
    <div
      className={cn('w-full', className)}
      style={{
        ['--cf-card' as string]: cardWidth,
        ['--cf-aspect' as string]: aspectRatio,
        ['--cf-active-scale' as string]: activeScale,
        ['--cf-caption' as string]: 'min(calc(83.333vw - 2.5rem), 35rem)',
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={(event) => onPointerDown(event, widthRef.current)}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden py-8 outline-none active:cursor-grabbing sm:py-10"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: 'pan-y',
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: 'calc(var(--cf-card) / var(--cf-aspect) * var(--cf-active-scale))',
              transformStyle: 'preserve-3d',
            }}
          >
            {slides.map((slide, index) => (
              <button
                key={index}
                ref={(node) => { cardRefs.current[index] = node; }}
                type="button"
                role="group"
                aria-roledescription="slide"
                aria-label={`${slide.title ?? `Слайд ${index + 1}`}, ${index + 1} из ${count}`}
                aria-current={index === selected ? 'true' : undefined}
                onClick={() => {
                  if (ignoreClickRef.current) return;
                  if (index !== selected) goTo(index);
                  else onSlideClick?.(index);
                }}
                className={cn(
                  'absolute left-1/2 top-1/2 overflow-hidden border-0 bg-[#141416] p-0 shadow-2xl outline-none will-change-transform',
                  cardClassName,
                )}
                style={{
                  width: 'var(--cf-card)',
                  aspectRatio: String(aspectRatio),
                  borderRadius: 0,
                  ...initialLaneStyle(index),
                }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  className="h-full w-full select-none object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </button>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Предыдущий слайд"
              onClick={() => nudge(-1)}
              className="absolute left-0 top-1/2 z-[200] flex size-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/55 p-0 text-white backdrop-blur transition-colors hover:border-[#FD4B32] hover:bg-[#FD4B32] sm:left-3"
              style={{ borderRadius: 0 }}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Следующий слайд"
              onClick={() => nudge(1)}
              className="absolute right-0 top-1/2 z-[200] flex size-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/55 p-0 text-white backdrop-blur transition-colors hover:border-[#FD4B32] hover:bg-[#FD4B32] sm:right-3"
              style={{ borderRadius: 0 }}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {(showCaption || showPagination) && (
        <div className="mt-3 grid h-[18rem] grid-rows-[minmax(0,1fr)_auto] gap-6 sm:h-[17rem]">
          {showCaption && (
            <div
              ref={captionFrameRef}
              tabIndex={0}
              onPointerDown={(event) => onPointerDown(event, captionWidthRef.current)}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  nudge(-1);
                } else if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  nudge(1);
                }
              }}
              className="relative h-full cursor-grab overflow-hidden outline-none active:cursor-grabbing"
              style={{
                perspective: `calc(var(--cf-caption) * ${perspective})`,
                touchAction: 'pan-y',
                transformStyle: 'preserve-3d',
              }}
            >
              {slides.map((slide, index) => (
                <button
                  key={index}
                  ref={(node) => { captionRefs.current[index] = node; }}
                  type="button"
                  role="group"
                  aria-roledescription="slide description"
                  aria-label={`${slide.title ?? `Слайд ${index + 1}`}, ${index + 1} из ${count}`}
                  aria-current={index === selected ? 'true' : undefined}
                  onClick={() => {
                    if (ignoreClickRef.current) return;
                    if (index !== selected) goTo(index);
                    else onSlideClick?.(index);
                  }}
                  className="absolute left-1/2 top-1/2 flex h-full w-[var(--cf-caption)] cursor-pointer appearance-none flex-col items-center border-0 bg-transparent px-1 pt-8 text-center text-inherit outline-none will-change-transform"
                  style={initialLaneStyle(index)}
                >
                  {slide.title && (
                    <span className="text-[clamp(2rem,4vw,3.75rem)] font-normal leading-none tracking-[-0.035em]" style={{ fontFamily: 'var(--font-display)' }}>
                      {slide.title}
                    </span>
                  )}
                  {slide.subtitle && (
                    <span className="mt-3 text-base font-medium text-[#FD4B32] sm:text-lg">
                      {slide.subtitle}
                    </span>
                  )}
                  {slide.meta && slide.meta.length > 0 && (
                    <span className="mt-5 flex flex-col items-center gap-2 text-base leading-[1.3] text-white/60 sm:text-lg">
                      {slide.meta.map((row) => (
                        <span key={row.label}>
                          <span className="sr-only">{row.label}: </span>{row.value}
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {showPagination && (
            <div className="flex items-center justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Перейти к слайду ${index + 1}`}
                  aria-current={index === selected}
                  onClick={() => goTo(index)}
                  className={cn(
                    'h-px w-6 bg-white transition-opacity',
                    index === selected ? 'opacity-100' : 'opacity-25',
                  )}
                  style={{ borderRadius: 0 }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
