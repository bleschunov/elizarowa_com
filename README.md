# elizarowa.com — сайт психолога

Сайт Екатерины Елизаровой. Чистая статика (HTML + CSS + немного JS) без сборки,
хостится в общем приватном S3-бакете и раздаётся через CloudFront. Хостинг описан в
[bleschunov/infra](https://github.com/bleschunov/infra).

```
GitHub (main) ──push──▶ GitHub Actions ──OIDC──▶ AWS
                                         │
         s3 sync site/ → elizarowa.com/ ─┤──▶ S3 static-sites ◀── CloudFront ◀── elizarowa.com
         invalidation ───────────────────┘     (приватный)        (HTTPS, ACM)   (DNS: Squarespace)
```

## Структура

```
site/                      ← всё, что лежит здесь, публикуется как есть
  index.html               главная
  about/index.html         «Обо мне»
  blog/index.html          список статей и материалов
  blog/<slug>/index.html   статьи
  podrostki/index.html     лендинг для родителей (Calendly)
  404.html                 страница «не найдено»
  assets/css/site.css      ручные стили: шрифты, текст статей, окна
  assets/css/tailwind.css  скомпилированный Tailwind (не править руками)
  assets/js/main.js        меню, окно «напишите в Telegram», дипломы, видео
  assets/js/gtm.js         Google Tag Manager
  assets/fonts/            Inter (woff2)
  images/ diplomas/ reviews/ how_can_i_help.mp4 preview.png favicon.svg

tools/tailwind/            конфиг для пересборки tailwind.css (нужен редко)
.github/workflows/deploy.yml  деплой при пуше в main
```

URL без расширения работают за счёт CloudFront Function из infra: `/about` →
`/about/index.html`, а `/about/` редиректит на `/about`, так что ссылки между страницами
пишем без слеша на конце (`/blog`, а не `/blog/`). Она же редиректит `www.elizarowa.com` →
`elizarowa.com` (с сохранением пути и UTM-меток).

## Локальный просмотр

```bash
cd site && python3 -m http.server 8000
# http://localhost:8000
```

## Как добавить статью

1. Скопируйте папку любой статьи: `site/blog/<старый-slug>/` → `site/blog/<новый-slug>/`.
   Slug — латиница через дефис, он же будет адресом: `elizarowa.com/blog/<новый-slug>`.
2. В `index.html` новой статьи замените `<title>`, `<meta name="description">`, дату в `<time>`,
   заголовок `<h1>`, обложку и содержимое внутри `<div class="article-content">`.
   Внутри можно использовать обычные теги: `<p>`, `<h2>`, `<h3>`, `<ul>/<ol>/<li>`, `<strong>`,
   `<em>`, `<a>`, `<blockquote>`, `<img>`, `<table>` — стили для них уже есть.
3. Картинки положите в `site/images/posts/<новый-slug>/` (желательно до ~300 КБ, jpg/webp).
4. В `site/blog/index.html` добавьте карточку статьи **в начало** списка «Статьи»
   (скопируйте соседнюю карточку и поправьте ссылку, картинку, дату, заголовок, описание).
5. Закоммитьте в `main` — через 1–2 минуты статья на сайте.

Материалы (раздел «Материалы» на `/blog`) добавляются так же: скопируйте карточку товара.
Кнопка «Хочу получить» открывает окно с контактом в Telegram — достаточно атрибута
`data-contact data-product="Название"` у кнопки.

## Стили

Страницы используют классы Tailwind, но Tailwind во время работы сайта не нужен:
`site/assets/css/tailwind.css` уже собран и лежит в репозитории.

- Правки, где хватает существующих классов или `site.css`, — просто редактируйте HTML/CSS.
- Если вы добавили в HTML **новый** класс Tailwind, которого раньше не было на сайте,
  пересоберите CSS (нужен только Node.js, без `package.json`):

  ```bash
  npx tailwindcss@3.4.19 -c tools/tailwind/tailwind.config.js -i tools/tailwind/input.css -o site/assets/css/tailwind.css --minify
  ```

## Деплой

Автоматически: пуш в `main`, затрагивающий `site/**`, запускает `.github/workflows/deploy.yml`.
Вручную: `gh workflow run deploy.yml` (или кнопка Run workflow в Actions).

Workflow входит в AWS по OIDC (без ключей доступа) и кладёт `site/` в префикс
`elizarowa.com/` общего бакета. Ему нужны переменные репозитория (Settings → Secrets and
variables → Actions → **Variables**) из `terraform output github_variables` в infra:
`AWS_ROLE_ARN`, `S3_BUCKET`, `S3_PREFIX`, `CLOUDFRONT_DISTRIBUTION_ID`. Роль берётся только
OIDC-токеном ветки `main` этого репозитория и может писать только в свой префикс, так что
секретами их делать не нужно. Ключей доступа и `.env` в проекте нет.

Кеширование: HTML браузер перепроверяет каждый раз, остальные файлы кешируются на сутки.
Если заменили картинку, лучше дать файлу новое имя — иначе у части посетителей старая
версия может держаться до суток.

## Инфраструктура

Описана в [bleschunov/infra](https://github.com/bleschunov/infra) (Terraform, `us-east-1`),
там же живут b8v.dev и другие статические сайты:

- **ACM** — бесплатный сертификат для `elizarowa.com` и `*.elizarowa.com`, продлевается сам.
- **S3** — общий приватный бакет `static-sites-…`, сайт в префиксе `elizarowa.com/`;
  публичный доступ запрещён, читает только CloudFront (OAC).
- **CloudFront** — HTTPS (TLS 1.2+), HTTP/2 и HTTP/3, сжатие, заголовки безопасности,
  своя страница `site/404.html` для 403/404.
- **IAM** — роль `deploy-elizarowa-com` для GitHub Actions: запись в свой префикс и
  инвалидация своей дистрибуции, больше ничего.
- **DNS** — в Squarespace (регистратор): `@` (ALIAS) и `www` (CNAME) указывают на
  CloudFront, почтовые записи Mailgun (MX, SPF, DKIM, DMARC) там же.

Изменить хостинг (заголовки, редиректы, домены) — PR в infra.

## Безопасность

- Сайт статический: нет сервера, базы, форм и API — атаковать на стороне сервера нечего.
- Заголовки: HSTS (2 года), `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`, CSP (`frame-ancestors`, `base-uri`, `object-src`,
  `form-action`, `upgrade-insecure-requests`).
- CSP **не ограничивает** `script-src`, потому что Google Tag Manager подгружает теги, которые
  настраиваются в интерфейсе GTM. Следствие: доступ к контейнеру GTM-PSCLD5WH = возможность
  выполнить любой JS на сайте. Держите доступ к GTM у минимума людей и с 2FA.
- Самое ценное теперь — аккаунты: Squarespace (регистратор домена и DNS), AWS, GitHub, GTM.
  Везде нужна 2FA; в Squarespace должна быть включена блокировка трансфера домена.
