# Yapil Astro

Новая статическая версия сайта Yapil на Astro. Проект использует только русский язык и шрифт Inter Tight.

## Локальный запуск

Требования:

- Node.js 22.12 или новее;
- npm;
- доступ к `media.yapil.art` для загрузки изображений и видео.

Откройте Terminal и перейдите в проект:

```bash
cd "/Users/yapil/Downloads/yapil-astro"
```

При первом запуске установите зависимости:

```bash
npm install
```

Запустите dev-сервер в фоне:

```bash
npm run dev -- --background
```

Откройте сайт:

```text
http://localhost:4321
```

Управление dev-сервером:

```bash
npx astro dev status
npx astro dev logs
npx astro dev stop
```

После изменения файлов Astro автоматически обновляет страницу. Если порт 4321 занят, сначала выполните `npx astro dev stop`.

## Проверка production-сборки

Остановите dev-сервер и соберите сайт:

```bash
npx astro dev stop
npm run build
```

Готовая статическая сборка появится в `dist/`. Для её локального просмотра:

```bash
npm run preview
```

Откройте `http://localhost:4321`. Сервер preview работает в текущем окне Terminal; остановить его можно сочетанием `Ctrl+C`.

## Публикация на Vercel

> Важно: это должен быть новый отдельный Vercel-проект. Не привязывайте эту папку к существующему проекту `yapil`. Домен `yapil.art` не переносите, пока новая версия не проверена и переключение отдельно не согласовано.

Перед публикацией обязательно проверьте локальную сборку:

```bash
npm install
npm run build
git status
```

### Вариант 1 — GitHub и Vercel Dashboard (рекомендуется)

1. Создайте новый пустой репозиторий на GitHub.
2. Подключите его из папки проекта и отправьте ветку:

   ```bash
   git remote add origin <URL_НОВОГО_РЕПОЗИТОРИЯ>
   git push -u origin master
   ```

3. В Vercel откройте **Add New → Project** и импортируйте новый репозиторий.
4. Задайте уникальное имя, например `yapil-astro-new`. Не используйте имя `yapil`.
5. Проверьте настройки:

   - Framework Preset: `Astro`;
   - Root Directory: `./`;
   - Install Command: `npm install`;
   - Build Command: `npm run build`;
   - Output Directory: `dist`;
   - переменные окружения пока не нужны.

6. Нажмите **Deploy**. Сайт получит отдельный адрес вида `https://<новое-имя>.vercel.app` и не затронет `yapil.art`.
7. Проверьте главную страницу, `/case/onmacabim`, `/privacy`, `/404` и несколько других кейсов.
8. Последующие push в `master` будут автоматически обновлять production нового Vercel-проекта. Ветки и pull request будут создавать preview.

### Вариант 2 — Vercel CLI без GitHub

Создайте через CLI новый проект с уникальным именем, затем установите локальную привязку только к нему:

```bash
cd "/Users/yapil/Downloads/yapil-astro"
if [ -d .vercel ]; then echo "Стоп: папка уже привязана к Vercel"; exit 1; fi
npx vercel@59.1.3 project add <ИМЯ_НОВОГО_ПРОЕКТА>
npx vercel@59.1.3 link --project <ИМЯ_НОВОГО_ПРОЕКТА>
npx vercel@59.1.3 project inspect <ИМЯ_НОВОГО_ПРОЕКТА>
```

В выводе `project inspect` должны быть имя нового проекта и Framework Preset `Astro`. Если показано имя `yapil`, не продолжайте и удалите локальную папку `.vercel`.

Создайте только preview:

```bash
npx vercel@59.1.3 deploy
```

Проверьте полученный preview URL. Когда именно этот артефакт одобрен для production нового проекта, продвиньте его без повторной сборки:

```bash
npx vercel@59.1.3 promote <PREVIEW_URL>
```

### Подключение `yapil.art` позже

Перенос домена выполняется отдельным шагом после проверки нового production:

1. Убедитесь, что новый адрес `*.vercel.app` полностью работает.
2. Сохраните адрес текущего рабочего deployment для возможного отката.
3. В Vercel откройте новый проект → **Settings → Domains**.
4. Перенесите `yapil.art` со старого проекта только в согласованное окно переключения.
5. Проверьте ответы `200` на `/`, `/case/onmacabim`, `/privacy`, `sitemap-index.xml` и OG-картинки.
6. При проблемах сразу верните домен старому проекту.

До выполнения этого раздела существующий `yapil.art` должен оставаться без изменений.
