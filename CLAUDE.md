# elizarowa.com — контекст для Claude

## Что это за проект

Сайт психолога Екатерины Елизаровой. **Чистая статика без сборки**: HTML + CSS + ванильный JS
в папке `site/`, которая целиком синхронизируется в приватный S3 и раздаётся через CloudFront.

Домен: elizarowa.com (регистратор и DNS — Squarespace).
Репо: github.com/bleschunov/elizarowa_com (публичное).
Хостинг (S3, CloudFront, ACM, IAM) — Terraform в github.com/bleschunov/infra, не здесь.

## Принципы (не нарушать)

- Нет `package.json`, бандлеров, фреймворков, SSR, CMS. Не добавлять их обратно.
- Нет секретов и `.env` в репозитории. Сайт не должен содержать токенов: всё, что в `site/`, публично.
- Нет серверной логики: никаких форм с отправкой, API-эндпоинтов, ботов. Связь с Катей —
  только ссылкой на Telegram `https://t.me/ekaterina_elizarowa` (окно `#contact-dialog`).
- Никаких inline-`<script>`: JS только в `site/assets/js/` (задел под строгий CSP).

## Структура

- `site/**/index.html` — страницы; URL без расширения (`/about`, `/blog/<slug>`).
  CloudFront Function из infra дописывает `/index.html`, редиректит `/about/` → `/about`
  и `www.elizarowa.com` → `https://elizarowa.com`. Внутренние ссылки — без слеша на конце.
- Шапка, футер, `<head>` и окно `#contact-dialog` **продублированы в каждой странице**.
  Меняя их, меняйте во всех `site/**/*.html` (кроме `index.html` и `podrostki/` — там своя вёрстка).
- `site/assets/js/main.js` — все интерактивы, каждый блок проверяет наличие элементов:
  `[data-contact]` (+ `data-product="…"`) открывает окно «напишите в Telegram»,
  `[data-diploma="путь"]` — просмотр диплома, оглавление и видео-виджет на `/about`.
- `site/assets/css/tailwind.css` — **скомпилированный** Tailwind 3.4 (палитра `beige-*`, `gold-*`,
  шрифт Inter). Не править руками. При появлении новых классов — пересобрать
  командой из README («Стили»), конфиг в `tools/tailwind/`.
- `site/assets/css/site.css` — ручные стили (шрифты, `.article-content`, диалоги, виджет).
- Статьи: `site/blog/<slug>/index.html`, текст в `<div class="article-content">`;
  карточка статьи вручную добавляется в начало списка в `site/blog/index.html`.

## Инфраструктура и деплой

- Хостинг описан в bleschunov/infra (`sites.tf`: домен и сайт `elizarowa.com`). Заголовки
  безопасности, редиректы, страница ошибок — там. DNS — в Squarespace, руками.
- `.github/workflows/deploy.yml`: пуш в `main` по `site/**` (или вручную) → OIDC-вход в AWS →
  `aws s3 sync site/` в `s3://$S3_BUCKET/$S3_PREFIX/` (сначала файлы, потом HTML) → инвалидация `/*`.
- Переменные репозитория (vars, не secrets): `AWS_ROLE_ARN`, `S3_BUCKET`, `S3_PREFIX`,
  `CLOUDFRONT_DISTRIBUTION_ID` — из `terraform output github_variables` в infra.
- Actions закреплены по SHA коммита — при обновлении менять SHA и комментарий с версией.

## Локальный просмотр

`cd site && python3 -m http.server 8000` → http://localhost:8000

## Известные нюансы

- 403 от S3 (нет такого ключа) CloudFront превращает в 404 с `site/404.html` (`error_site` в infra).
- HTML кешируется браузером с `max-age=0`, CloudFront держит до инвалидации;
  прочие файлы — `max-age=86400`, поэтому заменённую картинку лучше переименовывать.
- `how_can_i_help.mp4` весит 22 МБ — основной объём трафика.
- Лендинг `/podrostki` встраивает Calendly (внешний скрипт `assets.calendly.com`).
