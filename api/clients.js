// api/clients.js — клиенты с личным кабинетом. Заводит администратор после оплаты
// (обычно из карточки сделки). К клиенту прикрепляется специалист — участник
// «Команды» (team_members). Вход клиента — личный код (code_hash, как у продажников).
//
// CRUD (только админ):
//   GET    /api/clients              → список (с именем специалиста). Фильтр ?specialist=<id>
//   POST   /api/clients              → завести клиента (поле code → задать код входа)
//   PUT    /api/clients              → обновить (code: '' не трогает, 'X' меняет, null закрывает вход)
//   DELETE /api/clients?id=…          → удалить
//
// Специалист (заголовок x-specialist-token):
//   GET    /api/clients              → только свои прикреплённые клиенты
//
// Без админ-токена:
//   POST /api/clients?action=login   → { code } → { id, name } активного клиента или 401
//   GET  /api/clients?action=me      → по заголовку x-client-token → данные клиента + специалист
//
// Лента кабинета клиента (вынесена сюда же, чтобы уложиться в лимит Serverless-функций
// Vercel Hobby = 12; отдельный файл был бы 13-й функцией):
//   GET    /api/clients?resource=activities&clientId=…  → лента (по возрастанию времени)
//   POST   /api/clients?resource=activities             → { clientId, type, text }
//   DELETE /api/clients?resource=activities&id=…          → удалить (только админ)
//   Доступ к ленте: админ ИЛИ специалист этого клиента ИЛИ сам клиент.
//
// Код входа в БД не хранится — только SHA-256 (code_hash). Наружу код не отдаём.
import { handlePreflight, readJson, requireAdmin, getSql, emptyList, hashCode, isAdmin, getSpecialist, getClient } from './_lib.js';

const PROGRAMS = ['flagship-offline', 'flagship-online', 'club', 'teen', 'detox', 'consult'];
const ACT_TYPES = ['note', 'review'];

function toCanonical(r) {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone || '',
    email: r.email || '',
    city: r.city || '',
    note: r.note || '',
    programId: r.program_id || '',
    dealId: r.deal_id || null,
    requestId: r.request_id || null,
    specialistId: r.specialist_id || '',
    specialistName: r.specialist_name || '',   // из JOIN ниже
    groupId: r.group_id || '',                  // папка специалиста (NULL = без папки)
    hasCode: !!r.code_hash,                     // задан ли код входа (сам код не отдаём)
    active: r.active !== false,
    createdAt: r.created_at,
  };
}

const genId = () => 'c' + Date.now();

function actToCanonical(r) {
  return {
    id: r.id,
    clientId: r.client_id,
    authorId: r.author_id || '',
    authorName: r.author_name || '',
    authorRole: r.author_role || '',
    type: r.type || 'note',
    text: r.text || '',
    createdAt: r.created_at,
  };
}

function groupToCanonical(r) {
  return {
    id: r.id,
    specialistId: r.specialist_id || '',
    title: r.title || '',
    programId: r.program_id || '',
    date: r.group_date || '',                              // YYYY-MM-DD (TEXT)
    clientCount: r.client_count != null ? Number(r.client_count) : 0,
    createdAt: r.created_at,
  };
}

// Папки/группы клиентов специалиста (client_groups). Только специалист-владелец:
// заводит папки (программа + дата потока) и раскладывает по ним СВОИХ клиентов.
//   GET    ?resource=groups                          → свои папки (со счётчиком клиентов)
//   POST   ?resource=groups            { programId, date, title }     → создать
//   PUT    ?resource=groups            { id, programId, date, title } → переименовать/изменить
//   DELETE ?resource=groups&id=…                      → удалить (клиенты выпадают в «Без папки»)
//   POST   ?resource=groups&action=assign  { clientId, groupId|null } → переместить клиента
async function handleGroups(req, res, sql) {
  if (!sql) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, data: [] });
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }
  const sp = await getSpecialist(req);
  if (!sp) return res.status(401).json({ ok: false, error: 'Папки доступны специалисту' });

  const action = req.query && req.query.action;

  // Переместить клиента в папку / убрать из папки.
  if (action === 'assign') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    const b = readJson(req);
    const clientId = b.clientId;
    if (!clientId) return res.status(422).json({ ok: false, errors: { clientId: 'Нужен clientId' } });
    // клиент должен быть прикреплён к этому специалисту
    const own = await sql`SELECT 1 FROM clients WHERE id = ${clientId} AND specialist_id = ${sp.id} LIMIT 1`;
    if (!own.rows.length) return res.status(403).json({ ok: false, error: 'Это не ваш клиент' });
    let groupId = b.groupId;
    if (groupId === '') groupId = null;
    if (groupId != null) {
      const g = await sql`SELECT 1 FROM client_groups WHERE id = ${groupId} AND specialist_id = ${sp.id} LIMIT 1`;
      if (!g.rows.length) return res.status(403).json({ ok: false, error: 'Папка не найдена' });
    }
    await sql`UPDATE clients SET group_id = ${groupId} WHERE id = ${clientId}`;
    return res.status(200).json({ ok: true, data: { clientId, groupId: groupId || '' } });
  }

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT g.*, COUNT(c.id) AS client_count
      FROM client_groups g
      LEFT JOIN clients c ON c.group_id = g.id
      WHERE g.specialist_id = ${sp.id}
      GROUP BY g.id
      ORDER BY g.group_date DESC NULLS LAST, g.created_at DESC`;
    return res.status(200).json({ ok: true, data: rows.rows.map(groupToCanonical) });
  }

  if (req.method === 'DELETE') {
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM client_groups WHERE id = ${id} AND specialist_id = ${sp.id}`;
    return res.status(200).json({ ok: true });
  }

  // POST / PUT — создать или изменить папку.
  const b = readJson(req);
  const title = String(b.title || '').trim();
  const programId = PROGRAMS.includes(b.programId) ? b.programId : null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.date || '')) ? b.date : null;

  if (req.method === 'POST') {
    const id = 'g' + Date.now();
    const ins = await sql`
      INSERT INTO client_groups (id, specialist_id, title, program_id, group_date)
      VALUES (${id}, ${sp.id}, ${title}, ${programId}, ${date})
      RETURNING *, 0 AS client_count`;
    return res.status(200).json({ ok: true, data: groupToCanonical(ins.rows[0]) });
  }

  if (req.method === 'PUT') {
    if (!b.id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    const upd = await sql`
      UPDATE client_groups SET title = ${title}, program_id = ${programId}, group_date = ${date}
      WHERE id = ${b.id} AND specialist_id = ${sp.id}
      RETURNING *, (SELECT COUNT(*) FROM clients WHERE group_id = ${b.id}) AS client_count`;
    if (!upd.rows.length) return res.status(404).json({ ok: false, error: 'Папка не найдена' });
    return res.status(200).json({ ok: true, data: groupToCanonical(upd.rows[0]) });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}

// Кто обращается к ленте и к каким клиентам у него доступ.
// Возвращает { actor:{role,id,name}, can(clientId)->Promise<bool> } либо null (401).
async function resolveActor(req, sql) {
  if (isAdmin(req)) return { actor: { role: 'admin', id: 'admin', name: 'Администратор' }, can: async () => true };
  const sp = await getSpecialist(req);
  if (sp) return {
    actor: { role: 'specialist', id: sp.id, name: sp.name },
    can: async (clientId) => (await sql`SELECT 1 FROM clients WHERE id = ${clientId} AND specialist_id = ${sp.id} LIMIT 1`).rows.length > 0,
  };
  const cl = await getClient(req);
  if (cl) return { actor: { role: 'client', id: cl.id, name: cl.name }, can: async (clientId) => clientId === cl.id };
  return null;
}

// Лента кабинета клиента (client_activities). Доступ: админ / специалист клиента / сам клиент.
async function handleActivities(req, res, sql) {
  if (!sql) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, data: [] });
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }
  const who = await resolveActor(req, sql);
  if (!who) return res.status(401).json({ ok: false, error: 'Нужна авторизация' });

  if (req.method === 'GET') {
    const clientId = req.query && req.query.clientId;
    if (!clientId) return res.status(400).json({ ok: false, error: 'Нужен clientId' });
    if (!(await who.can(clientId))) return res.status(403).json({ ok: false, error: 'Нет доступа к этому клиенту' });
    const rows = await sql`SELECT * FROM client_activities WHERE client_id = ${clientId} ORDER BY created_at ASC`;
    return res.status(200).json({ ok: true, data: rows.rows.map(actToCanonical) });
  }

  if (req.method === 'DELETE') {
    if (who.actor.role !== 'admin') return res.status(403).json({ ok: false, error: 'Удалять записи может только администратор' });
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM client_activities WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  // POST
  const b = readJson(req);
  const clientId = b.clientId;
  if (!clientId) return res.status(422).json({ ok: false, errors: { clientId: 'Нужен clientId' } });
  if (!(await who.can(clientId))) return res.status(403).json({ ok: false, error: 'Нет доступа к этому клиенту' });
  const type = ACT_TYPES.includes(b.type) ? b.type : 'note';
  const text = String(b.text || '').trim();
  if (!text) return res.status(422).json({ ok: false, errors: { text: 'Пустая запись' } });
  const ins = await sql`
    INSERT INTO client_activities (client_id, author_id, author_name, author_role, type, text)
    VALUES (${clientId}, ${who.actor.id}, ${who.actor.name}, ${who.actor.role}, ${type}, ${text})
    RETURNING *`;
  return res.status(200).json({ ok: true, data: actToCanonical(ins.rows[0]) });
}

// График снижения веса (client_weights + clients.program_start/start_weight).
// Старт программы (дата + стартовый вес) и ежедневные замеры задаёт сам клиент;
// специалист этого клиента и админ видят график только на чтение.
//   GET    ?resource=weights&clientId=…              → { setup:{startDate,startWeight}|null, entries:[{date,weight}] }
//   POST   ?resource=weights&action=setup  { clientId?, startDate, startWeight } → задать старт (+ замер дня 0)
//   POST   ?resource=weights               { clientId?, date, weight }          → записать вес за день (upsert)
//   DELETE ?resource=weights&clientId=…&date=…       → удалить замер
//   Запись: только сам клиент (свой clientId) ИЛИ админ. Чтение: + специалист клиента.
async function handleWeights(req, res, sql) {
  if (!sql) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, data: { setup: null, entries: [] } });
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }
  const who = await resolveActor(req, sql);
  if (!who) return res.status(401).json({ ok: false, error: 'Нужна авторизация' });

  // К какому клиенту обращаемся: явный clientId, иначе — сам клиент.
  const selfId = who.actor.role === 'client' ? who.actor.id : null;
  const clientId = (req.query && req.query.clientId) || selfId;
  if (!clientId) return res.status(400).json({ ok: false, error: 'Нужен clientId' });

  const canWrite = who.actor.role === 'admin' || (who.actor.role === 'client' && who.actor.id === clientId);

  // валидаторы
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));
  const parseW = (w) => { const n = Number(w); return Number.isFinite(n) && n >= 20 && n <= 400 ? Math.round(n * 10) / 10 : null; };

  if (req.method === 'GET') {
    if (!(await who.can(clientId))) return res.status(403).json({ ok: false, error: 'Нет доступа к этому клиенту' });
    const c = await sql`SELECT program_start, start_weight FROM clients WHERE id = ${clientId} LIMIT 1`;
    if (!c.rows.length) return res.status(404).json({ ok: false, error: 'Клиент не найден' });
    const row = c.rows[0];
    const setup = (row.program_start && row.start_weight != null)
      ? { startDate: String(row.program_start).slice(0, 10), startWeight: Number(row.start_weight) }
      : null;
    const e = await sql`SELECT entry_date, weight FROM client_weights WHERE client_id = ${clientId} ORDER BY entry_date ASC`;
    const entries = e.rows.map(r => ({ date: String(r.entry_date).slice(0, 10), weight: Number(r.weight) }));
    return res.status(200).json({ ok: true, data: { setup, entries } });
  }

  if (req.method === 'DELETE') {
    if (!canWrite) return res.status(403).json({ ok: false, error: 'Замеры может менять только сам клиент' });
    const date = req.query && req.query.date;
    if (!isDate(date)) return res.status(400).json({ ok: false, error: 'Нужна дата замера (YYYY-MM-DD)' });
    await sql`DELETE FROM client_weights WHERE client_id = ${clientId} AND entry_date = ${date}`;
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'POST') {
    if (!canWrite) return res.status(403).json({ ok: false, error: 'Заполнять график может только сам клиент' });
    const b = readJson(req);
    const action = req.query && req.query.action;

    // Старт программы: дата начала + стартовый вес. Day 0 заодно пишем как первый замер.
    if (action === 'setup') {
      if (!isDate(b.startDate)) return res.status(422).json({ ok: false, errors: { startDate: 'Укажите дату начала' } });
      const sw = parseW(b.startWeight);
      if (sw == null) return res.status(422).json({ ok: false, errors: { startWeight: 'Вес от 20 до 400 кг' } });
      await sql`UPDATE clients SET program_start = ${b.startDate}, start_weight = ${sw} WHERE id = ${clientId}`;
      await sql`
        INSERT INTO client_weights (client_id, entry_date, weight)
        VALUES (${clientId}, ${b.startDate}, ${sw})
        ON CONFLICT (client_id, entry_date) DO UPDATE SET weight = EXCLUDED.weight`;
      return res.status(200).json({ ok: true, data: { setup: { startDate: b.startDate, startWeight: sw } } });
    }

    // Ежедневный замер (upsert по дате).
    if (!isDate(b.date)) return res.status(422).json({ ok: false, errors: { date: 'Укажите дату' } });
    const w = parseW(b.weight);
    if (w == null) return res.status(422).json({ ok: false, errors: { weight: 'Вес от 20 до 400 кг' } });
    const ins = await sql`
      INSERT INTO client_weights (client_id, entry_date, weight)
      VALUES (${clientId}, ${b.date}, ${w})
      ON CONFLICT (client_id, entry_date) DO UPDATE SET weight = EXCLUDED.weight
      RETURNING entry_date, weight`;
    return res.status(200).json({ ok: true, data: { date: String(ins.rows[0].entry_date).slice(0, 10), weight: Number(ins.rows[0].weight) } });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}

// Дневник питания (client_diary) — таблица-привычки под графиком. Поля фиксированы.
// Заполняет сам клиент, специалист/админ смотрят. Доступ — как у графика веса.
//   GET    ?resource=diary&clientId=…                       → { entries:[{date,field,value}] }
//   POST   ?resource=diary { clientId?, date, field, value } → отметить клетку (пустое value = снять)
const DIARY_FIELDS = ['log_before', 'food_stock', 'oil', 'vitamins', 'ca_zn', 'spoons'];

async function handleDiary(req, res, sql) {
  if (!sql) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, data: { entries: [] } });
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }
  const who = await resolveActor(req, sql);
  if (!who) return res.status(401).json({ ok: false, error: 'Нужна авторизация' });

  const selfId = who.actor.role === 'client' ? who.actor.id : null;
  const clientId = (req.query && req.query.clientId) || selfId;
  if (!clientId) return res.status(400).json({ ok: false, error: 'Нужен clientId' });
  const canWrite = who.actor.role === 'admin' || (who.actor.role === 'client' && who.actor.id === clientId);

  if (req.method === 'GET') {
    if (!(await who.can(clientId))) return res.status(403).json({ ok: false, error: 'Нет доступа к этому клиенту' });
    const e = await sql`SELECT entry_date, field, value FROM client_diary WHERE client_id = ${clientId} ORDER BY entry_date ASC`;
    const entries = e.rows.map(r => ({ date: String(r.entry_date).slice(0, 10), field: r.field, value: r.value }));
    return res.status(200).json({ ok: true, data: { entries } });
  }

  if (req.method === 'POST') {
    if (!canWrite) return res.status(403).json({ ok: false, error: 'Заполнять дневник может только сам клиент' });
    const b = readJson(req);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.date || ''))) return res.status(422).json({ ok: false, errors: { date: 'Укажите дату' } });
    if (!DIARY_FIELDS.includes(b.field)) return res.status(422).json({ ok: false, errors: { field: 'Неизвестное поле' } });
    const value = String(b.value == null ? '' : b.value).trim().slice(0, 16);
    if (!value) {
      await sql`DELETE FROM client_diary WHERE client_id = ${clientId} AND entry_date = ${b.date} AND field = ${b.field}`;
      return res.status(200).json({ ok: true, data: { date: b.date, field: b.field, value: '' } });
    }
    await sql`
      INSERT INTO client_diary (client_id, entry_date, field, value, updated_at)
      VALUES (${clientId}, ${b.date}, ${b.field}, ${value}, now())
      ON CONFLICT (client_id, entry_date, field) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
    return res.status(200).json({ ok: true, data: { date: b.date, field: b.field, value } });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}

// Замеры тела (client_measures) — объёмы в см в двух точках: 'start' и 'd4'.
// Заполняет клиент, специалист/админ смотрят. По разнице фронт строит отчёт.
//   GET    ?resource=measures&clientId=…                       → { entries:[{phase,field,value}] }
//   POST   ?resource=measures { clientId?, phase, field, value } → записать (пустое value = снять)
const MEASURE_FIELDS = ['waist', 'chest', 'chest_over', 'chest_under', 'hips', 'galife', 'neck', 'arm', 'wrist'];
const MEASURE_PHASES = ['start', 'd4'];

async function handleMeasures(req, res, sql) {
  if (!sql) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, data: { entries: [] } });
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }
  const who = await resolveActor(req, sql);
  if (!who) return res.status(401).json({ ok: false, error: 'Нужна авторизация' });

  const selfId = who.actor.role === 'client' ? who.actor.id : null;
  const clientId = (req.query && req.query.clientId) || selfId;
  if (!clientId) return res.status(400).json({ ok: false, error: 'Нужен clientId' });
  const canWrite = who.actor.role === 'admin' || (who.actor.role === 'client' && who.actor.id === clientId);

  if (req.method === 'GET') {
    if (!(await who.can(clientId))) return res.status(403).json({ ok: false, error: 'Нет доступа к этому клиенту' });
    const e = await sql`SELECT phase, field, value FROM client_measures WHERE client_id = ${clientId}`;
    const entries = e.rows.map(r => ({ phase: r.phase, field: r.field, value: Number(r.value) }));
    return res.status(200).json({ ok: true, data: { entries } });
  }

  if (req.method === 'POST') {
    if (!canWrite) return res.status(403).json({ ok: false, error: 'Заполнять замеры может только сам клиент' });
    const b = readJson(req);
    if (!MEASURE_PHASES.includes(b.phase)) return res.status(422).json({ ok: false, errors: { phase: 'Неизвестный этап' } });
    if (!MEASURE_FIELDS.includes(b.field)) return res.status(422).json({ ok: false, errors: { field: 'Неизвестный замер' } });
    const raw = String(b.value == null ? '' : b.value).trim();
    if (!raw) {
      await sql`DELETE FROM client_measures WHERE client_id = ${clientId} AND phase = ${b.phase} AND field = ${b.field}`;
      return res.status(200).json({ ok: true, data: { phase: b.phase, field: b.field, value: null } });
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 5 || n > 300) return res.status(422).json({ ok: false, errors: { value: 'Обхват от 5 до 300 см' } });
    const v = Math.round(n * 10) / 10;
    await sql`
      INSERT INTO client_measures (client_id, phase, field, value, updated_at)
      VALUES (${clientId}, ${b.phase}, ${b.field}, ${v}, now())
      ON CONFLICT (client_id, phase, field) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
    return res.status(200).json({ ok: true, data: { phase: b.phase, field: b.field, value: v } });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  const sql = await getSql();
  const action = req.query && req.query.action;

  // Лента кабинета клиента — отдельная ветка (см. handleActivities выше).
  if (req.query && req.query.resource === 'activities') return handleActivities(req, res, sql);

  // График снижения веса — отдельная ветка (см. handleWeights выше).
  if (req.query && req.query.resource === 'weights') return handleWeights(req, res, sql);

  // Дневник питания — отдельная ветка (см. handleDiary выше).
  if (req.query && req.query.resource === 'diary') return handleDiary(req, res, sql);

  // Замеры тела — отдельная ветка (см. handleMeasures выше).
  if (req.query && req.query.resource === 'measures') return handleMeasures(req, res, sql);

  // Папки/группы клиентов специалиста — отдельная ветка (см. handleGroups выше).
  if (req.query && req.query.resource === 'groups') return handleGroups(req, res, sql);

  // ── Вход клиента по личному коду ──────────────────────────
  if (action === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    if (!sql) return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
    const b = readJson(req);
    const code = String(b.code || '').trim();
    if (!code) return res.status(422).json({ ok: false, errors: { code: 'Введите код входа' } });
    const rows = await sql`
      SELECT id, name FROM clients
      WHERE code_hash = ${hashCode(code)} AND active = true
      LIMIT 1`;
    if (!rows.rows.length) return res.status(401).json({ ok: false, error: 'Неверный код или доступ закрыт' });
    return res.status(200).json({ ok: true, data: rows.rows[0] });
  }

  // ── Кто я (по токену клиента) — данные + прикреплённый специалист ──
  if (action === 'me') {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    const me = await getClient(req);
    if (!me) return res.status(401).json({ ok: false, error: 'Нужна авторизация клиента' });
    let specialist = null;
    if (me.specialist_id) {
      const s = await sql`SELECT id, name, role_label, photo, tone FROM team_members WHERE id = ${me.specialist_id} LIMIT 1`;
      if (s.rows.length) specialist = {
        id: s.rows[0].id, name: s.rows[0].name, roleLabel: s.rows[0].role_label || '',
        photo: s.rows[0].photo || '', tone: s.rows[0].tone || 'lilac',
      };
    }
    return res.status(200).json({
      ok: true,
      data: {
        id: me.id, name: me.name, phone: me.phone || '', email: me.email || '',
        city: me.city || '', programId: me.program_id || '', specialist,
      },
    });
  }

  // ── Список ────────────────────────────────────────────────
  // Доступ: админ (все, фильтр ?specialist) ИЛИ специалист (только свои прикреплённые).
  if (req.method === 'GET') {
    if (isAdmin(req)) {
      if (!sql) return emptyList(res);
      const specFilter = (req.query && req.query.specialist) || null;
      const rows = await sql`
        SELECT c.*, t.name AS specialist_name
        FROM clients c
        LEFT JOIN team_members t ON t.id = c.specialist_id
        WHERE (${specFilter}::text IS NULL OR c.specialist_id = ${specFilter})
        ORDER BY c.created_at DESC`;
      return res.status(200).json({ ok: true, data: rows.rows.map(toCanonical) });
    }
    const sp = await getSpecialist(req);
    if (sp) {
      if (!sql) return emptyList(res);
      const rows = await sql`
        SELECT c.*, t.name AS specialist_name
        FROM clients c
        LEFT JOIN team_members t ON t.id = c.specialist_id
        WHERE c.specialist_id = ${sp.id}
        ORDER BY c.created_at DESC`;
      return res.status(200).json({ ok: true, data: rows.rows.map(toCanonical) });
    }
    return res.status(401).json({ ok: false, error: 'Нужна авторизация сотрудника' });
  }

  // ── Запись — только админ ─────────────────────────────────
  if (!requireAdmin(req, res)) return;
  if (!sql) return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });

  if (req.method === 'DELETE') {
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM clients WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  const b = readJson(req);
  const v = {
    name: String(b.name || '').trim(),
    phone: b.phone || '',
    email: b.email || '',
    city: b.city || '',
    note: b.note || '',
    programId: PROGRAMS.includes(b.programId) ? b.programId : null,
    dealId: b.dealId == null || b.dealId === '' ? null : Number(b.dealId),
    requestId: b.requestId == null || b.requestId === '' ? null : Number(b.requestId),
    specialistId: b.specialistId || null,
    active: b.active !== false,
  };
  if (!v.name) return res.status(422).json({ ok: false, errors: { name: 'Укажите имя клиента' } });

  // подтянуть имя специалиста для ответа
  const withSpecName = async (row) => {
    if (row.specialist_id) {
      const s = await sql`SELECT name FROM team_members WHERE id = ${row.specialist_id} LIMIT 1`;
      row.specialist_name = s.rows[0] && s.rows[0].name;
    }
    return toCanonical(row);
  };

  if (req.method === 'POST') {
    const id = b.id || genId();
    const codeHash = b.code ? hashCode(String(b.code).trim()) : null;
    const ins = await sql`
      INSERT INTO clients
        (id, name, phone, email, city, note, program_id, deal_id, request_id, specialist_id, code_hash, active)
      VALUES
        (${id}, ${v.name}, ${v.phone}, ${v.email}, ${v.city}, ${v.note}, ${v.programId},
         ${v.dealId}, ${v.requestId}, ${v.specialistId}, ${codeHash}, ${v.active})
      RETURNING *`;
    return res.status(200).json({ ok: true, data: await withSpecName(ins.rows[0]) });
  }

  if (req.method === 'PUT') {
    if (!b.id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    // code: undefined/'' → не трогаем; строка → задать/сменить; null → закрыть вход.
    let codeHash; // undefined = не менять
    if (b.code === null) codeHash = null;
    else if (typeof b.code === 'string' && b.code.trim()) codeHash = hashCode(b.code.trim());

    const upd = codeHash === undefined
      ? await sql`
          UPDATE clients SET
            name = ${v.name}, phone = ${v.phone}, email = ${v.email}, city = ${v.city}, note = ${v.note},
            program_id = ${v.programId}, deal_id = ${v.dealId}, request_id = ${v.requestId},
            specialist_id = ${v.specialistId}, active = ${v.active}
          WHERE id = ${b.id} RETURNING *`
      : await sql`
          UPDATE clients SET
            name = ${v.name}, phone = ${v.phone}, email = ${v.email}, city = ${v.city}, note = ${v.note},
            program_id = ${v.programId}, deal_id = ${v.dealId}, request_id = ${v.requestId},
            specialist_id = ${v.specialistId}, active = ${v.active}, code_hash = ${codeHash}
          WHERE id = ${b.id} RETURNING *`;
    if (!upd.rows.length) return res.status(404).json({ ok: false, error: 'Клиент не найден' });
    return res.status(200).json({ ok: true, data: await withSpecName(upd.rows[0]) });
  }
}
