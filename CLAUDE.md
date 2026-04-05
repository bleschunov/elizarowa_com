# elizarowa.com — контекст для Claude

## Что это за проект

Сайт психолога Екатерины Елизаровой. Astro SSR + React + Tailwind CSS + Keystatic CMS.

Домен: elizarowa.com
VPS: Ubuntu, пользователь `deploy`, путь `/var/www/elizarowa-com`
Репо: github.com/bleschunov/elizarowa_com (приватное)

## Стек

- **Astro** — SSR, `output: 'server'`, адаптер `@astrojs/node` (standalone)
- **React** — клиентские компоненты (`client:load`): `OrderModal.tsx`, `ProductCard.tsx`
- **Tailwind CSS** — кастомная бежевая палитра `beige-50..900`, шрифт Inter
- **@astrojs/markdoc** — статьи в формате `.mdoc`
- **Keystatic CMS** — headless CMS, хранит контент в GitHub репо
- **PM2** — процесс-менеджер на сервере
- **Nginx** — реверс-прокси, проксирует на порт 4321
- **Certbot** — SSL-сертификат Let's Encrypt

## Структура контента

- `src/content/posts/*.mdoc` — статьи (title, date, cover, excerpt, content)
- `src/content/products/*.json` — материалы (title, description, price, cover)
- Схемы коллекций: `src/content/config.ts`
- `date` в статьях — опциональный, тип `z.string().or(z.date().transform(...))`

## Keystatic CMS

Два режима, переключаются автоматически в `keystatic.config.ts`:

- **local** — когда `import.meta.env.DEV === true` и `PUBLIC_KEYSTATIC_STORAGE` не задан. Без авторизации, пишет файлы на диск. Для локальной разработки.
- **github** — в продакшне всегда, или если `PUBLIC_KEYSTATIC_STORAGE=github`. Хранит контент через GitHub API, требует OAuth.

Важно: Keystatic в GitHub mode работает только с дефолтной веткой репо (main).

CMS доступна по `/keystatic`. В продакшне требует HTTPS — `crypto.subtle` не работает на HTTP.

## Деплой

GitHub Actions (`.github/workflows/deploy.yml`) запускается при коммите в `main` по путям `src/content/**`, `src/pages/**` и т.д.

Script на сервере:
```bash
export NVM_DIR="/home/deploy/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd $DEPLOY_PATH
git pull origin main
npm install --omit=dev
NODE_OPTIONS="--max-old-space-size=1536" npm run build
pm2 restart elizarowa-com
```

`NODE_OPTIONS="--max-old-space-size=1536"` — обязателен, VPS с 2GB RAM, без флага Node падает с OOM при сборке.

## Переменные окружения

```env
TELEGRAM_BOT_TOKEN=         # бот для заявок на материалы
TELEGRAM_CHAT_ID=           # куда слать уведомления

PUBLIC_KEYSTATIC_STORAGE=github   # включить github mode
PUBLIC_GITHUB_REPO_OWNER=bleschunov
PUBLIC_GITHUB_REPO_NAME=elizarowa_com

KEYSTATIC_GITHUB_CLIENT_ID=       # OAuth App на GitHub
KEYSTATIC_GITHUB_CLIENT_SECRET=
KEYSTATIC_SECRET=                 # случайная строка 32+ символа для подписи сессий
```

## Известные проблемы и решения

- **Статьи не отображаются** — скорее всего ошибка в frontmatter (дата, кавычки в title) или коллекция не синхронизирована
- **`crypto.subtle` / `digest` ошибка в Keystatic** — сайт открыт по HTTP, нужен HTTPS
- **`npm: command not found` в GitHub Actions** — NVM не инициализируется в неинтерактивной сессии, нужно явно подгружать через `source $NVM_DIR/nvm.sh`
- **OOM при сборке** — добавить `NODE_OPTIONS="--max-old-space-size=1536"`
- **Keystatic не видит статьи** — контент должен быть в дефолтной ветке (main)
- **Certbot Connection refused** — проверить `server_name` в nginx конфиге (должен быть домен, не IP) и что DNS уже обновился

## Страницы

- `/` — главная (два layout: мобильный fullscreen + десктоп с рамкой)
- `/about` — обо мне
- `/blog` — список статей и материалов
- `/blog/[slug]` — отдельная статья
- `/api/order` — POST endpoint → Telegram Bot API
- `/keystatic` — CMS
