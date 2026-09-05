## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Homepage fidelity

The homepage hero uses the transferred Inspiring-style cover: a live simplex-noise WebGL shader built around the Yapil orange `#FD4B32`, centered editorial typography, and one X/Y-tilting 3D text plane with distinct Z-depths. Keep the existing Yapil copy and navigation labels when refining this cover.

## Запрет на надзаголовки (No Eyebrows / Overlines / Subtags)

- **Строго запрещены любые надзаголовки (eyebrows, kickers, overlines, subtags, метки разделов)** над заголовками секций и страниц (например, мелкие плашки/текст капсом вроде `МЕХАНИКА`, `УСЛОВИЯ`, `ЧАСТЫЕ ВОПРОСЫ`, `УСЛУГА 01` над `H1`/`H2`/`H3`).
- Заголовки должны быть чистыми и лаконичными: только порядковый номер блока (`01`, `02`, `03`), если это предусмотрено списком/структурой, и сам заголовок (`H1`/`H2`/`H3`) гарнитурой Oranienbaum.
- Никаких служебных подтегов, надписей и мелкого цветного капса над заголовками.


## Обязательный порядок работы со всеми медиа

- Любые новые и заменяемые медиа до подключения к страницам обязательно загружать в Cloudflare R2 хранилище Yapil и использовать публичные HTTPS-ссылки `https://media.yapil.art/…`.
- Все поддерживаемые Tinify растровые изображения обязательно сжимать и конвертировать в настоящий WebP через API Tinify перед загрузкой. Нельзя просто менять расширение или заменять Tinify другим конвертером без прямого указания пользователя.
- SVG, видео, аудио и другие форматы, которые Tinify не поддерживает, сохранять в подходящем формате и также загружать в Cloudflare. Не растрировать SVG и не терять анимацию ради WebP.
- Использовать новые имена объектов с хешем содержимого при каждой замене, чтобы исключить устаревший кеш. Проверять доступность URL, Content-Type и соответствие загруженного файла результату обработки.
- Локальные исходники допустимы только для обработки и резервного хранения. Не подключать новые локальные PNG/JPEG или другие локальные медиа как окончательный результат.
- Если Tinify или Cloudflare недоступны либо отсутствуют ключи, явно сообщить о блокировке. Не пропускать этапы молча и не утверждать, что медиа опубликованы, до проверки.
- Ключи брать из защищённой конфигурации окружения; не записывать секреты в код, документацию, логи или ответы.
