// api/sellers.js — продажники отдела продаж. См. api/team.js — тот же контракт CRUD.
//
// CRUD (только админ):
//   GET    /api/sellers              → список продажников (без кодов входа)
//   POST   /api/sellers              → завести продажника (поле code → задать код входа)
//   PUT    /api/sellers              → обновить (code: '' не трогает, code: 'X' меняет, code: null закрывает вход)
//   DELETE /api/sellers?id=…          → удалить
//
// Без админ-токена (для самих продажников):
//   POST /api/sellers?action=login   → { code } → { id, name } активного продажника или 401
//   GET  /api/sellers?action=me      → по заголовку x-seller-token → { id, name } или 401
//
// Код входа в БД не хранится — только SHA-256 (code_hash). Наружу код не отдаём.
import { handlePreflight, readJson, requireAdmin, getSql, emptyList, hashCode, getSeller } from './_lib.js';

function toCanonical(r) {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone || '',
    active: r.active !== false,
    hasCode: !!r.code_hash,            // задан ли код входа (сам код не отдаём)
    monthlyGoal: r.monthly_goal || 0,  // план продаж на месяц, ₸
    sortOrder: r.sort_order || 0,
    createdAt: r.created_at,
  };
}

const genId = () => 's' + Date.now();

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  const sql = await getSql();
  const action = req.query && req.query.action;

  // ── Вход продажника по личному коду ───────────────────────
  if (action === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    if (!sql) return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
    const b = readJson(req);
    const code = String(b.code || '').trim();
    if (!code) return res.status(422).json({ ok: false, errors: { code: 'Введите код входа' } });
    const rows = await sql`
      SELECT id, name FROM sellers
      WHERE code_hash = ${hashCode(code)} AND active = true
      LIMIT 1`;
    if (!rows.rows.length) return res.status(401).json({ ok: false, error: 'Неверный код или доступ закрыт' });
    return res.status(200).json({ ok: true, data: rows.rows[0] });
  }

  // ── Кто я (по токену продажника) ──────────────────────────
  if (action === 'me') {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    const seller = await getSeller(req);
    if (!seller) return res.status(401).json({ ok: false, error: 'Нужна авторизация продажника' });
    return res.status(200).json({ ok: true, data: { id: seller.id, name: seller.name, monthlyGoal: seller.monthly_goal || 0 } });
  }

  // ── Список (только админ — это служебные данные) ──────────
  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) return;
    if (!sql) return emptyList(res);
    const rows = await sql`SELECT * FROM sellers ORDER BY sort_order, name`;
    return res.status(200).json({ ok: true, data: rows.rows.map(toCanonical) });
  }

  // ── Запись — только админ ─────────────────────────────────
  if (!requireAdmin(req, res)) return;
  if (!sql) return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });

  if (req.method === 'DELETE') {
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM sellers WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  const b = readJson(req);
  const v = {
    name: String(b.name || '').trim(),
    phone: b.phone || '',
    active: b.active !== false,
    monthlyGoal: b.monthlyGoal == null ? 0 : Math.max(0, Math.round(Number(b.monthlyGoal) || 0)),
    sortOrder: b.sortOrder == null ? 0 : Number(b.sortOrder),
  };
  if (!v.name) return res.status(422).json({ ok: false, errors: { name: 'Укажите имя' } });

  if (req.method === 'POST') {
    const id = b.id || genId();
    // code при создании опционален: пусто → продажник заведён, но вход закрыт.
    const codeHash = b.code ? hashCode(String(b.code).trim()) : null;
    const ins = await sql`
      INSERT INTO sellers (id, name, code_hash, phone, active, monthly_goal, sort_order)
      VALUES (${id}, ${v.name}, ${codeHash}, ${v.phone}, ${v.active}, ${v.monthlyGoal}, ${v.sortOrder})
      RETURNING *`;
    return res.status(200).json({ ok: true, data: toCanonical(ins.rows[0]) });
  }

  if (req.method === 'PUT') {
    if (!b.id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    // Логика поля code:
    //   undefined / '' → код не трогаем (оставляем как было)
    //   непустая строка → задаём/меняем код
    //   null            → закрываем вход (code_hash = NULL)
    let codeHash; // undefined = не менять
    if (b.code === null) codeHash = null;
    else if (typeof b.code === 'string' && b.code.trim()) codeHash = hashCode(b.code.trim());

    const upd = codeHash === undefined
      ? await sql`
          UPDATE sellers SET
            name = ${v.name}, phone = ${v.phone}, active = ${v.active},
            monthly_goal = ${v.monthlyGoal}, sort_order = ${v.sortOrder}
          WHERE id = ${b.id} RETURNING *`
      : await sql`
          UPDATE sellers SET
            name = ${v.name}, phone = ${v.phone}, active = ${v.active},
            monthly_goal = ${v.monthlyGoal}, sort_order = ${v.sortOrder},
            code_hash = ${codeHash}
          WHERE id = ${b.id} RETURNING *`;
    if (!upd.rows.length) return res.status(404).json({ ok: false, error: 'Продажник не найден' });
    return res.status(200).json({ ok: true, data: toCanonical(upd.rows[0]) });
  }
}
