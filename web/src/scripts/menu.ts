export function initMenu() {
  const menu = document.querySelector<HTMLDialogElement>("#site-menu");
  const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
  if (!menu || !toggle) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let closing: Promise<void> | null = null;
  let finishClose: (() => void) | null = null;
  let restoreFocus = true;
  let destination: string | null = null;
  let leaving = false;

  const closeMenu = (returnFocus = true): Promise<void> => {
    restoreFocus = restoreFocus && returnFocus;
    if (closing) return closing;
    if (!menu.open) return Promise.resolve();
    if (reduceMotion.matches) {
      menu.close();
      return Promise.resolve();
    }

    // Reverse from the visible frame even when Escape interrupts the entrance.
    menu.style.setProperty("--menu-exit-clip", getComputedStyle(menu).clipPath);
    menu.style.setProperty("--menu-exit-backdrop", getComputedStyle(menu, "::backdrop").opacity);
    const items = menu.querySelectorAll<HTMLElement>(".menu-top, .menu-body nav a, .menu-aside");
    items.forEach((item) => {
      const style = getComputedStyle(item);
      item.style.setProperty("--menu-exit-opacity", style.opacity);
      item.style.setProperty("--menu-exit-translate", style.translate);
    });

    closing = new Promise<void>((resolve) => {
      const finish = () => {
        clearTimeout(fallback);
        menu.removeEventListener("animationend", onEnd);
        finishClose = null;
        closing = null;
        menu.close();
        delete menu.dataset.closing;
        menu.style.removeProperty("--menu-exit-clip");
        menu.style.removeProperty("--menu-exit-backdrop");
        items.forEach((item) => {
          item.style.removeProperty("--menu-exit-opacity");
          item.style.removeProperty("--menu-exit-translate");
        });
        resolve();
      };
      const onEnd = (event: AnimationEvent) => {
        if (event.target === menu && event.animationName === "menu-dismiss")
          finish();
      };
      // Keep the native dialog modal until the exit finishes. The fallback also
      // releases it if animations are disabled or interrupted by the browser.
      const fallback = window.setTimeout(finish, 600);
      finishClose = finish;
      menu.addEventListener("animationend", onEnd);
      menu.dataset.closing = "";
    });
    return closing;
  };

  toggle.addEventListener("click", () => {
    if (menu.open) return;
    restoreFocus = true;
    menu.showModal();
    menu.scrollTop = 0;
    toggle.setAttribute("aria-expanded", "true");
  });
  menu.querySelector(".menu-close")?.addEventListener("click", () => {
    void closeMenu();
  });
  menu.addEventListener("cancel", (event) => {
    event.preventDefault();
    void closeMenu();
  });
  menu.addEventListener("close", () => {
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus({ preventScroll: true });
  });
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) finishClose?.();
  });

  menu.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      ) return;
      event.preventDefault();
      if (destination) return;
      destination = link.href;
      void closeMenu(false).then(() => {
        const href = destination;
        destination = null;
        if (leaving || !href) return;
        const url = new URL(href);
        window.location.assign(url.href);

        // Native hash scrolling runs after scroll unlock. Move keyboard focus
        // to the chosen section, rather than leaving it in the closed menu.
        if (
          url.origin === location.origin && url.pathname === location.pathname &&
          url.search === location.search && url.hash
        ) {
          const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
          if (target) {
            const addedTabindex = !target.hasAttribute("tabindex");
            if (addedTabindex) target.tabIndex = -1;
            target.focus({ preventScroll: true });
            if (addedTabindex)
              target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
          }
        }
      });
    });
  });

  window.addEventListener("pagehide", () => {
    leaving = true;
    finishClose?.();
    if (menu.open) menu.close();
  });
  window.addEventListener("pageshow", () => { leaving = false; });
}
