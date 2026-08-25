"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Mail, MessageCircleMore } from "lucide-react";
import {
  ExpandableActionBar,
  type ExpandableActionBarItem,
} from "./be-ui-expanable-action-bar";

interface PrimaryMenuProps {
  contactsHref: string;
}

const destinations = {
  cases: "/#cases",
  reviews: "/#reviews",
  contacts: "/#contacts",
} as const;

export default function PrimaryMenu({ contactsHref }: PrimaryMenuProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const updateActiveItem = () => {
      if (window.location.pathname !== "/") {
        setActiveId("");
        return;
      }

      const ids = ["contacts", "reviews", "cases"];
      const active = ids.find((id) => {
        const section = document.getElementById(id);
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        return rect.top <= window.innerHeight * 0.48 && rect.bottom > 96;
      });

      setActiveId(active ?? "");
    };

    updateActiveItem();
    window.addEventListener("scroll", updateActiveItem, { passive: true });
    window.addEventListener("hashchange", updateActiveItem);
    return () => {
      window.removeEventListener("scroll", updateActiveItem);
      window.removeEventListener("hashchange", updateActiveItem);
    };
  }, []);

  const items = useMemo<ExpandableActionBarItem[]>(() => [
    { id: "cases", label: "Кейсы", icon: <BriefcaseBusiness /> },
    { id: "reviews", label: "Отзывы", icon: <MessageCircleMore /> },
    { id: "contacts", label: "Контакты", icon: <Mail /> },
  ], []);

  const navigate = (item: ExpandableActionBarItem) => {
    setActiveId(item.id);
    const href = item.id === "contacts" ? contactsHref : destinations[item.id as keyof typeof destinations];
    const target = new URL(href, window.location.href);
    const isSamePage = target.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "");

    if (target.hash && isSamePage) {
      const section = document.querySelector<HTMLElement>(target.hash);
      if (!section) return;

      window.history.pushState(null, "", target.hash);

      const alignSection = (duration: number) => {
        const lenis = (window as Window & {
          lenis?: { scrollTo: (element: HTMLElement, options: { offset: number; duration: number }) => void };
        }).lenis;

        if (lenis) {
          lenis.scrollTo(section, { offset: -20, duration });
        } else {
          const top = window.scrollY + section.getBoundingClientRect().top - 20;
          window.scrollTo({ top, behavior: duration > 0.5 ? "smooth" : "auto" });
        }
      };

      alignSection(1.2);

      // Lazy case media can change the document height after the click. Keep the
      // requested section anchored until those layout shifts have settled.
      if ("ResizeObserver" in window) {
        let settleTimer = 0;
        const observer = new ResizeObserver(() => {
          window.clearTimeout(settleTimer);
          settleTimer = window.setTimeout(() => alignSection(0.25), 60);
        });
        observer.observe(document.body);
        window.setTimeout(() => {
          observer.disconnect();
          window.clearTimeout(settleTimer);
          alignSection(0.25);
        }, 3000);
      }
    } else {
      window.location.assign(href);
    }
  };

  return (
    <nav aria-label="Основная навигация">
      <ExpandableActionBar
        items={items}
        activeId={activeId}
        onAction={navigate}
        collapseDelay={120}
        classNames={{
          track: "!rounded-full border-white/20 bg-black/35 text-white shadow-xl backdrop-blur-xl",
          item: "!rounded-full text-white/70 hover:text-white",
          activeItem: "text-white",
          icon: "[&>svg]:h-full [&>svg]:w-full",
          label: "text-[0.82rem] tracking-[-0.01em]",
        }}
      />
    </nav>
  );
}
