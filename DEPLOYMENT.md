# Руководство по деплою PWA

## Подготовка к деплою

### 1. Сборка проекта

Перед деплоем соберите проект:

```bash
npm run build
```

Это создаст папку `dist` с оптимизированными файлами для продакшена.

### 2. Проверка сборки локально

Проверьте сборку перед деплоем:

```bash
npm run preview
```

## Локальная разработка с ngrok (Tonkeeper, Telegram)

Чтобы открыть приложение в Tonkeeper или в Telegram Mini App с локального компьютера, нужен публичный HTTPS-адрес. Для этого подойдёт **ngrok**.

### Шаг 1: Установка ngrok

- Скачайте с [ngrok.com](https://ngrok.com/download) или установите через пакетный менеджер.
- Зарегистрируйтесь на [ngrok.com](https://ngrok.com), получите authtoken и выполните:
  ```bash
  ngrok config add-authtoken YOUR_TOKEN
  ```

### Шаг 2: Запуск dev-сервера с доступом из сети

В первом терминале запустите Vite так, чтобы он слушал все интерфейсы (нужно для ngrok):

```bash
npm run dev:tunnel
```

Или вручную:

```bash
npx vite --host
```

Сервер будет доступен по `http://localhost:5173` и по адресу вашего компьютера в локальной сети.

### Шаг 3: Запуск ngrok

Во втором терминале в папке проекта выполните:

```bash
ngrok http 5173
```

В выводе появится строка вида:

```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:5173
```

Скопируйте этот **https-** URL — это и есть адрес приложения для Tonkeeper и Telegram.

### Шаг 4: Открытие в Tonkeeper / Telegram

- В настройках бота или Mini App укажите этот `https://....ngrok-free.app` как URL приложения.
- Либо откройте этот URL в браузере внутри Tonkeeper.

Манифест Ton Connect (`/tonconnect-manifest.json`) в dev-режиме подставляется по хосту запроса, поэтому при открытии через ngrok-URL манифест будет отдаваться с правильным адресом.

### Полезно

- Бесплатный ngrok при каждом запуске даёт новый URL. Платный план позволяет закрепить домен.
- Если ngrok показывает страницу «Visit Site» — нажмите кнопку перехода, после этого загрузка приложения пойдёт нормально.

## Варианты деплоя

### Вариант 1: Vercel (Рекомендуется)

**Преимущества:** Автоматический деплой из Git, бесплатный хостинг, CDN, HTTPS

1. **Установите Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Деплой:**
   ```bash
   vercel
   ```
   Следуйте инструкциям в терминале.

3. **Автоматический деплой из Git:**
   - Зайдите на [vercel.com](https://vercel.com)
   - Подключите ваш GitHub/GitLab/Bitbucket репозиторий
   - Vercel автоматически определит настройки Vite
   - Каждый push в main/master будет автоматически деплоиться

**Настройки для Vite:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Вариант 2: Netlify

**Преимущества:** Простой деплой, бесплатный хостинг, автоматический HTTPS

1. **Установите Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Деплой:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Через веб-интерфейс:**
   - Зайдите на [netlify.com](https://netlify.com)
   - Перетащите папку `dist` в окно браузера
   - Или подключите Git репозиторий для автоматического деплоя

**Создайте файл `netlify.toml` в корне проекта:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Вариант 3: GitHub Pages

**Преимущества:** Бесплатно, интеграция с GitHub

1. **Установите gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Добавьте скрипты в `package.json`:**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Настройте `vite.config.js`:**
   ```js
   export default defineConfig({
     base: '/farm_game/', // замените на имя вашего репозитория
     plugins: [react()],
   })
   ```

4. **Деплой:**
   ```bash
   npm run deploy
   ```

5. **Включите GitHub Pages:**
   - Зайдите в Settings → Pages вашего репозитория
   - Выберите источник: `gh-pages` branch

### Вариант 4: Cloudflare Pages

**Преимущества:** Быстрый CDN, бесплатный хостинг

1. **Через веб-интерфейс:**
   - Зайдите на [pages.cloudflare.com](https://pages.cloudflare.com)
   - Подключите Git репозиторий
   - Настройки:
     - Build command: `npm run build`
     - Build output directory: `dist`

2. **Через Wrangler CLI:**
   ```bash
   npm install -g wrangler
   npm run build
   wrangler pages deploy dist
   ```

### Вариант 5: Firebase Hosting

**Преимущества:** Интеграция с Firebase сервисами

1. **Установите Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Инициализация:**
   ```bash
   firebase login
   firebase init hosting
   ```
   Выберите:
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Automatic builds: `No` (или `Yes` если используете GitHub)

3. **Деплой:**
   ```bash
   npm run build
   firebase deploy
   ```

### Вариант 6: Surge.sh

**Преимущества:** Быстрый и простой деплой

1. **Установите Surge:**
   ```bash
   npm install -g surge
   ```

2. **Деплой:**
   ```bash
   npm run build
   cd dist
   surge
   ```
   Следуйте инструкциям для создания аккаунта и выбора домена.

## Настройка для Telegram Mini App и Tonkeeper

Для работы Ton Connect (в т.ч. в Tonkeeper) по адресу приложения должен открываться манифест: **`/tonconnect-manifest.json`**. В dev-режиме его отдаёт плагин в Vite; при деплое файл копируется из `public/` в `dist/`.

**Важно:** не настраивайте редирект «всё в index.html» на путь `/tonconnect-manifest.json` — по этому URL должен отдаваться именно JSON-файл.

### URL приложения при сборке

При деплое задайте переменную окружения **`VITE_APP_URL`** (полный URL приложения с завершающим слэшем), чтобы в манифест попал правильный адрес:

- **Vercel:** Project → Settings → Environment Variables → `VITE_APP_URL` = `https://ваш-проект.vercel.app/`
- **Netlify:** Site settings → Build → Environment → `VITE_APP_URL` = `https://ваш-домен.netlify.app/`

Если переменная не задана, в сборке останутся значения из `public/tonconnect-manifest.json`. Их можно задать вручную:

```json
{
  "url": "https://your-deployed-domain.com/",
  "name": "Ферма",
  "iconUrl": "https://your-deployed-domain.com/vite.svg"
}
```

## Важные замечания для PWA

1. **HTTPS обязателен** - PWA требует HTTPS для работы service worker
2. **Проверьте CORS** - если используете внешние API
3. **Обновите домены** - замените `your-app-domain.com` на реальный домен
4. **Проверьте манифест** - убедитесь, что `manifest.json` доступен по HTTPS

## Проверка после деплоя

1. Откройте приложение в браузере
2. Проверьте работу service worker (DevTools → Application → Service Workers)
3. Проверьте манифест (DevTools → Application → Manifest)
4. Протестируйте установку PWA (кнопка "Установить" в браузере)

## Автоматизация деплоя

Для автоматического деплоя при каждом push создайте GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Рекомендации

- **Для быстрого старта:** Используйте Vercel или Netlify
- **Для простоты:** Surge.sh
- **Для интеграции с GitHub:** GitHub Pages
- **Для максимальной производительности:** Cloudflare Pages
