# elizarowa.com — сайт психолога

Сайт Екатерины Елизаровой. Чистая статика (HTML + CSS + немного JS) без сборки,
хостится в приватном S3-бакете и раздаётся через CloudFront.

```
GitHub (main) ──push──▶ GitHub Actions ──OIDC──▶ AWS
                                         │
                       s3 sync site/ ────┤──▶ S3 (приватный) ◀── CloudFront ◀── elizarowa.com
                       invalidation ─────┘                         (HTTPS, ACM)   (Route 53)
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

infra/site.yaml            CloudFormation: Route 53, ACM, S3, CloudFront, права деплоя
infra/deploy.sh            применить шаблон (dns | site | status)
scripts/setup-aws-wizard.sh  пошаговый мастер первоначального переезда
tools/tailwind/            конфиг для пересборки tailwind.css (нужен редко)
.github/workflows/deploy.yml  деплой при пуше в main
```

URL без расширения работают за счёт CloudFront Function: `/about` → `/about/index.html`.
Она же редиректит `www.elizarowa.com` → `elizarowa.com`.

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

Workflow входит в AWS по OIDC (без ключей доступа) и использует секреты репозитория
(Settings → Secrets and variables → Actions → **Secrets**), их записывает мастер:

| Секрет | Откуда |
|---|---|
| `AWS_ROLE_ARN` | IAM-роль для GitHub Actions (OIDC) |
| `S3_BUCKET` | output `BucketName` стека (`infra/deploy.sh status`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | output `DistributionId` стека |

По этим значениям одним ничего сделать нельзя (роль берётся только OIDC-токеном
этого репозитория, бакет закрыт); секретами они сделаны, чтобы маскироваться в логах
и не раскрывать ID AWS-аккаунта. Ключей доступа и `.env` в проекте нет.

Кеширование: HTML браузер перепроверяет каждый раз, остальные файлы кешируются на сутки.
Если заменили картинку, лучше дать файлу новое имя — иначе у части посетителей старая
версия может держаться до суток.

## Инфраструктура

Всё описано в `infra/site.yaml` (стек `elizarowa-com`, регион `us-east-1`):

- **Route 53** — DNS-зона домена, включая почтовые записи Mailgun (MX, SPF, DKIM, DMARC).
  Домен зарегистрирован в Squarespace, там прописаны NS Route 53.
- **ACM** — бесплатный сертификат для `elizarowa.com` и `www`, продлевается сам.
- **S3** — приватный бакет: публичный доступ запрещён, читает только CloudFront (OAC),
  только HTTPS, шифрование, версии файлов хранятся 30 дней.
- **CloudFront** — HTTPS (TLS 1.2+), HTTP/2 и HTTP/3, сжатие, заголовки безопасности.
- **IAM** — к существующей OIDC-роли добавляется политика: запись в этот бакет и
  инвалидация этой дистрибуции, больше ничего.

Изменить инфраструктуру: поправьте `infra/site.yaml` и выполните `infra/deploy.sh site`
(нужен aws CLI с админскими правами). DNS-записи (например, новая TXT-верификация)
тоже добавляются в шаблон, а не в консоли — иначе следующий деплой стека их не тронет,
но и в коде их не будет.

Первоначальный переезд с VPS: `scripts/setup-aws-wizard.sh` (проводит через AWS,
Squarespace и GitHub). После переезда мастер можно удалить.

## Безопасность

- Сайт статический: нет сервера, базы, форм и API — атаковать на стороне сервера нечего.
- Заголовки: HSTS (2 года), `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`, CSP (`frame-ancestors`, `base-uri`, `object-src`,
  `form-action`, `upgrade-insecure-requests`).
- CSP **не ограничивает** `script-src`, потому что Google Tag Manager подгружает теги, которые
  настраиваются в интерфейсе GTM. Следствие: доступ к контейнеру GTM-PSCLD5WH = возможность
  выполнить любой JS на сайте. Держите доступ к GTM у минимума людей и с 2FA.
- Самое ценное теперь — аккаунты: Squarespace (регистратор домена), AWS, GitHub, GTM.
  Везде нужна 2FA; в Squarespace должна быть включена блокировка трансфера домена.
