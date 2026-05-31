// api/programs.js — каталог программ (CRUD). Serverless-функция Vercel (Node).
//   GET    /api/programs          → опубликованные (active=true)
//   GET    /api/programs?all=1    → все, включая неактивные (требует admin-токен)
//   POST   /api/programs          → создать (admin)
//   PUT    /api/programs          → обновить по id (admin)
//   DELETE /api/programs?id=…      → удалить (admin)
//
// Канонический JSON (camelCase) — общий язык между БД, витриной (ProgramsPage)
// и редактором (AdminProgramsEditor). Маппинг render-формы — на стороне витрины.
import { handlePreflight, readJson, requireAdmin, getSql, emptyList } from './_lib.js';

// DB-строка (snake_case) → канонический объект (camelCase).
function toCanonical(r) {
  return {
    id: r.id,
    title: r.title,
    format: r.format,
    formatLabel: r.format_label,
    weeks: r.weeks,
    price: r.price,
    pricePrefix: r.price_prefix || '',
    priceNote: r.price_note || '',
    descr: r.descr || '',
    category: r.category || '',
    tag: r.tag || '',
    tagClass: r.tag_class || '',
    includes: r.includes || [],
    dates: r.dates || '',
    trainer: r.trainer || '',
    capacityNote: r.capacity_note || '',
    featured: !!r.featured,
    showInHero: !!r.show_in_hero,
    active: r.active !== false,
    sortOrder: r.sort_order || 0,
  };
}

const genId = () => 'p' + Date.now();

export default async function handler(req, res) {
  if (handlePreflight(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) return;

  const sql = await getSql();

  // ── GET (открыт) ─────────────────────────────────────────
  if (req.method === 'GET') {
    if (!sql) return emptyList(res);
    const wantAll = req.query && (req.query.all === '1' || req.query.all === 'true');
    const isAdmin = wantAll && req.headers['x-admin-token'] === process.env.ADMIN_TOKEN;
    const rows = isAdmin
      ? await sql`SELECT * FROM programs ORDER BY sort_order, title`
      : await sql`SELECT * FROM programs WHERE active = true ORDER BY sort_order, title`;
    return res.status(200).json({ ok: true, data: rows.rows.map(toCanonical) });
  }

  // ── Запись (только admin) ────────────────────────────────
  if (!requireAdmin(req, res)) return;
  if (!sql) return res.status(503).json({ ok: false, error: 'База данных не настроена (POSTGRES_URL)' });

  if (req.method === 'DELETE') {
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    await sql`DELETE FROM programs WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  const b = readJson(req);
  const v = {
    title: String(b.title || '').trim(),
    format: b.format || 'offline',
    formatLabel: b.formatLabel || '',
    weeks: b.weeks == null || b.weeks === '' ? null : Number(b.weeks),
    price: b.price == null || b.price === '' ? null : Number(b.price),
    pricePrefix: b.pricePrefix || '',
    priceNote: b.priceNote || '',
    descr: b.descr || '',
    category: b.category || '',
    tag: b.tag || '',
    tagClass: b.tagClass || '',
    includes: Array.isArray(b.includes) ? b.includes : [],
    dates: b.dates || '',
    trainer: b.trainer || '',
    capacityNote: b.capacityNote || '',
    featured: !!b.featured,
    showInHero: !!b.showInHero,
    active: b.active !== false,
    sortOrder: b.sortOrder == null ? 0 : Number(b.sortOrder),
  };
  if (!v.title) return res.status(422).json({ ok: false, errors: { title: 'Укажите название' } });

  if (req.method === 'POST') {
    const id = b.id || genId();
    const ins = await sql`
      INSERT INTO programs
        (id, title, format, format_label, weeks, price, price_prefix, price_note, descr,
         category, tag, tag_class, includes, dates, trainer, capacity_note, featured, show_in_hero, active, sort_order)
      VALUES
        (${id}, ${v.title}, ${v.format}, ${v.formatLabel}, ${v.weeks}, ${v.price}, ${v.pricePrefix}, ${v.priceNote}, ${v.descr},
         ${v.category}, ${v.tag}, ${v.tagClass}, ${v.includes}, ${v.dates}, ${v.trainer}, ${v.capacityNote}, ${v.featured}, ${v.showInHero}, ${v.active}, ${v.sortOrder})
      RETURNING *`;
    return res.status(200).json({ ok: true, data: toCanonical(ins.rows[0]) });
  }

  if (req.method === 'PUT') {
    if (!b.id) return res.status(400).json({ ok: false, error: 'Нужен id' });
    const upd = await sql`
      UPDATE programs SET
        title = ${v.title}, format = ${v.format}, format_label = ${v.formatLabel},
        weeks = ${v.weeks}, price = ${v.price}, price_prefix = ${v.pricePrefix}, price_note = ${v.priceNote},
        descr = ${v.descr}, category = ${v.category}, tag = ${v.tag}, tag_class = ${v.tagClass},
        includes = ${v.includes}, dates = ${v.dates}, trainer = ${v.trainer},
        capacity_note = ${v.capacityNote}, featured = ${v.featured}, show_in_hero = ${v.showInHero}, active = ${v.active}, sort_order = ${v.sortOrder}
      WHERE id = ${b.id}
      RETURNING *`;
    if (!upd.rows.length) return res.status(404).json({ ok: false, error: 'Программа не найдена' });
    return res.status(200).json({ ok: true, data: toCanonical(upd.rows[0]) });
  }
}
