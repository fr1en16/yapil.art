export function initScrollMotion(header: Element | null) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const reveals = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  const scrubs = [
    ...document.querySelectorAll<HTMLElement>("[data-scrub]"),
  ].map((element) => ({
    element,
    words: [...element.querySelectorAll<HTMLElement>("[data-word]")],
  }));
  const parallax = [
    ...document.querySelectorAll<HTMLElement>("[data-parallax]"),
  ];
  const lightSections = [
    ...document.querySelectorAll<HTMLElement>('[data-theme="light"]'),
  ];
  let frame = 0;
  const clamp = (value: number) => Math.min(1, Math.max(0, value));

  document.querySelectorAll("[data-stagger]").forEach((group) => {
    [...group.querySelectorAll<HTMLElement>("[data-reveal]")]
      .filter((element) => element.closest("[data-stagger]") === group)
      .forEach((element, index) => {
        element.style.setProperty(
          "--reveal-delay",
          `${Math.min(index, 3) * 90}ms`,
        );
      });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -36px 0px" },
  );

  function update() {
    frame = 0;
    const viewport = innerHeight;
    header?.classList.toggle("is-scrolled", scrollY > 40);
    header?.classList.toggle(
      "is-light",
      lightSections.some((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 45 && rect.bottom > 45;
      }),
    );

    scrubs.forEach(({ element, words }) => {
      const top = element.getBoundingClientRect().top;
      const progress = motion.matches
        ? 1
        : clamp((viewport * 0.84 - top) / (viewport * 0.58));
      words.forEach((word, index) => {
        const opacity =
          0.16 + 0.84 * clamp(progress * (words.length + 2) - index);
        word.style.opacity = opacity.toFixed(3);
      });
    });
    parallax.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const offset = motion.matches
        ? 0
        : (clamp((viewport - rect.top) / (viewport + rect.height)) - 0.5) * 70;
      element.style.setProperty("--parallax", `${offset.toFixed(2)}px`);
    });
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  function updatePreference() {
    document.documentElement.classList.toggle("motion-ready", !motion.matches);
    reveals.forEach((element) => {
      if (motion.matches || element.getBoundingClientRect().bottom <= 0) {
        element.classList.add("is-visible");
        observer.unobserve(element);
      } else if (!element.classList.contains("is-visible")) {
        observer.observe(element);
      }
    });
    schedule();
  }
  updatePreference();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("pageshow", schedule);
  motion.addEventListener("change", updatePreference);
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("pageshow", schedule);
    motion.removeEventListener("change", updatePreference);
  });
}
