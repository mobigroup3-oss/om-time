// api/activities.js — лог обработки заявки (лента в карточке лида).
// Доступ: персонал (админ ИЛИ продажник) — см. requireStaff.
//
//   GET    /api/activities?requestId=…   → лента по заявке (по возрастанию времени)
//   POST   /api/activities               → добавить запись (звонок/whatsapp/встреча/заметка/статус)
//                                          Автор (seller_id, seller_name) ставится сервером из токена.
//   DELETE /api/activities?id=…           → удалить запись (только админ)
import { handlePreflight, readJson, getSql, requireStaff, isAdmin } from './_lib.js';

const TYPES = ['call', 'whatsapp', 'meeting', 'note', 'status'];

function toCanonical(r) {
  return {
    id: r.id,
    requestId: r.request_id,
    sellerId: r.seller_id || '',
    sellerName: r.seller_name || '',
    type: r.type || 'note',
    text: r.text || '',
    createdAt: r.created_at,
  };
}

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'DELETE'])) return;
  const who = await requireStaff(req, res);
  if (!who) return;

  const sql = await getSql();
  if (!sql) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, data: [] });
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }

  if (req.method === 'GET') {
    const requestId = req.query && req.query.requestId;
    if (!requestId) return res.status(400).json({ ok: false, error: 'Нужен requestId' });
    const rows = await sql`
      SELECT * FROM request_activities
      WHERE request_id = ${requestId}
      ORDER BY created_at ASC`;
    return res.status(200).json({ ok: true, data: rows.rows.map(toCanonical) });
  }

  if (req.method === 'DELETE') {
    if (!isAdmin(req)) return res.status(403).json({ ok: false, error: 'Удалять записи может только администратор' });
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM request_activities WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  // POST
  const b = readJson(req);
  const requestId = b.requestId == null || b.requestId === '' ? null : Number(b.requestId);
  if (!requestId) return res.status(422).json({ ok: false, errors: { requestId: 'Нужен requestId' } });
  const type = TYPES.includes(b.type) ? b.type : 'note';
  const text = String(b.text || '').trim();
  if (!text) return res.status(422).json({ ok: false, errors: { text: 'Пустая запись' } });

  const ins = await sql`
    INSERT INTO request_activities (request_id, seller_id, seller_name, type, text)
    VALUES (${requestId}, ${who.id}, ${who.name}, ${type}, ${text})
    RETURNING *`;
  return res.status(200).json({ ok: true, data: toCanonical(ins.rows[0]) });
}
