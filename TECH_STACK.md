# Технологический стек сайта Yapil (Tech Stack)

Документ описывает полный стек технологий, фреймворков, библиотек и архитектурных решений, используемых в проекте **`yapil.art`**.

---

## 1. Базовый уровень и среда исполнения (Core & Runtime)

- **Node.js**: `>= 22.12.0`
- **Пакетный менеджер**: `npm`
- **Основной фреймворк**: [Astro v7.2](https://astro.build/) (`astro`)
  - Статическая генерация страниц (SSG / Static Site Generation).
  - Островная архитектура (Astro Islands) с гидратацией компонентов по требованию (`client:visible`, `client:load`).
- **Язык разработки**: [TypeScript v6](https://www.typescriptlang.org/) (`typescript`, `@astrojs/check`)

---

## 2. Пользовательский интерфейс и компоненты (UI & Frameworks)

- **UI-библиотека**: [React 19](https://react.dev/) (`react`, `react-dom`, `@astrojs/react`)
- **Компонентная модель**:
  - Astro-компоненты (`.astro`) для статичной структуры и разметки.
  - React-компоненты (`.tsx`) для интерактивных узлов:
    - `ServicesAnimatedModal.tsx` — интерактивный список услуг с превью за курсором и модальной формой заявки.
    - `RuixenGradientFooter.tsx` — градиентный шейдерный синтезатор подвала.
- **Иконки**: [Lucide React](https://lucide.dev/) (`lucide-react`)

---

## 3. Стилизация и дизайн-система (Styling & CSS)

- **CSS-фреймворк**: [Tailwind CSS v4](https://tailwindcss.com/) (`tailwindcss`, `@tailwindcss/vite`)
  - Сборка стилей напрямую через плагин `@tailwindcss/vite` в `astro.config.mjs`.
- **Утилиты для классов**: `clsx`, `tailwind-merge`
- **CSS-архитектура**:
  - Глобальные токены и переменные (`src/styles/tokens.css`, `src/styles/global.css`).
  - Поддержка тем оформления: тёмная (по умолчанию) и светлая (`data-theme="light"` / `/light`).
  - Динамическая флюидная типографика и отступы на базе CSS `clamp()`.

---

## 4. Анимации, физика движения и WebGL (Motion & Physics)

- **Framer Motion v13** (`framer-motion`):
  - Анимация модальных окон, всплывающих диалогов и интерактивных списков.
- **GSAP v3** (`gsap`, `@types/gsap`):
  - Высокопроизводительные магнитные курсоры и перемещение превью за мышью (`gsap.quickTo`).
- **Lenis Smooth Scroll** (`lenis`):
  - Плавный инерционный скролл с поддержкой паузы при открытии модалок.
- **WebGL & Кастомная кинематика**:
  - Live Simplex-Noise WebGL шейдер для фона Hero-обложки на базе фирменного оранжевого цвета `#FD4B32`.
  - 3D-слои с гироскопическим наклоном по осям X/Y и послойным обратным параллаксом (Inverse Parallax).
  - Бесшовный бесконечный трек галереи («Всячина») с физикой экспоненциального трения при перетаскивании.

---

## 5. Типографика (Typography)

- **Основной гротеск (Body & UI)**: [Inter Tight Variable](https://fontsource.org/fonts/inter-tight) (`@fontsource-variable/inter-tight`) — узкий вариативный шрифт.
- **Акцидентная антиква (Display Serif)**: `Oranienbaum` — заголовочный контрастный шрифт с засечками и поддержкой кириллицы.
- **Hero-шрифты**: `Hero DM Sans`, `Hero Instrument`.
- **Моноширинный шрифт**: системный `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`.

---

## 6. Управление контентом (Content Collections)

- **Astro Content Layer** (`astro:content` с `glob` loader из `src/content.config.ts`):
  - **`cases`** — коллекция проектов портфолио (`src/content/cases/*.md`).
  - **`vsyachina`** — коллекция медиаматериалов и креативов (`src/content/vsyachina/*.md`).
- **Валидация схем**: [Zod](https://zod.dev/) (`astro/zod`).

---

## 7. Медиа, оптимизация и изображения (Media & Assets)

- **Формат изображений**: WebP (`.webp`) для всех растровых изображений и графики.
- **Оптимизация картинок**: встроенный компонент `astro:assets` (`<Image />`) с генерацией адаптивных `srcset` (`widths={[640, 960, 1440]}`).
- **Компрессия**: обязательное сжатие через [Tinify API](https://tinypng.com/).
- **Удалённые медиа**: CDN `https://media.yapil.art`.

---

## 8. SEO, OpenGraph и доступность (SEO & Accessibility)

- **Карта сайта**: `@astrojs/sitemap` (автоматическая генерация `sitemap-index.xml`).
- **OG-изображения**: `astro-og-canvas` (динамическая генерация превью для соцсетей).
- **Микроразметка**: Schema.org JSON-LD (`Organization`, `CollectionPage`, `CreativeWork`, `WebPage`).
- **Доступность (A11y)**:
  - Skip-link («К основному содержанию»).
  - ARIA-разметка для диалогов, модалок и каруселей.
  - Поддержка `prefers-reduced-motion: reduce` для отключения анимаций.
  - Инструмент разработчика Grid HUD (<kbd>G</kbd>) для проверки 12-колоночной сетки.

---

## 9. Тестирование и контроль качества (Testing & QA)

- **E2E тестирование**: [Playwright](https://playwright.dev/) (`playwright`).
- **Аудит доступности**: `@axe-core/cli`.
- **Производительность и Core Web Vitals**: [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse) (`lighthouse`).
- **Проверка ссылок**: `linkinator` (поиск битых ссылок).
- **Статический сервер**: `serve`.

---

## 10. Скрипты проекта (NPM Scripts)

```bash
# Запуск dev-сервера
npm run dev

# Запуск dev-сервера в фоне (рекомендуется для Astro)
npm run dev -- --background

# Сборка production-версии в папку dist/
npm run build

# Локальный просмотр production-сборки
npm run preview
```
