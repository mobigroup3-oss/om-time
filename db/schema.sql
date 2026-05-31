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

-- ── Программы ──────────────────────────────────────────────
-- localStorage('omtime.programs.v1') (AdminProgramsEditor).
-- Поле desc в JS → колонка descr (desc — зарезервированное слово SQL).
CREATE TABLE IF NOT EXISTS programs (
  id         TEXT PRIMARY KEY,                       -- p1, p2… или p{timestamp}
  title      TEXT NOT NULL,
  format     TEXT,                                   -- offline | online | hybrid
  weeks      INT,
  price      INT,                                    -- в тенге
  descr      TEXT,
  active     BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0
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
  capacity       INT,                                -- свободно мест (null = без лимита)
  capacity_total INT,                                -- всего мест
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published','draft'))
);

-- ── Слайды Hero-карусели ───────────────────────────────────
-- localStorage('om-hero-carousel') (AdminHeroCarousel).
-- Структура слайда хранится как JSON — гибко под текущий редактор.
CREATE TABLE IF NOT EXISTS hero_slides (
  id         BIGSERIAL PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  data       JSONB NOT NULL
);
