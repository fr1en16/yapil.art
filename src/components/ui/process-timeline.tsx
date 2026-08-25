import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

const ACCENT = '#FD4B32';

export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const timelineRef = useRef<HTMLOListElement>(null);
  const baseLineRef = useRef<HTMLSpanElement>(null);
  const progressLineRef = useRef<HTMLSpanElement>(null);
  const markerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const markerThresholds = useRef<number[]>(steps.map(() => 1));
  const reduceMotion = useReducedMotion();
  const [activeSteps, setActiveSteps] = useState(() => steps.map(() => false));
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 60%'],
  });
  const furthestProgress = useMotionValue(reduceMotion ? 1 : 0);
  const lineScale = useTransform(furthestProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest > furthestProgress.get()) {
      furthestProgress.set(latest);
    }
  });

  useMotionValueEvent(lineScale, 'change', (latest) => {
    setActiveSteps((current) => {
      let changed = false;
      const next = current.map((isActive, index) => {
        const shouldBeActive = isActive || latest >= markerThresholds.current[index];
        changed ||= shouldBeActive !== isActive;
        return shouldBeActive;
      });

      return changed ? next : current;
    });
  });

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const measureMarkers = () => {
      const timelineRect = timeline.getBoundingClientRect();
      const lineTop = 16;
      const markerCenters = markerRefs.current.map((marker) => {
        if (!marker) return lineTop;
        const item = marker.closest('li');
        const itemTop = item instanceof HTMLElement ? item.offsetTop : 0;
        return itemTop + marker.offsetTop + marker.offsetHeight / 2;
      });
      const lastMarkerCenter = markerCenters.at(-1) ?? lineTop;
      const lineHeight = Math.max(lastMarkerCenter - lineTop, 1);
      const lineBottom = Math.max(0, timelineRect.height - lastMarkerCenter);

      if (baseLineRef.current) baseLineRef.current.style.bottom = `${lineBottom}px`;
      if (progressLineRef.current) progressLineRef.current.style.bottom = `${lineBottom}px`;

      markerThresholds.current = markerCenters.map((markerCenter) => {
        return Math.min(1, Math.max(0, (markerCenter - lineTop) / lineHeight));
      });

      if (reduceMotion) {
        setActiveSteps(steps.map(() => true));
      } else {
        const currentProgress = furthestProgress.get();
        setActiveSteps((current) =>
          current.map((isActive, index) => isActive || currentProgress >= markerThresholds.current[index]),
        );
      }
    };

    measureMarkers();
    const resizeObserver = new ResizeObserver(measureMarkers);
    resizeObserver.observe(timeline);

    return () => resizeObserver.disconnect();
  }, [reduceMotion, steps]);

  return (
    <ol ref={timelineRef} className="relative m-0 max-w-3xl list-none p-0" aria-label="Этапы работы">
      <span
        ref={baseLineRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 left-[15.5px] top-4 w-px bg-white/10"
      />
      <motion.span
        ref={progressLineRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 left-[15.5px] top-4 w-px origin-top bg-[#FD4B32]"
        style={{ scaleY: lineScale }}
      />

      {steps.map((step, index) => (
        <motion.li
          key={step.number}
          className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-x-4 pb-10 last:pb-0 sm:gap-x-6"
          initial={false}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, delay: index * 0.065, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            ref={(node) => {
              markerRefs.current[index] = node;
            }}
            aria-hidden="true"
            className="relative z-10 flex size-8 items-center justify-center rounded-full border text-[13px] leading-none"
            initial={false}
            animate={{
              backgroundColor: activeSteps[index] ? ACCENT : '#000000',
              borderColor: activeSteps[index] ? ACCENT : 'rgba(255,255,255,0.2)',
              color: activeSteps[index] ? '#ffffff' : 'rgba(255,255,255,0.6)',
            }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
          >
            {step.number}
          </motion.div>

          <div className="min-w-0 pt-px">
            <h3 className="m-0 text-[24px] font-semibold leading-[1.15] tracking-[-0.035em] text-white sm:text-[28px]">
              {step.title}
            </h3>
            <p className="m-0 mt-3 text-[15px] leading-[1.4] text-white/60">{step.description}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
