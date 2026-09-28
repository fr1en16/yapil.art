"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface WorksWheelItem {
  title: string;
  image: string;
  href: string;
  year: string;
  tags: string[];
  summary: string;
  isVideo?: boolean;
}

interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  label?: string;
  action?: string;
}

const CARD_H = 0.39;
const CARD_MAX_W = 0.36;
const MOBILE_CARD_H = 0.42;
const MOBILE_CARD_MAX_W = 0.78;
const CARD_RATIO = 1.45;
const STEP = 40;
const DRUM = 2.22;
const LENS = 2.7;
const RING_R = 1.18;
const BOW = 1.82;
const CULL = 1.6;
const WHEEL_UNITS = 720;
const DRAG_UNITS = 390;
const SETTLE = 140;
const EASE = 0.12;
const EXIT_HOLD_VIEWPORTS = 0.4;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const lerp = (a: number, b: number, amount: number) => a + (b - a) * amount;
const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / (end - start), 0, 1);
  return progress * progress * (3 - 2 * progress);
};
const radians = (degrees: number) => (degrees * Math.PI) / 180;
const bowAt = (drumDegrees: number, bow: number) =>
  -bow * (1 - Math.cos(radians(drumDegrees)));

function placeCard(
  ringDegrees: number,
  drumDegrees: number,
  ringRadius: number,
  drumRadius: number,
  bow: number,
  morph: number,
) {
  return (
    `translateX(${morph * bowAt(drumDegrees, bow)}px)` +
    ` rotateZ(${(1 - morph) * ringDegrees}deg)` +
    ` translateY(${-(1 - morph) * ringRadius}px)` +
    ` rotateX(${morph * drumDegrees}deg)` +
    ` translateZ(${morph * drumRadius}px)`
  );
}

export function WorksWheel({
  items,
  label = "Кейсы",
  action = "Смотреть кейс",
  className,
  ...props
}: WorksWheelProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);
  const labelRef = React.useRef<HTMLHeadingElement>(null);
  const detailsRef = React.useRef<HTMLDivElement>(null);
  const indexRef = React.useRef<HTMLOListElement>(null);
  const turn = React.useRef(0);
  const target = React.useRef(0);
  const drag = React.useRef<number | null>(null);
  const dragOrigin = React.useRef<number | null>(null);
  const didDrag = React.useRef(false);
  const settling = React.useRef(0);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState({ width: 0, height: 0 });
  const [reducedMotion, setReducedMotion] = React.useState(false);

  const count = items.length;
  const last = Math.max(count - 1, 0);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const measure = () =>
      setStage({ width: element.clientWidth, height: element.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const isMobile = stage.width > 0 && stage.width < 768;
    const cardHeightRatio = isMobile ? MOBILE_CARD_H : CARD_H;
    const cardWidthRatio = isMobile ? MOBILE_CARD_MAX_W : CARD_MAX_W;
    const cardWidth = Math.min(
      stage.height * cardHeightRatio * CARD_RATIO,
      stage.width * cardWidthRatio,
    );
    const cardHeight = cardWidth / CARD_RATIO;
    const ringRadius = cardHeight * RING_R;
    const ringScale = count
      ? clamp(
          (((2 * Math.PI * ringRadius) / count) * 0.84) / (cardWidth || 1),
          0.17,
          1,
        )
      : 1;
    return {
      cardWidth,
      cardHeight,
      ringRadius,
      ringScale,
      drumRadius: cardHeight * DRUM,
      bow: cardHeight * BOW,
      perspective: cardHeight * LENS,
    };
  }, [stage, count]);

  React.useEffect(() => {
    if (!stage.height || !count) return;
    let frame = 0;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reducedMotion ? 1 : EASE);

      const currentTurn = turn.current;
      const morph = clamp(currentTurn, 0, 1);
      const position = Math.max(0, currentTurn - 1);
      // With many projects the ring cards are deliberately tiny. Letting them
      // grow from the first pixel of the transition makes their full-size
      // rectangles overlap before the drum has had time to open. Collapse the
      // ring first, then grow only the cards that remain near the front.
      const ringCollapse = smoothstep(0.04, 0.38, morph);
      const drumReveal = smoothstep(0.72, 0.98, morph);
      const scaleProgress = smoothstep(0.22, 0.88, morph);
      const ringVisibleRadius = lerp(
        Math.ceil(count / 2) + 0.6,
        0.45,
        ringCollapse,
      );

      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-morph * metrics.drumRadius}px)`;
      }

      for (let index = 0; index < count; index += 1) {
        const distance = index - position;
        const absoluteDistance = Math.abs(distance);
        const wrappedDistance = Math.min(
          absoluteDistance,
          Math.max(0, count - absoluteDistance),
        );
        const ringOpacity =
          1 -
          smoothstep(
            ringVisibleRadius - 0.35,
            ringVisibleRadius + 0.15,
            wrappedDistance,
          );
        const drumOpacity =
          1 - smoothstep(CULL - 0.3, CULL + 0.1, absoluteDistance);
        const cardOpacity = lerp(ringOpacity, drumOpacity, drumReveal);
        const drumDegrees = distance * STEP;
        const card = cardRefs.current[index];
        if (!card) continue;
        card.style.transform = placeCard(
          distance * (360 / count),
          drumDegrees,
          metrics.ringRadius,
          metrics.drumRadius,
          metrics.bow,
          morph,
        );
        card.style.opacity = String(cardOpacity);
        card.style.setProperty(
          "--wheel-card-ui-opacity",
          String(smoothstep(0.78, 1, morph)),
        );
        card.style.pointerEvents =
          morph > 0.25 && absoluteDistance > 0.6 ? "none" : "auto";
        card.style.zIndex = String(Math.round(100 - absoluteDistance * 2));
        const face = card.firstElementChild as HTMLElement | null;
        if (face) {
          face.style.transform = `scale(${lerp(metrics.ringScale, 1, scaleProgress)})`;
        }
      }

      if (labelRef.current) {
        labelRef.current.style.opacity = String(1 - smoothstep(0.05, 0.55, morph));
      }
      if (detailsRef.current) {
        detailsRef.current.style.opacity = String(smoothstep(0.48, 0.92, morph));
      }
      if (indexRef.current) {
        indexRef.current.style.opacity = String(drumReveal);
        indexRef.current.style.pointerEvents = drumReveal > 0.9 ? "auto" : "none";
        indexRef.current.style.transform =
          `translateY(-50%) translateX(${(1 - drumReveal) * 1.75}rem)`;
      }
      const nearest = clamp(Math.round(position), 0, last);
      setActive((previous) => (previous === nearest ? previous : nearest));
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [count, last, metrics, reducedMotion, stage.height]);

  const moveTo = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1);
    },
    [last],
  );

  const scrollToTurn = React.useCallback(
    (next: number) => {
      const clampedTurn = clamp(next, 0, last + 1);
      const track = stageRef.current?.closest<HTMLElement>(
        "[data-wheel-scroll-track]",
      );
      if (!track) {
        moveTo(clampedTurn);
        return;
      }

      const trackTop = window.scrollY + track.getBoundingClientRect().top;
      const totalTravel = Math.max(track.offsetHeight - window.innerHeight, 1);
      const exitHold = Math.min(
        window.innerHeight * EXIT_HOLD_VIEWPORTS,
        totalTravel * 0.4,
      );
      const interactiveTravel = Math.max(totalTravel - exitHold, 1);
      const scrollTop =
        trackTop + (clampedTurn / (last + 1)) * interactiveTravel;
      const pageWindow = window as typeof window & {
        __lenisInstance?: {
          scrollTo: (
            target: number,
            options?: { duration?: number; immediate?: boolean },
          ) => void;
        };
      };

      if (pageWindow.__lenisInstance) {
        pageWindow.__lenisInstance.scrollTo(scrollTop, {
          duration: reducedMotion ? 0 : 0.75,
          immediate: reducedMotion,
        });
      } else {
        window.scrollTo({
          top: scrollTop,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }
    },
    [last, moveTo, reducedMotion],
  );

  React.useEffect(() => {
    const track = stageRef.current?.closest<HTMLElement>(
      "[data-wheel-scroll-track]",
    );
    if (!track) return;

    let ticking = false;
    const updateFromScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const totalTravel = Math.max(track.offsetHeight - window.innerHeight, 1);
        const exitHold = Math.min(
          window.innerHeight * EXIT_HOLD_VIEWPORTS,
          totalTravel * 0.4,
        );
        const interactiveTravel = Math.max(totalTravel - exitHold, 1);
        const traveled = -track.getBoundingClientRect().top;
        const progress = clamp(traveled / interactiveTravel, 0, 1);
        const exitProgress = clamp(
          (traveled - interactiveTravel) / Math.max(exitHold, 1),
          0,
          1,
        );
        target.current = progress * (last + 1);
        if (rootRef.current) {
          rootRef.current.classList.toggle(
            "works-wheel--scroll-active",
            progress > 0.01,
          );
          const exitOpacity = 1 - smoothstep(0.04, 0.98, exitProgress);
          rootRef.current.style.opacity = String(exitOpacity);
          rootRef.current.style.pointerEvents =
            exitProgress > 0.9 ? "none" : "auto";
        }
        ticking = false;
      });
    };

    updateFromScroll();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", updateFromScroll);
    };
  }, [last]);

  React.useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    if (element.closest("[data-wheel-scroll-track]")) return;
    const onWheel = (event: WheelEvent) => {
      const next = target.current + event.deltaY / WHEEL_UNITS;
      if (next > 0 && next < last + 1) event.preventDefault();
      moveTo(next);
      window.clearTimeout(settling.current);
      settling.current = window.setTimeout(
        () => moveTo(Math.round(target.current)),
        SETTLE,
      );
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", onWheel);
      window.clearTimeout(settling.current);
    };
  }, [last, moveTo]);

  const settleDrag = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const shouldSettle = didDrag.current;
    drag.current = null;
    dragOrigin.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (shouldSettle && target.current > 0) {
      scrollToTurn(Math.round(target.current));
    }
  };

  const activeItem = items[active];

  if (!count) {
    return (
      <section className={cn("works-wheel works-wheel--empty", className)} {...props} data-typography="off">
        <h1>{label}</h1>
        <p>Кейсы скоро появятся.</p>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      aria-label={label}
      className={cn("works-wheel", className)}
      {...props}
      data-typography="off"
    >
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label="Кейсы Yapil"
        aria-activedescendant={`works-wheel-${active}`}
        className="works-wheel__stage"
        style={{ perspective: `${metrics.perspective}px` }}
        onPointerDown={(event) => {
          if (event.pointerType === "touch") return;
          drag.current = event.clientY;
          dragOrigin.current = event.clientY;
          didDrag.current = false;
        }}
        onPointerMove={(event) => {
          if (drag.current === null || dragOrigin.current === null) return;
          if (!didDrag.current) {
            if (Math.abs(event.clientY - dragOrigin.current) < 6) return;
            didDrag.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          moveTo(target.current + (drag.current - event.clientY) / DRAG_UNITS);
          drag.current = event.clientY;
        }}
        onPointerUp={settleDrag}
        onPointerCancel={settleDrag}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            scrollToTurn(Math.round(target.current) + 1);
          } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            scrollToTurn(Math.round(target.current) - 1);
          } else if (event.key === "Home") {
            scrollToTurn(0);
          } else if (event.key === "End") {
            scrollToTurn(last + 1);
          } else {
            return;
          }
          event.preventDefault();
        }}
      >
        <div ref={wheelRef} className="works-wheel__drum">
          {items.map((item, index) => (
            <a
              id={`works-wheel-${index}`}
              key={item.href}
              role="option"
              aria-selected={index === active}
              href={item.href}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className="works-wheel__card"
              style={{
                width: metrics.cardWidth,
                height: metrics.cardHeight,
                marginLeft: -metrics.cardWidth / 2,
                marginTop: -metrics.cardHeight / 2,
              }}
              aria-label={`${item.title}. ${action}`}
              onClick={(event) => {
                if (!didDrag.current) return;
                event.preventDefault();
                didDrag.current = false;
              }}
            >
              <span className="works-wheel__face">
                {item.isVideo ? (
                  <video
                    src={item.image}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload={index === 0 ? "auto" : "metadata"}
                    aria-hidden="true"
                  />
                ) : (
                  <img
                    src={item.image}
                    alt=""
                    draggable={false}
                    loading={index < 5 ? "eager" : "lazy"}
                    decoding="async"
                  />
                )}
                <span className="works-wheel__tags" aria-hidden="true">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <h1 ref={labelRef} className="works-wheel__label">
        {label}
      </h1>

      <div ref={detailsRef} className="works-wheel__details" aria-live="polite">
        <h2>{activeItem.title}</h2>
        <p className="works-wheel__summary">{activeItem.summary}</p>
      </div>

      <ol ref={indexRef} className="works-wheel__index" aria-label="Список кейсов">
        {items.map((item, index) => (
          <li key={item.href}>
            <button
              type="button"
              onClick={() => scrollToTurn(index + 1)}
              className={cn(index === active && "is-active")}
              aria-label={`Показать ${item.title}`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.title}
            </button>
          </li>
        ))}
      </ol>

      <div className="works-wheel__mobile-control">
        <button
          type="button"
          onClick={() =>
            scrollToTurn(Math.max(1, Math.round(target.current) - 1))
          }
          aria-label="Предыдущий кейс"
        >
          ←
        </button>
        <span>
          {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() =>
            scrollToTurn(
              Math.min(last + 1, Math.max(1, Math.round(target.current) + 1)),
            )
          }
          aria-label="Следующий кейс"
        >
          →
        </button>
      </div>

      <p className="works-wheel__hint">Листайте или тяните</p>
    </section>
  );
}

export default WorksWheel;
