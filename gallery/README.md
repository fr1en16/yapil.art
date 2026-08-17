# Cloudflare R2 Web Gallery (Next.js + Tailwind CSS)

Легковесная веб-галерея для просмотра, навигации и скачивания медиафайлов из бакета Cloudflare R2.

---

## Возможности

- 📁 **Иерархическая файловая навигация**: виртуальные папки (R2 Keys с разделителем `/`), интерактивные хлебные крошки (`Root / media / project / ...`). Папки отображаются первыми.
- 🖼️ **Сетка медиа**: адаптивная сетка (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4`), ленивая загрузка (`loading="lazy"`), правильный `object-cover`.
- 🎬 **Поддержка форматов**:
  - Изображения (`.webp`, `.jpg`, `.png`, `.svg`, `.gif`, `.avif`).
  - Видео (`.mp4`, `.webm`, `.mov`) с постером и иконкой воспроизведения.
  - Аудио, PDF, документы, архивы и код со стильными иконками и бейджами расширений.
- 🔍 **Поиск и сортировка**: мгновенный фильтр по названию, сортировка по имени, дате и размеру файла, переключение между сеткой и списком.
- 🔎 **Полноэкранный Lightbox-просмотрщик**:
  - Интерактивный зум (Zoom In / Zoom Out / Reset / 100%) и drag-to-pan для фото.
  - Встроенный видео- и аудиоплеер.
  - Навигация клавишами `ArrowLeft` / `ArrowRight`, закрытие по `Esc` и клику на фон.
  - Копирование ссылки в буфер обмена в один клик с визуальной индикацией.
  - Кнопка прямого скачивания (`Download`) и открытие в новой вкладке.
  - Панель свойств файла (размер, дата изменения, полный R2 Key).
- 🔒 **Защита доступа**: опциональная авторизация по паролю (`APP_PASSWORD`) через Next.js Middleware.

---

## Быстрый старт

### 1. Настройка переменных окружения

Скопируйте пример файла конфигурации:
```bash
cp .env.example .env.local
```

Заполните ваши данные Cloudflare R2 в `.env.local`:
```env
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=yapil

# Опционально (если к бакету привязан Custom Domain):
NEXT_PUBLIC_R2_PUBLIC_DOMAIN=https://media.yourdomain.com

# Опционально (пароль для защиты галереи, оставьте пустым для открытого доступа):
APP_PASSWORD=your_secret_password
```

### 2. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

---

## Архитектура API

### `GET /api/files?prefix=...`
Серверный роут выполняет команду `ListObjectsV2Command` через `@aws-sdk/client-s3`.
- Приватные объекты подписываются Presigned URL (`GetObjectCommand`, TTL: 2 часа).
- При наличии `NEXT_PUBLIC_R2_PUBLIC_DOMAIN` генерируются прямые публичные ссылки.

Формат ответа:
```json
{
  "currentPrefix": "media/",
  "folders": ["photos/", "videos/"],
  "files": [
    {
      "key": "media/image.webp",
      "name": "image.webp",
      "size": 124800,
      "lastModified": "2026-08-17T08:00:00Z",
      "type": "image",
      "url": "https://..."
    }
  ]
}
```
