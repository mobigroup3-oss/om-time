# Деплой OM-Time на Vercel (хостинг + домен + бэкенд)

Сайт — статика без сборки (React + Babel из CDN). Vercel раздаёт файлы как есть
и автоматически поднимает функции из папки `api/`. Заготовки уже в репозитории:

- `vercel.json` — конфиг (чистые URL, редирект `/` → маркетинг).
- `api/booking.js` — приём заявок с формы записи.
- `db/schema.sql` — схема базы данных под текущие хранилища кабинета.

---

## Шаг 1. Поднять сайт (5 минут)

1. Зарегистрируйся на **vercel.com** через GitHub.
2. **Add New → Project** → выбери репозиторий `mobigroup3-oss/om-time`.
3. Framework Preset: **Other**. Root Directory: **`/`** (репозиторий = папка `project/`).
   Build Command и Output Directory — **оставить пустыми**.
4. **Deploy**. Через минуту сайт открыт на `https://<имя>.vercel.app`.

С этого момента каждый `git push` в `main` деплоится автоматически.

## Шаг 2. Домен

- **`.com` (всё в одном на Vercel):** Project → **Settings → Domains → Buy** —
  покупка и привязка в одной панели, SSL автоматически.
- **`.kz` (отдельно):** купить на `ps.kz`/`hoster.kz`, затем в Vercel
  **Settings → Domains → Add** и прописать у регистратора DNS-записи, которые
  покажет Vercel (A / CNAME). SSL Vercel выпустит сам.

## Шаг 3. Включить бэкенд-функцию

Функция `api/booking.js` работает сразу (возвращает код брони). Чтобы заявки
сохранялись и приходили уведомления — добавь переменные окружения в
**Settings → Environment Variables** (любые из них, по необходимости):

| Переменная | Зачем |
|---|---|
| `POSTGRES_URL` | сохранять заявки в БД (см. Шаг 4) |
| `RESEND_API_KEY` + `NOTIFY_EMAIL` | письмо о новой заявке (resend.com, есть free-тариф) |
| `FROM_EMAIL` | адрес отправителя (после подтверждения домена в Resend) |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | уведомление в Telegram (бот через @BotFather) |

После изменения переменных нажми **Redeploy**.

## Шаг 4. База данных

1. Vercel → **Storage → Create → Postgres** → привязать к проекту
   (переменная `POSTGRES_URL` подставится автоматически).
2. Вкладка **Query** → вставить и выполнить содержимое `db/schema.sql`.
3. Чтобы `api/booking.js` мог писать в БД, нужен драйвер. В корне проекта
   создать `package.json`:
   ```json
   { "dependencies": { "@vercel/postgres": "^0.10.0" } }
   ```
   (Build Command оставить пустым — это только зависимость для функций.)

## Шаг 5. Подключить форму записи к функции

В `ui_kits/marketing/BookingPage.jsx`, в `handleSubmit`, заменить локальную
генерацию кода на запрос к функции:

```js
async function handleSubmit(ev) {
  ev.preventDefault();
  if (!validate()) return;
  try {
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, programId, eventId }),
    });
    const data = await res.json();
    if (!data.ok) { /* показать data.errors */ return; }
    setBookingCode(data.code);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    // показать сообщение об ошибке сети
  }
}
```

---

## Дальнейшие шаги (по мере надобности)

- Перенести остальные хранилища кабинета (`omtime.team.v1`, `omtime.programs.v1`,
  расписание, карусель) с localStorage на функции `api/` + таблицы из `schema.sql`,
  чтобы правки админа видели все посетители.
- Настоящая авторизация админки вместо текущей.
- Подключить аналитику к реальным данным (`requests`, `team_members`).
