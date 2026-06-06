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
    peerSpecialistId: r.peer_specialist_id || '',   // '' = основная лента куратора (NULL в БД)
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

// Доступ к конкретному ТРЕДУ (client_id + peer_specialist_id):
//   peerId === null → основная лента куратора (куратор клиента / клиент / админ)
//   peerId !== null → диалог поддержки клиента с этим специалистом (он / клиент / админ)
// Куратор НЕ имеет доступа к чужим диалогам поддержки; админ видит всё.
async function canAccessThread(who, sql, clientId, peerId) {
  if (who.actor.role === 'admin') return true;
  if (who.actor.role === 'client') return who.actor.id === clientId;
  if (who.actor.role === 'specialist') {
    if (peerId === null) {
      const r = await sql`SELECT 1 FROM clients WHERE id = ${clientId} AND specialist_id = ${who.actor.id} LIMIT 1`;
      return r.rows.length > 0;
    }
    return peerId === who.actor.id;
  }
  return false;
}

// Может ли клиент завести/писать в тред с этим специалистом: либо это его куратор,
// либо специалист дежурит по поддержке (support_available) и имеет код входа.
async function clientMayMessage(sql, clientId, peerId) {
  const r = await sql`
    SELECT 1 FROM team_members t
    WHERE t.id = ${peerId}
      AND (
        t.id = (SELECT specialist_id FROM clients WHERE id = ${clientId})
        OR (t.support_available = true AND t.code_hash IS NOT NULL)
      )
    LIMIT 1`;
  return r.rows.length > 0;
}

// Лента/диалоги вокруг клиента (client_activities). Тред задаётся параметром
// peerSpecialistId (пусто → основная лента куратора). При чтении сообщения
// другой стороны помечаются прочитанными для текущего участника.
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
    const peerId = (req.query && req.query.peerSpecialistId) ? String(req.query.peerSpecialistId) : null;
    if (!(await canAccessThread(who, sql, clientId, peerId))) return res.status(403).json({ ok: false, error: 'Нет доступа к этому диалогу' });
    const rows = await sql`
      SELECT * FROM client_activities
      WHERE client_id = ${clientId} AND peer_specialist_id IS NOT DISTINCT FROM ${peerId}
      ORDER BY created_at ASC`;
    // Отметить прочитанным то, что написал не текущий участник.
    if (who.actor.role === 'client') {
      await sql`
        UPDATE client_activities SET read_by_client = true
        WHERE client_id = ${clientId} AND peer_specialist_id IS NOT DISTINCT FROM ${peerId}
          AND author_role <> 'client' AND read_by_client = false`;
    } else if (who.actor.role === 'specialist') {
      await sql`
        UPDATE client_activities SET read_by_specialist = true
        WHERE client_id = ${clientId} AND peer_specialist_id IS NOT DISTINCT FROM ${peerId}
          AND author_role <> 'specialist' AND read_by_specialist = false`;
    }
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
  const peerId = b.peerSpecialistId ? String(b.peerSpecialistId) : null;
  if (!(await canAccessThread(who, sql, clientId, peerId))) return res.status(403).json({ ok: false, error: 'Нет доступа к этому диалогу' });
  // Клиент может писать только куратору или дежурному специалисту (не любому из команды).
  if (who.actor.role === 'client' && peerId !== null && !(await clientMayMessage(sql, clientId, peerId))) {
    return res.status(403).json({ ok: false, error: 'Этому специалисту нельзя написать' });
  }
  const type = ACT_TYPES.includes(b.type) ? b.type : 'note';
  const text = String(b.text || '').trim();
  if (!text) return res.status(422).json({ ok: false, errors: { text: 'Пустая запись' } });
  // Автор своё сообщение уже «прочитал» — чтобы оно не считалось ему непрочитанным.
  const readByClient = who.actor.role === 'client';
  const readBySpecialist = who.actor.role === 'specialist';
  const ins = await sql`
    INSERT INTO client_activities (client_id, author_id, author_name, author_role, type, text, peer_specialist_id, read_by_client, read_by_specialist)
    VALUES (${clientId}, ${who.actor.id}, ${who.actor.name}, ${who.actor.role}, ${type}, ${text}, ${peerId}, ${readByClient}, ${readBySpecialist})
    RETURNING *`;
  return res.status(200).json({ ok: true, data: actToCanonical(ins.rows[0]) });
}

// Список собеседников клиента для раздела «Поддержка» (роль client).
// Куратор (peerSpecialistId: '' = основная лента) + дежурные специалисты
// (support_available + код входа). По каждому — счётчик непрочитанных клиентом.
//
// Админский режим (x-admin-token + ?clientId): для контроля переписки в разделе
// «Клиенты». Отдаёт реально велущиеся диалоги клиента — куратор (если есть) + каждый
// специалист, с кем была переписка, со счётчиком сообщений и временем последнего.
async function handleRoster(req, res, sql) {
  if (!sql) return res.status(200).json({ ok: true, data: [] });
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  if (isAdmin(req)) {
    const clientId = req.query && req.query.clientId;
    if (!clientId) return res.status(400).json({ ok: false, error: 'Нужен clientId' });
    const c = await sql`SELECT specialist_id FROM clients WHERE id = ${clientId} LIMIT 1`;
    if (!c.rows.length) return res.status(404).json({ ok: false, error: 'Клиент не найден' });
    const curatorId = c.rows[0].specialist_id || null;
    const counts = await sql`
      SELECT peer_specialist_id, COUNT(*) AS cnt, MAX(created_at) AS last_at
      FROM client_activities WHERE client_id = ${clientId}
      GROUP BY peer_specialist_id`;
    // Имена нужны для куратора и для всех peer'ов, с кем была переписка.
    const ids = [];
    if (curatorId) ids.push(curatorId);
    counts.rows.forEach(r => { if (r.peer_specialist_id && !ids.includes(r.peer_specialist_id)) ids.push(r.peer_specialist_id); });
    const names = {};
    if (ids.length) {
      const nm = await sql`SELECT id, name, role_label, photo FROM team_members WHERE id = ANY(${ids})`;
      nm.rows.forEach(r => { names[r.id] = r; });
    }
    const byPeer = {};
    counts.rows.forEach(r => { byPeer[r.peer_specialist_id || ''] = { cnt: Number(r.cnt) || 0, lastAt: r.last_at }; });

    const out = [];
    if (curatorId) {
      const m = byPeer[''] || {};
      const t = names[curatorId] || {};
      out.push({ specialistId: '', name: t.name || 'Куратор', roleLabel: t.role_label || '',
        photo: t.photo || '', isCurator: true, count: m.cnt || 0, lastAt: m.lastAt || null });
    }
    counts.rows.forEach(r => {
      const peer = r.peer_specialist_id;
      if (!peer) return;                       // основная лента уже учтена куратором
      const t = names[peer] || {};
      out.push({ specialistId: peer, name: t.name || 'Специалист', roleLabel: t.role_label || '',
        photo: t.photo || '', isCurator: false, count: Number(r.cnt) || 0, lastAt: r.last_at });
    });
    out.sort((a, b) => (b.lastAt ? new Date(b.lastAt) : 0) - (a.lastAt ? new Date(a.lastAt) : 0));
    return res.status(200).json({ ok: true, data: out });
  }

  const cl = await getClient(req);
  if (!cl) return res.status(401).json({ ok: false, error: 'Нужна авторизация клиента' });

  // Непрочитанные клиентом по тредам (peer NULL = куратор).
  const counts = await sql`
    SELECT peer_specialist_id,
           COUNT(*) FILTER (WHERE author_role <> 'client' AND read_by_client = false) AS unread,
           MAX(created_at) AS last_at
    FROM client_activities WHERE client_id = ${cl.id}
    GROUP BY peer_specialist_id`;
  const byPeer = {};
  counts.rows.forEach(r => { byPeer[r.peer_specialist_id || ''] = { unread: Number(r.unread) || 0, lastAt: r.last_at }; });

  const out = [];
  // Куратор — всегда первым (основная лента, peerSpecialistId: '').
  if (cl.specialist_id) {
    const s = await sql`SELECT id, name, role_label, photo FROM team_members WHERE id = ${cl.specialist_id} LIMIT 1`;
    if (s.rows.length) {
      const m = byPeer[''] || {};
      out.push({ specialistId: '', name: s.rows[0].name, roleLabel: s.rows[0].role_label || '',
        photo: s.rows[0].photo || '', isCurator: true, unread: m.unread || 0, lastAt: m.lastAt || null });
    }
  }
  // Дежурные специалисты (кроме куратора).
  const duty = await sql`
    SELECT id, name, role_label, photo FROM team_members
    WHERE support_available = true AND code_hash IS NOT NULL
      AND id IS DISTINCT FROM ${cl.specialist_id || null}
    ORDER BY sort_order, name`;
  duty.rows.forEach(r => {
    const m = byPeer[r.id] || {};
    out.push({ specialistId: r.id, name: r.name, roleLabel: r.role_label || '',
      photo: r.photo || '', isCurator: false, unread: m.unread || 0, lastAt: m.lastAt || null });
  });

  return res.status(200).json({ ok: true, data: out });
}

// Входящие обращения поддержки к специалисту (роль specialist).
// Клиенты, написавшие ему в тред поддержки (peer = его id), с непрочитанными и
// последним сообщением. Эти клиенты НЕ обязаны быть к нему прикреплены.
async function handleInbox(req, res, sql) {
  if (!sql) return res.status(200).json({ ok: true, data: [] });
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const sp = await getSpecialist(req);
  if (!sp) return res.status(401).json({ ok: false, error: 'Нужна авторизация специалиста' });

  const rows = await sql`
    SELECT a.client_id, c.name AS client_name, c.program_id,
           COUNT(*) FILTER (WHERE a.author_role = 'client' AND a.read_by_specialist = false) AS unread,
           MAX(a.created_at) AS last_at,
           (SELECT text FROM client_activities x
            WHERE x.client_id = a.client_id AND x.peer_specialist_id = ${sp.id}
            ORDER BY created_at DESC LIMIT 1) AS last_text
    FROM client_activities a
    JOIN clients c ON c.id = a.client_id
    WHERE a.peer_specialist_id = ${sp.id}
    GROUP BY a.client_id, c.name, c.program_id
    ORDER BY last_at DESC`;
  return res.status(200).json({
    ok: true,
    data: rows.rows.map(r => ({
      clientId: r.client_id, clientName: r.client_name || '', programId: r.program_id || '',
      unread: Number(r.unread) || 0, lastAt: r.last_at, lastText: r.last_text || '',
    })),
  });
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

// Анкета обратной связи (client_surveys) — одна актуальная анкета на клиента.
// Вопросы/варианты — копия n8n-формы om-time-anketa (фронт: SurveyConfig.jsx).
// Здесь храним и валидируем только КЛЮЧИ вопросов и типы значений; точные
// варианты ответов задаёт форма. Заполняет сам клиент, админ сводит в Аналитике.
//   GET    ?resource=survey                       → анкета текущего клиента (self) или ?clientId (админ/специалист)
//   GET    ?resource=survey&action=all            → все анкеты (только админ; с именем клиента) для сводки
//   POST   ?resource=survey  { answers:{…} }       → сохранить/перезаписать свою анкету (UPSERT)
//   Запись: только сам клиент (свой clientId) ИЛИ админ. Чтение одной анкеты: + специалист клиента.
const SURVEY_FIELDS = ['source', 'times', 'kg_lost', 'admin', 'trainer', 'trainer_rating', 'psy_chat', 'club', 'intensive', 'recommend', 'suggestions'];

// Привести присланные ответы к безопасному виду: только известные ключи,
// числовое поле — число 0…300, текстовое — обрезка до 2000, остальное — до 200.
function sanitizeSurvey(src) {
  const a = {};
  if (!src || typeof src !== 'object') return a;
  for (const k of SURVEY_FIELDS) {
    if (src[k] == null) continue;
    if (k === 'kg_lost') {
      const n = Number(src[k]);
      if (Number.isFinite(n) && n >= 0 && n <= 300) a[k] = Math.round(n * 10) / 10;
    } else if (k === 'suggestions') {
      const t = String(src[k]).trim().slice(0, 2000);
      if (t) a[k] = t;
    } else {
      const t = String(src[k]).trim().slice(0, 200);
      if (t) a[k] = t;
    }
  }
  return a;
}

async function handleSurvey(req, res, sql) {
  if (!sql) {
    if (req.method === 'GET') {
      const all = req.query && req.query.action === 'all';
      return res.status(200).json({ ok: true, data: all ? [] : null });
    }
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }
  const who = await resolveActor(req, sql);
  if (!who) return res.status(401).json({ ok: false, error: 'Нужна авторизация' });

  // Все анкеты с именами клиентов — только админ, для сводной аналитики.
  if (req.query && req.query.action === 'all') {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    if (who.actor.role !== 'admin') return res.status(403).json({ ok: false, error: 'Доступно только администратору' });
    const rows = await sql`
      SELECT s.client_id, s.answers, s.submitted_at, c.name AS client_name, c.program_id
      FROM client_surveys s
      JOIN clients c ON c.id = s.client_id
      ORDER BY s.submitted_at DESC`;
    return res.status(200).json({
      ok: true,
      data: rows.rows.map(r => ({
        clientId: r.client_id, clientName: r.client_name, programId: r.program_id || '',
        answers: r.answers || {}, submittedAt: r.submitted_at,
      })),
    });
  }

  const selfId = who.actor.role === 'client' ? who.actor.id : null;
  const clientId = (req.query && req.query.clientId) || selfId;
  if (!clientId) return res.status(400).json({ ok: false, error: 'Нужен clientId' });
  const canWrite = who.actor.role === 'admin' || (who.actor.role === 'client' && who.actor.id === clientId);

  if (req.method === 'GET') {
    if (!(await who.can(clientId))) return res.status(403).json({ ok: false, error: 'Нет доступа к этому клиенту' });
    const r = await sql`SELECT answers, submitted_at FROM client_surveys WHERE client_id = ${clientId} LIMIT 1`;
    if (!r.rows.length) return res.status(200).json({ ok: true, data: null });
    return res.status(200).json({ ok: true, data: { answers: r.rows[0].answers || {}, submittedAt: r.rows[0].submitted_at } });
  }

  if (req.method === 'POST') {
    if (!canWrite) return res.status(403).json({ ok: false, error: 'Заполнять анкету может только сам клиент' });
    const b = readJson(req);
    const answers = sanitizeSurvey(b.answers);
    await sql`
      INSERT INTO client_surveys (client_id, answers, submitted_at)
      VALUES (${clientId}, ${JSON.stringify(answers)}::jsonb, now())
      ON CONFLICT (client_id) DO UPDATE SET answers = EXCLUDED.answers, submitted_at = now()`;
    return res.status(200).json({ ok: true, data: { answers, submittedAt: new Date().toISOString() } });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  const sql = await getSql();
  const action = req.query && req.query.action;

  // Анкета обратной связи — отдельная ветка (см. handleSurvey выше).
  if (req.query && req.query.resource === 'survey') return handleSurvey(req, res, sql);

  // Лента/диалоги кабинета клиента — отдельная ветка (см. handleActivities выше).
  if (req.query && req.query.resource === 'activities') return handleActivities(req, res, sql);

  // Список собеседников клиента для «Поддержки» — отдельная ветка (см. handleRoster выше).
  if (req.query && req.query.resource === 'roster') return handleRoster(req, res, sql);

  // Входящие обращения поддержки к специалисту — отдельная ветка (см. handleInbox выше).
  if (req.query && req.query.resource === 'inbox') return handleInbox(req, res, sql);

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
