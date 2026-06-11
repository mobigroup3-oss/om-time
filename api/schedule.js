// api/schedule.js — расписание событий (CRUD). См. api/programs.js — тот же контракт.
//   GET /api/schedule        → опубликованные (status=published)
//   GET /api/schedule?all=1   → все, включая черновики (admin)
//   POST/PUT/DELETE           → admin
import { handlePreflight, readJson, requireAdmin, getSql, emptyList, isAdmin } from './_lib.js';

function toCanonical(r) {
  return {
    id: r.id,
    month: r.month || '',
    monthLabel: r.month_label || '',
    category: r.category || '',
    format: r.format || '',
    title: r.title,
    dates: r.dates || '',
    time: r.time || '',
    duration: r.duration || '',
    trainer: r.trainer || '',
    location: r.location || '',
    formatLabel: r.format_label || '',
    tag: r.tag || '',
    tagClass: r.tag_class || '',
    price: r.price || '',
    priceNote: r.price_note || '',
    capacity: r.capacity == null ? null : r.capacity,
    capacityTotal: r.capacity_total == null ? null : r.capacity_total,
    featured: !!r.featured,
    isNew: !!r.is_new,
    status: r.status || 'draft',
  };
}

const genId = () => 'evt-' + Date.now();

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;
  const sql = await getSql();

  if (req.method === 'GET') {
    if (!sql) return emptyList(res);
    const wantAll = req.query && (req.query.all === '1' || req.query.all === 'true');
    const admin = wantAll && isAdmin(req);
    const rows = admin
      ? await sql`SELECT * FROM schedule_events ORDER BY month, id`
      : await sql`SELECT * FROM schedule_events WHERE status = 'published' ORDER BY month, id`;
    return res.status(200).json({ ok: true, data: rows.rows.map(toCanonical) });
  }

  if (!requireAdmin(req, res)) return;
  if (!sql) return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });

  if (req.method === 'DELETE') {
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM schedule_events WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  const b = readJson(req);
  const numOrNull = (x) => (x == null || x === '' ? null : Number(x));
  const v = {
    month: b.month || '',
    monthLabel: b.monthLabel || '',
    category: b.category || '',
    format: b.format || 'offline',
    title: String(b.title || '').trim(),
    dates: b.dates || '',
    time: b.time || '',
    duration: b.duration || '',
    trainer: b.trainer || '',
    location: b.location || '',
    formatLabel: b.formatLabel || '',
    tag: b.tag || '',
    tagClass: b.tagClass || '',
    price: b.price == null ? '' : String(b.price),
    priceNote: b.priceNote || '',
    capacity: numOrNull(b.capacity),
    capacityTotal: numOrNull(b.capacityTotal),
    featured: !!b.featured,
    isNew: !!b.isNew,
    status: b.status === 'published' ? 'published' : 'draft',
  };
  if (!v.title) return res.status(422).json({ ok: false, errors: { title: 'Укажите название' } });

  if (req.method === 'POST') {
    const id = b.id || genId();
    const ins = await sql`
      INSERT INTO schedule_events
        (id, month, month_label, category, format, title, dates, time, duration,
         trainer, location, format_label, tag, tag_class, price, price_note,
         capacity, capacity_total, featured, is_new, status)
      VALUES
        (${id}, ${v.month}, ${v.monthLabel}, ${v.category}, ${v.format}, ${v.title}, ${v.dates}, ${v.time}, ${v.duration},
         ${v.trainer}, ${v.location}, ${v.formatLabel}, ${v.tag}, ${v.tagClass}, ${v.price}, ${v.priceNote},
         ${v.capacity}, ${v.capacityTotal}, ${v.featured}, ${v.isNew}, ${v.status})
      RETURNING *`;
    return res.status(200).json({ ok: true, data: toCanonical(ins.rows[0]) });
  }

  if (req.method === 'PUT') {
    if (!b.id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    const upd = await sql`
      UPDATE schedule_events SET
        month = ${v.month}, month_label = ${v.monthLabel}, category = ${v.category}, format = ${v.format},
        title = ${v.title}, dates = ${v.dates}, time = ${v.time}, duration = ${v.duration},
        trainer = ${v.trainer}, location = ${v.location}, format_label = ${v.formatLabel},
        tag = ${v.tag}, tag_class = ${v.tagClass}, price = ${v.price}, price_note = ${v.priceNote},
        capacity = ${v.capacity}, capacity_total = ${v.capacityTotal},
        featured = ${v.featured}, is_new = ${v.isNew}, status = ${v.status}
      WHERE id = ${b.id}
      RETURNING *`;
    if (!upd.rows.length) return res.status(404).json({ ok: false, error: 'Событие не найдено' });
    return res.status(200).json({ ok: true, data: toCanonical(upd.rows[0]) });
  }
}
