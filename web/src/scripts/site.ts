import { initScrollMotion } from "./scroll-motion";

export function initSite() {
  const menu = document.querySelector<HTMLDialogElement>("#site-menu");
  const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
  const close = document.querySelector<HTMLButtonElement>(".menu-close");
  if (menu && toggle) {
    toggle.addEventListener("click", () => {
      menu.showModal();
      toggle.setAttribute("aria-expanded", "true");
    });
    const closeMenu = () => {
      menu.close();
      toggle.setAttribute("aria-expanded", "false");
    };
    close?.addEventListener("click", closeMenu);
    menu.addEventListener("close", () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    });
    menu
      .querySelectorAll("a")
      .forEach((link) => link.addEventListener("click", closeMenu));
  }
  initScrollMotion(document.querySelector("#site-header"));

  const tabs = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-format]"),
  ];
  const selectFormat = (id: string, focus = false) => {
    tabs.forEach((tab) => {
      const selected = tab.dataset.format === id;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(`panel-${tab.dataset.format}`);
      if (panel) panel.hidden = !selected;
      if (selected && focus) tab.focus();
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectFormat(tab.dataset.format!));
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (event.key === "ArrowDown" || event.key === "ArrowRight")
        next = (index + 1) % tabs.length;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
        next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectFormat(tabs[next].dataset.format!, true);
    });
  });
  document
    .querySelectorAll<HTMLElement>("[data-format-link]")
    .forEach((link) =>
      link.addEventListener("click", () =>
        selectFormat(link.dataset.formatLink!),
      ),
    );

  const form = document.querySelector<HTMLFormElement>("[data-lead-form]");
  if (!form) return;
  const format = new URLSearchParams(location.search).get("format");
  if (format) {
    const select = form.querySelector<HTMLSelectElement>("[name=format]");
    if (select && [...select.options].some((option) => option.value === format))
      select.value = format;
  }
  const status = form.querySelector<HTMLParagraphElement>("[data-form-status]");
  const submit = form.querySelector<HTMLButtonElement>("[type=submit]");
  let submitting = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting || !form.reportValidity() || !status || !submit) return;
    const data = new FormData(form),
      phone = String(data.get("phone") || "").trim();
    if (phone.replace(/\D/g, "").length < 10) {
      status.textContent =
        "Укажите телефон с кодом страны, чтобы мы могли связаться.";
      status.dataset.state = "error";
      form.querySelector<HTMLInputElement>("[name=phone]")?.focus();
      return;
    }
    if (import.meta.env.DEV) {
      status.textContent =
        "Это локальный просмотр. Заявки здесь не отправляются. Связаться можно по ссылкам слева.";
      status.dataset.state = "";
      return;
    }
    submitting = true;
    submit.disabled = true;
    status.textContent = "Отправляем…";
    status.dataset.state = "";
    try {
      const selected = form.querySelector<HTMLSelectElement>("[name=format]");
      const payload = {
        name: String(data.get("name") || "").trim(),
        phone,
        message: String(data.get("message") || "").trim(),
        email: String(data.get("email") || "").trim(),
        format: selected?.selectedOptions[0]?.textContent || "Обсудим вместе",
        company: String(data.get("company") || ""),
        consent: data.get("consent") === "on",
        pageUrl: location.href,
        referrer: document.referrer,
        utm: Object.fromEntries(
          [...new URLSearchParams(location.search)].filter(([key]) =>
            /^utm_/.test(key),
          ),
        ),
      };
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("delivery");
      status.textContent =
        "Заявка доставлена. Спасибо — свяжемся с вами, чтобы обсудить задачу.";
      status.dataset.state = "success";
      form.reset();
    } catch {
      status.textContent =
        "Не удалось подтвердить доставку заявки. Попробуйте ещё раз или напишите в WhatsApp.";
      status.dataset.state = "error";
    } finally {
      submitting = false;
      submit.disabled = false;
    }
  });
}
