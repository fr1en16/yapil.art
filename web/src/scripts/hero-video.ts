export function initHeroVideo(video: HTMLVideoElement) {
  const background = video.closest(".hero-background");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  let inView = true;
  let disposed = false;

  video.muted = true;
  video.defaultMuted = true;

  function updatePlayback() {
    if (disposed) return;
    if (motion.matches || connection?.saveData) {
      video.pause();
      background?.classList.remove("is-playing");
      return;
    }
    if (!inView || document.hidden) {
      video.pause();
      return;
    }
    if (!video.getAttribute("src") && video.dataset.src) {
      video.src = video.dataset.src;
      video.preload = "auto";
      video.load();
    }
    // Playback may be denied by a browser policy; the poster stays visible.
    void video.play()?.catch(() => {});
  }

  const onPlaying = () => background?.classList.add("is-playing");
  const onError = () => background?.classList.remove("is-playing");
  video.addEventListener("playing", onPlaying);
  video.addEventListener("error", onError);
  motion.addEventListener("change", updatePlayback);
  document.addEventListener("visibilitychange", updatePlayback);
  window.addEventListener("pageshow", updatePlayback);

  const observer = new IntersectionObserver(
    (entries) => {
      inView = entries[0]?.isIntersecting ?? false;
      updatePlayback();
    },
    { threshold: 0 },
  );
  observer.observe(video);

  window.addEventListener(
    "pagehide",
    (event) => {
      video.pause();
      if (event.persisted) return;
      disposed = true;
      observer.disconnect();
      motion.removeEventListener("change", updatePlayback);
      document.removeEventListener("visibilitychange", updatePlayback);
      window.removeEventListener("pageshow", updatePlayback);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
    },
    { once: false },
  );
  updatePlayback();
}
