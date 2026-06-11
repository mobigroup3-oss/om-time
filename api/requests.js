// api/requests.js — заявки (воронка продаж). Содержат персональные данные,
// поэтому доступ только у персонала: админ ИЛИ авторизованный продажник (requireStaff).
// Создание заявок с сайта — api/booking.js.
//   GET    /api/requests              → список. Админ видит все; продажник — свои + свободные.
//                                        Фильтры: ?status=new, ?mine=1 (только мои), ?free=1 (без продажника)
//   POST   /api/requests              → добавить вручную
//   PUT    /api/requests              → обновить (статус, заметка, назначить продажника…)
//   DELETE /api/requests?id=…          → удалить (только админ)
import { handlePreflight, readJson, getSql, requireStaff, isAdmin } from './_lib.js';

// Лог обработки заявки (лента в карточке лида). Раньше был отдельным api/activities.js,
// слит сюда под ?resource=activities ради лимита Serverless-функций Vercel Hobby = 12.
const ACT_TYPES = ['call', 'whatsapp', 'meeting', 'note', 'status'];
function actToCanonical(r) {
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
// who — результат requireStaff (админ/продажник). Доступ как у самих заявок.
async function handleActivities(req, res, sql, who) {
  if (!sql) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, data: [] });
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }
  if (req.method === 'GET') {
    const requestId = req.query && req.query.requestId;
    if (!requestId) return res.status(400).json({ ok: false, error: 'Нужен requestId' });
    const rows = await sql`SELECT * FROM request_activities WHERE request_id = ${requestId} ORDER BY created_at ASC`;
    return res.status(200).json({ ok: true, data: rows.rows.map(actToCanonical) });
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
  const type = ACT_TYPES.includes(b.type) ? b.type : 'note';
  const text = String(b.text || '').trim();
  if (!text) return res.status(422).json({ ok: false, errors: { text: 'Пустая запись' } });
  const ins = await sql`
    INSERT INTO request_activities (request_id, seller_id, seller_name, type, text)
    VALUES (${requestId}, ${who.id}, ${who.name}, ${type}, ${text})
    RETURNING *`;
  return res.status(200).json({ ok: true, data: actToCanonical(ins.rows[0]) });
}

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
    assignedSellerId: r.assigned_seller_id || '',
    sellerName: r.seller_name || '',       // из JOIN ниже
    // Последняя запись истории работы — для предпросмотра в списке лидов.
    lastActivityText: r.last_act_text || '',
    lastActivityType: r.last_act_type || '',
    lastActivityAt: r.last_act_at || null,
    activityCount: Number(r.act_count) || 0,
    createdAt: r.created_at,
  };
}

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  const who = await requireStaff(req, res);
  if (!who) return;

  const sql = await getSql();

  // Лог обработки заявки — отдельная ветка (см. handleActivities выше).
  if (req.query && req.query.resource === 'activities') return handleActivities(req, res, sql, who);

  if (!sql) {
    if (req.method === 'GET') return res.status(200).json({ ok: true, data: [] });
    return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });
  }

  if (req.method === 'GET') {
    const q = req.query || {};
    const status = q.status || null;
    const mine = q.mine === '1' || q.mine === 'true';
    const free = q.free === '1' || q.free === 'true';
    // Продажник по умолчанию видит свои + свободные лиды. ?mine=1 сузит до своих.
    // Админ видит все; ?mine отдаёт назначенные ему (на практике не нужно), ?free — без продажника.
    const sellerScope = who.role === 'seller' && !mine;    // свои + свободные
    const onlyMine = mine ? who.id : null;

    const rows = await sql`
      SELECT r.*, s.name AS seller_name,
             la.text AS last_act_text, la.type AS last_act_type, la.created_at AS last_act_at,
             ac.cnt AS act_count
      FROM requests r
      LEFT JOIN sellers s ON s.id = r.assigned_seller_id
      LEFT JOIN LATERAL (
        SELECT text, type, created_at FROM request_activities a
        WHERE a.request_id = r.id ORDER BY a.created_at DESC LIMIT 1
      ) la ON true
      LEFT JOIN LATERAL (
        SELECT count(*)::int AS cnt FROM request_activities a WHERE a.request_id = r.id
      ) ac ON true
      WHERE (${status}::text IS NULL OR r.status = ${status})
        AND (${onlyMine}::text IS NULL OR r.assigned_seller_id = ${onlyMine})
        AND (NOT ${free} OR r.assigned_seller_id IS NULL)
        AND (NOT ${sellerScope} OR r.assigned_seller_id = ${who.id} OR r.assigned_seller_id IS NULL)
      ORDER BY r.created_at DESC`;
    return res.status(200).json({ ok: true, data: rows.rows.map(toCanonical) });
  }

  if (req.method === 'DELETE') {
    if (!isAdmin(req)) return res.status(403).json({ ok: false, error: 'Удалять заявки может только администратор' });
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM requests WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  const b = readJson(req);

  if (req.method === 'POST') {
    if (!b.name || !b.phone) return res.status(422).json({ ok: false, errors: { name: 'Имя и телефон обязательны' } });
    // Кто завёл заявку, тот её и ведёт (если продажник). Админ может назначить через assignedSellerId.
    const assigned = who.role === 'seller' ? who.id : (b.assignedSellerId || null);
    const ins = await sql`
      INSERT INTO requests
        (name, phone, email, city, format, comment, program_id, event_id, channel, status, code, note, assigned_seller_id, created_at)
      VALUES
        (${b.name}, ${b.phone}, ${b.email || null}, ${b.city || null}, ${b.format || null}, ${b.comment || null},
         ${b.programId || null}, ${b.eventId || null}, ${b.channel || 'call'}, ${b.status || 'new'}, ${b.code || null}, ${b.note || null},
         ${assigned}, ${b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString()})
      RETURNING *`;
    return res.status(200).json({ ok: true, data: toCanonical(ins.rows[0]) });
  }

  if (req.method === 'PUT') {
    if (!b.id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    // UPDATE ниже перезаписывает ВСЕ поля: частичный PUT без name/phone затёр бы их в NULL.
    if (!b.name || !b.phone) return res.status(422).json({ ok: false, errors: { name: 'Имя и телефон обязательны' } });
    const cur = await sql`SELECT assigned_seller_id FROM requests WHERE id = ${b.id} LIMIT 1`;
    if (!cur.rows.length) return res.status(404).json({ ok: false, error: 'Заявка не найдена' });
    const curSeller = cur.rows[0].assigned_seller_id;

    // Продажник может трогать только свой или свободный лид.
    if (who.role === 'seller' && curSeller && curSeller !== who.id) {
      return res.status(403).json({ ok: false, error: 'Лид ведёт другой продажник' });
    }

    // Назначение продажника:
    //   админ      — любому id или снять (null);
    //   продажник  — только взять свободный лид на себя (или оставить как есть).
    let assigned;
    if (who.role === 'admin') {
      assigned = b.assignedSellerId === undefined ? curSeller : (b.assignedSellerId || null);
    } else {
      // продажник: разрешаем «взять в работу» — назначить на себя, если был свободен
      assigned = b.assignedSellerId === who.id ? who.id : curSeller;
    }

    const upd = await sql`
      UPDATE requests SET
        name = ${b.name}, phone = ${b.phone}, email = ${b.email || null}, city = ${b.city || null},
        format = ${b.format || null}, comment = ${b.comment || null}, program_id = ${b.programId || null},
        event_id = ${b.eventId || null}, channel = ${b.channel || 'form'}, status = ${b.status || 'new'},
        note = ${b.note || null}, assigned_seller_id = ${assigned}
      WHERE id = ${b.id}
      RETURNING *`;
    return res.status(200).json({ ok: true, data: toCanonical(upd.rows[0]) });
  }
}
