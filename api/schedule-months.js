// api/schedule-months.js — пустые месяцы расписания (без событий).
// Месяцы с событиями выводятся из schedule_events; здесь — только те,
// что администратор добавил кнопкой «Новый месяц» до создания событий.
//   GET    /api/schedule-months        → ['2026-02', …] (явно добавленные месяцы)
//   POST   { month: '2026-02' }         → admin: добавить пустой месяц
//   DELETE ?month=2026-02               → admin: удалить пустой месяц
import { handlePreflight, readJson, requireAdmin, getSql, emptyList } from './_lib.js';

const isMonth = (m) => typeof m === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(m);

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'DELETE'])) return;
  const sql = await getSql();

  if (req.method === 'GET') {
    if (!sql) return emptyList(res);
    const rows = await sql`SELECT month FROM schedule_months ORDER BY month`;
    return res.status(200).json({ ok: true, data: rows.rows.map(r => r.month) });
  }

  if (!requireAdmin(req, res)) return;
  if (!sql) return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });

  if (req.method === 'DELETE') {
    const month = req.query && req.query.month;
    if (!isMonth(month)) return res.status(400).json({ ok: false, error: 'Нужен month в формате YYYY-MM' });
    await sql`DELETE FROM schedule_months WHERE month = ${month}`;
    return res.status(200).json({ ok: true });
  }

  // POST
  const b = readJson(req);
  if (!isMonth(b.month)) return res.status(422).json({ ok: false, errors: { month: 'Нужен month в формате YYYY-MM' } });
  await sql`INSERT INTO schedule_months (month) VALUES (${b.month}) ON CONFLICT (month) DO NOTHING`;
  return res.status(200).json({ ok: true, data: b.month });
}
