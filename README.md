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

Проверка и публикация настроены в `.github/workflows/site.yml` через GitHub Actions.
Pull Request запускает сборку без приватных ключей. После слияния в `master` выполняется
повторная сборка и публикация в существующий Cloudflare Worker.
Ручной запуск через Actions → Site → Run workflow разрешает публикацию только из `master`.

| Параметр | Значение |
| --- | --- |
| Worker | `yapil-astro` (существующий) |
| Production branch | `master` |
| GitHub environment | `production` |
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |
| Node.js | `24` |

Для публикации добавьте `CLOUDFLARE_API_TOKEN` в GitHub Settings → Environments → production → Secrets.
Создайте отдельный Cloudflare API token из шаблона Edit Cloudflare Workers, ограниченный аккаунтом
с Worker `yapil-astro` и зоной `yapil.art`. Не используйте Global API Key.
Проверьте первый успешный деплой в Actions и Cloudflare. Workers Builds пока не подключён:
его интерфейс перенаправлял на уже установленное GitHub-приложение без выбора репозитория.
Не включайте второй автоматический деплой через Workers Builds, пока работает GitHub Actions.
Runtime-секреты хранятся в настройках Worker; переменные сборки задаются отдельно в GitHub.
Для проверки Pull Request можно задать публичные параметры Supabase в Repository variables;
публикация использует уже существующие одноимённые Repository secrets.
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

Документация: [GitHub Actions для Cloudflare](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/),
[Astro](https://docs.astro.build).
