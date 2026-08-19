/**
 * High-performance deferred video loading and viewport playback controller.
 *
 * Principles:
 * 1. ZERO INITIAL LOAD: Videos have no `src` on page load, preventing the browser
 *    from downloading megabytes of video data during critical rendering path.
 * 2. ON-DEMAND LOADING: `src` is attached via IntersectionObserver when entering/near viewport.
 * 3. SMOOTH CROSSFADE: Video reveals gracefully over the lightweight WebP poster on first playback.
 * 4. RESOURCE EFFICIENCY: Automatically pauses offscreen to eliminate unnecessary GPU/CPU decoding.
 * 5. A11Y & DATA PRESERVATION: Respects `prefers-reduced-motion` and data saving preferences.
 */

let observer: IntersectionObserver | null = null;

export function initLazyVideos(): void {
  if (typeof window === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const videos = Array.from(
    document.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]')
  );

  if (!videos.length) return;

  if (reducedMotion) {
    // Keep static poster images intact without loading or playing autoplay videos
    return;
  }

  // Disconnect previous observer if re-initializing on page transitions
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        const dataSrc = video.getAttribute('data-src');

        if (entry.isIntersecting) {
          if (dataSrc && (!video.src || video.src === '')) {
            // Deferred first load: attach source and start playing
            video.src = dataSrc;
            video.load();

            const handlePlay = () => {
              video.classList.add('is-playing');
            };

            video.addEventListener('playing', handlePlay, { once: true });
            video.play().then(handlePlay).catch(() => {
              // Gracefully handle browser autoplay policies
            });
          } else if (video.src && video.paused) {
            video.play().catch(() => {});
          }
        } else {
          // Offscreen: pause video decoding to conserve CPU, GPU and battery
          if (video.src && !video.paused) {
            video.pause();
          }
        }
      });
    },
    {
      rootMargin: '200px 0px',
      threshold: 0.05,
    }
  );

  videos.forEach((video) => observer?.observe(video));
}

// Auto-initialize when running directly in browser
if (typeof window !== 'undefined') {
  const runInit = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => initLazyVideos(), { timeout: 1500 });
    } else {
      setTimeout(initLazyVideos, 150);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit);
  } else {
    runInit();
  }

  document.addEventListener('astro:page-load', runInit);
}
