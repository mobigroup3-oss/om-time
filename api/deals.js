// api/deals.js — закрытые сделки. См. api/_lib.js → requireStaff (админ ИЛИ продажник).
//
//   GET    /api/deals                → список. Админ видит все, продажник — только свои.
//                                       Фильтры: ?seller=<id> (только админ), ?from=&to= (ISO даты по closed_at)
//   POST   /api/deals                → создать сделку. seller_id ставит СЕРВЕР из токена,
//                                       а не из тела (клиенту не доверяем). Админ может указать sellerId явно.
//   PUT    /api/deals                → обновить (статус won/refunded, сумма, заметка).
//                                       Продажник правит только свои сделки.
//   DELETE /api/deals?id=…            → удалить (только админ).
import { handlePreflight, readJson, getSql, requireStaff, isAdmin } from './_lib.js';

const PROGRAMS = ['flagship-offline', 'flagship-online', 'club', 'teen', 'detox', 'consult'];

function toCanonical(r) {
  return {
    id: r.id,
    requestId: r.request_id,
    sellerId: r.seller_id || '',
    sellerName: r.seller_name || '',      // приходит из JOIN ниже
    clientName: r.client_name,
    clientPhone: r.client_phone || '',
    programId: r.program_id || '',
    amount: r.amount || 0,
    status: r.status || 'won',
    note: r.note || '',
    createdAt: r.created_at,
    closedAt: r.closed_at,
  };
}

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  const who = await requireStaff(req, res);
  if (!who) return;

  const sql = await getSql();
  if (!sql) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, data: [] });
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }

  if (req.method === 'GET') {
    const q = req.query || {};
    const from = q.from ? new Date(q.from).toISOString() : null;
    const to   = q.to   ? new Date(q.to).toISOString()   : null;
    // Продажник всегда видит только свои сделки; админ — все либо фильтрует по ?seller.
    const sellerFilter = who.role === 'admin' ? (q.seller || null) : who.id;

    const rows = await sql`
      SELECT d.*, s.name AS seller_name
      FROM deals d
      LEFT JOIN sellers s ON s.id = d.seller_id
      WHERE (${sellerFilter}::text IS NULL OR d.seller_id = ${sellerFilter})
        AND (${from}::timestamptz IS NULL OR d.closed_at >= ${from})
        AND (${to}::timestamptz   IS NULL OR d.closed_at <= ${to})
      ORDER BY d.closed_at DESC`;
    return res.status(200).json({ ok: true, data: rows.rows.map(toCanonical) });
  }

  if (req.method === 'DELETE') {
    if (!isAdmin(req)) return res.status(403).json({ ok: false, error: 'Удалять сделки может только администратор' });
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM deals WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  const b = readJson(req);
  const v = {
    requestId: b.requestId == null || b.requestId === '' ? null : Number(b.requestId),
    clientName: String(b.clientName || '').trim(),
    clientPhone: b.clientPhone || '',
    programId: PROGRAMS.includes(b.programId) ? b.programId : null,
    amount: b.amount == null ? 0 : Math.max(0, Math.round(Number(b.amount) || 0)),
    status: b.status === 'refunded' ? 'refunded' : 'won',
    note: b.note || '',
  };

  if (req.method === 'POST') {
    if (!v.clientName) return res.status(422).json({ ok: false, errors: { clientName: 'Укажите имя клиента' } });
    // seller_id: продажник — это он сам; админ может закрыть сделку от имени продажника (b.sellerId) или без.
    const sellerId = who.role === 'admin' ? (b.sellerId || null) : who.id;
    const closedAt = b.closedAt ? new Date(b.closedAt).toISOString() : new Date().toISOString();
    const ins = await sql`
      INSERT INTO deals
        (request_id, seller_id, client_name, client_phone, program_id, amount, status, note, closed_at)
      VALUES
        (${v.requestId}, ${sellerId}, ${v.clientName}, ${v.clientPhone}, ${v.programId},
         ${v.amount}, ${v.status}, ${v.note}, ${closedAt})
      RETURNING *`;
    const row = ins.rows[0];
    // подтянем имя продажника для ответа
    if (row.seller_id) {
      const s = await sql`SELECT name FROM sellers WHERE id = ${row.seller_id} LIMIT 1`;
      row.seller_name = s.rows[0] && s.rows[0].name;
    }
    return res.status(200).json({ ok: true, data: toCanonical(row) });
  }

  if (req.method === 'PUT') {
    if (!b.id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    // Продажник может править только свою сделку.
    if (who.role !== 'admin') {
      const own = await sql`SELECT seller_id FROM deals WHERE id = ${b.id} LIMIT 1`;
      if (!own.rows.length) return res.status(404).json({ ok: false, error: 'Сделка не найдена' });
      if (own.rows[0].seller_id !== who.id) return res.status(403).json({ ok: false, error: 'Это не ваша сделка' });
    }
    const upd = await sql`
      UPDATE deals SET
        client_name = ${v.clientName}, client_phone = ${v.clientPhone}, program_id = ${v.programId},
        amount = ${v.amount}, status = ${v.status}, note = ${v.note}
      WHERE id = ${b.id}
      RETURNING *`;
    if (!upd.rows.length) return res.status(404).json({ ok: false, error: 'Сделка не найдена' });
    const row = upd.rows[0];
    if (row.seller_id) {
      const s = await sql`SELECT name FROM sellers WHERE id = ${row.seller_id} LIMIT 1`;
      row.seller_name = s.rows[0] && s.rows[0].name;
    }
    return res.status(200).json({ ok: true, data: toCanonical(row) });
  }
}
