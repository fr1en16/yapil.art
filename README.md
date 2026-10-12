# Yapil Astro

Сайт https://yapil.art на Astro, опубликованный в Cloudflare Workers (`yapil-astro`).
Исходники: https://github.com/fr1en16/yapil.art. Основная ветка — `master`.

## Локальная работа

Нужен Node.js >= 22.12.0. Используйте Node.js 24 и npm с lock-файлом.

```sh
git clone https://github.com/fr1en16/yapil.art.git
cd yapil.art
npm ci
cp .env.example .env
npm run dev -- --background
```

Управление сервером: `npx astro dev status`, `npx astro dev logs`, `npx astro dev stop`.
Секреты для нужных интеграций владелец передаёт отдельно через защищённый канал.
Для локальных Cloudflare bindings и runtime-секретов используйте `.dev.vars`.
Не копируйте production-базу с заявками в общедоступные файлы.

## Совместная работа

```sh
git switch master
git pull --ff-only
git switch -c feature/task-name
```

Делайте изменения в своей ветке, отправляйте её в GitHub и открывайте Pull Request в `master`.
В описании укажите результат и выполненные проверки. Для визуальных изменений приложите скриншоты.
Владелец проверяет изменения перед слиянием. Следуйте `AGENTS.md`, включая правила медиа.
Новые медиа публикуются только через Tinify (для поддерживаемого растра) и Cloudflare R2.

Перед отправкой:

```sh
npm run build
```

При изменении SEO/геостраниц также выполняйте `npm run seo:audit` и `npm run verify:geo`.
При изменении форм проверяйте валидацию и отправку на тестовом окружении, не отправляйте тестовые заявки в production.

## Публикация

Целевая схема — Cloudflare Workers Builds, подключённый к этому репозиторию:

| Параметр | Значение |
| --- | --- |
| Worker | `yapil-astro` (существующий) |
| Production branch | `master` |
| Root directory | `/` |
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |
| Node.js | `24` (`NODE_VERSION` в переменных сборки) |

Подключение и первый успешный деплой необходимо проверить в панели Cloudflare.
Не включайте одновременно второй автоматический деплой через GitHub Actions.
Runtime-секреты хранятся в настройках Worker; переменные сборки задаются отдельно в Builds.
`PUBLIC_*` могут попасть в клиентский код, поэтому приватные ключи туда не помещают.
Sanity имеет значения по умолчанию; Supabase нужен только для использующих его функций.
Сборка не должна получать секреты Telegram, пароль админки или сервисные ключи Supabase.

Ручная публикация владельцем при необходимости:

```sh
npm run build
npm run deploy
```

Команда публикации использует сгенерированный `dist/server/wrangler.json`.
Файлы `dist/`, `.wrangler/`, `.env` и `.dev.vars` не должны попадать в Git.

## Откат

В Cloudflare откройте Worker → Deployments, выберите предыдущую рабочую версию и выполните Rollback.
После этого исправьте или отмените проблемный коммит через Pull Request, чтобы следующий деплой не вернул ошибку.
Откат версии Worker не отменяет изменения данных в D1; миграции базы требуют отдельного плана.

Документация: [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/),
[Astro](https://docs.astro.build).
