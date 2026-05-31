// api/requests.js — заявки (admin). Содержат персональные данные, поэтому ВСЕ
// методы, включая GET, требуют admin-токен. Создание заявок с сайта — api/booking.js.
//   GET    /api/requests          → список (фильтр ?status=new)
//   POST   /api/requests          → добавить вручную
//   PUT    /api/requests          → обновить по id (статус, заметка, …)
//   DELETE /api/requests?id=…       → удалить
import { handlePreflight, readJson, requireAdmin, getSql } from './_lib.js';

function toCanonical(r) {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email || '',
    city: r.city || '',
    format: r.format || '',
    comment: r.comment || '',
    programId: r.program_id || '',
    eventId: r.event_id || '',
    channel: r.channel || 'form',
    status: r.status || 'new',
    code: r.code || '',
    note: r.note || '',
    createdAt: r.created_at,
  };
}

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  if (!requireAdmin(req, res)) return;

  const sql = await getSql();
  if (!sql) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, data: [] });
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }

  if (req.method === 'GET') {
    const status = req.query && req.query.status;
    const rows = status
      ? await sql`SELECT * FROM requests WHERE status = ${status} ORDER BY created_at DESC`
      : await sql`SELECT * FROM requests ORDER BY created_at DESC`;
    return res.status(200).json({ ok: true, data: rows.rows.map(toCanonical) });
  }

  if (req.method === 'DELETE') {
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM requests WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  const b = readJson(req);

  if (req.method === 'POST') {
    if (!b.name || !b.phone) return res.status(422).json({ ok: false, errors: { name: 'Имя и телефон обязательны' } });
    const ins = await sql`
      INSERT INTO requests
        (name, phone, email, city, format, comment, program_id, event_id, channel, status, code, note, created_at)
      VALUES
        (${b.name}, ${b.phone}, ${b.email || null}, ${b.city || null}, ${b.format || null}, ${b.comment || null},
         ${b.programId || null}, ${b.eventId || null}, ${b.channel || 'call'}, ${b.status || 'new'}, ${b.code || null}, ${b.note || null},
         ${b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString()})
      RETURNING *`;
    return res.status(200).json({ ok: true, data: toCanonical(ins.rows[0]) });
  }

  if (req.method === 'PUT') {
    if (!b.id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    const upd = await sql`
      UPDATE requests SET
        name = ${b.name}, phone = ${b.phone}, email = ${b.email || null}, city = ${b.city || null},
        format = ${b.format || null}, comment = ${b.comment || null}, program_id = ${b.programId || null},
        event_id = ${b.eventId || null}, channel = ${b.channel || 'form'}, status = ${b.status || 'new'}, note = ${b.note || null}
      WHERE id = ${b.id}
      RETURNING *`;
    if (!upd.rows.length) return res.status(404).json({ ok: false, error: 'Заявка не найдена' });
    return res.status(200).json({ ok: true, data: toCanonical(upd.rows[0]) });
  }
}
