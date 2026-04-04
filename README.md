# elizarowa.com — сайт психолога

Сайт психолога Екатерины Елизаровой, построенный на Astro (SSR) с Keystatic CMS, React и Tailwind CSS.

## Стек

- **Astro** — SSR-фреймворк (output: 'server', adapter: node)
- **React** — интерактивные компоненты (модальные окна, карточки товаров)
- **Tailwind CSS** — стилизация
- **@astrojs/markdoc** — поддержка `.mdoc` формата статей
- **Keystatic CMS** — headless CMS, хранит контент прямо в репозитории GitHub
- **@fontsource/inter** — шрифт Inter

## Структура проекта

```
src/
├── components/
│   ├── BookButton.astro    — кнопка "Записаться" с ссылкой на Calendly
│   ├── Header.astro        — шапка с навигацией и мобильным меню
│   ├── OrderModal.tsx      — модальное окно заказа материала (React)
│   ├── ProductCard.tsx     — карточка материала с кнопкой заказа (React)
│   └── SocialIcons.astro   — иконки социальных сетей
├── content/
│   ├── config.ts           — схемы коллекций Astro Content
│   ├── posts/              — статьи в формате .mdoc (Markdoc)
│   └── products/           — материалы в формате .json
├── layouts/
│   ├── BaseLayout.astro    — базовый HTML-шаблон
│   └── PageLayout.astro    — шаблон с шапкой и подвалом
└── pages/
    ├── index.astro         — главная страница
    ├── about.astro         — страница "Обо мне"
    ├── api/
    │   └── order.ts        — POST /api/order — заявки в Telegram
    └── blog/
        ├── index.astro     — список статей и материалов
        └── [slug].astro    — страница отдельной статьи
```

---

## Запуск локально

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

```bash
cp .env.example .env
```

По умолчанию Keystatic работает в **local-режиме** — без авторизации, пишет файлы прямо на диск. Для просмотра дизайна и разработки больше ничего не нужно.

### 3. Запуск dev-сервера

```bash
npm run dev
```

Сайт: `http://localhost:4321`
Keystatic CMS: `http://localhost:4321/keystatic`

### 4. Сборка для продакшна

```bash
npm run build
```

Собранный сервер: `dist/server/entry.mjs`

---

## Настройка Keystatic CMS (GitHub mode)

Keystatic хранит контент прямо в репозитории GitHub (можно приватном) и редактирует файлы через GitHub API. В продакшне GitHub mode включается автоматически.

### Самый простой способ — встроенный walkthrough

Для первого запуска достаточно трёх переменных в `.env`:

```env
PUBLIC_KEYSTATIC_STORAGE=github
PUBLIC_GITHUB_REPO_OWNER=ваш_github_логин
PUBLIC_GITHUB_REPO_NAME=ваш_репо_на_github
```

Остальное Keystatic настроит сам:

1. Запустите сервер (`npm run dev`) и откройте `http://127.0.0.1:4321/keystatic`
2. Keystatic запустит пошаговый мастер — создаст OAuth App на GitHub и автоматически запишет оставшиеся переменные в `.env`
3. Перезапустите сервер

### Переменные окружения для GitHub mode

```env
PUBLIC_KEYSTATIC_STORAGE=github
PUBLIC_GITHUB_REPO_OWNER=ваш_github_логин
PUBLIC_GITHUB_REPO_NAME=ваш_репо_на_github

KEYSTATIC_GITHUB_CLIENT_ID=Ov23li...
KEYSTATIC_GITHUB_CLIENT_SECRET=your_secret
KEYSTATIC_SECRET=любая_случайная_строка_32_символа
```

`KEYSTATIC_SECRET` — случайная строка для подписи сессий. Сгенерировать:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> Если `PUBLIC_KEYSTATIC_STORAGE` не задан или пуст — Keystatic работает в local-режиме без авторизации (удобно для разработки). В продакшн-сборке всегда используется github-режим.

---

## Настройка Telegram-бота (для заявок на материалы)

### Шаг 1. Создайте бота

1. Откройте Telegram, найдите **@BotFather**
2. Отправьте `/newbot`, следуйте инструкциям
3. Скопируйте токен вида `1234567890:AAHdqTcvCH1vGWJxfSeofSs0K38W9-1rYV8`

```env
TELEGRAM_BOT_TOKEN=1234567890:AAHdqTcvCH1vGWJxfSeofSs0K38W9-1rYV8
```

### Шаг 2. Получите Chat ID

1. Напишите боту любое сообщение (например, `/start`)
2. Откройте в браузере:
   ```
   https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
   ```
3. В ответе найдите `"chat":{"id":XXXXXXXX}` — это ваш Chat ID

```env
TELEGRAM_CHAT_ID=123456789
```

---

## Деплой на VPS (Nginx + PM2 + Certbot)

### Требования

- VPS с Ubuntu 22.04+
- Домен, направленный на IP сервера
- Node.js 20+ на сервере

### Шаг 0. Создание пользователя

Не работайте под `root` — создайте отдельного пользователя:

```bash
adduser deploy
usermod -aG sudo deploy   # добавить в sudoers
su - deploy               # переключиться на нового пользователя
```

### Шаг 0.1. Открытие портов

```bash
sudo ufw allow 443           # HTTPS
sudo ufw allow 22            # SSH — не закрывайте, иначе потеряете доступ к серверу
sudo ufw enable
```

### Шаг 1. Установка зависимостей на сервере

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2
sudo npm install -g pm2

# Nginx
sudo apt-get install -y nginx

# Certbot
sudo apt-get install -y certbot python3-certbot-nginx
```

### Шаг 2. Загрузка и сборка проекта

```bash
git clone https://github.com/ВАШ_ЛОГИН/elizarowa-com.git /var/www/elizarowa-com
cd /var/www/elizarowa-com

npm install

cp .env.example .env
nano .env  # заполняем переменные

npm run build
```

### Шаг 3. Запуск через PM2

```bash
pm2 start dist/server/entry.mjs --name elizarowa-com
pm2 save
pm2 startup
```

```bash
pm2 status
pm2 logs elizarowa-com
```

По умолчанию сервер слушает на порту `4321`. Изменить:

```bash
PORT=3000 pm2 start dist/server/entry.mjs --name elizarowa-com
```

### Шаг 4. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/elizarowa-com
```

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/elizarowa-com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 5. SSL-сертификат

```bash
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
sudo certbot renew --dry-run
```

---

## Автодеплой через GitHub Actions

Workflow уже создан в `.github/workflows/deploy.yml`. Он запускается автоматически при каждом коммите в `main` (в том числе от Keystatic при сохранении статьи).

### Добавьте секреты в GitHub

**Settings → Secrets and variables → Actions → New repository secret:**

| Секрет | Значение |
|---|---|
| `SSH_PRIVATE_KEY` | приватный SSH-ключ для доступа к VPS |
| `SSH_HOST` | IP или домен VPS |
| `SSH_USER` | пользователь на VPS (`ubuntu`, `root` и т.д.) |
| `DEPLOY_PATH` | путь к проекту, например `/var/www/elizarowa-com` |

Сгенерировать SSH-ключ для деплоя:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys  # на VPS
```

---

## Управление контентом

CMS доступна по адресу `/keystatic`.

- **Статьи** — хранятся в `src/content/posts/` в формате `.mdoc`
- **Материалы** — хранятся в `src/content/products/` в формате `.json`

Keystatic автоматически коммитит изменения в GitHub, GitHub Actions пересобирает сайт на VPS.
