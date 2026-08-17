import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

type Stop = { offset: number; color: string };

const VIEWBOX_WIDTH = 1271;
const VIEWBOX_HEIGHT = 599;

const RUIXEN_STOPS: Stop[] = [
  { offset: 0, color: '#971302' },
  { offset: 0.2, color: '#E31D02' },
  { offset: 0.4, color: '#FD4B32' },
  { offset: 0.6, color: '#FD634E' },
  { offset: 0.8, color: '#FEA69A' },
  { offset: 1, color: '#FFDBD7' },
];

function bellHeights(count: number, peak: number, valley: number): number[] {
  const middle = (count - 1) / 2;

  return Array.from({ length: count }, (_, index) => {
    const distance = middle === 0 ? 0 : Math.abs(index - middle) / middle;
    const eased = 1 - Math.pow(distance, 1.24);
    return peak * VIEWBOX_HEIGHT * (valley + (1 - valley) * eased);
  });
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export interface RuixenGradientFooterProps {
  children?: ReactNode;
  gradientHeight?: string;
  minReveal?: number;
  bars?: number;
  blur?: number;
  peak?: number;
  valley?: number;
  stops?: Stop[];
  className?: string;
  style?: CSSProperties;
}

export function RuixenGradientFooter({
  children,
  gradientHeight = '65vh',
  minReveal = 0.045,
  bars = 9,
  blur = 15,
  peak = 0.98,
  valley = 0.55,
  stops = RUIXEN_STOPS,
  className,
  style,
}: RuixenGradientFooterProps) {
  const uid = useId().replace(/:/g, '');
  const bandRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(minReveal);

  useEffect(() => {
    const element = bandRef.current;
    if (!element) return;

    const document = element.ownerDocument;
    const window = document.defaultView ?? globalThis.window;

    const measure = () => {
      const height = element.offsetHeight || 1;
      const scrollRemaining =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      const reveal = clamp((height - scrollRemaining) / height);
      setProgress(minReveal + (1 - minReveal) * reveal);
    };

    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });

    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [minReveal]);

  const columnWidth = VIEWBOX_WIDTH / bars;
  const footerStyle = {
    ...style,
    '--footer-gradient-height': gradientHeight,
    paddingBottom: gradientHeight,
  } as CSSProperties;

  return (
    <footer className={className} style={footerStyle}>
      {children}

      <div
        ref={bandRef}
        className="ruixen-gradient-band"
        aria-hidden="true"
        style={{
          height: gradientHeight,
          transform: `scaleY(${progress})`,
        }}
      >
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`gradient-${uid}`} x1="0" y1="1" x2="0" y2="0">
              {stops.map((stop, index) => (
                <stop key={index} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
            <filter id={`blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={blur} />
            </filter>
          </defs>

          {bellHeights(bars, peak, valley).map((height, index) => (
            <g key={index} filter={`url(#blur-${uid})`}>
              <rect
                x={index * columnWidth}
                y={VIEWBOX_HEIGHT - height}
                width={columnWidth * 1.23}
                height={height}
                fill={`url(#gradient-${uid})`}
              />
            </g>
          ))}
        </svg>
      </div>
    </footer>
  );
}
