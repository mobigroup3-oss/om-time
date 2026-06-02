-- OM-Time — схема базы данных (PostgreSQL).
-- Повторяет хранилища localStorage из личного кабинета (ui_kits/account).
-- Запустить один раз: Vercel → Storage → Postgres → вкладка «Query»
-- (или psql / любой SQL-клиент по строке подключения).

-- ── Заявки: форма записи + обратные звонки ─────────────────
-- localStorage('omtime.requests.v1') (AdminRequestsEditor) + поля booking.html.
-- Сюда пишет api/booking.js.
CREATE TABLE IF NOT EXISTS requests (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  city        TEXT,
  format      TEXT,                                  -- offline | online | hybrid | ''
  comment     TEXT,
  program_id  TEXT,                                  -- flagship-offline|flagship-online|club|teen|detox|consult
  event_id    TEXT,                                  -- выбранный слот расписания (schedule_events.id)
  channel     TEXT NOT NULL DEFAULT 'form' CHECK (channel IN ('form','call')),
  status      TEXT NOT NULL DEFAULT 'new'  CHECK (status IN ('new','contacted','scheduled','done','declined')),
  code        TEXT,                                  -- код брони OM-XXXXX
  note        TEXT,                                  -- внутренняя заметка администратора
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_requests_status  ON requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_created ON requests (created_at DESC);

-- ── Команда центра ─────────────────────────────────────────
-- localStorage('omtime.team.v1') (AdminTeamEditor). Источник для аналитики.
CREATE TABLE IF NOT EXISTS team_members (
  id             TEXT PRIMARY KEY,                   -- t1, t2… или t{timestamp}
  name           TEXT NOT NULL,
  role_cat       TEXT,                               -- psychologist | nutritionist | trainer
  role_label     TEXT,
  tag            TEXT,
  tone           TEXT,                               -- gold | coral | sage | lilac
  photo          TEXT,                               -- data-URL фото аватара (или пусто → инициалы)
  spec           TEXT[] NOT NULL DEFAULT '{}',
  credentials    TEXT[] NOT NULL DEFAULT '{}',
  bio            TEXT,
  years          TEXT,
  years_label    TEXT,
  sessions       TEXT,
  sessions_label TEXT,
  featured       BOOLEAN NOT NULL DEFAULT false,     -- только один «Основатель»
  active         BOOLEAN NOT NULL DEFAULT true,      -- опубликован на сайте
  sort_order     INT NOT NULL DEFAULT 0
);
-- Миграция для уже созданной БД (CREATE TABLE IF NOT EXISTS не добавит колонку).
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS photo TEXT;

-- ── Программы ──────────────────────────────────────────────
-- localStorage('omtime.programs.v1') (AdminProgramsEditor).
-- Поле desc в JS → колонка descr (desc — зарезервированное слово SQL).
-- Колонки category…featured добавлены под витрину ProgramsPage.jsx
-- (публичная страница рисует больше полей, чем хранил черновой редактор).
CREATE TABLE IF NOT EXISTS programs (
  id            TEXT PRIMARY KEY,                    -- p1, p2… или p{timestamp}
  title         TEXT NOT NULL,
  format        TEXT,                                -- offline | online | hybrid (enum редактора)
  weeks         INT,
  price         INT,                                 -- в тенге (число; строку собирает витрина)
  descr         TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT NOT NULL DEFAULT 0,
  -- поля витрины:
  category      TEXT,                                -- flagship | online | club | teen | individual
  tag           TEXT,                                -- бейдж («4-дневный интенсив»)
  tag_class     TEXT,                                -- om-tag--gold | --lilac | --sage | --coral | ''
  includes      TEXT[] NOT NULL DEFAULT '{}',        -- список «что входит»
  dates         TEXT,                                -- свободный текст («4–7 ноября, 17:00»)
  trainer       TEXT,
  format_label  TEXT,                                -- витринный текст формата («Офлайн, Алматы»)
  price_prefix  TEXT,                                -- «от» (необязательно)
  price_note    TEXT,                                -- «−15 000 ₸ при предоплате»
  capacity_note TEXT,                                -- «осталось 3 места» (свободный текст)
  featured      BOOLEAN NOT NULL DEFAULT false,      -- флагман (крупная карточка на /программы)
  show_in_hero  BOOLEAN NOT NULL DEFAULT false        -- блок «Ближайшее событие» на главной
);

-- ── Расписание событий ─────────────────────────────────────
-- AdminScheduleEditor (сейчас живёт только в памяти — переносим в БД).
CREATE TABLE IF NOT EXISTS schedule_events (
  id             TEXT PRIMARY KEY,                   -- evt-1, evt-2… или evt-{timestamp}
  month          TEXT,                               -- 2025-11
  month_label    TEXT,                               -- Ноябрь 2025
  category       TEXT,                               -- flagship | club | detox | teen
  format         TEXT,                               -- offline | online
  title          TEXT NOT NULL,
  dates          TEXT,
  time           TEXT,
  duration       TEXT,
  trainer        TEXT,
  location       TEXT,
  price          TEXT,                               -- «160 000 ₸» (свободный текст)
  price_note     TEXT,                               -- «−15 000 ₸ при предоплате»
  capacity       INT,                                -- свободно мест (null = без лимита)
  capacity_total INT,                                -- всего мест
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published','draft')),
  -- поля витрины SchedulePage:
  tag            TEXT,                               -- бейдж («4-дневный интенсив»)
  tag_class      TEXT,                               -- om-tag--gold | --lilac | --sage | --coral
  format_label   TEXT,                               -- витринный текст формата («Офлайн, Алматы»)
  featured       BOOLEAN NOT NULL DEFAULT false,     -- крупная карточка-баннер
  is_new         BOOLEAN NOT NULL DEFAULT false      -- бейдж «новое»
);

-- ── Пустые месяцы расписания ───────────────────────────────
-- Месяц в расписании может существовать ещё до того, как в него добавлено
-- событие (кнопка «Новый месяц» в AdminScheduleEditor). Месяцы с событиями
-- выводятся из schedule_events; здесь хранятся только явно добавленные пустые.
-- localStorage('omtime.schedule.months.v1') — клиентский кэш этой таблицы.
CREATE TABLE IF NOT EXISTS schedule_months (
  month       TEXT PRIMARY KEY,                    -- 2026-02
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Слайды Hero-карусели ───────────────────────────────────
-- localStorage('om-hero-carousel') (AdminHeroCarousel).
-- Структура слайда хранится как JSON — гибко под текущий редактор.
CREATE TABLE IF NOT EXISTS hero_slides (
  id         BIGSERIAL PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  data       JSONB NOT NULL
);

-- ── Миграции (выполнять на существующей БД) ────────────────
-- Добавлено: поле show_in_hero для блока «Ближайшее событие» на главной.
-- Безопасно запускать повторно (IF NOT EXISTS).
ALTER TABLE programs ADD COLUMN IF NOT EXISTS show_in_hero BOOLEAN NOT NULL DEFAULT false;

-- Добавлено: таблица пустых месяцев расписания (кнопка «Новый месяц»).
CREATE TABLE IF NOT EXISTS schedule_months (
  month       TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
