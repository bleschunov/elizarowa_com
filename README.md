# elizarowa.com — сайт психолога

Сайт психолога Екатерины Елизаровой, построенный на Astro (SSR) с Keystatic CMS, React и Tailwind CSS.

## Стек

- **Astro** — SSR-фреймворк (output: 'server', adapter: node)
- **React** — интерактивные компоненты (модальные окна, карточки товаров)
- **Tailwind CSS** — стилизация
- **Keystatic CMS** — headless CMS с хранением контента в GitHub
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
│   ├── posts/              — статьи в формате Markdown/Markdoc
│   └── products/           — материалы в формате JSON
├── layouts/
│   ├── BaseLayout.astro    — базовый HTML-шаблон
│   └── PageLayout.astro    — шаблон с шапкой и подвалом
└── pages/
    ├── index.astro         — главная страница (полноэкранный лендинг)
    ├── about.astro         — страница "Обо мне"
    ├── api/
    │   └── order.ts        — API для отправки заявок в Telegram
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

Откройте `.env` и заполните переменные (см. разделы ниже):

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
GITHUB_REPO_OWNER=...
GITHUB_REPO_NAME=...
KEYSTATIC_GITHUB_CLIENT_ID=...
KEYSTATIC_GITHUB_CLIENT_SECRET=...
KEYSTATIC_SECRET=...
```

### 3. Запуск dev-сервера

```bash
npm run dev
```

Сайт будет доступен на `http://localhost:4321`.
Keystatic CMS — на `http://localhost:4321/keystatic`.

### 4. Сборка для продакшна

```bash
npm run build
```

Собранный сервер будет в `dist/server/entry.mjs`.

---

## Настройка Keystatic CMS (GitHub mode)

Keystatic хранит контент прямо в репозитории GitHub и редактирует файлы через GitHub API. Для этого нужно создать GitHub OAuth App.

### Шаг 1. Создайте GitHub OAuth App

1. Перейдите в настройки GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**
2. Заполните поля:
   - **Application name**: `elizarowa-com CMS` (любое название)
   - **Homepage URL**: `https://ваш-домен.ru` (или `http://localhost:4321` для локальной разработки)
   - **Authorization callback URL**: `https://ваш-домен.ru/keystatic/github/oauth/callback`
     (для локалки: `http://localhost:4321/keystatic/github/oauth/callback`)
3. Нажмите **Register application**
4. На следующей странице нажмите **Generate a new client secret**
5. Скопируйте **Client ID** и **Client Secret**

### Шаг 2. Заполните переменные

```env
GITHUB_REPO_OWNER=ваш_github_логин
GITHUB_REPO_NAME=elizarowa-com
KEYSTATIC_GITHUB_CLIENT_ID=Ov23li...
KEYSTATIC_GITHUB_CLIENT_SECRET=your_secret
KEYSTATIC_SECRET=любая_длинная_случайная_строка_32_символа
```

`KEYSTATIC_SECRET` — любая случайная строка, используется для подписи сессий. Сгенерировать можно командой:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Шаг 3. Откройте CMS

После запуска (`npm run dev`) перейдите на `/keystatic` и авторизуйтесь через GitHub.

---

## Настройка Telegram-бота (для заявок на материалы)

### Шаг 1. Создайте бота

1. Откройте Telegram и найдите **@BotFather**
2. Отправьте команду `/newbot`
3. Следуйте инструкциям: введите название и username бота
4. BotFather пришлёт **токен** вида `1234567890:AAHdqTcvCH1vGWJxfSeofSs0K38W9-1rYV8`

```env
TELEGRAM_BOT_TOKEN=1234567890:AAHdqTcvCH1vGWJxfSeofSs0K38W9-1rYV8
```

### Шаг 2. Получите Chat ID

1. Напишите боту любое сообщение (например, `/start`)
2. Откройте в браузере:
   ```
   https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
   ```
3. В ответе найдите `"chat":{"id":XXXXXXXX}` — это и есть ваш Chat ID

```env
TELEGRAM_CHAT_ID=123456789
```

Теперь при отправке заявки через сайт вы будете получать уведомления в Telegram.

---

## Деплой на VPS (Nginx + PM2 + Certbot)

### Требования

- VPS с Ubuntu 22.04+
- Домен, направленный на IP сервера
- Node.js 20+ на сервере

### Шаг 1. Установка зависимостей на сервере

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (менеджер процессов)
sudo npm install -g pm2

# Nginx
sudo apt-get install -y nginx

# Certbot (SSL)
sudo apt-get install -y certbot python3-certbot-nginx
```

### Шаг 2. Загрузка и сборка проекта

```bash
# Клонируем репозиторий
git clone https://github.com/ВАШ_ЛОГИН/elizarowa-com.git /var/www/elizarowa-com
cd /var/www/elizarowa-com

# Устанавливаем зависимости
npm install

# Создаём .env
cp .env.example .env
nano .env  # заполняем переменные

# Собираем проект
npm run build
```

### Шаг 3. Запуск через PM2

```bash
pm2 start dist/server/entry.mjs --name elizarowa-com
pm2 save
pm2 startup  # следуйте инструкции для автозапуска
```

Проверьте, что сервер запустился:

```bash
pm2 status
pm2 logs elizarowa-com
```

По умолчанию сервер слушает на порту `4321`. Можно изменить через переменную:

```bash
PORT=4321 pm2 start dist/server/entry.mjs --name elizarowa-com
```

### Шаг 4. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/elizarowa-com
```

Вставьте конфигурацию:

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

Активируйте сайт:

```bash
sudo ln -s /etc/nginx/sites-available/elizarowa-com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 5. Получение SSL-сертификата

```bash
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

Certbot автоматически обновит конфигурацию Nginx и настроит редирект с HTTP на HTTPS.

Проверьте автоматическое обновление сертификата:

```bash
sudo certbot renew --dry-run
```

### Шаг 6. Обновление сайта

При выходе новой версии:

```bash
cd /var/www/elizarowa-com
git pull
npm install
npm run build
pm2 restart elizarowa-com
```

---

## Автодеплой через GitHub Actions

Keystatic CMS при сохранении статьи делает коммит в репозиторий. GitHub Actions перехватывает этот коммит и автоматически пересобирает сайт на VPS — вручную ничего делать не нужно.

### Как это работает

```
Редактор сохраняет статью в Keystatic
  → Keystatic делает коммит в ветку main на GitHub
    → GitHub Actions запускает workflow
      → SSH на VPS: git pull → npm install → npm run build → pm2 restart
```

### Шаг 1. Создайте SSH-ключ для деплоя

На своём компьютере (или прямо на VPS) сгенерируйте отдельную пару ключей для CI:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""
```

Добавьте публичный ключ на VPS в список авторизованных:

```bash
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
```

### Шаг 2. Добавьте секреты в GitHub

Перейдите в репозиторий → **Settings → Secrets and variables → Actions → New repository secret** и добавьте:

| Имя секрета | Значение |
|---|---|
| `SSH_PRIVATE_KEY` | содержимое файла `~/.ssh/deploy_key` (приватный ключ) |
| `SSH_HOST` | IP-адрес или домен вашего VPS |
| `SSH_USER` | имя пользователя на VPS (например, `ubuntu` или `root`) |
| `DEPLOY_PATH` | путь к проекту на VPS, например `/var/www/elizarowa-com` |

### Шаг 3. Проверка

После настройки секретов перейдите в репозиторий → вкладка **Actions**. Workflow запустится автоматически при следующем изменении контента через Keystatic.

---

## Управление контентом

После деплоя CMS доступна по адресу `https://ваш-домен.ru/keystatic`.

- **Статьи** — создаются в разделе "Статьи", хранятся в `src/content/posts/`
- **Материалы** — создаются в разделе "Материалы", хранятся в `src/content/products/`

Все изменения через CMS автоматически создают коммиты в GitHub, и сайт нужно пересобрать для их применения (или настроить GitHub Actions для автоматического деплоя).
