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
// Код входа в БД не хранится — только SHA-256 (code_hash). Наружу код не отдаём.
import { handlePreflight, readJson, requireAdmin, getSql, emptyList, hashCode, isAdmin, getSpecialist, getClient } from './_lib.js';

const PROGRAMS = ['flagship-offline', 'flagship-online', 'club', 'teen', 'detox', 'consult'];

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
    hasCode: !!r.code_hash,                     // задан ли код входа (сам код не отдаём)
    active: r.active !== false,
    createdAt: r.created_at,
  };
}

const genId = () => 'c' + Date.now();

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  const sql = await getSql();
  const action = req.query && req.query.action;

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
      const s = await sql`SELECT id, name, role_label FROM team_members WHERE id = ${me.specialist_id} LIMIT 1`;
      if (s.rows.length) specialist = { id: s.rows[0].id, name: s.rows[0].name, roleLabel: s.rows[0].role_label || '' };
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
