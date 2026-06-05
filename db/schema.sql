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

-- ════════════════════════════════════════════════════════════
--  CRM продажников: продажники, сделки, лог обработки заявок
-- ════════════════════════════════════════════════════════════

-- ── Продажники ─────────────────────────────────────────────
-- Аккаунты менеджеров отдела продаж. Вход — личный код (api/sellers.js
-- ?action=login): храним только SHA-256 кода (code_hash), сам код не
-- сохраняется. Админ заводит и деактивирует аккаунты в разделе «Продажники».
CREATE TABLE IF NOT EXISTS sellers (
  id          TEXT PRIMARY KEY,                    -- s1, s2… или s{timestamp}
  name        TEXT NOT NULL,
  code_hash   TEXT,                                -- sha256 личного кода входа (NULL = вход закрыт)
  phone       TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,        -- false = доступ отозван
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sellers_code ON sellers (code_hash);
-- План продаж на месяц (₸). 0 = план не задан.
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS monthly_goal INT NOT NULL DEFAULT 0;

-- Какой продажник ведёт заявку (воронка). NULL = «свободный» лид.
ALTER TABLE requests ADD COLUMN IF NOT EXISTS assigned_seller_id TEXT;

-- ── Сделки ─────────────────────────────────────────────────
-- Закрытая продажа. Связана с заявкой (request_id), но клиент/телефон
-- продублированы снимком, чтобы сделка пережила удаление заявки.
-- seller_id ставится сервером из токена продажника — клиенту не доверяем.
-- amount — сумма сделки в тенге (по умолчанию = цена программы, можно изменить
-- под скидку/рассрочку). program_id — итоговая программа (может отличаться от
-- запрошенной в заявке).
CREATE TABLE IF NOT EXISTS deals (
  id           BIGSERIAL PRIMARY KEY,
  request_id   BIGINT REFERENCES requests(id) ON DELETE SET NULL,
  seller_id    TEXT REFERENCES sellers(id) ON DELETE SET NULL,
  client_name  TEXT NOT NULL,
  client_phone TEXT,
  program_id   TEXT,                               -- flagship-offline|flagship-online|club|teen|detox|consult
  amount       INT NOT NULL DEFAULT 0,             -- сумма сделки, ₸
  status       TEXT NOT NULL DEFAULT 'won' CHECK (status IN ('won','refunded')),
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at    TIMESTAMPTZ NOT NULL DEFAULT now()  -- дата закрытия (для отчётов по периодам)
);
CREATE INDEX IF NOT EXISTS idx_deals_seller ON deals (seller_id);
CREATE INDEX IF NOT EXISTS idx_deals_closed ON deals (closed_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_request ON deals (request_id);

-- ── Лог обработки заявки ───────────────────────────────────
-- История контактов продажника с клиентом по конкретной заявке:
-- звонки, сообщения, заметки, отметки смены статуса. Лента в карточке лида.
CREATE TABLE IF NOT EXISTS request_activities (
  id          BIGSERIAL PRIMARY KEY,
  request_id  BIGINT REFERENCES requests(id) ON DELETE CASCADE,
  seller_id   TEXT,
  seller_name TEXT,                                -- снимок имени автора записи
  type        TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('call','whatsapp','meeting','note','status')),
  text        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activities_request ON request_activities (request_id, created_at);

-- ════════════════════════════════════════════════════════════
--  Личные кабинеты клиентов + роль специалиста
-- ════════════════════════════════════════════════════════════
-- После оплаты (deals) администратор формирует клиенту личный кабинет
-- (вход по личному коду, как у продажника) и прикрепляет специалиста —
-- человека из команды (team_members), который проверяет таблицы/графики
-- клиента и оставляет комментарии. Роли кабинета: admin | seller | specialist | client.

-- Вход специалиста: участник «Команды» может входить в кабинет по личному коду.
-- Храним только SHA-256 кода (как у продажников); NULL = вход закрыт.
-- «active» в team_members означает «опубликован на сайте» и к входу не относится.
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS code_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_team_code ON team_members (code_hash);

-- ── Клиенты ────────────────────────────────────────────────
-- Аккаунт клиента с личным кабинетом. Заводит администратор после оплаты
-- (обычно из карточки сделки). Персональные данные — снимок (как в deals),
-- чтобы кабинет пережил удаление заявки/сделки. Вход — личный код (code_hash).
CREATE TABLE IF NOT EXISTS clients (
  id            TEXT PRIMARY KEY,                  -- c{timestamp}
  name          TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  city          TEXT,
  note          TEXT,                              -- внутренняя заметка администратора
  program_id    TEXT,                              -- купленная программа (снимок)
  deal_id       BIGINT REFERENCES deals(id)        ON DELETE SET NULL,
  request_id    BIGINT REFERENCES requests(id)     ON DELETE SET NULL,
  specialist_id TEXT   REFERENCES team_members(id) ON DELETE SET NULL,  -- прикреплённый специалист
  code_hash     TEXT,                              -- SHA-256 личного кода входа клиента (NULL = вход закрыт)
  active         BOOLEAN NOT NULL DEFAULT true,    -- false = доступ отозван
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clients_code       ON clients (code_hash);
CREATE INDEX IF NOT EXISTS idx_clients_specialist ON clients (specialist_id);

-- ── Лента кабинета клиента ─────────────────────────────────
-- Комментарии вокруг клиента: специалист проверяет данные и пишет заметки,
-- клиент может отвечать, администратор тоже видит. Копия структуры
-- request_activities. Автор подписывается ролью (admin | specialist | client).
CREATE TABLE IF NOT EXISTS client_activities (
  id          BIGSERIAL PRIMARY KEY,
  client_id   TEXT REFERENCES clients(id) ON DELETE CASCADE,
  author_id   TEXT,
  author_name TEXT,                                -- снимок имени автора
  author_role TEXT,                                -- admin | specialist | client
  type        TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('note','review')),
  text        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_client_act ON client_activities (client_id, created_at);

-- ── Папки/группы клиентов специалиста ──────────────────────
-- Специалист ведёт много клиентов по разным программам и потокам, поэтому
-- раскладывает их по папкам. Папка привязана к программе и дате потока
-- (необязательное название сверху). Владелец — специалист (team_members).
-- Клиент лежит максимум в одной папке (clients.group_id).
CREATE TABLE IF NOT EXISTS client_groups (
  id            TEXT PRIMARY KEY,                  -- g{timestamp}
  specialist_id TEXT REFERENCES team_members(id) ON DELETE CASCADE,
  title         TEXT,                              -- необязательное название папки
  program_id    TEXT,                              -- программа потока (flagship-offline|…)
  group_date    TEXT,                              -- дата потока YYYY-MM-DD (текст — без сюрпризов часовых поясов)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_client_groups_spec ON client_groups (specialist_id);

-- В какой папке лежит клиент (NULL = «Без папки»). Папку удалили → клиент выпадает из неё.
ALTER TABLE clients ADD COLUMN IF NOT EXISTS group_id TEXT REFERENCES client_groups(id) ON DELETE SET NULL;

-- ── График снижения веса (кабинет клиента) ─────────────────
-- Клиент в своём кабинете один раз задаёт старт программы: дату начала и
-- стартовый вес. От них строятся три целевые прямые на 30 дней:
--   −6%  = start_weight × 0.94   (красная линия)
--   −10% = start_weight × 0.90   (синяя линия)
--   −15% = start_weight × 0.85   (зелёная линия)
-- Дальше клиент каждый день записывает фактический вес — это его личная
-- (чёрная) линия. Специалист и админ график видят (только чтение).
-- Даты храним TEXT (YYYY-MM-DD) — как group_date, без сюрпризов часовых поясов.
ALTER TABLE clients ADD COLUMN IF NOT EXISTS program_start TEXT;        -- дата старта программы YYYY-MM-DD
ALTER TABLE clients ADD COLUMN IF NOT EXISTS start_weight  NUMERIC(5,1); -- стартовый вес, кг (якорь целевых линий)

-- Ежедневные замеры веса клиента (чёрная линия графика). Один замер на дату:
-- повторная запись за тот же день перезаписывает значение (UPSERT по client_id+entry_date).
CREATE TABLE IF NOT EXISTS client_weights (
  id          BIGSERIAL PRIMARY KEY,
  client_id   TEXT REFERENCES clients(id) ON DELETE CASCADE,
  entry_date  TEXT NOT NULL,                       -- YYYY-MM-DD
  weight      NUMERIC(5,1) NOT NULL,               -- кг
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, entry_date)
);
CREATE INDEX IF NOT EXISTS idx_client_weights ON client_weights (client_id, entry_date);

-- ── Дневник питания (таблица под графиком) ─────────────────
-- Нижняя таблица из бланка программы: строки-привычки × дни программы.
-- Клиент отмечает выполнение по дням. Поля фиксированы (см. api/clients.js DIARY_FIELDS):
--   log_before — «Запись перед едой»                (отметка)
--   food_stock — «Пищевой запас»                    (отметка)
--   oil        — «Масло раст.»                       (отметка)
--   vitamins   — «Витамины»                          (отметка)
--   ca_zn      — «Ca + Zn, клетчатка, пробиотики»    (отметка)
--   spoons     — «Количество ложек»                  (число)
-- Храним только заполненные клетки (пустая = строки нет). value TEXT: '1' для
-- отметок, число строкой для spoons. Один замер на (клиент, дата, поле).
CREATE TABLE IF NOT EXISTS client_diary (
  client_id  TEXT REFERENCES clients(id) ON DELETE CASCADE,
  entry_date TEXT NOT NULL,                          -- YYYY-MM-DD
  field      TEXT NOT NULL,                          -- ключ строки (см. выше)
  value      TEXT NOT NULL,                          -- '1' для отметок, число строкой для spoons
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, entry_date, field)
);
CREATE INDEX IF NOT EXISTS idx_client_diary ON client_diary (client_id, entry_date);

-- ── Замеры тела (см) ───────────────────────────────────────
-- Объёмы тела клиента в двух точках: 'start' (день 1) и 'd4' (4-й день = старт+3).
-- По разнице система авто-собирает отчёт (что ушло / без изменений / выросло) —
-- хранить отчёт не нужно, он считается на лету. Поля фиксированы (см. api/clients.js
-- MEASURE_FIELDS): waist, chest, chest_over, chest_under, hips, galife, neck, arm, wrist.
CREATE TABLE IF NOT EXISTS client_measures (
  client_id  TEXT REFERENCES clients(id) ON DELETE CASCADE,
  phase      TEXT NOT NULL,                          -- 'start' | 'd4'
  field      TEXT NOT NULL,                          -- ключ замера (см. выше)
  value      NUMERIC(5,1) NOT NULL,                  -- см
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, phase, field)
);
CREATE INDEX IF NOT EXISTS idx_client_measures ON client_measures (client_id);

-- ── Анкета обратной связи (кабинет клиента) ────────────────
-- Клиент заполняет анкету удовлетворённости в своём кабинете (отдельная
-- страница «Анкета»). Вопросы и варианты — копия n8n-формы om-time-anketa
-- (определены на фронте в SurveyConfig.jsx, проверяются в api/clients.js
-- SURVEY_FIELDS). Одна актуальная анкета на клиента: повторная отправка
-- перезаписывает (UPSERT по client_id). Все ответы — один JSON-объект
-- (ключ вопроса → ответ), чтобы добавлять/менять вопросы без миграций.
-- Админ в «Аналитике» сводит ответы в целом и видит каждого клиента отдельно.
CREATE TABLE IF NOT EXISTS client_surveys (
  client_id    TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  answers      JSONB NOT NULL DEFAULT '{}',          -- { source, times, kg_lost, admin, trainer, ... }
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
